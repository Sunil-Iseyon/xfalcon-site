# Falcon Semiconductor — Metric Definitions

**Single source of truth for every KPI in the dashboard suite.**
Every query in `QUERY_TEMPLATES.sql` and every KPI on every dashboard must use these formulas exactly.

## Global Filters (applied to ALL revenue/order metrics)

- `FACT_ORDERS.ORDER_TYPE <> 'Sample'` — excludes free evaluation samples from bookings
- No other global exclusions

## Revenue & Financial

### Net Revenue
- **Formula:** `SUM(FACT_SHIPMENTS.REVENUE)`
- **Unit:** USD
- **Direction:** Higher is better
- **Notes:** Post-discount, pre-returns (returns are not captured separately in this schema).
- **Benchmark:** FY25 = $3.71B

### COGS
- **Formula:** `SUM(FACT_SHIPMENTS.COGS)`
- **Unit:** USD
- **Direction:** Lower is better (for a given revenue)

### Gross Margin $
- **Formula:** `SUM(FACT_SHIPMENTS.GROSS_MARGIN)` (≡ `SUM(REVENUE) - SUM(COGS)`)
- **Unit:** USD
- **Direction:** Higher is better
- **Benchmark:** FY25 = $1.87B

### Gross Margin % (GM%)
- **Formula:** `100.0 * SUM(FACT_SHIPMENTS.GROSS_MARGIN) / NULLIF(SUM(FACT_SHIPMENTS.REVENUE), 0)`
- **Unit:** %
- **Direction:** Higher is better
- **Benchmark:** FY25 = 50.33%

### Average Selling Price (ASP)
- **Formula:** `SUM(FACT_SHIPMENTS.REVENUE) / NULLIF(SUM(FACT_SHIPMENTS.SHIP_QUANTITY), 0)`
- **Unit:** USD/unit
- **Direction:** Context-dependent

### Units Shipped
- **Formula:** `SUM(FACT_SHIPMENTS.SHIP_QUANTITY)`
- **Unit:** units
- **Direction:** Higher is better

## Demand & Pipeline

### Bookings
- **Formula:** `SUM(FACT_ORDERS.ORDER_VALUE) WHERE ORDER_TYPE <> 'Sample'`
- **Unit:** USD
- **Direction:** Higher is better
- **Benchmark:** FY25 = $8.22B
- **Caveat:** Blanket orders span future periods. Bookings is a forward indicator of future revenue, not a same-period revenue proxy.

### Order Count
- **Formula:** `COUNT(*) FROM FACT_ORDERS WHERE ORDER_TYPE <> 'Sample'`
- **Unit:** count
- **Direction:** Higher is better

### Book-to-Bill Ratio (B:B)
- **Formula:** `AVG(FACT_BACKLOG.BOOK_TO_BILL_RATIO)` over the snapshot dates in the period
- **Unit:** ratio
- **Direction:** Higher = expansion phase; < 1.0 = correction phase
- **DO NOT COMPUTE** as `SUM(ORDER_VALUE)/SUM(REVENUE)` — yields ~2.2 for FY25 (inflated).
- **Benchmark:** FY25 = 1.077, FY23 = 0.941

### Backlog Value
- **Formula:** `SUM(FACT_BACKLOG.BACKLOG_VALUE)` at the latest snapshot in the period, OR `AVG(BACKLOG_VALUE)` across snapshots for period trending
- **Unit:** USD

### Past-Due Quantity
- **Formula:** `SUM(FACT_BACKLOG.PAST_DUE_QTY)` at latest snapshot
- **Unit:** units
- **Direction:** Lower is better

### Backlog Age (days)
- **Formula:** `AVG(FACT_BACKLOG.AVERAGE_AGE_DAYS)` across snapshots
- **Unit:** days
- **Direction:** Lower is better
- **Benchmark:** FY25 ≈ 29 days

## Design-Win Pipeline

### Pipeline Value (unweighted)
- **Formula:** `SUM(FACT_DESIGN_WINS.ESTIMATED_REVENUE)`
- **Unit:** USD (annual revenue potential)

### Pipeline Value (probability-weighted)
- **Formula:** `SUM(FACT_DESIGN_WINS.ESTIMATED_REVENUE * FACT_DESIGN_WINS.WIN_PROBABILITY)`
- **Unit:** USD
- **Direction:** Higher is better

### Pipeline Count by Stage
- **Formula:** `COUNT(*)` grouped by `STAGE_CODE`

