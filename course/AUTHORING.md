# Writing a lesson — the house rules

Lesson 0.3 (`src/pages/lessons/0-3.mdx`) is the approved pilot (approved 2026-10-09: look, tone and video style). **Read it in full before writing a lesson, and copy its structure.** This file says what it does and why, including every mistake the beginner-reader review caught in it.

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

Shared files — **do not edit**: `course/*`, `src/components/*` (except a component named for your stage), `src/layouts/*`, `src/lib/calc/money.ts`, `src/lib/facts.ts`, `scripts/build-*.{ts,mjs}`, `scripts/check-*.mjs`, `checks/independent_check.py`, `checks/kinds/common.py`, `package.json`. If you need a change there, say so in your report with the exact change.

Do not run `pnpm build`, `pnpm screens` or git. The coordinator does.

## Done means

- `pnpm data`, `pnpm check:python`, `pnpm check:terms`, `pnpm check:units` and `pnpm test` all pass. After a build, `pnpm check:refs` finds no learner-visible internal reference in your pages. `pnpm check:all` runs the whole chain (data, check:python, check:terms, check:units, test, build, check:refs).
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

## Nothing internal is visible to a learner

A learner sees a course, not how it was built. These never appear in text a learner can read (lessons, exercises, solutions, checks, glossary, components, video scenes and subtitles, data files that carry learner text): Brain page numbers or the word "Brain" (also "ב־Brain"), FK- ids, J-codes, DEC-n, BIR_MRTG series ids, ENG-n tickets, the words "ריפו" / "repo" / "commit", file paths and file names (`research/…`, `src/…`, `context/…`, `course/…`, anything ending `.md` `.ts` `.pdf` `.json`), build tools (LibreOffice, TypeScript, Python as the way the course was made), internal-document names ("הבריף", "מפת הקורס מבטיחה", "טבלת האותיות של הקורס") and process talk ("ברשימה למומחה", "שאלה למומחה", "האתר חסום בסביבה שבה נכתב השיעור"). Where learner text used to say "ENG-223", say "כלל החישוב של הצוות". Code comments and the `research/` files may keep the ids; the page may not. **Enforcement:** `pnpm check:refs` scans the text of the built HTML (not scripts, styles, comments or attribute values) of every lesson, check, the glossary and the home page, and fails with the file, the surrounding words and a count per stage.

**How provenance is written.** In `<Sources>`: the kind (from the list below), the date, and plain words about where it came from, with no ids. Examples: "החלטה של Mogi, 2026-08-31"; "ידע מהשטח, ממתין לאישור מומחה"; "לפי תעתיק של הצוות מההוראה, לא אומת"; "תיעוד הצוות, 2026-10-08"; "ממקור משני (אתר הבנק), 2026-10-09". The helpers that build Sources lines (`brainRule`, `fk` and similar) print no ids.

## Decisions of 2026-10-17 (the course follows them)

- The rate written in the contract is **"ריבית חוזית"** (say "ריבית חוזית (הריבית השנתית שכתובה בחוזה)" at first use). "נומינלית" appears only for "before inflation" (0.8) and in the explanation of the two meanings. A lesson before 5.5 that needs it says "ריבית חוזית" with a `<Later lesson="5.5">` where check:terms requires.
- The banker from outside the team is only **"בנקאי בשטח"**: no name, never "בנקאי חיצוני" or "בנקאי שאינו בצוות". Invented couples keep their names.
- No lock, no pass mark, no "next stage opens": every page is open; a check shows a score only.
- **"החלטה של Mogi, 2026-08-31"** is only the rule for a contradiction between a document and what the client says. The course's own red line (never hide an obligation, inflate an income, or submit a wrong document) is labelled **"הקו האדום של הקורס (שיעור 6.5)"**. The LLM rule (2026-07-29), the income-state split (the field expert, 2026-10-07) and the consent rule each get their own `<Sources>` entry with their own date and kind (the consent rule: "ללא תאריך ברשומה" where the date is unknown).

## Language (brief §2, and what the review taught)

