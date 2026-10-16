# QA report: lessons 5.6–5.10, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts, page-text dumps, screenshots and a local static server on `dist/` are in my own scratchpad (`/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/qa/`).

**The reader:** someone who finished stages 0–4 and lessons 5.1–5.5 (offers, baskets, comparison measures, forecasts, the four kinds of "rate" number), and now builds, tests and judges a mix.

**What I read:**
- the five MDX files in full (exercises, `errors`, FillTable/MatchTable configs, `<Sources>`), and the built pages `dist/lessons/5-{6..10}/` (built after the last MDX edit, 10:44 against 10:31);
- `public/video/5-{6..10}.he.vtt` and all 118 key frames `qa/video/5-{6..10}-t*.png` (contact sheets, plus full size where a defect showed);
- `data/lessons/5-{6..10}.json`, the definitions files, `src/data/case-a-mix.ts`, `src/lib/calc/sensitivity.ts`, `schedule.ts`, `offers.ts` (for the basket and offer conventions);
- the components as used: `MixBuilder` (props in 5.6/5.7/5.8), `MixJudge` (read, then rendered, all four yardsticks, both states, 390 and 1280), `MixComplianceChecker`;
- `src/components/big-picture/stage-5.ts` and its registration in `index.ts`, checked against the final text of 5.1–5.10 (page text of 5.1–5.5 for the card claims);
- phone: my own Chromium at 390px over every table of the five pages (which header cells fall outside the scroll box), and a character-level bidi probe (see below);
- `course/AUTHORING.md`, `course/stage-5-brief.md`, `course/course-map.md` (stage 5, 6, section 8), `qa-reports/stage-4-review-4.1-4.5.md` (I follow its format and its X-2 / X-8 rules).

**Math check.** Recomputed independently in plain Python `Decimal` (my own implementation of the statement-rounding schedule, index factor `(1+π)^(1/12)`, resets, levers and goals, written from the rules in the lessons and the module header; nothing imported from `src/` or `checks/`):
- **All 296 `sens_mix` facts of 5.6, 5.7 and 5.8 match** (50 + 124 + 122: first, max, max month, total, qualifying payment, ratio, variable share and room, balances, left-for-living, every lever).
- 5.6: the 7 candidates (first, highest, total, stress highest, rise, ratio, variable share, pass/fail), the 40.4% ratio (40.4015), the 333.33 ₪ room (two thirds of 1,640,000 cut to the agora, minus 1,093,000), 8,100 and 81.30, the winners (payment: "צמוד"; total: "25 שנה"; exposure: "קבועה בלבד"; highest: "חצי־חצי"), the two failing mixes (79.27% variable; 50.8% ratio), tasks 1–3, exercises 2–7 and every error value (31.18 × 360 = 11,224.80; 30.39; 32.62).
- 5.7: levers, the 811.62 / 2,077.26 ("יותר מפי שניים"), the thirds (82.16 + 79.93 + 81.37 = 243.46 exactly), the asymmetry of the index lever (+4,062.67 against −3,056.27), the combo gap −10.87, exercises 1–7.
- 5.8: the three term rows, three scenarios, balances, limits, 43.65 / 40.56 / 32.57, exercises.
- 5.9 and 5.10: first payment, highest in scenario (prime +2 after 12 months, 5-year track +2 after 60), totals for A, B, B at 360, basket 3 at 300 and 360, the combination, all gaps, effective rates (12 → 12.6825; 4.9 → 5.0116; 3.95 → 4.0223; 4.5 → 4.5940; 4.7 → 4.8026; 4.4 → 4.4898), ratios 41.64 / 41.17, case A moved 100,000 (8,198.86; 40.49%), the 6,587.06 against 6,587.07 note (below).
- **Every `=` in the five built pages: 36 equalities parsed and evaluated, all hold on the printed numbers** (one holds only after rounding, 5.9-12).

**Result:** no wrong number in a table or an answer. Two statements about the numbers are wrong (5.8-1, 5.8-2), and I found a family of bidi defects (X-1), a component that scrambles Hebrew phrases (5.9-1), and several unlabelled or overstated claims.

**Phone.** No page scrolls sideways (document 375 in a 390 viewport). Reading tables wider than their box, with the columns that fall outside (all of them are the column the text talks about next, except where noted):
- 5.6: the three-mix payment table (outside: months 121, 241, 360) and the seven-mix table (outside: total, rise in stress, ratio, variable share, passes);
- 5.7: the levers table (outside: total, ratio after);
- 5.8: term table (balance after 10 years), scenario highest/total tables (stress), balance table (after 10, after 15), the final table (total, debt after 10, ratio), the MixBuilder comparison table (the difference column);
- 5.9: the yardstick table (what must be equal, what it cannot say), the prices table (the rate), the summary table;
- 5.10: the five checks table (can it be computed, how do we know), the two offers tables (the combination column).

