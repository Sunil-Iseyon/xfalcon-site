# Metric Definitions & KPI Formulas
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Standardized KPI definitions with SQL formulas, calculation logic, and business rules for all 10 dashboards.

---

## PRODUCTION METRICS

### 1. OEE % (Overall Equipment Effectiveness)
**Dashboard:** OEE & Equipment, Executive Overview  
**Calculation Method:** Aggregate available calculation (pre-computed)  
**Formula (SQL):**
```sql
SELECT 
  YEAR(DATE_KEY) as year,
  MONTH(DATE_KEY) as month,
  AVG(OEE_PCT) as oee_pct
FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
  AND YEAR(DATE_KEY) = 2024
GROUP BY YEAR(DATE_KEY), MONTH(DATE_KEY)
ORDER BY year, month;
```

**Definition:**  
OEE = Availability (%) × Performance (%) × Quality (%)
- **Availability:** Scheduled time minus downtime / Scheduled time
- **Performance:** Actual cycle time / Theoretical cycle time
- **Quality:** Good units / Total units produced

**Benchmark:**  
- 2024 Average: 87.99%
- Target: >90%
- Acceptable Range: 85-90%
- Red Alert: <80%

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_ASSEMBLY_OUTPUT.OEE_PCT (pre-calculated in warehouse)

---

### 2. Production Yield %
**Dashboard:** Production Performance, Executive Overview  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SUM(UNITS_PRODUCED) / SUM(UNITS_PLANNED) * 100 as yield_pct
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME
ORDER BY DATE_KEY DESC;
```

**Definition:**  
Yield % = (Total Units Produced / Total Units Planned) × 100

**Interpretation:**
- 100% = Perfect plan attainment
- >95% = Excellent
- 85-95% = Acceptable
- <85% = Underperforming

**Benchmark:**  
- 2024 Total Production: 367,383 units (represents achieved yield across year)
- Target: >98% (aligned with industry 6-sigma standards)

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_ASSEMBLY_OUTPUT (UNITS_PRODUCED, UNITS_PLANNED)

---

### 3. Scrap Rate %
**Dashboard:** Quality & Defects, Production Performance  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  MODEL_NAME,
  SUM(UNITS_SCRAPPED) / SUM(UNITS_PLANNED) * 100 as scrap_rate_pct,
  SUM(UNITS_SCRAPPED) as scrapped_units
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
JOIN DIM_MODEL m ON f.MODEL_ID = m.MODEL_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME, MODEL_NAME
ORDER BY scrap_rate_pct DESC;
```

**Definition:**  
Scrap Rate % = (Total Units Scrapped / Total Units Planned) × 100

**Includes:** Non-recoverable defects, damaged units, material waste

**Target Benchmarks:**
- Target: <0.5%
- Acceptable: 0.5-1.0%
- Warning: 1.0-2.0%
- Critical: >2.0%

**2024 Baseline:**  
- Total defects: 40 (requires data validation)
- Implied scrap rate: ~0.01% (very low; verify with source system)

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_ASSEMBLY_OUTPUT (UNITS_SCRAPPED, UNITS_PLANNED)

---

### 4. Rework Rate %
**Dashboard:** Quality & Defects, Production Performance  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SUM(UNITS_REWORKED) / SUM(UNITS_PRODUCED) * 100 as rework_rate_pct,
  SUM(UNITS_REWORKED) as rework_units,
  SUM(UNITS_PRODUCED) as produced_units
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME
ORDER BY DATE_KEY DESC;
```

**Definition:**  
Rework Rate % = (Total Units Reworked / Total Units Produced) × 100

**Includes:** Units requiring repair/correction after initial QC fail

**Target Benchmarks:**
- Target: <2%
- Acceptable: 2-5%
- Warning: 5-10%
- Critical: >10%

**Business Impact:** Rework increases lead time and labor costs; tracked separately from scrap

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_ASSEMBLY_OUTPUT (UNITS_REWORKED, UNITS_PRODUCED)

---

### 5. First Pass Yield (FPY) %
**Dashboard:** Quality & Defects, Executive Overview  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  ((SUM(UNITS_PRODUCED) - SUM(UNITS_REWORKED)) / SUM(UNITS_PRODUCED) * 100) as fpy_pct,
  SUM(UNITS_PRODUCED) as total_produced,
  SUM(UNITS_REWORKED) as total_rework
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME
ORDER BY DATE_KEY DESC;
```

