# Stage 7: the brief for its authors (2026-10-16)

Stage 7, "פירעון מוקדם, מיחזור ועסקאות מורכבות", is eight lessons and a check. Three authors write it at the same time. This page holds what they all share. Read first: `course/AUTHORING.md`, `course/course-map.md` (stage 7, sections 4, 5, 8 — case C), `course/brief/part-3.md` (stage 7), `course/stage-6-brief.md` and `course/stage-5-brief.md` (the working pattern, labelling rules and the QA lessons, all of which hold here), and the stage 3 and 5 lessons you build on (3.3, 3.10, 5.3, 5.4).

## Who owns what

| Author | Lessons | Owns, besides each lesson's own files |
|---|---|---|
| A | 7.1–7.3 | `src/lib/calc/earlyrepay.ts` (+ test, `checks/kinds/earlyrepay.py`): the five fees, the discounting fee in both versions (§3(3) and §3(4)) and "the lower of the two", the reductions for time served, the exit points and the notice window, the index fee and the "16th instead of the 15th" rule. **Write the API first**, document it in the header: B and C import it. Components: the fee calculator that shows every step (7.2, required) and the fee-over-time axis (7.3). |
| B | 7.4–7.5 | `src/lib/calc/refinance.ts` (+ test, `checks/kinds/refinance.py`): the §15א test (expected total rate versus the rate for comparison purposes, both from the same appendix, over the remaining term, per track and for the whole loan), "a lower payment is not a total saving", internal versus external refinance, the new-loan side (reuse `forecast.ts`, `offers.ts`, `metrics.ts`). Component: the refinance calculator (7.4, required). |
| C | 7.6–7.8 and the map | `src/components/big-picture/stage-7.ts` (register in `index.ts`: the coordinator does it; you fill it), 7.6–7.7 (introduction to complex deals: only "היכרות", see below), 7.8 the workshop "is it worth refinancing case C?" using A's and B's modules, `src/data/case-c.ts`. The stage check is written in a later round. |

Anything shared that you need changed, say so in your report. Every lesson has its own video (`video/7-X.html`, `pnpm video 7-X`; look at its key frames and fix until clean).

## Sources and labelling

- Offline notes: `research/notes/brain-calculation.md` §6 (451 Appendix 4, §15א, the refinance sentence) and §7 (the early-repayment order, the full discounting-fee formulas, the five fees, the exit points, the reductions, the **worked example**), `research/notes/brain-product-journey.md`, `research/notes/meetings-and-drive.md`, `research/field-knowledge.md` (FK-H-064 internal refinance etc.), `research/source-map.md`.
- The Order (צו הבנקאות, פירעון מוקדם, 2002) and §15א of 451 are known to us **only through the team's transcription in the Brain** (read by the team on 2026-08-02/03; the Order's only amendment is 2014). Label: "תעתיק של הצוות, לא נבדק מחדש מול הצו"; "עובדה מאומתת" only if you opened the primary source (nobody did). Official sites are blocked here.
- **The worked example is a fixture**: a single fixed-unlinked track of 700,000 ₪, granted 2023-07-01, 20 years, 5.90% nominal (payment 4,974.72 ₪; 37 payments made, 203 remaining; balance 637,956.74 ₪), repaid 2026-08-02 with notice; A = 4.823% and C = 5.09% (effective annual, 15–20 years bucket); §3(3) = 56,765.24 ₪, §3(4) = 12,882.44 ₪, the lower = 12,882.44 ₪. It is the team's own computation: your code must reproduce it to the agora (a test, and an independent Python check), and the page labels the A and C values "ערכים שהצוות קרא ב־2.8.2026, לא אומת". It is also case C's loan (map section 8).
- **Mixing effective and nominal is the classic mistake**: the published average is effective annual; the contract rate is nominal (÷ 12); A and C are converted by the twelfth root. 5.90% nominal = 6.06% effective. Teach it and type them differently in code.
- Our reading, not the Order's: a negative fee is set off against the other fees (the Order says so, §7); whether the total can go below zero is not stated, and Mogi would floor at zero: label it "קריאה שלנו, שאלה פתוחה".
- Other labelled-open points: the ₪60 charged once per repayment (Supervisor of Banks ruling, 2021-09-13: team transcription); "no fee on realisation of a mortgage on a single dwelling, subject to thresholds" (read off a bank sheet, not the Order: "לא אומת"); the directed loan; the complementary-loan scale (up to 40%). The "same property" rule from 2026-10-01 (case C's top-up) is the team's transcription of circular 2840-06 / 2852: "לא אומת".
- **Field knowledge (7.5, 7.6, 7.7)** is hypothesis only: "ידע מהשטח (FK id), ממתין לאישור אילון". 7.6 and 7.7 are **introductions** ("היכרות בלבד"): describe what each kind of deal is, why it is complex, what to ask, and when to send the case to a specialist; do **not** state rules, rates or procedures of bridge loans, builder financing, self-build, second-lien mortgages or reverse mortgages as fact. Use only what the notes support, label everything else "לא אומת", and list questions. The distinction "pari passu versus a second-degree mortgage" (7.7, "הבחנה נדרשת") must be taught as a distinction between what the course knows and does not.
- Real rates in the worked example are the only "real" numbers in the stage; every other rate, offer and bank is invented, the banks are "בנק א׳, ב׳, ג׳", and each example carries the standard learning-example mark. Real client data never.
- The LLM never computes: an early-repayment fee and a refinance test are auditable code with worked-example tests (Mogi decision, all-team meeting 2026-07-29).

## Case C (עדי וירון)

Case C appears from stage 7 (map section 8): an existing mortgage of 700,000 ₪, fixed unlinked, 5.90%, 20 years, from July 2023, payment 4,975 ₪ (computed): **deliberately the loan of the worked example**, so the fee calculator can be tested against a known result. They want to refinance and to add 150,000 ₪ for a renovation (the "same property" rule applies to the top-up). Case A and B may appear in short exercises only; case C's new-offer side uses the course's invented banks and the stage-5/6 price conventions (`offers.ts`, `forecast.ts`, `case-a-offers.ts` as a model — do not reuse case A's offers for case C).

## Rules that matter most here

- Label every claim (fact with source/date, Mogi decision, FK "ממתין לאישור אילון", research, calculation assumption, "לא אומת"); fictional banks only; no arithmetic in MDX; money by the statement rule; `<Later>` for terms before their lesson; new terms in `src/data/definitions/7-X.json`; plural address; "נקודת אחוז" is singular up to one; no "Brain", J-codes, DEC-n, file paths, repo or brief references in learner text, subtitles, frames or map cards (cite pages only in `<Sources>` as the earlier stages do); positioning and negotiation advice stay labelled.
- **Lessons from stages 5–6:** put the column the text discusses first in a reading table on phones; keep the video's numbers and signs in LTR isolates (`lr()`); every figure comes from a checked fact; a wrong-answer note per option; exactly one correct option per choice question; the wait/edge cases the course leaves open (exactly 18 payments left) stay open.
- **Questions to Eylon / lawyer:** write yours to `research/stage-7-raw/eylon-7-<letter>.md` (a row per question: the question, why it matters for which lesson, what the course says meanwhile, FK ids, the official source to open). Do not edit `research/eylon-list.md`.

## Done means

`pnpm data`, `pnpm check:python`, `pnpm check:terms`, `pnpm test` pass; build into your own folder (`pnpm astro build --outDir <scratchpad>/<letter>/dist`); look at every page at 390px and 1280px; no git. Report: files; terms; every non-math claim with label/source/date; FK ids used; questions; shared-file changes needed; doubts.
