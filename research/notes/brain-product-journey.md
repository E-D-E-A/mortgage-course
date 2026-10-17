# Brain notes — product, journey, field knowledge (for the Mogi mortgage course)

Source: Confluence "Brain", space MTG, site first-edea-team.atlassian.net. Read-only extraction, 2026-10-09.
Reader rule: nothing below is invented; where a page hedges, the hedge is kept. Classification tags used throughout:

- **[DEC]** Mogi / E.D.E.A decision (date, who where stated)
- **[FACT-SRC]** professional/regulatory fact with a cited primary source (e.g. Directive 451 section)
- **[FIELD]** field knowledge (who/when) — to verify before teaching
- **[RES]** research / proposal, not decided
- **[OPEN]** open / unknown / unverified
- **[TODAY]** describes how Mogi works today (manual)  ·  **[FUTURE]** target / plan

## Access log (2026-10-09)

Tool: Atlassian Rovo MCP (getConfluencePage / getConfluencePageDescendants / searchConfluenceUsingCql), cloudId 83ca9ec6-8fb5-4b2f-a66f-907d6f5801f0, markdown format (ADF used once for J-090 to recover date macros the markdown dropped). Read-only — nothing created, edited or commented.

**Note on connectivity:** the `edea-confluence`, `edea-fireflies` and `edea-linear` plugin MCP servers failed to connect (proxy 403) in this session; the Atlassian Rovo server worked, so no Confluence page needed for this task failed. Fireflies transcripts were NOT consulted — meeting content is from the Confluence summaries only.

**Loaded OK (all requested pages):** 5373953 Journey · descendants list (51 pages) · 5570561 J-010 · 5439547 J-020 · 5636146 J-030 · 5832771 J-040 · 5898285 J-050 · 5931054 J-060 · 5931117 J-070 · 6455359 J-080 · 7503881 J-090 (markdown + ADF) · 6848521 J-100 · 8126465 J-110 · 8454147 J-120 · 8716289 J-130 · 8716324 J-140 · 9863169 J-150 · 9863207 J-160 · 9895937 J-170 · 20480025 Product and scope · 2949123 Eylon intro 2026-07-27 · 60981249 Five values · 16809986 Mogi go-to-market · 3670017 Decisions index (+ group rules pages 28901456 The domain rules, 28934145 Automation and the advisor app, 41254969 Open decisions, 43253761 Documents and reading).

**Loaded OK (found by CQL, domain-relevant):** 67436545 Eylon's 15 calculation answers · 3112963 Question Files – field banker · 4489217 meeting 2026-07-29 · 60588034 meeting 2026-10-01 · 3670057 meeting 2026-07-31 · 26836993 meeting 2026-08-16 · 25395201 meeting 2026-08-19 · 26935299 Hebrew advisor walkthrough (Eylon-approved) · 7733250 How the regulator says to compare offers · 7798786 קנס היוון · 8290315 What banks need before they lend · 9797633 What banks make you insure · 9568265 Licensing bill · 6455298 Credit report · 16777218 V1 pre-approval track · 67469313 BoI data connections (Eylon) · 16646263 Term per track · 8650753 Banking calendar · 6029348 Advisor channels · 9830401 Signing electronically · 7634954 J-090 choices & costs · 30375937 Discount pre-approval questionnaire · 43384833 What each document gives us.

**Failed:** none.

**Not read (deliberately, to stay in scope):** the J-0xx "Choices and costs" and "Data" child pages other than J-090 choices (mostly tooling/vendor/data-sale content; titles listed in the Journey descendants); the Leumi/Mizrahi/Hapoalim pre-approval questionnaire pages (29982722, 30048257, 29982743); the 13 persona pages (summaries only, §45); 7831553 rate feeds Aug 2026 (superseded by 67469313); 15564802 regulators; 15597569 data location; 5636110 Section 30א; 47054849 Discount advisor panel; 16646145 blockers register. Worth a follow-up pass if the course needs them.

**Classification tags** are defined at the top of this file. Page last-modified dates are as returned by the API on 2026-10-09 ("yesterday" = 2026-10-08).


---

## 1. Journey (hub) — page 5373953

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5373953/Journey
- Last modified: Aug 21, 2026 · Author: eden · Type: Journey tree hub ("sixth tree", alongside Decisions/Research/Specs etc.)

### Summary
- The mortgage user journey, one page per stage, from first contact to funded mortgage. Each stage page: what happens, who does it, how automated it is today.
- **Scope: servicing a customer, not finding one.** Lead acquisition (advertising, developer/estate-agent partnerships, referrals) is out of scope; the journey starts at contact. [DEC]
- **Intent: automate mortgage advisory work — all of it** ("Not a tool that helps an advisor work faster: software that does the job"): talking to banks, sending offers, negotiating, finding what is missing and asking the customer, sending it on. [DEC / FUTURE]
- The pieces that stay manual will be those where automating is not worth it or impossible; that set "is discovered, not assumed, and it should shrink". [DEC principle]
- Three rules for every stage page: a human step is today's position not the design; name what would remove the person (legal question, bank ToS, uncollected document, untaken measurement → Open questions); don't overclaim automation either (depends on banks, lawyers, customers). [DEC principle]
- Each stage carries an `Automation:` line — `manual`, `assisted`, `automated`; searching `Automation: manual` = "what still needs a person today?" → input to roadmap and the measurement surface for **Shadow Mode**. Target is automated unless established otherwise.
- Bodies in English, domain vocabulary kept in Hebrew: אישור עקרוני, תמהיל, סל אחיד, שמאות, קנס היוון.
- Stage IDs J-010 upward in tens, never renumbered. Nodes refer to the FigJam board "Firs flow — E.D.E.A".

### The 17 stages (table as on page)
| ID | Stage | Hebrew | FigJam nodes | Swimlane |
|---|---|---|---|---|
| J-010 | Lead intake | ליד נכנס | 1 | Marketing |
| J-020 | Sales call and close | שיחת מכירה | 2–5 | Marketing |
| J-030 | Document collection | איסוף מסמכים | 6 | Pre-approval |
| J-040 | Data verification | אימות נתונים | 7 | Pre-approval |
| J-050 | Submit pre-approval request | שליחת אישור עקרוני | 8–9 | Pre-approval |
| J-060 | Bank response and tracking | אישור / סירוב | 10, 11, 13, 14, 15 | Pre-approval |
| J-070 | Document completion loop — folded into J-130 on 2026-08-13 | השלמת מסמכים | 12 | Pre-approval |
| J-080 | Pre-approval dashboard | הצגת אישורים עקרוניים | 16 | Offer building |
| J-090 | Mix construction and calculator | בניית תמהיל ומחשבון | 17–21 | Offer building |
| J-100 | Issue offers to banks | הנפקת הצעה לבנקים | 22–23 | Offer building |
| J-110 | Present offers and negotiate | הצגת ההצעות ללקוח | 24–29 | Offer building |
| J-120 | Meeting coordination | תיאום פגישה | 30–33 | Meetings and signatures |
| J-130 | Document dispatch to banks | שליחת המסמכים לבנקים | 34 | Meetings and signatures |
| J-140 | Property appraisal | שמאות | 35 | Meetings and signatures |
| J-150 | The bank's own verification | אימות נתונים של הבנק | 36 | Meetings and signatures |
| J-160 | Signing meeting | פגישה וחתימות מול הבנק | 37 | Meetings and signatures |
| J-170 | Mortgage funded | העמדת משכנתא | 38 | Meetings and signatures |