- Plain Hebrew, short sentences, **plural address** (הפקדתם, נסו, שימו לב). Glossary definitions too.
- **Example before formula.** Small round numbers first.
- **No slogans, no promises** ("הזמן הוא המנוע" was cut). Say under which conditions a statement is true.
- "ריבית" is both the rate and the shekels. Where both appear, say which: **אחוז הריבית** (5% לשנה) or **סכום הריבית** (50 ₪).
- Teaching rates and yields that could pass for market data get "מספרים להמחשה, לא נתוני שוק" above the exercise set, not only in the sources.
- אג״ח is feminine (אג״ח ממשלתית, שלה), and so is הפריים (היא זזה).
- "נקודת אחוז" is singular up to one (0.25 נקודת אחוז, נקודת אחוז אחת) and plural above it (1.5 נקודות אחוז).
- **"בשקלים של היום"** means a value today found by discounting at an interest rate (0.5–0.6). A sum adjusted for inflation is **"בכוח קנייה של היום"** (0.8). Never mix the two.
- **The "בשיעור הבא" line uses the next lesson's exact title** from the map. A stage's last lesson leads to the stage check (`/checks/<stage>/`); the layout's button does this.
- **Tables:** a fill-in table must fit 340px (FillTable does). A wide reading table may scroll; the layout adds a "יש עוד עמודות משמאל" hint on its own. Still, keep the column the text talks about early (on the right).
- **Every regular lesson has a video** (decided 2026-10-10), even where the map's video column says "—": the column names only the standout ideas. Write `video/X-Y.html`, render with `pnpm video X-Y`, review key frames, and add the lesson's video section.
- **The three cases follow the map's timeline.** Case A (נועם ושירה) gets its mix in stage 5 and its bank offers in stage 6; before that it appears only with the numbers already given (price, equity, loan, incomes). A lesson that needs a track, an offer or a mix before then uses other invented people, or says plainly "תרגיל נפרד, לא התיק של נועם ושירה". In stage 4 its feasibility page checks it against the limits only (the largest payment allowed, the 18-month rule, the financing ratio); a payment shown there rests on a stated calculation assumption, never a track or a mix (coordinator, 2026-10-10, following this rule).
- **Mogi decisions** are marked `החלטה של Mogi`, with who and when (no ids); they do not wait for the field expert. Field knowledge does.
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
- Teaching tables follow the statement convention: each period's interest rounded to the agora, then added. On a linked track the opening balance is indexed and rounded to the agora each month, and the payment is the set payment × M_k ÷ M_0, rounded to the agora — set in month 1 and again only at a rate change, never recalculated from the indexed balance (`schedule.ts`, `rounding: "statement"`). Every equality printed on a page must hold on the printed numbers. Formulas round once at the end. Exercises accept both: answers within `tolerance` (default 0.05 ₪) are exact, within `near` (default 1 ₪) are "נכון בקירוב" with the exact value shown. For whole-number answers set `tolerance={0} near={0}`.
- Rates: contract rates ("ריבית חוזית") are annual; monthly = annual ÷ 12 (checked against the Leumi and Discount tables the team holds; say "כלל החישוב של הצוות", never a ticket). Effective conversion uses the twelfth root. Never mix them silently.

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
| A | an anchor rate (עוגן), as a decimal; a track's rate r = A + s | 2.1 |
| S | a sum of discount factors (in a worked derivation) | 2.2 |
| g | grace months (חודשי גרייס) | 3.4 |
| Y | a household's net income per month (הכנסה נטו), in the living-budget formulas | 4.6 |
| O | the household's other monthly payments, all of them, whatever the 18-month rule counts | 4.6 |
| T | the living budget (תקציב מחיה), shekels per month | 4.6 |
| L | what is left for living each month: Y − C − O | 4.6 |

0.1 works with the percent as a whole number and writes it in words; the letters start in 0.2. For monthly payments the formula box writes r (the rate per period) and says once that it is 0.4's m. A quantity not in the table gets a letter not in the table (a basket's cost: K), or plain words. The market writes prime as P ("P−0.8"); the course quotes that shorthand in words and never uses P for prime in a formula. Never a table letter for something else, not even as a subscript (r_F would reuse F): subscripts are words or numbers defined in the box.

