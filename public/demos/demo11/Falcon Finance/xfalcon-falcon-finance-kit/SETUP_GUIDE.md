# Falcon Finance — Setup Guide

## Quick Start (5 Steps)

1. **Open the kit folder** — all files are in `xfalcon-falcon-finance-kit/`
2. **Open `index.html`** — this is the portal page with links to all 10 dashboards
3. **Review the theme** — the portal uses the Bread Financial-inspired dark theme (Deep Navy #1D3557 + Coral #E63946)
4. **Navigate dashboards** — click any dashboard card on the portal to open it; each dashboard has a "← Back to Portal" link
5. **Reference the kit docs** — METRIC_DEFINITIONS.md has all KPI formulas; QUERY_TEMPLATES.sql has starter queries

## Project Overview

| Item | Value |
|------|-------|
| Project Name | Falcon Finance |
| Entity | Apex Financial Group |
| Domain | Consumer Credit & BNPL |
| Database | PostgreSQL (schema: `public`) |
| Data Range | Jan 2019 – Dec 2025 (7 years) |
| Fiscal Year | April – March |
| Tables | 14 (5 Fact + 9 Dimension) |
| Dashboards | 10 + Portal |

## Dashboard Index

| # | Dashboard | File | Status |
|---|-----------|------|--------|
| — | Portal / Index | `index.html` | READY |
| 1 | Executive Overview | `01-executive-overview.html` | READY |
| 2 | Transaction Analytics | `02-transaction-analytics.html` | READY |
| 3 | Portfolio Health | `03-portfolio-health.html` | READY |
| 4 | BNPL Performance | `04-bnpl-performance.html` | READY |
| 5 | Credit Risk & Delinquency | `05-credit-risk.html` | READY |
| 6 | Collections Performance | `06-collections.html` | READY |
| 7 | Partner Performance | `07-partner-performance.html` | READY |
| 8 | Customer Intelligence | `08-customer-intelligence.html` | READY |
| 9 | Product Mix Analysis | `09-product-mix.html` | READY |
| 10 | Geographic Analysis | `10-geographic-analysis.html` | READY |

## Kit Files

| File | Purpose |
|------|---------|
| `DASHBOARD_FEASIBILITY.md` | Feasibility scores and data support assessment for each dashboard |
| `DATA_SCHEMA_MAP.md` | Complete table/column mapping with join patterns and notes |
| `RETAILEDGE_THEME.md` | Color palette, CSS variables, gradients, logo spec |
| `METRIC_DEFINITIONS.md` | Authoritative KPI formulas and business rules |
| `GLOBAL_FILTERS.md` | Filter dimensions, exclusion rules, fiscal calendar |
| `QUERY_TEMPLATES.sql` | Starter SQL queries for every dashboard |
| `SETUP_GUIDE.md` | This file |
| `SKILL.md` | Project-specific skill for future sessions |

## Key Technical Notes

1. **Schema prefix:** Always use `public.TABLE_NAME` in queries. The IDA default `fpublic.` is incorrect.
2. **Fiscal year:** April–March. Derive with: `CASE WHEN CALENDAR_MONTH >= 4 THEN CALENDAR_YEAR ELSE CALENDAR_YEAR - 1 END`
3. **Chart colors:** Blue (#006AFF) for actuals, Teal (#1A7F64) for comparisons, Gray (#94A3B8) for baselines. Red/green only in KPI text.
4. **Delinquency bucket join:** `DELINQUENCY_BUCKET_KEY = BUCKET_KEY` (column names differ)
5. **Transaction amounts:** Positive for purchases/advances, negative for payments/returns

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Query returns "relation does not exist" | Add `public.` prefix to table name |
| Charts are blank | Check browser console for JS errors; verify Chart.js CDN loaded |
| Wrong fiscal year numbers | Apply the fiscal year CASE expression above |
| BNPL double-counting | FACT_BNPL_ORDERS is separate from FACT_TRANSACTIONS; don't combine |
| Delinquency bucket join fails | Use `DELINQUENCY_BUCKET_KEY = BUCKET_KEY` (not same column name) |
