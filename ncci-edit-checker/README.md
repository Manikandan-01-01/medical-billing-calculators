# NCCI Edit Checker

Live page: https://medicalbilling101.com/tools/ncci-edit-checker/

## What it does

Checks a pair of CPT or HCPCS codes against the Medicare NCCI procedure-to-procedure (practitioner) edits and reports whether an edit exists, the modifier indicator, and the PTP rationale.

## How to use it

Enter two codes and press check. The tool loads only the shard that could contain that pair. A result of “no edit” does not guarantee payment.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

Data: 40 shards in `data/mbx-ncci-ptp-pract-v323r0-*.txt`, built from the CMS practitioner PTP edit files version 32.3 revision 0, effective October 1, 2026 (Q4 2026). Source page: https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-procedure-procedure-ptp-edits. `data/code-descriptors.txt` is the CMS CY 2026 RVU26D short-descriptor file and includes CPT wording that remains AMA copyrighted. Hospital/outpatient PTP edits are not in this file.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `ptp.js` | Shard picker and edit lookup |
| `tool.css` | Tool and page styles, taken from the live page |
| `data/mbx-ncci-ptp-pract-v323r0-00.txt … 39.txt` | CMS practitioner PTP edit shards, v32.3 r0 |
| `data/code-descriptors.txt` | Short descriptors from CMS RVU26D, used only to label the codes |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
