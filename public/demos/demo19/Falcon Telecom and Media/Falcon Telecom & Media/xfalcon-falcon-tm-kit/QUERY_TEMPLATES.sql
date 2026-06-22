-- ============================================================================
-- Falcon Telecom & Media — Query Templates
-- ============================================================================
-- Connector: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__ida_query
-- Schema prefix: NONE (call tables by bare name)
-- Pre-aggregate to <200 rows. Apply global filters from GLOBAL_FILTERS.md.
-- ============================================================================


-- ============================================================================
-- 1. EXECUTIVE OVERVIEW
-- ============================================================================

-- 1.1 Headline KPIs (single-year, 2025)
SELECT
  (SELECT SUM(TOTAL_BILL) FROM FACT_BILLING b JOIN DIM_DATE d ON b.DATE_KEY=d.DATE_KEY WHERE d.YEAR_NUM=2025) AS billed_rev_2025,
  (SELECT COUNT(DISTINCT SUBSCRIBER_KEY) FROM DIM_SUBSCRIBER WHERE IS_ACTIVE=TRUE) AS active_subs,
  (SELECT SUM(GROSS_REVENUE) FROM FACT_AD_REVENUE a JOIN DIM_DATE d ON a.DATE_KEY=d.DATE_KEY WHERE d.YEAR_NUM=2025) AS ad_rev_2025,
  (SELECT COUNT(*) FROM FACT_VIEWERSHIP v JOIN DIM_DATE d ON v.DATE_KEY=d.DATE_KEY WHERE d.YEAR_NUM=2025) AS sessions_2025,
  (SELECT SUM(TOTAL_REVENUE) FROM FACT_TICKET_SALES t JOIN DIM_DATE d ON t.DATE_KEY=d.DATE_KEY WHERE d.YEAR_NUM=2025) AS ticket_rev_2025,
  (SELECT SUM(LICENSE_FEE_M) FROM FACT_CONTENT_RIGHTS r JOIN DIM_DATE d ON r.DATE_KEY=d.DATE_KEY WHERE d.YEAR_NUM=2025) AS license_fee_M_2025;

-- 1.2 Multi-year revenue trend (all 6 domains, by year)
SELECT d.YEAR_NUM AS yr,
       (SELECT SUM(TOTAL_BILL) FROM FACT_BILLING b WHERE EXTRACT(YEAR FROM TO_DATE(CAST(b.DATE_KEY AS TEXT), 'YYYYMMDD')) = d.YEAR_NUM) AS billing,
       SUM(a.GROSS_REVENUE) AS ad_gross
FROM DIM_DATE d
LEFT JOIN FACT_AD_REVENUE a ON a.DATE_KEY=d.DATE_KEY
GROUP BY d.YEAR_NUM ORDER BY yr;
-- Better: run per-fact aggregations and join in JS — much faster.


-- ============================================================================
-- 2. SUBSCRIBER PERFORMANCE
-- ============================================================================

-- 2.1 Annual subscriber events by type
SELECT d.YEAR_NUM AS yr, e.EVENT_TYPE,
       COUNT(*) AS event_cnt,
       SUM(CASE WHEN e.IS_NEW_ACQ THEN 1 ELSE 0 END) AS acq,
       SUM(CASE WHEN e.IS_CHURN THEN 1 ELSE 0 END) AS churn,
       SUM(CASE WHEN e.IS_UPGRADE THEN 1 ELSE 0 END) AS upgrade,
       AVG(e.MRR) AS avg_mrr,
       AVG(e.LIFETIME_VALUE_EST) AS avg_ltv
FROM FACT_SUBSCRIBER_EVENTS e
JOIN DIM_DATE d ON e.DATE_KEY = d.DATE_KEY
GROUP BY d.YEAR_NUM, e.EVENT_TYPE
ORDER BY yr, EVENT_TYPE;

