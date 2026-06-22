-- Falcon Telecom xFalcon AnalyticsPro - Query Templates
-- Indian telecom operator, 80K subscribers, 2019-2025 data, INR currency
-- Fiscal year: April-March (FY25 = Apr 2024 - Mar 2025)

-- ============================================================================
-- DASHBOARD 1: EXECUTIVE OVERVIEW
-- ============================================================================

-- Query 1.1: Total Revenue Trend by Fiscal Year
-- Shows annual revenue trend for strategic overview
SELECT
  d.FISCAL_YEAR,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr,
  COUNT(DISTINCT d.CALENDAR_MONTH) AS months_in_period
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- Query 1.2: Active Subscribers and Churn Rate by Fiscal Year
-- Tracks subscriber base growth and churn trend year-over-year
SELECT
  d.FISCAL_YEAR,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) /
    COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers
FROM DIM_SUBSCRIBER s
JOIN DIM_DATE d ON s.ACTIVATION_DATE >= d.FULL_DATE
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- Query 1.3: Average ARPU by Fiscal Quarter
-- Shows quarterly ARPU progression for profitability tracking
SELECT
  d.FISCAL_YEAR,
  d.FISCAL_QUARTER,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr,
  COUNT(DISTINCT b.BILLING_KEY) AS transaction_count
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR, d.FISCAL_QUARTER
ORDER BY d.FISCAL_YEAR, d.FISCAL_QUARTER;

-- ============================================================================
-- DASHBOARD 2: REVENUE & ARPU
-- ============================================================================

-- Query 2.1: Revenue by Plan Category
-- Breaks down revenue sources: Prepaid, Postpaid, Corporate
SELECT
  p.PLAN_CATEGORY,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr,
  ROUND(SUM(CAST(b.BASE_PLAN_CHARGE AS NUMERIC)), 0) AS base_charge,
  ROUND(SUM(CAST(b.DATA_OVERAGE_CHARGE AS NUMERIC)), 0) AS overage_charge,
  ROUND(SUM(CAST(b.ADDON_CHARGE AS NUMERIC)), 0) AS addon_charge,
  ROUND(SUM(CAST(b.ROAMING_CHARGE AS NUMERIC)), 0) AS roaming_charge,
  COUNT(DISTINCT b.BILLING_KEY) AS transaction_count
FROM FACT_BILLING b
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY p.PLAN_CATEGORY
ORDER BY total_revenue_inr DESC;

-- Query 2.2: ARPU by Customer Segment and Plan Category
-- Premium and value segment monetization analysis
SELECT
  s.CUSTOMER_SEGMENT,
  p.PLAN_CATEGORY,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr
FROM FACT_BILLING b
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY s.CUSTOMER_SEGMENT, p.PLAN_CATEGORY
ORDER BY avg_arpu_inr DESC;

-- Query 2.3: Revenue Composition by Component (Annual)
-- Shows mix of base, overage, roaming, and addon revenue
SELECT
  d.FISCAL_YEAR,
  ROUND(SUM(CAST(b.BASE_PLAN_CHARGE AS NUMERIC)), 0) AS base_revenue,
  ROUND(SUM(CAST(b.DATA_OVERAGE_CHARGE AS NUMERIC)), 0) AS overage_revenue,
  ROUND(SUM(CAST(b.ROAMING_CHARGE AS NUMERIC)), 0) AS roaming_revenue,
  ROUND(SUM(CAST(b.ADDON_CHARGE AS NUMERIC)), 0) AS addon_revenue,
  ROUND(SUM(CAST(b.TAXES AS NUMERIC)), 0) AS taxes,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- ============================================================================
-- DASHBOARD 3: SUBSCRIBER LIFECYCLE
-- ============================================================================

-- Query 3.1: Activations vs Churns by Fiscal Year
-- Subscriber flow analysis for growth tracking
SELECT
  d.FISCAL_YEAR,
  SUM(CASE WHEN le.EVENT_TYPE = 'ACTIVATION' THEN 1 ELSE 0 END) AS activations,
  SUM(CASE WHEN le.EVENT_TYPE = 'CHURN' THEN 1 ELSE 0 END) AS churns,
  SUM(CASE WHEN le.EVENT_TYPE = 'PLAN_UPGRADE' THEN 1 ELSE 0 END) AS plan_upgrades,
  SUM(CASE WHEN le.EVENT_TYPE = 'PLAN_DOWNGRADE' THEN 1 ELSE 0 END) AS plan_downgrades
