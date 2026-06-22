# IPL Cricket Analytics - Metric Definitions & KPI Calculations

**Project:** xFalcon IPL Analytics Hub
**Last Updated:** 2026-03-31
**Scope:** 2008-2025 IPL Seasons (18 seasons, 1,171 matches, 301 players)

---

## Batting Metrics

### Batting Average
**Definition:** Average runs scored per completed innings (excluding not-outs)

**Formula:**
```
Batting Average = Total Runs Scored / (Innings Batted - Not Outs)
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** TOTAL_RUNS, INNINGS_BATTED, NOT_OUTS
**Units:** Runs (decimal, e.g., 35.4)
**Calculation Example:** Player with 1,200 runs in 45 innings with 3 not-outs
```
= 1,200 / (45 - 3)
= 1,200 / 42
= 28.57 runs per innings
```

**Interpretation:**
- IPL average > 40: Elite level (only top 5% of players)
- IPL average 30-40: Consistent performer
- IPL average 20-30: Regular contributor
- IPL average < 20: Struggling/limited appearances

**Notes:**
- Excludes not-outs to avoid inflating averages (player didn't face all bowlers)
- If INNINGS_BATTED - NOT_OUTS = 0, average is undefined (show as "N/A" or "-")
- Some batsmen with only 1-2 appearances have high averages but limited sample

---

### Strike Rate
**Definition:** Rate at which batsman scores runs per ball faced

**Formula:**
```
Strike Rate = (Total Runs / Balls Faced) × 100
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** TOTAL_RUNS, BALLS_FACED
**Units:** Runs per 100 balls (percentage-like scale)
**Calculation Example:** Player with 800 runs from 600 balls
```
= (800 / 600) × 100
= 1.333 × 100
= 133.3 (runs per 100 balls)
```

**Interpretation:**
- Strike Rate > 150: Aggressive batsman (accelerates scoring)
- Strike Rate 120-150: Balanced approach (good scorer)
- Strike Rate 100-120: Conservative approach (building innings)
- Strike Rate < 100: Struggling to score (rare in IPL)

**Notes:**
- Express as decimal (e.g., 133.3), not percentage symbol
- Balls faced includes extras (wides, no-balls) that don't count as balls
- Powerplay strike rates typically 10-15% higher than death overs
- Inverse relationship with innings length: longer innings → lower SR

---

### Fifties & Centuries
**Definition:** Count of individual scores reaching 50+ runs (fifty) or 100+ runs (century)

**Fifties:**
```
Fifties = COUNT(individual scores >= 50 AND < 100)
```

**Centuries:**
```
Centuries = COUNT(individual scores >= 100)
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** HALF_CENTURIES, CENTURIES (pre-calculated)
**Units:** Count (integer)

**Interpretation:**
- Fifties per season > 3: Consistent match-winner
- Centuries per season > 1: Elite performer
- IPL centuries are rarer (fewer matches than test/ODI)
- Centuries typically in lower run-rate pitches or when batting first

**Notes:**
- IPL career records: Virat Kohli (7 centuries), Suresh Raina (1 century)
- Fifties are more common metric (100+ across 300-player cohort)
- Some franchises have franchise records (e.g., MI most centuries across franchise)

---

## Bowling Metrics

### Economy Rate
**Definition:** Average runs conceded per over bowled (key IPL metric - lower is better)

**Formula:**
```
Economy Rate = Runs Conceded / Overs Bowled
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** RUNS_CONCEDED, OVERS_BOWLED
**Units:** Runs per over (decimal, e.g., 6.5)
**Calculation Example:** Bowler concedes 320 runs in 48 overs
```
= 320 / 48
= 6.67 runs per over
```

**Interpretation:**
- Economy < 6.0: Excellent bowler (restricts runs)
- Economy 6.0-7.5: Good bowler (controls flow)
- Economy 7.5-9.0: Standard IPL bowler
- Economy > 9.0: Struggling bowler (being hit around)

**Notes:**
- IPL average economy rate: ~7.2 runs per over
- Death overs (16-20): Economy rates 1-2 runs/over higher
- Powerplay overs: Economy rates typically 1-2 runs/over lower
- Overs bowled format: 48.3 = 48 overs + 3 balls (divided by 6 = 48.5 overs)

