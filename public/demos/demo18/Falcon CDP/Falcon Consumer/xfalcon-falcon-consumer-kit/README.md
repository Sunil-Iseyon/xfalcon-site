# xFalcon AnalyticsPro Kit - Falcon Consumer

**Project**: Falcon Consumer | **Version**: 1.0 | **Date**: April 15, 2024

---

## Kit Contents

This folder contains the complete AnalyticsPro kit for the Falcon Consumer project. All files are production-ready and comprehensive.

### Files (8 documents, 4,552 lines of content)

| File | Size | Purpose |
|------|------|---------|
| **DASHBOARD_FEASIBILITY.md** | 17 KB | Scorecard for all 11 dashboards (95%, 90%, 85% readiness); build effort estimates; data gaps; recommendations |
| **DATA_SCHEMA_MAP.md** | 27 KB | Complete dimensional model mapping: 3 fact tables, 6 dimension tables, 2 bridge tables, 2 views; all columns, join paths, SCD2 logic |
| **RETAILEDGE_THEME.md** | 19 KB | Nielsen-inspired light theme: complete color palette (#F3F4F6 page, #FFFFFF cards, #00AEFF primary); CSS variables; typography; component styles; accessibility specs |
| **METRIC_DEFINITIONS.md** | 38 KB | All 29 KPIs: formulas (SQL + English), units, required filters, source tables, which dashboards use each metric |
| **GLOBAL_FILTERS.md** | 19 KB | Filter dimensions (time, BU, channel, customer type, loyalty, segments); "no exclusions" policy documented; recommended filter combinations |
| **QUERY_TEMPLATES.sql** | 30 KB | 30+ SQL starter queries organized by dashboard; all 11 dashboards covered; pre-optimized for <200 row results, <5 sec runtime |
| **SETUP_GUIDE.md** | 22 KB | Step-by-step setup: prerequisites, data validation, schema verification, theme installation, dashboard development workflow, testing, deployment checklist, troubleshooting |
| **SKILL.md** | 16 KB | Project-specific build skill: common column mistakes, join notes, fiscal year derivation, complete theme spec, checklist, data points for testing, troubleshooting tree |

---

## Quick Start (30–45 minutes)

1. **Read This First**: DASHBOARD_FEASIBILITY.md (executive summary + prioritization)
2. **Validate Data**: Run schema validation queries from SETUP_GUIDE.md
3. **Load Theme**: Copy CSS variables from RETAILEDGE_THEME.md
4. **Test SQL**: Execute first 3 query templates from QUERY_TEMPLATES.sql
5. **Start Building**: Begin with Dashboard 1 (Executive Overview) — lowest effort, highest impact

---

## Project Context

**Business Units**: 7 (Maison Luxe, Urban Thread, SoleStep, Bijou, LuxeStyle Online, LuxeStyle Mobile, LuxeStyle Outlet)

**Revenue (FY2024)**: $270.9M (7.3% YoY growth)

**Customers**: 1,380 active (714 loyalty members, 60% penetration)

**Data**: 2022–2024 (3 years); 46,100 total transaction rows (16.8K aggregated KPI rows)

**Fiscal Year**: Feb–Jan (Retail 4-5-4 calendar)

**Currency**: USD

**Key Tables**:
- FACT_CUSTOMER_PERFORMANCE (16,800) — Pre-aggregated KPIs by BU × goal × period × customer type
- FACT_ORDER_TRANSACTION (12,540) — Order headers with channel, marketing channel
- FACT_SALES_TRANSACTION (16,680) — POS transactions with locality & distance
- DIM_CUSTOMER (1,380, SCD2) — Customer master with loyalty, PLCC, segments, lifetime metrics
- DIM_HOUSEHOLD (600) — Household data: size, children, income
- DIM_PRODUCT (90) — Product hierarchy: category, brand, luxury flag
- DIM_LOCATION (20) — Stores with region, channel
- DIM_BUSINESS_UNIT (7) — Brand/BU master
- DIM_DATE (1,096) — Calendar + fiscal
- Bridge/Config: DIM_GOAL_TYPE (10), DIM_CUSTOMER_STRATEGY (84), BRIDGE_CUSTOMER_EMAIL (1,441)

**IDA Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb`

---

## Dashboard Roadmap

**Phase 1 (Priority) — 2–3 weeks**:
1. Executive Overview ⭐⭐⭐ (2–3 days)
2. Brand Performance ⭐⭐⭐ (2–3 days)
3. Sales & Revenue ⭐⭐⭐ (3–4 days)
4. Customer Lifecycle ⭐⭐⭐ (3–4 days)

**Phase 2 (Secondary) — 3–4 weeks**:
5. Channel Mix (3–4 days)
6. Marketing Attribution (3–4 days)
7. Loyalty & Retention (4–5 days)

**Phase 3 (Advanced) — 2–3 weeks**:
8. Geographic Performance (4–5 days)
9. Customer Segmentation (3–4 days)
10. Household Analysis (3–4 days)
11. Product Category ⚠️ (8–10 days + data ETL) — **ESCALATE**: requires product SKU-level sales fact

**Total Effort**: 41–49 days (6–8 weeks for team of 2–3)

---

## Data Governance

**No Exclusions Applied** (user requirement):
- IS_EMPLOYEE records are included (not filtered)
- IS_FRAUD records are included (not filtered)
- IS_DECEASED records are included (not filtered)

Optional filtering available for specific use cases; transparency is key.

---

## Theme Summary

**RETAILEDGE** (Nielsen-inspired LIGHT):
- Page BG: #F3F4F6 (light gray)
- Card BG: #FFFFFF (white)
- Topbar: #1A1A2E (deep navy)
- Primary Accent: #00AEFF (cyan)
- Secondary Accent: #1A7F64 (teal)
- Positive: #059669 (green)
- Negative: #D32F2F (red)
- Neutral: #94A3B8 (gray)
- Text Primary: #1E293B (dark slate)
- Text Secondary: #64748B (medium gray)
- Font: Inter (system fallback)
- WCAG 2.1 AA compliant (all contrast ratios ≥4.8:1)

---

## Common Column Mistakes to Avoid

| Wrong | Correct | Table |
|-------|---------|-------|
| CUSTOMER_ID | CUSTOMER_KEY | All facts & DIM_CUSTOMER |
| DATE | PERIOD_DATE_KEY / ORDER_DATE_KEY | See DATA_SCHEMA_MAP.md |
| SALES | NET_SALES | FACT_CUSTOMER_PERFORMANCE only |
| ORDERS | NET_ORDERS | FACT_CUSTOMER_PERFORMANCE (pre-agg) |
| BU | BUSINESS_UNIT_KEY / BUSINESS_UNIT_NAME | DIM_BUSINESS_UNIT |
| SUM(CUSTOMER_COUNT) | Use pre-agg; do not COUNT DISTINCT | FACT_CUSTOMER_PERFORMANCE |

See SKILL.md for complete reference.

---

## Key Formulas (Samples)

**Total Revenue** = `SUM(NET_SALES)` from FACT_CUSTOMER_PERFORMANCE

**Avg Order Value** = `SUM(NET_SALES) / SUM(NET_ORDERS)`

**Loyalty Rate** = `COUNT(where IS_LOYALTY_MEMBER=TRUE) / COUNT(*) * 100`

**YoY Growth %** = `(FY2024_revenue - FY2023_revenue) / FY2023_revenue * 100`

See METRIC_DEFINITIONS.md for all 29 KPIs and their formulas.

---

## Setup Steps

1. **Validate Connection**: Test IDA connector access (15 min)
2. **Verify Schema**: Run row count checks on all 16 tables (10 min)
3. **Install Theme**: Copy CSS variables to dashboard builder (5 min)
4. **Test SQL**: Execute 3 sample queries from QUERY_TEMPLATES.sql (10 min)
5. **Assign Work**: Distribute Dashboard 1–4 to team members (planning)

See SETUP_GUIDE.md for detailed step-by-step instructions.

---

## File Reference

| When You Need... | Read This File |
|-----------------|----------------|
| High-level dashboard overview | DASHBOARD_FEASIBILITY.md |
| Column names & table structure | DATA_SCHEMA_MAP.md |
| Color codes & CSS | RETAILEDGE_THEME.md |
| KPI formulas | METRIC_DEFINITIONS.md |
| Filter dimensions & policy | GLOBAL_FILTERS.md |
| SQL starter code | QUERY_TEMPLATES.sql |
| Setup & deployment | SETUP_GUIDE.md |
| Common mistakes & quick ref | SKILL.md |

---

## Support

**Questions?**
- Analytics Team: analytics@company.com
- Slack: #falcon-consumer-analytics
- Office Hours: Tuesdays 2 PM

**Escalation**:
- Data issues → Data Engineering
- Performance issues → Data Platform
- Business logic → CFO/Finance (for revenue metrics)

---

## Project Status

- **Kickoff**: April 15, 2024
- **Phase 1 Target**: May 10, 2024 (4 dashboards)
- **Full Go-Live Target**: June 14, 2024 (11 dashboards)
- **Post-Launch Support**: Q2 2024 onwards

---

**Last Updated**: April 15, 2024 | **Kit Version**: 1.0 | **Status**: Production-Ready

Begin with DASHBOARD_FEASIBILITY.md → read through all 8 files → start Dashboard 1.
