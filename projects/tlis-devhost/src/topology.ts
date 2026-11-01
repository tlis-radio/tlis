export interface DevHostOptions {
  audio: boolean;
  video: boolean;
  directusUrl: string;
  directusToken: string;
  ffmpegPath: string;
  streamsCollection: string;
}

export const ports = Object.freeze({
  website: 3000,
  bot: 3002,
  audio: 8000,
  video: 8001,
  rtmp: 1935,
  harbor: 8100,
  filebrowser: 8080,
});

function flag(env: NodeJS.ProcessEnv, name: string): boolean {
  const value = env[name];
  if (value === undefined || value === '' || value === 'false') return false;
  if (value === 'true') return true;
  throw new Error(`${name} must be true or false.`);
}

export function localUrl(value: string): string {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username || url.password || url.search || url.hash
  ) {
    throw new Error('TLIS_DIRECTUS_URL must be a loopback HTTP(S) URL without credentials, query, or fragment.');
  }
  return url.href.replace(/\/$/u, '');
}

export function loadOptions(env: NodeJS.ProcessEnv): DevHostOptions {
  const video = flag(env, 'TLIS_ENABLE_VIDEO');
  const token = env.TLIS_DIRECTUS_TOKEN?.trim() ?? '';
  if (video && !token) throw new Error('Video requires TLIS_DIRECTUS_TOKEN from your local Directus.');
  return {
    audio: flag(env, 'TLIS_ENABLE_AUDIO'),
    video,
    directusUrl: localUrl(env.TLIS_DIRECTUS_URL || 'http://localhost:8055'),
    directusToken: token,
    ffmpegPath: env.TLIS_FFMPEG_PATH?.trim() || 'ffmpeg',
    streamsCollection: env.TLIS_STREAMS_COLLECTION?.trim() || 'streams',
  };
}

export function describeTopology(options: DevHostOptions): object {
  return {
    mode: 'local-development',
    sdk: 'Aspire 13.6.0',
    directus: { kind: 'external-local-service', url: options.directusUrl },
    website: { kind: 'npm', directory: '../cms-web', script: 'dev', port: ports.website },
    bot: { kind: 'npm', directory: '../tlis-discord-bot', script: 'dev', port: ports.bot, discordEnabled: false, calendarEnabled: false },
    audio: options.audio ? {
      icecast: ports.audio, liquidsoapHarbor: ports.harbor, filebrowser: ports.filebrowser,
      volumes: ['tlis-dev-fallback-music', 'tlis-dev-replay', 'tlis-dev-filebrowser-db', 'tlis-dev-filebrowser-config'],
    } : { enabled: false },
    video: options.video ? {
      http: ports.video, rtmp: ports.rtmp, directusTokenConfigured: Boolean(options.directusToken),
      streamsCollection: options.streamsCollection, ffmpegPath: options.ffmpegPath,
    } : { enabled: false },
  };
}
