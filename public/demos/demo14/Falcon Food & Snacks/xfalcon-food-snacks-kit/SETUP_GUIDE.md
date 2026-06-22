# xFalcon AnalyticsPro Setup Guide
**Food & Snacks CPG | Quick Start & Detailed Configuration**

---

## Quick Start (5 minutes)

### Prerequisites
- BI Tool: Tableau, Power BI, Looker, Qlik, or web dashboard framework
- Database: Access to IDA connector `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`
- Permissions: Read access to all 13 tables
- Browser: Modern browser (Chrome, Firefox, Safari, Edge)

### Step 1: Connect to IDA
```
IDA Connector UUID: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
Database: [Client's data warehouse name]
Tables Required: All 13 (DIM_DATE, DIM_PRODUCT, DIM_CUSTOMER, DIM_CHANNEL, 
                         DIM_GEOGRAPHY, DIM_PROMOTION, DIM_SUPPLIER, DIM_HOUSEHOLD,
                         FACT_POS_SALES, FACT_SHIPMENTS, FACT_INVENTORY, 
                         FACT_TRADE_SPEND, FACT_HOUSEHOLD_PURCHASE)
Refresh Frequency: Daily (recommended) or weekly
```

### Step 2: Import Theme
1. Open `RETAILEDGE_THEME.md`
2. Copy CSS variables to your BI tool's style manager
3. Apply to all dashboards:
   - Background: #F3F4F6
   - Card: #FFFFFF
   - Primary: #006AFF
   - Secondary: #1A7F64
   - Accent gray: #94A3B8

### Step 3: Create Global Filters
Implement filters in `GLOBAL_FILTERS.md`:
- Date Range (with presets: Last 7/30/90 days, YTD)
- Year, Quarter, Month
- Brand, Category, Product
- Customer, Customer Tier, Channel
- Geography (hierarchical)
- Promotion, Supplier, Household Segment

### Step 4: Launch First Dashboard
1. Start with Dashboard 1 (Executive Overview)
2. Build KPI cards: YTD Revenue, YoY Growth, Gross Margin %, Units Sold
3. Add charts: Revenue Trend, Top 10 Products, Channel Mix, Geography Heatmap
4. Test filters work end-to-end
5. Test export to PDF/Excel

**Estimated Time:** 2-3 hours for complete setup

---

## Detailed Setup Instructions

### Phase 1: Data Connection & Validation (2-3 hours)

#### 1.1 Connect IDA Connector
```
BI Tool Setup:
- Create new data source
- Select "IDA Connector" or SQL direct query
- Connector ID: mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb
- Test Connection: Run SELECT COUNT(*) on each table
```

**Validation Queries:**

```sql
-- Check row counts
SELECT 'DIM_DATE' as tbl, COUNT(*) as cnt FROM DIM_DATE
UNION ALL SELECT 'DIM_PRODUCT', COUNT(*) FROM DIM_PRODUCT
UNION ALL SELECT 'DIM_CUSTOMER', COUNT(*) FROM DIM_CUSTOMER
UNION ALL SELECT 'FACT_POS_SALES', COUNT(*) FROM FACT_POS_SALES
UNION ALL SELECT 'FACT_SHIPMENTS', COUNT(*) FROM FACT_SHIPMENTS
UNION ALL SELECT 'FACT_INVENTORY', COUNT(*) FROM FACT_INVENTORY
UNION ALL SELECT 'FACT_TRADE_SPEND', COUNT(*) FROM FACT_TRADE_SPEND
UNION ALL SELECT 'FACT_HOUSEHOLD_PURCHASE', COUNT(*) FROM FACT_HOUSEHOLD_PURCHASE;

-- Expected:
-- DIM_DATE: 2,557
-- DIM_PRODUCT: 105
-- DIM_CUSTOMER: 36
-- FACT_POS_SALES: 1,130,951
-- FACT_SHIPMENTS: 145,082
-- FACT_INVENTORY: 97,152
-- FACT_TRADE_SPEND: 9,243
-- FACT_HOUSEHOLD_PURCHASE: 1,396,413
```

