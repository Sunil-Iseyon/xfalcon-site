# Falcon World Cup 360 Analytics — Metric Definitions

**Generated:** 2026-04-14
**Currency:** USD ($)

This is the authoritative reference for all KPI calculations. Every query in QUERY_TEMPLATES.sql must match these formulas.

---

## Tournament & Match Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Total Matches | `COUNT(*) FROM FACT_MATCH` | count | higher = more | 1, 2, 10 |
| Total Goals | `SUM(TOTAL_GOALS) FROM FACT_MATCH` | count | — | 1, 2, 10 |
| Goals per Match | `SUM(TOTAL_GOALS) / COUNT(*)` from FACT_MATCH | ratio (2 dec) | — | 2, 10 |
| Average Attendance | `AVG(ATTENDANCE)` from FACT_MATCH | count | higher = better | 1, 2, 9, 10 |
| Total Attendance | `SUM(ATTENDANCE)` from FACT_MATCH | count | higher = better | 1, 9, 10 |
| Home Win % | `COUNT(*) WHERE MATCH_RESULT='H' / COUNT(*)` | % | — | 2, 4 |
| Away Win % | `COUNT(*) WHERE MATCH_RESULT='A' / COUNT(*)` | % | — | 2, 4 |
| Draw % | `COUNT(*) WHERE MATCH_RESULT='D' / COUNT(*)` | % | — | 2 |
| Extra Time % | Matches with WIN_CONDITIONS containing 'AET' or 'penalties' / total | % | — | 2 |
| Venue Utilization % | `ATTENDANCE / DIM_VENUE.CAPACITY * 100` (where CAPACITY IS NOT NULL) | % | higher = better | 9 |

## Player Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Goals Scored | `SUM(GOALS_SCORED)` from FACT_PLAYER_MATCH | count | higher = better | 3 |
| Goals per Match | `SUM(GOALS_SCORED) / COUNT(DISTINCT MATCH_ID)` | ratio | higher = better | 3 |
| Yellow Cards | `SUM(YELLOW_CARDS)` from FACT_PLAYER_MATCH | count | lower = better | 3 |
| Red Cards | `SUM(RED_CARDS)` from FACT_PLAYER_MATCH | count | lower = better | 3 |
| Minutes Played | `SUM(MINUTES_PLAYED)` from FACT_PLAYER_MATCH | minutes | — | 3 |
| Appearances | `COUNT(DISTINCT MATCH_ID)` from FACT_PLAYER_MATCH | count | — | 3 |
| Starting XI Rate | `COUNT(*) WHERE LINEUP_STATUS='S' / COUNT(*)` | % | — | 3 |
| Own Goals | `SUM(OWN_GOALS)` from FACT_PLAYER_MATCH | count | lower = better | 3 |
| Penalties Scored | `SUM(PENALTIES_SCORED)` from FACT_PLAYER_MATCH | count | — | 3 |

## Team Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Matches Played | Count of FACT_MATCH where TEAM_KEY in (HOME_TEAM_KEY, AWAY_TEAM_KEY) | count | — | 4 |
| Wins | Count where team's goals > opponent's goals (FT) | count | higher = better | 4 |
| Losses | Count where team's goals < opponent's goals (FT) | count | lower = better | 4 |
| Draws | Count where MATCH_RESULT = 'D' and team participated | count | — | 4 |
| Win Rate | Wins / Matches Played * 100 | % | higher = better | 4 |
| Goals Scored | SUM of team's goals across all matches | count | higher = better | 4 |
| Goals Conceded | SUM of opponent's goals across all matches | count | lower = better | 4 |
| Goal Difference | Goals Scored - Goals Conceded | count | higher = better | 4 |
| Tournament Appearances | `COUNT(DISTINCT TOURNAMENT_KEY)` | count | — | 4 |
| Titles Won | Count from DIM_TOURNAMENT WHERE WINNER = TEAM_NAME | count | higher = better | 4 |

