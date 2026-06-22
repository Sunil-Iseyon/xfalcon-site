# Data Schema Map — Falcon Telecom & Media

**Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__ida_*`
**Schema prefix**: None required — call tables by bare name (e.g., `FACT_BILLING`).

## Star Schema Topology

```
                ┌─────────────────┐
                │    DIM_DATE     │ ◄────────── (every fact)
                │   4,017 rows    │
                └─────────────────┘

  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
  │   DIM_CARRIER    │◄───│ FACT_BILLING     │───►│   DIM_PLAN       │
  │     8 carriers   │    │   1.0M rows      │    │   28 plans       │
  └──────────────────┘    └──────────────────┘    └──────────────────┘
            │                       │                       │
            │                       ▼                       │
            │             ┌──────────────────┐              │
            │             │ DIM_SUBSCRIBER   │              │
            │             │  100K accounts   │◄─────────────┘
            │             │   (cross-domain) │
            │             └──────────────────┘
            │                       │
            │              ┌────────┴────────┬─────────────┐
            │              ▼                 ▼             ▼
            │   ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
            └──►│ FACT_SUBSCRIBER_ │ │  FACT_       │ │  FACT_       │
                │     EVENTS       │ │ VIEWERSHIP   │ │ TICKET_SALES │
                │   1.4M rows      │ │  1.3M rows   │ │  350K rows   │
                └──────────────────┘ └──────────────┘ └──────────────┘
                                          │                 │
                                          ▼                 ▼
                                ┌─────────────────┐ ┌──────────────┐
                                │  DIM_CONTENT    │ │  DIM_EVENT   │
                                │  2,500 titles   │ │ 1,200 events │
                                └─────────────────┘ └──────────────┘
                                          │
                                          ▼
                                ┌─────────────────┐
                                │ DIM_MEDIA_      │
                                │   PLATFORM      │
                                │  12 platforms   │
                                └─────────────────┘

           ┌─────────────────┐    ┌─────────────────┐
           │ FACT_AD_REVENUE │───►│ DIM_ADVERTISER  │
           │   600K rows     │    │  35 brands      │
           └─────────────────┘    └─────────────────┘
                    │
                    ▼
           ┌─────────────────┐    ┌──────────────────┐
           │ DIM_AD_FORMAT   │    │ DIM_MEDIA_       │
           │  12 formats     │    │   COMPANY        │
           └─────────────────┘    │  21 entities     │
                                  └──────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │ FACT_CONTENT_    │
                                │    RIGHTS        │
                                │   75K deals      │
                                └──────────────────┘

  All GEO_KEY columns join to DIM_GEOGRAPHY (30 DMAs, 4 regions).
