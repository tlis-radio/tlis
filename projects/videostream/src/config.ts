import path from "node:path";

export interface AppConfig {
  directusUrl: string;
  directusToken: string;
  streamsCollection: string;
  mediaServerPublicUrl: string;
  mediaRoot: string;
  streamApp: string;
  rtmpPort: number;
  httpMediaPort: number;
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

export function loadConfig(): AppConfig {
  return {
    directusUrl: requireEnv("DIRECTUS_URL"),
    directusToken: requireEnv("DIRECTUS_TOKEN"),
    streamsCollection: process.env.STREAMS_COLLECTION || "streams",
    mediaServerPublicUrl: requireEnv("MEDIA_SERVER_PUBLIC_URL").replace(/\/$/, ""),
    mediaRoot: path.resolve(process.env.MEDIA_ROOT || "./media"),
    streamApp: process.env.STREAM_APP || "live",
    rtmpPort: parsePort(process.env.RTMP_PORT, 1935),
    httpMediaPort: parsePort(process.env.HTTP_MEDIA_PORT, 8000),
    ffmpegPath: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
  };
}
