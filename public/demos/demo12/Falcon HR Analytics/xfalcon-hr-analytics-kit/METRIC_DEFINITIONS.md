# Falcon Corp HR Analytics - Metric Definitions

## Overview
Standardized definitions for all key HR metrics used across Falcon Corp dashboards. Each metric includes SQL formula, plain English description, units, directional interpretation, source tables, and dashboard usage.

---

## Headcount & Workforce Metrics

### Total Headcount
**Metric Name:** Total Headcount / FTE Count

**Formula (SQL):**
```sql
SELECT COUNT(DISTINCT EMPLOYEE_ID)
FROM EMPLOYEES
WHERE EMPLOYEE_STATUS IN ('Active', 'On Leave')
```

**Plain English:**
Total number of active employees and those on approved leave, excluding terminated employees.

**Unit:** Count (FTE)

**Direction:** Higher is better (in context of business growth)

**Conditions:**
- Include: EMPLOYEE_STATUS = 'Active' OR EMPLOYEE_STATUS = 'On Leave'
- Exclude: EMPLOYEE_STATUS = 'Terminated'
- Snapshot as of report date

**Source Tables:**
- EMPLOYEES

**Used in Dashboards:**
- Workforce Overview
- Department Analytics
- Org Structure

**Notes:**
- Headcount is point-in-time; use date filters for historical snapshots
- Can be broken down by EMPLOYMENT_TYPE, GENDER, DEPARTMENT, LOCATION

---

### Turnover Rate
**Metric Name:** Annual Turnover Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(DISTINCT E.EMPLOYEE_ID) / AVG_HC) * 100,
    2
  ) AS TURNOVER_RATE_PCT
FROM EXIT_RECORDS E
WHERE E.TERMINATION_DATE >= DATE_TRUNC('year', CURRENT_DATE)
CROSS JOIN (
  SELECT AVG(HC) AS AVG_HC FROM (
    SELECT
      DATE_TRUNC('month', EFFECTIVE_DATE) AS MONTH,
      COUNT(DISTINCT EMPLOYEE_ID) AS HC
    FROM EMPLOYEE_ASSIGNMENTS
    WHERE END_DATE IS NULL
    GROUP BY DATE_TRUNC('month', EFFECTIVE_DATE)
  )
)
```

**Plain English:**
Total number of employees who separated during period divided by average headcount during that period, expressed as percentage.

**Unit:** Percent (%)

**Direction:** Lower is better

**Conditions:**
- Termination date falls within reporting period
- Includes all termination types (Voluntary, Involuntary, Redundancy)
- Use average headcount during period for denominator

**Source Tables:**
- EXIT_RECORDS
- EMPLOYEE_ASSIGNMENTS

**Used in Dashboards:**
- Workforce Overview
- Retention Analytics
- Executive Summary

**Notes:**
- Formula: (Separations / Average Headcount) × 100
- Industry benchmark: 10-15% annual rate
- Can segment by TERMINATION_TYPE, DEPARTMENT, LOCATION, TENURE

---

### Voluntary Turnover Rate
**Metric Name:** Voluntary Turnover Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(DISTINCT E.EMPLOYEE_ID) / AVG_HC) * 100,
    2
  ) AS VOLUNTARY_TURNOVER_PCT
FROM EXIT_RECORDS E
WHERE E.TERMINATION_DATE >= DATE_TRUNC('year', CURRENT_DATE)
  AND E.TERMINATION_TYPE = 'Voluntary'
CROSS JOIN (
  SELECT AVG(HC) AS AVG_HC FROM (
    SELECT
      DATE_TRUNC('month', EFFECTIVE_DATE) AS MONTH,
      COUNT(DISTINCT EMPLOYEE_ID) AS HC
    FROM EMPLOYEE_ASSIGNMENTS
    WHERE END_DATE IS NULL
    GROUP BY DATE_TRUNC('month', EFFECTIVE_DATE)
  )
)
```

**Plain English:**
Percentage of employees who voluntarily left the organization (resignations, retirements) during the period.

**Unit:** Percent (%)

**Direction:** Lower is better

