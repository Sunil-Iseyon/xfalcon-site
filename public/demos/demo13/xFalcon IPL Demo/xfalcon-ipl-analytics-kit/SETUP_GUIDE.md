# xFalcon IPL Analytics Hub - Setup & Build Guide

**Project:** xFalcon IPL Analytics Hub
**Last Updated:** 2026-03-31
**Target Audience:** Dashboard builders, data engineers, front-end developers

---

## Quick Start Overview

This analytics kit enables rapid development of 10 production-ready dashboards for IPL cricket data analysis. All reference documents are provided; follow this guide to build, test, and deploy.

**Total Build Time:** ~2 weeks for all 10 dashboards (2 developers, 1 day each)
**Recommended Build Order:** League Overview → Team Performance → Player Analytics → (parallelize remaining)

---

## Prerequisites

### Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Chart Library:** Chart.js v4.x (lightweight, responsive)
- **Data Access:** IDA Connector (mcp__ida__)
- **Font:** Inter (Google Fonts)
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Access Requirements
1. **IDA Connector Access:** `mcp__ida__` enabled in your environment
2. **Database Connection:** Pre-configured connection to IPL database (no schema prefix needed)
3. **Data Tables:** Read access to all 23 tables (confirmed working)
4. **Development Environment:** Any code editor (VS Code, WebStorm, etc.)

### Knowledge Requirements
- Basic SQL (SELECT, JOIN, GROUP BY, WHERE)
- JavaScript fundamentals
- HTML/CSS for web pages
- Cricket fundamentals (runs, wickets, overs, strike rate, economy)

---

## Project Structure

```
xfalcon-ipl-analytics-kit/
├── DASHBOARD_FEASIBILITY.md          [This document directory]
├── DATA_SCHEMA_MAP.md                [Table definitions & joins]
├── RETAILEDGE_THEME.md               [Color palette & styling]
├── METRIC_DEFINITIONS.md             [KPI formulas]
├── GLOBAL_FILTERS.md                 [Filter implementation]
├── SETUP_GUIDE.md                    [You are here]
├── SKILL.md                          [Build skill reference]
├── /dashboards/
│   ├── index.html                    [League Overview Portal - START HERE]
│   ├── 01-team-performance.html
│   ├── 02-player-analytics.html
│   ├── 03-auction-economics.html
│   ├── 04-financial-performance.html
│   ├── 05-broadcast-viewership.html
│   ├── 06-fan-engagement.html
│   ├── 07-venue-analytics.html
│   ├── 08-head-to-head.html
│   └── 09-season-deep-dive.html
├── /assets/
│   ├── css/
│   │   ├── theme.css                 [Color variables, component styles]
│   │   ├── dashboard.css             [Layout, grid system]
│   │   └── responsive.css            [Mobile breakpoints]
│   ├── js/
│   │   ├── filters.js                [Filter logic & state management]
│   │   ├── queries.js                [SQL template engine]
│   │   ├── charts.js                 [Chart.js wrapper & templates]
│   │   └── utils.js                  [Date, currency, formatting helpers]
│   ├── fonts/
│   │   └── inter-fonts.css           [Google Fonts import]
│   └── images/
│       ├── xf-logo-orange-blue.svg   [xF logo]
│       └── franchise-logos/          [15 franchise logos]
└── /query-templates/
    ├── league-overview.sql
    ├── team-performance.sql
    ├── player-analytics.sql
    ├── ... (one per dashboard)
```

---

## File Organization: Creating Dashboard Files

### Step 1: Create Directories
```bash
mkdir -p xfalcon-ipl-analytics-kit/dashboards
mkdir -p xfalcon-ipl-analytics-kit/assets/{css,js,fonts,images/franchise-logos}
mkdir -p xfalcon-ipl-analytics-kit/query-templates
```

