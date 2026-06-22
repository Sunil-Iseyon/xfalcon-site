# Setup Guide
## Falcon Consumer AnalyticsPro Kit

**Project**: Falcon Consumer | **Version**: 1.0 | **Last Updated**: 2024-04-15

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Data Connection Setup](#data-connection-setup)
4. [Database Schema Validation](#database-schema-validation)
5. [Theme Installation](#theme-installation)
6. [Dashboard Development](#dashboard-development)
7. [Testing & QA](#testing--qa)
8. [Deployment Checklist](#deployment-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Support & Escalation](#support--escalation)

---

## Quick Start

**Duration**: 30–45 minutes (initial setup)

### Step 1: Verify Data Source Access
```bash
# Confirm you have access to the Falcon Consumer data warehouse
# Test connection to:
# - IDA Connector: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
# - Database: [Falcon Consumer CDP Warehouse]
# - Tables: All 16 (3 fact, 6 dimension, 2 bridge/config, 2 views)
```

### Step 2: Download & Review Kit Contents
- **DASHBOARD_FEASIBILITY.md** — Dashboard scoring & build effort
- **DATA_SCHEMA_MAP.md** — Complete table schema and join patterns
- **RETAILEDGE_THEME.md** — Nielsen-inspired color scheme and CSS
- **METRIC_DEFINITIONS.md** — All 29 KPI formulas and requirements
- **GLOBAL_FILTERS.md** — Default filters (no exclusions policy)
- **QUERY_TEMPLATES.sql** — Starter SQL for all 11 dashboards (30+ queries)
- **SKILL.md** — This project build skill (see File 8)

### Step 3: Create Project Workspace
```
/Falcon Consumer/
├── xfalcon-falcon-consumer-kit/      (this folder)
│   ├── DASHBOARD_FEASIBILITY.md
│   ├── DATA_SCHEMA_MAP.md
│   ├── RETAILEDGE_THEME.md
│   ├── METRIC_DEFINITIONS.md
│   ├── GLOBAL_FILTERS.md
│   ├── QUERY_TEMPLATES.sql
│   ├── SETUP_GUIDE.md
│   └── SKILL.md
├── dashboards/                       (create: dashboard SQL & config)
├── assets/                           (create: theme CSS, images)
└── docs/                             (create: runbooks, FAQs)
```

### Step 4: Load Theme
1. Copy RETAILEDGE theme CSS from RETAILEDGE_THEME.md
2. Import into dashboard styling layer (CSS variables in `:root`)
3. Test color palette on sample dashboard card

### Step 5: Run Validation Queries
Execute first 2–3 query templates from QUERY_TEMPLATES.sql:
- Query 1.1 (Executive KPI Summary)
- Query 2.1 (Revenue by Business Unit)
- Query 4.1 (Loyalty Program Metrics)

Confirm row counts and data freshness align with expectations.

### Step 6: Plan Dashboard Development
1. Review DASHBOARD_FEASIBILITY.md prioritization (Dashboards 1, 2, 3, 7 first)
2. Assign build effort hours to team members
3. Schedule weekly standups
4. Define dashboard acceptance criteria

---

## Prerequisites

### Access & Permissions

- **AnalyticsPro Account**: Admin access to dashboard builder
- **Data Warehouse Access**: Read-only to all Falcon Consumer tables
- **IDA Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb` enabled in workspace
- **Git/Version Control** (optional): For dashboard code management

### Technical Skills Required

- **SQL**: Intermediate (joins, aggregations, case statements, window functions)
- **Dashboard Design**: Basic (layout, filters, drill-down navigation)
- **CSS/Styling**: Basic (color application, responsive design)
- **Data Modeling**: Basic (understanding of dimensions, facts, SCD2)
- **Retail Concepts**: Basic (fiscal calendar, customer lifecycle, segmentation)

### Tools & Software

- **BI Tool**: AnalyticsPro or similar (Tableau, Looker, Power BI compatible)
- **SQL Editor**: DBeaver, SQL Server Management Studio, or equivalent
- **Text Editor**: VS Code, Sublime Text, or equivalent
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+ (for dashboard testing)

### Time Commitment

- **Setup & Validation**: 2–3 hours
- **Dashboard Development**: 41–49 days (depending on team size; see DASHBOARD_FEASIBILITY.md)
- **Testing & Refinement**: 5–7 days
- **Go-Live & Training**: 2–3 days

---

## Data Connection Setup

### Step 1: Validate Warehouse Connection

**Confirm all 16 tables are accessible:**

```sql
-- Test 1: Fact tables
SELECT COUNT(*) FROM FACT_CUSTOMER_PERFORMANCE;  -- Expected: 16,800 rows
SELECT COUNT(*) FROM FACT_ORDER_TRANSACTION;     -- Expected: 12,540 rows
SELECT COUNT(*) FROM FACT_SALES_TRANSACTION;     -- Expected: 16,680 rows

-- Test 2: Dimension tables
SELECT COUNT(*) FROM DIM_CUSTOMER;               -- Expected: 1,380 rows
SELECT COUNT(*) FROM DIM_HOUSEHOLD;              -- Expected: 600 rows
SELECT COUNT(*) FROM DIM_PRODUCT;                -- Expected: 90 rows
SELECT COUNT(*) FROM DIM_LOCATION;               -- Expected: 20 rows
SELECT COUNT(*) FROM DIM_BUSINESS_UNIT;          -- Expected: 7 rows
SELECT COUNT(*) FROM DIM_DATE;                   -- Expected: 1,096 rows
SELECT COUNT(*) FROM DIM_GOAL_TYPE;              -- Expected: 10 rows
SELECT COUNT(*) FROM DIM_CUSTOMER_STRATEGY;      -- Expected: 84 rows

-- Test 3: Views
SELECT COUNT(*) FROM V_CURRENT_CUSTOMER;        -- Expected: 1,200 rows
SELECT COUNT(*) FROM V_LOYALTY_CUSTOMERS;       -- Expected: 714 rows

-- Test 4: Bridge tables
SELECT COUNT(*) FROM BRIDGE_CUSTOMER_EMAIL;     -- Expected: 1,441 rows
```

**Expected Status**: All queries return row counts matching the schema. If counts differ significantly, escalate to data engineering.

### Step 2: Confirm Fiscal Calendar

```sql
-- Verify fiscal year configuration (Feb-Jan retail calendar)
SELECT DISTINCT
  FISCAL_YEAR,
  MIN(CALENDAR_DATE) AS fiscal_year_start,
  MAX(CALENDAR_DATE) AS fiscal_year_end,
  COUNT(*) AS day_count
FROM DIM_DATE
WHERE FISCAL_YEAR BETWEEN 2022 AND 2024
GROUP BY FISCAL_YEAR
ORDER BY FISCAL_YEAR;

-- Expected output:
-- FY2022: 2022-02-01 to 2023-01-31 (365 days)
-- FY2023: 2023-02-01 to 2024-01-31 (365 days)
-- FY2024: 2024-02-01 to 2025-01-31 (365 days, ongoing)
```

### Step 3: Test IDA Connector

```
1. Open AnalyticsPro workspace
2. Create new dashboard (test)
3. Select data source: IDA
4. Choose connector: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
5. Test query: SELECT * FROM DIM_BUSINESS_UNIT LIMIT 10
6. Verify 7 rows returned (all BUs)
```

---

## Database Schema Validation

### Quick Schema Checklist

Run SCHEMA_VALIDATION.sql (derived from DATA_SCHEMA_MAP.md):

```sql
-- 1. Verify fact table grain
SELECT
  PERIOD_DATE_KEY,
  BUSINESS_UNIT_KEY,
  GOAL_TYPE_KEY,
  PERIOD_TYPE,
  CUSTOMER_TYPE,
  COUNT(*) AS row_count
FROM FACT_CUSTOMER_PERFORMANCE
GROUP BY PERIOD_DATE_KEY, BUSINESS_UNIT_KEY, GOAL_TYPE_KEY, PERIOD_TYPE, CUSTOMER_TYPE
HAVING COUNT(*) > 1;
-- Expected: No duplicates (grain is unique on these columns)

-- 2. Verify SCD2 tracking in DIM_CUSTOMER
SELECT
  SOURCE_CUSTOMER_ID,
  COUNT(*) AS version_count,
  MAX(CASE WHEN IS_CURRENT = TRUE THEN 1 ELSE 0 END) AS has_current_version
FROM DIM_CUSTOMER
GROUP BY SOURCE_CUSTOMER_ID
HAVING COUNT(*) > 1;
-- Expected: SCD2 history present; at most 1 current version per source ID

-- 3. Verify no orphaned foreign keys
SELECT
  COUNT(*) AS orphaned_count
FROM FACT_CUSTOMER_PERFORMANCE
WHERE BUSINESS_UNIT_KEY NOT IN (SELECT BUSINESS_UNIT_KEY FROM DIM_BUSINESS_UNIT)
  OR GOAL_TYPE_KEY NOT IN (SELECT GOAL_TYPE_KEY FROM DIM_GOAL_TYPE)
  OR PERIOD_DATE_KEY NOT IN (SELECT DATE_KEY FROM DIM_DATE);
-- Expected: 0 orphaned rows

-- 4. Verify data freshness
SELECT
  MAX(PERIOD_DATE_KEY) AS latest_period_key,
  MAX(CAST(PERIOD_DATE_KEY AS DATE)) AS latest_period_date
FROM FACT_CUSTOMER_PERFORMANCE;
-- Expected: Latest month-end within last 30 days
```

### Common Schema Issues

| Issue | Symptom | Resolution |
|-------|---------|-----------|
| Missing columns | Query fails with "column not found" | Confirm table name spelling and column list in DATA_SCHEMA_MAP.md |
| Data type mismatch | Conversion error in aggregation | Verify CAST/CONVERT applied to numeric columns (e.g., CONVERT(DECIMAL, NET_SALES)) |
| Null values in keys | Join returns no rows | Check INNER vs LEFT join; NULL values in dimension keys indicate data quality issue |
| Stale data | Metrics show old month | Confirm data refresh schedule; escalate if PERIOD_DATE_KEY > 45 days old |
| Fiscal year offset | FY2024 doesn't match expectations | Verify DIM_DATE.FISCAL_YEAR calculation; should be Feb-Jan not Jan-Dec |

---

## Theme Installation

### Step 1: Copy CSS Variables

From RETAILEDGE_THEME.md, copy the complete `:root` CSS block:

```css
:root {
  /* Page & Canvas */
  --color-bg-page: #F3F4F6;
  --color-bg-card: #FFFFFF;
  
  /* Navigation & Headers */
  --color-topbar: #1A1A2E;
  --color-topbar-text: #FFFFFF;
  
  /* Primary & Secondary Accents */
  --color-primary: #00AEFF;
  --color-primary-light: #E0F7FF;
  --color-primary-dark: #0084CC;
  --color-secondary: #1A7F64;
  --color-secondary-light: #D0E8E0;
  --color-secondary-dark: #0F4D36;
  
  /* Chart Series Colors */
  --color-chart-1: #00AEFF;
  --color-chart-2: #1A7F64;
  --color-chart-3: #94A3B8;
  --color-chart-4: #0EA5E9;
  --color-chart-5: #F59E0B;
  
  /* Status Colors */
  --color-positive: #059669;
  --color-positive-light: #D1F2EB;
  --color-negative: #D32F2F;
  --color-negative-light: #FFEBEE;
  --color-neutral: #94A3B8;
  --color-neutral-light: #F1F5F9;
  --color-warning: #F97316;
  --color-warning-light: #FFF7ED;
  --color-info: #3B82F6;
  --color-info-light: #EFF6FF;
  
  /* Text Colors */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-text-inverse: #FFFFFF;
  
  /* Borders & Dividers */
  --color-border-light: #E2E8F0;
  --color-border-medium: #CBD5E1;
  --color-border-dark: #94A3B8;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Spacing & Sizing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### Step 2: Apply Component Styles

Copy relevant component styles from RETAILEDGE_THEME.md:
- `.card` — Dashboard card backgrounds
- `.metric-card` — KPI tile styling
- `.table-header` — Table header styling
- `.chart-container` — Chart backgrounds
- `.button` (primary/secondary) — Filter and action buttons

### Step 3: Test Theme on Sample Dashboard

1. Create a test dashboard with 3–4 cards
2. Apply metric values and compare colors to RETAILEDGE_THEME.md
3. Verify:
   - Page background is #F3F4F6 (light gray)
   - Card backgrounds are #FFFFFF (white)
   - Primary buttons use #00AEFF (cyan)
   - Text uses #1E293B (dark slate) for primary, #64748B (gray) for secondary
   - Status colors: #059669 (green) for positive, #D32F2F (red) for negative

### Step 4: Verify Accessibility

Use a contrast checker (e.g., WebAIM Contrast Checker):
- Text Primary (#1E293B) on Card BG (#FFFFFF): 13.5:1 contrast ratio ✓ (AAA)
- Text Secondary (#64748B) on Card BG (#FFFFFF): 6.8:1 contrast ratio ✓ (AAA)
- Primary Button (#00AEFF) on Card BG (#FFFFFF): 4.8:1 contrast ratio ✓ (AA)

---

## Dashboard Development

### Phase 1: Priority Dashboards (2–3 weeks)

**Build in this order** (lowest effort, highest impact):

1. **Executive Overview** (2–3 days)
   - KPI cards: Total Revenue, Orders, Customers, AOV
   - Monthly trend line chart
   - Customer type distribution
   - **SQL**: Query Templates 1.1, 1.2, 1.3

2. **Brand Performance** (2–3 days)
   - Revenue by BU (bar chart)
   - YoY growth variance (BU comparison)
   - Customer mix by BU
   - **SQL**: Query Templates 7.1, 7.2, 7.3

3. **Sales & Revenue** (3–4 days)
   - Revenue by BU (monthly trend)
   - AOV and units trend
   - YoY variance detail
   - **SQL**: Query Templates 2.1, 2.2, 2.3

4. **Customer Lifecycle** (3–4 days)
   - Customer type distribution (pie)
   - New customer acquisition trend
   - Lifecycle cohort analysis
   - **SQL**: Query Templates 3.1, 3.2, 3.3

### Phase 2: Secondary Dashboards (3–4 weeks)

5. **Channel Mix** (3–4 days)
6. **Marketing Attribution** (3–4 days)
7. **Loyalty & Retention** (4–5 days)

### Phase 3: Advanced Dashboards (2–3 weeks)

8. **Geographic Performance** (4–5 days)
9. **Customer Segmentation** (3–4 days)
10. **Household Analysis** (3–4 days)
11. **Product Category** (ESCALATE: requires product SKU ETL; fallback to Product Atlas)

### Development Workflow

```
For each dashboard:

1. Prepare Data
   - Review query template from QUERY_TEMPLATES.sql
   - Test query in SQL editor; confirm <200 rows returned
   - Validate data freshness and accuracy vs. expectations

2. Design Layout
   - Sketch dashboard wireframe (Figma, paper, or whiteboard)
   - Identify KPI cards, charts, tables
   - Define interactivity (filters, drill-down)

3. Build SQL Layer
   - Adapt query template to BI tool (Tableau, Looker, etc.)
   - Apply filters (period, BU, channel, etc.)
   - Test for performance (should run in <5 seconds)

4. Build Visual Layer
   - Create cards and containers
   - Apply RETAILEDGE theme colors
   - Add chart types (line, bar, pie as appropriate)

5. Add Interactivity
   - Set up global filters (time, BU, customer type)
   - Configure drill-down actions
   - Test filter propagation across cards

6. Test & Refine
   - Verify calculations against METRIC_DEFINITIONS.md
   - Check data freshness
   - Compare metrics to prior reports (if available)
   - Ensure no data leakage (employee, fraud flags not excluded)

7. Document
   - Add dashboard description and KPI definitions
   - Create filter usage guide
   - Document any assumptions or caveats
```

---

## Testing & QA

### Pre-Deployment Checklist

- [ ] **Data Accuracy**
  - [ ] KPI values match METRIC_DEFINITIONS.md formulas
  - [ ] Row counts align with schema expectations
  - [ ] No missing/null values in critical fields
  - [ ] Data freshness within acceptable range (≤30 days old)

- [ ] **Calculation Correctness**
  - [ ] Revenue aggregations match FACT_CUSTOMER_PERFORMANCE
  - [ ] YoY growth calculations use correct fiscal year ranges
  - [ ] Customer counts match (no double-counting across goal types)
  - [ ] Percentages sum to 100% (where expected)

- [ ] **Filter Behavior**
  - [ ] All global filters (time, BU, channel) work correctly
  - [ ] Filter values populate from source tables
  - [ ] Filter changes propagate to all charts
  - [ ] No exclusion filters applied by default (IS_EMPLOYEE, IS_FRAUD, IS_DECEASED NOT filtered)

- [ ] **UI/UX**
  - [ ] RETAILEDGE theme colors applied correctly
  - [ ] Text contrast meets WCAG 2.1 AA standards
  - [ ] Responsive layout on desktop, tablet, mobile
  - [ ] Chart labels and axis titles are clear
  - [ ] Number formatting consistent ($ for currency, % for percentages, 0 decimals for counts)

- [ ] **Performance**
  - [ ] Dashboard loads in <5 seconds
  - [ ] Filter changes apply in <2 seconds
  - [ ] No long-running queries blocking interactivity

- [ ] **Documentation**
  - [ ] Dashboard description added
  - [ ] KPI definitions match METRIC_DEFINITIONS.md
  - [ ] Data governance note added (no exclusions policy)
  - [ ] Runbook created for maintenance/troubleshooting

### Test Script (Sample)

```
Dashboard: Executive Overview

Test 1: Load & Performance
- [ ] Dashboard loads within 5 seconds
- [ ] All KPI cards display values
- [ ] Monthly trend chart renders without errors

Test 2: Filter Functionality
- [ ] Select time period: Last 12 months (verify metric recalculates)
- [ ] Select Business Unit: Urban Thread (verify revenue updates to ~$6M)
- [ ] Select Customer Type: NEW (verify customer count decreases; revenue ~$250K)
- [ ] Clear filters; verify values return to totals

Test 3: Data Accuracy
- [ ] Total Revenue matches FACT_CUSTOMER_PERFORMANCE.SUM(NET_SALES) for period
- [ ] Total Customers matches sum of CUSTOMER_COUNT (no duplicates across goal types)
- [ ] YoY Growth % = (current_year - prior_year) / prior_year * 100
  - Expected FY2024 vs FY2023: ~7.3% growth based on $252.3M → $270.9M

Test 4: Accessibility
- [ ] Tab through filters using keyboard
- [ ] Verify focus outlines visible
- [ ] Check color contrast: primary text on white background ≥13.5:1
- [ ] Test on mobile device (responsive layout)
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All dashboards built and tested per QA checklist
- [ ] RETAILEDGE theme applied and validated
- [ ] Documentation (runbooks, FAQs, definitions) complete
- [ ] Data governance note on all dashboards (no exclusions policy)
- [ ] Stakeholder sign-off on dashboard scope and functionality
- [ ] Performance testing confirms <5 second load times

### Go-Live Activities

1. **Data Validation** (Day 1)
   - [ ] Confirm latest data load completed successfully
   - [ ] Run schema validation queries (see Database Schema Validation)
   - [ ] Spot-check metrics against prior reports

2. **User Training** (Day 1)
   - [ ] Brief C-suite on Executive Overview dashboard
   - [ ] Train Brand Managers on Brand Performance dashboard
   - [ ] Train CRM team on Loyalty & Retention dashboard
   - [ ] Provide filter and drill-down usage guide

3. **Monitoring** (Days 1–7)
   - [ ] Monitor query performance and load times
   - [ ] Collect user feedback on usability
   - [ ] Fix any data accuracy issues or UI glitches
   - [ ] Adjust thresholds or alerts based on feedback

4. **Post-Go-Live Documentation**
   - [ ] Create dashboard landing page with links to all 11 dashboards
   - [ ] Publish FAQ: common questions and troubleshooting
   - [ ] Create refresh schedule documentation
   - [ ] Set up Slack channel or email list for dashboard updates

---

## Troubleshooting

### Common Issues & Resolutions

#### Issue: Dashboard Takes >10 Seconds to Load

**Cause**: Query performance problem or excessive data volume

**Resolution**:
1. Check FACT_CUSTOMER_PERFORMANCE row count (should be 16,800; if >100K, data quality issue)
2. Confirm PERIOD_DATE_KEY filter applied (do not load entire 3-year history)
3. Optimize SQL: avoid SELECT *, use GROUP BY at appropriate grain
4. Check for cross joins or missing join conditions

---

#### Issue: Metrics Don't Match Prior Reports

**Cause**: Different calculation logic or exclusion filters

**Resolution**:
1. Verify formula in METRIC_DEFINITIONS.md matches dashboard SQL
2. Confirm no exclusion filters applied (IS_EMPLOYEE, IS_FRAUD, IS_DECEASED should be NULL/all)
3. Check date range alignment (use DIM_DATE.FISCAL_YEAR, not calendar year)
4. Validate goal_type_key context (revenue goals vs. acquisition goals may have different numbers)

---

#### Issue: Null Values in Dimension Fields

**Cause**: Orphaned foreign key or data quality issue

**Resolution**:
1. Run schema validation query (see Database Schema Validation section)
2. Identify missing dimension rows
3. Escalate to data engineering for investigation
4. Implement LEFT JOIN if nulls are expected; RIGHT JOIN to find orphans

---

#### Issue: Customer Count Appears Too High or Too Low

**Cause**: Aggregation error (summing across multiple goal types)

**Resolution**:
1. Confirm query uses SUM(CUSTOMER_COUNT), not COUNT(DISTINCT CUSTOMER_KEY)
2. Filter to single GOAL_TYPE_KEY if summing across BUs and periods
3. Check for duplicate rows in FACT_CUSTOMER_PERFORMANCE
4. Validate against V_CURRENT_CUSTOMER (1,200 rows) for current-state snapshots

---

#### Issue: Fiscal Year Calculations Are Incorrect

**Cause**: Using calendar year instead of fiscal year (Feb-Jan)

**Resolution**:
1. Use DIM_DATE.FISCAL_YEAR, not YEAR(CALENDAR_DATE)
2. FY2024 = Feb 2024 - Jan 2025; FY2023 = Feb 2023 - Jan 2024
3. When calculating YoY, compare FY2024 vs FY2023 (not 2024 vs 2023)
4. Use IS_FISCAL_YEAR_END flag for month-end validation (Jan 31)

---

### Contact & Support

| Issue Category | Owner | Escalation |
|----------------|-------|-----------|
| Dashboard questions | Analytics Team | Product Lead |
| Data quality issues | Data Engineering | Chief Data Officer |
| Performance problems | Data Platform Team | VP Engineering |
| Theme/styling questions | Design System | Creative Director |
| Business logic / definitions | Analytics Manager | CFO (for financial metrics) |

---

## Support & Escalation

### Support Channels

1. **Slack**: #falcon-consumer-analytics (for quick questions)
2. **Email**: analytics@company.com (for formal requests)
3. **Wiki**: internal analytics documentation (for runbooks & FAQs)
4. **Office Hours**: Weekly Tuesday 2 PM (analytics team + stakeholders)

### Escalation Path

```
User Question/Issue
  ↓
Analytics Team (responds within 24 hours)
  ↓
If data quality issue → Data Engineering team
If performance issue → Data Platform team
If business logic → CFO/Finance team
If urgent → VP Analytics (on-call)
```

### Feedback & Continuous Improvement

**Quarterly Review**:
1. Collect user feedback on dashboard usefulness
2. Identify missing KPIs or data gaps
3. Review dashboard usage statistics (which dashboards most accessed?)
4. Plan improvements for next phase

**Annual Review**:
1. Assess ROI of dashboard project
2. Determine if new dashboards needed (e.g., Product Category after ETL)
3. Update theme or refresh design (if needed)
4. Plan upgrades or extensions

---

## Next Steps

1. **This Week**:
   - [ ] Share kit contents with analytics team
   - [ ] Validate database connection and schema
   - [ ] Schedule kickoff meeting with stakeholders

2. **Week 2**:
   - [ ] Install RETAILEDGE theme
   - [ ] Develop Executive Overview dashboard (priority #1)
   - [ ] Run QA tests

3. **Week 3**:
   - [ ] Complete Brand Performance dashboard
   - [ ] Begin Sales & Revenue dashboard
   - [ ] Gather user feedback on Executive Overview

4. **Weeks 4–8**:
   - [ ] Complete remaining Phase 1 & 2 dashboards
   - [ ] Schedule go-live activities
   - [ ] Prepare user training materials

5. **Week 9**:
   - [ ] Go-live and launch dashboards
   - [ ] Monitor performance and collect feedback
   - [ ] Plan Phase 2 enhancements

---

**Contact**: Analytics Team | **Last Updated**: 2024-04-15 | **Next Review**: 2024-07-15
