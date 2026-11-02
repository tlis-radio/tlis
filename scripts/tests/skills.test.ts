import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  rmSync, symlinkSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { git } from '../src/common.ts';
import { syncSkills } from '../src/skills.ts';

function write(root: string, relative: string, contents: string | Buffer): void {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
}
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'tlis-skills-'));
  git(root, ['init', '-b', 'dev']);
  return { root, dispose: () => rmSync(root, { recursive: true, force: true }) };
}
function source(root: string, prefix = '', text = 'Use [rules](references/rules.md).'): string {
  const relative = path.posix.join(prefix, '.agents/skills/radio-kit');
  write(root, relative + '/SKILL.md', '---\nname: radio-kit\ndescription: Prepare the radio kit.\n---\n\n' + text + '\n');
  return relative;
}
function manifest(root: string, prefix = '') {
  return JSON.parse(readFileSync(path.join(root, prefix, '.claude/skills.generated.json'), 'utf8'));
}

test('exports full bundles in root and registered scopes with byte hashes and relative references intact', () => {
  const f = fixture();
  try {
    write(f.root, '_config/projects.json', JSON.stringify({ schemaVersion: 2, projects: [
      { name: 'radio', path: 'projects/radio' }, { name: 'video', path: 'projects/video' },
    ], libraries: [] }));
    mkdirSync(path.join(f.root, 'projects/video'), { recursive: true });
    const canonical = source(f.root);
    source(f.root, 'projects/radio', 'A project-local version of the same skill.');
    const image = Buffer.from([0, 10, 128, 255]);
    write(f.root, canonical + '/assets/nested/logo.bin', image);
    write(f.root, canonical + '/references/rules.md', 'Use the local station rules.\n');
    write(f.root, canonical + '/scripts/helper.mjs', "export const station = 'TLIS';\n");
    chmodSync(path.join(f.root, canonical, 'scripts/helper.mjs'), 0o755);
    mkdirSync(path.join(f.root, canonical, 'assets/empty'));
    assert.throws(() => syncSkills(f.root, true), /out of date/);
    assert.equal(existsSync(path.join(f.root, '.claude')), false);
    const result = syncSkills(f.root);
    assert.equal(result.scopes, 2);
    assert.equal(result.skills, 2);
    const exported = path.join(f.root, '.claude/skills/radio-kit');
    assert.deepEqual(readFileSync(path.join(exported, 'assets/nested/logo.bin')), image);
    assert.equal(readFileSync(path.join(exported, 'references/rules.md'), 'utf8'), 'Use the local station rules.\n');
    assert.match(readFileSync(path.join(exported, 'SKILL.md'), 'utf8'), /references\/rules.md/);
    assert.ok(existsSync(path.join(exported, 'assets/empty')));
    assert.equal(lstatSync(exported).isSymbolicLink(), false);
    if (process.platform !== 'win32') assert.equal(lstatSync(path.join(exported, 'scripts/helper.mjs')).mode & 0o111, 0o111);
    assert.match(readFileSync(path.join(f.root, 'projects/radio/.claude/skills/radio-kit/SKILL.md'), 'utf8'), /project-local/);
    assert.equal(existsSync(path.join(f.root, 'projects/video/.claude')), false);
    const hash = createHash('sha256').update(image).digest('hex');
    assert.equal(manifest(f.root).skills['radio-kit'].files['assets/nested/logo.bin'], hash);
    const saved = readFileSync(path.join(f.root, '.claude/skills.generated.json'));
    assert.deepEqual(syncSkills(f.root, true).changes, []);
    assert.deepEqual(syncSkills(f.root).changes, []);
    assert.deepEqual(readFileSync(path.join(f.root, '.claude/skills.generated.json')), saved);
  } finally { f.dispose(); }
});

