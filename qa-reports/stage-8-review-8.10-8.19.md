# QA report: lessons 8.10–8.19, read as a beginner (2026-10-17)

Reviewer's report, saved by the coordinator (the reviewer ran out of steps before writing it). No source file was edited by the reviewer. Line numbers are approximate (±2).

**Reader:** finished stages 0–7 and 8.1–8.9. **Method:** MDX + built pages, `.he.vtt` files, key frames, facts JSON; independent plain-Python `Decimal` recomputation (no import from `src/`; mulberry32 reimplemented) of: 8.10 Directive-451 forward paths, macro and stress schedules; 8.11–8.12 the seeded Monte Carlo (287/1000, first ten maxima, mean 2,371.50, median 2,357.31, quantiles, seed-2 result 245, eight 100-future runs, four assumptions 45/287/505/777 and their means, standard errors); 8.13 counts 10,626 / 286,902 / 152,471,485,782 / 58,224,991,752 / 124,149,402 / 65,978,082,348,282, the 6,300 legal splits; 8.14 the 198-point grid (4 feasible, 114 pruned, 84 calls); 8.15 all 15 candidates, dominance, four weight-set winners; 8.16 vertices and optima; 8.17 payments, 60 synthetic offers (seed 17), fit errors; 8.18 seed-23 data, t-intervals, prior chain; 8.19 2,000 applicants (seed 31), bands, Brier, recalibration. Every printed `=` evaluated. 390px run: no horizontal page scroll, no console/hydration errors.

**Result:** every number recomputed matches, except the wording/consistency problems below. Not recomputed: the 8.10 "linked" mix (6,605.70 / 1,645,379.29) and the 8.14 scores (0.276720, 0.300000).

**Right:** every lesson has a היום/הוחלט/עתיד box; stage-8 numbers marked להדגמה; synthetic data marked; fictional banks; bank pricing/approval claims are "לא ידוע / השערה / ממתין לאישור אילון"; 8.11–8.12 say a simulation does not turn an assumption into a fact; 8.13 150-billion recomputed under a stated reading with the 58-billion alternative; 8.16 "optimal relative to what"; 8.19 over-confidence shown and no approvals data admitted; LLM rule stated; no Brain numbers/J/DEC/FK ids in body, subtitles or frames.

**Blockers:** none. **Count:** 8 major, ~25 minor groups.

## Major

**M1 · 8.17 · the keyed answer of the prediction contradicts the lesson's own result.** Prediction option 2 (≈MDX 55) and "חוזרים לשאלת הפתיחה" (≈148) say the rate "קופצת ב־0.35 נקודות אחוז ויותר"; the same reveal computes −0.25 (margin 1.15 to 0.90): the rate falls by 0.25. Fix: "הריבית לא זזה עד שהמימון חוצה סף, ואז היא משתנה בקפיצה: כאן יורדת ב־0.25 נקודות אחוז". Reword the "ירידה של −0.25" double negative (MDX 123, 158) to "ירדה ב־0.25".

**M2 · 8.13 · prediction keyed to the reading the lesson later calls less exact.** Stem (MDX 51): "לכל מסלול שבתמהיל יכולה להיות תקופה משלו" = only existing tracks get a term = 58.2 billion by the lesson's own table; the key is 152 billion, which needs a term even for a zero-share kind. Fix: state the reading in the stem ("לכל אחד מחמשת הסוגים, גם אם חלקו אפס, תקופה משלו") or key to 58 billion.

