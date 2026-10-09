# Brain notes — mortgage calculation, regulation, rates (for the Mogi course)

Compiled 2026-10-09 by a research reader from the Confluence "Brain" (space MTG, site first-edea-team.atlassian.net) and Linear issue ENG-223. Read-only; nothing was edited on Confluence or Linear.

Classification tags used on every claim:

- **[D]** Mogi internal decision (date / who when stated)
- **[R]** professional or regulatory fact, with the primary source the page cites
- **[F]** field knowledge (who said it, when)
- **[P]** research / proposal / recommendation, not decided
- **[O]** explicitly open / unknown

Items marked "(reader's note)" are mine, not the page's.

---

## Access log

| Page / item | ID | Result |
|---|---|---|
| The domain rules | 28901456 | Loaded (markdown) |
| Mortgage repayments and affordability follow the agreed calculation rules | 67436545 | Loaded (markdown) |
| Bank of Israel data connections for the mortgage optimizer — Oct 2026 | 67469313 | Loaded (markdown) |
| J-090 · Mix construction and calculator | 7503881 | Loaded (markdown, then HTML — markdown dropped the inline date macros, so the dates were recovered from HTML) |
| J-090 · Choices and costs — mix construction and calculator | 7634954 | Loaded (markdown, then HTML — markdown dropped the "Decisions to make" list and date macros; recovered from HTML) |
| How the regulator says to compare mortgage offers — Aug 2026 | 7733250 | Loaded (markdown) |
| What it costs to leave a mortgage early (קנס היוון) — Aug 2026 | 7798786 | Loaded (markdown) |
| **Followed one level:** The rate and index data feeds — Aug 2026 | 7831553 | Loaded (markdown) |
| **Followed one level:** A mortgage mix carries a term per track, not one term | 16646263 | Loaded (markdown) |
| **Followed one level:** An LLM never performs a financial calculation | 16515075 | Loaded (markdown) |
| Linear ENG-223 (issue + relations) | — | Loaded |
| Linear ENG-223 comments (4) | — | Loaded |
| Version numbers | — | **Not available**: neither getConfluencePage nor CQL `expand=version,history` returned version numbers through this connector. Only "lastModified" strings are shown. |

Notes on the environment: the plugin-scoped MCP servers `plugin:edea-confluence:atlassian` and `plugin:edea-linear:edea-linear` failed to connect (proxy 403), but the top-level `mcp__Atlassian_Rovo__*` and `mcp__Linear__*` tools worked, so nothing was blocked.

"lastModified: yesterday" means 2026-10-08 (today is 2026-10-09).

---

## 1. The domain rules

- **ID** 28901456 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/28901456/The+domain+rules
- **Last modified** 2026-10-08 09:18 · author shown: eden · version: not visible
- **Owner** Eden · **Review by** 2027-01-08
- **Type** Decision-group rules page ("Read this page first. One sentence per current rule in this group, with the date it was settled and the page behind it.")

### Summary (every rule listed on the page)

"Facts about mortgages and safety that the code must respect, whatever the implementation."

1. **[D] 2026-07-29** — The core is deterministic code; a language model may explain, classify, summarise and draft, but it **never computes** a rate, a payment, a cost measure, an early-repayment fee or any other number a customer or a bank relies on. → page 16515075.
2. **[D] 2026-08-13** — The case model assumes **up to four banks in parallel** through the whole journey, with per-bank state, deadline clocks and document packs; how many banks stay alive per file is policy, not model. → page 16875545 (not read).
3. **[D] 2026-08-03** — Each track in a mortgage mix carries **its own term**; no engine code is written against a one-term assumption. → page 16646263.
4. **[D] 2026-08-31** — Every disagreement between a document and what the client said is shown to the advisor with both values; if the chosen figure goes onto a bank's form and contradicts the client's statement, the client is asked before it is submitted, the resolution is recorded in full, and an unresolved disagreement counts as missing for that bank. → page 33718276 (not read).
5. **[D] 2026-08-18** — Clocks that wait for a bank's answer count **banking days from day one, never calendar days**, because **on day 6** they prompt the advisor to ask the bank for the **delay reason the client is entitled to**; not built yet. → pages 22151169 and 8650753 (bank calendar) (not read).
6. **[D] 2026-10-07** — Repayment display, forecast inputs, income recognition and payment-to-income calculations follow **Eylon's 15 agreed answers**, with **actual-offer terms taking precedence over simulation defaults** and **manual prime updates retained**. → page 67436545.

Change log on the page: 2026-09-18 became the group's rules page; 2026-09-25 added the banking-day clocks rule (decided 2026-08-18); 2026-10-08 recorded the repayment/affordability decisions confirmed by Eylon on 7 Oct 2026.

### Useful for course
- LLM never calculates (product principle); per-track term; four banks in parallel; the "day 6 delay reason" banking-day clock (a client right — the regulatory source is not quoted on this page; see 22151169/8650753); document-vs-client-statement conflicts.

---

## 2. Mortgage repayments and affordability follow the agreed calculation rules

- **ID** 67436545 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/67436545/Mortgage+repayments+and+affordability+follow+the+agreed+calculation+rules
- **Last modified** 2026-10-08 23:49 · author shown: eylon ashkenazi · version: not visible
- **Type** **Decision** (topics: product, design, data, regulation)
- **Provenance:** "The answers to Eden's 15 implementation questions… Decisions confirmed by **Eylon on 7 October 2026**; written up on 8 October 2026." **Eden accepted the answers on 8 October 2026. "The implementation is not complete."** Source: Eden's Slack questions, a claude.ai questionnaire artifact, Eylon's answers. Linear: ENG-223, "on hold until Eylon's prototype exists".

### The decision (headline) — [D] Eylon 2026-10-07, accepted by Eden 2026-10-08
"Use a common calculation model grounded in Bank of Israel rules, with the documented terms of each bank offer applied where they differ. Show the monthly payment under current terms, retain the first payment and the projected maximum separately, and preserve the inputs behind every result."

### Q1. Which repayment the customer sees — [D]
- Headline = **"Monthly repayment under current terms"**, computed from each track's amount, rate, term and repayment method. **Spitzer amortization** when that is the method ("principal and interest are spread across scheduled payments, subject to the track's rate and indexation rules"). **Not a lifetime average.**
- Expanded details show:
  - **First monthly repayment** (even when equal to the headline).
  - **Projected maximum monthly repayment**, when the complete forecast can be calculated. **Highlight it when it is at least 10% above the headline.** (10% threshold = Mogi decision.)
- Explain that indexed and variable-rate payments can change; **a projected maximum is a forecast, not a guaranteed ceiling.** For grace and bullet, make the payment after deferral / at maturity explicit.

### Q2. Validation — [D] + [F]
- Compare the engine with bank amortization schedules (examples from **Leumi and Discount**), **Wise** simulations, and real approvals in principle.
- **[F] Eylon confirmed access to a source containing many approvals in principle.** Size, bank coverage and completeness **not yet audited** [O]. Use a varied sample; identifying customer info not needed.
- Match loan inputs, calculation dates and forecast versions before comparing; investigate differences by cause: rounding, payment dates, indexation, forecast vintage, the bank's interest mechanism.
- **[O] No numerical acceptance tolerance was settled.**

### Q3. Which forecasts — [D] + [R]
- Use **the dedicated Bank of Israel forecast inputs published for Directive 451** ("which governs the relevant mortgage cost and disclosure calculations"). [R] Source: BoI official yield page https://www.boi.org.il/roles/statistics/makamandbonds/yield/ which "explicitly identifies the nominal and real model-based yield workbook intended for this purpose".
- **Do not substitute** the Research Department's macroeconomic forecast or a **flat inflation assumption**.
- Retain the source date and version with every calculation. Matching a bank's result also requires its **anchor definition, observation dates, reset dates and calculation conventions**.

### Q4. Variable-rate reset interval — [D]
| Stage | Rule |
|---|---|
| Initial simulation for an approval in principle | Assume a **five-year reset interval** for the relevant periodically variable tracks, **labelled as an assumption**. |
| Actual bank offer or existing loan | Use the reset interval and dates documented in the offer/contract. For an existing loan, **capture the next reset date**. |
- Support researched intervals of **12, 24, 30, 36, 60, 72, 84 and 120 months**; other month-based intervals only where the contractual mechanism is documented and supported.
- "Five years means time between interest resets, not the loan term. It does **not** apply to prime-rate changes or to **monthly CPI indexation**." An indexed payment can change even between reset dates.

### Q5. Total rate vs anchor + spread — [D]
- Show the **total track interest rate** first. For variable tracks also retain **anchor type, its value and determination date, and the contractual spread**. Anchor = reference rate; spread = contractual addition or reduction. Show in expanded details; use for modelling resets.
- For an existing loan use contractual info. **"Subtracting today's anchor from a rate set in the past does not reliably recover the original spread."**

### Q6. Which income counts — [D] + [R]
- Support **salary, dividends, existing rent, and future rent for a second property and above — "as our product scope choice"** (explicitly *not* presented as the full regulatory definition of when future rent may be recognized).
- Keep the **declared amount**, the **amount recognized**, and one of three statuses: **Included / Requires review / Excluded**, with a reason. Recognition depends on net income, continuity, supporting evidence and applicable bank rules.

| Income | Treatment |
|---|---|
| Salary | Current employment income. Ended employment is not ongoing income. A new job before the first salary deposit may be reviewed using a signed employment contract. |
| Dividends | Require evidence and a supported recognition method. Don't count the same company profit and its dividend twice. |
| Existing rent | Documented lease, evidence, recognized amount. |
| Future rent | Applicable evidence for expected rent; account for the borrower's housing expenses. |
| Other recurring (pensions, benefits, maintenance received) | Assess continuity, evidence and bank recognition; not always fully included or always excluded. |

- **"Divide eligible recurring annual net income by 12."** If only gross is supplied, **require the net figure; do not invent a conversion.** Distinguish declared estimates from verified amounts.
- [R] Source cited: Bank of Israel income-recognition clarifications https://www.boi.org.il/media/emunmobp/202601.pdf

