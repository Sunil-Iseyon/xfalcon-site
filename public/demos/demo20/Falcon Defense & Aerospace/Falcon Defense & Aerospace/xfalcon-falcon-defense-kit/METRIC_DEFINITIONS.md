# Metric Definitions — Falcon Defense & Aerospace

Single source of truth for all KPI formulas used across the 8 dashboards. Every query in `QUERY_TEMPLATES.sql` and every chart in every dashboard must match these definitions.

Formulas are proposed based on the schema and standard defense-industry conventions; review them and flag anything to correct.

## Conventions

- Currency: USD, nominal (no inflation adjustment)
- Display scale: millions (e.g., `$61,789M`) or billions (`$61.8B`) — never raw dollars
- Direction: higher-is-better (↑) or lower-is-better (↓) shown in parentheses
- All year references = calendar year (YEAR_NUM) unless explicitly labeled FY

---

## A. Revenue & P&L metrics (Dashboards 1, 4, 5)

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **Billed Amount** | `SUM(BILLED_AMOUNT_USD)` | $ | ↑ | FACT_CONTRACT_REVENUE |
| **Recognized Revenue** (ASC 606) | `SUM(RECOGNIZED_REV_USD)` | $ | ↑ | FACT_CONTRACT_REVENUE |
| **Incurred Cost** | `SUM(INCURRED_COST_USD)` | $ | ↓ | FACT_CONTRACT_REVENUE |
| **Fee Earned** | `SUM(FEE_EARNED_USD)` | $ | ↑ | FACT_CONTRACT_REVENUE |
| **Fee Realization %** | `SUM(FEE_EARNED_USD) / SUM(RECOGNIZED_REV_USD) * 100` | % | ↑ | FACT_CONTRACT_REVENUE |
| **Billing Lag** | `SUM(RECOGNIZED_REV_USD) - SUM(BILLED_AMOUNT_USD)` | $ | ↓ | FACT_CONTRACT_REVENUE |
| **Gross Margin %** | `(SUM(RECOGNIZED_REV_USD) - SUM(INCURRED_COST_USD)) / SUM(RECOGNIZED_REV_USD) * 100` | % | ↑ | FACT_CONTRACT_REVENUE |
| **YoY Revenue Growth** | `(rev_year - rev_year-1) / rev_year-1 * 100` | % | ↑ | FACT_CONTRACT_REVENUE + DIM_DATE |

## B. Earned Value Management (Dashboard 3)

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **Portfolio CPI** | `SUM(CPI * INCURRED_COST_USD) / SUM(INCURRED_COST_USD)` | ratio | ↑ (target ≥1.0) | FACT_CONTRACT_REVENUE |
| **Portfolio SPI** | `SUM(SPI * INCURRED_COST_USD) / SUM(INCURRED_COST_USD)` | ratio | ↑ (target ≥1.0) | FACT_CONTRACT_REVENUE |
| **Program CPI** | `AVG(CPI)` weighted by INCURRED_COST_USD, grouped by PROGRAM_KEY | ratio | ↑ | FACT_CONTRACT_REVENUE + DIM_PROGRAM |
| **Program SPI** | `AVG(SPI)` weighted by INCURRED_COST_USD, grouped by PROGRAM_KEY | ratio | ↑ | FACT_CONTRACT_REVENUE + DIM_PROGRAM |
| **EVM Health Tier** | CASE: CPI ≥1.00 AND SPI ≥1.00 = Green; CPI ≥0.95 AND SPI ≥0.95 = Yellow; else Red | category | — | derived |
| **Estimate at Completion (EAC)** | `SUM(COST_AT_COMPLETION)` | $ | ↓ | FACT_CONTRACT_REVENUE |
| **Cost Variance USD** | `SUM((CPI - 1) * INCURRED_COST_USD)` (implied from CPI) | $ | ↓ when negative means over-cost | FACT_CONTRACT_REVENUE |
| **Schedule Variance USD** | `SUM((SPI - 1) * INCURRED_COST_USD)` (implied from SPI) | $ | ↓ when negative means behind | FACT_CONTRACT_REVENUE |

## C. Budget performance (Dashboard 2)

