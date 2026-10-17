# QA report: lessons 9.3 and 9.4, read as a beginner (2026-10-17)

Reviewer's report. No source file was edited. Line numbers are those of `src/pages/lessons/9-3.mdx` and `9-4.mdx` (±2).

**Reader:** finished stages 0–8 and 9.1–9.2.
**Method:** MDX, a scratch build (`astro build --outDir <scratchpad>/rev2/dist`), both `.he.vtt` files, key frames `9-3-t084` and `9-4-t103` (spot check), facts JSON, `case-a-recommendation.ts`, `RecommendationReport.vue` and `DualExplainer.vue` (behaviour seen in the build). Browser checks at 390px and 1280px: no horizontal page scroll in either lesson (page width 375 of 390). Wide tables sit in `overflow-x-auto` boxes with the course's scroll hint.

**Recomputed independently** in plain Python `Decimal` with no import from `src/`. The schedule is a cent-rounded annuity with the last payment clearing the balance.
- Fixed 30-year alternative at 4.40 / 4.30 / 4.35 / 4.20 / 4.15 / 4.55 on 1,619,000: first payments 8,107.32 / 8,011.97 / 8,059.57 / 7,917.19 / 7,870.01 / 8,251.40.
- Totals 2,918,634.57 / 2,884,308.34 / 2,901,447.27 for banks a/b/c; the gaps 34,326.23 (a over b) and 17,138.93 (c over b).
- Ratios 40.04 / 39.57 / 39.80 / 40.75, on disposable income 20,250 = 21,700 − 1,450. The line is 8,100 and the room is 88.03. The margin over the budget is 738.03 = 20,250 − 11,500 − 8,011.97.
- The "what if" rate rises: +0.05 → +47.60 a month and +17,138.93 in total; +0.10 → +95.35 and +34,326.23; +0.25 → +239.43 and +86,198.72.
- Negotiation rounds: −0.10 saves 94.78 a month and 34,121.29 in total; a further −0.05 saves 47.18 and 16,981.54; together 51,102.83.
- Appraisal table: LTV 74.44 / 75.30 / 77.10; maximum loans 1,631,250 / 1,612,500 / 1,575,000; extra equity 6,500 and 44,000; left 12,500 and −25,000 (short 25,000). The break-even value is 2,158,666.67 and the margin from the price 41,333.33.
- Dates: approvals 3, 5 and 6 November; validity to 27, 29 and 30 November; 18/20/21 days left on 9 November. Round answer 12 November; latest start 18 November; 3 rounds (starts 9, 12 and 16 November). Business days are Sunday–Friday, the exercise's rule.
- 9.4: the car-free ratio 36.92 (gain 2.65), 8 payments until the car loan stops counting, Shira 9,600 − 9,300 = 300, the three "price of certainty" gaps and the budget limits (12,238.03 / 11,614.12 / 14,018.24), and all the pair counts (12, 3 refused, 1 budget, 8 ok, 11 rejected).

Every one of these matches the page. 9.3 matches 9.2 (same loan 1,619,000, same b/a/c exposure figures, same 169,652.31, 1,688.32 and 34,326.23). The recommendation (fixed-only at bank b) follows its own stated rule, so it is consistent with 9.2.

**Not recomputed** (needs the lesson-8.10 engine): the payment and total alternatives' stress and macro schedules (the rises 17,406.97 and 1,038.08, the stress/macro totals, 2,079,388.29, 44,402.60 and 232,322.35). Only the subtractions were checked, and they are right.

**Blockers:** none. **Count:** 5 major, about 18 minor.

## Major

