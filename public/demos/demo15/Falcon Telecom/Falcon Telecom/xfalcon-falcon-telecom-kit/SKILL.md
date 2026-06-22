# xFalcon AnalyticsPro Build Skill

## Project Overview
**Falcon Telecom xFalcon AnalyticsPro** - Advanced analytics platform for a leading Indian telecom operator.

- **Operator Scale**: 80,000 subscribers
- **Data Period**: 2019-2025 (6 years)
- **Currency**: Indian Rupees (INR)
- **Fiscal Year**: April-March (FY25 = Apr 2024 - Mar 2025)
- **IDA Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

---

## Database Connection
All queries connect to IDA via the xFalcon connector. **No schema prefix needed** — queries execute directly against public schema tables.

**Connection Test Query:**
```sql
SELECT COUNT(*) AS table_count FROM DIM_DATE LIMIT 1;
```

---

## Data Model Overview

### Dimension Tables

#### DIM_DATE
Comprehensive temporal dimension supporting both calendar and fiscal reporting.
```
DATE_KEY (PK) | FULL_DATE | CALENDAR_YEAR | CALENDAR_MONTH | CALENDAR_QUARTER 
| MONTH_NAME | FISCAL_YEAR | FISCAL_QUARTER | FISCAL_PERIOD | IS_WEEKEND | IS_HOLIDAY
```
**Key Note**: Fiscal year derivation = April of prior calendar year to March of current year
- FY25 = April 2024 to March 2025
- FY24 = April 2023 to March 2024

#### DIM_SUBSCRIBER
Core subscriber dimension with lifecycle and value attributes.
```
SUBSCRIBER_KEY (PK) | GEOGRAPHY_KEY (FK) | PLAN_KEY (FK) | DEVICE_KEY (FK)
| ACTIVATION_DATE | TENURE_MONTHS | AGE_BAND | GENDER | CUSTOMER_SEGMENT
| IS_CORPORATE | CHURN_FLAG | CHURN_DATE | CHURN_REASON | LIFETIME_VALUE | NPS_SCORE
```
**Key Fields**:
- CHURN_FLAG: 1 = churned, 0 = active
- CUSTOMER_SEGMENT: Premium, Standard, Value, Budget
- IS_CORPORATE: 1 = corporate account, 0 = individual

#### DIM_PLAN
Service plan offerings by category and monetization tier.
```
PLAN_KEY (PK) | PLAN_NAME | PLAN_CATEGORY (Prepaid/Postpaid/Corporate)
| DATA_GB_PER_DAY | VOICE_MINUTES | SMS_COUNT | MONTHLY_ARPU
| IS_5G_ENABLED | SEGMENT | IS_ACTIVE
```
**ARPU**: Average Revenue Per User in INR per month

#### DIM_DEVICE
Subscriber handset characteristics and capability matrix.
```
DEVICE_KEY (PK) | BRAND | MODEL | DEVICE_TIER (Budget/Mid/Premium/Ultra)
| NETWORK_SUPPORT | IS_5G_CAPABLE | SCREEN_SIZE_IN | RAM_GB | LAUNCH_YEAR
```

#### DIM_GEOGRAPHY
Coverage footprint by circle, region, and urbanization.
```
GEOGRAPHY_KEY (PK) | CIRCLE_NAME | REGION | URBAN_RURAL
| TIER (T1/T2/T3) | POPULATION_WEIGHT
```
**Tier Definition**:
- T1: Metropolitan (Delhi, Mumbai, Bangalore)
- T2: Tier 1 cities (state capitals, major metros)
- T3: Tier 2/3 cities and rural

#### DIM_TOWER
Network infrastructure asset inventory.
```
TOWER_KEY (PK) | TOWER_ID | GEOGRAPHY_KEY (FK) | TECHNOLOGY (2G/3G/4G/5G)
| BAND_MHZ | CAPACITY_USERS | URBAN_RURAL | LATITUDE | LONGITUDE | COMMISSIONED_YEAR
```

