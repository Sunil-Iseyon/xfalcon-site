# Data Schema Map
**xFalcon AnalyticsPro — Food & Snacks CPG**

---

## Overview
**13 Tables | Star Schema (5 facts, 8 dimensions) | 2.75M combined rows | 2020-2025 coverage**

IDA Connector: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

---

## Dimension Tables (8)

### DIM_DATE
**Rows:** 2,557 | **Type:** Slowly Changing Dimension (SCD-0) | **Grain:** Daily

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| DATE_KEY | INT | PK | YYYYMMDD format (e.g., 20250401) |
| FULL_DATE | DATE | - | Full date |
| YEAR_NUM | INT | - | Calendar year (2020-2025) |
| QUARTER_NUM | INT | - | Calendar quarter (1-4) |
| MONTH_NUM | INT | - | Month of year (1-12) |
| MONTH_NAME | VARCHAR | - | Full month name (January, etc.) |
| WEEK_NUM | INT | - | ISO week number (1-53) |
| DAY_OF_WEEK | INT | - | Day of week (1=Monday, 7=Sunday) |
| DAY_NAME | VARCHAR | - | Full day name |
| IS_WEEKEND | BOOLEAN | - | True for Saturday/Sunday |
| IS_HOLIDAY | BOOLEAN | - | True if US Federal holiday |
| HOLIDAY_NAME | VARCHAR | - | Holiday name (null if not holiday) |
| FISCAL_YEAR | INT | - | Fiscal year (starts January) |
| FISCAL_QUARTER | INT | - | Fiscal quarter (1-4) |
| FISCAL_PERIOD | INT | - | Fiscal period (1-12, month-aligned) |

**Primary Join Key:** DATE_KEY

---

### DIM_PRODUCT
**Rows:** 105 | **Type:** SCD-2 (with effective dates) | **Grain:** SKU

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| PRODUCT_KEY | INT | PK | Surrogate key |
| SKU_CODE | VARCHAR | Unique | Unique product code (e.g., CB001) |
| PRODUCT_NAME | VARCHAR | - | Full product name |
| BRAND | VARCHAR | - | 5 brands: Crestview Biscuits, Sunrise Bars, Crestfield Confections, Morning Ridge Cereals, Prairie Pantry Meals |
| BRAND_TIER | VARCHAR | - | Tier classification (Premium, Standard, Value) |
| CATEGORY | VARCHAR | - | Product category |
| SUB_CATEGORY | VARCHAR | - | Narrower classification |
| PACK_SIZE | DECIMAL | - | Units per pack (e.g., 12, 20) |
| UNIT_OF_MEASURE | VARCHAR | - | UOM (each, case, box, etc.) |
| UNITS_PER_CASE | INT | - | Units in a shipping case |
| UNIT_LIST_PRICE | DECIMAL(10,2) | - | Retail price per unit (USD) |
| CASE_LIST_PRICE | DECIMAL(10,2) | - | Retail case price (USD) |
| UNIT_COST | DECIMAL(10,2) | - | COGS per unit (USD) |
| GROSS_MARGIN_PCT | DECIMAL(5,2) | - | List-based margin % |
| IS_ACTIVE | BOOLEAN | - | True if product is actively sold |
| LAUNCH_DATE | DATE | - | Product launch date |
| DISCONTINUE_DATE | DATE | - | Discontinuation date (null if active) |
| IS_SEASONAL | BOOLEAN | - | True if seasonal |
| SEASONAL_MONTHS | VARCHAR | - | Comma-separated months (e.g., "6,7,8") |

**Primary Join Key:** PRODUCT_KEY

---

### DIM_CUSTOMER
**Rows:** 36 | **Type:** SCD-1 (no history) | **Grain:** Customer

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| CUSTOMER_KEY | INT | PK | Surrogate key |
| CUSTOMER_CODE | VARCHAR | Unique | Customer code (e.g., CUST001) |
| CUSTOMER_NAME | VARCHAR | - | Customer name (retailer, distributor, etc.) |
| CUSTOMER_TYPE | VARCHAR | - | Type (Retailer, Distributor, Wholesaler, E-commerce) |
| CHANNEL | VARCHAR | - | Primary channel (see DIM_CHANNEL) |
| BANNER_GROUP | VARCHAR | - | Banner or group affiliation |
| HEADQUARTER_STATE | VARCHAR | - | HQ state code |
| HEADQUARTER_COUNTRY | VARCHAR | - | HQ country (mostly USA) |
| STORE_COUNT | INT | - | Number of stores operated |
| CUSTOMER_TIER | VARCHAR | - | Tier (Tier1=Major, Tier2, Tier3, etc.) |
| IS_ACTIVE | BOOLEAN | - | Currently active customer |

