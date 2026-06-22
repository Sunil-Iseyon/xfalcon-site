# Falcon Real Estate — Metric Definitions

**Single source of truth for all KPI calculations across dashboards.**

---

## Financial Metrics

### Net Operating Income (NOI)
- **Formula:** `TOTAL_REVENUE_USD - TOTAL_OPERATING_EXPENSES_USD`
- **SQL:** `SELECT NOI_USD FROM FACT_NOI` (pre-computed, CHECK-constrained)
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Conditions:** Exclude inactive properties (IS_ACTIVE = TRUE)
- **Source:** FACT_NOI.NOI_USD
- **Dashboards:** Portfolio Overview, NOI & Financial, Property Manager Scorecard

### Total Revenue
- **Formula:** `RENTAL_REVENUE_USD + OTHER_INCOME_USD`
- **SQL:** `SELECT TOTAL_REVENUE_USD FROM FACT_NOI` (pre-computed)
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_NOI.TOTAL_REVENUE_USD
- **Dashboards:** Portfolio Overview, NOI & Financial

### NOI Margin %
- **Formula:** `NOI_USD / TOTAL_REVENUE_USD * 100`
- **SQL:** `SELECT NOI_MARGIN_PCT FROM FACT_NOI` (pre-computed, CHECK-constrained)
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Benchmark:** Varies by asset class — use DIM_ASSET_CLASS.NOI_MARGIN_BENCHMARK_PCT
- **Source:** FACT_NOI.NOI_MARGIN_PCT
- **Dashboards:** Portfolio Overview, NOI & Financial, Property Manager Scorecard

### NOI per Sqft/Unit
- **Formula:** `NOI_USD / LEASABLE_AREA_SQFT` (or per unit for Residential)
- **SQL:** `SELECT NOI_PER_SQFT_UNIT FROM FACT_NOI` (pre-computed)
- **Unit:** USD per sqft or per unit
- **Direction:** Higher is better
- **Source:** FACT_NOI.NOI_PER_SQFT_UNIT
- **Dashboards:** NOI & Financial, Market Benchmarking

### NOI Budget Variance %
- **Formula:** `(NOI_USD - BUDGET_NOI_USD) / BUDGET_NOI_USD * 100`
- **SQL:** `SELECT NOI_VS_BUDGET_PCT FROM FACT_NOI` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Higher is better (positive = above budget)
- **Source:** FACT_NOI.NOI_VS_BUDGET_PCT
- **Dashboards:** NOI & Financial, Portfolio Overview

### NOI YoY Growth %
- **Formula:** `(NOI_USD - PRIOR_YEAR_NOI_USD) / PRIOR_YEAR_NOI_USD * 100`
- **SQL:** `SELECT NOI_YOY_GROWTH_PCT FROM FACT_NOI` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Source:** FACT_NOI.NOI_YOY_GROWTH_PCT
- **Dashboards:** Portfolio Overview, NOI & Financial

### Operating Expense Ratio
- **Formula:** `TOTAL_OPERATING_EXPENSES_USD / TOTAL_REVENUE_USD * 100`
- **SQL:** `SELECT ROUND(TOTAL_OPERATING_EXPENSES_USD / NULLIF(TOTAL_REVENUE_USD, 0) * 100, 1) FROM FACT_NOI`
- **Unit:** Percentage (%)
- **Direction:** Lower is better
- **Source:** Derived from FACT_NOI
- **Dashboards:** NOI & Financial

---

## Occupancy Metrics

### Physical Occupancy Rate
- **Formula:** `OCCUPIED_UNITS_SQFT / TOTAL_CAPACITY * 100`
- **SQL:** `SELECT OCCUPANCY_RATE_PCT FROM FACT_OCCUPANCY` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Note:** Label varies by asset class — use DIM_ASSET_CLASS.OCCUPANCY_METRIC_LABEL
- **Source:** FACT_OCCUPANCY.OCCUPANCY_RATE_PCT
- **Dashboards:** Portfolio Overview, Occupancy Analytics, Market Benchmarking

