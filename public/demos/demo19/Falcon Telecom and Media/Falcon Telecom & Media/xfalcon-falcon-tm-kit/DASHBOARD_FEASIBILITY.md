# Falcon Telecom & Media — Dashboard Feasibility Matrix

**Generated**: 2026-04-24
**Data range**: 2018-01-01 → 2026-04-17 (8.3 years, ~4.7M fact rows)
**Connector**: `mcp__0f5a7fbd-d3a0-4d09-80d5-e325ec2e51bb__ida_*`
**Audience**: Falcon sales + prospect-company executives + capability demo (mixed)

## Scoring Legend

| Score | Status | Meaning |
|---|---|---|
| 90–100% | READY | All core KPIs available, minimal workarounds |
| 50–89% | PARTIAL | Core metrics available, some gaps or estimations |
| 20–49% | LIMITED | Major data missing, reduced-scope only |
| 0–19% | BLOCKED | Cannot build — critical data absent |

## Dashboard Catalog (11 dashboards)

| # | Dashboard | Score | Status | Effort |
|---|---|---|---|---|
| 0 | **Portal (index.html)** | 100% | READY | 0.5 day |
| 1 | Executive Overview | 95% | READY | 1.0 day |
| 2 | Subscriber Performance | 95% | READY | 0.75 day |
| 3 | Billing & Revenue | 95% | READY | 0.75 day |
| 4 | Plan & Carrier Mix | 95% | READY | 0.75 day |
| 5 | Advertising Revenue | 95% | READY | 0.75 day |
| 6 | Streaming Viewership | 95% | READY | 0.75 day |
| 7 | Content Rights & Licensing | 90% | READY | 0.5 day |
| 8 | Live Events & Tickets | 95% | READY | 0.75 day |
| 9 | Geographic Performance | 90% | READY | 0.75 day |
| 10 | Subscriber 360 (Cross-Domain) | 90% | READY | 1.0 day |
| 11 | Churn Analysis Deep Dive | 95% | READY | 0.75 day |
| Reference | metrics-definitions.html | 100% | READY | 0.5 day |

**Total estimated effort**: ~9 days for a careful build.

---

## 1. Executive Overview — READY (95%)

**Primary sources**: All 6 fact tables (cross-domain summary)
**Headline year**: 2025

**What works completely:**
- Total billed revenue 2025: $13.57M, up 5.6% vs 2024 ($12.86M)
- Net subscriber adds (acquisitions − churn) by year — rising acquisition trend
- Total ad revenue 2025: $1.72B, up 4.6% vs 2024 ($1.65B)
- Streaming sessions 2025: 186K, up 5.6% vs 2024 (176K)
- Ticket sales 2025: $80.0M, up 7.6% vs 2024 ($74.3M)
- Content rights deals 2025: 8,894 deals at $49.1B in license fees

**KPI cards (all single-year 2025)**: Billed Revenue, Active Subs, Net Adds, Churn Rate, Ad Revenue, CPM, Streaming Sessions, Ticket Revenue, License Fees, ARPU.

**Charts**: 6-domain revenue mix (stacked bar), monthly revenue trend, top 5 carriers, top 5 ad-tier industries, top 5 platforms by sessions, top event types.

**Sample query:** see `QUERY_TEMPLATES.sql` § Executive.

---

## 2. Subscriber Performance — READY (95%)

**Primary source**: FACT_SUBSCRIBER_EVENTS (1.4M rows, 8 event types) + DIM_SUBSCRIBER, DIM_CARRIER, DIM_PLAN.

**What works completely:**
- 8 event types with annual/monthly grain: New Activation, Plan Upgrade/Downgrade/Change, Churn, Port-In, Port-Out, Reactivation
- 2025 acquisitions: 92,821 (61,852 new + 20,719 port-in + 10,250 reactivation)
- 2025 churn: 41,375 (24,798 churn + 16,577 port-out)
- MRR per event, est. LTV, churn reasons (8 categories — Price 31% of churn)
- Demographic breakdowns: segment (Consumer/Family/Business/Prepaid), age band, credit score band