**M1 · 9.3 lines 120, 162, 197 and 9.4 line 415 (+ video 9-3 cue 5, 9-4 client text) · "the worst month of the stress" is not the worst month.** The page defines the budget filter on the worst payment *within the first five years* (`max60`). The total alternative has a variable track that resets at month 61; the table's own "rise in stress" of 1,038.08 shows a stress payment of 9,673.96. That month lies just outside the window, so the filter cannot see it. The page tells the family "המרווח שלכם בחודש הגרוע היה 114.12 בלבד" (9.4 line 415, and the shorter client line 47 and 142). The real worst month in stress is about 924 ₪ short (9,673.96 against the 8,750 the family can afford). This also sits in the exposure table and the hand-off to 9.5. By analogy with 8.10 (initial mix, `max_month` 61) the month is 61; the engine fact does not print it, so please check. Fix:
- Say what the window is: "החודש הגבוה ביותר בחמש השנים הראשונות, בתרחיש הלחץ" in all places, and replace "בחודש הגרוע" in 9.3 lines 120 and 162, in 9.4 lines 141 and 415, and in video cue 5.
- Add one sentence in 9.3 (after line 162): "25 שנה כוללת מסלול שמתעדכן בחודש 61, מיד אחרי החלון; שם ההחזר הוא 9,673.96 ₪ והתקציב נשבר. חמש שנים הן בחירה של התרגיל, לא כלל של בנק (הנחת חישוב)."
- Or widen the window to cover the first reset and let the facts show the real margin.

**M2 · 9.3 lines 197, 255 and the table at 176 · the "rise" of the linked alternative (17,406.97) is a number from month 360, presented as what stress "does" to the family.** The column caption (194) says "בכל תקופת ההלוואה", but lines 197 and 255 say "הלחץ מעלה אותו בעד 17,406.97". It is a nominal payment 30 years out under 4% indexation, against an income that is not indexed in the model. A beginner reads "payment jumps from 6.3k to 23.7k" or concludes the stress is absurd. The number is the first-year payment against the last-year one. Fix: in line 197 and in 9.4 lines 245 and 397 add "(בחודש האחרון של ההלוואה, אחרי 30 שנות מדד של 4%, במחירים של אז; תרחיש לחץ, לא תחזית)". In the 9.4 caption (245) the 2,079,388.29 "גבוה יותר" is a nominal lifetime total and needs the same words.

**M3 · Exercise design: the correct option is the longest and the most hedged, and the positions repeat.**
- 9.3-1: correct 118 characters against 83/87/71.
- 9.3-7: correct 116 against 86/84/78; both 9.3 choice exercises key to the second option.
- 9.4 prediction (line 41 vs 39/40/42): correct option 206 characters against 103/125/83, and it is the only one that adds a caveat. Both predictions key to index 2.
- 9.4-7: correct is first, and the other three are about as long.

Fix:
- 9.3-1: shorten the correct text to "שיעור המימון, 73.59%, מעל התקרה של בנק ד׳ (70%), בכל שלוש החלופות", and put it first or last.
- 9.3-7: move the correct one to position 4 and shorten it to "מחשבים מחדש את כל הטבלה לתמהיל החדש ובודקים אם העדיפות מתקיימת".
- 9.4 prediction: shorten the correct option to "25 שנה אצל בנק ב׳: סך נמוך ב־169,652; המרווח דק והיחס מעל 40%" and lengthen option 4. Move it to position 1 or 4.
- 9.4-7: put the correct one third.

**M4 · 9.3 line 353 · "ההלוואה שהומלצה יושבת על התקרה של 75%" is false.** The loan is at 73.59% of the price (the table says so). It reaches the ceiling only if the value falls to 2,158,666.67. A learner who computes 1,619,000 ÷ 2,200,000 sees 73.59 and doubts the page. Fix: "ההלוואה שהומלצה, 1,619,000 ₪, היא 73.59% מהמחיר. היא מגיעה לתקרה של 75% רק אם השווי יורד ל־…". Also line 236 and the third paragraph under the headline; the 9.4 client text (48) is fine.

**M5 · 9.3 line 117 onwards and 9.4 · the alternatives' names are never explained on these pages.** "צמוד, שליש קבועה" and "25 שנה" appear about 40 times, in the report tool, tables and exercises. Nothing says that "25 שנה" is two thirds variable unlinked plus one third fixed unlinked, both for 25 years; and that "צמוד, שליש קבועה" is two thirds variable linked and one third fixed linked for 30 years. The reader also cannot tell why bank b's rate for it is 4.00 or 4.30, why the fixed one is 4.30, or why "צמוד" has a 0.25 relief. In the client text (9.4 lines 47 and 142) "הלוואה ל־25 שנה" is described to a client with no indication that it carries a variable rate. Fix: add a two-row key under the first table in 9.3 (after line 157), and one sentence in the 9.4 client text: "הלוואה ל־25 שנה: שני שלישים בריבית שמתעדכנת, ולכן ההחזר שלה יכול לעלות".

