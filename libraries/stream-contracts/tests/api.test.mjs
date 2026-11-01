import assert from "node:assert/strict";
import { test } from "node:test";
import { STREAM_STATUSES } from "../dist/index.js";

test("canonical lifecycle values match the existing website/video contract", () => {
  assert.deepEqual(STREAM_STATUSES, ["scheduled", "idle", "live", "ended", "disabled"]);
  assert.equal(new Set(STREAM_STATUSES).size, STREAM_STATUSES.length);
  assert.throws(() => STREAM_STATUSES.push("unexpected"), TypeError);
});
