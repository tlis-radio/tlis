import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { AppConfig } from "./config";

interface MediaFileInfo {
  fullPath: string;
  fileName: string;
  modifiedMs: number;
  size: number;
}

async function getFilesByExtension(directory: string, extension: string): Promise<MediaFileInfo[]> {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const matches = entries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(extension.toLowerCase()),
  );

  if (matches.length === 0) {
    return [];
  }

  const files = await Promise.all(
    matches.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      const stats = await fs.stat(fullPath);
      return {
        fullPath,
        fileName: entry.name,
        modifiedMs: stats.mtimeMs,
        size: stats.size,
      } satisfies MediaFileInfo;
    }),
  );

  files.sort((a, b) => b.modifiedMs - a.modifiedMs);
  return files;
}

async function waitForFileStable(filePath: string, checks: number, intervalMs: number): Promise<void> {
  let previousSize = -1;

  for (let i = 0; i < checks; i += 1) {
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), intervalMs);
      timeout.unref();
    });

    try {
      const stats = await fs.stat(filePath);
      if (stats.size > 0 && stats.size === previousSize) {
        return;
      }
      previousSize = stats.size;
    } catch {
      // keep waiting until checks are exhausted
    }
  }
}

function runFfmpeg(ffmpegPath: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    process.stdout?.on("data", (chunk: Buffer) => {
      const msg = chunk.toString().trim();
      if (msg) {
        console.log(`[Archive] ${msg}`);
      }
    });

    process.stderr?.on("data", (chunk: Buffer) => {
      const msg = chunk.toString().trim();
      if (msg) {
        console.log(`[Archive] ${msg}`);
      }
    });

    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

async function transcodeFlvToMp4(ffmpegPath: string, inputPath: string, outputPath: string): Promise<void> {
  const copyArgs = [
    "-hide_banner",
    "-loglevel",
    "warning",
    "-y",
    "-i",
    inputPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  try {
    await runFfmpeg(ffmpegPath, copyArgs);
    return;
  } catch {
    const fallbackArgs = [
      "-hide_banner",
      "-loglevel",
      "warning",
      "-y",
      "-i",
      inputPath,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputPath,
    ];

    await runFfmpeg(ffmpegPath, fallbackArgs);
  }
}

export async function finalizeArchiveByStreamKeyAndId(
  config: AppConfig,
  streamKey: string,
  streamId: string,
): Promise<string | null> {
  const sourceDirectory = path.join(config.mediaRoot, config.streamApp, streamKey);
  const flvFiles = await getFilesByExtension(sourceDirectory, ".flv");
  const candidates = flvFiles.filter((file) => file.size > 1024);

  if (candidates.length === 0) {
    return null;
  }

  const archiveDirectory = path.join(config.mediaRoot, "archive");
  await fs.mkdir(archiveDirectory, { recursive: true });

  const outputName = `${streamId}.mp4`;
  const outputPath = path.join(archiveDirectory, outputName);

  for (const candidate of candidates) {
    try {
      await waitForFileStable(candidate.fullPath, 8, 250);
      await transcodeFlvToMp4(config.ffmpegPath, candidate.fullPath, outputPath);
      return `${config.mediaServerPublicUrl}/media/archive/${encodeURIComponent(outputName)}`;
    } catch (error) {
      console.log(`[Archive] Candidate failed: ${candidate.fullPath}`);
      console.log(error);
    }
  }

  return null;
}
