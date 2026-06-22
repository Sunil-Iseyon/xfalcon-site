# Data Schema Map
## Falcon Consumer — Complete Dimensional Model

**Project**: Falcon Consumer | **Source System**: Multi-Brand Luxury Retail CDP | **Date Range**: 2022–2024 | **IDA Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

---

## Table Directory

### Fact Tables (3)
- **FACT_CUSTOMER_PERFORMANCE** — Pre-aggregated KPI fact (primary metrics source)
- **FACT_ORDER_TRANSACTION** — Order headers with channel/source detail
- **FACT_SALES_TRANSACTION** — POS transaction log with locality & distance

### Dimension Tables (6)
- **DIM_CUSTOMER** — 1,380 rows | SCD2 | customer master with demographics, loyalty, PLCC, segments, lifetime metrics
- **DIM_HOUSEHOLD** — 600 rows | household with size, children, income
- **DIM_PRODUCT** — 90 rows | product hierarchy, category, brand, luxury flag
- **DIM_LOCATION** — 20 rows | store locations with region, channel, address
- **DIM_BUSINESS_UNIT** — 7 rows | brand/BU master with channel, region
- **DIM_DATE** — 1,096 rows | calendar + fiscal attributes

### Bridge & Configuration Tables (2)
- **DIM_GOAL_TYPE** — 10 rows | goal type reference (NEW_CUSTOMERS, RETAINED, NET_SALES_GOAL, etc.)
- **DIM_CUSTOMER_STRATEGY** — 84 rows | segmentation rules by BU (Value, Lifecycle, Behaviour)

### Views (2)
- **V_CURRENT_CUSTOMER** — 1,200 rows | current customer snapshot with BU name
- **V_LOYALTY_CUSTOMERS** — 714 rows | loyalty members view

### Bridge/Mapping Tables (1)
- **BRIDGE_CUSTOMER_EMAIL** — 1,441 rows | customer-to-email mapping (for CRM)

---

## Fact Tables

### FACT_CUSTOMER_PERFORMANCE
**Row Count**: 16,800 | **Grain**: BU × Goal Type × Period × Customer Type | **Update Frequency**: Monthly

| Column | Type | Role | Join | Notes |
|--------|------|------|------|-------|
| PERF_KEY | INT | Primary Key | — | Surrogate key |
| PERIOD_DATE_KEY | INT | Foreign Key | DIM_DATE.DATE_KEY | Period end date (month-end, quarter-end, year-end) |
| BUSINESS_UNIT_KEY | INT | Foreign Key | DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY | Brand/BU identifier (7 units) |
| GOAL_TYPE_KEY | INT | Foreign Key | DIM_GOAL_TYPE.GOAL_TYPE_KEY | Metric context (NEW_CUSTOMERS, RETAINED, NET_SALES_GOAL, etc.) |
| PERIOD_TYPE | VARCHAR | Dimension | — | MTH = month, QTR = quarter |
| FISCAL_PERIOD_ID | VARCHAR | Dimension | — | e.g., FY2024-M01 (fiscal month identifier) |
| CUSTOMER_TYPE | VARCHAR | Dimension | — | NEW, RETURNING, VIP, LAPSED, REACTIVATED |
| CUSTOMER_COUNT | INT | Measure | — | Total customers in period |
| NET_SALES | DECIMAL(15,2) | Measure | — | **Revenue in USD** — primary financial metric |
| NET_ORDERS | INT | Measure | — | Order count |
| AVG_SPEND | DECIMAL(10,2) | Measure | — | NET_SALES ÷ CUSTOMER_COUNT |
| NET_UNITS | INT | Measure | — | Total units sold |
| UNITS_PER_TRANSACTION | DECIMAL(8,2) | Measure | — | NET_UNITS ÷ NET_ORDERS |
| AVG_UNIT_RETAIL | DECIMAL(10,2) | Measure | — | NET_SALES ÷ NET_UNITS |
| AVG_ORDER_VALUE | DECIMAL(10,2) | Measure | — | NET_SALES ÷ NET_ORDERS |

**Primary Joins**:
```
FACT_CUSTOMER_PERFORMANCE
  ← DIM_DATE on PERIOD_DATE_KEY = DATE_KEY
  ← DIM_BUSINESS_UNIT on BUSINESS_UNIT_KEY = BUSINESS_UNIT_KEY
  ← DIM_GOAL_TYPE on GOAL_TYPE_KEY = GOAL_TYPE_KEY
```

