-- ============================================================================
-- QUERY TEMPLATES FOR FALCON CONSUMER DASHBOARDS
-- ============================================================================
-- Project: Falcon Consumer
-- Currency: USD
-- Fiscal Year: February - January (Retail 4-5-4 Calendar)
-- Date Range: 2022-01-01 to 2024-12-31
--
-- NOTE: All queries use pre-aggregated FACT_CUSTOMER_PERFORMANCE where available.
-- No exclusion filters (IS_EMPLOYEE, IS_FRAUD, IS_DECEASED) applied by default.
-- ============================================================================

-- ============================================================================
-- DASHBOARD 1: EXECUTIVE OVERVIEW
-- ============================================================================

-- Query 1.1: Executive KPI Summary (Last 12 Months)
-- Returns: Total Revenue, Total Orders, Total Customers, AOV, YoY Growth
-- Expected Rows: 1
-- Build Time: 2-3 days
SELECT
  ROUND(SUM(NET_SALES), 2) AS total_revenue,
  SUM(NET_ORDERS) AS total_orders,
  SUM(CUSTOMER_COUNT) AS total_customers,
  ROUND(SUM(NET_SALES) / NULLIF(SUM(NET_ORDERS), 0), 2) AS avg_order_value,
  ROUND(SUM(NET_UNITS), 0) AS total_units,
  ROUND(100.0 * (
    (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE FISCAL_YEAR = YEAR(DATEADD(YEAR, -1, GETDATE()))
       AND GOAL_TYPE_KEY = 5) -- NET_SALES_GOAL
    - SUM(NET_SALES)) /
    (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE FISCAL_YEAR = YEAR(DATEADD(YEAR, -1, GETDATE()))
       AND GOAL_TYPE_KEY = 5), 2) AS yoy_growth_pct
FROM FACT_CUSTOMER_PERFORMANCE
WHERE PERIOD_DATE_KEY >= DATEADD(YEAR, -1, GETDATE())
  AND PERIOD_DATE_KEY <= GETDATE()
  AND GOAL_TYPE_KEY = 5; -- NET_SALES_GOAL context


-- Query 1.2: Revenue Trend by Month (Last 12 Months)
-- Returns: Monthly revenue, orders, customer count
-- Expected Rows: ~12
SELECT
  d.CALENDAR_DATE,
  d.MONTH_NAME,
  d.FISCAL_MONTH,
  d.FISCAL_YEAR,
  ROUND(SUM(fcp.NET_SALES), 2) AS monthly_revenue,
  SUM(fcp.NET_ORDERS) AS monthly_orders,
  SUM(fcp.CUSTOMER_COUNT) AS monthly_customers,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.NET_ORDERS), 0), 2) AS monthly_aov
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
  AND d.IS_MONTH_END = TRUE
GROUP BY d.CALENDAR_DATE, d.MONTH_NAME, d.FISCAL_MONTH, d.FISCAL_YEAR
ORDER BY d.CALENDAR_DATE DESC;


-- Query 1.3: Key Metrics by Customer Type (YTD vs Prior Year)
-- Returns: Revenue, orders, customers by type, with YoY comparison
-- Expected Rows: 10 (5 types × 2 years)
SELECT
  fcp.CUSTOMER_TYPE,
  d.FISCAL_YEAR,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue,
  SUM(fcp.NET_ORDERS) AS orders,
  SUM(fcp.CUSTOMER_COUNT) AS customers,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.CUSTOMER_COUNT), 0), 2) AS avg_spend
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
WHERE d.FISCAL_YEAR IN (YEAR(GETDATE()), YEAR(GETDATE()) - 1)
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY fcp.CUSTOMER_TYPE, d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR DESC, revenue DESC;


-- ============================================================================
-- DASHBOARD 2: SALES & REVENUE
-- ============================================================================

