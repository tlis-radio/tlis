import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, git, readJson, requireThat } from './common.ts';

interface Ref { original: string; original_object: string; imported: string; imported_object: string }
interface Source { name: string; path: string; original_head: string; default_tree: string;
  integration_commit: string; commit_count: number; refs: Ref[] }
interface Manifest { schema_version: number; import_anchor: string; projects: Source[] }
interface Record { tree: string; parents: string[]; metadata_sha256: string }
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

export function verifyHistory(root = ROOT): void {
  const directory = path.join(root, 'docs/migration');
  const manifest = readJson<Manifest>(path.join(directory, 'manifest.json'));
  requireThat(manifest.schema_version === 2, 'Unsupported migration manifest');
  requireThat(git(root, ['rev-parse', '--is-shallow-repository']).toString().trim() === 'false', 'Fetch full history before verification');
  const anchor = manifest.import_anchor;
  git(root, ['merge-base', '--is-ancestor', anchor, 'HEAD']);
  const refs = new Map(git(root, ['for-each-ref', '--format=%(refname) %(objectname)']).toString().trim().split('\n')
    .map(line => line.split(' ') as [string, string]));
  const reachable = new Set(git(root, ['rev-list', '--all']).toString().trim().split('\n'));
  let count = 0;
  let refCount = 0;
  for (const source of manifest.projects) {
    const mapping = new Map(readFileSync(path.join(directory, `${source.name}.commit-map`), 'utf8')
      .trim().split('\n').slice(1).map(line => line.trim().split(/\s+/) as [string, string]));
    const records = readJson<{ [sha: string]: Record }>(path.join(directory, `${source.name}.commits.json`));
    requireThat(mapping.size === source.commit_count && Object.keys(records).length === mapping.size, `${source.name}: commit count differs`);
    requireThat(new Set(mapping.values()).size === mapping.size, `${source.name}: commits collapsed`);
    for (const [old, expected] of Object.entries(records)) {
      const current = mapping.get(old);
      requireThat(current && reachable.has(current), `${source.name}: missing imported commit ${old}`);
      const raw = git(root, ['cat-file', 'commit', current]);
      const split = raw.indexOf('\n\n');
      // Latin-1 round trips arbitrary original header bytes, including non-UTF-8 identities.
      const headers = raw.subarray(0, split).toString('latin1').split('\n');
      const identity = headers.filter(line => /^(author|committer|encoding) /.test(line)).join('\n');
      const digest = createHash('sha256').update(Buffer.from(identity + '\n\n', 'latin1')).update(raw.subarray(split + 2)).digest('hex');
      requireThat(digest === expected.metadata_sha256, `${source.name}: metadata/message changed for ${old}`);
      const parents = headers.filter(line => line.startsWith('parent ')).map(line => line.slice(7));
      requireThat(JSON.stringify(parents) === JSON.stringify(expected.parents.map(parent => mapping.get(parent))),
        `${source.name}: parent graph changed for ${old}`);
      const rootTree = git(root, ['ls-tree', '-z', current]).toString();
      if (expected.tree === EMPTY_TREE) requireThat(rootTree === '', `${source.name}: empty tree changed`);
      else {
        requireThat(/^040000 tree [0-9a-f]{40}\tprojects\0$/.test(rootTree), `${source.name}: files outside projects/`);
        const projectTree = git(root, ['ls-tree', '-z', `${current}:projects`]).toString();
        requireThat(projectTree === `040000 tree ${expected.tree}\t${source.name}\0`, `${source.name}: tree changed for ${old}`);
      }
    }
    for (const ref of source.refs) {
      const suffix = '/' + ref.imported.replace(/^refs\/heads\//, '');
      requireThat([...refs].some(([name, sha]) => sha === ref.imported_object &&
        (name === ref.imported || (name.startsWith('refs/remotes/') && name.endsWith(suffix)))),
        `Missing historical ref ${ref.imported}; fetch all branches`);
      if (mapping.has(ref.original_object)) requireThat(mapping.get(ref.original_object) === ref.imported_object,
        `${source.name}: ref target differs from commit map`);
    }
    git(root, ['merge-base', '--is-ancestor', mapping.get(source.original_head)!, source.integration_commit]);
    git(root, ['merge-base', '--is-ancestor', source.integration_commit, anchor]);
    requireThat(git(root, ['rev-parse', `${anchor}:${source.path}`]).toString().trim() === source.default_tree,
      `${source.name}: integrated default tree differs`);
    count += mapping.size; refCount += source.refs.length;
    console.log(`PASS ${source.name}: ${mapping.size} commits, ${source.refs.length} refs`);
  }
  console.log(`PASS ${count} source commits and ${refCount} historical refs; metadata, trees, and parent graphs preserved`);
}
