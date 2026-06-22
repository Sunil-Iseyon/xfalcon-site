# xFalcon AnalyticsPro Theme Specification
**Food & Snacks CPG | Light Background Edition**

---

## Theme Overview

**Theme Name:** RetailEdge Light  
**Background:** #F3F4F6 (light neutral gray)  
**Contrast:** 4.5:1+ on all text (WCAG AA compliant)  
**Device Support:** Desktop 1920×1080+, Tablet, Mobile responsive

---

## Color Palette

### Primary Colors

| Color Name | Hex | RGB | Usage |
|------------|-----|-----|-------|
| Light Background | #F3F4F6 | 243, 244, 246 | Page background |
| White | #FFFFFF | 255, 255, 255 | Card backgrounds, modals |
| Navy Header | #0F172A | 15, 23, 42 | Header, section titles, borders |
| Dark Text | #1F2937 | 31, 41, 55 | Body text, table rows |

### Accent Colors

| Color Name | Hex | RGB | Usage |
|------------|-----|-----|-------|
| Primary Blue | #006AFF | 0, 106, 255 | Primary buttons, KPI positive, line charts |
| Teal Secondary | #1A7F64 | 26, 127, 100 | Secondary highlights, inventory up |
| Gray Tertiary | #94A3B8 | 148, 163, 184 | Neutral elements, subtitles, disabled |
| Red Alert | #DC2626 | 220, 38, 38 | Warnings, out-of-stock, negative delta |
| Orange Caution | #EA580C | 234, 88, 12 | Caution indicators, pending status |
| Green Success | #16A34A | 22, 163, 74 | Success, on-time delivery, positive lift |

### Chart Color Palette

**Sequential (for revenue, volume trends):**
```
#006AFF → #0056CC → #004299 (blue progression)
```

**Categorical (for product/customer/channel breakdowns):**
```
Primary:  #006AFF (Blue)
Secondary: #1A7F64 (Teal)
Tertiary:  #94A3B8 (Gray)
Alert:    #DC2626 (Red)
Success:  #16A34A (Green)
Caution:  #EA580C (Orange)
```

**Diverging (for variance/YoY comparisons):**
```
Negative: #DC2626 (Red)
Neutral:  #94A3B8 (Gray)
Positive: #16A34A (Green)
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Sizes & Weights

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **Page Title** | 32px | 700 (Bold) | 1.2 | Dashboard/report headings |
| **Section Header** | 24px | 600 (SemiBold) | 1.3 | Card titles, panel headers |
| **Card Title** | 18px | 600 (SemiBold) | 1.4 | Chart titles, metric headers |
| **Body Large** | 16px | 400 (Regular) | 1.5 | Primary body text, labels |
| **Body Regular** | 14px | 400 (Regular) | 1.5 | Table text, descriptions |
| **Label/Small** | 12px | 500 (Medium) | 1.4 | Labels, badges, footnotes |
| **Caption** | 11px | 400 (Regular) | 1.4 | Captions, timestamps |

### Text Colors

| Context | Color | Hex |
|---------|-------|-----|
| Primary Text | Dark Gray | #1F2937 |
| Secondary Text | Medium Gray | #6B7280 |
| Tertiary Text | Light Gray | #9CA3AF |
| Accent Text | Primary Blue | #006AFF |
| Header Text | Navy | #0F172A |
| Link | Primary Blue | #006AFF |
| Link Hover | Dark Blue | #0056CC |

---

## Components

### Header / Navigation Bar
```css
Background: #FFFFFF (white)
Height: 64px
Border-bottom: 1px solid #E5E7EB
Shadow: 0 1px 3px rgba(0,0,0,0.1)

