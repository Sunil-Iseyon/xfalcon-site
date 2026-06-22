# Falcon Semiconductor — Dashboard Feasibility Matrix

**Generated:** 2026-04-21
**Data source:** IDA connector `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__`
**Schema:** 6 dimension tables + 6 fact tables, fiscal Oct-Sep, FY2019–FY2026 (FY26 partial)

## Scoring Legend

| Score | Status | Meaning |
|-------|--------|---------|
| 90–100% | READY | All core KPIs available, minimal workarounds |
| 50–89% | PARTIAL | Core metrics available, some gaps or estimations |
| 20–49% | LIMITED | Major data missing, reduced-scope only |
| 0–19% | BLOCKED | Cannot build — critical data absent |

## Dashboard Portfolio

| # | Dashboard | Score | Status | Primary Sources | Effort |
|---|-----------|-------|--------|-----------------|--------|
| 1 | Executive Overview | 95% | READY | All 6 facts + all dims | 0.5 day |
| 2 | Bookings & Backlog | 95% | READY | FACT_ORDERS, FACT_BACKLOG | 0.5 day |
| 3 | Revenue & Margin Deep-Dive | 100% | READY | FACT_SHIPMENTS | 0.5 day |
| 4 | Product Performance | 95% | READY | FACT_SHIPMENTS, DIM_PRODUCT | 0.5 day |
| 5 | End-Market Analysis | 90% | READY | FACT_SHIPMENTS + DIM_CUSTOMER + DIM_END_MARKET | 0.5 day |
| 6 | Customer & Channel | 95% | READY | FACT_SHIPMENTS, DIM_CUSTOMER, DIM_CHANNEL | 0.5 day |
| 7 | Design-Win Pipeline | 100% | READY | FACT_DESIGN_WINS | 0.5 day |
| 8 | Fab & Supply Chain | 100% | READY | FACT_SUPPLY_CHAIN, DIM_FAB | 0.5 day |
| 9 | Inventory Health | 95% | READY | FACT_INVENTORY | 0.5 day |
| 10 | Lead Time & Fulfillment | 85% | PARTIAL | FACT_ORDERS, FACT_SHIPMENTS | 0.75 day |
| 11 | Weekly Business Review | 85% | PARTIAL | Multi-fact | 0.75 day |
| — | AutoExplore Insight Report | — | READY | All tables | 1 day |

**Total build effort:** ~7 days for full kit.

---

## 1. Executive Overview — 95% READY

**Purpose:** C-suite single-page snapshot. Revenue, margin, B:B ratio, design wins, inventory health, top risks.

**Works completely:**
- Revenue (FACT_SHIPMENTS.REVENUE) with YoY trend FY19-FY25
- GM% (FACT_SHIPMENTS.GROSS_MARGIN / REVENUE) — validated 50.3% consistent
- B:B ratio (FACT_BACKLOG.BOOK_TO_BILL_RATIO) — FY25 avg 1.077
- Design-win pipeline count + value (FACT_DESIGN_WINS)
- Top 5 end markets, customers, products
- Bookings trend (FACT_ORDERS, excluding Sample)

**Limitations:** None significant.

**Sample query:**
```sql
SELECT d.FISCAL_YEAR,
       ROUND(SUM(s.REVENUE)/1e6, 1) AS revenue_musd,
       ROUND(100.0 * SUM(s.GROSS_MARGIN)/NULLIF(SUM(s.REVENUE),0), 2) AS gm_pct
FROM FACT_SHIPMENTS s
JOIN DIM_DATE d ON s.DATE_KEY = d.DATE_KEY
GROUP BY d.FISCAL_YEAR ORDER BY d.FISCAL_YEAR;
```

## 2. Bookings & Backlog — 95% READY

**Purpose:** Demand-health signal. Bookings, B:B, backlog age, past-due.

**Works completely:**
- Bookings by FY/FQ/month (FACT_ORDERS.ORDER_VALUE, exclude Sample)
- B:B ratio by period (FACT_BACKLOG.BOOK_TO_BILL_RATIO) — industry standard chart
- Backlog aging (FACT_BACKLOG.AVERAGE_AGE_DAYS) — confirmed 28-31 days steady
- Past-due quantity tracking (FACT_BACKLOG.PAST_DUE_QTY)
- Order priority mix (Normal/High/Critical)
- Order type mix (Standard/Blanket/Expedite/NPI)

