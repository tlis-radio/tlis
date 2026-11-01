# API

## `StreamStatus`

The existing lifecycle union:

```ts
type StreamStatus = "scheduled" | "idle" | "live" | "ended" | "disabled";
```

`STREAM_STATUSES` exports the same values as a frozen, readonly tuple. It provides the canonical vocabulary; it does not validate or transform an API response.

## `StreamRecord<TEpisode>`

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string \| number` | Existing Directus stream identifier |
| `status` | `StreamStatus` | Existing lifecycle value |
| `episode` | `TEpisode` | Consumer-supplied relation representation |
| `archive_url` | optional `string \| null` | Existing archive location |
| `started_at` | optional `string \| null` | Existing serialized start timestamp |
| `ended_at` | optional `string \| null` | Existing serialized end timestamp |

No conversion, date parsing, defaulting, or runtime validation occurs. Applications retain their existing wire representations.

`stream_key` and `last_error` are intentionally absent from the shared record. The video service's private `DirectusStream` still requires `stream_key`. The website's `DirectusStreamDto` keeps an optional key, while `PublicStreamEntry` has no declared key field. TypeScript's structural typing is not a redaction mechanism: applications must continue selecting public fields before returning data.
