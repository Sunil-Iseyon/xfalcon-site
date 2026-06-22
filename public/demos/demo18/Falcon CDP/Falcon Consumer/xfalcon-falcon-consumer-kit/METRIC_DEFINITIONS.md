# Metric Definitions
## Falcon Consumer — Complete KPI Dictionary

**Project**: Falcon Consumer | **Currency**: USD | **Fiscal Year**: Feb-Jan | **Date Range**: 2022–2024

---

## Revenue & Sales Metrics

### 1. Total Revenue (Net Sales)
**Metric Name**: Total Revenue | **Alias**: Net Sales | **Direction**: UP (higher is better)

| Aspect | Detail |
|--------|--------|
| **Description** | Total revenue from all transactions across all channels, business units, and customer types for a given period |
| **Formula (SQL)** | `SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Sum of all customer spending |
| **Unit of Measure** | USD ($) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_SALES |
| **Source Columns** | NET_SALES |
| **Dashboards Using** | Executive Overview, Sales & Revenue, Brand Performance, Loyalty & Retention |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Pre-aggregated in FACT_CUSTOMER_PERFORMANCE; do NOT attempt to derive from FACT_SALES_TRANSACTION (no revenue column). Revenue already computed at BU × goal_type × period × customer_type grain. |

---

### 2. Total Orders
**Metric Name**: Total Orders | **Alias**: Order Count, Order Volume | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Total number of orders placed across all channels and locations for a given period |
| **Formula (SQL)** | `SELECT SUM(NET_ORDERS) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Count of all orders |
| **Unit of Measure** | Orders (count) |
| **Decimal Places** | 0 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_ORDERS |
| **Source Columns** | NET_ORDERS |
| **Dashboards Using** | Executive Overview, Sales & Revenue, Channel Mix, Brand Performance |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Pre-aggregated in FACT_CUSTOMER_PERFORMANCE. Can also COUNT(DISTINCT ORDER_TXN_KEY) from FACT_ORDER_TRANSACTION for transaction-level detail, but pre-aggregated sum is more efficient. |

---

### 3. Total Units Sold
**Metric Name**: Total Units Sold | **Alias**: Net Units, Unit Volume | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Total number of individual units (SKUs) sold across all products, channels, and locations |
| **Formula (SQL)** | `SELECT SUM(NET_UNITS) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Sum of all units sold (items, not orders) |
| **Unit of Measure** | Units (count) |
| **Decimal Places** | 0 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_UNITS |
| **Source Columns** | NET_UNITS |
| **Dashboards Using** | Sales & Revenue, Brand Performance |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Pre-aggregated in FACT_CUSTOMER_PERFORMANCE. No product-level breakdown available without product SKU fact table (gap documented in DASHBOARD_FEASIBILITY.md). |

---

## Order & Transaction Metrics

### 4. Average Order Value (AOV)
**Metric Name**: Average Order Value | **Alias**: AOV, Per Order Average | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Average revenue per order; metric of transaction size |
| **Formula (SQL)** | `SELECT SUM(NET_SALES) / SUM(NET_ORDERS) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Total Revenue ÷ Total Orders |
| **Unit of Measure** | USD ($) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter; filter to goal_type appropriate for analysis context |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_SALES, FACT_CUSTOMER_PERFORMANCE.NET_ORDERS |
| **Source Columns** | NET_SALES, NET_ORDERS |
| **Dashboards Using** | Executive Overview, Sales & Revenue, Channel Mix, Brand Performance |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Also available pre-computed in FACT_CUSTOMER_PERFORMANCE.AVG_ORDER_VALUE. Useful for monitoring basket size trends and channel performance comparisons. |

---

### 5. Units Per Transaction
**Metric Name**: Units Per Transaction | **Alias**: Avg Items per Order, Line Item Density | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Average number of units per order; metric of basket complexity |
| **Formula (SQL)** | `SELECT SUM(NET_UNITS) / SUM(NET_ORDERS) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Total Units ÷ Total Orders |
| **Unit of Measure** | Units per order (decimal) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_UNITS, FACT_CUSTOMER_PERFORMANCE.NET_ORDERS |
| **Source Columns** | NET_UNITS, NET_ORDERS |
| **Dashboards Using** | Sales & Revenue, Brand Performance |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Also available pre-computed in FACT_CUSTOMER_PERFORMANCE.UNITS_PER_TRANSACTION. Higher values indicate larger basket sizes (e.g., multi-item purchases). |

---

### 6. Average Unit Retail (AUR)
**Metric Name**: Average Unit Retail | **Alias**: AUR, Per-Unit Price | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Average retail price per unit sold |
| **Formula (SQL)** | `SELECT SUM(NET_SALES) / SUM(NET_UNITS) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Total Revenue ÷ Total Units |
| **Unit of Measure** | USD ($) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_SALES, FACT_CUSTOMER_PERFORMANCE.NET_UNITS |
| **Source Columns** | NET_SALES, NET_UNITS |
| **Dashboards Using** | Sales & Revenue, Brand Performance |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Also available pre-computed in FACT_CUSTOMER_PERFORMANCE.AVG_UNIT_RETAIL. Useful for monitoring product mix (premium vs. mass) and pricing effectiveness. |