### Step 2: Copy Theme & Design Assets
- Place `RETAILEDGE_THEME.md` in root (reference during CSS build)
- Create `assets/css/theme.css` with CSS variables (colors, typography, shadows)
- Download Inter font from Google Fonts → `assets/fonts/inter-fonts.css`
- Create/obtain xF logo in SVG format → `assets/images/xf-logo-orange-blue.svg`

### Step 3: Build Shared Components
Create reusable modules in `assets/js/`:
- `filters.js` - Filter UI & logic (reference GLOBAL_FILTERS.md)
- `queries.js` - SQL query builder & execution via IDA connector
- `charts.js` - Chart.js wrapper with theme colors
- `utils.js` - Currency formatting, date handling, etc.

---

## Reference Documents Usage

### For Dashboard Layout:
**Reference:** DASHBOARD_FEASIBILITY.md
- Read "What Works" section for dashboard scope
- Check "Limitations" before design choices
- Use "Sample Query" as starting point for SQL

**Action:** Design dashboard mockup with filters and KPI layout

### For Data Access:
**Reference:** DATA_SCHEMA_MAP.md
- Find relevant tables in dimension vs. fact sections
- Review "Critical Join Rules" for each dashboard
- Check "Common Column Name Mistakes" table before writing SQL

**Action:** Write SQL queries for each chart/KPI using template from DATA_SCHEMA_MAP

### For Styling:
**Reference:** RETAILEDGE_THEME.md
- Copy CSS variables from "CSS Variables" section
- Use colors from "Chart Color Palette" for all visualizations
- Follow "Component Styling" for buttons, cards, filters
- Ensure WCAG AA contrast compliance

**Action:** Build CSS stylesheet with theme colors, typography, shadows

### For KPI Calculations:
**Reference:** METRIC_DEFINITIONS.md
- Find each metric's formula
- Identify source table and columns
- Apply calculation in SQL or JavaScript
- Use metric interpretation for KPI card context

**Action:** Code SQL calculations for all KPIs (batting average, strike rate, etc.)

### For Filters:
**Reference:** GLOBAL_FILTERS.md
- Implement Season, Franchise, Venue, Match Type filters
- Use filter parameter structure for query generation
- Apply currency formatting rules (INR Crore + USD)
- Add cascade logic (season → franchise → venue)

**Action:** Build filter UI with JavaScript state management

### For Build Best Practices:
**Reference:** SKILL.md
- Check column name mapping table (critical!)
- Review join notes for each table
- Follow chart color rules (Blue/Teal/Gray only)
- Use topbar format: "xFalcon IPL Analytics Hub / Dashboard Name"

**Action:** Validate all SQL joins and column names against SKILL.md

---

## Build Process: Step-by-Step

### Phase 1: Foundation (Days 1-2)

**Day 1: Setup & Common Components**
1. Create directory structure
2. Setup theme CSS with color variables
3. Create HTML base template (topbar, filter bar, content area)
4. Import Google Fonts (Inter)
5. Write `filters.js` - filter UI and state management
6. Write `utils.js` - currency formatter, date helper, array utilities

**Deliverable:** Reusable base template + shared components working

**Day 2: Data Layer & Chart Templates**
1. Write `queries.js` - SQL template engine, IDA connector wrapper
2. Write `charts.js` - Chart.js wrapper with theme colors
3. Test IDA connector with sample query
4. Create SQL query templates (league-overview.sql, etc.)
5. Test data retrieval and chart rendering

**Deliverable:** Data pipeline working, sample chart rendering

---

### Phase 2: Dashboard Development (Days 3-12)

**Dashboard 1: League Overview Portal (index.html) - Day 3 (2 days)**

