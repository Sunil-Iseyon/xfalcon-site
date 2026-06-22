# AutoExplore Journal — Falcon Consumer

**Theme:** Channel × Geography × Loyalty
**Iterations:** 32 of 40 budget
**Queries executed:** 32
**Sources:** V_CURRENT_CUSTOMER (1,200 rows) · FACT_CUSTOMER_PERFORMANCE (GOAL_TYPE_KEY=5) · FACT_ORDER_TRANSACTION (12,540 orders) · FACT_SALES_TRANSACTION (16,680 txns) · DIM_LOCATION (20 stores) · DIM_HOUSEHOLD (600 HHs) · DIM_BUSINESS_UNIT (7 BUs)

## Hypotheses tested

| # | Hypothesis | Outcome |
|---|---|---|
| H1 | Loyalty penetration & LTV differ by preferred channel | **Confirmed** — WEB highest loyalty (61.9%), MOBILE highest loyalty LTV lift |
| H2 | Preferred = Dominant channel for most customers | **Confirmed** — 79–86% stickiness, OMNI highest |
| H3 | PLCC + Loyalty + Channel interaction | **Surprising** — 100% of PLCC holders are loyalty; PLCC holders have LOWER LTV than loyalty-only |
| H4 | Income & distance differ by channel preference | **Partially confirmed** — OMNI income highest ($119.5K); distance invariant (~5mi all channels) |
| H5 | Loyalty penetration varies by state | **Confirmed** — CO 67%, IL 50%, big swings |
| H6 | Loyalty by gender | **Surprising** — Males have HIGHER loyalty penetration (62.7%) than females (57.8%) |
| H7 | State × channel preference | **Confirmed** — MA skews WEB, MN skews STORE |
| H8 | Distance to store shapes channel preference | **Surprising** — 96% of customers live within 10 miles; highest-LTV proximate customers prefer digital not store |
| H9 | State × Home-BU yields outlier pockets | **MAJOR FINDING** — CO-Bijou 90% loyalty $33K LTV |
| H10 | Email capture × loyalty × PLCC | **Null** — 100% email capture; no differentiation |
| H11 | Employee customers over-index on loyalty | **Confirmed** — 73% vs 59% baseline; 18% higher LTV |
| H12 | Store footprint by region | **Confirmed** — West 6 stores, Midwest/South 2 each |
| H13 | Loyalty premium by age | **MAJOR** — Loyalty positive only in 35-44 band (+$1,757). Negative everywhere else. |
| H14 | Stores per state vs customers per state | **Discovery** — NJ has 1 store, 0 NJ-resident customers |
| H15 | Fraud/Deceased prevalence | **Null** — both flags 0% populated (data gap) |
| H16 | 2024 store × BU × locality | **Confirmed** — urban dominates, suburban next, rural smallest |
| H17 | Household income × loyalty × LTV | **MAJOR** — U-shaped: +16% <$30K, -13% mid-income, +19% $200K+ |
| H18 | HH size × children × loyalty | **Surprising** — 5-person no-children non-loyal = highest LTV cohort ($21,175) |
| H19 | Loyalty enrollment year distribution | **Modest** — 2023 peak (196), otherwise flat |
| H20 | First-transaction cohort size | **MAJOR** — 97.5% of customers acquired in 2020-2021; acquisition cliff |
| H21 | SMS consent × loyalty × LTV | **Null** — no differentiation |
| H22 | Home BU × dominant shopping channel | **Confirmed** — Urban Thread OMNI $20.5K (premium), Outlet STORE $13.8K (discount) |
| H23 | Extreme state × BU LTV pockets | **Confirmed** — CO-Bijou top, MN-Outlet bottom |
| H24 | First/last transaction cohort matrix | **Confirmed** — 2020→2024 active cohort is most valuable |
| H25 | BU × loyalty LTV lift | **MAJOR** — Positive in 3 of 7 BUs only; Outlet +11.9%, Maison Luxe -9.7%, SoleStep -12.5% |
| H26 | Marketing channel × source repurchase rate | **Confirmed** — EMAIL×WEB 2.10 orders/cust, 25% > runner-up |
| H27 | Locality × marketing channel | **Null** — uniform mix across urban/suburban/rural |
| H28 | First webstore predictor | **Data gap** — FIRST_WEBSTORE all NULL |
| H29 | NJ outlet confirmation | **Confirmed** — 871 txns 2022-24, 0 NJ residents |
| H30 | VIP rev-per-period vs other types | **Surprising** — VIP per-period spend NOT higher than RETURNING/NEW |
| H31 | Tenure in days × loyalty | **Inconclusive** — query failed |
| H32 | LTV tier × loyalty composition | **MAJOR** — 43% of top-20% LTV customers are NOT enrolled in loyalty |

## Top findings moved to report

1. Loyalty LTV Paradox — works in 3 of 7 BUs
2. Acquisition Cliff — 2.5% of customers post-2021
3. CO × Bijou outlier (+87% LTV, 90% loyalty)
4. NYC Mobile App anomaly (8.3% loyalty)
5. Top-decile loyalty gap (43% unenrolled)
6. Jersey Gardens = 0% local
7. Middle-income loyalty trap
8. PLCC = loyalty subset with penalty
9. Email-on-Web 2× retention
10. Loyalty premium only in 35-44 age band

## Data notes saved to memory

- FACT_CUSTOMER_PERFORMANCE requires GOAL_TYPE_KEY=5 filter (existing)
- FIRST_WEBSTORE is NULL for all rows (tracking gap)
- IS_FRAUD / IS_DECEASED flags are 0% populated (inert flags)
- IS_EMAIL_CAPTURED is TRUE for 100% of rows (not useful as segmenter)

## Saved to deliverables

- `autoexplore-dashboard.html` — interactive evidence charts
- `autoexplore-memo.html` — long-form narrative report
