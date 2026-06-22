# Global Filters Specification
## Falcon Consumer — Default Filters & Data Governance

**Project**: Falcon Consumer | **Filtering Policy**: NO EXCLUSIONS (User Directive) | **Effective Date**: 2024-04-15 | **Review Frequency**: Quarterly

---

## Filter Policy Overview

**User Requirement**: NO EXCLUSIONS applied to customer data.

This means:
- **IS_EMPLOYEE = TRUE records ARE included** in analysis (not filtered out)
- **IS_FRAUD = TRUE records ARE included** in analysis (not filtered out)
- **IS_DECEASED = TRUE records ARE included** in analysis (not filtered out)

This policy is a deliberate user choice and should be documented and communicated to all dashboard viewers to ensure transparency and prevent misinterpretation of metrics.

---

## Default Filter Dimensions

### 1. Time / Period Filter

**Dimension**: PERIOD_DATE_KEY (DIM_DATE)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Required (interactive) |
| **Default Range** | Last 12 months (rolling window) OR latest fiscal year |
| **Granularity** | Month-end (PERIOD_DATE_KEY in FACT_CUSTOMER_PERFORMANCE) or daily (for transaction-level analysis) |
| **Calendar System** | Both Calendar (Jan–Dec) and Fiscal (Feb–Jan, retail 4-5-4) available |
| **Applied To** | All dashboards |
| **SQL Pattern** | `WHERE PERIOD_DATE_KEY >= [start_key] AND PERIOD_DATE_KEY <= [end_key]` OR `WHERE ORDER_DATE_KEY >= [start_date] AND ORDER_DATE_KEY <= [end_date]` |
| **Notes** | Use DIM_DATE.FISCAL_YEAR and DIM_DATE.FISCAL_MONTH for retail period alignment. Fiscal year 2024 = Feb 2024 - Jan 2025. |

**Example SQL**:
```sql
-- Last 12 months (calendar)
WHERE ORDER_DATE_KEY >= (DATEADD(YEAR, -1, CAST(GETDATE() AS DATE)))
  AND ORDER_DATE_KEY <= CAST(GETDATE() AS DATE)

-- FY2024 (fiscal)
WHERE FISCAL_YEAR = 2024
```

---

### 2. Business Unit Filter

**Dimension**: BUSINESS_UNIT_KEY (DIM_BUSINESS_UNIT)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | 1. Maison Luxe, 2. Urban Thread, 3. SoleStep Footwear, 4. Bijou Accessories, 5. LuxeStyle Online, 6. LuxeStyle Mobile App, 7. LuxeStyle Outlet |
| **Applied To** | Executive Overview, Sales & Revenue, Brand Performance, Channel Mix, Geographic Performance |
| **SQL Pattern** | `WHERE BUSINESS_UNIT_KEY IN ([selected_keys])` |
| **Notes** | Use DIM_BUSINESS_UNIT.BUSINESS_UNIT_KEY and BUSINESS_UNIT_NAME for labels. Each BU = 1 row in DIM_BUSINESS_UNIT. |

**Example SQL**:
```sql
-- Single BU (Maison Luxe)
WHERE BUSINESS_UNIT_KEY = 1

-- Multiple BUs
WHERE BUSINESS_UNIT_KEY IN (1, 2, 5)

-- All BUs (default)
-- No WHERE clause or use: WHERE BUSINESS_UNIT_KEY IS NOT NULL
```

---

### 3. Customer Type Filter

**Dimension**: CUSTOMER_TYPE (FACT_CUSTOMER_PERFORMANCE or DIM_CUSTOMER)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | NEW, RETURNING, VIP, LAPSED, REACTIVATED |
| **Definition** | NEW = ≤90 days since account creation; RETURNING = repeat customer, not lapsed; VIP = high-value customer (score 80+); LAPSED = 91-365 days inactive; REACTIVATED = win-back customer (366+ days, now active) |
| **Applied To** | Executive Overview, Customer Lifecycle, Sales & Revenue, Brand Performance |
| **SQL Pattern** | `WHERE CUSTOMER_TYPE IN ('[types]')` |
| **Notes** | Use FACT_CUSTOMER_PERFORMANCE.CUSTOMER_TYPE for aggregated view; use DIM_CUSTOMER.CUSTOMER_TYPE for current-state customer list. |

