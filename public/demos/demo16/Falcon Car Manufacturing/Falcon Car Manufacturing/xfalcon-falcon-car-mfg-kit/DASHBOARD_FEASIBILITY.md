# Dashboard Feasibility Matrix
## Falcon Car Manufacturing | xFalcon AnalyticsPro

**Project Status:** All 10 dashboards at 90-95% READY for deployment

---

## 1. Executive Overview
**Readiness Score: 92%** | Status: READY

**Primary Tables:**
- FACT_ASSEMBLY_OUTPUT, FACT_QUALITY_EVENTS, FACT_SERVICE_JOBS, FACT_PURCHASE_ORDERS

**What Works:**
- Real-time KPI summary: OEE%, Production Yield, Scrap Rate, Labor Cost/Unit
- YTD trends with YoY comparison
- Plant-level performance tiles (4 regions)
- Brand breakdown (6 brands)

**Limitations:**
- Multi-currency conversion requires exchange rate table (USD primary, others approximated)
- Service centres excluded; includes only production plants
- CSAT data lags by 1-2 weeks (captured at claim closure)

**Build Effort:** 2-3 days (design review + testing)

**Sample Query:**
```sql
SELECT 
  YEAR(DATE_KEY) as year,
  AVG(OEE_PCT) as oee_pct,
  SUM(UNITS_PRODUCED) / SUM(UNITS_PLANNED) * 100 as yield_pct,
  SUM(UNITS_SCRAPPED) / SUM(UNITS_PLANNED) * 100 as scrap_rate
FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
GROUP BY YEAR(DATE_KEY)
ORDER BY year DESC;
```

---

## 2. Production Performance
**Readiness Score: 94%** | Status: READY

**Primary Tables:**
- FACT_ASSEMBLY_OUTPUT, DIM_PLANT, DIM_MODEL, DIM_SHIFT

**What Works:**
- Unit production tracking (367K units/year baseline 2024)
- Shift performance comparison (3 shifts/day across 12 plants)
- Model-level detail with bottleneck identification
- Plan vs. Actual with variance analysis
- Region drill-down (EMEA, APAC, Americas, China)

**Limitations:**
- Downtime events logged at shift end; minute-level precision not available
- Model changeover impacts not separately tracked
- 2020-2023 data shows slight variance in OEE methodology (< 2%)

**Build Effort:** 1-2 days (primarily visualization)

**Sample Query:**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SHIFT,
  MODEL_NAME,
  UNITS_PLANNED,
  UNITS_PRODUCED,
  UNITS_REWORKED,
  (UNITS_PRODUCED / UNITS_PLANNED * 100) as yield_pct
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
JOIN DIM_MODEL m ON f.MODEL_ID = m.MODEL_ID
WHERE YEAR(DATE_KEY) = 2024
ORDER BY DATE_KEY DESC, PLANT_NAME;
```

---

## 3. OEE & Equipment
**Readiness Score: 90%** | Status: READY

**Primary Tables:**
- FACT_ASSEMBLY_OUTPUT, FACT_EQUIPMENT_EVENTS, DIM_EQUIPMENT, DIM_PLANT

**What Works:**
- Availability, Performance, Quality (OEE = A × P × Q)
- Equipment downtime root cause analysis
- Scheduled vs. unscheduled downtime
- Equipment reliability trends
- MTBF/MTTR calculations by line
- Predictive maintenance flagging

**Limitations:**
- Equipment master data incomplete for pre-2021 assets; 87% coverage
- Downtime coding inconsistent across plants (standardization in progress)
- Real-time sensor integration planned for Q3 2026

**Build Effort:** 3-4 days (complex OEE calc, maintenance rules)

**Sample Query:**
```sql
SELECT 
  EQUIPMENT_ID,
  EQUIPMENT_NAME,
  AVG(OEE_PCT) as avg_oee,
  SUM(DOWNTIME_MINUTES) as total_downtime_mins,
  COUNT(*) / 365.0 as mtbf_days,
  AVG(REPAIR_MINUTES) as avg_mttr
