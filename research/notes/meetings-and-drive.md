# Meetings and Drive: field knowledge for the Mogi mortgage course

Research notes, read-only harvest, compiled 2026-10-09. Nothing in Fireflies, Drive or Confluence was shared, moved, retitled, created or modified.

Conventions used below:

- Every claim is labelled **field knowledge — needs Eylon's confirmation** unless it is marked **decision** (something the team decided, not a market fact).
- Deep links use `https://app.fireflies.ai/view/{id}?t={seconds}`.
- "Hebrew" holds the exact wording as it appears in the Fireflies transcript where it was captured. Where only the gist was retained during reading, the entry says **paraphrase (verbatim not captured)**. Re-open the link to quote it.
- Fireflies transcripts of Hebrew speech carry transcription errors, and speaker labels are often wrong (see Quality issues). The speaker given is the person who is talking in substance, with the Fireflies label noted when it differs.
- Personal data of real clients (names, amounts tied to a person, family details) is deliberately left out. Two meetings (2026-09-16) are real client conversations; only anonymised technique is recorded from them.

---

## 1. Access log

| Source | Tool | Result |
|---|---|---|
| Fireflies list | `mcp__Fireflies__fireflies_get_transcripts` (paged with skip; also tried mine:false and participant filters) | Returns only **9** transcripts. Paging past 9 returns nothing. |
| Fireflies by id | `mcp__Fireflies__fireflies_get_transcript` | Works for transcripts **not** in the list. Ten hidden ids were found through Drive meeting summaries and Confluence pages; nine were fetched (one deliberately not fetched, private). |
| Fireflies keyword search | `mcp__Fireflies__fireflies_search` | Run for mortgage terms (משכנתא, אישור עקרוני, ריבית, פריים, מחזור, שמאי, תמהיל, LTV, 451). Hits were only in the listed transcripts; the Hebrew-in-English-mode transcripts produce no usable hits. |
| Plugin servers `edea-fireflies`, `edea-confluence`, `edea-linear` | plugin MCP | **Failed to connect** (proxy 403). The direct `mcp__Fireflies__*` and `mcp__Atlassian_Rovo__*` tools were used instead. |
| Google Drive | `mcp__Google_Drive__search_files`, `read_file_content`, `download_file_content` | Search works. Google Docs and .docx read fine. JPG screenshots return empty from `read_file_content`; they were read with `download_file_content` (base64), decoded locally, and viewed in crops. PDFs and slides were not read (see Gaps). |
| Confluence (MTG space) | `mcp__Atlassian_Rovo__*` (cloudId first-edea-team.atlassian.net) | Used to locate hidden Fireflies ids and read the 2026-07-27 meeting page (id 2949123). |

Large transcripts exceeded the tool's token limit and were saved by the harness to local files, then read in chunks. Coverage per transcript is stated in the inventory.

---

## 2. Meetings inventory

### 2a. Listed by the Fireflies API (9)

| Date | Title | Transcript id | Mortgage content? | Coverage | Notes |
|---|---|---|---|---|---|
| 2026-10-08 | Mogi Daily | 01M3XSCKT7GE505NJT54GSXXQC | Unknown (probably yes) | Read in full | Hebrew transcribed in English mode, unusable. Only fragments survive: "Simulator", "Minimum payment", "Bank discount", "Ben lumi", "A pair algorithm", "Maximum", "Mashevon baramata Simulator", "Gidaksha badakti Bachet simulator", "Ahuz shalatamil", "Bena banki mashoni agavu mod katani". The topic was plausibly a bank simulator and a minimum-payment strategy, but nothing can be quoted. |
| 2026-10-05 | Mogi Daily | 01M3XSCKTSP7ESG42TC33XNGNT | No (as recoverable) | Read in full | Garbled ("gamma Gasha automatic algorithm", "Campaign Active doctor"). No domain statement recoverable. |
| 2026-09-28 | פגישת פולואפ | 01M3MD4YX5R58F8M5CBNVEXFSC | No | Read in full | 11 minutes, operational. |
| 2026-09-06 | Programming Session | 01M1VNNA29QSDPY8NCCMGDMRDN | Yes (minor) | Keyword-scanned | Development session; a few bank-form facts from Eden (FK-60, FK-61, Other content). |
| 2026-08-23 | פגישת ארכיטקטורה | 01M0QKKPXKVTWB8QV5G9BNWEBC | Yes (minor) | Keyword-scanned | Architecture; follow-up timing after a pre-approval submission (FK-24). |
| 2026-08-17 | ארכיטקטורה קוד | 01M08GZ7PCKRGPG1ACWFKCTM4R | No | Read in full | Garbled; code architecture. |
| 2026-08-16 15:00 | פגישת יישור קו | 01M05CE4RATYZBZMD590YF1J45 | No (as recoverable) | Read in full | Garbled. The Drive summary of 2026-08-16 covers it (shadow mode, micro-processes). |
| 2026-08-07 | פגישת ביניים - יום שישי | 01KZDHZJZKB2D79XRNRXFSXQ2Q | Marginal | Read in full | Mostly Google Workspace admin. One line on how Eylon prices his own advisory time (Other content). |
| 2026-07-31 | פגישת ביניים - משימות | 01KYSNNTMESHHXEHRX5X7ERZAP | **Yes** | Read in full | Fireflies labels most of Eylon's speech "עדן כהן"; Amit addresses "אילון" and that speaker answers. |

### 2b. Hidden from the list, fetched by id

| Date | Title / recording | Transcript id | Mortgage content? | Coverage | Notes |
|---|---|---|---|---|---|
| 2026-07-27 | "Jul 27, 07:35 PM" (Eylon and Dvir: market intro) | 01KYJ6WG4SQ4X2SG99ZWJCY38G | **Yes, major source** | Read in full | Speaker 1/3 is Eylon, Speaker 2 is Dvir. Confluence page 2949123 summarises it. |
| 2026-08-05 | "פגישה 05-08-2026 - אורי בנקאי בשטח.m4a" | 01M0HP1D33EVANJMPRV379SFJ3 | **Yes, major source** | Lines 1–2075 and 2380–3451 read in full; 2075–2380 keyword-scanned | field banker, a banker (about 4–5 years, including a digital external-refinancing desk), present until about 48:50; then team discussion. Speaker labels are mixed. Banker claims are third-party field knowledge. |
| 2026-08-16 20:30 | "פ.ע אילון + עדן" | 01M05T8GFYMH5J5S5Y1VRS1001 | Marginal | Keyword-scanned | Claude/tool setup. |
| 2026-08-21 10:23 | event model | 01M0HK7J5W6ZEW57YKH1HYHF83 | Yes (minor) | Keyword-scanned | Happy path and self-employed documents (FK-62). |
| 2026-08-21 14:30 | "מערכת יועץ" | 01M0J1GZ6XW955NV3D44A91PN3 | Yes (minor) | Read in full | What comes with a pre-approval (FK-20). |
| 2026-08-26 | team session | 01M0ZGRDTRPAQ0YXY0K6XTPYRE | **Yes** | Keyword hits plus key sections | Speaker 2 is mostly Eylon. |
| 2026-09-10 | consent and deletion | 01M265CRJSXB8WNMVG8YMJG8W9 | Yes (minor) | Keyword-scanned | Counter-offers, credit-check retention. |
| 2026-09-16 18:38 | real client pilot | 01M2NDWXJSA2SFWS26K3XRFPRF | Yes (technique) | Read in full | **Contains a real client's personal data. Only anonymised technique recorded.** |
| 2026-09-16 19:50 | team session, includes another client call from about 3:49 | 01M2NJ1DCQJNB7M44GSVT8HQS8 | Yes (minor) | Keyword-scanned | Client call (private loans) skipped as personal data. Income definition discussion recorded. |
| 2026-08-24 | Eylon's personal business finances | 01M0STMCJQCTE2SGNT096X19ER | No | **Not fetched** | Jewelry business, private; excluded on purpose (the Drive summary identifies it). |

