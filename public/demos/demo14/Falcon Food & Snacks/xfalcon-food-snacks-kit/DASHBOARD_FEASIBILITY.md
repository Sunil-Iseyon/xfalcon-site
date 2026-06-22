# Dashboard Feasibility Assessment
**xFalcon AnalyticsPro — Food & Snacks CPG**

---

## Executive Summary
All 11 dashboards are **highly feasible** with existing schema. Combined they cover 1.78M POS rows, 145K shipments, 97K inventory snapshots, 9.2K promotions, and 1.4M household purchases across 5 brands and 36 customers.

---

## Dashboard Scoring & Build Effort

### 1. Executive Overview
**Feasibility: 100% | Build Effort: Medium (8-10h)**

**Primary Tables:**
- FACT_POS_SALES (core)
- DIM_PRODUCT, DIM_CUSTOMER, DIM_CHANNEL, DIM_GEOGRAPHY (all dims)

**What Works:**
- YTD/YoY revenue trending (1.13M rows across 6 years)
- Top 10 brands, customers, channels by gross revenue
- Geographic heatmap (58 geographies)
- Promotion performance overlay

**Limitations:**
- FACT_SHIPMENTS not included (separate ops view)
- FACT_HOUSEHOLD_PURCHASE too granular for exec-level roll-up

**Metrics Delivered:**
- Net Revenue, Gross Revenue, Gross Profit, Gross Margin %, Trade Discount %, COGS

---

### 2. Sales & Revenue
**Feasibility: 100% | Build Effort: Medium (10-12h)**

**Primary Tables:**
- FACT_POS_SALES + FACT_SHIPMENTS
- DIM_DATE, DIM_PRODUCT, DIM_CUSTOMER, DIM_CHANNEL

**What Works:**
- POS revenue vs. shipment invoice value correlation (145K shipments)
- YoY/QoQ trending with promotion overlay
- Customer fill rate (avg 95%)
- Channel-level revenue mix

**Limitations:**
- POS and shipment dates may not align perfectly (different transaction types)
- No FACT_TRADE_SPEND linked to revenue attribution

**Metrics Delivered:**
- Net Revenue, COGS, Gross Profit, Fill Rate %, On-Time %

---

### 3. Product Performance
**Feasibility: 100% | Build Effort: Medium (8-10h)**

**Primary Tables:**
- FACT_POS_SALES + DIM_PRODUCT
- DIM_PROMOTION (optional overlay)

**What Works:**
- 105 SKUs ranked by units sold, revenue, margin
- Seasonal product performance (IS_SEASONAL flag)
- Launch/discontinue lifecycle analysis
- Pack size effectiveness

**Limitations:**
- No cost of goods in DIM_PRODUCT (pulled from FACT_POS_SALES COGS)
- Seasonal products only trackable with SEASONAL_MONTHS field

**Metrics Delivered:**
- Units Sold, Gross Revenue, Net Revenue per Unit, Gross Margin %

---

### 4. Product Margin
**Feasibility: 98% | Build Effort: Medium (10-12h)**

**Primary Tables:**
- FACT_POS_SALES + DIM_PRODUCT
- DIM_CHANNEL, DIM_CUSTOMER (optional)

**What Works:**
- Margin by SKU, brand, category with detailed decomposition
- Channel and customer margin variance
- Gross Profit and Gross Margin % trending
- Base price vs. promo price impact

**Limitations:**
- No freight or indirect costs in COGS (only UNIT_COST in DIM_PRODUCT)
- Trade discounts reduce net revenue but are FACT-level (not SKU-level discount rates)

**Metrics Delivered:**
- Gross Revenue, COGS, Gross Profit, Gross Margin %, Trade Discount %, Base Price vs. Promo Price

---

### 5. Customer Intelligence
**Feasibility: 100% | Build Effort: High (12-14h)**

