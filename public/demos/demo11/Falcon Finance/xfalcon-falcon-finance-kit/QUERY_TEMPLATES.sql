-- =============================================================================
-- FALCON FINANCE — Query Templates
-- Generated: 2026-03-28
-- Schema: public (PostgreSQL)
-- IMPORTANT: All queries use public.TABLE_NAME prefix
-- =============================================================================

-- =============================================================================
-- 1. EXECUTIVE OVERVIEW
-- =============================================================================

-- 1a. Monthly Portfolio KPI Summary (YoY comparison)
SELECT
  d.CALENDAR_YEAR,
  d.CALENDAR_MONTH,
  d.MONTH_NAME,
  -- Transaction metrics
  COUNT(DISTINCT t.TRANSACTION_KEY) AS txn_count,
  SUM(CASE WHEN t.TRANSACTION_TYPE = 'Purchase' AND t.IS_DECLINED = FALSE THEN t.TRANSACTION_AMOUNT ELSE 0 END) AS gross_purchase_volume,
  -- Decline rate
  COUNT(CASE WHEN t.IS_DECLINED THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS decline_rate_pct
FROM public.FACT_TRANSACTIONS t
JOIN public.DIM_DATE d ON t.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR IN (2024, 2025)
GROUP BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, d.MONTH_NAME
ORDER BY d.CALENDAR_YEAR, d.CALENDAR_MONTH;

-- 1b. Portfolio Balance & Revenue Summary (Annual)
SELECT
  d.CALENDAR_YEAR,
  SUM(ca.CURRENT_BALANCE) AS total_balance,
  AVG(ca.UTILIZATION_RATE) AS avg_utilization,
  SUM(ca.INTEREST_CHARGED) AS total_interest_income,
  SUM(ca.FEES_CHARGED) AS total_fee_income,
  COUNT(CASE WHEN ca.ACCOUNT_STATUS = 'Active' THEN 1 END) AS active_accounts,
  COUNT(CASE WHEN ca.IS_NEW_ACCOUNT THEN 1 END) AS new_accounts,
  COUNT(CASE WHEN ca.IS_CHURNED THEN 1 END) AS churned_accounts
FROM public.FACT_CREDIT_ACCOUNTS ca
JOIN public.DIM_DATE d ON ca.DATE_KEY = d.DATE_KEY
GROUP BY d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR;

-- =============================================================================
-- 2. TRANSACTION ANALYTICS
-- =============================================================================

-- 2a. Transaction Volume & Amount by Type (Monthly)
SELECT
  d.CALENDAR_YEAR,
  d.CALENDAR_MONTH,
  t.TRANSACTION_TYPE,
  COUNT(*) AS txn_count,
  SUM(t.TRANSACTION_AMOUNT) AS total_amount,
  AVG(t.TRANSACTION_AMOUNT) AS avg_amount
FROM public.FACT_TRANSACTIONS t
JOIN public.DIM_DATE d ON t.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, t.TRANSACTION_TYPE
ORDER BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, t.TRANSACTION_TYPE;

-- 2b. Transaction by Channel
SELECT
  ch.CHANNEL_NAME,
  ch.CHANNEL_TYPE,
  d.CALENDAR_YEAR,
  COUNT(*) AS txn_count,
  SUM(CASE WHEN t.TRANSACTION_TYPE = 'Purchase' THEN t.TRANSACTION_AMOUNT ELSE 0 END) AS purchase_volume
FROM public.FACT_TRANSACTIONS t
JOIN public.DIM_CHANNEL ch ON t.CHANNEL_KEY = ch.CHANNEL_KEY
JOIN public.DIM_DATE d ON t.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY ch.CHANNEL_NAME, ch.CHANNEL_TYPE, d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR, purchase_volume DESC;

-- 2c. Top Merchant Categories
SELECT
  t.MERCHANT_CATEGORY,
  d.CALENDAR_YEAR,
  COUNT(*) AS txn_count,
  SUM(t.TRANSACTION_AMOUNT) AS total_amount
FROM public.FACT_TRANSACTIONS t
JOIN public.DIM_DATE d ON t.DATE_KEY = d.DATE_KEY
WHERE t.TRANSACTION_TYPE = 'Purchase' AND t.IS_DECLINED = FALSE AND d.CALENDAR_YEAR >= 2024
GROUP BY t.MERCHANT_CATEGORY, d.CALENDAR_YEAR
ORDER BY total_amount DESC;

-- =============================================================================
-- 3. PORTFOLIO HEALTH
-- =============================================================================

-- 3a. Monthly Account Status Distribution
SELECT
  d.CALENDAR_YEAR,
  d.CALENDAR_MONTH,
  ca.ACCOUNT_STATUS,
  COUNT(*) AS account_count,
  SUM(ca.CURRENT_BALANCE) AS total_balance,
  AVG(ca.UTILIZATION_RATE) AS avg_utilization
FROM public.FACT_CREDIT_ACCOUNTS ca
JOIN public.DIM_DATE d ON ca.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, ca.ACCOUNT_STATUS
ORDER BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, ca.ACCOUNT_STATUS;

-- 3b. Portfolio by Credit Tier
SELECT
  ct.TIER_NAME,
  ct.RISK_CATEGORY,
  d.CALENDAR_YEAR,
  COUNT(*) AS account_count,
  SUM(ca.CURRENT_BALANCE) AS total_balance,
  AVG(ca.UTILIZATION_RATE) AS avg_utilization,
  SUM(ca.INTEREST_CHARGED) AS interest_income
FROM public.FACT_CREDIT_ACCOUNTS ca
JOIN public.DIM_CREDIT_TIER ct ON ca.CREDIT_TIER_KEY = ct.CREDIT_TIER_KEY
JOIN public.DIM_DATE d ON ca.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY ct.TIER_NAME, ct.RISK_CATEGORY, d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR, ct.CREDIT_TIER_KEY;

-- =============================================================================
-- 4. BNPL PERFORMANCE
-- =============================================================================

-- 4a. BNPL Monthly Summary
SELECT
  d.CALENDAR_YEAR,
  d.CALENDAR_MONTH,
  COUNT(*) AS order_count,
  SUM(b.ORDER_AMOUNT) AS total_gmv,
  AVG(b.ORDER_AMOUNT) AS avg_order_value,
  SUM(b.MERCHANT_FEE_AMOUNT) AS total_merchant_fees,
  AVG(b.MERCHANT_FEE_RATE) * 100 AS avg_fee_rate_pct,
  COUNT(CASE WHEN b.IS_PAID_IN_FULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS paid_full_rate_pct,
  COUNT(CASE WHEN b.IS_DELINQUENT THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS delinquency_rate_pct
FROM public.FACT_BNPL_ORDERS b
JOIN public.DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY d.CALENDAR_YEAR, d.CALENDAR_MONTH
ORDER BY d.CALENDAR_YEAR, d.CALENDAR_MONTH;

-- 4b. BNPL by Product Category
SELECT
  b.PRODUCT_CATEGORY,
  d.CALENDAR_YEAR,
  COUNT(*) AS order_count,
  SUM(b.ORDER_AMOUNT) AS total_gmv,
  SUM(b.MERCHANT_FEE_AMOUNT) AS merchant_fees,
  COUNT(CASE WHEN b.IS_DELINQUENT THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS delinquency_rate_pct
FROM public.FACT_BNPL_ORDERS b
JOIN public.DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2024
GROUP BY b.PRODUCT_CATEGORY, d.CALENDAR_YEAR
ORDER BY total_gmv DESC;

-- =============================================================================
-- 5. CREDIT RISK & DELINQUENCY
-- =============================================================================

-- 5a. Delinquency Bucket Distribution (Monthly)
SELECT
  d.CALENDAR_YEAR,
  d.CALENDAR_MONTH,
  db.BUCKET_NAME,
  db.BUCKET_CATEGORY,
  COUNT(*) AS event_count,
  SUM(del.BALANCE_AT_DELINQUENCY) AS total_delinquent_balance,
  SUM(del.CHARGE_OFF_AMOUNT) AS total_chargeoffs
FROM public.FACT_DELINQUENCY del
JOIN public.DIM_DATE d ON del.DATE_KEY = d.DATE_KEY
JOIN public.DIM_DELINQUENCY_BUCKET db ON del.DELINQUENCY_BUCKET_KEY = db.BUCKET_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, db.BUCKET_NAME, db.BUCKET_CATEGORY, db.BUCKET_KEY
ORDER BY d.CALENDAR_YEAR, d.CALENDAR_MONTH, db.BUCKET_KEY;

-- 5b. Charge-Off & Recovery Summary (Annual)
SELECT
  d.CALENDAR_YEAR,
  COUNT(*) AS total_delinquency_events,
  SUM(del.BALANCE_AT_DELINQUENCY) AS total_delinquent_balance,
  COUNT(CASE WHEN del.IS_CHARGE_OFF THEN 1 END) AS chargeoff_count,
  SUM(del.CHARGE_OFF_AMOUNT) AS gross_chargeoffs,
  SUM(del.RECOVERY_AMOUNT) AS total_recoveries,
  SUM(del.CHARGE_OFF_AMOUNT) - SUM(del.RECOVERY_AMOUNT) AS net_chargeoffs,
  SUM(del.RECOVERY_AMOUNT) * 100.0 / NULLIF(SUM(del.CHARGE_OFF_AMOUNT), 0) AS recovery_rate_pct
FROM public.FACT_DELINQUENCY del
JOIN public.DIM_DATE d ON del.DATE_KEY = d.DATE_KEY
GROUP BY d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR;

-- 5c. Delinquency by Credit Tier
SELECT
  ct.TIER_NAME,
  ct.RISK_CATEGORY,
  d.CALENDAR_YEAR,
  COUNT(*) AS events,
  SUM(del.BALANCE_AT_DELINQUENCY) AS delinquent_balance,
  SUM(del.CHARGE_OFF_AMOUNT) AS chargeoffs,
  AVG(del.DAYS_PAST_DUE) AS avg_dpd
FROM public.FACT_DELINQUENCY del
JOIN public.DIM_CREDIT_TIER ct ON del.CREDIT_TIER_KEY = ct.CREDIT_TIER_KEY
JOIN public.DIM_DATE d ON del.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY ct.TIER_NAME, ct.RISK_CATEGORY, d.CALENDAR_YEAR, ct.CREDIT_TIER_KEY
ORDER BY d.CALENDAR_YEAR, ct.CREDIT_TIER_KEY;

-- =============================================================================
-- 6. COLLECTIONS PERFORMANCE
-- =============================================================================

-- 6a. Collections by Status
SELECT
  cs.STATUS_NAME,
  cs.STATUS_CATEGORY,
  d.CALENDAR_YEAR,
  COUNT(*) AS events,
  SUM(del.BALANCE_AT_DELINQUENCY) AS balance_at_entry,
  SUM(del.RECOVERY_AMOUNT) AS recovered,
  SUM(del.PROMISE_TO_PAY_AMOUNT) AS promised,
  AVG(del.COLLECTION_CALLS_MADE) AS avg_calls
FROM public.FACT_DELINQUENCY del
JOIN public.DIM_COLLECTION_STATUS cs ON del.COLLECTION_STATUS_KEY = cs.COLLECTION_STATUS_KEY
JOIN public.DIM_DATE d ON del.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY cs.STATUS_NAME, cs.STATUS_CATEGORY, d.CALENDAR_YEAR, cs.COLLECTION_STATUS_KEY
ORDER BY d.CALENDAR_YEAR, cs.COLLECTION_STATUS_KEY;

-- =============================================================================
-- 7. PARTNER PERFORMANCE
-- =============================================================================

-- 7a. Partner Scorecard (Annual)
SELECT
  rp.PARTNER_NAME,
  rp.PARTNER_CATEGORY,
  rp.PARTNER_TIER,
  d.CALENDAR_YEAR,
  SUM(pp.NEW_ACCOUNTS_OPENED) AS new_accounts,
  SUM(pp.CREDIT_APPLICATIONS) AS applications,
  SUM(pp.NEW_ACCOUNTS_OPENED) * 100.0 / NULLIF(SUM(pp.CREDIT_APPLICATIONS), 0) AS approval_rate_pct,
  SUM(pp.TOTAL_CREDIT_SALES) AS total_sales,
  SUM(pp.BNPL_SALES) AS bnpl_sales,
  SUM(pp.INTERCHANGE_REVENUE) AS interchange,
  SUM(pp.NET_INTEREST_INCOME) AS nii,
  SUM(pp.PARTNER_REVENUE_SHARE) AS rev_share_paid
FROM public.FACT_PARTNER_PERFORMANCE pp
JOIN public.DIM_RETAIL_PARTNER rp ON pp.PARTNER_KEY = rp.PARTNER_KEY
JOIN public.DIM_DATE d ON pp.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY rp.PARTNER_NAME, rp.PARTNER_CATEGORY, rp.PARTNER_TIER, d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR, total_sales DESC;

-- =============================================================================
-- 8. CUSTOMER INTELLIGENCE
-- =============================================================================

-- 8a. Customer Segments Overview
SELECT
  c.LOYALTY_SEGMENT,
  c.FICO_SCORE_BAND,
  COUNT(*) AS customer_count,
  COUNT(CASE WHEN c.IS_ACTIVE THEN 1 END) AS active_count
FROM public.DIM_CUSTOMER c
GROUP BY c.LOYALTY_SEGMENT, c.FICO_SCORE_BAND
ORDER BY customer_count DESC;

-- 8b. Customer Demographics
SELECT
  c.AGE_BAND,
  c.INCOME_BAND,
  c.GENDER,
  COUNT(*) AS customer_count
FROM public.DIM_CUSTOMER c
GROUP BY c.AGE_BAND, c.INCOME_BAND, c.GENDER
ORDER BY customer_count DESC;

-- 8c. Acquisition Channel Effectiveness
SELECT
  c.ACQUISITION_CHANNEL,
  c.ACQUISITION_YEAR,
  COUNT(*) AS acquired,
  COUNT(CASE WHEN c.IS_ACTIVE THEN 1 END) AS still_active
FROM public.DIM_CUSTOMER c
GROUP BY c.ACQUISITION_CHANNEL, c.ACQUISITION_YEAR
ORDER BY c.ACQUISITION_YEAR, acquired DESC;

-- =============================================================================
-- 9. PRODUCT MIX ANALYSIS
-- =============================================================================

-- 9a. Product Performance Summary (Annual)
SELECT
  p.PRODUCT_NAME,
  p.PRODUCT_TYPE,
  p.PRODUCT_SUBTYPE,
  d.CALENDAR_YEAR,
  COUNT(*) AS account_snapshots,
  SUM(ca.CURRENT_BALANCE) AS total_balance,
  AVG(ca.UTILIZATION_RATE) AS avg_utilization,
  SUM(ca.INTEREST_CHARGED) AS interest_income,
  SUM(ca.FEES_CHARGED) AS fee_income
FROM public.FACT_CREDIT_ACCOUNTS ca
JOIN public.DIM_PRODUCT p ON ca.PRODUCT_KEY = p.PRODUCT_KEY
JOIN public.DIM_DATE d ON ca.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2023
GROUP BY p.PRODUCT_NAME, p.PRODUCT_TYPE, p.PRODUCT_SUBTYPE, d.CALENDAR_YEAR
ORDER BY d.CALENDAR_YEAR, total_balance DESC;

-- =============================================================================
-- 10. GEOGRAPHIC ANALYSIS
-- =============================================================================

-- 10a. State-Level Portfolio Summary
SELECT
  g.STATE_NAME,
  g.CENSUS_REGION,
  g.URBAN_RURAL,
  d.CALENDAR_YEAR,
  COUNT(DISTINCT t.CUSTOMER_KEY) AS unique_customers,
  COUNT(*) AS txn_count,
  SUM(CASE WHEN t.TRANSACTION_TYPE = 'Purchase' THEN t.TRANSACTION_AMOUNT ELSE 0 END) AS purchase_volume
FROM public.FACT_TRANSACTIONS t
JOIN public.DIM_GEOGRAPHY g ON t.GEO_KEY = g.GEO_KEY
JOIN public.DIM_DATE d ON t.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2024 AND t.IS_DECLINED = FALSE
GROUP BY g.STATE_NAME, g.CENSUS_REGION, g.URBAN_RURAL, d.CALENDAR_YEAR
ORDER BY purchase_volume DESC;

-- 10b. Geographic Risk Concentration
SELECT
  g.STATE_NAME,
  g.CENSUS_REGION,
  d.CALENDAR_YEAR,
  COUNT(*) AS delinquency_events,
  SUM(del.BALANCE_AT_DELINQUENCY) AS delinquent_balance,
  SUM(del.CHARGE_OFF_AMOUNT) AS chargeoffs,
  SUM(del.RECOVERY_AMOUNT) AS recoveries
FROM public.FACT_DELINQUENCY del
JOIN public.DIM_GEOGRAPHY g ON del.PARTNER_KEY = g.GEO_KEY
JOIN public.DIM_DATE d ON del.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_YEAR >= 2024
GROUP BY g.STATE_NAME, g.CENSUS_REGION, d.CALENDAR_YEAR
ORDER BY delinquent_balance DESC;
