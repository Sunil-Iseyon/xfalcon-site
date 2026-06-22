# Falcon HR Analytics — Dashboard Feasibility Matrix

## Project Summary
- **Company:** Falcon Corp — Technology
- **Employees:** 584 total (516 active + 68 terminated)
- **Locations:** 8 (SF HQ, NYC, Austin, London, Bangalore, Singapore, Remote-US, Remote-EMEA)
- **Departments:** 15 (Engineering-heavy)
- **Data Range:** 2018–2025
- **Calendar:** Calendar Year (Jan–Dec)
- **IDA Connector:** `mcp__ida__`

---

## Dashboard Feasibility Scores

| # | Dashboard | Score | Status | Build Effort |
|---|-----------|-------|--------|-------------|
| 1 | Workforce Overview (Portal) | 95% | READY | 1 day |
| 2 | Headcount & Demographics | 95% | READY | 1 day |
| 3 | Compensation & Pay Equity | 90% | READY | 1.5 days |
| 4 | Performance Management | 85% | READY | 1 day |
| 5 | Attrition & Retention | 95% | READY | 1 day |
| 6 | Recruiting Pipeline | 85% | READY | 1 day |
| 7 | Learning & Development | 90% | READY | 1 day |
| 8 | Employee Engagement | 80% | PARTIAL | 1 day |
| 9 | DEI (Diversity, Equity & Inclusion) | 85% | READY | 1 day |

---

## Detailed Assessment

### 1. Workforce Overview (Portal) — 95% READY
**Primary tables:** EMPLOYEES, EMPLOYEE_ASSIGNMENTS, DEPARTMENTS, LOCATIONS
**What works:** Total headcount, department distribution, location breakdown, hiring trends, employment type split, turnover summary
**Gaps:** No budget/planned headcount for variance analysis
**Sample query:** Headcount by department with YoY growth

### 2. Headcount & Demographics — 95% READY
**Primary tables:** EMPLOYEES, EMPLOYEE_ASSIGNMENTS, DEPARTMENTS, LOCATIONS, JOB_GRADES
**What works:** Gender split (49.4% F / 50.6% M), age distribution, tenure analysis, employment type, location, department drill-down, job grade distribution
**Gaps:** No planned headcount targets
**Sample query:** Demographics by department × gender × grade

### 3. Compensation & Pay Equity — 90% READY
**Primary tables:** COMPENSATION_RECORDS, EMPLOYEES, EMPLOYEE_ASSIGNMENTS, JOB_GRADES, JOB_FAMILIES
**What works:** Base salary distribution, bonus data, compa-ratio (actual vs pay range mid), gender pay gap analysis by grade, compensation change history, pay frequency
**Gaps:** No market benchmark data for external compa-ratio; no equity/stock data
**Sample query:** Average base by department × grade with compa-ratio

### 4. Performance Management — 85% READY
**Primary tables:** PERFORMANCE_REVIEWS, PERFORMANCE_CYCLES, GOALS, EMPLOYEES
**What works:** Rating distribution (Exceeds/Meets/Below), 6 review cycles (2022–2024), goal attainment by type (Company/Individual/Team ~85% avg), reviewer type analysis
**Gaps:** 2024 Annual Review marked "Incomplete"; 2022 Mid-Year has only 10 reviews; no 9-box grid data (would need to derive from performance + potential)
**Sample query:** Rating distribution by cycle with trend

### 5. Attrition & Retention — 95% READY
**Primary tables:** EXIT_RECORDS, EMPLOYEES, EMPLOYEE_ASSIGNMENTS, DEPARTMENTS
**What works:** 113 exits with termination type, primary reason, regrettable flag (44% regrettable), rehire eligibility, exit interview tracking, department-level attrition, yearly trends
**Gaps:** No tenure-at-exit calculated (can derive from hire_date - termination_date)
**Sample query:** Attrition rate by year with regrettable split

### 6. Recruiting Pipeline — 85% READY
**Primary tables:** JOB_REQUISITIONS, APPLICATIONS, CANDIDATES, INTERVIEW_STAGES
**What works:** 50 requisitions, 421 applications, full pipeline (Applied→Screening→Interview→Offer→Hired/Rejected), source channel analysis, time-to-fill, offer amounts, priority levels
**Gaps:** No cost-per-hire data; no recruiter performance metrics beyond assignment
**Sample query:** Pipeline conversion by stage with source channel breakdown

### 7. Learning & Development — 90% READY
**Primary tables:** TRAINING_ENROLLMENTS, TRAINING_PROGRAMS, EMPLOYEES
**What works:** 15 programs, 1,370 enrollments, completion rates, overdue tracking, score distribution, program type/delivery mode analysis
**Gaps:** No training cost data; no skills gap analysis (would need to cross with EMPLOYEE_SKILLS)
**Sample query:** Completion rate by program with avg score

### 8. Employee Engagement — 80% PARTIAL
**Primary tables:** SURVEY_RESPONSES, SURVEY_CAMPAIGNS, EMPLOYEES
**What works:** 9 campaigns (2022–2024), 6 question codes (eNPS, Engagement, Growth, Manager, NPS, Wellbeing), ~6,700 responses, trend over time
**Gaps:** Low response count for some campaigns (2022 Annual has only 3 responses per question); duplicate campaigns (2023/2024 Annual Engagement vs Annual Engagement Survey); Q1 2024 Pulse has anomalously low scores on small sample (7 responses)
**Workaround:** Focus on high-volume campaigns; flag low-response campaigns as unreliable
**Sample query:** Engagement scores by dimension over time

### 9. DEI (Diversity, Equity & Inclusion) — 85% READY
**Primary tables:** EMPLOYEES, EMPLOYEE_ASSIGNMENTS, DEPARTMENTS, JOB_GRADES, COMPENSATION_RECORDS, EXIT_RECORDS
**What works:** 8 ethnicity categories, gender data, nationality, cross-tab with grade/department/location, pay equity by gender×grade, attrition by demographics
**Gaps:** No self-reported disability data; no age-band analysis for ageism metrics (can derive from DOB)
**Sample query:** Representation by ethnicity × department × grade level