-- 2.2 Monthly net adds (acquisitions − churn) for 2024 and 2025
SELECT d.YEAR_NUM AS yr, d.MONTH_NUM AS mo,
       SUM(CASE WHEN e.IS_NEW_ACQ THEN 1 ELSE 0 END) AS acq,
       SUM(CASE WHEN e.IS_CHURN THEN 1 ELSE 0 END) AS churn_cnt,
       SUM(CASE WHEN e.IS_NEW_ACQ THEN 1 ELSE 0 END)
       - SUM(CASE WHEN e.IS_CHURN THEN 1 ELSE 0 END) AS net_adds
FROM FACT_SUBSCRIBER_EVENTS e
JOIN DIM_DATE d ON e.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM IN (2024, 2025)
GROUP BY d.YEAR_NUM, d.MONTH_NUM
ORDER BY yr, mo;

-- 2.3 Subscriber demographics (segment × age band × active flag)
SELECT s.SEGMENT, s.AGE_BAND, COUNT(*) AS subs,
       SUM(CASE WHEN s.IS_ACTIVE THEN 1 ELSE 0 END) AS active_subs
FROM DIM_SUBSCRIBER s
GROUP BY s.SEGMENT, s.AGE_BAND
ORDER BY subs DESC;


-- ============================================================================
-- 3. BILLING & REVENUE
-- ============================================================================

-- 3.1 Annual billing revenue with component breakdown
SELECT d.YEAR_NUM AS yr,
       SUM(b.TOTAL_BILL) AS billed_rev,
       SUM(b.BASE_CHARGE) AS base,
       SUM(b.DATA_OVERAGE + b.ROAMING_CHARGE) AS overage_roam,
       SUM(b.EQUIPMENT_CHARGE) AS equipment,
       SUM(b.TAXES_FEES) AS taxes_fees,
       AVG(b.TOTAL_BILL) AS arpu,
       SUM(CASE WHEN b.IS_AUTOPAY THEN 1 ELSE 0 END)*1.0/COUNT(*) AS autopay_rate,
       SUM(CASE WHEN b.PAYMENT_STATUS='Paid Late' THEN 1 ELSE 0 END)*1.0/COUNT(*) AS late_rate
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
GROUP BY d.YEAR_NUM
ORDER BY yr;

-- 3.2 Monthly billing trend (2024-2025) — drives YoY line chart
SELECT d.YEAR_NUM AS yr, d.MONTH_NUM AS mo,
       SUM(b.TOTAL_BILL) AS billed_rev,
       COUNT(DISTINCT b.SUBSCRIBER_KEY) AS subs
FROM FACT_BILLING b
JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
WHERE d.YEAR_NUM IN (2024, 2025)
GROUP BY d.YEAR_NUM, d.MONTH_NUM
ORDER BY yr, mo;


-- ============================================================================
-- 4. PLAN & CARRIER MIX
-- ============================================================================

-- 4.1 Plan-mix billing breakdown (drives stacked bar / table)
SELECT p.PLAN_TYPE, p.TECHNOLOGY, p.IS_5G, p.IS_UNLIMITED,
       COUNT(*) AS bills,
       SUM(b.TOTAL_BILL) AS revenue,
       AVG(b.TOTAL_BILL) AS arpu,
       COUNT(DISTINCT b.SUBSCRIBER_KEY) AS subs
FROM FACT_BILLING b
JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
GROUP BY p.PLAN_TYPE, p.TECHNOLOGY, p.IS_5G, p.IS_UNLIMITED
ORDER BY revenue DESC;

-- 4.2 Carrier-level summary (apply IS_PROSPECT filter for default view)
SELECT c.CARRIER_NAME, c.IS_PROSPECT,
       SUM(b.TOTAL_BILL) AS billed_rev,
       AVG(b.TOTAL_BILL) AS arpu,
       COUNT(DISTINCT b.SUBSCRIBER_KEY) AS subs,
       SUM(CASE WHEN b.IS_AUTOPAY THEN 1 ELSE 0 END)*1.0/COUNT(*) AS autopay_rate
