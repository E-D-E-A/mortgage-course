# QA report: lessons 7.5–7.8 and the stage-7 big-picture map, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts (`verify78.py`, `verify75.py`, `v35.py`, `eqs.py`, `map.mjs`, `phone.mjs`, `calc.mjs`, `calc2.mjs`), my own build, contact sheets and phone screenshots are in my own scratchpad (`/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/r2/`).

**The reader:** someone who finished stages 0–6 and lessons 7.1–7.4 (the five fees, the discounting fee and its two formulas, exit points and notice, the §15א test and the refinance calculator), and now meets internal versus external refinance (7.5), two introductions to complex deals (7.6, 7.7: "היכרות בלבד") and the workshop on case C (7.8).

**What I read:**
- the four MDX files in full (`src/pages/lessons/7-{5,6,7,8}.mdx`), and the built pages from my own build (`pnpm astro build --outDir <scratch>/r2/dist`, 101 pages, no error);
- `public/video/7-{5..8}.he.vtt` (all cues) and all 85 key frames `qa/video/7-X-t*.png` (contact sheets; full size wherever a defect showed: `7-7-t173`, `7-8-t048`, `7-8-t099`, `7-8-t133`, `7-8-t144`, `7-8-t171`);
- `data/lessons/7-{5..8}.json` (226 facts), `src/data/definitions/7-{5,6,7}.json`, `src/data/case-c.ts`, `src/data/refinance-examples.ts`, `course/AUTHORING.md`, `course/stage-7-brief.md`, `course/course-map.md` (stage 7, terms), `research/field-knowledge.md` (FK-H-002, 003, 010, 011, 021, 036, 048, 053, 064–067, 069, DEC rows), `qa-reports/stage-6-review-6.6-6.11.md` (format and method);
- `src/components/big-picture/stage-7.ts` (all 22 nodes and 43 links) against the final text of 7.1–7.8, and `index.ts` / `stage-7.test.ts` (5 tests pass);
- the lesson 7.1–7.4 passages that 7.5–7.8 lean on (7.4 lines 74–100 and the calculator, 7.3 lines 73–110 and 223, 7.2 line 405, 4.3, 4.5, 1.5, 4.4);
- the calculators as rendered (`RefinanceCalculator` in 7.5 and 7.8, driven in my own Chromium) and every page at 390px.

