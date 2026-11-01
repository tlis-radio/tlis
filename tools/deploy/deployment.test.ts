import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertDeploymentBranch, deploymentUrl, dockerBuildArgs, executeDeployment,
  imageName, readBoolean, targetConfig,
} from './deployment.ts';
import type { CommandRunner, HttpClient } from './deployment.ts';
import { discordWebhookUrl, notifyDiscord } from './discord.ts';

const productionEnv: NodeJS.ProcessEnv = {
  GITHUB_REF: 'refs/heads/main', GITHUB_REPOSITORY_OWNER: 'tlis-radio',
  DIRECTUS_URL: 'https://cms.example.test', SITE_URL: 'https://example.test',
  DEPLOY_URL: 'https://deploy.example.test/api/deploy?existing=value',
  PROD_DEPLOY_ID: 'project-resource', DEPLOY_SECRET: 'test-secret',
};

test('targets preserve the original image names, methods, and new branch policy', () => {
  assert.deepEqual(
    ['cms-web-dev', 'cms-web-prod', 'videostream-prod'].map((name) => {
      const config = targetConfig(name);
      return [config.branch, imageName(config, 'TLIS-RADIO'), config.method];
    }),
    [
      ['dev', 'ghcr.io/tlis-radio/tlis-web-dev:latest', 'POST'],
      ['main', 'ghcr.io/tlis-radio/tlis-web:latest', 'POST'],
      ['main', 'ghcr.io/tlis-radio/video-stream:latest', 'GET'],
    ],
  );
  assert.throws(() => targetConfig('__proto__'), /Unknown deployment target/u);
});

test('deployment URLs retain existing query data and encode resource identifiers', () => {
  const url = deploymentUrl('https://deploy.example.test/api?existing=yes&force=true', 'a&b');
  assert.equal(url.searchParams.get('existing'), 'yes');
  assert.equal(url.searchParams.get('uuid'), 'a&b');
  assert.equal(url.searchParams.get('force'), 'false');
  assert.throws(() => deploymentUrl('file:///etc/passwd', 'id'), /HTTP/u);
  assert.throws(() => deploymentUrl('https://user:password@example.test', 'id'), /credentials/u);
  assert.throws(() => deploymentUrl('https://example.test', ''), /identifier/u);
});

test('branch and boolean input validation reject ambiguous values', () => {
  assertDeploymentBranch(targetConfig('cms-web-dev'), 'refs/heads/dev');
  assert.throws(() => assertDeploymentBranch(targetConfig('cms-web-prod'), 'refs/heads/feature/x'), /main/u);
  assert.throws(() => imageName(targetConfig('cms-web-prod'), 'bad/name'), /account/u);
  assert.equal(readBoolean(undefined, 'OPTION'), false);
  assert.equal(readBoolean('true', 'OPTION'), true);
  assert.equal(readBoolean('false', 'OPTION'), false);
  assert.throws(() => readBoolean('yes', 'OPTION'), /true or false/u);
});

test('website build uses its project context and exact original build argument names', () => {
  const args = dockerBuildArgs(targetConfig('cms-web-prod'), 'image', productionEnv);
  assert.deepEqual(args.slice(0, 6), [
    'build', 'projects/cms-web', '--file', 'projects/cms-web/Dockerfile', '--tag', 'image',
  ]);
  assert.ok(args.includes('NEXT_PUBLIC_DIRECTUS_URL=https://cms.example.test'));
  assert.ok(args.includes('NEXT_PUBLIC_ANALYTICS_ID='));
  assert.ok(args.includes('NEXT_PUBLIC_ANALYTICS_URL='));
  assert.ok(args.includes('NEXT_PUBLIC_SITE_URL=https://example.test'));
  assert.ok(!dockerBuildArgs(targetConfig('videostream-prod'), 'image', {}).includes('--build-arg'));
});