**Conditions:**
- Termination Type = 'Voluntary'
- Termination date in reporting period

**Source Tables:**
- EXIT_RECORDS
- EMPLOYEE_ASSIGNMENTS

**Used in Dashboards:**
- Retention Analytics
- Workforce Overview

**Notes:**
- Subset of total turnover rate
- Indicates employee satisfaction and engagement
- Key indicator for retention strategy effectiveness

---

### Regrettable Attrition Rate
**Metric Name:** Regrettable Attrition Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(DISTINCT E.EMPLOYEE_ID) / AVG_HC) * 100,
    2
  ) AS REGRETTABLE_ATTRITION_PCT
FROM EXIT_RECORDS E
WHERE E.TERMINATION_DATE >= DATE_TRUNC('year', CURRENT_DATE)
  AND E.REGRETTABLE = TRUE
CROSS JOIN (
  SELECT AVG(HC) AS AVG_HC FROM (
    SELECT
      DATE_TRUNC('month', EFFECTIVE_DATE) AS MONTH,
      COUNT(DISTINCT EMPLOYEE_ID) AS HC
    FROM EMPLOYEE_ASSIGNMENTS
    WHERE END_DATE IS NULL
      AND EMPLOYEE_ID NOT IN (
        SELECT EMPLOYEE_ID FROM EXIT_RECORDS
        WHERE TERMINATION_DATE < DATE_TRUNC('month', CURRENT_DATE)
      )
    GROUP BY DATE_TRUNC('month', EFFECTIVE_DATE)
  )
)
```

**Plain English:**
Percentage of departures that were classified as regrettable losses (high performers, critical roles, etc.).

**Unit:** Percent (%)

**Direction:** Lower is better

**Conditions:**
- REGRETTABLE = TRUE
- Termination date in reporting period

**Source Tables:**
- EXIT_RECORDS
- EMPLOYEE_ASSIGNMENTS

**Used in Dashboards:**
- Retention Analytics
- Workforce Risk

**Notes:**
- Subset of voluntary turnover
- Indicates loss of valuable talent
- Used to prioritize retention initiatives

---

## Compensation & Pay Equity

### Compa-Ratio
**Metric Name:** Compa-Ratio (Pay Competitiveness Index)

**Formula (SQL):**
```sql
SELECT
  EMPLOYEE_ID,
  ROUND(
    (ACTUAL_BASE / PAY_RANGE_MID) * 100,
    1
  ) AS COMPA_RATIO
FROM (
  SELECT
    C.EMPLOYEE_ID,
    C.AMOUNT AS ACTUAL_BASE,
    JG.PAY_RANGE_MID
  FROM COMPENSATION_RECORDS C
  JOIN EMPLOYEE_ASSIGNMENTS EA
    ON C.EMPLOYEE_ID = EA.EMPLOYEE_ID
    AND EA.END_DATE IS NULL
  JOIN JOB_GRADES JG
    ON EA.JOB_GRADE_ID = JG.JOB_GRADE_ID
  WHERE C.END_DATE IS NULL
    AND C.COMP_TYPE = 'Base'
)
```

**Plain English:**
Ratio of actual base salary to the pay grade midpoint, expressed as percentage. Index of 100 = at midpoint, >100 = above midpoint.

**Unit:** Percent (%)

**Direction:** 80-120 is typical healthy range

**Conditions:**
- Current compensation only (END_DATE IS NULL, COMP_TYPE = 'Base')
- Current assignment only (END_DATE IS NULL)
- Calculated per employee

**Source Tables:**
- COMPENSATION_RECORDS
- EMPLOYEE_ASSIGNMENTS
- JOB_GRADES

**Used in Dashboards:**
- Compensation Analytics
- Pay Equity Analysis

**Notes:**
- Compa-ratio 100 = at market midpoint (fully competitive)
- <80 indicates undercompensation; >120 indicates overcompensation
- Use to assess market alignment and equity

---

### Gender Pay Gap
**Metric Name:** Gender Pay Gap

**Formula (SQL):**
```sql
SELECT
  JG.GRADE_CODE,
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

