# xFalcon IPL Analytics Hub - Technical Build Skill

**Project:** xFalcon IPL Analytics Hub
**Skill Version:** 1.0
**Last Updated:** 2026-03-31
**Audience:** Data engineers, dashboard developers, SQL analysts

---

## Project Context

- **Database:** IPL Cricket (2008-2025), 23 tables, 1.3M rows
- **Data Connector:** `mcp__ida__` (WARNING: Other connectors may exist, ALWAYS use this one)
- **Schema:** No prefix needed (use TABLE_NAME directly, not public.TABLE_NAME)
- **Currency:** INR Crore (1 Cr ≈ $120K USD)
- **Scope:** All seasons included, no exclusions, no hardcoded filters
- **10 Dashboards:** All at 90-100% READY status

---

## Data Connector Setup

### IDA Connector Configuration

**Connector Name:** `mcp__ida__`

**Critical Warning:** Multiple connectors may be available in your environment. Always explicitly use `mcp__ida__` when:
- Writing SQL queries
- Fetching data for IPL analytics
- Building dashboard data layers
- Debugging data issues

**Verification:**
```
Before querying, confirm: SELECT * FROM DIM_FRANCHISE LIMIT 1;
Expected: 15 franchises (MI, CSK, RCB, KKR, DC, RR, SRH, PBKS, GT, LSG, DD, PW, RPS, etc.)
```

### Query Execution Example

```sql
-- IDA Connector Query Template
-- Use mcp__ida__ for all queries
SELECT FRANCHISE_NAME, TEAM_CODE
FROM DIM_FRANCHISE
WHERE TEAM_CODE IN ('MI', 'CSK', 'RCB')
ORDER BY FRANCHISE_NAME
```

**No schema prefix needed:**
- Right: `SELECT * FROM DIM_FRANCHISE`
- Wrong: `SELECT * FROM public.DIM_FRANCHISE`

---

## Critical Column Name Mistakes Reference Table

This is the most important section. Column name errors are the #1 cause of query failures.

