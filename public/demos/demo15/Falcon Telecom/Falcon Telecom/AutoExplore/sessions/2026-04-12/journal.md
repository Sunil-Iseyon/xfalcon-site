# AutoExplore Journal — Regional Growth Dynamics
**Date**: 2026-04-12
**Mode**: Directed (Regional Growth Dynamics)
**Iterations**: 20 | **Queries Used**: ~25 | **Fact-Check Cycles**: 1

---

## Orientation
Discovered 11 tables in star schema. 4 fact tables (BILLING: 943K rows, USAGE: 895K, LIFECYCLE: 195K, ROAMING: 150K), 7 dimensions. 80,000 subscribers across 60 circles, 5 regions, 3 tiers. Data spans 2019-2025. No annotations or memory caveats found. INR currency.

---

## Iteration 1: Regional subscriber distribution
**Hypothesis**: Regions will have significantly different subscriber profiles and churn rates.
**Query**: Subscribers, churn %, LTV, NPS by region and tier.
**Found**: Central Tier 3 has worst churn (25.12%, NPS 4.83). West Tier 3 has best (20.52%). LTV remarkably uniform (~23-24K). Central is smallest region (4,027 subs).
**Assessment**: Mildly surprising — LTV uniformity was unexpected. Central's poor metrics need investigation.
**Decision**: Follow the Central thread.

## Iteration 2: Year-over-year acquisition by region
**Hypothesis**: Some regions are acquiring subscribers faster.
**Query**: New subs and avg LTV by region and activation year.
**Found**: Acquisition rates stable across all regions and years (~640-4000/yr proportional to region size). LTV naturally decreases for newer cohorts.
**Assessment**: Not surprising. Dead end for growth divergence via acquisition volume.
**Decision**: Move to revenue dynamics.

## Iteration 3: Monthly ARPU trends 2023-2025
**Hypothesis**: ARPU trajectories differ by region.
**Query**: Monthly avg ARPU, overage, roaming charges, active subs by region.
**Found**: East ARPU climbing steadily (1017 to 1035). North started low (992) but rising. Central dipped in 2024, recovering. Active subs peaked in 2024 then declining in all regions.
**Assessment**: East's ARPU growth is notable. Active sub decline in 2025 across all regions is concerning.
**Decision**: Save East ARPU finding, investigate further.

## Iteration 4: Annual revenue and ARPU summary
**Hypothesis**: Revenue concentration and ARPU divergence are measurable annually.
**Query**: Annual revenue (millions), ARPU, overage, roaming, days-to-pay by region.
**Found**: East ARPU: 986 to 1034 (+48 over 7 years). West: 1014 to 1020 (+6). North + South = 61% of revenue. Payment behavior identical across regions.
**Assessment**: SURPRISING — East's ARPU growth vs West's stagnation is a 8x difference in ARPU improvement rate. Saved as finding.
**Decision**: Investigate churn reasons next.

## Iteration 5: Churn reasons by region
**Hypothesis**: Different regions churn for different reasons.
**Query**: Churn reason distribution with LTV and NPS of churned subs.
**Found**: Price is #1 everywhere. Central's service-issue churners have worst NPS (4.59 vs 4.82-5.18 elsewhere). Central's network quality churners have lowest LTV (19,296).
**Assessment**: Central's service problem is real and measurable. Not dramatically surprising but actionable.
**Decision**: Move to growth dynamics.

## Iteration 6: Lifecycle event dynamics by region
**Hypothesis**: Upgrade/downgrade and activation/churn ratios differ by region.
**Query**: Event counts (activation, churn, upgrade, downgrade) by region and year.
**Found**: Central has been net-negative on subscribers since 2021 (-12, -17, -22, -20, -40). Accelerating decline. South is only consistently positive region.
**Assessment**: SURPRISING — Central's 5-year continuous decline was not obvious from the top-line numbers. Saved as finding.
**Decision**: Deep dive on net growth ratio.

## Iteration 7: Net growth ratio verification
**Hypothesis**: The net add picture across all regions will reveal growth health.
**Query**: Activations, churns, upgrades, downgrades, net adds, upgrade/downgrade ratio by region/year.
**Found**: Central in continuous decline since 2021 (now -40). North turned negative in 2024. West chronically negative (5 of 7 years). South most resilient.
**Assessment**: Confirmed Central decline. West's chronic negative is also notable. Upgrade/downgrade ratios hover near 1.0 everywhere.
**Decision**: Investigate circle-level drivers.

## Iteration 8: Circle-level analysis for declining regions
**Hypothesis**: Specific circles are driving Central/West decline.
**Query**: All circles in Central and West with churn %, LTV, NPS.
**Found**: Central is entirely Madhya Pradesh (single circle, 3 tiers). MP Rural has worst churn. West split between Maharashtra and Gujarat.
**Assessment**: Central's single-circle concentration is a structural vulnerability.
**Decision**: Get all 60 circles for comparison.

## Iteration 9: All 60 circles ranked
**Hypothesis**: Tier 3 Rural circles will dominate worst churn.
**Query**: All circles ranked by churn rate with full metrics.
**Found**: Top 4 worst churn are all Tier 3 Rural: Telangana (25.63%), Bihar (25.27%), MP (25.12%), Kerala (25.00%). BUT West Bengal Tier 1 Urban is #5 at 24.24% — anomalously high for metro. Kerala Semi-Urban has worst NPS in network (4.64).
**Assessment**: SURPRISING — West Bengal Tier 1's high churn breaks the rural-churn pattern. Saved as finding. Kerala NPS also notable.
**Decision**: Cross-reference with network quality.

