import dotenv from "dotenv";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import NodeMediaServer from "node-media-server";
import { DirectusClient } from "./directus-client";

dotenv.config();

interface AppConfig {
  directusUrl: string;
  directusToken: string;
  streamsCollection: string;
  mediaServerPublicUrl: string;
  mediaRoot: string;
  streamApp: string;
  rtmpPort: number;
  httpMediaPort: number;
  apiPort: number;
  ffmpegPath: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function loadConfig(): AppConfig {
  return {
    directusUrl: requireEnv("DIRECTUS_URL"),
    directusToken: requireEnv("DIRECTUS_TOKEN"),
    streamsCollection: process.env.STREAMS_COLLECTION || "streams",
    mediaServerPublicUrl: requireEnv("MEDIA_SERVER_PUBLIC_URL").replace(/\/$/, ""),
    mediaRoot: process.env.MEDIA_ROOT || "./media",
    streamApp: process.env.STREAM_APP || "live",
    rtmpPort: parsePort(process.env.RTMP_PORT, 1935),
    httpMediaPort: parsePort(process.env.HTTP_MEDIA_PORT, 8000),
    apiPort: parsePort(process.env.API_PORT, 3001),
    ffmpegPath: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
  };
}

async function resolveLatestArchiveUrl(config: AppConfig, streamKey: string): Promise<string | null> {
  const archiveFolder = path.resolve(config.mediaRoot, config.streamApp, streamKey);

  try {
    const entries = await fs.readdir(archiveFolder, { withFileTypes: true });
    const mp4Files = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp4"));

    if (mp4Files.length === 0) {
      return null;
    }

    const fileStats = await Promise.all(
      mp4Files.map(async (file) => {
        const fullPath = path.join(archiveFolder, file.name);
        const stats = await fs.stat(fullPath);
        return { fileName: file.name, modifiedMs: stats.mtimeMs };
      }),
    );

    fileStats.sort((a, b) => b.modifiedMs - a.modifiedMs);
    return `${config.mediaServerPublicUrl}/${config.streamApp}/${streamKey}/${encodeURIComponent(fileStats[0].fileName)}`;
  } catch {
    return null;
  }
}

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const directus = new DirectusClient({
    directusUrl: config.directusUrl,
    directusToken: config.directusToken,
    streamsCollection: config.streamsCollection,
  });

  const nmsConfig = {
    rtmp: {
      port: config.rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: config.httpMediaPort,
      mediaroot: config.mediaRoot,
      allow_origin: "*",
    },
    trans: {
      ffmpeg: config.ffmpegPath,
      tasks: [
        {
          app: config.streamApp,
          mp4: true,
          mp4Flags: "[movflags=faststart]",
        },
      ],
    },
  };

  const nms = new NodeMediaServer(nmsConfig as any);

  nms.on("prePublish", async (id: string, streamPath: string) => {
    const streamKey = streamPath.split("/")[2];
    const session = nms.getSession(id);

    if (!streamKey || !session) {
      return;
    }

    try {
      const stream = await directus.getStreamByKey(streamKey);

      // Stream key must exist in Directus and be linked to an episode.
      if (!stream) {
        console.log(`[Reject] Unknown stream key or missing episode link: ${streamKey}`);
        session.reject();
        return;
      }

      if (stream.status === "live") {
        console.log(`[Reject] Stream already live for key: ${streamKey}`);
        session.reject();
        return;
      }

      await directus.markStreamLive(stream.id);
      console.log(`[Accepted] Stream ${stream.id} is now live.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Directus error";
      console.error("Error authenticating stream against Directus", error);
      session.reject();

      const stream = await directus.getStreamByKey(streamKey).catch(() => null);
      if (stream) {
        await directus.markStreamError(stream.id, errorMessage).catch(() => undefined);
      }
    }
  });

  nms.on("donePublish", async (_id: string, streamPath: string) => {
    const streamKey = streamPath.split("/")[2];

    if (!streamKey) {
      return;
    }

    try {
      const stream = await directus.getStreamByKey(streamKey);
      if (!stream) {
        return;
      }

      const archiveUrl = await resolveLatestArchiveUrl(config, streamKey);
      await directus.markStreamEnded(stream.id, archiveUrl);
      console.log(`[Ended] Stream ${stream.id} ended. Archive: ${archiveUrl ?? "not found"}`);
    } catch (error) {
      console.error("Error updating Directus after stream ended", error);
    }
  });

  const app = express();
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.listen(config.apiPort, () => {
    console.log(`Health API listening on port ${config.apiPort}`);
  });

  nms.run();
  console.log(`RTMP ingest ready on rtmp://0.0.0.0:${config.rtmpPort}/${config.streamApp}`);
  console.log(`Media HTTP ready on http://0.0.0.0:${config.httpMediaPort}/${config.streamApp}`);
}

bootstrap().catch((error) => {
  console.error("Fatal startup error", error);
  process.exit(1);
});