**Definition:**  
FPY % = ((Total Units Produced - Units Reworked) / Total Units Produced) × 100

**Interpretation:**  
Percentage of units that pass quality inspection without rework. Higher is better.

**Target Benchmarks:**
- Target: >98% (zero-defect manufacturing)
- Acceptable: 95-98%
- Warning: 90-95%
- Critical: <90%

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_ASSEMBLY_OUTPUT (UNITS_PRODUCED, UNITS_REWORKED)

---

## SUPPLY CHAIN METRICS

### 6. Plan Attainment %
**Dashboard:** Production Performance, Executive Overview  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SUM(ACTUAL_QUANTITY) / SUM(PLANNED_QUANTITY) * 100 as plan_attainment_pct,
  SUM(ACTUAL_QUANTITY) as actual_qty,
  SUM(PLANNED_QUANTITY) as planned_qty
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME
ORDER BY DATE_KEY DESC;
```

**Definition:**  
Plan Attainment % = (Total Actual Quantity / Total Planned Quantity) × 100

**Mapping:** Same as Production Yield for assembly output; also tracked separately for raw material procurement

**Target Benchmarks:**
- 100% = Perfect execution
- 95-100% = Target range
- 85-95% = Acceptable with review
- <85% = Escalate to plant management

**Update Frequency:** Daily (T+1)  
**Data Source:** FACT_ASSEMBLY_OUTPUT or FACT_PURCHASE_ORDERS depending on context

---

## LABOR & COST METRICS

### 7. Labor Cost per Unit
**Dashboard:** Workforce & Labor, Executive Overview  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SUM(LABOR_COST) / SUM(UNITS_PRODUCED) as labor_cost_per_unit,
  SUM(LABOR_COST) as total_labor_cost,
  SUM(UNITS_PRODUCED) as total_units
FROM FACT_LABOR_HOURS l
JOIN DIM_PLANT p ON l.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME
ORDER BY DATE_KEY DESC;
```

**Definition:**  
Labor Cost per Unit = Total Labor Cost (USD) / Total Units Produced

**Includes:**
- Regular wages + benefits allocation
- Overtime premium (1.5x base)
- Training and development (allocated)
- Excludes: Health insurance, pension (captured separately)

**Currency:** USD (primary)

**Benchmark Ranges (2024):**
- Target: $50-75 per unit (varies by model complexity)
- Luxury models (BMW, Mercedes): $75-120
- Standard models (Toyota, Honda, Ford): $40-70
- Economy models (Volkswagen): $35-55

**Update Frequency:** Daily (T+1)  
**Data Source:** FACT_LABOR_HOURS (LABOR_COST, UNITS_PRODUCED)

---

### 8. Downtime Rate %
**Dashboard:** OEE & Equipment, Production Performance  
**Formula (SQL):**
```sql
SELECT 
  DATE_KEY,
  EQUIPMENT_NAME,
  PLANT_NAME,
  SUM(DOWNTIME_MINUTES) / (24 * 60) * 100 as downtime_rate_pct,
  SUM(DOWNTIME_MINUTES) as total_downtime_mins,
  (24 * 60) as available_minutes
FROM FACT_EQUIPMENT_EVENTS e
JOIN DIM_EQUIPMENT eq ON e.EQUIPMENT_ID = eq.EQUIPMENT_ID
JOIN DIM_PLANT p ON e.PLANT_ID = p.PLANT_ID
WHERE PLANT_TYPE = 'Production'
  AND YEAR(EVENT_DATE) = 2024
GROUP BY DATE_KEY, EQUIPMENT_NAME, PLANT_NAME
ORDER BY downtime_rate_pct DESC;
```

**Definition:**  
Downtime Rate % = (Total Downtime Minutes / Total Available Minutes) × 100