| Metric | Wrong Name(s) | RIGHT Name | Table | Context | Fix |
|--------|--------------|-----------|-------|---------|-----|
| **Team Code (for joins)** | WINNER, TEAM_ID, FRANCHISE_ID, FRANCHISE_CODE | WINNING_TEAM_CODE, LOSING_TEAM_CODE | FACT_MATCH_RESULT | Team code joins to DIM_FRANCHISE.TEAM_CODE, NOT FRANCHISE_KEY | Always use 3-letter team code (MI, CSK, etc.) in joins |
| **Team Code (Prediction Market)** | TEAM_1, TEAM_2 | TEAM_1_CODE, TEAM_2_CODE | FACT_MATCH_PREDICTION_MARKET | Market uses team codes, not franchise keys | Join to DIM_FRANCHISE.TEAM_CODE |
| **Franchise Key (for FK)** | FRANCHISE_ID | FRANCHISE_KEY | All fact tables | Surrogate key (1-15), use with dimension joins | Use when joining via FK, not for match team codes |
| **Auction Price** | BID_PRICE, AUCTION_PRICE, PURCHASE_PRICE | SOLD_PRICE_CRORE | FACT_PLAYER_AUCTION | Exact column name, critical for economics analysis | Always use SOLD_PRICE_CRORE, not variations |
| **Innings Total Score** | RUNS, TOTAL_RUNS, TEAM_RUNS, SCORE | TEAM_SCORE | FACT_INNINGS_SCORECARD | Total runs scored by batting team in innings | Not to be confused with TOTAL_RUNS in FACT_PLAYER_SEASON_STATS (individual runs) |
| **Overs Bowled Format** | OVERS, OVERS_PITCHED, BOWLS_PITCHED | OVERS_BOWLED | FACT_PLAYER_SEASON_STATS | Format: 48.3 = 48 overs + 3 balls (convert to 48.5 if needed) | Division by 6 to get decimal overs: 48.3 / 6 = 48.5 |
| **Wickets Bowled** | WICKETS_BOWLED, DISMISSALS, BOWLS | WICKETS | FACT_PLAYER_SEASON_STATS | Count of wickets taken by bowler | Use in denominator for Bowling Average |
| **Bowling Economy Rate** | RUNS_PER_OVER, BOWLS_PER_RUN | ECONOMY_RATE | FACT_PLAYER_SEASON_STATS | Runs conceded per over (e.g., 6.8 = 6.8 runs/over) | Calculated: RUNS_CONCEDED / OVERS_BOWLED |
| **Strike Rate** | SCORING_RATE, BALLS_PER_RUN, SR | STRIKE_RATE | FACT_PLAYER_SEASON_STATS | Runs per 100 balls (e.g., 142 = 142 runs per 100 balls) | Expressed as percentage-like number, not decimal |
| **Batting Average** | AVG, RUNS_AVERAGE, MEAN_RUNS | BATTING_AVERAGE | FACT_PLAYER_SEASON_STATS | Total runs / (Innings - Not-Outs) | Handle NOT_OUTS correctly (not simple division) |
| **Not Outs** | NOS, NO_COUNT, UNOUTS | NOT_OUTS | FACT_PLAYER_SEASON_STATS | Count of times player remained not out (for average calculation) | Use in denominator: (INNINGS_BATTED - NOT_OUTS) |
| **Balls Faced** | DELIVERIES, BALLS_BOWLED_TO, STRIKES | BALLS_FACED | FACT_PLAYER_SEASON_STATS | Total balls faced while batting (denominator for SR) | Strike Rate = (TOTAL_RUNS / BALLS_FACED) × 100 |
| **Runs Conceded (Bowling)** | RUNS_GIVEN, OVERS_RUNS, BOWLER_RUNS | RUNS_CONCEDED | FACT_PLAYER_SEASON_STATS | Runs conceded while bowling (numerator for economy, bowling avg) | Different from player's runs scored (batting) |
| **Toss Winner** | TOSS_DECISION_TEAM, ELECTED_TEAM | TOSS_WINNER_CODE | DIM_MATCH, FACT_MATCH_RESULT | Team that won coin toss (3-letter code) | Join to DIM_FRANCHISE.TEAM_CODE |
| **Winning Choice** | TOSS_CHOICE, ELECTED | WINNING_CHOICE | FACT_MATCH_RESULT | Team winning toss's decision: "Bat" or "Field" | Not the team that won match, but toss winner's decision |
| **Match Margin** | MARGIN_OF_VICTORY, WIN_MARGIN, DIFF | MATCH_MARGIN | FACT_MATCH_RESULT | Runs or wickets by which match was won | Can be negative for edge cases |
| **Margin Type** | RESULT_TYPE, VICTORY_TYPE | MARGIN_TYPE | FACT_MATCH_RESULT | "By Runs", "By Wickets", "No Result", "Tie" | Determines whether WINNING_MARGIN_RUNS or WICKETS field is populated |
| **Powerplay Runs** | PP_RUNS, FIRST_6_OVERS_RUNS | POWERPLAY_RUNS_TEAM1, POWERPLAY_RUNS_TEAM2 | FACT_MATCH_RESULT | Runs in first 6 overs of each innings | Two columns: one per team (1 = batting first, 2 = chasing) |
| **Maiden Over** | ZERO_RUN_OVER, DOT_OVER | MAIDEN_OVER | FACT_OVER_SUMMARY | Boolean (1 if 0 runs in over, 0 otherwise) | Check against RUNS_IN_OVER = 0 |
| **Dot Balls (Over)** | ZERO_RUNS, DOTS | DOT_BALLS | FACT_OVER_SUMMARY | Count of dot balls (0 runs) in an over (max 6 per over) | Sum across all overs for bowler's dot ball count |
| **4-run Boundaries** | FOURS, 4S, BOUNDARY_FOURS | BOUNDARIES_4S | FACT_OVER_SUMMARY, FACT_BALL_BY_BALL | Count of 4-run hits (not 4 runs from singles) | BOUNDARIES_4S is count, not total runs (multiply by 4 for runs) |
| **6-run Boundaries** | SIXES, 6S, BOUNDARY_SIXES | BOUNDARIES_6S | FACT_OVER_SUMMARY, FACT_BALL_BY_BALL | Count of 6-run hits (not 6 runs from singles) | BOUNDARIES_6S is count, not total runs (multiply by 6 for runs) |
| **Gate Revenue (Financial)** | TICKET_REVENUE, GATE_INCOME, ATTENDANCE_REVENUE | REVENUE_INR, REVENUE_CRORE | FACT_TICKET_SALES | Total revenue from home match tickets (by tier) | Sum by franchise, match, or season for aggregates |
| **Sponsorship Revenue** | SPONSOR_INCOME, SPONSORSHIP_TOTAL | TITLE_SPONSORSHIP_CR, JERSEY_SPONSORSHIP_CR | FACT_FRANCHISE_FINANCIALS | Title and Jersey sponsor income separately | Two columns, not combined |
| **Broadcast Share** | MEDIA_REVENUE, TV_REVENUE, BROADCAST_INCOME | BROADCAST_SHARE_CR | FACT_FRANCHISE_FINANCIALS | Franchise's share of media rights fee (pre-divided by 8-15 franchises) | Not total broadcast revenue, franchise-specific portion |
| **Operating Profit** | NET_PROFIT, REVENUE_PROFIT, MARGIN | OPERATING_PROFIT_CRORE | FACT_FRANCHISE_FINANCIALS | Profit after operating expenses (Revenue - Expenses) | Calculate: TOTAL_REVENUE - OPERATING_EXPENSES |
| **NPS Score** | FAN_SATISFACTION, LOYALTY_SCORE, BRAND_SCORE | NPS_SCORE | FACT_FRANCHISE_FINANCIALS | Net Promoter Score (-100 to +100), fan loyalty metric | % Promoters - % Detractors |
| **TVR Rating** | VIEWERSHIP, VIEWERS, RATING_POINTS | TVR_RATING | FACT_BROADCAST_RATINGS | Television Rating (% of TV households watching) | Expressed 0-100 scale (e.g., 10 = 10%) |
| **Sentiment Score** | SENTIMENT, SOCIAL_SCORE, ENGAGEMENT | SENTIMENT_SCORE | FACT_FAN_ENGAGEMENT | Scale 0-1 (0 = all negative, 1 = all positive, 0.5 = neutral) | Derived from positive/negative mention counts |
| **Prediction Win Probability** | ODDS, PROBABILITY, PREDICTED_WINNER | WIN_PROBABILITY_TEAM_1_PCT, WIN_PROBABILITY_TEAM_2_PCT | FACT_MATCH_PREDICTION_MARKET | Market-implied probability 0-100 (sum typically = 100%) | Updated per over, use cumulative viewer count during match |