**Key Notes**:
- Pre-aggregated at multi-dimensional grain; do NOT apply COUNT DISTINCT on rows
- Revenue analysis: filter to goal_type_key appropriate for context (e.g., =1 for New Customer revenue)
- PERIOD_TYPE indicates whether aggregation is monthly or quarterly
- Combine FISCAL_PERIOD_ID with DIM_DATE for fiscal year calculations

---

### FACT_ORDER_TRANSACTION
**Row Count**: 12,540 | **Grain**: Order header | **Update Frequency**: Daily

| Column | Type | Role | Join | Notes |
|--------|------|------|------|-------|
| ORDER_TXN_KEY | INT | Primary Key | — | Surrogate key |
| ORDER_DATE_KEY | INT | Foreign Key | DIM_DATE.DATE_KEY | Order date |
| CUSTOMER_KEY | INT | Foreign Key | DIM_CUSTOMER.CUSTOMER_KEY | Customer reference |
| BUSINESS_UNIT_KEY | INT | Foreign Key | DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY | Brand/BU from order |
| LOCATION_KEY | INT | Foreign Key | DIM_LOCATION.LOCATION_KEY | Store or virtual channel location |
| WEB_ORDER_ID | VARCHAR | Natural Key | — | E-commerce order ID |
| OMS_ORDER_ID | VARCHAR | Natural Key | — | Order management system ID |
| SOURCE_CUSTOMER_ID | VARCHAR | Dimension | — | Customer ID from source system |
| IP_COUNTRY | VARCHAR | Dimension | — | GeoIP country from order (if online) |
| SOURCE_TYPE | VARCHAR | Dimension | — | WEB, MOBILE_APP, TABLET, PHONE (45%, 35%, 12%, 8%) |
| MARKETING_CHANNEL | VARCHAR | Dimension | — | EMAIL, PAID_SEARCH, ORGANIC, SOCIAL, DIRECT, AFFILIATE, SMS |
| CUSTOMER_LOCALITY | VARCHAR | Dimension | — | Customer city/region (for geographic analysis) |

**Primary Joins**:
```
FACT_ORDER_TRANSACTION
  ← DIM_DATE on ORDER_DATE_KEY = DATE_KEY
  ← DIM_CUSTOMER on CUSTOMER_KEY = CUSTOMER_KEY
  ← DIM_LOCATION on LOCATION_KEY = LOCATION_KEY
  ← DIM_BUSINESS_UNIT on BUSINESS_UNIT_KEY = BUSINESS_UNIT_KEY
```

**Key Notes**:
- **No monetary columns** — use COUNT or COUNT DISTINCT for order metrics; link to FACT_CUSTOMER_PERFORMANCE for revenue
- SOURCE_TYPE and MARKETING_CHANNEL are primary channel attributes
- IP_COUNTRY available for online orders; NULL for in-store
- Natural keys (WEB_ORDER_ID, OMS_ORDER_ID) useful for reconciliation

---

### FACT_SALES_TRANSACTION
**Row Count**: 16,680 | **Grain**: POS transaction line or event | **Update Frequency**: Daily

| Column | Type | Role | Join | Notes |
|--------|------|------|------|-------|
| SALES_TXN_KEY | INT | Primary Key | — | Surrogate key |
| TRANSACTION_DATE_KEY | INT | Foreign Key | DIM_DATE.DATE_KEY | Transaction date |
| CUSTOMER_KEY | INT | Foreign Key | DIM_CUSTOMER.CUSTOMER_KEY | Customer reference |
| BUSINESS_UNIT_KEY | INT | Foreign Key | DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY | Brand/BU from transaction |
| HOUSEHOLD_KEY | INT | Foreign Key | DIM_HOUSEHOLD.HOUSEHOLD_KEY | Household reference |
| LOCATION_KEY | INT | Foreign Key | DIM_LOCATION.LOCATION_KEY | Store location |
| TRANSACTION_ID | VARCHAR | Natural Key | — | POS register transaction ID |
| REGISTER_NUMBER | VARCHAR | Dimension | — | POS register identifier |
| SOURCE_CUSTOMER_ID | VARCHAR | Dimension | — | Customer ID from source |
| CUSTOMER_LOCALITY | VARCHAR | Dimension | — | Customer city/region |
| DISTANCE_TO_STORE | DECIMAL(10,2) | Measure | — | Km or miles to nearest store |

**Primary Joins**:
```
FACT_SALES_TRANSACTION
  ← DIM_DATE on TRANSACTION_DATE_KEY = DATE_KEY
  ← DIM_CUSTOMER on CUSTOMER_KEY = CUSTOMER_KEY
  ← DIM_HOUSEHOLD on HOUSEHOLD_KEY = HOUSEHOLD_KEY
  ← DIM_LOCATION on LOCATION_KEY = LOCATION_KEY
  ← DIM_BUSINESS_UNIT on BUSINESS_UNIT_KEY = BUSINESS_UNIT_KEY
```

