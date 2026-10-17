# Course read, stages 8 and 9 (2026-10-17)

Reader: a beginner who finished stages 0-7. Method: scratch build (`astro build --outDir <scratchpad>/read89/dist`, 137 pages), rendered text of 8.1-8.28, 9.1-9.5, check 8 and check 9 with all component props decoded (answer keys, error messages, options), a 390px browser pass with playwright-core, independent Decimal recomputation, a spot-check of 10 video frames and of all 33 `.he.vtt` files. No source file edited, no git, no video rendered. Line numbers are MDX lines unless a data file is named. Findings already closed in earlier reports (tap targets under 44px on `summary`, Term buttons and radio inputs, from course-read-4-5) are not repeated.

## Major

1. **Wrong or empty unit label on 25 numeric exercises** (`NumericExercise.vue:93` prints `התשובה שלכם ({{ unit }})`; default `unit="₪"`).
   - Missing `unit`, so the learner sees "(₪)" on a percent, a count or a plain number:
     - 8-3.mdx:272 (average ratio, %), 8-3.mdx:280 (75th percentile of ratios, %), 8-3.mdx:288 (standard deviation, "באלפי שקלים").
     - 8-4.mdx:240 (expectation of a die, a plain number).
     - 8-5.mdx:261, 269, 277, 285 (margin / MAE in percentage points).
     - 8-6.mdx:291, 299 (counts of requests / structures).
     - 8-7.mdx:315 (a count of candidates out of 12).
     - The same default also gives `near = 1` for these, so a wrong answer within 1 gets the "close, check rounding" note. For 8.5-3 (key 0.01) any value from 0 to 1 is "near".
   - `unit=""`, so the label reads "התשובה שלכם ()":
     - 8-8.mdx:288, 306, 354.
     - 8-11.mdx:303, 335.
     - 8-12.mdx:294, 327.
     - 8-13.mdx:253, 271, 288, 305.
     - 8-14.mdx:266, 284, 302.
   - Fix, units in the MDX:

     | Exercise | unit |
     |---|---|
     | 8.3-2, 8.3-3 | `unit="%"` |
     | 8.3-4 | `unit="אלפי ₪"` |
     | 8.4-2 | `unit="ללא יחידה"` or `"נקודות על הקובייה"` |
     | 8.5-2 to 8.5-5 | `unit="נקודות אחוז"` |
     | 8.6-3, 8.6-4 | `unit="בקשות"` and `unit="מבנים"` |
     | 8.7-4 | `unit="מועמדים"` |
     | 8.8-2, 8.8-3 | `unit="ציון"` |
     | 8.8-6 | `unit="תמהילים"` |
     | 8.11-2, 8.12-3 | `unit="עתידים"` |
     | 8.11-4 | `unit="שבר, 0 עד 1"` |
     | 8.12-5 | `unit="נקודות אחוז"` |
     | 8.13-1 to 8.13-3 | `unit="תמהילים"` (8.13-2, 8.13-3: `unit="דרכים"`) |
     | 8.13-4 | `unit="שנים"` |
     | 8.14-2 to 8.14-4 | `unit="תמהילים"` (8.14-3: `unit="קריאות"`) |

   - Also change `NumericExercise.vue:93` to `התשובה שלכם<span v-if="unit"> ({{ unit }})</span>`, so an empty unit never prints "()".

2. **The 2026-08-31 "החלטה של Mogi" is used for more than the document-vs-client contradiction rule.** The rule says that date is only for that rule.
   - 9-3.mdx:730 puts three other things inside one Sources entry dated 2026-08-31. They are the rule that a language model never computes (2026-07-29) and the consent rule (undated).
   - 9-4.mdx:614 does the same, and adds the income-state split (Eylon, 2026-10-07).
   - 9-5.mdx:543 dates the red line ("מיצוב בוחר בין נתונים אמיתיים…") 2026-08-31 and files it under the 07-29 entry.
   - Fix: in all three, keep an entry `kind: "החלטה של Mogi", date: "2026-08-31"` whose text is only "נתון/מספר שסותר את מה שהלקוח אמר לא נשלח לבנק בלי לשאול את הלקוח; הסתירה מוצגת ליועץ עם שני הערכים, והפתרון נרשם. סתירה שלא נפתרה נחשבת חסרה אצל אותו בנק". Move the other sentences to their own entries:
     - model never computes: `החלטה של Mogi`, 2026-07-29.
     - declared/recognised/state split: `ידע מהשטח, ממתין לאישור אילון`, or "אילון אישר, 2026-10-07".
     - consent: its own entry.
   - In 9-5.mdx:543 delete "(2026-08-31)".