---

### Bowling Average
**Definition:** Average runs conceded per wicket taken (inverse metric - lower is better)

**Formula:**
```
Bowling Average = Runs Conceded / Wickets Taken
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** RUNS_CONCEDED, WICKETS
**Units:** Runs per wicket (decimal, e.g., 18.3)
**Calculation Example:** Bowler concedes 200 runs while taking 12 wickets
```
= 200 / 12
= 16.67 runs per wicket
```

**Interpretation:**
- Bowling Average < 20: Elite wicket-taker (efficient)
- Bowling Average 20-25: Good wicket-taker
- Bowling Average 25-30: Moderate wicket-taker
- Bowling Average > 30: Struggling (either few wickets or many runs)

**Notes:**
- If WICKETS = 0, bowling average is undefined (show as "N/A")
- Different from test cricket (longer format, bowlers accumulate wickets)
- IPL bowlers average 20-25 runs/wicket (fewer opportunities than tests)

---

### Best Bowling Figures
**Definition:** Best individual bowling performance (most wickets in a single match)

**Format:** "W-R" (wickets-runs conceded), e.g., "5-20" means 5 wickets for 20 runs

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** BEST_BOWLING (text field)
**Units:** Wickets-Runs text string
**Calculation Example:** Bowler's best match: 5 wickets in 20 runs
```
Best Bowling = "5-20"
```

**Interpretation:**
- 5+ wickets in a match: Exceptional performance (rare in IPL)
- 3-4 wickets in a match: Very good performance
- 2-3 wickets in a match: Standard match contribution
- 0-1 wickets in a match: Struggling performance

**Notes:**
- Maximum 6 overs (36 balls) per bowler per innings in IPL
- Rare to exceed 4 wickets (limited overs format)
- Used for player highlight tracking, not aggregation

---

## Team-Level Metrics

### Win Percentage
**Definition:** Percentage of matches won by franchise across season or career

**Formula:**
```
Win Percentage = (Wins / Total Matches) × 100
```

**Source Table:** FACT_MATCH_RESULT
**Source Columns:** WINNING_TEAM_CODE, LOSING_TEAM_CODE (use to count wins)
**Units:** Percentage (0-100)
**Calculation Example:** Franchise wins 12 matches out of 14 group stage matches
```
= (12 / 14) × 100
= 85.7%
```

**Interpretation:**
- Win % > 70%: Champions/elite season (only top 2 franchises)
- Win % 55-70%: Playoff qualification typical
- Win % 40-55%: Middling season
- Win % < 40%: Poor season (potential wooden spoon)

**Notes:**
- Excludes abandoned matches or no-results (not counted as losses)
- Some franchises have never achieved > 70% win rate
- MI best win % across all seasons: ~57% (most consistent)
- Should track separately for league stage vs. playoffs

---

### Net Run Rate (NRR)
**Definition:** Difference between runs-per-over scored and conceded (used for tournament standings)

**Formula:**
```
NRR = (Total Runs Scored / Overs Faced) - (Total Runs Conceded / Overs Bowled)
```

**Source Table:** FACT_MATCH_RESULT, FACT_INNINGS_SCORECARD
**Source Columns:** TOTAL_RUNS_TEAM, TOTAL_RUNS_CONCEDED, OVERS_BOWLED
**Units:** Runs per over (decimal, can be negative, e.g., -0.5)
**Calculation Example:** Franchise across league stage:
```
Runs scored: 500 from 48 overs = 10.4 runs/over
Runs conceded: 480 from 48 overs = 10.0 runs/over
NRR = 10.4 - 10.0 = +0.4
```

**Interpretation:**
- NRR > +0.5: Dominant franchise (strong all-around)
- NRR 0 to +0.5: Balanced franchise
- NRR -0.5 to 0: Struggling franchise
- NRR < -0.5: Poor franchise (conceding more than scoring)

**Notes:**
- Used as tiebreaker in league standings (higher NRR wins tiebreak)
- Overs faced/bowled must be complete (20 overs) for accuracy
- Abandoned matches don't count in NRR (creates skew)
- NRR can swing 1-2 points on single match performance

---

### Head-to-Head Record
**Definition:** Win-loss record between two franchises across all encounters

**Format:** Wins-Losses (e.g., "8-6 CSK")

**Source Table:** FACT_MATCH_RESULT
**Source Columns:** WINNING_TEAM_CODE, LOSING_TEAM_CODE
**Units:** Match count (integers)
**Calculation Example:** MI vs. CSK across 18 seasons
```
MI wins: 12 matches
CSK wins: 10 matches
Result: "MI leads 12-10"
```

**Interpretation:**
- Used for rivalry narratives and historical context
- Not a predictive metric (used for storytelling)
- Home/away splits add depth (e.g., "MI 7-3 at home, 5-7 away")

**Notes:**
- Should separate league stage from playoffs for clarity
- Recent form more predictive than all-time record

---

## Player Performance Composites

### MVP Score (Weighted Composite)
**Definition:** Proprietary composite performance metric combining batting, bowling, and fielding

**Formula:**
```
MVP Score = (Batting Component × 0.4) + (Bowling Component × 0.4) + (Fielding Component × 0.2)

