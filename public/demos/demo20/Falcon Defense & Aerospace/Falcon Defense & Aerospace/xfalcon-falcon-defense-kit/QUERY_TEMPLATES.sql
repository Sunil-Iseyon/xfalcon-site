-- ============================================================================
-- QUERY_TEMPLATES.sql — Falcon Defense & Aerospace
-- ============================================================================
-- Paste-ready SQL for every READY/PARTIAL dashboard. Each query:
--   * Applies global exclusions from GLOBAL_FILTERS.md
--   * Calculates metrics per METRIC_DEFINITIONS.md
--   * Pre-aggregates to <200 rows for client-side rendering
--   * Replaces :year, :program, :agency placeholders at runtime
-- ============================================================================


-- ============================================================================
-- DASHBOARD 1 — EXECUTIVE OVERVIEW
-- ============================================================================

-- 1.1 Headline P&L by year (5-year Compare Years data)
SELECT
  d.YEAR_NUM,
  SUM(f.BILLED_AMOUNT_USD)/1e6    AS billed_mn,
  SUM(f.RECOGNIZED_REV_USD)/1e6   AS rev_mn,
  SUM(f.INCURRED_COST_USD)/1e6    AS cost_mn,
  SUM(f.FEE_EARNED_USD)/1e6       AS fee_mn,
  SUM(f.FEE_EARNED_USD) / NULLIF(SUM(f.RECOGNIZED_REV_USD),0) * 100 AS fee_pct
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
GROUP BY 1
ORDER BY 1;

-- 1.2 Portfolio EVM (weighted by incurred cost) by year
SELECT
  d.YEAR_NUM,
  SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS portfolio_cpi,
  SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS portfolio_spi
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
GROUP BY 1
ORDER BY 1;

-- 1.3 Revenue by month for selected year (time-series)
SELECT
  d.MONTH_NUM,
  d.MONTH_NAME,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn,
  SUM(f.BILLED_AMOUNT_USD)/1e6   AS billed_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1;

-- 1.4 Top 10 programs by revenue for selected year
SELECT
  p.PROGRAM_CODE,
  p.DOMAIN,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn,
  SUM(f.FEE_EARNED_USD)/1e6     AS fee_mn,
  SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS cpi,
  SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS spi
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_PROGRAM p ON f.PROGRAM_KEY = p.PROGRAM_KEY
JOIN DIM_DATE    d ON f.DATE_KEY    = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 3 DESC;

-- 1.5 Revenue by agency for selected year
SELECT
  a.AGENCY_TYPE,
  a.AGENCY_SHORT,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_CUSTOMER_AGENCY a ON f.AGENCY_KEY = a.AGENCY_KEY
JOIN DIM_DATE            d ON f.DATE_KEY   = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 3 DESC;

-- 1.6 Counts for KPI cards
SELECT
  (SELECT COUNT(*) FROM DIM_CONTRACT WHERE PERIOD_OF_PERF_END >= CURRENT_DATE) AS active_contracts,
  (SELECT COUNT(*) FROM DIM_PROGRAM WHERE IS_ACTIVE = TRUE)                    AS active_programs,
  (SELECT COUNT(*) FROM DIM_EMPLOYEE WHERE IS_ACTIVE = TRUE)                   AS active_employees,
  (SELECT COUNT(*) FROM DIM_SUPPLIER WHERE IS_ACTIVE = TRUE)                   AS active_suppliers;


-- ============================================================================
-- DASHBOARD 2 — PROGRAM FINANCIAL PERFORMANCE (Budget vs Actual vs Forecast)
-- REQUIRED FILTER: BUDGET_VERSION = 'Revised'
-- ============================================================================

-- 2.1 Budget vs Actual vs Forecast by program for selected year
SELECT
  p.PROGRAM_CODE,
  p.DOMAIN,
  SUM(b.BUDGET_USD)/1e6    AS budget_mn,
  SUM(b.ACTUAL_USD)/1e6    AS actual_mn,
  SUM(b.FORECAST_USD)/1e6  AS forecast_mn,
  SUM(b.ACTUAL_USD - b.BUDGET_USD)/1e6 AS variance_mn,
  SUM(b.ACTUAL_USD - b.BUDGET_USD) / NULLIF(SUM(b.BUDGET_USD),0) * 100 AS variance_pct
FROM FACT_PROGRAM_BUDGET b
JOIN DIM_PROGRAM p ON b.PROGRAM_KEY = p.PROGRAM_KEY
JOIN DIM_DATE    d ON b.DATE_KEY    = d.DATE_KEY
WHERE b.BUDGET_VERSION = 'Revised'
  AND d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 3 DESC;

