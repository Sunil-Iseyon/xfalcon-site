# Falcon Corp HR Analytics Database Schema Map

## Overview
Complete data schema for Falcon Corp HR Analytics platform with 28 tables supporting workforce management, recruitment, performance, compensation, and employee development tracking.

---

## Core Tables

### EMPLOYEES (584 rows)
**Primary employee master data**
- `EMPLOYEE_ID` (PK): Unique employee identifier
- `EMPLOYEE_CODE`: Human-readable employee code
- `FIRST_NAME`: Employee first name
- `LAST_NAME`: Employee last name
- `DATE_OF_BIRTH`: Birth date for age calculations
- `GENDER`: Gender (M/F/Other)
- `NATIONALITY`: Country of citizenship
- `ETHNICITY`: Ethnic background for diversity tracking
- `HIRE_DATE`: Original hire date
- `TERMINATION_DATE`: Exit date if applicable
- `EMPLOYEE_STATUS`: Active / On Leave / Terminated
- `EMPLOYMENT_TYPE`: Full-time / Part-time / Contract

**Key Notes:**
- For current employee queries, filter `EMPLOYEE_STATUS = 'Active'` or `IN ('Active', 'On Leave')`
- Historical data retained even after termination

---

## Organizational Structure

### DEPARTMENTS (15 rows)
**Department hierarchy and cost allocation**
- `DEPARTMENT_ID` (PK): Unique department identifier
- `DEPARTMENT_NAME`: Department name
- `DEPARTMENT_CODE`: Department code
- `PARENT_DEPARTMENT_ID` (FK): Parent department for hierarchies
- `COST_CENTER_ID` (FK): Links to COST_CENTERS
- `IS_ACTIVE`: Boolean flag

### LOCATIONS (8 rows)
**Physical work locations**
- `LOCATION_ID` (PK): Unique location identifier
- `LOCATION_NAME`: Location name
- `CITY`: City name
- `STATE_PROVINCE`: State or province
- `COUNTRY`: Country
- `REGION`: Geographic region
- `TIMEZONE`: Timezone for reporting

### COST_CENTERS (8 rows)
**Budget and cost allocation**
- `COST_CENTER_ID` (PK): Unique cost center identifier
- `COST_CENTER_CODE`: Cost center code
- `COST_CENTER_NAME`: Cost center name
- `BUDGET_OWNER`: Manager responsible for budget

### JOB_FAMILIES (10 rows)
**Job classification hierarchy level 1**
- `JOB_FAMILY_ID` (PK): Unique job family identifier
- `JOB_FAMILY_NAME`: Job family name (e.g., "Engineering", "Sales", "Operations")
- `JOB_FAMILY_CODE`: Job family code

### JOB_GRADES (24 rows)
**Job classification hierarchy level 2 (pay scales)**
- `JOB_GRADE_ID` (PK): Unique job grade identifier
- `GRADE_CODE`: Grade code (e.g., "L1", "L2", "M1")
- `GRADE_NAME`: Grade name
- `JOB_FAMILY_ID` (FK): Links to JOB_FAMILIES
- `PAY_RANGE_MIN`: Salary floor
- `PAY_RANGE_MID`: Salary midpoint (benchmark)
- `PAY_RANGE_MAX`: Salary ceiling
- `IS_MANAGEMENT_TRACK`: Boolean for management trajectory

### POSITIONS (41 rows)
**Authorized positions in organization**
- `POSITION_ID` (PK): Unique position identifier
- `POSITION_TITLE`: Position title
- `JOB_GRADE_ID` (FK): Links to JOB_GRADES
- `DEPARTMENT_ID` (FK): Links to DEPARTMENTS
- `LOCATION_ID` (FK): Links to LOCATIONS
- `IS_OPEN`: Boolean indicating if position is available
- `MAX_HEADCOUNT`: Authorized headcount for position

---

## Assignment & History

