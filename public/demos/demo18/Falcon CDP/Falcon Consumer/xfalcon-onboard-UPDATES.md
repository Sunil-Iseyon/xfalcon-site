# xfalcon-onboard SKILL.md — Updates from Falcon Consumer project

This addendum captures improvements learned from the Falcon Consumer rebuild (April 2026). It bakes in the single-year-KPI rule, Compare Years toggle pattern, runtime theme switcher, the 10 theme-factory themes, fact-table grain verification, dashboard depth minimums, and AutoExplore as an optional Stage-4 deliverable.

The skill folder is currently read-only. To apply these updates, either (a) manually merge the sections below into `/Users/xfalconai/Documents/Claude/Skills/xfalcon-onboard/SKILL.md` at the marked anchor points, or (b) give the session write access and I'll apply them automatically.

All anchor points reference line numbers in the current 975-line SKILL.md. New content is ready to paste as-is.

---

## PATCH 1 — Description update (line 3)

**Replace** the existing description field in the frontmatter to advertise the new theme library and rules.

**Old:**
```
description: "Onboard a new database connection into xFalcon AnalyticsPro — auto-discovers schema, interviews the user for business context, produces a full analytics kit (feasibility matrix, schema map, theme, query templates, setup guide, portal). ALWAYS trigger this skill when the user says 'new project'..."
```

**New:**
```
description: "Onboard a new database connection into xFalcon AnalyticsPro — auto-discovers schema, verifies fact-table grain, interviews the user for business context, produces a full analytics kit (feasibility matrix, schema map, theme with choice of 10 preset palettes or runtime theme switcher, metric definitions with required filters, single-year-KPI dashboards with Compare Years toggle, query templates, setup guide, portal, optional AutoExplore insight reports). ALWAYS trigger this skill when the user says 'new project', 'new connection', 'new database', 'onboard', 'set up dashboards', 'start fresh', 'connect a new data source', 'build dashboards from scratch', 'xfalcon onboard', 'AnalyticsPro setup', or anything suggesting they want to stand up a new xFalcon analytics environment."
```

---

## PATCH 2 — Add fact-grain verification to Stage 1 discovery (after line 40)

**Insert after** the existing item 10 in the Discovery Steps numbered list, before the "After discovery" summary paragraph (line 42):

```markdown
11. **Verify fact-table grain for redundant dimensions (CRITICAL).** Some fact tables replicate the same measurement across a "context" dimension (e.g., `GOAL_TYPE_KEY`, `BUDGET_TYPE`, `SCENARIO_ID`, `VERSION`) — the same (period × business_unit × customer_type) slice appears N times with near-duplicate values. Summing without filtering inflates metrics 5–10×.

    **Detection test** — run this for every fact table before any aggregation:
    ```sql
    SELECT <suspected_dim>, SUM(<measure>)
    FROM <fact>
    WHERE <standard_filters>
    GROUP BY 1
    ```
    If all rows return values within ±2% of each other, it's redundant-grain. Filter to ONE value for headline metrics (e.g., `WHERE GOAL_TYPE_KEY = 5` to pick the NET_SALES_GOAL slice).

    **Example from a prior project (Falcon Consumer):** `FACT_CUSTOMER_PERFORMANCE` had 10 rows per (period × BU × customer_type) — one per goal_type. Summing `NET_SALES` without `WHERE GOAL_TYPE_KEY = 5` produced $270M instead of the correct $27M for 2024. The dashboards shipped with 10× inflated customer counts and revenue until a user review caught it.

    **When detected**:
    - Save the required filter as an `ida_save_memory` entry with category `filter` so future sessions inherit the fix
    - Bake the filter into every query in QUERY_TEMPLATES.sql
    - Document in the project SKILL.md under a "Required Filters" section with a worked example
    - Add a disclaimer footer on every affected dashboard explaining which filter applies

    This is the #1 source of "my numbers are wrong by 10×" complaints. Do not skip.
```

---