-- 2.2 Cost-element breakdown for selected year
SELECT
  ce.ELEMENT_CATEGORY,
  ce.ELEMENT_NAME,
  ce.IS_DIRECT,
  SUM(b.BUDGET_USD)/1e6 AS budget_mn,
  SUM(b.ACTUAL_USD)/1e6 AS actual_mn,
  SUM(b.ACTUAL_USD - b.BUDGET_USD)/1e6 AS variance_mn
FROM FACT_PROGRAM_BUDGET b
JOIN DIM_COST_ELEMENT ce ON b.COST_ELEMENT_KEY = ce.COST_ELEMENT_KEY
JOIN DIM_DATE         d  ON b.DATE_KEY         = d.DATE_KEY
WHERE b.BUDGET_VERSION = 'Revised'
  AND d.YEAR_NUM = :year
GROUP BY 1, 2, 3
ORDER BY 4 DESC;

-- 2.3 Monthly spend cadence (budget vs actual) for selected year
SELECT
  d.MONTH_NUM,
  d.MONTH_NAME,
  SUM(b.BUDGET_USD)/1e6 AS budget_mn,
  SUM(b.ACTUAL_USD)/1e6 AS actual_mn
FROM FACT_PROGRAM_BUDGET b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE b.BUDGET_VERSION = 'Revised'
  AND d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1;

-- 2.4 Baseline Shift — Original vs Revised (the ONLY chart that unfilters BUDGET_VERSION)
SELECT
  p.PROGRAM_CODE,
  SUM(CASE WHEN b.BUDGET_VERSION = 'Original' THEN b.BUDGET_USD ELSE 0 END)/1e6 AS original_mn,
  SUM(CASE WHEN b.BUDGET_VERSION = 'Revised'  THEN b.BUDGET_USD ELSE 0 END)/1e6 AS revised_mn
FROM FACT_PROGRAM_BUDGET b
JOIN DIM_PROGRAM p ON b.PROGRAM_KEY = p.PROGRAM_KEY
GROUP BY 1
ORDER BY 3 DESC;


-- ============================================================================
-- DASHBOARD 3 — EARNED VALUE MANAGEMENT (CPI / SPI)
-- ============================================================================

-- 3.1 Program CPI × SPI for selected year (for scatter + table)
SELECT
  p.PROGRAM_CODE,
  p.DOMAIN,
  SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS cpi,
  SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS spi,
  SUM(f.INCURRED_COST_USD)/1e6 AS incurred_mn,
  CASE
    WHEN SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) >= 1.0
     AND SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) >= 1.0 THEN 'Green'
    WHEN SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) >= 0.95
     AND SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) >= 0.95 THEN 'Yellow'
    ELSE 'Red'
  END AS health_tier
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_PROGRAM p ON f.PROGRAM_KEY = p.PROGRAM_KEY
JOIN DIM_DATE    d ON f.DATE_KEY    = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 3 ASC;

-- 3.2 Monthly CPI/SPI trend for selected year
SELECT
  d.MONTH_NUM,
  d.MONTH_NAME,
  SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS cpi,
  SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS spi
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1;