### EMPLOYEE_ASSIGNMENTS (653 rows)
**Current and historical role assignments**
- `ASSIGNMENT_ID` (PK): Unique assignment identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `POSITION_ID` (FK): Links to POSITIONS
- `DEPARTMENT_ID` (FK): Links to DEPARTMENTS
- `LOCATION_ID` (FK): Links to LOCATIONS
- `MANAGER_ID` (FK): Links to EMPLOYEES (manager)
- `JOB_GRADE_ID` (FK): Links to JOB_GRADES
- `EFFECTIVE_DATE`: Assignment start date
- `END_DATE`: Assignment end date (NULL = current)
- `CHANGE_REASON`: Reason for assignment change

**Key Notes:**
- For current assignments: `WHERE END_DATE IS NULL`
- Supports tracking internal transfers and promotions
- Manager self-join enables span of control calculations

---

## Compensation

### COMPENSATION_RECORDS (3,434 rows)
**Salary and bonus records with history**
- `COMP_RECORD_ID` (PK): Unique compensation record identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `COMP_TYPE`: Base / Bonus
- `CURRENCY_CODE`: Currency (e.g., USD, EUR)
- `AMOUNT`: Compensation amount
- `PAY_FREQUENCY`: Annual / Monthly / Hourly
- `EFFECTIVE_DATE`: Record start date
- `END_DATE`: Record end date (NULL = current)
- `CHANGE_REASON`: Reason for change

**Key Notes:**
- For current compensation: `WHERE END_DATE IS NULL AND COMP_TYPE = 'Base'`
- Multiple records per employee over time (salary history)
- Supports analysis by compensation type and pay frequency

---

## Performance Management

### PERFORMANCE_CYCLES (6 rows)
**Review cycle definitions**
- `CYCLE_ID` (PK): Unique cycle identifier
- `CYCLE_NAME`: Cycle name (e.g., "FY2024 Annual Review")
- `CYCLE_TYPE`: Annual / Mid-Year
- `START_DATE`: Cycle start date
- `END_DATE`: Cycle end date

### PERFORMANCE_REVIEWS (1,249 rows)
**Review ratings and feedback**
- `REVIEW_ID` (PK): Unique review identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES (employee being reviewed)
- `CYCLE_ID` (FK): Links to PERFORMANCE_CYCLES
- `REVIEWER_ID` (FK): Links to EMPLOYEES (reviewer)
- `REVIEWER_TYPE`: Manager / Peer / Self / Direct Report
- `OVERALL_RATING`: Numeric rating (1-5 or similar)
- `RATING_LABEL`: Exceeds / Meets / Below expectations
- `IS_FINAL_CALIBRATED`: Boolean for final calibrated rating
- `SUBMISSION_DATE`: When review was submitted

### GOALS (1,808 rows)
**Employee goals and attainment**
- `GOAL_ID` (PK): Unique goal identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `CYCLE_ID` (FK): Links to PERFORMANCE_CYCLES
- `GOAL_TITLE`: Goal description
- `GOAL_TYPE`: Company / Individual / Team
- `WEIGHT_PCT`: Goal weight in overall evaluation
- `TARGET_VALUE`: Target achievement level
- `ACTUAL_VALUE`: Actual achievement
- `ATTAINMENT_PCT`: Achievement percentage

---

## Recruitment

### JOB_REQUISITIONS (50 rows)
**Open job requisitions**
- `REQUISITION_ID` (PK): Unique requisition identifier
- `POSITION_ID` (FK): Links to POSITIONS
- `DEPARTMENT_ID` (FK): Links to DEPARTMENTS
- `HIRING_MANAGER_ID` (FK): Links to EMPLOYEES
- `RECRUITER_ID` (FK): Links to EMPLOYEES
- `OPEN_DATE`: Requisition open date
- `CLOSE_DATE`: Requisition close date (NULL = still open)
- `REQUISITION_STATUS`: Open / Filled / On Hold / Cancelled
- `PRIORITY_LEVEL`: Priority ranking

### CANDIDATES (321 rows)
**Candidate master data**
- `CANDIDATE_ID` (PK): Unique candidate identifier
- `FIRST_NAME`: Candidate first name
- `LAST_NAME`: Candidate last name
- `EMAIL`: Email address
- `SOURCE_CHANNEL`: LinkedIn / Referral / Agency / Campus / Job Board / Career Site

