# Validation Benchmarks & Data Quality Standards
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Known reference values, sanity check thresholds, and data quality validation rules for 2024 production year.

---

## PRIMARY BENCHMARKS (2024 Calendar Year)

### Production Volume
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Total Production** | 367,383 | units | BASELINE | Definitive; use to validate fact table row counts |
| **Average per Plant** | 30,615 | units/plant/year | CALCULATED | 367,383 ÷ 12 plants |
| **Average per Month** | 30,615 | units/month | CALCULATED | 367,383 ÷ 12 months |
| **Average per Day** | ~1,006 | units/day | CALCULATED | 367,383 ÷ 365 days |
| **Target (Plan)** | 370,000 | units | BUDGET | Realized yield 99.3% |

**Validation Query:**
```sql
SELECT 
  YEAR(DATE_KEY) as year,
  COUNT(DISTINCT DATE_KEY) as days,
  SUM(UNITS_PRODUCED) as total_units,
  ROUND(SUM(UNITS_PRODUCED) / COUNT(DISTINCT DATE_KEY), 0) as avg_units_per_day
FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
  AND YEAR(DATE_KEY) = 2024
GROUP BY YEAR(DATE_KEY);
```

**Expected Result:** ~367,383 units total (tolerance: ±2%, i.e., 360K-375K acceptable)

---

### OEE Performance
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Average OEE** | 87.99% | % | BASELINE | 2024 calendar year average |
| **Target OEE** | >90% | % | TARGET | World-class manufacturing standard |
| **Acceptable Range** | 85-90% | % | RANGE | Above: excellent, Below: investigate |
| **Red Alert Threshold** | <80% | % | ALERT | Escalate to plant management |

**Validation Query:**
```sql
SELECT 
  YEAR(DATE_KEY) as year,
  ROUND(AVG(OEE_PCT), 2) as avg_oee_pct,
  MIN(OEE_PCT) as min_oee,
  MAX(OEE_PCT) as max_oee,
  COUNT(*) as data_points
FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
  AND YEAR(DATE_KEY) = 2024
GROUP BY YEAR(DATE_KEY);
```

**Expected Result:** 87.99% ± 0.5% (87.5-88.5% indicates data consistency)

**Component Breakdown (if available):**
- **Availability:** ~92% (downtime rate ~8%)
- **Performance:** ~97% (cycle time efficiency)
- **Quality:** ~99% (defect/rework impact <1%)

---

### Quality Metrics

#### Defect Count
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Total Defects (2024)** | 40 | count | BASELINE | RED FLAG: Unusually low |
| **Defect Rate (implied)** | ~0.01% | % | CALCULATED | 40 ÷ 367,383 = 0.0109% |
| **Industry Benchmark** | 0.5-1.5% | % | REFERENCE | Typical for high-volume automotive |
| **Six-Sigma Target** | <0.0007% | % | TARGET | <3.4 defects per 1M units |

**Data Quality Alert:**  
The 2024 defect count of 40 is suspiciously low. Cross-validate against:
1. Quality event logging completeness (are minor defects being captured?)
2. Scrap rate calculation (should align with defects)
3. Warranty claims by manufacture date (delta indicates detection lag)
4. Rework volume (should exceed defects if rework-eligible)

**Validation Query:**
```sql
SELECT 
  YEAR(DATE_KEY) as year,
  COUNT(*) as defect_count,
  COUNT(*) / (SELECT SUM(UNITS_PRODUCED) FROM FACT_ASSEMBLY_OUTPUT 
              WHERE YEAR(DATE_KEY) = 2024) * 100 as defect_rate_pct,
  COUNT(DISTINCT DEFECT_TYPE) as defect_types
FROM FACT_QUALITY_EVENTS
WHERE YEAR(DATE_KEY) = 2024
GROUP BY YEAR(DATE_KEY);
```

**Expected Result:** 40 defects (if validated), or higher (if missing data)

---

#### Scrap & Rework
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Scrap Rate** | <0.5% | % | TARGET | Implied from 40 defects; validate separately |
| **Rework Rate** | 2-5% | % | ACCEPTABLE | Units requiring repair after initial QC |
| **Scrap + Rework** | 2.5-5.5% | % | COMBINED | Total non-conformance |

**Validation Logic:**
```
If Defects = 40 units AND Scrap + Rework must >100 units:
  → 40 is suspicious; check UNITS_SCRAPPED and UNITS_REWORKED directly
```

---

### Service & Warranty Metrics

