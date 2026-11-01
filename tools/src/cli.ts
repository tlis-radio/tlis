import { ROOT, requireThat } from './common.ts';
import { createFeature } from './branches.ts';
import { changes, projectCheck, projects } from './projects.ts';
import { initWorkflow } from './workflows.ts';
import { verifyHistory } from './history.ts';
import { verifyArchitecture } from './architecture.ts';

const args = process.argv.slice(2);
const [command, action] = args;
function option(name: string, fallback?: string): string {
  const index = args.indexOf(`--${name}`);
  const value = index >= 0 ? args[index + 1] : fallback;
  requireThat(value && !value.startsWith('--'), `Missing --${name}`);
  return value;
}

try {
  if (command === 'projects' && action === 'list') console.log(JSON.stringify(projects(), null, 2));
  else if (command === 'project' && action === 'check') projectCheck(option('project'));
  else if (command === 'changes') console.log(JSON.stringify(changes(option('base', 'dev'), option('head', 'HEAD')), null, 2));
  else if (command === 'workflow' && action === 'init') console.log(JSON.stringify(initWorkflow(option('workflow'), option('project'), option('run')), null, 2));
  else if (command === 'branch' && action === 'feature') console.log(createFeature(option('name')));
  else if (command === 'history' && action === 'verify') verifyHistory();
  else if (command === 'architecture' && action === 'check') verifyArchitecture();
  else {
    console.log(`TLIS tools (Node 24, run npm ci first)\n\nprojects list\nproject check --project <name>\nchanges --base <ref> --head <ref>\nworkflow init --workflow <name> --project <name> --run <slug>\nbranch feature --name <slug>\narchitecture check\nhistory verify\n\nRepository: ${ROOT}`);
    if (command && command !== 'help') process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