Where:
  Batting Component = (Runs / 100) × Strike Rate Index (capped at 100)
  Bowling Component = (Wickets × 5) - (Economy Rate × 2) (capped at 100)
  Fielding Component = (Catches × 10) + (Stumpings × 15) (capped at 100)
```

**Source Table:** FACT_PLAYER_SEASON_STATS
**Source Columns:** TOTAL_RUNS, STRIKE_RATE, WICKETS, ECONOMY_RATE, CATCHES_TAKEN, STUMPINGS
**Units:** Score (0-100, normalized)
**Calculation Example:** All-rounder with strong season
```
Batting: 800 runs @ 130 SR = (8) × 1.3 = 10.4/100
Bowling: 15 wickets @ 6.8 economy = (75) - (13.6) = 61.4/100
Fielding: 8 catches + 1 stump = (80) + (15) = 95/100
MVP = (10.4 × 0.4) + (61.4 × 0.4) + (95 × 0.2)
    = 4.16 + 24.56 + 19
    = 47.72 / 100
```

**Interpretation:**
- MVP Score 80-100: Top-tier all-around player (rare)
- MVP Score 60-80: Strong contributor (playoff-ready)
- MVP Score 40-60: Solid performer (regular contributor)
- MVP Score 20-40: Marginal player (limited impact)
- MVP Score < 20: Bench player or single-skill specialist

**Notes:**
- Capping at 100 prevents outliers from distorting scale
- Weighting: 40% batting, 40% bowling, 20% fielding reflects IPL format
- All-rounders naturally score higher (both batting and bowling)
- Pure batsmen/bowlers capped at 40% of max in unused components
- Season-specific metric (compare across same season only)

---

## Franchise Economics

### Gate Revenue (Ticket Sales)
**Definition:** Total revenue from home match ticket sales

**Formula:**
```
Gate Revenue = SUM(REVENUE_INR from FACT_TICKET_SALES for home franchise)
```

**Source Table:** FACT_TICKET_SALES
**Source Columns:** REVENUE_INR, REVENUE_CRORE
**Units:** INR Crore (primary), USD millions (secondary ~$120K per Crore)
**Calculation Example:** Franchise home matches across season
```
General Admission: 12 matches × avg 2M per match = 24M INR
Premium: 12 matches × avg 5M per match = 60M INR
VIP/Hospitality: 12 matches × avg 8M per match = 96M INR
Total: 180M INR = 1.8 Crore
```

**Interpretation:**
- Gate Revenue > 3 Crore: Elite attendance (Mumbai Indians, CSK)
- Gate Revenue 2-3 Crore: Strong home support
- Gate Revenue 1-2 Crore: Moderate attendance
- Gate Revenue < 1 Crore: Weak attendance (new franchise or poor performance)

**Notes:**
- Varies by home stadium capacity (Mumbai 132K, Delhi 40K)
- Match type impacts attendance (playoffs > league stage)
- Time of season impacts (early matches lower attendance)
- COVID years (2020-2021) had zero attendance (stadium gates closed)

---

### Total Revenue
**Definition:** Sum of all franchise revenue streams for a season

**Formula:**
```
Total Revenue = Title Sponsorship + Jersey Sponsorship + Gate Receipts + Broadcast Share + Prize Money
```

**Source Table:** FACT_FRANCHISE_FINANCIALS
**Source Columns:**
- TITLE_SPONSORSHIP_CR
- JERSEY_SPONSORSHIP_CR
- GATE_RECEIPTS_CR
- BROADCAST_SHARE_CR
- PRIZE_MONEY_CR

**Units:** INR Crore (primary), USD millions (secondary ~$120K per Crore)
**Calculation Example:** Franchise annual revenue
```
Title Sponsorship: 15 Crore (varies by sponsorship deal)
Jersey Sponsorship: 5 Crore
Gate Receipts: 1.8 Crore (from ticket sales)
Broadcast Share: 10 Crore (per-franchise split of media rights)
Prize Money: 3.2 Crore (winners + playoff bonuses)
Total: 35 Crore (~$4.2M USD)
```

**Revenue Composition (typical):**
- Title Sponsorship: 42% of total
- Broadcast Share: 28% of total
- Prize Money: 9% of total
- Jersey Sponsorship: 14% of total
- Gate Receipts: 5% of total
- Other: 2% of total

**Notes:**
- IPL franchise minimum revenue: ~30 Crore per season
- Top franchises (MI, CSK): 40-50 Crore per season
- New franchises (2022) started at 45 Crore base (auction expansion)
- Broadcast rights collectively: 300 Crore per season (split 8-10 ways)

---

### Operating Profit
**Definition:** Net profit after all operating expenses

**Formula:**
```
Operating Profit = Total Revenue - Operating Expenses
```

**Source Table:** FACT_FRANCHISE_FINANCIALS
**Source Columns:** TOTAL_REVENUE_CRORE, OPERATING_EXPENSES_CRORE
**Units:** INR Crore
**Calculation Example:** Franchise financials
```
Total Revenue: 35 Crore
Operating Expenses: 28 Crore
  - Player salaries: 15 Crore
  - Coaching/support staff: 3 Crore
  - Operations: 4 Crore
  - Marketing: 3 Crore
  - Other: 3 Crore