#### DIM_ROAMING_PARTNER
International roaming carrier agreements.
```
PARTNER_KEY (PK) | COUNTRY | CARRIER_NAME | RATE_PER_MB | REGION
| AGREEMENT_TYPE (Bilateral/Multilateral)
```

### Fact Tables

#### FACT_BILLING
Monthly subscriber billing transactions.
```
BILLING_KEY (PK) | DATE_KEY (FK) | SUBSCRIBER_KEY (FK) | PLAN_KEY (FK)
| GEOGRAPHY_KEY (FK) | BASE_PLAN_CHARGE | DATA_OVERAGE_CHARGE | ROAMING_CHARGE
| ADDON_CHARGE | TAXES | CREDITS_APPLIED | TOTAL_INVOICE | PAYMENT_STATUS
| DAYS_TO_PAYMENT
```
**Revenue Components**:
- BASE_PLAN_CHARGE: Fixed monthly plan fee
- DATA_OVERAGE_CHARGE: Charges exceeding plan data limit
- ROAMING_CHARGE: International roaming expenses
- ADDON_CHARGE: Premium services, extra data packs, etc.
- TOTAL_INVOICE = BASE + OVERAGE + ROAMING + ADDON + TAXES - CREDITS

#### FACT_LIFECYCLE_EVENTS
Subscriber journey milestones and customer service interactions.
```
EVENT_KEY (PK) | DATE_KEY (FK) | SUBSCRIBER_KEY (FK) | GEOGRAPHY_KEY (FK)
| PLAN_KEY (FK) | EVENT_TYPE | PREVIOUS_PLAN_KEY (FK) | CHANNEL
| RESOLUTION_DAYS | NPS_POST_EVENT | REVENUE_IMPACT
```
**EVENT_TYPE**: ACTIVATION, CHURN, PLAN_UPGRADE, PLAN_DOWNGRADE, COMPLAINT, PORT_IN, PORT_OUT
**CHANNEL**: IVR, Call Center, Store, Online, Mobile App

#### FACT_USAGE
Granular daily network consumption and quality metrics.
```
USAGE_KEY (PK) | DATE_KEY (FK) | SUBSCRIBER_KEY (FK) | TOWER_KEY (FK)
| GEOGRAPHY_KEY (FK) | PLAN_KEY (FK) | DATA_MB_USED | VOICE_MINUTES_USED
| SMS_SENT | DATA_OVERAGE_MB | SIGNAL_STRENGTH_DBM | CALL_DROP_RATE
| AVG_THROUGHPUT_MBPS | SESSION_COUNT
```
**Quality Metrics**:
- SIGNAL_STRENGTH_DBM: Negative dBm (e.g., -80 is good, -120 is poor)
- CALL_DROP_RATE: Percentage (0-100)
- AVG_THROUGHPUT_MBPS: Network speed

#### FACT_ROAMING_USAGE
International roaming consumption and charges.
```
ROAMING_KEY (PK) | DATE_KEY (FK) | SUBSCRIBER_KEY (FK) | PARTNER_KEY (FK)
| GEOGRAPHY_KEY (FK) | DATA_MB_USED | VOICE_MINUTES_USED | SMS_SENT
| DATA_CHARGE | VOICE_CHARGE | TOTAL_ROAMING_CHARGE | DESTINATION_COUNTRY | SMS_CHARGE
```

---

## Join Patterns

### Universal Joins (All Facts)
All fact tables join to DIM_DATE, DIM_SUBSCRIBER, DIM_GEOGRAPHY via their foreign keys.

```sql
-- Standard fact-to-dimension joins
FACT_BILLING b
  JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
  JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
  JOIN DIM_GEOGRAPHY g ON b.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
  JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
```

### Specific Join Patterns

**FACT_USAGE + Tower Data**:
```sql
FACT_USAGE u
  JOIN DIM_TOWER t ON u.TOWER_KEY = t.TOWER_KEY
```

**FACT_ROAMING + Partner Data**:
```sql
FACT_ROAMING_USAGE ru
  JOIN DIM_ROAMING_PARTNER rp ON ru.PARTNER_KEY = rp.PARTNER_KEY
```