-- Query 2.1: Revenue by Business Unit (Last 12 Months)
-- Returns: Revenue, orders, AOV by BU
-- Expected Rows: 7 (BUs)
-- Build Time: 3-4 days
SELECT
  dbu.BUSINESS_UNIT_KEY,
  dbu.BUSINESS_UNIT_NAME,
  dbu.CHANNEL_TYPE,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue,
  SUM(fcp.NET_ORDERS) AS orders,
  SUM(fcp.CUSTOMER_COUNT) AS customers,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.NET_ORDERS), 0), 2) AS aov,
  ROUND(100.0 * SUM(fcp.NET_SALES) /
    (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND PERIOD_DATE_KEY <= GETDATE()
       AND GOAL_TYPE_KEY = 5), 2) AS pct_of_total
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_KEY, dbu.BUSINESS_UNIT_NAME, dbu.CHANNEL_TYPE
ORDER BY revenue DESC;


-- Query 2.2: Revenue Trend by BU (Monthly, Last 12 Months)
-- Returns: Monthly revenue for each BU
-- Expected Rows: ~84 (7 BUs × 12 months)
SELECT
  d.CALENDAR_DATE,
  d.MONTH_NAME,
  dbu.BUSINESS_UNIT_NAME,
  ROUND(SUM(fcp.NET_SALES), 2) AS monthly_revenue,
  ROUND(SUM(fcp.NET_ORDERS), 0) AS monthly_orders
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
  AND d.IS_MONTH_END = TRUE
GROUP BY d.CALENDAR_DATE, d.MONTH_NAME, dbu.BUSINESS_UNIT_NAME
ORDER BY d.CALENDAR_DATE DESC, dbu.BUSINESS_UNIT_NAME;


-- Query 2.3: YoY Revenue Variance by BU
-- Returns: Current year vs prior year, variance $, variance %
-- Expected Rows: 7 (BUs)
SELECT
  dbu.BUSINESS_UNIT_NAME,
  ROUND(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) THEN fcp.NET_SALES ELSE 0 END), 2)
    AS current_fy_revenue,
  ROUND(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END), 2)
    AS prior_fy_revenue,
  ROUND(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) THEN fcp.NET_SALES ELSE 0 END) -
    SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END), 2)
    AS revenue_variance_dollars,
  ROUND(100.0 * (SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) THEN fcp.NET_SALES ELSE 0 END) -
    SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END)) /
    NULLIF(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END), 0), 2)
    AS yoy_variance_pct
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE d.FISCAL_YEAR IN (YEAR(GETDATE()), YEAR(GETDATE()) - 1)
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_NAME
ORDER BY revenue_variance_dollars DESC;


-- ============================================================================
-- DASHBOARD 3: CUSTOMER LIFECYCLE
-- ============================================================================

-- Query 3.1: Customer Count by Type (Last 12 Months)
-- Returns: Customers and revenue by NEW, RETURNING, VIP, LAPSED, REACTIVATED
-- Expected Rows: 5 (customer types)
-- Build Time: 3-4 days
SELECT
  fcp.CUSTOMER_TYPE,
  SUM(fcp.CUSTOMER_COUNT) AS total_customers,
  ROUND(100.0 * SUM(fcp.CUSTOMER_COUNT) /
    (SELECT SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND PERIOD_DATE_KEY <= GETDATE()
       AND GOAL_TYPE_KEY = 5), 2) AS pct_of_total,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue,
  ROUND(SUM(fcp.NET_ORDERS), 0) AS orders,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.CUSTOMER_COUNT), 0), 2) AS revenue_per_customer
FROM FACT_CUSTOMER_PERFORMANCE fcp
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY fcp.CUSTOMER_TYPE
ORDER BY total_customers DESC;


-- Query 3.2: New Customer Acquisition Trend (Monthly)
-- Returns: New customers added each month, cohort retention
-- Expected Rows: ~12 (months)
SELECT
  d.CALENDAR_DATE,
  d.MONTH_NAME,
  SUM(fcp.CUSTOMER_COUNT) AS new_customers_added,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue_from_new,
  ROUND(SUM(fcp.NET_ORDERS), 0) AS orders_from_new
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.CUSTOMER_TYPE = 'NEW'
  AND fcp.GOAL_TYPE_KEY = 1 -- NEW_CUSTOMERS goal type
  AND d.IS_MONTH_END = TRUE
GROUP BY d.CALENDAR_DATE, d.MONTH_NAME
ORDER BY d.CALENDAR_DATE DESC;


