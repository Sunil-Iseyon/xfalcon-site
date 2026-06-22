# Data Schema Map
## Falcon Telecom xFalcon AnalyticsPro Kit

Complete database schema documentation for the Falcon Telecom analytics platform. All tables use consistent grain and join patterns for reliable dimensional analysis across 80,000 subscribers and 7 years of historical data (2019-2025).

---

## Star Schema Overview

```
                        DIM_DATE
                           |
        ________________________|________________________
       |          |          |          |          |
   FACT_BILLING  FACT_USAGE  FACT_LIFECYCLE  FACT_ROAMING_USAGE
       |          |          |          |
       |__________|__________|          |
              |                         |
          DIM_SUBSCRIBER               |
              |                         |
      ________|__________               |
     |        |         |               |
DIM_GEOGRAPHY DIM_PLAN  |               |
     |                  |               |
DIM_TOWER      DIM_DEVICE        DIM_ROAMING_PARTNER
(via GEOGRAPHY_KEY)

All facts join:
  - DIM_DATE via DATE_KEY (daily/monthly grain)
  - DIM_SUBSCRIBER via SUBSCRIBER_KEY (customer dimension)
  - DIM_GEOGRAPHY via GEOGRAPHY_KEY (regional dimension)

Additional joins:
  - FACT_BILLING/USAGE/LIFECYCLE -> DIM_PLAN via PLAN_KEY
  - FACT_USAGE -> DIM_TOWER via TOWER_KEY
  - DIM_SUBSCRIBER -> DIM_DEVICE via DEVICE_KEY
  - FACT_ROAMING_USAGE -> DIM_ROAMING_PARTNER via PARTNER_KEY
```

---

## Dimension Tables

### DIM_DATE
**Type:** DIMENSION | **Grain:** Day | **Rows:** 2,556 (7 years: 2019-2025)

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| DATE_KEY | INT (PK) | Surrogate key (YYYYMMDD format) | Primary key, indexed |
| CALENDAR_DATE | DATE | Actual calendar date | ISO 8601 format |
| FISCAL_YEAR | INT | Fiscal year (April-March) | Example: 2019, 2020... 2025 |
| FISCAL_QUARTER | INT | Q1-Q4 within fiscal year | 1=Apr-Jun, 2=Jul-Sep, 3=Oct-Dec, 4=Jan-Mar |
| FISCAL_MONTH | INT | Month within fiscal year | 1-12 |
| FISCAL_WEEK | INT | Week within fiscal year | 1-53 |
| CALENDAR_YEAR | INT | Calendar year | 2019-2025 |
| CALENDAR_QUARTER | INT | Q1-Q4 calendar | 1=Jan-Mar, 2=Apr-Jun, 3=Jul-Sep, 4=Oct-Dec |
| CALENDAR_MONTH | INT | Calendar month | 1-12 |
| CALENDAR_WEEK | INT | Week of calendar year | 1-53 |
| DAY_OF_MONTH | INT | Day (1-31) | 1-31 |
| DAY_OF_WEEK | INT | Day of week | 1=Monday, 7=Sunday |
| DAY_OF_WEEK_NAME | VARCHAR | Monday, Tuesday, etc. | Used in reports |
| IS_WEEKEND | BOOLEAN | True if Saturday or Sunday | For peak/off-peak analysis |
| IS_HOLIDAY | BOOLEAN | India national holidays | Deepavali, Holi, Independence Day, etc. |
| HOLIDAY_NAME | VARCHAR | Holiday name if IS_HOLIDAY=true | NULL otherwise |
| IS_FISCAL_YEAR_END | BOOLEAN | True if March 31 | Useful for annual reports |

**Usage:** Join all fact tables via DATE_KEY for temporal analysis. Fiscal year aligns with Indian regulatory year (April 1 - March 31).

---

