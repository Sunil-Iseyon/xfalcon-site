# Falcon World Cup 360 Analytics — Global Filters & Exclusions

**Generated:** 2026-04-14

## Hardcoded Exclusions

**None.** All 20 tournaments (1930–2014) are included. No records excluded.

## Interactive Filter Dimensions

### Global Filters (appear on every dashboard)
| Filter | Source | Options |
|--------|--------|---------|
| Tournament Year | DIM_TOURNAMENT.YEAR_NUM | All, 1930, 1934, ..., 2014 |

### Dashboard-Specific Filters
| Dashboard | Filter | Source |
|-----------|--------|--------|
| Match Analytics | Stage | DIM_STAGE.STAGE_NAME |
| Player Performance | Position | DIM_PLAYER.POSITION |
| Team Rankings | Confederation | DIM_TEAM.CONFEDERATION |
| Ticket Revenue | Price Tier | FACT_TICKET_SALES.PRICE_TIER |
| Merchandise Sales | Category | DIM_MERCHANDISE_PRODUCT.CATEGORY |
| Merchandise Sales | Channel | DIM_CHANNEL.CHANNEL_NAME |
| Broadcast & Media | Platform | DIM_BROADCASTER.PLATFORM_TYPE |
| Sponsorship ROI | Tier | DIM_SPONSOR.TIER |
| Venue & Attendance | Continent | DIM_VENUE.CONTINENT |

## Conditional Calculation Rules

- When filtering to a single tournament year, YoY comparisons use the previous tournament (not previous calendar year — tournaments are every 4 years).
- Merchandise margin calculations must use GROSS_MARGIN_USD directly (pre-computed), not REVENUE_USD - COGS_USD (to avoid floating-point discrepancies).
- Sponsorship ROI = MEDIA_VALUE_USD / CONTRACT_VALUE_USD (not including ACTIVATION_SPEND_USD in the denominator).
- Attendance utilization % = ATTENDANCE / CAPACITY — but only where DIM_VENUE.CAPACITY IS NOT NULL.

## Data Quality Notes

- FACT_MATCH data is REAL (sourced from Kaggle WorldCupMatches dataset).
- FACT_PLAYER_MATCH data is REAL (sourced from Kaggle WorldCupPlayers dataset).
- FACT_TICKET_SALES, FACT_MERCHANDISE_SALES, FACT_BROADCAST_RIGHTS, and FACT_SPONSORSHIP are SYNTHETIC (calibrated to historical patterns).
- DIM_PLAYER.BIRTH_YEAR is NULL for most pre-1966 players.
- DIM_VENUE.CAPACITY, LATITUDE, LONGITUDE are NULL for some historical venues.
- Currency: All financial values are in USD.
- Fiscal year uses July–June cycle (DIM_DATE.FISCAL_YEAR).