## Ticket Revenue Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Total Ticket Revenue | `SUM(REVENUE_USD)` from FACT_TICKET_SALES | $ | higher = better | 5, 1, 10 |
| Tickets Sold | `SUM(TICKETS_SOLD)` from FACT_TICKET_SALES | count | higher = better | 5 |
| Avg Ticket Price | `SUM(REVENUE_USD) / SUM(TICKETS_SOLD)` | $ | — | 5 |
| Revenue by Tier | `SUM(REVENUE_USD) GROUP BY PRICE_TIER` | $ | — | 5 |
| Avg Demand Index | `AVG(DEMAND_INDEX)` from FACT_TICKET_SALES | ratio | higher = hotter | 5 |
| Resale Rate | `AVG(RESALE_PCT)` from FACT_TICKET_SALES | % | — | 5 |

## Merchandise Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Merchandise Revenue | `SUM(REVENUE_USD)` from FACT_MERCHANDISE_SALES | $ | higher = better | 6, 1, 10 |
| Units Sold | `SUM(UNITS_SOLD)` from FACT_MERCHANDISE_SALES | count | higher = better | 6 |
| Gross Margin $ | `SUM(GROSS_MARGIN_USD)` | $ | higher = better | 6 |
| Gross Margin % | `SUM(GROSS_MARGIN_USD) / SUM(REVENUE_USD) * 100` | % | higher = better | 6 |
| Avg Unit Price | `SUM(REVENUE_USD) / SUM(UNITS_SOLD)` | $ | — | 6 |
| Promo Sales % | `COUNT(*) WHERE PROMO_FLAG=TRUE / COUNT(*)` | % | — | 6 |
| Avg Discount % | `AVG(DISCOUNT_PCT) WHERE PROMO_FLAG=TRUE` | % | lower = better | 6 |
| COGS | `SUM(COGS_USD)` | $ | lower = better | 6 |

## Broadcast Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Total Rights Fees | `SUM(RIGHTS_FEE_USD)` from FACT_BROADCAST_RIGHTS | $ | higher = better | 7, 1, 10 |
| Total Ad Revenue | `SUM(AD_REVENUE_USD)` | $ | higher = better | 7 |
| Sub-Licensing Revenue | `SUM(SUB_LICENSING_REVENUE_USD)` | $ | higher = better | 7 |
| Peak Viewers | `MAX(PEAK_VIEWERS_MILLIONS)` | millions | higher = better | 7 |
| Avg Viewers | `AVG(AVG_VIEWERS_MILLIONS)` | millions | higher = better | 7 |
| Total Broadcast Hours | `SUM(TOTAL_BROADCAST_HOURS)` | hours | — | 7 |
| Matches Broadcast | `SUM(MATCHES_BROADCAST)` | count | — | 7 |

## Sponsorship Metrics

| Metric | Formula | Unit | Direction | Dashboards |
|--------|---------|------|-----------|------------|
| Total Contract Value | `SUM(CONTRACT_VALUE_USD)` from FACT_SPONSORSHIP | $ | higher = better | 8, 1, 10 |
| Activation Spend | `SUM(ACTIVATION_SPEND_USD)` | $ | — | 8 |
| Media Value | `SUM(MEDIA_VALUE_USD)` | $ | higher = better | 8 |
| Sponsorship ROI | `SUM(MEDIA_VALUE_USD) / SUM(CONTRACT_VALUE_USD)` | ratio | higher = better | 8 |
| Brand Exposure Hours | `SUM(BRAND_EXPOSURE_HOURS)` | hours | higher = better | 8 |
| Estimated Reach | `SUM(ESTIMATED_REACH_MILLIONS)` | millions | higher = better | 8 |
| Renewal Rate | `COUNT(*) WHERE RENEWAL_FLAG=TRUE / COUNT(*)` | % | higher = better | 8 |