**Example SQL**:
```sql
-- New customers only
WHERE CUSTOMER_TYPE = 'NEW'

-- New and VIP
WHERE CUSTOMER_TYPE IN ('NEW', 'VIP')

-- All customer types (default)
-- No WHERE clause or use: WHERE CUSTOMER_TYPE IS NOT NULL
```

---

### 4. Channel / Source Filter

**Dimension**: SOURCE_TYPE (FACT_ORDER_TRANSACTION) or CHANNEL_TYPE (DIM_LOCATION)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options (SOURCE_TYPE)** | WEB, MOBILE_APP, TABLET, PHONE |
| **Available Options (CHANNEL_TYPE)** | RETAIL, WEB, MOBILE, PHONE |
| **Applied To** | Channel Mix, Sales & Revenue, Marketing Attribution |
| **SQL Pattern (SOURCE_TYPE)** | `WHERE SOURCE_TYPE IN ('[sources]')` |
| **SQL Pattern (CHANNEL_TYPE)** | `WHERE CHANNEL_TYPE IN ('[types]')` FROM DIM_LOCATION |
| **Notes** | SOURCE_TYPE in FACT_ORDER_TRANSACTION shows order source (how customer placed order). CHANNEL_TYPE in DIM_LOCATION shows location/channel type. Map: WEB source → WEB channel, MOBILE_APP source → MOBILE channel, etc. |

**Example SQL**:
```sql
-- Web orders only
WHERE SOURCE_TYPE = 'WEB'

-- Mobile + Web orders
WHERE SOURCE_TYPE IN ('MOBILE_APP', 'WEB')

-- Retail store transactions
WHERE fot.LOCATION_KEY IN (SELECT LOCATION_KEY FROM DIM_LOCATION WHERE CHANNEL_TYPE = 'RETAIL')
```

---

### 5. Marketing Channel Filter

**Dimension**: MARKETING_CHANNEL (FACT_ORDER_TRANSACTION)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | EMAIL, PAID_SEARCH, ORGANIC, SOCIAL, DIRECT, AFFILIATE, SMS |
| **Applied To** | Marketing Attribution, Channel Mix |
| **SQL Pattern** | `WHERE MARKETING_CHANNEL IN ('[channels]')` |
| **Notes** | Represents attribution channel (how order was attributed to marketing effort). Available in FACT_ORDER_TRANSACTION only (not pre-aggregated in FACT_CUSTOMER_PERFORMANCE). |

**Example SQL**:
```sql
-- Email and Social campaigns
WHERE MARKETING_CHANNEL IN ('EMAIL', 'SOCIAL')

-- Organic traffic
WHERE MARKETING_CHANNEL = 'ORGANIC'
```

---

### 6. Loyalty Status Filter

**Dimension**: IS_LOYALTY_MEMBER (DIM_CUSTOMER)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (boolean toggle or multi-select) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | Loyalty Members, Non-Members, All |
| **Applied To** | Loyalty & Retention, Customer Segmentation |
| **SQL Pattern** | `WHERE IS_LOYALTY_MEMBER = [TRUE/FALSE]` |
| **Notes** | V_LOYALTY_CUSTOMERS view provides pre-filtered snapshot of 714 loyalty members. |

**Example SQL**:
```sql
-- Loyalty members only
WHERE IS_LOYALTY_MEMBER = TRUE

-- Non-members only
WHERE IS_LOYALTY_MEMBER = FALSE
```

---

### 7. Value Segment Filter

**Dimension**: VALUE_SEGMENT_CODE (DIM_CUSTOMER)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | Platinum ($5K+), Gold ($1K–$5K), Silver ($500–$1K), Bronze ($1–$500) |
| **Applied To** | Customer Segmentation, Brand Performance |
| **SQL Pattern** | `WHERE VALUE_SEGMENT_CODE IN ('[codes]')` |
| **Notes** | Based on LIFETIME_NET_AMOUNT thresholds. Segmentation rules documented in DIM_CUSTOMER_STRATEGY. |

**Example SQL**:
```sql
-- High-value customers (Platinum + Gold)
WHERE VALUE_SEGMENT_CODE IN ('PLATINUM', 'GOLD')

-- Mass market (Bronze + Silver)
WHERE VALUE_SEGMENT_CODE IN ('SILVER', 'BRONZE')
```

