# Global Filter Architecture
**xFalcon AnalyticsPro — Food & Snacks CPG**

---

## Overview

**Filter Strategy:** Non-exclusive, user-initiated filters at dashboard level  
**Default State:** No filters applied (show all data)  
**Filter Persistence:** Applies to all cards/charts within dashboard  
**Export Format:** Filters included in downloadable reports

All dashboards support interactive filtering with no hardcoded exclusions.

---

## Core Filter Dimensions

### 1. Date Range (Temporal)

**Controls:**
- **Date Picker (Range):** YYYY-MM-DD → YYYY-MM-DD
- **Preset Buttons:** Last 7 Days, Last 30 Days, Last 90 Days, YTD, Last Year, Custom

**Applicable Tables:**
- FACT_POS_SALES, FACT_SHIPMENTS, FACT_INVENTORY, FACT_HOUSEHOLD_PURCHASE (all years)
- FACT_TRADE_SPEND (2020-2024 only; warn if 2025 selected)

**Default:** Last 12 months (YTD or rolling 12M based on context)

**SQL Integration:**
```sql
WHERE DATE_KEY >= @START_DATE_KEY AND DATE_KEY <= @END_DATE_KEY
-- or by calendar month:
WHERE YEAR_NUM = @YEAR AND MONTH_NUM >= @START_MONTH AND MONTH_NUM <= @END_MONTH
```

**Notes:**
- DATE_KEY format: YYYYMMDD (integer)
- Timezone: Assumed UTC (no timezone conversions)
- Fiscal year available: FISCAL_YEAR, FISCAL_QUARTER, FISCAL_PERIOD (starts January)

---

### 2. Year

**Type:** Single-select or multi-select dropdown  
**Values:** 2020, 2021, 2022, 2023, 2024, 2025  
**Default:** 2025 (or YTD depending on context)

**SQL Integration:**
```sql
WHERE YEAR_NUM IN (@YEAR_1, @YEAR_2, ...)
-- or for comparisons:
WHERE YEAR_NUM = @SELECTED_YEAR OR YEAR_NUM = @PRIOR_YEAR
```

**Notes:**
- Multi-year selection enables YoY comparisons
- Fact_Trade_Spend limited to 2020-2024

---

### 3. Quarter

**Type:** Multi-select dropdown (Q1, Q2, Q3, Q4)  
**Values:** Q1, Q2, Q3, Q4  
**Default:** Current quarter (or empty = all quarters)

**SQL Integration:**
```sql
WHERE QUARTER_NUM IN (@Q1, @Q2, @Q3, @Q4)
-- Calendar:
WHERE MONTH_NUM IN (1, 2, 3)  -- Q1
WHERE MONTH_NUM IN (4, 5, 6)  -- Q2
WHERE MONTH_NUM IN (7, 8, 9)  -- Q3
WHERE MONTH_NUM IN (10, 11, 12) -- Q4
```

**Notes:**
- Fiscal quarter available via FISCAL_QUARTER
- Dependent on year selection

---

### 4. Month

**Type:** Multi-select dropdown (January-December)  
**Values:** 1-12 (or month names)  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE MONTH_NUM IN (@MONTH_1, @MONTH_2, ...)
```

**Seasonal Filtering:**
```sql
-- To show only seasonal products in their season:
WHERE IS_SEASONAL = 1 AND FIND_IN_SET(MONTH_NUM, SEASONAL_MONTHS) > 0
```

---

### 5. Brand

**Type:** Multi-select dropdown with search  
**Values:**
- Crestview Biscuits (27 SKUs, ~35% revenue)
- Sunrise Bars (20 SKUs, ~25% revenue)
- Crestfield Confections (20 SKUs, ~15% revenue)
- Morning Ridge Cereals (20 SKUs, ~15% revenue)
- Prairie Pantry Meals (18 SKUs, ~10% revenue)

**Default:** Empty (show all brands)

**SQL Integration:**
```sql
WHERE BRAND IN (@BRAND_1, @BRAND_2, ...)
-- Requires join:
LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
WHERE DIM_PRODUCT.BRAND IN (...)
```

**Notes:**
- Available in: DIM_PRODUCT.BRAND, DIM_PROMOTION.BRAND, FACT_POS_SALES (via product join)

---

### 6. Category

**Type:** Multi-select dropdown with search  
**Values:**
- Biscuits & Cookies
- Snack Bars
- Confectionery
- Cereal
- Frozen Meals (10 SKUs)
- Condiments & Sauces (8 SKUs)

**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE CATEGORY IN (@CAT_1, @CAT_2, ...)
-- Requires join:
LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
WHERE DIM_PRODUCT.CATEGORY IN (...)
```

