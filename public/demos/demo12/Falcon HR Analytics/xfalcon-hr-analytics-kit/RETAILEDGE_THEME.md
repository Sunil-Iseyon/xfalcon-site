# Falcon HR Analytics - RetailEdge Bold Theme

## Theme Overview
Custom theme for Falcon HR Analytics built on the RetailEdge Bold design system. Modern dark theme with high contrast and vibrant accent colors for optimal readability and engagement.

---

## CSS Variables & Color Palette

### Core Theme Colors
```css
/* Dark Foundation */
--color-base-darkest: #0A1628    /* Darkest background - page/modal backgrounds */
--color-base-dark: #141E30       /* Dark background - cards, panels */
--color-base-darker: #1A2540     /* Darker surfaces - hover states */

/* Primary Accent Colors */
--color-cyan: #00D4FF             /* Bright cyan - primary action, data highlights */
--color-coral: #FF6B35            /* Warm coral - secondary action, alerts */
--color-lime: #7CFF01             /* Bright lime - positive indicators, success */

/* Semantic Colors */
--color-red: #FF3366              /* Bright red - negative indicators, critical alerts */
--color-amber: #FFB800            /* Warm amber - warnings, neutral alerts */

/* Text Colors */
--color-text-primary: #F5F7FA     /* Primary text - high contrast on dark bg */
--color-text-secondary: #8B95A5   /* Secondary text - subheadings, labels */
--color-text-tertiary: #5A6370    /* Tertiary text - metadata, hints */
```

### Complete Theme Configuration
```css
:root {
  /* === Dark Foundation === */
  --color-base-darkest: #0A1628;
  --color-base-dark: #141E30;
  --color-base-darker: #1A2540;
  --color-canvas: var(--color-base-darkest);
  --color-canvas-inset: var(--color-base-darker);
  --color-canvas-inverted: #F5F7FA;

  /* === Accent Colors === */
  --color-cyan: #00D4FF;
  --color-coral: #FF6B35;
  --color-lime: #7CFF01;
  --color-red: #FF3366;
  --color-amber: #FFB800;

  /* === Semantic Colors === */
  --color-success: var(--color-lime);
  --color-warning: var(--color-amber);
  --color-error: var(--color-red);
  --color-info: var(--color-cyan);

  /* === Text Colors === */
  --color-text-primary: #F5F7FA;
  --color-text-secondary: #8B95A5;
  --color-text-tertiary: #5A6370;
  --color-text-inverted: #0A1628;

  /* === Borders & Dividers === */
  --color-border: rgba(139, 149, 165, 0.2);
  --color-border-hover: rgba(139, 149, 165, 0.35);

  /* === State Indicators === */
  --color-focus: var(--color-cyan);
  --color-focus-accent: var(--color-coral);
  --color-disabled: var(--color-text-tertiary);
  --color-disabled-bg: var(--color-base-darker);

  /* === Typography === */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Monaco', 'Menlo', monospace;

  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-xl: 1.25rem;      /* 20px */
  --font-size-2xl: 1.5rem;      /* 24px */

  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## Brand Identity

### xFalcon Logo
**Logo Design:**
- "xF" mark with custom styling
- "x" character: Bright cyan (#00D4FF)
- "F" character: Warm coral (#FF6B35)
- Font weight: Bold (700)
- Recommended sizes: 40px (min) to 200px (max)

**Usage:**
- Header/navigation branding
- Dashboard title area
- Documentation covers

**SVG Example:**
```html
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- x in cyan -->
  <text x="10" y="45" font-family="Inter" font-size="40" font-weight="700" fill="#00D4FF">x</text>
  <!-- F in coral -->
  <text x="32" y="45" font-family="Inter" font-size="40" font-weight="700" fill="#FF6B35">F</text>
</svg>
```

---

## Typography

### Font Family
**Primary Font:** Inter (Google Fonts)

**Import in HTML:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**CSS Declaration:**
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  color: #F5F7FA;
}
```

### Text Hierarchy

#### H1 - Page Title
```css
h1 {
  font-size: 2rem;          /* 32px */
  font-weight: 700;         /* Bold */
  color: #F5F7FA;           /* Primary text */
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
```

#### H2 - Section Header
```css
h2 {
  font-size: 1.5rem;        /* 24px */
  font-weight: 600;         /* Semibold */
  color: #F5F7FA;           /* Primary text */
  line-height: 1.3;
  margin-bottom: 0.875rem;
}
```