Logo Text Color: #0F172A (Navy)
Navigation Text Color: #6B7280 (Medium Gray)
Active Tab: #006AFF (Blue) underline, 2px
User Menu Icon: #0F172A (Navy)
```

### Cards / Panels
```css
Background: #FFFFFF (white)
Border: 1px solid #E5E7EB (light gray)
Border-radius: 8px
Padding: 20px (standard), 16px (compact)
Box-shadow: 0 1px 3px rgba(0,0,0,0.08)
Hover Shadow: 0 4px 6px rgba(0,0,0,0.1)
```

### Buttons

**Primary Button:**
```css
Background: #006AFF (Blue)
Text: #FFFFFF (White)
Border: None
Padding: 10px 20px
Border-radius: 6px
Hover: background #0056CC (darker blue)
Active: background #003D99
Disabled: background #D1D5DB (light gray), cursor: not-allowed
```

**Secondary Button:**
```css
Background: #F3F4F6 (Light gray)
Text: #0F172A (Navy)
Border: 1px solid #D1D5DB (light gray)
Padding: 10px 20px
Border-radius: 6px
Hover: background #E5E7EB (darker gray)
```

**Danger Button:**
```css
Background: #DC2626 (Red)
Text: #FFFFFF (White)
Hover: background #B91C1C (darker red)
```

### Badges / Tags

**Active:**
```css
Background: #DBEAFE (very light blue)
Text: #0C4A6E (dark blue)
Border: 1px solid #7DD3FC (light blue)
Border-radius: 12px
Padding: 4px 12px
```

**Caution:**
```css
Background: #FEF3C7 (very light orange)
Text: #92400E (dark orange)
Border: 1px solid #FCD34D (light orange)
```

**Success:**
```css
Background: #DCFCE7 (very light green)
Text: #15803D (dark green)
Border: 1px solid #86EFAC (light green)
```

**Alert:**
```css
Background: #FEE2E2 (very light red)
Text: #991B1B (dark red)
Border: 1px solid #FECACA (light red)
```

### Inputs / Filters

**Text Input:**
```css
Background: #FFFFFF (white)
Border: 1px solid #D1D5DB (light gray)
Border-radius: 6px
Padding: 10px 12px
Font-size: 14px
Focus: border #006AFF (blue), box-shadow: 0 0 0 3px rgba(0,106,255,0.1)
Placeholder: #9CA3AF (light gray)
```

**Dropdown / Select:**
```css
Background: #FFFFFF (white)
Border: 1px solid #D1D5DB (light gray)
Border-radius: 6px
Padding: 10px 12px
Arrow: #6B7280 (medium gray)
Hover: border #BCA3A3
Focus: border #006AFF (blue)
```

**Toggle Switch (Active):**
```css
Background: #006AFF (blue)
Knob: #FFFFFF (white)
Inactive: background #D1D5DB, knob #9CA3AF
```

### Data Tables

**Header Row:**
```css
Background: #0F172A (navy)
Text: #FFFFFF (white)
Font-weight: 600
Padding: 12px 16px
Border-bottom: 2px solid #0F172A
```

**Body Rows (Alternating):**
```css
Row 1: Background #FFFFFF
Row 2: Background #F9FAFB (very light gray)
Text: #1F2937 (dark gray)
Padding: 12px 16px
Border-bottom: 1px solid #E5E7EB
Hover: background #F3F4F6 (light gray)
```

**Totals Row:**
```css
Background: #F3F4F6 (light gray)
Text: #0F172A (navy), font-weight: 600
Border-top: 2px solid #D1D5DB
```

### Charts (Chart.js)

**Line Chart:**
```css
Line Color: #006AFF (blue)
Fill Color: rgba(0, 106, 255, 0.08)
Point: #006AFF, radius 4px
Hover: radius 6px, shadow
Grid: #E5E7EB (light gray), dashed
Y-Axis Label: #6B7280
X-Axis Label: #6B7280
```

**Bar Chart:**
```css
Bar Color (single): #006AFF (blue)
Bar Color (multi):
  - Stack 1: #006AFF
  - Stack 2: #1A7F64 (teal)
  - Stack 3: #94A3B8 (gray)
Bar Border: 0px (no border)
Hover: opacity 0.8
Background: transparent (no chart bg)
```

**Pie / Donut:**
```css
Slice 1: #006AFF (blue)
Slice 2: #1A7F64 (teal)
Slice 3: #94A3B8 (gray)
Slice 4: #EA580C (orange)
Slice 5: #16A34A (green)
Legend: #1F2937 text, #94A3B8 icons
Hover: opacity 0.7
```

### KPI Cards

**Standard KPI Block:**
```css
Card Background: #FFFFFF (white)
Card Border: 1px solid #E5E7EB
Metric Label: 14px, #6B7280 (gray), semibold
Metric Value: 32px, #0F172A (navy), bold
Secondary Text: 12px, #9CA3AF (light gray)
Icon: 24×24px, #006AFF (blue)

