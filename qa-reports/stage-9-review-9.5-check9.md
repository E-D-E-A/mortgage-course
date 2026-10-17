# QA report: unit 9.5 (final exam) and the stage-9 check (2026-10-17)

Reviewer's report. No source file was edited. Line numbers are approximate (±2). Files: `src/pages/lessons/9-5.mdx` (L), `src/data/exam-9-5.ts`, `ExamPaper.vue`, `ExamOpenQuestion.vue`, `public/video/9-5.he.vtt`, frames `qa/video/9-5-t*.png`, `data/lessons/9-5.json`, `src/pages/checks/9.mdx` (C), `scripts/lessons/check-9.ts`, `StageCheck.vue`.

**Method.** Read MDX, data, components, VTT, all key frames that matter (003, 017, 029, 045, 065, 078, 090, 109, 122, 136, 146), both facts JSONs. Plain Python `Decimal` recomputation, no import from `src/` or `checks/` (scratch scripts in the scratchpad `rev3/`). Scratch build with `pnpm exec astro build --outDir <scratchpad>/rev3/dist` (137 pages, clean). Browser: playwright-core + Chromium 1194 at 390px, stage lock cleared with `mogi-course:check:8`.

**Recomputed and matching:** a1 (9,300 / 9,600), a3 (260,000; 1,940,000; 1,650,000; 290,000; 90,000; 10,000), a4 (disposable 20,250; 40% line 8,100; 8,011.97; 88.03; 668.03), a6 (exposure.b 8,011.97 / 2,884,308.34 and the 25-year alternative 8,635.88 / 2,714,656.03 rebuilt from the printed curve, forecast-451 anchors 3.69, 4.49, 4.81, 4.91, 4.92: 169,652.31, 623.91), a7 (2,158,666.67; 73.59%; 41,333.33), margin 738.03 and the 12,238.03 limit, o3 (12,400 − 60 = 12,340 vs 12,100, gap 240; 5 non-ok documents), o4 (1,688.32; 497,233.78 arithmetic; linked stress maximum 23,730.66 vs 23,730.62), every stage 0-8 answer (19,001.55; 18,600; 0.75; 16.67; 110,000; 2,950; 2,735.48; 80,608.72 exact schedule; 18,300; 17,500; 3.87; 6,600; 0.343; 0.35; 68; 70), exam points 26/17/43/35. Check 9: q2 8,750 / 8,100, q3 12,340, q5, q7 (1,575,000; 44,000; 25,000), q9 34,121.29 / 94.78, q11 44,402.60 (stress total 2,839,905.74), q13 (39.80, 40.04, 40.75). **No wrong keyed number.** One printed equality is false (M2).

**Browser results.** 390px: both pages no horizontal scroll (scrollWidth 375 ≤ 390, scrollX stays 0 after scrollTo), no console error, no hydration warning, no element outside the viewport. Exam: all 26 keyed answers accepted when typed (also "290,000 ₪" style, via `parseAnswer`); 26 answered enables the button; every listed common error returns its message (15 numeric errors checked); wrong run gives 3/26 (3 of 11 choice questions have the right option first, so no pattern exploit); open questions: textarea locks after reveal, ticks count, "הצגה כטבלה" fits (309px in 309px box), score table, summary 37/43 = 86% "הגעתם לסף"; reload keeps the answers, reveals, ticks, locked text and the summary; reset needs a second click and clears everything. Check 9: 16/16 pass shows the pass text and stores `check:9`; 0/16 shows "צריך לפחות 13", stored pass is kept.

**Result:** 5 major, 14 minor groups. Blockers: none.

## Major

**M1 · exam a5, o2 (L76, L130, rubric L132) · "התקציב נשבר בחודש הגרוע של הלחץ" is false read literally.** The course filter checks only the first five years (9.3, 9.4: "בחמש השנים הראשונות"). The linked alternative's worst stress month is 23,730.62 ₪ against a net income of 21,700, so a careful learner reads the stem as saying the linked alternative also breaks the budget, yet a5 says other combinations "לא שברו את התקציב". Fix: in a5 prompt, a5 explanation, o2 model, o2 r1 write "התקציב נשבר בחודש הגרוע של חמש השנים הראשונות של הלחץ".

**M2 · exam s3a explanation (L217) · printed equality is false.** Prints `1,836.72 × 180 = 330,608.72`; the product is 330,609.60, and the next clause "(בלוח המדויק 330,608.72 ₪ …)" repeats the same number, so "בערך" and "מדויק" say the same thing. Fix: "סך התשלומים בלוח המדויק הוא 330,608.72 ₪ (1,836.72 × 180 הוא 330,609.60, והפער הקטן מעיגול כל חודש לאגורה)"; then "330,608.72 − 250,000 = 80,608.72".

