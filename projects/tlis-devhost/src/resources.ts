import type { DistributedApplicationBuilder } from '../.aspire/modules/aspire.mjs';
import { fileURLToPath } from 'node:url';
import { ports } from './topology.ts';
import type { DevHostOptions } from './topology.ts';

/** Configure actual Aspire resources; callers decide whether to start the AppHost. */
export async function configureResources(builder: DistributedApplicationBuilder, options: DevHostOptions): Promise<void> {
  const directus = await builder.addExternalService('directus', options.directusUrl);
  await directus.withHttpHealthCheck({ path: '/server/health' });

  const website = await builder.addJavaScriptApp('cms-web', '../cms-web');
  await website.withNpm({ installCommand: 'ci', installArgs: ['--legacy-peer-deps'] });
  await website.withRunScript('dev');
  await website.withArgs(['--', '--hostname', '127.0.0.1']);
  await website.withHttpEndpoint({ port: ports.website, targetPort: ports.website, env: 'PORT', isProxied: false });
  await website.withEnvironment('NEXT_PUBLIC_DIRECTUS_URL', options.directusUrl);
  await website.withEnvironment('NEXT_PUBLIC_SITE_URL', `http://localhost:${ports.website}`);
  await website.withEnvironment('NEXT_PUBLIC_ANALYTICS_ID', '');
  await website.withEnvironment('NEXT_PUBLIC_ANALYTICS_URL', '');
  await website.withEnvironment('STREAMS_COLLECTION', options.streamsCollection);
  await website.withReference(directus);

  const bot = await builder.addJavaScriptApp('tlis-discord-bot', '../tlis-discord-bot');
  await bot.withNpm({ installCommand: 'ci' });
  await bot.withRunScript('dev');
  await bot.withHttpEndpoint({ port: ports.bot, targetPort: ports.bot, env: 'PORT', isProxied: false });
  for (const [name, value] of Object.entries({
    HOST: '127.0.0.1', BOT_ENABLED: 'false', DISCORD_TOKEN: '',
    DISCORD_APPLICATION_ID: '', DISCORD_GUILD_ID: '', CALENDAR_ICS_URL: '',
  })) await bot.withEnvironment(name, value);
  await bot.withHttpHealthCheck({ path: '/health' });

  if (options.video) {
    const token = await builder.addParameter('local-directus-token', { value: options.directusToken, secret: true });
    const video = await builder.addJavaScriptApp('videostream', '../videostream');
    await video.withNpm({ installCommand: 'ci' });
    await video.withRunScript('dev');
    await video.withHttpEndpoint({ port: ports.video, targetPort: ports.video, env: 'HTTP_MEDIA_PORT', isProxied: false });
    await video.withEndpoint({ port: ports.rtmp, targetPort: ports.rtmp, name: 'rtmp', scheme: 'rtmp', env: 'RTMP_PORT', isProxied: false });
    await video.withEnvironment('DIRECTUS_URL', options.directusUrl);
    await video.withEnvironment('DIRECTUS_TOKEN', token);
    await video.withEnvironment('MEDIA_SERVER_PUBLIC_URL', `http://localhost:${ports.video}`);
    await video.withEnvironment('MEDIA_ROOT', fileURLToPath(new URL('../.dev-data/video-media', import.meta.url)));
    await video.withEnvironment('FFMPEG_PATH', options.ffmpegPath);
    await video.withEnvironment('STREAMS_COLLECTION', options.streamsCollection);
    await video.withReference(directus);
    await video.waitFor(directus);
    await website.withReference(video);
    await website.waitFor(video);
  }

  if (options.audio) {
    const icecast = await builder.addDockerfile('icecast', '../tlis-streamserver-docker/icecast');
    await icecast.withContainerNetworkAlias('icecast');
    await icecast.withHttpEndpoint({ port: ports.audio, targetPort: 8000 });
    await icecast.withEnvironment('ICECAST_SOURCE_PASSWORD', 'devSourcePassword');
    await icecast.withEnvironment('ICECAST_RELAY_PASSWORD', 'tlis-local-relay');
    await icecast.withEnvironment('ICECAST_ADMIN_USERNAME', 'admin');
    await icecast.withEnvironment('ICECAST_ADMIN_PASSWORD', 'tlis-local-admin');
    await icecast.withEnvironment('ICECAST_HOSTNAME', 'localhost');
    await icecast.withHttpHealthCheck({ path: '/status-json.xsl' });

    const liquidsoap = await builder.addDockerfile('liquidsoap', '../tlis-streamserver-docker/liquidsoap');
    await liquidsoap.withEndpoint({ port: ports.harbor, targetPort: 8100, name: 'harbor', scheme: 'http' });
    await liquidsoap.withEnvironment('HARBOR_SOURCE_PASSWORD', 'tlis-local-harbor');
    await liquidsoap.withVolume('/music', { name: 'tlis-dev-fallback-music' });
    await liquidsoap.withVolume('/replay', { name: 'tlis-dev-replay' });
    await liquidsoap.withReference(icecast);
    await liquidsoap.waitFor(icecast);

    const filebrowser = await builder.addContainer('music-filebrowser', { image: 'filebrowser/filebrowser', tag: 's6' });
    await filebrowser.withHttpEndpoint({ port: ports.filebrowser, targetPort: 80 });
    await filebrowser.withVolume('/srv', { name: 'tlis-dev-fallback-music' });
    await filebrowser.withVolume('/database', { name: 'tlis-dev-filebrowser-db' });
    await filebrowser.withVolume('/config', { name: 'tlis-dev-filebrowser-config' });
    // Liquidsoap initializes the shared music directory tree before Filebrowser mounts it.
    await filebrowser.waitFor(liquidsoap);
    await website.withReference(icecast);
  }
}
