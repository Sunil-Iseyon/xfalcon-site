# Data Schema Map — Falcon Defense & Aerospace

Maps the actual ARES Defense warehouse tables to the standard AnalyticsPro dimensional model used throughout this kit.

## Fact tables

| Logical role | Actual table | Grain | Rows | Key measures |
|---|---|---|---|---|
| Contract P&L (core) | `FACT_CONTRACT_REVENUE` | contract × cost-element × workday | 3.88M | BILLED_AMOUNT_USD, RECOGNIZED_REV_USD, INCURRED_COST_USD, FEE_EARNED_USD, CPI, SPI |
| Program Budget | `FACT_PROGRAM_BUDGET` | program × cost-element × month × **budget_version** | 24,224 | BUDGET_USD, ACTUAL_USD, FORECAST_USD, VARIANCE_USD |
| Labor | `FACT_LABOR_HOURS` | employee × contract × week (Monday) | 576,624 | HOURS_DIRECT, HOURS_INDIRECT, HOURS_OVERTIME, LABOR_COST_*, UTILIZATION_RATE |
| Supply | `FACT_PARTS_SUPPLY` | one PO line | 700,000 | QUANTITY_ORDERED, UNIT_PRICE_USD, TOTAL_PO_VALUE_USD, DEFECT_QTY, FIRST_PASS_YIELD |

## Dimensions

| Logical role | Actual table | Rows | Key attributes |
|---|---|---|---|
| Date | `DIM_DATE` | 2,922 (2019-01-01 → 2026-12-31) | YEAR_NUM, QUARTER_NUM, MONTH_NUM, FISCAL_YEAR, FISCAL_QUARTER |
| Contract | `DIM_CONTRACT` | 400 | CONTRACT_NUMBER, CONTRACT_TYPE (FAR Part 16), AWARD_DATE, PERIOD_OF_PERF_*, CEILING_VALUE_MN, FUNDED_VALUE_MN, VEHICLE, SET_ASIDE, IS_PRIME |
| Program | `DIM_PROGRAM` | 15 | PROGRAM_CODE (ARES-TITAN, ARES-HERMES, ...), PROGRAM_TYPE, DOMAIN (Air/Land/Sea/Space/Cyber/Multi-Domain), CLASSIFICATION_LVL, IS_ACTIVE |
| Customer | `DIM_CUSTOMER_AGENCY` | 15 | AGENCY_CODE (USAF, USN, USA, NSA, DARPA, ...), AGENCY_TYPE (DoD/Intel/Civilian Federal), IS_CLASSIFIED |
| Cost element | `DIM_COST_ELEMENT` | 16 | ELEMENT_CODE (DL-ENG, MAT-COMP, ...), ELEMENT_CATEGORY, IS_DIRECT, IS_ALLOWABLE, FAR_REFERENCE |
| Employee | `DIM_EMPLOYEE` | 4,200 | JOB_FAMILY, JOB_LEVEL, CLEARANCE_LEVEL, LABOR_CATEGORY, STANDARD_RATE_USD, IS_ACTIVE |
| Supplier | `DIM_SUPPLIER` | 220 | SUPPLIER_CODE, SUPPLIER_TIER (1/2/3), SUPPLIER_TYPE, DCAA_APPROVED, QUALITY_RATING, ON_TIME_DELIVERY_PCT, IS_ACTIVE |
| Part | `DIM_PARTS` | 1,800 | PART_CATEGORY, SUB_CATEGORY, UNIT_COST_USD, CRITICALITY, IS_MIL_SPEC, IS_SOLE_SOURCE, LEAD_TIME_DAYS |
| Facility | `DIM_FACILITY` | 15 | FACILITY_CODE, FACILITY_TYPE, GEO_KEY, HEADCOUNT_CAPACITY, IS_GOVERNMENT_OWNED |
| Geography | `DIM_GEOGRAPHY` | 25 | REGION, STATE_CODE, CITY, LATITUDE, LONGITUDE, GEO_TIER |
| Bridge | `BRIDGE_CONTRACT_PROGRAM` | 400 | CONTRACT_KEY → PROGRAM_KEY with ALLOCATION_PCT |

## Primary join patterns