**DIM_SUBSCRIBER + Device Data**:
```sql
DIM_SUBSCRIBER s
  LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
```

### Multi-Table Join Example (Revenue + Quality)
```sql
FACT_BILLING b
  JOIN DIM_DATE d ON b.DATE_KEY = d.DATE_KEY
  JOIN DIM_SUBSCRIBER s ON b.SUBSCRIBER_KEY = s.SUBSCRIBER_KEY
  JOIN DIM_PLAN p ON b.PLAN_KEY = p.PLAN_KEY
  JOIN DIM_GEOGRAPHY g ON b.GEOGRAPHY_KEY = g.GEOGRAPHY_KEY
  LEFT JOIN DIM_DEVICE dev ON s.DEVICE_KEY = dev.DEVICE_KEY
```

---

## Common Column Name Mistakes

| Mistake | Correct Column | Table | Impact |
|---------|----------------|-------|--------|
| `ARPU` (bare) | `MONTHLY_ARPU` | DIM_PLAN | Unit mismatch (annual vs. monthly) |
| `CHURN` | `CHURN_FLAG` | DIM_SUBSCRIBER | Query fails; CHURN_FLAG is binary indicator |
| `CHURN_RATE` | Calculate from `CHURN_FLAG` | DIM_SUBSCRIBER | Must compute with SUM/COUNT |
| `REVENUE` | `TOTAL_INVOICE` | FACT_BILLING | Revenue component breakdown differs |
| `SIGNAL` | `SIGNAL_STRENGTH_DBM` | FACT_USAGE | Unit confusion (dBm is negative) |
| `THROUGHPUT` | `AVG_THROUGHPUT_MBPS` | FACT_USAGE | Name suggests instantaneous, actually averaged |
| `DROP_RATE` | `CALL_DROP_RATE` | FACT_USAGE | Percentage already (0-100), not decimal |
| `DATA_USED` | `DATA_MB_USED` | FACT_USAGE, FACT_ROAMING | Unit is megabytes, not gigabytes |
| `VOICE` | `VOICE_MINUTES_USED` | FACT_USAGE, FACT_ROAMING | Minutes, not hours |
| `OVERAGE` | `DATA_OVERAGE_CHARGE` | FACT_BILLING | Cost field; usage is `DATA_OVERAGE_MB` in FACT_USAGE |
| `LTV` | `LIFETIME_VALUE` | DIM_SUBSCRIBER | Static field; not cumulative revenue |
| `NPS` | `NPS_SCORE` (Subscriber) or `NPS_POST_EVENT` (Lifecycle) | DIM_SUBSCRIBER or FACT_LIFECYCLE_EVENTS | Wrong table leads to NULL/wrong values |
| `TENURE` | `TENURE_MONTHS` | DIM_SUBSCRIBER | Not days; stored as months |
| `DEVICE_AGE` | `LAUNCH_YEAR` | DIM_DEVICE | Must compute age from current year |
| `PAYMENT_DAYS` | `DAYS_TO_PAYMENT` | FACT_BILLING | Actual days, not date difference |

---

## Fiscal Year Calculation

**April-March fiscal year structure**:
- FY25: 01-Apr-2024 to 31-Mar-2025
- FY24: 01-Apr-2023 to 31-Mar-2024
- FY23: 01-Apr-2022 to 31-Mar-2023

**Deriving FY from Date**:
```sql
CASE
  WHEN MONTH(FULL_DATE) >= 4 THEN YEAR(FULL_DATE) + 1
  ELSE YEAR(FULL_DATE)
END AS fiscal_year_calculated
```
*(Already available as FISCAL_YEAR in DIM_DATE)*

---

## Design System

### T-Mobile Light Theme
Inspired by T-Mobile's bold magenta branding adapted for Falcon Telecom.

