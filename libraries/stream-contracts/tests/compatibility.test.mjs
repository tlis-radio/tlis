import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const directory = fileURLToPath(new URL("../", import.meta.url));
test("declarations support both videostream CommonJS/Node and CMS bundler consumers", () => {
  const temporary = mkdtempSync(path.join(tmpdir(), "tlis-contract-types-"));
  try {
    const installed = path.join(temporary, "node_modules/@tlis/stream-contracts");
    mkdirSync(installed, { recursive: true });
    cpSync(path.join(directory, "dist"), path.join(installed, "dist"), { recursive: true });
    cpSync(path.join(directory, "package.json"), path.join(installed, "package.json"));
    writeFileSync(path.join(temporary, "consumer.ts"), `
import type { StreamRecord, StreamStatus } from "@tlis/stream-contracts";
interface Episode { id: string | number; Title?: string }
interface PrivateStream extends StreamRecord<Episode | string | number | null> { stream_key: string }
interface WebsiteDto extends StreamRecord<Episode | string | number | null> { stream_key?: string }
const privateStream: PrivateStream = { id: 1, episode: null, status: "live", stream_key: "private" };
const website: WebsiteDto = privateStream;
const publicRecord: StreamRecord<null> = { id: "public", episode: null, status: "scheduled" };
const status: StreamStatus = website.status;
// @ts-expect-error - unrecognized lifecycle values must not enter the shared contract.
const invalidStatus: StreamStatus = "unknown";
// @ts-expect-error - the generic public lifecycle contract does not expose private keys.
publicRecord.stream_key;
// @ts-expect-error - video callers must continue supplying their required private key.
const missingKey: PrivateStream = publicRecord;
void [privateStream, website, status, invalidStatus, missingKey];
`);
    const compiler = path.join(directory, "node_modules/typescript/bin/tsc");
    for (const [module, resolution] of [["CommonJS", "Node"], ["ESNext", "Bundler"]]) {
      const result = spawnSync(process.execPath, [compiler, "--noEmit", "--strict", "--skipLibCheck",
        "--target", "ES2022", "--module", module,
        "--moduleResolution", resolution, "consumer.ts"], { cwd: temporary, encoding: "utf8", shell: false });
      assert.equal(result.status, 0, module + ": " + result.stdout + result.stderr);
    }
    assert.ok(readFileSync(path.join(installed, "dist/index.d.ts"), "utf8").includes("StreamRecord"));
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
