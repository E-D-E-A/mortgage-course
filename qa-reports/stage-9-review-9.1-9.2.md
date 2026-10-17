# QA report: lessons 9.1 and 9.2, read as a beginner (2026-10-17)

Reviewer's report. No source file was edited. Line numbers are MDX lines (about plus or minus 2).

**Reader:** finished stages 0-8. **Method:** MDX, a scratch build (`astro build --outDir <scratch>/rev1/dist`) read as text and at 390px and 1280px in headless Chromium, `.he.vtt` files, key frames in `qa/video`, facts JSON, and the two components. Independent plain-Python `Decimal` recomputation (no import from `src/`) of:
- 9.1: the three income averages, the 21,700 and 20,250 figures, the 50% and 40% payments, the account statement (291,020 to 300,000), all three financing ratios (74.55, 79.09, 88.18), the appraisal table and break-even (2,186,666.67), the starting-mix payment 8,181.30, ratio 40.40, left over 12,068.70 and margin 568.70, and the 240 / 300 gaps.
- 9.2: the plan step (21,000 is the smallest whole thousand; 20,000 gives 39.91, above the 39.9 target), loan 1,619,000, ltv 73.59, the shape 539/540/540k and 1,079,000 + 540,000, break-even 2,158,666.67, slack 41,333.33, 2,150,000 giving a 6,500 shortfall and 12,500 left in reserve, every request first payment (A after relief 7,934.02, A at list 8,076.53, B 8,045.81, C 8,075.94), the 25-year first payment 8,635.88 and its margin 114.12, the fixed-only totals at A, B and C (2,918,634.57 / 2,884,308.34 / 2,901,447.27, to the agora), the linked first payment 6,313.84 (the page's 6,323.65 includes month-one indexation), and every difference printed in the text (cost, spread, gain, price, rise).

All of them match.

**Not recomputed:** the 25-year and linked scenario totals and maxima (stress, macro). The five-year variable reset on the 451 curve could not be reproduced from the printed inputs without the stage-8 engine rules (my best attempt gave 2,696,420 against the printed 2,714,656; this is my reconstruction, not a finding). The ratio column for the linked alternatives (see M3) was not reproduced from the printed numbers either.

**Checks that pass:**
- `check:terms` is clean.
- No horizontal page scroll at 390px or 1280px, and no console or hydration errors.
- Every worked table carries the synthetic label, and the "no real client data" note appears once, in 9.1.
- No Brain page numbers, J-codes, DEC or FK ids, or file paths in the built text.
- Numeric exercises show ₪ by default and have `unit=` where the answer is not money (9.1-5 and 9.2-6).
- Video cues match the pages except where noted below.

**Blockers:** none. **Count:** 6 major, about 12 minor.

## Major

**M1 · 9.2 · "the price of stability" and "the price of the linked track" are really the price of five extra years.**
- The linked track and the fixed-only alternative are 30 years; the "lowest total" alternative is 25 years.
- Fixed 4.30% over 25 years (the same rate the 25-year alternative already pays on its fixed part) totals 2,644,838.15. That is 69,817.88 LESS than the 25-year alternative's 2,714,656.03 in the base scenario. Of the printed 169,652.31, the term alone explains 239,470.19; the "price of stability" is negative in the base case.
- Affected places:
  - MDX bullet 3 of "שלוש חלופות" (about 196), "מי שמשלם על ודאות משלם עליה";
  - the PredictionReveal notes for options 0 and 2 ("הצמדה מוסיפה לחוב", "יציבות עולה כסף");
  - the half-worked table and its success text;
  - exercise 9.2-4's solution ("המחיר של היציבות");
  - the five-questions box;
  - video cue 16 ("ומשלמים על זה").
- The prediction stem also says "אותה הלוואה", and the correct answer ("משלמים פחות שנים") partly says this itself.
- Fix (a, preferred): add one sentence and one row. "הפער כולל חמש שנות תשלום נוספות. קבועה ל־25 שנה באותו ריבית (4.30%) הייתה עולה 2,644,838.15 ₪ בבסיס, עם החזר ראשון של 8,816.13 ₪ ומרווח של −66.13 ₪ מתקציב המשפחה. המחיר האמיתי של היציבות הוא ההחזר החודשי הגבוה, לא הסך." Change "היציבות עולה 169,652.31" to "הקבועה ל־30 שנה גבוהה ב־169,652.31 מה־25 שנה, בעיקר בגלל ההפרש בשנים". Rework the video line to "הקבועה לא זזה, אבל ההחזר שלה גבוה" (that line must also be re-rendered).
- Fix (b): give the fixed alternative 25 years so the three differ only by what the goal changes. This needs a calc change and a new recheck; the brief does not allow it on this pass.

**M2 · 9.2 · "בנק בנק א׳" in the built page.** MDX 151 and 305 write `בנק {BANK_NAME[...]}`, but `BANK_NAME` already starts with "בנק". The page reads "הזול ביותר הוא בנק בנק א׳" and, in the "מה הייתם אמורים לראות" list, "בנק בנק א׳". Fix: drop the leading "בנק " at both lines (and at the two further uses in line 305).

**M3 · 9.2 · the ratio column cannot be reproduced from the table beside it.**
- Request at bank A is printed "39.88%" next to a first payment of 7,934.02. A beginner computes 7,934.02 ÷ 20,250 = 39.18.
- The same happens for the linked alternative: 6,323.65 gives 31.23, not 32.22.
- The reason is that the ratio is measured at the bank's list rates before the relief, while the payment shown is after the relief. This appears nowhere in the lesson. The same goes for `CaseFileCompare` ("יחס החזר" next to "החזר ראשון") and for video cue 5.
- Fix: in the bank table note and the alternatives table note, add "יחס ההחזר נמדד על הריביות במחירון, לפני ההנחה; ההחזר הראשון מחושב אחרי ההנחה, ולכן ההחזר הראשון חלקי 20,250 נמוך מהיחס". Alternatively, add a column "החזר לפני הנחה". Add the same sentence under the component.

**M4 · 9.2 · the "מעל התקציב בחודש הכבד" column does not follow its own note.**
- The note says "אחרי ההחזר והלוואת הרכב". For the linked rows 21,700 − 6,976.44 − 1,450 − 11,500 = 1,773.56, but the table says 3,223.56.
- The figure is taken at the month of the highest payment (month 60), when the car loan (26 months) has already ended. The family's tightest month is month 1 (2,426.35 for the linked track), which the table does not show.
- Fix: either redefine the column as "המרווח בחודש שבו ההחזר הגבוה ביותר, כשהלוואת הרכב כבר נגמרה אם החודש אחרי 26" and add a "מרווח בחודש הראשון" column, or switch to the minimum margin over the first 60 months (linked track: 2,418-ish; compute in code). Rewrite the note and the "ההכנסה נשארת קבועה" sentence to match.

**M5 · 9.2 · the "התוצר" table (9 columns) and the other wide tables are cut at 390px.**
- The output table is 608px in a 341px box. Only 6 of 9 columns are visible; the three total columns (base, stress, macro), which are the lesson's output, are off-screen. The first column wraps four words to four lines.
- The bank table is 457px and the alternatives table 432px; the "חשיפה" column is cut off.
- A scroll hint exists, but the key numbers are the hidden ones.
- Fix: below 640px render each row as a card (name, bank, ratio, first payment, exposure, then a three-line "סך: בסיס / לחץ / מקרו"), as 6.4 and 6.5 did. As a cheaper fix, move the three total columns next to the label by splitting the output table into two tables.

**M6 · 9.1 · "10 documents" are counted on a page that shows 8 claims, and the document states are never shown on the page.**
- MDX 80-109. The table lists 8 claims with their states (3 תקין, 2 עם שאלה, 2 חלקי, 1 חסר). The next paragraph says "מתוך עשרת המסמכים, חמישה תקינים, שניים תקינים עם שאלה, שניים חלקיים ואחד חסר". The video repeats it (cues 3 and 4).
- A learner who counts the table gets a different split, and the state of each document (a different thing from the state of each claim) is shown only after pressing "בדיקה" in the checker.
- Fix: add a second small table "המסמכים ומצבם" (10 rows, name and state), or say "מתוך עשרת המסמכים (המצב של כל מסמך מופיע בבודק המסמכים למטה, וההצגה כטבלה): ...". Define once that a document's state is the worst across the claims it supports, and a claim's state is the worst across its documents.

## Minor

**Rule violations and labelling (cheap)**
- "we" forms, against the brief:
  - 9.1: 462 "נחשב את הדף"; 646 "יתגלה אצלנו".
  - 9.2: 60 "שבחרנו"; 194 "ושום בנק אצלנו"; 205 "שבחרנו"; 267 "נבדוק את זה"; 293 "כל מה שבנינו"; 382 "נחשב".
  - Fix: use the plural-address forms: "חשבו את הדף", "אצל הבנקים בקורס", "שבחרו כתרחיש", "בדקו זאת", "כל מה שלמדתם", "חשבו".
- 9.1 Sources (about 678): "בריפו של הצוות" is the word "repo" in learner text. Replace with "בתיעוד הצוות".
- 9.1 about 244: "שאלה לאילון, מ־4.2" should read "ממתין לאישור אילון". Also in the same sentence "שני דברים שהתיק לא יכול להראות" lists only one (the unrecorded obligation); add the second (for example "ושהלווים לא ערבים להלוואה של מישהו אחר") or write "דבר אחד".
- 9.2 "ידע מהשטח" box: the lesson mentions the stage-8 algorithm, so by the brief the היום/הוחלט/עתיד triple is required. The callout gives only "היום" ("ב־Mogi היום אין חישוב תמהילים בקוד"). Add הוחלט (the algorithm is core and an LLM never calculates; decision date as in the stage-8 box) and עתיד (what stage 8 would do systematically). 9.1 line 45 also mentions the algorithm ("איך אלגוריתם מחפש") but only in passing; no box needed.

**Labelling the kind of number**
- `CaseFileCompare` tags the rates "הצעה בדויה", but the lesson ("איזה מספר זה?", the video and the sources) says that no personal offer exists yet; these are estimates. Rename the chip to "אומדן" and keep "תרחיש" and "חישוב על הבקשה". This one line contradicts the lesson's own thesis.
- 9.1 about 381: "הבנק, ב־40%, מגביל ל־8,100" and "ממה שהקו מרשה" contradict the table row "סף ולא איסור". Write "הקו של 40% (סף הון, לא איסור)".
- 9.1 about 314: "חשובים יותר מכל שאר הפערים ביחד" needs "לפי הסכומים: 300,000 ₪ מול פחות מ־3,000 ₪ בחודש".
- 9.2 "הזול ביותר" in the bank table is not hedged as "לפי כללי התרגיל" in the lead sentence.
- 9.2 about 157: "אותה בסיס" should be "אותו בסיס". The "מה שונה" cell shows "התמהיל" for 25 versus 30 years, but the term also differs; write "התמהיל והתקופה".
- 9.2 about 190: "הנחה 0.25" in the alternatives table needs "נקודת אחוז". `CaseFileCompare` table view says "הנחה 0.15" without a unit, and the card says "נקודות אחוז" (plural, against the page's "נקודת אחוז").
- 9.2 about 236: "אם השמאות 2,150,000 בהלוואה מרבית" is unclear. Write "אם השמאות יוצאת 2,150,000, ההלוואה המרבית היא 1,612,500, וההלוואה של התוכנית גדולה מדי ב־6,500".

**Exercises**
- Correct option is the longest or most hedged in 9.1-3 and 9.2-5. The correct option is first in 9.1-8 and the longest is wrong, so it is fine there. Spread positions: 9.1 has correct at 3, 2, 1 in order; 9.2 at 3 and 4. No two consecutive exercises share a position, but the "longest" pattern repeats; shorten the correct text to match the distractors, for example 9.2-5: "כי התמהילים שונים, וההשוואה לפי מחיר מותרת רק על אותו בסיס".
- Money exercises rely on the default `unit` ₪; adding `unit="₪"` is optional.
- 9.2-4's solution inherits M1.

**Component notes**
- `DocumentChecker` shows what each document says before the learner marks, including the August 240 gap and "ההעברה עוד לא הופיעה"; task 1 ("בכמה טעיתם") becomes easy and the "common mistake" list item is partly spoiled. Consider showing the content after the first mark. The "בדיקה" button disappears in table view with no explanation. The result line "X מתוך 10" is a score, against "לא ציון".
- Components fit at 390px with no horizontal scroll (layout read only; I did not exercise the buttons in the browser beyond load).

**Numbers and wording**
- 9.1: the summary line gives ratio 40.4% for the starting mix; the text says "יחס ההחזר", and the video says "מההכנסה" where the base is the disposable income (20,250), not the income. Change cue 19 to "40.40% מההכנסה הפנויה".
- 9.2: "ההכנסה נשארת קבועה" is stated; add that this means the stress rows ignore wage growth (already in the Sources). Fine.

## Videos

- Cues match the pages except for the M1 line (9.2 cue 16), M3 (cue 5) and 9.1 cue 19 above.
- 9.1 frame t129 (cue 16, 125-133s) shows 74.55 and 79.09 but not the 88.18 the cue says; show the third figure at the cue's start.
- Mixed shekel-sign style in the cues: some isolates include the sign (`⁦560,000 ₪⁩`), others keep the sign outside (`⁦9,600⁩ ₪`). Choose "number only inside, sign outside", as the brief says (9.1 cues 8, 12, 13, 17, 18; 9.2 cues 3, 4, 11, 12).
- Spot-check frames for direction of ₪ and %: t129 shows "%74.55" while t159 shows "40.4%". I could not settle from the images which is correct; make them consistent.
- No paths or ids in VTT. Key frames contain only the synthetic label.

## Order to fix
1. M2 (typo, one line). 2. M1, M3, M4. 3. M5, M6. 4. The `CaseFileCompare` chip "אומדן". 5. "We" forms, "ריפו", the triple. 6. Exercises and wording. 7. Video cues 5, 16, 19 and the sign style, then re-render.

## Ownership
Both lessons: author A.
