import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../", import.meta.url));
const repository = path.resolve(directory, "../..");
interface Consumer { name: string; path: string; installFlags: string[] }

function readJson(file: string): any { return JSON.parse(readFileSync(file, "utf8")); }
function run(command: string, args: string[], cwd: string, capture = false): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: false,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command + " failed with exit " + result.status);
  return capture ? result.stdout : "";
}

/** Resolve npm's JS entrypoint so child execution also works without a .cmd shell. */
export function npmCli(): string {
  const executableDirectory = path.dirname(process.execPath);
  const candidates = [process.env.npm_execpath,
    path.resolve(executableDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
    path.resolve(executableDirectory, "node_modules/npm/bin/npm-cli.js")];
  const found = candidates.find((candidate): candidate is string => !!candidate && existsSync(candidate));
  if (!found) throw new Error("Cannot locate npm's JavaScript entrypoint; run this through npm run vendor:check or vendor:sync");
  return found;
}

export function synchronize(mode: "--check" | "--write"): void {
  const metadata = readJson(path.join(directory, "package.json"));
  const consumers: Consumer[] = readJson(path.join(directory, "_config/consumers.json")).consumers;
  const npm = npmCli();
  const temporary = mkdtempSync(path.join(tmpdir(), "tlis-contracts-pack-"));
  try {
    run(process.execPath, ["--run", "build"], directory);
    const packed = JSON.parse(run(process.execPath,
      [npm, "pack", "--json", "--ignore-scripts", "--pack-destination", temporary], directory, true));
    if (packed.length !== 1 || typeof packed[0].filename !== "string") throw new Error("Expected one packed library");
    const filename: string = packed[0].filename;
    if (path.basename(filename) !== filename) throw new Error("Invalid archive filename");
    const canonical = readFileSync(path.join(temporary, filename));
    const integrity = "sha512-" + createHash("sha512").update(canonical).digest("base64");
    for (const consumer of consumers) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(consumer.name) || consumer.path !== "projects/" + consumer.name ||
          !Array.isArray(consumer.installFlags) || consumer.installFlags.some(flag => flag !== "--legacy-peer-deps")) {
        throw new Error("Invalid library consumer configuration");
      }
      const consumerDirectory = path.join(repository, consumer.path);
      const archive = path.join(consumerDirectory, "vendor", filename);
      const specifier = "file:vendor/" + filename;
      if (mode === "--write") {
        mkdirSync(path.dirname(archive), { recursive: true });
        copyFileSync(path.join(temporary, filename), archive);
        run(process.execPath, [npm, "install", "./vendor/" + filename,
          "--save-exact", "--package-lock-only", "--ignore-scripts", "--offline", ...consumer.installFlags], consumerDirectory);
      }
      if (!existsSync(archive) || !readFileSync(archive).equals(canonical)) {
        throw new Error(consumer.name + ": vendor archive differs from canonical source; run npm run vendor:sync");
      }
      const consumerPackage = readJson(path.join(consumerDirectory, "package.json"));
      const lock = readJson(path.join(consumerDirectory, "package-lock.json"));
      const entry = lock.packages?.["node_modules/" + metadata.name];
      if (consumerPackage.dependencies?.[metadata.name] !== specifier ||
          lock.packages?.[""]?.dependencies?.[metadata.name] !== specifier ||
          entry?.version !== metadata.version || entry?.resolved !== specifier || entry?.integrity !== integrity) {
        throw new Error(consumer.name + ": package declaration or lockfile does not match the library archive");
      }
      console.log("PASS " + consumer.name + ": " + metadata.name + "@" + metadata.version + " matches canonical source and lock integrity");
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] ?? "--check";
  if (process.argv.length > 3 || !["--check", "--write"].includes(mode)) {
    console.error("Usage: node scripts/sync-consumers.ts [--check|--write]");
    process.exitCode = 1;
  } else {
    try { synchronize(mode as "--check" | "--write"); }
    catch (error) { console.error(error instanceof Error ? error.message : "Library synchronization failed"); process.exitCode = 1; }
  }
}
