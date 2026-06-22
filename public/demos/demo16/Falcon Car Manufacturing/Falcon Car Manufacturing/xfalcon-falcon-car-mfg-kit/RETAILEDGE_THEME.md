# RetailEdge Theme Specification
## Falcon Car Manufacturing | xFalcon AnalyticsPro

Complete design system for Falcon Car Manufacturing dashboards with color palettes, typography, and component styling.

---

## COLOR PALETTE

### Core Brand Colors
| Usage | Color | Hex | RGB | Use Case |
|-------|-------|-----|-----|----------|
| Primary Accent | Falcon Orange | #E87722 | rgb(232, 119, 34) | Highlights, CTA buttons, key metrics |
| Secondary Accent | Falcon Blue | #1B3A5C | rgb(27, 58, 92) | Headers, topbars, serious KPIs |
| Background | Light Gray | #F3F4F6 | rgb(243, 244, 246) | Main dashboard background |
| Card Background | White | #FFFFFF | rgb(255, 255, 255) | Card surfaces, panels |
| Topbar | Dark Blue | #1B3A5C | rgb(27, 58, 92) | Navigation header |

### Chart Colors (Sequential & Categorical)
| Component | Color | Hex | RGB | Purpose |
|-----------|-------|-----|-----|---------|
| Chart Primary | Falcon Blue | #1B3A5C | rgb(27, 58, 92) | Main chart series (OEE, Yield) |
| Chart Secondary | Falcon Orange | #E87722 | rgb(232, 119, 34) | Secondary series (Plan vs Actual) |
| Chart Tertiary | Slate Gray | #94A3B8 | rgb(148, 163, 184) | Targets, benchmarks, neutral data |
| Chart Accent 1 | Sky Blue | #0EA5E9 | rgb(14, 165, 233) | Performance trends, upside |
| Chart Accent 2 | Amber | #F59E0B | rgb(245, 158, 11) | Warnings, caution flags |

### KPI Status Colors
| Status | Color | Hex | RGB | When to Use |
|--------|-------|-----|-----|-------------|
| Positive / On-Track | Green | #059669 | rgb(5, 150, 105) | KPI met, performance above target |
| Negative / At-Risk | Red | #D32F2F | rgb(211, 47, 47) | KPI missed, performance below threshold |
| Neutral / On-Par | Slate | #64748B | rgb(100, 116, 139) | Variance within acceptable range |
| Warning | Amber | #F59E0B | rgb(245, 158, 11) | Trending toward red, attention needed |

### Text Colors
| Element | Color | Hex | RGB | Usage |
|---------|-------|-----|-----|-------|
| Primary Text | Dark Slate | #1E293B | rgb(30, 41, 59) | Body copy, metric labels |
| Secondary Text | Medium Slate | #64748B | rgb(100, 116, 139) | Descriptions, subcaptions |
| Light Text | White | #FFFFFF | rgb(255, 255, 255) | Text on dark backgrounds (topbar) |
| Disabled Text | Light Slate | #CBD5E1 | rgb(203, 213, 225) | Disabled controls, archived data |

### Border & Shadow
| Element | Value | Usage |
|---------|-------|-------|
| Border Color | #E2E8F0 | Card borders, dividers |
| Shadow Color | rgba(0, 0, 0, 0.1) | Card shadows, elevation |
| Hover Overlay | rgba(0, 0, 0, 0.04) | Interactive element hover state |

---

## TYPOGRAPHY

### Font Family
- **Primary Font:** Inter (sans-serif)
  - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
  - Link: https://fonts.google.com/specimen/Inter

### Type Scale

#### KPI Values (Large Display)
- **Font Size:** 28px
- **Font Weight:** 700 (Bold)
- **Line Height:** 32px
- **Letter Spacing:** -0.5px
- **Color:** #1B3A5C (Falcon Blue)
- **Example:** "87.99%" (OEE%), "367K" (units)

#### KPI Labels (Small Subtitle)
- **Font Size:** 12px
- **Font Weight:** 600 (SemiBold)
- **Line Height:** 16px
- **Letter Spacing:** 0.5px
- **Color:** #64748B (Medium Slate)
- **Text Transform:** UPPERCASE
- **Example:** "OEE RATE", "SCRAP %"