**Workaround**: Active subscriber count uses DIM_SUBSCRIBER.IS_ACTIVE=TRUE (snapshot) — for historical "as-of-month" active counts, derive from `cumulative acquisitions − cumulative churn`.

---

## 3. Billing & Revenue — READY (95%)

**Primary source**: FACT_BILLING (1.0M rows, monthly grain) + DIM_PLAN, DIM_CARRIER, DIM_GEOGRAPHY.

**What works completely:**
- Monthly billed revenue with full component breakdown: base, overage, roaming, equipment, taxes
- 2025 billed revenue: $13.57M (12 components × 12 months)
- ARPU, autopay rate (~65% all years), late-pay rate (~6%), disputed rate (~2%)
- Revenue by carrier (Charter $17.6M lifetime > Verizon $15.5M > Comcast $15.2M)
- Revenue by plan type (Postpaid 5G $21.8M, Enterprise Fiber $16.1M, Bundle $10.0M)

**Note on disputed bills**: 2% of rows. Per Global Filters, headline revenue includes Paid + Paid Late + Disputed; only Defaulted is excluded.

---

## 4. Plan & Carrier Mix — READY (95%)

**Primary source**: DIM_PLAN (28 plans) + FACT_BILLING + DIM_CARRIER.

**What works completely:**
- 5G plans drive 47% of total billing revenue ($35.9M of $76.4M)
- Postpaid 5G is largest single category at $21.8M (28% of revenue)
- Enterprise plans (Fiber + 5G) command highest ARPU: $108–$151
- Plan-mix shifts: 4G LTE share declining as 5G adoption grows
- Unlimited vs capped split: 91% of revenue from unlimited plans

---

## 5. Advertising Revenue — READY (95%)

**Primary source**: FACT_AD_REVENUE (600K placements) + DIM_ADVERTISER, DIM_AD_FORMAT, DIM_MEDIA_COMPANY, DIM_MEDIA_PLATFORM.

**What works completely:**
- 2025 gross revenue: $1.72B; net (after 15% agency fee): $1.46B
- Top advertisers: Amazon $776M, Apple $767M, P&G $486M, Geico $480M, Chase $479M
- Format mix: Sponsorship Integration $2.24B (45 CPM), Sports Live $1.61B (32 CPM), Podcast $1.40B (28 CPM)
- Channel mix: Streaming, Sports Broadcast, Audio, Broadcast TV, CTV, Digital, Social
- Avg viewability ~75%, avg completion ~70% — both stable across 8 years

---

## 6. Streaming Viewership — READY (95%)

**Primary source**: FACT_VIEWERSHIP (1.3M sessions) + DIM_CONTENT, DIM_MEDIA_PLATFORM, DIM_GEOGRAPHY.

**What works completely:**
- 2025: 186K sessions, 9.34M total view-minutes, 54.7% avg completion
- 12 platforms ~109K sessions each (uniform — Pareto on content, not platform)
- Genre mix from DIM_CONTENT (20 genres; Drama leads at 20%)
- Device split: Smart TV 38%, Mobile 28%, Tablet, Desktop, Console, Streaming Stick
- Quality tiers: 4K HDR through SD; rebuffer events (avg 1.5/session)
- Binge rate (>120 min): ~7.8% of sessions
- Revenue model: SVOD 50% / AVOD 25% / TVOD / Hybrid

---

## 7. Content Rights & Licensing — READY (90%)

**Primary source**: FACT_CONTENT_RIGHTS (75K deals) + DIM_CONTENT, DIM_MEDIA_COMPANY, DIM_MEDIA_PLATFORM.

**What works completely:**
- 2025: 8,894 deals at $49.1B in license fees ($5.5M avg)
- 10 rights types × 4 exclusivity levels = 40 cells (all populated, fairly evenly)
- Top licensors: CNN $20.3B, TKO Group-WWE $20.2B, MTV $20.0B, Match Group $19.96B
- Avg revenue share 15%, avg term 3.0 years, minimum guarantee 40% of license fee

**Minor caveat (90% vs 95%):** TERRITORY column has 9 territory types but isn't joined to DIM_GEOGRAPHY (different grain) — territory analysis uses the column directly.

