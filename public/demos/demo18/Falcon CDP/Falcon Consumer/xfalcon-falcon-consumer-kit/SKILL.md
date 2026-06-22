# Falcon Consumer AnalyticsPro Build Skill
## Project-Specific Dashboard Development Guide

**Project**: Falcon Consumer | **Domain**: Multi-Brand Luxury Retail CDP | **Skill Version**: 1.0 | **Last Updated**: 2024-04-15

---

## Quick Reference

**IDA Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

**Data Source**: Falcon Consumer CDP Warehouse

**Key Dates**: 2022-01-01 to 2024-12-31 (3 years)

**Currency**: USD ($)

**Fiscal Year**: February - January (Retail 4-5-4 Calendar)

**Dashboard Count**: 11 planned

**Build Time**: 41–49 days total (6–8 weeks)

---

## Project Overview

Falcon Consumer is a multi-brand luxury retail CDP (Customer Data Platform) with 7 business units, 20 store/channel locations, and ~1,380 customers. The AnalyticsPro kit provides pre-built dashboards for C-suite, brand managers, and CRM teams to monitor revenue, customer health, loyalty, and channel performance.

**Key Business Context**:
- **Revenue FY2024**: $270.9M (7.3% YoY growth from FY2023)
- **Top Revenue Driver**: LuxeStyle Online ($7.7M), Urban Thread ($6.2M), Bijou Accessories ($6.0M)
- **Primary Channel**: WEB (45% of orders), MOBILE_APP (35%), TABLET (12%), PHONE (8%)
- **Loyalty Penetration**: ~60% of customers (714 members)
- **No Data Exclusions**: Employee, fraud, and deceased records included by default (transparent policy)

---

## Dashboard Inventory

| # | Dashboard | Readiness | Effort | Priority | Owner | Status |
|---|-----------|-----------|--------|----------|-------|--------|
| 1 | Executive Overview | 95% | 2–3 days | 🔴 P1 | Analytics | TBD |
| 2 | Sales & Revenue | 90% | 3–4 days | 🔴 P1 | Analytics | TBD |
| 3 | Customer Lifecycle | 95% | 3–4 days | 🔴 P1 | CRM | TBD |
| 4 | Loyalty & Retention | 85% | 4–5 days | 🟡 P2 | CRM | TBD |
| 5 | Channel Mix | 90% | 3–4 days | 🟡 P2 | Marketing | TBD |
| 6 | Marketing Attribution | 85% | 3–4 days | 🟡 P2 | Marketing | TBD |
| 7 | Brand Performance | 90% | 2–3 days | 🔴 P1 | Strategy | TBD |
| 8 | Product Category | 65% | 8–10 days | 🔵 P3 | Merchandising | ESCALATE* |
| 9 | Geographic Performance | 85% | 4–5 days | 🟡 P2 | Operations | TBD |
| 10 | Customer Segmentation | 90% | 3–4 days | 🟡 P2 | CRM | TBD |
| 11 | Household Analysis | 85% | 3–4 days | 🟡 P2 | Analytics | TBD |

*Dashboard 8 (Product Category) requires product SKU-level sales fact table (data gap). Recommend implementing FACT_PRODUCT_SALES ETL before build; fallback to Product Atlas reference dashboard.

---

## Common Column Name Mistakes

**Critical**: Review before writing SQL queries.