### APPLICATIONS (421 rows)
**Job applications and tracking**
- `APPLICATION_ID` (PK): Unique application identifier
- `CANDIDATE_ID` (FK): Links to CANDIDATES
- `REQUISITION_ID` (FK): Links to JOB_REQUISITIONS
- `APPLIED_DATE`: Application submission date
- `CURRENT_STAGE`: Applied / Screening / Interview / Offer / Hired / Rejected
- `OFFER_DATE`: Offer date if applicable
- `OFFER_AMOUNT`: Offer salary/compensation
- `OFFER_ACCEPTED`: Boolean acceptance flag
- `HIRE_DATE`: Hire date if applicable
- `REJECTION_REASON`: Reason for rejection if applicable

### INTERVIEW_STAGES (206 rows)
**Interview feedback and outcomes**
- `STAGE_ID` (PK): Unique interview stage identifier
- `APPLICATION_ID` (FK): Links to APPLICATIONS
- `STAGE_NAME`: Interview type (Phone Screen, Technical, Cultural Fit, etc.)
- `INTERVIEWER_ID` (FK): Links to EMPLOYEES
- `SCHEDULED_DATE`: Interview date
- `OUTCOME`: Pass / Fail / No Decision
- `FEEDBACK_SCORE`: Numeric score

---

## Separation & Exit

### EXIT_RECORDS (113 rows)
**Employee termination details**
- `EXIT_ID` (PK): Unique exit record identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `TERMINATION_DATE`: Exit date
- `TERMINATION_TYPE`: Voluntary / Involuntary / Redundancy
- `PRIMARY_REASON`: Stated reason for departure
- `REGRETTABLE`: Boolean (whether departure was regrettable)
- `ELIGIBLE_FOR_REHIRE`: Boolean rehire eligibility
- `EXIT_INTERVIEW_DONE`: Boolean exit interview completion

---

## Time Off Management

### LEAVE_TYPES (5 rows)
**Leave type definitions**
- `LEAVE_TYPE_ID` (PK): Unique leave type identifier
- `LEAVE_NAME`: Annual / Sick / Maternity / Paternity / Bereavement
- `IS_PAID`: Boolean paid leave flag

### LEAVE_REQUESTS (904 rows)
**Leave requests and approvals**
- `LEAVE_ID` (PK): Unique leave request identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `LEAVE_TYPE_ID` (FK): Links to LEAVE_TYPES
- `START_DATE`: Leave start date
- `END_DATE`: Leave end date
- `DAYS_TAKEN`: Number of days taken
- `STATUS`: Approved / Pending / Rejected
- `APPROVED_BY` (FK): Links to EMPLOYEES (approver)

---

## Employee Development

### SKILLS (20 rows)
**Skill definitions**
- `SKILL_ID` (PK): Unique skill identifier
- `SKILL_NAME`: Skill name
- `SKILL_CATEGORY`: Technical / Soft / Leadership (3 categories)

### EMPLOYEE_SKILLS (679 rows)
**Employee skill inventory**
- `EMPLOYEE_SKILL_ID` (PK): Unique employee skill record identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `SKILL_ID` (FK): Links to SKILLS
- `PROFICIENCY_LEVEL`: Beginner / Intermediate / Advanced / Expert
- `ASSESSED_DATE`: Date skill was assessed
- `SOURCE`: Self-assessment / Manager assessment / Test / Certification

### TRAINING_PROGRAMS (15 rows)
**Training program definitions**
- `PROGRAM_ID` (PK): Unique program identifier
- `PROGRAM_NAME`: Program name
- `PROGRAM_TYPE`: Technical / Leadership / Compliance / Other
- `DELIVERY_MODE`: In-person / Online / Hybrid
- `DURATION_HOURS`: Program duration in hours
- `PROVIDER`: Training provider name

### TRAINING_ENROLLMENTS (1,370 rows)
**Employee training enrollment and completion**
- `ENROLLMENT_ID` (PK): Unique enrollment identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `PROGRAM_ID` (FK): Links to TRAINING_PROGRAMS
- `ENROLLMENT_DATE`: Enrollment date
- `COMPLETION_DATE`: Completion date (NULL = not completed)
- `STATUS`: Completed / Enrolled / Overdue / Dropped
- `SCORE_PCT`: Completion score percentage

