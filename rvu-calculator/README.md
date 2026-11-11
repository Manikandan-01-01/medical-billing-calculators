# RVU Calculator

Live page: https://medicalbilling101.com/tools/rvu-calculator/

## What it does

Shows the 2026 Medicare relative value units and an estimated payment for a CPT or HCPCS code on the physician fee schedule, by locality and facility or non-facility setting.

## How to use it

Enter a CPT or HCPCS code, choose the Medicare locality and the setting, and (if needed) a 26 or TC modifier. The tool applies the official CMS formula and the 2026 conversion factors.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

Data file: `data/rvu-data-cy2026-rvu26d.txt` (tab-separated). Source: CMS Calendar Year 2026 Physician Fee Schedule Relative Value File, version RVU26D, released 08/26/2026 (`PPRRVU2026_Oct_nonQPP.csv`, `PPRRVU2026_Oct_QPP.csv`, `GPCI2026.csv`). Conversion factors in the file header are $33.4009 (non-qualifying APM) and $33.5675 (qualifying APM). Short descriptors in the file come from the CMS publication and include CPT wording that remains AMA copyrighted (see the root LICENSE). CMS files: https://www.cms.gov/medicare/payment/fee-schedules/physician/pfs-relative-value-files/rvu26d

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `rvu.js` | Lookup, GPCI localities and payment formula |
| `tool.css` | Tool and page styles, taken from the live page |
| `data/rvu-data-cy2026-rvu26d.txt` | CMS CY 2026 PFS RVU26D table used by the tool |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
