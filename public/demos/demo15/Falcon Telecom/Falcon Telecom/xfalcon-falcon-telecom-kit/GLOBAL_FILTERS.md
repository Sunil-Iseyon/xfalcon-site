# Global Filters
## Falcon Telecom xFalcon AnalyticsPro Kit

Complete documentation of dashboard-wide interactive filters for drill-down analysis across all 11 dashboards. All filters are **optional** with sensible defaults; no data is excluded by default.

---

## Filter Architecture

**Filter Hierarchy:**
```
Dashboard Load
    ↓
Apply Global Filters (in order below)
    ↓
Load Dashboard State (persisted user preferences)
    ↓
Execute Data Queries
    ↓
Render Charts/KPIs
    ↓
Listen for Filter Changes → Re-execute queries
```

**Filter Placement:**
- Horizontal filter bar below top navigation
- Sticky (stays visible on scroll)
- Color: Light gray background (#F3F4F6), white chips
- Responsive: Stack on mobile, horizontal on desktop

---

## Filter 1: Calendar Year

**Type:** Dropdown Select | **Multi-select:** No (single year) | **Required:** No

**Available Values:**
- 2019, 2020, 2021, 2022, 2023, 2024, 2025

**Default:** 2025 (most recent year)

**SQL WHERE Clause:**
```sql
AND d.CALENDAR_YEAR = ?{yearFilter}
```

**Full Fiscal Year Equivalent** (if user selects fiscal year option):
```sql
AND d.FISCAL_YEAR = ?{fiscalYearFilter}
```

**Example:**
```html
<div class="filter-chip-group">
  <label>Calendar Year:</label>
  <select id="yearFilter" onchange="applyFilters()">
    <option value="">All Years</option>
    <option value="2025" selected>2025</option>
    <option value="2024">2024</option>
    <option value="2023">2023</option>
    <option value="2022">2022</option>
    <option value="2021">2021</option>
    <option value="2020">2020</option>
    <option value="2019">2019</option>
  </select>
</div>
```

**Use Cases:**
- Year-over-year comparisons (default: 2025 vs 2024)
- Trending analysis (all years, but highlight current)
- Cohort analysis (activation year filters)

**Notes:**
- Empty selection = show all years
- Fiscal year runs April 1 - March 31 (select by FISCAL_YEAR in date dimension)

---

## Filter 2: Region

**Type:** Chip Multi-select | **Multi-select:** Yes (checkboxes) | **Required:** No

**Available Values:**
- North (Delhi, Haryana, Punjab, Himachal Pradesh, Jammu & Kashmir circles)
- South (Tamil Nadu, Karnataka, Telangana, Andhra Pradesh circles)
- East (West Bengal, Odisha, Jharkhand, Assam circles)
- West (Maharashtra, Gujarat, Goa circles)
- Central (Rajasthan, Madhya Pradesh, Chhattisgarh circles)

**Default:** All regions selected

**SQL WHERE Clause:**
```sql
AND dg.REGION IN (?{regionFilters})
```

**Example:**
```html
<div class="filter-chip-group">
  <label>Region:</label>
  <div class="chip-container">
    <label class="filter-chip">
      <input type="checkbox" value="North" onchange="applyFilters()" checked /> North
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="South" onchange="applyFilters()" checked /> South
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="East" onchange="applyFilters()" checked /> East
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="West" onchange="applyFilters()" checked /> West
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Central" onchange="applyFilters()" checked /> Central
    </label>
  </div>
</div>
```

**Use Cases:**
- Regional performance comparison (select 2-3 regions)
- Operational focus (select 1 region for detailed analysis)
- Competitive analysis (select South + West for major metros)

**Notes:**
- Selected regions are visually highlighted (--color-accent)
- Count badge shows # circles in selected regions
- Applied to DIM_GEOGRAPHY JOIN (filters both FACT tables and dimension tables)

---

## Filter 3: Customer Segment

**Type:** Chip Multi-select | **Multi-select:** Yes (checkboxes) | **Required:** No

**Available Values:**
- Mass Market (prepaid, budget-conscious, high churn)
- Mid Market (mixed prepaid/postpaid, growing data usage)
- Premium (postpaid, high ARPU, low churn, data-heavy)
- Corporate (enterprise/B2B, dedicated accounts, net-30 billing)

**Default:** All segments selected

**SQL WHERE Clause:**
```sql
AND ds.CUSTOMER_SEGMENT IN (?{segmentFilters})
```

**Example:**
```html
<div class="filter-chip-group">
  <label>Customer Segment:</label>
  <div class="chip-container">
    <label class="filter-chip">
      <input type="checkbox" value="Mass Market" onchange="applyFilters()" checked /> Mass Market
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Mid Market" onchange="applyFilters()" checked /> Mid Market
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Premium" onchange="applyFilters()" checked /> Premium
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Corporate" onchange="applyFilters()" checked /> Corporate
    </label>
  </div>
</div>
```

**Use Cases:**
- Segment-specific strategy (Premium vs Mass Market ARPU trends)
- Payment analysis (Corporate net-30 vs Prepaid immediate)
- Churn analysis (Mass Market churn drivers)
- Device analytics (Premium = flagship devices, Mass Market = budget)

**Notes:**
- Applied to DIM_SUBSCRIBER JOIN
- Affects all metrics except network quality (cell site data)
- Corporate segment is small (~5% of subscribers) but high value

---

## Filter 4: Plan Category

**Type:** Chip Multi-select | **Multi-select:** Yes (checkboxes) | **Required:** No

**Available Values:**
- Prepaid (pay-as-you-go, daily/weekly/monthly plans)
- Postpaid (monthly billing, contract-based)
- Corporate (bulk plans, billing to enterprise)

**Default:** All categories selected

**SQL WHERE Clause:**
```sql
AND dp.PLAN_CATEGORY IN (?{planFilters})
```

**Example:**
```html
<div class="filter-chip-group">
  <label>Plan Category:</label>
  <div class="chip-container">
    <label class="filter-chip">
      <input type="checkbox" value="Prepaid" onchange="applyFilters()" checked /> Prepaid
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Postpaid" onchange="applyFilters()" checked /> Postpaid
    </label>
    <label class="filter-chip">
      <input type="checkbox" value="Corporate" onchange="applyFilters()" checked /> Corporate
    </label>
  </div>
</div>
```

**Use Cases:**
- Revenue mix analysis (Prepaid vs Postpaid split)
- Payment behavior (Postpaid higher payment rate)
- ARPU comparison (Postpaid ~₹550 vs Prepaid ~₹350)
- Churn drivers (Prepaid more volatile)

**Notes:**
- Applied to DIM_PLAN JOIN via FACT_BILLING, FACT_USAGE, FACT_LIFECYCLE_EVENTS
- Affects Revenue, ARPU, Churn, Payment metrics directly
- Network quality metrics less affected (applies to all plans equally)

---

## Combined Filter Examples

### Example 1: Premium Postpaid in Major Metros
```sql
WHERE d.CALENDAR_YEAR = 2025
  AND dg.REGION IN ('North', 'West')  -- Delhi, Mumbai markets
  AND ds.CUSTOMER_SEGMENT = 'Premium'
  AND dp.PLAN_CATEGORY = 'Postpaid'
```
**Use Case:** Analyze high-value customers in major revenue centers.

### Example 2: Mass Market Prepaid Churn by Region
```sql
WHERE d.FISCAL_YEAR = 2025
  AND ds.CUSTOMER_SEGMENT = 'Mass Market'
  AND dp.PLAN_CATEGORY = 'Prepaid'
  AND fle.EVENT_TYPE = 'CHURN'
```
**Use Case:** Identify churn drivers in price-sensitive segment.

### Example 3: All Regions & Segments, 2024 Only
```sql
WHERE d.CALENDAR_YEAR = 2024
  -- Region: All (no filter)
  -- Segment: All (no filter)
  -- Plan: All (no filter)
```
**Use Case:** Year-over-year comparison with 2025 (run same query with CALENDAR_YEAR = 2025).

---

## Filter Implementation (JavaScript)

### applyFilters() Function

```javascript
function applyFilters() {
  // Collect filter values
  const filters = {
    year: document.getElementById('yearFilter').value || null,
    regions: Array.from(document.querySelectorAll('.filter-region:checked'))
              .map(el => el.value),
    segments: Array.from(document.querySelectorAll('.filter-segment:checked'))
              .map(el => el.value),
    planCategories: Array.from(document.querySelectorAll('.filter-plan:checked'))
                   .map(el => el.value)
  };

  // Validate: at least one value selected for multi-selects
  if (filters.regions.length === 0) {
    filters.regions = ['North', 'South', 'East', 'West', 'Central'];
  }
  if (filters.segments.length === 0) {
    filters.segments = ['Mass Market', 'Mid Market', 'Premium', 'Corporate'];
  }
  if (filters.planCategories.length === 0) {
    filters.planCategories = ['Prepaid', 'Postpaid', 'Corporate'];
  }

  // Save to localStorage for persistence
  localStorage.setItem('dashboardFilters', JSON.stringify(filters));

  // Rebuild WHERE clauses
  const whereClauses = buildWhereClause(filters);

  // Execute queries (async)
  loadDashboardData(whereClauses);
}

function buildWhereClause(filters) {
  let where = '1=1';

  if (filters.year) {
    where += ` AND d.CALENDAR_YEAR = ${filters.year}`;
  }

  if (filters.regions.length > 0) {
    const regions = filters.regions.map(r => `'${r}'`).join(',');
    where += ` AND dg.REGION IN (${regions})`;
  }

  if (filters.segments.length > 0) {
    const segments = filters.segments.map(s => `'${s}'`).join(',');
    where += ` AND ds.CUSTOMER_SEGMENT IN (${segments})`;
  }

  if (filters.planCategories.length > 0) {
    const plans = filters.planCategories.map(p => `'${p}'`).join(',');
    where += ` AND dp.PLAN_CATEGORY IN (${plans})`;
  }

  return where;
}

function loadDashboardData(whereClauses) {
  // Show loading spinner
  document.getElementById('dashboard').classList.add('loading');

  // Execute all dashboard queries with WHERE clause
  Promise.all([
    fetchKPIs(whereClauses),
    fetchRevenueTrend(whereClauses),
    fetchChurnByRegion(whereClauses),
    // ... other chart queries
  ]).then(results => {
    // Update all charts
    updateKPICards(results[0]);
    updateRevenueTrendChart(results[1]);
    updateChurnChart(results[2]);
    // ...

    // Hide loading spinner
    document.getElementById('dashboard').classList.remove('loading');
  }).catch(error => {
    console.error('Filter error:', error);
    showErrorMessage('Failed to update dashboard');
  });
}

// Load persisted filters on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedFilters = JSON.parse(localStorage.getItem('dashboardFilters') || '{}');
  
  // Restore UI state
  if (savedFilters.year) {
    document.getElementById('yearFilter').value = savedFilters.year;
  }
  
  savedFilters.regions?.forEach(region => {
    document.querySelector(`input[value="${region}"][name="region"]`).checked = true;
  });
  
  savedFilters.segments?.forEach(segment => {
    document.querySelector(`input[value="${segment}"][name="segment"]`).checked = true;
  });
  
  savedFilters.planCategories?.forEach(plan => {
    document.querySelector(`input[value="${plan}"][name="plan"]`).checked = true;
  });

  // Apply filters
  applyFilters();
});
```

### resetFilters() Function

```javascript
function resetFilters() {
  // Clear localStorage
  localStorage.removeItem('dashboardFilters');

  // Reset UI to defaults
  document.getElementById('yearFilter').value = '2025';
  document.querySelectorAll('.filter-region').forEach(el => el.checked = true);
  document.querySelectorAll('.filter-segment').forEach(el => el.checked = true);
  document.querySelectorAll('.filter-plan').forEach(el => el.checked = true);

  // Reapply filters (will use defaults)
  applyFilters();
}
```

---

## Filter Bar HTML/CSS

### HTML Structure

```html
<div class="filter-bar sticky">
  <div class="filter-container">
    
    <!-- Year Filter -->
    <div class="filter-group">
      <label for="yearFilter" class="filter-label">Calendar Year</label>
      <select id="yearFilter" class="filter-select" onchange="applyFilters()">
        <option value="">All Years</option>
        <option value="2025" selected>2025</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="2020">2020</option>
        <option value="2019">2019</option>
      </select>
    </div>

    <!-- Region Filter -->
    <div class="filter-group">
      <label class="filter-label">Region</label>
      <div class="filter-chips">
        <label class="filter-chip">
          <input type="checkbox" name="region" value="North" class="filter-region" checked />
          North
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="region" value="South" class="filter-region" checked />
          South
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="region" value="East" class="filter-region" checked />
          East
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="region" value="West" class="filter-region" checked />
          West
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="region" value="Central" class="filter-region" checked />
          Central
        </label>
      </div>
    </div>

    <!-- Segment Filter -->
    <div class="filter-group">
      <label class="filter-label">Segment</label>
      <div class="filter-chips">
        <label class="filter-chip">
          <input type="checkbox" name="segment" value="Mass Market" class="filter-segment" checked />
          Mass Market
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="segment" value="Mid Market" class="filter-segment" checked />
          Mid Market
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="segment" value="Premium" class="filter-segment" checked />
          Premium
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="segment" value="Corporate" class="filter-segment" checked />
          Corporate
        </label>
      </div>
    </div>

    <!-- Plan Category Filter -->
    <div class="filter-group">
      <label class="filter-label">Plan</label>
      <div class="filter-chips">
        <label class="filter-chip">
          <input type="checkbox" name="plan" value="Prepaid" class="filter-plan" checked />
          Prepaid
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="plan" value="Postpaid" class="filter-plan" checked />
          Postpaid
        </label>
        <label class="filter-chip">
          <input type="checkbox" name="plan" value="Corporate" class="filter-plan" checked />
          Corporate
        </label>
      </div>
    </div>

    <!-- Reset Button -->
    <button class="filter-reset" onclick="resetFilters()">Reset All</button>
  </div>
</div>
```

### CSS Styling

```css
.filter-bar {
  background: var(--color-base);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 16px 24px;
  display: flex;
  gap: 24px;
  overflow-x: auto;
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-bar.sticky {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-container {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  background: var(--color-card);
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color 150ms ease;
}

.filter-select:hover {
  border-color: var(--color-accent);
}

.filter-select:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 20px;
  background: var(--color-card);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--color-accent);
  background: var(--color-base);
}

.filter-chip input[type="checkbox"] {
  cursor: pointer;
  width: 14px;
  height: 14px;
  accent-color: var(--color-accent);
}

.filter-chip input[type="checkbox"]:checked + * {
  /* Label text after checkbox */
}

.filter-chip input[type="checkbox"]:checked {
  /* Checkbox checked */
}

.filter-chip:has(input:checked) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-text-inverse);
}

.filter-chip:has(input:checked):hover {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
}

.filter-reset {
  padding: 6px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  background: var(--color-card);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
}

.filter-reset:hover {
  background: var(--color-base);
  border-color: var(--color-text-secondary);
}

.filter-reset:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 1024px) {
  .filter-bar {
    padding: 12px 16px;
    gap: 16px;
  }

  .filter-container {
    gap: 16px;
  }

  .filter-chips {
    gap: 6px;
  }

  .filter-chip {
    padding: 4px 10px;
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .filter-bar {
    flex-direction: column;
    padding: 12px 12px;
  }

  .filter-container {
    flex-direction: column;
    gap: 12px;
  }

  .filter-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .filter-chip {
    flex-shrink: 0;
  }
}
```

---

## Data Exclusions

**NO DATA IS EXCLUDED BY DEFAULT.**

All dashboards show:
- Active + Churned subscribers (unless filtered by IS_ACTIVE)
- All circles and regions
- All plan categories
- All revenue types (base + overage + roaming)
- Test data: If test accounts exist, they are marked in DIM_SUBSCRIBER.ACCOUNT_STATUS and can be manually excluded if desired (not automatic)

**Optional Exclusion Patterns** (if test data needs hiding):

```sql
-- Exclude test accounts (if desired)
AND ds.ACCOUNT_STATUS != 'TEST'

-- Exclude inactive towers (for network metrics)
AND dt.TOWER_TYPE != 'DECOMMISSIONED'

-- Exclude partial months (only full billing periods)
AND fb.DAYS_IN_MONTH = 30  -- or 31
```

These are **not applied automatically** but can be added to query WHERE clauses if test data filtering is needed.

---

## Filter Persistence

**Browser Local Storage:**
- Filters are saved to localStorage on each change
- On page reload, previous filter state is restored
- Users can share dashboard URLs with filters encoded as URL parameters (optional enhancement)

**URL Parameter Encoding** (optional):
```
/dashboards/executive-overview?year=2025&region=North,West&segment=Premium
```

**Implementation (optional):**
```javascript
// Save filters to URL
function updateURL() {
  const params = new URLSearchParams();
  params.set('year', document.getElementById('yearFilter').value || '');
  params.set('region', Array.from(document.querySelectorAll('.filter-region:checked')).map(el => el.value).join(','));
  params.set('segment', Array.from(document.querySelectorAll('.filter-segment:checked')).map(el => el.value).join(','));
  params.set('plan', Array.from(document.querySelectorAll('.filter-plan:checked')).map(el => el.value).join(','));
  
  window.history.replaceState({}, '', `?${params.toString()}`);
}

// Load filters from URL on page load
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('year')) document.getElementById('yearFilter').value = params.get('year');
  params.get('region')?.split(',').forEach(r => {
    document.querySelector(`input[value="${r}"][name="region"]`).checked = true;
  });
  // ... repeat for segment and plan
}
```

---

## Performance Considerations

**Query Caching:**
- Cache aggregated KPI queries (5-minute TTL)
- Cache drill-down trend data (1-minute TTL)
- Invalidate on significant filter changes

**Lazy Loading:**
- Load charts progressively (top KPIs first, then trends, then detailed tables)
- Use skeleton loaders during API calls

**Debouncing:**
- Debounce filter changes by 300ms to avoid rapid re-queries
- Only execute queries when user stops changing filters

```javascript
let filterTimeout;

function applyFilters() {
  clearTimeout(filterTimeout);
  
  filterTimeout = setTimeout(() => {
    // Execute queries
    loadDashboardData(buildWhereClause(getFilterValues()));
  }, 300);  // 300ms debounce
}
```

---

## Summary

| Filter | Type | Multi-select | Default | Applied To |
|--------|------|--------------|---------|------------|
| Calendar Year | Dropdown | No | 2025 | DIM_DATE.CALENDAR_YEAR |
| Region | Chips | Yes | All 5 regions | DIM_GEOGRAPHY.REGION |
| Customer Segment | Chips | Yes | All 4 segments | DIM_SUBSCRIBER.CUSTOMER_SEGMENT |
| Plan Category | Chips | Yes | All 3 categories | DIM_PLAN.PLAN_CATEGORY |

**No exclusions applied by default.** All data visible unless explicitly filtered.

All filters are independent and can be combined in any way (e.g., Premium Postpaid in North region, 2024 calendar year).
