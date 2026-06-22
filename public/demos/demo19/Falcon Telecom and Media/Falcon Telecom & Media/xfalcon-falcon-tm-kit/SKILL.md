---
name: falcon-telecom-media-build
description: Project-specific build skill for the Falcon Telecom & Media analytics kit. Loads the schema map, theme spec, metric definitions, global filters, and dashboard list. Trigger when user references "Falcon Telecom & Media", "FT&M", "telecom-media demo", or asks to refresh/edit/extend dashboards inside `xfalcon-falcon-tm-kit/`.
---

# Falcon Telecom & Media — Project Build Skill

This skill carries the full project context so future sessions can pick up where the original build left off. Read this before editing any dashboard, refreshing data, or adding new views.

## Database Connector (CRITICAL)

**Use ONLY**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__ida_*`

Do NOT use the alternate connector `mcp__64903a22-f20e-4e90-a927-ce7f47369f0a` — it requires authentication and connects to a different database.

**Schema prefix**: NONE. Call tables by bare name (`FACT_BILLING`, not `public.FACT_BILLING`).

**Cross-fact join performance**: Avoid 3+ LEFT JOINs on million-row fact tables. The combination FACT_BILLING + FACT_AD_REVENUE + FACT_TICKET_SALES with month grouping times out. Run per-fact aggregations separately, combine in JS.

## Common Column Name Mistakes

| Wrong assumption | Actual column | Where |
|---|---|---|
| `DATE` | `DATE_KEY` (INT YYYYMMDD) | All facts |
| `SUBSCRIBER_ID` (in fact tables) | `SUBSCRIBER_KEY` | All facts; SUBSCRIBER_ID is on DIM_SUBSCRIBER as a string business key |
| `EVENT_TYPE` (live event) | DIM_EVENT.EVENT_TYPE for live events; FACT_SUBSCRIBER_EVENTS.EVENT_TYPE for lifecycle. Two different things — don't confuse. |
| `TOTAL_REVENUE` (ad) | `GROSS_REVENUE` or `NET_REVENUE` on FACT_AD_REVENUE; no TOTAL column |
| `PRICE` (ticket) | `FACE_VALUE` (base) + `SERVICE_FEE` + `DYNAMIC_MARKUP` = TOTAL_REVENUE |
| `STATE` | `STATE_CODE` and `STATE_NAME` on DIM_GEOGRAPHY |
| `IS_PORT_IN`/`IS_PORT_OUT` | Filter `EVENT_TYPE = 'Port-In'`. Use `IS_NEW_ACQ` (covers acq+port-in+reactivation) and `IS_CHURN` (covers churn+port-out) flags |
| `EXCLUSIVITY_TYPE` | Just `EXCLUSIVITY` on FACT_CONTENT_RIGHTS |
| `LIFETIME_VALUE` | `LIFETIME_VALUE_EST` |
| `IS_BINGE_WATCHER` | Just `IS_BINGE` |
| `RATING` (viewership) | EXISTS but mostly NULL — always `WHERE RATING IS NOT NULL` |

## Required Filters

### Filter 1: Active subscribers only on "current base" KPIs
```sql
JOIN DIM_SUBSCRIBER s ON ... WHERE s.IS_ACTIVE = TRUE
```
Apply to: Active Subs count, ARPU on active base, "current" billing.
Do NOT apply to: Historical billing trends, Churn analysis (we want churned accounts), Subscriber 360 (uses cross-domain to see all engagement).

### Filter 2: Prospect carriers only by default
```sql
JOIN DIM_CARRIER c ON ... WHERE c.IS_PROSPECT = TRUE
```
Apply to: Default lens on every dashboard (5 prospects: AT&T, Verizon, T-Mobile US, Charter, Comcast).
Override: User toggle "Include reference carriers" → removes the filter, all 8 carriers visible.
Same rule for `DIM_MEDIA_PLATFORM.IS_PROSPECT` (9 prospect platforms vs Netflix/Prime/AppleTV+).

### Filter 3: NULL ratings excluded from rating averages
`WHERE RATING IS NOT NULL` on any FACT_VIEWERSHIP query that uses RATING.

### Filter 4: Disputed bills INCLUDED in default revenue (only Defaulted excluded)

Disputed = 2% of bills, steady-state. Filter only Defaulted by default.

## NO Redundant-Grain Dimension

This warehouse has NO `GOAL_TYPE_KEY` / `BUDGET_TYPE` / `SCENARIO_ID` style column that would inflate sums 5–10×. Direct sums work correctly. (Verified by spot-checking 2025 totals against the schema descriptions.) This is unusual and good — but always re-verify if new fact tables are added.

## Theme Specification

**Default theme: Spectrum**
- Topbar `#003057`, Page bg `#F4F6F9`, Cards `#FFFFFF`
- Primary `#0099D8`, Secondary `#003057`, Tertiary `#77787B`
- Logo: "x" in `#0099D8`, "F" in `#003057` on white chip

