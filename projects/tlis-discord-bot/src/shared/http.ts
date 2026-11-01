import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
export interface HttpResult { status: number; body: unknown }
type Endpoint = () => HttpResult | Promise<HttpResult>;

/** Small explicit endpoint map, similar to ASP.NET Minimal API MapGet. */
export class HttpApp {
  private readonly gets = new Map<string, Endpoint>();
  mapGet(path: string, handler: Endpoint): void {
    if (this.gets.has(path)) throw new Error("Duplicate endpoint: " + path);
    this.gets.set(path, handler);
  }
  readonly handle = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    let result: HttpResult;
    try {
      const path = new URL(request.url ?? "/", "http://localhost").pathname;
      const handler = request.method === "GET" ? this.gets.get(path) : undefined;
      result = handler ? await handler() : { status: 404, body: { error: "Not found" } };
    } catch {
      result = { status: 500, body: { error: "Request failed" } };
    }
    response.writeHead(result.status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(result.body));
  };
  createServer() { return createServer((request, response) => { void this.handle(request, response); }); }
}