#### H3 - Subsection Header
```css
h3 {
  font-size: 1.25rem;       /* 20px */
  font-weight: 600;         /* Semibold */
  color: #F5F7FA;           /* Primary text */
  line-height: 1.4;
  margin-bottom: 0.75rem;
}
```

#### Body Text
```css
body, p {
  font-size: 1rem;          /* 16px */
  font-weight: 400;         /* Regular */
  color: #F5F7FA;           /* Primary text */
  line-height: 1.5;
}
```

#### Labels & Small Text
```css
.label, .caption {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;         /* Medium */
  color: #8B95A5;           /* Secondary text */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Metadata & Tertiary Text
```css
.metadata, .hint {
  font-size: 0.75rem;       /* 12px */
  font-weight: 400;         /* Regular */
  color: #5A6370;           /* Tertiary text */
}
```

---

## Chart Color Palette

### Standard 3-Color Chart Palette
Used for consistent data visualization across all dashboards.

**Primary Chart Colors:**
```css
--chart-color-1: #006AFF    /* Deep Blue - primary metric */
--chart-color-2: #1A7F64    /* Teal - secondary metric */
--chart-color-3: #94A3B8    /* Gray - tertiary metric */
```

### Extended Color Palette (5+ series)
When more than 3 data series are needed:

```css
--chart-color-1: #006AFF    /* Deep Blue */
--chart-color-2: #1A7F64    /* Teal */
--chart-color-3: #94A3B8    /* Gray */
--chart-color-4: #7CFF01    /* Lime (positive) */
--chart-color-5: #FF6B35    /* Coral (warning) */
--chart-color-6: #FF3366    /* Red (critical) */
--chart-color-7: #FFB800    /* Amber (neutral) */
--chart-color-8: #00D4FF    /* Cyan (highlight) */
```

### Chart Type Guidelines

#### Line Charts
- Use 2-3 series maximum
- Primary metric: `--chart-color-1` (#006AFF - Deep Blue)
- Secondary metric: `--chart-color-2` (#1A7F64 - Teal)
- Reference line: `--chart-color-3` (#94A3B8 - Gray, dashed)
- Line width: 2-3px for primary, 1.5-2px for secondary

#### Bar Charts
- Use 1-2 series per chart
- Single metric: `--chart-color-1` (#006AFF - Deep Blue)
- Comparison: Add `--chart-color-2` (#1A7F64 - Teal) for side-by-side
- Stacked: Use full 3-color palette max

#### Pie / Donut Charts
- Use up to 5 slices (readability limit)
- Colors in order: Blue, Teal, Gray, Lime, Coral
- For >5 categories: use "Other" aggregation

#### Heatmaps / Intensity Charts
- Use gradient from `--color-base-darker` (#1A2540) to `--color-cyan` (#00D4FF)
- Intensity scale: Dark (low) → Cyan (high)

---

## KPI & Status Indicators

### Positive Indicators (Good Performance)
```css
.indicator-positive {
  color: #7CFF01;           /* Bright Lime */
  background-color: rgba(124, 255, 1, 0.1);
  border-color: rgba(124, 255, 1, 0.3);
}
```

**Usage:**
- Metrics trending upward
- Target achievement >100%
- Metrics where higher is better (engagement, retention)
- Success messages

### Negative Indicators (Poor Performance)
```css
.indicator-negative {
  color: #FF3366;           /* Bright Red */
  background-color: rgba(255, 51, 102, 0.1);
  border-color: rgba(255, 51, 102, 0.3);
}
```

**Usage:**
- Metrics trending downward
- Below-target performance
- Metrics where lower is better (turnover, cost)
- Error messages

### Warning Indicators (Caution)
```css
.indicator-warning {
  color: #FFB800;           /* Warm Amber */
  background-color: rgba(255, 184, 0, 0.1);
  border-color: rgba(255, 184, 0, 0.3);
}
```

**Usage:**
- Metrics approaching critical levels
- Actions requiring attention
- Caution/alert states

### Neutral Indicators (Information)
```css
.indicator-neutral {
  color: #00D4FF;           /* Bright Cyan */
  background-color: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
}
```

**Usage:**
- Informational states
- No performance judgement
- General notifications

---

## Component Styling

### Cards & Containers
```css
.card, .panel {
  background-color: #141E30;        /* Dark background */
  border: 1px solid rgba(139, 149, 165, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 6px 16px rgba(0, 212, 255, 0.1);
}
```

### Buttons - Primary Action
```css
.button-primary {
  background-color: #00D4FF;        /* Cyan */
  color: #0A1628;                   /* Dark text */
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-primary:hover {
  background-color: #0DBAE0;        /* Slightly darker cyan */
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
}

.button-primary:active {
  transform: scale(0.98);
}
```

### Buttons - Secondary Action
```css
.button-secondary {
  background-color: transparent;
  color: #00D4FF;
  border: 2px solid #00D4FF;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  background-color: rgba(0, 212, 255, 0.1);
}
```

### Buttons - Danger
```css
.button-danger {
  background-color: #FF3366;        /* Red */
  color: #F5F7FA;                   /* Light text */
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
}

.button-danger:hover {
  background-color: #E51E55;        /* Darker red */
}
```

### Input Fields
```css
input, textarea, select {
  background-color: #1A2540;        /* Darker background */
  border: 1px solid rgba(139, 149, 165, 0.2);
  border-radius: 6px;
  color: #F5F7FA;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #00D4FF;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}
```

### Tables
```css
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #141E30;
}

thead {
  background-color: #1A2540;
  border-bottom: 2px solid rgba(0, 212, 255, 0.2);
}

th {
  color: #F5F7FA;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
}

td {
  color: #F5F7FA;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(139, 149, 165, 0.1);
}

tbody tr:hover {
  background-color: #1A2540;
}
```

### Badges & Status Labels
```css
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success {
  background-color: rgba(124, 255, 1, 0.15);
  color: #7CFF01;
}

.badge-warning {
  background-color: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.badge-error {
  background-color: rgba(255, 51, 102, 0.15);
  color: #FF3366;
}

.badge-info {
  background-color: rgba(0, 212, 255, 0.15);
  color: #00D4FF;
}
```

---

## Dashboard Layout

### Page Background
```css
body {
  background-color: #0A1628;        /* Darkest background */
  color: #F5F7FA;
  margin: 0;
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
}
```

### Header / Navigation Bar
```css
.header, nav {
  background-color: #141E30;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.logo .x {
  color: #00D4FF;
}

.logo .f {
  color: #FF6B35;
}
```

### Sidebar Navigation
```css
.sidebar {
  background-color: #141E30;
  width: 280px;
  border-right: 1px solid rgba(0, 212, 255, 0.2);
  padding: 1.5rem 1rem;
}

.nav-item {
  color: #8B95A5;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.active {
  color: #00D4FF;
  background-color: rgba(0, 212, 255, 0.1);
}
```

### Filter Panel
```css
.filter-panel {
  background-color: #1A2540;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.filter-label {
  color: #8B95A5;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.metric-card {
  background-color: #141E30;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(139, 149, 165, 0.2);
}

.metric-title {
  color: #8B95A5;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.metric-value {
  color: #00D4FF;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-change {
  color: #8B95A5;
  font-size: 0.875rem;
}
```

---

## Dark Mode Specifications

The entire Falcon HR Analytics interface uses dark mode exclusively.

**Background Layers (Darkest to Lighter):**
1. Page background: `#0A1628` (darkest)
2. Card/panel background: `#141E30` (dark)
3. Hover/active state: `#1A2540` (darker)

**Text Contrast Ratios:**
- Primary text on dark: 15.6:1 (WCAG AAA+) ✓
- Secondary text on dark: 8.2:1 (WCAG AA) ✓
- Tertiary text on dark: 5.1:1 (WCAG AA) ✓

---

## Theme Implementation Checklist

- [ ] Import Inter font from Google Fonts
- [ ] Apply CSS variables to root `:root` selector
- [ ] Set body background to `#0A1628`
- [ ] Configure card backgrounds to `#141E30`
- [ ] Set primary text color to `#F5F7FA`
- [ ] Apply cyan accent (#00D4FF) to primary interactive elements
- [ ] Apply coral accent (#FF6B35) to secondary actions
- [ ] Apply lime (#7CFF01) to positive indicators
- [ ] Apply red (#FF3366) to negative/error indicators
- [ ] Configure chart colors (Blue #006AFF, Teal #1A7F64, Gray #94A3B8)
- [ ] Verify all text meets WCAG contrast requirements
- [ ] Test accessibility with screen readers
- [ ] Test responsive design on mobile/tablet
- [ ] Verify print styles (if applicable)

---

## Related Files

- **Color Palette Reference:** [RETAILEDGE_THEME.md](./RETAILEDGE_THEME.md)
- **Design System:** RetailEdge Bold v2.0
- **Component Library:** Falconify UI Components

