---
name: xfalcon-onboard
description: "Onboard a new database connection into xFalcon AnalyticsPro — auto-discovers schema, verifies fact-table grain, interviews the user for business context, produces a full analytics kit (feasibility matrix, schema map, theme with choice of 10 preset palettes or runtime theme switcher, metric definitions with required filters, single-year-KPI dashboards with Compare Years toggle, query templates, setup guide, portal, optional AutoExplore insight reports). ALWAYS trigger this skill when the user says 'new project', 'new connection', 'new database', 'onboard', 'set up dashboards', 'start fresh', 'connect a new data source', 'build dashboards from scratch', 'xfalcon onboard', 'AnalyticsPro setup', or anything suggesting they want to stand up a new xFalcon analytics environment."
---

# xFalcon AnalyticsPro — New Project Onboard

You are setting up a brand-new xFalcon AnalyticsPro analytics environment against a freshly connected database. Your job is to act as a consulting analyst: discover what data exists, interview the user for what the data can't tell you, then produce a complete analytics kit they can use to build dashboards.

The goal is to get from "I just connected a database" to "here's your full kit with feasibility scores, schema map, theme, query templates, and a portal" in one session.

## The Onboarding Flow

There are 5 stages. Work through them in order. Do not skip ahead — each stage feeds the next.

### Stage 1: Auto-Discover the Schema

Before asking the user anything, learn what the data looks like. This reduces the number of questions you need to ask later.

**CRITICAL — IDA Connector Selection:**
Multiple IDA connectors may be available (e.g., `mcp__ida__`, `mcp__f1b68233...`). They connect to DIFFERENT databases. Before running any queries:
1. List tables on each available IDA connector using `ida_get_knowledge(knowledge_type='tables', detail_level='names')`
2. Identify which connector has the project's tables (look for the fact/dimension tables that match the user's domain)
3. Use ONLY that connector for all subsequent queries
4. Document the correct connector in the project SKILL.md so future sessions don't repeat this mistake

**Schema Prefix:**
Always verify the schema prefix. Call `ida_get_knowledge(knowledge_type='schema', table_name='TABLE')` and check whether queries need `public.TABLE_NAME` or just `TABLE_NAME`. The IDA default prefix may not work — test a simple query early to confirm.

**Discovery Steps:**

1. **List all tables** — call `ida_get_knowledge(knowledge_type='tables', detail_level='summary')` to get the full table catalog with row counts and types.
2. **Identify fact vs. dimension tables** — look for large tables with transactional grain (these are facts) and smaller reference/lookup tables (these are dimensions). Use naming conventions, row counts, and column inspection to classify.
3. **Inspect key tables** — for each table that looks like a fact or important dimension, call `ida_get_knowledge(knowledge_type='schema', table_name='TABLE_NAME')` and `ida_get_knowledge(knowledge_type='sample', table_name='TABLE_NAME')` to understand columns and data patterns.
5. **Document actual column names** — column names are the #1 source of query errors. Don't assume names. Common mistakes: `OUTSTANDING_BALANCE` vs `CURRENT_BALANCE`, `INTEREST_INCOME` vs `INTEREST_CHARGED`, `REGION` vs `CENSUS_REGION`, `TOTAL_SALES` vs `TOTAL_CREDIT_SALES`. Always verify against the schema and document a "Common Column Name Mistakes" table in the project SKILL.md.
6. **Check for relationships** — call `ida_get_knowledge(knowledge_type='relationships')` to find join patterns. Watch for mismatched key column names across tables (e.g., `DELINQUENCY_BUCKET_KEY` in the fact table vs `BUCKET_KEY` in the dimension table).
7. **Look for date dimensions** — identify fiscal calendar fields, date hierarchies, and time granularity available.
8. **Check for targets/budgets** — look for any tables containing plan, target, budget, or forecast data.
9. **Assess data quality** — note NULL rates in key columns, date ranges covered, and any obvious gaps.
10. **Test IDA connectivity** — run a simple aggregation query early (e.g., `SELECT COUNT(*) FROM public.TABLE`). IDA may drop connections on complex queries with MIN/MAX on large result sets. If this happens, simplify queries by removing window functions and nested aggregations.
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

After discovery, you should be able to answer most of Phase 2 (Data Understanding) from the questionnaire without asking the user. Summarize what you found in a brief report before moving to Stage 2.

### Stage 2: Interview the User

Now ask the user the questions that data alone can't answer. Read the full questionnaire from `references/questionnaire.md` — but do NOT dump all 96 questions at once. Instead, use the **smart interview** approach:

**How the smart interview works:**

1. Start with Phase 1 (Business Context) from the questionnaire — these are pure business questions that data discovery can't answer. Group them into 3–4 conversational rounds using AskUserQuestion:
   - Round 1: Industry, domain, revenue model (questions 1.1)
   - Round 2: Business entities, hierarchy, value chain (questions 1.2–1.3)
   - Round 3: Audience, stakeholders, time context (questions 1.4–1.5)

2. For Phase 2 (Data Understanding), present what you already discovered and ask the user to confirm or correct. Focus only on what you couldn't determine:
   - "I found these tables — does this look right? Anything missing?"
   - "I see fiscal year fields but couldn't determine the start month — what is it?"
   - "I noticed NULL costs on 30% of products — is that expected?"

3. For Phase 3 (Dashboard Planning), show the user the dashboard catalog from the questionnaire (the Tier 1–4 table) and ask them to select which dashboards they want. Cross-reference against what the data supports — if a dashboard requires data that doesn't exist, flag it as LIMITED or BLOCKED upfront so the user knows before selecting.

4. **Metrics, Filters & Business Rules** — this is where you capture the logic that data discovery can't infer. Run the **Metrics & Filters Discovery** flow (see below). This step prevents the most common post-build rework: wrong metric formulas and missing global filters.

5. Skip Phase 4 deep-dive questions for now — those will be answered when actually building each dashboard.

6. For Phases 5–7 (Design, Interactivity, Delivery), run the **Brand & Theme Discovery** flow (see below), then ask about:
   - Build order preference

#### Metrics & Filters Discovery

This step captures the business rules that sit between raw data and meaningful dashboards. Without it, you'll build charts that look right but calculate wrong. Use AskUserQuestion to walk the user through it in 2–3 rounds:

**Round 1 — Custom Metric Definitions:**

Ask whether the user has a metric calculation document they'd like to upload. Many teams maintain a spreadsheet or doc with their KPI definitions, formulas, and business rules. This is the single most valuable input for accurate dashboards.

Present these options via AskUserQuestion:
| Option | Description |
|--------|-------------|
| **Upload a metric definitions file** | CSV, Excel, PDF, or Word document containing KPI names, formulas, and business rules. We'll parse it and use it as the source of truth for all dashboard calculations. |
| **Tell me your key metrics now** | Walk through the top 10–15 KPIs conversationally — name, formula, and any special rules for each. |
| **Discover from data + I'll validate** | We'll propose metric calculations based on what we found in the schema. You review and correct. |

If the user uploads a file:
- Parse it immediately (read CSV/Excel with pandas, read PDF/DOCX with the appropriate skill)
- Extract each metric's name, formula/calculation, unit of measure, and any conditions or filters
- Store the parsed metrics as a reference table and confirm with the user: "I found X metrics in your file. Here are the first few — does this look right?"
- Save the parsed output as `METRIC_DEFINITIONS.md` in the kit (in addition to the Metric Definitions dashboard)

If the user chooses to walk through metrics conversationally, ask for each:
- Metric name (e.g., "Gross Margin %")
- Formula or calculation method (e.g., "(Revenue - COGS) / Revenue * 100")
- Unit of measure (e.g., %, $, units, ratio)
- Direction: is higher better or lower better?
- Any conditions (e.g., "exclude returns", "only completed orders", "net of tax")

If the user chooses "discover from data", propose calculations based on schema inspection and the standard patterns in `references/questionnaire.md` Appendix C, then ask the user to validate each one.

**Round 2 — Global Filters & Exclusions:**

Every dashboard suite needs a consistent set of filters. Some are global (applied everywhere), others are dashboard-specific. Ask the user:

