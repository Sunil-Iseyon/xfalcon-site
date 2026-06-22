# Falcon World Cup 360 Analytics — Dashboard Feasibility Matrix

**Generated:** 2026-04-14
**Data Source:** FIFA World Cup Warehouse (1930–2014)
**IDA Connector:** mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb

## Summary

| # | Dashboard | Score | Status | Primary Tables | Build Effort |
|---|-----------|-------|--------|---------------|-------------|
| 1 | Tournament Overview | 95% | READY | DIM_TOURNAMENT, FACT_MATCH, all facts | 1 day |
| 2 | Match Analytics | 95% | READY | FACT_MATCH, DIM_STAGE, DIM_VENUE, DIM_TEAM | 1 day |
| 3 | Player Performance | 90% | READY | FACT_PLAYER_MATCH, DIM_PLAYER, DIM_TEAM | 1 day |
| 4 | Team Rankings | 92% | READY | FACT_MATCH, FACT_PLAYER_MATCH, DIM_TEAM | 1 day |
| 5 | Ticket Revenue | 95% | READY | FACT_TICKET_SALES, DIM_VENUE, DIM_TOURNAMENT | 1 day |
| 6 | Merchandise Sales | 95% | READY | FACT_MERCHANDISE_SALES, DIM_MERCHANDISE_PRODUCT, DIM_CHANNEL, DIM_TEAM | 1 day |
| 7 | Broadcast & Media | 90% | READY | FACT_BROADCAST_RIGHTS, DIM_BROADCASTER, DIM_TOURNAMENT | 1 day |
| 8 | Sponsorship ROI | 90% | READY | FACT_SPONSORSHIP, DIM_SPONSOR, DIM_TOURNAMENT | 1 day |
| 9 | Venue & Attendance | 92% | READY | FACT_MATCH, FACT_TICKET_SALES, DIM_VENUE | 1 day |
| 10 | Historical Trends | 95% | READY | DIM_TOURNAMENT, all facts aggregated by year | 1 day |

**Overall Readiness: 93% — All dashboards are READY to build.**

---

## Detailed Assessment

### 1. Tournament Overview (Portal)
- **Score:** 95% READY
- **Sources:** DIM_TOURNAMENT, aggregate queries across all fact tables
- **What works:** All 20 tournaments with goals, attendance, teams, winners. Revenue summaries from tickets, merch, broadcast, sponsorship.
- **Limitations:** Data ends at 2014 — no 2018, 2022, or 2026 data.
- **Sample query:** `SELECT YEAR_NUM, HOST_COUNTRY, WINNER, TOTAL_GOALS, TOTAL_ATTENDANCE FROM DIM_TOURNAMENT ORDER BY YEAR_NUM`

### 2. Match Analytics
- **Score:** 95% READY
- **Sources:** FACT_MATCH, DIM_STAGE, DIM_VENUE, DIM_TEAM, DIM_DATE
- **What works:** 826 matches with goals (FT + HT), results (H/A/D), attendance, win conditions (Normal/AET/Penalties), referee data. Full stage progression from Group to Final.
- **Limitations:** No possession, shots, or xG data (pre-analytics era).
- **Sample query:** `SELECT s.STAGE_NAME, COUNT(*) AS matches, SUM(m.TOTAL_GOALS) AS goals, ROUND(AVG(m.TOTAL_GOALS),2) AS avg_goals FROM FACT_MATCH m JOIN DIM_STAGE s ON m.STAGE_KEY = s.STAGE_KEY GROUP BY s.STAGE_NAME ORDER BY MIN(s.STAGE_ORDER)`

### 3. Player Performance
- **Score:** 90% READY
- **Sources:** FACT_PLAYER_MATCH, DIM_PLAYER, DIM_TEAM, DIM_TOURNAMENT
- **What works:** 37,330 player-match records with goals, own goals, penalties, cards, minutes played, lineup status, substitution data.
- **Limitations:** No assists data. Position data available but may have gaps for older players. Birth year NULL for many historical players.
- **Sample query:** `SELECT p.PLAYER_NAME, t.TEAM_NAME, SUM(pm.GOALS_SCORED) AS total_goals FROM FACT_PLAYER_MATCH pm JOIN DIM_PLAYER p ON pm.PLAYER_KEY = p.PLAYER_KEY JOIN DIM_TEAM t ON pm.TEAM_KEY = t.TEAM_KEY GROUP BY p.PLAYER_NAME, t.TEAM_NAME ORDER BY total_goals DESC LIMIT 20`

### 4. Team Rankings
- **Score:** 92% READY
- **Sources:** FACT_MATCH, FACT_PLAYER_MATCH, DIM_TEAM, DIM_TOURNAMENT
- **What works:** Win/draw/loss records, goals scored/conceded, tournament appearances, titles, confederation analysis.
- **Limitations:** No FIFA ranking points (not in dataset). Rankings will be computed from match results.
- **Sample query:** `SELECT t.TEAM_NAME, t.CONFEDERATION, COUNT(DISTINCT m.TOURNAMENT_KEY) AS tournaments FROM FACT_MATCH m JOIN DIM_TEAM t ON m.HOME_TEAM_KEY = t.TEAM_KEY OR m.AWAY_TEAM_KEY = t.TEAM_KEY GROUP BY t.TEAM_NAME, t.CONFEDERATION ORDER BY tournaments DESC LIMIT 20`

