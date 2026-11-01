import { ROOT, git, requireThat, slug } from './common.ts';

export function createFeature(name: string, root = ROOT): string {
  const branch = `feature/${slug(name)}`;
  requireThat(git(root, ['branch', '--show-current']).toString().trim() === 'dev',
    'Start feature branches from dev: switch to dev and update it first');
  requireThat(git(root, ['status', '--porcelain']).length === 0, 'Commit or stash existing changes first');
  git(root, ['switch', '-c', branch]);
  return branch;
}
