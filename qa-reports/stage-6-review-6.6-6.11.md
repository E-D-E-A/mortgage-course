# QA report: lessons 6.6–6.11, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts (my own engine `engine.py`, `verify.py`), page-text dumps, contact sheets, phone screenshots and a local static server on `dist/` are in my own scratchpad (`/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/qa6/`).

**The reader:** someone who finished stages 0–5 and lessons 6.1–6.5 (thresholds, levers and their prices, the red line), and now meets the process with the banks: outreach and clocks, negotiation, a bank's counter-offer, the underwriter, the five conversations and the workshop plan for case A.

**What I read:**
- the six MDX files in full, and the built pages `dist/lessons/6-{6..11}/` (built 15:59, after the last MDX edit at 15:41);
- `public/video/6-{6..11}.he.vtt` and all 121 key frames `qa/video/6-{6..11}-t*.png` (contact sheets, full size where a defect showed);
- `data/lessons/6-{6..11}.json` (all 953 facts), the six definitions files, `src/data/case-a-offers.ts`, `case-a-positioning.ts`, `case-a-levers.ts`, `case-a-mix.ts`;
- the components as used and rendered at 390px: `FourClocks`, `NegotiationLines` (both viewed), the others through their frames and facts; `UnderwriterDay`, `ConversationTree`, `CaseAPlanner` and `BankMixCompare` read as used in the MDX, not clicked through;
- `src/components/big-picture/stage-6.ts`, checked against the final text of 6.6–6.11 (6.1–6.5 only for the consistency points below);
- `course/AUTHORING.md`, `course/stage-6-brief.md`, `qa-reports/stage-5-review-5.6-5.10.md` (format, X-1/X-2 rules).

