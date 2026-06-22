# Setup Guide
## Falcon Telecom xFalcon AnalyticsPro Kit

Complete implementation guide for deploying the 11-dashboard analytics suite for Falcon Telecom. Covers database connectivity, dashboard builds, and operational readiness.

---

## Quick Start (5 Steps)

### Step 1: Connect IDA Data Source
**Time:** 5 minutes

1. Open xFalcon AnalyticsPro portal
2. Navigate to **Settings > Data Sources**
3. Click **Add New Data Source**
4. Select **IDA (Integrated Data Architecture)** connector
5. Enter connection details:
   - **Host:** `ida-falcon-telecom.internal` (or your IDA endpoint)
   - **Database:** `falcon_telecom_analytics`
   - **Port:** 5432 (PostgreSQL default)
   - **Auth:** Service account credentials
6. Click **Test Connection** → should show "Connection successful"
7. Click **Save & Index Schema**

**Expected Result:** Schema auto-discovery completes in 2-3 minutes, showing:
- 11 dimension tables (DIM_DATE, DIM_SUBSCRIBER, etc.)
- 4 fact tables (FACT_BILLING, FACT_USAGE, FACT_LIFECYCLE_EVENTS, FACT_ROAMING_USAGE)
- ~5.2M total fact rows

---

### Step 2: Verify Data Freshness
**Time:** 2 minutes

1. Go to **Settings > Data Quality**
2. Check last refresh timestamp (should be today or within 24 hours)
3. Verify row counts match expected volumes:
   - FACT_BILLING: 943K rows
   - FACT_USAGE: 895K rows
   - FACT_LIFECYCLE_EVENTS: 195K rows
   - FACT_ROAMING_USAGE: 150K rows
4. If counts are significantly different, contact data engineering

---

### Step 3: Import Theme Configuration
**Time:** 3 minutes

1. Download `FALCON_TELECOM_THEME.md` from this kit
2. Go to **Dashboards > Theme Settings**
3. Click **Import Custom Theme**
4. Paste the CSS variables from theme file:
   ```css
   --color-accent: #E20074;
   --color-base: #F3F4F6;
   --color-topbar: #1D1D2C;
   --color-card: #FFFFFF;
   --color-secondary: #1A7F64;
   ```
5. Click **Preview** and confirm colors render correctly
6. Click **Save & Apply**

**Verification:** Dashboard cards and charts should use magenta accent, light gray backgrounds, dark navy topbar.

---

### Step 4: Configure Global Filters
**Time:** 5 minutes

1. Go to **Dashboards > Global Filter Settings**
2. Click **Create New Filter Group**
3. Add filters in order:
   - **Calendar Year:** 2019-2025 (default: 2025)
   - **Region:** North, South, East, West, Central (default: all)
   - **Customer Segment:** Mass Market, Mid Market, Premium, Corporate (default: all)
   - **Plan Category:** Prepaid, Postpaid, Corporate (default: all)
4. Save filter group as **"Falcon Telecom Standard"**
5. Set as **default for all dashboards**

**Result:** All 11 dashboards now share filters. Changing region automatically updates all charts.

---

### Step 5: Build First Dashboard (Executive Overview)
**Time:** 15-20 minutes

1. Go to **Dashboards > Create New**
2. Select **Template: Telecom Executive Summary**
3. Name it **"Executive Overview - Falcon Telecom"**
4. Configure data source: **IDA - Falcon Telecom**
5. Add KPI cards:
   - Revenue (₹ Cr) with delta vs prior month
   - ARPU (₹/subscriber) with delta
   - Active Subscribers with delta
   - Churn Rate (%) with delta
6. Add charts:
   - Revenue trend (line chart, last 24 months)
   - Regional performance heatmap
   - Customer segment breakdown (pie chart)
7. Apply global filters
8. Click **Publish**

**Validation:** Dashboard loads in <3 seconds. All KPIs show current data. Charts respond to filter changes.

---

## Detailed Setup

### Database Connection

#### IDA Connector Configuration

**Connection String:**
```
postgresql://service_account@ida-falcon-telecom.internal:5432/falcon_telecom_analytics
```

