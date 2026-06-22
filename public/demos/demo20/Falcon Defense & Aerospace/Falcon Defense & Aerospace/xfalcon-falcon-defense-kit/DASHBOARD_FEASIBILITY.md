# Dashboard Feasibility Matrix — Falcon Defense & Aerospace

**Assessment date:** 2026-04-20
**Data window:** 2020-01-01 to 2024-12-31 (5 full calendar years)
**Fiscal calendar:** US Federal FY (Oct–Sep) — 1,826 dates in DIM_DATE
**Dashboards requested:** 8 (all)
**Overall readiness:** 8 of 8 READY (90–100%)

## Scoring scale

| Score | Status | Meaning |
|-------|--------|---------|
| 90–100% | READY | All core KPIs available, minimal workarounds |
| 50–89% | PARTIAL | Core metrics available, some gaps |
| 20–49% | LIMITED | Major data missing, reduced-scope only |
| 0–19% | BLOCKED | Cannot build — critical data absent |

## Matrix

| # | Dashboard | Score | Status | Primary sources | Effort |
|---|-----------|-------|--------|-----------------|--------|
| 1 | Executive Overview | 100% | READY | FACT_CONTRACT_REVENUE, FACT_PROGRAM_BUDGET, DIM_PROGRAM, DIM_CUSTOMER_AGENCY | 0.5 d |
| 2 | Program Financial Performance | 100% | READY | FACT_PROGRAM_BUDGET (Revised only), DIM_PROGRAM, DIM_COST_ELEMENT | 0.5 d |
| 3 | Earned Value Management (CPI/SPI) | 95% | READY | FACT_CONTRACT_REVENUE (CPI/SPI fields), DIM_CONTRACT, DIM_PROGRAM | 0.5 d |
| 4 | Billing vs Incurred Cost Reconciliation | 100% | READY | FACT_CONTRACT_REVENUE (billed/recognized/incurred), DIM_DATE | 0.5 d |
| 5 | Agency & Program Revenue Roll-ups | 100% | READY | FACT_CONTRACT_REVENUE, DIM_CUSTOMER_AGENCY, DIM_PROGRAM, BRIDGE_CONTRACT_PROGRAM | 0.5 d |
| 6 | Supply Chain Performance | 100% | READY | FACT_PARTS_SUPPLY, DIM_SUPPLIER, DIM_PARTS | 0.5 d |
| 7 | Labor Utilization & Workforce | 100% | READY | FACT_LABOR_HOURS, DIM_EMPLOYEE, DIM_FACILITY | 0.5 d |
| 8 | Contract Portfolio Health | 95% | READY | DIM_CONTRACT (CEILING, FUNDED, period of perf), FACT_CONTRACT_REVENUE | 0.5 d |

**Total build effort:** ~4 days for all 8 dashboards + portal + AutoExplore.

---

## 1. Executive Overview — 100% READY

**Purpose:** Single-page portfolio snapshot for CFO / CEO / BoD.

**What works completely:**
- Billed / Recognized Revenue / Incurred Cost / Fee Earned by year (validated: 2024 = $61.79B recognized rev)
- Program count, contract count, active employees, active suppliers
- Top 5 programs by revenue, top 5 agencies by revenue
- Portfolio EVM averages (CPI, SPI)
- Budget vs Actual (Revised version) totals
- Backlog proxy = SUM(FUNDED_VALUE_MN) — SUM(recognized revenue to date) per active contract
- Monthly revenue trend with Sep FY-end surge visible
- Compare Years toggle (5 years of data)

**Known limitations:**
- None for v1. All core KPIs computable.

**Key queries:** See `QUERY_TEMPLATES.sql` section 1.

---

## 2. Program Financial Performance — 100% READY

**Purpose:** PMO view of Budget vs Actual vs Forecast by program × cost element.

**What works completely:**
- Budget / Actual / Forecast / Variance USD and % by program (Revised baseline only)
- Cost-element breakdown (Direct Labor, Materials, Subcontract, Overhead, G&A, Fee)
- Original vs Revised baseline shift (secondary chart — unfiltered BUDGET_VERSION for variance analysis)
- EAC vs funded value — burn-down view
- Monthly cadence of spend vs plan
- Program-level drill into cost element detail table
- Approval status (IS_APPROVED flag)

**Required filter:** `WHERE BUDGET_VERSION = 'Revised'` on all headline metrics. Grain test confirmed 2× inflation without it. Original baseline shown only in the "Baseline Shift" comparison section.

---

## 3. Earned Value Management (CPI/SPI) — 95% READY

**Purpose:** Program-manager operational health.