**Plain English:**
Percentage difference between average base salary for male vs female employees within same job grade. Negative = females earn less.

**Unit:** Percent (%)

**Direction:** Close to 0 is better (indicates pay equity)

**Conditions:**
- Current compensation only (END_DATE IS NULL, COMP_TYPE = 'Base')
- Current assignment only (END_DATE IS NULL)
- Grouped by JOB_GRADE for like-for-like comparison
- Only M/F genders in comparison

**Source Tables:**
- COMPENSATION_RECORDS
- EMPLOYEES
- EMPLOYEE_ASSIGNMENTS
- JOB_GRADES

**Used in Dashboards:**
- Pay Equity Analysis
- Diversity & Inclusion

**Notes:**
- Formula: ((Avg Male - Avg Female) / Avg Female) × 100
- Negative value = gender pay gap favoring males
- Calculated by job grade to control for role differences
- Regulatory/compliance metric in many jurisdictions

---

### Average Base Salary
**Metric Name:** Average Base Salary

**Formula (SQL):**
```sql
SELECT
  ROUND(AVG(C.AMOUNT), 2) AS AVG_BASE_SALARY
FROM COMPENSATION_RECORDS C
WHERE C.END_DATE IS NULL
  AND C.COMP_TYPE = 'Base'
```

**Plain English:**
Mean base salary across all employees with current compensation records.

**Unit:** Currency (USD, EUR, etc.)

**Direction:** Contextual (trends and benchmarks)

**Conditions:**
- Current compensation only (END_DATE IS NULL, COMP_TYPE = 'Base')
- All employees regardless of employment type

**Source Tables:**
- COMPENSATION_RECORDS

**Used in Dashboards:**
- Compensation Analytics
- Workforce Overview
- Department Analytics

**Notes:**
- Can be segmented by: Department, Location, Job Grade, Employment Type
- Useful for budgeting and market benchmarking
- Trends indicate salary inflation/growth management

---

### Total Compensation Cost
**Metric Name:** Total Compensation Cost / Payroll Spend

**Formula (SQL):**
```sql
SELECT
  SUM(C.AMOUNT) AS TOTAL_COMP_COST,
  COUNT(DISTINCT C.EMPLOYEE_ID) AS EMPLOYEE_COUNT,
  ROUND(SUM(C.AMOUNT) / COUNT(DISTINCT C.EMPLOYEE_ID), 2) AS AVG_TOTAL_COMP
FROM COMPENSATION_RECORDS C
WHERE C.END_DATE IS NULL
```

**Plain English:**
Total annual compensation spend across all active employees (base + bonuses).

**Unit:** Currency (USD, EUR, etc.)

**Direction:** Managed within budget

**Conditions:**
- Current compensation only (END_DATE IS NULL)
- Includes both Base and Bonus compensation types

**Source Tables:**
- COMPENSATION_RECORDS

**Used in Dashboards:**
- Compensation Analytics
- Financial Planning
- Executive Summary

**Notes:**
- Useful for annual budget forecasting
- Can be compared against departmental budgets
- Segment by COMP_TYPE to analyze base vs bonus spend

---

## Performance & Development

### Goal Attainment Rate
**Metric Name:** Goal Attainment Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    AVG(ATTAINMENT_PCT),
    2
  ) AS AVG_GOAL_ATTAINMENT_PCT
FROM GOALS
WHERE CYCLE_ID IN (
  SELECT CYCLE_ID FROM PERFORMANCE_CYCLES
  WHERE END_DATE >= DATE_TRUNC('year', CURRENT_DATE)
)
```

**Plain English:**
Average percentage of goal targets achieved by employees during performance cycle.

**Unit:** Percent (%)

**Direction:** Higher is better (>80% typically target)

**Conditions:**
- Filter by PERFORMANCE_CYCLES in reporting period
- Can aggregate across all employees or by subgroup

**Source Tables:**
- GOALS
- PERFORMANCE_CYCLES

**Used in Dashboards:**
- Performance Management
- Workforce Development

**Notes:**
- Can be segmented by: Goal Type, Employee, Department, Manager
- Attainment <70% may indicate unrealistic targets
- Attainment >110% may indicate underambitious targets

---

### Average Performance Rating
**Metric Name:** Average Performance Rating / Mean Rating Score

**Formula (SQL):**
```sql
SELECT
  ROUND(AVG(OVERALL_RATING), 2) AS AVG_PERFORMANCE_RATING
