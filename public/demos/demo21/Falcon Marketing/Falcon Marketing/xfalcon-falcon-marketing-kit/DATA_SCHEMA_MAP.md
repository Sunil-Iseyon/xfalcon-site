# Falcon Marketing — Data Schema Map

Maps the warehouse tables to the AnalyticsPro dimensional model. All tables live in the default schema (no `public.` prefix needed). Dates are an INTEGER `DATE_KEY` in `YYYYMMDD` format throughout.

## Star schema overview

```
                    DIM_DATE  (3,652 rows, 2017-2026)
                       │
   ┌───────────────────┼────────────────┬────────────────┐
   │                   │                │                │
FACT_CAMPAIGN_       FACT_MEDIA_     FACT_PRODUCTION_  FACT_PROJECTS
PERFORMANCE          SPEND           JOBS              (979K rows)
(2.76M rows)         (54K rows)      (1.28M rows)
   │ │ │              │ │ │            │ │ │ │           │ │ │ │
   │ │ └─ DIM_GEOGRAPHY (40)            │ │ │ │           │ │ │ │
   │ └──── DIM_CHANNEL (15)             │ │ │ │           │ │ │ │
   └────── DIM_CAMPAIGN (1,035)         │ │ │ │           │ │ │ │
                                        │ │ │ └─ DIM_CLIENT (20) ─┘
                                        │ │ └─── DIM_JOB_TYPE (20)
                                        │ └────  DIM_CHANNEL
                                        └─────── DIM_GEOGRAPHY
                                                    DIM_SERVICE_LINE (15)
                                                    DIM_EMPLOYEE (120)
```

## Fact tables

### FACT_CAMPAIGN_PERFORMANCE — 2,759,860 rows
Grain: campaign × channel × geography × date. Daily delivery metrics.

| Column | Type | Use |
|--------|------|-----|
| PERF_KEY | BIGINT | PK |
| DATE_KEY | INT | → DIM_DATE.DATE_KEY |
| CAMPAIGN_KEY | INT | → DIM_CAMPAIGN |
| CHANNEL_KEY | INT | → DIM_CHANNEL |
| GEO_KEY | INT | → DIM_GEOGRAPHY |
| IMPRESSIONS, CLICKS, CONVERSIONS, REACH | INT | additive |
| SPEND, REVENUE_ATTRIBUTED | NUMERIC | additive |
| FREQUENCY | NUMERIC | non-additive — average, weight by REACH |
| ENGAGEMENT_ACTIONS | INT | additive |

### FACT_MEDIA_SPEND — 54,711 rows
Grain: campaign × channel × geography × month. Planned vs actual.

| Column | Type | Use |
|--------|------|-----|
| SPEND_KEY | BIGINT | PK |
| DATE_KEY | INT | → DIM_DATE (month start) |
| CAMPAIGN_KEY, CHANNEL_KEY, GEO_KEY | INT | → dims |
| PLANNED_SPEND, ACTUAL_SPEND | NUMERIC | additive |
| IMPRESSIONS_BOUGHT, PLACEMENTS | INT | additive |
| CPM_ACTUAL | NUMERIC | non-additive — derive from spend/impressions when aggregating |
| AGENCY_FEE_PCT | NUMERIC | non-additive — weight by ACTUAL_SPEND |
| AGENCY_FEE_AMOUNT | NUMERIC | additive — agency revenue from media |

### FACT_PRODUCTION_JOBS — 1,282,272 rows
Grain: one row per discrete production job. Despite some docstrings implying multiplicity, JOB_CODE is unique (1 row per job).

| Column | Type | Use |
|--------|------|-----|
| JOB_KEY | BIGINT | PK |
| DATE_KEY, CLIENT_KEY, JOB_TYPE_KEY, CHANNEL_KEY, GEO_KEY | INT | → dims |
| JOB_CODE | VARCHAR | natural key (unique) |
| QUANTITY, UNIT_COST, TOTAL_COST, BILLED_AMOUNT | NUMERIC | additive |
| TURNAROUND_DAYS | SMALLINT | non-additive — average |
| RUSH_FLAG, ON_SPEC_FLAG | SMALLINT (0/1) | use AVG() for rate |
| REVISION_COUNT | SMALLINT | additive (sum) or AVG (avg per job) |

### FACT_PROJECTS — 979,568 rows
Grain: one row per project. Despite docstring saying "× service line × employee", verified: each PROJECT_CODE appears in exactly one row.

