# Falcon Real Estate — Project Build Skill

**Project:** Falcon Real Estate (Apex REIT Portfolio)
**Database:** 17 tables, star schema, 50 properties, 42 US markets, 7 asset classes
**Date Range:** 2020-01-01 to 2025-12-31
**Theme:** Zillow-inspired LIGHT theme (white backgrounds, Blue #006AFF + Teal #1A7F64)
**Fiscal Year:** Calendar year (Jan-Dec)

## Quick Context

This is a commercial real estate / REIT analytics project. The central hub table is DIM_PROPERTY — every fact table joins here via PROPERTY_ID. Monthly facts (NOI, Occupancy, Rent Collection) join DIM_TIME via MONTH_ID. Market benchmarks are quarterly (QUARTER_ID).

## Global Filters (apply to every query)

```sql
WHERE p.IS_ACTIVE = TRUE
-- COVID period: 2020-03 to 2021-06 (flag visually, don't exclude)
-- Rate hike period: 2022-03 to 2023-12 (annotate on trends)
```

## Interactive Filters (every dashboard)

Date range, Asset Class, Market, Property, Property Class (A/B/C), Property Manager

## Dashboard Suite (12 dashboards)

1. Portfolio Overview (READY 100%)
2. NOI & Financial Performance (READY 95%)
3. Occupancy Analytics (READY 95%)
4. Rent Collection & Delinquency (READY 95%)
5. Lease Management & Expiry Wall (READY 90%)
6. Maintenance Operations (READY 95%)
7. CapEx Project Tracker (READY 90%)
8. Market Benchmarking (READY 95%)
9. Property Manager Scorecard (READY 90%)
10. Tenant Intelligence (READY 90%)
11. What-If / Scenario Analysis (PARTIAL 65%)
12. Metric Definitions (READY 100%)

## Theme — Light Zillow-Inspired

This project uses a LIGHT theme inspired by Zillow.com's clean white aesthetic. Do NOT use dark backgrounds.

```css
:root {
  --color-bg: #F8F9FA;
  --color-card: #FFFFFF;
  --color-card-border: #E2E8F0;
  --color-blue: #006AFF;         /* Primary accent */
  --color-blue-light: #E8F1FF;
  --color-teal: #1A7F64;         /* Secondary accent */
  --color-teal-light: #E6F5F0;
  --color-green: #2E7D32;        /* Positive */
  --color-green-light: #E8F5E9;
  --color-red: #D32F2F;          /* Negative */
  --color-red-light: #FFEBEE;
  --color-orange: #F57C00;       /* Warning */
  --color-text: #1E293B;         /* Primary text */
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-divider: #E2E8F0;
}
```

Chart colors (in order): #006AFF, #1A7F64, #0EA5E9, #F59E0B, #D946EF, #94A3B8

## Key Build Rules

- Self-contained HTML, Chart.js v4, Inter font
- **LIGHT theme** — white cards on #F8F9FA gray background, NOT dark backgrounds
- mk() helper for chart destruction, lazy tab init
- var not const/let, function(){} not arrows, string concat not template literals
- No pie/doughnut charts — use horizontal bars
- Topbar: white background, sticky, xF logo (x=blue #006AFF, F=teal #1A7F64) + "Falcon Real Estate"
- KPI cards: white with colored top border (blue, teal, green, orange, red)
- Tooltips: white background with subtle border (not dark overlays)
- Grid lines: light gray #F1F5F9 only on Y-axis, no X-axis grid
- Shadows: subtle `0 1px 3px rgba(0,0,0,0.08)` — not glows
- Pre-aggregate all queries to < 200 rows

## Reference Files

All in xfalcon-falcon-re-kit/:
- DASHBOARD_FEASIBILITY.md — scores and build order
- DATA_SCHEMA_MAP.md — table/column mappings
- RETAILEDGE_THEME.md — full light theme spec
- METRIC_DEFINITIONS.md — all KPI formulas
- GLOBAL_FILTERS.md — exclusions and filter rules
- QUERY_TEMPLATES.sql — starter queries per dashboard
- SETUP_GUIDE.md — step-by-step instructions

## Key Data Scenarios Built Into This Dataset

1. **Office occupancy drag** — Office asset class underperforms in FACT_OCCUPANCY
2. **Lease expiry wall** — Cluster of expirations in FACT_LEASE (filter: Active, months_to_expiry <= 18)
3. **Reactive maintenance creep** — WO_TYPE = 'Reactive' growing from 62% to 74% over 6 years in FACT_MAINTENANCE_WO
4. **CapEx ROI miss** — 12 completed projects at 35-55% of projected NOI uplift in FACT_CAPEX_PROJECT
5. **Retail delinquency** — Portfolio collection rate 98.1% but retail sub-sector at 94.3% in FACT_RENT_COLLECTION
6. **Market underperformance** — PORTFOLIO_VS_MARKET_OCC_DELTA < -8 in Phoenix, Atlanta, Denver — same manager_id is root cause