-- Query 3.3: Customer Migration (Cohort Analysis)
-- Returns: Count of customers by lifecycle segment, current state
-- Expected Rows: 5 (lifecycle stages)
SELECT
  dc.LIFECYCLE_SEGMENT_CODE,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(100.0 * COUNT(DISTINCT dc.CUSTOMER_KEY) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS pct_of_active,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  ROUND(AVG(dc.LIFETIME_ORDER_COUNT), 1) AS avg_order_count,
  AVG(dc.LAST_PURCHASE_DAYS_AGO) AS avg_days_since_purchase
FROM DIM_CUSTOMER dc
WHERE dc.IS_CURRENT = TRUE
GROUP BY dc.LIFECYCLE_SEGMENT_CODE
ORDER BY customer_count DESC;


-- ============================================================================
-- DASHBOARD 4: LOYALTY & RETENTION
-- ============================================================================

-- Query 4.1: Loyalty Program Metrics
-- Returns: Loyalty members, enrollment, tier distribution, PLCC penetration
-- Expected Rows: 1 (aggregate)
-- Build Time: 4-5 days
SELECT
  (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE) AS total_active_customers,
  (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE AND IS_LOYALTY_MEMBER = TRUE)
    AS loyalty_members,
  ROUND(100.0 * (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE AND IS_LOYALTY_MEMBER = TRUE) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS loyalty_rate_pct,
  (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE AND PLCC_HOLDER = TRUE)
    AS plcc_holders,
  ROUND(100.0 * (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE AND PLCC_HOLDER = TRUE) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS plcc_penetration_pct,
  (SELECT COUNT(DISTINCT dc.LOYALTY_MEMBER_ID) FROM DIM_CUSTOMER dc
   INNER JOIN FACT_ORDER_TRANSACTION fot ON dc.CUSTOMER_KEY = fot.CUSTOMER_KEY
   WHERE dc.IS_CURRENT = TRUE
     AND dc.IS_LOYALTY_MEMBER = TRUE
     AND fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
     AND fot.ORDER_DATE_KEY <= GETDATE())
    AS loyalty_members_active_12m;


-- Query 4.2: Loyalty Member Metrics vs Non-Members
-- Returns: Revenue and engagement comparison
-- Expected Rows: 2 (members vs non-members)
SELECT
  CASE WHEN dc.IS_LOYALTY_MEMBER = TRUE THEN 'Loyalty Member' ELSE 'Non-Member' END AS segment,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  ROUND(AVG(dc.LIFETIME_ORDER_COUNT), 1) AS avg_lifetime_orders,
  ROUND(SUM(fcp.NET_SALES), 2) AS last_12m_revenue,
  ROUND(AVG(fcp.NET_SALES), 2) AS avg_monthly_revenue
FROM DIM_CUSTOMER dc
LEFT JOIN FACT_CUSTOMER_PERFORMANCE fcp ON dc.CUSTOMER_KEY = fcp.BUSINESS_UNIT_KEY -- Pseudo join for context
WHERE dc.IS_CURRENT = TRUE
GROUP BY dc.IS_LOYALTY_MEMBER
ORDER BY segment;


-- Query 4.3: Loyalty Tier Distribution
-- Returns: Customer count and metrics by tier
-- Expected Rows: 4-6 (tier levels)
SELECT
  dc.LOYALTY_TIER_NAME,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS member_count,
  ROUND(100.0 * COUNT(DISTINCT dc.CUSTOMER_KEY) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE AND IS_LOYALTY_MEMBER = TRUE), 2)
    AS pct_of_loyalty,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  MIN(dc.LOYALTY_ENROLLED_DATE) AS earliest_enrollment,
  MAX(dc.LAST_PURCHASE_DATE) AS most_recent_purchase
FROM DIM_CUSTOMER dc
WHERE dc.IS_CURRENT = TRUE
  AND dc.IS_LOYALTY_MEMBER = TRUE
  AND dc.LOYALTY_TIER_NAME IS NOT NULL
GROUP BY dc.LOYALTY_TIER_NAME
ORDER BY member_count DESC;


-- ============================================================================
-- DASHBOARD 5: CHANNEL MIX
-- ============================================================================

-- Query 5.1: Orders by Source Type (Last 12 Months)
-- Returns: Order count and % by WEB, MOBILE_APP, TABLET, PHONE
-- Expected Rows: 4 (source types)
-- Build Time: 3-4 days
SELECT
  fot.SOURCE_TYPE,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS order_count,
  ROUND(100.0 * COUNT(DISTINCT fot.ORDER_TXN_KEY) /
    (SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION
     WHERE ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND ORDER_DATE_KEY <= GETDATE()), 2) AS pct_of_total_orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS unique_customers,
  ROUND(100.0 * COUNT(DISTINCT fot.CUSTOMER_KEY) /
    (SELECT COUNT(DISTINCT CUSTOMER_KEY) FROM FACT_ORDER_TRANSACTION
     WHERE ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND ORDER_DATE_KEY <= GETDATE()), 2) AS pct_of_customers
FROM FACT_ORDER_TRANSACTION fot
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
GROUP BY fot.SOURCE_TYPE
ORDER BY order_count DESC;


-- Query 5.2: Channel Trend (Monthly Source Distribution)
-- Returns: Monthly orders by source
-- Expected Rows: ~48 (4 sources × 12 months)
SELECT
  d.CALENDAR_DATE,
  d.MONTH_NAME,
  fot.SOURCE_TYPE,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS monthly_orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS monthly_unique_customers
FROM FACT_ORDER_TRANSACTION fot
INNER JOIN DIM_DATE d ON fot.ORDER_DATE_KEY = d.DATE_KEY
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
  AND d.IS_MONTH_END = TRUE
GROUP BY d.CALENDAR_DATE, d.MONTH_NAME, fot.SOURCE_TYPE
ORDER BY d.CALENDAR_DATE DESC, fot.SOURCE_TYPE;


-- Query 5.3: Channel Performance by BU
-- Returns: Orders and customers by source and BU
-- Expected Rows: ~28 (7 BUs × 4 sources, partial)
SELECT
  dbu.BUSINESS_UNIT_NAME,
  fot.SOURCE_TYPE,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS customers,
  ROUND(100.0 * COUNT(DISTINCT fot.ORDER_TXN_KEY) /
    (SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION
     WHERE BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
       AND ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND ORDER_DATE_KEY <= GETDATE()), 2) AS pct_of_bu_orders
FROM FACT_ORDER_TRANSACTION fot
INNER JOIN DIM_BUSINESS_UNIT dbu ON fot.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
GROUP BY dbu.BUSINESS_UNIT_NAME, fot.SOURCE_TYPE
ORDER BY dbu.BUSINESS_UNIT_NAME, orders DESC;


-- ============================================================================
-- DASHBOARD 6: MARKETING ATTRIBUTION
-- ============================================================================

-- Query 6.1: Orders by Marketing Channel (Last 12 Months)
-- Returns: Order count, customers, conversion proxy by channel
-- Expected Rows: 7 (channels)
-- Build Time: 3-4 days
SELECT
  fot.MARKETING_CHANNEL,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS order_count,
  ROUND(100.0 * COUNT(DISTINCT fot.ORDER_TXN_KEY) /
    (SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION
     WHERE ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND ORDER_DATE_KEY <= GETDATE()), 2) AS pct_of_total_orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS unique_customers,
  ROUND(1.0 * COUNT(DISTINCT fot.ORDER_TXN_KEY) / NULLIF(COUNT(DISTINCT fot.CUSTOMER_KEY), 0), 2)
    AS orders_per_customer
FROM FACT_ORDER_TRANSACTION fot
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
GROUP BY fot.MARKETING_CHANNEL
ORDER BY order_count DESC;


-- Query 6.2: Marketing Channel Trend (Monthly)
-- Returns: Monthly orders by marketing channel
-- Expected Rows: ~84 (7 channels × 12 months)
SELECT
  d.CALENDAR_DATE,
  d.MONTH_NAME,
  fot.MARKETING_CHANNEL,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS monthly_orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS monthly_unique_customers
FROM FACT_ORDER_TRANSACTION fot
INNER JOIN DIM_DATE d ON fot.ORDER_DATE_KEY = d.DATE_KEY
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
  AND d.IS_MONTH_END = TRUE
GROUP BY d.CALENDAR_DATE, d.MONTH_NAME, fot.MARKETING_CHANNEL
ORDER BY d.CALENDAR_DATE DESC, monthly_orders DESC;


-- Query 6.3: Customer Acquisition by Channel
-- Returns: New vs Returning customers by marketing channel
-- Expected Rows: ~14 (7 channels × 2 types)
SELECT
  fot.MARKETING_CHANNEL,
  CASE WHEN dc.CUSTOMER_TYPE = 'NEW' THEN 'New Customer' ELSE 'Returning' END AS customer_type,
  COUNT(DISTINCT fot.ORDER_TXN_KEY) AS orders,
  COUNT(DISTINCT fot.CUSTOMER_KEY) AS customers,
  ROUND(100.0 * COUNT(DISTINCT fot.CUSTOMER_KEY) /
    (SELECT COUNT(DISTINCT CUSTOMER_KEY) FROM FACT_ORDER_TRANSACTION
     WHERE MARKETING_CHANNEL = fot.MARKETING_CHANNEL
       AND ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND ORDER_DATE_KEY <= GETDATE()), 2) AS pct_of_channel_customers
FROM FACT_ORDER_TRANSACTION fot
INNER JOIN DIM_CUSTOMER dc ON fot.CUSTOMER_KEY = dc.CUSTOMER_KEY
WHERE fot.ORDER_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fot.ORDER_DATE_KEY <= GETDATE()
  AND dc.IS_CURRENT = TRUE
GROUP BY fot.MARKETING_CHANNEL, dc.CUSTOMER_TYPE
ORDER BY fot.MARKETING_CHANNEL, orders DESC;


-- ============================================================================
-- DASHBOARD 7: BRAND PERFORMANCE
-- ============================================================================

-- Query 7.1: Key Metrics by Business Unit (Last 12 Months)
-- Returns: Revenue, growth, customers, share by BU
-- Expected Rows: 7 (BUs)
-- Build Time: 2-3 days
SELECT
  dbu.BUSINESS_UNIT_NAME,
  dbu.CHANNEL_TYPE,
  dbu.REGION_CODE,
  dbu.STORE_COUNT,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue,
  ROUND(100.0 * SUM(fcp.NET_SALES) /
    (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND PERIOD_DATE_KEY <= GETDATE()
       AND GOAL_TYPE_KEY = 5), 2) AS pct_of_total_revenue,
  SUM(fcp.NET_ORDERS) AS orders,
  SUM(fcp.CUSTOMER_COUNT) AS customers,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.NET_ORDERS), 0), 2) AS aov,
  ROUND(SUM(fcp.NET_SALES) / NULLIF(SUM(fcp.CUSTOMER_COUNT), 0), 2) AS revenue_per_customer
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_NAME, dbu.CHANNEL_TYPE, dbu.REGION_CODE, dbu.STORE_COUNT
ORDER BY revenue DESC;