test('dry run makes no commands or HTTP calls and does not require deployment secrets', async () => {
  const logs: string[] = [];
  const unexpected = () => { throw new Error('Unexpected external operation'); };
  await executeDeployment('cms-web-prod', {
    GITHUB_REF: 'refs/heads/main', GITHUB_REPOSITORY_OWNER: 'tlis-radio',
    DEPLOY_SECRET: 'never-print-this',
  }, {
    dryRun: true,
    runner: unexpected,
    http: unexpected,
    log: (line) => logs.push(line),
  });
  assert.equal(JSON.parse(logs[0]!).dryRun, true);
  assert.ok(!logs.join('').includes('never-print-this'));
});

test('missing required config and wrong branches fail before image publication', async () => {
  let operations = 0;
  const runner: CommandRunner = async () => { operations++; return { stdout: '' }; };
  await assert.rejects(executeDeployment('cms-web-prod', { ...productionEnv, DEPLOY_SECRET: '' }, { runner }), /DEPLOY_SECRET/u);
  await assert.rejects(executeDeployment('cms-web-prod', { ...productionEnv, GITHUB_REF: 'refs/heads/dev' }, { runner }), /main/u);
  assert.equal(operations, 0);
});

test('real orchestration builds, pushes, then makes one authenticated deployment request', async () => {
  const operations: Array<{ command: string; args: readonly string[] }> = [];
  const runner: CommandRunner = async (command, args) => {
    operations.push({ command, args });
    return { stdout: '' };
  };
  let requests = 0;
  const http: HttpClient = async (input, init) => {
    requests++;
    assert.equal(operations.length, 2);
    assert.equal(operations[0]?.args[1], 'projects/cms-web');
    assert.deepEqual(operations[1], { command: 'docker', args: ['push', 'ghcr.io/tlis-radio/tlis-web:latest'] });
    assert.equal(init?.method, 'POST');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-secret');
    assert.equal(new URL(String(input)).searchParams.get('uuid'), 'project-resource');
    assert.equal(init?.redirect, 'error');
    return new Response(null, { status: 200 });
  };
  await executeDeployment('cms-web-prod', productionEnv, { runner, http, log: () => {} });
  assert.equal(requests, 1);
});

test('video preserves GET and non-success responses are not retried', async () => {
  let requests = 0;
  const http: HttpClient = async (_input, init) => {
    requests++;
    assert.equal(init?.method, 'GET');
    return new Response(null, { status: 503 });
  };
  await assert.rejects(executeDeployment('videostream-prod', productionEnv, {
    runner: async () => ({ stdout: '' }), http, log: () => {},
  }), /503/u);
  assert.equal(requests, 1);
});

test('Discord helper validates the destination and uses JSON with mentions disabled', async () => {
  assert.throws(() => discordWebhookUrl('https://other.example.test/api/webhooks/id/token', '123'), /Discord/u);
  assert.throws(() => discordWebhookUrl('https://discord.com/api/webhooks/id/token', 'abc'), /digits/u);
  let requests = 0;
  const runner: CommandRunner = async (command, args) => {
    assert.equal(command, 'git');
    assert.deepEqual(args.slice(-2), ['--', 'projects/cms-web']);
    return { stdout: '- abc123 - A "quoted" change\n- def456 - @everyone' };
  };
  const http: HttpClient = async (input, init) => {
    requests++;
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('thread_id'), '123');
    const payload = JSON.parse(String(init?.body));
    assert.match(payload.content, /A "quoted" change/u);
    assert.deepEqual(payload.allowed_mentions, { parse: [] });
    assert.ok(payload.content.length <= 2000);
    return new Response(null, { status: 200 });
  };
  await notifyDiscord(targetConfig('cms-web-dev'), {
    DISCORD_FORUM_WEBHOOK_URL: 'https://discord.com/api/webhooks/id/token', THREAD_ID: '123',
  }, { runner, http, now: new Date('2026-11-01T12:00:00Z') });
  assert.equal(requests, 1);
});
