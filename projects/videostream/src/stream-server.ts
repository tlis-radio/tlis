import path from "node:path";
import NodeMediaServer from "node-media-server";
import { AppConfig } from "./config";
import { DirectusClient } from "./directus-client";
import { finalizeArchiveByStreamKeyAndId } from "./archive-service";
import { closeSession, getStreamId, NmsSessionEvent } from "./session-utils";
import { LiveRelayManager } from "./live-relay";

export async function startStreamServer(config: AppConfig): Promise<void> {
  const directus = new DirectusClient({
    directusUrl: config.directusUrl,
    directusToken: config.directusToken,
    streamsCollection: config.streamsCollection,
  });
  const finalizingKeys = new Set<string>();
  const relayManager = new LiveRelayManager(config.ffmpegPath, config.rtmpPort, config.streamApp);

  const nmsConfig = {
    bind: "0.0.0.0",
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
    static: {
      router: "/media",
      root: path.resolve(config.mediaRoot),
    },
    record: {
      path: path.resolve(config.mediaRoot),
    },
  };

  const nms = new NodeMediaServer(nmsConfig as any);

  nms.on("prePublish", async (session: NmsSessionEvent) => {
    if (session.streamApp !== config.streamApp) {
      closeSession(session);
      return;
    }

    const streamName = getStreamId(session);

    if (!streamName) {
      console.error("[Reject] Missing stream key in prePublish", {
        sessionId: session.id,
        streamPath: session.streamPath,
      });
      closeSession(session);
      return;
    }

    // Allow internally relayed id-based live streams without Directus key lookup.
    if (relayManager.isRelayId(streamName)) {
      return;
    }

    try {
      const stream = await directus.getStreamByKey(streamName);
      if (!stream) {
        console.log(`[Reject] Stream key not found or missing episode: ${streamName}`);
        closeSession(session);
        return;
      }

      await directus.markStreamLive(stream.id);
      console.log(`[Accepted] stream_id=${stream.id} status=live`);
    } catch (error) {
      console.error("[Reject] Directus validation failed", error);
      closeSession(session);
    }
  });

  nms.on("postPublish", async (session: NmsSessionEvent) => {
    if (session.streamApp !== config.streamApp) {
      return;
    }

    const streamKey = getStreamId(session);
    if (!streamKey) {
      return;
    }

    // Ignore secondary postPublish from internal relay stream ids.
    if (relayManager.isRelayId(streamKey)) {
      return;
    }

    try {
      const stream = await directus.getStreamByKey(streamKey);
      if (!stream) {
        return;
      }

      const streamId = String(stream.id);
      relayManager.start(streamKey, streamId);

      console.log(
        `[Live] stream_id=${stream.id} live_url=${config.mediaServerPublicUrl}/${config.streamApp}/${streamId}.flv`,
      );
    } catch (error) {
      console.error("[Live] Failed to resolve stream metadata", error);
    }
  });

  nms.on("donePublish", async (session: NmsSessionEvent) => {
    if (session.streamApp !== config.streamApp) {
      return;
    }

    const streamKey = getStreamId(session);
    if (!streamKey) {
      return;
    }

    if (finalizingKeys.has(streamKey)) {
      return;
    }

    finalizingKeys.add(streamKey);

    try {
      const stream = await directus.getStreamByKey(streamKey);
      if (!stream) {
        return;
      }

      const publicId = String(stream.id);
      await relayManager.stop(publicId);

      let archiveUrl: string | null = null;
      try {
        archiveUrl = await finalizeArchiveByStreamKeyAndId(config, streamKey, publicId);
      } catch (archiveError) {
        console.error("[Archive] conversion failed", archiveError);
      }

      await directus.markStreamEnded(stream.id, archiveUrl);
      console.log(`[Archive] stream_id=${stream.id} archive=${archiveUrl ?? "not_found"}`);
    } catch (error) {
      console.error("[Archive] finalize failed", error);
    } finally {
      finalizingKeys.delete(streamKey);
    }
  });

  nms.on("postPlay", (session: NmsSessionEvent) => {
    const streamPath = session.streamPath || "unknown";
    console.log(`[Play] start session=${session.id} path=${streamPath}`);
  });

  nms.on("donePlay", (session: NmsSessionEvent) => {
    const streamPath = session.streamPath || "unknown";
    console.log(`[Play] end session=${session.id} path=${streamPath}`);
  });

  nms.run();
  console.log(`RTMP ingest ready on rtmp://0.0.0.0:${config.rtmpPort}/${config.streamApp}`);
  console.log(`Live playback endpoint: ${config.mediaServerPublicUrl}/${config.streamApp}/<stream_id>.flv`);
  console.log(`Public archive endpoint: ${config.mediaServerPublicUrl}/media/archive/<stream_id>.mp4`);
}