-- Query 7.2: Brand Growth: YoY Comparison
-- Returns: Current FY vs Prior FY revenue and growth for each BU
-- Expected Rows: 7 (BUs)
SELECT
  dbu.BUSINESS_UNIT_NAME,
  ROUND(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) THEN fcp.NET_SALES ELSE 0 END), 2)
    AS current_fy_revenue,
  ROUND(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END), 2)
    AS prior_fy_revenue,
  ROUND(100.0 * (SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) THEN fcp.NET_SALES ELSE 0 END) -
    SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END)) /
    NULLIF(SUM(CASE WHEN d.FISCAL_YEAR = YEAR(GETDATE()) - 1 THEN fcp.NET_SALES ELSE 0 END), 0), 2)
    AS yoy_growth_pct
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE d ON fcp.PERIOD_DATE_KEY = d.DATE_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE d.FISCAL_YEAR IN (YEAR(GETDATE()), YEAR(GETDATE()) - 1)
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_NAME
ORDER BY yoy_growth_pct DESC;


-- Query 7.3: Customer Mix by Brand
-- Returns: Distribution of customer types by BU
-- Expected Rows: ~35 (7 BUs × 5 customer types)
SELECT
  dbu.BUSINESS_UNIT_NAME,
  fcp.CUSTOMER_TYPE,
  SUM(fcp.CUSTOMER_COUNT) AS customer_count,
  ROUND(100.0 * SUM(fcp.CUSTOMER_COUNT) /
    (SELECT SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
       AND PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND PERIOD_DATE_KEY <= GETDATE()
       AND GOAL_TYPE_KEY = 5), 2) AS pct_of_bu_customers,
  ROUND(SUM(fcp.NET_SALES), 2) AS revenue
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_NAME, fcp.CUSTOMER_TYPE
ORDER BY dbu.BUSINESS_UNIT_NAME, customer_count DESC;


