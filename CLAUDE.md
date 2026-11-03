# CLAUDE.md

A static map and table of DPWH infrastructure projects in Bukidnon, sourced from Bisto.ph through the BetterGov DPWH API. It's a companion to the betterbukidnon.org site (`../betterbukidnon`) and is meant to feed https://betterbukidnon.org/services/infrastructure.

## Layout

- `scripts/sync.mjs`: API → `data/projects.json`. All data cleanup happens here: LGU extraction, category mapping, the geotag bounding box, and contractor names. It has no dependencies.
- `scripts/build.mjs`: copies `index.html`, `assets/` and `data/` into `dist/` and writes `_headers`.
- `index.html`: the page. It wraps the shared betterbukidnon chrome (hotline bar, header and nav, info bar, breadcrumbs, `.page-header`, footer) around the map and table. Plain HTML, CSS and JS, with no build step. Leaflet 1.9.4 and markercluster 1.5.3 load from unpkg, and Bootstrap Icons 1.11.1 from jsDelivr.
- Page code:
  - `assets/css/infra-projects.css`
  - `assets/js/infra-projects.js`
  - `assets/js/infra-projects-i18n.js`: `ip-*` strings in en/fil/ceb
- Vendored from `../betterbukidnon` (see `design-sync.json`), **do not edit**:
  - `assets/css/{style,responsive,accessibility,footer}.css`
  - `assets/js/{main,info-bar,translations}.js`
  - `assets/images/**`
- `scripts/sync-design.mjs`: re-copies the vendored files and records the source commit.
- `wrangler.jsonc`: Cloudflare Workers static-assets deploy of `dist/`.
- `.github/workflows/sync.yml`: daily sync. It ignores the `lastSyncedAt` line when deciding whether to commit.

## Rules

- Never hand-edit `data/projects.json`. Change the rules in `scripts/sync.mjs` and re-sync.
- Keep the one-project-per-line output format. The sync workflow's diff check depends on it.
- The page must not call the API directly. Requests take 7–9s each.
- Keep Bisto.ph attribution and the "Last synced" line visible.
- Match betterbukidnon.org. Use `style.css` tokens and components, and prefix page classes with `ip-`. Every visible string needs an `ip-*` key in en/fil/ceb. See the `design-system` skill.
- Never edit vendored files. Fix them in `../betterbukidnon`, then run `sync-design`.
- `assets/js/infra-projects.js` has a helper called `placeOf()`. Don't name a top-level helper `location`, because it shadows `window.location`.
- The repo is local only for now. Don't add a remote or push unless asked.

## Skills

- `sync-projects`: refresh and sanity-check the data.
- `audit-data`: find bad geotags, unmatched LGUs and "Other" categories, and fix the rules.
- `deploy`: build, run wrangler locally, and deploy. Confirm with the user before deploying.
- `design-system`: tokens, components, i18n and naming rules. Read it before any UI or text change.
- `sync-design`: pull the latest shared styles, scripts and logos from `../betterbukidnon`.
