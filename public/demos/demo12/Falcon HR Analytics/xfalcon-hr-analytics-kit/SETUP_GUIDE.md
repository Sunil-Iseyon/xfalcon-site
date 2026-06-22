# Falcon HR Analytics - Setup & Implementation Guide

## Quick Start (5 Steps)

### Step 1: Connect the IDA Connector
1. Open Claude Code or your analytics environment
2. Verify the **IDA connector ID:** `mcp__ida__`
3. Ensure connector is authenticated and active
4. Test connection with sample query:
   ```sql
   SELECT COUNT(*) AS EMPLOYEE_COUNT FROM EMPLOYEES
   ```
5. Expected result: 584 rows in EMPLOYEES table

### Step 2: Review Data Schema
1. Read `DATA_SCHEMA_MAP.md` to understand:
   - 28 tables with row counts and column definitions
   - Relationship map and critical join conditions
   - Data grain summary for each table
2. Familiarize yourself with key tables:
   - **EMPLOYEES** (584) — employee master
   - **EMPLOYEE_ASSIGNMENTS** (653) — current/historical roles
   - **COMPENSATION_RECORDS** (3,434) — salary history
   - **PERFORMANCE_REVIEWS** (1,249) — ratings and feedback
   - **SURVEY_RESPONSES** (6,699) — engagement and eNPS

### Step 3: Understand Filters & Governance
1. Read `GLOBAL_FILTERS.md` to learn:
   - User-selectable filters (Department, Location, Time Period)
   - Hardcoded filters (current employee status, current assignments)
   - Data quality caveats (survey duplicates in 2023-2024)
   - Filter best practices and SQL patterns
2. Key rule: For current headcount, always use `EMPLOYEE_STATUS IN ('Active', 'On Leave')`

