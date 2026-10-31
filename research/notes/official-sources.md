# Official sources: mortgage regulation and data (Israel)

Checked on 2026-10-09 for the Hebrew mortgage course. Primary sources only.

## Read this first: how the sources were reached

**No primary document was opened directly in this session.** The session's network egress policy blocks every primary domain. Direct fetches failed with these errors:

- `curl` to boi.org.il, www.boi.org.il, cbs.gov.il, gov.il, knesset.gov.il (main/fs), nevo.co.il, isa.gov.il, mof.gov.il, moch.gov.il, btl.gov.il, data.gov.il and he.wikisource.org returned `curl: (56) CONNECT tunnel failed, response 403`. The proxy status endpoint recorded it as "gateway answered 403 to CONNECT (policy denial or upstream failure)" for `www.boi.org.il:443`. Even example.com was refused, so this is an allowlist, not a block aimed at these sites.
- `WebFetch` returned `{"error_type":"EGRESS_BLOCKED","domain":"<host>","message":"Access to <host> is blocked by the network egress proxy."}` for www.boi.org.il, boi.org.il, www.cbs.gov.il, www.gov.il, main.knesset.gov.il, fs.knesset.gov.il, www.nevo.co.il, www.isa.gov.il and he.wikisource.org. For web.archive.org it returned "Claude Code is unable to fetch from web.archive.org".
- So no PDF was downloaded and `pdftotext` was never run. The scratch folder `/tmp/claude-0/.../scratchpad/official/` is empty.

**What was used instead:** web search restricted to the primary domains (`allowed_domains` = boi.org.il, cbs.gov.il, gov.il, knesset.gov.il). Search gives the URL and title of each official document, plus a summary built by the search tool from its index of that document. Every fact below comes from those summaries. They are **second-hand readings of primary documents**. Several summaries said the PDF text in the index was jumbled, which is common with Hebrew right-to-left extraction. Treat every number as **"found in an index summary of the official document; to be checked against the PDF"** until someone opens the document.

Confidence labels used below:
- **[consistent]**: the same fact came back from two or more independent searches, or from both a Hebrew and an English BoI page.
- **[single]**: one search summary only.
- **[conflict]**: the summaries disagree; both readings are given.

News sites (Calcalist, TheMarker, Bizportal, nadlancenter, kikar, klikatnadlan, bizzness) appeared in one unrestricted search. They were used **only** to find out that a mortgage-advisory bill exists. No fact in this file rests on them alone, and each place they matter is marked.

## Access log

| # | Item | Primary URL | Direct access | Reached via | Result |
|---|------|-------------|---------------|-------------|--------|
| 1 | Circular 2852 | https://www.boi.org.il/media/hjrlkrse/h2852.pdf | No: curl 403 CONNECT; WebFetch EGRESS_BLOCKED | Search (BoI domain) | **Not found in any index.** Contents unknown. |
| 1 | Directive 329 page | https://boi.org.il/roles/supervisionregulation/nbt/nbt329/ | No | Search | Indexed: current document = circular 2840; page updated 2026-06-01 |
| 1 | Directive 329 v12 (02/26) | https://www.boi.org.il/media/brep4lzt/329_12.pdf | No | Search | Indexed; text jumbled in index |
| 1 | Circular 2840 | https://www.boi.org.il/media/ptciib1v/h2840.pdf | No | Search | Indexed; dated כ"א בשבט תשפ"ו (about 2026-02-08) |
| 1 | Directive 329 v11 (04/25) | https://www.boi.org.il/media/wwsosyxf/329_11.pdf | No | Search | Indexed |
| 1 | Directive 329, English (12/21) | https://boi.org.il/media/uckpqztg/329_et.pdf | No | Search | Indexed |
| 1 | Press release 2025-12-16 (Hebrew / English) | https://www.boi.org.il/publications/pressreleases/16-12-25/ ; https://www.boi.org.il/en/communication-and-publications/press-releases/the-banking-supervision-department-takes-several-steps-in-the-housing-credit-market/ | No | Search | Indexed |
| 1 | Bullet/balloon temporary directive, press release 2025-03-23 | https://www.boi.org.il/publications/pressreleases/23-3-25/ | No | Search | Indexed |
| 2 | Directive 451 page | https://www.boi.org.il/roles/supervisionregulation/nbt/nbt451/ | No | Search | Page itself not returned; the PDFs were |
| 2 | Directive 451 v22 (7/23) | https://www.boi.org.il/media/utld2tgp/451.pdf | No | Search | Indexed |
| 2 | Circular 2755 (2023-07-19) | https://boi.org.il/roles/supervisionregulation/circulars/cir2755/ | No | Search | Indexed |
| 2 | Temporary directive 253 v2 (04/26), circular 2846 | https://www.boi.org.il/media/dzmblwop/253_2.pdf ; https://boi.org.il/roles/supervisionregulation/circulars/cir2846/ | No | Search | Indexed; amends 451 deadlines |
| 3 | Yields page | https://www.boi.org.il/roles/statistics/makamandbonds/yield/ | No | Search | Hebrew page not returned; English counterpart returned |
| 4 | Average mortgage rates | https://www.boi.org.il/information/interestrates/mortgage/ | No | Search | Hebrew page not returned; English "Interest Rate Comparisons—Housing Loans" returned; **no figures** |
| 4/5 | Publication dates of the average rate for early repayment, 2026 | https://www.boi.org.il/roles/supervisionregulation/מועדי-ההודעות-על-הריבית-הממוצעת-על-משכנתאות/ | No | Search | Indexed (dates only) |
| 5 | Banking Order (Early Repayment of a Housing Loan), 2002 | https://www.boi.org.il/media/qy5cow0l/116.pdf | No | Search | Indexed; text jumbled |
| 6 | Policy-rate decisions 2026 | https://www.boi.org.il/en/communication-and-publications/press-releases/01-9-26-en/ (and the others listed in item 6) | No | Search | Indexed |
| 6 | Interest-rate decision dates 2026 | https://www.boi.org.il/en/economic-roles/monetary-policy/interest-rate-announcement-dates-2026/ | No | Search | Indexed |
| 7 | CPI August 2026 | https://www.cbs.gov.il/he/mediarelease/Madad/Pages/2026/מדד-המחירים-לצרכן-אוגוסט-2026.aspx | No | Search | Indexed |
| 7 | CBS release calendar | https://www.cbs.gov.il/en/Pages/Release-Calendar.aspx | No | Search | Indexed |
| 8 | Directive 329A (mortgage advisors) | https://www.boi.org.il/roles/supervisionregulation/nbt/nbt329a/ ; https://boi.org.il/media/ncchosn3/329a.pdf | No | Search | Indexed |
| 8 | Knesset Economic Committee background paper on the bill | https://fs.knesset.gov.il/25/Committees/25_cs_bg_12957754.pdf | No | Search | Indexed |
| 8 | Election date for the 26th Knesset | https://www.gov.il/he/departments/news/knesset26-date | No | Search | Indexed |
| 9 | Ministry of Construction and Housing mortgage guide | https://www.gov.il/he/departments/guides/mortgage_guide | No | Search | Title and URL only; no contents returned |
| 9 | BoI mortgage reform explainer | https://www.boi.org.il/information/bank-paymnts/financial-education/competition-in-mortgages/ | No | Search | Indexed |
| 10 | Credit Data Law (Ministry of Justice page) | https://www.gov.il/he/departments/general/2016-19 | No | Search | Indexed |
| 10 | BoI credit data campaign page | https://www.boi.org.il/information/bank-paymnts/financial-education/campains/נתוני-אשראי-הקרדיט-שמגיע-לך/ | No | Search | Indexed |