**Available Minutes Calculation:** 24 hours × 60 minutes = 1,440 minutes/day (assumes 24/7 operation; adjust for 3-shift if needed)

**Breakdown by Type:**
- **Scheduled:** Planned maintenance, changeovers
- **Unscheduled:** Equipment failure, technical issues

**Target Benchmarks:**
- Target: <5% downtime (95% availability)
- Acceptable: 5-10%
- Warning: 10-15%
- Critical: >15%

**Update Frequency:** Daily (T+0)  
**Data Source:** FACT_EQUIPMENT_EVENTS (DOWNTIME_MINUTES)

---

## SUPPLIER METRICS

### 9. Supplier On-Time Delivery %
**Dashboard:** Supplier Scorecard  
**Formula (SQL):**
```sql
SELECT 
  SUPPLIER_NAME,
  COUNT(DISTINCT PO_ID) as total_pos,
  SUM(CASE WHEN DAYS_LATE <= 0 THEN 1 ELSE 0 END) as on_time_pos,
  SUM(CASE WHEN DAYS_LATE <= 0 THEN 1 ELSE 0 END) / COUNT(DISTINCT PO_ID) * 100 as on_time_delivery_pct
FROM FACT_PURCHASE_ORDERS f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_ID = s.SUPPLIER_ID
WHERE YEAR(PO_DATE) = 2024
  AND PO_STATUS IN ('received', 'closed')
GROUP BY SUPPLIER_NAME
ORDER BY on_time_delivery_pct DESC;
```

**Definition:**  
On-Time Delivery % = (POs with DAYS_LATE ≤ 0 / Total Received POs) × 100

**DAYS_LATE Calculation:** ACTUAL_DELIVERY_DATE - (PO_DATE + LEAD_TIME_DAYS)
- Negative = Early delivery (acceptable)
- Zero = On-time
- Positive = Late (counts as miss)

**Target Benchmarks:**
- Target: >98%
- Acceptable: 95-98%
- Warning: 90-95%
- Critical: <90%

**Supplier Tier Impact:**
- Tier 1: Must meet >98%
- Tier 2: Must meet >95%

**Update Frequency:** Daily (T+1)  
**Data Source:** FACT_PURCHASE_ORDERS (DAYS_LATE, PO_STATUS)

---

### 10. Supplier Quality Score
**Dashboard:** Supplier Scorecard  
**Formula (SQL):**
```sql
SELECT 
  SUPPLIER_NAME,
  COUNT(DISTINCT PO_ID) as total_pos,
  ROUND(AVG(QUALITY_RATING), 2) as avg_quality_score,
  MIN(QUALITY_RATING) as min_score,
  MAX(QUALITY_RATING) as max_score
FROM FACT_PURCHASE_ORDERS f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_ID = s.SUPPLIER_ID
WHERE YEAR(PO_DATE) = 2024
  AND QUALITY_RATING IS NOT NULL
GROUP BY SUPPLIER_NAME
ORDER BY avg_quality_score DESC;
```

**Definition:**  
Supplier Quality Score = Average QUALITY_RATING across all POs in period

**Scale:** 1-5
- 5 = Excellent (zero defects)
- 4 = Good (<1% defects)
- 3 = Acceptable (1-3% defects)
- 2 = Poor (3-5% defects)
- 1 = Critical (>5% defects, escalate)

**Target Benchmarks:**
- Target: ≥4.5
- Acceptable: 4.0-4.5
- Warning: 3.0-4.0
- Critical: <3.0 (supplier review required)

**2024 Baseline:**  
- Multi-supplier average: TBD (currently 15 active suppliers)

**Update Frequency:** Monthly (T+30 days, as quality testing completes)  
**Data Source:** FACT_PURCHASE_ORDERS (QUALITY_RATING)

---

## WARRANTY & SERVICE METRICS