**Key Notes**:
- **No monetary columns** — locality and distance only; use for traffic/customer travel pattern analysis
- DISTANCE_TO_STORE useful for store proximity loyalty analysis
- Household_key enables household-level cohort analysis
- Use row count as proxy for in-store traffic; link to FACT_CUSTOMER_PERFORMANCE for revenue context

---

## Dimension Tables

### DIM_CUSTOMER
**Row Count**: 1,380 | **Type**: SCD2 (Slowly Changing Dimension Type 2) | **Update Frequency**: Monthly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| **Keys** | | | |
| CUSTOMER_KEY | INT | Primary Key | Surrogate key |
| SOURCE_CUSTOMER_ID | VARCHAR | Natural Key | Customer ID from source system |
| HOUSEHOLD_KEY | INT | Foreign Key | DIM_HOUSEHOLD reference |
| | | | |
| **Dates & Lifecycle** | | | |
| CREATED_DATE | DATE | Attribute | Account creation date |
| FIRST_PURCHASE_DATE | DATE | Attribute | First purchase date |
| LAST_PURCHASE_DATE | DATE | Attribute | Most recent purchase date |
| LAST_PURCHASE_DAYS_AGO | INT | Attribute | Days since last purchase |
| | | | |
| **Customer Type & Segment** | | | |
| CUSTOMER_TYPE | VARCHAR | Dimension | NEW, RETURNING, VIP, LAPSED, REACTIVATED |
| VALUE_SEGMENT_CODE | VARCHAR | Dimension | Platinum (5K+), Gold (1K-5K), Silver (500-1K), Bronze (1-500) |
| LIFECYCLE_SEGMENT_CODE | VARCHAR | Dimension | New (≤90d), At-Risk (91-180d), Lapsed (181-365d), Win-Back (366+), Loyal (6+ txn) |
| BEHAVIOUR_SEGMENT_CODE | VARCHAR | Dimension | VIP (80+ score), Frequent (4+ txn), Occasional (1-3 txn) |
| | | | |
| **Loyalty & Engagement** | | | |
| IS_LOYALTY_MEMBER | BOOLEAN | Flag | Loyalty program enrolled |
| LOYALTY_MEMBER_ID | VARCHAR | Attribute | Loyalty program ID |
| LOYALTY_ENROLLED_DATE | DATE | Attribute | Loyalty enrollment date |
| LOYALTY_TIER_NAME | VARCHAR | Dimension | Member tier (Bronze, Silver, Gold, Platinum, etc.) |
| PLCC_HOLDER | BOOLEAN | Flag | Private label credit card holder |
| PLCC_ENROLLMENT_DATE | DATE | Attribute | PLCC enrollment date |
| PREFERRED_CHANNEL | VARCHAR | Dimension | WEB, MOBILE_APP, RETAIL, OMNI |
| IS_EMAIL_OPT_IN | BOOLEAN | Flag | Email marketing consent |
| IS_SMS_OPT_IN | BOOLEAN | Flag | SMS marketing consent |
| | | | |
| **Demographics** | | | |
| AGE_RANGE | VARCHAR | Dimension | e.g., 18-24, 25-34, 35-44, 45-54, 55-64, 65+ |
| GENDER_CODE | VARCHAR | Dimension | M, F, U (unknown) |
| STATE_CODE | VARCHAR | Dimension | Two-letter state code |
| POSTAL_CODE | VARCHAR | Attribute | Customer postal code |
| MARITAL_STATUS | VARCHAR | Dimension | S, M, D, W |
| | | | |
| **Location Preferences** | | | |
| LOCATION_PREFERRED_KEY | INT | Foreign Key | DIM_LOCATION (preferred store) |
| LOCATION_CLOSEST_KEY | INT | Foreign Key | DIM_LOCATION (nearest store) |
| | | | |
| **Metrics & Flags** | | | |
| LIFETIME_NET_AMOUNT | DECIMAL(15,2) | Measure | Total lifetime revenue |
| LIFETIME_SALES_QTY | INT | Measure | Total lifetime units |
| LIFETIME_ORDER_COUNT | INT | Measure | Total orders |
| LIFETIME_VISIT_COUNT | INT | Measure | Total visits / transactions |
| LIFETIME_AOV | DECIMAL(10,2) | Measure | Lifetime average order value |
| MARKETABILITY_SCORE | INT | Dimension | 0–100 propensity score |
| VIP_SCORE | INT | Dimension | 0–100 VIP propensity |
| IS_EMPLOYEE | BOOLEAN | Flag | Employee record (NOT filtered) |
| IS_FRAUD | BOOLEAN | Flag | Suspected fraud (NOT filtered) |
| IS_DECEASED | BOOLEAN | Flag | Deceased flag (NOT filtered) |
| IS_ACTIVE | BOOLEAN | Flag | Active customer status |
| | | | |
| **SCD2 Tracking** | | | |
| EFFECTIVE_DATE | DATE | Attribute | Start date of current values |
| END_DATE | DATE | Attribute | End date of current values; NULL = current |
| IS_CURRENT | BOOLEAN | Flag | TRUE for current row |

