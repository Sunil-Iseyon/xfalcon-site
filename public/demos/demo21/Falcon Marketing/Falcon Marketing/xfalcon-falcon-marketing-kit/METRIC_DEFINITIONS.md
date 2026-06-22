# Falcon Marketing — Metric Definitions

Every KPI used across the kit. The HTML companion (`metrics-definitions.html`) is generated from this file.

## Conventions
- All currency values in USD.
- Fiscal year = calendar year (Jan–Dec).
- "Higher better" / "Lower better" indicates direction of improvement.
- Each metric lists required filters (which queries must include them).

---

## Revenue & Financial

### Total Agency Revenue
**Definition:** Combined client billings across project (SOW) and production work.
**Formula:** `SUM(FACT_PROJECTS.BILLED_AMOUNT) + SUM(FACT_PRODUCTION_JOBS.BILLED_AMOUNT)`
**Unit:** USD ($, displayed as $XX.XB / $XX.XM)
**Direction:** Higher better
**Filters:** Year filter applied to DATE_KEY on each fact.
**Used in:** Executive Overview, Client Portfolio, QBR

### Project Billed Revenue
**Definition:** Amount invoiced to clients for SOW-based engagements.
**Formula:** `SUM(FACT_PROJECTS.BILLED_AMOUNT)`
**Unit:** USD
**Direction:** Higher better
**Used in:** Executive Overview, Project Margin, Service Line Mix

### Production Billed Revenue
**Definition:** Amount invoiced to clients for production deliverables (jobs).
**Formula:** `SUM(FACT_PRODUCTION_JOBS.BILLED_AMOUNT)`
**Unit:** USD
**Direction:** Higher better
**Used in:** Executive Overview, Production Operations

### SOW Value
**Definition:** Total contracted value of Statements of Work (signed, not yet billed includes pipeline).
**Formula:** `SUM(FACT_PROJECTS.SOW_VALUE)`
**Unit:** USD
**Direction:** Higher better
**Used in:** Project Margin

### Realization Rate
**Definition:** Percentage of contracted SOW value actually billed.
**Formula:** `SUM(BILLED_AMOUNT) / SUM(SOW_VALUE)`
**Unit:** % (decimal × 100)
**Direction:** Higher better (target ≥ 95%)
**Used in:** Project Margin

### Gross Margin %
**Definition:** Average gross margin across projects, weighted by billed amount.
**Formula:** `SUM(MARGIN_PCT × BILLED_AMOUNT) / SUM(BILLED_AMOUNT)` (or unweighted `AVG(MARGIN_PCT)` for simple use)
**Unit:** %
**Direction:** Higher better (target ≥ 40%)
**Used in:** Executive Overview, Project Margin, Service Line Mix

### Agency Fee Revenue
**Definition:** Commission earned on managed media buys.
**Formula:** `SUM(FACT_MEDIA_SPEND.AGENCY_FEE_AMOUNT)`
**Unit:** USD
**Direction:** Higher better
**Used in:** Media Spend Management

### Effective Agency Fee %
**Definition:** Fee revenue as a share of media spend managed.
**Formula:** `SUM(AGENCY_FEE_AMOUNT) / SUM(ACTUAL_SPEND)`
**Unit:** %
**Direction:** Higher better (target 12–15%)
**Used in:** Media Spend Management

---

## Campaign / Marketing Effectiveness

### ROAS (Return on Ad Spend)
**Definition:** Revenue attributed per dollar of media spend.
**Formula:** `SUM(REVENUE_ATTRIBUTED) / SUM(SPEND)` from FACT_CAMPAIGN_PERFORMANCE
**Unit:** Multiple (×, e.g. 3.80x)
**Direction:** Higher better (industry benchmark ~3.0x)
**Used in:** Executive Overview, Campaign Performance, Channel Mix, Geographic

### CTR (Click-Through Rate)
**Definition:** Clicks per impression served.
**Formula:** `SUM(CLICKS) / SUM(IMPRESSIONS)`
**Unit:** %
**Direction:** Higher better
**Used in:** Campaign Performance, Channel Mix

### CVR (Conversion Rate)
**Definition:** Conversions per click.
**Formula:** `SUM(CONVERSIONS) / SUM(CLICKS)`
**Unit:** %
**Direction:** Higher better
**Used in:** Campaign Performance

### CPM (Cost Per Mille)
**Definition:** Realized cost per 1,000 impressions.
**Formula:** `SUM(SPEND) / SUM(IMPRESSIONS) × 1000` (campaign perf), or `AVG(CPM_ACTUAL)` (media spend table)
**Unit:** USD
**Direction:** Lower better (varies widely by channel)
**Used in:** Media Spend, Channel Mix

### CPC (Cost Per Click)
**Definition:** Spend per click.
**Formula:** `SUM(SPEND) / SUM(CLICKS)`
**Unit:** USD
**Direction:** Lower better
**Used in:** Campaign Performance

### CPA (Cost Per Acquisition)
**Definition:** Spend per conversion.
**Formula:** `SUM(SPEND) / SUM(CONVERSIONS)`
**Unit:** USD
**Direction:** Lower better
**Used in:** Campaign Performance

