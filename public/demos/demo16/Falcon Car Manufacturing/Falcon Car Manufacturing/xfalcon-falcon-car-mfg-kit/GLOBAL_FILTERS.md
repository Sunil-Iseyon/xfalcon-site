# Global Filters & Filter Strategy
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Documentation of mandatory global filters, interactive filter implementation, and filter precedence rules for all dashboards.

---

## MANDATORY GLOBAL FILTERS

### Service Centre Exclusion (Production Dashboards)
**Applies To:** Dashboards 1-3, 6, 9, 10 (All except Service & Warranty)

**Filter Rule:**
```sql
WHERE PLANT_TYPE = 'Production'
-- OR
WHERE PLANT_ID NOT IN ('Chicago', 'Munich', 'Sydney', 'Rotterdam')
```

**Excluded Locations:**
| Location | Code | Region | Reason |
|----------|------|--------|--------|
| Chicago | CHI | Americas | Service centre (after-sales only) |
| Munich | MUC | EMEA | Service centre (after-sales only) |
| Sydney | SYD | APAC | Service centre (after-sales only) |
| Rotterdam | RTM | EMEA | Warehouse & regional distribution (not production) |

**Business Justification:**  
Service centres operate under different KPIs and cost structures than manufacturing plants. Production metrics (OEE, yield, labor cost) do not apply. Service centres appear in **Service & After-Sales** (Dashboard 7) and **Warranty Analysis** (Dashboard 8) with separate metric definitions.

**Implementation Note:** Create a `PLANT_TYPE` dimension flag at warehouse time or use plant ID lookup table. Filter at query level, not dashboard UI (prevent accidental override).

---

## INTERACTIVE FILTER PARAMETERS

All 10 dashboards support these interactive filters for end-user drill-down and comparison:

### 1. Year Filter
**Type:** Dropdown  
**Default Value:** 2024 (current year)  
**Available Values:** 2020, 2021, 2022, 2023, 2024  
**Data Column:** DIM_DATE.YEAR or DATEPART(YEAR, DATE_KEY)

**Behavior:**
- Single-year selection (no multi-select)
- Affects all metrics and trends
- YoY comparison dashboards show prior year reference line

**Filter SQL:**
```sql
WHERE YEAR(DATE_KEY) = @selected_year
```

---

### 2. Plant Filter
**Type:** Multi-select Dropdown  
**Default Value:** All production plants (exclude service centres)  
**Available Values:** 12 production plants by region

**Plants by Region:**

**EMEA (4 plants):**
- Cologne (COL)
- Bratislava (BRA)
- Valencia (VAL)
- Sunderland (SUN)

**APAC (3 plants):**
- Kyoto (KYO)
- Bangkok (BKK)
- Melbourne (MEL)

**Americas (3 plants):**
- Detroit (DET)
- Hermosillo (HMO)
- Brasília (BRA)

**China (2 plants):**
- Shanghai (SHA)
- Chongqing (CHQ)

**Data Column:** DIM_PLANT.PLANT_ID or PLANT_NAME

**Behavior:**
- Multi-select: Select multiple plants for aggregate view
- Single-select: Focus on one plant's detail
- All selection: Removes filter (shows all)

**Filter SQL:**
```sql
WHERE PLANT_ID IN (@selected_plant_ids)
-- OR
WHERE PLANT_NAME IN ('Cologne', 'Kyoto', 'Detroit', ...)
```

---

### 3. Brand Filter
**Type:** Multi-select Dropdown  
**Default Value:** All brands  
**Available Values:** 6 brands

| Brand | Models | Primary Region |
|-------|--------|-----------------|
| Toyota | 3 models | APAC |
| Honda | 3 models | APAC |
| Ford | 3 models | Americas |
| BMW | 3 models | EMEA |
| Mercedes | 3 models | EMEA |
| Volkswagen | 3 models | EMEA/China |

**Data Column:** DIM_BRAND.BRAND_ID or BRAND_NAME