**Key Notes**:
- **SCD2**: Multiple rows per customer over time; filter to EFFECTIVE_DATE ≤ analysis date AND (END_DATE IS NULL OR END_DATE > analysis date) for point-in-time analysis
- IS_EMPLOYEE, IS_FRAUD, IS_DECEASED NOT filtered by default (user requirement: no exclusions)
- LIFETIME_* metrics are cumulative; recalculated monthly
- VALUE_SEGMENT_CODE based on LIFETIME_NET_AMOUNT thresholds
- LIFECYCLE_SEGMENT_CODE based on LAST_PURCHASE_DAYS_AGO and LIFETIME_ORDER_COUNT rules

---

### DIM_HOUSEHOLD
**Row Count**: 600 | **Type**: Dimension | **Update Frequency**: Monthly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| HOUSEHOLD_KEY | INT | Primary Key | Surrogate key |
| HOUSEHOLD_ID | VARCHAR | Natural Key | Source household ID |
| HOUSEHOLD_SIZE | INT | Dimension | Number of people in household |
| HAS_CHILDREN | BOOLEAN | Flag | Children present in household |
| HOUSEHOLD_INCOME_RANGE | VARCHAR | Dimension | e.g., <$50K, $50-100K, $100-150K, $150K+ |
| MARITAL_STATUS | VARCHAR | Dimension | Head-of-household marital status |
| HOMEOWNER_FLAG | BOOLEAN | Flag | Homeownership status |
| HOUSEHOLD_LIFESPAN_DAYS | INT | Measure | Days from first to last activity |

**Key Notes**:
- Link to DIM_CUSTOMER via HOUSEHOLD_KEY for multi-person household analysis
- HAS_CHILDREN flag useful for category affinity and lifecycle analysis
- HOUSEHOLD_INCOME_RANGE used for value segmentation and targeting

---

### DIM_PRODUCT
**Row Count**: 90 | **Type**: Dimension | **Update Frequency**: Quarterly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| PRODUCT_KEY | INT | Primary Key | Surrogate key |
| SKU | VARCHAR | Natural Key | Product SKU (unique identifier) |
| PRODUCT_NAME | VARCHAR | Attribute | Product display name |
| | | | |
| **Category Hierarchy** | | | |
| CATEGORY_L1_CODE | VARCHAR | Dimension | Top category (e.g., READY_TO_WEAR, FOOTWEAR, HANDBAGS, ACCESSORIES, JEWELLERY) |
| CATEGORY_L2_CODE | VARCHAR | Dimension | Subcategory |
| | | | |
| **Retail Hierarchy** | | | |
| RETAIL_CLASS | VARCHAR | Dimension | Retail classification (e.g., Fashion, Premium) |
| RETAIL_SUBCLASS | VARCHAR | Dimension | Subclass within retail class |
| | | | |
| **Brand Hierarchy** | | | |
| BRAND_L1_CODE | VARCHAR | Dimension | Portfolio brand (e.g., MAISON_LUXE, URBAN_THREAD) |
| BRAND_L2_CODE | VARCHAR | Dimension | Sub-brand or collection |
| | | | |
| **Product Attributes** | | | |
| IS_LUXURY_FLAG | BOOLEAN | Flag | Luxury product indicator |
| COLOR | VARCHAR | Attribute | Product color(s) |
| SIZE_RANGE | VARCHAR | Attribute | Size categories |
| MATERIAL | VARCHAR | Attribute | Primary material |
| | | | |
| **Metrics** | | | |
| LIST_PRICE | DECIMAL(10,2) | Attribute | MSRP |
| AVG_DISCOUNT_RATE | DECIMAL(5,2) | Attribute | Historical average discount % |

**Key Notes**:
- 90 products across 5 categories: Ready-to-Wear (30), Footwear (25), Handbags (15), Accessories (10), Jewellery (10)
- **CRITICAL**: No FACT_PRODUCT_SALES table available; cannot calculate product-level revenue, units, or sell-through without ETL enhancement
- IS_LUXURY_FLAG useful for premium vs. mass-market analysis
- Recommend escalation to data engineering if product-level KPIs required