### Reach
**Definition:** Unique individuals exposed to a campaign.
**Formula:** `SUM(REACH)` (already de-duplicated upstream by ad server)
**Unit:** Count (millions)
**Direction:** Higher better
**Used in:** Campaign Performance

### Frequency
**Definition:** Average impressions per unique person reached.
**Formula:** `SUM(IMPRESSIONS) / SUM(REACH)` or weighted `AVG(FREQUENCY)`
**Unit:** Number (typical 1–5)
**Direction:** Sweet spot 2–4; over 5 = waste
**Used in:** Campaign Performance

---

## Production Operations

### Job Throughput
**Definition:** Count of distinct production jobs completed.
**Formula:** `COUNT(DISTINCT JOB_CODE)` from FACT_PRODUCTION_JOBS
**Unit:** Count
**Direction:** Higher better (capacity)
**Used in:** Production Operations

### Avg Turnaround
**Definition:** Mean elapsed business days from brief to delivery.
**Formula:** `AVG(TURNAROUND_DAYS)`
**Unit:** Days
**Direction:** Lower better (vs DIM_JOB_TYPE.AVG_TURNAROUND_DAYS target)
**Used in:** Production Operations

### Rush Rate
**Definition:** Share of jobs flagged as rush.
**Formula:** `AVG(RUSH_FLAG)` or `SUM(RUSH_FLAG) / COUNT(*)`
**Unit:** %
**Direction:** Lower better (signals planning quality)
**Used in:** Production Operations, Executive Overview

### On-Spec Rate
**Definition:** Share of jobs delivered meeting all client specifications.
**Formula:** `AVG(ON_SPEC_FLAG)`
**Unit:** %
**Direction:** Higher better (target ≥ 95%)
**Used in:** Production Operations

### Avg Revisions per Job
**Formula:** `AVG(REVISION_COUNT)`
**Unit:** Number
**Direction:** Lower better

---

## Project Delivery

### On-Time Rate
**Formula:** `AVG(ON_TIME_FLAG)`
**Unit:** %
**Direction:** Higher better (target ≥ 90%)
**Used in:** Project Margin, Service Line Mix

### On-Budget Rate
**Formula:** `AVG(ON_BUDGET_FLAG)`
**Unit:** %
**Direction:** Higher better
**Used in:** Project Margin

### Hours Variance %
**Definition:** Actual hours over/under estimate.
**Formula:** `(SUM(HOURS_ACTUAL) - SUM(HOURS_ESTIMATED)) / SUM(HOURS_ESTIMATED)`
**Unit:** %
**Direction:** Closer to 0 = better; positive = scope creep
**Used in:** Project Margin

---

## Employee / People

### Total Hours Logged
**Formula:** `SUM(HOURS_ACTUAL)` from FACT_PROJECTS
**Used in:** Employee Utilization

### Headcount
**Formula:** `COUNT(DISTINCT EMPLOYEE_KEY)` from DIM_EMPLOYEE WHERE IS_ACTIVE=1
**Direction:** N/A — capacity metric

### Billable Utilization %
**Definition:** Hours logged on projects ÷ standard available hours.
**Formula:** `SUM(HOURS_ACTUAL) / (COUNT(DISTINCT EMPLOYEE_KEY) × 2080)` per year
**Unit:** %
**Direction:** Higher better (target 65–80%)
**Note:** Approximation — no PTO/holiday adjustment in source data.
**Used in:** Employee Utilization

### Cost-to-Bill Margin %
**Definition:** Margin between cost rate and bill rate, weighted by hours.
**Formula:** `(SUM(BILL_RATE × HOURS_ACTUAL) - SUM(COST_RATE × HOURS_ACTUAL)) / SUM(BILL_RATE × HOURS_ACTUAL)`
**Used in:** Employee Utilization

---

## Client Portfolio

### Active Clients
**Formula:** `COUNT(DISTINCT CLIENT_KEY)` WHERE IS_ACTIVE=1
**Used in:** Executive Overview

### Avg Revenue per Client
**Formula:** `(project_billed + production_billed) / active_clients`
**Used in:** Client Portfolio

### Client Tenure
**Formula:** `(today - CLIENT_SINCE)` in years
**Used in:** Client Portfolio

### Tier Mix
**Formula:** count of clients by ACCOUNT_TIER
**Used in:** Client Portfolio, Executive Overview

---

## Media / Channel

### Spend Variance % (Plan vs Actual)
**Formula:** `(SUM(ACTUAL_SPEND) - SUM(PLANNED_SPEND)) / SUM(PLANNED_SPEND)`
**Unit:** %
**Direction:** Closer to 0 = better pacing
**Used in:** Media Spend Management

### Channel ROAS Ranking
**Formula:** `SUM(REVENUE_ATTRIBUTED) / SUM(SPEND)` GROUP BY CHANNEL_KEY
**Used in:** Channel Mix, Campaign Performance

### Paid/Owned/Earned Mix
**Formula:** `SUM(SPEND) GROUP BY CHANNEL_TYPE`
**Used in:** Channel Mix

---

## Geographic

### Region Revenue
**Formula:** `SUM(REVENUE_ATTRIBUTED) GROUP BY REGION`
**Used in:** Geographic Performance

### Market Tier Performance
**Formula:** `SUM(SPEND), SUM(REVENUE_ATTRIBUTED) GROUP BY TIER`
**Used in:** Geographic Performance
