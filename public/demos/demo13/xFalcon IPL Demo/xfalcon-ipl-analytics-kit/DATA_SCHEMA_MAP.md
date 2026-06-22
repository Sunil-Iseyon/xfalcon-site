# IPL Cricket Database Schema Map

**Project:** xFalcon IPL Analytics Hub
**Data Period:** 2008-2025 (18 seasons)
**Last Updated:** 2026-03-31
**IDA Connector:** mcp__ida__
**Schema Prefix:** None required (use TABLE_NAME directly)

---

## Database Overview

The xFalcon IPL Analytics database comprises **23 tables** organized into three architectural layers:

1. **Dimension Tables (7):** Core entities and hierarchies
2. **Fact Tables (16):** Transactional and aggregate measurements
3. **Bridge/Lookup Tables:** Implicit join relationships

**Total Records:** ~1.3M rows across all tables
**Date Coverage:** 2008-2025 (18 complete seasons)
**Geographic Scope:** India-centric with international player coverage
**Currency:** INR Crore (1 Cr ≈ $120K USD)

---

## DIMENSION TABLES

Dimension tables provide slowly-changing reference data for analysis. All dimension keys are surrogate keys (integers). No schema prefix needed.

### 1. DIM_FRANCHISE
**Purpose:** IPL Team/Franchise master data
**Row Count:** 15 rows (15 active franchises)
**Primary Key:** FRANCHISE_KEY (surrogate integer)

**Key Columns:**
- `FRANCHISE_KEY` - Surrogate key (1-15)
- `FRANCHISE_NAME` - Full team name (e.g., "Mumbai Indians", "Chennai Super Kings")
- `TEAM_CODE` - 3-letter code (e.g., "MI", "CSK", "RCB") — **CRITICAL: Use this for joins to FACT_MATCH_PREDICTION_MARKET and FACT_MATCH_RESULT (WINNING_TEAM_CODE, LOSING_TEAM_CODE)**
- `FOUNDING_YEAR` - Year franchise was established (2008-2019 range)
- `HOME_CITY` - Franchise headquarters city
- `STADIUM_HOME` - Primary home venue name
- `BRAND_COLOR_PRIMARY` - Franchise primary color (hex code)
- `BRAND_COLOR_SECONDARY` - Franchise secondary color (hex code)
- `OWNER_NAME` - Franchise owner
- `OWNER_COMPANY` - Owner organization

**Relationships:**
- One-to-many with FACT_FRANCHISE_FINANCIALS (one franchise → multiple seasons)
- One-to-many with FACT_PLAYER_AUCTION (one franchise → multiple purchases)
- One-to-many with FACT_MATCH_RESULT (via WINNING_TEAM_CODE and LOSING_TEAM_CODE)
- One-to-many with FACT_FAN_ENGAGEMENT (one franchise → multiple matches/seasons)

**Notes:**
- Some franchises ceased operations: Delhi Daredevils → Delhi Capitals (2019), Pune Warriors (2015 only)
- Historical franchises still in dimension for joins
- Stadium names have changed (e.g., Wankhede renovations, Narendra Modi Stadium renamed)

---

### 2. DIM_PLAYER
**Purpose:** IPL Player master data
**Row Count:** 301 rows (301 unique players)
**Primary Key:** PLAYER_KEY (surrogate integer)

**Key Columns:**
- `PLAYER_KEY` - Surrogate key (1-301)
- `PLAYER_NAME` - Full player name
- `PLAYER_ROLE` - Role classification: "Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"
- `NATIONALITY` - "Indian" or country code for overseas players
- `BATTING_STYLE` - "Right-Hand", "Left-Hand", or NULL for bowlers
- `BOWLING_STYLE` - "Right-Arm Fast", "Right-Arm Offbreak", "Right-Arm Legbreak", "Left-Arm Orthodox", "Left-Arm Unorthodox" or NULL for non-bowlers
- `DATE_OF_BIRTH` - Player DOB (YYYY-MM-DD format)
- `HEIGHT_CM` - Height in centimeters where available
- `JERSEY_NUMBERS` - JSON array or comma-separated list of jersey numbers worn (some players changed numbers across seasons)
- `CAREER_START_YEAR` - First year player appeared in IPL
- `CAREER_END_YEAR` - Final year player appeared (NULL for active players)
- `INTERNATIONAL_CAPS` - Test/ODI/T20I cap count (informational only)

**Relationships:**
- One-to-many with FACT_PLAYER_SEASON_STATS (one player → multiple seasons)
- One-to-many with FACT_BALL_BY_BALL (one player → many balls faced/bowled)
- One-to-many with FACT_INNINGS_SCORECARD (one player → many innings)
- One-to-many with FACT_PLAYER_AUCTION (one player → multiple auction appearances)
- One-to-many with FACT_FANTASY_POINTS (one player → multiple matches)

**Notes:**
- 301 unique players covers entire history (some appeared only once)
- Player roles can be multi-functional (primary role listed, use FACT_PLAYER_SEASON_STATS for season-specific role)
- CAREER_END_YEAR may be NULL for active players or more recent retirements
- Nationality uses ISO codes or "Indian" for consistency

---

### 3. DIM_MATCH
**Purpose:** IPL Match master data
**Row Count:** 1,098 rows (1,098 unique matches including playoffs)
**Primary Key:** MATCH_KEY (surrogate integer)

**Key Columns:**
- `MATCH_KEY` - Surrogate key
- `MATCH_ID` - Unique match identifier (e.g., "IPL_2024_001_LE")
- `MATCH_DATE` - Match date (YYYY-MM-DD format)
- `MATCH_TIME` - Match start time (HH:MM format, IST)
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `MATCH_TYPE` - "League", "Playoff", "Qualifier 1", "Qualifier 2", "Eliminator", "Final"
- `TEAM_1_CODE` - Batting first team code (joins to DIM_FRANCHISE.TEAM_CODE)
- `TEAM_2_CODE` - Chasing team code (joins to DIM_FRANCHISE.TEAM_CODE)
- `TOSS_WINNER_CODE` - Team winning toss (joins to DIM_FRANCHISE.TEAM_CODE)
- `TOSS_DECISION` - "Bat" or "Field"
- `MATCH_STATUS` - "Completed", "No Result", "Abandoned"
- `DAY_NIGHT` - "Day" or "Night" match

**Relationships:**
- One-to-one with FACT_MATCH_RESULT (same MATCH_KEY)
- One-to-many with FACT_INNINGS_SCORECARD (one match → 2 innings)
- One-to-many with FACT_BALL_BY_BALL (one match → ~390 balls)
- One-to-many with FACT_OVER_SUMMARY (one match → 20 overs)
- One-to-many with FACT_BROADCAST_RATINGS (one match → multiple broadcast segments)
- One-to-many with FACT_VENUE_CONDITIONS (one match → one record per venue)
- One-to-many with FACT_MATCH_PREDICTION_MARKET (one match → 20 records)