### DIM_SUBSCRIBER
**Type:** DIMENSION | **Grain:** Subscriber (lifetime) | **Rows:** 80,000

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| SUBSCRIBER_KEY | INT (PK) | Surrogate key, unique per subscriber | Primary key, indexed |
| SUBSCRIBER_ID | VARCHAR (UNQ) | Business key (phone number or account ID) | Unique identifier |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Circle/region assignment |
| DEVICE_KEY | INT (FK) | Link to DIM_DEVICE | Current device model |
| CURRENT_PLAN_KEY | INT (FK) | Link to DIM_PLAN | Active/last plan |
| CUSTOMER_SEGMENT | VARCHAR | Mass Market, Mid Market, Premium, Corporate | Segmentation for analysis |
| ACTIVATION_DATE | DATE | Account creation date | May differ from actual service date |
| CHURN_DATE | DATE | Deactivation date | NULL if active |
| CHURN_REASON | VARCHAR | Reason for churn (if churned) | Examples: port-out, non-payment, voluntary |
| FIRST_CALL_DATE | DATE | First voice call on network | May be after ACTIVATION_DATE |
| LAST_ACTIVITY_DATE | DATE | Most recent call, SMS, or data usage | Updated daily |
| IS_ACTIVE | BOOLEAN | True if subscriber not churned | Snapshot at load time |
| MONTHS_SINCE_ACTIVATION | INT | Age in months | Useful for cohort analysis |
| LIFETIME_VALUE | DECIMAL(12,2) | Total revenue since activation (INR) | Used for VIP segmentation |
| TOTAL_INVOICE_COUNT | INT | Total invoices ever issued | Billing frequency proxy |
| NPS_SCORE | INT | Most recent Net Promoter Score | 0-10 scale; may be NULL |
| NPS_DATE | DATE | Survey date for NPS | NULL if no survey |
| ACCOUNT_STATUS | VARCHAR | ACTIVE, SUSPENDED, DORMANT, CHURNED | Current operational status |
| PAYMENT_PROFILE | VARCHAR | REGULAR, SEASONAL, INTERMITTENT, HIGH_RISK | Payment behavior classification |
| LOAD_DATE | DATE | Data warehouse load date | Audit trail |

**Key Joins:**
- FACT_BILLING.SUBSCRIBER_KEY
- FACT_USAGE.SUBSCRIBER_KEY
- FACT_LIFECYCLE_EVENTS.SUBSCRIBER_KEY
- FACT_ROAMING_USAGE.SUBSCRIBER_KEY

**Business Rules:**
- A subscriber is ACTIVE if CHURN_DATE is NULL and ACCOUNT_STATUS = 'ACTIVE'
- LIFETIME_VALUE = sum of all FACT_BILLING.TOTAL_INVOICE for this subscriber
- CURRENT_PLAN_KEY reflects the plan as of the most recent FACT_BILLING record

---

### DIM_GEOGRAPHY
**Type:** DIMENSION | **Grain:** Circle | **Rows:** 60 circles + 5 regions + 1 national aggregate = 66

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| GEOGRAPHY_KEY | INT (PK) | Surrogate key | Primary key |
| GEOGRAPHY_NAME | VARCHAR | Circle or region name | Examples: Delhi, Mumbai, Karnataka, North Region |
| GEOGRAPHY_TYPE | VARCHAR | CIRCLE, REGION, NATIONAL | Hierarchical level |
| REGION | VARCHAR | Regional grouping | North, South, East, West, Central |
| CIRCLES_IN_REGION | INT | Number of circles in region | For region-level rows, NULL for circle rows |
| POPULATION_ESTIMATE | INT | Estimated telecom serviceable market | Demographic data; may be NULL |
| TELECOM_PENETRATION_PCT | DECIMAL(5,2) | Industry penetration % | Benchmark for market analysis |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Example Hierarchy:**
- GEOGRAPHY_TYPE='NATIONAL': GEOGRAPHY_NAME='All India', REGION=NULL
- GEOGRAPHY_TYPE='REGION': GEOGRAPHY_NAME='North Region', REGION='North'
- GEOGRAPHY_TYPE='CIRCLE': GEOGRAPHY_NAME='Delhi', REGION='North'

**Usage:** Filter dashboards by Region (North/South/East/West/Central) or drill into individual circles.

---