---

### 7. Product / SKU

**Type:** Multi-select dropdown with search  
**Values:** 105 unique SKU_CODEs (e.g., CB001, SB001, etc.)  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE PRODUCT_KEY IN (@PROD_1, @PROD_2, ...)
-- or
WHERE SKU_CODE IN (@SKU_1, @SKU_2, ...)
```

**Notes:**
- Filter by SKU_CODE or PRODUCT_KEY (both available in DIM_PRODUCT)
- Often nested under Brand/Category for UX

---

### 8. Customer

**Type:** Multi-select dropdown with search  
**Values:** 36 unique CUSTOMER_CODEs (e.g., CUST001, CUST002, etc.)  
**Display:** CUSTOMER_NAME with optional CUSTOMER_TIER badge  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE CUSTOMER_KEY IN (@CUST_1, @CUST_2, ...)
-- or
WHERE CUSTOMER_CODE IN (@CODE_1, @CODE_2, ...)
```

**Segmentation Options:**
```sql
-- By tier:
WHERE CUSTOMER_TIER IN ('Tier1', 'Tier2', 'Tier3')

-- By type:
WHERE CUSTOMER_TYPE IN ('Retailer', 'Distributor', 'E-commerce')

-- By channel:
WHERE CHANNEL IN ('Grocery', 'Drug', 'Online')
```

---

### 9. Customer Tier

**Type:** Multi-select dropdown  
**Values:** Tier1 (Major), Tier2, Tier3  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE CUSTOMER_TIER IN (@TIER1, @TIER2, @TIER3)
```

**Notes:**
- Available in DIM_CUSTOMER.CUSTOMER_TIER
- Tier1 typically drives 50-60% of revenue

---

### 10. Channel

**Type:** Multi-select dropdown with search  
**Values:** 8 channels (Grocery, Convenience, Drug, E-commerce, Club, Foodservice, Mass, Other)  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE CHANNEL_KEY IN (@CHAN_1, @CHAN_2, ...)
-- or with channel filtering:
WHERE CHANNEL_NAME IN (...)
-- Exclude non-trackable:
LEFT JOIN DIM_CHANNEL ON CHANNEL_KEY
WHERE IS_TRACKABLE = 1
```

**Channel Grouping:**
```sql
-- Traditional:
WHERE CHANNEL_GROUP = 'Traditional'

-- Digital:
WHERE CHANNEL_GROUP = 'Digital'
```

**Notes:**
- IS_TRACKABLE flag indicates POS vs. estimated data
- DATA_SOURCE shows source (POS, Syndicated, Direct)

---

### 11. Geography

**Type:** Hierarchical multi-select (Country → State → Market)  
**Values:** 58 total geographies

**Levels:**
- **Country:** USA, Canada, Mexico (3)
- **State/Province:** USA (50 states), Canada (13), Mexico (31)
- **Market Tier:** Urban, Suburban, Rural
- **Nielsen Market:** DMA codes (US only)

