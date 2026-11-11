# Appeal Letter Generator

Live page: https://medicalbilling101.com/tools/appeal-letter-generator/

## What it does

Builds an editable appeal letter from a CARC denial code, the payer and plan type, and the claim details you enter. You can copy the letter, download a .docx, or print it. Nothing is sent or saved.

## How to use it

Pick the denial code, add the payer and claim identifiers, tick the arguments that are true, and review the suggested enclosures. Replace every [bracketed] placeholder before you send the letter. Use “Fill with sample data” on the page if you only want to see the format.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

Denial-code names, argument categories and enclosure lists are in `appeal-data.js` (more than 50 CARCs). Official X12 Claim Adjustment Reason Code descriptions are used with attribution; see the root LICENSE. The letter writer in `appeal-docx.js` builds a .docx in the browser and has no network dependency.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `appeal-generator.js` | Form, letter preview, copy / print / reset |
| `appeal-data.js` | CARC list, arguments and enclosures |
| `appeal-docx.js` | In-browser .docx writer |
| `appeal-generator.css` | Tool styles, including print styles for the letter only |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