### Competitive Displacement Rate
- **Formula:** `100.0 * COUNT(*) FILTER (WHERE IS_NEW_SOCKET = FALSE) / COUNT(*)`
- **Unit:** %
- **Benchmark:** ~64.7% (vs 35.3% greenfield)

### Average Design-Cycle Months
- **Formula:** `AVG(DESIGN_CYCLE_MONTHS)` grouped by STAGE_CODE or CATEGORY_CODE

## Inventory

### Inventory Value
- **Formula:** `SUM(FACT_INVENTORY.INVENTORY_VALUE)` at latest snapshot
- **Unit:** USD

### Weeks of Supply (WoS)
- **Formula:** `AVG(FACT_INVENTORY.WEEKS_OF_SUPPLY)` at latest snapshot across products/channels
- **Unit:** weeks
- **Target band:** 4–12 weeks; < 2 weeks = stockout risk, > 16 weeks = excess
- **Benchmark:** overall avg 9.0 weeks

### Stockout Risk Count
- **Formula:** `COUNT(*) FROM FACT_INVENTORY WHERE WEEKS_OF_SUPPLY < 2` at latest snapshot
- **Unit:** (product × channel) count

### Excess Inventory Count
- **Formula:** `COUNT(*) FROM FACT_INVENTORY WHERE WEEKS_OF_SUPPLY > 16` at latest snapshot
- **Unit:** (product × channel) count

## Manufacturing / Fab

### Fab Utilization
- **Formula:** `AVG(FACT_SUPPLY_CHAIN.UTILIZATION_RATE)` (weighted by WAFER_STARTS for accuracy)
- **Unit:** % (0–1 decimal in source)
- **Direction:** Target 80–90%; > 95% = over-stressed (long lead times); < 70% = idle capacity
- **Benchmark:** FY25 ~82%, FY22 peak 95.7%, FY23 trough 69.4%

### Yield Rate
- **Formula:** `AVG(FACT_SUPPLY_CHAIN.YIELD_RATE)`
- **Unit:** % (0–1 decimal)
- **Direction:** Higher is better
- **Benchmark:** mean 91.9%

### Cycle Time
- **Formula:** `AVG(FACT_SUPPLY_CHAIN.CYCLE_TIME_DAYS)`
- **Unit:** days
- **Direction:** Lower is better

### Cost per Die
- **Formula:** `AVG(FACT_SUPPLY_CHAIN.COST_PER_DIE)` (or wafer-start-weighted)
- **Unit:** USD

### Good Die Output
- **Formula:** `SUM(FACT_SUPPLY_CHAIN.GOOD_DIE_COUNT)`
- **Unit:** count

## Customer / Channel / Geo

### Customer Concentration (Top N)
- **Formula:** `SUM(REVENUE)` for top N customers / `SUM(REVENUE)` total
- **Unit:** %
- **Direction:** Lower = more diversified (typically)

### Channel Revenue Share
- **Formula:** per-channel `SUM(REVENUE)` / total `SUM(REVENUE)`
- **Benchmark FY25:** DISTI 45.6%, DIRECT 34.5%, OEM 14.9%, ONLINE 5.1%

### End-Market Share (revenue)
- **Formula:** per-end-market `SUM(REVENUE)` / total (join via DIM_CUSTOMER.END_MARKET_CODE)
- **Benchmark FY25:** AUTO 48.8% (vs 28% target — overweight)

### End-Market Target Variance
- **Formula:** `actual_share - DIM_END_MARKET.MARKET_SHARE_TARGET`
- **Unit:** percentage points
- **Direction:** Positive = ahead of plan

## Lead Time & Fulfillment (Proxies)

### Average Quoted Lead Time
- **Formula:** `AVG(FACT_ORDERS.LEAD_TIME_DAYS) WHERE ORDER_TYPE <> 'Sample'`
- **Unit:** days
- **Benchmark:** ~43.7 days (Pareto-weighted)

### On-Time Delivery Proxy
- **Formula:** `1 - (SUM(PAST_DUE_QTY) / (SUM(PAST_DUE_QTY) + SUM(SHIP_QUANTITY_same_period)))`
- **Unit:** %
- **Direction:** Higher is better
- **Caveat:** This is a period-aggregate proxy, not per-order truth. No order-shipment join key exists in the schema.

## Currency & Rounding Conventions

- All USD values displayed in M (millions) with 1 decimal below $1B, or B (billions) with 2 decimals above
- Percentages rounded to 1 decimal (KPI cards) or 2 decimals (margin detail tables)
- Counts formatted with thousands separators (`1,234`)