## Minor

**Labels, term-before-use, "we", leaks**
- 9.3 line 288: a quotation in the first person plural ("אנחנו מחליטים מתי מספיק"). Change to: "עמדה של הצוות מאוגוסט 2026, לא כלל רשום: הצוות מכריע מתי מספיק".
- 9.3 line 716 (Sources): "לפי תעתיק של הצוות ב־Brain" and the typo "כסף מחיר": say "בתיעוד הצוות", and "סף מחיר ולא סירוב".
- 9.3 lines 87 and 395 and the report checklist ("שאלה פתוחה לאילון ולבנק", "שאלות פתוחות לבנק, לעורך הדין ולאילון"): replace "שאלות לאילון" with "ממתין לאישור אילון". The same wording was flagged in the 8.10–8.19 report.
- 9.3 line 214 vs 197: "בנק ב׳ הוא הזול" is labelled in the Callout (204), good. The exposure table caption (194) ends with the fragment "בתרחיש הבסיס." Make it a sentence: "הסכומים הם בתרחיש הבסיס."
- Legal and ethics parts. 9.4 line 263 ("ומה הדין על הפרה: לא ידוע, שאלה לעורך הדין") and line 277 first bullet (statements about the law, "אינו מוסדר בחוק"): write "לא אומת, שאלה לעורך הדין" at the point of the claim, as the brief requires, not only in Sources. Line 277: put "לא אומת" at the start of the bullet, since it states the law's status as fact. Also 9.3 lines 331 and 325 say only "שאלה לעורך הדין".
- 9.4 line 48 and 143 (client text): "סף שבנקים מסתכלים עליו" is stated as fact for a threshold that is elsewhere "לא אומת, תעתיק". Write "סף שלפי הערכה בנקים מסתכלים עליו (לא אומת)". "ההכנסה הפנויה" is used in a client sentence without a definition: "ההכנסה אחרי הלוואת הרכב". And "מדד" (line 46 and 141) is jargon without an explanation in the very text that teaches "מילה מקצועית רק עם משפט שמסביר אותה" (and is on the tool's own jargon list): "עם המדד (עליית המחירים)".
- 9.4 line 46 and 141: "הסכום שאמרתם שאתם צריכים לחיים": the budget 11,500 is the course's own assumption (the page admits it on line 54 and in the Sources). Add "(בדוגמה: 11,500 ₪ שהונחו)".
- 9.4 line 260: "אותו מספר יתאים למשפחה אחרי שההלוואה תיגמר, וזה סיפור הגון. היום הוא נייר שאינו המציאות" is obscure. Rewrite: "אותו מספר יהיה נכון אחרי שההלוואה תיגמר. היום הוא אינו מתאר את המציאות, ולכן הצגתו כאילו הוא נכון היום היא הסתרה."
- Business days: 9.3 lines 263 and 267–279 give 3 business days, 7 days, 3 rounds and "עד 18 בנובמבר", but never say that the exercise counts Sunday–Friday and not Saturday (the numbers cannot be reproduced on a Monday–Friday calendar: the last start would then be 17 November). Add "ימי עסקים בתרגיל: ראשון עד שישי".
- 9.3 line 524 (step 5 record): "מתחת לקו של 10,000: עוצרים" reads like this round stopped, against step 4 where it passes. Write "קו עצירה: 10,000 ₪; חיסכון נמוך ממנו: עוצרים. כאן 34,121.29: ממשיכים."
- Video frames `9-3-t084` and `9-4-t103` carry no "דוגמה לימודית" mark (the brief wants it on every worked table or figure). `9-3-t084` shows one card on the right and an empty left half: check that it is not a mid-animation frame. Not all 18+17 frames were opened.

**Correctness and clarity**
- 9.3 line 201 and 9.4 line 53: the "ratio 40.04%, 0.04 above the line" of bank a is a rounding-scale gap, and the +0.10 rate move crosses the line by the same 0.04 (9.3 line 434, 9.4 lines 48 and 55). Say "בקושי מעל הקו (0.04 נקודות אחוז)", so that no one takes it for a real breach.
- 9.4 line 55 / 217: "ההמלצה נשברת אם התקציב האמיתי מעל 12,238.03" assumes the car loan (1,450) stays in the disposable income for the five years, but it ends after 26 months (9.4 line 304). The budget limit is therefore conservative from month 27 on. One clause: "כל עוד הלוואת הרכב נספרת".
- 9.4 line 245 caption: "בלחץ ההחזרים של חלופות משתנות עולים" is placed under the sensitivity table, but the comparison it gives is to the chosen alternative. See M2.
- 9.4 line 248: "מי שחושש מריבית עולה משלם הרבה פחות על הקבועה": this is true only for this stress. Add "בתרחיש הלחץ של התרגיל".
- 9.4-3 error message (line 494) "בלעדיה ההכנסה הפנויה גדולה יותר": the income is the same; what changes is the obligation that leaves the deduction. Write "בלעדיה מחלקים ב־21,700 במקום ב־20,250".
- 9.4-3 and the table at line 304: "(בכמה אחוזים, שתי ספרות אחרי הנקודה.)" is fine, but the answer 36.92 is also the figure the bank would see "אחרי 8 תשלומים": add that the 8 payments leave 18 months.
- 9.4-6 near={0}/tolerance={0}: unit is set, good. All numeric exercises in both lessons carry a proper `unit=` (₪, ימים, %, תשלומים).
- 9.3 line 117: the count "12 צירופים" is a count, not a calculation; fine. 9.3 lines 123–125: a Callout describing the 40% "flag" as "דומה לשלד של האלגוריתם" is good and carries the "Mogi היום אינה מחשבת תמהיל בקוד" line; keep.
- 9.3 first table (7 columns) is 549px in a 341px box at 390px, and the "מעל תקציב המחיה" column is off screen; the second table is 385px. The scroll hint is shown and the page works, but the key column for the budget filter is on the far side. Fix: below 640px show the three cards (as `RecommendationReport` already does) or move "מעל תקציב המחיה" next to "תוצאה".
- `RecommendationReport` at 390px: usable (cards, step order, checklists). On the bank cards the line "עלייה בלחץ, ₪: 0" appears inline beside another value on the exposure alternative; put each value on its own line.
- `DualExplainer`'s auto-checks are loose: any digit satisfies "סכום בשקלים להחזר החודשי" (`digits: true`), and the word "ריבית" alone satisfies "מה יכול להשתבש, ומה עושים". The page says they are hints; make that explicit in the task text ("חיפוש מילים, לא הוכחה") or tighten them (a number followed by ₪ or "שקל").
- Checklist (`releaseChecklist`): the item "gap-income" refers to "ההפרש בהפקדה של נועם והתשלום החד־פעמי של שירה" from 9.1 without the numbers; the 9.4 page gives 900 and 300 for the second. Add the sum in the checklist or point to 9.4. The checklist "validity" says "ב־יום ההחלטה נשארו 20 ימים": the lesson's today is 9 November, which is not the "decision day" of the Bank of Israel (23 November). Say "ביום הבדיקה".

**Videos.** Cues match the pages: 9-3 cue 3 (12 combinations), 4 (bank d refuses all), 6 (eight remain, three fixed-only), 9–11 (no rise, thin margin, certainty costs total), 13 (no cheaper offer), 14 (stop rule), 16–18 (appraisal, break-even, not known); 9-4 cues 6–8 (hard filters then priority), 9–11 (the price of certainty differs per scenario; no single number), 12–13 (car loan), 14–16. No ids, paths or Brain mentions in the VTT. Cue 5 of 9-3 repeats M1. Nothing in 9-3 mentions the negotiation numbers (34,121 / 16,982), which is fine. Last cue ends at 2:52 (9-3) and 3:01 (9-4).

## Order to fix
1 M1, M4 · 2 M2, M5 · 3 M3 · 4 the legal and label items · 5 the rest of the minors.