**M3 · exam o1 (L116-125) · the rubric's "where" column points one sentence off, and the hint is wrong.** Model answer sentences: 1 "נבחרה…", 2 "ההחזר החודשי הוא…", 3 "אלה אומדנים…", 4 "אחרי ההחזר נשארים…", 5 "אם השמאי…", 6 "נבחן מחדש…". Rubric says r2 "המשפט השני: ״אלה אומדנים״" (it is the third), r3 "המשפט השלישי" (fourth), r4 "הרביעי" (fifth), r5 "האחרון" (right). Hint "חמישה משפטים קצרים" but the model has six. Shown to the learner in both list and table view. Fix: r2 "המשפטים השני והשלישי", r3 "המשפט הרביעי", r4 "המשפט החמישי", hint "חמישה עד שישה משפטים קצרים". Also r3 asks for "ושהמרווח קטן", a judgement the prompt data does not decide (738 ₪ a month); make it checkable: "אומר כמה נשאר ביחס לתקציב המחיה ומה זה אומר להם (למשל שהמרווח קטן)".

**M4 · distractors are weak and give themselves away (exam choice questions).** Wrong options recur with absolutes and self-damning tails ("בלי יוצא מן הכלל ובלי חריגים" s4b L246; "ושום בנק לא רשאי" L247; "ההוכחה היחידה", "בלי קשר", "לעולם" s7b L317-319; "המספר היחיד" s5b L265; "ואין סיבה לחשוש מבדיקה" s6b L298; "בכל מקרה" s1b L181; "תמיד נמוכה" s3b L224), while the correct one is the hedged, two-clause option ("אבל", "הקורס לא יודע"). a5 option 4 (L81) contradicts the stem (it says the rejection of the linked alternative "אינה נחשבת פסילה" though the stem says it was rejected); s3b option 4 and s8b options 2-4 are not live alternatives. A test-wise learner scores about 70% with no knowledge. Fix: rewrite one wrong option per question as a plausible partial truth in the same register and length as the correct one (e.g. s4b: "ההלוואה מותרת, אבל רק אם הבנק אישר אותה מראש, כי סף ההון הוא תנאי של הבנק"; s5b: "הצעה ב׳ זולה יותר, כי סך התשלומים הוא מה שהמשפחה משלמת בפועל; ההחזר הראשון נוגע רק לתזרים"), and drop absolutes from at least half of the wrong options.

**M5 · overlap between check 9 and the exam (brief: none).** C line 236 says the check's questions "שונות מהשאלות של המבחן" — true word for word, false in content. Same fact, same file, same mechanism, and the check's explanation prints the exam's answer or intermediate:

| Check 9 | Exam | Overlap |
|---|---|---|
| q3 (Noam August net to pay 12,340 vs deposit 12,100, ask for corrected payslip) | o3 item 3 (gap 240, same remedy) | same fact and remedy |
| q7 (appraisal 2,100,000: extra equity, still short) | a7 (appraisal at which the loan sits on 75%) | same ceiling mechanism, same loan |
| q11 (price of certainty under stress); error message and explanation print 169,652.31 | a6 answer 169,652.31 | same pair, answer shown |
| q2 (budget max vs 40% line; prints 8,100) | a4 (prints 8,100 as an intermediate) | same line |
| q13 (rate move: 40.04% flag, not ban) | a4 explanation, o2 ("דגל") | same idea |
| q12 (compensation conflict, open question) | o2 last model line (same sentence) | same |
| q14, q15 (who grades, status of the 80%) | prediction of 9.5, summary | same fact |

Fix: keep the check on stage-9 content that the exam does not use. Replace q3 with the document that proves ownership (not Noam's payslip gap), q7 with a negotiation or expiry question (9.3), q11 with a question on the rejected-candidates list (9.4), drop q2's 40% line (ask the budget maximum only), and replace q14/q15 with one question on the red lines or on the reviewer's version. Keep q9, q10, q16, q8.

## Minor

**Exam, labels and terms**
- L539 and C L215-217 show "הבריף" (internal document name) in learner text: say "בתכנון הקורס" or drop the sentence; C q15 option 4 "מספר שהבריף קבע" → "מספר שהוכרז מראש".
- o1 model (L118) "נבחן מחדש" is a first-person-plural form in the course's own answer (the advisor's letter to clients). Change "נבחן מחדש כשהלוואת הרכב…" to "כדאי לבחון מחדש כשהלוואת הרכב…" (and say "מפסיקה להיספר ביחס ההחזר" so a client understands where it stops counting).
- a4 prompt (L66) and its error message use "הקו של 40%" for the capital threshold, while s4b (L243) and 4.5 call 50% "הקו שאסור לחצות" and 40% "סף הון". Say "סף ההון של 40%" in both. Also "כלל 18 החודשים" in a4/s4a is labelled "לא אומת / תעתיק"; 4.2 says it is a decision of Mogi (Eylon approved 2026-10-07) on an unverified source: label "החלטה של Mogi, על מקור שלא אומת".
- L539 and a8 explanation date styles differ (29.7.2026 vs 2026-07-29). One style.
- s8b distractor 2 (L336) quotes the weights 50, 30, 20 that s8a (L326) says are invented: s8a gives s8b away. Change s8b's numbers (e.g. 60/25/15).

