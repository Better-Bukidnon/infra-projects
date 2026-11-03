---
name: design-system
description: How to build UI in this repo - the site's own identity (infra.betterbukidnon.org, a Better Bukidnon site in the budget.betterbukidnon.org family), its tokens, components, i18n and naming rules. Use before adding or changing any markup, CSS or user-facing text.
---

# Design system (infra.betterbukidnon.org)

This is a standalone Better Bukidnon site, like budget.betterbukidnon.org (`../bukidnon-transparency-portal`). It doesn't use betterbukidnon.org's header, nav, info bar or footer. It has its own masthead, subnav and footer, in the budget portal's style: white paper, ink rules, a colored section band and mono labels.

What it shares with the budget portal:
- The type roles: Figtree for headings, Inter for body text, JetBrains Mono for labels.
- The layout family: masthead, subnav band, KPI row and footer.
- The credit "run by Better Bukidnon".

What sets it apart is its own accent, DPWH-orange, where the budget portal uses BetterGov blue.

## Files

| Kind | File |
| --- | --- |
| Markup | `index.html` |
| Tokens and styles | `assets/css/infra-projects.css` (tokens on `:root` at the top) |
| Page JS | `assets/js/infra-projects.js` |
| Strings and language switcher | `assets/js/infra-projects-i18n.js` (`window.IPI18N`) |
| Favicon | `assets/images/favicon.svg` |

Nothing is vendored. You can edit every file.

## Tokens

- Paper and ink: `--paper`, `--paper-2`, `--paper-3`, `--rule`, `--rule-soft`, `--ink`, `--ink-2`, `--ink-3`, `--ink-mute`
- Accent: `--accent #c2410c`, `--accent-deep #9a3412` (the subnav band and `theme-color`), `--accent-soft`
- Status: `--ip-completed`, `--ip-ongoing`, `--ip-procurement`, `--ip-terminated`, `--ip-other`
- Type: `--font-hero`, `--font-body`, `--font-mono`
- Layout: `--page 1280px`, `--gutter` (32px, or 16px at 768px and below)

Never hard-code a color a token already covers. If the accent changes, also change it in `favicon.svg` and the `theme-color` meta.

## Components

- Chrome: `.ip-masthead` (with `-top`, `-main`, `-kicker`, `-name`, `-with`), `.ip-subnav`, `.ip-footer`
- Page: `.ip-page` (the width container), `.ip-lede`, `.ip-stats` with `.ip-stat`, and `.ip-section-h`
- Labels: `.ip-label` is for mono metadata only, never sentences
- Controls: `.ip-btn`, `.ip-btn-primary`, `.ip-filter`, `.ip-pager`
- Data: `.ip-table`, `.ip-badge` (a status dot and its label, colored with `--c`), and `.ip-sub`

Corners are square. Separate sections with rules (`1px solid var(--ink)` on top) instead of cards or shadows.

## Rules for new code

- Prefix every class with `ip-`.
- Don't use an icon font. Use text, and `↗` for external links.
- Breakpoints are `1024px` and `768px`. A single-column grid must use `minmax(0, 1fr)`, or the table will push the page wider than a phone screen.
- Keep the map container `isolation: isolate`. Leaflet's z-indexes go up to 1000.
- Keep these visible: the Bisto.ph credit in the masthead, the source line, and "Last synced".
- Keep the cross-links to betterbukidnon.org and budget.betterbukidnon.org.

## Text and translations

- Every visible string needs an `ip-*` key in `infra-projects-i18n.js`, with `en`, `fil` and `ceb` values.
- In static markup, use `data-i18n="ip-key"`, `data-i18n-placeholder` or `data-i18n-aria`. Keep the English text inline as the fallback.
- In JS, use `t('ip-key', 'English fallback', { param })`. When the language changes, the page re-renders through `IPI18N.onChange`.
- Option values and data stay in English. Only the labels are translated.
- FIL and CEB strings are drafts until a native speaker reviews them. Say so whenever you add new ones.

## Checking your work

Run `npm run serve`, then check the page at 1366px and at 390px wide. Headless Edge and Chrome can't go narrower than about 500px, so for the phone check, render the page inside a 390px `<iframe>`.
- EN, FIL and CEB all switch the text.
- There's no horizontal scroll at 390px.
- The console shows no errors.
