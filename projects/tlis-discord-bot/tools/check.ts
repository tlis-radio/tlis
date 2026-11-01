import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("..", import.meta.url));
for (const task of ["typecheck", "test", "build"] as const) {
  console.log("Checking tlis-discord-bot: " + task);
  const result = spawnSync(process.execPath, ["--run", task], {
    cwd: projectDirectory, stdio: "inherit", shell: false,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
