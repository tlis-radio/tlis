declare module "node-media-server" {
  interface NmsSession {
    reject(): void;
  }

  type NmsEventHandler = (id: string, streamPath: string, args?: Record<string, string>) => void | Promise<void>;

  export default class NodeMediaServer {
    constructor(config: unknown);
    on(eventName: "prePublish" | "donePublish", handler: NmsEventHandler): void;
    getSession(id: string): NmsSession | null;
    run(): void;
  }
}