#### 1.2 Check Data Freshness
```sql
-- Last transaction dates
SELECT MAX(FULL_DATE) as latest_pos FROM DIM_DATE dd 
JOIN FACT_POS_SALES ps ON dd.DATE_KEY = ps.DATE_KEY;
-- Expected: 2025-12-31 (or most recent)

SELECT MAX(FULL_DATE) as latest_ship FROM DIM_DATE dd 
JOIN FACT_SHIPMENTS sh ON dd.DATE_KEY = sh.DATE_KEY;
-- Expected: 2025-12-31

SELECT MAX(FULL_DATE) as latest_trade FROM DIM_DATE dd 
JOIN FACT_TRADE_SPEND ts ON dd.DATE_KEY = ts.DATE_KEY;
-- Expected: 2024-12-31 (note: no 2025 data)
```

#### 1.3 Import Reference Data
Create lookup tables in BI tool for fast filtering:
- Brands (5 brands)
- Categories (6 categories)
- Products (105 SKUs)
- Customers (36 customers)
- Channels (8 channels)
- Geographies (58 geographies)

---

### Phase 2: Theme & Layout Configuration (1-2 hours)

#### 2.1 Set Page Background
```css
Page Background: #F3F4F6
Page Padding: 20px (all sides)
Font Family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
```

#### 2.2 Configure Card Styling
```css
Card Background: #FFFFFF
Card Border: 1px solid #E5E7EB
Card Padding: 20px
Card Border Radius: 8px
Card Shadow: 0 1px 3px rgba(0,0,0,0.08)
Card Hover Shadow: 0 4px 6px rgba(0,0,0,0.1)
```

#### 2.3 Set Typography
```css
Page Title: 32px, bold, #0F172A
Section Header: 24px, semibold, #0F172A
Card Title: 18px, semibold, #0F172A
Body Text: 16px, regular, #1F2937
Label: 14px, medium, #6B7280
```

#### 2.4 Chart Styling
```
Line Chart Line: #006AFF (blue)
Bar Chart Bar: #006AFF (primary), #1A7F64 (teal), #94A3B8 (gray)
Pie Chart Slices: Blue, Teal, Gray, Orange, Green (in order)
Grid Lines: #E5E7EB
Axis Labels: #6B7280
```

---

### Phase 3: Global Filter Setup (1-2 hours)

#### 3.1 Create Filter Controls
```
Location: Left sidebar or top filter bar
Style: Dropdowns with search (for >10 values)
Cascading: Brand → Category → Product; Country → State → Market
Default: All values selected (no default filtering)
```

#### 3.2 Implement Filter Logic
All filters use AND logic between filter types, OR logic within:
```sql
WHERE DATE_KEY BETWEEN @START_DATE AND @END_DATE
  AND YEAR_NUM IN (@YEAR_LIST)
  AND QUARTER_NUM IN (@QUARTER_LIST)
  AND (BRAND IN (@BRAND_LIST) OR BRAND IS NULL)
  AND (CHANNEL_NAME IN (@CHANNEL_LIST) OR CHANNEL_NAME IS NULL)
  -- ... etc
```

#### 3.3 Test Filter Interactions
- [ ] Date range preset buttons work
- [ ] Year/Quarter/Month cascade correctly
- [ ] Brand/Category/Product cascade correctly
- [ ] Multi-select filters combine with OR
- [ ] "Clear All" button resets everything
- [ ] Filters persist in URL (link sharing)
- [ ] Filters persist on page refresh

---

### Phase 4: Build Dashboard 1 — Executive Overview (4-5 hours)

#### 4.1 Create KPI Cards
**Row 1: Revenue Metrics**
```sql
-- YTD Net Revenue
SELECT SUM(NET_REVENUE) FROM FACT_POS_SALES 
WHERE DATE_KEY >= @YTD_START_DATE

-- YoY Growth %
SELECT ((SUM(NET_REVENUE) 
  FROM FACT_POS_SALES WHERE YEAR_NUM = @CURRENT_YEAR)
  / (SUM(NET_REVENUE) 
  FROM FACT_POS_SALES WHERE YEAR_NUM = @PRIOR_YEAR) - 1) * 100
```

**Row 2: Profitability**
```sql
-- Gross Margin %
SELECT (SUM(GROSS_PROFIT) / SUM(NET_REVENUE)) * 100 
FROM FACT_POS_SALES

-- Units Sold
SELECT SUM(UNITS_SOLD) FROM FACT_POS_SALES
```

**Row 3: Operations**
```sql
-- Fill Rate (avg)
SELECT AVG(FILL_RATE_PCT) FROM FACT_SHIPMENTS

-- Weeks of Supply (avg)
SELECT AVG(WEEKS_OF_SUPPLY) FROM FACT_INVENTORY
```