-- ============================================================================
-- DASHBOARD 8: PRODUCT CATEGORY (LIMITED - NO PRODUCT SALES FACT)
-- ============================================================================

-- Query 8.1: Product Catalog Reference (No Sales Data Available)
-- Returns: Product catalog, category, brand, luxury flag
-- Expected Rows: 90 (products)
-- Build Time: 2-3 days (FALLBACK ONLY - escalate product sales ETL)
-- NOTE: This is a DATA GAP. No product-level sales fact available.
-- RECOMMENDATION: Implement FACT_PRODUCT_SALES with SKU-level line items
SELECT
  dp.PRODUCT_KEY,
  dp.SKU,
  dp.PRODUCT_NAME,
  dp.CATEGORY_L1_CODE,
  dp.CATEGORY_L2_CODE,
  dp.BRAND_L1_CODE,
  dp.BRAND_L2_CODE,
  dp.IS_LUXURY_FLAG,
  dp.LIST_PRICE,
  dp.AVG_DISCOUNT_RATE
FROM DIM_PRODUCT dp
ORDER BY dp.CATEGORY_L1_CODE, dp.PRODUCT_NAME;


-- ============================================================================
-- DASHBOARD 9: GEOGRAPHIC PERFORMANCE
-- ============================================================================

-- Query 9.1: Sales Transactions by Region and Distance
-- Returns: Transaction count and avg distance by region
-- Expected Rows: 5 (regions)
-- Build Time: 4-5 days
SELECT
  dl.GEO_REGION_ID,
  COUNT(DISTINCT fst.SALES_TXN_KEY) AS transaction_count,
  COUNT(DISTINCT fst.CUSTOMER_KEY) AS unique_customers,
  ROUND(AVG(fst.DISTANCE_TO_STORE), 2) AS avg_distance_to_store,
  ROUND(MIN(fst.DISTANCE_TO_STORE), 2) AS min_distance,
  ROUND(MAX(fst.DISTANCE_TO_STORE), 2) AS max_distance
