# Data Schema Map
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Complete mapping of 8 fact tables and 7 dimension tables with column names, join keys, and data types.

---

## FACT TABLES

### 1. FACT_ASSEMBLY_OUTPUT
**Purpose:** Daily production output per line, shift, and model

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| ASSEMBLY_ID | INT | Primary key | PK |
| DATE_KEY | DATE | Production date (YYYY-MM-DD) | FK → DIM_DATE |
| PLANT_ID | VARCHAR(10) | Plant identifier | FK → DIM_PLANT |
| LINE_ID | VARCHAR(10) | Assembly line number | FK → DIM_LINE |
| MODEL_ID | INT | Vehicle model | FK → DIM_MODEL |
| SHIFT | VARCHAR(10) | Shift identifier (1, 2, 3) | FK → DIM_SHIFT |
| UNITS_PLANNED | INT | Target units for shift | -- |
| UNITS_PRODUCED | INT | Actual units produced | -- |
| UNITS_REWORKED | INT | Units requiring rework | -- |
| UNITS_SCRAPPED | INT | Units scrapped (non-recoverable) | -- |
| AVAILABILITY_PCT | DECIMAL(5,2) | Equipment availability % | -- |
| PERFORMANCE_PCT | DECIMAL(5,2) | Performance efficiency % | -- |
| QUALITY_PCT | DECIMAL(5,2) | Quality rate % | -- |
| OEE_PCT | DECIMAL(5,2) | Overall Equipment Effectiveness % (A×P×Q) | -- |
| DOWNTIME_MINUTES | INT | Total downtime in shift | -- |

**Join Key:** PLANT_ID + DATE_KEY + SHIFT  
**Data Volume:** ~1.3M rows (2020-2024, ~370K units/year)  
**Grain:** Daily by plant, line, model, shift

---

### 2. FACT_QUALITY_EVENTS
**Purpose:** Individual defect and quality events logged during production

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| QUALITY_EVENT_ID | INT | Primary key | PK |
| ASSEMBLY_ID | INT | Reference to assembly output | FK → FACT_ASSEMBLY_OUTPUT |
| DATE_KEY | DATE | Event date | FK → DIM_DATE |
| PLANT_ID | VARCHAR(10) | Plant identifier | FK → DIM_PLANT |
| DEFECT_TYPE | VARCHAR(50) | Type of defect (coating, welding, assembly, other) | -- |
| SEVERITY | VARCHAR(10) | Severity level (minor, major, critical) | -- |
| DETECTED_AT | VARCHAR(20) | Detection point (line, QC, shipping) | -- |
| RESOLUTION | VARCHAR(20) | Resolution method (rework, scrap, accept) | -- |
| RESOLUTION_COST | DECIMAL(10,2) | Cost to resolve (in USD) | -- |

**Join Key:** ASSEMBLY_ID + DATE_KEY  
**Data Volume:** ~8K rows (2020-2024, ~40 per year in 2024)  
**Grain:** Event level

---

### 3. FACT_EQUIPMENT_EVENTS
**Purpose:** Equipment downtime, maintenance, and OEE component tracking

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| EQUIPMENT_EVENT_ID | INT | Primary key | PK |
| EVENT_DATE | DATE | Event date | FK → DIM_DATE |
| EQUIPMENT_ID | VARCHAR(20) | Equipment identifier | FK → DIM_EQUIPMENT |
| PLANT_ID | VARCHAR(10) | Plant identifier | FK → DIM_PLANT |
| DOWNTIME_MINUTES | INT | Downtime duration | -- |
| DOWNTIME_TYPE | VARCHAR(20) | Type (scheduled, unscheduled) | -- |
| ROOT_CAUSE | VARCHAR(100) | Root cause of downtime | -- |
| REPAIR_MINUTES | INT | Time to repair | -- |
| MAINTENANCE_TYPE | VARCHAR(20) | Type (preventive, corrective) | -- |
| MAINTENANCE_COST | DECIMAL(10,2) | Cost in USD | -- |
| MTBF_DAYS | DECIMAL(8,2) | Mean time between failures | -- |
| MTTR_HOURS | DECIMAL(8,2) | Mean time to repair | -- |

