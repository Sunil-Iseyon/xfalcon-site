# Falcon Semiconductor — Theme Specification

**Theme:** Ocean Depths (selected)
**Delivery mode:** Single theme (baked in)
**Typography:** Inter (Google Fonts) across all dashboards
**Mood:** Corporate, calming, financial-services feel. Navy topbar anchors a cream-white page with teal primary and seafoam secondary.

## Color Palette

| Role | Variable | Hex | Usage |
|------|----------|-----|-------|
| Topbar / Header | `--color-topbar` | `#1A2332` | Dark navy — strong anchor at top of every dashboard |
| Body background | `--color-bg` | `#F1FAEE` | Cream, very light (ivory tint) |
| Card background | `--color-card` | `#FFFFFF` | KPI cards, chart containers (pure white for contrast vs cream page) |
| Border / Divider | `--color-border` | `#D8E2DD` | Card borders, table rules (soft green-gray) |
| **Primary accent** | `--color-primary` | `#2D8B8B` | Teal — KPI values, chart series 1, section titles, CTA links |
| Primary hover | `--color-primary-hover` | `#237373` | Darker teal for hover states |
| **Secondary accent** | `--color-secondary` | `#A8DADC` | Seafoam — chart series 2, badge accents |
| Secondary dark | `--color-secondary-dark` | `#5EABAB` | Medium teal for chart lines that need contrast on light cards |
| Tertiary | `--color-tertiary` | `#94A3B8` | Slate gray — chart series 3, baselines |
| Text primary | `--color-text` | `#0F172A` | Body copy (navy-black) |
| Text secondary | `--color-text-muted` | `#64748B` | Labels, captions |
| Text on dark | `--color-text-on-dark` | `#F1FAEE` | Topbar text matches body background for tonal unity |
| Positive indicator | `--color-positive` | `#059669` | KPI delta ↑ (text only) — stays constant across themes |
| Negative indicator | `--color-negative` | `#D32F2F` | KPI delta ↓ (text only) — stays constant |
| Warn indicator | `--color-warn` | `#D97706` | Caution / over-target flags |
| Neutral indicator | `--color-neutral` | `#94A3B8` | Flat deltas |

**Note:** Pure seafoam `#A8DADC` has low contrast when used as chart series on white cards. For chart lines/bars where readability matters, prefer `--color-secondary-dark` (`#5EABAB`). Seafoam is fine for badges, KPI card backgrounds, or large filled areas.

## Logo Convention

Topbar logo is two characters: **"xF"** on the dark navy topbar.
- `x` uses `--color-primary` (`#2D8B8B` teal)
- `F` uses `--color-secondary` (`#A8DADC` seafoam)
- Rendered as bold Inter 22px

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Topbar title | 16px | 600 | `--color-text-on-dark` |
| Topbar subtitle | 12px | 400 | rgba(241,250,238,0.7) |
| Section title | 18px | 700 | `--color-primary` |
| KPI label | 12px | 600 (uppercase) | `--color-text-muted` |
| KPI value | 28px | 700 | `--color-primary` |
| KPI delta | 13px | 500 | positive/negative/neutral |
| Chart title | 14–16px | 700 | `--color-primary` |
| Table header | 13px | 600 | white on `--color-topbar` |
| Table body | 13px | 400 | `--color-text` |
| Body | 14px | 400 | `--color-text` |

## CSS Variable Block (paste-ready)

```css
:root {
  --color-topbar: #1A2332;
  --color-bg: #F1FAEE;
  --color-card: #FFFFFF;
  --color-border: #D8E2DD;
  --color-primary: #2D8B8B;
  --color-primary-hover: #237373;
  --color-secondary: #A8DADC;
  --color-secondary-dark: #5EABAB;
  --color-tertiary: #94A3B8;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-text-on-dark: #F1FAEE;
  --color-positive: #059669;
  --color-negative: #D32F2F;
  --color-warn: #D97706;
  --color-neutral: #94A3B8;
  --font: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
}
```

## Chart Color Rules

Direct hex only — Chart.js cannot resolve `var()`:

- **Actual / Current Year / Primary series:** `'#2D8B8B'`
- **Secondary / Budget / Plan:** `'#5EABAB'` (use `#A8DADC` seafoam only for fill/area with low opacity)
- **Prior Year / Baseline / Tertiary:** `'#94A3B8'` (dashed `borderDash: [5,5]`)
- **Extended series:** `'#1A6B6B'` (dark teal), `'#D97706'` (amber), `'#64748B'` (slate)

Year palette (stable across dashboards — theme affects chrome only, chart data semantics are constant):
- **FY22:** `'#94A3B8'` (slate gray)
- **FY23:** `'#A8DADC'` (seafoam)
- **FY24:** `'#5EABAB'` (medium teal)
- **FY25:** `'#2D8B8B'` (primary teal)
- **FY26 (partial):** `'#1A6B6B'` (dark teal)

Never use red or green as a chart fill/line — they belong to KPI deltas only.

## Back Link Style

```css
.back-link { color: var(--color-secondary); text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
```

On the dark topbar, seafoam `#A8DADC` reads beautifully. Always `href="index.html"` — right-aligned in topbar.