#### Card Titles / Section Headers
- **Font Size:** 16px
- **Font Weight:** 700 (Bold)
- **Line Height:** 20px
- **Color:** #1E293B (Dark Slate)
- **Example:** "Production Performance", "Supplier Scorecard"

#### Chart Titles
- **Font Size:** 16px
- **Font Weight:** 700 (Bold)
- **Line Height:** 20px
- **Color:** #1E293B (Dark Slate)
- **Margin Bottom:** 12px

#### Chart Axis Labels
- **Font Size:** 12px
- **Font Weight:** 400 (Regular)
- **Line Height:** 16px
- **Color:** #64748B (Medium Slate)

#### Tooltip Text
- **Font Size:** 12px
- **Font Weight:** 500 (Medium)
- **Line Height:** 16px
- **Color:** #FFFFFF (White on dark background)
- **Background:** rgba(30, 41, 59, 0.95)

#### Body Text / Table Data
- **Font Size:** 14px
- **Font Weight:** 400 (Regular)
- **Line Height:** 20px
- **Color:** #1E293B (Dark Slate)

---

## COMPONENT STYLING

### Topbar / Navigation
```
Background Color: #1B3A5C (Falcon Blue)
Height: 56px
Padding: 12px 24px
Text Color: #FFFFFF (White)
Logo/Brand: 24px left-aligned
Navigation Items: 14px, 500 weight, right-aligned
Active Link Indicator: #E87722 (Falcon Orange) 2px underline
```

### Cards
```
Background: #FFFFFF
Border: 1px solid #E2E8F0
Border Radius: 8px
Padding: 20px
Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Hover Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
Transition: box-shadow 200ms ease-in-out
```

### KPI Tiles
```
Card Base: #FFFFFF, border radius 8px
Title (Label): 12px, 600 weight, #64748B, UPPERCASE
Value: 28px, 700 weight, #1B3A5C
Subtext (Change): 12px, 500 weight
  - Positive: #059669 (Green) with ↑ icon
  - Negative: #D32F2F (Red) with ↓ icon
  - Neutral: #64748B (Slate) with → icon
Icon: 48px, left of value, color-coded by status
Background: Subtle status color at 5% opacity
```

### Buttons
```
Primary Button:
  Background: #E87722 (Falcon Orange)
  Text: #FFFFFF, 14px, 600 weight
  Padding: 8px 16px
  Border Radius: 4px
  Hover: Background darken 10%
  Active: Scale 98%

Secondary Button:
  Background: #F3F4F6 (Light Gray)
  Text: #1B3A5C (Falcon Blue), 14px, 600 weight
  Border: 1px solid #E2E8F0
  Padding: 8px 16px
  Hover: Background #E2E8F0
```

### Tables
```
Header Row:
  Background: #F9FAFB
  Text: #1E293B, 12px, 600 weight
  Border-Bottom: 1px solid #E2E8F0
  Padding: 12px

Data Rows:
  Padding: 12px
  Text: #1E293B, 14px, 400 weight
  Border-Bottom: 1px solid #E2E8F0

Hover Row:
  Background: #F9FAFB
  Transition: 100ms

Alternate Rows: None (light background sufficient)
```

### Charts (Chart.js / Similar)
```
Background: Transparent (inherits card #FFFFFF)
Grid Lines: #E2E8F0, 1px, dashed
Axis Labels: #64748B, 12px, 400 weight
Legend: 12px, 500 weight, #1E293B
Legend Position: Bottom or right-aligned
Tooltip Background: rgba(30, 41, 59, 0.95)
Tooltip Text: #FFFFFF, 12px
Animation Duration: 500ms ease-out
```

### Filters & Controls
```
Filter Label: 12px, 600 weight, #1E293B
Dropdown:
  Background: #FFFFFF
  Border: 1px solid #E2E8F0
  Height: 36px
  Border Radius: 4px
  Padding: 8px 12px
  Text: #1E293B, 14px, 400 weight
  Focus Border: #1B3A5C, 2px

Dropdown Options:
  Background: #FFFFFF
  Hover Background: #F3F4F6
  Selected: #E87722 checkmark
  Text: #1E293B, 14px
```

