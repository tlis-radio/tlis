import { ChildProcess, spawn } from "node:child_process";

interface RelayProcess {
  streamId: string;
  process: ChildProcess;
}

export class LiveRelayManager {
  private readonly ffmpegPath: string;
  private readonly rtmpPort: number;
  private readonly appName: string;
  private readonly relays = new Map<string, RelayProcess>();

  constructor(ffmpegPath: string, rtmpPort: number, appName: string) {
    this.ffmpegPath = ffmpegPath;
    this.rtmpPort = rtmpPort;
    this.appName = appName;
  }

  isRelayId(name: string): boolean {
    return this.relays.has(name);
  }

  start(sourceKey: string, streamId: string): void {
    if (this.relays.has(streamId)) {
      return;
    }

    const inputUrl = `rtmp://127.0.0.1:${this.rtmpPort}/${this.appName}/${sourceKey}`;
    const outputUrl = `rtmp://127.0.0.1:${this.rtmpPort}/${this.appName}/${streamId}`;

    const args = [
      "-hide_banner",
      "-loglevel",
      "warning",
      "-i",
      inputUrl,
      "-c",
      "copy",
      "-f",
      "flv",
      outputUrl,
    ];

    const relay = spawn(this.ffmpegPath, args, { stdio: ["pipe", "pipe", "pipe"] });

    relay.stdout?.on("data", (chunk: Buffer) => {
      const message = chunk.toString().trim();
      if (message.length > 0) {
        console.log(`[Relay:${streamId}] ${message}`);
      }
    });

    relay.stderr?.on("data", (chunk: Buffer) => {
      const message = chunk.toString().trim();
      if (message.length > 0) {
        console.log(`[Relay:${streamId}] ${message}`);
      }
    });

    relay.on("close", (code, signal) => {
      console.log(`[Relay:${streamId}] exited code=${code ?? "null"} signal=${signal ?? "null"}`);
      this.relays.delete(streamId);
    });

    relay.on("error", (error) => {
      console.error(`[Relay:${streamId}] failed`, error);
      this.relays.delete(streamId);
    });

    this.relays.set(streamId, { streamId, process: relay });
    console.log(`[Relay:${streamId}] started ${outputUrl}`);
  }

  async stop(streamId: string): Promise<void> {
    const active = this.relays.get(streamId);
    if (!active) {
      return;
    }

    const relay = active.process;

    await new Promise<void>((resolve) => {
      let resolved = false;
      const finish = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      relay.once("close", finish);

      const timeout = setTimeout(() => {
        if (!relay.killed) {
          relay.kill("SIGKILL");
        }
        finish();
      }, 4000);
      timeout.unref();

      try {
        relay.stdin?.write("q\n");
        relay.stdin?.end();
      } catch {
        if (!relay.killed) {
          relay.kill("SIGTERM");
        }
      }
    });
  }
}
