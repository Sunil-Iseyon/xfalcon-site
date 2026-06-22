---
name: falcon-semi-build
description: Project skill for the Falcon Semiconductor xFalcon AnalyticsPro deployment. Contains IDA connector, schema conventions, theme, column gotchas, and build rules. Load this in any future session that works with Falcon Semiconductor dashboards.
---

# Falcon Semiconductor — Build Skill

## IDA Connector

**Use ONLY:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__` (the Falcon Semi database)
**Do NOT use:** any other connector — older connectors point at unrelated consumer-goods/pet-products databases.
**Verify before querying:** `ida_get_knowledge(knowledge_type='tables', detail_level='names')` should list `DIM_CUSTOMER`, `FACT_SHIPMENTS`, `FACT_DESIGN_WINS`, `FACT_SUPPLY_CHAIN`.

## Schema Prefix

No prefix needed. Call tables bare: `FROM FACT_SHIPMENTS`.

## Required Filters

| Table | Required filter | Why |
|-------|-----------------|-----|
| FACT_ORDERS | `WHERE ORDER_TYPE <> 'Sample'` | Sample orders are free evaluation units, 5% of volume, distort bookings |

## Common Column Name Mistakes

| Wrong | Correct | Table |
|-------|---------|-------|
| `REVENUE` | `ORDER_VALUE` | FACT_ORDERS |
| `END_MARKET_KEY` | join via DIM_CUSTOMER.END_MARKET_CODE | FACT_SHIPMENTS |
| `BRAND` / `BRAND_NAME` | `BUSINESS_UNIT` or `CATEGORY_CODE` | DIM_PRODUCT |
| `STATUS` on orders | `ORDER_TYPE` + `PRIORITY` | FACT_ORDERS |
| `REGION_CODE` | `REGION` (full text: 'South', 'West', etc.) | DIM_CUSTOMER |
| `WEEK_NUMBER` / `WEEK_ID` | derive via `DATE_TRUNC('week', FULL_DATE)` | DIM_DATE |
| `OTD_FLAG` per order | not present; use FACT_BACKLOG.PAST_DUE_QTY aggregate proxy | — |
| `FISCAL_YEAR = 'FY25'` exact | `TRIM(FISCAL_YEAR) = 'FY25'` or `LIKE 'FY25%'` | DIM_DATE (trailing whitespace) |

## Fiscal Year Derivation

```sql
SELECT TRIM(d.FISCAL_YEAR) AS fy, d.FISCAL_QUARTER, d.FISCAL_PERIOD
FROM DIM_DATE d
WHERE d.FULL_DATE = '2025-04-21'
-- Returns: 'FY25', 3, 'FY25-Q3'
-- Falcon fiscal year = Oct 1 start
```

## Critical Metric Rules

1. **B:B ratio:** `AVG(FACT_BACKLOG.BOOK_TO_BILL_RATIO)` — NEVER compute as orders/shipments ratio (yields ~2.2 instead of ~1.08 for FY25).
2. **Revenue by end market:** route via `DIM_CUSTOMER.END_MARKET_CODE` (FACT_SHIPMENTS has no EM key).
3. **Bookings:** `SUM(FACT_ORDERS.ORDER_VALUE) WHERE ORDER_TYPE <> 'Sample'`.
4. **GM%:** `SUM(GROSS_MARGIN) / NULLIF(SUM(REVENUE), 0)` — don't average row-level margin percentages.

## Theme (Tech Innovation)

| Role | Hex |
|------|-----|
| Topbar | `#1E1E1E` |
| Body | `#FFFFFF` |
| Card | `#FAFBFC` |
| Primary | `#0066FF` |
| Secondary | `#00BFCF` |
| Tertiary | `#708090` |
| Positive | `#059669` |
| Negative | `#D32F2F` |

Logo: `xF` (x=primary, F=secondary), Inter font across all sizes.

## Typography

- Topbar title: 16px / 600
- Section title: 18px / 700 / primary
- KPI label: 12px / 600 uppercase / muted
- KPI value: 28px / 700 / primary
- KPI delta: 13px / 500 / positive|negative|neutral
- Chart title: 16px / 700 / primary
- Table header: 13px / 600 white on `#1E1E1E` topbar color
- Table body: 13px / 400

## Topbar Consistency Rules

- Logo text: "xF" always (never "xFalcon" or full)
- Title format: `Falcon Semiconductor / N. Dashboard Name`
- Subtitle: normal doc flow, `margin-top: 2px`, no `position: absolute`
- Back link: RIGHT side, `href="index.html"`, underline-on-hover only

## Chart Rules

- Chart.js v4 CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js` (exact)
- Colors: direct hex strings only in Chart.js configs — NEVER `var(--...)`
- Horizontal bars: `type: 'bar'` + `indexAxis: 'y'` — never `type: 'barh'`
- Year palette (stable across dashboards): FY22 `#708090` · FY23 `#94A3B8` · FY24 `#00BFCF` · FY25 `#0066FF` · FY26 `#0EA5E9`
- No pie/doughnut — use horizontal or stacked bars

## Compare Years Toggle

Every multi-year dashboard implements the pattern:
- OFF: single-year view, Year dropdown active, KPIs show YoY delta
- ON: Year dropdown inactive, KPI cards become 3-row stacked (FY23/FY24/FY25), charts overlay years

## Dashboard Content Minimums

- ≥6 KPI cards (single-year, year-labeled)
- ≥4 chart visualizations
- ≥1 detail table with ≥7 rows and YoY column
- ≥1 disclaimer line about filters applied
- Compare Years toggle (where multi-year data exists)

## Validation Benchmarks

FY25 default view must reproduce:
- Revenue $3,708.7M
- GM% 50.33%
- B:B 1.077
- Bookings (excl Sample) $8,224.5M
- Automotive share 48.8%
- Channel: DISTI 45.6% / DIRECT 34.5% / OEM 14.9% / ONLINE 5.1%

## Pre-Delivery QA

Run all 10 audits from the xfalcon-onboard skill Pre-Delivery QA Checklist:
1. Chart.js rendering (exact CDN, no `barh`, every canvas → `new Chart()`)
2. Color compliance (no red/green in chart data)
3. Navigation (back link to `index.html`)
4. Content depth (6 KPIs / 4 charts / table / disclaimer)
5. JavaScript syntax (`node --check` if extracted)
6. JS safety (`var` only, `function(){}` only, string concat only)
7. Theme consistency (same palette in every file)
8. Topbar consistency (identical logo, title format, back link on right)
9. Data quality (no flat arrays, correct x-axis label count, dark table headers)
10. Metrics definitions page audit

## Files in this kit

Portal: `index.html`
Dashboards 1–11: `1-executive-overview.html` through `11-wbr.html`
Metrics reference: `metrics-definitions.html`
AutoExplore: `autoexplore-dashboard.html` + `autoexplore-memo.html`