---

### 8. Geographic / Region Filter

**Dimension**: GEO_REGION_ID (DIM_LOCATION)

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (multi-select interactive) |
| **Default Value** | ALL (no filter applied) |
| **Available Options** | Northeast, Midwest, Southeast, West, South |
| **Applied To** | Geographic Performance, Brand Performance, Sales & Revenue |
| **SQL Pattern** | `WHERE GEO_REGION_ID IN ('[regions]') FROM DIM_LOCATION` |
| **Notes** | Join to DIM_LOCATION via LOCATION_KEY or BUSINESS_UNIT_KEY to get region. Each BU owns locations in specific region(s). |

**Example SQL**:
```sql
-- West region stores (Bijou)
WHERE dl.GEO_REGION_ID = 'WEST'

-- Northeast and Midwest
WHERE dl.GEO_REGION_ID IN ('NORTHEAST', 'MIDWEST')
```

---

### 9. Goal Type Filter (Internal Analytics Use)

**Dimension**: GOAL_TYPE_KEY (DIM_GOAL_TYPE) — FACT_CUSTOMER_PERFORMANCE only

| Aspect | Specification |
|--------|---------------|
| **Filter Type** | Optional (for analytical users; not in primary dashboard UI) |
| **Default Value** | Filter to goal_type appropriate for analysis context (e.g., goal_type_key = 1 for "new customer revenue") |
| **Available Options** | NEW_CUSTOMERS (1), REACTIVATED (2), RETAINED (3), AT_RISK (4), NET_SALES_GOAL (5), AOV_GOAL (6), UNITS_GOAL (7), LOYALTY_ENROLL (8), EMAIL_CAPTURE (9), OMNI_SHOPPERS (10) |
| **Applied To** | All dashboards using FACT_CUSTOMER_PERFORMANCE (internal use; filtered by SQL developer, not user UI) |
| **SQL Pattern** | `WHERE GOAL_TYPE_KEY = [key]` (pre-filter in query) |
| **Notes** | FACT_CUSTOMER_PERFORMANCE contains multiple rows per period per BU (one row per goal_type). Must filter to appropriate context. Document in dashboard-specific SQL queries. |

**Example SQL**:
```sql
-- New customer revenue goal (goal_type_key = 1)
WHERE GOAL_TYPE_KEY = 1
  AND PERIOD_DATE_KEY >= [start_date]
  AND PERIOD_DATE_KEY <= [end_date]

-- Net sales goal (goal_type_key = 5)
WHERE GOAL_TYPE_KEY = 5
```

---

## Exclusion Flags (Available but NOT Applied)

### IS_EMPLOYEE Flag

**Status**: AVAILABLE FOR OPTIONAL FILTERING; NOT APPLIED BY DEFAULT

| Aspect | Specification |
|--------|---------------|
| **Location** | DIM_CUSTOMER.IS_EMPLOYEE (BOOLEAN) |
| **Purpose** | Identify employee discount transactions or internal testing accounts |
| **Default Behavior** | NO filter applied (user directive: no exclusions) |
| **Optional Use Case** | Analytics team may choose to filter WHERE IS_EMPLOYEE = FALSE for clean customer metrics, but this is not enforced |
| **Documentation** | **IMPORTANT**: Document in dashboard disclaimers that employee records are included in default analysis. Example: "Note: Metrics include employee purchases and internal accounts. For customer-only view, filter IS_EMPLOYEE = FALSE." |

---

### IS_FRAUD Flag

**Status**: AVAILABLE FOR OPTIONAL FILTERING; NOT APPLIED BY DEFAULT

| Aspect | Specification |
|--------|---------------|
| **Location** | DIM_CUSTOMER.IS_FRAUD (BOOLEAN) |
| **Purpose** | Identify suspected fraudulent accounts (chargebacks, pattern anomalies, etc.) |
| **Default Behavior** | NO filter applied (user directive: no exclusions) |
| **Optional Use Case** | Fraud investigation or risk teams may analyze IS_FRAUD = TRUE; business analysts may choose IS_FRAUD = FALSE for legitimate revenue metrics |
| **Documentation** | **IMPORTANT**: Document in dashboard disclaimers that fraudulent records are included in default analysis. Example: "Note: Metrics include accounts flagged for potential fraud. For fraud-free revenue, filter IS_FRAUD = FALSE." |
| **Recommendation** | Consider recommending IS_FRAUD = FALSE filter for C-suite revenue reporting (not mandatory, but suggested best practice). |