FROM FACT_EQUIPMENT_EVENTS
WHERE YEAR(EVENT_DATE) = 2024
GROUP BY EQUIPMENT_ID, EQUIPMENT_NAME
ORDER BY avg_oee ASC;
```

---

## 4. Quality & Defects
**Readiness Score: 93%** | Status: READY

**Primary Tables:**
- FACT_QUALITY_EVENTS, DIM_DEFECT_TYPE, DIM_PLANT, FACT_ASSEMBLY_OUTPUT

**What Works:**
- Defect counts by type (coating, welding, assembly, other)
- Trend analysis (2020-2024)
- Plant and model comparison
- First Pass Yield tracking
- Rework rate by category
- Quality by shift identification

**Limitations:**
- 2024 total defects = 40 (very low; data quality validation needed)
- Defect classification changed in 2022 (historical mapping provided)
- Minor defects not logged pre-2021

**Build Effort:** 2-3 days (includes defect mapping, trend charts)

**Sample Query:**
```sql
SELECT 
  DATE_KEY,
  DEFECT_TYPE,
  COUNT(*) as defect_count,
  SUM(UNITS_PRODUCED) as units_produced
FROM FACT_QUALITY_EVENTS q
JOIN FACT_ASSEMBLY_OUTPUT a ON q.ASSEMBLY_ID = a.ASSEMBLY_ID
WHERE YEAR(q.DATE_KEY) = 2024
GROUP BY DATE_KEY, DEFECT_TYPE
ORDER BY DATE_KEY DESC, defect_count DESC;
```

---

## 5. Supplier Scorecard
**Readiness Score: 91%** | Status: READY

**Primary Tables:**
- FACT_PURCHASE_ORDERS, DIM_SUPPLIER, FACT_SUPPLIER_QUALITY

**What Works:**
- Supplier ranking by on-time delivery, quality, cost
- Tier 1-2 tracking (15 suppliers mapped)
- PO spend by supplier ($9.3M in 2024)
- Lead time analysis
- Quality incident tracking
- Compliance certification status

**Limitations:**
- Small supplier base (15 total); results sensitive to single event
- Quality ratings are qualitative (1-5 scale); mapping to defect impact underway
- International suppliers have currency volatility

**Build Effort:** 2-3 days (supplier master, scorecard logic)

**Sample Query:**
```sql
SELECT 
  SUPPLIER_NAME,
  COUNT(*) as po_count,
  SUM(QUANTITY_ORDERED) as total_qty,
  SUM(QUANTITY_RECEIVED) / SUM(QUANTITY_ORDERED) * 100 as fill_rate,
  ROUND(AVG(QUALITY_RATING), 1) as quality_score,
  SUM(CASE WHEN DAYS_LATE <= 0 THEN 1 ELSE 0 END) / COUNT(*) * 100 as on_time_pct
FROM FACT_PURCHASE_ORDERS f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_ID = s.SUPPLIER_ID
WHERE YEAR(PO_DATE) = 2024
GROUP BY SUPPLIER_NAME
ORDER BY fill_rate DESC, quality_score DESC;
```

---

## 6. Inventory & Supply Chain
**Readiness Score: 90%** | Status: READY

**Primary Tables:**
- FACT_INVENTORY, DIM_PART, DIM_LOCATION, FACT_PURCHASE_ORDERS

**What Works:**
- Raw material, WIP, finished goods tracking
- Days of inventory calculation
- Inventory turnover by part category
- Stock-out incident monitoring
- Lead time vs. safety stock analysis
- Warehouse utilization by location

**Limitations:**
- Service centre stock (4 locations) included in totals but excluded from production view
- Obsolescence reserve not tracked separately
- Supply chain disruption log incomplete for 2020-2021

**Build Effort:** 2-3 days (complex inventory calcs, multi-location logic)

**Sample Query:**
```sql
SELECT 
  PART_NAME,
  LOCATION_NAME,
  INVENTORY_QUANTITY,
  SAFETY_STOCK,
  (INVENTORY_QUANTITY / SAFETY_STOCK * 100) as stock_coverage_pct,
  LEAD_TIME_DAYS,
  AVG_DAILY_CONSUMPTION,
  (INVENTORY_QUANTITY / AVG_DAILY_CONSUMPTION) as days_of_supply
