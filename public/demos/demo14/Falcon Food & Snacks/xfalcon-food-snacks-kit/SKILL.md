# SKILL.md
# xFalcon AnalyticsPro — Food & Snacks CPG Build Guide

## Project Metadata

**Project:** xFalcon AnalyticsPro Food & Snacks CPG  
**Type:** Dashboard Kit & Build Guide  
**IDA Connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`  
**Database:** Star schema, 13 tables (5 fact, 8 dim)  
**Data Period:** 2020-2025 (FACT_TRADE_SPEND only through 2024)  
**Total Rows:** 3.05M  
**Audience:** C-suite, Sales, Marketing, Finance, Supply Chain, Analysts  
**Comparison Types:** YoY, QoQ, vs. Budget, vs. Baseline, Variance  
**No Hardcoded Exclusions:** All filtering is user-driven  

---

## Table of Contents

1. Connector ID & Connection Details
2. Common Column Name Mistakes (Reference Table)
3. Join Notes & Fact-Dimension Patterns
4. Theme Specification (Quick Ref)
5. Typography Sizes
6. Build Rules & Patterns
7. Dashboard Build Checklist

---

## 1. Connector ID & Connection Details

```
Connector UUID: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
Type: IDA (Integrated Data Analytics)
Database: [Client's Warehouse Name]
Tables: 13 (DIM_DATE, DIM_PRODUCT, DIM_CUSTOMER, DIM_CHANNEL, 
            DIM_GEOGRAPHY, DIM_PROMOTION, DIM_SUPPLIER, DIM_HOUSEHOLD,
            FACT_POS_SALES, FACT_SHIPMENTS, FACT_INVENTORY, 
            FACT_TRADE_SPEND, FACT_HOUSEHOLD_PURCHASE)
Authentication: [Standard BI tool auth]
Refresh: Daily recommended
Query Timeout: 60 seconds (adjust for large aggregations)
```

### Connection Test Query
```sql
SELECT COUNT(*) as row_count FROM FACT_POS_SALES
UNION ALL SELECT COUNT(*) FROM FACT_SHIPMENTS
UNION ALL SELECT COUNT(*) FROM FACT_INVENTORY
UNION ALL SELECT COUNT(*) FROM FACT_TRADE_SPEND
UNION ALL SELECT COUNT(*) FROM FACT_HOUSEHOLD_PURCHASE;
```

Expected: 1130951, 145082, 97152, 9243, 1396413

---

## 2. Common Column Name Mistakes (Reference Table)

This table lists columns that are frequently misnamed or confused. Double-check before writing queries.

| Correct Column | Wrong Names | Table | Notes |
|---|---|---|---|
| NET_REVENUE | REVENUE, NET_SALES, SALES | FACT_POS_SALES | = GROSS_REVENUE - TRADE_DISCOUNT |
| GROSS_REVENUE | GROSS_SALES, TOTAL_REVENUE, SALES | FACT_POS_SALES | = UNITS_SOLD × UNIT_LIST_PRICE |
| COGS | COST, UNIT_COST, PRODUCT_COST | FACT_POS_SALES | COGS per row = UNITS_SOLD × UNIT_COST from DIM_PRODUCT |
| GROSS_PROFIT | PROFIT, OPERATING_PROFIT, EBITDA | FACT_POS_SALES | = NET_REVENUE - COGS |
| TRADE_DISCOUNT | DISCOUNT, RETAILER_DISCOUNT, DEDUCTION | FACT_POS_SALES | Dollar amount (not %), taken from NET_REVENUE |
| UNITS_SOLD | QTY, QUANTITY, VOLUME, UNITS | FACT_POS_SALES | Individual items (not cases) |
| CASES_SOLD | CASES, CASE_QTY, SHIPMENT_UNITS | FACT_POS_SALES | Shipping cases (multiply by UNITS_PER_CASE for units) |
| IS_ON_PROMOTION | PROMO_FLAG, ON_PROMO, HAS_PROMO | FACT_POS_SALES | Boolean (1/0); check PROMOTION_KEY for promo details |
| FILL_RATE_PCT | FILL_RATE, FILL_PERCENTAGE, FULFILLMENT | FACT_SHIPMENTS | Percent (0-100); may have nulls |
| ON_TIME_FLAG | ON_TIME, DELIVERY_QUALITY, LATE_FLAG | FACT_SHIPMENTS | Boolean; inverted logic if "LATE_FLAG" |
| WEEKS_OF_SUPPLY | WOS, WEEKS_ON_HAND, SUPPLY_DAYS | FACT_INVENTORY | Decimal (not integer); 1.5 weeks = 10-11 days |
| DAYS_ON_HAND | DAYS, DOH, INVENTORY_DAYS, SHELF_LIFE | FACT_INVENTORY | Same as WEEKS_OF_SUPPLY × 7 (approx) |
| OUT_OF_STOCK_FLAG | OOS_FLAG, STOCKOUT, ZERO_INVENTORY | FACT_INVENTORY | Boolean; correlates with lost sales |
| PROMO_ROI | ROI, PROMOTION_RETURN, LIFT_RATIO | FACT_TRADE_SPEND | Percent (200% = $2 revenue per $1 spend) |
| INCREMENTAL_UNITS | INCREMENTAL_QTY, LIFTED_UNITS, EXTRA_UNITS | FACT_TRADE_SPEND | = TOTAL_UNITS - BASELINE_UNITS |
| INCREMENTAL_REVENUE | INCREMENTAL_SALES, LIFT_VALUE, INCREMENTAL_NET | FACT_TRADE_SPEND | = INCREMENTAL_UNITS × PROMO_PRICE |
| HOUSEHOLD_KEY | HOUSEHOLD_ID, PANEL_ID, CONSUMER_KEY | DIM_HOUSEHOLD | NOT the same as CUSTOMER_KEY; panel members only |
| CUSTOMER_KEY | ACCOUNT_KEY, RETAILER_KEY, DISTRIBUTOR_KEY | DIM_CUSTOMER | NOT the same as HOUSEHOLD_KEY; 36 customers |
| SKU_CODE | PRODUCT_CODE, ITEM_CODE, UPC | DIM_PRODUCT | Unique identifier (e.g., CB001, SB001) |
| PRODUCT_KEY | PRODUCT_ID, ITEM_KEY, MATERIAL_KEY | DIM_PRODUCT | Surrogate key; join to fact tables via this |
| DATE_KEY | DATE_ID, DATE_CODE, YYYYMMDD | DIM_DATE, all facts | Integer YYYYMMDD format (e.g., 20250401) |
| UNIT_COST | COST_PER_UNIT, MANUFACTURING_COST, COST | DIM_PRODUCT | From DIM_PRODUCT; NOT from FACT_POS_SALES COGS |
| UNIT_LIST_PRICE | LIST_PRICE, MSRP, REGULAR_PRICE, PRICE | DIM_PRODUCT | = GROSS_REVENUE / UNITS_SOLD (should match) |
| PROMOTION_KEY | PROMO_ID, TRADE_SPEND_ID, PROMOTION_ID | FACT_POS_SALES, FACT_TRADE_SPEND | NULL = no promotion; LEFT JOIN DIM_PROMOTION |
| CHANNEL_KEY | CHANNEL_ID, SALES_CHANNEL_KEY, OUTLET_KEY | DIM_CHANNEL, facts | 8 channels; join to DIM_CHANNEL for IS_TRACKABLE |
| GEO_KEY | GEOGRAPHY_KEY, LOCATION_KEY, MARKET_KEY | DIM_GEOGRAPHY, facts | 58 geographies; join for STATE_CODE, COUNTRY |
| IS_TRACKABLE | TRACKABLE_FLAG, DATA_QUALITY, ESTIMATED | DIM_CHANNEL | Boolean; False = syndicated/estimated data |
| IS_SEASONAL | SEASONAL_FLAG, HAS_SEASON, IS_TEMPORARY | DIM_PRODUCT | Boolean; use SEASONAL_MONTHS for month filter |
| IS_ACTIVE | ACTIVE_FLAG, CURRENT, DISCONTINUED | DIM_PRODUCT, DIM_CUSTOMER, DIM_HOUSEHOLD | Filter = 1 to exclude discontinued items |
| FISCAL_YEAR | FY, FISCAL_PERIOD_YEAR, YEAR_FISCAL | DIM_DATE | Starts January (same as YEAR_NUM for this data) |

---

## 3. Join Notes & Fact-Dimension Patterns

### Core Join Pattern (POS Analytics)
```sql
SELECT [metrics]
FROM FACT_POS_SALES fs
JOIN DIM_DATE d ON fs.DATE_KEY = d.DATE_KEY
LEFT JOIN DIM_PRODUCT p ON fs.PRODUCT_KEY = p.PRODUCT_KEY
LEFT JOIN DIM_CUSTOMER c ON fs.CUSTOMER_KEY = c.CUSTOMER_KEY
LEFT JOIN DIM_CHANNEL ch ON fs.CHANNEL_KEY = ch.CHANNEL_KEY
LEFT JOIN DIM_GEOGRAPHY g ON fs.GEO_KEY = g.GEO_KEY
LEFT JOIN DIM_PROMOTION pr ON fs.PROMOTION_KEY = pr.PROMOTION_KEY
WHERE [filters]
GROUP BY [dimensions]
```

### Important Join Rules

**1. DATE_KEY Format**
```sql
-- DATE_KEY is INT (YYYYMMDD format)
WHERE DATE_KEY BETWEEN 20250101 AND 20251231  -- Valid
WHERE FULL_DATE BETWEEN '2025-01-01' AND '2025-12-31'  -- Use FULL_DATE for date ranges
```

**2. PROMOTION_KEY Can Be NULL**
```sql
-- Use LEFT JOIN, not INNER JOIN
LEFT JOIN DIM_PROMOTION pr ON fs.PROMOTION_KEY = pr.PROMOTION_KEY
-- Or filter:
WHERE fs.IS_ON_PROMOTION = 1
```

**3. Household ≠ Customer**
```sql
-- These are two separate dimensions
-- FACT_HOUSEHOLD_PURCHASE uses DIM_HOUSEHOLD
-- FACT_POS_SALES uses DIM_CUSTOMER
-- Cannot join DIM_HOUSEHOLD to FACT_POS_SALES directly
```

**4. Shipments → Inventory**
```sql
-- Both use PRODUCT_KEY, CUSTOMER_KEY, GEO_KEY, DATE_KEY
-- But different granularities:
--   FACT_SHIPMENTS: Product × Customer × Supplier × Date
--   FACT_INVENTORY: Product × Customer × Geography × Date (snapshot)
```

**5. Trade Spend → POS**
```sql
-- FACT_TRADE_SPEND has no direct fact-to-fact key
-- Must join through dimensions (Product, Customer, Geography)
-- And use DATE_KEY with caution: Trade Spend only has 2020-2024 data
```

### Join Performance Tips
- Always join to dimensions on surrogate keys (PRODUCT_KEY, not SKU_CODE)
- Filter facts first (WHERE DATE_KEY BETWEEN...), then join
- For large result sets, aggregate in the fact table before joining to dimensions
- Use indexed columns: DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY, CHANNEL_KEY, GEO_KEY

---

## 4. Theme Specification (Quick Reference)

### Color Palette
```
Primary Blue:      #006AFF (RGB 0, 106, 255)
Teal Secondary:    #1A7F64 (RGB 26, 127, 100)
Gray Tertiary:     #94A3B8 (RGB 148, 163, 184)
Navy Headers:      #0F172A (RGB 15, 23, 42)
White Cards:       #FFFFFF (RGB 255, 255, 255)
Light Background:  #F3F4F6 (RGB 243, 244, 246)

Success (Green):   #16A34A
Warning (Orange):  #EA580C
Error (Red):       #DC2626
```

### Component Styling
```
Card Border:       1px solid #E5E7EB
Card Shadow:       0 1px 3px rgba(0,0,0,0.08)
Focus Outline:     2px #006AFF
Disabled:          #D1D5DB background, #9CA3AF text
```

### Chart Colors (Multi-Series)
```
1st Series:  #006AFF (blue)
2nd Series:  #1A7F64 (teal)
3rd Series:  #94A3B8 (gray)
4th Series:  #EA580C (orange)
5th Series:  #16A34A (green)
```

---

## 5. Typography Sizes

| Role | Size | Weight | Line Height | Example |
|------|------|--------|---|---|
| Page Title | 32px | 700 (bold) | 1.2 | "Executive Overview" |
| Section Header | 24px | 600 | 1.3 | "Revenue Trend" |
| Card Title | 18px | 600 | 1.4 | "Top 10 Products" |
| Body Large | 16px | 400 | 1.5 | Primary text |
| Body Regular | 14px | 400 | 1.5 | Table content, labels |
| Label | 12px | 500 | 1.4 | Badge, footnote |
| Caption | 11px | 400 | 1.4 | Timestamp, source |

---

## 6. Build Rules & Patterns

### Rule 1: No Hardcoded Filters
**Bad:**
```sql
SELECT SUM(NET_REVENUE) FROM FACT_POS_SALES
WHERE YEAR_NUM = 2025 AND BRAND = 'Crestview Biscuits'
```

**Good:**
```sql
SELECT SUM(NET_REVENUE) FROM FACT_POS_SALES
WHERE YEAR_NUM IN (@YEAR_FILTER) AND BRAND IN (@BRAND_FILTER)
-- Variables @YEAR_FILTER and @BRAND_FILTER come from dashboard filters
```

### Rule 2: Always Calculate Revenue Metrics Consistently
```sql
-- Revenue Hierarchy (descending):
-- GROSS_REVENUE (list price, before any discounts)
-- TRADE_DISCOUNT (subtracted)
-- NET_REVENUE (= GROSS_REVENUE - TRADE_DISCOUNT)
-- COGS (subtracted)
-- GROSS_PROFIT (= NET_REVENUE - COGS)

-- Always use NET_REVENUE for revenue KPIs (unless reporting Trade Discount impact)
```

### Rule 3: Dimension Attributes Are Sacred
```sql
-- Don't calculate in facts; use dimension attributes
-- Bad: SELECT SUM(ps.UNITS_SOLD * p.UNIT_COST) as cogs  -- Wrong if COGS in fact differs
-- Good: SELECT SUM(ps.COGS)  -- Pre-calculated, authoritative
```

### Rule 4: Date Filtering
```sql
-- Always use DATE_KEY in WHERE clause for facts (it's indexed)
-- DATE_KEY is YYYYMMDD integer
WHERE DATE_KEY BETWEEN @START_DATE_KEY AND @END_DATE_KEY

-- To convert calendar dates to DATE_KEY:
-- 2025-01-01 → 20250101
-- Use DIM_DATE to join and translate
```

### Rule 5: Handle NULL Promotion
```sql
-- Many POS rows have NULL PROMOTION_KEY (not on promotion)
-- Use LEFT JOIN, not INNER JOIN
LEFT JOIN DIM_PROMOTION pr ON fs.PROMOTION_KEY = pr.PROMOTION_KEY

-- Or filter explicitly:
WHERE fs.IS_ON_PROMOTION = 1  -- Only rows with promotion
-- or
WHERE fs.PROMOTION_KEY IS NOT NULL
```

### Rule 6: Household ≠ Customer Universe
```sql
-- FACT_HOUSEHOLD_PURCHASE: 1.4M rows, 80K unique households, panel data
-- FACT_POS_SALES: 1.13M rows, 36 customers, retail/distributor data
-- These are separate universes; don't try to join them

-- Use household data for:
-- - Penetration %, repeat purchase rate, basket size, life stage segmentation
-- Use POS data for:
-- - Revenue, margin, channel mix, fill rate, supplier performance
```

### Rule 7: Seasonal Product Filtering
```sql
-- IS_SEASONAL boolean flag
-- SEASONAL_MONTHS: comma-separated list (e.g., "6,7,8" for summer products)
WHERE IS_SEASONAL = 1 
  AND FIND_IN_SET(MONTH_NUM, SEASONAL_MONTHS) > 0
```

### Rule 8: Inventory Snapshot Interpretation
```sql
-- FACT_INVENTORY is a snapshot table (point-in-time, periodic)
-- Values are as-of DATE_KEY, not transactions
-- Compare trends (WOS over time), not transactions
-- Use FACT_SHIPMENTS for transaction-level supply chain
```

### Rule 9: Trade Spend Data Ends in 2024
```sql
-- FACT_TRADE_SPEND has NO 2025 data
-- Warn users if they select 2025 on Trade Spend dashboard
-- Join carefully: use DATE_KEY but filter to 2020-2024
WHERE YEAR_NUM <= 2024
```

### Rule 10: Brand Revenue Mix
```sql
-- Top brands by approx 2025 revenue:
-- Crestview Biscuits: ~35%
-- Sunrise Bars: ~25%
-- Prairie Pantry: ~20%
-- Crestfield Confections: ~15%
-- Morning Ridge Cereals: ~5%
-- (Use dashboards to confirm; these are estimates)
```

---

## 7. Dashboard Build Checklist

Use this checklist for each dashboard build:

### Pre-Build
- [ ] Read DASHBOARD_FEASIBILITY.md for this dashboard
- [ ] Identify primary fact table(s) and required dimensions
- [ ] List all KPIs/metrics (reference METRIC_DEFINITIONS.md)
- [ ] Sketch wireframe (KPI cards, charts, layout)
- [ ] Identify filter requirements (from GLOBAL_FILTERS.md)

### Data/Queries
- [ ] Write core aggregation queries
- [ ] Test each query in SQL (verify row counts, null handling)
- [ ] Validate metric calculations against METRIC_DEFINITIONS.md
- [ ] Check for hardcoded filters — remove any (use @parameters)
- [ ] Verify DATE_KEY usage (YYYYMMDD integer, not date strings)
- [ ] Test joins (especially NULL handling for PROMOTION_KEY)
- [ ] Confirm theme colors applied (hex values, not approximations)

### Dashboard Assembly
- [ ] Create KPI cards (if applicable) with deltas/YoY
- [ ] Create charts (line, bar, pie, table) per wireframe
- [ ] Apply theme colors (background #F3F4F6, cards #FFFFFF, primary #006AFF)
- [ ] Set typography sizes per theme spec
- [ ] Add titles and descriptions for each card/chart
- [ ] Connect all elements to global filter controls
- [ ] Test filter interactions (multi-select, cascading, date ranges)
- [ ] Test all comparisons (YoY, QoQ, vs. Budget if applicable)

### Testing
- [ ] Load dashboard in browser (desktop + mobile)
- [ ] Apply each filter independently
- [ ] Apply multiple filters together
- [ ] Test "Clear All" button
- [ ] Export to PDF (verify layout, colors, no truncation)
- [ ] Export to Excel (verify data, formulas if applicable)
- [ ] Check chart rendering (no missing data points, legends visible)
- [ ] Verify no SQL errors in query logs
- [ ] Check performance (< 5 second load, < 30 second query on large selections)

### Documentation
- [ ] Add dashboard to DASHBOARD_FEASIBILITY.md summary table
- [ ] Document any custom metrics or calculations
- [ ] Note any data limitations or caveats
- [ ] Add troubleshooting tips if applicable
- [ ] Update build estimate in project plan

### Sign-Off
- [ ] Business stakeholder review (KPIs make sense?)
- [ ] Analyst review (calculations correct?)
- [ ] Share link/PDF with team
- [ ] Schedule training session (if first dashboard)

---

## Appendix: Brands & Products

**Brands (5):**
1. Crestview Biscuits (27 SKUs, ~35% revenue, Biscuits & Cookies)
2. Sunrise Bars (20 SKUs, ~25% revenue, Snack Bars)
3. Crestfield Confections (20 SKUs, ~15% revenue, Confectionery)
4. Morning Ridge Cereals (20 SKUs, ~15% revenue, Cereal)
5. Prairie Pantry Meals (18 SKUs, ~10% revenue, Frozen Meals + Condiments)

**Categories (6):**
- Biscuits & Cookies (27 SKUs, Crestview)
- Snack Bars (20 SKUs, Sunrise)
- Confectionery (20 SKUs, Crestfield)
- Cereal (20 SKUs, Morning Ridge)
- Frozen Meals (10 SKUs, Prairie Pantry)
- Condiments & Sauces (8 SKUs, Prairie Pantry)

**Total: 105 SKUs**

---

## Appendix: Customers (Top 10 by Estimated Revenue)

1. Walmart / Sam's Club
2. Costco / Costco Online
3. Amazon Fresh
4. Target
5. Kroger / Ralphs
6. Albertsons
7. Whole Foods
8. Sprouts Farmers Market
9. Cvs Pharmacy
10. Walgreens

(Use dashboards to confirm actual customer names and tiers)

---

## Final Notes

- **Support Reference:** See SETUP_GUIDE.md Troubleshooting section for common issues
- **Schema Reference:** See DATA_SCHEMA_MAP.md for full column/table documentation
- **Theme Reference:** See RETAILEDGE_THEME.md for detailed design specifications
- **Metrics Reference:** See METRIC_DEFINITIONS.md for KPI calculations and usage
- **Filters Reference:** See GLOBAL_FILTERS.md for interactive filter design

Good luck with your dashboards!
