import assert from 'node:assert/strict';
import test from 'node:test';
import type { DistributedApplicationBuilder } from '../.aspire/modules/aspire.mjs';
import { configureResources } from '../src/resources.ts';
import { describeTopology, loadOptions, localUrl, ports } from '../src/topology.ts';

interface RecordedResource {
  name: string;
  kind: string;
  source: unknown;
  calls: Array<{ method: string; args: unknown[] }>;
}

function recorder() {
  const resources = new Map<string, RecordedResource>();
  function add(kind: string, name: string, source: unknown) {
    const record: RecordedResource = { name, kind, source, calls: [] };
    resources.set(name, record);
    const resource = new Proxy({ name }, {
      get(target, property) {
        if (property === 'then') return undefined;
        if (property === 'name') return target.name;
        return async (...args: unknown[]) => {
          record.calls.push({ method: String(property), args });
          return resource;
        };
      },
    });
    return Promise.resolve(resource);
  }
  const builder = {
    addExternalService: (name: string, url: string) => add('external', name, url),
    addJavaScriptApp: (name: string, directory: string) => add('npm', name, directory),
    addDockerfile: (name: string, directory: string) => add('dockerfile', name, directory),
    addContainer: (name: string, options: unknown) => add('container', name, options),
    addParameter: (name: string, options: unknown) => add('parameter', name, options),
  } as unknown as DistributedApplicationBuilder;
  return { builder, resources };
}

function call(resource: RecordedResource | undefined, method: string) {
  assert.ok(resource, 'Expected resource');
  return resource.calls.filter((entry) => entry.method === method).map((entry) => entry.args);
}

test('default topology starts website and offline bot, with only local Directus metadata', async () => {
  const { builder, resources } = recorder();
  await configureResources(builder, loadOptions({}));
  assert.deepEqual([...resources.keys()], ['directus', 'cms-web', 'tlis-discord-bot']);
  assert.equal(resources.get('directus')?.source, 'http://localhost:8055');
  assert.equal(resources.get('cms-web')?.source, '../cms-web');
  assert.deepEqual(call(resources.get('cms-web'), 'withNpm'), [[{ installCommand: 'ci', installArgs: ['--legacy-peer-deps'] }]]);
  assert.deepEqual(call(resources.get('cms-web'), 'withArgs'), [[['--', '--hostname', '127.0.0.1']]]);
  assert.equal(Object.fromEntries(call(resources.get('cms-web'), 'withEnvironment')).STREAMS_COLLECTION, 'streams');
  const botEnvironment = Object.fromEntries(call(resources.get('tlis-discord-bot'), 'withEnvironment'));
  assert.equal(botEnvironment.BOT_ENABLED, 'false');
  assert.equal(botEnvironment.HOST, '127.0.0.1');
  for (const name of ['DISCORD_TOKEN', 'DISCORD_APPLICATION_ID', 'DISCORD_GUILD_ID', 'CALENDAR_ICS_URL']) {
    assert.equal(botEnvironment[name], '');
  }
});

test('explicit local audio adds three native Aspire resources and shared volumes', async () => {
  const { builder, resources } = recorder();
  await configureResources(builder, loadOptions({ TLIS_ENABLE_AUDIO: 'true' }));
  assert.equal(resources.get('icecast')?.kind, 'dockerfile');
  assert.equal(resources.get('icecast')?.source, '../tlis-streamserver-docker/icecast');
  assert.equal(resources.get('liquidsoap')?.source, '../tlis-streamserver-docker/liquidsoap');
  assert.deepEqual(resources.get('music-filebrowser')?.source, { image: 'filebrowser/filebrowser', tag: 's6' });
  assert.deepEqual(call(resources.get('liquidsoap'), 'withVolume'), [
    ['/music', { name: 'tlis-dev-fallback-music' }], ['/replay', { name: 'tlis-dev-replay' }],
  ]);
  assert.deepEqual(call(resources.get('music-filebrowser'), 'withVolume')[0], ['/srv', { name: 'tlis-dev-fallback-music' }]);
  assert.equal((call(resources.get('liquidsoap'), 'waitFor')[0]?.[0] as { name: string }).name, 'icecast');
  assert.equal((call(resources.get('music-filebrowser'), 'waitFor')[0]?.[0] as { name: string }).name, 'liquidsoap');
  assert.deepEqual(call(resources.get('icecast'), 'withContainerNetworkAlias'), [['icecast']]);
});

test('video uses a secret parameter, local Directus readiness, and distinct media port', async () => {
  const { builder, resources } = recorder();
  await configureResources(builder, loadOptions({ TLIS_ENABLE_VIDEO: 'true', TLIS_DIRECTUS_TOKEN: 'local-test-token' }));
  assert.deepEqual(resources.get('local-directus-token')?.source, { value: 'local-test-token', secret: true });
  assert.deepEqual(call(resources.get('videostream'), 'withHttpEndpoint'), [[{
    port: 8001, targetPort: 8001, env: 'HTTP_MEDIA_PORT', isProxied: false,
  }]]);
  assert.equal((call(resources.get('videostream'), 'waitFor')[0]?.[0] as { name: string }).name, 'directus');
  assert.equal((call(resources.get('cms-web'), 'waitFor')[0]?.[0] as { name: string }).name, 'videostream');
  const environment = Object.fromEntries(call(resources.get('videostream'), 'withEnvironment'));
  assert.equal(environment.MEDIA_SERVER_PUBLIC_URL, 'http://localhost:8001');
  assert.match(environment.MEDIA_ROOT as string, /tlis-devhost[/\\]\.dev-data[/\\]video-media$/u);
  assert.equal(environment.STREAMS_COLLECTION, 'streams');
});

test('options reject production URLs, implicit flags, and missing video credentials', () => {
  assert.throws(() => loadOptions({ TLIS_DIRECTUS_URL: 'https://cms.example.com' }), /loopback/u);
  assert.throws(() => loadOptions({ TLIS_ENABLE_AUDIO: 'yes' }), /true or false/u);
  assert.throws(() => loadOptions({ TLIS_ENABLE_VIDEO: 'true' }), /TLIS_DIRECTUS_TOKEN/u);
  assert.throws(() => localUrl('http://user:pass@localhost:8055'), /loopback/u);
  assert.throws(() => localUrl('http://localhost:8055?token=private'), /loopback/u);
  assert.equal(localUrl('http://127.0.0.1:8055/'), 'http://127.0.0.1:8055');
});

test('public topology description redacts tokens and all reserved host ports differ', () => {
  const options = loadOptions({ TLIS_ENABLE_VIDEO: 'true', TLIS_DIRECTUS_TOKEN: 'never-print-this-token' });
  const text = JSON.stringify(describeTopology(options));
  assert.ok(!text.includes('never-print-this-token'));
  assert.equal(new Set(Object.values(ports)).size, Object.values(ports).length);
});