---

## 1. Directive 329, Limitations on Issuing Housing Loans (מגבלות למתן הלוואות לדיור), and circular 2852

**URLs**
- Directive page: https://boi.org.il/roles/supervisionregulation/nbt/nbt329/
- Circular 2852, as given in the task: https://www.boi.org.il/media/hjrlkrse/h2852.pdf. **Not reachable, and absent from every search index.**
- Latest consolidated text found: v12, marked (02/26): https://www.boi.org.il/media/brep4lzt/329_12.pdf
- Circular 2840: https://www.boi.org.il/media/ptciib1v/h2840.pdf
- v11 (04/25): https://www.boi.org.il/media/wwsosyxf/329_11.pdf
- English, v10 (12/21): https://boi.org.il/media/uckpqztg/329_et.pdf
- Circular 2647 (December 2020, removal of the prime limit): https://boi.org.il/media/g1wmit2z/h2647.pdf

**Access:** none directly. Content comes from index summaries.

**Versions and dates**
- **Latest version found: v12, marked (02/26), issued with circular 2840.** The circular is dated כ"א בשבט תשפ"ו. One summary gives the publication date on the directive page as 08/02/2026. [consistent]
- One summary says the directive page shows "last updated 1 June 2026" and lists circular 2840 as the current document. Its version table still shows v11 / circular 2816 at the top. [single]
- **Circular 2852 could not be identified.** The nearest circular found is 2851, dated ו' בתמוז תשפ"ו (2026-06-21). It concerns customer-service fees, not Directive 329. If 2852 exists, it was most likely published after 2026-06-21 and after the search index was built. **Whether 2852 amends Directive 329, and what it says, is unknown.**

**The current limits (as summarised from v10–v12 and the English text)**

| Rule | Value | Confidence |
|---|---|---|
| LTV, single dwelling (דירה יחידה) | ≤ 75% | [consistent] (Hebrew v11/v12 summaries + English 329_et) |
| LTV, replacement dwelling (דירה חליפית) | ≤ 70% | [consistent] |
| LTV, investment dwelling (דירה להשקעה), also for a foreign resident who is not an Israeli citizen | ≤ 50% | [consistent] |
| PTI cap (שיעור החזר מהכנסה) | A bank "לא יאשר ולא יבצע" a housing loan with PTI > 50% | [consistent] |
| PTI risk-weight threshold | PTI > 40% → 100% risk weight under Directive 203 (a capital rule, not a ban) | [consistent] |
| Variable-rate share | ≤ two-thirds (66.66%) of the loan, so at least one-third must be fixed-rate | [consistent] |
| Prime-share limit (formerly ≤ one-third) | **Removed** in December 2020 (circular 2647) | [consistent] |
| Maximum term | 30 years to final repayment | [consistent] |
| LTV cap applies to the total | Includes loans from other banking corporations on the same property | [single] |

Quotes as returned in the summaries (from the index, not checked against the PDF):
- «תאגיד בנקאי לא יאשר ולא יבצע הלוואה לדיור ... כאשר שיעור ההחזר מהכנסה עולה על 50%»
- «לא יאשר ולא יבצע הלוואה לדיור עם תקופה לפירעון סופי העולה על 30 שנים»
- On the variable-rate limits before 2020: «הראשונה קבעה שחלקה של ההלוואה בריבית פריים לא יעלה על שליש מסך ההלוואה, והשנייה קבעה שחלקה הכולל של ההלוואה בריבית משתנה לא יעלה על שני שלישים». The BoI press release says the second limit stayed in force: «לפחות שליש מהלוואה לדיור תינתן בריבית קבועה».
- PTI definition: «"שיעור החזר מהכנסה" — היחס בין ההחזר החודשי ובין ההכנסה החודשית הפנויה».