FROM PERFORMANCE_REVIEWS
WHERE CYCLE_ID IN (
  SELECT CYCLE_ID FROM PERFORMANCE_CYCLES
  WHERE END_DATE >= DATE_TRUNC('year', CURRENT_DATE)
)
  AND IS_FINAL_CALIBRATED = TRUE
```

**Plain English:**
Mean performance rating across all employees in current performance cycle, using final calibrated ratings.

**Unit:** Numeric (scale typically 1-5)

**Direction:** Higher is better

**Conditions:**
- Use IS_FINAL_CALIBRATED = TRUE for final ratings only
- Filter by current PERFORMANCE_CYCLES
- Exclude draft/interim reviews

**Source Tables:**
- PERFORMANCE_REVIEWS
- PERFORMANCE_CYCLES

**Used in Dashboards:**
- Performance Management
- Executive Summary
- Succession Planning

**Notes:**
- Distribution analysis (% Exceeds/Meets/Below) more useful than mean
- Track trends over cycles to identify performance inflation/deflation
- Can segment by Department, Manager, Job Grade

---

### Training Completion Rate
**Metric Name:** Training Completion Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(CASE WHEN STATUS = 'Completed' THEN 1 END) /
     COUNT(*)) * 100,
    2
  ) AS COMPLETION_RATE_PCT
FROM TRAINING_ENROLLMENTS
WHERE ENROLLMENT_DATE >= DATE_TRUNC('year', CURRENT_DATE)
```

**Plain English:**
Percentage of training enrollments successfully completed during reporting period.

**Unit:** Percent (%)

**Direction:** Higher is better (>85% typical target)

**Conditions:**
- Status = 'Completed' in numerator
- All enrollments in reporting period in denominator
- Can filter by PROGRAM_TYPE or DELIVERY_MODE

**Source Tables:**
- TRAINING_ENROLLMENTS

**Used in Dashboards:**
- Learning & Development
- Compliance Tracking

**Notes:**
- Distinguish between completed vs dropped vs overdue
- Can analyze by program type, delivery mode, or department
- Track trends to identify engagement issues
- Low completion may indicate scheduling conflicts or relevance issues

---

## Recruitment Metrics

### Time to Fill
**Metric Name:** Time to Fill / Days to Hire

**Formula (SQL):**
```sql
SELECT
  ROUND(
    AVG(JULIANDAY(CLOSE_DATE) - JULIANDAY(OPEN_DATE)),
    1
  ) AS AVG_DAYS_TO_FILL
FROM JOB_REQUISITIONS
WHERE REQUISITION_STATUS IN ('Filled', 'Closed')
  AND CLOSE_DATE >= DATE_TRUNC('quarter', CURRENT_DATE)
```

**Plain English:**
Average number of days between requisition open date and close date (hire or cancellation).

**Unit:** Days

**Direction:** Lower is better (target: 30-45 days)

**Conditions:**
- Only filled or closed requisitions
- Reporting period filters in CLOSE_DATE
- Excludes open requisitions

**Source Tables:**
- JOB_REQUISITIONS

**Used in Dashboards:**
- Recruitment Analytics
- Hiring Funnel

**Notes:**
- Formula: (Close Date - Open Date) in days
- Industry benchmark: 30-60 days depending on role level
- Can segment by Department, Priority Level, or Position

---

### Offer Acceptance Rate
**Metric Name:** Offer Acceptance Rate

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(CASE WHEN OFFER_ACCEPTED = TRUE THEN 1 END) /
     COUNT(CASE WHEN OFFER_DATE IS NOT NULL THEN 1 END)) * 100,
    2
  ) AS OFFER_ACCEPTANCE_RATE_PCT