---

## Customer Metrics

### 7. Total Customers
**Metric Name**: Total Customers | **Alias**: Customer Count, Active Customers | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Total number of unique customers who made at least one purchase in a given period |
| **Formula (SQL)** | `SELECT SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Sum of distinct customers in period |
| **Unit of Measure** | Customers (count) |
| **Decimal Places** | 0 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.CUSTOMER_COUNT |
| **Source Columns** | CUSTOMER_COUNT |
| **Dashboards Using** | Executive Overview, Customer Lifecycle, Brand Performance, Customer Segmentation |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Pre-aggregated in FACT_CUSTOMER_PERFORMANCE. Note: summing rows may overcount if aggregating across multiple goal types in single period (each goal type has separate row per BU/period); filter to single goal type or deduplicate. |

---

### 8. Average Spend Per Customer (Avg Spend)
**Metric Name**: Average Spend Per Customer | **Alias**: Avg Spend, APC | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Average revenue generated per customer in a given period |
| **Formula (SQL)** | `SELECT SUM(NET_SALES) / SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Total Revenue ÷ Total Customers |
| **Unit of Measure** | USD ($) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.NET_SALES, FACT_CUSTOMER_PERFORMANCE.CUSTOMER_COUNT |
| **Source Columns** | NET_SALES, CUSTOMER_COUNT |
| **Dashboards Using** | Executive Overview, Sales & Revenue, Customer Segmentation |
| **Calculation Frequency** | Monthly; aggregates to quarterly and annual |
| **Notes** | Also available pre-computed in FACT_CUSTOMER_PERFORMANCE.AVG_SPEND. Key metric for understanding customer value and segment profitability. |

---

### 9. Lifetime Customer Value (LCV)
**Metric Name**: Lifetime Customer Value | **Alias**: LCV, Lifetime Net Amount | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Total revenue generated by a customer across their entire relationship (from account creation to analysis date) |
| **Formula (SQL)** | `SELECT LIFETIME_NET_AMOUNT FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE` |
| **Plain English** | Cumulative revenue per customer since account creation |
| **Unit of Measure** | USD ($) |
| **Decimal Places** | 2 |
| **Required Filters** | IS_CURRENT = TRUE (for SCD2 current state); optional: value segment filter, customer type filter |
| **Source Tables** | DIM_CUSTOMER.LIFETIME_NET_AMOUNT |
| **Source Columns** | LIFETIME_NET_AMOUNT |
| **Dashboards Using** | Customer Segmentation, Household Analysis, Loyalty & Retention |
| **Calculation Frequency** | Monthly snapshot (recalculated each month) |
| **Notes** | Available in DIM_CUSTOMER (SCD2 dimension). Reflects cumulative value for each customer as of last update. Used for Value segmentation (Platinum $5K+, Gold $1K–$5K, Silver $500–$1K, Bronze $1–$500). |

---

### 10. Lifetime Order Count
**Metric Name**: Lifetime Order Count | **Alias**: Total Orders to Date, Lifetime Transactions | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Total number of orders placed by a customer across their entire relationship |
| **Formula (SQL)** | `SELECT LIFETIME_ORDER_COUNT FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE` |
| **Plain English** | Cumulative order count per customer since account creation |
| **Unit of Measure** | Orders (count) |
| **Decimal Places** | 0 |
| **Required Filters** | IS_CURRENT = TRUE (for SCD2 current state); optional: customer type filter |
| **Source Tables** | DIM_CUSTOMER.LIFETIME_ORDER_COUNT |
| **Source Columns** | LIFETIME_ORDER_COUNT |
| **Dashboards Using** | Customer Segmentation, Loyalty & Retention, Household Analysis |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | Used for Behaviour segmentation (Loyal 6+ txn, Frequent 4+ txn, Occasional 1–3 txn) and Lifecycle analysis. |

---

## Customer Type & Segment Metrics

