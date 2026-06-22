# Falcon Semiconductor — Data Schema Map

Maps the Falcon star schema to the AnalyticsPro dimensional model.

## Model at a glance

```
                       DIM_DATE
                          |
            +-------------+-------------+
            |                           |
     FACT_ORDERS ---- DIM_CUSTOMER ---- FACT_SHIPMENTS
            |              |                  |
            +---- DIM_PRODUCT ----+----- FACT_INVENTORY
            |              |                  |
            +--- DIM_CHANNEL -----+
            |              |
     DIM_END_MARKET        DIM_FAB
            |                 |
    FACT_DESIGN_WINS    FACT_SUPPLY_CHAIN
            |
     FACT_BACKLOG
```

## Dimensions

### DIM_DATE (conformed)
- **Grain:** one row per calendar day (2018-01-01 → 2026+)
- **Key:** DATE_KEY (INTEGER, sequential)
- **Attributes:** FULL_DATE, CALENDAR_YEAR/MONTH/QUARTER, DAY_OF_MONTH, DAY_NAME, MONTH_NAME, **FISCAL_YEAR** (`'FYxx'`), FISCAL_QUARTER, **FISCAL_PERIOD** (`'FYxx-Qn'`), IS_WEEKEND, IS_HOLIDAY
- **Fiscal start:** October 1
- **Gotcha:** FISCAL_YEAR may have trailing whitespace — use `TRIM(FISCAL_YEAR)` or `LIKE 'FY25%'` to be safe

### DIM_CUSTOMER (2,000 rows)
- **Key:** CUSTOMER_KEY
- **Business id:** CUSTOMER_ID (`'CUST-nnnnn'`)
- **Hierarchies:**
  - Segment: CUSTOMER_SEGMENT (Tier 1 OEM, Tier 2 OEM, ODM, Contract Manufacturer, Design House, Startup)
  - Geography: REGION → STATE_CODE → STATE_NAME
  - Size: ANNUAL_REVENUE_TIER (Enterprise, Large, Mid-Market, SMB, Startup)
  - End market: **END_MARKET_CODE** (join to DIM_END_MARKET)
- **Ownership:** ACCOUNT_MANAGER, CREDIT_RATING
- **Temporal:** YEAR_ACQUIRED

### DIM_PRODUCT (284 rows)
- **Key:** PRODUCT_KEY
- **Business id:** PRODUCT_ID (`'CATEGORY-FAMILYnnn'`)
- **Hierarchies:**
  - Category: BUSINESS_UNIT → CATEGORY_CODE → PRODUCT_FAMILY → PRODUCT_NAME
  - Lifecycle: LIFECYCLE_STAGE (Active, Mature, NRND, EOL), LAUNCH_YEAR
- **Attributes:** BASE_ASP, PACKAGE_TYPE, PIN_COUNT, FAB_NODE, LEAD_TIME_WEEKS, **IS_AUTOMOTIVE_QUALIFIED**

### DIM_CHANNEL (11 rows)
- **Key:** CHANNEL_KEY
- **Type:** CHANNEL_CODE (DIRECT, DISTI, OEM, ONLINE)
- **Distributor info:** DISTRIBUTOR_NAME, DISTRIBUTOR_TIER, COMMISSION_RATE (NULL for non-DISTI)

### DIM_END_MARKET (8 rows)
- **Key:** END_MARKET_KEY
- **Code:** END_MARKET_CODE (AUTO, IND, COMM, CONS, COMP, MIL, MED, IOT) — 4-char CHAR
- **Targets:** MARKET_SHARE_TARGET (decimal), GROWTH_RATE (decimal)

### DIM_FAB (12 rows)
- **Key:** FAB_KEY
- **Attributes:** FAB_ID, FAB_NAME, FAB_TYPE (Internal/External/Specialty), LOCATION, PROCESS_NODE, NODE_NM (int), NODE_CLASS, CAPACITY_WAFERS_MONTH, YIELD_RATE, COST_PER_WAFER

## Fact Tables

### FACT_ORDERS (3.4M rows)
- **Grain:** one row per order line (date × product × customer × channel × end_market × order_type × priority)
- **Dims:** DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY, CHANNEL_KEY, END_MARKET_KEY
- **Measures:** ORDER_QUANTITY, UNIT_PRICE, **ORDER_VALUE**, LEAD_TIME_DAYS
- **Attrs:** ORDER_TYPE (Standard/Blanket/Expedite/NPI/Sample), PRIORITY
- **Global filter:** `ORDER_TYPE <> 'Sample'` for bookings analytics

### FACT_SHIPMENTS (1.46M rows) — **the P&L fact**
- **Grain:** one row per shipment line (date × product × customer × channel × fab)
- **Dims:** DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY, CHANNEL_KEY, FAB_KEY
  - **Note:** NO END_MARKET_KEY — join via DIM_CUSTOMER.END_MARKET_CODE
