import { fileURLToPath } from 'node:url';
import { runProjectChecks } from '../../../scripts/src/projects.ts';
runProjectChecks(fileURLToPath(new URL('../', import.meta.url)));
