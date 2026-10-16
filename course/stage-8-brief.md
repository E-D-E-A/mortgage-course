# Stage 8: the brief for its authors (2026-10-17)

Stage 8, "האלגוריתם", is 28 lessons and a check. Four authors write the lessons at the same time. This page holds what they all share. The house rules are in `course/AUTHORING.md` (including "every regular lesson has a video"); the plan is `course/course-map.md`, stage 8 (the table, the cases, section 3 term list, the map layer "בשלב 8 נוספת שכבה…"); the source is `course/brief/part-4.md` (stage 8 in full). Read those first, then the templates: stage 5 lessons 5.6–5.8 and 5.10 (mix, goals, judging), stage 6 lessons 6.4 and 6.11, stage 7 lessons 7.4 and 7.8, and `course/stage-7-brief.md` for the working pattern.

## What this stage is

The learner has done by hand in stages 5–6 what Mogi's algorithm does systematically. Here they learn how it is built: the maths from zero (8א), posing the problem (8ב), the calculation engine (8ג), uncertainty (8ד), search and optimisation (8ה), the bank inside the equation (8ו), the full pipeline (8ז), an algorithm that grows with data (8ח), the map of variables (8ט), and a workshop where they build a small engine themselves in a spreadsheet (and, for those who want, in Python, explained line by line).

**The most important labelling rule of the course.** Nothing in stage 8 is an existing Mogi system. Every lesson says at its top which of three it belongs to: **"Mogi היום"** (no mix calculation exists in code; the engine call is frozen), **"הוחלט"** (only: the 15 calculation rules Eylon decided, and the layer modes off / shadow / assisted / automatic) or **"עתיד"** (everything else). Weights, thresholds, margins, step sizes and every number of a model in this stage are **להדגמה**: not a Mogi decision and not a bank's policy. Data in this stage is **synthetic** and says so. The learner must be able to tell, at every moment, what is maths (true anywhere), what is Mogi's design (a plan), and what is an illustration.

## Who owns what