**Notes:**
- 1,098 matches total: ~65 per season × 18 seasons (varying playoff structures)
- Matches without results (rain, abandoned) are included
- TEAM_1_CODE and TEAM_2_CODE indicate batting order, not home/away
- Use VENUE_KEY to join home team information

---

### 4. DIM_SEASON
**Purpose:** IPL Season master data
**Row Count:** 18 rows (Seasons 2008-2025)
**Primary Key:** SEASON_KEY (surrogate integer)

**Key Columns:**
- `SEASON_KEY` - Surrogate key (1-18)
- `SEASON_YEAR` - Year (2008, 2009, ..., 2025)
- `SEASON_NUMBER` - Sequential number (1-18)
- `START_DATE` - Season start date (YYYY-MM-DD)
- `END_DATE` - Season end date (YYYY-MM-DD)
- `TOTAL_MATCHES` - Count of matches in season
- `TOTAL_TEAMS` - Number of franchises (8, 10, or 18 in expansion years)
- `TOURNAMENT_FORMAT` - "Round-Robin", "Double Round-Robin", "Mega Auction", etc.
- `CHAMPIONS_TEAM_CODE` - Winning team code (joins to DIM_FRANCHISE.TEAM_CODE)
- `RUNNERS_UP_TEAM_CODE` - Runner-up team code
- `SEASON_STATUS` - "Completed", "Ongoing", "Cancelled" (COVID-19 2020)

**Relationships:**
- One-to-many with FACT_MATCH_RESULT (one season → ~65 matches)
- One-to-many with FACT_PLAYER_SEASON_STATS (one season → ~150 active players)
- One-to-many with FACT_FRANCHISE_FINANCIALS (one season → 8-15 teams)
- One-to-many with FACT_BROADCAST_RATINGS (one season → all matches)
- One-to-one with DIM_AUCTION_YEAR (implicit, same year)

**Notes:**
- 2008: First season, 8 teams
- 2011: Chennai Super Kings and Rajasthan Royals suspended
- 2015: Expansion year (10 teams)
- 2019: Mega Auction, 8 teams
- 2020: Postponed to UAE (season_status considerations)
- 2022-2024: Retention + supplementary auction format
- Season boundaries align with calendar year (Jan-June typically)

---

### 5. DIM_VENUE
**Purpose:** IPL Venue/Stadium master data
**Row Count:** 18 rows (18 active stadiums)
**Primary Key:** VENUE_KEY (surrogate integer)

**Key Columns:**
- `VENUE_KEY` - Surrogate key (1-18)
- `VENUE_NAME` - Stadium name (e.g., "Arun Jaitley Stadium", "M.A. Chidambaram Stadium")
- `CITY` - City location
- `STATE` - State location
- `COUNTRY` - Always "India" for IPL (except international legs)
- `CAPACITY` - Seating capacity (varies: 19,000 to 132,000)
- `CAPACITY_EFFECTIVE` - Effective capacity considering COVID restrictions in some seasons
- `OPENING_YEAR` - Year venue opened for international cricket
- `RENOVATION_YEARS` - JSON array of renovation years
- `HOME_FRANCHISE_CODE` - Primary home team code (joins to DIM_FRANCHISE.TEAM_CODE)
- `HOME_FRANCHISE_KEY` - FK to DIM_FRANCHISE (denormalized for convenience)
- `PITCH_TYPE` - "Hard Court", "Natural", "Mixed"
- `GROUND_DIMENSIONS` - JSON with boundary distances
- `AVERAGE_FIRST_INNINGS_SCORE` - Historical average (informational)
- `AVERAGE_SECOND_INNINGS_SCORE` - Historical average (informational)

**Relationships:**
- One-to-many with FACT_MATCH_RESULT (venue hosts many matches)
- One-to-many with FACT_VENUE_CONDITIONS (one venue → one record per match)
- One-to-many with FACT_INNINGS_SCORECARD (venue context)
- Many-to-many with DIM_FRANCHISE (franchises play at multiple venues)

**Notes:**
- 18 venues includes both regular and occasional IPL grounds
- Capacity expanded for some venues over 18 years
- Some venues used only in specific seasons or as neutral venues
- 2020-2021 pandemic: Matches concentrated in UAE (3 venues)
- Pitch classifications are qualitative assessments

---

### 6. DIM_AUCTION_YEAR
**Purpose:** IPL Auction event master data
**Row Count:** 19 rows (Auctions 2008-2026)
**Primary Key:** AUCTION_KEY (surrogate integer)

**Key Columns:**
- `AUCTION_KEY` - Surrogate key (1-19)
- `AUCTION_YEAR` - Year (2008, 2009, ..., 2026)
- `AUCTION_DATE` - Date auction held (YYYY-MM-DD)
- `AUCTION_TYPE` - "Initial Auction", "Mega Auction", "Mini Auction", "Supplementary Auction"
- `AUCTION_LOCATION` - City where auction held (e.g., "Chennai", "Bengaluru")
- `TOTAL_PURSE_CRORE` - Total purse available in INR Crore
- `TOTAL_PLAYERS_AUCTIONED` - Count of players sold
- `TOTAL_PLAYERS_UNSOLD` - Count of players who went unsold
- `AVERAGE_PRICE_CRORE` - Average selling price in INR Crore
- `HIGHEST_PRICE_CRORE` - Record price for session (INR Crore)
- `HIGHEST_PRICE_PLAYER_KEY` - FK to DIM_PLAYER (highest-priced player)

**Relationships:**
- One-to-many with FACT_PLAYER_AUCTION (one auction → multiple player sales)
- Implicit one-to-one with DIM_SEASON (same year)

**Notes:**
- 2008: First auction (8 teams, initial roster building)
- 2011, 2012, 2013, 2014: Supplementary/IPL auctions during season
- 2019: Mega Auction (all 8 teams from scratch)
- 2022, 2023, 2024: Retention followed by mega auction
- Pre-2026 planning requires forecast data

---

### 7. DIM_DATE
**Purpose:** Date dimension for time-based filtering
**Row Count:** 6,940 rows (19 years of daily records)
**Primary Key:** DATE_KEY (surrogate integer, YYYYMMDD format)

**Key Columns:**
- `DATE_KEY` - YYYYMMDD format (e.g., 20240330)
- `CALENDAR_DATE` - YYYY-MM-DD format
- `YEAR` - Year (2008-2025, plus 2026 for planning)
- `MONTH` - Month number (1-12)
- `MONTH_NAME` - Month name (January-December)
- `QUARTER` - Quarter (1-4)
- `QUARTER_NAME` - Quarter name (Q1-Q4)
- `DAY_OF_YEAR` - Day number in year (1-366)
- `WEEK_OF_YEAR` - ISO week number
- `DAY_OF_WEEK` - Day number (1=Monday, 7=Sunday)
- `DAY_NAME` - Day name (Monday-Sunday)
- `IS_WEEKEND` - Boolean (1 for Sat/Sun, 0 otherwise)
- `IS_IPL_SEASON_DAY` - Boolean (1 if within IPL season, 0 otherwise)
- `IPL_SEASON_YEAR` - Associated IPL season year (2008-2025)