Operating Profit: 7 Crore
Operating Profit Margin: 20%
```

**Interpretation:**
- Operating Margin 20-30%: Highly profitable (sustainable)
- Operating Margin 10-20%: Profitable (normal)
- Operating Margin 0-10%: Break-even/low profit
- Operating Margin < 0%: Loss-making (unsustainable)

**Notes:**
- Player salary cap: Set by IPL (increasing yearly)
- Some franchises operated at loss in early years (building brand)
- COVID impact (2020-2021): No gate revenue, reduced margins
- Recent franchises (2022): High spending on retention, initially lower margins

---

### Franchise Valuation
**Definition:** Estimated franchise market value based on financial performance and brand

**Formula:**
```
Franchise Valuation = (Operating Profit × Profit Multiplier) + Brand Value + Asset Value
```

**Source Table:** FACT_FRANCHISE_FINANCIALS
**Source Columns:** FRANCHISE_VALUATION_CRORE
**Units:** INR Crore
**Valuation Range (2024 estimates):**
```
Mumbai Indians: 2,100 Crore (highest)
Chennai Super Kings: 1,850 Crore
Delhi Capitals: 1,450 Crore
Rajasthan Royals: 1,100 Crore
...average: 900-1,000 Crore
```

**Interpretation:**
- Valuation growth YoY: +5% to +15% (normal appreciation)
- Valuation stagnation: Indicates performance/management issues
- Valuation drops: Rare (brand value doesn't decline, just performance)

**Notes:**
- Based on external valuations (Sportico, IBIS Capital, etc.)
- Not actual sale price (franchises not typically sold)
- Reflects long-term earning potential, not annual revenue
- New franchises (2022) valued at 1,200+ Crore (premium for media rights locked in)

---

### Net Promoter Score (NPS)
**Definition:** Franchise fan loyalty metric (0-100 scale, higher = more loyal fans)

**Formula:**
```
NPS = % Promoters (9-10 rating) - % Detractors (0-6 rating)
Range: -100 to +100
```

**Source Table:** FACT_FRANCHISE_FINANCIALS
**Source Columns:** NPS_SCORE
**Units:** Score (-100 to +100)
**Interpretation:**
- NPS 70+: World-class (exceptional fan loyalty)
- NPS 50-70: Excellent (strong fan base)
- NPS 30-50: Good (loyal core, room to grow)
- NPS 0-30: Average (competitive market)
- NPS < 0: Poor (more detractors than promoters)

**IPL Franchise NPS (2024 est.):**
```
MI: 72 (highest)
CSK: 68
DC: 55
RR: 48
KKR: 52
...average: 45-50
```

**Notes:**
- Survey-based metric (sample of 1000+ fans per franchise)
- On-field performance heavily influences NPS (-/+ 5-10 points)
- Social media sentiment correlates (0.7 correlation) with NPS
- Highest performers reach 70+, new franchises start at 40-50

---

## Broadcast & Viewership Metrics

### TVR Rating (Television Rating)
**Definition:** Estimated percentage of TV audience watching during broadcast

**Formula:**
```
TVR Rating = (Viewers of Match / Total TV Households) × 100
```

**Source Table:** FACT_BROADCAST_RATINGS
**Source Columns:** TVR_RATING
**Units:** Percentage (0-100), typical IPL range 5-15
**Calculation Example:**
```
Match viewers: 20M households
Total Indian TV households: 200M
TVR Rating = (20 / 200) × 100 = 10%
```

**Interpretation:**
- TVR > 12%: Blockbuster match (MI vs CSK, playoffs)
- TVR 8-12%: Strong match (good teams, prime time)
- TVR 5-8%: Average match
- TVR < 5%: Weak match (poor teams, odd hours)

**Notes:**
- IPL 2024 average TVR: 9.1%
- Peak TVR (finals): 18-20%
- International legs (2020-2021 UAE): 8-10% (fewer India viewers)
- Star Sports measures TVR (Nielsen/TAM Media Research)

---

### Peak Viewership
**Definition:** Highest concurrent viewer count during match broadcast

**Source Table:** FACT_BROADCAST_RATINGS
**Source Columns:** PEAK_VIEWERSHIP_MILLIONS
**Units:** Millions of viewers
**Typical Range:**
```
Finals: 30-40M viewers
Semifinals: 20-25M viewers
Playoffs: 15-20M viewers
League stage (prime): 8-15M viewers
League stage (odd hours): 2-5M viewers
```

**Notes:**
- Peak occurs during exciting moments (sixes, wickets)
- Star Sports reports minimum average viewership (smoother metric)
- Streaming viewers (Disney+Hotstar) separate from TV viewers
- 2024: ~150M unique viewers across season (India population 1.4B)

---

### Average Viewership
**Definition:** Average concurrent viewers throughout match duration

**Source Table:** FACT_BROADCAST_RATINGS
**Source Columns:** AVERAGE_VIEWERSHIP_MILLIONS
**Units:** Millions of viewers
**Calculation Note:**
```
Typically 60-80% of peak viewership
Average = (Viewers at start + Viewers at end) / 2 (simplified)
```

**Notes:**
- More stable than peak (better for comparison)
- Declines with boring/one-sided matches
- Climbs with close finishes

---

### Streaming Viewership
**Definition:** Over-by-over concurrent streaming viewers (OTT platform)

**Source Table:** FACT_STREAMING_OVER_VIEWERSHIP
**Source Columns:** CONCURRENT_VIEWERS per over
**Units:** Viewers (platform-specific, major: Disney+Hotstar)
**Range (2024):**
```
Peak streaming: 5-15M concurrent (finals, playoff)
Average streaming: 2-5M concurrent (league stage)
Mobile-dominant: 70-80% of viewers (rest tablet/smart TV/desktop)
```

**Notes:**
- Disney+Hotstar: ~80% of IPL streaming market share
- Other platforms (SonyLiv, Amazon Prime): ~10% combined
- International cricket fans: 15-20% of streaming viewers
- Growth trend: +15-20% YoY (2023-2025)

---

### Regional Viewership
**Definition:** TVR/viewership broken down by Indian geographic region

**Regions Typically Tracked:**
```
- North India (Delhi, Punjab, Himachal)
- West India (Mumbai, Gujarat, Rajasthan)
- South India (Tamil Nadu, Karnataka, Andhra Pradesh, Telangana)
- East India (Kolkata, Odisha, Bihar)
- Central India (Madhya Pradesh, Chhattisgarh)
```

**Interpretation:**
- Home franchise matches show 2-3x higher regional TVR
- CSK dominates South India viewership
- MI dominates West India viewership
- KKR strong in East India (Kolkata base)

**Notes:**
- Regional data from TAM Media Research (Nielsen)
- Language factor: Hindi broadcast higher in North, regional in South
- Mobile viewership: 80% of streaming (region-aware ad targeting)

---

## Fan Engagement Metrics

### Sentiment Score (Social Media)
**Definition:** Aggregate sentiment of social media mentions about franchise or player

**Formula:**
```
Sentiment Score = (Positive Mentions - Negative Mentions) / Total Mentions
Range: -1 (all negative) to +1 (all positive)
Normalized to 0-1 scale where 0.5 = neutral
```

**Source Table:** FACT_FAN_ENGAGEMENT, FACT_SOCIAL_MEDIA_SENTIMENT
**Source Columns:** SENTIMENT_SCORE (0-1), SENTIMENT_LABEL (Positive/Negative/Neutral)
**Calculation Example:**
```
Positive tweets: 5,000
Negative tweets: 1,000
Neutral tweets: 4,000
Total: 10,000