**Math check.** Recomputed independently in plain Python `Decimal`: my own engine (statement rounding, index factor `(1+π)^(1/12)`, resets at month 61, prime shift from month 13, the payment re-set only when the rate changes, linked payments carried in base-index money), written from the rules in the module header and fitted only to the known base-scenario facts of 5.x; imports nothing from `src/` or `checks/`. Own bank-policy function (ratio on the unrounded payments at the bank's list, refuse above the ceiling, relief points added, financing-ratio ceiling), own business-day calendar (Saturday never, Friday counts, the closed dates), own round and window logic.
- **251 facts match** (to the agora): every clock date of 6.6, 6.7, 6.10 and 6.11 (approvals, windows, days left, answers of rounds 1–4, rounds that fit, latest start, sequential approvals, the "sign by" date); the four rate effects of 6.6 (82.16 / 80.99 / 65.00 and totals); 6.7 (offers A and B, 31.13, 11,202.64, every notch, rounds 1 and 2, 34,696.77, 5,771.22, 23,494.13, 29,265.35, slack 11 and 4); 6.8 (all four mixes: first, total, stress highest, rise, ratio, variable share, the invented margins 6,287.50 / 6,834.50 / 6,836.00 / 6,150.00); 6.9 (the five files, the four banks, 39,686.77, 51,966.24, 89,015.56, 60,000 short at bank ד׳); 6.10 (all of the station numbers, 80.41 against 238.23, 112.29, the gaps 40,245.89 and 51,095.29); 6.11 (the eight levers: ratio, cash, reserve, total; the plan: 21,000 equity, 39.88%, relief 0.15, equity gain 37,713.39, relief gain 51,302.17, total saving 89,015.56, room 23.46; the smallest equity steps 17,000 and 21,000; wait, parent, car loan from savings and from equity, term +5 years, mix shift 10 points).
- **Every `=` in the six built pages: 22 equalities parsed and evaluated, all hold** on the printed numbers.
- **No wrong number in a table or an answer.** What is wrong is in the sentences around the numbers (B-1 to B-3, S-1 to S-5), not the numbers themselves. Two differences that are not errors but confuse a learner who recomputes: S-4 (the 6.8 ratio) and the 1–5 agorot between the equal-thirds files of 6.9 (they are equal thirds, as the text says).

**Result:** 3 blockers, all about the text against its own numbers or against an earlier lesson. The scaffold, the labelling of invented banks and field knowledge, and the red line are sound.

**Phone (my own Chromium, 390px, all six pages, islands hydrated).** No page scrolls sideways (document 375 in a 390 viewport) and no console error. **The stage-6 phone screenshots do not exist:** `qa/screens/` stops at `phone_lessons_5-10_.png`, so `pnpm screens` was not run for stage 6; the coordinator should run it. Tables wider than their box, with the columns that fall outside (the scroll hint is present):
- 6.7 `NegotiationLines`, rounds table: outside "מול ההצעה של בנק ב׳" and "מה אומר הכלל" (the rule's verdict, the point of the table);
- 6.11 levers table: outside "סך תשלומים ביחס להיום" and "קו שנחצה"; plan table: outside "סך תשלומים אחרי";
- 6.10 first table scrolls by a few pixels; 6.6, 6.8, 6.9: every reading table fits.
`FourClocks` at 390 reads well. Its date field shows `11/01/2026` (US order, ambiguous with 11 January) above "יום ראשון, 1 בנובמבר": nit, a browser-locale effect.

**Case A and the offers.**
- One case, one set of invented numbers: price 2,200,000, equity 560,000, loan 1,640,000, LTV 74.55%, incomes 12,400 + 9,300, car loan 1,450 with 26 months left, disposable 20,250, the initial mix 546,000 / 547,000 / 547,000, savings 40,000, car payoff 36,000, parent 4,000. All agree across 6.6–6.11 and with `case-a-*.ts` (the car payoff is 36,000 in 6.4, 6.10 and 6.11, the savings 40,000 in 6.9–6.11).
- The offers: bank א׳ 8,181.30 / 2,945,264.34, bank ב׳ 8,150.17 / 2,934,061.70, bank ג׳ 8,180.70 / 2,945,052.53 are the same in 6.7, 6.8, 6.9 and 6.11. 6.6–6.8 "list prices" and 6.9–6.11 "relief rules" fit together: at the list the original request sits above every relief line (40.40 / 40.25 / 40.40), so the rules price it at the list, which is exactly the 6.6–6.8 offer. No contradiction.
- The order of banks flips by design: in the original request bank ב׳ is cheapest (6.7, 6.11 line 278), after the plan bank א׳ is (6.10, 6.11). 6.7's negotiation (A towards B) and 6.10's (B towards A) are two different situations and say so.

---

## Blockers

### B-1 · blocker · the wait lever is 9 months in 6.4 and 8 months in 6.9–6.11; "exactly 18 left" is an open question and then used as settled
- **Where:** `6-4.mdx:149` ("אחרי 8 חודשים נשארים 18 בדיוק, ובשיעור 4.2 ראיתם שב־18 בדיוק זו שאלה פתוחה... אחרי 9 חודשים... הכלל ברור"), 471 (error message: "כדי שיהיה ברור צריך עוד חודש"), fact `in.wait = 9`, `l.wait.months_left = 17`. Against: `6-9.mdx:142, 149, 204, 245, 280` (the case with 19 → 18 payments: "ההלוואה כבר לא נספרת", relief jumps), `6-10.mdx:55` (tree: "ממתין 8 חודשים עד שבהלוואת הרכב נשארים 18 תשלומים"), 589 (Sources "המתנה של 8 חודשים"), `6-11.mdx:286, 534, 581, 618` (wait lever 8; "אחרי 8 תשלומים ההלוואה כבר לא נספרת"), `case-a-positioning.ts` (`WAIT_MONTHS = 8`), facts `a.wait = 8`, `t.wait_months = 8`, `in.wait = 8` (6.11), and 4.2 (`4-2.mdx:99`, "18 בדיוק... שאלה פתוחה לאילון").
- **Problem:** the learner is told in 6.4 that waiting 8 months leaves exactly 18 and that whether 18 still counts is open, so the lever needs 9 months. In 6.9–6.11 the same case counts 18 as "not counted" with no label, and the plan's alternative (the wait lever, the 17,215.18 bank-ג׳ entry of 6.11, task 3, exercise 6.11-4, the 6.10 tree) rests on it. The 6.9 file 2w (18 left, relief 0.25, a 39,686.77 swing) is the whole example of "a line is a step", and it sits on the open question.
- **Fix:** one rule for the course. Either 6.9–6.11 use 9 months (17 left) and `WAIT_MONTHS = 9` (all wait numbers change: ratio, bank ג׳ entry), or all four lessons say "לפי כלל התרגיל, ב־18 הלוואה לא נספרת (שאלה פתוחה לאילון)" and 6.4 stops calling 9 "the clear case". 6.9's file 2 can move to 19 → 17 with the same effect.

### B-2 · blocker · "ההמתנה בתוך התוקף לא עולה כלום" contradicts 6.6 and the next station of the same lesson
- **Where:** `6-10.mdx:115` (station 2, option "חותמים עכשיו", feedback: "ההמתנה בתוך התוקף לא עולה כלום, ובלעדיה אי אפשר לדעת..."), `5-10`-style video cue 12 of `6-10.he.vtt` ("ההמתנה בתוך התוקף לא עולה כלום").
- **Problem:** 6.6 teaches that the wait is a risk in both directions (a prime move of 80.41 ₪ a month on the plan, 6.10's own station 4, one frame later in the video), that rounds cost time, and 6.7 that "time is part of the price". The sentence is also unlabelled and states how banks hold a quote. A learner who just computed the 80.41 ₪ reads "costs nothing" and the video says it aloud.
- **Fix:** "ההמתנה בתוך התוקף לא עולה זמן שלא ספרתם: הפריים עלול לזוז (תחנה 4), אבל בלעדיה אי אפשר להשוות". Cue 12: "ההמתנה בתוך התוקף עולה סיכון קטן, ובלעדיה אי אפשר להשוות".

### B-3 · blocker · a double negative printed in the plan lesson
- **Where:** `6-11.mdx:284`: "...ואצל בנק ג׳ סך של 2,875,859.28 ₪, יקר ב־‎−19,610.50 ₪ מהתוכנית" (built text confirms "יקר ב־−19,610.50 ₪").
- **Cause:** the fact `cr.c_vs_plan` is plan minus option (negative, −19,610.50); the sentence says "יקר ב־". The other two (`ew.c_vs_plan`, `bo.b_vs_plan`) are positive and read "פחות מהתוכנית", correctly.
- **Fix:** add a `difference` fact with the minuend/subtrahend reversed (option − plan = 19,610.50) for "יקר ב־".

---

## 6.6 — אסטרטגיית הפנייה לבנקים

The four-clocks split is clear, the "who governs is not always the first to answer" point (bank ב׳ without a new lien, 12 days) is the best part, and the two honest unknowns (how long a round takes, what is held) are labelled where they appear. What is left:

### 6.6-1 · should-fix · "ארבעה בנקים" is a Mogi decision here and a model assumption elsewhere
- **Where:** `6-6.mdx:91` ("עד ארבעה בנקים במקביל — זו החלטה של Mogi"), 436, Sources 455 ("החלטה של Mogi"). Against: `4-11.mdx:425` and `4-12.mdx:522` ("הנחת מודל התיק, לא החלטה על בחירת בנקים... כמה בנקים בפועל — פתוח"), and the stage-6 brief ("up to four banks as model assumption"). `1-5.mdx:279` and `1-10.mdx:288, 823` call it a decision.
- **Problem:** the same sentence has two labels in one course. The three conflicting "how many banks" claims (FK-H-073 / 055 / 081, callout at 102–107) are correctly left unresolved and 6.11 sends to three banks for a stated reason, which is fine; the label of the fourth claim is the problem.
- **Fix:** one label for the course. Suggested: "הנחת מודל (רישום פנימי של הצוות, 2026-08-13), לא כלל על מספר הבנקים הנכון".

### 6.6-2 · should-fix · an exercise assumption stated as inference
- **Where:** `6-6.mdx:239`: "מעל 5 ימים, ולכן הוא סוג הלוואה שהבנק הגדיר מראש (7 ימים), והבנק צריך להסביר את העיכוב".
- **Problem:** answering after 7 days does not make it a pre-defined loan type; it is the example's setting (the fact has `extended = yes`).
- **Fix:** "בדוגמה, בנק ד׳ הוא מסוג ההלוואות שהבנק הגדיר מראש (7 ימים; הנחת התרגיל)".

### 6.6-3 · should-fix · a claim about the purpose of Directive 451, unlabelled
- **Where:** `6-6.mdx:424`: "נקבעו, לפי תעתיק הצוות של הוראה 451, כדי שלבנק לא יהיה זמן בלתי מוגבל לענות, ושלכם יהיה זמן להשוות".
- **Problem:** the transcription gives the rules, not their purpose. A purpose is a statement about regulation.
- **Fix:** "הם מגבילים את הזמן שיש לבנק לענות (לפי התעתיק); למה נקבעו כך, לא נבדק".

### 6.6-4 · should-fix · "בין אם חתמתם ובין אם לא" is an unlabelled claim
- **Where:** `6-6.mdx:182`: "ההחזר של מסלול פריים זז איתו, בין אם חתמתם ובין אם לא".
- **Problem:** before signing there is no payment, only a quote; the sentence says the opposite of the later "מה בהצעה מוחזק: לא ידוע" in the same paragraph.
- **Fix:** "אחרי החתימה ההחזר של מסלול פריים זז איתו; לפני החתימה, מה שהבנק מחזיק במסלול פריים: לא ידוע".

### 6.6-5 · should-fix · video: white labels on the pale track
- **Where:** frame `6-6-t056` (and the frames after it that show the bars with end dates): the date labels "27.11" and "3.12" are white bold text on the light-grey track to the left of the bar, not inside it. Contrast about 1.1:1; at normal viewing they are almost invisible.
- **Fix:** dark text outside the bar, or white text inside the teal.

### 6.6-6 · nit · terms and wording
- "שעון" and "הקובע" are used from the opening (line 58) and in the prediction (line 69) before the definition at 127; the lesson has no glossary entry for "שעון הסבבים" (`6-6.json` is empty).
- Line 163 "נועם ושירה... ביום ראשון, 1 בנובמבר": no year; the whole example is in November 2026 and the lesson date is October 2026 ("data_date"); say "בנובמבר 2026, בדוגמה".
- Line 257: "לבקש סבב אחד ועוד שיכנס" is unclear; say "היום האחרון שאפשר להתחיל בו סבב ושהוא עדיין ייכנס".
- Line 282 (hint) types "9 בנובמבר"; line 394 hints at "המחשבון של 3.1": fine.
- The `FourClocks` note (line 157) shows learners "Brain (אוגוסט 2026)": see X-2.
- Exercise 6.6-6 ("בינוני") is one number read from the component printed above: "קל".

---

## 6.7 — משא ומתן

The map of open / closed / unknown lines is the right device and every line carries its label. The definition of a competing offer (real, in writing, same basis) is exactly right and the lesson says why a bank can see through anything else. What is left:

### 6.7-1 · should-fix · exercise 6.7-1 has two correct answers
- **Where:** `6-7.mdx:307–320`: "מה מהבאים לא פתוח למשא ומתן, כי הוראה קובעת אותו?" with "תקרת 30 השנה" as the only correct option, and option 4 "ביטוח חיים מחוץ לבנק", whose feedback says "זו זכות של הלווים, לא משהו שהבנק צריך להסכים לו". The lines table (73) takes the insurance right from the same transcription of a directive (4.9).
- **Fix:** ask "מה מהבאים הוא מגבלה שבנק לא רשאי להקל עליה" or replace option 4 with something that is not a directive's right.

### 6.7-2 · should-fix · bank behaviour stated without a label
- **Where:** `6-7.mdx:200`: "בנק שיבקש לראות אותה בכתב יגלה את הפער" (also `6-7.mdx:233, 235` in the reveal notes and exercise feedback at 418). Whether a bank asks to see the paper is not known.
- **Fix:** "אם הבנק יבקש לראות אותה בכתב (לא ידוע אם יבקש), הפער יתגלה".

### 6.7-3 · should-fix · "אסור" and "החיסכון" claims without a basis
- **Where:** `6-7.mdx:198`: "אסור להרכיב הצעה מהריבית הטובה בכל בנק (שיעור 5.10)". In 5.10 this is "not a real offer", not a prohibition; the sentence turns advice into a rule. Say "אי אפשר: אין הצעה כזו".
- `6-7.mdx:202`: the last sentence ("לכן את החיסכון מודדים מול ההצעה המתחרה הטובה ביותר") is a Mogi design choice presented as a consequence. Label it "בחירה של הקורס".

### 6.7-4 · should-fix · the first table cell of the rounds table is off the phone
- See the phone section: on 390px the column "מה אומר הכלל" is outside the box. Move the verdict next to the round (right-hand column), or put the verdict in the card above the table.

### 6.7-5 · nit · video
- Frames `6-7-t098`/`t120`/`t133`: the shekel amount under "סבב 1" ends 3px from the right edge ("34,696.77 ₪"), outside the 16px safe margin that `AUTHORING` keeps for the logo and the header.
- Cue 4 "רק הצעה שלמה, אמיתית ועל אותו בסיס היא מתחרה": the definition in the lesson also says "בכתב"; the cue drops it. The red line of 6.10 is built on it.

### 6.7-6 · nit · exercises
- 6.7-7 ("מאתגר") is a conceptual choice with one honest answer (and the longest option): "בינוני".
- 6.7-2 and 6.7-4 print the subtraction in the solution; fine, but 6.7-2's `errors` should also catch the 11,202.64 vs 31.13 swap in the other direction (negative); not an error.
- `6-7.mdx:165` "בערך חצי... פי שניים וחצי": true to the printed 5,807.84 and 34,696.77 / 2.5? Checked: 5,807.84 × 2 = 11,615.68, against 11,599.42 for the half step on the fixed track; "בערך" is right.

---

## 6.8 — למה בנק מציע את התמהיל שלו

The "counter-offer is neither good nor bad without a goal" point is shown on two counters that go opposite ways, which is the right surprise. The invented-cost box (bank's view) is labelled twice as invented. What is left:

### 6.8-1 · should-fix · the ratio the learner can recompute is not the one printed
- **Where:** `6-8.mdx:135`: first payment "נמוך ב־345.56, ויחס ההחזר יורד מ־40.25% ל־38.52%" and the page note ("החזר ראשון על הסכום המלא, חלקי ההכנסה הפנויה"); 139: "היחס ירד כי הוא מחושב מההחזר הראשון".
- **Problem:** the tables print the first payment 7,804.61; 7,804.61 ÷ 20,250 = 38.54%. The 38.52% is the sum of the three payments **without** the month-1 index (7,800.87 ÷ 20,250), which appears nowhere on the page. The explanation in 139 ("מחושב מההחזר הראשון... מסלול צמוד מתחיל נמוך ועולה") is also slightly off: the ratio is read before indexation, not from month 1. For unlinked mixes the two coincide, so only this lesson shows it.
- **Fix:** say it in one clause: "היחס נמדד לפי ההחזר לפני התוספת של חודש המדד הראשון (7,800.87 ₪), לא לפי ההחזר הראשון המודפס", with the number as a fact; or change the DEC-3 formulation to "ההחזר של כל מסלול על סכומו המלא, בלי המדד".

### 6.8-2 · should-fix · "ויחס החזר (שעולה מעל 40%)" and "רחוק מהקו": both mixes are already above 40%
- **Where:** `6-8.mdx:125` (observation 3: "ויחס החזר (שעולה מעל 40%) גבוהים יותר"), 141 ("עולה מ־40.4% ל־40.8%, רחוק מהקו"), exercise 6.8-7 option feedback (345).
- **Problem:** the ratio at bank ג׳ goes from 40.4% to 40.8%, so it was above 40% before. "Rises above 40%" says it crossed the line; "רחוק מהקו" for 0.8 points is not far (about 160 ₪ a month).
- **Fix:** "שעולה מ־40.4% ל־40.8%, שניהם מעל 40%".

### 6.8-3 · should-fix · "לא פורסם קו כזה לאף בנק" is an unlabelled claim about real banks
- **Where:** `6-8.mdx:80`. The same family: `6-9.mdx:432` ("בשוק איש לא פרסם את הקווים"), `6-11.mdx:352` ("הקווים אינם מתפרסמים (שיעור 4.5)").
- **Problem:** what banks publish is not known to the course (the Sources of 6.9 say so: "לא ידוע לקורס").
- **Fix:** "לא ידוע לנו קו כזה לאף בנק".

### 6.8-4 · nit
- `6-8.mdx:83` quotes FK-H-053 "לא נבדק" but omits "ממתין לאישור אילון" (all other FKs carry it).
- Exercise 6.8-7 correct answer feedback (345) prints `hh.first_diff` with no unit ("והמחיר הוא 80.58 בחודש הראשון, 29,003.15 בסך הכול").
- `6-8.mdx:146`: the list of invented costs omits the fifth kind (variable linked 2.15) that `EXERCISE_COST_OF_FUNDS` defines; harmless, the exercise does not use it.
- Video: the first frame's three "33%" sum to 99; say "שליש".

---

## 6.9 — סימולציה: יום אחד בתור חתם אשראי בבנק

The most careful lesson of the six on labelling: the callout at line 53 says in plain words that the rules are the exercise's and not how a bank decides, the table says it again, and the "what the underwriter cannot see" part leads straight to the red line. The "a line is a step" idea is shown with a number a beginner remembers (39,687 ₪ for one payment). What is left (B-1 above also touches this lesson):

### 6.9-1 · should-fix · "חשבו בראש" asks for a mental computation of a ratio
- **Where:** `6-9.mdx:142` (task 2: "חשבו בראש: מה היה היחס אילו נשארו 18 תשלומים?"). The answer needs the first payment of a three-track mix (6,101.43 ÷ 17,000), which no one can do in the head.
- **Fix:** "חשבו (המחשבון של 4.3)", or give the first payment.

### 6.9-2 · should-fix · "שואלים כל בנק איפה הקו" as a step, with no label that a bank may not answer
- **Where:** `6-9.mdx:434` (five questions), exercise 6.9-7 option 1 (420: "לשאול את הבנק איפה הקו ומה ההחזר שנמצא עליו"), and `6-11.mdx:351` (table, "כולם"). Part 249 of the same lesson says the lines are open questions to Eylon. Whether a bank says where its line is: not known.
- **Fix:** add "אם הבנק מוכן לענות: לא ידוע" to each, as 6.10 does for exceptions.

### 6.9-3 · nit
- The correct option of 6.9-1 and 6.9-7 is the longest.
- Error messages of 6.9-3 (354) and 6.9-6 (404) type "40%", "0.15", "19", "18" instead of facts.
- `6-9.mdx:236`: "הטבלה בתחתית מראה את התוצאה": fine.
- Video: first frame says "דוגמה לימודית, לא נתוני שוק"; the full label is only in the lesson (acceptable for a frame).

---

## 6.10 — סימולציות תיק

**The red line is respected.** The tree has three "does not say what it does not have" nodes and each is a bad branch with a stated price: hiding the car loan (intro, `redline` node: "מידע לא נכון, הקו האדום של 6.5; בנק... יכול לסרב, לבטל או לדרוש פירעון... לא אומת; שאלה לעורך הדין"), claiming an offer that does not exist (station 2 option 3, station 5 option 2 with the number "בנק ב׳ יקר ב־40,245.89" proving it false), and the only competing offer used is "הצעה כתובה שקיימת" (station 5 option 1, exercise 6.10-7, frames `6-10-t193`/`t203`). Hiding is never offered as a technique; the "everyone does it" branch is answered with "אין לקורס מקור לזה". The ending texts do not teach a trick. What is left (B-1, B-2 above also touch this lesson):

### 6.10-1 · should-fix · garbled or overclaiming sentences
- `6-10.mdx:232`: "איש לא ידע לקורס" (no one knew to the course): say "הקורס לא יודע, ואף מקור שקראנו לא אומר".
- 339 and 368: "מה שיש בה של הפריים זז, ושאר ההצעה — ממתינה לתשובה בכתב" is unreadable. Say "מסלול הפריים בהצעה זז; על שאר המסלולים מבקשים תשובה בכתב".
- 368: "הפער בין שני המספרים הוא **בדיוק** ההפרש בין ריבית בלבד להחזר מלא": the gap 112.29 − 80.41 = 31.88 is not a difference between "interest only and a full payment" in any exact sense; say "הפער נובע מכך שההחזר החודשי כולל גם החזר קרן".
- 262: "כל תיק עובר בחמש תחנות" and "כולם מהמודולים של השלב" state the course's structure as a fact about files; say "בדוגמה שלנו התהליך עובר בחמש תחנות" and drop "מהמודולים".
- 376: "מה שהבריף ושיעור 6.5 קובעים" ("הבריף" is an internal name, X-2).

### 6.10-2 · should-fix · the "ratio" of the margin and the scenario of station 4 do not meet
- See S-1 (6.11): the plan's room of 23.46 ₪ against the 80.41 ₪ move of station 4. The station never says the family keeps the relief if the prime moves; the next lesson implies they would.

### 6.10-3 · nit
- "ריבית הבסיס" (159, tree) and "ריבית בנק ישראל" (elsewhere): one term.
- `end_good`: "נועם ושירה שילמו 21,000 מהחסכונות": they added it to the equity; "שילמו" suggests a fee.
- Exercise 6.10-5 and 6.10-7 use `f.whole` (no ₪): "חסרים 79,000 של הון": add the sign.
- 6.10-2 solution (472) and 6.10-3 error messages are fine.
- Video: cue "אפשר להציג לבנק הצעה כתובה של בנק אחר" respects the red line; add "אמיתית".

---

## 6.11 — סדנה: תוכנית המיצוב של התיק המרכזי

The deliverable is clear and humble: three paragraphs per lever (gives / costs / when not), a "what is not known, what would change it" box, a plan that explicitly says it is not advice for a real family, and a lever (the parent) that is *better* on the numbers and still left out because the course cannot simulate its legal consequence. That is exactly the stage-6 rule. B-1 and B-3 above live here; what is left:

### S-1 · should-fix · the margin is justified by rate moves it does not cover
- **Where:** `6-11.mdx:214`: "כל תזוזה קטנה בריבית מחזירה את התיק מעל הקו. לכן הסדנה מוסיפה מרווח של 0.1 נקודת אחוז". Room: `p.a.room = 23.46 ₪` a month (0.1 point of the ratio is 20.25 ₪).
- **Check (my engine):** the plan's list payment is 8,076.54 (39.88%). With the prime at the list +0.25 (the very scenario of 6.6 and 6.10) it is 8,157.64, or **40.28%**: above the line. Prime +0.07 already gives 39.996%; +0.08 gives 40.01%. The margin absorbs a prime move of about 0.07 point, a third of a quarter-point. The 17,000 step (room 3.51 ₪) would not survive a rate move of 0.01.
- **Problem:** the learner is told the margin is there for rate moves, and the lesson also tells them a quarter-point move is the size they should expect (6.6, 6.10). Whether the bank re-reads the ratio at the new list price is also not said (6.9 says "לפי המחירון של אותו בנק").
- **Fix:** state the cover ("מכסה תזוזה של בערך 0.07 נקודת אחוז בפריים, לא רבע נקודה") and the open question ("אם הבנק קורא את היחס מחדש בתזוזה: לא ידוע"), or choose a larger margin and let the equity step change (all plan numbers then change). Put the same sentence in the "מה לא ידוע" box (402).

### S-2 · should-fix · "חותמים עד 22 בנובמבר" treats a rate move as one-sided
- **Where:** `6-11.mdx:332` ("מסלול הפריים בהצעה זז איתה... ולכן היעד: לחתום עד 22 בנובמבר"), video cue 17 ("חותמים לפני").
- **Problem:** 6.6 says the move can go both ways; a cut would lower the payment. The date is also in conflict with 6.10's station 2 ("חותמים מיד" gives up the comparison): the plan's sign-by date (22 November) comes after the three rounds (last answer 19 November), so it works, but the reason given is "before the decision".
- **Fix:** "היעד: לחתום לפני ההחלטה כדי שלא להיחשף לתזוזה (שעלולה להיות לשני הכיוונים); זו בחירה, לא כלל".

### S-3 · should-fix · "חצי מהרווח" is 42% and 58%
- **Where:** `6-11.mdx:418` ("מי שבדק רק את החיסכון בריבית על ההלוואה הקטנה פספס חצי מהרווח"), video cue 12 ("חצי מההלוואה הקטנה, חצי מחציית הקו"). The bar in frame `6-11-t120`-ish is drawn at 37,713 : 51,302.
- **Fix:** "פספס יותר ממחצית מהרווח (51,302.17 מתוך 89,015.56)"; cue: "37,713 ₪ מההלוואה הקטנה, 51,302 ₪ מחציית הקו".

### S-4 · should-fix · why parallel is better: the reason given does not follow
- **Where:** `6-11.mdx:299` ("למה במקביל? כי כל אישור נספר מהתאריך שלו, ולא מתאריך הפנייה"). That is true of both orders; the real reason is in 327 (the last answer arrives 7 days later and leaves 14 days of bank א׳'s window instead of 21). Say that at 299.

### S-5 · should-fix · the "דוגמה" and "המפה" and "הבריף" in learner text
- See X-2: "הבריף, חלק 3" (579, exercise 6.11-7 feedback), "המפה" (212: "זה בדיוק התרגיל של המפה"), "המודולים" (101: "כל מספר מהמודולים"), "הכול מחושב בקוד" (591).

### 6.11-nits
- 6.11 line 108 and Sources 618 say the initial mix is "שיעור 5.8"; 6.6–6.8 say 5.6 (both lessons use it; say "שיעורים 5.6 ו־5.8").
- Frame `6-11-t146`…: the Bank of Israel date is a red dashed line (status colour for a neutral event); 6.6 uses black.
- 6.11-7 ("מאתגר") is a classification of a table row printed in the lesson: "בינוני"; 6.11-3 error text OK.
- 6.11 task 3 ("שילוב שנכשל"): the planner says savings are not enough; fine.
- `6-11.mdx:285`: the parent lever is cheaper than the plan by 8,356.53 ₪ with no cash. The lesson says why it is out. A learner may still read the plan as "not the best"; the line "אבל הוא לא בתוכנית" could add "הבחירה היא של המשפחה" (the callout at 593 says it).

---

## Cross-lesson items

**What agrees, and needs nothing:**
- case A across stage 5 and 6 (see "Case A"); the car-loan payoff 36,000 and the 40,000 savings are the same in 6.4, 6.10, 6.11 and in `case-a-levers.ts`;
- invented banks and policies are always stated as the exercise's own rules: `MARK` in every lesson, the warning callouts of 6.9, 6.10, 6.11, "הכללים בדויים" under each table, and "הקורס לא יודע איפה בנקים אמיתיים שמים קווים". Not once is it presented as how real banks work;
- FK-H-050, 051, 052, 053, 054, 055, 057, 071, 072, 073, 076, 081, 093 appear as "ידע מהשטח, ממתין לאישור אילון" (exceptions: 6.8-4 above); no use of FK-H-096 or the "Hila/Yuval" persuasion claims; "עובדה מאומתת" appears nowhere in 6.6–6.11;
- the three "how many banks" claims are left unresolved in 6.6 (callout 102–107), referred to unchanged in 6.7 (204) and not reopened in 6.11 (619);
- the 6.5 red line (rent offset / inflating debt) appears only as the forbidden branch of 6.10 and the feedback of 6.9-7 and 6.7-7, never as technique; the positioning that "passes the bank but strangles the family" is named a failure in 6.10-2, 6.11 rule 4 and exercise 6.11-7;
- the "בשיעור הבא" lines match the map: 6.6 → 6.7 "משא ומתן" (map title there is longer in the map; fine), 6.7 → 6.8 "למה בנק מציע את התמהיל שלו" (exact), 6.8 → 6.9 (exact), 6.9 → 6.10 "סימולציות תיק", 6.10 → 6.11 (exact), 6.11 → the stage check and stage 7 (early repayment, refinancing: matches the map).

### X-1 · nit · bidi
The negative values in 6.8 and 6.7 (`delta`, `<M>`) render with the sign on the correct side (frames, `6-8` page text); the 5.x problem (`pts()` bare "−") does not appear in 6.6–6.11. The date strings "12.11, 16.11 ו־19.11" in the 6.6 video cue read correctly in the frame; keep "12.11" in an LTR run in the subtitles (cue 16).

### X-2 · should-fix · internal names in learner text (stage 4's X-2 and X-8, and 5.x's X-2, again)
- "Brain", page numbers and J-codes in the body: `6-6.mdx:93, 95, 98, 99, 100, 115, 132, 195, 301` (J-060, J-050, J-100, J-070), the `FourClocks` note (157: "תעתיק בצוות ב־Brain (אוגוסט 2026)"); `6-7.mdx:94, 202, 212, 214, 224` (J-100, J-110), 222; `6-8.mdx:85` ("בדף מחקר ב־Brain"), 139 ("DEC-3, אילון, 2026-10-07; Brain 67436545"); `6-9.mdx` Sources 461 ("Brain (דף 7503881…)"), 462 ("בקובץ השאלות של שלב 6"); `6-10.mdx:262, 376` ("המודולים", "הבריף"); `6-11.mdx:101, 212, 579, 591` ("מהמודולים", "המפה", "הבריף, חלק 3", "מחושב בקוד").
- Repo paths and Brain numbers shown in learner-visible Sources: `6-6.mdx:453–457` ("Brain 5898285, 5931054… research/notes/brain-product-journey.md"), `6-7.mdx:457–460` ("research/notes…", "Brain 60588034"), `6-8.mdx:385, 387` ("Brain 67469313", "Brain 67436545, כלל DEC-3"), `6-10.mdx:593` ("Brain 33718276… research/notes/brain-calculation.md"), `6-11.mdx:620–623`.
- In the big-picture cards: `stage-6.ts:123` (note: "Brain 33718276, 2026-08-31, דרך research/notes/brain-calculation.md") is shown on the card.
- **Fix:** write "לפי תכנון של Mogi (2026-08-13)", "לפי מחקר של צוות Mogi", "לפי תעתיק של הצוות"; move codes and paths to the closing MDX comment. FK ids stay.
- A named person: "טובי זמיר, בנקאי מחוץ לצוות" in the body of 6.6, 6.7, 6.8: as in 5.9-4, "בנקאי בשטח (FK-H-0xx)" is enough.

### X-3 · should-fix · the big-picture cards against the final lessons (`stage-6.ts`)
Read every card of 6.6–6.11 (`outreach`, `offer_validity`, `rate_drift`, `negotiation`, `competing_offer`, `counter_offer`, `bank_preference`, `underwriter`, `positioning_plan`, `outreach_plan`, `bank_questions`) and the links of lines 323–359; the 6.1–6.5 cards only by grep. **No card states a number** (no figure other than lesson ids and FK ids). All link endpoints exist. Inconsistencies with the final text:
1. `competing_offer` role (line 196): "היא הדרך **היחידה** להראות לבנק מחיר אחר, אבל רק הצעה אמיתית ובעלת תוקף": 6.7 says a real, written offer on the same basis is what counts as a competing offer; it does not say it is the only way to show a price (and "ובעלת תוקף" is not in 6.7's definition, which says "בכתב"). Say "הדרך שהקורס מלמד".
2. `outreach` (147): "ולמה בכמה במקביל. כל בקשה נבדקת בנפרד" matches; but the card does not carry the label that the number four is a Mogi/model assumption (see 6.6-1); add after the label is decided.
3. Link `rate_drift → offered_rate` (329) and `negotiation → offered_rate` (335) agree with the lessons ("לא ידוע").
4. Card note 123 (internal paths): X-2.
5. The header comment promises "a consistency read against those lessons' final text" for 6.1–6.8: this report covers 6.6–6.8; no `threshold`/`lever` card was re-checked beyond the grep above.

### X-4 · nit · letters and notation
6.6–6.11 introduce no new letter; `<M>` is used for every equality. The "20,250 × 40 ÷ 100" form in 6.9 repeats 4.4's formula and says so (line 91). Good.

### X-5 · nit · Sources and the Eylon list
Source kinds are used correctly. One-line "בדיקת חישוב: נבדקו פעמיים בשתי שיטות" is dated 2026-10-16 in each lesson and is true for 6.6–6.11 (it matched my third method). The open questions the lessons push to Eylon (the real lines per bank, the ratio price above 40%, whether a second round improves a quote, how fast a quote's prime moves, what a bank holds when the prime moves, what is refused in a negotiation, whether telling a bank it is one of several helps) should be in `research/stage-6-raw/eylon-6-*.md`; I did not open those files.

---

## Count

3 blocker, 24 should-fix (6.6: 5 + X-2/X-3 share; 6.7: 4; 6.8: 3; 6.9: 2; 6.10: 3; 6.11: 5; cross-lesson: 2), 24 nit.

**The most important items, in the order I would fix them:**
1. **B-1:** the wait lever is 9 months in 6.4 (18 exactly is open) and 8 months, with 18 "not counted", in 6.9–6.11 and `case-a-positioning.ts`.
2. **B-2:** "ההמתנה בתוך התוקף לא עולה כלום" (6.10 text and video) against 6.6's whole point and its own station 4.
3. **B-3:** "יקר ב־−19,610.50 ₪" (6.11 line 284): a reversed `difference` fact.
4. **S-1:** the 0.1-point margin covers a prime move of about 0.07 point; the plan sits at 40.28% after the 0.25 move of 6.6 and 6.10.
5. **6.8-1 and 6.8-2:** the printed ratio 38.52% is not first payment ÷ income (38.54%); "rises above 40%" when both were above.
6. **6.6-1:** "ארבעה בנקים" is a decision in 6.6, a model assumption in 4.11, 4.12 and the brief.
7. **6.7-1:** two correct answers in 6.7-1 (insurance).
8. **S-2 and S-3:** "sign before the decision" is one-sided; "half of the gain" is 42% / 58%.
9. **X-2:** "Brain", J-codes, DEC-3, "הבריף", "המודולים" and repo paths in learner text and Sources, and in the card note of `stage-6.ts:123`.
10. **Video and phone:** `6-6-t056` white labels on pale grey; `6-7` amounts at the frame edge; the 6.7 rounds table and the 6.11 levers table lose their verdict columns on the phone; the stage-6 phone screenshots are missing from `qa/screens/`.