## Equations and direction

- Inline equations: `<M>10,000 × 1.05<sup>10</sup> = {f.shekels("…")}</M>` — an LTR isolate that does not wrap. Keep each `<M>` short (fits 340px); a formula longer than about 26 characters is put by `M` in its own box that scrolls sideways inside itself (keyboard-focusable), never the page. No Hebrew words inside `<M>`. A long derivation goes on separate lines, one equality per line (see 0.3 "צעד 1").
- Never name an MDX export `partial`, `prerender` or `getStaticPaths`: Astro reads them as page options (`partial` strips the page's CSS). `pnpm check:terms` fails on them.
- Equations inside JS strings (exercise messages): `${eq("100 ÷ 6")}`.
- Numbers in table cells: `<span class="ltr">…</span>` inside the cell, never `ltr` on the cell.

## Components available (`src/components/`)

`Term`, `Later`, `Callout` (tone info / warning), `Section`, `Prediction`, `PredictionReveal` (`notes`), `CompoundGrowth` (0.3 only), `FillTable` (any columns: `columns`, `rows`, `blanks`, `success`, `hint`; see 0.11 for a total row), `NumericExercise` (`errors`, `tolerance`, `near`, **`unit` always given**: `₪`, `%`, `חודשים`…, never absent and never `""`; `pnpm check:units` fails otherwise), `ChoiceExercise`, `Solution`, `M`, `LessonVideo`, `Sources` (`kind`, `text`, `code`, `date`, `href`).

Built in stage 1, for reuse: `CardSort` (sort cards into piles), `DealTree` (a decision tree), `MixSlices` (a loan in tracks), `MatchTable` (pick-from-list fill-in), `ProcessTimeline` (the 12 steps and their clocks), `BankCommitment` (what binds the bank when), `DiyChecklist` (a saved, printable checklist), and **`BigPictureMap`** — the course's big-picture map. Its data lives in `src/components/big-picture/` (one `stage-N.ts` per stage; `mapUpTo(lesson)` shows what the learner has met). A later stage extends the map by adding its `stage-N.ts`, importing it in `index.ts` and adding it to `STAGES` there.

A lesson that needs a **new interactive illustration**: write it as `src/components/<Name>.vue` (yours to own, name it after the lesson's idea), following `CompoundGrowth.vue`: tokens only (Tailwind theme names or `var(--mogi-…)`), logical properties, Hebrew labels, sliders with no native fill (the global CSS styles them), every number through the calc module, a legend, a "הצגה כטבלה" table view, labels in HTML rather than SVG `<text>` where they must stay readable on phone. Lesson prose styles (paragraph margins, list bullets) do not reach inside an interactive component, except its slot; style a component's own text with utility classes. Sliders are 44px tall for touch; every button, `<summary>` row, radio/checkbox label and inline `Term` is at least 44px at 390px (a `min-h-11`, padding, or an `::after` hit area; the global CSS already covers `summary` and labels around radios/checkboxes). Chart colours: teal-deep `#0A9396` and turquoise-2 `#00CECB` as the two series (validated pair), N300 grey for a neutral base, navy dashed line for a reference level; never status colours for series. Small text never in teal (contrast 3.7:1) — N600 or darker.

## Video (brief §7)

- Copy `video/0-3.html`: one idea, 2–3 minutes, `window.render(t)` a pure function of time, every number read from `/data/lessons/X-Y.json`.
- `window.cues`: the sentences (they are the narration script). **One line each — at most 60 characters** (the renderer refuses longer). The picture carries the key numbers; the subtitles carry the explanation.
- Keep the bottom 150px of the 1280×720 frame clear for subtitles.
- Don't show anything the lesson has not explained yet (no formula before the formula section).
- RTL SVG text: `anchor: "start"` puts the text's right edge at x; LTR runs (numbers, equations) use `ltr: true`.
- Render: `pnpm video X-Y` (about 3 minutes). Look at `qa/video/X-Y-t*.png`.

## Sources and reliability (brief §9)

`<Sources>` kinds: `עובדה מאומתת` · `החלטה של Mogi` · `ידע מהשטח` · `מחקר / הצעה` · `הנחת חישוב` · `לא אומת` · `ידע מתמטי כללי` · `ידע כלכלי כללי` (how money and banks work in general, no figures) · `בדיקת חישוב` · `ממקור משני` (the claim rests on reputable secondary sources: a bank page, a law-firm or consumer guide, an article; say the kind in the text: אתר הבנק / מאמר / מדריך. It was not checked against the official text, so never call it official or "נבדק מול ההוראה"; shown with a distinct blue-tinted label) · `שאלה פתוחה` (a question no source answered; says who it waits for, with no internal list name).

**Choice components shuffle.** `ChoiceExercise`, `Prediction` and the stage-check questions show their options in an order fixed by a seeded hash of the exercise id (the same on server and browser); `correct` and the saved answer keep meaning the position the author wrote, so keys never change. Position therefore gives nothing away, so balance the **length** and plausibility of the options: the right one is not the longest more than about a third of the time. `ordered` keeps the written order for options that form a scale.

- **The official sites are blocked in this environment** (Bank of Israel, CBS, gov.il, Knesset). Nothing official may be marked `עובדה מאומתת` until someone opens the primary document. Facts that come from the team's transcription of a rule: kind `לא אומת`, text "לפי תעתיק של הצוות מההוראה, <תאריך>, ממתין לבדיקה מול המקור". From a secondary source (a bank's site, an article, a guide): "ממקור משני (אתר הבנק / מאמר / מדריך)", never "official" or "נבדק מול ההוראה" unless a primary text was read. From search summaries only: `לא אומת`, "לפי תקציר של מקור רשמי; ממתין לבדיקה". Always date the data (for example "ריבית בנק ישראל 3.25%, מ־2026-09-03").
- **What a bank's public form asks** (the questionnaire records the team holds) is a team record, not something this course opened: kind `לא אומת`, text "תיעוד הצוות, <תאריך>; לא נבדק מחדש מול האתר של הבנק". `עובדה מאומתת` is only for what the author of the page actually opened and read at its primary source (coordinator, 2026-10-12).
- Field knowledge (`research/field-knowledge.md`): kind `ידע מהשטח`, text names the role of who said it ("מומחה השטח", "הצוות", "בנקאי בשטח") and when, plus "ממתין לאישור מומחה". Never the do-not-teach items.
- No real client data, ever. No real bank's branding in examples; examples use "בנק א׳".
- The LLM never computes: you may write sentences, never numbers that a calculation produces.

## Accessibility and look

Tokens only; RTL; one turquoise primary action at most per component; status colours (success/warning/danger/info) only for their meaning, on their `-bg` backgrounds; nothing below 12px; touch targets ≥ 44px. The look is approved — reuse the pilot's classes rather than inventing new styles.

## No names of real people (decided 2026-10-18)

**It is an informational course: no name of a real person appears in any text a learner can read, hear or see** (lessons, checks, exam, glossary and definitions, components, data files that carry learner text, big-picture files, video frames, narration cues and `public/video/*.he.vtt`, downloads). Credit roles only: **"מומחה השטח"** (the mortgage adviser who accompanies the team; field knowledge is "ידע מהשטח, ממתין לאישור מומחה"), **"הצוות"**, **"בנקאי בשטח"**, **"החלטה של Mogi"** with its date. A decision is never credited to a person ("החלטה של Mogi, 2026-08-13", not a name); a question is "שאלה פתוחה למומחה". The standard lines are: "מומחה השטח אישר ב־2026-10-07", "מפי מומחה השטח", "ידע מהשטח, ממתין לאישור מומחה". Invented characters (נועם ושירה, אורי, דרור and the rest) and the brand name Mogi stay. Code comments, `research/` and `qa-reports/` may keep names; anything rendered, spoken or drawn may not. **Enforcement:** `pnpm check:refs` fails on the names אילון, דביר, Eylon, Eden, Dvir, Amit and on עדן written as a person (such as "של עדן", "עדן קיבל", "ועדן").
