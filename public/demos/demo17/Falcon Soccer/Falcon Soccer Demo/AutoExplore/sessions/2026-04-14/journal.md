# AutoExplore Journal — FIFA World Cup Database
**Date:** 2026-04-14  
**Mode:** Open Exploration  
**Iterations:** 30 | **Query Budget:** ~200 | **Fact-Check Cycles:** 3  
**Data Sources:** IDA database (1930-2014) + web data (2018, 2022)

---

## Orient Phase

**Tables discovered:** 22 (6 fact, 10 dimension, 5+ views)  
**Real data:** FACT_MATCH (826 rows), FACT_PLAYER_MATCH (37,330 rows), DIM_PLAYER (7,759), DIM_TEAM (83), DIM_TOURNAMENT (20)  
**Synthetic data:** FACT_TICKET_SALES (5,052), FACT_MERCHANDISE_SALES (500,000), FACT_BROADCAST_RIGHTS (192), FACT_SPONSORSHIP (229)

**Data quality note:** DIM_PLAYER.POSITION only contains MID (7,283) and GK (476). All outfield players classified as MID. This limits positional analysis.

**Memories checked:** 1 found (irrelevant, from a different project).  
**Annotations checked:** None found.

---

## Iteration 1: Tournament Evolution
**Hypothesis:** How have goals/match, attendance, and team count evolved over 20 editions (1930-2014)?

**Query:** SELECT from DIM_TOURNAMENT — goals, matches, attendance by year.

**Results:**
- Goals/match peaked at 5.38 in 1954, declined to modern-era floor of 2.21 in 1990
- Recent stabilization: 2014 (2.67), 2018 (2.64 web), 2022 (2.69 web)
- Attendance grew from 591K (1930) to 3.39M (2014)
- 1994 USA had highest total attendance (3.59M) in the DB despite fewer matches than later 32-team editions

**Assessment:** Expected overall trend. The 1994 attendance anomaly is mildly interesting. Not surprising enough to save.

---

## Iteration 2: Host Nation Advantage
**Hypothesis:** Do host nations win the World Cup more often than chance would predict?

**Query:** DIM_TOURNAMENT join for host vs winner.

**Results:**
- 5 of 20 hosts won (25%): Uruguay 1930, Italy 1934, England 1966, Argentina 1978, France 1998
- Last host win: France 1998 — a 24+ year drought
- Web data: Russia 2018 (QF exit), Qatar 2022 (group exit). So 5/22 = 22.7%.

**Assessment:** The drought since 1998 is notable. Not deeply surprising — saved as journal note.

---

## Iteration 3: Home/Away Designation Effect
**Hypothesis:** Does being designated "Home" vs "Away" in the match record correlate with winning?

**Query:** FACT_MATCH grouped by MATCH_RESULT.

**Results:**
- Home Win: 481 matches (57.5%)
- Draw: 186 matches (22.2%)
- Away Win: 169 matches (20.2%)

**Assessment:** SURPRISING. A 37-point advantage from designation alone. This likely reflects seeding structure — higher-seeded teams get "home" designation. **Finding candidate.**

---

## Iteration 4: Confederation Dominance by Era
**Hypothesis:** How have confederation power dynamics shifted across eras?

**Query:** FACT_MATCH x DIM_TEAM x DIM_TOURNAMENT, grouped by confederation and era.

**Results (win rates):**
- UEFA: 62% (1930-62) → 61% (66-82) → 54% (86-02) → 58% (06-14)
- CONMEBOL: 59% (1930-62) → 45% (66-82) → 47% (86-02) → 58% (06-14)
- CAF: 0% → 20% → 22% → 16%
- AFC: 0% → 0% → 18% → 16%

**Assessment:** CONMEBOL's U-shaped curve is interesting — collapsed in the middle era then recovered. CAF peaked in 1986-2002 (Cameroon 1990, Senegal 2002) then declined. Noted but not top-tier surprising.

---

## Iteration 5: Goal Patterns by Stage
**Hypothesis:** Do later-stage matches produce more or fewer goals? Where are goals scored (first vs second half)?

**Query:** FACT_MATCH x DIM_STAGE — avg goals, second-half goal percentage by stage.

**Results:**
- Group Stage: 2.72 goals/match, 57.1% in second half
- Round of 16: 2.56 goals/match, 70.7% in second half
- Quarter-finals: 2.82 goals/match, 62.3% in second half
- Semi-finals: 3.62 goals/match, 68.3% in second half
- Final: 3.58 goals/match, 64.7% in second half
- Third-place match: 3.94 goals/match, 50.7% in second half

**Assessment:** VERY SURPRISING. Semi-finals outscore group stages by 33%! Third-place matches are the highest-scoring stage. The second-half goal spike in R16 (71% vs 57% in groups) is dramatic. **Top finding.**

