# Whole-course read, slice 2 + 3: lessons 2.1-2.12, 3.1-3.12 and the two stage checks

Date: 2026-10-17. Reader: one beginner who finished stages 0-1, reading 2.1 to the stage-3 check in order. I edited no source file and used no git. Output of this read: this file only (plus scratch files in the session scratchpad, listed at the end).

**What I read.** Every line of `src/pages/lessons/2-1.mdx` ... `3-12.mdx` (24 lessons), `src/pages/checks/2.mdx` and `3.mdx`, the 24 `public/video/*.he.vtt`, the 24 definitions files `src/data/definitions/2-*.json`/`3-*.json`, `course/course-map.md` (stages 2-3, section 3 terms), `course/AUTHORING.md`, `research/dvir-decisions.md`, the three stage-2 and stage-3 QA reports (not repeated here), the built site (`astro build --outDir <scratchpad>/read23/dist`, 137 pages built) and 8 key frames of the videos (`qa/video/`, existing; nothing rendered).

**Verdict.** No wrong number found; no beginner-blocking error in the maths. Three things to fix before publishing: (1) internal references in learner-visible text (Sources and body) in 22 of 24 lessons, (2) a visible double minus in the 3.5 table, (3) the correct option of the multiple-choice exercises is the longest one in 29 of 48 cases in these two stages. The rest is Hebrew polish, a few term gaps and template-level touch targets. Counts: 3 Major, 31 Minor.

Severity: **Major** (a beginner is misled, or learner text shows what it must not, or the course rules are broken at scale), **Minor** (polish / single place).

---

## Part A. Major

### A-1. Learner-visible internal references (rule 5) - 22 of 24 lessons, both checks' neighbours included

`<Sources>` is rendered to the learner (confirmed in the built HTML: `FK-H-053`, `E50`, `BIR_MRTG_99`, `Linear ENG-223` and Brain page numbers are all in the page text), and six places in the body show the same things. The earlier reviews accepted this as "only in Sources"; the rule for this read is that none of it may appear.

| What shows | Where (file:line) |
|---|---|
| "Brain" in running text (body, not Sources) | 2-1.mdx:89, 2-1.mdx:90 ("דף ב־Brain מייחס..."), 2-1.mdx:163 (RateLayers `note`), 2-6.mdx:90, 2-8.mdx:166 (with "דף 7733250"), 2-10.mdx:166, 2-12.mdx:183 (`printNote`, also printed on paper) |
| Brain page numbers in Sources (the 7-8 digit ids 67436545, 67469313, 7733250, 7798786, 7831553, 9895937, 8716289, 7503881, 16646263) | 2-1:441-444 · 2-2:466 · 2-3:442-444 · 2-4:419 · 2-5:452-455 · 2-6:424,426-428 · 2-7:526,527,529-531 · 2-8:418,421 · 2-9:425 · 2-10:408,411 · 2-12:483-485 · 3-1:510 · 3-4:430 · 3-5:496,497,499 · 3-6:444 · 3-7:452,453 · 3-8:500-505 · 3-9:398-400,402 · 3-10:442,443 · 3-11:403 · 3-12:463 |
| "תשובות 5 ו־15", "תשובה 4", "תשובות 1 ו־4", "תשובה 3" (answer numbers inside the Brain page) | 2-1:444 · 2-2:466 · 2-3:443,444 |
| "Linear ENG-223" (a ticket id; the same sentence is repeated 16 times) | 2-1:448 · 2-2:467 · 2-4:418 · 2-9:421 · 3-1:507 · 3-2:459 · 3-3:403 · 3-4:431 · 3-5:501 · 3-6:446 · 3-7:455 · 3-8:508 · 3-9:404 · 3-10:446 · 3-11:406 · 3-12:462 |
| FK ids | 2-10:412 (FK-H-053) · 3-9:401 (FK-H-062) · 3-11:404 (FK-H-059) |
| Decision/series codes | 2-8:421 ("E50") · 2-5:453 and 2-7:530 ("סדרות BIR_MRTG_99") |
| Names of internal documents | "הבריף של הקורס" 2-4:417, 2-12:481 · "מילון המונחים של Mogi" 2-4:420 · "רישום השדות של אפליקציית היועץ של Mogi, גרסה 1" 2-1:445, 2-3:445, 2-5:451, 2-6:428, 2-8:420, 2-9:424, 2-10:413 · "ברשימה לאילון" 2-3:445 and in the **body** at 2-8:117 · "כמו שמפת הקורס מבטיחה לשלב 2" 2-12:159 · "טבלת האותיות של הקורס" 3-4:203 (there is no such page for the learner) |
| Tool names that mean nothing to a learner | "LibreOffice" 3-12:263 (body), 3-12:465 · "TypeScript"/"Python"/"ניוטון" 3-10:447, 3-7:457, 3-6:448, 3-5:503 |
| No J-codes and no DEC-n in learner text in this slice (only inside `{/* */}` comments) | - |

