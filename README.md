# Medical billing calculators

Standalone copies of the free tools on [Medical Billing 101](https://medicalbilling101.com/tools/). Each folder is one tool. Open its `index.html` in a browser. Tools that load a data file (RVU, global period, NCCI, MUE) need to be served over HTTP. The NPI lookup also needs a small local proxy, because the official NPPES API does not allow cross-origin browser calls. From this directory run:

```bash
python3 serve.py
```

Then visit `http://127.0.0.1:8765/`. Opening pages as `file://` URLs will usually block the data files. `serve.py` only forwards NPI searches to `https://npiregistry.cms.hhs.gov/api/` and does not require WordPress or an API key.

Every other tool can run without WordPress and without the live site.

## Tools

| Tool | Folder | Live page |
|---|---|---|
| Appeal Letter Generator | [`appeal-letter-generator/`](appeal-letter-generator/) | [https://medicalbilling101.com/tools/appeal-letter-generator/](https://medicalbilling101.com/tools/appeal-letter-generator/) |
| Timely Filing Deadline Calculator | [`timely-filing-calculator/`](timely-filing-calculator/) | [https://medicalbilling101.com/tools/timely-filing-calculator/](https://medicalbilling101.com/tools/timely-filing-calculator/) |
| Denial Code Lookup | [`denial-code-lookup/`](denial-code-lookup/) | [https://medicalbilling101.com/denial-codes/](https://medicalbilling101.com/denial-codes/) |
| NPI Lookup | [`npi-lookup/`](npi-lookup/) | [https://medicalbilling101.com/tools/npi-lookup/](https://medicalbilling101.com/tools/npi-lookup/) |
| RVU Calculator | [`rvu-calculator/`](rvu-calculator/) | [https://medicalbilling101.com/tools/rvu-calculator/](https://medicalbilling101.com/tools/rvu-calculator/) |
| Global Period Calculator | [`global-period-calculator/`](global-period-calculator/) | [https://medicalbilling101.com/tools/global-period-calculator/](https://medicalbilling101.com/tools/global-period-calculator/) |
| E/M Level Calculator | [`em-level-calculator/`](em-level-calculator/) | [https://medicalbilling101.com/tools/em-level-calculator/](https://medicalbilling101.com/tools/em-level-calculator/) |
| NCCI Edit Checker | [`ncci-edit-checker/`](ncci-edit-checker/) | [https://medicalbilling101.com/tools/ncci-edit-checker/](https://medicalbilling101.com/tools/ncci-edit-checker/) |
| MUE Lookup | [`mue-lookup/`](mue-lookup/) | [https://medicalbilling101.com/tools/mue-lookup/](https://medicalbilling101.com/tools/mue-lookup/) |
| Modifier 25 vs 59 Helper | [`modifier-25-59-helper/`](modifier-25-59-helper/) | [https://medicalbilling101.com/tools/modifier-25-59-helper/](https://medicalbilling101.com/tools/modifier-25-59-helper/) |
| Patient Cost Estimator | [`patient-cost-estimator/`](patient-cost-estimator/) | [https://medicalbilling101.com/tools/patient-cost-estimator/](https://medicalbilling101.com/tools/patient-cost-estimator/) |

Each tool folder has its own README with the data source and year.

## Disclaimer

These tools are general reference information. They are not legal, billing or compliance advice. Filing limits, RVUs, NCCI edits, MUEs, E/M rules and payer policies change. The binding rule for any claim is in the current official CMS or X12 source, the payer contract and the payer's current provider manual. Check the source before you file, appeal or write off a claim. The maintainers accept no liability for claims denied, underpaid or delayed based on these tools.

## License

Code is under the MIT License (see `LICENSE`). Bundled CMS tables are U.S. government works; CPT® short descriptors that appear in those tables remain copyright of the American Medical Association. Official CARC and RARC wording is copyright of X12. See `LICENSE` for the data terms.

## Maintainer

Manikandan J, CPC, CRCR, founder of [Medical Billing 101](https://medicalbilling101.com/). Corrections are welcome as an issue or pull request. See `CONTRIBUTING.md`.