FROM FACT_LIFECYCLE_EVENTS le
JOIN DIM_DATE d ON le.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- Query 3.2: Lifecycle Events by Channel
-- Shows customer touchpoint effectiveness (IVR, Store, Online, Call Center)
SELECT
  le.CHANNEL,
  le.EVENT_TYPE,
  COUNT(DISTINCT le.EVENT_KEY) AS event_count,
  ROUND(AVG(le.RESOLUTION_DAYS), 1) AS avg_resolution_days,
  ROUND(AVG(le.NPS_POST_EVENT), 2) AS avg_nps_score
FROM FACT_LIFECYCLE_EVENTS le
JOIN DIM_DATE d ON le.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY le.CHANNEL, le.EVENT_TYPE
ORDER BY le.CHANNEL, event_count DESC;

-- Query 3.3: NPS Score by Lifecycle Event Type
-- Customer satisfaction analysis post-event
SELECT
  le.EVENT_TYPE,
  COUNT(DISTINCT le.EVENT_KEY) AS event_count,
  ROUND(AVG(le.NPS_POST_EVENT), 2) AS avg_nps_score,
  ROUND(SUM(CAST(le.REVENUE_IMPACT AS NUMERIC)), 0) AS total_revenue_impact_inr,
  ROUND(AVG(le.RESOLUTION_DAYS), 1) AS avg_resolution_days
FROM FACT_LIFECYCLE_EVENTS le
JOIN DIM_DATE d ON le.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2019
  AND le.NPS_POST_EVENT IS NOT NULL
GROUP BY le.EVENT_TYPE
ORDER BY avg_nps_score DESC;

-- ============================================================================
-- DASHBOARD 4: CHURN ANALYSIS
-- ============================================================================

-- Query 4.1: Churn by Reason
-- Root cause analysis for retention strategy
SELECT
  s.CHURN_REASON,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS churned_count,
  ROUND(100.0 * COUNT(DISTINCT s.SUBSCRIBER_KEY) /
    SUM(COUNT(DISTINCT s.SUBSCRIBER_KEY)) OVER (), 2) AS churn_percent,
  ROUND(AVG(CAST(s.LIFETIME_VALUE AS NUMERIC)), 0) AS avg_ltv_inr,
  ROUND(AVG(s.TENURE_MONTHS), 1) AS avg_tenure_months
FROM DIM_SUBSCRIBER s
WHERE s.CHURN_FLAG = 1
  AND s.CHURN_DATE IS NOT NULL
GROUP BY s.CHURN_REASON
ORDER BY churned_count DESC;

-- Query 4.2: Churn Rate by Customer Segment and Tenure Band
-- Identifies high-risk customer cohorts
SELECT
  s.CUSTOMER_SEGMENT,
  CASE
    WHEN s.TENURE_MONTHS < 6 THEN '0-6 months'
    WHEN s.TENURE_MONTHS < 12 THEN '6-12 months'
    WHEN s.TENURE_MONTHS < 24 THEN '12-24 months'
    ELSE '24+ months'
  END AS tenure_band,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) /
    COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent
FROM DIM_SUBSCRIBER s
GROUP BY s.CUSTOMER_SEGMENT, tenure_band
ORDER BY tenure_band, churn_rate_percent DESC;

-- Query 4.3: Churn Rate by Geography (Region and Tier)
-- Regional retention performance
SELECT
  g.REGION,
  g.TIER,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) /
    COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent
FROM DIM_SUBSCRIBER s
JOIN DIM_GEOGRAPHY g ON s.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
GROUP BY g.REGION, g.TIER
ORDER BY churn_rate_percent DESC;

-- ============================================================================
-- DASHBOARD 5: NETWORK QUALITY
-- ============================================================================

-- Query 5.1: Call Drop Rate by Tower Technology
-- Network reliability metric by infrastructure type
SELECT
  t.TECHNOLOGY,
  t.BAND_MHZ,
  COUNT(DISTINCT u.USAGE_KEY) AS usage_sessions,
  ROUND(AVG(u.CALL_DROP_RATE), 2) AS avg_call_drop_rate_percent,
  ROUND(AVG(u.SIGNAL_STRENGTH_DBM), 1) AS avg_signal_strength_dbm,
  ROUND(AVG(u.AVG_THROUGHPUT_MBPS), 2) AS avg_throughput_mbps
