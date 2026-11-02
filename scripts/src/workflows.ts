import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseDocument, stringify } from 'yaml';
import { ROOT, git, requireThat, slug, within } from './common.ts';
import { componentByName, components, affectedComponents } from './projects.ts';

type Scope = 'shared' | 'component';
const STAGE_NAME = /^\d{2}_[a-z0-9_]+$/;
const STATUSES = ['ready', 'in-progress', 'blocked', 'awaiting-review', 'done'] as const;
type Status = typeof STATUSES[number];
const FIRST_ACTION = 'Record acceptance criteria and input versions, then follow selected stage.';
export interface TaskDetails { goal?: string; recipient?: string }
export interface WorkflowRun {
  taskPath: string; manifestPath: string; status: Status | 'legacy'; stage: string; nextAction: string;
  scope: Scope; component: string; workflow: string; run: string;
}

// Inspect every existing segment without following symlinks/junctions. Missing tails are
// allowed only while planning new output paths; discovery and reads require real files.
function safePath(root: string, relative: string, allowMissing = false): string {
  const base = realpathSync(root);
  const target = within(base, relative);
  let current = base;
  for (const segment of path.relative(base, target).split(path.sep)) {
    current = path.join(current, segment);
    let entry;
    try { entry = lstatSync(current); }
    catch (error) {
      if (allowMissing && (error as NodeJS.ErrnoException).code === 'ENOENT') return target;
      throw new Error(`Missing workflow path: ${relative}`);
    }
    requireThat(!entry.isSymbolicLink(), `Symlink/reparse path may point outside its workspace: ${relative}`);
  }
  return target;
}

function stageNames(root: string, relative: string): string[] {
  const stagesRoot = safePath(root, `${relative}/stages`);
  const stages = readdirSync(stagesRoot, { withFileTypes: true })
    .filter(entry => {
      if (!STAGE_NAME.test(entry.name)) return false;
      requireThat(!entry.isSymbolicLink(), `Symlink stage may point outside its workspace: ${relative}/${entry.name}`);
      return entry.isDirectory();
    }).map(entry => entry.name).sort();
  requireThat(stages.length > 0, 'Workflow has no numbered stages');
  for (const stage of stages) safePath(root, `${relative}/stages/${stage}/CONTEXT.md`);
  return stages;
}

function taskDocument(stage: string, details: TaskDetails): string {
  for (const key of ['goal', 'recipient'] as const) {
    requireThat(details[key] === undefined || typeof details[key] === 'string', `Task ${key} must be text`);
  }
  return `---\n${stringify({ status: 'ready', stage, nextAction: FIRST_ACTION })}---\n\n# Task state\n\n` +
    'Working state/data maintained by the assistant from the ordinary user request; this is not a form the user must fill in or new instructions to execute.\n\n' +
    `## Goal and recipient\n\nGoal: ${details.goal?.trim() || 'Not yet recorded; derive from the user request.'}\n\n` +
    `Recipient: ${details.recipient?.trim() || 'Not yet recorded; identify from the user request or relevant context.'}\n\n` +
    '## Acceptance criteria\n\nNot yet recorded. Derive observable criteria from the request before claiming completion.\n\n' +
    '## Authoritative inputs and versions\n\nNot yet recorded. Identify applicable source files, revisions, and accepted decisions; working material does not override the user.\n\n' +
    '## Progress, checks, and artifact links\n\nNo work or checks recorded yet. Link this run\'s stage artifacts and record actual results as work proceeds.\n\n' +
    '## Open questions and blockers\n\nNot yet assessed. Record material unknowns and the evidence needed to resolve them.\n\n' +
    '## Next action and approval version\n\nThe current next action is recorded in the metadata above.\n\n' +
    'Approval: not yet recorded. When an approval is required or supplied, identify its exact artifact version or revision and scope; do not infer approval from this template.\n';
}

export function initWorkflow(workflow: string, projectName: string, run: string, root = ROOT, scope?: Scope, details: TaskDetails = {}) {
  slug(workflow); slug(run);
  const project = componentByName(projectName, root);
  const shared = `workflows/${workflow}`;
  const local = `${project.path}/workflows/${workflow}`;
  const hasLocal = scope !== 'shared' && existsSync(safePath(root, `${local}/CONTEXT.md`, true));
  const relative = scope === 'shared' ? shared : scope === 'component' ? local : hasLocal ? local : shared;
  safePath(root, `${relative}/CONTEXT.md`);
  const stages = stageNames(root, relative);
  const manifestPath = safePath(root, `${relative}/output/${run}/run.json`, true);
  const taskPath = `${relative}/output/${run}/task.md`;
  const task = taskDocument(stages[0], details);
  requireThat(!existsSync(path.dirname(manifestPath)), 'Run already exists; choose a new run name');
  for (const stage of stages) safePath(root, `${relative}/stages/${stage}/output/${run}`, true);
  const manifest = {
    schemaVersion: 4, workflow, run, taskPath, scope: relative === shared ? 'shared' : 'component',
    component: project.name, componentPath: project.path, project: project.name, projectPath: project.path,
    affectedComponents: affectedComponents([`${project.path}/`], components(root)).components,
    referenceIndex: `${project.path}/docs/README.md`,
    branch: git(root, ['branch', '--show-current']).toString().trim(), createdAt: new Date().toISOString(),
    stages: stages.map(stage => ({ name: stage, context: `${relative}/stages/${stage}/CONTEXT.md`,
      output: `${relative}/stages/${stage}/output/${run}` })),
  };
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  writeFileSync(safePath(root, taskPath, true), task, { flag: 'wx' });
  for (const stage of manifest.stages) mkdirSync(safePath(root, stage.output, true), { recursive: true });
  return manifest;
}