FROM FACT_BILLING b
JOIN DIM_CARRIER c ON b.CARRIER_KEY = c.CARRIER_KEY
GROUP BY c.CARRIER_NAME, c.IS_PROSPECT
ORDER BY billed_rev DESC;


-- ============================================================================
-- 5. ADVERTISING REVENUE
-- ============================================================================

-- 5.1 Annual ad revenue
SELECT d.YEAR_NUM AS yr,
       SUM(a.GROSS_REVENUE) AS gross_rev,
       SUM(a.NET_REVENUE) AS net_rev,
       SUM(a.IMPRESSIONS) AS impressions,
       AVG(a.CPM) AS avg_cpm,
       AVG(a.COMPLETION_RATE) AS avg_completion,
       AVG(a.VIEWABILITY_RATE) AS viewability
FROM FACT_AD_REVENUE a
JOIN DIM_DATE d ON a.DATE_KEY = d.DATE_KEY
GROUP BY d.YEAR_NUM
ORDER BY yr;

-- 5.2 Top 20 advertisers
SELECT a.ADVERTISER_NAME, a.INDUSTRY, a.ANNUAL_SPEND_TIER,
       SUM(f.GROSS_REVENUE) AS gross_rev,
       SUM(f.IMPRESSIONS) AS impressions,
       AVG(f.CPM) AS avg_cpm
FROM FACT_AD_REVENUE f
JOIN DIM_ADVERTISER a ON f.ADVERTISER_KEY = a.ADVERTISER_KEY
GROUP BY a.ADVERTISER_NAME, a.INDUSTRY, a.ANNUAL_SPEND_TIER
ORDER BY gross_rev DESC
LIMIT 20;

-- 5.3 Format-mix breakdown
SELECT f.FORMAT_NAME, f.CHANNEL,
       SUM(a.GROSS_REVENUE) AS gross_rev,
       SUM(a.IMPRESSIONS) AS impressions,
       AVG(a.CPM) AS avg_cpm,
       AVG(a.COMPLETION_RATE) AS avg_compl,
       AVG(a.VIEWABILITY_RATE) AS viewability
FROM FACT_AD_REVENUE a
JOIN DIM_AD_FORMAT f ON a.FORMAT_KEY = f.FORMAT_KEY
GROUP BY f.FORMAT_NAME, f.CHANNEL
ORDER BY gross_rev DESC;


-- ============================================================================
-- 6. STREAMING VIEWERSHIP
-- ============================================================================

-- 6.1 Annual viewership headline
SELECT d.YEAR_NUM AS yr,
       COUNT(*) AS sessions,
       SUM(v.VIEW_MINUTES) AS total_min,
       AVG(v.COMPLETION_PCT) AS avg_compl,
       SUM(CASE WHEN v.IS_BINGE THEN 1 ELSE 0 END)*1.0/COUNT(*) AS binge_rate,
       AVG(v.REBUFFER_EVENTS) AS avg_rebuf
FROM FACT_VIEWERSHIP v
JOIN DIM_DATE d ON v.DATE_KEY = d.DATE_KEY
GROUP BY d.YEAR_NUM
ORDER BY yr;

-- 6.2 Platform-level summary
SELECT p.PLATFORM_NAME, p.PARENT_COMPANY, p.PLATFORM_TYPE, p.IS_PROSPECT,
       COUNT(*) AS sessions,
       SUM(v.VIEW_MINUTES) AS minutes,
       AVG(v.COMPLETION_PCT) AS avg_compl,
       SUM(CASE WHEN v.IS_BINGE THEN 1 ELSE 0 END)*1.0/COUNT(*) AS binge_rate
FROM FACT_VIEWERSHIP v
JOIN DIM_MEDIA_PLATFORM p ON v.PLATFORM_KEY = p.PLATFORM_KEY
GROUP BY p.PLATFORM_NAME, p.PARENT_COMPANY, p.PLATFORM_TYPE, p.IS_PROSPECT
ORDER BY sessions DESC;


-- ============================================================================
-- 7. CONTENT RIGHTS & LICENSING
-- ============================================================================

