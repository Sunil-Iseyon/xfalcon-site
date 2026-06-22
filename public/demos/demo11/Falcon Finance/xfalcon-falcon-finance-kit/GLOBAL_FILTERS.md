# Falcon Finance — Global Filters & Exclusions

## Hardcoded Exclusions (Applied to Every Query)

**None.** Per user specification, no records are globally excluded. All data (including declined transactions, charged-off accounts, etc.) is available for analysis. Filtering is handled through interactive dashboard controls.

## Interactive Global Filter Dimensions

The following filters appear on EVERY dashboard as a global filter bar:

| Filter | Source Table | Column | Values |
|--------|-------------|--------|--------|
| **Date Range** | DIM_DATE | FULL_DATE, CALENDAR_YEAR, CALENDAR_MONTH | 2019-01-01 to 2025-12-31 |
| **Credit Product** | DIM_PRODUCT | PRODUCT_NAME, PRODUCT_TYPE | 10 products across 4 types |
| **Retail Partner** | DIM_RETAIL_PARTNER | PARTNER_NAME, PARTNER_CATEGORY | 20 partners across 9 categories |
| **Region / State** | DIM_GEOGRAPHY | CENSUS_REGION, STATE_NAME | 4 regions, 31 states |

## Fiscal Calendar Rules

- **Fiscal Year:** April–March (per user specification)
- **Derivation:** `CASE WHEN d.CALENDAR_MONTH >= 4 THEN d.CALENDAR_YEAR ELSE d.CALENDAR_YEAR - 1 END AS FISCAL_YEAR`
- **Fiscal Quarter:** Q1 = Apr–Jun, Q2 = Jul–Sep, Q3 = Oct–Dec, Q4 = Jan–Mar
- **Note:** The DIM_DATE.FISCAL_YEAR column aligns with calendar year by default. Use the derived fiscal year expression above for correct April–March alignment.

## Time Comparison Periods

All dashboards support the following comparison periods (per user specification: "All periods"):

| Comparison | Label | Logic |
|-----------|-------|-------|
| Year-over-Year | vs LY | Same period, prior calendar year |
| Quarter-over-Quarter | vs LQ | Same metric, prior quarter |
| Month-over-Month | vs LM | Same metric, prior month |
| Week-over-Week | vs LW | Same metric, prior week (where daily data exists) |

## Data Quality Notes

1. **Transaction amounts:** Purchases and Cash Advances are positive; Payments and Returns are negative. Always filter by TRANSACTION_TYPE for spend-only analysis.
2. **Utilization Rate:** Pre-calculated in FACT_CREDIT_ACCOUNTS as CURRENT_BALANCE / CREDIT_LIMIT. Values range 0–1+ (can exceed 1 if over-limit).
3. **BNPL vs. Credit Card:** FACT_BNPL_ORDERS tracks BNPL-specific orders. FACT_TRANSACTIONS includes both credit card and BNPL transactions. Don't double-count.
4. **Geography:** Only 31 of 50 US states represented. Missing states should not be flagged as data quality issues.
5. **Account snapshots:** FACT_CREDIT_ACCOUNTS has month-end snapshots only. No intra-month granularity.
6. **Delinquency bucket join:** Use `DELINQUENCY_BUCKET_KEY = BUCKET_KEY` (column names differ between fact and dimension).
7. **Schema prefix:** Always use `public.TABLE_NAME` in queries. The IDA server default prefix `fpublic.` is incorrect.