FROM FACT_SALES_TRANSACTION fst
INNER JOIN DIM_LOCATION dl ON fst.LOCATION_KEY = dl.LOCATION_KEY
WHERE fst.TRANSACTION_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fst.TRANSACTION_DATE_KEY <= GETDATE()
GROUP BY dl.GEO_REGION_ID
ORDER BY transaction_count DESC;


-- Query 9.2: Regional Revenue Distribution (From FACT_CUSTOMER_PERFORMANCE aggregated by BU region)
-- Returns: Revenue % by region
-- Expected Rows: 5 (regions)
SELECT
  dl.GEO_REGION_ID,
  ROUND(SUM(fcp.NET_SALES), 2) AS regional_revenue,
  ROUND(100.0 * SUM(fcp.NET_SALES) /
    (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE
     WHERE PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
       AND PERIOD_DATE_KEY <= GETDATE()
       AND GOAL_TYPE_KEY = 5), 2) AS pct_of_total,
  SUM(fcp.NET_ORDERS) AS regional_orders,
  COUNT(DISTINCT dl.LOCATION_KEY) AS store_count
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
INNER JOIN DIM_LOCATION dl ON dbu.BUSINESS_UNIT_KEY = dl.BUSINESS_UNIT_KEY -- Approximate region mapping
WHERE fcp.PERIOD_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fcp.PERIOD_DATE_KEY <= GETDATE()
  AND fcp.GOAL_TYPE_KEY = 5 -- NET_SALES_GOAL
