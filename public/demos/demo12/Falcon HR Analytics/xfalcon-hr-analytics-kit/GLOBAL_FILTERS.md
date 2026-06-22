# Falcon Corp HR Analytics - Global Filters & Data Governance

## Overview
This document defines standardized filtering logic, data quality rules, and user-selectable filters applied globally across all Falcon HR Analytics dashboards to ensure consistency and accuracy.

---

## Global Filter Architecture

### Interactive User-Selectable Filters
These filters are available to dashboard users and persist across multiple dashboards:

#### 1. Department Filter
**Field:** `DEPARTMENT_ID` from DEPARTMENTS table

**Default:** All active departments

**User Options:**
- Multi-select dropdown
- All Departments (default)
- Individual department selection
- Filter only applies when user explicitly selects

**SQL Implementation:**
```sql
WHERE 1=1
  AND (
    'All' IN (@DEPARTMENT_FILTER) OR
    DEPARTMENT_ID IN (@DEPARTMENT_FILTER)
  )
```

**Affected Tables:**
- EMPLOYEE_ASSIGNMENTS → DEPARTMENTS
- JOB_REQUISITIONS → DEPARTMENTS
- POSITIONS → DEPARTMENTS

**Dashboard Usage:**
- Workforce Overview (primary)
- Department Analytics (primary)
- Compensation Analytics
- Performance Management
- Recruitment Analytics
- All dashboards with organizational breakdowns

---

#### 2. Location Filter
**Field:** `LOCATION_ID` from LOCATIONS table

**Default:** All active locations

**User Options:**
- Multi-select dropdown
- All Locations (default)
- Individual location selection
- Filter by REGION for regional rollup

**SQL Implementation:**
```sql
WHERE 1=1
  AND (
    'All' IN (@LOCATION_FILTER) OR
    LOCATION_ID IN (@LOCATION_FILTER)
  )
```

**Affected Tables:**
- EMPLOYEE_ASSIGNMENTS → LOCATIONS
- POSITIONS → LOCATIONS

**Dashboard Usage:**
- Workforce Overview (secondary)
- Department Analytics
- Compensation Analytics
- Diversity & Inclusion
- Geographic analysis

**Note:** Can be combined with Department filter for cross-functional analysis

---

#### 3. Time Period Filter
**Field:** Date range selection across multiple date fields depending on metric

**Default:** Current fiscal year or trailing 12 months

**User Options:**
- Calendar date range picker
- Preset options: YTD, Last Quarter, Last 12 Months, Custom Range
- Default: Trailing 12 months from current date

**SQL Implementation Examples:**

For terminations/exits (TERMINATION_DATE):
```sql
WHERE TERMINATION_DATE >= @START_DATE
  AND TERMINATION_DATE <= @END_DATE
```

For hire dates (HIRE_DATE):
```sql
WHERE HIRE_DATE >= @START_DATE
  AND HIRE_DATE <= @END_DATE
```

For survey responses (SUBMITTED_AT):
```sql
WHERE SUBMITTED_AT >= @START_DATE
  AND SUBMITTED_AT <= @END_DATE
```

For training enrollments (ENROLLMENT_DATE):
```sql
WHERE ENROLLMENT_DATE >= @START_DATE
  AND ENROLLMENT_DATE <= @END_DATE
```

**Date Field Mapping by Metric:**
| Metric | Date Field | Table |
|--------|-----------|-------|
| Turnover Rate | TERMINATION_DATE | EXIT_RECORDS |
| New Hires | HIRE_DATE | EMPLOYEES |
| Promotions | EFFECTIVE_DATE | EMPLOYEE_ASSIGNMENTS |
| Salary Changes | EFFECTIVE_DATE | COMPENSATION_RECORDS |
| Performance Reviews | SUBMISSION_DATE | PERFORMANCE_REVIEWS |
| Goals | N/A (filtered by CYCLE_ID) | GOALS |
| Training Completion | COMPLETION_DATE | TRAINING_ENROLLMENTS |
| Surveys | SUBMITTED_AT | SURVEY_RESPONSES |
| Leave Requests | START_DATE | LEAVE_REQUESTS |
| Applications | APPLIED_DATE | APPLICATIONS |