**Case A.**
- Case A (נועם ושירה) in 5.6–5.8 and in the 5.10 checker uses only the map's data (price 2,200,000, equity 560,000, loan 1,640,000, nets 12,400 and 9,300, car loan 1,450 with 26 months left, 31 and 30, a child, second-hand home) and the assumed mix in `case-a-mix.ts`. **No bank offer for case A anywhere; no violation.** The 40.4% is computed (8,181.30 ÷ 20,250), never typed in the pages.
- Numbers agree across 5.6–5.10 and with stages 3/4: recognised income 21,700, disposable 20,250, 18-month rule kept (26 > 18), 74.55%, room 10,000 under 75%.
- Hila and Yuval (5.9, 5.10) are separate, invented ("משפחה בדויה"), not case A.

---

## 5.6 — שלושת יעדי התמהיל

The structure is right and the central device works: a goal is a number, and each goal needs one more answer (which month, which scenario, how much and which way). The seven-mix table and the "limits change the winner" point are the best part. What is left:

### 5.6-1 · should-fix · "הגרוע מבין הכול" is true only among the mixes that pass
- **Where:** MDX 342 (conclusion of the solved example): "לפי ההחזר הגבוה ביותר, לפי סך התשלומים ולפי היציבות, הוא הגרוע מבין הכול".
- **Problem:** among all seven, "צמוד, בעיקר משתנה" has a higher stress rise (18,667.95 against 18,123.60). "צמוד" is worst only among the five that pass.
- **Fix:** "הגרוע מבין התמהילים שעוברים".

### 5.6-2 · should-fix · the tie rule is unreadable
- **Where:** MDX 298: "שוויון: כשיש שני תמהילים עם אותו מספר, שניהם מנצחים. כאן הרשימה לפי הסדר, והראשון בה נקרא ראשון."
- **Problem:** the second sentence says the opposite of the first (both win / the first wins). `rankCandidates` keeps list order and gives rank 1 to the first.
- **Fix:** "שוויון: כשיש שני תמהילים עם אותו מספר, נקרא ראשון זה שמופיע ראשון ברשימה; שניהם שווים".

### 5.6-3 · should-fix · "Brain" and an internal page code in the body, and file paths in Sources
- **Where:** MDX 56 and 88 ("דף J-090 ב־Brain", "(J-090)"), 527 and 531 and 532 (Sources show `research/notes`, `scripts/case_sketch.py`, `src/data/case-a-mix.ts`).
- **Problem:** the stage-4 rule (X-2, X-8) is that the body does not use internal page codes or "Brain" and learner-visible Sources do not show repo paths. The learner is never told what J-090 or Brain is. FK ids in the body are fine (4.1 does it).
- **Fix:** "לפי תכנון המוצר של Mogi (עודכן ב־2026-10-08)"; move J-090, page numbers and paths to the closing MDX comment.

