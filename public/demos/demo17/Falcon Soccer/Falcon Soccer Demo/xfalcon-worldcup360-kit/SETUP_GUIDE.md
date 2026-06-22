# Falcon World Cup 360 Analytics — Setup Guide

**Last Updated:** 2026-04-14  
**IDA Connector:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

---

## Quick Start (5 Steps)

1. **Open the Portal**  
   Launch `index.html` in your browser. This is the main navigation hub.

2. **Verify Dashboard Access**  
   All 10 dashboards should load without errors. Check the back link on each dashboard.

3. **Apply Global Filters**  
   Use the Tournament Year filter on the portal and dashboards to slice data (All, 1930–2014).

4. **Check Chart.js Loading**  
   Verify all charts render. If blank, check browser console for Chart.js CDN errors.

5. **Review Data Freshness**  
   Confirm reporting period displays correctly (e.g., "All Tournaments: 1930–2014").

---

## File Organization

### Portal & Metrics
| File | Purpose |
|------|---------|
| `index.html` | Portal (navigation, master KPIs, tournament picker) |
| `metrics-definitions.html` | Searchable metric catalog with formulas |

### Dashboards (10 Total)
| # | File | Focus |
|---|------|-------|
| 1 | `01-tournament-overview.html` | Executive summary: goals, attendance, revenue streams |
| 2 | `02-match-analytics.html` | Match results, stage progression, goals per match |
| 3 | `03-player-performance.html` | Top scorers, cards, minutes, lineup status |
| 4 | `04-team-rankings.html` | Win rates, goal differential, confederation analysis |
| 5 | `05-ticket-revenue.html` | Price tiers, demand index, resale rates |
| 6 | `06-merchandise-sales.html` | Category & channel breakdown, margin analysis |
| 7 | `07-broadcast-media.html` | Rights fees, viewership, ad revenue |
| 8 | `08-sponsorship-roi.html` | Contract value, media value, ROI multiples |
| 9 | `09-venue-attendance.html` | Stadium utilization, capacity analysis |
| 10 | `10-historical-trends.html` | Time series: goals, attendance, revenue (1930–2014) |

### Documentation
| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | This file — project overview & build rules |
| `SKILL.md` | Project skill — schema, theme, patterns, QA checklist |
| `RETAILEDGE_THEME.md` | Complete theme specification (colors, typography, layout) |
| `METRIC_DEFINITIONS.md` | Authoritative formulas for all KPIs |
| `GLOBAL_FILTERS.md` | Filter rules, exclusions, data quality notes |
| `DASHBOARD_FEASIBILITY.md` | Schema assessment & sample queries |

---

## Dashboard Build Checklist

Use this checklist when building or updating a dashboard:

- [ ] **Topbar**
  - [ ] Gradient background: `linear-gradient(135deg, #1B5E20 0%, #0A2E11 100%)`
  - [ ] Gold border-bottom: `3px solid #FFD600`
  - [ ] Logo: green "x" (#66BB6A), gold "F" (#FFD600)
  - [ ] Back link on RIGHT side, gold color
  - [ ] Subtitle shows reporting period (e.g., tournament year or "All Tournaments")

- [ ] **Layout & Spacing**
  - [ ] Page background: `#F3F4F6`
  - [ ] Max content width: 1400–1600px, centered
  - [ ] Card backgrounds: `#FFFFFF` with `border: 1px solid #E2E8F0`
  - [ ] Card border-radius: `12px`
  - [ ] Card shadow: `0 1px 3px rgba(0,0,0,0.08)`
  - [ ] Grid gap: 20px between cards/sections

- [ ] **KPI Cards**
  - [ ] Arranged in 4-column grid (responsive to 2-column on tablet)
  - [ ] Label: 12px/600 weight, color `#64748B`
  - [ ] Value: 28px/700 weight, color `#1B5E20`
  - [ ] Delta (if applicable): 13px, positive `#059669` / negative `#D32F2F`
  - [ ] Use `fitKpiText()` for responsive sizing on mobile

- [ ] **Charts**
  - [ ] All using Chart.js v4.4.0 CDN
  - [ ] Chart title: 16px/700 weight, color `#1B5E20`
  - [ ] Colors: hex only (e.g., `#1B5E20`, not CSS var)
  - [ ] Primary palette: `['#1B5E20', '#C8A415', '#94A3B8', '#4CAF50', '#F59E0B']`
  - [ ] NO barh (use bar), NO pie/doughnut
  - [ ] Chart instances managed via `mk()` helper
  - [ ] Responsive: `maintainAspectRatio: false` for flex containers

- [ ] **Filters**
  - [ ] Global filter (Tournament Year) on every dashboard
  - [ ] Dashboard-specific filters (Stage, Position, etc.) as defined
  - [ ] Filter change triggers chart/KPI update via `applyFilters()`

- [ ] **Data Loading**
  - [ ] IDA connector calls via `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`
  - [ ] No schema prefix in table names (e.g., `FACT_MATCH`, not `public.FACT_MATCH`)
  - [ ] Error handling: console log on fetch fail, show fallback UI

- [ ] **Typography**
  - [ ] Font: 'Inter' from Google Fonts CDN
  - [ ] Body text: `#1E293B`
  - [ ] Labels/captions: `#64748B`
  - [ ] Links: `#FFD600` (gold), hover underline

- [ ] **Accessibility**
  - [ ] All images have alt text
  - [ ] Color contrast: text passes WCAG AA
  - [ ] Filter select has proper label association
  - [ ] Keyboard navigation: tab through filters and back link

---

## Theme Reference: Soccer Green & Gold (Light)

### Color Palette

**Primary Colors**
- Primary Green: `#1B5E20` (darkest green, headers, KPI values, titles)
- Accent Gold: `#FFD600` (highlights, logo, topbar accent)
- White: `#FFFFFF` (card backgrounds, clean surfaces)
- Page Background: `#F3F4F6` (light gray)
- Topbar Dark: `#0A2E11` (deep green-black, topbar fill)

**Chart Palette** (in order)
```javascript
['#1B5E20', '#C8A415', '#94A3B8', '#4CAF50', '#F59E0B']
```

**Text Colors**
- Primary: `#1E293B` (body text, table data)
- Secondary: `#64748B` (labels, descriptions)
- On Dark BG: `#F1FAE5` (topbar text)
- On Gold BG: `#1B5E20` (text on gold accents)

**Functional Colors**
- Card Border: `#E2E8F0`
- Table Header: `#1B5E20` (background) + `#FFFFFF` (text)
- Row Hover: `#F0FFF4` (light green)
- Positive Delta: `#059669` (green uptrend)
- Negative Delta: `#D32F2F` (red downtrend)
- Neutral Delta: `#94A3B8` (gray, no change)

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| KPI Label | 12px | 600 | `#64748B` |
| KPI Value | 28px | 700 | `#1B5E20` |
| KPI Delta | 13px | 500 | `#059669` or `#D32F2F` |
| Chart Title | 16px | 700 | `#1B5E20` |
| Section Title | 18px | 700 | `#1B5E20` |
| Table Header | 13px | 600 | White on `#1B5E20` |
| Table Body | 13px | 400 | `#1E293B` |
| Topbar Title | 18px | 700 | `#F1FAE5` |
| Font Family | Inter (Google Fonts) | | |

### Topbar Layout

```html
<div class="topbar">
  <div class="topbar-left">
    <div class="logo">
      <span style="color:#66BB6A">x</span><span style="color:#FFD600">F</span>
    </div>
    <div>
      <div class="topbar-title">Falcon World Cup 360 / Dashboard Name</div>
      <div class="topbar-subtitle" id="reporting-period">All Tournaments: 1930–2014</div>
    </div>
  </div>
  <a href="index.html" class="back-link">← Back to Portal</a>
</div>
```

**Styling**
- Background: `linear-gradient(135deg, #1B5E20 0%, #0A2E11 100%)`
- Border-bottom: `3px solid #FFD600`
- Padding: `16px 24px`
- Back link color: `#FFD600` (gold)
- Subtitle color: `#FFD600` (gold)

---

## IDA Connector Info

**Connector UUID:** `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

**How to Use:**
- All queries in dashboards use this connector
- No schema prefix required (table names like `FACT_MATCH`, not `schema.FACT_MATCH`)
- Connector automatically handles authentication and query execution
- Failed queries log to browser console; provide fallback UI

**Available Tables:**
- Dimensions: DIM_TOURNAMENT, DIM_TEAM, DIM_PLAYER, DIM_VENUE, DIM_BROADCASTER, DIM_SPONSOR, DIM_MERCHANDISE_PRODUCT, DIM_CHANNEL, DIM_DATE, DIM_STAGE
- Facts: FACT_MATCH, FACT_PLAYER_MATCH, FACT_TICKET_SALES, FACT_MERCHANDISE_SALES, FACT_BROADCAST_RIGHTS, FACT_SPONSORSHIP

---

## Build Rules

**JavaScript Variables**
- Use `var` for all variables (not `const` or `let`)
- Example: `var chartData = {...}`

**Functions**
- Use function declaration syntax: `function doSomething() {...}`
- Do NOT use arrow functions: `const fn = () => {}`

**String Concatenation**
- Use `+` operator for concatenation: `"Hello " + name`
- Do NOT use template literals: `` `Hello ${name}` ``

**Colors in Chart.js**
- Always use hex color strings: `backgroundColor: '#1B5E20'`
- Do NOT reference CSS variables: `backgroundColor: 'var(--color-primary)'`

**Chart Types**
- NO `barh` type (use `bar` instead)
- NO `pie` or `doughnut` types
- Use line, bar, scatter, bubble, radar

**Chart.js Version**
- CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`
- Always reference v4.4.0 explicitly

**Data Null Handling**
- Venue capacity may be NULL for historical stadiums
- Player birth year may be NULL for pre-1966 players
- Handle NULLs in queries: `WHERE CAPACITY IS NOT NULL`

---

## Troubleshooting Tips

### Charts Not Rendering
- **Symptom:** Chart containers are blank or show "Chart not defined"
- **Fix:** Check browser console for Chart.js load error. Verify CDN URL is accessible. Ensure `var myChart = mk(...)` is called before accessing the chart object.

### Filter Changes Don't Update Data
- **Symptom:** Changing Tournament Year filter doesn't update charts
- **Fix:** Verify `applyFilters()` function exists and is wired to filter `onchange` event. Ensure each chart instance is stored in `window.charts` object for reference.

### KPI Values Show NaN
- **Symptom:** KPI displays "NaN" instead of a number
- **Fix:** Check SQL formula in IDA query. Ensure aggregation functions (SUM, AVG, COUNT) are correct. Watch for division by zero: use `NULLIF(denominator, 0)` to prevent division errors.

### Colors Not Showing Correctly
- **Symptom:** Charts use wrong colors or cards show incorrect accent colors
- **Fix:** Verify hex color strings are used directly (e.g., `'#1B5E20'`), not CSS variables. Check theme file for correct color codes.

### Topbar Subtitle Shows Wrong Reporting Period
- **Symptom:** Subtitle says "All Tournaments" but should show filtered year
- **Fix:** Update the subtitle element ID (should be `id="reporting-period"`) and ensure `applyFilters()` updates its text value.

### Slow Loading or Timeout
- **Symptom:** Dashboard takes >5 seconds to load, or queries timeout
- **Fix:** Check if IDA connector is responding. Verify filter values are valid tournament years (1930, 1934, etc.). Ensure aggregation queries use GROUP BY to reduce result set size.

---

## Data Quality Notes

### Real vs. Synthetic Data

**REAL DATA (Verified):**
- FACT_MATCH: 826 matches from Kaggle WorldCupMatches dataset (1930–2014)
- FACT_PLAYER_MATCH: 37,330 player-match records from Kaggle WorldCupPlayers (goals, cards, minutes, lineup status)

**SYNTHETIC DATA (Calibrated to Historical Patterns):**
- FACT_TICKET_SALES: Price tiers, demand index, resale rates
- FACT_MERCHANDISE_SALES: 500K transactions by category, channel, promo flag
- FACT_BROADCAST_RIGHTS: 192 broadcast deals with viewership estimates
- FACT_SPONSORSHIP: 229 sponsorship deals with contract/media values

### NULL Handling

| Column | Frequency | Notes |
|--------|-----------|-------|
| DIM_VENUE.CAPACITY | ~10% | Historical venues (pre-1950) often missing capacity data |
| DIM_VENUE.LATITUDE / LONGITUDE | ~5% | Some historical venues lack coordinates |
| DIM_PLAYER.BIRTH_YEAR | ~20% | Pre-1966 players often have NULL birth years |
| DIM_PLAYER.POSITION | ~15% | Older squad data may not include position field |

**Best Practices:**
- Always filter with `WHERE CAPACITY IS NOT NULL` for venue utilization calculations
- Group by non-NULL columns to avoid unexpected results
- Use `COALESCE()` if you need a default value for display

### Currency

- All financial values are in **USD ($)**
- Exchange rates are NOT applied retroactively (historical values are in nominal USD)
- No inflation adjustment for older tournaments

### Fiscal Year

- Dates use a **July–June fiscal year** (DIM_DATE.FISCAL_YEAR)
- Matches occur during calendar years, but are attributed to fiscal years for trend analysis

### Data Refresh Schedule

- FACT_MATCH and FACT_PLAYER_MATCH: Updated at project inception (no ongoing updates)
- FACT_TICKET_SALES, FACT_MERCHANDISE_SALES, FACT_BROADCAST_RIGHTS, FACT_SPONSORSHIP: Synthetic data, fixed for 20 tournaments

### Metric Calculation Rules

- **Home Win %** = Matches with result 'H' / Total matches
- **Venue Utilization %** = Attendance / Capacity (where CAPACITY IS NOT NULL)
- **Sponsorship ROI** = MEDIA_VALUE_USD / CONTRACT_VALUE_USD (not including ACTIVATION_SPEND_USD)
- **Gross Margin %** = GROSS_MARGIN_USD / REVENUE_USD (use pre-computed GROSS_MARGIN_USD, not REVENUE_USD - COGS_USD)
- **YoY Comparisons** = Current tournament vs. previous tournament (every 4 years), not previous calendar year

---

## Support & Questions

For schema questions, see **SKILL.md** (Common Column Name Mistakes, Join Patterns, Table List).  
For metric formulas, see **METRIC_DEFINITIONS.md**.  
For complete theme specs, see **RETAILEDGE_THEME.md**.