- **J-070 no longer happens as a pre-approval event**: documents go to banks only at file opening — Decision "Documents go to banks only at file opening, not at pre-approval" (2026-08-13). [DEC]
- Five cross-cutting concerns not drawn as nodes: the case record (status, action log, replayable history Shadow Mode measures against); data protection & storage; **payment** (paywall sits between J-110 and J-120, no node collects money); notifications (J-060, J-100 contain silent waits measured in days); **a second way in** — the free אישור עקרוני from J-010 lets people pass J-030–J-060 without closing at J-020 (costs the most expensive stages before commitment). [RES/OPEN]
- "Where a lead came from is not recorded anywhere" (Aug 2026) — the file should carry its source. [OPEN at the time; note: CLAUDE.md says `lead_source` was later added to `case_opened` — today's code has it.]

### Useful for course
- Course skeleton: the 17-stage mortgage process from inquiry to funding, with Hebrew stage names; stage order (pre-approval → offer building → meetings & signatures).
- Concept of "uniform baskets", appraisal, signing, funding all sit as stages.

---

## 2. J-010 · Lead intake (ליד נכנס) — page 5570561

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5570561/J-010+Lead+intake · Last modified Aug 05, 2026 · Journey stage page · Automation: MANUAL · Node 1

### Summary
- First contact up to booking a sales call. Nothing checked, no documents requested.
- Expected lead sources (guesses "from one meeting", ordered by expected early volume) [RES]: people the four founders know; paid advertising to house-hunters; buyer groups in new-build developments (קבוצות רוכשים) and partnerships with developers/estate agents; occasional referrals from existing mortgage advisors; **a free אישור עקרוני**.
- Definition: אישור עקרוני = "the bank's in-principle 'yes, we would lend you roughly this much' letter, which people need before they can make a serious offer on a property."
- **Banks are not allowed to charge for an אישור עקרוני at all.** Directive 451 §4ג(א)(1): issued "at a stage in which no costs whatsoever are imposed on the applicant". [FACT-SRC]
- What Mogi gives away: applying to all four banks at once and explaining what comes back — "the part a human advisor charges thousands of shekels for". [RES/claim]
- Customer intent categories at intake: first mortgage; משפרי דיור (moving to a bigger home while already having a mortgage); מחזור חיצוני (moving an existing mortgage to a different bank for better terms).
- Out: customer file with reference number, privacy notice + consent record, lead source, booked sales call.
- Today vs target table: receiving enquiry — person → form/WhatsApp auto-creates file; fit check — not done → simple automatic checks; booking — person → self-booking; recording source — **not happening at all** → captured on file creation; privacy notice — **not happening yet** → shown and recorded at collection. [TODAY / FUTURE]
- **Privacy law**: Amendment 13 to the Protection of Privacy Law in force since **14 August 2025**; on collection must tell: who collects + contact, purpose, consequences of refusing, right to access, right to correct. Non-compliance: person may claim up to **₪10,000 without proof of harm**; no longer a short two-year window for claims. [FACT-SRC (statute named, section not given)]
- Israel's privacy regulator treats salary/financial info as **especially sensitive** with stricter obligations. [FACT-SRC-ish, no citation]
- Anti-spam (Section 30א): human-dialled call is outside the law; WhatsApp/SMS/email need permission; what the form says about marketing sets the outer limit for the whole relationship, cannot be widened later. [FACT via Research page "What Section 30א lets us send — Aug 2026"]
- Open: which lead source works; does the free pre-approval attract the right people ("בא להתגלח" risk raised in the 31.07 meeting); how few form questions; is a follow-up message marketing. [OPEN]

### Useful for course
- Definition of אישור עקרוני; the fact that it is free by regulation (Directive 451 §4ג(א)(1)); borrower types (first mortgage / משפרי דיור / מחזור חיצוני); privacy & consent basics for a mortgage advisory.

---

## 3. J-020 · Sales call and close (שיחת מכירה) — page 5439547

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5439547/J-020+Sales+call+and+close · Last modified Aug 03, 2026 · Stage page · Automation: manual today; how much can be automated is genuinely open · Nodes 2–5

### Summary
- Steps: (1) advisor phones lead, ideally within hours — "a mortgage enquiry is rarely made to only one company"; (2) work out need — **first mortgage, moving home, refinancing (מחזור) are three different products with different work behind them**; (3) explain what we do, cost, next steps; (4) נסגר / לא נסגר — both endings are real outcomes; (5) signed → J-030. [TODAY]
- Hardest stage to automate; "most plausible candidate anywhere in the journey for something that genuinely needs a person" — but "has not been established". [RES/OPEN]
- Content of sales call evaporates today; info about income/timeline/worries is asked again at J-030/J-040. [TODAY]
- Anti-spam: human-dialled call outside Section 30א; automated dialler covered (incl. ring-and-hang-up). [FACT via research page]
- ⚠️ Unverified: whether a business may systematically record customer calls and what notice is owed. [OPEN]
- **Pricing**: "The plan says we charge the full human price (~₪6,000) while running as a normal advisory business, moving to ₪300–500 later." Which applies today "is not written down anywhere". [RES as of Aug 2026; note CLAUDE.md says pre-approval track price is open]
- Lost leads: a person who says no in March may be ready in September; spam law governs re-contact. [OPEN]

### Useful for course
- The intake/needs-analysis conversation; distinction first mortgage vs. home-improver vs. refinance; advisory fee level (~₪6,000 typical human advisor fee — as a plan figure, verify).

---

## 4. J-030 · Document collection (איסוף מסמכים) — page 5636146

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5636146/J-030+Document+collection · Last modified Sep 14, 2026 · Stage page · Automation: manual today, automated is the target · Node 6

### Summary
- "The whole journey waits here"; the part customers dislike most.
- **Correction (S4):** banks do **not** ask for documents at pre-approval — Directive 451 §4ג requires none; a bank sees its first document at J-130. [FACT-SRC + Research "What the banks need before they will lend — Aug 2026"]
- A bank will give a pre-approval "on nothing more than what the customer says about themselves". Mogi collects anyway for three reasons [DEC/approach]: (1) honest quote (a pre-approval priced on a wrong salary "will evaporate later"); (2) know before the bank — "Underwriting is where declared and verified get compared, and a gap there cancels an approval"; (3) documents are needed later at J-130 anyway — collecting early moves work out of "a 24-day window that is already the tightest part of the journey".
- Process: tell customer what's needed by borrower type (salaried, self-employed, buying, refinancing) → customer sends (usually phone photos, piecemeal, not right first time) → check → chase (a loop that can run for weeks) → J-040.
- **Draft document list — explicitly "written from general knowledge, not from our own checklist. Eylon or Amit should correct it."** [OPEN / to verify]:

| Borrower | Typically needed |
|---|---|
| Everyone | תעודת זהות with ספח · תדפיסי עובר ושב for the last 3–12 months · proof of equity (הון עצמי) |
| Salaried | תלושי שכר, usually the last 3 · טופס 106 for the last year |
| Self-employed | שומות מס · financial statements · אישור רואה חשבון |
| Buying a property | חוזה רכישה · נסח טאבו or equivalent registry extract |
| Refinancing (מחזור) | דוח יתרות לסילוק from the existing lender · the current loan schedule |

- **Leumi publishes four different file-opening lists** — buying second-hand, buying from a developer, an any-purpose loan, self-build; each bank writes its own per customer. Checklist should become the union of the four banks' lists. [FACT via research page; RES for approach]
- "Nothing in this stage needs a human judgement" — best place to prove the automation thesis. [RES]
- Chasing messages for missing payslip = utility, not marketing (Section 30א). [FACT via research]
- No bank rule binds this stage. ⚠️ Unverified whether banks accept phone photos vs scans/originals. [OPEN]
- Open: document validity/expiry (a 4-month-old payslip probably stale) [OPEN]; real list [OPEN]; customer visibility [OPEN].
- **Answered:** documents stored in own storage (Postgres on Render, Frankfurt; to Cloudflare R2 EU at ~100 files/month); **not kept once case closed** (closed = client received the mortgage) — Decision 2026-09-10; extended 2026-09-14: lost case deletes them too; a person's file waits for that person's last open case. [DEC]

### Useful for course
- Documents a mortgage borrower needs (with the "to verify" caveat); the logic that pre-approval is on declared data and underwriting compares declared vs. verified; the 24-day pressure in the back half.

---

## 5. J-040 · Data verification (אימות נתונים) — page 5832771

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5832771/J-040+Data+verification · Last modified Sep 14, 2026 · Stage page · Automation: manual today, automated is the target · Node 7

### Summary
- "Where the file stops being claims and starts being facts."
- Steps: identify each document → extract facts (net income from תלושים; balances and existing loan payments from תדפיסים; property identity from contract and נסח טאבו) → cross-check (payslip vs stated income, deposits vs payslip, equity vs balances) → discrepancies back to customer → ready for J-050.
- "A failed check does not usually end the journey — it changes the offer's shape. Lower verified income means a smaller loan, not a goodbye." [RES/claim]
- The bank runs its own verification later at J-150; Mogi's "has to be at least as strict". [approach]
- Target: software decides sign-off; while learning, a person confirms and both opinions recorded — **that is Shadow Mode**, "exists to show when the software can be trusted on its own". [DEC concept / FUTURE]
- Privacy: extract only what the service needs (purpose limitation); per-document definition files reviewed by lawyer. [DEC]
- Answered 2026-08-10: Israeli law imposes conditions on transfer abroad, not data localisation; no financial regulator reaches us; EU materially safer than US (EU has two independent gateways, US none); 2001 Transfer Abroad Regulations; consent at J-010 must say documents may be processed abroad (not retroactive). [RES "Where the law says our customers' data may live — Aug 2026"]
- Decided 2026-08-27: a field is read from a document only if the master field set holds it and at least one bank's pre-approval form demands it ("The v1 data model is derived from the four bank pre-approval forms"). [DEC]
- Decided 2026-09-14: reader = Azure Document Intelligence OCR + own algorithm leads; Claude reads page image blind as a check, switched off field by field on evidence. [DEC]
- Decided 2026-08-13: **open banking is out of version one** (collecting via open banking = שירות מידע פיננסי requiring licence from רשות ניירות ערך). [DEC; regulatory point FACT via research "Which financial regulators reach us — Aug 2026"]
- Reader doesn't open a document before the client signed consent (Decision). Spouse on ספח who is not a borrower compared in memory and forgotten. [DEC]
- Open: how strict is "verified" — each bank's J-150 bar per bank unknown; what stays human. [OPEN]

### Useful for course
- What gets cross-checked in an Israeli mortgage file (income vs payslip vs deposits; equity vs balances); why verification before pre-approval matters; privacy/purpose limitation for financial data.

---

## 6. J-050 · Submit pre-approval request (שליחת אישור עקרוני) — page 5898285

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5898285/J-050+Submit+pre-approval+request · Last modified Aug 05, 2026 · Stage page · Automation: manual today, automated is the target · Nodes 8–9

### Summary
- Question asked: "would you lend this person this much, and roughly on what terms?" → אישור עקרוני.
- Steps [TODAY]: (1) customer signs a **ייפוי כוח** (power of attorney) per bank — each bank has its own form; (2) advisor logs into that bank's **advisor channel** with their own ID, opens application stating income, debts, equity, property; (3) same at the other three banks — "the fan-out ... the point of the product".
- "This is the first stage where a bank sees our customer — but it sees what we say about them, not proof of it."
- **"A pre-approval is a price quoted against unverified claims."** Checking happens later at underwriting; "where declared and verified disagree, the approval is cancelled." [RES / claim, linked to research page]
- Risk is not "will a bank say yes" but "will this yes survive"; measure = how often pre-approvals hold to funding, per bank. [RES]
- Today: all four banks always; target: still all four, with a reason recorded if one is skipped.
- What comes back with the approval (capture per bank): **required-documents list with a deadline** (bank-written for this customer/property; what J-130 must satisfy) and **appraiser referral list** filtered to the property's area (J-140 can only pick an appraiser in the overlap of all four; losing one list costs the saving of a single valuation). [FACT via research / approach]
- **Bank must answer within five business days** — Directive 451 §4ג(א)(5): written accept/reject decision, and pre-approval if accepted, within 5 business days; **seven** only for loan categories pre-defined in the bank's credit policy, and customer entitled to be told about the delay and its reason. [FACT-SRC]
- Business days = Israeli banking days (not the same as holidays) — research "When the Israeli banking system is open — Aug 2026".
- **No documents needed** for pre-approval — §4ג; required-documents list arrives inside the approval. [FACT-SRC]
- **Bank may not charge** — §4ג(א)(1). [FACT-SRC]
- **Approval terms hold for at least 24 days** (J-070 has §4ג(א)(4) and 12-day case). [FACT-SRC]
- Reach bank via its advisor channel, not customer login; all four banks run one; two expressly permit the advisor to run the application through their own software. [FACT via research "Working through the banks' advisor channels — Aug 2026"]
- Israeli criminal statute bans accessing a customer's bank account with the customer's own credentials as a business — does not describe what Mogi does. Banks' own terms restrict automated use inside advisor channel; whether the advisor's own session may be automated is an open legal question. [FACT via research; OPEN]
- **Bank pulls credit data at exactly this moment** — Bank Leumi's published notice names the mortgage pre-approval as trigger for approaching a credit bureau; Hapoalim and Mizrahi publish equivalents. [FACT-SRC (bank notices)]
- Power of attorney scope: bank forms also authorise the advisor to negotiate in borrower's name, sign the loan application and confidentiality waiver, obtain documents from Land Registry, receive credit decision. Hapoalim's lets advisor sign credit-data consent; Discount's only lets advisor receive the חיווי notice. [FACT-SRC (bank forms)]
- **Hapoalim's and Discount's authorisations expire six months after signing** (Hapoalim §14, Discount §15) — answered 2026-08-05 from the forms; Mizrahi form 2873 still to check. [FACT-SRC; OPEN for Mizrahi]
- Always submit to all four? Each enquiry leaves a query record on the borrower's credit file that the next bank can see; maybe three. S4 reason to keep four: appraiser list portability. [OPEN]
- Open: automation of advisor session; would banks give documented access; survival rate; channel-down fallback. [OPEN]

### Useful for course
- How a pre-approval request is made in practice (power of attorney, advisor channel, four banks in parallel); the Directive 451 timing rules (5/7 business days; 24/12 days; free of charge; no documents); credit-bureau check timing; appraiser lists.

---

## 7. J-060 · Bank response and tracking (אישור / סירוב) — page 5931054

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5931054/J-060+Bank+response+and+tracking · Last modified Aug 03, 2026 · Stage page · Automation: manual · Nodes 10, 11, 13, 14, 15

### Summary
- Some banks answer **immediately** (automatic checks pass); others route to a **רפרנט** (bank employee who looks at the file properly) — then days. [FIELD/RES — no source given]
- Outcome per bank: אישור or סירוב. A refusal ends that bank, not the file; with four running one refusal costs nothing if another approves.
- An approval is not yes/no — it comes with an amount, a rate, and conditions; capture all terms from all four banks. [approach]
- **Five business days, or seven with a reason** — Directive 451 §4ג(א)(5). [FACT-SRC]
- **Pre-approval valid for at least 24 days, not a month** — §4ג(א)(4): terms held not less than 24 days from the pre-approval, stated prominently on it. Where the loan needs **no new lien (שעבוד חדש)** — "a good part of refinancing" — floor drops to **12 days** under §4ג(ז). Banks may give longer; "nothing may be built assuming more than 24 days". [FACT-SRC]
- **"The 'rates are valid for three months' figure is folklore until someone proves otherwise."** Not established by Directive 451; search found nothing. "Do not build against three months." [RES — flags a common field claim as unverified] ⚠️ CONTRADICTION candidate with any field claim of 3-month validity.
- Bank's own credit enquiry happens at the start of this window.
- Open: what triggers רפרנט route; does 24-day clock start at approval date or receipt; counting business days (חול המועד, half-days, fast days); first bank approves while fourth hasn't answered; is a refusal reason ever in writing. [OPEN]

### Useful for course
- Pre-approval validity (24/12 days) and the "3 months" myth; response deadlines; רפרנט concept; refusals are per bank.

---

## 8. J-070 · Document completion loop (השלמת מסמכים) — page 5931117

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/5931117/J-070+Document+completion+loop · Last modified Aug 21, 2026 · Stage page (retired as a pre-approval event, kept as record) · Node 12

### Summary
- **Settled 2026-08-13**: documents go to banks only at file opening (J-130), never during pre-approval (Decision "Documents go to banks only at file opening, not at pre-approval"). Consequences: loop disappears as a pre-approval event; what remains is status-chasing; chase machinery built once at dispatch; bank queries during underwriting stay at J-150. [DEC]
- Pre-decision record: bank asks for evidence (payslip, property document, source of deposit) — "not a refusal"; bank sets the list; up to four banks asking different things; a clock is running.
- Directive 451 §4ג(א)(4): bank holds offered terms for not less than 24 days from the pre-approval "while the borrower supplies the verification documents"; stated prominently. No new lien → 12 days §4ג(ז). [FACT-SRC]
- "A customer who takes eleven days to find a document has used most of a 12-day window."
- "This is the clock the whole back half of the journey races": booking signing meeting, file-opening documents, property valuation all draw on the same window; **"the days are calendar days, so a חג inside the window is days gone."** ⚠️ Note: J-050/J-060 speak of "business days" for the 5/7-day answer, while the 24-day window is described here as calendar days — different clocks, not a contradiction, but worth teaching precisely.
- Leumi publishes a separate list of documents to **open the loan file** — purchase contract, proof of ownership, ID, tax report. [FACT via research]
- Eden's position: documents go **only** at the later point (became the decision). [DEC 2026-08-13, Eden]
- Mizrahi's advisor screen supports uploading documents against a live application. [FACT via research]
- Open (still): does a document expire (payslip stale after 3 months?); does supplying a document reset the 24-day clock; what happens when the window closes (re-issue / re-price / restart). [OPEN]

### Useful for course
- The 24-day window as the governing clock of the back half; calendar vs business days; holidays eat the window.

---

## 9. J-080 · Pre-approval dashboard (הצגת אישורים עקרוניים) — page 6455359

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/6455359/J-080+Pre-approval+dashboard · Last modified Aug 03, 2026 · Stage page · Automation: manual · Node 16

### Summary
- Customer sees up to four אישור עקרוני side by side — "the moment the product becomes visible".
- "Four approvals are not four numbers. Each is an amount, a proposed mix of loan tracks, a rate on each track, and conditions. Two banks quoting different mixes cannot be compared by looking at them."
- **Directive 451 requires every bank to quote the same three סלים אחידים** (uniform baskets), identical at every bank [FACT-SRC]:

| Basket | Composition |
|---|---|
| סל אחיד 1 | 100% קבועה לא צמודה — fixed rate, not linked to inflation |
| סל אחיד 2 | ⅓ fixed unlinked + ⅓ prime + ⅓ variable linked to inflation, resetting every 5 years |
| סל אחיד 3 | ½ fixed unlinked + ½ prime |
| סל מוצע | The bank's own tailored suggestion for this borrower |

- Uniform baskets are "the only genuinely like-for-like numbers across four banks"; the bank's suggested mix is where banks differentiate.
- In uniform baskets the customer picks one term; repayment is **לוח שפיצר** (equal-payment schedule) — fixed by the directive. [FACT-SRC]
- **קבועה צמודה appears in none of the three baskets.** [FACT-SRC]
- Directive 451 contains a prescribed method for **העלות הממשית של האשראי** (the real cost of credit), including how to handle tracks with no forecast and requiring the early-repayment fee to be included. [FACT-SRC]
- **No language model does the arithmetic** — deterministic, auditable, built to the directive. [DEC]
- Each pre-approval carries its own deadline (≥24 days, sometimes 12).
- Today: advisor assembles and compares via judgement + spreadsheet; target: computed per regulator's method; recommendation by mix engine at J-090 with advisor checking. [TODAY/FUTURE]
- Open: how much to show; wildly different amounts (e.g. one bank ₪200,000 less); show refusals?; is this where customer pays (paywall currently between J-110 and J-120); seen with or without advisor. [OPEN]

### Useful for course
- Uniform baskets (סל אחיד 1/2/3) as the comparison standard; Spitzer schedule; real cost of credit; why mixes can't be compared by eye.

---

## 10. J-090 · Mix construction and calculator (בניית תמהיל ומחשבון) — page 7503881

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7503881/J-090+Mix+construction+and+calculator · Last modified 2026-10-08 · Stage page · Automation: assisted today, automated is the target · Nodes 17–21
- (Dates recovered from the page's date macros via ADF: same-property rule effective 2026-10-01; circular ח-2840-06 dated 2026-02-08; circular 2852 dated 2026-06-30; Eylon confirmation 2026-10-07; BoI data verification 2026-10-07–08.)

### Summary
- "A mortgage is not one loan. It is several loans taken together — **מסלולים**, tracks — each with its own rate, its own linkage to inflation, and its own length." The division = **תמהיל** (mix). It decides monthly payment, total cost, exposure to rate rises.
- Stage produces three mixes (named on the flowchart):
  - #1 תמהיל החזר חודשי נמוך — lowest monthly payment
  - #2 תמהיל חיסכון כולל מירבי — lowest total cost over life of loan
  - #3 תמהיל חשיפה לריבית מינימלית — least exposure to rate changes
- Plus a movable calculator (change term, shift money between tracks).
- "There is no single best mix. The cheapest total cost usually means a higher payment now. The safest mix usually costs more." [RES/principle]
- Today: split chosen by advisor's judgement & experience; legality from advisor's memory; costing by spreadsheet or "a ₪119/month tool" (Wise, the incumbent); explanation "Trust me". Target: engine examines every legal split and ranks; illegal mix never proposed; computed by regulator's method; explains rule that eliminated each rival; **engine decides**, Shadow Mode while learning (advisor decides, both opinions recorded). [TODAY / FUTURE / DEC concept]
- In: approved amounts and rates per bank; borrower income and commitments; property value and type. Out: three costed legal mixes with reasoning + chosen direction → J-100.
- **Hard limits (Bank of Israel Directive 329)** [FACT-SRC]:

| Limit | Value | Source |
|---|---|---|
| Loan-to-value (LTV) | ≤ 75% only home · ≤ 70% replacement home · ≤ 50% investment property | 329 §2 |
| Payment-to-income | ≤ 50%, absolutely | 329 §5 |
| Payment-to-income | above 40% the bank must hold far more capital | 329 §6 |
| Variable-rate share | ≤ 66.66% → at least a third fixed | 329 §7 |
| Maximum term | 30 years | 329 §8 |

- **"40% is a price boundary, not a refusal boundary."** Above it: 100% risk weight; "A borrower at 42% is not rejected — they are expensive to hold, so they are priced worse." Moving someone from 41% to 39% (lengthen term, restructure existing loan, add guarantor) is "exactly the advice a good advisor gives" — candidate signature feature. [FACT-SRC + RES]
- **"The variable cap is not a cap on prime."** Covers any rate that can change during the loan's life, incl. a track resetting every five years; rule is "at least a third fixed", not "at most a third prime". A shipped free Israeli optimiser measured returning 67% variable at every setting (team's own measurement; no page). [FACT-SRC + RES]
- **Same-property repayment rule, in force since 2026-10-01**: when a borrower takes a housing loan on a property that already carries one, monthly payments on earlier loans count towards payment-to-income limit (same bank, other bank or non-bank lender) as long as **more than 18 months remain**. Originated in circular ח-2840-06 (2026-02-08); circular 2852 (2026-06-30, boi.org.il/media/hjrlkrse/h2852.pdf) postponed effective date to 2026-10-01. Bites on refinances and top-ups. [FACT-SRC]
- Cost calculation per Directive 451 (research page "How the regulator says to compare mortgage offers"): uniform baskets are **exact fractions**; calculation needs the whole future payment schedule because the pre-approval must state the **highest monthly payment** the forecast produces. [FACT-SRC]
- Forecasts: Bank of Israel nominal and real zero curves, free Excel workbook naming Directive 451 in its header; curves are **monthly averages published twice a month**; expected inflation = **compounded** gap between the curves, not simple subtraction (wrong by a few bp). [FACT-SRC via research "The rate and index data feeds"]
- At least a third fixed, and "**the fixed part is exactly the part that carries an early-repayment penalty**" (link: research "What it costs to leave a mortgage early (קנס היוון)"). [FACT via research — to verify nuance: per general knowledge variable tracks can also carry fees; page states fixed part carries the penalty]
- **Each track can have its own term — "Settled by Eylon on 3 August 2026: yes, and it happens often enough that we have to support it." Example: fixed-unlinked over 25 years alongside prime over 15.** [FIELD — Eylon, 2026-08-03; DEC for engine]
- Term per track → ~150 billion combinations at coarse grid; brute force dead; terms separate once split fixed (interact only via payment-to-income sum). [RES]
- **No LLM does the arithmetic** — deterministic, reproducible, traceable to a directive section. [DEC]
- Open: optimise across all banks or per bank; round amounts per track (banks may not book ₪237,412.71); what "optimal" means in Wise (₪119/month); which own charges belong in cost calculation (Fair Credit Law — lawyer question); BoI Q&A file for Directive 329 not read; what needs human judgement. [OPEN]
- Links: "Mortgage repayments and affordability follow the agreed calculation rules" (page 67436545) — answers **confirmed by Eylon on 2026-10-07**; "Bank of Israel data connections for the mortgage optimizer — Oct 2026" (67469313), verified 2026-10-07–08. (Both read below.)

### Useful for course
- Core curriculum: tracks/מסלולים, תמהיל, the three mix goals, Directive 329 limits (LTV by property type, PTI 50%/40%, one-third fixed, 30-year max), same-property repayment rule from 2026-10-01, track-specific terms, prepayment cost logic, BoI forecasts.

---

## 11. J-100 · Issue offers to banks (הנפקת הצעה לבנקים) — page 6848521

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/6848521/J-100+Issue+offers+to+banks · Last modified Aug 03, 2026 · Stage page · Automation: assisted today, automated is the target · Nodes 22–23

### Summary
- Customer's chosen direction (roughly this much fixed, this much prime, over roughly these terms) is sent to every bank that approved; each prices the same mix. "Four institutions are competing for the same customer on the same thing at the same time." Round one; J-110 may run another.
- **"This stage is commercial practice, not regulation."** Pre-approval (J-050) is regulated; asking a bank to sharpen pricing is negotiation. [RES/FACT]
- Clock: ≥24 days, 12 where no new charge — Directive 451 floors. "A second round that runs past the expiry does not produce a worse offer — it produces no offer, and the whole pre-approval has to be sought again." [FACT-SRC + claim]
- Today: request retyped per bank from advisor notes; four systems/logins; chasing by memory; four documents read one at a time; judging offers by "advisor's sense of the market". Target: from case record, sent by system, parsed and costed, judged against what these banks did on comparable files. [TODAY/FUTURE]
- Advisor channels: all four banks run one; two state in writing advisor may use own software; banks' terms restrict automated use; automation of advisor's own session = the one unclosed legal question. Criminal provision about customer credentials does not apply. [FACT via research; OPEN]
- Comparability by regulation: same three uniform baskets, costed by the Directive 451 method with BoI forecast inputs. [FACT-SRC]
- **No known deadline for answering a re-pricing request**; 5-business-day rule applies only to the pre-approval decision. [OPEN]
- Open: lawful automation; documented access; all four vs triage ("a bank that is always asked and never chosen may stop trying"); does telling a bank it is one of four sharpen or disengage ("central commercial assumption ... untested"); customer has not paid yet; bank offer worse than its own pre-approval. [OPEN]

### Useful for course
- Negotiation round mechanics; what is regulated vs commercial practice; the expiry window constraining rounds.

---

## 12. J-110 · Present offers and negotiate (הצגת ההצעות ללקוח) — page 8126465

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8126465/J-110+Present+offers+and+negotiate · Last modified Aug 03, 2026 · Stage page · Automation: assisted today, automated is the target · Nodes 24–29

### Summary
- Customer sees priced offers; proceeds, asks for another round (flowchart version 1 / version 2), or walks away. "The only loop in the journey that exists purely to get a better price." Last stage before the customer pays (per board at the time).
- Directive 451 defines **העלות הממשית של האשראי** (actual cost of credit), computed identically by every bank from BoI forecast inputs; plus three uniform baskets. "So we are not inventing the measure, and we should not try to." [FACT-SRC]
- **For a customer who already holds a mortgage the regulator prescribes the refinance decision**: existing loan carries two published figures — cost of staying, and cost of staying including the price of leaving; "If the second is higher than the expected cost of the new offer, refinancing pays." Early-repayment fee inside one figure. [FACT-SRC via research — verify exact Directive wording]
- Clock caps rounds: 12 or 24 days; "how many rounds" is "arithmetic against a deadline". [FACT-SRC + RES]
- **Position taken deliberately (product stance, Aug 2026):** "We decide when it is enough" — when a further round is unlikely to beat what's on the table, we say so and why; reasoning shown; customer can overrule; record kept. [DEC-ish "a position, taken deliberately"]
- **Shekels first leaning:** lead with money ("This one costs you ₪43,000 more over the term"), show official percentages beside it labelled as regulated figures; never replace them. "A leaning, not a settled decision." [RES]
- No LLM arithmetic. [DEC]
- Open: will a bank accept an automated counter-ask; how much without a person; unexpected best bank (loyalty); files ending here (node 28); paywall placement; disclose that banks are told they compete. [OPEN]

### Useful for course
- How to compare offers (actual cost of credit, uniform baskets); refinance decision rule; negotiation rounds vs. expiry; presenting cost in shekels.

---

## 13. J-120 · Meeting coordination (תיאום פגישה) — page 8454147

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8454147/J-120+Meeting+coordination · Last modified Aug 05, 2026 · Stage page · Automation: manual today, automated is the target · Nodes 30–33

### Summary
- Board marks this as **שלב ללקוחות בתשלום — the paid stage**.
- Steps: ask the bank's **referent** (named banker handling the file) for dates → reply by email/phone with times → customer picks → confirm to bank.
- **One meeting — the signing meeting (J-160)**; booked before J-150 verification finishes, so booked before we know for certain the bank will still lend.
- **Remote signing:** "no law requires it to happen in a room at all". בנק לאומי sells a mortgage signed entirely remotely; מזרחי טפחות does it for refinances only; הפועלים and דיסקונט unknown. [FACT via research "Signing electronically, and the two powers of attorney — Aug 2026"]
- Clock: 24 days / 12 days (Directive 451 §4ג(א)(4), §4ג(ז)); if several banks alive, each own clock, earliest governs. [FACT-SRC]
- **Israeli banking days ≠ holidays:** banks shut on פורים, תשעה באב, ערב יום כיפור and יום העצמאות; **open on all of חול המועד** "which most people assume is closed". [FACT via research "When the Israeli banking system is open — Aug 2026"]
- No bank exposes a diary: Mizrahi appointment page offers only phone + secure messaging; Hapoalim online booking excludes financing/credit matters (directs to branch holding account); Israel's open banking standard covers balances, transactions, payments, credit, deposits, securities — **no scheduling scope**. [FACT (bank sites)]
- Leumi's terms restrict automated use of its advisors' area; other three not read; "a contract term rather than a law". [FACT via research; OPEN]
- Open: how many meetings (several banks alive?) — biggest open item; remote signing at Hapoalim/Discount; branch hours vs system calendar; **paywall location — four candidate moments: J-080, J-100, J-110, J-170**. [OPEN]

### Useful for course
- What happens between choosing an offer and signing; banking-day calendar; remote signing availability by bank.

---

## 14. J-130 · Document dispatch to banks (שליחת המסמכים לבנקים) — page 8716289

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8716289/J-130+Document+dispatch+to+banks · Last modified Aug 13, 2026 · Stage page · Automation: manual today, automated is the target · Node 34

### Summary
- **First time a bank sees a document.** Pre-approval needs none (Directive 451 §4ג). [FACT-SRC]
- Steps: pre-approval arrives with bank-written list of documents + date → assemble pack → send via advisor channel → **bank opens the file (פתיחת תיק) and charges the customer a fee of up to about ₪360** [FACT via research; verify current figure] → bank says what's missing → then J-150.
- ⚠️ For an **any-purpose loan on a property already owned** and **self-build**, Leumi: *"תיק ייפתח לאחר קבלת שמאות"* — file opened only after valuation; order reversed vs board. [FACT-SRC (Leumi)]
- **Confirmed by Eden, 4 August**: every document collected up front at J-030 — תעודת זהות plus ספח, **three months of תלושי שכר**, **three months of bank statements**, rest of checklist. [DEC/TODAY — Eden 2026-08-04]
   - ⚠️ Minor inconsistency: J-030's draft table says bank statements "for the last 3–12 months"; J-130 (Eden) says three months.
- Bank tells us what's missing → bounded loop; per-bank lists are an optimisation, not prerequisite.
- **Leumi's four file-opening lists** [FACT-SRC (Leumi)]:

| Deal | Bank asks for |
|---|---|
| Buying second-hand | Purchase contract · proof of ownership (from טאבו, רשות מקרקעי ישראל or the חברה משכנת, depending where rights sit) · ID + ספח · tax report on the transaction |
| Buying new from a developer | Full contract incl. every annex · developer's payment slip · ID + ספח · tax report |
| Any-purpose loan on owned property | Proof of ownership · ID + ספח · valuation first |
| Building your own house | Proof of ownership · ID + ספח · building plans and permits · valuation first |

- Also must reach the bank before lending: the **property valuation** (J-140) and **insurance policies** — life cover for the loan balance and buildings cover including earthquake, with the bank named beneficiary. "Nobody has drawn a step where insurance is bought." [FACT via research; OPEN where in flow]
- Customer consent to platforms: Hapoalim's advisor authorisation states application may be submitted on platforms not the bank's, hosted in Israel or abroad; Discount same, adding bank may disconnect advisor at any time. [FACT-SRC (bank forms)]
- Data-security regulations: personal data over public network protected by accepted encryption. [FACT-SRC (regs named generally)]
- Leumi advisors'-area terms carry an anti-crawler clause; others unread. [FACT; OPEN]
- Clock: ≥24 **calendar** days / 12. [FACT-SRC]
- Open: other banks' file-opening lists; session automation (needs Israeli financial-regulation lawyer opinion); other banks' terms; documented access; **where does insurance get bought — "It is mandatory, it produces a document the bank must hold, the bank's own policy is usually the expensive one, and no stage on the board covers it."** [FIELD-ish claim, unattributed]; whole pack vs one doc at a time. [OPEN]

### Useful for course
- File opening (פתיחת תיק) and its fee; document packs by deal type; required insurance types; order valuation vs file opening.

---

## 15. J-140 · Property appraisal (שמאות) — page 8716324

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8716324/J-140+Property+appraisal · Last modified Aug 06, 2026 · Stage page · Automation: manual today; booking and tracking automatable, visit is not · Node 35

### Summary
- **שמאי** = licensed property appraiser; bank won't lend until property valued (property = security).
- Steps: (1) each bank hands a **הפניה לביצוע שמאות** + list of its appraisers; list arrives with the pre-approval; Directive 451 requires it filtered to the property's area [FACT-SRC]; (2) customer or advisor phones an appraiser — no marketplace/booking system; "all three banks that publish instructions say to telephone"; **field banker confirmed (call, August 2026) this is how it goes in the field, and the advisor makes the call as often as the customer** [FIELD — field banker, Aug 2026]; (3) physical visit — Directive 451 §10(א): *"עריכת השומה מחייבת ביקור פיזי בנכס"* [FACT-SRC]; (4) customer pays the appraiser ~**₪500–850** for a property under ₪4M (Discount's published range), ₪600–2,000 more widely depending on size [FACT-SRC (Discount) + RES]; (5) **appraiser sends report straight to the bank**, customer may ask the bank for a copy and is entitled to one — **field banker confirmed (call, Aug 2026)** [FIELD + FACT].
- "We are not in the commercial loop."
- **One valuation, not four:** Directive 451 §9(ה): bank **shall not unreasonably refuse** a valuation the borrower holds, if produced at another bank's request, appraiser is on this bank's list, and **≤90 days** since valuation date. Hapoalim collateral page: *"אם כבר ערכתם שמאות עבור בנק אחר ב-3 החודשים שקדמו לביצוע ההלוואה תוכלו להעביר לנו עותק ממנה"*. [FACT-SRC]
- **field banker (call, Aug 2026): "if you have a valuation from one bank, the other banks are obliged to accept it."** Written rule narrower; off-list appraiser case not asked. [FIELD — field banker] ⚠️ CONTRADICTION/tension with written rule (§9(ה) conditions + "not unreasonably refuse" + bank may demand adjustments).
- Order forced: all four approvals → compare lists → pick appraiser on all → book once. "A system that orders the valuation early to save time will order the wrong one." No bank publishes its list. [RES]
- Liability: if we pick the appraiser, the risk of non-portable valuation becomes ours; three rules if brokering: never recommend before all four approvals; say plainly when overlap empty/thin; record every recommendation and whether portable. [RES/proposal]
- Cautions: "shall not unreasonably refuse" ≠ must accept; bank may require report sent directly and demand adjustments. **No "at least three appraisers" rule** in Directive 451; three is bank practice, not uniform — Mizrahi's page says three, Leumi's form has six numbered slots. [FACT-SRC]
- Value to customer: **₪1,500–2,550** (one valuation instead of four). [RES]
- **Directive self-contradiction:** list requirement at §4ג(ג)(2) in current version; §9(ה) refers to §4ג(ב8) (old location) — cite §4ג(ג)(2). [FACT-SRC, flagged]
- **Internal refinance needs no valuation at all**; moving to a different bank does. [claim, unsourced on page — verify]
- Physical visit = "the first genuinely irreducible human step this journey has met".
- Open: off-list appraiser acceptance (follow-up to field banker); should Mogi pick the appraiser; meaning of "unreasonably refuse"; other banks' fees (Discount fee PDF digits reversed); duration call→report; appraiser directory (chamber ~1,900 members with phones; government register ~3,100 licensed appraisers, no contacts). [OPEN]
- Source of field banker answers: "Question Files - field banker" (page 3112963).

