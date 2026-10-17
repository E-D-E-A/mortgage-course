# Whole-course read, slice 1: stages 0 and 1 (0.1 to 0.12, 1.1 to 1.10, both stage checks)

Date: 2026-10-17. Reader: QA, reading as a beginner who knows nothing, in course order. I edited no source file, rendered no video, used no git. This report is the only file I wrote.

**What I read**
- The rendered text of all 22 lessons and both checks, from a scratch build (`astro build --outDir <scratchpad>/read01/dist`, 137 pages). I read the MDX for everything the render hides (option order, `correct`, `unit`, Sources lines, line numbers).
- All 22 subtitle files (`public/video/[01]-*.he.vtt`), the glossary definitions, `course/AUTHORING.md`, `course/course-map.md`, `research/dvir-decisions.md`.
- The earlier second-read reports for stages 0 and 1. I do not repeat their closed findings. I confirmed these are fixed: the 0.12 two-year-yield clash (B1), the q15 "8 decisions" claim (V3), the 0.3 11.90 explanation (V1), the 0.6 column pointer (V2), the 0.11 letter mapping (V4), the "התשובה שלכם" label (C5).
- Phone layout at 390px in Chromium for all 22 lessons and both checks, plus screenshots of 12 key regions.
- 8 videos (4-frame sheets cut from the existing mp4 files, not re-rendered), and all 22 subtitle files.

**Verdict.** The teaching content, the arithmetic and the phone layout are in good shape. The decisions of 2026-10-17 on locking and pass marks are fully applied in stages 0 and 1, and the external banker's name is already gone from this slice. What is left is mostly one family of problems: learner-facing Sources panels and a few body paragraphs expose the team's internal references (Brain page numbers, J-codes, FK ids, a repo path, a commit hash, internal file names, "the environment where the course was written"). It is about 200 lines across 16 lessons. After that come one visible rendering bug (raw code in the table of contents of 1.7 and 1.10), one garbled subtitle, and a handful of Hebrew slips.

---

## Major

### M1. Internal references are shown to the learner (rule 5), in 16 of 22 lessons
Rule 5: the learner must not see Brain page numbers, J-codes, DEC-n, FK ids, file paths, "repo", or names of internal documents. The Sources panel of every lesson from 0.4 on is learner-visible, and so are several body paragraphs. Every item below is learner-visible.