### Step 4: Load Theme & Branding
1. Read `RETAILEDGE_THEME.md` to understand:
   - Dark theme color palette (dark blue, cyan, coral, lime)
   - Typography (Inter font, text hierarchy)
   - Chart colors (Deep Blue #006AFF, Teal #1A7F64, Gray #94A3B8)
   - KPI indicators (Green = positive, Red = negative)
2. Apply CSS variables to your dashboard framework

### Step 5: Review Metrics & Build Dashboard
1. Read `METRIC_DEFINITIONS.md` to understand:
   - 19 standard HR metrics with SQL formulas
   - Business definitions and unit/direction
   - Source tables and dashboard usage
2. Start with core metrics in "Workforce Overview" dashboard (see file inventory below)
3. Use `QUERY_TEMPLATES.sql` for starter queries

---

## File Inventory

### Core Documentation (6 files, read in order)
1. **DATA_SCHEMA_MAP.md** — Complete data schema with 28 tables, relationships, and join patterns
2. **METRIC_DEFINITIONS.md** — 19 standard HR metrics with SQL formulas, definitions, and usage
3. **GLOBAL_FILTERS.md** — Filter strategy, data quality caveats, and SQL best practices
4. **RETAILEDGE_THEME.md** — Color palette, typography, branding, and component styling
5. **SETUP_GUIDE.md** — This file; implementation roadmap
6. **QUERY_TEMPLATES.sql** — Starter SQL queries for all 9 dashboards

### Dashboard Projects (9 dashboards total)
**Data Portal (Landing Page)**
- Overview with KPI summary
- Links to all 9 dashboards
- Quick filters (Department, Location, Date Range)

**Dashboard 1: Workforce Overview**
- Total headcount, headcount by department/location
- Turnover rate (overall, voluntary, regrettable)
- New hires YTD
- Headcount trending

**Dashboard 2: Department Analytics**
- Headcount by department and cost center
- Department budget vs actual compensation
- Key metrics by department
- Department comparison drill-down

**Dashboard 3: Compensation Analytics**
- Average salary by grade/department/location
- Total compensation cost
- Compa-ratio distribution
- Salary trending

**Dashboard 4: Pay Equity Analysis**
- Gender pay gap by job grade
- Pay equity trending
- Diversity metrics (gender, ethnicity)
- Compliance reporting

**Dashboard 5: Performance Management**
- Distribution of performance ratings
- Goal attainment rates
- Performance vs compensation
- High performer identification

**Dashboard 6: Retention Analytics**
- Voluntary turnover by department/manager
- Regrettable attrition tracking
- New hire retention rate (Year 1)
- Exit reasons analysis

**Dashboard 7: Recruitment Analytics**
- Time to fill trending
- Offer acceptance rate
- Applicants per requisition
- Hiring pipeline by stage

**Dashboard 8: Learning & Development**
- Training completion rate
- Program enrollment trends
- Employee skills inventory
- Certification tracking

**Dashboard 9: Employee Engagement**
- eNPS score and trend
- Engagement score by department
- Survey response rates
- Engagement drivers analysis

---

## IDA Connector Information

### Connector ID
```
mcp__ida__
```

### Schema Access
**No prefix needed.** Reference tables by name directly:
```sql
SELECT * FROM EMPLOYEES
SELECT * FROM EMPLOYEE_ASSIGNMENTS
SELECT * FROM COMPENSATION_RECORDS
-- etc.
```

### Available Tables (28 total)
```
EMPLOYEES
EMPLOYEE_ASSIGNMENTS
DEPARTMENTS
LOCATIONS
COST_CENTERS
JOB_FAMILIES
JOB_GRADES
POSITIONS
COMPENSATION_RECORDS
PERFORMANCE_CYCLES
PERFORMANCE_REVIEWS
GOALS
EXIT_RECORDS
JOB_REQUISITIONS
CANDIDATES
APPLICATIONS
INTERVIEW_STAGES
LEAVE_REQUESTS
LEAVE_TYPES
SURVEY_CAMPAIGNS
SURVEY_RESPONSES
EMPLOYEE_SKILLS
SKILLS
TRAINING_ENROLLMENTS
TRAINING_PROGRAMS
ATTENDANCE_RECORDS (EMPTY - do not use)
```

### Query Execution
Use the IDA `ida_query()` tool with standard SQL:
```sql
SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...
```

All queries are SELECT-only (no INSERT/UPDATE/DELETE).

---

## Dashboard Build Checklist

### Pre-Build
- [ ] Read DATA_SCHEMA_MAP.md
- [ ] Read METRIC_DEFINITIONS.md for all metrics used
- [ ] Read GLOBAL_FILTERS.md for required filters
- [ ] Review RETAILEDGE_THEME.md for colors/styling
- [ ] Copy starter queries from QUERY_TEMPLATES.sql
- [ ] Identify filters needed (Department, Location, Time Period)

### During Build
- [ ] Create filter UI (Department multi-select, Location multi-select, Date range)
- [ ] For each metric/chart:
  - [ ] Write or adapt SQL query from QUERY_TEMPLATES.sql
  - [ ] Test query in IDA connector (ida_query tool)
  - [ ] Verify record counts make sense
  - [ ] Create corresponding chart/KPI tile
  - [ ] Apply RETAILEDGE_THEME colors and styling
- [ ] Add drill-down capability where applicable
- [ ] Add explanatory tooltips for complex metrics
- [ ] Verify all joins match DATA_SCHEMA_MAP.md relationship map

### Post-Build
- [ ] Test all filters work correctly
- [ ] Verify numbers match expectations (spot-check key metrics)
- [ ] Check for null/missing data handling
- [ ] Validate color contrast for accessibility
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Add data refresh schedule documentation
- [ ] Document any custom business logic applied
- [ ] Create user guide for dashboard

### Performance Optimization
- [ ] Limit initial data loads (use WHERE clauses)
- [ ] Use GROUP BY to aggregate large tables before returning
- [ ] Avoid SELECT * on tables with 1000+ rows
- [ ] Set reasonable query timeouts (avoid long-running queries)
- [ ] Cache summary tables if queries run slowly
- [ ] Monitor IDA query performance and optimize SQL

---

## Troubleshooting

### Query Returns Incorrect Headcount
**Symptom:** Headcount higher than expected (duplicates)

**Cause:** Not filtering for current assignment (END_DATE IS NULL)

**Fix:**
```sql
-- WRONG: Creates duplicates from historical assignments
SELECT COUNT(DISTINCT E.EMPLOYEE_ID)
FROM EMPLOYEES E
JOIN EMPLOYEE_ASSIGNMENTS EA ON E.EMPLOYEE_ID = EA.EMPLOYEE_ID

-- RIGHT: Uses current assignment only
SELECT COUNT(DISTINCT E.EMPLOYEE_ID)
FROM EMPLOYEES E
JOIN EMPLOYEE_ASSIGNMENTS EA
  ON E.EMPLOYEE_ID = EA.EMPLOYEE_ID
  AND EA.END_DATE IS NULL
```

---

### Compensation Data Doesn't Match Finance
**Symptom:** Total compensation significantly different from expected

**Cause:** Including expired compensation records or wrong COMP_TYPE

**Fix:**
```sql
-- WRONG: Includes expired and bonus records
SELECT SUM(C.AMOUNT) FROM COMPENSATION_RECORDS C

-- RIGHT: Current base compensation only
SELECT SUM(C.AMOUNT)
FROM COMPENSATION_RECORDS C
WHERE C.END_DATE IS NULL
  AND C.COMP_TYPE = 'Base'
```

---

### Survey eNPS Score Incorrect
**Symptom:** eNPS calculation doesn't match expected range (-100 to +100)

**Cause:** Not excluding detractors or wrong response score field

**Fix:**
```sql
-- WRONG: Sums scores instead of counting responses
SELECT SUM(RESPONSE_SCORE) / COUNT(*) AS eNPS

-- RIGHT: Counts promoters and detractors
SELECT ROUND(
  (COUNT(CASE WHEN RESPONSE_SCORE >= 9 THEN 1 END) -
   COUNT(CASE WHEN RESPONSE_SCORE <= 6 THEN 1 END)) /
  COUNT(*) * 100,
  1
) AS eNPS_SCORE
FROM SURVEY_RESPONSES
WHERE QUESTION_CODE = 'eNPS'
```

---

### Survey Data Duplicated or Missing
**Symptom:** eNPS or engagement scores double-counted or missing

**Cause:** Multiple campaigns in 2023-2024 with same period

**Fix:**
```sql
-- Deduplicate campaigns
SELECT * FROM SURVEY_RESPONSES SR
WHERE SR.CAMPAIGN_ID IN (
  SELECT CAMPAIGN_ID FROM (
    SELECT
      CAMPAIGN_ID,
      ROW_NUMBER() OVER (
        PARTITION BY CAMPAIGN_NAME, MONTH(LAUNCH_DATE)
        ORDER BY LAUNCH_DATE DESC
      ) AS RN
    FROM SURVEY_CAMPAIGNS
  )
  WHERE RN = 1
)
```

See GLOBAL_FILTERS.md for full details on survey campaign duplicates.

---

### Performance Reviews Seem Too High/Low
**Symptom:** Average performance rating not matching expected distribution

**Cause:** Including non-calibrated reviews

**Fix:**
```sql
-- WRONG: Includes draft and uncalibrated reviews
SELECT AVG(OVERALL_RATING) FROM PERFORMANCE_REVIEWS

-- RIGHT: Uses final calibrated ratings only
SELECT AVG(OVERALL_RATING)
FROM PERFORMANCE_REVIEWS
WHERE IS_FINAL_CALIBRATED = TRUE
```

---

### Manager Span of Control Includes Non-Managers
**Symptom:** Span of control metrics inflated with non-reporting roles

**Cause:** Not excluding null MANAGER_ID

**Fix:**
```sql
-- WRONG: Includes employees with no manager
SELECT MANAGER_ID, COUNT(*) AS REPORTS
FROM EMPLOYEE_ASSIGNMENTS
WHERE END_DATE IS NULL
GROUP BY MANAGER_ID

-- RIGHT: Excludes null manager IDs
SELECT MANAGER_ID, COUNT(*) AS REPORTS
FROM EMPLOYEE_ASSIGNMENTS
WHERE END_DATE IS NULL
  AND MANAGER_ID IS NOT NULL
GROUP BY MANAGER_ID
```

---

### Training Data Incomplete
**Symptom:** Training completion rate too high (>95%)

**Cause:** Only including completed enrollments, missing enrolled/overdue

**Fix:**
```sql
-- Ensure denominator includes all statuses
SELECT
  COUNT(CASE WHEN STATUS = 'Completed' THEN 1 END) AS COMPLETED,
  COUNT(*) AS TOTAL,
  ROUND(
    COUNT(CASE WHEN STATUS = 'Completed' THEN 1 END) / COUNT(*) * 100,
    2
  ) AS COMPLETION_RATE
FROM TRAINING_ENROLLMENTS
WHERE ENROLLMENT_DATE >= DATE_TRUNC('year', CURRENT_DATE)
```

---

### Filter Not Working
**Symptom:** Department filter doesn't change dashboard results

**Cause:** Filter logic not applied to all relevant queries

**Fix:**
1. Verify filter value is being passed to SQL query
2. Check WHERE clause includes filter logic:
   ```sql
   AND (
     'All' IN (@DEPARTMENT_FILTER) OR
     DEPARTMENT_ID IN (@DEPARTMENT_FILTER)
   )
   ```
3. Ensure filter is applied at JOIN point, not just in base table

---

## Data Refresh Strategy

### Recommended Refresh Frequency
| Data | Frequency | Timing |
|------|-----------|--------|
| Workforce (Headcount) | Daily | 6 AM |
| Compensation | Monthly | 1st of month |
| Performance Reviews | On-demand | After review cycle close |
| Recruitment | Real-time | Automatic |
| Training | Daily | 6 AM |
| Surveys | Real-time | Automatic |
| Exit Records | Daily | 6 AM |

### Query Performance Tips
1. **Avoid SELECT * on large tables**
   - SURVEY_RESPONSES (6,699 rows) — always filter by date range
   - COMPENSATION_RECORDS (3,434 rows) — always filter by END_DATE IS NULL
   - EMPLOYEE_ASSIGNMENTS (653 rows) — usually OK, but filter for current

2. **Use GROUP BY early**
   - Aggregate before joining to avoid multiplication effects
   - Example: Count headcount per department BEFORE joining to other tables

3. **Filter on indexed columns**
   - EMPLOYEE_STATUS, END_DATE, TERMINATION_DATE are likely indexed
   - Use these in WHERE clauses to improve performance

4. **Test query performance**
   - Use IDA query analyzer to identify slow queries
   - Look for queries taking >5 seconds on typical dataset
   - Optimize with additional WHERE clauses or aggregation

---

## Support & Resources

### Documentation Files
- **DATA_SCHEMA_MAP.md** — Table definitions and relationships
- **METRIC_DEFINITIONS.md** — SQL formulas for all metrics
- **GLOBAL_FILTERS.md** — Filter strategy and data governance
- **RETAILEDGE_THEME.md** — Design and branding
- **QUERY_TEMPLATES.sql** — Starter SQL for all dashboards

### IDA Connector Resources
- Connector ID: `mcp__ida__`
- Query tool: `ida_query()` — Execute SELECT statements
- Estimate tool: `ida_estimate_rows()` — Check row counts before querying
- Knowledge tool: `ida_get_knowledge()` — Explore schema

### Common Tasks

**Build a new metric:**
1. Define in METRIC_DEFINITIONS.md
2. Write SQL formula with example
3. Add to QUERY_TEMPLATES.sql
4. Implement in dashboard
5. Test with sample data

**Add a new dashboard:**
1. Review DATA_SCHEMA_MAP.md for source tables
2. List all metrics to include
3. Copy related queries from QUERY_TEMPLATES.sql
4. Create SQL queries for each metric
5. Design layout and filters
6. Apply RETAILEDGE_THEME styling
7. Document in this guide

**Troubleshoot data issue:**
1. Check GLOBAL_FILTERS.md for known data quality issues
2. Review METRIC_DEFINITIONS.md for correct formula
3. Verify joins match DATA_SCHEMA_MAP.md
4. Test query in IDA with sample filters
5. Compare results to expected values

---

## Version Information

**Kit Version:** 1.0
**Schema Version:** 1.0 (Falcon Corp HR Database)
**Theme:** RetailEdge Bold (Dark Mode)
**IDA Connector:** mcp__ida__
**Created:** 2026-03-28
**Last Updated:** 2026-03-28

---

## Next Steps

1. **Immediate:** Read all 6 documentation files in order
2. **Week 1:** Build the "Workforce Overview" dashboard (simplest, highest ROI)
3. **Week 2-3:** Build "Department Analytics" and "Compensation Analytics"
4. **Week 4+:** Build remaining 6 dashboards iteratively
5. **Ongoing:** Monitor data quality, optimize queries, gather user feedback

Good luck building with Falcon HR Analytics!