### DIM_PLAN
**Type:** DIMENSION | **Grain:** Plan SKU | **Rows:** 20

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| PLAN_KEY | INT (PK) | Surrogate key | Primary key |
| PLAN_NAME | VARCHAR | Plan name/code | Examples: 'Prepaid 1GB Daily', 'Postpaid Plus' |
| PLAN_CATEGORY | VARCHAR | Prepaid, Postpaid, Corporate | Major segmentation |
| PLAN_TYPE | VARCHAR | Data, Voice, Bundle, etc. | Primary offering type |
| MONTHLY_PRICE_INR | DECIMAL(8,2) | Base plan price | INR currency |
| DATA_LIMIT_GB | DECIMAL(8,2) | Monthly data allowance | NULL for voice-only plans |
| VOICE_LIMIT_MINUTES | INT | Monthly voice minutes | NULL for data-only plans |
| SMS_LIMIT_COUNT | INT | Monthly SMS count | NULL if unlimited |
| ROAMING_INCLUDED | BOOLEAN | Roaming included in plan | True if roaming prepaid |
| VALIDITY_DAYS | INT | Plan validity in days | Examples: 28, 30, 365 |
| OVERAGE_RATE_PER_GB | DECIMAL(6,2) | Price per GB beyond limit (INR) | NULL if no overage |
| OVERAGE_RATE_PER_MIN | DECIMAL(6,2) | Price per minute beyond limit (INR) | NULL if no overage |
| EFFECTIVE_START_DATE | DATE | Date plan became available | For product history |
| EFFECTIVE_END_DATE | DATE | Retirement date | NULL if currently active |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Key Joins:**
- FACT_BILLING.PLAN_KEY
- FACT_USAGE.PLAN_KEY (via FACT_BILLING)
- FACT_LIFECYCLE_EVENTS.PLAN_KEY

**Business Rules:**
- Active plans have EFFECTIVE_END_DATE = NULL
- PLAN_CATEGORY is used for global filter (Prepaid/Postpaid/Corporate)

---

### DIM_DEVICE
**Type:** DIMENSION | **Grain:** Device model | **Rows:** 66

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| DEVICE_KEY | INT (PK) | Surrogate key | Primary key |
| DEVICE_NAME | VARCHAR | Full device name | Examples: 'iPhone 13', 'Samsung Galaxy S21' |
| DEVICE_BRAND | VARCHAR | Brand | iPhone, Samsung, OnePlus, Xiaomi, etc. |
| DEVICE_MODEL | VARCHAR | Model code | A2342, SM-G991B, etc. |
| OPERATING_SYSTEM | VARCHAR | iOS, Android, etc. | OS name |
| OS_VERSION | VARCHAR | Major OS version | Examples: 15.x, 12.x |
| NETWORK_CAPABLE | INT | Max network generation supported | 4 (LTE), 5 (5G), 3 (3G); NULL if unknown |
| DEVICE_PRICE_USD | DECIMAL(8,2) | Approximate MSRP | Device cost tier; may be NULL |
| DEVICE_CATEGORY | VARCHAR | Flagship, Premium, MidRange, Budget | Market positioning |
| LAUNCH_YEAR | INT | Year of launch | Examples: 2020, 2021, 2022 |
| IS_5G_CAPABLE | BOOLEAN | Derived: NETWORK_CAPABLE >= 5 | Convenience column |
| MARKET_SHARE_RANK | INT | Global market share rank | 1 = most popular; NULL if not ranked |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Usage:** 
- Join with DIM_SUBSCRIBER via DEVICE_KEY for device analytics
- 5G adoption tracking via IS_5G_CAPABLE filter
- Device performance analysis (drop rate, throughput by device)

---

### DIM_TOWER
**Type:** DIMENSION | **Grain:** Tower site | **Rows:** 280

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| TOWER_KEY | INT (PK) | Surrogate key | Primary key |
| TOWER_ID | VARCHAR (UNQ) | Business key (tower identifier) | Unique tower ID |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Circle assignment |
| TOWER_LATITUDE | DECIMAL(9,6) | Latitude | GPS coordinates |
| TOWER_LONGITUDE | DECIMAL(9,6) | Longitude | GPS coordinates |
| TOWER_TYPE | VARCHAR | Macro, Micro, Femto, etc. | Cell site classification |
| NETWORK_GENERATIONS | VARCHAR | 3G, 4G, 5G (comma-separated) | Capabilities |
| ACTIVATION_DATE | DATE | Date tower went live | Historical tracking |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Usage:** 
- FACT_USAGE joins via TOWER_KEY for network quality analysis
- Geography roll-up via DIM_GEOGRAPHY for regional performance
- 5G readiness by tower