**Required Permissions:**
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO falcon_analytics;
GRANT USAGE ON SCHEMA public TO falcon_analytics;
```

**Connection Pooling:**
- Min connections: 2
- Max connections: 10
- Idle timeout: 300 seconds

**Network Requirements:**
- Firewall rule: Allow outbound TCP 5432 to IDA endpoint
- SSL/TLS: Recommended (use connection string: `sslmode=require`)

#### Schema Discovery

After connecting:
1. IDA auto-discovers schema
2. Detects 11 tables, 89 columns, 87 relationships
3. Creates metadata in xFalcon cache
4. Indexes for performance optimization

**Expected discovery output:**
```
Scanning falcon_telecom_analytics...
Found 11 tables:
  ✓ DIM_DATE (2,556 rows)
  ✓ DIM_SUBSCRIBER (80,000 rows)
  ✓ DIM_GEOGRAPHY (66 rows)
  ✓ DIM_PLAN (20 rows)
  ✓ DIM_DEVICE (66 rows)
  ✓ DIM_TOWER (280 rows)
  ✓ DIM_ROAMING_PARTNER (12 rows)
  ✓ FACT_BILLING (943,000 rows)
  ✓ FACT_USAGE (895,000 rows)
  ✓ FACT_LIFECYCLE_EVENTS (195,000 rows)
  ✓ FACT_ROAMING_USAGE (150,000 rows)

Relationships detected: 87
Primary keys: 11 tables
Foreign keys: 54 relationships

Schema ready for analytics.
```

---

### Dashboard Build Checklist

Complete this checklist for each of the 11 dashboards (or use the provided SQL templates).

#### Dashboard Template Structure
```
Dashboard Name
├── KPI Row (4 cards)
│   ├── Primary Metric (large)
│   ├── Secondary Metric
│   ├── Tertiary Metric
│   └── Status Indicator
├── Trend Chart (full width)
├── Breakdown Chart (3-column grid)
├── Detail Table (drill-down)
└── Filters (global)
```

#### Build Checklist (per dashboard)
- [ ] Create dashboard container with theme
- [ ] Add global filters (auto-linked)
- [ ] Design KPI cards (4 primary metrics)
- [ ] Build trend chart (6-24 month history)
- [ ] Add breakdown charts (by region/segment/plan)
- [ ] Include detail table (top 10 rows)
- [ ] Test all filters (region, segment, year, plan)
- [ ] Validate data accuracy (compare with SQL)
- [ ] Performance test (load time <3 seconds)
- [ ] Screenshot for documentation
- [ ] Publish to dashboard library

#### Dashboard Build Order (recommended)
1. **Executive Overview** - Foundation for all other dashboards
2. **Revenue & ARPU Analysis** - Core financial metrics
3. **Subscriber Lifecycle** - Event-based analysis
4. **Churn Analysis** - Critical business metric
5. **Network Quality** - Operations focus
6. **5G Adoption** - Strategic initiative
7. **Billing & Payments** - Finance operations
8. **Roaming Analysis** - International revenue
9. **Regional Performance** - Geographic drill-down
10. **Customer Segments** - Segmentation analysis
11. **Device Analytics** - Hardware trends

#### Estimated Build Time
- **Simple dashboards** (1 chart, 3 KPIs): 1 hour each
- **Standard dashboards** (3 charts, 4 KPIs, 1 table): 2 hours each
- **Complex dashboards** (5+ charts, drill-down, advanced filters): 3 hours each

**Total estimated time:** 20-25 hours (1 developer, 1-2 weeks)

---

### SQL Query Templates

Ready-to-use queries for each dashboard. Copy and paste into dashboard data source configuration.

#### Executive Overview - Revenue KPI
```sql
SELECT 
  SUM(fb.TOTAL_INVOICE) as revenue_inr,
  COUNT(DISTINCT fb.SUBSCRIBER_KEY) as active_subscribers,
  ROUND(SUM(fb.TOTAL_INVOICE) / COUNT(DISTINCT fb.SUBSCRIBER_KEY), 2) as arpu
FROM FACT_BILLING fb
JOIN DIM_DATE d ON fb.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_DATE >= DATE_TRUNC('month', CURDATE())
  AND d.CALENDAR_DATE < DATE_TRUNC('month', CURDATE()) + INTERVAL 1 MONTH;
```

#### Revenue Trend (24 months)
```sql
SELECT 
  DATE_TRUNC('month', d.CALENDAR_DATE) as month,
  SUM(fb.TOTAL_INVOICE) as revenue,
  SUM(fb.DATA_OVERAGE_CHARGE) as overage,
  SUM(fb.ROAMING_CHARGE) as roaming