**Fix (exact).** Keep the *kind* badge, a human description, who and when, the date. Move ids to the existing foot-of-file comment.
- 2-1.mdx:89: "ומבדיקה שהצוות תיעד ב־Brain" → "ומבדיקה שהצוות תיעד". 2-1.mdx:90: "דף ב־Brain מייחס אותן להוראה רגולטורית" → "מסמך של הצוות מייחס אותן להוראה רגולטורית". 2-1.mdx:163: "ולפי תיעוד של הצוות ב־Brain" → "ולפי תיעוד של הצוות". Same one-word cut at 2-6:90, 2-8:166 (also delete "דף 7733250, 2026-08-17"), 2-10:166, 2-12:183.
- Every Brain-page sentence in Sources: replace "(Brain, דף 67436545, תשובה 4)" by nothing, and "לפי תעתיק בצוות ב־Brain (דף 7733250, אוגוסט 2026)" by "לפי תעתיק בצוות (אוגוסט 2026)".
- The 16 ENG-223 sentences: "לפי בדיקה של הצוות מול לוחות ששני בנקים פרסמו (החישוב התאים עד האגורה בכל התאים שנבדקו; Linear ENG-223, 2026-10-04; לא נבדק מול מקור רשמי)" → "... (החישוב התאים עד האגורה בכל התאים שנבדקו; בדיקה של הצוות מ־2026-10-04; לא נבדק מול מקור רשמי)".
- 2-8:117: "השאלה ברשימה לאילון" → "השאלה פתוחה, והצוות ישאל את אילון". 2-3:445 and 2-8:420: drop the "רישום השדות" clause or write "כך מוגדר בתוכנה של Mogi".
- 2-4:417: delete the last sentence ("הבריף של הקורס דורש להפריד ביניהן"). 2-4:420: "(מילון המונחים של Mogi)" → nothing. 2-12:159: "כמו שמפת הקורס מבטיחה לשלב 2" → "כמו שהוצג בתחילת השלב". 3-4:203: "אות חדשה בטבלת האותיות של הקורס, ומעכשיו היא תסמן תמיד חודשי גרייס" → "אות חדשה: g, ומעכשיו היא תסמן תמיד חודשי גרייס".
- A check that keeps this from coming back: `scripts/check-terms.mjs` could fail on `Brain|ENG-|FK-H|\bE\d\d\b|BIR_` outside `{/* */}` in `src/pages/**`. (Shared file; not edited.)

### A-2. 3.5: double minus in the month-3 row of the table (3-5.mdx:170)

Built HTML: `<span class="ltr">−‎−397.56</span>`; at 390px and desktop the cell shows "−−397.56". Cause: `cell()` returns `formatShekels(...)` with a leading LRM + "−" (U+2212) and the template removes only an ASCII hyphen: `−{cell("m3.indexation").replace("-", "")}`. Month 3 is the only negative indexation cell; I scanned all 24 built pages and both checks for `−‎−`, `--` before a digit: this is the only hit.
**Fix:** `−{cell("m3.indexation").replace(/[-−‎]/g, "")}` (or reuse the `neg(...)` helper that already exists in the same file for the text). The caption two lines below ("בחודש 3 המדד ירד, ולכן הם שליליים") is right; only the cell is wrong.