GROUP BY dl.GEO_REGION_ID
ORDER BY regional_revenue DESC;


-- Query 9.3: Customer Proximity Analysis
-- Returns: Customer count and metrics by distance bucket
-- Expected Rows: 4-5 (distance tiers)
SELECT
  CASE
    WHEN fst.DISTANCE_TO_STORE < 5 THEN 'Within 5km'
    WHEN fst.DISTANCE_TO_STORE < 10 THEN '5-10km'
    WHEN fst.DISTANCE_TO_STORE < 20 THEN '10-20km'
    ELSE '20km+'
  END AS distance_bucket,
  COUNT(DISTINCT fst.SALES_TXN_KEY) AS transaction_count,
  COUNT(DISTINCT fst.CUSTOMER_KEY) AS unique_customers,
  ROUND(AVG(fst.DISTANCE_TO_STORE), 2) AS avg_distance
FROM FACT_SALES_TRANSACTION fst
WHERE fst.TRANSACTION_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fst.TRANSACTION_DATE_KEY <= GETDATE()
GROUP BY
  CASE
    WHEN fst.DISTANCE_TO_STORE < 5 THEN 'Within 5km'
    WHEN fst.DISTANCE_TO_STORE < 10 THEN '5-10km'
    WHEN fst.DISTANCE_TO_STORE < 20 THEN '10-20km'
    ELSE '20km+'
  END
ORDER BY
  CASE
    WHEN fst.DISTANCE_TO_STORE < 5 THEN 1
    WHEN fst.DISTANCE_TO_STORE < 10 THEN 2
    WHEN fst.DISTANCE_TO_STORE < 20 THEN 3
    ELSE 4
  END;


-- ============================================================================
-- DASHBOARD 10: CUSTOMER SEGMENTATION
-- ============================================================================

