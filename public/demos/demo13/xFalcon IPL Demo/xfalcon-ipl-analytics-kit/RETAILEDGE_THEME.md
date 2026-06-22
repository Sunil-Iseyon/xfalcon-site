# xFalcon IPL Analytics Hub - Theme & Branding Guide

**Project:** xFalcon IPL Analytics Hub
**Theme Name:** QBR Turquoise Dark (Extracted from Pop Lab QBR PPTX)
**Last Updated:** 2026-03-31
**Designer Notes:** Near-black base with turquoise primary accent and coral-orange secondary. Extracted from QBR_Q2_2025.pptx presentation.

---

## Color Palette

### Core Theme Colors

| Usage | Color | Hex Code | RGB | Usage Context |
|-------|-------|----------|-----|----------------|
| **Base/Background** | Near Black | `#1A1A1A` | rgb(26, 26, 26) | Page background, darkest element |
| **Card Background** | Dark Gray | `#252525` | rgb(37, 37, 37) | Dashboard cards, panels |
| **Hover State** | Medium Dark | `#2E2E2E` | rgb(46, 46, 46) | Cards on hover, interactive elements |
| **Primary Accent** | Turquoise | `#4ECDC4` | rgb(78, 205, 196) | Titles, KPI values, card borders, CTAs |
| **Secondary Accent** | Coral Orange | `#F7946B` | rgb(247, 148, 107) | Secondary highlights, numbers, chart accent |
| **Success/Positive** | Green | `#4CAF50` | rgb(76, 175, 80) | Win indicators, growth metrics, KPI up |
| **Danger/Negative** | Red-Pink | `#FF4757` | rgb(255, 71, 87) | Loss indicators, decline metrics, KPI down |

### Text Colors

| Role | Color | Hex Code | RGB | Usage |
|------|-------|----------|-----|-------|
| **Primary Text** | White | `#FFFFFF` | rgb(255, 255, 255) | Body text, labels, main content |
| **Secondary Text** | Slate Gray | `#8B95A5` | rgb(139, 149, 165) | Subheadings, meta information, descriptions |
| **Tertiary Text** | Dim Gray | `#5A6370` | rgb(90, 99, 112) | Placeholder text, disabled state, footer |
| **Accent Text** | Turquoise | `#4ECDC4` | rgb(78, 205, 196) | Important labels, callouts, section titles |

### Chart Color Palette

**Rule:** Charts use Turquoise, Coral-Orange, and Gray as the 3-color system. Red and Green are reserved for KPI indicators ONLY.

| Segment | Color | Hex Code | Purpose |
|---------|-------|----------|---------|
| **Primary Data** | Turquoise | `#4ECDC4` | Main metric line/bar, current year |
| **Secondary Data** | Coral Orange | `#F7946B` | Secondary metric, comparison, accent |
| **Tertiary Data** | Cool Gray | `#94A3B8` | Neutral comparison, baseline, prior year |
| **Extended Series 4** | Soft Pink | `#FF6B6B` | Additional series if needed |
| **Extended Series 5** | Amber | `#F59E0B` | Warm accent for final series |
| **KPI Up Arrow** | Green | `#4CAF50` | Positive indicators ONLY (never in charts) |
| **KPI Down Arrow** | Red-Pink | `#FF4757` | Negative indicators ONLY (never in charts) |

**Chart Example:**
```
Runs Scored (Series 1): #4ECDC4 (Turquoise)
Wickets Lost (Series 2): #F7946B (Coral Orange)
Run Rate (Series 3): #94A3B8 (Gray)
→ Win/Loss arrow: #7CFF01 (Green) or #FF3366 (Red)
→ Revenue growth: #7CFF01 (Green) ↑ or #FF3366 (Red) ↓
```

### Extended Color Palette

