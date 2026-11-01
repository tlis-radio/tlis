import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { ROOT, existingWithin, requireThat } from './common.ts';
import { components } from './projects.ts';

export function assertManualWorkflow(content: string, filename: string): void {
  const document = parseDocument(content, { uniqueKeys: true });
  requireThat(document.errors.length === 0, `${filename}: invalid YAML`);
  const workflow = document.toJS() as { on?: unknown; jobs?: unknown };
  requireThat(workflow && typeof workflow.on === 'object' && workflow.on !== null && !Array.isArray(workflow.on),
    `${filename}: expected on.workflow_dispatch`);
  const triggers = Object.keys(workflow.on);
  requireThat(triggers.length === 1 && triggers[0] === 'workflow_dispatch', `${filename}: automatic trigger is active`);
  requireThat(workflow.jobs && typeof workflow.jobs === 'object', `${filename}: no jobs`);
}

export function assertAgentWorkflow(directory: string): void {
  requireThat(existsSync(path.join(directory, 'CONTEXT.md')), `Workflow missing CONTEXT.md: ${directory}`);
  const stages = readdirSync(path.join(directory, 'stages'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^\d{2}_[a-z0-9_]+$/.test(entry.name));
  requireThat(stages.length > 0, `No numbered stages: ${directory}`);
  for (const stage of stages) {
    const folder = path.join(directory, 'stages', stage.name);
    requireThat(existsSync(path.join(folder, 'CONTEXT.md')), `Stage missing CONTEXT.md: ${folder}`);
    requireThat(/^## Tools\s*$/m.test(readFileSync(path.join(folder, 'CONTEXT.md'), 'utf8')), `Stage must identify useful tools: ${folder}`);
  }
}

function agentAdapters(folder: string): void {
  const canonical = path.join(folder, '.agents/skills');
  if (!existsSync(canonical)) return;
  for (const skill of readdirSync(canonical, { withFileTypes: true }).filter(d => d.isDirectory())) {
    const target = path.join(canonical, skill.name);
    requireThat(existsSync(path.join(target, 'SKILL.md')), `${skill.name}: missing SKILL.md`);
    const adapter = path.join(folder, '.claude/skills', skill.name);
    requireThat(realpathSync(adapter) === realpathSync(target), `${skill.name}: Claude skill is not linked to canonical source`);
  }
}

export function verifyArchitecture(root = ROOT): void {
  const registry = components(root);
  let workflowCount = 0;
  for (const base of ['', ...registry.map(p => p.path)]) {
    const folder = path.join(root, base);
    requireThat(readFileSync(path.join(folder, 'AGENTS.md'), 'utf8').trim().length > 0, `${base}: missing AGENTS.md`);
    requireThat(readFileSync(path.join(folder, 'CLAUDE.md'), 'utf8').trim() === '@AGENTS.md', `${base}: CLAUDE.md must only import AGENTS.md`);
    requireThat(existsSync(path.join(folder, 'CONTEXT.md')), `${base}: missing routing CONTEXT.md`);
    existingWithin(folder, 'scripts/check.ts');
    if (base) for (const file of ['README.md', 'architecture.md', 'api.md', 'configuration.md', 'development.md']) {
      requireThat(existsSync(path.join(folder, 'docs', file)), `${base}: missing reference docs/${file}`);
    }
    const directory = path.join(folder, 'workflows');
    const workflows = readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory());
    requireThat(workflows.length > 0, `${base}: no component-local workflows`);
    for (const workflow of workflows) { assertAgentWorkflow(path.join(directory, workflow.name)); workflowCount++; }
    agentAdapters(folder);
  }
  for (const group of ['projects', 'libraries']) {
    const directories = readdirSync(path.join(root, group), { withFileTypes: true }).filter(d => d.isDirectory());
    requireThat(directories.every(d => registry.some(p => p.path === `${group}/${d.name}`)), `Unregistered component in ${group}/`);
  }
  const workflowDirectory = path.join(root, '.github/workflows');
  const files = readdirSync(workflowDirectory).filter(file => /\.ya?ml$/.test(file));
  requireThat(files.length > 0, 'No manually triggered GitHub workflows');
  for (const file of files) assertManualWorkflow(readFileSync(path.join(workflowDirectory, file), 'utf8'), file);
  for (const item of registry) {
    const nested = path.join(root, item.path, '.github/workflows');
    requireThat(!existsSync(nested) || readdirSync(nested).every(file => !/\.ya?ml$/.test(file)),
      `${item.name}: keep executable GitHub workflows at the repository root`);
  }
  console.log(`PASS architecture: ${registry.length} components, ${workflowCount} context-driven workflows, ${files.length} manual Actions workflows, reference docs`);
}