**Primary Tables:**
- FACT_POS_SALES + DIM_CUSTOMER + DIM_CHANNEL
- DIM_PRODUCT, DIM_GEOGRAPHY (optional)

**What Works:**
- 36 customers segmented by tier, type, channel, location
- Customer lifetime revenue, profit, penetration
- Top SKUs per customer
- Channel mix by customer (most customers multi-channel)

**Limitations:**
- No FACT_HOUSEHOLD_PURCHASE at customer level (only geographic aggregation)
- STORE_COUNT available but no individual store POS data

**Metrics Delivered:**
- Net Revenue, Gross Profit, Customer Tier ranking, Repeat Purchase Rate (via HH data)

---

### 6. Channel & POS Analytics
**Feasibility: 100% | Build Effort: High (12-14h)**

**Primary Tables:**
- FACT_POS_SALES + DIM_CHANNEL + DIM_GEOGRAPHY
- DIM_PRODUCT, DIM_CUSTOMER, DIM_PROMOTION

**What Works:**
- 8 channels (some not trackable per DATA_SOURCE flag)
- Revenue by channel, geography, promotion
- Channel group performance
- Regional market tier analysis (Nielsen markets)

**Limitations:**
- DATA_SOURCE flag indicates some channels are not trackable (filter in WHERE clause)
- Household data can overlay to show consumer behavior by channel

**Metrics Delivered:**
- Net Revenue, Gross Profit, Gross Margin %, Trade Discount %, Promotion Participation

---

### 7. Shipments & Fill Rate
**Feasibility: 100% | Build Effort: High (12-14h)**

**Primary Tables:**
- FACT_SHIPMENTS + DIM_CUSTOMER + DIM_SUPPLIER
- DIM_PRODUCT, DIM_GEOGRAPHY, DIM_DATE

**What Works:**
- 145K shipment records across 16 suppliers
- Fill rate trending (avg 95%, down to SKU × customer level)
- On-time performance by customer and supplier
- Shipment value and units shipped
- Supplier risk rating overlay (DIM_SUPPLIER.RISK_RATING)

**Limitations:**
- No cost-of-freight in schema (INVOICE_VALUE includes all costs)
- SHIP_TO_STATE/COUNTRY at fact level (may differ from GEO_KEY origin)

**Metrics Delivered:**
- Cases/Units Shipped, Invoice Value, Fill Rate %, On-Time %, Days On Hand (from FACT_INVENTORY)

---

### 8. Inventory & Operations
**Feasibility: 100% | Build Effort: Medium (10-12h)**

**Primary Tables:**
- FACT_INVENTORY + DIM_PRODUCT
- DIM_CUSTOMER, DIM_GEOGRAPHY, DIM_DATE

**What Works:**
- 97K daily/periodic inventory snapshots (2020-2025)
- Weeks of supply trending (avg 1.5 weeks)
- Out-of-stock and overstock flags at customer × product level
- On-hand, on-order, in-transit visibility
- Days on hand calculation

**Limitations:**
- No cost-of-carrying-inventory or safety stock targets in schema
- Snapshot frequency not documented (assume daily or weekly)

**Metrics Delivered:**
- On-Hand Cases, Weeks of Supply, OOS Rate %, Overstock Flag, Days On Hand

---

### 9. Trade Spend / Promo ROI
**Feasibility: 99% | Build Effort: High (14-16h)**

**Primary Tables:**
- FACT_TRADE_SPEND + DIM_PROMOTION
- DIM_PRODUCT, DIM_CUSTOMER, DIM_GEOGRAPHY

**What Works:**
- 9.2K promotion records (2020-2024)
- Planned vs. actual spend variance
- Incremental lift (baseline vs. total units)
- Promo ROI calculation (INCREMENTAL_REVENUE / ACTUAL_SPEND)
- Cost per incremental unit
- Budget vs. actual trending

