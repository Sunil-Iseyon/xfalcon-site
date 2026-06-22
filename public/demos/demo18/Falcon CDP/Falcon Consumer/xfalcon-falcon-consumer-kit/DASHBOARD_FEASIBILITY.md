# Dashboard Feasibility Assessment
## Falcon Consumer — Multi-Brand Luxury Retail CDP

**Project**: Falcon Consumer | **Currency**: USD | **Fiscal Year Start**: February | **Date Range**: 2022–2024

---

## Executive Summary

11 proposed dashboards assessed across availability, readiness, and implementation effort. **9 dashboards READY (85%+ confidence)**, **1 dashboard PARTIAL (65%, product-level data gap)**, **1 dashboard READY (85%, household-to-sales linkage stable)**.

---

## Dashboard Scorecard

### 1. Executive Overview
**Readiness Score: 95% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. All KPIs available from pre-aggregated FACT_CUSTOMER_PERFORMANCE. |
| **Primary Data Sources** | FACT_CUSTOMER_PERFORMANCE (16,800 rows) aggregated by period, BU, customer type, goal type |
| **Key Metrics Available** | Total Revenue (NET_SALES), Total Orders (NET_ORDERS), Total Customers (CUSTOMER_COUNT), Avg Order Value (AVG_ORDER_VALUE), Avg Spend per Customer (AVG_SPEND), YoY Growth % |
| **What Works** | Period-level aggregations already computed; BU and customer type dimensions ready; fiscal calendar available |
| **What's Limited** | Daily drill-down not available; revenue only at pre-aggregated grain (monthly, quarterly, annual) |
| **Workaround** | Use DIM_DATE for fiscal navigation; SUM(NET_SALES) by BUSINESS_UNIT_KEY and FISCAL_PERIOD_ID for highest fidelity |
| **Build Effort** | 2–3 days — design, wireframe, SQL tuning |
| **Sample Query** | See QUERY_TEMPLATES.sql #1 |

---

### 2. Sales & Revenue
**Readiness Score: 90% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Revenue granularity up to BU × customer type × period × goal type. |
| **Primary Data Sources** | FACT_CUSTOMER_PERFORMANCE (NET_SALES, NET_ORDERS, AVG_ORDER_VALUE columns) |
| **Key Metrics Available** | Total Revenue by BU, Customer Type; Order count by channel (via SOURCE_TYPE aggregation); AOV trend |
| **What Works** | Pre-aggregated revenue metrics; multi-dimensional slicing; fiscal and calendar period support |
| **What's Limited** | No transaction-level detail; goal_type must be filtered to context (e.g., goal_type_key = 1 for New Customer revenue) |
| **Workaround** | Document goal_type semantics in METRIC_DEFINITIONS.md; pre-filter FACT_CUSTOMER_PERFORMANCE before aggregation |
| **Build Effort** | 3–4 days — design revenue hierarchy, time-series, BU variance charts |
| **Sample Query** | See QUERY_TEMPLATES.sql #2 |

---

### 3. Customer Lifecycle
**Readiness Score: 95% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Customer type dimension and counts directly available. |
| **Primary Data Sources** | FACT_CUSTOMER_PERFORMANCE (CUSTOMER_TYPE: NEW, RETURNING, VIP, LAPSED, REACTIVATED) + DIM_CUSTOMER (customer flags, lifecycle segments) |
| **Key Metrics Available** | Customer count by type; revenue and orders by lifecycle stage; new customer acquisition; reactivation and retention rates |
| **What Works** | CUSTOMER_TYPE in FACT_CUSTOMER_PERFORMANCE; DIM_CUSTOMER has CUSTOMER_LIFECYCLE_SEGMENT_CODE; full time-series |
| **What's Limited** | Lifecycle transition logic not exposed as fact; need to compute cohorts from DIM_CUSTOMER.CREATED_DATE |
| **Workaround** | Aggregate FACT_CUSTOMER_PERFORMANCE by CUSTOMER_TYPE and PERIOD_DATE_KEY; join DIM_CUSTOMER for current-state flags |
| **Build Effort** | 3–4 days — cohort design, waterfall funnel, sankey transitions |
| **Sample Query** | See QUERY_TEMPLATES.sql #3 |

---