FROM FACT_USAGE u
JOIN DIM_TOWER t ON u.TOWER_KEY = t.TOWER_KEY
WHERE u.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY t.TECHNOLOGY, t.BAND_MHZ
ORDER BY avg_call_drop_rate_percent;

-- Query 5.2: Average Throughput by Geography and Urban/Rural
-- Performance disparity analysis
SELECT
  g.REGION,
  g.URBAN_RURAL,
  COUNT(DISTINCT u.USAGE_KEY) AS usage_sessions,
  ROUND(AVG(u.AVG_THROUGHPUT_MBPS), 2) AS avg_throughput_mbps,
  ROUND(AVG(u.SIGNAL_STRENGTH_DBM), 1) AS avg_signal_strength_dbm,
  ROUND(AVG(u.CALL_DROP_RATE), 2) AS avg_call_drop_rate_percent
FROM FACT_USAGE u
JOIN DIM_GEOGRAPHY g ON u.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
WHERE u.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY g.REGION, g.URBAN_RURAL
ORDER BY avg_throughput_mbps DESC;

-- Query 5.3: Signal Strength Distribution by Urban/Rural and Technology
-- Coverage quality analysis
SELECT
  g.URBAN_RURAL,
  t.TECHNOLOGY,
  COUNT(DISTINCT u.USAGE_KEY) AS usage_sessions,
  ROUND(AVG(u.SIGNAL_STRENGTH_DBM), 1) AS avg_signal_dbm,
  ROUND(MIN(u.SIGNAL_STRENGTH_DBM), 1) AS min_signal_dbm,
  ROUND(MAX(u.SIGNAL_STRENGTH_DBM), 1) AS max_signal_dbm
FROM FACT_USAGE u
JOIN DIM_GEOGRAPHY g ON u.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
JOIN DIM_TOWER t ON u.TOWER_KEY = t.TOWER_KEY
WHERE u.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY g.URBAN_RURAL, t.TECHNOLOGY
ORDER BY g.URBAN_RURAL, avg_signal_dbm DESC;

-- ============================================================================
-- DASHBOARD 6: 5G ADOPTION
-- ============================================================================

