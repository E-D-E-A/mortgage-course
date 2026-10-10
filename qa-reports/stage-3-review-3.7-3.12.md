# Stage 3 beginner review: lessons 3.7–3.12

Date: 2026-10-10

First-round QA of lessons 3.7–3.12. I read them as a beginner who finished stages 0–2 and lessons 3.1–3.6 (the Spitzer derivation, the principal/interest split, the balance at any month, equal principal/grace/bullet schedules, indexation along the timeline, rate resets). I edited no file except this report.

**What I read**
- The built text in `dist/lessons/3-7/` … `3-12/` (built 2026-10-10 11:20, after the last MDX change at 11:15). I extracted the text of each page and checked what the learner actually sees.
- The MDX files `src/pages/lessons/3-7.mdx` … `3-12.mdx`, including every exercise's `errors` and every FillTable config. Line numbers below are MDX lines.
- The data files `data/lessons/3-7.json` … `3-12.json` (all 457 facts).
- The components the lessons use: `MixBuilder`, `ForecastPaths`, `WhereMoneyGoes`, `OneRateSearch`, `ThreeMeasures`, `ScheduleByHand`, `SheetMatch`, and the stage-3 map data `src/components/big-picture/stage-3.ts`. I read them for their visible text only.
- The definitions `src/data/definitions/3-7.json` … `3-10.json`. 3.11 and 3.12 have none, and 3.7's file is `{}`.
- The subtitles `public/video/3-11.he.vtt`, and all 24 key frames `qa/video/3-11-t*.png`.
- The sheets `public/downloads/schedule-template.xlsx` and `schedule-solution.xlsx`. I opened copies with `openpyxl` and read every formula, number format and the instructions tab.
- The phone screenshots `qa/screens/phone_lessons_3-7_.png` … `3-12_.png` (taken 11:22), cut into 1,500px strips.
- `course/AUTHORING.md` (I checked every rule), `course/course-map.md` (stage 3, terms, illustrations, cases), `research/eylon-list.md`, `research/field-knowledge.md` (FK-H-059, FK-H-062, DEC-2, DEC-3), `research/notes/brain-calculation.md`, and the format of `qa-reports/stage-2-review-2.7-2.12.md`.
- `pnpm check:terms` passes.