| Kind | Where (file:line) |
|---|---|
| Brain page numbers, "ב־Brain" | 0-4.mdx:463 (page 7798786); 0-7.mdx:155 (body: "מתעתיק בצוות ב־Brain (דף 7831553…)"), 437; 0-8.mdx:429 (page 7831553, "דף ה־Brain על מקורות הנתונים"); 0-10.mdx:106–108 (body: "ב־Brain (דף 67469313…)", "דף ב־Brain מייחס…"), 377, 378, 381, 388; 0-11.mdx:531, 533; 0-12.mdx:552, 554; 1-1.mdx:82 (body), 402, 405, 411; 1-2.mdx:495–507; 1-3.mdx:412–417; 1-4.mdx:118 (body), 364–368; 1-5.mdx:452–456; 1-6.mdx:369–381 (13 lines); 1-7.mdx:38–49, 434–465; 1-8.mdx:130, 150, 207 (body), 434–446; 1-9.mdx:431–444; 1-10.mdx: about 70 lines (lines 97–533 in the checklist data, 820–836 in Sources) |
| "ה־Brain:" quoted in the body | 1-8.mdx:207 ("ה־Brain: ״הנתון ׳הריביות תקפות שלושה חודשים׳ הוא פולקלור…״"); 0-10.mdx:107 |
| J-codes (J-010…J-170) | 1-4.mdx:364; 1-5.mdx:455; 1-6.mdx; 1-7.mdx:453, 459; 1-8.mdx:434–446; 1-9.mdx:436, 437; 1-10.mdx throughout (every checklist step, e.g. 1-10.mdx:238–420, 824–836) |
| FK ids (FK-H-0nn) | 1-6.mdx:370–375; 1-7.mdx:459–462; 1-8.mdx:441–445; 1-9.mdx:432–434; 1-10.mdx (about 20 lines, e.g. 109, 116, 130, 176, 177, 204–215, 828–831) |
| ENG ticket | 0-4.mdx:462 ("ENG-223") |
| File paths, repo, commit | 1-2.mdx:500 ("research/notes/official-sources.md, סעיף 1"); 1-3.mdx:413, 1-10.mdx:822, 824 ("packages/schemas/registry/v1.yaml בריפו edea-mortgage, ב־commit 6156bf8"); 1-4.mdx:367 ("ריפו edea-mortgage (context/inputs…)"); 1-5.mdx:452, 453 ("ריפו edea-mortgage, context/inputs"); 1-9.mdx:438 ("בריפו edea-mortgage (commit 6156bf8, הקובץ intake-map.ts)"); "research/eylon-list.md" at 1-3.mdx:417, 1-9.mdx:436, 1-10.mdx:821 |
| Internal document names | 0-8.mdx:430 ("הבריף של הקורס דורש…"); "מפת הקורס, סעיף 8" at 1-2.mdx:502, 1-9.mdx:431, 1-10.mdx:820; 1-3.mdx:412 ("Brain ״How the regulator says to compare mortgage offers״"); 1-9.mdx:432 ("Brain, Mortgage repayments and affordability follow the agreed calculation rules"); 1-9.mdx:438 ("Brain, The advisor app screens, v1 cut") |
| Internal team names | 1-3.mdx:416 and 1-9.mdx:432 ("אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08"); 1-10.mdx:228–230, 822 ("עדן, 2026-08-04") |
| Process talk | 0-7.mdx:155–157 and 0-10.mdx:105–109 ("האתר … חסום בסביבה שבה נכתב השיעור"); 1-5.mdx:190 and 1-10.mdx:164 ("האתרים הרשמיים חסומים בסביבה שבה הקורס נכתב"); "השאלה ברשימה לאילון", "ששאלנו את אילון", "שאלון שהוכן לו" at 1-6.mdx:197, 1-7.mdx:104, 111, 434, 1-8.mdx:150, 1-9.mdx:174, 1-10.mdx:659 |

**Fix.** The `Sources` items keep the kind label (`לא אומת`, `ידע מהשטח`…), the date and the plain-language provenance. Cut the identifier.
- "לפי תעתיק בצוות ב־Brain (דף 7798786, אוגוסט 2026), ממתין לבדיקה מול המקור" becomes "לפי תעתיק של הצוות (אוגוסט 2026); ממתין לבדיקה מול המקור".
- "ידע מהשטח … (FK-H-012)" becomes "ידע מהשטח … ממתין לאישור אילון" (drop the id).
- In `1-10.mdx` the J-code and the FK id inside the `source=` helpers (`brainRule(...)`, `fk(...)`) can stay in the data but should not be printed. Change those helpers once and about 70 lines are fixed.
- Remove "(מפת הקורס, סעיף 8)", "הבריף של הקורס", the repo/commit/path lines (replace with "ממאגר השדות של האפליקציה"), and "ENG-223" ("בדיקת הצוות ב־2026-10-04 ו־2026-10-08").
- Rewrite the process talk. "האתר … חסום בסביבה שבה נכתב השיעור" becomes "לא נבדק מול האתר של הלמ״ס". "ברשימה לאילון" becomes "שאלה פתוחה". Keep "ממתין לאישור אילון" only on field claims.
- Consider whether the team members' first names (אילון, עדן) belong in a learner page. AUTHORING says a field claim names who said it, so אילון is fine. עדן appears only as an internal approver.

### M2. Raw code in the table of contents of 1.7 and 1.10
The "בשיעור הזה" index shows `n("steps.count") צעדים, בארבעה חלקים` (1-7.mdx:83) and `עושים את זה לבד: p("steps.count") הצעדים` (1-10.mdx:640). The heading itself renders correctly; the generated TOC takes the heading source text. Confirmed in `dist/lessons/1-7/index.html` and `1-10`.
**Fix.** Write the number as plain text in these two headings: `## 12 צעדים, בארבעה חלקים` and `## עושים את זה לבד: 12 הצעדים`. (The count is a fact; if it must stay a fact, keep it in the body, not in an `##`.)