## PATCH 3 — Replace Brand & Theme Discovery Round 1 (lines 129–141)

**Replace** the existing preset-theme table with the expanded 15-option version below.

```markdown
**Round 1 — Brand Identity:**
Ask for the company/project name and how they want to source their theme. Present all options together (paging is OK if the list is long):

| # | Option | Palette hint | Mood |
|---|--------|--------------|------|
| 0 | **Clean Light** (AnalyticsPro default) | `#F3F4F6` bg · `#0F172A` topbar · `#006AFF` accent · `#1A7F64` secondary | Professional, light, recommended starting point |
| 1 | **Ocean Depths** | Deep navy `#1a2332` · Teal `#2d8b8b` · Seafoam `#a8dadc` · Cream `#f1faee` | Corporate, calming, financial-services feel |
| 2 | **Sunset Boulevard** | Burnt orange `#e76f51` · Coral `#f4a261` · Sand `#e9c46a` · Deep purple `#264653` | Warm, creative, lifestyle brands |
| 3 | **Forest Canopy** | Forest `#2d4a2b` · Sage `#7d8471` · Olive `#a4ac86` · Ivory `#faf9f6` | Grounded, natural, sustainability |
| 4 | **Modern Minimalist** | Charcoal `#36454f` · Slate `#708090` · Light gray `#d3d3d3` · White `#ffffff` | Clean, versatile, tech/design |
| 5 | **Golden Hour** | Mustard `#f4a900` · Terracotta `#c1666b` · Beige `#d4b896` · Brown `#4a403a` | Warm, autumnal, hospitality/retail |
| 6 | **Arctic Frost** | Ice blue `#d4e4f7` · Steel `#4a6fa5` · Silver `#c0c0c0` · White `#fafafa` | Crisp, clinical, healthcare/pharma |
| 7 | **Desert Rose** | Dusty rose `#d4a5a5` · Clay `#b87d6d` · Sand `#e8d5c4` · Burgundy `#5d2e46` | Soft, elegant, fashion/beauty |
| 8 | **Tech Innovation** | Electric blue `#0066ff` · Neon cyan `#00ffff` · Dark gray `#1e1e1e` · White `#ffffff` | Bold, high-contrast, startup/AI |
| 9 | **Botanical Garden** | Fern `#4a7c59` · Marigold `#f9a620` · Terracotta `#b7472a` · Cream `#f5f3ed` | Fresh, organic, food/wellness |
| 10 | **Midnight Galaxy** | Deep purple `#2b1e3e` · Cosmic blue `#4a4e8f` · Lavender `#a490c2` · Silver `#e6e6fa` | Dramatic, cosmic, entertainment/gaming |
| — | **From my website** | Extract palette from a URL via WebFetch | Depends on the brand |
| — | **From my brand colors** | Provide hex codes directly | Depends on the brand |
| — | **Custom** | Full control over every color | — |

The palettes above come from the `theme-factory` skill (themes 1–10). See the **Theme Reference Library** section below for the xFalcon role mapping (topbar/body/primary/secondary/chart-series) for each theme.

Typography default is **Inter** (current xFalcon standard) regardless of theme choice — override only if the user explicitly asks for serif or an alternative. The theme-factory typography specs (e.g., "DejaVu Sans Bold") are presentation-optimized and do NOT need to be applied to web dashboards; Inter is cleaner at small sizes.
```

---

## PATCH 4 — Add Delivery Mode question (insert after Round 1, before Round 2 at line 142)

**Insert** a new Round 1b section between the existing Round 1 and Round 2:

```markdown
**Round 1b — Delivery Mode (single vs runtime switcher):**

Ask whether to ship a single fixed theme or enable a runtime theme switcher. Equal-weight the two options:

| Option | Description | When to pick |
|--------|-------------|---------------|
| **Single theme** | One theme baked into every dashboard. Smallest deliverable, simplest files, no per-dashboard theme script. | Most projects. Default choice when the user has a clear brand and no need for end-user theme selection. |
| **Runtime theme switcher** | Ship 2 or more themes; users pick at runtime via a dropdown on the portal. Each HTML file gets a small theme-detection script + `theme.css` + `theme.js` that propagates the choice across internal links. | Projects where the user explicitly wants end-user choice, or where two distinct audiences (e.g., retail ops vs executives) prefer different visual moods. |

