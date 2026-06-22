-- ======================================================================
-- Falcon Semiconductor — Query Templates
-- All queries apply GLOBAL FILTERS (ORDER_TYPE <> 'Sample' for bookings)
-- and return pre-aggregated, chart-ready result sets (< 200 rows each).
-- ======================================================================

-- ----------------------------------------------------------------------
-- 1. EXECUTIVE OVERVIEW
-- ----------------------------------------------------------------------

-- Q1.1: Headline P&L by fiscal year
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS revenue_musd,
       ROUND(SUM(s.GROSS_MARGIN)/1e6, 1) AS gm_musd,
       ROUND(100.0*SUM(s.GROSS_MARGIN)/NULLIF(SUM(s.REVENUE),0), 2) AS gm_pct
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q1.2: Bookings (excl sample) by fiscal year
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(SUM(o.ORDER_VALUE)/1e6, 1) AS bookings_musd
FROM FACT_ORDERS o JOIN DIM_DATE d ON o.DATE_KEY = d.DATE_KEY
WHERE o.ORDER_TYPE <> 'Sample'
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q1.3: B:B ratio by fiscal year (AUTHORITATIVE)
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(AVG(b.BOOK_TO_BILL_RATIO)::numeric, 3) AS avg_bb
FROM FACT_BACKLOG b JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q1.4: Monthly revenue trend (current fiscal year, 12 months)
SELECT d.FISCAL_QUARTER, d.CALENDAR_MONTH, d.MONTH_NAME,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS revenue_musd,
       ROUND(SUM(s.GROSS_MARGIN)/1e6, 1) AS gm_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY d.FISCAL_QUARTER, d.CALENDAR_MONTH, d.MONTH_NAME
ORDER BY d.FISCAL_QUARTER, d.CALENDAR_MONTH;

-- Q1.5: Design-win pipeline value by stage (latest snapshot)
SELECT dw.STAGE_CODE, dw.STAGE_NAME,
       COUNT(*) AS n,
       ROUND(SUM(dw.ESTIMATED_REVENUE)/1e6, 1) AS est_rev_musd,
       ROUND(SUM(dw.ESTIMATED_REVENUE * dw.WIN_PROBABILITY)/1e6, 1) AS weighted_musd
FROM FACT_DESIGN_WINS dw
GROUP BY dw.STAGE_CODE, dw.STAGE_NAME ORDER BY n DESC;

-- ----------------------------------------------------------------------
-- 2. BOOKINGS & BACKLOG
-- ----------------------------------------------------------------------

-- Q2.1: Bookings by month for FY25
SELECT d.FISCAL_QUARTER, d.CALENDAR_MONTH, d.MONTH_NAME,
       ROUND(SUM(o.ORDER_VALUE)/1e6, 1) AS bookings_musd,
       COUNT(*) AS order_lines
FROM FACT_ORDERS o JOIN DIM_DATE d ON o.DATE_KEY = d.DATE_KEY
WHERE o.ORDER_TYPE <> 'Sample' AND TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY d.FISCAL_QUARTER, d.CALENDAR_MONTH, d.MONTH_NAME
ORDER BY d.FISCAL_QUARTER, d.CALENDAR_MONTH;

-- Q2.2: Backlog age distribution
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(AVG(b.AVERAGE_AGE_DAYS)::numeric, 1) AS avg_age_days,
       SUM(b.PAST_DUE_QTY) AS past_due_qty,
       ROUND(SUM(b.BACKLOG_VALUE)/1e6, 1) AS backlog_musd
FROM FACT_BACKLOG b JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q2.3: Order type mix (FY25)
SELECT o.ORDER_TYPE,
       COUNT(*) AS n,
       ROUND(SUM(o.ORDER_VALUE)/1e6, 1) AS value_musd,
       ROUND(100.0*SUM(o.ORDER_VALUE)/SUM(SUM(o.ORDER_VALUE)) OVER (), 1) AS share_pct
FROM FACT_ORDERS o JOIN DIM_DATE d ON o.DATE_KEY = d.DATE_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY o.ORDER_TYPE ORDER BY n DESC;

-- Q2.4: Priority × Order type heatmap
SELECT o.PRIORITY, o.ORDER_TYPE, COUNT(*) AS n
FROM FACT_ORDERS o JOIN DIM_DATE d ON o.DATE_KEY = d.DATE_KEY
WHERE o.ORDER_TYPE <> 'Sample' AND TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY o.PRIORITY, o.ORDER_TYPE ORDER BY o.PRIORITY, o.ORDER_TYPE;

-- ----------------------------------------------------------------------
-- 3. REVENUE & MARGIN DEEP-DIVE
-- ----------------------------------------------------------------------