```sql
-- Contract revenue fully dimensioned
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE            d ON f.DATE_KEY         = d.DATE_KEY
JOIN DIM_CONTRACT        c ON f.CONTRACT_KEY     = c.CONTRACT_KEY
JOIN DIM_CUSTOMER_AGENCY a ON f.AGENCY_KEY       = a.AGENCY_KEY
JOIN DIM_PROGRAM         p ON f.PROGRAM_KEY      = p.PROGRAM_KEY
JOIN DIM_COST_ELEMENT   ce ON f.COST_ELEMENT_KEY = ce.COST_ELEMENT_KEY
JOIN DIM_GEOGRAPHY       g ON f.GEO_KEY          = g.GEO_KEY

-- Labor hours fully dimensioned
FROM FACT_LABOR_HOURS f
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
JOIN DIM_EMPLOYEE e ON f.EMPLOYEE_KEY = e.EMPLOYEE_KEY
JOIN DIM_CONTRACT c ON f.CONTRACT_KEY = c.CONTRACT_KEY
JOIN DIM_FACILITY fc ON f.FACILITY_KEY = fc.FACILITY_KEY

-- Parts supply
FROM FACT_PARTS_SUPPLY f
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
JOIN DIM_PART     p ON f.PART_KEY     = p.PART_KEY
JOIN DIM_SUPPLIER s ON f.SUPPLIER_KEY = s.SUPPLIER_KEY
JOIN DIM_CONTRACT c ON f.CONTRACT_KEY = c.CONTRACT_KEY

-- Program budget (ALWAYS filter BUDGET_VERSION)
FROM FACT_PROGRAM_BUDGET b
JOIN DIM_DATE         d ON b.DATE_KEY         = d.DATE_KEY
JOIN DIM_PROGRAM      p ON b.PROGRAM_KEY      = p.PROGRAM_KEY
JOIN DIM_COST_ELEMENT ce ON b.COST_ELEMENT_KEY = ce.COST_ELEMENT_KEY
WHERE b.BUDGET_VERSION = 'Revised'  -- REQUIRED
```

## Common Column Name Mistakes (DO NOT ASSUME)

| Wrong (do not use) | Correct |
|---|---|
| `REVENUE_USD` | `RECOGNIZED_REV_USD` |
| `COST_USD` | `INCURRED_COST_USD` |
| `FEE_USD` | `FEE_EARNED_USD` |
| `BILLED_USD` | `BILLED_AMOUNT_USD` |
| `STATUS` / `IS_ACTIVE_CONTRACT` | DIM_CONTRACT has no IS_ACTIVE — derive from `PERIOD_OF_PERF_END >= CURRENT_DATE` |
| `AGENCY_NAME` | `AGENCY_SHORT` (for charts) / `AGENCY_NAME` (full) / `AGENCY_CODE` (abbrev) |
| `PROGRAM_NAME` | `PROGRAM_CODE` for short labels (e.g., "ARES-TITAN"), `PROGRAM_NAME` for full |
| `COST_CATEGORY` | `ELEMENT_CATEGORY` on DIM_COST_ELEMENT |
| `TIER` | `SUPPLIER_TIER` (smallint 1/2/3) |
| `OTD` / `ON_TIME_PCT` | `ON_TIME_DELIVERY_PCT` (per-supplier avg) or `ON_TIME_FLAG` (per-PO boolean) |
| `YIELD` | `FIRST_PASS_YIELD` |
| `DOLLAR_AMOUNT` | One of: BILLED_AMOUNT_USD, RECOGNIZED_REV_USD, INCURRED_COST_USD, FEE_EARNED_USD, BUDGET_USD, ACTUAL_USD, TOTAL_PO_VALUE_USD |

## Fiscal Year derivation

`DIM_DATE.FISCAL_YEAR` is pre-computed (Federal FY = Oct-prior → Sep-current).
Example: 2024-09-30 → FY2024, 2024-10-01 → FY2025.

For FY aggregation: `GROUP BY d.FISCAL_YEAR` (pre-computed, correct).
For CY aggregation: `GROUP BY d.YEAR_NUM` (default, pre-computed).

## Currency & Units

- All `*_USD` columns are nominal USD (no inflation adjustment).
- `CEILING_VALUE_MN` and `FUNDED_VALUE_MN` on DIM_CONTRACT are in **millions** USD (note the _MN suffix).
- `BUDGET_AUTHORITY_BN` on DIM_CUSTOMER_AGENCY is in **billions** USD.
- `TOTAL_VALUE_MN` on DIM_PROGRAM is in **millions** USD.
- All fact-table measures are raw USD (no scaling).
- Dashboards should display in millions with `$` prefix (e.g., `$61,789M`) or billions where natural (e.g., `$61.8B`).

## Key row counts for validation

- Contract revenue 2020–2024 total = 3,880,315 rows, $218.6B billed (summing Prime + Mod + Task Order unfiltered is correct — REVENUE_TYPE is NOT redundant grain).
- Program budget Revised only = 12,112 rows, $50.2B budget / $51.2B actual.
- Labor hours split: 65% unclassified (374,988 rows), 35% classified (201,636 rows).
- Suppliers 220 total, 3 tiers: 10 / 16 / 194 raw, of which 10 / 16 / 172 are active (filter IS_ACTIVE).
