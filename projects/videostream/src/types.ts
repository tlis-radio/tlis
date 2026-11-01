export type StreamStatus = "scheduled" | "idle" | "live" | "ended" | "disabled";

export interface DirectusEpisode {
  id: string | number;
  Title?: string;
}

export interface DirectusStream {
  id: string | number;
  stream_key: string;
  status: StreamStatus;
  episode: DirectusEpisode | string | number | null;
  archive_url?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  last_error?: string | null;
}