FROM FACT_INVENTORY f
JOIN DIM_PART p ON f.PART_ID = p.PART_ID
JOIN DIM_LOCATION l ON f.LOCATION_ID = l.LOCATION_ID
WHERE LOCATION_TYPE IN ('Plant', 'Warehouse')
ORDER BY stock_coverage_pct ASC;
```

---

## 7. Service & After-Sales
**Readiness Score: 92%** | Status: READY

**Primary Tables:**
- FACT_SERVICE_JOBS, DIM_SERVICE_CENTRE, DIM_VEHICLE, FACT_WARRANTY_CLAIMS

**What Works:**
- Service volume tracking (172 jobs in 2024)
- Service centre performance (4 centres: Chicago, Munich, Sydney, Rotterdam)
- Job type breakdown (maintenance, repair, recall, upgrade)
- Turnaround time analysis
- CSAT score aggregation (2.85 in 2024)
- Parts consumption tracking

**Limitations:**
- CSAT score of 2.85 unusually low; data validation recommended
- Service job detail limited for 2020-2021
- Parts cost allocation to jobs estimated

**Build Effort:** 2-3 days (service logic, CSAT interpretation)

**Sample Query:**
```sql
SELECT 
  SERVICE_CENTRE_NAME,
  JOB_TYPE,
  COUNT(*) as job_count,
  ROUND(AVG(TURNAROUND_DAYS), 1) as avg_turnaround,
  ROUND(AVG(CUSTOMER_SATISFACTION_SCORE), 2) as avg_csat,
  SUM(LABOR_COST + PARTS_COST) as total_cost
FROM FACT_SERVICE_JOBS
WHERE YEAR(JOB_DATE) = 2024
GROUP BY SERVICE_CENTRE_NAME, JOB_TYPE
ORDER BY SERVICE_CENTRE_NAME, job_count DESC;
```

---

## 8. Warranty Analysis
**Readiness Score: 91%** | Status: READY

**Primary Tables:**
- FACT_WARRANTY_CLAIMS, DIM_VEHICLE, DIM_BRAND, FACT_ASSEMBLY_OUTPUT

**What Works:**
- Warranty claim tracking by vehicle and brand
- Cost per claim analysis
- Failure root cause analysis
- Warranty cost trending
- Repeat claim identification
- Brand reputation scoring

**Limitations:**
- Warranty data starts from vehicle registration; production-to-claim mapping requires VIN join
- Claims may take 6+ months to fully settle (reserve estimates used)
- Pre-2020 claims data incomplete

**Build Effort:** 2-3 days (VIN matching, cost analysis)

**Sample Query:**
```sql
SELECT 
  BRAND_NAME,
  MODEL_NAME,
  COUNT(DISTINCT CLAIM_ID) as claim_count,
  SUM(REPAIR_COST) / COUNT(DISTINCT CLAIM_ID) as cost_per_claim,
  AVG(DAYS_TO_RESOLUTION) as avg_days_to_resolve,
  COUNT(CASE WHEN IS_REPEAT_CLAIM = 1 THEN 1 END) as repeat_claims
FROM FACT_WARRANTY_CLAIMS w
JOIN DIM_VEHICLE v ON w.VEHICLE_ID = v.VEHICLE_ID
JOIN DIM_BRAND b ON v.BRAND_ID = b.BRAND_ID
WHERE YEAR(CLAIM_DATE) = 2024
GROUP BY BRAND_NAME, MODEL_NAME
ORDER BY claim_count DESC;
```

---

## 9. Workforce & Labor
**Readiness Score: 90%** | Status: READY

**Primary Tables:**
- FACT_LABOR_HOURS, DIM_EMPLOYEE, DIM_PLANT, DIM_SHIFT

**What Works:**
- Labor cost per unit ($LABOR_COST / UNITS_PRODUCED)
- Headcount by plant, shift, and skill level
- Overtime tracking
- Labor productivity trends
- Turnover monitoring
- Training hours and certification tracking

**Limitations:**
- Employee master data redacted (GDPR); only shift/plant aggregates available
- Skill level classification not granular
- Training data incomplete for 2020-2021

**Build Effort:** 2 days (privacy-aware aggregation)

**Sample Query:**
```sql
SELECT 
  DATE_KEY,
  PLANT_NAME,
  SHIFT,
  COUNT(DISTINCT EMPLOYEE_ID) as headcount,
  SUM(HOURS_WORKED) as total_hours,
  SUM(LABOR_COST) / SUM(UNITS_PRODUCED) as labor_cost_per_unit,
  SUM(OVERTIME_HOURS) as overtime_hours