FROM APPLICATIONS
WHERE OFFER_DATE >= DATE_TRUNC('quarter', CURRENT_DATE)
```

**Plain English:**
Percentage of candidates who accepted job offers out of total offers extended.

**Unit:** Percent (%)

**Direction:** Higher is better (typical: 70-90%)

**Conditions:**
- OFFER_DATE IS NOT NULL (offer was extended)
- OFFER_ACCEPTED = TRUE in numerator
- Reporting period filtered by OFFER_DATE

**Source Tables:**
- APPLICATIONS

**Used in Dashboards:**
- Recruitment Analytics
- Hiring Funnel

**Notes:**
- Low acceptance rate (<70%) indicates offer competitiveness issues (salary, role, etc.)
- Can segment by requisition, department, or candidate source
- Track trends to identify market dynamics

---

### Applicants per Requisition
**Metric Name:** Applicants per Requisition / Application Volume

**Formula (SQL):**
```sql
SELECT
  JR.REQUISITION_ID,
  JR.POSITION_ID,
  COUNT(A.APPLICATION_ID) AS APPLICATION_COUNT,
  ROUND(
    COUNT(A.APPLICATION_ID) / 1.0,
    1
  ) AS APPLICANTS_PER_REQ
FROM JOB_REQUISITIONS JR
LEFT JOIN APPLICATIONS A ON JR.REQUISITION_ID = A.REQUISITION_ID
WHERE JR.OPEN_DATE >= DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY JR.REQUISITION_ID, JR.POSITION_ID
```

**Plain English:**
Average number of applications received per job requisition.

**Unit:** Count (applicants)

**Direction:** Higher is better (more selection pool)

**Conditions:**
- Requisitions opened in reporting period
- All applications regardless of stage
- Can aggregate across all or specific requisitions

**Source Tables:**
- JOB_REQUISITIONS
- APPLICATIONS

**Used in Dashboards:**
- Recruitment Analytics
- Hiring Funnel

**Notes:**
- Volume varies significantly by role level, location, and market conditions
- Low volume (<5) may indicate job posting visibility issues
- High volume (>100) may indicate lack of screening criteria

---

## Engagement & Culture

### eNPS (Employee Net Promoter Score)
**Metric Name:** eNPS (Employee Net Promoter Score)

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(CASE WHEN SR.RESPONSE_SCORE >= 9 THEN 1 END) -
     COUNT(CASE WHEN SR.RESPONSE_SCORE <= 6 THEN 1 END)) /
    COUNT(*) * 100,
    1
  ) AS eNPS_SCORE
FROM SURVEY_RESPONSES SR
JOIN SURVEY_CAMPAIGNS SC ON SR.CAMPAIGN_ID = SC.CAMPAIGN_ID
WHERE SC.SURVEY_TYPE = 'eNPS'
  AND SR.QUESTION_CODE = 'eNPS'
  AND SR.SUBMITTED_AT >= DATE_TRUNC('quarter', CURRENT_DATE)
```

**Plain English:**
Percentage of promoters (score 9-10) minus percentage of detractors (score 0-6). Range: -100 to +100.

**Unit:** Score (-100 to +100)

**Direction:** Higher is better (>0 is positive)

**Conditions:**
- SURVEY_CAMPAIGNS.SURVEY_TYPE = 'eNPS'
- QUESTION_CODE = 'eNPS'
- Response score 0-10 scale
- Reporting period filtered by SUBMITTED_AT

**Source Tables:**
- SURVEY_RESPONSES
- SURVEY_CAMPAIGNS

**Used in Dashboards:**
- Employee Engagement
- Culture & Climate

**Notes:**
- Formula: ((Promoters - Detractors) / Total Responses) × 100
- Benchmark by industry: typically -20 to +30
- Passives (7-8) excluded from calculation
- Can segment by Department, Location, Manager

---

### Engagement Score
**Metric Name:** Engagement Score / Employee Engagement Index

