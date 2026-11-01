import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
if (!existsSync(new URL('../.aspire/modules/aspire.mts', import.meta.url))) {
  throw new Error('Generated Aspire SDK is missing. Run npm ci and npm run restore in projects/tlis-devhost first.');
}
for (const args of [
  ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.apphost.json', '--noEmit'],
  ['--test', 'tests/topology.test.ts'],
]) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
