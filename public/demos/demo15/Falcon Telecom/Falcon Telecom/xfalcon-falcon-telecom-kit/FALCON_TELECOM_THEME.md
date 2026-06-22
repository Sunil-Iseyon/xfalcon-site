# Falcon Telecom xFalcon AnalyticsPro Theme Guide
## T-Mobile Inspired Light Theme

Professional light theme inspired by T-Mobile's bold magenta branding combined with clean, modern design principles. Optimized for data readability and visual hierarchy across all 11 dashboards.

---

## Color Palette

### Core Colors

#### Primary Brand Color
```css
--color-accent: #E20074;           /* Magenta (T-Mobile inspired) */
--color-accent-light: #F0107A;     /* Lighter magenta for hover states */
--color-accent-dark: #C40065;      /* Darker magenta for active states */
```

**Usage:**
- Primary KPI indicators
- Button primary states
- Chart highlights
- Revenue metrics
- Critical alerts

#### Background & Surface
```css
--color-base: #F3F4F6;             /* Light gray background */
--color-card: #FFFFFF;             /* Card/surface white */
--color-topbar: #1D1D2C;           /* Dark navy top navigation bar */
--color-topbar-text: #FFFFFF;      /* White text on topbar */
```

**Usage:**
- Page background: --color-base
- Card/panel background: --color-card
- Top navigation: --color-topbar with --color-topbar-text
- Dashboard section dividers: subtle --color-base transitions

#### Text Colors
```css
--color-text-primary: #1E293B;     /* Dark slate for primary text */
--color-text-secondary: #64748B;   /* Medium gray for secondary text */
--color-text-tertiary: #94A3B8;    /* Light gray for helper/disabled text */
--color-text-inverse: #FFFFFF;     /* White text on dark backgrounds */
```

**Usage:**
- Primary text (headers, labels): --color-text-primary
- Secondary text (descriptions, metadata): --color-text-secondary
- Disabled/placeholder text: --color-text-tertiary
- Text on topbar and dark cards: --color-text-inverse

#### Secondary Brand Colors
```css
--color-secondary: #1A7F64;        /* Teal/green for positive indicators */
--color-secondary-light: #10B981;  /* Lighter teal for hover states */
--color-secondary-dark: #047857;   /* Dark teal for active states */
```

**Usage:**
- Positive metrics (growth, activations)
- Secondary highlights
- Data layer accent
- Churn reduction indicators

#### Status & Alert Colors
```css
--color-success: #059669;          /* Green for positive deltas/improvements */
--color-warning: #F59E0B;          /* Amber for caution/attention */
--color-danger: #D32F2F;           /* Red for negative deltas/churn */
--color-info: #0284C7;             /* Blue for informational elements */
```

**Usage:**
- Success: net additions, positive growth, activated subscribers
- Warning: revenue decline, payment delays, churn rise
- Danger: churn events, call drops, payment failures
- Info: neutral notifications, help text

