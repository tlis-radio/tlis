declare module "node-media-server" {
  interface NmsSession {
    id: string;
    streamPath?: string;
    streamName?: string;
    streamApp?: string;
    close(): void;
  }

  type NmsEventHandler = (session: NmsSession) => void | Promise<void>;

  export default class NodeMediaServer {
    constructor(config: unknown);
    on(
      eventName:
        | "prePublish"
        | "postPublish"
        | "donePublish"
        | "prePlay"
        | "postPlay"
        | "donePlay",
      handler: NmsEventHandler,
    ): void;
    run(): void;
  }
}
