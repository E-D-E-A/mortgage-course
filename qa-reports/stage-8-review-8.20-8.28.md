# QA report: lessons 8.20–8.28 and the workshop downloads, read as a beginner

Date: 2026-10-17. Reviewer: first-round QA (round 3 of stage 8). I edited no source, lesson, component, data, script or research file. This report is the only file I wrote. My scratch files (own build, Python recomputations, Chromium scripts, contact sheets, recalculated spreadsheets) are in `/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/r3/`.

**The reader:** someone who finished stages 0–7 and 8.1–8.19, and now meets: estimate against bank offer (8.20), the full pipeline (8.21), where the data comes from: event log, shadow and assisted mode (8.22), training and testing (8.23), drift and maintenance (8.24), human steering and field knowledge as a hypothesis (8.25), consent, privacy and the LLM rule (8.26), the map of all variables (8.27) and the workshop "a small engine in a spreadsheet" (8.28).

**What I read:**
- the nine MDX files in full (`src/pages/lessons/8-{20..28}.mdx`), and the built pages from my own build (`pnpm astro build --outDir <scratch>/r3/dist`, 130 pages; the first attempt died with an Astro internal error `Cannot read properties of undefined (reading 'setInternals')` after the vite stage, the identical command a minute later built clean, so I treat it as transient);
- `public/video/8-{20..28}.he.vtt` (all cues) and **all 143 key frames** `qa/video/8-X-t*.png` (contact sheets; full-size crops where something looked wrong);
- `data/lessons/8-{20..28}.json` (every fact), `src/data/definitions/8-2x.json` (only 8.20–8.24 exist; the map lists no new term for 8.25–8.28), `course/AUTHORING.md`, `course/stage-8-brief.md`, `course/course-map.md` (stage 8), `research/field-knowledge.md` (DEC-1 to DEC-4, the DEC-3 table of the 15 rules, FK-H-012/054/055/057/071/073/081), `research/notes/brain-product-journey.md` (consent, modes, LLM rule);
- `src/components/big-picture/stage-8.ts` (15 nodes, 30 links, the `LAYER` for 161 nodes) joined to the cards of all earlier stages, `MapOfVariables.vue`, `DriftDemo.vue`, `PipelineFlow.vue`, `SplitDemo` as rendered;
- `src/lib/calc/drift.ts`, `splits.ts`, `ranking.ts`, `src/data/case-s8.ts`;
- the three downloads `public/downloads/engine-workshop-{template,solution}.xlsx` and `engine-workshop.ipynb` (every cell, formula and comment), `scripts/build-engine-workshop.py`.

**Method and result of the checks:**
- **Independent maths** (plain Python `Decimal`, nothing imported from `src/` or `checks/`): the statement-rounding schedule for 8.20 (estimate and offer totals, first payments, stress maxima, 60 against 84 months reset), the 8.21 totals and approval probabilities of all six runs, the 8.22 agreement and capture lags, the 8.23–8.24 synthetic series (my own 32-bit LCG: 60 months, 5 random splits, time split, errors, bias, RMSE, spread 0.9892, baseline 0.0492, alarm at month 39, four retraining windows, version 2 spread 1.1083), the 8.25 groups and percentages, and the whole 8.28 engine (66-candidate grid, 10 constraints, dominance, normalisation, scores, 5 input sets). **Every number printed in the nine lessons matches.**
- **Every `=` in the built pages** (24 equalities parsed): **all hold, except** `3 × 0.0492 = 0.1475` (printed three times in 8.24: M-8).
- `pnpm check:terms` passes; `python3 -I checks/independent_check.py` passes (all stage kinds); `stage-8.test.ts` passes (7 tests); `python3 build-engine-workshop.py --verify` (run in a copy of the tree, not in the repo) passes and regenerates the three downloads **byte-identical** to the repo files.
- **Browser** (Chromium, `he-IL`, stage gate opened through `localStorage`, islands hydrated): 390px and 1280px for all nine pages, no horizontal page scroll, no console error or warning; DriftDemo driven through the lesson's three tasks; SplitDemo, MapOfVariables read.
- **Not done:** I could not open the Brain (not reachable here), so "what the team recorded" is checked against `research/field-knowledge.md` and `research/notes/*.md`, which quote it. I did not open the xlsx in Excel or Google Sheets (LibreOffice 7-class headless recalculation only) and did not run the notebook in Colab (I ran its code).

**Result: 3 blockers, 12 major, about 45 minor.** The numbers and the labelling frame (the היום/הוחלט/עתיד box in every lesson, "להדגמה", fictional banks, "לא ידוע" for how banks price and for the law) are in good shape; the stage-7 lesson learned is visible (no unlabelled bank mechanics, no legal conclusion in the central sentences). What is wrong is (1) a statistical reading in 8.25 that the printed numbers contradict, (2) a guided task in 8.24 whose stated observation does not occur, (3) two sentences in 8.26 about consent that the team's record does not say, and a cluster of internal inconsistencies in how the three labels are applied (8.22, 8.27), plus a workshop whose instructions do not match its template.

---

## Blockers

### B-1 · blocker · 8.25 teaches "the difference is small compared with the spread" about numbers where it is 1.6–2 times the spread, and the course's own method (8.18) says the interval excludes zero
- **Where:** `8-25.mdx:145` ("ההפרש קטן ביחס לפיזור. הפיזור בכל קבוצה (0.0854 ו־0.1057) גדול בחצי מההפרש בערך"), `:203` (formula box: "הפרש קטן ביחס לפיזור… לא מכריע"), `:235` (worked example step 5), `:252/:254` (MatchTable rows), `:340` (exercise 8.25-5, the keyed answer), video cue 11 (`8-25.he.vtt` 1:41–1:51 "אבל קטן ביחס לפיזור. עדיין פתוח") and frames `8-25-t096`, `8-25-t106` (caption "קטן ביחס לפיזור, ומעט הצעות: עדיין פתוח").
- **Check (mine):** groups 1.10/1.25/1.15/1.30/1.20/1.05 and 1.35/1.20/1.45/1.30/1.50/1.25: means 1.1750 and 1.3417, difference −0.1667; the lesson's spreads are **population** standard deviations (0.0854, 0.1057, as 8.3 teaches); the difference is **1.95 and 1.58 times** those, not "small". The sentence "גדול בחצי מההפרש" can be read either way and is true on neither reading (the spread is about half to two thirds of the difference, so the difference is about twice the spread).
- **The method the stage already taught contradicts the verdict.** 8.18 (`8-18.mdx:124`) compares two groups with the unpooled standard error and "דרגות חופש: קטן מבין שתי הכמויות פחות אחד". Applied here: sample SDs 0.0935 and 0.1158, standard error 0.0608, 5 degrees of freedom, t = 2.571, 95% interval **−0.323 to −0.010: it excludes zero**, exactly the criterion 8.20 uses to say "יש סימן להטיה". The lesson says "עדיין פתוחה" and cites 8.18 ("רווח סמך מתרחב") but never computes the interval.
- **What is defensible and what is not.** "Open" is a fair conclusion for the reasons in lines 146–147 (six offers, other factors such as financing ratio or bank may differ), and the interval barely clears zero. "The difference is small compared with the spread" is not a fair reason, and a learner who checks it against the line above it (the numbers are printed) will see it is false.
- **Fix:** state the real picture and let the other two reasons carry the verdict: "ההפרש, 0.17 נקודות אחוז, גדול בערך פי שניים מהפיזור של כל קבוצה, והקבוצות חופפות (הצעה אחת מעל הסף נמוכה מכמה מתחתיו). לפי השיטה של שיעור 8.18 הטווח של ההפרש הוא −0.32 עד −0.01: הוא בקושי לא כולל אפס. ועדיין ההשערה פתוחה: שש הצעות בכל צד, וייתכן שהן שונות בגורם אחר". Make the interval a fact (via the estimate module) and change exercise 8.25-5, the formula box, cue 11 and the two frames accordingly. Say which standard deviation is used (n or n−1) where the interval is computed.

### B-2 · blocker · 8.24 task 3 expects a "false alarm" that the component never shows, and a false alarm cannot be produced with the lesson's instructions
- **Where:** `8-24.mdx:171` (task 3: "הורידו את הרגישות ל־2 והגדילו את הרעש. מצאו התראת שווא") and `:178` ("ברגישות נמוכה ורעש גבוה ההתראה נשמעת לפני חודש השינוי. ״התראה לפני השינוי״ מוצגת בכרטיס").
- **Check in Chromium (`DriftDemo`, default change month 37, jump 0.25):**