### Economic Occupancy Rate
- **Formula:** `EFFECTIVE_GROSS_INCOME_USD / GROSS_POTENTIAL_RENT_USD * 100`
- **SQL:** `SELECT ECONOMIC_OCCUPANCY_PCT FROM FACT_OCCUPANCY` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Note:** Always <= Physical Occupancy (concessions reduce economic occupancy)
- **Source:** FACT_OCCUPANCY.ECONOMIC_OCCUPANCY_PCT
- **Dashboards:** Occupancy Analytics, NOI & Financial

### Vacancy Loss
- **Formula:** `GROSS_POTENTIAL_RENT_USD - EFFECTIVE_GROSS_INCOME_USD`
- **SQL:** `SELECT VACANCY_LOSS_USD FROM FACT_OCCUPANCY`
- **Unit:** USD ($)
- **Direction:** Lower is better
- **Source:** FACT_OCCUPANCY.VACANCY_LOSS_USD
- **Dashboards:** Occupancy Analytics

### Average Rent per Unit/Sqft
- **Formula:** Weighted average of actual rents across occupied units
- **SQL:** `SELECT AVG_RENT_PER_UNIT_SQFT FROM FACT_OCCUPANCY`
- **Unit:** USD per unit or sqft
- **Direction:** Higher is better
- **Source:** FACT_OCCUPANCY.AVG_RENT_PER_UNIT_SQFT
- **Dashboards:** Occupancy Analytics, Market Benchmarking

### Rent Spread (Actual vs. Asking)
- **Formula:** `AVG_RENT_PER_UNIT_SQFT - ASKING_RENT_PER_UNIT_SQFT`
- **SQL:** `SELECT AVG_RENT_PER_UNIT_SQFT - ASKING_RENT_PER_UNIT_SQFT FROM FACT_OCCUPANCY`
- **Unit:** USD per unit or sqft
- **Direction:** Closer to zero is better (negative means discounting)
- **Source:** Derived from FACT_OCCUPANCY
- **Dashboards:** Occupancy Analytics

### Average Days Vacant per Unit
- **Formula:** Average number of days units remain unoccupied
- **SQL:** `SELECT AVG_DAYS_VACANT_PER_UNIT FROM FACT_OCCUPANCY`
- **Unit:** Days
- **Direction:** Lower is better
- **Source:** FACT_OCCUPANCY.AVG_DAYS_VACANT_PER_UNIT
- **Dashboards:** Occupancy Analytics, Property Manager Scorecard

---

## Rent Collection Metrics

### Collection Rate
- **Formula:** `RENT_COLLECTED_USD / TOTAL_CHARGED_USD * 100`
- **SQL:** `SELECT COLLECTION_RATE_PCT FROM FACT_RENT_COLLECTION` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Higher is better (target: 98%+)
- **Source:** FACT_RENT_COLLECTION.COLLECTION_RATE_PCT
- **Dashboards:** Portfolio Overview, Rent Collection & Delinquency

### Delinquency Rate
- **Formula:** `COUNT(WHERE DELINQUENCY_FLAG = TRUE) / COUNT(*) * 100`
- **SQL:** `SELECT AVG(CASE WHEN DELINQUENCY_FLAG THEN 1.0 ELSE 0.0 END) * 100 FROM FACT_RENT_COLLECTION`
- **Unit:** Percentage (%)
- **Direction:** Lower is better
- **Source:** FACT_RENT_COLLECTION.DELINQUENCY_FLAG
- **Dashboards:** Rent Collection & Delinquency, Tenant Intelligence

### At-Risk Tenants
- **Formula:** `COUNT(DISTINCT TENANT_ID) WHERE CONSECUTIVE_DELINQUENT_MONTHS >= 3`
- **SQL:** `SELECT COUNT(DISTINCT TENANT_ID) FROM FACT_RENT_COLLECTION WHERE CONSECUTIVE_DELINQUENT_MONTHS >= 3`
- **Unit:** Count
- **Direction:** Lower is better
- **Source:** FACT_RENT_COLLECTION.CONSECUTIVE_DELINQUENT_MONTHS
- **Dashboards:** Rent Collection & Delinquency, Tenant Intelligence