-- 3.3 Top 20 at-risk contracts (lowest CPI)
SELECT
  c.CONTRACT_NUMBER,
  c.CONTRACT_TITLE,
  c.CONTRACT_TYPE,
  p.PROGRAM_CODE,
  SUM(f.INCURRED_COST_USD)/1e6 AS incurred_mn,
  SUM(f.CPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS cpi,
  SUM(f.SPI * f.INCURRED_COST_USD) / NULLIF(SUM(f.INCURRED_COST_USD),0) AS spi,
  SUM(f.COST_AT_COMPLETION)/1e6 AS eac_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_CONTRACT c ON f.CONTRACT_KEY = c.CONTRACT_KEY
JOIN DIM_PROGRAM  p ON f.PROGRAM_KEY  = p.PROGRAM_KEY
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2, 3, 4
HAVING SUM(f.INCURRED_COST_USD) > 0
ORDER BY cpi ASC
LIMIT 20;


-- ============================================================================
-- DASHBOARD 4 — BILLING vs INCURRED COST RECONCILIATION
-- ============================================================================

-- 4.1 Monthly billing lag (selected year)
SELECT
  d.MONTH_NUM,
  d.MONTH_NAME,
  SUM(f.BILLED_AMOUNT_USD)/1e6  AS billed_mn,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS recognized_mn,
  SUM(f.INCURRED_COST_USD)/1e6  AS incurred_mn,
  SUM(f.RECOGNIZED_REV_USD - f.BILLED_AMOUNT_USD)/1e6 AS lag_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1;

-- 4.2 Revenue type mix for selected year
SELECT
  f.REVENUE_TYPE,
  SUM(f.BILLED_AMOUNT_USD)/1e6  AS billed_mn,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS recognized_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1
ORDER BY 2 DESC;

-- 4.3 FY-end September surge indicator (all 5 years)
SELECT
  d.YEAR_NUM,
  d.MONTH_NUM,
  SUM(f.BILLED_AMOUNT_USD)/1e6 AS billed_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.MONTH_NUM IN (8, 9, 10)
GROUP BY 1, 2
ORDER BY 1, 2;


-- ============================================================================
-- DASHBOARD 5 — AGENCY & PROGRAM REVENUE ROLL-UPS
-- ============================================================================

-- 5.1 Agency ranking for selected year
SELECT
  a.AGENCY_TYPE,
  a.AGENCY_SHORT,
  a.AGENCY_NAME,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn,
  SUM(f.FEE_EARNED_USD)/1e6     AS fee_mn,
  COUNT(DISTINCT f.CONTRACT_KEY) AS contracts
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_CUSTOMER_AGENCY a ON f.AGENCY_KEY = a.AGENCY_KEY
JOIN DIM_DATE            d ON f.DATE_KEY   = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2, 3
ORDER BY 4 DESC;

-- 5.2 Domain mix for selected year
SELECT
  p.DOMAIN,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_PROGRAM p ON f.PROGRAM_KEY = p.PROGRAM_KEY
JOIN DIM_DATE    d ON f.DATE_KEY    = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1
ORDER BY 2 DESC;

-- 5.3 Revenue type × agency heatmap for selected year
SELECT
  a.AGENCY_SHORT,
  f.REVENUE_TYPE,
  SUM(f.RECOGNIZED_REV_USD)/1e6 AS rev_mn
FROM FACT_CONTRACT_REVENUE f
JOIN DIM_CUSTOMER_AGENCY a ON f.AGENCY_KEY = a.AGENCY_KEY
JOIN DIM_DATE            d ON f.DATE_KEY   = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1, 2;


-- ============================================================================
-- DASHBOARD 6 — SUPPLY CHAIN PERFORMANCE
-- REQUIRED FILTER (supplier view): s.IS_ACTIVE = TRUE
-- ============================================================================

-- 6.1 Supplier tier breakdown (active suppliers only)
SELECT
  s.SUPPLIER_TIER,
  COUNT(DISTINCT s.SUPPLIER_KEY) AS suppliers,
  AVG(s.ON_TIME_DELIVERY_PCT)    AS avg_otd_pct,
  AVG(s.QUALITY_RATING)          AS avg_quality,
  AVG(CASE WHEN s.DCAA_APPROVED THEN 1.0 ELSE 0.0 END) * 100 AS dcaa_pct
FROM DIM_SUPPLIER s
WHERE s.IS_ACTIVE = TRUE
GROUP BY 1
ORDER BY 1;

-- 6.2 OTD actual performance by tier × year (from fact)
SELECT
  d.YEAR_NUM,
  s.SUPPLIER_TIER,
  COUNT(*) AS pos,
  AVG(CASE WHEN f.ON_TIME_FLAG THEN 1.0 ELSE 0.0 END) * 100 AS otd_pct,
  AVG(f.FIRST_PASS_YIELD) * 100 AS yield_pct
FROM FACT_PARTS_SUPPLY f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_KEY = s.SUPPLIER_KEY
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
WHERE s.IS_ACTIVE = TRUE
GROUP BY 1, 2
ORDER BY 1, 2;

-- 6.3 Sole-source concentration by category (selected year)
SELECT
  p.PART_CATEGORY,
  SUM(f.TOTAL_PO_VALUE_USD)/1e6 AS total_spend_mn,
  SUM(CASE WHEN p.IS_SOLE_SOURCE THEN f.TOTAL_PO_VALUE_USD ELSE 0 END)/1e6 AS sole_source_mn,
  SUM(CASE WHEN p.IS_SOLE_SOURCE THEN f.TOTAL_PO_VALUE_USD ELSE 0 END) / NULLIF(SUM(f.TOTAL_PO_VALUE_USD),0) * 100 AS sole_source_pct
FROM FACT_PARTS_SUPPLY f
JOIN DIM_PARTS p ON f.PART_KEY = p.PART_KEY
JOIN DIM_DATE  d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1
ORDER BY 2 DESC;

-- 6.4 Top 20 at-risk active suppliers (low OTD + high volume)
SELECT
  s.SUPPLIER_CODE,
  s.SUPPLIER_NAME,
  s.SUPPLIER_TIER,
  s.SUPPLIER_TYPE,
  s.QUALITY_RATING,
  s.ON_TIME_DELIVERY_PCT,
  SUM(f.TOTAL_PO_VALUE_USD)/1e6 AS spend_mn,
  SUM(f.DEFECT_QTY) AS defects
FROM DIM_SUPPLIER s
LEFT JOIN FACT_PARTS_SUPPLY f ON s.SUPPLIER_KEY = f.SUPPLIER_KEY
LEFT JOIN DIM_DATE          d ON f.DATE_KEY     = d.DATE_KEY
WHERE s.IS_ACTIVE = TRUE
  AND (d.YEAR_NUM = :year OR d.YEAR_NUM IS NULL)
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY s.ON_TIME_DELIVERY_PCT ASC, spend_mn DESC
LIMIT 20;

-- 6.5 PPV trend by year
SELECT
  d.YEAR_NUM,
  SUM((f.UNIT_PRICE_USD - p.UNIT_COST_USD) * f.QUANTITY_ORDERED)/1e6 AS ppv_mn
FROM FACT_PARTS_SUPPLY f
JOIN DIM_PARTS p ON f.PART_KEY = p.PART_KEY
JOIN DIM_DATE  d ON f.DATE_KEY = d.DATE_KEY
GROUP BY 1
ORDER BY 1;


-- ============================================================================
-- DASHBOARD 7 — LABOR UTILIZATION & WORKFORCE
-- REQUIRED FILTER (dim): e.IS_ACTIVE = TRUE
-- ============================================================================

-- 7.1 Weekly utilization trend for selected year
SELECT
  d.MONTH_NUM,
  d.MONTH_NAME,
  SUM(f.HOURS_DIRECT)   AS direct_hrs,
  SUM(f.HOURS_INDIRECT) AS indirect_hrs,
  SUM(f.HOURS_OVERTIME) AS ot_hrs,
  SUM(f.HOURS_DIRECT) / NULLIF(SUM(f.HOURS_DIRECT) + SUM(f.HOURS_INDIRECT),0) * 100 AS util_pct
FROM FACT_LABOR_HOURS f
JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM = :year
GROUP BY 1, 2
ORDER BY 1;

-- 7.2 Utilization by job family (active employees)
SELECT
  e.JOB_FAMILY,
  COUNT(DISTINCT e.EMPLOYEE_KEY) AS headcount,
  SUM(f.HOURS_DIRECT)            AS direct_hrs,
  SUM(f.HOURS_INDIRECT)          AS indirect_hrs,
  SUM(f.HOURS_DIRECT) / NULLIF(SUM(f.HOURS_DIRECT) + SUM(f.HOURS_INDIRECT),0) * 100 AS util_pct,
  AVG(e.STANDARD_RATE_USD)       AS avg_rate
FROM FACT_LABOR_HOURS f
JOIN DIM_EMPLOYEE e ON f.EMPLOYEE_KEY = e.EMPLOYEE_KEY
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
WHERE e.IS_ACTIVE = TRUE
  AND d.YEAR_NUM = :year
GROUP BY 1
ORDER BY util_pct DESC;

-- 7.3 Clearance-level capacity
SELECT
  e.CLEARANCE_LEVEL,
  COUNT(DISTINCT e.EMPLOYEE_KEY) AS headcount,
  SUM(f.HOURS_DIRECT)            AS direct_hrs,
  SUM(CASE WHEN f.IS_CLASSIFIED_WORK THEN f.HOURS_DIRECT ELSE 0 END) AS classified_hrs
FROM FACT_LABOR_HOURS f
JOIN DIM_EMPLOYEE e ON f.EMPLOYEE_KEY = e.EMPLOYEE_KEY
JOIN DIM_DATE     d ON f.DATE_KEY     = d.DATE_KEY
WHERE e.IS_ACTIVE = TRUE
  AND d.YEAR_NUM = :year
GROUP BY 1
ORDER BY 2 DESC;

-- 7.4 Facility capacity vs charge hours
SELECT
  fc.FACILITY_CODE,
  fc.FACILITY_NAME,
  fc.FACILITY_TYPE,
  fc.HEADCOUNT_CAPACITY,
  COUNT(DISTINCT e.EMPLOYEE_KEY) AS headcount,
  SUM(f.HOURS_DIRECT)            AS direct_hrs,
  SUM(f.HOURS_OVERTIME)          AS ot_hrs
FROM DIM_FACILITY fc
LEFT JOIN DIM_EMPLOYEE e ON fc.FACILITY_KEY = e.FACILITY_KEY AND e.IS_ACTIVE = TRUE
LEFT JOIN FACT_LABOR_HOURS f ON e.EMPLOYEE_KEY = f.EMPLOYEE_KEY
LEFT JOIN DIM_DATE d ON f.DATE_KEY = d.DATE_KEY
WHERE fc.IS_ACTIVE = TRUE
  AND (d.YEAR_NUM = :year OR d.YEAR_NUM IS NULL)
GROUP BY 1, 2, 3, 4
ORDER BY 6 DESC;


-- ============================================================================
-- DASHBOARD 8 — CONTRACT PORTFOLIO HEALTH
-- ============================================================================

-- 8.1 Contract type mix (active contracts)
SELECT
  c.CONTRACT_TYPE,
  COUNT(*)                AS contracts,
  SUM(c.CEILING_VALUE_MN) AS ceiling_mn,
  SUM(c.FUNDED_VALUE_MN)  AS funded_mn,
  SUM(c.FUNDED_VALUE_MN) / NULLIF(SUM(c.CEILING_VALUE_MN),0) * 100 AS funded_pct
FROM DIM_CONTRACT c
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE
GROUP BY 1
ORDER BY 2 DESC;

-- 8.2 Period-of-performance expiry radar
SELECT
  CASE
    WHEN c.PERIOD_OF_PERF_END < CURRENT_DATE                                         THEN '0. Expired'
    WHEN c.PERIOD_OF_PERF_END < CURRENT_DATE + INTERVAL '90 days'                    THEN '1. 0–90 days'
    WHEN c.PERIOD_OF_PERF_END < CURRENT_DATE + INTERVAL '180 days'                   THEN '2. 90–180 days'
    WHEN c.PERIOD_OF_PERF_END < CURRENT_DATE + INTERVAL '365 days'                   THEN '3. 180–365 days'
    ELSE '4. 365+ days'
  END                     AS expiry_bucket,
  COUNT(*)                AS contracts,
  SUM(c.FUNDED_VALUE_MN)  AS funded_mn
FROM DIM_CONTRACT c
GROUP BY 1
ORDER BY 1;

-- 8.3 Set-aside mix
SELECT
  COALESCE(c.SET_ASIDE, 'Unrestricted') AS set_aside,
  COUNT(*)                AS contracts,
  SUM(c.FUNDED_VALUE_MN)  AS funded_mn
FROM DIM_CONTRACT c
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE
GROUP BY 1
ORDER BY 2 DESC;

-- 8.4 Vehicle mix
SELECT
  c.VEHICLE,
  COUNT(*)                AS contracts,
  SUM(c.FUNDED_VALUE_MN)  AS funded_mn
FROM DIM_CONTRACT c
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE
GROUP BY 1
ORDER BY 2 DESC;

-- 8.5 Prime vs Sub mix and Subcontractor %
SELECT
  c.IS_PRIME,
  COUNT(*)                    AS contracts,
  AVG(c.SUBCONTRACTOR_PCT)    AS avg_sub_pct,
  SUM(c.FUNDED_VALUE_MN)      AS funded_mn
FROM DIM_CONTRACT c
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE
GROUP BY 1
ORDER BY 2 DESC;

-- 8.6 Ceiling vs Funded vs Incurred waterfall
SELECT
  c.CONTRACT_TYPE,
  SUM(c.CEILING_VALUE_MN)*1e6    AS ceiling_usd,
  SUM(c.FUNDED_VALUE_MN)*1e6     AS funded_usd,
  SUM(inc.incurred)              AS incurred_usd
FROM DIM_CONTRACT c
LEFT JOIN (
  SELECT CONTRACT_KEY, SUM(INCURRED_COST_USD) AS incurred
  FROM FACT_CONTRACT_REVENUE
  GROUP BY CONTRACT_KEY
) inc ON c.CONTRACT_KEY = inc.CONTRACT_KEY
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE
GROUP BY 1
ORDER BY 2 DESC;