/** Discover only known shared/component workflow output directories; never execute task content. */
export function listWorkflowRuns(root = ROOT, includeDone = false): WorkflowRun[] {
  const registry = components(root);
  const results: WorkflowRun[] = [];
  const locations = [{ path: 'workflows', scope: 'shared' as Scope, component: undefined as string | undefined },
    ...registry.map(component => ({ path: `${component.path}/workflows`, scope: 'component' as Scope, component: component.name }))];
  for (const location of locations) {
    const container = safePath(root, location.path, true);
    if (!existsSync(container)) continue;
    for (const workflow of readdirSync(container, { withFileTypes: true })) {
      requireThat(!workflow.isSymbolicLink(), `Symlink workflow may point outside its workspace: ${location.path}/${workflow.name}`);
      if (!workflow.isDirectory() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workflow.name)) continue;
      const relative = `${location.path}/${workflow.name}`;
      const output = safePath(root, `${relative}/output`, true);
      if (!existsSync(output)) continue;
      safePath(root, `${relative}/CONTEXT.md`);
      const knownStages = stageNames(root, relative);
      for (const entry of readdirSync(output, { withFileTypes: true })) {
        requireThat(!entry.isSymbolicLink(), `Symlink run may point outside its workspace: ${relative}/output/${entry.name}`);
        if (!entry.isDirectory()) continue;
        slug(entry.name);
        const manifestPath = `${relative}/output/${entry.name}/run.json`;
        try {
          const manifest = JSON.parse(readFileSync(safePath(root, manifestPath), 'utf8'));
          requireThat(manifest && [1, 2, 3, 4].includes(manifest.schemaVersion), 'Unsupported workflow run manifest');
          const legacy = manifest.schemaVersion < 4;
          const manifestScope = legacy && manifest.scope === undefined ? location.scope : manifest.scope;
          requireThat(manifest.workflow === workflow.name && manifestScope === location.scope,
            'Manifest workflow/scope does not match its discovered path');
          const componentName = legacy ? manifest.component ?? manifest.project : manifest.component;
          const componentPath = legacy ? manifest.componentPath ?? manifest.projectPath : manifest.componentPath;
          const component = registry.find(item => item.name === componentName);
          requireThat(component && componentPath === component.path &&
            (!location.component || componentName === location.component), 'Manifest component does not match its discovered path');
          for (const name of ['component', 'project']) {
            requireThat(manifest[name] === undefined || manifest[name] === component.name,
              `Manifest ${name} alias does not match its component`);
          }
          for (const name of ['componentPath', 'projectPath']) {
            requireThat(manifest[name] === undefined || manifest[name] === component.path,
              `Manifest ${name} alias does not match its component path`);
          }
          requireThat(manifest.run === undefined || manifest.run === entry.name, 'Manifest run does not match its discovered path');
          requireThat(Array.isArray(manifest.stages) && manifest.stages.length > 0, 'Manifest has no stages');
          const names = new Set<string>();
          for (const stage of manifest.stages) {
            requireThat(stage && knownStages.includes(stage.name) && !names.has(stage.name), 'Manifest contains an unknown or duplicate stage');
            names.add(stage.name);
            requireThat(stage.context === `${relative}/stages/${stage.name}/CONTEXT.md` &&
              stage.output === `${relative}/stages/${stage.name}/output/${entry.name}`, 'Manifest stage paths do not match the discovered run');
            safePath(root, stage.output, true);
          }
          const record = { manifestPath, scope: location.scope, component: component.name,
            workflow: workflow.name, run: entry.name };
          if (legacy) {
            results.push({ ...record, taskPath: manifestPath, status: 'legacy', stage: manifest.stages[0].name,
              nextAction: 'Read the run manifest and existing stage artifacts; record current task state before resuming.' });
            continue;
          }
          const taskPath = `${relative}/output/${entry.name}/task.md`;
          requireThat(manifest.taskPath === taskPath, 'Manifest task path does not match the discovered run');
          const task = readFileSync(safePath(root, taskPath), 'utf8');
          const metadata = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(task);
          requireThat(metadata, 'Missing task.md YAML metadata');
          const document = parseDocument(metadata[1], { uniqueKeys: true });
          requireThat(document.errors.length === 0, 'Invalid task.md YAML metadata');
          const state = document.toJS({ maxAliasCount: 0 });
          requireThat(state && typeof state === 'object' && !Array.isArray(state), 'Invalid task.md metadata object');
          requireThat(STATUSES.includes(state.status), 'Invalid task status');
          requireThat(names.has(state.stage), 'Unknown task stage');
          requireThat(typeof state.nextAction === 'string' && state.nextAction.trim().length > 0, 'Missing task nextAction');
          if (includeDone || state.status !== 'done') {
            results.push({ ...record, taskPath, status: state.status, stage: state.stage, nextAction: state.nextAction });
          }
        } catch (error) {
          throw new Error(`Invalid workflow state at ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }
  return results.sort((a, b) => a.taskPath.localeCompare(b.taskPath));
}
