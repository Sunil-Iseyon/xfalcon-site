---
name: falcon-worldcup360
description: Build skill for Falcon World Cup 360 Analytics dashboards - knows schema, theme, metrics, filters, and build patterns
type: project
---

# Falcon World Cup 360 — Build Skill

**Project:** FIFA World Cup 360 Analytics Dashboard Kit  
**Data Source:** Kaggle + Synthetic World Cup Data (1930–2014)  
**IDA Connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb` (ONLY connector — do not use others)  
**Theme:** Soccer Green & Gold (Light)  
**Generated:** 2026-04-14

---

## IDA Connector

**UUID:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

**Critical Rules:**
- This is the ONLY connector used for this project
- Do NOT use other IDA connectors or attempt to connect to different databases
- Table names do NOT need schema prefix (use `FACT_MATCH`, not `public.FACT_MATCH`)
- No authentication needed — connector handles all queries automatically
- Browser console logs failed queries for debugging

---

## Complete Table List with Key Columns

### Dimension Tables

**DIM_TOURNAMENT**
- TOURNAMENT_KEY (PK)
- YEAR_NUM (1930, 1934, ..., 2014)
- HOST_COUNTRY
- WINNER
- TOTAL_GOALS
- TOTAL_ATTENDANCE
- QUALIFIED_TEAMS
- MATCHES_PLAYED
- START_DATE, END_DATE

**DIM_TEAM**
- TEAM_KEY (PK)
- TEAM_NAME
- CONFEDERATION (AFC, CAF, CONCACAF, CONMEBOL, UEFA, OFC)
- ISO_CODE
- FIRST_TOURNAMENT_YEAR
- TITLES_WON
- WORLD_CUP_APPEARANCES

**DIM_PLAYER**
- PLAYER_KEY (PK)
- PLAYER_NAME
- POSITION (GK, D, M, F) — may be NULL for older players
- BIRTH_YEAR — NULL for ~20% of pre-1966 players
- TEAM_KEY (FK)
- DEBUT_YEAR
- NATIONALITY

**DIM_VENUE**
- VENUE_KEY (PK)
- STADIUM_NAME
- CITY
- COUNTRY
- CONTINENT
- CAPACITY — NULL for ~10% of historical venues
- SURFACE_TYPE
- LATITUDE, LONGITUDE — may be NULL
- YEAR_FIRST_HOSTED

**DIM_BROADCASTER**
- BROADCASTER_KEY (PK)
- BROADCASTER_NAME
- MARKET (region/country)
- PLATFORM_TYPE (TV, Radio, Digital, etc.)
- FOUNDED_YEAR

**DIM_SPONSOR**
- SPONSOR_KEY (PK)
- SPONSOR_NAME
- TIER (Gold, Silver, Bronze, Official Partner)
- CATEGORY (Automotive, Beverage, Technology, etc.)
- HEADQUARTERS_COUNTRY

**DIM_MERCHANDISE_PRODUCT**
- PRODUCT_KEY (PK)
- PRODUCT_NAME
- SKU
- CATEGORY (Apparel, Accessories, Collectibles, Equipment)
- BASE_PRICE_USD

**DIM_CHANNEL**
- CHANNEL_KEY (PK)
- CHANNEL_NAME (Retail, E-commerce, Official Store, Wholesale, etc.)
- CHANNEL_TYPE (B2C, B2B, etc.)

**DIM_DATE**
- DATE_KEY (PK)
- CALENDAR_DATE
- YEAR_NUM
- MONTH_NUM
- FISCAL_YEAR (July–June cycle)
- QUARTER
- DAY_OF_WEEK

**DIM_STAGE**
- STAGE_KEY (PK)
- STAGE_NAME (Group Stage, Round of 16, Quarterfinal, Semifinal, Third Place, Final)
- STAGE_ORDER (1, 2, 3, 4, 5, 6)

### Fact Tables

**FACT_MATCH**
- MATCH_KEY (PK)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- STAGE_KEY (FK → DIM_STAGE)
- VENUE_KEY (FK → DIM_VENUE)
- HOME_TEAM_KEY (FK → DIM_TEAM)
- AWAY_TEAM_KEY (FK → DIM_TEAM)
- MATCH_DATE (DATE)
- HOME_GOALS, AWAY_GOALS (full-time)
- HOME_GOALS_HT, AWAY_GOALS_HT (half-time)
- TOTAL_GOALS = HOME_GOALS + AWAY_GOALS
- MATCH_RESULT ('H' = Home win, 'A' = Away win, 'D' = Draw)
- WIN_CONDITIONS (Normal, AET, Penalties)
- ATTENDANCE
- REFEREE_NAME
- NOTES (penalties details, etc.)

**FACT_PLAYER_MATCH**
- PLAYER_MATCH_KEY (PK)
- PLAYER_KEY (FK → DIM_PLAYER)
- MATCH_KEY (FK → FACT_MATCH)
- TEAM_KEY (FK → DIM_TEAM)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- GOALS_SCORED
- OWN_GOALS
- YELLOW_CARDS
- RED_CARDS
- MINUTES_PLAYED
- LINEUP_STATUS ('S' = Starting, 'B' = Bench, 'U' = Unused)
- SUBSTITUTION_TIME (NULL if not substituted)
- PENALTIES_SCORED

**FACT_TICKET_SALES**
- TICKET_SALES_KEY (PK)
- MATCH_KEY (FK → FACT_MATCH)
- VENUE_KEY (FK → DIM_VENUE)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- PRICE_TIER (Premium, Standard, General Admission, VIP, Corporate, Family)
- TICKETS_SOLD
- TICKET_PRICE_USD
- REVENUE_USD = TICKETS_SOLD × TICKET_PRICE_USD
- DEMAND_INDEX (1.0 = baseline, 1.5 = high demand)
- RESALE_PCT (percentage of tickets resold)
- SALES_DATE

**FACT_MERCHANDISE_SALES**
- MERCHANDISE_SALE_KEY (PK)
- PRODUCT_KEY (FK → DIM_MERCHANDISE_PRODUCT)
- CHANNEL_KEY (FK → DIM_CHANNEL)
- TEAM_KEY (FK → DIM_TEAM)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- UNITS_SOLD
- UNIT_PRICE_USD
- REVENUE_USD = UNITS_SOLD × UNIT_PRICE_USD
- COGS_USD
- GROSS_MARGIN_USD (pre-computed, do NOT calculate as REVENUE - COGS)
- PROMO_FLAG (1 = promotional pricing)
- DISCOUNT_PCT (discount if PROMO_FLAG = 1)
- SALES_DATE

**FACT_BROADCAST_RIGHTS**
- BROADCAST_RIGHTS_KEY (PK)
- BROADCASTER_KEY (FK → DIM_BROADCASTER)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- RIGHTS_FEE_USD (cost of broadcast rights)
- AD_REVENUE_USD (advertising sold against the broadcast)
- SUB_LICENSING_REVENUE_USD (revenue from sub-licensing to other broadcasters)
- PEAK_VIEWERS_MILLIONS
- AVG_VIEWERS_MILLIONS
- TOTAL_BROADCAST_HOURS
- MATCHES_BROADCAST
- START_DATE, END_DATE

**FACT_SPONSORSHIP**
- SPONSORSHIP_KEY (PK)
- SPONSOR_KEY (FK → DIM_SPONSOR)
- TOURNAMENT_KEY (FK → DIM_TOURNAMENT)
- CONTRACT_VALUE_USD (sponsorship fee paid to FIFA)
- ACTIVATION_SPEND_USD (sponsor's marketing spend around the tournament)
- MEDIA_VALUE_USD (estimated earned media value from brand visibility)
- BRAND_EXPOSURE_HOURS (estimated hours of brand visibility during broadcasts)
- ESTIMATED_REACH_MILLIONS
- RENEWAL_FLAG (1 = sponsor renewed for next tournament)
- DEAL_TYPE (Exclusive, Non-exclusive, Regional)
- START_DATE, END_DATE

---

## Common Column Name Mistakes

When building queries, watch for these misunderstandings:

| Wrong Assumption | Correct Column Name | Notes |
|------------------|---------------------|-------|
| "I want total goals scored by a team in a match" | Use FACT_MATCH.HOME_GOALS + FACT_MATCH.AWAY_GOALS (depending on context) | Do NOT use FACT_PLAYER_MATCH.GOALS_SCORED (player-level only) |
| "I want to filter matches by tournament year" | Use DIM_TOURNAMENT.YEAR_NUM (e.g., WHERE YEAR_NUM = 1994) | Do NOT use TOURNAMENT_KEY (that's the foreign key) |
| "I want the result of a match (who won)" | Use FACT_MATCH.MATCH_RESULT ('H', 'A', 'D') or compare HOME_GOALS vs AWAY_GOALS | Do NOT assume WINNER column in FACT_MATCH (doesn't exist) |
| "I want how many times a team won a tournament" | Use COUNT(*) WHERE TEAM_NAME = DIM_TOURNAMENT.WINNER | Do NOT use FACT_MATCH (use DIM_TOURNAMENT for tournament winners) |
| "I want a player's total goals across all tournaments" | SUM(FACT_PLAYER_MATCH.GOALS_SCORED) GROUP BY PLAYER_KEY | Watch for NULL own goals; use COALESCE(OWN_GOALS, 0) |
| "I want to count matches" | COUNT(*) FROM FACT_MATCH or COUNT(DISTINCT MATCH_KEY) | Do NOT use FACT_PLAYER_MATCH (37K rows, one per player appearance) |
| "I want attendance for a stadium" | SUM(FACT_MATCH.ATTENDANCE) WHERE VENUE_KEY = X | Do NOT confuse with FACT_TICKET_SALES.TICKETS_SOLD (different concept) |
| "I want merchandise revenue by category" | SUM(REVENUE_USD) FROM FACT_MERCHANDISE_SALES JOIN DIM_MERCHANDISE_PRODUCT GROUP BY CATEGORY | Watch: REVENUE_USD is pre-calculated; do NOT use UNITS_SOLD × UNIT_PRICE_USD |
| "I want revenue that counts real matches only" | Join FACT_TICKET_SALES to FACT_MATCH on MATCH_KEY; filter by FACT_MATCH dates | Ticket sales are synthetic but tied to real match data |
| "I want sponsor ROI" | MEDIA_VALUE_USD / CONTRACT_VALUE_USD (NOT including ACTIVATION_SPEND_USD) | Activation spend is separate from sponsorship ROI calculation |

---

## Join Patterns (Which Keys Connect Which Tables)

### Match & Venue
```sql
FROM FACT_MATCH m
JOIN DIM_VENUE v ON m.VENUE_KEY = v.VENUE_KEY
```
Use for: Stadium name, city, capacity, attendance analysis

### Match & Teams
```sql
FROM FACT_MATCH m
JOIN DIM_TEAM h ON m.HOME_TEAM_KEY = h.TEAM_KEY
JOIN DIM_TEAM a ON m.AWAY_TEAM_KEY = a.TEAM_KEY
```
Use for: Team names in match results, home vs. away analysis

### Match & Tournament
```sql
FROM FACT_MATCH m
JOIN DIM_TOURNAMENT t ON m.TOURNAMENT_KEY = t.TOURNAMENT_KEY
```
Use for: Tournament year, host country, winner, filtering by year

### Match & Stage
```sql
FROM FACT_MATCH m
JOIN DIM_STAGE s ON m.STAGE_KEY = s.STAGE_KEY
```
Use for: Group stage vs. knockouts, stage progression

### Player Match & Player/Team
```sql
FROM FACT_PLAYER_MATCH pm
JOIN DIM_PLAYER p ON pm.PLAYER_KEY = p.PLAYER_KEY
JOIN DIM_TEAM t ON pm.TEAM_KEY = t.TEAM_KEY
```
Use for: Player names, positions, team affiliation at time of match

### Ticket Sales & Match
```sql
FROM FACT_TICKET_SALES ts
JOIN FACT_MATCH m ON ts.MATCH_KEY = m.MATCH_KEY
JOIN DIM_VENUE v ON ts.VENUE_KEY = v.VENUE_KEY
```
Use for: Revenue by stadium, match, or tournament; attendance vs. ticket sales

### Merchandise Sales & Products
```sql
FROM FACT_MERCHANDISE_SALES ms
JOIN DIM_MERCHANDISE_PRODUCT p ON ms.PRODUCT_KEY = p.PRODUCT_KEY
JOIN DIM_CHANNEL c ON ms.CHANNEL_KEY = c.CHANNEL_KEY
```
Use for: Revenue by category, channel, SKU; promo effectiveness

### Broadcast & Broadcaster
```sql
FROM FACT_BROADCAST_RIGHTS br
JOIN DIM_BROADCASTER b ON br.BROADCASTER_KEY = b.BROADCASTER_KEY
```
Use for: Rights fees, ad revenue, viewership by broadcaster/market

### Sponsorship & Sponsor
```sql
FROM FACT_SPONSORSHIP s
JOIN DIM_SPONSOR sp ON s.SPONSOR_KEY = sp.SPONSOR_KEY
```
Use for: Contract value, media value, ROI by sponsor, tier, or category

---

## Theme Specification: Soccer Green & Gold (Light)

### Primary Colors
- **Dark Green** (#1B5E20): Topbar, headers, KPI values, titles
- **Accent Gold** (#FFD600): Logo highlight, selected states, accent border
- **White** (#FFFFFF): Card backgrounds
- **Light Gray** (#F3F4F6): Page background
- **Deep Green-Black** (#0A2E11): Topbar bottom gradient, dark accents

### Chart Palette (in hex, use directly in Chart.js)
```javascript
['#1B5E20', '#C8A415', '#94A3B8', '#4CAF50', '#F59E0B']
```
- #1B5E20 = Primary / Actual / Current (dark green)
- #C8A415 = Secondary / Comparison (darker gold)
- #94A3B8 = Tertiary / Baseline (gray)
- #4CAF50 = Extended 1 (light green)
- #F59E0B = Extended 2 (amber)

### Text Colors
- Primary: #1E293B (body text, table data)
- Secondary: #64748B (labels, descriptions)
- On Dark BG: #F1FAE5 (topbar text)
- On Gold: #1B5E20 (text on gold backgrounds)

### Functional Colors
- Card Border: #E2E8F0
- Table Header BG: #1B5E20 with text #FFFFFF
- Row Hover: #F0FFF4 (light green)
- Positive: #059669 (green delta)
- Negative: #D32F2F (red delta)
- Neutral: #94A3B8 (gray delta)

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| **KPI Label** | 12px | 600 | #64748B |
| **KPI Value** | 28px | 700 | #1B5E20 |
| **KPI Delta** | 13px | 500 | #059669 or #D32F2F |
| **Chart Title** | 16px | 700 | #1B5E20 |
| **Section Title** | 18px | 700 | #1B5E20 |
| **Table Header** | 13px | 600 | #FFFFFF on #1B5E20 |
| **Table Body** | 13px | 400 | #1E293B |
| **Topbar Title** | 18px | 700 | #F1FAE5 |
| **Font Family** | Inter (Google Fonts CDN) | | |

### Topbar Specification

**HTML Structure**
```html
<div class="topbar">
  <div class="topbar-left">
    <div class="logo">
      <span style="color:#66BB6A">x</span><span style="color:#FFD600">F</span>
    </div>
    <div>
      <div class="topbar-title">Falcon World Cup 360 / Dashboard Name</div>
      <div class="topbar-subtitle" id="reporting-period">All Tournaments: 1930–2014</div>
    </div>
  </div>
  <a href="index.html" class="back-link">← Back to Portal</a>
