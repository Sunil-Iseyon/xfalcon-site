---
name: falcon-defense-build
description: Build, extend, or refresh dashboards in the Falcon Defense & Aerospace xFalcon AnalyticsPro kit. Loads schema, required filters, theme tokens, and QA rules. Trigger on "falcon defense dashboard", "ARES dashboard", "rebuild dashboard N", or any work touching this kit.
---

# Falcon Defense & Aerospace — Build Skill

Self-contained project context for any future Cowork session that touches this kit. Read this BEFORE writing queries or HTML.

## Connection & schema

- **IDA connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__ida_query`. If multiple IDA connectors appear, always verify which one has `FACT_CONTRACT_REVENUE` before querying. Others may point to different databases.
- **Schema prefix:** No prefix needed. Tables resolve with bare names (e.g., `SELECT ... FROM FACT_CONTRACT_REVENUE`).
- **Data window:** 2020-01-01 → 2024-12-31. DIM_DATE extends to 2026-12-31 for forward planning.
- **Fiscal year:** US Federal FY, October–September. `DIM_DATE.FISCAL_YEAR` is pre-computed. Don't derive it — use the column.

## Required filters (NON-NEGOTIABLE)

| Filter | Table | Reason |
|---|---|---|
| `WHERE BUDGET_VERSION = 'Revised'` | FACT_PROGRAM_BUDGET | Original and Revised duplicate every row with identical budgets. Unfiltered = 2× inflation. Only exception: the "Baseline Shift" chart that intentionally compares both. |
| `WHERE IS_ACTIVE = TRUE` | DIM_EMPLOYEE, DIM_SUPPLIER | Only when showing current-state dim tables. Fact-table history keeps all rows. |
| `WHERE PERIOD_OF_PERF_END >= CURRENT_DATE` | DIM_CONTRACT | "Active contract" filter. DIM_CONTRACT has no IS_ACTIVE flag — derive from period-of-perf. Historical trends do not apply this filter. |

Save any new filter discoveries via `ida_save_memory(category='filter')`.

## Common Column Name Mistakes

| Wrong | Correct |
|---|---|
| `REVENUE_USD` | `RECOGNIZED_REV_USD` |
| `COST_USD` | `INCURRED_COST_USD` |
| `FEE_USD` | `FEE_EARNED_USD` |
| `BILLED_USD` | `BILLED_AMOUNT_USD` |
| `IS_ACTIVE` on DIM_CONTRACT | DOESN'T EXIST — use `PERIOD_OF_PERF_END >= CURRENT_DATE` |
| `AGENCY_NAME` (for charts) | `AGENCY_SHORT` |
| `PROGRAM_NAME` (for labels) | `PROGRAM_CODE` (e.g., "ARES-TITAN") |
| `TIER` | `SUPPLIER_TIER` (smallint 1/2/3) |
| `OTD` | `ON_TIME_DELIVERY_PCT` (dim, avg) or `ON_TIME_FLAG` (fact, per-PO) |

## Theme

- **Primary theme:** Modern Minimalist (charcoal `#36454F`, slate `#708090`, white surface)
- **Alternate theme:** Clean Light (navy `#0F172A`, blue `#006AFF`)
- **Delivery:** runtime switcher via `theme.css` + `theme.js` with `?theme=clean-light` URL param
- **Logo:** "xF" (x = primary, F = secondary)
- **Typography:** Inter from Google Fonts, Inter 16/18/28/13 scale

**Status color rules (NEVER violate):**
- Red `#D32F2F` and Green `#059669` used ONLY in KPI delta text
- Chart datasets use only Primary/Secondary/Tertiary + 2 extended colors (Amber `#F59E0B`, LightBlue `#0EA5E9`)
- Budget and Prior-Year lines get `borderDash: [5, 5]`

## Chart.js build rules (MUST FOLLOW)

