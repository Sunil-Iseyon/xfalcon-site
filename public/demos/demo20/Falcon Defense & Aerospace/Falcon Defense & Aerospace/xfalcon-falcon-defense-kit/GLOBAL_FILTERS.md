# Global Filters & Exclusions — Falcon Defense & Aerospace

Every query in `QUERY_TEMPLATES.sql` and every dashboard inherits these rules. Change one rule here → change every query.

## Hardcoded exclusions (applied to every query)

### 1. BUDGET_VERSION filter — REQUIRED
```sql
-- On every FACT_PROGRAM_BUDGET reference:
WHERE b.BUDGET_VERSION = 'Revised'
```
**Why:** Grain test on 2026-04-20 proved Original and Revised each hold 12,112 rows with IDENTICAL budget totals ($50.20B). Summing without this filter inflates metrics 2×. Saved as IDA memory id `430f57d9-8968-4267-b961-90cae3517d6e`.
**Exception:** The "Baseline Shift" chart in Dashboard 2 (Program Financial Performance) intentionally shows Original vs Revised side-by-side — that chart unfilters BUDGET_VERSION and groups BY it. This is the only legitimate unfiltered use.

### 2. Active-employee filter (for labor-hours dashboards)
```sql
WHERE e.IS_ACTIVE = TRUE
```
**Why:** Labor utilization should reflect current workforce (89.8% of 4,200 = 3,772 active employees). Historical trend lines keep separated employees because their hours are already in FACT_LABOR_HOURS; the dimension-side filter only affects "Who are these employees?" lookups (job family, clearance, facility).
**Applies to:** Dashboard 7 (Labor Utilization).

### 3. Active-supplier filter (for supply-chain dashboards)
```sql
WHERE s.IS_ACTIVE = TRUE
```
**Why:** Supply-chain dashboards show the current Approved Supplier List. Active supplier counts: Tier 1 = 10, Tier 2 = 16, Tier 3 = 172 (of 194). Historical POs from inactive suppliers remain in FACT_PARTS_SUPPLY.
**Applies to:** Dashboard 6 (Supply Chain Performance).

### 4. Active-contract filter (portfolio-state views)
```sql
WHERE c.PERIOD_OF_PERF_END >= CURRENT_DATE   -- "active today"
-- Or for historical views:
-- (no filter — keep all contract history)
```
**Why:** `DIM_CONTRACT` has no `IS_ACTIVE` flag. "Active" is derived from period-of-performance end date. Today = 2026-04-20. Contracts with PERIOD_OF_PERF_END before today are "expired" or "closed out".
**Applies to:** Dashboard 8 (Contract Portfolio Health) "Active Portfolio" tab. Historical views (Executive Overview's 5-year trend, Agency Roll-ups) do NOT apply this filter — they show all revenue that was recognized during the window.

## Interactive global filter bar

These appear on the portal AND on every dashboard. Filter choices propagate to every KPI, chart, and table on the page (see Filter Coverage Rule in project SKILL.md).

| Filter | Values | Default | Applies to |
|---|---|---|---|
| **Year** | 2020, 2021, 2022, 2023, 2024 | **2024** | All time-based aggregations (single-year mode) |
| **Compare Years** (toggle) | OFF / ON | OFF | When ON: year selector greys out; KPIs stack per-year; charts overlay 5 years |
| **Program** | All + 15 ARES-* codes | All | All FACT_CONTRACT_REVENUE and FACT_PROGRAM_BUDGET dashboards |
| **Agency** | All + 15 agencies | All | Dashboards 1, 3, 4, 5, 8 |
| **Domain** | All + Air/Land/Sea/Space/Cyber/Multi-Domain | All | Dashboards 1, 5, 8 |

**Dashboard-specific filters** live in the dashboard itself (supplier tier on D6, clearance level on D7, contract type on D8, etc.).

## Conditional calculation rules

1. **Fee realization %** — computed as `SUM(FEE_EARNED_USD) / SUM(RECOGNIZED_REV_USD)`. When RECOGNIZED_REV_USD = 0, show "N/A" (not 0%).

2. **Utilization rate** — use `SUM(HOURS_DIRECT) / (SUM(HOURS_DIRECT) + SUM(HOURS_INDIRECT))` at the aggregate level. **Do not** average per-row `UTILIZATION_RATE` column — it's a row-level ratio and the unweighted mean is biased against high-direct weeks.

3. **CPI / SPI portfolio rollup** — weight by `INCURRED_COST_USD`:
   ```sql
   SUM(CPI * INCURRED_COST_USD) / SUM(INCURRED_COST_USD) AS portfolio_cpi
   ```
   Simple average overweights tiny contracts.

4. **Budget variance direction** — positive VARIANCE_USD = **over budget** (bad). Color logic: variance > 0 ⇒ red-indicator text; variance ≤ 0 ⇒ green-indicator text. Chart bars use Blue for positive, Gray for negative (NOT red/green — color rules).

5. **Sole-source concentration** — exclude Tier 1 prime-OEM COTS items from sole-source risk counts unless criticality is Mission Critical. (Not implemented in v1 — documented for Phase 2.)

6. **Fiscal vs calendar year** — all dashboards default to calendar year (YEAR_NUM). Dashboards 1, 2, 4 have a secondary FY toggle that flips to FISCAL_YEAR. September FY-end surge story lives on the Billing dashboard (D4).

## Data quality notes

- **All fact tables have zero NULL DATE_KEY, CONTRACT_KEY, PROGRAM_KEY.** Referential integrity is clean — no defensive COALESCE needed.
- **CPI and SPI are never NULL** on FACT_CONTRACT_REVENUE — they're generated at row-insertion.
- **Subcontractor_pct** on DIM_CONTRACT can be 0 for wholly in-house contracts. Handle 0 as legitimate (not NULL).
- **Defect_qty** is 0 on most PO lines (zero defects). Aggregate as `AVG(DEFECT_QTY)` across all lines — do NOT filter to defect_qty > 0 unless specifically looking at quality incidents.

## "Do not expose" rules

Nothing is classified in this demo dataset. All AGENCY_TYPE=Intel and IS_CLASSIFIED_WORK=TRUE data is synthesized. In a real deployment, dashboards built from this schema would require a classification filter and role-based access.

## Change log

- **2026-04-20** — initial creation during onboarding session.
- **2026-04-20** — BUDGET_VERSION filter added after grain test (non-negotiable).
