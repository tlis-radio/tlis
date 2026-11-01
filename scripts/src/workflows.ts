import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, existingWithin, git, requireThat, slug, within } from './common.ts';
import { componentByName, components, affectedComponents } from './projects.ts';

export function initWorkflow(workflow: string, projectName: string, run: string, root = ROOT, scope?: 'shared' | 'component') {
  slug(workflow); slug(run);
  const project = componentByName(projectName, root);
  const shared = `workflows/${workflow}`;
  const local = `${project.path}/workflows/${workflow}`;
  const hasLocal = existsSync(path.join(root, local, 'CONTEXT.md'));
  const relative = scope === 'shared' ? shared : scope === 'component' ? local : hasLocal ? local : shared;
  const directory = existingWithin(root, relative);
  existingWithin(directory, 'CONTEXT.md');
  const stagesRoot = existingWithin(directory, 'stages');
  const stages = readdirSync(stagesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^\d{2}_[a-z0-9_]+$/.test(entry.name))
    .map(entry => entry.name).sort();
  requireThat(stages.length > 0, 'Workflow has no numbered stages');
  for (const stage of stages) existingWithin(stagesRoot, `${stage}/CONTEXT.md`);
  const manifestPath = within(directory, `output/${run}/run.json`);
  requireThat(!existsSync(path.dirname(manifestPath)), 'Run already exists; choose a new run name');
  // Resolve existing ancestors before writing to prevent an output symlink escaping the workspace.
  for (const base of [directory, ...stages.map(stage => path.join(stagesRoot, stage))]) {
    if (existsSync(path.join(base, 'output'))) existingWithin(base, 'output');
  }
  const manifest = {
    schemaVersion: 2, workflow, scope: relative === shared ? 'shared' : 'component',
    component: project.name, componentPath: project.path, project: project.name, projectPath: project.path,
    affectedComponents: affectedComponents([`${project.path}/`], components(root)).components,
    referenceIndex: `${project.path}/docs/README.md`,
    tools: `${relative}/tools`,
    branch: git(root, ['branch', '--show-current']).toString().trim(), createdAt: new Date().toISOString(),
    stages: stages.map(stage => ({ name: stage, context: `${relative}/stages/${stage}/CONTEXT.md`,
      prompt: `${relative}/stages/${stage}/prompt.md`, tools: `${relative}/stages/${stage}/tools`,
      output: `${relative}/stages/${stage}/output/${run}` })),
  };
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const stage of manifest.stages) mkdirSync(within(root, stage.output), { recursive: true });
  return manifest;
}
