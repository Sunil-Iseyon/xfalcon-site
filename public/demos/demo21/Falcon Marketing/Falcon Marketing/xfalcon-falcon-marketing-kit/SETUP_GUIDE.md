# Falcon Marketing — Setup Guide

How to use this kit, how it's wired up, and how to maintain it.

## Quick start (5 steps)

1. **Open** `xfalcon-falcon-marketing-kit/index.html` in a browser. That's the portal — every dashboard is reachable from here.
2. **Pick a theme** from the dropdown in the portal filter bar (Midnight Galaxy or Sunset Boulevard). The choice persists as you navigate.
3. **Click any dashboard card** to open the deep view. Each dashboard has its own filter bar.
4. **Use the Compare Years toggle** when you want 3-year side-by-side context — KPIs become stacked per-year and charts become grouped/overlaid.
5. **Use Back to Portal** (top-right of every dashboard) to return.

## What's in the kit

```
xfalcon-falcon-marketing-kit/
├── index.html                       portal (start here)
├── 01-executive-overview.html       hero KPIs, total agency revenue, channel mix
├── 02-client-portfolio.html         per-client view, account tiers, segments
├── 03-campaign-performance.html     ROAS, CTR, CVR, top campaigns
├── 04-media-spend.html              planned vs actual, CPM, agency fees
├── 05-production-operations.html    throughput, turnaround, rush %, on-spec %
├── 06-project-margin.html           SOW vs billed, margin %, on-time %
├── 07-employee-utilization.html     hours by dept, cost vs bill rate margin
├── 08-geographic-performance.html   region/DMA/tier breakdown
├── 09-channel-mix.html              paid/owned/earned, channel ROAS ranking
├── 10-service-line-mix.html         creative/strategy/production/media split
├── 11-qbr-q4-2024.html              quarterly executive summary
├── metrics-definitions.html         searchable KPI reference
├── theme.css                        runtime theme overrides
├── theme.js                         theme persistence + URL propagation
└── docs/
    ├── DASHBOARD_FEASIBILITY.md
    ├── DATA_SCHEMA_MAP.md
    ├── METRIC_DEFINITIONS.md
    ├── GLOBAL_FILTERS.md
    ├── QUERY_TEMPLATES.sql
    ├── VALIDATION_BENCHMARKS.md
    ├── MIDNIGHT_GALAXY_THEME.md
    ├── SUNSET_BOULEVARD_THEME.md
    ├── SETUP_GUIDE.md (this file)
    └── SKILL.md (build instructions for future Claude sessions)
```

## Theme switcher

The portal has a Theme dropdown. Choices:
- **Midnight Galaxy** (default) — deep purple chrome, light body
- **Sunset Boulevard** — burnt orange / coral on cream

The choice writes `?theme=sunset` (or removes it for default) to the URL. `theme.js` then rewrites every internal link on click so the theme follows you across dashboards. Chart data colors stay constant (purple/lavender/gray for Midnight, coral/orange/sand for Sunset is NOT used — chart series semantics never change with theme so YoY comparisons stay readable when switching).

## Filters

Every dashboard's filter bar is the single source of truth — KPIs, charts, AND tables all re-aggregate from the same filtered subset. If a filter isn't moving a chart, it's a bug.

Filters available depend on the dashboard:

| Dashboard | Year | Compare Years | Client | Tier | Region | Channel | Department |
|-----------|------|---------------|--------|------|--------|---------|------------|
| 01 Executive | ✓ | ✓ | | | | | |
| 02 Client | ✓ | ✓ | ✓ | ✓ | | | |
| 03 Campaign | ✓ | ✓ | | | | ✓ | |
| 04 Media | ✓ | ✓ | | | | ✓ | |
| 05 Production | ✓ | ✓ | ✓ | | | | |
| 06 Project Margin | ✓ | ✓ | ✓ | | | | |
| 07 Utilization | ✓ | | | | | | ✓ |
| 08 Geographic | ✓ | ✓ | | | ✓ | | |
| 09 Channel | ✓ | ✓ | | | | ✓ | |
| 10 Service Line | ✓ | ✓ | | | | | |
| 11 QBR | (Q4 fixed) | | | | | | |

## Maintenance

### Refreshing data
Each dashboard embeds its data inline as a JS array. To refresh:
1. Open `QUERY_TEMPLATES.sql` and run the queries against the IDA connector.
2. Replace the `var DATA = [...]` block at the top of the dashboard's `<script>` with the new rows.
3. Update the disclaimer footer's "data through" date.

### Adding a new dashboard
1. Pick the next number (12+) to keep portal numbering sequential.
2. Copy the structure of an existing dashboard (e.g., `01-executive-overview.html`) — topbar, filter bar, KPIs, charts, table, footer.
3. Update title, queries, embedded data, and chart configs.
4. Add a card to `index.html`'s dashboard directory.
5. Add the metric labels to `metrics-definitions.html` (and `METRIC_DEFINITIONS.md`).
6. Run the Pre-Delivery QA checklist in `SKILL.md`.

### Adding a third theme
1. Read `MIDNIGHT_GALAXY_THEME.md` for the role-mapping pattern.
2. Pick a palette from the Theme Reference Library (theme-factory skill) or generate a new one.
3. Add a CSS block to `theme.css` under `[data-theme="<slug>"]`.
4. Add an `<option>` to the `#themeSel` dropdown in `index.html`.
5. Document in a new `<SLUG>_THEME.md` file.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| All charts on one dashboard are blank | JS syntax error (extra brace, wrong type) — see `node --check` rule | Run `node --check <file.js>` |
| Single chart blank | Wrong chart type (e.g. `barh`), CSS var passed to Chart.js | Check that all chart colors are HEX, not `var(--…)` |
| Filter doesn't update KPIs | `updateKPIs(filtered)` ignoring the parameter | Make sure update function reads from `filtered`, not the global `DATA` |
| Theme doesn't persist | Click target isn't an `.html` link, or `theme.js` not loaded | Verify `<script src="theme.js">` is before `</body>` and link href ends in `.html` |
| Numbers don't match VALIDATION_BENCHMARKS | Filter applied that shouldn't be | Inspect SQL — check no surprise WHERE clauses |