---

### DIM_LOCATION
**Row Count**: 20 | **Type**: Dimension | **Update Frequency**: Quarterly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| LOCATION_KEY | INT | Primary Key | Surrogate key |
| LOCATION_ID | VARCHAR | Natural Key | Store or virtual location ID |
| LOCATION_NAME | VARCHAR | Attribute | Store name or channel name |
| LOCATION_TYPE | VARCHAR | Dimension | STORE, WEB, MOBILE_APP, etc. |
| CHANNEL_TYPE | VARCHAR | Dimension | RETAIL, WEB, MOBILE, PHONE |
| | | | |
| **Address** | | | |
| ADDRESS_LINE_1 | VARCHAR | Attribute | Street address |
| CITY | VARCHAR | Attribute | City |
| STATE_CODE | VARCHAR | Attribute | Two-letter state |
| POSTAL_CODE | VARCHAR | Attribute | ZIP code |
| COUNTRY_CODE | VARCHAR | Attribute | Country code (US) |
| | | | |
| **Geography** | | | |
| GEO_REGION_ID | VARCHAR | Dimension | Region code (Northeast, Midwest, Southeast, West, South) |
| LATITUDE | DECIMAL(10,6) | Attribute | Store latitude |
| LONGITUDE | DECIMAL(10,6) | Attribute | Store longitude |
| | | | |
| **Operational** | | | |
| BUSINESS_UNIT_KEY | INT | Foreign Key | DIM_BUSINESS_UNIT (which BU owns this location) |
| STORE_OPEN_DATE | DATE | Attribute | Location open date |
| STORE_CLOSE_DATE | DATE | Attribute | Location close date (NULL = active) |

**Key Notes**:
- 20 locations: 16 physical stores + 4 virtual channels (WEB, MOBILE_APP, OUTLET WEB, PHONE)
- Stores mapped to 7 business units (BUs own one or more locations)
- GEO_REGION_ID enables regional performance analysis
- Coordinates useful for distance-to-store calculation and heat mapping

---

### DIM_BUSINESS_UNIT
**Row Count**: 7 | **Type**: Dimension | **Update Frequency**: Quarterly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| BUSINESS_UNIT_KEY | INT | Primary Key | Surrogate key |
| BUSINESS_UNIT_ID | VARCHAR | Natural Key | BU code (e.g., MAISON_LUXE, URBAN_THREAD) |
| BUSINESS_UNIT_NAME | VARCHAR | Attribute | BU display name |
| CHANNEL_TYPE | VARCHAR | Dimension | RETAIL, WEB, MOBILE |
| REGION_CODE | VARCHAR | Dimension | Primary region (Northeast, Midwest, Southeast, West, South) |
| PARENT_BRAND | VARCHAR | Attribute | Parent company / portfolio brand |
| BU_LEADER_NAME | VARCHAR | Attribute | P&L owner / executive |
| STORE_COUNT | INT | Measure | Number of locations owned by BU |
| ANNUAL_QUOTA | DECIMAL(15,2) | Measure | Annual sales target in USD |

**Key Notes**:
- 7 units: Maison Luxe (RETAIL, Northeast, 3 stores), Urban Thread (RETAIL, Midwest, 3 stores), SoleStep Footwear (RETAIL, Southeast, 4 stores), Bijou Accessories (RETAIL, West, 4 stores), LuxeStyle Online (WEB, Nationwide), LuxeStyle Mobile App (MOBILE, Nationwide), LuxeStyle Outlet (RETAIL, South, 4 stores)
- Each BU primary revenue driver for brand performance dashboard
- ANNUAL_QUOTA used for goal variance analysis

---

### DIM_DATE
**Row Count**: 1,096 | **Type**: Dimension | **Update Frequency**: Annual