-- Q3.1: Revenue & GM% by product category (FY25)
SELECT p.CATEGORY_CODE, p.CATEGORY_NAME,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd,
       ROUND(SUM(s.GROSS_MARGIN)/1e6, 1) AS gm_musd,
       ROUND(100.0*SUM(s.GROSS_MARGIN)/NULLIF(SUM(s.REVENUE),0), 2) AS gm_pct
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_PRODUCT p ON s.PRODUCT_KEY = p.PRODUCT_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY p.CATEGORY_CODE, p.CATEGORY_NAME ORDER BY rev_musd DESC;

-- Q3.2: ASP trend by FY
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(SUM(s.REVENUE)/NULLIF(SUM(s.SHIP_QUANTITY),0), 3) AS asp_usd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q3.3: Revenue by channel × FY (for stacked bar)
SELECT TRIM(d.FISCAL_YEAR) AS fy, ch.CHANNEL_CODE,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CHANNEL ch ON s.CHANNEL_KEY = ch.CHANNEL_KEY
GROUP BY d.FISCAL_YEAR, ch.CHANNEL_CODE ORDER BY fy, ch.CHANNEL_CODE;

-- ----------------------------------------------------------------------
-- 4. PRODUCT PERFORMANCE
-- ----------------------------------------------------------------------

-- Q4.1: Lifecycle-stage revenue mix (FY25)
SELECT p.LIFECYCLE_STAGE,
       COUNT(DISTINCT p.PRODUCT_KEY) AS sku_count,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_PRODUCT p ON s.PRODUCT_KEY = p.PRODUCT_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY p.LIFECYCLE_STAGE ORDER BY rev_musd DESC;

-- Q4.2: Automotive-qualified revenue share
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(SUM(CASE WHEN p.IS_AUTOMOTIVE_QUALIFIED THEN s.REVENUE ELSE 0 END)/1e6, 1) AS auto_qual_musd,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS total_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_PRODUCT p ON s.PRODUCT_KEY = p.PRODUCT_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q4.3: Top 15 products by FY25 revenue
SELECT p.PRODUCT_ID, p.PRODUCT_NAME, p.CATEGORY_CODE, p.LIFECYCLE_STAGE,
       ROUND(SUM(s.REVENUE)/1e6, 2) AS rev_musd,
       SUM(s.SHIP_QUANTITY) AS units
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_PRODUCT p ON s.PRODUCT_KEY = p.PRODUCT_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME, p.CATEGORY_CODE, p.LIFECYCLE_STAGE
ORDER BY rev_musd DESC LIMIT 15;

-- ----------------------------------------------------------------------
-- 5. END-MARKET ANALYSIS
-- ----------------------------------------------------------------------

-- Q5.1: End-market revenue share vs target (FY25)
WITH actual AS (
  SELECT em.END_MARKET_CODE, em.END_MARKET_NAME, em.MARKET_SHARE_TARGET,
         SUM(s.REVENUE) AS rev
  FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
  JOIN DIM_CUSTOMER c ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
  JOIN DIM_END_MARKET em ON c.END_MARKET_CODE = em.END_MARKET_CODE
  WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
  GROUP BY em.END_MARKET_CODE, em.END_MARKET_NAME, em.MARKET_SHARE_TARGET
)
SELECT END_MARKET_NAME,
       ROUND(rev/1e6, 1) AS rev_musd,
       ROUND(100.0*rev/SUM(rev) OVER (), 1) AS actual_share_pct,
       ROUND(MARKET_SHARE_TARGET*100, 1) AS target_share_pct,
       ROUND(100.0*rev/SUM(rev) OVER () - MARKET_SHARE_TARGET*100, 1) AS variance_pp
FROM actual ORDER BY rev DESC;

-- Q5.2: End-market YoY growth (FY24 vs FY25)
SELECT em.END_MARKET_NAME,
       ROUND(SUM(CASE WHEN TRIM(d.FISCAL_YEAR)='FY24' THEN s.REVENUE ELSE 0 END)/1e6, 1) AS fy24_musd,
       ROUND(SUM(CASE WHEN TRIM(d.FISCAL_YEAR)='FY25' THEN s.REVENUE ELSE 0 END)/1e6, 1) AS fy25_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CUSTOMER c ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
JOIN DIM_END_MARKET em ON c.END_MARKET_CODE = em.END_MARKET_CODE
WHERE TRIM(d.FISCAL_YEAR) IN ('FY24','FY25')
GROUP BY em.END_MARKET_NAME ORDER BY fy25_musd DESC;

-- ----------------------------------------------------------------------
-- 6. CUSTOMER & CHANNEL
-- ----------------------------------------------------------------------

-- Q6.1: Top 15 customers by FY25 revenue
SELECT c.CUSTOMER_ID, c.CUSTOMER_NAME, c.CUSTOMER_SEGMENT, c.REGION,
       ROUND(SUM(s.REVENUE)/1e6, 2) AS rev_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CUSTOMER c ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY c.CUSTOMER_ID, c.CUSTOMER_NAME, c.CUSTOMER_SEGMENT, c.REGION