### Useful for course
- שמאות end to end: referral, appraiser lists, physical visit, fees, report to bank, 90-day portability (§9(ה)), myths (three appraisers), internal refinance exemption.

---

## 16. J-150 · The bank's own verification (אימות נתונים של הבנק) — page 9863169

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9863169/J-150+The+bank+s+own+verification · Last modified Aug 04, 2026 · Stage page · Automation: manual today, automated target (most work is the bank's) · Node 36

### Summary
- **חיתום** (chitum) = underwriting — checking borrower is who they said, property worth what they said.
- Steps: documents (J-130) + valuation (J-140) arrive → bank reads them properly, first time → pulls its own **חיווי אשראי** (credit indication from the national credit register) after notice → reviews appraiser report, may require adjustment → checks title and security → one of four answers: proceeds / wants more documents / changes the terms / **cancels the pre-approval**. [FACT via research]
- Sequence: "a price quoted on unverified claims → a window of 24 days, or 12 → the claims get verified → the price may evaporate."
- "The most useful thing we can do here is make sure nothing is discovered" — find it at J-040. [RES]
- Credit check: Leumi notice names pre-approval as the moment it may approach credit bureau, incl. on renewal; Hapoalim and Mizrahi equivalents. "An independent pull by us does not change the bank's decision" — value is upstream. [FACT-SRC (bank notices) + RES]
- Bank may demand valuation adjustments — §9(ה). [FACT-SRC]
- **Nothing in any directive says how long the bank may take.** [FACT-SRC (absence)]
- Open: how many banks alive at this point (biggest open item; dropping to one at offer stage means a refusal restarts with expired approvals); how long verification takes (unmeasured); what gets discovered and how often; can we see underwriting status; what removes the person from chasing. [OPEN]

### Useful for course
- חיתום explained; pre-approval ≠ promise; credit check (חיווי אשראי) timing; four possible underwriting outcomes.

---

## 17. J-160 · Signing meeting (פגישה וחתימות מול הבנק) — page 9863207

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9863207/J-160+Signing+meeting · Last modified Aug 04, 2026 · Stage page · Automation: manual today, automated target · Node 37

### Summary
- Steps: (1) sign loan agreement + bank's explanation pages; (2) sign security documents — **שטר משכנתא** (mortgage deed registered at the Land Registry), or **משכון זכויות** where ownership not yet registered in buyer's name, and **הערות אזהרה** (cautionary notes protecting buyer and bank); (3) **ייפוי כוח נוטריוני** — notarial POA letting the bank register the mortgage and borrower's rights; (4) **insurance must exist, naming the bank as irrevocable beneficiary**, bank confirms in writing; (5) customer picks payment day — **1st, 10th or 15th**. [FACT via research]
- Electronic signature: since 2018 an ordinary electronic signature satisfies statutory signature requirement if it serves the purpose; exceptions list two lines, both wills (חוק חתימה אלקטרונית §2(א)(2)). [FACT-SRC]
- Directive 451 searched for branch/signature/notary: no provision requires a physical meeting. **Directive 367 §39** (remote contract signing): bank ensures customer confirmed they could read it and agreed; text stays available and printable; names no signature technology. [FACT-SRC]
- Leumi markets a **משכנתא דיגיטלית** — whole process without branch, "ואפילו לחתום מרחוק"; Mizrahi Tefahot remote for refinances only; Hapoalim/Discount unknown. [FACT (bank sites)]
- "So the meeting is convention and bank policy, not law."
- Notary: notary regulations have no provision for video appearance; certificate may be electronic. **§20(א1) of חוק הנוטריונים: a POA given to a bank for a mortgage transaction is valid without a notary** — banks demand it anyway, consistently. [FACT-SRC + practice]
- §3א of electronic signature law: burden of proving signature on whoever designed the signing flow. [FACT-SRC]
- **Insurance: Directive 451 §11(א)** — in place, bank irrevocable beneficiary; customer may buy anywhere and bank must tell them so in large letters; bank may not require buildings cover above the unpaid revalued balance; none of it applies below ₪30,000. [FACT-SRC]
- **Repayment date 1st/10th/15th — Directive 451 §16(ג)**; banks may offer other dates; "usually made in three seconds at a desk"; interacts with pay date and interim-period charge. [FACT-SRC]
- Today: customer often buys insurance "from the bank's agency at the counter". [claim, unattributed — field-ish]
- Open: Hapoalim/Discount e-signature; fully remote with טאבו registration (notary suggests not); **"Nobody on the team has sat through one ... Everything on this page about the room is second-hand"**; when insurance really bought; does the advisor attend. [OPEN]
- Related research: "The bill to license mortgage advisors — Aug 2026" (9568265).

### Useful for course
- Signing: documents (שטר משכנתא, משכון זכויות, הערת אזהרה, notarial POA), mandatory insurance (life + structure incl. earthquake; free choice of insurer), payment day choice, remote signing law.

---

## 18. J-170 · Mortgage funded (העמדת משכנתא) — page 9895937

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9895937/J-170+Mortgage+funded · Last modified Aug 04, 2026 · Stage page · Automation: manual today, automated target · Node 38

### Summary
- Steps: (1) **security perfected first** — הערת אזהרה in bank's favour, or משכון זכויות if not registered; (2) insurance accepted in writing; (3) bank transfers money — to seller, developer, or previous lender in a refinance; (4) existing mortgage paid off on a **מכתב כוונות** (letter of intent from existing lender: what it will take to release its lien, by when); (5) schedule anchored; (6) mortgage registered at Land Registry afterwards using notarised POA; (7) customer starts paying on 1st/10th/15th.
- **Directive 451 §17**: index-linked loan paid out **1st–15th** → treated as starting on the 1st of that month, first payment 1st of next month; **16th–end of month** → treated as starting 1st of following month. [FACT-SRC]
- **Directive 451 §18 — תקופת הביניים (interim period)**: bank charges interest if actual payout earlier than anchor, credits borrower if later; verbatim §18(ב) quoted on page; at the loan's contract rate (§18(ג)); settled in first payment or a month before; indexation via base index (§18(ד)). [FACT-SRC]
- **§19**: credit balance returned as soon as possible with interest and indexation; may not be used to repay a different loan without express written consent. [FACT-SRC]
- **מכתב כוונות**: template in Directive 451 (תוספת 3); duty from **§9א of חוק הבנקאות (שירות ללקוח)**; letter must name number of days; amount good until stated expiry — **letter issued on the 26th runs to the 10th of next month; one issued on the 11th runs to the 25th**; balance moves with rates, index and early-repayment fee — confirm immediately before transfer. [FACT-SRC]
- **Directive 451 §16(א)**: bank executes the loan on the date the borrower asks for, as a rule. [FACT-SRC]
- Receipts: every payment needs a **חשבונית מס קבלה**; e-invoicing regime does not reach consumer sales at either price point. [FACT via J-170 choices page]
- **Anti-spam §30א(ד)(2)**: end of engagement treated as refusal → marketing consent flips off. [FACT-SRC]
- Today: nobody checks interim-period settlement or first payment schedule; registration chased by customer's lawyer. [TODAY]
- Paywall: board marks paid stage from node 30 but no node collects money; four candidate moments (J-080, J-100, J-110, J-170). [OPEN]
- Open: signing→money duration; does anyone get interim settlement wrong ("Checking twenty files would answer it"); registration chasing; when to charge; post-funding relationship (refinancing, "the ₪30,000 insurance cancellation", rate reset, early-repayment window); what customer needs at end. [OPEN]

### Useful for course
- What "funding" involves; §17 anchoring and §18 interim interest; letter of intent mechanics for refinance/existing lien; registration; post-funding events.

---

## 19. 2026-07-27 — מבוא לשוק המשכנתאות בישראל (אילון ודביר) — page 2949123  ★ MAIN FIELD-KNOWLEDGE SOURCE

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/2949123/2026-07-27 · Last modified Jul 31, 2026 · Author: Dvir Kakun · Type: Meeting notes (one-on-one teaching call, Monday 27 July 2026 19:35 IL time, ~42 min; participants אילון (organiser), דביר; Fireflies recording linked)
- Purpose: base picture of the Israeli mortgage market before the 29.07.2026 idea meeting.
- **Page itself says: "לא התקבלו החלטות בפגישה הזאת — היא הוקדשה כולה להעברת ידע."** So everything below is [FIELD — Eylon, 2026-07-27, to verify] unless noted. The page is a summary written by Dvir from the recording; statements are mostly attributed to the conversation generally, with Eylon as the knowledge-giver ("אילון (מארגן)"). Where the page says "נאמר"/"הוצגה העמדה" it is impersonal.

### Every professional statement (each = field knowledge / to verify)

**Mortgage types (סוגי משכנתאות)**
1. **משכנתא ראשונה** — first-apartment purchase. Required equity **25%** of property value ("ממיליון ₪ — 250,000 ₪ מהבית"); "על כל שקל הון עצמי הבנק מעמיד כ־3 ₪". [FIELD; consistent with Directive 329 §2 LTV 75% (J-090)]
2. **מגבלת החזר** — "בנק ישראל קבע תקרה של **50%** מההכנסה הפנויה; הבנקים מחמירים בפועל ל־**40%** (בניכוי הלוואות קיימות), כך שנשארת לפחות **60% הכנסה פנויה** למחיה (ארנונה, חינוך, דלק וכו')." "המשכנתא אמורה להחליף את השכירות — לא את החיים." [FIELD] ⚠️ Tension with J-090 / Directive 329 §6: 40% is a **price/capital boundary, not a refusal boundary** (Brain research). Course should present both: regulatory cap 50%; above 40% → higher capital/worse pricing; banks' practical appetite per Eylon ~40%.
3. **מחזור פנימי** — reopening the mortgage at the same bank when market conditions improved (e.g. rate drop); can propose a new mix; bank re-examines. [FIELD]
4. **מחזור חיצוני** — moving the mortgage to another bank; "רגולטורית זו **העמדת אשראי חדש** אצל הבנק הקולט, ולכן מעט מורכב יותר ממחזור פנימי." "שני סוגי המחזורים הם **רוב עיסוקו של יועץ משכנתאות בישראל**." [FIELD]
5. **משפרי דיור** — moving from existing apartment (with mortgage) to another: financing up to **70%** of the new property value (not 75%). [FIELD; consistent with 329 §2 "≤70% replacement home"]
6. **בנייה עצמית** — up to **50%** financing on the land, then up to **70%** of the future property value. [FIELD — to verify; no directive cited]
7. **משכנתא הפוכה** — for seniors: fully owned property pledged for liquid money (move to assisted living, help children etc.); repayment monthly or at death through beneficiary/insurance, repaying the proportional part. "**ייחוד: אין בה חובת ביטוח חיים.**" [FIELD]
8. **פארי פאסו / משכנתא מדרגה שנייה** — two banks pledge the same property (e.g. Leumi on 40% and Mizrahi on another 20%). Part of the "micro" of the field "שרוב היועצים כלל לא מכירים". [FIELD]

**Mortgage vs regular loan**
9. Unsecured loan ("סולו") given on income, debts and credit conduct (credit score) only; car financing = example of a loan with a lien. [FIELD]
10. Mortgage = long-term loan with **property as security**. "בפועל הבנקים לא ששים לממש בתים (נראוּת ציבורית, סטטיסטיקות הוצאה לפועל), במיוחד מול לקוח שיודע לדבר — נקודת תורפה מובנית במודל." [FIELD/opinion]

**Age & term limits**
11. Max age to take a mortgage: **70**; mortgage can last until age **80** ("חוק מ־2016"). [FIELD — to verify; legal source not given]
12. Max term **30 years** [consistent with 329 §8]. "מינימום פורמלי של שנה, אך בפועל הבנקים נמנעים מלתת מתחת ל־5 שנים ומפנים לאפיקים אחרים." [FIELD]

**Three strategies for choosing a mortgage**
13. (1) **Minimum monthly payment** — most households' approach ("זה במקום שכירות"). (2) **Minimum total repayment** (principal + interest) at end — the "business" (IRR) view: "ההפרש בין החזר של 1.7 מיליון ל־1.9 מיליון הוא 200 אלף ₪ שיכלו להישאר בבית." (3) **Minimum exposure to rate changes** — "בשיחה הוצגה העמדה שזהו בעיקר 'ספין' של יועצים, כי תמיד אפשר למחזר." [FIELD/opinion] (These three = the flowchart's three mixes in J-090.)
14. "**מחזור אינו מוגבל** אך יש לו עלויות: **קנס היוון** — תשלום על הדלתא בין הריבית שהתחייבת עליה לריבית הנוכחית (למשל התחייבות על 8.5% כשהריבית ירדה ל־7% — קנס על ה־1.5%)." [FIELD — simplified; Brain research page on קנס היוון (7798786) has the regulated mechanics — verify]

