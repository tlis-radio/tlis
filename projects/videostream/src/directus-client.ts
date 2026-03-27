import {
  createDirectus,
  readItems,
  rest,
  RestClient,
  staticToken,
  updateItem,
} from "@directus/sdk";
import { DirectusStream } from "./types";

interface DirectusClientOptions {
  directusUrl: string;
  directusToken: string;
  streamsCollection: string;
}

export class DirectusClient {
  private readonly api: RestClient<any>;
  private readonly streamsCollection: string;

  constructor(options: DirectusClientOptions) {
    this.api = createDirectus(options.directusUrl)
      .with(staticToken(options.directusToken))
      .with(rest({ onRequest: (request) => ({ ...request, cache: "no-store" }) }));

    this.streamsCollection = options.streamsCollection;
  }

  async getStreamByKey(streamKey: string): Promise<DirectusStream | null> {
    const streams = await this.api.request<Array<DirectusStream>>(
      readItems(this.streamsCollection, {
        filter: {
          stream_key: { _eq: streamKey },
          episode: { _nnull: true },
        },
        limit: 1,
        fields: [
          "id",
          "stream_key",
          "status",
          "episode",
          "archive_url",
          "started_at",
          "ended_at",
          "last_error",
        ],
      }),
    );

    return streams[0] ?? null;
  }

  async markStreamLive(streamId: string | number): Promise<void> {
    await this.api.request(
      updateItem(this.streamsCollection, streamId, {
        status: "live",
        started_at: new Date().toISOString(),
        ended_at: null,
        last_error: null,
      }),
    );
  }

  async markStreamEnded(
    streamId: string | number,
    archiveUrl: string | null,
  ): Promise<void> {
    await this.api.request(
      updateItem(this.streamsCollection, streamId, {
        status: "ended",
        ended_at: new Date().toISOString(),
        archive_url: archiveUrl,
      }),
    );
  }
}
