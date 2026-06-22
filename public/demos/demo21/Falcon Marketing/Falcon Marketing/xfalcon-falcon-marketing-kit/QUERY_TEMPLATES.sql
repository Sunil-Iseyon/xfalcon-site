-- =====================================================================
-- Falcon Marketing — Query Templates
-- Connector: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__
-- All queries pre-aggregate to <200 rows for embed in Chart.js dashboards.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXECUTIVE OVERVIEW — Total Agency Revenue, YoY trend
-- ---------------------------------------------------------------------
-- 1a. Annual revenue (project + production + media + agency fees) - 7 rows
SELECT d.YEAR_NUM,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS proj_billed
FROM FACT_PROJECTS p JOIN DIM_DATE d ON p.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

SELECT d.YEAR_NUM,
       SUM(j.BILLED_AMOUNT)::numeric(18,0) AS prod_billed
FROM FACT_PRODUCTION_JOBS j JOIN DIM_DATE d ON j.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

SELECT d.YEAR_NUM,
       SUM(f.SPEND)::numeric(18,0) AS media_spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS attributed_rev,
       SUM(f.IMPRESSIONS) AS impressions, SUM(f.CLICKS) AS clicks, SUM(f.CONVERSIONS) AS conversions
FROM FACT_CAMPAIGN_PERFORMANCE f JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

SELECT d.YEAR_NUM,
       SUM(m.PLANNED_SPEND)::numeric(18,0) AS planned,
       SUM(m.ACTUAL_SPEND)::numeric(18,0) AS actual,
       SUM(m.AGENCY_FEE_AMOUNT)::numeric(18,0) AS fee
FROM FACT_MEDIA_SPEND m JOIN DIM_DATE d ON m.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

