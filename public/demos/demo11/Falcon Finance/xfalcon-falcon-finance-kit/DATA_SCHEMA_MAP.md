# Falcon Finance — Data Schema Map

**Project:** Falcon Finance (Apex Financial Group)
**Schema Type:** Star Schema (PostgreSQL, schema: public)
**Generated:** 2026-03-28

> **IMPORTANT:** All queries must use the `public.` schema prefix (e.g., `public.FACT_TRANSACTIONS`). The default schema prefix `fpublic.` is incorrect and will cause query failures.

---

## Fact Tables

### 1. FACT_TRANSACTIONS (Core — 3.0M rows)
Individual credit card and BNPL transactions posted 2019–2025.

| Standard Column | Actual Column | Type | Notes |
|----------------|---------------|------|-------|
| TRANSACTION_KEY (PK) | TRANSACTION_KEY | INTEGER | Surrogate PK |
| DATE_KEY (FK) | DATE_KEY | INTEGER | → DIM_DATE |
| CUSTOMER_KEY (FK) | CUSTOMER_KEY | INTEGER | → DIM_CUSTOMER |
| PRODUCT_KEY (FK) | PRODUCT_KEY | INTEGER | → DIM_PRODUCT |
| PARTNER_KEY (FK) | PARTNER_KEY | INTEGER | → DIM_RETAIL_PARTNER |
| GEO_KEY (FK) | GEO_KEY | INTEGER | → DIM_GEOGRAPHY |
| CHANNEL_KEY (FK) | CHANNEL_KEY | INTEGER | → DIM_CHANNEL |
| TRANSACTION_TYPE | TRANSACTION_TYPE | VARCHAR | Purchase, Payment, Return, Cash Advance |
| TRANSACTION_AMOUNT | TRANSACTION_AMOUNT | NUMERIC | Positive for purchases/advances, negative for payments/returns |
| MERCHANT_CATEGORY | MERCHANT_CATEGORY | VARCHAR | MCC description |
| IS_INTERNATIONAL | IS_INTERNATIONAL | BOOLEAN | International transaction flag |
| IS_DECLINED | IS_DECLINED | BOOLEAN | Authorization declined flag (~2% rate) |
| REWARD_POINTS_EARNED | REWARD_POINTS_EARNED | INTEGER | Points credited |
| CASHBACK_AMOUNT | CASHBACK_AMOUNT | NUMERIC | Cashback credited |

### 2. FACT_CREDIT_ACCOUNTS (Core — 1.7M rows)
Monthly account-level snapshots at month-end, 2019–2025.

| Standard Column | Actual Column | Type | Notes |
|----------------|---------------|------|-------|
| ACCOUNT_SNAPSHOT_KEY (PK) | ACCOUNT_SNAPSHOT_KEY | INTEGER | Surrogate PK |
| DATE_KEY (FK) | DATE_KEY | INTEGER | → DIM_DATE (month-end dates only) |
| CUSTOMER_KEY (FK) | CUSTOMER_KEY | INTEGER | → DIM_CUSTOMER |
| PRODUCT_KEY (FK) | PRODUCT_KEY | INTEGER | → DIM_PRODUCT |
| PARTNER_KEY (FK) | PARTNER_KEY | INTEGER | → DIM_RETAIL_PARTNER |
| GEO_KEY (FK) | GEO_KEY | INTEGER | → DIM_GEOGRAPHY |
| CREDIT_TIER_KEY (FK) | CREDIT_TIER_KEY | INTEGER | → DIM_CREDIT_TIER |
| DELINQUENCY_BUCKET_KEY (FK) | DELINQUENCY_BUCKET_KEY | INTEGER | → DIM_DELINQUENCY_BUCKET |
| CREDIT_LIMIT | CREDIT_LIMIT | NUMERIC | Approved limit |
| CURRENT_BALANCE | CURRENT_BALANCE | NUMERIC | Outstanding balance |
| UTILIZATION_RATE | UTILIZATION_RATE | NUMERIC | Balance / Limit (0–1) |
| MINIMUM_PAYMENT_DUE | MINIMUM_PAYMENT_DUE | NUMERIC | Minimum due |
| PAYMENTS_MADE | PAYMENTS_MADE | NUMERIC | Payments received in period |
| INTEREST_CHARGED | INTEREST_CHARGED | NUMERIC | Interest for period |
| FEES_CHARGED | FEES_CHARGED | NUMERIC | Fees for period |
| REWARD_POINTS_EARNED | REWARD_POINTS_EARNED | INTEGER | Points for period |
| MONTHS_ON_BOOK | MONTHS_ON_BOOK | SMALLINT | Account age |
| ACCOUNT_STATUS | ACCOUNT_STATUS | VARCHAR | Active, Delinquent, Charged Off |
| IS_NEW_ACCOUNT | IS_NEW_ACCOUNT | BOOLEAN | First month flag |
| IS_CHURNED | IS_CHURNED | BOOLEAN | Closed/inactive flag |

