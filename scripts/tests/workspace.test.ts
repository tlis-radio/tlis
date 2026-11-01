import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { affectedProjects, affectedComponents, validateComponents, changes, type Component } from '../src/projects.ts';
import { createFeature } from '../src/branches.ts';
import { assertManualWorkflow, assertAgentWorkflow } from '../src/architecture.ts';
import { git, slug, within } from '../src/common.ts';
import { initWorkflow } from '../src/workflows.ts';

const registry = [{ name: 'radio', path: 'projects/radio' }, { name: 'video', path: 'projects/video' }];
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'tlis-tools-'));
  git(root, ['init', '-b', 'dev']);
  git(root, ['config', 'user.name', 'Tool Test']);
  git(root, ['config', 'user.email', 'tool-test@example.invalid']);
  mkdirSync(path.join(root, '_config'));
  writeFileSync(path.join(root, '_config/projects.json'), JSON.stringify({ schemaVersion: 1, projects: registry }));
  for (const project of registry) mkdirSync(path.join(root, project.path), { recursive: true });
  writeFileSync(path.join(root, 'README.md'), 'fixture');
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'fixture']);
  return { root, dispose: () => rmSync(root, { recursive: true, force: true }) };
}

test('project changes scope leaf changes and include every project for shared tools', () => {
  assert.deepEqual(affectedProjects(['projects/video/src/main.ts'], registry), { projects: ['video'], sharedPaths: [] });
  assert.deepEqual(affectedProjects(['tools/src/cli.ts'], registry), { projects: ['radio', 'video'], sharedPaths: ['tools/src/cli.ts'] });
  assert.deepEqual(affectedProjects(['projects/videography/file.ts'], registry).projects, ['radio', 'video']);
});

test('real cross-project rename selects both projects including filenames with spaces', () => {
  const f = fixture();
  try {
    writeFileSync(path.join(f.root, 'projects/radio/old file.txt'), 'same payload');
    git(f.root, ['add', '.']); git(f.root, ['commit', '-m', 'source']);
    const before = git(f.root, ['rev-parse', 'HEAD']).toString().trim();
    git(f.root, ['mv', 'projects/radio/old file.txt', 'projects/video/new file.txt']);
    git(f.root, ['commit', '-m', 'move']);
    const result = changes(before, 'HEAD', f.root);
    assert.deepEqual(result.projects, ['radio', 'video']);
    assert.deepEqual(result.files.sort(), ['projects/radio/old file.txt', 'projects/video/new file.txt']);
    assert.throws(() => changes('--output=/tmp/unexpected', 'HEAD', f.root));
  } finally { f.dispose(); }
});

test('feature branch creation rejects dirty work and main, then branches from dev', () => {
  const f = fixture();
  try {
    git(f.root, ['switch', '-c', 'main']);
    assert.throws(() => createFeature('calendar', f.root), /from dev/);
    git(f.root, ['switch', 'dev']);
    writeFileSync(path.join(f.root, 'dirty.txt'), 'pending');
    assert.throws(() => createFeature('calendar', f.root), /stash/);
    rmSync(path.join(f.root, 'dirty.txt'));
    assert.equal(createFeature('calendar', f.root), 'feature/calendar');
    assert.equal(git(f.root, ['branch', '--show-current']).toString().trim(), 'feature/calendar');
  } finally { f.dispose(); }
});

test('names and paths reject traversal, absolute input, and shell-like branch names', () => {
  for (const value of ['../escape', 'a/b', 'a;touch file', '--help', '', 'A-B', 'a--b']) assert.throws(() => slug(value));
  assert.equal(slug('calendar-v2'), 'calendar-v2');
  assert.throws(() => within('/workspace', '../outside'));
  assert.throws(() => within('/workspace', '/outside'));
});

test('workflow initialization creates isolated stage outputs and preserves an existing run', () => {
  const f = fixture();
  try {
    const workflow = path.join(f.root, 'workflows/change');
    mkdirSync(workflow, { recursive: true });
    writeFileSync(path.join(workflow, 'CONTEXT.md'), 'routing');
    for (const stage of ['02_plan', '01_scope']) {
      mkdirSync(path.join(workflow, 'stages', stage), { recursive: true });
      writeFileSync(path.join(workflow, 'stages', stage, 'CONTEXT.md'), 'contract');
    }
    const run = initWorkflow('change', 'radio', 'calendar-v1', f.root);
    assert.deepEqual(run.stages.map(stage => stage.name), ['01_scope', '02_plan']);
    for (const stage of run.stages) assert.ok(existsSync(path.join(f.root, stage.output)));
    const saved = readFileSync(path.join(workflow, 'output/calendar-v1/run.json'), 'utf8');
    assert.throws(() => initWorkflow('change', 'radio', 'calendar-v1', f.root), /already exists/);
    assert.equal(readFileSync(path.join(workflow, 'output/calendar-v1/run.json'), 'utf8'), saved);
    assert.throws(() => initWorkflow('change', 'radio', '../outside', f.root));
  } finally { f.dispose(); }
});