---

## Iteration 6: Win Conditions Distribution
**Hypothesis:** How often do matches go to extra time or penalties?

**Results:** Normal: 93.5%, AET: 3.3%, Penalties: 3.1%

**Assessment:** Expected. Moved on.

---

## Iteration 7: Goalless HT → Second Half Explosion
**Hypothesis:** If a match is 0-0 at halftime, does the second half become more explosive? Especially in knockout?

**Query:** FACT_MATCH x DIM_STAGE — split by halftime score and stage type.

**Results:**
- Goalless HT + Knockout: 89% produce second-half goals, avg 2.32 goals in 2nd half
- Goalless HT + Group: 70% produce second-half goals, avg 1.25 goals in 2nd half
- Scored HT + Knockout: 79% produce second-half goals, avg 1.89 goals
- Scored HT + Group: 82% produce second-half goals, avg 1.69 goals

**Assessment:** VERY SURPRISING. Knockout 0-0 → second half becomes a near-certain goalfest (89%). The differential vs group matches is 19 percentage points. **Top finding.**

---

## Iteration 8: All-Time Team Win Rates
**Hypothesis:** Which teams have the highest all-time World Cup win rates?

**Results (15+ matches):**
1. Germany: 68.2% (post-reunification only)
2. Brazil: 67.3% (104 matches, 20 tournaments)
3. Germany FR: 58.1%
4. Argentina: 54.5%
5. Italy: 54.2%
- England: only 41.9% — surprisingly low

**Assessment:** Expected hierarchy. England's mediocrity across 14 tournaments is mildly interesting.

---

## Iteration 9: Biggest Knockout Upsets
**Hypothesis:** What are the largest margin victories in knockout stages?

**Results:**
1. Brazil 1-7 Germany (2014 Semi)
2. Denmark 1-5 Spain (1986 R16)
3. Argentina 0-4 Germany (2010 QF)
4. Nigeria 1-4 Denmark (1998 R16)
5-8: Three more with 3-goal margins

**Assessment:** SURPRISING pattern: Brazil appears 4 times as the victim in the 8 biggest knockout blowouts. The team with the best all-time win rate also suffers the most spectacular collapses. **Brazil's Paradox — top finding.**

---

## Iteration 10: Player Position Data Quality
**Hypothesis:** Can we analyze goal-scoring by position?

**Results:** Only 2 positions exist: MID (7,283 players) and GK (476). All outfield players = MID.

**Assessment:** Data quality issue. Limits positional analysis. Saved as caveat.

---

## Iteration 11: Referee Card Patterns by Nationality
**Hypothesis:** Do referees from certain countries issue more cards?

**Results (10+ matches officiated):**
- Strictest: Colombia (4.59 yellows/match, 0.65 reds/match)
- Lenient: USSR/Soviet (0.55 yellows) — but pre-card era data
- Modern range: 1.6 (Belgium) to 4.6 (Colombia) — 3x variation
- USA referees: ZERO red cards issued

**Assessment:** The 3x variation in card rates is notable. Saved as journal note.

---

## Iteration 12: Player Career Longevity
**Hypothesis:** Who had the longest World Cup careers?

**Results:**
- Antonio Carbajal (Mexico): 5 WCs (1950-1966) — most appearances
- Klose: 4 WCs, 28 matches, 16 goals — all-time top scorer
- Pelé: 4 WCs, 21 matches, 12 goals, ZERO cards
- Data anomaly: "DIDA" shows 48-year span (1958-2006) — multiple players with same name

**Assessment:** Pelé's zero-card record across 21 matches is remarkable. Data name collisions noted.

---

## Iteration 13: Venue/Continent Effects
**Hypothesis:** Do goal rates differ by continent where matches are played?

**Results:**
- Europe: 2.98 goals/match (100 venues, 398 matches)
- South America: 2.99 goals/match (31 venues, 174 matches)
- North America: 2.71 goals/match (22 venues, 136 matches) — highest attendance (55,820)
- Africa: 2.27 goals/match (10 venues, 64 matches)
- Asia: 2.52 goals/match (20 venues, 64 matches)

**Assessment:** Africa's low goal rate is essentially just South Africa 2010 (notoriously defensive tournament). North America's high attendance likely driven by USA 1994 + Mexico editions. Not deeply surprising.

---

## Iteration 14: Substitution Impact Revolution
**Hypothesis:** How has the impact of substitutes evolved since they were introduced (1970)?

**Results:**
- Pre-1970: 0% sub goals (no subs allowed)
- 1970: 4.9% of goals by subs
- 1990: 19.6% — the "super sub" tournament
- 2014: 20.1% — one in five goals from subs

**Assessment:** SURPRISING. A complete transformation of the game. From zero to 20% in 44 years. **Top finding.**

---