3. **The red line is labelled two ways.**
   - 9-3.mdx:731 and 9-4.mdx:615 label it `מחקר / הצעה` ("הקו האדום של הקורס, שיעור 6.5").
   - 9-5.mdx:302, 9-5.mdx:543 and checks/9.mdx:170 (check 9 q12 explanation) say "הקו האדום (החלטה של Mogi)".
   - Fix: change those three to "הקו האדום של הקורס (שיעור 6.5)", with no "החלטה של Mogi", so the two labels agree and no decision is invented.

4. **9-3.mdx:297 contradicts itself.** The text says "הלקוח מחליט מתי מספיק, והיועץ מציג מחיר בשקלים. זו עמדה של הצוות מאוגוסט 2026, לא כלל רשום: הצוות מכריע מתי מספיק, והלקוח יכול לחלוק." Fix: "הלקוח מחליט מתי מספיק, והיועץ מציג מחיר בשקלים. זו עמדה של הצוות מאוגוסט 2026 (ידע מהשטח), לא כלל רשום בקורס: היועץ אינו מכריע במקום הלקוח."

5. **9-3.mdx:417-418: broken table headers.** They read "החזר חודשי גבוה ב־, ₪" and "סך תשלומים גבוה ב־, ₪", with a dangling "ב־". Fix: "החזר חודשי גבוה יותר, ₪" and "סך תשלומים גבוה יותר, ₪".

6. **Internal references in learner text.**
   - Brain page numbers and the word Brain:
     - 8-1.mdx:352: "ב־Brain (דף 7503881, עודכן 2026-10-08)".
     - 8-7.mdx:377: same page number.
     - 8-7.mdx:379: "Brain, דף 7634954".
     - Fix: "לפי תעתיק של הצוות (עודכן 2026-10-08), ממתין לבדיקה מול המקור" and "עבודת מחקר של הצוות (אוגוסט 2026, עודכן 2026-10-08)".
   - 8-6.mdx:361: "מהגדרת השלב בבריף הקורס". Fix: "מהגדרת השלב של הקורס".
   - src/data/definitions/8-22.json:3: "בריפו" in the definition of the append-only list. Fix: remove the repo mention ("בקוד של Mogi", or delete the clause).
   - Internal document name:
     - 9-1.mdx:154: "והמפרט הפנימי של הצוות". Fix: "וכלל הצוות".
     - 9-1.mdx:690: "מפרט הצוות ״מה כל מסמך נותן לנו״ (2026-10-02)". Fix: "מסמך של הצוות על מה כל מסמך מוכיח (2026-10-02)", without quotes.

7. **Case A does not agree between 8.28 and 6.10 / 9.2.**
   - 8.28 (txt lines 54, 206, 235) positions with 20,000 ₪ of extra equity: loan 1,620,000 and LTV 73.64%.
   - 6.10 (`t.equity` 21,000) and 9.2 (`plan.extra` 21,000, loan 1,619,000, LTV 73.59%) use 21,000. 8.28 calls this "אותו תיק, בקשה אחרת", so the learner sees two plans for the same case.
   - The 8.28 pipeline numbers (14 feasible, 6 efficient, the 40/0/60 choice at 7,941.62) belong to the 20,000 plan. 9.2 gets 7,934.02 for the bank-A offer.
   - Fix, cheapest: in 8-28.mdx where the positioning is introduced, add: "בהדגמה הזו הוספנו 20,000 ₪ עגולים; בשיעורים 6.10 ו־9.2 התוכנית היא 21,000 ₪, ולכן המספרים שם שונים (תרגיל נפרד)". Better: feed `plan.extra = 21000` into the 8.28 facts and regenerate the counts.
   - Related, minor: 8-7.mdx:299 calls the candidate with 8,182 ₪ "שליש־שליש, כמו שביקשו". That is the 33/33/34 shape (data/lessons/8-7.json `m.c01_pay` = 8182). The case A initial mix of 5.8 / 8.9 (546,000 / 547,000 / 547,000) pays 8,181.30. Fix: either use `INITIAL_MIX` in the 8.7 c01 facts (src/data/case-a-mix.ts:97, case-s8.ts:210) so the number is 8,181.30 everywhere, or write "בערך שליש־שליש (33%, 33%, 34%)".