test('workflow initialization rejects output symlinks outside its stage', () => {
  const f = fixture();
  const external = mkdtempSync(path.join(tmpdir(), 'tlis-external-'));
  try {
    const workflow = path.join(f.root, 'workflows/change');
    const stage = path.join(workflow, 'stages/01_scope');
    mkdirSync(stage, { recursive: true });
    writeFileSync(path.join(workflow, 'CONTEXT.md'), 'routing');
    writeFileSync(path.join(stage, 'CONTEXT.md'), 'contract');
    symlinkSync(external, path.join(stage, 'output'), 'dir');
    assert.throws(() => initWorkflow('change', 'radio', 'escape', f.root), /outside/);
    assert.ok(!existsSync(path.join(external, 'escape')));
  } finally { f.dispose(); rmSync(external, { recursive: true, force: true }); }
});

test('manual workflow validation parses YAML instead of matching trigger comments', () => {
  assert.doesNotThrow(() => assertManualWorkflow('on:\n  workflow_dispatch:\n  # push:\n  #   paths: [projects/video/**]\njobs:\n  verify: {}\n', 'manual.yml'));
  for (const on of ['on: push', 'on: [workflow_dispatch, push]', 'on:\n  workflow_dispatch:\n  push:', 'on:\n  workflow_dispatch:\n  schedule:\n    - cron: "0 * * * *"', 'on:\n  workflow_dispatch:\n  workflow_dispatch:']) {
    assert.throws(() => assertManualWorkflow(on + '\njobs: { verify: {} }\n', 'bad.yml'));
  }
});

test('library impact follows consumers transitively while unrelated projects remain isolated', () => {
  const graph: Component[] = [
    { name: 'contracts', path: 'libraries/contracts', kind: 'library', dependsOn: [] },
    { name: 'api', path: 'libraries/api', kind: 'library', dependsOn: ['contracts'] },
    { name: 'web', path: 'projects/web', kind: 'project', dependsOn: ['api'] },
    { name: 'radio', path: 'projects/radio', kind: 'project', dependsOn: [] },
  ];
  validateComponents(graph);
  assert.deepEqual(affectedComponents(['libraries/contracts/src/index.ts'], graph).components, ['contracts', 'api', 'web']);
  assert.deepEqual(affectedComponents(['projects/radio/compose.yaml'], graph).components, ['radio']);
  assert.deepEqual(affectedComponents(['scripts/src/cli.ts'], graph).components, ['contracts', 'api', 'web', 'radio']);
  assert.throws(() => validateComponents([{ ...graph[0], dependsOn: ['unknown'] }]), /Unknown/);
  assert.throws(() => validateComponents([{ ...graph[0], dependsOn: ['api'] }, graph[1]]), /cycle/);
});

test('component-local workflows take precedence and shared scope stays explicit', () => {
  const f = fixture();
  try {
    for (const prefix of ['workflows/change', 'projects/radio/workflows/change']) {
      const folder = path.join(f.root, prefix);
      mkdirSync(path.join(folder, 'stages/01_scope'), { recursive: true });
      writeFileSync(path.join(folder, 'CONTEXT.md'), prefix);
      writeFileSync(path.join(folder, 'stages/01_scope/CONTEXT.md'), 'contract');
    }
    const local = initWorkflow('change', 'radio', 'local-run', f.root);
    assert.equal(local.scope, 'component');
    assert.equal(local.stages[0].context, 'projects/radio/workflows/change/stages/01_scope/CONTEXT.md');
    const shared = initWorkflow('change', 'radio', 'shared-run', f.root, 'shared');
    assert.equal(shared.scope, 'shared');
  } finally { f.dispose(); }
});

test('workflow context is sufficient without prompt templates or a custom tool catalog', () => {
  const f = fixture();
  try {
    const folder = path.join(f.root, 'workflows/change');
    const stage = path.join(folder, 'stages/01_scope');
    mkdirSync(stage, { recursive: true });
    for (const directory of [folder, stage]) {
      writeFileSync(path.join(directory, 'CONTEXT.md'), '## Tools\nUse file search and the existing project check script.\n');
    }
    assert.doesNotThrow(() => assertAgentWorkflow(folder));
    rmSync(path.join(stage, 'CONTEXT.md'));
    assert.throws(() => assertAgentWorkflow(folder), /CONTEXT.md/);
  } finally { f.dispose(); }
});
