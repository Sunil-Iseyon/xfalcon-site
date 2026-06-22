# Falcon Real Estate — Setup Guide

## Quick Start (5 Steps)

1. **Read the theme** — Open `RETAILEDGE_THEME.md` and copy the CSS variables block into every dashboard HTML file.
2. **Check feasibility** — Review `DASHBOARD_FEASIBILITY.md` to see which dashboards are READY (11 of 12).
3. **Run a test query** — Copy any query from `QUERY_TEMPLATES.sql` and run it via `ida_query()` to verify data access.
4. **Build your first dashboard** — Start with the Portfolio Overview using the `ida-dashboard` skill. The portal (index.html) will link to all dashboards.
5. **Follow the build order** — Work through dashboards in the recommended sequence from the feasibility matrix.

## Detailed Setup

### Step 1: Understand Your Data

Your database has **17 tables** in a star schema centered on `DIM_PROPERTY`:

- **8 Fact Tables:** NOI, Occupancy, Rent Collection, Lease, Maintenance WO, CapEx Projects, Market Benchmarks, Tenant Renewal
- **9 Dimension Tables:** Property (hub), Asset Class, Market, Tenant, Property Manager, Lease Type, Maintenance Category, CapEx Category, Time

Key relationships:
- Every fact table joins to `DIM_PROPERTY` via `PROPERTY_ID`
- Monthly fact tables (NOI, Occupancy, Rent Collection) join to `DIM_TIME` via `MONTH_ID`
- `FACT_MARKET_BENCHMARK` is quarterly — joins via `QUARTER_ID`

See `DATA_SCHEMA_MAP.md` for complete column mappings.

### Step 2: Apply Global Filters

Every query must include these base filters (see `GLOBAL_FILTERS.md`):
- `WHERE p.IS_ACTIVE = TRUE` — excludes inactive properties
- COVID period (2020-03 to 2021-06) should be visually flagged, not excluded
- Rate hike period (2022-03 to 2023-12) should be annotated on trend charts

### Step 3: Use Correct Metric Formulas

All KPI calculations are defined in `METRIC_DEFINITIONS.md`. Key rules:
- NOI, NOI_MARGIN_PCT, and NOI_PER_SQFT_UNIT are pre-computed and CHECK-constrained — use the column values directly
- Occupancy metric labels vary by asset class — check `DIM_ASSET_CLASS.OCCUPANCY_METRIC_LABEL`
- NOI margin benchmarks vary by asset class — don't use a single portfolio-wide number
- Collection rate = `RENT_COLLECTED_USD / TOTAL_CHARGED_USD * 100`
- At-risk tenants = `CONSECUTIVE_DELINQUENT_MONTHS >= 3`

### Step 4: Build Each Dashboard

For each dashboard:
1. Copy the relevant queries from `QUERY_TEMPLATES.sql`
2. Run each query via `ida_query()` to get the data
3. Use the `ida-dashboard` skill with the theme from `RETAILEDGE_THEME.md`
4. Follow the technical build rules in `references/build_rules.md`

### Step 5: Build the Portal

The portal (`index.html`) should be built last or alongside the first dashboard. It contains:
- Top-level KPI cards (NOI, occupancy, collection rate, lease expiry exposure)
- Dashboard grid with status badges (READY/PARTIAL)
- Links to each dashboard HTML file
- Branded with the Zillow Blue + Gold theme

## Dashboard Build Checklist

| # | Dashboard | Status | HTML File | Built? |
|---|-----------|--------|-----------|--------|
| 1 | Portfolio Overview | READY | portfolio-overview.html | [ ] |
| 2 | NOI & Financial | READY | noi-financial.html | [ ] |
| 3 | Occupancy Analytics | READY | occupancy.html | [ ] |
| 4 | Rent Collection | READY | rent-collection.html | [ ] |
| 5 | Lease Management | READY | lease-management.html | [ ] |
| 6 | Maintenance Ops | READY | maintenance.html | [ ] |
| 7 | CapEx Tracker | READY | capex-tracker.html | [ ] |
| 8 | Market Benchmarking | READY | market-benchmarking.html | [ ] |
| 9 | Manager Scorecard | READY | manager-scorecard.html | [ ] |
| 10 | Tenant Intelligence | READY | tenant-intelligence.html | [ ] |
| 11 | What-If Scenario | PARTIAL | what-if.html | [ ] |
| 12 | Metric Definitions | READY | metric-definitions.html | [ ] |

## Technical Build Rules Summary

1. Self-contained HTML (single file, embedded CSS/JS/data)
2. Chart.js v4 from CDN
3. Lazy tab initialization (setTimeout after tab switch)
4. String concatenation only (no backtick template literals)
5. `function(){}` not arrow functions
6. `var` not `const/let`
7. `mk()` helper for Chart.js instance management
8. No pie or doughnut charts — use horizontal bars
9. Topbar on every dashboard
10. Sticky table headers
11. Color coding: green = positive, red = negative
12. Pre-aggregate all queries to < 200 rows
13. Inter font from Google Fonts

## Troubleshooting

**"No data returned"** — Check that IS_ACTIVE filter isn't excluding all properties. Verify the date range in DIM_TIME covers 2020-2025.

**"Occupancy shows weird labels"** — Make sure you're using DIM_ASSET_CLASS.OCCUPANCY_METRIC_LABEL instead of hardcoding "occupancy %".

**"NOI numbers don't match"** — Use the pre-computed NOI_USD column (CHECK-constrained). Don't recalculate manually.

**"Market benchmark data is sparse"** — Market data is quarterly, not monthly. Use QUARTER_ID for joins, not MONTH_ID.

**"CapEx ROI shows NULL"** — In-progress projects have NULL NOI_UPLIFT_ACTUAL_USD. Filter with `WHERE NOI_UPLIFT_ACTUAL_USD IS NOT NULL` for ROI calculations.

## File Organization

```
xfalcon-falcon-re-kit/
├── DASHBOARD_FEASIBILITY.md     ← What can be built, with scores
├── DATA_SCHEMA_MAP.md           ← Table/column reference
├── RETAILEDGE_THEME.md          ← Colors, CSS, visual identity
├── METRIC_DEFINITIONS.md        ← All KPI formulas (source of truth)
├── GLOBAL_FILTERS.md            ← Exclusions, filters, caveats
├── QUERY_TEMPLATES.sql          ← Starter queries for every dashboard
├── SETUP_GUIDE.md               ← This file
└── SKILL.md                     ← Project-specific build skill
```