### M3. A garbled subtitle in the 0.8 video
`public/video/0-8.he.vtt:49` and `video/0-8.html:67`: "החוב המוצמד שווה בדיוק מה ששווה היה בהתחלה." is not Hebrew.
**Fix.** "החוב המוצמד שווה בדיוק מה שהיה שווה בהתחלה." (50 characters). The scene must be re-rendered to update the mp4 (the .vtt alone updates the script under the player; the baked-in cue is the same text).

### M4. Stage 1 gives case A a mix before stage 5 (AUTHORING rule)
AUTHORING: "Case A … before then it appears only with the numbers already given (price, equity, loan, incomes)". Lesson 1.4 (text, MixSlices, worked example, half-worked table, video) splits Noam and Shira's loan into 40/35/25, 33/33/34 and three equal thirds, and the video draws the 40/35/25 bar. The page labels these "דוגמאות, לא המלצות", but a learner who meets stage 5 will have seen a mix for the family before.
**Fix.** Either make the examples a different pair, as 1.3 does with Maya and Ori, or, in the 1.4 exercise intro and the video's first card, say plainly "תרגיל נפרד, לא התיק של נועם ושירה" as AUTHORING allows. The MixSlices interactive is explicitly "ההלוואה של נועם ושירה": same fix.

### M5. Open product questions are put to a beginner as if they were part of the lesson
- 1.3, "הצמדה: חלק ממנגנון הריבית, או שאלה רביעית?": about 8 lines of an internal modelling debate ("באפליקציית היועץ… דף מחקר של הצוות… ממתינה להכרעה של אילון… אם תחליטו שהיא שאלה רביעית ונפרדת — גם זה תיאור שקיים"). The learner is told to decide. 1-3.mdx:94 (the paragraph) and 1-3.mdx:202 (the card-sort reveal).
- 1.7 and 1.10 present "when to order the appraiser" as three positions and "the contract with the seller" as an open question, with "the course does not choose".
- 1.2 presents "mortgage against price or against value" as an open question between two sources.
These are honest, but a beginner cannot do anything with an open internal question, and in 1.3 it is the sort of thing that breaks "one idea per lesson". **Fix.** One sentence each, in the lesson ("ההצמדה שייכת בקורס למנגנון הריבית"; "יש מי שמזמינים שמאי מיד ויש מי שמחכים — שתי הדרכים קיימות"), and move the reasoning to a "למי שרוצה לדעת עוד" `<details>`.

---

## Minor

