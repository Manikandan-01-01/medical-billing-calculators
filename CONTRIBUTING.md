# Contributing

Fixes to the calculators and updates to the bundled data are welcome. A change can only be accepted if someone else can check it.

## Code fixes

- Keep the tools running in the browser with no build step and no WordPress dependency.
- Do not add analytics, ads, tracking, API keys or server-side secrets.
- If a tool loads a data file, keep the path relative and document it in that tool's README.
- Match the existing factual tone. Do not add marketing copy.

Open a pull request that explains the bug or the rule you are fixing, and quote the official source when the change is about a billing rule.

## Data updates

CMS posts new files on a schedule:

| Data | Typical CMS schedule | Tool |
|---|---|---|
| Physician Fee Schedule Relative Value File (RVUyyA, then quarterly B/C/D) | Late December / early January, then quarterly | RVU Calculator, Global Period Calculator (and the shared descriptor file) |
| NCCI practitioner PTP edits | January 1, April 1, July 1, October 1 | NCCI Edit Checker |
| Practitioner MUE table | Same quarterly dates | MUE Lookup |

When you update a table:

1. Download the official CMS file from the URL in that tool's README.
2. Rebuild the tab-separated file in the same format the JavaScript already reads. Do not change column order without updating the script.
3. Update the version, effective date and "Updated" line in the page and in the README.
4. Name the official source and the date you checked it in the pull request.

Do not paste values from memory, from a blog, or from an unofficial lookup site.

X12 CARC and RARC wording should be copied verbatim from the current X12 lists. Do not rewrite an official description.

## NPI lookup

The NPI tool has no bundled data. Changes should keep using the public NPPES API (version 2.1) or document a new official endpoint. Do not add a proxy that requires a private key or a WordPress login.

## How to submit

Open a pull request against this repository. If you cannot open a pull request, open an issue with the same information.
