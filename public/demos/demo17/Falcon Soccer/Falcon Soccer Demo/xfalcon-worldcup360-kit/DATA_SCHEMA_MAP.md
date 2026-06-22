# FIFA World Cup Analytics Database Schema Map

## Summary

This document provides a complete schema reference for the FIFA World Cup analytics database, a star schema design optimized for OLAP queries. The database contains **real historical match and player data** from Kaggle combined with **synthetic revenue data** (ticket sales, merchandise, broadcast rights, and sponsorships) spanning multiple FIFA World Cup tournaments.

**Key Statistics:**
- **Fact Tables:** 6 tables with ~43,600 rows of operational data
- **Dimension Tables:** 11 tables supporting 20 tournaments and ~6,000 players
- **Views:** 5 pre-built analytical views
- **Currency:** All monetary values in USD
- **Data Sources:** Match/player data (real); revenue tables (synthetic); all dates are historical

---

## Fact Tables

### FACT_MATCH
**Primary Purpose:** Match-level outcome and attendance data

**Row Count:** 826 rows
**Granularity:** One row per match

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| MATCH_KEY | PK | Unique match identifier | Primary key |
| HOME_TEAM_KEY | FK | Home team dimension key | References DIM_TEAM |
| AWAY_TEAM_KEY | FK | Away team dimension key | References DIM_TEAM |
| VENUE_KEY | FK | Stadium dimension key | References DIM_VENUE |
| STAGE_KEY | FK | Tournament stage dimension key | References DIM_STAGE |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| DATE_KEY | FK | Match date dimension key | References DIM_DATE |
| REFEREE_KEY | FK | Head referee dimension key | References DIM_REFEREE |
| HOME_GOALS_FT | INT | Goals scored by home team (full-time) | 0+ |
| AWAY_GOALS_FT | INT | Goals scored by away team (full-time) | 0+ |
| HOME_GOALS_HT | INT | Goals scored by home team (half-time) | 0+ |
| AWAY_GOALS_HT | INT | Goals scored by away team (half-time) | 0+ |
| TOTAL_GOALS | INT | Sum of HOME_GOALS_FT + AWAY_GOALS_FT | Derived metric |
| ATTENDANCE | INT | Paid attendance at match | Often NULL for early tournaments |
| MATCH_RESULT | VARCHAR(1) | Final result code | 'H'=Home Win, 'A'=Away Win, 'D'=Draw |
| WIN_CONDITIONS | VARCHAR(100) | How match was decided | 'Regular Time', 'Extra Time', 'Penalties', 'Retired', etc. |

**Key Insights:**
- Source: Kaggle historical match data
- Covers all knockout and group stage matches
- Includes penalties and extra-time information
- ATTENDANCE null for early tournaments (pre-1974 estimated)

---

### FACT_PLAYER_MATCH
**Primary Purpose:** Player performance metrics per match

**Row Count:** 37,330 rows
**Granularity:** One row per player per match per tournament

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| PLAYER_MATCH_KEY | PK | Unique player-match identifier | Primary key |
| PLAYER_KEY | FK | Player dimension key | References DIM_PLAYER |
| MATCH_KEY | FK | Match dimension key | References FACT_MATCH |
| TEAM_KEY | FK | Team dimension key | References DIM_TEAM |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| GOALS_SCORED | INT | Non-penalty goals | 0+ |
| OWN_GOALS | INT | Own goals (credited to opponent) | Typically 0 |
| PENALTIES_SCORED | INT | Converted penalty kicks | 0+ |
| YELLOW_CARDS | INT | Yellow card count | 0-2 (2 = ejection) |
| RED_CARDS | INT | Direct red card count | 0-1 |
| MINUTES_PLAYED | INT | Actual minutes on pitch | 0-120 (including ET) |
| LINEUP_STATUS | VARCHAR(1) | Playing status | 'S'=Starter, 'B'=Bench, 'U'=Unused |
| SUB_IN_MINUTE | INT | Minute substituted in | NULL if starter or unused |
| SUB_OUT_MINUTE | INT | Minute substituted out | NULL if not substituted out |

