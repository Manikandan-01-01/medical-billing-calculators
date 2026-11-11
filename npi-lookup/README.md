# NPI Lookup

Live page: https://medicalbilling101.com/tools/npi-lookup/

## What it does

Looks up a National Provider Identifier in the official CMS NPPES NPI Registry, by 10-digit NPI or by name and state. It checks the CMS Luhn check digit before it searches.

## How to use it

Choose NPI number, Individual (Type 1) or Organization (Type 2). A name search needs a state. Press Search. Each card links to the official NPPES record. This copy needs a network connection.

This tool needs a network connection and a same-origin proxy, because the official NPPES API does not allow cross-origin browser calls. From the repo root run `python3 serve.py` and open `http://127.0.0.1:8765/npi-lookup/`. You can also search at https://npiregistry.cms.hhs.gov/.

## Data

There is no bundled registry file. The live site proxies searches through a WordPress REST route (`/wp-json/mbx/v1/npi`) that calls `https://npiregistry.cms.hhs.gov/api/?version=2.1` and trims the reply. This kit maps the official reply into the same card layout. A browser page cannot call NPPES directly (no CORS headers), so `serve.py` at the repo root forwards `GET /api/npi` to `https://npiregistry.cms.hhs.gov/api/?version=2.1`. No API key is used or required. CMS NPPES documentation: https://npiregistry.cms.hhs.gov/api-page

## Files

| File | What it is |
|---|---|
| `index.html` | Standalone page |
| `npi-lookup.js` | Form, Luhn check, NPPES API call and result cards |
| `npi-lookup.css` | Lookup styles from the live theme |

## Disclaimer

This tool is general reference information. It is not legal, billing or compliance advice. Rules and payer policies change. Check the current official source and your payer contract before you file, appeal or write off a claim.

By Manikandan J, CPC, CRCR.