**Reduced-price dwellings (דירה במחיר מופחת): מחיר למשתכן, מחיר מטרה, דירה בהנחה**
- The directive defines a reduced-price dwelling as one bought in a project with a land discount, such as "מחיר מטרה" and "מחיר למשתכן". The definition applies whatever the project's marketing date. [single]
- For these dwellings the bank may base the property value on an appraiser's valuation at loan approval rather than the discounted price. That valuation is capped by a maximum property value in section 4א(2). [consistent]
- The 16 Dec 2025 measures link that cap to the CPI. The new cap amount was **not** in any summary. [consistent]
- Background: a 2018 update let "upgraders" (משפרי דיור) in some areas enter the מחיר למשתכן lotteries, and the directive's definitions were adjusted to match. [single]

**Changes in 2025–2026**
1. **Bullet and balloon loans with developer subsidy (temporary directive, press release 2025-03-23, linked to circular 2816 / v11 (04/25)).** It limits sales with deferred payment that are financed by bullet or balloon loans. One summary gives a limit of "no more than 10% of monthly housing-loan originations" for developer-subsidised bullet or balloon loans. **It runs until 2026-12-31.** [single for the 10%; consistent for the end-2026 term]
2. **Press release of 16 Dec 2025, "הפיקוח על הבנקים נוקט מספר צעדים בתחום שוק האשראי לדיור"**, with a draft temporary directive for comment (draft PDF https://www.boi.org.il/media/141cr3bf/111581.pdf, dated כ"ו בכסלו תשפ"ו):
   - **PTI on an additional loan:** when a borrower takes a further housing loan secured on the same property, PTI is measured on the monthly payment for **all** credit secured by that property. Quote from the summary: «יש לבחון את ההחזר החודשי בגין סך האשראי המובטח באותו נכס». Stated reason: «חלה עליה בנטילת תוספות אשראי לדיור, בפרט בסמוך למועד לקיחת המשכנתא הראשונה». [consistent]
   - **Reduced-price LTV cap** (section 4א(2)) is linked to the CPI. [consistent]
   - **"All-purpose" loan relief (הלוואה לכל מטרה) made permanent.** This was wartime relief from temporary directive 251 (2023–24). **[conflict]** The Hebrew summary reads: LTV up to 70%, provided the part above 50% LTV is capped at NIS 200,000. The English summary reads: "even if the LTV exceeds 70 percent, provided that the portion ... that exceeds an LTV of 50 percent does not exceed NIS 200,000". The base rule for an all-purpose loan is 50% LTV, so the Hebrew reading (50% → up to 70%, excess ≤ NIS 200k) is the likelier one. **Check the PDF.**
   - One summary says the v12 (02/26) text already contains the PTI clarification. So the December 2025 draft was probably adopted through circular 2840. [single; inferred]
3. **Wartime temporary directive for "שאגת הארי"** (the operation began 2026-02-28). Circular 2823 of 2026-03-02 (https://www.boi.org.il/media/hn5hpmkt/111589.pdf), then temporary directive 253 v2 by circular 2846 of 2026-04-30. See item 2 for what it changes in Directive 451. **No summary mentioned an LTV, PTI or variable-share relief under Directive 329 in 2026.** [single]

**Not verified for item 1**
- What circular 2852 is.
- The exact v12 wording of the all-purpose relief (the 70% / NIS 200k conflict above).
- The CPI-linked cap amount for reduced-price dwellings.
- The 10% bullet/balloon figure.
- Whether any 2026 temporary relief touches the 329 limits.
- The exact effective date of v12.

---

## 2. Directive 451, Procedures for Extending Housing Loans (נהלים למתן הלוואות לדיור)

**URLs**
- Page: https://www.boi.org.il/roles/supervisionregulation/nbt/nbt451/ (not returned by search)
- **Latest full text found: v22, marked (7/23)**: https://www.boi.org.il/media/utld2tgp/451.pdf. Earlier versions: v21 (7/22) https://www.boi.org.il/media/tjnn5ini/451.pdf and v20 (1/22) https://www.boi.org.il/media/ptchkgxk/451-1-1.pdf
- Circular 2755, "עדכון מיום 19/07/23": https://boi.org.il/roles/supervisionregulation/circulars/cir2755/
- Temporary directive 253 v2 (26/04), circular 2846, published 2026-04-30: https://www.boi.org.il/media/dzmblwop/253_2.pdf

**Access:** none directly.

**Latest version:** v22, from circular 2755 of **2023-07-19**. No later permanent amendment to 451 was found. [consistent across three searches] A temporary change applies through Directive 253 (April 2026), described below.

**Uniform baskets (סלים אחידים, Appendix 5 / תוספת 5)**
- The pre-approval (אישור עקרוני) must include a mix tailored to the applicant **and** the uniform mixes in Appendix 5. The v22 summary shows "אישור עקרוני עם סל אחיד 1, סל אחיד 2, סל אחיד 3". The bank may add a basket built to the customer's request. [consistent]
- Uniform baskets are not required for an all-purpose loan secured on a home (not for buying it). [single]
- **Basket composition**, from the BoI English reform explainer and a fragment of the 451 index: "100 percent fixed unindexed, or 1/3 fixed unindexed, 1/3 variable indexed every five years based on government bonds, and 1/3 variable prime". The index fragment of the 2023 version reads «צמודה 33.3% 100% 50% משתנה פריים 50% 33.3% משתנה כל 5 שנים על בסיס אג"ח ממשלתי 33.3%», which is jumbled. **Basket 3's exact composition (probably ½ prime + ½ another track) could not be read.** [conflict / incomplete]
- Circular 2755 (2023) mainly addressed early repayment and refinancing. Whether it changed the baskets is unverified.

**Comparison figures in the pre-approval** (from the BoI reform explainer and the 451 index)
- «הריבית הכוללת החזויה». Per 451 this is the actual cost of credit as under the Fair Credit Law (חוק אשראי הוגן): a monthly internal rate of return converted to an annual rate, including forecasts for variable tracks. Formula in **Appendix 4 (תוספת 4)**. [consistent]
- «סך כל הסכום הצפוי החזוי שישולם עד לסוף תקופת ההלוואה» (total forecast amount to be paid). Formula in Appendix 4. [consistent]
- **The first monthly payment** and **«ההחזר החודשי הגבוה ביותר הצפוי לפי התחזיות»** (the highest expected monthly payment by the forecasts). [consistent]
- So the course's three comparison figures are **total forecast interest rate, total forecast payments, and highest forecast monthly payment**, plus the first payment.
- Forecast mechanics: a PMT series is computed for each sub-loan, with expected payments per month based on the forecast anchors. For variable-rate loans that have no forecasts, the figure is not shown or is computed without forecasts: «במקרה של הלוואות בריבית משתנה, שאין להן תחזיות, לא יוצג הנתון...». [single]
- Refinancing test: if the borrower's «שיעור הריבית לצרכי השוואה» on the existing loan is higher than the new offer's «שיעור הריבית הכוללת החזויה», refinancing is economically worthwhile. [single]

**Pre-approval process (v22)**
- The bank must let an applicant ask for and receive a pre-approval online and by phone. Property insurance must be offered in a separate document. [single]
- BoI consumer material says the pre-approval is due within **5–7 business days** of the application. [single]
- There is a 90-day window measured from the property appraisal, and a valuer list in the pre-approval. [single; fragment]

**Early repayment information and the "מידע על הלוואה" disclosure (v22 / circular 2755)**
- On request, the bank gives in writing the information needed to judge early repayment: the balance by component, the current early-repayment fees and, **added in 2023**, the forecast amount still to be paid to the end of the loan or to the next rate change. The same must be shown on the bank's website or app. [single]
- After early repayment: written confirmation; for a full repayment, a payoff certificate within **5 business days**. The borrower is told they can ask the insurer to cut cover and can cancel the lien. A surplus may not be used to prepay a different loan without explicit written consent. A partial prepayment shortens the term unless the borrower chooses lower payments. [single]
- The exact name and layout of the "מידע על הלוואה" form section were **not** returned.

**Temporary directive 253 v2 (April 2026, operation "שאגת הארי")**
- Added to 451 section 4(ג): the bank shall consider extending pre-approvals that were valid on the day the operation began. [single]
- Section 15ב(ה): "three business days" becomes "eight business days". A further deadline in section 11 is changed; one summary reads "fourteen days → eight business days, seven days → ten days". [conflict, jumbled text]
- Loans to 2+ borrowers: a borrower who cannot sign because of the operation need not sign, if the client's documented consent and identification are obtained. [single]
- End date: not found.

**Not verified for item 2:** the exact basket compositions; the Appendix 4 formula text; the forecast assumptions (which curve, which inflation expectation); the exact 253 deadline changes and end date; whether a post-2023 permanent version of 451 exists.

---

## 3. BoI yields and forecast data (`/roles/statistics/makamandbonds/yield/`)

**URL:** https://www.boi.org.il/roles/statistics/makamandbonds/yield/. Not returned by search. English counterpart: https://boi.org.il/en/economic-roles/statistics/bonds-and-central-bank-bills-makam/bonds-and-central-bank-bills-makam-yields-to-maturity/

**Access:** none directly.

**What is published** (English page summary) [single]:
- Data on MAKAM (central bank bills) and on government and corporate bonds, from Tel Aviv Stock Exchange trading.
- Yield-to-maturity curves for MAKAM and government bonds, zero-coupon curves, and corporate-bond spreads.
- MAKAM auction results (closing and average yields). Latest seen: the **2026-03-31 auction**, series 417 (matures April 2027), closing yield **3.90%**.
- An older press release, "בנק ישראל מפרסם עקומי תשואות של איגרות חוב ממשלתיות" (about 2011), says the curves come from a BoI method using TASE bonds and were published **twice a month, as a calendar average and as an index average**. Current frequency unverified.
- Inflation expectations from the capital market are computed as the gap between unindexed ("שחר") and CPI-indexed ("גליל") government-bond yields of the same term, and include a risk premium. [single]

**Link to 451:** the BoI housing-loan comparison page says its portfolio IRRs are computed "according to the formula defined in Directive 451", using **yield curves as of the end of the publication month**. Bullet, balloon and foreign-currency loans are excluded, and the change period for non-prime variable loans is set at five years. [single]

**Not verified:** whether this page is the one 451 names as the forecast source; the current publishing frequency (daily or twice-monthly); whether it publishes an explicit "forecast" series for 451.

---

## 4. Average mortgage interest rates (`/information/interestrates/mortgage/`)

**URL:** https://www.boi.org.il/information/interestrates/mortgage/. Not returned by search. Related pages:
- English "Interest Rate Comparisons—Housing Loans": https://www.boi.org.il/en/information-and-service-to-the-public/interest-rates-and-early-repayment-fees/interest-rate-comparisons-housing-loans/
- 2026 publication dates of the average rate used for early-repayment fees: https://www.boi.org.il/roles/supervisionregulation/מועדי-ההודעות-על-הריבית-הממוצעת-על-משכנתאות/
- Housing-credit statistics: https://boi.org.il/roles/statistics/banking/housing_cred/

**Access:** none directly. **No 2026 figures were obtained.**

**What is known** [single each]:
- The comparison page reports, per bank and month, the portfolio mix, the IRR on each track, and a portfolio-wide figure computed by Banking Supervision. These are portfolio averages, not rates on loans granted that month.
- A separate monthly series gives the **average effective rate on CPI-indexed housing loans by remaining term**. The early-repayment fee is computed from it. The 2026 schedule page lists, for each month from the report for 31 January to the report for 31 December, a reporting date, a reporting deadline and a publication date. The dates themselves were not returned.
- Monthly housing-credit statistics give a breakdown by rate type.

**Not verified:** the latest data month and the values by track; the exact publication day.

---

## 5. Early repayment fee: the Banking Order (Early Repayment of a Housing Loan), 2002

**URL:** https://www.boi.org.il/media/qy5cow0l/116.pdf, titled «צו הבנקאות (פירעון מוקדם של הלוואה לדיור), התשס"ב-2002». Related BoI press releases are «תיקון לצו הבנקאות - עמלת פרעון מוקדם» and «הפיקוח על הבנקים: יש לגבות רק עמלה תפעולית אחת...».

**Access:** none directly. The index says the PDF text is jumbled.

**Dates:** in force from **2002-11-01 (כ"ו בחשון התשס"ג)**. It replaced the 1981 order (צו הבנקאות (עמלות פירעון מוקדם), התשמ"ב-1981). The consolidated text on the BoI site includes **an amendment of 2014 (התשע"ד-2014), in force 2015-02-23**. [consistent for 2002; single for the 2014 date]

**Fee components** [single unless marked]:
1. **Operational fee (עמלה תפעולית):** a fixed amount, **NIS 60 at most** («העומדת כיום לאחר התיקון על 60 ש"ח»). A BoI press release says **only one** operational fee may be charged per prepayment, even when the loan has several tracks. [consistent]
2. **Fee for not giving advance notice (עמלה בגין אי מתן הודעה מוקדמת):** notice of at least **10 days**, and no more than **45 days** before the chosen date («לא תינתן הודעה מוקדמת יותר מ-45 ימים לפני המועד שקבע הלווה»). The fee is **0.1%** of the amount repaid (down from 1%). When the prepayment falls on a rate-change date, this fee is not charged; that rule was seen for non-housing loans and is unconfirmed for housing loans.
3. **Discounting fee / interest-rate differential (עמלת היוון / הפרשי היוון):** the difference between the loan's contract rate and the average rate known on the repayment day for the remaining term. The Supervisor sets how it is computed. BoI worked example: balance NIS 500,000, loan rate 5%, average rate 4% → fee **NIS 23,805**.
   - **Reductions by loan age [conflict]:** one summary gives 20% off if repaid after 3 to under 5 years, and 30% off after 5 years or more (section 3(4)). Another fragment shows a table of **20% / 30% / 40%** reductions at **2 / 3 / 4 years**, possibly for CPI-indexed loans; the text is jumbled. A third gives "after five years 20% ... or more 30%". **Check the PDF before teaching numbers.**
   - **Variable rate:** for loans whose rate-change dates are unknown in advance, or occur once a year or more often, no discounting fee is charged (2002 text). For shekel variable-rate loans, the rate for the discounting component is the latest published average rate known on the repayment day, for the period to the next rate change. [single]
4. **Average CPI differentials (הפרשי הצמדה ממוצעים) on CPI-indexed loans:** one summary mentions a charge tied to repaying between the 1st and the 15th of the month on an indexed loan. The exact rule (that the borrower pays the average indexation differential when repaying before the new CPI is published) **was not readable**. [single; incomplete]
5. **Exemptions:** no fee on the **borrower's death** (in the consolidated text). **Eligibility loans** (הלוואות זכאות) are exempt from early-repayment fees (BoI explainer + Knesset Research Center). [consistent]

**Proposed amendment (around 2013):** BoI proposed removing the borrower's risk premium from the discounting fee by comparing with the average rate as it was **at the loan date** rather than the loan's own rate. Whether it was adopted, and whether it is the 2014 amendment, is **unverified**.

**Not verified:** the exact reduction schedule; the exact CPI-differential rule; the full text of the 2014 amendment; any change in 2015–2026.

---

## 6. Bank of Israel interest rate and prime

**URLs** (all BoI, all indexed, none opened):
- 2026-09-01 decision: https://www.boi.org.il/en/communication-and-publications/press-releases/01-9-26-en/
- 2026-07-06: https://www.boi.org.il/en/communication-and-publications/press-releases/the-monetary-committee-decides-on-july-6-2026-to-lower-the-interest-rate-to-35-percent/
- 2026-03-30: https://www.boi.org.il/publications/pressreleases/30-3-26/
- 2026-02-23: https://www.boi.org.il/publications/pressreleases/23-2-26/
- 2026-01-05: https://www.boi.org.il/en/communication-and-publications/press-releases/5-1-25-en/
- Decision dates 2026: https://www.boi.org.il/en/economic-roles/monetary-policy/interest-rate-announcement-dates-2026/
- Monetary tools page: https://www.boi.org.il/roles/markets/monetarytools/

**Current rate: 3.25%**, decided **2026-09-01**: «הוועדה המוניטרית החליטה ב-01/09/2026 להוריד את הריבית ב-0.25% לרמה של 3.25%». **Effective 2026-09-03.** [consistent]

**Path in 2026** [consistent unless marked]:
- 2025-11-24 → 4.25%
- 2026-01-05 → 4.00%
- 2026-02-23: held at 4.00%
- 2026-03-30: held at 4.00%
- 2026-05-25 → 3.75% (from a homepage headline) [single]
- 2026-07-06 → 3.50%
- 2026-09-01 → 3.25%

**Decision schedule 2026:** 5 Jan, 23 Feb, 30 Mar, 25 May, 6 Jul, 31 Aug (published 1 Sep), 21 Oct, 23 Nov. Eight decisions. "Changes in these dates are possible and will be announced." **Next decision: 2026-10-21**, which the monetary-tools page also shows. [consistent for 21 Oct; single for the full list] One English summary garbled the August/October relationship; the Hebrew summary is clear.

**Prime = BoI rate + 1.5 percentage points.** BoI consumer explainer (mortgage reform page): «ריבית בנק ישראל ... ולה מתווספים 1.5%». BoI's own example: «אם ריבית בנק ישראל היא 1%, ריבית הפריים תהיה 2.5%». [consistent] So prime is **4.75%** from 2026-09-03. That figure is arithmetic; no BoI page stating "4.75%" was found.

**Context from the 1 Sep release** [single]: inflation was below the midpoint of the 1–3% target range; uncertainty was high because of geopolitical tensions.

---

## 7. CBS Consumer Price Index (מדד המחירים לצרכן)

**URLs** (indexed, not opened):
- August 2026 release: https://www.cbs.gov.il/he/mediarelease/Madad/Pages/2026/מדד-המחירים-לצרכן-אוגוסט-2026.aspx
- Release calendar: https://www.cbs.gov.il/en/Pages/Release-Calendar.aspx
- Definition: https://www.cbs.gov.il/he/publications/madad/doclib/2024/price09a/a1_1_h.pdf
- Housing component: https://www.cbs.gov.il/he/Events/DocLib/kenes/binui_indicators.pdf

**Who publishes:** the Central Bureau of Statistics (הלשכה המרכזית לסטטיסטיקה).

**When:** on the **15th of the month at 18:30**, for the previous month. If the 15th is a Friday, Saturday, holiday or holiday eve, the release comes on the Friday or eve at **14:00**. Example: the July 2026 CPI came out on 2026-08-14, because 15 August was a Saturday. [consistent]

**What it measures** [consistent]: «אחוז השינוי החל במשך הזמן בהוצאה הדרושה לקניית סל קבוע של מצרכים ושירותים», a fixed basket representing average household consumption. Weights come from the household expenditure survey. The basket has ten main groups: food; fruit and vegetables; housing; dwelling maintenance; furniture and household equipment; clothing and footwear; health; education, culture and entertainment; transport and communications; miscellaneous. **Housing** is the largest weight (25.0% in the 2017 basket; current weight unverified). It is measured through rents and the owner-occupied rental-equivalent. **House prices have not been part of the CPI since January 1999**; CBS publishes them separately as the dwelling price index.

**Latest published: August 2026**, released 2026-09-15 [single]:
- **+0.7%** month on month, index level **105.8** (base: 2024 average = 100)
- **+2.1%** since the start of the year
- **+1.5%** over 12 months
- Seasonally adjusted: +0.3%
- Notable rises: fresh vegetables +2.9%, transport +2.7%, housing +0.6%
- Notable falls: fresh fruit −2.0%, clothing −0.8%

**Next:** the September 2026 CPI is expected on **2026-10-15** at 18:30. That date follows from the rule; it was not seen on the calendar.

**Not verified:** the August figures need a direct read before they are quoted in the course; the current housing weight.

**Checked against the CBS open-data API, 2026-10-31** (api.cbs.gov.il reachable; www.cbs.gov.il pages and the definition PDF still could not be read: plain requests got an empty reply or JS-only shells, and the site refused the automated browser):
- Series 120010 (CPI general): base «2024 ממוצע». **Confirmed: base 2024 average = 100.** Latest values: Sep 2026 105.3 (−0.5% m/m, +1.6% y/y); Aug 2026 105.8 (+0.7%, +1.5% y/y), matching the summary above; Jul 2026 105.1.
- Catalog subject 37 («לפי קבוצות צריכה ראשיות»): food excl. fruit and vegetables; fruit and vegetables; housing; dwelling maintenance; furniture and household equipment; clothing and footwear; health; education, culture and entertainment; transport and communication; miscellaneous (plus a "food incl. fruit and vegetables" aggregate). **Confirmed: ten main groups.**
- Definition PDF (a1_1_h.pdf), supplied by the user 2026-10-31: one page, "1.1 הגדרת מדד המחירים לצרכן", created 2023-02-21. **Confirmed:** the fixed-basket definition (quoted in the lesson) and that the basket is set from the household expenditure survey (2021 survey, base 2022 in that version, now superseded by base 2024 per the API). It says nothing on release times, rent or the 1999 exclusion.
- The September 2026 CPI is published (it is in the series); its exact release date, the 15th/18:30 rule, the 14:00 early-release rule, rent-based housing and the 1999 exclusion remain unverified. The English release calendar (Release-Calendar.aspx) and the September 2026 press release answer with a page that fills in by JavaScript, so their content could not be read from here.

---

## 8. Licensing of paid mortgage advisory

**Short answer, as of 2026-10-09:** paid mortgage advisory in Israel is **not licensed by law**. Nothing primary was found showing a law had been passed. A private bill to regulate it was in the Knesset Economic Committee in 2025–2026. **The Knesset's term ends with elections on 2026-10-27**, so as far as can be seen the bill did not become law.

**A. Bank of Israel: Directive 329A, "יועצי משכנתאות" (Mortgage Advisors)**
- URL: https://www.boi.org.il/roles/supervisionregulation/nbt/nbt329a/, PDF https://boi.org.il/media/ncchosn3/329a.pdf (v1, 09/17).
- **Published 2017-09-13**, classed as stability regulation. [consistent]
- It regulates **the banks' conduct toward advisors**, not the advisors:
  - «יועץ משכנתאות אינו חייב ברישיון ופעילותו אינה מפוקחת ועל כן כמעט כל אחד יכול להיות [יועץ]» (contrasted with investment advisors, who are licensed).
  - The bank must treat the advisor as the **client's agent**, owing the client a fiduciary duty: «היועץ הוא שלוח של הלקוח ועל כן הוא חב בחובת הנאמנות כלפי הלקוח».
  - The bank «לא יסרב לפעול מול נציג הלקוח, בשום שלב בתהליך לקיחת הלוואה לדיור ובכל ערוץ».
  - The bank **may not pay the advisor or give them benefits**, directly or indirectly.
  - Purpose: to reduce risks, fraud in particular.
- Whether 329A was amended after 2017: unverified.

**B. The bill: «הצעת חוק הסדרת העיסוק בייעוץ משכנתאות, התשפ"ה-2025»**
- Primary: Knesset Economic Committee background document https://fs.knesset.gov.il/25/Committees/25_cs_bg_12957754.pdf, a letter dated **May 2026** from the Israel Chamber of Independent Organizations and Businesses (לשכת העצמאים). It supports the bill and asks the committee to prepare it for **first reading** in the coming session, «לאור החשש מפיזור הכנסת והליכה למערכת בחירות בתקופה הקרובה». [single]
- **From news only (not primary; used only to locate the bill):** TheMarker (2026-05-26) and others report the committee approved it for first reading on **2026-05-26**. Reported contents: professional entry conditions and ethics rules; licensing exams; a register (פנקס); a fine for practising without registration or in a conflict of interest; fine or prison for impersonating an advisor; supervision by **the Registrar in the Ministry of Justice's regulation unit**, enforced by monetary sanctions, with the council chapter dropped; transition rules for practising advisors. News also says Bank of Israel representatives supported it and BoI asked for budget sources for implementation. Chair: MK David Bitan; sponsor reported as MK Yaakov Asher. **None of this is confirmed in a primary source.** No Knesset protocol, plenary vote or Reshumot (הצעות חוק) publication was found.
- **Elections:** gov.il says elections for the 26th Knesset are on **Tuesday, ט"ז בחשון התשפ"ז (2026-10-27)** (https://www.gov.il/he/departments/news/knesset26-date). Reshumot of 2026-07-16 includes a "חוק הבחירות לכנסת העשרים ושש (הוראות מיוחדות ותיקוני חקיקה), התשפ"ו". A bill not passed in this Knesset lapses unless the next Knesset applies continuity (דין רציפות).

**C. Other regulators** (no rule found on mortgage advisors):
- **Israel Securities Authority:** the investment-advice licensing law (חוק הסדרת העיסוק בייעוץ השקעות..., 1995) covers securities and financial assets, not mortgages. No ISA rule on mortgage advisors was found.
- **Capital Market, Insurance and Savings Authority:** the Regulated Financial Services Law, 2016 (חוק הפיקוח על שירותים פיננסיים (שירותים פיננסיים מוסדרים)) licenses credit provision, financial-asset services, and **operating a credit-intermediation system** (מערכת לתיווך באשראי, i.e. a platform). No source applied it to individual mortgage advisors. **Whether an advisory model that arranges or brokers credit could fall under it is a legal question to put to a lawyer, not settled here.**
- **Ministry of Justice:** besides its reported role as future supervisor under the bill, it runs a comparable regime for real-estate brokers (חוק המתווכים במקרקעין, 1996). That is an analogy only.

**Not verified for item 8:** the committee's first-reading approval, any plenary first reading, the bill's number and text, its status after the Knesset dispersed, and whether the 26th Knesset will apply continuity. Also: BoI's formal position (seen only in news); whether 329A changed after 2017; whether the 2016 Regulated Financial Services Law reaches an advisory business.

---

## 9. Ministry of Construction and Housing eligibility loans, and BoI consumer pages

**URLs**
- Ministry guide: «המדריך לקבלת משכנתא ממשרד הבינוי והשיכון», https://www.gov.il/he/departments/guides/mortgage_guide. Title and URL only; no contents returned.
- Benefits page: https://www.gov.il/he/pages/benefits_in_apartment_funding
- Knesset Research Center review (2023): «תיאור וניתוח תבחינים של הלוואות לדיור לזכאים», https://fs.knesset.gov.il/globaldocs/MMM/6f5797aa-638b-ed11-8151-005056aac6c3/2_6f5797aa-638b-ed11-8151-005056aac6c3_11_20023.pdf
- State Comptroller report, June 2026, "שוק המשכנתאות": https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2026/Economic-Report/2026-Economic-Report-201-Taktzir.pdf (a state source, though not on the list of approved domains)
- BoI and Ministry joint release on refinancing eligibility loans, with a Q&A: https://boi.org.il/media/sczajjys/...

**Eligibility loans (משכנתא לזכאים)** [single, mostly from the Knesset Research Center 2023 and a gov.il fragment]:
- For buying or self-building a home only, not for any purpose; mainly for people without a home (חסרי דירה).
- Applied for through the mortgage bank. The Ministry checks eligibility and issues a **«תעודת זכאות»** (eligibility certificate) stating the type and amount of aid. An older source says it is valid for one year.
- **Rate:** «0.5% פחות מהריבית הממוצעת על משכנתאות צמודות מדד כפי שבנק ישראל מפרסם מדי חודש, אך לא יותר מ-3.0%». The loan is fixed-rate and CPI-indexed; the rate cut from 4% to 3% applies to contracts from 2012-01-01. Term up to **30 years**, at least 10.
- Base amount (2023): **NIS 54,240–161,665**, with additions for some groups and for months of compulsory or national service.
- No early-repayment fee (see item 5).
- The total financing, including the eligibility loan, stays inside the Directive 329 LTV limit of 75%.
- The State Comptroller (June 2026) found eligibility loans have fallen sharply as a share of the average home price. It recommends setting base and maximum amounts with the Ministry of Finance.
- 2026 budget: about NIS 303.8m for grants and interest subsidies.

**Reduced-price programmes (מחיר למשתכן / דירה בהנחה / מחיר מטרה):** their mortgage link is the Directive 329 reduced-price rule in item 1. The appraiser's value may be used for LTV, up to the CPI-linked cap in section 4א(2). No separate mortgage track for these programmes was found.

**BoI consumer explanation** (https://www.boi.org.il/information/bank-paymnts/financial-education/competition-in-mortgages/, "הרפורמה להגברת שקיפות המידע והתחרות במשכנתאות") [consistent]:
- The reform took effect **2022-08-31**.
- The pre-approval is standard across banks: personalised mix + 3 uniform baskets + cost section (total forecast interest rate, first payment, highest forecast payment, total forecast payments).
- Online application.
- Banks must offer simulations and refinancing information on their sites.
- Track definitions: fixed unindexed (קל"צ); fixed indexed; prime (BoI rate + 1.5%); variable indexed or unindexed, reset usually every 5 years on a government-bond anchor.
- BoI's comparison tool is called «קו המשווה». It also warns that an initial rate discount is less important than the rate over the whole life of the loan.
- No BoI page titled «המדריך למשכנתאות» or «משכנתא – מה חשוב לדעת» was found; the reform page is the main consumer explainer.

---

## 10. Credit Data Law (חוק נתוני אשראי, התשע"ו-2016) and the credit data system

**URLs**
- Ministry of Justice page: https://www.gov.il/he/departments/general/2016-19
- BoI "five years of the credit data system" (2024-04-10): https://www.boi.org.il/publications/pressreleases/10-4-2024/
- BoI campaign page «נתוני אשראי – הקרדיט שמגיע לך»: https://www.boi.org.il/information/bank-paymnts/financial-education/campains/נתוני-אשראי-הקרדיט-שמגיע-לך/
- Postponed reporting of arrears (2026-03-05): https://www.boi.org.il/publications/pressreleases/5-3-26/
- System website: https://www.creditdata.org.il/ (not tested, likely also blocked); public line *6194

**Access:** none directly.

**Content** [consistent unless marked]:
- The law set up a central **credit data register run by the Bank of Israel**. It collects data on the credit obligations of individuals (Israeli citizens and residents) and on how they meet them. Sources are banks, credit-card companies, non-bank lenders and state authorities. **It went live in April 2019.**
- Flow: BoI collects; **with the client's consent**, it passes data through licensed **credit bureaus** (לשכות אשראי) to lenders and to clients. Quote: «בנק ישראל יאסוף נתוני אשראי ... וימסור אותם – אם הלקוח יהא מעונין בכך – באמצעות לשכות אשראי לנותני אשראי ... וללקוחות עצמם».
- **What a lender sees:** a **credit report** (דוח אשראי) or credit indication produced by a bureau, only with the client's consent. Bureaus can compute a **credit score** with statistical models. A report is out of date **60 days** after receipt. The client may ask BoI not to pass data to a particular lender, a type of lender, or all lenders. [single for the 60 days and the opt-out]
- **What the client sees:** a **«דוח ריכוז נתונים»** (data summary report), free **once a year**. The "regular" version covers the **last three years**. It can be passed to an advisor. A digital client report launched in **May 2023**.
- About **6.8 million** clients in the register (2024).
- 2026: the commissioner for credit data sharing (הממונה על שיתוף נתוני אשראי), named as Eyal Haddad, told sources to **postpone reporting arrears** (press release 2026-03-05, during the operation) so the public had time to settle obligations. A 2026 Economic Arrangements memorandum includes a chapter «טיוב מאגר נתוני אשראי» (status unverified).
- Relevance to a mortgage advisor: with the client's consent, the yearly free data report can be handed to an advisor.

**Not verified:** the exact current fields in the report; the arrears thresholds; the end date of the 2026 postponement; the status of the 2026 amendments.

---

## What a person with normal internet access should check next (in priority order)

1. Open **h2852.pdf** and the Directive 329 page's version table. Confirm what 2852 is and record the latest version and date.
2. Open **329_12.pdf**. Confirm the all-purpose 70% / NIS 200k wording, the reduced-price cap amount, and the PTI-on-additional-loan clause.
3. Open **451.pdf (v22)**, Appendices 4 and 5, for the exact basket compositions and figure names, and **253_2.pdf** for the 2026 deadline changes and end date.
4. Open **116.pdf** (Early Repayment Order) for the reduction schedule and the CPI-differential rule.
5. Open the BoI **average mortgage rates** page and record the latest month and values by track.
6. Check the Knesset bill page for «הסדרת העיסוק בייעוץ משכנתאות» for its stage, number and the committee protocol of 2026-05-26.
7. Check the CBS August 2026 CPI release directly before quoting the figures.

<!-- Compiled 2026-10-09 by a research agent. All primary domains were blocked by the session's egress proxy; contents come from search-index summaries of the official documents, restricted to primary domains. -->
