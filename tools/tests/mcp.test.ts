import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryTransport } from '@modelcontextprotocol/client';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { connectMcp, connectHttpMcp, defineMcpTool } from '../mcp/client.ts';

test('real MCP transport exposes a validated typed API and blocks tools outside its workflow assignment', async () => {
  let reads = 0;
  let writes = 0;
  const server = new McpServer({ name: 'offline-fixture', version: '1.0.0' });
  server.registerTool('fixture_read', {
    description: 'Read a local test fixture', inputSchema: z.object({ id: z.string().min(1) }),
  }, async ({ id }) => {
    reads++;
    return { content: [], structuredContent: { id, status: 'ready' } };
  });
  server.registerTool('fixture_write', { description: 'Forbidden test capability' }, async () => {
    writes++;
    return { content: [{ type: 'text', text: '{}' }] };
  });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const session = await connectMcp(clientSide, ['fixture_read']);
  try {
    assert.deepEqual((await session.list()).map(tool => tool.name), ['fixture_read']);
    const read = defineMcpTool(session, {
      name: 'fixture_read', input: z.object({ id: z.string().min(1) }),
      output: z.object({ id: z.string(), status: z.literal('ready') }),
    });
    assert.deepEqual(await read({ id: '123' }), { id: '123', status: 'ready' });
    await assert.rejects(read({ id: '' }));
    await assert.rejects(session.call('fixture_write', {}), /not assigned/);
    assert.equal(reads, 1); assert.equal(writes, 0);
  } finally { await session.close(); await server.close(); }
});

test('typed wrappers validate tool output and reject error/invalid text results', async () => {
  const parser = z.object({ value: z.number() });
  const base = { list: async () => [], close: async () => undefined };
  const invalid = defineMcpTool({ ...base, call: async () => ({ content: [], structuredContent: { value: 'wrong' } }) },
    { name: 'fixture', input: z.object({}), output: parser });
  await assert.rejects(invalid({}));
  const text = defineMcpTool({ ...base, call: async () => ({ content: [{ type: 'text', text: '{"value":7}' }] }) },
    { name: 'fixture', input: z.object({}), output: parser });
  assert.deepEqual(await text({}), { value: 7 });
  const malformed = defineMcpTool({ ...base, call: async () => ({ content: [{ type: 'text', text: 'not-json' }] }) },
    { name: 'fixture', input: z.object({}), output: parser });
  await assert.rejects(malformed({}), /not structured JSON/);
});

test('remote connection rejects insecure endpoints before initiating a connection', async () => {
  for (const url of ['http://remote.example/mcp', 'https://name:password@example.invalid/mcp', 'file:///tmp/mcp']) {
    await assert.rejects(connectHttpMcp({ url, allowedTools: [] }), /must use HTTPS/);
  }
});
