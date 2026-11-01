import { pathToFileURL } from 'node:url';
import { executeDeployment, readBoolean, targetConfig } from './deployment.ts';
import { discordWebhookUrl, notifyDiscord } from './discord.ts';

export async function main(args: string[], env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const [target, ...flags] = args;
  if (!target || flags.some((flag) => !['--dry-run', '--notify-discord'].includes(flag))) {
    throw new Error('Usage: node tools/deploy/deploy.ts <cms-web-dev|cms-web-prod|videostream-prod> [--dry-run] [--notify-discord]');
  }
  const dryRun = flags.includes('--dry-run') || readBoolean(env.DEPLOY_DRY_RUN, 'DEPLOY_DRY_RUN');
  const notify = flags.includes('--notify-discord') || readBoolean(env.DEPLOY_NOTIFY_DISCORD, 'DEPLOY_NOTIFY_DISCORD');
  const config = targetConfig(target);
  if (notify && !dryRun) {
    if (config.project !== 'cms-web') throw new Error('Discord notification is unsupported for this target.');
    discordWebhookUrl(env.DISCORD_FORUM_WEBHOOK_URL ?? '', env.THREAD_ID ?? '');
  }
  await executeDeployment(target, env, { dryRun });
  if (notify && !dryRun) await notifyDiscord(config, env);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(() => {
    // Network and subprocess error details can contain secret-bearing URLs.
    console.error('Deployment failed. Check the target branch, required environment settings, Docker output, and service status. No automatic HTTP retry was made.');
    process.exitCode = 1;
  });
}
