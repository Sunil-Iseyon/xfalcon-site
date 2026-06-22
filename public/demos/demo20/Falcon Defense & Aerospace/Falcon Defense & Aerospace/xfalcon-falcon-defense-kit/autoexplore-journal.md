# AutoExplore Journal — Supply Chain Vulnerabilities

**Run date:** 2026-04-20
**Mode:** Directed (theme: supply chain vulnerabilities)
**Scope:** FACT_PARTS_SUPPLY (700K rows) · DIM_SUPPLIER (220 rows) · DIM_PARTS (1,800 rows)
**Total hypotheses tested:** 20 · **Findings surfaced:** 6 · **Null results:** 9 · **Data-quality issues:** 5

---

## Hypothesis Log

### CONFIRMED (6 findings)

**H01. Tier 3 handles the majority of parts spend.**
- Query: `SELECT SUPPLIER_TIER, SUM(TOTAL_PO_VALUE_USD) GROUP BY 1`
- Expected: Tier 1 primes dominate
- Found: T1 $259B / T2 $94B / **T3 $1,007B (74%)**
- Action: Finding 1

**H02. Mission Critical parts show highest sole-source rate.**
- Query: `SELECT CRITICALITY, SUM(IS_SOLE_SOURCE) GROUP BY 1`
- Expected: Lowest sole-source rate on Mission Critical (dual-sourcing priority)
- Found: **Mission Critical 30.1% sole-source — highest of 4 categories**
- Action: Finding 2

**H03. Tier 3 DCAA approval is effectively zero.**
- Query: `SELECT SUPPLIER_TIER, DCAA_APPROVED, COUNT(*) GROUP BY 1,2`
- Expected: Gradient from T1→T3
- Found: **T1 100%, T2 50%, T3 0%** — stepwise
- Action: Finding 3

**H04. Quality rating is a step-function predictor of OTD.**
- Query: 5-bin quality × AVG(ON_TIME_DELIVERY_PCT)
- Expected: Linear correlation
- Found: **Flat 79-80% for bins 1-4, jumps to 96% at bin 5**
- Action: Finding 4

**H05. Nearly half of active suppliers are single-points-of-failure.**
- Query: `active & OTD < 80 & sole-source`
- Expected: ~25 suppliers
- Found: **95 suppliers (48% of active base)**
- Action: Finding 5

**H06. Lead time variability does NOT differentiate by tier.**
- Query: `AVG(ABS(DAYS_EARLY_LATE)) GROUP BY tier`
- Expected: T3 more variable
- Found: **4.69-4.78 days across all tiers — parity**
- Action: Finding 6 (informational)

### NULL RESULTS (9 hypotheses)

**H07. Domain × supplier-tier concentration.** — Flat distribution, no domain carries excess T3 risk.

**H08. Monthly OTD seasonality.** — ±0.5pp noise only. No Sep, Dec, or Mar pattern.

**H09. Defect-rate year-over-year trend.** — First-pass yield stable at 96.4-96.7% across 2020-2024 and all 3 tiers.

**H10. Geographic clustering of at-risk suppliers.** — Bottom-15 OTD vendors span 8 distinct states.

**H11. MIL-SPEC vs COTS OTD.** — No material difference; MIL-SPEC does not imply more reliable delivery.

**H12. Supplier concentration by contract vehicle (IDIQ / BOA / GSA).** — Uniform draw from T3 pool regardless of vehicle.

**H13. Purchase Price Variance vs OTD.** — No correlation: paying premium does not buy reliability.

**H14. Top-quality (4.5+) cohort DCAA skew.** — 9 top-quality suppliers are distributed in tier proportions matching population.

**H15. First-year supplier effect.** — New (2023-2024 onboarded) vs legacy suppliers show identical OTD distributions.

### DATA QUALITY / METHODOLOGY NOTES (5)

**H16. Fact-level vs Dim-level OTD divergence.** — `FACT_PARTS_SUPPLY.ON_TIME_FLAG` averages 63% across tiers; `DIM_SUPPLIER.ON_TIME_DELIVERY_PCT` shows 79-95%. These are different measurements (per-PO vs scorecard). Both are valid but should not be cross-referenced. Documented in GLOBAL_FILTERS.md.

**H17. PERIOD_OF_PERF bucket cliff.** — 303 of 400 contracts are "expired" as of 2026-04-20, since the data window ends 2024-12-31. Headline counts for "active" portfolio should use the PERIOD_OF_PERF_END filter cleanly.

**H18. DIM_SUPPLIER row count mismatch.** — 220 total / 198 active. Historical POs from the 22 inactive suppliers remain in fact tables and will appear in historical aggregations.

**H19. BUDGET_VERSION grain (reminder).** — This AutoExplore did NOT touch FACT_PROGRAM_BUDGET, but the BUDGET_VERSION='Revised' filter remains required for any future session that does.

**H20. Sole-source × criticality unexpected.** — The inverted pattern (highest sole-source on Mission Critical) could plausibly reflect real-world "qualify one vendor, move on" patterns in the source system. In the demo dataset it's simulated. In real deployment this should be validated against Engineering's qualification records.

---

## Appendix: Validation spot-checks

- Total PO value 5-year sum: $258,990 + $94,039 + $1,007,031 = **$1,360,060M** ≈ $1.36T. Matches SUM of FACT_PARTS_SUPPLY.TOTAL_PO_VALUE_USD.
- Supplier count 198 active. Tiers: 10 + 16 + 172 = 198. ✓
- Total active DIM_PARTS × sole-source: 510 of 1,800 = 28.3%. Matches portfolio-level avg across categories.
- CRITICALITY distribution: 634 + 479 + 342 + 345 = 1,800 parts. ✓
