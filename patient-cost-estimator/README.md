# Patient Cost Estimator

Live page: https://medicalbilling101.com/tools/patient-cost-estimator/

## What it does

Shows what the patient owes and what the plan pays for one service, from the allowed amount, deductible left, coinsurance or copay, and out-of-pocket maximum left.

## How to use it

Enter the allowed amount and the patient’s remaining deductible, coinsurance or copay, and out-of-pocket maximum. Optional Medicare and Marketplace presets fill 2026 figures you can then edit. Press calculate to see each step of the math.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

There is no data file. The Medicare Part B deductible preset and the explanatory text use the CMS 2026 Medicare Parts A & B premiums and deductibles fact sheet and the HealthCare.gov glossary (allowed amount, deductible, coinsurance, copayment, out-of-pocket maximum, balance billing). Confirm current-year amounts before you quote a patient.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `pce.js` | Cost math and presets |
| `tool.css` | Tool and page styles, taken from the live page |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
