# Setup Guide
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Quick-start guide for building and deploying all 10 dashboards from this analytics kit.

---

## OVERVIEW

This kit provides a complete blueprint for deploying Falcon Car Manufacturing analytics across 10 production, service, and procurement dashboards. Expected deployment timeline: **2-3 weeks** (design, build, test, UAT).

**What's Included:**
- Schema map (8 fact + 7 dimension tables)
- 14 KPI metric definitions with SQL formulas
- 5 interactive filters (Year, Plant, Brand, Model, Shift)
- Dark Blue + Orange color theme (Falcon branding)
- Global filter rules (service centre exclusion)
- 2024 validation benchmarks and data quality rules

**Deliverables:**
1. 10 Interactive dashboards (90%+ ready)
2. Documentation (this guide + 7 supporting files)
3. SQL query templates
4. User training materials

---

## PREREQUISITES

### Technical Stack
- **BI Platform:** Tableau, Looker, PowerBI, or custom HTML/React with Chart.js
- **Data Warehouse:** SQL Server, PostgreSQL, or cloud warehouse (Snowflake, BigQuery)
- **Data Model:** Star schema (8 fact tables, 7 dimensions) pre-built and tested
- **Browser:** Chrome, Firefox, Safari (modern versions)

### Access & Permissions
- Read access to all 8 fact tables and 7 dimension tables
- Admin access to BI platform for dashboard creation
- SQL access for query testing and validation
- Color theme assets (provided in RETAILEDGE_THEME.md)

### Team
- 1 Analytics Lead (oversee project)
- 1-2 BI Developers (dashboard build)
- 1 SQL/Data Engineer (query validation)
- 1-2 Business Analysts (UAT)
- Optional: UI/UX Designer (polish phase)

---

## PHASE 1: SETUP (Days 1-2)

### 1.1 Data Validation
**Owner:** Data Engineer | Duration: 4-6 hours

Confirm warehouse is production-ready:

```sql
-- Check record counts by table (2024 data)
SELECT 'FACT_ASSEMBLY_OUTPUT' as table_name, COUNT(*) as row_count 
FROM FACT_ASSEMBLY_OUTPUT WHERE YEAR(DATE_KEY) = 2024
UNION ALL
SELECT 'FACT_QUALITY_EVENTS', COUNT(*) 
FROM FACT_QUALITY_EVENTS WHERE YEAR(DATE_KEY) = 2024
UNION ALL
SELECT 'FACT_EQUIPMENT_EVENTS', COUNT(*) 
FROM FACT_EQUIPMENT_EVENTS WHERE YEAR(EVENT_DATE) = 2024
UNION ALL
SELECT 'FACT_SERVICE_JOBS', COUNT(*) 
FROM FACT_SERVICE_JOBS WHERE YEAR(JOB_DATE) = 2024
UNION ALL
SELECT 'FACT_WARRANTY_CLAIMS', COUNT(*) 
FROM FACT_WARRANTY_CLAIMS WHERE YEAR(CLAIM_DATE) = 2024
UNION ALL
SELECT 'FACT_PURCHASE_ORDERS', COUNT(*) 
FROM FACT_PURCHASE_ORDERS WHERE YEAR(PO_DATE) = 2024
UNION ALL
SELECT 'FACT_LABOR_HOURS', COUNT(*) 
FROM FACT_LABOR_HOURS WHERE YEAR(DATE_KEY) = 2024
UNION ALL
SELECT 'FACT_INVENTORY', COUNT(*) 
FROM FACT_INVENTORY WHERE YEAR(DATE_KEY) = 2024;
```

**Expected Baseline Values:**
- FACT_ASSEMBLY_OUTPUT: ~1.3M rows (daily production 2020-2024)
- FACT_QUALITY_EVENTS: ~8K rows (low defect rate)
- FACT_EQUIPMENT_EVENTS: ~2.2M rows (equipment events 2020-2024)
- FACT_SERVICE_JOBS: ~860 rows (low service volume)
- FACT_WARRANTY_CLAIMS: ~50K rows (warranty claims 2020-2024)
- FACT_PURCHASE_ORDERS: ~2.8M rows (PO line items 2020-2024)
- FACT_LABOR_HOURS: ~219K rows (daily shift labor)
- FACT_INVENTORY: ~1.5M rows (daily inventory snapshots)