FROM FACT_BILLING fb
JOIN DIM_DATE d ON fb.DATE_KEY = d.DATE_KEY
WHERE d.CALENDAR_DATE >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
GROUP BY DATE_TRUNC('month', d.CALENDAR_DATE)
ORDER BY month DESC;
```

#### Churn by Region
```sql
SELECT 
  dg.REGION,
  COUNT(fle.SUBSCRIBER_KEY) as churned_count,
  ROUND(100.0 * COUNT(fle.SUBSCRIBER_KEY) / 
    (SELECT COUNT(*) FROM DIM_SUBSCRIBER WHERE IS_ACTIVE = TRUE), 2) as churn_pct
FROM FACT_LIFECYCLE_EVENTS fle
JOIN DIM_SUBSCRIBER ds ON fle.SUBSCRIBER_KEY = ds.SUBSCRIBER_KEY
JOIN DIM_GEOGRAPHY dg ON ds.GEOGRAPHY_KEY = dg.GEOGRAPHY_KEY
WHERE fle.EVENT_TYPE = 'CHURN'
  AND MONTH(fle.EVENT_DATE) = MONTH(CURDATE())
GROUP BY dg.REGION
ORDER BY churned_count DESC;
```

#### 5G Adoption
```sql
SELECT 
  dg.REGION,
  COUNT(DISTINCT CASE WHEN dd.NETWORK_CAPABLE >= 5 THEN ds.SUBSCRIBER_KEY END) as 5g_subs,
  COUNT(DISTINCT ds.SUBSCRIBER_KEY) as total_subs,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN dd.NETWORK_CAPABLE >= 5 THEN ds.SUBSCRIBER_KEY END) / 
    COUNT(DISTINCT ds.SUBSCRIBER_KEY), 2) as adoption_pct
FROM DIM_SUBSCRIBER ds
LEFT JOIN DIM_DEVICE dd ON ds.DEVICE_KEY = dd.DEVICE_KEY
LEFT JOIN DIM_GEOGRAPHY dg ON ds.GEOGRAPHY_KEY = dg.GEOGRAPHY_KEY
WHERE ds.IS_ACTIVE = TRUE
GROUP BY dg.REGION
ORDER BY adoption_pct DESC;
```

All queries are parameterized to work with global filters. Replace WHERE clauses with filter values dynamically.

---

## IDA Connector Details

### What is IDA?
**IDA (Integrated Data Architecture)** is Falcon Telecom's centralized analytics data warehouse. It consolidates:
- Billing transactions (FACT_BILLING)
- Network usage (FACT_USAGE)
- Subscriber lifecycle events (FACT_LIFECYCLE_EVENTS)
- Roaming activity (FACT_ROAMING_USAGE)
- Master data (dimensions)

Data is refreshed daily at 02:00 IST (midnight UTC+5:30).

### Connection in xFalcon
1. **Data Source Type:** PostgreSQL (via IDA connector)
2. **Authentication:** Service account (not user credentials)
3. **Query Language:** Standard SQL (queries below)
4. **Caching:** 5-minute TTL for KPI queries

### Schema Prefix
**No prefix needed.** Tables are queried directly:
```sql
SELECT * FROM FACT_BILLING;  -- Correct
SELECT * FROM public.FACT_BILLING;  -- Also works
SELECT * FROM falcon_telecom_analytics.FACT_BILLING;  -- Full path works
```

---

## Troubleshooting

### Issue: "Connection Timeout"
**Symptom:** Cannot connect to IDA endpoint

**Diagnosis:**
```bash
# Test network connectivity
ping ida-falcon-telecom.internal

# Test port 5432
telnet ida-falcon-telecom.internal 5432

# Check credentials
psql -h ida-falcon-telecom.internal -U falcon_analytics -d falcon_telecom_analytics
```

**Solution:**
1. Verify VPN/firewall allows outbound TCP 5432
2. Check service account credentials haven't expired
3. Restart xFalcon container: `docker restart xfalcon-app`
4. Contact data engineering if endpoint is down

---

### Issue: "Schema Discovery Failed"
**Symptom:** Tables not appearing after connection test

**Diagnosis:**
1. Verify permissions on IDA:
```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'public';
```

2. Check user has SELECT on tables:
```sql
SELECT grantee, privilege_type 
FROM INFORMATION_SCHEMA.ROLE_TABLE_GRANTS 
WHERE table_name = 'FACT_BILLING';
```

**Solution:**
1. Grant proper permissions:
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO falcon_analytics;
```