| Author | Lessons | Owns, besides each lesson's own files |
|---|---|---|
| A | 8.1–8.7 | `src/lib/calc/stats.ts` (+ test, `checks/kinds/stats.py`): mean, weighted mean, histogram bins, variance and standard deviation, percentile (**state the exact method** in the header), expectation of a discrete distribution, least-squares line and its errors (MAE, RMSE). `src/lib/calc/constraints.ts` (+ test, `checks/kinds/constraints.py`): a **candidate** type (a full request + mix), the hard constraints as small functions that import `regulation.ts`, `affordability.ts`, `mixcheck.ts` (do not copy their logic), and a **rejection-reason list** per candidate (every reason, not only the first). Components: HistogramBuilder (8.3), DiceToPayments (8.4), LineFit (8.5), DecisionTree for the two levels of decision variables (8.6), CandidateFilter (8.7). **Write both APIs first** and describe them in the file headers; B, C and D import them. |
| B | 8.8–8.14 | `src/lib/calc/objectives.ts` (weights, normalisation, weighted score; feasible vs optimal), `engine.ts` (cash flow per track per scenario, mix = sum of tracks, the stage-3 metrics from `metrics.ts`; same input → same output, tested), `scenarios.ts` (the three forecasts of 8.10: by Directive 451, stress, macro — all curves are the illustrative ones in `src/data/curves.ts`), `montecarlo.ts` (a **seeded** generator: implement the same tiny PRNG in TS and in the Python check so results match exactly; no `Math.random`), `search.ts` (grid enumeration, counting the combinations by combinatorics: compute the "150 billion" figure in code, never type it). (+ tests, `checks/kinds/{objectives,engine,scenarios,montecarlo,search}.py`.) Components: WeightsPlayground (8.8, **required**), ScenarioSimulator (8.11, **required**), SearchRunner (8.14). Write the APIs of `objectives.ts`, `engine.ts` and `search.ts` first (C imports them). |
| C | 8.15–8.21 | `src/lib/calc/frontier.ts` (Pareto-efficient set; choosing a point by weights), `lp.ts` (a **tiny two-variable linear programme** solved by checking vertices, only to show what the method is — not a solver for Mogi), `pricing.ts` (anchor + margin with **steps around thresholds**; synthetic data generator, seeded), `estimate.ts` (least squares with an interval, and a prior that updates — use `stats.ts`), `calibration.ts` (bins of predicted vs observed rates; a reliability table), `pipeline.ts` (8.21: positioning → mix → predicted price → approval probability → ranking → explanation, per bank; a real offer replaces the estimate). (+ tests, `checks/kinds/…py`.) Components: EfficientFrontier (8.15, **required**), PricingModel (8.17, **required**: a small model on synthetic data), CalibrationCurve (8.19), PipelineFlow (8.21, "תרשים זרימה חי"). |
| D | 8.22–8.28 | `src/lib/calc/drift.ts` (a synthetic series whose regime changes; a model trained before the change; its error over time), `splits.ts` (time split vs random split, out-of-sample error; show the leak when you split randomly on time-ordered data), the algorithm layer of the big-picture map (`src/components/big-picture/stage-8.ts`: every stage-8 node and link, plus the layer "קלט / אילוץ / משתנה החלטה / פלט" on existing nodes — read how `BigPictureMap` layers work; if a prop is missing, say so; the coordinator changes shared components; register in `index.ts` is the coordinator's), **the workshop 8.28**: a downloadable spreadsheet (`scripts/build-sheets.py` pattern) with positioning → cash flow → search → hard-constraint filter → efficient front → choice → explanation on a synthetic case, checked against a sample bank offer, plus a Python notebook of the same engine explained line by line, generated from the same TS/Python modules (the Python must import from or mirror `checks/` code; no number typed by hand). Component: DriftDemo (8.24, **required**), MapOfVariables (8.27). |

Shared data: A defines the synthetic case for the stage once in `src/data/case-s8.ts` (a case based on case A's numbers from `src/data/case-a-*.ts`, with the bank offers invented here; all banks fictional). Everyone else imports it. Anything shared that you need changed, say so in your report; the coordinator changes it. Every lesson gets its own video (`video/8-X.html`, `pnpm video 8-X`; look at its key frames and fix until clean).

## Sources in this session

- **Read offline:** `research/notes/*.md` (`brain-calculation.md`, `brain-product-journey.md`, the J-codes there), `research/field-knowledge.md`, `research/source-map.md`, `research/eylon-list.md`.
- **Read-only, never change:** `/home/user/edea-mortgage/context/inputs/*`, `packages/schemas/registry/v1.yaml`.
- **The Brain is not reachable**; cite a page through the note that recorded it; learner text never shows Brain page numbers, J-codes, DEC-n, FK ids, file paths or repo names (they go in code comments and the Eylon file; `<Sources>` may cite Brain pages). Official sites are blocked.
- 8.1–8.5 and most of 8.11, 8.15, 8.18, 8.19, 8.23, 8.24 are **general maths / ML knowledge** (source: "כללי"): say so, and do not cite a made-up reference. Statements about how banks price, approve or behave are **unknown or field hypotheses**: "לא ידוע", "השערה", "שאלה פתוחה לאילון". Never state a bank behaviour as fact.

## Open or contradictory points you must keep open

- **How banks price** (margins, thresholds such as 40% payment ratio or 60% financing): hypotheses from the field (e.g. FK-H items on the payment-ratio threshold) — "ממתין לאישור אילון". A step-around-threshold model is a *shape* the course teaches, with synthetic numbers.
- **Approval probability:** nobody has real approvals data. The model is a teaching device; a calibrated probability needs data Mogi does not have yet. Say it.
- **Monte Carlo:** a simulation turns assumptions about a distribution into numbers; it does not make the assumptions true. 8.12 teaches when a probability may be attached (a repeatable process with data) and when not (a one-off future rate path). Use the course's own phrase style: "זו הנחה, לא עובדה".
- **"Optimal":** always relative to data, constraints, goals and the space searched. Never promise a global optimum without justification (8.16).
- **The 15 calculation rules of Eylon** (decided): only name what the notes record; if the notes do not list the rules, say the course has not seen them and list the question for Eylon.
- **Consent / privacy (8.26):** the consent step is not built; the lawyer batch is open. Teach the principle (what may be learned from, under which consent) and mark what is undecided. No legal conclusion.
- **LLM rule:** the LLM explains and classifies; it never computes and never writes state. Say so in 8.21, 8.25, 8.26.
- **The mode names** (off / shadow / assisted / automatic) are decided; what each does in practice is plan.

## The rules that matter most here

- **Label every claim:** fact (source, date) · החלטה של Mogi · ידע מהשטח (FK id, "ממתין לאישור אילון") · מחקר · הנחת חישוב · לא אומת · and the stage-8 triple היום / הוחלט / עתיד.
- **Order of terms:** `check:terms` enforces term-before-use; terms used before their lesson go in `<Later>`; new terms in `src/data/definitions/8-X.json`. The stage-8 term list is `course/course-map.md` section 3 (line "שלב 8").
- **Numbers:** computed in code from facts, rechecked in Python (`checks/kinds/*.py`, independent: no import from `src/`); no arithmetic in MDX; money by the statement rule via the existing modules; randomness only through the seeded generator. The independent check must reproduce the TS result exactly.
- **Math from zero:** 8א assumes only stage 0. Each idea appears first on a mortgage example, then in symbols; the learner computes by hand before a tool does.
- **Examples:** fictional banks "בנק א׳/ב׳/ג׳/ד׳"; every example carries "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים"; stage-8 synthetic data also says "נתונים סינתטיים".
- **Letters:** `course/AUTHORING.md` reserves letters; a new meaning for an already used letter is said out loud in the lesson (see the stage-7 reviews).
- **No "we" / "we learned":** address the learner in the plural ("הכרתם", "ראיתם").
- **Hebrew inside `<M>`** is mirrored: keep Hebrew words outside formulas. Numbers/percent/₪ in videos use the LTR isolate helper `lr()` (number only, sign outside).
- **Glossary popovers:** every `<Term …>` carries `client:visible` (the coordinator added it across the site); keep it.
- **Required components** are named in the table of the course map ("נדרשת"): build them as real interactive illustrations, with a table view for phones.

## Questions for Eylon

Every question or doubt goes to the list. Write yours to `research/stage-8-raw/eylon-8-<letter>.md` (a row per question: the question, why it matters for which lesson, what the course says meanwhile, FK ids, the source to open). Do not edit `research/eylon-list.md`; the coordinator merges.

## Done means

`pnpm data`, `pnpm check:python`, `pnpm check:terms` and `pnpm test` pass, and your pages build. Build into your own folder, `pnpm astro build --outDir <scratchpad>/<your-letter>/dist` (a build can fail on others' unfinished pages or missing `.he.vtt` files: then build from a scratch copy of the tree), and use a folder of your own for every scratch file. Look at every page at 390px and 1280px, no horizontal page scroll. Look at the key frames of every video you render. No git; the coordinator commits.

Your report gives: the files you wrote; the terms introduced; every claim that is not general maths, with its label and source; the FK ids used; the questions for Eylon (also in your file); anything you need changed in a shared file; your doubts.
