# Timely Filing Deadline Calculator

Live page: https://medicalbilling101.com/tools/timely-filing-calculator/

## What it does

Works out the exact deadline and days left for an initial claim, a corrected claim or an appeal, from a date of service or a denial date. Medicare 12-month and 120-day rules are built in. You can download an .ics calendar reminder.

## How to use it

Choose a rule (Medicare presets follow CMS rules; other presets are examples and should be replaced with the limit in your contract). Pick the deadline type, enter the start date and the limit, and read the result. Green means more than 30 days left, amber means under 30, red means the deadline has passed.

Open `index.html` in a browser. Tools that load a data file need to be served over HTTP (for example `python3 -m http.server` from the repo root), not opened as a `file://` URL.

## Data

There is no data file. Medicare claim and appeal math follows 42 CFR 424.44 and 42 CFR 405 Subpart I, and CMS Claims Processing Manual Chapter 1. Commercial and Medicaid examples are not official payer limits. A fuller payer-by-payer table is in the companion dataset at https://github.com/Manikandan-01-01/us-timely-filing-limits (private until published).

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `tfl-calculator.js` | Date math, presets and .ics download |
| `tfl-calculator.css` | Calculator styles |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