### 3. FACT_BNPL_ORDERS (600K rows)
Individual BNPL orders originated 2019–2025.

| Standard Column | Actual Column | Type | Notes |
|----------------|---------------|------|-------|
| BNPL_ORDER_KEY (PK) | BNPL_ORDER_KEY | INTEGER | Surrogate PK |
| DATE_KEY (FK) | DATE_KEY | INTEGER | → DIM_DATE |
| CUSTOMER_KEY (FK) | CUSTOMER_KEY | INTEGER | → DIM_CUSTOMER |
| PARTNER_KEY (FK) | PARTNER_KEY | INTEGER | → DIM_RETAIL_PARTNER |
| GEO_KEY (FK) | GEO_KEY | INTEGER | → DIM_GEOGRAPHY |
| CHANNEL_KEY (FK) | CHANNEL_KEY | INTEGER | → DIM_CHANNEL |
| ORDER_AMOUNT | ORDER_AMOUNT | NUMERIC | Total financed amount |
| INSTALLMENT_COUNT | INSTALLMENT_COUNT | SMALLINT | Number of payments (4, 6, 12) |
| INSTALLMENT_AMOUNT | INSTALLMENT_AMOUNT | NUMERIC | Per-installment payment |
| MERCHANT_FEE_RATE | MERCHANT_FEE_RATE | NUMERIC | % fee charged to merchant (~2.5%) |
| MERCHANT_FEE_AMOUNT | MERCHANT_FEE_AMOUNT | NUMERIC | $ fee amount |
| PRODUCT_CATEGORY | PRODUCT_CATEGORY | VARCHAR | Retail merchandise category |
| IS_PAID_IN_FULL | IS_PAID_IN_FULL | BOOLEAN | All installments completed |
| IS_DELINQUENT | IS_DELINQUENT | BOOLEAN | Entered delinquency |
| APR_CHARGED | APR_CHARGED | NUMERIC | APR if converted to interest-bearing |

### 4. FACT_DELINQUENCY (521K rows)
Delinquency events and recovery actions, 2019–2025.