### 4. Loyalty & Retention
**Readiness Score: 85% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Loyalty data available; PLCC and membership tracked. |
| **Primary Data Sources** | DIM_CUSTOMER (IS_LOYALTY_MEMBER, PLCC_HOLDER, LOYALTY_MEMBER_ID, LOYALTY_ENROLLED_DATE, LOYALTY_TIER_NAME) + V_LOYALTY_CUSTOMERS (714 members snapshot) + FACT_CUSTOMER_PERFORMANCE (GOAL_TYPE_KEY = LOYALTY_ENROLL) |
| **Key Metrics Available** | Loyalty membership rate (%); PLCC penetration; loyalty revenue vs. non-loyalty; enrollment trend; tier distribution |
| **What Works** | Loyalty enrollment dates precise; tier codes available; PLCC boolean flag; V_LOYALTY_CUSTOMERS view for quick snapshots |
| **What's Limited** | Retention definition (churn) not pre-computed; must calculate from last purchase date + rules |
| **Workaround** | Calculate days since last transaction; flag as churned if >365 days; link to DIM_DATE for cohort aging |
| **Build Effort** | 4–5 days — retention curves, churn prediction, PLCC uplift analysis |
| **Sample Query** | See QUERY_TEMPLATES.sql #4 |

---

### 5. Channel Mix
**Readiness Score: 90% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Multiple channel sources tracked at order and sales levels. |
| **Primary Data Sources** | FACT_ORDER_TRANSACTION (SOURCE_TYPE: WEB, MOBILE_APP, TABLET, PHONE; percentages 45%, 35%, 12%, 8%) + DIM_LOCATION (CHANNEL_TYPE) + FACT_SALES_TRANSACTION (CUSTOMER_LOCALITY sourced from order/store data) |
| **Key Metrics Available** | Orders by source; revenue by channel (from FACT_CUSTOMER_PERFORMANCE.SOURCE_TYPE aggregation); customer locality |
| **What Works** | SOURCE_TYPE in order transactions; CHANNEL_TYPE in locations; MARKETING_CHANNEL in FACT_ORDER_TRANSACTION |
| **What's Limited** | Cross-channel attribution complex (single order may touch multiple channels); FACT_SALES_TRANSACTION has no monetary columns |
| **Workaround** | Use FACT_ORDER_TRANSACTION for order-level attribution; link to FACT_CUSTOMER_PERFORMANCE for revenue by BU and time |
| **Build Effort** | 3–4 days — sankey channel flow, source funnel, attribution modeling |
| **Sample Query** | See QUERY_TEMPLATES.sql #5 |

---

### 6. Marketing Attribution
**Readiness Score: 85% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Marketing channel dimension available; channel mix documented. |
| **Primary Data Sources** | FACT_ORDER_TRANSACTION (MARKETING_CHANNEL: EMAIL, PAID_SEARCH, ORGANIC, SOCIAL, DIRECT, AFFILIATE, SMS) + FACT_CUSTOMER_PERFORMANCE (can aggregate by BUSINESS_UNIT_KEY and time) |
| **Key Metrics Available** | Orders and order count by marketing channel; ROAS proxy (orders ÷ orders by channel); customer acquisition cost context |
| **What Works** | MARKETING_CHANNEL captured at order level; order dates aligned to DIM_DATE |
| **What's Limited** | No cost or spend column in fact tables; cannot calculate true ROAS; last-touch attribution only (no multi-touch model) |
| **Workaround** | Calculate order counts and AOV by channel as proxy for efficiency; document as "order attribution" not spend attribution |
| **Build Effort** | 3–4 days — channel performance cards, conversion funnels, propensity modeling |
| **Sample Query** | See QUERY_TEMPLATES.sql #6 |

---

### 7. Brand Performance
**Readiness Score: 90% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. All 7 business units have revenue, orders, and customer metrics. |
| **Primary Data Sources** | FACT_CUSTOMER_PERFORMANCE aggregated by BUSINESS_UNIT_KEY + DIM_BUSINESS_UNIT (BU name, channel type, region) |
| **Key Metrics Available** | Revenue by BU; order count by BU; customer count by BU; growth rate; share of wallet (% of total); BU-level AOV |
| **What Works** | BUSINESS_UNIT_KEY in all facts; DIM_BUSINESS_UNIT fully populated (7 units); metrics pre-aggregated |
| **What's Limited** | Sub-BU drill-down not available (each BU is atomic); store-level detail only in DIM_LOCATION but not fact-linked at BU grain |
| **Workaround** | Use FACT_SALES_TRANSACTION + FACT_ORDER_TRANSACTION with LOCATION_KEY for store-level detail; join to DIM_LOCATION and DIM_BUSINESS_UNIT |
| **Build Effort** | 2–3 days — BU comparison tables, growth charts, market share cards |
| **Sample Query** | See QUERY_TEMPLATES.sql #7 |

---

### 8. Product Category
**Readiness Score: 65% — PARTIAL**

