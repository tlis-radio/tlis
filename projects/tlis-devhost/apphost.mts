import { createBuilder } from './.aspire/modules/aspire.mjs';
import { configureResources } from './src/resources.ts';
import { loadOptions } from './src/topology.ts';

const options = loadOptions(process.env);
const builder = await createBuilder();
await configureResources(builder, options);
await builder.build().run();
