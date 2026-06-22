# Falcon Finance — Project Build Skill

This skill contains everything needed to build, modify, or extend dashboards and deliverables for the Falcon Finance project without re-running discovery or onboarding. Read this file before touching any dashboard, chart, or presentation in this project.

## Project Summary

| Item | Value |
|------|-------|
| Project Name | Falcon Finance |
| Entity | Apex Financial Group |
| Domain | Consumer Credit Card & BNPL |
| Database | PostgreSQL (schema: `public`) |
| Data Range | Jan 2019 – Dec 2025 (7 years) |
| Fiscal Year | April – March |
| Tables | 14 (5 Fact + 9 Dimension) |
| Dashboards | 11 + Portal (10 core + 1 QBR) |
| Theme | Light — Bread Financial inspired (#1D3557 navy + #E63946 coral) |

---

## Schema Quick Reference

### Fact Tables

- `public.FACT_TRANSACTIONS` — Credit card/BNPL transactions (purchases, payments, returns, cash advances)
- `public.FACT_CREDIT_ACCOUNTS` — Monthly account snapshots (balance, utilization, interest, fees)
- `public.FACT_BNPL_ORDERS` — BNPL-specific orders (GMV, merchant fees, delinquency)
- `public.FACT_DELINQUENCY` — Delinquency events (DPD buckets, charge-offs, recoveries, collections)
- `public.FACT_PARTNER_PERFORMANCE` — Retail partner metrics (sales, accounts, interchange, revenue share)

### Dimension Tables

- `public.DIM_DATE` — Calendar dimension (DATE_KEY, CALENDAR_YEAR, CALENDAR_MONTH, MONTH_NAME, etc.)
- `public.DIM_CUSTOMER` — Customer demographics (age, income, FICO, loyalty segment, acquisition channel)
- `public.DIM_PRODUCT` — Credit products (product name, type, subtype)
- `public.DIM_RETAIL_PARTNER` — Partners (name, category, tier)
- `public.DIM_GEOGRAPHY` — Geography (state, CENSUS_REGION, urban/rural) — **NOT** `REGION`, use `CENSUS_REGION`
- `public.DIM_CHANNEL` — Transaction channels (online, in-store, mobile, etc.)
- `public.DIM_CREDIT_TIER` — Credit tier classification (tier name, risk category)
- `public.DIM_DELINQUENCY_BUCKET` — DPD bucket definitions (BUCKET_KEY, BUCKET_NAME, BUCKET_CATEGORY)
- `public.DIM_COLLECTION_STATUS` — Collection status definitions

### Critical Column Names (Common Mistakes)

These column names are NOT what you might assume — always verify against schema:

| Wrong Assumption | Correct Column | Table |
|------------------|----------------|-------|
| `OUTSTANDING_BALANCE` | `CURRENT_BALANCE` | FACT_CREDIT_ACCOUNTS |
| `INTEREST_INCOME` | `INTEREST_CHARGED` | FACT_CREDIT_ACCOUNTS |
| `TOTAL_SALES` | `TOTAL_CREDIT_SALES` | FACT_PARTNER_PERFORMANCE |
| `NUMBER_OF_ACCOUNTS` | Does not exist | FACT_DELINQUENCY (use COUNT(*)) |
| `REGION` | `CENSUS_REGION` | DIM_GEOGRAPHY |
| `MERCHANT_FEE` | `MERCHANT_FEE_AMOUNT` | FACT_BNPL_ORDERS |

### Critical Join Notes

1. **Schema prefix:** Always `public.TABLE_NAME` — the IDA default `fpublic.` is broken
2. **Delinquency bucket join:** `FACT_DELINQUENCY.DELINQUENCY_BUCKET_KEY = DIM_DELINQUENCY_BUCKET.BUCKET_KEY` (column names differ!)
3. **Date join:** All facts join to DIM_DATE via `DATE_KEY`
4. **Transaction amounts:** Positive for purchases/advances, negative for payments/returns

### Fiscal Year Derivation

```sql
CASE WHEN d.CALENDAR_MONTH >= 4 THEN d.CALENDAR_YEAR ELSE d.CALENDAR_YEAR - 1 END AS FISCAL_YEAR
```

Q1 = Apr–Jun, Q2 = Jul–Sep, Q3 = Oct–Dec, Q4 = Jan–Mar

### IDA Connector Notes

- **Use `mcp__ida__`** for all Falcon Finance queries — this is the correct connector
- **Do NOT use `mcp__f1b68233...`** — that connector has unrelated healthcare data (DIM_PATIENT, FACT_ENCOUNTER, etc.)
- IDA may drop connection on complex queries with MIN/MAX on large result sets — simplify queries if this happens
- Always call `ida_get_knowledge(knowledge_type='schema', table_name='TABLE')` before writing queries to verify column names
- Pre-aggregate queries to < 200 rows before embedding data in dashboards

---

## Theme Rules

### Colors

| Element | Value | Notes |
|---------|-------|-------|
| Page Background | `#FFFFFF` | |
| Card Background | `#FAFBFC` | |
| Card Border | `#ECEEF1` | |
| Topbar | `#1D3557` (Deep Navy) | White text |
| Logo "x" | `#A8DADC` (Ice) | |
| Logo "F" | `#E63946` (Coral) | |
| Primary Text | `#1E293B` | |
| Secondary Text | `#64748B` | Subtext, descriptions |
| Chart Blue | `#006AFF` | Primary/actual/current year |
| Chart Teal | `#1A7F64` | Secondary/prior year/comparison |
| Chart Gray | `#94A3B8` | Baseline/tertiary |
| Chart Light Blue | `#0EA5E9` | Extended — use sparingly |
| Chart Amber | `#F59E0B` | Extended — use sparingly |
| KPI Positive | `#2E7D32` | **KPI text ONLY** — never in chart datasets |
| KPI Negative | `#D32F2F` | **KPI text ONLY** — never in chart datasets |

**CRITICAL:** Red (#D32F2F) and Green (#2E7D32) must NEVER appear as chart bar fills, line colors, or dataset colors. If a chart needs a "negative" color, use Amber (#F59E0B). If it needs a "positive" color, use Teal (#1A7F64). This was a QA finding in dashboard 06 (Collections) where red/green were incorrectly used in chart datasets and had to be replaced.

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| KPI Label | 12px | 600 | #5F6B7A |
| KPI Value | 28px | 700 | #1D3557 |
| KPI Comparison | 12–13px | 500 | #2E7D32 or #D32F2F |
| Chart Title | 16px | 700 | #1D3557 |
| Table Header | 13px | 600 | #F1FAEE on #1D3557 background |
| Table Body | 13px | 400 | #1A1A2E |
| Section Title | 18px | 700 | #1D3557 |
| Topbar Title | 16px | 600 | #F1FAEE |
| Back Link | 14px | 400 | #A8DADC |
| Font Family | Inter | from Google Fonts CDN | |

### Table Header Standard

All data tables must use dark navy headers — NOT light gray:

```css
.detail-table th {
  background: #1D3557;
  color: #F1FAEE;
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
}
```

**Do NOT** use: `background: #F1F5F9`, `color: #5F6B7A`, `text-transform: uppercase`, or `letter-spacing` on table headers. These were QA fixes applied across all dashboards.

---

## Technical Build Rules

### JavaScript Compatibility

All dashboard JS must be ES5-safe:
- **`var` only** — no `const` or `let`
- **`function(){}` only** — no arrow functions (`=>`)
- **String concatenation only** — no template literals (backtick strings)
- **`String(value)`** before DOM insertion — never implicit coercion

### Chart.js Setup

- **CDN:** `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`
- **mk() helper:** Use for Chart.js instance management to avoid canvas reuse errors

Standard mk() pattern (preferred):
```javascript
function mk(id, cfg) {
  var el = document.getElementById(id);
  if (!el) return null;
  return new Chart(el.getContext('2d'), cfg);
}
```

### Chart Design Rules

1. Use Blue (#006AFF) as default for any single-dataset chart
2. Use Teal (#1A7F64) for secondary comparisons (prior year, budget)
3. Use Gray (#94A3B8) for baselines and tertiary data
4. Use dashed lines (`borderDash: [5, 5]`) for budget/prior year lines
5. Never exceed 5 colors in a single chart
6. Never use red or green in chart datasets — only in KPI text
7. No pie/doughnut charts — use horizontal bars for part-to-whole

### X-Axis Label Alignment (Critical Bug Fix)

When showing Year-over-Year (YoY) comparisons with two 12-month datasets on the same chart, the x-axis labels must match the dataset length.

**WRONG:** Using `monthsAll` (24 labels like `['Jan 24', 'Feb 24', ... 'Dec 25']`) with 12-item datasets — this plots both year lines on the first 12 labels only, leaving the right half of the chart empty.

**CORRECT:** Use `months12` (12 labels like `['Jan', 'Feb', ... 'Dec']`) and overlay both datasets (CY and PY) on the same 12-label axis.

```javascript
var months12 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthsAll = months12.map(function(m) { return m + ' 24'; }).concat(months12.map(function(m) { return m + ' 25'; }));
```

- Use `months12` for YoY comparison charts (2 datasets, 12 points each)
- Use `monthsAll` for full 24-month trend charts (1 dataset, 24 points)

### Flat Data Prevention

When querying IDA for chart data, watch for values that look identical across categories or time periods. Common causes:

1. **Rounding:** Utilization rate `0.38, 0.38, 0.38, 0.38` — actually `38.02, 37.86, 37.84, 37.82` when you keep decimals. Use percentage values (multiply by 100) and zoom the axis with `min`/`max` on the y-axis scale.
2. **Wrong aggregation level:** Getting portfolio-level aggregates instead of per-category breakdowns (e.g., customer acquisition showing ~21K per segment instead of ~107-129K actual values).
3. **Wrong column:** Using a ratio column directly when you should compute it (e.g., yield = interest/balance, not a stored percentage).

Always spot-check chart data arrays for suspiciously uniform values before embedding.

### Self-Contained HTML Structure

Every dashboard is a single HTML file with embedded CSS, JS, and data. Standard structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Name - Falcon Finance</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
  <style>/* All CSS here */</style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-left">
      <div class="logo"><span class="x">x</span><span class="f">F</span></div>
      <div class="title">Falcon Finance / N. Dashboard Name</div>
    </div>
    <a href="index.html" class="back-link">← Back to Portal</a>
  </div>
  <div class="container">
    <!-- KPI grid, charts, tables -->
  </div>
  <script>/* All JS + data here */</script>
</body>
</html>
```

### Topbar Standard (Consistency Rules)

The topbar layout must be consistent across ALL dashboards:

1. **Logo:** Always `xF` — "x" in `#A8DADC`, "F" in `#E63946`. Never "xFalcon".
2. **Title format:** `Falcon Finance / N. Dashboard Name` (e.g., "Falcon Finance / 3. Portfolio Health")
3. **Back link:** Always on the RIGHT side of the topbar (outside `.topbar-left`), never inside `.topbar-left`
4. **Back link target:** Always `href="index.html"` — never `href="#"` or `javascript:history.back()`
5. **Back link hover:** `text-decoration: underline` — NOT `color: #F1FAEE`

```css
.back-link { color: #A8DADC; text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
```

---

## Portal Page (index.html) Structure

The portal page has these sections in order:
1. Topbar with logo and title (no back button)
2. Portfolio Snapshot KPI grid (FY-level summary)
3. Two summary charts (chart row)
4. Dashboard Directory (10 numbered dash-cards linking to dashboards)
5. Quarterly Business Reviews section (QBR dash-cards with coral accent)
6. Top Partners table
7. Footer

### QBR Section Pattern

```html
<div class="section-title">Quarterly Business Reviews</div>
<div class="dash-grid">
  <a class="dash-card" href="11-qbr-q4-2025.html" style="border-left:4px solid #E63946">
    <div class="dash-num" style="color:#E63946">QBR</div>
    <div class="dash-name">Q4 2025 — Quarterly Business Review <span class="status-badge">New</span></div>
    <div class="dash-desc">Executive summary of Oct–Dec 2025 performance...</div>
  </a>
</div>
```

---

## PowerPoint (PPTX) Build Rules

### Pipeline

1. **Library:** PptxGenJS (Node.js) — install with `npm install -g pptxgenjs --prefix /sessions/lucid-clever-franklin/.npm-global`
2. **Execute:** `NODE_PATH=/sessions/lucid-clever-franklin/.npm-global/lib/node_modules node build-qbr.js`
3. **Visual QA conversion:**
   - PDF: `python /sessions/lucid-clever-franklin/mnt/.claude/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf "path/to/file.pptx"`
   - Note: PDF outputs to the WORKING DIRECTORY, not next to the input file
   - Images: `pdftoppm -jpeg -r 150 output.pdf slide`
   - Read each `slide-NN.jpg` for visual inspection

### PPTX Brand Colors

| Name | Hex (no #) | Usage |
|------|-----------|-------|
| NAVY | `1D3557` | Dark slide backgrounds, primary headings |
| CORAL | `E63946` | Accent lines, highlight text, brand emphasis |
| STEEL | `457B9D` | Secondary headings, chart elements |
| ICE | `A8DADC` | Subtitle text on dark backgrounds, light accents |
| LIGHT | `F5F6F8` | Light slide backgrounds, card fills |
| WHITE | `FFFFFF` | Text on dark backgrounds, card backgrounds |
| DARK_TEXT | `1E293B` | Body text on light slides |
| MID_TEXT | `64748B` | Secondary/muted text |
| CHART_BLUE | `006AFF` | Primary chart bars/lines |
| CHART_TEAL | `1A7F64` | Secondary chart bars/lines |
| CHART_GRAY | `94A3B8` | Tertiary chart elements |
| AMBER | `F59E0B` | Warning/highlight accents |

### PPTX Design Rules (Learned from QA)

1. **Prevent text overlap:** Keep KPI values short — use "$121.8M" not "$121.81M". Set text box widths wide enough for the largest expected value. Test that 6-character values fit without wrapping.
2. **High contrast only:** Navy backgrounds → white or ice text. Light backgrounds → navy or dark text. Never use coral on teal, yellow on white, or red on blue.
3. **No empty fields:** If a YoY comparison value is unavailable, show "N/A" or omit the field entirely — never display "YoY:" with a blank value.
4. **Font sizes:** Slide titles ≥ 18pt, KPI values ≥ 24pt, body text ≥ 11pt, table text ≥ 9pt. Anything smaller is illegible in presentation mode.
5. **Analytical insights on every slide:** Don't just show numbers — include 1–2 sentences of interpretation (trend direction, root cause, business implication). This was a key user feedback item.
6. **Fonts:** Trebuchet MS for headings, Calibri for body text
7. **Shadow helper:** Create a fresh shadow object per shape to avoid PptxGenJS reference issues:
   ```javascript
   function cardShadow() {
     return { type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.08 };
   }
   ```
8. **Slide layout:** Alternate dark (NAVY background) and light (WHITE/LIGHT background) slides for visual rhythm. Title and closing slides are dark; content slides are light.

---

## Dashboard Index

| # | Dashboard | File |
|---|-----------|------|
| — | Portal | `index.html` |
| 1 | Executive Overview | `01-executive-overview.html` |
| 2 | Transaction Analytics | `02-transaction-analytics.html` |
| 3 | Portfolio Health | `03-portfolio-health.html` |
| 4 | BNPL Performance | `04-bnpl-performance.html` |
| 5 | Credit Risk & Delinquency | `05-credit-risk.html` |
| 6 | Collections Performance | `06-collections.html` |
| 7 | Partner Performance | `07-partner-performance.html` |
| 8 | Customer Intelligence | `08-customer-intelligence.html` |
| 9 | Product Mix Analysis | `09-product-mix.html` |
| 10 | Geographic Analysis | `10-geographic-analysis.html` |
| QBR | Q4 2025 Quarterly Business Review | `11-qbr-q4-2025.html` |

---

## QA Checklist (Run Before Delivery)

When building or modifying dashboards, validate:

- [ ] **Color compliance:** No red (#D32F2F) or green (#2E7D32) in chart datasets — only in KPI text
- [ ] **Topbar consistency:** Logo is "xF", title is "Falcon Finance / N. Name", back link is on RIGHT
- [ ] **Table headers:** Dark navy background (#1D3557), white text (#F1FAEE), no uppercase/letter-spacing
- [ ] **KPI sizing:** Values at 28px, labels at 12px, colors at #1D3557
- [ ] **Chart titles:** 16px, weight 700, color #1D3557
- [ ] **X-axis labels:** Match dataset length (months12 for YoY, monthsAll for 24-month trends)
- [ ] **Flat data:** Spot-check data arrays for suspiciously identical values across categories
- [ ] **JS compatibility:** No const/let, no arrow functions, no template literals
- [ ] **Back link hover:** Uses `text-decoration: underline`, not color change
- [ ] **Font loading:** Inter from Google Fonts CDN is imported in `<head>`

---

## Kit Reference Files

| File | Purpose |
|------|---------|
| `DASHBOARD_FEASIBILITY.md` | Feasibility scores for each dashboard |
| `DATA_SCHEMA_MAP.md` | Complete table/column mapping |
| `RETAILEDGE_THEME.md` | Color palette, CSS variables, patterns |
| `METRIC_DEFINITIONS.md` | Authoritative KPI formulas |
| `GLOBAL_FILTERS.md` | Filter dimensions, exclusions, fiscal calendar |
| `QUERY_TEMPLATES.sql` | Starter SQL queries for all dashboards |
| `SETUP_GUIDE.md` | Quick start and troubleshooting |
| `Falcon-Finance-QBR-Q4-2025.pptx` | Q4 2025 QBR presentation |