### A-3. Multiple-choice answer keys can be guessed by length (rule 4)

`ChoiceExercise` shuffles by exercise id (I re-ran its generator on all 47 non-`ordered` items: the correct option lands in positions 1-4 as 14/11/12/10, so position is fine). Length is not: the correct option is the longest of the four in **29 of 48** lesson exercises in stages 2-3, and in 5 of 7 stage-3 check questions. Mean length of the correct text is 1.58x the distractors in stage 2 (16 of 23 longest) and 1.2x in stage 3 (12 of 24); the same read gives 2 of 38 longest in stage 4 (already rebalanced), 25 of 32 in stage 5. Worst, ratio correct/mean of the others: 2.1-1 (3.4), 2.2-1 (2.9), 2.7-1 (2.7), 2.7-9 (2.4), 2.12-6 (2.4), 3.10-1 (2.3), 3.9-4 (2.0), 2.8-1 (1.9), 3.10-4 (1.8), 2.12-3 (1.8), 3.8-4, 2.3-4 (1.7), 2.5-1, 2.2-3, 3.3-1, 2.3-1, 3.10-6 (1.6). All 4 of 4 in 2.12 and 2 of 2 in 2.2, 2.3 and 3.10 (3 of 3).
**Fix:** lengthen the three distractors to the correct option's length (each distractor with the same kind of qualifying clause), or shorten the correct one; in 2.1-1 the correct text is 117 characters against 20-70. Check pages: `c3.q2, q6, q8, q13, q16` have the same pattern.
Same family, lower priority: `PredictionReveal correct=` is index 1 (second option) in 11 of 22 lessons and index 0 only once (2.9); numeric predictions are sorted ascending with the answer near the end (3.1, 3.4).

---

## Part B. Minor

Format: location - problem - exact fix.

### B-1. Term-before-use and prose-level gaps (beyond `check:terms`, which passes)
1. 3-8.mdx:181 - "בלי ״זעזוע ריבית״ שרירותי" - the term is explained only in 4.3 (4-3.mdx:93). → "בלי להניח שהריבית תקפוץ (״זעזוע ריבית״ שרירותי; נסביר בשיעור <Later lesson="4.3" quiet>4.3</Later>)", or just drop the quote marks term: "ובלי להוסיף לריבית תוספת שרירותית".
2. 2-5.mdx:90-114, 202, 214, 250, 271 (and 2-6:107, 2-7:255, 2-2:297) - "הלוח המקורי" / "לוח של בנק" for the table of payments, four lessons before "לוח סילוקין" is defined (2.9); no earlier stage-0/1 lesson uses it. → at the first use, 2-5.mdx:107: "**צעד 1 — הלוח המקורי** (טבלה של כל התשלומים החודשיים; בשיעור 2.9 נקרא לה <Later lesson="2.9">לוח סילוקין</Later>)."
3. 2-4.mdx:78 and 0-4.mdx:154, 0-8.mdx:140 - "ריבית חוזית" appears three times as `<Later lesson="5.5">` (the glossary term lives in 5.5, `src/data/definitions/5-5.json`) although 0.4 is where the course starts using it and 2.4 is where it is taught. → define it in 2.4 (`<Term t="ריבית חוזית" lesson="2.4">`, move the JSON entry from 5-5 to 2-4, keep 5.5 as a reminder); update the map's term list.
4. 3-4.mdx:203 - see A-1 (a table the learner cannot open).
5. 3-1.mdx:506 - "סכום של סדרה הנדסית" in Sources; term never taught. → "סכום של מקדמי היוון (כפל ב־(1 + r) וחיסור)".
6. 2-4.mdx:419 - in the Sources the market sentence is quoted with "נומינלית" (fine, quoted), but 2-4.mdx:420 says the compiler "לא מרשה להחליף" - jargon for a learner. → "(שני סוגי מספר נפרדים בתוכנה של Mogi)".