**Join Key:** EQUIPMENT_ID + EVENT_DATE  
**Data Volume:** ~2.2M rows (2020-2024)  
**Grain:** Event level

---

### 4. FACT_SERVICE_JOBS
**Purpose:** Service centre work orders and maintenance jobs

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| SERVICE_JOB_ID | INT | Primary key | PK |
| JOB_DATE | DATE | Service job date | FK → DIM_DATE |
| SERVICE_CENTRE_ID | VARCHAR(10) | Service centre identifier | FK → DIM_SERVICE_CENTRE |
| VEHICLE_ID | INT | Vehicle serviced | FK → DIM_VEHICLE |
| JOB_TYPE | VARCHAR(30) | Job type (maintenance, repair, recall, upgrade) | -- |
| TURNAROUND_DAYS | DECIMAL(8,2) | Days from intake to completion | -- |
| LABOR_COST | DECIMAL(10,2) | Labor cost (USD) | -- |
| PARTS_COST | DECIMAL(10,2) | Parts cost (USD) | -- |
| CUSTOMER_SATISFACTION_SCORE | DECIMAL(3,2) | CSAT rating (1-5 scale) | -- |
| WORK_ORDER_NUMBER | VARCHAR(20) | Unique work order ID | -- |

**Join Key:** SERVICE_CENTRE_ID + JOB_DATE  
**Data Volume:** ~860 rows (2020-2024, ~172 in 2024)  
**Grain:** Job level

---

### 5. FACT_WARRANTY_CLAIMS
**Purpose:** Vehicle warranty claims and failure analysis

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| CLAIM_ID | INT | Primary key | PK |
| CLAIM_DATE | DATE | Claim filing date | FK → DIM_DATE |
| VEHICLE_ID | INT | Vehicle with claim | FK → DIM_VEHICLE |
| FAILURE_TYPE | VARCHAR(50) | Type of failure | -- |
| REPAIR_COST | DECIMAL(10,2) | Cost to repair (USD) | -- |
| DAYS_TO_RESOLUTION | INT | Days from claim to closure | -- |
| IS_REPEAT_CLAIM | INT | 1 if vehicle has prior claims, 0 otherwise | -- |
| CLAIM_STATUS | VARCHAR(20) | Status (open, closed, pending) | -- |
| WARRANTY_PERIOD_MONTHS | INT | Months into warranty | -- |

**Join Key:** VEHICLE_ID + CLAIM_DATE  
**Data Volume:** ~50K rows (2020-2024)  
**Grain:** Claim level

---

### 6. FACT_PURCHASE_ORDERS
**Purpose:** Supplier purchase orders and delivery tracking

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| PO_ID | INT | Primary key | PK |
| PO_NUMBER | VARCHAR(20) | Unique PO identifier | -- |
| PO_DATE | DATE | Date PO issued | FK → DIM_DATE |
| SUPPLIER_ID | INT | Supplier identifier | FK → DIM_SUPPLIER |
| PART_ID | INT | Part ordered | FK → DIM_PART |
| PLANT_ID | VARCHAR(10) | Receiving plant | FK → DIM_PLANT |
| QUANTITY_ORDERED | INT | Quantity ordered | -- |
| QUANTITY_RECEIVED | INT | Quantity received | -- |
| UNIT_PRICE | DECIMAL(12,4) | Price per unit (in original currency) | -- |
| CURRENCY | VARCHAR(3) | Currency code (USD, EUR, JPY) | -- |
| LEAD_TIME_DAYS | INT | Expected delivery days | -- |
| ACTUAL_DELIVERY_DATE | DATE | Actual delivery date | -- |
| DAYS_LATE | INT | Days late (negative = early) | -- |
| PO_STATUS | VARCHAR(20) | Status (draft, issued, received, closed) | -- |
| QUALITY_RATING | DECIMAL(3,2) | Supplier quality rating on PO (1-5) | -- |

**Join Key:** PO_ID = SUPPLIER_ID + PO_DATE  
**Data Volume:** ~2.8M rows (2020-2024, ~$9.3M in 2024)  
**Grain:** Line item level

---