**Primary Join Key:** CUSTOMER_KEY

---

### DIM_CHANNEL
**Rows:** 8 | **Type:** SCD-0 (static) | **Grain:** Channel

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| CHANNEL_KEY | INT | PK | Surrogate key |
| CHANNEL_NAME | VARCHAR | - | Channel name (Grocery, E-commerce, Pharmacy, etc.) |
| CHANNEL_GROUP | VARCHAR | - | Grouping (e.g., "Traditional" or "Digital") |
| IS_TRACKABLE | BOOLEAN | - | True if sales are directly tracked; false if estimated/syndicated |
| DATA_SOURCE | VARCHAR | - | Source (POS, Syndicated, Direct, etc.) |

**Primary Join Key:** CHANNEL_KEY

---

### DIM_GEOGRAPHY
**Rows:** 58 | **Type:** SCD-0 (static) | **Grain:** Geographic area

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| GEO_KEY | INT | PK | Surrogate key |
| COUNTRY_CODE | VARCHAR | - | ISO country code (US, CA, MX, etc.) |
| COUNTRY | VARCHAR | - | Country name |
| REGION | VARCHAR | - | Region (North America, EMEA, APAC, etc.) |
| STATE_PROVINCE | VARCHAR | - | State/province name |
| STATE_CODE | VARCHAR | - | State code (2-letter US, etc.) |
| MARKET_TIER | VARCHAR | - | Market tier (Urban, Suburban, Rural) |
| NIELSEN_MARKET | VARCHAR | - | Nielsen DMA code or market name |
| POPULATION_BAND | VARCHAR | - | Population band (e.g., ">1M", "100K-1M") |

**Primary Join Key:** GEO_KEY

---

### DIM_PROMOTION
**Rows:** 60 | **Type:** SCD-1 (static) | **Grain:** Promotion

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| PROMOTION_KEY | INT | PK | Surrogate key |
| PROMOTION_CODE | VARCHAR | Unique | Unique promotion identifier |
| PROMOTION_NAME | VARCHAR | - | Promotion name/description |
| PROMOTION_TYPE | VARCHAR | - | Type (Discount, BOGO, Bundle, Loyalty, etc.) |
| DISCOUNT_TYPE | VARCHAR | - | Discount mechanism (% off, $ off, etc.) |
| FUNDING_SOURCE | VARCHAR | - | Source (Manufacturer, Retailer, Shared, etc.) |
| PLANNED_START | DATE | - | Planned start date |
| PLANNED_END | DATE | - | Planned end date |
| BRAND | VARCHAR | - | Brand associated with promotion |
| CATEGORY | VARCHAR | - | Category (optional multi-category promos) |

**Primary Join Key:** PROMOTION_KEY

---

### DIM_SUPPLIER
**Rows:** 16 | **Type:** SCD-0 (static) | **Grain:** Supplier

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| SUPPLIER_KEY | INT | PK | Surrogate key |
| SUPPLIER_CODE | VARCHAR | Unique | Supplier code |
| SUPPLIER_NAME | VARCHAR | - | Supplier name |
| SUPPLIER_TYPE | VARCHAR | - | Type (Manufacturer, Distributor, Contract Logistics, etc.) |
| MATERIAL_CATEGORY | VARCHAR | - | Primary material (Ingredients, Packaging, etc.) |
| COUNTRY_OF_ORIGIN | VARCHAR | - | Primary origin country |
| IS_APPROVED | BOOLEAN | - | Approved vendor flag |
| RISK_RATING | VARCHAR | - | Risk assessment (Low, Medium, High) |

**Primary Join Key:** SUPPLIER_KEY

---

### DIM_HOUSEHOLD
**Rows:** 80,000 | **Type:** SCD-1 (static) | **Grain:** Household panel member

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| HOUSEHOLD_KEY | INT | PK | Surrogate key |
| HOUSEHOLD_CODE | VARCHAR | Unique | Panel household identifier |
| PANEL_SEGMENT | VARCHAR | - | Segment (Urban, Suburban, Rural, etc.) |
| INCOME_BAND | VARCHAR | - | Income bracket (e.g., "$0-25K", "$25-50K", "$100K+") |
| HOUSEHOLD_SIZE | INT | - | Number of persons (1-10+) |
| LIFE_STAGE | VARCHAR | - | Life stage (Young Single, Family with Children, Empty Nester, etc.) |
| GEO_KEY | INT | FK | Geography key |
| PRIMARY_CHANNEL | VARCHAR | - | Primary shopping channel |
| LOYALTY_TIER | VARCHAR | - | Loyalty tier (if enrolled in loyalty program) |
| ENROLL_DATE | DATE | - | Panel enrollment date |
| IS_ACTIVE | BOOLEAN | - | Currently active panel member |

