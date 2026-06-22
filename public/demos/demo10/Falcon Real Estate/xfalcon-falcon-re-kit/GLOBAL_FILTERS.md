# Falcon Real Estate — Global Filters & Exclusions

## Hardcoded Exclusions (Applied to Every Query)

These WHERE clauses are applied to every dashboard query unless explicitly overridden:

```sql
-- 1. Exclude inactive properties
WHERE p.IS_ACTIVE = TRUE

-- 2. COVID period flagging (not excluded, but flagged visually)
-- Data from 2020-03-01 to 2021-06-30 is marked with IS_COVID_PERIOD = TRUE
-- Dashboards should show a visual marker/annotation for this period
-- Trend analysis should note COVID distortion when present

-- 3. Rate hike period flagging
-- Data from 2022-03-01 to 2023-12-31 is marked with IS_RATE_HIKE_PERIOD = TRUE
-- Market benchmarking dashboards should annotate this period
```

## Interactive Global Filters (Filter Bar)

These filters appear on every dashboard as interactive dropdowns:

| Filter | Source | Type | Default |
|--------|--------|------|---------|
| Date Range | DIM_TIME.FULL_DATE | Date picker (start/end) | Last 12 months |
| Year | DIM_TIME.YEAR | Multi-select | Current year |
| Asset Class | DIM_ASSET_CLASS.ASSET_CLASS_NAME | Multi-select | All |
| Market / Region | DIM_MARKET.MARKET_NAME | Multi-select | All |
| Property | DIM_PROPERTY.PROPERTY_NAME | Searchable dropdown | All |
| Property Class | DIM_PROPERTY.PROPERTY_CLASS | Multi-select (A/B/C) | All |
| Property Manager | DIM_PROPERTY_MANAGER.MANAGER_NAME | Searchable dropdown | All |

## Conditional Calculation Rules

1. **Occupancy metric label changes by asset class:** Use DIM_ASSET_CLASS.OCCUPANCY_METRIC_LABEL to display the correct unit (e.g., "Unit occupancy %" for Residential, "Sqft occupancy %" for Office/Industrial, "Bed/unit occupancy %" for Healthcare).

2. **NOI margin benchmarks vary by asset class:** Use DIM_ASSET_CLASS.NOI_MARGIN_BENCHMARK_PCT as the comparison target when showing NOI margin performance. Do NOT use a single portfolio-wide benchmark.

3. **Maintenance cost per unit varies by asset class:** Use DIM_ASSET_CLASS.MAINTENANCE_COST_PER_UNIT as the benchmark. Residential is measured per-unit ($1,850), commercial is per-sqft ($12.50-$18.50).

4. **Market benchmarking is quarterly:** FACT_MARKET_BENCHMARK uses QUARTER_ID, not MONTH_ID. When comparing portfolio metrics (monthly) to market benchmarks (quarterly), aggregate portfolio data to quarterly first.

## Data Quality Notes

1. **FACT_NOI computed fields are CHECK-constrained:** NOI_USD, NOI_MARGIN_PCT, and NOI_PER_SQFT_UNIT are enforced by database constraints. These values are reliable.

2. **FACT_CAPEX_PROJECT NOI uplift:** In-progress 2025 projects have NOI_UPLIFT_ACTUAL_USD = NULL. This is expected — uplift is measured post-completion. Filter these out when calculating average ROI.

3. **FACT_RENT_COLLECTION consecutive delinquent months:** This is a pre-computed running count. It resets to 0 when a tenant pays on time. Use >= 3 to identify at-risk tenants.

4. **DIM_TENANT names are fictional:** All tenant names are synthetic. Do not attempt external lookups.

5. **DIM_TIME date range:** 2020-01-01 to 2025-12-31. No data outside this range.

6. **FACT_LEASE renewal_probability_score:** Synthetic ML-style score (0-100), correlated with tenant covenant_score (r≈0.65). Treat as a ranking tool, not a precise probability.
