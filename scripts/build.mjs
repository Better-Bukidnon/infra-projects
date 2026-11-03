#!/usr/bin/env node
// Copies the public site into dist/ for Cloudflare Workers static assets.
// Only what's listed here is deployed; scripts, docs and .github never are.

import { cp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const PUBLIC = ['index.html', 'assets', 'data'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of PUBLIC) await cp(resolve(root, entry), resolve(dist, entry), { recursive: true });

// Cache-bust local CSS/JS/images: assets are cached for an hour, so without
// this a deploy can pair new HTML with a browser's old CSS and JS.
const indexPath = resolve(dist, 'index.html');
const html = await readFile(indexPath, 'utf8');
const versioned = await replaceAsync(html, /(href|src)="(assets\/[^"?#]+)"/g, async (m, attr, path) => {
  const hash = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0, 10);
  return `${attr}="${path}?v=${hash}"`;
});
await writeFile(indexPath, versioned);

async function replaceAsync(str, re, fn) {
  const parts = await Promise.all([...str.matchAll(re)].map((m) => fn(...m)));
  let i = 0;
  return str.replace(re, () => parts[i++]);
}

// Cloudflare static-asset headers. The data changes at most daily, so let
// browsers revalidate it. CSS/JS get a ?v=<hash> above, so an hour is safe.
// index.html itself is never cached long (Cloudflare's default revalidates HTML).
await writeFile(
  resolve(dist, '_headers'),
  `/data/*
  Cache-Control: public, max-age=0, must-revalidate
/assets/*
  Cache-Control: public, max-age=3600
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
);

const { count, lastSyncedAt } = JSON.parse(await readFile(resolve(dist, 'data/projects.json'), 'utf8'));
console.log(`dist/ ready: ${count} projects, synced ${lastSyncedAt}`);
