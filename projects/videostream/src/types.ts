import type { StreamRecord } from "@tlis/stream-contracts";

export type { StreamStatus } from "@tlis/stream-contracts";

export interface DirectusEpisode {
  id: string | number;
  Title?: string;
}

export interface DirectusStream extends StreamRecord<DirectusEpisode | string | number | null> {
  stream_key: string;
  last_error?: string | null;
}