-- Query 6.1: 5G Device Penetration Over Time
-- Track 5G device adoption rate
SELECT
  d.FISCAL_YEAR,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  SUM(CASE WHEN dev.IS_5G_CAPABLE = 1 THEN 1 ELSE 0 END) AS 5g_capable_subscribers,
  ROUND(100.0 * SUM(CASE WHEN dev.IS_5G_CAPABLE = 1 THEN 1 ELSE 0 END) /
    COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS 5g_penetration_percent
FROM DIM_SUBSCRIBER s
JOIN DIM_DATE d ON s.ACTIVATION_DATE >= d.FULL_DATE
LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- Query 6.2: 5G Plan Subscriber Count and Revenue
-- Monetization of 5G technology
SELECT
  d.FISCAL_YEAR,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS 5g_plan_subscribers,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS 5g_revenue_inr,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_5g_arpu_inr
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
WHERE d.CALENDAR_YEAR >= 2019
  AND p.IS_5G_ENABLED = 1
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- Query 6.3: 5G Tower Coverage and Capacity
-- Infrastructure expansion tracking
SELECT
  d.FISCAL_YEAR,
  COUNT(DISTINCT t.TOWER_KEY) AS total_towers,
  SUM(CASE WHEN t.TECHNOLOGY LIKE '%5G%' THEN 1 ELSE 0 END) AS 5g_towers,
  ROUND(100.0 * SUM(CASE WHEN t.TECHNOLOGY LIKE '%5G%' THEN 1 ELSE 0 END) /
    COUNT(DISTINCT t.TOWER_KEY), 2) AS 5g_coverage_percent,
  ROUND(AVG(t.CAPACITY_USERS), 0) AS avg_tower_capacity
FROM DIM_TOWER t
JOIN DIM_DATE d ON t.COMMISSIONED_YEAR >= CAST(d.CALENDAR_YEAR AS CHAR)
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR
ORDER BY d.FISCAL_YEAR;

-- ============================================================================
-- DASHBOARD 7: BILLING & PAYMENTS
-- ============================================================================

-- Query 7.1: Payment Status Distribution
-- Accounts receivable and collection health
SELECT
  b.PAYMENT_STATUS,
  COUNT(DISTINCT b.BILLING_KEY) AS invoice_count,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_amount_inr,
  ROUND(AVG(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS avg_invoice_inr,
  ROUND(AVG(b.DAYS_TO_PAYMENT), 1) AS avg_days_to_payment
FROM FACT_BILLING b
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY b.PAYMENT_STATUS
ORDER BY invoice_count DESC;

-- Query 7.2: Days to Payment Trend by Fiscal Year and Segment
-- Payment collection performance by customer type
SELECT
  d.FISCAL_YEAR,
  s.CUSTOMER_SEGMENT,
  COUNT(DISTINCT b.BILLING_KEY) AS invoice_count,
  ROUND(AVG(b.DAYS_TO_PAYMENT), 1) AS avg_days_to_payment,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_invoice_inr
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
WHERE d.CALENDAR_YEAR >= 2019
GROUP BY d.FISCAL_YEAR, s.CUSTOMER_SEGMENT
ORDER BY d.FISCAL_YEAR, avg_days_to_payment DESC;

-- Query 7.3: Overdue Amount by Segment and Circle
-- High-risk collection analysis
SELECT
  s.CUSTOMER_SEGMENT,
  g.CIRCLE_NAME,
  SUM(CASE WHEN b.PAYMENT_STATUS = 'OVERDUE' THEN 1 ELSE 0 END) AS overdue_invoices,
  ROUND(SUM(CASE WHEN b.PAYMENT_STATUS = 'OVERDUE' THEN CAST(b.TOTAL_INVOICE AS NUMERIC) ELSE 0 END), 0) AS overdue_amount_inr,
  ROUND(AVG(CASE WHEN b.PAYMENT_STATUS = 'OVERDUE' THEN b.DAYS_TO_PAYMENT ELSE NULL END), 1) AS avg_days_overdue
FROM FACT_BILLING b
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
JOIN DIM_GEOGRAPHY g ON b.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY s.CUSTOMER_SEGMENT, g.CIRCLE_NAME
HAVING SUM(CASE WHEN b.PAYMENT_STATUS = 'OVERDUE' THEN 1 ELSE 0 END) > 0
ORDER BY overdue_amount_inr DESC;

-- ============================================================================
-- DASHBOARD 8: ROAMING ANALYSIS
-- ============================================================================

-- Query 8.1: Roaming Revenue by Partner
-- International roaming monetization
SELECT
  rp.COUNTRY,
  rp.CARRIER_NAME,
  COUNT(DISTINCT ru.ROAMING_KEY) AS roaming_sessions,
  ROUND(SUM(CAST(ru.TOTAL_ROAMING_CHARGE AS NUMERIC)), 0) AS total_roaming_revenue_inr,
  ROUND(SUM(ru.DATA_MB_USED), 0) AS total_data_mb,
  ROUND(SUM(ru.VOICE_MINUTES_USED), 0) AS total_voice_minutes,
  ROUND(SUM(ru.SMS_SENT), 0) AS total_sms
FROM FACT_ROAMING_USAGE ru
JOIN DIM_ROAMING_PARTNER rp ON ru.PARTNER_KEY = rp.PARTNER_KEY
WHERE ru.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY rp.COUNTRY, rp.CARRIER_NAME
ORDER BY total_roaming_revenue_inr DESC;

-- Query 8.2: Roaming Usage by Destination Country (Data vs Voice)
-- Service usage pattern analysis
SELECT
  ru.DESTINATION_COUNTRY,
  COUNT(DISTINCT ru.ROAMING_KEY) AS roaming_sessions,
  ROUND(SUM(ru.DATA_MB_USED), 0) AS total_data_mb,
  ROUND(SUM(ru.VOICE_MINUTES_USED), 0) AS total_voice_minutes,
  ROUND(SUM(ru.SMS_SENT), 0) AS total_sms,
  ROUND(SUM(CAST(ru.DATA_CHARGE AS NUMERIC)), 0) AS data_revenue_inr,
  ROUND(SUM(CAST(ru.VOICE_CHARGE AS NUMERIC)), 0) AS voice_revenue_inr,
  ROUND(SUM(CAST(ru.TOTAL_ROAMING_CHARGE AS NUMERIC)), 0) AS total_revenue_inr
FROM FACT_ROAMING_USAGE ru
WHERE ru.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY ru.DESTINATION_COUNTRY
ORDER BY total_revenue_inr DESC;

-- Query 8.3: Roaming by Agreement Type
-- Partner agreement performance
SELECT
  rp.AGREEMENT_TYPE,
  rp.REGION,
  COUNT(DISTINCT ru.ROAMING_KEY) AS roaming_sessions,
  ROUND(SUM(CAST(ru.TOTAL_ROAMING_CHARGE AS NUMERIC)), 0) AS total_revenue_inr,
  ROUND(AVG(rp.RATE_PER_MB), 2) AS avg_rate_per_mb_inr,
  COUNT(DISTINCT ru.SUBSCRIBER_KEY) AS unique_subscribers
FROM FACT_ROAMING_USAGE ru
JOIN DIM_ROAMING_PARTNER rp ON ru.PARTNER_KEY = rp.PARTNER_KEY
WHERE ru.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY rp.AGREEMENT_TYPE, rp.REGION
ORDER BY total_revenue_inr DESC;

-- ============================================================================
-- DASHBOARD 9: REGIONAL PERFORMANCE
-- ============================================================================

-- Query 9.1: Revenue by Region and Circle Tier
-- Geographic revenue distribution and performance
SELECT
  g.REGION,
  g.TIER,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)) / NULLIF(COUNT(DISTINCT s.SUBSCRIBER_KEY), 0), 0) AS revenue_per_sub_inr