---

### DIM_ROAMING_PARTNER
**Type:** DIMENSION | **Grain:** Partner | **Rows:** 12

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| PARTNER_KEY | INT (PK) | Surrogate key | Primary key |
| PARTNER_NAME | VARCHAR | Roaming partner name | International carriers |
| PARTNER_COUNTRY | VARCHAR | Country of operation | Examples: USA, UK, UAE, etc. |
| PARTNER_REGION | VARCHAR | Geographic region | Examples: North America, Europe, MENA, APAC |
| PARTNER_TYPE | VARCHAR | MCC, MVNO, Reciprocal, etc. | Partnership structure |
| SETTLEMENT_CURRENCY | VARCHAR | USD, GBP, AED, INR | Billing currency |
| CONTRACT_START_DATE | DATE | Agreement effective date | Historical tracking |
| CONTRACT_END_DATE | DATE | Agreement end date | NULL if ongoing |
| STATUS | VARCHAR | ACTIVE, INACTIVE, SUSPENDED | Partnership status |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Usage:**
- FACT_ROAMING_USAGE joins via PARTNER_KEY for international roaming analysis

---

## Fact Tables

### FACT_BILLING
**Type:** FACT | **Grain:** Invoice per subscriber per month | **Rows:** 943,000

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| BILLING_ID | INT (PK) | Surrogate key | Primary key |
| DATE_KEY | INT (FK) | Link to DIM_DATE | Invoice date |
| SUBSCRIBER_KEY | INT (FK) | Link to DIM_SUBSCRIBER | Customer |
| PLAN_KEY | INT (FK) | Link to DIM_PLAN | Active plan at invoice time |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Service region |
| INVOICE_AMOUNT | DECIMAL(10,2) | Base plan charge (INR) | Monthly plan fee |
| DATA_OVERAGE_CHARGE | DECIMAL(10,2) | Extra data usage fees (INR) | Beyond plan limit |
| VOICE_OVERAGE_CHARGE | DECIMAL(10,2) | Extra voice usage fees (INR) | Beyond plan limit |
| SMS_OVERAGE_CHARGE | DECIMAL(10,2) | Extra SMS fees (INR) | Beyond plan limit |
| ROAMING_CHARGE | DECIMAL(10,2) | International roaming (INR) | A la carte roaming |
| TOTAL_INVOICE | DECIMAL(10,2) | Grand total (INR) | Sum of above |
| PAYMENT_STATUS | VARCHAR | PAID, PENDING, OVERDUE, WAIVED, WRITTEN_OFF | Payment status |
| PAYMENT_DATE | DATE | Date payment received | NULL if not paid |
| DAYS_TO_PAYMENT | INT | Days from invoice to payment | NULL if unpaid; negative if advance |
| DUE_DATE | DATE | Payment due date | Typically 14-21 days from invoice |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Key Aggregations:**
- Revenue = SUM(TOTAL_INVOICE)
- ARPU = SUM(TOTAL_INVOICE) / COUNT(DISTINCT SUBSCRIBER_KEY)
- Payment Rate = COUNT(PAYMENT_STATUS='PAID') / COUNT(*) %
- Overage Revenue = SUM(DATA_OVERAGE_CHARGE + VOICE_OVERAGE_CHARGE + SMS_OVERAGE_CHARGE)

**Business Rules:**
- One invoice per subscriber per month (except for plan changes mid-month)
- Prorations handled in INVOICE_AMOUNT
- TOTAL_INVOICE = INVOICE_AMOUNT + all overages + ROAMING_CHARGE

---

