# CLAUDE.md

A static map and table of DPWH infrastructure projects in Bukidnon, sourced from Bisto.ph through the BetterGov DPWH API. It's a standalone Better Bukidnon site with its own identity, in the same family as the budget portal (budget.betterbukidnon.org, `../bukidnon-transparency-portal`). Its planned home is **infra.betterbukidnon.org**, and https://betterbukidnon.org/services/infrastructure should link to it.

## Layout

- `scripts/sync.mjs`: API → `data/projects.json`. All data cleanup happens here: LGU extraction, category mapping, the geotag bounding box, and contractor names. It has no dependencies.
- `scripts/build.mjs`: copies `index.html`, `assets/` and `data/` into `dist/` and writes `_headers`.
- `index.html`: the whole site. It has its own masthead, a subnav (Map, Table, About the data), a KPI row, the map and table, and a footer. Plain HTML, CSS and JS, with no build step. Leaflet 1.9.4 and markercluster 1.5.3 load from unpkg. Fonts (Figtree, Inter, JetBrains Mono) load from Google Fonts.
- `assets/css/infra-projects.css`: the tokens and every style.
- `assets/js/infra-projects.js`: the map, table and filters.
- `assets/js/infra-projects-i18n.js`: the `ip-*` strings in en, fil and ceb, plus the language switcher (`window.IPI18N`).
- `assets/images/favicon.svg`
- `wrangler.jsonc`: Cloudflare Workers static-assets deploy of `dist/`.
- `.github/workflows/sync.yml`: daily sync. It ignores the `lastSyncedAt` line when deciding whether to commit.

## Rules

- Never hand-edit `data/projects.json`. Change the rules in `scripts/sync.mjs` and re-sync.
- Keep the one-project-per-line output format. The sync workflow's diff check depends on it.
- The page must not call the API directly. Requests take 7–9s each.
- Keep Bisto.ph attribution and the "Last synced" line visible.
- Keep the site's own identity: the budget portal's type roles and layout family, with this site's accent. It credits "Better Bukidnon" and links to betterbukidnon.org and the budget portal. Don't bring back the main site's header, nav or footer. Prefix classes with `ip-`. Every visible string needs an `ip-*` key in en, fil and ceb. See the `design-system` skill.
- `assets/js/infra-projects.js` has a helper called `placeOf()`. Don't name a top-level helper `location`, because it shadows `window.location`.
- The repo is local only for now. Don't add a remote or push unless asked.

## Skills

- `sync-projects`: refresh and sanity-check the data.
- `audit-data`: find bad geotags, unmatched LGUs and "Other" categories, and fix the rules.
- `deploy`: build, run wrangler locally, and deploy. Confirm with the user before deploying.
- `design-system`: the identity, tokens, components, i18n and naming rules. Read it before any UI or text change.