-- 1b. Monthly trend 2023 vs 2024 (24 rows)
SELECT d.YEAR_NUM, d.MONTH_NUM,
       SUM(SPEND)::numeric(18,0) AS spend,
       SUM(REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue
FROM FACT_CAMPAIGN_PERFORMANCE f JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
WHERE d.YEAR_NUM IN (2023,2024)
GROUP BY d.YEAR_NUM, d.MONTH_NUM ORDER BY d.YEAR_NUM, d.MONTH_NUM;

-- ---------------------------------------------------------------------
-- 2. CLIENT PORTFOLIO
-- ---------------------------------------------------------------------
-- 2a. Top clients (project billed by year) — 19 clients × 7 years = 133 rows
SELECT d.YEAR_NUM, c.CLIENT_NAME, c.INDUSTRY, c.ACCOUNT_TIER, c.SEGMENT,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS proj_billed,
       COUNT(DISTINCT p.PROJECT_CODE) AS projects
FROM FACT_PROJECTS p
JOIN DIM_CLIENT c ON p.CLIENT_KEY=c.CLIENT_KEY
JOIN DIM_DATE d ON p.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, c.CLIENT_NAME, c.INDUSTRY, c.ACCOUNT_TIER, c.SEGMENT
ORDER BY d.YEAR_NUM, proj_billed DESC;

-- 2b. Production billings by client x year (133 rows)
SELECT d.YEAR_NUM, c.CLIENT_NAME,
       SUM(j.BILLED_AMOUNT)::numeric(18,0) AS prod_billed,
       COUNT(DISTINCT j.JOB_CODE) AS jobs
FROM FACT_PRODUCTION_JOBS j
JOIN DIM_CLIENT c ON j.CLIENT_KEY=c.CLIENT_KEY
JOIN DIM_DATE d ON j.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, c.CLIENT_NAME
ORDER BY d.YEAR_NUM, prod_billed DESC;

-- 2c. Client master (20 rows, all dims)
SELECT CLIENT_KEY, CLIENT_NAME, INDUSTRY, SEGMENT, ANNUAL_REVENUE_BAND,
       PRIMARY_STATE, CLIENT_SINCE, IS_ACTIVE, ACCOUNT_TIER
FROM DIM_CLIENT ORDER BY CLIENT_NAME;

-- ---------------------------------------------------------------------
-- 3. CAMPAIGN PERFORMANCE
-- ---------------------------------------------------------------------
-- 3a. By campaign type x year (49 rows max)
SELECT d.YEAR_NUM, camp.CAMPAIGN_TYPE,
       COUNT(DISTINCT camp.CAMPAIGN_KEY) AS campaigns,
       SUM(f.IMPRESSIONS) AS impressions,
       SUM(f.CLICKS) AS clicks,
       SUM(f.CONVERSIONS) AS conversions,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue
FROM FACT_CAMPAIGN_PERFORMANCE f
JOIN DIM_CAMPAIGN camp ON f.CAMPAIGN_KEY=camp.CAMPAIGN_KEY
JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, camp.CAMPAIGN_TYPE
ORDER BY d.YEAR_NUM, spend DESC;

-- 3b. Top 30 campaigns 2024 by ROAS (with min spend filter)
SELECT camp.CAMPAIGN_NAME, camp.CAMPAIGN_TYPE, camp.STATUS,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue,
       (SUM(f.REVENUE_ATTRIBUTED)/NULLIF(SUM(f.SPEND),0))::numeric(10,2) AS roas
FROM FACT_CAMPAIGN_PERFORMANCE f
JOIN DIM_CAMPAIGN camp ON f.CAMPAIGN_KEY=camp.CAMPAIGN_KEY
JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
WHERE d.YEAR_NUM=2024
GROUP BY camp.CAMPAIGN_NAME, camp.CAMPAIGN_TYPE, camp.STATUS
HAVING SUM(f.SPEND) > 100000
ORDER BY roas DESC LIMIT 30;

-- ---------------------------------------------------------------------
-- 4. MEDIA SPEND MANAGEMENT
-- ---------------------------------------------------------------------
-- 4a. Planned vs actual by month x year
SELECT d.YEAR_NUM, d.MONTH_NUM,
       SUM(m.PLANNED_SPEND)::numeric(18,0) AS planned,
       SUM(m.ACTUAL_SPEND)::numeric(18,0) AS actual,
       SUM(m.AGENCY_FEE_AMOUNT)::numeric(18,0) AS agency_fee
FROM FACT_MEDIA_SPEND m JOIN DIM_DATE d ON m.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, d.MONTH_NUM ORDER BY d.YEAR_NUM, d.MONTH_NUM;

-- 4b. Channel CPM benchmarking (15 channels)
SELECT ch.CHANNEL_CATEGORY, ch.CHANNEL_NAME, ch.TYPICAL_CPM,
       AVG(m.CPM_ACTUAL)::numeric(10,2) AS realized_cpm,
       SUM(m.ACTUAL_SPEND)::numeric(18,0) AS spend_2024
FROM FACT_MEDIA_SPEND m
JOIN DIM_CHANNEL ch ON m.CHANNEL_KEY=ch.CHANNEL_KEY
JOIN DIM_DATE d ON m.DATE_KEY=d.DATE_KEY
WHERE d.YEAR_NUM=2024
GROUP BY ch.CHANNEL_CATEGORY, ch.CHANNEL_NAME, ch.TYPICAL_CPM
ORDER BY spend_2024 DESC;

-- ---------------------------------------------------------------------
-- 5. PRODUCTION OPERATIONS
-- ---------------------------------------------------------------------
-- 5a. Annual operations
SELECT d.YEAR_NUM,
       COUNT(DISTINCT j.JOB_CODE) AS jobs,
       SUM(j.QUANTITY) AS units,
       SUM(j.TOTAL_COST)::numeric(18,0) AS total_cost,
       SUM(j.BILLED_AMOUNT)::numeric(18,0) AS billed,
       AVG(j.TURNAROUND_DAYS)::numeric(10,2) AS avg_turn,
       AVG(j.RUSH_FLAG::numeric)::numeric(10,3) AS rush_rate,
       AVG(j.ON_SPEC_FLAG::numeric)::numeric(10,3) AS on_spec_rate,
       AVG(j.REVISION_COUNT::numeric)::numeric(10,2) AS avg_revisions
FROM FACT_PRODUCTION_JOBS j JOIN DIM_DATE d ON j.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

-- 5b. By job type x year (140 rows max)
SELECT d.YEAR_NUM, jt.JOB_CATEGORY, jt.JOB_TYPE_NAME, jt.COMPLEXITY,
       COUNT(DISTINCT j.JOB_CODE) AS jobs,
       SUM(j.BILLED_AMOUNT)::numeric(18,0) AS billed,
       AVG(j.TURNAROUND_DAYS)::numeric(10,1) AS avg_turn,
       AVG(j.RUSH_FLAG::numeric)::numeric(10,3) AS rush_rate,
       AVG(j.ON_SPEC_FLAG::numeric)::numeric(10,3) AS on_spec_rate
FROM FACT_PRODUCTION_JOBS j
JOIN DIM_JOB_TYPE jt ON j.JOB_TYPE_KEY=jt.JOB_TYPE_KEY
JOIN DIM_DATE d ON j.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, jt.JOB_CATEGORY, jt.JOB_TYPE_NAME, jt.COMPLEXITY
ORDER BY d.YEAR_NUM, billed DESC;

-- ---------------------------------------------------------------------
-- 6. PROJECT MARGIN & PROFITABILITY
-- ---------------------------------------------------------------------
-- 6a. Annual project metrics (7 rows)
SELECT d.YEAR_NUM,
       COUNT(DISTINCT p.PROJECT_CODE) AS projects,
       SUM(p.SOW_VALUE)::numeric(18,0) AS sow,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS billed,
       SUM(p.HOURS_ESTIMATED)::numeric(18,0) AS hrs_est,
       SUM(p.HOURS_ACTUAL)::numeric(18,0) AS hrs_actual,
       AVG(p.MARGIN_PCT)::numeric(10,3) AS margin,
       AVG(p.ON_TIME_FLAG::numeric)::numeric(10,3) AS on_time,
       AVG(p.ON_BUDGET_FLAG::numeric)::numeric(10,3) AS on_budget
FROM FACT_PROJECTS p JOIN DIM_DATE d ON p.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY d.YEAR_NUM;

-- 6b. By service line (105 rows)
SELECT d.YEAR_NUM, s.SERVICE_CATEGORY, s.SERVICE_LINE,
       COUNT(DISTINCT p.PROJECT_CODE) AS projects,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS billed,
       SUM(p.HOURS_ACTUAL)::numeric(18,0) AS hours,
       AVG(p.MARGIN_PCT)::numeric(10,3) AS avg_margin,
       AVG(p.ON_TIME_FLAG::numeric)::numeric(10,3) AS on_time
FROM FACT_PROJECTS p
JOIN DIM_SERVICE_LINE s ON p.SERVICE_LINE_KEY=s.SERVICE_LINE_KEY
JOIN DIM_DATE d ON p.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, s.SERVICE_CATEGORY, s.SERVICE_LINE
ORDER BY d.YEAR_NUM, billed DESC;

-- ---------------------------------------------------------------------
-- 7. EMPLOYEE UTILIZATION
-- ---------------------------------------------------------------------
-- 7a. By department x year (35 rows)
SELECT d.YEAR_NUM, e.DEPARTMENT,
       COUNT(DISTINCT e.EMPLOYEE_KEY) AS headcount,
       SUM(p.HOURS_ACTUAL)::numeric(18,0) AS hours,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS billed,
       AVG(p.MARGIN_PCT)::numeric(10,3) AS avg_margin
FROM FACT_PROJECTS p
JOIN DIM_EMPLOYEE e ON p.EMPLOYEE_KEY=e.EMPLOYEE_KEY
JOIN DIM_DATE d ON p.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, e.DEPARTMENT
ORDER BY d.YEAR_NUM, hours DESC;

-- 7b. By seniority x dept (40 rows)
SELECT e.DEPARTMENT, e.SENIORITY,
       COUNT(DISTINCT e.EMPLOYEE_KEY) AS headcount,
       AVG(e.COST_RATE)::numeric(10,2) AS avg_cost_rate,
       AVG(e.BILL_RATE)::numeric(10,2) AS avg_bill_rate,
       SUM(p.HOURS_ACTUAL)::numeric(18,0) AS hours_2024
FROM DIM_EMPLOYEE e
LEFT JOIN FACT_PROJECTS p ON p.EMPLOYEE_KEY=e.EMPLOYEE_KEY
LEFT JOIN DIM_DATE d ON d.DATE_KEY=p.DATE_KEY AND d.YEAR_NUM=2024
WHERE e.IS_ACTIVE=1
GROUP BY e.DEPARTMENT, e.SENIORITY
ORDER BY e.DEPARTMENT, e.SENIORITY;

-- ---------------------------------------------------------------------
-- 8. GEOGRAPHIC PERFORMANCE
-- ---------------------------------------------------------------------
-- 8a. Region x tier x year
SELECT d.YEAR_NUM, g.REGION, g.TIER,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue,
       SUM(f.IMPRESSIONS) AS impressions
FROM FACT_CAMPAIGN_PERFORMANCE f
JOIN DIM_GEOGRAPHY g ON f.GEO_KEY=g.GEO_KEY
JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, g.REGION, g.TIER
ORDER BY d.YEAR_NUM, spend DESC;

-- 8b. DMA-level (40 markets x 1 year)
SELECT g.DMA_NAME, g.STATE_CODE, g.CITY, g.REGION, g.TIER,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue
FROM FACT_CAMPAIGN_PERFORMANCE f
JOIN DIM_GEOGRAPHY g ON f.GEO_KEY=g.GEO_KEY
JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
WHERE d.YEAR_NUM=2024
GROUP BY g.DMA_NAME, g.STATE_CODE, g.CITY, g.REGION, g.TIER
ORDER BY spend DESC;

-- ---------------------------------------------------------------------
-- 9. CHANNEL MIX & ROAS
-- ---------------------------------------------------------------------
-- 9a. Channel x year (105 rows for 7 years)
SELECT d.YEAR_NUM, ch.CHANNEL_CATEGORY, ch.CHANNEL_NAME, ch.CHANNEL_TYPE, ch.IS_DIGITAL,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue,
       SUM(f.IMPRESSIONS) AS impressions,
       SUM(f.CLICKS) AS clicks,
       SUM(f.CONVERSIONS) AS conversions
FROM FACT_CAMPAIGN_PERFORMANCE f
JOIN DIM_CHANNEL ch ON f.CHANNEL_KEY=ch.CHANNEL_KEY
JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM, ch.CHANNEL_CATEGORY, ch.CHANNEL_NAME, ch.CHANNEL_TYPE, ch.IS_DIGITAL
ORDER BY d.YEAR_NUM, spend DESC;

-- ---------------------------------------------------------------------
-- 10. SERVICE LINE MIX (uses 6b above)
-- ---------------------------------------------------------------------
-- 10a. Hourly rate analysis
SELECT s.SERVICE_CATEGORY, s.SERVICE_LINE, s.HOURLY_RATE_LOW, s.HOURLY_RATE_HIGH,
       SUM(p.BILLED_AMOUNT)::numeric(18,0) AS billed_2024,
       SUM(p.HOURS_ACTUAL)::numeric(18,0) AS hours_2024,
       (SUM(p.BILLED_AMOUNT)/NULLIF(SUM(p.HOURS_ACTUAL),0))::numeric(10,2) AS realized_rate
FROM DIM_SERVICE_LINE s
LEFT JOIN FACT_PROJECTS p ON p.SERVICE_LINE_KEY=s.SERVICE_LINE_KEY
LEFT JOIN DIM_DATE d ON d.DATE_KEY=p.DATE_KEY AND d.YEAR_NUM=2024
GROUP BY s.SERVICE_CATEGORY, s.SERVICE_LINE, s.HOURLY_RATE_LOW, s.HOURLY_RATE_HIGH
ORDER BY billed_2024 DESC;

-- ---------------------------------------------------------------------
-- 11. Q4 2024 QBR
-- ---------------------------------------------------------------------
-- 11a. Q4 2024 vs Q4 2023 quarterly comparison
SELECT d.YEAR_NUM, d.QUARTER_NUM,
       SUM(f.SPEND)::numeric(18,0) AS spend,
       SUM(f.REVENUE_ATTRIBUTED)::numeric(18,0) AS revenue,
       COUNT(DISTINCT f.CAMPAIGN_KEY) AS campaigns
FROM FACT_CAMPAIGN_PERFORMANCE f JOIN DIM_DATE d ON f.DATE_KEY=d.DATE_KEY
WHERE d.YEAR_NUM IN (2023,2024) AND d.QUARTER_NUM=4
GROUP BY d.YEAR_NUM, d.QUARTER_NUM ORDER BY d.YEAR_NUM;