```

## Fact Tables

### FACT_AD_REVENUE — 600K rows
**Grain**: One row per advertising placement (campaign day × format × publisher).
| Column | Type | Notes |
|---|---|---|
| AD_ID | BIGINT | PK |
| DATE_KEY | INT | → DIM_DATE.DATE_KEY (YYYYMMDD) |
| ADVERTISER_KEY | INT | → DIM_ADVERTISER |
| FORMAT_KEY | INT | → DIM_AD_FORMAT |
| COMPANY_KEY | INT | → DIM_MEDIA_COMPANY (publisher) |
| PLATFORM_KEY | INT | → DIM_MEDIA_PLATFORM |
| GEO_KEY | INT | → DIM_GEOGRAPHY |
| CAMPAIGN_NAME | VARCHAR | Theme + quarter descriptor |
| IMPRESSIONS | INT | Lifetime: 600B+ |
| CLICKS | INT | Beta-distributed CTR |
| CPM | NUMERIC | Cost per 1000 impressions |
| GROSS_REVENUE | NUMERIC | = (impressions/1000) × CPM |
| NET_REVENUE | NUMERIC | gross × 0.85 (15% agency fee) |
| AGENCY_FEE | NUMERIC | gross × 0.15 |
| COMPLETION_RATE | NUMERIC | % viewers to end (~70% avg) |
| VIEWABILITY_RATE | NUMERIC | MRC viewability (~75% avg) |

### FACT_BILLING — 1.0M rows
**Grain**: One row per subscriber × monthly billing cycle.
| Column | Type | Notes |
|---|---|---|
| BILL_ID | BIGINT | PK |
| DATE_KEY | INT | Billing cycle date |
| SUBSCRIBER_KEY | INT | Cross-domain join key |
| CARRIER_KEY, PLAN_KEY, GEO_KEY | INT | FKs |
| BASE_CHARGE | NUMERIC | Plan base ±5% |
| DATA_OVERAGE | NUMERIC | Above-cap charges |
| ROAMING_CHARGE | NUMERIC | Domestic + international |
| EQUIPMENT_CHARGE | NUMERIC | Device installment |
| TAXES_FEES | NUMERIC | ~10% of base |
| TOTAL_BILL | NUMERIC | Sum of components |
| PAYMENT_STATUS | VARCHAR | Paid 88% / Paid Late 6% / Disputed 2% / Defaulted |
| DAYS_TO_PAY | SMALLINT | 0 if autopay |
| IS_AUTOPAY | BOOLEAN | ~65% TRUE |

### FACT_CONTENT_RIGHTS — 75K rows
**Grain**: One row per content licensing agreement.
| Column | Type | Notes |
|---|---|---|
| RIGHTS_ID | BIGINT | PK |
| DATE_KEY, CONTENT_KEY, PLATFORM_KEY, COMPANY_KEY | INT | FKs |
| TERRITORY | VARCHAR | 9 territory types (NOT joined to DIM_GEOGRAPHY) |
| RIGHTS_TYPE | VARCHAR | Streaming Exclusive, Streaming Non-Exclusive, Broadcast, Cable, Theatrical, SVOD/AVOD/TVOD Window, Home Video, International (10 types) |
| LICENSE_FEE_M | NUMERIC | Millions USD; exponential dist; mean $5.5M |
| TERM_YEARS | SMALLINT | 1–5 |
| EXCLUSIVITY | VARCHAR | Exclusive / First Window / Second Window / Non-Exclusive |
| REVENUE_SHARE_PCT | NUMERIC | Avg 15% |
| MINIMUM_GUARANTEE_M | NUMERIC | Typically 40% of license fee |

### FACT_SUBSCRIBER_EVENTS — 1.4M rows
**Grain**: One row per subscriber lifecycle event.
| Column | Type | Notes |
|---|---|---|
| EVENT_ID | BIGINT | PK |
| DATE_KEY, SUBSCRIBER_KEY, CARRIER_KEY, PLAN_KEY, GEO_KEY | INT | FKs |
| EVENT_TYPE | VARCHAR | New Activation 30%, Plan Upgrade, Plan Change, Plan Downgrade, Churn, Port-In, Port-Out, Reactivation (8 types) |
| PREV_PLAN_KEY | INT | Plan before event |
| MRR | NUMERIC | Monthly Recurring Revenue |
| DISCOUNT_PCT | NUMERIC | Promo at event time |
| CHURN_REASON | VARCHAR | Price, Competitor Offer, Financial, Device Issue, Moving, Coverage, Service Quality, Other (NULL for non-churn events) |
| IS_CHURN | BOOLEAN | TRUE for Churn + Port-Out |
| IS_NEW_ACQ | BOOLEAN | TRUE for New Activation + Port-In + Reactivation |
| IS_UPGRADE | BOOLEAN | TRUE for Plan Upgrade only |
| LIFETIME_VALUE_EST | NUMERIC | LTV at event time |

### FACT_TICKET_SALES — 350K rows
**Grain**: One row per ticket purchase transaction.
| Column | Type | Notes |
|---|---|---|
| SALE_ID | BIGINT | PK |
| DATE_KEY, EVENT_KEY, TIER_KEY, GEO_KEY, SUBSCRIBER_KEY | INT | FKs |
| QUANTITY | SMALLINT | 1–4 tickets per txn |
| FACE_VALUE | NUMERIC | Per-ticket base price |
| SERVICE_FEE | NUMERIC | face × 0.15 |
| DYNAMIC_MARKUP | NUMERIC | Premium per ticket (avg 5%) |
| TOTAL_REVENUE | NUMERIC | qty × (face + service + markup) |
| CHANNEL | VARCHAR | Online Primary 42%, Mobile App 28%, Box Office, Resale, Group Sales |
| IS_RESALE | BOOLEAN | TRUE for Resale/Secondary |
| IS_GROUP_SALE | BOOLEAN | TRUE for corporate bulk |

### FACT_VIEWERSHIP — 1.3M rows
**Grain**: One row per streaming session.
| Column | Type | Notes |
|---|---|---|
| VIEW_ID | BIGINT | PK |
| DATE_KEY, CONTENT_KEY, PLATFORM_KEY, GEO_KEY, SUBSCRIBER_KEY | INT | FKs |
| DEVICE_TYPE | VARCHAR | Smart TV 38%, Mobile 28%, Tablet, Desktop, Console, Streaming Stick |
| VIEW_MINUTES | NUMERIC | Exponential dist |
| COMPLETED | BOOLEAN | ≥80% completion |
| COMPLETION_PCT | NUMERIC | 0–100 |
| STREAM_QUALITY | TEXT | 4K HDR / 4K / HD / SD / Mobile |
| REBUFFER_EVENTS | SMALLINT | Avg 1.5 |
| RATING | NUMERIC | 1–10; sparse (NULL for most rows) |
| IS_BINGE | BOOLEAN | TRUE if VIEW_MINUTES > 120 |
| REVENUE_TYPE | VARCHAR | SVOD 50%, AVOD 25%, TVOD, Hybrid |

## Dimension Tables (summary)

| Table | Rows | Key columns |
|---|---|---|
| DIM_ADVERTISER | 35 | ADVERTISER_KEY, NAME, INDUSTRY, ANNUAL_SPEND_TIER (Platinum/Gold/Silver/Bronze) |
| DIM_AD_FORMAT | 12 | FORMAT_KEY, NAME, CHANNEL, PLACEMENT, AVG_CPM, AVG_DURATION_S |
| DIM_CARRIER | 8 | CARRIER_KEY, NAME, TYPE (Wireless/Cable MSO/Enterprise Fiber/Satellite), HQ_STATE, IS_PROSPECT |
| DIM_CONTENT | 2,500 | CONTENT_KEY, TITLE, CONTENT_TYPE, GENRE, PLATFORM_KEY, IS_ORIGINAL, IS_LICENSED, CONTENT_RATING |
| DIM_DATE | 4,017 | DATE_KEY (YYYYMMDD), YEAR/QUARTER/MONTH/WEEK/DAY, IS_WEEKEND, IS_HOLIDAY |
| DIM_EVENT | 1,200 | EVENT_KEY, NAME, EVENT_TYPE (12 types), VENUE, IS_PPV, RIGHTS_FEE_M |
| DIM_GEOGRAPHY | 30 | GEO_KEY, REGION (4), STATE_CODE, DMA_NAME, TIER (Tier1/2/3), POPULATION_M, LAT/LON |
| DIM_MEDIA_COMPANY | 21 | COMPANY_KEY, NAME (Fox/Disney/WBD/Paramount/etc.), TYPE, PRIMARY_GENRE, IS_PROSPECT |
| DIM_MEDIA_PLATFORM | 12 | PLATFORM_KEY, NAME (Disney+, Hulu, Max, Netflix, etc.), PARENT_COMPANY, PLATFORM_TYPE (SVOD/AVOD/FAST/Hybrid), LAUNCH_YEAR, IS_PROSPECT |
| DIM_PLAN | 28 | PLAN_KEY, NAME, TYPE (Postpaid/Prepaid/Enterprise/Broadband/Bundle/Cable TV/Fixed Wireless), TECHNOLOGY (5G/4G LTE/Fiber/Cable), MONTHLY_ARPU, IS_5G, IS_UNLIMITED |
| DIM_SUBSCRIBER | 100,000 | SUBSCRIBER_KEY, ID, CARRIER_KEY, PLAN_KEY, SEGMENT (Consumer 40% / Family 28% / Business Small / Business Mid / Prepaid), TENURE_MONTHS, AGE_BAND, CREDIT_SCORE_BAND, IS_ACTIVE (88%) |
| DIM_TICKET_TIER | 8 | TIER_KEY, NAME (GA, Standard, Premium, Floor/Ringside, VIP Suite, Meet & Greet, Pay-Per-View, Early Entry), BASE_PRICE, IS_VIP |

## Common Column Name Mistakes

Always verify with `ida_get_knowledge(knowledge_type='schema', table_name='X')` before writing queries. The most error-prone names in this schema:

| What you might assume | Actual column |
|---|---|
| `DATE` (in fact tables) | `DATE_KEY` (INT, YYYYMMDD format — NOT a DATE type) |
| `SUBSCRIBER_ID` (FK in facts) | `SUBSCRIBER_KEY` (the FK; SUBSCRIBER_ID lives only on DIM_SUBSCRIBER as a business string) |
| `EVENT_TYPE` (subscriber) | This is a column on FACT_SUBSCRIBER_EVENTS — NOT to be confused with `DIM_EVENT.EVENT_TYPE` (live events). Two different things. |
| `EVENT_KEY` (live events) | Lives on FACT_TICKET_SALES, NOT on FACT_SUBSCRIBER_EVENTS |
| `TOTAL_REVENUE` (ad) | Use `GROSS_REVENUE` or `NET_REVENUE` — there is no TOTAL on FACT_AD_REVENUE |
| `PRICE`, `AMOUNT` (ticket) | Use `FACE_VALUE`, `TOTAL_REVENUE` (computed); SERVICE_FEE and DYNAMIC_MARKUP are also separate columns |
| `AVG_CPM` (fact) | Lives on DIM_AD_FORMAT (reference); actual is on FACT_AD_REVENUE.CPM |
| `EXCLUSIVITY_TYPE` | Just `EXCLUSIVITY` on FACT_CONTENT_RIGHTS |
| `STATE` | `STATE_CODE` (CHAR(2)) and `STATE_NAME` on DIM_GEOGRAPHY |
| `DMA` | `DMA_NAME` (full string) and `DMA_CODE` (3-digit string) on DIM_GEOGRAPHY |
| `IS_BINGE_WATCHER` | Just `IS_BINGE` on FACT_VIEWERSHIP |
| `LIFETIME_VALUE` | `LIFETIME_VALUE_EST` on FACT_SUBSCRIBER_EVENTS |
| `IS_PORT_IN` / `IS_PORT_OUT` | No flags — filter `EVENT_TYPE = 'Port-In'` or use `IS_NEW_ACQ` (covers Port-In + Activation + Reactivation) and `IS_CHURN` (covers Churn + Port-Out) |
| `RATING` (viewership) | EXISTS but is **mostly NULL** — use sparingly, with `WHERE RATING IS NOT NULL` |

## Notes on Joins

1. **Cross-domain via SUBSCRIBER_KEY**: FACT_BILLING ↔ FACT_VIEWERSHIP ↔ FACT_TICKET_SALES ↔ FACT_SUBSCRIBER_EVENTS all share the same key.
2. **Date join**: Always `f.DATE_KEY = d.DATE_KEY` — both are INT (YYYYMMDD). To filter by year, prefer `d.YEAR_NUM = 2025` over date arithmetic.
3. **Promoter ↔ Company**: DIM_EVENT.PROMOTER_KEY → DIM_MEDIA_COMPANY.COMPANY_KEY (different column name on the source side).
4. **Self-join on plans**: FACT_SUBSCRIBER_EVENTS has both `PLAN_KEY` (current) and `PREV_PLAN_KEY` (before event) — both reference DIM_PLAN.PLAN_KEY.
5. **No grain-blowing dimensions**: Unlike many warehouses, there's no GOAL_TYPE_KEY / BUDGET_TYPE / SCENARIO_ID column that would require a single-value filter to prevent inflation. Direct sums work correctly.