### Hebrew
- **0-4.mdx:191** — "כלומר ב־חזקת 12:" The hyphen prefix `ב־` was put in front of a word, so the learner reads "ב־חזקת". It should be one word: "כלומר בחזקת 12:" (move the `ב` inside the `<Term>` surface form: `<Term …>בחזקת</Term>`). It is the only `ב־<Term>` case in the slice.
- **1-3.mdx:255** — "ששה משפטים חדשים" should be "שישה משפטים חדשים".
- **1-2.mdx:168 and 1-2.mdx:439** — "את המוכר צריך לשלם את כל המחיר" and "את המוכר משלמים לפי המחיר" are not grammatical. Fix: "למוכר צריך לשלם את כל המחיר" and "למוכר משלמים לפי המחיר".
- **1-10.mdx:795** — "נשארים 24 − 23 = 1 ימים" should read "24 − 23 = 1, כלומר נשאר יום אחד" (a count of 1 needs the singular; if the unit is built from the number, special-case 1).
- **1-2.mdx:281** — "0.45 נקודות אחוז" but AUTHORING: singular up to one ("0.45 נקודת אחוז", as 0.9 writes "0.5 נקודת אחוז").
- **0-1.mdx:256** (the reveal) — "המחיר נגמר 2 ₪ מתחת למחיר ההתחלתי": colloquial. "המחיר יוצא 2 ₪ מתחת למחיר ההתחלתי" is cleaner.
- **1-4.mdx:118** — "נלמד אותו בשיעור 4.4, יחד עם הוראה 329 (נגיע לזה בשיעור 4.4)": the same lesson reference twice in one sentence. Keep one.
- **0-3.mdx:419** — "גם כשנגיע למשכנתא …, שמחזירים לפעמים במשך עשרות שנים": the relative clause does not agree with "משכנתא" (feminine). Use "שמחזירים אותה לפעמים…".
- **1-8 and 1-7: "חלון" and "שעון"** — 1.7 teaches "שעון" (three clocks); from 1.7 line 60 on, and all of 1.8, the same 24-day clock is also called "חלון". Add once in 1.7: "(אפשר לקרוא לזה גם ״החלון״)".
- **"אישור עקרוני הוא מחיר על נתונים"** (1-8.mdx, intro, summary, 1.10 pitfalls): "מחיר" means "quote". A beginner reads "price". Use "הצעת מחיר" or "תמחור".
- **"תעתיק"** (about 60 occurrences from 0.4 on, e.g. "לפי תעתיק בצוות"): never explained. Add one sentence in 0.4 or 1.2: "תעתיק — הצוות העתיק את הנוסח של ההוראה לדף שלו, ועוד לא בדק אותו מול המקור".
- **Unexplained abbreviations and words.** "עו״ש" first appears in 1.7 (Sources/body) and is used in 1.9–1.10 with no expansion; "ת״ז" and "ספח" in 1-7.mdx:136 (the explanation comes only in 1.10); "ליסינג" (1-9.mdx:112, 221); "נוטריון" (1-6.mdx:104); "מנפיק"/"הנפקה" (0-11.mdx:109, 173, 317). Add a short parenthesis on first use: "עו״ש (עובר ושב, חשבון הבנק היומיומי)", "ת״ז (תעודת זהות)", "ליסינג (שכירות לטווח ארוך של רכב)", "נוטריון (עורך דין שמאשר חתימות ומסמכים)", "מנפיקה (מוציאה אג״ח למכירה)".
- **Hebrew inside formulas.** I screenshotted the formula boxes of 0.1, 0.9, 1.1, 1.2 and 1.9. They render in the right order (no mirrored equations). No Hebrew word sits inside an `<M>` anywhere in the slice.

### Wording and labels
- **Banker label, bare form.** The decision is "בנקאי בשטח" and nothing else. These lines say just "בנקאי" or add "מחוץ לצוות / שאינו בצוות / ששוחח עם הצוות":
  - bare "בנקאי": 1-2.mdx:162 ("בפגישה עם בנקאי"), 1-2.mdx:466 ("לפי בנקאי ששוחח עם הצוות"), 1-2.mdx:499 ("בפגישה עם בנקאי"), 1-8.mdx:150 ("בפגישה עם בנקאי"), 1-10.mdx:367 and 1-10.mdx:401 ("לפי בנקאי"). (checks/1.mdx:188 "הבנקאי בסניף" is the ordinary bank clerk, not him: leave.)
  - "בנקאי בשטח מחוץ לצוות" / "שאינו בצוות": 1-2.mdx:501; 1-6.mdx:83, 370; 1-7.mdx:107, 137; 1-8.mdx:132, 205; 1-10.mdx:367, 402, 634, 829.
