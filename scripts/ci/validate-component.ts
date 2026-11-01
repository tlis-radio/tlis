import path from 'node:path';
import { componentByName } from '../src/projects.ts';
import { ROOT, runCommand } from '../src/common.ts';

const name = process.argv[2] ?? process.env.COMPONENT;
if (!name) throw new Error('Select a component to validate');
const component = componentByName(name);
const directory = path.join(ROOT, component.path);
const npm = (args: string[]) => runCommand(directory, 'npm', args);
switch (component.name) {
  case 'cms-web': npm(['ci', '--legacy-peer-deps']); npm(['run', 'build']); break;
  case 'videostream': npm(['ci']); npm(['run', 'build']); break;
  case 'tlis-discord-bot': npm(['ci']); npm(['run', 'check']); break;
  case 'tlis-devhost': npm(['ci']); npm(['run', 'restore']); npm(['run', 'check']); break;
  case 'tlis-streamserver-docker':
    runCommand(directory, 'docker', ['compose', 'config', '--quiet']);
    if (process.env.BUILD_IMAGES === 'true') runCommand(directory, 'docker', ['compose', 'build']);
    break;
  default: throw new Error('No CI validation profile for this registered component');
}