---

### IS_DECEASED Flag

**Status**: AVAILABLE FOR OPTIONAL FILTERING; NOT APPLIED BY DEFAULT

| Aspect | Specification |
|--------|---------------|
| **Location** | DIM_CUSTOMER.IS_DECEASED (BOOLEAN) |
| **Purpose** | Identify customer records marked as deceased (data quality, CRM compliance) |
| **Default Behavior** | NO filter applied (user directive: no exclusions) |
| **Optional Use Case** | Compliance or CRM teams may filter WHERE IS_DECEASED = FALSE to avoid marketing to deceased individuals |
| **Documentation** | **IMPORTANT**: Document in dashboard disclaimers that deceased records are included in default analysis. Consider implementing IS_DECEASED = FALSE filter for CRM/Marketing dashboards for regulatory compliance (GDPR, CCPA). Example: "Note: For CRM campaigns, filter IS_DECEASED = FALSE to avoid deceased customers." |
| **Compliance Note** | Some jurisdictions require exclusion of deceased individuals from marketing campaigns. Recommend implementing soft exclusion (pre-filter in CRM-facing dashboards) even though not enforced in warehouse. |

---

## Recommended Filter Combinations

### Executive / C-Suite Dashboards
**Suggested Filters** (user can override):
- Time: Last 12 months (rolling window) or latest fiscal year
- Business Unit: ALL (or selected BUs for focused review)
- Customer Type: ALL (or select by strategy: e.g., NEW + VIP for growth focus)
- Exclusions: Optional IS_FRAUD = FALSE, IS_DECEASED = FALSE for sensitivity

**Example**: "Total revenue last 12 months, all BUs, all customer types, excluding fraud/deceased for board reporting"

---

### Operational / Marketing Dashboards
**Suggested Filters** (user can override):
- Time: Last 30 days or last 90 days (short-term performance)
- Business Unit: Select specific BU(s)
- Channel: Select primary channels (e.g., WEB, MOBILE_APP)
- Marketing Channel: Select active campaigns
- Loyalty: Filter to loyalty members for engagement focus

**Example**: "Last 30 days, Urban Thread BU, Web + Mobile orders, Email + Organic campaigns, loyalty members only"

---

### Customer Segmentation / Targeting Dashboards
**Suggested Filters** (user can override):
- Time: Latest month-end snapshot
- Value Segment: Select target segment (e.g., Platinum, Gold)
- Lifecycle Segment: Select focus stage (e.g., At-Risk, Win-Back)
- Behaviour Segment: Select engagement tier (e.g., VIP, Frequent)
- Exclusions: Highly recommended IS_DECEASED = FALSE, IS_FRAUD = FALSE for CRM safety

**Example**: "Current snapshot, Platinum + Gold customers, At-Risk or Lapsed lifecycle, excluding deceased/fraud for targeting"

---

### Data Quality / Audit Dashboards (if created)
**Suggested Filters** (analyst only):
- Time: Full data range (2022–2024) or compare periods
- Exclusion Flags: Show IS_EMPLOYEE, IS_FRAUD, IS_DECEASED counts separately
- Document counts of flagged records

**Example**: "Data quality report: show counts of employee, fraud, deceased records by month"

---

## Filter Implementation Checklist

- [ ] Add time/period filter to all dashboards (required)
- [ ] Add Business Unit filter (interactive multi-select)
- [ ] Add Customer Type filter (interactive multi-select) to lifestyle dashboards
- [ ] Add Channel/Source filter to channel-focused dashboards
- [ ] Add Marketing Channel filter to attribution dashboards
- [ ] Add Value/Lifecycle/Behaviour segment filters to segmentation dashboards
- [ ] **Document default behavior**: NO exclusions applied (IS_EMPLOYEE, IS_FRAUD, IS_DECEASED included)
- [ ] Add dashboard disclaimer: "This analysis includes [employee/fraud/deceased] records. To exclude, apply optional filter IS_EMPLOYEE = FALSE, etc."
- [ ] Provide recommended filter combinations to users
- [ ] Create optional filter sub-section in each dashboard for advanced users
- [ ] Brief stakeholders on "no exclusions" policy and transparency approach