### B-2. Contract-rate vocabulary ('ריבית חוזית' vs 'נומינלית'), decided 2026-10-17
- Stages 2-3 use "נומינלית" in meaning 2 (before inflation) only: 2-3.mdx:37, 97, 149, 244, 388, 411, 412, 425, 430; 3-8.mdx:503 (the yield curves). All correct.
- Meaning 1 (contract rate) is spoken as "חוזית" in 2.4 only: 2-4.mdx:78, 84, 135, 150, 171, 221-227, 270, 318, 401-403, 419, and the VTT cue 2-4 at 00:02:17. 2.4 quotes how the market says "נומינלית" on purpose (cards at 2-4.mdx:30-39, 292, 384, 390; check question checks/2.mdx:118 and the VTT cues 2-4 00:00:13 and 00:02:09). No other lesson of the slice uses "נומינלית" for the contract rate; the other lessons just say "אחוז הריבית" / "ריבית שנתית" / "שבחוזה". Nothing to change except B-1.3.
- Suggestion: checks/2.mdx:120 reads "המובן של 0.4: האחוז שכתוב — ההפך של אפקטיבית"; add "(בקורס: חוזית)" so the check teaches the course word.

### B-3. External banker (rule: only "בנקאי בשטח", no name)
Every occurrence of "בנקאי" in the slice (all `.mdx`, `.vtt`, definitions, `video/*.html`, scripts, data): **2-10.mdx:163** ("בנקאי בשטח מחוץ לצוות, סיפר...") and **2-10.mdx:412** ("בנקאי בשטח מחוץ לצוות, בשיחה מ־2026-08-05 (FK-H-053)"). Both comply; no name remains. (Outside the slice, 1-2.mdx:162 and 499 say "בפגישה עם בנקאי; ככל הנראה אילון" - no name either.) The only fix is to drop "(FK-H-053)" (A-1).

### B-4. Stage lock / pass mark wording (rule: none)
No wording implies passing, a pass mark, a lock or "the next stage opens". These four lines state the absence in terms of the old rule, which still plants the idea; suggested text in each case:
- 2-12.mdx:471 and 3-12.mdx:451: "זה תרגול שמציג ציון, בלי סף ובלי נעילה: כל השלבים פתוחים, ושלב N מחכה לכם." → "זה תרגול שמציג ציון. אפשר לנסות שוב, ואפשר לעבור לכל שיעור."
- checks/2.mdx:284 and checks/3.mdx:315: "אין ציון עובר, ושום שלב לא ננעל, ואפשר לנסות שוב." → "אפשר לנסות שוב."
- (Outside the slice: the same sentence is in every stage check and in `ExamPaper.vue:295`; worth the same one-line change.)
- Lesson 3.12's "החודש הבא נפתח כשהחודש הזה נכון" (3-12.mdx:178) and the cards "חודש 2 ייפתח..." are a per-exercise gate, not a stage lock; fine.
- The layout's end-of-stage block ("השלב הבא — שלב 3: החישוב") is a link, not a lock; fine.

### B-5. Labels (fact / החלטה של Mogi / ידע מהשטח, ממתין לאישור אילון / מחקר / הנחת חישוב / לא אומת)
1. 2-12.mdx:481 - kind "מחקר / הצעה" for "לפי הבריף של הקורס" is not research, and the brief is internal (A-1). → delete the item.
2. 2-4.mdx:418 uses "לא אומת" for the sentence that the other 15 lessons label "הנחת חישוב" (the monthly = annual ÷ 12 team check). → use the same kind in all 16; I would keep "הנחת חישוב".
3. 2-1.mdx:446 - "הקיצור P−0.8" under "ידע כלכלי כללי": it is market vocabulary, not general economics without figures (AUTHORING). → "ידע מהשטח" is not right either (nobody said it); simplest: "ידע כלכלי כללי" stays but add "כך נהוג לכתוב בשוק".
4. "ממתין לאישור אילון" is attached to Eylon's own quotes (3-9.mdx:93, 401; 3-11.mdx:133, 404) - correct per rule, but reads odd. → "ידע מהשטח: אילון, 2026-09-16; ממתין לאישור סופי של אילון" or move the badge only.
5. 3-10.mdx:443 - "מחקר / הצעה" for an open legal question is right; keep.
6. Decision wording differs: 3-7.mdx:84 "(החלטה של Mogi: אילון, 2026-08-03)", elsewhere "אילון אישר ב־2026-10-07, ועדן קיבל ב־2026-10-08" - see B-6.

