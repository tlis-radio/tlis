import { createHash } from 'node:crypto';
import {
  chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync,
  readlinkSync, realpathSync, rmdirSync, unlinkSync, writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { ROOT, git, requireThat } from './common.ts';
import { components } from './projects.ts';

const GENERATOR = 'tlis-skills-sync';
const MANIFEST = '.claude/skills.generated.json';
interface Bundle { files: Record<string, string>; directories: string[] }
interface Snapshot extends Bundle { contents: Map<string, { bytes: Buffer; mode: number }> }
interface Manifest { schemaVersion: 1; generatedBy: typeof GENERATOR; skills: Record<string, Bundle> }
interface Action { name: string; previous?: Bundle; next?: Snapshot; legacy: boolean; missing: boolean }
interface Plan {
  scope: string; destination: string; manifestPath: string; manifest: string;
  migrateRoot: boolean; actions: Action[]; changes: string[];
}
export interface SkillSyncResult { scopes: number; skills: number; files: number; changes: string[] }

function entry(file: string) {
  try { return lstatSync(file); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined; throw error; }
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function skillName(value: string): void {
  requireThat(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 64, `Invalid skill name: ${value}`);
}
function relativeFile(value: string): void {
  requireThat(value.length > 0 && !value.includes('\\') && !/[\x00-\x1f<>:"|?*]/.test(value)
    && value.split('/').every(part => part !== '' && part !== '.' && part !== '..'
      && !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)),
  `Non-portable skill path: ${value}`);
}
function same(a: Bundle, b: Bundle): boolean {
  return JSON.stringify(bundle(a.files, a.directories)) === JSON.stringify(bundle(b.files, b.directories));
}
function bundle(files: Record<string, string>, directories: string[]): Bundle {
  return { files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)),
    directories: [...directories].sort() };
}
function plainDirectory(directory: string): void {
  const stat = entry(directory);
  requireThat(!stat || (stat.isDirectory() && !stat.isSymbolicLink()), `Expected a real directory: ${directory}`);
}

/** Snapshot a complete bundle. Internal source links are materialized; escaping/cyclic links fail. */
function snapshot(directory: string, source: boolean): Snapshot {
  const root = realpathSync(directory);
  const files: Record<string, string> = Object.create(null);
  const directories: string[] = [];
  const contents = new Map<string, { bytes: Buffer; mode: number }>();
  const seen = new Set<string>();
  function walk(current: string, relative: string, ancestors: Set<string>): void {
    const actual = realpathSync(current);
    requireThat(actual === root || actual.startsWith(root + path.sep), `Skill symlink escapes its bundle: ${current}`);
    requireThat(!ancestors.has(actual), `Cyclic skill directory: ${current}`);
    const nextAncestors = new Set([...ancestors, actual]);
    for (const name of readdirSync(current).sort()) {
      const rel = relative ? relative + '/' + name : name;
      relativeFile(rel);
      requireThat(!seen.has(rel.toLowerCase()), `Skill paths collide across operating systems: ${rel}`);
      seen.add(rel.toLowerCase());
      const file = path.join(current, name);
      const stat = lstatSync(file);
      requireThat(source || !stat.isSymbolicLink(), `Generated skill contains a local symlink: ${file}`);
      const resolved = realpathSync(file);
      requireThat(resolved.startsWith(root + path.sep), `Skill symlink escapes its bundle: ${file}`);
      const target = stat.isSymbolicLink() ? lstatSync(resolved) : stat;
      if (target.isDirectory()) { directories.push(rel); walk(file, rel, nextAncestors); }
      else {
        requireThat(target.isFile(), `Unsupported skill entry: ${file}`);
        const bytes = readFileSync(file);
        files[rel] = createHash('sha256').update(bytes).digest('hex');
        contents.set(rel, { bytes, mode: target.mode & 0o777 });
      }
    }
  }
  walk(directory, '', new Set());
  return { ...bundle(files, directories), contents };
}