#### 4.2 Create Charts
**Chart 1: Revenue Trend (Line Chart)**
```sql
SELECT YEAR_NUM, MONTH_NUM, SUM(NET_REVENUE) as revenue
FROM FACT_POS_SALES
JOIN DIM_DATE ON DATE_KEY
GROUP BY YEAR_NUM, MONTH_NUM
ORDER BY YEAR_NUM, MONTH_NUM
```
Color: #006AFF, X-axis: Month, Y-axis: Revenue (USD)

**Chart 2: Top 10 Products (Bar Chart, Horizontal)**
```sql
SELECT TOP 10 PRODUCT_NAME, SUM(NET_REVENUE) as revenue
FROM FACT_POS_SALES
JOIN DIM_PRODUCT ON PRODUCT_KEY
GROUP BY PRODUCT_NAME
ORDER BY revenue DESC
```
Color: #006AFF, Sorted: Descending

**Chart 3: Channel Mix (Pie Chart)**
```sql
SELECT CHANNEL_NAME, SUM(NET_REVENUE) as revenue
FROM FACT_POS_SALES
JOIN DIM_CHANNEL ON CHANNEL_KEY
GROUP BY CHANNEL_NAME
```
Colors: Blue, Teal, Gray, Orange, Green cycle

**Chart 4: Top 10 Customers (Bar Chart)**
```sql
SELECT TOP 10 CUSTOMER_NAME, SUM(NET_REVENUE) as revenue
FROM FACT_POS_SALES
JOIN DIM_CUSTOMER ON CUSTOMER_KEY
GROUP BY CUSTOMER_NAME
ORDER BY revenue DESC
```

#### 4.3 Apply Global Filters
- Connect all cards/charts to same filter controls
- Test filter application across all elements
- Verify no hardcoded WHERE clauses (all filters are user-driven)

#### 4.4 Add Titles & Descriptions
```
Page Title: "Executive Overview"
Subtitle: "Real-time snapshot of sales, margin, and operations performance"
Card Titles: "YTD Net Revenue", "YoY Growth %", "Gross Margin %", etc.
Chart Titles: "Revenue Trend", "Top 10 Products", "Channel Mix", etc.
```

#### 4.5 Test & Export
- [ ] All filters work independently and together
- [ ] Export to PDF renders correctly (colors, layout)
- [ ] Export to Excel includes data tables
- [ ] Dashboard loads in <5 seconds
- [ ] No SQL errors in console

---

### Phase 5: Build Remaining Dashboards (30-40 hours total)

**Recommended Build Order:**
1. Dashboard 3: Product Performance (6-8h)
2. Dashboard 8: Inventory & Operations (6-8h)
3. Dashboard 2: Sales & Revenue (8-10h)
4. Dashboard 4: Product Margin (8-10h)
5. Dashboard 6: Channel & POS Analytics (8-10h)
6. Dashboard 11: Geographic Performance (8-10h)
7. Dashboard 5: Customer Intelligence (10-12h)
8. Dashboard 7: Shipments & Fill Rate (10-12h)
9. Dashboard 9: Trade Spend / Promo ROI (10-12h)
10. Dashboard 10: Consumer Panel (Household) (10-12h)

See `DASHBOARD_FEASIBILITY.md` for detailed build notes per dashboard.

---

## Troubleshooting

### Issue: "No data returned" on dashboard

**Solution:**
1. Check date range filter — ensure dates are in data (2020-2025)
2. Verify FACT_TRADE_SPEND only has 2020-2024 data
3. Run validation query: `SELECT COUNT(*) FROM FACT_POS_SALES`
4. Check for typos in column/table names

### Issue: Fill Rate/On-Time % shows as NULL

**Solution:**
- FILL_RATE_PCT may have null values; use COALESCE(FILL_RATE_PCT, 0) or AVG(FILL_RATE_PCT)
- ON_TIME_FLAG must be joined from FACT_SHIPMENTS (not in FACT_POS_SALES)

### Issue: Filter shows no options

**Solution:**
1. Check DIM table is loaded (DIM_PRODUCT, DIM_CUSTOMER, etc.)
2. Verify BI tool's data import is complete
3. Cache-clear and refresh data source

### Issue: YoY comparison gives wrong numbers

**Solution:**
- Ensure Year filter includes both current and prior year
- Sum(GROSS_REVENUE) vs. SUM(NET_REVENUE) — use Net for revenue comparisons
- Check for null PROMOTION_KEY (left join, not inner join)