- **His name.** I searched the whole repo (all file types, excluding `node_modules`, `dist`, `.git`) for the name that appears in the source recording's file name ("אורי"). In the learner files of stages 0 and 1 it is **not present**. It is still present in `research/notes/meetings-and-drive.md:51` (the recording's file name) and `:229`, `:592` ("אורי ברכה", an appraisal-report name heard wrongly), none learner-visible. **Warning for the later search-and-replace.** "אורי" is also the first name of two invented couples: **1-3.mdx:227** ("מאיה ואורי"), 2-7.mdx:275, 283, 2-11.mdx:222, 226, 421, `scripts/lessons/lesson-2-7.ts:155`. A blind replace of "אורי" would damage them. Better still, rename those fictional couples now so the name disappears from the course entirely.
- **"ריבית חוזית" is named once and then dropped.** 0.4 introduces it in the callout (0-4.mdx:153–155), but the rest of 0.4, and 0.5 and 0.6 (0-5.mdx:187 and 0-6.mdx:201: "הריבית השנתית שבחוזה חלקי 12"), 0.8:140 and the exercises use "ריבית שנתית שכתובה בחוזה" / "ריבית שמחלקים ב־12". Suggest: in 0.4's first explanation paragraph (0-4.mdx near "המספר הזה, ״6% לשנה״, נקרא ריבית שנתית") say "ריבית שנתית, שבהלוואה היא הריבית החוזית", and in 0.5/0.6 write "הריבית החוזית חלקי 12 (שיעור 0.4)".
- **"נומינלית"** (decision: only "before inflation", and 0.8 explains both meanings). Every occurrence in the slice (about 36) is correct. Meaning A is used in 0.8 (123, 126, 129, 136, 183, 198, 234, 250, 308, 346–351, 391, 403, 414–415, 430), 0.11:175, 0.12:141 and the definition `0-8.json`. Meaning B appears only where it is named and sent to "חוזית": 0-4.mdx:153–155, 0-4.mdx:464, 0-8.mdx:138–140, 311, 417, 430. 0.8 lesson text explains both ("למילה ״נומינלית״ יש שתי משמעויות", 0-8.mdx:138–140) and the summary repeats it. No fix needed. (0.4 sends to 2.4 for the full difference and 0.8 sends to 2.3; 2.4 exists in the map, "נומינלית — מילה אחת, שתי משמעויות".)
- **No lock and no pass mark.** I searched stages 0–1 (lessons, checks, definitions, subtitles, scene files, scripts) for lock, pass, threshold and "next stage opens" wording. The only hits are the correct statements: checks/0.mdx:246 and checks/1.mdx:271 ("אין ציון עובר, ושום שלב לא ננעל"), 0-12.mdx:540 and 1-10.mdx:810 ("בלי סף ובלי נעילה: כל השלבים פתוחים"). The check footers say "השלב הבא — שלב 1/2" as navigation only. "השיעור האחרון בשלב" is fine. No change.
- **Source-label vocabulary.** 0/1 uses only `לא אומת`, `הנחת חישוב`, `ידע מהשטח`, `בדיקת חישוב`, `מחקר / הצעה`, `ידע מתמטי כללי`, `ידע כלכלי כללי`, `החלטה של Mogi`. No `עובדה מאומתת` (correct: nothing was opened at source). Every `ידע מהשטח` item carries "ממתין לאישור אילון". Two small gaps: 1-10.mdx:824 (`החלטה של Mogi`) has no date and no who; six `לא אומת` items give no reason for being unverified (0-7.mdx:438, 1-2.mdx:496, 1-6.mdx:381, 1-7.mdx:453, 464, 1-8.mdx:446).
- **0.4 names real banks in Sources only** ("לאומי ודיסקונט", 0-4.mdx:462) while the body says "שני בנקים". AUTHORING: no real branding in examples. It is a source, not an example, but say "שני בנקים גדולים בישראל" to match the body.
- **Stale date.** 0-7.mdx:152 "המדד של ספטמבר 2026 צפוי להתפרסם ב־15 באוקטובר 2026". Today (2026-10-17) the date has passed. Drop the sentence or refresh the data and the "נכון ל־" date. 0.10's "ההחלטה הבאה ב־21 באוקטובר" is still ahead but will pass in four days; the same refresh covers both.

### Exercises and answer keys
- **Order of options.** `ChoiceExercise` and the stage checks shuffle the options by id, so the written order does not matter, and I counted the rendered orders: no pattern. **The two prediction questions do not shuffle** (`Prediction.vue`): across the 21 predictions of stages 0 and 1 the correct option is 2nd in 11, 3rd in 9, 1st in 1 (0.10) and **never 4th**. A guess "not the last one" is always right. Fix: shuffle with the same seeded function.
- **Correct option is the longest.** By a rough parse of the 77 multiple-choice items, the correct option is also the longest in roughly half. Clear cases (I read them in the render): 0.1 ex2, 0.7 ex4, 0.9 ex1 and ex5, 0.12 ex3, 1.1 ex1 and ex5, 1.3 ex2, 1.4 ex1, 1.5 ex6, 1.6 ex1/ex4/ex6, 1.8 ex4, 1.9 ex5 and ex7, 1.10 ex5. Fix: shorten the correct option or lengthen one distractor in these.
- **Exercise 5 in 1.7** asks two things ("כמה ימים עברו מהשמאות? (אחר כך: האם בנק ב׳ יכול לסרב?)") but has one answer box; the second question is answered only in the solution. Say "כתבו רק את מספר הימים".
- Every numeric item (108 in lessons and checks) shows a unit in its label (₪, %, נקודות אחוז, ימים, שנים, צירופים, נקודות, "בנובמבר", "באפריל"). No exercise is missing a unit.