**Primary Join Key:** HOUSEHOLD_KEY  
**Foreign Key:** GEO_KEY (to DIM_GEOGRAPHY)

---

## Fact Tables (5)

### FACT_POS_SALES
**Rows:** 1,130,951 | **Grain:** Product × Customer × Date × Promotion | **Period:** 2020-2025

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| POS_SALES_KEY | INT | PK | Surrogate key |
| DATE_KEY | INT | FK | DIM_DATE.DATE_KEY |
| PRODUCT_KEY | INT | FK | DIM_PRODUCT.PRODUCT_KEY |
| CUSTOMER_KEY | INT | FK | DIM_CUSTOMER.CUSTOMER_KEY |
| GEO_KEY | INT | FK | DIM_GEOGRAPHY.GEO_KEY |
| CHANNEL_KEY | INT | FK | DIM_CHANNEL.CHANNEL_KEY |
| PROMOTION_KEY | INT | FK | DIM_PROMOTION.PROMOTION_KEY (null if no promo) |
| UNITS_SOLD | DECIMAL(12,2) | - | Total units sold |
| CASES_SOLD | DECIMAL(12,2) | - | Total cases sold |
| GROSS_REVENUE | DECIMAL(12,2) | - | Units × List Price (before discounts) |
| TRADE_DISCOUNT | DECIMAL(12,2) | - | Trade discount given ($ amount) |
| NET_REVENUE | DECIMAL(12,2) | - | GROSS_REVENUE - TRADE_DISCOUNT |
| COGS | DECIMAL(12,2) | - | Cost of goods sold (UNITS_SOLD × UNIT_COST) |
| GROSS_PROFIT | DECIMAL(12,2) | - | NET_REVENUE - COGS |
| IS_ON_PROMOTION | BOOLEAN | - | True if sold with promotion |
| PROMO_PRICE | DECIMAL(10,2) | - | Promotional price per unit (null if no promo) |
| BASE_PRICE | DECIMAL(10,2) | - | Regular list price per unit |

**Key Relationships:**
- Join to DIM_DATE on DATE_KEY
- Join to DIM_PRODUCT on PRODUCT_KEY
- Join to DIM_CUSTOMER on CUSTOMER_KEY
- Join to DIM_GEOGRAPHY on GEO_KEY
- Join to DIM_CHANNEL on CHANNEL_KEY
- Left join to DIM_PROMOTION on PROMOTION_KEY

---

### FACT_SHIPMENTS
**Rows:** 145,082 | **Grain:** Product × Supplier × Customer × Date | **Period:** 2020-2025

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| SHIPMENT_KEY | INT | PK | Surrogate key |
| DATE_KEY | INT | FK | DIM_DATE.DATE_KEY |
| PRODUCT_KEY | INT | FK | DIM_PRODUCT.PRODUCT_KEY |
| CUSTOMER_KEY | INT | FK | DIM_CUSTOMER.CUSTOMER_KEY |
| GEO_KEY | INT | FK | DIM_GEOGRAPHY.GEO_KEY |
| SUPPLIER_KEY | INT | FK | DIM_SUPPLIER.SUPPLIER_KEY |
| CASES_SHIPPED | DECIMAL(12,2) | - | Cases shipped |
| UNITS_SHIPPED | DECIMAL(12,2) | - | Total units shipped |
| INVOICE_VALUE | DECIMAL(12,2) | - | Gross invoice value (USD) |
| NET_INVOICE_VALUE | DECIMAL(12,2) | - | Invoice value after deductions |
| SHIP_TO_STATE | VARCHAR | - | Destination state code |
| SHIP_TO_COUNTRY | VARCHAR | - | Destination country |
| FILL_RATE_PCT | DECIMAL(5,2) | - | % of requested units filled (0-100) |
| ON_TIME_FLAG | BOOLEAN | - | True if delivered on schedule |