1. **What records should ALWAYS be excluded across all dashboards?** These become hardcoded WHERE clauses in every query.
   - Examples: test/internal orders, cancelled transactions, discontinued products, demo accounts, specific date ranges with bad data, employee purchases, $0 orders
   - Present common exclusions as a multi-select checklist based on what you found in the data (e.g., if you saw `financial_status = 'cancelled'` or `tags LIKE '%test%'`, suggest those)

2. **What filters should appear as interactive dropdowns on every dashboard?** These become the global filter bar.
   - Examples: date range, location/store, product category, channel, customer segment, region
   - Present the dimensions you discovered as options and let the user pick which should be global vs. dashboard-specific

3. **Are there any conditional rules that change how metrics are calculated depending on the filter context?**
   - Example: "When filtering to online-only, exclude shipping revenue from Net Sales"
   - Example: "When viewing by fiscal period, use fiscal dates not calendar dates"
   - Example: "Margin calculations should exclude products where COGS is NULL rather than treating NULL as zero"

4. **Do you have a separate file with filter rules or data quality notes to upload?**
   - Accept CSV/Excel/PDF/DOCX with exclusion rules, data quality notes, or business rule documentation

**Round 3 — Validation Benchmarks (optional but recommended):**

Ask: "Do you have any known-correct values we can validate against? For example, 'Q4 2025 total revenue should be approximately $X' or 'Store ABC had Y orders in January.' These help us verify the dashboards are calculating correctly."

If the user provides benchmarks, save them in the kit as `VALIDATION_BENCHMARKS.md` and use them in Stage 5 to verify the first dashboard's numbers.

#### Brand & Theme Discovery

This is a critical step — the theme defines the visual identity of every dashboard. Use AskUserQuestion to walk the user through it in 3 rounds (Round 1, 1b, 2), optionally 3.

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

**Round 2 — Theme Generation (depends on Round 1 answer):**

- **If preset theme selected (0–10):** Use the **Theme Reference Library** below for the xFalcon role mapping. Generate the `{THEME}_THEME.md` file with CSS variables, typography, and usage examples. Confirm the palette with the user before proceeding.

- **If "From my website":** Ask for the URL. Use `WebFetch` to retrieve the page and extract brand colors from the site's CSS, meta tags, logo, and visual identity. Look for:
  - CSS custom properties (--brand-color, --primary, etc.)
  - Meta theme-color tag
  - Dominant colors in the header/hero area
  - Logo colors (if visible in SVG or described in CSS)
  - Button/CTA colors (these are usually the accent)
  - Footer background (usually the base dark color)

  **CRITICAL: Determine whether the website uses a LIGHT or DARK theme.** Visit the actual website and look at the background color. If the website has a white or light gray background, generate a LIGHT theme (white cards on light gray background). If the website has a dark background, generate a DARK theme. Do NOT assume dark theme — most websites (e.g., Zillow, Redfin, Airbnb) use light themes with white backgrounds. Getting this wrong means rebuilding every dashboard.

  Then generate a complete theme using the `references/theme_generation_guide.md` reference — map extracted colors into the AnalyticsPro color system (base, accent, positive, negative, text) and build CSS variables, gradients, and glow effects. Present a preview to the user using AskUserQuestion with a short color swatch description before finalizing.

- **If "From my brand colors":** Ask for their hex codes (at minimum: primary and secondary colors). Then use `references/theme_generation_guide.md` to derive the full palette — calculate complementary dark bases, text colors, positive/negative indicators, and gradients from the provided colors. Present and confirm.

- **If "Custom":** Ask for all colors directly: base background, card background, primary accent, secondary accent, positive indicator, negative indicator, primary text, secondary text. Then build the theme doc.

**Round 3 — Logo & Typography (optional):**
Ask if they have a logo file to include and whether they prefer a specific font family (default: Inter). If they provide a logo, note the file path for use in the topbar.

After theme generation, always produce a brief color swatch summary showing the final palette with hex codes, so the user can confirm before you use it across all dashboards.

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

**Important interview principles:**
- Never ask more than 4 questions at a time via AskUserQuestion
- Pre-fill options with smart defaults based on what you discovered
- If the user says "auto" or "you decide", make sensible choices and move on
- Capture every answer — you'll need them all for the kit

### Stage 3: Produce the Feasibility Matrix

Based on discovery + interview answers, score every selected dashboard on a 4-level scale:

| Score | Status | Meaning |
|-------|--------|---------|
| 90–100% | READY | All core KPIs available, minimal workarounds |
| 50–89% | PARTIAL | Core metrics available, some gaps or estimations |
| 20–49% | LIMITED | Major data missing, reduced-scope only |
| 0–19% | BLOCKED | Cannot build — critical data absent |

For each dashboard, document:
- Readiness score and status
- Primary data sources (which tables)
- What works completely
- What's limited and why
- Workarounds for gaps
- Build effort estimate (days)
- Sample queries (at least one per dashboard)

Save this as `DASHBOARD_FEASIBILITY.md` in the project kit folder.

### Stage 4: Generate the Full Kit

Produce all of these files in a kit folder (name it `xfalcon-{project-slug}-kit/`):

1. **DASHBOARD_FEASIBILITY.md** — from Stage 3
2. **DATA_SCHEMA_MAP.md** — maps the user's actual tables/columns to the standard AnalyticsPro dimensional model. Use the reference in `references/data_schema_map_template.md` as a starting point. Include:
   - Required fact tables with column mappings
   - Required dimension tables with column mappings
   - Bridge tables if any
   - Notes on schema differences and workarounds
3. **RETAILEDGE_THEME.md** — brand identity, color palette, CSS variables, typography, layout rules. Generate this from the Brand & Theme Discovery flow in Stage 2. Whether the user chose a preset, extracted from their website, or provided custom hex codes, the output format is the same — see any of the theme reference files for the structure.
4. **METRIC_DEFINITIONS.md** — the authoritative reference for all KPI calculations used across dashboards. Generated from the Metrics & Filters Discovery flow. For each metric, include:
   - Metric name and description
   - Formula (SQL expression and plain-English explanation)
   - Unit of measure and direction (higher-is-better / lower-is-better)
   - Required filters or conditions (e.g., "exclude returns", "completed orders only")
   - Source tables and columns
   - Which dashboards use this metric
   This file is the single source of truth — every query in QUERY_TEMPLATES.sql must match the formulas defined here.
5. **GLOBAL_FILTERS.md** — documents all global exclusions and filter rules:
   - Hardcoded exclusions (WHERE clauses applied to every query)
   - Interactive filter dimensions (what appears in the global filter bar)
   - Conditional calculation rules (metrics that change based on filter context)
   - Data quality notes and caveats
   This file ensures consistency — every dashboard applies the same base filters.
6. **QUERY_TEMPLATES.sql** — starter SQL queries for every READY and PARTIAL dashboard. Each query should:
   - Use the user's actual table and column names
   - Apply all global exclusions from GLOBAL_FILTERS.md
   - Calculate metrics exactly as defined in METRIC_DEFINITIONS.md
   - Pre-aggregate to < 200 rows
   - Include comments explaining the logic
   - Be ready to paste into `ida_query()`
7. **SETUP_GUIDE.md** — step-by-step instructions tailored to this specific project:
   - Quick start (5 steps)
   - Detailed setup with the user's schema
   - Dashboard build checklist
   - Troubleshooting tips
   - File organization
8. **VALIDATION_BENCHMARKS.md** — known-correct values the user provided for cross-checking dashboard output (if any were supplied during the Metrics & Filters Discovery)
9. **metrics-definitions.html** — a standalone, interactive HTML page that serves as the user-facing reference for every KPI and metric used across the dashboard suite. This is different from METRIC_DEFINITIONS.md (the internal build reference) — this HTML page is a deliverable that lives in the kit folder alongside the dashboards and is linked from the portal's Reference section. It must include:
   - Every metric from METRIC_DEFINITIONS.md, organized by category (e.g., Revenue & Financial, Subscriber, Churn, Network Quality, Billing, Roaming, Customer Experience, Segments, Device, Regional)
   - For each metric: name, plain-language definition, unit of measure, calculation formula (SQL expression), and which dashboards use it
   - A search bar for instant keyword filtering across metric names, definitions, and formulas
   - Category filter chips/buttons with metric counts per category
   - Themed with the project's brand identity (topbar with logo, brand colors, Inter font) matching all other dashboards
   - A "Back to Portal" link in the topbar
   - All metric data embedded as a JS array for client-side filtering (no server required, self-contained HTML)
   This page prevents the recurring "what does this number mean?" question from stakeholders and is a standard deliverable in every xFalcon deployment.