**Relationships:**
- Implicit many-to-one with DIM_SEASON (date to season)
- Used for filtering and time-based aggregations across fact tables

**Notes:**
- Covers full 19-year span: 2008-01-01 through 2026-12-31
- IPL seasons typically March-June (compressed during COVID)
- Useful for year-over-year and month-over-month analysis

---

## FACT TABLES

Fact tables contain transactional or semi-aggregated measurements. All include multiple foreign keys to dimension tables. No schema prefix needed.

### 8. FACT_MATCH_RESULT
**Purpose:** Core match results with margin and outcome data
**Row Count:** 1,171 records (all matches 2008-2025)
**Granularity:** One row per match
**Primary Key:** MATCH_KEY (also FK to DIM_MATCH)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH (also serves as PK in this context)
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `MATCH_DATE` - Match date (denormalized from DIM_MATCH)
- `WINNING_TEAM_CODE` - **CRITICAL: Use this to join DIM_FRANCHISE.TEAM_CODE (NOT FRANCHISE_KEY)**
- `LOSING_TEAM_CODE` - **CRITICAL: Use this to join DIM_FRANCHISE.TEAM_CODE (NOT FRANCHISE_KEY)**
- `MATCH_MARGIN` - Margin of victory (runs or wickets, can be negative for no-result)
- `MARGIN_TYPE` - "By Runs", "By Wickets", "No Result", "Tie"
- `WINNING_MARGIN_RUNS` - NULL if margin_type = "By Wickets"
- `WINNING_MARGIN_WICKETS` - NULL if margin_type = "By Runs"
- `MATCH_DURATION_MINUTES` - Duration from start to finish
- `TOSS_WINNER_CODE` - Team winning toss
- `WINNING_CHOICE` - "Bat" or "Field" choice by toss winner
- `POWERPLAY_RUNS_TEAM1` - First 6 overs runs for batting-first team
- `POWERPLAY_RUNS_TEAM2` - First 6 overs runs for chasing team
- `TOTAL_RUNS_TEAM1` - Runs scored by batting-first team
- `TOTAL_RUNS_TEAM2` - Runs scored by chasing team
- `TOTAL_WICKETS_TEAM1` - Wickets lost by batting-first team
- `TOTAL_WICKETS_TEAM2` - Wickets lost by chasing team
- `SUPER_OVER` - Boolean (1 if match went to super over, 0 otherwise)

**Relationships:**
- One-to-one with DIM_MATCH (same MATCH_KEY)
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_VENUE
- Many-to-one with DIM_FRANCHISE (via WINNING_TEAM_CODE and LOSING_TEAM_CODE to TEAM_CODE)

**Critical Notes:**
- **JOIN ISSUE:** WINNING_TEAM_CODE and LOSING_TEAM_CODE join to **DIM_FRANCHISE.TEAM_CODE**, NOT FRANCHISE_KEY
- Always validate team codes are 3-letter codes (MI, CSK, RCB, etc.)
- Margin can be negative for technical reasons (data quality edge case)
- TOTAL_RUNS includes extras (wides, no-balls, byes, leg-byes)

---

### 9. FACT_PLAYER_SEASON_STATS
**Purpose:** Aggregated player statistics per season
**Row Count:** 2,751 records (~150 players × 18 seasons, varying)
**Granularity:** One row per player per season
**Primary Key:** Composite (PLAYER_KEY, SEASON_KEY)

**Key Columns:**
- `PLAYER_KEY` - FK to DIM_PLAYER
- `SEASON_KEY` - FK to DIM_SEASON
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE (team played for that season)
- `APPEARANCES` - Matches played
- `INNINGS_BATTED` - Count of innings in which player batted
- `INNINGS_BOWLED` - Count of overs bowled
- `NOT_OUTS` - Count of times player remained not out
- `TOTAL_RUNS` - Total runs scored
- `BATTING_AVERAGE` - TOTAL_RUNS / (INNINGS_BATTED - NOT_OUTS)
- `HIGHEST_SCORE` - Highest individual score
- `HALF_CENTURIES` - Count of 50+ scores
- `CENTURIES` - Count of 100+ scores
- `STRIKE_RATE` - (TOTAL_RUNS / BALLS_FACED) × 100
- `BALLS_FACED` - Total balls faced while batting
- `FOURS_HIT` - Count of 4-run boundaries
- `SIXES_HIT` - Count of 6-run boundaries
- `RUNS_CONCEDED` - Runs given away while bowling
- `WICKETS` - Wickets taken
- `BOWLING_AVERAGE` - RUNS_CONCEDED / WICKETS (NULL if wickets = 0)
- `ECONOMY_RATE` - RUNS_CONCEDED / OVERS_BOWLED
- `OVERS_BOWLED` - Count of overs bowled (e.g., 45.2 for 45 overs 2 balls)
- `MAIDEN_OVERS` - Count of overs conceding 0 runs
- `BOWLS_DOTS` - Count of dot balls bowled (0 runs)
- `BEST_BOWLING` - Best figures (e.g., "3-15" or "5-20")
- `CATCHES_TAKEN` - Fielding: catches taken
- `STUMPINGS` - Fielding: stumpings effected
- `PLAYER_ROLE_SEASON` - Role during season: "Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"
- `MVP_SCORE` - Composite performance score (weighted metric)
- `FANTASY_POINTS_TOTAL` - Cumulative fantasy points for season

**Relationships:**
- Many-to-one with DIM_PLAYER
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_FRANCHISE

**Notes:**
- BATTING_AVERAGE uses (INNINGS_BATTED - NOT_OUTS) to handle edge cases
- STRIKE_RATE formatted as percentage (e.g., 142.5)
- ECONOMY_RATE in runs per over (e.g., 7.5)
- Some all-rounders have both batting and bowling stats
- MVP_SCORE is proprietary composite; documented in METRIC_DEFINITIONS.md
- Missing records indicate player didn't appear that season

---

