# Stage 4: the brief for its authors (2026-10-10)

Stage 4, "הלקוח, הבנק והעולם", is fifteen lessons and a check. Five authors write it at the same time. This page holds what they all share. The house rules are in `course/AUTHORING.md`; the plan is `course/course-map.md`, stage 4, sections 4 (the 22 factor cards), 5 (the big-picture map) and 8 (the cases). Read all three first, then the stage-3 lessons as your templates for structure and tone (`src/pages/lessons/3-1.mdx`, `3-8.mdx`, `3-12.mdx`).

## Who owns what

| Author | Lessons | Owns, besides each lesson's own files |
|---|---|---|
| A | 4.1–4.3 | `src/lib/calc/affordability.ts` (+ test, `checks/kinds/affordability.py`): recognised income, the 18-month rule for obligations, disposable income, the payment-to-income ratio. **Write its API first** and describe it in the file's header: B and E import it. Component: the payment-to-income checker (בודק יחס החזר, required in 4.3). |
| B | 4.4–4.6 | `src/lib/calc/regulation.ts` (+ test, `checks/kinds/regulation.py`): the directive-329 limits (financing ratio 75/70/50, payment ratio 50%, two-thirds variable, 30 years) as one checker; the living budget. Component: the regulation checker (בודק עמידה ברגולציה, required in 4.4). |
| C | 4.7–4.9 | Underwriting, credit data and account conduct, the collateral (property, appraisal, rights registration, life and structure insurance). |
| D | 4.10–4.12 | The 22 factor cards as data (`src/data/factor-cards.ts`, one object per card answering the eight questions), shown in 4.10–4.11 and kept for the downloadable appendix; `src/components/big-picture/stage-4.ts` (every stage-4 node and link except the market layer); the pricing tower (מגדל הריבית) in 4.12. |
| E | 4.13–4.15 | `src/components/big-picture/stage-4-market.ts` (the market layer of 4.14, region `market`); the questionnaire comparison in 4.13; the 4.15 workshop. 4.15 imports A's and B's modules: write 4.13 and 4.14 first, and check that `affordability.ts` and `regulation.ts` exist before 4.15. |

A lesson's own files are listed in AUTHORING ("The files one lesson owns"). Anything shared that you need changed, say so in your report; the coordinator changes it. Both map files are already registered in `src/components/big-picture/index.ts`; fill them, don't register them again. Every lesson gets its own video (`video/4-X.html`, rendered with `pnpm video 4-X`; look at its key frames and fix until clean). The map's video column names only the standout ideas.

## Sources in this session

- **Read offline:** `research/notes/*.md` (the Brain, read in full on 2026-10-09: calculation rules, the product journey, meetings and Drive, official sources by search summary, the domain), `research/field-knowledge.md` (the FK-H claims, each with who and when), `research/source-map.md` (sections 3 and 4: the gaps and contradictions of stage 4), `research/eylon-list.md`.
- **Read-only, never change:** `/home/user/edea-mortgage/context/inputs/*-preapproval-questionnaire.md` (what each of the four banks asks), `context/inputs/discount-advisor/README.md`, `packages/schemas/registry/v1.yaml`.
- **The Brain itself is not reachable from this session.** Cite a Brain page through the note that recorded it ("Brain 67436545, דרך research/notes/brain-calculation.md").
- **Official sites are blocked.** WebSearch works and returns summaries. An official rule read only through a summary is labelled "לפי תקציר של מקור רשמי, לא אומת מול המקור", with the date of the search.
- **The gaps of stage 4 are real** (source map, section 3.1): how a bank prices, threshold bands, what each bank prefers, what in a credit report disqualifies, self-employed income, how long each step takes. Do not fill them. Say plainly what is not known, mark it "לא אומת" or "שאלה פתוחה לאילון", and list every such question in your report: they go to the Eylon list.

## The rules that matter most here

- **Label every claim.** Fact (with source and date), Mogi decision (who and when), field knowledge (FK id, "ממתין לאישור אילון"), research, calculation assumption, or "לא אומת". A directive or a law is never stated as fact from memory.
- **Dated, never "today" or "always".** The "אותו נכס" rule applies from 1.10.2026 (as the team transcribed it, not verified). Every market example in 4.14 carries its date.
- **Three kinds of number** (4.5): a regulatory limit, a capital threshold, and a bank's policy. Keep them apart in every lesson, not only 4.5.
- **Real bank names** appear only where a lesson describes what that bank's public questionnaire asks (4.13), as a fact with its source, no logo or branding. Every example document and every example offer uses "בנק א׳", "בנק ב׳".
- **The cases.**
  - Case B (אבי, self-employed) is stage 4's case: recognised versus declared income (4.1), underwriting (4.7). Its starting numbers are in the map and in `scripts/case_sketch.py`.
  - Case A (נועם ושירה) appears in stage 4 only with the numbers the map already gives: price, equity, loan, financing ratio, incomes, the car loan. **It gets no tracks, no mix and no offer before stage 5.** Its feasibility page in 4.15 checks it against the limits: the largest payment the rules and the thresholds allow, the 18-month rule on the car loan, the financing ratio. Where a payment is needed, the page shows the loan a payment would carry under a stated calculation assumption (rate and term written as the course's assumption, not an offer). The 40.4% figure belongs to stage 5's initial mix.
- **Numbers** come from facts, computed in code and checked again in Python; no number is typed in the MDX. Money in agorot by the statement rule.
- **Term-before-use** holds, and `pnpm check:terms` enforces it. New terms go in `src/data/definitions/4-X.json`.

## Done means

`pnpm data`, `pnpm check:python`, `pnpm check:terms` and `pnpm test` pass, and your pages build. Build into your own folder, `pnpm astro build --outDir <scratchpad>/<your-letter>/dist`, and use a folder of your own for every scratch file: the scratchpad is shared. Look at every page at 390px and 1280px. No git; the coordinator commits.

Your report gives:
- the files you wrote;
- the terms you introduced;
- every claim that is not general math, with its label, source and date;
- the FK ids you used;
- the questions for Eylon or for an official source;
- anything you need changed in a shared file;
- your doubts.
