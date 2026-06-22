# Business Analytics Dashboard & QBR Generator

## Overview

This skill generates a complete analytics suite from any connected database:
- **11 interactive HTML dashboards** with Chart.js visualizations, dark theme, and year/quarter filters
- **Quarterly Business Review (QBR) presentations** in PPTX format with data-driven recommendations
- **Index page** linking all dashboards together

The entire output is self-contained — dashboards are single-file HTML with embedded data, and QBRs are standalone PPTX files.

## Prerequisites

- IDA MCP tools connected to a database (or any SQL-queryable data source)
- Node.js runtime available
- PptxGenJS installed (`npm install pptxgenjs`)

## Files in This Package

| File | Purpose |
|------|---------|
| `SKILL.md` | This guide — full workflow instructions |
| `generate-dashboards.js` | Node.js script that generates all HTML dashboards from config.json |
| `generate-qbr.js` | Node.js script that generates QBR PPTX presentations from config.json |
| `sample-config.json` | Example config with sample data showing the expected schema |

---

## WORKFLOW: End-to-End Generation

### Phase 1: Database Discovery

Use IDA tools to discover what tables and columns are available.

**Step 1.1: List all tables**
```
ida_get_knowledge(knowledge_type='tables', detail_level='names')
```

**Step 1.2: Identify relevant tables**

Look for tables/views matching these business domains. Common naming patterns:

| Domain | Common Table Names |
|--------|--------------------|
| Executive / Financial | `VW_EXECUTIVE_SUMMARY`, `FACT_FINANCIALS`, `VW_FINANCIAL_OVERVIEW` |
| Sales | `VW_SALES_PERFORMANCE`, `FACT_SALES`, `VW_SALES_SUMMARY` |
| Inventory | `VW_INVENTORY_HEALTH`, `FACT_INVENTORY`, `VW_STOCK_LEVELS` |
| Supply Chain | `VW_SUPPLY_CHAIN`, `FACT_PROCUREMENT`, `VW_SUPPLIER_PERFORMANCE` |
| Production | `VW_PRODUCTION_EFFICIENCY`, `FACT_PRODUCTION`, `VW_MANUFACTURING` |
| Quality | `VW_QUALITY_COMPLIANCE`, `FACT_QUALITY`, `VW_QA_METRICS` |
| Marketing | `VW_MARKETING_ROI`, `FACT_MARKETING`, `VW_CAMPAIGN_PERFORMANCE` |
| ESG | `VW_ESG_SCORECARD`, `FACT_SUSTAINABILITY`, `VW_ENVIRONMENTAL` |
| Forecast | `FACT_DEMAND_FORECAST`, `VW_FORECAST_ACCURACY` |

**Step 1.3: Get schema for each identified table**
```
ida_get_knowledge(knowledge_type='schema', table_name='TABLE_NAME')
```

**Step 1.4: Check for annotations and memories**
```
ida_get_annotations(table_name='TABLE_NAME')
ida_get_memories(tables='TABLE_NAME')
```

### Phase 2: Schema Mapping

Map discovered columns to the standard config.json fields. This is the most critical step.

**IMPORTANT: Column names vary across databases.** Common pitfalls:
- Year column might be `YEAR_NUM`, `FISCAL_YEAR`, `YEAR`, `YR`
- Quarter column might be `QUARTER_NUM`, `FISCAL_QUARTER`, `QTR`, `QUARTER`
- Revenue might be `NET_REVENUE_USD`, `REVENUE`, `TOTAL_REVENUE`, `SALES_AMOUNT`

**Standard field mapping template:**