### 10. FACT_BALL_BY_BALL
**Purpose:** Granular over-level and ball-level data
**Row Count:** 279,758 records (all balls bowled 2008-2025)
**Granularity:** One row per ball delivered
**Primary Key:** Composite (MATCH_KEY, INNINGS_NUMBER, OVER_NUMBER, BALL_NUMBER_IN_OVER)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `INNINGS_NUMBER` - 1 for first innings, 2 for second innings
- `OVER_NUMBER` - Over number (1-20)
- `BALL_NUMBER_IN_OVER` - Ball in over (1-6)
- `BOWLER_PLAYER_KEY` - FK to DIM_PLAYER
- `BATSMAN_PLAYER_KEY` - FK to DIM_PLAYER (striker)
- `NON_STRIKER_PLAYER_KEY` - FK to DIM_PLAYER (non-striker)
- `BATTING_TEAM_CODE` - Team batting (joins to DIM_FRANCHISE.TEAM_CODE)
- `BOWLING_TEAM_CODE` - Team bowling (joins to DIM_FRANCHISE.TEAM_CODE)
- `RUNS_OFF_BAT` - Runs scored by batsman (0-6)
- `EXTRAS_RUNS` - Extra runs (wides, no-balls, byes, leg-byes)
- `TOTAL_RUNS` - RUNS_OFF_BAT + EXTRAS_RUNS
- `IS_WICKET` - Boolean (1 if batsman dismissed, 0 otherwise)
- `WICKET_TYPE` - "Bowled", "Caught", "LBW", "Run Out", "Stumped", "Hit Wicket", NULL if no wicket
- `WICKET_FIELDER_KEY` - FK to DIM_PLAYER if caught/stumped, NULL otherwise
- `IS_DOT_BALL` - Boolean (1 if 0 runs, 0 otherwise)
- `IS_WIDE` - Boolean
- `IS_NO_BALL` - Boolean
- `IS_BOUNDARY_4` - Boolean (1 if 4 runs off bat)
- `IS_BOUNDARY_6` - Boolean (1 if 6 runs off bat)
- `IS_POWERPLAY` - Boolean (1 if over ≤ 6, 0 otherwise)
- `CUMULATIVE_SCORE_BATTING_TEAM` - Running total for batting team after this ball
- `CUMULATIVE_WICKETS_BATTING_TEAM` - Running wicket count after this ball
- `RUNS_REQUIRED` - For second innings: runs still needed (NULL for first innings)

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_PLAYER (bowler, batsman, non-striker, fielder)
- Many-to-one with DIM_FRANCHISE (via BATTING_TEAM_CODE and BOWLING_TEAM_CODE to TEAM_CODE)

**Critical Notes:**
- **Large table (279K+ records):** Use with aggregation in queries; avoid SELECT *
- BATTING_TEAM_CODE and BOWLING_TEAM_CODE join to DIM_FRANCHISE.TEAM_CODE (NOT FRANCHISE_KEY)
- RUNS_OFF_BAT ranges 0-6; EXTRAS can exceed 6 (no-ball followed by free hit)
- CUMULATIVE_SCORE and CUMULATIVE_WICKETS denormalized for performance
- Ball-by-ball data is most granular; use for detailed run rates, dot ball analysis

---

### 11. FACT_INNINGS_SCORECARD
**Purpose:** Innings-level summary data
**Row Count:** 37,472 records (~2 innings × 1,098 matches + super overs)
**Granularity:** One row per innings per match
**Primary Key:** Composite (MATCH_KEY, INNINGS_NUMBER)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `INNINGS_NUMBER` - 1 or 2 (or 3/4 for super overs)
- `BATTING_TEAM_CODE` - Team batting (joins to DIM_FRANCHISE.TEAM_CODE)
- `BOWLING_TEAM_CODE` - Team bowling (joins to DIM_FRANCHISE.TEAM_CODE)
- `TEAM_SCORE` - Total runs scored in innings
- `TEAM_WICKETS_LOST` - Wickets lost (0-10)
- `OVERS_BOWLED` - Overs completed (e.g., 20.0, 19.3 if incomplete)
- `BALLS_FACED_TOTAL` - Total balls faced
- `POWERPLAY_SCORE` - Runs in first 6 overs
- `POWERPLAY_WICKETS` - Wickets lost in first 6 overs
- `MIDDLE_OVERS_SCORE` - Runs in overs 7-15
- `MIDDLE_OVERS_WICKETS` - Wickets in overs 7-15
- `DEATH_OVERS_SCORE` - Runs in overs 16-20
- `DEATH_OVERS_WICKETS` - Wickets in overs 16-20
- `RUNS_PER_OVER` - TEAM_SCORE / OVERS_BOWLED
- `STRIKE_RATE_TEAM` - (TEAM_SCORE / BALLS_FACED_TOTAL) × 100
- `BOUNDARY_RUNS_4S` - Runs from 4-run boundaries (count × 4)
- `BOUNDARY_RUNS_6S` - Runs from 6-run boundaries (count × 6)
- `EXTRA_RUNS` - Wides, no-balls, byes, leg-byes combined
- `CAPTAIN_PLAYER_KEY` - FK to DIM_PLAYER
- `PLAYER_OF_MATCH_KEY` - FK to DIM_PLAYER (if decided)
- `HIGHEST_INDIVIDUAL_SCORE` - Highest individual score in innings
- `HIGHEST_SCORER_PLAYER_KEY` - FK to DIM_PLAYER
- `INNINGS_STATUS` - "Completed", "Abandoned", "No Result", "All Out"

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_VENUE
- Many-to-one with DIM_PLAYER (captain, POTM, highest scorer)
- Many-to-one with DIM_FRANCHISE (via team codes to TEAM_CODE)

**Notes:**
- Two records per match (one per innings, usually)
- Super overs are separate innings (INNINGS_NUMBER = 3+)
- OVERS_BOWLED can be < 20 if team all-out or match abandoned
- Phase-based breakdown (powerplay, middle, death) enables KPI calculation
- RUNS_PER_OVER is aggregated; use with OVERS_BOWLED for accuracy

---

### 12. FACT_OVER_SUMMARY
**Purpose:** Over-by-over summary (aggregated from FACT_BALL_BY_BALL)
**Row Count:** 46,840 records (~20 overs × 2 innings × 1,098 matches)
**Granularity:** One row per over per innings
**Primary Key:** Composite (MATCH_KEY, INNINGS_NUMBER, OVER_NUMBER)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `INNINGS_NUMBER` - Innings number (1 or 2)
- `OVER_NUMBER` - Over number (1-20)
- `BOWLER_PLAYER_KEY` - FK to DIM_PLAYER
- `BATTING_TEAM_CODE` - Team batting (joins to DIM_FRANCHISE.TEAM_CODE)
- `BOWLING_TEAM_CODE` - Team bowling (joins to DIM_FRANCHISE.TEAM_CODE)
- `RUNS_IN_OVER` - Total runs conceded (including extras)
- `WICKETS_IN_OVER` - Wickets taken in over
- `DOT_BALLS` - Count of dot balls (0 runs)
- `SINGLES` - Count of single-run outcomes
- `DOUBLES` - Count of 2-run outcomes
- `BOUNDARIES_4S` - Count of 4-run boundaries
- `BOUNDARIES_6S` - Count of 6-run boundaries
- `WIDES` - Count of wide balls
- `NO_BALLS` - Count of no-ball deliveries
- `EXTRAS_TOTAL` - Total extra runs
- `MAIDEN_OVER` - Boolean (1 if 0 runs conceded)
- `BOWLER_ECONOMY_OVER` - Economy rate for this over (RUNS_IN_OVER / 1)
- `CUMULATIVE_SCORE_BATTING_TEAM` - Running score after this over
- `CUMULATIVE_WICKETS_BATTING_TEAM` - Running wickets after this over
- `RUN_RATE_REQUIRED_AFTER_OVER` - For second innings: RRR after this over

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_VENUE
- Many-to-one with DIM_PLAYER (bowler)
- Many-to-one with DIM_FRANCHISE (via team codes to TEAM_CODE)

