# MUE Lookup

Live page: https://medicalbilling101.com/tools/mue-lookup/

## What it does

Shows the Medicare Medically Unlikely Edit (practitioner) unit limit for a CPT or HCPCS code, the adjudication indicator, the rationale, and whether the units billed would pass.

## How to use it

Enter the code and the units billed. The tool reads the Q4 2026 practitioner MUE table and reports the MUE value, the MAI, and a pass or over-limit result.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

Data: `data/mue-pract-2026q4.txt` is the CMS Practitioner Services MUE table effective October 1, 2026 (Q4 2026). Source page: https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits. `data/code-descriptors.txt` is the CMS CY 2026 RVU26D short-descriptor file (same contents as the global period tool) and includes CPT wording that remains AMA copyrighted. CMS also publishes confidential MUEs that are not in this public table.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `mue.js` | Lookup and unit check |
| `tool.css` | Tool and page styles, taken from the live page |
| `data/mue-pract-2026q4.txt` | CMS practitioner MUE table, effective October 1, 2026 |
| `data/code-descriptors.txt` | Short descriptors from CMS RVU26D, used only to label the code |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