**Key Relationships:**
- Join to DIM_DATE on DATE_KEY
- Join to DIM_PRODUCT on PRODUCT_KEY
- Join to DIM_CUSTOMER on CUSTOMER_KEY
- Join to DIM_GEOGRAPHY on GEO_KEY
- Join to DIM_SUPPLIER on SUPPLIER_KEY

---

### FACT_INVENTORY
**Rows:** 97,152 | **Grain:** Product × Customer × Geography × Date (snapshot) | **Period:** 2020-2025

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| INVENTORY_KEY | INT | PK | Surrogate key |
| DATE_KEY | INT | FK | DIM_DATE.DATE_KEY |
| PRODUCT_KEY | INT | FK | DIM_PRODUCT.PRODUCT_KEY |
| CUSTOMER_KEY | INT | FK | DIM_CUSTOMER.CUSTOMER_KEY |
| GEO_KEY | INT | FK | DIM_GEOGRAPHY.GEO_KEY |
| ON_HAND_CASES | DECIMAL(12,2) | - | Cases in inventory (at location) |
| ON_ORDER_CASES | DECIMAL(12,2) | - | Cases on order |
| IN_TRANSIT_CASES | DECIMAL(12,2) | - | Cases in transit |
| DAYS_ON_HAND | DECIMAL(5,2) | - | Days supply (based on recent velocity) |
| WEEKS_OF_SUPPLY | DECIMAL(5,2) | - | Weeks of supply (avg 1.5 weeks) |
| OUT_OF_STOCK_FLAG | BOOLEAN | - | True if on-hand = 0 |
| OVERSTOCK_FLAG | BOOLEAN | - | True if on-hand exceeds target |

**Key Relationships:**
- Join to DIM_DATE on DATE_KEY
- Join to DIM_PRODUCT on PRODUCT_KEY
- Join to DIM_CUSTOMER on CUSTOMER_KEY
- Join to DIM_GEOGRAPHY on GEO_KEY

---

### FACT_TRADE_SPEND
**Rows:** 9,243 | **Grain:** Product × Customer × Promotion × Date × Geography | **Period:** 2020-2024

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| TRADE_SPEND_KEY | INT | PK | Surrogate key |
| DATE_KEY | INT | FK | DIM_DATE.DATE_KEY |
| PRODUCT_KEY | INT | FK | DIM_PRODUCT.PRODUCT_KEY |
| CUSTOMER_KEY | INT | FK | DIM_CUSTOMER.CUSTOMER_KEY |
| PROMOTION_KEY | INT | FK | DIM_PROMOTION.PROMOTION_KEY |
| GEO_KEY | INT | FK | DIM_GEOGRAPHY.GEO_KEY |
| PLANNED_SPEND | DECIMAL(12,2) | - | Planned trade spend ($) |
| ACTUAL_SPEND | DECIMAL(12,2) | - | Actual trade spend ($) |
| BASELINE_UNITS | DECIMAL(12,2) | - | Baseline units (no promo) |
| INCREMENTAL_UNITS | DECIMAL(12,2) | - | Incremental units driven by promo |
| TOTAL_UNITS | DECIMAL(12,2) | - | BASELINE_UNITS + INCREMENTAL_UNITS |
| BASELINE_REVENUE | DECIMAL(12,2) | - | Revenue without promo |
| INCREMENTAL_REVENUE | DECIMAL(12,2) | - | Revenue lift from promo |
| COST_PER_INCREMENTAL_UNIT | DECIMAL(10,2) | - | ACTUAL_SPEND / INCREMENTAL_UNITS |
| PROMO_ROI | DECIMAL(8,2) | - | (INCREMENTAL_REVENUE / ACTUAL_SPEND) × 100 |

**Key Relationships:**
- Join to DIM_DATE on DATE_KEY
- Join to DIM_PRODUCT on PRODUCT_KEY
- Join to DIM_CUSTOMER on CUSTOMER_KEY
- Join to DIM_PROMOTION on PROMOTION_KEY
- Join to DIM_GEOGRAPHY on GEO_KEY

---

### FACT_HOUSEHOLD_PURCHASE
**Rows:** 1,396,413 | **Grain:** Household × Product × Channel × Date | **Period:** 2020-2025

