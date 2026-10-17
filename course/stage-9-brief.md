# Stage 9: the brief for its authors (2026-10-17)

Stage 9, "תיק מלא מקצה לקצה", is five units and a check. It is the last stage: the learner handles one whole file (case A, נועם ושירה) from the first document to the recommendation, and explains each decision twice, once to the client and once to a professional reviewer. Everything the course taught is used here and nothing new is taught: **9.1–9.4 introduce no new terms** (if a lesson truly needs one, report it). The house rules are in `course/AUTHORING.md` (every regular lesson has a video); the plan is `course/course-map.md`, stage 9 (table, section 8 "תיק א׳"); the source brief is `course/brief/part-4.md` ("שלב 9") and `course/brief/part-5.md`. Read those first, then the stage-6 lessons 6.9–6.11 (the case-A planner, the underwriter's day), stage 5 lessons 5.8 and 5.10, stage 7's workshop 7.8 and stage 8's 8.21 and 8.28 as templates, and `course/stage-8-brief.md` for the working pattern.

## What this stage is

The learner is the advisor. The file arrives; they check it, position it, compare offers, choose, and justify the choice. Every earlier tool is used where it belongs: affordability and the 18-month rule (stage 4), the pre-approval and the comparison of offers (stage 5), the lever plan, outreach and negotiation (stage 6), the cost of leaving or refinancing if relevant (stage 7), and the algorithm's pipeline as a way of seeing the same file systematically (stage 8). Where the course's tools disagree with what a bank would actually do, the lesson says "זו הערכה, לא הבטחה" and does not decide for the bank.

**Labels.** Case A and every offer are synthetic and say so on every worked table: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים". Rules (329, 451) are "תעתיק של הצוות, לא אומת" as in earlier stages. Field knowledge keeps "ידע מהשטח, ממתין לאישור אילון". Nothing here is advice to a real client. Use the stage-8 triple היום/הוחלט/עתיד only where a lesson mentions the algorithm (and say that no mix calculation exists in Mogi's code today).

## The units

| Unit | Author | Content |
|---|---|---|
| 9.1 | A | **התיק המסכם, א׳: נתונים, מסמכים, אימות ויכולת החזר.** The file as it arrives: the client's details, the documents (example documents: payslips, bank statements, a credit report summary, a property record, a gift letter, the car-loan statement; all fictional and clearly marked), what each document verifies, what is declared vs verified (4.7), what is missing, and the affordability check: recognised income, obligations over 18 months, the living budget, the payment-ratio and financing-ratio starting points. Output: a "דף היתכנות" for case A and a list of gaps with what to ask for. Interactive: a document-checker (the learner marks, for each document, what it proves and what is still open) |
| 9.2 | A | **התיק המסכם, ב׳: תוכנית מיצוב, הצעות, שלוש חלופות ותרחישים.** The lever plan for case A (from 6.11), the four banks' offers (from stage 6's `case-a-offers.ts`), three mix alternatives for the three goals with their measures, the 451 comparison, and three scenarios (base, stress, macro) for each alternative, using the stage-5/8 tools; the "which number is this" discipline (estimate vs offer vs executed deal). Output: a comparison table and the three alternatives with their prices |
| 9.3 | B | **התיק המסכם, ג׳: המלצה, משא ומתן ובדיקות לקראת העמדה.** Choose one alternative and one bank, with the reasons; the negotiation plan (rounds, what to ask, what not to give up); what happens between the pre-approval and the drawdown (appraisal, lawyer, conditions, expiry, rate changes while waiting); the checklist before the loan is released. Output: a full recommendation report (the learner fills a structured template in the page) and the pre-release checklist |
| 9.4 | B | **הסבר כפול: מה נבחר, מה נפסל, מה המחיר, ומתי לבחון מחדש.** The same decision explained twice: to the client in plain language (what we chose, why, what it costs, what could go wrong, when to review), and to a professional reviewer (the evidence, the rejected candidates with their rejection reasons, the assumptions and their labels, the sensitivity of the decision, the open questions). The red lines (6.5): no hidden obligation, no inflated income, no wrong document; what is a conflict of interest here (the advisor's fee vs the client's interest) — taught as a question, with the legal/professional-ethics parts marked "לא אומת, שאלה לעורך הדין". Interactive: a two-column explainer where the learner drafts each side and gets a checklist (not a grade) |
| 9.5 | C (second round) | **המבחן המסכם.** An exam with solutions and a rubric ("מחוון"), case-based on case A plus short questions from every stage. Closed questions are graded by code; open questions are graded against the rubric by self-assessment (the page shows the model answer and the rubric lines after the learner writes). The LLM does not grade. A pass mark is a placeholder (80%, pending Dvir): say it is a proposal |