| Aspect | Detail |
|--------|--------|
| **Status** | Limited. DIM_PRODUCT fully defined (90 items, category hierarchy, brand hierarchy, luxury flag); **NO product-level sales fact available**. |
| **Primary Data Sources** | DIM_PRODUCT (90 rows, Category L1/L2, Retail Hierarchy, Brand L1/L2, IS_LUXURY flag) only; no FACT_PRODUCT_SALES or line-item detail |
| **Key Metrics Available** | Product catalog display; brand and category hierarchy; luxury product identification |
| **What Works** | Complete product master data; category and brand hierarchies; luxury/non-luxury classification |
| **What's Limited** | **Critical**: No product-level transaction detail. Cannot calculate product revenue, units sold, or sell-through. Can only show catalog and hierarchy. |
| **Workaround** | (1) Ingest product SKU and line-item data if available from POS systems and re-join to FACT_SALES_TRANSACTION / FACT_ORDER_TRANSACTION (requires data engineering). (2) Build a reference "Product Atlas" dashboard showing catalog, hierarchy, and brand performance at BU level (fallback). (3) Coordinate with data engineering to ETL product-sales line items. |
| **Build Effort** | **8–10 days** (fallback) or **2–3 weeks** (with new data source). Dashboard cannot deliver product-level KPIs without fact table. Recommend escalation to data team. |
| **Sample Query** | See QUERY_TEMPLATES.sql #8 (catalog reference query only) |

---

### 9. Geographic Performance
**Readiness Score: 85% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Geographic dimensions and customer locality fully tracked. |
| **Primary Data Sources** | FACT_SALES_TRANSACTION (CUSTOMER_LOCALITY, DISTANCE_TO_STORE) + DIM_LOCATION (GEO_REGION_ID, STATE_CODE, address, store name) + DIM_BUSINESS_UNIT (region mapping) |
| **Key Metrics Available** | Sales by geographic region; customer proximity to store; cross-region customer movement; location-level traffic (order counts) |
| **What Works** | CUSTOMER_LOCALITY and DISTANCE_TO_STORE in sales facts; DIM_LOCATION fully mapped (20 locations); region codes available |
| **What's Limited** | FACT_SALES_TRANSACTION has no revenue or units column (locality/distance only); must aggregate via FACT_CUSTOMER_PERFORMANCE or link orders for revenue. |
| **Workaround** | Link FACT_SALES_TRANSACTION → FACT_ORDER_TRANSACTION → FACT_CUSTOMER_PERFORMANCE by date and customer for revenue; use sales txn count as proxy for traffic. |
| **Build Effort** | 4–5 days — heat maps, store performance cards, regional trend analysis |
| **Sample Query** | See QUERY_TEMPLATES.sql #9 |

---

### 10. Customer Segmentation
**Readiness Score: 90% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Comprehensive segmentation framework pre-built. |
| **Primary Data Sources** | DIM_CUSTOMER (60+ attributes: VALUE_SEGMENT_CODE, LIFECYCLE_SEGMENT_CODE, BEHAVIOUR_SEGMENT_CODE, CUSTOMER_TYPE, household, demographics) + DIM_CUSTOMER_STRATEGY (84 rules per BU for Value/Lifecycle/Behaviour segmentation) |
| **Key Metrics Available** | Customers by Value segment (Platinum $5K+, Gold $1K–$5K, Silver $500–$1K, Bronze $1–$500); Lifecycle segment (New ≤90 days, At-Risk 91–180, Lapsed 181–365, Win-Back 366+, Loyal 6+ txn); Behaviour segment (VIP 80+ score, Frequent 4+ txn, Occasional 1–3 txn) |
| **What Works** | All three segmentation dimensions present; rules documented in DIM_CUSTOMER_STRATEGY; revenue linkage available |
| **What's Limited** | Segmentation rules are configuration rows; no algorithmic scoring (pre-computed codes only); historical segment movement not tracked (current state only) |
| **Workaround** | Use segment codes for current-state analysis; calculate segment migration by comparing monthly snapshots or use SCD2 history in DIM_CUSTOMER |
| **Build Effort** | 3–4 days — segment distribution cards, value waterfall, cohort comparison |
| **Sample Query** | See QUERY_TEMPLATES.sql #10 |

---

### 11. Household Analysis
**Readiness Score: 85% — READY**