### 5.6-4 · should-fix · the shared sentence "אין תמהיל אחד הטוב ביותר" is a general claim, labelled once
- **Where:** MDX 94: "תמהיל שזול ביותר בסך הכול דורש בדרך כלל החזר גבוה יותר עכשיו, ותמהיל בטוח ביותר עולה בדרך כלל יותר".
- **Problem:** "בדרך כלל" is a statement about practice. The label (Mogi's note, not checked) is in parentheses and the Sources row says only that the three goals are a design. The reveal (MDX 321) says correctly "זה לא חוק טבע: במבחר אחר ייתכן ...". The first sentence is stronger than the reveal.
- **Fix:** "בקבוצה הזו" instead of "בדרך כלל", and add this sentence to the Sources row of J-090.

### 5.6-5 · should-fix · video: a card title runs out of its card
- **Where:** frames `5-6-t020` to `5-6-t033` (and `t027`): the card "משתנה לא צמודה · עדכון כל 5 שנים" is wider than the card and overlaps the neighbour's edge by about 20px at 1280.
- **Fix:** wrap the title or shorten to "משתנה, כל 5 שנים" (as 5.9 and 5.10 write it).

### 5.6-6 · nit · video wording
- Cue 21 "כל תמהיל כאן עובר את הגבולות" is followed at once by "אבל הגבולות משנים מי מנצח" and two mixes that fail. It means "the five on the screen". Say "חמשת התמהילים האלה עוברים".
- Cue 25 "בלי אישור, הם לא מועמדים": "אישור" reads as the bank's approval. Say "בלי לעבור את הגבולות".
- The stability chart shows a diagonal break on the 18,123.60 bar (`t150`, `t157`) that no cue or caption explains.

### 5.6-7 · nit · typed numbers and one lookup
- MDX 140 types "3.25%" and "1.5 נקודות אחוז" (the prime rule) and 260 types "2.9%"; AUTHORING wants facts (the page already has `prime.today`).
- Exercise 6 ("מאתגר") is the worked formula of MDX 619/478 with the numbers already printed; label it "בינוני" or change the inputs.
- Exercise 7: the correct option is the longest and most complete.
- Exercise 2 task: the stem "אחרי כל התשלומים" counts nothing for living expenses, which is the later `leftAt`; say "אחרי התשלום על ההלוואה והרכב".

---

## 5.7 — רגישות

The "one knob at a time" lesson is solid. The index lever is shown twice (zero here, thousands on the linked mix), which is the right surprise. The combination gap (−10.87) is the honest answer to "do they add up". What is left:

### 5.7-1 · should-fix · "אחד בלבד נמצא בשליטתם" contradicts the lesson's own warning
- **Where:** MDX 351: "אחד בלבד נמצא בשליטתם של נועם ושירה לבדם ולא דורש כסף נוסף או הסכמה של בנק: האחוז בין המסלולים".
- **Problem:** the mix proportions are part of what the bank approves and prices (FK-H-057, quoted in MDX 62 and 347). A family cannot choose 20 points from prime to the 5-year track on its own. The sentence is also unlabelled.
- **Fix:** "הצעד היחיד מבין השלושה שלא מגדיל את ההון הדרוש (ההלוואה נשארת) הוא האחוז בין המסלולים; גם אותו הבנק צריך לאשר, ויכול לתמחר אחרת (FK-H-057)".

### 5.7-2 · should-fix · "הפריים מרגיש את ריבית בנק ישראל מיד" and "הפריים מיד" are unlabelled and contradict the scenario
- **Where:** MDX 176 ("הפריים מיד, והמשתנה כל 5 שנים") and 351 ("מרגיש את ריבית בנק ישראל מיד").
- **Problem:** in the scenario the prime moves from year 2, not at once, and "prime follows the Bank of Israel rate" is the convention of 2.1, not a stated fact here.
- **Fix:** "הפריים מהשנה השנייה (בתרחיש), והמשתנה בעדכון".

### 5.7-3 · should-fix · negative gaps in the video script and a double sign
- **Where:** `5-7.he.vtt` cues 7 and 8 ("ההחזר הראשון −19.49 ₪", "מהפריים למשתנה: −48.30 ₪"); MDX 156, 174, 176, 253: "עולה ב־{delta}" prints "עולה ב־+609.84 ₪" and "ב־+4,062.67".
- **Problem:** see X-1 for the bidi part (the script lines under the video render the sign on the wrong side). The "+" after "עולה ב־" says the same thing twice.
- **Fix:** isolate the number in the cue; use `f.shekels` (unsigned) after "עולה ב־/ירד ב־" and `delta` only where the sign is the point.

### 5.7-4 · nit · typed numbers
- MDX 44–49 (`tableRows` steps "164,000 ₪", "100,000 ₪ פחות", "0.25") and 300, 304, 333–334 ("164,000 ₪ מתוך 1,640,000 ₪", "40,000 ₪", "0.15"). "164,000" is 10% of the loan, derived. AUTHORING: from facts.
- Hint of the half table (MDX 372) types 20,250 and a spreadsheet formula with 20250.

### 5.7-5 · nit · wording
- MDX 151: "רק לפי הפער" is true to a first approximation (annuity factors differ with the rate); "בערך" helps.
- Exercise 6 asks "איזה צעד אחד" and offers one correct and three wrong, while the lesson's own table (MDX 347) shows that 20 points prime → 5-year track (39.92%) and 0.15 less (39.69%) also work. Say "מבין האפשרויות האלה".
- Exercise 6 option 4 states "אי אפשר להאריך מעבר ל־30 שנה" as a rule; it is the 329 line (label "לפי התעתיק").
- MDX 168: "ההשפעות כמעט שוות" holds for 266.88 against 270.28; fine, but the closing clause ("בתמהיל שבו מסלול אחד גדול הרבה יותר, הידית שלו תזיז יותר") is not shown. Either show one example or drop it.

### 5.7-6 · nit · video
- Cue 21–23: "מה מוריד את היחס מתחת ל־40%?" then shows the 10-year cut (50.66%, which raises it). Say "מה מזיז את היחס".

---

## 5.8 — סדנה: שלוש חלופות לתיק המרכזי

The four parts are the right workshop. The recommendation box (goal, who it suits, the price) and the "what is not known / what would change it" rule are exactly what the map asks for. What is left:

### 5.8-1 · blocker · a wrong statement about the numbers in a worked solution
- **Where:** MDX 523, `<Solution for="5.8-3">`: "בתרחיש מחמיר ההפרש גדל: הסך של ״25 שנה״ עולה ל־{alt.short.stress.total}".
- **Problem:** the gap between "קבועה בלבד" and "25 שנה" in the stress scenario is **smaller**, not larger: 2,956,492.09 − 2,905,722.63 = 50,769.46, against 304,727.51 in the base scenario (relief: 422,941.38). "25 שנה" has two variable tracks and gets more expensive under stress, so the gap shrinks. A learner who checks the sentence against the solution's own number finds it false, and the lesson's point (scenarios change the order) is stated backwards here.
- **Fix:** "בתרחיש מחמיר ההפרש קטן: הסך של ״25 שנה״ עולה ל־2,905,722.63, וההפרש מ״קבועה בלבד״ יורד ל־50,769.46" (new `difference` fact).

### 5.8-2 · blocker · sign of the first-payment gap in the term example (text and video)
- **Where:** `5-8.he.vtt` cue 8: "קבועה 20 ומשתנה 30: +126.72 ₪ בחודש הראשון. אבל הסך גבוה ב־72,995.69"; MDX 381 (expected observation 3): "{delta(term.b_first_gap)} פחות בחודש מהשורה הראשונה" prints "+126.72 ₪ פחות בחודש".
- **Problem:** the first payment of row 2 is 8,712.50, **lower** than row 1 (8,839.22) by 126.72. The video says "+" and then "אבל", which only makes sense for a minus. The page prints a plus before the word "פחות". The fact `term.b_first_gap` is a positive difference (a − b); the sign is the display's choice.
- **Fix:** cue "−126.72 ₪ בחודש הראשון"; on the page use `f.shekels` ("126.72 ₪ פחות") or `−`.

### 5.8-3 · should-fix · garbled sentence in the prediction reveal
- **Where:** MDX 397: "ההחזר הנמוך הוא גם החוב הנמוך בתשלום, אבל לא החוב הנמוך בקרן".
- **Problem:** unreadable and not what the numbers show (the linked mix has the low payment and the **highest** debt).
- **Fix:** "החזר חודשי נמוך לא אומר חוב נמוך: ב״צמוד״ ההצמדה מוסיפה לחוב כמעט כמו התשלומים שמורידים ממנו".

### 5.8-4 · should-fix · "הצעות אמיתיות" in stage 6
- **Where:** `5-8.he.vtt` cue 25 ("בשלב 6 מגיעות ההצעות האמיתיות"); MDX 595 and 608.
- **Problem:** AUTHORING and the brief: offers in this course are invented and say so. Stage 6's offers for case A will be the course's too. The lesson also says elsewhere "אין לנועם ושירה עדיין הצעות".
- **Fix:** "בשלב 6 מגיעות ההצעות של הבנקים הבדויים של הקורס"; in the five-questions text "מבקשים הצעות מבנקים" (a real family's step) is fine.

### 5.8-5 · should-fix · "Brain" and page codes in the body and paths in Sources
- MDX 62 ("J-090"), 620 and 622 (Sources show `research/notes`, `scripts/case_sketch.py`, `src/data/case-a-mix.ts`). Same as 5.6-3.

### 5.8-6 · should-fix · prediction and text disagree on the sale year
- **Where:** MDX 74 ("אחרי 10 שנים הם מוכרים"), 239 ("אולי יעברו דירה אחרי 7 שנים"), exercise 4 (7 years).
- **Problem:** an invented plan for the family that changes between screens, and not labelled as a course assumption (the Sources item covers only "אנחנו לא רוצים הפתעות").
- **Fix:** one sentence, "הנחת הסדנה: מכירה אחרי 7 או 10 שנים", and an item in Sources.

### 5.8-7 · nit · levels, options and units
- Exercise 6 ("מאתגר") is one subtraction whose operands are printed in the exercise; "בינוני" at most.
- Exercise 7: the correct option is by far the longest.
- The limits table header "תקופה (עד 360)" has no unit (חודשים); the cells show 300/360.
- MDX 229 ("הפער בסך בין מחמיר למקל") for "קבועה בלבד" prints "0.00 ₪" without saying so; say "אפס".
- MDX 178: the relief scenario says "יורדים בנקודת אחוז אחת" without "הפריים מהשנה השנייה" as the stress line does.
- The balance table (MDX 241–262) and the stress/relief tables are wider than a phone (list above).

---

## 5.9 — האם התמהיל טוב?

The four yardsticks with "what must be equal / what it cannot say" is the right teaching device, and breaking the basis on purpose (nominal against effective; 360 against 300 months) works. The sign convention (mix minus reference, negative = cheaper) is stated and applied consistently. What is left:

### 5.9-1 · should-fix · MixJudge scrambles Hebrew phrases in its numbers
- **Where:** MDX 48–51 and 57 (the "יעדי הלקוח" yardstick): `ref: "עד …₪"`, `gap: "נשארו …₪"`, `gap: "עודף …₪"`; the component renders every cell as `<span class="ltr">`.
- **Problem:** a Hebrew word inside a forced-LTR span is laid out wrong. I measured the characters: "עד 6,700.00 ₪" shows as `6,700.00 עד ₪`, "נשארו 38.29 ₪" as `38.29 נשארו ₪`, "עודף 9.81 ₪" as `9.81 עודף ₪`. Read right to left, the Hebrew reader meets the currency sign, then the word, then the number. These are the first rows the learner sees in the tool. The component says "every cell is a number".
- **Fix:** put only the number in the cell and the words in `measure` or `caption` ("תקרה"), or ask for a `refLabel`/`gapLabel` prop (the coordinator changes the component).

### 5.9-2 · should-fix · "good" against the basket compares two different mixes, which 5.3 says is not a price comparison
- **Where:** yardstick 3 (MDX 88–110 and 283–290), against 5.3 ("ארבעה דברים זהים: הסכום, התמהיל, התאריך, התחזית", "תמהיל אחר, לא מחיר אחר"); card `comparison_basis`.
- **Problem (this is the consistency question you asked for).** 5.9 prices basket 3 with the same metrics engine as 5.3 and the same basket (½ fixed unlinked, ½ prime, one term, Spitzer; 300 months as in 5.3's 25 years; consistent with `offers.ts` and 5.2). But the conventions differ in three ways, and the lesson does not say so:
  1. 5.3 says a comparison is legitimate only on the **same mix**. 5.9 compares the family's three-track mix with the two-track basket and draws "better/worse" verdicts; its `mustMatch` list for the basket (amount, term, bank and date, scenario) omits the mix and the forecast.
  2. 5.3 measures expected total rate, total expected payments and highest expected payment on a Directive-451 forecast. 5.9 uses first payment, highest in a scenario (+2 points, prime after 12 months, 5-year track after 60) and total with and without the scenario. The Sources row says the scenario "is not the forecast of 451"; the body (MDX 255) says it is 5.4's subject. Nothing says "this is not the 5.3 trio".
  3. 5.3 names the maximum "ההחזר המרבי החזוי"; 5.6–5.10 call the same idea "ההחזר הגבוה ביותר (בתרחיש)".
- **Fix:** one paragraph after MDX 290: "זו לא השוואת מחיר במובן של 5.3 (שם התמהיל זהה). הסל כאן הוא נקודת ייחוס למבנה: מה קיבלתם ומה שילמתם על כל הבדל בחלוקה". Put the same sentence in `cannot`. Add "אותו תמהיל" to the `mustMatch` of "הצעה של בנק אחר" (it is there) and say the basket row is the exception.

### 5.9-3 · should-fix · "הילה ויובל" in the feminine plural
- **Where:** MDX 234 ("לוקחות"), 396 ("מחזיקות"), and in 5.10 MDX 183 ("לוקחות", "שלהן"), 220 ("מקבלות").
- **Problem:** a mixed pair would be "לוקחים / שלהם / מקבלים"; "יובל" is not marked as a woman and the lesson never says it is a couple of women. Also "הילה" is a different person in 3.2 (single), 5.4 (with אורן) and here (stage 4's X-6 raised the same for "דנה").
- **Fix:** say the intended gender plainly or use the masculine plural; pick a name not used before.

### 5.9-4 · should-fix · "Brain" and codes in the body, and a named banker
- **Where:** MDX 232 ("מ־Brain, בעמוד שבונה תמהילים (J-090)"), 265 ("Brain, 2026-10-08"), 283, 298 ("Brain, J-100"), Sources 612 and 614 (paths and "Brain 67469313").
- **Problem:** as 5.6-3. Also "טובי זמיר (בנקאי, 2026-08-05)" (MDX 302) names a real person in learner text; stage 4 used "טובי" with the field label, which is acceptable, but a full name is more than the label needs.
- **Fix:** "לפי תיאור התהליך של Mogi"; "לפי מחקר של צוות Mogi"; "בנקאי בשטח (FK-H-054)".

### 5.9-5 · should-fix · the J-100 process description is not labelled as a design
- **Where:** MDX 298: "לפי תיאור התהליך של Mogi (Brain, J-100), שולחים לכל הבנקים את אותו תמהיל, וכל בנק מתמחר אותו".
- **Problem:** it is Mogi's planned process (kind "מחקר / הצעה" in Sources) but the body states it as how things are done. 5.10 repeats it as "תיאור התהליך".
- **Fix:** "לפי התכנון של Mogi (עדיין לא נבדק מול בנקים)".

### 5.9-6 · should-fix · hard Hebrew
- MDX 267: "ריבית בחוזה היא נומינלית, והיא נקראת בחיתוך ל־12 חודשים" — unclear ("נקראת בחיתוך"?). Say "הריבית החודשית שלה היא הריבית השנתית חלקי 12".
- MDX 300: "בנק ב׳ מקבל את שלושת המדדים" — means "זול יותר בשלושת המדדים".
- MDX 232: `<Term t="החזר ראשון">החזר חודשי</Term>` puts the popover of "החזר ראשון" on the words "החזר חודשי", which is a different thing in 3.1 vs 3.8.

### 5.9-7 · nit · the 12% mini example
- MDX 216–218 (nominal 12%, average 12.5%): a rate no mortgage in the course has, in a lesson about telling real prices from noise. 5.5 already did this with 4.7%/4.80%. Say "מספרים עגולים להמחשה" or reuse 4.9% (gap 0.0116 is small, which is part of the honest point).

### 5.9-8 · nit · video: percent sign on the wrong side
- Frames `5-9-t079`, `t090`, `t101`: "ממוצע: %12.5 (להמחשה)" and "אפקטיבית %12.6825" (the "%" before the digits). "נומינלית 12%" on the same frame is right. Wrap the value in an LTR run (`ltr: true`).

### 5.9-9 · nit · an equality that holds only after rounding
- MDX 509: "5.0116 − 5 = 0.012" (printed). 0.0116 is the exact difference. AUTHORING: every printed equality holds on the printed numbers. Print 0.0116 or "בערך 0.012".
- Also "0.044 נקודות אחוז" (MDX 323) and 5.10 "0.06 נקודות אחוז": below one, "נקודת אחוז".

### 5.9-10 · nit · exercises and tone
- Exercise 7: correct option longest. Exercise 2 and 4 are one subtraction with both operands printed ("קל" is right); exercise 6 is a conceptual repeat of the prediction and the reveal.
- MDX 290: "ואם תמהיל גרוע מהסל בכל המדדים, זה כבר סימן ברור שכדאי לשאול" is advice, not a calculation; say "כדאי לשאול" without "סימן ברור".
- MDX 426: "החיסרון של ההמלצה: הצעה אחת משני בנקים" fine. "ואין הרבה מה להסיק מהממוצע" — the two-point shortfall of 9.81 ₪ against 7,400 is itself small; one sentence on how thin it is ("9.81 ₪ בחודש") would show that the goal verdict is fragile.

---

## 5.10 — האם התמהיל ריאלי?

The "not composing an offer from the best rate at each bank" lesson is clear, the four reasons are labelled (general knowledge / FK / Mogi design / 451 transcription), and the "ריאלי is necessary, not sufficient" line is right. What is left:

### 5.10-1 · should-fix · "כשהוא חוצה קו, בנק לא יאשר אותו בכלל" contradicts the lesson
- **Where:** MDX 538 (five questions: "איך זה משפיע עליכם").
- **Problem:** the lesson says crossing 40% is allowed and only crossing a ban (four lines) stops a mix; the next sentence in the summary says "מעל קו ההון מותר".
- **Fix:** "כשהוא חוצה איסור, בנק לא יאשר אותו".

### 5.10-2 · should-fix · "זה אחד הכללים שיועצים חוזרים עליו" is an unlabelled practice claim
- **Where:** MDX 214. The map says the rule's source is "329, שטח". No FK id in Sources supports "advisors repeat it".
- **Fix:** "לפי הידע מהשטח (ממתין לאישור אילון)" with its FK id, or drop the sentence.

### 5.10-3 · should-fix · the one-agora note is not at the point of confusion
- **Where:** MDX 188 and 375 (6,587.06) against the table of MDX 253 and the video (6,587.07 first payment of the combination); the callout is at MDX 192, before the combination exists.
- **Check:** `h.first` = 6,587.07 (sum of three rounded payments), `h.pay` = 6,587.06 (sum of the three unrounded payments, rounded once). The callout's direction is right ("גבוה באגורה"). For offer A the two are equal (6,661.71), so the learner meets the discrepancy only for the combination.
- **Fix:** in step 2 (MDX 375): "(לא 6,587.07 מהטבלה: ביחס מעגלים פעם אחת, ראו ״אגורה אחת״)".

### 5.10-4 · should-fix · negative gaps rendered with the sign on the wrong side
- **Where:** MDX 379 (step 4: "−0.197, 0.022, −0.06"); see X-1.

### 5.10-5 · should-fix · case A appears as "תיק א׳" with no link to נועם ושירה
- **Where:** presets in MDX 80–88 (label "תיק א׳: תמהיל הפתיחה") and task 4 (MDX 289, 297); the body never says who it is.
- **Fix:** "תיק א׳ (נועם ושירה): תמהיל הפתיחה", and one sentence in task 4 that its rates are the course's assumption (the checker note says it; the task does not).

### 5.10-6 · nit · small items
- MDX 266: "ו־12 בהלוואה בלי שעבוד חדש" is missing "יום"; "ריבעון" (266, 572) against "רבעון" in 5.9 (MDX 302).
- MDX 180: "מסלול קבוע, גם צמוד, נספר כקבוע" is labelled "הנוסח המדויק לא נבדק"; fine, but MDX 324 states it again without the label.
- Exercises 3 and 7 ("בינוני", "מאתגר") repeat the worked lines of MDX 188 and 190 with the same numbers (6,661.71 ÷ 16,000; 261.71); relabel "קל" or change the numbers.
- Exercise 5 introduces "בנק ג׳" with 3.6% — fine; but "ריבית שבנק אחר הציע" in task 3 uses the same 3.6, which is below A's 3.95 and B's 4.1: say it is an invented rate.
- The five-checks table (MDX 124) says "ארבעת האיסורים" while the next heading says "חמשת הקווים": correct (four bans plus a capital line) but say it in one clause.
- The summary line "ארבעה איסורים וקו הון" is the cleanest form; use it in the table too.
- MDX 555: "ואחריה, בשלב 6, איך מביאים את התיק לבנק במצב הכי חזק" matches stage 6's goal; fine.

---

## Cross-lesson items

**What agrees, and needs nothing:**
- case A's numbers across 5.6–5.10 and with stages 3/4 (see "Case A");
- the three goals are Mogi's design, not a market fact, in 5.6 (callout, Sources), 5.8 (callout), 5.9 and the card; FK-H-059, FK-H-061, FK-H-057 are labelled "ממתין לאישור אילון" and FK-H-061 is not used;
- no bank behaviour is invented: "איך בנק מתמחר — לא ידוע" is in every lesson, and the 40% line is named as a capital line whose directive is open (329 or 203) in 5.10's Sources;
- the same one-third-fixed, 50%, 75%, 30-year lines as 4.4; the scenario definitions are the same in 5.6, 5.7 and 5.8 (and different, by design, from 5.9's, which is said);
- the "בשיעור הבא" lines match the map titles for 5.7, 5.8 and 5.9; 5.10 leads to the stage check;
- exercises' `errors` catch the right slips (checked 32.62 against the near-correct 32.57: the component tests known mistakes before "near", so it works).

### X-1 · should-fix · negative numbers shown with the sign on the wrong side (bidi)
- **Probe:** I loaded each page at 390 and 1280, hydrated every island, opened all solutions, and compared the on-screen position of each "−" with the digit after it.
- **Wrong side (minus to the right of the digits, where a Hebrew reader sees "0.06−"):**
  - 5.7, the script under the video, cues 7 and 8 (`5-7.he.vtt`: "ההחזר הראשון −19.49 ₪", "מהפריים למשתנה: −48.30 ₪");
  - 5.9, `<Solution for="5.9-3">` (MDX 509): "קיבלתם −0.1";
  - 5.10, MDX 379: "−0.197, 0.022, −0.06 נקודות אחוז" (both negatives).
- **Right (isolated):** every `delta()` use in 5.7, 5.8's tables, the MixJudge cells, all video frames (I zoomed `5-7-t056`: "−19.49 ₪" correct).
- **Cause:** `pts()` returns a bare "−1.23" in running text; the VTT cues have no isolate.
- **Fix:** wrap in `<M>` or `eq()` as `delta()` does; in the VTT use `‎−19.49 ₪` after an LRM, or write the cue without a sign ("נמוך ב־19.49 ₪").

### X-2 · should-fix · internal names in learner text (stage 4's X-2 and X-8 again)
"Brain", "J-090", "J-100" in the body: 5.6 (56, 88), 5.8 (62), 5.9 (232, 265, 283, 298), 5.10 (196, 265, 568-570). Repo paths shown in Sources: `scripts/case_sketch.py`, `src/data/case-a-mix.ts`, `research/notes/*.md` (5.6, 5.8, 5.9, 5.10). Linear "ENG-223" is in 5.6's Sources (536). Move to the closing comment; write "תכנון של Mogi" and "מחקר של צוות Mogi".

### X-3 · should-fix · the big-picture cards against the final lessons (`stage-5.ts`)
Checked the 18 cards and 43 links; all link endpoints exist (stage 0–4 ids), no duplicate ids, the file is registered in `index.ts`, and **no card states a number** except the transcription version and its date ("גרסה 22 (19.7.2023)", the 2026-10-08 research date), which are provenance. Inconsistencies with the final text:
1. **`uniform_baskets` role** (the cards: "הם המספרים היחידים שאפשר להשוות באמת בין בנקים"). 5.2 says the baskets are what is easiest to compare; 5.3 and 5.9 say any two offers on the **same** mix, amount, month and forecast can be compared. "היחידים" is too strong. Say "הדרך הקלה ביותר להשוות".
2. **`three_goals` role** ("אין תמהיל אחד שמנצח בשלושתם"). 5.6's reveal says this holds for its set, "לא חוק טבע". Say "בקבוצה של שיעור 5.6 אין תמהיל שמנצח בשלושתם".
3. **`comparison_basis`** lists four conditions including "אותו תמהיל"; `good_mix` lists five (amount, term, date, scenario, rate method) without it; 5.9's basket yardstick drops "אותו תמהיל" (see 5.9-2). The card note says "וחוזר בשיעורים 5.9 ו־5.10": the list is not the same list. Align after 5.9-2.
4. **Header comment** says "Lesson 5.8, the workshop, adds links only", but the file has no 5.8 links. Either add one (for example `three_goals` → a debt-balance node or `exposure`), or fix the comment. A learner finishing 5.8 gets nothing new on the map.
5. **`REGIONS` text in `index.ts`** (shared): "השוק: יתמלא בשלבים 0 ו־4" and the map's table (course-map section 5) do not list stage 5, but stage 5 adds five nodes to the market region. Update both when the coordinator edits.
6. **`estimate` card**: "ב־Mogi מחשב אותו אלגוריתם" — 5.5 says only that a language model does not compute it and that the method "לא ידועה לנו עדיין". Say "לא מודל שפה", drop "אלגוריתם מחשב".
7. Cards 5.1–5.5 (`directive_451`, `pre_approval`, `expected_total_rate`, `forward_rate`, `future_anchor`, `forecast_451`, `boi_average`, `equator`, `personal_offer`, `executed_deal`) agree with the final text of those lessons as far as I read them; the 4.4/4.5 caveat (329 or 203 for the 40% line) is in 5.10's Sources but not on the `realistic_mix` or `directive_329` card.

### X-4 · nit · letters and notation
- 5.6 uses `C_k`, `n`, `max`; 5.10 uses `P` and `P_1`, `P_2` (subscripts are numbers, allowed); 5.9 uses `e` and `m` as in 0.4. No table letter is reused for another meaning. Good.
- 5.7's "רגישות = (…) ÷ גודל הצעד" is in words (no letter), fine.

### X-5 · nit · Sources and the Eylon list
- 5.6–5.10 ask the same open questions (how a bank prices a mix; ratio above 40%; whether the BoI average is nominal or effective; the three typical mixes; how a mix change moves rates). The coordinator should check that `research/eylon-5-C.md` and `eylon-5-D.md` hold FK-H-057, 061, 059, 054, 072, 011, 012 and the BIR_MRTG_99 question.
- Source kinds are used correctly (no "עובדה מאומתת"; 329, 451, J-090/J-100 are "לא אומת", "החלטה של Mogi" or "מחקר / הצעה"). The one-line "בדיקת חישוב: נבדקו פעמיים בשתי שיטות" is dated 2026-10-16 and is true for all five (it matched my third method).

### X-6 · nit · "Mogi decision" rows without who
- 5.8 MDX 136 and Sources 622: "(החלטה של Mogi, אילון, 2026-08-03)"; 5.6, 5.7, 5.8 DEC-3 rows say "אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08" — fine, but "DEC-1/DEC-3" labels appear in learner Sources (see X-2).

---

## Count

2 blocker, 24 should-fix, 28 nit.

**The most important items, in the order I would fix them:**
1. **5.8-1:** "בתרחיש מחמיר ההפרש גדל" is false: 304,727.51 shrinks to 50,769.46.
2. **5.8-2:** the term example's first payment is 126.72 ₪ **lower**; the video cue and the page print "+".
3. **X-1:** negative numbers with the sign on the wrong side in the 5.7 video script, 5.9's solution and 5.10 step 4.
4. **5.9-1:** MixJudge renders "עד 6,700.00 ₪", "נשארו 38.29 ₪", "עודף 9.81 ₪" in the wrong order.
5. **5.9-2 and X-3(3):** 5.9's basket yardstick compares different mixes, which 5.3 and the `comparison_basis` card say is not a price comparison; the measures and the name of the maximum also differ from 5.3 without a word.
6. **5.10-1:** "כשהוא חוצה קו, בנק לא יאשר" against "מעל 40% מותר".
7. **5.7-1 and 5.7-2:** "בשליטתם … ולא דורש הסכמה של בנק" and "הפריים מיד", both against the lesson's own caveats.
8. **5.9-3:** Hila and Yuval in the feminine plural; "הילה" reused for a third person.
9. **X-2:** "Brain", "J-090", file paths, "DEC-n" in learner text.
10. **X-3:** the cards `uniform_baskets` ("היחידים") and `three_goals` are stronger than the lessons; the 5.8 links the header promises are missing.
11. **Phone:** the 15 reading tables listed above, including the seven-mix table of 5.6 and the 5.8 final table (the learner's product).
