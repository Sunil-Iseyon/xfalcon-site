# Metric Definitions & KPI Library
**xFalcon AnalyticsPro — Food & Snacks CPG**

---

## Revenue Metrics

### Net Revenue
**Definition:** Actual revenue received after trade discounts and deductions  
**SQL Formula:**
```sql
SUM(GROSS_REVENUE - TRADE_DISCOUNT)
-- or
SUM(NET_REVENUE)
```
**Unit:** USD  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer, Channel, Geography  
**2024 Annual:** $21.6M  
**2025 Annual:** $31.5M (YoY +45.8%)

---

### Gross Revenue
**Definition:** Revenue at list price before any discounts or deductions  
**SQL Formula:**
```sql
SUM(UNITS_SOLD * UNIT_LIST_PRICE)
-- or
SUM(GROSS_REVENUE)
```
**Unit:** USD  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer, Channel  
**Note:** Used to calculate discount impact (= Gross - Net)

---

### Cost of Goods Sold (COGS)
**Definition:** Direct manufacturing and materials cost of sold products  
**SQL Formula:**
```sql
SUM(UNITS_SOLD * UNIT_COST)
-- or
SUM(COGS)
```
**Unit:** USD  
**Direction:** Lower is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer  
**Note:** Does not include freight, warehousing, or indirect overhead

---

### Gross Profit
**Definition:** Net revenue minus cost of goods sold  
**SQL Formula:**
```sql
SUM(NET_REVENUE - COGS)
-- or
SUM(GROSS_PROFIT)
```
**Unit:** USD  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer, Channel  
**Formula:** NET_REVENUE - COGS

---

### Gross Margin %
**Definition:** Gross profit as a percentage of net revenue  
**SQL Formula:**
```sql
(SUM(GROSS_PROFIT) / SUM(NET_REVENUE)) * 100
-- or
AVG(GROSS_MARGIN_PCT)
```
**Unit:** Percent (0-100)  
**Direction:** Higher is better (target: 45-55% for snacks)  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Brand, Channel  
**Note:** Varies by product (cookies ~50%, confections ~40%)

---