**Notes:**
- Aggregated from FACT_BALL_BY_BALL for faster queries on over-level analysis
- Denormalized cumulative scores for dashboard convenience
- 6 deliveries expected per over, but wides/no-balls may extend
- Use for powerplay analysis, death overs analysis, bowler economy trends

---

### 13. FACT_FRANCHISE_FINANCIALS
**Purpose:** Franchise revenue, profit, and financial KPIs
**Row Count:** 147 records (~8-15 franchises × 18 seasons)
**Granularity:** One row per franchise per season
**Primary Key:** Composite (FRANCHISE_KEY, SEASON_KEY)

**Key Columns:**
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE
- `SEASON_KEY` - FK to DIM_SEASON
- `TOTAL_REVENUE_CRORE` - Total revenue in INR Crore
- `TITLE_SPONSORSHIP_CR` - Title sponsor income
- `JERSEY_SPONSORSHIP_CR` - Jersey sponsor income
- `GATE_RECEIPTS_CR` - Home match ticket revenue
- `BROADCAST_SHARE_CR` - Share of broadcast revenue
- `PRIZE_MONEY_CR` - Prize money earned (league + playoff bonuses)
- `OTHER_REVENUE_CR` - Merchandise, hospitality, other streams
- `OPERATING_EXPENSES_CRORE` - Salaries, operations, overheads
- `PLAYER_SALARY_CAP_CR` - Amount spent on player salaries
- `OPERATING_PROFIT_CRORE` - TOTAL_REVENUE - OPERATING_EXPENSES
- `OPERATING_PROFIT_MARGIN_PCT` - OPERATING_PROFIT / TOTAL_REVENUE × 100
- `FRANCHISE_VALUATION_CRORE` - Estimated franchise value
- `VALUATION_GROWTH_YOY_PCT` - Year-over-year valuation growth
- `NPS_SCORE` - Net Promoter Score (0-100 scale, franchise fan satisfaction)
- `BRAND_VALUE_CRORE` - Brand valuation metric
- `MARKET_SHARE_PCT` - Market share relative to all 8-15 franchises

**Relationships:**
- Many-to-one with DIM_FRANCHISE
- Many-to-one with DIM_SEASON

**Notes:**
- One record per franchise per season (allows comparison across years)
- TOTAL_REVENUE and OPERATING_PROFIT are financial actuals (not estimates)
- PLAYER_SALARY_CAP subject to IPL regulations (increasing each year)
- FRANCHISE_VALUATION based on external valuations (Sportico, IBIS Capital)
- NPS_SCORE sourced from franchise-specific fan surveys
- Missing records for franchises that didn't exist in that season

---

### 14. FACT_PLAYER_AUCTION
**Purpose:** Player auction bids, prices, and acquisition data
**Row Count:** 3,401 records (players auctioned across all years)
**Granularity:** One row per player per auction
**Primary Key:** Composite (PLAYER_KEY, AUCTION_KEY)

**Key Columns:**
- `PLAYER_KEY` - FK to DIM_PLAYER
- `AUCTION_KEY` - FK to DIM_AUCTION_YEAR
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE (purchasing team)
- `SOLD_PRICE_CRORE` - Final auction price in INR Crore
- `BASE_PRICE_CRORE` - Starting bid price
- `PRICE_MULTIPLE` - SOLD_PRICE / BASE_PRICE
- `PLAYER_CATEGORY` - "Indian", "Overseas"
- `AUCTION_STATUS` - "Sold", "Unsold", "Retained", "RTM"
- `AUCTION_ROUND` - Round in which player sold (1-3 or NULL if unsold)
- `HIGHEST_BIDDER_FRANCHISE_KEY` - Final winning franchise (same as FRANCHISE_KEY if sold)
- `BIDDING_COMPETITION` - Count of franchises that bid (1-8)
- `PRIOR_SEASON_PLAYER_FRANCHISE_KEY` - Previous season franchise (if any)
- `IS_RETAINED_FROM_PRIOR_SEASON` - Boolean (1 if using retention slot)
- `IS_NEW_TO_IPL` - Boolean (1 if first IPL auction)
- `PLAYER_ROLE` - Player role (denormalized from DIM_PLAYER)
- `PLAYER_NATIONALITY` - Nationality (denormalized from DIM_PLAYER)