### B-6. "ועדן קיבל" - an unexplained person, 22 times in body text
2-1:146 · 2-2:200 · 2-3:141 · 2-5:116 · 2-6:120 · 2-7:107, 135, 149 · 2-8:132, 176 · 2-10:75, 166 · 3-1:480 · 3-4:229 · 3-5:79 · 3-6:91 · 3-7:167 · 3-8:167, 174, 181 · 3-9:115 · checks/3:230. The learner never learns who Eden is (only Eylon is introduced, 1-4.mdx:93) or what "קיבל" means. → In running text write "(החלטה של Mogi, 2026-10-08)"; keep the full "אילון אישר... ועדן קיבל..." in Sources. Also 3-11.mdx:216 names a fictional couple "אלון" next to "אילון" the expert - rename the couple (e.g. "ליה ודרור").

### B-7. Hebrew quality
1. 3-1.mdx:449 (exercise 5) - "לקחתם את ההחזר בשפיצר של מסלול של 400,000 ₪ ב־5.4% לשנה ל־15 שנה מוכן, מההצעה או ממחשבון" is not a sentence. → "בשיעור 2.9, בדוגמה הפתורה, נתנו לכם מוכן את ההחזר בשפיצר של מסלול של 400,000 ₪ ב־5.4% לשנה ל־15 שנה — מההצעה או ממחשבון. חשבו אותו עכשיו בעצמכם."
2. 3-3.mdx:166 - "כל תשלום שנשאר מהוונים להיום" (number agreement). → "כל התשלומים שנשארו מהוונים להיום".
3. 3-7.mdx:418 - "(המדד 2% בשנה, הפריים 1+ משנה 2)". → "(המדד עולה 2% בשנה, והפריים עולה בנקודת אחוז מהשנה השנייה)".
4. 3-10.mdx:60 (section title) - "מערך נוכחי לשיעור תשואה פנימי" reads as "מערך" (array/arrangement). → "מהערך הנוכחי לשיעור התשואה הפנימי".
5. 2-4.mdx:380 - feedback built with `+ "ועוד: " +`, ending in "ועוד: האחוזים לא מודדים אותו דבר. 3% ריאלית...". → one sentence: "ציר 1 לבד לא מספיק: האחת לפני אינפלציה והשנייה מעליה, ובלי ציר 2 משווים פינות שונות. 3% ריאלית יכולה להיות יקרה מ־5% לפני אינפלציה, אם האינפלציה גבוהה."
6. 2-4.mdx:365 (2.4-5) asks two things in one sentence ("מה הריבית האפקטיבית לשנה, לפני אינפלציה — כלומר, מה צריך לכתוב בחוזה...") and mixes "אפקטיבית" with "לפני אינפלציה". → ask one: "איזה אחוז, במסלול לא צמוד שבו הריבית מצטרפת פעם בשנה, יעלה לכם בדיוק אותו דבר?".
7. 2-7.mdx:395 and :478 - `unit="נקודות"` collides with "נקודות אחוז". → `unit="נקודות עדכון"`.
8. 3-8.mdx:462 - a numeric exercise ends with "האם Mogi תדגיש אותו?" which the field cannot answer. → move it to the solution only.
9. checks/3.mdx:187 - "שנמשכת 20 שנה": AUTHORING bans "נמשכת". → "שנגמרת אחרי 20 שנה".
10. 2-9.mdx:166 - "חודש 102, קצת אחרי השנה השמינית": year 8 ends at month 96. → "חודש 102, באמצע השנה התשיעית".
11. "N שנים" vs "N שנה" is mixed: running text "20 שנה" (the course style) but "20 שנים" 3-2:265 (15 שנים), 3-3:351 (12 שנים), 3-7 builder card (30 שנים), 2-10 component (20 שנים, 10 occurrences). → pick "שנה" after 11+ everywhere.
12. 2-12.mdx:40 - "הריבית עצמה פועלת על החוב, אבל שום דבר בה לא זז" is cryptic in the table (also 2-12:150 "ריבית פועלת על כל חוב"). → "הריבית עצמה, כמובן, נצברת על החוב, אבל אחוז הריבית לא זז".
13. 3-5.mdx:231-235 - formula lines mix a Hebrew label and an LTR formula; read right to left they are correct ("I = r × היתרה אחרי ההצמדה"), but on the left-to-right eye they look mirrored ("… × r = I"). → put the symbol first as its own LTR line, label in the `dd` (as 3-4 does).
14. 3-5.mdx:368 - ChoiceExercise options contain typed dates ("16 באפריל 2027", "1 במרץ 2027"); every other number is a fact. → add `ex2.alt_a`, `ex2.alt_b` facts (or `day()` of existing ones).
15. Date style: body attributions use ISO ("אילון אישר ב־2026-10-07") next to Hebrew long dates ("נכון ל־9 באוקטובר 2026"). → one style in running text (Hebrew).
16. 2-6.mdx:397 - "אפשר לפרוע את המסלול מוקדם בלי קנס גדול" without "(לא אומת)" - the same claim is marked at 2-6:131 and 394. → add "(לא אומת)".