---

## Critical Join Patterns

### Pattern 1: Match-Level Facts to Franchises

**WRONG:**
```sql
SELECT f.FRANCHISE_NAME, mr.MATCH_MARGIN
FROM FACT_MATCH_RESULT mr
JOIN DIM_FRANCHISE f ON mr.WINNING_TEAM_CODE = f.FRANCHISE_KEY
-- ERROR: WINNING_TEAM_CODE is 3-letter code (MI), not FRANCHISE_KEY (integer 1-15)
```

**RIGHT:**
```sql
SELECT f.FRANCHISE_NAME, mr.MATCH_MARGIN
FROM FACT_MATCH_RESULT mr
JOIN DIM_FRANCHISE f ON mr.WINNING_TEAM_CODE = f.TEAM_CODE
-- CORRECT: TEAM_CODE is 3-letter code matching WINNING_TEAM_CODE
```

### Pattern 2: Prediction Market Facts to Franchises

**WRONG:**
```sql
SELECT f1.FRANCHISE_NAME as team1, f2.FRANCHISE_NAME as team2
FROM FACT_MATCH_PREDICTION_MARKET mpm
JOIN DIM_FRANCHISE f1 ON mpm.TEAM_1_CODE = f1.FRANCHISE_KEY
-- ERROR: Same issue, using FRANCHISE_KEY instead of TEAM_CODE
```

**RIGHT:**
```sql
SELECT f1.FRANCHISE_NAME as team1, f2.FRANCHISE_NAME as team2
FROM FACT_MATCH_PREDICTION_MARKET mpm
JOIN DIM_FRANCHISE f1 ON mpm.TEAM_1_CODE = f1.TEAM_CODE
JOIN DIM_FRANCHISE f2 ON mpm.TEAM_2_CODE = f2.TEAM_CODE
-- CORRECT: Both use TEAM_CODE for match
```

### Pattern 3: Ball-by-Ball with Teams

**WRONG:**
```sql
SELECT f.FRANCHISE_NAME, COUNT(*) as balls_bowled
FROM FACT_BALL_BY_BALL bbb
JOIN DIM_FRANCHISE f ON bbb.BOWLING_TEAM_CODE = f.FRANCHISE_KEY
-- ERROR: BOWLING_TEAM_CODE is 3-letter code, not FRANCHISE_KEY
```

**RIGHT:**
```sql
SELECT f.FRANCHISE_NAME, COUNT(*) as balls_bowled
FROM FACT_BALL_BY_BALL bbb
JOIN DIM_FRANCHISE f ON bbb.BOWLING_TEAM_CODE = f.TEAM_CODE
-- CORRECT: Uses TEAM_CODE
```

### Pattern 4: Player Stats with Franchises

**CORRECT (uses FRANCHISE_KEY):**
```sql
SELECT f.FRANCHISE_NAME, pss.TOTAL_RUNS
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_FRANCHISE f ON pss.FRANCHISE_KEY = f.FRANCHISE_KEY
-- CORRECT: FACT_PLAYER_SEASON_STATS uses FRANCHISE_KEY (FK), not team code
```

### Pattern 5: Handling Multiple Team Appearances

