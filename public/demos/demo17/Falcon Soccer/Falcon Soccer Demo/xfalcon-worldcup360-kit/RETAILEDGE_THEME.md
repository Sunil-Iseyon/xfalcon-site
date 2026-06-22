# Falcon World Cup 360 Analytics — Theme Specification

**Theme Name:** Soccer Green & Gold (Light)
**Generated:** 2026-04-14

## Color Palette

### Core Colors
| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Primary** | Bright Green | `#2E7D32` | Table headers, section titles, KPI value color |
| **Accent** | Gold | `#FFD600` | Highlights, selected states, accent elements, logo highlight |
| **Secondary** | White | `#FFFFFF` | Card backgrounds, clean surfaces |
| **Base Background** | Light Gray | `#F3F4F6` | Page background |
| **Base Dark** | Deep Green-Black | `#0A2E11` | Topbar background, dark accents |

### Chart Color Palette (3-color primary)
| Role | Color | Hex |
|------|-------|-----|
| Primary / Actual / Current | Green | `#2E7D32` |
| Secondary / Comparison | Gold | `#C8A415` |
| Tertiary / Baseline | Gray | `#94A3B8` |
| Extended 1 | Light Green | `#4CAF50` |
| Extended 2 | Amber | `#F59E0B` |

### Text Colors
| Role | Hex | Usage |
|------|-----|-------|
| Primary Text | `#1E293B` | Body text, table data |
| Secondary Text | `#64748B` | Labels, descriptions, captions |
| Text on Dark | `#F1FAE5` | Topbar text, text on green backgrounds |
| Text on Gold | `#1B5E20` | Text on gold accents |

### KPI Delta Colors (Light Theme)
| Status | Hex | Usage |
|--------|-----|-------|
| Positive | `#059669` | Positive variance indicators |
| Negative | `#D32F2F` | Negative variance indicators |
| Neutral | `#94A3B8` | No change indicators |

### Functional Colors
| Role | Hex | Usage |
|------|-----|-------|
| Card Background | `#FFFFFF` | Dashboard cards |
| Card Border | `#E2E8F0` | Subtle card borders |
| Table Header BG | `#1B5E20` | Dark green table headers |
| Table Header Text | `#FFFFFF` | White text on headers |
| Table Row Hover | `#F0FFF4` | Light green hover state |
| Divider | `#E2E8F0` | Section dividers |

## CSS Variables

```css
:root {
  /* Core */
  --color-primary: #2E7D32;
  --color-accent: #FFD600;
  --color-secondary: #FFFFFF;
  --color-base: #F3F4F6;
  --color-base-dark: #0A2E11;

  /* Text */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-on-dark: #F1FAE5;
  --color-text-on-accent: #1B5E20;

  /* Charts - MUST use hex directly in Chart.js, not var() */
  --color-chart-1: #2E7D32;
  --color-chart-2: #C8A415;
  --color-chart-3: #94A3B8;
  --color-chart-4: #4CAF50;
  --color-chart-5: #F59E0B;

  /* KPI Deltas */
  --color-positive: #059669;
  --color-negative: #D32F2F;
  --color-neutral: #94A3B8;

  /* Cards & Surfaces */
  --color-card-bg: #FFFFFF;
  --color-card-border: #E2E8F0;
  --color-table-header-bg: #1B5E20;
  --color-table-header-text: #FFFFFF;
  --color-row-hover: #F0FFF4;
  --color-divider: #E2E8F0;
}
```

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| KPI Label | 12px | 600 | `#64748B` (secondary) |
| KPI Value | 28px | 700 | `#2E7D32` (primary green) |
| KPI Delta | 13px | 500 | `#059669` / `#D32F2F` |
| Chart Title | 16px | 700 | `#2E7D32` |
| Table Header | 13px | 600 | `#FFFFFF` on `#1B5E20` |
| Table Body | 13px | 400 | `#1E293B` |
| Section Title | 18px | 700 | `#2E7D32` |
| Topbar Title | 16px | 600 | `#F1FAE5` |
| Font Family | Inter (Google Fonts CDN) | | |

## Topbar Standard

```html
<div class="topbar">
  <div class="topbar-left">
    <div class="logo"><span style="color:#4CAF50">x</span><span style="color:#FFD600">F</span></div>
    <div>
      <div class="topbar-title">Falcon World Cup 360 / N. Dashboard Name</div>
      <div class="topbar-subtitle" id="reporting-period">All Tournaments: 1930–2014</div>
    </div>
  </div>
  <a href="index.html" class="back-link">← Back to Portal</a>
</div>
```

- Topbar background: `#0A2E11` (deep green-black)
- Logo: "xF" with green "x" and gold "F"
- Back link always on RIGHT side
- Subtitle uses normal flow (no position:absolute)

## Layout Rules

- Page background: `#F3F4F6`
- Card backgrounds: `#FFFFFF` with `border: 1px solid #E2E8F0` and `border-radius: 12px`
- Card shadow: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Max content width: 1400px, centered
- Grid gap: 20px
- KPI cards: 4-column grid, responsive
- Chart sections: Full-width or 2-column grid
