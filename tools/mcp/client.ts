import { Client, StreamableHTTPClientTransport, type CallToolResult, type Transport } from '@modelcontextprotocol/client';

export interface McpSession {
  call(name: string, input: Record<string, unknown>): Promise<CallToolResult>;
  list(): Promise<{ name: string; description?: string }[]>;
  close(): Promise<void>;
}

/** Connect only when the caller invokes this function; importing an API never opens a connection. */
export async function connectMcp(transport: Transport, allowedTools: readonly string[]): Promise<McpSession> {
  const client = new Client({ name: 'tlis-workflow-code', version: '0.1.0' });
  const allowed = new Set(allowedTools);
  try { await client.connect(transport); }
  catch { await client.close().catch(() => undefined); throw new Error('MCP connection failed'); }
  return {
    async call(name, input) {
      if (!allowed.has(name)) throw new Error(`Tool is not assigned to this session: ${name}`);
      const result = await client.callTool({ name, arguments: input }, { timeout: 30_000 });
      if (result.isError) throw new Error(`MCP tool failed: ${name}`);
      return result;
    },
    async list() {
      const result = await client.listTools();
      return result.tools.filter(tool => allowed.has(tool.name)).map(({ name, description }) => ({ name, description }));
    },
    close: () => client.close(),
  };
}

export interface HttpMcpOptions { url: string; allowedTools: readonly string[]; bearerToken?: string }

/** Remote HTTP transport. Credentials are caller-provided, never stored in source or generated artifacts. */
export async function connectHttpMcp(options: HttpMcpOptions): Promise<McpSession> {
  const url = new URL(options.url);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))) {
    throw new Error('MCP endpoint must use HTTPS (or loopback HTTP), without URL credentials');
  }
  const transport = new StreamableHTTPClientTransport(url,
    options.bearerToken ? { authProvider: { token: async () => options.bearerToken! } } : undefined);
  const session = await connectMcp(transport, options.allowedTools);
  return {
    ...session,
    async close() {
      try { await transport.terminateSession(); }
      finally { await session.close(); }
    },
  };
}

export interface Parser<T> { parse(value: unknown): T }

/** A capability wrapper exposes one typed function; composition/filtering happens in ordinary TypeScript. */
export function defineMcpTool<Input extends Record<string, unknown>, Output>(
  session: McpSession,
  definition: { name: string; input: Parser<Input>; output: Parser<Output> },
): (input: Input) => Promise<Output> {
  return async input => {
    const arguments_ = definition.input.parse(input);
    const result = await session.call(definition.name, arguments_);
    let payload: unknown = result.structuredContent;
    if (payload === undefined) {
      const blocks = result.content ?? [];
      if (blocks.length !== 1 || blocks[0].type !== 'text') throw new Error('Tool needs a structured or single JSON-text result');
      try { payload = JSON.parse(blocks[0].text); }
      catch { throw new Error('Tool result is not structured JSON'); }
    }
    return definition.output.parse(payload);
  };
}