**Data Queries:**
```sql
-- KPI: Total Matches
SELECT COUNT(DISTINCT MATCH_KEY) as total_matches
FROM FACT_MATCH_RESULT
WHERE SEASON_KEY IN (SELECT SEASON_KEY FROM DIM_SEASON WHERE SEASON_YEAR = :season)

-- KPI: Most Wins This Season
SELECT f.FRANCHISE_NAME, COUNT(*) as wins
FROM FACT_MATCH_RESULT mr
JOIN DIM_FRANCHISE f ON mr.WINNING_TEAM_CODE = f.TEAM_CODE
WHERE SEASON_KEY = :season_key
GROUP BY f.FRANCHISE_NAME
ORDER BY wins DESC LIMIT 1

-- Chart: Season Evolution (Wins by Year)
SELECT s.SEASON_YEAR,
  COUNT(DISTINCT mr.MATCH_KEY) as matches,
  COUNT(DISTINCT CASE WHEN mr.WINNING_TEAM_CODE = :franchise_code THEN mr.MATCH_KEY END) as wins
FROM FACT_MATCH_RESULT mr
JOIN DIM_SEASON s ON mr.SEASON_KEY = s.SEASON_KEY
GROUP BY s.SEASON_YEAR
ORDER BY s.SEASON_YEAR
```