**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE COUNTRY IN (@COUNTRY_1, @COUNTRY_2, ...)
-- State level:
WHERE STATE_CODE IN (@STATE_1, @STATE_2, ...)
-- Market tier:
WHERE MARKET_TIER IN ('Urban', 'Suburban', 'Rural')
-- Nielsen market:
WHERE NIELSEN_MARKET IN (@DMA_1, @DMA_2, ...)
```

**Notes:**
- GEO_KEY is numeric surrogate (join to DIM_GEOGRAPHY for display)
- SHIP_TO_STATE in FACT_SHIPMENTS may differ from GEO_KEY

---

### 12. Promotion

**Type:** Multi-select dropdown with search  
**Values:** 60 unique PROMOTION_CODEs (active 2020-2024)  
**Display:** PROMOTION_NAME with PROMOTION_TYPE badge  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE PROMOTION_KEY IN (@PROMO_1, @PROMO_2, ...)
-- By type:
WHERE PROMOTION_TYPE IN ('Discount', 'BOGO', 'Bundle', 'Loyalty')
-- By funding source:
WHERE FUNDING_SOURCE IN ('Manufacturer', 'Retailer', 'Shared')
```

**Notes:**
- FACT_TRADE_SPEND (2020-2024); FACT_POS_SALES has IS_ON_PROMOTION flag
- Null PROMOTION_KEY in POS = no promotion

---

### 13. Supplier

**Type:** Multi-select dropdown with search  
**Values:** 16 unique SUPPLIER_CODEs  
**Display:** SUPPLIER_NAME with optional RISK_RATING badge  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE SUPPLIER_KEY IN (@SUPP_1, @SUPP_2, ...)
-- By risk:
WHERE RISK_RATING IN ('Low', 'Medium', 'High')
-- By type:
WHERE SUPPLIER_TYPE IN ('Manufacturer', 'Distributor', 'Contract Logistics')
```

**Notes:**
- Only relevant for FACT_SHIPMENTS
- Not used in POS/inventory/household dashboards

---

### 14. Household Segment

**Type:** Multi-select dropdown (for Consumer Panel dashboard only)  
**Values:**
- **Panel Segment:** Urban, Suburban, Rural, Exurban
- **Income Band:** <$25K, $25-50K, $50-100K, $100K+
- **Household Size:** 1, 2, 3, 4, 5+
- **Life Stage:** Young Single, Young Family, Family with Children, Empty Nester, Retired
- **Loyalty Tier:** Non-member, Silver, Gold, Platinum

**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE PANEL_SEGMENT IN (@SEG_1, @SEG_2, ...)
-- Income:
WHERE INCOME_BAND IN (@BAND_1, @BAND_2, ...)
-- Life stage:
WHERE LIFE_STAGE IN (@STAGE_1, @STAGE_2, ...)
```

**Notes:**
- Household filters available only in Dashboard 10 (Consumer Panel)
- DIM_HOUSEHOLD.GEO_KEY enables geographic cross-tabulation

---

### 15. Promotion Type

**Type:** Multi-select dropdown  
**Values:** Discount, BOGO, Bundle, Loyalty, Flash Sale, Seasonal, etc.  
**Default:** Empty (show all)

**SQL Integration:**
```sql
WHERE PROMOTION_TYPE IN (@TYPE_1, @TYPE_2, ...)
```

---

## Filter Interaction Rules

### Dependent Filters (Cascading)

**Brand → Category → Product:**
```
1. User selects Brand = "Crestview Biscuits"
2. Category dropdown auto-populated with: Biscuits & Cookies
3. Product dropdown auto-populated with: CB001-CB027
```

**Country → State → Nielsen Market:**
```
1. User selects Country = "USA"
2. State dropdown auto-populated with: 50 US states
3. Nielsen DMA dropdown filtered to selected state
```

**Year → Quarter → Month:**
```
1. User selects Year = 2025
2. Quarter dropdown shows: Q1, Q2, Q3, Q4
3. Month dropdown shows: all months (user can sub-select)
```

### Conflicting Filter Resolution