```json
{
  "executiveSummary": {
    "year": "→ map to year column",
    "quarter": "→ map to quarter column",
    "netRevenue": "→ SUM of revenue column",
    "grossProfit": "→ SUM of gross profit column",
    "avgMarginPct": "→ AVG of margin % column",
    "ebitda": "→ SUM of EBITDA column",
    "netProfit": "→ SUM of net profit column",
    "totalUnits": "→ SUM of units column",
    "totalOrders": "→ COUNT of orders",
    "mktSpend": "→ SUM of marketing spend column"
  },
  "salesByCategory": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "category": "→ product category/type column",
    "revenue": "→ SUM of revenue column",
    "units": "→ SUM of units column"
  },
  "salesByChannel": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "channel": "→ sales channel column",
    "revenue": "→ SUM of revenue column"
  },
  "salesByRegion": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "region": "→ geographic region column",
    "revenue": "→ SUM of revenue column"
  },
  "inventoryHealth": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "daysOfStock": "→ AVG days of stock/inventory",
    "stockouts": "→ SUM stockout occurrences",
    "stockoutRatePct": "→ AVG stockout rate %",
    "slowMoving": "→ SUM slow-moving items",
    "nearExpiry": "→ SUM near-expiry units",
    "expired": "→ SUM expired units",
    "avgInvValue": "→ AVG inventory value"
  },
  "supplyChain": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "avgLeadDays": "→ AVG lead time days",
    "lateDeliveryPct": "→ AVG late delivery %",
    "rejectionPct": "→ AVG rejection/defect rate %",
    "reliabilityRating": "→ AVG supplier reliability score",
    "totalOrders": "→ COUNT/SUM purchase orders",
    "lateDeliveries": "→ SUM late deliveries",
    "totalCost": "→ SUM procurement cost"
  },
  "productionEfficiency": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "utilizationPct": "→ AVG capacity utilization %",
    "yieldPct": "→ AVG yield rate %",
    "defectPct": "→ AVG defect rate %",
    "downtimeHrs": "→ SUM downtime hours",
    "costPerUnit": "→ AVG cost per unit",
    "unitsProduced": "→ SUM units produced",
    "recalledBatches": "→ SUM recalled batches"
  },
  "qualityCompliance": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "passRatePct": "→ AVG inspection pass rate %",
    "fdaViolations": "→ SUM FDA/regulatory violations",
    "recalls": "→ SUM product recalls",
    "recallUnits": "→ SUM recalled units",
    "labelingIssues": "→ SUM labeling/packaging issues",
    "unitsInspected": "→ SUM units inspected",
    "fdaViolationRatePct": "→ AVG violation rate %"
  },
  "marketingROI": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "roi": "→ AVG marketing ROI",
    "cpa": "→ AVG cost per acquisition",
    "cvrPct": "→ AVG conversion rate %",
    "ctrPct": "→ AVG click-through rate %",
    "totalSpend": "→ SUM marketing spend",
    "attributedRevenue": "→ SUM attributed revenue",
    "budgetUtilPct": "→ AVG budget utilization %"
  },
  "esgScorecard": {
    "year": "→ year column",
    "quarter": "→ quarter column",
    "carbonTonnes": "→ SUM carbon emissions (tonnes)",
    "waterM3": "→ SUM water usage (cubic meters)",
    "renewablePct": "→ AVG renewable energy %",
    "wasteKg": "→ SUM waste (kg)",
    "ecoPackagingPct": "→ AVG eco-packaging %",
    "glassRecycled": "→ SUM glass recycled units",
    "bottlesReturned": "→ SUM bottles returned/collected"
  }
}
```

### Phase 3: Data Extraction

For each business domain, run IDA queries to extract the data. Always GROUP BY year and quarter columns.

**CRITICAL: Before querying, always:**
1. Call `ida_get_memories(tables='TABLE_NAME')` to check for required filters
2. Call `ida_get_annotations(table_name='TABLE_NAME')` to check for caveats
3. Call `ida_estimate_rows(sql='YOUR_QUERY')` to verify result size

**Query Templates:**