### B-8. Phone layout (390 x 844, Chromium 1194, all 26 pages scrolled to hydrate)
- No horizontal page scroll on any of the 24 lessons and 2 checks (`scrollWidth` 390; 0 elements outside the viewport that are not inside a scroll box). No page errors. No `NaN`, `undefined`, `[object` or `${` in the built text.
- Tables that scroll inside their card (the "יש עוד עמודות משמאל" hint is present and visible on all five): 2.2 (the 5-column check table, 404 vs 356px: the column "חוב בסוף השנה" is cut, and the text at 2-2.mdx:154 sends the reader to "העמודה האחרונה"), 2.3 (365 vs 356), 2.8 (576), 2.9 (576), 2.10 (512). → for 2.2 use the 2.5 table classes (`text-caption sm:text-body-m`, `pe-2`) so five columns fit; 2.8-2.10 are fine as scroll tables.
- Tap targets: `<summary>` ("מה הייתם אמורים לראות", "תקועים בחודש 1?", "התסריט המלא") is 20px high on 24 of 24 lessons (324-332px wide); the header link "קורס המשכנתאות" is 44px high but 36px wide. → add `min-h-11 flex items-center` to the `<summary class="cursor-pointer ...">` in the shared "מה הייתם אמורים לראות" snippet and in `LessonVideo`. All sliders are at least 44px; radios sit inside full-width labels; the inline glossary buttons (29px, `cursor-help`) are inline text and I did not count them.
- Visual spot checks at 390: 2.3 table, 2.2 table, 3.5 table (A-2), 3.4 prediction card, 3.10 formula box, 2.11 formula lines: nothing else wrong.

