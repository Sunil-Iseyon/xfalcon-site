# Falcon Finance — Metric Definitions

The authoritative reference for all KPI calculations used across dashboards.

---

## Portfolio & Balance Metrics

### Total Outstanding Balance
- **Formula:** `SUM(CURRENT_BALANCE)` from FACT_CREDIT_ACCOUNTS for the latest month-end snapshot
- **Unit:** USD ($)
- **Direction:** Contextual (growth = revenue opportunity, but also risk exposure)
- **Conditions:** Filter to `ACCOUNT_STATUS IN ('Active', 'Delinquent')` for active portfolio; include 'Charged Off' for total exposure
- **Source:** FACT_CREDIT_ACCOUNTS.CURRENT_BALANCE
- **Dashboards:** Executive Overview, Portfolio Health

### Total Credit Limit
- **Formula:** `SUM(CREDIT_LIMIT)` from FACT_CREDIT_ACCOUNTS
- **Unit:** USD ($)
- **Direction:** Higher is growth
- **Source:** FACT_CREDIT_ACCOUNTS.CREDIT_LIMIT
- **Dashboards:** Portfolio Health, Product Mix

### Average Utilization Rate
- **Formula:** `AVG(UTILIZATION_RATE)` from FACT_CREDIT_ACCOUNTS (already calculated as CURRENT_BALANCE / CREDIT_LIMIT)
- **Unit:** Percentage (0–100%)
- **Direction:** Moderate is ideal (30–50%); very high (>80%) indicates risk; very low (<10%) indicates inactive
- **Source:** FACT_CREDIT_ACCOUNTS.UTILIZATION_RATE
- **Dashboards:** Executive Overview, Portfolio Health, Credit Risk

### Active Account Count
- **Formula:** `COUNT(*)` from FACT_CREDIT_ACCOUNTS `WHERE ACCOUNT_STATUS = 'Active'` for the latest month-end
- **Unit:** Count
- **Direction:** Higher is better
- **Source:** FACT_CREDIT_ACCOUNTS.ACCOUNT_STATUS
- **Dashboards:** Executive Overview, Portfolio Health

---

## Transaction Metrics

### Transaction Volume
- **Formula:** `COUNT(*)` from FACT_TRANSACTIONS `WHERE IS_DECLINED = FALSE`
- **Unit:** Count
- **Direction:** Higher is better
- **Conditions:** Exclude declined transactions for approved volume; include declined for total attempts
- **Source:** FACT_TRANSACTIONS
- **Dashboards:** Executive Overview, Transaction Analytics

### Gross Purchase Volume
- **Formula:** `SUM(TRANSACTION_AMOUNT)` from FACT_TRANSACTIONS `WHERE TRANSACTION_TYPE = 'Purchase' AND IS_DECLINED = FALSE`
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_TRANSACTIONS.TRANSACTION_AMOUNT
- **Dashboards:** Executive Overview, Transaction Analytics

### Average Transaction Value (ATV)
- **Formula:** `AVG(TRANSACTION_AMOUNT)` from FACT_TRANSACTIONS `WHERE TRANSACTION_TYPE = 'Purchase' AND IS_DECLINED = FALSE`
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_TRANSACTIONS.TRANSACTION_AMOUNT
- **Dashboards:** Transaction Analytics, Partner Performance

### Decline Rate
- **Formula:** `COUNT(CASE WHEN IS_DECLINED THEN 1 END) * 100.0 / COUNT(*)` from FACT_TRANSACTIONS
- **Unit:** Percentage
- **Direction:** Lower is better
- **Source:** FACT_TRANSACTIONS.IS_DECLINED
- **Dashboards:** Transaction Analytics, Credit Risk

### Return Rate
- **Formula:** `COUNT(CASE WHEN TRANSACTION_TYPE = 'Return' THEN 1 END) * 100.0 / COUNT(CASE WHEN TRANSACTION_TYPE = 'Purchase' THEN 1 END)` from FACT_TRANSACTIONS
- **Unit:** Percentage
- **Direction:** Lower is better
- **Source:** FACT_TRANSACTIONS.TRANSACTION_TYPE
- **Dashboards:** Transaction Analytics

---

## Revenue Metrics

### Interest Income
- **Formula:** `SUM(INTEREST_CHARGED)` from FACT_CREDIT_ACCOUNTS
- **Unit:** USD ($)
- **Direction:** Higher is better (primary revenue driver for revolving credit)
- **Source:** FACT_CREDIT_ACCOUNTS.INTEREST_CHARGED
- **Dashboards:** Executive Overview, Portfolio Health, Product Mix