**Checklist:**
- [ ] All 8 tables exist and have data for 2024
- [ ] 2024 total production = 367,383 units (validate FACT_ASSEMBLY_OUTPUT)
- [ ] 2024 avg OEE = 87.99% (validate OEE_PCT column)
- [ ] Foreign keys intact (no orphaned records)
- [ ] Date columns are properly formatted (YYYY-MM-DD)
- [ ] Numeric columns are non-null where required

**Common Issues & Fixes:**
| Issue | Cause | Fix |
|-------|-------|-----|
| Row counts don't match | Data pipeline lag or incomplete load | Check data refresh log; re-run pipeline if needed |
| 2024 production ≠ 367,383 | Reporting table inclusion/exclusion differs | Confirm service centres excluded; use plant type filter |
| OEE not in 85-90% range | Calculation differs from source | Validate Availability × Performance × Quality formula |
| Missing dates (e.g., holidays) | Date dimension doesn't include all days | Confirm 365 days in 2024 (leap year = 366) |

---

### 1.2 BI Platform Setup
**Owner:** Analytics Lead + BI Developer | Duration: 2-4 hours

1. **Create Project/Workspace**
   - Name: "Falcon Car Manufacturing"
   - Description: "Manufacturing analytics for 6 brands, 12 plants, 15 suppliers"
   - Visibility: Internal (restricted to manufacturing org)

2. **Set Up Data Connections**
   - Connect BI platform to warehouse (validate credentials)
   - Test query execution (run sample SELECT on each fact table)
   - Set refresh schedule: Daily at 23:00 UTC (post-EOD in all regions)