10. **SKILL.md** — a project-specific build skill that knows this project's schema, theme, metric definitions, global filters, and dashboard list. Future sessions can read this skill to build dashboards without re-doing discovery. This file must include:
   - The correct IDA connector name (e.g., `mcp__ida__`) and a warning about other connectors
   - A "Common Column Name Mistakes" table mapping wrong assumptions to correct column names
   - Schema prefix requirement (e.g., `public.TABLE_NAME`)
   - All join notes, especially mismatched key column names
   - Fiscal year derivation SQL
   - Complete theme spec with typography sizes (KPI values, labels, chart titles, table headers)
   - Topbar consistency rules (logo format, title format, back link placement)
   - X-axis label alignment rules for YoY charts (months12 vs monthsAll pattern)
   - Flat data prevention checklist
   - PPTX pipeline instructions if presentations were built
   - QA checklist from Pre-Delivery QA
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

### Stage 5: Build the Portal, Review Theme, Then Build All Dashboards

After the kit is generated:

1. **Build the portal page FIRST** (`index.html`) — a landing page that links to all dashboards with:
   - Top-level KPI snapshot cards (pull from the first few queries)
   - 2–3 summary charts using the project's chart color palette (see Chart Color Palette rules below)
   - Numbered dashboard directory with status indicators (e.g., "1. Portfolio Overview", "2. NOI & Financial Performance")
   - Navigation to each dashboard
   - Property/entity summary table (top 20 by key metric)
   - Branded with the user's theme

   - A "Reference" section after the dashboard directory linking to `metrics-definitions.html` (and `training-guide.html` if built)

2. **STOP and show the portal page to the user for review** — this is a CRITICAL checkpoint. The user must confirm:
   - The color scheme / theme looks correct (light vs. dark, brand colors accurate)
   - The layout and structure make sense
   - The KPI values look reasonable
   - The chart colors follow the 3-color palette (Blue, Teal, Gray — not 7 rainbow colors)
   Do NOT proceed to build all dashboards until the user approves the portal. This prevents building 12 dashboards with the wrong theme and having to redo everything.

3. **Build ALL dashboards** — after portal approval, build every READY and PARTIAL dashboard, not just the first one. Each dashboard must:
   - Be a complete, self-contained HTML file with real embedded data (not empty placeholders)
   - Include deep analysis with YoY comparisons, budget/plan variance, and trend data — NOT surface-level metrics
   - Have at least 5 chart visualizations plus KPI cards plus a detail table
   - Follow every Technical Build Rule below exactly (especially the Chart.js and color rules)
   - Use a working back button: `href="index.html"` (NEVER `href="#"`, NEVER `javascript:history.back()`)
   - Have all canvases properly initialized with `new Chart()` calls that produce visible charts

4. **Run the Pre-Delivery QA Checklist** (see below) on EVERY file before presenting to the user.

5. **Present the complete kit** — share all files with the user via `present_files` and summarize what was produced.

## Technical Build Rules

These rules apply to every HTML dashboard produced by xFalcon AnalyticsPro. They exist because they've been proven through hundreds of dashboard iterations to prevent the most common rendering and compatibility issues:

1. **Self-contained HTML** — single file, embedded CSS/JS/data, no server needed
2. **Chart.js v4 from CDN** — use EXACTLY this URL on every file: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js` — never use `chart.min.js` (does not exist for v4), never use `cdnjs.cloudflare.com` (inconsistent file naming). Standardize ALL dashboards on the same CDN URL.
3. **Chart.js CANNOT resolve CSS var() references** — all colors passed to Chart.js datasets, scales, grid, ticks, and plugins MUST be direct hex strings (e.g., `'#006AFF'`), NEVER CSS variables like `var(--color-blue)`. CSS variables only work in stylesheets and inline styles on DOM elements. Chart.js renders into a canvas context where `var()` silently evaluates to `undefined`, producing invisible/blank charts with no error message. This is the sneakiest cause of "charts render but data is invisible."
4. **Lazy tab initialization** — only create charts when their tab becomes visible (setTimeout after tab switch), because Chart.js can't size a canvas that's hidden
4. **String concatenation only** — use `+` never backtick template literals, for IE/older browser compatibility
5. **`function(){}` not arrow functions** — in all onclick handlers and callbacks
6. **`var` not `const/let`** — for maximum browser compatibility
7. **`mk()` helper for Chart.js** — ALWAYS define the mk() helper as a Chart.js instance manager. Its ONLY job is to destroy a previous chart instance and create a new one on the same canvas. Use this exact pattern:
   ```javascript
   var chartInstances = {};
   function mk(id, cfg) {
     if (chartInstances[id]) chartInstances[id].destroy();
     var ctx = document.getElementById(id).getContext('2d');
     chartInstances[id] = new Chart(ctx, cfg);
     return chartInstances[id];
   }
   ```
   NEVER overload mk() for DOM element creation — if you need a DOM helper, name it something else (e.g., `mkEl()`, `createEl()`). Having mk() do double duty between Chart.js and DOM creation has caused rendering failures.
8. **No pie or doughnut charts** — use horizontal bars or stacked proportion bars for part-to-whole. This is a firm design rule across all xFalcon deployments.
9. **Topbar** on every dashboard — logo mark + project name + "Back to Index" link (`href="index.html"`)
11. **Sticky table headers** — for all scrollable data grids
12. **Pre-aggregate server-side** — each `ida_query()` should return < 200 rows of chart-ready data
13. **Inter font** from Google Fonts CDN
14. **Number-to-string in DOM builders** — when building table rows with a DOM helper, always convert numeric values to strings with `String(value)` or `value.toString()` before appending as text nodes. Passing raw numbers to `appendChild()` causes a TypeError that crashes the script and blanks everything below it.

### Dynamic Filter Architecture (MUST FOLLOW)

Every dashboard with interactive filters must follow this architecture. The #1 post-delivery complaint is "filters don't target the visualizations." This happens when filter `onchange` handlers update some elements but not others, or when update functions use static global data instead of the filtered subset.

**Core pattern — every filter-enabled dashboard needs these components:**

1. **Embedded raw data as JS arrays** — pre-aggregated from IDA, stored as `var DATA = [...]` at the top of the script.

2. **`getFilters()` function** — reads all dropdown values into a single object:
   ```javascript
   function getFilters() {
     return {
       dept: document.getElementById('filterDept').value,
       loc: document.getElementById('filterLoc').value,
       yr: document.getElementById('filterYear').value
     };
   }
   ```

3. **`applyFilters()` function** — filters the raw data, then calls ALL update functions with the filtered result:
   ```javascript
   function applyFilters() {
     var f = getFilters();
     var filtered = DATA.filter(function(row) {
       var deptOk = f.dept === 'All' || row.dept === f.dept;
       var locOk = f.loc === 'All' || row.location === f.loc;
       var yrOk = f.yr === 'All' || String(row.yr) === f.yr;
       return deptOk && locOk && yrOk;
     });
     updateKPIs(filtered);
     updateCharts(filtered);
     updateTable(filtered);
     updateSubtitle();
     fitKpiText();
   }
   ```

4. **CRITICAL: `updateKPIs(filtered)`, `updateCharts(filtered)`, `updateTable(filtered)` must derive ALL values from the `filtered` parameter** — never from the original unfiltered global array. This is the most common bug: the function signature accepts `filtered` but the body loops over `DATA` (the global), so filters appear to do nothing.

5. **Every `<select>` filter must call `onchange="applyFilters()"` and `applyFilters()` must be called on page load** to initialize the default view.

6. **Filter dropdown initialization** — when populating dropdowns dynamically via JS, always clear `innerHTML` first before adding options. Otherwise you get duplicate "All" entries or missing values:
   ```javascript
   function initFilterOptions() {
     var dd = document.getElementById('filterYear');
     dd.innerHTML = ''; // Clear first!
     dd.innerHTML += '<option value="All">All Years</option>';
     years.forEach(function(y) {
       dd.innerHTML += '<option value="' + y + '">' + y + '</option>';
     });
   }
   ```

7. **Reporting period subtitle** — update dynamically based on filter selection:
   ```javascript
   function updateSubtitle() {
     var yr = document.getElementById('filterYear').value;
     var text = yr === 'All' ? 'Reporting Period: All Years' : 'Reporting Period: Jan-Dec ' + yr;
     document.getElementById('reporting-period').textContent = text;
   }
   ```

### fitKpiText() Pattern (MUST INCLUDE)

KPI values overflow their cards when values are long (e.g., "$52,000-$200,000", "Backend Engineering"). Every dashboard must include this dynamic font-sizing function:

```javascript
function fitKpiText() {
  var els = document.querySelectorAll('.kpi-value');
  for (var i = 0; i < els.length; i++) {
    var len = els[i].textContent.length;
    if (len > 12) els[i].style.fontSize = '18px';
    else if (len > 8) els[i].style.fontSize = '22px';
    else els[i].style.fontSize = '28px';
  }
}
```

Call `fitKpiText()` at the end of every `applyFilters()` call and on page load.

### KPI Delta Indicators

Use a consistent pattern for KPI comparison indicators across all dashboards:

**For dark themes:**
```css
.kpi-delta { font-size: 13px; margin-top: 4px; }
.kpi-delta.positive { color: #7CFF01; }
.kpi-delta.negative { color: #FF3366; }
.kpi-delta.neutral { color: #94A3B8; }
```

**For light themes:**
```css
.kpi-delta { font-size: 13px; margin-top: 4px; }
.kpi-delta.positive { color: #059669; }
.kpi-delta.negative { color: #D32F2F; }
.kpi-delta.neutral { color: #94A3B8; }
```

The neon green (#7CFF01) and hot pink (#FF3366) are designed for dark backgrounds — they're nearly invisible on light backgrounds. Light themes must use standard green (#059669) and red (#D32F2F) for KPI deltas. Always match the delta colors to the theme's background luminance.

Set the class dynamically based on the computed delta value. These colors are for KPI card text only — never use them in chart datasets.

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

### Chart.js Critical Rules (MUST FOLLOW)

These rules prevent the #1 source of blank/broken visualizations. Violations cause silent failures where charts simply don't render:

1. **NEVER use `type: 'barh'`** — this is NOT a valid Chart.js chart type. It does not exist. For horizontal bar charts, use `type: 'bar'` with `indexAxis: 'y'` in the options. Using `barh` causes a JavaScript error that kills the entire script — all charts after the bad one will also be blank.

2. **Horizontal bar + dual axes conflict** — when using `indexAxis: 'y'` (horizontal bars), the value axis is X, not Y. If you need dual axes on a horizontal bar chart, use `xAxisID: 'x'` and `xAxisID: 'x1'` on datasets and define `x` and `x1` scales. Do NOT use `yAxisID` with `indexAxis: 'y'` — this silently fails and produces a blank chart. If in doubt, use a vertical bar chart (`indexAxis` omitted or set to `'x'`) with `yAxisID: 'y'` and `yAxisID: 'y1'` which works reliably.

3. **CDN URL must be exact** — `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`. Wrong URLs (e.g., `chart.min.js`, `chart.js` without `umd`) fail to load silently, and ALL charts on the page will be blank because `Chart` is undefined.

4. **Every `<canvas>` must have a matching `new Chart()` call** — if you declare a canvas in HTML but forget to initialize it in JavaScript, it shows as a blank white box. Audit every canvas ID against the script before delivery.

5. **Script errors kill everything below them** — Chart.js and vanilla JS run top-to-bottom. If chart #1 has an error (wrong type, bad data, undefined variable), charts #2–#5 and the data table below will ALL be blank even if their code is perfect. Always wrap chart initialization carefully and test the first chart in isolation.

### Topbar Consistency Rules

The topbar must be identical across ALL dashboards in a project. Inconsistencies here are one of the most common post-delivery complaints. Standardize these elements before building the first dashboard and apply them everywhere:

1. **Logo text:** Use the short form (e.g., "xF") — never the full brand name. The "x" and "F" should use the theme's accent colors.
2. **Title format:** `Project Name / N. Dashboard Name` (e.g., "Falcon Finance / 3. Portfolio Health"). Include the dashboard number for easy reference.
3. **Subtitle positioning:** The topbar subtitle (e.g., reporting period) must use normal document flow — `margin-top: 2px; font-weight: 400;`. NEVER use `position: absolute` for subtitles, as this causes text overlap with the main title on different screen sizes. This was a recurring bug across multiple dashboards.
4. **Back link placement:** Always on the RIGHT side of the topbar (outside the `.topbar-left` div). Never place it inside `.topbar-left` alongside the logo — this causes it to shift position across dashboards when title lengths vary.
5. **Back link target:** Always `href="index.html"` — never `href="#"` or `javascript:history.back()`
6. **Back link hover:** Use `text-decoration: underline` — do NOT change the text color on hover (this creates inconsistent behavior across dashboards if different colors are used).

```css
.back-link { color: var(--color-accent); text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
```

### Typography Standardization

Lock down font sizes before building. Inconsistent sizing is hard to spot during development but obvious when dashboards are viewed side by side. Define these as project standards:

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| KPI Label | 12px | 600 | Uppercase, secondary text color |
| KPI Value | 28px | 700 | Primary brand color — NOT body text color |
| KPI Comparison | 12–13px | 500 | Green/Red for positive/negative |
| Chart Title | 16px | 700 | Primary brand color |
| Table Header | 13px | 600 | White text on dark brand background |
| Table Body | 13px | 400 | Primary text color |
| Section Title | 18px | 700 | Primary brand color |
| Topbar Title | 16px | 600 | Light/white text |

**Table Header Standard:**
Always use dark brand-color headers, NOT light gray. Light gray headers are the most common styling inconsistency. The correct pattern:

```css
.detail-table th {
  background: var(--color-brand-primary); /* e.g., #1D3557 */
  color: var(--color-text-on-dark);       /* e.g., #F1FAEE */
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
}
```

Do NOT use `text-transform: uppercase` or `letter-spacing` on table headers — this was a common inconsistency found during QA.

### X-Axis Label Alignment (Critical for YoY Charts)

When showing Year-over-Year comparisons with two 12-month datasets on the same chart, the x-axis label count must match the dataset length. Getting this wrong is a silent bug — the chart renders but with data plotted against the wrong months.

**WRONG:** Using 24 labels (`['Jan 24', 'Feb 24', ... 'Dec 25']`) with 12-item datasets — this plots both year lines on the first 12 labels only, leaving the right half of the chart empty.

**CORRECT:** Use 12 generic labels (`['Jan', 'Feb', ... 'Dec']`) and overlay both CY and PY datasets:

```javascript
var months12 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthsAll = months12.map(function(m) { return m + ' 24'; }).concat(months12.map(function(m) { return m + ' 25'; }));
```

- Use `months12` for YoY comparison charts (2 datasets × 12 points)
- Use `monthsAll` for full 24-month trend charts (1 dataset × 24 points)
- Never mix — always verify that `labels.length === datasets[0].data.length`

### Flat Data Prevention

Before embedding data in any chart, spot-check the arrays for suspiciously identical values. Flat-looking data destroys user trust and is one of the first things noticed. Common causes and fixes:

1. **Rounding hides variation:** Utilization rates like `[0.38, 0.38, 0.38, 0.38]` are actually `[38.02%, 37.86%, 37.84%, 37.82%]` when you keep decimals. Multiply ratios by 100 and zoom the y-axis with `min`/`max` to show meaningful variation.
2. **Wrong aggregation level:** Getting portfolio-level totals instead of per-category breakdowns (e.g., customer acquisition showing ~21K per segment instead of ~107-129K actual values). Always verify the GROUP BY clause returns the right grain.
3. **Wrong column:** Using a stored ratio column directly when you should compute it (e.g., yield = interest/balance, not a pre-calculated rounded percentage).
4. **Sample data vs. real data:** When IDA returns sample rows, don't assume the aggregate pattern matches. Always run the actual aggregation query and inspect the result range.

### Chart Color Palette (MUST FOLLOW)

Use a strict 3-color primary palette across all charts. This prevents the "rainbow chart" problem where every bar/line is a different color:

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary / Actual / Current Year** | Blue | `#006AFF` | The default color for any single-dataset chart, current year data, actual values |
| **Secondary / Budget / Plan** | Teal | `#1A7F64` | Budget lines, plan comparisons, secondary datasets |
| **Tertiary / Prior Year / Baseline** | Gray | `#94A3B8` | Prior year data, baselines, benchmarks |

**Extended palette** (use sparingly, only when 3 colors aren't enough):
| Role | Color | Hex |
|------|-------|-----|
| Extended 1 | Light Blue | `#0EA5E9` |
| Extended 2 | Amber | `#F59E0B` |

**Color rules:**
- **Red (`#D32F2F`) and Green (`#059669` / `#2E7D32`) are RESERVED for KPI indicators only** — use them ONLY in KPI card text to show positive/negative variance (e.g., "+4.6%" in green, "-2.1%" in red). NEVER use red or green as a bar fill, line color, or area fill in any chart dataset. This is the most common color mistake.
- **Conditional coloring for deviation charts** — when a chart shows positive vs. negative deltas (e.g., budget variance per market), use Blue (`#006AFF`) for positive and Gray (`#94A3B8`) for negative, NOT red/green.
- **Dashed lines for Budget and Prior Year** — when a line chart shows Actual vs. Budget vs. Prior Year, use `borderDash: [5, 5]` on Budget and Prior Year lines to visually distinguish them from the solid Actual line.
- **Never exceed 5 colors in a single chart** — if you have more than 5 series, consider splitting into multiple charts or using a grouped layout.

**Theme-aware override:** When using a non-default theme, the Primary/Secondary/Tertiary hex values come from that theme's palette (see Theme Reference Library above). The structural rule (exactly 3 primary colors, red/green reserved for KPI text, etc.) stays constant — only the specific hex values change.

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

### Back Button Rules

Every dashboard MUST have a working back button in the topbar that returns to the portal:

```html
<a href="index.html" class="back-link">← Back to Portal</a>
```

NEVER use:
- `href="#"` — this scrolls to page top and does nothing
- `javascript:history.back()` — this breaks when the user opens the dashboard directly
- Missing/omitted back link — the user gets trapped on the dashboard

### Dashboard Numbering

All dashboards should be numbered sequentially in the portal's dashboard directory AND in each dashboard's title/topbar. This allows the user to reference dashboards by number (e.g., "fix dashboard 8"). Example:
- Portal card: "8. Market Benchmarking"
- Dashboard topbar: "Falcon Real Estate / 8. Market Benchmarking"

## Quarterly Business Review (QBR) Dashboards

Users often request QBR dashboards and presentations after the core dashboards are built. These are executive summaries for a specific quarter.

### QBR HTML Dashboard Pattern

QBR dashboards are numbered after the core set (e.g., `11-qbr-q4-2025.html`) and linked from a separate "Quarterly Business Reviews" section on the portal:

```html
<div class="section-title">Quarterly Business Reviews</div>
<div class="dash-grid">
  <a class="dash-card" href="11-qbr-q4-2025.html" style="border-left:4px solid var(--color-accent)">
    <div class="dash-num" style="color:var(--color-accent)">QBR</div>
    <div class="dash-name">Q4 2025 — Quarterly Business Review <span class="status-badge">New</span></div>
    <div class="dash-desc">Executive summary of Oct–Dec 2025 performance...</div>
  </a>
</div>
```

QBR dashboards should include: 8 KPI cards, 5+ charts, partner/segment tables, and BNPL/product summaries — covering the full quarter at a glance.

### QBR PowerPoint Pipeline

When the user requests a PPTX presentation for a QBR:

1. **Library:** PptxGenJS (Node.js). Install: `npm install -g pptxgenjs --prefix ~/.npm-global`
2. **Execute:** `NODE_PATH=~/.npm-global/lib/node_modules node build-qbr.js`
3. **Visual QA:** Convert to images for inspection:
   - `python <path>/soffice.py --headless --convert-to pdf "file.pptx"` (PDF outputs to working directory, NOT next to input)
   - `pdftoppm -jpeg -r 150 output.pdf slide`
   - Read each slide image and check for issues
4. **Fix and re-generate** if issues are found

**PPTX Design Rules (learned from QA failures):**

1. **Prevent text overlap:** Keep KPI values short ("$121.8M" not "$121.81M"). Set text box widths wide enough for 6-character values. Always test that the largest expected value fits without wrapping.
2. **High contrast only:** Navy backgrounds → white/ice text. Light backgrounds → navy/dark text. Never use coral on teal, yellow on white, or red on blue.
3. **No empty fields:** If a YoY value is unavailable, show "N/A" or omit the field. Never display "YoY:" with a blank value.
4. **Minimum font sizes:** Slide titles ≥ 18pt, KPI values ≥ 24pt, body text ≥ 11pt, table text ≥ 9pt.
5. **Analytical insights on every slide:** Don't just show numbers — include 1–2 sentences explaining the trend, root cause, or business implication. "Weak data analysis" is a common user complaint.
6. **Shadow helper:** Create a fresh shadow object per shape to avoid PptxGenJS reference issues:
   ```javascript
   function cardShadow() {
     return { type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.08 };
   }
   ```
7. **Color format: NO # prefix** — PptxGenJS uses `"006AFF"` not `"#006AFF"`. The `#` prefix is silently ignored or causes color mismatches. Define a palette object with bare hex values:
   ```javascript
   var C = { navyDark: "0A1628", cyan: "00D4FF", coral: "FF6B35", blue: "006AFF" };
   ```
8. **Icon pipeline (react-icons to sharp to base64 PNG):** For slide icons, render React icons server-side to SVG, convert to PNG with sharp, then embed as base64:
   ```javascript
   var ReactDOMServer = require("react-dom/server");
   var sharp = require("sharp");
   function iconToBase64Png(IconComponent, color, size) {
     var svg = ReactDOMServer.renderToStaticMarkup(
       React.createElement(IconComponent, { color: color, size: String(size || 256) })
     );
     return sharp(Buffer.from(svg)).png().toBuffer().then(function(buf) {
       return "image/png;base64," + buf.toString("base64");
     });
   }
   ```
   Install: `npm install -g pptxgenjs react react-dom react-icons sharp --prefix ~/.npm-global`
   Execute: `NODE_PATH=~/.npm-global/lib/node_modules node build-report.js`
9. **Alternate slide backgrounds:** Dark (navy) and light (white) slides for visual rhythm. Title and closing slides are dark; content slides are light.

### Year-End / Management Report Link on Portal

When a PPTX report is generated, add a full-width download link card to the portal's dashboard directory. Use a distinct accent color (coral) to differentiate it from dashboard cards:

```html
<a href="Report-Name.pptx" class="directory-card"
   style="grid-column: 1 / -1; border-left-color: var(--color-coral);
          background: linear-gradient(135deg, rgba(255,107,53,0.08) 0%, var(--color-base-dark) 100%);">
  <div class="directory-number" style="color: var(--color-coral);">&#x1F4CA;</div>
  <div class="directory-name">Year-End HR Report 2024</div>
  <div class="directory-desc">Comprehensive management report with data-driven analysis (PowerPoint)</div>
</a>
```

This card should appear at the bottom of the dashboard directory grid, spanning both columns.

## Weekly Business Review (WBR) Dashboard

A WBR is a standard deliverable for mature analytics deployments. It provides a weekly operational snapshot across all business dimensions in a single scrollable page. Users often request this after the core dashboards are built, sometimes providing a PowerPoint WBR from another system as a reference.

### WBR Structure

A WBR dashboard is a single HTML page with 6–7 collapsible sections, each covering a different business dimension. Unlike core dashboards that focus on one area, the WBR touches everything — it's the "single page to read on Monday morning."

**Standard WBR sections:**

1. **Overall Business Performance** — headline KPI (total revenue), executive summary narrative (2–3 sentences), channel performance tiles, brand performance tiles, price/promo impact tiles. This section uses a grid of small KPI tiles rather than the large KPI cards used in core dashboards.

2. **Brand/Product Performance** — category breakdown bars, channel mix bars, 4-week trend line, brand mix horizontal bars. 3–4 Chart.js charts covering different angles.

3. **Top Products** — ranked table of top 10–15 products by revenue with units, ASP, margin, and vs LY columns.

4. **Brand Scorecard** — table showing each brand's LW (last week), PW (prior week), LY (last year) metrics with in-stock badges and directional indicators.

5. **Channel Snapshot** — table with one row per channel showing revenue, GM%, YoY change, and share of total.

6. **Geographic Performance** — region-level comparison, sub-region breakdown charts, detail table by geography.

7. **Supply Chain & Inventory** — fill rate, in-stock rate, days on hand, shipment volume KPIs plus trend charts and brand-level inventory health table.

### WBR-Specific Patterns

**Week selector:** WBR dashboards include a week-number dropdown (e.g., W49–W52) that dynamically updates all sections. Embed 4 weeks of data and use client-side filtering.

**KPI tile grid:** The executive summary section uses a compact tile grid (not the large KPI cards from core dashboards). Each tile is ~120px wide with a small label, bold value, and delta indicator. Use CSS grid with `repeat(auto-fill, minmax(120px, 1fr))` for responsive wrapping.

**Executive summary narrative:** Generate a 2–3 sentence text summary that calls out the headline metric, the biggest mover, and one risk/opportunity. Example: "Week 52 revenue reached $869K, up 87.7% vs last year driven by strong eCommerce growth (+156% YoY). Crestview Biscuits led all brands at $267K. In-stock rate held steady at 96.1%."

**vs LY and vs PW comparisons:** Every metric in the WBR should show both vs Last Year AND vs Prior Week where data permits. This dual comparison is the hallmark of a useful WBR.

**Adapting from PowerPoint references:** When the user provides a WBR PowerPoint from another domain (e.g., fashion/apparel), map the concepts to the project's data model:
- Segment breakdowns (Women's/Men's) → Brand or category breakdowns
- Retail/Ecomm DTC → Project's actual channel structure
- vs Forecast/vs Operating Plan → vs LY and vs PW (if no forecast data exists)
- In-stock rates → From inventory fact table OOS/stock flags
- Core Franchises → Brand scorecard with multi-period comparisons

### WBR Data Queries

A WBR requires more queries than a typical dashboard (8–12 IDA queries). Each query should cover all 4 weeks using `WHERE WEEK_NUMBER IN (49,50,51,52)` and grouping by week, then embed the full result set for client-side week filtering.

## Resource Pages (Metrics Definitions, Training Guide)

Beyond dashboards, a complete analytics kit includes reference pages that help users understand and navigate the system. These are standard deliverables in every deployment — not optional extras.

### Metrics Definitions Page (ALWAYS BUILD)

The metrics definitions page (`metrics-definitions.html`) is a mandatory deliverable for every xFalcon deployment. It is the single user-facing reference that explains what every number on every dashboard means. Build it after all dashboards are complete, since you need the full inventory of metrics to populate it.

**Structure:**
- Topbar matching all other dashboards (logo, project name, "Back to Portal" link)
- Page header with title and a note about currency and fiscal year conventions
- Search bar (instant client-side filtering across names, definitions, formulas, and dashboard tags)
- Category filter chips with metric counts (e.g., "Revenue & Financial (11)", "Churn Metrics (5)")
- Metric cards grouped by category, each showing:
  - Metric name (bold)
  - Plain-language definition (what it measures, why it matters)
  - Tags: unit of measure, calculation formula, which dashboards reference it
- Footer with version and generation info

**How to populate it:**
1. After all dashboards are built, scan every dashboard for KPI labels, chart dataset labels, and table column headers
2. Cross-reference with METRIC_DEFINITIONS.md for formulas and business rules
3. Organize into logical categories (Revenue, Subscribers, Churn, Network, 5G, Billing, Roaming, Experience, Regional, Segments, Device — adjust to the project domain)
4. Embed the full metric inventory as a JS array for client-side search/filter
5. Apply the project theme (topbar, colors, typography)

**Linking from portal:**
Add a "Reference" section at the bottom of the portal's dashboard directory (after any QBR or Research sections, before the footer):

```html
<h2 class="section-header">Reference</h2>
<div class="dashboard-grid">
  <a href="metrics-definitions.html" class="dashboard-card teal">
    <div class="dashboard-number">Reference</div>
    <div class="dashboard-name">Metrics & KPI Definitions</div>
    <div class="dashboard-description">Standardized definitions, formulas, and source tables for all metrics used across the analytics suite. Searchable and filterable.</div>
  </a>
</div>
```

### Training Guide

A training guide (`training-guide.html`) is an HTML page linked from the portal that covers:
- Getting Started — what the portal is, how to navigate
- Dashboard Overview — 1-paragraph description of each dashboard with its primary use case
- How to Read KPI Cards — explanation of delta indicators, color coding, comparison periods
- Filter Usage — how the year/time filters work, what "All" means
- Generator Buttons — quick-launch buttons that open multiple related dashboards at once
- Metric Definitions — reference table of all KPIs with formulas and source tables
- FAQ — common questions about the data

### Linking Resource Pages from Portal

Add a "Reference" section to the portal after the dashboard directory (and after any QBR or Research sections). The metrics definitions page is always included; the training guide is added when built:

```html
<h2 class="section-header">Reference</h2>
<div class="dashboard-grid">
  <a href="metrics-definitions.html" class="dashboard-card teal">
    <div class="dashboard-number">Reference</div>
    <div class="dashboard-name">Metrics & KPI Definitions</div>
    <div class="dashboard-description">Standardized definitions, formulas, and source tables for all metrics used across the analytics suite.</div>
  </a>
  <a href="training-guide.html" class="dashboard-card magenta">
    <div class="dashboard-number">Reference</div>
    <div class="dashboard-name">Training Guide</div>
    <div class="dashboard-description">How to navigate dashboards, read KPIs, use filters, and launch dashboard groups.</div>
  </a>
</div>
```

## Cross-Dashboard Navigation & Generator Buttons

Users often want to open a group of related dashboards at once (e.g., "open all QBR dashboards" or "open the regional analysis set"). The correct pattern is simple one-click buttons — NOT form-based URL parameter passing.

### Generator Button Pattern (MUST FOLLOW)

Use simple `window.open()` calls to open multiple dashboards in new tabs:

```javascript
function openQBR() {
  window.open('01-executive-overview.html', '_blank');
  window.open('02-sales-revenue.html', '_blank');
  window.open('04-product-margin.html', '_blank');
  window.open('07-shipments-fill-rate.html', '_blank');
}
```

```html
<div class="generator-panel">
  <div class="generator-header">
    <span class="generator-icon">📊</span>
    <div>
      <strong>Generate QBR Package</strong>
      <p class="generator-desc">Opens Executive Overview, Sales & Revenue, Product Margin, and
      Shipments in new tabs. Use filters on each dashboard to select your time period.</p>
    </div>
  </div>
  <button class="btn-action" onclick="openQBR()">Open QBR Dashboards →</button>
</div>
```

### URL Parameter Passing — DO NOT USE

Cross-page filter passing between static HTML files (e.g., appending `?year=2025&quarter=Q3` to URLs and reading them with `getUrlParam()` on the target page) is fragile and unreliable. Problems encountered in production:
- Year options in the source form don't match options in the target dashboard's dropdown, causing silent fallback to defaults
- The `getUrlParam()` → `select.value = param` flow requires exact string matching between the parameter value and the `<option>` value, which breaks whenever dropdown options are reformatted

Instead, open dashboards directly and let users select filters on each dashboard individually. This is simpler, more reliable, and avoids the synchronization problem entirely.

**Exception:** The Runtime Theme Switcher pattern uses `?theme=` URL propagation — but that's handled by `theme.js` as a click-time rewrite, not as a cross-dashboard filter. It's a presentation-layer concern, not a data filter.

## Pre-Delivery QA Checklist

Run this checklist on EVERY HTML file before presenting to the user. This prevents the most common issues that cause rework:

### 1. Chart.js Rendering Audit
For each HTML file:
- [ ] CDN URL is exactly `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js`
- [ ] No `type: 'barh'` anywhere — search the file, it must return zero matches
- [ ] Every `<canvas id="X">` has a matching `new Chart(document.getElementById('X'), ...)` or `mk('X', ...)` call
- [ ] No `indexAxis: 'y'` combined with `yAxisID` on datasets (use xAxisID instead, or remove indexAxis)
- [ ] All chart data arrays have actual values (not empty arrays or undefined references)
- [ ] mk() function is defined as a Chart.js helper (not overloaded for DOM creation)

### 2. Color Compliance Audit
- [ ] No red (`#D32F2F`, `#EF4444`, `#DC2626`, etc.) used as `backgroundColor` or `borderColor` in any chart dataset
- [ ] No green (`#2E7D32`, `#059669`, `#10B981`, etc.) used as `backgroundColor` or `borderColor` in any chart dataset
- [ ] Red and green used ONLY in KPI card text classes (`.positive`, `.negative`, `.metric-pos`, `.metric-neg`)
- [ ] Chart datasets use only Blue/Teal/Gray palette (extended: LightBlue/Amber), OR the theme's Primary/Secondary/Tertiary when a non-default theme is in use
- [ ] No more than 5 distinct colors in any single chart

### 3. Navigation Audit
- [ ] Back link exists in topbar: `href="index.html"` (not `href="#"`, not `javascript:history.back()`)
- [ ] Back link is on the RIGHT side of the topbar (outside `.topbar-left`)
- [ ] All inter-dashboard links work (file names match exactly)

### 4. Content Depth Audit
- [ ] At least 6 KPI cards with comparison indicators — ALL single-year
- [ ] At least 4 chart visualizations (not empty canvases)
- [ ] At least 1 data table with 7+ rows and a YoY column
- [ ] At least 1 disclaimer / data-governance note
- [ ] Explicit year labels on every KPI, chart title, and table header
- [ ] Compare Years toggle implemented (where multi-year data exists)

### 5. JavaScript Syntax Validation
- [ ] Run `node --check <file.html>` — extract the `<script>` content to a temp .js file and validate syntax. Extra/missing braces are the #1 cause of completely blank dashboards. A single extra `}` in a chart config kills the entire page with no visible error.
- [ ] If `node --check` is not feasible, manually count braces in chart config objects — ensure every `{` has a matching `}`
- [ ] Test the page in a browser or use `grep -c '}' file.js` vs `grep -c '{' file.js` as a sanity check

### 6. JavaScript Safety Audit
- [ ] No `const` or `let` — use `var` only
- [ ] No arrow functions `=>` — use `function(){}` only
- [ ] No template literals — use string concatenation with `+`
- [ ] Numeric values converted to strings before DOM insertion (`String(val)` or `val.toString()`)
- [ ] No undefined variable references in chart data arrays

### 7. Theme Consistency Audit
- [ ] Background color matches theme (light = `#F8F9FA` or `#FFFFFF`, dark = theme's base color)
- [ ] Card backgrounds match theme standard (light themes: `#FAFBFC` or `#FFFFFF`)
- [ ] Font is Inter from Google Fonts CDN
- [ ] All files use the same color palette — no file uses a different set of chart colors
- [ ] If multi-theme (runtime switcher): every file has the inline theme-detection script after `</title>`, the `theme.css` link, and `theme.js` before `</body>`

### 8. Topbar Consistency Audit (Cross-File)
- [ ] Logo text is the same short form across all dashboards (e.g., "xF" — never "xFalcon" on one and "xF" on another)
- [ ] Title format is consistent: "Project Name / N. Dashboard Name"
- [ ] Back link position is identical (RIGHT side) on every dashboard
- [ ] Back link hover behavior is identical (underline, not color change)

### 9. Data Quality Audit
- [ ] No flat/identical chart data arrays — spot-check for `[0.38, 0.38, 0.38, 0.38]` patterns
- [ ] X-axis label count matches dataset length (months12 for YoY, monthsAll for 24-month trends)
- [ ] KPI values are 28px and use the brand primary color (not body text color)
- [ ] Table headers use dark brand background with white text (not light gray)
- [ ] Fact-table grain filter applied (e.g., `GOAL_TYPE_KEY = 5`) — verify headline totals are NOT 5-10× inflated

### 10. Metrics Definitions Page Audit
- [ ] `metrics-definitions.html` exists in the kit folder
- [ ] Every KPI label from every dashboard is represented in the definitions page
- [ ] Every chart dataset label from every dashboard is represented
- [ ] Every table column header that represents a metric (not a dimension like "Region") is represented
- [ ] Search bar works and filters metrics in real time
- [ ] Category filter chips display correct counts and filter correctly
- [ ] Currency symbol matches the project standard (e.g., ₹ not $, or vice versa) in all definitions and formulas
- [ ] Page is themed consistently with all other dashboards (topbar, fonts, colors)
- [ ] "Back to Portal" link in topbar works and points to `index.html`
- [ ] Portal index.html has a "Reference" section with a card linking to `metrics-definitions.html`

## Common Pitfalls (Lessons Learned)

These are real issues encountered in production deployments. Read this section before building:

### Chart.js & Rendering
1. **`chart.min.js` does not exist for Chart.js v4** — the file is called `chart.umd.js` or `chart.umd.min.js`. Using the wrong filename results in a 404 and ALL charts on the page blank with no visible error.
2. **`type: 'barh'` is not a thing** — the single most common Chart.js mistake. Use `type: 'bar'` + `indexAxis: 'y'`.
3. **Dual-axis + horizontal bars** — `yAxisID` with `indexAxis: 'y'` silently fails. Use a vertical bar chart for dual axes.
4. **mk() function overloading** — if mk() is used for both Chart.js AND DOM element creation, it breaks. Keep them separate.
5. **Script errors cascade** — one bad chart crashes everything below it. If chart 1 of 5 fails, charts 2–5 AND the data table all go blank.
6. **Numbers in DOM builders** — passing a number to a function expecting strings causes a TypeError, crashing silently.

### Data Quality & Accuracy
7. **Flat/identical chart data** — spot-check every chart data array for suspicious uniformity (e.g., `[0.38, 0.38, 0.38, 0.38]`). This is usually caused by rounding, wrong aggregation level, or using a stored ratio instead of computing it. Always verify the actual value range from the database before embedding.
8. **X-axis / dataset length mismatch** — using 24 month labels with 12-item datasets plots both series on the first 12 labels. Use `months12` for YoY charts, `monthsAll` for full-range trends.
9. **Wrong column names in IDA queries** — never assume column names. `OUTSTANDING_BALANCE` might be `CURRENT_BALANCE`, `REGION` might be `CENSUS_REGION`. Always verify against the schema before writing queries.
10. **IDA connector confusion** — multiple IDA connectors may exist connecting to different databases. Always verify which one has the project's tables before querying.

### Theme & Styling
11. **"From my website" almost always means LIGHT theme** — most websites use white backgrounds. Actually look at the page, don't assume dark.
12. **Building all dashboards before showing the index page** — if the theme is wrong, you redo everything. Always show the portal first for approval.
13. **Rainbow chart colors** — never use more than 3–4 colors in a chart. Blue/Teal/Gray (or the theme's Primary/Secondary/Tertiary) handles 95% of cases.
14. **Red and green in chart bars/lines** — ONLY for KPI indicators. Replace with Amber (#F59E0B) for "negative" and Teal (#1A7F64) for "positive" in chart datasets.
15. **Inconsistent topbar across dashboards** — logo text, title format, back link position, and hover behavior must be identical everywhere. The back link must always be on the RIGHT. Logo must always use the short form.
16. **Light gray table headers** — always use dark brand-color headers with white text. Light gray (`#F1F5F9`) headers with muted text (`#5F6B7A`) are the most common styling inconsistency. Never use `text-transform: uppercase` or `letter-spacing` on table headers.
17. **KPI value sizing inconsistency** — KPI values should be 28px across all dashboards. 20px or 26px values on some dashboards while others use 28px is immediately noticeable.

### Dynamic Filters
18. **Filters don't target KPIs/charts** — the most common post-delivery complaint. Root cause: `updateKPIs(filtered)` receives the filtered array but internally loops over the unfiltered global `DATA` array, ignoring the parameter entirely. Every update function must derive ALL values from its `filtered` parameter.
19. **Duplicate filter options** — if filter dropdowns are populated both in HTML and via JS `initFilterOptions()`, you get duplicate "All" entries. Always clear `innerHTML` before populating, or populate only in JS.
20. **Year filter shows no values** — if the data is a snapshot without a year dimension (e.g., DEI data), add cosmetic year options manually in `initFilterOptions()` and document that filtering is cosmetic.
21. **Topbar subtitle always shows "All Years"** — `updateSubtitle()` must read the current filter value and reflect it. Do not hardcode the subtitle text.

### Navigation
22. **Broken back buttons** — `href="#"` and `javascript:history.back()` both fail. Always use `href="index.html"`.
23. **URL parameter passing between static HTML pages** — do NOT try to pass filters via URL parameters (e.g., `?year=2025&quarter=Q3`). This approach is fragile: year/quarter options must match exactly between source and target pages, `getUrlParam()` regex matching silently fails on mismatches, and users find filters stuck on defaults. Use simple `window.open()` buttons instead and let users pick filters on each dashboard.

### Content
24. **Empty dashboards / "light on data"** — every dashboard needs real analytical depth. Include YoY, budget variance, trend data. A dashboard with 2 bar charts and 4 KPI cards is not sufficient. See Dashboard Content Depth Rules for hard minimums.

### Column Names & Derived Metrics
25. **Column name assumptions** — the most common query error. Never assume column names; always verify with `ida_get_knowledge(knowledge_type='schema')`. Common mismatches: `BRAND` not `BRAND_NAME`, `PANEL_SEGMENT` not `BUYER_SEGMENT`, `AMOUNT_PAID` not `SPEND_AMOUNT`, `CENSUS_REGION` not `REGION`. Build a "Common Column Name Mistakes" lookup table early and include it in the project SKILL.md.
26. **Derived metrics when columns don't exist** — when columns like `BASKET_SIZE` or `PURCHASE_FREQUENCY` don't exist in the schema, derive them from available data. For example: average basket size = `AVG(AMOUNT_PAID)` per transaction, purchase frequency = `COUNT(DISTINCT TRANSACTION_DATE)` per household, repeat rate = households with 2+ transactions / total households. Always document derived metric formulas in METRIC_DEFINITIONS.md.
27. **Year/time factor in all visualizations** — never combine multi-year data without a time breakdown. Charts showing single-year data need year labels or CY vs PY comparison. A chart titled "Revenue by Channel" with no year context is ambiguous — always make the time dimension explicit.

### Theme-Specific Issues
28. **KPI delta colors on light themes** — neon green (#7CFF01) and hot pink (#FF3366) designed for dark backgrounds are nearly invisible on light backgrounds. Light themes must use standard green (#059669) and red (#D32F2F) for KPI deltas. Always match delta colors to the theme's background luminance.
29. **Light theme as common preference** — users often prefer light backgrounds (#F3F4F6) with dark borders/headers (#0F172A) over dark themes. When in doubt, default to light. The light theme pattern is: light gray page background, white cards, dark navy topbar, blue accent for interactive elements.

### Presentations (PPTX)
30. **Text overlap in KPI cards** — long values like "$121.81M" overflow small text boxes. Use shorter formats ("$121.8M") and size text boxes for 6+ characters.
31. **Empty YoY fields** — if a comparison isn't available, show "N/A" or omit entirely. Blank "YoY:" labels look broken.
32. **Poor color contrast** — coral text on teal, red on blue, yellow on white are all illegible. Stick to navy/white and navy/ice combinations.
33. **Missing analytical insights** — slides with only numbers and no interpretation are the #1 complaint. Every slide needs 1–2 sentences of "so what" context.
34. **PptxGenJS shadow reuse** — create a fresh shadow object per shape call. Reusing the same object causes rendering artifacts.

### JavaScript Syntax
35. **Extra closing brace in chart config** — a single extra `}` in a Chart.js options block causes a JS syntax error that blanks the ENTIRE page. This is invisible in code review because the brace is buried in nested config objects. Always validate with `node --check` before delivery.
36. **KPI text overflow** — long values like "$52,000-$200,000" or "Backend Engineering" overflow KPI cards. The `fitKpiText()` pattern (dynamic font sizing based on text length) must be included on every dashboard.

### PPTX Pipeline
37. **PptxGenJS color # prefix** — using `"#006AFF"` instead of `"006AFF"` causes colors to render incorrectly or default to black. Strip the `#` from all color values.
38. **react-icons dependency chain** — react-icons requires `react` and `react-dom` as peer dependencies. Install all together: `npm install -g pptxgenjs react react-dom react-icons sharp --prefix ~/.npm-global`
39. **IDA column name mismatches for reports** — when gathering data for PPTX reports, column names often differ from expectations. Common: `REVIEW_CYCLE` vs `CYCLE_ID`, `EXIT_REASON` vs `PRIMARY_REASON`, `RESPONSE_DATE` vs `SUBMITTED_AT`, `COMPLETION_STATUS` vs `STATUS`, `SCORE` vs `SCORE_PCT`, `STAGE` vs `CURRENT_STAGE`. Always verify with `ida_get_knowledge(knowledge_type='schema')` before writing queries.
40. **Reference tables not cached in IDA** — some dimension/lookup tables may not be cached. If `ida_query()` returns no results for a known table, query the fact table directly and derive the needed dimension from it.

### Fact-Table Grain & Data Accuracy
41. **Redundant-grain dimension inflation** — fact tables like `FACT_CUSTOMER_PERFORMANCE` often have a `GOAL_TYPE_KEY` or `BUDGET_TYPE` dimension that replicates each measurement ~10 times with near-duplicate values. Summing without filtering inflates metrics 5–10×. Always run the detection test in Stage 1 Discovery item 11. Save the required filter as a memory.
42. **Missing year labels** — every KPI, chart title, and column header must state the year explicitly. "Net Sales: $27M" is ambiguous; "Net Sales 2024: $27M" is not. Screenshots without context are common — don't assume the reader will see the filter bar.

### Multi-Year Presentation
43. **Multi-year summed KPIs** — never put "Total Revenue 2022-2024: $75.6M" on a KPI card. Users read KPI cards as snapshots; multi-year sums are misleading. Use the Compare Years Toggle Pattern instead.
44. **"All Years" option in year filter** — this is a footgun. It invites users to accidentally view summed multi-year metrics. Remove the "All Years" option; provide Compare Years toggle instead.

### Themes & Visual Consistency
45. **Chart data colors changing with theme** — theme affects chrome only (topbar, KPI accents, section titles). Chart series colors (year palette, status red/green) stay CONSTANT across themes. Users switching themes mid-analysis should see the same data patterns.
46. **Theme propagation on links** — without `theme.js`, the theme resets when the user navigates between dashboards. The link-rewrite handler is non-negotiable for the multi-theme delivery mode.

## Reference Files

Read these as needed during the onboarding flow:

- `references/questionnaire.md` — the full 96-question xFalcon Dashboard Setup Questionnaire
- `references/data_schema_map_template.md` — standard AnalyticsPro dimensional model
- `references/theme_generation_guide.md` — color-theory rules + algorithm for deriving a full palette from 2–3 seed colors (used for "From my website" and "From my brand colors")
- `references/build_rules.md` — expanded technical build rules with code examples
- **Theme Reference Library** (inline in this SKILL.md above) — 10 preset theme palettes mapped to xFalcon roles; read the inline section rather than an external file
- **Runtime Theme Switcher Pattern** (inline in this SKILL.md above) — recipe for `theme.css` + `theme.js` + per-file injections for the multi-theme delivery mode
- **External skills**: `theme-factory` (the source of the 10 palettes), `ida-autoexplore` (for optional Stage 4 insight reports), `ida-analyst` / `ida-validate` / `ida-dashboard` (data analysis personas)

## What Success Looks Like

When the onboarding is complete, the user should have:
- A clear understanding of what dashboards their data supports (feasibility matrix)
- A complete kit folder with all reference docs tailored to their schema
- A working portal page (approved by the user) with correct theme and all dashboard links working
- ALL core dashboards built and populated with real data, deep analysis, and working charts (typically 10–12 dashboards covering executive overview, sales, product, margin, customer, channel, shipments, inventory, trade spend, consumer panel, geographic performance, and optionally a WBR)
- A metrics definitions page (`metrics-definitions.html`) with searchable, categorized definitions of every KPI used across all dashboards — this is a mandatory standard deliverable
- Resource pages: training guide with generator buttons
- Every file passing the Pre-Delivery QA Checklist
- Generator buttons on the training guide that open related dashboard groups with a single click
- Confidence that they can reference dashboards by number and navigate freely between portal and dashboards
- A project-specific SKILL.md so future sessions can pick up where this one left off
- **If multi-theme delivery was selected**: `theme.css` + `theme.js` files in the kit, theme picker on the portal, every dashboard inherits theme choice via URL param
- **If AutoExplore was run**: `autoexplore-dashboard.html` + `autoexplore-memo.html` linked from an Insight Reports section on the portal