| setting | alarm month | card text |
|---|---|---|
| default | 39 | 2 חודשים אחרי השינוי |
| sensitivity 2 | 38 | 1 חודשים אחרי השינוי |
| sensitivity 2, noise 0.03 / 0.04 / 0.05 | 38 / 39 / 39 | after the change, every time |
| jump 0.05 or 0, sensitivity 3 | none | אף פעם |

  Task 1 (jump 0.60 → month 37, "בחודש השינוי") and task 2 (jump 0.10 → month 57, 20 months late) are right.
- **Wider check (my replica of the generator over the sliders' whole ranges: 29 change months × 10 jumps × 5 noises × 9 sensitivities (2–6) × windows 2–8):** with a window of **4 to 8 months** (the default is 6) **no setting of the component ever produces an alarm before the change month**. A false alarm exists only with window 2 (change month 48 or later: an alarm at month 47 caused by noise) or window 3 (change month 49 or later), and only at the lowest sensitivities. The lesson's central teaching about a threshold that is too low ("מצלצל על רעש", `:98`, exercise 8.24-7) therefore cannot be seen in the "required" illustration by following its own task.
- **Fix:** either change task 3 to what works ("הורידו את הרגישות ל־2 וקצרו את הממוצע הרץ ל־2 חודשים, והזיזו את השינוי לחודש 55: מצאו התראה לפני השינוי") and rewrite `:178`, or let the generator's noise matter more (a noise slider range that can reach a false alarm at window 6). Also correct the card grammar "1 חודשים אחרי השינוי" (`src/components/DriftDemo.vue:101`: use "חודש אחד").

### B-3 · blocker · 8.26 misreports a recorded team principle on consent, and one sentence reads as a legal conclusion
- **Where:** `8-26.mdx:88` and `:118`.
- **(a) The 2026-08-12 principle.** The lesson (`:88`): "העיקרון שהצוות רשם (12.8.2026): שימוש בנתונים שמקורם בלקוח, אם בכלל יותר, יהיה בהסכמה נפרדת ורשות, לעולם לא תנאי לשירות, עם רישום הסכמה לכל לקוח בגרסאות". The record the course was written from (`research/notes/brain-product-journey.md:590`, same wording in the Decisions rules page summary) says: "**Sell** what is lawfully allowed incl. customer-derived data, under separate optional consent, never a condition of service; per-customer versioned consent record from day one (2026-08-12)". The principle is about **selling / commercial use of customer-derived data, where the law allows it**. The lesson turns it into "use of data… if at all more" and drops the word the whole principle is about. A learner who reads the lesson believes the team decided something about learning from files; a learner who knows the record sees a decision paraphrased away. In a lesson whose job is to say exactly what is decided and what is not, this is the one place the label must be exact.
- **(b) The suggestion "לתעד הכול".** `:118`: "הצעה של הקורס… אפשר לתעד הכול ביומן ולא ללמוד ממה שאין לו הסכמה ברורה. תיעוד בלבד לא קובע שום דבר למי שיגיע אחר כך". This assumes that recording personal data is legally neutral. The lesson itself says (`:85`) that data collected meanwhile "אולי יצטרכו להימחק", the prediction note of 8.22 (`8-22.mdx:249`) warns that collecting everything "מעלה שאלות על הסכמה ועל פרטיות", and the "מחיקה" bullet (`:89`) says what a deletion would have to reach. So "documenting everything settles nothing" is a legal reading, and it contradicts the caution two lessons earlier.
- **Fix (a):** "העיקרון שהצוות רשם (12.8.2026): מכירה או שימוש מסחרי בנתונים שמקורם בלקוח, ככל שהחוק מתיר, יהיו בהסכמה נפרדת ורשות, לעולם לא תנאי לשירות, עם רישום הסכמה לכל לקוח בגרסאות. אם גם למידה של האלגוריתם נכללת בעיקרון הזה: לא נקבע, שאלה לעורך הדין." If the Brain page's original wording is softer than my notes, quote the page's own sentence; I could not open it.
- **Fix (b):** "עד שיש תשובה: ממשיכים לרשום את מה שהשירות עצמו דורש, ולא משתמשים בנתונים ללמידה. האם מותר לרשום מעבר לזה: שאלה לעורך הדין." and delete "תיעוד בלבד לא קובע שום דבר".

---

## Major

### M-1 · major · 8.22: the same sentence is "הוחלט" in the sort and "לא הוחלט" in the lesson
- **Where:** `8-22.mdx:41` (card 7: "כשמצב נקבע ל־״צל״, שום דבר שהתוכנה הפיקה לא מגיע ללקוח או לבנק" → bin "הוחלט"), `:36` (card 2: "שמות המצבים הוחלטו. **רק השמות.**"), `:57` (callout: "הוחלט: שמות ארבעת המצבים"), `:138` ("שם המצב הוחלט; מה שנאמר מכאן הוא ההגדרה של הצוות והתכנון"), `:219` (answer to task 2: the shadow rule "הוא הגדרה שהצוות קבע… על הראשון נשענים"), Sources `:445` ("לא אומת… כפי שתועד… לא נבדק מחדש").
- **Problem:** the lesson says three times that only the names of the modes are decided, then asks the learner to file "nothing reaches the client in shadow mode" under "הוחלט" and says the keyed reason is "זו ההגדרה אצל הצוות", with a source of kind "לא אומת". Whether the shadow rule is a decision (it may well be: the notes record the four modes "flipped by PR on their agreement rate", 2026-08-23/24, and the lesson's source cites the meetings of 29.7 and 19.8) or a team definition not yet confirmed, the learner cannot tell from this page which bin is right. That is the exact skill the sort teaches.
- **Fix:** pick one. If it is decided, extend `:57` ("הוחלט: שמות המצבים והכלל של מצב צל: שום דבר שהתוכנה הפיקה לא מגיע ללקוח או לבנק לפני אישור של אדם (כפי שתועד, 19.8.2026)"), change card 2's "רק השמות", and the Sources kind. If it is only a documented definition, move card 7 to "עתיד" with the reason "הגדרה של הצוות, לא החלטה", and fix `:219`.

### M-2 · major · 8.22 exercise 8.22-6 has two correct rows
- **Where:** `8-22.mdx:395` (question), options `:389–392`.
- **Check:** the three log rows are (opened 2026-03-02, recorded 03-02), (income data: happened 03-04, **recorded 03-09**), (bank answer: happened 03-18, **recorded 03-21**). For the date 6 March, **both** the income row and the bank-answer row are not yet recorded, so both must be hidden from the software. Option 3 ("שום שורה, כי כל השורות כבר קרו עד ה־6 במרץ") is wrong for a stronger reason than its feedback gives, and the question "איזו שורה אסור שתהיה גלויה" has two answers.
- **Fix:** ask "אילו שורות אסור שיהיו גלויות", or, simplest, ask about the income row only: "איזו שורה קרתה לפני ה־6 במרץ ובכל זאת אסור שתהיה גלויה?".

### M-3 · major · 8.23: the explanation of why the "זוכר" model collapses in the time split points at the wrong cause, and the leakage claims are stated as laws
- **Where:** `8-23.mdx:141` ("בנתונים האלה הבנק הבדוי משנה את התמחור שלו בחודש 37… בהגרלה, חודשים אחרי השינוי נמצאים גם באימון, ולכן הבדיקה לא מגלה את הבעיה"), exercise 8.23-7 (`:361`, `:367`), `:139` ("התוצאה היא שגיאה נמוכה מדי, שלא תחזור"), `:386` (summary: "הגרלה מקילה כשהנתונים תלויים בזמן"), video cues 9–12.
- **Check (mine, replica of the series with the change month moved out of reach, jump 0):**

| | random draws 1–5 (spread / memory) | time split (spread / memory) |
|---|---|---|
| lesson's series (jump 0.25) | 0.117–0.132 / 0.071–0.102 | 0.229 / 0.356 |
| same series, no change at all | 0.042–0.061 / 0.071–0.088 | 0.069 / **0.356** |

  The "זוכר" model's time-split error (0.3561) is **identical with and without the pricing change**: month 42, the last training month, is already after the change, and the model simply repeats month 42's offer while the anchor wanders. What breaks it is that it deliberately ignores the anchor (the lesson says so at `:94`), not the month-37 change. With no change, the simple model's random and time errors are close (0.04–0.06 against 0.069), and it beats the "זוכר" in the random draws, so "גם המודל הפשוט מושפע" (`:139`) also depends on the built-in break.
- **Problem:** the lesson tells the learner that the random split "does not reveal the problem" because post-change months are in the training set, and exercise 8.23-7 keys that as the reason for the "זוכר" model. For that model the reason is the neighbours-in-time effect (correctly stated at `:135` and in the frame `8-23-t097`), not the break. And the closing sentences generalise one synthetic series, one extreme model and five seeds into "random split makes it easier / error too low".
- **Fix:** keep `:135` as the main explanation; attach the break only to the simple model ("המודל הפשוט נפגע כי המרווח השתנה באמצע"); rewrite 8.23-7's stem and key accordingly ("למה המודל ה״זוכר״ נראה טוב בהגרלה?" → "לכל חודש בבדיקה יש שכן באימון משני צדדים"); and in `:139` and `:386` say "בסדרה הזאת, ובדרך כלל כשהנתונים תלויים בזמן", and say once that the gap depends on the series (with no change at all the simple model's two numbers are close).

### M-4 · major · 8.22–8.26 name FK ids and a repo inside learner text
The brief and AUTHORING: "learner text never shows Brain page numbers, J-codes, DEC-n, FK ids, file paths or repo names (they go in code comments and the Eylon file)". Found in the built pages:
- `8-25.mdx:136` ("FK-H-012"), `:153` ("FK-H-073… FK-H-055… FK-H-081"), Sources `:411–412` (four more): 8 occurrences, three of them in the running text of part 2.
- `8-24.mdx:410` (Sources, "FK-H-054").
- "בריפו" (repo) in `8-22.mdx:443` and `8-26.mdx:369` (Sources); the stage-7 report asked for "אצל הצוות".
- The two downloads: `docProps/core.xml` of both xlsx files carries "Mogi course (scripts/build-engine-workshop.py)" as the author, visible in File → Properties (a file path in a learner file).
- **Fix:** "(אילון, 27.7.2026; ידע מהשטח, ממתין לאישור אילון)" in the text and Sources; move the ids to the closing `{/* … */}` comment of each file (they are already in the 8.25 and 8.24 comments); "כפי שתועד אצל הצוות"; set the xlsx creator to "Mogi" in the script.

### M-5 · major · 8.26: the correct option of the prediction contradicts the lesson
- **Where:** `8-26.mdx:22` (option 3, keyed correct, `:174`): "הקורס לא יודע: זו שאלה משפטית שפתוחה אצל עורך הדין, **ולכן יודעים בדיוק אילו נתונים נרשמו ובאיזו הסכמה**".
- **Problem:** the second half is a non sequitur and false: the lesson says the consent-tag values "עוד לא הוגדרו" (`:87`, exercise 8.26-3) and that consent for learning is not defined. The key is also the longest option by far, so the learner picks it on length. The callout above the prediction (`:40`) already says the questions are with the lawyer, so the prediction is answered before the lesson.
- **Fix:** "הקורס לא יודע: זו שאלה משפטית שפתוחה אצל עורך הדין", and move the sentence about the lawyer out of the callout or reword the callout ("שאלות על שימוש בנתונים ובטכנולוגיה נמצאות בחבילת שאלות פתוחה").

### M-6 · major · 8.25: "רוב השינויים הם על הלקוח" while the table says 40%
- **Where:** `8-25.mdx:114`: "רק בחלק מהשינויים (מדיניות ושטח) יש מה ללמד את התוכנה. רוב השינויים הם על הלקוח." Table lines `:104–108`: preference 8 of 20 = 40%, policy 5 = 25%, field 4 = 20%, mistake 1, unclear 2.
- **Problem:** 8 of 20 is not a majority; policy plus field (9, 45%) is larger than preference. The sentence is printed under the numbers that refute it. Also `:215` ("בעתיד, אדם מאשר בכל מצב חוץ מהאוטומטי") states as fact a plan that 8.22 says is undefined for "כבוי" and "צל".
- **Fix:** "הרבה מהשינויים (8 מ־20) הם על הלקוח", and "בעתיד, לפי ההגדרה של הצוות, אדם מאשר במצב מסייע".

### M-7 · major · 8.27: the layer defines "output" as what the algorithm computes, then tags the bank's own answers as output
- **Where:** `src/components/big-picture/stage-8.ts` (`RAW`): `approval` (תשובת הבנק בחיתום) `["o","b"]` "תשובת הבנק היא התשובה שממנה לומדים", `counter_offer` `["o","b"]` "תוצאה של משא ומתן", `pre_approval` `["o","b"]` "המוצר שהאלגוריתם מכוון אליו", `proposed_basket` `["o","o"]` (a basket the **bank** chooses to propose). Against `personal_offer` `["i","b"]` and `executed_deal` `["i","o"]` ("מה שקרה בפועל: התשובה שממנה לומדים"), and the lesson's definition `8-27.mdx:92` "פלט: מה שהאלגוריתם מחשב ומציג".
- **Problem:** a bank's answer is tagged input when it is an offer and output when it is an approval or counter-offer; the label the algorithm learns from is called its output. A beginner who applies the lesson's three questions ("קוראים או מחשבים?") to `approval` gets "input", the opposite of the map.
- **Fix:** `approval`, `counter_offer`: input (the answer of the bank, the label); `pre_approval`: outside or input; `proposed_basket`: control `bank`.

### M-8 · major · 8.24: a printed equality does not hold on the printed numbers (house rule)
- **Where:** `8-24.mdx:90` and `:223`: `<M>3 × 0.0492 = 0.1475</M>`, again `:294` in the solution of 8.24-2.
- **Check:** 3 × 0.0492 = **0.1476**; the 0.1475 comes from the unrounded baseline 0.049167. The solution at `:294` apologises in a parenthesis, the two worked lines do not. AUTHORING: "Every equality printed on a page must hold on the printed numbers."
- **Fix:** print the baseline to six places in the equality ("3 × 0.049167 = 0.1475"), or the threshold as 0.1476 (the alarm month does not change; I checked: the rolling mean at month 39 is above both).

### M-9 · major · 8.28 workshop: the step list contradicts the template, the offer cells are undocumented, the template's check tab never lights up
All checked in the downloads and in LibreOffice (see "The workshop" below for the full test).
- **Step 3 against the template.** `8-28.mdx:251`: "בשורה 89, הרשת: **כתבו** את הנוסחאות של עמודות E עד AM, כפי שבהערות בכותרות. אחר כך העתיקו אותן למטה עד שורה 154". In the template **row 89 is already filled in every column E–AM** (row 87 says so: "שורה 1 של הרשת מלאה כדוגמה… העתקה למטה"; `:240` says so too). The learner is told to write 35 formulas that are already there; the real task is "fill down", which is a different (much smaller) exercise. Only 9 header cells carry a comment ("כפי שבהערות בכותרות").
- **The offer comparison has no task.** Cells F13:F18 of the template (estimate, offer and gap, the step "בדיקה מול הצעה") are **empty and shaded grey**; neither the page's order of work (`:248–253`) nor the sheet's "הוראות" tab tells the learner to write them (the tab says "בתאים E4 עד F18 יש הצעה לדוגמה", which is true only of the solution). The six formulas are long (PMT with INDEX/MATCH over the bank list). A learner who follows the page never builds step 7's second half; one who tries has no hint.
- **The check tab.** The template's "בדיקה" tab ends with `A26` = "מלאו את הרשת, ואז כאן יופיע ✓" but columns B, D, F of the tab hold **no formulas** in the template: nothing will ever appear. (In the solution they work: 19 ✓.) The page's step 5 ("בלשונית ״בדיקה״, השוו למנוע של הקורס") is therefore a manual eyeball against column C, which also shows the answers (14, 6, `g40-0-60`, 7,941.62) before the learner builds anything.
- **Typo in the learner's instructions:** the "הוראות" tab, step 1 (`scripts/build-engine-workshop.py:474`): "…הורה **וכנס**" (should be "ובנק"; the page's own table says "הורה ובנק").
- **Fix:** (i) say what is true: "שורה 89 מלאה. העתיקו אותה למטה עד 154, ואז קראו כל עמודה בעזרת ההערה ובדקו שאתם מבינים מה היא עושה"; or empty some of E–AM in row 89 so that the learner writes at least the constraint columns and the dominance column (that would make it a build); (ii) add step 8 to the page and the tab: "מלאו F13:F18" with the formula of F13 given as the worked example; (iii) make the template's B/D/F formulas live (they reference the same cells as the solution's) so that A26 does what it says; (iv) fix the typo.