### 11. Customer Mix by Type
**Metric Name**: Customer Mix % | **Alias**: Customer Type Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage distribution of customers by type (NEW, RETURNING, VIP, LAPSED, REACTIVATED) |
| **Formula (SQL)** | `SELECT CUSTOMER_TYPE, SUM(CUSTOMER_COUNT) as count, ROUND(100.0 * SUM(CUSTOMER_COUNT) / (SELECT SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE WHERE ...), 2) as pct FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date] GROUP BY CUSTOMER_TYPE` |
| **Plain English** | Each customer type ÷ Total customers |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range; optional BU filter |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE.CUSTOMER_TYPE, FACT_CUSTOMER_PERFORMANCE.CUSTOMER_COUNT |
| **Source Columns** | CUSTOMER_TYPE, CUSTOMER_COUNT |
| **Dashboards Using** | Executive Overview, Customer Lifecycle, Brand Performance |
| **Calculation Frequency** | Monthly; recalculates for each period |
| **Notes** | Key metric for customer acquisition vs. retention strategy. NEW = ≤90 days, RETURNING = repeat customer, VIP = high-value, LAPSED = 91-365 days inactive, REACTIVATED = win-back customers. |

---

### 12. New Customer Count
**Metric Name**: New Customer Count | **Alias**: New Customers Acquired | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Number of new customers acquired in a given period (first-time purchasers or account creation within 90 days) |
| **Formula (SQL)** | `SELECT SUM(CUSTOMER_COUNT) FROM FACT_CUSTOMER_PERFORMANCE WHERE CUSTOMER_TYPE = 'NEW' AND PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]` |
| **Plain English** | Sum of customers with CUSTOMER_TYPE = NEW |
| **Unit of Measure** | Customers (count) |
| **Decimal Places** | 0 |
| **Required Filters** | Period date range; optional BU filter; CUSTOMER_TYPE = 'NEW' |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE (filtered to CUSTOMER_TYPE = 'NEW') |
| **Source Columns** | CUSTOMER_TYPE, CUSTOMER_COUNT |
| **Dashboards Using** | Executive Overview, Customer Lifecycle, Brand Performance |
| **Calculation Frequency** | Monthly; key metric for CAC and acquisition strategy evaluation |
| **Notes** | Also available from FACT_CUSTOMER_PERFORMANCE where GOAL_TYPE_KEY = [NEW_CUSTOMERS]. Trend this over time to monitor acquisition effectiveness. |

---

### 13. Value Segment Distribution
**Metric Name**: Customer % by Value Segment | **Alias**: Value Tier Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of customers in each value segment: Platinum ($5K+), Gold ($1K–$5K), Silver ($500–$1K), Bronze ($1–$500) |
| **Formula (SQL)** | `SELECT VALUE_SEGMENT_CODE, COUNT(*) as count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) as pct FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE GROUP BY VALUE_SEGMENT_CODE` |
| **Plain English** | Customers in each value tier ÷ Total customers |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | IS_CURRENT = TRUE (SCD2); optional: BU filter (via LOCATION_PREFERRED_KEY), customer type filter |
| **Source Tables** | DIM_CUSTOMER.VALUE_SEGMENT_CODE |
| **Source Columns** | VALUE_SEGMENT_CODE |
| **Dashboards Using** | Customer Segmentation, Executive Overview (optional) |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | Thresholds: Platinum ≥ $5K lifetime, Gold $1K–<$5K, Silver $500–<$1K, Bronze $1–<$500. Segmentation rules in DIM_CUSTOMER_STRATEGY. |

---

### 14. Lifecycle Segment Distribution
**Metric Name**: Customer % by Lifecycle Segment | **Alias**: Lifecycle Tier Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of customers in each lifecycle segment: New (≤90d), At-Risk (91–180d), Lapsed (181–365d), Win-Back (366+d), Loyal (6+ transactions) |
| **Formula (SQL)** | `SELECT LIFECYCLE_SEGMENT_CODE, COUNT(*) as count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) as pct FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE GROUP BY LIFECYCLE_SEGMENT_CODE` |
| **Plain English** | Customers in each lifecycle stage ÷ Total customers |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | IS_CURRENT = TRUE (SCD2) |
| **Source Tables** | DIM_CUSTOMER.LIFECYCLE_SEGMENT_CODE |
| **Source Columns** | LIFECYCLE_SEGMENT_CODE |
| **Dashboards Using** | Customer Segmentation, Customer Lifecycle, Loyalty & Retention |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | Thresholds based on days since last purchase (LAST_PURCHASE_DAYS_AGO) and LIFETIME_ORDER_COUNT. Critical for retention strategy. |

---