ORDER BY rev_musd DESC LIMIT 15;

-- Q6.2: Revenue by customer segment
SELECT c.CUSTOMER_SEGMENT,
       COUNT(DISTINCT c.CUSTOMER_KEY) AS n_customers,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CUSTOMER c ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY c.CUSTOMER_SEGMENT ORDER BY rev_musd DESC;

-- Q6.3: Revenue by US region
SELECT c.REGION,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd,
       COUNT(DISTINCT c.CUSTOMER_KEY) AS n_customers
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CUSTOMER c ON s.CUSTOMER_KEY = c.CUSTOMER_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY c.REGION ORDER BY rev_musd DESC;

-- Q6.4: Channel mix with GM%
SELECT ch.CHANNEL_CODE, ch.CHANNEL_NAME,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd,
       ROUND(100.0*SUM(s.GROSS_MARGIN)/NULLIF(SUM(s.REVENUE),0), 2) AS gm_pct
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_CHANNEL ch ON s.CHANNEL_KEY = ch.CHANNEL_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY ch.CHANNEL_CODE, ch.CHANNEL_NAME ORDER BY rev_musd DESC;

-- ----------------------------------------------------------------------
-- 7. DESIGN-WIN PIPELINE
-- ----------------------------------------------------------------------

-- Q7.1: Funnel by stage
SELECT dw.STAGE_CODE, dw.STAGE_NAME,
       COUNT(*) AS n,
       ROUND(AVG(dw.WIN_PROBABILITY)*100, 1) AS avg_prob_pct,
       ROUND(SUM(dw.ESTIMATED_REVENUE)/1e6, 1) AS est_rev_musd,
       ROUND(SUM(dw.ESTIMATED_REVENUE*dw.WIN_PROBABILITY)/1e6, 1) AS weighted_musd
FROM FACT_DESIGN_WINS dw
GROUP BY dw.STAGE_CODE, dw.STAGE_NAME ORDER BY n DESC;

-- Q7.2: Top competitors displaced
SELECT dw.COMPETITOR_DISPLACED,
       COUNT(*) AS n,
       ROUND(SUM(dw.ESTIMATED_REVENUE)/1e6, 1) AS est_rev_musd
FROM FACT_DESIGN_WINS dw
WHERE dw.COMPETITOR_DISPLACED IS NOT NULL
GROUP BY dw.COMPETITOR_DISPLACED ORDER BY n DESC LIMIT 15;

-- Q7.3: New socket vs competitive displacement ratio
SELECT CASE WHEN dw.IS_NEW_SOCKET THEN 'New Socket' ELSE 'Displacement' END AS type,
       COUNT(*) AS n,
       ROUND(SUM(dw.ESTIMATED_REVENUE)/1e6, 1) AS est_rev_musd
FROM FACT_DESIGN_WINS dw GROUP BY dw.IS_NEW_SOCKET;

-- Q7.4: Pipeline by end market
SELECT em.END_MARKET_NAME,
       COUNT(*) AS n,
       ROUND(SUM(dw.ESTIMATED_REVENUE*dw.WIN_PROBABILITY)/1e6, 1) AS weighted_musd
FROM FACT_DESIGN_WINS dw
JOIN DIM_END_MARKET em ON dw.END_MARKET_KEY = em.END_MARKET_KEY
GROUP BY em.END_MARKET_NAME ORDER BY weighted_musd DESC;

-- ----------------------------------------------------------------------
-- 8. FAB & SUPPLY CHAIN
-- ----------------------------------------------------------------------

-- Q8.1: Utilization trend by FY
SELECT TRIM(d.FISCAL_YEAR) AS fy,
       ROUND(AVG(sc.UTILIZATION_RATE)*100, 1) AS avg_util_pct,
       ROUND(AVG(sc.YIELD_RATE)*100, 2) AS avg_yield_pct,
       ROUND(AVG(sc.CYCLE_TIME_DAYS)::numeric, 1) AS avg_cycle_days,
       ROUND(AVG(sc.COST_PER_DIE)::numeric, 3) AS avg_cost_per_die
FROM FACT_SUPPLY_CHAIN sc JOIN DIM_DATE d ON sc.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;

-- Q8.2: Utilization by fab (FY25)
SELECT f.FAB_NAME, f.FAB_TYPE, f.PROCESS_NODE,
       ROUND(AVG(sc.UTILIZATION_RATE)*100, 1) AS util_pct,
       ROUND(AVG(sc.YIELD_RATE)*100, 2) AS yield_pct,
       SUM(sc.GOOD_DIE_COUNT) AS good_die,
       ROUND(AVG(sc.COST_PER_DIE)::numeric, 3) AS cost_per_die
