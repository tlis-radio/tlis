import { appendFileSync } from 'node:fs';
import { changes } from '../src/projects.ts';

const report = changes(process.env.BASE_REF || 'dev', process.env.HEAD_REF || 'HEAD');
console.log(JSON.stringify(report, null, 2));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT,
  `components=${JSON.stringify(report.components)}\nany=${report.components.length > 0}\n`);