```sql
-- Executive Summary
SELECT [YEAR_COL], [QUARTER_COL],
  SUM([REVENUE_COL]) as netRevenue,
  SUM([GROSS_PROFIT_COL]) as grossProfit,
  AVG([MARGIN_COL]) as avgMarginPct,
  SUM([EBITDA_COL]) as ebitda,
  SUM([NET_PROFIT_COL]) as netProfit,
  SUM([UNITS_COL]) as totalUnits,
  SUM([MKT_SPEND_COL]) as mktSpend
FROM [EXECUTIVE_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- Sales by Category
SELECT [YEAR_COL], [QUARTER_COL], [CATEGORY_COL] as category,
  SUM([REVENUE_COL]) as revenue,
  SUM([UNITS_COL]) as units
FROM [SALES_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL], [CATEGORY_COL]
ORDER BY [YEAR_COL], [QUARTER_COL], revenue DESC

-- Sales by Channel
SELECT [YEAR_COL], [QUARTER_COL], [CHANNEL_COL] as channel,
  SUM([REVENUE_COL]) as revenue
FROM [SALES_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL], [CHANNEL_COL]
ORDER BY [YEAR_COL], [QUARTER_COL], revenue DESC

-- Sales by Region
SELECT [YEAR_COL], [QUARTER_COL], [REGION_COL] as region,
  SUM([REVENUE_COL]) as revenue
FROM [SALES_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL], [REGION_COL]
ORDER BY [YEAR_COL], [QUARTER_COL], revenue DESC

-- Inventory Health
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(AVG([DAYS_OF_STOCK_COL]), 1) as daysOfStock,
  SUM([STOCKOUT_COL]) as stockouts,
  ROUND(AVG([STOCKOUT_RATE_COL]), 2) as stockoutRatePct,
  SUM([SLOW_MOVING_COL]) as slowMoving,
  SUM([NEAR_EXPIRY_COL]) as nearExpiry,
  SUM([EXPIRED_COL]) as expired,
  ROUND(AVG([INV_VALUE_COL]), 0) as avgInvValue
FROM [INVENTORY_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- Supply Chain
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(AVG([LEAD_TIME_COL]), 1) as avgLeadDays,
  ROUND(AVG([LATE_DELIVERY_COL]), 1) as lateDeliveryPct,
  ROUND(AVG([REJECTION_COL]), 2) as rejectionPct,
  ROUND(AVG([RELIABILITY_COL]), 2) as reliabilityRating,
  SUM([ORDERS_COL]) as totalOrders,
  SUM([LATE_ORDERS_COL]) as lateDeliveries,
  ROUND(SUM([COST_COL]), 0) as totalCost
FROM [SUPPLY_CHAIN_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- Production Efficiency
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(AVG([UTILIZATION_COL]), 1) as utilizationPct,
  ROUND(AVG([YIELD_COL]), 1) as yieldPct,
  ROUND(AVG([DEFECT_COL]), 2) as defectPct,
  ROUND(SUM([DOWNTIME_COL]), 0) as downtimeHrs,
  ROUND(AVG([COST_PER_UNIT_COL]), 2) as costPerUnit,
  SUM([UNITS_PRODUCED_COL]) as unitsProduced,
  SUM([RECALLED_COL]) as recalledBatches
FROM [PRODUCTION_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- Quality & Compliance
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(AVG([PASS_RATE_COL]), 1) as passRatePct,
  SUM([VIOLATIONS_COL]) as fdaViolations,
  SUM([RECALLS_COL]) as recalls,
  SUM([RECALL_UNITS_COL]) as recallUnits,
  SUM([LABELING_COL]) as labelingIssues,
  SUM([INSPECTED_COL]) as unitsInspected,
  ROUND(AVG([VIOLATION_RATE_COL]), 2) as fdaViolationRatePct
FROM [QUALITY_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- Marketing ROI
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(AVG([ROI_COL]), 2) as roi,
  ROUND(AVG([CPA_COL]), 2) as cpa,
  ROUND(AVG([CVR_COL]), 2) as cvrPct,
  ROUND(AVG([CTR_COL]), 2) as ctrPct,
  ROUND(SUM([SPEND_COL]), 0) as totalSpend,
  ROUND(SUM([ATTRIBUTED_REV_COL]), 0) as attributedRevenue,
  ROUND(AVG([BUDGET_UTIL_COL]), 1) as budgetUtilPct
FROM [MARKETING_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]

-- ESG & Sustainability
SELECT [YEAR_COL], [QUARTER_COL],
  ROUND(SUM([CARBON_COL]), 1) as carbonTonnes,
  ROUND(SUM([WATER_COL]), 0) as waterM3,
  ROUND(AVG([RENEWABLE_COL]), 1) as renewablePct,
  ROUND(SUM([WASTE_COL]), 0) as wasteKg,
  ROUND(AVG([ECO_PACKAGING_COL]), 1) as ecoPackagingPct,
  SUM([GLASS_RECYCLED_COL]) as glassRecycled,
  SUM([BOTTLES_RETURNED_COL]) as bottlesReturned
FROM [ESG_TABLE]
GROUP BY [YEAR_COL], [QUARTER_COL]
ORDER BY [YEAR_COL], [QUARTER_COL]
```