---

## Transparency & Communication

### Dashboard Disclaimer Language (Recommended)

Add to dashboard header or footer:

> **Data Governance Note**: This dashboard includes all customer records without exclusions (employee accounts, fraud flags, deceased individuals). Metrics reflect complete transaction history. To create filtered views, optional filters are available: IS_EMPLOYEE, IS_FRAUD, IS_DECEASED. Contact Analytics team for custom reports.

---

### Stakeholder Communication

When presenting metrics to stakeholders:

1. **Proactively disclose**: "Our standard analysis includes all records (no exclusions). This is transparent and ensures we don't accidentally hide material transactions."
2. **Offer alternatives**: "If you prefer a cleaner view, we can filter out employee/fraud/deceased records — just let us know."
3. **Document assumptions**: "Assuming [filter assumptions applied]. If different, please confirm."

---

## Policy Review & Updates

| Review Date | Reviewer | Notes | Changes |
|-------------|----------|-------|---------|
| 2024-04-15 | [Analytics Lead] | Initial policy established per user requirement (no exclusions) | Created |
| [Quarterly] | [Analytics Lead] | Assess if exclusion policy should be revisited (fraud trending, compliance requirements) | — |

---

## Contact & Support

For questions about filter implementation, default assumptions, or requests to modify filtering policy:
- Contact: Analytics Team / Data Governance Lead
- Policy Review: Quarterly (or as compliance requirements change)
- Escalation: Chief Data Officer (if exclusion policy change required)

---

## Appendix: SQL Filter Templates

### Template 1: Revenue with Default Filters
```sql
SELECT 
  PERIOD_DATE_KEY,
  BUSINESS_UNIT_KEY,
  CUSTOMER_TYPE,
  SUM(NET_SALES) AS revenue
FROM FACT_CUSTOMER_PERFORMANCE
WHERE PERIOD_DATE_KEY >= [start_key]
  AND PERIOD_DATE_KEY <= [end_key]
  -- BUSINESS_UNIT_KEY IN ([user_selected_BUs]) -- optional
  -- CUSTOMER_TYPE IN ([user_selected_types]) -- optional
  -- GOAL_TYPE_KEY = 1 -- filter to new customer context
GROUP BY PERIOD_DATE_KEY, BUSINESS_UNIT_KEY, CUSTOMER_TYPE
ORDER BY PERIOD_DATE_KEY DESC, revenue DESC;
```

### Template 2: Customer Metrics with Optional Exclusions
```sql
SELECT 
  CUSTOMER_KEY,
  SOURCE_CUSTOMER_ID,
  LIFETIME_NET_AMOUNT,
  VALUE_SEGMENT_CODE,
  LIFECYCLE_SEGMENT_CODE,
  IS_LOYALTY_MEMBER,
  IS_EMPLOYEE,
  IS_FRAUD,
  IS_DECEASED
FROM DIM_CUSTOMER
WHERE IS_CURRENT = TRUE
  -- AND IS_EMPLOYEE = FALSE -- optional
  -- AND IS_FRAUD = FALSE -- optional
  -- AND IS_DECEASED = FALSE -- optional
  -- AND VALUE_SEGMENT_CODE IN ('PLATINUM', 'GOLD') -- optional
ORDER BY LIFETIME_NET_AMOUNT DESC;
```

### Template 3: Marketing Channel with Period Filter
```sql
SELECT 
  MARKETING_CHANNEL,
  SOURCE_TYPE,
  COUNT(DISTINCT ORDER_TXN_KEY) AS order_count,
  COUNT(DISTINCT CUSTOMER_KEY) AS unique_customers
FROM FACT_ORDER_TRANSACTION
WHERE ORDER_DATE_KEY >= [start_date]
  AND ORDER_DATE_KEY <= [end_date]
  -- AND MARKETING_CHANNEL IN ([user_selected_channels]) -- optional
  -- AND SOURCE_TYPE IN ([user_selected_sources]) -- optional
GROUP BY MARKETING_CHANNEL, SOURCE_TYPE
ORDER BY order_count DESC;
```

---

## Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-04-15 | Analytics Team | Initial global filters specification; no exclusions policy established |

---

**Last Updated**: 2024-04-15 | **Next Review**: 2024-07-15 (Q2 2024)