</div>
```

**CSS**
- Background: `linear-gradient(135deg, #1B5E20 0%, #0A2E11 100%)`
- Border-bottom: `3px solid #FFD600`
- Padding: `16px 24px`
- Display: flex, align-items: center, justify-content: space-between
- Position: sticky, top: 0, z-index: 100

**Logo**
- Font size: 28px, weight 700, letter-spacing -1px
- "x" = color #66BB6A (light green)
- "F" = color #FFD600 (gold)

**Back Link**
- Color: #FFD600 (gold)
- Font: 14px / 600
- Hover: underline
- Always positioned on RIGHT side

**Subtitle**
- Update with filters: e.g., "Tournament: 1994" or "All Tournaments: 1930–2014"
- Color: #FFD600 (gold)
- Font: 12px / 600

### Card Styling

```css
.card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 20px;
}
```

### Layout Rules
- Page background: #F3F4F6
- Max content width: 1400–1600px (centered)
- Grid gap: 20px
- KPI cards: 4-column grid (responsive)
- Chart containers: Full-width or 2-column grid

---

## Build Rules & Patterns

### JavaScript Variables
**Rule:** Use `var` for all variables.
```javascript
var chartData = {...};
var filters = {...};
var charts = {};
```
Do NOT use `const` or `let`.

### Functions
**Rule:** Use function declaration syntax `function name() {...}`
```javascript
function applyFilters() {
  // query data, update charts
}

function updateChart(chartId, data) {
  // chart logic
}
```
Do NOT use arrow functions: `const fn = () => {}`

### String Concatenation
**Rule:** Use `+` operator.
```javascript
var sql = "SELECT * FROM FACT_MATCH WHERE YEAR_NUM = " + filterYear;
var message = "Tournament: " + year + " (" + venue + ")";
```
Do NOT use template literals: `` `SELECT * FROM FACT_MATCH WHERE YEAR_NUM = ${filterYear}` ``

### Colors in Chart.js
**Rule:** Always use hex strings directly.
```javascript
var myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [...],
    datasets: [{
      backgroundColor: '#1B5E20',  // ← hex, not var()
      borderColor: '#FFD600',
      data: [...]
    }]
  }
});
```
Do NOT reference CSS variables: `backgroundColor: 'var(--color-primary)'`

### Chart Types
**Allowed:** line, bar, scatter, bubble, radar, area
**Forbidden:** barh, pie, doughnut

**Why:** No horizontal bar charts (use bar with horizontal layout option). No pie/doughnut for World Cup data — use bar charts for categorical comparisons.

### Chart.js Version
**CDN:** `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`

Always reference v4.4.0 explicitly. Do not use latest or v4.x.x.

### Chart Instance Management: mk() Pattern

**Pattern:** Create a helper function to instantiate or update charts safely.

```javascript
var charts = {};  // global chart store

function mk(chartId, chartConfig) {
  // Destroy old chart if it exists
  if (charts[chartId]) {
    charts[chartId].destroy();
  }
  
  var ctx = document.getElementById(chartId).getContext('2d');
  charts[chartId] = new Chart(ctx, chartConfig);
  return charts[chartId];
}
```

**Usage:**
```javascript
var config = {
  type: 'bar',
  data: {
    labels: [...],
    datasets: [{...}]
  },
  options: {...}
};

mk('chartGoals', config);  // Creates or updates chart with id="chartGoals"
```

**Benefits:**
- Prevents memory leaks from multiple Chart instances
- Centralizes chart state management
- Easy to reference charts later: `charts[chartId]`

### KPI Text Sizing: fitKpiText() Pattern

**Problem:** KPI values may overflow on mobile or be too small on large screens.

**Pattern:**
```javascript
function fitKpiText() {
  var kpiValues = document.querySelectorAll('.kpi-value');
  
  kpiValues.forEach(function(el) {
    var parent = el.parentElement;
    var baseSize = 28;  // 28px base
    var ratio = parent.offsetWidth / 200;  // 200px = target width
    
    var newSize = Math.max(18, Math.min(baseSize, baseSize * ratio));
    el.style.fontSize = newSize + 'px';
  });
}

// Call on load and on window resize
window.addEventListener('resize', fitKpiText);
fitKpiText();
```

**CSS:**
```css
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1B5E20;
  transition: font-size 0.2s;
}
```

---

## Dashboard List (11 Total)

### Portal & Metrics Library
| File | Purpose | Live |
|------|---------|------|
| `index.html` | Portal (navigation, master KPIs, tournament picker) | Yes |
| `metrics-definitions.html` | Searchable metric definitions & formulas | Yes |

### Main Dashboards (10)
| # | File | Primary Tables | Key Charts | Status |
|---|------|---|---|---|
| 1 | `01-tournament-overview.html` | DIM_TOURNAMENT, all facts | KPI summary, revenue streams | READY |
| 2 | `02-match-analytics.html` | FACT_MATCH, DIM_STAGE, DIM_VENUE | Goals by stage, attendance, results | READY |
| 3 | `03-player-performance.html` | FACT_PLAYER_MATCH, DIM_PLAYER, DIM_TEAM | Top scorers, cards, minutes | READY |
| 4 | `04-team-rankings.html` | FACT_MATCH, FACT_PLAYER_MATCH, DIM_TEAM | Win rates, goal differential, confederation | READY |
| 5 | `05-ticket-revenue.html` | FACT_TICKET_SALES, DIM_VENUE, DIM_TOURNAMENT | Revenue by tier, demand index, resale | READY |
| 6 | `06-merchandise-sales.html` | FACT_MERCHANDISE_SALES, DIM_MERCHANDISE_PRODUCT, DIM_CHANNEL | Revenue by category/channel, margin %, promo | READY |
| 7 | `07-broadcast-media.html` | FACT_BROADCAST_RIGHTS, DIM_BROADCASTER | Rights fees, viewership, ad revenue | READY |
| 8 | `08-sponsorship-roi.html` | FACT_SPONSORSHIP, DIM_SPONSOR | Contract value, ROI multiples, renewal | READY |
| 9 | `09-venue-attendance.html` | FACT_MATCH, FACT_TICKET_SALES, DIM_VENUE | Utilization %, capacity, attendance trends | READY |
| 10 | `10-historical-trends.html` | DIM_TOURNAMENT, all facts | 84-year time series (1930–2014) | READY |

---

## QA Checklist Before Deployment

### Data Integrity
- [ ] All KPI values match formula definitions in METRIC_DEFINITIONS.md
- [ ] No NaN, Infinity, or undefined values in charts
- [ ] Null handling: queries with `WHERE CAPACITY IS NOT NULL` where needed
- [ ] Aggregation queries use GROUP BY (no SELECT * on large tables)
- [ ] Tournament year filter correctly updates all charts
- [ ] All joins are ON correct keys (no unintended cross-joins)

### UI & Styling
- [ ] Topbar gradient and gold border visible on all dashboards
- [ ] Logo: green "x" (#66BB6A) and gold "F" (#FFD600) render correctly
- [ ] Back link on RIGHT side, gold color, links to index.html
- [ ] KPI values: 28px/700/dark green (#1B5E20)
- [ ] KPI labels: 12px/600/secondary gray (#64748B)
- [ ] Card backgrounds: white (#FFFFFF) with subtle border (#E2E8F0)
- [ ] Page background: light gray (#F3F4F6)
- [ ] All text is Inter font (Google Fonts loaded)

### Chart Rendering
- [ ] All charts render without "Chart not defined" errors
- [ ] Chart colors use hex strings (not CSS vars)
- [ ] Chart palette consistent: `['#1B5E20', '#C8A415', '#94A3B8', '#4CAF50', '#F59E0B']`
- [ ] No pie, doughnut, or barh charts
- [ ] Chart.js v4.4.0 CDN loads successfully
- [ ] Charts are responsive (maintainAspectRatio: false for flex containers)
- [ ] Legends display correctly for multi-series charts

### Filters & Interactivity
- [ ] Tournament Year filter updates subtitle to show selected year
- [ ] Dashboard-specific filters (Stage, Position, Category, etc.) work correctly
- [ ] Filter changes immediately update all KPIs and charts
- [ ] Subtitle updates: "Tournament: 1994" or "All Tournaments: 1930–2014"
- [ ] No console errors on filter change

### Data Quality
- [ ] Real data dashboards (Match, Player) show correct row counts
- [ ] Synthetic data tables (Ticket, Merch, Broadcast, Sponsorship) load without error
- [ ] NULL capacity/coordinates don't break venue utilization chart
- [ ] Player birth year NULLs don't crash dashboards

### Performance
- [ ] Dashboard loads within 3 seconds on good connection
- [ ] Charts render smoothly (no visible lag on filter change)
- [ ] No memory leaks (check DevTools → Memory after filter cycling)
- [ ] mk() pattern properly destroys old chart instances

### Accessibility
- [ ] All charts have meaningful alt text or captions
- [ ] Color contrast: text passes WCAG AA standard
- [ ] Keyboard: Tab through filters, Enter to submit
- [ ] Links have visible focus state

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Data Quality Notes

### Real Data
- **FACT_MATCH** (826 rows): Sourced from Kaggle WorldCupMatches. Goals, attendance, results are verified.
- **FACT_PLAYER_MATCH** (37,330 rows): Sourced from Kaggle WorldCupPlayers. Goals, cards, minutes verified.

### Synthetic Data (Calibrated)
- **FACT_TICKET_SALES**: Price tiers, demand index, resale % aligned to stadium size & match importance.
- **FACT_MERCHANDISE_SALES**: 500K transactions calibrated to tournament schedules, team popularity.
- **FACT_BROADCAST_RIGHTS**: Viewership and fees scaled realistically by tournament and broadcaster.
- **FACT_SPONSORSHIP**: Contract & media values based on sponsorship tier and brand exposure.

### NULL Handling
| Column | % NULL | Query Impact |
|--------|--------|--------------|
| DIM_VENUE.CAPACITY | ~10% | Use `WHERE CAPACITY IS NOT NULL` for utilization % |
| DIM_VENUE.LATITUDE / LONGITUDE | ~5% | Map visualizations may show incomplete data |
| DIM_PLAYER.BIRTH_YEAR | ~20% | Age analysis limited; filter by DEBUT_YEAR instead |
| DIM_PLAYER.POSITION | ~15% | Older squad data may lack position; use GROUP BY COALESCE(POSITION, 'Unknown') |

### Metric Calculation Rules
1. **Home Win %** = COUNT(*) WHERE MATCH_RESULT='H' / COUNT(*)
2. **Venue Utilization %** = SUM(ATTENDANCE) / (SUM(CAPACITY) WHERE CAPACITY IS NOT NULL)
3. **Sponsorship ROI** = SUM(MEDIA_VALUE_USD) / SUM(CONTRACT_VALUE_USD) [excludes ACTIVATION_SPEND_USD]
4. **Gross Margin %** = SUM(GROSS_MARGIN_USD) / SUM(REVENUE_USD) [use pre-computed column, not REVENUE - COGS]
5. **YoY Change** = Current tournament value vs. Previous tournament value (4 years prior), NOT calendar year

### Currency & Dates
- All financial values: USD ($)
- Exchange rates: Not adjusted retroactively
- Fiscal year: July–June cycle (DIM_DATE.FISCAL_YEAR)
- Tournament dates: Calendar year; attributed to fiscal year for trends

---

## Common Tasks & Patterns

### Task: Add a New KPI to a Dashboard
1. Define metric formula in METRIC_DEFINITIONS.md
2. Write SQL query in dashboard HTML (inside `<script>` tag)
3. Create KPI card HTML with `.kpi-label` and `.kpi-value` elements
4. Call `fitKpiText()` on load
5. Update chart/KPI on filter change via `applyFilters()`

### Task: Create a New Chart
1. Choose type from allowed list (bar, line, scatter, bubble, radar)
2. Fetch data via IDA query (no schema prefix)
3. Use `mk(chartId, config)` to instantiate
4. Colors: hex only, use primary palette `['#1B5E20', '#C8A415', ...]`
5. Destroy old instance in mk() before creating new one

### Task: Update Filter Logic
1. Add `<select>` element with `id="filterName"` and `onchange="applyFilters()"`
2. Populate options from query results (e.g., DISTINCT YEAR_NUM FROM DIM_TOURNAMENT)
3. In `applyFilters()`, read filter value: `var value = document.getElementById('filterName').value`
4. Update SQL WHERE clause and subtitle
5. Re-run all queries and re-create all charts

### Task: Add New Dashboard
1. Copy an existing dashboard HTML file (e.g., 01-tournament-overview.html)
2. Update title, subtitle, and primary tables
3. Create KPI cards and charts using existing patterns
4. Link from index.html in portal navigation
5. Follow build rules (var, function, +, hex colors, mk(), fitKpiText())
6. Test all filters and run QA checklist

---

## Quick Reference: Common Queries

### Top Scorers (All Time)
```sql
SELECT TOP 20 
  p.PLAYER_NAME, 
  t.TEAM_NAME, 
  SUM(pm.GOALS_SCORED) AS goals
FROM FACT_PLAYER_MATCH pm
JOIN DIM_PLAYER p ON pm.PLAYER_KEY = p.PLAYER_KEY
JOIN DIM_TEAM t ON pm.TEAM_KEY = t.TEAM_KEY
GROUP BY p.PLAYER_NAME, t.TEAM_NAME
ORDER BY goals DESC
```

### Goals by Tournament Year
```sql
SELECT 
  t.YEAR_NUM, 
  t.TOTAL_GOALS,
  COUNT(*) AS matches,
  ROUND(CAST(t.TOTAL_GOALS AS FLOAT) / COUNT(*), 2) AS goals_per_match
FROM FACT_MATCH m
JOIN DIM_TOURNAMENT t ON m.TOURNAMENT_KEY = t.TOURNAMENT_KEY
GROUP BY t.YEAR_NUM, t.TOTAL_GOALS
ORDER BY t.YEAR_NUM
```

### Revenue by Source & Tournament
```sql
SELECT 
  t.YEAR_NUM,
  SUM(ts.REVENUE_USD) AS ticket_revenue,
  SUM(ms.REVENUE_USD) AS merch_revenue,
  SUM(br.RIGHTS_FEE_USD) AS broadcast_revenue,
  SUM(sp.CONTRACT_VALUE_USD) AS sponsorship_revenue
FROM DIM_TOURNAMENT t
LEFT JOIN FACT_TICKET_SALES ts ON t.TOURNAMENT_KEY = ts.TOURNAMENT_KEY
LEFT JOIN FACT_MERCHANDISE_SALES ms ON t.TOURNAMENT_KEY = ms.TOURNAMENT_KEY
LEFT JOIN FACT_BROADCAST_RIGHTS br ON t.TOURNAMENT_KEY = br.TOURNAMENT_KEY
LEFT JOIN FACT_SPONSORSHIP sp ON t.TOURNAMENT_KEY = sp.TOURNAMENT_KEY
GROUP BY t.YEAR_NUM
ORDER BY t.YEAR_NUM
```

### Venue Utilization (with NULL handling)
```sql
SELECT TOP 20
  v.STADIUM_NAME,
  v.CITY,
  v.CAPACITY,
  SUM(m.ATTENDANCE) AS total_attendance,
  COUNT(*) AS matches,
  ROUND(
    CAST(SUM(m.ATTENDANCE) AS FLOAT) / (v.CAPACITY * COUNT(*)) * 100,
    1
  ) AS utilization_pct
FROM FACT_MATCH m
JOIN DIM_VENUE v ON m.VENUE_KEY = v.VENUE_KEY
WHERE v.CAPACITY IS NOT NULL
GROUP BY v.STADIUM_NAME, v.CITY, v.CAPACITY
ORDER BY utilization_pct DESC
```

---

## Support & Contact

For schema questions, see **DASHBOARD_FEASIBILITY.md** (sample queries, table assessments).  
For metric formulas, see **METRIC_DEFINITIONS.md**.  
For setup & troubleshooting, see **SETUP_GUIDE.md**.  
For complete theme specs, see **RETAILEDGE_THEME.md**.