### FACT_USAGE
**Type:** FACT | **Grain:** Daily per subscriber per tower | **Rows:** 895,000

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| USAGE_ID | INT (PK) | Surrogate key | Primary key |
| DATE_KEY | INT (FK) | Link to DIM_DATE | Service date |
| SUBSCRIBER_KEY | INT (FK) | Link to DIM_SUBSCRIBER | Customer |
| TOWER_KEY | INT (FK) | Link to DIM_TOWER | Network cell used |
| PLAN_KEY | INT (FK) | Link to DIM_PLAN | Active plan |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Service circle |
| VOICE_MINUTES | INT | Voice call minutes | Billable minutes |
| SMS_COUNT | INT | SMS messages sent | Count |
| DATA_MB_USED | DECIMAL(10,2) | Mobile data consumed (MB) | Megabytes |
| CALL_DROP_RATE | DECIMAL(5,3) | Percentage of dropped calls | 0.0 - 100.0, e.g., 2.5 = 2.5% |
| AVG_THROUGHPUT_MBPS | DECIMAL(8,2) | Average data download speed (MBPS) | Megabits per second |
| LATENCY_MS | DECIMAL(7,2) | Average latency (milliseconds) | Network delay |
| SESSION_COUNT | INT | Number of data sessions | Connection count |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Key Aggregations:**
- Data Consumption = SUM(DATA_MB_USED) / 1024 (converts to GB)
- Network Quality (Call Drop Rate) = AVG(CALL_DROP_RATE)
- Network Throughput = AVG(AVG_THROUGHPUT_MBPS)
- Voice Minutes = SUM(VOICE_MINUTES)

**Business Rules:**
- One row per subscriber per tower per day (if used on that tower)
- NULL values indicate no usage on that tower that day
- CALL_DROP_RATE is measured by tower; aggregation should average across towers and days
- DATA_MB_USED includes all data services (2G/3G/4G/5G indiscriminately)

---

### FACT_LIFECYCLE_EVENTS
**Type:** FACT | **Grain:** Event per subscriber | **Rows:** 195,000

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| EVENT_ID | INT (PK) | Surrogate key | Primary key |
| DATE_KEY | INT (FK) | Link to DIM_DATE | Event date |
| SUBSCRIBER_KEY | INT (FK) | Link to DIM_SUBSCRIBER | Customer |
| PLAN_KEY | INT (FK) | Link to DIM_PLAN | Plan at event time |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Service circle at event |
| EVENT_TYPE | VARCHAR | ACTIVATION, CHURN, PORT_IN, PORT_OUT, PLAN_UPGRADE, PLAN_DOWNGRADE, REACTIVATION | Lifecycle stage |
| EVENT_DATE | DATE | Date event occurred | Canonical date |
| REASON_CATEGORY | VARCHAR | Voluntary, Non-Payment, Competition, Network, Other | Reason grouping |
| REASON_DETAIL | VARCHAR | Free text reason | Granular reason |
| NPS_PRE_EVENT | INT | NPS before event | 0-10 scale; NULL if not surveyed |
| NPS_POST_EVENT | INT | NPS after event | 0-10 scale; NULL if not surveyed |
| SURVEY_DATE | DATE | Date of NPS survey | May differ from EVENT_DATE |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Key Aggregations:**
- Net Additions = COUNT(ACTIVATION + PORT_IN) - COUNT(CHURN + PORT_OUT) per period
- Churn Rate = COUNT(CHURN) / LAG(Active Subscribers) %
- NPS Trend = AVG(NPS_POST_EVENT) by event type and period
- Reactivation Rate = COUNT(REACTIVATION) / COUNT(CHURN) lagged

**Business Rules:**
- EVENT_TYPE is mutually exclusive per subscriber (one event per date per subscriber)
- CHURN events may trigger churned flag in DIM_SUBSCRIBER
- PORT_IN/PORT_OUT track number portability (MNP) activity
- NPS values are sparse; averaging should exclude NULLs

---

### FACT_ROAMING_USAGE
**Type:** FACT | **Grain:** Monthly roaming usage per subscriber per partner | **Rows:** 150,000