---

## 3. Field-knowledge claims (consolidated)

Meeting short names used below:

- **INTRO** = 2026-07-27, Eylon and Dvir market intro, id 01KYJ6WG4SQ4X2SG99ZWJCY38G
- **TASKS** = 2026-07-31, פגישת ביניים - משימות, id 01KYSNNTMESHHXEHRX5X7ERZAP
- **BANKER** = 2026-08-05, field banker meeting, id 01M0HP1D33EVANJMPRV379SFJ3
- **TEAM26** = 2026-08-26 team session, id 01M0ZGRDTRPAQ0YXY0K6XTPYRE
- **PILOT** = 2026-09-16 18:38 client pilot, id 01M2NDWXJSA2SFWS26K3XRFPRF
- **S0916B** = 2026-09-16 19:50, id 01M2NJ1DCQJNB7M44GSVT8HQS8
- **S0910** = 2026-09-10, id 01M265CRJSXB8WNMVG8YMJG8W9

Status for every item is **field knowledge — needs Eylon's confirmation** unless stated otherwise.

### A. Equity, LTV and who qualifies

**FK-01. First-home buyers need 25% equity: the bank lends three shekels for each one.**
- Source: INTRO, 2026-07-27, 01KYJ6WG4SQ4X2SG99ZWJCY38G, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=184, Eylon
- Hebrew: "ההון העצמי בעצם לרכישה בדירה ראשונה בישראל עומד על 25%... כל שקל שאני אביא, הבנק יביא לי 3 שקלים"
- Gloss: For a first home in Israel the equity requirement is 25%; every shekel the buyer brings, the bank matches with three.
- Note: Dvir had guessed 30% (25:08); Eylon used the gap as an example of the knowledge gap (FK-45).

**FK-02. Home upgraders get 70% of the new property's value, not 75%; self-build gets 50% on the land, then 70% of the future value.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=407 (upgraders, 06:47) and https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=432 (self-build, 07:12), Eylon
- Hebrew: "70% מערך הנכס החדש, לא 75%" (upgraders); self-build: paraphrase (verbatim not captured)
- Gloss: Replacement-home buyers are capped at 70% LTV; self-builders get 50% of the land value, then 70% of the projected finished value.

**FK-03. LTV tiers (40 / 60 / 75%) are about the bank's capital allocation and are published by the Bank of Israel.**
- Source: BANKER, 2026-08-05, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=400, field banker (banker)
- Hebrew: paraphrase (verbatim not captured)
- Gloss: The price tiers by LTV reflect how much capital the bank must hold, and the tier boundaries are Bank of Israel published.
- Status: field knowledge from a third-party banker — needs Eylon's confirmation.

**FK-04. Finance is up to the appraised value; contractor flats use a "zero report" (דוח אפס); the appraiser costs 800–1,000 NIS.**
- Source: BANKER (team part, after field banker left), https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=10570, Eylon (label mixed)
- Hebrew: "דוח אפס" (term); rest paraphrase (verbatim not captured)
- Gloss: The loan is measured against the appraisal, new-build projects use a project zero report, and an appraisal costs about 800–1,000 NIS.

**FK-05. Maximum borrower age to take a mortgage is 70, the loan may run to age 80; maximum term 30 years; banks avoid terms under 5 years.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=544, Eylon
- Hebrew: "חוק שיצא ב-2016" (attribution); rest paraphrase (verbatim not captured)
- Gloss: Age 70 to originate, 80 at maturity, attributed to a 2016 rule; 30-year maximum term; very short terms are disliked.
- Flag: the "2016 law" attribution needs a source.

**FK-06. A mortgage differs from a loan by the lien: unsecured (סולו) loans versus a registered charge on the property; banks are reluctant to repossess homes.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=457, Eylon
- Hebrew: "סולו" (term); rest paraphrase (verbatim not captured)
- Gloss: The defining feature of a mortgage is the lien on the home; repossession is a last resort for banks.

**FK-07. Two banks can share the collateral: pari passu or a second-degree lien (example: Leumi 40% plus Mizrahi 20%).**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1700, Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Financing can be split across banks with equal-rank or second-rank liens.

### B. Repayment ability and income

**FK-08. The repayment-ratio cap: the Bank of Israel allows up to 50% of income; banks apply 40%.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=219 (03:39–04:12), Eylon; repeated in BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8380 (2:19:40, "Bank of Israel up to 50%; Mizrahi takes risk")
- Hebrew: "בנק ישראל בא ואמר, אני רוצה שיהיה לך 40% הכנסה פנויה..." and then "אז הוא אומר 50%, הבנקים מחמירים 40%, זאת אומרת שצריך שישאר 60% הכנסה פנויה"
- Gloss: The regulator's cap on the monthly payment is 50% of income; banks are stricter at 40%, leaving 60% of income free.
- **Flag: he contradicts himself within the same sentence** (first "40% free income", then "50%"). A further unclear remark at BANKER 2:18:04 (https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8284) mentions 40% "עם הכנסת מע"מ", which is probably a transcription error. Must be checked against the Bank of Israel directive before teaching.