**Behavior:**
- Multi-select: Compare performance across brands
- Filter cascades to available models (see Model Filter below)
- Affects Warranty and Service metrics (joins via DIM_VEHICLE)

**Filter SQL:**
```sql
WHERE BRAND_ID IN (@selected_brand_ids)
-- OR join through DIM_MODEL or DIM_VEHICLE
WHERE BRAND_NAME IN ('Toyota', 'BMW', 'Mercedes', ...)
```

---

### 4. Model Filter
**Type:** Multi-select Dropdown  
**Default Value:** All models  
**Available Values:** 18 vehicle models

**Cascade Logic:**  
Model options filter based on selected Brand(s). If User selects "Toyota" in Brand filter, Model dropdown shows only 3 Toyota models.

**Brand-Model Matrix:**
```
Toyota:
  - Camry
  - Corolla
  - RAV4

Honda:
  - Civic
  - Accord
  - CR-V

Ford:
  - Mustang
  - Fusion
  - Escape

BMW:
  - 3 Series
  - 5 Series
  - X5

Mercedes:
  - C-Class
  - E-Class
  - GLE

Volkswagen:
  - Golf
  - Passat
  - Tiguan
```

**Data Column:** DIM_MODEL.MODEL_ID or MODEL_NAME

**Behavior:**
- Multi-select within filtered brand(s)
- Empty selection = all models in selected brand(s)
- Production & OEE drill-down to model level

**Filter SQL:**
```sql
WHERE MODEL_ID IN (@selected_model_ids)
-- AND BRAND_ID IN (@selected_brand_ids)  [cascade parent]
```

---

### 5. Shift Filter
**Type:** Multi-select Dropdown  
**Default Value:** All shifts (1, 2, 3)  
**Available Values:** 1, 2, 3

**Shift Schedule:**
| Shift | Hours | Start | End |
|-------|-------|-------|-----|
| Shift 1 | 8 | 06:00 | 14:00 |
| Shift 2 | 8 | 14:00 | 22:00 |
| Shift 3 | 8 | 22:00 | 06:00 |

**Data Column:** FACT_ASSEMBLY_OUTPUT.SHIFT or DIM_SHIFT.SHIFT

**Behavior:**
- Production & OEE dashboards: Compare shift performance (staffing, fatigue impact)
- Labor Cost per Unit: Aggregates across selected shifts
- Allow single-shift focus for shift manager review

**Filter SQL:**
```sql
WHERE SHIFT IN (@selected_shifts)
-- OR
WHERE SHIFT IN ('1', '2', '3')
```

---

## OPTIONAL CONTEXT FILTERS (Dashboard-Specific)

### Service Centre Filter
**Applies To:** Service & After-Sales (Dashboard 7), Warranty Analysis (Dashboard 8)  
**Type:** Multi-select Dropdown  
**Available Values:** 4 service centres (Chicago, Munich, Sydney, Rotterdam)  
**Default:** All service centres

```sql
WHERE SERVICE_CENTRE_ID IN (@selected_centres)
```

---

### Supplier Filter
**Applies To:** Supplier Scorecard (Dashboard 5), Purchase Orders (Dashboard 10)  
**Type:** Multi-select Dropdown  
**Available Values:** 15 tier 1-2 suppliers  
**Default:** All suppliers

**Major Suppliers (Example):**
- Tier 1 Electronics Supplier A
- Tier 1 Powertrain Supplier B
- Tier 2 Fastening Supplier C
- (Plus 12 others)

```sql
WHERE SUPPLIER_ID IN (@selected_suppliers)
```

---

### Defect Type Filter
**Applies To:** Quality & Defects (Dashboard 4)  
**Type:** Multi-select Dropdown  
**Available Values:** Coating, Welding, Assembly, Other  
**Default:** All types

```sql
WHERE DEFECT_TYPE IN (@selected_types)
```

---

