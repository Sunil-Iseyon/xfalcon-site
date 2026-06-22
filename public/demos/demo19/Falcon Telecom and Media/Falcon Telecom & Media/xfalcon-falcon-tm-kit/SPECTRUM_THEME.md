# Spectrum Theme — Falcon Telecom & Media

**Source**: Brand colors derived from spectrum.com (Charter Communications)
**Background luminance**: LIGHT (white/light cards on light gray page background)
**Default theme**: YES (loaded when `?theme=` is absent from URL)

## Color Palette

| Role | Hex | Notes |
|---|---|---|
| **Topbar / dark anchor** | `#003057` | Spectrum "Green Vogue" — deep navy used in headers and the topbar |
| **Page background** | `#F4F6F9` | Light cool gray — softer than pure white, signals "dashboard" not "marketing site" |
| **Card background** | `#FFFFFF` | Pure white for chart and KPI cards |
| **Card border** | `#E2E8F0` | Subtle slate-100 |
| **Primary accent** | `#0099D8` | Spectrum "Blue Ball" — CTAs, KPI values, link color, primary chart series |
| **Secondary accent** | `#003057` | Same navy as topbar — secondary chart series, section dividers |
| **Tertiary accent** | `#77787B` | Spectrum brand gray — tertiary chart series, baseline data |
| **Primary text** | `#0F172A` | Slate-900 |
| **Secondary text** | `#64748B` | Slate-500 |
| **Status — positive** | `#059669` | Emerald-600 (KPI deltas only — never in chart datasets) |
| **Status — negative** | `#D32F2F` | Red-600 (KPI deltas only — never in chart datasets) |
| **Status — neutral** | `#94A3B8` | Slate-400 |
| **Logo "x"** | `#0099D8` | Primary accent |
| **Logo "F"** | `#003057` | Secondary accent |

## Chart Color Series (FIXED — does NOT change with theme)

| Role | Hex | When to use |
|---|---|---|
| **Primary / Current Year / Actual** | `#0099D8` | Default for any single-dataset chart, current year, actual values |
| **Secondary / Budget / Plan / Prior Period** | `#003057` | Budget lines, plan comparisons, secondary datasets |
| **Tertiary / Prior Year / Baseline** | `#77787B` | Prior year data, baselines |
| **Extended 1** | `#0EA5E9` | Sky-500 — fourth series only when needed |
| **Extended 2** | `#F59E0B` | Amber-500 — fifth series only |

**Year palette** (constant across themes for YoY consistency):
- 2022 = `#94A3B8` (gray)
- 2023 = `#003057` (navy/secondary)
- 2024 = `#77787B` (brand gray) — pulled forward when only 2024+2025 shown
- 2025 = `#0099D8` (primary blue) — current year always primary

## Typography

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Body | Inter | 14px | 400 | `#0F172A` |
| Topbar title | Inter | 16px | 600 | `#FFFFFF` |
| Topbar subtitle | Inter | 12px | 400 | `#A8C5DC` |
| KPI label | Inter | 12px | 600 (uppercase) | `#64748B` |
| KPI value | Inter | 28px | 700 | `#0099D8` |
| KPI delta | Inter | 13px | 500 | (green/red/slate) |
| Chart title | Inter | 16px | 700 | `#0099D8` |
| Section title | Inter | 18px | 700 | `#003057` |
| Table header | Inter | 13px | 600 | `#FFFFFF` on `#003057` |
| Table body | Inter | 13px | 400 | `#0F172A` |

Default font: **Inter** from Google Fonts CDN. Apply to all dashboards.

## CSS Variables (paste into every dashboard's `<style>`)

```css
:root {
  /* Spectrum theme (default) */
  --color-topbar: #003057;
  --color-bg: #F4F6F9;
  --color-card: #FFFFFF;
  --color-border: #E2E8F0;
  --color-primary: #0099D8;
  --color-secondary: #003057;
  --color-tertiary: #77787B;
  --color-extended-1: #0EA5E9;
  --color-extended-2: #F59E0B;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-text-on-dark: #FFFFFF;
  --color-positive: #059669;
  --color-negative: #D32F2F;
  --color-neutral: #94A3B8;
  --color-year-2022: #94A3B8;
  --color-year-2023: #003057;
  --color-year-2024: #77787B;
  --color-year-2025: #0099D8;
}
```

**IMPORTANT — Chart.js**: Pass hex strings DIRECTLY to Chart.js datasets, NEVER `var(--color-primary)`. Chart.js cannot resolve CSS variables — it silently produces blank charts. Use `'#0099D8'` in JS, `var(--color-primary)` only in stylesheets.

## Topbar Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ⬛xF  Falcon Telecom & Media / N. <Dashboard Name>     ← Back to│
│       <Subtitle: Reporting Period: 2025>             ─ Portal     │
└──────────────────────────────────────────────────────────────────┘
   ▲                 ▲                                         ▲
   logo (24px,     title (16px white) +                  back link (right)
   x = primary,    subtitle (12px on light blue)
   F = secondary)
```

## Logo Mark

```html
<span class="logo">
  <span style="color:#0099D8;">x</span><span style="color:#003057;background:#FFFFFF;padding:0 4px;">F</span>
</span>
```

The "x" is primary blue, the "F" is navy on a white chip — the chip gives readability against the navy topbar.

## Light vs Dark Decision

This is a LIGHT theme. The defining marker: page background is `#F4F6F9` (light gray), cards are pure white, dark elements are localized to the topbar and table headers. KPI delta colors use standard green/red (#059669 / #D32F2F) — neon variants are inappropriate on light backgrounds.

## Usage Notes

- Topbar is ALWAYS `#003057` regardless of accent variations.
- Primary blue (`#0099D8`) is the dominant interactive color: CTA buttons, link text, KPI values, primary chart series, hover states.
- Secondary navy (`#003057`) doubles as the "dark element" color for table headers, section titles, secondary chart series, and the topbar itself.
- Brand gray (`#77787B`) is intentionally used for the tertiary chart series — this gives prior-year comparisons a subtle, recede-into-background quality.
- Status indicators (green positive, red negative) appear ONLY in KPI delta text — never as chart fills or strokes.