For matches, always check both WINNING_TEAM_CODE and LOSING_TEAM_CODE:

```sql
SELECT f.FRANCHISE_NAME,
  COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as wins,
  COUNT(CASE WHEN mr.LOSING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as losses
FROM FACT_MATCH_RESULT mr
CROSS JOIN DIM_FRANCHISE f
GROUP BY f.FRANCHISE_NAME
```

---

## Calculation Formulas in SQL

### Batting Average (per Season or Career)

```sql
SELECT p.PLAYER_NAME,
  ROUND(
    SUM(pss.TOTAL_RUNS) * 1.0 /
    (SUM(pss.INNINGS_BATTED) - SUM(pss.NOT_OUTS)),
    2
  ) as career_batting_avg
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
GROUP BY p.PLAYER_KEY, p.PLAYER_NAME
HAVING SUM(pss.INNINGS_BATTED) >= 20  -- Filter: minimum 20 innings
ORDER BY career_batting_avg DESC
```

**Key Points:**
- Use (INNINGS_BATTED - NOT_OUTS) in denominator, NOT just INNINGS_BATTED
- Handle division by zero if innings_batted = not_outs
- Express as 2 decimal places (e.g., 35.42)

### Strike Rate (per Season or Career)

```sql
SELECT p.PLAYER_NAME,
  ROUND(
    (SUM(pss.TOTAL_RUNS) * 1.0 / SUM(pss.BALLS_FACED)) * 100,
    1
  ) as career_strike_rate
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
GROUP BY p.PLAYER_KEY, p.PLAYER_NAME
HAVING SUM(pss.BALLS_FACED) >= 100  -- Minimum 100 balls
ORDER BY career_strike_rate DESC
```

**Key Points:**
- Multiply by 100 (expressed as 142.3, not 1.423)
- Denominator is BALLS_FACED (not INNINGS_BATTED)
- Use 1 decimal place

### Economy Rate (per Season or Career)

```sql
SELECT p.PLAYER_NAME,
  ROUND(
    SUM(pss.RUNS_CONCEDED) * 1.0 / SUM(pss.OVERS_BOWLED),
    2
  ) as career_economy_rate
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
GROUP BY p.PLAYER_KEY, p.PLAYER_NAME
HAVING SUM(pss.OVERS_BOWLED) >= 10  -- Minimum 10 overs
ORDER BY career_economy_rate ASC  -- Lower is better
```

**Key Points:**
- Division by OVERS_BOWLED (in decimal format: 45.3 = 45.5 overs)
- Lower is better (restrict runs per over)
- Use 2 decimal places

### Bowling Average (per Season or Career)

```sql
SELECT p.PLAYER_NAME,
  ROUND(
    SUM(pss.RUNS_CONCEDED) * 1.0 / SUM(pss.WICKETS),
    2
  ) as career_bowling_avg
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
WHERE SUM(pss.WICKETS) > 0  -- No division by zero
GROUP BY p.PLAYER_KEY, p.PLAYER_NAME
HAVING SUM(pss.WICKETS) >= 5  -- Minimum 5 wickets
ORDER BY career_bowling_avg ASC  -- Lower is better
```

**Key Points:**
- Only for bowlers (WICKETS > 0)
- Lower is better (fewer runs per wicket)
- Use 2 decimal places

### Win Percentage (per Season or Career)

```sql
SELECT f.FRANCHISE_NAME,
  ROUND(
    COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) * 100.0 /
    (COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) +
     COUNT(CASE WHEN mr.LOSING_TEAM_CODE = f.TEAM_CODE THEN 1 END)),
    1
  ) as win_percentage
FROM FACT_MATCH_RESULT mr
JOIN DIM_FRANCHISE f ON 1=1
GROUP BY f.FRANCHISE_KEY, f.FRANCHISE_NAME
ORDER BY win_percentage DESC
```

**Key Points:**
- Count both wins (WINNING_TEAM_CODE) and losses (LOSING_TEAM_CODE)
- Multiply by 100
- Express with 1 decimal place

### Net Run Rate (NRR)

```sql
SELECT f.FRANCHISE_NAME,
  ROUND(
    (SUM(CASE WHEN ic.BATTING_TEAM_CODE = f.TEAM_CODE THEN ic.TEAM_SCORE ELSE 0 END) * 1.0 /
     SUM(CASE WHEN ic.BATTING_TEAM_CODE = f.TEAM_CODE THEN ic.OVERS_BOWLED ELSE 0 END)) -
    (SUM(CASE WHEN ic.BOWLING_TEAM_CODE = f.TEAM_CODE THEN ic.TEAM_SCORE ELSE 0 END) * 1.0 /
     SUM(CASE WHEN ic.BOWLING_TEAM_CODE = f.TEAM_CODE THEN ic.OVERS_BOWLED ELSE 0 END)),
    2
  ) as nrr
FROM FACT_INNINGS_SCORECARD ic
JOIN DIM_FRANCHISE f ON 1=1
WHERE ic.MATCH_KEY IN (SELECT MATCH_KEY FROM FACT_MATCH_RESULT WHERE SEASON_KEY = :season_key)
GROUP BY f.FRANCHISE_KEY, f.FRANCHISE_NAME
ORDER BY nrr DESC
```