### Numbers and repeats
- 106 numeric statements recomputed in plain Python `Decimal` (script in the scratchpad, `read01/verify.py`, nothing imported from `src/`). **All agree**, with the page's own rounding convention. The 0.3 11.90 doubling time, 0.4 root-12 values (0.4868, 0.4074, 0.3994), the 0.6 present values (2,486.85; 7,721.73; 6,710.08; 15,372.45; 111,003.64), 0.8 (134,391.64; 74,409.39; 41,198.68 shown as 41,199), 0.11 bond prices (97.33, 102.78, 88.53, 92.64, 98.17, 93.07), 0.12 forwards (5.01, 5.00, 4.01, 4.67), and all stage-1 percentages and day counts. I also checked 24 calendar results (separate from the 106) (weekday of every date in 1.7/1.8/1.10, +24/+12/+90 day sums, Yom Kippur and Independence Day skips).
- **Case A numbers repeat consistently** across 1.2, 1.4, 1.9, 1.10, the videos, the checks and the later lessons that quote them (2,200,000; 560,000; 1,640,000; 74.55%; 12,400; 9,300; 1,450 × 26; 20,250). Quoted again at 5-7.mdx:394 and `scripts/lessons/lesson-8-1.ts:3` with the same values.
- **Minor numeric display notes.** In 0.4 the formula step shows 10,616.78 while the table above it shows 616.79 interest (the rounding callout explains this later; add "(על האגורה — בהמשך)" at the first place); the widget in the same lesson shows 616.78.

### Phone layout (390px, all 24 pages)
- **No horizontal page scroll anywhere**, no element sticks out of the viewport outside a scroll box, no hydration errors, no text under 12px. All wide tables are in scroll boxes with the "יש עוד עמודות" hint; fill-in tables fit. The only console error is the 404 for `/auth/session`, which does not exist in a static build.
- **Tap targets under 44px** (all on lesson pages, none breaks a layout):
  - The "פתחו ״מה הייתם אמורים לראות״" and "התסריט המלא" `<summary>` lines are 20px tall (332×20 and 324×20), on all 22 lessons. The padding of the box around them is not clickable. Fix: give `summary` `min-height:44px; display:flex; align-items:center` or move the padding onto the summary.
  - "הצגה כטבלה" under each chart is 72×20.
  - Inline `<Term>` buttons are 29px high, as inline text. Acceptable as inline links, but AUTHORING says ≥44px; if the rule is strict, add `padding-block` with a negative margin.
  - The top-left logo link is 36×44 (width under 44).
  - Radios and checkboxes are 13×13 or 20×20 but sit inside 44px labels. Fine.
- Screens I looked at (0.6 loan table, 0.12 table, 1.6 map, 1.7 steps and clocks, 1.10 map and checklist, 1.3 card sort, 1.4 slices, the stage 1 check): usable; the 1.10 map inputs have no visible "₪" unit next to the empty boxes (the label says it).

### Videos (8 frame sheets, all 22 subtitle files)
- Frames I looked at (four per video, spread over the whole video): 0.4, 0.8, 0.10, 0.12, 1.1, 1.4, 1.7, 1.10. Numbers on screen match the page in every frame (0.5% / 6.17% / 0.4868%; 134,392; 5.01%; 600,000 / 40%; 656,000 + 574,000 + 410,000; 90 days to 27 January 2027; 11 days collecting and 13 left). Directions are right (RTL time axes), nothing is clipped.
- All 22 `.he.vtt` files: no cue over 60 characters, none under 1.5 seconds, none faster than 22 characters per second, last cue ends within the video, no overlaps. The scripts printed on the pages are these subtitles, so page and subtitles agree. The only wording defect is M3.
- 0.8: the cue "החוב שלא מוצמד שווה רק כמו 74,409 ₪ של היום" uses "₪ של היום", the phrase AUTHORING reserves for discounting; use "כוח קנייה של 74,409 ₪ היום".