**Formula (SQL):**
```sql
SELECT
  ROUND(
    AVG(SR.RESPONSE_SCORE),
    1
  ) AS ENGAGEMENT_SCORE
FROM SURVEY_RESPONSES SR
JOIN SURVEY_CAMPAIGNS SC ON SR.CAMPAIGN_ID = SC.CAMPAIGN_ID
WHERE SC.SURVEY_TYPE IN ('Engagement', 'Pulse')
  AND SR.QUESTION_CODE = 'Q_ENGAGE'
  AND SR.SUBMITTED_AT >= DATE_TRUNC('quarter', CURRENT_DATE)
```

**Plain English:**
Mean score for engagement-specific survey question across respondents.

**Unit:** Numeric (0-10 scale)

**Direction:** Higher is better (target: 7+)

**Conditions:**
- Survey type = Engagement or Pulse
- Question code = Q_ENGAGE
- Reporting period filtered by SUBMITTED_AT

**Source Tables:**
- SURVEY_RESPONSES
- SURVEY_CAMPAIGNS

**Used in Dashboards:**
- Employee Engagement
- Workforce Overview

**Notes:**
- Can be combined with other survey questions (Q_GROWTH, Q_MANAGER, Q_WELLBEING) for composite index
- Track trends to identify engagement drivers and issues
- Segment by department, tenure, or demographic for targeted insights

---

## Retention & Career Development

### New Hire Retention Rate
**Metric Name:** New Hire Retention Rate (Year 1)

**Formula (SQL):**
```sql
SELECT
  ROUND(
    (COUNT(DISTINCT CASE
      WHEN E.EMPLOYEE_STATUS IN ('Active', 'On Leave')
      THEN E.EMPLOYEE_ID
    END) /
     COUNT(DISTINCT E.EMPLOYEE_ID)) * 100,
    2
  ) AS NEW_HIRE_RETENTION_RATE_PCT
FROM EMPLOYEES E
WHERE YEAR(E.HIRE_DATE) = YEAR(CURRENT_DATE) - 1
  AND DATEDIFF(YEAR, E.HIRE_DATE, CURRENT_DATE) = 1
```

**Plain English:**
Percentage of employees hired in previous year who are still active.

**Unit:** Percent (%)

**Direction:** Higher is better (target: >85%)

**Conditions:**
- HIRE_DATE in previous year
- Current status = Active or On Leave (not terminated)
- 12-month lookback window

**Source Tables:**
- EMPLOYEES
- EXIT_RECORDS

**Used in Dashboards:**
- Retention Analytics
- Hiring Effectiveness

**Notes:**
- Directly measures hiring quality and onboarding effectiveness
- Low retention (<75%) indicates issues with recruitment, onboarding, or role fit
- Can analyze by hiring manager, department, or hiring channel

---

## Organizational Health

### Span of Control
**Metric Name:** Span of Control / Manager Ratio

**Formula (SQL):**
```sql
SELECT
  MANAGER_ID,
  COUNT(DISTINCT EMPLOYEE_ID) AS DIRECT_REPORTS,
  ROUND(
    COUNT(DISTINCT EMPLOYEE_ID) / 1.0,
    1
  ) AS SPAN_OF_CONTROL
FROM EMPLOYEE_ASSIGNMENTS
WHERE END_DATE IS NULL
  AND MANAGER_ID IS NOT NULL
GROUP BY MANAGER_ID
```

**Plain English:**
Number of direct reports per manager (only current, active assignments).

**Unit:** Count (direct reports)

**Direction:** 3-8 is typical healthy range (varies by role type)

**Conditions:**
- Current assignments only (END_DATE IS NULL)
- MANAGER_ID IS NOT NULL (exclude non-reporting roles)
- Calculated per manager

**Source Tables:**
- EMPLOYEE_ASSIGNMENTS

**Used in Dashboards:**
- Org Structure
- Management Effectiveness
- Succession Planning

**Notes:**
- Wide spans (>10) may indicate insufficient management support
- Narrow spans (<2) may indicate overinvestment in management
- Can vary legitimately by role type (individual contributor vs strategic)

---