**Key Insights:**
- Source: Kaggle real player match data
- All competitions and tournaments included
- LINEUP_STATUS = 'U' for squad members not in 11v11
- Substitution minutes NULL for players who played full 90+ minutes
- Goals include penalty vs. open-play breakdown

---

### FACT_TICKET_SALES
**Primary Purpose:** Match-level ticket revenue analytics

**Row Count:** 5,052 rows
**Granularity:** One row per match per price tier

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| TICKET_SALES_KEY | PK | Unique ticket sale transaction key | Primary key |
| MATCH_KEY | FK | Match dimension key | References FACT_MATCH |
| VENUE_KEY | FK | Stadium dimension key | References DIM_VENUE |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| DATE_KEY | FK | Sales date dimension key | References DIM_DATE |
| PRICE_TIER | VARCHAR(50) | Ticket category | 'Premium', 'Standard', 'General Admission', etc. |
| TICKETS_SOLD | INT | Units sold in this tier | 0+ |
| TICKET_PRICE_USD | DECIMAL(10,2) | Average price per ticket | 0.00+ |
| REVENUE_USD | DECIMAL(15,2) | Total revenue for tier | TICKETS_SOLD × TICKET_PRICE_USD |
| RESALE_PCT | DECIMAL(5,2) | Percentage of tickets resold | 0.00-100.00 |
| DEMAND_INDEX | DECIMAL(5,2) | Relative demand metric | 0.00-10.00+ (index) |

**Key Insights:**
- Source: Synthetic data
- Aggregated at match × price_tier level
- Includes secondary market resale percentage
- Demand_Index helps predict future pricing strategies
- Date_Key may differ from match date (advance sales)

---

### FACT_MERCHANDISE_SALES
**Primary Purpose:** Retail merchandise revenue by product, team, channel, and date

**Row Count:** ~500,000 rows
**Granularity:** One row per product per channel per day per team

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| MERCH_SALES_KEY | PK | Unique merchandise transaction key | Primary key |
| PRODUCT_KEY | FK | Product dimension key | References DIM_MERCHANDISE_PRODUCT |
| CHANNEL_KEY | FK | Sales channel dimension key | References DIM_CHANNEL |
| TEAM_KEY | FK | Team dimension key | References DIM_TEAM; may be NULL for generic products |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| DATE_KEY | FK | Sales date dimension key | References DIM_DATE |
| UNITS_SOLD | INT | Units sold that day | 0+ |
| UNIT_PRICE_USD | DECIMAL(10,2) | Average unit price | 0.00+ |
| REVENUE_USD | DECIMAL(15,2) | Total daily revenue | UNITS_SOLD × UNIT_PRICE_USD |
| COGS_USD | DECIMAL(15,2) | Cost of goods sold | Cost basis for margin calculation |
| GROSS_MARGIN_USD | DECIMAL(15,2) | Profit before OpEx | REVENUE_USD - COGS_USD |
| PROMO_FLAG | INT | Promotional period indicator | 0=Regular, 1=On promotion |
| DISCOUNT_PCT | DECIMAL(5,2) | Average discount applied | 0.00-100.00 |

**Key Insights:**
- Source: Synthetic data
- Highest-cardinality fact table (~500K rows)
- TEAM_KEY nullable for branded generic products
- COGS_USD essential for profitability analysis
- PROMO_FLAG and DISCOUNT_PCT linked to tournament events
- Date_Key critical for time-series and seasonal analysis

---

### FACT_BROADCAST_RIGHTS
**Primary Purpose:** Broadcast deal economics and viewership

**Row Count:** 192 rows
**Granularity:** One row per broadcaster per tournament

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| BROADCAST_KEY | PK | Unique broadcast deal key | Primary key |
| BROADCASTER_KEY | FK | Broadcaster dimension key | References DIM_BROADCASTER |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| RIGHTS_FEE_USD | DECIMAL(15,2) | Upfront rights acquisition cost | One-time fee |
| SUB_LICENSING_REVENUE_USD | DECIMAL(15,2) | Revenue from sub-licensing rights | Regional/OTT redistribution |
| AD_REVENUE_USD | DECIMAL(15,2) | Advertising revenue generated | Incremental to rights fee |
| PEAK_VIEWERS_MILLIONS | DECIMAL(10,2) | Largest single-match audience | Usually final match |
| AVG_VIEWERS_MILLIONS | DECIMAL(10,2) | Average viewers across all broadcasts | Tournament-wide average |
| TOTAL_BROADCAST_HOURS | INT | Total hours of content aired | All matches + pre/post coverage |
| MATCHES_BROADCAST | INT | Number of matches broadcast | May be less than total matches |

