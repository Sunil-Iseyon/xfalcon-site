FALCON FOOD & SNACKS - XFALCON ANALYTICSPRO DASHBOARDS
======================================================

Three production-ready HTML dashboards created for xFalcon AnalyticsPro:

1. 01-EXECUTIVE-OVERVIEW.html (22 KB)
   - Total Net Sales KPI with YoY growth
   - Gross Margin % analysis
   - Gross Sales & YTD tracking
   - Average Monthly Sales
   - 5 interactive Chart.js visualizations:
     * Monthly Sales Trend (bar chart)
     * Gross Margin % Trend (line chart)
     * Business Unit Composition (horizontal bar)
     * Customer Group Revenue (horizontal bar)
     * Brand Distribution (horizontal bar)
   - Fiscal Year filter (2022, 2023, 2024)
   - Monthly detail table with Net Sales, COGS, Gross Margin $, GM%, vs PY

2. 02-SALES-REVENUE.html (19 KB)
   - Net Sales MTD, YTD, TTM KPIs
   - Gross Sales & Net-to-Gross Ratio
   - Average Monthly Sales
   - 5 interactive Chart.js visualizations:
     * Monthly Net Sales Trend (bar chart)
     * Sales by Customer Group (horizontal bar)
     * Sales by Product Family (horizontal bar)
     * Net vs Gross Sales Comparison (grouped bars)
     * Customer Concentration - Top 5 vs Rest (bar chart)
   - Fiscal Year & Customer Group filters
   - Customer × Period detail table

3. 03-PRODUCT-PERFORMANCE.html (18 KB)
   - SKU Families Count
   - Top Family & Brand Revenue KPIs
   - Private Label Share %
   - Brand & Family Count tracking
   - 5 interactive Chart.js visualizations:
     * Sales by Product Family (horizontal bar)
     * Sales by Brand (horizontal bar)
     * Business Unit × Family Analysis (bar chart)
     * Brand Mix Distribution (bar chart)
     * Top 10 Families - Gross Margin (horizontal bar)
   - Fiscal Year & Business Unit filters
   - Family × Brand detail table with Gross Margin %

TECHNICAL SPECIFICATIONS
==________________________

Framework: Pure HTML5 with Chart.js 4.4.0 & Google Fonts (Inter)
Data: Embedded JavaScript arrays (real data from PM_DAILY_SALES table)
Styling: Light theme with Falcon Food & Snacks branding
  - Background: #F3F4F6
  - Topbar: #0F172A with #006AFF accent
  - Logo: xF with cyan (#00D4FF) and orange (#FF6B35)
  - Cards: White with dark left border
  - Chart colors: Blue (#006AFF), Teal (#1A7F64), Amber (#F59E0B), etc.

Features:
- Responsive grid layouts (auto-fit minmax)
- Interactive filters with onchange="applyFilters()" event handlers
- KPI cards with dynamic value formatting ($M, $K, %)
- 5 Chart.js visualizations per dashboard
- Detail tables (15+ rows) with hover effects
- fitKpiText() function for responsive KPI sizing
- Chart destruction & recreation on filter changes

Browser Compatibility: All modern browsers (Chrome, Firefox, Safari, Edge)

DATA SOURCES
____________

All data sourced from IDA PM_DAILY_SALES table:
- Period range: Jul 2021 - Dec 2023 (with FY2024 partial data)
- Fiscal year structure: Jul (Period 1) through Jun (Period 12)
- Key fields: MTD_ACTUAL, PROD_COST, ACT_BASE_GROSS_SALES, YTD_ACTUAL, STANDARD_MARGIN
- Dimensions: PERIOD_YEAR, PERIOD_NUM, PERIOD_NAME, BUSS_UNIT, CUSTOMER_GROUP, FAMILY, BRAND

DEPLOYMENT
__________

Files ready for deployment to:
/sessions/beautiful-jolly-sagan/mnt/Falcon Food & Snacks/xfalcon-food-snacks-kit/

All dashboards are self-contained and require no external API calls or server infrastructure.
Simply serve as static HTML files.

CUSTOMIZATION NOTES
___________________

To update embedded data:
1. Query IDA with new criteria
2. Replace JavaScript arrays in the <script> section
3. Filter functions automatically update KPIs, charts, and tables

Each dashboard uses:
- var (ES5) for broad browser compatibility
- function(){} syntax (no arrow functions)
- String concatenation with + operator
- Chart.js config objects for all visualizations