**If single-theme selected:** proceed to Round 2 with the chosen theme.

**If runtime switcher selected:**
- Ask which N themes to include (minimum 2, recommended 2–3, maximum 4 to avoid a cluttered picker)
- Designate one theme as the "default" (loaded when `?theme=` is absent from the URL)
- Generate `theme.css` (CSS variable overrides for each non-default theme under `[data-theme="..."]`) and `theme.js` (URL detection + link propagation) — see **Runtime Theme Switcher Pattern** section for the implementation recipe
- The portal filter bar gets a Theme dropdown that writes `?theme=<value>` to the URL on change; all internal `.html`/`.md` links are rewritten on click to carry the parameter

**Round 1c — Typography & Logo (optional):**
Ask if they have a logo file and whether they want a non-default font (stick with Inter unless asked).
```

---

## PATCH 5 — Add Theme Reference Library (insert after line 165, before "Important interview principles")

**Insert** this substantial reference block between the Round 2 theme-generation guidance and the "Important interview principles" paragraph. It gives the role-mapped specs for all 10 themes so the theme doc can be generated without another WebFetch.

```markdown
#### Theme Reference Library

The 10 theme-factory palettes mapped into xFalcon roles. For each theme, the "Topbar" is the dark anchor (dashboard header), "Body bg" is the page background, "Card bg" stays white except where noted, "Primary accent" drives KPI values and CTA links, "Secondary accent" is chart series 2, and "Tertiary" is chart series 3 or badge accents. Chart series colors use the palette's 3 non-background colors in descending prominence.

Keep status indicators (positive `#059669`, negative `#D32F2F`) and year-palette conventions (2022 gray, 2023 secondary, 2024 primary) CONSTANT across themes. Theme affects chrome and primary accent only; chart data semantics stay stable.

| Theme | Topbar | Body bg | Primary | Secondary | Tertiary |
|-------|--------|---------|---------|-----------|----------|
| **Clean Light** | `#0F172A` | `#F3F4F6` | `#006AFF` | `#1A7F64` | `#94A3B8` |
| **Ocean Depths** | `#1a2332` | `#f1faee` | `#2d8b8b` | `#a8dadc` | `#94A3B8` |
| **Sunset Boulevard** | `#264653` | `#FEF7F0` | `#e76f51` | `#f4a261` | `#e9c46a` |
| **Forest Canopy** | `#2d4a2b` | `#faf9f6` | `#2d4a2b` | `#7d8471` | `#a4ac86` |
| **Modern Minimalist** | `#36454f` | `#ffffff` | `#36454f` | `#708090` | `#d3d3d3` |
| **Golden Hour** | `#4a403a` | `#faf5eb` | `#c1666b` | `#f4a900` | `#d4b896` |
| **Arctic Frost** | `#4a6fa5` | `#fafafa` | `#4a6fa5` | `#c0c0c0` | `#d4e4f7` |
| **Desert Rose** | `#5d2e46` | `#faf5f2` | `#b87d6d` | `#d4a5a5` | `#e8d5c4` |
| **Tech Innovation** | `#1e1e1e` | `#ffffff` | `#0066ff` | `#00ffff` | `#708090` |
| **Botanical Garden** | `#2d4a2b` | `#f5f3ed` | `#4a7c59` | `#f9a620` | `#b7472a` |
| **Midnight Galaxy** | `#2b1e3e` | `#f5f3fa` | `#4a4e8f` | `#a490c2` | `#e6e6fa` |

For each theme, generate a `RETAILEDGE_THEME.md` (or rename, e.g., `SUNSET_BOULEVARD_THEME.md`) following the template structure — see any existing xFalcon theme reference for the section order. Include CSS variable names, typography table (Inter default), layout rules, and usage examples.