#### Service Job Volume
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Total Jobs (2024)** | 172 | count | BASELINE | 4 service centres combined |
| **Jobs per Centre (avg)** | 43 | count | CALCULATED | 172 ÷ 4 centres |
| **Vehicles in Service (estimated)** | ~1.85M | vehicles | CONTEXT | 2020-2024 cumulative |
| **Service Penetration Rate** | ~0.009% | % | CALCULATED | 172 ÷ 1.85M vehicles |

**Assessment:** Low service volume consistent with new production (vehicles 2020+) still under warranty. Not a concern.

**Validation Query:**
```sql
SELECT 
  YEAR(JOB_DATE) as year,
  SERVICE_CENTRE_NAME,
  COUNT(*) as job_count,
  ROUND(AVG(LABOR_COST + PARTS_COST), 2) as avg_job_cost
FROM FACT_SERVICE_JOBS
WHERE YEAR(JOB_DATE) = 2024
GROUP BY YEAR(JOB_DATE), SERVICE_CENTRE_NAME
ORDER BY SERVICE_CENTRE_NAME;
```

**Expected Result:** ~172 total jobs (tolerance: ±5%, i.e., 163-181 acceptable)

---

#### CSAT Score (CRITICAL ALERT)
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **2024 Average CSAT** | 2.85 | /5.0 | RED ALERT | Far below industry standard |
| **Expected Range** | 3.8-4.2 | /5.0 | INDUSTRY | Luxury: 4.0-4.5, Standard: 3.5-4.0 |
| **Excellent** | >4.0 | /5.0 | TARGET | Action: Immediate root cause analysis |
| **Poor** | <3.0 | /5.0 | CRITICAL | Action: Escalate to service leadership |

**Data Quality Issues (Probable Causes):**
1. **Survey Bias:** Low response rate; only dissatisfied customers completing survey
2. **Methodology Change:** Different scale or survey timing introduced in 2024
3. **Data Entry Error:** Scores transposed (e.g., 4.5 recorded as 2.85) or negative impact
4. **Business Issue:** Genuine service quality degradation requiring investigation

**Required Actions:**
- [ ] Cross-reference CSAT 2.85 with source system (service management platform)
- [ ] Compare 2023 CSAT score (trend analysis)
- [ ] Review service job satisfaction distribution (is it 40% 1-star, 60% 5-star, or genuinely modal at 2.85?)
- [ ] Interview service centre managers for context
- [ ] DO NOT publish this metric to stakeholders until validated

**Validation Query:**
```sql
SELECT 
  YEAR(JOB_DATE) as year,
  SERVICE_CENTRE_NAME,
  ROUND(AVG(CUSTOMER_SATISFACTION_SCORE), 2) as avg_csat,
  ROUND(STDDEV(CUSTOMER_SATISFACTION_SCORE), 2) as stddev_csat,
  COUNT(*) as job_count,
  MIN(CUSTOMER_SATISFACTION_SCORE) as min_score,
  MAX(CUSTOMER_SATISFACTION_SCORE) as max_score
FROM FACT_SERVICE_JOBS
WHERE YEAR(JOB_DATE) = 2024
GROUP BY YEAR(JOB_DATE), SERVICE_CENTRE_NAME;
```

---

### Purchase Orders & Procurement

#### PO Volume & Spend
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **Total PO Spend (2024)** | $9.3M | USD | BASELINE | All suppliers, all parts |
| **Total POs** | ~2,800 | count | CALCULATED | ~$9.3M ÷ ~$3,300 avg PO |
| **Suppliers** | 15 | count | REFERENCE | Tier 1-2 only; exclude indirect |
| **Average PO Value** | $3,321 | USD | CALCULATED | $9.3M ÷ 2,800 |

**Validation Query:**
```sql
SELECT 
  YEAR(PO_DATE) as year,
  COUNT(DISTINCT PO_ID) as po_count,
  COUNT(DISTINCT SUPPLIER_ID) as supplier_count,
  ROUND(SUM(QUANTITY_ORDERED * UNIT_PRICE), 0) as total_spend_usd,
  ROUND(AVG(QUANTITY_ORDERED * UNIT_PRICE), 0) as avg_po_value
FROM FACT_PURCHASE_ORDERS
WHERE YEAR(PO_DATE) = 2024
GROUP BY YEAR(PO_DATE);
```

**Expected Result:** $9.3M ± 10% (i.e., $8.37M - $10.23M acceptable)

---

#### PO Performance
| Metric | Value | Unit | Status | Notes |
|--------|-------|------|--------|-------|
| **On-Time Delivery** | >95% | % | TARGET | Industry standard; see Supplier Scorecard |
| **Fill Rate** | >99% | % | TARGET | Quantity received vs. ordered |
| **Average Lead Time** | 30-45 | days | RANGE | Varies by supplier and part type |