| Mistake | Correct Column | Table | Notes |
|---------|----------------|-------|-------|
| `CUSTOMER_ID` | `CUSTOMER_KEY` | All facts & DIM_CUSTOMER | Key is surrogate; natural key is `SOURCE_CUSTOMER_ID` |
| `DATE` | `PERIOD_DATE_KEY` or `ORDER_DATE_KEY` | See below | Never use raw `DATE` column (doesn't exist) |
| `SALES` | `NET_SALES` | FACT_CUSTOMER_PERFORMANCE | Only place revenue data exists |
| `ORDERS` | `NET_ORDERS` | FACT_CUSTOMER_PERFORMANCE | Pre-aggregated order count |
| `BU` | `BUSINESS_UNIT_KEY` or `BUSINESS_UNIT_NAME` | DIM_BUSINESS_UNIT | Key for joins; name for display |
| `LOCATION` | `LOCATION_KEY` | DIM_LOCATION | Foreign key in facts |
| `PRODUCT` | `PRODUCT_KEY` or `SKU` | DIM_PRODUCT | No product-level sales fact available |
| `CUSTOMER_COUNT` | Do NOT SUM; use SUM() | FACT_CUSTOMER_PERFORMANCE | Pre-aggregated; not a fact measure |

### Date Column Reference

| Table | Correct Date Column | Grain | Usage |
|-------|---------------------|-------|-------|
| FACT_CUSTOMER_PERFORMANCE | `PERIOD_DATE_KEY` | Month-end or Quarter-end | Pre-aggregated KPIs; use with `IS_MONTH_END` or `IS_QUARTER_END` flag |
| FACT_ORDER_TRANSACTION | `ORDER_DATE_KEY` | Daily | Order-level detail; lowest granularity |
| FACT_SALES_TRANSACTION | `TRANSACTION_DATE_KEY` | Daily | POS transaction detail; locality & distance only |
| DIM_DATE | `DATE_KEY` (join key) | Daily | Use for dimensional joins and fiscal calculations |

---

## Complete Join Notes

### Fact-to-Dimension Joins (Golden Path)

```sql
-- FACT_CUSTOMER_PERFORMANCE → Dimensions
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE dd ON fcp.PERIOD_DATE_KEY = dd.DATE_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
INNER JOIN DIM_GOAL_TYPE dgt ON fcp.GOAL_TYPE_KEY = dgt.GOAL_TYPE_KEY

-- FACT_ORDER_TRANSACTION → Dimensions
FROM FACT_ORDER_TRANSACTION fot
INNER JOIN DIM_DATE dd ON fot.ORDER_DATE_KEY = dd.DATE_KEY
INNER JOIN DIM_CUSTOMER dc ON fot.CUSTOMER_KEY = dc.CUSTOMER_KEY
INNER JOIN DIM_LOCATION dl ON fot.LOCATION_KEY = dl.LOCATION_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fot.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY

-- FACT_SALES_TRANSACTION → Dimensions
FROM FACT_SALES_TRANSACTION fst
INNER JOIN DIM_DATE dd ON fst.TRANSACTION_DATE_KEY = dd.DATE_KEY
INNER JOIN DIM_CUSTOMER dc ON fst.CUSTOMER_KEY = dc.CUSTOMER_KEY
INNER JOIN DIM_HOUSEHOLD dh ON fst.HOUSEHOLD_KEY = dh.HOUSEHOLD_KEY
INNER JOIN DIM_LOCATION dl ON fst.LOCATION_KEY = dl.LOCATION_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fst.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
```

### SCD2 Handling (DIM_CUSTOMER)

```sql
-- Point-in-time snapshot (current state)
WHERE dc.IS_CURRENT = TRUE

-- OR explicit date filtering
WHERE dc.EFFECTIVE_DATE <= [analysis_date]
  AND (dc.END_DATE IS NULL OR dc.END_DATE > [analysis_date])

-- Historical tracking (if needed)
-- Use EFFECTIVE_DATE and END_DATE to track customer changes over time
```

### Bridge Table Join (BRIDGE_CUSTOMER_EMAIL)

```sql
-- Link customers to email addresses
FROM BRIDGE_CUSTOMER_EMAIL bce
INNER JOIN DIM_CUSTOMER dc ON bce.CUSTOMER_KEY = dc.CUSTOMER_KEY
WHERE bce.END_DATE IS NULL  -- Active email only
  AND bce.IS_PREFERRED = TRUE  -- Primary email
```

### Multi-Table Join Example

```sql
-- Revenue by customer segment
SELECT
  dbu.BUSINESS_UNIT_NAME,
  dc.VALUE_SEGMENT_CODE,
  SUM(fcp.NET_SALES) AS segment_revenue
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
INNER JOIN DIM_DATE dd ON fcp.PERIOD_DATE_KEY = dd.DATE_KEY
INNER JOIN DIM_CUSTOMER dc ON fcp.CUSTOMER_KEY = dc.CUSTOMER_KEY  -- Note: FK not in FACT_CUSTOMER_PERFORMANCE
WHERE dd.FISCAL_YEAR = 2024
  AND dc.IS_CURRENT = TRUE
GROUP BY dbu.BUSINESS_UNIT_NAME, dc.VALUE_SEGMENT_CODE
ORDER BY segment_revenue DESC;
```

**⚠️ Important**: FACT_CUSTOMER_PERFORMANCE does NOT contain CUSTOMER_KEY; cannot directly join to DIM_CUSTOMER. Use FACT_ORDER_TRANSACTION or FACT_SALES_TRANSACTION for customer-level detail.

---

## Fiscal Year Derivation

**Fiscal Year**: February (M1) - January (M12)

### Fiscal Year Calculation

```sql
-- In DIM_DATE, fiscal year is pre-calculated
SELECT
  CALENDAR_DATE,
  FISCAL_YEAR,
  FISCAL_QUARTER,
  FISCAL_MONTH,
  FISCAL_PERIOD_ID
FROM DIM_DATE
WHERE CALENDAR_DATE BETWEEN '2024-02-01' AND '2025-01-31';

-- Output example:
-- 2024-02-01  | 2024 | 1 | 1  | FY2024-M01
-- 2024-03-01  | 2024 | 1 | 2  | FY2024-M02
-- ...
-- 2025-01-31  | 2024 | 4 | 12 | FY2024-M12

-- Manual derivation (if needed):
CASE
  WHEN MONTH(CALENDAR_DATE) >= 2
  THEN YEAR(CALENDAR_DATE)
  ELSE YEAR(CALENDAR_DATE) - 1
END AS FISCAL_YEAR

CASE
  WHEN MONTH(CALENDAR_DATE) >= 2
  THEN CEILING((MONTH(CALENDAR_DATE) - 1) / 3.0)
  ELSE CEILING((MONTH(CALENDAR_DATE) + 11) / 3.0)
END AS FISCAL_QUARTER
```

### FY2022 vs FY2023 vs FY2024 Mapping

| Fiscal Year | Calendar Start | Calendar End | Notes |
|-------------|----------------|--------------|-------|
| FY2022 | 2022-02-01 | 2023-01-31 | Complete (365 days) |
| FY2023 | 2023-02-01 | 2024-01-31 | Complete (365 days) |
| FY2024 | 2024-02-01 | 2025-01-31 | In progress (current) |

**YoY Comparison Example**:
```sql
-- FY2024 vs FY2023 revenue growth
SELECT
  dbu.BUSINESS_UNIT_NAME,
  SUM(CASE WHEN dd.FISCAL_YEAR = 2024 THEN fcp.NET_SALES ELSE 0 END) AS fy2024_revenue,
  SUM(CASE WHEN dd.FISCAL_YEAR = 2023 THEN fcp.NET_SALES ELSE 0 END) AS fy2023_revenue,
  ROUND(100.0 * (
    SUM(CASE WHEN dd.FISCAL_YEAR = 2024 THEN fcp.NET_SALES ELSE 0 END) -
    SUM(CASE WHEN dd.FISCAL_YEAR = 2023 THEN fcp.NET_SALES ELSE 0 END)
  ) / SUM(CASE WHEN dd.FISCAL_YEAR = 2023 THEN fcp.NET_SALES ELSE 0 END), 2) AS yoy_growth_pct
FROM FACT_CUSTOMER_PERFORMANCE fcp
INNER JOIN DIM_DATE dd ON fcp.PERIOD_DATE_KEY = dd.DATE_KEY
INNER JOIN DIM_BUSINESS_UNIT dbu ON fcp.BUSINESS_UNIT_KEY = dbu.BUSINESS_UNIT_KEY
WHERE dd.FISCAL_YEAR IN (2023, 2024)
  AND fcp.GOAL_TYPE_KEY = 5  -- NET_SALES_GOAL
GROUP BY dbu.BUSINESS_UNIT_NAME;
```

---

## Complete RETAILEDGE Theme Spec

### Color Palette (Quick Reference)

**Primary Colors**:
- Page Background: `#F3F4F6` (light gray)
- Card Background: `#FFFFFF` (white)
- Topbar: `#1A1A2E` (deep navy)
- Primary Accent: `#00AEFF` (Nielsen cyan)
- Secondary Accent: `#1A7F64` (teal)

**Chart Series** (in order of use):
1. `#00AEFF` (primary cyan)
2. `#1A7F64` (secondary teal)
3. `#94A3B8` (neutral gray)
4. `#0EA5E9` (light cyan)
5. `#F59E0B` (amber/orange)

**Status Colors**:
- Positive (growth): `#059669` (green)
- Negative (decline): `#D32F2F` (red)
- Neutral (flat): `#94A3B8` (gray)

**Text Colors**:
- Primary: `#1E293B` (dark slate)
- Secondary: `#64748B` (medium gray)
- Tertiary: `#94A3B8` (light gray)
- Inverse: `#FFFFFF` (white on dark)

### Typography

**Font Stack**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Key Sizes**:
- Display: 32px / 700 weight (page titles)
- H1: 28px / 700 weight (section headers)
- Body Large: 16px / 400 weight (primary text)
- Body Small: 12px / 400 weight (labels, captions)

### Component Examples

**Metric Card**:
```css
.metric-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
}
.metric-label {
  font-size: 12px;
  color: #64748B;
  text-transform: uppercase;
}
.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
}
.metric-delta {
  font-size: 14px;
  color: #059669; /* green for positive */
}
```

**Primary Button**:
```css
.button-primary {
  background-color: #00AEFF;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
}
.button-primary:hover {
  background-color: #0084CC;
}
```

---

## Dashboard Development Checklist

### Before Starting Build

- [ ] Review DASHBOARD_FEASIBILITY.md (understand readiness score and effort)
- [ ] Read DATA_SCHEMA_MAP.md (understand table structure and joins)
- [ ] Review METRIC_DEFINITIONS.md (confirm metric formulas)
- [ ] Check GLOBAL_FILTERS.md (understand filter dimensions and "no exclusions" policy)

### During Build

- [ ] Copy relevant SQL from QUERY_TEMPLATES.sql
- [ ] Adapt SQL to your BI tool (Tableau, Looker, Power BI, etc.)
- [ ] Test SQL in editor; confirm row count < 200 and runtime < 5 sec
- [ ] Apply RETAILEDGE theme colors
- [ ] Add filter controls (time, BU, channel, customer type as appropriate)
- [ ] Configure chart types (line for trends, bar for comparison, pie for distribution)
- [ ] Add dashboard title and description
- [ ] Add data governance note: "This analysis includes all customer records without exclusions."

### QA Testing

- [ ] Run QA test script (see SETUP_GUIDE.md for sample test cases)
- [ ] Verify calculations match METRIC_DEFINITIONS.md
- [ ] Check color contrast (WCAG 2.1 AA compliance)
- [ ] Test filters on desktop, tablet, mobile
- [ ] Validate data freshness (PERIOD_DATE_KEY ≤ 30 days old)

---

## Key Data Points for Testing

### Executive Overview (Expected Baseline Values)

**FY2024 YTD (as of latest data load)**:
- Total Revenue: ~$270.9M (full year FY2024 estimate)
- Total Orders: ~280K (estimate)
- Total Customers: ~1,200–1,380 (depends on period)
- Avg Order Value: ~$967
- YoY Growth: ~7.3% (vs FY2023's $252.3M)

**Customer Mix**:
- NEW: ~15% of transactions
- RETURNING: ~60% of transactions
- VIP: ~5% of transactions
- LAPSED: ~15% of transactions
- REACTIVATED: ~5% of transactions

### Brand Performance (Expected by BU)

| BU | Revenue (FY2024) | % of Total | Top Metric |
|----|----|----|----|
| LuxeStyle Online | $7.7M | 2.8% | Highest performer |
| Urban Thread | $6.2M | 2.3% | Midwest focus |
| Bijou Accessories | $6.0M | 2.2% | West region |
| LuxeStyle Mobile App | $3.5M | 1.3% | Growing channel |
| LuxeStyle Outlet | $1.9M | 0.7% | South region |
| Maison Luxe | $1.0M | 0.4% | Northeast flagship |
| SoleStep Footwear | $0.98M | 0.4% | Southeast specialist |

*Note: Percentages reflect FY2024 distribution. Remaining ~90% attributed to portfolio brands and legacy systems not detailed in project scope.*

### Loyalty Metrics

- Loyalty Members: 714 (60% of active customers)
- PLCC Penetration: ~15–20% (estimate)
- Loyalty Revenue Lift: ~10–15% (vs. non-members)
- Top Tier: Platinum (highest spend)

---

## Troubleshooting Decision Tree

```
Query Returns Unexpected Results
  ↓
  1. Check row count
     ├─ Too few rows? → Verify JOIN conditions; check WHERE filters
     └─ Too many rows? → Add GROUP BY; check for cross join
  ↓
  2. Check values
     ├─ Negative revenue? → Check if filtering to correct GOAL_TYPE_KEY
     ├─ Null counts? → Check SCD2 (IS_CURRENT = TRUE); verify FK exists
     └─ Growth > 100%? → Verify date range calculation; check decimal math
  ↓
  3. Check data freshness
     ├─ Old data? → Confirm ETL completed; check PERIOD_DATE_KEY
     └─ Missing months? → Verify DIM_DATE populated for period range
  ↓
  4. Escalate
     ├─ Schema issue? → Contact Data Engineering
     ├─ Performance issue? → Contact Data Platform team
     └─ Business logic issue? → Contact Analytics Manager
```

---

## Performance Optimization Tips

1. **Filter Early**: Apply date and BU filters in WHERE clause, not in aggregation
2. **Pre-Aggregated Data**: Use FACT_CUSTOMER_PERFORMANCE (16.8K rows) instead of deriving from transactions (12K+ rows)
3. **Avoid SELECT ***: Name only required columns
4. **Use Appropriate Joins**: INNER JOIN for facts; LEFT JOIN for optional dimensions
5. **Aggregate at Right Grain**: If query should return <200 rows, GROUP BY appropriate dimensions (month, BU, customer type)

**Target**: <5 seconds query runtime for all dashboards

---

## Data Governance Notes

### No Exclusions Policy

**This project includes all customer records by default**:
- `IS_EMPLOYEE = TRUE` records ARE included
- `IS_FRAUD = TRUE` records ARE included
- `IS_DECEASED = TRUE` records ARE included

**Rationale**: Transparent, complete view of all data for analysis. Optional filtering available for specific use cases.

**Dashboard Disclaimer**: Add to every dashboard footer:
> "This analysis includes all customer records without exclusions. For filtered views, contact Analytics team."

### Data Freshness

- **FACT_CUSTOMER_PERFORMANCE**: Monthly update (month-end refresh, typically 1–3 days late)
- **FACT_ORDER_TRANSACTION**: Daily update
- **FACT_SALES_TRANSACTION**: Daily update
- **DIM_CUSTOMER**: Monthly update (SCD2 history tracked)

**SLA**: All fact data ≤7 days old; dimension data ≤30 days old

---

## Quick Links & References

| Document | Purpose | Owner |
|----------|---------|-------|
| DASHBOARD_FEASIBILITY.md | Dashboard scoring, readiness, effort | Analytics |
| DATA_SCHEMA_MAP.md | Complete table schema, joins, column reference | Data Engineering |
| RETAILEDGE_THEME.md | Theme colors, CSS, typography, components | Design |
| METRIC_DEFINITIONS.md | All 29 KPIs, formulas, source tables | Analytics |
| GLOBAL_FILTERS.md | Filter dimensions, data governance | Analytics |
| QUERY_TEMPLATES.sql | SQL starter templates for 11 dashboards | Analytics |
| SETUP_GUIDE.md | Step-by-step setup, testing, deployment | Analytics |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-04-15 | Analytics Team | Initial skill spec; 11 dashboard roadmap |

---

## Support

**Questions about this skill?** Contact Analytics Team at analytics@company.com or Slack #falcon-consumer-analytics

**Data issues?** Escalate to Data Engineering (slack: #data-warehouse)

**Theme/UI questions?** Contact Design System team

---

**Last Updated**: 2024-04-15 | **Project Status**: Kickoff | **Next Milestone**: Phase 1 completion (4 dashboards)