## Iteration 15: Card Inflation
**Hypothesis:** Are referees issuing more cards over time?

**Results:**
- Pre-cards (pre-1970): 0.12 yellows/match
- Early cards (70-90): 2.28 yellows/match
- Modern (94-02): 4.16 yellows/match
- Recent (06-14): 4.13 yellows/match
- Red cards: 0.12 → 0.14 → 0.29 → 0.28

**Assessment:** SURPRISING. Yellows doubled between early and modern eras, then plateaued at ~4.1. Red cards doubled too. The game became much more heavily policed. **Finding candidate.**

---

## Iteration 16: Sponsorship ROI Stability
**Hypothesis:** Has sponsor ROI (media value / contract value) changed as costs skyrocketed?

**Results:**
- ROI range: 2.0x (1954) to 3.4x (Qatar Airways) — remarkably narrow
- Adidas: $1.67B invested, 3.01x ROI, all 20 tournaments
- Coca-Cola: 16/20 renewals — most loyal sponsor
- Yingli Solar: highest ROI at 3.56x

**Assessment:** The stability of 2.3-3.1x ROI across 84 years and a 473x cost increase is notable. Suggests the market consistently prices sponsorship correctly. Saved as journal note.

---

## Iteration 17: Broadcast Revenue Per Viewer
**Hypothesis:** How has broadcast monetization efficiency evolved?

**Results:**
- Ad revenue per million avg viewers: $1,050 (1930) → $3.9M (2014)
- Rights fees grew 88,000x from $6K (1930) to $545M (2014)
- 2002 had LOWER rights fees than 1998 but HIGHER viewership (timezone effect?)

**Assessment:** The monetization efficiency gain of ~3,700x is staggering. The 2002 dip is likely due to Korea/Japan timezone challenges for Western markets. Saved as journal note.

---

## Iteration 18: Ticket Pricing by Stage
**Hypothesis:** How do ticket prices and demand escalate through tournament stages?

**Results:**
- Cat 1 seats: $142 (group) → $270 (final) = 90% premium
- Hospitality: $354 (group) → $682 (final) = 93% premium
- Demand index: 1.0 (group) → 2.0 (final)
- Resale rate: 7.3% (group) → 20.4% (final) — secondary market triples

**Assessment:** The 3x resale rate jump from group to final is notable but expected. Synthetic data.

---

## Iteration 19: Goal Distribution Shape by Era
**Hypothesis:** Has the distribution of goals per match changed shape across eras?

**Results:**
- Early (1930-62): Flat distribution, peak at 4 goals (19%), 7+ goal matches = 12.5%
- Middle (66-82): Peak shifted to 3 goals (20%), 0-0 matches = 12.5%
- Modern (86-02): Peak at 2 goals (25.4%), tight bell curve
- Recent (06-14): Peak at 3 goals (24%), slight bounce-back

**Assessment:** SURPRISING. The distribution compressed dramatically — 7+ goal matches went from 12.5% to 1.6%. But the recent bounce-back to 3 as the mode (from 2) is counterintuitive. **Finding candidate.**

---

## Iteration 20: Team Consistency Analysis
**Hypothesis:** Which teams are most consistent vs most variable across tournaments?

**Results:**
- Most consistent: Soviet Union (std dev 0.108) — always mediocre
- Most variable: Cameroon (avg 13.3% wins, but peaked at 60% — 1990 Roger Milla run)
- Bulgaria: avg 6.1% but peaked at 42.9% — 1994 semifinal run
- Brazil: High avg (62.8%) with moderate variability (0.246)

**Assessment:** Cameroon and Bulgaria are the biggest "lightning in a bottle" teams. Saved as journal note.

---

## Iteration 21: Most Frequent Rivalries
**Hypothesis:** Which teams meet most often at World Cups?

**Results (as home team only):**
- Brazil vs Sweden: 5 meetings, Brazil won 4, drew 1, outscored 19-7
- Brazil vs Czechoslovakia: 5 meetings, Brazil won 3, drew 2
- Brazil vs Mexico: 4 meetings, Brazil won 3, drew 1, outscored 11-0

**Assessment:** Brazil dominates the rivalry table (7 of 11 top matchups). Mexico has NEVER scored against Brazil in a World Cup. Mildly interesting.

---

## Iteration 22: Netherlands — The Undisciplined Dynasty
**Hypothesis:** Follow up on referee card data — which teams/players are most carded?

**Results:**
- 4 of top 20 most-carded players are Dutch (Van Bronckhorst, Boulahrouz, Heitinga, Numan)
- Ricard Giusti (Argentina) and Song (Cameroon) top the overall list

**Assessment:** Netherlands' overrepresentation in the discipline table is notable for a team known for "Total Football." **Finding candidate.**

---