**Process (הוראה 451)**
15. **אישור עקרוני** — digital form per bank separately: personal details and spouse's, incomes, חיווי אשראי, equity. "לרוב האנשים ניתן 'אישור מהיר' במקום." [FIELD; cf. J-060 immediate vs רפרנט]
16. **"הוראה 451 ('שלושת הסלים', סוף 2020)"** — every bank issuing a pre-approval **must** give **three offers in uniform mixes identical across banks** "(פריים, קבועה צמודה, קבועה לא צמודה)" — so as not to compare "תפוז לתפוח"; offers arrive by default without asking. [FIELD] ⚠️ **CONTRADICTION** with J-080 (Brain research citing Directive 451): basket 1 = 100% קבועה לא צמודה; basket 2 = ⅓ fixed unlinked + ⅓ prime + ⅓ variable CPI-linked resetting every 5 years; basket 3 = ½ fixed unlinked + ½ prime; and "**קבועה צמודה appears in none of the three baskets**". The parenthetical list of track types in the Eylon summary is wrong or garbled — verify against Directive 451 text. Also the "end of 2020" date is to verify.
17. **Response times — "חוק מ־2021"**: bank must answer a pre-approval within **5–7 business days**, otherwise exposed to lawsuits. [FIELD] ⚠️ Brain research: the source is Directive 451 §4ג(א)(5) (a BoI directive, not a law): 5 business days, 7 only for pre-defined categories with notice of reason. "Exposed to lawsuits" unverified. Year 2021 unverified.
18. **Digitisation** — entire process possible digitally (phone/Zoom, no branch) "**משנת 2018**"; self-service digital pre-approval forms "**משנת 2020**". [FIELD — to verify] (cf. J-160: e-signature law position "since 2018" — possibly the same 2018 reference.)
19. **שמאות** — "הליך קצר". In a new developer project / מחיר למשתכן there is a **project-level appraisal report** accepted by banks, no individual appraisal needed ("שם הדוח לא נקלט בבירור בהקלטה"). "שמאות מ־12–14 החודשים האחרונים תקפה, ואין צורך בחדשה." [FIELD] ⚠️ **CONTRADICTION** with J-140: Directive 451 §9(ה) portability window = **90 days** (Hapoalim: "3 החודשים"). The 12–14 months claim may refer to something else (e.g. same-bank reuse?) — verify.
20. **אימות נתונים בסניף** — last three payslips + three months of current-account statements (unnecessary if the account is at the same bank). Cross-check and final approval. [FIELD; consistent with Eden 2026-08-04 at J-130]
21. **Validity** — "אישור עקרוני תקף **28–30 יום**; ריביות ההצעה תקפות **3 חודשים** (נאמר בהסתייגות — הכלל המדויק יאומת...)". [FIELD, self-hedged] ⚠️ **CONTRADICTION** with J-060/J-070: Directive 451 §4ג(א)(4) minimum **24 days** (12 with no new lien); "The 'rates are valid for three months' figure is folklore until someone proves otherwise." Open task on this page: verify exact rule (still unchecked on page).

**Mortgage advisors — state of the industry**
22. "**אפס חסמי כניסה**: מתקשרים לבנק, נותנים שם ומייל — ומקבלים מספר יועץ. אין דרישות השכלה, הסמכה או רישוי." [FIELD] (cf. research page "The bill to license mortgage advisors — Aug 2026" — a licensing bill exists; status to verify.)
23. Main work: taking an offer from one bank and presenting it to another. "בממוצע יועץ שולח אישורים ל**שני בנקים בלבד**, לרוב אלה שהוא כבר עובד איתם." [FIELD]
24. "**תיק משכנתא מתחיל היום ב־6,000 ₪** (בשיחה הוזכרה גם דוגמה של 11,000 ₪); יש הגובים כסף גם על אישור עקרוני בלבד — פעולה של רבע שעה במחשב." [FIELD] (Other Brain figures: 7,000–8,000 ₪ + VAT (2026-10-01 meeting); 8,000–10,000 ₪ (vision page); competitor 7,500 + VAT regular / 49,000 + VAT premium.)
25. Customers don't know Directive 451 and the banks' duties — "**פער הידע הוא מקור הניצול**". Illustration: estimate of equity thrown at the start was 30% when it is actually 25%. [FIELD/opinion]
26. Legacy industry — "אב לבן" and courses, no professional pioneer; BoI avoided regulating it (fear of harming banks and customers), but customers are harmed in practice. [FIELD/opinion]
27. The overview covered most of the field in ~20 minutes — simplicity explains lack of entry barriers. [opinion]
28. Team has good industry connections — "מהיום למחר" could arrange four meetings with four different banks; already a **pilot client** for mortgage accompaniment. [FIELD/business]

**The Israeli market**
29. Annual market size mentioned: "**כמיליארד ₪ הלוואות בשנה**". [FIELD] ⚠️ Likely wrong by orders of magnitude (public BoI data puts annual new mortgage volume in the tens of billions of shekels) — must verify before teaching; possibly a transcription error.
30. Leading banks: "**מזרחי ולאומי** בפער, **פועלים** מתחתיהם." [FIELD — verify market shares]
31. **Insurance companies** received BoI permit to originate mortgages; advisors almost don't approach them — "הזדמנות עסקית גדולה"; marketing regulation on insurance side easier; industry just starting. [FIELD — verify regulator (likely Capital Markets Authority rather than BoI)]
32. "**הביקוש לדירות קשיח לחלוטין**" — people think in salaries, not shekels ("קפיצה של פי ~12 משכורות בעשור"), deep cultural home-ownership; "משקיעים תמיד קונים". [FIELD/opinion — verify the ~12 salaries figure]
33. Banks are very commercial; not allowed to promote an external platform, but **cooperate at high level** — even with small groupings of 2–3 advisors. [FIELD]
34. "לכל משכנתא רגילה בישראל יש **חובת ביטוח חיים**" — strategic point: someone ill (e.g. cancer) struggles to get life insurance; exceptions need handling. [FIELD; consistent with J-130/J-160 insurance requirement]

**History & crises**
35. Until the 70s–90s mortgages taken **in dollars**; around the 2000s BoI stopped using the dollar as a mortgage engine — "הצעד שהציל את ישראל בהמשך". [FIELD — to verify]
36. Dot-com / Y2K bug — fear systems wouldn't pass 1999→2000 caused withdrawals and sharp market drops. [FIELD — historically loose; verify]
37. **Subprime (2008)** — US mortgages without real verification of equity/value (inflated value, cash-out), low rates and high liquidity; defaults accumulating from 2005; in 2008 "קרסו 3–4 מהבנקים הגדולים בארה"ב", Citibank in distress, hedge funds had to finance banks — assets worth less than debt. [FIELD — loose; verify]
38. "**ישראל כמעט לא נפגעה** — המדינה היחידה שכמעט לא הושפעה מהסאב־פריים." [FIELD — overstated; verify]
39. US mortgage market works via brokers and offerors/buyers — "חיה אחרת", not relevant to Israel; non-relevance strengthens the local opportunity. [opinion]

**Product direction (spoiler, explicitly not decisions)**
40. Goal: systemise and automate the mortgage advisor's role — not SaaS for advisors but a **stand-alone marketplace platform** like Wobi/Wolt. [proposal 2026-07-27; later superseded]
41. Answer all mortgage and customer types — "דוחס" the market. [proposal]
42. Price vision: from **6,000 ₪** per file to **~300 ₪**; team skeptical. [proposal]
43. "**שום חישוב לא יתבצע על ידי מודל שפה**" — algorithmic/mathematical, fully auditable; POC in Lovable characterised. [proposal → became DEC 2026-07-29]
44. Idea tested with AI tools trying to "knock it down" — no significant failure found. [anecdote]
45. Regulation moving towards the customer and digital; zero regulation on advisors. [FIELD/opinion]
46. Comparison with insurance: comparison platforms needed heavy regulation and a major tycoon; no such barrier in mortgages. [opinion]
47. Team has both development capability and domain knowledge. [self-description]

- Open questions on page: exact rule for rate validity (3 months mentioned with a hedge); is ~300 ₪ per file achievable.
- Tasks (all unchecked on page): verify rate-validity rule before 29.07; come critical; independent research.

### Useful for course
- Module "Types of mortgages" (first, internal/external refinance, upgraders, self-build, reverse, pari passu/second-degree); equity & LTV; PTI; age/term; three strategies; קנס היוון intuition; pre-approval process; advisor industry & fees; market structure; insurance companies as lenders; mandatory life insurance; history. **Every item needs verification before teaching; at least four contradict Brain research (baskets composition, validity periods, appraisal validity, response-time source).**

---

## 20. Product and scope (Decisions group rules page) — page 20480025

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/20480025/Product+and+scope · Last modified Oct 02, 2026 · Owner Eden · Review by 2027-01-02 · Type: Decisions group rules page

### The rules (each [DEC], date + page as stated)
- Mogi is the only company and goes to market now; founders run every case by hand behind the platform; automate only what real cases teach (2026-10-01, founders' meeting) → page 16809986.
- Vision "optimal mortgage at an accessible price"; MVP on service price, innovation, availability, transparency, reliability; does not promise speed or lowest rate (2026-10-01) → 60981249.
- Mogi is the company's name and brand (2026-08-19 founders' meeting; confirmed 2026-10-02, Eden).
- **B2C** — sell mortgage service directly to borrowers, not software to advisors (2026-07-29) → "The product is B2C, not SaaS for advisors".
- **The pre-approval is the product's axis and v1's slice, standard files only**; whether it is free is open again since 2026-10-01; two scope edges — refinance, and where a standard file ends — answered for what software accepts, open for the service promised (2026-08-13) → "Version one is the pre-approval track, end to end, for standard files" (16777218).
- Build the internal advisor system first; its engine becomes the customer product's core; internal system never retires (2026-08-19); next: main page for all cases & payments, then Mogi client side (2026-10-01).
- **Full automation is not the bar** — a human operations layer may stay if one person carries far more files (2026-08-16).
- **How far the process can be automated is decided by the banks**; build customer volume so banks want to deal with us; driving a bank's own website allowed today and known to be temporary (2026-08-16).
- A separate company asks the four banks for official access first, to learn how they treat an advisor with little seniority (2026-09-10).
- **Open banking out of v1**; data arrives as documents via advisor channels, POAs and forms (2026-07-29, recorded 2026-08-13).
- **We tell the customer when a further negotiation round will not pay**, show reasoning, let them overrule, record every overrule (2026-08-12).
- Sell what is lawfully allowed incl. customer-derived data, under separate optional consent, never a condition of service; per-customer versioned consent record from day one (2026-08-12).
- **Real clients served now on the existing standard consent document**; consent for data use & technology to lawyer batch; accept some data may have to be deleted (2026-09-10).
- **Price is open; the current client is served at 3,000 ₪ + VAT** (2026-10-01).
- Changed 2026-10-02: Mogi name confirmed, pilot price → open price, vision added, pre-approval line no longer says free.

### Useful for course
- Not much domain content; useful for describing Mogi's service model and positioning in an intro module (e.g. "pre-approval as the axis", B2C, human-run cases, transparency).

---

