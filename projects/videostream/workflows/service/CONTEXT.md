# Video streaming and archive: service workflow

Use the stages relevant to the requested validation or operation. A feature's scope and implementation plan use the shared change workflow instead of duplicating it here.

| Stage | Job | Output |
| --- | --- | --- |
| `stages/01_inspect/` | Identify revision, configuration, and service boundary | `output/<run-id>/inspection.md` |
| `stages/02_validate/` | Check locally and record runtime gaps | `output/<run-id>/validation.md` |
| `stages/03_operate/` | Perform a requested operation or prepare its handoff | `output/<run-id>/operation.md` |

Initialize a local service run from the repository root:

```sh
node tools/src/cli.ts workflow init --workflow service --project videostream --run <run-id>
```

Paths in stage contracts are repository-relative. Use one run ID through handoffs. Create its output directory when first writing evidence; saved output may be edited before the next stage.

Project boundary: Directus stream records, public IDs, and media storage. Use the video production workflow on main, preserving the video-stream image name and existing GET deployment method. Keep media volumes across checkout changes. RTMP uses 1935 and public media defaults to host port 8000, which can collide with Icecast.