### M-10 · major · 8.28 exercises ask for nothing that needs the sheet, and the "calculator" sentence is wrong
- `8-28.mdx:370`: "תרגילים 2 ו־3 צריכים מחשבון": 8.28-2 ("כמה אפשריים אחרי המיצוב?"), 8.28-3 ("ההחזר הראשון של הנבחר") and 8.28-6 ("הפער בהחזר הראשון") are answered by **numbers printed in the lesson** (`:125`, `:202`, the table at `:225`); the solutions say "בתא B60 / B63". No calculator; none of them requires the learner to have built anything. Two are labelled "קל", one "מאתגר" (8.28-6, a number read from a table).
- **The product of the workshop is the learner's own sheet**, yet no exercise checks it. This is the same shape as stage 7's M-9.
- **Fix:** one exercise that needs the learner's sheet and a changed input the page never solved ("שנו את הבנק ל־c ואת המשקולות ל־10, 10, 80: מי נבחר, וכמה מועמדים אפשריים?": the answer is `g100-0-0` and 19, from my run), one that asks them to explain a rejected candidate from the reasons column; relabel the lookups "קל"; correct the sentence.

### M-11 · major · 8.28 video: the closing numbers put two unrelated cases side by side
- **Where:** frames `8-28-t112`, `t122`, `t131` (title "הנבחר, ואומדן מול הצעה": "החזר ראשון של הנבחר 7941.62" next to "פער מול ההצעה בהחזר הראשון −0.50"); cues 15–16.
- **Problem:** 7,941.62 belongs to the winner at **bank א׳** (40% fixed, 60% variable, 1,620,000). The −0.50 is the offer-against-estimate gap of **bank ב׳** at a different mix (50/50) and a different loan (1,640,000). Placed in two cards under one title, with the numbers shown as `7941.62` and `-0.50` (no ₪, no thousands separator, unlike every other frame), a learner reads "the offer for my winner is 0.50 lower".
- **Fix:** two titled cards ("הנבחר, בנק א׳" and "בדיקה מול הצעה של בנק ב׳, תמהיל 50/50"), amounts with ₪ and separators.