Positive Delta: #16A34A (green) text + up arrow
Negative Delta: #DC2626 (red) text + down arrow
Neutral Delta: #94A3B8 (gray) text
```

### Filters / Sidebars

**Filter Panel:**
```css
Background: #FFFFFF (white)
Border-right: 1px solid #E5E7EB
Width: 280px (sidebar)
Padding: 20px
Section Title: 14px, #0F172A (navy), semibold
Filter Group: margin-bottom 16px
Spacing: 8px between items
```

**Applied Filter Badge:**
```css
Background: #DBEAFE (light blue)
Text: #0C4A6E (dark blue)
X Icon: #0C4A6E
Border-radius: 16px
Padding: 6px 10px
Font-size: 12px
```

---

## Spacing & Layout

### Standard Spacing Scale
```css
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Card Grid
```css
Desktop: 3-column grid (1920px+)
Tablet: 2-column grid (768px-1919px)
Mobile: 1-column grid (<768px)
Gap: 20px (lg)
Padding (container): 20px
```

### Section Spacing
```css
Vertical gap between sections: 24px (lg)
Horizontal padding: 20px (all devices)
Top/bottom page padding: 20px
```

---

## Borders & Shadows

### Border Styles
```css
Subtle: 1px solid #E5E7EB (light gray) — card edges, table rows
Emphasis: 1px solid #D1D5DB (medium gray) — section dividers
Header: 2px solid #0F172A (navy) — column headers
```

### Shadow Styles
```css
Subtle (sm): 0 1px 2px rgba(0, 0, 0, 0.05)
Card (md): 0 1px 3px rgba(0, 0, 0, 0.08)
Elevated (lg): 0 4px 6px rgba(0, 0, 0, 0.1)
Floating (xl): 0 10px 15px rgba(0, 0, 0, 0.12)
Hover Lift: 0 4px 12px rgba(0, 0, 0, 0.12)
```

---

## Responsive Breakpoints

```css
Mobile: 0px - 640px
Tablet: 641px - 1024px
Desktop: 1025px - 1919px
Large Desktop: 1920px+
```

### Responsive Adjustments
- **Mobile:** Single column, 16px padding, 12px font
- **Tablet:** Two columns, 18px padding, 14px font
- **Desktop:** Three+ columns, 20px padding, 16px font

---

## Accessibility

- **Color Contrast:** All text 4.5:1+ (WCAG AA)
- **Focus Indicators:** 2px #006AFF (blue) outline, 2px offset
- **Disabled States:** #D1D5DB (light gray) background, #9CA3AF (gray) text, cursor:not-allowed
- **Status Icons:** Accompanied by text labels (not color-only)
- **Link Underlines:** Underline on all links except nav tabs

---

## CSS Variables (Optional)

```css
:root {
  --color-bg-page: #F3F4F6;
  --color-bg-card: #FFFFFF;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-border: #E5E7EB;
  --color-border-dark: #D1D5DB;
  --color-primary: #006AFF;
  --color-primary-dark: #0056CC;
  --color-primary-light: #DBEAFE;
  --color-secondary: #1A7F64;
  --color-success: #16A34A;
  --color-warning: #EA580C;
  --color-error: #DC2626;
  --color-navy: #0F172A;
  --color-gray: #94A3B8;
  
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-size-lg: 32px;
  --font-size-md: 24px;
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-xs: 12px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 10px 15px rgba(0, 0, 0, 0.12);
  
  --border-radius: 8px;
  --border-radius-sm: 6px;
}
```

---

## Dark Mode (Future)
If dark mode is requested, swap:
- Background: #0F1419
- Cards: #1A202C
- Text Primary: #F3F4F6
- Text Secondary: #D1D5DB
- Borders: #2D3748
- Accents: Same (blue, teal, green)

No dark mode is active for this project unless explicitly requested.