**Math check.** Recomputed independently in plain Python `Decimal` (my own annuity, effective-rate conversion by the twelfth root, my own present-value, my own IRR by bisection, statement rounding for the new loans, exact unrounded payment for the team's example; nothing imported from `src/` or `checks/`):
- **7.8, the fee chain:** payment 4,974.72; balance after 37 payments 637,956.74; PV at A (4.823049%) 694,721.98; PV at C (5.09%) 681,839.54; §3(3) 56,765.24; §3(4) 12,882.44; the lower 12,882.44; after the 20% reduction 10,305.95; plus 60 = **10,365.95**; the first formula alone 45,472.19, extra 35,106.24, "the rule is worth" 43,882.80; no-notice 637.96 and total 11,003.91; the 2026-06-30 variant 13,131.56 (it matches only with **35** payments made on that date, 205 left; my first attempt with 36 gave 13,036.96, so the tool counts payments by date, correctly). Financed 648,322.69; stay total 1,009,867.74; effective of 5.90% nominal 6.06%.
- **§15א test per bank:** the bar (T = the fee) 5.8232% → 5.82; bank ב׳ expected total rate 5.38 (margin 0.44, passes), ג׳ 5.37 (0.46, passes), ד׳ 5.89 (−0.07, fails); at 5.6% bank ב׳ gets 5.80 (margin 0.02), at 5.7% 5.91 (−0.08). **All match.**
- **Totals:** ב׳ 978,470.69 (saving **31,397.05**, payment gap 166.49, cash break-even 15); ג׳ 1,162,186.98 (**−152,319.24**, gap 1,108.76); ד׳ 1,220,123.44 (−210,255.70). Naive "gap × 203" 225,078.28.
- **Top-up (798,322.69 lent):** first payments 5,920.69 / 4,760.41 / 4,998.21; totals incl. costs 1,204,300.76 / 1,430,523.14 / 1,501,860.30; separate loan 150,000 at 6.4% for 180 months: 1,298.43 first, 233,717.14 in all; keep route 1,243,584.88 (first 6,273.15); **top-up comparison 39,284.12** (ב׳), 186,938.26 (ג׳), 258,275.42 (ד׳). Ratios on 16,000: **31.09 / 37.00 / 29.75 / 31.24 / 39.21** (42.02 is the loan-to-value of bank ב׳'s loan, not a ratio); LTV 42.02; room 151,677.31.
- **7.5:** every one of the 4 offers (savings 31,397.05 / 32,897.05 / 25,808.85 / 18,693.63; rates 5.38 / 5.35 / 5.45 / 5.56; first payments; cash and position break-evens 15·41, 6·36, 7·43, 10·54, position = cash + balance gap, my own trajectory). **All match.**
- **7.6, 7.7:** every figure is one multiplication or subtraction; all match.
- **Every `=` in the four built pages:** 33 equalities parsed and evaluated (2 + 13 + 10 + 7); **all hold** on the printed numbers (the 34th, `H = V − V × c ÷ 100` in 7.6, is symbolic).
- **No wrong number in a table, answer or fact.** What is wrong is in the sentences around the numbers (B-1, B-2) and in what the numbers are asked to carry (7.8-1, 7.8-2).

**Result:** 2 blockers, 9 major, the rest minor. The numbers are clean. The labelling of the invented 70/75, 40+20 and 50/70 examples is sound (conditional and marked in both text and video). The problems are a wrong sentence about the test (7.8), a cluster of sentences in 7.6 and 7.7 that state mechanics the lessons themselves list as unknown, a headline figure in 7.8 that answers a different question from the one its rule 1 asks, and a handful of video frames and map cards.

---

## Blockers

### B-1 · blocker · 7.8 says the §15א test ignores the new loan's entry costs; the calculator, 7.4 and the facts say it includes them
- **Where:** `7-8.mdx:265` (task 3, "מה הייתם אמורים לראות"): "לא: המבחן של הרגולציה לא כולל את עלויות הכניסה של ההלוואה החדשה. הן משפיעות על הסך ועל מועד ההחזר של החיסכון, ולא על תוצאת המבחן. זו מגבלה של המבחן". Against: `7-4.mdx:82–86` ("המחיר נמוך יותר: אחוז הריבית האמיתי, אחרי שמחשיבים את כל העלויות… זה מה שהמבחן של הרגולטור בודק"); the 7.8 and 7.5 calculators' own line "ההצעה החדשה: 5.38% (הריבית הכוללת החזויה שלה, **כולל עלויות הכניסה**)"; facts `b.rate_new = 5.38` against input rate 5.2 and (my computation) 5.33 without the 2,400.
- **Check (calculator driven in Chromium):** costs 2,400 → "5.38% מול 5.82%", margin 0.44; costs doubled to 4,800 → "5.43% מול 5.82%", total saving 31,397.05 → 28,997.05. The verdict ("עובר") does not change, the figure the test compares does. 7.5 shows the same thing without saying it: the internal offer at the same 5.2% but costs 900 has rate 5.35, the external with costs 2,400 has 5.38.
- **Problem:** the learner who does task 3 sees the rate move and then reads that costs do not enter the test. The sentence "זו מגבלה של המבחן" teaches the opposite of 7.4 and of the line on the calculator; the real limit of the test is that it is a rate (blind to the term), not that it ignores costs.
- **Fix:** "כן, בדרך אחרת: עלויות הכניסה נכנסות לריבית הכוללת החזויה של ההצעה (5.38% במקום 5.33% בלעדיהן), כך שכפליים מעלה אותה ל־5.43% ומקטינים את הפער מהרף. בדוגמה זו התוצאה לא התהפכה. מה שהמבחן לא רואה הוא את אורך ההלוואה." Add the two rates as facts.

### B-2 · blocker · 7.6 and 7.7 state mechanics of deals the course says it does not know, and contradict their own "what the course does not know" lists
These are exactly the "introductions only" violations the brief warns against. Each sentence is unlabelled, and each contradicts a bullet of the same lesson.
- **`7-6.mdx:267`:** "הלוואת גישור מוסיפה **חוב, עלות ותאריך**. התאריך הוא מה שמסוכן: אם המכירה מתעכבת והתאריך מגיע, **המשפחה חייבת שני חובות**." Lines 260–263 of the same section: the course does not know if banks give it, its interest, period, fees, collateral, "מה קורה אם הדירה הישנה לא נמכרת עד סוף התקופה". The sentence states a cost, a date and a consequence of non-sale. Same claim in the map card `bridge_loan` (`stage-7.ts` role: "מוסיפה הלוואה, עלות ותאריך שאפשר לפספס").
  Fix: "הגדרת השם (ידע כללי) מרמזת על חוב נוסף ועל תאריך. אם יש עלות, ומה קורה אם התאריך מגיע לפני המכירה: הקורס לא יודע. זו השאלה הראשונה לבנק." Same in the card.
- **`7-6.mdx:330`:** "ו**בטוחה שונה מהרגיל**, כי אין עדיין דירה לשעבד." A legal consequence stated as fact (can a right in a future apartment be pledged? the course does not know; the line "בטוחה" in the tree and the frame also say "לא ידוע" for the bridge loan). Same in the card (`builder_escort` role) and the link `builder_escort → collateral` ("בטוחה שונה מהרגילה…"), and in the video cue 16 ("ובטוחה שונה") and the frame "הבטוחה של הקונה: ערבות חוק מכר" (no label on the frame; the lesson labels it "כפי שתועד בטופס של בנק").
  Fix: "ייתכן שהבטוחה שונה מהרגילה, כי הדירה עוד לא קיימת. איך משעבדים דירה שלא נבנתה: הקורס לא יודע."
- **`7-7.mdx:240`:** "הלווים מבוגרים, אין רכישה, **והנכס הוא מקור ההחזר**." This is a mechanism of the reverse mortgage that no source in the course gives. It also contradicts line 229, "ההחזר הוא חודשי או בעת הפטירה, דרך מוטב או ביטוח" (a monthly repayment is not repaid from the property), and the list at 233–236 ("מי מחזיר בפטירה ואיך… הקורס לא יודע").
  Fix: delete the last clause: "הלווים מבוגרים ואין רכישה. ויש בה אנשים נוספים…".
- **`7-7.mdx:484`** (callout "למה זה קיים?"): "בונים בית, **מחלקים מימון בין בנקים**, או **רוצים לממש נכס שבבעלותם בלי למכור אותו**." The lesson says three times that why anyone would use two banks on one property is unknown (line 221, table row 187 "למה בכלל כדאי: אף אחד", card 50 in the sort). The reverse-mortgage purpose is not in the FK (FK-H-010 gives who it is for and how it is repaid).
  Fix: "למה זה קיים? הקורס יודע רק מי אומר שהעסקאות האלה קיימות (אילון, 27.7.2026), לא למה בנקים או לקוחות בוחרים בהן."
- **Map card `lien_rank`** (`stage-7.ts`): role says "הדרגה קובעת מי נפרע ראשון אם הנכס נמכר, ולכן היא משפיעה על ההסכמה של כל בנק ועל המחיר". In 7.7 "מי נפרע ראשון בפועל" and "מה המחיר" are in the "אף אחד, הקורס לא יודע" row (187–189) and card 48. Fix: "השם מרמז על מי קודם למי. מה זה אומר בישראל, ואם זה משפיע על הסכמה ומחיר: לא ידוע".

---

## Major

### M-1 · major · 7.8: the 39,284.12 answers "refinance or not", not "where to take the top-up"; and the separate loan carries no entry costs
- **Where:** `7-8.mdx:101` (rule 1: "שתי שאלות נפרדות… השנייה אינה חיסכון"), the prediction (80), the table 309–342, `PredictionReveal` 442–455, 7.8-6 (592–607), video cue 19, frame `7-8-t171`.
- **Check (mine):** the keep route is the old loan as it stands (1,009,867.74) plus a separate loan (233,717.14). Of the 39,284.12, **31,397.05 is simply bank ב׳'s refinance saving** (the answer to question 1, already printed in part 3) and only **7,887.07** is the top-up comparison (225,830.07 added inside the new loan against 233,717.14 as a separate loan). The learner is told to keep the two questions apart and is then asked a prediction whose answer mixes them.
- **Hidden assumption:** the separate loan has no entry costs. Line 307 says "אין עלויות כניסה **למחזור**", and the keep total adds nothing for the separate loan; the switch totals carry 2,400. A separate 150,000 loan would carry costs of its own. Not stated as an assumption anywhere.
- **Fix:** add the decomposition (two facts: the refinance saving already known, and the top-up difference 7,887.07) and say which question each answers; and either add an invented entry cost to the separate loan or label "הנחה: להלוואה הנפרדת אין עלויות כניסה". The prediction would then ask about the top-up alone or state the two parts.

### M-2 · major · 7.8: the sample recommendation sets its ceiling where the saving is almost nothing
- **Where:** `7-8.mdx:435` ("בריבית שאינה עולה על 5.6%… הצעה כזו עוברת את מבחן סעיף 15א"), 246, 437.
- **Check (calculator, my IRR):** at 5.6% the test passes by **0.02** point and the total saving is **2,876.17 ₪** on about a million; at 5.7% the test fails but the total is already 4,323.39 **more**. The lesson says "בקושי" for 5.6 but then makes it the asked-for ceiling. A margin of 0.02 is far inside the doubt on A and C that the same recommendation lists as its weakness (the 0.44 margin at 5.2% is the real cushion).
- **Fix:** ask for "בריבית של עד 5.3%" or say the number the ceiling is tied to: "בריבית שעוברת את המבחן וחוסכת לפחות X ₪; ב־5.6% המבחן עובר בקושי, והחיסכון 2,876 ₪ בלבד". Make it a fact.

### M-3 · major · 7.8: "אין להם מבחן של סעיף 15א" about the top-up is stated flatly
- **Where:** `7-8.mdx:275` ("אין להם חיסכון, ואין להם מבחן של סעיף 15א: המבחן נוגע רק להלוואה הקיימת"); heading 271, summary 638.
- **Problem:** per the lesson's own transcription (line 173 and 7.4) the test compares the comparison rate of the *existing* loan with the expected total rate "של ההלוואה החדשה". If the top-up sits inside the new loan (the main route of the table), the new loan's expected total rate is that of the whole 798,322.69. Whether the bank approval is split, and how a top-up inside a refinance is classified, the lesson itself puts on the map (row 2) as unknown. A flat "no test" is a regulatory reading, unlabelled.
- **Fix:** "לפי הקריאה שלנו, המבחן מודד את המחזור, לא את התוספת. אם התוספת בתוך אותה הלוואה והאישור העקרוני אחד, מה נכנס לריבית הכוללת החזויה: לא ידוע (בשורה השנייה של המפה)."

### M-4 · major · printed difference does not hold on the printed numbers (house rule: every printed equality holds)
- **Where:** `7-8.mdx:190–193` table "פער מהרף": bank ג׳ shows rate 5.37 and gap **0.46**; 5.82 − 5.37 = 0.45 (the gap is from the unrounded 5.8232 − 5.3664). Rows ב׳ (0.44) and ד׳ (−0.07) subtract exactly, which makes the third a visible mistake. Same on the calculator ("0.46 נקודת אחוז" at term 300) and in 7.5's facts `i0.margin` 0.48 / `i2.margin` 0.27 (not printed there, so harmless today).
- **Fix:** one sentence under the table, "הפער מחושב על הערכים המדויקים, ולכן עשוי להיות שונה ב־0.01 ממה שמתקבל מהערכים המעוגנים", or print the margin to three decimals.

### M-5 · major · video: three frames with colliding or clipped text
- **`7-8-t048`** (cue 6, "אחרי הפחתה…"): on the third bar the label "אחרי הפחתה של 20% לפי ותק" is drawn **on top of** the amount "10,306 ₪"; both unreadable. Fix: put the amount inside the bar or the label above it.
- **`7-8-t133`** (cue 14): the bank ד׳ amount "210,256 ₪" is clipped by the left frame edge and reads "0,256 ₪" (a wrong number on screen). The scale needs a wider left margin or the label inside the bar.
- **`7-7-t173`** (reverse mortgage): the chips "מה קורה לחוב?" and "מי מחזיר בפטירה?" overlap. Also visible in the other frames of the same scene.
- All three are in the "look at every key frame and fix until clean" duty of the brief.

### M-6 · major · video and frames carry claims without the label the lesson gives them
The brief's "label every claim… in learner text, subtitles, frames":
- **7.5** cue 10 and frame: "הקורס יודע: החישוב · המשפט של הרגולטור", with no "תעתיק של הצוות, לא אומת" (the lesson labels the sentence "לא אומת", and card 46 of the sort says it is transcription). Cue 11 and frame: "**אנשי שטח** אומרים: חיצוני דורש שמאות" — in the lesson this is "טענה של הצוות **במחקר שלו**" (row 3, line 133; card 49), not field people. Wrong attribution.
- **7.6** frame (t060–t079, "הון עצמי נדרש 720,000 ₪"): the 70% ceiling behind the number has no "(תעתיק, לא אומת)"; cues 16–17 ("יש צד שלישי, שלבי תשלום, ובטוחה שונה", "עורך דין ובנק יודעים") are claims without label (see B-2). The builder chain frame (הקונים ← הקבלן ← בנק שמלווה את הפרויקט) is drawn as a fact; the lesson says "כפי שתועד אצל הצוות".
- **7.8** cues 5, 9, 10 ("הבנק גובה את הנמוכה משתיהן", "הרף: 5.82%, כולל העמלה", "בנקים ב׳ וג׳ עוברים"): the only label is in the opening frame (t007) and cue 22 ("לפי התעתיק") 3 minutes later. Add "לפי התעתיק" to cue 5 and cue 9.
- **7.7** is the model: every frame says "ידע מהשטח", "תקציר, לא אומת", "החלטה" or "אילו". Use it for the others.

### M-7 · major · 7.7: the self-build reading is the course's own and the lesson does not say so
- **Where:** `7-7.mdx:104, 144, 329–333`, table 110–142, 7.7-6, frame `7-7-t015+`, video cue 5–6.
- **Problem:** FK-H-003 says "עד 50% על הקרקע, ואחר כך עד 70% מערך הנכס העתידי". The lesson reads the second as the **total** loan at the end (cap 2,100,000, of which 1,600,000 "נוסף בשלבים") and the first as a part of it. The record can equally be read as 50% of the land first, then up to 70% of the future value **in addition**. "סך ההלוואה, בסוף" in the table and "מתוכה רק 500,000 יכולים להינתן על המגרש לפני שהבית נבנה" (144) are the course's reading. Also line 144's last sentence ("זה לא שיעור מימון של דירה שקיימת. הוא נמדד ברגעים שונים, מול ערכים שונים") is not inside the "אילו" and reads as a fact.
- **Fix:** "זו קריאה שלנו של המשפט (שהתקרה השנייה היא סך ההלוואה); אפשר לקרוא אותו גם אחרת. איזו קריאה נכונה: לא ידוע." Put the last sentence of 144 under "אילו".

### M-8 · major · big-picture cards overstate against the lessons (stage-7.ts)
The header says no card states a number and every card on the Order says "לא אומת": true. But on the introductions the cards say more than 7.6–7.7:
- `self_build`: what — "**מי שבונה בעצמו הוא גם הקבלן**, וההלוואה עוברת שלבים" (the first clause is in no lesson; the second is FK, labelled only in the note); role — "השווי שהבנק מודד משתנה לאורך הבנייה" (7.7: who sets the future value and how is unknown; the table is conditional). Link `self_build → value` "השווי משתנה לאורך הבנייה" has no label.
- `builder_escort`: what states the definition as fact (lesson: "כפי שתועד בטפסים של בנקים"); role "יש צד שלישי, שלבי תשלום ובטוחה שונה" (see B-2); and "מי שמבלבל בין שני הפירושים… מחליט על **מידע לא נכון**" — "מידע לא נכון" is the 6.5 term for the red line (giving a bank false information), used here in a different sense. Say "מחליט על בסיס שגוי".
- `builder_escort → progress_draws` "התשלומים לקבלן הם בשלבים" is fine, but 7.6 says explicitly that whether the *loan* is drawn in stages is "כנראה, לא ידוע".
- `early_repay_order` role: "…ושהחישוב אחיד בכל הבנקים. **בלעדיו כל בנק היה קובע לעצמו**": an unlabelled counterfactual; 7.2 and 7.3 say dates and averages come from the contract and the published file.
- `exit_point` role: "במסלול שמתעדכן **כל שנה או יותר**" can be read as "every year or longer"; 7.2 line 405 and 7.3 line 223 mean "פעם בשנה או בתדירות גבוהה יותר". Say that.
- **Two maps, one name.** 7.7 (496–519) builds a seven-row "מפת הנושאים שמחייבים העמקה בתיק מורכב" and calls it "חלק מהתוצר של השלב"; 7.8 (386–409) builds a five-row "מפת הנושאים שמחייבים העמקה" of case C; the single card `complex_map` has links only from `bridge_loan` and `lien_rank` (two of the seven rows) and from `refi_check`. The deliverable named in `course-map.md` is one map. Fix: say in 7.8 that the five rows are added to the seven of 7.7 (or name them "מפת תיק ג׳"), and link `upgrader_deal`, `progress_draws`, `builder_escort`, `self_build`, `reverse_mortgage` to `complex_map`.

### M-9 · major · 7.8 workshop: nothing the learner writes, and exercises do not use the calculators the page says they need
- **Where:** `7-8.mdx:98` ("ובסופה **תכתבו** המלצה"), 432–440 (the recommendation is given whole), 504 ("התרגילים 2 עד 6 צריכים מחשבון (המחשבונים בדף נותנים את כל הערכים)").
- **Problem:** the product of the stage is a recommendation the learner writes; the page prints one and the closing exercise (7.8-7) asks which of four to choose. The "workshop" never asks for the learner's own check: no exercise says "מלאו את שלושת החלקים להצעה של בנק ג׳" with a checklist. And 7.8-3, -4, -5 and -6 each give both numbers in the question (an addition or a subtraction), so none needs a calculator; four single subtractions are labelled "בינוני" and "מאתגר" (7.8-6).
- **Fix:** one exercise that takes an offer the page has not discussed (for example bank ג׳ with 203 months, or ב׳ at 5.5%) and asks for the three measures and a sentence for each part of the recommendation, with the facts behind it; relabel 7.8-3 to 7.8-6 "קל"/"בינוני"; correct the line 504 claim.

---

## 7.5 — מחזור פנימי מול חיצוני

The lesson is honest and well built: the table of what field people say (with who and when), the three-way sort (known / claim without official source / unknown), and the example where a tenth of a point beats 1,500 ₪ of costs, all with the cost gap labelled invented. Every number matched. What is left:

### 7.5-1 · minor · repo reference in learner text
- `7-5.mdx:161` "כפי שתועד **בריפו** של הצוות", and Sources 457: "בריפו". The brief forbids repo references in learner text. Say "כפי שתועד אצל הצוות" (7.6 uses it).
- Sources 455–456: "Brain (דפים 7733250 ו־8290315…)", "Brain, דף 8290315". The brief allows pages in `<Sources>`, but stage 6's report (X-2) asked for "לפי תעתיק של הצוות" and "לפי מחקר של צוות Mogi"; 7.6–7.8 already do so. Make 7.5 match.

### 7.5-2 · minor · two sentences that claim more than the lesson knows
- `7-5.mdx:97`: "ההלוואה החדשה צריכה לכסות את החוב ואת העמלה, בין שהיא של בנק אחר ובין שהיא של הבנק הנוכחי" is stated as fact; line 100 says whether the current bank charges the fee at all is open. It is the lesson's assumption (243: "בהנחה שהבנק הנוכחי לא מפחית אותה"). Say "בדוגמה".
- `7-5.mdx:110`: "אף שורה בה… לא נכנסת לחישוב" while row 3 (133–135) is used as the invented cost gap. Say "אף שורה לא נכנסת לחישוב כעובדה".
- `7-5.mdx:143`: "במחזור אין אישור מיידי: **הבקשה עוברת לאדם**": FK-H-021 says there is no immediate approval; "passes to a person" is not in the record.

### 7.5-3 · minor · the sort bin "הקורס יודע" holds a transcription
- `7-5.mdx:46, 56`: the sentence about the two numbers in writing "בחינם, פעמיים בשנה" is in the bin "הקורס יודע", with "כך כתוב בתעתיק… (לא נבדק)". The rest of the stage treats the transcription as "לא אומת". Name the bin "הקורס יודע (חישוב או תעתיק, לא אומת)" so the first bin is not read as verified.

### 7.5-4 · minor · exercises
- 7.5-2 (one subtraction) and 7.5-3 (one subtraction of two printed numbers): fine as קל and בינוני; 7.5-6 ("מאתגר") is one number read off the calculator: "בינוני". Correct options of 7.5-1 and 7.5-7 are the longest.
- 7.5-5 asks "מה הקורס **לא** יודע?" with the unknown first; fine. The hint of 7.5-6 hardcodes 5.4% (it equals `i2.input_rate`).

### 7.5-5 · minor · phone (390px)
Page fits (375 in a 390 viewport). Tables scroll inside their box: table 1 (what field people say) hides "מי אמר, ומתי" and "מה הקורס עושה איתה" (the column the text discusses is the third); table 3 (offers) hides "המבחן", "החיסכון בתשלומים מכסה את העלויות", "המצב שלכם חיובי". Put the verdict next to the offer.

---

## 7.6 — עסקאות מורכבות, א׳ (היכרות בלבד)

The framing is exactly right: a warning callout up front, a "what the course does not know" bullet list in every part, "תמיד שולחים" where the course cannot judge, the numbers confined to the two invented examples. The tree and the match table teach the distinction itself. B-2 above lists the sentences that break the rule. What is left:

### 7.6-1 · minor · unlabelled general claims (not mechanics)
- `7-6.mdx:172`: "ארבעה דברים שמובנים מאליהם: נכס אחד… מלווה אחד" — label "ידע כללי".
- `7-6.mdx:323`: the purpose of the sale-law guarantee is repeated in the text without the label that the definition popover carries ("זו הגדרה כללית, ולא נבדקה מול החוק"). Add "(הגדרה כללית)".
- `7-6.mdx:324`: "‏״מימון קבלן״: שם עם **שני פירושים**" — which source says the term has two meanings is not named (the tree and the card repeat it). If it comes from the team's research, say so; if from a bank form, label it.
- `7-6.mdx:324` and Sources 593: "בוליט או בלון" appear only in the Sources. The terms are 2.10's, so no term-before-use fault, but a beginner reading the Sources meets them with no gloss.

### 7.6-2 · minor · "שולחים תמיד" as procedure
- `7-6.mdx:248, 277, 312, 339` and the tree ("מתי שולחים: תמיד"): the label is global (line 185 and Sources 596: "הצעה של הקורס"). Say "(הצעה של הקורס)" in the tree results once, since the tree is the thing learners copy.

### 7.6-3 · minor · the prediction answers itself
- `7-6.mdx:154`: the question says the new contract "דורש תשלום לפני שיגיע הכסף ממכירת הישנה"; option 2, "ההון העצמי… מגיע אחרי שצריכים אותו", only restates it. Ask for the *consequence* ("מה השאלה הראשונה שצריך לשאול") or remove the premise.
- Note at `7-6.mdx:394`: "הקורס לא יודע שיש כלל שבנק לא נותן משכנתא נוספת" is hard to read; say "הקורס לא מכיר כלל כזה".

### 7.6-4 · minor · exercises
- `7-6.mdx:442` says "שלושה מהתרגילים צריכים מחשבון": numeric exercises are four (2, 3, 4, 6); only 7.6-2 needs a calculator (a multiplication). 7.6-3, -4, -6 are one subtraction each, labelled בינוני; 7.6-6 repeats the table above it ("קל").
- 7.6-5's correct option is the longest; 7.6-7 asks about the 4-part schedule that the table and cue 14 already show.

### 7.6-5 · minor · video and phone
- Frame `7-6-t060`…: "הון עצמי נדרש 720,000 ₪" without the ceiling and its label (M-6).
- Phone: both tables fit; no horizontal scroll. The formula box (381) hardcodes "70% נכתב 70": equals the fact `u.pct_rep`, but it is the one typed 70 in the lesson.

---

## 7.7 — עסקאות מורכבות, ב׳ (היכרות בלבד)

The best-labelled lesson of the four: the three-column table (what was said, who, how far to trust), the card sort with four bins including "החלטה של Mogi", the conditional examples marked "אילו התקציר נכון" in the text, the table caption, the frames and the cues ("אילו זה נכון: 50% על המגרש…"), and the distinction "pari passu versus second lien" taught as a distinction between what the course knows and does not (the prediction, line 154, 195). The reverse-mortgage FK is used with the life-insurance sentence withheld as unverified (FK-H-048 contradicts it), which is the right call. B-2 and M-7 above are the exceptions. What is left:

### 7.7-1 · minor · a letter taken twice
- `7-7.mdx:295–299`: the formula `(x + y) ÷ V × 100` uses **y** for the second loan; the letters table in AUTHORING gives **y** to a bond's yield (0.11) and says "never a table letter for something else". Use **x₁, x₂** or "ההלוואה הראשונה / השנייה" in the box.

### 7.7-2 · minor · exercises
- `7-7.mdx:475` (7.7-7 option 3): the option says "גיל 70 הוא הגיל **המינימלי**", the feedback answers "טענה על גיל **מקסימלי**…" (FK-H-006 says maximum). One of the two is a slip.
- 7.7-3 to 7.7-6 repeat the half-solved table and the worked example with the same numbers (1,200,000; 60%; 300,000; 1,600,000): the learner has already filled these cells. Vary the numbers (a 35% + 25% pair) so the exercises test transfer.
- `7-7.mdx:364`: "שלושה מהם צריכים מחשבון": 7.7-3 to 7.7-6 are four numeric exercises; only 7.7-4 needs a calculator.
- 7.7-2 and the prediction (`7-7.mdx:28–33`): the correct option is the longest and is near-verbatim from the table above.
- 7.7-7 option 2 ("הבנק יקבל את הכסף כשתמותו") is addressed to a 74-year-old client; the wording is harsh for a learner roleplaying the advisor. Say "כשהלווה יפטר".

### 7.7-3 · minor · the Mogi decision has no "who"
- `7-7.mdx:46, 182–183, 221, 543` and 7.8:421, 661: "החלטה של Mogi מ־29.7.2026". AUTHORING asks "with who and when". The date is the all-team meeting (field-knowledge DEC rows and the brief). Say "בישיבת הצוות".
- `7-7.mdx:221`: "ובמוצר של Mogi **זו** משכנתא שאינה בגרסה הראשונה": the decision is about the second-lien mortgage only; the lesson says it does not know whether pari-passu is the same thing. Say "משכנתא מדרגה שנייה אינה בגרסה הראשונה".
- `7-7.mdx:486`: "יועץ שמציג את מה שהוא לא יודע כידע גורם לנזק": an opinion; label "הצעה של הקורס" or soften.

### 7.7-4 · minor · wording and phone
- `7-7.mdx:146`: "איזה אישורים דרושים" → "אילו אישורים".
- The phrase "אילו" (if it were true) is used about 25 times; a beginner may read it as "אילו" = "which". Consider "בהנחה ש…" once, with "אילו" kept as the title word.
- Phone: no horizontal scroll. Table 0 (self-build): "הערך שנמדד", "תקרה" and "סכום מרבי" outside the box (the three numbers of the table); the seven-row map (table 4): "למי שולחים" and "מה זה" outside. Put "סכום מרבי" next to "השלב", and the map's "למי שולחים" second.

---

## 7.8 — סדנה: האם לתיק המחזור כדאי למחזר?

The case is one coherent story across the five parts; the "three measures" frame (test, payment, total) is the right organising idea and the bank ג׳ example (passes the test, lowers the payment 1,109 ₪ a month, costs 152,319 ₪ more) is the strongest teaching moment of the stage. The labelling of A, C, the Order and §15א is complete in text, caption and opening frame. B-1, M-1 to M-5 and M-9 above are the findings; what remains:

### 7.8-1 · minor · "שלוש עמלות ושתי נוסחאות"
- `7-8.mdx:115`: 7.1 teaches five fees; the part of case C names the discounting fee (two formulas), the operational fee, and says no-notice and index fees do not apply. "שלוש" matches neither. Say "מה עולה לצאת: העמלה, שתי נוסחאות ושתי עמלות שלא חלות".

### 7.8-2 · minor · task 2 says "חודש", the date is a day
- `7-8.mdx:127` ("ליום שלפני השלמת שלוש שנים") and 134: "**חודש** לפני שלוש שנים מלאות ההפחתה היא 0%, והעמלה גדלה ל־13,131.56". The fact date is **2026-06-30**, one day before 2026-07-01. The figure is right (13,131.56 with 35 payments made, my check); the word is wrong. Say "יום לפני".

### 7.8-3 · minor · ratio of "הכנסה פנויה"
- `7-8.mdx:111, 352`: the page calls the sum of the two net incomes (16,000) "הכנסה פנויה". In 4.3 the disposable income is net income minus the household's other obligations; case C is never said to have none. Say "ההכנסה נטו ביחד (הנחה: אין להם התחייבויות אחרות)". The ratio 39.21% in the keep route sits 0.79 point under the 40% line the frame draws; say it ("ועדיין מתחת לקו של 40%") — the video frame (`7-8-t163`) draws the 50% and 40% lines without saying which is which.

### 7.8-4 · minor · the sources of the labels
- Banks ב׳, ג׳, ד׳ appear without a bank א׳ (7.8 `offers`); say once that bank א׳ is the bank of the existing mortgage, or rename.
- `7-8.mdx:344` compares "ההלוואה הקיימת, 6.06% אפקטיבית" with bank ב׳'s "5.2%" in the same sentence without saying the second is a nominal rate (the lesson's own warning, line 121). Say "5.2% נומינלית".
- `7-8.mdx:307` "בדרך השנייה אין עמלת פירעון" is true by construction (the old loan is kept); say so.
- `7-8.mdx:163` "הכלי לראש" is a table recap, not a rule of thumb: the label of AUTHORING item 8 is "tool for the head: a rule of thumb, labelled an approximation".
- Cross-lesson: `1-5.mdx:56` (the tree result for internal refinance) says "אפשר גם להוסיף כסף מעבר לחוב הקיים, למשל לשיפוץ" as a fact; 7.8 (302, map row 2) says the course does not know whether a bank gives a top-up inside a refinance. 1.5 should say "לפי אילון".

### 7.8-5 · minor · exercises
- Levels: 7.8-3 (one addition), 7.8-4, 7.8-5 (one subtraction each) are "בינוני", 7.8-6 (one subtraction) "מאתגר". 7.8-2 is the only multi-step numeric one and is "קל". 7.8-1 and 7.8-7 are conceptual and have the longest option correct (7.8-7: the correct option is more than twice as long as the others).
- 7.8-7's wrong options give the right reasons (the test is rate only; the fee is part of the sum), which is good. Option 2 feedback "בנק ד׳ נכשל בו ובנק ג׳ עובר אותו ועולה יותר" is correct (my totals).
- Prediction (`7-8.mdx:80`): the correct option includes "בכמה עשרות אלפי שקלים", which gives the magnitude away; drop it.

### 7.8-6 · minor · phone (390px)
Page fits. The two tables the lesson is about hide their conclusion: the §15א table hides "פער מהרף" and **"המבחן"** (the verdict); the money table hides "סך שקלים עד הסוף" and **"חיסכון (שלילי: תוספת)"**, the point of the part; the top-up table hides "התוספת מוסיפה בסך הכול" and "מזה סכום הריבית"; the 5-row map hides "מה הוא לא יודע" and "למי שולחים". The hint "יש עוד עמודות" is present. Put the verdict and the saving in the first two columns, as the brief asks ("put the column the text discusses first").

### 7.8-7 · minor · video frames
- `7-8-t144`/`t171`: the title shows "התוספת: ₪ 150,000 לשיפוץ" with the sign before the number; fine, consistent with the course's LTR isolates.
- Frame `7-8-t163`: lines 40% and 50% without names; add "מגבלה" and "סף הון" (the lesson's names).
- Cue 21 "בשאר ההחזרים נספרת ההלוואה שנשארה: יותר מ־18 חודשים" is hard to parse; say "ההחזר על ההלוואה הקיימת נספר אם נשארו בה יותר מ־18 חודשים".

---

## Big-picture map: `src/components/big-picture/stage-7.ts`

**Structure.** 22 nodes, **43** links (the brief says 42; I counted 43 `{ from:` lines and my own parse found 43). All endpoints exist (`fee`, `directive_451`, `boi_average`, `present_value`, `track_*`, `mix`, `expected_total_rate`, `total_paid`, `underwriting`, `ltv`, `equity`, `obligations`, `schedule`, `collateral`, `value`, `same_property`, `pti`); every node has a link; no duplicate id; `stage-7.test.ts` passes (5 tests); no card states a number (a digit appears only for directive numbers). The nodes sit at the lessons that introduce them: 7.1 (2), 7.2 (3), 7.3 (2), 7.4 (4), 7.5 (1), 7.6 (5), 7.7 (3), 7.8 (2). 7.5 is thin: one node and two links for a lesson about three kinds of claim; nothing marks what is field knowledge (the note does).

**Cards that agree with the lessons:** `early_repay_fees`, `discount_fee` (apart from the A/C wording below), `time_reduction` (0/20/30% and "על עמלת ההיוון בלבד" match 7.2), `boi_average_fee` (A and C, effective versus nominal), `prior_notice`, `refi_test`, `comparison_rate`, `balance_report`, `lower_payment`, `refi_kinds`, `upgrader_deal`, `progress_draws`, `sale_law_guarantee`, `reverse_mortgage`, `refi_check`; links `track_prime → discount_fee` (7.3: "בפריים אין עמלת היוון בכלל"), `exit_point → discount_fee`, `same_property → refi_check`, `pti → refi_check`, `refi_kinds → underwriting` (labelled "קריאה של הקורס… לא אומת").

**Cards that overstate or mislabel:** see B-2 (`bridge_loan`, `builder_escort`, `lien_rank`), M-8 (`self_build`, `builder_escort`, `early_repay_order`, `exit_point`, the two maps). Two smaller:
- `discount_fee` what: "הנוסחה מחזירה את התשלומים העתידיים לערך של היום פעמיים: לפי ריבית השוק ולפי ריבית **ההלוואה**". In 7.2 and 7.8 the second discounting is at **C, the average rate on the grant day** (5.09%), not the loan's own rate (6.06% effective). Say "ולפי ריבית השוק ביום שההלוואה ניתנה".
- `early_repay_fees` role: "מי שמבלבל בין חמש העמלות, או חושב שיש אחת, טועה בחישוב **כמעט תמיד**": an unsourced frequency. Drop "כמעט תמיד".
- `refi_kinds` is in region "property" like the complex deals; a refinance is a "result"/"bank" region concept. Minor.

---

## Cross-lesson items

**What agrees, and needs nothing:**
- case C across 7.4, 7.5, 7.8: loan 700,000 at 5.90% for 20 years from 2023-07-01, 37 paid, 203 left, balance 637,956.74, payment 4,974.72, fee 10,365.95, financed 648,322.69, bar 5.82%; bank ב׳ is the same 5.2%, 2,400 offer in 7.5 (as "בנק אחר") and 7.8 (saving 31,397.05, 15 months, rate 5.38, same in both), and the numbers of 7.4's bank ג׳ example (300 months) reappear in 7.8;
- the "18 months" same-property rule, the 50% regulatory ceiling and the 40% capital threshold in 7.8 (352, 373–376) agree with 4.3, 4.5 and the stage-4 card `same_property` (including its "לא אומת");
- the 70/75 ceilings (7.6) agree with 4.4, and the 40% + 20% pair and the 75% ceiling (7.7) are FK-H-011 with fictional banks, labelled "הדוגמה של אילון, עם בנקים בדויים" (the real banks of the record are not named);
- FK ids used are 002, 003, 010, 011, 021, 036 (via the 7.6 sentence), 053, 064–067, 069; all appear as "ידע מהשטח, ממתין לאישור אילון"; no use of "עובדה מאומתת"; FK-H-048 used correctly (withheld);
- fictional banks only (בנק א׳, ב׳, ג׳, ד׳, "בנק אחר", "הבנק הנוכחי"); the learning-example mark on every page, callout, table caption, calculator note and opening frame; plural address; "נקודת אחוז" singular up to one (0.44, 0.02, −0.07); the "בשיעור הבא" lines match the map titles (7.5 → "7.6, עסקאות מורכבות, א׳"; 7.6 → 7.7 "עסקאות מורכבות, ב׳"; 7.7 → 7.8 "סדנה: האם לתיק המחזור כדאי למחזר?"; 7.8 → stage check and stage 8);
- no Brain, J-code, DEC-n, FK id in subtitles or frames; one "Brain" in learner Sources (7.5), "ריפו" in 7.5's body (7.5-1);
- `pnpm check:terms` passes; definitions of 7.6 and 7.7 label every definition "לא אומת" or "ידע מהשטח" and say the course does not know the terms; 7.5 and 7.8 introduce no new term; "בוליט" and "בלון" are 2.10's.

### X-1 · minor · every learner who opens 7.5 and 7.8 meets the same calculator content
7.5 and 7.8 render the same `RefinanceCalculator` with different presets. Both show a "הצגה כטבלה" button and the same paragraph. No issue; noting that the first-column order (existing loan, then the offer) is the right one for the tasks.

### X-2 · minor · the stage-7 phone screenshots do not exist
`qa/screens/` has no `phone_lessons_7-*` or `desktop_lessons_7-*`; `pnpm screens` was not run for stage 7. The coordinator should run it. My own 390px run (Chromium, `he-IL`, all four pages, islands hydrated): no page scrolls sideways (document 375 in a 390 viewport) and no console or page error. Table results are in 7.5-5, 7.7-4 and 7.8-6.

### X-3 · minor · the "טיפה" of difficulty ordering
All four lessons order exercises easy → hard and have 7 each (`קל` ×2, then `בינוני`, then `מאתגר` ×1–2), as AUTHORING asks. The difficulty tags track the position, not the work: see 7.5-4, 7.6-4, 7.7-2, 7.8-5.

---

## Count

**2 blockers** (B-1: the test and entry costs; B-2: introduction-only violations in 7.6, 7.7 and three map cards), **9 major** (M-1 to M-9), **about 40 minor** (7.5: 5 items, 7.6: 5, 7.7: 4 groups, 7.8: 7 groups, map and cross-lesson: 6).

**The most important items, in the order I would fix them:**
1. **B-1:** `7-8.mdx:265`: the §15א test does include the new loan's entry costs (5.38 against 5.33; 5.43 with doubled costs).
2. **B-2:** `7-6.mdx:267, 330`, `7-7.mdx:240, 484` and the cards `bridge_loan`, `builder_escort`, `lien_rank`: sentences about costs, collateral, repayment source and purpose that the lessons themselves list as unknown.
3. **M-1:** the 39,284.12 is 31,397.05 of refinance saving plus 7,887.07 of top-up difference; the separate loan has no entry costs.
4. **M-2:** the sample recommendation's ceiling of 5.6% leaves a total saving of 2,876 ₪ and a margin of 0.02.
5. **M-5:** `7-8-t048` (overlapping label and amount), `7-8-t133` ("210,256" clipped to "0,256"), `7-7-t173` (overlapping chips).
6. **M-3 and M-4:** "אין מבחן" for the top-up; the 0.46 that is 5.82 − 5.37 = 0.45 on the printed numbers.
7. **M-6 and M-7:** labels missing on frames and cues (7.5, 7.6, 7.8); the self-build "total cap" reading is the course's own.
8. **M-8 and M-9:** the cards of `self_build`, `builder_escort`, `early_repay_order`, `exit_point`, the two maps; the workshop that asks for no writing and the exercises that say they need a calculator.
9. The 7.7 letter `y`, the 7.7-7 min/max slip, "חודש" for a day in 7.8, "שלוש עמלות" and the phone tables whose verdict columns scroll out of sight.