### Diversity Index
**Metric Name:** Diversity Index (Simpson's Diversity Index)

**Formula (SQL):**
```sql
SELECT
  ROUND(
    1 - SUM(POWER(PROPORTION, 2)),
    3
  ) AS DIVERSITY_INDEX
FROM (
  SELECT
    ETHNICITY,
    COUNT(*) / SUM(COUNT(*)) OVER() AS PROPORTION
  FROM EMPLOYEES
  WHERE EMPLOYEE_STATUS IN ('Active', 'On Leave')
  GROUP BY ETHNICITY
)
```

**Plain English:**
Measure of ethnic diversity using Simpson's index (0 = no diversity, 1 = maximum diversity). Also calculated by gender, generation, etc.

**Unit:** Index (0.0 to 1.0)

**Direction:** Higher is better (indicates diversity)

**Conditions:**
- Current employees only (EMPLOYEE_STATUS IN ('Active', 'On Leave'))
- Grouped by demographic category (ETHNICITY, GENDER, etc.)
- Handles multiple demographic dimensions

**Source Tables:**
- EMPLOYEES

**Used in Dashboards:**
- Diversity & Inclusion
- Workforce Overview

**Notes:**
- Formula: 1 - Σ(proportion²) for each category
- 0.0 = all employees in one category
- 1.0 = all employees evenly distributed across categories
- Can calculate separately for gender, ethnicity, generation, other demographics
- Compliance metric in many jurisdictions

---

## Summary Table

| Metric | Unit | Direction | Source Tables | Dashboards |
|--------|------|-----------|----------------|-----------|
| Total Headcount | Count | Contextual | EMPLOYEES | Workforce Overview, Department Analytics |
| Turnover Rate | % | Lower is better | EXIT_RECORDS, EMPLOYEE_ASSIGNMENTS | Workforce Overview, Retention Analytics |
| Voluntary Turnover | % | Lower is better | EXIT_RECORDS, EMPLOYEE_ASSIGNMENTS | Retention Analytics |
| Regrettable Attrition | % | Lower is better | EXIT_RECORDS, EMPLOYEE_ASSIGNMENTS | Retention Analytics, Workforce Risk |
| Compa-Ratio | % | 80-120 range | COMPENSATION_RECORDS, JOB_GRADES, EMPLOYEE_ASSIGNMENTS | Compensation Analytics, Pay Equity |
| Gender Pay Gap | % | Close to 0 | COMPENSATION_RECORDS, EMPLOYEES, JOB_GRADES | Pay Equity Analysis, D&I |
| Avg Base Salary | Currency | Contextual | COMPENSATION_RECORDS | Compensation Analytics, Workforce Overview |
| Total Comp Cost | Currency | Within budget | COMPENSATION_RECORDS | Compensation Analytics, Financial Planning |
| Goal Attainment | % | Higher is better | GOALS, PERFORMANCE_CYCLES | Performance Management |
| Avg Performance Rating | Numeric | Higher is better | PERFORMANCE_REVIEWS, PERFORMANCE_CYCLES | Performance Management, Succession Planning |
| Training Completion | % | Higher is better | TRAINING_ENROLLMENTS | Learning & Development |
| Time to Fill | Days | Lower is better | JOB_REQUISITIONS | Recruitment Analytics |
| Offer Acceptance | % | Higher is better | APPLICATIONS | Recruitment Analytics, Hiring Funnel |
| Applicants per Req | Count | Higher is better | JOB_REQUISITIONS, APPLICATIONS | Recruitment Analytics |
| eNPS | Score (-100 to +100) | Higher is better | SURVEY_RESPONSES, SURVEY_CAMPAIGNS | Employee Engagement, Culture & Climate |
| Engagement Score | Numeric (0-10) | Higher is better | SURVEY_RESPONSES, SURVEY_CAMPAIGNS | Employee Engagement, Workforce Overview |
| New Hire Retention | % | Higher is better | EMPLOYEES | Retention Analytics, Hiring Effectiveness |
| Span of Control | Count | 3-8 typical | EMPLOYEE_ASSIGNMENTS | Org Structure, Management Effectiveness |
| Diversity Index | Index (0-1) | Higher is better | EMPLOYEES | Diversity & Inclusion, Workforce Overview |