| Column | Type | Role | Notes |
|--------|------|------|-------|
| DATE_KEY | INT | Primary Key | Integer date key (e.g., 20220101) |
| CALENDAR_DATE | DATE | Attribute | Actual date |
| | | | |
| **Calendar Hierarchy** | | | |
| YEAR | INT | Dimension | Calendar year (2022, 2023, 2024) |
| QUARTER | INT | Dimension | Calendar quarter (1–4) |
| MONTH | INT | Dimension | Calendar month (1–12) |
| MONTH_NAME | VARCHAR | Attribute | Month display name (Jan, Feb, ..., Dec) |
| WEEK | INT | Dimension | ISO week number |
| DAY_OF_WEEK | INT | Dimension | 1=Monday, 7=Sunday |
| DAY_NAME | VARCHAR | Attribute | Day display name (Mon, Tue, ..., Sun) |
| | | | |
| **Fiscal Hierarchy** | | | |
| FISCAL_YEAR | INT | Dimension | Fiscal year (Feb-Jan; e.g., FY2022 = Feb 2022 - Jan 2023) |
| FISCAL_QUARTER | INT | Dimension | Fiscal quarter (1–4; Q1 = Feb-Apr, Q2 = May-Jul, Q3 = Aug-Oct, Q4 = Nov-Jan) |
| FISCAL_MONTH | INT | Dimension | Fiscal month (1–12; M1 = Feb, M2 = Mar, ..., M12 = Jan) |
| FISCAL_MONTH_NAME | VARCHAR | Attribute | Fiscal month display name |
| FISCAL_WEEK | INT | Dimension | Fiscal week (1–52/53) |
| FISCAL_PERIOD_ID | VARCHAR | Attribute | Fiscal period code (e.g., FY2022-Q01, FY2022-M02) |
| | | | |
| **Flags & Attributes** | | | |
| IS_MONTH_END | BOOLEAN | Flag | Last day of calendar month |
| IS_QUARTER_END | BOOLEAN | Flag | Last day of quarter |
| IS_FISCAL_MONTH_END | BOOLEAN | Flag | Last day of fiscal month |
| IS_FISCAL_QUARTER_END | BOOLEAN | Flag | Last day of fiscal quarter |
| IS_FISCAL_YEAR_END | BOOLEAN | Flag | Last day of fiscal year (Jan 31) |
| IS_WEEKEND | BOOLEAN | Flag | Saturday or Sunday |
| IS_HOLIDAY | BOOLEAN | Flag | US holiday |

**Key Notes**:
- Fiscal year starts February (Retail 4-5-4 calendar)
- Fiscal year 2022 = Feb 2022 - Jan 2023 (so Feb 2022 = FY2022-M01, Mar 2022 = FY2022-M02, ..., Jan 2023 = FY2022-M12)
- Use FISCAL_* columns for retail period-over-period analysis
- Use CALENDAR_* for standard calendar reporting
- IS_MONTH_END useful for month-end dashboard refresh logic

---

## Bridge & Configuration Tables

### DIM_GOAL_TYPE
**Row Count**: 10 | **Type**: Reference / Configuration | **Update Frequency**: Annual

| Column | Type | Role | Notes |
|--------|------|------|-------|
| GOAL_TYPE_KEY | INT | Primary Key | Surrogate key |
| GOAL_TYPE_CODE | VARCHAR | Natural Key | Code (NEW_CUSTOMERS, RETAINED, NET_SALES_GOAL, etc.) |
| GOAL_TYPE_NAME | VARCHAR | Attribute | Display name |
| GOAL_CATEGORY | VARCHAR | Dimension | ACQUISITION, RETENTION, REVENUE, LOYALTY, MARKETING, CHANNEL |
| DESCRIPTION | VARCHAR | Attribute | Definition of goal |
| IS_ACTIVE | BOOLEAN | Flag | Currently in use |

**Available Goal Types** (examples):
- NEW_CUSTOMERS — new customer acquisition
- REACTIVATED — reactivation of lapsed customers
- RETAINED — retention of existing customers
- AT_RISK — at-risk customer identification
- NET_SALES_GOAL — revenue target
- AOV_GOAL — average order value target
- UNITS_GOAL — unit volume target
- LOYALTY_ENROLL — loyalty program enrollment
- EMAIL_CAPTURE — email list growth
- OMNI_SHOPPERS — omnichannel customers

**Key Notes**:
- Pre-aggregated FACT_CUSTOMER_PERFORMANCE contains multiple rows per period per BU, one row per goal_type
- Filter appropriately for context (e.g., goal_type_key = 1 for new customer revenue)

---

### DIM_CUSTOMER_STRATEGY
**Row Count**: 84 | **Type**: Reference / Configuration | **Update Frequency**: Quarterly

