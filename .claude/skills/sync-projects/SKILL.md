---
name: sync-projects
description: Refresh data/projects.json from the BetterGov DPWH API (the data behind bisto.ph) and sanity-check the result before committing. Use when asked to sync, refresh, update or pull the latest Bukidnon infrastructure projects.
---

# Sync Bukidnon projects

1. Note the current numbers so you can compare:
   ```sh
   node -e "const d=require('./data/projects.json');console.log(d.count,d.mapped,d.lastSyncedAt)"
   ```
2. Run the sync. It takes a few seconds, but the API can take 7–9s per page.
   ```sh
   npm run sync
   ```
   The script refuses to write if it got less than 95% of the API's `totalCount`. If it fails, report the error. Don't loosen that guard to make it pass.
3. Sanity-check before committing:
   - The count shouldn't drop by more than a few percent from step 1. A big drop usually means an API change, not removed projects. Stop and report it.
   - Run the `audit-data` skill if `bad geotags` or `without LGU` in the sync output jumped compared with the last run.
   - Look at the size of the diff: `git diff --stat -- data/projects.json`.
4. Commit only `data/projects.json`, with the message `Sync Bisto.ph projects (<count> projects)`. Only commit when the user asked for it.

## Notes

- Only `province=Bukidnon` is pulled. That covers the Bukidnon 1st–4th DEOs. Projects run by the Region X office or Cagayan de Oro DEOs are not included. That's an open scope question in `docs/ORIGINAL_ISSUE.md`, so don't widen it on your own.
- The API ignores `infraYear` and `sort`. Filter and sort in `scripts/sync.mjs` or `assets/app.js`.
- In CI, `.github/workflows/sync.yml` runs the same script daily and commits only when project data changed. It ignores the `lastSyncedAt` line, which is why the output keeps one project per line.
