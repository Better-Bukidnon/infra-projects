---
name: deploy
description: Build and deploy the site to Cloudflare Workers (static assets) with wrangler, or run it locally under wrangler dev. Use when asked to deploy, publish, ship, preview or run the site on Cloudflare.
---

# Deploy to Cloudflare

The site is static. `scripts/build.mjs` copies `index.html`, `assets/` and `data/` into `dist/` and writes `dist/_headers`. `wrangler.jsonc` serves `dist/` as Workers static assets. There's no Worker script.

## Local

```sh
npm run dev           # build + wrangler dev on http://localhost:8787
npm run serve         # plain static server on :8080, no build step
```

## Check before deploying

1. If the data is stale, run the `sync-projects` skill first.
2. `npm run deploy:dry`. It should read the files from `dist/` (index.html, assets, projects.json) and report "No bindings found".
3. `npm run dev`, then open http://localhost:8787. Confirm the map renders, the summary shows the project count, and the browser console has no errors.

## Deploy

Deploying is outward-facing, so **confirm with the user first**. Then:

```sh
npx wrangler whoami   # if not logged in, ask the user to run: ! npx wrangler login
npm run deploy
```

Report the URL that wrangler prints. Until a custom domain is set in `wrangler.jsonc` `routes`, that URL is `bukidnon-infra-projects.<account>.workers.dev`. Set custom domains in `wrangler.jsonc`, not in the dashboard, the same way betterbukidnon does.

## Notes

- Each static-asset file has a 25 MiB limit. `data/projects.json` is about 2.4 MB.
- If the repo is connected to Cloudflare Workers Builds, every commit to the production branch deploys. That includes the daily sync commit. Use the build command `npm run build` and the deploy command `npx wrangler deploy`.