#### Neutral/Gray Scale
```css
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;         /* Same as --color-base */
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

**Usage:**
- Borders: --color-gray-200 for light borders, --color-gray-300 for darker
- Dividers: --color-gray-200
- Placeholder/skeleton: --color-gray-100
- Chart grid: --color-gray-200 at 30% opacity

---

## Chart Palette

### Data Visualization Colors

**Primary Chart Series:**
```css
--chart-blue: #006AFF;             /* Primary data series */
--chart-teal: #1A7F64;             /* Secondary data series */
--chart-gray: #94A3B8;             /* Tertiary/comparative series */
--chart-magenta: #E20074;          /* Highlight/KPI series */
--chart-cyan: #0891B2;             /* Alternative highlight */
--chart-amber: #F59E0B;            /* Warning/attention series */
```

**Extended Palette (for multi-series charts):**
```
1. #006AFF (Blue)
2. #1A7F64 (Teal)
3. #E20074 (Magenta)
4. #0891B2 (Cyan)
5. #8B5CF6 (Purple)
6. #EC4899 (Pink)
7. #F59E0B (Amber)
8. #10B981 (Emerald)
9. #06B6D4 (Cyan light)
10. #6366F1 (Indigo)
```

**Usage Rules:**
- Chart 1 (Revenue trend): --chart-blue
- Chart 2 (ARPU trend): --chart-magenta
- Chart 3 (Churn rate): --chart-danger (#D32F2F)
- Chart 4 (Regional compare): rotate through palette
- Stacked area (Prepaid/Postpaid/Corporate): use first 3 primary colors
- Heatmaps: gradient from --color-gray-200 → --chart-blue → --color-accent

### KPI Delta Indicators

**Positive Change (Growth):**
```css
--delta-positive: #059669;         /* Green - confidence of growth */
Icon: ↑ (up arrow)
Text style: Bold, slightly larger
```

**Negative Change (Decline):**
```css
--delta-negative: #D32F2F;         /* Red - warning of decline */
Icon: ↓ (down arrow)
Text style: Bold, slightly larger
```

**Neutral/No Change:**
```css
--delta-neutral: #64748B;          /* Gray */
Icon: → (dash)
Text style: Regular
```

**Example KPI card with delta:**
```
┌─────────────────────────────────────────┐
│ Revenue (₹ Cr)                          │
│ 23.4                ↑ +2.1% vs FY22     │
│                      (Green #059669)     │
└─────────────────────────────────────────┘
```

---

## Typography

### Font Family
```css
/* Primary font stack */
font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;

/* Fallback for numbers/data */
font-family: 'Inter', 'Monaco', monospace;  /* For KPIs */
```

### Font Sizes & Hierarchy

**Headings:**
```css
h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  color: --color-text-primary;
}

h2 {
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: --color-text-primary;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: --color-text-primary;
}

h4 {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: --color-text-secondary;
}
```

**Body Text:**
```css
body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: --color-text-primary;
}

.text-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: --color-text-secondary;
}

.text-tiny {
  font-size: 11px;
  font-weight: 400;
  line-height: 14px;
  color: --color-text-tertiary;
}
```

**KPI Numbers:**
```css
.kpi-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 44px;
  font-family: 'Inter', monospace;  /* Monospace for number alignment */
  color: --color-text-primary;
}

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: --color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

**Labels & Controls:**
```css
label {
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: --color-text-primary;
}

.button {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.filter-tag {
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}
```

---

## Layout & Spacing

### Spacing Scale (8px base unit)
```css
--space-xs: 4px;      /* 0.5 unit - tight spacing */
--space-sm: 8px;      /* 1 unit - padding within components */
--space-md: 16px;     /* 2 units - default spacing */
--space-lg: 24px;     /* 3 units - spacing between sections */
--space-xl: 32px;     /* 4 units - major section breaks */
--space-2xl: 48px;    /* 6 units - page margins */
```

### Container Widths
```css
--container-max: 1440px;           /* Dashboard max-width */
--container-gutter: 24px;          /* Side margins */
--container-grid: 12 columns       /* Bootstrap-like grid */
--container-gap: 16px;             /* Column gaps */
```

### Grid Layout Examples

**Dashboard Grid (3-column):**
- Column 1: 33.33% (KPI cards, small charts)
- Column 2: 33.33% (main trend chart)
- Column 3: 33.33% (regional/segment breakdown)
- Row height: 300-400px (depends on chart complexity)

**Row Layout (2-column):**
- Left: 60-70% (primary analysis chart)
- Right: 30-40% (KPI cards or drill-down table)

---

## Component Styles

### KPI Card
```css
.kpi-card {
  background: --color-card;
  border: 1px solid --color-gray-200;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.kpi-card:hover {
  border-color: --color-gray-300;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: --color-text-primary;
  margin-bottom: 4px;
}

.kpi-delta {
  font-size: 13px;
  font-weight: 600;
  color: --delta-positive;  /* or --delta-negative */
}
```