FROM FACT_BILLING b
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
JOIN DIM_GEOGRAPHY g ON b.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY g.REGION, g.TIER
ORDER BY total_revenue_inr DESC;

-- Query 9.2: ARPU by Circle Name and Urban/Rural
-- Market positioning and service tier analysis
SELECT
  g.CIRCLE_NAME,
  g.URBAN_RURAL,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent
FROM FACT_BILLING b
JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
JOIN DIM_GEOGRAPHY g ON b.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
WHERE b.DATE_KEY IN (SELECT DATE_KEY FROM DIM_DATE WHERE CALENDAR_YEAR >= 2019)
GROUP BY g.CIRCLE_NAME, g.URBAN_RURAL
ORDER BY avg_arpu_inr DESC;

-- Query 9.3: Subscriber Density and Coverage by Tier
-- Market saturation and expansion metrics
SELECT
  g.TIER,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  ROUND(AVG(g.POPULATION_WEIGHT), 1) AS avg_population_weight,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) * 1.0 / NULLIF(AVG(g.POPULATION_WEIGHT), 0) AS subscriber_density_ratio,
  COUNT(DISTINCT t.TOWER_KEY) AS tower_count,
  ROUND(AVG(t.CAPACITY_USERS), 0) AS avg_tower_capacity
FROM DIM_SUBSCRIBER s
JOIN DIM_GEOGRAPHY g ON s.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
LEFT JOIN DIM_TOWER t ON g.GEOGRAPHY_KEY = t.GEOGRAPHY_KEY
GROUP BY g.TIER
ORDER BY subscriber_density_ratio DESC;

-- ============================================================================
-- DASHBOARD 10: CUSTOMER SEGMENTS
-- ============================================================================

-- Query 10.1: Segment Size, LTV, and NPS
-- Customer value and satisfaction by segment
SELECT
  s.CUSTOMER_SEGMENT,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS segment_size,
  ROUND(AVG(CAST(s.LIFETIME_VALUE AS NUMERIC)), 0) AS avg_ltv_inr,
  ROUND(AVG(s.NPS_SCORE), 2) AS avg_nps_score,
  ROUND(SUM(CAST(b.TOTAL_INVOICE AS NUMERIC)), 0) AS total_revenue_inr,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr
FROM DIM_SUBSCRIBER s
LEFT JOIN FACT_BILLING b ON s.SUBSCRIBER_KEY = b.SUBSCRIBER_KEY
LEFT JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
GROUP BY s.CUSTOMER_SEGMENT
ORDER BY total_revenue_inr DESC;

-- Query 10.2: Churn by Segment and Plan Category
-- Segment-specific retention risks
SELECT
  s.CUSTOMER_SEGMENT,
  p.PLAN_CATEGORY,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS total_subscribers,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent,
  ROUND(AVG(s.TENURE_MONTHS), 1) AS avg_tenure_months
FROM DIM_SUBSCRIBER s
LEFT JOIN DIM_PLAN p ON s.PLAN_KEY = p.PLAN_KEY
GROUP BY s.CUSTOMER_SEGMENT, p.PLAN_CATEGORY
ORDER BY churn_rate_percent DESC;