### Date Range Filter (Advanced)
**Applies To:** All dashboards (optional, for trend analysis)  
**Type:** Date Picker (Start Date - End Date)  
**Default:** Year-to-date (Jan 1 - current date)

**Usage Example:** Compare Q1 vs. Q4 for seasonal trends

```sql
WHERE DATE_KEY BETWEEN @start_date AND @end_date
```

---

## FILTER PRECEDENCE & LOGIC

### Filter Evaluation Order (Top to Bottom)

1. **Year** (mandatory) — Selects fiscal year
2. **Plant** (mandatory for production dashboards) — Geographic scope
3. **Brand** (optional, cascades to Model)
4. **Model** (optional, dependent on Brand)
5. **Shift** (optional, production dashboards)
6. **Service Centre** (service dashboards only)
7. **Supplier** (procurement dashboards)
8. **Defect Type** (quality dashboards)
9. **Date Range** (optional, overrides Year if specified)

### AND vs. OR Logic

**Within Same Filter (Multi-select):** OR logic
```sql
PLANT_ID IN ('Cologne', 'Kyoto')  -- Cologne OR Kyoto
```

**Across Different Filters:** AND logic
```sql
WHERE YEAR = 2024
  AND PLANT_ID IN ('Cologne', 'Kyoto')
  AND BRAND_ID IN (1, 3)  -- Year AND Plant AND Brand
```

### Cascade Rules

**Brand → Model:**
- When user selects specific brand(s), Model dropdown shows only models for selected brand(s)
- Example: Select "Toyota" → Model options become [Camry, Corolla, RAV4]
- Clear Brand selection → Model options reset to all 18 models

**No Other Cascades:** Plant, Shift, Supplier filters are independent

---

## FILTER STATE PERSISTENCE

### Dashboard-Level Persistence
**Behavior:** Filters selected by user persist within a single dashboard view

**Session Persistence (Optional):**
- Save filter state in browser localStorage or session cookie
- Allow "Save View" button to bookmark filter combination (e.g., "Cologne Q4 Performance")
- Restore filters when user returns to same dashboard

### Multi-Dashboard Persistence (NOT Recommended)
- Do NOT auto-apply Plant filter from Dashboard 1 to Dashboard 5
- Each dashboard context may differ (e.g., Service Centre filter only applies to dashboards 7-8)
- Users must explicitly select filters per dashboard

---

## FILTER VALIDATION & ERROR HANDLING

### No Results Scenario
**Behavior:** If filter combination returns zero rows:
- Display message: "No data found for selected filters. Try adjusting Plant, Brand, or Date Range."
- Show last valid result set in gray/disabled state
- Suggest alternative filter combination

### Invalid Filter Combinations
**Example:** User selects Brand="Toyota" AND Service Centre="Chicago" (mismatched context)
- Production dashboards: Service Centre filter grayed out (not applicable)
- Service dashboards: Brand/Model filters visible but may return zero rows

### Filter Change Impact
- When user changes filter, dashboard re-loads with 1-2 second latency
- Show loading spinner: "Updating dashboard..."
- Highlight changed metrics (optional enhancement)

---

## FILTER DASHBOARD MAPPING

| Dashboard | Year | Plant | Brand | Model | Shift | Service Centre | Supplier | Defect Type |
|-----------|:----:|:-----:|:-----:|:-----:|:-----:|:---------------:|:--------:|:-----------:|
| 1. Executive Overview | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| 2. Production Performance | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| 3. OEE & Equipment | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| 4. Quality & Defects | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ |
| 5. Supplier Scorecard | ✓ | — | — | — | — | — | ✓ | — |
| 6. Inventory & Supply Chain | ✓ | ✓ | — | — | — | — | ✓ | — |
| 7. Service & After-Sales | ✓ | — | — | — | — | ✓ | — | — |
| 8. Warranty Analysis | ✓ | — | ✓ | ✓ | — | — | — | — |
| 9. Workforce & Labor | ✓ | ✓ | — | — | ✓ | — | — | — |
| 10. Purchase Orders | ✓ | ✓ | — | — | — | — | ✓ | — |