#### Color Palette
- **Primary Magenta**: `#E20074` (Falcon brand accent, data highlights)
- **Navy Topbar**: `#1D1D2C` (Header background, authority)
- **Light Gray Background**: `#F3F4F6` (Dashboard canvas)
- **Chart Blue**: `#006AFF` (Primary data series)
- **Chart Teal**: `#1A7F64` (Secondary data series, comparisons)
- **Chart Gray**: `#94A3B8` (Neutral/baseline, tertiary data)
- **White**: `#FFFFFF` (Cards, text backgrounds)
- **Dark Text**: `#1F2937` (Primary text)
- **Medium Text**: `#6B7280` (Secondary text, labels)
- **Border Gray**: `#E5E7EB` (Card borders, dividers)

### Typography
- **Topbar Title**: 18px, bold, navy `#1D1D2C`
- **Dashboard Section Headers**: 16px, bold, dark `#1F2937`
- **Card Titles**: 14px, bold, dark `#1F2937`
- **Body Text**: 12px, regular, medium `#6B7280`
- **Data Values**: 12px, bold, dark `#1F2937`
- **Chart Labels**: 11px, regular, medium `#6B7280`

### Topbar Component
```
┌─────────────────────────────────────────────────────────────────┐
│ [xF]  Falcon Telecom / N. Dashboard Name                  Admin │
│  M   (x in magenta, F in navy)                                   │
└─────────────────────────────────────────────────────────────────┘
```
- Logo: 24px height, tight kerning
- Magenta 'x': `#E20074`
- Navy 'F': `#1D1D2C`
- Title: 16px bold
- Background: Navy `#1D1D2C`
- Text: White `#FFFFFF`
- Right-align admin/user control

### Card & Chart Styling
- **Card Margin**: 12px, rounded 8px corners
- **Card Shadow**: 0 1px 3px rgba(0,0,0,0.08)
- **Chart Colors**: Use palette in order (Blue → Teal → Gray → alternating)
- **KPI Highlight**: Magenta `#E20074` for key metrics
- **Baseline/Comparison**: Gray `#94A3B8` for neutral reference lines

---

## Dashboard Specification

### Dashboard List (11 Total, READY Status)

#### 1. Executive Overview
**File**: `01-executive-overview.html`
**Status**: READY
**Charts**:
- Total Revenue trend (line) by Fiscal Year
- Subscriber Growth (line) by Fiscal Year
- ARPU by Fiscal Quarter (area)
- Churn Rate % (bar) by Fiscal Year

**Queries**: QUERY_TEMPLATES.sql — Queries 1.1, 1.2, 1.3

#### 2. Revenue & ARPU
**File**: `02-revenue-arpu.html`
**Status**: READY
**Charts**:
- Revenue by Plan Category (stacked bar)
- ARPU by Segment × Plan Category (grouped bar)
- Revenue Composition (stacked 100% bar) by Fiscal Year

**Queries**: QUERY_TEMPLATES.sql — Queries 2.1, 2.2, 2.3