| Column | Type | Use |
|--------|------|-----|
| PROJECT_KEY | BIGINT | PK |
| DATE_KEY | INT | → DIM_DATE (project start date) |
| CLIENT_KEY, SERVICE_LINE_KEY, EMPLOYEE_KEY, GEO_KEY | INT | → dims |
| PROJECT_CODE | VARCHAR | natural key (unique) |
| SOW_VALUE, BILLED_AMOUNT | NUMERIC | additive |
| HOURS_ESTIMATED, HOURS_ACTUAL | NUMERIC | additive |
| MARGIN_PCT | NUMERIC | non-additive — weight by BILLED_AMOUNT |
| ON_TIME_FLAG, ON_BUDGET_FLAG | SMALLINT (0/1) | use AVG() for rate |
| DELIVERABLE_COUNT | SMALLINT | additive |

## Dimensions

### DIM_CLIENT (20)
Active flag = 1 for 19 of 20. Industries: Financial Services, Healthcare, Technology, Insurance, QSR, Energy, Automotive, Retail, CPG, Hospitality, Sports, Transportation, Media, Real Estate, Education. Tiers: Platinum (3), Gold (5), Silver (7), Bronze (4). Segments: Enterprise / Mid-Market / SMB.

### DIM_CAMPAIGN (1,035)
Types: Brand Awareness, Direct Response, Customer Retention, Account-Based Marketing, Loyalty, Lead Generation, Product Launch. Status: Active / Completed / Cancelled / Draft.

### DIM_CHANNEL (15)
Categories: Digital (10), Print (3), Physical (2). Types: Paid (8), Owned (6), Earned (1).

### DIM_EMPLOYEE (120)
Departments: Creative (42), Strategy (24), Production (24), Media (18), Account (12). Seniority: Junior, Mid, Senior, Lead.

### DIM_SERVICE_LINE (15)
Categories: Creative (5), Strategy (4), Production (4), Media (1), with Email Marketing also under Production.

### DIM_GEOGRAPHY (40)
US-only. Regions: Northeast, Southeast, Midwest, South, West, National. Tiers: Metro, Regional, National.

### DIM_JOB_TYPE (20)
Categories include Display, Email, Direct Mail, Signage, Web, Content, Social, Brand, Video, AR, etc. Complexity: Standard, High.

### DIM_DATE (3,652)
2017-01-01 → 2026-12-31. Fiscal year = calendar year (Jan–Dec). FISCAL_QUARTER tracks the same as QUARTER_NUM.

## Common column-name pitfalls

| Wrong assumption | Correct column |
|------------------|----------------|
| `REVENUE` on FACT_CAMPAIGN_PERFORMANCE | `REVENUE_ATTRIBUTED` |
| `COST` on FACT_PRODUCTION_JOBS | `TOTAL_COST` (per-job) or `UNIT_COST` (per-unit) |
| `BUDGET` on FACT_MEDIA_SPEND | `PLANNED_SPEND` |
| `ACTUAL` on FACT_MEDIA_SPEND | `ACTUAL_SPEND` |
| `IS_RUSH` | `RUSH_FLAG` (0/1 SMALLINT) |
| `IS_ONTIME` | `ON_TIME_FLAG` |
| `MARGIN` on FACT_PROJECTS | `MARGIN_PCT` (decimal, e.g. 0.43 for 43%) |
| `START_DATE` on FACT_PROJECTS | only on DIM_CAMPAIGN; FACT_PROJECTS has DATE_KEY only |
| `EMPLOYEE_NAME` | not a column — DIM_EMPLOYEE has `EMPLOYEE_CODE` and `ROLE_TITLE` only |
| `CLIENT_NAME` | on DIM_CLIENT (not on facts); join via CLIENT_KEY |

## Join template

```sql
-- Standard agency revenue (project + production) join
SELECT d.YEAR_NUM, c.CLIENT_NAME, c.ACCOUNT_TIER,
       SUM(p.BILLED_AMOUNT) AS proj_billed,
       SUM(j.BILLED_AMOUNT) AS prod_billed
FROM DIM_CLIENT c
  LEFT JOIN FACT_PROJECTS p
    ON p.CLIENT_KEY = c.CLIENT_KEY
  LEFT JOIN FACT_PRODUCTION_JOBS j
    ON j.CLIENT_KEY = c.CLIENT_KEY AND j.DATE_KEY = p.DATE_KEY
  JOIN DIM_DATE d
    ON d.DATE_KEY = COALESCE(p.DATE_KEY, j.DATE_KEY)
GROUP BY d.YEAR_NUM, c.CLIENT_NAME, c.ACCOUNT_TIER;
```

⚠ Cross-fact joins on (CLIENT_KEY, DATE_KEY) can blow up the row count. **Prefer:** aggregate each fact independently per client/year, then UNION or join the small results.

## Performance notes

- Cross-fact queries (`FACT_PROJECTS` × `FACT_PRODUCTION_JOBS`) on the full table can timeout. Either query each fact separately and combine in the dashboard layer, or pre-aggregate each fact by client+year before joining.
- All standard year/client/channel rollups complete in < 5 seconds.
- The IDA query timeout was hit on a single 3-fact LEFT JOIN — use single-fact queries when scanning across all 7 years.
