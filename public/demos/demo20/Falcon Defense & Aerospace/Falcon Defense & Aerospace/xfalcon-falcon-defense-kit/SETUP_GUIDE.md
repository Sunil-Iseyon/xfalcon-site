# Setup Guide — Falcon Defense & Aerospace

## Quick start (5 steps)

1. Open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge).
2. Pick a theme from the top-right dropdown — **Modern Minimalist** (default) or **Clean Light**. Choice is remembered via the URL (`?theme=clean-light`) and propagates to every dashboard when you click a card.
3. Use the global **Year** filter to pick a reporting period. Toggle **Compare Years** to overlay all 5 years at once.
4. Click any dashboard card in the Dashboard Directory to drill in.
5. Use the back link (top-right of any dashboard) to return to the portal.

## File organization

```
xfalcon-falcon-defense-kit/
├── index.html                        # Portal (start here)
├── theme.css                         # Runtime theme overrides
├── theme.js                          # Theme URL propagation
├── metrics-definitions.html          # User-facing metric reference
│
├── 01-executive-overview.html        # Dashboards (built in Stage 5)
├── 02-program-financial.html
├── 03-earned-value-management.html
├── 04-billing-vs-cost.html
├── 05-agency-program-rollups.html
├── 06-supply-chain.html
├── 07-labor-utilization.html
├── 08-contract-portfolio.html
│
├── autoexplore-dashboard.html        # Supply chain insight reports
├── autoexplore-memo.html
├── autoexplore-journal.md
│
├── DASHBOARD_FEASIBILITY.md          # Reference docs
├── DATA_SCHEMA_MAP.md
├── METRIC_DEFINITIONS.md
├── GLOBAL_FILTERS.md
├── MODERN_MINIMALIST_THEME.md
├── QUERY_TEMPLATES.sql
├── SETUP_GUIDE.md                    # (this file)
├── VALIDATION_BENCHMARKS.md
└── SKILL.md                          # For future Cowork sessions
```

## Dashboard build checklist (per-dashboard, self-use)

- [ ] Real data embedded (not placeholder arrays)
- [ ] Chart.js CDN is `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`
- [ ] No `type: 'barh'` anywhere
- [ ] Every `<canvas>` matched by a `new Chart()` call
- [ ] Back link: `href="index.html"` on the right side
- [ ] At least 6 KPI cards (single-year values, YoY delta)
- [ ] At least 4 charts, each with year label
- [ ] Detail table with 7+ rows and YoY column
- [ ] Disclaimer footer explaining filters (BUDGET_VERSION='Revised', etc.)
- [ ] Compare Years toggle wired up
- [ ] Theme-detection script inline after `</title>`, before stylesheets
- [ ] `theme.css` and `theme.js` linked

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| All charts blank | `chart.min.js` used instead of `chart.umd.js` | Replace CDN URL exactly |
| One chart blank, others fine (until that point in file) | Syntax error in chart config; script halted | `node --check <file>` on extracted JS |
| "Filter doesn't change anything" | `updateKPIs(filtered)` loops over unfiltered global | Every update fn must read from `filtered` parameter |
| KPI values inflated 2× | BUDGET_VERSION filter missing | Add `WHERE b.BUDGET_VERSION = 'Revised'` |
| Theme resets when clicking dashboard card | `theme.js` not loaded or link rewrite broken | Verify script tag before `</body>` on every page |
| Green/red text invisible on theme switch | Delta color mismatched to background | Light themes: `#059669`/`#D32F2F`. Dark themes: `#7CFF01`/`#FF3366` |

## Refreshing data

The demo data is pre-cached in IDA. To refresh:

1. Open a new Cowork session on this project.
2. The project SKILL.md will auto-load with schema + filter reminders.
3. Run queries from `QUERY_TEMPLATES.sql` via `ida_query()`.
4. Replace the embedded `var DATA = [...]` arrays in each HTML file.

## Future-session onboarding

Tell Cowork: *"Load the Falcon Defense & Aerospace kit and rebuild dashboard 3 with the latest EVM data."* The project SKILL.md carries forward: correct IDA connector, schema, required filters, theme tokens, and QA checklist.