**Relationships:**
- Many-to-one with DIM_PLAYER
- Many-to-one with DIM_AUCTION_YEAR (via AUCTION_KEY)
- Many-to-one with DIM_FRANCHISE (purchasing team)
- Implicit one-to-one with FACT_PLAYER_SEASON_STATS (same season's stats for ROI)

**Critical Notes:**
- **Column Name Issue:** Use `SOLD_PRICE_CRORE`, NOT "AUCTION_PRICE" or "BID_PRICE"
- Retained players may not appear in auction (separate retention records)
- RTM (Right to Match) is distinct from sold/retained
- BIDDING_COMPETITION indicates market demand for player
- PLAYER_ROLE denormalized for filtering without joins

---

### 15. FACT_TICKET_SALES
**Purpose:** Stadium ticket sales revenue by match and tier
**Row Count:** 9,368 records (ticket sales across all home matches)
**Granularity:** One row per ticket category per match per franchise
**Primary Key:** Composite (MATCH_KEY, FRANCHISE_KEY, TICKET_TIER)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `FRANCHISE_KEY` - Home franchise (ticket revenue belongs to them)
- `TICKET_TIER` - "General Admission", "Premium", "Hospitality", "VIP", "Corporate"
- `TICKETS_AVAILABLE` - Capacity for this tier
- `TICKETS_SOLD` - Count of tickets sold
- `CAPACITY_UTILIZATION_PCT` - (TICKETS_SOLD / TICKETS_AVAILABLE) × 100
- `PRICE_PER_TICKET_INR` - Average price per ticket in INR
- `REVENUE_INR` - Total revenue from this tier (TICKETS_SOLD × PRICE_PER_TICKET_INR)
- `REVENUE_CRORE` - Revenue in INR Crore (REVENUE_INR / 10,000,000)
- `EARLY_BIRD_DISCOUNT_PCT` - Discount offered for early bookings
- `GROUP_BOOKING_DISCOUNT_PCT` - Group sales discount
- `SEASON_TICKET_ALLOCATION` - Count of season ticket holders in this match
- `LAST_MINUTE_BOOKINGS_PCT` - Percentage sold in final 24 hours

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_VENUE
- Many-to-one with DIM_FRANCHISE

**Notes:**
- One row per tier per match per home team
- Capacity varies by tier and stadium
- REVENUE_CRORE denormalized from REVENUE_INR for consistency
- Early-bird and group discounts impact PRICE_PER_TICKET_INR
- COVID-19 seasons (2020-2021) have reduced capacities

---

### 16. FACT_BROADCAST_RATINGS
**Purpose:** TV and broadcast viewership data
**Row Count:** 175,650 records (multiple broadcast segments per match)
**Granularity:** One or more rows per match (multiple broadcasters/regions)
**Primary Key:** Composite (BROADCAST_KEY) - surrogate key, or (MATCH_KEY, BROADCASTER, REGION)

**Key Columns:**
- `BROADCAST_KEY` - Surrogate key
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `BROADCAST_NETWORK` - "Star Sports", "Disney+Hotstar", "Sony Sports", "Doordarshan"
- `REGION` - Geographic region ("North India", "South India", "East India", etc.) or "National"
- `BROADCAST_DATE` - Date aired (may differ from MATCH_DATE for replays)
- `BROADCAST_TIME` - Time slot (IST)
- `TVR_RATING` - Television Rating (estimated audience percentage)
- `PEAK_VIEWERSHIP_MILLIONS` - Peak viewers in millions
- `AVERAGE_VIEWERSHIP_MILLIONS` - Average viewers during broadcast
- `DURATION_MINUTES` - Broadcast duration
- `PRIMETIME_SLOT` - Boolean (1 if 8 PM - 11 PM slot)
- `REPEAT_BROADCAST` - Boolean (1 if not live, 0 for live)
- `LANGUAGE` - Broadcast language ("Hindi", "English", "Regional")
- `COMMERCIAL_BREAK_MINUTES` - Ad time
- `COMMERCIAL_REVENUE_ESTIMATE_CR` - Estimated ad revenue

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON

**Notes:**
- Multiple rows per match (different broadcasters, regions, languages, repeat broadcasts)
- TVR_RATING is Nielsen/TAM Media Research estimate (not absolute)
- PEAK_VIEWERSHIP may exceed total population (measurement error or duplication)
- REPEAT_BROADCAST entries inflate row count but allow viewership tracking
- PRIMETIME_SLOT correlates with higher viewership
- Regional broadcasts only available for selected networks

---

### 17. FACT_FAN_ENGAGEMENT
**Purpose:** Social media sentiment and fan engagement metrics
**Row Count:** 112,416 records (daily fan engagement data)
**Granularity:** One row per franchise per match day (or aggregated daily)
**Primary Key:** Composite (ENGAGEMENT_KEY) - surrogate, or (FRANCHISE_KEY, MATCH_KEY, DATE_KEY)

**Key Columns:**
- `ENGAGEMENT_KEY` - Surrogate key
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE
- `SEASON_KEY` - FK to DIM_SEASON
- `MATCH_KEY` - FK to DIM_MATCH (if engagement related to match)
- `DATE_KEY` - FK to DIM_DATE
- `TWITTER_MENTIONS` - Count of tweets mentioning franchise/player
- `TWITTER_SENTIMENT_POSITIVE` - Count of positive sentiment tweets
- `TWITTER_SENTIMENT_NEGATIVE` - Count of negative sentiment tweets
- `TWITTER_SENTIMENT_NEUTRAL` - Count of neutral sentiment tweets
- `SENTIMENT_SCORE` - 0-1 scale (0 = all negative, 1 = all positive)
- `INSTAGRAM_FOLLOWERS` - Follower count (snapshot per day)
- `INSTAGRAM_ENGAGEMENT_RATE` - Likes + comments / followers
- `FACEBOOK_LIKES` - FB page engagement metric
- `TIKTOK_VIDEOS` - Count of TikTok videos (if applicable)
- `YOUTUBE_VIEWS` - Views on franchise YouTube channel
- `HASHTAG_VOLUME` - Count of franchise hashtag uses
- `VIRAL_INDEX` - Proprietary virality score (0-100)
- `FAN_SENTIMENT_CATEGORY` - "Highly Positive", "Positive", "Neutral", "Negative", "Highly Negative"
- `ENGAGEMENT_DRIVER` - "Match Win", "Player Performance", "Auction News", "Injury", "Off-field News"

**Relationships:**
- Many-to-one with DIM_FRANCHISE
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_MATCH (optional)
- Many-to-one with DIM_DATE

**Notes:**
- Data available from 2014 onwards (earlier data sparse)
- SENTIMENT_SCORE calculated from positive/negative/neutral counts
- Multiple rows possible per match (one per franchise, one for overall)
- ENGAGEMENT_DRIVER helps context match sentiment
- Real-time updates stop at previous day (1-day lag)

---

### 18. FACT_FANTASY_POINTS
**Purpose:** Daily fantasy sports points for players
**Row Count:** 58,550 records (multiple scoring systems)
**Granularity:** One row per player per match per scoring system
**Primary Key:** Composite (PLAYER_KEY, MATCH_KEY, FANTASY_SYSTEM)

**Key Columns:**
- `PLAYER_KEY` - FK to DIM_PLAYER
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE (franchise player played for)
- `FANTASY_SYSTEM` - "Dream11", "MyTeam11", "BalleBaazi" (multiple systems tracked)
- `BATTING_POINTS` - Points from batting performance
- `BOWLING_POINTS` - Points from bowling performance
- `FIELDING_POINTS` - Points from fielding (catches, stumpings, run-outs)
- `BONUS_POINTS` - Special bonuses (50-run bonus, 3-wicket bonus, etc.)
- `TOTAL_POINTS` - Sum of all point categories
- `PLAYER_MULTIPLIER` - Multiplier applied if player is C or VC (Captain/Vice-Captain)
- `FINAL_POINTS_WITH_MULTIPLIER` - TOTAL_POINTS × PLAYER_MULTIPLIER
- `HIGHEST_FANTASY_SCORE_MATCH` - Boolean (1 if highest in match)
- `FANTASY_PRICE_CRORE` - Player price in fantasy auction (0.5 Cr to 12 Cr range)
- `FANTASY_PRICE_CHANGE_FROM_AUCTION` - Price change from opening price

**Relationships:**
- Many-to-one with DIM_PLAYER
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_FRANCHISE

**Notes:**
- Multiple rows per player per match (different fantasy systems = different scoring)
- FANTASY_SYSTEM variations affect TOTAL_POINTS calculation
- Batting 25 pts per 25 runs, bowling 50 pts per wicket (typical rules)
- Captain multiplier typically 2x, Vice-Captain 1.5x
- FANTASY_PRICE_CRORE varies across seasons and systems

---

### 19. FACT_SOCIAL_MEDIA_SENTIMENT
**Purpose:** Detailed social media sentiment tracking
**Row Count:** 21,078 records (tweet/post-level sentiment data)
**Granularity:** One row per social media mention (tweet, post, comment)
**Primary Key:** SOCIAL_MEDIA_ID (unique post ID)

**Key Columns:**
- `SOCIAL_MEDIA_ID` - Unique post/tweet ID
- `PLAYER_KEY` - FK to DIM_PLAYER (mentioned player, if specific)
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE
- `SEASON_KEY` - FK to DIM_SEASON
- `MATCH_KEY` - FK to DIM_MATCH (if match-related)
- `DATE_KEY` - FK to DIM_DATE
- `PLATFORM` - "Twitter", "Instagram", "Facebook", "Reddit"
- `POST_TEXT` - Text of post (up to 500 chars)
- `SENTIMENT_LABEL` - "Positive", "Negative", "Neutral"
- `SENTIMENT_SCORE` - -1 to +1 scale (-1 = negative, +1 = positive)
- `EMOTION_DETECTED` - "Joy", "Anger", "Sadness", "Surprise", "Disgust" (NLP output)
- `ENGAGEMENT_COUNT` - Likes + retweets + replies
- `ACCOUNT_FOLLOWERS` - Follower count of poster (influence metric)
- `IS_VERIFIED_ACCOUNT` - Boolean (1 if blue checkmark, 0 otherwise)
- `LANGUAGE` - Language of post
- `TOPIC` - "Performance", "Selection", "Auction", "Off-field", "Injury", "Other"

**Relationships:**
- Many-to-one with DIM_PLAYER (optional)
- Many-to-one with DIM_FRANCHISE
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_MATCH (optional)
- Many-to-one with DIM_DATE

**Notes:**
- Data from 2014 onwards (Twitter API access)
- SENTIMENT_SCORE from NLP model (may not be 100% accurate)
- One row per post (massive table, aggregate before querying)
- TOPIC helps understand context of sentiment
- Verified accounts may carry more weight in trend analysis

---

### 20. FACT_SPONSOR_EXPOSURE
**Purpose:** Sponsor visibility and exposure metrics
**Row Count:** 37,472 records (one per match, multiple sponsors per record)
**Granularity:** One or more rows per match (sponsor visibility tracking)
**Primary Key:** Composite (MATCH_KEY, SPONSOR_KEY, EXPOSURE_TYPE)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `FRANCHISE_KEY` - FK to DIM_FRANCHISE (franchise's sponsor)
- `SPONSOR_NAME` - Sponsor company name
- `EXPOSURE_TYPE` - "Jersey", "Title", "Boundary Board", "Broadcasting", "Social Media"
- `BROADCAST_MINUTES` - Minutes of on-screen exposure
- `BROADCAST_VALUE_CRORE` - Estimated advertising value equivalent
- `SOCIAL_MEDIA_IMPRESSIONS` - Social media views from highlights/clips
- `SOCIAL_MEDIA_ENGAGEMENT` - Likes, shares, comments
- `ON_GROUND_VISIBILITY_RATING` - Qualitative rating (1-10 scale)
- `EXPOSURE_FREQUENCY` - Count of times sponsor visible per match
- `ROI_ESTIMATE_PCT` - Estimated ROI on sponsorship

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_FRANCHISE

**Notes:**
- BROADCAST_VALUE_CRORE is estimated based on standard advertising rates
- EXPOSURE_TYPE varies (jersey appears all match, boards are intermittent)
- Multiple rows per match possible (multiple sponsors for same franchise)
- ROI_ESTIMATE_PCT is proprietary calculation (documented in METRIC_DEFINITIONS)

---

### 21. FACT_STREAMING_OVER_VIEWERSHIP
**Purpose:** Over-by-over streaming viewership data
**Row Count:** 234,200 records (~20 overs × 2 innings × 1,098 matches × multiple platforms)
**Granularity:** One row per over per platform
**Primary Key:** Composite (MATCH_KEY, INNINGS_NUMBER, OVER_NUMBER, PLATFORM)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `INNINGS_NUMBER` - Innings number (1 or 2)
- `OVER_NUMBER` - Over number (1-20)
- `PLATFORM` - "Disney+Hotstar", "SonyLiv", "AmazonPrime", "Other"
- `CONCURRENT_VIEWERS` - Viewers watching simultaneously during over
- `CUMULATIVE_VIEWERS_SEASON` - Cumulative viewers for match on platform
- `DEVICE_TYPE` - "Mobile", "Desktop", "SmartTV", "Tablet"
- `GEOGRAPHIC_REGION` - Region watching (India or international)
- `DATA_QUALITY_FLAG` - Boolean (1 if data is reliable, 0 if estimated)

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON

**Notes:**
- Large table: data provided by platforms (Disney+Hotstar dominates)
- CONCURRENT_VIEWERS peaks during exciting overs (sixes, wickets)
- Requires aggregation for meaningful analysis (use GROUP BY PLATFORM, OVER_NUMBER)
- Data available from 2020 onwards primarily

---

### 22. FACT_VENUE_CONDITIONS
**Purpose:** Venue pitch conditions and weather impact
**Row Count:** 5,855 records (one per match)
**Granularity:** One row per match per venue
**Primary Key:** Composite (MATCH_KEY, VENUE_KEY)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `VENUE_KEY` - FK to DIM_VENUE
- `PITCH_CONDITION_RATING` - 1-10 scale (1 = difficult, 10 = batsman-friendly)
- `PITCH_CATEGORY` - "Hard and Fast", "Balanced", "Slow and Low", "Dusty/Turning"
- `GRASS_COVERAGE_PCT` - Grass coverage percentage (0-100)
- `MOISTURE_LEVEL` - "Dry", "Moderate", "Wet"
- `TEMPERATURE_CELSIUS` - Ambient temperature at match time
- `HUMIDITY_PCT` - Relative humidity
- `WIND_SPEED_KMH` - Wind speed
- `WIND_DIRECTION` - Compass direction (N, S, E, W, NE, etc.)
- `RAINFALL_PRECEDING_24HRS_MM` - Rainfall in prior 24 hours
- `CLOUD_COVER_PCT` - Cloud coverage percentage
- `VISIBILITY_METERS` - Visibility (if fog/pollution)
- `BALL_BEHAVIOR` - Qualitative assessment ("swinging", "seaming", "turning")
- `FIRST_INNINGS_EXPECTED_SCORE` - Forecast of first innings total
- `ACTUAL_FIRST_INNINGS_SCORE` - Actual runs (for validation)
- `FORECAST_ACCURACY` - Error between forecast and actual

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_VENUE

**Notes:**
- PITCH_CONDITION_RATING is subjective (expert opinion from match day)
- Weather data sourced from meteorological records
- FORECAST_ACCURACY helps assess model performance
- Pitch behavior correlates with run rates and wicket patterns
- Some early seasons (2008-2010) have incomplete weather data

---

### 23. FACT_MATCH_PREDICTION_MARKET
**Purpose:** Betting/prediction market data and odds
**Row Count:** 46,840 records (~20 overs × 2 innings per match)
**Granularity:** One row per over per match (prediction market odds update per over)
**Primary Key:** Composite (MATCH_KEY, MARKET_PERIOD)

**Key Columns:**
- `MATCH_KEY` - FK to DIM_MATCH
- `SEASON_KEY` - FK to DIM_SEASON
- `MARKET_PERIOD` - Period identifier (e.g., "Pre-match", "After Over 6", "After 10 overs")
- `OVER_NUMBER` - Over number (0 for pre-match, 1-20 during match)
- `INNINGS_NUMBER` - Innings (0 for pre-match, 1-2 during match)
- `TEAM_1_CODE` - Team 1 code (joins to DIM_FRANCHISE.TEAM_CODE)
- `TEAM_2_CODE` - Team 2 code (joins to DIM_FRANCHISE.TEAM_CODE) — **NOTE: Use TEAM_CODE for joins, not FRANCHISE_KEY**
- `WIN_PROBABILITY_TEAM_1_PCT` - Probability of TEAM_1 winning at this point (0-100)
- `WIN_PROBABILITY_TEAM_2_PCT` - Probability of TEAM_2 winning at this point (0-100)
- `IMPLIED_ODDS_TEAM_1` - Decimal odds for TEAM_1 (1.5x, 2.0x, etc.)
- `IMPLIED_ODDS_TEAM_2` - Decimal odds for TEAM_2
- `ACTUAL_MATCH_RESULT_TEAM_1_WON` - Boolean (1 if TEAM_1 won, 0 if TEAM_2 won, NULL if match ongoing)
- `PREDICTION_ACCURACY` - Boolean (1 if market prediction correct, 0 if wrong)
- `MARKET_VOLUME_ESTIMATE_CR` - Estimated betting volume in INR Crore

**Relationships:**
- Many-to-one with DIM_MATCH
- Many-to-one with DIM_SEASON
- Many-to-one with DIM_FRANCHISE (via TEAM_1_CODE and TEAM_2_CODE to TEAM_CODE)

**Critical Notes:**
- **JOIN ISSUE:** TEAM_1_CODE and TEAM_2_CODE join to **DIM_FRANCHISE.TEAM_CODE**, NOT FRANCHISE_KEY
- Pre-match records have OVER_NUMBER = 0 and INNINGS_NUMBER = 0
- 20+ records per match (one per over, plus pre-match)
- WIN_PROBABILITY_TEAM_1_PCT + WIN_PROBABILITY_TEAM_2_PCT typically equals 100%
- PREDICTION_ACCURACY measures market efficiency
- MARKET_VOLUME_ESTIMATE based on liquidity analysis

---

## Critical Join Rules Summary

### Join Path by Use Case

**For Match-Level Analysis:**
```
FACT_MATCH_RESULT
  → DIM_MATCH (via MATCH_KEY)
  → DIM_SEASON (via SEASON_KEY)
  → DIM_VENUE (via VENUE_KEY)
  → DIM_FRANCHISE (via WINNING_TEAM_CODE/LOSING_TEAM_CODE to TEAM_CODE)
```

**For Player-Level Analysis:**
```
FACT_PLAYER_SEASON_STATS
  → DIM_PLAYER (via PLAYER_KEY)
  → DIM_SEASON (via SEASON_KEY)
  → DIM_FRANCHISE (via FRANCHISE_KEY)
```

**For Ball-by-Ball Analysis:**
```
FACT_BALL_BY_BALL
  → DIM_PLAYER (via BOWLER_PLAYER_KEY, BATSMAN_PLAYER_KEY, NON_STRIKER_PLAYER_KEY, WICKET_FIELDER_KEY)
  → DIM_MATCH (via MATCH_KEY)
  → DIM_FRANCHISE (via BATTING_TEAM_CODE/BOWLING_TEAM_CODE to TEAM_CODE)
```

**For Franchise Financials:**
```
FACT_FRANCHISE_FINANCIALS
  → DIM_FRANCHISE (via FRANCHISE_KEY)
  → DIM_SEASON (via SEASON_KEY)
```

**For Auction Analysis:**
```
FACT_PLAYER_AUCTION
  → DIM_PLAYER (via PLAYER_KEY)
  → DIM_AUCTION_YEAR (via AUCTION_KEY)
  → DIM_FRANCHISE (via FRANCHISE_KEY)
```

**For Prediction Market Analysis:**
```
FACT_MATCH_PREDICTION_MARKET
  → DIM_MATCH (via MATCH_KEY)
  → DIM_FRANCHISE (via TEAM_1_CODE/TEAM_2_CODE to TEAM_CODE, NOT FRANCHISE_KEY)
```

---

## Column Name Gotchas (Common Mistakes)

| Wrong Name | Right Name | Table | Fix |
|-----------|-----------|-------|-----|
| `WINNER` | `WINNING_TEAM_CODE` | FACT_MATCH_RESULT | Use TEAM_CODE, not FRANCHISE_KEY |
| `LOSER` | `LOSING_TEAM_CODE` | FACT_MATCH_RESULT | Use TEAM_CODE, not FRANCHISE_KEY |
| `AUCTION_PRICE` | `SOLD_PRICE_CRORE` | FACT_PLAYER_AUCTION | Exact column name |
| `BID_PRICE` | `SOLD_PRICE_CRORE` | FACT_PLAYER_AUCTION | Exact column name |
| `TEAM_NAME` | `TEAM_CODE` (for joins) | DIM_FRANCHISE | Always join on TEAM_CODE, not FRANCHISE_NAME |
| `FRANCHISE_ID` | `FRANCHISE_KEY` or `TEAM_CODE` | DIM_FRANCHISE | Depends on context (FRANCHISE_KEY for FK, TEAM_CODE for match joins) |
| `RUNS` | `TEAM_SCORE` | FACT_INNINGS_SCORECARD | TEAM_SCORE is innings total |
| `BOWLS_BOWLED` | `OVERS_BOWLED` | FACT_PLAYER_SEASON_STATS | Overs format: 45.2 = 45 overs 2 balls |
| `WICKETS_BOWLED` | `WICKETS` | FACT_PLAYER_SEASON_STATS | WICKETS is total taken |

---

## Data Integrity Notes

1. **No NULL Franchise Keys:** All fact records link to valid franchises
2. **No NULL Match Keys:** All fact records link to valid matches
3. **Season Completeness:** All matches assigned to exact season
4. **Date Consistency:** DIM_DATE covers full range (2008-2025)
5. **Player History:** All players in FACT_PLAYER_SEASON_STATS have entry in DIM_PLAYER
6. **Audit Trail:** No deleted records; use STATUS fields for deactivation

---

**Last Updated:** 2026-03-31 | **Next Review:** 2026-06-30 (after IPL 2026 season)
