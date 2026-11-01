import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, existingWithin, git, commit, readJson, requireThat, runCommand, slug } from './common.ts';

export interface Project { name: string; path: string }
interface Check { command: string; args: string[] }
interface ProjectConfig { name: string; checks: Check[] }

export function projects(root = ROOT): Project[] {
  const registry = readJson<{ schemaVersion: number; projects: Project[] }>(path.join(root, '_config/projects.json'));
  requireThat(registry.schemaVersion === 1 && Array.isArray(registry.projects), 'Invalid project registry');
  const seen = new Set<string>();
  for (const project of registry.projects) {
    slug(project.name);
    requireThat(project.path === `projects/${project.name}`, 'Every project must live under projects/<name>');
    requireThat(!seen.has(project.name), `Duplicate project ${project.name}`);
    seen.add(project.name);
    existingWithin(root, project.path);
  }
  return registry.projects;
}

export function projectByName(name: string, root = ROOT): Project {
  const project = projects(root).find(p => p.name === slug(name));
  requireThat(project, `Unknown project '${name}'`);
  return project;
}

export function projectCheck(name: string, root = ROOT): void {
  const project = projectByName(name, root);
  const directory = existingWithin(root, project.path);
  const entry = existingWithin(directory, 'tools/check.ts');
  runCommand(directory, 'node', [entry]);
}

export function runProjectChecks(directory: string): void {
  const config = readJson<ProjectConfig>(path.join(directory, '_config/project.json'));
  slug(config.name);
  requireThat(Array.isArray(config.checks) && config.checks.length > 0, 'No project checks declared');
  for (const check of config.checks) {
    requireThat(['node', 'npm', 'docker'].includes(check.command), 'Unsupported check executable');
    requireThat(Array.isArray(check.args) && check.args.every(arg => typeof arg === 'string'), 'Invalid check arguments');
    console.log(`[${config.name}] ${check.command} ${check.args.join(' ')}`);
    runCommand(directory, check.command, check.args);
  }
}

export function affectedProjects(files: string[], registry: Project[]): { projects: string[]; sharedPaths: string[] } {
  const specific = new Set<string>();
  const sharedPaths: string[] = [];
  for (const file of files) {
    const project = registry.find(p => file === p.path || file.startsWith(p.path + '/'));
    if (project) specific.add(project.name);
    else sharedPaths.push(file);
  }
  return { projects: registry.filter(p => sharedPaths.length > 0 || specific.has(p.name)).map(p => p.name), sharedPaths };
}

export function changes(base: string, head: string, root = ROOT) {
  const from = commit(root, base);
  const to = commit(root, head);
  const files = git(root, ['diff', '--no-renames', '--name-only', '-z', from, to, '--'])
    .toString().split('\0').filter(Boolean);
  return { base: from, head: to, files, ...affectedProjects(files, projects(root)) };
}