**Key Insights:**
- Source: Synthetic data
- Aggregated at broadcaster × tournament level
- PEAK_VIEWERS_MILLIONS typically final/semi-final matches
- AVG_VIEWERS_MILLIONS heavily influenced by region/timezone
- SUB_LICENSING_REVENUE allows for detailed broadcast profit analysis
- TOTAL_BROADCAST_HOURS includes analysis/pre-game content

---

### FACT_SPONSORSHIP
**Primary Purpose:** Sponsorship deal value and exposure metrics

**Row Count:** 229 rows
**Granularity:** One row per sponsor per tournament

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| SPONSORSHIP_KEY | PK | Unique sponsorship deal key | Primary key |
| SPONSOR_KEY | FK | Sponsor dimension key | References DIM_SPONSOR |
| TOURNAMENT_KEY | FK | Tournament dimension key | References DIM_TOURNAMENT |
| CONTRACT_VALUE_USD | DECIMAL(15,2) | Total cash sponsorship value | Paid to FIFA/organizing body |
| ACTIVATION_SPEND_USD | DECIMAL(15,2) | Sponsor's own marketing spend | On-ground activations |
| MEDIA_VALUE_USD | DECIMAL(15,2) | Estimated broadcast/earned media value | Third-party valuation |
| BRAND_EXPOSURE_HOURS | INT | Total broadcast logo/mention time | In minutes (convert ÷60 for hours) |
| ESTIMATED_REACH_MILLIONS | DECIMAL(10,2) | Estimated global audience reached | Via broadcast + social |
| DEAL_TYPE | VARCHAR(50) | Sponsorship category | 'Official Partner', 'Broadcast Sponsor', 'Category Exclusive' |
| RENEWAL_FLAG | INT | Renewed from previous tournament | 0=New, 1=Returning sponsor |

**Key Insights:**
- Source: Synthetic data
- ACTIVATION_SPEND varies by brand and region
- MEDIA_VALUE_USD = estimated impressions × cost-per-impression
- BRAND_EXPOSURE_HOURS heavily skewed toward final matches
- RENEWAL_FLAG useful for sponsor loyalty analysis
- CONTRACT_VALUE vs. MEDIA_VALUE reveals sponsor ROI

---

## Dimension Tables

### DIM_TOURNAMENT
**Primary Purpose:** Tournament metadata and outcomes

**Row Count:** 20 rows
**Granularity:** One row per FIFA World Cup tournament

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| TOURNAMENT_KEY | PK | Unique tournament identifier | Primary key; 1-20 |
| YEAR_NUM | INT | Tournament year | 1930, 1934, ..., 2022 |
| HOST_COUNTRY | VARCHAR(100) | Primary host nation | Brazil, Qatar, etc. |
| HOST_CONTINENT | VARCHAR(50) | Continent of host | Africa, Americas, Asia, Europe, Oceania |
| WINNER | VARCHAR(100) | Champion team name | Brazil, Germany, France, etc. |
| RUNNER_UP | VARCHAR(100) | Runner-up (finalist) team name | Final loser |
| THIRD_PLACE | VARCHAR(100) | Third-place finisher team name | Third-place playoff winner |
| QUALIFIED_TEAMS | INT | Number of teams in tournament | Ranges 13-48 |
| MATCHES_PLAYED | INT | Total matches | Group stages + KO stages |
| TOTAL_GOALS | INT | Aggregate goals across all matches | Sum of all match goals |
| TOTAL_ATTENDANCE | INT | Cumulative stadium attendance | May be estimated for old tournaments |