**Layouts:**
- Top KPI cards: Total Matches, Total Franchises, Average TVR, Total Revenue
- 4-chart grid:
  1. Wins per Team (Bar chart, Blue dominant)
  2. Season Evolution (Line chart, Blue #006AFF)
  3. Venue Usage (Pie chart, Blue/Teal/Gray)
  4. TVR Ratings (Area chart, Teal #1A7F64)

**Reference:** DASHBOARD_FEASIBILITY.md (League Overview section)

---

**Dashboard 2: Team Performance (01-team-performance.html) - Days 4-5**

**Data Queries:**
```sql
-- Team Win-Loss Record
SELECT f.FRANCHISE_NAME, f.TEAM_CODE,
  COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as wins,
  COUNT(CASE WHEN mr.LOSING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as losses
FROM FACT_MATCH_RESULT mr
JOIN DIM_FRANCHISE f ON 1=1
WHERE SEASON_KEY = :season_key
GROUP BY f.FRANCHISE_NAME, f.TEAM_CODE

-- Team Batting & Bowling Stats
SELECT f.FRANCHISE_NAME,
  ROUND(SUM(ic.TEAM_SCORE) / COUNT(DISTINCT ic.MATCH_KEY), 1) as avg_runs,
  ROUND(SUM(ic.TEAM_WICKETS_LOST) * 1.0 / COUNT(DISTINCT ic.MATCH_KEY), 1) as avg_wickets
FROM FACT_INNINGS_SCORECARD ic
JOIN DIM_MATCH dm ON ic.MATCH_KEY = dm.MATCH_KEY
JOIN DIM_SEASON ds ON dm.SEASON_KEY = ds.SEASON_KEY
JOIN DIM_FRANCHISE f ON ic.BATTING_TEAM_CODE = f.TEAM_CODE
WHERE ds.SEASON_YEAR = :season
GROUP BY f.FRANCHISE_NAME
```

**Layouts:**
- Team selector dropdown (filter by franchise)
- KPI row: Win %, NRR, Avg Score, Avg Wickets
- Charts:
  1. Win-Loss Record (Bar chart)
  2. Batting Trends (Line chart, Blue)
  3. Bowling Performance (Scatter plot)
  4. Home vs Away (Grouped bar)

**Reference:** DASHBOARD_FEASIBILITY.md (Team Performance section), DATA_SCHEMA_MAP.md (FACT_MATCH_RESULT, FACT_INNINGS_SCORECARD)

---

**Dashboard 3: Player Analytics (02-player-analytics.html) - Days 6-7**

**Data Queries:**
```sql
-- Player Season Stats
SELECT p.PLAYER_NAME, p.PLAYER_ROLE, p.NATIONALITY,
  pss.TOTAL_RUNS, pss.BATTING_AVERAGE, pss.STRIKE_RATE,
  pss.WICKETS, pss.BOWLING_AVERAGE, pss.ECONOMY_RATE,
  pss.MVP_SCORE
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
WHERE pss.SEASON_KEY = :season_key
  AND p.PLAYER_ROLE IN (:selected_roles)
ORDER BY pss.MVP_SCORE DESC

-- Top Run Scorers
SELECT p.PLAYER_NAME, pss.TOTAL_RUNS, pss.BATTING_AVERAGE, pss.STRIKE_RATE
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
WHERE pss.SEASON_KEY = :season_key
ORDER BY pss.TOTAL_RUNS DESC LIMIT 10
```

**Layouts:**
- Filters: Season, Player Role, Nationality
- KPI row: Top Batsman, Top Bowler, Most Valuable Player
- Charts:
  1. Top 10 Run Scorers (Horizontal bar, Blue)
  2. Top 10 Wicket Takers (Horizontal bar, Teal)
  3. Batting Avg vs Strike Rate (Scatter, Blue/Teal)
  4. MVP Score Distribution (Histogram, Gray)

**Reference:** DASHBOARD_FEASIBILITY.md (Player Analytics), DATA_SCHEMA_MAP.md (FACT_PLAYER_SEASON_STATS), METRIC_DEFINITIONS.md (MVP Score, Batting Average, etc.)

---

**Dashboards 4-10: Parallelize Build (Days 8-12)**

Assign remaining 7 dashboards to team members (1 dev per dashboard):

**Dashboard 4 (Auction Economics)** - Queries: FACT_PLAYER_AUCTION, DIM_AUCTION_YEAR
**Dashboard 5 (Financial Performance)** - Queries: FACT_FRANCHISE_FINANCIALS, FACT_TICKET_SALES
**Dashboard 6 (Broadcast & Viewership)** - Queries: FACT_BROADCAST_RATINGS, FACT_STREAMING_OVER_VIEWERSHIP
**Dashboard 7 (Fan Engagement)** - Queries: FACT_FAN_ENGAGEMENT, FACT_SOCIAL_MEDIA_SENTIMENT
**Dashboard 8 (Venue Analytics)** - Queries: DIM_VENUE, FACT_VENUE_CONDITIONS, FACT_MATCH_RESULT
**Dashboard 9 (Head-to-Head)** - Queries: FACT_MATCH_RESULT with franchise pairs
**Dashboard 10 (Season Deep-Dive)** - Queries: All tables, comprehensive season analysis

Follow same pattern for each:
1. Read feasibility assessment in DASHBOARD_FEASIBILITY.md
2. Extract sample query
3. Build data layer (queries.js templates)
4. Create HTML layout
5. Add charts using charts.js wrapper
6. Test filters and interactivity
7. Apply theme colors and styling

---

### Phase 3: Testing & Refinement (Days 13-14)

**Day 13: Integration Testing**
- Test all 10 dashboards for data accuracy
- Verify filters cascade correctly (season → franchise → venue)
- Check currency formatting (INR Crore + USD conversion)
- Validate chart colors (Blue/Teal/Gray, no red/green in data)
- Test responsive design on mobile, tablet, desktop

**Day 14: QA & Documentation**
- Performance testing (chart load times)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Accessibility audit (keyboard nav, screen reader, contrast)
- Document any deviations from spec
- Create deployment runbook

**Deliverable:** Production-ready dashboards, all tests passing

---

## Key Implementation Tips

### SQL Query Optimization

**Always aggregate before visualizing:**
```sql
-- WRONG (if > 100K rows in FACT_BALL_BY_BALL)
SELECT * FROM FACT_BALL_BY_BALL WHERE MATCH_KEY = :match_key
-- Returns all 390 balls, then aggregates in JavaScript

-- RIGHT
SELECT BOWLER_PLAYER_KEY, COUNT(*) as deliveries, SUM(RUNS_OFF_BAT) as runs
FROM FACT_BALL_BY_BALL
WHERE MATCH_KEY = :match_key
GROUP BY BOWLER_PLAYER_KEY
-- Returns 11 bowlers, aggregated server-side
```

**Use joins correctly (critical!):**
```sql
-- For match-level data:
WHERE WINNING_TEAM_CODE IN (SELECT TEAM_CODE FROM DIM_FRANCHISE WHERE ...)
-- NOT: WHERE WINNING_TEAM_CODE IN (SELECT FRANCHISE_KEY FROM ...)
-- Team codes are 3-letter (MI, CSK), not franchise keys (1-15)
```

**Check DATA_SCHEMA_MAP for column names:**
- Not `WINNING_TEAM` but `WINNING_TEAM_CODE`
- Not `AUCTION_PRICE` but `SOLD_PRICE_CRORE`
- Not `BOWLS_BOWLED` but `OVERS_BOWLED`

### Chart Implementation

**Use theme colors consistently:**
```javascript
// charts.js wrapper
const chartConfig = {
  type: 'bar',
  data: {
    labels: [...],
    datasets: [
      {
        label: 'Runs Scored',
        data: [...],
        backgroundColor: '#006AFF',  // Blue (#006AFF)
        borderColor: '#006AFF'
      },
      {
        label: 'Wickets Lost',
        data: [...],
        backgroundColor: '#1A7F64',  // Teal (#1A7F64)
        borderColor: '#1A7F64'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#F5F7FA' }  // Primary text color
      }
    },
    scales: {
      y: {
        ticks: { color: '#8B95A5' }   // Secondary text color
      },
      x: {
        ticks: { color: '#8B95A5' }
      }
    }
  }
};
```

### Filter Implementation

**Save filter state to localStorage:**
```javascript
// filters.js
function saveFilterState(filters) {
  localStorage.setItem('ipl_filters', JSON.stringify(filters));
}

function loadFilterState() {
  return JSON.parse(localStorage.getItem('ipl_filters')) || getDefaultFilters();
}

function getDefaultFilters() {
  return {
    seasons: [2024],
    franchises: [],  // All if empty
    venues: [],
    matchType: 'Both',
    playerRoles: [],
    nationality: 'Both'
  };
}
```

**Cascade filters (season → franchise):**
```javascript
function onSeasonChange(selectedSeasons) {
  // Get active franchises for selected seasons
  const activeFranchises = getActiveFranchisesForSeasons(selectedSeasons);

  // Update franchise dropdown options
  updateFranchiseOptions(activeFranchises);

  // Filter current selections to valid franchises
  const validSelections = filters.franchises.filter(f => activeFranchises.includes(f));
  filters.franchises = validSelections;

  // Trigger data refresh
  refreshDashboard();
}
```

### Currency Formatting

**Always display both INR Crore and USD:**
```javascript
// utils.js
function formatCurrency(croreAmount) {
  const usdAmount = (croreAmount * 0.12).toFixed(1);
  return `₹${croreAmount.toFixed(1)} Cr ($${usdAmount}M USD)`;
}

// Usage:
const revenue = 35;  // 35 Crore
console.log(formatCurrency(revenue));  // ₹35.0 Cr ($4.2M USD)
```

### Topbar Format

**Every dashboard includes:**
```html
<header class="topbar">
  <div class="topbar-content">
    <div class="logo-section">
      <img src="assets/images/xf-logo-orange-blue.svg" alt="xFalcon" class="xf-logo">
    </div>
    <div class="title-section">
      <h1 class="breadcrumb">
        <span class="breadcrumb-primary">xFalcon IPL Analytics Hub</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Team Performance Analytics</span>
      </h1>
    </div>
    <div class="filter-section">
      <!-- Filters UI here -->
    </div>
  </div>
</header>
```

**CSS:**
```css
.breadcrumb-primary { color: #8B95A5; }     /* Secondary text */
.breadcrumb-sep { color: #5A6370; margin: 0 4px; } /* Tertiary text */
.breadcrumb-current { color: #F5F7FA; font-weight: 700; } /* Primary text, bold */
```

---

## Deployment Checklist

- [ ] All 10 dashboards built and tested
- [ ] SQL queries optimized (no SELECT * on large tables)
- [ ] Chart colors compliant (Blue/Teal/Gray for data, Red/Green for KPI arrows only)
- [ ] Filters working with cascade logic
- [ ] Currency formatting applied (INR Crore + USD)
- [ ] Theme colors applied per RETAILEDGE_THEME.md
- [ ] Topbar format correct: "xFalcon IPL Analytics Hub / Dashboard Name"
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility audit passed (keyboard nav, WCAG AA contrast)
- [ ] Performance: All dashboards load in < 3 seconds
- [ ] Documentation updated (README, query templates)
- [ ] Team trained on filter/query usage

---

## Common Pitfalls to Avoid

### SQL Pitfalls:
1. **Using FRANCHISE_KEY instead of TEAM_CODE in FACT_MATCH_RESULT joins**
   - Wrong: `WHERE WINNING_TEAM_CODE = f.FRANCHISE_KEY`
   - Right: `WHERE WINNING_TEAM_CODE = f.TEAM_CODE`

2. **Missing aggregation on large fact tables**
   - Wrong: SELECT * FROM FACT_BALL_BY_BALL (279K rows)
   - Right: SELECT ... GROUP BY with aggregation

3. **Not handling NULL values (not-outs, no bowling)**
   - Wrong: `Batting Average = Total Runs / Innings Batted`
   - Right: `= Total Runs / (Innings Batted - Not Outs)`

### Design Pitfalls:
1. **Using red/green in data charts** (colorblind-unfriendly)
   - Wrong: Green bars for wins, red for losses
   - Right: Blue bars for wins, Teal for losses, green/red only for KPI arrows

2. **Inconsistent currency formatting**
   - Wrong: Mix of "35 Crore", "₹35", "$4.2M"
   - Right: "₹35 Cr ($4.2M USD)" everywhere

3. **Missing topbar on dashboards**
   - Wrong: Dashboard title in H1, xF logo missing
   - Right: Full topbar with xF logo + "xFalcon IPL Analytics Hub / Dashboard Name"

### Performance Pitfalls:
1. **Loading all 1,171 matches at once**
   - Wrong: No season filter, rendering all match records
   - Right: Default to 2024, allow user to select other seasons

2. **Non-responsive charts**
   - Wrong: Fixed width charts (breaks on mobile)
   - Right: responsive: true in Chart.js config

---

## Support & Troubleshooting

### Query Not Returning Data:
1. Check IDA connector is available (`mcp__ida__`)
2. Verify table names (no schema prefix, exact spelling)
3. Review DATA_SCHEMA_MAP.md for correct column names
4. Check filter logic (season exists, franchise in that season, etc.)
5. Run query manually to debug

### Chart Not Rendering:
1. Check data is returned (console.log dataset)
2. Verify Chart.js library loaded
3. Check container div ID exists in HTML
4. Review browser console for JavaScript errors

### Filter Not Cascading:
1. Review GLOBAL_FILTERS.md cascade logic
2. Check localStorage for saved state
3. Verify onSeasonChange handler triggers franchise filter update
4. Test with JavaScript debugger (breakpoints)

### Theme Colors Not Applied:
1. Verify CSS variables defined in :root
2. Check chart backgroundColor using theme color variable
3. Review RETAILEDGE_THEME.md for color hex codes
4. Inspect element in browser dev tools

---

## Next Steps After Deployment

1. **Monitor Performance:**
   - Track dashboard load times
   - Monitor IDA query latency
   - Alert if > 5 second load time

2. **Gather User Feedback:**
   - Survey users on usability
   - Track filter usage patterns
   - Identify most-used dashboards

3. **Iterate on Dashboards:**
   - Add new visualizations based on feedback
   - Refine data filtering (cascade improvements)
   - Expand to additional KPIs as data improves

4. **Plan Enhancements:**
   - Real-time data updates (if applicable)
   - Scheduled report generation (email snapshots)
   - API-based data export (CSV, JSON)

---

**Questions?** Contact: analytics@xfalcon-ipl.com
**Documentation:** Refer to README files in each dashboard directory
**Version:** xFalcon IPL Analytics Kit v1.0
**Last Updated:** 2026-03-31