### B-9. Videos (24 VTTs, 8 key frames)
- Numbers: every number in every cue appears in the lesson's data or page (script check; 0 unmatched). I recomputed 25 cue numbers by hand/Decimal (for example 2-2 15,422.76 and 15,861.15; 2-6 493,887.20, 3,970.25, 254.84; 2-9 3,893.74 / 334,499.54 / 289,200 / 45,299.54; 3-1 1.97039506; 3-4 4,016.41, 4,213.50, 29,442.14; 3-6 3,538.86 and the equal-principal 3,791.66 → 4,208.33; 3-7 5,347.05 for the "average loan"; 3-10 1.0076%, 12.78%): all agree.
- Frames checked (existing PNGs): 2-4-t094, 2-9-t100, 2-12-t089, 3-1-t080, 3-5-t094, 3-8-t076, 3-10-t090, 3-11-t084. Direction right (RTL axes, years from the right), nothing clipped, bottom band clear, numbers equal the VTT. Notes: 2-4-t094 shows two cards both labelled "ציר 1" (the two ends of axis 1; clear while the cue is spoken, odd on a still); 2-12-t089 is mid-animation (cards still empty) - fine.
- Wording: no banker name, no Brain/FK ids, no lock/pass wording in any cue. "נומינלית" in 2-3 (00:01:35) is meaning 2, in 2-4 it is quoted deliberately; "חוזית" at 2-4 00:02:17.
- 3-9 cue 00:01:46 speaks the quote "אילון: ... (ממתין לאישור אילון)" - a status label read aloud as narration. → cut the parenthesis from the cue.

---

## Part C. The numbers

