#!/usr/bin/env node
// Pulls Bukidnon DPWH infrastructure projects from the BetterGov API (the data
// behind bisto.ph), cleans them up, and writes data/projects.json.
//
//   node scripts/sync.mjs
//
// No dependencies. Node 18+ (global fetch).

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.dpwh.bettergov.ph/projects';
const PROVINCE = 'Bukidnon';
const PAGE_SIZE = 1500; // largest page the API accepts; ~8s per request
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../data/projects.json');

// Rough bounding box of Bukidnon. Coordinates outside it are treated as bad
// geotags: the project stays in the table but is not pinned on the map.
const BBOX = { minLat: 7.3, maxLat: 8.75, minLng: 124.45, maxLng: 125.55 };

// 2 cities + 20 municipalities. Used to pull the LGU out of the description,
// since the API only gives the District Engineering Office.
const LGUS = [
  'Malaybalay City', 'Valencia City', 'Baungon', 'Cabanglasan', 'Damulog',
  'Dangcagan', 'Don Carlos', 'Impasug-ong', 'Kadingilan', 'Kalilangan',
  'Kibawe', 'Kitaotao', 'Lantapan', 'Libona', 'Malitbog', 'Manolo Fortich',
  'Maramag', 'Pangantucan', 'Quezon', 'San Fernando', 'Sumilao', 'Talakag',
];
const LGU_PATTERNS = LGUS.map((name) => {
  const core = name.replace(/ City$/, '').replace(/-/g, '[-\\s]?');
  return { name, re: new RegExp(`\\b${core}\\b`, 'i') };
});

// The API mixes clean categories with raw strings ("GAA 2025 SSP",
// "Roads: Construction - PCCP", ...). Collapse them into a short list.
const CATEGORIES = [
  ['Flood Control and Drainage', /flood|drainage|slope protection|revetment|dike/i],
  ['Bridges', /bridge/i],
  ['Roads', /road|pavement|pccp|asphalt|highway|by-pass|bypass/i],
  ['Water Provision and Storage', /water|sanitation|septage|irrigation/i],
  ['Buildings and Facilities', /building|facilit|classroom|school|court|gym|hall|center|centre|hospital|office/i],
];

function normalizeCategory(raw, description) {
  for (const [name, re] of CATEGORIES) if (re.test(raw ?? '')) return name;
  for (const [name, re] of CATEGORIES) if (re.test(description ?? '')) return name;
  return 'Other';
}

function findLgu(description) {
  // Prefer the last LGU mentioned: descriptions usually end with
  // "..., BRGY. X, <MUNICIPALITY>, BUKIDNON".
  let best = null;
  let bestIdx = -1;
  for (const { name, re } of LGU_PATTERNS) {
    const all = [...(description ?? '').matchAll(new RegExp(re.source, 'gi'))];
    const last = all.at(-1);
    if (last && last.index > bestIdx) {
      best = name;
      bestIdx = last.index;
    }
  }
  return best;
}

function inBukidnon(lat, lng) {
  return (
    typeof lat === 'number' && typeof lng === 'number' &&
    lat >= BBOX.minLat && lat <= BBOX.maxLat &&
    lng >= BBOX.minLng && lng <= BBOX.maxLng
  );
}

async function fetchPage(page, attempt = 1) {
  const url = `${API}?page=${page}&limit=${PAGE_SIZE}&province=${encodeURIComponent(PROVINCE)}`;
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'bukidnon-infra-projects-sync' },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (body?.code !== 'SUCCESS') throw new Error(`API code ${body?.code}`);
    return body.data;
  } catch (err) {
    if (attempt >= 3) throw new Error(`page ${page}: ${err.message}`);
    const wait = 2000 * attempt;
    console.warn(`page ${page} failed (${err.message}), retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
    return fetchPage(page, attempt + 1);
  }
}

function normalize(p) {
  const mapped = inBukidnon(p.latitude, p.longitude);
  return {
    id: p.contractId,
    title: p.description?.replace(/\s+/g, ' ').trim() ?? '',
    category: normalizeCategory(p.category, p.description),
    categoryRaw: p.category ?? null,
    status: p.status ?? 'Unknown',
    progress: p.progress ?? null,
    budget: p.budget ?? null,
    amountPaid: p.amountPaid ?? null,
    contractor: p.contractor?.replace(/\s*\(\d+\)\s*$/, '').trim() || null,
    office: p.location?.province ?? null, // e.g. "Bukidnon 2nd DEO"
    lgu: findLgu(p.description),
    year: p.infraYear ? Number(p.infraYear) : null,
    program: p.programName ?? null,
    fundSource: p.sourceOfFunds ?? null,
    startDate: p.startDate ?? null,
    completionDate: p.completionDate ?? null,
    lat: mapped ? p.latitude : null,
    lng: mapped ? p.longitude : null,
    badGeotag: !mapped && p.latitude != null,
  };
}

async function main() {
  const started = Date.now();
  const first = await fetchPage(1);
  const { totalPages, totalCount } = first.pagination;
  console.log(`${totalCount} projects across ${totalPages} page(s)`);

  const rows = [...first.data];
  for (let page = 2; page <= totalPages; page++) {
    const data = await fetchPage(page);
    rows.push(...data.data);
    console.log(`page ${page}/${totalPages}: +${data.data.length}`);
  }

  const seen = new Set();
  const projects = rows
    .filter((p) => p.contractId && !seen.has(p.contractId) && seen.add(p.contractId))
    .map(normalize)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (b.budget ?? 0) - (a.budget ?? 0));

  if (projects.length < totalCount * 0.95) {
    throw new Error(`only got ${projects.length}/${totalCount} projects, refusing to overwrite`);
  }

  const out = {
    source: 'https://bisto.ph',
    api: `${API}?province=${PROVINCE}`,
    lastSyncedAt: new Date().toISOString(),
    count: projects.length,
    mapped: projects.filter((p) => p.lat != null).length,
    projects,
  };

  await mkdir(dirname(OUT), { recursive: true });
  // One project per line, metadata on its own lines: readable git diffs, and
  // the workflow can ignore the lastSyncedAt line when deciding to commit.
  const { projects: list, ...meta } = out;
  const head = Object.entries(meta).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  const body = list.map((p) => '    ' + JSON.stringify(p)).join(',\n');
  await writeFile(OUT, `{\n${head.join('\n')}\n  "projects": [\n${body}\n  ]\n}\n`);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `wrote ${out.count} projects (${out.mapped} mapped, ` +
    `${projects.filter((p) => p.badGeotag).length} bad geotags, ` +
    `${projects.filter((p) => !p.lgu).length} without LGU) in ${secs}s`,
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