**Exam, question design**
- Lesson links (`lesson` field): s2b L198 points to 2.5 (indexation is 2.3, 2.5 is the fixed-linked track): use "2.3"; s6a L284 points to 6.5 but the budget calculation is 4.6: use "4.6"; s5a L254 "5.5" is right but the explanation also says 0.4: fine.
- a5 option 1 (L78) "ואי אפשר לקחת הלוואה כזו": a budget break is a filter of the file, not an impossibility. "…ולכן הצירוף יוצא מהרשימה".
- a8 distractor 4 (L111): the chosen loan's stress payment equals its base payment (8,011.97, the explanation says so), so "תרחיש לחץ" is arguably also true of the number. Change the option to "מחירון: מספר שהבנק מפרסם לכל לקוח".
- o2 model (L130) "ההחלטה משתנה אם תקציב המחיה עולה מעל 12,238.03": above this level the chosen option itself breaks, and the others break earlier; say "מעל סכום זה גם ההלוואה שנבחרה שוברת את התקציב". The number cannot be derived from the prompt: say that in the rubric ("כל סכום נקוב מתקבל").
- o4 hint "ארבעה משפטים" (L272) but the model has eight; o2 hint "פסקה קצרה" fine. Align the o4 hint to "ארבעה עד שמונה משפטים".
- Open question reveal needs only one word (`canReveal`: `words >= 1`); typing "x" shows the model answer. Raise to 8 words or add "כתבו לפחות שתי שורות".
- Prediction (L378-381, `correct={0}`): the right option is first and the longest (97 chars against 63, 78, 75). Move it to place 3 and lengthen two distractors.
- Score table "פתוחות" shows `0 / 13` before reveal, the same as a failed answer; show "–" until revealed.
- a1 and s0a-style prompts "(צריך מחשבון.)" are fine; s5a/s7a "צריך מחשבון שיודע חזקות / שורש": fine.

**Check 9 (C)**
- q2 explanation (L43): "הקו של הבנק הוא המגביל" contradicts q13/9.3 "דגל, לא פסילה" (and "סף הון, לא איסור" of 9.1). Say "הקו של 40% (סף הון, לא איסור) הוא הנמוך מביניהם".
- q4 (L64): no scenario named; add "בתרחיש הבסיס" for the first two parts. All four options are the same length, so the correct one is guessable only by knowledge: fine.
- q6 (L91): "אף אחד מהם אינו תחזית" sits next to "תחזית 451" and 5.4 calls it "תחזית". Say "אף אחד מהם אינו ניבוי של מה שיקרה בפועל".
- q8 explanation (L123): "אם הבנק מחזיק קבועה או משתנה" is garbled (the option says "מה הבנק מחזיק מהריבית"). Rewrite: "אם הבנק מקפיא את הריבית, ועד מתי".
- Option positions (my replication of the component's seeded shuffle): correct option at place 1: 3 questions, place 2: 0, place 3: 5, place 4: 2. Never second, half the time third. Re-seed (use `ExamPaper`'s walk, or change the ids) so each place gets two or three. Lengths fine (correct is not longest in 9 of 10; q4 all equal).
- Pass needs 13 of 16 (81%) because of rounding up; the page says 80%. One clause: "13 מתוך 16".
- Intro L236 "כולן על התוכן של 9.1 עד 9.5" and q14/q15 test the exam's mechanics; after M5 there will be no 9.5 content: update.

**Video 9.5**
- Cue 11 (1:43-1:55) "הסף המוצע הוא אחוז מכל הנקודות" is missing the number; frame t109 shows 80%. Say "הסף המוצע הוא שמונים אחוז מכל הנקודות".
- Frames match the cues at every sampled time (26, 17, 43, 80%, 35, "הצעה, ממתינה לאישור של דביר"); the on-screen label is the short one ("דוגמה לימודית: נתונים להמחשה בלבד"); there are no worked tables, so this is fine. No paths, ids or Brain terms in the VTT.
- Cues 8-10 say "את הסגורות בודק קוד", frame t078 shows only the closed card at 78s: cue 9 starts at 84s, consistent.

**Checked and fine:** `unit=` on all 14 numeric exam questions and 6 numeric check questions (units match; non-money ones say "נקודת אחוז", "%", "נקודות"); correct option never first in more than 3 of 11 exam questions (positions 2,1,4,3,2,1,4,3,2,1,4 by design) and longest only in s5b (tie); contract rate = "חוזית" in s5a, s7a, no "נומינלית" anywhere in 9.5 or check 9; no "we" forms except o1; no Brain, J-code, DEC, FK id, file path or "repo" in rendered text (FK ids appear only in an MDX comment, not rendered); synthetic label on the page callout and part A; "לא אומת" on 329/451/18 months/40/50/75; "ממתין לאישור אילון" on the document-requirements claim (a2, Sources); 80% shown as a proposal pending Dvir in the intro, the component, the summary, Sources, the video and check 9; grading by code and by the learner, never by a model, stated in four places.

## Order to fix
1 M1, M2, M3 · 2 M5 · 3 M4 · 4 the minors (labels and terms first, then C, then the video cue).