**FK-09. Self-employed income comes from the latest tax assessment, then a monthly figure after tax, checked against cash flow; years in business are asked.**
- Source: PILOT, 2026-09-16, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=320 (05:20–05:37), Eylon; also BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2253 (37:33–37:56, field banker: tax assessment plus a calculator "לפי נקודות זיכוי")
- Hebrew: "לפי נקודות זיכוי" (BANKER); PILOT computation paraphrased (verbatim not captured, and the figures are the client's, so they are not copied)
- Gloss: Self-employed income = annual assessed income minus tax, divided by 12, sanity-checked against the account's cash flow.

**FK-10. Banks ask even their own customers for payslips, to see the net/gross composition (bonuses, pension not yet started); salary deposits carry a payroll marker.**
- Source: TEAM26, 2026-08-26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=2482 (41:22–43:14), Eylon (Speaker 2)
- Hebrew: paraphrase (verbatim not captured)
- Gloss: The bank sees deposits but needs the payslip to separate fixed salary from bonuses and deductions; an unstarted pension deduction can make net about 2,000 NIS higher.

**FK-11. "Net" means net to pay (נטו לתשלום), averaged over 3 months; treatment of bonuses and grants is unresolved; compare account balances 3 months back with the payslips.**
- Source: S0916B, 2026-09-16 19:50, https://app.fireflies.ai/view/01M2NJ1DCQJNB7M44GSVT8HQS8?t=6540 (about 1:49–1:57), team with Eylon
- Hebrew: "נטו לתשלום" (term); rest paraphrase (verbatim not captured)
- Gloss: The income figure is the payslip's net to pay over a 3-month average; how to count bonuses is still open.
- Status: open question, not settled (the Drive summary of this meeting says the same).

**FK-12. People fabricate income figures.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2216 (36:56–37:01), field banker
- Hebrew: "סטטוס לא 7,000, משכורת נכנסה 6,500. אנשים מפברקים"
- Gloss: The declared salary says 7,000 but 6,500 actually came in; people fabricate.

**FK-13. Nobody verifies data at the pre-approval stage — not the bank, and not advisors.**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=7807 (2:10:07) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8249 (2:17:29–2:17:54); TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=2168 (36:08–36:45), Eylon
- Hebrew: "אימות הנתונים זה משהו שאף אחד לא עושה... גם יועצים לא"; "אף אחד לא בודק כלום באישור עקרוני"; "בשלב אישור העקרוני, הבנק לא דורש... שום מסמך"; "עד השלב שקיבלתי את האישור העקרוני, אף אחד לא מאמת אותך. בגלל זה הוא עקרוני"
- Gloss: A pre-approval is issued on declared data with no documents; that is exactly why it is "in principle".
- **Flag: conflicts with FK-22** (Discount's advisor portal asks for documents at pre-approval). Probably true of the self-service channel and not of every advisor channel.

**FK-14. Obligations are counted when they run over 18 months (for example, a car loan).**
- Source: TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=4860 (1:21:00), Eylon; also BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8439 (2:20:39, "loans over or under 18 months")
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Loans with more than 18 months left weigh on the repayment ratio.

**FK-15. Credit history: a bounced cheque is the worst mark, a loan default the least bad; the credit check (חיווי אשראי) is mandatory, and instant approval can be predicted from it.**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8865 (2:27:45–2:28:14), team
- Hebrew: "קאם" (as transcribed, for a bounced cheque); rest paraphrase (verbatim not captured)
- Gloss: Bounced cheques hurt most; the credit check always runs and drives instant approval.
- Flag: the ranking needs confirmation.

**FK-16. A credit check must be deleted after 60 days.**
- Source: S0910, 2026-09-10, https://app.fireflies.ai/view/01M265CRJSXB8WNMVG8YMJG8W9?t=5016 (1:23:36), team
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Credit-check data has a 60-day retention limit.
- Flag: regulatory claim; verify against the Credit Data Law.

### C. Pre-approval

**FK-17. The pre-approval is the go/no-go; a free pre-approval at every bank is the hook.**
- Source: TASKS, 2026-07-31, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=1211 (20:11–21:29), Eylon (labelled "עדן כהן")
- Hebrew: "אם יש לך אישור עקרוני, זה ה-go/no-go שלך"
- Gloss: Once you have a pre-approval you know whether the deal is possible.
- Status: the product use (free pre-approval as hook) is a team direction, recorded in the Drive summaries; the "go/no-go" framing is field knowledge.

**FK-18. Pre-approval is digital, per bank; fully digital since 2018; self-service forms since 2020; there is an "instant approval" (אישור מהיר).**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1108 (18:28–19:47), Eylon
- Hebrew: "אישור מהיר" (term); rest paraphrase (verbatim not captured)
- Gloss: Each bank runs its own online pre-approval; the dates are his recollection.

**FK-19. What the computer submits is a request for pre-approval, not a pre-approval; in refinancing there is no instant approval.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1670 (27:50–28:03), field banker
- Hebrew: "זה לא אישור עקרוני מה שאתה מגיש במחשב... בקשה לאישור עקרוני"
- Gloss: Submitting online starts a pre-approval request; refinancing requests always go to a person.

**FK-20. A bank must answer a pre-approval within 5–7 business days (a 2021 rule); it comes with an appraiser list and a list of documents for the branch.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1276 (21:16), Eylon; 2026-08-21 14:30 "מערכת יועץ", https://app.fireflies.ai/view/01M0J1GZ6XW955NV3D44A91PN3 (timestamp not recorded; says 7 business days); Drive summary of 2026-08-05 cites the Bank of Israel for 5–7 business days
- Hebrew: paraphrase (verbatim not captured)
- Gloss: There is a regulated answer deadline, and the approval names appraisers and the documents to bring.

**FK-21. The 5–7 day rule covers the pre-approval only, not a priced final offer; the bank calls to say it was approved ("it's the law"), and a rep calls back with an offer in 3–5 business days.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1713 (28:33–29:08) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2008 (33:28–34:09), field banker and Eylon (disputed between them)
- Hebrew: "זה חוק" (on the approval call); rest paraphrase (verbatim not captured)
- Gloss: The legal clock applies to the in-principle answer; pricing comes later and is not on the same clock.
- Flag: disputed in the meeting.

**FK-22. Discount's advisor portal demands the authorisation letter, ID with appendix, payslips and bank statements already at pre-approval.**
- Source: TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=5567 (1:32:47–1:33:04), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Through the advisor channel at Discount, documents come first.

**FK-23. Pre-approval validity: Eylon says 28–30 days and offer rates 3 months (he was unsure); the banker and the Drive summary say 24 days.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1373 (22:53–23:17), Eylon; BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=527 ("תוקף 24 יום", field banker) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=10364 (2:52:44, "24 days on rates")
- Hebrew: "תוקף 24 יום" (banker)
- Gloss: How long a pre-approval and its rates hold.
- **Flag: contradiction.** The Drive summary of 2026-08-05 cites the Bank of Israel for 24 days. Treat 24 days as the candidate answer and confirm.

**FK-24. After submitting a pre-approval, wait a week, then remind the bank.**
- Source: 2026-08-23 פגישת ארכיטקטורה, https://app.fireflies.ai/view/01M0QKKPXKVTWB8QV5G9BNWEBC?t=6803 (1:53:23), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: A practical follow-up interval.

**FK-25. Pre-approval takes a quarter of an hour, yet some advisors charge for it.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=2381 (39:41), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: The pre-approval itself is cheap work.

### D. Documents, verification and appraisal

**FK-26. Branch verification asks for 3 payslips and 3 months of current-account statements (statements not needed if you bank there).**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1350 (22:30), Eylon; Eden in 2026-09-06 (payslips for the last 3 months, 01M1VNNA29QSDPY8NCCMGDMRDN, keyword-scanned, timestamp not recorded)
- Hebrew: paraphrase (verbatim not captured)
- Gloss: The standard document pack.
- Note: FK-10 says banks still ask their own customers for payslips.

**FK-27. Appraisal: new contractor and מחיר למשתכן projects have a project appraisal report; an appraisal from the last 12–14 months is valid.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1311 (21:51–22:25), Eylon
- Hebrew: paraphrase; the report's name is unclear in the recording (transcribed as something like "אורי ברכה")
- Gloss: New-build projects come with a project-level valuation; older appraisals expire after about a year.
- Flag: the 12–14 month figure needs a source.

**FK-28. An appraisal from one bank's list can be used at another bank within 3 months.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2485 (41:25–41:56), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Appraisals are portable for about 3 months.
- Note: the Drive summary of 2026-08-05 cites Directive 451 section 9(e): 90 days, with conditions. Consistent.

**FK-29. A smart advisor orders the appraiser immediately; the client pays; the bank gives a list; advisors keep a regular appraiser.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2077 (34:37–35:27), field banker and Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Ordering the appraisal early removes a bottleneck.

**FK-30. Appraiser lists: generic at pre-approval, concrete after documents; random by area; Leumi's is the biggest (20–30 per area against 4–5 at others); appraisers earn 600–800 NIS from bank work.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2313 (38:33–39:37) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2395 (39:55), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: How appraiser referral works and roughly what it pays.
- Note: FK-04 says 800–1,000 NIS for the client's fee; the two figures may be what the appraiser earns versus what the client pays.

**FK-31. Underwriting timing differs: some banks send documents to underwriting early; Leumi does it at the end.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2154 (35:54–36:34), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Where the risk of a late rejection sits depends on the bank.

**FK-32. Files fail on securities: a caveat (הערת אזהרה) in the land registry, or a property registered with the Israel Land Authority (3–4 months).**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=879 (14:39–14:55), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Title and registration problems, not income, are a common late failure.

**FK-33. Payroll systems (Hilan-net, Malam, Michpal, Heshev Shevet, Tlush Online) produce similar payslip layouts.**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=7712 (2:08:32–2:09:34), team
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Few payslip formats cover most employees.

### E. Rates, spreads and how banks price

**FK-34. Banks work to a target spread (for example 0.5%), today the same for every file; formerly it varied by client and LTV. There is a minimum profitability, and going below it needs the manager.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=360 (06:00–06:13) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=227 (03:47–04:09), field banker
- Hebrew: "אם אני צריך את התיק שלך בשביל לסגור את החודש..." (03:47)
- Gloss: The rep has a floor; a file the rep needs to close the month can get better terms.

**FK-35. The rep is a salesperson: he opens at 0.7–0.8 against an allowed 0.5 and pressures with the 24-day validity; above a rate band the request escalates to the manager and the manager's manager.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=527 (08:47–09:11) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2813 (46:53–47:16), field banker
- Hebrew: "תוקף 24 יום" (the pressure lever)
- Gloss: The first offer leaves room; negotiation moves it within a band.

**FK-36. The bank cares about volume and monthly market share: "I'd rather work five 2-million files than ten 200,000 files".**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=436 (07:16–08:40), field banker
- Hebrew: "אני אעדיף לעבוד על 5 תיקים של 2 מיליון ולא על 10 תיקים של 200,000"
- Gloss: Big loans get attention.

**FK-37. The spread is managed as a monthly aggregate: if it is already low, a counter-offer won't help; beginning versus end of month matters but "is not an exact science"; targets run from the 1st to the 30th.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=633 (10:33–10:41) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=645 (10:45–12:52), field banker; echoed in S0910, https://app.fireflies.ai/view/01M265CRJSXB8WNMVG8YMJG8W9?t=2512 (41:52, no point in a counter-offer if the spread is already the tightest)
- Hebrew: "זה לא מדע מדויק"
- Gloss: Timing within the bank's month can matter, but unreliably.

**FK-38. Purchases are always a little more expensive than refinancing; branches push balloon loans.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=579 (09:39) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=589 (09:49), field banker
- Hebrew: "רכישות זה תמיד טיפה יותר יקר ממחזור"
- Gloss: Refinance pricing is sharper than purchase pricing.

**FK-39. The cheapest bank changes by quarter; the rate depends on each bank's cost of funds; advisors' software shows a spread that isn't exact.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1251 (20:51–20:57) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1285 (21:25–21:49), field banker
- Hebrew: "זה לפי ריבעון... ריבעון אחד שבנק דיסקונט הכי זול..."
- Gloss: No bank is always cheapest.

**FK-40. "From the first to the third month Poalim is the best in the market"; advisors learn who is cheapest from conferences and WhatsApp/Facebook groups; focus negotiation on 2–3 banks, because each takes a different time.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1940 (32:20–32:55) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1985 (33:05–33:24), field banker
- Hebrew: "מחודש ראשון עד חודש שלישי פועלים הכי טובים בשוק"
- Gloss: A snapshot of relative pricing, and the informal channels where it spreads.
- Flag: time-bound; do not teach as a standing fact.

**FK-41. The average market rate is published; banks must publish data after month or quarter close; spreads follow an actuarial logic.**
- Source: TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=6203 (1:43:23), Eylon; BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8601 (2:23:21–2:26:20)
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Public benchmarks exist for checking an offer.

**FK-42. The advisor pads the rate: if the market gives 4.5, he quotes 4.7.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=264 (04:24–04:40), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Some advisors keep a margin between the bank's rate and what they show the client.
- Flag: an allegation about competitors, not a verified practice.

**FK-43. A private client who studied YouTube for 2–3 hours got rates far below the market and below any advisor's.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2631 (43:51–44:42), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: An anecdote; self-directed clients can negotiate well.

### F. Tracks, mixes and strategy

**FK-44. Three mix strategies: minimum monthly payment, minimum total repaid, minimum rate exposure. He calls the last one "a mortgage advisors' spin", because you can always refinance.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=615 (10:15–11:44), Eylon
- Hebrew: "ספין של יועצי משכנתאות" (on the third strategy); rest paraphrase (verbatim not captured)
- Gloss: Three goals for the mix; his example compared total repaid of 1.7M versus 1.9M.
- Note: the Drive "סיכום הנהלה" lists the engine's three goals as total cost, stability and low monthly payment — the same three in different words.

**FK-45. The knowledge gap is the source of exploitation; an advisor on average sends to only 2 banks.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1508 (25:08–25:42) and https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1552 (25:52), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Most borrowers do not know the basic rules; most advisors compare only two banks.

**FK-46. Regulation forces the prime share: "one third here, two thirds here, with the prime".**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9437 (2:37:17), team (speaker unclear)
- Hebrew: "הרגולציה מכריחה אותך שליש פה, שתי שליש פה, עם הפריים"
- Gloss: The Bank of Israel limits the variable/prime share of the loan.
- Flag: imprecise as spoken; check the current directive (the limit has changed over time).

**FK-47. Directive 451 "three baskets" (end of 2020): every bank must give three uniform offers. Eylon called them a "dummy offer" with a high spread.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1034 (17:14–18:02), Eylon; TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=6056 (1:40:56–1:41:09), Eylon; BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9143 (2:32:23, "אין מסלולים... 451")
- Hebrew: "שלושת הסלים"; "הצעת דמה"
- Gloss: The uniform baskets exist so offers can be compared.
- **Flag:** the Drive summary of 2026-08-26 corrects the "dummy offer" framing using the Bank of Israel guide. Do not teach "הצעת דמה" without review.

**FK-48. A mix example and bank counter-rhetoric: 40% prime, 40% fixed unlinked, 20% fixed linked; the bank counter-proposes swapping tracks, 30% variable every 5 years, or 30-30-20-20; negotiate by phone first.**
- Source: TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=6116 (1:41:56–1:42:54), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: How a negotiation over the mix sounds.

**FK-49. Engine concepts: LTV, IRR, PMT and "Min Payment" on Spitzer.**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9328 (2:35:28–2:36:18), team
- Hebrew: paraphrase (verbatim not captured)
- Gloss: The calculation vocabulary the team uses.

**FK-50. No calculation is done by an LLM.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=761 (12:41), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Status: **decision** (it is now a settled product rule in the repo's CLAUDE.md).

**FK-51. Capitalisation penalty (קנס היוון) is charged on the rate delta (example: 8.5% versus 7%, so 1.5%).**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=712 (11:52–12:16), Eylon
- Hebrew: "קנס היוון" (term); rest paraphrase (verbatim not captured)
- Gloss: Early repayment of a fixed track costs according to how far rates have fallen since the loan.

**FK-52. Shorter term when affordable: "what do you need it for 30 years"; keep the mortgage payment below the expected rent; take only the amount needed.**
- Source: PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=1306 (21:46–22:59) and https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=1384 (23:04–23:58), Eylon (from a real client case; the case amounts were deliberately not copied)
- Hebrew: "בוא נעשה את העסקה הזאת יותר פשוטה"; "מה אתה צריך את זה 30 שנה"
- Gloss: Simplify the deal, borrow less, shorten the term if the payment allows.

**FK-53. Sequence: close one deal, then refinance the other mortgage; a constraint can be "do not exceed the current monthly repayment"; keep a business loan out of the mortgage to avoid mixing.**
- Source: PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=1449 (24:09) and https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=625 (10:25–11:03), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Order the transactions and set a payment ceiling.

**FK-54. Rate timing: "we waited for September... the rate dropped"; "wait a month and see the rate"; but forecasting is never certain ("50%").**
- Source: PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=6 (00:06) and https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=1886 (31:26–33:37); S0910, https://app.fireflies.ai/view/01M265CRJSXB8WNMVG8YMJG8W9?t=6025 (1:40:25)
- Hebrew: "חיכינו לספטמבר... ירדה הריבית"; "חכה חודש ותראה ריבית"; "זה אף פעם לא ודאי... 50%"
- Gloss: Timing for an expected rate cut is a judgement call. A Bank of Israel rate of 3.25 was mentioned; the numbers were disputed in the meeting, so none is recorded as fact.

**FK-55. Submit to as many banks as possible; start where you have contacts.**
- Source: PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=151 (02:31), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Breadth of submission plus relationships.

### G. Refinancing

**FK-56. Internal refinancing is re-opening at the same bank; external refinancing is regulatorily a new credit at the receiving bank, so it is harder; refinancing is most of an advisor's work today. Internal refinancing is "retention only".**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=280 (04:40–06:35), Eylon; BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2132 (35:32–35:43), field banker
- Hebrew: "רוב עיסוקו היום של יועץ משכנתאות" (Eylon); "רק שימור", "שומר לך על קהל עד 2.5 אחוז" (field banker)
- Gloss: Refinancing dominates advisory work; the internal desk exists to keep the customer.
- Flag: "עד 2.5 אחוז" is unclear in context.

**FK-57. The external-refinance desk: cases arrive after the call centre approves them; it asks for the balance statement (דוח יתרות); it gives an offer without documents (unlike the branch and new-money desk, where documents come first); the process runs over email.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1432 (23:52–24:07), https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=904 (15:04–15:28), https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=933 (15:33), field banker
- Hebrew: "אהלן, בוא תשלח לי את הדוח יתרות... אני לא אביא לך ישר את האחוזון" (29:46, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1786)
- Gloss: The refinance flow: balance statement, offer, negotiation by email, then documents and appraiser (30:41–30:54, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1841).

**FK-58. The call-centre system shows only the total amount; a 3-minute verification call follows, unless there is a self-employed borrower.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1538 (25:38–26:17), field banker
- Hebrew: "אלא אם כן יש לך עצמאי"
- Gloss: Salaried files get a short call; self-employed files get more scrutiny.

### H. The advisor's trade and the bank relationship

**FK-59. Becoming an advisor needs nothing: call the bank, give name and email, receive an advisor number ("three digits slash two digits"). Regulation as brokers with an exam was attempted.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=956 (15:56–16:16), Eylon; TASKS, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=1148 (19:08) and https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=4194 (1:09:54), Eylon
- Hebrew: "שלוש ספרות סלאש שתי ספרות"; "אין צורך... להיות שום אדם... מיוחד, בשביל להיות יועץ משכנתאות"
- Gloss: The profession is unregulated; banks issue advisor codes on request. Eylon wishes regulation were stricter.

**FK-60. All four banks have advisor portals (field banker: nobody uses them); Discount and Poalim consent forms allow advisors their own apps, while Leumi puts it in robots.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=950 (15:50–16:04), field banker; https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1033 (17:13–17:33), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Bank channels for advisors exist but are underused.
- Flag: "Leumi puts it in robots" is unclear as transcribed.

**FK-61. The authorisation letter (כתב הרשאה) is a signed file in each bank's own wording; one bank requires a scanned ID.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1191 (19:51–20:17), field banker and Eylon
- Hebrew: "כתב הרשאה" (term); rest paraphrase (verbatim not captured)
- Gloss: Each bank has its own form; the four forms are in Drive (see Drive inventory).

**FK-62. The area manager will not engage until you bring volume; submission goes through a call centre (מוקד) or CRM.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=1133 (18:53–19:14) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=324 (05:24), field banker
- Hebrew: "מוקד" (term); rest paraphrase (verbatim not captured)
- Gloss: Relationships with the bank follow volume.

**FK-63. At big advisory firms the file is handled by an operations person with a fixed script; the "advisor" is the salesperson; the bigger the firm, the lower the rep's quality.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=92 (01:32–02:29) and https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=170 (02:50), field banker
- Hebrew: paraphrase (verbatim not captured)
- Gloss: An insider's view of advisory firms.

**FK-64. Do not call the client three times a day.**
- Source: BANKER, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=2030 (33:50), Eylon
- Hebrew: "אסור להתקשר ללקוח שלוש פעמים ביום"
- Gloss: A client-contact etiquette rule.

**FK-65. Advisory fees: a mortgage file in Israel starts at 6,000 NIS (11,000 also mentioned); brokers charge 1.5%.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=2296 (38:16) and https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=2409 (40:09), Eylon; BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9912 (2:45:12)
- Hebrew: "תיק משכנתאות בישראל מתחיל ב-6,000 שקל"; "11,000 שקל"
- Gloss: Market price range for advisory.

**FK-66. Wiz (וויז) advisor software costs about 120 NIS a month; useful to benchmark the algorithm.**
- Source: BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9688 (2:41:28); TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=6238 (1:43:58–1:44:17), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: A cheap commercial tool exists. The Drive summary of 2026-08-26 marks the name and price unverified ("Wise/Wiz").

**FK-67. Who takes an advisor: older people and people with simpler means, for hand-holding. Survey technique: ask why someone else took an advisor, to get truer answers.**
- Source: TASKS, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=1052 (17:32) and https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=684 (11:24–12:28), Eylon (labelled "עדן כהן")
- Hebrew: "למה אתה חושב שלירון לקח יועץ"
- Gloss: Client psychology and a research technique.

**FK-68. "I made it easier on us... I made him a better mortgage taker, and he will need me again."**
- Source: PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=1551 (25:51), Eylon
- Hebrew: "הקלתי עלינו... הפכתי אותו ללוקח משכנתה יותר טוב, וגם הוא יצטרך אותי עוד פעם"
- Gloss: Simplifying the deal also creates a returning client.

### I. Market and history

**FK-69. Market size: "this market in Israel stands at one billion shekels a year".**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=796 (13:16), Eylon
- Hebrew: "השוק הזה עומד בישראל על מיליארד שקל בשנה"
- **Flag: likely wrong as heard.** Annual new mortgage volume in Israel is on the order of 100 billion NIS; he may have meant the advisory-fee market, or the transcription dropped a word. Do not teach without confirmation.

**FK-70. Mizrahi and Leumi lead, Poalim is lower; "Mizrahi controls 54% of the market".**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=823 (13:43), Eylon; BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=8398 (2:19:58)
- Hebrew: "מזרחי שולט בשוק ב-54 אחוז"
- **Flag: 54% is implausibly high** for Mizrahi's mortgage share (commonly cited around a third). Verify against Bank of Israel data.

**FK-71. Insurance companies may issue mortgages; advisors avoid them; an opportunity.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=834 (13:54) and https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1633 (27:13), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Non-bank lenders exist.

**FK-72. Demand is fully inelastic; people think in salaries (about 12 salaries more for a home than a decade ago).**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=858 (14:18), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Housing affordability measured in monthly salaries.

**FK-73. Every mortgage in Israel requires life insurance, so a lead can be sold to an insurer.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1443 (24:03), Eylon; TASKS, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=3002 (50:02), Eylon
- Hebrew: "אין משכנתא בישראל שאין עליו ביטוח חיים"; "היום כל משכנתא בישראל מחויבת לביטוח חיים"
- **Flag:** the Confluence intro page says a reverse mortgage (mentioned at INTRO 23:28, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1408) has no life-insurance requirement. The claim needs an exception.

**FK-74. History: dollar-linked mortgages from the 70s to the 90s; the 2008 subprime crisis barely hit Israel.**
- Source: INTRO, https://app.fireflies.ai/view/01KYJ6WG4SQ4X2SG99ZWJCY38G?t=1775 (29:35–33:31), Eylon
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Background for why Israeli regulation is conservative.

**FK-75. Bank form differences: children counted to age 18 at one bank and 21 at another (Eden in 2026-09-06: Poalim under 21, Leumi under 18).**
- Source: TEAM26, https://app.fireflies.ai/view/01M0ZGRDTRPAQ0YXY0K6XTPYRE?t=915 (15:15), Eylon; 2026-09-06, 01M1VNNA29QSDPY8NCCMGDMRDN (Eden, keyword-scanned, timestamp not recorded)
- Hebrew: paraphrase (verbatim not captured)
- Gloss: Store birth years; each bank defines "child" differently.
- Note: the bank-to-age mapping comes from Eden reading the questionnaires, which are in the repo (`context/inputs/*-preapproval-questionnaire.md`).

### J. Do not teach without review (compliance risk)

These were said and are recorded so they are not lost, but they must not enter course material without review.

- **DNT-1. Rent offset "the bank won't know".** PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=382 (06:22). Hebrew: "הבנק לא יידע". Suggests not disclosing something to the bank. Ethically and legally problematic.
- **DNT-2. Inflating a documented debt.** PILOT, https://app.fireflies.ai/view/01M2NDWXJSA2SFWS26K3XRFPRF?t=786 (13:06–16:53). An idea to inflate a documented debt was discussed and abandoned. The legitimate facts in the same passage: mortgage money goes straight to the seller ("המשכנתה אוטומטית עוברת אליו לחשבון"), and an attorney must assign a purpose to the funds — these are field knowledge needing confirmation.
- **DNT-3. Advisor rate padding (FK-42) and "people fabricate" (FK-12)** are allegations; teach them only as risks to watch for.

---

## 4. Other domain content

Product and business points that are not market facts. Each is a team direction or a decision as recorded, not field knowledge.

- **Bank submission today, tomorrow and later.** 2026-08-23 architecture (01M0QKKPXKVTWB8QV5G9BNWEBC, keyword-scanned): submission to banks is a human today, a script tomorrow, maybe an official channel later.
- **Happy path.** 2026-08-21 10:23 (01M0HK7J5W6ZEW57YKH1HYHF83): "זוג שכיר שיש להם הון עצמי, עם הכנסה פנויה" — a salaried couple with equity and free income; self-employed borrowers need different documents.
- **Loan purposes and property types.** 2026-09-06 (Eden): purposes are purchase, self-build, renovation, extension; מחיר למשתכן means the seller is a contractor; single / replacement / additional apartment. Eden advised having Eylon fill forms manually and compare with OCR.
- **Pricing ideas.** BANKER team part, https://app.fireflies.ai/view/01M0HP1D33EVANJMPRV379SFJ3?t=9841 (2:44:01–2:44:16): a paid stage at 300 NIS after the free pre-approval. The Drive summary of 2026-08-05 repeats it (charge 300 NIS before showing the tailored offer). S0910, https://app.fireflies.ai/view/01M265CRJSXB8WNMVG8YMJG8W9?t=2721 (45:21): free refinancing for the first two months (idea). Founders' summary of 2026-08-19 (Drive): pilot of 3 files at 5,900–6,000 NIS incl. VAT, first-time salaried buyers, the MOGI brand — **decision** as recorded there.
- **Task.** TASKS, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=3442 (57:22): get advisor codes at Leumi and Mizrahi; call Poalim and Discount.
- **Banker's background.** TASKS, https://app.fireflies.ai/view/01KYSNNTMESHHXEHRX5X7ERZAP?t=4166 (1:09:26): field banker has 4–5 years in banking.

### Worked example from Drive (Dvir's dictation test)

"Untitled document" (Eden, 2026-10-06): 1.2M NIS over 25 years at 4.5% gives about 6,700 a month. A Spitzer check gives about 6,670, so the figure is a fair rounding. The same document defines pre-approval versus final approval and lists track types.

### Real bank offers in Drive (folder "תמהילים") — removed from this repo

Drive holds six phone screenshots of real pre-approval offers from Poalim, Mizrahi-Tefahot and Leumi, dated September 2026. **They are real client data, so the per-offer details were deliberately left out of the course repo.** Only these aggregate observations are kept. They can be used in the course **only with explicit team approval** (brief, section 9):
- Every offer is built from the same three blocks: prime, fixed unlinked, and variable unlinked tied to government bonds. Linked tracks appear in only two of the six.
- Prime discounts ranged from P−0.65 to P−0.90. Spreads on the bond-based variable tracks ranged from +0.61 to +1.00.
- Effective rates clustered between 4.83% and 5.04%.
- The offers show the standard Directive 451 table, the first payment, and a "rising to" projection on the variable and linked tracks.

---

## 5. Drive inventory

### 5a. What was searched

Hebrew and English: אופטימיזציה, מאגר מידע, מחקר מערכת, "תכנן מערכת אופטימיזציה למשכנתאות", "מאגר מידע למשכנתאות", "מחקר מערכת משכנתאות", mortgage optimization, simulator, סימולטור, course, קורס, rate sheet, plus the names of the four banks, Eylon, questionnaire (שאלון) and summary (סיכום).

### 5b. Not found

- **None of the three Claude-conversation exports exist in Drive**: "תכנן מערכת אופטימיזציה למשכנתאות", "מאגר מידע למשכנתאות", "מחקר מערכת משכנתאות" — no matches in Hebrew or English.
- No bank rate sheets, no simulator documents, no course material.

### 5c. Read

| Title | Id | Owner | Modified | Summary |
|---|---|---|---|---|
| סיכום הנהלה – מיזם המשכנתאות | 1QzzWzjTTbYoTGhcu6Vxj2niKslop8ihNBRELFuY6N7I | Eylon | 2026-07-30 | Service first; an 11-step end-to-end flow; a mix engine with three goals (total cost, stability, low monthly payment); green-path MVP; target price 300–500 NIS; 85–90% gross margin; risks. |
| סיכום פגישת צוות – מיזם המשכנתאות | 1LdYA8Psld9UhyBD6sEzTKOL0epcVHdEDZd6QaFk_ais | Eylon | 2026-08-01 | Team meeting summary (the 2026-07-31 session). |
| סיכום פגישת מייסדים - 19/08/2026 | 1mTrSSzuI0sfATZro4Us08fShNRkJQueJxF2Cw4xmfkM | (team) | 2026-08-21 | Pilot of 3 files at 5,900–6,000 NIS incl. VAT; first-time salaried buyers; the MOGI brand. |
| סיכום פגישת יישור קו | 1TSqfxE27L-CNegXwuKyCdN7r3cZwVdF0lkpQtAEcb8k | (team) | 2026-08-21 | Alignment meeting of 2026-08-16: shadow mode, micro-processes. |
| Untitled document | 1lDxMmQnING86ISelbShxPJLGHsbtUCjJjbgqd2f83rU | Eden | 2026-10-06 | Dvir's dictation test script; the 1.2M / 25 years / 4.5% example; pre-approval versus final approval; track types. |

Folder "סיכומי פגישות — גרסאות מעודכנות לבדיקה — 24.09.2026" (1gEPrtolZa8N54VznrLkA_TFEnP9UncqT), owner Eylon, all .docx modified 2026-09-24. These are AI meeting summaries with corrections against official sources; they are the best route to the Fireflies ids.

| Meeting | Id | Relevant content |
|---|---|---|
| 2026-08-05 | 1UDOYSzZ3WY7DmeXTTHLW1Uywam7oIsSh | Cites the Bank of Israel: pre-approval answered in 5–7 business days, terms valid 24 days; Directive 451 section 9(e): another bank's appraisal usable within 90 days, with conditions; the 300 NIS paid-stage idea. |
| 2026-08-07 | 1lHiRd_9IMqy2sY8IF98KLZAPveCSLAc5 | Workspace admin. |
| 2026-08-16 | 1NXpJ0b1JqCaf2PWKcix49mHkVnE_ULbN | Alignment and Claude setup sessions. |
| 2026-08-21 10-23 | 12XhSvckkb5VzU1ucw_Id2DV0xVzKxd3k | Event model. |
| 2026-08-21 14-30 | 1nPz49772tpxMz0ViWfjHT9TMa7XkBeiG | Advisor system. |
| 2026-08-24 | 1a7HFAeeKfnqL_05YrnuwJ1FnXW29aw_C | Eylon's personal jewelry business; **excluded**. |
| 2026-08-26 | 15EfrH3NVQnwUbf0860VG9Yzy1HN0Ma6y | Corrects the "הצעת דמה" framing of the 451 baskets via the Bank of Israel guide; marks Wise/Wiz at 120 NIS unverified. |
| 2026-09-10 | 1pX7QgzXsFczjx4_HbMWX24jr3lZCDVIb | Consent and deletion. |
| 2026-09-16 18-38 | 1F4Eo_nSoFayA0JLPeQ8Ap6HvLmVNn-SS | Client pilot (personal data; not copied). |
| 2026-09-16 19-50 | 1pY4oZtWluk7b-h8u9cQvmuLRTNn_a9eb | Notes the gap between selling "cheapest rates" and selling "lowest monthly payment"; income definition not settled. |

Folder "תמהילים" (13JgmF4f_uI8EzmvSEPEiIlGwythzj7gy), owner Dvir, modified 2026-10-06: six phone screenshots of real offers. **Sensitive.** Read and summarised anonymously in section 4.

### 5d. Found, not read

| Title | Id | Owner | Modified | Why not read |
|---|---|---|---|---|
| כתב הרשאה ליועץ - בנק לאומי | 1y9lme0uCZH0mgvPguWv7h4EhEvjuvnUG | Eylon | 2026-08-02 (folder 1Gk1qjfJ7D5cr13FCjhSFaA7FYMhnPics) | PDF |
| כתב הרשאה ליועץ - בנק דיסקונט | 1Hijf54WdwpXI2qsicQr8z1eot2PvWHaQ | Eylon | 2026-08-02 | PDF |
| כתב הרשאה ליועץ - בנק פועלים | 1XvatnDne5onBFGyp_V8RLwqboFGEReoQ | Eylon | 2026-08-02 | PDF |
| כתב הרשאה ליועץ - בנק מזרחי טפחות | 1kO0O-t8ngb5BG1RAU98df8AvKaf-quOW | Eylon | 2026-08-02 | PDF |
| מצגת מוצר - משכנתאות | 1UHXxpUs1D2HNBoui9LKrQtTp7cbbvgUA | — | 2026-07-29 | Slides |
| מצגת אסטרטגיית חדירת שוק | 11Hl3DiMiMxMHYGP1pj1bLqWwibaUbusV | — | — | Slides |
| E.D.E.A מצגת אילון - 30 יום קרובים | 1-ZXRauROW6YPs0kROKhqQkchDdZ_gtuP | — | — | Slides |
| מפגש ראשון - משפחת אינקובציה.pdf | 1VtMU5drEcDccNTfsTXJF8OcUtLqkYYoC | — | — | PDF |
| כלי עבודה - מצגת.pdf | 14FQNHVJeGLk7_cfZVIU8Kw1vufzBTZry | — | — | PDF |
| תכנון שאלון מקצועי ומדיד לשלושה מקטעי לווים בשוק המשכנתאות בישראל | 1GGhTaLwc1mxLogkdmrvvwMXQoAP-gc2SI_-nS-lI-7M (Eylon); 1kWeiNn5QNXOzRbAUSmcj4GxsiSL55g5-Fehw3QZJMfY (Eden); PDF 1uny3Q01EkhM2pK-mn3hBE4jk8X4KKG7_ | Eylon / Eden | 2026-08-07 | Customer-research questionnaire design (three borrower segments); not read for time. **Worth reading next.** |
| potential personas - E.D.E.A | 1uq-yz_z05UoEaVxp5BLUwYvfnbNsTPVOHOPtrK9FXgI | amitbez488 | — | Not read |
| מערכת היועץ - אפשריות שיפור | 1uhtUG9I1ufmuLI93COy8cXFkkJ__Dpzdh8SYpd-NRqk | — | — | Not read |
| החלטות תשתיתיות; משימות וכלי עבודה; סטטוס - מלגות; colour-strategy pptx files | — | — | — | Out of scope (infra, tasks, grants, branding) |

"—" means the field was not recorded during the search.

---

## 6. Quality issues

- **Hebrew transcribed in English mode.** The 2026-10-08 and 2026-10-05 Mogi Dailies, 2026-08-17 and 2026-08-16 15:00 are phonetic nonsense ("Bank Mazat", "Kiazan", "Ben lumi"). Nothing quotable survives. Fireflies' language setting for these meetings should be Hebrew.
- **Swapped or merged speaker labels.** 2026-07-31: Eylon is labelled "עדן כהן". 2026-08-05: banker and team voices are mixed. 2026-07-27: two labels (Speaker 1 and 3) are both Eylon.
- **Mis-heard terms in Hebrew transcripts**: "קאם" (bounced cheque), "אורי ברכה" (an appraisal-report name), "עם הכנסת מע"מ" (in a repayment-ratio remark), "Leumi puts it in robots". Each is marked where used.
- **Auto-summaries.** The Fireflies auto-summaries of the garbled meetings are themselves garbled. The Drive .docx summaries (24.09.2026 folder) are better and include source corrections, but they are AI-written and must not be treated as primary.
- **Hidden transcripts.** The Fireflies list returns 9 meetings while at least 10 more exist and are fetchable by id. Search does not reach them.
- **Contradictions to resolve with Eylon**: repayment cap 40% versus 50% (FK-08); validity 24 days versus 28–30 days and 3 months (FK-23); market size "one billion" (FK-69); Mizrahi at 54% (FK-70); life insurance on every mortgage versus the reverse mortgage (FK-73); "nobody checks documents at pre-approval" versus Discount's advisor portal (FK-13 against FK-22); appraiser fee 600–800 versus 800–1,000 (FK-30, FK-04); "dummy offer" framing of the 451 baskets (FK-47).

---

## 7. Gaps

- **Claude-conversation exports not found.** "תכנן מערכת אופטימיזציה למשכנתאות", "מאגר מידע למשכנתאות", "מחקר מערכת משכנתאות" are not in Drive under any search tried. They may live only in claude.ai chat history, which these tools cannot reach.
- **The two most recent dailies (2026-10-05, 2026-10-08) are unrecoverable** from Fireflies text. The audio would need re-transcription in Hebrew.
- **Partially read transcripts**: 2026-08-05 lines 2075–2380 (team part) keyword-scanned only; 2026-08-23, 2026-08-26, 2026-09-06, 2026-09-10, 2026-09-16 19:50, 2026-08-16 20:30 and 2026-08-21 10:23 keyword-scanned or read by key sections. Further claims may sit in the unread parts.
- **Verbatim Hebrew** was captured for about half the claims; the rest are marked "paraphrase (verbatim not captured)" and need re-quoting from the linked timestamp.
- **Hidden transcripts beyond the ten found may exist.** Ids were discovered only through Drive summaries and Confluence references.
- **Not read**: the four authorisation-letter PDFs, the product and strategy slide decks, the incubation PDF, the questionnaire-design documents, the personas document.
- **Not fetched on purpose**: 2026-08-24 (01M0STMCJQCTE2SGNT096X19ER), Eylon's personal business.
- **Confluence meeting pages not read**: 2026-07-29 (4489217), 2026-08-07 (21725185), 2026-08-16 (26836993), 2026-08-19 (25395201), 2026-10-01 (60588034), the J-050 "Choices and costs — submit pre-approval request" page (6455326) and the J-120 and J-160 journey pages.
- **Plugin MCP servers** (`edea-fireflies`, `edea-confluence`, `edea-linear`) failed to connect; Linear was not consulted.
- **No external verification** was done here; every FK item awaits Eylon's confirmation, and the flagged ones need an official source.

<!-- Compiled 2026-10-09 by the research reader from Fireflies, Google Drive and Confluence (read-only). -->