### Fee Income
- **Formula:** `SUM(FEES_CHARGED)` from FACT_CREDIT_ACCOUNTS
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_CREDIT_ACCOUNTS.FEES_CHARGED
- **Dashboards:** Portfolio Health, Product Mix

### Interchange Revenue
- **Formula:** `SUM(INTERCHANGE_REVENUE)` from FACT_PARTNER_PERFORMANCE
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_PARTNER_PERFORMANCE.INTERCHANGE_REVENUE
- **Dashboards:** Executive Overview, Partner Performance

### Merchant Fee Revenue (BNPL)
- **Formula:** `SUM(MERCHANT_FEE_AMOUNT)` from FACT_BNPL_ORDERS
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_BNPL_ORDERS.MERCHANT_FEE_AMOUNT
- **Dashboards:** BNPL Performance, Partner Performance

### Net Interest Income
- **Formula:** `SUM(NET_INTEREST_INCOME)` from FACT_PARTNER_PERFORMANCE
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_PARTNER_PERFORMANCE.NET_INTEREST_INCOME
- **Dashboards:** Partner Performance

---

## BNPL Metrics

### BNPL Order Volume
- **Formula:** `COUNT(*)` from FACT_BNPL_ORDERS
- **Unit:** Count
- **Direction:** Higher is better
- **Source:** FACT_BNPL_ORDERS
- **Dashboards:** Executive Overview, BNPL Performance

### BNPL Gross Merchandise Value (GMV)
- **Formula:** `SUM(ORDER_AMOUNT)` from FACT_BNPL_ORDERS
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_BNPL_ORDERS.ORDER_AMOUNT
- **Dashboards:** BNPL Performance

### BNPL Average Order Value
- **Formula:** `AVG(ORDER_AMOUNT)` from FACT_BNPL_ORDERS
- **Unit:** USD ($)
- **Direction:** Higher is better
- **Source:** FACT_BNPL_ORDERS.ORDER_AMOUNT
- **Dashboards:** BNPL Performance

### BNPL Paid-in-Full Rate
- **Formula:** `COUNT(CASE WHEN IS_PAID_IN_FULL THEN 1 END) * 100.0 / COUNT(*)` from FACT_BNPL_ORDERS
- **Unit:** Percentage
- **Direction:** Higher is better
- **Source:** FACT_BNPL_ORDERS.IS_PAID_IN_FULL
- **Dashboards:** BNPL Performance, Credit Risk

### BNPL Delinquency Rate
- **Formula:** `COUNT(CASE WHEN IS_DELINQUENT THEN 1 END) * 100.0 / COUNT(*)` from FACT_BNPL_ORDERS
- **Unit:** Percentage
- **Direction:** Lower is better
- **Source:** FACT_BNPL_ORDERS.IS_DELINQUENT
- **Dashboards:** BNPL Performance, Credit Risk

### Average Merchant Fee Rate
- **Formula:** `AVG(MERCHANT_FEE_RATE) * 100` from FACT_BNPL_ORDERS
- **Unit:** Percentage
- **Direction:** Higher is better (revenue)
- **Source:** FACT_BNPL_ORDERS.MERCHANT_FEE_RATE
- **Dashboards:** BNPL Performance

---

## Credit Risk Metrics

### Delinquency Rate (30+ DPD)
- **Formula:** `COUNT(CASE WHEN DELINQUENCY_BUCKET_KEY >= 3 THEN 1 END) * 100.0 / COUNT(*)` from FACT_CREDIT_ACCOUNTS (latest month)
- **Unit:** Percentage
- **Direction:** Lower is better
- **Conditions:** Bucket keys 3+ correspond to 30+ DPD (30-59, 60-89, 90-119, 120-179, 180+)
- **Source:** FACT_CREDIT_ACCOUNTS.DELINQUENCY_BUCKET_KEY
- **Dashboards:** Executive Overview, Credit Risk

### Charge-Off Rate
- **Formula:** `SUM(CHARGE_OFF_AMOUNT) * 100.0 / SUM(BALANCE_AT_DELINQUENCY)` from FACT_DELINQUENCY (annual)
- **Unit:** Percentage
- **Direction:** Lower is better
- **Source:** FACT_DELINQUENCY.CHARGE_OFF_AMOUNT, BALANCE_AT_DELINQUENCY
- **Dashboards:** Executive Overview, Credit Risk, Collections

