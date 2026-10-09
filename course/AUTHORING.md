# Writing a lesson — the house rules

Lesson 0.3 (`src/pages/lessons/0-3.mdx`) is the approved pilot (Dvir, 2026-10-09: look, tone and video style). **Read it in full before writing a lesson, and copy its structure.** This file says what it does and why, including every mistake the beginner-reader review caught in it.

The brief (`course/brief/part-1.md` … `part-8.md`) is the authority on content (parts 1–8, especially §2 "how we teach", §6 practice, §7 videos, §9 reliability, §10 calculation). The approved map is `course/course-map.md`. The source material is `research/` (start with `source-map.md`; field knowledge in `field-knowledge.md`).

## The files one lesson owns

For lesson `X.Y`, all yours, nobody else edits them:

| File | What |
|---|---|
| `scripts/lessons/lesson-X-Y.ts` | Default export returning `LessonData`: every number the page, the exercises and the video show, as a fact `{id, kind, inputs, value}` |
| `src/lib/calc/<topic>.ts` + `<topic>.test.ts` | New arithmetic, in `decimal.js`, rates as percent strings, money rounded only at the end via `money.ts`. Tests with hand-checked values |
| `checks/kinds/<topic>.py` | A `KINDS` table recomputing each new fact kind in plain Python `Decimal`, importing nothing from `src/` |
| `src/data/definitions/X-Y.json` | Plain-Hebrew definitions of the terms this lesson introduces (and `forms` for inflections). A term the map does not list gets `"lesson": "X.Y"` and is reported |
| `src/pages/lessons/X-Y.mdx` | The lesson |
| `video/X-Y.html` | The video scene (copy `video/0-3.html`'s structure) |

Shared files — **do not edit**: `course/*`, `src/components/*`, `src/layouts/*`, `src/lib/calc/money.ts`, `src/lib/facts.ts`, `scripts/build-*.{ts,mjs}`, `scripts/check-terms.mjs`, `checks/independent_check.py`, `checks/kinds/common.py`, `package.json`. If you need a change there, say so in your report with the exact change.

Do not run `pnpm build`, `pnpm screens` or git. The coordinator does.

## Done means

- `pnpm data`, `pnpm check:python`, `pnpm check:terms` and `pnpm test` all pass.
- `pnpm video X-Y` renders; you looked at the key frames in `qa/video/X-Y-t*.png` (direction, nothing clipped, numbers right).
- Your report lists: the terms the lesson introduces; any shared-file change you need; every claim that is not general math, with its source, kind and whether it was checked against a primary source.

## The lesson, in order

Each part opens with `<Section kind="…">` and an `##` heading, exactly as in 0.3:

1. **Opening** (no heading): two or three sentences linking to the previous lesson, using its terms with `<Term>` reminders.
2. **`לפני שמתחילים: נחשו` → `<Prediction>`** — a question the learner can answer only after the lesson. One option is the classic misconception. Options that involve a number are built from facts.
3. **`סרטון` → `<LessonVideo lesson="X-Y" />`** — the script under the player is read from the subtitles.
4. **`ההסבר`** — the idea from small numbers you can do in your head, step by step, *then* the generalisation, *then* the formula. Show every step that produces a number; a number that appears from nowhere is a jump.
5. **`המחשה: הזיזו בעצמכם`** — the interactive piece (an existing component, or a request for a new one — see below), then 2–3 guided tasks, with the expected observations inside a closed `<details>` ("מה הייתם אמורים לראות"), never printed under the task.
6. **`מהדוגמה לנוסחה`** (when there is a formula) — build it in numbered steps; a formula box with every symbol defined in a `<dl>`: meaning, unit, how to write it (for example "כמספר עשרוני: 5% הם 0.05"); "מתי הנוסחה נכונה?" with its conditions; a callout on **how to compute it** (calculator / spreadsheet / by hand). Any rounding rule shows up as a callout the moment two numbers could differ by an agora.
7. **`<PredictionReveal>`** with `notes` for every wrong option.
8. **A tool for the head** (optional): a rule of thumb, labelled an approximation.
9. **`דוגמה פתורה`** — a realistic situation, steps numbered `**צעד 1 — …**`, each with its number from facts.
10. **`דוגמה חצי פתורה`** — `<FillTable>` or a similar fill-in, first row given.
11. **`תרגול`** — at least five exercises, honestly ordered easy → hard (a conceptual multiple-choice item is usually קל). Each `NumericExercise` lists the common wrong answers as `errors` with a message that says what the mistake was. Its worked solution is a sibling `<Solution for="id">`. If exercises need a calculator, say so above them.
12. **Callout "חמש שאלות על …"** — מה זה / למה זה קיים / איך זה עובד / איך זה משפיע עליכם / איך משתמשים בזה בהחלטה (brief §2).
13. **`סיכום`** — bullets, then **`בשיעור הבא — X.Y+1, title:`** one sentence.
14. **`מקורות`** — `<Sources>`; then an MDX comment naming the code paths (never shown to learners).

## Language (brief §2, and what the review taught)

- Plain Hebrew, short sentences, **plural address** (הפקדתם, נסו, שימו לב). Glossary definitions too.
- **Example before formula.** Small round numbers first.
- **No slogans, no promises** ("הזמן הוא המנוע" was cut). Say under which conditions a statement is true.
- "ריבית" is both the rate and the shekels. Where both appear, say which: **אחוז הריבית** (5% לשנה) or **סכום הריבית** (50 ₪).
- Teaching rates and yields that could pass for market data get "מספרים להמחשה, לא נתוני שוק" above the exercise set, not only in the sources.
- אג״ח is feminine (אג״ח ממשלתית, שלה).
- **"בשקלים של היום"** means a value today found by discounting at an interest rate (0.5–0.6). A sum adjusted for inflation is **"בכוח קנייה של היום"** (0.8). Never mix the two.
- **The "בשיעור הבא" line uses the next lesson's exact title** from the map. A stage's last lesson leads to the stage check (`/checks/<stage>/`); the layout's button does this.
- **Tables:** a fill-in table must fit 340px (FillTable does). A wide reading table may scroll; the layout adds a "גררו שמאלה" hint on its own. Still, keep the column the text talks about early (on the right).
- **Live official data** (a rate, a date) is written with its date in the text: "נכון ל־9 באוקטובר 2026, … (לא אומת)". Never "היום", never "תמיד".
- Exercise wording always has the actor and the verb: "הפקדתם 30,000 ₪ ל־10 שנים…", not "30,000 ₪ ל־10 שנים".
- Keep the brief's distinctions exact. 5% → 6% is **one percentage point** (נקודת אחוז), not "one percent". Name two near-identical terms apart when both appear (ריבית דריבית is the method; ריבית על ריבית is the extra amount).
- Don't use symbols or notation before explaining them (superscripts, ≈ — write "בערך").
- Ambiguous words: "נמשכת" (withdrawn / continues) — rephrase.
- Avoid saying "the bank" when the lender has not been said to be a bank.

## Terms

- First use of a term **this lesson introduces**: `<Term t="term" lesson="X.Y">surface form</Term>`; it must have a definition in your definitions file.
- First use of an **earlier lesson's term**: also `<Term>` (the popover reminds).
- A **later lesson's term** may appear only as `<Later lesson="N.M">word</Later>`, and only when it helps; otherwise rephrase. When the sentence already names the lesson (the "בשיעור הבא" line), use `<Later lesson="N.M" quiet>` so the note does not repeat it. `pnpm check:terms` enforces this over the lesson and its subtitles, with Hebrew prefixes.
- The glossary is generated from the course map; your new terms should already be in the map's section 3 for your lesson. If the lesson really needs another, add it in your definitions file with `"lesson"` and report it.

## Numbers (brief §10)

- **Every number** on the page, in an exercise answer or error, in a solution and in the video comes from a fact. Typed numbers are allowed only for the teaching inputs (10,000 ₪, 5%) — and those must be the inputs of the facts that use them.
- **No arithmetic in MDX or in the scene** — not even a subtraction. Add a `difference` fact instead (`kind: "difference"`, inputs `{minuend, subtrahend}` fact ids; both must be facts, use a `given` fact for a principal).
- Formatting: in running text `T(...)` / `f.shekels(id)` (no ".00" on whole amounts); in tables `formatShekels` (always agorot); `f.whole` for rounded display; `f.plain` for counts and factors.
- Teaching tables follow the statement convention: each period's interest rounded to the agora, then added. Formulas round once at the end. Exercises accept both: answers within `tolerance` (default 0.05 ₪) are exact, within `near` (default 1 ₪) are "נכון בקירוב" with the exact value shown. For whole-number answers set `tolerance={0} near={0}`.
- Rates: contract rates are nominal annual; monthly = annual ÷ 12 (verified against Leumi and Discount tables, Brain ENG-223). Effective conversion uses the twelfth root. Never mix them silently.

## Letters in formulas — one table for the whole course

A learner carries the letters from lesson to lesson, so a letter keeps its meaning everywhere. When a lesson reuses an earlier formula, it says so in one line ("זו הנוסחה מ־0.5, כש…").

| Letter | Meaning, everywhere | First |
|---|---|---|
| P | the amount **today**: a loan's principal, a deposit, a value today, a bond's price | 0.2 |
| B | the amount **later**: the balance after n periods, a future amount | 0.3 |
| r | an interest rate **per period, as a decimal** (5% → 0.05); say which period | 0.2 |
| n | the number of periods | 0.2 |
| I | interest in shekels | 0.2 |
| C | one payment; a bond's yearly payment | 0.6 |
| k | which payment (the k-th), when a formula sums several | 0.6 |
| m | the monthly rate by dividing the annual rate by 12 | 0.4 |
| e | the effective annual rate | 0.4 |
| q | the monthly rate by the twelfth root of (1 + e) | 0.4 |
| π | inflation, as a decimal | 0.8 |
| i | the rate before inflation (nominal), beside r for the rate after it (real) | 0.8 |
| F | a bond's principal, repaid at the end | 0.11 |
| y | a bond's yield; on a curve y₁, y₂ by length | 0.11 |
| s | a spread: written like r (as a decimal) and spoken in percentage points | 0.9 |
| M | an index value (מדד), M₀ at the start; write "M (מדד)" at first use, since m is the monthly rate | 0.7 |
| K | a basket's cost | 0.7 |
| V | a property's value (in 1.1 also the price a pledged home sells for) | 1.1 |
| H | equity (הון עצמי) | 1.2 |

0.1 works with the percent as a whole number and writes it in words; the letters start in 0.2. A quantity not in the table gets a letter not in the table (a basket's cost: K), or plain words. Never a table letter for something else, not even as a subscript (r_F would reuse F): subscripts are words or numbers defined in the box.

## Equations and direction

- Inline equations: `<M>10,000 × 1.05<sup>10</sup> = {f.shekels("…")}</M>` — an LTR isolate that does not wrap. Keep each `<M>` short (fits 340px). A long derivation goes on separate lines, one equality per line (see 0.3 "צעד 1").
- Equations inside JS strings (exercise messages): `${eq("100 ÷ 6")}`.
- Numbers in table cells: `<span class="ltr">…</span>` inside the cell, never `ltr` on the cell.

## Components available (`src/components/`)

`Term`, `Later`, `Callout` (tone info / warning), `Section`, `Prediction`, `PredictionReveal` (`notes`), `CompoundGrowth` (0.3 only), `FillTable` (any columns: `columns`, `rows`, `blanks`, `success`, `hint`; see 0.11 for a total row), `NumericExercise` (`errors`, `tolerance`, `near`, `unit`), `ChoiceExercise`, `Solution`, `M`, `LessonVideo`, `Sources` (`kind`, `text`, `code`, `date`, `href`).

A lesson that needs a **new interactive illustration**: write it as `src/components/<Name>.vue` (yours to own, name it after the lesson's idea), following `CompoundGrowth.vue`: tokens only (Tailwind theme names or `var(--mogi-…)`), logical properties, Hebrew labels, sliders with no native fill (the global CSS styles them), every number through the calc module, a legend, a "הצגה כטבלה" table view, labels in HTML rather than SVG `<text>` where they must stay readable on phone. A list the component lays out itself (a legend, cards) takes `list-reset`, or the lesson styles give it bullets and an indent. Chart colours: teal-deep `#0A9396` and turquoise-2 `#00CECB` as the two series (validated pair), N300 grey for a neutral base, navy dashed line for a reference level; never status colours for series. Small text never in teal (contrast 3.7:1) — N600 or darker.

## Video (brief §7)

- Copy `video/0-3.html`: one idea, 2–3 minutes, `window.render(t)` a pure function of time, every number read from `/data/lessons/X-Y.json`.
- `window.cues`: the sentences (they are the narration script). **One line each — at most 60 characters** (the renderer refuses longer). The picture carries the key numbers; the subtitles carry the explanation.
- Keep the bottom 150px of the 1280×720 frame clear for subtitles.
- Don't show anything the lesson has not explained yet (no formula before the formula section).
- RTL SVG text: `anchor: "start"` puts the text's right edge at x; LTR runs (numbers, equations) use `ltr: true`.
- Render: `pnpm video X-Y` (about 3 minutes). Look at `qa/video/X-Y-t*.png`.

## Sources and reliability (brief §9)

`<Sources>` kinds: `עובדה מאומתת` · `החלטה של Mogi` · `ידע מהשטח` · `מחקר / הצעה` · `הנחת חישוב` · `לא אומת` · `ידע מתמטי כללי` · `ידע כלכלי כללי` (how money and banks work in general, no figures) · `בדיקת חישוב`.

- **The official sites are blocked in this environment** (Bank of Israel, CBS, gov.il, Knesset). Nothing official may be marked `עובדה מאומתת` until someone opens the primary document. Facts that come from the team's transcription in the Brain: kind `לא אומת`, text "לפי תעתיק בצוות ב־Brain (דף N, תאריך), ממתין לבדיקה מול המקור". From search summaries only: `לא אומת`, "לפי תקציר של מקור רשמי; ממתין לבדיקה". Always date the data (for example "ריבית בנק ישראל 3.25%, מ־2026-09-03").
- Field knowledge (`research/field-knowledge.md`): kind `ידע מהשטח`, text names who said it and when, plus "ממתין לאישור אילון". Never the do-not-teach items.
- No real client data, ever. No real bank's branding in examples; examples use "בנק א׳".
- The LLM never computes: you may write sentences, never numbers that a calculation produces.

## Accessibility and look

Tokens only; RTL; one turquoise primary action at most per component; status colours (success/warning/danger/info) only for their meaning, on their `-bg` backgrounds; nothing below 12px; touch targets ≥ 44px. The look is approved — reuse the pilot's classes rather than inventing new styles.
