# Setup Guide — Falcon Telecom & Media Analytics Kit

## What you have

A complete analytics kit for the Falcon Telecom & Media synthetic warehouse:
- 11 self-contained HTML dashboards covering all 6 fact-table domains
- 1 portal page (`index.html`) linking to every dashboard
- 1 metrics-definitions reference page
- Runtime theme switcher (Spectrum light default + Tech dark alternate)
- Reference docs for every part of the build

## Quick Start (5 steps)

1. **Open the portal**: double-click `index.html`. The Spectrum theme loads by default.
2. **Switch themes**: use the "Theme" dropdown on the portal — pick Tech (dark) to see the alternate. Theme propagates to every dashboard you click into via `?theme=` on the URL.
3. **Click any dashboard card**: each loads as a self-contained HTML file with embedded data, no server required.
4. **Use the filter bar**: every dashboard has Year, Carrier, and Region filters. The Compare Years toggle (where data spans multiple years) shows 3-year stacked KPIs and grouped chart series.
5. **Reference**: `metrics-definitions.html` from the portal — searchable, categorized list of every metric used.

## Detailed Setup

### File structure

```
xfalcon-falcon-tm-kit/
├── index.html                       Portal — start here
├── theme.css                        Runtime theme overrides (Tech dark)
├── theme.js                         Theme detection + URL propagation
├── metrics-definitions.html         Searchable KPI reference
├── 01-executive-overview.html       Cross-domain executive view
├── 02-subscriber-performance.html   Lifecycle events, demographics
├── 03-billing-revenue.html          Bill components, ARPU, payment health
├── 04-plan-carrier-mix.html         Plan-type and carrier breakdown
├── 05-advertising-revenue.html      Top advertisers, formats, channels
├── 06-streaming-viewership.html     Sessions, completion, binge, platforms
├── 07-content-rights.html           License fees, exclusivity, top licensors
├── 08-live-events-tickets.html      Event types, tier mix, dynamic pricing
├── 09-geographic-performance.html   DMAs, regions, cross-domain by geo
├── 10-subscriber-360.html           Cross-domain engagement by segment
├── 11-churn-analysis.html           Churn reasons, carrier × tenure, win-back
├── DASHBOARD_FEASIBILITY.md         Feasibility matrix
├── DATA_SCHEMA_MAP.md               Schema reference
├── SPECTRUM_THEME.md                Default theme spec
├── METRIC_DEFINITIONS.md            Internal KPI reference (the build source)
├── GLOBAL_FILTERS.md                Filter and exclusion rules
├── QUERY_TEMPLATES.sql              Starter SQL for every dashboard
└── SKILL.md                         Project-specific build skill (for AI agents)
```

### Themes