3. **Import Color Theme**
   - Copy CSS variables from RETAILEDGE_THEME.md
   - Brand colors: Falcon Orange (#E87722), Falcon Blue (#1B3A5C)
   - Create color palette in BI platform (if platform supports custom palettes)
   - Test: Create test KPI tile, apply orange color, verify visibility

4. **Create Filter Parameters**
   - Year (dropdown: 2020-2024)
   - Plant (multi-select: 12 production plants)
   - Brand (multi-select: 6 brands with model cascade)
   - Model (multi-select: 18 models)
   - Shift (multi-select: 1, 2, 3)

---

### 1.3 Query Testing
**Owner:** SQL Engineer | Duration: 3-4 hours

Build and test 14 core SQL queries (one per KPI):

```sql
-- Example: OEE % (Dashboard 3)
SELECT 
  YEAR(DATE_KEY) as year,
  MONTH(DATE_KEY) as month,
  AVG(OEE_PCT) as oee_pct,
  MIN(OEE_PCT) as min_oee,
  MAX(OEE_PCT) as max_oee
FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
  AND YEAR(DATE_KEY) = 2024
GROUP BY YEAR(DATE_KEY), MONTH(DATE_KEY)
ORDER BY year, month;

-- Expected 2024 avg: 87.99% ± 0.5%
```

**Testing Checklist:**
- [ ] All 14 KPI queries execute <2 seconds
- [ ] Results match METRIC_DEFINITIONS.md formulas
- [ ] Results align with 2024 validation benchmarks
- [ ] Service centre exclusion working (Chicago, Munich, Sydney, Rotterdam filtered)
- [ ] Null handling correct (NULLs not breaking aggregations)

**Optimize if Needed:**
- Add indexes on DATE_KEY, PLANT_ID, PLANT_TYPE columns
- Partition fact tables by year (if >1M rows)
- Test query performance with filters applied

---

## PHASE 2: DASHBOARD BUILD (Days 3-10)

### 2.1 Dashboard Template Setup
**Owner:** BI Developer | Duration: 2 days

Create a master dashboard template with consistent layout:

**Header Section (Topbar):**
- Logo + project title ("Falcon Car Manufacturing | xFalcon AnalyticsPro")
- Filter controls (Year, Plant, Brand, Model, Shift)
- Timestamp (last refresh time)
- Styling: Dark Blue (#1B3A5C) background, white text

**Body Section:**
- KPI tiles (top left quadrant): 3-4 key metrics with orange accent
- Charts (main area): 2-3 visualizations per dashboard
- Data table (bottom): Supporting detail with drill-down
- Styling: White cards (#FFFFFF), Light Gray background (#F3F4F6), Falcon Blue titles

**Grid Layout:** 12-column responsive grid (mobile 2 col, tablet 4 col, desktop 12 col)

---

### 2.2 Build 10 Dashboards
**Owner:** BI Developer | Duration: 8 days (1 dashboard per day, with overlap)

#### Dashboard 1: Executive Overview
**Purpose:** C-suite KPI summary  
**KPIs:** OEE%, Yield%, Scrap Rate, Labor Cost/Unit, CSAT Score  
**Charts:**
- OEE trend (line chart, 12 months)
- Production vs. Plan (dual-axis bar + line)
- Brand comparison (horizontal bar)
- KPI status (scorecards: green/red by target)

**Filters:** Year, Plant, Brand, Model, Shift

---

#### Dashboard 2: Production Performance
**Purpose:** Daily production tracking and plant comparison  
**KPIs:** Units Produced, Plan Attainment%, Downtime Rate  
**Charts:**
- Daily production by plant (stacked bar)
- Yield % trend (line chart)
- Plant ranking (horizontal bar: units/day)
- Shift performance (group bar: 3 shifts)

**Filters:** Year, Plant, Brand, Model, Shift

---

#### Dashboard 3: OEE & Equipment
**Purpose:** Equipment effectiveness and downtime root cause  
**KPIs:** OEE%, Availability%, Performance%, Quality%  
**Charts:**
- OEE by plant (heatmap or group bar)
- Downtime root cause (pie/donut chart)
- Equipment MTBF (bar chart: days)
- Trend: OEE 12-month rolling (line)

**Filters:** Year, Plant, Brand, Model, Shift

---

#### Dashboard 4: Quality & Defects
**Purpose:** Defect tracking and first-pass yield  
**KPIs:** Defect Count, Scrap Rate, Rework Rate, First Pass Yield  
**Charts:**
- Defects by type (horizontal bar)
- Defect trend (line chart, 12 months)
- Model comparison: FPY% (group bar)
- Plant ranking by quality (KPI tiles)

**Filters:** Year, Plant, Brand, Model, Shift, Defect Type

**Data Quality Alert:** Defects = 40 in 2024 (unusually low; note in dashboard)

---

#### Dashboard 5: Supplier Scorecard
**Purpose:** Supplier performance ranking  
**KPIs:** On-Time Delivery%, Quality Score, Fill Rate, Spend  
**Charts:**
- Supplier scorecard (table: all 15 suppliers + metrics)
- On-time delivery trend (line by supplier)
- Spend by supplier (horizontal bar)
- Quality score distribution (scatter or heatmap)

**Filters:** Year, Supplier

---

#### Dashboard 6: Inventory & Supply Chain
**Purpose:** Inventory management and supply chain health  
**KPIs:** Days of Supply, Inventory Turnover, Stock Coverage%, Safety Stock  
**Charts:**
- Inventory by location (group bar: Raw Mat, WIP, Finished)
- Days of supply trend (line chart)
- Part turnover distribution (scatter plot)
- Lead time vs. safety stock (bubble chart)

**Filters:** Year, Plant, Supplier

---

#### Dashboard 7: Service & After-Sales
**Purpose:** Service centre job tracking and CSAT  
**KPIs:** Jobs Completed, CSAT Score, Avg Turnaround Days, Cost per Job  
**Charts:**
- Jobs by centre (group bar: 4 centres)
- CSAT by centre (KPI tiles with red alert on 2.85)
- Job type breakdown (pie/donut)
- Turnaround time trend (line chart)

**Filters:** Year, Service Centre

**Data Quality Alert:** CSAT = 2.85 in 2024 (far below industry 3.5-4.2; FLAGGED for investigation)

---

#### Dashboard 8: Warranty Analysis
**Purpose:** Warranty claim cost and root cause  
**KPIs:** Claim Count, Cost per Claim, Repeat Claims%, Days to Resolution  
**Charts:**
- Claims by brand (group bar: 6 brands)
- Cost per claim trend (line chart, 12 months)
- Failure type distribution (horizontal bar)
- Repeat claim % by brand (line or KPI tiles)

**Filters:** Year, Brand, Model

---

#### Dashboard 9: Workforce & Labor
**Purpose:** Labor cost and headcount tracking  
**KPIs:** Labor Cost/Unit, Headcount, Overtime Hours, Turnover Rate  
**Charts:**
- Labor cost by plant (horizontal bar)
- Headcount by shift (group bar: 3 shifts)
- Overtime trend (line chart)
- Avg cost per unit by plant (scatter or bar)

**Filters:** Year, Plant, Shift

---

#### Dashboard 10: Purchase Orders
**Purpose:** Procurement tracking and supplier compliance  
**KPIs:** PO Spend, Fill Rate%, Lead Time, On-Time Delivery%  
**Charts:**
- Spend by supplier (horizontal bar)
- PO volume trend (line chart, 12 months)
- Fill rate by supplier (bar chart)
- Lead time distribution (scatter or box plot)

**Filters:** Year, Plant, Supplier

---

### 2.3 Apply Theme & Styling
**Owner:** BI Developer + UI Designer (optional) | Duration: 1 day

1. **Colors:**
   - Topbar: #1B3A5C (Falcon Blue)
   - Background: #F3F4F6 (Light Gray)
   - Cards: #FFFFFF (White)
   - KPI values: #1B3A5C, 28px bold
   - KPI labels: #64748B, 12px semibold, uppercase
   - Chart primary: #1B3A5C
   - Chart secondary: #E87722 (Falcon Orange)
   - Status positive: #059669 (Green)
   - Status negative: #D32F2F (Red)

2. **Typography:**
   - Font: Inter (Google Fonts)
   - Card titles: 16px, 700 weight
   - Body: 14px, 400 weight
   - Axis labels: 12px, 400 weight

3. **Spacing & Layout:**
   - Card padding: 20px
   - Margin between cards: 16px
   - Border radius: 8px
   - Shadow: Subtle (0 1px 3px rgba(0,0,0,0.1))

4. **Interactive Elements:**
   - Filter dropdowns: 36px height, border radius 4px
   - Hover state: Light gray background (#F9FAFB)
   - Focus state: Blue border (#1B3A5C), 2px
   - Buttons: Orange background (#E87722), white text, 14px bold

---

## PHASE 3: TESTING (Days 11-14)

### 3.1 Data Validation Testing
**Owner:** Data Engineer + Analyst | Duration: 1 day

Run comprehensive data quality checks:

```sql
-- 1. Production volume check
SELECT SUM(UNITS_PRODUCED) as total_2024
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024
  AND PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam');
-- Expected: ~367,383 units ± 2%

-- 2. OEE sanity check
SELECT AVG(OEE_PCT) as avg_oee_2024
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024;
-- Expected: ~87.99% ± 0.5%

-- 3. Service centre exclusion check
SELECT COUNT(DISTINCT PLANT_ID) as production_plant_count
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024
  AND PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam');
-- Expected: 12 plants

-- 4. Defect data completeness
SELECT COUNT(*) as defect_count
FROM FACT_QUALITY_EVENTS
WHERE YEAR(DATE_KEY) = 2024;
-- Expected: ~40 (FLAG: unusually low)

-- 5. Filter functionality
SELECT COUNT(*) as records_filtered
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024
  AND PLANT_ID = 'Cologne'
  AND SHIFT = '1';
-- Expected: >0 (no empty results for valid combinations)
```

**Checklist:**
- [ ] 2024 production = 367,383 units (±2% tolerance)
- [ ] OEE 87.99% ±0.5%
- [ ] 12 production plants returned (service centres excluded)
- [ ] Defect count = 40 (or note discrepancy)
- [ ] All filter combinations return sensible results
- [ ] No broken joins (NULL foreign keys <1%)
- [ ] Date grain correct (daily for production, monthly for some metrics)

---

### 3.2 Dashboard Functional Testing
**Owner:** BI Developer + Analyst | Duration: 1-2 days

Test each dashboard for:

1. **KPI Accuracy:**
   - Compare dashboard metric to METRIC_DEFINITIONS.md formula
   - Spot-check against raw SQL query results
   - Verify rounding/number formatting matches spec

2. **Filter Behavior:**
   - Select Year=2023 → all data shifts to 2023, no 2024 data shown
   - Select Plant=Detroit → only Detroit records visible
   - Select Brand=Toyota → Model dropdown shows only Camry, Corolla, RAV4
   - Select Shift=1 → results only for shift 1
   - Multi-select Plant=Cologne+Kyoto → shows combined results

3. **Chart Interactivity:**
   - Hover over chart → tooltip displays values
   - Click legend item → toggle series on/off
   - Drill-down (if enabled) → navigate to detail view
   - Zoom/pan (if enabled) → works smoothly

4. **Performance:**
   - Dashboard loads <2 seconds
   - Filter change updates <1 second
   - Drill-down <1 second
   - No timeout errors or slow queries

5. **Visual Consistency:**
   - Topbar: Dark Blue (#1B3A5C), white text
   - Background: Light Gray (#F3F4F6)
   - Cards: White with 8px border radius and subtle shadow
   - KPI values: 28px Falcon Blue, bold
   - Charts: Primary series Falcon Blue, secondary orange
   - Text: Dark Slate (#1E293B), proper contrast

---

### 3.3 User Acceptance Testing (UAT)
**Owner:** Business Analysts + Power Users | Duration: 3 days

Select 3-5 power users per dashboard (plant managers, procurement lead, quality director) for testing:

**UAT Script:**
1. Log into dashboard
2. Apply filter: Year=2024, Plant=Cologne
3. Verify top 3 KPI values match their expectations
4. Compare chart to last month's performance
5. Drill down from KPI to detail table
6. Export report (if supported)
7. Feedback: Does this meet your needs? Any missing metrics?

**Common UAT Findings:**
| Feedback | Resolution |
|----------|-----------|
| "OEE looks lower than my shift records" | Validate OEE calc with plant's measurement method |
| "CSAT of 2.85 seems wrong" | Confirm data source and survey methodology |
| "Can't find Model filter on Supplier dashboard" | Correct: not applicable; remove from filter bar |
| "Need to compare 2023 vs 2024 side-by-side" | Add year-over-year toggle to dashboard |
| "Labor cost calculation looks off" | Verify FACT_LABOR_HOURS allocation method |

**Sign-Off:** Business owner approves KPIs, confirms data accuracy, authorizes publication

---

## PHASE 4: DEPLOYMENT (Days 15-18)

### 4.1 Production Deployment
**Owner:** Analytics Lead + BI Developer | Duration: 1 day

1. **Migrate Dashboards to Production**
   - Move from dev environment to production workspace
   - Update data connection to production warehouse
   - Test refresh schedule (daily 23:00 UTC)

2. **Enable Sharing & Access Control**
   - Manufacturing: All users (read-only)
   - Plant Managers: Plant-specific dashboards only
   - Procurement Lead: Supplier Scorecard + PO dashboard
   - Quality Director: Quality + Defects dashboards
   - Service Leadership: Service & Warranty dashboards

3. **Set Refresh Schedule**
   - Full refresh: Daily 23:00 UTC
   - Incremental refresh (optional): 2x daily at 06:00 and 18:00 UTC

---

### 4.2 Documentation & Training
**Owner:** Analytics Lead | Duration: 2 days

1. **Create User Guide** (1-2 pages)
   - How to access dashboards
   - What each dashboard shows
   - How to use filters (Year, Plant, Brand, Model, Shift)
   - Glossary of KPIs (link to METRIC_DEFINITIONS.md)
   - Common FAQs

2. **Conduct Training Sessions** (2 hours per session, 4 sessions)
   - Session 1: Executive Overview (C-suite, 30 min)
   - Session 2: Production dashboards (Plant managers, 1 hour)
   - Session 3: Quality & Supplier (Ops team, 1 hour)
   - Session 4: Service & Warranty (Service leadership, 1 hour)

3. **Distribute Training Materials**
   - Email link to dashboards + user guide
   - Record training videos (optional)
   - Set up help desk for questions

---

### 4.3 Post-Launch Monitoring
**Owner:** Analytics Lead | Duration: Ongoing

1. **Weekly Data Quality Audit**
   - Check refresh success (should complete <5 min)
   - Validate production volume (367K/year baseline)
   - Flag anomalies (OEE <80%, defects spike, CSAT drops)
   - Reconcile to source systems

2. **Monthly Metrics Review**
   - Confirm KPI calculations match business expectations
   - Investigate unexpected trends
   - Collect user feedback (add to feature backlog)

3. **Quarterly Optimization**
   - Performance tuning (optimize slow queries)
   - UX improvements (refine filter logic, add missing charts)
   - Training updates (new users, process changes)

---

## RISK MITIGATION

### Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Data Quality Issues** | KPIs unreliable; loss of trust | Pre-launch validation (VALIDATION_BENCHMARKS.md), weekly audits |
| **CSAT = 2.85 (unusually low)** | Misguided service decisions | Cross-check source system; business validation required before publish |
| **Defect count = 40 (suspiciously low)** | Overstate quality; miss real issues | Validate against warranty claims and scrap data |
| **Performance <2 sec load time** | Poor user adoption | Optimize queries, add indexing, partition tables by year |
| **Service centre miscategorization** | Production metrics polluted | Use explicit plant type filter (WHERE PLANT_TYPE='Production') |
| **Filter cascade fails** | Confusing user experience | Test Brand→Model cascade thoroughly in UAT |
| **Multi-currency conversion errors** | PO spend misaligned | Use daily exchange rates; reconcile to finance ledger ±5% |

---

## SUPPORT & ESCALATION

### Escalation Path

1. **Tier 1: Dashboard User Issue**
   - Contact: Analytics Help Desk (help@xfalcon.com)
   - Response: 2-4 hours
   - Examples: Filter not working, chart not loading

2. **Tier 2: Data Accuracy Question**
   - Contact: Analytics Lead
   - Response: 24 hours
   - Examples: OEE calculation discrepancy, missing supplier data

3. **Tier 3: Data Pipeline Failure**
   - Contact: Data Engineering Lead
   - Response: 1 hour SLA
   - Examples: Warehouse refresh failed, missing 2024 data

### Support Contact Info
- **Analytics Help Desk:** help@xfalcon.com | +1-XXX-XXX-XXXX
- **Analytics Lead:** [Name] | [email]
- **Data Engineering:** [Name] | [email]

---

## APPENDIX: File Reference

This kit includes 8 reference documents:

| File | Purpose |
|------|---------|
| DASHBOARD_FEASIBILITY.md | 90%+ readiness matrix for all 10 dashboards |
| DATA_SCHEMA_MAP.md | Complete schema (8 fact + 7 dimension tables) |
| RETAILEDGE_THEME.md | Color palette, typography, CSS variables |
| METRIC_DEFINITIONS.md | 14 KPI formulas with business logic |
| GLOBAL_FILTERS.md | Filter strategy & implementation guide |
| VALIDATION_BENCHMARKS.md | 2024 baseline values, data quality rules |
| SETUP_GUIDE.md | This file; step-by-step deployment |
| SKILL.md | xFalcon project skill card with IDA connectors |

---

## CHECKLIST FOR LAUNCH

- [ ] **PHASE 1 Complete**
  - [ ] Data validation passed (367K units, 87.99% OEE, 12 plants)
  - [ ] BI platform configured with color theme
  - [ ] All 14 KPI queries tested <2 sec
  - [ ] Service centre exclusion verified

- [ ] **PHASE 2 Complete**
  - [ ] All 10 dashboards built (Executive Overview through Purchase Orders)
  - [ ] Theme applied (Falcon Blue/Orange, Inter font, responsive layout)
  - [ ] Filters implemented (Year, Plant, Brand, Model, Shift, context-specific)
  - [ ] Data tables & drill-down working

- [ ] **PHASE 3 Complete**
  - [ ] Data quality tests passed
  - [ ] All dashboards functional (KPIs, charts, filters, performance)
  - [ ] UAT sign-off from business owners
  - [ ] CSAT (2.85) and Defects (40) flagged for investigation

- [ ] **PHASE 4 Complete**
  - [ ] Dashboards moved to production
  - [ ] Refresh schedule configured
  - [ ] Access control configured
  - [ ] Training completed (4 sessions)
  - [ ] User guide distributed
  - [ ] Support team ready

---

**Estimated Timeline:** 3 weeks (15 business days)  
**Team Size:** 4-6 people (Analytics, BI, SQL, Business Analysts)  
**Go-Live Date:** Target [date + 3 weeks from start]

**Last Updated:** 2026-04-12  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
