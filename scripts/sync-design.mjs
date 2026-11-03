#!/usr/bin/env node
// Copies the shared BetterBukidnon design files (CSS, site JS, logos) from the
// main site repo into this one, at the same paths, and records which commit
// they came from in design-sync.json.
//
//   node scripts/sync-design.mjs                 # from ../betterbukidnon
//   node scripts/sync-design.mjs D:/path/to/repo # from elsewhere
//   node scripts/sync-design.mjs --check         # report drift, copy nothing
//
// The vendored files are never edited here. Page-specific styles and scripts
// live in assets/css/infra-projects.css and assets/js/infra-projects*.js.

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'design-sync.json');
const args = process.argv.slice(2);
const check = args.includes('--check');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const source = resolve(root, args.find((a) => !a.startsWith('--')) ?? manifest.source);

if (!existsSync(resolve(source, 'assets/css/style.css'))) {
  console.error(`Not a betterbukidnon checkout: ${source}`);
  process.exit(1);
}

// Compare text with CRLF folded to LF: a Windows checkout of either repo
// would otherwise look like every file changed (.gitattributes stores LF).
const TEXT = /\.(css|js|svg|html|json|md)$/i;
const hash = async (p) => {
  if (!existsSync(p)) return null;
  let buf = await readFile(p);
  if (TEXT.test(p)) buf = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'));
  return createHash('sha256').update(buf).digest('hex');
};
const git = (...a) => execFileSync('git', ['-C', source, ...a], { encoding: 'utf8' }).trim();

let commit = 'unknown';
let branch = 'unknown';
let dirty = false;
try {
  commit = git('rev-parse', '--short', 'HEAD');
  branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  dirty = git('status', '--porcelain', '--', ...manifest.files) !== '';
} catch {
  // not a git checkout; still copy
}

const changed = [];
for (const file of manifest.files) {
  const from = resolve(source, file);
  const to = resolve(root, file);
  if (!existsSync(from)) {
    console.warn(`missing in source, skipped: ${file}`);
    continue;
  }
  if ((await hash(from)) === (await hash(to))) continue;
  changed.push(file);
  if (!check) {
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
  }
}

if (check) {
  console.log(changed.length ? `${changed.length} file(s) differ from ${source} @ ${commit}:\n  ${changed.join('\n  ')}` : `Up to date with ${source} @ ${commit}`);
  process.exit(changed.length ? 1 : 0);
}

manifest.syncedFrom = { commit, branch, dirty, at: new Date().toISOString() };
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `${changed.length} file(s) updated from ${source} @ ${branch} ${commit}${dirty ? ' (uncommitted changes in source!)' : ''}` +
    (changed.length ? `:\n  ${changed.join('\n  ')}` : ''),
);