| Standard Column | Actual Column | Type | Notes |
|----------------|---------------|------|-------|
| DELINQUENCY_KEY (PK) | DELINQUENCY_KEY | INTEGER | Surrogate PK |
| DATE_KEY (FK) | DATE_KEY | INTEGER | → DIM_DATE |
| CUSTOMER_KEY (FK) | CUSTOMER_KEY | INTEGER | → DIM_CUSTOMER |
| PRODUCT_KEY (FK) | PRODUCT_KEY | INTEGER | → DIM_PRODUCT |
| PARTNER_KEY (FK) | PARTNER_KEY | INTEGER | → DIM_RETAIL_PARTNER |
| CREDIT_TIER_KEY (FK) | CREDIT_TIER_KEY | INTEGER | → DIM_CREDIT_TIER |
| DELINQUENCY_BUCKET_KEY (FK) | DELINQUENCY_BUCKET_KEY | INTEGER | → DIM_DELINQUENCY_BUCKET |
| COLLECTION_STATUS_KEY (FK) | COLLECTION_STATUS_KEY | INTEGER | → DIM_COLLECTION_STATUS |
| BALANCE_AT_DELINQUENCY | BALANCE_AT_DELINQUENCY | NUMERIC | Balance when went delinquent |
| DAYS_PAST_DUE | DAYS_PAST_DUE | SMALLINT | Exact DPD count |
| MINIMUM_PAYMENT_MISSED | MINIMUM_PAYMENT_MISSED | NUMERIC | Missed payment amount |
| COLLECTION_CALLS_MADE | COLLECTION_CALLS_MADE | SMALLINT | Outbound contact attempts |
| PROMISE_TO_PAY_AMOUNT | PROMISE_TO_PAY_AMOUNT | NUMERIC | Customer commitment |
| RECOVERY_AMOUNT | RECOVERY_AMOUNT | NUMERIC | Actually recovered |
| IS_CHARGE_OFF | IS_CHARGE_OFF | BOOLEAN | Charge-off flag |
| CHARGE_OFF_AMOUNT | CHARGE_OFF_AMOUNT | NUMERIC | Amount written off |

### 5. FACT_PARTNER_PERFORMANCE (1,680 rows)
Monthly partner × product × geography summary, 2019–2025.

| Standard Column | Actual Column | Type | Notes |
|----------------|---------------|------|-------|
| PARTNER_PERF_KEY (PK) | PARTNER_PERF_KEY | INTEGER | Surrogate PK |
| DATE_KEY (FK) | DATE_KEY | INTEGER | → DIM_DATE |
| PARTNER_KEY (FK) | PARTNER_KEY | INTEGER | → DIM_RETAIL_PARTNER |
| PRODUCT_KEY (FK) | PRODUCT_KEY | INTEGER | → DIM_PRODUCT |
| GEO_KEY (FK) | GEO_KEY | INTEGER | → DIM_GEOGRAPHY |
| NEW_ACCOUNTS_OPENED | NEW_ACCOUNTS_OPENED | INTEGER | New originations |
| CREDIT_APPLICATIONS | CREDIT_APPLICATIONS | INTEGER | Total applications |
| APPROVAL_RATE | APPROVAL_RATE | NUMERIC | Approval % |
| TOTAL_CREDIT_SALES | TOTAL_CREDIT_SALES | NUMERIC | All credit sales $ |
| BNPL_SALES | BNPL_SALES | NUMERIC | BNPL portion |
| REVOLVING_SALES | REVOLVING_SALES | NUMERIC | Revolving credit portion |
| AVG_TRANSACTION_VALUE | AVG_TRANSACTION_VALUE | NUMERIC | Avg $ per transaction |
| ACTIVE_CARDHOLDER_COUNT | ACTIVE_CARDHOLDER_COUNT | INTEGER | Active accounts |
| AVG_UTILIZATION_RATE | AVG_UTILIZATION_RATE | NUMERIC | Avg utilization |
| PARTNER_REVENUE_SHARE | PARTNER_REVENUE_SHARE | NUMERIC | Revenue to partner |
| INTERCHANGE_REVENUE | INTERCHANGE_REVENUE | NUMERIC | Interchange earned |
| NET_INTEREST_INCOME | NET_INTEREST_INCOME | NUMERIC | Net interest income |

---

## Dimension Tables

### DIM_DATE (2,922 rows)
Standard calendar dimension 2019–2026.

