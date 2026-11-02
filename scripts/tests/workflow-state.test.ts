import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parseDocument, stringify } from 'yaml';
import { git } from '../src/common.ts';
import { initWorkflow, listWorkflowRuns } from '../src/workflows.ts';
import { linkDirectory } from './directory-link.ts';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'tlis-task-state-'));
  git(root, ['init', '-b', 'dev']);
  git(root, ['config', 'user.name', 'Task State Test']);
  git(root, ['config', 'user.email', 'task-test@example.invalid']);
  mkdirSync(path.join(root, '_config'));
  const projects = ['radio', 'video'].map(name => ({ name, path: `projects/${name}` }));
  writeFileSync(path.join(root, '_config/projects.json'), JSON.stringify({ schemaVersion: 1, projects }));
  for (const component of projects) mkdirSync(path.join(root, component.path), { recursive: true });
  writeFileSync(path.join(root, 'README.md'), 'fixture');
  git(root, ['add', '.']); git(root, ['commit', '-m', 'fixture']);
  function workflow(relative: string) {
    const directory = path.join(root, relative);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, 'CONTEXT.md'), 'workflow contract');
    for (const stage of ['01_scope', '02_plan']) {
      mkdirSync(path.join(directory, 'stages', stage), { recursive: true });
      writeFileSync(path.join(directory, 'stages', stage, 'CONTEXT.md'), stage + ' contract');
    }
  }
  workflow('workflows/change');
  return { root, workflow, dispose: () => rmSync(root, { recursive: true, force: true }) };
}

function updateState(root: string, taskPath: string, changes: Record<string, unknown>) {
  const filename = path.join(root, taskPath);
  const task = readFileSync(filename, 'utf8');
  const metadata = /^---\n([\s\S]*?)\n---\n/.exec(task)!;
  const current = parseDocument(metadata[1]).toJS();
  writeFileSync(filename, task.replace(metadata[0], `---\n${stringify({ ...current, ...changes })}---\n`));
}

test('initialization records resumable state from an ordinary request without inventing criteria', () => {
  const f = fixture();
  try {
    const run = initWorkflow('change', 'radio', 'calendar-fix', f.root, 'shared', {
      goal: 'Correct the upcoming-show calendar date.', recipient: 'TLIS editors',
    });
    assert.equal(run.schemaVersion, 4);
    assert.equal(run.taskPath, 'workflows/change/output/calendar-fix/task.md');
    const task = readFileSync(path.join(f.root, run.taskPath), 'utf8');
    assert.match(task, /Correct the upcoming-show calendar date/);
    assert.match(task, /TLIS editors/);
    assert.match(task, /Acceptance criteria\n\nNot yet recorded/);
    assert.match(task, /not a form the user must fill in/);
    const resumed = listWorkflowRuns(f.root);
    assert.equal(resumed.length, 1);
    assert.deepEqual(resumed[0], {
      taskPath: run.taskPath, manifestPath: 'workflows/change/output/calendar-fix/run.json',
      status: 'ready', stage: '01_scope',
      nextAction: 'Record acceptance criteria and input versions, then follow selected stage.',
      scope: 'shared', component: 'radio', workflow: 'change', run: 'calendar-fix',
    });
    assert.equal(readFileSync(path.join(f.root, run.taskPath), 'utf8'), task);
    assert.throws(() => initWorkflow('change', 'radio', 'calendar-fix', f.root), /already exists/);
  } finally { f.dispose(); }
});

test('same-named component tasks remain isolated and discovery ignores unrelated artifacts', () => {
  const f = fixture();
  try {
    for (const name of ['radio', 'video']) f.workflow(`projects/${name}/workflows/change`);
    const radio = initWorkflow('change', 'radio', 'same-run', f.root);
    const video = initWorkflow('change', 'video', 'same-run', f.root);
    updateState(f.root, radio.taskPath, { status: 'blocked', nextAction: 'Identify the accepted feed revision.' });
    updateState(f.root, video.taskPath, { status: 'awaiting-review', stage: '02_plan', nextAction: 'Review plan.md at commit abc123.' });
    const unrelated = path.join(f.root, 'scratch/output/same-run');
    mkdirSync(unrelated, { recursive: true });
    writeFileSync(path.join(unrelated, 'task.md'), 'invalid state outside workflow discovery');
    writeFileSync(path.join(f.root, radio.stages[0].output, 'task.md'), 'another artifact, not the task state');
    const tasks = listWorkflowRuns(f.root);
    assert.equal(tasks.length, 2);
    assert.deepEqual(tasks.map(task => [task.component, task.scope, task.status]), [
      ['radio', 'component', 'blocked'], ['video', 'component', 'awaiting-review'],
    ]);
    assert.notEqual(tasks[0].taskPath, tasks[1].taskPath);
    assert.equal(tasks[1].nextAction, 'Review plan.md at commit abc123.');
  } finally { f.dispose(); }
});