**NOTE:** Not all databases will have all domains. If a table doesn't exist, leave that data section as an empty array `[]` in config.json. The generators handle missing data gracefully.

### Phase 4: Build config.json

Combine all extracted data into a single config.json file:

```json
{
  "company": "[Company Name from user or database]",
  "division": "[Division Name]",
  "outputDir": "./",
  "theme": {
    "bgDark": "#0D0D0D",
    "bgCard": "#1A1A1A",
    "bgCardLight": "#222222",
    "primary": "#7CB701",
    "secondary": "#95D600",
    "textWhite": "#FFFFFF",
    "textGray": "#9B999B",
    "danger": "#FF4444",
    "warning": "#FFB800",
    "info": "#00BCD4",
    "purple": "#9C27B0",
    "orange": "#FF6F00",
    "success": "#4CAF50"
  },
  "data": {
    "executiveSummary": [... query results ...],
    "salesByCategory": [... query results ...],
    "salesByChannel": [... query results ...],
    "salesByRegion": [... query results ...],
    "inventoryHealth": [... query results ...],
    "supplyChain": [... query results ...],
    "productionEfficiency": [... query results ...],
    "qualityCompliance": [... query results ...],
    "marketingROI": [... query results ...],
    "esgScorecard": [... query results ...]
  }
}
```

Save this file alongside the generator scripts.

### Phase 5: Generate Dashboards

```bash
# Install dependencies (if not already)
npm install pptxgenjs

# Generate HTML dashboards
node generate-dashboards.js config.json

# Generate QBR presentations (last 2 quarters)
node generate-qbr.js config.json

# Or generate a specific quarter
node generate-qbr.js config.json --quarter 4 --year 2025
```

### Phase 6: Verify Output

After generation:
1. Check that all HTML files were created in the output directory
2. Open index.html to verify the landing page
3. Spot-check 2-3 dashboards for correct data and working filters
4. Convert QBR PPTX to PDF for visual QA:
   ```bash
   python3 /path/to/soffice.py --convert-to pdf QBR_Q4_2025.pptx
   pdftoppm -jpeg -r 150 QBR_Q4_2025.pdf QBR_preview
   ```
5. Review key slides (title, executive summary, recommendations) for data accuracy

---

## THEME CUSTOMIZATION

To change the color scheme, modify the `theme` object in config.json. All colors are used consistently across both dashboards and QBR presentations.

Example alternative themes:

**Corporate Blue:**
```json
{
  "bgDark": "#0A1628", "bgCard": "#132238", "bgCardLight": "#1C2E4A",
  "primary": "#2196F3", "secondary": "#42A5F5", "textWhite": "#FFFFFF",
  "textGray": "#90A4AE", "danger": "#F44336", "warning": "#FF9800",
  "info": "#00BCD4", "purple": "#7C4DFF", "orange": "#FF6D00", "success": "#4CAF50"
}
```

**Emerald Green:**
```json
{
  "bgDark": "#0D1F0D", "bgCard": "#1A2E1A", "bgCardLight": "#223A22",
  "primary": "#00E676", "secondary": "#69F0AE", "textWhite": "#FFFFFF",
  "textGray": "#A5D6A7", "danger": "#FF5252", "warning": "#FFD740",
  "info": "#40C4FF", "purple": "#B388FF", "orange": "#FFAB40", "success": "#00E676"
}
```

---

## HANDLING MISSING DATA

The generators are designed to work with partial data. If your database doesn't have a particular domain (e.g., no ESG data), simply leave that array empty:

```json
"esgScorecard": []
```

The dashboard generator will show "No data available" for that dashboard, and the QBR generator will show placeholder content on the corresponding slide.

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Column not found | Check schema with `ida_get_knowledge(knowledge_type='schema', table_name='X')` |
| Wrong year/quarter format | Verify column names: could be YEAR_NUM, FISCAL_YEAR, YEAR, etc. |
| Empty query results | Check date ranges in data with `SELECT DISTINCT year_col, quarter_col FROM table` |
| PptxGenJS not found | Run `npm install pptxgenjs` in the script directory |
| Charts not rendering | Verify Chart.js CDN is accessible; data arrays must not be empty |
| PPTX shadow errors | Use factory function `makeShadow()` — PptxGenJS mutates shadow objects |
