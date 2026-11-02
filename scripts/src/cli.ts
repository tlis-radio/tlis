import { ROOT, requireThat } from './common.ts';
import { createFeature } from './branches.ts';
import { changes, componentCheck, components, projects } from './projects.ts';
import { initWorkflow, listWorkflowRuns } from './workflows.ts';
import { syncSkills } from './skills.ts';
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

function componentOption(): string {
  return args.includes('--component') ? option('component') : option('project');
}

try {
  if (command === 'projects' && action === 'list') console.log(JSON.stringify(projects(), null, 2));
  else if (command === 'components' && action === 'list') console.log(JSON.stringify(components(), null, 2));
  else if (['project', 'component'].includes(command) && action === 'check') componentCheck(componentOption());
  else if (command === 'changes') console.log(JSON.stringify(changes(option('base', 'dev'), option('head', 'HEAD')), null, 2));
  else if (command === 'workflow' && action === 'init') {
    const scope = args.includes('--scope') ? option('scope') : undefined;
    requireThat(scope === undefined || scope === 'shared' || scope === 'component', '--scope must be shared or component');
    const details = {
      goal: args.includes('--goal') ? option('goal') : undefined,
      recipient: args.includes('--recipient') ? option('recipient') : undefined,
    };
    console.log(JSON.stringify(initWorkflow(option('workflow'), componentOption(), option('run'), ROOT, scope, details), null, 2));
  }
  else if (command === 'workflow' && action === 'list') console.log(JSON.stringify(listWorkflowRuns(ROOT, args.includes('--all')), null, 2));
  else if (command === 'skills' && ['sync', 'check'].includes(action)) console.log(JSON.stringify(syncSkills(ROOT, action === 'check'), null, 2));
  else if (command === 'branch' && action === 'feature') console.log(createFeature(option('name')));
  else if (command === 'history' && action === 'verify') verifyHistory();
  else if (command === 'architecture' && action === 'check') verifyArchitecture();
  else {
    console.log(`TLIS maintenance (Node 24, run npm ci first)\n\ncomponents list\nprojects list\ncomponent check --component <name>\nchanges --base <ref> --head <ref>\nworkflow init --workflow <name> --component <name> --run <slug> [--scope shared|component] [--goal <text>] [--recipient <text>]\nworkflow list [--all]\nskills sync|check\nbranch feature --name <slug>\narchitecture check\nhistory verify\n\nRepository: ${ROOT}`);
    if (command && command !== 'help') process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