---

## Employee Engagement

### SURVEY_CAMPAIGNS (9 rows)
**Survey campaign definitions**
- `CAMPAIGN_ID` (PK): Unique campaign identifier
- `CAMPAIGN_NAME`: Campaign name
- `SURVEY_TYPE`: eNPS / Pulse / Engagement / Culture
- `LAUNCH_DATE`: Campaign launch date
- `CLOSE_DATE`: Campaign close date

### SURVEY_RESPONSES (6,699 rows)
**Employee survey responses**
- `RESPONSE_ID` (PK): Unique response identifier
- `CAMPAIGN_ID` (FK): Links to SURVEY_CAMPAIGNS
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `QUESTION_CODE`: Question identifier (eNPS / Q_ENGAGE / Q_GROWTH / Q_MANAGER / Q_NPS / Q_WELLBEING)
- `RESPONSE_SCORE`: Response score (numeric, typically 0-10)
- `RESPONSE_TEXT`: Open-ended response text
- `SUBMITTED_AT`: Response submission timestamp

**Key Notes:**
- `eNPS` question used for eNPS metric calculation
- `Q_ENGAGE` responses used for engagement scoring

---

## Attendance (Currently Empty)

### ATTENDANCE_RECORDS (0 rows)
**Employee attendance tracking (not yet implemented)**
- `ATTENDANCE_ID` (PK): Unique attendance record identifier
- `EMPLOYEE_ID` (FK): Links to EMPLOYEES
- `WORK_DATE`: Date of work
- `CHECK_IN_TIME`: Clock-in timestamp
- `CHECK_OUT_TIME`: Clock-out timestamp
- `HOURS_WORKED`: Hours worked that day
- `ATTENDANCE_STATUS`: Present / Absent / Late / Early Leave

**Key Notes:**
- Currently empty — do not use in queries
- Reserved for future implementation

---

## Relationship Map

```
EMPLOYEES (hub)
├── EMPLOYEE_ASSIGNMENTS → POSITIONS → JOB_GRADES → JOB_FAMILIES
│                       ├── DEPARTMENTS → COST_CENTERS
│                       └── LOCATIONS
├── COMPENSATION_RECORDS
├── PERFORMANCE_REVIEWS
├── GOALS → PERFORMANCE_CYCLES
├── EXIT_RECORDS
├── LEAVE_REQUESTS → LEAVE_TYPES
├── EMPLOYEE_SKILLS → SKILLS
├── TRAINING_ENROLLMENTS → TRAINING_PROGRAMS
└── SURVEY_RESPONSES → SURVEY_CAMPAIGNS

JOB_REQUISITIONS → POSITIONS
APPLICATIONS → CANDIDATES & JOB_REQUISITIONS
INTERVIEW_STAGES → APPLICATIONS
```

---

## Critical Join Conditions