**Alternate theme: Tech (dark techno)** (loaded via `?theme=tech`)
- Topbar `#000000` (pure black) with `#00D4FF` accent line, Page bg `#0A0E1A`, Cards `#141B2D`
- Primary `#00D4FF` (neon cyan), Secondary `#7C3AED` (electric purple), Tertiary `#94A3B8`
- KPI values, chart titles, and topbar accent line get subtle glow via text-shadow
- Logo: "x" in `#00D4FF`, "F" in `#7C3AED` on `#1F2937` chip

Year SEMANTICS stay constant across themes (2022 = neutral, 2025 = primary), but the actual hex values shift theme-to-theme so colors stay visible against either background. Use `getPalette()` at chart-render time, never hardcode hex values for year-mapped series.

Status colors:
- Spectrum (light): Positive #059669, Negative #D32F2F
- Tech (dark): Positive #7CFF01 (neon green), Negative #FF3366 (hot pink)
KPI delta classes (`.positive`, `.negative`, `.neutral`) auto-pick the right hex via theme.css overrides.

## Build Rules

### Topbar (identical on every dashboard)
```html
<div class="topbar">
  <div class="topbar-left">
    <span class="logo"><span class="logo-x">x</span><span class="logo-f">F</span></span>
    <div class="topbar-title">
      Falcon Telecom &amp; Media / N. Dashboard Name
      <div class="topbar-subtitle">Reporting Period: 2025</div>
    </div>
  </div>
  <a href="index.html" class="back-link">← Back to Portal</a>
</div>
```
- Logo: short form "xF", x = primary, F = secondary on white chip
- Back link: ALWAYS `href="index.html"`, on RIGHT side, hover = underline only
- Title format: `Project Name / N. Dashboard Name` — include the dashboard number

### Theme detection (every HTML file, right after </title>)
```html
<script>document.documentElement.setAttribute('data-theme', new URLSearchParams(location.search).get('theme') || 'spectrum')</script>
<link rel="stylesheet" href="theme.css">
```
And `<script src="theme.js"></script>` before `</body>`.