**Key Points:**
- Two parts: (Runs Scored / Overs) - (Runs Conceded / Overs)
- Use OVERS_BOWLED from FACT_INNINGS_SCORECARD (actual overs completed)
- Separate batting vs. bowling views (BATTING_TEAM_CODE vs. BOWLING_TEAM_CODE)
- Express with 2 decimal places

### Revenue Calculations (Financial)

```sql
SELECT s.SEASON_YEAR, f.FRANCHISE_NAME,
  ROUND(ff.TITLE_SPONSORSHIP_CR, 2) as title_sponsor_cr,
  ROUND(ff.JERSEY_SPONSORSHIP_CR, 2) as jersey_sponsor_cr,
  ROUND(ff.GATE_RECEIPTS_CR, 2) as gate_receipts_cr,
  ROUND(ff.BROADCAST_SHARE_CR, 2) as broadcast_share_cr,
  ROUND(ff.PRIZE_MONEY_CR, 2) as prize_money_cr,
  ROUND(
    ff.TITLE_SPONSORSHIP_CR + ff.JERSEY_SPONSORSHIP_CR + ff.GATE_RECEIPTS_CR +
    ff.BROADCAST_SHARE_CR + ff.PRIZE_MONEY_CR,
    2
  ) as total_revenue_cr
FROM FACT_FRANCHISE_FINANCIALS ff
JOIN DIM_FRANCHISE f ON ff.FRANCHISE_KEY = f.FRANCHISE_KEY
JOIN DIM_SEASON s ON ff.SEASON_KEY = s.SEASON_KEY
ORDER BY s.SEASON_YEAR DESC, total_revenue_cr DESC
```

**Key Points:**
- All values already in Crore
- Display with USD equivalent: multiply by 0.12 for millions USD
- Format: ₹35 Cr ($4.2M USD)

---

## Chart Color Rules (CRITICAL)

