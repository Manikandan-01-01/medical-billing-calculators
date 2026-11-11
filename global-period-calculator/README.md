# Global Period Calculator

Live page: https://medicalbilling101.com/tools/global-period-calculator/

## What it does

Shows the Medicare global surgery days for a CPT or HCPCS code and the date the global period ends, plus the modifiers used to bill related services separately.

## How to use it

Enter the surgical procedure code and the date of surgery. The result shows the indicator meaning, the pre-op day (for 090), the last post-op day, days left, and the 54/55/56 split.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

Data file: `data/global-days-cy2026-rvu26d.txt` (tab-separated). Source: the GLOB DAYS field and pre/intra/post-op percentages in CMS CY 2026 PFS Relative Value File RVU26D, released 08/26/2026. Rules text follows CMS Claims Processing Manual, Chapter 12, §40 and MLN907166 (Global Surgery Booklet, December 2025). Short descriptors include CPT wording that remains AMA copyrighted (see the root LICENSE).

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `glob.js` | Lookup and date math |
| `tool.css` | Tool and page styles, taken from the live page |
| `data/global-days-cy2026-rvu26d.txt` | CMS CY 2026 global days table (the NCCI and MUE tools also ship a copy of this file as code-descriptors.txt) |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