### 15. Behaviour Segment Distribution
**Metric Name**: Customer % by Behaviour Segment | **Alias**: Engagement Tier Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of customers in each behaviour segment: VIP (80+ score), Frequent (4+ transactions), Occasional (1–3 transactions) |
| **Formula (SQL)** | `SELECT BEHAVIOUR_SEGMENT_CODE, COUNT(*) as count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE), 2) as pct FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE GROUP BY BEHAVIOUR_SEGMENT_CODE` |
| **Plain English** | Customers in each behaviour tier ÷ Total customers |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | IS_CURRENT = TRUE (SCD2) |
| **Source Tables** | DIM_CUSTOMER.BEHAVIOUR_SEGMENT_CODE |
| **Source Columns** | BEHAVIOUR_SEGMENT_CODE |
| **Dashboards Using** | Customer Segmentation, Loyalty & Retention |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | VIP score 80+; Frequent ≥ 4 lifetime orders; Occasional 1–3 lifetime orders. Used for prioritization and offer strategy. |

---

## Loyalty & Retention Metrics

### 16. Loyalty Rate
**Metric Name**: Loyalty Rate | **Alias**: Loyalty Penetration, % Loyalty Members | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of active customers enrolled in the loyalty program |
| **Formula (SQL)** | `SELECT ROUND(100.0 * COUNT(CASE WHEN IS_LOYALTY_MEMBER = TRUE THEN 1 END) / COUNT(*), 2) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE` |
| **Plain English** | Loyalty members ÷ Total active customers × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | IS_CURRENT = TRUE (SCD2) |
| **Source Tables** | DIM_CUSTOMER.IS_LOYALTY_MEMBER |
| **Source Columns** | IS_LOYALTY_MEMBER |
| **Dashboards Using** | Loyalty & Retention, Executive Overview |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | Target: 60% loyalty penetration. V_LOYALTY_CUSTOMERS view shows 714 members. Track enrollment trend month-over-month. |

---

### 17. PLCC Penetration Rate
**Metric Name**: PLCC Penetration Rate | **Alias**: PLCC %, Credit Card Holder % | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of active customers holding the private label credit card (PLCC) |
| **Formula (SQL)** | `SELECT ROUND(100.0 * COUNT(CASE WHEN PLCC_HOLDER = TRUE THEN 1 END) / COUNT(*), 2) FROM DIM_CUSTOMER WHERE IS_CURRENT = TRUE` |
| **Plain English** | PLCC holders ÷ Total active customers × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | IS_CURRENT = TRUE (SCD2) |
| **Source Tables** | DIM_CUSTOMER.PLCC_HOLDER |
| **Source Columns** | PLCC_HOLDER |
| **Dashboards Using** | Loyalty & Retention, Executive Overview |
| **Calculation Frequency** | Monthly snapshot |
| **Notes** | PLCC enrollment date available for cohort analysis. Correlate PLCC holders with revenue to measure PLCC uplift. |

---

### 18. Customer Retention Rate
**Metric Name**: Retention Rate | **Alias**: % Retained, Active Customer % | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of customers with activity in the current period who were also active in the prior period |
| **Formula (SQL)** | `SELECT ROUND(100.0 * COUNT(DISTINCT c.CUSTOMER_KEY) / COUNT(DISTINCT p.CUSTOMER_KEY), 2) FROM (SELECT DISTINCT CUSTOMER_KEY FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [current_period]) c JOIN (SELECT DISTINCT CUSTOMER_KEY FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [prior_period]) p ON c.CUSTOMER_KEY = p.CUSTOMER_KEY` |
| **Plain English** | Customers in both current & prior period ÷ Customers in prior period × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range; compare sequential periods (month-to-month, quarter-to-quarter) |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE or FACT_ORDER_TRANSACTION |
| **Source Columns** | CUSTOMER_KEY, PERIOD_DATE_KEY / ORDER_DATE_KEY |
| **Dashboards Using** | Loyalty & Retention, Customer Lifecycle |
| **Calculation Frequency** | Monthly or quarterly (period-over-period) |
| **Notes** | Use FACT_CUSTOMER_PERFORMANCE for pre-aggregated view or FACT_ORDER_TRANSACTION for transaction-level detail. Higher = better customer stickiness. |

---