## Minor

8. **checks/8.mdx:253, explanation of q11 (8.13 space size).** The text prints "4,151.30 דקות". The exact value is 249,080,832 ms = 4,151.3472 min. The fact `q11.minutes` is stored as `4151.3` (data/lessons/check-8.json:1816) and formatted to two decimals, so the second decimal is invented. Fix: store `4151.35`, or print one decimal ("4,151.3"). Check the other facts stored at one decimal and printed through `nv` or `money2` for the same effect.

9. **Answer-option spread.**
   - Check 8: the correct option is the longest in 12 of 13 choice questions (above the mean length in 12 of 13). Positions after the page's seeded shuffle: 5/3/2/3 over places 1-4. A learner can pass by picking the longest option.
   - Stage 8 lesson ChoiceExercises: the correct option is the longest in 52 of 102 (chance would be about 25%) and above the mean in 71. Position 1 holds 37, then 25 / 22 / 18.
   - Check 9: positions 3 / 0 / 4 / 3 (place 2 never), correct is longest in only 2 of 10, which is fine. Lesson 9.x ChoiceExercises: 9 questions, 4 longest, spread 2/1/3/3, fine.
   - Fix for check 8 and for the 8.x exercises whose correct option is the longest: shorten the correct text, or lengthen one distractor to the same length with a plausible clause (for example check 8 q3, q5-q7, q9, q10, q13, q17, q19: the correct text is 150-236 characters against 36-100 for the others).

10. **"We" forms in learner text (rule: plural address, no "we").**
    - 8-12.mdx:218 "אין לנו הרבה אירועים" → "אין הרבה אירועים שחוזרים על עצמם".
    - 8-12.mdx:222 "אנחנו לא יודעים איזו…" → "לא ידוע איזו…" (and "אין לנו מספר אחד" in the same step → "אין מספר אחד").
    - 8-13.mdx:75 "נתחיל" → "מתחילים".
    - 8-15.mdx:218 "נכתוב" → "כותבים".
    - 8-16.mdx:146 "מה שלמדנו" → "מה שלמדתם".
    - 8-7.mdx:248 "ראינו" → "ראיתם".
    - 8-17.mdx:407 and 8-18.mdx:68 "כמה אנחנו לא בטוחים" → "כמה אי־ודאות יש".
    - 8-18.mdx:393 "וכך אנחנו יודעים אותה" → "וכך היא ידועה".
    - 8-18.mdx:436 "כמה אנחנו לא בטוחים בו" → "כמה אי־ודאות יש בו".
    - 8-19.mdx:86 "המודל שלנו מגזים" → "המודל של הקורס מגזים".
    - 8-24.mdx:87 "במודל שלנו" → "במודל של הקורס".
    - Stage 9 and the two checks: none found.

11. **One alternative has two names in stage 9.** 9.2 (txt lines 16, 34, 38, 40, 71, video frame 9-2-t100 and 9-2.he.vtt:45, 61, 69) calls it "צמודה". 9.3, 9.4, 9.5 and check 9 (q4 and others) call it "צמוד, שליש קבועה". The check introduces the name in its question, but a learner meeting it for the first time in 9.3 has to map it. Fix: in 9.2, the first mention (the table row title and the Prediction text) should read "צמודה (צמוד, שליש קבועה)", and keep "צמודה" as the short form afterwards.

12. **Long equations fragile at 390px.**
    - With the fallback font (no Heebo) 8.8 and 8.15 scrolled sideways by 11-12px. With Heebo loaded the pages fit (scrollWidth 390).
    - 8-15.mdx:294 and 405: the `<M>` equation "2,956,492.09 ₪ − 2,468,912.23 ₪ = 487,579.86 ₪" is a no-wrap span, 386px against a 374px column (without Heebo).
    - 8-8.mdx:203: the spreadsheet formula `=SUMPRODUCT(E2:G2,$J$2:$L$2)/SUM($J$2:$L$2)` is a no-wrap `ltr` span (361px).
    - Fix: for equations over about 34 characters use the `eq()` approach of the checks (isolate without no-break spaces) or let `M` wrap; put the formula in a `<code>` block with `overflow-x:auto`.

