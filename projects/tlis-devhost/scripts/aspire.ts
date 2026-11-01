import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [command, ...args] = process.argv.slice(2);
if (!command || !['restore', 'run', 'stop'].includes(command)) {
  throw new Error('Usage: node scripts/aspire.ts <restore|run|stop> [Aspire options]');
}
const executable = process.env.ASPIRE_CLI_PATH?.trim() || 'aspire';
const child = spawn(executable, [command, '--apphost', 'apphost.mts', '--non-interactive', ...args], {
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  env: process.env,
  stdio: 'inherit',
  shell: false,
});
child.once('error', () => {
  console.error('Aspire CLI could not start. Install Aspire 13.6.0 or set ASPIRE_CLI_PATH to its executable.');
  process.exitCode = 1;
});
child.once('exit', (code) => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => child.kill(signal));