### Trade Discount %
**Definition:** Trade discounts as a percentage of gross revenue  
**SQL Formula:**
```sql
(SUM(TRADE_DISCOUNT) / SUM(GROSS_REVENUE)) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Lower is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Customer, Product  
**Note:** Higher for large retailers (Tier1); use to negotiate terms

---

### Net Revenue per Unit
**Definition:** Average revenue realized per unit sold  
**SQL Formula:**
```sql
SUM(NET_REVENUE) / SUM(UNITS_SOLD)
```
**Unit:** USD per unit  
**Direction:** Higher is better (reflects mix and pricing)  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer  
**Interpretation:** Price realization after discounts

---

## Volume Metrics

### Units Sold
**Definition:** Total units (individual items) sold in period  
**SQL Formula:**
```sql
SUM(UNITS_SOLD)
```
**Unit:** Units (count)  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer, Channel  
**Note:** 1 case = multiple units (varies by SKU; see UNITS_PER_CASE)

---

### Cases Sold
**Definition:** Total shipping cases sold in period  
**SQL Formula:**
```sql
SUM(CASES_SOLD)
```
**Unit:** Cases (count)  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Product, Customer  
**Note:** Useful for supply chain planning

---

## Supply Chain Metrics

### Fill Rate %
**Definition:** Percentage of requested units fulfilled in shipments  
**SQL Formula:**
```sql
SUM(CASES_SHIPPED) / SUM(CASES_REQUESTED) * 100
-- or
AVG(FILL_RATE_PCT)
```
**Unit:** Percent (0-100)  
**Direction:** Higher is better (target: >95%)  
**Grain:** Fact_Shipments  
**Typical Filters:** Year, Month, Supplier, Customer, Product  
**Benchmark:** Current avg 95% across all suppliers

---

### On-Time %
**Definition:** Percentage of shipments delivered by promised date  
**SQL Formula:**
```sql
SUM(CASE WHEN ON_TIME_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Higher is better (target: >90%)  
**Grain:** Fact_Shipments  
**Typical Filters:** Year, Month, Supplier, Customer  
**Note:** ON_TIME_FLAG is pre-calculated in warehouse

---

### Units Shipped
**Definition:** Total units distributed to customers in period  
**SQL Formula:**
```sql
SUM(UNITS_SHIPPED)
```
**Unit:** Units (count)  
**Direction:** N/A (informational)  
**Grain:** Fact_Shipments  
**Typical Filters:** Year, Month, Supplier, Customer  
**2025 Invoice Value:** $281M (avg 4.7M units)

---

### Invoice Value
**Definition:** Total shipment value (net of freight and deductions)  
**SQL Formula:**
```sql
SUM(NET_INVOICE_VALUE)
```
**Unit:** USD  
**Direction:** N/A (informational)  
**Grain:** Fact_Shipments  
**Typical Filters:** Year, Month, Supplier, Customer  
**Note:** Excludes promotional freight allowances

---

## Inventory Metrics

### Weeks of Supply (WOS)
**Definition:** Number of weeks of inventory on hand based on recent sell-through  
**SQL Formula:**
```sql
AVG(WEEKS_OF_SUPPLY)
```
**Unit:** Weeks (decimal)  
**Direction:** 1.5-2.5 weeks optimal (target: <2)  
**Grain:** Fact_Inventory  
**Typical Filters:** Year, Month, Customer, Product  
**Benchmark:** Current avg 1.5 weeks (tight inventory)

---

### Days on Hand
**Definition:** Number of days of inventory available at current demand  
**SQL Formula:**
```sql
AVG(DAYS_ON_HAND)
```
**Unit:** Days  
**Direction:** 7-14 days optimal  
**Grain:** Fact_Inventory  
**Typical Filters:** Year, Month, Customer, Product  
**Calculation:** (ON_HAND_CASES / AVG_DAILY_USAGE) × UNITS_PER_CASE

---

### Out-of-Stock Rate %
**Definition:** Percentage of time/locations where inventory is zero  
**SQL Formula:**
```sql
SUM(CASE WHEN OUT_OF_STOCK_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Lower is better (target: <2%)  
**Grain:** Fact_Inventory  
**Typical Filters:** Year, Month, Customer, Product, Channel  
**Note:** Correlates with lost sales

---

### Overstock Rate %
**Definition:** Percentage of time/locations where inventory exceeds safety stock target  
**SQL Formula:**
```sql
SUM(CASE WHEN OVERSTOCK_FLAG = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Lower is better (target: <5%)  
**Grain:** Fact_Inventory  
**Typical Filters:** Year, Month, Customer, Product  
**Note:** Increases holding costs and risk of obsolescence

---

## Promotion & Trade Spend Metrics

### Promo ROI
**Definition:** Return on investment from promotional spend; incremental revenue per dollar spent  
**SQL Formula:**
```sql
(SUM(INCREMENTAL_REVENUE) / SUM(ACTUAL_SPEND)) * 100
-- or
SUM(PROMO_ROI) / COUNT(*)
```
**Unit:** Percent (ROI%)  
**Direction:** Higher is better (target: >200%)  
**Grain:** Fact_Trade_Spend  
**Typical Filters:** Year, Month, Brand, Promotion_Type  
**Interpretation:** 200% ROI = $2 incremental revenue per $1 spent

---

### Incremental Lift %
**Definition:** Percentage increase in units sold due to promotion vs. baseline  
**SQL Formula:**
```sql
(SUM(INCREMENTAL_UNITS) / SUM(BASELINE_UNITS)) * 100
```
**Unit:** Percent (0-500%+)  
**Direction:** Higher is better  
**Grain:** Fact_Trade_Spend  
**Typical Filters:** Year, Month, Promotion_Type, Brand, Customer  
**Note:** BOGO typically 150-250% lift; price discount 50-100%

---

### Planned vs. Actual Spend Variance
**Definition:** Difference between budgeted and actual promotional investment  
**SQL Formula:**
```sql
SUM(ACTUAL_SPEND - PLANNED_SPEND)
-- Variance %:
((SUM(ACTUAL_SPEND) - SUM(PLANNED_SPEND)) / SUM(PLANNED_SPEND)) * 100
```
**Unit:** USD or Percent  
**Direction:** Near zero optimal (within +/- 10%)  
**Grain:** Fact_Trade_Spend  
**Typical Filters:** Year, Month, Brand, Promotion_Code  
**Note:** >20% overruns signal poor planning or execution

---

### Cost per Incremental Unit
**Definition:** Promotional cost required to drive one additional unit of sales  
**SQL Formula:**
```sql
SUM(ACTUAL_SPEND) / SUM(INCREMENTAL_UNITS)
```
**Unit:** USD per unit  
**Direction:** Lower is better  
**Grain:** Fact_Trade_Spend  
**Typical Filters:** Year, Month, Promotion_Type, Brand  
**Note:** Compare across promotions to optimize budget allocation

---

### Actual Spend
**Definition:** Total promotional investment spent in period  
**SQL Formula:**
```sql
SUM(ACTUAL_SPEND)
```
**Unit:** USD  
**Direction:** N/A (informational)  
**Grain:** Fact_Trade_Spend  
**Typical Filters:** Year, Month, Brand, Customer  

---

## Consumer / Household Metrics

### Household Penetration %
**Definition:** Percentage of panel households purchasing brand/category in period  
**SQL Formula:**
```sql
COUNT(DISTINCT HOUSEHOLD_KEY) / (SELECT COUNT(DISTINCT HOUSEHOLD_KEY) FROM DIM_HOUSEHOLD WHERE IS_ACTIVE = 1) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Higher is better  
**Grain:** Fact_Household_Purchase  
**Typical Filters:** Year, Month, Brand, Category  
**Benchmark:** Crestview Biscuits ~45-50% penetration

---

### Repeat Purchase Rate %
**Definition:** Percentage of household purchases that are repeat (not first-time)  
**SQL Formula:**
```sql
SUM(CASE WHEN IS_REPEAT_PURCHASE = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100
```
**Unit:** Percent (0-100)  
**Direction:** Higher is better (loyalty indicator)  
**Grain:** Fact_Household_Purchase  
**Typical Filters:** Year, Month, Brand, Category, Income_Band  
**Note:** 60%+ indicates strong loyalty; <40% signals churn risk

---

### Avg Basket Size
**Definition:** Average dollar amount spent per shopping occasion  
**SQL Formula:**
```sql
SUM(AMOUNT_PAID) / COUNT(DISTINCT DATE_KEY || HOUSEHOLD_KEY || CHANNEL_KEY)
```
**Unit:** USD per transaction  
**Direction:** Higher is better  
**Grain:** Fact_Household_Purchase  
**Typical Filters:** Year, Month, Channel, Brand, Income_Band  
**Note:** Varies by channel (online avg $45, retail avg $28)

---

### Units Purchased per Household
**Definition:** Average units bought per household in period  
**SQL Formula:**
```sql
SUM(UNITS_PURCHASED) / COUNT(DISTINCT HOUSEHOLD_KEY)
```
**Unit:** Units per household  
**Direction:** Higher is better (consumption rate)  
**Grain:** Fact_Household_Purchase  
**Typical Filters:** Year, Month, Brand, Category  

---

### Days Since Last Purchase
**Definition:** Average days elapsed between repeat purchases  
**SQL Formula:**
```sql
AVG(DAYS_SINCE_LAST_PURCHASE)
```
**Unit:** Days  
**Direction:** Lower is better (higher frequency = loyalty)  
**Grain:** Fact_Household_Purchase  
**Typical Filters:** Brand, Category, Income_Band  
**Interpretation:** 21-28 days = weekly shoppers; 60+ days = infrequent

---

## Composite Metrics

### Revenue per SKU
**Definition:** Total net revenue divided by number of unique products sold  
**SQL Formula:**
```sql
SUM(NET_REVENUE) / COUNT(DISTINCT PRODUCT_KEY)
```
**Unit:** USD per SKU  
**Direction:** Higher is better (revenue concentration)  
**Grain:** Fact_POS_Sales  

---

### Revenue per Customer
**Definition:** Total net revenue divided by number of unique customers  
**SQL Formula:**
```sql
SUM(NET_REVENUE) / COUNT(DISTINCT CUSTOMER_KEY)
```
**Unit:** USD per customer  
**Direction:** Higher is better (customer value)  
**Grain:** Fact_POS_Sales  
**Typical Filters:** Year, Month, Channel  

---

### Market Share (by Revenue)
**Definition:** Brand/Product revenue as % of total company revenue  
**SQL Formula:**
```sql
SUM(NET_REVENUE) FILTER (WHERE BRAND = 'Crestview Biscuits') / SUM(NET_REVENUE) * 100
```
**Unit:** Percent  
**Direction:** Higher is better  
**Grain:** Fact_POS_Sales  
**Brands:** Crestview Biscuits (~35%), Sunrise Bars (~25%), Prairie Pantry (~20%), etc.

---

### Inventory Turns (Annual)
**Definition:** Number of times inventory is completely sold and replenished per year  
**SQL Formula:**
```sql
SUM(COGS) / AVG(ON_HAND_CASES * UNIT_COST)
```
**Unit:** Turns per year  
**Direction:** Higher is better (efficiency)  
**Target:** 12-24 turns annually (monthly replenishment)  
**Grain:** Fact_Inventory + Fact_POS_Sales

---

## Key Filter Dimensions

All metrics support filtering by:
- **Year** (2020-2025)
- **Quarter** (Q1-Q4)
- **Month** (January-December)
- **Week** (ISO week number)
- **Brand** (Crestview, Sunrise, Crestfield, Morning Ridge, Prairie Pantry)
- **Category** (Biscuits & Cookies, Snack Bars, Confectionery, Cereal, Frozen Meals, Condiments)
- **Product / SKU** (105 unique products)
- **Customer** (36 customers, by tier/type)
- **Channel** (8 channels; filter by IS_TRACKABLE)
- **Geography** (58 geographies; by country, state, market tier, Nielsen DMA)
- **Promotion** (Discount, BOGO, Bundle, Loyalty, etc.)
- **Household Segment** (Income, Life Stage, Loyalty Tier, Panel Segment)

---

## Notes on Calculation Consistency

1. **Grain Mismatch:** Fact_Trade_Spend (2020-2024) excludes 2025; join carefully
2. **Household Universe:** Fact_Household_Purchase is separate from POS; 80K panel members ≠ total customers
3. **Fill Rate:** Requires comparison to requested units (not stored; often pre-calculated)
4. **Seasonal:** Use IS_SEASONAL flag and SEASONAL_MONTHS to isolate seasonal products
5. **Active Products:** Filter IS_ACTIVE = 1 to exclude discontinued SKUs from trending
6. **Trackable Channels:** Filter IS_TRACKABLE = 1 in DIM_CHANNEL to avoid estimation bias