| Column | Type | Notes |
|--------|------|-------|
| DATE_KEY (PK) | INTEGER | Surrogate key |
| FULL_DATE | DATE | ISO date |
| CALENDAR_YEAR | SMALLINT | 2019–2026 |
| CALENDAR_MONTH | SMALLINT | 1–12 |
| CALENDAR_QUARTER | SMALLINT | 1–4 |
| DAY_OF_MONTH | SMALLINT | 1–31 |
| DAY_NAME | VARCHAR | Monday–Sunday |
| MONTH_NAME | VARCHAR | January–December |
| FISCAL_YEAR | CHAR | e.g., FY2024 |
| FISCAL_QUARTER | SMALLINT | 1–4 |
| FISCAL_PERIOD | VARCHAR | e.g., FY2024-Q1 |
| IS_WEEKEND | BOOLEAN | Saturday/Sunday |
| IS_HOLIDAY | BOOLEAN | US federal holidays |
| IS_MONTH_END | BOOLEAN | Last day of month |
| SEASON | VARCHAR | Spring/Summer/Fall/Winter |

**Fiscal Calendar:** April–March fiscal year (per user specification). FISCAL_YEAR column in DIM_DATE aligns with calendar year by default — adjust with: `CASE WHEN CALENDAR_MONTH >= 4 THEN CALENDAR_YEAR ELSE CALENDAR_YEAR - 1 END AS ADJUSTED_FISCAL_YEAR`

### DIM_CUSTOMER (150,000 rows)

| Column | Type | Notes |
|--------|------|-------|
| CUSTOMER_KEY (PK) | INTEGER | Surrogate key |
| CUSTOMER_ID | VARCHAR | Business ID |
| FIRST_NAME, LAST_NAME | VARCHAR | Demo personalization |
| EMAIL | VARCHAR | Contact identifier |
| STATE, CITY, ZIP_CODE | VARCHAR | Residence location |
| AGE_BAND | VARCHAR | Age group |
| INCOME_BAND | VARCHAR | Household income range |
| GENDER | VARCHAR | Self-reported |
| ACQUISITION_CHANNEL | VARCHAR | How acquired |
| ACQUISITION_DATE | DATE | First account date |
| ACQUISITION_YEAR | SMALLINT | Year of acquisition |
| LOYALTY_SEGMENT | VARCHAR | Behavioral tier |
| FICO_SCORE_BAND | VARCHAR | Credit score range |
| IS_ACTIVE | BOOLEAN | Has active account |

### DIM_PRODUCT (10 rows)

| Column | Type | Notes |
|--------|------|-------|
| PRODUCT_KEY (PK) | INTEGER | 1–10 |
| PRODUCT_ID | VARCHAR | PROD0001–PROD0010 |
| PRODUCT_NAME | VARCHAR | e.g., "Apex Cashback Signature" |
| PRODUCT_TYPE | VARCHAR | Private Label, Co-Brand, Proprietary, BNPL |
| PRODUCT_SUBTYPE | VARCHAR | Standard, Premium, Elite, Pay-in-4, Monthly |
| CREDIT_LIMIT_TIER | VARCHAR | Range (e.g., "500-2500") |
| ANNUAL_FEE | NUMERIC | $0–$195 |
| BASE_APR | NUMERIC | 0%–24.99% |
| REWARDS_TYPE | VARCHAR | None, Points, Cashback, etc. |
| IS_COBRANDED | BOOLEAN | Co-brand flag |
| LAUNCH_YEAR | SMALLINT | Product launch year |
| IS_ACTIVE | BOOLEAN | Currently offered |

### DIM_RETAIL_PARTNER (20 rows)

| Column | Type | Notes |
|--------|------|-------|
| PARTNER_KEY (PK) | INTEGER | 1–20 |
| PARTNER_ID | VARCHAR | PART0001–PART0020 |
| PARTNER_NAME | VARCHAR | e.g., "Harrington & Co." |
| PARTNER_CATEGORY | VARCHAR | Specialty Apparel, Home Furnishings, Luxury, Jewelry, Pet Supplies, Sporting Goods, Health and Beauty, Wholesale, Travel |
| PARTNER_TIER | VARCHAR | Tier 1, Tier 2 |
| HQ_STATE | CHAR | US state code |
| STORE_COUNT | INTEGER | Physical locations |
| ONLINE_ENABLED | BOOLEAN | Has online capability |
| PARTNERSHIP_START_YEAR | SMALLINT | Year partnership began |
| IS_ACTIVE | BOOLEAN | Currently active |

