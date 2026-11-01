import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));

export function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function slug(value: string): string {
  requireThat(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80,
    `Invalid name '${value}': use lowercase letters, digits, and single hyphens (max 80 characters)`);
  return value;
}

export function within(root: string, relative: string): string {
  requireThat(!path.isAbsolute(relative), 'Expected a relative path');
  const result = path.resolve(root, relative);
  requireThat(result.startsWith(path.resolve(root) + path.sep), 'Path must stay inside its workspace');
  return result;
}

export function existingWithin(root: string, relative: string): string {
  const result = realpathSync(within(root, relative));
  requireThat(result.startsWith(realpathSync(root) + path.sep), 'Symlink points outside its workspace');
  return result;
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

export function git(root: string, args: string[]): Buffer {
  const result = spawnSync('git', args, { cwd: root, encoding: 'buffer', maxBuffer: 32 * 1024 * 1024 });
  if (result.error) throw result.error;
  requireThat(result.status === 0, `git ${args[0]} failed: ${result.stderr.toString().trim()}`);
  return result.stdout;
}

export function commit(root: string, ref: string): string {
  return git(root, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).toString().trim();
}

export function runCommand(cwd: string, command: string, args: string[]): void {
  let executable = command === 'node' ? process.execPath : command;
  let arguments_ = args;
  if (command === 'npm') {
    const base = path.dirname(process.execPath);
    const npm = [process.env.npm_execpath, path.resolve(base, '../lib/node_modules/npm/bin/npm-cli.js'),
      path.resolve(base, 'node_modules/npm/bin/npm-cli.js')].find(file => file && existsSync(file));
    requireThat(npm, 'Cannot locate npm; run through npm run repo or install npm beside Node');
    executable = process.execPath; arguments_ = [npm, ...args];
  }
  const result = spawnSync(executable, arguments_,
    { cwd, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  requireThat(result.status === 0, `${command} exited with ${result.status ?? result.signal}`);
}
