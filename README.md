# Bukidnon Infrastructure Projects

A map and table of DPWH public works and infrastructure projects in the Province of Bukidnon, sourced from [Bisto.ph](https://bisto.ph). Modeled on BetterGensan's [Infrastructure Projects page](https://bettergensan.org/city-map).

It's a standalone Better Bukidnon site, like the [budget portal](https://budget.betterbukidnon.org). It's planned for **infra.betterbukidnon.org**, and betterbukidnon.org/services/infrastructure links to it.

## How it works

```
api.dpwh.bettergov.ph  ──(daily sync)──▶  data/projects.json  ──▶  index.html (Leaflet map + table)
```

- `scripts/sync.mjs` pulls every project for `province=Bukidnon` from the BetterGov DPWH API, the data behind Bisto.ph. That's 3 requests of 1,500 rows, about 4,200 projects. The script cleans the data and writes `data/projects.json`. It has no dependencies (Node 18+).
- `index.html` + `assets/` is a static site with its own identity (see [Design](#design)). It doesn't call the API directly, because each API request takes 7–9 seconds.
- `.github/workflows/sync.yml` runs the sync daily and commits only when project data changed. It does nothing until the repo is pushed to GitHub.

## Run locally

```sh
npm run sync    # refresh data/projects.json
npm run serve   # http://localhost:8080 (python -m http.server)
```

## What the sync cleans up

| Problem in the API data | What we do |
| --- | --- |
| Location is only the District Engineering Office (e.g. "Bukidnon 2nd DEO") | Read the city/municipality from the description (`lgu`). About 4% have no match and show as office only. |
| Categories mix clean values with raw strings ("GAA 2025 SSP", "Roads: Construction - PCCP") | Map them to 6 categories. The original is kept in `categoryRaw`. |
| A few geotags fall outside the province | Drop coordinates outside a Bukidnon bounding box (`badGeotag: true`). The project still shows in the table. |
| Contractor names end with an internal ID, e.g. `(36070)` | Strip the trailing ID. |
| `infraYear` and `sort` query params are ignored by the API | Filter and sort on our side. |

## API notes

`GET https://api.dpwh.bettergov.ph/projects?page=1&limit=1500&province=Bukidnon`

- Public, no key, `Access-Control-Allow-Origin: *`.
- Filters that work: `province`, `region`, `status`, `category`, `search` (free text).
- Each response includes `data.summary` (counts by status and total budget) and `data.pagination`.
- Single project: `GET /projects/{contractId}`.
- `province=Bukidnon` returns only the Bukidnon DEOs. `search=Bukidnon&region=Region X` returns about 1,000 more, possibly projects run by the regional office or Cagayan de Oro DEOs. Some of those are false hits, so they're not included yet. See the open questions in [docs/ORIGINAL_ISSUE.md](docs/ORIGINAL_ISSUE.md).

## Data attribution

Project data comes from DPWH through [BetterGov.ph](https://bettergov.ph) / [Bisto.ph](https://bisto.ph). Map tiles are © OpenStreetMap contributors.

## Design

The site has its own identity, in the same family as budget.betterbukidnon.org:
- the same type roles: Figtree for headings, Inter for body text, JetBrains Mono for labels
- the same masthead, subnav band, KPI row and footer pattern
- its own DPWH-orange accent, where the budget portal uses blue

The masthead credits Bisto.ph. The top bar links to betterbukidnon.org and the budget portal, and the footer says it's run by Better Bukidnon.

| | Files |
| --- | --- |
| Tokens and styles | `assets/css/infra-projects.css` |
| Map, table and filters | `assets/js/infra-projects.js` |
| Strings (EN/FIL/CEB) and the language switcher | `assets/js/infra-projects-i18n.js` |

`.claude/skills/design-system/SKILL.md` has the tokens, components and rules.

The Filipino and Cebuano strings are first drafts and need a native-speaker review.

## Deploy (Cloudflare Workers)

`wrangler.jsonc` serves `dist/` as Workers static assets, the same setup as betterbukidnon. There's no Worker script.

```sh
npm install           # installs wrangler (pinned)
npm run dev           # build + wrangler dev on http://localhost:8787
npm run deploy:dry    # build + validate without uploading
npm run deploy        # build + deploy (needs `npx wrangler login`)
```

`scripts/build.mjs` copies only `index.html`, `assets/` and `data/` into `dist/` and writes `_headers` (data revalidates on every load). Until a custom domain is added under `routes`, the site is served on `*.workers.dev`.

## Claude Code

`CLAUDE.md` has the project rules. Project skills are in `.claude/skills/`: `sync-projects`, `audit-data`, `deploy` and `design-system`. Subagents copied from betterbukidnon are in `.claude/agents/` (MIT, see `THIRD_PARTY_NOTICE.txt`).