Sentiment = (5,000 - 1,000) / 10,000 = 0.40
Interpretation: 40% net positive (below-average positive, competitive)
```

**Interpretation:**
- Sentiment 0.6-1.0: Highly positive (fan enthusiasm, winning)
- Sentiment 0.4-0.6: Moderately positive (normal fan engagement)
- Sentiment 0.2-0.4: Mixed sentiment (polarized fan base)
- Sentiment 0.0-0.2: Negative sentiment (poor performance, conflict)

**Notes:**
- Based on NLP analysis of tweets/posts (not 100% accurate)
- Spikes during losses (negativity), wins (positivity)
- Player-specific sentiment can vary dramatically (hero/villain dynamics)
- 2014+ data only (Twitter API availability)

---

### Twitter Engagement Rate
**Definition:** Social engagement actions per post or per follower

**Formula:**
```
Engagement Rate = (Retweets + Likes + Replies) / Followers × 100
```

**Source Table:** FACT_FAN_ENGAGEMENT
**Source Columns:** TWITTER_SENTIMENT_POSITIVE, TWITTER_SENTIMENT_NEGATIVE, TWITTER_MENTIONS
**Units:** Percentage (0-100%)
**Typical Range:**
```
High engagement (playoff posts): 3-5%
Normal engagement (match posts): 1-2%
Low engagement (news/updates): 0.5-1%
```

**Notes:**
- IPL franchises have 5-20M Twitter followers each
- Match-day posts peak engagement (live match tweets)
- Verified accounts show 2-3x higher engagement rate

---

### Instagram/Facebook Followers Growth
**Definition:** Rate of follower growth (month-over-month or season-over-season)

**Formula:**
```
Follower Growth % = ((Followers_Current - Followers_Prior) / Followers_Prior) × 100
```

**Typical Growth:**
```
Winning season: +8-12% annual growth
Average season: +4-6% annual growth
Poor season: +0-2% annual growth
Franchise launch: +30-50% (rapid early growth)
```

**Notes:**
- Franchise follower baselines (2024):
  - MI: 12M+ Twitter followers
  - CSK: 10M+ Twitter followers
  - New franchises (2022): Started at 5-6M, now 8-9M

---

## Auction Economics Metrics

### Average Auction Price
**Definition:** Mean price paid for players in auction

**Formula:**
```
Avg Price = SUM(Player Prices) / COUNT(Players Sold)
```

**Source Table:** FACT_PLAYER_AUCTION
**Source Columns:** SOLD_PRICE_CRORE
**Units:** INR Crore
**Historical Trends:**
```
2008 (first auction): 0.5-1.0 Cr average
2011-2015: 1.5-2.5 Cr average
2019 (mega auction): 3.0-4.0 Cr average
2022-2024 (post-mega): 4.5-6.0 Cr average
```

**Notes:**
- Inflation: Purse size and player quality both increase YoY
- Premium players (MS Dhoni, Virat Kohli): 12-15 Cr (vs. 5 Cr average)
- Rookie players: 0.2-0.5 Cr (below average)

---

### Bidding Competition (Price Multiplier)
**Definition:** How many franchises bid on a player (demand metric)

**Formula:**
```
Price Multiplier = Sold Price / Base Price
Bidding Competition = Count of franchises that bid
```

**Source Table:** FACT_PLAYER_AUCTION
**Source Columns:** SOLD_PRICE_CRORE, BASE_PRICE_CRORE, BIDDING_COMPETITION
**Interpretation:**
- Multiplier 3-4x: Hot property (5+ franchises bidding)
- Multiplier 2-3x: Desired player (3-4 franchises bidding)
- Multiplier 1-2x: Acceptable player (1-2 franchises bidding)
- Multiplier 1.0x: Single bid/unsold reserve price

**Example:**
```
Base Price: 2 Crore
Sold Price: 7 Crore
Multiplier: 3.5x
Bidding: 6 franchises (intense competition)
```

**Notes:**
- Star players often 3-4x multiplier (high demand)
- Overseas players at mini-auctions can reach 8-10x (rare availability)
- Unsold players have 0x multiplier (zero franchises wanted them)

---

### Auction ROI (Return on Investment)
**Definition:** Performance vs. auction price (value delivered relative to cost)

**Formula:**
```
ROI = (Fantasy Points / Auction Price) per season
Quality Score = (Runs + 50×Wickets) / Auction Price Crore
```

**Source Table:** FACT_PLAYER_AUCTION (prior year), FACT_PLAYER_SEASON_STATS (current year)
**Calculation Example:**
```
Player bought at: 5 Crore
Season performance:
  Runs: 600
  Wickets: 8