### DIM_GEOGRAPHY (31 rows)

| Column | Type | Notes |
|--------|------|-------|
| GEO_KEY (PK) | INTEGER | 1–31 |
| STATE_CODE | CHAR | 2-letter state code |
| STATE_NAME | VARCHAR | Full state name |
| CENSUS_REGION | VARCHAR | Northeast, Midwest, South, West, Pacific |
| CENSUS_DIVISION | VARCHAR | Sub-region |
| URBAN_RURAL | VARCHAR | Urban, Mixed, Rural |
| MEDIAN_HOUSEHOLD_INCOME | INTEGER | State median |
| POPULATION_BAND | VARCHAR | Small, Medium, Large, Very Large |

### DIM_CHANNEL (6 rows)

| Column | Type | Notes |
|--------|------|-------|
| CHANNEL_KEY (PK) | INTEGER | 1–6 |
| CHANNEL_NAME | VARCHAR | In-Store Kiosk, Partner Website, Apex Direct App, Phone/Call Center, Mail Offer, Partner App |
| CHANNEL_TYPE | VARCHAR | Physical, Digital, Assisted, Direct Mail |
| IS_DIGITAL | BOOLEAN | Digital channel flag |
| IS_IN_STORE | BOOLEAN | Physical store flag |
| DESCRIPTION | VARCHAR | Free text |

### DIM_CREDIT_TIER (5 rows)

| Column | Type | Notes |
|--------|------|-------|
| CREDIT_TIER_KEY (PK) | INTEGER | 1–5 |
| TIER_NAME | VARCHAR | Super Prime, Prime, Near Prime, Subprime, Deep Subprime |
| FICO_MIN / FICO_MAX | SMALLINT | Score range |
| RISK_CATEGORY | VARCHAR | Low Risk → Very High Risk |
| TYPICAL_APR_RANGE | VARCHAR | APR band |
| TYPICAL_CREDIT_LIMIT_RANGE | VARCHAR | Limit band |
| CHARGE_OFF_RATE_EXPECTATION | NUMERIC | Expected annual charge-off % |

### DIM_DELINQUENCY_BUCKET (7 rows)

| Column | Type | Notes |
|--------|------|-------|
| BUCKET_KEY (PK) | INTEGER | 1–7 |
| BUCKET_NAME | VARCHAR | Current, 1-29 DPD, 30-59 DPD, 60-89 DPD, 90-119 DPD, 120-179 DPD, 180+ DPD |
| DAYS_PAST_DUE_MIN / MAX | SMALLINT | DPD range |
| BUCKET_CATEGORY | VARCHAR | Current → Charge-Off/Collections |
| RESERVE_RATE | NUMERIC | Loan loss reserve % |
| REGULATORY_CLASSIFICATION | VARCHAR | Pass → Loss |

### DIM_COLLECTION_STATUS (7 rows)

| Column | Type | Notes |
|--------|------|-------|
| COLLECTION_STATUS_KEY (PK) | INTEGER | 1–7 |
| STATUS_NAME | VARCHAR | Active Collection, Payment Arrangement, Legal Action, Settlement Offer, Charged Off Internal, Charged Off Sold, Recovered |
| STATUS_CATEGORY | VARCHAR | Early Stage, Arrangement, Late Stage, Charge-Off, Closed |
| DAYS_IN_STATUS_TYPICAL | SMALLINT | Typical duration |
| RECOVERY_RATE_EXPECTED | NUMERIC | Expected recovery % |
| IS_CHARGED_OFF | BOOLEAN | Charge-off status flag |

