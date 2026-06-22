# Global Filters & Exclusions — Falcon Telecom & Media

This file is the contract every dashboard query must honor. It documents:
1. **Hardcoded exclusions** — WHERE clauses applied to every relevant query.
2. **Interactive filter dimensions** — what appears in the global filter bar.
3. **Conditional rules** — calculations that change based on filter context.
4. **Data quality notes**.

## 1. Hardcoded Exclusions

### A. Inactive subscribers excluded from "active-base" views

**Scope**: Any KPI that represents the *current* subscriber base — Active Subs, ARPU on active base, etc.

**Rule**: Join to DIM_SUBSCRIBER and apply `WHERE DIM_SUBSCRIBER.IS_ACTIVE = TRUE`.

**Example**:
```sql
SELECT COUNT(DISTINCT s.SUBSCRIBER_KEY) AS active_subs,
       SUM(b.TOTAL_BILL) AS active_revenue
FROM FACT_BILLING b
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
WHERE s.IS_ACTIVE = TRUE
  AND <date filter>
```

**Where this filter is NOT applied**:
- Churn analysis (we explicitly look at churned/inactive accounts).
- Historical billing trends (lookback bills include subscribers who later churned — that's accurate).

### B. Reference (non-prospect) carriers excluded from prospect-tracking views

**Scope**: Default lens on any dashboard whose audience is "Falcon sales — how do our prospects look".

**Rule**: Join to DIM_CARRIER and apply `WHERE DIM_CARRIER.IS_PROSPECT = TRUE`.
- Prospects (5): AT&T, Verizon, T-Mobile US, Charter Communications, Comcast
- Reference / non-prospects (3): Dish Network, Lumen Technologies, US Cellular

**UI**: Add a toggle "Include reference carriers" — OFF by default. When ON, all 8 carriers appear; when OFF, the 3 reference carriers are filtered out.

**Same rule applies to platforms**: Default scope is `IS_PROSPECT = TRUE` on DIM_MEDIA_PLATFORM (excluding Netflix, Amazon Prime Video, Apple TV+ from prospect-tracking views, but keeping them visible when the toggle flips on).

### C. NULL ratings excluded from rating averages

**Scope**: Any chart showing FACT_VIEWERSHIP.RATING.

**Rule**: `WHERE RATING IS NOT NULL`. The rating column is sparsely populated — most sessions have no rating. Including NULLs in `AVG()` would inflate counts but Postgres' AVG ignores NULLs anyway; the query just shouldn't *count* those rows.

### D. NULL churn reasons excluded from reason-mix charts

**Scope**: Any chart showing churn-reason distribution.

**Rule**: `WHERE IS_CHURN = TRUE AND CHURN_REASON IS NOT NULL`. Plan Change events also have no CHURN_REASON.

## 2. Interactive Filter Dimensions

These appear in the global filter bar on every dashboard:

| Filter | Dropdown values | Default | Notes |
|---|---|---|---|
| **Year** | 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 (YTD) | 2025 | Single-select. Drives every KPI to that year. |
| **Compare Years** toggle | OFF / ON | OFF | When ON, year selector greys out and KPIs become 3-year stacked. |
| **Carrier** | All 8 carriers + "All" + "Prospects only" | Prospects only | Multi-select. Prospect filter on by default. |
| **Region** | Northeast, South, Midwest, West + "All" | All | Multi-select. |
| **Theme** | Spectrum (light, default), Tech (dark) | Spectrum | On portal only — propagates via `?theme=` URL param. |

Dashboard-specific filters (added per dashboard):
- **Subscriber Performance**: Segment, Age Band, Plan Type
- **Billing & Revenue**: Plan Type, Payment Status
- **Advertising Revenue**: Industry, Spend Tier, Format Channel
- **Streaming Viewership**: Platform, Genre, Device Type, Revenue Type
- **Live Events**: Event Type, Tier, Channel
- **Content Rights**: Rights Type, Exclusivity, Territory

## 3. Conditional Calculation Rules

### Rule 1: Single-year KPIs

**Rule**: Every KPI card on every dashboard displays exactly ONE year's value. Multi-year sums on KPI cards are forbidden.

**Implementation**: When the user selects "Year = 2025", the KPI is `SUM(metric) WHERE YEAR_NUM = 2025`. The delta below is `(2025 − 2024) / 2024 × 100`.

When the user toggles "Compare Years = ON", the KPI card transforms into a stacked mini-table showing 2023 / 2024 / 2025 + a CAGR badge.

### Rule 2: Default revenue includes Disputed bills

**Rule**: Headline billing revenue includes Paid + Paid Late + Disputed status. Only `Defaulted` is excluded by default.

**Reasoning**: Disputed bills are still billed — they just may be reduced or refunded later. A 2% disputed rate is steady-state and would distort YoY comparisons if filtered out conditionally.

**Override**: A "Conservative revenue" toggle on the Billing & Revenue dashboard excludes Disputed rows for users who want a more conservative view.

### Rule 3: 2026 YTD treatment

**Rule**: 2026 has data through April 17 only. Any chart that includes 2026 must label it "2026 YTD" or annotate the partial period. KPI deltas vs 2025 must use either:
- (a) Same-period comparison: 2026 YTD vs 2025 same-period (Jan 1 – Apr 17, 2025)
- (b) Annualized projection: 2026 actual ÷ 0.30 (since Apr 17 is ~30% through the year)

**Default**: Use (a) — same-period comparison. It's more honest about partial-year data.

### Rule 4: ARPU computed on active base

**Rule**: ARPU = `AVG(TOTAL_BILL) WHERE IS_ACTIVE = TRUE`. If the dashboard is showing inactive segment analysis (e.g., on the Churn dashboard), ARPU uses MRR from the event-time fact (`AVG(FACT_SUBSCRIBER_EVENTS.MRR)`) instead.

### Rule 5: License fees in millions

**Rule**: `LICENSE_FEE_M` and `MINIMUM_GUARANTEE_M` columns are pre-stored in millions. Display as "$X.XB" when the sum exceeds 1,000 ($1B+); otherwise display as "$X.XM". Never multiply by 1,000,000 in the chart label — the column already represents millions.

## 4. Data Quality Notes

### Note 1: 2026 is partial
- Coverage: 2026-01-01 → 2026-04-17 (107 days, 29% of year).
- Affected facts: All 6.
- Treatment: Always label 2026 as "YTD" in chart titles. Do NOT extrapolate to full year unless explicitly noted.

### Note 2: COVID anomaly Mar–Aug 2020
- All facts show a dip in Q2 2020 (~30–45% drop in volume).
- Live events (FACT_TICKET_SALES) had a near-total collapse — Q2 2020 was ~8% of normal.
- Streaming (FACT_VIEWERSHIP) had a 45% surge in Q2 2020 (opposite direction).
- Treatment: 2020 is shown as-is. No artificial smoothing. Annotate dashboard subtitles with "Includes COVID-affected 2020 baseline" where relevant.

### Note 3: Pareto content concentration
- Top 20% of titles in DIM_CONTENT generate ~80% of FACT_VIEWERSHIP sessions.
- Treatment: Top-N content rankings work cleanly; tail analysis requires careful aggregation to avoid sample-size issues on the long tail.

### Note 4: Uniform platform sessions
- All 12 platforms show ~109K sessions each (uniform distribution).
- This is intentional in the synthetic data — content concentration is on titles, not platforms.
- Treatment: Don't expect platform rankings to look like real-world hit-platform skew. The story is in completion rate, binge rate, and revenue model differences.

### Note 5: Churn reasons near-uniform
- 8 churn reasons each account for 12.5–15% of churn (Price slightly leads).
- Treatment: Don't over-index on "Price is the dominant churn reason" — the spread is narrow. Real story is in churn reason × segment × tenure interaction.

### Note 6: Cross-domain joins are intentional
- SUBSCRIBER_KEY is shared across Billing, Viewership, Tickets, and Subscriber Events.
- Roughly 88% of the 100K subscribers appear in all four facts (active + multi-engaged).
- Treatment: Subscriber 360 dashboard is enabled by this — but cross-fact joins can be expensive. Always pre-aggregate per-fact first, then join the aggregates.

## 5. Disclaimer Footer (paste on every dashboard)

```
Data: Falcon Telecom & Media synthetic warehouse · 4.7M fact rows · 2018-01-01 – 2026-04-17
Filters: Active subscribers only · Prospect carriers only (toggle to include reference)
Disputed bills included in revenue · 2026 shown as YTD · Calendar fiscal year
Generated: <build date>
```