### 7. FACT_LABOR_HOURS
**Purpose:** Daily labor hours by plant, shift, and skill category

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| LABOR_HOUR_ID | INT | Primary key | PK |
| DATE_KEY | DATE | Labor date | FK → DIM_DATE |
| PLANT_ID | VARCHAR(10) | Plant identifier | FK → DIM_PLANT |
| SHIFT | VARCHAR(10) | Shift identifier (1, 2, 3) | FK → DIM_SHIFT |
| EMPLOYEE_ID | INT | Employee (GDPR redacted aggregates only) | FK → DIM_EMPLOYEE |
| SKILL_LEVEL | VARCHAR(20) | Skill classification (entry, intermediate, advanced) | -- |
| HOURS_WORKED | DECIMAL(8,2) | Regular hours | -- |
| OVERTIME_HOURS | DECIMAL(8,2) | Overtime hours (1.5x rate) | -- |
| LABOR_COST | DECIMAL(10,2) | Total labor cost for period (USD) | -- |
| UNITS_PRODUCED | INT | Units produced by shift | -- |

**Join Key:** PLANT_ID + DATE_KEY + SHIFT  
**Data Volume:** ~219K rows (2020-2024)  
**Grain:** Daily by plant, shift, skill level

---

### 8. FACT_INVENTORY
**Purpose:** Inventory balances by location, part, and day

| Column Name | Data Type | Description | Key Type |
|------------|-----------|-------------|----------|
| INVENTORY_ID | INT | Primary key | PK |
| DATE_KEY | DATE | Inventory date (EOD) | FK → DIM_DATE |
| PART_ID | INT | Part identifier | FK → DIM_PART |
| LOCATION_ID | VARCHAR(10) | Warehouse/plant location | FK → DIM_LOCATION |
| LOCATION_TYPE | VARCHAR(20) | Type (Plant, Warehouse, Service Centre) | -- |
| INVENTORY_QUANTITY | INT | On-hand quantity | -- |
| SAFETY_STOCK | INT | Safety stock level | -- |
| LEAD_TIME_DAYS | INT | Supplier lead time | -- |
| AVG_DAILY_CONSUMPTION | DECIMAL(10,2) | Average daily consumption | -- |
| STOCK_VALUE_USD | DECIMAL(12,2) | Stock value in USD | -- |
| OBSOLESCENCE_RESERVE | DECIMAL(10,2) | Reserve for obsolete stock | -- |

**Join Key:** PART_ID + LOCATION_ID + DATE_KEY  
**Data Volume:** ~1.5M rows (2020-2024, daily snapshots)  
**Grain:** Daily by part and location

---

## DIMENSION TABLES

### 1. DIM_PLANT
**Purpose:** Master list of manufacturing plants

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| PLANT_ID | VARCHAR(10) | Primary key |
| PLANT_NAME | VARCHAR(100) | Full plant name |
| PLANT_CODE | VARCHAR(5) | Short code |
| REGION | VARCHAR(20) | Region (EMEA, APAC, Americas, China) |
| COUNTRY | VARCHAR(30) | Country of operation |
| CITY | VARCHAR(50) | City |
| PLANT_TYPE | VARCHAR(20) | Type (Production, Service, Warehouse) |
| CAPACITY_UNITS_PER_YEAR | INT | Annual capacity |
| OPERATIONAL_SINCE | DATE | Operational start date |
| PLANT_MANAGER | VARCHAR(100) | Plant manager name |
| IS_ACTIVE | INT | 1 = active, 0 = inactive |

**Row Count:** 12 production + 4 service centres = 16 rows  
**Key Note:** Service centres (Chicago, Munich, Sydney, Rotterdam) excluded from production dashboards

---

### 2. DIM_MODEL
**Purpose:** Vehicle models manufactured

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| MODEL_ID | INT | Primary key |
| MODEL_NAME | VARCHAR(50) | Model name |
| BRAND_ID | INT | Brand reference |
| MODEL_CODE | VARCHAR(10) | Short code |
| PRODUCTION_START_DATE | DATE | First production date |
| PRODUCTION_END_DATE | DATE | Last production date (NULL if current) |
| UNIT_COST_USD | DECIMAL(10,2) | Standard unit cost |
| COMPLEXITY_LEVEL | VARCHAR(20) | Complexity (low, medium, high) |
| ASSEMBLY_LINES | INT | Number of lines for model |