### 5. Ticket Revenue
- **Score:** 95% READY
- **Sources:** FACT_TICKET_SALES, DIM_VENUE, DIM_TOURNAMENT, DIM_DATE
- **What works:** 5,052 rows with 6 price tiers, tickets sold, price per ticket, total revenue, resale %, demand index. Full venue and tournament linkage.
- **Limitations:** Synthetic data (but well-calibrated to historical patterns).
- **Sample query:** `SELECT PRICE_TIER, SUM(TICKETS_SOLD) AS tickets, SUM(REVENUE_USD) AS revenue, ROUND(AVG(TICKET_PRICE_USD),2) AS avg_price FROM FACT_TICKET_SALES GROUP BY PRICE_TIER ORDER BY revenue DESC`

### 6. Merchandise Sales
- **Score:** 95% READY
- **Sources:** FACT_MERCHANDISE_SALES, DIM_MERCHANDISE_PRODUCT, DIM_CHANNEL, DIM_TEAM, DIM_TOURNAMENT
- **What works:** 500K transactions with units, price, revenue, COGS, gross margin, promo flag, discount %. 340 SKUs across 4 categories (Apparel, Accessories, Collectibles, Equipment). 8 sales channels.
- **Limitations:** Synthetic data. No customer-level data.
- **Sample query:** `SELECT p.CATEGORY, SUM(ms.REVENUE_USD) AS revenue, SUM(ms.GROSS_MARGIN_USD) AS margin, ROUND(SUM(ms.GROSS_MARGIN_USD)*100.0/NULLIF(SUM(ms.REVENUE_USD),0),1) AS margin_pct FROM FACT_MERCHANDISE_SALES ms JOIN DIM_MERCHANDISE_PRODUCT p ON ms.PRODUCT_KEY = p.PRODUCT_KEY GROUP BY p.CATEGORY ORDER BY revenue DESC`

### 7. Broadcast & Media
- **Score:** 90% READY
- **Sources:** FACT_BROADCAST_RIGHTS, DIM_BROADCASTER, DIM_TOURNAMENT
- **What works:** 192 broadcast deals with rights fees, sub-licensing revenue, ad revenue, peak/avg viewers, broadcast hours, matches broadcast, platform type.
- **Limitations:** Synthetic data. No digital streaming metrics for older tournaments (expected).
- **Sample query:** `SELECT b.BROADCASTER_NAME, b.MARKET, SUM(br.RIGHTS_FEE_USD) AS total_rights FROM FACT_BROADCAST_RIGHTS br JOIN DIM_BROADCASTER b ON br.BROADCASTER_KEY = b.BROADCASTER_KEY GROUP BY b.BROADCASTER_NAME, b.MARKET ORDER BY total_rights DESC`

### 8. Sponsorship ROI
- **Score:** 90% READY
- **Sources:** FACT_SPONSORSHIP, DIM_SPONSOR, DIM_TOURNAMENT
- **What works:** 229 sponsorship deals with contract value, activation spend, media value, brand exposure hours, estimated reach, renewal flags, deal types (Exclusive/Non-exclusive/Regional).
- **Limitations:** ROI calculation is derived (media_value / contract_value). No direct sales attribution.
- **Sample query:** `SELECT s.SPONSOR_NAME, s.TIER, SUM(sp.CONTRACT_VALUE_USD) AS total_contract, SUM(sp.MEDIA_VALUE_USD) AS total_media_value, ROUND(SUM(sp.MEDIA_VALUE_USD)/NULLIF(SUM(sp.CONTRACT_VALUE_USD),0),1) AS roi_multiple FROM FACT_SPONSORSHIP sp JOIN DIM_SPONSOR s ON sp.SPONSOR_KEY = s.SPONSOR_KEY GROUP BY s.SPONSOR_NAME, s.TIER ORDER BY total_contract DESC`

### 9. Venue & Attendance
- **Score:** 92% READY
- **Sources:** FACT_MATCH, FACT_TICKET_SALES, DIM_VENUE
- **What works:** 183 venues with stadium name, city, country, continent, capacity, lat/long, surface type. Match attendance for all 826 matches. Utilization = attendance/capacity.
- **Limitations:** Some historical venues missing capacity and lat/long. 
- **Sample query:** `SELECT v.STADIUM_NAME, v.CITY, v.COUNTRY, v.CAPACITY, COUNT(*) AS matches, SUM(m.ATTENDANCE) AS total_attendance FROM FACT_MATCH m JOIN DIM_VENUE v ON m.VENUE_KEY = v.VENUE_KEY GROUP BY v.STADIUM_NAME, v.CITY, v.COUNTRY, v.CAPACITY ORDER BY total_attendance DESC LIMIT 20`

### 10. Historical Trends
- **Score:** 95% READY
- **Sources:** DIM_TOURNAMENT, aggregate queries across all fact tables by YEAR_NUM
- **What works:** 84-year timeline (1930–2014) for attendance growth, goal-scoring trends, team expansion, revenue evolution (tickets, merch, broadcast, sponsorship). All metrics available per tournament year.
- **Limitations:** Revenue data is synthetic for earlier tournaments.
- **Sample query:** `SELECT t.YEAR_NUM, t.TOTAL_GOALS, t.TOTAL_ATTENDANCE, t.QUALIFIED_TEAMS, t.MATCHES_PLAYED FROM DIM_TOURNAMENT t ORDER BY t.YEAR_NUM`
