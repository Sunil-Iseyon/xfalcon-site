# Falcon Marketing — Dashboard Feasibility Matrix

**Generated:** 2026-04-26
**Connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__` (the only IDA connector visible in this session)
**Schema prefix:** none required — tables are reachable as `FACT_…` / `DIM_…`
**Time coverage:** 2018-01-01 → 2024-12-27 (7 years)
**Active clients:** 19 (1 client churned, all others active across all years)

## Score legend

| Score | Status | Meaning |
|-------|--------|---------|
| 90–100% | READY | All core KPIs available; dataset is clean |
| 50–89% | PARTIAL | Core metrics work; one or two surface-level gaps |
| 20–49% | LIMITED | Major gaps; reduced-scope only |
| 0–19% | BLOCKED | Cannot build |

## Dashboard scoring

| # | Dashboard | Status | Score | Primary tables | What works | What's limited | Effort |
|---|-----------|--------|-------|----------------|------------|----------------|--------|
| 1 | Executive Overview | READY | 95% | FACT_PROJECTS, FACT_PRODUCTION_JOBS, FACT_MEDIA_SPEND, FACT_CAMPAIGN_PERFORMANCE, DIM_CLIENT | Total agency revenue (project + production billed), YoY trend 2018–2024, ROAS, active client count, top clients, channel mix, monthly trend | None | 1.0d |
| 2 | Client Portfolio | READY | 95% | FACT_PROJECTS, FACT_PRODUCTION_JOBS, DIM_CLIENT | Per-client billed (project + production), industry / segment / tier breakdown, project count, client-since longevity, retention | One client churned in 2022 — single data point so no formal churn rate trend | 1.0d |
| 3 | Campaign Performance | READY | 95% | FACT_CAMPAIGN_PERFORMANCE, DIM_CAMPAIGN, DIM_CHANNEL | ROAS, CTR, CVR, CPM, reach, frequency, top campaigns, campaign type mix | None | 1.0d |
| 4 | Media Spend Management | READY | 95% | FACT_MEDIA_SPEND, DIM_CHANNEL, DIM_CAMPAIGN | Planned vs actual spend variance, monthly pacing, agency fee revenue, CPM by channel, placements | None | 1.0d |
| 5 | Production Operations | READY | 95% | FACT_PRODUCTION_JOBS, DIM_JOB_TYPE, DIM_CLIENT | Job throughput, turnaround days, rush %, on-spec %, revision count, units produced, billed amount, complexity mix | None | 1.0d |
| 6 | Project Margin & Profitability | READY | 95% | FACT_PROJECTS, DIM_SERVICE_LINE, DIM_CLIENT | SOW vs billed, hours est vs actual, margin %, on-time %, on-budget %, deliverable count | None | 1.0d |
| 7 | Employee Utilization | READY | 90% | FACT_PROJECTS, DIM_EMPLOYEE | Hours by department, billable utilization (HOURS_ACTUAL / 2080 × headcount), cost vs bill rate margin, seniority mix | No timesheet/PTO table — utilization derived from project hours only (no denominator for "hours available") | 1.0d |
| 8 | Geographic Performance | READY | 90% | FACT_CAMPAIGN_PERFORMANCE, FACT_PROJECTS, DIM_GEOGRAPHY | Region (Northeast/Midwest/South/West/National) and tier (Metro/Regional) breakdown, DMA-level deep dive, market ROI | DMAs limited to 40 markets in DIM_GEOGRAPHY (not all US DMAs) | 0.75d |
| 9 | Channel Mix & ROAS | READY | 95% | FACT_CAMPAIGN_PERFORMANCE, DIM_CHANNEL | Paid vs Owned vs Earned, Digital vs Print vs Physical, channel ROAS ranking, CPM benchmarking | None | 0.75d |
| 10 | Service Line Mix | READY | 95% | FACT_PROJECTS, DIM_SERVICE_LINE, DIM_EMPLOYEE | Revenue by service category (Creative/Strategy/Production/Media), hourly rate ranges vs realized, billable hours mix | None | 0.75d |
| 11 | Q4 2024 QBR | READY | 90% | All facts | Quarterly executive summary: top headlines, channel ROI, client mix, production health, project margin | Only 1 quarter of "current" QBR data (we'll show Oct-Dec 2024 as the latest) | 1.0d |

## Dashboards considered but de-scoped

| Dashboard | Reason |
|-----------|--------|
| Creative Asset Productivity | DIM_CREATIVE_ASSET (2,095 rows) exists but no fact table joins to it — would require name-pattern matching on JOB_CODE. Skip for now. |
| Weekly Business Review (WBR) | Data supports it but redundant with QBR for a demo. Can be added later. |
| Annual Plan vs Actual | No top-down annual plan/budget table — only monthly media plan via FACT_MEDIA_SPEND.PLANNED_SPEND. We'll surface that inside Dashboard #4. |

## Validation benchmarks (pulled from discovery)

| Metric | 2024 value | Source query |
|--------|-----------|--------------|
| Project billed | $12.71B | `SUM(BILLED_AMOUNT) FROM FACT_PROJECTS WHERE YEAR=2024` |
| Production billed | $12.85B | `SUM(BILLED_AMOUNT) FROM FACT_PRODUCTION_JOBS WHERE YEAR=2024` |
| Media actual spend | $108.5M | `SUM(ACTUAL_SPEND) FROM FACT_MEDIA_SPEND WHERE YEAR=2024` |
| Campaign attributed revenue | $1.20B | `SUM(REVENUE_ATTRIBUTED) FROM FACT_CAMPAIGN_PERFORMANCE WHERE YEAR=2024` |
| ROAS 2024 | 3.80x | revenue / spend |
| Top channel by spend | Direct Mail ($75.3M) | FACT_CAMPAIGN_PERFORMANCE 2024 |
| Top client by billings | Vertex Financial Group | $2.83B project + $1.54B production = $4.37B |
| Employee headcount | 120 (42 Creative, 24 Strategy, 24 Production, 18 Media, 12 Account) | DIM_EMPLOYEE |
| Avg project margin 2024 | 42.9–43.1% | FACT_PROJECTS.MARGIN_PCT |
| Production on-spec rate 2024 | ~92% | AVG(ON_SPEC_FLAG) |
| Production rush rate 2024 | ~15% | AVG(RUSH_FLAG) |

These figures will be used to validate every dashboard before delivery.