function readManifest(file: string): Manifest | undefined {
  const stat = entry(file);
  if (!stat) return undefined;
  requireThat(stat.isFile() && !stat.isSymbolicLink(), `Generated skill manifest must be a regular file: ${file}`);
  const raw = readFileSync(file, 'utf8');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error(`Malformed generated skill manifest: ${file}`); }
  requireThat(parseDocument(raw, { uniqueKeys: true }).errors.length === 0, `Duplicate keys in skill manifest: ${file}`);
  requireThat(object(value) && Object.keys(value).sort().join(',') === 'generatedBy,schemaVersion,skills'
    && value.schemaVersion === 1 && value.generatedBy === GENERATOR && object(value.skills),
  `Invalid generated skill manifest: ${file}`);
  const skills: Record<string, Bundle> = Object.create(null);
  for (const [name, record] of Object.entries(value.skills)) {
    skillName(name);
    requireThat(object(record) && Object.keys(record).sort().join(',') === 'directories,files'
      && object(record.files) && Array.isArray(record.directories), `Invalid skill manifest bundle: ${name}`);
    const files: Record<string, string> = Object.create(null);
    const directories: string[] = [];
    const seen = new Set<string>();
    for (const rel of record.directories) {
      requireThat(typeof rel === 'string', `Invalid directory in skill manifest: ${name}`);
      relativeFile(rel);
      requireThat(!seen.has(rel.toLowerCase()), `Duplicate skill manifest path: ${rel}`);
      seen.add(rel.toLowerCase()); directories.push(rel);
    }
    for (const [rel, hash] of Object.entries(record.files)) {
      relativeFile(rel);
      requireThat(typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash), `Invalid skill file hash: ${rel}`);
      requireThat(!seen.has(rel.toLowerCase()), `Duplicate skill manifest path: ${rel}`);
      seen.add(rel.toLowerCase()); files[rel] = hash;
    }
    requireThat(Object.hasOwn(files, 'SKILL.md'), `Skill manifest is missing SKILL.md: ${name}`);
    for (const rel of [...directories, ...Object.keys(files)]) {
      let parent = path.posix.dirname(rel);
      while (parent !== '.') {
        requireThat(directories.includes(parent), `Missing parent directory in skill manifest: ${rel}`);
        parent = path.posix.dirname(parent);
      }
    }
    skills[name] = bundle(files, directories);
  }
  return { schemaVersion: 1, generatedBy: GENERATOR, skills };
}

/** Recognize only the exact canonical adapter target, including Git-proven Windows checkouts. */
function legacyLink(root: string, file: string, canonical: string): boolean {
  const stat = entry(file);
  if (!stat) return false;
  const expected = path.relative(path.dirname(file), canonical).split(path.sep).join('/');
  if (stat.isSymbolicLink()) return path.resolve(path.dirname(file), readlinkSync(file)) === path.resolve(canonical);
  if (!stat.isFile() || !readFileSync(file).equals(Buffer.from(expected))) return false;
  const relative = path.relative(root, file).split(path.sep).join('/');
  try {
    const records = git(root, ['ls-files', '--stage', '-z', '--', relative]).toString().split('\0').filter(Boolean);
    if (records.length !== 1) return false;
    const match = /^120000 ([a-f0-9]+) 0\t(.+)$/.exec(records[0]);
    return !!match && match[2] === relative && git(root, ['cat-file', 'blob', match[1]]).equals(Buffer.from(expected));
  } catch { return false; }
}