13. **9.5 s8a explanation (check 9.5 exam item).** "הממוצע הרגיל הוא 70, כי היעד הראשון, שמשקלו גדול, קיבל ציון נמוך מזה של היעד השלישי." The reason for 68 < 70 is that the heaviest weight (50) sits on 70 and the 90 only has weight 20. Suggested: "הממוצע המשוקלל נמוך מהרגיל (70) כי ל־90 יש רק משקל 20, ולציון 70 יש משקל 50".

## Checks that came out clean

- **Labels and the 2026-10-17 decisions.**
  - 'ריבית חוזית' is used (8-20, 9-5) with no 'נקובה/נומינלית' leftovers. The only 'נומינלי' is 9-4.mdx:252, an ordinary use already taught in stage 0.
  - Only 'בנקאי בשטח' for the external banker (8-17, 8-20, 8-24, 8-25, 9-2); no leftover variants.
  - No stage lock, pass mark or "next stage opens" in any lesson, check, exam or component of stages 8 and 9. Check 8 text and check 9 show a score only. Exam 9.5 shows a score only.
  - Stage 8: the 15 rules + four layer modes are the only "הוחלט". 8.1 and the check-8 preamble state the triple (היום / הוחלט / עתיד) and the lessons say which they are. 8.2-8.5 are general maths with no Mogi claims.
- **Videos.**
  - 10 frames viewed: 8-7 t125, 8-10 t088, 8-15 t093 (zoomed: the "60%," bidi order is correct, not a defect), 8-21 t097, 8-28 t112, 9-1 t068, 9-2 t100, 9-3 t063, 9-4 t129, 9-5 t078. Their numbers match the pages and facts: 17,406.97; 1,038.08; 8 payments until the car loan drops off; 9,600 naive average; 2,774,823.18 / 2,835,704.62 / 2,842,763.32 / 2,869,955.74.
  - Every number in all 33 `.he.vtt` files (8.1-9.5) appears on its lesson page. No leak (Brain, J-codes, DEC, FK, repo) in any `.he.vtt`.
- **Phone layout, 390px (with Heebo).** No horizontal page scroll on 8.1-8.28, 9.1-9.5, check 8 and check 9. Wide tables sit in horizontal scrollers; the narrow-card variants appear. Tap targets: only the known site-wide items.
- **Interactive components.** On every 8.x and 9.x lesson, each island was operated once or more (inputs filled, sliders moved, radios, tabs and buttons clicked, selects changed; between 8 and 36 actions per page). No page error, and no "NaN / undefined / Infinity / [object" appeared in the page after interaction.
- **Equations.** No arithmetic equation outside an LTR isolate or `ltr` span in any learner text, so none is mirrored.

## Numbers recomputed (plain Python Decimal, no import from src/)

All matched except where noted, 68 statements:
- **Case A (9.1, 9.2).**
  - Loan 1,640,000 and LTV 74.55%.
  - Max loan 1,650,000 and room 10,000.
  - Income 21,700 and disposable 20,250.
  - 40% cap 8,100, 50% cap 10,125, 40% after the car loan 8,680.
  - Budget maximum 8,750.
  - Car loan 26 × 1,450 = 37,700 (1,700 above the payoff of 36,000).
  - Documented equity 460,000 gives LTV 79.09% and a 90,000 shortfall.
  - Verified equity 260,000 gives LTV 88.18% and a 290,000 shortfall.
  - Net pay 12,400 / 9,300 / 10,200 and naive average 9,600.
  - Initial mix 546/547/547 at 4.60/4.10/4.40 over 360 months: 2,799.04 + 2,643.10 + 2,739.16 = 8,181.30, ratio 40.4%, left 12,068.70, margin 568.70, 81.30 over the 40% cap.
  - Plan 21,000: loan 1,619,000, LTV 73.59%.
  - Appraisal break-even 2,186,666.67 and slack 13,333.33; for the plan 2,158,666.67; max loan at 2,150,000 is 1,612,500, short 6,500.
  - Bank-A request at 4.45/3.95/4.25: 7,934.02. Bank-B 8,045.81. Bank-C 8,075.94. The ratio 39.88% is measured at list rates (8,076.53 / 20,250).
  - Data note: facts `o.request.c.qual` = 8,075.95 and `o.request.c.base.first` = 8,075.94 differ by one agora (not shown on any page).