**Logo color convention:** the "x" in the logo always uses the Primary accent; the "F" uses the Secondary accent. This holds across all themes.

#### Runtime Theme Switcher Pattern

When the user picks multi-theme delivery, ship these three artifacts alongside the dashboards:

**theme.css** — CSS variable overrides, one block per non-default theme:
```css
[data-theme="sunset"] body { background:#FEF7F0 !important; color:#1C1917 !important; }
[data-theme="sunset"] .topbar { background:#264653 !important; }
[data-theme="sunset"] .kpi-value,
[data-theme="sunset"] .chart-title,
[data-theme="sunset"] .dashboard-card-number { color:#e76f51 !important; }
/* ... map all theme-specific properties ... */
```

**theme.js** — URL param detection + link propagation:
```javascript
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^(https?:|#|mailto:|javascript:|computer:)/.test(href)) return;
    if (!/\.(html|md)(\?|#|$)/.test(href)) return;
    if (/[?&]theme=/.test(href)) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme || theme === '<DEFAULT_THEME>') return;
    e.preventDefault();
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = href + sep + 'theme=' + theme;
  });
  // Wire up theme picker if present (on portal only)
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('themeSel');
    if (!sel) return;
    sel.value = document.documentElement.getAttribute('data-theme') || '<DEFAULT_THEME>';
    sel.addEventListener('change', function () {
      var u = new URL(window.location.href);
      if (this.value === '<DEFAULT_THEME>') u.searchParams.delete('theme');
      else u.searchParams.set('theme', this.value);
      window.location.href = u.toString();
    });
  });
})();
```

**Each HTML file** (portal + every dashboard) gets three injections:

1. Inline theme-detection script RIGHT AFTER `</title>` (must run before any CSS parsing to prevent flash of unthemed content):
   ```html
   <script>document.documentElement.setAttribute('data-theme',new URLSearchParams(location.search).get('theme')||'<DEFAULT_THEME>')</script>
   <link rel="stylesheet" href="theme.css">
   ```

2. `<script src="theme.js"></script>` right before `</body>`.

3. On the **portal (index.html)** only, add a Theme dropdown to the filter bar:
   ```html
   <div class="filter-group">
     <label for="themeSel">Theme</label>
     <select id="themeSel">
       <option value="<DEFAULT>">Default Name</option>
       <option value="sunset">Sunset Boulevard</option>
       <!-- one option per included theme -->
     </select>
   </div>
   ```

Chart data colors (year palette, status colors) stay constant across themes — theme affects chrome, not data. This preserves YoY visual consistency and avoids confusing users who switch themes mid-analysis.
```

---

## PATCH 6 — Add new Technical Build Rules (insert after line 419, end of "KPI Delta Indicators" section)

**Insert** three new MUST-FOLLOW rules between the existing "KPI Delta Indicators" section and the "Chart.js Critical Rules" section.

```markdown
### Single-Year KPI Rule (MUST FOLLOW)

KPI cards must display exactly ONE year's value. Never sum across years inside a single KPI card. This is a firm rule — violating it is the fastest way to mislead users.

**Wrong:**
```
TOTAL REVENUE
$75.6M
↑ 7.3% vs LY
```
(The $75.6M is 2022+2023+2024 combined; the delta is meaningless against a 3-year sum.)

**Right:**
```
NET SALES 2024
$27.1M
↑ 8.1% vs FY 2023
```

If the user wants to see multiple years at once, use the **Compare Years Toggle Pattern** (next section). Never put a summed multi-year value in a single KPI card.

Label convention: Every KPI card label must include the year in the label text ("Net Sales 2024", not "Net Sales"). This prevents misreading when the dashboard is screenshotted without context.

### Compare Years Toggle Pattern (STANDARD MULTI-YEAR PRESENTATION)

When dashboards cover multiple years, use a toggle switch (not a year filter with "All Years" option) that changes the presentation of every visual. This is the canonical xFalcon pattern for multi-year.