Quality = (600 + 50×8) / 5 = 1,000 / 5 = 200 runs per Crore spent

High ROI: > 150 quality score
Good ROI: 100-150
Acceptable ROI: 50-100
Poor ROI: < 50
```

**Notes:**
- Used to evaluate auction decisions retrospectively
- Budget efficiency varies by franchise (CSK vs. RCB different strategies)
- International stars sometimes have low ROI (premium for brand value)

---

## Match Prediction Metrics

### Win Probability
**Definition:** Estimated probability of team winning at any point in match

**Source Table:** FACT_MATCH_PREDICTION_MARKET
**Source Columns:** WIN_PROBABILITY_TEAM_1_PCT, WIN_PROBABILITY_TEAM_2_PCT
**Units:** Percentage (0-100)
**Timing:**
```
Pre-match: Team 1 60%, Team 2 40% (based on rankings, toss, conditions)
After PP (6 overs 1st innings): Updated based on actual performance
After 10 overs: Further update
At halfway: Significant shift (1st inning total vs. 2nd inning target)
After 15 overs: Near-final prediction
Final update: With 1 over remaining
```

**Example Progression:**
```
Pre-match: CSK 65%, RCB 35% (CSK ranked higher)
After PP: CSK 70%, RCB 30% (CSK scoring well)
After 10 overs: CSK 75%, RCB 25% (CSK dominating)
After 15 overs: CSK 82%, RCB 18% (CSK near target)
Final: CSK 95%, RCB 5% (CSK needs 3 runs, 1 over left)
```

**Notes:**
- Market-based odds (implied from betting odds)
- Accuracy improves as match progresses (from 60% accuracy pre-match to 95% by 10th over)
- Injuries, unexpected collapses can shift odds 10-20 points instantly

---

### Prediction Accuracy
**Definition:** Percentage of market predictions that correctly predicted match outcome

**Formula:**
```
Prediction Accuracy = (Correct Predictions / Total Predictions) × 100
```

**Interpretation:**
- Accuracy 55-65%: Market is efficient (slight edge to smart betters)
- Accuracy 50%: Market is perfectly efficient (no edge)
- Accuracy < 50%: Market is inefficient (betters can exploit)

**Notes:**
- IPL market typically 52-58% accuracy (slightly efficient)
- Favorites (higher prob) win 70% of the time at stated probability
- Underdogs occasionally win (40% of favorites lose)

---

## Summary Table: All Metrics

| Metric | Category | Formula | Source Table | Units | Direction |
|--------|----------|---------|--------------|-------|-----------|
| Batting Average | Batting | Runs / (Innings - NO) | FACT_PLAYER_SEASON_STATS | Runs | ↑ Higher is Better |
| Strike Rate | Batting | (Runs / Balls) × 100 | FACT_PLAYER_SEASON_STATS | Runs/100B | ↑ Higher is Better |
| Fifties | Batting | COUNT(50-99 runs) | FACT_PLAYER_SEASON_STATS | Count | ↑ Higher is Better |
| Centuries | Batting | COUNT(100+ runs) | FACT_PLAYER_SEASON_STATS | Count | ↑ Higher is Better |
| Economy Rate | Bowling | Runs / Overs | FACT_PLAYER_SEASON_STATS | Runs/Over | ↓ Lower is Better |
| Bowling Average | Bowling | Runs / Wickets | FACT_PLAYER_SEASON_STATS | Runs/Wicket | ↓ Lower is Better |
| Wickets | Bowling | COUNT(wickets) | FACT_PLAYER_SEASON_STATS | Count | ↑ Higher is Better |
| Win Percentage | Team | (Wins / Matches) × 100 | FACT_MATCH_RESULT | Percentage | ↑ Higher is Better |
| Net Run Rate | Team | (RPO Scored) - (RPO Conceded) | FACT_MATCH_RESULT | Runs/Over | ↑ Higher is Better |
| MVP Score | Composite | 0.4×Bat + 0.4×Bowl + 0.2×Field | FACT_PLAYER_SEASON_STATS | Score (0-100) | ↑ Higher is Better |
| Gate Revenue | Economics | SUM(Ticket Sales) | FACT_TICKET_SALES | INR Crore | ↑ Higher is Better |
| Total Revenue | Economics | Sponsorship + Gate + Broadcast + Prize | FACT_FRANCHISE_FINANCIALS | INR Crore | ↑ Higher is Better |
| Operating Profit | Economics | Revenue - Expenses | FACT_FRANCHISE_FINANCIALS | INR Crore | ↑ Higher is Better |
| NPS Score | Fan Loyalty | % Promoters - % Detractors | FACT_FRANCHISE_FINANCIALS | Score (-100 to +100) | ↑ Higher is Better |
| TVR Rating | Viewership | (Viewers / Total Households) × 100 | FACT_BROADCAST_RATINGS | Percentage | ↑ Higher is Better |
| Sentiment Score | Engagement | (Positive - Negative) / Total | FACT_FAN_ENGAGEMENT | Score (0-1) | ↑ Higher is Better |
| Avg Auction Price | Auction | SUM(Prices) / COUNT(Players) | FACT_PLAYER_AUCTION | INR Crore | Contextual |
| Win Probability | Prediction | Market-derived | FACT_MATCH_PREDICTION_MARKET | Percentage | Contextual |

---

**Next Steps for Implementation:**

1. Create SQL templates for each metric (see DATA_SCHEMA_MAP for table references)
2. Implement metric calculations in data pipelines (aggregation layer)
3. Set up dashboard visualizations per RETAILEDGE_THEME color rules
4. Validate all metrics against source system (audit trails)
5. Document any business rule exceptions (e.g., COVID seasons, abandoned matches)

---

**Last Updated:** 2026-03-31
**Review Cycle:** Quarterly (after IPL season)
**Contact:** analytics@xfalcon-ipl.com