FROM FACT_SUPPLY_CHAIN sc JOIN DIM_DATE d ON sc.DATE_KEY = d.DATE_KEY
JOIN DIM_FAB f ON sc.FAB_KEY = f.FAB_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY f.FAB_NAME, f.FAB_TYPE, f.PROCESS_NODE
ORDER BY util_pct DESC;

-- Q8.3: Internal vs external revenue (via FACT_SHIPMENTS.FAB_KEY)
SELECT f.FAB_TYPE,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd,
       ROUND(100.0*SUM(s.GROSS_MARGIN)/NULLIF(SUM(s.REVENUE),0), 2) AS gm_pct
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_FAB f ON s.FAB_KEY = f.FAB_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY f.FAB_TYPE ORDER BY rev_musd DESC;

-- ----------------------------------------------------------------------
-- 9. INVENTORY HEALTH
-- ----------------------------------------------------------------------

-- Q9.1: WoS distribution at latest snapshot
SELECT ch.CHANNEL_CODE,
       COUNT(*) AS n,
       ROUND(AVG(inv.WEEKS_OF_SUPPLY)::numeric, 1) AS avg_wos,
       SUM(CASE WHEN inv.WEEKS_OF_SUPPLY < 2 THEN 1 ELSE 0 END) AS stockout_risk,
       SUM(CASE WHEN inv.WEEKS_OF_SUPPLY > 16 THEN 1 ELSE 0 END) AS excess,
       ROUND(SUM(inv.INVENTORY_VALUE)/1e6, 1) AS inv_musd
FROM FACT_INVENTORY inv JOIN DIM_CHANNEL ch ON inv.CHANNEL_KEY = ch.CHANNEL_KEY
WHERE inv.DATE_KEY = (SELECT MAX(DATE_KEY) FROM FACT_INVENTORY)
GROUP BY ch.CHANNEL_CODE ORDER BY inv_musd DESC;

-- Q9.2: Inventory value trend (last 52 weeks)
SELECT d.FULL_DATE,
       ROUND(SUM(inv.INVENTORY_VALUE)/1e6, 2) AS inv_musd,
       ROUND(AVG(inv.WEEKS_OF_SUPPLY)::numeric, 2) AS avg_wos
FROM FACT_INVENTORY inv JOIN DIM_DATE d ON inv.DATE_KEY = d.DATE_KEY
WHERE d.FULL_DATE >= (SELECT MAX(FULL_DATE) FROM DIM_DATE WHERE DATE_KEY IN (SELECT DATE_KEY FROM FACT_INVENTORY)) - INTERVAL '1 year'
GROUP BY d.FULL_DATE ORDER BY d.FULL_DATE;

-- ----------------------------------------------------------------------
-- 10. LEAD TIME & FULFILLMENT (proxies)
-- ----------------------------------------------------------------------

-- Q10.1: Avg quoted lead time by category (FY25)
SELECT p.CATEGORY_CODE, p.CATEGORY_NAME,
       ROUND(AVG(o.LEAD_TIME_DAYS)::numeric, 1) AS avg_lead_days,
       COUNT(*) AS n
FROM FACT_ORDERS o JOIN DIM_DATE d ON o.DATE_KEY = d.DATE_KEY
JOIN DIM_PRODUCT p ON o.PRODUCT_KEY = p.PRODUCT_KEY
WHERE o.ORDER_TYPE <> 'Sample' AND TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY p.CATEGORY_CODE, p.CATEGORY_NAME ORDER BY avg_lead_days DESC;

-- Q10.2: Ship-method mix (FY25)
SELECT s.SHIP_METHOD,
       COUNT(*) AS n,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS rev_musd,
       ROUND(100.0*COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
WHERE TRIM(d.FISCAL_YEAR) = 'FY25'
GROUP BY s.SHIP_METHOD ORDER BY n DESC;

-- ----------------------------------------------------------------------
-- 11. WEEKLY BUSINESS REVIEW (WBR)
-- ----------------------------------------------------------------------

-- Q11.1: Revenue + shipments by week (last 8 weeks of available data)
SELECT DATE_TRUNC('week', d.FULL_DATE)::date AS week_start,
       ROUND(SUM(s.REVENUE)/1e6, 2) AS rev_musd,
       SUM(s.SHIP_QUANTITY) AS units
FROM FACT_SHIPMENTS s JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
WHERE d.FULL_DATE >= (SELECT MAX(FULL_DATE) FROM DIM_DATE
                      WHERE DATE_KEY IN (SELECT DATE_KEY FROM FACT_SHIPMENTS)) - INTERVAL '56 days'
GROUP BY DATE_TRUNC('week', d.FULL_DATE) ORDER BY week_start;