**Row Count:** 18 vehicle models  
**Distribution:** Toyota 3, Honda 3, Ford 3, BMW 3, Mercedes 3, Volkswagen 3

---

### 3. DIM_BRAND
**Purpose:** Manufacturing brands

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| BRAND_ID | INT | Primary key |
| BRAND_NAME | VARCHAR(50) | Brand name |
| BRAND_CODE | VARCHAR(5) | Brand code |
| PARENT_COMPANY | VARCHAR(100) | Parent company |
| REGION_PRIMARY | VARCHAR(20) | Primary market region |

**Row Count:** 6 brands (Toyota, Honda, Ford, BMW, Mercedes, Volkswagen)

---

### 4. DIM_SUPPLIER
**Purpose:** Tier 1-2 suppliers

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| SUPPLIER_ID | INT | Primary key |
| SUPPLIER_NAME | VARCHAR(100) | Supplier legal name |
| SUPPLIER_CODE | VARCHAR(10) | Short code |
| TIER | VARCHAR(5) | Tier 1 or Tier 2 |
| COUNTRY | VARCHAR(30) | Country of operation |
| PRIMARY_CONTACT | VARCHAR(100) | Main contact person |
| QUALITY_CERTIFIED | INT | 1 = ISO certified, 0 = not certified |
| PAYMENT_TERMS_DAYS | INT | Standard payment terms |
| ANNUAL_SPEND_USD | DECIMAL(12,2) | 2024 spend |
| ON_TIME_DELIVERY_PCT | DECIMAL(5,2) | Historical on-time % |
| IS_ACTIVE | INT | 1 = active, 0 = inactive |

**Row Count:** 15 tier 1-2 suppliers  
**Key Note:** 2024 total PO spend = $9.3M across all suppliers

---

### 5. DIM_VEHICLE
**Purpose:** Individual vehicles produced (VIN level)

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| VEHICLE_ID | INT | Primary key |
| VIN | VARCHAR(17) | Vehicle Identification Number (unique) |
| BRAND_ID | INT | Brand identifier |
| MODEL_ID | INT | Model identifier |
| PRODUCTION_DATE | DATE | Date produced |
| PLANT_ID | VARCHAR(10) | Plant where produced |
| EXTERIOR_COLOR | VARCHAR(30) | Exterior color |
| INTERIOR_COLOR | VARCHAR(30) | Interior color |
| TRANSMISSION | VARCHAR(20) | Transmission type (manual, automatic, CVT) |
| ENGINE_TYPE | VARCHAR(20) | Engine (gasoline, diesel, hybrid, electric) |
| CUSTOMER_REGION | VARCHAR(20) | Destination region |
| WARRANTY_MONTHS | INT | Warranty period in months (typically 36 or 60) |

**Row Count:** ~1.85M vehicles (2020-2024 production)

---

### 6. DIM_PART
**Purpose:** Component/parts master

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| PART_ID | INT | Primary key |
| PART_NUMBER | VARCHAR(20) | Supplier part number |
| PART_NAME | VARCHAR(100) | Description |
| SUPPLIER_ID | INT | Primary supplier |
| PART_CATEGORY | VARCHAR(30) | Category (body, engine, electrical, etc.) |
| UNIT_COST_USD | DECIMAL(10,2) | Standard unit cost |
| LEAD_TIME_DAYS | INT | Typical lead time |
| IS_CRITICAL | INT | 1 = critical, 0 = standard |
| IS_ACTIVE | INT | 1 = active, 0 = obsolete |

**Row Count:** ~850 active parts

---

### 7. DIM_SERVICE_CENTRE
**Purpose:** Service and after-sales locations

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| SERVICE_CENTRE_ID | VARCHAR(10) | Primary key |
| SERVICE_CENTRE_NAME | VARCHAR(100) | Full name |
| LOCATION_CODE | VARCHAR(5) | Short code |
| REGION | VARCHAR(20) | Region |
| COUNTRY | VARCHAR(30) | Country |
| CITY | VARCHAR(50) | City |
| SERVICE_MANAGER | VARCHAR(100) | Manager name |
| CAPACITY_JOBS_PER_DAY | INT | Daily job capacity |
| ESTABLISHED_DATE | DATE | Opening date |

