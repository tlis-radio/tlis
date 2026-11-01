import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { ROOT, existingWithin, requireThat } from './common.ts';
import { projects } from './projects.ts';

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

export function verifyArchitecture(root = ROOT): void {
  const registry = projects(root);
  for (const base of ['', ...registry.map(p => p.path)]) {
    const folder = path.join(root, base);
    requireThat(readFileSync(path.join(folder, 'AGENTS.md'), 'utf8').trim().length > 0, `${base}: missing AGENTS.md`);
    requireThat(readFileSync(path.join(folder, 'CLAUDE.md'), 'utf8').trim() === '@AGENTS.md', `${base}: CLAUDE.md must only import AGENTS.md`);
    requireThat(existsSync(path.join(folder, 'CONTEXT.md')), `${base}: missing routing CONTEXT.md`);
    existingWithin(folder, 'tools/check.ts');
  }
  // Root tooling entry differs from project check wrappers.
  const projectDirectories = readdirSync(path.join(root, 'projects'), { withFileTypes: true }).filter(d => d.isDirectory());
  requireThat(projectDirectories.every(d => registry.some(p => p.name === d.name)), 'Unregistered project directory');
  const workflowDirectory = path.join(root, '.github/workflows');
  const files = readdirSync(workflowDirectory).filter(file => /\.ya?ml$/.test(file));
  requireThat(files.length > 0, 'No manually triggered GitHub workflows');
  for (const file of files) assertManualWorkflow(readFileSync(path.join(workflowDirectory, file), 'utf8'), file);
  for (const project of registry) {
    const nested = path.join(root, project.path, '.github/workflows');
    requireThat(!existsSync(nested) || readdirSync(nested).every(file => !/\.ya?ml$/.test(file)),
      `${project.name}: keep executable GitHub workflows at the repository root`);
  }
  const canonical = path.join(root, '.agents/skills');
  for (const skill of readdirSync(canonical, { withFileTypes: true }).filter(d => d.isDirectory())) {
    const target = path.join(canonical, skill.name);
    requireThat(existsSync(path.join(target, 'SKILL.md')), `${skill.name}: missing SKILL.md`);
    const adapter = path.join(root, '.claude/skills', skill.name);
    requireThat(realpathSync(adapter) === realpathSync(target), `${skill.name}: Claude skill is not linked to canonical source`);
  }
  console.log(`PASS architecture: ${registry.length} projects, ${files.length} manual workflows, shared agent adapters`);
}
