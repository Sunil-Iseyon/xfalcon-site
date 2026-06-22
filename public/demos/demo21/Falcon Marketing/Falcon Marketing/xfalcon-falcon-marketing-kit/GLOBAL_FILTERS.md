# Falcon Marketing — Global Filters & Exclusions

Per the project interview: **no hardcoded global exclusions**. Every dashboard surfaces all clients (active and inactive), all campaign statuses, and all employees (billable and non-billable).

## Hardcoded WHERE clauses — none

The kit deliberately omits exclusions for this demo. If exclusions are needed later (e.g., excluding cancelled campaigns from spend pacing), add them per-dashboard rather than globally.

## Interactive filter dimensions

The standard filter bar across most dashboards:

| Filter | Source dimension | Default | Notes |
|--------|------------------|---------|-------|
| Year | DIM_DATE.YEAR_NUM | 2024 | Single-year selector. "Compare Years" toggle replaces this for multi-year views. |
| Compare Years (toggle) | n/a | OFF | When ON, year selector greys; charts overlay 2022 / 2023 / 2024 |
| Client | DIM_CLIENT.CLIENT_NAME | All | Multi-select on Client Portfolio + Project Margin |
| Account Tier | DIM_CLIENT.ACCOUNT_TIER | All | Platinum / Gold / Silver / Bronze |
| Region | DIM_GEOGRAPHY.REGION | All | Northeast / Midwest / South / West / National |
| Channel category | DIM_CHANNEL.CHANNEL_CATEGORY | All | Digital / Print / Physical |
| Department | DIM_EMPLOYEE.DEPARTMENT | All | On Employee Utilization only |

Each dashboard chooses 3–4 filters relevant to its content (not all of these on every page).

## Conditional rules

| Rule | Where it applies |
|------|------------------|
| When Year filter = "Compare Years ON", year selector becomes inactive and KPIs render as 3-row stacks | Every multi-year dashboard |
| Detail tables stay single-year (latest selected) even when Compare Years is on | Every multi-year dashboard |
| Margin %, Frequency, CPM are non-additive — never SUM() them | Wherever these appear |

## Reporting period subtitle

Every dashboard's subtitle reflects the active filter:

```javascript
function updateSubtitle() {
  var yr = document.getElementById('filterYear').value;
  document.getElementById('reporting-period').textContent =
    yr === 'All' ? 'Reporting Period: All Years (2018–2024)'
                 : 'Reporting Period: Jan–Dec ' + yr;
}
```

## Data quality notes

- All amounts are USD — no FX conversion needed.
- 2024 data ends 2024-12-27 — December is essentially complete but trailing days may be slightly understated.
- One client churned in 2022 (only 19 active out of 20 in 2022–2024). YoY client counts in those years drop from 20 → 19.
- DIM_DATE FISCAL_YEAR == YEAR_NUM (Jan-Dec fiscal); use either column.