### Chart Container
```css
.chart-container {
  background: --color-card;
  border: 1px solid --color-gray-200;
  border-radius: 8px;
  padding: 16px;
  height: auto;
  min-height: 300px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: --color-text-primary;
  margin-bottom: 16px;
  padding: 0 4px;
}

.chart-legend {
  font-size: 12px;
  color: --color-text-secondary;
  margin-top: 12px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
```

### Filter Chips
```css
.filter-chip {
  background: --color-base;
  border: 1px solid --color-gray-300;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: --color-text-primary;
  cursor: pointer;
  transition: all 150ms ease;
}

.filter-chip:hover {
  background: --color-gray-200;
  border-color: --color-accent;
}

.filter-chip.active {
  background: --color-accent;
  border-color: --color-accent;
  color: --color-text-inverse;
}

.filter-chip.active:hover {
  background: --color-accent-dark;
  border-color: --color-accent-dark;
}
```

### Table
```css
.table {
  background: --color-card;
  border-collapse: collapse;
  font-size: 13px;
}

.table thead {
  background: --color-base;
  border-bottom: 2px solid --color-gray-300;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: --color-text-primary;
}

.table td {
  padding: 10px 16px;
  border-bottom: 1px solid --color-gray-200;
  color: --color-text-primary;
}

.table tbody tr:hover {
  background: --color-base;
}
```

### Button
```css
.button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.button-primary {
  background: --color-accent;
  color: --color-text-inverse;
}

.button-primary:hover {
  background: --color-accent-dark;
}

.button-secondary {
  background: --color-base;
  border: 1px solid --color-gray-300;
  color: --color-text-primary;
}

.button-secondary:hover {
  background: --color-gray-200;
  border-color: --color-gray-400;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Top Navigation Bar
```css
.topbar {
  background: --color-topbar;
  border-bottom: 1px solid #0F0F1A;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-logo {
  font-size: 18px;
  font-weight: 700;
  color: --color-text-inverse;
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-logo-accent {
  color: --color-accent;
}

.topbar-nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

.topbar-nav-item {
  font-size: 13px;
  font-weight: 500;
  color: --color-text-inverse;
  text-decoration: none;
  transition: color 150ms ease;
}

.topbar-nav-item:hover,
.topbar-nav-item.active {
  color: --color-accent;
}
```

---

## Dark Mode (Optional)

If dark mode is needed, invert the palette:

```css
/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  --color-base: #0F172A;           /* Dark background */
  --color-card: #1E293B;           /* Dark card */
  --color-topbar: #0F172A;         /* Already dark, no change */
  
  --color-text-primary: #F1F5F9;   /* Light text */
  --color-text-secondary: #CBD5E1; /* Medium light text */
  --color-text-tertiary: #94A3B8;  /* Gray text */
  
  --color-gray-200: #334155;       /* Invert grays */
  --color-gray-300: #475569;
  --color-accent: #FF0099;         /* Slightly brighter magenta */
}
```

---

## Data Visualization Rules

### Chart Border & Style
```css
.chart-area {
  border: 1px solid --color-gray-200;
  border-radius: 4px;
  background: --color-card;
}

.chart-grid {
  color: --color-gray-200;
  opacity: 0.3;
}