2. Refresh schema discovery:
   - Settings > Data Sources > Select IDA > Refresh Schema
   - Wait 2-3 minutes

---

### Issue: "Queries Return No Data"
**Symptom:** KPI cards and charts are blank

**Diagnosis:**
1. Check date range filter is correct:
```sql
-- Should return rows
SELECT COUNT(*) FROM FACT_BILLING 
WHERE DATE_KEY >= 20250101;
```

2. Verify subscriber join:
```sql
-- Check subscriber key exists
SELECT COUNT(*) FROM DIM_SUBSCRIBER WHERE SUBSCRIBER_KEY IN (
  SELECT DISTINCT SUBSCRIBER_KEY FROM FACT_BILLING LIMIT 1000
);
```

**Solution:**
1. Adjust date filters to recent data (2025)
2. Check global filters aren't too restrictive
3. Reset filters to defaults and retest
4. Review SQL query for syntax errors

---

### Issue: "Dashboard Loads Slowly"
**Symptom:** Charts take >5 seconds to render

**Diagnosis:**
1. Check query execution time:
   - Settings > Query Performance > Select dashboard query
   - Review execution plan

2. Monitor database load:
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Solution:**
1. Optimize queries:
   - Add date range filters (not just year)
   - Use pre-aggregated tables if available
   - Limit result set with TOP 10,000

2. Scale IDA:
   - Contact data engineering for query tuning
   - Consider read replicas for heavy queries

3. Increase cache TTL:
   - Settings > Data Source > Cache TTL: 15 minutes (up from 5)

---

### Issue: "Filter Changes Don't Update Dashboard"
**Symptom:** Selecting region doesn't update charts

**Diagnosis:**
1. Check browser console for JavaScript errors:
   - F12 > Console tab
   - Look for red error messages

2. Verify filter values are valid:
```sql
SELECT DISTINCT REGION FROM DIM_GEOGRAPHY;
-- Should return: North, South, East, West, Central
```

**Solution:**
1. Clear browser cache:
   - Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear all data

2. Reload dashboard:
   - Close and reopen browser tab
   - Try incognito/private mode

3. Check filter configuration:
   - Settings > Global Filters
   - Verify filter values match database values exactly (case-sensitive)

---

### Issue: "Missing Data for Recent Months"
**Symptom:** Dashboard shows data through February, not current month

**Diagnosis:**
1. Check IDA refresh schedule:
   - Settings > Data Quality
   - Last refresh timestamp

2. Verify current data exists in IDA:
```sql
SELECT MAX(CALENDAR_DATE) FROM DIM_DATE;
SELECT MAX(EVENT_DATE) FROM FACT_LIFECYCLE_EVENTS;
```

**Solution:**
1. Wait for nightly refresh (02:00 IST)
2. Manually trigger refresh:
   - Settings > Data Sources > Select IDA > Refresh Now
3. Contact data engineering if data is consistently late

---

## Performance Optimization

### Query Optimization Checklist
- [ ] Filter by fiscal/calendar year (reduces scan by 85%)
- [ ] Filter by region/geography (reduces scan by 60%)
- [ ] Limit result set (TOP 10,000 instead of all rows)
- [ ] Use aggregated columns (ARPU) instead of calculations
- [ ] Avoid SELECT * (specify columns needed)
- [ ] Pre-calculate KPIs in materialized views (if available)

### Dashboard Performance Targets
- KPI cards: <1 second load
- Trend charts: <2 seconds load
- Detail tables: <3 seconds load
- Filter application: <500 ms response

### Monitoring
Monitor dashboard performance in Settings > Dashboards > Performance:
- Query execution time
- Data transfer size
- Cache hit rate
- Peak load times

---

## Operational Runbook

### Daily Tasks
1. **Check data freshness** (09:00 IST)
   - Verify IDA refresh completed (look for timestamp > 02:00 IST)
   - Spot-check KPI values match expected ranges
2. **Monitor dashboard usage** (17:00 IST)
   - Review user access logs
   - Track most-viewed dashboards

### Weekly Tasks
1. **Performance review**
   - Check average query times
   - Identify slow queries for optimization
2. **Data quality audit**
   - Verify churn/activation events in DIM_SUBSCRIBER
   - Spot-check sample revenue calculations

### Monthly Tasks
1. **Financial reconciliation**
   - Compare dashboard Revenue to accounting system
   - Verify ARPU and Payment Rate align with finance reports