**Dashboard Usage:**
- All dashboards
- Primary filter for time-series and trend analysis

---

## Hardcoded Data Filters (Applied Automatically)

### Current Employee Status
**Requirement:** Show only active/current employees for headcount and related metrics

**SQL Logic:**
```sql
WHERE EMPLOYEE_STATUS IN ('Active', 'On Leave')
```

**Applied To:**
- Total Headcount calculations
- Compensation analysis (current salary)
- Performance reviews (current cycle)
- Organizational charts
- Department analytics
- Survey responses (active employees only)

**Exception:** EXIT_RECORDS and historical analysis explicitly include terminated employees

---

### Current Assignment Filter
**Requirement:** For organizational context, use current (active) assignments only

**SQL Logic:**
```sql
WHERE END_DATE IS NULL
```

**Applied To:**
- EMPLOYEE_ASSIGNMENTS joins
- Current department/location/manager lookups
- Current role and grade analysis
- Span of control calculations
- Reporting line hierarchy

**Exception:** Historical analysis uses date-based assignment snapshots (e.g., assignment effective on specific date)

---

### Current Compensation Filter
**Requirement:** Use most recent salary data only

**SQL Logic:**
```sql
WHERE END_DATE IS NULL
  AND COMP_TYPE = 'Base'
```

**Applied To:**
- Average salary calculations
- Compa-ratio analysis
- Gender pay gap
- Total compensation analysis
- Compensation trends

**Notes:**
- `END_DATE IS NULL` ensures current record
- `COMP_TYPE = 'Base'` excludes bonuses for salary metrics (use separate filter for total comp)
- For total compensation, remove COMP_TYPE filter to include both Base and Bonus

---

### Active Department/Location Filter
**Requirement:** Exclude inactive departments and locations from analysis

**SQL Logic:**
```sql
WHERE DEPARTMENTS.IS_ACTIVE = TRUE
WHERE LOCATIONS.IS_ACTIVE = TRUE (implicit - no flag, but assumed active)
```

**Applied To:**
- Department-level analysis
- Location-level analysis
- Cost center allocation
- Organizational hierarchy

---

### Performance Cycle Filter
**Requirement:** Filter by active or completed performance cycles

**SQL Logic:**
```sql
WHERE PERFORMANCE_CYCLES.END_DATE >= DATEADD(YEAR, -2, CURRENT_DATE)
```

**Applied To:**
- Performance reviews
- Goals and attainment
- Rating distributions
- Performance analytics

**Notes:**
- Includes last 2 fiscal years of review cycles
- User can further filter by specific CYCLE_ID via Time Period filter

---

## Empty Tables (Do Not Use)

### ATTENDANCE_RECORDS (0 rows)
**Status:** Empty - under future implementation

**Reason:** Not yet rolled out; no data currently available

**Action:** Do not include in any queries or dashboards

**Note:** Reserved for future attendance tracking implementation; skip entirely for now

---

## Known Data Quality Issues & Caveats

### Survey Campaign Duplicates (2023-2024)
**Issue:** Multiple campaigns exist for the same survey period in 2023 and 2024

**Details:**
- 2023: Duplicate eNPS campaigns (ID: 2, 3)
- 2024: Duplicate engagement campaigns (ID: 5, 6)

**Mitigation:**
- When analyzing survey data, explicitly filter to most recent campaign per type and date
- OR deduplicate using: `WHERE CAMPAIGN_ID IN (SELECT MAX(CAMPAIGN_ID) FROM SURVEY_CAMPAIGNS GROUP BY CAMPAIGN_NAME, MONTH(LAUNCH_DATE))`
- Contact Data team for clarification on which campaign is "official"

**SQL Example:**
```sql
SELECT * FROM SURVEY_RESPONSES SR
WHERE SR.CAMPAIGN_ID IN (
  SELECT CAMPAIGN_ID FROM SURVEY_CAMPAIGNS
  WHERE (CAMPAIGN_NAME, LAUNCH_DATE) IN (
    SELECT CAMPAIGN_NAME, MAX(LAUNCH_DATE)
    FROM SURVEY_CAMPAIGNS
    WHERE SURVEY_TYPE = 'eNPS'
    GROUP BY CAMPAIGN_NAME
  )
)
```