**What works completely:**
- Portfolio-level CPI and SPI by program (2024: all 15 programs fall in 0.95–0.97 CPI range, 0.95 SPI)
- Red/Yellow/Green health tiers (>1.00 green, 0.95–1.00 yellow, <0.95 red)
- CPI × SPI scatter with program labels
- CPI/SPI trending by month over 5 years
- Contract-level drill (top-25 at-risk contracts table)
- Cost Variance USD and Schedule Variance USD derived from BCWP/ACWP

**Known limitations:**
- BCWP/BCWS/ACWP are not stored as separate fields — CPI/SPI are stored directly per row. We compute portfolio averages weighted by incurred cost. This is standard EVM roll-up methodology but means we can't show raw EV curves from first principles. For a demo this is sufficient; for audit-grade EVM a direct BCWP feed would be needed. (Flagged on dashboard disclaimer.)

---

## 4. Billing vs Incurred Cost Reconciliation — 100% READY

**Purpose:** CFO cash/AR view.

**What works completely:**
- Billed vs Recognized Revenue vs Incurred Cost by month × year
- Billing lag (Recognized − Billed by quarter)
- Fee realization % = Fee / Recognized Revenue
- September FY-end surge highlighted (confirmed: Sep consistently highest in 5-year history)
- Revenue-type split: Prime / Modification / Task Order
- Agency-level billing pace

---

## 5. Agency & Program Revenue Roll-ups — 100% READY

**Purpose:** Customer-mix and portfolio diversification view.

**What works completely:**
- Revenue by agency (2024: Army $14.0B, Navy $13.0B, AF $10.8B lead) — Treemap + ranked bar
- Revenue by program (15 programs, ARES-HERMES leads 2024 at $6.05B)
- Revenue by domain (Air / Land / Sea / Space / Cyber / Multi-Domain)
- Revenue type mix (Prime 67% / Mod 23% / Task Order 20% — approx)
- Classified vs unclassified agency mix (DIM_CUSTOMER_AGENCY.IS_CLASSIFIED)
- 5-year trends per agency/program with Compare Years toggle
- Bridge_contract_program validated: all 400 contracts currently 100% allocated to 1 program

---

## 6. Supply Chain Performance — 100% READY

**Purpose:** Procurement + supply chain risk dashboard.

**What works completely:**
- OTD % by supplier tier (T1: 95.5%, T2: 87.3%, T3: 79.2% — clear tier stratification)
- First-Pass Yield trend
- Purchase Price Variance (unit_price vs standard catalog cost)
- Defect qty and defect rate by supplier + part category
- Sole-source concentration (IS_SOLE_SOURCE on DIM_PARTS — 28.3% of parts)
- MIL-SPEC vs COTS mix (63.6% MIL-SPEC)
- DCAA approval status coverage
- Lead time reliability (DAYS_EARLY_LATE distribution)
- Top 20 at-risk suppliers table (low OTD, low quality, high volume)

---

## 7. Labor Utilization & Workforce — 100% READY

**Purpose:** HR / operations workforce health.

**What works completely:**
- Direct labor utilization % (UTILIZATION_RATE) trending weekly
- Hours: direct / indirect / overtime split by week
- Utilization by job family, clearance level, facility
- Classified vs unclassified hours split (65% unclassified / 35% classified by volume)
- Labor cost direct + indirect
- Headcount capacity vs charge hours by facility (15 facilities)
- Overtime burn rate
- Employee filter: active only (89.8% active)

---

## 8. Contract Portfolio Health — 95% READY

**Purpose:** Business development / contracting officer view.

**What works completely:**
- Contract type mix (FFP 32% / CPFF 20% / CPIF 18% / CPAF 12% / T&M 8% / IDIQ 6% / FPI 4%)
- Ceiling vs Funded vs Incurred by contract type — waterfall view
- Period-of-Performance expiry radar (bins: expired, 0–90d, 90–180d, 180–365d, >365d)
- Set-aside mix (8(a), SDVOSB, WOSB, HUBZone, Small Business, Unrestricted)
- Prime vs Sub (IS_PRIME)
- Subcontractor % distribution
- Vehicle mix (IDIQ, GSA Schedule, BOA, single-award)
- Agency-contract matrix

**Known limitations:**
- DIM_CONTRACT has no IS_ACTIVE flag. "Active contract" filter is derived: `PERIOD_OF_PERF_END >= CURRENT_DATE`. Today = 2026-04-20. This correctly identifies contracts still in their period of performance. Documented in `GLOBAL_FILTERS.md`.

---

## AutoExplore — Supply Chain Vulnerabilities

Runs after dashboards ship. 20 directed-mode iterations across FACT_PARTS_SUPPLY + DIM_SUPPLIER + DIM_PARTS. Outputs:
- `autoexplore-dashboard.html` — Evidence dashboard with ~5–8 finding cards
- `autoexplore-memo.html` — Long-form memo with numbered findings + recommended actions
- `autoexplore-journal.md` — Hypothesis log

Linked from portal under "Insight Reports".