function planScope(root: string, scope: string): Plan | undefined {
  const canonical = path.join(scope, '.agents/skills');
  const destination = path.join(scope, '.claude/skills');
  const manifestPath = path.join(scope, MANIFEST);
  plainDirectory(path.join(scope, '.agents'));
  plainDirectory(canonical);
  plainDirectory(path.join(scope, '.claude'));
  const previous = readManifest(manifestPath);
  const sources = new Map<string, Snapshot>();
  if (entry(canonical)) for (const name of readdirSync(canonical).sort()) {
    const file = path.join(canonical, name);
    const stat = lstatSync(file);
    requireThat(!stat.isSymbolicLink(), `Canonical skill bundle must be a real directory: ${file}`);
    if (!stat.isDirectory()) continue;
    skillName(name);
    const source = snapshot(file, true);
    requireThat(source.contents.has('SKILL.md'), `Canonical skill is missing SKILL.md: ${file}`);
    sources.set(name, source);
  }
  const migrateRoot = legacyLink(root, destination, canonical);
  if (!migrateRoot) plainDirectory(destination);
  const names = new Set([...sources.keys(), ...Object.keys(previous?.skills ?? {})]);
  // Legacy canonical links are owned adapters even if their old canonical skill was removed.
  if (!migrateRoot && entry(destination)) for (const name of readdirSync(destination).sort()) {
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
      && legacyLink(root, path.join(destination, name), path.join(canonical, name))) names.add(name);
  }
  const actions: Action[] = [];
  const changes: string[] = [];
  if (migrateRoot) changes.push(`${path.relative(root, destination)}: migrate canonical directory link`);
  for (const name of [...names].sort()) {
    const next = sources.get(name);
    const prior = previous && Object.hasOwn(previous.skills, name) ? previous.skills[name] : undefined;
    const file = path.join(destination, name);
    const stat = migrateRoot ? undefined : entry(file);
    const legacy = !!stat && legacyLink(root, file, path.join(canonical, name));
    if (stat && !legacy) {
      requireThat(prior, `Refusing to overwrite independently authored Claude skill: ${file}`);
      requireThat(stat.isDirectory() && !stat.isSymbolicLink(), `Generated Claude skill was locally changed: ${file}`);
      const actual = snapshot(file, false);
      requireThat(same(actual, prior), `Generated Claude skill was locally changed: ${file}`);
    }
    if (migrateRoot || legacy || !stat || !next || !prior || !same(prior, next)) {
      if (next || stat) {
        actions.push({ name, previous: prior, next, legacy, missing: !stat });
        changes.push(`${path.relative(root, file)}: ${next ? legacy ? 'migrate canonical link' : 'sync bundle' : 'remove stale generated bundle'}`);
      }
    }
  }
  if (!sources.size && !previous && !actions.length && !migrateRoot) return undefined;
  const skills = Object.fromEntries([...sources].map(([name, source]) => [name, bundle(source.files, source.directories)]));
  const manifest = JSON.stringify({ schemaVersion: 1, generatedBy: GENERATOR, skills }, null, 2) + '\n';
  if (!entry(manifestPath) || readFileSync(manifestPath, 'utf8') !== manifest) changes.push(`${path.relative(root, manifestPath)}: sync generated manifest`);
  return { scope, destination, manifestPath, manifest, migrateRoot, actions, changes };
}

function removeBundle(directory: string, previous: Bundle): void {
  // Delete only the preflighted generated files; new/unrelated content makes rmdir fail safely.
  for (const file of Object.keys(previous.files)) unlinkSync(path.join(directory, file));
  for (const folder of [...previous.directories].sort((a, b) => b.split('/').length - a.split('/').length)) rmdirSync(path.join(directory, folder));
  rmdirSync(directory);
}

/** Check without writes, or preflight every scope and export complete portable Claude copies. */
export function syncSkills(root = ROOT, check = false): SkillSyncResult {
  root = realpathSync(root);
  const registered = existsSync(path.join(root, '_config/projects.json')) ? components(root).map(item => item.path).sort() : [];
  const scopes = ['', ...registered].map(relative => realpathSync(path.join(root, relative)));
  requireThat(new Set(scopes).size === scopes.length, 'Multiple component scopes resolve to the same directory');
  const plans = scopes.map(scope => planScope(root, scope)).filter((plan): plan is Plan => !!plan);
  const changes = plans.flatMap(plan => plan.changes);
  requireThat(!check || changes.length === 0, `Skill exports are out of date:\n${changes.map(change => '- ' + change).join('\n')}`);
  if (!check) for (const plan of plans) {
    if (plan.migrateRoot) unlinkSync(plan.destination);
    for (const action of plan.actions) {
      const directory = path.join(plan.destination, action.name);
      if (action.legacy) unlinkSync(directory);
      else if (!action.missing && action.previous) removeBundle(directory, action.previous);
      if (action.next) {
        mkdirSync(directory, { recursive: true });
        for (const folder of action.next.directories) mkdirSync(path.join(directory, folder), { recursive: true });
        for (const [relative, file] of action.next.contents) {
          const target = path.join(directory, relative);
          writeFileSync(target, file.bytes, { flag: 'wx' });
          if (process.platform !== 'win32') chmodSync(target, file.mode);
        }
      }
    }
    if (plan.changes.length) {
      mkdirSync(path.dirname(plan.manifestPath), { recursive: true });
      writeFileSync(plan.manifestPath, plan.manifest);
    }
  }
  const manifests = plans.map(plan => JSON.parse(plan.manifest) as Manifest);
  return { scopes: plans.length, skills: manifests.reduce((sum, manifest) => sum + Object.keys(manifest.skills).length, 0),
    files: manifests.reduce((sum, manifest) => sum + Object.values(manifest.skills).reduce((n, item) => n + Object.keys(item.files).length, 0), 0), changes };
}