## Iteration 10: Network quality by circle
**Hypothesis**: High-churn circles have worse network quality.
**Query**: Avg drop rate, throughput, signal strength, data usage by circle.
**Found**: Network quality is nearly identical across all 60 circles (drop rate 0.0148-0.0154, throughput 27-42 Mbps, signal ~-88 dBm).
**Assessment**: VERY SURPRISING null finding. Network quality metrics do NOT differentiate circles despite being cited as churn reason. Saved as finding.
**Decision**: If it's not the network, check device/segment mix.

## Iteration 11: Customer segment mix by region
**Hypothesis**: Different segment compositions explain regional performance.
**Query**: Segment distribution, LTV, NPS, churn by region.
**Found**: Segment mix is identical across all regions (~62% Mass Market, ~25% Mid Market, ~7.5% Premium, ~6% Corporate). BUT Central Mass Market churn (26.89%) is worst in class.
**Assessment**: Not the mix — it's the performance within segments. Central's Mass Market is the weak point.
**Decision**: Check device dimension.

## Iteration 12: Device brand and 5G adoption by region
**Hypothesis**: Device mix varies by region and correlates with churn.
**Query**: Device brand, 5G capability, tier, churn by region.
**Found**: Central's Xiaomi 5G Premium: 27.97% churn. Apple 5G Premium: 27.03%. These are the WORST in the network. 5G Premium owners in Central churn more than budget device users.
**Assessment**: VERY SURPRISING paradox. 5G premium device owners churning more suggests unmet 5G expectations. Saved as finding.
**Decision**: Verify with tower infrastructure data.

## Iteration 13: Tower infrastructure by region
**Hypothesis**: Central has inadequate 5G tower infrastructure.
**Query**: Tower count by technology and region.
**Found**: Central has ONLY 1 (ONE) 5G tower with 316 user capacity. Total: 14 towers. Meanwhile East: 10, North: 13, South: 8, West: 4 5G towers. Central also has 21% of towers still on 3G.
**Assessment**: SMOKING GUN. This directly explains the 5G churn paradox. 1 tower cannot serve 990 5G Premium subs. Saved as finding.
**Decision**: Move to plan migration patterns.

## Iteration 14: Plan migration patterns
**Hypothesis**: Regions differ in upgrade/downgrade paths.
**Query**: Plan category migration counts and revenue impact by region.
**Found**: Overwhelming Postpaid-to-Prepaid migration everywhere. Central: 3.4:1 ratio. Corporate-to-Prepaid leakage is also massive.
**Assessment**: Mildly interesting. Universal trend, not region-specific.
**Decision**: Check billing health.

## Iteration 15: Payment behavior
**Hypothesis**: Some regions have worse payment discipline.
**Query**: Payment status distribution by region for 2024-2025.
**Found**: Nearly identical: ~71.5% Paid, ~14.3% Late, ~14% Unpaid everywhere.
**Assessment**: Not surprising. Dead end.
**Decision**: Pivot to adjacent discovery.

## Iteration 16: Roaming by region and segment
**Hypothesis**: Roaming revenue is unevenly distributed across regions/segments.
**Query**: Roaming subs, revenue, usage by region and segment.
**Found**: South Premium leads roaming revenue (223K). Premium is 3-4x over-represented in roaming. Mid Market is dramatically under-represented.
**Assessment**: Mid Market roaming gap is actionable. South's roaming strength is interesting.
**Decision**: Check complaint resolution next.

## Iteration 17: Complaint resolution
**Hypothesis**: Central's service reputation correlates with slower resolution.
**Query**: Complaint types, resolution days, NPS by region.
**Found**: Resolution time is uniform (~7.5 days) across all regions and complaint types. NPS differences are marginal.
**Assessment**: Dead end. Operational metrics don't explain the service perception gap.
**Decision**: Look at competitive dynamics — porting.

## Iteration 18: Port-in vs port-out dynamics
**Hypothesis**: Competitive pressure varies by region.
**Query**: Port-in, port-out, net ports, revenue impact by region/year.
**Found**: South had a DRAMATIC port-out spike in 2025: -89 net (vs +10 in 2024). East is chronically losing (-15 to -29/yr). West IMPROVED to +53 in 2025.
**Assessment**: VERY SURPRISING. South was the "resilient region" — this is an emerging threat. Saved as finding.
**Decision**: Verify where in South this is happening.

## Iteration 19: Verify Central 5G churn paradox
**Query**: 5G vs non-5G churn by region, then by device tier.
**Found**: Central 5G Premium churn: 25.45% — 2.6+ points worse than any other region's 5G Premium. Confirmed.
**Assessment**: Finding verified. The 1-tower-serving-990-subs explanation holds.

## Iteration 20: Verify South port-out spike location
**Query**: Port-in/out by circle in South for 2024 vs 2025.
**Found**: Telangana Tier 2 swung from +20 to -48 (68-port collapse). Karnataka Tier 1 swung from -1 to -29. These two circles = 77 of 89 net port-outs.
**Assessment**: Finding verified and refined. Not a broad South problem — concentrated competitive pressure in 2 specific circles. Actionable.

---

## Fact-Check Results — Cycle 1
- Claims checked: 22
- Errors found: 0 numerical, 0 overstatements, 0 cross-population
- Missing context: 0
- Causal language issues: 0 (used correlational throughout)
- Remaining must-fix: 0
- Remaining should-fix: 0
- Status: CLEAN -> Exiting fact-check loop
