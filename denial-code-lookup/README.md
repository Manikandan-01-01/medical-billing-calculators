# Denial Code Lookup

Live page: https://medicalbilling101.com/denial-codes/

## What it does

A searchable table of common CARC and RARC denial codes, with the official X12 description, a plain-English gloss, a category, and a link to the guide on Medical Billing 101 when one exists.

## How to use it

Type a code or a keyword, or filter by category or group code. The table is bundled, so this tool works fully offline.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

The table was copied from the live hub at https://medicalbilling101.com/denial-codes/ in November 2026 (260 rows). Official descriptions are taken verbatim from the X12 CARC and RARC lists; usage notes are omitted. X12 holds the copyright on those official descriptions. This table is a convenience copy, not a substitute for the current lists at https://x12.org/codes/claim-adjustment-reason-codes and https://x12.org/codes/remittance-advice-remark-codes. The live hub is the version to check for new guides.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page, including the lookup table |
| `denial-lookup.js` | Search and category / group filters |
| `denial-lookup.css` | Filter and table layout |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
