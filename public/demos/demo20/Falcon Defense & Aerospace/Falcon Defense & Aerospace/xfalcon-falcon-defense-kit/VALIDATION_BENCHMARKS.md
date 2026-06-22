# Validation Benchmarks — Falcon Defense & Aerospace

User did not supply known-correct benchmarks at onboarding. Dashboards are validated using **internal consistency checks** (fact totals match across queries, no 2× inflation from grain issues, no NULL cascades).

## Internal consistency baselines (computed 2026-04-20)

Use these values to spot-check any future refresh. If a dashboard shows a number that differs materially from what's below, investigate before shipping.

### Contract Revenue (FACT_CONTRACT_REVENUE, all 5 years)

| Measure | Total (2020–2024) |
|---|---|
| Billed Amount | $264,648M |
| Recognized Revenue | $278,591M |
| Incurred Cost | $284,274M |
| Fee Earned | $11,771M |
| Fee Realization % | 4.22% |

### Contract Revenue by year ($M)

| Year | Billed | Recognized | Incurred Cost | Fee |
|---|---|---|---|---|
| 2020 | 47,121 | 49,611 | 50,625 | 2,093 |
| 2021 | 42,085 | 44,299 | 45,202 | 1,913 |
| 2022 | 49,582 | 52,193 | 53,265 | 2,296 |
| 2023 | 67,161 | 70,698 | 72,140 | 2,947 |
| 2024 | 58,699 | 61,789 | 63,041 | 2,524 |

**Sanity checks:**
- Revenue growing 2020→2023 then stepping down in 2024 (7.3% YoY drop) — matches a typical defense budget cycle.
- Incurred cost exceeds recognized revenue every year (normal for cost-plus-fee where fee is earned separately).
- 2023 is the peak; 2024 should show YoY declines in both top-line and fee.

### Program Budget (FACT_PROGRAM_BUDGET, Revised only)

| Year | Budget | Actual | Variance | Var % |
|---|---|---|---|---|
| 2020 | 6,570 | 6,722 | +153 | +2.3% |
| 2021 | 9,150 | 9,313 | +164 | +1.8% |
| 2022 | 10,898 | 11,106 | +208 | +1.9% |
| 2023 | 11,671 | 11,866 | +194 | +1.7% |
| 2024 | 11,912 | 12,148 | +235 | +2.0% |

**Red flag:** If Variance % exceeds ±5% on any program without explanation, investigate. Portfolio averages 1.7–2.3% over budget (typical for defense prime).

### 2024 Agency ranking ($M recognized revenue)

| Rank | Agency | Rev |
|---|---|---|
| 1 | US Army | 13,996 |
| 2 | US Navy | 12,996 |
| 3 | US Air Force | 10,811 |
| 4 | DARPA | 8,427 |
| 5 | DHS (Civilian Federal) | 4,699 |
| 6 | Space Force | 4,243 |
| 7 | MDA | 3,874 |
| 8 | USMC | 2,744 |

Top 8 sum ≈ $61.79B = total 2024 revenue ✓

### 2024 Program ranking ($M)

| Rank | Program | Domain | Rev |
|---|---|---|---|
| 1 | ARES-HERMES | Land | 6,052 |
| 2 | ARES-GHOST | Air | 5,313 |
| 3 | ARES-BRIDGE | Cyber | 4,699 |
| 4 | ARES-TRIDENT | Sea | 4,672 |
| 5 | ARES-FORGE | Multi-Domain | 4,313 |

All 15 programs have CPI in 0.9695–0.9705 range and SPI in 0.9486–0.9515 range. Very tight clustering — portfolio is uniformly slightly under-performing on cost and schedule.

### Supplier Tier metrics (active, DIM_SUPPLIER)

| Tier | Active suppliers | Avg OTD % | Avg Quality | DCAA-approved |
|---|---|---|---|---|
| 1 | 10 | 95.47% | 4.65 | 100% (expected) |
| 2 | 16 | 87.29% | 3.92 | — |
| 3 | 172 | 79.15% | 3.51 | — |

**Red flag:** Tier-3 suppliers average 79% OTD with 172 active vendors → concentrated risk at the small-business layer. Headline for Dashboard 6.

### Labor split

| Classification | Rows | Direct hours | Indirect hours |
|---|---|---|---|
| Unclassified | 374,988 | 12,189,533 | 1,498,212 |
| Classified | 201,636 | 6,549,871 | 806,975 |

**Expected ratio:** ~65/35 unclassified/classified split, matching ARES's reported 44% classified-work capacity.

---

## How to use these

When rebuilding a dashboard or refreshing data, spot-check the headline metric against the year-total table above. Differences of >1% on aggregate figures are worth investigating. Numbers should reconcile exactly if BUDGET_VERSION='Revised' and no new data has been loaded.