test('source changes sync only over the previous generated version, including renamed assets', () => {
  const f = fixture();
  try {
    const canonical = source(f.root);
    write(f.root, canonical + '/assets/old.txt', 'old');
    syncSkills(f.root);
    source(f.root, '', 'The revised method.');
    unlinkSync(path.join(f.root, canonical, 'assets/old.txt'));
    write(f.root, canonical + '/assets/new.txt', 'new');
    assert.throws(() => syncSkills(f.root, true), /out of date/);
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/radio-kit/assets/old.txt'), 'utf8'), 'old');
    syncSkills(f.root);
    assert.equal(existsSync(path.join(f.root, '.claude/skills/radio-kit/assets/old.txt')), false);
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/radio-kit/assets/new.txt'), 'utf8'), 'new');
    assert.match(readFileSync(path.join(f.root, '.claude/skills/radio-kit/SKILL.md'), 'utf8'), /revised/);
    assert.deepEqual(syncSkills(f.root, true).changes, []);
  } finally { f.dispose(); }
});

test('local edits, missing files, extra files, and extra directories are conflicts without writes', () => {
  for (const change of ['edit', 'missing', 'extra', 'directory']) {
    const f = fixture();
    try {
      source(f.root);
      syncSkills(f.root);
      const generated = '.claude/skills/radio-kit/';
      if (change === 'edit') write(f.root, generated + 'SKILL.md', 'local correction');
      if (change === 'missing') unlinkSync(path.join(f.root, generated, 'SKILL.md'));
      if (change === 'extra') write(f.root, generated + 'notes.md', 'local notes');
      if (change === 'directory') mkdirSync(path.join(f.root, generated, 'notes'));
      const before = readFileSync(path.join(f.root, '.claude/skills.generated.json'));
      assert.throws(() => syncSkills(f.root, true), /locally changed/);
      assert.throws(() => syncSkills(f.root), /locally changed/);
      assert.deepEqual(readFileSync(path.join(f.root, '.claude/skills.generated.json')), before);
      if (change === 'edit') assert.equal(readFileSync(path.join(f.root, generated, 'SKILL.md'), 'utf8'), 'local correction');
    } finally { f.dispose(); }
  }
});

test('all scopes are preflighted before an earlier scope is changed', () => {
  const f = fixture();
  try {
    write(f.root, '_config/projects.json', JSON.stringify({ schemaVersion: 1, projects: [{ name: 'radio', path: 'projects/radio' }] }));
    source(f.root); source(f.root, 'projects/radio');
    syncSkills(f.root);
    const before = readFileSync(path.join(f.root, '.claude/skills/radio-kit/SKILL.md'));
    const beforeManifest = readFileSync(path.join(f.root, '.claude/skills.generated.json'));
    source(f.root, '', 'New root source.');
    write(f.root, 'projects/radio/.claude/skills/radio-kit/SKILL.md', 'independent edit');
    assert.throws(() => syncSkills(f.root), /locally changed/);
    assert.deepEqual(readFileSync(path.join(f.root, '.claude/skills/radio-kit/SKILL.md')), before);
    assert.deepEqual(readFileSync(path.join(f.root, '.claude/skills.generated.json')), beforeManifest);
  } finally { f.dispose(); }
});

test('independently authored collisions are rejected even when identical, and unrelated skills survive', () => {
  const f = fixture();
  try {
    const canonical = source(f.root);
    const skill = readFileSync(path.join(f.root, canonical, 'SKILL.md'));
    write(f.root, '.claude/skills/radio-kit/SKILL.md', skill);
    write(f.root, '.claude/skills/independent/SKILL.md', 'independent method');
    assert.throws(() => syncSkills(f.root), /independently authored/);
    assert.deepEqual(readFileSync(path.join(f.root, '.claude/skills/radio-kit/SKILL.md')), skill);
    rmSync(path.join(f.root, '.claude/skills/radio-kit'), { recursive: true });
    write(f.root, '.claude/skills/README.md', 'user catalog');
    syncSkills(f.root);
    rmSync(path.join(f.root, canonical), { recursive: true });
    assert.throws(() => syncSkills(f.root, true), /out of date/);
    syncSkills(f.root);
    assert.equal(existsSync(path.join(f.root, '.claude/skills/radio-kit')), false);
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/independent/SKILL.md'), 'utf8'), 'independent method');
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/README.md'), 'utf8'), 'user catalog');
    assert.deepEqual(manifest(f.root).skills, {});
  } finally { f.dispose(); }
});