-- 7.1 Annual deal volume + total fees
SELECT d.YEAR_NUM AS yr,
       COUNT(*) AS deals,
       SUM(r.LICENSE_FEE_M) AS total_fee_M,
       AVG(r.LICENSE_FEE_M) AS avg_fee_M,
       AVG(r.TERM_YEARS) AS avg_term,
       AVG(r.REVENUE_SHARE_PCT) AS avg_revshare,
       SUM(r.MINIMUM_GUARANTEE_M) AS total_mg_M
FROM FACT_CONTENT_RIGHTS r
JOIN DIM_DATE d ON r.DATE_KEY = d.DATE_KEY
GROUP BY d.YEAR_NUM
ORDER BY yr;

-- 7.2 Rights type × Exclusivity matrix
SELECT r.RIGHTS_TYPE, r.EXCLUSIVITY,
       COUNT(*) AS deals,
       SUM(r.LICENSE_FEE_M) AS total_fee_M,
       AVG(r.LICENSE_FEE_M) AS avg_fee_M
FROM FACT_CONTENT_RIGHTS r
GROUP BY r.RIGHTS_TYPE, r.EXCLUSIVITY
ORDER BY total_fee_M DESC;

-- 7.3 Top 15 licensors
SELECT m.COMPANY_NAME, m.COMPANY_TYPE,
       SUM(r.LICENSE_FEE_M) AS total_fee_M,
       COUNT(*) AS deals,
       AVG(r.REVENUE_SHARE_PCT) AS avg_revshare
FROM FACT_CONTENT_RIGHTS r
JOIN DIM_MEDIA_COMPANY m ON r.COMPANY_KEY = m.COMPANY_KEY
GROUP BY m.COMPANY_NAME, m.COMPANY_TYPE
ORDER BY total_fee_M DESC
LIMIT 15;


-- ============================================================================
-- 8. LIVE EVENTS & TICKETS
-- ============================================================================

-- 8.1 Annual ticket revenue by event type
SELECT d.YEAR_NUM AS yr, e.EVENT_TYPE,
       COUNT(*) AS txns,
       SUM(s.QUANTITY) AS tickets,
       SUM(s.TOTAL_REVENUE) AS revenue,
       AVG(s.FACE_VALUE) AS avg_face,
       SUM(CASE WHEN s.IS_RESALE THEN s.TOTAL_REVENUE ELSE 0 END) AS resale_rev
FROM FACT_TICKET_SALES s
JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
JOIN DIM_EVENT e ON s.EVENT_KEY = e.EVENT_KEY
GROUP BY d.YEAR_NUM, e.EVENT_TYPE
ORDER BY yr, revenue DESC;

-- 8.2 Tier mix (drives doughnut/horizontal bar)
SELECT t.TIER_NAME, t.IS_VIP,
       COUNT(*) AS txns,
       SUM(s.QUANTITY) AS tickets,
       SUM(s.TOTAL_REVENUE) AS rev,
       AVG(s.FACE_VALUE) AS avg_face,
       AVG(s.DYNAMIC_MARKUP) AS avg_markup
FROM FACT_TICKET_SALES s
JOIN DIM_TICKET_TIER t ON s.TIER_KEY = t.TIER_KEY
GROUP BY t.TIER_NAME, t.IS_VIP
ORDER BY rev DESC;


-- ============================================================================
-- 9. GEOGRAPHIC PERFORMANCE
-- ============================================================================

-- 9.1 Regional cross-domain
SELECT g.REGION,
       COUNT(DISTINCT b.SUBSCRIBER_KEY) AS subs,
       SUM(b.TOTAL_BILL) AS billed_rev
FROM FACT_BILLING b
JOIN DIM_GEOGRAPHY g ON b.GEO_KEY = g.GEO_KEY
GROUP BY g.REGION
ORDER BY billed_rev DESC;

-- 9.2 Top 15 DMAs
SELECT g.DMA_NAME, g.STATE_CODE, g.TIER, g.REGION,
       SUM(b.TOTAL_BILL) AS billed_rev,
       COUNT(DISTINCT b.SUBSCRIBER_KEY) AS subs