test('done tasks are hidden by default while all known unfinished statuses remain resumable', () => {
  const f = fixture();
  try {
    const finished = initWorkflow('change', 'radio', 'finished', f.root);
    const active = initWorkflow('change', 'video', 'active', f.root);
    updateState(f.root, finished.taskPath, { status: 'done', nextAction: 'No remaining action.' });
    updateState(f.root, active.taskPath, { status: 'in-progress', stage: '02_plan', nextAction: 'Finish the accepted plan.' });
    assert.deepEqual(listWorkflowRuns(f.root).map(task => task.run), ['active']);
    assert.deepEqual(listWorkflowRuns(f.root, true).map(task => task.run), ['active', 'finished']);
  } finally { f.dispose(); }
});

test('missing and malformed task state fails clearly instead of silently disappearing', () => {
  const f = fixture();
  try {
    const run = initWorkflow('change', 'radio', 'broken', f.root);
    const filename = path.join(f.root, run.taskPath);
    const original = readFileSync(filename, 'utf8');
    rmSync(filename);
    assert.throws(() => listWorkflowRuns(f.root), /Invalid workflow state.*task\.md/);
    for (const state of [
      'no frontmatter',
      '---\nstatus: [broken\n---\n',
      '---\nstatus: ready\nstatus: done\nstage: 01_scope\nnextAction: Continue\n---\n',
    ]) {
      writeFileSync(filename, state);
      assert.throws(() => listWorkflowRuns(f.root), /task\.md YAML metadata/);
    }
    for (const change of [{ status: 'mystery' }, { stage: '99_unknown' }, { nextAction: 42 }, { nextAction: '' }]) {
      writeFileSync(filename, original);
      updateState(f.root, run.taskPath, change);
      assert.throws(() => listWorkflowRuns(f.root), /Invalid task status|Unknown task stage|Missing task nextAction/);
    }
  } finally { f.dispose(); }
});

test('schema v1, v2, and v3 runs remain discoverable as untouched legacy state', () => {
  const f = fixture();
  try {
    const originals: { manifestPath: string; taskPath: string; serialized: string }[] = [];
    for (const schemaVersion of [1, 2, 3]) {
      const run = initWorkflow('change', 'radio', `legacy-v${schemaVersion}`, f.root);
      const manifestPath = path.join(f.root, `workflows/change/output/legacy-v${schemaVersion}/run.json`);
      // V1 mirrors the preserved agentic-rebuild manifest's exact field structure.
      const v1 = { schemaVersion, workflow: run.workflow, project: run.project, projectPath: run.projectPath,
        branch: run.branch, createdAt: run.createdAt, stages: run.stages };
      const v2 = { ...v1, component: run.component, componentPath: run.componentPath, scope: run.scope,
        prompt: 'workflows/change/prompt.md', tools: ['file-search'],
        stages: run.stages.map(stage => ({ ...stage, prompt: stage.context.replace('CONTEXT.md', 'prompt.md') })) };
      const legacy: any = schemaVersion === 1 ? v1 : schemaVersion === 2 ? v2 : { ...run, schemaVersion };
      delete legacy.taskPath; delete legacy.run;
      const serialized = JSON.stringify(legacy, null, 2) + '\n';
      writeFileSync(manifestPath, serialized);
      const taskPath = path.join(f.root, run.taskPath);
      rmSync(taskPath);
      originals.push({ manifestPath, taskPath, serialized });
    }
    const tasks = listWorkflowRuns(f.root);
    assert.deepEqual(tasks.map(task => task.run), ['legacy-v1', 'legacy-v2', 'legacy-v3']);
    for (const task of tasks) {
      assert.equal(task.status, 'legacy');
      assert.equal(task.taskPath, task.manifestPath);
      assert.equal(task.scope, 'shared');
      assert.equal(task.component, 'radio');
      assert.match(task.nextAction, /existing stage artifacts/);
    }
    for (const original of originals) {
      assert.equal(readFileSync(original.manifestPath, 'utf8'), original.serialized);
      assert.ok(!existsSync(original.taskPath));
    }
  } finally { f.dispose(); }
});

