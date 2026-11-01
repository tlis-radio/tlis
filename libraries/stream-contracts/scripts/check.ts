import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../", import.meta.url));
for (const task of ["typecheck", "build", "test", "vendor:check"]) {
  console.log("[stream-contracts] " + task);
  const result = spawnSync(process.execPath, ["--run", task], {
    cwd: directory, stdio: "inherit", shell: false,
  });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