**All formulas below assume `WHERE BUDGET_VERSION = 'Revised'` unless stated.**

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **Total Budget (Revised)** | `SUM(BUDGET_USD)` WHERE Revised | $ | — | FACT_PROGRAM_BUDGET |
| **Actual Spend** | `SUM(ACTUAL_USD)` WHERE Revised | $ | ↓ (when over budget) | FACT_PROGRAM_BUDGET |
| **Forecast Spend** | `SUM(FORECAST_USD)` WHERE Revised | $ | — | FACT_PROGRAM_BUDGET |
| **Variance USD** | `SUM(ACTUAL_USD - BUDGET_USD)` WHERE Revised | $ | ↓ (positive = over budget) | FACT_PROGRAM_BUDGET |
| **Variance %** | `SUM(VARIANCE_USD) / SUM(BUDGET_USD) * 100` WHERE Revised | % | ↓ | FACT_PROGRAM_BUDGET |
| **Budget Execution %** | `SUM(ACTUAL_USD) / SUM(BUDGET_USD) * 100` WHERE Revised | % | — (target ~100%) | FACT_PROGRAM_BUDGET |
| **Baseline Shift $ (Revised – Original)** | `SUM(BUDGET_USD when 'Revised') - SUM(BUDGET_USD when 'Original')` GROUP BY program | $ | — | FACT_PROGRAM_BUDGET (both versions) |

## D. Supply chain (Dashboard 6)

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **On-Time Delivery %** (portfolio) | `SUM(CASE WHEN ON_TIME_FLAG THEN 1 ELSE 0 END) / COUNT(*) * 100` | % | ↑ | FACT_PARTS_SUPPLY |
| **Supplier OTD %** | `AVG(ON_TIME_DELIVERY_PCT)` from DIM_SUPPLIER, grouped by tier | % | ↑ | DIM_SUPPLIER |
| **First-Pass Yield %** | `AVG(FIRST_PASS_YIELD) * 100` | % | ↑ | FACT_PARTS_SUPPLY |
| **Defect Rate** | `SUM(DEFECT_QTY) / SUM(QUANTITY_ORDERED) * 100` | % | ↓ | FACT_PARTS_SUPPLY |
| **Purchase Price Variance (PPV)** | `SUM((UNIT_PRICE_USD - UNIT_COST_USD) * QUANTITY_ORDERED)` | $ | ↓ (positive = paid above catalog) | FACT_PARTS_SUPPLY + DIM_PARTS |
| **Sole-Source Spend %** | `SUM(TOTAL_PO_VALUE_USD) WHERE IS_SOLE_SOURCE / SUM(TOTAL_PO_VALUE_USD) * 100` | % | ↓ | FACT_PARTS_SUPPLY + DIM_PARTS |
| **Lead Time Reliability** | `AVG(ABS(DAYS_EARLY_LATE))` | days | ↓ | FACT_PARTS_SUPPLY |
| **DCAA Approved Supplier %** | `COUNT(DCAA_APPROVED=TRUE) / COUNT(*) * 100` on active suppliers | % | ↑ | DIM_SUPPLIER |
| **MIL-SPEC Parts %** | `SUM(TOTAL_PO_VALUE_USD) WHERE IS_MIL_SPEC / SUM(TOTAL_PO_VALUE_USD) * 100` | % | — | FACT_PARTS_SUPPLY + DIM_PARTS |
| **Quality Rating (avg)** | `AVG(QUALITY_RATING)` from DIM_SUPPLIER (active) | 0-5 | ↑ | DIM_SUPPLIER |

