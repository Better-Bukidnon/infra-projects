# Bukidnon Infrastructure Projects

A map and table of DPWH public works and infrastructure projects in the Province of Bukidnon, sourced from [Bisto.ph](https://bisto.ph). Modeled on BetterGensan's [Infrastructure Projects page](https://bettergensan.org/city-map), and intended to feed https://betterbukidnon.org/services/infrastructure.

## How it works

```
api.dpwh.bettergov.ph  ──(daily sync)──▶  data/projects.json  ──▶  index.html (Leaflet map + table)
```

- `scripts/sync.mjs` pulls every project for `province=Bukidnon` from the BetterGov DPWH API, the data behind Bisto.ph. That's 3 requests of 1,500 rows, about 4,200 projects. The script cleans the data and writes `data/projects.json`. It has no dependencies (Node 18+).
- `index.html` + `assets/` is a static page. It doesn't call the API directly, because each API request takes 7–9 seconds.
- `.github/workflows/sync.yml` runs the sync daily and commits only when project data changed. It does nothing until the repo is pushed to GitHub.

## Run locally

```sh
npm run sync    # refresh data/projects.json
npm run serve   # http://localhost:8080   (or: python -m http.server 8080)
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