### 19. Churn Rate
**Metric Name**: Churn Rate | **Alias**: % Churned, Customer Loss % | **Direction**: DOWN (lower is better)

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of customers active in the prior period who are no longer active in the current period |
| **Formula (SQL)** | `SELECT ROUND(100.0 * (COUNT(DISTINCT p.CUSTOMER_KEY) - COUNT(DISTINCT c.CUSTOMER_KEY)) / COUNT(DISTINCT p.CUSTOMER_KEY), 2) FROM (SELECT DISTINCT CUSTOMER_KEY FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [current_period]) c FULL OUTER JOIN (SELECT DISTINCT CUSTOMER_KEY FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [prior_period]) p ON c.CUSTOMER_KEY = p.CUSTOMER_KEY` |
| **Plain English** | (Prior period customers - Retained customers) ÷ Prior period customers × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range; compare sequential periods |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE or FACT_ORDER_TRANSACTION |
| **Source Columns** | CUSTOMER_KEY, PERIOD_DATE_KEY / ORDER_DATE_KEY |
| **Dashboards Using** | Loyalty & Retention, Customer Lifecycle |
| **Calculation Frequency** | Monthly or quarterly (period-over-period) |
| **Notes** | Churn = 100% - Retention Rate. Focus on minimizing churn; monitor for accelerating trends. |

---

## Channel & Source Metrics

### 20. Channel Mix by Order Source
**Metric Name**: Order % by Source | **Alias**: Order Source Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of orders by source type: WEB (45%), MOBILE_APP (35%), TABLET (12%), PHONE (8%) |
| **Formula (SQL)** | `SELECT SOURCE_TYPE, COUNT(*) as order_count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date]), 2) as pct FROM FACT_ORDER_TRANSACTION WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date] GROUP BY SOURCE_TYPE` |
| **Plain English** | Orders from each source ÷ Total orders × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range (ORDER_DATE_KEY); optional BU filter |
| **Source Tables** | FACT_ORDER_TRANSACTION.SOURCE_TYPE |
| **Source Columns** | SOURCE_TYPE |
| **Dashboards Using** | Channel Mix, Executive Overview, Brand Performance |
| **Calculation Frequency** | Monthly or weekly |
| **Notes** | WEB 45%, MOBILE_APP 35%, TABLET 12%, PHONE 8% based on historical distribution. Monitor for channel shift (e.g., mobile growth). |

---

### 21. Marketing Channel Performance
**Metric Name**: Orders by Marketing Channel | **Alias**: Channel Attribution Orders | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Number and distribution of orders attributed to each marketing channel: EMAIL, PAID_SEARCH, ORGANIC, SOCIAL, DIRECT, AFFILIATE, SMS |
| **Formula (SQL)** | `SELECT MARKETING_CHANNEL, COUNT(*) as order_count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date]), 2) as pct FROM FACT_ORDER_TRANSACTION WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date] GROUP BY MARKETING_CHANNEL` |
| **Plain English** | Orders from each channel ÷ Total orders × 100 |
| **Unit of Measure** | Orders (count) and Percentage (%) |
| **Decimal Places** | 0 (count), 1 (%) |
| **Required Filters** | Period date range; optional BU filter; optional customer type filter |
| **Source Tables** | FACT_ORDER_TRANSACTION.MARKETING_CHANNEL |
| **Source Columns** | MARKETING_CHANNEL |
| **Dashboards Using** | Marketing Attribution, Channel Mix, Executive Overview |
| **Calculation Frequency** | Daily/weekly/monthly |
| **Notes** | Last-touch attribution only (no multi-touch model). No cost data available; use order count and AOV as proxy for channel efficiency. |

---

### 22. Marketing Channel Conversion Rate
**Metric Name**: Conversion Rate by Channel | **Alias**: Channel Conversion, Conversion % | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of orders attributed to a channel relative to total orders from that channel visitor base (proxy metric) |
| **Formula (SQL)** | `SELECT MARKETING_CHANNEL, COUNT(DISTINCT CUSTOMER_KEY) as customers, COUNT(*) as orders, ROUND(100.0 * COUNT(*) / COUNT(DISTINCT CUSTOMER_KEY), 1) as orders_per_customer FROM FACT_ORDER_TRANSACTION WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date] GROUP BY MARKETING_CHANNEL` |
| **Plain English** | Orders per unique customer by channel (proxy for conversion efficiency) |
| **Unit of Measure** | Orders per customer (decimal) |
| **Decimal Places** | 2 |
| **Required Filters** | Period date range |
| **Source Tables** | FACT_ORDER_TRANSACTION.MARKETING_CHANNEL, FACT_ORDER_TRANSACTION.CUSTOMER_KEY |
| **Source Columns** | MARKETING_CHANNEL, CUSTOMER_KEY, ORDER_DATE_KEY |
| **Dashboards Using** | Marketing Attribution |
| **Calculation Frequency** | Monthly or weekly |
| **Notes** | True conversion rate requires visitor count (not available in fact tables); this metric shows repeat order rate by channel as proxy. Higher = more efficient channel. |

---