103 independent recomputations in plain Python `Decimal` (no import from `src/`; my own annuity, equal-principal, grace and bullet schedules with the course's statement rounding: interest per month half-up to the agora, payment rounded once, last payment closes). All agree with the pages, except two that differ by design (see the end). Scripts: `<scratchpad>/read23/verify.py`, `verify2.py`, `verify3.py`.

Repeated across lessons (same figure, recomputed once, compared in every place):
- 600,000 at 4.8% for 240 months: payment 3,893.74 (2.9, 2.10, 3.1, 3.2, 3.3, 3.4, 3.9, 3.10), last payment 3,895.68, total 934,499.54, interest 334,499.54 (2.9, 2.10, 3.2, 3.4, 3.9), 35.8%, balances after 60/120/180 payments 498,933.29 / 370,513.81 / 207,338.76 (2.9, 3.3), first month below 300,000 = month 148, crossover with equal principal = month 102, equal-principal interest 289,200 (2.9, 3.4), principal overtakes interest in month 68 (3.2), principal component doubles at month 175 = 2,991.86 (3.2), 30 years: 3,147.99 and 533,278.18.
- Grace 12 months on that loan: 4,016.41 / 4,213.50 / 629,442.14 / 29,442.14 (2.10 and 3.4 identical), bullet-full last payment 1,564,020.10, "100,000 at 6% for 60 months" 134,885.02.
- 400,000 at 5.4% for 180 months: 3,247.15 (2.9, 3.1, 3.12); 3.12's last payment 3,246.15.
- Indexation and compounding: 100,000 × 1.02 × 1.03 = 105,060 (2.3, video) and break-even 1.94%/1.95% (2.3, check 2); 500,000 × 1.02 × 1.03 − 30,000 = 495,300 (2.11, video, check 2 form); 3,327.59 × 1.02 = 3,394.14 and × 1.02^10 = 4,056.31, 3,959.73 / 1.02^10 = 3,248.36 (2.5, video); 100 × 1.025^5 = 113.14 (2.5); 400,000 × 100.3/100 = 401,200 → 1,003.00 → 2,225.05 → 399,977.95, months 2-3 (3.5, video); first-month payment 3,333.09 in 3.8 equals 3,327.59 × 1.02^(1/12), and 3.9's 3,333.09; interim interest 361.64 / 295.89 / 306.85 (3.5).
- Later stages that reuse the same engine, recomputed from scratch: stage 5.10 (three 3-track mixes: first payments 6,661.71 / 6,620.25 / 6,587.07, totals 1,998,513.48 / 1,986,068.36 / 1,976,116.18), 5.4 exercise 6 (300,000 at 4% → balance 261,313.86 after 60 → 1,681.54 at 4.7% for 240; the wrong answer 1,482.29), check 7 grace (3,493.33; 1,018,156.99), 3.11's grace example (628,715.91; PV at 5% 299,999.97) all agree.
- Formulas and tables: half-rate table in 3.2 (4.63 / 3.47 / 2.78 / 2.31%), IRR 1.0076% monthly → 12.09% / 12.78% (3.10), 4.8071% for the 360 ₪ fee, 4.907% (1.004^12 − 1), 3.11's PVs at 3% and 9%, 2.2 exercises 5-6 (10,908.74; 11,114.56), all prime/anchor tracks in 2.6/2.7/3.6/3.7.
- By design, not errors: 2.6 `left_60` 493,887.20 and 2.7 `left_60` 415,022.58 are formula balances rounded once (the callouts at 2-6:106 and 2-5:90 say so); the statement convention gives 493,887.00 and 415,022.62. Say "בקירוב" or add the 20 agorot to the callout if a learner checks them in the course's own builder.

Everything printed that I checked in the exercises' `errors` arrays (the "wrong answers") equals what the named mistake produces.

**Units.** No numeric exercise has a wrong or missing `unit` (all shekel answers use the default; `%`, `חודשים`, `נקודות` where used are right). Two units to refine: B-7.7.

**Answer keys.** Spot-checked 30 numeric and 12 choice answers by hand: no wrong key, no ambiguous one; two ambiguities in the wording of the question (B-7.6, B-7.8).

---

## Part D. Cross-stage dependencies (what later stages assume from here)

| Later stage | Assumes | Taught here? |
|---|---|---|
| 4.3 (payment-to-income) | first payment, payment after grace, bullet = monthly interest (3.8, 2.10:165); "זעזוע ריבית" | Yes, but "זעזוע ריבית" is only defined in 4.3 (B-1.1) |
| 4.4, 4.5 | "שליש באחוז קבוע" (1.4), "שני שלישים שיכולים לזוז" (2.6:123, 2.7:500) | Yes, flagged לא אומת |
| 5.1, 5.3 | "החזר מרבי חזוי", "סך תשלומים חזוי", "ריבית כוללת חזויה" (3.8-3.10 forward-link with Later) | Yes; 3.8 defines the first, 3.9/3.10 point to 5.3 |
| 5.4 | forecast = rule-based, not a promise (3.8); reset points (2.7) | Yes |
| 5.5 | "ריבית חוזית" vs "נומינלית" (0.4, 0.8, 2.4) | The word is used from 0.4 but defined in 5.5 (B-1.3) |
| 5.6-5.10 | one loop per track, mix cash flow, exposure % (3.6, 3.7); statement rounding (3.12) | Yes |
| 7.1-7.6 | balance after k payments (3.3), exit stations (2.7), "עמלת היוון" (forward-linked at 2.5:155, 2.6:131, 2.7:176) | Yes; 2.5-2.7 give only "an amount that can be large" before 7.2 |
| 8.x (algorithm) | no one-formula-for-a-mix (3.7), the loop (3.6) | Yes |
| 9.x | IRR/PV/total are different questions (3.11) | Yes |
| Every stage | the course rounding rule | Taught in 2.2 (annual), 3.1/3.2/3.12 (statement); 2.5-2.7 use formula rounding on purpose, which the later "Every equality printed must hold" rule does not forbid but the reader may trip over |

Also seen outside the slice while checking references (not part of this report, but found): `src/pages/lessons/1-10.mdx` carries 57 "J-0xx / FK-H-0xx / דף 5898285" ids in its `source:` fields, and 1-1, 1-2, 1-6, 1-7, 1-8, 1-9 carry some more; `ExamPaper.vue:295` and all stage checks use the same "אין ציון עובר, ושום שלב לא ננעל" sentence.

---

## Scratch files (session scratchpad, not in the repo)
`/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/read23/`: `verify.py`, `verify2.py`, `verify3.py` (the Decimal recomputation), `phone.mjs`, `shot.mjs`, `hint.mjs` (390px checks), `dist/` (the scratch build), `phone-all.json`, screenshots `t22.png`, `t23.png`, `t35.png`, `f310.png`, `f34.png`, `g211.png`, `g35*.png`, `tc.png`.
