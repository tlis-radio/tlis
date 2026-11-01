import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, existingWithin, git, requireThat, slug, within } from './common.ts';
import { projectByName } from './projects.ts';

export function initWorkflow(workflow: string, projectName: string, run: string, root = ROOT) {
  slug(workflow); slug(run);
  const project = projectByName(projectName, root);
  const shared = `workflows/${workflow}`;
  const local = `${project.path}/workflows/${workflow}`;
  const relative = existsSync(path.join(root, shared, 'CONTEXT.md')) ? shared : local;
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
    schemaVersion: 1, workflow, project: project.name, projectPath: project.path,
    branch: git(root, ['branch', '--show-current']).toString().trim(), createdAt: new Date().toISOString(),
    stages: stages.map(stage => ({ name: stage, context: `${relative}/stages/${stage}/CONTEXT.md`,
      output: `${relative}/stages/${stage}/output/${run}` })),
  };
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const stage of manifest.stages) mkdirSync(within(root, stage.output), { recursive: true });
  return manifest;
}