-- Query 10.3: NPS by Segment and Age Band
-- Satisfaction demographics
SELECT
  s.CUSTOMER_SEGMENT,
  s.AGE_BAND,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(AVG(s.NPS_SCORE), 2) AS avg_nps_score,
  SUM(CASE WHEN s.NPS_SCORE >= 9 THEN 1 ELSE 0 END) AS promoter_count,
  SUM(CASE WHEN s.NPS_SCORE BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS passive_count,
  SUM(CASE WHEN s.NPS_SCORE < 7 THEN 1 ELSE 0 END) AS detractor_count
FROM DIM_SUBSCRIBER s
WHERE s.NPS_SCORE IS NOT NULL
GROUP BY s.CUSTOMER_SEGMENT, s.AGE_BAND
ORDER BY avg_nps_score DESC;

-- ============================================================================
-- DASHBOARD 11: DEVICE ANALYTICS
-- ============================================================================

-- Query 11.1: Brand Market Share by Device Tier
-- Competitive device landscape
SELECT
  dev.BRAND,
  dev.DEVICE_TIER,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(100.0 * COUNT(DISTINCT s.SUBSCRIBER_KEY) /
    SUM(COUNT(DISTINCT s.SUBSCRIBER_KEY)) OVER (), 2) AS market_share_percent,
  ROUND(AVG(CAST(p.MONTHLY_ARPU AS NUMERIC)), 2) AS avg_arpu_inr,
  ROUND(AVG(CAST(s.LIFETIME_VALUE AS NUMERIC)), 0) AS avg_ltv_inr
FROM DIM_SUBSCRIBER s
LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
LEFT JOIN DIM_PLAN p ON s.PLAN_KEY = p.PLAN_KEY
WHERE dev.BRAND IS NOT NULL
GROUP BY dev.BRAND, dev.DEVICE_TIER
ORDER BY subscriber_count DESC;

-- Query 11.2: Device Tier Distribution and 5G Capability
-- Segment upgrade opportunity analysis
SELECT
  dev.DEVICE_TIER,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  ROUND(100.0 * COUNT(DISTINCT s.SUBSCRIBER_KEY) /
    SUM(COUNT(DISTINCT s.SUBSCRIBER_KEY)) OVER (), 2) AS tier_distribution_percent,
  SUM(CASE WHEN dev.IS_5G_CAPABLE = 1 THEN 1 ELSE 0 END) AS 5g_capable_count,
  ROUND(100.0 * SUM(CASE WHEN dev.IS_5G_CAPABLE = 1 THEN 1 ELSE 0 END) /
    COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS 5g_penetration_in_tier_percent,
  ROUND(AVG(dev.RAM_GB), 2) AS avg_ram_gb,
  ROUND(AVG(dev.SCREEN_SIZE_IN), 2) AS avg_screen_size_in
FROM DIM_SUBSCRIBER s
LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
WHERE dev.DEVICE_TIER IS NOT NULL
GROUP BY dev.DEVICE_TIER
ORDER BY subscriber_count DESC;

-- Query 11.3: Device Age and Churn
-- Lifecycle-based retention analysis
SELECT
  CASE
    WHEN CAST(2025 AS INT) - dev.LAUNCH_YEAR = 0 THEN 'Current Year'
    WHEN CAST(2025 AS INT) - dev.LAUNCH_YEAR = 1 THEN '1 Year Old'
    WHEN CAST(2025 AS INT) - dev.LAUNCH_YEAR = 2 THEN '2 Years Old'
    WHEN CAST(2025 AS INT) - dev.LAUNCH_YEAR >= 3 THEN '3+ Years Old'
    ELSE 'Unknown'
  END AS device_age_category,
  COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subscriber_count,
  SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) AS churned_subscribers,
  ROUND(100.0 * SUM(CASE WHEN s.CHURN_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.SUBSCRIBER_KEY), 2) AS churn_rate_percent,
  ROUND(AVG(CAST(s.LIFETIME_VALUE AS NUMERIC)), 0) AS avg_ltv_inr,
  ROUND(AVG(s.NPS_SCORE), 2) AS avg_nps_score
FROM DIM_SUBSCRIBER s
LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
WHERE dev.LAUNCH_YEAR IS NOT NULL
GROUP BY device_age_category
ORDER BY
  CASE
    WHEN device_age_category = 'Current Year' THEN 1
    WHEN device_age_category = '1 Year Old' THEN 2
    WHEN device_age_category = '2 Years Old' THEN 3
    ELSE 4
  END;