## 21. Mogi's vision ... five values — page 60981249

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/60981249 · Last modified Oct 02, 2026 · Type: Decision (decided 2026-10-01, founders' meeting)

### Summary [DEC 2026-10-01]
- Vision: **"משכנתא אופטימלית במחיר נגיש"**. Mission: make mortgage advice accessible to everyone, especially the periphery — "the family that cannot pay **8,000–10,000 ₪** for an advisor, and so pays **100–150 thousand ₪ more** over the life of the loan." [claim — field/marketing, unverified]
- "Optimal" is long-term; MVP doesn't claim it (depends on algorithm).
- Five MVP values: **Service price** (low because process built cheaper; exact price open) · **Innovation** · **Availability** (chat + person always reachable, SLA one day; founders answer at first) · **Transparency as a platform — "our greatest power"** (case status like a delivery app; manual stages: meeting set → in pre-approval → passed pre-approval → before/after the offer → appraisal; who we sent to and what came back) · **Reliability**.
- Digital service always with personal guidance.
- Rejected: **Speed** — "A fast mortgage takes about **21 days** and is not only up to us" [FIELD-ish claim, unattributed]; **Lowest rate** — needs algorithm, legally risky; "We do not promise 'the best'". Algorithm out of MVP; work behind platform manual.
- Open: price, wording of "savings", adding "transparency"/"simplicity".
- ⚠️ Fee figure 8,000–10,000 ₪ differs from Eylon's "from 6,000 ₪" (2026-07-27) and "7,000–8,000 ₪ + VAT" (2026-10-01 meeting). Not a hard contradiction (ranges), but course should cite a range with sources.

### Useful for course
- Typical advisor fee ranges and the claimed savings range (100–150k ₪) — both as claims to verify; typical end-to-end duration (~21 days fast case).

---

## 22. Mogi goes to market now as the only company ... — page 16809986

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/16809986 · Last modified Oct 02, 2026 · Type: Decision (decided 2026-10-01 founders' meeting; Mash clarified 2026-10-02, Eden)

### Summary [DEC]
- Mogi is the only company and goes to market now; no separate service company (Mash = planned split, never operated, no clients; all client data stays in Mogi).
- Founders run every case by hand behind the platform; client sees platform, case status, chat and a person.
- Automate only what real cases teach, one capability at a time, through capability modes **(off, shadow, assisted, automatic)**. "Not being automated yet is an advantage."
- Why: competitor research (BIZ-39–42): every advisory firm offers same value propositions, none sells a system that makes process easy; automation rate & unit economics are hypotheses.
- Rejected: service company first & tech brand only after proof (rule 2026-07-29 → 2026-10-01); separate names; separate sellable advisory business.
- Revisit if: clients don't value platform; **the licensing bill changes what an automated service may be**.

### Useful for course
- Context only (Mogi's operating model: human advisors behind a transparent platform).

---

## 23. Decisions (index) — page 3670017, and the relevant group rules pages

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/3670017/Decisions · Last modified Sep 18, 2026 · Type: index. Groups: Product and scope; How the system works (The data core, The stack and platform, Automation and the advisor app, The domain rules, Documents and reading); Ways of working; Open decisions; Decisions — History.

### Relevant decisions (engine, mix, LLM, Shadow/Assisted, consent, banks) [all DEC]
From **The domain rules** (28901456, last modified 2026-10-08, owner Eden):
- **LLM never performs a financial calculation** — core is deterministic code; LLM may explain, classify, summarise, draft; never computes a rate, payment, cost measure, early-repayment fee or any number a customer/bank relies on (2026-07-29) → page 16515075.
- **Case model assumes up to four banks in parallel** through the whole journey (per-bank state, deadline clocks, document packs); how many stay alive is policy (2026-08-13) → 16875545.
- **Each track carries its own term**; no engine code on one-term assumption (2026-08-03) → 16646263.
- **A figure contradicting what the client said is not sent to a bank without asking the client**; disagreement shown with both values; unresolved = missing for that bank (2026-08-31) → 33718276.
- **Clocks waiting for a bank answer count banking days from day one**; on day 6 prompt advisor to ask the bank for the delay reason the client is entitled to; not built yet (2026-08-18).
- **Repayment display, forecast inputs, income recognition and PTI follow Eylon's 15 agreed answers**; actual-offer terms over simulation defaults; manual prime updates retained (2026-10-07) → 67436545 (see §24).

From **Automation and the advisor app** (28934145, last modified 2026-10-04):
- Advisor app = guided flow of forms; save on change (2026-08-21; 2026-09-10).
- **Every capability carries one of four modes — off, shadow, assisted, automatic** — flipped by PR on its agreement rate; bank channels have a mode per bank; for the document reader (starts in assisted) agreement rate is not accuracy and cannot justify automatic (2026-08-23/24, qualified 2026-09-06).
- Outside actions: intent event before, outcome after (2026-08-24).
- **While learning, nothing the system produces reaches a customer, a bank or a decision until a person approved it; human judgement recorded beside the machine's to measure agreement rate** (2026-08-19) → 25493505. (= Shadow/Assisted principle.)

From **Documents and reading** (43253761, owner Dvir, last modified 2026-10-08):
- Nothing sent to a bank during pre-approval; documents go once at file opening (2026-08-13).
- **Consent:** no document on a case read/filed/used until log records everyone on the case signed consent (2026-09-06, amended 2026-09-15).
- Reader output is a suggestion; only human confirmation writes a fact (2026-08-27...).
- Reader starts in **assisted** mode without passing through shadow (2026-09-06).
- Algorithm leads; Claude checks blind; switched off field by field (2026-09-14).
- Document not kept once case closed; deleted on close/lost (2026-09-10/14).

From **Open decisions** (41254969, last modified 2026-10-02): the lawyer batch (26 questions, BIZ-25); which mortgage purposes we commit to serve; retention clocks; **service price and entry model — free pre-approvals as the hook, very low price with a cap, or free refinancing; current client at 3,000 ₪ + VAT**; Mogi client side form/timing; nine questions from 2026-10-01 incl. bank API.

From **Product and scope**: see §20 (banks: volume earns official access; separate company asks banks first; open banking out; stop-negotiating rule; consent).

### Useful for course
- "How Mogi works" module: the LLM rule, four-bank fan-out, human approval before anything reaches a client or bank, banking-day clocks and the client's right to know the delay reason.

---

## 24. Mortgage repayments and affordability follow the agreed calculation rules — page 67436545  ★ FIELD KNOWLEDGE (Eylon, 2026-10-07)

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/67436545 · Last modified 2026-10-08 · Author: eylon ashkenazi · Type: Decision (answers to Eden's 15 questions; **confirmed by Eylon on 7 October 2026**; Eden accepted 8 October 2026; implementation not complete; ENG-223 on hold until Eylon's prototype exists)

### The 15 answers [DEC + FIELD — Eylon 2026-10-07; regulatory links cited on page]
1. **Headline = monthly repayment under current terms**, from amount, rate, term, repayment method per track; **Spitzer** schedule when selected; not a lifetime average. Expanded: **first monthly repayment**; **projected maximum monthly repayment** when forecast can be calculated — highlight when **≥10% above** headline. Explain indexed/variable payments can change; projected max is a forecast not a ceiling; for grace and bullet loans show the payment after deferral / at maturity.
2. **Validation**: compare with bank amortisation schedules (incl. Leumi & Discount examples), Wise simulations, real pre-approvals. **"Eylon confirmed that we have access to a source containing many approvals in principle"** (size/coverage not audited). Match inputs, dates, forecast versions; investigate differences by rounding, payment dates, indexation, forecast vintage, bank's interest mechanism. No numeric tolerance settled.
3. **Forecasts**: use the **dedicated Bank of Israel forecast inputs published for Directive 451** (official yield page boi.org.il/roles/statistics/makamandbonds/yield/ — nominal and real model-based yield workbook). Not the Research Department macro forecast nor a flat inflation assumption. Keep source date/version. [FACT-SRC]
4. **Variable-rate reset**: initial pre-approval simulation → assume **five-year reset** for periodically variable tracks (labelled assumption); actual offer/existing loan → documented interval & dates (capture next reset date). Support **12, 24, 30, 36, 60, 72, 84, 120 months**. "Five years means time between interest resets, not the loan term. It does not apply to prime-rate changes or to monthly CPI indexation." An indexed payment can change even between rate resets.
5. **Store total rate first; for variable tracks also anchor type, value, determination date and contractual spread** (anchor = reference rate; spread = contractual addition/reduction). Don't reconstruct historical spread by subtracting today's anchor.
6. **Income**: support salary, dividends, existing rent, and **future rent for a second property and above — as our product scope choice** (not full regulatory definition). Keep declared amount, recognised amount, status Included / Requires review / Excluded + reason. Recognition depends on net income, continuity, evidence, bank rules.
   - Salary: current employment; ended employment not ongoing; new job before first salary deposit may be reviewed with signed employment contract.
   - Dividends: evidence + supported method; don't double-count company profit and dividend.
   - Existing rent: documented lease, evidence, recognised amount.
   - Future rent: evidence of expected rent; account for borrower's housing expenses.
   - Other recurring (pensions, benefits, maintenance received): assess continuity, evidence, bank recognition.
   - **Divide eligible recurring annual net income by 12**; if only gross supplied, require net — no invented conversion. Link: BoI income-recognition clarifications (boi.org.il/media/emunmobp/202601.pdf). [FACT-SRC link]
7. **Commitments reducing disposable income**: fixed commitments with **more than 18 months remaining** (qualifying loans, contractual leasing, maintenance paid); don't double-deduct. **Rent paid when the borrower will not live in the purchased property counts even if lease has <18 months remaining** — Directive 329, Appendix A (h2852.pdf). Missing end date → include conservatively, disclose assumption, flag. Planned early payoff only once funding & timing substantiated. [FACT-SRC]
8. **Existing mortgage**: repaid in the transaction → exclude once payoff substantiated; ported/retained **on the same property** → add existing repayment to new repayment if >18 months remain; retained **on another property** → deduct from income as fixed commitment if >18 months remain. "Unchanged" alone doesn't classify. Partial payoff → remaining portion. Same-property aggregation took effect **1 October 2026**; Circular 2852 postponed the earlier **1 July** date. [FACT-SRC]
9. **Repayment used for PTI**: ordinary amortising → initial repayment on full approved amount; grace → repayment after grace ends; bullet/balloon → monthly interest amount (even if deferred). **No arbitrary rate-shock** in the basic ratio; projected max shown separately. Directive 329 Appendix A. [FACT-SRC]
10. **PTI = relevant monthly repayment ÷ recognised disposable monthly income × 100.** Disposable income = recognised net income after required commitments. Actual offers use each offer's repayment; bank-specific adjustments only with verified evidence.
11. **Grace**: partial = interest paid, principal deferred; full = principal and interest deferred, accrued interest added to debt. By default grace **included in total term** (25-year loan with 1 year grace → 24 years after). Show payment during and after grace.
12. **Bullet**: partial = interest during term, principal at maturity; full = no regular payments, principal + accrued interest at maturity; apply indexation; **show maturity payment separately and prominently**.
13. **Entitlement track (זכאות)** modelled as **fixed-rate and CPI-linked**, using entered rate and term (consistent with Leumi's mortgage catalogue). "Other" track: initial repayment only when inputs sufficient; no projected max; if any track lacks a forecast, don't label mix's projected max as complete.
14. Missing inputs: don't calculate a track missing essentials (rate, method); aggregate repayment and PTI only when all tracks calculable; partial results labelled.
15. **Prime**: connect to official BoI service (PublicApi/GetInterest returns the **policy rate**) while keeping a manual prime-update process; keep **policy rate, prime rate and customer-specific spread** distinct; record value, source, effective date; never silently rewrite saved results.
- Rejected: lifetime-average headline; projected max as cap; flat inflation; universal 5-year reset after an actual offer; blanket income recognition / double counting; reconstructing historical spread.
- **Appendix — published reset intervals by bank (public-source snapshot 2026-10-07; years between resets)** [FACT-SRC (bank sites), snapshot]:

| Bank | CPI-linked variable | Unindexed variable |
|---|---|---|
| Mizrahi-Tefahot | 2.5, 5, 7, 10 | 2, 5, 7 |
| Leumi | 1, 2, 5 | 2, 3, 5, 7, 10; annual MAKAM-linked reset |
| Hapoalim | 3, 5, 10 | 3, 5, 10 |
| Discount | 5 | 5 |
| First International | 1, 2, 3, 5, 10 | 1, 2, 3, 5, 10 |
| Massad | 1, 2, 3, 5, 10 | 1, 2, 3, 5, 10 |
| Mercantile | 1, 2, 3, 5, 6, 10 | 5, 10 |
| Bank of Jerusalem | 1, 2.5, 5 | annual MAKAM-linked; 2.5 and 5 need offer-level verification |
| Yahav | mortgage via Mizrahi-Tefahot | use Mizrahi offer |
| ONE ZERO | no public catalogue | — |
| Esh | no public catalogue | — |

- MAKAM = BoI short-term bill instrument; annual MAKAM anchor ≠ prime. Items needing confirmation listed (Leumi 2.5-year page; Mizrahi annual anchor; Bank of Jerusalem calculator).

### Useful for course
- Strong, current, expert-confirmed material for: how a monthly payment is computed and displayed; Spitzer; projected max; reset intervals; anchor + spread; prime vs policy rate; income recognition; commitments >18 months; existing mortgage treatment; PTI formula; grace & bullet; entitlement track (משכנתא לזכאים) as fixed CPI-linked; list of lenders in Israel.

---

## 25. Question Files - field banker — page 3112963  ★ FIELD KNOWLEDGE (field banker, Aug 2026)

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/3112963/Question+Files+-+field banker · Last modified Aug 21, 2026 · Author: amit · Type: raw source (Q&A, by phone, August 2026). field banker = "a mortgage professional outside the team"; answers "exactly as they were typed".

### Content
- Q1 (Eden): "איך עובד תהליך הקבלה של ייפוי כח באופן דיגיטלי מיועצים?" — **no answer recorded; still open.** [OPEN]
- Q2 (Eden): who actually orders the appraiser? Answer verbatim: **"שמאי שולח ישירות לבנק את השמאות - היועת או הלקוח מזמינים את השמאי"** [FIELD — field banker, Aug 2026]. Filed into J-140 on 2026-08-06.
- Q3 (Eden): do the four banks' appraiser lists overlap? Answer verbatim: **"אם יש שמאות מבנק אחד - הבנקים האחרים מחוייבים לקבל אותה"** [FIELD — field banker]. Page notes: "This answer is stronger than the written rule" (Directive 451 §9(ה): shall not unreasonably refuse, only if appraiser on receiving bank's list); off-list case not asked. ⚠️ Tension between field claim and written rule.

### Useful for course
- Appraisal practice (who books, where the report goes, cross-bank acceptance) — with the written-rule caveat.

---

## 26. 2026-07-29 — פגישת הצגת הרעיון: מיזם המשכנתאות (כל הצוות) — page 4489217

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/4489217/2026-07-29 · Last modified Jul 31, 2026 · Author Dvir · Type: Meeting notes (no recording; built from Drive docs)

### Domain-relevant content
- Problem description: process perceived as complex, long and threatening — different questionnaires per bank, repeated document collection, gaps and mistakes, manual approach to several banks, hard to understand mixes and rates, no status transparency, dependence on advisor, cost of thousands of shekels; competition only partial — advisors and clients don't exhaust market options; most advisor work operational and repetitive (collecting info, checking docs, forms, tracking, comparisons). [RES/claims]
- Proposed end-to-end flow: dynamic questionnaire → documents → OCR classification/extraction → cross-checking and gap detection → file per bank's requirements → pre-approval requests to several banks → collecting & comparing offers → mix fitting → negotiation rounds → tasks/statuses → accompaniment to signing. [proposal]
- Product principles: B2C; not AI at core (code, algorithms, math, decision engine, data; AI assists classification, communication, automation, never alone numeric financial decisions); no dependence on open banking (existing advisor channels: portals, forms, email, phone, POA); **standard files ("המסלול הירוק")** first — complex files later: **תושבי חוץ, פשיטות רגל, הכנסות חריגות, נחלות, שעבודים מורכבים, משכנתא מדרגה שנייה**. [DEC 2026-07-29]
- Mix engine three goals: low total cost; stability/less exposure to rate and index; low monthly payment; customer chooses priority; engine builds within regulation, repayment ability and risk profile. [proposal]
- Strategy then: **Service First, Software Second**; Shadow Mode (client gets normal service, file managed in parallel in internal system; each manual action examined; Delta between algorithm and expert decisions at zero risk); **Assisted Mode — machine does ~70% of work and prepares drafts, professional is gatekeeper, zero actions without approval**; public launch only after proof. [DEC 2026-07-29, later replaced 2026-10-01 for the brand part]
- Bank integration layers: day 1 upload & email adapters; later RPA and consent-based open banking; direct API only after volume. Timeline Q1–Q6 presented. [proposal]
- Customer acquisition channels incl. **free pre-approval as entry product and funnel**. [proposal]
- Economics: **300–500 ₪** per automated process; gross margin **85–90%**; revenue ladder premium → hybrid → SaaS monitoring & B2B licensing. [proposal/hypothesis]
- Moat: data from real files, bank requirement & behaviour mapping, documents/errors/gaps library, mix decision engine, negotiation-limit knowledge, OCR — "Bloomberg של שוק המשכנתאות". [proposal]
- Roles: Amit — UX/UI; Dvir & Eden — technology; **Eylon — business, finance, strategy and professional mortgage knowledge**.
- Risks table incl. **unverified assumptions: "נתוני השוק, שיעור התיקים הסטנדרטיים, הוראות בנק ישראל וזמני הטיפול דורשים אימות"**.
- 12 decisions incl.: service first; first pilot client; standard files; **bring an experienced bank mortgage professional to validate assumptions**; unified file/status/log infrastructure; map bank questionnaires into a unified dynamic one; mechanism to detect form changes; gradual OCR/classification/decision engine; legal review (POA, privacy, security, professional liability); founders' agreement; upload decks; naming.

### Useful for course
- Pain points of borrowers; what an advisor's work consists of; standard vs complex file categories (useful "edge cases" module).

---

## 27. 2026-10-01 — הולכים רק למוגי ... — page 60588034

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/60588034/2026-10-01+-MVP · Last modified Oct 02, 2026 · Author eden · Type: Meeting notes (~3h40m)

### Domain / field-relevant statements (mostly founders' positions, unattributed by design)
- Expected mortgage savings **100–150 thousand ₪** cited to argue service price matters less than reliability ("ירידה מ-6,000 ל-700 ₪ פחות משמעותית מאמינות"). [claim]
- Current mode: system is a side tool; price **3,000 ₪ + VAT**. [DEC/TODAY]
- How customers choose an advisor: friend's recommendation, seniority, reviews, website look, Facebook groups, asking LLMs (→ GEO). "לקוחות מאמינים שיועץ משיג ריבית נמוכה יותר כי הוא מכיר את הבנק; חמישה-שישה אנשים אמרו את זה." [FIELD — anecdotal customer belief]
- Innovation attracts mainly ages 20–40; older/reverse-mortgage clients not interested in innovation or price. [opinion/hypothesis]
- "הבנקים מאשרים בתוך טווחים; יש כשלושה תמהילים טיפוסיים." [FIELD-ish claim, one position]
- Example: an algorithm-built offer approved immediately by one bank ("אין מה להוריד"); one case doesn't prove; "'טוב' הוא תמיד יחסי". [anecdote]
- "יועצים אוהבים לקוח שכבר מגיע עם הצעה, וטענות 'חסכתי לך 100 אלף' הן יחסית להצעה הגנרית של הבנק." [FIELD-ish]
- **Advisors charge 7,000–8,000 ₪ + VAT because of hidden costs, mainly cost of the lead.** [FIELD-ish claim, unattributed]
- Economics: 20 clients × 700 ₪ = 14,000 ₪/month (doesn't sustain a person); private advisor 2,500 ₪ × 20 = 50,000 ₪. [arithmetic]
- "האישור העקרוני עצמו לא עולה ללקוח כסף בבנקים." [FACT, consistent with Directive 451 §4ג(א)(1)]
- Entry-model options (undecided): free pre-approvals (3–4 as a gift, then advisor call), ~200 ₪ full service with a cap, 2,000 or 3,000 ₪; free refinancing. [OPEN]
- First version's value: client fills an app instead of a call; system catches errors before the bank (duplicate document, wrong payslip) — saves days of ping-pong. [proposal]
- Competitor research: ~28–32 mortgage companies' Facebook ads; some ask 8 questions, some go straight to WhatsApp, some promise loans up to 2 million, some specialise in refinance, some lead with "Hebrew and simplicity"; **no competitor's selling point is a system**; one (קרדיט-לי) sells mortgages "with AI"; some offer free Zoom; **full premium packages 30–50 thousand ₪ (example: regular 7,500 ₪ + VAT, premium 49,000 ₪ + VAT, and "מסורבים" priced by complexity)**. [RES]
- Values chosen (see §21). Transparency stages listed: נקבעה פגישה → באישור עקרוני → עבר אישור עקרוני → לפני/אחרי הצעה → שמאות. Customers today don't know where they stand (bank delays, holidays, advisors stalling). [DEC + claim]
- ISO 27001 considered (cost could reach 100–200 thousand ₪). [RES]
- **Speed rejected: "משכנתא מהירה היא כ-21 יום"**; choosing speed = committing to a number (e.g. "best offer within 16 days"). [claim]
- "Lowest rate" — legally risky; working phrase "משכנתא בריבית טובה כמו שיועץ משיג לך, במחיר הנמוך ביותר" (not final). [OPEN]
- Customer segments: **ממחזרים, משפרי דיור, רוכשי דירה ראשונה**. Customer options: advisory firms, independent advisors, direct to bank, digital services. [RES framework]
- New data point: client's target date and contract-signing date = prioritisation signal; signed contract marks a different client type. [proposal]
- Bank API: a bank contact didn't refuse but may require ISO first. [FIELD/business]
- 14 decisions (Mogi only; vision; base rules; five values; algorithm out of MVP; **start from the pre-approval**; availability SLA 1 day; transparency day one with manual stages; engineering order; free chat dropped; digital + personal; update Brain; roadmap; morning syncs).

### Useful for course
- Market/fee landscape, how customers choose advisors, customer segments, what "fast" means (~21 days), status stages a borrower goes through.

---

# Part B — further domain pages found by CQL search (research, decisions, meetings)

## 28. How the regulator says to compare mortgage offers — Aug 2026 — page 7733250

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7733250 · Last modified Aug 17, 2026 · Type: Research ("True as of August 2026"). Transcribed directly from **Directive 451, version 22 (19/07/2023), Appendix 4 (תוספת 4), pp. 23–26**, downloaded from BoI 3 Aug 2026, plus §4ג(ב4), §15א and Appendix 5. Version 22 confirmed current; the three 2025–2026 circulars touching housing loans amend Directive 329 instead. [FACT-SRC throughout]

### Summary
- Vocabulary: **מסלול** (track: slice with own rate, linkage, repayment schedule) · **סל** (basket = all tracks = the mix) · **עוגן** (anchor: published rate a variable track is priced off — prime or a government bond yield; bank adds margin) · **IRR**.
- **העלות הממשית של האשראי** = IRR at which PV of future payments equals PV of amount lent (quoted Hebrew definition). Formula: PMT_t = sum over tracks; L₁+…+L_k − A = Σ PMT_t/(1+IRR)^t; annual = ((1+IRR)^12 − 1)×100. **A** = charges collected at advance — "תוספת" as defined in חוק אשראי הוגן; subtract from principal (not add to payments). Which of Mogi's charges go in A = open legal question.
- **Reference table (טבלת ייחוס) — forecast per track:** קבועה צמודה → inflation expectations (BoI); קבועה לא צמודה → none needed; משתנה פריים → nominal zero curve; משתנה צמודה every X years (gov-bond basis) → real zero curve + inflation expectations; משתנה לא צמודה every X years (gov-bond basis) → nominal zero curve; משתנה צמודה every X years on מק"מ basis → nominal zero curve; מט"ח/צמוד מט"ח and אחר → no forecast.
- **Zero curve (עקום אפס)** explained: market view of risk-free cost per horizon; nominal vs real; gap = expected inflation.
- A bank can't quietly invent a new track: must apply to the Supervisor with forecast model + empirical validation; Supervisor answers within 90 days. **Forecast-free tracks capped at 3% of a bank's mortgage book**, tested first day of each quarter.
- Variable rate forecast: first V months use anchor on offer day; then implied forward: Anchor(V→2V) = [(1+A_2V)^(2V/12) ÷ (1+A_V)^(V/12)]^(12/V) − 1. Existing loan re-quoted: offset by s months to next reset.
- Five rules: forecast payments follow BoI curves; future anchors derived as above; different draw-down dates → as if all advanced on calculation date; **as if advanced at start of month the pre-approval was given**; if BoI hasn't published, use last forecast.
- **§15א — existing loans get two figures** (per track and whole loan): **הריבית הכוללת החזויה** (A excluded — cost from here) and **שיעור הריבית לצרכי השוואה** (A = early-repayment fee + charges due if repaid now). Prescribed customer sentence (quoted Hebrew): if "שיעור הריבית לצרכי השוואה" is higher than "שיעור הריבית הכוללת החזויה" on the new loan's pre-approval, refinancing is economically worthwhile. Banks show both in online apps; in writing, free, **twice a calendar year** for customers not using the app.
- **What the pre-approval must show (§4ג(ב4))**: fixed tracks' contracted rate; variable tracks' implied rate as at issue day; expected total rate; total amount expected to be paid; early-repayment fees (2002 Banking Order); statement if a track has no forecast; **first monthly payment and highest monthly payment expected under the forecast**.
- **Uniform baskets exactly (Appendix 5)**: סל 1 = קבועה לא צמודה whole loan; סל 2 = קבועה לא צמודה ⅓ · משתנה פריים ⅓ · משתנה צמודה resetting every 5 years on gov-bond basis ⅓; סל 3 = קבועה לא צמודה ½ · משתנה פריים ½; סל מוצע = bank's proposal. "A third is exactly a third."
- Competitive research: one free optimiser breaches the one-third rule; another does no discounting in its early-repayment figure. [RES]
- Unknowns: A's content; whether each track can have own term (Appendix 4 silent — later settled by Eylon 2026-08-03); Directive 329 Q&A file unread.

### Useful for course
- Core "how to compare offers" lesson; real cost of credit; forecasts; refinance test; contents of a pre-approval; exact basket composition (resolves Eylon contradiction).

---

## 29. What it costs to leave a mortgage early (קנס היוון) — Aug 2026 — page 7798786

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7798786 · Last modified Aug 17, 2026 · Type: Research. Transcribed from **צו הבנקאות (פירעון מוקדם של הלוואה לדיור), התשס"ב-2002, Second Schedule**, read 2 Aug 2026; rates downloaded same day. Three items marked as team's reading. [FACT-SRC]

### Summary
- Five fees: **עמלה תפעולית** ≤ ₪60 (§3(1)) — once per repayment, not per track (Supervisor ruling 13 Sep 2021 after a class action); **עמלת אי־הודעה מוקדמת** 0.1% if <10 days' written notice (§3(2)); **עמלת היוון** (colloquially קנס היוון) on fixed tracks and variable tracks resetting less often than yearly (§3(3)–(5)); **עמלת מדד** for CPI-linked loan repaid 1st–15th: amount × ½ × average monthly index change over last 12 indices (§5) — **repay on the 16th to avoid it**; **עמלת הפרשי שער** for FX loan with <2 business days' notice (§6).
- Notice ≤45 days before; anti-gaming: notice not acted on → another notice within 6 months doesn't count.
- **הלוואה מוכוונת** (subsidised directed loan) — no fee at all (§2). No fee on realisation of mortgage over single dwelling subject to thresholds (from a bank sheet).
- Discounting fee concept: PV of remaining payments at **ריבית ממוצעת** (BoI-published average rate by remaining-term bucket) vs at contract rate. Two versions: §3(3) today's average vs contract rate; §3(4) today's average vs average at grant date; **§3(5) bank charges the lower** ("לפי הנמוכה מביניהן"). §3(4) added by 2014 amendment (only amendment). Negative fee set off against other fees (§7(b),(c)); can total go below zero — not stated (team would floor at zero).
- **Prime track: never a discounting fee; same for tracks resetting yearly or more often (§4(2)).** On reset day (תחנת יציאה) fee falls to ₪60 (§4(3)); exit point is a specific day; fixed tracks have no exit points ("most common customer misunderstanding").
- Rate files: mashfix.xls (unlinked buckets: ≤1, 1–5, 5–10, 10–15, 15–20, 20–25, >25) and pribmash.xls (CPI-linked: ≤5 … >25); monthly; values effective 2026-07-13: unlinked **4.64%–4.92%**, CPI-linked **3.35%–3.49%**. Bucket chosen by **remaining** time. Effective vs nominal conversion pitfall (5.90% nominal = 6.06% effective).
- Fee per track: fixed unlinked — big; fixed CPI-linked — yes + index fee; variable 2/3/5-year — small; yearly or more often — none; prime — none; directed — none.
- **Reductions for time served (§8(b))**: <3 years 0%; 3–<5 years 20%; ≥5 years 30% (complementary loan to subsidised one up to 40%).
- **Worked example** (team's own computation): ₪700,000 fixed unlinked, granted 2023-07-01, 20 years, 5.90% nominal, repaid 2026-08-02; average today 4.823%, at grant 5.09%. Monthly payment ₪4,974.72; balance ₪637,956.74; v1 ₪56,765.24; v2 ₪12,882.44 → charge ₪12,882.44; less 20% → ₪10,305.95; + ₪60 → **₪10,365.95**. "That one rule is worth ₪43,882.80." If granted Jan 2023 → v2 negative → **₪0** (v1 alone would quote ₪54,345).
- Unknowns: which bucket C is read from; converter round-trip; negative total; loans before **23 February 2015** may use pre-amendment formula; no reform found 2024–2026.
- ⚠️ Compare: Eylon (2026-07-27) "קנס היוון — תשלום על הדלתא בין הריבית שהתחייבת עליה לריבית הנוכחית (8.5% → 7% — קנס על ה־1.5%)" — a simplification of version one only; the regulated rule uses BoI average rates and the lower of two versions, plus time-served reductions. Also J-090 says "the fixed part is exactly the part that carries an early-repayment penalty" — this page shows variable tracks resetting less than yearly can carry a small fee too.

### Useful for course
- Full module on early repayment / refinance costs, exit points, avoiding fees (16th of month, exit point timing, notice rules).

---

## 30. What the banks need before they will lend — Aug 2026 — page 8290315

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8290315 · Last modified Aug 17, 2026 · Type: Research.

### Summary
- Banks require no documents for an אישור עקרוני — כל-זכות quote: **"במסגרת הבקשה, אין חובה להציג או למסור מסמכים"** (against Directive 451 §4ג). [FACT-SRC (secondary: Kol-Zchut)]
- §4ג(א)(4): **"האישור חייב להיות תקף ל-24 יום לפחות"**; "כל עוד הוא בתוקף הבנק חייב להעניק את המשכנתא לפי תנאי האישור". No new lien → 12 days (§4ג(ז)). Days are **calendar days**; each bank its own clock; earliest governs.
- Leumi's four file-opening lists (as in J-130) with "**תיק ייפתח לאחר קבלת שמאות**" for any-purpose and self-build. Income documents not on Leumi's list (property & identity).
- Insurance (Hapoalim collateral page): **ביטוח חיים** for outstanding balance and **ביטוח מבנה** incl. earthquake; bank as מוטב; not required for loans ≤ ₪30,000; bank's policy usually the expensive option; rough prices life ₪50–120/month (25–35), ₪80–180 (35–45), ₪200–400+ (45+); buildings ₪50–250/month. [FACT-SRC + RES]
- Security docs: שטר משכנתא, משכון זכויות, הערות אזהרה, ייפוי כוח נוטריוני.
- **עמלת פתיחת תיק up to about ₪360** (per כל-זכות).
- **חיתום** — reads documents, cross-checks credit databases, sends appraiser; mismatch → pre-approval cancelled. Argument for keeping more than one bank alive.
- Customer may take offers to banks: "**אין מניעה לפנות למספר בנקים שונים ולערוך השוואה**" (כל-זכות); pre-approval issued to the borrower.
- **Industry payment practice**: advisors paid whole fee at start (file opening) or advance + 2–3 payments; some charge only on success for harder cases; **full personal guidance ~₪6,000–15,000**. [RES/secondary]
- Refinance (מיחזור): internal refinance needs no appraisal; external does; clock likely 12 days; Mizrahi signs refinance documents remotely after a call with a banker. No purchase contract/seller/tax report.
- Unknowns: income docs in file-opening pack; do advisor-negotiated rates follow the advisor (קוד יועץ); other banks' lists; which files get 12 days; verification duration; is the file-opening fee negotiable.

### Useful for course
- Pre-approval vs underwriting; the 24/12-day window; deal-type document packs; insurance basics; file-opening fee; advisor fee models; refinance differences.

---

## 31. What the banks make you insure — Aug 2026 — page 9797633

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9797633 · Last modified Aug 17, 2026 · Type: Research. [FACT-SRC: Directive 451 §11, §11א quoted verbatim]

### Summary
- **ביטוח חיים** — insurer pays outstanding balance to bank on borrower's death; **ביטוח מבנה** — structure incl. earthquake and water damage (not contents).
- **§11(א)** (quoted): bank **may** require property insurance and life insurance up to loan amount, provided bank is **מוטב בלתי חוזר**. Life cover sized to the debt; borrower owns the policy.
- **§11(ב)(1)**: bank must tell borrower they may insure directly, not via the bank-controlled agency (**ביטוח חיצוני**), **"באופן בולט ובאותיות גדולות"** in explanation pages, loan agreement and annual notice.
- Timing: receipt same day; bank has **14 days** to say whether policy meets requirements (§11(ב)(2)); external policy expiring → warning ≥ **30 days** before; bank may insure and disclose **ביטוח חסר** (§11(ב)(3)); new-build: buildings cover not required before contracted handover date (§11(ג)); cancelling and replacing **free at any time** (§11(ה)(3)).
- **§11(ד)(1)**: buildings cover not required above **unpaid revalued loan balance** (defined as revalued balance minus land value attributable to the flat, plus up to 20%), offered in a separate document; bank updates sum insured yearly if insuring via bank (§11(ד)(2)). Trade-off: protects bank, not borrower's equity.
- **§11(ד)(3)**: no insurance required for loans ≤ ₪30,000 or balance ≤ ₪30,000; bank must tell borrower they may cancel when balance drops (or will during the coming calendar year) — also in annual notice (§11(ה)(4)).
- **§11א**: bank's own agency — no benefit to bank except agency commission; agency collects premiums; agency data used only for insurance incidental to housing loan; no referrals.
- Hapoalim practice: life cover "בגובה יתרת סכום יתרת ההלוואה, לכל תקופת ההלוואה"; buildings incl. earthquake and plumbing; agency **פועלים משכנתאות סוכנות לביטוח 2005 בע"מ**; "הבנק אינו משמש כסוכן ביטוח"; requires written confirmation before releasing money; waives for ≤ ₪30,000 or state grants only.
- Government calculators (רשות שוק ההון): **מחשבון ריסק** (life.cma.gov.il, covers ביטוח חיים למשכנתא), **מחשבון ביטוח דירה** (dira.cma.gov.il, structure-only mode), **הר הביטוח** (harb.cma.gov.il, register of a person's policies). Not machine-accessible in the session.
- Rough costs (secondary): life ₪50–120 (25–35), ₪80–180 (35–45), ₪200–400+ (45+); buildings ₪50–250; two borrowers → life doubles.
- Selling insurance needs **רישיון סוכן ביטוח** (חוק הפיקוח על שירותים פיננסיים (ביטוח), התשמ"א-1981); agent commissions (unverified): **עמלת היקף** ~70% of first annual premium + **עמלת נפרעים** ~20% of each premium. Conflict of interest under licensing bill.
- Unknowns: other three banks; calculators' usability; commission figures; dual licence; when customer buys; lapses mid-mortgage.

### Useful for course
- Mortgage insurance module: what, why, rights (external insurance, cancellation, ₪30k threshold, structure cap), costs, regulator calculators.

---

## 32. The bill to license mortgage advisors — Aug 2026 — page 9568265

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9568265 · Last modified Aug 17, 2026 · Type: Research (bill text read 2026-08-10/11).

### Summary
- **הצעת חוק הסדרת העיסוק בייעוץ משכנתאות**, MKs **יעקב אשר** and **ולדימיר בליאק**. Citation discrepancy: התשפ"ה-2025 vs **התשפ"ו-2026, פ/5070/25, הצעות חוק הכנסת 1196, 8 June 2026, p. 244** (fs.knesset.gov.il/25/law/25_ls1_13443809.pdf). [FACT-SRC]
- Explanatory notes quoted: **"כיום פועלים בשוק המשכנתאות יועצי משכנתאות, אולם העיסוק בתחום זה אינו מוסדר בחקיקה, וכל אדם רשאי לעסוק בתחום ללא חובת רישיון, ללא עמידה בתנאי סף וללא פיקוח רגולטורי."** — confirms Eylon's "zero entry barriers". [FACT-SRC]
- **60%–80% of Israeli borrowers use an advisor** (press figures, not traced to BoI primary). [RES — unverified]
- Timeline: 24 Nov 2025 Ministerial Committee backed it; 26 May 2026 Economic Committee (chair דוד ביטן) approved for first reading; 8 June 2026 published; 14 July 2026 "הונחה על שולחן הכנסת לקריאה ראשונה"; may carry over (דין רציפות).
- §2 **ייחוד עיסוק** (quoted); §1 definition of **"ייעוץ משכנתאות"** (quoted): advice by way of occupation re housing loan regarding (1) submitting application; (2) receiving offers; (3) recommended loan amount given repayment capacity; (4) choice of loan type incl. interest rate…
- From press only: qualifying exam by a 7-member **מועצת יועצי המשכנתאות** (mostly appointed by Minister of Justice; BoI, Finance, advisors' association reps); register **פנקס יועצי המשכנתאות**; Ministry of Justice supervises; disciplinary committee; fines/imprisonment for unlicensed practice; code of ethics, CPD, avoiding conflicts; documenting advice incl. alternatives; bar on employment by certain entities; transition arrangements. [RES — press]
- Open: does it reach an automated service; which version governs; will it pass.

### Useful for course
- Regulatory landscape of mortgage advice in Israel (unregulated today; bill pending) — date-sensitive.

---

## 33. Can we get a borrower's credit report — Aug 2026 — page 6455298

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/6455298 · Last modified Aug 17, 2026 · Type: Research (updated 2026-08-11).

### Summary
- Terms: **מאגר נתוני אשראי** (central register run by BoI itself), **לשכת אשראי** (licensed private bureau — only delivery route), **חיווי אשראי** (short indication a lender gets), **דוח ריכוז נתונים** (full concentration report). [FACT-SRC]
- **מיופה כוח בתמורה** — free registration category; BoI explainer names **ייעוץ משכנתאות** as first example. Credit bureau licence incompatible with advisory (§12(b), §7(b)(2)).
- Advisors cannot receive a חיווי: §33 (only נותן אשראי), §24 (closed list), §32 (no regulation admitting non-lenders). [FACT-SRC]
- Costs: BoI fee **₪3.60** to a מיופה כוח בתמורה; every customer gets **one free report a year**; extra reports ₪36 online; **CofaceBDI ₪64 handling → ₪67.60 per borrower, ₪135.20 two-borrower file** (checked 2026-08-02); D&B Israel / CB Israel "Advisor" product, unpriced. Against Shadow Mode fee "~₪6,000" = 2.3%; against ₪300–500 productised = 27–45%. [FACT-SRC + RES]
- Retention: report held ≤ **60 days** (תקנה 11(א), תקנות נתוני אשראי, התשע"ח-2017), extendable with express consent up to **7 years**; then irreversibly deleted (תקנה 11(ב)).
- **Banks pull it themselves at pre-approval**: Leumi's notice names the mortgage pre-approval and renewal; Hapoalim equivalent; Mizrahi distinguishes indication (advance notice) vs full report (signed consent on dedicated form); Discount page errored (inferred). All four banks feed the register.
- Customer can fetch own report free once a year (national ID login); full version covers entire history. Second limb of מיופה כוח בתמורה definition may still catch advising on a customer-fetched report.
- Supervisor's 2026 regulatory plan: new directive on digital financial advice based on credit-register data (draft 2025).
- Unknowns: volume rates; Discount; §58(א) reach; new directive's content.

### Useful for course
- Credit data in Israel (register, bureaus, חיווי vs report, free annual report) — how credit history affects a mortgage application.

---

## 34. Version one is the pre-approval track, end to end, for standard files — page 16777218

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/16777218 · Last modified Oct 02, 2026 · Type: Decision (29.07/31.07, confirmed 2026-08-13; edited 2026-10-02).
- [DEC] אישור עקרוני is the product's axis; "once the pre-approval works automatically end-to-end we've passed the hard part, have a full POC"; reconfirmed 2026-10-01. Standard files (המסלול הירוק) only.
- Note 2026-09-10: registry already accepts every purpose — buying a home, buying land, self-build, refinancing from another bank or the same one, any-purpose loan, renovation, extension. Which purposes Mogi commits to serve is open.
- [OPEN] refinance in v1?; where "standard file" ends (self-employed? self-build?); price & entry model (free pre-approvals, very low price with cap, free refinancing; current client 3,000 ₪ + VAT).
- Revisit if the licensing bill forces a different first product.
- Useful for course: list of mortgage purposes (מטרות הלוואה).

---

## 35. Bank of Israel data connections for the mortgage optimizer — Oct 2026 — page 67469313  (author Eylon)

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/67469313 · Last modified 2026-10-08 · Author: eylon ashkenazi · Type: Research (checks 7–8 Oct 2026).

### Summary [FACT-SRC (official BoI/CBS sources) + RES recommendations]
- **GetInterest** API (boi.org.il/PublicApi/GetInterest) observed 8 Oct 2026: `currentInterest 3.25`, `nextInterestDate 2026-10-21`. (BoI policy rate 3.25% as of that check — dated observation, not to hard-code.) History: BR collection, series `MNT_RIB_BOI_D`.
- **Directive 451 forecast workbook**: "Estimation of yields from government bonds.xlsx" — sheets: תשואה נומינלית הנגזרת מהמודל · תשואה ריאלית הנגזרת מהמודל · התפתחות פער התשואות; server timestamp 5 Oct 2026.
- **CPI**: CBS API id 120010 (general CPI), linking coefficients for base-year changes; connection failed in that environment.
- **BIR_MRTG_99**: 129 series (rates, anchors, spreads, volumes, terms, LTV bands, PTI bands); mortgage-rate observations through **August 2026**; use as benchmark, not executable offers.
- **קו המשווה** per-bank mortgage comparison: TamInt010.xls, monthly; latest month August 2026; workbook dated 15 Sep 2026; rates are **annual effective**, exclude bullet, balloon and FX loans. "Expected overall interest is an annualized cost measure ... not the total number of shekels repaid."
- Early-repayment reference rates: pribmash.xls, mashfix.xls (server dates 14 Sep 2026), monthly with effective dates.
- ZCM: 30 series (market curves, inflation expectations) — supplementary.
- Directive 329 + amendments (h2852.pdf): same-property amendment effective **1 October 2026**; older 1 July references must not drive calculations.
- "Public market data do not supply a bank's executable price ... Changing a mix may change the rates a bank will offer." Eylon's source of many pre-approvals relevant for validation and pricing study.
- Open banking still out of v1.

### Useful for course
- Where to find official rate data (prime/policy rate, CPI, BoI mortgage statistics, קו המשווה comparison); difference between market averages and personal offers; prime = policy rate + spread concept (policy rate 3.25% observed Oct 2026 — verify at teaching time).

---

## 36. A mortgage mix carries a term per track, not one term — page 16646263

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/16646263 · Last modified Aug 24, 2026 · Type: Decision.
- **"Settled by Eylon on 2026-08-03"**: each track can carry its own term — "**a 30-year fixed beside a 12-year prime is normal and common**". [FIELD — Eylon 2026-08-03; DEC]
- Search space ~287,000 → ~150 billion combinations. "Nothing [would make us revisit] — this is a fact about the market, not a preference. (Appendix 4 of Directive 451 is silent on it either way; the practice is established.)"
- (J-090 gives a different example: fixed-unlinked 25 years + prime 15 years — same claim, different illustration.)

---

## 37. When the Israeli banking system is open — Aug 2026 — page 8650753

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/8650753 · Last modified Aug 17, 2026 · Type: Research. [FACT-SRC]
- 5 business days counted in banking days; 24-day and 90-day clocks are calendar days.
- ZAHAV (מערכת זה"ב) days: Sunday–Friday; business day ends 18:30; short days (Friday, ערב חג) end 14:00 (quoted). Directive 402 adds ערב פורים and ערב תשעה באב to short days.
- Legal definition **יום עסקים בנקאי** (הוראות הבנקאות (שירות ללקוח) (מועד זיכוי וחיוב בשיקים), התשנ"ב-1992 §1) quoted: excludes שבת, ימי שבתון, ראש השנה (2 days), **ערב יום כיפור**, יום כיפור, ראשון של סוכות, שמיני עצרת, **פורים**, ראשון ושביעי של פסח, **יום העצמאות**, שבועות, **תשעה באב**; Supervisor may declare other days.
- 2026 table: Purim 3 Mar closed; ערב פסח 1 Apr short; פסח א׳ 2 Apr closed; **חול המועד פסח 3–7 Apr full business days**; יום העצמאות 22 Apr closed; שבועות 22 May closed; **תשעה באב 23 Jul closed (government works normally)**; ראש השנה 12–13 Sep; **ערב יום כיפור 20 Sep closed**; יום כיפור 21 Sep; סוכות א׳ 26 Sep; חול המועד סוכות 27 Sep–1 Oct open; שמיני עצרת 3 Oct. Example of Supervisor discretion: local elections 27.02.2024 not a business day.
- Short day 14:00: every Friday, every ערב חג, יום הזיכרון, הושענא רבה. Full days: חול המועד, minor fasts, modern holidays other than יום העצמאות, שושן פורים, חנוכה, ל"ג בעומר.
- Useful for course: practical timing — deadlines and appointments around Israeli holidays.

---

## 38. Working through the banks' advisor channels — Aug 2026 — page 6029348

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/6029348 · Last modified Aug 17, 2026 · Type: Research (Hapoalim/Discount quotes verified 2026-08-05).

### Summary
- **חוק שירות מידע פיננסי, התשפ"ב-2021 §60** prohibits accessing a customer's bank info in the course of business using the customer's own credentials; §57(b) criminal; licence doesn't fix it. Mogi doesn't do this. Open: automating the advisor's own session. [FACT-SRC]
- All four banks run advisor channels: **Mizrahi-Tefahot — "טפחות טאצ' ליועצים"** (advisor's own ת.ז. + phone + SMS; form 2873 (06.26) כתב הסמכה ליועץ משכנתאות; screen: all files, real-time status, messaging named banker, upload/download documents, new application form, rate mixes incl. BoI standard ones; advisor line 076-8048787); **Hapoalim** (כתב הרשאה ליועץ משכנתאות חיצוני v02.25; §3 quoted: submission may be on non-bank platforms in cloud in Israel or abroad); **Discount** (form 22-551 (12.2023) §11 quoted; advisor connection at bank's discretion); **Leumi** (אזור היועצים; form not found; anti-crawler clause).
- POA scope (Mizrahi deed): negotiate, sign application & confidentiality waiver, obtain Land Registry documents, submit, receive credit decision; Hapoalim §7(ב) advisor may sign credit-report consent; Discount §8 bank approaches customers. All deeds: advisors not bank's representatives ("המורשים אינם פועלים בשם הבנק").
- **קוד יועץ** = advisor code a bank issues to an accredited outside advisor (cf. Eylon: calling the bank with name+email gets an advisor number).
- Portal automation cost/fragility argument; Wise claims direct digital submission.
- Useful for course: how advisors interface with banks; POA (כתב הרשאה/הסמכה) contents; borrower protections.

---

## 39. Signing electronically, and the two powers of attorney — Aug 2026 — page 9830401

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/9830401 · Last modified Aug 17, 2026 · Type: Research. [FACT-SRC]
- Two POAs: **advisor's** (borrower → advisor; apply, receive offers, negotiate, waive confidentiality, receive credit-check notice; no notary) vs **bank's** (borrower → bank; register mortgage & ownership at Land Registry; at signing; notary in practice though law says no).
- חוק חתימה אלקטרונית, התשס"א-2001: three levels (חתימה אלקטרונית / מאובטחת / מאושרת); §2(א)(2) as amended **28 February 2018** quoted; exceptions only wills.
- Directive 367 §39; circular **ח-06-2570 of 4 October 2018** (online POA: in writing, readable before signing, record kept) quoted.
- §3א burden of proof on the "גורם מעצב"; §6.1 printout of secured-signature doc = original.
- **Advisor POA identity verification by bank**: Leumi — face to face **or video call**, valid **12 months**; Mizrahi — "במפגש פנים אל פנים" only; Discount — advisor or lawyer attests, bank may demand borrower's presence, valid **6 months**; Hapoalim — method unspecified, validity "not established". (Discount & Hapoalim forms from an advisory firm's pack.)
   - ⚠️ Inconsistency: J-050 (2026-08-05) says Hapoalim's authorisation expires six months after signing (§14); this page lists Hapoalim validity as "Not established".
- חוק הנוטריונים §20(א1): bank mortgage POA valid without notary; notary regs no video appearance; certificate may be electronic (תקנה 19א).
- 2Sign pricing (₪35/25 docs … ₪158/250).
- Useful for course: what the borrower signs and why; remote signing feasibility.

---

## 40. J-090 · Choices and costs — mix construction and calculator — page 7634954

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/7634954 · Last modified 2026-10-08 · Owner Eden · Type: Choices & costs (desk research Aug 2026 + measurements).
- "Eylon confirmed that day [3 August 2026] that each track in a mix can carry its own term, and that this happens often enough to support." Search space 287,000 → ~150 billion (5-point grid); 124 million → ~66 trillion (1-point). [FIELD — Eylon 2026-08-03]
- Only two of the five limits constrain the split (PTI and variable cap); LTV and term are loan properties. Objective non-convex once early-repayment fee included.
- Measured: 3 of 27 terms swept in 15.3 s → ~137 s full one-term space; 58.7% of grid legal.
- **Wise ₪119 per advisor per month** — incumbent with optimal-mix algorithm, customer record, digital submission; "buy a month to learn from". Two shipped Israeli tools measured getting the one-third rule / early-repayment discounting wrong.
- mortgagemath library reproduced monthly payment exactly (₪0.07 balance difference = rounding).
- Unknown: **how a bank's quoted rate varies with term, LTV and PTI band** — "comes either from someone in the industry or from our own submissions".
- Useful for course: the idea that pricing depends on LTV/PTI bands; tool landscape (Wise).

---

## 41. שאלון האישור העקרוני של בנק דיסקונט — כל השדות — page 30375937

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/30375937 · Last modified Aug 26, 2026 · Type: Research (read 2026-08-25 from mortgage.discountbank.co.il). Sibling pages exist for Leumi (29982722), Mizrahi-Tefahot (30048257), Hapoalim (29982743) — not read in this pass. [FACT-SRC (bank's public questionnaire)]

### Summary
- 4 stages, ~55 fields. Transaction type: רכישה מקבלן · רכישה מיד שניה · רכישה במחיר למשתכן · מחזור משכנתא או עסקה אחרת (→ מחזור מבנק אחר · מחזור משכנתא מדיסקונט · עסקה אחרת — the last stops and a banker calls back).
- Property: type (בניין משותף/בית פרטי), settlement (closed list), value (contract price; for refinance "שווי השוק בימים אלה"); מחיר למשתכן: market value + contract value — **financing % set by market value up to ₪2,100,000, above that by contract value**; other apartments (none / have but will sell within two years / yes) affects financing %; will buyers live there; seller is a relative (second-hand only).
- Borrowers: name, birth date (age 18–90), email, **mandatory consent to email/SMS contact + confidentiality waiver**, mobile; marital status (7 options incl. ידוע/ה בציבור variants); household size; spouse block; registered as owner.
- Employment: שכיר · עצמאי · בעל שליטה · בין עבודות; workplace, role, seniority bands (≤1y, 1–2, 2–5, >5), average net monthly salary (self-employed: average net monthly income + annual gross per שומה); extra job block; previous job if short seniority.
- Additional household income: rent, allowances (קצבאות), maintenance (מזונות), other. **Fixed expenses only those lasting another year and a half or more**: rent, loans not at Discount, maintenance, mortgages not at Discount, other. (Matches the >18 months rule.)
- Additional borrowers: relation (couple, siblings, parent, other), shared household, **לווה or ערב** (guarantor), full repeated block incl. ID.
- Purchase: "יש לי" / "אני רוצה לקחת" (one computed from the other); estimated monthly payment shown using **30 years, 5.5%, fixed track**; financing % derived; excess shows message; מחיר למשתכן grant (מענק מקום, subject to Ministry of Housing) included in equity.
- Refinance: which mortgage (לדיור / לכל מטרה / both); all or part; amount **including early-repayment fee**; top-up; partial-from-other-bank amounts; term 5–30 years (three versions: Discount / Mercantile / uniform basket); where the mortgage is managed today (**בבנק · בחברת ביטוח · אחר**); repaid properly (no returned payments). Info screens: prepare דוח יתרות and דוח התנהלות.
- Preferences: when money needed (month / ≤3 months / >3); comfortable monthly payment; defer principal (grace) 6/12/18/24 months; **importance of תחנות יציאה ("בתחנות יציאה פורעים בלי עמלת פירעון מוקדם")**; optional notes, other bank's offer upload, branch, consent to pass details to bank's insurance agency; **mandatory legal terms + notice that the bank will approach a credit bureau for a חיווי on all borrowers**.
- Separate track: תעודת זכאות request from Ministry of Housing (military service, siblings, children, disability, prior assistance).
- Useful for course: exactly what a bank asks at pre-approval; household-level income/expenses; guarantor vs borrower; refinance info; eligibility certificate; insurance companies as existing lenders (matches Eylon).

---

## 42. What each document gives us in v1 — page 43384833

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/43384833 · Last modified Oct 02, 2026 · Owner Dvir · Type: Spec.
- Build order: תלוש שכר → ת.ז + ספח → תדפיס עו"ש → דוח יתרות לסילוק → נסח טאבו (ordered by Mogi online from Ministry of Justice with גוש/חלקה, fee under ₪20, indexed each January) → תעודת זכאות. Recognised-not-read: חוזה רכישה, טופס 106, tax report, developer payment slip, permits, insurance. Self-employed docs waiting (self-employed not decided in/out of v1).
- Payslip anatomy example: סה"כ תשלומים (ברוטו) 11,200 − מס הכנסה, ביטוח לאומי, מס בריאות, פנסיה עובד = סה"כ ניכויי חובה 2,800 → **שכר נטו 8,400** → minus החזר הלוואה ממעביד, דמי חבר ועד → **נטו לתשלום 7,850**. **Income = שכר נטו** (נטו לתשלום would double-count employer loan); "The advisors confirm this in BIZ-38" [OPEN/to confirm with advisors]. Three months averaged; one-off payments (מענק, הפרשים, שי לחג) flagged. Debts deducted on payslip (employer loan, עיקול, מזונות) → obligations.
- ספח: address, children's birth dates; **Hapoalim counts children up to 21** but ספח lists only under 18. [FACT (bank rule, as stated)]
- Bank statement: loans recognised by description repeating in all three months; monthly payment from latest month (moves with index and prime); returned debit (החזרת חיוב) = mortgage not paid on time.
- Payoff report: tracks summed (example prime 400k + fixed unlinked 250k + CPI-linked 150k = 800k); Directive 451 sets payoff report contents (balance split into principal, indexation, interest; dates; rates; early-repayment fee) but not monthly payment.
- נסח טאבו: whether a mortgage is registered (already_pledged).
- Draft checklist: payslip last 3 months per salaried job; ID + ספח per borrower; bank statement last 3 months per current account; purchase contract when signed.
- Useful for course: reading a payslip (gross/net/net-to-pay), which documents prove what.

---

## 43. Meetings: 2026-07-31, 2026-08-16, 2026-08-19 (pages 3670057, 26836993, 25395201)

### 2026-07-31 — פגישת ביניים (3670057), last modified Jul 31, 2026, Meeting notes (participants: אילון (organiser), עדן, עמית, דביר; speaker attribution scrambled → body unattributed)
- Pre-approval = customer's go/no-go; "מי שעשה אותו פעם, לכל היותר יעשה עוד אחד" [FIELD-ish, unattributed]; free pre-approval at all banks proposed; risk "בא להתגלח".
- "כל משכנתא בישראל מחייבת ביטוח חיים ← גם לקוח שלא סגר משכנתא הוא ליד שאפשר למכור לחברת ביטוח" [FIELD-ish claim]; insurance companies not bound by bank directives (claim).
- **בנקאי בשטח (טוביה)** — "כ-4–5 שנים במערכת הבנקאית"; to validate that team members' field experience isn't exaggerated, talk about professionals and non-professionals, and past attempts to regulate advisors (exam like for real-estate brokers). [context for the field banker's field authority]
- Personas: young couple first mortgage; older person (reverse mortgage, low app usage); those who choose an advisor for hand-holding.
- Open: who issues advisor codes at Hapoalim and Discount; Eylon task: **"להוציא קודי יועץ בלאומי ובמזרחי"**.

### 2026-08-16 — יישור קו (26836993), last modified Oct 02, 2026 (written from a summary doc; transcript garbled)
- Shadow Mode as learning engine; micro-processes; ≈ "a file requiring ten hours of human work" example; "10 minutes → 20 seconds" example; volume = leverage with banks; crawling/autofill not stable at scale. Eylon's responsibility: shadow-mode prep, first clients in September, bank process and documents, field documentation.
- Already some POA and consent documents with some banks. [TODAY Aug 2026]

### 2026-08-19 — מעבר לעבודה עם לקוחות אמיתיים (25395201), last modified Oct 02, 2026; "E.D.E.A מצגת אילון - 30 יום קרובים" deck presented
- Payslip demo found declared vs payslip net gap (9,394 ₪) and a wrong ID digit.
- Azure OCR ~1.5 USD/1,000 docs, first ~500 free; LLM ~0.081 ₪/doc (strong) or ~0.025 ₪ (light); "~8 documents per client" (unmeasured assumption).
- Persona-dependent document sets: divorced, divorced & self-employed, salaried.
- Shadow → "המערכת מכינה והאדם מאשר" → "המערכת מובילה"; metric = agreement rate between system and advisor.
- Internal system for ~20% of files that can't be fully automated.
- Initial segment: first-home buyers, salaried, stable income, standard files; not serving מסורבי משכנתא and complex legal/professional files (refer out).
- **Pilot: 3 files at 5,900–6,000 ₪ incl. VAT (~5,500 before VAT), 90-day trial** [DEC 2026-08-19; later superseded — current client 3,000 ₪ + VAT per 2026-10-01].
- Acquisition model: advice → free initial check + pre-approval → paid full accompaniment.
- Traps: don't promise "the cheapest mortgage in Israel"; don't promise all banks; don't serve declined borrowers now.
- Metrics: client savings, exceptions documented, work-time reduction, mix calculation accuracy. Risk: "תלות בידע של אדם אחד — מי שמכיר את התהליך מבפנים".

---

## 44. איך תיראה העבודה של היועץ באפליקציה — הזרימה המאושרת — page 26935299 (approved by Eylon 2026-08-21)

- URL: https://first-edea-team.atlassian.net/wiki/spaces/MTG/pages/26935299 · Last modified Sep 27, 2026 · Type: Hebrew walkthrough (signed flow), with 2026-09-25 note on how built app differs.
- Domain-relevant: stages "פנייה, שיחה, מסמכים, הגשה, תשובות, הצעות..."; urgent list: bank not answering in time; **"מזרחי — עברו 5 ימי עסקים. הלקוח זכאי לדעת למה. שאלת?"**; reminders "ביקשת עותק מדו"ח השמאות?" and "ביקשת מהלקוח את דף הביצוע מהבנק?"; pre-approval form fields: amount, tracks, validity, required-documents list, appraisers list; per-bank submission tabs (date, application number, how submitted; "לא הגשתי לדיסקונט" + reason); prediction per bank; competing offer e.g. "מזרחי הציעו לי 4.9 פריים"; couple: person-forms per person, bank stuff per case; case ends: client vanished or closed alone with the bank.
- **Eylon's role (page): "פירוק המסע לשלבים קטנים, לפי הסדר האמיתי של השיחות ... ובכל טופס — השדות, והערכים הנפוצים (מאיפה לידים מגיעים, למה תיקים נופלים, למה בנקים מסרבים). מה שהוא באמת שומע, לא מה שהגיוני על הנייר."** [FIELD source designation]
- Useful for course: the advisor's practical workflow and the three often-forgotten follow-ups (delay reason, appraisal report copy, execution page).

---

## 45. Customer personas (not read individually; from search summaries) — pages 17760257–18153473

- 13 "פרסונת לקוח" pages (author Dvir, Aug 21, 2026; validation personas — **fictional composites by the team, not real clients**): e.g. מאיה ואיתי (30/31, first home, parental help, 26–28k ₪), נועה בן דוד (32, single first-time buyer, 24–26k), אבי מזרחי (41, self-employed, variable income), טל (39, investment second apartment), רן (44, divorced + 2), עדי וירון (refinance), אורטל ויונתן (upgraders "buy before selling"), משה ורונית (renovation/extension with small remaining mortgage), ליאור ושרון (returning residents from London), רבקה ושלמה (78/79 pensioners moving), שחר (37, buying out siblings' inherited shares), אלעד ושני (self-build on a plot), יעל ועמית (second marriage).
- Useful for course: ready-made case-study archetypes (label as fictional).

---

# Part C — Consolidated "Field-knowledge claims"

Every claim attributable to Eylon (אילון אשכנזי — the team's mortgage expert; role per 2026-07-29: "התחום העסקי, הפיננסי, האסטרטגי והידע המקצועי במשכנתאות") or to experienced advisors / field banker (בנקאי בשטח — "a mortgage professional outside the team", ~4–5 years in the banking system). All = **field knowledge, to verify before teaching**. Exact wording kept; Hebrew where the source is Hebrew.

### A. Eylon — 2026-07-27 intro call (page 2949123; summary written by Dvir; Eylon = knowledge giver/organiser)
| # | Exact wording (as on page) | Verdict vs Brain research |
|---|---|---|
| E1 | "**משכנתא ראשונה** — רכישת דירה ראשונה. הון עצמי נדרש: **25%** מערך הנכס (ממיליון ₪ — 250,000 ₪ מהבית); על כל שקל הון עצמי הבנק מעמיד כ־3 ₪." | Consistent with Directive 329 §2 (LTV ≤75% only home) |
| E2 | "בנק ישראל קבע תקרה של **50%** מההכנסה הפנויה; הבנקים מחמירים בפועל ל־**40%** (בניכוי הלוואות קיימות), כך שנשארת לפחות **60% הכנסה פנויה** למחיה" · "המשכנתא אמורה להחליף את השכירות — לא את החיים." | 50% consistent (329 §5). "40%" — research says 40% is a capital/price boundary (329 §6), not a hard refusal; practice claim needs verification |
| E3 | "**מחזור פנימי** — פתיחת המשכנתא מחדש באותו בנק כשתנאי השוק השתפרו (למשל ירידת ריבית); אפשר להציע תמהיל חדש, והבנק בוחן מחדש." | No conflict |
| E4 | "**מחזור חיצוני** — העברת המשכנתא לבנק אחר. רגולטורית זו **העמדת אשראי חדש** אצל הבנק הקולט" | No conflict; research: external refinance needs appraisal, internal doesn't |
| E5 | "שני סוגי המחזורים הם **רוב עיסוקו של יועץ משכנתאות בישראל**." | Unverified |
| E6 | "**משפרי דיור** ... מימון עד **70%** מערך הנכס החדש (לא 75%)." | Consistent with 329 §2 (replacement home ≤70%) |
| E7 | "**בנייה עצמית** — עד **50%** מימון על הקרקע, ואז עד **70%** מערך הנכס העתידי." | Unverified; Leumi: self-build file opened only after appraisal |
| E8 | "**משכנתא הפוכה** — לבני גיל הזהב ... ההחזר חודשי או בעת הפטירה דרך מוטב/ביטוח ... **ייחוד: אין בה חובת ביטוח חיים.**" | Unverified |
| E9 | "**פארי פאסו / משכנתא מדרגה שנייה** — שני בנקים משעבדים אותו נכס (למשל לאומי על 40% ומזרחי על עוד 20%) ... שרוב היועצים כלל לא מכירים." | Unverified; "משכנתא מדרגה שנייה" listed as complex file excluded from MVP (2026-07-29) |
| E10 | Unsecured "סולו" loan on income, debts, credit conduct; car financing = lien example. | General |
| E11 | "בפועל הבנקים לא ששים לממש בתים (נראוּת ציבורית, סטטיסטיקות הוצאה לפועל), במיוחד מול לקוח שיודע לדבר" | Opinion |
| E12 | "גיל מקסימלי לנטילת משכנתא: **70**; המשכנתא יכולה להימשך עד גיל **80** (חוק מ־2016)." | Unverified; Discount form accepts applicant ages 18–90 (different thing) |
| E13 | "תקופה מקסימלית: **30 שנה**. מינימום פורמלי של שנה, אך בפועל הבנקים נמנעים מלתת מתחת ל־5 שנים" | 30 consistent (329 §8); Discount refinance term field 5–30 years supports the 5-year floor in practice |
| E14 | Three strategies: min monthly payment; min total repayment ("1.7 מיליון ל־1.9 מיליון הוא 200 אלף ₪"); min rate exposure — "בעיקר 'ספין' של יועצים, כי תמיד אפשר למחזר." | Matches the flowchart's three mixes; "spin" = opinion |
| E15 | "**מחזור אינו מוגבל** אך יש לו עלויות: **קנס היוון** — תשלום על הדלתא בין הריבית שהתחייבת עליה לריבית הנוכחית (8.5% → 7% — קנס על ה־1.5%)." | Simplified/partly wrong: regulated fee uses BoI average rates, the lower of two formulas, time-served reductions; prime has none |
| E16 | "**אישור עקרוני** — טופס דיגיטלי לכל בנק בנפרד: פרטים אישיים ושל בן/בת הזוג, הכנסות, חיווי אשראי, הון עצמי. לרוב האנשים ניתן 'אישור מהיר' במקום." | Consistent (J-060 immediate vs רפרנט; Discount form) |
| E17 | "**הוראה 451 ('שלושת הסלים', סוף 2020)** — כל בנק ... **חייב** לתת **שלוש הצעות בתמהילים אחידים וזהים בין כל הבנקים** (פריים, קבועה צמודה, קבועה לא צמודה) ... ההצעות מגיעות כברירת מחדל" | **CONTRADICTS** Directive 451 App. 5 as transcribed: baskets are (1) 100% קל"צ; (2) ⅓ קל"צ + ⅓ פריים + ⅓ משתנה צמודה כל 5 שנים; (3) ½ קל"צ + ½ פריים; קבועה צמודה in none. Year "end of 2020" unverified |
| E18 | "**זמני מענה (חוק מ־2021)** — הבנק חייב לענות על אישור עקרוני בתוך **5–7 ימי עסקים**, אחרת הוא חשוף לתביעות." | Partly: source is Directive 451 §4ג(א)(5) (5 business days; 7 only for pre-defined categories, with reason); "law from 2021" and "lawsuits" unverified |
| E19 | "כל התהליך אפשרי דיגיטלית (טלפון/זום, בלי סניף) **משנת 2018**; טפסי האישור העקרוני דיגיטליים בשירות עצמי **משנת 2020**." | Unverified (2018 matches e-signature amendment / circular ח-06-2570 of 4 Oct 2018 for online POA) |
| E20 | "**שמאות** — הליך קצר. בפרויקט חדש של קבלן / מחיר למשתכן קיים דוח שמאות פרויקטלי המקובל על הבנקים, ואין צורך בשמאות פרטנית ... שמאות מ־12–14 החודשים האחרונים תקפה, ואין צורך בחדשה." | **CONTRADICTS** Directive 451 §9(ה): cross-bank reuse ≤ **90 days** (Hapoalim: "3 החודשים"); project-level appraisal unverified |
| E21 | "**אימות נתונים בסניף** — שלושה תלושי שכר אחרונים + שלושה חודשי עו"ש (מיותר אם החשבון באותו בנק)." | Consistent with Eden 2026-08-04 (J-130) and v1 checklist |
| E22 | "אישור עקרוני תקף **28–30 יום**; ריביות ההצעה תקפות **3 חודשים** (נאמר בהסתייגות — הכלל המדויק יאומת)" | **CONTRADICTS** Directive 451 §4ג(א)(4): ≥24 days (12 if no new lien); "3 months" = "folklore until someone proves otherwise" (J-060) |
| E23 | "**אפס חסמי כניסה**: מתקשרים לבנק, נותנים שם ומייל — ומקבלים מספר יועץ. אין דרישות השכלה, הסמכה או רישוי." | Confirmed by the licensing bill's explanatory notes (2026); bill pending |
| E24 | "בממוצע יועץ שולח אישורים ל**שני בנקים בלבד**, לרוב אלה שהוא כבר עובד איתם." | Unverified |
| E25 | "**תיק משכנתא מתחיל היום ב־6,000 ₪** (בשיחה הוזכרה גם דוגמה של 11,000 ₪); יש הגובים כסף גם על אישור עקרוני בלבד — פעולה של רבע שעה במחשב." | Range consistent with research "₪6,000–15,000" (8290315); other Brain figures 7,000–8,000+VAT, 8,000–10,000 |
| E26 | "הלקוחות לא מכירים את הוראה 451 ואת חובות הבנקים — **פער הידע הוא מקור הניצול**." | Opinion |
| E27 | "ענף legacy — 'אב לבן' וקורסים ... בנק ישראל נמנע מלהסדיר אותו" | Opinion; regulation now via a Knesset bill, supervised (per press) by Ministry of Justice, not BoI |
| E28 | "מהיום למחר אפשר לארגן ארבע פגישות עם ארבעה בנקים שונים" / pilot client exists | Business context |
| E29 | "**כמיליארד ₪ הלוואות בשנה**" (annual market size) | **Likely wrong / garbled** — must verify against BoI monthly housing-loan data before teaching |
| E30 | "בנקים מובילים: **מזרחי ולאומי** בפער, **פועלים** מתחתיהם." | Verify market shares |
| E31 | "**חברות ביטוח** קיבלו היתר מבנק ישראל להעמיד משכנתאות; יועצי המשכנתאות כמעט לא פונים אליהן" | Discount form lists "בחברת ביטוח" as where an existing mortgage may be managed — supports existence; the permitting regulator unverified |
| E32 | "**הביקוש לדירות קשיח לחלוטין** ... קפיצה של פי ~12 משכורות בעשור ... משקיעים תמיד קונים" | Opinion / verify figure |
| E33 | Banks "אסור להם לקדם פלטפורמה חיצונית, אבל הם **משתפים פעולה ברמה גבוהה** — ... אפילו להתאגדויות קטנות של 2–3 יועצים" | Unverified |
| E34 | "לכל משכנתא רגילה בישראל יש **חובת ביטוח חיים** ... מי שחלה (למשל סרטן) מתקשה לקבל ביטוח חיים" | Directive 451 §11(א) says bank **may** require it (not law-mandated); ≤₪30k no requirement; practice = universal |
| E35 | Mortgages in dollars until 70s–90s; BoI stopped ~2000s — "הצעד שהציל את ישראל" | Verify |
| E36 | Y2K/dot-com, subprime 2008 narrative; "ישראל כמעט לא נפגעה — המדינה היחידה" | Verify; likely overstated |
| E37 | "**שום חישוב לא יתבצע על ידי מודל שפה**" | Became Mogi decision (2026-07-29) |

### B. Eylon — later confirmations
| # | Date / page | Exact wording |
|---|---|---|
| E38 | 2026-08-03, J-090 (7503881) | "**Settled by Eylon on 3 August 2026: yes, and it happens often enough that we have to support it.** A single mortgage can run fixed-unlinked over 25 years alongside prime over 15." |
| E39 | 2026-08-03, Decision 16646263 | "Each track (מסלול) in a mix can carry its own term — **a 30-year fixed beside a 12-year prime is normal and common**." "this is a fact about the market, not a preference ... the practice is established." |
| E40 | 2026-08-21, walkthrough 26935299 | Eylon approved the advisor flow; his inputs: journey broken into steps "לפי הסדר האמיתי של השיחות", and per form "הערכים הנפוצים (מאיפה לידים מגיעים, למה תיקים נופלים, למה בנקים מסרבים). מה שהוא באמת שומע". Flow includes "מזרחי — עברו 5 ימי עסקים. הלקוח זכאי לדעת למה" and reminders to request the appraisal report copy and the bank's "דף הביצוע". |
| E41 | 2026-10-07, Decision 67436545 (15 answers, authored by Eylon) | Headline payment = "Monthly repayment under current terms" (Spitzer where selected); show first payment and projected max, highlight when ≥10% above headline. |
| E42 | same | "Eylon confirmed that we have access to a source containing many approvals in principle." |
| E43 | same | Initial simulation: assume **five-year reset** for periodically variable tracks; supported intervals 12, 24, 30, 36, 60, 72, 84, 120 months; "Five years means time between interest resets, not the loan term. It does not apply to prime-rate changes or to monthly CPI indexation." |
| E44 | same | Store total rate + anchor type/value/date + contractual spread; don't reconstruct spread from today's anchor. |
| E45 | same | Income: salary, dividends, existing rent, future rent for 2nd+ property (product choice); statuses Included / Requires review / Excluded; "Divide eligible recurring annual net income by 12"; new job before first salary may be reviewed with signed contract; don't double count company profit and dividends. |
| E46 | same | Deduct commitments with **more than 18 months remaining**; rent paid when not living in the purchased property counts even if <18 months remain (Directive 329 App. A). |
| E47 | same | Existing mortgage: repaid → exclude; retained on **same property** → add to new repayment if >18 months; on **another property** → deduct as commitment if >18 months. Same-property aggregation effective **1 Oct 2026** (Circular 2852 postponed 1 July). |
| E48 | same | PTI repayment: amortising → initial repayment on full amount; grace → after grace; bullet/balloon → monthly interest. **No arbitrary rate-shock.** PTI = repayment ÷ recognised disposable monthly income × 100. |
| E49 | same | Grace: partial (interest paid) vs full (interest accrues); grace **included in total term** by default (25-year loan with 1 year grace → 24 after). Bullet: partial vs full; show maturity payment prominently. |
| E50 | same | **Entitlement track (זכאות) = fixed-rate and CPI-linked**. |
| E51 | same | Prime: BoI GetInterest returns the **policy rate**; keep policy rate, prime and customer spread distinct; keep manual prime-update process. |
| E52 | 2026-10-07/08, Research 67469313 (author Eylon) | Policy rate observed 3.25% (next decision 2026-10-21); קו המשווה rates are annual effective, exclude bullet/balloon/FX; "Public market data do not supply a bank's executable price ... Changing a mix may change the rates a bank will offer." |

### C. field banker (בנקאי בשטח) — August 2026 phone answers (page 3112963; used in J-140)
| # | Exact wording | Note |
|---|---|---|
| T1 | "**שמאי שולח ישירות לבנק את השמאות - היועת או הלקוח מזמינים את השמאי**" | Consistent with banks' published instructions; advisor may book |
| T2 | "**אם יש שמאות מבנק אחד - הבנקים האחרים מחוייבים לקבל אותה**" | **Stronger than written rule** (§9(ה): "shall not unreasonably refuse", ≤90 days, appraiser on receiving bank's list; bank may demand adjustments). Off-list case not asked |
| T3 | (J-140 paraphrase) "the advisor makes the call as often as the customer does — so an appraiser will take the booking from us" | — |
| T4 | Q on digital POA from advisors — **no answer recorded** | OPEN |
| Context | 2026-07-31: "כ-4–5 שנים במערכת הבנקאית; קואופרטיבי ועממי" | — |

### D. Other "experienced advisor / field" statements (unattributed in source — treat as team claims)
- "A mortgage enquiry is rarely made to only one company." (J-020)
- Insurance today often bought "from the bank's agency at the counter"; "the bank's own policy is usually the expensive one" (J-130/J-160; research 8290315, 9797633 — secondary sources).
- "A fast mortgage takes about **21 days**" (vision page 60981249; 2026-10-01 meeting).
- "Advisors charge **7,000–8,000 ₪ + VAT** because of hidden costs, mainly cost of the lead" (2026-10-01).
- Competitor packages: regular 7,500 ₪ + VAT, premium 49,000 ₪ + VAT, full premium 30–50k ₪, "מסורבים" priced by complexity (2026-10-01 competitor research).
- "לקוחות מאמינים שיועץ משיג ריבית נמוכה יותר כי הוא מכיר את הבנק; חמישה-שישה אנשים אמרו את זה." (2026-10-01)
- "הבנקים מאשרים בתוך טווחים; יש כשלושה תמהילים טיפוסיים." (2026-10-01, one founder's position)
- "יועצים אוהבים לקוח שכבר מגיע עם הצעה, וטענות 'חסכתי לך 100 אלף' הן יחסית להצעה הגנרית של הבנק." (2026-10-01)
- Family that can't pay 8,000–10,000 ₪ for an advisor "pays 100–150 thousand ₪ more over the life of the loan" (vision page; 2026-10-01).
- "60%–80% of Israeli borrowers use an advisor" (press, licensing-bill page; not traced to BoI).
- Pre-approval "מי שעשה אותו פעם, לכל היותר יעשה עוד אחד" (2026-07-31).
- "כל משכנתא בישראל מחייבת ביטוח חיים" (2026-07-31; see E34 caveat).
- Advisor fees paid upfront at file opening or advance + 2–3 payments; some success-only for harder cases; full guidance ~₪6,000–15,000 (research 8290315, secondary).

---

# Part D — Contradictions and tensions flagged

1. **Uniform basket composition** — Eylon 2026-07-27 "(פריים, קבועה צמודה, קבועה לא צמודה)" vs Directive 451 App. 5 transcription (pages 6455359, 7733250): 1 = 100% קל"צ; 2 = ⅓ קל"צ + ⅓ פריים + ⅓ משתנה צמודה 5 שנים; 3 = ½ קל"צ + ½ פריים; קבועה צמודה in none. → Teach the directive version.
2. **Pre-approval validity** — Eylon "28–30 יום" and rates "3 חודשים" vs Directive 451 §4ג(א)(4) "not less than 24 days", 12 days if no new lien (§4ג(ז)); J-060 calls 3 months "folklore". Banks may give longer in practice.
3. **Bank response time** — Eylon "חוק מ־2021 ... 5–7 ימי עסקים ... חשוף לתביעות" vs Directive 451 §4ג(א)(5): 5 business days; 7 only for categories pre-defined in credit policy, customer entitled to reason. Source is a BoI directive, not a law; "lawsuits" unverified.
4. **Appraisal validity/portability** — Eylon "שמאות מ־12–14 החודשים האחרונים תקפה" vs §9(ה) 90 days for cross-bank reuse (Hapoalim "3 החודשים"). field banker: other banks "obliged" to accept — stronger than §9(ה)'s "not unreasonably refuse" + on-list + adjustable.
5. **PTI 40%** — Eylon "banks tighten in practice to 40%" vs J-090/Directive 329 §6: 40% is a capital/price boundary; 42% borrower "not rejected ... priced worse". Possibly both true (bank appetite vs regulation) — present carefully.
6. **קנס היוון** — Eylon's delta-of-rates description vs the 2002 Order (two formulas, BoI average rates, take lower, time-served reductions, prime exempt). Also J-090 "the fixed part is exactly the part that carries an early-repayment penalty" vs research: variable tracks resetting less often than yearly can carry a (small) fee.
7. **Life insurance "mandatory"** — Eylon/2026-07-31 "חובת ביטוח חיים לכל משכנתא" vs Directive 451 §11(א): the bank **may** require; not required ≤ ₪30,000; customer may buy externally. Reverse mortgage: Eylon says no life insurance duty.
8. **Bank-statement period** — J-030 draft "last 3–12 months" vs Eden 2026-08-04 (J-130) and Eylon "three months".
9. **Hapoalim advisor-POA expiry** — J-050 (answered 2026-08-05 from forms): Hapoalim §14 and Discount §15 expire after six months; signing-electronically research (9830401): Hapoalim validity "Not established", Leumi 12 months, Discount 6 months.
10. **Advisor fee figures** — 6,000+ (Eylon; also "₪6,000-ish human price" in research), 11,000 example; 7,000–8,000 + VAT (2026-10-01); 8,000–10,000 (vision page); 6,000–15,000 (research); 7,500 + VAT regular / 49,000 + VAT premium (competitor). Ranges, not a hard conflict.
11. **Mogi's own price** — J-020 (Aug 2026) "~₪6,000 now, ₪300–500 later"; 2026-07-29 "300–500 ₪"; Eylon 2026-07-27 "~300 ₪"; pilot 2026-08-19 "5,900–6,000 ₪ incl. VAT"; Product & scope 2026-10-01/02 "price is open; current client 3,000 ₪ + VAT"; entry options 200 / 1,990 / 2,000 / 3,000 ₪ / free. Current: **open; 3,000 ₪ + VAT for current client**.
12. **Market size** — Eylon "כמיליארד ₪ הלוואות בשנה" — implausible vs public data (verify).
13. **Same-property aggregation effective date** — older references to 1 July 2026 vs Circular 2852 → **1 October 2026** (pages 7503881, 67436545, 67469313 agree on 1 Oct).
14. **Directive self-contradiction** — §9(ה) cites appraiser-list provision at §4ג(ב8) (old) while it now sits at §4ג(ג)(2) (J-140).
15. **Strategy reversal** — 2026-07-29 "Service First, Software Second" (separate service brand, tech brand only after proof; Eylon's 2026-07-27 "stand-alone marketplace") vs 2026-10-01 decision "Mogi is the only company and goes to market now". The later decision governs.
16. **Paywall location** — board: node 30 (J-120); argued: J-080, J-100, J-110, J-170 — undecided.
17. **Calendar vs business days** — 5-day answer window counted in banking days; 24/12-day validity and 90-day appraisal window are calendar days (consistent once clarified; easy to confuse).

---

# Part E — Course-topic map (where each topic is supported)

| Course topic | Best Brain sources (page ids) | Reliability |
|---|---|---|
| The mortgage journey end to end (17 stages) | 5373953 + J-pages | Mogi-internal description, Aug 2026 |
| Mortgage types (first home, upgrader, refinance internal/external, self-build, reverse, pari passu, any-purpose, renovation) | 2949123 (Eylon), 16777218, 30375937 | Field + bank form |
| Equity / LTV (75/70/50) | 7503881 (Dir. 329 §2), 2949123 | Regulation + field |
| Repayment ability / PTI (50%, 40%, >18-month commitments, same-property rule 1.10.2026, income recognition) | 7503881, 67436545, 30375937 | Regulation + Eylon decisions |
| Tracks, linkage, anchors, spreads, prime vs policy rate, reset intervals | 7733250, 67436545, 67469313 | Regulation + Eylon |
| The mix (תמהיל) — three goals, one-third fixed, per-track terms | 7503881, 16646263, 2949123 | Regulation + Eylon |
| Uniform baskets & comparing offers (real cost of credit, highest payment, forecasts) | 6455359, 7733250, 8126465 | Regulation (transcribed) |
| Pre-approval: what it is, free, no documents, 5/7 business days, 24/12-day validity, credit check | 5570561, 5898285, 5931054, 8290315, 6455298 | Regulation |
| Documents (what, why, payslip anatomy, bank-specific file-opening lists) | 5636146, 8716289, 43384833, 8290315 | Mixed (draft list flagged "Eylon/Amit should correct") |
| Underwriting (חיתום) & credit data | 9863169, 6455298 | Regulation/research |
| Appraisal (שמאות) | 8716324, 3112963 (field banker) | Regulation + field |
| Insurance (life & structure) | 9797633, 8290315, 9863207 | Regulation |
| Signing, POAs, notary, e-signature | 9863207, 9830401, 6029348 | Law/regulation |
| Funding: interim period, schedule anchoring, letter of intent, registration | 9895937 | Regulation |
| Early repayment & refinance economics (קנס היוון, exit points, §15א test) | 7798786, 7733250, 8126465 | Regulation (transcribed) + worked example |
| Banking calendar | 8650753 | Regulation |
| Advisor industry, fees, licensing bill | 2949123, 9568265, 8290315, 60588034 | Field + bill text |
| Negotiation rounds & when to stop | 6848521, 8126465, Product & scope | Mogi decision |
| Mogi's model (human advisors behind transparent platform; LLM never computes; Shadow/Assisted) | 16809986, 60981249, 20480025, 28934145, 28901456 | Mogi decisions |
| Case-study personas | 17760257–18153473 | Fictional |