test('a wholly absent generated bundle is reported and can be recreated without overwriting files', () => {
  const f = fixture();
  try {
    source(f.root); syncSkills(f.root);
    rmSync(path.join(f.root, '.claude/skills/radio-kit'), { recursive: true });
    assert.throws(() => syncSkills(f.root, true), /out of date/);
    syncSkills(f.root);
    assert.ok(existsSync(path.join(f.root, '.claude/skills/radio-kit/SKILL.md')));
  } finally { f.dispose(); }
});

test('valid names and asset filenames cannot collide with JavaScript object properties', () => {
  const f = fixture();
  try {
    source(f.root);
    syncSkills(f.root);
    write(f.root, '.agents/skills/constructor/SKILL.md', '---\nname: constructor\ndescription: Build a concrete artifact.\n---\nBuild it.\n');
    write(f.root, '.agents/skills/constructor/__proto__', 'asset bytes');
    syncSkills(f.root);
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/constructor/__proto__'), 'utf8'), 'asset bytes');
    assert.ok(Object.hasOwn(manifest(f.root).skills.constructor.files, '__proto__'));
    assert.deepEqual(syncSkills(f.root, true).changes, []);
    write(f.root, '.claude/skills/constructor/__proto__', 'a local edit');
    assert.throws(() => syncSkills(f.root), /locally changed/);
    assert.equal(readFileSync(path.join(f.root, '.claude/skills/constructor/__proto__'), 'utf8'), 'a local edit');
  } finally { f.dispose(); }
});

test('malformed manifests reject unsafe paths, bad hashes, duplicate keys, and unknown schemas before writing', () => {
  const validHash = '0'.repeat(64);
  const bad = [
    '{not json',
    JSON.stringify({ schemaVersion: 2, generatedBy: 'tlis-skills-sync', skills: {} }),
    JSON.stringify({ schemaVersion: 1, generatedBy: 'other', skills: {} }),
    JSON.stringify({ schemaVersion: 1, generatedBy: 'tlis-skills-sync', skills: { 'radio-kit': { directories: [], files: { '../outside': validHash, 'SKILL.md': validHash } } } }),
    JSON.stringify({ schemaVersion: 1, generatedBy: 'tlis-skills-sync', skills: { 'radio-kit': { directories: [], files: { 'SKILL.md': 'bad' } } } }),
    '{"schemaVersion":1,"generatedBy":"tlis-skills-sync","skills":{},"skills":{}}',
  ];
  for (const contents of bad) {
    const f = fixture();
    try {
      source(f.root);
      write(f.root, '.claude/skills.generated.json', contents);
      assert.throws(() => syncSkills(f.root), /manifest|path|hash|Duplicate/);
      assert.equal(existsSync(path.join(f.root, '.claude/skills')), false);
      assert.equal(readFileSync(path.join(f.root, '.claude/skills.generated.json'), 'utf8'), contents);
    } finally { f.dispose(); }
  }
});

test('source links outside the bundle fail while internal assets are copied as portable files', { skip: process.platform === 'win32' }, () => {
  const f = fixture();
  try {
    const canonical = source(f.root);
    write(f.root, canonical + '/assets/original.txt', 'asset');
    symlinkSync('original.txt', path.join(f.root, canonical, 'assets/alias.txt'));
    syncSkills(f.root);
    const copied = path.join(f.root, '.claude/skills/radio-kit/assets/alias.txt');
    assert.equal(lstatSync(copied).isSymbolicLink(), false);
    assert.equal(readFileSync(copied, 'utf8'), 'asset');
    write(f.root, 'private.txt', 'outside input');
    symlinkSync(path.join(f.root, 'private.txt'), path.join(f.root, canonical, 'outside.txt'));
    assert.throws(() => syncSkills(f.root), /escapes/);
    assert.equal(existsSync(path.join(f.root, '.claude/skills/radio-kit/outside.txt')), false);
  } finally { f.dispose(); }
});