### M-12 · major · numeric exercises display "₪" for answers that are not money
`NumericExercise` defaults to unit "₪" (`src/components/NumericExercise.vue:28`, label `:93`). In this stage the default is left on: 8.20-6 (percentage points), 8.22-2 (a count), 8.23-2, -3, -6 (error in percentage points), 8.24-2, -6 (percentage points), 8.25-3, -4 (margins) and 8.28-2 (a count of candidates). The input is labelled "התשובה שלכם (₪)". The same finding was made for 8.10–8.19. Fix: `unit=""`, "נקודות אחוז", "מועמדים", "הסכמות".

---

## 8.20 — אומדן מול הצעת בנק

Clean maths (all of: 4.30/4.35, 4.70/4.65, 8,310.78 / 8,310.28, 2,991,877.66 / 2,991,699.94, −177.72, 9,323.51 / 9,323.10, 22,586.81 and 35.74 for reset 60 against 84, the eight pairs: mean 0.0575, sd 0.0271 (n−1), 95% interval 0.0348–0.0802; three pairs 0.0600, −0.0296–0.1496 reproduced). The rule (offer terms beat simulation defaults, Eylon 2026-10-07, Eden 2026-10-08, "המימוש לא הושלם") matches the note of the 15 answers. The four-kinds table and the MatchTable teach the right distinction.

### 8.20-1 · minor · the callout above the prediction states the answer
`8-20.mdx:44` ("הכלל שהוחלט… הצעת בנק… קובעת לפי התנאים של ההצעה") precedes the Prediction (`:53–58`) that asks exactly this. Move the rule below the video or phrase the callout without the rule. The callout (`:42–45`) also has no "Mogi היום" item (it says "אין היום ב־Mogi חישוב תמהילים" inside the paragraph); the other eight lessons have the three bullets.

### 8.20-2 · minor · task 2 does not get its answer
`8-20.mdx:197`: "מה היה קורה לממוצע אילו זוג 2… לא היה בנתונים? האם הטווח היה כולל אפס?" The answer (`:204`) says the mean stays positive and "הטווח רחב" but not whether zero is inside. Mine: seven pairs, mean 0.0514, interval 0.0305–0.0724: **still excludes zero**.

### 8.20-3 · minor · the direction of the 22,586.81 is the stress scenario's, not a law
`:156`: "ברירת המחדל הייתה מעריכה סך תשלומים גבוה ב־22,586.81… **רק כי** היא מניחה עדכון מוקדם יותר". True in the stress scenario (anchor up by 2 at the update). With a falling path the default would underestimate. Add "בתרחיש שבו הריבית עולה" (the table caption and the video cue 13, "ברירת המחדל הגזימה ב־22,586.81 ₪", have the same gap).

### 8.20-4 · minor · "we"
`:62` and the video title ("ומה אנחנו חשבנו"), `:105` ("נחזור"): the brief asks for plural address. Say "ומה חישב המודל", "חזרו לתיק".

### 8.20-5 · minor · exercises
8.20-2, -3, -4 are single subtractions with both numbers in the stem (קל, בינוני, בינוני). The correct option is the longest in 8.20-1, -7, -8.

### 8.20-6 · minor · phone (390px)
The estimate-against-offer table (`:107–126`) scrolls inside its box and hides its last column, **"ההפרש (הצעה פחות אומדן)"**, the column the paragraph below discusses; the sign of "−177.72 ₪" is cut. Put the gap column right after the row label, or show cards below 640px.

### 8.20-7 · minor · video
Frame `8-20-t066`: the "₪" glyph of the estimate overlaps the label "סך תשלומים" (row 4). Frames and cues carry the rule label ("הכלל שהוחלט", cue 12) but not "המימוש לא הושלם".

---

## 8.21 — הצנרת המלאה

Maths clean: I recomputed the totals of all six runs from their tracks and rates (b parent 2,774,823.18; a 2,842,763.32; c parent 2,869,955.74; c asked 2,907,924.54; b asked 2,859,881.93; the offer 2,835,704.62, first 7,876.96), all six approval probabilities by the logistic of 8.19 (0.4946, 0.5759, 0.5005, 0.5807, 0.4923, 0.5695) and the ranks (b, a, c, d refused; after the offer b, c, a). The labelling of the invented bank lines ("חוקים של התרגיל", `:117`) and of the LLM rule ("החלטה של Mogi, 29.7.2026") is exact.

### 8.21-1 · minor · a garbled sentence in "המקרה"
`8-21.mdx:117`: "הילדים של הסדנה הם התיק של נועם ושירה" (the children of the workshop are the case…). Meant "המקרה של הסדנה". A beginner cannot parse it.

### 8.21-2 · minor · the number of stages is six, seven and six
Heading `:93` "שבעה שלבים", the list has 7 items (the seventh is "הצעה אמיתית"), `:99` says "ארבעה שלבים של חישוב, ואחריהם דירוג והסבר" (six), the video title "שישה שלבים, לכל בנק" and cue 2, and exercise 8.21-1 six. Say "שישה שלבים, ובשלב שביעי הצעה אמיתית מחליפה את האומדן".

### 8.21-3 · minor · money without separators or ₪ in two tables
`:174–175`, `:233` print `{f.raw(...)}`: "2842763.32", "7896.58" (see the 390px screenshot): AUTHORING says tables use `formatShekels`. Seven-digit numbers without commas are hard to read and differ from the ranking frames of the video.