---

## 8. Live Events & Tickets — READY (95%)

**Primary source**: FACT_TICKET_SALES (350K txns) + DIM_EVENT, DIM_TICKET_TIER, DIM_GEOGRAPHY.

**What works completely:**
- 2025: $80.0M ticket revenue, 130K ticket transactions
- Top event types: Concert $14.8M, UFC Fight Night $9.9M, WWE SmackDown $9.2M, WWE Raw $8.0M, Festival $7.8M
- Tier mix: Meet & Greet $190.9M lifetime (4 oz of total), Floor/Ringside $119.7M, VIP Suite $71.8M
- VIP segment is 65% of revenue from 25% of ticket count
- Channel split: Online Primary 42%, Mobile App 28%, Box Office, Resale, Group Sales
- Dynamic pricing markup avg 5%, std dev 12%; resale carries premium

---

## 9. Geographic Performance — READY (90%)

**Primary source**: DIM_GEOGRAPHY (30 DMAs, 4 regions, 50 states) joined to all 5 GEO-tagged fact tables.

**What works completely:**
- 4-region cross-domain view: Northeast leads in billing ($28.3M), West close behind ($27.8M)
- 30 DMAs ranked: New York #1 in billing ($21.7M), LA #2 ($10.3M), Chicago #3 ($7.1M)
- Tier classification: Tier1 (top 5 metros) vs Tier2 vs Tier3
- Regional ad revenue, ticket revenue, viewership all available

**Minor caveat (90% vs 95%):** No state-level filtering on the Subscriber Events fact (uses GEO_KEY/DMA only) — state aggregation requires join through DIM_GEOGRAPHY.

---

## 10. Subscriber 360 (Cross-Domain) — READY (90%)

**Primary source**: SUBSCRIBER_KEY join across FACT_BILLING, FACT_VIEWERSHIP, FACT_TICKET_SALES.

**What works completely:**
- 5 segments × 5 age bands × 4 credit tiers cross-domain view
- Consumer segment (35K subs) drives 42% of billing rev, 41% of streaming sessions, 39% of ticket txns
- Family segment (25K subs) over-indexes on streaming (binge-friendly households)
- Business Small (13K subs) under-indexes on tickets, over-indexes on Enterprise plans
- Prepaid (9K subs) lowest cross-domain engagement (transactional billing only)

**Minor caveat (90% vs 95%):** No subscriber-level event sequence (e.g., "billed in March → watched in April → bought ticket in May") — would require event-time joins which are query-expensive. Aggregated cross-domain views work fine.

---

## 11. Churn Analysis Deep Dive — READY (95%)

**Primary source**: FACT_SUBSCRIBER_EVENTS filtered to IS_CHURN=TRUE + DIM_SUBSCRIBER, DIM_PLAN, DIM_CARRIER.

**What works completely:**
- 8 churn reasons with near-equal share — Price (15.4%) leads, then Competitor Offer (14.0%), Financial (14.0%)
- Avg LTV lost per churn: $3,883
- 2025 churn count: 24,798 (up 7% vs 2024) — rising trend; correlate with carrier, plan, segment, tenure
- Churn rate proxy: churn events ÷ active subs
- Win-back trend via Reactivation events (10,250 in 2025)

---

## Files in this kit

- `DASHBOARD_FEASIBILITY.md` — this file
- `DATA_SCHEMA_MAP.md` — table/column mapping
- `SPECTRUM_THEME.md` — default brand identity (Spectrum-derived)
- `METRIC_DEFINITIONS.md` — every KPI with SQL formula
- `GLOBAL_FILTERS.md` — exclusions and filter rules
- `QUERY_TEMPLATES.sql` — starter SQL for every dashboard
- `SETUP_GUIDE.md` — how to use the kit
- `SKILL.md` — project-specific build skill for future sessions
- `theme.css` / `theme.js` — runtime theme switcher (Spectrum light + Tech dark)
- `index.html` — portal (built first, then dashboards)
- `metrics-definitions.html` — interactive metric reference
- `01-executive-overview.html` through `11-churn-analysis.html` — dashboards