FROM FACT_BILLING b
JOIN DIM_GEOGRAPHY g ON b.GEO_KEY = g.GEO_KEY
GROUP BY g.DMA_NAME, g.STATE_CODE, g.TIER, g.REGION
ORDER BY billed_rev DESC
LIMIT 15;


-- ============================================================================
-- 10. SUBSCRIBER 360 (CROSS-DOMAIN)
-- ============================================================================

-- 10.1 Segment × cross-domain engagement
SELECT s.SEGMENT,
       COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subs,
       SUM(b.TOTAL_BILL) AS billed_rev,
       (SELECT COUNT(*) FROM FACT_VIEWERSHIP v
         WHERE v.SUBSCRIBER_KEY IN (SELECT SUBSCRIBER_KEY FROM DIM_SUBSCRIBER WHERE SEGMENT = s.SEGMENT)) AS view_sessions,
       (SELECT COUNT(*) FROM FACT_TICKET_SALES t
         WHERE t.SUBSCRIBER_KEY IN (SELECT SUBSCRIBER_KEY FROM DIM_SUBSCRIBER WHERE SEGMENT = s.SEGMENT)) AS ticket_txns
FROM DIM_SUBSCRIBER s
LEFT JOIN FACT_BILLING b ON s.SUBSCRIBER_KEY = b.SUBSCRIBER_KEY
WHERE s.IS_ACTIVE = TRUE
GROUP BY s.SEGMENT
ORDER BY billed_rev DESC;


-- ============================================================================
-- 11. CHURN ANALYSIS DEEP DIVE
-- ============================================================================

-- 11.1 Churn reason mix
SELECT e.CHURN_REASON,
       COUNT(*) AS churn_cnt,
       AVG(e.MRR) AS avg_mrr_lost,
       AVG(e.LIFETIME_VALUE_EST) AS avg_ltv_lost
FROM FACT_SUBSCRIBER_EVENTS e
WHERE e.IS_CHURN = TRUE AND e.CHURN_REASON IS NOT NULL
GROUP BY e.CHURN_REASON
ORDER BY churn_cnt DESC;

-- 11.2 Churn by carrier × year
SELECT d.YEAR_NUM AS yr, c.CARRIER_NAME,
       SUM(CASE WHEN e.IS_CHURN THEN 1 ELSE 0 END) AS churn_cnt,
       AVG(CASE WHEN e.IS_CHURN THEN e.LIFETIME_VALUE_EST END) AS avg_ltv_lost
FROM FACT_SUBSCRIBER_EVENTS e
JOIN DIM_DATE d ON e.DATE_KEY = d.DATE_KEY
JOIN DIM_CARRIER c ON e.CARRIER_KEY = c.CARRIER_KEY
WHERE c.IS_PROSPECT = TRUE
GROUP BY d.YEAR_NUM, c.CARRIER_NAME
ORDER BY yr, churn_cnt DESC;

-- 11.3 Churn by segment × tenure band
SELECT s.SEGMENT,
       CASE
         WHEN s.TENURE_MONTHS < 12 THEN '0-12 months'
         WHEN s.TENURE_MONTHS < 24 THEN '12-24 months'
         WHEN s.TENURE_MONTHS < 48 THEN '24-48 months'
         ELSE '48+ months'
       END AS tenure_band,
       COUNT(DISTINCT s.SUBSCRIBER_KEY) AS subs,
       SUM(CASE WHEN s.IS_ACTIVE THEN 0 ELSE 1 END) AS inactive_subs
FROM DIM_SUBSCRIBER s
GROUP BY s.SEGMENT,
       CASE
         WHEN s.TENURE_MONTHS < 12 THEN '0-12 months'
         WHEN s.TENURE_MONTHS < 24 THEN '12-24 months'
         WHEN s.TENURE_MONTHS < 48 THEN '24-48 months'
         ELSE '48+ months'
       END
ORDER BY s.SEGMENT, tenure_band;
