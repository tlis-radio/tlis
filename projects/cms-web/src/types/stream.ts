import { Episode } from "@/models/episode";
import type { StreamRecord } from "@tlis/stream-contracts";

export type { StreamStatus } from "@tlis/stream-contracts";

export type StreamEpisode = Episode | string | number | null;

export interface DirectusStreamDto extends StreamRecord<StreamEpisode> {
  stream_key?: string;
  last_error?: string | null;
}

export interface PublicStreamEntry extends StreamRecord<StreamEpisode> {}
