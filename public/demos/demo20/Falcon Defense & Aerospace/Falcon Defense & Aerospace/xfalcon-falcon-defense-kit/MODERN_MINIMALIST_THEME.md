# Modern Minimalist Theme — Falcon Defense & Aerospace

Primary (default) theme for the Falcon Defense & Aerospace deployment. Clean, professional, authoritative — appropriate for government-facing audiences.

A secondary **Clean Light** theme ships alongside via the runtime theme switcher (see `theme.css` and `theme.js`).

## Color palette

| Role | Hex | Use |
|---|---|---|
| **Topbar / Brand anchor** | `#36454F` | Dashboard topbar, section headers on dark cards |
| **Body background** | `#FFFFFF` | Page background |
| **Card surface** | `#FFFFFF` | KPI cards, chart containers |
| **Subtle surface** | `#F5F7FA` | Filter bar background, alternating table rows |
| **Primary accent** | `#36454F` (charcoal) | KPI values, section titles, CTAs |
| **Secondary accent** | `#708090` (slate) | Chart series 2, secondary tags |
| **Tertiary accent** | `#D3D3D3` (light gray) | Chart series 3, baselines |
| **Primary text** | `#1C2128` | Body text, table content |
| **Secondary text** | `#5A6472` | Labels, captions, subtitles |
| **Muted text** | `#94A3B8` | Disabled, placeholder |
| **Border / Divider** | `#E2E8F0` | Card borders, horizontal rules |
| **Positive (KPI delta)** | `#059669` | Green "↑ x%" delta text only |
| **Negative (KPI delta)** | `#D32F2F` | Red "↓ x%" delta text only |
| **Warning / Amber** | `#F59E0B` | Extended palette chart series 4 |
| **Info / Blue** | `#0EA5E9` | Extended palette chart series 5 |

**Chart data colors** (exactly 3-color primary palette — never rainbow):
- Primary / current year / actual: `#36454F`
- Secondary / budget / plan: `#708090`
- Tertiary / prior year / baseline: `#94A3B8`
- Budget and Prior Year lines use `borderDash: [5, 5]`

Red (`#D32F2F`) and Green (`#059669`) are **reserved for KPI delta text only** — never chart fills.

## CSS variables

```css
:root {
  /* Base */
  --color-bg: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F5F7FA;
  --color-border: #E2E8F0;

  /* Brand */
  --color-topbar: #36454F;
  --color-primary: #36454F;
  --color-secondary: #708090;
  --color-tertiary: #D3D3D3;

  /* Text */
  --color-text: #1C2128;
  --color-text-muted: #5A6472;
  --color-text-dim: #94A3B8;
  --color-text-on-dark: #FFFFFF;

  /* Status (KPI text only) */
  --color-positive: #059669;
  --color-negative: #D32F2F;
  --color-warning: #F59E0B;
  --color-info: #0EA5E9;

  /* Typography */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  /* Elevation */
  --shadow-card: 0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
  --shadow-card-hover: 0 4px 12px rgba(15,23,42,0.08);

  /* Spacing grid */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title (topbar) | 16px | 600 | `var(--color-text-on-dark)` |
| Section title | 18px | 700 | `var(--color-primary)` |
| KPI label | 12px | 600 | `var(--color-text-muted)` + uppercase |
| KPI value | 28px | 700 | `var(--color-primary)` |
| KPI delta | 13px | 500 | `var(--color-positive)` / `var(--color-negative)` |
| Chart title | 16px | 700 | `var(--color-primary)` |
| Table header | 13px | 600 | white on `var(--color-topbar)` |
| Table body | 13px | 400 | `var(--color-text)` |
| Body / paragraph | 14px | 400 | `var(--color-text)` |
| Caption / footnote | 12px | 400 | `var(--color-text-muted)` |

Typography uses **Inter** from Google Fonts. No serif faces.

## Layout rules

- Topbar height: 56px; padding: 0 24px
- KPI card: 16px padding; 8px radius; 1px border `var(--color-border)`; `var(--shadow-card)`
- Chart container: 16px padding; 12px radius; white surface; 1px border
- Grid gutter: 16px between cards/charts
- Filter bar: sticky top below topbar, background `var(--color-surface-alt)`, 48px tall
- Table: sticky header; row hover `var(--color-surface-alt)`; 12px cell padding

## Logo convention

Logo wordmark is **"xF"**. The `x` uses `var(--color-primary)` (#36454F), the `F` uses `var(--color-secondary)` (#708090). Rendered at 24px weight 800 in the topbar.

## Usage example (minimum dashboard skeleton)

```html
<div class="topbar">
  <div class="topbar-left">
    <span class="logo"><span class="logo-x">x</span><span class="logo-f">F</span></span>
    <span class="topbar-title">Falcon Defense &amp; Aerospace / 1. Executive Overview</span>
    <span class="topbar-subtitle">Reporting Period: Jan–Dec 2024</span>
  </div>
  <a href="index.html" class="back-link">← Back to Portal</a>
</div>
<div class="filter-bar"> ... </div>
<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-label">Recognized Revenue 2024</div>
    <div class="kpi-value">$61,789M</div>
    <div class="kpi-delta positive">↑ 10.3% vs FY 2022</div>
  </div>
</div>
```

## Alternate theme — Clean Light

Shipped alongside via theme switcher. User picks via dropdown on the portal.

| Role | Hex |
|---|---|
| Topbar | `#0F172A` |
| Body bg | `#F3F4F6` |
| Primary | `#006AFF` |
| Secondary | `#1A7F64` |
| Tertiary | `#94A3B8` |

Year palette and status colors (positive/negative) stay the same across themes to preserve data semantics.