### 11. Warranty Cost per Claim
**Dashboard:** Warranty Analysis  
**Formula (SQL):**
```sql
SELECT 
  YEAR(w.CLAIM_DATE) as year,
  MONTH(w.CLAIM_DATE) as month,
  BRAND_NAME,
  COUNT(DISTINCT w.CLAIM_ID) as claim_count,
  ROUND(SUM(w.REPAIR_COST) / COUNT(DISTINCT w.CLAIM_ID), 2) as warranty_cost_per_claim,
  SUM(w.REPAIR_COST) as total_warranty_cost
FROM FACT_WARRANTY_CLAIMS w
JOIN DIM_VEHICLE v ON w.VEHICLE_ID = v.VEHICLE_ID
JOIN DIM_BRAND b ON v.BRAND_ID = b.BRAND_ID
WHERE YEAR(w.CLAIM_DATE) = 2024
GROUP BY year, month, BRAND_NAME
ORDER BY year, month, total_warranty_cost DESC;
```

**Definition:**  
Warranty Cost per Claim = Total Repair Cost (USD) / Total Claim Count

**Includes:**
- Parts replacement cost
- Labor cost for repair
- Diagnostics
- Shipping (if applicable)

**Excludes:**
- Admin/overhead allocation
- Warranty reserve adjustments

**Currency:** USD (primary)

**Benchmark Ranges (2024):**
- Target: <$800 per claim
- Acceptable: $800-1,200
- Warning: $1,200-1,500
- Critical: >$1,500 (engineering review)

**Brand Variation:**
- Luxury (BMW, Mercedes): $1,000-1,500
- Standard (Toyota, Honda, Ford): $600-900
- Economy (Volkswagen): $400-700

**Update Frequency:** Weekly (T+7 days, claims lag)  
**Data Source:** FACT_WARRANTY_CLAIMS (REPAIR_COST, CLAIM_ID)

---

### 12. CSAT Score (Customer Satisfaction)
**Dashboard:** Service & After-Sales  
**Formula (SQL):**
```sql
SELECT 
  DATE_TRUNC('month', JOB_DATE) as month,
  SERVICE_CENTRE_NAME,
  ROUND(AVG(CUSTOMER_SATISFACTION_SCORE), 2) as avg_csat,
  COUNT(SERVICE_JOB_ID) as job_count,
  MIN(CUSTOMER_SATISFACTION_SCORE) as min_score,
  MAX(CUSTOMER_SATISFACTION_SCORE) as max_score
FROM FACT_SERVICE_JOBS
WHERE YEAR(JOB_DATE) = 2024
GROUP BY month, SERVICE_CENTRE_NAME
ORDER BY month DESC, avg_csat DESC;
```

**Definition:**  
CSAT Score = Average CUSTOMER_SATISFACTION_SCORE across all service jobs

**Scale:** 1-5
- 5 = Very Satisfied
- 4 = Satisfied
- 3 = Neutral
- 2 = Dissatisfied
- 1 = Very Dissatisfied

**Survey Timing:** Collected post-service job completion

**Target Benchmarks:**
- Target: ≥4.2
- Acceptable: 4.0-4.2
- Warning: 3.5-4.0
- Critical: <3.5 (requires root cause analysis)

**2024 Baseline:**  
- Average CSAT: 2.85 (RED ALERT - REQUIRES VALIDATION)
- Total jobs: 172
- Data Quality Issue: Score unusually low; verify survey methodology and data source

**Update Frequency:** Daily (T+1)  
**Data Source:** FACT_SERVICE_JOBS (CUSTOMER_SATISFACTION_SCORE)

---

## INVENTORY METRICS

### 13. Inventory Turnover Ratio
**Dashboard:** Inventory & Supply Chain  
**Formula (SQL):**
```sql
SELECT 
  DATE_TRUNC('month', DATE_KEY) as month,
  LOCATION_NAME,
  SUM(consumption_value) / AVG(stock_value) as inventory_turnover_ratio
FROM (
  SELECT 
    f.DATE_KEY,
    l.LOCATION_NAME,
    f.PART_ID,
    AVG_DAILY_CONSUMPTION * 1.0 as consumption_value,
    STOCK_VALUE_USD as stock_value
  FROM FACT_INVENTORY f
  JOIN DIM_LOCATION l ON f.LOCATION_ID = l.LOCATION_ID
  WHERE YEAR(f.DATE_KEY) = 2024
) subquery
GROUP BY month, LOCATION_NAME
ORDER BY month DESC;
```