### Net Charge-Off Amount
- **Formula:** `SUM(CHARGE_OFF_AMOUNT) - SUM(RECOVERY_AMOUNT)` from FACT_DELINQUENCY
- **Unit:** USD ($)
- **Direction:** Lower is better
- **Source:** FACT_DELINQUENCY.CHARGE_OFF_AMOUNT, RECOVERY_AMOUNT
- **Dashboards:** Credit Risk, Collections

### Recovery Rate
- **Formula:** `SUM(RECOVERY_AMOUNT) * 100.0 / SUM(CHARGE_OFF_AMOUNT)` from FACT_DELINQUENCY `WHERE IS_CHARGE_OFF = TRUE`
- **Unit:** Percentage
- **Direction:** Higher is better
- **Source:** FACT_DELINQUENCY.RECOVERY_AMOUNT, CHARGE_OFF_AMOUNT
- **Dashboards:** Collections Performance

### Average Days Past Due
- **Formula:** `AVG(DAYS_PAST_DUE)` from FACT_DELINQUENCY `WHERE DAYS_PAST_DUE > 0`
- **Unit:** Days
- **Direction:** Lower is better
- **Source:** FACT_DELINQUENCY.DAYS_PAST_DUE
- **Dashboards:** Credit Risk, Collections

---

## Partner Metrics

### New Accounts Originated
- **Formula:** `SUM(NEW_ACCOUNTS_OPENED)` from FACT_PARTNER_PERFORMANCE
- **Unit:** Count
- **Direction:** Higher is better
- **Source:** FACT_PARTNER_PERFORMANCE.NEW_ACCOUNTS_OPENED
- **Dashboards:** Partner Performance, Executive Overview

### Approval Rate
- **Formula:** `AVG(APPROVAL_RATE) * 100` from FACT_PARTNER_PERFORMANCE (weighted by applications is more accurate: `SUM(NEW_ACCOUNTS_OPENED) * 100.0 / NULLIF(SUM(CREDIT_APPLICATIONS), 0)`)
- **Unit:** Percentage
- **Direction:** Contextual (too high = loose underwriting; too low = lost opportunity)
- **Source:** FACT_PARTNER_PERFORMANCE.APPROVAL_RATE
- **Dashboards:** Partner Performance

### Partner Revenue Share
- **Formula:** `SUM(PARTNER_REVENUE_SHARE)` from FACT_PARTNER_PERFORMANCE
- **Unit:** USD ($)
- **Direction:** Contextual (cost to Apex but investment in partnership)
- **Source:** FACT_PARTNER_PERFORMANCE.PARTNER_REVENUE_SHARE
- **Dashboards:** Partner Performance

---

## Customer Metrics

### Total Active Customers
- **Formula:** `COUNT(*)` from DIM_CUSTOMER `WHERE IS_ACTIVE = TRUE`
- **Unit:** Count
- **Direction:** Higher is better
- **Source:** DIM_CUSTOMER.IS_ACTIVE
- **Dashboards:** Executive Overview, Customer Intelligence

### Customer Churn Rate
- **Formula:** `COUNT(CASE WHEN IS_CHURNED THEN 1 END) * 100.0 / COUNT(*)` from FACT_CREDIT_ACCOUNTS (monthly)
- **Unit:** Percentage
- **Direction:** Lower is better
- **Source:** FACT_CREDIT_ACCOUNTS.IS_CHURNED
- **Dashboards:** Portfolio Health, Customer Intelligence

---

## Growth Metrics (Applied to any base metric)

### Year-over-Year Growth %
- **Formula:** `(Current_Period - Prior_Year_Period) * 100.0 / NULLIF(Prior_Year_Period, 0)`
- **Unit:** Percentage
- **Direction:** Positive is growth
- **Dashboards:** All

### Quarter-over-Quarter Growth %
- **Formula:** `(Current_Quarter - Prior_Quarter) * 100.0 / NULLIF(Prior_Quarter, 0)`
- **Unit:** Percentage
- **Direction:** Positive is growth
- **Dashboards:** All

### Month-over-Month Growth %
- **Formula:** `(Current_Month - Prior_Month) * 100.0 / NULLIF(Prior_Month, 0)`
- **Unit:** Percentage
- **Direction:** Positive is growth
- **Dashboards:** All
