/** Status values already used by the TLIS website and video service. */
export const STREAM_STATUSES = Object.freeze([
  "scheduled", "idle", "live", "ended", "disabled",
] as const);

export type StreamStatus = typeof STREAM_STATUSES[number];

/** Provider-neutral lifecycle fields; each consumer owns its episode model. */
export interface StreamRecord<TEpisode> {
  id: string | number;
  status: StreamStatus;
  episode: TEpisode;
  archive_url?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}
