# Falcon Finance — Dashboard Feasibility Matrix

**Project:** Falcon Finance (Apex Financial Group Credit & BNPL Portfolio)
**Generated:** 2026-03-28
**Data Range:** January 2019 – December 2025 (7 full years)
**Total Tables:** 14 (5 Fact + 9 Dimension)

## Summary

| Status | Count | Dashboards |
|--------|-------|------------|
| READY (90–100%) | 10 | All selected dashboards |
| PARTIAL (50–89%) | 0 | — |
| LIMITED (20–49%) | 0 | — |
| BLOCKED (0–19%) | 0 | — |

All 10 dashboards are fully supported by the available data. No targets/budget table exists, so budget variance comparisons are not available — but all core KPIs, YoY comparisons, and trend analysis are fully supported.

---

## Dashboard Details

### 1. Executive Overview
- **Score:** 95% — READY
- **Primary Sources:** FACT_TRANSACTIONS, FACT_CREDIT_ACCOUNTS, FACT_BNPL_ORDERS, FACT_DELINQUENCY, FACT_PARTNER_PERFORMANCE
- **What works:** Total portfolio balance, transaction volume/amount, BNPL growth, charge-off rates, partner count, customer count, all with YoY/MoM/QoQ trends
- **Limitations:** No formal budget/target table for plan attainment
- **Build Effort:** 1 day
- **Sample Query:** Monthly portfolio summary across all fact tables

### 2. Transaction Analytics
- **Score:** 98% — READY
- **Primary Sources:** FACT_TRANSACTIONS, DIM_DATE, DIM_PRODUCT, DIM_CHANNEL, DIM_RETAIL_PARTNER, DIM_GEOGRAPHY
- **What works:** 3M transactions with type breakdown (Purchase/Payment/Return/Cash Advance), merchant categories, international flags, decline rates, reward points, cashback — all sliceable by product/partner/channel/geography/time
- **Limitations:** None significant
- **Build Effort:** 1 day
- **Sample Query:** Monthly transaction volume and amount by type with YoY

### 3. Portfolio Health
- **Score:** 97% — READY
- **Primary Sources:** FACT_CREDIT_ACCOUNTS, DIM_DATE, DIM_PRODUCT, DIM_CREDIT_TIER, DIM_DELINQUENCY_BUCKET
- **What works:** 1.7M monthly snapshots with balances, credit limits, utilization rates, interest charged, fees, payments, account status (Active/Delinquent/Charged Off), new accounts, churn — all by credit tier and product
- **Limitations:** No intra-month snapshots (month-end only)
- **Build Effort:** 1 day

### 4. BNPL Performance
- **Score:** 96% — READY
- **Primary Sources:** FACT_BNPL_ORDERS, DIM_DATE, DIM_CUSTOMER, DIM_RETAIL_PARTNER, DIM_CHANNEL, DIM_GEOGRAPHY
- **What works:** 600K orders with amounts, installment structure (count/amount), merchant fee rates/amounts, product categories, paid-in-full rates, delinquency flags, APR charged — full BNPL P&L capability
- **Limitations:** No individual installment payment tracking (only order-level flags)
- **Build Effort:** 1 day

### 5. Credit Risk & Delinquency
- **Score:** 95% — READY
- **Primary Sources:** FACT_DELINQUENCY, FACT_CREDIT_ACCOUNTS, DIM_DELINQUENCY_BUCKET, DIM_CREDIT_TIER, DIM_DATE
- **What works:** 520K delinquency events with DPD aging, balance at delinquency, charge-off flags/amounts, recovery amounts, collection calls, promise-to-pay — plus delinquency bucket dimension with reserve rates and regulatory classifications
- **Limitations:** No external bureau data or CECL model outputs
- **Build Effort:** 1 day

### 6. Collections Performance
- **Score:** 93% — READY
- **Primary Sources:** FACT_DELINQUENCY, DIM_COLLECTION_STATUS, DIM_CREDIT_TIER, DIM_DATE
- **What works:** Collection status lifecycle (7 stages), recovery amounts vs. balances, collection calls made, promise-to-pay amounts, charge-off pipeline, expected recovery rates by status
- **Limitations:** No individual collector/agent assignment data
- **Build Effort:** 1 day

### 7. Partner Performance
- **Score:** 98% — READY
- **Primary Sources:** FACT_PARTNER_PERFORMANCE, DIM_RETAIL_PARTNER, DIM_PRODUCT, DIM_GEOGRAPHY, DIM_DATE
- **What works:** 20 partners with monthly data: new accounts, applications, approval rates, credit/BNPL sales, avg transaction value, active cardholders, utilization, revenue share, interchange revenue, net interest income — by product and geography
- **Limitations:** None
- **Build Effort:** 1 day

### 8. Customer Intelligence
- **Score:** 94% — READY
- **Primary Sources:** DIM_CUSTOMER, FACT_TRANSACTIONS, FACT_CREDIT_ACCOUNTS, DIM_GEOGRAPHY
- **What works:** 150K customers with demographics (age band, income band, gender), FICO score bands, loyalty segments, acquisition channels/dates, state/city/ZIP, active flag — joinable to all transaction and account data
- **Limitations:** No behavioral event stream or web session data
- **Build Effort:** 1 day

### 9. Product Mix Analysis
- **Score:** 97% — READY
- **Primary Sources:** DIM_PRODUCT, FACT_TRANSACTIONS, FACT_CREDIT_ACCOUNTS, FACT_BNPL_ORDERS, FACT_PARTNER_PERFORMANCE
- **What works:** 10 products across 4 types (Private Label/Co-Brand/Proprietary/BNPL) with annual fees, base APR, rewards types, credit limit tiers, co-brand flags, launch years — cross-referenced against all fact tables for comprehensive profitability analysis
- **Limitations:** No per-product cost allocation for full P&L
- **Build Effort:** 1 day

### 10. Geographic Analysis
- **Score:** 92% — READY
- **Primary Sources:** DIM_GEOGRAPHY, FACT_TRANSACTIONS, FACT_CREDIT_ACCOUNTS, FACT_DELINQUENCY, DIM_CUSTOMER
- **What works:** 31 US states with Census region/division, urban/rural classification, median household income, population bands — all fact tables joinable by GEO_KEY for state-level concentration analysis
- **Limitations:** Only 31 of 50 states represented; no ZIP-level aggregation in facts
- **Build Effort:** 1 day

---

## Overall Assessment

This is an exceptionally well-structured star schema for consumer credit analytics. All 10 dashboards are READY with 92–98% feasibility scores. The main gap is the absence of a budget/target table, which means plan attainment and variance-to-budget views are not available. However, Year-over-Year, Quarter-over-Quarter, Month-over-Month, and Week-over-Week comparisons are fully supported via the DIM_DATE dimension covering 2019–2026.

**Estimated total build effort:** 10 dashboard days + 1 day for portal + 1 day for QA = 12 days