### Rule Summary
- **Data Series:** ONLY Blue (#006AFF), Teal (#1A7F64), Gray (#94A3B8)
- **KPI Indicators:** Red (#FF3366) and Green (#7CFF01) ONLY for directional arrows/badges
- **Never use red/green in data visualization** (colorblind accessibility)
- **Extended series:** Light Blue (#0EA5E9), Amber (#F59E0B) if > 3 series

### Chart Type Examples

**Bar Chart: Runs by Team**
```javascript
datasets: [
  {
    label: 'Runs Scored',
    data: [1200, 1100, 1050, ...],
    backgroundColor: '#006AFF',  // Blue
    borderColor: '#006AFF'
  }
]
```

**Multi-series: Runs vs Wickets vs NRR**
```javascript
datasets: [
  {
    label: 'Runs Scored',
    data: [...],
    backgroundColor: '#006AFF'  // Blue
  },
  {
    label: 'Wickets Lost',
    data: [...],
    backgroundColor: '#1A7F64'  // Teal
  },
  {
    label: 'NRR',
    data: [...],
    backgroundColor: '#94A3B8'  // Gray
  }
]
```

**KPI Card with Directional Indicator**
```html
<div class="kpi-card">
  <h3>Win Percentage</h3>
  <p class="kpi-value">65.2%</p>
  <p class="kpi-change positive">↑ +5.2% vs last season</p>
  <!-- CSS: .kpi-change.positive { color: #7CFF01; } -->
</div>
```

### Forbidden Patterns
```javascript
// WRONG - Red/Green in data chart:
{ label: 'Wins', backgroundColor: '#7CFF01' }     // Green in data
{ label: 'Losses', backgroundColor: '#FF3366' }   // Red in data

// RIGHT - Blue/Teal/Gray:
{ label: 'Wins', backgroundColor: '#006AFF' }     // Blue
{ label: 'Losses', backgroundColor: '#1A7F64' }   // Teal

// OK - Green/Red for KPI arrow only:
<span class="kpi-arrow positive">↑</span>  <!-- Color: #7CFF01 -->
<span class="kpi-arrow negative">↓</span>  <!-- Color: #FF3366 -->
```

---

## Topbar Implementation Rules

### Required Format (Every Dashboard)

**HTML Structure:**
```html
<header class="topbar">
  <div class="topbar-left">
    <img src="assets/images/xf-logo-orange-blue.svg" class="xf-logo" alt="xFalcon">
    <h1 class="page-title">
      <span class="breadcrumb-primary">xFalcon IPL Analytics Hub</span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-current">Team Performance Analytics</span>
    </h1>
  </div>
  <div class="topbar-right">
    <!-- Filters -->
  </div>
</header>
```

### Logo Styling
```css
.xf-logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}
/* Logo file has x in #F26522 (orange), F in #006AFF (blue) */
```

### Page Title Styling
```css
.page-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.breadcrumb-primary {
  color: #8B95A5;      /* Secondary text */
  font-weight: 400;
}

.breadcrumb-sep {
  color: #5A6370;      /* Tertiary text */
  margin: 0 4px;
}

.breadcrumb-current {
  color: #F5F7FA;      /* Primary text */
  font-weight: 700;
}
```

### Example Dashboard Names
- "xFalcon IPL Analytics Hub / League Overview Portal"
- "xFalcon IPL Analytics Hub / Team Performance Analytics"
- "xFalcon IPL Analytics Hub / Player Analytics"
- "xFalcon IPL Analytics Hub / Auction Economics"
- etc.

---

## Common Errors & Solutions

### Error 1: Column Name Mismatch

**Symptom:** "Unknown column 'WINS' in field list"

**Cause:** Using wrong column name (WINS instead of WINNING_TEAM_CODE)

**Solution:**
1. Refer to Critical Column Name Mistakes table above
2. Check DATA_SCHEMA_MAP.md for exact column names
3. Use column name from table definition, not intuitive name

**Example Fix:**
```sql
-- WRONG
SELECT COUNT(*) as WINS FROM FACT_MATCH_RESULT WHERE WINS = 1

-- RIGHT
SELECT COUNT(*) FROM FACT_MATCH_RESULT WHERE WINNING_TEAM_CODE = 'MI'
```

### Error 2: Wrong Join Key Type

**Symptom:** "No matching rows found" or "0 results"

**Cause:** Joining WINNING_TEAM_CODE (text: MI) to FRANCHISE_KEY (integer: 1-15)

**Solution:**
1. Always join on TEAM_CODE, not FRANCHISE_KEY, for matches
2. Use FRANCHISE_KEY for FK joins in fact tables
3. Verify data types match (text vs integer)

**Example Fix:**
```sql
-- WRONG
JOIN DIM_FRANCHISE f ON mr.WINNING_TEAM_CODE = f.FRANCHISE_KEY

-- RIGHT
JOIN DIM_FRANCHISE f ON mr.WINNING_TEAM_CODE = f.TEAM_CODE
```

### Error 3: Division by Zero

**Symptom:** NULL or error in Batting Average calculation

**Cause:** INNINGS_BATTED - NOT_OUTS = 0 (player never completed an inning)

**Solution:** Filter out invalid cases or use CASE statement

**Example Fix:**
```sql
-- WRONG
BATTING_AVERAGE = TOTAL_RUNS / (INNINGS_BATTED - NOT_OUTS)

-- RIGHT
CASE
  WHEN (INNINGS_BATTED - NOT_OUTS) > 0
  THEN TOTAL_RUNS / (INNINGS_BATTED - NOT_OUTS)
  ELSE NULL
END as batting_average
```

### Error 4: Large Table SELECT *

**Symptom:** Dashboard takes 30+ seconds to load, slow performance

**Cause:** Fetching all 279K ball-by-ball records without aggregation

**Solution:** Always aggregate large fact tables before returning

**Example Fix:**
```sql
-- WRONG (279K rows)
SELECT * FROM FACT_BALL_BY_BALL WHERE MATCH_KEY = :match_key

-- RIGHT (11 rows - bowler aggregates)
SELECT BOWLER_PLAYER_KEY,
  COUNT(*) as deliveries,
  SUM(RUNS_OFF_BAT) as runs_off_bat,
  COUNT(CASE WHEN IS_WICKET = 1 THEN 1 END) as wickets
FROM FACT_BALL_BY_BALL
WHERE MATCH_KEY = :match_key
GROUP BY BOWLER_PLAYER_KEY
```

### Error 5: Currency Formatting Missing USD

**Symptom:** Display shows "₹35 Cr" but missing USD equivalent

**Cause:** Not applying SETUP_GUIDE.md currency rules

**Solution:** Always display both Crore and USD

**Example Fix:**
```javascript
// WRONG
formatCurrency(35) // Returns "₹35 Cr"

// RIGHT
function formatCurrency(croreAmount) {
  const usd = (croreAmount * 0.12).toFixed(1);
  return `₹${croreAmount.toFixed(1)} Cr ($${usd}M USD)`;
}
formatCurrency(35) // Returns "₹35.0 Cr ($4.2M USD)"
```

### Error 6: Historical Franchise Filtering

**Symptom:** 2008 dashboard shows 15 franchises, but should show 8

**Cause:** Not filtering franchises by season (missing cascade logic)

**Solution:** Filter franchises to those active in selected season

**Example Fix:**
```sql
-- WRONG (all 15 franchises always)
SELECT * FROM DIM_FRANCHISE

-- RIGHT (franchises active in selected season)
SELECT f.*
FROM DIM_FRANCHISE f
WHERE f.FOUNDING_YEAR <= :season_year
  AND (f.CLOSING_YEAR >= :season_year OR f.CLOSING_YEAR IS NULL)
```

---

## SQL Templates for Dashboards

### Template 1: Match-Level Analysis

```sql
SELECT
  s.SEASON_YEAR,
  dm.MATCH_DATE,
  f_winner.FRANCHISE_NAME as winning_team,
  f_loser.FRANCHISE_NAME as losing_team,
  mr.MATCH_MARGIN,
  mr.MARGIN_TYPE,
  dv.VENUE_NAME
FROM FACT_MATCH_RESULT mr
JOIN DIM_SEASON s ON mr.SEASON_KEY = s.SEASON_KEY
JOIN DIM_MATCH dm ON mr.MATCH_KEY = dm.MATCH_KEY
JOIN DIM_FRANCHISE f_winner ON mr.WINNING_TEAM_CODE = f_winner.TEAM_CODE
JOIN DIM_FRANCHISE f_loser ON mr.LOSING_TEAM_CODE = f_loser.TEAM_CODE
JOIN DIM_VENUE dv ON mr.VENUE_KEY = dv.VENUE_KEY
WHERE s.SEASON_YEAR = :season_year
  AND (mr.WINNING_TEAM_CODE IN (:selected_teams) OR mr.LOSING_TEAM_CODE IN (:selected_teams))
ORDER BY dm.MATCH_DATE DESC
```

### Template 2: Player-Level Analysis

```sql
SELECT
  p.PLAYER_NAME,
  p.PLAYER_ROLE,
  f.FRANCHISE_NAME,
  pss.TOTAL_RUNS,
  pss.BATTING_AVERAGE,
  pss.STRIKE_RATE,
  pss.WICKETS,
  pss.BOWLING_AVERAGE,
  pss.ECONOMY_RATE,
  pss.MVP_SCORE
FROM FACT_PLAYER_SEASON_STATS pss
JOIN DIM_PLAYER p ON pss.PLAYER_KEY = p.PLAYER_KEY
JOIN DIM_FRANCHISE f ON pss.FRANCHISE_KEY = f.FRANCHISE_KEY
JOIN DIM_SEASON s ON pss.SEASON_KEY = s.SEASON_KEY
WHERE s.SEASON_YEAR = :season_year
  AND p.NATIONALITY IN (:nationality_filter)
  AND p.PLAYER_ROLE IN (:role_filter)
ORDER BY pss.MVP_SCORE DESC
```

### Template 3: Financial Analysis

```sql
SELECT
  s.SEASON_YEAR,
  f.FRANCHISE_NAME,
  ff.TITLE_SPONSORSHIP_CR,
  ff.JERSEY_SPONSORSHIP_CR,
  ff.GATE_RECEIPTS_CR,
  ff.BROADCAST_SHARE_CR,
  ff.PRIZE_MONEY_CR,
  ff.TOTAL_REVENUE_CRORE,
  ff.OPERATING_PROFIT_CRORE,
  ROUND(ff.OPERATING_PROFIT_CRORE * 100.0 / ff.TOTAL_REVENUE_CRORE, 1) as profit_margin_pct,
  ff.NPS_SCORE
FROM FACT_FRANCHISE_FINANCIALS ff
JOIN DIM_FRANCHISE f ON ff.FRANCHISE_KEY = f.FRANCHISE_KEY
JOIN DIM_SEASON s ON ff.SEASON_KEY = s.SEASON_KEY
WHERE s.SEASON_YEAR = :season_year
ORDER BY ff.TOTAL_REVENUE_CRORE DESC
```

### Template 4: Aggregation by Team

```sql
SELECT
  f.FRANCHISE_NAME,
  COUNT(DISTINCT mr.MATCH_KEY) as total_matches,
  COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as wins,
  COUNT(CASE WHEN mr.LOSING_TEAM_CODE = f.TEAM_CODE THEN 1 END) as losses,
  ROUND(
    COUNT(CASE WHEN mr.WINNING_TEAM_CODE = f.TEAM_CODE THEN 1 END) * 100.0 /
    COUNT(DISTINCT mr.MATCH_KEY),
    1
  ) as win_percentage
FROM FACT_MATCH_RESULT mr
CROSS JOIN DIM_FRANCHISE f
WHERE mr.SEASON_KEY = :season_key
GROUP BY f.FRANCHISE_KEY, f.FRANCHISE_NAME
ORDER BY win_percentage DESC
```

---

## All Technical Build Rules

### SQL Rules
1. ✓ No schema prefix (TABLE_NAME, not public.TABLE_NAME)
2. ✓ Always use TEAM_CODE for franchise joins in FACT_MATCH_RESULT, FACT_MATCH_PREDICTION_MARKET, FACT_BALL_BY_BALL
3. ✓ Use FRANCHISE_KEY for FK joins in other fact tables
4. ✓ Aggregate large tables before returning (FACT_BALL_BY_BALL, FACT_BROADCAST_RATINGS)
5. ✓ Handle division by zero (not-outs, no bowling)
6. ✓ Filter by season and franchise with cascade logic
7. ✓ Use correct column names (check Critical Column Name Mistakes table)
8. ✓ Use IDA connector mcp__ida__ exclusively

### Chart Rules
1. ✓ Data series: Blue (#006AFF), Teal (#1A7F64), Gray (#94A3B8) ONLY
2. ✓ KPI indicators: Red (#FF3366) and Green (#7CFF01) for arrows/badges ONLY
3. ✓ Never red/green in data visualization (colorblind accessibility)
4. ✓ Responsive design (Chart.js responsive: true)
5. ✓ Dark theme backgrounds (#0D1B2A, #152238)
6. ✓ Light text colors (#F5F7FA primary, #8B95A5 secondary)

### Design Rules
1. ✓ Topbar on every dashboard: "xFalcon IPL Analytics Hub / Dashboard Name"
2. ✓ xF logo (x orange #F26522, F blue #006AFF)
3. ✓ Global filters: Season, Franchise, Venue, Match Type, Player Role, Nationality
4. ✓ Currency format: ₹X Cr ($YM USD) with conversion (×0.12)
5. ✓ Font: Inter from Google Fonts
6. ✓ Consistent KPI card styling (left orange border)
7. ✓ Buttons: Primary orange #F26522, secondary blue #006AFF
8. ✓ Responsive: Mobile, Tablet, Desktop layouts

### Accessibility Rules
1. ✓ WCAG AA contrast (4.5:1 minimum for text)
2. ✓ Keyboard navigation (Tab, Arrow, Enter, Escape)
3. ✓ Screen reader labels (aria-label, label for="id")
4. ✓ No color-only information (use shape, text, pattern too)
5. ✓ Focus indicators visible
6. ✓ Alt text on images
7. ✓ Form labels associated with inputs

---

## Validation Checklist Before Deployment

- [ ] All SQL queries use mcp__ida__ connector
- [ ] No schema prefix in queries (TABLE_NAME, not public.TABLE_NAME)
- [ ] All joins use TEAM_CODE (not FRANCHISE_KEY) for match facts
- [ ] All joins use FRANCHISE_KEY for FK in other facts
- [ ] Large tables aggregated (no SELECT * on FACT_BALL_BY_BALL, etc.)
- [ ] Division by zero handled (not-outs, no bowling)
- [ ] Column names verified against Critical Mistakes table
- [ ] Chart colors: Blue/Teal/Gray only (no red/green in data)
- [ ] KPI arrows: Red/Green only (no red/green in charts)
- [ ] Topbar format correct: "xFalcon IPL Analytics Hub / Dashboard Name"
- [ ] xF logo displayed (orange x, blue F)
- [ ] Filters cascade: Season → Franchise → Venue
- [ ] Currency format: ₹X Cr ($YM USD)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] WCAG AA contrast verified (4.5:1 minimum)
- [ ] Keyboard navigation works (Tab, Arrow, Enter, Escape)
- [ ] Screen reader tested (labels, descriptions, landmarks)
- [ ] All 10 dashboards built and tested
- [ ] Query performance acceptable (< 3 seconds load time)
- [ ] Documentation updated (README, query templates)

---

**Final Note:** When in doubt, refer to:
1. DATA_SCHEMA_MAP.md for table structure and join patterns
2. Critical Column Name Mistakes table above
3. METRIC_DEFINITIONS.md for KPI calculations
4. RETAILEDGE_THEME.md for colors and styling
5. GLOBAL_FILTERS.md for filter logic

**Contact:** analytics@xfalcon-ipl.com
**Last Updated:** 2026-03-31
**Version:** xFalcon IPL Analytics Kit v1.0