**M3 · 8.19 · "with 100 learners there is no correction at all, every band too small" contradicts the table above it.** MDX 208 and the recalibration table: the 100-applicant table has bands of 35 and 52 (≥ the lesson's minimum 30). The 0.1257→0.1257 result holds only with the 10 bands the correction uses (never said). With the 5 bands shown: gap 0.1187→0.0708, Brier 0.2298→0.2204 — a correction does happen. The second row's test set is 200 cases (n=300), not stated. Fix: say learning/testing here use ten bands, give the test-set size, restate the 100-case claim for 10 bands.

**M4 · 8.15 video cue 8 states the count backwards.** `8-15.he.vtt` cue 8 ("5 נשלטים", 54–63s), frame `8-15-t059`: two-objective view shows 5 frontier points and 10 dominated. Fix: "10 נשלטים, 5 על החזית: יש נקודה טובה מהם בשני המספרים."

**M5 · 8.15 · the 15-row table is unusable at 390px.** 399px in a 341px box; the "מצב" column is leftmost and cut off, long "נשלט על ידי…" wraps one character per line. Fix: cards below 640px (name, three numbers, status, dominators on a separate line), as 6.4/6.5 did.

**M6 · 8.15 · the "4 never chosen" result depends on rounding; exercise 7's solution says something false.** MDX 248, 417 (ex 7 solution), source note 467. Normalised scores are rounded to 4 decimals; with the course convention "קבועה 60% + משתנה 40%, 30 שנה" wins exactly one lattice point (55,35,10) by rounding noise (margin 0.0016 exact); in exact arithmetic it is not reached, so 5 would be "never chosen". At 0.1% resolution the 4 listed never win: non-convex "sunken" points. The solution's "עם רשת עדינה יותר אולי אחד מהם היה זוכה" is wrong for them and contradicts the Sources note on a non-convex front. Also "הוא היה מקבל ציון נמוך או שווה" (≈210): with positive weights strictly lower. Fix: "אף משקולת חיובית לא תבחר בהם: הם בחזית שאינה קמורה"; add that the count of 4 uses the 4-decimal normalisation (or "4, ו־1 נוסף נבחר רק בנקודה אחת"); write "ציון נמוך יותר".

**M7 · 8.12 · approval probability is called "the first kind" before the data is known.** MDX 149 "היא מהסוג הראשון: תהליך שחוזר, ונתונים שאפשר למדוד"; the next sentence says the source is unchecked and every approval probability is an assumption. Same issue in the "משכנתאות: הרבה תיקים דומים…" example (MDX 117). Fix: "יכולה להיות מהסוג הראשון, אם יתברר שיש הרבה תיקים מתועדים דומים, ושמדיניות הבנק לא השתנתה".

**M8 · numeric-exercise unit defaults to ₪ on non-money answers.** 8.15 ex 2, 7 (counts); 8.16 ex 2 (corner count), ex 6 (thousands of ₪); 8.18 ex 2,3,4,6,7 (points, standard errors, interval ends); 8.19 ex 2,3,4 (people, fraction, Brier); 8.17 ex 2,4 (points). Input says "התשובה שלכם (₪)". Fix: set `unit=` ("מועמדים", "נקודות אחוז", "") on each.

## Minor

**Labelling, term-before-use**
- 8.10 Sources (MDX 417): file path "src/data/curves.ts" visible — remove.
- 8.15 Sources (467): "כפי שנרשם ב־Brain" — say "בתיעוד הצוות".
- "שאלה לאילון / שאלה פתוחה לאילון" in learner body (8.13 step 3, 8.17 end of "מדרגה" section) — use "ממתין לאישור אילון".
- The היום/הוחלט/עתיד box: 8.15–8.19 put it after the opening paragraph under "מה השיעור הזה לא אומר"; 8.10–8.14 put it first. One place (first). Label missing on 8.15–8.19 openings before "עתיד".
- 8.10: "הפריים היום 4.75%" — live-data word "היום" without date; date it ("נכון ל־…"); the date 2026-09-03 only in Sources.
- 8.17 uses g for a step function (g = grace months in the course table; not said it is reused) and writes A as percent (4.20) while the table says A is a decimal. 8.18 reuses t and d without noting earlier use.
- 8.17 (MDX 130): "מי שנמצא ממש מעל סף משלם על כל הסכום… לכן לפעמים כדאי להכניס עוד הון" is stated as a general rule but is a property of the invented model: add "אם בנק מתמחר כך".
- 8.18: "אצל Mogi, בהתחלה, כמעט אין הצעות" unlabelled claim: add "לפי הידוע בכתיבת השיעור".
- 8.16: "נועם ושירה צריכים 1,000,000 ₪" (cap 6,000) vs 8.14–8.15 (1,640,000; 8,300): say "תרגיל נפרד, לא התיק של נועם ושירה".

**Correctness and clarity**
- 8.10: the "בחודש" column shows 360 for highest payment in stress and macro: stress payments are 9,432.17 for ~300 months and the last is 9,435.33 (balance-clearing, 3.16 ₪ rounding residue): the "month of the maximum" is a rounding artefact; header should read "החזר אחרון" or drop the column. Same artefact in 8.15 as "חשיפה 1.03 ₪" for a fixed-rate 20-year loan (add a note or fix by the engine change in progress).
- 8.10 ex 2 says "לפי טבלת תחזית המקרו שבשיעור" but the page prints only years 1, 3, 8 of the policy-rate table; chart table view shows prime, not policy rate. Print the table or point to the chart.
- 8.10 "table 1" 402px in 341px box; last column "סך תשלומים" off-screen at 390px.
- 8.11: "מספר המסלולים גדול מדי לספירה" slightly over-strong (5¹⁴ ≈ 6 billion): "גדול מדי לספירה ביד". "התוצאה בין 24.5% ל־28.7% מתיישבת עם 1.4": a 4.2-point gap on a pair with standard error ~2 points ≈ 2 SE; say so.
- 8.12: ±9.7 at n=20 violates 8.11's own "n גדול, p לא קרוב ל־1" (n·p·(1−p)=3.75): add "גס מאוד כאן". Weights of the fourth assumption ("נוטה למעלה", 5/10/35/30/20) not printed, so 77.7% cannot be reproduced.
- 8.13: "five constraints, only two narrow the split" never named; the 6,300 needs "which two types count as fixed" and "35%, since 5% steps" (never given). Team's measured 58.7% legal differs from the page's 59.3% (6,300/10,626) with no reconciliation. "בדיוק שני המספרים שהצוות רשם" overclaims (152 vs ~150): "קרוב מאוד". The measured 0.48 ms per check implies the 1 ms assumption is conservative: one line.
- 8.14: the 8,300 cap never binds (40% of 20,250 = 8,100): say so.
- 8.16: table 1 (cost curve, 12 columns) 421px in 341: "90% | 100%" off-screen: two-row layout or cards on a phone.
- 8.17: the interactive's "same 60 offers" appears in 8.17 (seed 17, two steps) and in 8.18 (seed 23, one step, different model): say "60 הצעות אחרות".
- 8.18: two printed equalities do not hold on printed numbers: "0.8800 ± 2.776 × 0.0164" gives 0.8345–0.9255, printed 0.8344–0.9256 (ex 4 "= 0.9256" too): add "(מהערכים הלא מעוגלים)". The six offers of the hand step example (0.80, 0.82, 0.78 / 1.18, 1.22, 1.25) are not printed, so 0.8000 / 1.2167 / 0.0233 can't be followed. "ל־21 תצפיות בקבוצה הקטנה" in the t dd is confusing. The width table uses the lower table row (N=100 → t=2.000 rather than 1.984), disclosed only in Sources: one line in the body.
- 8.19: the prediction's correct option states the number the data produces (79%) which the stem does not let one derive. Gap column signed while "average gap" is absolute: one clause. Bands 5 in the table and 10 in the interactive default and correction (see M3).
- Exercise design: correct option often the longest and most hedged (8.12 ex 7, 8.13 ex 7, 8.14 ex 7, 8.16 ex 7, 8.18 ex 8); `ChoiceExercise` does not shuffle. Spread positions (8.15 ex 8 first, 8.19 ex 6 second).

## Videos
Apart from M4 cues match pages; no paths/ids in VTT. Not inspected at full size: shekel-sign direction in frames (recurring X-2): spot-check big values in 8-10, 8-14, 8-17, 8-19.

## Order to fix
1 M1 · 2 M2, M3 · 3 M4, M5 · 4 M6 · 5 M8 · 6 M7 · 7 minors.

## Ownership (coordinator)
8.10–8.14 → author B; 8.15–8.19 → author C.