---

## Join Map

All fact tables join to dimensions via integer surrogate keys:

```
FACT_TRANSACTIONS ──→ DIM_DATE (DATE_KEY)
                  ──→ DIM_CUSTOMER (CUSTOMER_KEY)
                  ──→ DIM_PRODUCT (PRODUCT_KEY)
                  ──→ DIM_RETAIL_PARTNER (PARTNER_KEY)
                  ──→ DIM_GEOGRAPHY (GEO_KEY)
                  ──→ DIM_CHANNEL (CHANNEL_KEY)

FACT_CREDIT_ACCOUNTS ──→ DIM_DATE (DATE_KEY)
                     ──→ DIM_CUSTOMER (CUSTOMER_KEY)
                     ──→ DIM_PRODUCT (PRODUCT_KEY)
                     ──→ DIM_RETAIL_PARTNER (PARTNER_KEY)
                     ──→ DIM_GEOGRAPHY (GEO_KEY)
                     ──→ DIM_CREDIT_TIER (CREDIT_TIER_KEY)
                     ──→ DIM_DELINQUENCY_BUCKET (DELINQUENCY_BUCKET_KEY → BUCKET_KEY)

FACT_BNPL_ORDERS ──→ DIM_DATE (DATE_KEY)
                 ──→ DIM_CUSTOMER (CUSTOMER_KEY)
                 ──→ DIM_RETAIL_PARTNER (PARTNER_KEY)
                 ──→ DIM_GEOGRAPHY (GEO_KEY)
                 ──→ DIM_CHANNEL (CHANNEL_KEY)

FACT_DELINQUENCY ──→ DIM_DATE (DATE_KEY)
                 ──→ DIM_CUSTOMER (CUSTOMER_KEY)
                 ──→ DIM_PRODUCT (PRODUCT_KEY)
                 ──→ DIM_RETAIL_PARTNER (PARTNER_KEY)
                 ──→ DIM_CREDIT_TIER (CREDIT_TIER_KEY)
                 ──→ DIM_DELINQUENCY_BUCKET (DELINQUENCY_BUCKET_KEY → BUCKET_KEY)
                 ──→ DIM_COLLECTION_STATUS (COLLECTION_STATUS_KEY)

FACT_PARTNER_PERFORMANCE ──→ DIM_DATE (DATE_KEY)
                         ──→ DIM_RETAIL_PARTNER (PARTNER_KEY)
                         ──→ DIM_PRODUCT (PRODUCT_KEY)
                         ──→ DIM_GEOGRAPHY (GEO_KEY)
```

## Schema Notes

1. **Schema prefix required:** All tables are in the `public` schema. Queries MUST use `public.TABLE_NAME` to avoid the IDA server's incorrect `fpublic.` default prefix.
2. **DIM_DELINQUENCY_BUCKET join:** The FK column in facts is `DELINQUENCY_BUCKET_KEY` but the PK in the dimension is `BUCKET_KEY`. Join as: `ON fact.DELINQUENCY_BUCKET_KEY = dim.BUCKET_KEY`.
3. **Fiscal calendar adjustment:** The DIM_DATE FISCAL_YEAR column aligns with calendar year. For April–March fiscal year, derive: `CASE WHEN CALENDAR_MONTH >= 4 THEN CALENDAR_YEAR ELSE CALENDAR_YEAR - 1 END`.
4. **Transaction amounts:** Purchases and Cash Advances are positive; Payments and Returns are negative. Use `WHERE TRANSACTION_TYPE = 'Purchase'` for spend analysis, or sum all types for net balance impact.
5. **BNPL products:** PRODUCT_KEY 9 (Pay-in-4) and 10 (Monthly Installment) are BNPL products. FACT_BNPL_ORDERS does NOT have a PRODUCT_KEY column — it has PRODUCT_CATEGORY (merchandise category) instead.
6. **Geography:** Only 31 of 50 US states are represented.