- **Check 9 (keys q2, q5, q9, q13).**
  - 8,750 and 17,406.97.
  - The bargaining round of −0.10: monthly 94.78 and total 34,121.29, using the exact schedule (monthly payment rounded once, interest rounded monthly, last month closes).
  - The +0.10 rise: monthly 95.35 and total 34,326.23.
  - The +0.05 and +0.25 variants: 47.60 / 239.43 monthly, 86,198.72 total; ratios 39.80 / 40.04 / 40.75.
- **Exam 9.5 (keys).**
  - a1 9,300; a3 290,000; a4 88.03 (8,100 − 8,011.97, fixed-only bank B 1,619,000 at 4.30%).
  - a6 169,652.31 (2,884,308.34 − 2,714,656.03); a7 2,158,666.67.
  - s0a 19,001.55 and 18,600 simple; s0b 0.75 and 16.67%; s1a 110,000; s2a 2,950 and Spitzer 2,735.48.
  - s3a 80,608.72 (total 330,608.72); s4a 18,300; s5a 3.87%; s6a 6,600; s7a 0.343%; s8a 68.
- **Check 8 (keys).**
  - r1 242,855.26; r2 15,300; r3 39.59% (7,800 / (21,000 − 1,300)); r4 503.86 and 122,284.27.
  - q1 4.215 (simple mean 4.267 as the error); q2 41.5 (position 8.5 between 41 and 42); q3 3,801.63 (and 3,795.90 at the mean rate; the four payments).
  - q4 1.175 (slope 0.011, means 60 and 1.12, mean error 0.016, 1.56 at 100%); q8 3,851.20 / 2,310.34 / 6,161.54.
  - q11 1,001 × 12^5 = 249,080,832 (the 4,151.30 minutes error is item 8).
  - q12 front of 3 (A, B, C) and the dominance statements; q14 0.30 (1.55 → 1.25); q15 66.7%, gaps 0.2333 / 0.2000 / 0.2167.
- **Counts.** C(24,4) = 10,626; 27^5 = 14,348,907; 80 × 1,224 = 97,920.
- **Lesson 8.x totals.** 9,014.62 / 3,188,598.42 (8.10 vs 9.2 original mix); 8.9 payments 2,799.04 + 2,643.10 + 2,739.16.

## Cross-stage dependencies

- **Case A (stages 5-6 → 8 → 9).**
  - Stage 5.8 / 6.9-6.11 (initial mix, 8,181.30, 40.4%, 12,068.70, 21,000 plan, 1,619,000, 73.59%) is the base of 8.9, 8.10 (9,014.62; 3,188,598.42) and 9.2 (`o.original.a.*`), and these agree.
  - 8.7 (c01 shape 33/33/34, 8,182) and 8.28 (20,000 plan, loan 1,620,000, LTV 73.64%) do not: see Major 7. 8.21 uses the 1,640,000 / 74.55% original and agrees.
  - After Major 7 is fixed, re-check 8.28 exercises 8.28-2, -3, -8 (14 candidates, 7,941.62, 19) and check 8 q-references to 8.28.
- **Stage 9 depends on stage 8 labels.** The red line and the 08-31 date (Majors 2 and 3) appear in 9.3, 9.4, 9.5 and check 9, so fix them together.
- **Check 9 q14** says the consent rule is "החלטה של Mogi מ־6.9.2026". 9-1.mdx:691 dates the same rule 2026-09-06, but gives the entry's own date as 2026-08-13. If Major 2 is applied, give the consent rule its own entry with that date, or write "ללא תאריך ברשומה" as in 9-3.mdx:730.
- **NumericExercise.vue:93 (component fix)** also affects any other stage that omits `unit` or passes `unit=""`. Run `grep -rn 'unit=""' src/pages/lessons` over all stages after the fix.
