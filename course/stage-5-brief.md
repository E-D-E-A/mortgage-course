# Stage 5: the brief for its authors (2026-10-16)

Stage 5, "מהצעות לתמהיל: השוואה ובנייה", is ten lessons and a check. Four authors write the lessons at the same time. This page holds what they all share. The house rules are in `course/AUTHORING.md` (including "every regular lesson has a video"); the plan is `course/course-map.md`, stage 5, section 5 (the big-picture map) and section 8 (the cases). Read those first, then the stage-3 lessons 3.7, 3.8, 3.10 and 3.11 and the stage-4 lessons 4.4, 4.5 and 4.15 (the templates, and what the learner already knows), and `course/stage-4-brief.md` for the working pattern.

## Who owns what

| Author | Lessons | Owns, besides each lesson's own files |
|---|---|---|
| A | 5.1–5.3 | `src/lib/calc/offers.ts` (+ test, `checks/kinds/offers.py`): the pre-approval's fields, the three uniform baskets as exact fractions, and the comparison measures (expected total rate, total expected payments, highest expected payment) over several offers; **write its API first**, describe it in the file's header (C and D import it). The example pre-approval document of "בנק א׳" (a component or a static page, fictional, marked as a learning example). Component: the offer comparer (משווה הצעות, required in 5.3). |
| B | 5.4–5.5 | `src/lib/calc/forecast.ts` (+ test, `checks/kinds/forecast.py`): forward anchors from a zero curve (the formula in Brain 7733250, via `research/notes/brain-calculation.md` §6), expected inflation as the **compounded** gap between nominal and real curves, a forecast payment path for each track type. **Curves in this course are illustrative**: write them as a small data file `src/data/curves.ts` with the label "עקום להמחשה, לא נתוני בנק ישראל" and never present them as the Bank of Israel workbook. The "איזה מספר זה?" component (market average, estimate, personal offer, executed deal). |
| C | 5.6–5.8 | `src/lib/calc/sensitivity.ts` (+ test, `checks/kinds/sensitivity.py`): what moves when one lever moves (percent, amount, term, rate, index) and the balance at chosen points in time; the three goals as objective functions over a fixed set of candidate mixes; **case A's mix data** `src/data/case-a-mix.ts` (see "Case A"). Extends `MixBuilder.vue`'s use (props only; if a prop is missing, say so in the report — the coordinator changes shared components). The 5.8 workshop: three alternatives for case A. |
| D | 5.9–5.10 (the stage check is written in a later round, after A–C report) | `src/components/big-picture/stage-5.ts` (every stage-5 node and link; register it in `index.ts`: the coordinator does it, you fill it), the "is this mix good / realistic" judgement tables, the regulation check **on a mix** (imports `regulation.ts` and `affordability.ts`; do not copy their logic). |

Anything shared that you need changed, say so in your report; the coordinator changes it. Every lesson gets its own video (`video/5-X.html`, rendered with `pnpm video 5-X`; look at its key frames and fix until clean). The map's video column names only the standout ideas.

## Sources in this session

- **Read offline:** `research/notes/*.md` (especially `brain-calculation.md` §6 and the J-080 / J-090 / J-100 sections of `brain-product-journey.md`), `research/field-knowledge.md` (FK-H claims, each with who and when), `research/source-map.md`, `research/eylon-list.md`.
- **Read-only, never change:** `/home/user/edea-mortgage/context/inputs/*`, `packages/schemas/registry/v1.yaml`. Real bank offers (the six screenshots) are real clients' data: **never** copy them; only the aggregate observations in field knowledge may be cited, and only with the team's approval (so: not in v1 lessons).
- **The Brain is not reachable** from this session; cite a Brain page through the note that recorded it. Official sites are blocked; WebSearch returns summaries only (label "לפי תקציר של מקור רשמי, לא אומת מול המקור", with the date).
- **Directive 451's text** is known to us only through Brain 7733250's transcription (Appendix 4, version 22 of 19/07/2023, read by the team on 3 August 2026). Label: "תעתיק של הצוות ב־Brain, לא נבדק מחדש מול ההוראה" — **not** "עובדה מאומתת".

## Open or contradictory points you must keep open

