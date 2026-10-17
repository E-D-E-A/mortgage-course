# Whole-course read: stages 4 and 5 (beginner who finished stages 0-3)

Scope: src/pages/lessons/4-*.mdx and 5-*.mdx (25 lessons), src/pages/checks/4.mdx and 5.mdx, src/data/definitions, public/video/*.he.vtt, course/course-map.md, course/AUTHORING.md. No source file was edited. Line numbers are those of the files as read on 2026-10-17.

## Summary

- Numbers: 96 numeric statements recomputed in plain Python Decimal (no import from src/). 0 mismatches. Stages 6 (6-1, 6-2) and 9 (9-1) agree with stages 4 and 5.
- Phone layout at 390px (25 lessons + checks/4 + checks/5, scratch build): no horizontal page scroll anywhere. Tables scroll inside their own wrappers.
- Videos: 8 key frames and the VTT numbers match the lesson facts. No mirrored equations.
- No lock or pass-mark wording remains. The contract-rate decision ("ריבית חוזית") is already applied in 5.5 and 5.9.
- Biggest problems: learner-visible internal references (Major a), the "קו ההון" / "סף ההון" split (b), the 18-month boundary (c), a formula that omits the ending-rent rule (d), one ambiguous answer key (e).

## Major

**a. Internal references are visible to the learner (check 5).**
Counts in stages 4 and 5 after stripping comments: FK ids 110; the word "Brain" 77; page ids 68; J-codes 24; "ריפו" 23 (checks/4.mdx has 5); source-map and internal-list references 22; file paths 12; BIR_MRTG 5; ENG-n 3.
Worst places:
- 4-3.mdx lines 485-489: ENG-223, "סתירה 9", "[R]", research/notes, context/drafts, scripts/case_sketch.py.
- 4-8.mdx line 439: "edea-mortgage, context/inputs".
- 4-2.mdx line 438: "הקישור שבדף: h2852.pdf".
- 5-6.mdx: "שאלה 24 לאילון".
- Per file: 4-7 (Brain 12, FK 7, J 6), 4-11 (FK 17), 5-10 (FK 10), 4-12 (FK 8).
- src/data/definitions: only 5-5.json matched the pattern. I did not confirm the exact line.
Fix: in every `<Sources>` and body line, replace these tokens with "לפי תיעוד הצוות, <date>". Update course/AUTHORING.md, whose Sources rule still prescribes "לפי תעתיק בצוות ב־Brain (דף N, תאריך)" and "בריפו של הצוות". Add a lint over the lessons: `/Brain|FK-H-\d+|\bJ-\d{2,3}\b|ריפו|ENG-\d+|context\/|research\/|scripts\/|BIR_MRTG|(דף|דפים)\s*\d{5,}|DEC-\d+/`.

**b. "קו ההון" vs "סף ההון" (the 40% line).**
- 5.10 uses "קו ההון / קו הון" about 15 times after 4.5 introduced "סף ההון": lines 208, 210 (`<Term t="סף הון">` with surface "קו ההון"), 314, 315, 317, 329, 395, 485, 530, 543, 544, 547, 557, 558, 570, 586.
- 4.4 uses "קו ההון" on purpose before 4.5 (lines 65, 116, 118, 160, 172 capitalName, 197, 213, 255, 273, 355, 390, 440, 453, 470). MixComplianceChecker.vue lines 71, 82, 83, 199 also say "קו ההון".
- Stages 6 and 9 say "סף ההון". 4.5 has no bridging sentence.
Fix: change 5.10 and the MixComplianceChecker labels to "סף ההון". Add one line to 4.5: "בשיעור 4.4 קראנו לזה קו ההון; מכאן קוראים לו סף ההון". Also 4-5.mdx line 130 has `<Term t="סף הון">משקל סיכון</Term>` (surface does not match the term).

**c. The 18-month boundary is inconsistent.**
4.2 says exactly 18 months is an open question. 4.6 treats "18 or fewer" as settled, not counted: line 184 (definition of O, "18 חודשים או פחות"), line 358 (feedback), line 413 (summary). Stage 5 (5.6, 5.7) says "יותר מ־18".
Fix in 4.6 at those three lines: "פחות מ־18 חודשים; בדיוק 18 — שאלה פתוחה".
Cross-stage: 6.1 uses until_drop = 9 (17 months left), while 4.2 and 4.15 say 8 or 9. Settle the boundary before stage 6.

**d. The 4.2 formula omits the rule for rent that ends.**
4-2.mdx lines 183-186, step 2: rent that ends with 30 months left falls to step 3 and would be counted. This contradicts line 116, the checker (rentContinues:false), the solution and the FillTable hint (rent that ends = 0).
Fix: add an item to step 2: "שכר דירה שייגמר כשיעברו: לא נספר (הנחת הקורס)".

**e. 4.12 exercise 4 asks one thing and keys another.**
4-12.mdx lines ~401-417: the question is "כמה גבוה התשלום החודשי בהצעה היקרה?", but the key is the difference (the error text marks the payment itself, pay_high, as wrong).
Fix: "בכמה גבוה התשלום החודשי בהצעה היקרה מהתשלום בהצעה הזולה?".

**f. The same "three goals" content carries two different source labels.**
- 5.6 and 5.8 Sources: "החלטה של Mogi", while the text says "זה תכנון ... לא עובדה על השוק" with no who or when.
- 5.9 Sources: "מחקר / הצעה".
Fix: use "מחקר / הצעה" in 5.6 and 5.8 as well.

**g. The external banker: remaining variants (decision of 2026-10-17: "בנקאי בשטח" only).**
No personal name of the banker appears in the stage 4/5 lessons, VTTs, definitions, checks or components. The variant label "בנקאי חיצוני" remains at:
- 4-13.mdx line 367 (Sources)
- 4-14.mdx lines 176 and 456
- 4-15.mdx lines 88, 270 and 461
Descriptions, which can stay: 4-13.mdx line 117, 4-10.mdx and 4-11.mdx ("בנקאי עם כמה שנים", "שאינו חבר בצוות"). Also 4-12.mdx line 91 has the duplicate "בנקאי (בנקאי בשטח".
Fix: replace "בנקאי חיצוני" with "בנקאי בשטח" at the six lines above.

**h. "הוראה 203" is never explained to the learner.**
The caveat "סף ההון (40%) — לפי תיעוד הצוות, לא אומת; ההוראה שנושאת אותו לא נקבעה (329 או 203)" appears 23 times (4.4, 4.5, 4.6, 4.7, 4.10, 4.12, 4.15 five times, 5.10, checks/4 three times). It first appears in 4.4 (lines 31 and 116) without explanation; only the 4.4 Sources gives "203 (כללי הון)". 4.15 also contains "לא אומת" 44 times. The Sources of 5.6, 5.7 and 5.8 list "סף הון 40%" among "מגבלות הוראה 329" without the caveat, while 5.10 has it.
Fix: explain 203 once in 4.4 body (or in a popover), use a short repeated form ("סף ההון — לא אומת"), and add the caveat to the stage 5 Sources.

## Minor

Answer keys and exercises
- PredictionReveal `correct={1}` in 16 of 25 lessons, `{2}` in 8, `{0}` in 1 (5.8), never `{3}`. Prediction.vue does not shuffle. Fix: vary the indices, or shuffle in Prediction.vue.
- `ordered` is set on ChoiceExercises that are not scales: 5.1-5, 5.1-6, 5.2-4, 5.3-3, 5.3-6, 5.3-7. Remove it so they shuffle.
- The correct option is the longest in 28 of 70 ChoiceExercises (about 40%). Examples: 5.4-7, 5.6-3, 5.6-7, 5.8-7, 5.9-6, 5.9-7, 5.10-6. In the 4.8 prediction three wrong options start with "רק" and the correct one does not. Checks/4 writes the correct option first, but it is shuffled at runtime.
- 4.3-6 is level "קל" but comes after "בינוני" exercises 4 and 5.
- Unit: every NumericExercise without `unit` has a shekel answer, and the default is ₪, so there is no unit problem.

Hebrew quality
- 4-2.mdx line 114 "ששה" -> "שישה".
- 4-2.mdx line 384 "אילו הכנסה הייתה" -> "אילו ההכנסה הייתה".
- 4-6.mdx lines 95 and 236 "ההלוואה נשארו לה" -> "ההלוואה נשארה לה" (agree the verb with the subject).
- 4-9.mdx line 399 "באחוזי ריבית של" -> "בריבית של".
- 5-1.mdx line 246 "מי שמתכננים ... צריכים" -> "מי שמתכנן ... צריך".
- 4-11.mdx line 352 (solution of exercise 6) "כל מה שמעל זה" -> "כל השאר".
- 4-4.mdx line 106 is awkward ("ארבעה דברים", "ושני הקווים של ההחזר"). Rephrase.
- 4-14.mdx line 160 "זה לא סתירה אבל גם לא התאמה" -> "זו לא סתירה, אבל גם לא התאמה".
- 5.9 Sources: duplicate "דף מחקר של אילון, דף המחקר של אילון, 2026-10-08, 2026-10-08" and a double period "..". 5.10 Sources: "J-100..".

Labels and wording
- 4-7.mdx line 98 "(עדן, 2026-08-04; ידע מהשטח)" lacks "ממתין לאישור אילון".
- 4.1 uses "ממתין לאישור יועצים" for the internal spec. Unify with the label "ממתין לאישור אילון".
- 4-1.mdx line 195 "החלטה של צוות Mogi, 2026-08-31" -> "החלטה של Mogi, 2026-08-31".
- 5.6, 5.7, 5.8 Sources and 5-6.mdx line 215 (checks/5 q11): "תיק A" -> "תיק א׳".
- "שאלה פתוחה" is used as a label in 4.10-4.15 and 5.x but is not in AUTHORING's kinds list. Add it, or change it to the existing "לא אומת".
- 4.10 line 132 "כרטיס 13" and 4.11 "כרטיס 11" use global card numbers before they are explained.
- 4.1 intro (lines 71-78) uses נטו/ברוטו before the Term at line 84. Move the Term up.
- 4-7.mdx line 276 uses "≈", which AUTHORING says to avoid.

Letters and typed arithmetic
- 5.4: r means both the real rate and the track rate (lines 249-253, 394-397, 406-409). Use r_real and r_track.
- 5.5 reuses k for the loan index and introduces W and R. Name them in a short list.
- 5.9: the mini example uses a 12% rate. It is labelled "להמחשה", but a lower rate would be more realistic.
- Numbers typed in MDX instead of facts(): 5.2 line 130 ("333,333.33"), 5.7 lines 44-49 and 322 ("164,000"), 4.14 line 158 ("(1.0474) ÷ (1.0325)"), and 20,250 in the 5.7 error text and FillTable hint (matches the data now). Move them to the facts files.

Structure
- 5.2 uses a plain `##` outside `<Section>` (lines 91, 133, 143, 154).

Phone (390px)
- No horizontal scroll. The 4.10 table "overflow" is a visually hidden thead (false positive).
- Tap targets under 44px, all minor: inline Term buttons (about 29px high); `summary` elements ("התסריט המלא", "מה הייתם אמורים לראות", 20px high); radio inputs 13x13 (their labels are large enough); the 4.2 "אין תאריך סיום" checkboxes (20x20, worth verifying); the exit link "יציאה" (30px wide). Fix: padding on `summary` and `.term` (min-height 44px).
- The only console error is a 404 on /auth/session (the dev gate, not a bug).

Videos
- Frames viewed: 4-3-t056, 4-7-t055, 4-13-t049, 4-15-t051, 5-3-t061, 5-5-t055, 5-8-t061, 5-9-t069. All fine, equations LTR.
- 4-7-t055 shows an empty axis with a subtitle only. It is a mid-animation frame, not a defect.
- 5-9-t069 shows a 12.5% average, the round-number mini example labelled "להמחשה".
- VTT numbers are all in the lesson facts. The only extras are typed teaching constants: 12, 25, 18, 50, 10, 451, 329, "1.10", "4.2". The page text embeds the VTT, so I checked against the facts files, not the page.

## Verified, nothing to fix

- Contract rate: 5.5 line 50 defines "ריבית חוזית" and notes that banks also say נומינלית/נקובה. 5.9 is clean. Every other "נומינלי" in stages 4/5 (4.14, 5.4, VTT 5-4, CurveForecast.vue) means "before inflation".
- Lock and pass mark: none. checks/4 and 5 say "אין ציון עובר, ושום שלב לא ננעל"; 4.15 line 446 says "בלי סף ובלי נעילה: כל השלבים פתוחים"; StageCheck.vue shows score only; the 5.10 closing text is fine.
- Numbers, case A: loan 1,640,000; LTV 74.55%; disposable 20,250 (21,700 - 1,450); 50% = 10,125; 40% = 8,100; after the car ends 8,680 and 10,850; room 10,000; value slack 13,333.33; variable max 1,093,333.33; min fixed 546,666.67; PV carry values at 4/4.5/5%; initial mix first payment 8,181.30 and ratio 40.4%; balance after 120 payments 1,307,761.83; 4.13 over Leumi 140,000.
- Numbers, case B (Avi/Michal): 7,500, 8,000, 15,700, 19,200, payment 6,186.17, ratios 39.4% / 32.22%, shortfalls 18.23 / 31.82. Also 4.11, 4.12, 4.14 payments and 5.5 effective rates.

## Cross-stage dependencies

- The initial-mix ratio 40.4% (payment 8,181.30) is deliberately absent from 4.15. It first appears in 5.6 and is reused in 6.1 and 6.2.
- 6.1 until_drop = 9 vs the open 18-month boundary (Major c).
- The 40% label and its "(329 או 203)" attribution must be settled before stage 6.2.
- The 5.5 "ריבית חוזית" wording is applied in 5.5 and 5.9. Other lessons (0.8 line 140 and 2.4 line 48 carry the two meanings of "נומינלית") are not in my slice.
- Case A ("31 and 30 years old, one child") appears in 5.8, 6.11 and course-map.md.
- AUTHORING.md still prescribes the learner-visible Brain/repo citations (Major a). Update it before the remaining stages are changed.