### Q7. Commitments that reduce disposable income — [D] + [R]
- Deduct relevant fixed commitments with **more than 18 months remaining** (qualifying loans, contractual leasing commitments, maintenance paid). Don't deduct a payment again if already in the mortgage repayment numerator.
- **Rent paid when the borrower will not live in the purchased property counts even if the lease has less than 18 months remaining.** [R] Directive 329, Appendix A — https://www.boi.org.il/media/hjrlkrse/h2852.pdf
- Missing end date → include conservatively, disclose the assumption that >18 months remain, flag the missing date. A planned early payoff is recognized only after funding and timing are substantiated.

### Q8. Existing mortgage — [D] + [R]
| Position after the transaction | Treatment |
|---|---|
| Repaid as part of the transaction | Exclude the old repayment once the payoff is substantiated. |
| Ported or retained, secured on the **same property** as the new loan | **Add** the existing repayment to the new repayment (numerator) if >18 months remain. |
| Retained on **another property** | **Deduct** from income as a fixed commitment if >18 months remain. |
- "Unchanged" alone is not enough to classify (it may still be on the same property). Partial payoff → account for the remaining portion. Never count the same payment in numerator and denominator.
- [R] **The same-property aggregation amendment took effect on 1 October 2026. Circular 2852 postponed the earlier 1 July date.** Source: https://www.boi.org.il/media/hjrlkrse/h2852.pdf

### Q9. Which repayment goes into the ratio — [D] + [R]
| Structure | Repayment used |
|---|---|
| Ordinary amortizing loan | **Initial repayment on the full approved amount** |
| Grace period | **Repayment after the grace period ends** |
| Bullet or balloon | **Monthly interest amount**, including where actual payment is deferred |
- **No arbitrary rate-shock assumption** in the basic ratio. Show the projected maximum separately. [R] Directive 329, Appendix A.

### Q10. One ratio or per bank — [D]
- One common baseline under BoI rules:
  **Payment-to-income ratio = relevant monthly repayment ÷ recognized disposable monthly income × 100.**
- Disposable income = recognized net income after the commitments that must be deducted. For actual offers, use each offer's own repayment. Bank-specific adjustments only when supported by verified policy/evidence.

### Q11. Grace — [D]
- **Partial grace:** interest paid, principal deferred.
- **Full grace:** principal and interest deferred; accrued interest added to the debt per the loan terms.
- **Default: grace is included in the total loan term** — "a 25-year loan with one year of grace has 24 years remaining afterwards." Apply the actual offer's terms when available. Show both the payment during grace and after.

### Q12. Bullet — [D]
- **Partial bullet:** interest paid during the term, principal at maturity.
- **Full bullet:** no regular payments; principal and accrued interest at maturity per contract.
- Apply indexation where relevant. **Show the maturity payment separately and prominently** beside the monthly repayment.

### Q13. Entitlement and "Other" — [D] + [R]
- Model the standard **entitlement track (זכאות)** as **fixed-rate and CPI-linked**, using the entered rate and term. Consistent with the basic track in Leumi's catalogue (https://www.mortgage.leumi.co.il/all-about-mortgage/category/about/options).
- **Other:** initial repayment only when inputs suffice; **no projected maximum** for it. If any track lacks a forecast, don't label the mix's projected maximum as complete.

### Q14. Missing inputs — [D]
- Don't calculate a track when essential inputs (rate, repayment method) are missing; state exactly what's required.
- Publish a complete aggregate repayment and ratio **only when all tracks can be calculated**. Completed tracks may be shown with an explicit **partial-result** label. Missing forecast-only info does not block a valid current repayment or ratio.

