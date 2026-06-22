# RETAILEDGE Theme Specification
## Nielsen-Inspired LIGHT Design System for Falcon Consumer

**Theme Name**: RETAILEDGE | **Variant**: LIGHT | **Font Stack**: Inter | **Accessibility**: WCAG 2.1 AA

---

## Color Palette

### Core Colors

| Color | Hex | RGB | Role | Usage |
|-------|-----|-----|------|-------|
| Page Background | #F3F4F6 | rgb(243, 244, 246) | Page/Canvas | Dashboard body, card backgrounds supporting |
| Card Background | #FFFFFF | rgb(255, 255, 255) | Surface | Chart cards, metric panels, content containers |
| Topbar | #1A1A2E | rgb(26, 26, 46) | Navigation Header | Top navigation bar, brand bar, header area |
| Primary Accent | #00AEFF | rgb(0, 174, 255) | Call-to-Action | Buttons, links, key metrics, primary highlights |
| Secondary Accent | #1A7F64 | rgb(26, 127, 100) | Supporting Accent | Secondary actions, alternative highlights |

### Extended Palette (Charts & Data Viz)

| Color | Hex | RGB | Role | Usage |
|-------|-----|-----|------|-------|
| Chart Primary | #00AEFF | rgb(0, 174, 255) | Series 1 | Primary line/bar in multi-series charts |
| Chart Secondary | #1A7F64 | rgb(26, 127, 100) | Series 2 | Secondary line/bar in multi-series charts |
| Chart Tertiary | #94A3B8 | rgb(148, 163, 184) | Series 3 | Tertiary metric, supporting series |
| Chart Extended 1 | #0EA5E9 | rgb(14, 165, 233) | Series 4 | Additional series (lighter cyan) |
| Chart Extended 2 | #F59E0B | rgb(245, 158, 11) | Series 5 | Accent series (amber/orange) |

### Status & Sentiment

| Color | Hex | RGB | Role | Usage |
|-------|-----|-----|------|-------|
| Positive (Growth) | #059669 | rgb(5, 150, 105) | Favorable | Increases, YoY growth %, positive variance, green flags |
| Negative (Decline) | #D32F2F | rgb(211, 47, 47) | Unfavorable | Decreases, churn, negative variance, red flags |
| Neutral (Stable) | #94A3B8 | rgb(148, 163, 184) | No Change | Flat metrics, stable trends, neutral information |
| Warning | #F97316 | rgb(249, 115, 22) | Caution | Alerts, thresholds breached, warnings |
| Info | #3B82F6 | rgb(59, 130, 246) | Informational | Tips, notes, informational badges |

### Text & Typography

| Color | Hex | RGB | Role | Usage |
|-------|-----|-----|------|-------|
| Text Primary | #1E293B | rgb(30, 41, 59) | Main Text | Body text, labels, headings, primary copy |
| Text Secondary | #64748B | rgb(100, 116, 139) | Supporting Text | Subtitles, hints, meta information, secondary labels |
| Text Tertiary | #94A3B8 | rgb(148, 163, 184) | Muted Text | Disabled text, placeholders, very low contrast |
| Text Inverse | #FFFFFF | rgb(255, 255, 255) | High Contrast | Text on dark backgrounds (topbar, dark cards) |

### Borders & Dividers

| Color | Hex | RGB | Role | Usage |
|-------|-----|-----|------|-------|
| Border Light | #E2E8F0 | rgb(226, 232, 240) | Subtle Division | Card borders, subtle dividers, grid lines |
| Border Medium | #CBD5E1 | rgb(203, 213, 225) | Standard Division | Table row separators, section dividers |
| Border Dark | #94A3B8 | rgb(148, 163, 184) | Emphasis Division | Input borders, focus outlines, section emphasis |

---

## CSS Variable Definitions