### Bad Debt Write-Off
- **Formula:** `SUM(BAD_DEBT_WRITTEN_OFF_USD)`
- **Unit:** USD ($)
- **Direction:** Lower is better
- **Source:** FACT_RENT_COLLECTION.BAD_DEBT_WRITTEN_OFF_USD
- **Dashboards:** Rent Collection & Delinquency, NOI & Financial

---

## Leasing Metrics

### Weighted Average Lease Term (WALT)
- **Formula:** `SUM(LEASE_TERM_MONTHS * BASE_RENT_ANNUAL_USD) / SUM(BASE_RENT_ANNUAL_USD)`
- **SQL:** `SELECT SUM(LEASE_TERM_MONTHS * BASE_RENT_ANNUAL_USD) / NULLIF(SUM(BASE_RENT_ANNUAL_USD), 0) FROM FACT_LEASE WHERE LEASE_STATUS = 'Active'`
- **Unit:** Months
- **Direction:** Higher is better (longer commitments = more stability)
- **Source:** Derived from FACT_LEASE
- **Dashboards:** Lease Management, Portfolio Overview

### Lease Expiry Exposure (12-month)
- **Formula:** `SUM(ANNUAL_RENT_AT_EXPIRY_USD) WHERE MONTHS_TO_EXPIRY_AT_SNAPSHOT <= 12`
- **Unit:** USD ($)
- **Direction:** Context-dependent (lower = less rollover risk)
- **Source:** FACT_LEASE
- **Dashboards:** Lease Management & Expiry Wall

### Renewal Rate
- **Formula:** `COUNT(WHERE OUTCOME = 'Renewed') / COUNT(*) * 100`
- **SQL:** `SELECT AVG(CASE WHEN OUTCOME = 'Renewed' THEN 1.0 ELSE 0.0 END) * 100 FROM FACT_TENANT_RENEWAL`
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Source:** FACT_TENANT_RENEWAL.OUTCOME
- **Dashboards:** Lease Management, Tenant Intelligence

### Rent Change on Renewal
- **Formula:** `AVG(RENT_CHANGE_PCT) WHERE OUTCOME = 'Renewed'`
- **Unit:** Percentage (%)
- **Direction:** Higher is better (positive = rent growth on renewal)
- **Source:** FACT_TENANT_RENEWAL.RENT_CHANGE_PCT
- **Dashboards:** Lease Management, Tenant Intelligence

### Tenant Churn Cost
- **Formula:** `SUM(TOTAL_DOWNTIME_COST_USD) WHERE OUTCOME = 'Not Renewed'`
- **Unit:** USD ($)
- **Direction:** Lower is better
- **Note:** Includes lost rent + TI + broker commission for re-letting
- **Source:** FACT_TENANT_RENEWAL.TOTAL_DOWNTIME_COST_USD
- **Dashboards:** Lease Management, Tenant Intelligence

---

## Maintenance Metrics

### Reactive Maintenance %
- **Formula:** `COUNT(WHERE WO_TYPE = 'Reactive') / COUNT(*) * 100`
- **SQL:** `SELECT AVG(CASE WHEN WO_TYPE = 'Reactive' THEN 1.0 ELSE 0.0 END) * 100 FROM FACT_MAINTENANCE_WO`
- **Unit:** Percentage (%)
- **Direction:** Lower is better (target: < 40%)
- **Note:** Key Scenario 3 metric — reactive creep from 62% to 74% over 6 years
- **Source:** FACT_MAINTENANCE_WO.WO_TYPE
- **Dashboards:** Maintenance Operations, Property Manager Scorecard

### SLA Breach Rate
- **Formula:** `COUNT(WHERE SLA_BREACHED = TRUE) / COUNT(*) * 100`
- **Unit:** Percentage (%)
- **Direction:** Lower is better
- **Source:** FACT_MAINTENANCE_WO.SLA_BREACHED
- **Dashboards:** Maintenance Operations, Property Manager Scorecard

### Average Days to Complete
- **Formula:** `AVG(DAYS_TO_COMPLETE)`
- **Unit:** Days
- **Direction:** Lower is better
- **Source:** FACT_MAINTENANCE_WO.DAYS_TO_COMPLETE
- **Dashboards:** Maintenance Operations