## Geographic & Location Metrics

### 23. Distance to Store
**Metric Name**: Avg Distance to Store | **Alias**: Store Proximity | **Direction**: DOWN (closer is better for in-store loyalty)

| Aspect | Detail |
|--------|--------|
| **Description** | Average distance from customer to their nearest or preferred store |
| **Formula (SQL)** | `SELECT AVG(DISTANCE_TO_STORE) as avg_distance FROM FACT_SALES_TRANSACTION WHERE TRANSACTION_DATE_KEY >= [start_date] AND TRANSACTION_DATE_KEY <= [end_date]` |
| **Plain English** | Mean of customer distances to store (km or miles) |
| **Unit of Measure** | Km or Miles (as configured) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range; optional store/region filter |
| **Source Tables** | FACT_SALES_TRANSACTION.DISTANCE_TO_STORE |
| **Source Columns** | DISTANCE_TO_STORE |
| **Dashboards Using** | Geographic Performance, Household Analysis |
| **Calculation Frequency** | Monthly |
| **Notes** | Distance calculated from customer location to store location; useful for understanding geographic trade zone and convenience factors. Segment analysis by proximity tier. |

---

### 24. Regional Revenue Share
**Metric Name**: Revenue % by Region | **Alias**: Regional Distribution | **Direction**: —

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage of total revenue by geographic region: Northeast, Midwest, Southeast, West, South |
| **Formula (SQL)** | `SELECT l.GEO_REGION_ID, SUM(fcp.NET_SALES) as revenue, ROUND(100.0 * SUM(fcp.NET_SALES) / (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [start_date] AND PERIOD_DATE_KEY <= [end_date]), 2) as pct FROM FACT_CUSTOMER_PERFORMANCE fcp JOIN DIM_LOCATION l ON fcp.BUSINESS_UNIT_KEY IN (...) WHERE fcp.PERIOD_DATE_KEY >= [start_date] AND fcp.PERIOD_DATE_KEY <= [end_date] GROUP BY l.GEO_REGION_ID` |
| **Plain English** | Revenue from each region ÷ Total revenue × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Period date range; join to DIM_LOCATION via BUSINESS_UNIT_KEY |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE, DIM_LOCATION |
| **Source Columns** | NET_SALES, GEO_REGION_ID |
| **Dashboards Using** | Geographic Performance, Executive Overview |
| **Calculation Frequency** | Monthly |
| **Notes** | 5 regions: Northeast, Midwest, Southeast, West, South. Each BU owns locations in specific region(s). |

---

## Year-Over-Year & Trend Metrics

### 25. Year-Over-Year (YoY) Growth %
**Metric Name**: YoY Growth % | **Alias**: YoY %, Year-over-Year Change | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage change in a metric from the same period in the prior year |
| **Formula (SQL)** | `SELECT ROUND(100.0 * ((SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [current_year_start] AND PERIOD_DATE_KEY <= [current_year_end]) - (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [prior_year_start] AND PERIOD_DATE_KEY <= [prior_year_end])) / (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY >= [prior_year_start] AND PERIOD_DATE_KEY <= [prior_year_end]), 2)` |
| **Plain English** | (Current Year Revenue - Prior Year Revenue) ÷ Prior Year Revenue × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Fiscal year date ranges (use DIM_DATE.FISCAL_YEAR for alignment) |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE, DIM_DATE |
| **Source Columns** | NET_SALES (or other metric), FISCAL_YEAR |
| **Dashboards Using** | Executive Overview, Sales & Revenue, Brand Performance |
| **Calculation Frequency** | Monthly (vs. same month prior year), quarterly, annual |
| **Notes** | Historical: 2022 $233.2M → 2023 $252.3M (+8.2%) → 2024 $270.9M (+7.3%). Use FISCAL_YEAR for alignment. |

---

### 26. Month-Over-Month (MoM) Growth %
**Metric Name**: MoM Growth % | **Alias**: MoM %, Month-over-Month Change | **Direction**: UP

| Aspect | Detail |
|--------|--------|
| **Description** | Percentage change in a metric from the immediately prior month |
| **Formula (SQL)** | `SELECT ROUND(100.0 * ((SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [current_month]) - (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [prior_month])) / (SELECT SUM(NET_SALES) FROM FACT_CUSTOMER_PERFORMANCE WHERE PERIOD_DATE_KEY = [prior_month]), 2)` |
| **Plain English** | (Current Month Revenue - Prior Month Revenue) ÷ Prior Month Revenue × 100 |
| **Unit of Measure** | Percentage (%) |
| **Decimal Places** | 1 |
| **Required Filters** | Month date keys |
| **Source Tables** | FACT_CUSTOMER_PERFORMANCE, DIM_DATE |
| **Source Columns** | NET_SALES (or other metric), PERIOD_DATE_KEY |
| **Dashboards Using** | Sales & Revenue, Executive Overview |
| **Calculation Frequency** | Monthly |
| **Notes** | Useful for trend detection and operational monitoring. High volatility may indicate seasonality or promotional lift. |