---

## DATA QUALITY RULES (SLA)

### Completeness

| Table | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| FACT_ASSEMBLY_OUTPUT | Non-NULL DATE_KEY | 100% | Missing dates = exclude from analysis |
| FACT_ASSEMBLY_OUTPUT | Non-NULL UNITS_PRODUCED | 100% | Missing production = data error |
| FACT_QUALITY_EVENTS | Non-NULL DEFECT_TYPE | 95% | <95% indicates incomplete logging |
| FACT_SERVICE_JOBS | Non-NULL CUSTOMER_SATISFACTION_SCORE | 80% | <80% = insufficient CSAT coverage |
| FACT_PURCHASE_ORDERS | Non-NULL SUPPLIER_ID | 99% | <99% = orphaned records |

### Accuracy (Logical Validation)

| Rule | Validation | Query |
|------|-----------|-------|
| Production Constraint | UNITS_PRODUCED ≥ UNITS_REWORKED | `UNITS_PRODUCED < UNITS_REWORKED` = ERROR |
| Production Constraint | UNITS_PRODUCED ≥ UNITS_SCRAPPED | `UNITS_PRODUCED < UNITS_SCRAPPED` = ERROR |
| Yield Logic | UNITS_PLANNED ≥ UNITS_PRODUCED | `UNITS_PLANNED < UNITS_PRODUCED` = WARNING |
| Date Constraint | PO_DATE ≤ ACTUAL_DELIVERY_DATE | `PO_DATE > ACTUAL_DELIVERY_DATE` = ERROR |
| CSAT Range | 1.0 ≤ CUSTOMER_SATISFACTION_SCORE ≤ 5.0 | Out-of-range = data entry error |
| Quality Rating | 1.0 ≤ QUALITY_RATING ≤ 5.0 | Out-of-range = data entry error |

**Automated Check (SQL):**
```sql
-- Data quality audit
SELECT 
  'FACT_ASSEMBLY_OUTPUT' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT DATE_KEY) as distinct_dates,
  SUM(CASE WHEN UNITS_PRODUCED < UNITS_REWORKED THEN 1 ELSE 0 END) as produced_lt_rework_errors,
  SUM(CASE WHEN UNITS_PRODUCED < UNITS_SCRAPPED THEN 1 ELSE 0 END) as produced_lt_scrap_errors,
  SUM(CASE WHEN UNITS_PRODUCED = 0 AND UNITS_PLANNED > 0 THEN 1 ELSE 0 END) as zero_production_rows
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024;
```

---

### Timeliness

| Table | Expected Refresh | Tolerance | Alert If Late |
|-------|-----------------|-----------|----------------|
| FACT_ASSEMBLY_OUTPUT | Daily, T+0 (EOD) | ±4 hours | >T+6 hours |
| FACT_QUALITY_EVENTS | Daily, T+0 | ±4 hours | >T+6 hours |
| FACT_SERVICE_JOBS | Daily, T+1 | ±12 hours | >T+3 days |
| FACT_WARRANTY_CLAIMS | Weekly, T+7 | ±2 days | >T+10 days |
| FACT_PURCHASE_ORDERS | Daily, T+1 | ±12 hours | >T+3 days |

---

## OUTLIER & ANOMALY DETECTION

### OEE Anomalies
**Alert Trigger:** OEE_PCT < 80% for any shift/plant/day

```sql
SELECT 
  DATE_KEY, PLANT_NAME, SHIFT, OEE_PCT
FROM FACT_ASSEMBLY_OUTPUT
WHERE OEE_PCT < 80
  AND YEAR(DATE_KEY) = 2024
ORDER BY OEE_PCT ASC;
```

**Investigation:** If OEE <80%, escalate to plant management and equipment team

---

### Production Drop Anomalies
**Alert Trigger:** Daily units >20% below 30-day rolling average

```sql
SELECT 
  DATE_KEY, PLANT_NAME,
  UNITS_PRODUCED,
  AVG(UNITS_PRODUCED) OVER (
    PARTITION BY PLANT_NAME 
    ORDER BY DATE_KEY 
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) as rolling_30_day_avg
FROM FACT_ASSEMBLY_OUTPUT
WHERE YEAR(DATE_KEY) = 2024
  AND UNITS_PRODUCED < (
    AVG(UNITS_PRODUCED) OVER (
      PARTITION BY PLANT_NAME 
      ORDER BY DATE_KEY 
      ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) * 0.8
  );
```

**Investigation:** Check for scheduled downtime, holiday, or unscheduled maintenance

---