**Row Count:** 4 service centres (Chicago, Munich, Sydney, Rotterdam)

---

## SUPPORT DIMENSION TABLES

### DIM_DATE
**Grain:** One row per day (2020-2024)  
**Columns:** DATE_KEY, YEAR, QUARTER, MONTH, DAY, DAY_NAME, WEEK_OF_YEAR, DAY_OF_QUARTER

### DIM_SHIFT
**Grain:** One row per shift identifier  
**Columns:** SHIFT, SHIFT_NAME, START_TIME, END_TIME, SHIFT_NUMBER

### DIM_EQUIPMENT
**Grain:** Equipment master  
**Columns:** EQUIPMENT_ID, EQUIPMENT_NAME, EQUIPMENT_TYPE, PLANT_ID, LINE_ID, INSTALLED_DATE, MANUFACTURER

### DIM_EMPLOYEE
**Grain:** Employee master (GDPR redacted)  
**Columns:** EMPLOYEE_ID (hashed), PLANT_ID, SKILL_LEVEL, HIRE_DATE, STATUS

### DIM_LOCATION
**Grain:** Physical warehouse/plant locations  
**Columns:** LOCATION_ID, LOCATION_NAME, LOCATION_TYPE, PLANT_ID, WAREHOUSE_CODE, CAPACITY_UNITS

### DIM_LINE
**Grain:** Assembly lines  
**Columns:** LINE_ID, LINE_NAME, PLANT_ID, LINE_TYPE, EQUIPMENT_COUNT, INSTALLED_DATE

---

## JOIN PATTERNS

**Production View (Most Common)**
```
FACT_ASSEMBLY_OUTPUT
  ├─ DIM_PLANT (PLANT_ID)
  ├─ DIM_MODEL (MODEL_ID)
  ├─ DIM_DATE (DATE_KEY)
  ├─ DIM_SHIFT (SHIFT)
  └─ DIM_LINE (LINE_ID)
```

**Quality & Defects View**
```
FACT_QUALITY_EVENTS
  ├─ FACT_ASSEMBLY_OUTPUT (ASSEMBLY_ID)
  ├─ DIM_PLANT (PLANT_ID)
  ├─ DIM_DATE (DATE_KEY)
  └─ DIM_MODEL (via FACT_ASSEMBLY_OUTPUT)
```

**Supplier & Procurement View**
```
FACT_PURCHASE_ORDERS
  ├─ DIM_SUPPLIER (SUPPLIER_ID)
  ├─ DIM_PART (PART_ID)
  ├─ DIM_PLANT (PLANT_ID)
  └─ DIM_DATE (PO_DATE)
```

**Service & Warranty View**
```
FACT_SERVICE_JOBS / FACT_WARRANTY_CLAIMS
  ├─ DIM_VEHICLE (VEHICLE_ID)
  ├─ DIM_SERVICE_CENTRE / DIM_PLANT (location)
  └─ DIM_DATE (JOB_DATE / CLAIM_DATE)
```

---

## Critical Join Notes

1. **FACT_ASSEMBLY_OUTPUT → FACT_QUALITY_EVENTS**: Join on ASSEMBLY_ID when drilling from production to defects
2. **Service Centre Exclusion**: Filter WHERE PLANT_TYPE = 'Production' or use plant exclusion list (Chicago, Munich, Sydney, Rotterdam)
3. **VIN Mapping**: FACT_ASSEMBLY_OUTPUT lacks VIN; use PLANT_ID + DATE_KEY + MODEL_ID + sequence to match DIM_VEHICLE
4. **Currency Handling**: PO prices in original currency; convert to USD using CURRENCY column and daily rates (external table)
5. **Date Grain**: All FACT tables use DATE_KEY (YYYY-MM-DD); SHIFT adds daily grain detail
6. **Employee Privacy**: DIM_EMPLOYEE.EMPLOYEE_ID is hashed; no individual-level data exposed in dashboards

---

**Last Updated:** 2026-04-12  
**Data Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
