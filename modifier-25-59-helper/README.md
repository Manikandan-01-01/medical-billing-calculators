# Modifier 25 vs 59 Helper

Live page: https://medicalbilling101.com/tools/modifier-25-59-helper/

## What it does

Asks a few questions about a claim and suggests whether modifier 25, 57, 59, XE, XS, XP, XU, an anatomic modifier, or no modifier applies, with the reason from CMS guidance.

## How to use it

Answer each question about what needs the modifier and how the services relate. The tool gives a recommendation and the manual section behind it. Use the example buttons to walk through a worked case.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

There is no data file. The decision tree is in `mod.js`, from the NCCI Policy Manual for Medicare Services, Chapter 1 (2026 edition) and CMS MLN1783722 (Proper Use of Modifiers 59, XE, XP, XS, XU), April 2026.

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `mod.js` | Question tree and recommendations |
| `tool.css` | Tool and page styles, taken from the live page |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