**Limitations:**
- Data only through 2024 (FACT_POS_SALES extends to 2025)
- FACT_TRADE_SPEND cannot join directly to FACT_POS_SALES (no fact-to-fact join key); must join through dims
- Baseline units/revenue must be pre-calculated (not stored in POS)

**Metrics Delivered:**
- Planned Spend, Actual Spend, Incremental Units, Promo ROI, Incremental Lift %

---

### 10. Consumer Panel (Household)
**Feasibility: 100% | Build Effort: High (14-16h)**

**Primary Tables:**
- FACT_HOUSEHOLD_PURCHASE + DIM_HOUSEHOLD
- DIM_PRODUCT, DIM_CHANNEL, DIM_GEOGRAPHY

**What Works:**
- 80K households, 1.4M purchase records
- Household penetration by brand, category
- Repeat purchase rate (IS_REPEAT_PURCHASE flag)
- Days since last purchase trending
- Income band, life stage, loyalty tier segmentation
- Geographic household distribution

**Limitations:**
- No FACT_POS_SALES to household linkage (panel data is separate from POS)
- Household-level price sensitivity requires custom cohort analysis

**Metrics Delivered:**
- Units Purchased, Amount Paid, Household Penetration %, Repeat Purchase Rate, Avg Basket Size

---

### 11. Geographic Performance
**Feasibility: 100% | Build Effort: High (12-14h)**

**Primary Tables:**
- FACT_POS_SALES + DIM_GEOGRAPHY
- DIM_PRODUCT, DIM_CUSTOMER, DIM_CHANNEL, DIM_PROMOTION

**What Works:**
- 58 geographies (countries, states, regions)
- Market tier analysis (Nielsen markets, population bands)
- Regional revenue, profit, margin
- Customer presence by geography
- Seasonal patterns by market

**Limitations:**
- Market tier and Nielsen market are reference data (no transactional detail by market tier)
- International/multi-currency not noted in schema (assume USD)

**Metrics Delivered:**
- Net Revenue, Gross Profit, Gross Margin %, Customer Count, Penetration %

---

## Summary Table

| Dashboard | Feasibility | Effort | Primary Fact | Key Dims | Risks |
|-----------|-------------|--------|--------------|----------|-------|
| 1. Executive | 100% | 8-10h | POS_SALES | All 8 | None |
| 2. Sales & Revenue | 100% | 10-12h | POS + SHIP | 6 | Date alignment |
| 3. Product Perf | 100% | 8-10h | POS_SALES | Product | None |
| 4. Product Margin | 98% | 10-12h | POS_SALES | Product | Indirect costs |
| 5. Customer Intel | 100% | 12-14h | POS_SALES | Customer + Chan | No store-level |
| 6. Channel & POS | 100% | 12-14h | POS_SALES | Chan + Geo | Trackability |
| 7. Shipments | 100% | 12-14h | SHIPMENTS | Supplier + Cust | Freight costs |
| 8. Inventory | 100% | 10-12h | INVENTORY | Product + Geo | Snapshot freq |
| 9. Trade Spend | 99% | 14-16h | TRADE_SPEND | Promo + Geo | No 2025 data |
| 10. Consumer Panel | 100% | 14-16h | HH_PURCHASE | Household + Geo | Separate universe |
| 11. Geographic | 100% | 12-14h | POS_SALES | Geo + Dims | Multi-currency |

---

## Build Sequencing Recommendation

**Phase 1 (Weeks 1-2):** Dashboards 1, 3, 8 (core POS, inventory)
**Phase 2 (Weeks 3-4):** Dashboards 2, 4, 6, 11 (sales, margin, channel, geo)
**Phase 3 (Weeks 5-6):** Dashboards 5, 7, 9 (customer, shipments, trade spend)
**Phase 4 (Week 7):** Dashboard 10 (household) — requires separate panel logic

---

## Total Build Effort: **85-98 hours** across 11 dashboards
**Estimated Timeline:** 8-10 weeks (assuming 10h/week capacity)