**Toggle OFF (default, state.compare = false):**
- Filter bar Year selector is active — user picks ONE year
- KPI cards show that year's value + YoY delta vs prior year
- Charts show selected year only (time-series = 12 months; categorical = one set of bars)
- Detail table shows selected year with a YoY column

**Toggle ON (state.compare = true):**
- Filter bar Year selector becomes inactive (greyed or hidden)
- KPI cards transform: instead of one value, show a stacked mini-table of per-year values (3 rows: 2022 / 2023 / 2024) plus a CAGR badge at the bottom
- Charts become grouped/overlaid multi-year comparisons (e.g., 3 bars per BU = one per year; or 3 overlaid lines for monthly trend)
- Detail table stays on latest year (don't multiply rows by 3 — the table is a single-year snapshot)

**Render logic (skeleton):**
```javascript
function render() {
  if (state.compare) {
    renderKPIsCompare();    // shows 3-year stacked
    renderTrendCompare();   // 3 overlaid lines
    renderBUCompare();      // grouped bars by year
  } else {
    renderKPIsSingle();     // single year, YoY delta
    renderTrendSingle();    // 1 line for selected year
    renderBUSingle();       // 1 bar per BU for selected year
  }
  renderTable(); // always single-year (latest)
}
```

**Toggle UI** — a dedicated element in the filter bar next to the year selector, not a dropdown option:
```html
<div class="filter-group">
  <label>&nbsp;</label>
  <div class="toggle-group" onclick="toggleCompare()">
    <div class="toggle-switch" id="cmpSwitch"></div>
    <div class="toggle-label">Compare Years</div>
  </div>
</div>
```

This pattern preserves single-year KPI integrity while giving users a one-click path to year-over-year comparison. Used on every year-based dashboard.

### Filter Coverage Rule (MUST FOLLOW)

Every filter in the filter bar must re-aggregate every visual on the page — KPIs, charts, AND the detail table. The filter bar is the single source of truth; there is no visual that exists "outside" the filters.

**Recipe:**
1. Embed raw (pre-aggregated server-side) data as a JS array at the top of the `<script>` block
2. Single `state` object holds all filter values
3. All aggregator functions (`aggByYear`, `aggByBU`, etc.) consume the `state` object and return filtered results
4. Every filter's `onchange` / `onclick` calls `render()` which calls ALL `renderXxx()` functions
5. Every `renderXxx()` function re-reads state (never a stale snapshot) and re-aggregates from the raw data

**Common bug to watch for:** `updateKPIs(filtered)` is defined with a `filtered` parameter, but inside the body the code loops over `DATA` (the unfiltered global), so filters appear to do nothing. Always check that every render function uses the filter-aware aggregator, not the raw array.

**Minimum filter set for a year-based dashboard:**
- Year selector (single year; required)
- One relevant dimension multi-select (BU, region, segment — required)
- Compare Years toggle (required where multi-year data exists)
- Reset button (required)
```

---

## PATCH 7 — Strengthen Dashboard Content Depth Rules (replace lines 531–553)

**Replace** the existing "Dashboard Content Depth Rules" section with this stricter version including numeric minimums.

```markdown
### Dashboard Content Depth Rules (MUST FOLLOW)

Every dashboard must meet these concrete numeric minimums. Dashboards that don't meet them feel "lite" and trigger the #2 most common post-delivery complaint (after blank visualizations).

**Hard minimums per dashboard:**
- **≥6 KPI cards** at the top — the sweet spot for a quick scan. 4 cards feel thin; 10+ cards are unreadable. All cards are single-year (see Single-Year KPI Rule).
- **≥4 chart visualizations** covering different analytical angles. Variety beats volume — one trend line, one category bar, one share/mix view, one comparison.
- **≥1 detail table** sorted by primary metric, with ≥7 rows, a YoY column, and a totals/footer row.
- **≥1 disclaimer / data-governance note** explaining what the dashboard includes, excludes, and which filters apply (e.g., "Metrics filtered to GOAL_TYPE=5 NET_SALES_GOAL; no employee/fraud exclusions applied").
- **Explicit year labels** on every KPI, chart title, and table header — no ambiguity about what time period is being shown.

**KPI card format** — every KPI card shows: metric value + comparison context.
- "Net Sales 2024: $27.07M | ↑ 8.1% vs FY 2023"
- "VIP Revenue 2024: $2.69M | ↑ 6.9% vs FY 2023"

**Chart-type variety** — aim for at least 4 of the 6 types below per dashboard:
- Time-series trend (line, monthly or quarterly)
- Category comparison (horizontal or vertical bar)
- Part-to-whole (doughnut or stacked bar — NOT pie)
- Grouped comparison (grouped bars across 2+ dimensions)
- Scatter or dual-axis (where the data supports it)
- Detail table (always)

**Compare Years support** — every year-based dashboard must implement the Compare Years Toggle Pattern. When toggled on, every chart re-renders with 3-year overlay/grouping; KPI cards become stacked per-year; detail table stays single-year.

**Chart data density** — every chart must have enough data points to show variation. Rules of thumb:
- Line chart: ≥12 points (monthly granularity for a year)
- Bar chart: ≥5 bars (fewer and a table is clearer)
- Doughnut: 3–6 slices max (more = unreadable)

Dashboards that fail these minimums must be expanded before delivery, not shipped "lite".
```

---

## PATCH 8 — Add AutoExplore to Stage 4 deliverables (insert after line 254, before Stage 5)

**Insert** a new numbered bullet 11 (or sub-list) after the existing item 10 (the project SKILL.md) in the Stage 4 deliverables list.

```markdown
11. **Optional — AutoExplore Insight Reports** (offer if the project has high-dimensional data or the user wants pattern discovery beyond standard dashboards):
    - `autoexplore-dashboard.html` — evidence-driven "finding cards" with Chart.js visualisations, one card per discovered pattern, showing headline + what the data shows + so-what interpretation
    - `autoexplore-memo.html` — long-form narrative report with executive summary, numbered findings with evidence blocks, methodology, "what we didn't find" (null results), and prioritized recommended actions
    - `autoexplore-journal.md` — hypothesis-by-hypothesis log showing all tested queries (typically 32–40 hypotheses) and their outcomes (confirmed / null / surprising)

    **When to offer:** when the customer table has rich demographic/behavioural dimensions, when the user is curious about "what else is in the data", or when dashboards alone can't answer strategic questions (e.g., "why are VIPs not enrolling?", "which BUs have mispriced loyalty programs?").

    **How to run:** use the `ida-autoexplore` skill with directed-mode exploration on the theme the user cares about (e.g., "channel × geography × loyalty", "churn patterns", "VIP behaviour"). Default 20 iterations for directed, 30 for open. Results are surfaced via a dedicated "Insight Reports" section on the portal (separate from the standard dashboard directory) with cards linking to the dashboard and memo HTML files.

    **Link from portal:** add an "Insight Reports" section to the portal below the Dashboard Directory:
    ```html
    <div class="section-title" style="margin-top:40px;">Insight Reports</div>
    <div style="font-size:12px;color:#64748B;margin-bottom:16px;">
      AutoExplore output — N hypotheses tested across M tables, K findings on [theme].
    </div>
    <div class="dashboard-grid">
      <a href="autoexplore-dashboard.html" class="dashboard-card"
         style="border-color:var(--color-primary);">
        <div class="dashboard-card-number">🔍</div>
        <div class="dashboard-card-title">Evidence Dashboard</div>
        <div class="dashboard-card-desc">N findings · chart per finding</div>
      </a>
      <a href="autoexplore-memo.html" class="dashboard-card"
         style="border-color:var(--color-secondary);">
        <div class="dashboard-card-number">📄</div>
        <div class="dashboard-card-title">Long-form Memo</div>
        <div class="dashboard-card-desc">Executive narrative · so-whats · actions</div>
      </a>
    </div>
    ```
```

---

## PATCH 9 — Add entries to Common Pitfalls (append after line 949)

**Append** these new pitfalls at the end of the Common Pitfalls list, after item 40:

```markdown
### Fact-Table Grain & Data Accuracy
41. **Redundant-grain dimension inflation** — fact tables like `FACT_CUSTOMER_PERFORMANCE` often have a `GOAL_TYPE_KEY` or `BUDGET_TYPE` dimension that replicates each measurement ~10 times with near-duplicate values. Summing without filtering inflates metrics 5–10×. Always run the detection test in Stage 1 Discovery item 11. Save the required filter as a memory.
42. **Missing year labels** — every KPI, chart title, and column header must state the year explicitly. "Net Sales: $27M" is ambiguous; "Net Sales 2024: $27M" is not. Screenshots without context are common — don't assume the reader will see the filter bar.

### Multi-Year Presentation
43. **Multi-year summed KPIs** — never put "Total Revenue 2022-2024: $75.6M" on a KPI card. Users read KPI cards as snapshots; multi-year sums are misleading. Use the Compare Years Toggle Pattern instead.
44. **"All Years" option in year filter** — this is a footgun. It invites users to accidentally view summed multi-year metrics. Remove the "All Years" option; provide Compare Years toggle instead.

### Themes & Visual Consistency
45. **Chart data colors changing with theme** — theme affects chrome only (topbar, KPI accents, section titles). Chart series colors (year palette, status red/green) stay CONSTANT across themes. Users switching themes mid-analysis should see the same data patterns.
46. **Theme propagation on links** — without `theme.js`, the theme resets when the user navigates between dashboards. The link-rewrite handler is non-negotiable for the multi-theme delivery mode.
```

---

## PATCH 10 — Reference Files section update (lines 951–961)

**Replace** the Reference Files section with an updated list that reflects the new inline Theme Reference Library.

```markdown
## Reference Files

Read these as needed during the onboarding flow:

- `references/questionnaire.md` — the full 96-question xFalcon Dashboard Setup Questionnaire
- `references/data_schema_map_template.md` — standard AnalyticsPro dimensional model
- `references/theme_generation_guide.md` — color-theory rules + algorithm for deriving a full palette from 2–3 seed colors (used for "From my website" and "From my brand colors")
- `references/build_rules.md` — expanded technical build rules with code examples
- **Theme Reference Library** (inline in this SKILL.md above) — 10 preset theme palettes mapped to xFalcon roles; read the inline section rather than an external file
- **Runtime Theme Switcher Pattern** (inline in this SKILL.md above) — recipe for `theme.css` + `theme.js` + per-file injections for the multi-theme delivery mode
- **External skills**: `theme-factory` (the source of the 10 palettes), `ida-autoexplore` (for optional Stage 4 insight reports), `ida-analyst` / `ida-validate` / `ida-dashboard` (data analysis personas)
```

---

## Summary of changes

- **10 preset themes** available inline in the skill (no external reference files needed for the 10)
- **Two delivery modes** offered equally: single theme vs runtime theme switcher
- **Four new MUST-FOLLOW rules**: Single-Year KPI, Compare Years Toggle, Filter Coverage, Fact-Grain Verification
- **Strengthened depth minimums**: 6+ KPIs, 4+ charts, detail table with ≥7 rows + YoY, explicit disclaimers
- **AutoExplore** added as optional Stage 4 deliverable with portal integration recipe
- **New pitfalls** captured from real incidents (10x overcount, multi-year sums, theme propagation)

All changes are additive where possible; only Brand & Theme Round 1, Dashboard Content Depth Rules, and Reference Files replace existing content.

## Installation

Option A — manual merge:
```
# In your editor, open the current SKILL.md and apply each PATCH block at its anchor
```

Option B — let me apply automatically if you enable write access:
```
chmod u+w /path/to/.claude/skills/xfalcon-onboard/SKILL.md
```
Then ask me to apply the patches and I'll do it in one run.
