import path from 'node:path';
import { ROOT, existingWithin, git, commit, readJson, requireThat, runCommand, slug } from './common.ts';

export interface Project { name: string; path: string; kind?: 'project' | 'library'; dependsOn?: string[] }
export interface Component extends Project { kind: 'project' | 'library'; dependsOn: string[] }
interface Check { command: string; args: string[] }
interface ProjectConfig { name: string; checks: Check[] }

export function components(root = ROOT): Component[] {
  const registry = readJson<{ schemaVersion: number; projects: Project[]; libraries?: Project[] }>(path.join(root, '_config/projects.json'));
  requireThat([1, 2].includes(registry.schemaVersion) && Array.isArray(registry.projects), 'Invalid component registry');
  const entries: Component[] = [
    ...registry.projects.map(p => ({ ...p, kind: 'project' as const, dependsOn: p.dependsOn ?? [] })),
    ...(registry.libraries ?? []).map(p => ({ ...p, kind: 'library' as const, dependsOn: p.dependsOn ?? [] })),
  ];
  validateComponents(entries);
  for (const item of entries) existingWithin(root, item.path);
  return entries;
}

export function validateComponents(entries: Component[]): void {
  const byName = new Map<string, Component>();
  for (const item of entries) {
    slug(item.name);
    const group = item.kind === 'library' ? 'libraries' : 'projects';
    requireThat(item.path === `${group}/${item.name}`, `Component must live under ${group}/<name>`);
    requireThat(!byName.has(item.name), `Duplicate component ${item.name}`);
    requireThat(Array.isArray(item.dependsOn) && item.dependsOn.every(x => typeof x === 'string'), 'Invalid dependency list');
    byName.set(item.name, item);
  }
  const done = new Set<string>();
  const visiting = new Set<string>();
  function visit(name: string): void {
    requireThat(!visiting.has(name), `Component dependency cycle at ${name}`);
    if (done.has(name)) return;
    const item = byName.get(name);
    requireThat(item, `Unknown component dependency ${name}`);
    visiting.add(name);
    for (const dependency of item.dependsOn) visit(dependency);
    visiting.delete(name); done.add(name);
  }
  for (const item of entries) visit(item.name);
}

export function projects(root = ROOT): Component[] { return components(root).filter(p => p.kind === 'project'); }

export function componentByName(name: string, root = ROOT): Component {
  const item = components(root).find(p => p.name === slug(name));
  requireThat(item, `Unknown component '${name}'`);
  return item;
}
export const projectByName = componentByName;

export function componentCheck(name: string, root = ROOT): void {
  const item = componentByName(name, root);
  const directory = existingWithin(root, item.path);
  const entry = existingWithin(directory, 'scripts/check.ts');
  runCommand(directory, 'node', [entry]);
}
export const projectCheck = componentCheck;

export function runProjectChecks(directory: string): void {
  const config = readJson<ProjectConfig>(path.join(directory, '_config/project.json'));
  slug(config.name);
  requireThat(Array.isArray(config.checks) && config.checks.length > 0, 'No component checks declared');
  for (const check of config.checks) {
    requireThat(['node', 'npm', 'docker', 'dotnet', 'aspire'].includes(check.command), 'Unsupported check executable');
    requireThat(Array.isArray(check.args) && check.args.every(arg => typeof arg === 'string'), 'Invalid check arguments');
    console.log(`[${config.name}] ${check.command} ${check.args.join(' ')}`);
    runCommand(directory, check.command, check.args);
  }
}

export function affectedComponents(files: string[], entries: Project[]) {
  const affected = new Set<string>();
  const sharedPaths: string[] = [];
  for (const file of files) {
    const item = entries.find(p => file === p.path || file.startsWith(p.path + '/'));
    if (item) affected.add(item.name);
    else sharedPaths.push(file);
  }
  if (sharedPaths.length) for (const item of entries) affected.add(item.name);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of entries) if (!affected.has(item.name) && item.dependsOn?.some(name => affected.has(name))) {
      affected.add(item.name); grew = true;
    }
  }
  return {
    components: entries.filter(p => affected.has(p.name)).map(p => p.name),
    projects: entries.filter(p => p.kind !== 'library' && affected.has(p.name)).map(p => p.name),
    libraries: entries.filter(p => p.kind === 'library' && affected.has(p.name)).map(p => p.name),
    sharedPaths,
  };
}

export function affectedProjects(files: string[], entries: Project[]) {
  const { projects, sharedPaths } = affectedComponents(files, entries);
  return { projects, sharedPaths };
}

export function changes(base: string, head: string, root = ROOT) {
  const from = commit(root, base); const to = commit(root, head);
  const files = git(root, ['diff', '--no-renames', '--name-only', '-z', from, to, '--']).toString().split('\0').filter(Boolean);
  return { base: from, head: to, files, ...affectedComponents(files, components(root)) };
}
