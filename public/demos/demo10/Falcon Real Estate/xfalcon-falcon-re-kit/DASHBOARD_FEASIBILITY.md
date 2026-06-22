# Falcon Real Estate — Dashboard Feasibility Matrix

**Generated:** 2026-03-27
**Database:** Apex REIT Portfolio (17 tables, 50 properties, 42 markets, 6 years)

## Summary

| # | Dashboard | Score | Status | Effort (days) |
|---|-----------|-------|--------|---------------|
| 1 | Portfolio Overview | 100% | READY | 2 |
| 2 | NOI & Financial Performance | 95% | READY | 3 |
| 3 | Occupancy Analytics | 95% | READY | 3 |
| 4 | Rent Collection & Delinquency | 95% | READY | 2 |
| 5 | Lease Management & Expiry Wall | 90% | READY | 3 |
| 6 | Maintenance Operations | 95% | READY | 3 |
| 7 | CapEx Project Tracker | 90% | READY | 2 |
| 8 | Market Benchmarking | 95% | READY | 2 |
| 9 | Property Manager Scorecard | 90% | READY | 2 |
| 10 | Tenant Intelligence | 90% | READY | 2 |
| 11 | What-If / Scenario Analysis | 65% | PARTIAL | 4 |
| 12 | Metric Definitions | 100% | READY | 1 |

**Total estimated effort: 29 days**
**11 of 12 dashboards are READY. 1 is PARTIAL.**

---

## Detailed Assessments

### 1. Portfolio Overview (Executive Landing Page)
**Score: 100% — READY**

**Primary Data Sources:** FACT_NOI, FACT_OCCUPANCY, DIM_PROPERTY, DIM_ASSET_CLASS, DIM_MARKET

**What works completely:**
- Total portfolio NOI with budget variance and YoY growth
- Portfolio-wide occupancy rate (physical and economic)
- Property count by asset class and market
- Top/bottom performing properties
- Revenue and expense breakdown
- Geographic distribution (LAT/LON available on DIM_PROPERTY)

**Gaps:** None. All data required for an executive overview exists.

**Sample Query:**
```sql
SELECT ac.ASSET_CLASS_NAME,
       COUNT(DISTINCT p.PROPERTY_ID) AS properties,
       SUM(n.TOTAL_REVENUE_USD) AS total_revenue,
       SUM(n.NOI_USD) AS total_noi,
       AVG(n.NOI_MARGIN_PCT) AS avg_noi_margin,
       AVG(o.OCCUPANCY_RATE_PCT) AS avg_occupancy
FROM FACT_NOI n
JOIN DIM_PROPERTY p ON n.PROPERTY_ID = p.PROPERTY_ID
JOIN DIM_ASSET_CLASS ac ON p.ASSET_CLASS_ID = ac.ASSET_CLASS_ID
JOIN FACT_OCCUPANCY o ON n.PROPERTY_ID = o.PROPERTY_ID AND n.MONTH_ID = o.MONTH_ID
JOIN DIM_TIME t ON n.MONTH_ID = t.DATE_ID
WHERE t.YEAR = 2025 AND p.IS_ACTIVE = TRUE
GROUP BY ac.ASSET_CLASS_NAME
```

---

### 2. NOI & Financial Performance
**Score: 95% — READY**

**Primary Data Sources:** FACT_NOI, DIM_PROPERTY, DIM_TIME, DIM_ASSET_CLASS

**What works completely:**
- Monthly NOI trend (RENTAL_REVENUE_USD, OTHER_INCOME_USD, all expense lines)
- Budget variance analysis (BUDGET_NOI_USD, NOI_VS_BUDGET_PCT)
- YoY growth comparison (PRIOR_YEAR_NOI_USD, NOI_YOY_GROWTH_PCT)
- Revenue waterfall: rental revenue → other income → total revenue → expenses → NOI
- NOI margin % trend
- NOI per sqft/unit
- Breakdowns by asset class, market, property class

**Minor gaps:**
- No debt service or FFO data (stops at NOI level, no below-the-line P&L)

