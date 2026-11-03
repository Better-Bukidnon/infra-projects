---
name: design-system
description: How to build UI in this repo so it matches betterbukidnon.org - the shared tokens, components, page chrome, icons, i18n and naming rules. Use before adding or changing any markup, CSS or user-facing text on the Infrastructure Projects page.
---

# BetterBukidnon design system (in this repo)

The page uses the main site's real CSS and JS. They're vendored from `../betterbukidnon` and listed in `design-sync.json`. Build with what's already there before writing new CSS.

## Files

| Kind | File | Edit? |
| --- | --- | --- |
| Shared styles | `assets/css/style.css`, `responsive.css`, `accessibility.css`, `footer.css` | **No.** Vendored. Run the `sync-design` skill to update them. |
| Shared JS | `assets/js/main.js` (nav, dropdowns, mobile menu), `info-bar.js` (rates, weather, clock), `translations.js` (TranslationEngine plus every site string) | **No.** Vendored. |
| Logos | `assets/images/logo/*`, `assets/images/banners/opengraph.png` | **No.** Vendored. |
| Page styles | `assets/css/infra-projects.css` | Yes |
| Page JS | `assets/js/infra-projects.js` | Yes |
| Page strings | `assets/js/infra-projects-i18n.js` | Yes |

If a vendored file has a bug, fix it in `../betterbukidnon` first, then re-sync.

## Tokens (from `style.css` `:root`)

- Colors: `--color-primary #0032a0`, `--color-primary-dark`, `--color-secondary`, `--color-accent #f77f00`, `--color-success`, `--color-danger`, `--color-info`, `--color-bg`, `--color-bg-alt`, `--color-text`, `--color-text-light`, `--color-white`
- Spacing: `--spacing-xs 8` · `sm 16` · `md 24` · `lg 32` · `xl 48`
- Other: `--border-radius 8px`, `--shadow-sm`, `--shadow-md`, `--font-main` (Inter), `--max-width 1200px`
- Page status colors are defined in `infra-projects.css`: `--ip-completed`, `--ip-ongoing`, `--ip-procurement`, `--ip-terminated`, `--ip-other`.

Never hard-code a hex color that a token already covers.

## Components already in style.css

- Layout: `.container`, `.section`, `.section-compact`, `.section-header`, `.section-title`, `.section-subtitle`, `.grid .grid-2/3/4`
- Page top: `.breadcrumbs`, `.page-header` > `.page-header-content` > `.page-header-badge`, `h1`, `.page-header-desc`
- Buttons: `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-outline`, plus `.btn-sm` and `.btn-block`
- Cards: `.card` (`.card-icon`, `.card-title`, `.card-text`, `.card-link`), `.info-card`, `.stat-card` in `.stat-cards-grid`
- Data: `.data-table` inside `.table-responsive`, and `.badge .badge-success/-info/-warning`
- Disclosure: `.accordion-item` > `.accordion-trigger` + `.accordion-content` (wired up by main.js)
- Utilities: `.text-center`, `.text-muted`, `.text-primary`, `.text-right`

To see how the main site uses a component, grep `../betterbukidnon` for the class name.

## Rules for new code

- **Prefix every page class with `ip-`.** style.css already defines `.badge`, `.btn-*` and others, and this page will eventually live inside the main repo.
- Icons: use Bootstrap Icons 1.11.1 (`<i class="bi bi-…" aria-hidden="true"></i>`), already loaded from jsDelivr. Don't add another icon set.
- Breakpoints: match `responsive.css`, which uses `1024px` (nav switches to the mobile menu) and `768px`.
- Leaflet z-indexes go up to 1000, and `.site-header` is sticky at 1000. Keep any map container `isolation: isolate`.
- The header, nav, info bar and footer in `index.html` are copied from `../betterbukidnon/services/*.html`, with links rewritten to `https://betterbukidnon.org/…`. When the main site's nav changes, update that block by hand. `sync-design` reports when it changes.

## Text and translations

- Every visible string needs a key in `assets/js/infra-projects-i18n.js` with `en`, `fil` and `ceb` values. Use `ip-` keys only.
- Static markup: `data-i18n="ip-key"`, plus `data-i18n-placeholder`, `-title`, `-aria` and `-alt` for attributes. Keep the English text inline as the fallback.
- Dynamic text in JS: `t('ip-key', 'English fallback', { param })`. `{param}` placeholders are interpolated. The page re-renders when the language changes (`TranslationEngine.addObserver`).
- Option values and data stay in English. Only the labels translate.
- FIL and CEB strings are drafts until a native speaker reviews them. Say so when you add new ones.

## Checking your work

Run `npm run serve`, then check at 1366px and 390px wide:
- the EN, FIL and CEB buttons all work
- there's no horizontal scroll at 390px
- the console has no errors from page files

These two console messages are expected when the page runs standalone:
- the `sw.js` 404, because `main.js` registers the main site's service worker
- the exchangerate.host 401 from `info-bar.js`