| Purpose | Color | Hex Code | Notes |
|---------|-------|----------|-------|
| Light Blue (Alternative) | Sky Blue | `#0EA5E9` | Used for extended chart series |
| Warm Accent | Amber | `#F59E0B` | Accent or warning states |
| Border/Divider | Navy Border | `#1F3A52` | Subtle dividers between sections |
| Shadow/Transparency | Black Overlay | `#000000` | 20-30% opacity for shadows |

---

## Logo & Branding

### xFalcon Logo

The xFalcon brand uses a split-color "xF" monogram:

```
  x  F
  |  |
#F26522  #006AFF
(Orange) (Blue)
```

**Implementation:**
- **"x"** rendered in IPL Orange (#F26522)
- **"F"** rendered in Electric Blue (#006AFF)
- Font: Inter Bold, 32-48px depending on context
- Logo appears in all topbars (left-aligned)
- Minimum spacing: 12px around logo

**Logo Variants:**
1. **Full Logo:** "xFalcon IPL Analytics Hub" (header/hero sections)
2. **Icon Only:** "xF" monogram (small topbar, favicon, 24px)
3. **Stacked:** Logo + "IPL Analytics Hub" (mobile layouts)

---

## Typography

### Font Family: Inter (Google Fonts)

```html
<!-- Import in HTML head: -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- CSS: -->
font-family: 'Inter', sans-serif;
```

### Typography Scale

| Role | Font Weight | Size | Line Height | Usage |
|------|-----------|------|------------|-------|
| **H1 (Hero Title)** | 800 | 48px | 1.2 | Page titles, dashboard names |
| **H2 (Section Title)** | 700 | 32px | 1.3 | Major section headings |
| **H3 (Subsection)** | 700 | 24px | 1.4 | Card titles, report sections |
| **H4 (Card Header)** | 600 | 18px | 1.4 | KPI labels, chart titles |
| **Body Large** | 400 | 16px | 1.5 | Main body text, descriptions |
| **Body Regular** | 400 | 14px | 1.6 | Standard content, paragraphs |
| **Body Small** | 400 | 12px | 1.5 | Meta info, captions, footer |
| **Label** | 500 | 13px | 1.4 | Form labels, table headers |
| **Monospace (Data)** | 400 | 13px | 1.4 | Numbers, stats, tabular data (use Monaco or Courier) |

### Text Color Application

```css
h1, h2, h3 { color: #F5F7FA; }      /* Primary text, off-white */
h4, label { color: #8B95A5; }       /* Secondary text, slate */
p { color: #F5F7FA; }               /* Body text, off-white */
.meta, .footnote { color: #5A6370; } /* Tertiary text, dim gray */
.accent { color: #F26522; }         /* IPL Orange for emphasis */
.subtext { color: #8B95A5; }        /* Secondary information */
```

---

## Component Styling

### Buttons

**Primary Button (Call-to-Action)**
```css
Background: #F26522 (IPL Orange)
Text: #FFFFFF (white)
Padding: 12px 24px
Border Radius: 6px
Font Weight: 600
Font Size: 14px
Hover State: Darken orange by 10% (#D95118)
Active State: Darken orange by 15% (#C24814)
Transition: all 200ms ease-in-out
Shadow: 0 4px 12px rgba(242, 101, 34, 0.3)
```

**Secondary Button**
```css
Background: #152238 (Dark Slate)
Text: #006AFF (Electric Blue)
Border: 2px solid #006AFF
Padding: 10px 22px
Border Radius: 6px
Font Weight: 600
Font Size: 14px
Hover State: Background becomes #1A2D47, Border becomes #0052CC
```

**Tertiary Button (Outline)**
```css
Background: transparent
Text: #F26522 (IPL Orange)
Border: 1px solid #F26522
Padding: 10px 22px
Border Radius: 6px
Font Weight: 500
Font Size: 14px
Hover State: Background becomes rgba(242, 101, 34, 0.1)
```

### Cards & Panels

**Standard Card**
```css
Background: #152238 (Dark Slate)
Border: 1px solid #1A2D47 (Deep Navy)
Border Radius: 8px
Padding: 20px
Margin Bottom: 16px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
Hover Shadow: 0 4px 16px rgba(0, 0, 0, 0.4)
Transition: all 200ms ease-in-out
```

**KPI Card (with Metric Highlight)**
```css
Background: #152238
Border-Left: 4px solid #F26522 (Orange accent)
Padding: 16px 20px
Border Radius: 4px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.2)

KPI Value Font: Monospace, 28px, Bold, #F5F7FA
KPI Label Font: 13px, #8B95A5
KPI Change Font: 12px, Bold
  → If positive (+5.2%): #7CFF01 (Neon Lime) with ↑ arrow
  → If negative (-3.1%): #FF3366 (Vivid Red) with ↓ arrow
```

### Inputs & Form Elements

**Text Input, Select, Textarea**
```css
Background: #0D1B2A (Midnight Blue)
Border: 1px solid #1A2D47 (Deep Navy)
Color: #F5F7FA (Off-white)
Padding: 10px 12px
Border Radius: 4px
Font Size: 14px
Focus State:
  Border-Color: #F26522 (IPL Orange)
  Shadow: 0 0 0 3px rgba(242, 101, 34, 0.1)
Disabled State:
  Background: #0A1118
  Color: #5A6370 (Dim Gray)
  Cursor: not-allowed
Placeholder Color: #5A6370 (Dim Gray)
```

**Checkbox & Radio Button**
```css
Size: 18px x 18px
Border: 2px solid #1A2D47
Border Radius: 3px (checkbox) or 50% (radio)
Checked Background: #F26522 (IPL Orange)
Checked Border: #F26522
Focus Ring: 3px outline of #006AFF (Electric Blue)
```

### Filters & Dropdowns

**Filter Tag/Chip**
```css
Background: #1A2D47 (Deep Navy)
Text: #F5F7FA (Off-white)
Padding: 6px 12px
Border Radius: 20px
Font Size: 12px
Font Weight: 500
Margin Right: 8px
Close Button: ✕ #8B95A5
Hover State: Background becomes #006AFF, Text becomes #FFFFFF
```

**Dropdown Menu**
```css
Background: #152238 (Dark Slate)
Border: 1px solid #1A2D47
Border Radius: 4px
Shadow: 0 4px 12px rgba(0, 0, 0, 0.4)
Padding: 4px 0

Option Item:
  Padding: 10px 16px
  Color: #F5F7FA
  Hover Background: #1A2D47 (Deep Navy)
  Hover Text: #F26522 (IPL Orange)
  Selected Background: #006AFF (Electric Blue)
  Selected Text: #FFFFFF
```

### Tables

**Table Header Row**
```css
Background: #0D1B2A (Midnight Blue)
Text: #8B95A5 (Slate Gray), Font Weight: 600
Font Size: 12px
Padding: 12px 16px
Border-Bottom: 2px solid #1A2D47
```

**Table Data Row**
```css
Background: transparent (inherit parent)
Text: #F5F7FA (Off-white)
Padding: 12px 16px
Border-Bottom: 1px solid #1A2D47 (subtle divider)
Font Size: 14px

Hover Row: Background becomes #152238 (Dark Slate, 20% opacity)
Alternate Row: Background becomes #0A1118 (every other row, optional)
```

**Table Column Types:**
- Numeric (right-aligned): Use monospace font, #F5F7FA
- Text (left-aligned): Regular font, #F5F7FA
- Status: Use badge styling (small background, rounded, padding)

### Badges & Status Indicators

**Badge Styles**

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| Success | #1A7F64 (Teal) | #FFFFFF | Match won, positive outcome |
| Warning | #F59E0B (Amber) | #000000 | Ongoing, neutral state |
| Error | #FF3366 (Red) | #FFFFFF | Match lost, error state |
| Info | #006AFF (Blue) | #FFFFFF | Information, neutral |

```css
Padding: 4px 8px
Border Radius: 3px
Font Size: 11px
Font Weight: 600
```

### Dividers & Borders

```css
Subtle Divider: 1px solid #1A2D47 (Deep Navy)
Medium Divider: 1px solid #1A7F64 (Teal), 50% opacity
Accent Divider: 2px solid #F26522 (IPL Orange)
Border Color (general): #1A2D47 (Deep Navy)
Shadow Color: rgba(0, 0, 0, 0.3-0.4)
```

---

## Gradients & Effects

### Gradient Examples

**Hero Section Gradient (optional)**
```css
background: linear-gradient(135deg, #0D1B2A 0%, #152238 50%, #1A2D47 100%);
```

**Accent Gradient (Button Hover)**
```css
background: linear-gradient(90deg, #F26522 0%, #E64A18 100%);
```

**KPI Card Accent**
```css
border-left: 4px solid;
border-image: linear-gradient(180deg, #F26522 0%, #006AFF 100%) 1;
```

### Glows & Shadows

**Subtle Glow (KPI Highlight)**
```css
box-shadow: 0 0 20px rgba(242, 101, 34, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2);
```

**Interactive Glow (Button Hover)**
```css
box-shadow: 0 4px 12px rgba(242, 101, 34, 0.3);
```

**Deep Shadow (Card)**
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

**Elevation Shadow (Modal)**
```css
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
```

---

## CSS Variables (Design Tokens)

Define these in root `:root` selector for maintainability:

```css
:root {
  /* Colors */
  --color-base: #0D1B2A;
  --color-card: #152238;
  --color-hover: #1A2D47;
  --color-primary-accent: #F26522;
  --color-secondary-accent: #006AFF;
  --color-success: #7CFF01;
  --color-danger: #FF3366;

  --color-text-primary: #F5F7FA;
  --color-text-secondary: #8B95A5;
  --color-text-tertiary: #5A6370;

  --color-chart-primary: #006AFF;
  --color-chart-secondary: #1A7F64;
  --color-chart-tertiary: #94A3B8;
  --color-chart-extended1: #0EA5E9;
  --color-chart-extended2: #F59E0B;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-h1: 48px;
  --font-size-h2: 32px;
  --font-size-h3: 24px;
  --font-size-h4: 18px;
  --font-size-body: 14px;
  --font-size-small: 12px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 10px 40px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

### Usage Example:

```css
.button-primary {
  background-color: var(--color-primary-accent);
  color: #FFFFFF;
  font-family: var(--font-family);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.button-primary:hover {
  box-shadow: var(--shadow-lg);
}
```

---

## Topbar & Navigation

### Topbar Layout (All Dashboards)

**Height:** 64px
**Background:** `#0D1B2A` (Midnight Blue)
**Border Bottom:** 1px solid `#1A2D47` (Deep Navy)

**Content:**
```
[Logo]  [Page Title]         [Filters]  [Settings]
[xF]    Dashboard Name       [Dropdowns] [⚙️]
```

**Logo Position:** Left, 12px from edge
**Page Title:** "xFalcon IPL Analytics Hub / Dashboard Name"
  - "xFalcon IPL Analytics Hub" in `#8B95A5` (Secondary Text)
  - "/" divider in `#5A6370` (Tertiary)
  - "Dashboard Name" in `#F5F7FA` (Primary Text), bold

**Filters:** Center-right, horizontally stacked
**Settings Icon:** Right-most, 16x16px, gray color

---

## Dark Theme Compliance

### Light Text on Dark Background
- Ensure WCAG AA contrast (4.5:1 minimum for body text)
- Primary text (#F5F7FA) on base (#0D1B2A): ~16:1 contrast ✓
- Secondary text (#8B95A5) on card (#152238): ~4.8:1 contrast ✓
- All chart colors tested against dark backgrounds

### Eye Comfort
- No pure white text (off-white #F5F7FA used instead)
- Avoid full saturation bright colors for extended reading
- Use opacity/transparency for layering, not 100% pure colors

---

## Chart Color Rules (CRITICAL)

### Rule Summary
1. **Data Series:** Blue (#006AFF), Teal (#1A7F64), Gray (#94A3B8) ONLY
2. **KPI Indicators:** Red/Green arrows ONLY for directional change
3. **Never Use Red/Green in Data Charts** (causes accessibility issues for colorblind users)
4. **Extended Series:** Light Blue (#0EA5E9), Amber (#F59E0B) if needed

### Example Dashboard Charts

**Chart 1: Match Performance (Runs vs Wickets)**
- Runs Scored: Blue (#006AFF)
- Wickets Lost: Teal (#1A7F64)
- Run Rate Trend: Gray (#94A3B8)
- ✗ DO NOT use green for runs, red for wickets

**Chart 2: Win Percentage Over Season**
- Win Percentage Line: Blue (#006AFF)
- Target Line (50%): Gray (#94A3B8, dashed)
- KPI Card showing +5.2% growth: Green arrow #7CFF01 ONLY in KPI

**Chart 3: Franchise Revenue Breakdown (Stacked Bar)**
- Title Sponsorship: Blue (#006AFF)
- Jersey Sponsorship: Teal (#1A7F64)
- Gate Receipts: Gray (#94A3B8)
- Broadcast Share: Light Blue (#0EA5E9)
- Prize Money: Amber (#F59E0B)

---

## Responsive Design

### Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, full-width cards |
| Tablet | 640px - 1024px | 2-column grid, stacked on scroll |
| Desktop | > 1024px | Multi-column dashboards, side panels |

### Topbar Adjustments
- **Mobile:** Logo + Menu hamburger (icon), title below logo
- **Tablet:** Logo + Title, filters collapse into dropdown
- **Desktop:** Full layout as specified

### Font Size Adjustments (Optional)
```css
@media (max-width: 768px) {
  h1 { font-size: 32px; }
  h2 { font-size: 24px; }
  body { font-size: 13px; }
}
```

---

## Implementation Checklist

- [ ] Import Inter font from Google Fonts
- [ ] Define CSS variables in :root selector
- [ ] Set body background to #0D1B2A
- [ ] Color all text with #F5F7FA (primary) or #8B95A5 (secondary)
- [ ] Style buttons with #F26522 (orange) primary, #006AFF (blue) secondary
- [ ] Create card component with #152238 background
- [ ] Add KPI card with left border accent (#F26522)
- [ ] Define chart color palette (Blue/Teal/Gray only, no red/green in data)
- [ ] Test topbar with xF logo (orange x, blue F)
- [ ] Verify contrast ratios (WCAG AA minimum 4.5:1)
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Apply shadows and glows from design tokens
- [ ] Configure all transitions (200ms default)

---

## Accessibility Notes

### Color Blindness Compatibility
- Avoid red/green in data visualization (use Blue/Teal/Gray)
- Use shape/pattern differentiation in addition to color
- KPI arrows (+/−) paired with text labels, not color alone

### High Contrast Mode
- Test with Windows High Contrast settings
- Ensure all text meets WCAG AA (4.5:1) or AAA (7:1) standards
- Verify borders/outlines visible in high contrast

### Keyboard Navigation
- All buttons focusable with Tab key
- Focus indicator visible (outline or ring)
- Dropdown menus navigable with arrow keys

### Screen Reader Compatibility
- All images have alt text
- Form labels associated with inputs (label for="id")
- Table headers marked with <th> scope="col"
- Skip-to-content link at top of page

---

**Theme Version:** 1.0
**Last Updated:** 2026-03-31
**Maintained By:** xFalcon Analytics Design Team
**Contact:** design@xfalcon-analytics.com