test('source directory cycles and nonportable case-colliding assets fail before export', { skip: process.platform === 'win32' }, () => {
  const f = fixture();
  try {
    const canonical = source(f.root);
    mkdirSync(path.join(f.root, canonical, 'assets'));
    symlinkSync('.', path.join(f.root, canonical, 'assets/loop'));
    assert.throws(() => syncSkills(f.root), /Cyclic/);
    unlinkSync(path.join(f.root, canonical, 'assets/loop'));
    write(f.root, canonical + '/assets/a.txt', 'one');
    write(f.root, canonical + '/assets/A.txt', 'two');
    assert.throws(() => syncSkills(f.root), /collide/);
    assert.equal(existsSync(path.join(f.root, '.claude')), false);
  } finally { f.dispose(); }
});

test('recognized old canonical links migrate without writing through to the source', { skip: process.platform === 'win32' }, () => {
  for (const form of ['bundle', 'directory', 'absolute']) {
    const f = fixture();
    try {
      const canonical = source(f.root);
      const entireDirectory = form === 'directory';
      const target = path.join(f.root, entireDirectory ? '.claude/skills' : '.claude/skills/radio-kit');
      mkdirSync(path.dirname(target), { recursive: true });
      symlinkSync(form === 'absolute' ? path.join(f.root, canonical)
        : entireDirectory ? '../.agents/skills' : '../../.agents/skills/radio-kit', target, 'dir');
      const before = readFileSync(path.join(f.root, canonical, 'SKILL.md'));
      assert.throws(() => syncSkills(f.root, true), /out of date/);
      assert.ok(lstatSync(target).isSymbolicLink());
      syncSkills(f.root);
      assert.equal(lstatSync(target).isSymbolicLink(), false);
      assert.deepEqual(readFileSync(path.join(f.root, canonical, 'SKILL.md')), before);
      assert.deepEqual(syncSkills(f.root, true).changes, []);
    } finally { f.dispose(); }
  }
});

test('Windows symlink-text migration requires index mode 120000 and the exact canonical relative target', () => {
  for (const entireDirectory of [false, true]) {
    const f = fixture();
    try {
      source(f.root);
      const file = entireDirectory ? '.claude/skills' : '.claude/skills/radio-kit';
      const target = entireDirectory ? '../.agents/skills' : '../../.agents/skills/radio-kit';
      write(f.root, file, target);
      const object = git(f.root, ['hash-object', '-w', '--', file]).toString().trim();
      git(f.root, ['update-index', '--add', '--cacheinfo', `120000,${object},${file}`]);
      syncSkills(f.root);
      assert.ok(lstatSync(path.join(f.root, file)).isDirectory());
      assert.deepEqual(syncSkills(f.root, true).changes, []);
    } finally { f.dispose(); }
  }
  for (const trackedRegularFile of [false, true]) {
    const f = fixture();
    try {
      source(f.root);
      write(f.root, '.claude/skills/radio-kit', '../../.agents/skills/radio-kit');
      if (trackedRegularFile) git(f.root, ['add', '.claude/skills/radio-kit']);
      assert.throws(() => syncSkills(f.root), /independently authored/);
      assert.ok(lstatSync(path.join(f.root, '.claude/skills/radio-kit')).isFile());
      assert.equal(existsSync(path.join(f.root, '.claude/skills.generated.json')), false);
    } finally { f.dispose(); }
  }
});

test('noncanonical destination links and modified generated links are not followed', { skip: process.platform === 'win32' }, () => {
  const f = fixture();
  try {
    source(f.root);
    write(f.root, 'independent/SKILL.md', 'independent');
    mkdirSync(path.join(f.root, '.claude/skills'), { recursive: true });
    symlinkSync('../../independent', path.join(f.root, '.claude/skills/radio-kit'), 'dir');
    assert.throws(() => syncSkills(f.root), /independently authored/);
    assert.equal(readFileSync(path.join(f.root, 'independent/SKILL.md'), 'utf8'), 'independent');
    unlinkSync(path.join(f.root, '.claude/skills/radio-kit'));
    syncSkills(f.root);
    symlinkSync('../../../independent/SKILL.md', path.join(f.root, '.claude/skills/radio-kit/local-link'));
    assert.throws(() => syncSkills(f.root), /local symlink/);
    assert.equal(readFileSync(path.join(f.root, 'independent/SKILL.md'), 'utf8'), 'independent');
  } finally { f.dispose(); }
});
