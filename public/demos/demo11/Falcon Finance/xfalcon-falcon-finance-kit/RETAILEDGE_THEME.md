# Falcon Finance Theme — Bread Financial Inspired (Light)

**Tagline:** "Intelligence at the Speed of Finance"
**Base:** Light theme with white backgrounds, deep navy accents, and warm coral highlights
**Inspired by:** Bread Financial brand identity (#1D3557 + #E63946)

## Color Palette

### Primary Colors (Light Background)

| Color | Hex | Usage |
|-------|-----|-------|
| Page Background | `#FFFFFF` | Page background |
| Card Background | `#FAFBFC` | Card backgrounds, panels |
| Card Border | `#ECEEF1` | Card borders, dividers |

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#1D3557` | Topbar background, primary brand color |
| Warm Coral | `#E63946` | Secondary accent, logo highlight, brand emphasis |
| Steel Blue | `#457B9D` | Links, interactive elements, secondary headers |

### Indicator Colors (KPI Text ONLY)

| Color | Hex | Usage |
|-------|-----|-------|
| Positive Green | `#2E7D32` | Positive KPI text only (+X%, growth indicators) |
| Negative Red | `#D32F2F` | Negative KPI text only (-X%, decline indicators) |

**IMPORTANT:** Red and green are NEVER used as chart bar/line fills. They appear ONLY in KPI card text for positive/negative indicators.

### Chart Data Colors (Fixed Palette)

| Role | Hex | Usage |
|------|-----|-------|
| Primary / Actual / Current Year | `#006AFF` | Default bar/line color, current year data |
| Secondary / Prior Year / Comparison | `#1A7F64` | Secondary series, prior year data |
| Tertiary / Baseline | `#94A3B8` | Baseline, tertiary data, "other" |
| Extended 1 | `#0EA5E9` | Use sparingly when 3 colors aren't enough |
| Extended 2 | `#F59E0B` | Use sparingly when 4 colors aren't enough |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Text | `#1E293B` | Main body text, headers |
| Secondary Text | `#64748B` | Subtext, timestamps, descriptions |
| Tertiary Text | `#94A3B8` | Disabled states, hints |
| Topbar Text | `#FFFFFF` | Text on navy topbar |

## CSS Variables

```css
:root {
  --color-bg-page: #FFFFFF;
  --color-bg-card: #FAFBFC;
  --color-border: #ECEEF1;
  --color-brand-navy: #1D3557;
  --color-brand-coral: #E63946;
  --color-accent-primary: #457B9D;
  --color-positive: #2E7D32;
  --color-negative: #D32F2F;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-tertiary: #94A3B8;
  --color-chart-blue: #006AFF;
  --color-chart-teal: #1A7F64;
  --color-chart-gray: #94A3B8;
  --color-chart-lightblue: #0EA5E9;
  --color-chart-amber: #F59E0B;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## Logo Mark

- Text: "xF" in bold Inter — "x" in Steel Blue (#457B9D), "F" in Warm Coral (#E63946)
- Wordmark: "Falcon Finance" in Inter SemiBold
- Lockup: xF mark left of wordmark, 4px spacing

## KPI Card Pattern

```html
<div style="background: #FAFBFC; border: 1px solid #ECEEF1; border-radius: 12px; padding: 20px;">
  <div style="color: #64748B; font-size: 12px; text-transform: uppercase;">KPI LABEL</div>
  <div style="color: #1E293B; font-size: 28px; font-weight: 700;">$1,234,567</div>
  <div style="color: #2E7D32; font-size: 14px;">+12.3% vs LY</div>
</div>
```

## Topbar Pattern

```html
<div style="background: #1D3557; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;">
  <div style="display: flex; align-items: center; gap: 12px;">
    <span style="font-weight: 800; font-size: 20px;"><span style="color: #457B9D;">x</span><span style="color: #E63946;">F</span></span>
    <span style="color: #FFFFFF; font-weight: 600;">Falcon Finance / Dashboard Name</span>
  </div>
  <a href="index.html" style="color: #FFFFFF; text-decoration: none;">← Back to Portal</a>
</div>
```

## Chart Color Rules

1. Use Blue (#006AFF) as the default for any single-dataset chart
2. Use Teal (#1A7F64) for secondary comparisons (prior year, budget)
3. Use Gray (#94A3B8) for baselines and tertiary data
4. Use dashed lines (`borderDash: [5, 5]`) for budget and prior year lines
5. Never exceed 5 colors in a single chart
6. Never use red or green in chart datasets — only in KPI text
