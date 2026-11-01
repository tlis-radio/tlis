import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export type DeploymentTarget = 'cms-web-dev' | 'cms-web-prod' | 'videostream-prod';

export interface TargetConfig {
  project: 'cms-web' | 'videostream';
  branch: 'main' | 'dev';
  image: string;
  method: 'GET' | 'POST';
  deploymentIdVariable: 'DEV_DEPLOY_ID' | 'PROD_DEPLOY_ID';
  buildVariables: ReadonlyArray<readonly [string, string]>;
}

const targets: Record<DeploymentTarget, TargetConfig> = {
  'cms-web-dev': {
    project: 'cms-web',
    branch: 'dev',
    image: 'tlis-web-dev',
    method: 'POST',
    deploymentIdVariable: 'DEV_DEPLOY_ID',
    buildVariables: [['NEXT_PUBLIC_DIRECTUS_URL', 'DIRECTUS_URL']],
  },
  'cms-web-prod': {
    project: 'cms-web',
    branch: 'main',
    image: 'tlis-web',
    method: 'POST',
    deploymentIdVariable: 'PROD_DEPLOY_ID',
    buildVariables: [
      ['NEXT_PUBLIC_DIRECTUS_URL', 'DIRECTUS_URL'],
      ['NEXT_PUBLIC_ANALYTICS_ID', 'ANALYTICS_ID'],
      ['NEXT_PUBLIC_ANALYTICS_URL', 'ANALYTICS_URL'],
      ['NEXT_PUBLIC_SITE_URL', 'SITE_URL'],
    ],
  },
  'videostream-prod': {
    project: 'videostream',
    branch: 'main',
    image: 'video-stream',
    method: 'GET',
    deploymentIdVariable: 'PROD_DEPLOY_ID',
    buildVariables: [],
  },
};

export function targetConfig(target: string): TargetConfig {
  if (!Object.hasOwn(targets, target)) {
    throw new Error('Unknown deployment target. Choose cms-web-dev, cms-web-prod, or videostream-prod.');
  }
  return targets[target as DeploymentTarget];
}

export function assertDeploymentBranch(config: TargetConfig, ref: string | undefined): void {
  if (ref !== `refs/heads/${config.branch}`) {
    throw new Error(`Deployment requires branch ${config.branch}; select that branch when running the workflow.`);
  }
}

export function requiredValue(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment setting: ${name}`);
  return value;
}

export function deploymentUrl(base: string, deploymentId: string): URL {
  const url = new URL(base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('DEPLOY_URL must be an HTTP(S) URL without embedded credentials.');
  }
  if (!deploymentId.trim() || /[\r\n]/u.test(deploymentId)) {
    throw new Error('Deployment identifier must be a nonempty single-line value.');
  }
  url.searchParams.set('uuid', deploymentId);
  url.searchParams.set('force', 'false');
  return url;
}

export function imageName(config: TargetConfig, owner: string): string {
  const normalized = owner.toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/u.test(normalized)) {
    throw new Error('GITHUB_REPOSITORY_OWNER must be a GitHub account or organization name.');
  }
  return `ghcr.io/${normalized}/${config.image}:latest`;
}

export function dockerBuildArgs(config: TargetConfig, image: string, env: NodeJS.ProcessEnv): string[] {
  const context = `projects/${config.project}`;
  const args = ['build', context, '--file', `${context}/Dockerfile`, '--tag', image];
  for (const [argument, variable] of config.buildVariables) {
    args.push('--build-arg', `${argument}=${env[variable] ?? ''}`);
  }
  return args;
}

export function readBoolean(value: string | undefined, name: string): boolean {
  if (value === undefined || value === '' || value === 'false') return false;
  if (value === 'true') return true;
  throw new Error(`${name} must be true or false.`);
}

export interface CommandResult {
  stdout: string;
}

export type CommandRunner = (
  command: string, args: readonly string[], options?: { capture?: boolean },
) => Promise<CommandResult>;

export const runCommand: CommandRunner = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, [...args], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'],
    shell: false,
  });
  let stdout = '';
  if (options.capture) {
    child.stdout?.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk; });
    // Do not print captured stderr, which may include remote URLs or credentials.
    child.stderr?.resume();
  }
  child.once('error', () => reject(new Error(`Unable to start ${command}.`)));
  child.once('close', (code) => {
    if (code === 0) resolve({ stdout });
    else reject(new Error(`${command} exited with status ${code ?? 'unknown'}.`));
  });
});

export type HttpClient = typeof globalThis.fetch;

export async function triggerDeployment(
  config: TargetConfig, env: NodeJS.ProcessEnv, http: HttpClient = globalThis.fetch,
): Promise<void> {
  const url = deploymentUrl(
    requiredValue(env, 'DEPLOY_URL'), requiredValue(env, config.deploymentIdVariable),
  );
  const secret = requiredValue(env, 'DEPLOY_SECRET');
  const response = await http(url, {
    method: config.method,
    headers: { Authorization: `Bearer ${secret}` },
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Deployment endpoint returned HTTP ${response.status}; no automatic retry was made.`);
  }
  await response.body?.cancel();
}

export interface ExecuteOptions {
  dryRun?: boolean;
  runner?: CommandRunner;
  http?: HttpClient;
  log?: (message: string) => void;
}

/** Dry runs validate the target/ref and plan without reading deployment credentials or doing I/O. */
export async function executeDeployment(
  target: string, env: NodeJS.ProcessEnv, options: ExecuteOptions = {},
): Promise<void> {
  const config = targetConfig(target);
  assertDeploymentBranch(config, env.GITHUB_REF);
  const image = imageName(config, requiredValue(env, 'GITHUB_REPOSITORY_OWNER'));
  const log = options.log ?? console.log;
  if (options.dryRun) {
    log(JSON.stringify({
      target, branch: config.branch, context: `projects/${config.project}`,
      image, buildArguments: config.buildVariables.map(([argument]) => argument),
      steps: ['docker build', 'docker push', `${config.method} configured deployment endpoint`],
      dryRun: true,
    }, null, 2));
    return;
  }
  // Validate everything before building or publishing an image.
  deploymentUrl(requiredValue(env, 'DEPLOY_URL'), requiredValue(env, config.deploymentIdVariable));
  requiredValue(env, 'DEPLOY_SECRET');
  if (config.project === 'cms-web') requiredValue(env, 'DIRECTUS_URL');
  const runner = options.runner ?? runCommand;
  await runner('docker', dockerBuildArgs(config, image, env));
  await runner('docker', ['push', image]);
  await triggerDeployment(config, env, options.http);
  log(`Deployment requested successfully for ${target}.`);
}