**Default (Spectrum — light, derived from spectrum.com):**
- Page bg `#F4F6F9`, cards white, topbar `#003057` (deep navy)
- Primary accent `#0099D8` (Spectrum blue), Secondary `#003057`, Tertiary `#77787B`
- Light theme — KPI deltas use standard green (#059669) / red (#D32F2F)

**Alternate (Tech — dark techno):**
- Page bg `#0A0E1A` (near-black), cards `#141B2D`, topbar pure black with neon cyan accent line
- Primary `#00D4FF` (neon cyan), Secondary `#7C3AED` (electric purple), Tertiary `#94A3B8`
- Dark theme — KPI deltas use neon green (#7CFF01) / hot pink (#FF3366) for contrast on dark bg
- KPI values, chart titles, and the topbar accent line get subtle glow effects

Theme switching is non-destructive — swap themes without reloading data, and every internal link carries the choice forward.

### Filter bar

Every dashboard uses the same filter pattern:

```
[ Year ▼ ]  [ ▢ Compare Years ]  [ Carrier ▼ ]  [ Region ▼ ]  [ Theme ▼ on portal only ]
```

- **Year**: single-select, defaults to 2025. Drives all KPIs and charts to that year.
- **Compare Years**: toggle. When ON, the year selector greys out and KPI cards become 3-year stacked tables; charts switch to grouped/overlaid series.
- **Carrier**: defaults to "Prospects only" (5 prospect carriers). Switch to "All" to include the 3 reference carriers.
- **Region**: multi-select, defaults to All 4 regions.

Dashboard-specific filters (Segment, Plan Type, Genre, etc.) are added per dashboard.

## Re-running queries against fresh data

The dashboards ship with embedded data (point-in-time snapshot from build). To refresh:

1. Open `QUERY_TEMPLATES.sql`
2. For each dashboard, locate its query block (commented section header)
3. Run via `ida_query()` against connector `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`
4. Replace the `var DATA = [...]` declaration in the corresponding HTML file with the new result set
5. Test in browser — the dashboard re-renders automatically

## Troubleshooting

### Charts are blank
1. Check browser console for JS errors
2. Confirm `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js` is reachable (CDN may be blocked on corporate networks)
3. Look for an extra `}` in the chart config — the #1 cause of fully blank pages
4. Verify all chart canvases have a matching `new Chart()` call in JS

### Filters don't update charts
- Check that every `updateXxx(filtered)` function uses the `filtered` parameter, not the global `DATA` array
- Confirm `applyFilters()` is bound to every `<select onchange="">` and the toggle's `onclick`
- Verify `applyFilters()` is called once on page load to render the default state

### "Light theme is white-on-white" or "Theme didn't change"
- Make sure the `<script>` block right after `</title>` is present on every HTML file:
  `<script>document.documentElement.setAttribute('data-theme', new URLSearchParams(location.search).get('theme') || 'spectrum')</script>`
- Confirm `theme.css` is in the same folder as the HTML files
- Confirm `theme.js` is loaded before `</body>`

### IDA query times out on cross-fact joins
- Avoid 3+ LEFT JOINs across million-row fact tables (FACT_BILLING + FACT_AD_REVENUE + FACT_TICKET_SALES is the danger combination)
- Run per-fact aggregations separately, then combine in JS
- See QUERY_TEMPLATES.sql §1.2 for an example of how to structure cross-fact trends

### Schema prefix issue
- This warehouse uses NO schema prefix. Call tables by bare name: `FACT_BILLING` not `public.FACT_BILLING`.

## Validation Benchmarks

Spot-check these values when building or refreshing — they should match within ±1% (small variance from dataset sampling is acceptable):

| Metric | Expected value | Source |
|---|---|---|
| Total billing revenue, 2025 | $13,570,085.57 | FACT_BILLING |
| Total billing revenue, 2024 | $12,855,388.95 | FACT_BILLING |
| Charter Communications lifetime billing | $17,581,023.96 | FACT_BILLING × DIM_CARRIER |
| Total ad gross revenue, 2025 | $1,722,589,467.64 | FACT_AD_REVENUE |
| Top advertiser (Amazon, lifetime gross) | $775,795,570.82 | FACT_AD_REVENUE × DIM_ADVERTISER |
| Streaming sessions, 2025 | 186,274 | FACT_VIEWERSHIP |
| Avg completion %, all years | ~54.8% | FACT_VIEWERSHIP |
| Ticket revenue, 2025 (Concert) | $14,826,101.45 | FACT_TICKET_SALES |
| Content rights deals, 2025 | 8,894 | FACT_CONTENT_RIGHTS |
| Total active subscribers | 88,000 | DIM_SUBSCRIBER WHERE IS_ACTIVE |

## Build Checklist (for re-builds or extensions)

Before delivering any updated dashboard:

- [ ] CDN URL is exactly `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`
- [ ] No `type: 'barh'` anywhere — use `type: 'bar'` with `indexAxis: 'y'` for horizontal bars
- [ ] All Chart.js dataset colors are hex strings (`'#0099D8'`), NEVER `var(--color-primary)`
- [ ] No red or green in chart datasets — only in KPI delta text
- [ ] Back link is `href="index.html"` and on the RIGHT of the topbar
- [ ] At least 6 KPI cards, 4 charts, 1 detail table per dashboard
- [ ] Every KPI label includes the year (e.g., "Net Sales 2024")
- [ ] Compare Years toggle implemented for any year-based dashboard
- [ ] Theme detection script after `</title>`, theme.css linked, theme.js before `</body>`
- [ ] Filter changes update KPIs AND charts AND tables (not just one)
- [ ] `fitKpiText()` called on load and after every filter change

See `SKILL.md` for full build rules.
