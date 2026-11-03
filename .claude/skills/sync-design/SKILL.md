---
name: sync-design
description: Pull the latest shared BetterBukidnon styles, scripts, translations and logos from the main betterbukidnon repo into this one, and check the copied header/nav/footer markup for drift. Use when asked to update or sync the design, styles or translations from the main site, or when the main site's look changed.
---

# Sync the shared design from betterbukidnon

The vendored files are listed in `design-sync.json`. `syncedFrom` records the source commit.

1. Check the source checkout. It should be on `main` (or `develop` for unreleased changes) and up to date:
   ```sh
   git -C ../betterbukidnon status -sb
   ```
   If it's on a feature branch or has uncommitted changes, tell the user before syncing. The script also flags uncommitted changes.
2. Preview what would change:
   ```sh
   node scripts/sync-design.mjs --check
   ```
3. Copy the files:
   ```sh
   node scripts/sync-design.mjs            # or pass a path: node scripts/sync-design.mjs D:/other/betterbukidnon
   ```
4. Check whether the page chrome drifted. The header, nav, info bar and footer in `index.html` are a hand copy, not vendored. Compare them with the source:
   ```sh
   git -C ../betterbukidnon log --oneline -5 -- services/infrastructure.html
   ```
   If the nav links, hotline numbers or footer changed, update the shared-chrome blocks in `index.html`. Keep the links absolute (`https://betterbukidnon.org/...`).
5. Check that nothing broke:
   - `infra-projects.css` uses tokens and classes from `style.css`. If a token or class was renamed, update it.
   - `infra-projects-i18n.js` merges into the global `translations` object. Confirm `translations.js` still declares it and still exposes `window.TranslationEngine`.
   - Run `npm run serve` and check the page at desktop and mobile width.
6. Commit the vendored files together with `design-sync.json`. Mention the source commit in the message, e.g. `Sync design from betterbukidnon@abc1234`.

Never edit the vendored files directly. A re-sync would overwrite the change.