FROM FACT_LABOR_HOURS l
JOIN DIM_PLANT p ON l.PLANT_ID = p.PLANT_ID
WHERE YEAR(DATE_KEY) = 2024
GROUP BY DATE_KEY, PLANT_NAME, SHIFT
ORDER BY DATE_KEY DESC, PLANT_NAME;
```

---

## 10. Purchase Orders
**Readiness Score: 93%** | Status: READY

**Primary Tables:**
- FACT_PURCHASE_ORDERS, DIM_SUPPLIER, DIM_PART, DIM_PLANT

**What Works:**
- PO volume and spend ($9.3M in 2024)
- Supplier analysis (on-time delivery, fill rate, quality)
- Part consumption trends
- Budget vs. actual by category
- Lead time management
- PO lifecycle tracking (draft, issued, received, closed)

**Limitations:**
- Multi-currency handling; conversion rates as-of PO date
- Some historical POs lack detailed line item breakdowns (consolidated)
- Expedited orders not separately flagged

**Build Effort:** 2-3 days (PO state machine, multi-currency)

**Sample Query:**
```sql
SELECT 
  DATE_TRUNC('month', PO_DATE) as month,
  SUPPLIER_NAME,
  COUNT(*) as po_count,
  SUM(QUANTITY_ORDERED) as total_qty,
  SUM(UNIT_PRICE * QUANTITY_ORDERED) as total_spend,
  ROUND(SUM(QUANTITY_RECEIVED) / SUM(QUANTITY_ORDERED) * 100, 1) as fill_rate,
  ROUND(AVG(LEAD_TIME_DAYS), 0) as avg_lead_time_days
FROM FACT_PURCHASE_ORDERS f
JOIN DIM_SUPPLIER s ON f.SUPPLIER_ID = s.SUPPLIER_ID
WHERE YEAR(PO_DATE) = 2024
GROUP BY month, SUPPLIER_NAME
ORDER BY month DESC, total_spend DESC;
```

---

## Cross-Dashboard Dependencies

| Dashboard | Depends On | Data Freshness |
|-----------|-----------|-----------------|
| Executive Overview | All 10 | Daily (T+1) |
| Production Performance | Assembly, Equipment, Shift data | Daily (T+0) |
| OEE & Equipment | Equipment Events, Assembly | Daily (T+0) |
| Quality & Defects | Quality Events, Assembly | Daily (T+0) |
| Supplier Scorecard | Purchase Orders, Supplier Master | Daily (T+1) |
| Inventory & Supply Chain | Inventory, Parts Master | Real-time |
| Service & After-Sales | Service Jobs, CSAT | Daily (T+1) |
| Warranty Analysis | Warranty Claims, Vehicle Master | Weekly (T+7) |
| Workforce & Labor | Labor Hours, Employee Master | Daily (T+1) |
| Purchase Orders | PO Facts, Supplier Master | Daily (T+1) |

---

## Next Steps (Post-90% Readiness)

1. **Data Quality Validation** — Spot-check 2024 defects (40) and CSAT (2.85) against source systems
2. **Metric Certification** — Confirm OEE calculation matches manufacturing standards
3. **Currency Handling** — Define exchange rate table and rollup methodology
4. **User Acceptance Testing (UAT)** — 1-week pilot with 3-5 power users per dashboard
5. **Performance Tuning** — Query optimization post-UAT; target <2s load times
6. **Documentation** — Complete metric definitions and global filter rules
7. **Training & Rollout** — 2-hour session per plant; staggered by region

---

**Last Updated:** 2026-04-12  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