---

## Employee & Data Quality Flags (NOT Filtered)

### 27. Employee Flag Indicator
**Metric Name**: Is Employee | **Alias**: Employee Record | **Direction**: — (informational)

| Aspect | Detail |
|--------|--------|
| **Description** | Boolean flag indicating if customer record is marked as employee (NOT applied as default filter per user requirement) |
| **Formula (SQL)** | `SELECT COUNT(CASE WHEN IS_EMPLOYEE = TRUE THEN 1 END) FROM DIM_CUSTOMER` |
| **Plain English** | Count of records flagged as employee |
| **Unit of Measure** | Count |
| **Decimal Places** | 0 |
| **Required Filters** | None (informational); optional: IS_EMPLOYEE = TRUE for employee-only analysis |
| **Source Tables** | DIM_CUSTOMER.IS_EMPLOYEE |
| **Source Columns** | IS_EMPLOYEE |
| **Dashboards Using** | Data Quality / Audit (not in primary dashboards) |
| **Calculation Frequency** | Snapshot |
| **Notes** | User chose NO exclusions; IS_EMPLOYEE, IS_FRAUD, IS_DECEASED available for optional filtering in advanced use cases. |

---

### 28. Fraud Flag Indicator
**Metric Name**: Is Fraud | **Alias**: Suspected Fraud | **Direction**: — (informational)

| Aspect | Detail |
|--------|--------|
| **Description** | Boolean flag indicating if customer record is marked as suspected fraud (NOT applied as default filter) |
| **Formula (SQL)** | `SELECT COUNT(CASE WHEN IS_FRAUD = TRUE THEN 1 END) FROM DIM_CUSTOMER` |
| **Plain English** | Count of records flagged as fraud |
| **Unit of Measure** | Count |
| **Decimal Places** | 0 |
| **Required Filters** | None (informational); optional: IS_FRAUD = FALSE for clean analysis, IS_FRAUD = TRUE for fraud investigation |
| **Source Tables** | DIM_CUSTOMER.IS_FRAUD |
| **Source Columns** | IS_FRAUD |
| **Dashboards Using** | Data Quality / Audit (not in primary dashboards) |
| **Calculation Frequency** | Snapshot |
| **Notes** | User chose NO exclusions; document this in GLOBAL_FILTERS.md for stakeholder transparency. |

---

### 29. Deceased Flag Indicator
**Metric Name**: Is Deceased | **Alias**: Deceased Customer | **Direction**: — (informational)

| Aspect | Detail |
|--------|--------|
| **Description** | Boolean flag indicating if customer is marked as deceased (NOT applied as default filter) |
| **Formula (SQL)** | `SELECT COUNT(CASE WHEN IS_DECEASED = TRUE THEN 1 END) FROM DIM_CUSTOMER` |
| **Plain English** | Count of records flagged as deceased |
| **Unit of Measure** | Count |
| **Decimal Places** | 0 |
| **Required Filters** | None (informational); optional: IS_DECEASED = FALSE for active customer analysis |
| **Source Tables** | DIM_CUSTOMER.IS_DECEASED |
| **Source Columns** | IS_DECEASED |
| **Dashboards Using** | Data Quality / Audit (not in primary dashboards) |
| **Calculation Frequency** | Snapshot |
| **Notes** | User chose NO exclusions; recommend considering IS_DECEASED = FALSE filter for compliance/sensitivity in final deployment. |

---

## Metric Quick Reference