---

### Nullable Fields to Handle

| Field | Table | Notes |
|-------|-------|-------|
| TERMINATION_DATE | EMPLOYEES | NULL for active employees |
| END_DATE | EMPLOYEE_ASSIGNMENTS | NULL for current assignments |
| END_DATE | COMPENSATION_RECORDS | NULL for current records |
| MANAGER_ID | EMPLOYEE_ASSIGNMENTS | NULL for non-reporting roles (CEO, etc.) |
| PARENT_DEPARTMENT_ID | DEPARTMENTS | NULL for top-level departments |
| COMPLETION_DATE | TRAINING_ENROLLMENTS | NULL for incomplete enrollments |
| OFFER_ACCEPTED | APPLICATIONS | NULL if no offer made |
| REJECTION_REASON | APPLICATIONS | NULL if candidate not rejected |
| ELIGIBLE_FOR_REHIRE | EXIT_RECORDS | NULL if not explicitly marked |

**Standard SQL Handling:**
```sql
-- Exclude nulls (for counting non-null values)
WHERE FIELD_NAME IS NOT NULL

-- Include nulls (e.g., current assignments)
WHERE FIELD_NAME IS NULL

-- Coalesce for display
SELECT COALESCE(MANAGER_ID, 'Unassigned') AS MANAGER
```

---

## Filter Combinations & Edge Cases

### Scenario: "Current Headcount by Department"
**Filters Applied:**
1. EMPLOYEE_STATUS IN ('Active', 'On Leave')
2. EMPLOYEE_ASSIGNMENTS.END_DATE IS NULL
3. DEPARTMENTS.IS_ACTIVE = TRUE
4. Department filter (user-selectable)

**SQL:**
```sql
SELECT
  D.DEPARTMENT_NAME,
  COUNT(DISTINCT E.EMPLOYEE_ID) AS HEADCOUNT
FROM EMPLOYEES E
JOIN EMPLOYEE_ASSIGNMENTS EA
  ON E.EMPLOYEE_ID = EA.EMPLOYEE_ID
  AND EA.END_DATE IS NULL
JOIN DEPARTMENTS D
  ON EA.DEPARTMENT_ID = D.DEPARTMENT_ID
  AND D.IS_ACTIVE = TRUE
WHERE E.EMPLOYEE_STATUS IN ('Active', 'On Leave')
  AND ('All' IN (@DEPARTMENT_FILTER) OR D.DEPARTMENT_ID IN (@DEPARTMENT_FILTER))
GROUP BY D.DEPARTMENT_NAME
```

---

### Scenario: "Turnover Rate (Voluntary, Last 12 Months)"
**Filters Applied:**
1. TERMINATION_DATE within user-selected time range
2. TERMINATION_TYPE = 'Voluntary'
3. Average headcount calculation (no explicit filter, aggregate across period)

**SQL:**
```sql
WITH SEPARATIONS AS (
  SELECT COUNT(DISTINCT EMPLOYEE_ID) AS SEP_COUNT
  FROM EXIT_RECORDS
  WHERE TERMINATION_DATE >= @START_DATE
    AND TERMINATION_DATE <= @END_DATE
    AND TERMINATION_TYPE = 'Voluntary'
),
AVG_HC AS (
  SELECT AVG(HC) AS AVG_HEADCOUNT FROM (
    SELECT
      DATE_TRUNC('month', EFFECTIVE_DATE) AS MONTH,
      COUNT(DISTINCT EMPLOYEE_ID) AS HC
    FROM EMPLOYEE_ASSIGNMENTS
    WHERE END_DATE IS NULL
    GROUP BY DATE_TRUNC('month', EFFECTIVE_DATE)
  )
)
SELECT
  ROUND((SEP_COUNT / AVG_HEADCOUNT) * 100, 2) AS TURNOVER_RATE_PCT
FROM SEPARATIONS, AVG_HC
```

---

### Scenario: "Gender Pay Gap by Job Grade"
**Filters Applied:**
1. COMP_TYPE = 'Base'
2. COMPENSATION_RECORDS.END_DATE IS NULL
3. EMPLOYEE_ASSIGNMENTS.END_DATE IS NULL
4. GENDER IN ('M', 'F')
5. Group by JOB_GRADE