```
CDN URL:  https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js
NEVER:    type: 'barh'   →  use type: 'bar' + indexAxis: 'y'
NEVER:    var() in chart configs  →  inline hex strings only
ALWAYS:   mk(id, cfg) helper destroys old instance before new Chart()
ALWAYS:   String(value) in DOM table builders
ALWAYS:   var (not const/let), function() {} (not arrow), string concat (not template literals)
```

## Dashboard skeleton (every file)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"><title>Falcon Defense &amp; Aerospace / N. Name</title>
  <script>document.documentElement.setAttribute('data-theme',new URLSearchParams(location.search).get('theme')||'modern-minimalist')</script>
  <link rel="stylesheet" href="theme.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
  <style>/* inline styles using CSS vars from theme */</style>
</head>
<body>
  <header class="topbar">…</header>
  <div class="filter-bar">…</div>
  <main class="content">
    <section class="kpi-grid">…at least 6 KPI cards (single-year)…</section>
    <section class="chart-grid">…at least 4 Chart.js canvases…</section>
    <section class="table-wrap">…detail table with ≥7 rows + YoY column…</section>
    <section class="disclaimer">Reporting period, filter notes.</section>
  </main>
  <script>
    var DATA = [...];
    var chartInstances = {};
    function mk(id, cfg) { if (chartInstances[id]) chartInstances[id].destroy(); chartInstances[id] = new Chart(document.getElementById(id).getContext('2d'), cfg); return chartInstances[id]; }
    var state = { year: 2024, compare: false, /* filters */ };
    function applyFilters() { /* filter DATA, call updateKPIs/Charts/Table/Subtitle/fitKpiText */ }
    function fitKpiText() { /* 18/22/28 based on length */ }
    function toggleCompare() { state.compare = !state.compare; applyFilters(); }
    document.addEventListener('DOMContentLoaded', applyFilters);
  </script>
  <script src="theme.js"></script>
</body>
</html>
```

## Single-Year KPI Rule

Every KPI card shows ONE year's value. Never sum across years inside a single card. Multi-year = Compare Years Toggle pattern. Label text includes the year ("Revenue 2024", not "Revenue").

## Topbar consistency

- Logo: `<span class="logo-x">x</span><span class="logo-f">F</span>`
- Title: `Falcon Defense & Aerospace / N. Dashboard Name`
- Subtitle: `Reporting Period: Jan–Dec 2024` (dynamic via `updateSubtitle()`)
- Back link: `<a href="index.html">← Back to Portal</a>` on the RIGHT
- Back link hover: underline only, never color change

## Pre-Delivery QA (per dashboard)

Run before shipping:

1. **Chart.js:** exact CDN URL, no `barh`, every canvas matched by `new Chart()`
2. **Colors:** no red/green in chart datasets, 3-color palette, Budget/Prior dashed
3. **Navigation:** back link = `index.html`, right side, works
4. **Depth:** ≥6 KPIs, ≥4 charts, 7+ row table, disclaimer, year labels everywhere
5. **JS syntax:** `node --check` on extracted script block
6. **JS safety:** var/function/string-concat
7. **Theme:** data-theme script inline after title, theme.css + theme.js linked
8. **Data:** no flat arrays, x-axis label count matches dataset length, BUDGET_VERSION filter applied, no 2×-inflated totals
9. **Topbar:** logo "xF", title format `Brand / N. Name`, back link RIGHT
10. **Metrics page:** every KPI/chart label represented in metrics-definitions.html

## Useful pre-validated numbers

- 2024 Recognized Revenue: **$61,789M**
- 2024 Program Budget (Revised): **$11,912M / Actual $12,148M (2.0% over)**
- Portfolio CPI 2024: ~0.97 (weighted by incurred cost)
- Portfolio SPI 2024: ~0.95
- Active suppliers by tier: 10 / 16 / 172
- Tier 3 OTD: 79.15% (headline risk story)

## Kit path on disk

`/Users/xfalconai/Desktop/Falcon Defense & Aerospace/Falcon Defense & Aerospace/xfalcon-falcon-defense-kit/`

## Change log

- 2026-04-20 — initial generation; 8 dashboards scoped, Modern Minimalist + Clean Light switcher, AutoExplore on supply chain.
