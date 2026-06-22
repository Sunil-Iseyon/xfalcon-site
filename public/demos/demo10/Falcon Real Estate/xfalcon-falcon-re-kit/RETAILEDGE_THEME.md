# Falcon Real Estate — Zillow-Inspired Light Theme

**Tagline:** "Intelligent Property Analytics — Your Portfolio, Clearly."

## Color Palette — Clean, Professional, Zillow-Inspired

A light, trust-inspiring color system derived from Zillow's clean white aesthetic, adapted for professional real estate analytics dashboards.

### Base Colors (Light Background)

| Color | Hex | Usage |
|-------|-----|-------|
| Page Background | `#F8F9FA` | Page background |
| Card White | `#FFFFFF` | Card backgrounds, panels |
| Card Border | `#E2E8F0` | Card borders, dividers |
| Card Hover | `#F1F5F9` | Hover states, selected rows |

### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Zillow Blue | `#006AFF` | Primary accent, data highlights, CTAs, links |
| Zillow Blue Light | `#E8F1FF` | Blue background tints for tags and highlights |
| Teal | `#1A7F64` | Secondary accent, supporting data series |
| Teal Light | `#E6F5F0` | Teal background tints |
| Success Green | `#2E7D32` | Positive indicators, growth, above-target |
| Success Green Light | `#E8F5E9` | Green background tints |
| Danger Red | `#D32F2F` | Negative indicators, loss, below-target |
| Danger Red Light | `#FFEBEE` | Red background tints |
| Warning Orange | `#F57C00` | Caution, attention-needed states |
| Warning Orange Light | `#FFF3E0` | Orange background tints |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Text | `#1E293B` | Main body text, headers |
| Secondary Text | `#64748B` | Subtext, descriptions |
| Tertiary Text | `#94A3B8` | Labels, timestamps, hints |

### CSS Variables

```css
:root {
  --color-bg: #F8F9FA;
  --color-card: #FFFFFF;
  --color-card-border: #E2E8F0;
  --color-card-hover: #F1F5F9;
  --color-blue: #006AFF;
  --color-blue-light: #E8F1FF;
  --color-blue-dark: #0052CC;
  --color-teal: #1A7F64;
  --color-teal-light: #E6F5F0;
  --color-green: #2E7D32;
  --color-green-light: #E8F5E9;
  --color-red: #D32F2F;
  --color-red-light: #FFEBEE;
  --color-orange: #F57C00;
  --color-orange-light: #FFF3E0;
  --color-text: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-divider: #E2E8F0;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Logo Mark

- Text: "xF" in bold Inter — "x" in Zillow Blue (#006AFF), "F" in Teal (#1A7F64)
- Wordmark: "Falcon Real Estate" in Inter semibold
- Background: White topbar with subtle bottom border
- Minimum size: 28px

### Chart Color Sequence

For multi-series charts, cycle through these colors in order:
1. `#006AFF` (Zillow Blue)
2. `#1A7F64` (Teal)
3. `#0EA5E9` (Sky Blue)
4. `#F59E0B` (Amber)
5. `#D946EF` (Purple)
6. `#94A3B8` (Slate — for "other" or remainder)

### Tooltip Style

Light tooltips with subtle border (not dark overlays):
```css
tooltip: {
  backgroundColor: '#FFFFFF',
  titleColor: '#1E293B',
  bodyColor: '#64748B',
  borderColor: '#E2E8F0',
  borderWidth: 1,
  padding: 12
}
```

### KPI Card Pattern

```html
<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; border-top: 3px solid #006AFF; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
  <div style="color: #94A3B8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">KPI LABEL</div>
  <div style="color: #1E293B; font-size: 24px; font-weight: 700; margin: 8px 0 6px;">$1,234,567</div>
  <div style="color: #64748B; font-size: 12px;">YoY: <span style="color: #2E7D32; font-weight: 600;">+12.3%</span></div>
</div>
```

### Topbar Pattern

```html
<div style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 16px 24px; position: sticky; top: 0; z-index: 100;">
  <div style="display: flex; align-items: center; gap: 14px;">
    <span style="font-size: 28px; font-weight: 800;">
      <span style="color: #006AFF;">x</span><span style="color: #1A7F64;">F</span>
    </span>
    <div>
      <div style="font-size: 20px; font-weight: 700; color: #1E293B;">Falcon Real Estate</div>
      <div style="font-size: 12px; color: #64748B;">Apex REIT Portfolio Analytics</div>
    </div>
  </div>
</div>
```

### Design Principles

1. **White cards on light gray background** — clean separation without heavy borders
2. **Subtle shadows** instead of glows — professional, not flashy
3. **Color-coded top borders** on KPI cards — blue, teal, green, orange, red for visual hierarchy
4. **Light tooltips** — white background with subtle border, not dark overlays
5. **Colored tags** for asset classes, grades, and status badges
6. **No dark mode** — matches Zillow's clean, approachable aesthetic
7. **Minimal grid lines** — only horizontal Y-axis gridlines, light gray (#F1F5F9)