| Column | Data Type | Key? | Notes |
|--------|-----------|------|-------|
| HH_PURCHASE_KEY | INT | PK | Surrogate key |
| DATE_KEY | INT | FK | DIM_DATE.DATE_KEY |
| HOUSEHOLD_KEY | INT | FK | DIM_HOUSEHOLD.HOUSEHOLD_KEY |
| PRODUCT_KEY | INT | FK | DIM_PRODUCT.PRODUCT_KEY |
| CHANNEL_KEY | INT | FK | DIM_CHANNEL.CHANNEL_KEY |
| GEO_KEY | INT | FK | DIM_GEOGRAPHY.GEO_KEY |
| PROMOTION_KEY | INT | FK | DIM_PROMOTION.PROMOTION_KEY (null if no promo) |
| UNITS_PURCHASED | DECIMAL(12,2) | - | Units purchased in transaction |
| AMOUNT_PAID | DECIMAL(12,2) | - | Dollar amount paid (USD) |
| IS_ON_PROMOTION | BOOLEAN | - | True if promotional purchase |
| IS_REPEAT_PURCHASE | BOOLEAN | - | True if household purchased brand before |
| DAYS_SINCE_LAST_PURCHASE | INT | - | Days since last purchase (null if first) |

**Key Relationships:**
- Join to DIM_DATE on DATE_KEY
- Join to DIM_HOUSEHOLD on HOUSEHOLD_KEY
- Join to DIM_PRODUCT on PRODUCT_KEY
- Join to DIM_CHANNEL on CHANNEL_KEY
- Join to DIM_GEOGRAPHY on GEO_KEY
- Left join to DIM_PROMOTION on PROMOTION_KEY

---

## Key Join Patterns

### Core POS Analysis
```
FACT_POS_SALES
  LEFT JOIN DIM_DATE ON DATE_KEY
  LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
  LEFT JOIN DIM_CUSTOMER ON CUSTOMER_KEY
  LEFT JOIN DIM_GEOGRAPHY ON GEO_KEY
  LEFT JOIN DIM_CHANNEL ON CHANNEL_KEY
  LEFT JOIN DIM_PROMOTION ON PROMOTION_KEY
```

### Shipment & Supply Chain
```
FACT_SHIPMENTS
  LEFT JOIN DIM_SUPPLIER ON SUPPLIER_KEY
  LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
  LEFT JOIN DIM_CUSTOMER ON CUSTOMER_KEY
  LEFT JOIN DIM_DATE ON DATE_KEY
```

### Inventory Status
```
FACT_INVENTORY
  LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
  LEFT JOIN DIM_CUSTOMER ON CUSTOMER_KEY
  LEFT JOIN DIM_GEOGRAPHY ON GEO_KEY
  LEFT JOIN DIM_DATE ON DATE_KEY
```

### Promo ROI Analysis
```
FACT_TRADE_SPEND
  LEFT JOIN DIM_PROMOTION ON PROMOTION_KEY
  LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
  LEFT JOIN DIM_CUSTOMER ON CUSTOMER_KEY
  LEFT JOIN DIM_GEOGRAPHY ON GEO_KEY
  LEFT JOIN DIM_DATE ON DATE_KEY
```

### Household Panel
```
FACT_HOUSEHOLD_PURCHASE
  LEFT JOIN DIM_HOUSEHOLD ON HOUSEHOLD_KEY
  LEFT JOIN DIM_PRODUCT ON PRODUCT_KEY
  LEFT JOIN DIM_CHANNEL ON CHANNEL_KEY
  LEFT JOIN DIM_GEOGRAPHY ON GEO_KEY
  LEFT JOIN DIM_DATE ON DATE_KEY
```

---

## Row Count Summary

| Table | Rows | Grain | Coverage |
|-------|------|-------|----------|
| DIM_DATE | 2,557 | Daily | 2020-2025 (6 years) |
| DIM_PRODUCT | 105 | SKU | Current + historical |
| DIM_CUSTOMER | 36 | Customer | All active & inactive |
| DIM_CHANNEL | 8 | Channel | All 8 channels |
| DIM_GEOGRAPHY | 58 | Geography | All countries, states, regions |
| DIM_PROMOTION | 60 | Promotion | 2020-2024 promotions |
| DIM_SUPPLIER | 16 | Supplier | All vendors |
| DIM_HOUSEHOLD | 80,000 | Household | Panel members |
| FACT_POS_SALES | 1,130,951 | Transaction | 2020-2025 |
| FACT_SHIPMENTS | 145,082 | Shipment | 2020-2025 |
| FACT_INVENTORY | 97,152 | Snapshot | 2020-2025 |
| FACT_TRADE_SPEND | 9,243 | Promotion | 2020-2024 |
| FACT_HOUSEHOLD_PURCHASE | 1,396,413 | Purchase | 2020-2025 |

**Total: 3,047,652 rows**