## E. Labor & workforce (Dashboard 7)

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **Direct Labor Hours** | `SUM(HOURS_DIRECT)` | hours | — | FACT_LABOR_HOURS |
| **Indirect Labor Hours** | `SUM(HOURS_INDIRECT)` | hours | ↓ | FACT_LABOR_HOURS |
| **Overtime Hours** | `SUM(HOURS_OVERTIME)` | hours | ↓ (burn risk) | FACT_LABOR_HOURS |
| **Utilization %** | `SUM(HOURS_DIRECT) / (SUM(HOURS_DIRECT) + SUM(HOURS_INDIRECT)) * 100` | % | ↑ (target 80-88%) | FACT_LABOR_HOURS |
| **Direct Labor Cost** | `SUM(LABOR_COST_DIRECT)` | $ | — | FACT_LABOR_HOURS |
| **Indirect Labor Cost** | `SUM(LABOR_COST_INDIRECT)` | $ | ↓ | FACT_LABOR_HOURS |
| **Indirect Rate %** | `SUM(LABOR_COST_INDIRECT) / (SUM(LABOR_COST_DIRECT) + SUM(LABOR_COST_INDIRECT)) * 100` | % | ↓ | FACT_LABOR_HOURS |
| **Classified Hours %** | `SUM(HOURS_DIRECT) WHERE IS_CLASSIFIED_WORK / SUM(HOURS_DIRECT) * 100` | % | — | FACT_LABOR_HOURS |
| **Active Headcount** | `COUNT(DISTINCT EMPLOYEE_KEY)` WHERE IS_ACTIVE | people | — | DIM_EMPLOYEE |
| **Avg Std Rate** | `AVG(STANDARD_RATE_USD)` on active employees | $/hr | — | DIM_EMPLOYEE |
| **Facility Capacity Utilization %** | `SUM(HOURS_DIRECT) / (HEADCOUNT_CAPACITY * 40 * weeks) * 100` | % | ↑ | FACT_LABOR_HOURS + DIM_FACILITY |

## F. Contract portfolio (Dashboard 8)

| Metric | Formula | Unit | Direction | Source |
|---|---|---|---|---|
| **Active Contract Count** | `COUNT(DISTINCT CONTRACT_KEY)` WHERE PERIOD_OF_PERF_END >= CURRENT_DATE | count | — | DIM_CONTRACT |
| **Total Ceiling Value** | `SUM(CEILING_VALUE_MN) * 1e6` | $ | — | DIM_CONTRACT |
| **Total Funded Value** | `SUM(FUNDED_VALUE_MN) * 1e6` | $ | — | DIM_CONTRACT |
| **Funded-to-Ceiling %** | `SUM(FUNDED_VALUE_MN) / SUM(CEILING_VALUE_MN) * 100` | % | ↑ | DIM_CONTRACT |
| **Backlog** | `SUM(FUNDED_VALUE_MN * 1e6) - SUM(RECOGNIZED_REV_USD)` at contract level | $ | ↑ | DIM_CONTRACT + FACT_CONTRACT_REVENUE |
| **Period-of-Perf Days Remaining** | `DATE_DIFF(PERIOD_OF_PERF_END, CURRENT_DATE, DAY)` | days | — | DIM_CONTRACT |
| **Small-Business Set-Aside %** | `COUNT(WHERE SET_ASIDE IS NOT NULL) / COUNT(*) * 100` | % | — | DIM_CONTRACT |
| **Prime Contract %** | `COUNT(IS_PRIME=TRUE) / COUNT(*) * 100` | % | — | DIM_CONTRACT |
| **Avg Subcontractor %** | `AVG(SUBCONTRACTOR_PCT)` | % | — | DIM_CONTRACT |

## G. Time-series dimensions

All time-series charts default to **month granularity** over the selected year. When Compare Years is ON, 12-month labels (`Jan` … `Dec`) are the x-axis and each year becomes an overlay line. See project SKILL.md X-Axis Label Alignment rule.

## Metric → Dashboard map

| Metric group | Used in dashboards |
|---|---|
| Revenue & P&L | 1, 2 (partial), 4, 5 |
| EVM (CPI/SPI/EAC) | 1, 3 |
| Budget | 2 |
| Supply chain | 6 |
| Labor | 1 (headcount), 7 |
| Contract portfolio | 1, 8 |

## Validation notes

- Contract revenue 2024: `SUM(RECOGNIZED_REV_USD)` = $61,789M. Validated 2026-04-20.
- Program budget 2024 Revised: `SUM(BUDGET_USD)` = $11,912M, `SUM(ACTUAL_USD)` = $12,148M (2.0% over budget).
- Note the **scale difference** — FACT_CONTRACT_REVENUE is at contract-day grain and sums much higher ($61.8B recognized) than FACT_PROGRAM_BUDGET ($12B budget). This is because the budget table only covers the planning slice (program × cost element × month), not every contract transaction. Do NOT try to reconcile these two against each other one-to-one.
