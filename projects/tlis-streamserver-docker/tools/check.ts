import { fileURLToPath } from 'node:url';
import { runProjectChecks } from '../../../tools/src/projects.ts';
runProjectChecks(fileURLToPath(new URL('../', import.meta.url)));