| # | Metric | Unit | Direction | Source | Dashboard(s) |
|---|--------|------|-----------|--------|------------|
| 1 | Total Revenue | USD | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Sales & Revenue, Brand Performance, Loyalty & Retention |
| 2 | Total Orders | Count | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Sales & Revenue, Channel Mix, Brand Performance |
| 3 | Total Units Sold | Count | UP | FACT_CUSTOMER_PERFORMANCE | Sales & Revenue, Brand Performance |
| 4 | Avg Order Value | USD | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Sales & Revenue, Channel Mix, Brand Performance |
| 5 | Units per Transaction | Count | UP | FACT_CUSTOMER_PERFORMANCE | Sales & Revenue, Brand Performance |
| 6 | Avg Unit Retail | USD | UP | FACT_CUSTOMER_PERFORMANCE | Sales & Revenue, Brand Performance |
| 7 | Total Customers | Count | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Customer Lifecycle, Brand Performance, Customer Segmentation |
| 8 | Avg Spend per Customer | USD | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Sales & Revenue, Customer Segmentation |
| 9 | Lifetime Customer Value | USD | UP | DIM_CUSTOMER | Customer Segmentation, Household Analysis, Loyalty & Retention |
| 10 | Lifetime Order Count | Count | UP | DIM_CUSTOMER | Customer Segmentation, Loyalty & Retention, Household Analysis |
| 11 | Customer Mix % | % | — | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Customer Lifecycle, Brand Performance |
| 12 | New Customer Count | Count | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Customer Lifecycle, Brand Performance |
| 13 | Value Segment % | % | — | DIM_CUSTOMER | Customer Segmentation |
| 14 | Lifecycle Segment % | % | — | DIM_CUSTOMER | Customer Segmentation, Customer Lifecycle, Loyalty & Retention |
| 15 | Behaviour Segment % | % | — | DIM_CUSTOMER | Customer Segmentation, Loyalty & Retention |
| 16 | Loyalty Rate | % | UP | DIM_CUSTOMER | Loyalty & Retention, Executive Overview |
| 17 | PLCC Penetration | % | UP | DIM_CUSTOMER | Loyalty & Retention, Executive Overview |
| 18 | Retention Rate | % | UP | FACT_CUSTOMER_PERFORMANCE | Loyalty & Retention, Customer Lifecycle |
| 19 | Churn Rate | % | DOWN | FACT_CUSTOMER_PERFORMANCE | Loyalty & Retention, Customer Lifecycle |
| 20 | Order % by Source | % | — | FACT_ORDER_TRANSACTION | Channel Mix, Executive Overview, Brand Performance |
| 21 | Orders by Marketing Channel | Count/% | UP | FACT_ORDER_TRANSACTION | Marketing Attribution, Channel Mix, Executive Overview |
| 22 | Marketing Channel Conversion | Orders/Customer | UP | FACT_ORDER_TRANSACTION | Marketing Attribution |
| 23 | Avg Distance to Store | Km/Miles | DOWN | FACT_SALES_TRANSACTION | Geographic Performance, Household Analysis |
| 24 | Revenue % by Region | % | — | FACT_CUSTOMER_PERFORMANCE + DIM_LOCATION | Geographic Performance, Executive Overview |
| 25 | YoY Growth % | % | UP | FACT_CUSTOMER_PERFORMANCE | Executive Overview, Sales & Revenue, Brand Performance |
| 26 | MoM Growth % | % | UP | FACT_CUSTOMER_PERFORMANCE | Sales & Revenue, Executive Overview |
| 27 | Is Employee (Count) | Count | — | DIM_CUSTOMER | Data Quality (optional) |
| 28 | Is Fraud (Count) | Count | — | DIM_CUSTOMER | Data Quality (optional) |
| 29 | Is Deceased (Count) | Count | — | DIM_CUSTOMER | Data Quality (optional) |

---

## Notes on Metric Calculation & Consistency

1. **Fiscal Year Alignment**: All period-over-period calculations should use DIM_DATE.FISCAL_YEAR and FISCAL_MONTH for retail consistency (Feb–Jan calendar).
2. **SCD2 Handling**: When joining DIM_CUSTOMER, always filter to IS_CURRENT = TRUE or apply EFFECTIVE_DATE logic for point-in-time analysis.
3. **Pre-Aggregation**: FACT_CUSTOMER_PERFORMANCE is pre-aggregated; do NOT COUNT DISTINCT CUSTOMER_KEY directly. Use SUM(CUSTOMER_COUNT) instead.
4. **No Exclusions**: IS_EMPLOYEE, IS_FRAUD, IS_DECEASED flags are available but NOT applied by default (per user requirement). Document this transparency in reporting.
5. **Currency**: All monetary metrics in USD ($). No currency conversion needed for historical analysis (all data US-based).
6. **Rounding**: Apply consistent rounding: 2 decimal places for currency, 1 for percentages, 0 for counts.

---

## Next Steps

1. Validate metric formulas against actual warehouse schema and data
2. Calculate baseline values for all metrics (2022–2024 history)
3. Define SLA targets for each metric (e.g., Retention Rate ≥ 85%, YoY Growth ≥ 5%)
4. Document metric dependencies and calculation order (e.g., YoY Growth depends on Total Revenue)
5. Brief analytics team on metric definitions and appropriate filters
6. Implement metric logic in dashboard layer (SQL, Python, or BI tool)