### Q15. Prime updates — [D] + [R]
- Connect to the official BoI service (PublicApi/GetInterest, https://www.boi.org.il/qawebsite/) to retrieve/check the **policy rate**, **while retaining a manual prime-update process**.
- Keep **policy rate, prime rate and customer-specific contractual spread distinct**. Record value, source and effective date of every applied update; apply under the track's terms; preserve the rate basis of saved calculations; **"Fetching a new value must not silently rewrite a saved result."**

### Rejected approaches — [D]
- A lifetime-average repayment headline, or a projected maximum presented as a guaranteed cap.
- Flat inflation assumption or general macro forecast replacing Directive 451 inputs.
- A universal five-year reset after an actual offer provides different terms.
- Blanket recognition of every declared income, or double counting.
- Reconstructing a historical spread from today's anchor; silently applying rate updates to saved calculations.

### Appendix: published reset intervals by bank — [P]/[R] (public-source snapshot, researched 2026-10-07; years between resets; "the specific offer or contract controls")
| Bank | CPI-linked variable | Unindexed variable |
|---|---|---|
| Mizrahi-Tefahot | 2.5, 5, 7, 10 | 2, 5, 7 |
| Leumi | 1, 2, 5 | 2, 3, 5, 7, 10; annual MAKAM-linked reset |
| Hapoalim | 3, 5, 10 | 3, 5, 10 (same guide) |
| Discount | 5 | 5 |
| First International | 1, 2, 3, 5, 10 | 1, 2, 3, 5, 10 |
| Massad | 1, 2, 3, 5, 10 | 1, 2, 3, 5, 10 |
| Mercantile | 1, 2, 3, 5, 6, 10 | 5, 10 |
| Bank of Jerusalem | 1, 2.5, 5 | Annual MAKAM-linked reset; 2.5 and 5 need offer-level verification |
| Yahav | Mortgage service through Mizrahi-Tefahot | Use the specific Mizrahi-Tefahot offer |
| ONE ZERO | No public mortgage catalogue located | No mapping |
| Esh | No public mortgage catalogue located | No mapping |

- "MAKAM is the Bank of Israel's short-term bill instrument. An annual MAKAM anchor is a particular contractual mechanism, not prime."
- **[O] Items needing confirmation:** Leumi's separate 2.5-year page (https://www.mortgage.leumi.co.il/Articles/220); the annual anchor in a Mizrahi table; the 2.5- and 5-year unindexed options in the Bank of Jerusalem calculator. Some supporting documents are older. Cross-check against actual approvals before enabling an option.

### Remaining implementation checks — [O]
Audit the approval sample; settle numerical reconciliation tolerances; verify bank-specific anchor conventions and the flagged product options.

### Useful for course
Repayment ratio (יחס החזר) definition and numerator/denominator rules; Spitzer; grace (partial/full, inside term); bullet (partial/full); entitlement loan = fixed CPI-linked; first payment vs projected max (10% highlight); reset intervals by bank; anchor + spread; prime vs policy rate; income recognition (net, /12, statuses); 18-month commitments rule; same-property rule from 1 Oct 2026; Directive 451 forecast as the only forecast.

---

## 3. Bank of Israel data connections for the mortgage optimizer — Oct 2026

- **ID** 67469313 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/67469313/Bank+of+Israel+data+connections+for+the+mortgage+optimizer+Oct+2026
- **Last modified** 2026-10-08 09:18 · author shown: eylon ashkenazi · version: not visible
- **Type** **Research** (topics: product, data, engineering, regulation, ops). "Research and connection checks completed on 7–8 October 2026; this snapshot was written on 8 October 2026."
- **Status statement:** connection priorities are "**recommendations from the research**" [P]. "In particular, automated policy-rate retrieval does not replace the agreed manual prime-update process." "No production connection, scheduled job or integration test suite was created." Availability observed ≠ uptime guarantee; polling frequencies are engineering recommendations unless attributed to the publisher.

### What responded on 8 Oct 2026 (verified retrieval, not full integration)
Policy-rate API; BR, ZCM and BIR_MRTG_99 statistical collections; the Directive 451 workbook; the per-bank mortgage comparison workbook; both early-repayment-rate files.

### Recommended connection order — [P]
| Source | Use | Recommendation |
|---|---|---|
| Policy rate + history | Current prime calculations, reproducible historical inputs | Connect at the start |
| Dedicated Directive 451 forecast workbook | Projected payments, projected maximum, forecast cost comparisons | Connect at the start |
| Actual CPI | Indexation of existing balances, historical calcs | Connect at the start; CBS is the original publisher |
| Aggregate mortgage rates | Market benchmarks, calibration | Connect early; not an executable offer |
| Per-bank mortgage comparison | Bank-level rates and track mixes | After core inputs |
| Early-repayment reference rates | Exit-cost and refinance calcs | When those features are in scope |
| ZCM curves and inflation expectations | Extra scenarios, independent checks | After the designated forecast source |

### 1. Policy rate — [R] observed data
- Live service: https://www.boi.org.il/PublicApi/GetInterest ; documentation https://www.boi.org.il/qawebsite/ — returns current policy rate and next rate-update date.
- Response on 8 Oct 2026: `{"currentInterest":3.25,"nextInterestDate":"2026-10-21T00:00:00Z","lastPublishedDate":"2026-09-01T16:00:04.647Z"}` — "a dated observation, not a value to hard-code."
- Keep policy rate, prime and contractual spread as distinct fields. Publication metadata does not establish when a loan's contractual rate changes.
- History: BR collection (https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BR/1.0/?format=csv&lastNObservations=2) returned **five series**. Use **`MNT_RIB_BOI_D`** for the policy-rate series after validating metadata; don't substitute other BR rates.
- [P] Check daily and around announced decisions; record source value, retrieval time, intended effective date; retain manual application of prime updates; saved calcs keep their rate version.

### 2. Directive 451 forecast workbook — [R]
- Download: https://www.boi.org.il/boi_files/Statistics/Estimation%20of%20yields%20from%20government%20bonds.xlsx
- The official yield page identifies it as **the forecast input for the expected overall interest calculation under Directive 451**, and supplies methodology and publication schedule.
- Three sheets: **תשואה נומינלית הנגזרת מהמודל** (model nominal yield curve); **תשואה ריאלית הנגזרת מהמודל** (model real yield curve); **התפתחות פער התשואות** (development of the yield gap used in the forecast framework).
- "The workbook supplies inputs to the prescribed calculation; it does not return a customer's final mortgage payment."
- Downloaded 8 Oct; server modification timestamp **5 October 2026**. Includes calendar-month and CPI-period observations; select the row type the calculation needs. Daily polling = retrieval recommendation, not a claim forecasts are daily.
- **Use this workbook for Directive 451.** ZCM is **not** assumed interchangeable. Store workbook version, selected period and row type. Don't substitute the macro forecast or constant inflation.

### 3. Actual CPI — [R] + [O]
- Direct source recommended: **Central Bureau of Statistics (CBS)** (BoI also displays price-index series).
- Request: `https://api.cbs.gov.il/index/data/price?id=120010&format=json&download=false&last=2&coef=true` — **`120010` = general CPI**. CBS API guide documents retrieval, date ranges and **linking coefficients**, which matter when a loan spans a **change in the index's base year**.
- **[O] Verification: direct CBS request failed with a connection reset in this environment on 7–8 Oct.** Unresolved; re-test from deployment environment.
- CPI is **monthly**; polling daily doesn't make it daily. Use the **index level and contractual base-index rules** for indexation; an annual inflation percentage is not a replacement.

### 4. Aggregate mortgage market data: BIR_MRTG_99 — [R] observed
- https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BIR_MRTG_99/1.0/?format=csv&lastNObservations=2 — returned **129 series**: rates, anchors and spreads for certain variable categories, loan volumes, terms, LTV bands, payment-to-income bands.
- Definitions given: LTV = loan amount relative to property value; payment-to-income = qualifying repayment relative to recognized disposable income.
- Not every measure for every dimension combination; LTV/income bands ≠ complete pricing table.
- Mortgage-rate observations through **August 2026** in series inspected; other series ended 2023 or 2024. **Check freshness per series.**
- Use to benchmark; customer pricing comes from approvals and bank responses. Official monthly housing-loan report page: https://www.boi.org.il/roles/statistics/banking/housing_cred/monthly-report-on-housing-loans/

### 5. Per-bank comparison: mortgage section of "קו המשווה" — [R] observed
- Source page: https://www.boi.org.il/information/bank-paymnts/financial-education/campaigns/boi-equator/mortgage/ ; download https://www.boi.org.il/boi_files/Pikuah/TamInt010.xls
- Bank-level comparisons of rates and track composition, including **expected overall interest** where published. "Expected overall interest is an annualized cost measure based on forecast cash flows; it is not the total number of shekels repaid."
- Official announcement (https://www.boi.org.il/publications/pressreleases/a05-07-23/): published **monthly**. File checked 8 Oct: latest reporting month **August 2026**; workbook/server date **15 September 2026**; no fixed publication day established.
- Rates are **annual effective rates, not nominal**; comparison **excludes bullet, balloon and foreign-currency loans**. Preserve the rate convention.
- [P] Check daily for a changed file, ingest validated versions, display reporting month. No dedicated public API established; verified connection = file download.

### 6. Early-repayment reference rates — [R]
- CPI-linked: https://www.boi.org.il/boi_files/Pikuah/pribmash.xls ; unindexed: https://www.boi.org.il/boi_files/Pikuah/mashfix.xls ; explanation & dates: https://www.boi.org.il/information/interestrates/mortgage/
- Both downloaded 8 Oct; server dates **14 September 2026**. Published **monthly with effective dates**. Select linkage, period band, effective date.
- They feed the **interest-difference component** of an early-repayment fee; the full fee also depends on loan terms, repayment date and rules. **Do not replace them with BIR_MRTG_99 averages**; don't promise today's fee estimate as a known exit cost years ahead.

### 7. ZCM — [R] observed, [P] usage
- https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/ZCM/1.0/?format=csv&lastNObservations=2 — **30 series** (market curves, inflation expectations, related). Frequencies differ.
- "A market-implied path is not a probability distribution or a worst-case guarantee." Keep stress scenarios separate from the Directive 451 forecast; don't silently mix with the workbook. Inflation expectations page: https://www.boi.org.il/roles/statistics/inflation-expectations-and-inflation-forecasts/inflation-expectations-and-inflation-forecasts/

### Other material — [R]
- **Directive 329 and amendments** (https://www.boi.org.il/media/hjrlkrse/h2852.pdf): financing limits, payment-to-income, variable-rate share and terms. Not machine-readable; translate into versioned code with effective dates. **Same-property repayment amendment took effect 1 October 2026.**
- Public API docs incl. exchange rates: `PublicApi/GetExchangeRates`, `PublicApi/GetExchangeRate?key=USD` (documented, not smoke-tested) — relevant if foreign-currency tracks are included.
- BoI interest-rate history page; series explorer https://edge.boi.gov.il/?locale=he ; Power BI accessibility guidance (not a data feed).

### Customer data and pricing — [P] + [D reference]
- Public data don't supply a bank's executable price for every track/amount/term/customer; changing a mix may change offered rates. **Record whether a rate is approved, quoted or estimated**, with source and date.
- Eylon's source of many approvals in principle → relevant for validation and (research recommendation) for studying pricing; coverage must be assessed.
- **Open banking remains outside version one** (existing decision page 16908289, not read); this research doesn't change it.

### Recommended ingestion design — [P]
1. Fetch into our own store before optimization; don't call external endpoints per candidate mix.
2. Keep raw response/workbook, source URL, retrieval time, observation period, publication/effective date, units, rate convention, parser version.
3. Validate format, required fields/worksheets, date coverage, non-empty values ("A successful HTTP response is not enough").
4. Evaluate competing mixes against the same validated snapshot; save its version.
5. Distinguish automated collection from application of a rate update; keep manual prime update; label manual overrides.
6. Expose incomplete forecast coverage; missing forecast-only inputs don't block current repayment but must not produce a falsely complete projected maximum.
- Official series guide: https://www.boi.org.il/boi_files/Statistics/edge_guide_he.pdf (pp. 13–16: queries, filters, CSV and SDMX-JSON). SDMX-JSON ≠ GetInterest JSON schema.

### What changed since August — stated by the page
- The five-month mortgage-rate lag seen in August is **not a current universal property**: inspected series and per-bank workbook now reach August 2026; some series older.
- Downloadable per-bank comparison file confirmed (not per-bank API series or customer-level pricing).
- Directive 451 workbook still retrievable.
- CBS API check unsuccessful here; to be completed in deployment env.
- **Same-property amendment uses 1 October effective date in the official June circular; older references to 1 July must not drive current calculations.**

### Useful for course
BoI average rates series (BIR_MRTG_99), per-bank "קו המשווה" (effective rates, excludes bullet/balloon/FX), early-repayment reference rate files, policy rate vs prime, CPI from CBS (index 120010, base-year linking coefficients), the Directive 451 yield workbook, "expected overall interest is not total shekels".

---

## 4. J-090 · Mix construction and calculator (בניית תמהיל ומחשבון)

- **ID** 7503881 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7503881/J-090+Mix+construction+and+calculator
- **Last modified** 2026-10-08 09:20 · author shown: eden · version: not visible
- **Type** **Journey** page (topics: product, research, regulation). "Automation: assisted today, automated is the target." "Nodes: 17, 18, 19, 20, 21".

### What happens
- After J-080 (customer saw bank answers), the loan is **shaped**. A mortgage is several loans — **מסלולים** (tracks), each with own rate, linkage to inflation, length. The division between them is the **תמהיל** (mix); it decides monthly payment, total cost, and exposure to rising rates.
- **Three mixes** (named in the flowchart) — [D/journey design]:
  | # | Mix | Optimises |
  |---|---|---|
  | 1 | **תמהיל החזר חודשי נמוך** | Lowest monthly payment |
  | 2 | **תמהיל חיסכון כולל מירבי** | Lowest total cost over life of loan |
  | 3 | **תמהיל חשיפה לריבית מינימלית** | Least exposure to rate changes |
- Plus a **calculator** the customer can move (change term, shift money between tracks, watch the three numbers).
- "There is no single best mix." Cheapest total usually = higher payment now; safest usually costs more. Which is right is a household conversation, "but the arithmetic under each one is not a matter of opinion."

### Direction — [D/vision]
- Intended to be done by software entirely — built, costed, ranked, explained without a person. **Shadow Mode** (advisor decides; every engine/advisor disagreement recorded) is the path. Who-does-what table: today advisor judgement / memory of rules / spreadsheet or ₪119/month tool / "Trust me" / advisor decides; heading: engine examines every legal split, checked by construction, computed by regulator's method, states the rule that eliminated each rival, engine decides.
- **In:** approved amounts and rates each bank offered (J-060, J-080); borrower income and existing commitments; property value and type. **Out:** three costed legal mixes with reasoning; customer's chosen direction → J-100 (offer the banks are asked to price).

### The rules that bind it — [R] Directive 329 (section numbers as the page gives them)
| Limit | Value | Source |
|---|---|---|
| Loan-to-value | **≤ 75% only home · ≤ 70% replacement home · ≤ 50% investment property** | 329 §2 |
| Payment-to-income | **≤ 50%, absolutely** | 329 §5 |
| Payment-to-income | **above 40%**, bank must hold far more capital | 329 §6 |
| Variable-rate share | **≤ 66.66% of the loan — at least a third must be fixed** | 329 §7 |
| Maximum term | **30 years** | 329 §8 |

- **"40% is a price boundary, not a refusal boundary."** Above it the bank must assign a **100% risk weight**; a borrower at 42% is not rejected, but priced worse. [P] Engine should treat 40% as a target, flag the 40–50% band and its cost. Moving 41%→39% (longer term, restructuring existing loan, adding a guarantor) = "strong candidate for a signature feature".
- **"The variable cap is not a cap on prime."** It covers any rate that can change during the loan's life, **including a track resetting every five years**. Rule = "at least a third fixed", not "at most a third prime". [F/measured by Mogi] A shipped free Israeli mix optimiser returned **67% variable at every setting** against a 66.66% cap ("That measurement is ours… does not yet have a page of its own").

### Same-property repayment rule, in force since **1 October 2026** — [R]
- When a borrower takes a housing loan on a property that already carries one, the monthly payments on the earlier loans **count toward the payment-to-income limit** — whether with the same bank, another bank, or a non-bank lender — **as long as more than 18 months remain**.
- Originated in **circular ח-2840-06 of 8 February 2026**. **Circular 2852 of 30 June 2026** postponed its effective date to **1 October 2026**. Bites hardest on refinances and top-ups.

### How the cost is calculated — [R] (Directive 451, see page 7733250)
- "Not by us." Directive 451 prescribes measure, formula and forecast inputs.
- **Three uniform baskets are exact fractions**; a whole-percentage calculator can't represent them.
- **Needs the whole future payment schedule**, because the pre-approval must state the highest monthly payment the forecast produces.
- Forecast inputs available and verified: BoI nominal and real zero curves, every maturity, free Excel workbook naming Directive 451 in its header. Curves are **monthly averages published twice a month** → version forecast inputs **by month**; expected inflation is the **compounded** gap between curves, not simple subtraction (simple is wrong "by a few basis points").
- **The fixed part (≥ ⅓) is exactly the part that carries an early-repayment penalty** — "cheapest today and costs you the least to get out of later" is computable.

### Each track can have its own term — [D] Eylon 2026-08-03
- Yes, and often enough to support (e.g., fixed-unlinked 25 years beside prime 15 years). Naive search ≈ **150 billion combinations** at a coarse rate grid; brute force dead; terms separate once the split is fixed (they interact only through the single payment-to-income sum).

### No language model does the arithmetic — [D]
"Software may explain a result in Hebrew. It does not compute one."

### Open questions — [O]
- Optimise across all four banks together, or one at a time?
- Must allocations land on round amounts? (Banks may not book ₪237,412.71; exact-third baskets sit awkwardly.)
- What does "optimal" mean inside **Wise** (₪119/month, no published method)?
- Which of our own charges belong inside the cost calculation (Fair Credit Law → lawyer's question)?
- **BoI Q&A file for Directive 329 not read** (worked examples for payment-to-income and variable-share).
- What, if anything, needs human judgement? (Shadow Mode answers from evidence.)

### Current decisions pointer
Page 67436545 (confirmed by Eylon 2026-10-07) and page 67469313 (verified 2026-10-07 to 2026-10-08).

### Useful for course
Track/mix vocabulary; three mix goals (lowest payment / max total saving / min rate exposure); Directive 329 limits (LTV 75/70/50, PTI 50 hard, 40 capital-weight, variable ≤ 2/3, term ≤ 30y); "40% price boundary"; "variable cap ≠ prime cap"; same-property rule; link between fixed share and prepayment exposure.

---

## 5. J-090 · Choices and costs — mix construction and calculator

- **ID** 7634954 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7634954/J-090+Choices+and+costs+mix+construction+and+calculator
- **Last modified** 2026-10-08 09:20 · author shown: eden · version: not visible
- **Owner** Eden · **Review by** 2026-11-01
- **Type** **Research** (choices/costs; topics: product, research, pricing, regulation). "Desk research (August 2026)… except for three things that were measured rather than read: the enumeration timings, the difference between float and decimal arithmetic, and a test of an off-the-shelf mortgage-maths library against our own worked example." "A starting shortlist… Re-verify before implementing; recommendations are starting positions, not final decisions."

### Summary
- Scope: only what the mix engine is built from (rules and cost measure settled elsewhere).
- **[P] "We build it", outside cost ₪0 per file at both 20 and 500 files/month.** The real decision is explainability, which "rules out every product we could have bought".
- **Warning panel:** any build estimate before **3 Aug 2026** is wrong (per-track terms, Eylon). Naive search **~287,000 → ~150 billion** combinations at the coarse **5-point rate grid**; at **1-point granularity: 124 million → ~66 trillion**. Still tractable: terms separate once the split is fixed.

### Decisions to make (Confluence decision items, all UNDECIDED) — [O]
1. Spend **₪119** on one month of Wise to learn what its "optimal mix" computes? ("cheapest competitive intelligence")
2. Optimise across all four banks jointly, or one at a time? (product decision, never written down)
3. Must allocations land on round amounts? (waiting on Eylon or a real signed loan agreement)
4. Ship the calculator to customers, or keep internal to advisors first? (tied to paywall conversation; "most shareable thing we will build and also the easiest to be judged on")

### Options
- **Bounded search, written by us — WE BUILD THIS [P]**: generate legal mixes, cost each by Directive 451, rank. Reasons:
  1. Legal question is small: of the five Directive 329 limits **only two constrain the split — payment-to-income and the variable-rate cap**; LTV and term are loan properties.
  2. Objective isn't solver-shaped: once the cost includes the early-repayment fee, it's not smooth/convex ("a minimum of two values inside it, a maximum against zero, and a lookup that jumps between bands").
  3. **No solver returns the explanation** ("your 70%-prime mix was ruled out by Directive 329 §7, which requires at least a third fixed") — the deciding reason.
  - **Measured:** sweep of **3 of the 27 terms took 15.3 s** in plain Python; **~137 s** extrapolated to the full one-term space; **58.7%** of the measured grid was legal.
- **Wise — buy a month to learn from, not to build on [P]**: ₪119 per advisor per month; ships optimal-mix algorithm, customer record, digital bank submission. Wrong shape as a component; best-value research. "Two shipped Israeli tools have already been measured getting exactly those things wrong" (one-third rule; discounting of early-repayment fee).
- **HiGHS, OR-Tools, SciPy — RULED OUT**; **Gurobi — RULED OUT** (commercial, priced on application).
- **mortgagemath (MIT, ₪0) — PARTLY USABLE.** Measured: reproduced the monthly payment of our early-repayment worked example **exactly**; **₪0.07 difference on the balance** = rounding-convention choice. Candidate for unlinked tracks. No library models CPI linkage, anchor-plus-margin, or the two competing penalty formulas.

### Costs
| Option | 20 files/mo | 500 files/mo | Note |
|---|---|---|---|
| We build it | ₪0/file | ₪0/file | engineering time only |
| Wise, one seat | ₪5.95/file | ₪0.24/file *on paper* | volume means more seats |
| Free solvers | ₪0 | ₪0 | cost not the reason |
- Budget: roughly **₪30–75 of outside cost per file**; this stage consumes none.

### What we build (task list)
- [x] Resolve BoI yield-curve series — **done 3 Aug 2026**: workbook, nominal and real, every maturity to 30 years; loader and forecast formula written and checked.
- [ ] Constraint checker: five Directive 329 limits + same-property rule **effective 1 October 2026** (Circular 2852).
- [ ] Forecast payment schedule per track from the curves, kept in full (highest future payment must be stated).
- [ ] Cost measure exactly per Directive 451 Appendix 4.
- [ ] Search written for per-track terms from the start.
- [ ] Three named mixes + explanation of which rule eliminated each rival.
- [ ] Exact fractions for the three uniform baskets, outside any percentage grid.
- [ ] Test suite on worked examples with known answers, incl. the early-repayment fixture.
- **Measured:** float vs exact decimal agree to **~5 nanoshekels** ("nine orders of magnitude below an agora"). [P] Use decimals for money anyway — for exact equality tests and a named, auditable rounding rule, not accuracy.

### What we still don't know — [O]
- How a bank's quoted rate varies with term, LTV and payment-to-income band (public data doesn't carry it; comes from industry or our submissions).
- What Wise computes.
- Per bank vs across banks.
- Engine run time with per-track terms (137 s figure is for the easy version; factored approach not built or timed).

### Useful for course
Why mix optimisation is hard (combinatorics); explainability; decimals vs floats; competitors' known errors (one-third rule, no discounting); which Directive 329 limits constrain the split.

---

## 6. How the regulator says to compare mortgage offers — Aug 2026

- **ID** 7733250 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7733250/How+the+regulator+says+to+compare+mortgage+offers+Aug+2026
- **Last modified** 2026-08-17 · author shown: eden · version: not visible
- **Type** **Research** (topics: research, product, regulation). "True as of August 2026."
- **Primary source:** "a transcription, not a summary of a summary." Read directly from **Directive 451, version 22 (19/07/2023), Appendix 4 (תוספת 4), pages 23–26**, downloaded from the BoI site on **3 August 2026**, together with **sections 4ג(ב4), 15א and Appendix 5**. Version 22 confirmed current that day (revision table ends there; the three 2025–2026 circulars touching housing loans amend Directive 329). Additions/conclusions of Mogi are marked as "ours".

### Short version — [R]
1. One official cost measure: **העלות הממשית של האשראי** (the actual cost of the credit), formula given.
2. It needs a forecast of rates and inflation, and the directive names **which forecast** per track (BoI publication). "We do not pick a model."
3. The refinance question is answered: **two prescribed numbers**, one including the early-repayment fee, one not.
- [F/measured, Mogi] Shipped Israeli tools get this wrong: one free optimiser breaches the one-third rule; another does no discounting in its early-repayment figure.

### Vocabulary — [R]
| Word | Meaning |
|---|---|
| **מסלול** (track) | One component of the loan with own rate, linkage, repayment schedule |
| **סל** (basket) | All tracks together (the mix) |
| **עוגן** (anchor) | Published rate a variable track is priced off — prime, or a government bond yield; bank adds margin |
| **IRR** | Internal rate of return |

### The actual cost of the credit — [R] Directive 451 Appendix 4
Hebrew definition (quoted on page):
> העלות הממשית של האשראי משקפת את שיעור התשואה הפנימי שהוא השיעור בו הערך הנוכחי של התשלומים העתידיים בגין האשראי שווה לערך הנוכחי של סכום האשראי.

Plain words (page's): the single interest rate that, if charged alone, would produce exactly the payments this loan demands; it absorbs compounding, payment timing, drawdown fees, ongoing fees, expected movement of rates and inflation.

Symbols: `PMT_t` forecast payment in month t across the loan; `t` month from start; `N` months until fully repaid; `L₁…L_k` principal of each of k tracks; `A` charges collected **at the moment the loan is advanced** — "**תוספת**" as defined in the **Fair Credit Law (חוק אשראי הוגן)**; `IRR` monthly IRR.

Formula:
```
Step 1: PMT_t = PMT_t,1 + PMT_t,2 + … + PMT_t,k
Step 2: L₁ + L₂ + … + L_k − A  =  Σ (t=1..N)  PMT_t / (1 + IRR)^t
Step 3: actual cost of credit = ((1 + IRR)^12 − 1) × 100
```
- The **−A** is deliberate: up-front fees reduce what the borrower received. Adding fees to payments instead gives "a number that is close, and wrong" (Mogi note).
- [O] Which of our charges belong in A — legal question, unsettled.

### Forecast per track — [R] Appendix 4 טבלת ייחוס (reproduced in full on the page)
| Track | What it is | Rate forecast | Linkage forecast |
|---|---|---|---|
| **קבועה צמודה** | Fixed, CPI-linked | not relevant | **Inflation expectations from the capital market — BoI** |
| **קבועה לא צמודה** | Fixed, not linked | not relevant | not relevant |
| **משתנה פריים** | Variable, off prime | **Zero curve (nominal) — BoI** | not relevant |
| **משתנה צמודה, every X years, government-bond basis** | Variable, off CPI-linked gov bonds | **Zero curve (real) — BoI** | **Inflation expectations — BoI** |
| **משתנה לא צמודה, every X years, government-bond basis** | Variable, off unlinked gov bonds | **Zero curve (nominal) — BoI** | not relevant |
| **משתנה צמודה, every X years, on a מק"מ basis** | Variable, off Treasury bills | **Zero curve (nominal) — BoI** | not relevant |
| **מט"ח / צמוד מט"ח** | Foreign currency and FX-linked | *no forecast at all* | — |
| **אחר** | Anything else | *no forecast at all* | — |

- **Zero curve (עקום אפס)**: market view of the risk-free rate per horizon, 1 month to 30 years; nominal = shekels; real = after inflation; the gap = expected inflation.
- [R] A bank wanting a track not in the table must apply to the **Supervisor of Banks** with name, rate and linkage type, proposed forecast model for each, **empirical validation**, data source; **Supervisor answers within 90 days** and, if approved, publishes the new row for all.
- [R] **Forecast-free tracks capped at 3% of a bank's mortgage book**, tested on the first day of each quarter.

### Variable-rate forecast — [R]
For a track resetting every V months: first V months use the anchor as on the offer day; then
```
Anchor between V and 2V  =  [ (1 + A_2V)^(2V/12) ÷ (1 + A_V)^(V/12) ]^(12/V) − 1
```
A_V, A_2V = zero curve (nominal or real per track) at V and 2V months; continue 2V→3V, etc. For an existing loan being re-quoted, offset by `s` = months until next reset (real anchor for s months, implied after).

### The five procedural rules — [R]
1. Forecast payments follow forecast anchors from curves and expected inflation **published on the BoI site**.
2. Future anchors derived as above.
3. **Tracks drawn on different dates → calculate as if the whole loan were advanced on the calculation date.**
4. **Calculate as if advanced at the start of the month in which the pre-approval was given.**
5. **If BoI hasn't published curves/expected inflation, use the last forecast it did publish.**

### Second number and the refinance test — [R] §15א
For an existing loan, two figures by the same appendix, over the remaining term, **per track and for the whole loan**:
```
L_t + A  =  Σ (i=1..N−t)  PMT_i / (1 + IRR)^i
```
t = last payment made; L_t = principal outstanding after it.
| Figure | A | Meaning |
|---|---|---|
| **הריבית הכוללת החזויה** (expected total rate) | excluded | Cost from here |
| **שיעור הריבית לצרכי השוואה** (rate for comparison purposes) | **the early-repayment fee** + any other charge due if repaid now | Cost from here incl. price of leaving |

Mandatory customer sentence (quoted):
> נתון זה הינו לצרכי השוואה, ככל שהינך שוקל למחזר את ההלוואה על ידי לקיחת הלוואה אחרת. ככל ש"שיעור הריבית לצרכי השוואה" גבוה מ"שיעור הריבית הכוללת החזויה" המופיע באישור העקרוני של ההלוואה החדשה, אזי קיימת כדאיות כלכלית לביצוע המחזור.

- The fee in A is the one set by the **2002 Banking Order** (→ page 7798786).
- Banks must show both numbers in online applications for the whole loan and give them **in writing, free, twice a calendar year** to customers not using the online app.

### What the pre-approval must show — [R] §4ג(ב4)
- Fixed tracks: plain contracted rate. Variable tracks: rate implied by rate-change rules, **marked as correct on the day the pre-approval was issued**.
- The **expected total rate** (Appendix 4), and **total amount expected to be paid over the whole term** = sum of all forecast payments.
- **Early-repayment fees**, referenced to the 2002 Banking Order.
- Where a track has no forecast: clear statement that the actual-cost figure excludes it.
- **The first monthly payment, and the highest monthly payment expected under the forecast.** → calculator must keep the whole forecast schedule.

### Three uniform baskets — [R] Appendix 5
| Basket | Composition |
|---|---|
| **סל אחיד 1** | קבועה לא צמודה — whole loan |
| **סל אחיד 2** | קבועה לא צמודה **⅓** · משתנה פריים **⅓** · משתנה צמודה resetting every 5 years on a government-bond basis **⅓** |
| **סל אחיד 3** | קבועה לא צמודה **½** · משתנה פריים **½** |
| **סל מוצע** | whatever mix the bank proposes |
- Footnote *כמוגדר בתוספת 4*: each component is named from the reference table → baskets are forecastable and comparable. "A third is exactly a third" — can't be 33%.

### What this means for us — [P] (Mogi conclusions)
Implement Appendix 4 as written; forecast inputs are BoI publications; refinance advice already specified — our contribution is computing it across four banks; keep the whole payment path; compare on uniform baskets first.

### Still unknown — [O]
- Which charges belong in A (Fair Credit Law; lawyer).
- Whether each track can have its own term (Appendix 4 silent) — **later settled by Eylon 2026-08-03** (page 16646263; this research page was not updated to reflect it).
- The Supervisor's **Q&A file for Directive 329** not read.

### Useful for course
Directive 451 cost measure (IRR formula), forecast-per-track table, forward-anchor formula, five procedural rules, refinance comparison (expected total rate vs comparison rate) with the official Hebrew sentence, pre-approval contents (first and max payment), uniform baskets.

---

## 7. What it costs to leave a mortgage early (קנס היוון) — Aug 2026

- **ID** 7798786 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7798786/What+it+costs+to+leave+a+mortgage+early+Aug+2026
- **Last modified** 2026-08-17 · author shown: eden · version: not visible
- **Type** **Research** (topics: research, regulation, product). "True as of August 2026."
- **Primary source:** transcribed from **צו הבנקאות (פירעון מוקדם של הלוואה לדיור), התשס"ב-2002, Second Schedule**, read at the BoI published text and cross-checked against the consolidated version with amendment history on **2 August 2026**; rate values downloaded and parsed the same day. Three items are "our reading", marked. Bank-explanation-only items marked.

### Short version — [R]
1. **Five separate fees**; one dominates: **עמלת היוון** (discounting fee; colloquially קנס היוון).
2. **Two competing formulas; the bank must charge the lower.** Worked example: **₪56,765 vs ₪12,882**. Implementing only the common version overstates >4× (Mogi conclusion).
3. **Prime track: never a discounting fee.** Same for any track resetting yearly or more often.
4. **On the day a variable track resets — its תחנת יציאה (exit point) — the fee falls to ₪60.**

### What the fee is for — [R]/explanation
Bank funded a fixed loan at a matching rate; if rates fall and borrower repays, bank relends cheaper. Fee = PV of remaining payments at **today's market rate** minus PV at **the loan's own rate**. "Market rate" = **ריבית ממוצעת**, a single BoI-published monthly number bucketed by years remaining.

### The five fees — [R] (section numbers of the Order)
| Fee | Hebrew | When | Amount |
|---|---|---|---|
| Operational | עמלה תפעולית | Always | Flat **≤ ₪60** (§3(1)) |
| No advance notice | עמלת אי־הודעה מוקדמת | **< 10 days'** written notice | **0.1%** of amount repaid (§3(2)) |
| Discounting | **עמלת היוון** | Fixed tracks, and variable tracks resetting **less often than once a year** | Formula (§3(3), §3(4), §3(5)) |
| Index | עמלת מדד | **CPI-linked** loan repaid **1st–15th** of month | Amount repaid × ½ × average monthly index change over last twelve published indices (§5) |
| Exchange rate | עמלת הפרשי שער | FX loan with < 2 business days' notice | FX movement over those days (§6) |

- [R] **₪60 charged once per repayment, not per track** — Supervisor of Banks ruling **13 September 2021**, after a class action. Per-track charging overstates a 5-track mortgage by ₪240.
- [R] Notice: failing to give it earns a charge (not a discount for giving it). Notice may not be given **more than 45 days** before repayment. **Anti-gaming: a notice not acted on → another notice on the same loan within six months does not count.** [P] Never file speculatively.
- [R] Index fee workaround: **repay on the 16th instead of the 15th** → removed ("several hundred shekels" on a typical balance — Mogi estimate).
- [R] **הלוואה מוכוונת** (subsidised directed loan — government, Jewish Agency, local authority) may not be charged **any** fee (§2). **No fee on realisation of a mortgage over a single dwelling, subject to thresholds** — *read off a bank's explanatory sheet, not the Order*.

### Discounting fee — [R]
Symbols: **A** average published rate today; **C** average published rate on the grant day; **R** loan's contract rate at repayment; **Bᵢ** future payments incl. interest to accrue; **n** periods to next reset; **N** periods to end; **PV** principal repaid + linkage + accrued interest at repayment day. **All rates periodic** (monthly for monthly-paying loan).

Version one §3(3):
```
Fee₃₍₃₎ = PV(A) − PV
 = [ Σ_{i=1..n} Bᵢ/(1+A)^i + (1/(1+A)^n)·Σ_{i=1..N−n} B_{i+n}/(1+R)^i ]
 − [ Σ_{i=1..n} Bᵢ/(1+R)^i + (1/(1+R)^n)·Σ_{i=1..N−n} B_{i+n}/(1+R)^i ]
```
Version two §3(4) (own contract rate not in the comparison):
```
Fee₃₍₄₎ = PV(A) − PV(C)
 = [ Σ_{i=1..n} Bᵢ/(1+A)^i + (1/(1+A)^n)·Σ_{i=1..N−n} B_{i+n}/(1+R)^i ]
 − [ Σ_{i=1..n} Bᵢ/(1+C)^i + (1/(1+C)^n)·Σ_{i=1..N−n} B_{i+n}/(1+R)^i ]
```
- Second term = principal outstanding at the reset date, **always discounted at R**; only bringing it back to today uses A or C.
- **Fixed track: N = n, second term dropped** → plain PV of remaining stream.

Applicability:
```
§3(3) applies if  A < R   (at repayment date)
§3(4) applies if  C < R₀  (at grant date; R₀ = contract rate then; if no average rate published for grant date, C := R₀)
§3(5): where both exist, the bank charges the LOWER
```
Order's words: *"תאגיד בנקאי רשאי לגבות עמלה כאמור בפסקת משנה (3) או כאמור בפסקת משנה (4), אם קיימת, לפי הנמוכה מביניהן."*
- [R] Version two added by the **2014 amendment — the only amendment the Order has ever had**.

Negative fee: [R] negative amount **set off against the other fees** (operational, no-notice, index) (§7(b), §7(c)). [O]/our reading: Order silent on whether total can go below zero; Mogi would **floor at zero** and flag.

### The published average rate — [R]
| Segment | File | Buckets |
|---|---|---|
| Unlinked shekel | `boi.org.il/boi_files/Pikuah/mashfix.xls` | ≤1y · 1–5 · 5–10 · 10–15 · 15–20 · 20–25 · >25 |
| CPI-linked | `boi.org.il/boi_files/Pikuah/pribmash.xls` | ≤5 · 5–10 · 10–15 · 15–20 · 20–25 · >25 |
- **No API/CSV/JSON** — two legacy Excel workbooks. Published **monthly**; used from effective date **until next publication** ("the last known").
- Values read **2026-08-02**, effective from **2026-07-13**, effective annual %: **unlinked 4.64%–4.92%**, **CPI-linked 3.35%–3.49%**.
- **Bucket chosen by time remaining**, not original term; on a fixed track = time to final repayment; on a variable track = time to the day before the next reset (→ small penalty).
- Warnings [P]: keep **whole history** append-only (C needs the table in force at grant, possibly 2011); **published number is effective annual; contract rate is nominal** → R ÷ 12, but A and C convert by **twelfth root**. Example: 5.90% nominal = **6.06% effective**. Mixing them understates the penalty. Type them differently in code. BoI web pages are bot-protected; file paths are not.
- **Don't use** the statistical-service mortgage rates (LTV/PTI-dimensioned, transparency reform) — wrong number.

### Which tracks can carry the fee — [R]
| Track | Discounting fee? | Why |
|---|---|---|
| קבועה לא צמודה | **Yes — big numbers** | no reset |
| קבועה צמודה | **Yes** | + index fee if 1st–15th |
| משתנה resetting every 2, 3 or 5 years | Yes, structurally small | stream cut at next reset; short bucket |
| משתנה resetting yearly or more often | **No** | §4(2) |
| פריים | **No** | §4(2); BoI rate moves on dates not known in advance |
| הלוואה מוכוונת | **No fee of any kind** | §2 |
- Mogi observation: Directive 329's ≥⅓ fixed floor is also a floor on how hard the loan is to leave.

### Exit points (תחנות יציאה) — [R]
- Repaying **on** the reset day → only the ₪60 fee (§4(3)). A specific day, not a window. Fixed tracks have none (common customer misunderstanding). Prime needs none. **Reset dates come from the loan contract**, not regulation. Penalty shrinks as reset approaches ("wait four months… from ₪18,000 to ₪60" — illustrative). Notice must be filed **10–45 days** before the exit point.

### Reductions for time served — [R] §8(b) (discounting fee only)
| Grant → repayment | Reduction |
|---|---|
| < 3 years | 0% |
| 3 to < 5 years | 20% |
| ≥ 5 years | 30% |
- Complementary loan alongside a subsidised one: own scale, **up to 40%**.

### Worked example — Mogi's own computation (invented loan, real rates)
Single fixed unlinked track, **₪700,000**, granted **2023-07-01**, **20 years**, **5.90% nominal**, repaid **2026-08-02** with notice. A = **4.823%**, C = **5.09%**, both 15–20y bucket.
| Step | Result |
|---|---|
| Monthly payment | ₪4,974.72 |
| Payments made / remaining | 37 / 203 |
| Outstanding balance | ₪637,956.74 |
| PV at today's average | ₪694,721.98 |
| PV at grant average | ₪681,839.54 |
| Version one §3(3) | ₪56,765.24 |
| Version two §3(4) | ₪12,882.44 |
| Lower §3(5) | ₪12,882.44 |
| −20% time served §8(b) | ₪10,305.95 |
| + operational fee | ₪60.00 |
| **Total** | **₪10,365.95** |
- Rule worth **₪43,882.80**.
- Second case: granted **January 2023** → C below today's → version two **negative**, set off against operational fee → **₪0** total; version-one-only calculator would quote **₪54,345**.
- (Reader's note: I re-ran the Spitzer arithmetic independently — monthly payment 4,974.72, balance after 37 payments 637,956.74, 5.90% nominal → 6.062% effective; all reproduce. The PV lines were not re-derived.)

### Still unknown — [O]
- **Which bucket C is read from** (remaining-term bucket vs original-term bucket). Our reading = remaining-term; "one phone call to a bank settles it."
- Whether effective→periodic conversion matches BoI's own converter (calculator page bot-protected).
- Whether the total can go below zero (floor at zero proposed).
- **Loans granted before 23 February 2015** may fall under the pre-amendment formula (from BoI press release, no transitional provision found). Calculator should refuse to quote confidently.
- Whether reform is coming — none found 2024–2026 (absence of evidence).

### Useful for course
Prepayment fee components (five fees), the two discounting formulas and "lower of the two", average-rate files and buckets, nominal vs effective conversion, exit points, time-served reductions, 16th-of-month trick, notice rules (10/45 days, six-month anti-gaming), subsidised-loan exemption.

---

## 8. (Followed) The rate and index data feeds — Aug 2026

- **ID** 7831553 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7831553/The+rate+and+index+data+feeds+Aug+2026
- **Last modified** 2026-10-08 09:20 (a banner added; body is the August investigation) · author: eden
- **Type** **Research**. Every endpoint/file was called on **3 August 2026**. Banner (2026-10-08): this records the August investigation; current inventory is page 67469313; "The five-month rate lag described below was an August observation."

### Key facts — [R] observed 2026-08-03
- Two BoI publishing places: **data service** `https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/` (no key; `data/dataflow/BOI.STATISTICS/{FLOW}/{VERSION}?format=csv&startperiod=YYYY-MM-DD`; catalogue via `structure/...?references=all`; both edge.boi.org.il and edge.boi.gov.il work) and **file store** `www.boi.org.il/boi_files/` and `/media/`.
- Catalogue over-advertises: yield-curve collection declares **6,820 series names, holds 30**. Empty series answer **404 with HTML**. Ask with no series name to see real contents. Web pages bot-protected; files not; mirror at `kamakama.gov.il`.
- **BR collection** (5 daily series), 2026-08-03: `MNT_SHIR_D` published BoI rate **3.5%**; `MNT_RIB_BOI_D` 3.5%; `MNT_RIB_EFYB_D` effective 3.562%; `MNT_WIN_LN_D` lending window 4.0%; `MNT_WIN_DEP_D` deposit window 3.0%. **Prime = rate + 1.5% → 5.0%.** Was 4.25% in January 2026. Weekends/holidays come back as empty observations → carry last value forward.
  - Page states the 1.5% is "**a margin fixed in Directive 451 rather than by the banks**" (see contradictions).
- **CPI (CBS)**: `https://api.cbs.gov.il/index/data/price?id=120010&format=json&download=false&last=6`; params format, startPeriod/endPeriod `mm-yyyy`, last=N, lang, coef=true. 2026-08-03: latest **June 2026**, index **104.8** on the **2024-average base**, **+1.6%** y/y. `coef=true` needed for the base-index rule in **Directive 451 Appendix 2**. Worked fine then (contrast Oct page).
- **Yield workbook** (984 KB): sheets nominal/real 1–360 months, third sheet = **cumulative expected-CPI index**. Layout `year · month · average type` + 360 columns. History **Sept 2021 – July 2026**. Two rows per month: **קלנדרי** (calendar; all trading days; general-purpose, matches pre-approval dating) and **מדדי** (CPI; 16th of previous month to 15th of this). Updated **twice a month**: 4th business day after the 1st (calendar) and after the 15th (CPI). Header says the data "serve as the forecasts required for computing the 'expected total interest' set out in Directive 451". BoI estimates daily but doesn't release daily figures → twice a month is the ceiling. Version forecast inputs **by month and average type**.
- **ZCM** (30 series): raw fitted curve, not the workbook's smoothed curve anchored at the short end to the policy rate. July 2026 comparison: 1y workbook 3.4012% vs ZCM 3.2425% (+15.9 bp); 2y 3.3803 vs 3.3841 (−0.4); 5y 3.5221 vs 3.5344 (−1.2); 10y 3.8817 vs 3.8816 (0.0); 15y 4.1427 vs 4.1232 (+1.9). Workbook 1-month rate 3.4826% vs policy 3.50%. **Use the workbook for Directive 451.**
- Validation: nominal curve 3.38%→4.49% over 30y; real 1.64%→2.40%. Implied vs published inflation expectations: 1y 1.528639 vs 1.528659; 5y 1.801307 vs 1.801284; 10y 1.852713 vs 1.852708. **Expected inflation = (1 + nominal) ÷ (1 + real) − 1** (compounded); simple subtraction wrong by 3–4 bp. Third sheet = `(1 + expected inflation)^years × 100`.
- **Forward-anchor worked example** (5-year reset, July 2026 nominal): 5y 3.5221%, 10y 3.8817%; 1.038817^10 = 1.463483; 1.035221^5 = 1.188955; ratio 1.230903; annualised over 5 years → **4.2425%** for years 5–10. Table: 1y reset Y1–2 3.3594%, Y2–3 3.4529%; 2y reset Y2–4 3.5314%, Y4–6 3.8752%; 5y reset Y5–10 4.2425%, Y10–15 4.6667%. Code: `research/boi-zero-curve.py` in the research repository. (Reader's note: I reproduced 4.2425%.)
- **BIR_MRTG_99** (Aug): bands — LTV ≤30 · 30–45 · 45–60 · 60–75 · 75–90 · >90; PTI ≤20 · 20–30 · 30–40 · 40–60 · >60 (+ bullet, balloon, grace categories); property value ≤₪400K · 400–800K · 800K–1.2M · 1.2–2M · 2–3M · 3–5M · >5M; purpose first home · alternative home · investment · reduced-price · buying group · other. Variable tracks: anchor and margin separately — **Feb 2026 CPI-linked variable: anchor 1.81%, average margin 1.45%, average rate 3.26%**. Feb 2026 system averages for new loans: **קבועה לא צמודה 4.74%**, **קבועה צמודה 3.25%**, all CPI-linked 3.26%. In August, rates lagged ~5 months (to Feb 2026); volumes to June 2026. Of 38 term-bucket rate series only 4 returned data; for variable tracks the "term" dimension = **interest-change period**, not loan term. 12,156 per-bank series names, none returned data. Per-bank monthly averages by track published on the site since **July 2023**.
- [P] Conclusion: official data can't price today's offer; Mogi's own record of bank answers is the only current deal-level pricing. Everything costs ₪0.
- [O] Per-bank rates anywhere? Why the lag? Rate-by-term populated anywhere?

---

## 9. (Followed) A mortgage mix carries a term per track, not one term

- **ID** 16646263 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/16646263/A+mortgage+mix+carries+a+term+per+track+not+one+term · last modified 2026-08-24 · **Decision**
- [D] **Settled by Eylon 2026-08-03**: each track can carry its own term — "a 30-year fixed beside a 12-year prime is normal and common." No engine code against one-term. Search space ~287,000 → ~150 billion. Any estimate before 2026-08-03 is wrong. Revisit: "Nothing — this is a fact about the market"; Appendix 4 of Directive 451 is silent; "the practice is established."

## 10. (Followed) An LLM never performs a financial calculation

- **ID** 16515075 · **URL** https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/16515075/An+LLM+never+performs+a+financial+calculation · last modified 2026-08-24 · **Decision**
- [D] Decided at the **29.07.2026 all-team meeting**. Core algorithmic and deterministic; LLM may explain, classify, summarise, draft; never computes a rate, payment, cost measure, early-repayment fee, or any relied-on number. Every regulated calculation (Directive 451 cost measure, Directive 329 limits, the early-repayment order) = auditable code with worked-example tests.
- Why: regulator prescribes the calculations; the competitive gap is correctness (free optimiser 67% variable at every risk setting). Revisit: "Nothing foreseeable — this is a safety property."

---

## 11. Linear ENG-223 — "Calculate each track's monthly payment, the total monthly payment and the repayment ratio in the engine, and call the engine from the API"

- **URL** https://linear.app/edea-team/issue/ENG-223/calculate-each-tracks-monthly-payment-the-total-monthly-payment-and
- Created 2026-10-02 by Eden Cohen; assignee Eden Cohen; priority High; label Feature; project EDEA - Mortgage.
- **Status: Backlog (on hold)** since 2026-10-08 20:48. History: Backlog → Todo 2026-10-02 → In Progress 2026-10-03 → Backlog 2026-10-08.
- Blocked by ENG-52. Blocks **ENG-275** (forecast each track's payments over whole term + highest expected payment from BoI forecast) and **ENG-222** (show figures on loan-request screen). Related: ENG-27 (versioning rules/reference data — open), ENG-276 (answer keys from bank simulators, Wise, real pre-approvals), ENG-226 (per-bank readiness, Discount first), ENG-230 (pre-approval dashboard), others (ENG-50, 51, 184, 252, 260, 285).
- Branch: `eden/eng-223-calculate-each-tracks-monthly-payment-the-total-monthly`, commit `3864c6a` — research draft only (`context/drafts/eng-223-payment-and-ratio-research-oct-2026.md`), **no code**.

### Description — vocabulary (as the issue defines it)
- **Track (מסלול)**: part of the loan with own type, amount, term, rate, payment form.
- **Payment form**: **Spitzer (שפיצר)** same payment every month; **Equal principal (קרן שווה)** same principal each month, payment goes down; **Bullet (בוליט)** only interest monthly, whole amount at end.
- **Grace (גרייס)**: months at start paying only interest; 0 = none.
- **Prime (פריים)**: BoI rate **+ 1.5%**; prime track rate = prime + signed distance.
- **CPI-linked (צמוד)**: amount owed moves with CPI (מדד המחירים לצרכן).
- **Repayment ratio (יחס החזר)**: monthly payments as a share of borrowers' monthly income.

### Track inputs (from ENG-52 spec)
`track_kind` (prime, fixed unlinked, fixed CPI-linked, variable unlinked, variable CPI-linked, eligibility loan (הלוואת זכאות), other); `amount` (whole agorot, digit string); `term_months`; `rate_percent` (decimal string; non-prime tracks); `prime_margin_percent` (signed decimal string, e.g. "-0.5", prime only); `payment_form` (spitzer/equal_principal/bullet); `grace_months` 0–36; `track_purpose` (refinance only). Some banks don't require rate or payment form. Income (ENG-50): amount, period (monthly/annual), basis (net/gross). Obligations (ENG-51): kind (mortgage, loan, leasing, rent, alimony, other), monthly_payment. "The ratio uses these stated incomes. It does not use the payslips."
- Comment (Dvir, 2026-10-07): a track's `term_months` has **min 12**; the loan's own `term_months` has **min 48**.

### Settled rules restated — [D]
Engine computes (app/API compute nothing; LLM never); engine has no DB login; API calls engine directly over HTTP and waits; every answer carries engine version + input versions; money = agorot digit string, rate = decimal string; bare JSON numbers refused (`validation_failed`). Order decided by Eden 2026-10-02: ENG-52 → ENG-223 → ENG-222.

### Outcome checklist (all unchecked)
Route answering each track's payment and total (agorot strings); repayment ratio = **"the total monthly payment, plus the obligations' monthly payments that count, divided by the borrowers' monthly income"**; versions incl. prime rate and its date; supported kinds/forms per open questions; tests vs external worked examples; API route reading projections and returning engine answer; `render.yaml` private service; docs.

### Open questions in the description — [O] (largely answered later by page 67436545)
Source of prime and CPI forecast; one ratio or per bank (net/gross, annual→monthly, which obligations, closed obligations); which kinds/forms in v1; missing inputs; which month's payment is "the monthly payment"; record result in the event log or not (which kind, when).

### Comment 2026-10-04 (Eden, with Claude) — planning state
- Plan agreed 2026-10-03: four slices — (1) fixed-rate Spitzer end to end, `POST /v1/calculations/loan-figures`, total only when every track calculated, `engine_version`; API client `services/api/src/engine/`, `ENGINE_URL`, `GET /api/cases/:case_id/loan-request/figures`; Render private service `edea-engine`; (2) equal principal, bullet, grace; (3) prime tracks (one prime rate with its date); (4) the ratio.
- Scope (accepted 2026-10-05): testing core — reference set starting with **Spitzer and equal-principal tables Discount and Leumi publish**; CI check to the agora; independent second calculation on random loans; property tests (e.g., balance ends at exactly zero). Highest expected payment + forecast → ENG-275 (waits for Eylon). Answer keys → ENG-276.
- **Research findings [R as researched by Eden/Claude]:**
  - **Monthly rate = annual rate ÷ 12.** Published Spitzer tables match to the agora: **Discount 84 of 84 cells, Leumi 340 of 340.**
  - **Directive 329 ratio = monthly repayment ÷ (net monthly income − fixed expenses).** **Above 50% forbidden; above 40% more capital. Both say "exceeds", so exactly 50.00% is allowed.**
  - Repayment = new loan's payment on approval date on full approved amount; bullet → monthly interest; grace → expected payment after grace. No stress test, no forecast.
  - "**From 1 July 2026**, older loans on the same property with >18 months left count in the repayment as well (circular 2840)." — **superseded**, see contradictions.
  - Fixed expenses: commitments with >18 months left (alimony paid, other loans). Rent only if borrower won't live in the bought apartment.
  - **One ratio per application, all borrowers' net income added together.**
  - **The Supervisor publishes no worked example of the ratio.**
  - **Prime = BoI + 1.5%; BoI rate 3.25% since 1 September 2026 → prime 4.75%; next decision 21 October 2026.**
- Open for Eden & Dvir: record engine answer in event log? (recommended: not now; needs new kind). ENG-27 governs prime storage.
- **15 questions to Eylon (Hebrew)** — useful worked numbers inside:
  - Q1 example: **₪1,000,000 fixed CPI-linked, 3%, 25 years → first payment ≈ ₪4,740; with 2%/yr inflation, last-year payment ≈ ₪7,760.** (Reader's note: Spitzer 1M/3%/300m = 4,742.11 — consistent.)
  - Q2: banks must print both first and maximum payment on the pre-approval ("הבנק חייב להדפיס באישור את שני ההחזרים").
  - Q3: BoI publishes twice a month the official forecast for 30 years; banks must use it for "החזר מקסימלי צפוי".
  - Q4: Discount's variable tracks are always "every 5 years" (field knowledge, Eden/Claude research).
  - Q6 proposal: current salaries only; annual ÷ 12. Q8 proposal: paid-off mortgage excluded; "גרירה" and "ללא שינוי" included. Q10 proposal: one ratio by directive, per bank later.
  - Q11 example: **₪1M, 4.5%, 25y, 12 months partial grace → ≈ ₪3,750 during grace, ≈ ₪5,680 after** (proposal: partial grace, spread over remaining months). (Reader's note: 3,750.00 and 5,684.25 over 288 months — consistent.)
  - Q12 proposal: bullet = interest only, principal at end; asks about CPI-linked bullet. Q13: eligibility loan usually fixed CPI-linked? Q14 proposal: don't compute, list missing. Q15 proposal: manual prime update after each decision, note prime + date with each calc.

### Comment 2026-10-07 and 2026-10-08 (Dvir) — ENG-184 shared-code notes
`fieldEntry` removed → `fieldAt(kindName, kind, payloadPart, name)`; track term is `fieldAt("loan_request_stated", kind, "tracks", "term_months")`; migration 0027 taken → ENG-223 takes 0028. (Engineering only.)

### Comment 2026-10-08 (Eden) — on hold
- **Why:** payment figures will probably be redesigned as a **dedicated page inside the client's case**, where an algorithm generates figures and the advisor can enter values by hand; **Eylon is building a prototype**.
- Eylon's answers (2026-10-07) recorded in page 67436545; **Eden accepted 2026-10-08**; they replace the 15 questions.
- Scope widened: full grace and full bullet; each variable track's reset interval, anchor and margin; each income's recognized amount and status; completed tracks with "partial total" label; BoI interest service beside manual prime. **Registry has no fields for several of these yet.**
- **Same-property rule started 1 October 2026, not 1 July (Circular 2852 postponed it). "The comment above and the research draft are wrong on this date."**
- Still holds: monthly rate = annual ÷ 12 matched to the agora; the Directive 329 ratio; the testing approach.
- [O] **Does the engine calculate the tracks the advisor records, the plan the algorithm generates, or both?**

### Useful for course
Payment forms (שפיצר / קרן שווה / בוליט / גרייס) as Mogi defines them; annual/12 convention verified against Discount and Leumi tables; ratio definition and 50%-exact allowed; prime arithmetic with dated values; worked numeric examples for Spitzer and grace.

---

## Contradictions and tensions (flagged)

1. **Same-property rule effective date — 1 July vs 1 October 2026.** ENG-223 comment of 2026-10-04 (and the Hebrew questions to Eylon, and the research draft) say "from 1 July 2026 (circular 2840)". Pages 67436545, 67469313, 7503881, 7634954 say **1 October 2026** (Circular 2852 of 30 June 2026 postponed it; original circular ח-2840-06 of 8 Feb 2026). Eden's 2026-10-08 comment explicitly corrects it. **Use 1 October 2026.**

2. **Where obligations go in the ratio.** ENG-223's Outcome line: "the total monthly payment, **plus** the obligations' monthly payments that count, **divided by** the borrowers' monthly income" (obligations in the numerator). The Decision page (Q7, Q10) and ENG-223's own research comment: fixed commitments are **deducted from income** (denominator: disposable income = net income − commitments); only a **same-property** existing mortgage is **added to the numerator**; another-property mortgage is deducted from income. The two formulas give different ratios. The Decision page (2026-10-07/08) is later and governs; the issue's Outcome text was written 2026-10-02 and was not updated.

3. **Prime = BoI rate + 1.5% — attributed to "Directive 451".** Page 7831553 says the 1.5% is "a margin fixed in Directive 451 rather than by the banks". No other page cites a section for it; the Decision page only says keep policy rate, prime and spread distinct. (Reader's note: the common understanding in the Israeli market is that the 1.5% prime margin is a banking-system convention; the Directive 451 attribution should be verified against a primary source before the course states it.)

4. **Policy rate / prime values are dated, not contradictory:** 3 Aug 2026: BoI 3.5%, prime 5.0% (and 4.25% in Jan 2026). 8 Oct 2026: BoI 3.25% (lastPublished 2026-09-01; ENG-223: "since 1 September 2026"), prime 4.75%; next decision 21 Oct 2026. The course must date any such figure.

5. **Mortgage-rate lag:** August page: rates stop at Feb 2026 (~5 months lag). October page: through August 2026. October page explicitly supersedes the lag claim.

6. **CBS CPI API:** August: "live, keyless, fast… the one nobody needs to worry about". October: direct request failed with a connection reset in that environment; unresolved. Probably environment-specific, as the page says.

7. **Variable-rate cap expressed as "≤ 66.66%".** J-090 states "≤ 66.66% of the loan — meaning at least a third must be fixed". Exactly two-thirds is 66.67% (rounded); the "at least a third fixed" phrasing and the exact-fractions point in 7733250 suggest the cap is exactly ⅔. (Reader's note: the 66.66% figure is a rounding of ⅔; for the course use "two-thirds / at least one-third fixed" and verify the wording of Directive 329 §7.)

8. **Directive 451 reference-table row "משתנה צמודה, every X years, on a מק"מ basis"** is transcribed with rate forecast = nominal zero curve and linkage forecast = "not relevant". A CPI-linked (צמודה) track without a linkage forecast is unexpected; a MAKAM-based track is normally unlinked. (Reader's note: possibly a transcription slip for "משתנה לא צמודה … מק"מ"; verify against Appendix 4 before teaching it.)

9. **Per-track term — 7733250 lists it as unknown;** settled by Eylon 2026-08-03 (16646263), the same day the research was read but the research page still lists it as open (last modified 2026-08-17).

10. **Grace in ENG-223 description** is defined only as partial (interest-only) with 0–36 months; the Decision page adds **full grace** (no payments, interest capitalised) and **grace inside the total term**. ENG-223's 10-08 comment acknowledges the widened scope; the registry lacks fields.

11. **"Monthly rate = annual ÷ 12" (ENG-223, for contract rates)** vs **twelfth-root conversion (7798786, for BoI average rates A and C, which are effective annual)**. Not a contradiction — two different rate conventions — but a classic trap; both pages agree contract rates are nominal and BoI average/"קו המשווה" rates are effective.

12. **Early-repayment amendment year:** "2014 amendment" vs "loans granted before 23 February 2015" — consistent if the amendment was enacted 2014 and took effect Feb 2015 (page itself says the 2015 date comes from a BoI press release, not a transitional provision).

13. **Reset-interval list** (Decision: 12, 24, 30, 36, 60, 72, 84, 120 months) vs appendix: Mercantile CPI-linked includes 6 years (72 m), Mizrahi 2.5 (30 m), 7 (84 m) — consistent. Annual MAKAM resets (Leumi, Bank of Jerusalem) = 12 m. Discount: 5 years only (matches ENG-223 research "Discount always every 5 years").

14. **Highlighting threshold** (projected max ≥10% above headline) is a Mogi product choice, not regulation; the regulation (§4ג(ב4)) only requires showing first and highest expected payment.

---

## Course-topic map (what each topic can cite)

| Course topic | Pages |
|---|---|
| Tracks, mix, anchor, basket vocabulary (מסלול, תמהיל, סל, עוגן) | 7503881, 7733250, ENG-223 |
| Spitzer formula / annual ÷ 12 / worked examples | 67436545 Q1, ENG-223 comments (Discount 84/84, Leumi 340/340; 1M/3%/25y ≈ 4,740), 7798786 worked example (700k/5.9%/20y = 4,974.72) |
| Equal principal, bullet (partial/full), grace (partial/full, inside term) | 67436545 Q9, Q11, Q12; ENG-223 |
| CPI linkage (index 120010, base-year coefficients, monthly) | 67469313 §3, 7831553 |
| Repayment ratio definition, 40/50 thresholds, numerator/denominator rules, 18-month rule, rent rule | 67436545 Q6–Q10, 7503881, ENG-223 research |
| Same-property rule (from 1 Oct 2026) | 67436545 Q8, 7503881, 67469313 |
| Directive 329 limits (LTV 75/70/50; PTI 50; 40 capital; ≤⅔ variable; 30y) | 7503881 |
| Directive 451 cost measure (IRR), forecast table, forward anchors, five rules | 7733250, 7831553 |
| Refinance test (expected total rate vs rate for comparison) | 7733250 §15א |
| Pre-approval disclosure (first + highest payment, total paid) | 7733250 §4ג(ב4), 67436545 Q1 |
| Uniform baskets 1/2/3 | 7733250 Appendix 5 |
| Three mix goals | 7503881 |
| Prepayment fee components, two discounting formulas, lower-of-two, reductions, exit points | 7798786 |
| BoI average rates (early-repayment) files mashfix/pribmash, buckets | 7798786, 67469313 §6 |
| BoI aggregate rates (BIR_MRTG_99), per-bank "קו המשווה" (effective rates) | 67469313 §4–5, 7831553 |
| Expected inflation = (1+nom)/(1+real) − 1 | 7831553, 7503881 |
| Prime vs policy rate; manual prime update; reset intervals by bank | 67436545 Q4, Q5, Q15 + appendix |
| Income recognition (net, /12, statuses) | 67436545 Q6 |
| LLM never computes | 16515075, 28901456 |

---

## Pages seen but not read (links)

- 16875545 — The case model assumes up to four banks in parallel
- 33718276 — A figure that contradicts what the client told us is not sent to a bank without asking the client
- 22151169 — The advisor system and capture design — direction for grilling — Aug 2026
- 8650753 — When the Israeli banking system is open — Aug 2026
- 16908289 — Open banking is out of version one
- 20938753 — Technology and data feeds (research index)
- 7110667 — J-090 · Data — mix construction and calculator
- 6455359 — J-080 · Pre-approval dashboard (הצגת אישורים עקרוניים)
- 6455385 — J-080 · Choices and costs — pre-approval dashboard
- 5373953 — Journey
- 5603338 — Building the Journey docs — session plan and templates (Runbook)
- 6029348 — Working through the banks' advisor channels — Aug 2026 (Research)
- 4489217 — 2026-07-29 meeting notes (פגישת הצגת הרעיון: מיזם המשכנתאות)
- 45154305 — The engine and the reader are one Python package served as two private FastAPI apps
- 29491201 — The engine and the document reader answer over HTTP and never touch the database
- Linear: ENG-222, ENG-275, ENG-276, ENG-27, ENG-52, ENG-50, ENG-51, ENG-226, ENG-230 (titles only)
- External primary sources cited (not opened): Directive 329 + Circular 2852 PDF (https://www.boi.org.il/media/hjrlkrse/h2852.pdf); BoI income-recognition clarifications (https://www.boi.org.il/media/emunmobp/202601.pdf); BoI yield page; BoI qawebsite API docs; CBS API guide; BoI series guide edge_guide_he.pdf; bank catalogues listed in the 67436545 appendix. Not read: the Supervisor's Q&A file for Directive 329 (flagged as unread by the Brain itself).