## Calculation modules

Author A owns `src/lib/calc/casefile.ts` (+ test, `checks/kinds/casefile.py`): it composes existing modules (never re-implement them): the feasibility sheet (income, obligations, ratios, financing), the offers comparison and the three alternatives with measures, the scenario set for each alternative, and the final recommendation numbers. **Write its API first** (file header) because B and C import it. Case data: `src/data/case-a-final.ts` (A): the file, the documents, the verification states; reuse `case-a-mix.ts`, `case-a-levers.ts`, `case-a-offers.ts`, `case-a-positioning.ts`, `case-s8.ts`. Every number is computed in code, rechecked by an independent Python kind (`checks/kinds/*.py`, no imports from `src/`), none typed in MDX.

## Videos and components

Every unit gets its own video (`video/9-X.html`, `pnpm video 9-X`; one render at a time, never kill render processes; look at the key frames and fix until clean). Components are real interactive illustrations with a table view on phones. Glossary `<Term …>` tags carry `client:visible`. No "we" forms: address the learner in the plural. Hebrew words go outside `<M>` formulas. Numbers/percent/₪ in videos use the LTR isolate helper (number only, sign outside). Exercises: correct option not always first or longest; every numeric exercise has a `unit=`.

## Open or contradictory points you must keep open

- **What the bank would do** (approval, margins, thresholds): unknown; "השערה", "ממתין לאישור אילון". Nothing about banks' internal rules is stated as fact.
- **Documents:** which documents a real bank requires is field knowledge or a bank's own form (cite only what the notes record); the example documents are teaching props.
- **The advisor's fee and conflicts of interest:** a question for the lawyer and for Mogi's policy, not decided here.
- **The recommendation is the learner's:** the lesson shows one reasonable recommendation and its reasoning, and says a different reasonable choice exists if the client's priorities differ.
- **Consent / data:** the real file would hold personal data; the course file is fictional. Say so once.

## Sources and rules

As in stage 8's brief: read offline `research/notes/*.md`, `research/field-knowledge.md`, `research/source-map.md`, `research/eylon-list.md`; read-only `/home/user/edea-mortgage/context/inputs/*`; the Brain is not reachable; learner text never shows Brain page numbers, J-codes, DEC-n, FK ids, file paths, "repo" or names of internal documents (Sources may cite Brain pages); official sites are blocked. Label every claim (fact · החלטה של Mogi · ידע מהשטח · מחקר · הנחת חישוב · לא אומת). Term-before-use (`check:terms`). Fictional banks only.

## Questions for Eylon

Every question goes to `research/stage-9-raw/eylon-9-<letter>.md` (a row per question: the question, why it matters, what the course says meanwhile, FK ids, the source to open). Do not edit `research/eylon-list.md`.

## Done means

`pnpm data`, `pnpm check:python`, `pnpm check:terms` and `pnpm test` pass and your pages build (`pnpm exec astro build --outDir <scratchpad>/<letter>/dist`; the real build needs every unit's `.he.vtt`, so use a scratch copy of the tree if others' pages are unfinished). Look at every page at 390px and 1280px with no horizontal page scroll; look at every video's key frames. No git. Report: files, terms (should be none), every non-math claim with its label and source, FK ids used, questions for Eylon, shared changes needed, doubts.
