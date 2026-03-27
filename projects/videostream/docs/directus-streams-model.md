# Directus Data Model: Streams Linked to Episodes

This service expects a Directus collection named `streams` and a relation to your existing `Episodes` collection.

## 1. Collection: streams

Create collection `streams` with these fields:

- `id` (uuid or integer, primary key)
- `stream_key` (string, unique, required)
- `status` (string, required)
  - allowed values: `scheduled`, `idle`, `live`, `ended`, `disabled`
- `episode` (many-to-one relation to `Episodes.id`, required)
- `archive_url` (string, nullable)
- `started_at` (datetime, nullable)
- `ended_at` (datetime, nullable)
- `last_error` (text, nullable)

## 2. Required relation

Configure relation:

- `streams.episode` -> `Episodes.id`
- relation type: many-to-one (many streams can reference one episode)

This project rejects any incoming stream key that is not linked to an episode.

## 3. Recommended indexes and constraints

- unique index on `stream_key`
- index on `status`
- index on `episode`

## 4. Permission guidance

For the token used by this service (`DIRECTUS_TOKEN`), grant:

- `read` on `streams`
- `update` on `streams`
- `read` on `Episodes` (if needed by your policies)

Field-level update permission needed for:

- `status`
- `archive_url`
- `started_at`
- `ended_at`
- `last_error`

## 5. Validation behavior in code

On `prePublish`:

- service reads `streams` by `stream_key`
- it requires `episode` to be non-null
- if missing, stream is rejected
- if found and not already `live`, status is updated to `live`

On `donePublish`:

- service finds same stream by `stream_key`
- updates status to `ended`
- writes `archive_url` when MP4 output is found