**Key Insights:**
- Covers all 21 FIFA World Cups (1930-2022)
- Qualifies_Teams increased over time (13→48)
- Total_Attendance proxy for tournament scale/popularity
- Host_Continent useful for regional analysis

---

### DIM_TEAM
**Primary Purpose:** Team and national confederation metadata

**Row Count:** ~80 rows
**Granularity:** One row per national team

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| TEAM_KEY | PK | Unique team identifier | Primary key |
| TEAM_NAME | VARCHAR(100) | Official team name | "Argentina", "Germany", etc. |
| CONFEDERATION | VARCHAR(50) | Continental federation | AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA |
| FIFA_CODE | VARCHAR(3) | ISO 3-letter country code | ARG, GER, USA, etc. |

**Key Insights:**
- Static master list; non-changing attributes
- CONFEDERATION useful for regional analysis (UEFA dominates wins)
- FIFA_CODE allows cross-reference with external data

---

### DIM_PLAYER
**Primary Purpose:** Player demographic and positional information

**Row Count:** ~6,000 rows
**Granularity:** One row per unique player across all tournaments

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| PLAYER_KEY | PK | Unique player identifier | Primary key |
| PLAYER_NAME | VARCHAR(255) | Full player name | Pele, Maradona, Messi, etc. |
| BIRTH_YEAR | INT | Birth year | NULL for players pre-1966 (data unavailable) |
| POSITION | VARCHAR(50) | Primary playing position | Goalkeeper, Defender, Midfielder, Forward |
| NATIONALITY | VARCHAR(100) | Player's country of origin | Must match DIM_TEAM.TEAM_NAME or FIFA_CODE |

**Key Insights:**
- BIRTH_YEAR NULL for ~400 historic players (pre-1966)
- NATIONALITY may differ from playing team (rare dual-nation cases)
- POSITION simplification (not GK vs RB vs CB; just "Defender")
- Useful for age-based cohort analysis (joinable with DIM_DATE)

---

### DIM_VENUE
**Primary Purpose:** Stadium and geographic information

**Row Count:** 183 rows
**Granularity:** One row per unique stadium

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| VENUE_KEY | PK | Unique stadium identifier | Primary key |
| STADIUM_NAME | VARCHAR(255) | Official stadium name | "Maracanã", "Wembley", etc. |
| CITY | VARCHAR(100) | City location | Host city |
| COUNTRY | VARCHAR(100) | Country location | Host nation |
| CONTINENT | VARCHAR(50) | Continent | Africa, Americas, Asia, Europe, Oceania |
| CAPACITY | INT | Stadium seating capacity | Usually NULL; when present, historical capacity |
| LATITUDE | DECIMAL(10,8) | Geographic latitude | For mapping/distance analysis |
| LONGITUDE | DECIMAL(10,8) | Geographic longitude | For mapping/distance analysis |
| SURFACE_TYPE | VARCHAR(50) | Playing surface | Natural Grass, Artificial Turf, Hybrid |

**Key Insights:**
- CAPACITY almost entirely NULL (historical data unavailable)
- LATITUDE/LONGITUDE enable geographic clustering and timezone inference
- SURFACE_TYPE useful for injury/performance analysis (not in current facts, but metadata)
- Some stadiums reused across tournaments (same VENUE_KEY)

---

### DIM_STAGE
**Primary Purpose:** Tournament stage progression metadata

**Row Count:** 6-8 rows
**Granularity:** One row per tournament stage type

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| STAGE_KEY | PK | Unique stage identifier | Primary key |
| STAGE_NAME | VARCHAR(100) | Official stage name | Group Stage, Round of 16, Quarter-finals, Semi-finals, Third Place, Final |
| STAGE_ORDER | INT | Sequential order in tournament | 1=Groups, 2=R16, 3=QF, 4=SF, 5=3rd, 6=Final |

**Key Insights:**
- Small lookup table; rarely changes
- STAGE_ORDER enables chronological tournament analysis
- Used to segment match-level performance (group stage vs. KO)

---

### DIM_DATE
**Primary Purpose:** Time dimension for temporal analysis and fiscal period grouping