**Workaround:** Dashboard focuses on operating performance. FFO/AFFO can be noted as "not available."

---

### 3. Occupancy Analytics
**Score: 95% — READY**

**Primary Data Sources:** FACT_OCCUPANCY, DIM_PROPERTY, DIM_TIME, DIM_ASSET_CLASS

**What works completely:**
- Physical occupancy rate trend
- Economic occupancy rate (accounts for concessions)
- Vacancy loss quantification (VACANCY_LOSS_USD)
- Concession tracking (CONCESSION_AMOUNT_USD)
- Average rent vs. asking rent spread
- Gross potential rent vs. effective gross income
- New leases, renewals, and move-outs per month
- Average days vacant per unit
- COVID period and rate-hike period overlays

**Minor gaps:**
- No individual unit-level vacancy data (aggregated at property level)

---

### 4. Rent Collection & Delinquency
**Score: 95% — READY**

**Primary Data Sources:** FACT_RENT_COLLECTION, DIM_TENANT, DIM_PROPERTY, DIM_TIME

**What works completely:**
- Portfolio collection rate trend
- Collection rate by asset class, market, property
- Delinquency flag analysis
- Consecutive delinquent months tracking (pre-computed)
- Payment status breakdown
- Days late distribution
- Bad debt write-off tracking
- Rent abatement tracking
- Dispute flagging
- At-risk tenant identification (consecutive_delinquent_months >= 3)

**Minor gaps:**
- No payment method detail (how rent was paid)

---

### 5. Lease Management & Expiry Wall
**Score: 90% — READY**

**Primary Data Sources:** FACT_LEASE, FACT_TENANT_RENEWAL, DIM_TENANT, DIM_PROPERTY, DIM_LEASE_TYPE

**What works completely:**
- Lease expiry wall visualization (annual rent at risk by expiry date)
- Renewal probability scoring (0-100 ML-style score)
- Lease status distribution (Active, Expired, etc.)
- Rent escalation tracking
- Free rent and TI allowance analysis
- Tenant covenant score and investment grade flags
- Renewal outcomes and rent change %
- Non-renewal reasons
- Vacancy days after expiry
- Total downtime cost of churn

**Minor gaps:**
- No lease abstract details (specific clauses, options to renew terms)
- Renewal probability is synthetic/pre-computed, not a live model

---

### 6. Maintenance Operations
**Score: 95% — READY**

**Primary Data Sources:** FACT_MAINTENANCE_WO, DIM_MAINTENANCE_CATEGORY, DIM_PROPERTY, DIM_TIME

**What works completely:**
- Reactive vs. preventive vs. planned work order mix (the key Scenario 3 metric)
- SLA breach rate tracking
- Cost analysis (estimated vs. actual)
- Days to complete distribution
- Vendor performance comparison
- Recurring work order detection (IS_RECURRING flag)
- Priority distribution
- Tenant satisfaction scores
- Category and trade breakdown
- Property-level maintenance intensity

**Minor gaps:**
- No preventive maintenance schedule (just completed work orders)

---

### 7. CapEx Project Tracker
**Score: 90% — READY**

**Primary Data Sources:** FACT_CAPEX_PROJECT, DIM_CAPEX_CATEGORY, DIM_PROPERTY

**What works completely:**
- Budget vs. actual spend tracking
- ROI analysis (projected vs. actual)
- NOI uplift measurement (projected vs. actual — the Scenario 4 metric)
- Project phase distribution
- Schedule variance (start and completion delays)
- Category breakdown
- Property-level CapEx intensity

**Minor gaps:**
- No cash flow phasing (when spend hits per month)
- In-progress 2025 projects have NULL NOI uplift (expected — not yet measurable)

---

### 8. Market Benchmarking
**Score: 95% — READY**

**Primary Data Sources:** FACT_MARKET_BENCHMARK, DIM_MARKET, DIM_ASSET_CLASS, DIM_TIME

**What works completely:**
- Portfolio vs. market occupancy comparison
- Portfolio vs. market rent comparison
- Market cap rate trends
- Market vacancy rate trends
- New supply and net absorption
- Sun Belt vs. coastal gateway analysis
- Market tier analysis
- Portfolio outperformance/underperformance identification (the Scenario 6 metric)

