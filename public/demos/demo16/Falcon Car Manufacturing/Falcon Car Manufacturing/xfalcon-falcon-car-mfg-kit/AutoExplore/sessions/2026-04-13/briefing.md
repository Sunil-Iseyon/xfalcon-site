# AutoExplore Briefing — Electric Vehicle Strategy
**Session:** 2026-04-13 | **Iterations:** 20 | **Findings:** 10 | **Fact-Check:** CLEAN (1 critical error caught and corrected)

---

## Top Findings (ranked by surprise x importance)

### 1. EQS is the #1 Revenue Model ($10.55B)
The Mercedes EQS generates more gross revenue potential than any other model in the portfolio — $10.55B from just 101K units, thanks to its $104,400 MSRP. This single EV outperforms all ICE models including the BMW X5 ($6.14B) and Mercedes E-Class ($5.52B).

### 2. Electrified = 41.2% of Revenue from 35.7% of Units
6 electrified model-variants generate $31.79B (41.2%) of the $77.16B total portfolio revenue while producing only 35.7% of units. The 27% MSRP premium ($48,739 vs $38,241) drives this outsized revenue contribution.

### 3. Electrified Share is DECLINING
After peaking at 39.8% in 2022, electrified production share fell to 33.5% in 2024. Pure EV production dropped 31% (48K to 33K units). This is counter to global EV adoption trends and suggests no active ramp-up strategy.

### 4. Zero EV After-Sales Data
All 195 warranty claims, 888 service jobs are PETROL-only. No defect records for ELECTRIC or PHEV models. This is the single biggest data gap blocking an EV strategy based on internal evidence.

### 5. HYBRID Escape Rate is 2x PETROL
12.0% of hybrid defects escape all inspection stages vs 6.5% for PETROL. DESIGN root cause is overrepresented (24%). All hybrid defects belong to the Camry Hybrid.

---

## What I Didn't Get To Explore

- **Supplier quality by engine type** — Do EV-specific suppliers have different quality profiles?
- **Seasonal production patterns** — Is EV production more seasonal than ICE?
- **Plant-level OEE differences for EV models** — Do certain plants produce EVs more efficiently?
- **Workforce specialization** — Are EV production lines staffed differently?
- **Cost modeling** — What would revenue look like if EV production share reached 50%?

## Key Correction from Fact-Check
The MODEL_NAME join was double-counting 3 models (3 Series, Camry, Civic) that have both ICE and electrified variants. All numbers were re-derived with a MODEL_NAME + VARIANT join. Electrified revenue dropped from $39.53B to $31.79B; the revenue share actually increased from 40.5% to 41.2%.