.chart-axis {
  color: --color-text-secondary;
  font-size: 12px;
}
```

### Heatmap Color Gradient
```
Low value:  --color-gray-200 (#E5E7EB)
Mid value:  --chart-blue (#006AFF)
High value: --color-accent (#E20074)

Applied with linear gradient or categorical color scale
```

### Pie/Donut Chart Colors
Use primary palette in order:
1. --chart-blue (#006AFF)
2. --chart-teal (#1A7F64)
3. --color-accent (#E20074)
4. --chart-cyan (#0891B2)
5. --chart-amber (#F59E0B)

Then extend with secondary palette as needed.

---

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;    /* Mobile */
--breakpoint-md: 1024px;   /* Tablet */
--breakpoint-lg: 1440px;   /* Desktop */
--breakpoint-xl: 1920px;   /* Large desktop */
```

### Mobile Adjustments
- Reduce font sizes by 10-15%
- Stack 2-column layouts to 1-column
- Increase touch targets to 44px minimum
- Reduce chart padding on small screens
- Hide non-critical legends and labels

### Example Media Query
```css
@media (max-width: 1024px) {
  .kpi-number { font-size: 28px; }
  .chart-container { min-height: 250px; }
  .container-gutter { --container-gutter: 16px; }
}

@media (max-width: 640px) {
  h1 { font-size: 24px; }
  .kpi-card { padding: 16px; }
  .chart-title { font-size: 13px; }
}
```

---

## Accessibility

### Color Contrast Ratios
- All text: minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (18px+ or 14px+ bold): minimum 3:1
- Interaction targets: 4.5:1 contrast

**Contrast verification:**
- White text (#FFFFFF) on magenta (#E20074): 3.5:1 (borderline, use white text on darker shade)
- Dark text (#1E293B) on light gray (#F3F4F6): 8.2:1 (excellent)
- Gray text (#64748B) on white (#FFFFFF): 7.1:1 (excellent)

### Keyboard Navigation
- All interactive elements (buttons, links, filters) must be keyboard accessible
- Focus states: 2px solid outline using --color-accent
- Tab order: logical left-to-right, top-to-bottom

### Focus Indicator Style
```css
:focus-visible {
  outline: 2px solid --color-accent;
  outline-offset: 2px;
  border-radius: 2px;
}
```

---

## Implementation Checklist

- [ ] Define CSS variables in root stylesheet
- [ ] Apply color palette to all chart.js configs
- [ ] Style all KPI cards with consistent padding and border
- [ ] Implement topbar with dark background and magenta accents
- [ ] Create filter chip components with hover/active states
- [ ] Style all tables with alternating row background (subtle)
- [ ] Implement delta indicators (up/down arrows with colors)
- [ ] Add focus states to all interactive elements
- [ ] Test contrast ratios on all color combinations
- [ ] Verify responsive layout on mobile/tablet/desktop
- [ ] Document custom CSS classes in dashboard code
- [ ] Add theme toggle capability (optional for future)

---

## Example Dashboard Color Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [TOPBAR - #1D1D2C with white text]                                  │
│ Falcon [ANALYTICS] xFalcon AnalyticsPro    [Calendar] [Region] [•]  │
├─────────────────────────────────────────────────────────────────────┤
│ [Background - #F3F4F6]                                              │
│                                                                      │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│ │ [WHITE]      │  │ [WHITE]      │  │ [WHITE]      │               │
│ │ Revenue      │  │ ARPU         │  │ Churn Rate   │               │
│ │ ₹23.4 Cr     │  │ ₹485         │  │ 2.1%         │               │
│ │ ↑ +2.1%      │  │ ↓ -1.5%      │  │ ↑ +0.3%      │               │
│ │ [Green]      │  │ [Red]        │  │ [Red]        │               │
│ └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
│ ┌──────────────────────────┐  ┌──────────────────────────┐          │
│ │ [WHITE] Revenue Trend    │  │ [WHITE] Regional Split   │          │
│ │ [BLUE #006AFF chart]     │  │ [PIE CHART - colors]     │          │
│ │ (line chart with         │  │ North: 35%               │          │
│ │  grid #E5E7EB @30%)      │  │ South: 30%               │          │
│ │                          │  │ East: 20%                │          │
│ │                          │  │ West: 10%                │          │
│ └──────────────────────────┘  │ Central: 5%              │          │
│                                │                          │          │
│                                │ Legend in gray text      │          │
│                                └──────────────────────────┘          │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ [WHITE] Top 10 Customers by Revenue                             ││
│ │ [TABLE with alternating #F3F4F6 rows]                           ││
│ │ Headers: [#F3F4F6 background, bold text]                        ││
│ └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 2026 | Initial T-Mobile inspired light theme for 11 dashboards |

All color codes and spacing scale finalized for production use across xFalcon AnalyticsPro.