**Row Count:** 33,287+ rows
**Granularity:** One row per day (1930-01-01 onward)

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| DATE_KEY | PK | Date key (YYYYMMDD format) | Primary key; e.g., 20220405 |
| FULL_DATE | DATE | Actual calendar date | ISO 8601 format |
| YEAR_NUM | INT | Calendar year | 1930, 1931, ..., 2026 |
| MONTH_NUM | INT | Month of year | 1-12 |
| DAY_NUM | INT | Day of month | 1-31 |
| FISCAL_YEAR | INT | Fiscal year (July-June) | FY2022 = July 2021 - June 2022 |

**Key Insights:**
- Continuous date range; fact tables may reference sparse subset
- FISCAL_YEAR useful for FIFA's financial reporting cycle
- MONTH_NUM enables seasonal merchandise analysis
- Use DATE_KEY for efficient integer joins (vs. DATE fields)

---

### DIM_REFEREE
**Primary Purpose:** Referee biographical information

**Row Count:** ~200 rows
**Granularity:** One row per unique referee

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| REFEREE_KEY | PK | Unique referee identifier | Primary key |
| REFEREE_NAME | VARCHAR(255) | Full referee name | e.g., "Pierluigi Collina" |
| NATIONALITY | VARCHAR(100) | Referee's country of origin | For conflict-of-interest analysis |

**Key Insights:**
- Static dimension
- NATIONALITY useful for bias analysis (limiting home-country refs)
- Some refs span multiple tournaments; others single appearance

---

### DIM_MERCHANDISE_PRODUCT
**Primary Purpose:** Product catalog for merchandise sales fact table

**Row Count:** 340 rows
**Granularity:** One row per unique product SKU

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| PRODUCT_KEY | PK | Unique product identifier | Primary key |
| PRODUCT_NAME | VARCHAR(255) | Product name/description | "Official Jersey", "Scarf", etc. |
| CATEGORY | VARCHAR(100) | Product category | Apparel, Accessories, Collectibles, Equipment |
| SUBCATEGORY | VARCHAR(100) | Detailed category | e.g., within Apparel: Jersey, Shorts, Socks |

**Key Insights:**
- Static dimension
- CATEGORY/SUBCATEGORY form hierarchy for roll-up analysis
- ~340 SKUs across 4 categories; most inventory apparel

---

### DIM_CHANNEL
**Primary Purpose:** Sales channel metadata for merchandise distribution

**Row Count:** 8 rows
**Granularity:** One row per unique sales channel

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| CHANNEL_KEY | PK | Unique channel identifier | Primary key |
| CHANNEL_NAME | VARCHAR(100) | Channel name | Official Store, Amazon, Stadium Vendor, etc. |

**Key Insights:**
- Small lookup table
- Typically: 2-3 official channels, 2-3 third-party (Amazon, etc.), stadium direct
- Used to segment merchandise by distribution strategy

---

### DIM_BROADCASTER
**Primary Purpose:** Broadcast partner and platform information

**Row Count:** ~50 rows
**Granularity:** One row per unique broadcaster/platform combination

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| BROADCASTER_KEY | PK | Unique broadcaster identifier | Primary key |
| BROADCASTER_NAME | VARCHAR(255) | Network/platform name | BBC, Fox Sports, Peacock, beIN, etc. |
| MARKET | VARCHAR(100) | Primary market/region | UK, USA, Middle East, etc. |
| REGION | VARCHAR(50) | Geographic region | Europe, Americas, Asia-Pacific, Africa |
| PLATFORM_TYPE | VARCHAR(50) | Broadcast medium | TV, Streaming, Digital, Radio |

**Key Insights:**
- PLATFORM_TYPE increasingly important (shift from TV to streaming)
- MARKET/REGION enables regional revenue analysis
- Some broadcasters multi-platform

---

### DIM_SPONSOR
**Primary Purpose:** Sponsorship partner and tier information

**Row Count:** ~100 rows
**Granularity:** One row per unique sponsor

| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| SPONSOR_KEY | PK | Unique sponsor identifier | Primary key |
| SPONSOR_NAME | VARCHAR(255) | Company/brand name | Coca-Cola, Adidas, Qatar Airways, etc. |
| INDUSTRY | VARCHAR(100) | Industry sector | Beverages, Apparel, Airlines, Financial Services, etc. |
| TIER | VARCHAR(50) | Sponsorship level | Official Partner, FIFA Partner, Regional Supporter |