### Issue: Household dashboard shows 0 penetration

**Solution:**
- FACT_HOUSEHOLD_PURCHASE is separate universe from POS
- DIM_HOUSEHOLD has 80,000 members; POS has 36 customers
- Use COUNT(DISTINCT HOUSEHOLD_KEY) / (SELECT COUNT(*) FROM DIM_HOUSEHOLD WHERE IS_ACTIVE = 1)

### Issue: Geographic heatmap not rendering

**Solution:**
1. Join FACT_POS_SALES → GEO_KEY → DIM_GEOGRAPHY.GEO_KEY
2. Map to country/state code (STATE_CODE or COUNTRY_CODE)
3. Ensure chart supports geographic rendering (Tableau, Power BI do)

### Issue: Chart colors not matching theme

**Solution:**
- Primary Blue: #006AFF (RGB 0, 106, 255)
- Teal: #1A7F64 (RGB 26, 127, 100)
- Gray: #94A3B8 (RGB 148, 163, 184)
- Copy exact hex values (not design approximations)

---

## Performance Tuning

### Query Optimization
```sql
-- Good: aggregate before joining (reduces rows)
SELECT p.BRAND, SUM(ps.NET_REVENUE) as revenue
FROM FACT_POS_SALES ps
JOIN DIM_PRODUCT p ON ps.PRODUCT_KEY = p.PRODUCT_KEY
WHERE ps.DATE_KEY BETWEEN @START AND @END
GROUP BY p.BRAND

-- Bad: join then filter (processes all rows first)
SELECT p.BRAND, SUM(ps.NET_REVENUE) as revenue
FROM FACT_POS_SALES ps
JOIN DIM_PRODUCT p ON ps.PRODUCT_KEY = p.PRODUCT_KEY
GROUP BY p.BRAND
WHERE SUM(ps.NET_REVENUE) > 10000
```

### Indexing Recommendations
```sql
CREATE INDEX idx_pos_date ON FACT_POS_SALES(DATE_KEY);
CREATE INDEX idx_pos_product ON FACT_POS_SALES(PRODUCT_KEY);
CREATE INDEX idx_pos_customer ON FACT_POS_SALES(CUSTOMER_KEY);
CREATE INDEX idx_pos_channel ON FACT_POS_SALES(CHANNEL_KEY);
CREATE INDEX idx_pos_geo ON FACT_POS_SALES(GEO_KEY);
```

### Refresh Schedule
- FACT_POS_SALES: Daily (overnight)
- FACT_SHIPMENTS: Daily
- FACT_INVENTORY: Weekly (snapshots are point-in-time)
- FACT_TRADE_SPEND: Monthly
- FACT_HOUSEHOLD_PURCHASE: Weekly

---

## User Training

**For End Users (Sales, Marketing, Finance):**
1. Dashboard tour (10 min): explain KPIs, how to use filters
2. Filter walkthrough: Brand, Channel, Customer, Date Range
3. Export/sharing: how to download PDF, share link
4. Q&A: common questions

**For Analysts:**
1. Data schema overview: read `DATA_SCHEMA_MAP.md`
2. Metric definitions: reference `METRIC_DEFINITIONS.md`
3. Query templates: write custom SQL using examples in METRIC_DEFINITIONS
4. Troubleshooting: use Troubleshooting section above

**For Administrators:**
1. Data refresh schedule and monitoring
2. Filter/drill-down customization
3. Access control (row-level security if needed)
4. Adding new users or dashboards

---

## Success Checklist

**Setup Complete When:**
- [ ] All 13 tables connected and validated
- [ ] Theme colors applied to all dashboards
- [ ] Global filters implemented and tested
- [ ] Dashboard 1 (Executive Overview) is live and tested
- [ ] At least 2 additional dashboards built
- [ ] All 11 dashboards have detailed build plans in backlog
- [ ] User training completed
- [ ] Refresh schedule configured
- [ ] Export (PDF/Excel) tested
- [ ] Documentation (this guide + schema map) shared with team

---

## Support & Escalation

**For Issues:**
1. Check Troubleshooting section above
2. Review `DATA_SCHEMA_MAP.md` for table/column definitions
3. Run validation queries to confirm data integrity
4. If problem persists, escalate with:
   - Dashboard name
   - Steps to reproduce
   - Expected vs. actual result
   - SQL query (if applicable)

**Contacts:**
- Technical: [Your DBA/BI Admin]
- Business: [Your analytics manager]