### Chart.js (firm rules)
- CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js` (exact)
- NEVER `type: 'barh'` — use `type: 'bar'` + `indexAxis: 'y'`
- Hex strings in datasets, NEVER `var(--color-primary)` (silently fails)
- mk() helper for chart instance management ONLY (never overload for DOM creation)
- No pies/doughnuts in primary content — use horizontal bar or stacked proportion bar (doughnut for tier mix on event dashboard is OK as a single exception)
- Strict 3-color palette: Primary/Secondary/Tertiary. Red/green ONLY in KPI delta text.

### YoY x-axis labels
- Use `months12 = ['Jan', ..., 'Dec']` for 2-dataset YoY charts (12-point overlay)
- Use `monthsAll = ['Jan 24', ..., 'Dec 25']` for single-dataset 24-month trends
- NEVER mix — always verify `labels.length === datasets[0].data.length`

### Single-Year KPI Rule
KPI cards show ONE year's value + YoY delta. Multi-year sums on KPI cards are forbidden. Use Compare Years toggle for multi-year presentation (stacked mini-table per card).

### Filter coverage
Every filter must update KPIs + charts + tables. Common bug: `updateKPIs(filtered)` accepts `filtered` but loops over global `DATA`. Verify every aggregator uses the parameter.

### fitKpiText() pattern
Required on every dashboard. Dynamic font-sizing based on text length:
- ≤8 chars → 28px
- 9–12 chars → 22px
- >12 chars → 18px

Call after every `applyFilters()` and on page load.

## Dashboard Numbering

Numbered 1–11. Reference dashboards by number when communicating with the user (e.g., "fix dashboard 8" means `08-live-events-tickets.html`).

| # | File | Title |
|---|---|---|
| 0 | index.html | Portal |
| 1 | 01-executive-overview.html | Executive Overview |
| 2 | 02-subscriber-performance.html | Subscriber Performance |
| 3 | 03-billing-revenue.html | Billing & Revenue |
| 4 | 04-plan-carrier-mix.html | Plan & Carrier Mix |
| 5 | 05-advertising-revenue.html | Advertising Revenue |
| 6 | 06-streaming-viewership.html | Streaming Viewership |
| 7 | 07-content-rights.html | Content Rights & Licensing |
| 8 | 08-live-events-tickets.html | Live Events & Tickets |
| 9 | 09-geographic-performance.html | Geographic Performance |
| 10 | 10-subscriber-360.html | Subscriber 360 (Cross-Domain) |
| 11 | 11-churn-analysis.html | Churn Analysis Deep Dive |
| Ref | metrics-definitions.html | Searchable KPI reference |

## Validation Benchmarks

| Metric | Expected | Source |
|---|---|---|
| Billing rev, 2025 | $13,570,085.57 | FACT_BILLING |
| Billing rev, 2024 | $12,855,388.95 | FACT_BILLING |
| Charter lifetime billing | $17,581,023.96 | FACT_BILLING × DIM_CARRIER |
| Ad gross, 2025 | $1,722,589,467.64 | FACT_AD_REVENUE |
| Amazon lifetime ad | $775,795,570.82 | FACT_AD_REVENUE × DIM_ADVERTISER |
| Sessions, 2025 | 186,274 | FACT_VIEWERSHIP |
| Avg completion %, lifetime | ~54.8% | FACT_VIEWERSHIP |
| Concert ticket rev, 2025 | $14,826,101.45 | FACT_TICKET_SALES |
| Rights deals, 2025 | 8,894 | FACT_CONTENT_RIGHTS |
| Active subscribers | 88,000 | DIM_SUBSCRIBER WHERE IS_ACTIVE |

## Pre-Delivery QA Checklist

Run on every HTML file before presenting:

1. **Chart.js**: CDN URL exact; no 'barh'; every canvas has `new Chart()`; no `var()` in datasets; mk() not overloaded; data arrays not empty
2. **Color compliance**: No red/green in datasets; only Primary/Secondary/Tertiary in charts; ≤5 colors max
3. **Navigation**: Back link `href="index.html"` on RIGHT of topbar; underline-only hover
4. **Content**: ≥6 KPI cards (single-year), ≥4 charts, ≥1 table with 7+ rows + YoY column, ≥1 disclaimer
5. **JS syntax**: `node --check` extracted script content; counted braces; no `const`/`let`/arrows/template-literals; numeric → String() before DOM
6. **Theme**: `data-theme` script after `</title>`; theme.css linked; theme.js before `</body>`; theme dropdown wired on portal only
7. **Topbar**: Logo "xF" identical; title format `Project / N. Name`; back link RIGHT side
8. **Data quality**: No `[X, X, X, X]` flat arrays; x-axis label count matches dataset length; KPI values in primary color; table headers dark on white text
9. **Metrics page**: every KPI label, chart label, and table header column representing a metric is present in `metrics-definitions.html`
10. **Filter coverage**: every filter updates KPIs + charts + tables; no stale `DATA` references inside `updateXxx(filtered)` functions
