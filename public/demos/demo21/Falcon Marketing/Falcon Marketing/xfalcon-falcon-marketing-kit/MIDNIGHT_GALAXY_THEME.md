# Midnight Galaxy Theme — Falcon Marketing

Default theme for the Falcon Marketing kit. Light body, deep purple chrome — dramatic enough to feel agency-creative, neutral enough for finance and ops audiences.

## Palette (xFalcon role mapping)

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Topbar (anchor) | `--color-topbar` | `#2B1E3E` | Dashboard topbar background; logo lock-up |
| Body bg | `--color-bg` | `#F5F3FA` | Page background — light, warm-cool tinted |
| Card bg | `--color-card` | `#FFFFFF` | KPI cards, chart containers, table panels |
| Card border | `--color-border` | `#E5E0EE` | 1px panel outline |
| Primary accent | `--color-primary` | `#4A4E8F` | KPI values, links, primary chart series, "x" in xF logo |
| Secondary accent | `--color-secondary` | `#A490C2` | Chart series 2, "F" in logo, secondary fills |
| Tertiary accent | `--color-tertiary` | `#E6E6FA` | Chart series 3, badge backgrounds, hover states |
| Text primary | `--color-text` | `#1A1530` | Body and headline text |
| Text secondary | `--color-text-muted` | `#5A5470` | Labels, captions |
| Text on dark | `--color-text-on-dark` | `#F5F3FA` | Topbar text, table headers |
| Positive (KPI) | `--color-positive` | `#059669` | KPI deltas only — light theme uses standard green |
| Negative (KPI) | `--color-negative` | `#D32F2F` | KPI deltas only — light theme uses standard red |
| Neutral | `--color-neutral` | `#94A3B8` | Prior-year baselines, gray |
| Chart series 1 | `--chart-1` | `#4A4E8F` | Current year, actuals |
| Chart series 2 | `--chart-2` | `#A490C2` | Budget / plan, secondary segment |
| Chart series 3 | `--chart-3` | `#94A3B8` | Prior year, baseline |
| Chart series 4 | `--chart-4` | `#0EA5E9` | Extended (light blue) |
| Chart series 5 | `--chart-5` | `#F59E0B` | Extended (amber) |

## Typography

Inter from Google Fonts CDN — same across every dashboard.

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| KPI label | 12px | 600 | `--color-text-muted` |
| KPI value | 28px | 700 | `--color-primary` |
| KPI delta | 13px | 500 | positive/negative |
| Chart title | 16px | 700 | `--color-primary` |
| Section title | 18px | 700 | `--color-primary` |
| Topbar title | 16px | 600 | `--color-text-on-dark` |
| Table header | 13px | 600 | `--color-text-on-dark` (on `--color-topbar` bg) |
| Table body | 13px | 400 | `--color-text` |

No `text-transform: uppercase` and no `letter-spacing` on table headers.

## Logo

`xF` lockup. The `x` uses `--color-primary` (`#4A4E8F`), the `F` uses `--color-secondary` (`#A490C2`). 22px, 800 weight, Inter.

## Topbar standard

```html
<div class="topbar">
  <div class="topbar-left">
    <span class="logo"><span class="logo-x">x</span><span class="logo-f">F</span></span>
    <span class="topbar-title">Falcon Marketing / N. Dashboard Name</span>
  </div>
  <a class="back-link" href="index.html">← Back to Portal</a>
</div>
<div class="topbar-sub">Reporting period: …</div>
```

Back link: always RIGHT side, always `href="index.html"`, hover = underline only.

## Status indicators (CONSTANT across themes)

These NEVER change with theme — only chrome changes.

| Indicator | Color | Use |
|-----------|-------|-----|
| Positive delta | `#059669` | KPI text only |
| Negative delta | `#D32F2F` | KPI text only |
| Neutral | `#94A3B8` | When delta absent |

Year palette for YoY charts (CONSTANT):

| Year | Color | Style |
|------|-------|-------|
| 2024 (CY) | `#4A4E8F` | solid |
| 2023 (PY) | `#A490C2` | solid (or dashed in single-year overlays) |
| 2022 (PPY) | `#94A3B8` | solid (gray) |

## CSS variables (drop-in)

```css
:root {
  --color-topbar: #2B1E3E;
  --color-bg: #F5F3FA;
  --color-card: #FFFFFF;
  --color-border: #E5E0EE;
  --color-primary: #4A4E8F;
  --color-secondary: #A490C2;
  --color-tertiary: #E6E6FA;
  --color-text: #1A1530;
  --color-text-muted: #5A5470;
  --color-text-on-dark: #F5F3FA;
  --color-positive: #059669;
  --color-negative: #D32F2F;
  --color-neutral: #94A3B8;
  --chart-1: #4A4E8F;
  --chart-2: #A490C2;
  --chart-3: #94A3B8;
  --chart-4: #0EA5E9;
  --chart-5: #F59E0B;
  --font-base: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --shadow-sm: 0 1px 2px rgba(43, 30, 62, 0.06);
  --shadow-md: 0 4px 12px rgba(43, 30, 62, 0.08);
  --radius: 10px;
}
```

## Chart.js color rule (REPEAT)

Chart.js does NOT resolve `var(--color-primary)`. Pass HEX strings to every dataset, scale, grid, ticks, and plugin:

```javascript
backgroundColor: '#4A4E8F',  // ✓
backgroundColor: 'var(--color-primary)',  // ✗ silently invisible
```