**Limitations:** No order-cancellation reason codes visible. Past-due reason is not captured — only quantity.

## 3. Revenue & Margin Deep-Dive — 100% READY

**Purpose:** Product marketing & finance view. Revenue & GM% by every cut.

**Works completely:**
- Revenue by end market, channel, product category, customer segment, region
- GM% by same cuts — surprising finding: GM% is nearly uniform at 50.3% across channels (commission is absorbed upstream)
- ASP trends (FACT_SHIPMENTS.UNIT_PRICE and DIM_PRODUCT.BASE_ASP)
- Ship method mix and cost
- Fab attribution for margin (via FACT_SHIPMENTS.FAB_KEY)

## 4. Product Performance — 95% READY

**Purpose:** Product marketing. Family/category performance, lifecycle, ASP.

**Works completely:**
- Revenue and units by CATEGORY_CODE (MCU/MEM/PWR/RF/SEN/OPT/ANA/FPGA/INT/DIS)
- Lifecycle-stage revenue mix (Active/Mature/EOL/NRND)
- Automotive-qualified product revenue share (IS_AUTOMOTIVE_QUALIFIED)
- Pareto analysis — top 20% of 284 SKUs
- Package type distribution

**Limitations:** Product hierarchy above CATEGORY (business unit) is represented but may be sparse.

## 5. End-Market Analysis — 90% READY

**Purpose:** Strategic end-market mix vs targets.

**Works completely:**
- Revenue share by 8 end markets (via DIM_CUSTOMER.END_MARKET_CODE → DIM_END_MARKET)
- Share target vs actual variance (DIM_END_MARKET.MARKET_SHARE_TARGET)
- Growth-rate comparison (DIM_END_MARKET.GROWTH_RATE)
- **Flagged finding:** Automotive at 48.8% of FY25 revenue vs 28% target — extreme overweight

**Limitations:** FACT_ORDERS has END_MARKET_KEY directly, but FACT_SHIPMENTS does NOT — end-market for revenue must be derived via DIM_CUSTOMER.END_MARKET_CODE join. This works but is one-to-one per customer; customers selling into multiple end markets are flattened to their primary.

**Join path documented:**
```sql
FACT_SHIPMENTS → DIM_CUSTOMER.CUSTOMER_KEY → DIM_CUSTOMER.END_MARKET_CODE → DIM_END_MARKET
```

## 6. Customer & Channel — 95% READY

**Purpose:** Sales & account management.

**Works completely:**
- Customer segmentation (Tier 1/2 OEM, ODM, CM, Design House, Startup) revenue
- Channel mix (DIRECT 34.5%, DISTI 45.6% via 8 named distributors, OEM 14.9%, ONLINE 5.1%)
- Top-N customer revenue concentration
- Account-manager book-of-business
- Geographic revenue (REGION, STATE_CODE — 49 states, CA 18.7%, TX 12.9%)
- Credit rating × revenue (risk view)

## 7. Design-Win Pipeline — 100% READY

**Purpose:** Future revenue visibility. Sales & product marketing.

**Works completely:**
- 7-stage funnel (Prospect → Engage → Eval → Design → Qual → Prod → EOL)
- Probability-weighted pipeline value
- Competitor displacement (Intel, TI, NXP, Broadcom, etc.)
- New socket vs competitive displacement ratio (35/65)
- Design cycle months by product category
- Pipeline by end market and customer segment

## 8. Fab & Supply Chain — 100% READY

**Purpose:** Manufacturing operations.

**Works completely:**
- Fab utilization by month × fab (peaked 95.6% FY21, dipped 69.4% FY23)
- Yield rate by fab and process node
- Cycle time trending
- Cost per die trend
- Internal vs external fab mix
- Wafer starts/outs comparison
- SiC / specialty partner tracking

## 9. Inventory Health — 95% READY

**Purpose:** Supply chain ops. Weeks of supply, channel inventory.

**Works completely:**
- Weeks of supply by channel (DIRECT, Arrow, Avnet, Digi-Key)
- On-hand, in-transit, on-order balances
- Inventory value trending
- Stockout risk (WoS < 2 weeks)
- Excess inventory flags (WoS > 16 weeks)

