# xFalcon Falcon Car Manufacturing Analytics Kit
**Project Skill Card**

---

## PROJECT SUMMARY

**Name:** Falcon Car Manufacturing | xFalcon AnalyticsPro  
**Domain:** Manufacturing Analytics  
**Organizations:** 6 brands (Toyota, Honda, Ford, BMW, Mercedes, Volkswagen)  
**Scope:** 12 production plants (4 regions), 18 vehicle models, 15 tier 1-2 suppliers  
**Data Period:** 2020-2024, ~370K units/year, ~88% OEE  
**Deliverables:** 10 interactive dashboards + analytics kit documentation  

---

## QUICK START

### 1. Access the Kit
All files located in: `/sessions/affectionate-eager-thompson/mnt/Falcon Car Manufacturing/xfalcon-falcon-car-mfg-kit/`

**Files in Kit:**
1. **DASHBOARD_FEASIBILITY.md** — All 10 dashboards at 90-95% READY
2. **DATA_SCHEMA_MAP.md** — 8 fact tables + 7 dimensions, column mappings
3. **RETAILEDGE_THEME.md** — Dark Blue (#1B3A5C) + Orange (#E87722) color spec
4. **METRIC_DEFINITIONS.md** — 14 KPI formulas with SQL
5. **GLOBAL_FILTERS.md** — Year, Plant, Brand, Model, Shift filters
6. **VALIDATION_BENCHMARKS.md** — 2024 baseline values (367K units, 87.99% OEE)
7. **SETUP_GUIDE.md** — 4-phase deployment roadmap (3 weeks)
8. **SKILL.md** — This file

### 2. Use This Skill
This skill provides:
- IDA SQL query templates for all 10 dashboards
- Column name mappings (common gotchas)
- Theme specification for dashboard styling
- Troubleshooting guides for common issues

### 3. Build Dashboards
Follow SETUP_GUIDE.md phases:
1. **Phase 1: Setup** (Days 1-2) — Data validation, BI platform config
2. **Phase 2: Build** (Days 3-10) — Create 10 dashboards, apply theme
3. **Phase 3: Test** (Days 11-14) — UAT, data quality checks
4. **Phase 4: Deploy** (Days 15-18) — Production launch, training

---

## IDA CONNECTOR INFO

### Data Warehouse Connection
**Type:** SQL Server / PostgreSQL / Cloud Warehouse  
**Tables:** 8 fact + 7 dimension (star schema)  
**Grain:** Daily production, event-level quality/equipment, transaction-level PO

### Row Counts (2024 Calendar Year)
| Table | 2024 Rows | Total (2020-2024) |
|-------|-----------|-------------------|
| FACT_ASSEMBLY_OUTPUT | ~297K | ~1.3M |
| FACT_QUALITY_EVENTS | 40 | ~8K |
| FACT_EQUIPMENT_EVENTS | ~438K | ~2.2M |
| FACT_SERVICE_JOBS | 172 | ~860 |
| FACT_WARRANTY_CLAIMS | ~7K | ~50K |
| FACT_PURCHASE_ORDERS | ~560K | ~2.8M |
| FACT_LABOR_HOURS | ~44K | ~219K |
| FACT_INVENTORY | ~300K | ~1.5M |

### Column Name Gotchas

**Commonly Confused Columns:**

| Confusion | Correct Column | Notes |
|-----------|----------------|-------|
| "Production quantity" | UNITS_PRODUCED (not UNITS_PLANNED) | Units actually made; UNITS_PLANNED is target |
| "Scrap vs. rework" | UNITS_SCRAPPED (non-recoverable) vs. UNITS_REWORKED (fixable) | Scrap = destroyed; rework = repair & re-test |
| "OEE calculation" | Use pre-computed OEE_PCT column (A×P×Q already done) | Don't recalculate; validate methodology instead |
| "Delivery status" | ACTUAL_DELIVERY_DATE vs. PO_DATE + LEAD_TIME_DAYS = expected | DAYS_LATE = actual minus expected |
| "Plant filter" | PLANT_TYPE = 'Production' (exclude service centres) | Chicago, Munich, Sydney, Rotterdam = service only |
| "Service centre" | SERVICE_CENTRE_ID (separate dimension) not PLANT_ID | Service jobs in FACT_SERVICE_JOBS, not FACT_ASSEMBLY_OUTPUT |
| "VIN mapping" | No VIN in FACT_ASSEMBLY_OUTPUT; use DIM_VEHICLE.VIN | Join via PLANT_ID + DATE_KEY + MODEL_ID + sequence |
| "Date column naming" | DATE_KEY (assembly) vs. JOB_DATE (service) vs. PO_DATE (orders) | Consistent YYYY-MM-DD format across all |

### Common Query Errors

**Error 1: Service centres included in production metrics**
```sql
-- WRONG:
SELECT SUM(UNITS_PRODUCED) FROM FACT_ASSEMBLY_OUTPUT
-- Returns: Includes data from Chicago (service-only location)

-- RIGHT:
SELECT SUM(UNITS_PRODUCED) FROM FACT_ASSEMBLY_OUTPUT
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
-- OR
WHERE PLANT_TYPE = 'Production'
```

**Error 2: OEE calculation instead of using pre-computed**
```sql
-- WRONG (unnecessary):
SELECT AVAILABILITY * PERFORMANCE * QUALITY / 100 / 100 / 100 as OEE_PCT
-- Risk: Methodology may differ from source system

-- RIGHT:
SELECT OEE_PCT FROM FACT_ASSEMBLY_OUTPUT
-- Pre-calculated; validated with equipment monitoring
```

**Error 3: Double-counting rework**
```sql
-- WRONG:
SELECT SUM(UNITS_SCRAPPED) + SUM(UNITS_REWORKED) as total_defects
-- Risk: Rework units may become good units again (not lost)

-- RIGHT:
SELECT COUNT(*) as defect_events FROM FACT_QUALITY_EVENTS
-- Counts quality events (actual defect records)
```

**Error 4: Multi-currency PO spending without conversion**
```sql
-- WRONG:
SELECT SUM(QUANTITY_ORDERED * UNIT_PRICE) FROM FACT_PURCHASE_ORDERS
-- Risk: Mixes USD, EUR, JPY without conversion

-- RIGHT:
SELECT SUM(QUANTITY_ORDERED * UNIT_PRICE * EXCHANGE_RATE) FROM FACT_PURCHASE_ORDERS
-- Join to daily exchange rate table
-- OR filter to CURRENCY = 'USD' and use original prices
```

---

## THEME SPECIFICATION

### Color Palette
| Element | Color | Hex | Use |
|---------|-------|-----|-----|
| Primary Brand | Falcon Orange | #E87722 | KPI highlights, CTA buttons |
| Secondary Brand | Falcon Blue | #1B3A5C | Topbar, headers, serious metrics |
| Background | Light Gray | #F3F4F6 | Dashboard background |
| Card | White | #FFFFFF | Card surfaces |
| Chart Primary | Falcon Blue | #1B3A5C | Main series (OEE, Yield) |
| Chart Secondary | Falcon Orange | #E87722 | Plan vs. Actual |
| Status Positive | Green | #059669 | On-track, good performance |
| Status Negative | Red | #D32F2F | At-risk, below target |

### Typography
- **Font:** Inter (Google Fonts)
- **KPI Values:** 28px, 700 weight, Falcon Blue
- **KPI Labels:** 12px, 600 weight, uppercase, Medium Slate
- **Card Titles:** 16px, 700 weight, Dark Slate
- **Body Text:** 14px, 400 weight, Dark Slate
- **Axis Labels:** 12px, 400 weight, Medium Slate

### CSS Variables
```css
--color-brand-orange: #E87722;
--color-brand-blue: #1B3A5C;
--color-bg-primary: #F3F4F6;
--color-bg-secondary: #FFFFFF;
--color-text-primary: #1E293B;
--color-text-secondary: #64748B;
--color-status-positive: #059669;
--color-status-negative: #D32F2F;
--font-family: 'Inter', sans-serif;
```

See **RETAILEDGE_THEME.md** for complete CSS variable block and component styling.

---

## KEY METRICS (14 KPIs)

### Production Metrics
1. **OEE %** = AVG(OEE_PCT) from FACT_ASSEMBLY_OUTPUT | Target: >90%
2. **Production Yield %** = SUM(UNITS_PRODUCED) / SUM(UNITS_PLANNED) × 100 | Target: >98%
3. **Scrap Rate %** = SUM(UNITS_SCRAPPED) / SUM(UNITS_PLANNED) × 100 | Target: <0.5%
4. **Rework Rate %** = SUM(UNITS_REWORKED) / SUM(UNITS_PRODUCED) × 100 | Target: <2%
5. **First Pass Yield %** = (UNITS_PRODUCED - UNITS_REWORKED) / UNITS_PRODUCED × 100 | Target: >98%

### Procurement Metrics
6. **Plan Attainment %** = SUM(ACTUAL) / SUM(PLANNED) × 100 | Target: >95%
7. **Supplier On-Time Delivery %** = COUNT(DAYS_LATE ≤ 0) / COUNT(*) × 100 | Target: >98%
8. **PO Fill Rate %** = SUM(QTY_RECEIVED) / SUM(QTY_ORDERED) × 100 | Target: >99%

### Labor & Cost Metrics
9. **Labor Cost per Unit** = SUM(LABOR_COST) / SUM(UNITS_PRODUCED) | Range: $40-120 by model
10. **Downtime Rate %** = SUM(DOWNTIME_MINUTES) / (24 × 60 × days) × 100 | Target: <5%

### Quality & Warranty Metrics
11. **Supplier Quality Score** = AVG(QUALITY_RATING) on 1-5 scale | Target: ≥4.5
12. **Warranty Cost per Claim** = SUM(REPAIR_COST) / COUNT(CLAIM_ID) | Benchmark: <$800

### Service Metrics
13. **CSAT Score** = AVG(CUSTOMER_SATISFACTION_SCORE) 1-5 scale | 2024: 2.85 (RED ALERT)
14. **Inventory Turnover** = Consumption Value / Average Stock Value | Varies by part category

---

## 10 DASHBOARDS

| Dashboard | KPIs | Key Filter | Data Freshness |
|-----------|------|-----------|-----------------|
| 1. Executive Overview | OEE%, Yield%, Scrap Rate, Labor Cost, CSAT | Year, Plant | Daily (T+1) |
| 2. Production Performance | Units, Attainment%, Downtime Rate | Year, Plant, Shift | Daily (T+0) |
| 3. OEE & Equipment | OEE%, Availability%, MTBF | Year, Plant, Shift | Daily (T+0) |
| 4. Quality & Defects | Defects, FPY%, Rework Rate | Year, Plant, Model | Daily (T+0) |
| 5. Supplier Scorecard | On-Time%, Quality Score, Fill Rate | Year, Supplier | Daily (T+1) |
| 6. Inventory & Supply Chain | Days of Supply, Turnover, Coverage% | Year, Plant, Supplier | Real-time |
| 7. Service & After-Sales | Jobs, CSAT, Turnaround Days | Year, Service Centre | Daily (T+1) |
| 8. Warranty Analysis | Claims, Cost/Claim, Repeat% | Year, Brand, Model | Weekly (T+7) |
| 9. Workforce & Labor | Labor Cost/Unit, Headcount, Overtime | Year, Plant, Shift | Daily (T+1) |
| 10. Purchase Orders | Spend, Fill Rate, Lead Time | Year, Plant, Supplier | Daily (T+1) |

---

## GLOBAL FILTER RULES

**Always Applied (Automatic):**
- Service centres (Chicago, Munich, Sydney, Rotterdam) excluded from production dashboards
- Filter: `PLANT_TYPE = 'Production'` or `PLANT_ID NOT IN (...)`

**User-Interactive Filters:**
1. **Year** (mandatory) — 2020-2024
2. **Plant** (multi-select) — 12 production plants
3. **Brand** (multi-select, cascades to Model) — 6 brands
4. **Model** (multi-select, dependent on Brand) — 18 models
5. **Shift** (multi-select) — 1, 2, 3

**Dashboard-Specific Filters:**
- Service Centre (dashboards 7-8 only)
- Supplier (dashboards 5, 6, 10)
- Defect Type (dashboard 4)

See **GLOBAL_FILTERS.md** for full cascade logic and SQL templates.

---

## DATA QUALITY ALERTS

### Red Flags (Require Investigation Before Dashboard Publication)

**1. CSAT Score: 2.85 / 5.0**
- **Status:** CRITICAL — Far below industry standard (3.5-4.2)
- **Probable Causes:** Survey bias, methodology change, or genuine quality issue
- **Action:** Validate source system, compare to 2023, interview service managers
- **Do NOT publish** until verified

**2. Defect Count: 40 in 2024**
- **Status:** CAUTION — Suspiciously low vs. industry norm (0.5-1.5%)
- **Implied Rate:** ~0.01% (likely underreporting)
- **Action:** Cross-check with FACT_QUALITY_EVENTS log, warranty claims, scrap rate
- **Note on dashboard:** Add asterisk: "*Requires data validation"

**3. PO Spend: $9.3M**
- **Status:** NORMAL — Baseline 2024 spend across 15 suppliers
- **Action:** Reconcile to accounts payable ledger ±5%

### Validation Benchmarks (2024 Calendar Year)
- **Production:** 367,383 units (±2% tolerance)
- **OEE:** 87.99% (±0.5%)
- **Service Jobs:** 172 (±5%)
- **PO Spend:** $9.3M (±10%)

See **VALIDATION_BENCHMARKS.md** for complete data quality rules.

---

## TROUBLESHOOTING

### Issue: Dashboard Shows Zero Records
**Cause:** Filter combination excludes all data  
**Solution:** 
1. Check Year filter = 2024 (2020-2023 data sparse)
2. Verify Plant has activity in selected year (all 12 plants active)
3. Check Brand → Model cascade (e.g., Ford models don't exist at Kyoto)

### Issue: OEE% Doesn't Match Plant Records
**Cause:** Calculation or filter mismatch  
**Solution:**
1. Verify service centres excluded (Chicago, Munich, Sydney, Rotterdam)
2. Check OEE_PCT column is pre-computed (not recalculated)
3. Confirm Availability × Performance × Quality methodology matches source
4. Contact Data Engineering for methodology audit

### Issue: CSAT Score Looks Wrong (2.85)
**Cause:** Likely data quality or methodology issue  
**Solution:**
1. DO NOT publish until validated
2. Cross-reference with service management source system
3. Compare to prior year (2023) trend
4. Verify survey scale and timing
5. Interview service centre managers

### Issue: Filters Too Slow / Dashboard Hangs
**Cause:** Query complexity or warehouse performance  
**Solution:**
1. Check warehouse query logs for slow queries
2. Add indexes to PLANT_ID, BRAND_ID, DATE_KEY columns
3. Partition fact tables by year
4. Consider denormalization for frequently-filtered dimensions
5. Contact Data Engineering for optimization

---

## DOCUMENTATION HIERARCHY

**For Dashboard Users:**
- Start with: SETUP_GUIDE.md (quick orientation)
- Then read: User guide (provided separately in training)

**For BI Developers:**
- Start with: DASHBOARD_FEASIBILITY.md (status overview)
- Then: DATA_SCHEMA_MAP.md (understand tables/joins)
- Then: RETAILEDGE_THEME.md (apply design system)
- Then: SETUP_GUIDE.md (follow build steps)

**For Data Engineers:**
- Start with: DATA_SCHEMA_MAP.md (table documentation)
- Then: METRIC_DEFINITIONS.md (KPI SQL formulas)
- Then: VALIDATION_BENCHMARKS.md (data quality rules)
- Then: GLOBAL_FILTERS.md (filter SQL templates)

**For Business Stakeholders:**
- Read: METRIC_DEFINITIONS.md (understand what each KPI means)
- Reference: VALIDATION_BENCHMARKS.md (known baseline values)

---

## CONTACTS

**Questions About This Skill?**
- Analytics Lead: [Name] | [email]
- BI Developer: [Name] | [email]
- Data Engineering: [Name] | [email]

**Support Escalation:**
- Dashboard Issues: help@xfalcon.com
- Data Quality Questions: Analytics Lead (24-hour response)
- Warehouse Failures: Data Engineering (1-hour SLA)

---

## REVISION HISTORY

| Date | Version | Change | Status |
|------|---------|--------|--------|
| 2026-04-12 | 1.0 | Initial kit creation | DRAFT |
| TBD | 1.1 | Post-UAT refinements | PENDING |
| TBD | 2.0 | Production optimization | PENDING |

---

**Last Updated:** 2026-04-12  
**Project Status:** 90-95% READY (all 10 dashboards)  
**Estimated Deployment:** 3 weeks from SETUP_GUIDE Phase 1 start  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
