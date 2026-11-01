# Configuration

The library has no runtime environment variables, credentials, network client, or service endpoint.

- `package.json` declares its version, public package entries, generated distribution files, and maintenance commands.
- `tsconfig.json` builds CommonJS JavaScript and declarations from `src/`.
- `tsconfig.scripts.json` checks Node 24 maintenance scripts separately from the consumer-facing package.
- `_config/project.json` declares the component check.
- `_config/consumers.json` lists the two repository consumers and the website's existing `--legacy-peer-deps` install requirement.

The synchronization script accepts only `--check` or `--write`; it defaults to checking. Consumer paths are validated as `projects/<name>`. Package archives are created in an OS temporary directory and compared or copied locally. Their install paths and SHA-512 integrity are recorded in each consumer's existing lockfile.

Use Node 24 and the library's own `npm ci` for scripts. No root workspace installation or shared dependency hoist is required.
