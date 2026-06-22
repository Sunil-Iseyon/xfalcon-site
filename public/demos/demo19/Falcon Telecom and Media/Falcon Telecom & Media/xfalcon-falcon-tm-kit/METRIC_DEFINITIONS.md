# Metric Definitions — Falcon Telecom & Media

Authoritative reference for every KPI used across the dashboard suite. Every query in QUERY_TEMPLATES.sql and every label on every dashboard must match the formulas below.

**Currency**: USD (all monetary metrics).
**Fiscal year**: Calendar year (Jan–Dec), aligned to DIM_DATE.FISCAL_YEAR.
**Headline year**: 2025 (most recent complete year). 2026 data covers Jan–Apr 17 only and is shown as "YTD" where used.

## Category 1 — Revenue & Financial

### Total Billed Revenue
- **What it is**: Sum of all monthly billing amounts charged to subscribers.
- **Formula**: `SUM(FACT_BILLING.TOTAL_BILL)`
- **Unit**: $ USD
- **Direction**: Higher is better
- **Filters**: Default — none. For "active base" views, join to DIM_SUBSCRIBER WHERE IS_ACTIVE = TRUE.
- **Used in**: Executive Overview, Billing & Revenue, Geographic Performance, Subscriber 360.

### ARPU (Average Revenue Per User)
- **What it is**: Average monthly bill per billed account.
- **Formula**: `AVG(FACT_BILLING.TOTAL_BILL)` OR `SUM(TOTAL_BILL) / COUNT(DISTINCT SUBSCRIBER_KEY) / 12` for annualized.
- **Unit**: $ USD per month
- **Direction**: Higher is better
- **Used in**: Executive Overview, Billing & Revenue, Plan & Carrier Mix.

### MRR (Monthly Recurring Revenue, event-time)
- **What it is**: MRR captured at the time of a subscriber lifecycle event.
- **Formula**: `AVG(FACT_SUBSCRIBER_EVENTS.MRR)` filtered by event type
- **Unit**: $ USD per month
- **Used in**: Subscriber Performance.

### Total Ad Gross Revenue
- **Formula**: `SUM(FACT_AD_REVENUE.GROSS_REVENUE)`
- **Unit**: $ USD
- **Direction**: Higher is better
- **Used in**: Executive Overview, Advertising Revenue.

### Total Ad Net Revenue
- **What it is**: Gross less the 15% agency/sales commission.
- **Formula**: `SUM(FACT_AD_REVENUE.NET_REVENUE)` (equals `GROSS_REVENUE × 0.85`)
- **Unit**: $ USD
- **Used in**: Advertising Revenue.

### Total Ticket Revenue
- **Formula**: `SUM(FACT_TICKET_SALES.TOTAL_REVENUE)` = `qty × (face_value + service_fee + dynamic_markup)`
- **Unit**: $ USD
- **Used in**: Live Events & Tickets, Executive Overview.

### Total License Fees
- **Formula**: `SUM(FACT_CONTENT_RIGHTS.LICENSE_FEE_M)` × 1,000,000
- **Unit**: $ USD (the column is stored in millions)
- **Used in**: Content Rights & Licensing, Executive Overview.

## Category 2 — Subscriber Lifecycle

### Active Subscribers
- **What it is**: Snapshot count of currently active accounts.
- **Formula**: `COUNT(DISTINCT SUBSCRIBER_KEY) WHERE DIM_SUBSCRIBER.IS_ACTIVE = TRUE`
- **Total in dataset**: 88,000 active of 100,000 total (88%)
- **Used in**: Executive Overview, Subscriber Performance.

### New Acquisitions
- **What it is**: Subscribers gained through New Activation, Port-In, or Reactivation.
- **Formula**: `SUM(CASE WHEN IS_NEW_ACQ THEN 1 ELSE 0 END)` on FACT_SUBSCRIBER_EVENTS
- **2025 value**: 92,821 acquisitions
- **Used in**: Subscriber Performance, Executive Overview.

### Gross Churn
- **What it is**: Subscribers lost through Churn or Port-Out events.
- **Formula**: `SUM(CASE WHEN IS_CHURN THEN 1 ELSE 0 END)` on FACT_SUBSCRIBER_EVENTS
- **2025 value**: 41,375 events
- **Used in**: Subscriber Performance, Churn Analysis.