**Legend:** ✓ = Available | — = Not applicable

---

## FILTER UI PATTERNS & BEST PRACTICES

### Dropdown Implementation (React / Vue / Angular)
```
<select id="plant-filter" multiple>
  <optgroup label="EMEA">
    <option value="COL">Cologne</option>
    <option value="BRA">Bratislava</option>
    <option value="VAL">Valencia</option>
    <option value="SUN">Sunderland</option>
  </optgroup>
  <optgroup label="APAC">
    <option value="KYO">Kyoto</option>
    <option value="BKK">Bangkok</option>
    <option value="MEL">Melbourne</option>
  </optgroup>
  <optgroup label="Americas">
    <option value="DET">Detroit</option>
    <option value="HMO">Hermosillo</option>
    <option value="BRA">Brasília</option>
  </optgroup>
  <optgroup label="China">
    <option value="SHA">Shanghai</option>
    <option value="CHQ">Chongqing</option>
  </optgroup>
</select>
```

### Filter Bar Layout
- **Topbar position:** Below main navigation, above dashboard cards
- **Filter order (left to right):** Year | Plant | Brand | Model | Shift | [Optional]
- **Spacing:** 12px between filter controls
- **Label:** 12px, 600 weight, #1E293B, left-aligned above control
- **Apply button:** Optional (auto-apply on change) OR explicit "Apply Filters" button
- **Clear button:** Reset all filters to defaults

### Responsive Design
- **Desktop (1280px+):** All filters in single row
- **Tablet (768px-1279px):** Wrap to 2 rows; Year + Plant on row 1; Brand + Model on row 2
- **Mobile (<768px):** Stack vertically; consider collapsible filter panel

---

## FILTER EXCLUSION LOGIC (SQL Implementation)

### Complete Production Filter Template
```sql
SELECT *
FROM FACT_ASSEMBLY_OUTPUT f
JOIN DIM_PLANT p ON f.PLANT_ID = p.PLANT_ID
JOIN DIM_MODEL m ON f.MODEL_ID = m.MODEL_ID
JOIN DIM_SHIFT s ON f.SHIFT = s.SHIFT
WHERE 1=1
  -- Mandatory global filter
  AND p.PLANT_TYPE = 'Production'  
  
  -- Interactive filters
  AND YEAR(f.DATE_KEY) = @year              -- Default: 2024
  AND f.PLANT_ID IN (@plant_ids)            -- Default: All 12 production plants
  AND m.BRAND_ID IN (@brand_ids)            -- Default: All 6 brands
  AND m.MODEL_ID IN (@model_ids)            -- Default: All 18 models (cascaded by brand)
  AND f.SHIFT IN (@shifts)                  -- Default: All 3 shifts
  
  -- Optional date range (overrides Year if specified)
  AND f.DATE_KEY BETWEEN @start_date AND @end_date
ORDER BY f.DATE_KEY DESC;
```

---

## TESTING CHECKLIST

- [ ] Year filter: Verify 2020-2024 all return data
- [ ] Plant filter: Multi-select Cologne + Kyoto returns combined results
- [ ] Plant filter: Service centres (Chicago, Munich, Sydney, Rotterdam) excluded from production dashboards
- [ ] Brand filter: Select Toyota → Model dropdown shows only Camry, Corolla, RAV4
- [ ] Model filter: Clear Brand selection → Model options reset to all 18
- [ ] Shift filter: Shift 3 (night shift) shows expected reduced activity
- [ ] No results: Filter combination (Brand=Ford AND Plant=Kyoto) returns zero rows; message displays
- [ ] Date range: Custom date picker overrides Year filter correctly
- [ ] Filter state: Refresh page → filters persist (if session persistence enabled)
- [ ] Mobile: Filters stack vertically on <768px viewport

---

**Last Updated:** 2026-04-12  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