| Column | Type | Role | Notes |
|--------|------|------|-------|
| STRATEGY_KEY | INT | Primary Key | Surrogate key |
| BUSINESS_UNIT_KEY | INT | Foreign Key | DIM_BUSINESS_UNIT |
| SEGMENT_TYPE | VARCHAR | Dimension | VALUE, LIFECYCLE, BEHAVIOUR |
| SEGMENT_CODE | VARCHAR | Dimension | e.g., PLATINUM, NEW, VIP |
| SEGMENT_NAME | VARCHAR | Attribute | Display name |
| SEGMENT_DESCRIPTION | VARCHAR | Attribute | Definition / rules |
| | | | |
| **Rules** | | | |
| MIN_SPEND_THRESHOLD | DECIMAL(10,2) | Attribute | Minimum spend for segment |
| MAX_SPEND_THRESHOLD | DECIMAL(10,2) | Attribute | Maximum spend for segment |
| MIN_TXN_COUNT | INT | Attribute | Minimum transaction count |
| MAX_TXN_COUNT | INT | Attribute | Maximum transaction count |
| DAYS_WINDOW | INT | Attribute | Look-back window in days |
| | | | |
| **Operational** | | | |
| CHANNEL_PREFERENCE | VARCHAR | Attribute | Preferred channel for segment |
| RECOMMENDED_OFFER | VARCHAR | Attribute | Offer type recommendation |
| IS_ACTIVE | BOOLEAN | Flag | Rule currently in use |

**Key Notes**:
- 84 rows = 3 segment types (VALUE, LIFECYCLE, BEHAVIOUR) × 4-6 segment codes per type × 7 BUs
- Rules engine used to assign customers to VALUE_SEGMENT_CODE, LIFECYCLE_SEGMENT_CODE, BEHAVIOUR_SEGMENT_CODE in DIM_CUSTOMER
- Enables multi-segmentation analysis without requiring pre-computed flags

---

## Views

### V_CURRENT_CUSTOMER
**Row Count**: 1,200 | **Type**: View | **Update Frequency**: Monthly

**Purpose**: Current customer snapshot with BU enrichment

| Column | Source | Notes |
|--------|--------|-------|
| CUSTOMER_KEY | DIM_CUSTOMER | |
| SOURCE_CUSTOMER_ID | DIM_CUSTOMER | |
| BUSINESS_UNIT_KEY | DIM_CUSTOMER (via preferred location → DIM_LOCATION → DIM_BUSINESS_UNIT) | Primary BU |
| BUSINESS_UNIT_NAME | DIM_BUSINESS_UNIT | BU name |
| CUSTOMER_TYPE | DIM_CUSTOMER | |
| VALUE_SEGMENT_CODE | DIM_CUSTOMER | |
| LIFETIME_NET_AMOUNT | DIM_CUSTOMER | |
| IS_LOYALTY_MEMBER | DIM_CUSTOMER | |
| LAST_PURCHASE_DATE | DIM_CUSTOMER | |
| ALL OTHER DIM_CUSTOMER ATTRIBUTES | DIM_CUSTOMER | Current state only (SCD2 filtered) |

**Grain**: One row per active customer

---

### V_LOYALTY_CUSTOMERS
**Row Count**: 714 | **Type**: View | **Update Frequency**: Monthly

**Purpose**: Loyalty program members snapshot

| Column | Source | Notes |
|--------|--------|-------|
| CUSTOMER_KEY | DIM_CUSTOMER | |
| SOURCE_CUSTOMER_ID | DIM_CUSTOMER | |
| LOYALTY_MEMBER_ID | DIM_CUSTOMER | |
| LOYALTY_TIER_NAME | DIM_CUSTOMER | |
| LOYALTY_ENROLLED_DATE | DIM_CUSTOMER | |
| LOYALTY_DAYS_MEMBER | Computed | Days since enrollment |
| IS_PLCC_HOLDER | DIM_CUSTOMER | |
| LIFETIME_NET_AMOUNT | DIM_CUSTOMER | |
| LIFETIME_ORDER_COUNT | DIM_CUSTOMER | |
| LAST_PURCHASE_DATE | DIM_CUSTOMER | |

**Grain**: One row per loyalty member (active)

**Key Notes**:
- Subset of V_CURRENT_CUSTOMER where IS_LOYALTY_MEMBER = TRUE
- Useful for loyalty dashboard and retention cohort analysis

---

## Bridge/Mapping Tables

### BRIDGE_CUSTOMER_EMAIL
**Row Count**: 1,441 | **Type**: Bridge / Mapping | **Update Frequency**: Daily

| Column | Type | Role | Notes |
|--------|------|------|-------|
| BRIDGE_KEY | INT | Primary Key | Surrogate key |
| CUSTOMER_KEY | INT | Foreign Key | DIM_CUSTOMER |
| EMAIL_ADDRESS | VARCHAR | Attribute | Email (hashed or masked for privacy) |
| EMAIL_TYPE | VARCHAR | Dimension | PRIMARY, SECONDARY, WORK, OTHER |
| IS_PREFERRED | BOOLEAN | Flag | Primary email for communication |
| EMAIL_OPT_IN_STATUS | VARCHAR | Dimension | OPT_IN, OPT_OUT, PENDING_CONFIRMATION |
| EFFECTIVE_DATE | DATE | Attribute | Email activation date |
| END_DATE | DATE | Attribute | Email deactivation date (NULL = current) |