| Column Name | Data Type | Description | Notes |
|-------------|-----------|-------------|-------|
| ROAMING_ID | INT (PK) | Surrogate key | Primary key |
| DATE_KEY | INT (FK) | Link to DIM_DATE | Month of usage |
| SUBSCRIBER_KEY | INT (FK) | Link to DIM_SUBSCRIBER | Customer |
| PARTNER_KEY | INT (FK) | Link to DIM_ROAMING_PARTNER | Roaming carrier |
| GEOGRAPHY_KEY | INT (FK) | Link to DIM_GEOGRAPHY | Home circle |
| VOICE_MINUTES | INT | Voice minutes on roaming | Billable minutes |
| SMS_COUNT | INT | SMS on roaming | Count |
| DATA_MB_USED | DECIMAL(10,2) | Data consumed on roaming (MB) | Megabytes |
| TOTAL_ROAMING_CHARGE | DECIMAL(10,2) | Total roaming bill (INR) | Partner settlement amount |
| PARTNER_SETTLEMENT_AMT | DECIMAL(10,2) | Amount paid to partner (INR) | If tracked separately |
| MARGIN_INR | DECIMAL(10,2) | Falcon Telecom margin (INR) | TOTAL_ROAMING_CHARGE - PARTNER_SETTLEMENT_AMT |
| ROAMING_LOCATION_COUNTRY | VARCHAR | Country of roaming | Examples: USA, UK, UAE |
| ROAMING_LOCATION_REGION | VARCHAR | Region of roaming | Examples: North America, Europe |
| LOAD_DATE | DATE | Audit trail | DW load date |

**Key Aggregations:**
- Roaming Revenue = SUM(TOTAL_ROAMING_CHARGE)
- Roaming Subscribers = COUNT(DISTINCT SUBSCRIBER_KEY) with roaming activity
- Revenue per Partner = SUM(TOTAL_ROAMING_CHARGE) by PARTNER_KEY
- Roaming Margin = SUM(MARGIN_INR)

**Business Rules:**
- One row per subscriber per partner per month (if roaming activity occurred)
- NULL DATA_MB_USED indicates voice-only roaming that month
- PARTNER_SETTLEMENT_AMT may be NULL if margin tracking not granular

---

## Join Key Reference

| Source | Destination | Key | Cardinality |
|--------|-------------|-----|-------------|
| FACT_BILLING | DIM_DATE | DATE_KEY | Many:1 |
| FACT_BILLING | DIM_SUBSCRIBER | SUBSCRIBER_KEY | Many:1 |
| FACT_BILLING | DIM_PLAN | PLAN_KEY | Many:1 |
| FACT_BILLING | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |
| FACT_USAGE | DIM_DATE | DATE_KEY | Many:1 |
| FACT_USAGE | DIM_SUBSCRIBER | SUBSCRIBER_KEY | Many:1 |
| FACT_USAGE | DIM_TOWER | TOWER_KEY | Many:1 |
| FACT_USAGE | DIM_PLAN | PLAN_KEY | Many:1 |
| FACT_USAGE | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |
| FACT_LIFECYCLE_EVENTS | DIM_DATE | DATE_KEY | Many:1 |
| FACT_LIFECYCLE_EVENTS | DIM_SUBSCRIBER | SUBSCRIBER_KEY | Many:1 |
| FACT_LIFECYCLE_EVENTS | DIM_PLAN | PLAN_KEY | Many:1 |
| FACT_LIFECYCLE_EVENTS | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |
| FACT_ROAMING_USAGE | DIM_DATE | DATE_KEY | Many:1 |
| FACT_ROAMING_USAGE | DIM_SUBSCRIBER | SUBSCRIBER_KEY | Many:1 |
| FACT_ROAMING_USAGE | DIM_ROAMING_PARTNER | PARTNER_KEY | Many:1 |
| FACT_ROAMING_USAGE | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |
| DIM_SUBSCRIBER | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |
| DIM_SUBSCRIBER | DIM_DEVICE | DEVICE_KEY | Many:1 |
| DIM_SUBSCRIBER | DIM_PLAN | CURRENT_PLAN_KEY | Many:1 |
| DIM_TOWER | DIM_GEOGRAPHY | GEOGRAPHY_KEY | Many:1 |

---

## Data Quality Notes