### Cost Variance (Estimated vs. Actual)
- **Formula:** `(ACTUAL_COST_USD - ESTIMATED_COST_USD) / ESTIMATED_COST_USD * 100`
- **Unit:** Percentage (%)
- **Direction:** Lower is better (negative = under budget)
- **Source:** Derived from FACT_MAINTENANCE_WO
- **Dashboards:** Maintenance Operations

### Recurring Work Order Rate
- **Formula:** `COUNT(WHERE IS_RECURRING = TRUE) / COUNT(*) * 100`
- **Unit:** Percentage (%)
- **Direction:** Lower is better (high recurrence = deferred maintenance)
- **Source:** FACT_MAINTENANCE_WO.IS_RECURRING
- **Dashboards:** Maintenance Operations

---

## CapEx Metrics

### Budget Variance %
- **Formula:** `(SPENT_TO_DATE_USD - ORIGINAL_BUDGET_USD) / ORIGINAL_BUDGET_USD * 100`
- **SQL:** `SELECT BUDGET_VARIANCE_PCT FROM FACT_CAPEX_PROJECT` (pre-computed)
- **Unit:** Percentage (%)
- **Direction:** Lower is better (negative = under budget)
- **Source:** FACT_CAPEX_PROJECT.BUDGET_VARIANCE_PCT
- **Dashboards:** CapEx Project Tracker

### ROI Actual vs. Projected
- **Formula:** `ROI_ACTUAL_PCT / ROI_PROJECTED_PCT * 100` (attainment)
- **Unit:** Percentage (%)
- **Direction:** Higher is better (100% = on target)
- **Note:** Scenario 4: 12 completed projects show 35-55% of projected ROI
- **Source:** FACT_CAPEX_PROJECT.ROI_ACTUAL_PCT, ROI_PROJECTED_PCT
- **Dashboards:** CapEx Project Tracker

### NOI Uplift Attainment
- **Formula:** `NOI_UPLIFT_ACTUAL_USD / NOI_UPLIFT_PROJECTED_USD * 100`
- **Unit:** Percentage (%)
- **Direction:** Higher is better
- **Conditions:** Exclude in-progress projects (NOI_UPLIFT_ACTUAL_USD IS NULL)
- **Source:** FACT_CAPEX_PROJECT
- **Dashboards:** CapEx Project Tracker

---

## Market Metrics

### Portfolio vs. Market Occupancy Delta
- **Formula:** `PORTFOLIO_OCCUPANCY_PCT - MARKET_OCCUPANCY_PCT`
- **SQL:** `SELECT PORTFOLIO_VS_MARKET_OCC_DELTA FROM FACT_MARKET_BENCHMARK`
- **Unit:** Percentage points
- **Direction:** Higher is better (positive = outperforming market)
- **Note:** Scenario 6: delta < -8 in Phoenix, Atlanta, Denver indicates underperformance
- **Source:** FACT_MARKET_BENCHMARK.PORTFOLIO_VS_MARKET_OCC_DELTA
- **Dashboards:** Market Benchmarking

### Portfolio vs. Market Rent Delta
- **Formula:** `PORTFOLIO_AVG_RENT_PSF - MARKET_AVG_RENT_PSF`
- **SQL:** `SELECT PORTFOLIO_VS_MARKET_RENT_DELTA FROM FACT_MARKET_BENCHMARK`
- **Unit:** USD per sqft
- **Direction:** Higher is better (positive = premium over market)
- **Source:** FACT_MARKET_BENCHMARK.PORTFOLIO_VS_MARKET_RENT_DELTA
- **Dashboards:** Market Benchmarking

### Market Cap Rate
- **Formula:** External benchmark
- **SQL:** `SELECT MARKET_CAP_RATE_PCT FROM FACT_MARKET_BENCHMARK`
- **Unit:** Percentage (%)
- **Direction:** Context-dependent (lower cap rate = higher valuation)
- **Source:** FACT_MARKET_BENCHMARK.MARKET_CAP_RATE_PCT
- **Dashboards:** Market Benchmarking