**Limitations:** FACT_INVENTORY covers 200 products × 4 channels (not all 284 SKUs or all 11 channels). Assumption: the 200-product and 4-channel subset represent high-volume/top channels. Document as a data caveat.

## 10. Lead Time & Fulfillment — 85% PARTIAL

**Purpose:** Operations & customer success. On-time delivery, lead-time trends.

**Works:**
- Quoted lead time by product/period (FACT_ORDERS.LEAD_TIME_DAYS, avg 43.7 days)
- Ship-method mix (FACT_SHIPMENTS.SHIP_METHOD)
- Fab origin analysis

**Partial:**
- **No order-to-ship linkage** — FACT_ORDERS and FACT_SHIPMENTS don't share a common order ID. Cannot compute true on-time delivery % per order; can only compare aggregate order vs ship volumes per period.
- **Workaround:** Compute period-level OTD proxy as Shipped Qty / (Shipped + Past Due) by month. Flag this is a proxy, not per-order truth.

## 11. Weekly Business Review — 85% PARTIAL

**Purpose:** Single Monday-morning page.

**Works:**
- Weekly revenue, bookings, shipments (aggregable from date_key + DIM_DATE)
- Channel, product category, end-market weekly KPI tiles
- In-stock rate via FACT_INVENTORY Monday snapshots
- Top products this week

**Partial:**
- DIM_DATE has no WEEK_NUMBER or ISO_WEEK column in summary — may need to derive via `DATE_TRUNC('week', FULL_DATE)` in PG or equivalent.
- Forecast/plan data absent — vs-Plan comparisons not possible. Use vs LY and vs PW only.

## — AutoExplore Insight Report — READY

**Purpose:** Evidence-driven pattern discovery beyond standard dashboards.

**Suggested themes (directed explorations):**
1. **"What's driving the FY23 correction?"** — inventory, end market, customer segments, channel, order-type shifts
2. **"Automotive overconcentration risk"** — which customers/products/fabs are exposed? Who's growing in non-AUTO?
3. **"Design-win → revenue conversion"** — which pipeline stages convert fastest? Which competitor displacements actually ship?
4. **"Fab utilization vs cost efficiency"** — which nodes give best $/die at target yields?

Recommendation: pick 1–2 themes and run 20 iterations each.

---

## Critical Caveats Summary

1. **B:B ratio must come from FACT_BACKLOG.BOOK_TO_BILL_RATIO** — computing from `FACT_ORDERS.ORDER_VALUE / FACT_SHIPMENTS.REVENUE` yields ~2.2 in FY25 (vs true ~1.08) because FACT_ORDERS includes multi-period blanket/expedite orders. Saved as IDA memory.
2. **Global filter:** `FACT_ORDERS.ORDER_TYPE <> 'Sample'` applies to all bookings/order-value queries. Saved as IDA memory.
3. **End-market for revenue:** must be joined via DIM_CUSTOMER.END_MARKET_CODE, not FACT_SHIPMENTS directly (no END_MARKET_KEY on shipments).
4. **Lead-time data is quote-time, not actual** — on-time delivery must be a proxy, not per-order truth.
5. **FACT_INVENTORY covers 200/284 products and 4/11 channels** — a representative subset, not complete coverage.
6. **FY label format:** DIM_DATE.FISCAL_YEAR returns as `'FY25 '` with potential trailing whitespace. Use TRIM() or `LIKE 'FY25%'` if exact-match fails.

## Validation Benchmarks

These values should reproduce across every dashboard that filters to FY25:

| Metric | Expected FY25 Value | Source |
|--------|---------------------|--------|
| Revenue | $3.71B | FACT_SHIPMENTS query |
| Gross Margin $ | $1.87B | FACT_SHIPMENTS query |
| GM % | 50.33% | FACT_SHIPMENTS query |
| Bookings (excl Sample) | $8.22B | FACT_ORDERS query |
| Avg B:B Ratio | 1.077 | FACT_BACKLOG query |
| Automotive share | 48.8% | End-market query |
| DIRECT channel share | 34.5% | Channel query |
| DISTI channel share | 45.6% | Channel query |