- **Measures:** SHIP_QUANTITY, UNIT_COST, UNIT_PRICE, **REVENUE**, COGS, **GROSS_MARGIN**
- **Attr:** SHIP_METHOD (Air Freight, Air Express, Ground, Ocean, LTL)

### FACT_INVENTORY (304K rows)
- **Grain:** weekly Monday snapshot × product × channel (200 products × 4 channels)
- **Dims:** DATE_KEY (always a Monday), PRODUCT_KEY, CHANNEL_KEY
- **Measures:** ON_HAND_QTY, IN_TRANSIT_QTY, ON_ORDER_QTY, **WEEKS_OF_SUPPLY**, INVENTORY_VALUE, DAYS_ON_HAND

### FACT_BACKLOG (8K rows)
- **Grain:** end-of-month snapshot × product × customer
- **Dims:** DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY
- **Measures:** BACKLOG_QTY, BACKLOG_VALUE, **BOOK_TO_BILL_RATIO** (authoritative), AVERAGE_AGE_DAYS, PAST_DUE_QTY

### FACT_DESIGN_WINS (10K rows)
- **Grain:** one row per design-win record (pipeline stage snapshot)
- **Dims:** DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY, END_MARKET_KEY
- **Measures:** WIN_PROBABILITY, ANNUAL_VOLUME_ESTIMATE, **ESTIMATED_REVENUE**, DESIGN_CYCLE_MONTHS
- **Attrs:** STAGE_CODE/NAME (Prospect → Engage → Eval → Design → Qual → Prod → EOL), COMPETITOR_DISPLACED, IS_NEW_SOCKET

### FACT_SUPPLY_CHAIN (49K rows)
- **Grain:** monthly × fab × product (12 fabs × 50 products × 78 months)
- **Dims:** DATE_KEY (first-of-month), FAB_KEY, PRODUCT_KEY
- **Measures:** WAFER_STARTS, WAFER_OUTS, **GOOD_DIE_COUNT**, **YIELD_RATE**, **UTILIZATION_RATE**, CYCLE_TIME_DAYS, COST_PER_DIE

## Canonical Join Patterns

### Revenue by end market (FACT_SHIPMENTS)
```sql
FROM FACT_SHIPMENTS s
JOIN DIM_DATE d         ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CUSTOMER c     ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
JOIN DIM_END_MARKET em  ON c.END_MARKET_CODE = em.END_MARKET_CODE
```

### Bookings by end market (FACT_ORDERS — direct)
```sql
FROM FACT_ORDERS o
JOIN DIM_DATE d         ON o.DATE_KEY = d.DATE_KEY
JOIN DIM_END_MARKET em  ON o.END_MARKET_KEY = em.END_MARKET_KEY
WHERE o.ORDER_TYPE <> 'Sample'
```

### Margin by fab
```sql
FROM FACT_SHIPMENTS s
JOIN DIM_DATE d  ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_FAB f   ON s.FAB_KEY = f.FAB_KEY
```

### Utilization by fab
```sql
FROM FACT_SUPPLY_CHAIN sc
JOIN DIM_DATE d  ON sc.DATE_KEY = d.DATE_KEY
JOIN DIM_FAB f   ON sc.FAB_KEY = f.FAB_KEY
```

## Common Column Name Mistakes

| Wrong assumption | Correct name | Table |
|---|---|---|
| `REVENUE` on FACT_ORDERS | `ORDER_VALUE` | FACT_ORDERS |
| `END_MARKET_KEY` on FACT_SHIPMENTS | (not present — use DIM_CUSTOMER path) | — |
| `CYCLE_ID` / `WEEK_ID` | not present — derive from FULL_DATE | DIM_DATE |
| `STATUS` on orders | `ORDER_TYPE` + `PRIORITY` | FACT_ORDERS |
| `BRAND` on products | `BUSINESS_UNIT` or `CATEGORY_CODE` | DIM_PRODUCT |
| `REGION_CODE` on customer | `REGION` (full name) | DIM_CUSTOMER |
| `DISTRIBUTOR_ID` | not present — use `DISTRIBUTOR_NAME` | DIM_CHANNEL |
| `OTD_FLAG` per order | not present — derive proxy from FACT_BACKLOG.PAST_DUE_QTY | — |

## Schema Prefix & Quoting

- No schema prefix needed — call tables bare (e.g., `FROM FACT_SHIPMENTS`)
- Identifiers are case-insensitive in practice — upper-case used consistently here
- `FISCAL_YEAR` values may have trailing spaces; prefer `LIKE 'FY25%'` or `TRIM()`