#### 3. Subscriber Lifecycle
**File**: `03-subscriber-lifecycle.html`
**Status**: READY
**Charts**:
- Activations vs Churns (dual bar) by Fiscal Year
- Events by Channel (pie/donut)
- NPS by Event Type (bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 3.1, 3.2, 3.3

#### 4. Churn Analysis
**File**: `04-churn-analysis.html`
**Status**: READY
**Charts**:
- Churn by Reason (horizontal bar)
- Churn Rate by Tenure Band × Segment (heatmap)
- Churn by Region/Tier (map or grouped bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 4.1, 4.2, 4.3

#### 5. Network Quality
**File**: `05-network-quality.html`
**Status**: READY
**Charts**:
- Call Drop Rate by Technology (bar)
- Throughput by Region (box plot or range)
- Signal Strength Urban vs Rural (comparison)

**Queries**: QUERY_TEMPLATES.sql — Queries 5.1, 5.2, 5.3

#### 6. 5G Adoption
**File**: `06-5g-adoption.html`
**Status**: READY
**Charts**:
- 5G Device Penetration % (line) by Fiscal Year
- 5G Plan Subscribers (bar) by Fiscal Year
- 5G Tower Coverage % (gauge or KPI)

**Queries**: QUERY_TEMPLATES.sql — Queries 6.1, 6.2, 6.3

#### 7. Billing & Payments
**File**: `07-billing-payments.html`
**Status**: READY
**Charts**:
- Payment Status Distribution (pie)
- Days to Payment Trend (line) by Fiscal Year × Segment
- Overdue Amount by Segment (bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 7.1, 7.2, 7.3

#### 8. Roaming Analysis
**File**: `08-roaming-analysis.html`
**Status**: READY
**Charts**:
- Revenue by Partner (horizontal bar)
- Roaming Usage by Destination (sankey or waterfall)
- Data vs Voice Mix (stacked bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 8.1, 8.2, 8.3

#### 9. Regional Performance
**File**: `09-regional-performance.html`
**Status**: READY
**Charts**:
- Revenue by Region × Tier (grouped bar)
- ARPU by Circle & Urban/Rural (scatter or bubble)
- Subscriber Density (map or bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 9.1, 9.2, 9.3

#### 10. Customer Segments
**File**: `10-customer-segments.html`
**Status**: READY
**Charts**:
- Segment Size (pie)
- LTV by Segment (bar)
- NPS by Segment × Age Band (grouped bar)
- Churn Rate by Segment (bar)

**Queries**: QUERY_TEMPLATES.sql — Queries 10.1, 10.2, 10.3

#### 11. Device Analytics
**File**: `11-device-analytics.html`
**Status**: READY
**Charts**:
- Brand Market Share (horizontal bar top 10)
- Device Tier Distribution (pie)
- 5G Capable % by Tier (grouped bar)
- Device Age vs Churn Rate (scatter)

**Queries**: QUERY_TEMPLATES.sql — Queries 11.1, 11.2, 11.3

---

## Query Development Workflow

### Step 1: Identify Dashboard Need
- Review dashboard chart in spec above
- Locate corresponding query number in QUERY_TEMPLATES.sql

### Step 2: Run Query via IDA
```bash
# Use ida_query() with connector mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
# Copy query from QUERY_TEMPLATES.sql
# No schema prefix required
```

### Step 3: Validate Results
- Check row count < 200 (pre-aggregated)
- Verify column names match design spec
- Confirm currency in INR, ARPU in monthly units

### Step 4: Map to Chart
- Use chart picker for type recommendation
- Match data shape (rows, grouping) to chart
- Apply color palette per design system

### Step 5: Build HTML Dashboard
- Use Chart.js library (included in template)
- Follow topbar + card layout spec
- Apply T-Mobile light theme colors
- Test responsive design

---

## QA Checklist (Pre-Delivery)

### Data Validation
- [ ] All queries return < 200 rows (aggregated)
- [ ] Date filters applied (CALENDAR_YEAR >= 2019)
- [ ] Currency confirmed INR (no conversion)
- [ ] ARPU units = monthly (not annual)
- [ ] CHURN_FLAG correctly interpreted (binary)
- [ ] NPS values in valid range (0-10 or NULL)
- [ ] FISCAL_YEAR correctly derived (April-March)

### Query Correctness
- [ ] No duplicate rows (GROUP BY complete)
- [ ] Joins verified (no Cartesian products)
- [ ] NULL handling applied (COALESCE/LEFT JOIN)
- [ ] CAST to NUMERIC for financial calculations
- [ ] Rounding applied to 2 decimals (ARPU, percentages)

### Design & Styling
- [ ] Topbar uses navy `#1D1D2C` + magenta xF logo
- [ ] Cards use light gray `#F3F4F6` background
- [ ] Charts use approved palette (Blue `#006AFF`, Teal `#1A7F64`, Gray `#94A3B8`)
- [ ] Typography matches spec (18px title, 12px body)
- [ ] Responsive grid layout (mobile-first)

### User Experience
- [ ] Dashboard title format: "Falcon Telecom / N. Dashboard Name"
- [ ] Metric labels clear (INR, %, months, etc.)
- [ ] Legend visible on all charts
- [ ] Drill-down or filtering available (if applicable)
- [ ] No console errors (F12)

### Performance
- [ ] Page load < 3 seconds
- [ ] All chart animations smooth (no jank)
- [ ] Responsive design tested (desktop, tablet, mobile)

---

## Common Pitfalls & Solutions

### Pitfall 1: ARPU Confusion
**Problem**: Using MONTHLY_ARPU instead of calculating annual equivalents
**Solution**: MONTHLY_ARPU in DIM_PLAN is already monthly. For annual: `MONTHLY_ARPU * 12`

### Pitfall 2: Fiscal Year Boundary Issues
**Problem**: Including FY24 and FY25 data in same trend
**Solution**: Group strictly by FISCAL_YEAR; don't mix calendar years

### Pitfall 3: Churn Calculation
**Problem**: `WHERE CHURN_FLAG = 1` returns lifetime churned base, not period churn
**Solution**: Add date filter: `WHERE CHURN_DATE BETWEEN start AND end`

### Pitfall 4: Overage Revenue Double-Counting
**Problem**: Summing both DATA_OVERAGE_MB and DATA_OVERAGE_CHARGE
**Solution**: Use charge amounts only; usage is diagnostic

### Pitfall 5: Signal Strength Interpretation
**Problem**: Treating dBm as positive (higher = better)
**Solution**: dBm is negative; -80 is excellent, -120 is poor. Use MIN/MAX cautiously.

### Pitfall 6: NULL Handling in Joins
**Problem**: INNER JOINs exclude subscribers without devices/plans
**Solution**: Use LEFT JOIN for DIM_DEVICE, DIM_PLAN; validate null rates

### Pitfall 7: 5G Filtering
**Problem**: IS_5G_ENABLED on plans; IS_5G_CAPABLE on devices (different fields)
**Solution**: Use correct field per dimension; both needed for true 5G adoption

---

## File Structure
```
/sessions/stoic-wizardly-ptolemy/mnt/Falcon Telecom/xfalcon-falcon-telecom-kit/
├── SKILL.md                          (This file - project reference)
├── QUERY_TEMPLATES.sql               (All 33 starter queries)
├── 01-executive-overview.html        (Dashboard - build pending)
├── 02-revenue-arpu.html              (Dashboard - build pending)
├── 03-subscriber-lifecycle.html      (Dashboard - build pending)
├── 04-churn-analysis.html            (Dashboard - build pending)
├── 05-network-quality.html           (Dashboard - build pending)
├── 06-5g-adoption.html               (Dashboard - build pending)
├── 07-billing-payments.html          (Dashboard - build pending)
├── 08-roaming-analysis.html          (Dashboard - build pending)
├── 09-regional-performance.html      (Dashboard - build pending)
├── 10-customer-segments.html         (Dashboard - build pending)
├── 11-device-analytics.html          (Dashboard - build pending)
└── README.md                         (User-facing guide)
```

---

## Next Steps for Dashboard Development

1. **Test Query Templates**
   - Load QUERY_TEMPLATES.sql
   - Run each query via IDA connector
   - Verify row counts and data quality

2. **Build Dashboards**
   - Use Chart.js + responsive grid
   - Apply T-Mobile light theme
   - Implement topbar with xF logo

3. **Add Interactivity** (Optional)
   - Date range filters
   - Segment dropdowns
   - Drill-down capabilities

4. **Performance Optimization**
   - Cache query results (if needed)
   - Lazy load charts
   - Minify CSS/JS

---

## Support & Customization

**For additional queries**: Follow QUERY_TEMPLATES.sql patterns
- Pre-aggregate to < 200 rows
- Include business logic comments
- Use consistent column naming
- Apply FISCAL_YEAR filters (default >= 2019)

**For theme changes**: Update color variables in dashboard CSS section (see Design System)

**For new dashboards**: Create HTML file following 01-executive-overview.html structure

---

**Last Updated**: April 2026
**Status**: All 11 dashboards READY for HTML build
**Query Templates**: 33 total (3 per dashboard average)