### Net Adds
- **What it is**: Net change in subscriber base.
- **Formula**: `Acquisitions − Gross Churn`
- **2025 value**: 51,446 net adds
- **Direction**: Higher is better
- **Used in**: Executive Overview, Subscriber Performance.

### Churn Rate (annualized)
- **What it is**: Gross churn as a percentage of active base.
- **Formula**: `Gross Churn ÷ Active Subscribers × 100`
- **2025 value**: ~47% (note: this is event-count based, not snapshot-base — for a true monthly churn rate use `Monthly Churn ÷ Avg Monthly Active Base`)
- **Direction**: Lower is better
- **Used in**: Churn Analysis Deep Dive, Subscriber Performance.

### Lifetime Value (LTV)
- **What it is**: Estimated subscriber LTV at time of event.
- **Formula**: `AVG(FACT_SUBSCRIBER_EVENTS.LIFETIME_VALUE_EST)`
- **Avg dataset value**: ~$3,890
- **Direction**: Higher is better
- **Used in**: Subscriber Performance, Churn Analysis.

### Plan Upgrade Rate
- **Formula**: `Plan Upgrade events ÷ (Plan Upgrade + Plan Downgrade + Plan Change events)`
- **2025 value**: 43% upgrades vs 24% downgrades vs 33% lateral
- **Used in**: Plan & Carrier Mix.

## Category 3 — Billing Health

### Autopay Rate
- **Formula**: `SUM(IS_AUTOPAY) ÷ COUNT(*)` on FACT_BILLING
- **Steady-state**: ~65% across all years
- **Direction**: Higher is better
- **Used in**: Billing & Revenue.

### Late Pay Rate
- **Formula**: `COUNT(WHERE PAYMENT_STATUS = 'Paid Late') ÷ COUNT(*)`
- **Steady-state**: ~6%
- **Direction**: Lower is better
- **Used in**: Billing & Revenue.

### Disputed Bill Rate
- **Formula**: `COUNT(WHERE PAYMENT_STATUS = 'Disputed') ÷ COUNT(*)`
- **Steady-state**: ~2%
- **Used in**: Billing & Revenue.

### Days to Pay (avg)
- **Formula**: `AVG(DAYS_TO_PAY) WHERE DAYS_TO_PAY IS NOT NULL`
- **Used in**: Billing & Revenue.

## Category 4 — Advertising

### CPM (Cost Per Thousand Impressions)
- **Formula**: `AVG(FACT_AD_REVENUE.CPM)` (per-placement) or `SUM(GROSS_REVENUE) / SUM(IMPRESSIONS) × 1000` (weighted)
- **Steady-state**: ~$19.50 weighted
- **Used in**: Advertising Revenue.

### Total Impressions
- **Formula**: `SUM(FACT_AD_REVENUE.IMPRESSIONS)`
- **2025 value**: 88.7B
- **Used in**: Advertising Revenue.

### Click-Through Rate (CTR)
- **Formula**: `SUM(CLICKS) ÷ SUM(IMPRESSIONS) × 100`
- **Used in**: Advertising Revenue.

### Completion Rate
- **What it is**: Percent of viewers who watch the ad to its end.
- **Formula**: `AVG(FACT_AD_REVENUE.COMPLETION_RATE)`
- **Steady-state**: ~70%
- **Direction**: Higher is better
- **Used in**: Advertising Revenue.

### Viewability Rate
- **What it is**: Percent of ad impressions meeting MRC viewability standard.
- **Formula**: `AVG(FACT_AD_REVENUE.VIEWABILITY_RATE)`
- **Steady-state**: ~75%
- **Used in**: Advertising Revenue.

## Category 5 — Streaming

### Streaming Sessions
- **Formula**: `COUNT(*)` on FACT_VIEWERSHIP
- **2025 value**: 186,274
- **Used in**: Streaming Viewership, Executive Overview.

### View Minutes (total)
- **Formula**: `SUM(FACT_VIEWERSHIP.VIEW_MINUTES)`
- **Used in**: Streaming Viewership.

### Avg Session Length
- **Formula**: `AVG(VIEW_MINUTES)` or `SUM(VIEW_MINUTES) / COUNT(*)`
- **Steady-state**: ~50 min/session
- **Used in**: Streaming Viewership.

### Completion Rate (streaming)
- **Formula**: `AVG(COMPLETION_PCT)` or `SUM(COMPLETED) ÷ COUNT(*)` for the boolean version
- **Steady-state**: 54.7% avg, 55% completion-flag rate
- **Used in**: Streaming Viewership.

