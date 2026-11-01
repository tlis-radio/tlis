import { requiredValue, runCommand } from './deployment.ts';
import type { CommandRunner, HttpClient, TargetConfig } from './deployment.ts';

export function discordWebhookUrl(base: string, threadId: string): URL {
  const url = new URL(base);
  if (
    url.protocol !== 'https:' || !['discord.com', 'discordapp.com'].includes(url.hostname) ||
    url.username || url.password || !/^\/api\/webhooks\/[^/]+\/[^/]+\/?$/u.test(url.pathname)
  ) {
    throw new Error('DISCORD_FORUM_WEBHOOK_URL must be an HTTPS Discord webhook URL.');
  }
  if (!/^\d+$/u.test(threadId)) throw new Error('THREAD_ID must contain only digits.');
  url.searchParams.set('thread_id', threadId);
  url.searchParams.set('wait', 'true');
  return url;
}

export async function notifyDiscord(
  config: TargetConfig, env: NodeJS.ProcessEnv,
  options: { runner?: CommandRunner; http?: HttpClient; now?: Date } = {},
): Promise<void> {
  if (config.project !== 'cms-web') throw new Error('Discord build notifications are only configured for cms-web.');
  const url = discordWebhookUrl(
    requiredValue(env, 'DISCORD_FORUM_WEBHOOK_URL'), requiredValue(env, 'THREAD_ID'),
  );
  const runner = options.runner ?? runCommand;
  const result = await runner('git', [
    'log', '-5', '--pretty=format:- %h - %s (%an)', '--', 'projects/cms-web',
  ], { capture: true });
  const environment = config.branch === 'dev' ? 'dev' : 'prod';
  const date = (options.now ?? new Date()).toISOString();
  const text = `🚀 Nový ${environment} build webstránky!\n**Build Date:** ${date}\n**Latest commits:**\n${result.stdout}`;
  const response = await (options.http ?? globalThis.fetch)(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: text.slice(0, 2000),
      allowed_mentions: { parse: [] },
    }),
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Discord notification returned HTTP ${response.status}.`);
  await response.body?.cancel();
}