**Definition:**  
Inventory Turnover = Consumption Value / Average Stock Value

**Alternative (Simplified):**  
Turnover Ratio = COGS or Consumption Cost / Average Inventory Balance

**Interpretation:**
- Higher ratio = Faster moving inventory, less capital tied up
- Lower ratio = Slower inventory movement, potential obsolescence risk

**Target Benchmarks by Category:**
- Raw materials: 6-10 turns/year (60-100 days supply)
- Work-in-progress (WIP): 12-18 turns/year (20-30 days supply)
- Finished goods: 4-8 turns/year (45-90 days supply)
- Critical parts: 8-12 turns/year (30-45 days supply)

**Update Frequency:** Weekly (T+7 days)  
**Data Source:** FACT_INVENTORY (STOCK_VALUE_USD, AVG_DAILY_CONSUMPTION)

---

## PROCUREMENT METRICS

### 14. PO Fill Rate %
**Dashboard:** Purchase Orders, Supplier Scorecard  
**Formula (SQL):**
```sql
SELECT 
  YEAR(PO_DATE) as year,
  MONTH(PO_DATE) as month,
  SUPPLIER_NAME,
  COUNT(DISTINCT PO_ID) as po_count,
  SUM(QUANTITY_ORDERED) as total_ordered,
  SUM(QUANTITY_RECEIVED) as total_received,
  ROUND(SUM(QUANTITY_RECEIVED) / SUM(QUANTITY_ORDERED) * 100, 2) as fill_rate_pct
FROM FACT_PURCHASE_ORDERS f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_ID = s.SUPPLIER_ID
WHERE YEAR(PO_DATE) = 2024
  AND PO_STATUS IN ('received', 'closed')
GROUP BY year, month, SUPPLIER_NAME
ORDER BY year, month, fill_rate_pct DESC;
```

**Definition:**  
PO Fill Rate % = (Total Quantity Received / Total Quantity Ordered) × 100

**Includes:** Only completed POs (status = 'received' or 'closed')

**Interpretation:**
- 100% = Perfect fulfillment
- >98% = Excellent
- 95-98% = Acceptable
- <95% = Requires follow-up

**Shortfall Handling:** If QUANTITY_RECEIVED < QUANTITY_ORDERED, calculate backorder % separately

**Target Benchmarks:**
- Target: ≥99%
- Acceptable: 97-99%
- Warning: 95-97%
- Critical: <95%

**2024 PO Spend Reference:** $9.3M across all suppliers

**Update Frequency:** Daily (T+1)  
**Data Source:** FACT_PURCHASE_ORDERS (QUANTITY_ORDERED, QUANTITY_RECEIVED, PO_STATUS)

---

## METRIC CALCULATION NOTES

### Exclusions & Filters (Global)
1. **Service Centre Exclusion:** All production metrics exclude:
   - Chicago
   - Munich
   - Sydney
   - Rotterdam
   
   Apply filter: `PLANT_TYPE = 'Production'` OR use explicit plant ID list

2. **Date Ranges:** All metrics default to calendar year (Jan-Dec); override per dashboard requirement

3. **Multi-Currency:** PO metrics in USD (conversion as-of PO date)

### Data Quality Warnings

| Metric | Warning | Mitigation |
|--------|---------|-----------|
| CSAT Score (2.85) | Unusually low vs. industry baseline (3.5-4.2) | Validate survey methodology; check for data entry errors |
| Defect Count (40 total in 2024) | Very low; potential underreporting | Cross-check with QC logs and warranty claims |
| OEE 87.99% | Within acceptable range; verify Availability % disaggregation | Confirm equipment downtime logging consistency |
| Labor Cost/Unit | Depends on shift mix and overtime | Use FACT_LABOR_HOURS direct source; validate allocation logic |

### Revision History

| Date | Change | Author | Status |
|------|--------|--------|--------|
| 2026-04-12 | Initial kit version | Analytics Team | DRAFT |
| TBD | UAT validation & refinement | Analytics + Business | PENDING |
| TBD | Final certification | Analytics Director | PENDING |

---

**Last Updated:** 2026-04-12  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