## Iteration 23: Top Scorer Efficiency
**Hypothesis:** Who has the best goals-per-match rate among top scorers?

**Results:**
- Sandor Kocsis (Hungary, 1954): 2.75 goals/match — 11 goals in 4 matches
- Just Fontaine (France, 1958): 2.17 goals/match — 13 goals in 6 matches
- Klose: all-time leader with 16 goals but lower efficiency (1.45/match)
- Germany (combined eras): 6 of top 25 scorers

**Assessment:** Kocsis's 2.75 rate in 1954 may never be matched. The dominance of German scorers is notable. Saved as journal note.

---

## Iteration 24: Penalty Goal Trends
**Hypothesis:** Are penalty kicks becoming a bigger share of goals?

**Results:**
- Peaked in 1978 (13.8%) and 1990 (12.7%)
- Recent trend: declining to 7-8% (2006-2014)
- 1930: only 1.5% from penalties

**Assessment:** The 1978-1990 "penalty era" correlates with the most defensive World Cups. As open play revived, penalty share declined. Interesting temporal pattern. Saved as journal note.

---

## Iteration 25: Own Goals Trend
**Hypothesis:** Are own goals increasing?

**Results:**
- Fluctuates between 0-3.5% of total goals with no clear trend
- 1998 had highest: 6 own goals (3.5%)
- Web data: 2018 had 12 own goals — a dramatic record spike

**Assessment:** The 2018 spike (from web) is genuinely surprising. Not enough DB data to call a trend.

---

## Iteration 26: Merchandise Category Analysis
**Hypothesis:** What product categories drive merchandise revenue?

**Results:**
- Revenue remarkably uniform across categories (~$55-56M each)
- All categories average $88-89 per unit, ~3.5% discount rate

**Assessment:** Too uniform to be realistic — clear synthetic data signature. Noted as data quality caveat. No real insights here.

---

## Iteration 27: Team Evolution Across Eras
**Hypothesis:** Which teams rose, fell, or stayed steady across classic/expansion/modern eras?

**Results:**
- RISING: Germany 50%→60%→73%, Spain 40%→41%→64%, Colombia 0%→29%→63%
- FALLING: Portugal 83%→33%→41%, Uruguay 54%→9%→36%, Italy 58%→57%→45%
- STEADY: Brazil 68%→66%→68% — same win rate across 84 years

**Assessment:** VERY SURPRISING. Brazil's stability at ~68% across three radically different eras is remarkable. Uruguay's collapse from 54% to 9% in the expansion era is dramatic. Germany's silent rise to 73% makes them the most improved power. **Top finding.**

---

## Iteration 28: Substitute Goal Efficiency per 90 Minutes
**Hypothesis:** Has scoring efficiency changed, or just who scores?

**Results:**
- Goals per 90 minutes for scorers: stable at 1.2-1.4 across all eras
- Average minutes played by scorers: dropped from 90 (pre-1970) to 74 (2014)
- 2014: 28 non-starter goals — the highest ever

**Assessment:** The efficiency rate is unchanged — what changed is tactical deployment. Managers learned to use subs as weapons. Confirms Iteration 14 finding.

---

## Iteration 29: Sponsor Industry Patterns
**Hypothesis:** Which industries get the best sponsor ROI?

**Results:**
- Top investors: Sportswear (Adidas $1.67B), Financial (Visa $1.59B), Beverages (Coca-Cola $1.47B)
- Best ROI: Yingli Solar (3.56x), Qatar Airways (3.36x), Budweiser (3.28x)
- Smaller regional sponsors get higher ROI than global partners

**Assessment:** The inverse relationship between investment size and ROI suggests diminishing returns at the top tier. Noted.

---

## Iteration 30: Attendance-Goals Correlation
**Hypothesis:** Do higher-attended matches produce more goals?

**Results:** Correlation query returned no valid results (CAPACITY NULLs).

**Decision:** Dead end. Moved on.

---

## Web Data Integration (2018 + 2022)
From web search:
- **2018 Russia:** 64 matches, 169 goals (2.64/match), 3.03M attendance, 29 penalties awarded (record), 12 own goals (record). Winner: France.
- **2022 Qatar:** 64 matches, 172 goals (2.69/match), 3.4M attendance (96% occupancy), 5B global engagement. Winner: Argentina.

Key web additions to DB findings:
- Goals/match trend confirmed: 2.64 → 2.69 (stabilization continues)
- 2018's 12 own goals is 2x the previous record (6 in 1998)
- Host advantage drought extends: 0 for 6 since 1998

---

## Summary Statistics
- **Iterations completed:** 30
- **Queries executed:** ~55
- **Surprising findings:** 8 top candidates
- **Data quality issues:** 2 (position classification, name collisions)
- **Synthetic data limitations:** Merchandise and ticket data too uniform for genuine insights
