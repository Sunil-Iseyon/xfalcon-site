# Falcon Semiconductor — Validation Benchmarks

Use these numbers to validate that every dashboard, after filter selection, returns the expected values.

## FY25 — no additional filters

| Metric | Expected | Query |
|---|---|---|
| Total Revenue | $3,708.7M | FACT_SHIPMENTS × DIM_DATE FY25 |
| Total COGS | $1,842.3M | REVENUE − GROSS_MARGIN |
| Gross Margin $ | $1,866.4M | SUM(GROSS_MARGIN) FY25 |
| GM % | 50.33% | SUM(GM) / SUM(REV) FY25 |
| Shipment lines | 247,866 | COUNT(*) FY25 |
| Bookings (excl Sample) | $8,224.5M | SUM(ORDER_VALUE) FY25 |
| Order lines (excl Sample) | 549,848 | COUNT(*) FY25 |
| Avg B:B ratio | 1.077 | AVG(BOOK_TO_BILL_RATIO) FY25 |
| Avg backlog age | 29.0 days | AVG(AVERAGE_AGE_DAYS) FY25 |
| Past-due quantity | 939,073 | SUM(PAST_DUE_QTY) FY25 |

## Revenue by Fiscal Year (FY19 – FY25)

| FY | Revenue ($M) | GM ($M) | GM % |
|---|---|---|---|
| FY19 | 1,543.0 | 776.3 | 50.31 |
| FY20 | 2,158.9 | 1,086.4 | 50.32 |
| FY21 | 2,636.9 | 1,328.3 | 50.37 |
| FY22 | 3,093.3 | 1,555.8 | 50.30 |
| FY23 | 2,993.9 | 1,506.2 | 50.31 |
| FY24 | 3,179.6 | 1,602.3 | 50.39 |
| FY25 | 3,708.7 | 1,866.4 | 50.33 |
| FY26 (partial) | 2,427.2 | 1,221.8 | 50.34 |

## FY25 End-Market Revenue Share (via DIM_CUSTOMER)

| End Market | Revenue ($M) | Share |
|---|---|---|
| Automotive | 1,811.4 | 48.8% |
| Computing & Data Center | 505.4 | 13.6% |
| Industrial | 453.5 | 12.2% |
| Consumer | 317.3 | 8.6% |
| Communications | 271.9 | 7.3% |
| IoT & Smart Home | 188.8 | 5.1% |
| Military & Aerospace | 120.7 | 3.3% |
| Medical | 39.7 | 1.1% |

## FY25 Channel Mix

| Channel | Revenue ($M) | Share | GM % |
|---|---|---|---|
| DISTI (8 named) | 1,692.5 | 45.6% | 50.29 |
| DIRECT | 1,278.1 | 34.5% | 50.36 |
| OEM | 550.8 | 14.9% | 50.35 |
| ONLINE | 187.3 | 5.1% | 50.33 |

## B:B Ratio Trend (industry cycle signature)

| FY | Avg B:B | Interpretation |
|---|---|---|
| FY19 | 1.023 | Steady |
| FY20 | 1.020 | Steady |
| FY21 | 1.204 | Expansion (shortage) |
| FY22 | 1.178 | Peak demand |
| FY23 | 0.941 | Correction |
| FY24 | 0.981 | Early recovery |
| FY25 | 1.077 | Recovery confirmed |

## Red-Flag Spot Checks

If any of these return wildly different numbers than above, something is wrong:

1. **B:B ratio > 1.5** → likely computing from ORDER_VALUE / REVENUE instead of BOOK_TO_BILL_RATIO
2. **GM % varies by channel by more than ±2 pts** → unlikely; verify unit_cost vs unit_price logic
3. **Automotive share < 40% of FY25 revenue** → filter issue (are samples excluded but shouldn't be on shipments? Or wrong join to DIM_CUSTOMER?)
4. **Total revenue FY25 < $3.5B or > $4.0B** → filter or join problem