- **FK-H-031:** the field claim ("סוף 2020; פריים, קבועה צמודה, קבועה לא צמודה") contradicts the transcription (Appendix 5: the three baskets are fixed-unlinked / ⅓-⅓-⅓ / ½-½; a CPI-linked fixed track is in none) and the date (the BoI reform: 2022-08-31 per the source map). Teach the transcription; say the field claim differs; list it for Eylon.
- **The reference-table row** "משתנה צמודה … על בסיס מק״מ" with no linkage forecast looks like a transcription slip (source-map note): do not teach that row; say the transcription has a row that was not verified.
- **"Prime = BoI rate + 1.5" attributed to 451:** do not state it as a directive rule. The course so far treats it as a convention; keep it so.
- **The charges that belong in A** (the up-front charges in the real-cost formula): open legal question. Teach the formula with A as an input and say which charges count is open.
- **"Rates are valid three months":** folklore, not in 451; the directive's floors are 24 days (12 with no new lien). Keep.
- **How banks price, what banks prefer:** unknown. Do not invent; "לא ידוע", "שאלה פתוחה לאילון".
- **Three typical mixes (FK-H-061, FK-H-059):** field knowledge, not approved. The three goals are Mogi's J-090 design, not a fact about the market.
- **Mix examples in negotiation (FK-H-072):** field knowledge, unchecked.
- **Average rates (BIR_MRTG_99), "קו המשווה":** official averages are averages, not a bank's price (FK-H-057, Brain 67469313). Real numbers from those series are not available here: any number shown is labelled "להמחשה".

## The rules that matter most here

- **Label every claim.** Fact (source and date), Mogi decision (who and when), field knowledge (FK id, "ממתין לאישור אילון"), research, calculation assumption, or "לא אומת". A directive is never stated as fact from memory.
- **Order of terms.** `check:terms` enforces term-before-use; terms used before their lesson go in `<Later>`. New terms: `src/data/definitions/5-X.json`.
- **Fictional banks only:** "בנק א׳", "בנק ב׳", "בנק ג׳"; no real names except where a lesson cites a public rule (451 and 329 are named as directives; no bank). Every example document and offer carries: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים".
- **Offers are invented here and say so.** The rates in an example offer are the course's, not market quotes. The same mix at "בנק א׳" and "בנק ב׳" at different rates is a teaching device.
- **Numbers:** computed in code from facts, checked again in Python; no arithmetic in MDX; money in agorot by the statement rule (`schedule.ts`, "statement"); the first payment, the highest expected payment and the total are the 3.8–3.10 measures — use `metrics.ts`, do not reimplement.
- **Comparing is only legitimate on the same basis:** the same loan amount, the same basket or mix, the same date, the same forecast. Teach this as the point of 5.3 and break it deliberately in exercises.
- **Three kinds of number** (4.5) stay apart: a regulatory limit, a capital threshold, a bank's policy.
- **The LLM never computes.** Say so wherever a lesson mentions the future algorithm.

## Case A (נועם ושירה) in stage 5

Case A gets its mix here and its bank offers in stage 6. Starting point (from `scripts/case_sketch.py`, teaching assumptions): price 2,200,000 ₪; equity 560,000 ₪; loan 1,640,000 ₪ (LTV 74.55%); net incomes 12,400 + 9,300; a car loan of 1,450 ₪ a month with 26 months left (it counts under the 18-month rule until fewer than 19 are left). **The initial mix** is three tracks over 360 months: 546,000 at 4.60%, 547,000 at 4.10%, 547,000 at 4.40%, whose payment is **40.4% of the disposable income** (21,700 − 1,450 = 20,250) — a little above the 40% capital threshold. Lesson 5.6 (author C) fixes the track types (the learner must be able to see why each track has its rate) and defines the mix in `src/data/case-a-mix.ts` once; everyone else imports it. Compute the ratio with `affordability.ts`, never retype 40.4. The three alternatives of 5.8 are three goals (low monthly payment, lowest total, least exposure) and must each be checked against the limits of 329 (loan ratio, payment ratio, one-third fixed, 30 years). No bank offer for case A in stage 5: its rates are the course's stated assumptions. Case B (אבי) may appear in a short exercise; case C is stage 7's.

## Questions for Eylon

Every question or doubt goes to the list. **Write yours to `research/eylon-5-<your letter>.md`** (a row per question: the question, why it matters for which lesson, what the course says meanwhile, FK ids, and the official source to open). Do not edit `research/eylon-list.md`; the coordinator merges your file into it each round.

## Done means

`pnpm data`, `pnpm check:python`, `pnpm check:terms` and `pnpm test` pass, and your pages build. Build into your own folder, `pnpm astro build --outDir <scratchpad>/<your-letter>/dist`, and use a folder of your own for every scratch file: the scratchpad is shared. Look at every page at 390px and 1280px. No git; the coordinator commits.

Your report gives: the files you wrote; the terms you introduced; every claim that is not general math, with its label, source and date; the FK ids you used; the questions for Eylon or for an official source (also in your `research/eylon-5-<letter>.md`); anything you need changed in a shared file; your doubts.
