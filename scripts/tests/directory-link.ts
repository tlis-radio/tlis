import { symlinkSync } from 'node:fs';
import path from 'node:path';

/** Windows junctions exercise directory redirection without symbolic-link privileges. */
export function linkDirectory(target: string, link: string): void {
  symlinkSync(path.resolve(path.dirname(link), target), link, process.platform === 'win32' ? 'junction' : 'dir');
}