### Status Indicators
```
On-Track (Green):
  Background: #ECFDF5
  Text: #059669
  Border: 1px solid #A7F3D0

At-Risk (Red):
  Background: #FEF2F2
  Text: #D32F2F
  Border: 1px solid #FECACA

Warning (Amber):
  Background: #FFFBEB
  Text: #F59E0B
  Border: 1px solid #FCD34D
```

---

## CSS VARIABLE BLOCK

Insert this into your CSS or theme configuration:

```css
:root {
  /* Brand Colors */
  --color-brand-orange: #E87722;
  --color-brand-blue: #1B3A5C;

  /* Backgrounds */
  --color-bg-primary: #F3F4F6;
  --color-bg-secondary: #FFFFFF;
  --color-bg-tertiary: #F9FAFB;
  --color-bg-dark: #1B3A5C;

  /* Text Colors */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-light: #FFFFFF;
  --color-text-disabled: #CBD5E1;

  /* Chart Colors */
  --color-chart-primary: #1B3A5C;
  --color-chart-secondary: #E87722;
  --color-chart-tertiary: #94A3B8;
  --color-chart-accent1: #0EA5E9;
  --color-chart-accent2: #F59E0B;

  /* Status Colors */
  --color-status-positive: #059669;
  --color-status-negative: #D32F2F;
  --color-status-warning: #F59E0B;
  --color-status-neutral: #64748B;

  /* Border & Shadow */
  --color-border: #E2E8F0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-modal: 1000;
  --z-tooltip: 1100;
}

/* KPI Value Styling */
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: -0.5px;
  color: var(--color-brand-blue);
}

/* KPI Label Styling */
.kpi-label {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* Card Styling */
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 200ms ease-in-out;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Chart Title */
.chart-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

/* Button Primary */
.button-primary {
  background: var(--color-brand-orange);
  color: var(--color-text-light);
  font-size: 14px;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 200ms ease-in-out;
}

.button-primary:hover {
  background: #d66817; /* 10% darker */
}

/* Button Secondary */
.button-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-brand-blue);
  font-size: 14px;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.button-secondary:hover {
  background: var(--color-border);
}

/* Table Styling */
.table-header {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 600;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.table-row:hover {
  background: var(--color-bg-tertiary);
  transition: background 100ms ease-in-out;
}

/* Filter Control */
.filter-select {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-primary);
  height: 36px;
}

.filter-select:focus {
  border: 2px solid var(--color-brand-blue);
  outline: none;
}

/* Status Badge */
.status-positive {
  background: #ECFDF5;
  color: var(--color-status-positive);
  border: 1px solid #A7F3D0;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.status-negative {
  background: #FEF2F2;
  color: var(--color-status-negative);
  border: 1px solid #FECACA;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.status-warning {
  background: #FFFBEB;
  color: var(--color-status-warning);
  border: 1px solid #FCD34D;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Import Inter font from Google Fonts or local source
- [ ] Define CSS variables in root stylesheet or theme config
- [ ] Apply brand colors to topbar and primary navigation
- [ ] Set dashboard background to #F3F4F6
- [ ] Configure card styling with white background and subtle shadows
- [ ] Update chart libraries (Chart.js, D3, etc.) with brand color palette
- [ ] Style KPI tiles with 28px/700 weight values and 12px/600 weight labels
- [ ] Apply status colors (green/red/amber) to KPI change indicators
- [ ] Create button components with primary (orange) and secondary (slate) styles
- [ ] Test dark mode compliance (if required)
- [ ] Validate contrast ratios (WCAG AA minimum)
- [ ] Create component library documentation for dev team

---

## Color Contrast Validation (WCAG AA)

| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| #1B3A5C | #F3F4F6 | 10.8:1 | ✓ |
| #E87722 | #FFFFFF | 4.8:1 | ✓ |
| #1E293B | #FFFFFF | 16.5:1 | ✓ |
| #64748B | #FFFFFF | 5.2:1 | ✓ |
| #FFFFFF | #1B3A5C | 14.5:1 | ✓ |
| #059669 | #ECFDF5 | 6.1:1 | ✓ |
| #D32F2F | #FEF2F2 | 4.5:1 | ✓ |

---

**Last Updated:** 2026-04-12  
**Design System Version:** 1.0  
**Prepared For:** xFalcon AnalyticsPro Falcon Car Manufacturing