| Source | Target | Condition | Notes |
|--------|--------|-----------|-------|
| EMPLOYEES | EMPLOYEE_ASSIGNMENTS | `EMPLOYEES.EMPLOYEE_ID = EMPLOYEE_ASSIGNMENTS.EMPLOYEE_ID` | Use `END_DATE IS NULL` for current assignment |
| EMPLOYEE_ASSIGNMENTS | DEPARTMENTS | `EMPLOYEE_ASSIGNMENTS.DEPARTMENT_ID = DEPARTMENTS.DEPARTMENT_ID` | Current dept only if assignment active |
| EMPLOYEE_ASSIGNMENTS | LOCATIONS | `EMPLOYEE_ASSIGNMENTS.LOCATION_ID = LOCATIONS.LOCATION_ID` | Current location only if assignment active |
| EMPLOYEE_ASSIGNMENTS | JOB_GRADES | `EMPLOYEE_ASSIGNMENTS.JOB_GRADE_ID = JOB_GRADES.JOB_GRADE_ID` | Current grade only if assignment active |
| JOB_GRADES | JOB_FAMILIES | `JOB_GRADES.JOB_FAMILY_ID = JOB_FAMILIES.JOB_FAMILY_ID` | Links grade to job family |
| DEPARTMENTS | COST_CENTERS | `DEPARTMENTS.COST_CENTER_ID = COST_CENTERS.COST_CENTER_ID` | Department cost allocation |
| COMPENSATION_RECORDS | EMPLOYEES | `COMPENSATION_RECORDS.EMPLOYEE_ID = EMPLOYEES.EMPLOYEE_ID` | Use `END_DATE IS NULL AND COMP_TYPE = 'Base'` for current base |
| EXIT_RECORDS | EMPLOYEES | `EXIT_RECORDS.EMPLOYEE_ID = EMPLOYEES.EMPLOYEE_ID` | Separation tracking |
| APPLICATIONS | JOB_REQUISITIONS | `APPLICATIONS.REQUISITION_ID = JOB_REQUISITIONS.REQUISITION_ID` | Recruitment pipeline |
| APPLICATIONS | CANDIDATES | `APPLICATIONS.CANDIDATE_ID = CANDIDATES.CANDIDATE_ID` | Candidate details |
| INTERVIEW_STAGES | APPLICATIONS | `INTERVIEW_STAGES.APPLICATION_ID = APPLICATIONS.APPLICATION_ID` | Interview progression |
| SURVEY_RESPONSES | SURVEY_CAMPAIGNS | `SURVEY_RESPONSES.CAMPAIGN_ID = SURVEY_CAMPAIGNS.CAMPAIGN_ID` | Campaign scope |
| TRAINING_ENROLLMENTS | TRAINING_PROGRAMS | `TRAINING_ENROLLMENTS.PROGRAM_ID = TRAINING_PROGRAMS.PROGRAM_ID` | Program details |
| EMPLOYEE_SKILLS | SKILLS | `EMPLOYEE_SKILLS.SKILL_ID = SKILLS.SKILL_ID` | Skill definitions |
| LEAVE_REQUESTS | LEAVE_TYPES | `LEAVE_REQUESTS.LEAVE_TYPE_ID = LEAVE_TYPES.LEAVE_TYPE_ID` | Leave type details |

---

## Data Grain Summary

| Table | Grain | Primary Time Field | Historical | Current Only Filter |
|-------|-------|-------------------|------------|---------------------|
| EMPLOYEES | One row per employee | HIRE_DATE | Yes | `EMPLOYEE_STATUS != 'Terminated'` |
| EMPLOYEE_ASSIGNMENTS | One row per assignment period | EFFECTIVE_DATE | Yes | `END_DATE IS NULL` |
| DEPARTMENTS | One row per department | N/A | No | `IS_ACTIVE = TRUE` |
| LOCATIONS | One row per location | N/A | No | Always current |
| JOB_GRADES | One row per grade | N/A | No | Always current |
| POSITIONS | One row per position | N/A | No | Always current |
| COMPENSATION_RECORDS | One row per comp record/period | EFFECTIVE_DATE | Yes | `END_DATE IS NULL AND COMP_TYPE = 'Base'` |
| PERFORMANCE_REVIEWS | One row per review | SUBMISSION_DATE | Yes | Filter by CYCLE_ID |
| GOALS | One row per goal | N/A | Yes | Filter by CYCLE_ID |
| EXIT_RECORDS | One row per termination | TERMINATION_DATE | No | N/A |
| JOB_REQUISITIONS | One row per requisition | OPEN_DATE | No | Filter by status |
| APPLICATIONS | One row per application | APPLIED_DATE | No | Filter by CURRENT_STAGE |
| INTERVIEW_STAGES | One row per interview | SCHEDULED_DATE | No | N/A |
| CANDIDATES | One row per candidate | N/A | No | N/A |
| LEAVE_REQUESTS | One row per leave request | START_DATE | No | Filter by STATUS |
| TRAINING_ENROLLMENTS | One row per enrollment | ENROLLMENT_DATE | No | Filter by STATUS |
| SURVEY_RESPONSES | One row per response | SUBMITTED_AT | No | N/A |
| EMPLOYEE_SKILLS | One row per skill per employee | ASSESSED_DATE | Yes | Latest per (EMPLOYEE_ID, SKILL_ID) |