test('legacy project aliases infer local scope but cannot claim another component or escaping stage', () => {
  const f = fixture();
  try {
    f.workflow('projects/radio/workflows/change');
    const run = initWorkflow('change', 'radio', 'old-local', f.root);
    const manifestPath = path.join(f.root, 'projects/radio/workflows/change/output/old-local/run.json');
    const legacy = { schemaVersion: 1, workflow: run.workflow, project: run.project, projectPath: run.projectPath,
      branch: run.branch, createdAt: run.createdAt, stages: run.stages };
    rmSync(path.join(f.root, run.taskPath));
    writeFileSync(manifestPath, JSON.stringify(legacy));
    assert.equal(listWorkflowRuns(f.root)[0].scope, 'component');
    for (const changed of [
      { ...legacy, project: 'video', projectPath: 'projects/video' },
      { ...legacy, schemaVersion: 2, component: 'radio', componentPath: 'projects/radio', project: 'video' },
      { ...legacy, stages: [{ ...legacy.stages[0], output: '../../../outside' }] },
    ]) {
      writeFileSync(manifestPath, JSON.stringify(changed));
      assert.throws(() => listWorkflowRuns(f.root), /does not match|do not match/);
    }
  } finally { f.dispose(); }
});

test('discovery rejects manifests claiming another component, run, or stage path', () => {
  const f = fixture();
  try {
    f.workflow('projects/radio/workflows/change');
    const run = initWorkflow('change', 'radio', 'owned-run', f.root);
    const manifestPath = path.join(f.root, 'projects/radio/workflows/change/output/owned-run/run.json');
    const original = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const cases = [
      { ...original, component: 'video', componentPath: 'projects/video' },
      { ...original, run: 'another-run' },
      { ...original, taskPath: 'projects/video/workflows/change/output/owned-run/task.md' },
      { ...original, stages: [{ ...original.stages[0], context: '../../../outside.md' }] },
      { ...original, stages: [{ ...original.stages[0], name: '99_unknown' }] },
    ];
    for (const changed of cases) {
      writeFileSync(manifestPath, JSON.stringify(changed));
      assert.throws(() => listWorkflowRuns(f.root), /does not match|do not match|unknown or duplicate stage/);
    }
    writeFileSync(manifestPath, JSON.stringify(original));
    assert.equal(listWorkflowRuns(f.root)[0].taskPath, run.taskPath);
  } finally { f.dispose(); }
});

test('initialization rejects linked output directories before writing outside the workspace', () => {
  const f = fixture();
  const outside = mkdtempSync(path.join(tmpdir(), 'tlis-task-external-'));
  try {
    linkDirectory(outside, path.join(f.root, 'workflows/change/output'));
    assert.throws(() => initWorkflow('change', 'radio', 'escape', f.root), /Symlink.*outside/);
    assert.ok(!existsSync(path.join(outside, 'escape')));
  } finally { f.dispose(); rmSync(outside, { recursive: true, force: true }); }
});

test('discovery rejects linked task directories without following their content', () => {
  const f = fixture();
  const outside = mkdtempSync(path.join(tmpdir(), 'tlis-task-external-'));
  try {
    const run = initWorkflow('change', 'radio', 'safe-run', f.root);
    const externalTask = path.join(outside, 'task.md');
    const filename = path.join(f.root, run.taskPath);
    const task = readFileSync(filename, 'utf8');
    writeFileSync(externalTask, task);
    const taskDirectory = path.dirname(filename);
    rmSync(taskDirectory, { recursive: true });
    linkDirectory(outside, taskDirectory);
    assert.throws(() => listWorkflowRuns(f.root), /Symlink.*outside/);
    assert.equal(readFileSync(externalTask, 'utf8'), task);
  } finally { f.dispose(); rmSync(outside, { recursive: true, force: true }); }
});

test('discovery rejects linked workflow directories without following their content', () => {
  const f = fixture();
  const outside = mkdtempSync(path.join(tmpdir(), 'tlis-task-external-'));
  try {
    const externalTask = path.join(outside, 'task.md');
    writeFileSync(externalTask, 'outside task');
    linkDirectory(outside, path.join(f.root, 'workflows/linked'));
    assert.throws(() => listWorkflowRuns(f.root), /Symlink workflow.*outside/);
    assert.equal(readFileSync(externalTask, 'utf8'), 'outside task');
  } finally { f.dispose(); rmSync(outside, { recursive: true, force: true }); }
});
