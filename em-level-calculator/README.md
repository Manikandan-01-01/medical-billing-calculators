# E/M Level Calculator

Live page: https://medicalbilling101.com/tools/em-level-calculator/

## What it does

Picks the office or other outpatient E/M code for 99202–99205 and 99211–99215 from medical decision making, or from total time. It also shows the prolonged-service add-on codes and the Medicare G2211 rule.

## How to use it

Choose new or established patient. Set the problems, data and risk levels to get the MDM level, or enter total time on the date of the visit. Press “Find the E/M level.” The result shows the code each method supports.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

There is no data file. The rules are in `em.js`, from the AMA CPT E/M guidelines (office or other outpatient services, including the 2021 and 2023 revisions and the time thresholds in effect since 2024) and CMS MLN006764 (May 2026). CPT® is a trademark of the American Medical Association.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `em.js` | Calculator logic |
| `tool.css` | Tool and page styles, taken from the live page |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
