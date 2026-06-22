# Falcon Semiconductor — Global Filters & Exclusions

## Hardcoded Exclusions (always applied)

Every query aggregating `FACT_ORDERS` for **bookings, order value, order count, or avg lead time** must include:

```sql
WHERE ORDER_TYPE <> 'Sample'
```

Rationale: Sample orders are free/near-zero-value evaluation units (5% of order volume). Including them distorts bookings and ASP.

No exclusions apply to FACT_SHIPMENTS, FACT_BACKLOG, FACT_INVENTORY, FACT_DESIGN_WINS, or FACT_SUPPLY_CHAIN — all records are in scope.

## Interactive Filter Bar (global — appears on every dashboard)

| Filter | Default | Source | Type |
|--------|---------|--------|------|
| Fiscal Year | FY25 | `DIM_DATE.FISCAL_YEAR` | Single-select dropdown |
| Compare Years toggle | OFF | — | Toggle switch (next to Year) |
| End Market | All | `DIM_END_MARKET.END_MARKET_NAME` | Multi-select |
| Channel | All | `DIM_CHANNEL.CHANNEL_CODE` | Multi-select |
| Reset | — | — | Button |

When **Compare Years = ON**, the Fiscal Year dropdown is inactive; KPIs and charts show FY23 / FY24 / FY25 overlaid.

## Dashboard-Specific Filters

| Dashboard | Additional Filter |
|-----------|-------------------|
| Product Performance | Product Category (multi-select) |
| Customer & Channel | Customer Segment, Region |
| Design-Win Pipeline | Pipeline Stage, Competitor Displaced |
| Fab & Supply Chain | Fab Type (Internal/External/Specialty), Process Node Class |
| Inventory Health | Channel (DIRECT, Arrow, Avnet, Digi-Key) |

## Conditional Calculation Rules

1. **End-market for revenue** is derived via `DIM_CUSTOMER.END_MARKET_CODE` (not from FACT_SHIPMENTS directly — no END_MARKET_KEY there).
2. **End-market for bookings** uses `FACT_ORDERS.END_MARKET_KEY` directly (present in that fact).
3. **B:B ratio** must come from `FACT_BACKLOG.BOOK_TO_BILL_RATIO` — never computed from orders/shipments ratio.
4. **When filtering to a fiscal year**, use `TRIM(FISCAL_YEAR) = 'FY25'` or `FISCAL_YEAR LIKE 'FY25%'` to avoid trailing-whitespace misses.
5. **Inventory metrics at a "point in time"** use the latest snapshot date within the period, not an average across the period, unless the chart explicitly shows the trend.

## Data Quality Caveats

- FACT_INVENTORY covers only 200/284 products and 4/11 channels — representative subset, not full coverage. Flag on Inventory dashboard.
- FACT_SUPPLY_CHAIN covers 12 fabs × 50 products — top-50 SKUs only. Flag on Fab dashboard.
- No order-to-shipment linkage exists — per-order OTD% is not computable; use period-aggregate proxy.
- FY26 is a partial year (Oct 2025 – Apr 2026 at time of this kit). YoY deltas to FY26 are misleading until the year completes.

## Validation Benchmarks

Every dashboard must reproduce these numbers when filtered to FY25 with no other filters:

| Metric | Expected Value |
|---|---|
| Revenue | $3,708.7M |
| GM % | 50.33% |
| Avg B:B | 1.077 |
| Bookings (excl Sample) | $8,224.5M |
| Automotive share of revenue | 48.8% |
| DIRECT channel share | 34.5% |
| DISTI channel share | 45.6% |
| Total shipment lines | 247,866 |