**Minor gaps:**
- Benchmark data is quarterly (not monthly) — charts will be quarterly

---

### 9. Property Manager Scorecard
**Score: 90% — READY**

**Primary Data Sources:** DIM_PROPERTY_MANAGER, DIM_PROPERTY, FACT_NOI, FACT_OCCUPANCY, FACT_MAINTENANCE_WO

**What works completely:**
- Manager-level occupancy averages
- Tenant satisfaction scores
- Maintenance resolution time
- Reactive maintenance % (the key Scenario 3 attribution metric)
- Portfolio count per manager
- Manager type (internal vs. third-party) comparison
- NOI performance by manager (via property join)
- Regional performance patterns

**Minor gaps:**
- No manager compensation or cost data
- Manager metrics in DIM_PROPERTY_MANAGER may be summary/snapshot rather than time-series

**Workaround:** For time-series, aggregate fact tables by manager through the property join.

---

### 10. Tenant Intelligence
**Score: 90% — READY**

**Primary Data Sources:** DIM_TENANT, FACT_LEASE, FACT_RENT_COLLECTION, FACT_TENANT_RENEWAL

**What works completely:**
- Tenant covenant score distribution
- Investment grade vs. non-investment grade mix
- Anchor tenant identification
- Industry sector breakdown
- Credit rating distribution
- Lease value by tenant
- Collection performance by tenant
- Renewal history and outcomes
- Churn cost analysis (total_downtime_cost_usd)
- Relationship tenure analysis

**Minor gaps:**
- No tenant financial statements or external credit data
- No tenant foot traffic or sales data (relevant for retail tenants)

---

### 11. What-If / Scenario Analysis
**Score: 65% — PARTIAL**

**Primary Data Sources:** FACT_NOI, FACT_OCCUPANCY, FACT_LEASE (for baseline data)

**What works completely:**
- Baseline NOI and occupancy data for modeling
- Rent escalation scenarios (RENT_ESCALATION_PCT available)
- Occupancy change impact on revenue (GROSS_POTENTIAL_RENT_USD, VACANCY_LOSS_USD)
- Budget comparison baselines (BUDGET_NOI_USD)

**What's limited:**
- No formal scenario tables or driver models
- No debt/financing data for leverage scenarios
- No market forecast data for forward projections
- No construction cost indices for CapEx modeling

**Workaround:** Build interactive sliders that adjust key drivers (occupancy %, rent growth %, expense growth %) against actual baseline data. This provides a useful sensitivity analysis tool without formal scenario tables.

**Build effort:** Higher than other dashboards due to custom JavaScript logic for interactive calculations.

---

### 12. Metric Definitions (Reference Dashboard)
**Score: 100% — READY**

**Primary Data Sources:** None (static reference content)

**What works completely:**
- All KPIs defined in METRIC_DEFINITIONS.md
- Searchable, filterable reference table
- Links to source tables and dashboards
- Formula documentation

**Gaps:** None. This is a static reference dashboard.

---

## Recommended Build Order

| Phase | Dashboard | Why first? |
|-------|-----------|------------|
| 1 | Portfolio Overview | Executive landing page, proves end-to-end data flow |
| 2 | NOI & Financial Performance | Deepest financial analytics, high stakeholder value |
| 3 | Occupancy Analytics | Core operational metric for any REIT |
| 4 | Rent Collection & Delinquency | Revenue assurance, risk management |
| 5 | Lease Management & Expiry Wall | Strategic leasing decisions |
| 6 | Maintenance Operations | Operational efficiency, cost control |
| 7 | Market Benchmarking | External context for internal performance |
| 8 | CapEx Project Tracker | Investment ROI tracking |
| 9 | Property Manager Scorecard | Accountability and performance management |
| 10 | Tenant Intelligence | Tenant relationship management |
| 11 | Metric Definitions | Reference — build alongside others |
| 12 | What-If / Scenario Analysis | Build last — requires all other data patterns |