| Aspect | Detail |
|--------|--------|
| **Status** | Production-ready. Household dimension defined; linkage to sales and customers established. |
| **Primary Data Sources** | DIM_HOUSEHOLD (600 rows: size, children flag, income, marital status) + FACT_SALES_TRANSACTION (HOUSEHOLD_KEY) + DIM_CUSTOMER (HOUSEHOLD_KEY) |
| **Key Metrics Available** | Transactions by household size; household income distribution; children presence correlation with category affinity; multi-person household spend patterns |
| **What Works** | HOUSEHOLD_KEY in DIM_CUSTOMER and FACT_SALES_TRANSACTION; size, children, and income attributes fully populated |
| **What's Limited** | FACT_SALES_TRANSACTION has no revenue column; household cohesion (simultaneous purchases) not pre-computed |
| **Workaround** | Aggregate FACT_SALES_TRANSACTION count by HOUSEHOLD_KEY and join to DIM_HOUSEHOLD for insights; link to FACT_CUSTOMER_PERFORMANCE via CUSTOMER_KEY for revenue |
| **Build Effort** | 3–4 days — household profiling, income tier analysis, family composition insights |
| **Sample Query** | See QUERY_TEMPLATES.sql #11 |

---

## Build Effort Summary

| Dashboard | Score | Status | Effort (Days) | Complexity |
|-----------|-------|--------|---------------|-----------|
| Executive Overview | 95% | READY | 2–3 | Low |
| Sales & Revenue | 90% | READY | 3–4 | Medium |
| Customer Lifecycle | 95% | READY | 3–4 | Medium |
| Loyalty & Retention | 85% | READY | 4–5 | High |
| Channel Mix | 90% | READY | 3–4 | Medium |
| Marketing Attribution | 85% | READY | 3–4 | Medium |
| Brand Performance | 90% | READY | 2–3 | Low |
| Product Category | 65% | PARTIAL | 8–10 | Very High |
| Geographic Performance | 85% | READY | 4–5 | High |
| Customer Segmentation | 90% | READY | 3–4 | Medium |
| Household Analysis | 85% | READY | 3–4 | Medium |

**Total Estimated Build Time**: 41–49 days (excluding Product Category escalation)

---

## Critical Data Gaps & Mitigations

### Gap 1: Product-Level Sales
- **Issue**: DIM_PRODUCT exists but no FACT_PRODUCT_SALES or line-item detail
- **Impact**: Product Category dashboard (65%) cannot deliver product revenue/units metrics
- **Mitigation**: Escalate to data engineering for product SKU ETL; fallback to Product Atlas reference dashboard

### Gap 2: FACT_SALES_TRANSACTION Has No Monetary Columns
- **Issue**: Revenue only in FACT_CUSTOMER_PERFORMANCE (pre-aggregated grain)
- **Impact**: Cannot drill from geography/locality to individual transaction detail
- **Mitigation**: Link FACT_SALES_TRANSACTION → FACT_ORDER_TRANSACTION → DIM_DATE + FACT_CUSTOMER_PERFORMANCE via BU, period, customer type

### Gap 3: Marketing Cost / Spend Data
- **Issue**: MARKETING_CHANNEL in facts but no spend/cost column
- **Impact**: Cannot calculate ROAS or CAC
- **Mitigation**: Use order count and AOV as proxy metrics; document as "attribution efficiency" not spend-based ROAS

### Gap 4: Churn / Retention Definition
- **Issue**: No pre-computed churn flag; retention logic not explicit
- **Impact**: Loyalty dashboard must compute churn from last purchase date
- **Mitigation**: Create derived flag in SQL: `CASE WHEN DATEDIFF(day, MAX(ORDER_DATE), CURDATE()) > 365 THEN 'Churned' ELSE 'Active' END`

---

## Recommendations

1. **Prioritize Dashboards 1, 2, 3, 7** — Lowest effort (2–3 days), highest business impact. Executive overview and revenue trend critical for C-suite.
2. **Escalate Product Category** — Requires data engineering; do not attempt without product SKU fact table. Offer fallback Product Atlas.
3. **Bundle Loyalty & Retention (Dashboard 4)** — High value for CRM; recommend 4–5 day build after core dashboards.
4. **Geographic Performance (Dashboard 9)** — Requires careful join logic (FACT_SALES_TRANSACTION → revenue linkage); plan 4–5 days, allocate QA.
5. **Household & Segmentation (Dashboards 10, 11)** — Lower priority; can defer to Phase 2 if timeline constrained.

---

## Data Quality Notes

- **No exclusions applied** (no employee, fraud, or deceased filter) — user directive
- **Fiscal year starts February** — all period calculations via DIM_DATE.FISCAL_* columns
- **SCD2 tracking** — DIM_CUSTOMER has effective date ranges; validate for period-over-period consistency
- **Aggregate grain** — FACT_CUSTOMER_PERFORMANCE already computed; row count is manageable (16,800)

---

## Next Steps

1. Review this feasibility assessment with stakeholder / project sponsor
2. Approve dashboard prioritization and timeline
3. Begin SQL development using QUERY_TEMPLATES.sql for each dashboard
4. Confirm theme colors with Brand team (see RETAILEDGE_THEME.md)
5. Escalate Product Category gap to data engineering (if required)