---

## Cross-stage dependencies noticed

What stage 0 and 1 assume from later stages, and whether the target teaches it (checked against `course/course-map.md`):

| Stage 0/1 says | Taught in | OK? |
|---|---|---|
| 0.3 (and 1.3) ״גרייס״ | 2.10 | yes (map row 2.10) |
| 0.4 ״ריבית חוזית״ | 5.5 | yes; the full "נומינלית" distinction is 2.4 and 2.3 |
| 0.8 ״ריבית על חוב מוצמד״, ״הפרשי הצמדה״ | 2.3, 3.5 | yes |
| 0.9 ״עמלות״ | 3.9 | yes |
| 0.10, 1.x ״פריים״ = ריבית בנק ישראל + 1.5 (not verified) | 2.1 | yes, and 2.1 repeats the +1.5 as a calculation |
| 0.11/0.12 ״ריבית קבועה״, ״משתנה צמודה״ | 2.2, 2.7 | yes |
| 0.12 ״הוראה 451״, ״ריבית פורוורד״ | 5.1, 5.4 | yes |
| 1.1 ״שיעור מימון״, ״טאבו״, ״שמאי״ | 1.2, 1.6 | yes, in order |
| 1.2 ״הוראה 329״, ״מדיניות בנק״ | 4.4, 4.5 | yes |
| 1.3 ״שפיצר״, ״הלוואת זכאות״, ״ריבית קבועה מול תשלום קבוע״ | 2.9, 2.8, 2.2 | yes |
| 1.5 ״גרירה״, ״דירה במחיר מופחת״ | 4.3, 4.4 | yes |
| 1.6 ״ביטוח״ | 4.9 | yes |
| 1.9 ״נטו״, ״הכנסה מוכרת״, ״יחס החזר״ | 4.1, 4.3 | yes |
| 1.10 ״בשלב 6״ (balancing equity against the buffer) | stage 6 | not checked here (stage 6 slice) |

Other dependencies and risks:
- **Letters.** The AUTHORING letter table matches use in 0 and 1 (P, B, r, n, I, C, k, m, e, q, π, i, F, y, s, M, K, V, H). New letters not in the table: **f** (forward rate, 0.12), **t₁ t₂** (0.12), **r₁ r₂** (0.9, subscripts defined in the box: allowed). The table says `g` first appears in 3.4 while 0.3 and 1.3 already name grace (words only; no letter): no conflict.
- **Case timeline.** Case C (עדי וירון) appears in 1.5; case A first as numbers in 1.2 and as a mix in 1.4 (see M4).
- **Terms taught after first use through `<Later>`.** 76 `<Later>` references in stages 0–1: all point to a lesson that exists. The 17 whose word is not a glossary key are lesson titles or product words (ריבית הפריים → 2.1, גרייס → 2.10, עמלות → 3.9, מחזור → 1.5).
- **Fixed assumption that Mogi's tool must honour.** The 1.7 day counting (Friday counts, day 0 is the event day) is taught as "הנחת הקורס". Any later stage that counts days must use the same rule (stage 5 uses it for 5.1, per the map).
- **1.9 "הכנסה פנויה (מבוא)"** (income minus fixed payments, 20,250 for Noam and Shira) is reused by 5-7.mdx:394 and `lesson-8-1.ts` as the denominator of a payment ratio. 4.2 and 4.3 must say explicitly that the bank's ratio can differ from the intro figure; 1.9's text already warns ("בשלב 4 נדייק אותה").

## What I did not find

No wrong number, no wrong answer key, no horizontal scroll, no hydration error, no stage lock or pass mark wording, no banker name in learner text, no use of "נומינלית" for the contract rate, no singular address of the learner, no mirrored equation. 0.1–0.12 read in order without a term used before its lesson, apart from the abbreviations listed under Minor.