### Binge Rate
- **What it is**: Share of sessions exceeding 120 minutes (continuous viewing).
- **Formula**: `SUM(IS_BINGE) ÷ COUNT(*)` on FACT_VIEWERSHIP
- **Steady-state**: ~7.8%
- **Used in**: Streaming Viewership, Subscriber 360.

### Rebuffer Events per Session
- **Formula**: `AVG(REBUFFER_EVENTS)`
- **Steady-state**: ~1.5
- **Direction**: Lower is better
- **Used in**: Streaming Viewership.

## Category 6 — Live Events

### Avg Face Value
- **Formula**: `AVG(FACE_VALUE)` on FACT_TICKET_SALES
- **Used in**: Live Events & Tickets.

### Dynamic Markup %
- **What it is**: Premium charged above face value via dynamic pricing.
- **Formula**: `AVG(DYNAMIC_MARKUP / FACE_VALUE * 100)`
- **Steady-state**: ~5% avg, ~12% std dev
- **Used in**: Live Events & Tickets.

### VIP Revenue Mix
- **Formula**: `SUM(TOTAL_REVENUE) WHERE TIER.IS_VIP = TRUE / SUM(TOTAL_REVENUE) × 100`
- **Lifetime**: 65% of revenue from VIP tiers (25% of ticket count)
- **Used in**: Live Events & Tickets.

### Resale Premium
- **Formula**: `AVG(TOTAL_REVENUE WHERE IS_RESALE) − AVG(TOTAL_REVENUE WHERE NOT IS_RESALE)`
- **Used in**: Live Events & Tickets.

## Category 7 — Content Rights

### Avg License Fee
- **Formula**: `AVG(LICENSE_FEE_M)` (in $M)
- **Steady-state**: $5.5M
- **Used in**: Content Rights & Licensing.

### Avg Term (years)
- **Formula**: `AVG(TERM_YEARS)`
- **Steady-state**: 3.0
- **Used in**: Content Rights & Licensing.

### Exclusivity Premium
- **What it is**: Difference in avg license fee between Exclusive and Non-Exclusive deals.
- **Formula**: `AVG(LICENSE_FEE_M WHERE EXCLUSIVITY='Exclusive') − AVG(LICENSE_FEE_M WHERE EXCLUSIVITY='Non-Exclusive')`
- **Used in**: Content Rights & Licensing.

### Avg Revenue Share %
- **Formula**: `AVG(REVENUE_SHARE_PCT)`
- **Steady-state**: 15%
- **Used in**: Content Rights & Licensing.

### Total Minimum Guarantees
- **Formula**: `SUM(MINIMUM_GUARANTEE_M)` (in $M)
- **Steady-state**: 40% of total license fees
- **Used in**: Content Rights & Licensing.

## Category 8 — Geography

### Regional Share
- **Formula**: `SUM(metric) per region / SUM(metric) total × 100`
- **Used in**: Geographic Performance.

### Tier1 Concentration
- **Formula**: `SUM(metric WHERE TIER='Tier1') / SUM(metric total) × 100`
- **Used in**: Geographic Performance, Executive Overview.

### Top-DMA Share
- **Formula**: `SUM(metric for top 5 DMAs) / SUM(metric total) × 100`
- **NY+LA+Chicago+Houston+Phoenix lifetime billing**: ~64% of total
- **Used in**: Geographic Performance.

## Category 9 — Cross-Domain

### Cross-Domain Revenue per Subscriber
- **Formula**: `(billed_rev + ticket_rev + ad-attributable rev) / active_subs` per segment
- **Used in**: Subscriber 360.

### Multi-Domain Engagement Rate
- **What it is**: Share of active subscribers with activity in 2+ fact tables (billing AND viewership AND/OR tickets).
- **Used in**: Subscriber 360.

### Segment Engagement Index
- **Formula**: `(view_sessions + ticket_txns) / subs` per segment
- **Used in**: Subscriber 360.

## Direction Summary

| Higher is better | Lower is better |
|---|---|
| Billed revenue, ARPU, MRR, Active subs, Net adds, LTV | Gross churn, Churn rate, Late pay rate, Disputed rate, Days to pay |
| Ad gross/net rev, CPM, Completion rate, Viewability | Rebuffer events |
| Streaming sessions, View minutes, Binge rate (engagement signal) | |
| Ticket revenue, VIP mix, Avg face value | |
| License fees, Avg term, Exclusivity premium | |