**Key Insights:**
- TIER drives CONTRACT_VALUE significantly
- INDUSTRY enables horizontal analysis (which sectors most active?)
- Useful for predicting renewal (RENEWAL_FLAG in FACT_SPONSORSHIP)

---

## Views

### VW_TOURNAMENT_SUMMARY
Pre-aggregated tournament-level KPIs

**Columns:** TOURNAMENT_KEY, YEAR_NUM, HOST_COUNTRY, WINNER, MATCHES_PLAYED, TOTAL_GOALS, TOTAL_ATTENDANCE, TOP_SCORER_NAME, TOP_SCORER_GOALS

**Use Cases:** Tournament overview dashboards, year-over-year comparison

---

### VW_TOP_SCORERS
Ranked goal-scoring leaders by tournament

**Columns:** TOURNAMENT_KEY, YEAR_NUM, PLAYER_NAME, TEAM_NAME, GOALS_SCORED, MATCHES_PLAYED, GOALS_PER_MATCH

**Use Cases:** Golden Boot tracking, player performance leaderboards

---

### VW_TEAM_RECORDS
Aggregated team statistics across tournaments

**Columns:** TEAM_NAME, TOURNAMENT_KEY, MATCHES_WON, MATCHES_LOST, MATCHES_DRAWN, GOALS_FOR, GOALS_AGAINST, GOAL_DIFFERENTIAL, WIN_PCT

**Use Cases:** Historical team performance, strength-of-schedule analysis

---

### VW_VENUE_STATS
Stadium utilization and attendance metrics

**Columns:** VENUE_KEY, STADIUM_NAME, CITY, COUNTRY, MATCHES_HOSTED, TOTAL_ATTENDANCE, AVG_ATTENDANCE, GOALS_SCORED_AT_VENUE

**Use Cases:** Stadium-specific analysis, attendance trends, home-field advantage

---

### VW_MATCH_DETAIL
Denormalized match-level view with team and stage information

**Columns:** MATCH_KEY, DATE_FULL, TOURNAMENT_YEAR, STAGE_NAME, HOME_TEAM_NAME, AWAY_TEAM_NAME, HOME_GOALS_FT, AWAY_GOALS_FT, MATCH_RESULT, ATTENDANCE, STADIUM_NAME

**Use Cases:** Match reporting, detailed result lookups, time-series match analysis

---

## Relationships and Join Paths

### Fact-to-Dimension Joins

**FACT_MATCH:**
- HOME_TEAM_KEY → DIM_TEAM.TEAM_KEY
- AWAY_TEAM_KEY → DIM_TEAM.TEAM_KEY
- VENUE_KEY → DIM_VENUE.VENUE_KEY
- STAGE_KEY → DIM_STAGE.STAGE_KEY
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY
- DATE_KEY → DIM_DATE.DATE_KEY
- REFEREE_KEY → DIM_REFEREE.REFEREE_KEY

**FACT_PLAYER_MATCH:**
- PLAYER_KEY → DIM_PLAYER.PLAYER_KEY
- MATCH_KEY → FACT_MATCH.MATCH_KEY
- TEAM_KEY → DIM_TEAM.TEAM_KEY
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY

**FACT_TICKET_SALES:**
- MATCH_KEY → FACT_MATCH.MATCH_KEY
- VENUE_KEY → DIM_VENUE.VENUE_KEY
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY
- DATE_KEY → DIM_DATE.DATE_KEY

**FACT_MERCHANDISE_SALES:**
- PRODUCT_KEY → DIM_MERCHANDISE_PRODUCT.PRODUCT_KEY
- CHANNEL_KEY → DIM_CHANNEL.CHANNEL_KEY
- TEAM_KEY → DIM_TEAM.TEAM_KEY (nullable; generic products have NULL)
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY
- DATE_KEY → DIM_DATE.DATE_KEY

**FACT_BROADCAST_RIGHTS:**
- BROADCASTER_KEY → DIM_BROADCASTER.BROADCASTER_KEY
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY

**FACT_SPONSORSHIP:**
- SPONSOR_KEY → DIM_SPONSOR.SPONSOR_KEY
- TOURNAMENT_KEY → DIM_TOURNAMENT.TOURNAMENT_KEY

### Common Multi-Fact Join Patterns

**Tournament-Level Revenue Analysis:**
```sql
SELECT 
    d.YEAR_NUM,
    SUM(t.REVENUE_USD) as TICKET_REVENUE,
    SUM(m.REVENUE_USD) as MERCH_REVENUE,
    SUM(b.AD_REVENUE_USD) as BROADCAST_AD_REVENUE,
    SUM(s.CONTRACT_VALUE_USD) as SPONSORSHIP_REVENUE
FROM DIM_TOURNAMENT d
LEFT JOIN FACT_TICKET_SALES t ON d.TOURNAMENT_KEY = t.TOURNAMENT_KEY
LEFT JOIN FACT_MERCHANDISE_SALES m ON d.TOURNAMENT_KEY = m.TOURNAMENT_KEY
LEFT JOIN FACT_BROADCAST_RIGHTS b ON d.TOURNAMENT_KEY = b.TOURNAMENT_KEY
LEFT JOIN FACT_SPONSORSHIP s ON d.TOURNAMENT_KEY = s.TOURNAMENT_KEY
GROUP BY d.YEAR_NUM
```

**Team Performance + Merchandise Sales:**
```sql
SELECT 
    tm.TEAM_NAME,
    COUNT(DISTINCT fm.MATCH_KEY) as MATCHES_PLAYED,
    SUM(CASE WHEN fm.MATCH_RESULT = 'H' THEN 1 ELSE 0 END) as WINS,
    SUM(m.REVENUE_USD) as TEAM_MERCH_REVENUE
FROM DIM_TEAM tm
LEFT JOIN FACT_MATCH fm ON tm.TEAM_KEY = fm.HOME_TEAM_KEY
LEFT JOIN FACT_MERCHANDISE_SALES m ON tm.TEAM_KEY = m.TEAM_KEY
GROUP BY tm.TEAM_NAME
```

---

## Data Quality Notes

### Known Limitations and Caveats

#### 1. **Fact Data Source Differences**
| Fact Table | Source | Quality | Notes |
|------------|--------|---------|-------|
| FACT_MATCH | Kaggle (Real) | High | Comprehensive historical records; some pre-1970s attendance estimated |
| FACT_PLAYER_MATCH | Kaggle (Real) | High | ~37K rows; missing some data for 1930s-1950s players |
| FACT_TICKET_SALES | Synthetic | Medium | Simulated based on venue capacity and demand patterns; not actual sales |
| FACT_MERCHANDISE_SALES | Synthetic | Medium | ~500K rows generated; realistic product mix but not historical actuals |
| FACT_BROADCAST_RIGHTS | Synthetic | Medium | Deal structures plausible but values estimated; real broadcasters used |
| FACT_SPONSORSHIP | Synthetic | Medium | Tier structures match reality; values estimated; based on known sponsors |

#### 2. **Dimension Data Issues**

**DIM_VENUE:**
- **CAPACITY:** Almost entirely NULL; historical stadium capacities not reliably available
- **SURFACE_TYPE:** May be NULL for older stadiums
- **LATITUDE/LONGITUDE:** Derived from city centroid for some historic venues (not exact stadium location)

**DIM_PLAYER:**
- **BIRTH_YEAR:** NULL for ~400 players from pre-1966 tournaments (data unavailable in source)
- **POSITION:** Simplified to 4 categories (GK, Def, Mid, Fwd); historical position data sparse
- **NATIONALITY:** May differ from playing team in rare cases (naturalizations, eligibility disputes)

**DIM_DATE:**
- **FISCAL_YEAR:** Defined as July-June cycle (FIFA administrative standard); not calendar year
- Continuous calendar coverage but facts may reference sparse subset

**DIM_TOURNAMENT:**
- **TOTAL_ATTENDANCE:** Estimated for pre-1974 tournaments
- **QUALIFIED_TEAMS:** Historically capped at 16 or 24; expanded to 32 (1998) and 48 (2026)