**Product Filter Override:**
```
If user selects Brand = "Crestview" AND Product = "SB001" (Sunrise Bars product),
show warning: "Selected product not in selected brand. Reset product filter?"
```

**Date Validation:**
```
If user selects dates beyond available data (e.g., 2026-01-01), show warning:
"No data available for selected date range. Latest data: 2025-12-31"
```

**Fact Table Mismatch:**
```
If user is on Trade Spend dashboard and selects 2025,
show warning: "Trade Spend data only available through 2024. Showing 2020-2024 results."
```

---

## Filter UI Patterns

### Single Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ Dashboard: Executive Overview                        │
├─────────────────────────────────────────────────────┤
│ FILTERS (Collapsible Sidebar):                       │
│ ├─ Date Range: [START] → [END]                      │
│ ├─ Year: [Multi-select dropdown]                    │
│ ├─ Quarter: [Multi-select dropdown]                 │
│ ├─ Brand: [Multi-select dropdown]                   │
│ ├─ Channel: [Multi-select dropdown]                 │
│ ├─ Customer: [Multi-select dropdown]                │
│ ├─ Geography: [Hierarchical multi-select]           │
│ ├─ [CLEAR ALL] [APPLY FILTERS]                      │
│ └─ Applied Filters (badge row)                      │
├─────────────────────────────────────────────────────┤
│ KPI CARDS (responsive grid):                        │
│ ├─ [Card 1: YTD Revenue]  [Card 2: YoY Growth]     │
│ ├─ [Card 3: Gross Margin] [Card 4: Units Sold]    │
├─────────────────────────────────────────────────────┤
│ CHARTS:                                              │
│ ├─ [Revenue Trend] [Top 10 Products]               │
│ ├─ [Channel Mix] [Geography Heatmap]               │
└─────────────────────────────────────────────────────┘
```

### Applied Filters Display

When filters are active, display as dismissible badges above charts:
```
[Year: 2025] [Brand: Crestview Biscuits] [Channel: Grocery, E-commerce] [x]
```

---

## No Hardcoded Exclusions

**Important:** All filters default to "show all data." There are NO hidden exclusions:

1. **No test accounts excluded** — Must filter manually if needed
2. **No inactive products excluded** — Filter IS_ACTIVE = 1 to exclude
3. **No non-trackable channels excluded** — Filter IS_TRACKABLE = 1 if needed
4. **No negative values excluded** — Show returns/credits as negative (unless display rule set)
5. **No outliers excluded** — Show all data; use anomaly detection if needed

Filters are transparent and user-controlled.

---

## Export & Sharing

**Filter Persistence in Export:**
- Downloaded reports include applied filters in header: "Filters Applied: Year=2025, Brand=Sunrise Bars"
- Link sharing preserves filter state: `?filters=year:2025;brand:sunrise-bars`
- Email scheduled reports include filter snapshot

---

## Performance Considerations

**Query Optimization:**
- Apply filters at SQL WHERE clause (not post-query aggregation)
- INDEX recommendations: DATE_KEY, PRODUCT_KEY, CUSTOMER_KEY, GEO_KEY, CHANNEL_KEY
- For large fact tables (POS: 1.13M rows), use partition pruning on DATE_KEY

**BI Tool Configuration:**
- Pre-load dimension dropdowns on page load (DIM tables are small: <2.5K rows total)
- Lazy-load cascading values (e.g., states only after country selection)
- Cache filter values for 24 hours

---

## Testing Checklist

- [ ] Each filter applies correctly in WHERE clause
- [ ] Multi-select filters combine with OR logic; multiple filter types use AND
- [ ] Cascading filters update dependent dropdowns
- [ ] Warning messages display for data gaps/mismatches
- [ ] "Clear All" resets all filters to default
- [ ] Filters persist on dashboard navigation (back button)
- [ ] Null values in optional fields are included (IS_ACTIVE null = treated as unknown, not excluded)
- [ ] Export includes filter summary