-- Query 10.1: Value Segment Distribution
-- Returns: Customer count and lifetime value by segment
-- Expected Rows: 4 (segments: Platinum, Gold, Silver, Bronze)
-- Build Time: 3-4 days
SELECT
  dc.VALUE_SEGMENT_CODE,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(100.0 * COUNT(DISTINCT dc.CUSTOMER_KEY) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS pct_of_total,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  ROUND(MIN(dc.LIFETIME_NET_AMOUNT), 2) AS min_value,
  ROUND(MAX(dc.LIFETIME_NET_AMOUNT), 2) AS max_value,
  ROUND(AVG(dc.LIFETIME_ORDER_COUNT), 1) AS avg_order_count
FROM DIM_CUSTOMER dc
WHERE dc.IS_CURRENT = TRUE
GROUP BY dc.VALUE_SEGMENT_CODE
ORDER BY avg_lifetime_value DESC;


-- Query 10.2: Lifecycle Segment Distribution
-- Returns: Customer count and days inactive by lifecycle stage
-- Expected Rows: 5 (segments: New, At-Risk, Lapsed, Win-Back, Loyal)
SELECT
  dc.LIFECYCLE_SEGMENT_CODE,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(100.0 * COUNT(DISTINCT dc.CUSTOMER_KEY) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS pct_of_total,
  ROUND(AVG(dc.LAST_PURCHASE_DAYS_AGO), 0) AS avg_days_since_purchase,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  MIN(dc.LAST_PURCHASE_DATE) AS oldest_inactive,
  MAX(dc.LAST_PURCHASE_DATE) AS most_recent
FROM DIM_CUSTOMER dc
WHERE dc.IS_CURRENT = TRUE
GROUP BY dc.LIFECYCLE_SEGMENT_CODE
ORDER BY customer_count DESC;


-- Query 10.3: Multi-Segment Crosstab (Value × Lifecycle)
-- Returns: Customer count by value and lifecycle combination
-- Expected Rows: ~20 (4 value × 5 lifecycle)
SELECT
  dc.VALUE_SEGMENT_CODE,
  dc.LIFECYCLE_SEGMENT_CODE,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_value,
  ROUND(AVG(dc.LIFETIME_ORDER_COUNT), 1) AS avg_orders
FROM DIM_CUSTOMER dc
WHERE dc.IS_CURRENT = TRUE
GROUP BY dc.VALUE_SEGMENT_CODE, dc.LIFECYCLE_SEGMENT_CODE
ORDER BY dc.VALUE_SEGMENT_CODE, customer_count DESC;


-- ============================================================================
-- DASHBOARD 11: HOUSEHOLD ANALYSIS
-- ============================================================================

-- Query 11.1: Household Profile Distribution
-- Returns: Customer count by household size and income
-- Expected Rows: 12-16 (4 sizes × 3-4 income ranges)
-- Build Time: 3-4 days
SELECT
  dh.HOUSEHOLD_SIZE,
  dh.HOUSEHOLD_INCOME_RANGE,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(100.0 * COUNT(DISTINCT dc.CUSTOMER_KEY) /
    (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) AS pct_of_customers,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  ROUND(AVG(dh.HOUSEHOLD_LIFESPAN_DAYS), 0) AS avg_household_lifespan
FROM DIM_CUSTOMER dc
INNER JOIN DIM_HOUSEHOLD dh ON dc.HOUSEHOLD_KEY = dh.HOUSEHOLD_KEY
WHERE dc.IS_CURRENT = TRUE
GROUP BY dh.HOUSEHOLD_SIZE, dh.HOUSEHOLD_INCOME_RANGE
ORDER BY customer_count DESC;


-- Query 11.2: Children Impact on Spending
-- Returns: Comparison of households with and without children
-- Expected Rows: 2 (with/without children)
SELECT
  CASE WHEN dh.HAS_CHILDREN = TRUE THEN 'With Children' ELSE 'No Children' END AS household_type,
  COUNT(DISTINCT dc.CUSTOMER_KEY) AS customer_count,
  ROUND(AVG(dc.LIFETIME_NET_AMOUNT), 2) AS avg_lifetime_value,
  ROUND(AVG(dc.LIFETIME_ORDER_COUNT), 1) AS avg_lifetime_orders,
  ROUND(AVG(dh.HOUSEHOLD_SIZE), 1) AS avg_household_size
FROM DIM_CUSTOMER dc
INNER JOIN DIM_HOUSEHOLD dh ON dc.HOUSEHOLD_KEY = dh.HOUSEHOLD_KEY
WHERE dc.IS_CURRENT = TRUE
GROUP BY dh.HAS_CHILDREN
ORDER BY customer_count DESC;


-- Query 11.3: Multi-Person Household Engagement
-- Returns: Transaction activity by household size
-- Expected Rows: 4 (household sizes)
SELECT
  dh.HOUSEHOLD_SIZE,
  COUNT(DISTINCT fst.SALES_TXN_KEY) AS transaction_count,
  COUNT(DISTINCT dh.HOUSEHOLD_KEY) AS household_count,
  ROUND(1.0 * COUNT(DISTINCT fst.SALES_TXN_KEY) / NULLIF(COUNT(DISTINCT dh.HOUSEHOLD_KEY), 0), 2)
    AS transactions_per_household,
  COUNT(DISTINCT fst.CUSTOMER_KEY) AS unique_customers_in_transactions
FROM FACT_SALES_TRANSACTION fst
INNER JOIN DIM_HOUSEHOLD dh ON fst.HOUSEHOLD_KEY = dh.HOUSEHOLD_KEY
WHERE fst.TRANSACTION_DATE_KEY >= DATEADD(MONTH, -12, GETDATE())
  AND fst.TRANSACTION_DATE_KEY <= GETDATE()
GROUP BY dh.HOUSEHOLD_SIZE
ORDER BY transaction_count DESC;

-- ============================================================================
-- END OF QUERY TEMPLATES
-- ============================================================================
-- Expected Total Build Time: 41-49 days (see DASHBOARD_FEASIBILITY.md)
-- All queries pre-filter to avoid massive scans; results fit in <200 rows
-- No exclusion filters applied (IS_EMPLOYEE, IS_FRAUD, IS_DECEASED included by default)
-- Use GOAL_TYPE_KEY filter carefully in FACT_CUSTOMER_PERFORMANCE queries
-- ============================================================================