**SQL:**
```sql
SELECT
  JG.GRADE_CODE,
  ROUND(AVG(CASE WHEN E.GENDER = 'M' THEN C.AMOUNT END), 2) AS AVG_MALE,
  ROUND(AVG(CASE WHEN E.GENDER = 'F' THEN C.AMOUNT END), 2) AS AVG_FEMALE,
  ROUND(
    ((AVG(CASE WHEN E.GENDER = 'M' THEN C.AMOUNT END) -
      AVG(CASE WHEN E.GENDER = 'F' THEN C.AMOUNT END)) /
     AVG(CASE WHEN E.GENDER = 'F' THEN C.AMOUNT END)) * 100,
    2
  ) AS PAY_GAP_PCT
FROM COMPENSATION_RECORDS C
JOIN EMPLOYEES E ON C.EMPLOYEE_ID = E.EMPLOYEE_ID
JOIN EMPLOYEE_ASSIGNMENTS EA
  ON C.EMPLOYEE_ID = EA.EMPLOYEE_ID AND EA.END_DATE IS NULL
JOIN JOB_GRADES JG ON EA.JOB_GRADE_ID = JG.JOB_GRADE_ID
WHERE C.END_DATE IS NULL
  AND C.COMP_TYPE = 'Base'
  AND E.GENDER IN ('M', 'F')
GROUP BY JG.GRADE_CODE
```

---

## Filter Best Practices

### 1. Always Apply Current Assignment Filter for Organizational Context
When joining EMPLOYEE_ASSIGNMENTS to get current department/location/manager, always include:
```sql
AND EA.END_DATE IS NULL
```

### 2. Distinguish Between Point-in-Time and Period Filters
- **Point-in-time:** Use `END_DATE IS NULL` (e.g., current salary, current headcount as of today)
- **Period-based:** Use date range filters (e.g., turnover in last 12 months)

### 3. Handle Null Manager IDs for Span of Control
Exclude C-suite/non-reporting roles:
```sql
WHERE MANAGER_ID IS NOT NULL
```

### 4. Use Explicit Status Checks
Instead of assuming status values, explicitly check:
```sql
WHERE EMPLOYEE_STATUS IN ('Active', 'On Leave')
```

### 5. Aggregate Before Joining
For large datasets, aggregate early to avoid inflated counts:
```sql
-- GOOD: Aggregate first
SELECT E.DEPARTMENT_ID, COUNT(DISTINCT E.EMPLOYEE_ID) AS HC
FROM EMPLOYEES E
WHERE E.EMPLOYEE_STATUS IN ('Active', 'On Leave')
GROUP BY E.DEPARTMENT_ID

-- AVOID: Join before aggregate (causes duplicates)
SELECT D.DEPARTMENT_ID, COUNT(DISTINCT E.EMPLOYEE_ID) AS HC
FROM EMPLOYEES E
JOIN EMPLOYEE_ASSIGNMENTS EA ON E.EMPLOYEE_ID = EA.EMPLOYEE_ID
JOIN DEPARTMENTS D ON EA.DEPARTMENT_ID = D.DEPARTMENT_ID
WHERE EA.END_DATE IS NULL
GROUP BY D.DEPARTMENT_ID
```

---

## No Hardcoded Exclusions
**User Decision:** No hardcoded exclusions based on employee attributes, departments, or locations.

**Reason:** Allows flexibility for different analysis scenarios and user needs.

**Implication:** All data is available by default; users apply filters based on their specific needs.

**Exception:** ATTENDANCE_RECORDS is excluded because the table is empty and unpopulated.

---

## Testing & Validation

### Filter Validation Checklist
- [ ] Verify user-selected filter values are non-null before applying
- [ ] Test department filter with multi-select (empty, single, multiple)
- [ ] Test location filter with region rollup
- [ ] Verify time period defaults to trailing 12 months
- [ ] Confirm headcount queries exclude terminated employees
- [ ] Verify compensation queries use current records only
- [ ] Check that empty ATTENDANCE_RECORDS are skipped
- [ ] Validate survey duplicates handling in engagement dashboard
- [ ] Test Span of Control with null MANAGER_ID handling