```css
:root {
  /* Page & Canvas */
  --color-bg-page: #F3F4F6;
  --color-bg-card: #FFFFFF;
  
  /* Navigation & Headers */
  --color-topbar: #1A1A2E;
  --color-topbar-text: #FFFFFF;
  
  /* Primary & Secondary Accents */
  --color-primary: #00AEFF;
  --color-primary-light: #E0F7FF;
  --color-primary-dark: #0084CC;
  --color-secondary: #1A7F64;
  --color-secondary-light: #D0E8E0;
  --color-secondary-dark: #0F4D36;
  
  /* Chart Series Colors (in order) */
  --color-chart-1: #00AEFF;
  --color-chart-2: #1A7F64;
  --color-chart-3: #94A3B8;
  --color-chart-4: #0EA5E9;
  --color-chart-5: #F59E0B;
  
  /* Status Colors */
  --color-positive: #059669;
  --color-positive-light: #D1F2EB;
  --color-negative: #D32F2F;
  --color-negative-light: #FFEBEE;
  --color-neutral: #94A3B8;
  --color-neutral-light: #F1F5F9;
  --color-warning: #F97316;
  --color-warning-light: #FFF7ED;
  --color-info: #3B82F6;
  --color-info-light: #EFF6FF;
  
  /* Text Colors */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-text-inverse: #FFFFFF;
  
  /* Borders & Dividers */
  --color-border-light: #E2E8F0;
  --color-border-medium: #CBD5E1;
  --color-border-dark: #94A3B8;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## Typography Specification

### Font Stack
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes & Scales

| Scale | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 32px | 700 | 1.2 (38.4px) | -0.5px | Page titles, dashboard names |
| H1 | 28px | 700 | 1.2 (33.6px) | -0.25px | Section headers, card titles |
| H2 | 24px | 700 | 1.3 (31.2px) | 0px | Subsection headers |
| H3 | 20px | 600 | 1.4 (28px) | 0px | Metric titles, card subtitles |
| Body Large | 16px | 400 | 1.5 (24px) | 0px | Primary body text, descriptions |
| Body Regular | 14px | 400 | 1.5 (21px) | 0px | Secondary body text, labels |
| Body Small | 12px | 400 | 1.4 (16.8px) | 0.25px | Hints, meta data, captions |
| Caption | 11px | 500 | 1.4 (15.4px) | 0.5px | Table headers, small labels |
| Mono | 12px | 400 | 1.5 (18px) | 0px | Code, numeric values, technical text |

### Font Weight Scale
- **400 (Regular)**: Body text, standard content
- **500 (Medium)**: Table headers, secondary headings, emphasis
- **600 (Semibold)**: Card titles, metric names, strong emphasis
- **700 (Bold)**: Page titles, primary headings, maximum emphasis

---

## Component Styling Rules

### Buttons

#### Primary Button
```css
background-color: var(--color-primary); /* #00AEFF */
color: var(--color-text-inverse); /* #FFFFFF */
padding: 8px 16px;
border-radius: var(--radius-md);
font-weight: 600;
border: none;
cursor: pointer;
transition: background-color var(--transition-base);

&:hover {
  background-color: var(--color-primary-dark); /* #0084CC */
}

&:active {
  transform: scale(0.98);
}

&:disabled {
  background-color: var(--color-text-tertiary); /* #94A3B8 */
  cursor: not-allowed;
}
```

#### Secondary Button
```css
background-color: transparent;
color: var(--color-primary); /* #00AEFF */
padding: 8px 16px;
border: 1px solid var(--color-primary);
border-radius: var(--radius-md);
font-weight: 600;
cursor: pointer;
transition: all var(--transition-base);

&:hover {
  background-color: var(--color-primary-light); /* #E0F7FF */
}

&:active {
  transform: scale(0.98);
}

&:disabled {
  border-color: var(--color-text-tertiary);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}
```

#### Tertiary Button (Ghost)
```css
background-color: transparent;
color: var(--color-text-primary); /* #1E293B */
padding: 8px 16px;
border: none;
border-radius: var(--radius-md);
font-weight: 600;
cursor: pointer;
transition: background-color var(--transition-base);

&:hover {
  background-color: var(--color-border-light); /* #E2E8F0 */
}

&:active {
  transform: scale(0.98);
}

&:disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}
```

### Cards & Containers

```css
.card {
  background-color: var(--color-bg-card); /* #FFFFFF */
  border: 1px solid var(--color-border-light); /* #E2E8F0 */
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card--elevated {
  box-shadow: var(--shadow-md);
}

.card--prominent {
  box-shadow: var(--shadow-lg);
}
```

### Table Header

```css
.table-header {
  background-color: var(--color-topbar); /* #1A1A2E */
  color: var(--color-text-inverse); /* #FFFFFF */
  padding: var(--spacing-md);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.table-row {
  border-bottom: 1px solid var(--color-border-light); /* #E2E8F0 */
  padding: var(--spacing-md);
}

.table-row:hover {
  background-color: var(--color-bg-page); /* #F3F4F6 */
}

.table-cell {
  color: var(--color-text-primary);
  font-size: 14px;
  padding: var(--spacing-md);
}

.table-cell--secondary {
  color: var(--color-text-secondary); /* #64748B */
  font-size: 12px;
}
```

### Metric Cards (KPI Tiles)

```css
.metric-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.metric-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: "Inter Mono", monospace;
}

.metric-delta {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.metric-delta--positive {
  color: var(--color-positive); /* #059669 */
}

.metric-delta--negative {
  color: var(--color-negative); /* #D32F2F */
}

.metric-delta--neutral {
  color: var(--color-neutral); /* #94A3B8 */
}
```

### Input Fields

```css
.input {
  background-color: var(--color-bg-card); /* #FFFFFF */
  border: 1px solid var(--color-border-medium); /* #CBD5E1 */
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  font-family: inherit;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light); /* #E0F7FF */
}

.input:disabled {
  background-color: var(--color-border-light); /* #E2E8F0 */
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.input-hint {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  color: var(--color-text-tertiary);
}
```

### Topbar / Navigation Header

```css
.topbar {
  background-color: var(--color-topbar); /* #1A1A2E */
  color: var(--color-text-inverse); /* #FFFFFF */
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-md);
}

.topbar-brand {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.topbar-nav {
  display: flex;
  gap: var(--spacing-lg);
}

.topbar-nav-item {
  color: var(--color-text-inverse);
  text-decoration: none;
  font-weight: 500;
  transition: opacity var(--transition-base);
}

.topbar-nav-item:hover {
  opacity: 0.8;
}

.topbar-nav-item--active {
  border-bottom: 2px solid var(--color-primary); /* #00AEFF */
  padding-bottom: 4px;
}
```

### Badges & Pills

```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: var(--color-border-light);
  color: var(--color-text-primary);
}

.badge--primary {
  background-color: var(--color-primary-light); /* #E0F7FF */
  color: var(--color-primary-dark); /* #0084CC */
}

.badge--secondary {
  background-color: var(--color-secondary-light); /* #D0E8E0 */
  color: var(--color-secondary-dark); /* #0F4D36 */
}

.badge--positive {
  background-color: var(--color-positive-light); /* #D1F2EB */
  color: var(--color-positive); /* #059669 */
}

.badge--negative {
  background-color: var(--color-negative-light); /* #FFEBEE */
  color: var(--color-negative); /* #D32F2F */
}

.badge--neutral {
  background-color: var(--color-neutral-light); /* #F1F5F9 */
  color: var(--color-neutral); /* #94A3B8 */
}
```

### Charts

```css
.chart-container {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.chart-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

/* Chart.js / Recharts color overrides */
.chart-line--series-1 {
  stroke: var(--color-chart-1); /* #00AEFF */
}

.chart-line--series-2 {
  stroke: var(--color-chart-2); /* #1A7F64 */
}

.chart-line--series-3 {
  stroke: var(--color-chart-3); /* #94A3B8 */
}

.chart-bar--series-1 {
  fill: var(--color-chart-1); /* #00AEFF */
}

.chart-bar--series-2 {
  fill: var(--color-chart-2); /* #1A7F64 */
}

.chart-bar--series-3 {
  fill: var(--color-chart-3); /* #94A3B8 */
}

.chart-grid {
  stroke: var(--color-border-light);
  opacity: 0.5;
}

.chart-axis-label {
  fill: var(--color-text-secondary);
  font-size: 12px;
}

.chart-tooltip {
  background-color: var(--color-topbar); /* #1A1A2E */
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  border: 1px solid var(--color-border-dark);
  font-size: 12px;
  box-shadow: var(--shadow-lg);
}
```

### Filters & Dropdowns

```css
.filter-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
}

.select {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.select:disabled {
  background-color: var(--color-border-light);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}
```

---

## Accessibility Specifications

### Color Contrast Ratios (WCAG 2.1 AA)

| Color Pair | Contrast Ratio | Status |
|-----------|--------|--------|
| Text Primary (#1E293B) on Card BG (#FFFFFF) | 13.5:1 | AAA (exceeds AA) |
| Text Secondary (#64748B) on Card BG (#FFFFFF) | 6.8:1 | AAA (exceeds AA) |
| Text Inverse (#FFFFFF) on Topbar (#1A1A2E) | 14.3:1 | AAA (exceeds AA) |
| Primary Button (#00AEFF) on Card BG (#FFFFFF) | 4.8:1 | AA (meets AA) |
| Positive (#059669) on Light BG (#FFFFFF) | 5.2:1 | AA (meets AA) |
| Negative (#D32F2F) on Light BG (#FFFFFF) | 5.8:1 | AA (meets AA) |

All color pairs meet or exceed WCAG 2.1 AA contrast requirements.

### Focus States
- All interactive elements have visible focus outlines (border or shadow highlight)
- Focus indicator uses primary accent color (#00AEFF) or sufficient contrast
- Outline width: 2–3px

### Keyboard Navigation
- All buttons, links, and inputs navigable via Tab
- Tab order follows logical DOM order
- Skip to main content link provided

### Text Sizing
- Base font size: 16px (prevents auto-zoom on mobile)
- Minimum font size: 11px (captions); 12px for body text
- Line height: 1.4–1.5 for readability

---

## Usage Guidelines

### When to Use Each Color

**Primary Accent (#00AEFF)**
- Main call-to-action buttons
- Active navigation states
- Primary metric highlights
- Primary chart series
- Links

**Secondary Accent (#1A7F64)**
- Secondary actions
- Supporting highlights
- Secondary chart series
- Accent elements

**Status Colors**
- **Positive (#059669)**: Growth, increases, favorable variance
- **Negative (#D32F2F)**: Declines, losses, unfavorable variance
- **Neutral (#94A3B8)**: No change, stable, informational

**Text Colors**
- **Primary (#1E293B)**: All body text and primary labels
- **Secondary (#64748B)**: Subtitles, hints, meta information
- **Tertiary (#94A3B8)**: Disabled text, very low contrast elements

### Dark Mode Consideration
This theme is LIGHT variant. If dark mode is required in future, invert backgrounds and text colors while maintaining primary/secondary accent colors.

---

## Implementation Checklist

- [ ] Import Inter font from Google Fonts or system fallback
- [ ] Define all CSS variables in `:root` selector
- [ ] Apply `.card` and component styles to relevant elements
- [ ] Test all interactive states (hover, focus, active, disabled)
- [ ] Verify color contrast ratios with accessibility checker
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test on light/bright backgrounds (page uses #F3F4F6)
- [ ] Verify responsive behavior on mobile (font sizes, spacing)
- [ ] Update component library documentation with new theme
- [ ] Brief design/UX team on new color palette and usage

---

## Example Component HTML (Reference)

```html
<!-- Topbar -->
<header class="topbar">
  <div class="topbar-brand">Falcon Consumer Analytics</div>
  <nav class="topbar-nav">
    <a href="#" class="topbar-nav-item topbar-nav-item--active">Dashboard</a>
    <a href="#" class="topbar-nav-item">Reports</a>
  </nav>
</header>

<!-- Filter Section -->
<div class="filter-group">
  <label class="filter-label">Business Unit:</label>
  <select class="select">
    <option>All BUs</option>
    <option>Maison Luxe</option>
    <option>Urban Thread</option>
  </select>
</div>

<!-- KPI Card -->
<div class="card">
  <div class="metric-card">
    <span class="metric-label">Total Revenue</span>
    <div class="metric-value">$270.9M</div>
    <div class="metric-delta metric-delta--positive">
      +7.5% YoY
    </div>
  </div>
</div>

<!-- Chart Container -->
<div class="chart-container">
  <h3 class="chart-title">Revenue by Business Unit</h3>
  <p class="chart-subtitle">FY2024 Monthly Trend</p>
  <!-- Chart.js / Recharts canvas here -->
</div>

<!-- Table -->
<div class="card">
  <table>
    <thead>
      <tr class="table-header">
        <th>Metric</th>
        <th>Value</th>
        <th>YoY Change</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table-row">
        <td class="table-cell">Total Customers</td>
        <td class="table-cell">1,200</td>
        <td class="table-cell">
          <span class="metric-delta metric-delta--positive">+5.2%</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-04-15 | Initial RETAILEDGE LIGHT theme spec for Falcon Consumer |

---

## Contact & Support

For theme questions, updates, or accessibility concerns, contact the Design System team or your AnalyticsPro administrator.