**How I checked the math.** I recomputed every number independently in plain Python `Decimal` (precision 50), with my own code. That covers:
- Spitzer and equal principal;
- recalculation on the remaining balance at a rate change;
- linked tracks, with a monthly index factor equal to the twelfth root of (1 + yearly rise);
- mixes summed month by month;
- present value;
- the IRR by **Newton's method** (the course uses bisection), plus the six bisection steps the page shows;
- the statement convention (payment rounded once, each month's interest rounded, the last month closes the balance) and the sheet variants of 3.12.

Every displayed number, exercise answer and listed error matches the data to the agora, with three exceptions I list as items:
- 3.10's rounded table rows add to 30,000.01;
- 3.11's Spitzer row: 3 × 1,040.26 ≠ 3,120.79;
- 3.9's "3 אגורות" is typed, not a fact.

Items have an id, a severity (**must fix** / **should fix** / **nit**), the exact place, the problem and a concrete fix.

---

## Lesson 3.7: מתמהיל לתזרים אחד

**Spot checks that passed.**
- **The explanation.** The track payments are 1,574.00, 2,663.15 and 1,663.79 ₪. The mix pays 5,900.94 / 3,237.79 / 1,574.00 ₪, the drop is 2,663.15 ₪, and the flat total is 1,349,442.94 ₪.
- **The scenario.** The first payment is 5,903.69 ₪; month 12 is 5,934.22 ₪ and month 13 is 6,074.85 ₪. The prime track is recalculated to 2,800.98 ₪. The linked track pays 1,697.07 ₪ in month 12 and 2,110.09 ₪ in month 144. The maximum is 6,485.07 ₪ in month 144, then 3,687.57 ₪ from month 145. The total is 1,458,674.88 ₪, and the differences are 581.38 and 109,231.94 ₪.
- **The single-formula mistake.** Average rate 4.0167%, average term 248 months, payment 5,347.05 ₪, gap 553.89 ₪.
- **The builder tasks.** Long prime: 4,865.75 / 5,838.42 ₪ in month 240 / 1,592,619.11 ₪. Variable linked: 6,685.36 ₪ in month 144, and the 33.33% shares.
- **Lior.** 2,046.07 + 1,529.99 + 957.09 = 4,533.14 ₪; 1,578.54 / 4,581.70 ₪; 1,022.07 / 4,646.68 ₪; 3,068.14 ₪ and 2,046.07 ₪; total 1,138,772.18 ₪; shares 28.57 / 50 / 21.43%.
- **The exercises.** 3,525.75; 3,185.35 (errors 5,716.48 and 2,338.36); 31.25% (error 68.75); 4,363.26 (errors 3,850.09 and 2,338.36); 5,741.89 (error 5,716.48). All match.
- **The rules.** The single-formula trap is shown with numbers and named a mistake. DEC-2 is marked "החלטה של Mogi: אילון, 2026-08-03", and the 5-year reset is marked with who and when. "מספרים להמחשה, לא נתוני שוק" sits above the exercises. Case A appears only in "לא התיק של נועם ושירה". The FillTable fits 390px.

**3.7-1 · must fix · line 199, "מתי הנוסחה נכונה?" item 4**
- **Quote:** "התשלום הראשון והחשיפה נכונים בכל תרחיש."
- **Problem:** this is false for the lesson's own mix.
  - Line 122 says the first payment in the scenario is 5,903.69 ₪, "קצת יותר מ־5,900.94 ₪, כי כבר בחודש הראשון המסלול הצמוד זז חודש אחד עם המדד".
  - In task 4 the learner moves the index slider to 0% and watches the "התשלום הראשון" card change.
  - 3.5 taught the same thing: "התשלום הראשון מוצמד בחודש אחד של מדד".
  - A beginner meets the contradiction in the very next lesson, which is about exactly this distinction (see X-1).
- **Fix:** "החשיפה נכונה בכל תרחיש. התשלום הראשון — בכל תרחיש, כל עוד אין בתמהיל מסלול צמוד; במסלול צמוד גם הוא זז עם המדד של החודש הראשון. התשלום הגבוה ביותר וכל התשלומים יחד — רק לתרחיש שבו חישבתם אותם." Apply the same change to the sources' "הנחת חישוב".

**3.7-2 · should fix · worked example step 5 (line 248) and the callout "מה לקחת מזה" (line 253)**
- **Quote:** "הגבוה ביותר בתרחיש 4,646.68 ₪, בחודש 61"; "התשלום הגבוה ביותר של ליאור … בחודש 61".
- **Problem:** the mix pays exactly 4,646.68 ₪ in every month from 61 to 180. The variable track is recalculated at the same 5.6% in months 121 and 181, and I get 1,022.07 ₪ each time. The beginner reads "the maximum is a single month". The callout's reasoning ("לפני שאחד מהם נגמר") actually describes a plateau. Only the sources say "החודש הראשון שבו הוא מגיע". 3.8 handles this well ("החל מחודש 121").
- **Fix:** "הגבוה ביותר בתרחיש 4,646.68 ₪, מחודש 61 ועד חודש 180" (add a fact for the last month of the plateau). In the callout write "מחודש 61".

**3.7-3 · should fix · exercise 4 (lines 339–353)**
- **Problem:** `tolerance={0.01} near={0}` with the answer 31.25%. The question gives no number of decimals.
  - A learner who rounds to one decimal ("31.3") or to a whole number ("31") is told they are wrong.
  - The lesson itself showed "33.33 (בעיגול)" two sections earlier.
- **Fix:** add "(עד שתי ספרות אחרי הנקודה)" to the question, or set `tolerance={0.05}`.

**3.7-4 · nit · worked example step 2 (line 242)**
- **Quote:** "הפריים עלתה, ומסלול 2 מחושב מחדש: 1,578.54 ₪".
- **Problem:** the new rate (5%) is never stated, so the learner cannot redo the step.
- **Fix:** "הפריים עלתה בחצי נקודת אחוז, ומסלול 2 מחושב מחדש ב־5% על היתרה, ל־168 החודשים שנשארו: …".

**3.7-5 · nit · difficulty labels and missing errors**
- **Problem:**
  - Exercise 6 (מאתגר) means adding three numbers that are all given. It is easier than exercise 5 (מאתגר), which needs two Spitzer payments.
  - Exercise 5 has no error for "only the prime track" (2,024.90 ₪, fact `ex5.t2`).
- **Fix:** make exercise 6 בינוני. Add `{ value: f.raw("ex5.t2"), message: "זה רק מסלול הפריים…" }` to exercise 5.

**3.7-6 · nit · line 126**
- **Problem:** the sentence names lessons 3.8 and 3.9, yet both `<Later>` tags are loud. It renders "(החזר מרבי חזוי (נגיע לזה בשיעור 3.8), סך תשלומים (נגיע לזה בשיעור 3.9))", with nested brackets.
- **Fix:** use `quiet` on both.

**3.7-7 · nit · front matter**
- **Problem:** `minutes: 35`. The map says every lesson takes 15–30 minutes, and 3.1–3.6 are all 30.
- **Fix:** trim, or record why 3.7 is longer.

---

## Lesson 3.8: החזר ראשון, החזר בתנאים הנוכחיים, החזר מרבי חזוי

**Spot checks that passed.**
- **The explanation.** 3,828.36 / 3,957.11 / 4,030.31 / 4,010.87 ₪. The maximum is in month 121, 201.95 ₪ and 5.3% above the start; the highlight threshold is 4,211.20 ₪.
- **The other paths.** "Higher": 4,194.95 / 4,387.20 / 4,335.12 ₪, which is 356.89 ₪ over. "Lower": 3,677.11 / 3,591.42 ₪, so the maximum is the first payment. The slider case gives 4,216.80 ₪.
- **Galit and Oren.** 2,013.16 + 1,914.18 = 3,927.34 ₪, then 3,991.72 / 4,028.32 / 4,018.59 ₪. The maximum is 100.98 ₪ (2.6%) above the start, and 4,206.76 ₪ (178.44 ₪ more) on the high path.
- **The half table.** 4,620.60 / 4,791.95 / 2,754.57 / 2,728.14 ₪.
- **The exercises.**
  - 2,836.34 ₪ (errors 257.85 and 2,578.49).
  - 2,299.41 ₪ on a balance of 348,418.46 ₪ (errors 2,111.35, 2,338.36 and 2,036.82).
  - 4,319.04 ₪ (errors 4,347.44, 4,191.26 and 2,370.46).
  - 9.8% (exactly 9.837; the error 9.0%).
- **The distinction is kept.** "תחזית אינה הבטחה" says "לא תקרה" in the body, the callout, the reveal, exercise 4 and the summary. The "higher path" shows a real payment above the projected maximum.
- **Mogi decisions.** The 10% highlight is "בחירה של Mogi, לא כלל של בנק ישראל", and the decisions carry who and when.

**3.8-1 · must fix · what is "known" about the first payment**
- **Where:**
  - the callout "מה מובטח, ומה חזוי" (line 143): "מובטח … ולכן ההחזר הראשון";
  - the five questions (line 449): "הראשון וה״נוכחי״ מחושבים מהתנאים של היום";
  - the summary (line 460): "החזר ראשון — התשלום בחודש הראשון, לפי התנאים של היום";
  - the ForecastPaths card: "החזר ראשון … מחושב מהריבית של היום. בכל המסלולים — אותו מספר."
- **Problem:** every statement is written in general terms, but it holds only for an unlinked track.
  - In a linked track the first payment already contains one month of the index (3.5; 3.7's 5,903.69 against 5,900.94 ₪). So it is not known on the day of signing.
  - That case is exactly where "החזר ראשון" and "החזר בתנאים הנוכחיים" differ. The glossary defines the second one "בלי שינוי במדד".
  - The lesson never shows a single case where the two differ. It says only "במסלול הזה, בלי גרייס, הוא שווה להחזר הראשון". A beginner cannot tell why two names exist.
- **Fix:**
  1. Add one paragraph after "כשהריבית מתעדכנת": "מתי ההחזר הראשון וההחזר בתנאים הנוכחיים שונים? (א) במסלול צמוד: ההחזר בתנאים הנוכחיים הוא בלי שינוי במדד, וההחזר הראשון כבר כולל חודש אחד של מדד (שיעור 3.5) — בתמהיל של שיעור 3.7, 5,900.94 ₪ מול 5,903.69 ₪. (ב) בגרייס: ההחזר הראשון הוא רק ריבית או אפס (שיעור 3.4)." Take the numbers from facts.
  2. In the callout write "מובטח, במסלול לא צמוד: …", and add "במסלול צמוד גם ההחזר הראשון תלוי במדד של החודש הראשון".
  3. In the summary and the five questions write "לפי התנאים של היום, ובמסלול צמוד — עם המדד של החודש הראשון".

  See X-1 for the ForecastPaths wording.

**3.8-2 · should fix · two visible Hebrew errors**
- **Where:**
  - Line 81: `מתוך ה<Term …>עקומי התשואות</Term>` renders "מתוך **העקומי** התשואות שלו". A noun in construct form cannot take ה.
  - Line 154 (and the first source, line 477): "**ליד הוא** מוצגים ההחזר הראשון…".
- **Fix:** "מתוך <Term>עקומי התשואות</Term> שלו"; "לידו מוצגים…" (and "לידו" in the source).

**3.8-3 · should fix · line 159, "בבדיקת ההכנסה של הבנק"**
- **Quote:** "כשהבנק בודק … הוא משתמש בהחזר הראשון על כל הסכום … כך החליטה Mogi, לפי נספח א׳ בהוראה אחרת של בנק ישראל כפי שהצוות העתיק אותו (לא אומת)."
- **Problem:**
  - The Mogi decision has no "החלטה של Mogi" label, no who and no when. The house rules require all three.
  - The sentence mixes two claims: what a bank does (an unverified official rule) and what Mogi decided. The beginner cannot tell which is which.
  - In the sources the whole item has the kind `לא אומת`, including the decision.
- **Fix:** "לפי התעתיק בצוות של נספח א׳ בהוראה אחרת של בנק ישראל (לא אומת), כשהבנק בודק אם ההחזר מתאים להכנסה הוא משתמש בהחזר הראשון על כל הסכום — בהלוואה עם גרייס, בתשלום שאחרי הגרייס — ובלי ״זעזוע ריבית״ שרירותי. Mogi עושה אותו דבר (החלטה של Mogi: אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08)." Split the source into a `החלטה של Mogi` item and a `לא אומת` item.

**3.8-4 · should fix · worked example, "מה לקחת מזה" (line 283)**
- **Quote:** "חצי מהתמהיל בקבועה חוסם את חצי מהשינוי: כאן ההחזר המרבי החזוי רחוק מהראשון בפחות מאשר במסלול המשתנה לבדו."
- **Problem:** in shekels this is not true. Galit and Oren's variable track alone (300,000 ₪) rises by 100.98 ₪ (1,914.18 → 2,015.16). The mix rises by the same 100.98 ₪.
  - It is "less" only in percent (2.6% against 5.3%).
  - It is "half" only against the explanation's 600,000 ₪ fully variable loan (201.95 ₪).
  - A learner who checks the table finds the same shekel gap and is confused.
- **Fix:** "לעומת 600,000 ₪ שכולם במשתנה (בהסבר: 201.95 ₪ מעל הראשון), כאן העלייה החזויה היא 100.98 ₪ — חצי, כי רק חצי מהתמהיל זז. באחוזים: 2.6% במקום 5.3%." Use facts for every number.

**3.8-5 · nit · line 161**
- **Quote:** "כשהתחזית היא שהמדד עולה, בשפיצר התשלום עולה כל חודש, ולכן ההחזר המרבי החזוי יוצא בסוף."
- **Problem:** this is true for one fixed linked track. It is false for a mix: 3.7 showed the maximum in month 144, not in month 240 (exercise 7 there).
- **Fix:** "…במסלול קבועה צמודה לבדו, ההחזר המרבי החזוי יוצא בסוף. בתמהיל — לא בהכרח (שיעור 3.7, תרגיל 7)."

**3.8-6 · nit · line 150**
- **Quote:** "לפי התעתיק בצוות של הוראה 451 … (מאוגוסט 2026, לא אומת)".
- **Problem:** it reads as if the directive dates from August 2026. The source says version 22 was downloaded on 2026-08-03.
- **Fix:** "(לפי תעתיק מגרסה שהורדה ב־2026-08-03; לא אומת)".

**3.8-7 · nit · amounts in running text with ".00"**
- **Problem:** lines 291, 362 and 439 use `formatShekels` in prose: "200,000.00 ₪", "400,000.00 ₪", "500,000.00 ₪". The house rules say `f.shekels` in prose, and `formatShekels` only in tables.
- **Fix:** use `f.shekels` with `given` facts.

**3.8-8 · nit · summary and five questions**
- **Problem:**
  - The summary says "מדגישה החזר מרבי שגבוה ב־10% ומעלה" without saying 10% above what.
  - The five questions say "ההחזר הראשון … הוא גם מה שהבנק בודק מול ההכנסה", although the body says that with grace it is the payment after the grace period.
- **Fix:** "…ב־10% ומעלה מההחזר בתנאים הנוכחיים"; "…(ובהלוואה עם גרייס — התשלום שאחרי הגרייס)".

**3.8-9 · nit · glossary "תחזית" (`src/data/definitions/3-8.json`)**
- **Problem:** "(החלטה של Mogi, 2026-10-07/08)" has no who.
- **Fix:** "(החלטה של Mogi: אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08)".

---

## Lesson 3.9: סך תשלומים, ריבית, הצמדה ועמלות

**Spot checks that passed.**
- **Small and real loans.** 12,000 ₪: 1,032.80 ₪, 12,393.57 ₪ exact, 393.57 ₪. 600,000 ₪ over 20 years: 3,893.74 ₪, 934,498.76 ₪, 334,498.76 ₪ = 35.8%. Over 30 years: 3,147.99 ₪, 533,277.17 ₪ = 47.1%, with gaps of 745.75 and 198,778.41 ₪.
- **The linked track.** 3,333.08 → 4,944.62 ₪, 980,697.84 ₪ = 600,000 + 229,399.17 + 151,298.67. It is 46,199.08 ₪ above the unlinked loan. The fee is 0.11% of the interest, and the builder shares are 35.8 / 47.0 / 15.4%.
- **Naama.** 2,969.80 / 2,630.66 ₪; 712,752.20 / 789,196.56 ₪; 36.9 / 43.0%. The half table is 404,865.00 / 443,930.40 / 485,049.00 ₪.
- **The exercises.** 25,373.28 ₪; 533,276.40 ₪ (error 864,000 ₪); 90,894.38 ₪ (errors 194,069.45 and 490,894.38 ₪); 101,882.40 ₪ (exactly 101,882.63, accepted as near).
- **What counts in the total is stated plainly.** "בקורס, סך התשלומים הוא רק התשלומים החודשיים שבלוח. עמלות מציגים לידו". The formula box has "וכל מה שתשלמו = סך התשלומים + העמלות". The early-repayment fee is "לא חלק מלוח הסילוקין". This matches the Brain note: "total amount expected to be paid = sum of all forecast payments".
- **Sources.** The file-opening fee and the 2002 order are marked `לא אומת`, with dates in the sources.

**3.9-1 · must fix · callout "למה המכפלה והסכום נבדלים באגורות" (line 185), with lines 61–62**
- **Quote:** "…בלוח של בנק התשלום האחרון סוגר את ההבדל. בתרגילים שתי התשובות מתקבלות."
- **Problem:** this is false, and it contradicts 3.12.
  - A statement table (the course's own convention in 2.9, 3.2 and 3.12) does not reach the exact total.
  - For the same 12,000 ₪ loan, 3.9 says the total is 12,393.57 ₪. 3.12 (`hand.total_paid`) says the table gives 12,393.58 ₪.
  - For Naama's 25 years I get 789,195.11 ₪ by statement, against 789,196.56 ₪ exact and 789,198.00 ₪ by multiplication.
  - The last payment closes the *balance*, not the gap to the exact total.
  - Also, "כמה עשרות אגורות" understates the gap: it is 1.16 ₪ over 240 months and 1.44 ₪ for Naama.
  - Line 62's "3 אגורות" is a computed difference typed into the MDX. The house rules forbid arithmetic in MDX.
- **Fix:**
  - Callout: "הסכומים בשיעור הזה מחושבים בלי עיגול בדרך. בלוח של בנק — וגם בלוח שבניתם בשיעור 3.2 ותבנו בסדנה 3.12 — כל ריבית מעוגלת לאגורה, ולכן הסכום שם יכול לצאת שונה באגורות, ואפילו בשקל או שניים. ומכפלה של תשלום מעוגל יוצאת שונה שוב. כל שלושת המספרים נכונים, כל אחד לפי המוסכמה שלו; בתרגילים כולם מתקבלים."
  - Add a `difference` fact for the 0.03 ₪ in line 62.

  See X-2 for the whole chain.

**3.9-2 · should fix · line 84 (FK-H-062)**
- **Quote:** "…ושומרים שההחזר יישאר נמוך משכר הדירה **שהלקוח משלם היום** (ידע מהשטח: אילון, 2026-09-16; ממתין לאישור אילון)".
- **Problem:** FK-H-062 and this lesson's own source both say "נמוך משכר הדירה **הצפוי**". A field claim is reworded in a way that changes its meaning, and it goes to Eylon for approval in its original wording.
- **Fix:** "…נמוך משכר הדירה הצפוי". Add "(FK-H-062)" in the body only if the house wants ids there; the source already has it.

**3.9-3 · should fix · line 104 (linked against unlinked)**
- **Quote:** "…כשהמחירים עולים, שקל בעוד 20 שנה קונה פחות (שיעור 0.8). איך משווים כסף מזמנים שונים — בשני השיעורים הבאים."
- **Problem:**
  - The argument is about purchasing power ("בכוח קנייה", 0.8). The next two lessons compare by discounting at an interest rate ("בשקלים של היום", 0.6). The house rules ask the course never to mix the two.
  - Neither 3.10 nor 3.11 comes back to linked against unlinked. All their examples are unlinked. The beginner waits for an answer that never comes.
- **Fix:** "…כשהמחירים עולים, שקל בעוד 20 שנה קונה פחות (שיעור 0.8) — זו שאלה של כוח קנייה. בשני השיעורים הבאים נלמד להשוות כסף מזמנים שונים בעזרת ריבית; השוואה מלאה של צמוד מול לא צמוד — בשלב 5." Choose the stage-5 lesson from the map (5.4 or 5.6) and use `<Later>`.

**3.9-4 · nit · line 116**
- **Problem:** "עד כ־360 ₪, לפי אתר מידע ציבורי (מקור משני, לא אומת; שיעור 1.10)" has no date in the body. The house rule says live data carries its date in the text, and the source says August 2026.
- **Fix:** "…(מקור משני, נכון לאוגוסט 2026, לא אומת; שיעור 1.10)". Do the same in the summary bullet.

**3.9-5 · nit · builder task 1, expected observation (line 143)**
- **Problem:** the expected text says "העמלה — 0.04% בלבד", but `WhereMoneyGoes` shows "פחות מ־0.1%" for any share below 0.05% (see `shareText`). The learner cannot find "0.04%" on screen.
- **Fix:** "העמלה — פחות מעשירית האחוז (0.04%)".

**3.9-6 · nit · line 219**
- **Problem:** "נחשב את זה ב<Later lesson="3.11">שיעור 3.11</Later>" renders "בשיעור 3.11 (נגיע לזה בשיעור 3.11)".
- **Fix:** `quiet`.

**3.9-7 · nit · five questions (lines 358, 360)**
- **Problem:**
  - "לכן לפי התעתיק בצוות, בנק ישראל דורש…" presents a guess about the regulator's reason as a consequence.
  - "תקופה ארוכה, גרייס **ושפיצר** מורידים את ההחזר החודשי בהתחלה" does not say compared to what.
- **Fix:** "לפי התעתיק בצוות, בנק ישראל דורש שהאישור העקרוני יציג אותו (לא אומת)"; "…ושפיצר (לעומת קרן שווה)…".

---

## Lesson 3.10: ערך נוכחי ושיעור תשואה פנימי (IRR)

**Spot checks that passed.**
- **Present value.** 10,100.17 ₪ ×3 = 30,300.50 ₪. The present value is 30,000.00 / 30,059.70 / 29,940.50 ₪ at 0.5 / 0.4 / 0.6% a month.
- **Bisection.** All six steps match, including 29,558.48, 29,777.87, 29,667.84, 29,722.77, 29,695.28 and 29,709.02 ₪ and every verdict.
- **The IRR (by my Newton's method).** 1.007574% a month; ×12 = 12.09%; to the power 12 = 12.78%; 29,699.98 ₪ at 1.0076%. With no fee: 0.4% and 4.907%. The builder gives 4.92 / 5.03% with a 6,000 ₪ fee; equal principal gives 4.8%.
- **Shahar.** 0.400593%, 4.8071%, 4.9145% (against 4.907%). The half table is 3,014.97 / 2,970.42 / 2,926.52 = 8,911.91 ₪, with an IRR of 1.51%.
- **The exercises.** 18,000; 5.54% (error 5.40); 7.89% (errors 6, 8.18 and 0.66); 12.11% against 4.8071%. All match.
- **Two ways to a yearly rate.** The ×12 and power-12 conversions are named "the two ways from 0.4", and the effective one is linked to the official measure. The letter T is new and stays off the table, as the house rules require.

**3.10-1 · should fix · the present-value table and line 92**
- **Quote:** "ביחד: 30,000 ₪ — בדיוק סכום ההלוואה".
- **Problem:** the three rows printed right above are 10,049.92 + 9,999.92 + 9,950.17 = **30,000.01 ₪**. A beginner who adds them, as the house rules ask, gets an agora too much and doubts the whole idea. The house rules say a rounding callout appears "the moment two numbers could differ by an agora". The note on line 223 ("הלוחות מחושבים בלי עיגול בדרך") does not cover it.
- **Fix:** right after "ביחד", add: "(אם מחברים את שלוש השורות המעוגלות יוצא 30,000.01 ₪ — אגורה אחת של עיגול; בלי עיגול בדרך הסכום הוא 30,000 בדיוק.)" Use a `met_sum` fact for the rounded rows.

**3.10-2 · should fix · "נמשכה" / "נמשכת" (lines 146, 259)**
- **Quote:** "כל ההלוואה **נמשכה** שלושה חודשים בלבד"; "ובזמן שהיא **נמשכת**".
- **Problem:** AUTHORING lists "נמשכת" as ambiguous: it can mean "withdrawn" or "lasts". In a lesson about money received on day one, "ההלוואה נמשכה" reads as "the loan was drawn".
- **Fix:** "ההלוואה כולה הייתה לשלושה חודשים בלבד"; "…ובמספר החודשים שהיא פתוחה". See X-3.

**3.10-3 · should fix · line 259**
- **Quote:** "…מזיזה את ההלוואה של שחר רק **באלפיות האחוז**."
- **Problem:** 4.8% → 4.8071% is 0.0071 **percentage points**. The house rules require "נקודת אחוז" for a difference between rates.
- **Fix:** "…רק בפחות מעשירית של נקודת אחוז: מ־4.8% ל־4.8071%" (from facts).

**3.10-4 · nit · line 259**
- **Quote:** "לכן משווים הלוואות לפי העלות הממשית, ולא לפי אחוז הריבית ועמלה בנפרד."
- **Problem:** this reads as the course's advice. The next lesson teaches that the IRR is one measure among three and "לא אומר מה נכון למשפחה".
- **Fix:** "לכן בנק ישראל בחר מדד אחד שמכניס את העמלה: העלות הממשית (לפי התעתיק, לא אומת). למה הוא לא כל התמונה — בשיעור הבא."

**3.10-5 · nit · line 150 and the callout on line 223**
- **Problem:**
  - "לפי התעתיק בצוות של הוראה 451 (נגיע לזה בשיעור 5.1) של בנק ישראל (נספח 4; לא אומת)" stacks two parentheses on one noun.
  - The callout writes "10<sup>−12</sup> נקודות אחוז". The notation was taught in 3.1, but it is heavy for a side note.
- **Fix:** "לפי התעתיק בצוות של <Later quiet>הוראה 451</Later> של בנק ישראל, נספח 4 (לא אומת; נלמד אותה בשיעור 5.1)…"; "…עד שהטווח צר מאוד — פחות ממיליונית של מיליונית נקודת אחוז לחודש".

---

## Lesson 3.11: למה סך תשלומים, ערך נוכחי ו־IRR הם שלושה מדדים שונים

**Spot checks that passed.**
- **The explanation.** 3,375.43 / 4,222.22 ₪; 607,576.92 / 581,000.00 ₪ (26,576.92 ₪). The IRR is 6% for both (6.17% to the power 12).
- **Present values.** At 6% both are 400,000 ₪. At 3%: 488,780.34 / 478,210.06 ₪ (10,570.28 ₪). At 9%: 332,794.88 / 339,698.82 ₪ (6,903.94 ₪). The full-grace table: 628,715.56 ₪, 400,000 ₪ at 6%, IRR 6%.
- **The video series** (15 yearly payments and the 0–10% curves) matches.
- **Offers A and B.** 3,959.73 / 3,075.87 ₪; 950,336.26 / 1,107,311.84 ₪; 5 / 4.6% (5.12 / 4.70% effective). At 3%: 713,983.34 / 729,562.80 ₪. At 4%: 653,442.73 / 644,274.75 ₪. At 6%: 552,702.79 / 513,028.69 ₪. The crossover is at about 3.59%, so "A at 3%, B at 4%" is right.
- **The half table.** 3,120.79 / 3,120.00; 3,059.40 / 3,059.01; 2,942.50 / 2,942.87 ₪.
- **The rate choice for discounting is the lesson's centre, and it is handled well.** The loan's own rate gives the loan itself. "The rate your money could earn" is stated as an assumption to say aloud, with three alternatives (deposit, investment, an expensive debt). The total is shown to be present value at 0%.
- **The video** (2:47, 24 cues) says the same as the page. The frames are in the right direction, nothing is clipped, the bottom 150px are clear, and every number is right.
- **FK-H-059** is quoted word for word, with who, when and "ממתין לאישור אילון", and its id is in the sources.

**3.11-1 · should fix · exercises 3 and 5 are answered on the page**
- **Problem:**
  - Exercise 3 (בינוני) uses the same loan as line 95: 400,000 ₪, 6%, 15 years, 12 months of full grace, total 628,715.56 ₪. Line 95 prints the answer: "שווה בריבית הזו 400,000 ₪".
  - Exercise 5 (מאתגר) asks for offer B's present value at 6%. Worked example step 5 prints it: "ב׳: 513,028.69 ₪".
  - So the lesson's only two numeric exercises are look-ups.
- **Fix:**
  - Exercise 3: change the loan (another amount or grace length), or ask for the present value at 3%. The present value at the loan's rate is then the hint, not the answer.
  - Exercise 5: ask for offer A at 5%, or offer B at 3.5% (new facts), and keep the two errors.

**3.11-2 · should fix · line 128 and summary line 386**
- **Quote:** "IRR — … לא תלוי בכמה לוויתם ולכמה זמן."
- **Problem:** this contradicts 3.10, one lesson earlier. There, exercise 6 shows the same 4.8% loan with the same 360 ₪ fee giving an IRR of 4.8071% or 12.11%, depending only on size and term. The summary of 3.10 says so too ("הרבה בהלוואה קצרה וקטנה").
- **Fix:** "כשאין עמלות, ה־IRR לא תלוי בכמה לוויתם ולכמה זמן (עם עמלה ביום הראשון — כן, שיעור 3.10)." Apply the same to the summary.

**3.11-3 · should fix · line 104 and summary line 385**
- **Quote:** "…לכן הוא **תמיד** בוחר בלוח שמחזיר מהר"; "תמיד מעדיף את מי שמחזיר מהר וקצר".
- **Problem:** this is true only for schedules of the same loan at the same rate. Across offers it can fail: 600,000 ₪ at 5% for 20 years pays 950,336 ₪ in total, while the same amount at 2% for 25 years pays about 763,000 ₪. The total then picks the slower loan. The house rules say "under which conditions a statement is true".
- **Fix:** "…לכן, בין לוחות של אותה הלוואה ובאותו אחוז ריבית, הוא תמיד בוחר בלוח שמחזיר מהר." Apply the same to the summary.

**3.11-4 · should fix · phone layout of the summary table (lines 106–122)**
- **Problem:** the table has `min-w-[30rem]`. On the 390px phone screenshot only "השאלה" and "המדד" are visible, and the answer column "מה זול יותר" is off-screen. That column is the whole point of the table. The house rule is to keep the column the text talks about early.
- **Fix:** reorder the columns to "השאלה · מה זול יותר · המדד", or drop the min-width (three short columns fit 340px).

**3.11-5 · should fix · "נמשכת" (lines 224, 359)**
- **Quote:** "ב׳ נמוכה ב־883.86 ₪ בחודש — ונמשכת 30 שנה"; "ב׳ נמשכת 30 שנה במקום 20".
- **Problem:** the house rules list this word as ambiguous (see X-3).
- **Fix:** "…והיא ל־30 שנה במקום 20".

**3.11-6 · nit · wording**
- **Problem:**
  - Line 39: "בשלושת השיעורים הקודמים פגשנו … סך תשלומים, ערך נוכחי ו־IRR". 3.8 introduced none of them; present value comes from 0.6.
  - Line 95: "זו **ההבטחה** מהשיעורים 2.9 ו־2.10" uses a promise word for a mathematical fact.
  - Lines 129, 183 and the five questions say "בכסף של היום". The house term for a discounted value is "בשקלים של היום".
  - Line 128: "לכן בנק ישראל בחר בו" gives the regulator a motive and has no "לא אומת" in the body.
- **Fix:** "בשיעורים 3.9 ו־3.10 פגשנו…"; "זו העובדה מהשיעורים 0.6, 2.9 ו־2.10"; "בשקלים של היום"; "בנק ישראל קבע אותו כמדד להשוואה (לפי התעתיק בצוות, לא אומת)".

**3.11-7 · nit · the half table**
- **Problem:** the filled Spitzer row shows the total 3,120.79 ₪. A learner checking 3 × 1,040.26 gets 3,120.78 ₪, with no word of explanation. The rounding callout is far above.
- **Fix:** under the table, "(בשפיצר הסכום המדויק 3,120.79 ₪; פי 3 מהתשלום המעוגל יוצא אגורה פחות)". Or give the row as `met_times`, as 3.9 does.

---

## Lesson 3.12: סדנה: לוח סילוקין ביד ובגיליון

**Spot checks that passed.**
- **Itai's loan.**
  - Payment 1,032.80 ₪. Month 1: 60.00 / 972.80 / 11,027.20 ₪. Month 2: 55.14 (55.136) / 977.66 / 10,049.54 ₪. Month 3: 50.25 (50.2477) ₪.
  - The last payment is 1,032.78 ₪ (0.02 ₪ less), and the totals are 12,393.58 / 393.58 ₪.
  - All 27 named hand mistakes match my own computation: for example 720, 312.80, 11,687.20, 661.63, 10,656.03, 55.13, 9,066.9877.
  - The payment errors are 1,060, 1,000 and 1,431.32 ₪.
- **Tamar and Ido's loan.**
  - The exact payment is 3,247.1464 ₪, so the rounded 3,247.15 ₪ is "קצת גבוה מהמדויק", as the callout says.
  - By statement: last payment 3,246.15 ₪, totals 584,486.00 / 184,486.00 ₪.
  - Without ROUND: 184,486.36 ₪. Unrounded payment: 3,247.13 / 184,486.34 ₪. No last-month adjustment: 584,487.00 ₪, final balance −1.00 ₪.
  - Month 1: 1,800.00 / 1,447.15 ₪. Month 60 closes at 300,573.94 ₪ (the 3.3 formula gives 300,574.20, which the solution rightly calls "אגורות"). Year-1 interest is 21,163.66 ₪, and the naïve balance is 205,171.00 ₪.
- **The sheets.**
  - The template has the input B5–B7 with Itai's loan, empty B10/B11, formulas B13–B17, headers in row 19, and months 1–360 in A20:A379. It is set right to left and has an instructions tab.
  - The solution's formulas are the page's, each wrapped in an extra `IF(A>$B$7,"")`, which its instructions explain.
  - The cell addresses in the page and in `SheetMatch` (B11, B13, B14, B15) match the files.
- **The map**, `mapUpTo("3.12")`, shows the stage-3 nodes the text names.
- **The ending.** The lesson leads to the stage check, and there is no Case A.

**3.12-1 · should fix · "שלב" means two things on one page**
- **Where:**
  - "התוצר של שלב 3" means the course stage;
  - "שלושה שלבים: 1. ביד 2. בגיליון 3. מול המחשבון" and the Section kinds "שלב 1/2/3" mean the workshop parts;
  - the rounding callout (line 128): "ובהלוואה ארוכה אפילו בשקל **(נראה את זה בשלב 3)**";
  - line 102: "לשלבים 2–3";
  - line 254: "ההשוואה בשלב 3";
  - the ending: "בדיקת הסיום של שלב 3".
- **Problem:** a beginner reads "נראה את זה בשלב 3" as "later in this stage", which is already where they are.
- **Fix:** call the workshop parts "חלק 1 / חלק 2 / חלק 3" (in the Section kinds and the text), and keep "שלב 3" for the course stage.

**3.12-2 · should fix · the template, cells C10 and C11**
- **Problem:** the hint "כתבו כאן נוסחה (צעד 1)" / "(צעד 2)" sits in **column C**, next to the empty B10/B11. "כאן" points at C10 itself.
  - A beginner types `=B6/12` into C10.
  - Then the formula they type into B11, "=ROUND(-PMT(B10,B7,B5),2)", returns 0 or an error. The B17 check fails without saying why.
- **Fix:** change the text to "← כתבו את הנוסחה בתא B10 (צעד 1)" and "… בתא B11 (צעד 2)", or put a light fill on B10/B11. Change `scripts/build-sheets.py`, the owner of the sheets.

**3.12-3 · nit · the solution sheet has no cached values**
- **Problem:** every formula cell in `schedule-solution.xlsx` has no stored value (`openpyxl data_only` returns `None`). Excel and Google Sheets recalculate on open. Phone file previews, mail previews and Quick Look show an empty table, and the page sends phone readers to "לפתוח אחרי שניסיתם".
- **Fix:** save the solution once through LibreOffice in `--verify` (keeping the values), or set full calculation on load.

**3.12-4 · nit · formulas in running text wrap on the phone**
- **Problem:** step 2's `=ROUND(-PMT(B10,B7,B5),2)` breaks after "=ROUND(-" (the phone screenshot, around y = 5,600).
- **Fix:** add `inline-block whitespace-nowrap` to those `ltr` spans, as 3.7's "איך מחשבים" does.

**3.12-5 · nit · map task 3, expected observation (line 426)**
- **Quote:** "תזרים התמהיל, והאינפלציה — התחזית שלה מזיזה את המסלולים הצמודים."
- **Problem:** the map also has the link "עוגן → החזר מרבי חזוי: התחזית שלו מזיזה את המסלולים המשתנים". That was 3.8's main example.
- **Fix:** "…והאינפלציה והעוגן — התחזיות שלהם מזיזות את המסלולים הצמודים והמשתנים."

**3.12-6 · nit · numbering and wording**
- **Problem:**
  - Under "שישה תרגילים" the exercises are numbered 2–7, because exercise 1 sits in part 1.
  - Line 289: "בגיליון **שכמו הקורס**" is awkward Hebrew.
- **Fix:** "שישה תרגילים (2–7)"; "בגיליון שמעגל כמו הקורס".

**3.12-7 · nit · the stage goal**
- **Problem:** the map's stage-3 goal is "מחשב החזר, לוח סילוקין **ותמהיל** — ביד, בגיליון ובמחשבון". The workshop sheet is a single track, and only 3.7's callout describes a mix in a sheet.
- **Fix:** optionally add a "להרחבה" paragraph: copy the table to a second sheet tab for a second track, and add `=SUM` across the tracks month by month (3.7's rule). Or note in the map that the mix sheet comes in stage 5.

---

## Cross-lesson items

**Checks that passed across the lessons.**
- **Case A.** Noam and Shira appear only as "תרגיל נפרד, לא התיק של נועם ושירה" and "בשלב 5". No mix, track, offer or schedule of theirs appears, and none of their numbers do. The same holds for the components and the 3.11 video.
- **"בשיעור הבא"** uses the map's exact title in 3.7–3.11, and 3.12 leads to the stage-3 check.
- **Prime is feminine** wherever it means the rate ("הפריים עלתה", "לא זזה", "זזה"). "הפריים נגמר" means the prime *track*.
- **Percentage points.** "נקודת אחוז" is used correctly, except 3.10-3.
- **Labels.** "מספרים להמחשה, לא נתוני שוק" stands above every exercise set.
- **Mogi decisions** DEC-2 and DEC-3 carry who and when, except 3.8-3 and the 3.8 glossary item. FK-H-059 and FK-H-062 are marked "ממתין לאישור אילון", with the id in the sources, and both are on `research/eylon-list.md` under stage 3.
- **The three distinctions the stage must keep apart:**
  - **First / current terms / projected maximum.** The forecast-not-ceiling point is solid in 3.8, 3.12 and the map. The gap is the first payment in a linked track (X-1).
  - **Total / present value / IRR.** These are kept apart in 3.9–3.11, and 3.11's formula box ties them together well (r = 0, P known, r chosen).
  - **What counts in the total.** Payments only, with fees beside them. This is stated in 3.9 and kept in 3.10–3.12.
- **The rate for discounting** is the loan's own in 3.10 and "what your money could earn" in 3.11. It is said aloud as an assumption.

**X-1 · must fix · the first payment of a linked track: one fact, four claims**
- **The chain:**
  - **3.5** teaches that the first payment already carries a month of the index.
  - **3.7** shows it (5,903.69 against 5,900.94 ₪), then says the first payment holds in every scenario (3.7-1).
  - **3.8** calls the first payment "מובטח", "לפי התנאים של היום", and in ForecastPaths "בכל המסלולים — אותו מספר" (3.8-1).
  - **The glossary** defines "החזר בתנאים הנוכחיים" as "בלי שינוי במדד" and "החזר ראשון" as "בדרך כלל שווה". The map card `current_payment` says "המדד והפריים כפי שהם עכשיו".
- **Problem:** a learner who follows the chain cannot answer the stage's key question for a linked mix: is my first payment known today?
- **Fix:**
  - Apply 3.7-1 and 3.8-1.
  - In ForecastPaths, "בכל המסלולים" means "on every path". In this course "מסלול" is a loan track, so write "בתחזית ובמה שקרה בפועל — אותו מספר". (This is a component change; it goes to the coordinator.)
  - Keep the glossary's "בדרך כלל" and add "(חוץ ממסלול צמוד ומגרייס)".

**X-2 · must fix · two rounding conventions for the same loans, with no bridge between them**
- **The two conventions:**
  - **2.9, 3.2 and 3.12** use the statement convention (interest rounded each month), which AUTHORING sets for teaching tables.
  - **3.8–3.11** use exact schedules.
- **The same loan, different totals:**
  - 600,000 ₪, 4.8%, 20 years: interest 334,499.54 ₪ in 2.9, but 334,498.76 ₪ in 3.9.
  - The same loan over 30 years: 533,278.18 ₪ against 533,277.17 ₪.
  - 12,000 ₪, 6%, 12 months: total 12,393.57 ₪ in 3.9, but 12,393.58 ₪ in 3.12.
  - In 3.12, exercise 6 even presents the exact figure (184,486.36 ₪) as "a different convention from the course calculator". 3.9 called the same kind of figure the lesson's own.
  - 3.9's callout then claims the bank's last payment reconciles the two, which is false (3.9-1).
- **Fix:**
  1. In 3.9 (and in one line of the 3.10 and 3.11 rounding callouts), name both conventions: "בשיעורים 3.8–3.11 מחשבים בלי עיגול בדרך, כדי שהשוואות יהיו מדויקות; בלוח (שיעורים 2.9, 3.2, 3.12) כל ריבית מעוגלת. ההבדל — אגורות עד שקלים בודדים."
  2. Or switch 3.9's totals to the statement convention, so that 3.9 and 3.12 agree on Itai's loan.

**X-3 · should fix · "נמשכת" / "נמשכה"**
- **Where:** 3.10, lines 146 and 259; 3.11, lines 224 and 359.
- **Problem:** AUTHORING names this word as ambiguous: withdrawn, or lasting.
- **Fix:** "היא ל־N שנה" / "פתוחה N חודשים", as in 3.10-2 and 3.11-5.

**X-4 · nit · phone layout of reading tables**
- **The key column is off-screen:**
  - 3.8 "תחזית אינה הבטחה": "אם הריבית יורדת" (`min-w-[34rem]`);
  - 3.8 worked example: "משתנה (אחוז הריבית בתחזית)" (`min-w-[32rem]`);
  - 3.10 present-value table: "מחלקים ב־" is cut;
  - 3.10 bisection: "הטווח לפני הצעד" and the end of "המסקנה" are cut;
  - 3.11 is a should fix (3.11-4).
- **The FillTable in 3.8 shows the periods reversed:** "10–6", "15–11", "20–16". The same page's other tables show "6–10", because they wrap the period in `ltr`, and FillTable does not.
- **Fix:**
  - Put the column the text talks about second.
  - For FillTable periods, ask the coordinator to wrap the period cell in an `ltr` isolate (a shared-component change), or label the rows "שנים 6 עד 10".

**X-5 · nit · exercise wording without an actor**
- **Where:** 3.7 exercise 4 ("אותו תמהיל: 400,000 ₪…"), 3.8 exercises 5 and 6 ("מסלול משתנה של 500,000 ₪…"), 3.10 exercise 3 ("ה־IRR של הלוואה הוא…"), 3.11 exercise 5 ("הצעה ב׳…").
- **Problem:** AUTHORING asks for the actor and the verb.
- **Fix:** "לקחתם…", "יש לכם…".

**X-6 · nit · source "code" chips**
- **Problem:** in 3.7 (`תשלום התמהיל בחודש k = סכום C_k של המסלולים`), Hebrew words inside an LTR monospace chip come out in scrambled order on the phone. The chip also uses the unexplained `C_k` notation. 3.9's chip ends in the English "indexation".
- **Fix:** keep chips to symbols (`Σ Cₖ`), and write the words in the item's text.

**X-7 · nit · map and list consistency (for the coordinator)**
- **Videos.** Only 3.11 has a video. Map §0 and §7 say every regular lesson gets one, while stages 1–2 followed the table instead. Confirm the decision in the map.
- **Case A in the map.** Map §8 still lists "שלב 3: לוח סילוקין" in case A's path, but AUTHORING forbids it and the lessons rightly skip it. Update the map line to "שלב 5".
- **The Eylon list.** In `research/eylon-list.md`, the "איפה בקורס" cell of DEC-3 lacks 3.12 (its source cites Brain 67436545) and 3.8's income-check rule.
- **Names.** "ליאור" is two different invented clients (3.7, and 3.11's ליאור ומאיה). "נעמה" (3.9) is one letter from "נועם" in Case A. Rename one Lior, and choose a name further from Noam.

---

## Summary

| Lesson | must fix | should fix | nit |
|---|---|---|---|
| 3.7 | 1 | 2 | 4 |
| 3.8 | 1 | 3 | 5 |
| 3.9 | 1 | 2 | 4 |
| 3.10 | 0 | 3 | 2 |
| 3.11 | 0 | 5 | 2 |
| 3.12 | 0 | 2 | 5 |
| Cross | 2 | 1 | 4 |

**The math is sound.** I recomputed every displayed number, every exercise answer and every listed error in `Decimal`, with my own Spitzer, linked, mix, present-value and Newton-IRR code. All of them agree with the data. The only numeric faults:
- a rounded table that adds to 30,000.01 (3.10-1);
- an unexplained agora in 3.11's half table;
- a typed "3 אגורות" in 3.9;
- a false sentence about how a bank's table reconciles totals (3.9-1).

**What a beginner will trip on:**
1. **X-1.** Whether the first payment of a linked track is "known" or "guaranteed". 3.5 and 3.7 say it moves with the index; 3.7 and 3.8 then say it holds in every scenario. 3.8 never shows a case where "החזר ראשון" and "החזר בתנאים הנוכחיים" differ.
2. **X-2.** Two rounding conventions for the same loans, with no bridge between them. 3.9 and 3.12 give different totals for Itai's 12,000 ₪ loan.
3. **3.11.** The two numeric exercises are answered on the page (3.11-1). There are two over-broad "always / never" claims (3.11-2, 3.11-3), one of which contradicts 3.10. On the phone, the key column of the summary table is hidden (3.11-4).

**The rest is wording:**
- two visible Hebrew errors in 3.8;
- an unlabelled Mogi decision in 3.8;
- a misquoted FK-H-062 in 3.9;
- "נמשכת";
- "באלפיות האחוז";
- a misleading cell hint in the downloadable template.

The distinction between forecast and ceiling, and the distinction between total, present value and IRR, are taught clearly and kept consistent. Case A stays out of all six lessons.