2. **Hardware/Tower changes**
   - Update DIM_TOWER if new cells deployed
   - Refresh 5G capability flags in DIM_DEVICE

### Quarterly Tasks
1. **Capacity planning**
   - Review row growth in fact tables
   - Plan for archival if approaching storage limits
2. **Security audit**
   - Verify access controls (who has dashboard access)
   - Review service account permissions

---

## User Access & Permissions

### Role-Based Access

**Executive Role:**
- View: All 11 dashboards
- Drill-down: Region, Segment, Year
- Export: Monthly snapshots
- Edit: No (read-only)

**Analyst Role:**
- View: All dashboards + raw data views
- Drill-down: All dimensions
- Export: Custom reports, SQL export
- Edit: Yes (can modify queries)

**Data Admin Role:**
- View: All dashboards + system logs
- Edit: Schema, themes, global filters
- Manage: Data sources, user access, caching
- Delete: Archived dashboards

### Granting Access
```
1. Go to Settings > User Management
2. Click "Add User"
3. Enter email: user@falcontel.in
4. Select role: Executive / Analyst / Data Admin
5. Assign dashboard permissions:
   ☑ Executive Overview
   ☑ Revenue & ARPU Analysis
   ☑ Subscriber Lifecycle
   ... (check all 11)
6. Click "Save"
7. User receives welcome email with login link
```

---

## Deployment Checklist

Before going live:

**Data Layer:**
- [ ] IDA connection successful
- [ ] All 11 tables discovered
- [ ] Row counts verified (see volumes above)
- [ ] Foreign key relationships valid
- [ ] Data refresh working (last refresh < 24 hours ago)

**UI Layer:**
- [ ] Theme imported (colors render correctly)
- [ ] Global filters configured (4 filters, all working)
- [ ] All 11 dashboards created and tested
- [ ] Charts respond to filter changes
- [ ] KPI values match expected ranges

**Performance:**
- [ ] Dashboard load time < 3 seconds
- [ ] Query execution < 2 seconds
- [ ] No timeout errors

**Security:**
- [ ] Service account credentials secured (not in code)
- [ ] User permissions assigned by role
- [ ] Data export restrictions in place (if needed)
- [ ] SSL/TLS enabled for all connections

**Documentation:**
- [ ] User guide published (how to use dashboards)
- [ ] Metric definitions accessible (METRIC_DEFINITIONS.md)
- [ ] Filter guide available (GLOBAL_FILTERS.md)
- [ ] Troubleshooting guide published (this section)

**Training:**
- [ ] Executive training completed (1 hour)
- [ ] Analyst training completed (2 hours)
- [ ] Data admin documentation reviewed

---

## Post-Launch Support

### First Week
- Monitor dashboard usage and error logs
- Collect user feedback
- Fix any critical bugs or data discrepancies

### First Month
- Optimize slow queries
- Tune cache TTL based on actual usage
- Add additional dashboards if required

### Ongoing
- Monthly data quality audits
- Quarterly performance reviews
- Annual capacity planning

---

## Quick Links & Resources

| Resource | Location |
|----------|----------|
| Dashboard Feasibility | DASHBOARD_FEASIBILITY.md |
| Data Schema | DATA_SCHEMA_MAP.md |
| Theme Config | FALCON_TELECOM_THEME.md |
| KPI Definitions | METRIC_DEFINITIONS.md |
| Global Filters | GLOBAL_FILTERS.md |
| IDA Documentation | [IDA Wiki](https://ida-docs.internal) |
| xFalcon Support | support@xfalcon-analytics.io |
| Data Engineering | data-eng@falcontel.in |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 2026 | Initial setup guide for 11 Falcon Telecom dashboards |

**Last Updated:** April 12, 2026  
**Next Review:** April 2027

---

## Contact & Support

**For Technical Issues:**
- Data source problems: data-eng@falcontel.in
- Dashboard UI/UX: analytics-support@falcontel.in
- Performance/tuning: dba@falcontel.in

**For Business Questions:**
- Metric definitions: finance@falcontel.in
- Revenue/ARPU: controller@falcontel.in
- Churn/retention: ceo@falcontel.in

**Escalation Path:**
1. Check troubleshooting guide (this document)
2. Email relevant technical lead
3. If critical: pages @data-eng-oncall in Slack #data-critical-support
4. Critical issue response target: <1 hour