#### 3. **Fact Table Specifics**

**FACT_MATCH:**
- ATTENDANCE NULL for most matches pre-1974 (estimation methodology unknown)
- WIN_CONDITIONS inconsistently coded across eras (e.g., "Retired" matches rare in modern era)
- Some matches replayed (WW2 era); unclear if duplicate rows or consolidated

**FACT_PLAYER_MATCH:**
- SUB_IN_MINUTE and SUB_OUT_MINUTE may be NULL even for substitutes (historical data incomplete)
- YELLOW_CARDS and RED_CARDS < 1970 may be incomplete (card systems not universal)
- Unused bench players (LINEUP_STATUS='U') sparse for early tournaments

**FACT_MERCHANDISE_SALES:**
- COGS_USD synthetic; assume gross margin ~30-50% across categories
- PROMO_FLAG and DISCOUNT_PCT driven by tournament phase (e.g., 30% discount post-final)
- TEAM_KEY NULL for generic branded products (e.g., "Official World Cup 2022 Jersey")

**FACT_TICKET_SALES:**
- RESALE_PCT synthetic; market-dependent (higher for finals, lower for group stages)
- DEMAND_INDEX scales 0-10+ without fixed ceiling (values may exceed 10)
- DATE_KEY may predate or postdate MATCH_KEY (advance/post-match sales)

**FACT_BROADCAST_RIGHTS:**
- PEAK_VIEWERS_MILLIONS typically final match; compare to AVG_VIEWERS_MILLIONS for quality metric
- TOTAL_BROADCAST_HOURS includes pre/post-match analysis; not just match time
- MATCHES_BROADCAST may be < total matches (some markets buy partial packages)

**FACT_SPONSORSHIP:**
- MEDIA_VALUE_USD estimated using third-party metrics; not actual earned media
- BRAND_EXPOSURE_HOURS in minutes; convert to hours by dividing 60
- ACTIVATION_SPEND_USD varies 20-200% of CONTRACT_VALUE_USD depending on sponsor sophistication

#### 4. **Currency and Scale**

- **All monetary values:** USD
- **Synthetic tables:** MERCHANDISE_SALES rows ~500K; others sparse
- **Aggregation risk:** Merchandise table highest cardinality; use GROUP BY or summary tables for large queries
- **Null handling:** LEFT JOIN when combining fact tables to avoid data loss

#### 5. **Recommended Data Validation Queries**

```sql
-- Check for orphaned foreign keys
SELECT COUNT(*) FROM FACT_MATCH WHERE TOURNAMENT_KEY NOT IN (SELECT TOURNAMENT_KEY FROM DIM_TOURNAMENT);

-- Verify match result vs. goal counts
SELECT COUNT(*) FROM FACT_MATCH 
WHERE (MATCH_RESULT = 'H' AND HOME_GOALS_FT <= AWAY_GOALS_FT)
   OR (MATCH_RESULT = 'A' AND AWAY_GOALS_FT <= HOME_GOALS_FT)
   OR (MATCH_RESULT = 'D' AND HOME_GOALS_FT <> AWAY_GOALS_FT);

-- Check for future-dated merchandise sales
SELECT COUNT(*) FROM FACT_MERCHANDISE_SALES 
WHERE DATE_KEY > (SELECT MAX(DATE_KEY) FROM FACT_MATCH);

-- Validate player substitution logic
SELECT COUNT(*) FROM FACT_PLAYER_MATCH 
WHERE LINEUP_STATUS = 'S' AND (SUB_IN_MINUTE IS NOT NULL OR SUB_OUT_MINUTE IS NOT NULL);
```

---

## Access and Connection Info

**IDA Connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

**Schema Access:** No schema prefix required (direct table names: `FACT_MATCH`, not `public.FACT_MATCH`)

**Query Limits:** Fact tables large; always use GROUP BY for aggregate analytics on merchandise and match-level detail

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| Created | 2026-04-14 |
| Last Updated | 2026-04-14 |
| Maintained By | Analytics Team |
| Schema Version | 1.0 |