### Supplier Performance Anomalies
**Alert Trigger:** PO delivery >7 days late OR fill rate <95%

```sql
SELECT 
  SUPPLIER_NAME, PO_ID,
  DAYS_LATE,
  QUANTITY_ORDERED,
  QUANTITY_RECEIVED,
  (QUANTITY_RECEIVED / QUANTITY_ORDERED * 100) as fill_rate_pct
FROM FACT_PURCHASE_ORDERS
WHERE YEAR(PO_DATE) = 2024
  AND (DAYS_LATE > 7 OR QUANTITY_RECEIVED / QUANTITY_ORDERED < 0.95)
ORDER BY DAYS_LATE DESC;
```

**Action:** Contact supplier for root cause; escalate if repeat occurrence

---

## DATA RECONCILIATION CHECKLIST

### Monthly Reconciliation (1st Business Day of Month)

- [ ] **Production Volume:** Total units in warehouse ≈ manufacturing system ± 0.5%
- [ ] **Financial:** Total PO spend in warehouse ≈ accounting ledger ± 1%
- [ ] **Quality:** Defect count + warranty claims (by month produced) reconcile
- [ ] **Labor:** Total hours × wage rate ≈ payroll ledger ± 2%
- [ ] **Inventory:** EOD stock counts ≈ warehouse system ± 3% (shrink acceptable)

### Quarterly Reconciliation (After Month-End Close)

- [ ] **YTD Production:** Sum of 3 months matches forecast ± 2%
- [ ] **YTD OEE:** Rolling 3-month average ≥85%
- [ ] **YTD Warranty:** Cost per claim trend stable (no 50%+ swings)
- [ ] **CSAT Trend:** No unexplained 1-point drops (investigate if occurs)

### Annual Reconciliation (December)

- [ ] **Annual Production:** 367,383 units (2024 definitive count)
- [ ] **Annual OEE:** 87.99% average (validate methodology consistency)
- [ ] **Annual Spend:** $9.3M in POs
- [ ] **Service Load:** 172 jobs across 4 centres
- [ ] **Data Completeness:** No missing months, all plants present

---

## BENCHMARK NOTES & CAVEATS

### 2024 Production (367,383 units)
**Source:** Definitive count from manufacturing ledger  
**Includes:** All 6 brands, 18 models, 12 production plants, 2020-2024 vehicle production  
**Excludes:** Service centres (after-sales only)

### OEE 87.99%
**Source:** Aggregated from daily shift records (FACT_ASSEMBLY_OUTPUT.OEE_PCT)  
**Note:** Methodology may have changed 2020-2021; historical comparison flagged in documentation  
**Confidence:** HIGH (consistent with equipment monitoring data)

### Defects (40 total)
**Source:** FACT_QUALITY_EVENTS logged at production QC stations  
**Alert:** Suspiciously low; requires validation against warranty and scrap rate  
**Confidence:** LOW until cross-checked

### Service Jobs (172 total)
**Source:** Service management system (4 centres: Chicago, Munich, Sydney, Rotterdam)  
**Note:** Low volume consistent with young fleet (vehicles 2020+, still in warranty)  
**Confidence:** MEDIUM (low absolute volume makes % changes significant)

### CSAT (2.85 / 5.0)
**Source:** Post-service job customer survey  
**Alert:** Far below industry baseline (3.5-4.2); probable data or process issue  
**Confidence:** VERY LOW; DO NOT USE until validated  
**Action:** Root cause analysis mandatory before publication

### PO Spend ($9.3M)
**Source:** Purchase order system, converted to USD  
**Includes:** Parts and materials from 15 tier 1-2 suppliers  
**Currency:** Primary USD; some suppliers in EUR, JPY (conversion rates as-of PO date)  
**Confidence:** MEDIUM (currency conversion assumptions may vary ±2-3%)

---

## VALIDATION TESTING ROADMAP

### Phase 1: Pre-Dashboard Launch (Week 1-2)
1. Run all validation queries above; document results
2. Reconcile 2024 benchmarks with source systems
3. Flag CSAT (2.85) and Defect (40) for business validation
4. Confirm service centre exclusion logic

### Phase 2: UAT (Week 3-4)
1. Power users verify KPI calculations match their expectations
2. Test filter combinations; ensure results are sensible
3. Spot-check monthly trends (Dec vs. Nov, etc.)

### Phase 3: Post-Launch (Month 1)
1. Weekly data quality audit (completeness, accuracy, timeliness)
2. Monthly reconciliation to source systems
3. Monitor anomaly alerts (OEE <80%, production drops >20%)

---

**Last Updated:** 2026-04-12  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing  
**Status:** DRAFT — Awaiting data validation