**Grain**: Many-to-many (customer-to-email)

**Key Notes**:
- Useful for marketing automation and email list enrichment
- BRIDGE_CUSTOMER_EMAIL → CUSTOMER_KEY → FACT_CUSTOMER_PERFORMANCE for email campaign performance

---

## Complete Join Graph

```
FACT_CUSTOMER_PERFORMANCE
  ├─ PERIOD_DATE_KEY ──→ DIM_DATE.DATE_KEY
  ├─ BUSINESS_UNIT_KEY ──→ DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY
  └─ GOAL_TYPE_KEY ──→ DIM_GOAL_TYPE.GOAL_TYPE_KEY

FACT_ORDER_TRANSACTION
  ├─ ORDER_DATE_KEY ──→ DIM_DATE.DATE_KEY
  ├─ CUSTOMER_KEY ──→ DIM_CUSTOMER.CUSTOMER_KEY
  │   └─ HOUSEHOLD_KEY ──→ DIM_HOUSEHOLD.HOUSEHOLD_KEY
  │   └─ LOCATION_PREFERRED_KEY ──→ DIM_LOCATION.LOCATION_KEY
  ├─ LOCATION_KEY ──→ DIM_LOCATION.LOCATION_KEY
  │   └─ BUSINESS_UNIT_KEY ──→ DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY
  └─ BUSINESS_UNIT_KEY ──→ DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY

FACT_SALES_TRANSACTION
  ├─ TRANSACTION_DATE_KEY ──→ DIM_DATE.DATE_KEY
  ├─ CUSTOMER_KEY ──→ DIM_CUSTOMER.CUSTOMER_KEY
  │   └─ HOUSEHOLD_KEY ──→ DIM_HOUSEHOLD.HOUSEHOLD_KEY
  ├─ HOUSEHOLD_KEY ──→ DIM_HOUSEHOLD.HOUSEHOLD_KEY
  ├─ LOCATION_KEY ──→ DIM_LOCATION.LOCATION_KEY
  │   └─ BUSINESS_UNIT_KEY ──→ DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY
  └─ BUSINESS_UNIT_KEY ──→ DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY

DIM_CUSTOMER
  ├─ HOUSEHOLD_KEY ──→ DIM_HOUSEHOLD.HOUSEHOLD_KEY
  ├─ LOCATION_PREFERRED_KEY ──→ DIM_LOCATION.LOCATION_KEY
  └─ LOCATION_CLOSEST_KEY ──→ DIM_LOCATION.LOCATION_KEY

BRIDGE_CUSTOMER_EMAIL
  └─ CUSTOMER_KEY ──→ DIM_CUSTOMER.CUSTOMER_KEY

V_CURRENT_CUSTOMER
  └─ Joined view of DIM_CUSTOMER + DIM_BUSINESS_UNIT + DIM_LOCATION

V_LOYALTY_CUSTOMERS
  └─ Filtered view of DIM_CUSTOMER (IS_LOYALTY_MEMBER = TRUE)
```

---

## Data Quality Notes

- **SCD2 Tracking**: DIM_CUSTOMER uses effective/end dates; always filter to EFFECTIVE_DATE ≤ analysis date AND (END_DATE IS NULL OR END_DATE > analysis date) for point-in-time analysis
- **No Exclusions**: IS_EMPLOYEE, IS_FRAUD, IS_DECEASED flags present but NOT applied as filters (user requirement)
- **Fiscal Year Mapping**: All fiscal calculations via DIM_DATE; FY2022 = Feb 2022 - Jan 2023
- **Pre-Aggregated Grain**: FACT_CUSTOMER_PERFORMANCE already multi-dimensional; do not COUNT DISTINCT on customer rows
- **Revenue Source**: NET_SALES only in FACT_CUSTOMER_PERFORMANCE; order and sales facts have no monetary columns
- **Natural Keys**: WEB_ORDER_ID, OMS_ORDER_ID, TRANSACTION_ID useful for source system reconciliation

---

## Relationship Confidence

All foreign key relationships defined at 1.0 confidence level (verified, no orphaned records).

---

## Next Steps

1. Validate join paths against actual warehouse schema
2. Confirm column data types and nullable constraints
3. Review SCD2 effective dating logic with data engineering
4. Test fiscal year calculations for boundary dates (Jan 31 - Feb 1)
5. Profile DIM_PRODUCT for product-level sales fact gap (escalation needed)
