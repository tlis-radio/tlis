import { describeTopology, loadOptions } from '../src/topology.ts';

console.log(JSON.stringify(describeTopology(loadOptions(process.env)), null, 2));