### 8.21-4 · minor · "typed" number and an imprecise threshold
`:301` (task 4's answer): "מעל הסף שבו שלושת הבנקים מאשרים בסיכוי של בערך חמישים ושבעה אחוזים, כולם נופלים לקבוצה השנייה". The three chances are 0.5695, 0.5759 and 0.5807 (57%, 58%, 58% in the table); all three fall below the threshold only above 0.5807, i.e. at 0.59 on the slider (at 0.57 only bank ג׳ falls, at 0.58 banks ג׳ and א׳). The number is also typed in words, not from a fact.

### 8.21-5 · minor · "הצעה היא אישור"
`:258`: "הצעה היא אישור: ההסתברות הופכת ל־100%". It is the model's assumption (an offer is valid for its term, 8.20); say "בצנרת מניחים: הצעה תקפה היא אישור".

### 8.21-6 · minor · labels in the video
Footer on every frame: "נתונים סינתטיים · להדגמה: לא החלטה של Mogi ולא מדיניות של בנק", including frame `8-21-t033`, which states the LLM rule ("מודל שפה רק מסביר"), a decision of Mogi (cue 5: "המודל מסביר. הוא לא מחשב ולא מחליט", "המודל" is ambiguous in a stage full of pricing and approval "models"). No frame or cue says "עתיד" or that no mix calculation exists today. Same gap in the video of 8.23.

### 8.21-7 · minor · jargon and "we"
"נתיב הכתיבה" (`:508`, again `8-26.mdx:32, :126`) is not explained anywhere in the course ("write path" is team vocabulary). `:258` "מה שחזינו", `:360` "נעקוב". Exercises: 8.21-2, -3, -5 are subtractions of printed numbers; 8.21-6 and -8 are conceptual and labelled "מאתגר".

---

## 8.22 — מאיפה הדאטה מגיעה

Labelling of the event log is exact and carefully hedged ("כפי שתועד, לא נבדק מחדש"; "שורה חדשה שמצביעה על הקודמת"; two clocks), and the invented thresholds are explicitly denied ("אין מספר כזה"). Agreement 2/3/3 of 4, 8/12 = 66.67%, lags 0/5/3: all verified. The big items are M-1, M-2, M-4.

### 8.22-1 · minor · undefined: "קורא המסמכים" and "שיעור עריכה"
`8-22.mdx:198` ("ובמקרה של קורא המסמכים, שמתחיל במצב מסייע…") and `8-25.mdx:87` ("בקורא המסמכים הצוות כבר מגדיר מושג דומה: ״שיעור עריכה״") use "the document reader" with no explanation; the word never occurs in stages 0–8.19. One sentence: "קורא המסמכים: תוכנה שקוראת מסמך של לקוח, למשל תלוש שכר, ומציעה את הערכים; אדם מאשר (לפי תיעוד הצוות)".

### 8.22-2 · minor · numbers planted as distractors
`:42` ("ממוצע ההסכמה… שבעים אחוז") and exercise 8.22-1 option 3 ("שבעים אחוז") plant a plausible threshold in a lesson that says none exists. They are marked "לא נקבע", but a learner remembers "70". Use a clearly absurd or unnumbered distractor ("כשההסכמה מגיעה ל־X").

### 8.22-3 · minor · "we"
`:91` ("מה ידענו על הלקוח… כשהחלטנו"), `:253`, `:414` and the frame text "המצב: מה ידענו כשהחלטנו" (cue 4). Whose "we"? Say "מה ידעה התוכנה".

### 8.22-4 · minor · the video
Cues 12–13 ("התוכנה רושמת מה הייתה מציעה, ולא פועלת. שום דבר שלה לא מגיע ללקוח או לבנק") carry no source; the frame `8-22-t097` adds "השם הוחלט. מה נמדד בו: עתיד" later. Add "לפי הצוות" to the cue.

### 8.22-5 · minor · exercises
8.22-2 counts agreements by eye (קל), 8.22-3 and -4 are one subtraction / one division. The correct option of 8.22-5 is the longest of the four.

---

## 8.23 — אימון ובדיקה

Numbers clean: series, 5 draws, time split (0.2290 / 0.3561, RMSE 0.3790, bias −0.3561), the four-error example (0.2000, 0.2121, −0.0500). The hedges "(ידע כללי, ומה שחל על Mogi הוא השערה)", "ל־Mogi אין עדיין מודל" are right. M-3 is the main finding.

### 8.23-1 · minor · the expected observation of task 1 is wrong
`8-23.mdx:165`: "בין {r4.memory} ל־{r1.memory} בחמש ההגרלות": 0.0767 to 0.1022. The lowest of the five is draw 3, **0.0711** (the sentence at `:135` and the SplitDemo say so). Fix: `r3.memory`.

### 8.23-2 · minor · "כמעט תמיד" and "בכל חודש" in the same sentence
`:193`: "הוא נמוך מדי כמעט תמיד. ההטיה שווה ל־MAE בערכה המוחלט, כי הוא טעה לאותו כיוון בכל חודש בדיקה". The bias equals −MAE exactly, so it is "תמיד", all 18 months.

### 8.23-3 · minor · exercise 8.23-6 is a lookup labelled "מאתגר"
`:338–353`: "מה ה־RMSE שלו, לפי מה שנאמר בשיעור?" The solution says "הערך נמצא בשיעור". Make it a computation (give six signed errors) or relabel "קל". Typo `:267` "מודל זכרון" (זיכרון).

### 8.23-4 · minor · the video states the rule without the scope
Frames `8-23-t138/t146` ("הכלל: בדיקה צריכה להידמות לשימוש") and cue 15 have no "ידע כללי" or "בסדרה הזאת". The opening frame has it.

### 8.23-5 · minor · sources
`:402` "גרעין" (seed) is unexplained jargon; `:44` "אין מה לבדוק" is right for Mogi today.

---

## 8.24 — תחזוקה

Numbers clean (alarm month 39, delay 2, four windows 0.0641 / 0.1417 / 0.1992 / 0.2321, gains 0.1967 / 0.1191 / 0.0287). The hedging ("אין תשובה אחת", "סדרה אחת בדויה", "הסף הוא פשרה", "הכול עתיד") is the best of the stage. B-2 and M-8 are the findings.

### 8.24-1 · minor · "רובם אחרי השינוי"
`:126`: retraining on 3 months at the alarm (month 39) uses months 37–39: **all** after the change, not "רובם". And `:130` "אימון מחדש… לא מחזיר לשגיאה הרגילה" (exercise 8.24-4 option 4, `:324`: "גם בטוב ביותר השגיאה גבוהה מהרגילה"): with 3 months the error is 0.0641 against a normal 0.0492 (0.0400 healthy): within 0.015–0.024 of normal. Say "קרובה לרגילה, ועדיין מעליה".

### 8.24-2 · minor · "השהיה תמיד"
`:96`: "השהיה היא תמיד בלתי נמנעת" (always unavoidable): true when the true answer must arrive, as the sentence itself says; drop "תמיד". "תשובת בנק מגיעה ימים אחרי הבקשה" is an unlabelled claim about banks (the invented lag of 8.22 is 3 days); say "בדרך כלל".

### 8.24-3 · minor · video
Cues 10–11 and 13–14 ("הסף הוא פי שלושה… ההתראה מגיעה חודשים אחרי השינוי… מעט נותן רעש") say the demonstration's numbers as the rule. Frame `8-24-t117/t126` caption "מעט נותן רעש, הרבה כולל עבר" sits above bars where **3 months is the best**; the lesson's own "בסדרה הזאת 3 יצא הכי טוב" is missing. Add it to the caption.

### 8.24-4 · minor · exercises
8.24-2, -3 (קל) are one multiplication and one subtraction; 8.24-6 (מאתגר) is a subtraction of the two printed numbers; the note "בקירוב גודל הקפיצה" at `:359` compares 0.2208 with the jump 0.25: say "קרוב לקפיצה, 0.25".

---

## 8.25 — הכוונה אנושית וידע מהשטח כהשערה

Labelling of the field claims is right (who, when, "ממתין לאישור אילון", "אף אחת מהן לא הנכונה"); the three conflicting advice items on the number of banks are quoted as in the notes; the LLM rule is exact (DEC-1). B-1, M-4, M-6 are the findings.

### 8.25-1 · minor · "הקורס כבר ראה שהחלק הראשון נכון"
`8-25.mdx:136`: the 50%-of-disposable-income part of the claim "is correct (according to the team's transcription of Directive 329)". Stage 4 labels this "לא אומת" and the Sources line here (`:411`) says "תואם את תעתיק ההוראה". Say "תואם את תעתיק הצוות להוראה 329 (לא אומת)". The word "הכנסה פנויה" for the base of the 50% is the team's wording of FK-H-012; 4.3's definition of disposable income (net income minus other obligations) matches, but say so once.

### 8.25-2 · minor · the two standard deviations of the stage
8.25 uses the population SD (divide by n, as 8.3 teaches: "בקורס מחלקים ב־n"); 8.18 and 8.20 use the sample SD (n−1) because they feed a t interval. Neither lesson says which is in use where; a learner comparing the "0.0271" of 8.20 with a hand computation (0.0254) gets a different number. Say "סטיית התקן של מדגם (n פחות 1), כי היא נכנסת לטווח" in 8.20 and, once B-1 is fixed, the same here.

### 8.25-3 · minor · typed values and a solution that does arithmetic in the MDX
`:310`, `:314`: "7.05 ÷ 6 = 1.1750" with 7.05 typed (AUTHORING: "no arithmetic in MDX"); the values of `:140–141` are typed inputs (allowed) but the sums are not facts.

### 8.25-4 · minor · the sort row inventing a bank policy
`:36`: "בנק ששלח מכתב: לא מאשרים לווים בתוך ניסיון של פחות משנה". A concrete (invented) bank policy in a quiz about hypotheses; add "(דוגמה בדויה)" in the row, as the other rows say "לפי מה שהוא מכיר".

### 8.25-5 · minor · exercises
8.25-2 (8 ÷ 20 × 100, "קל"), 8.25-3 (mean of six, "בינוני"), 8.25-4 (one subtraction of printed means, "בינוני"). The correct option is the longest in 8.25-5, -6, -7.

---

## 8.26 — הסכמה, פרטיות, ו״מודל שפה לעולם לא מחשב״

A lesson on principles, correctly without numbers, with "אין בו מסקנה משפטית" at the top, "לא ידוע" repeated for: whether anonymised data is still personal data, whether the service consent covers learning, what to do in a model after a deletion. The facts it states from the record match `CLAUDE.md` and the notes: real clients on the existing consent document (2026-09-10, "חלק מהנתונים אולי יצטרכו להימחק"), no document read before everyone on the case has signed (2026-09-06, amended 09-15), the consent step not built, the consent tag in the log, deletion as a logged operation, DEC-1 word for word. B-3 and M-5 are the findings.

### 8.26-1 · minor · three statements without a source in the record
- `:85`: the consent document "נחתם פעם אחת לכל אדם בתיק. כך הוחלט ב־10.9.2026". The decision of 10 September says real clients are served on the existing document; "once per person" is not in the notes (the 6 September rule says everyone on the case must have signed).
- `:193–199` (the worked example): a free note by an advisor is run through step 1, "האם כל מי שבתיק חתם… אם לא, אין שימוש במסמכים של התיק", but the team's rule is about **documents**. Either use a document as the example or say the course applies the rule by analogy.
- `:31` (MatchTable row "אישור שהתמהיל יישלח לבנק → אדם", reason "בלמידה שום דבר שהמערכת הפיקה לא מגיע ללקוח או לבנק לפני שאדם אישר"): 8.22's table says in "אוטומטי" the software acts without approval; say "במצב צל ובמצב מסייע".

### 8.26-2 · minor · source kind and vocabulary
- Sources `:370`: kind "ידע כלכלי כללי" ("how money and banks work, no figures", AUTHORING) for a privacy principle. Use a kind that says "עיקרון כללי, לא מסקנה משפטית" (the text already does).
- "דגם" and "מודל" are used for the same thing (`:42`, `:89`, `:116`, `:319` against `:126`, `:131`); the stage says "מודל".
- "נתיב הכתיבה" (see 8.21-7). The example of the worked solution is "בדוי" but carries no "דוגמה לימודית" mark (`:191`).

### 8.26-3 · minor · exercises
Seven multiple-choice items, none numeric (declared); the correct option is the longest in 8.26-1, -2, -4, -5, -6, -7; 8.26-6 ("מאתגר") is answered by the sentence "הקורס לא יודע" that the lesson repeats.

### 8.26-4 · minor · video
Cue 6 ("אצל Mogi משרתים על מסמך ההסכמה הקיים") and cue 12 are labelled by their frames ("כפי שתועד", "החלטה של Mogi, 29.7.2026"); I saw no legal conclusion in any cue or frame. The frame `8-26-t114` "מי עושה מה" is right.

---

## 8.27 — כל המשתנים במקום אחד

### 8.27-1 · minor · "כל משתנה… מופיע באלגוריתם בתפקיד" and "יש צמתים שלא נכנסים לאלגוריתם"
`8-27.mdx:87` (and cue 1 of the video) says every variable on the map has one of four roles; `:94` says some nodes are not in the algorithm; the layer has **29 of 161 nodes "לא נכנס לאלגוריתם"** (18%: all people and bodies, the eight complex-deal topics, three market contexts). Say "כל משתנה… בארבעה תפקידים, וחלק מהצמתים אינם משתנים בכלל".

### 8.27-2 · minor · task 1's answer
`:161`: "משתני החלטה נמצאים… לא באזורי השוק או הבנק". The bank region holds two decision nodes (`channel`, `outreach`, control "הלקוח"; the region is where the card is drawn, not who decides). Counts by region (my parse): decision: mix 12, client 7, property 4, bank 2. Say "כמעט כולם".

### 8.27-3 · minor · the 15 rules: one row loses a condition
`:42` ("משכנתא קיימת… על אותו נכס: מתווספת להחזר"): the source (DEC-3 row E47) says "אם נשארו יותר מ־18 חודשים" and "כלל אותו נכס בתוקף מ־2026-10-01". 4.3 teaches both; add the condition. The counts (12 summarised of 15, 11 in the table, the twelfth is "אימות") are exactly right.

### 8.27-4 · minor · the card of the "outside" ones and the controllers (see the map section)
and video frames `8-27-t098` and `t108`: the title "3. קוראים או מחשבים?" is wider than its card and is clipped at the left edge.

### 8.27-5 · minor · exercises
Six multiple-choice items, no numbers (declared); 8.27-1 and -2 ("קל") are definitions; the correct option is the longest in 8.27-3, -4, -5, -6.

---

## 8.28 — סדנה: מנוע קטן בגיליון

### The workshop, tested

| check | result |
|---|---|
| `python3 build-engine-workshop.py --verify` (copy of the tree) | passes: 66 rows compared in five input sets; feasible 14 / 4 / 0 / 19 / 0, winners `g40-0-60`, `g40-0-60`, none, `g100-0-0`, none; largest gap sheet against engine: first payment 0, total 5.25, exposure 9.51; notebook "✓ המחברת מגיעה לאותם מספרים"; the three files regenerated are **byte-identical** to the repo |
| my own engine (plain `Decimal`, statement rounding, my own dominance, min-max normalisation to 4 places, tie rule) | 66 candidates, **14 feasible, 6 efficient, winner `g40-0-60`** (first 7,941.62, total 2,858,982.61, exposure 1,031.61; runner-up `g50-0-50` 7,970.07 / 2,869,225.48 / 861.01), rejections variable_share 38, client_target 31, client_max 1, all other seven 0; bank א׳; the five input sets of the page and the tab (no extra equity: 4 feasible, 3 efficient; bank ד׳: 0 feasible, all 66 refused by its financing line; car closed and 20,000 extra: 0 feasible, 66 by "equity"; weights 10/20/70: winner `g90-0-10`; bank ג׳ with 10/10/80: 19 feasible, `g100-0-0`) |
| solution recalculated in LibreOffice | B59 66, B60 14, B61 6, B62 `g40-0-60`, B63 7,941.62 (equal to the page), B64 2,858,982.79 and B65 1,030.73 (the sheet is an approximation: the page says "עד כמה שקלים… עד כעשרה": 0.18 and 0.88 in the winner, up to 5.25 / 9.51 over all rows: honest), all 19 checks "✓ הכול בטווח"; the offer cells F13:F18 give 8,310.78 / 8,310.28 / −0.50 and −179.04 against −177.72 (within the tab's tolerance of 6) |
| the template **filled by fill-down of row 89** (my script, `Translator`) and recalculated | reproduces the solution's results exactly (14, 6, `g40-0-60`, 7,941.62): **the template is fill-in-able** |
| the template as downloaded | B60 = 0, B62 = "אין מועמד אפשרי", the guarded results say so; no error value anywhere; green input cells (B5:B24, F5:F11), grey result cells, RTL, frozen at B89 |
| the page's addresses | B18–B24 inputs, B45–B56 positioning, B59–B69 results, B72–B81 reasons, A84–A86 explanation, rows 89–154 grid, H–O flow, R–AC constraints, AD/AE front, AF–AM choice: **all correct** |

Findings besides M-9, M-10, M-11:

### 8.28-1 · minor · the notebook's "line by line" is per function, and a few sentences are slightly off
- `8-28.mdx:285`: "בתשעה תאים, ובכל אחד הסבר שורה אחר שורה". The notebook has **nine numbered steps but twelve code cells**, and the explanations are bullets per function: `reasons` (ten `if`s), `choose` (dominance, normalisation, ranking) and `run`/`explain` are not explained line by line (cell 18 has no explanation of the `explain` helper at all). Say "תשעה צעדים".
- `checks/ws8_engine.py:4` (cell 0): "אותו מנוע **שבנית**" (singular); the stage addresses the learner in the plural.
- `ws8_engine.py:159` (cell 13): "כפי **שתעתק** הצוות" is not a Hebrew form ("כפי שהצוות תיעתק" / "לפי תעתיק הצוות").
- Cell 5: "משתנה זז רק בנקודות עדכון, כל `reset` חודשים": the code moves the anchor **once**, after the first reset (`month > reset`), not at every reset. Say "אחרי נקודת העדכון הראשונה".
- Cell 3: "מעגלים רק בסוף חישוב, וכל ריבית חודשית בלוח מעוגנת לאגורה" says two opposite things in one bullet; AUTHORING: formulas round once at the end, schedules round each month.
- `:299`: "אותו קוד שבודק את מספרי השיעור בעצמו: בלי העתקה ובלי מספר שהוקלד ביד": true (the notebook is generated from `checks/ws8_engine.py`, the same file as the independent check, and `EXPECTED` comes from the facts).

### 8.28-2 · minor · text around the numbers
- `:307`, `:313` (prediction note and reveal): "הרבה מהם מרוכזים במסלולים משתנים, **או בהחזר שגבוה מהמרבי**", "רוב הפסילות הן של שלושה אילוצים": the client's maximum payment rejects **1** of 66 candidates; the three most frequent reasons are 38, 31 and 1 (the other seven are 0). Say "שני אילוצים".
- The prediction stem (`:76`): "66 תמהילים אפשריים לבדיקה… כמה יעמדו בכל האילוצים?" uses "אפשריים" for the whole grid and then for the feasible ones.
- `:360` (success text of the FillTable): "יעד היחס של הלקוח (40%)" is a typed 40; it is the case's `target_ratio`.
- Letters (`:261`): "w1·n1+w2·n2+w3·n3" reuses **n** (the number of periods, 0.2) and **w** without saying so; AUTHORING: a new meaning for a used letter is said aloud.
- The sheet's input cells have no data validation: B19/B20 accept anything but 0/1, B21 anything but a, b, c, d (an error cascades through 66 rows).
- The weights order in task 3 ("10, 20, 70 (חשיפה)") matches B22:B24 (first, total, exposure); the one-word gloss is enough, add "(ראשון, סך, חשיפה)".

### 8.28-3 · minor · phone (390px)
The front table (`:176–200`) hides **"חשיפה" and "ציון"**; the offer table hides **"הפער"**, the column that is the point. The mix column wraps to five lines ("40% קבועה, 0% פריים, 60% משתנה"). Put the score and the gap next to the label or use cards.

### 8.28-4 · minor · exercises
8.28-2 (default unit "₪" on a count), -3, -6 are lookups (M-10); 8.28-1, -4, -5, -7 are conceptual; the correct option is the longest in 8.28-4, -5, -7.

---

## The 8.27 map of variables: `stage-8.ts` and the 161-node layer

**Structure.** `mapUpTo("8.28")` gives **161 nodes and 355 links**; the layer covers every node (no missing, no extra id); the 15 stage-8 nodes and 30 links are all attached to existing ids; `stage-8.test.ts` passes (7 tests). Role counts: input 53, output 43, outside 29, decision 23, constraint 9, input+decision 2, constraint+output 2. Controllers: other 59, bank 33, client 33, regulator 21, market 15. Every card carries "בשכבת האלגוריתם (עתיד, הצעה של הקורס, לא קוד)" and the header says the layer is a proposal: labelling is good.

**The 15 stage-8 cards.** Right: the three-way labelling (only `event_log` "Mogi היום", `shadow_opinion` "הוחלט: שמות המצבים", the rest "עתיד: תכנון, לא קוד קיים"), "מודל שפה לעולם לא מחשב ולא כותב מצב" (decided) on `explanation`. One overstatement: `shadow_opinion` role says "מדד ההסכמה בין השניים הוא הבסיס לקביעה מתי אפשר לעבור מצב" as a fact; 8.22 says what is measured beyond agreement and when to move are not decided. Say "הבסיס המוצע".

**Spot-check (I read all 161 cards against their roles; 28 nodes in the 18 rows below I would change, the roughly 60 named under the table are sound):**

| node | layer says | problem | proposal |
|---|---|---|---|
| `approval` (תשובת הבנק בחיתום) | output / bank | the bank's answer, the label the algorithm learns from; lesson's definition of output = what the algorithm computes | input / bank (M-7) |
| `counter_offer` | output / bank | a bank's act | input / bank |
| `pre_approval` | output / bank | a bank's document; "המוצר שהאלגוריתם מכוון אליו" is a goal, not a role | outside, or input |
| `proposed_basket` | output / other | the basket the **bank** chooses | control: bank |
| `recognized_income` | input / **client** | the card: "החלק מההכנסה שהבנק מוכן לספור"; 4.1: recognition is the bank's policy | control: bank (the client controls `declared`, not `recognized`) |
| `exit_point` | input / **regulator** | the card: the day a variable track updates: set by the **loan contract**, not by the order | control: bank (or "other: החוזה") |
| `monte_carlo`, `scenario_set` | input / **market** | assumptions the **course/algorithm** makes ("הנחה על התפלגות"); the market does not control a simulation's draws. (451's forecast is the regulator's: `forecast_451` is right) | control: other, or "השוק (כהנחה)" |
| `living_budget` | constraint / client: "ההחזר המרבי שהלקוח קבע" | the card is **what the family needs to live on** (T of 4.6); the client's maximum payment in 8.15/8.21/8.28 is a separate teaching input (8,300 ₪ first payment); both lessons call it "ההחזר המרבי" | note: "התקציב מגביל את ההחזר; הסכום המרבי נגזר ממנו או נקבע בנפרד" |
| `max_payment` | output only; note "גם אילוץ אם הלקוח קבע תקרה" | 3.8's "החזר מרבי חזוי" (the peak in the stress path) is not the client's cap, which the course tests against the **first** payment; `pti` and `ltv` got `co`, this one did not | remove the note, or roles `o`+`c` and say which payment is tested |
| `directive_451` | output / regulator | a rule, not an output; role says "קובעת מה חובה להציג בפלט" (a constraint on the output format) | constraint / regulator |
| `search_space` | **decision** / other | the space of decision variables is a structure, not a decision | outside, or output of the decision variables |
| `credit_data`, `account_conduct` | input / **client** | the data is reported by bureaus and the bank's view of statements; the client cannot change it before the request | control: other (a body) |
| `value` | input / other | the appraiser/market; "אף אחד מהם (תהליך או תוצאה)" is a puzzling label for an input | control: market or "השמאי" |
| `credit_risk`, `capital_requirements`, `competition`, `customer_value`, `risk_appetite` | input / bank, all five "נכנס למודל התמחור" | no lesson builds a pricing model that uses them (8.17: anchor + margin + thresholds on synthetic data), and how banks price is "לא ידוע"; the identical note asserts a mechanism | "גורם שהבנק שוקל; לא נצפה; השערה על מה שמסביר מרווח" |
| `threshold`, `margin_step` | input / bank | the lesson says they are a **shape the course teaches**, the layer note ("המדרגה במודל התמחור") is flat | add "השערה" |
| `track_eligibility` | input / regulator | "ניתנת לפי זכאות, לא נבחרת": the controller is a government ministry (Housing), not the supervisor of 329/451 | control: other |
| `boi_rate`, `boi_average`, `equator` | input / market | published by the Bank of Israel (the lesson's regulator); "אף אחד בעסקה לא שולט" is the better label | say "השוק והרגולטור: חיצוני לעסקה" in the lesson |
| `red_line`, `misleading_info` | constraint / other | behaviour limits for advisors, not candidate constraints (the 10 of 8.28 do not include them) | outside, or "אילוץ על הפלט" |

The rest (borrowers, advisor, seller, lawyer, appraiser, insurer, registry, `track_*`, `spitzer`, `grace`, `positioning`, `lever`, `close_loans`, `outreach`, `equity`, `obligations`, `ltv`, `pti`, `same_property`, `directive_329`, `bank_policy`, `underwriting`, `offer_validity`, the eight complex-deal nodes as "לא נכנס", all "פלט המנוע" nodes, `personal_offer`, `executed_deal`, `competing_offer`) are sensible and consistent with the lesson text and with 8.27-5/-6.

---

## Videos and key frames

All 143 frames viewed. No Brain, J, DEC, FK, path or repo name in any frame or cue; fictional banks only; every frame carries the "נתונים סינתטיים · להדגמה" footer; 8.22, 8.24, 8.25, 8.26, 8.27 and 8.28 have an opening frame saying what status the lesson has ("עתיד: אין היום הצעה של תוכנה לשנות", "השכבה היא הצעה של הקורס", "Mogi היום לא מחשבת תמהיל בקוד"). Subtitles end 1 second before the video (124–160 s), as in stage 7.

| frame / cue | finding |
|---|---|
| `8-28-t112`, `t122`, `t131` (M-11) | the winner's 7941.62 beside the offer gap −0.50 of another bank and mix; numbers without ₪ or separators |
| `8-25-t096`, `t106`, cue 11 (B-1) | "קטן ביחס לפיזור" |
| `8-20-t066` | ₪ overlaps the label "סך תשלומים" |
| `8-27-t098`, `t108` | the card title "3. קוראים או מחשבים?" overflows the card on the left |
| `8-24-t117`, `t126` | caption above bars that show the opposite (8.24-3) |
| `8-21-t033` | LLM rule under the "לא החלטה של Mogi" footer (8.21-6); no status label in the whole 8.21 and 8.23 videos |
| `8-23-t075…t104` | only draws 1, 3, 5 are shown of five; the range 0.0711–0.1022 is right |
| cue 1 of 8.27 | "כל משתנה… מופיע בתפקיד" (8.27-1) |

---

## 390px and 1280px

Every page: no sideways page scroll (document 375 in a 390 viewport, 1265 in 1280), no console error or warning, islands hydrate. Tables that scroll inside their box at 390px and hide the column the text discusses: **8.20** estimate-against-offer (hides "ההפרש", `8.20-6`), **8.28** front table (hides "חשיפה", "ציון") and offer table (hides "הפער") (`8.28-3`). All other tables of the nine lessons fit. The two stage-8 interactive illustrations I drove (DriftDemo, SplitDemo) have the "הצגה כטבלה" button and work on a phone.

---

## Cross-lesson items

**Agrees, needs nothing:**
- the case across 8.20, 8.21, 8.28: 2,200,000 price, 560,000 equity, 1,640,000 loan, the same four fictional banks with their lists (א׳ 4.40/4.60/4.10, ב׳ 4.30/4.70/4.00, ג׳ 4.35/4.55/4.20, ד׳ 4.45/4.65/4.15), bank ב׳'s invented offer 4.35% / 4.65% on 820,000 each (8.20 and 8.28: −0.50 and −177.72 in both), the client's limits 8,300 ₪ and 40% (8.15, 8.21, 8.28);
- the rule "offer beats default" in 8.20, 8.21 (steps 3 and 7) and 8.28; the LLM rule (DEC-1: Eylon 2026-07-27, team 2026-07-29) in 8.21, 8.25, 8.26, the `explanation` card and the 8.28 notebook; the four mode names in 8.22, 8.24, 8.25, 8.27;
- "אין היום חישוב תמהיל בקוד, והקריאה למנוע מוקפאת" in the box of every lesson (the engine call is ENG-223, next, as `CLAUDE.md` says);
- the 12 rows of the 15 rules (DEC-3) against 8.27's table (row "אימות" correctly left out); the 5 years / 12–120 months of the reset (E43);
- the labelling of invented numbers: every threshold, factor, window and weight of the stage says "להדגמה".

**Needs a decision:**
- **X-1 · minor · two standard deviations** (8.25-2).
- **X-2 · minor · the client's maximum payment.** 8.15/8.21/8.28 test the **first** payment against 8,300 ₪; the map card `max_payment` and `living_budget` suggest the maximum predicted payment or the living budget; 8.28's constraint label "ההחזר עד המרבי שהלקוח קבע" is the first payment. One sentence in 8.28 ("ההחזר הראשון") settles it.
- **X-3 · minor · "הצעה" in two senses.** 8.20 (a binding offer with a term) and the 8.28 "הצעה לדוגמה… הצעה היא מה שהבנק כתב" use it for the personal offer of 5.5; 8.21's "הצעה אמיתית" for bank ג׳ and 8.20's for bank ב׳ are two different invented offers (4.05% fixed, 1,640,000, against 4.35/4.65). Say once in 8.21 "הצעה אחרת מהמומצאת ב־8.20".
- **X-4 · minor · plural address.** First-person plural: 8.20 title and `:105`, 8.21 `:258, :360`, 8.22 `:91, :253, :414`, 8.24 `:294` ("עיגלנו"), the 8.28 notebook ("שבנית"). "נניח" in 8.25 is acceptable.
- **X-5 · minor · `Term` links.** `check:terms` passes; no term of 8.25–8.28 is new. The undefined words are "קורא המסמכים", "שיעור עריכה", "נתיב הכתיבה", "גרעין" (8.22-1, 8.21-7, 8.23-5).

---

## Count

**3 blockers** (B-1 the statistical reading in 8.25; B-2 the 8.24 task that cannot be done; B-3 the consent principle and "לתעד הכול" in 8.26), **12 major** (M-1 the sort in 8.22; M-2 8.22-6; M-3 8.23 causes; M-4 ids and repo in learner text; M-5 the 8.26 prediction; M-6 "רוב" in 8.25; M-7 the layer's bank answers; M-8 the false equality in 8.24; M-9 workshop instructions and template; M-10 workshop exercises; M-11 the 8.28 frames; M-12 the unit of numeric answers), **about 45 minor** (8.20: 7, 8.21: 7, 8.22: 5, 8.23: 5, 8.24: 4, 8.25: 5, 8.26: 4 groups, 8.27: 5, 8.28: 4 groups, map: 18 rows, cross-lesson: 5).

**What I would fix first:**
1. **B-1:** `8-25.mdx:145, 203, 235, 252, 340`, cue 11 and frames `t096`, `t106`: compute the interval by 8.18's method and drop "קטן ביחס לפיזור".
2. **B-2:** `8-24.mdx:171, 178`: a task that the component can show (window 2 and a late change), and `DriftDemo.vue:101` "חודש אחד".
3. **B-3:** `8-26.mdx:88, 118`: quote the 12.8 principle with "מכירה / שימוש מסחרי", and delete "תיעוד בלבד לא קובע שום דבר".
4. **M-9, M-10, M-11:** the workshop: step 3 and the F13:F18 task, a live check tab, the `וכנס` typo, an exercise that needs the learner's own sheet, the two-case closing frames.
5. **M-1, M-2:** the 8.22 sort and exercise 8.22-6.
6. **M-3:** 8.23's cause for the "זוכר" model (the break is not it) and "typical, not a law" in `:139` and `:386`.
7. **M-4, M-5, M-6, M-8, M-12:** FK ids and "בריפו" out of learner text; the 8.26 prediction key; "רוב השינויים"; `0.049167`; the units.
8. **M-7 and the map table:** the bank's answers are inputs; the nine controllers.
9. The minor groups: "קורא המסמכים" and the other undefined words, raw numbers in two 8.21 tables, the 390px tables, the first-person plural, the labels of the frames.