**Volume Summary:**
- DIM_DATE: 2,556 rows (7 years daily)
- DIM_SUBSCRIBER: 80,000 rows (active + churned)
- DIM_GEOGRAPHY: 66 rows (60 circles + 5 regions + 1 national)
- DIM_PLAN: 20 rows (current and historical plans)
- DIM_DEVICE: 66 rows (handset models)
- DIM_TOWER: 280 rows (cell sites)
- DIM_ROAMING_PARTNER: 12 rows (roaming carriers)
- FACT_BILLING: 943,000 rows (monthly invoices over 7 years)
- FACT_USAGE: 895,000 rows (daily records)
- FACT_LIFECYCLE_EVENTS: 195,000 rows (life cycle events)
- FACT_ROAMING_USAGE: 150,000 rows (monthly roaming)

**Completeness:**
- DATE_KEY is always populated (no null dates)
- SUBSCRIBER_KEY is always populated (no orphan facts)
- Geographic and Plan keys may have defaults for unknown values
- NPS_SCORE in DIM_SUBSCRIBER and NPS_* in FACT_LIFECYCLE_EVENTS are sparse

**Referential Integrity:**
- All foreign keys enforce relationships to dimension tables
- No orphan fact records (all SUBSCRIBER_KEY, PLAN_KEY, GEOGRAPHY_KEY, TOWER_KEY, PARTNER_KEY resolve)

**Currency:**
- All monetary fields are in INR (Indian Rupees)
- No currency conversion needed

**Temporal:**
- Fiscal year runs April 1 - March 31
- Daily grain in FACT_USAGE enables sub-monthly analysis
- Monthly grain in FACT_BILLING aligns with invoicing cycle

---

## Recommended Indexes

For analytical query performance:

```sql
CREATE INDEX idx_fact_billing_date ON FACT_BILLING(DATE_KEY);
CREATE INDEX idx_fact_billing_subscriber ON FACT_BILLING(SUBSCRIBER_KEY);
CREATE INDEX idx_fact_billing_plan ON FACT_BILLING(PLAN_KEY);
CREATE INDEX idx_fact_billing_geography ON FACT_BILLING(GEOGRAPHY_KEY);

CREATE INDEX idx_fact_usage_date ON FACT_USAGE(DATE_KEY);
CREATE INDEX idx_fact_usage_subscriber ON FACT_USAGE(SUBSCRIBER_KEY);
CREATE INDEX idx_fact_usage_tower ON FACT_USAGE(TOWER_KEY);
CREATE INDEX idx_fact_usage_geography ON FACT_USAGE(GEOGRAPHY_KEY);

CREATE INDEX idx_fact_lifecycle_date ON FACT_LIFECYCLE_EVENTS(DATE_KEY);
CREATE INDEX idx_fact_lifecycle_subscriber ON FACT_LIFECYCLE_EVENTS(SUBSCRIBER_KEY);
CREATE INDEX idx_fact_lifecycle_event_type ON FACT_LIFECYCLE_EVENTS(EVENT_TYPE);

CREATE INDEX idx_fact_roaming_date ON FACT_ROAMING_USAGE(DATE_KEY);
CREATE INDEX idx_fact_roaming_subscriber ON FACT_ROAMING_USAGE(SUBSCRIBER_KEY);
CREATE INDEX idx_fact_roaming_partner ON FACT_ROAMING_USAGE(PARTNER_KEY);

CREATE INDEX idx_dim_subscriber_geography ON DIM_SUBSCRIBER(GEOGRAPHY_KEY);
CREATE INDEX idx_dim_subscriber_device ON DIM_SUBSCRIBER(DEVICE_KEY);
CREATE INDEX idx_dim_subscriber_status ON DIM_SUBSCRIBER(IS_ACTIVE, ACCOUNT_STATUS);

CREATE INDEX idx_dim_tower_geography ON DIM_TOWER(GEOGRAPHY_KEY);
```

---

## Metadata Dictionary

All dimension and fact tables include:
- **LOAD_DATE:** Data warehouse load timestamp for lineage and freshness audits
- **PK (Primary Key):** Surrogate key on *_KEY columns for performance
- **FK (Foreign Key):** References to dimension tables, always resolved

Fact tables are **additive** (summing across any dimension is valid) with the exception of rates (CALL_DROP_RATE, THROUGHPUT) which must be averaged.
