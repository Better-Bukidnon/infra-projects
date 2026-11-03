## Summary

Add the province's public works and infrastructure projects from [Bisto.ph](https://bisto.ph) (BetterGov.ph's citizen project monitoring) to https://betterbukidnon.org/services/infrastructure, following the pattern of BetterGensan's [Infrastructure Projects page](https://bettergensan.org/city-map).

Right now `services/infrastructure.html` only lists office contacts and who handles what. It doesn't show which projects are actually being built in Bukidnon, how much they cost, or how far along they are.

## Reference: how BetterGensan does it

- **Header:** "Infrastructure Projects", with the subtitle "Public works and infrastructure projects in General Santos City, sourced from Bisto.ph."
- **Map / Table toggle.**
  - **Map:** Leaflet + OpenStreetMap, one pin per geotagged project, and a count such as "1037 projects · 758 mapped".
  - **Table:** paginated, with Project (title + category), Agency, Location, Budget (₱) and Status badge columns.
- **Filter sidebar:** search by name, contractor or location; Infrastructure Year; Project Category; Project Status checkboxes with counts (Completed, On-Going, For Procurement, Not Yet Started); Apply Filters / Reset.
- **Attribution footer:** "Data sourced from Bisto.ph. Last synced <date>.", a link to bisto.ph, and an empty state ("No infrastructure projects synced yet…").
- **Data:** BetterGensan doesn't call Bisto.ph from the browser. A sync job writes the data to its own `infrastructure_projects` table, and the page reads from there. The fields it uses are `external_id, source, title, description, agency, contractor, location_text, region, province, city_municipality, barangay, latitude, longitude, budget_amount, status, start_date, end_date, category, first_seen_at, last_seen_at, last_synced_at`.

## Proposed approach for BetterBukidnon (static site)

We have no database, so we can reuse the pattern from the Facebook news sync:

1. **Sync script.** Add `scripts/sync-bisto.js`, modeled on `scripts/sync-facebook.js`. It fetches Bisto.ph projects filtered to `province = Bukidnon` and normalizes them to the field list above. It writes `data/infrastructure-projects.json` with a top-level `last_synced_at`.
2. **Scheduled workflow.** Add `.github/workflows/bisto-sync.yml`, modeled on `facebook-sync.yml`. A daily schedule should be enough, plus `workflow_dispatch`.
3. **UI** in `services/infrastructure.html`, as a new section above or below "What the Province does":
   - Map/Table toggle. Leaflet 1.9.4 is already loaded from unpkg on the homepage (`assets/js/weather-map.js`).
   - Filters: search, year, category, status (with counts), and municipality/city. The municipality/city filter is new. It fits a province with 20 municipalities and 2 cities.
   - Optionally, the Bukidnon province boundary on the map.
   - Attribution plus "Last synced" footer, and an empty state.
4. **i18n.** Add the new strings to `assets/js/translations.js` (`infra-*` keys).

## Open questions

- [ ] How do we get the data from Bisto.ph? Options: public API, export, or asking the BetterGov.ph team. Ask the BetterGensan maintainers how their sync works.
- [ ] Use the provincial scope only, or include projects that are national (DPWH) but located in Bukidnon? Bisto exposes `geographic_scope_match`.
- [ ] How should we handle projects with no coordinates? They should show in the table but not on the map.

## Acceptance criteria

- [ ] `/services/infrastructure` shows Bukidnon projects from Bisto.ph in Map and Table views.
- [ ] The filters (search, year, category, status, municipality) work in both views.
- [ ] Bisto.ph attribution and the last-synced date are visible.
- [ ] Data refreshes on a schedule without manual steps.
- [ ] The page works on mobile and in all three languages (en / fil / ceb).
- [ ] The Lighthouse workflow still passes.

