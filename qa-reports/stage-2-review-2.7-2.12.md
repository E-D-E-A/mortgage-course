# Stage 2 beginner review: lessons 2.7–2.12

Date: 2026-10-10

QA review of lessons 2.7–2.12, read as a beginner who has finished stages 0–1 and lessons 2.1–2.6 (skimmed). I edited no file except this report.

**What I read**
- The built text in `dist/lessons/2-7/` … `2-12/`. The build was from 2026-10-09 16:57, after the last MDX change at 16:55, so I did not rebuild. The build was refreshed at 2026-10-10 09:21 while I worked. I re-extracted every lesson: the only visible change in 2.7–2.12 is 2.12's footer, which now leads to the stage-2 check instead of "השיעור הבא (בכתיבה) 3.1".
- The MDX files `src/pages/lessons/2-7.mdx` … `2-12.mdx`; line numbers below are MDX lines.
- The data files `data/lessons/2-7.json` … `2-12.json`.
- The subtitles `public/video/2-9.he.vtt` and `2-11.he.vtt`.
- The phone screenshots `qa/screens/phone_lessons_2-7_.png` … `2-12_.png` (taken 16:58), cut into 900px strips.
- The map data `src/components/big-picture/stage-2.ts`, the glossary (`src/data/glossary.json`), `course/AUTHORING.md`, `course/course-map.md` (stage 2), `research/eylon-list.md`, `research/field-knowledge.md`, and the stage-1 reviews.
- `pnpm check:terms` passes.

Items: severity (**חוסם** / **חשוב** / **קטן**), the exact quote and where it is, the problem, and the fix.

---

## Lesson 2.7: משתנה צמודה ולא צמודה

**Spot checks that passed.** I recomputed every amount in plain Python `Decimal`: 3,217.48 ₪ (500,000 ₪, 4.7%, 240 months), 415,022.58 ₪ after 60 payments, 3,435.29 ₪ on 180 months at 5.7%, 1,625.51 / 1,971.36 ₪ of monthly interest; the worked example 2,268.98, 352,602.15, 2,465.51 and 2,081.37 ₪; the linked path 2,840.66 / 2,892.70 / 3,131.15 ₪ (2,835.98 ₪ × 1.02 to the power months÷12) and 3,245.92 ₪ at month 61 (I get 3,245.91 ₪ when I round the indexed balance first; within the stated tolerance). The update-point counts (3, 7, 4; 22 months; 20 months) and the spreadsheet formula `=CEILING(A1/B1,1)-1` agree with the "take the whole part, minus one if exact" rule for 20÷5, 20÷2.5, 25÷5 and 25÷7. The market line 1.81 + 1.45 = 3.26 adds up. No bank names; the survey is dated and marked (לא אומת). The comparison table and the timeline fit at 390px.

1. **חשוב.** The linked example, lines 109–113: "התשלום הראשון (אחרי חודש של מדד): 2,840.66 ₪ … בסוף השנה הראשונה: 2,892.70 ₪". Both numbers appear from nowhere.
   - The original-schedule payment they are built from (2,835.98 ₪) is never shown, so the learner cannot redo 2.5's step "התשלום מהלוח המקורי × המדד ÷ מדד הבסיס".
   - "אחרי חודש של מדד" relies on an assumption the page never states: the index rises evenly *inside* the year (2% a year → the twelfth root each month). It is only in the sources ("המדד עולה באופן אחיד בתוך השנה"). 2.5 only ever multiplied by 102 ÷ 100 at year end.
   - Month 61 has the same jump: "התשלום מחושב מחדש על היתרה הצמודה" — the indexed balance (about 445,608 ₪) is not shown, so the learner cannot tell how much of the 114.77 ₪ rise is the index and how much is the new rate.
   - Fix: add a line "בלוח המקורי, בלי מדד, התשלום 2,835.98 ₪ (מתוך fact)". Say "נניח שהמדד עולה באופן אחיד, 2% לשנה, ולכן קצת בכל חודש". Show the indexed balance at month 60 as a fact before month 61.

2. **חשוב.** Exercises (lines 312–424) test only "anchor + spread" (2, 5) and counting points (3, 4). Nothing practises what the lesson itself calls the point. Its callout "מה לקחת מזה" (line 279) says: "שואלים: מה יקרה לתשלום אם העוגן יעלה… ואיפה תחנות היציאה".
   - No exercise asks for a payment or a month's interest at an update point. `I = B × m` (line 215) is never practised.
   - No exercise touches the exit station. Common mistakes are left untested: "I can leave a variable track penalty-free any day", "a fixed track has exit stations too", "notice can be given on the day".
   - Missing too: the mistake the warning callout (line 95) names, "subtract today's anchor from my old rate to find my spread".
   - Fix: add a choice item on the exit station (one specific day; notice 10–45 days before; none in fixed). Add a numeric item: "היתרה בנקודת העדכון 300,000 ₪, אחוז הריבית החדש 5.4%. מה הריבית של החודש הבא?" (with a fact). Turn the spread mistake into an error message somewhere.

3. **קטן.** Difficulty labels. Exercise 6 is marked מאתגר (line 415). It is a recall item: the callout "״כל 5 שנים״ — של מה?" (line 116) and the table row "התשלום" give the answer word for word. Exercise 4 (בינוני), with its two traps, is the hardest item. Exercise 5 (בינוני) is the same operation as exercise 2 (קל).
   - Fix: exercise 6 → בינוני; exercise 4 → מאתגר and move it last. Or make 6 harder: ask what happens to the payment at month 61 against month 60, and why.

4. **קטן.** Prediction, correct option (line 34): "אחוז הריבית ייקבע מחדש רק בנקודת העדכון, אחרי 5 שנים". The question has just said "עברו שנתיים". "אחרי 5 שנים" reads as "5 years from now", which is exactly exercise 4's trap (counting from today). The reveal says "מיום ההלוואה", but the option does not.
   - Fix: "…בנקודת העדכון — 5 שנים מיום ההלוואה, כלומר בעוד 3 שנים — לפי העוגן של אותו יום".

5. **קטן.** Line 89: "זו תשואה מעל ההצמדה, ולכן בדרך כלל היא נמוכה יותר." Lower than what is not said.
   - Fix: "…ולכן בדרך כלל היא נמוכה מהתשואה של אג״ח לא צמודות".

6. **קטן.** Callout "מה לקחת מזה" (line 279): "במשתנה, התשלום של היום מובטח רק עד נקודת העדכון הראשונה." True only of the unlinked track. In משתנה צמודה the payment moves every month, as exercise 6 itself teaches.
   - Fix: "במשתנה לא צמודה, התשלום… במשתנה צמודה גם זה לא: הוא זז עם המדד בכל חודש."

7. **קטן.** Worked example step 5 (line 272): "אם העוגן עולה לנקודת אחוז מעל היום." Awkward and ambiguous Hebrew ("rises to one point" / "above today").
   - Fix: "אם העוגן עולה בנקודת אחוז אחת, מ־3.5% ל־4.5%". Same for step 6: "יורד בנקודת אחוז אחת, ל־2.5%".

---

## Lesson 2.8: מסלולי זכאות ומסלולים מיוחדים

**Spot checks that passed.** Every number matches `data/lessons/2-8.json` and adds up by hand: the capped rate (3.2 → 2.7, 4 → 3, 3.4 → 2.9, 3.8 → 3), the capped discount (240,000 / 300,000 ₪; the half-table rows 200,000 / 300,000 / 300,000 ₪), the FX lines (100,000 $; 390,000 / 360,000 ₪; exercise 6: 444,000 ₪, the inverse error 518,918.92 ₪), and the worked example (1,200,000 ₪, 75%, 10%, 1,320,000 ₪ = 82.5%). Every official rule is marked (לא אומת) with the date it was read, and the 2023 amounts say 2023. The two bank questionnaires are "בנק אחד" / "בנק אחר". The Mogi decision E50 is marked "ממתין לאישור אילון" and is on `research/eylon-list.md`.

1. **חשוב.** The eligibility-rate rule (line 105): "הוא 0.5 נקודת אחוז מתחת לממוצע הריביות על משכנתאות צמודות, שבנק ישראל מפרסם כל חודש". It contradicts what 2.4 just taught, and the lesson does not say so.
   - 2.4's four-corner table puts "ממוצע הריביות שבנק ישראל מפרסם על משכנתאות צמודות" in the **effective** row. Contract rates sit in the "כתובה בחוזה, מחלקים ב־12" row.
   - Here an effective average minus half a point becomes a contract rate, and the worked example and exercises 2–3 treat it as one.
   - The learner 2.4 trained to ask "באיזה מובן?" is left without an answer.
   - Fix: one sentence after the rule: "שימו לב: לפי שיעור 2.4, הממוצע שבנק ישראל מפרסם הוא ריבית אפקטיבית. איך בדיוק הכלל מתרגם אותו לאחוז שבחוזה — לא בדקנו (לא אומת). בתרגילים נעבוד עם הכלל כפי שהוא כתוב." Put the same question on the open-questions list.

2. **קטן.** Worked example steps 1 and 2 (lines 220, 222): "…× 100 = {worked.ltv}</M>%" and "…= {worked.share}</M>%". The % sign sits outside the `<M>` isolate.
   - On the phone (strip 2 of `phone_lessons_2-8_.png`) it lands at the far left of the equation: ".%1,200,000 ÷ 1,600,000 × 100 = 75" and ".%120,000 ÷ 1,200,000 × 100 = 10".
   - It reads as "1,200,000%". No other lesson in 2.7–2.12 does this; they put the % inside `<M>`.
   - Fix: move the % inside the isolate: `= {f.plain("worked.ltv")}%</M>`.

3. **קטן.** Line 103: "המימון נשאר בתוך התקרה של 75%". It is presented as *the* cap. 1.2 and 1.5 taught that the cap depends on the kind of purchase (single home, replacement, additional).
   - Fix: "…בתוך התקרה של 75% לדירה יחידה (שיעור 1.5)". The worked couple fits: eligibility is mainly for people without a home.

4. **קטן.** The four-column table (lines 76–93, `min-w-[34rem]`) on the phone: the column that answers the lesson's question, "מה יכול לזוז", is off screen. "מי קובע את התנאים" is cut ("כללים של המ…", "תוכנית ממשלתי…").
   - Fix: put "מה יכול לזוז" second, right after "השם". Or drop "מסלול במשכנתא?" into the name cell ("מחיר מטרה (לא מסלול)").

5. **קטן.** Exercise 4's error (line 324): "הורדתם את התקרה, 300,000 ₪. אבל 20% מהמחיר יוצאים פחות מהתקרה, ולכן ההנחה היא 20%." "ההנחה היא 20%" answers in percent a question asked in shekels.
   - Fix: "…ולכן ההנחה היא 20% מהמחיר: 270,000 ₪" (from `ex4.discount`).

---

## Lesson 2.9: שפיצר וקרן שווה: האינטואיציה

**Spot checks that passed.** I rebuilt every amortization table in plain Python `Decimal`, with the course's statement convention (each month's interest rounded to the agora, the Spitzer payment rounded once, the last month closing the rest). All match `data/lessons/2-9.json` to the agora:
- 60,000 ₪, 6%, 3 months: Spitzer 20,200.33 / 20,200.33 / 20,200.34 ₪, balances 40,099.67 and 20,099.84 ₪, interest 601.00 against 600.00 ₪.
- 600,000 ₪, 4.8%, 240 months: 3,893.74 against 4,900.00 ₪; last payments 3,895.68 and 2,510.00 ₪; interest 334,499.54 against 289,200.00 ₪; month-120 balances 370,513.81 and 300,000.00 ₪; the first cheaper equal-principal month is 102; 30 years: 3,147.99 ₪ and 533,278.18 ₪.
- 400,000 ₪, 5.4%, 180 months: 3,247.15 ₪, 184,486.00 against 162,900.00 ₪, 239,867.71 ₪ after 90 months.
- The exercises: 1,000 / 1,600 / 1,300 / 570.22 / 390.00 ₪, and 393.58 ₪ for the Spitzer error.

The subtitles say the same numbers as the page. 2.9 uses no stage-2 term from 2.1–2.8 (prerequisite 1.4 only): I searched the MDX, the subtitles and the scene for ריבית קבועה/משתנה, צמוד, פריים, עוגן, קל״צ, נקודת עדכון, זכאות, גרייס and בלון. Its only later terms (3.1, 2.10) are in `<Later>`. The difficulty order is honest. The "בשיעור הבא" line uses 2.10's exact title.

1. **קטן.** Line 213: "את הנוסחה שמוצאת אותו נבנה ב<Later lesson="3.1">שיעור 3.1</Later>". It renders as "נבנה בשיעור 3.1 (נגיע לזה בשיעור 3.1)", the same lesson twice.
   - Fix: plain text "נבנה בשיעור 3.1", or `quiet`.

2. **קטן.** Running-text amounts lose their second decimal. `nv()` and `n()` use `maximumFractionDigits: 2` with no minimum.
   - Examples: line 97 "0.5% × 40,099.67 = 200.5 ₪", line 142 "200.5 ₪ בשפיצר מול 200 ₪", and month 3 "הריבית 100.5 ₪".
   - The table right above shows the same amounts as 200.50 ₪ and 100.50 ₪. A beginner who is checking to the agora sees two formats for one number.
   - Fix: use `f.shekels`-style formatting for money in running text (two decimals when there are agorot), or `minimumFractionDigits: 2` when the value is not whole.

3. **קטן.** The formula box (line 199): `C<sub>k</sub> = P ÷ n + m × (P − (k − 1) × P ÷ n)` is set in `text-h3`. At 390px it wraps, and the closing "n)" sits alone on the second line (strip 3 of `phone_lessons_2-9_.png`).
   - Fix: a smaller size on phone (`text-body-l sm:text-h3`). Or two lines on purpose: "C<sub>k</sub> = P ÷ n" / "+ m × (P − (k − 1) × P ÷ n)".

4. **קטן.** Summary, line 399: "קרן שווה: … התשלום יורד, בכל חודש באותו סכום." The Spitzer bullet beside it carries the condition ("כל עוד אחוז הריבית לא זז ואין הצמדה"); this one does not. In a linked or variable track the equal-principal payment does not fall by a fixed amount.
   - Fix: "…בכל חודש באותו סכום — כל עוד אחוז הריבית לא זז ואין הצמדה."

---

## Lesson 2.10: גרייס, בלון ובולט

**Spot checks that passed.** I rebuilt every schedule (grace inside the term, Spitzer on what is left, interest rounded to the agora each month). All match the data to the agora:
- 100,000 ₪, 6%, 12 months, 3 months of grace: 8,606.64 / 11,390.74 / 11,562.45 ₪; last payments 8,606.69 / 11,390.72 / 11,562.47 ₪; totals 103,279.73 / 104,016.64 / 104,062.07 ₪; full-grace debt 101,507.51 ₪.
- Bullet: 100,500.00 ₪ and 106,167.79 ₪ (the formula 106,167.78 ₪ is correctly called "אגורה פחות").
- 600,000 ₪, 4.8%, 20 years, 12 months: 4,016.41 / 4,213.50 ₪, debt 629,442.14 ₪, interest 334,499.54 / 344,541.47 / 360,676.60 ₪; 36 months: 414,695.03 ₪.
- The worked example: 2,864.98 / 2,000 / 2,927.11 / 3,070.74 ₪; 359,496.80 / 367,005.29 / 384,372.51 ₪; 524,535.10 ₪.
- The half table: 250.00 / 251.25 / 252.51 ₪.

**"דחיית תשלום אינה הקטנת עלות" is shown with numbers.** The table's "שולם בסך הכול" row (736.91 ₪ and 782.34 ₪ more), the illustration cards, and the worked example (7,508.49 ₪ and 24,875.71 ₪ for 864.98 ₪ a month of relief) all show it. The text says what is bought ("קנייה של זמן") rather than just repeating the slogan.

**FK-H-053** is in the body as "(שיחה מ־2026-08-05; מקור יחיד; ידע מהשטח, ממתין לאישור אילון)" and in the sources, and is on `research/eylon-list.md` under 2.10. The 2025 circular is dated and marked (לא אומת; נכון ל־9 באוקטובר 2026). The quote from 1.3 is word for word. The "בשיעור הבא" line uses 2.11's exact title.

1. **חשוב.** Exercises 5 and 6 are answered on the page before the learner reaches them.
   - Exercise 6 (מאתגר, line 359) uses the same loan as the explanation: 100,000 ₪, 6%, 12 months, bullet. Its answer, 167.79 ₪, is printed in line 148: "ההפרש: 6,167.79 − 6,000 = 167.79 ₪". The hint even points back to it.
   - Exercise 5 (בינוני, line 341) asks for 26,177.06 ₪. That number is printed three times above it:
     - the illustration's own card "גרייס מלא מול בלי גרייס: 26,177.06 ₪ יותר ריבית" (visible in the phone screenshot);
     - expected observation 2;
     - the PredictionReveal note for option 1.
   - Neither item practises anything. Their labels claim more difficulty than they have.
   - Fix, exercise 6: new inputs as facts, for example 80,000 ₪ at 4.8% for 24 months.
   - Fix, exercise 5: ask for something the cards do not print. Examples: the extra interest with 24 months of grace, or how much more each month after full grace than after partial grace (4,213.50 − 4,016.41).

2. **קטן.** Line 151: "הלוואות בולט ובלון בעסקאות שבהן הקבלן מסבסד את הריבית". This is a new idea, not explained, in a lesson for beginners: who the contractor is, and what subsidising a rate means.
   - Fix: add half a sentence, "…עסקאות שבהן הקבלן שמוכר את הדירה משלם לבנק חלק מהריבית במקום הקונה". Or cut the clause and keep only "בנק ישראל מגביל חלק מההלוואות האלה (לא אומת)".

3. **קטן.** Line 141 presents בלון and בוליט as two names for one thing, each with a partial and a full kind ("מוגדרים שם יחד"). Common market usage often separates them: בוליט = interest paid monthly, בלון = nothing paid until the end. A learner may meet an offer that uses the words that way.
   - The lesson leans on one unverified summary of the directive.
   - Fix: add one sentence: "בשוק יש מי שמשתמש ב״בלון״ למלא וב״בוליט״ לחלקי; בכל הצעה בודקים מה כתוב בחוזה." Put the question on the open-questions list for Eylon.

---

## Lesson 2.11: אותה יתרת חוב: ריבית מול הצמדה, כל אחד בנפרד

**Spot checks that passed.** Every number matches the data and adds up by hand:
- 25,000 / 495,000 / 30,000 / 500,000 ₪; 510,000 / 15,300 / 300 / 495,300 / 485,000 / 10,300 ₪; 515,900 ₪ at a 6% index.
- The worked example: 294,000 ₪; 307,500 / 9,225 / 292,725 / 7,725 ₪.
- The half table to the agora: 1,941.20, 2,970.04, 93,971.24, 1,879.42, 2,875.52 and 90,726.18 ₪.
- Exercises 288,000 / 8,240 / 2,580 ₪, the 5,150 against 5,000 ₪ choice, and 1.94%.

**The yearly model and its assumptions are stated where the learner needs them:**
- line 69: one interest amount, one payment at year end, "בהלוואה אמיתית כל זה קורה בכל חודש";
- the callout that the real payment would be recomputed;
- "מתי הנוסחה נכונה?" with three conditions;
- the half-table note that a real linked payment rises with the index;
- the exercise preamble;
- the sources.

The subtitles match the page. The rule of thumb is labelled "קירוב, לא חישוב" and says when it gets worse. The "בשיעור הבא" line uses 2.12's exact title.

1. **חשוב.** Exercise 6 (מאתגר, line 381) asks: unlinked 5% against linked 3%, at what index rise are the balances equal? Answer 1.94%. This is exactly 2.3's "נקודת האיזון": the same 5% and 3%, the same 1.94%, with its own formula `π = (1 + i) ÷ (1 + r) − 1`.
   - A learner who remembers 2.3 types the number without working, so it is not מאתגר.
   - The solution (line 385) sends them to the wrong place: "זו הנוסחה של ריבית ריאלית משיעור 0.8". It never mentions 2.3, where they met this exact question.
   - Fix: use different rates (for example 4.6% against 2.8%, as facts). Change the solution's last lines to "זו נקודת האיזון משיעור 2.3: ‎π = (1 + i) ÷ (1 + r) − 1". Optionally note that the one-year balance model gives the same break-even as 2.3's one-payment loan, because the payment cancels out.

2. **קטן.** The second line of the formula box (line 174), `B = P + P × π + P × r + P × π × r − C` in `text-h3`, wraps at 390px. The final "C" sits alone on its own line (strip 2 of `phone_lessons_2-11_.png`). Same cause as 2.9 item 3.
   - Fix: a smaller size on phone, or break after "+ P × r" on purpose.

---

## Lesson 2.12: סיכום: טבלת המסלולים

**Spot checks that passed.**
- **Numbers.** 4,000 / 12,000 / 412,000 / 360 / 12,360 ₪, exercises 1,500 ₪ (errors 3,000 and 150 ₪) and 10,000 / 260,000 ₪ all match the data.
- **The two sorting exercises.** The ranks agree with the table rows.
- **The map's expected observations.** I traced them against `stage-0.ts`, `stage-1.ts` and `stage-2.ts`, and all three are right:
  - prime → BoI rate, anchor, prime track, debt balance;
  - inflation → the three linked tracks, plus the BoI rate and the debt balance;
  - spread → prime and the two variable tracks, plus the bank.
- **The rows for קבועה צמודה, פריים and the two variable tracks** match 2.5, 2.6 and 2.7 on what is fixed, what moves, when, the anchor and the contract checks.
- **The footer.** After the 09:21 rebuild it leads to `/checks/2/` ("סוף השלב · בדיקת הסיום של שלב 2"), and the summary ends with "ומכאן — בדיקת הסיום של שלב 2", as in 1.10.

1. **חשוב.** The eligibility row (lines 105–118) was written before 2.8 and still misses or contradicts what 2.8 teaches.
   - **"מה קבוע": "אחוז הריבית, לכל התקופה."** The point 2.8 builds its prediction, rule and exercises 2–3 on is that the rate is *set by a state rule and not negotiated* (half a point below the BoI average, capped). The row does not say so. The same row for קבועה צמודה reads identically, so the learner sees no difference between the two.
   - **"מה בודקים בחוזה": "בהלוואות שהמדינה מכוונת, לפי התעתיק בצוות — כלום."**
     - "הלוואות מכוונות" is jargon that no lesson used.
     - 2.8 attributes no-fee prepayment to the Knesset research summary and a government page, not to "התעתיק בצוות".
     - 2.8's own check list (worked step 5) is missing: the amount in the track is not above the certificate; the certificate is valid; the contract says fixed and linked.
     - So is 2.8's trap: the loan sits *inside* the mortgage and the financing cap, not on top.
   - **The map card** `track_eligibility` (stage-2.ts) has the same misattribution: "לפי התעתיק בצוות, הריבית בה קבועה והיא צמודה למדד". 2.8 sources that to the Knesset summary.
   - **Fix, "מה קבוע":** "אחוז הריבית, לכל התקופה — נקבע לפי כלל של המדינה, לא במשא ומתן (לא אומת)".
   - **Fix, "מה בודקים בחוזה":** "שהסכום במסלול לא עולה על מה שכתוב בתעודת הזכאות, ושהתעודה בתוקף; שהריבית קבועה והחוב צמוד; ומה עולה לפרוע לפני הזמן — לפי המקורות, כלום (לא אומת)". Add a "מה קורה לקרן" or risk note: "היא חלק מההלוואה, לא תוספת מעליה".
   - **Fix, the card:** "לפי מקורות שעוד לא אומתו".

2. **חשוב.** The half-solved "איזה מסלול נושא איזה סיכון?" (lines 141–147) has an ambiguous row.
   - **Row 3:** "הריבית לא זזה מאז שלקחתם את ההלוואה. ובכל זאת היתרה גבוהה ממה שהייתה לפני שנה." The only accepted answer is קבועה צמודה. A משתנה צמודה before its first update point fits just as well: 2.7's exercise 6 is exactly that case.
   - **Row 2:** "ההלוואה בת חמש שנים. הגיעה נקודת עדכון". "בת חמש שנים" reads as "a 5-year loan" as easily as "5 years old". 2.7 taught that a loan's last day is *not* an update point, so a careful reader may stall.
   - **Fix, row 3:** "הריבית נקבעה לכל התקופה ולא זזה. ובכל זאת…"
   - **Fix, row 2:** "עברו חמש שנים מיום ההלוואה, והגיעה נקודת עדכון…"

3. **קטן.** Row קבועה לא צמודה, "מה קורה לתשלום": "בשקלים של כוח קנייה הוא יורד". The house rule keeps "בשקלים של היום" (discounting) and "בכוח קנייה של היום" (inflation) apart, and 2.5 uses the latter.
   - Fix: "בכוח קנייה של היום הוא יורד כשהמחירים עולים".

4. **קטן.** The prime and variable rows state the course's assumption as fact. Prime "מה קורה לתשלום": "מחושב מחדש אחרי כל שינוי בפריים, על היתרה ולחודשים שנשארו". The variable tracks: "מחושב מחדש בכל נקודת עדכון".
   - 2.6 labelled this "הנחה של הקורס; בודקים בחוזה". 2.6 and 2.7 put "מה קורה לתשלום… האם הוא מחושב מחדש, והתקופה נשארת" on the contract checklist. The table's contract rows drop that check.
   - Fix: add "(הנחה של הקורס)" to those cells, and "מה קורה לתשלום כשהריבית זזה" to the prime and variable contract cells.

5. **קטן.** Risk sentences. קל״צ's risk includes "ויציאה מוקדמת עלולה לעלות הרבה". קבועה צמודה's risk does not, although its own contract cell and 2.5 say the same large cost applies to both fixed tracks.
   - Fix: add "…ויציאה מוקדמת עלולה לעלות הרבה" to קבועה צמודה's sentence, or drop it from both and leave it in the contract rows.

6. **קטן.** Line 163: "כל המספרים בשיעור הם מספרים להמחשה… חוץ משניים שמסומנים ״לא אומת״ עם התאריך." Only one number carries that label (1.5, "נכון ל־9 באוקטובר 2026, לא אומת"). The other, "למשל כל 5 שנים", is a Mogi decision, and its cell says "לפי החוזה".
   - Fix: "…חוץ מהתוספת של 1.5 נקודות לפריים (לא אומת, עם תאריך). ״כל 5 שנים״ הוא דוגמה; מה שקובע הוא החוזה."

7. **קטן.** The table has six tracks. 2.8 taught seven app types plus מט״ח; "אחר" and מט״ח vanish without a word.
   - Fix: one line under the table: "״אחר״ ומט״ח לא בטבלה: מה קבוע ומה זז בהם כתוב רק בחוזה (שיעור 2.8)."

---

## Cross-lesson items

**Checks that passed across the lessons.**
- **Spitzer and equal principal are described the same way everywhere.** 2.2 (yearly, with `<Later>`), 2.5–2.7 ("תשלומים חודשיים שווים (שפיצר)"), 2.9, 2.10 (Spitzer after the grace) and 2.12's קל״צ row ("בתשלומים שווים (שפיצר)") agree. So do the map cards ("כל עוד הריבית והמדד לא זזו"; "באותה ריבית ובאותה תקופה").
- **The "בשיעור הבא" titles.** Every one matches `course/course-map.md` word for word. 2.12 leads to the stage-2 check.
- **No real bank names** in 2.7–2.12, their subtitles or the stage-2 map.
- **Teaching numbers are labelled** above every exercise set. Real data carries a date and (לא אומת).
- **The big-picture map's stage-2 cards** match the lessons, except the eligibility card (2.12 item 1) and the item below.

1. **חשוב.** The "two forces" change meaning between 2.11 and 2.12.
   - 2.11 defines them as interest and indexation:
     - line 37: "נפריד בין שני הכוחות שפועלים עליו: הריבית, וההצמדה";
     - the video: "שני כוחות פועלים על אותו חוב. ריבית, והצמדה.";
     - the headings "כוח ראשון: הריבית".
   - In that sense, interest acts on *every* debt: step 1 adds 25,000 ₪ of interest to an unlinked loan.
   - 2.12 line 149 restates 2.11 as "שני כוחות פועלים על יתרת החוב: שינוי בריבית, והצמדה". It then teaches "קבועה לא צמודה, שאף כוח לא פועל עליה" (expected observation 3, the sort "אף כוח", exercise 1's feedback "שום כוח לא מזיז אותו").
   - 2.11 itself slides from one meaning to the other in its last callout (line 393: "לשינוי בריבית, להצמדה, לשניהם, או לאף אחד").
   - A learner who took 2.11 literally is told in 2.12 that interest does not act on the track where it was demonstrated first.
   - Fix, either:
     - 2.11: name the forces "שינוי בריבית" and "הצמדה" from the start, and present interest itself as the price that acts on every loan; or
     - 2.12 line 149, and the sort labels: "בשיעור 2.11 ראינו מה מזיז את יתרת החוב. ריבית פועלת על כל חוב; מה שמבדיל בין המסלולים הוא שני דברים שיכולים להשתנות: אחוז הריבית, והמדד." Then keep "כוחות" for those two only.
   - Either way, say it once in both lessons.

2. **חשוב.** "Cheaper" means "fewer shekels of interest", but the condition is never stated.
   - Where: 2.9 line 244 ("קרן שווה זולה יותר בסך הכול") and its summary; 2.10 ("גרייס לא מוריד את העלות"); the map card `equal_principal` ("בסך הכול משלמים פחות ריבית").
   - The learner did 0.5–0.6 (ערך הזמן של כסף, ערך נוכחי). At the loan's own rate, every one of these schedules is worth exactly the loan today. That is the very fact 2.9 uses to define the Spitzer payment ("סכום ההלוואה שווה לערך הנוכחי של התשלומים שלה").
   - 2.10 comes close ("קנייה של זמן, לא הנחה"). 2.9 states the comparison unconditionally. The house rules ask for "under which conditions a statement is true", and the map plans 3.11 for exactly this.
   - Fix: one sentence in 2.9 after step 6: "״זולה יותר״ כאן פירושו פחות שקלים של ריבית בסך הכול. בערך נוכחי, בריבית של ההלוואה עצמה, שני הלוחות שווים בדיוק לסכום ההלוואה — ההבדל הוא כמה זמן הכסף נשאר אצלכם. מדדים נוספים לעלות: <Later lesson="3.11">…</Later>." Mirror it in 2.10's "הכלל".

3. **חשוב.** One Mogi decision, three approval statuses. The calculation rules on Brain page 67436545 (DEC-3, and E50 for the eligibility loan) are marked differently:
   - **2.7** line 130 and its sources: "אילון אישר ב־2026-10-07", with no "ממתין".
   - **2.8** line 120: "(2026-10-07; ממתין לאישור אילון)". Its source says in one sentence "אילון אישר 2026-10-07, עדן קיבל 2026-10-08; E50 — ממתין לאישור אילון".
   - **2.10 and 2.12** sources: "אילון אישר ב־2026-10-07".
   - **`research/eylon-list.md`:** the rows DEC-3 and E50 have an empty "אילון" column.
   - A reader cannot tell whether the rule is confirmed.
   - Fix: decide which it is.
     - If Eylon's 2026-10-07 answers are the approval: fill the list's column and drop "ממתין" in 2.8.
     - If not: add "ממתין לאישור אילון" wherever 2.7, 2.10 and 2.12 cite the page.

4. **קטן.** The gender of הפריים. The house rules say feminine ("הפריים (היא זזה)"), and 2.1 follows it. These lessons do not:
   - 2.11: line 76 "הפריים עלה", line 294 "היום הפריים עלה", line 365 "והפריים עלה", and the 2.11 subtitle "הפריים עלה בנקודת אחוז";
   - 2.12: line 68 "כי הפריים הוא ריבית בנק ישראל", line 70 "ויורד כשהוא יורד";
   - the map link "הפריים זז איתה";
   - the 2.6 glossary entry ("הפריים זז").
   - Fix: feminine throughout ("הפריים עלתה", "כי הפריים היא", "ויורד כשהיא יורדת", "הפריים זזה איתה"), or change the house rule. Do not leave both.

5. **קטן.** Money in running text loses its trailing zero. `n()` / `nv()` use `maximumFractionDigits: 2` with no minimum.
   - 2.9: "200.5 ₪", "100.5 ₪" (see 2.9 item 2).
   - 2.10: worked example steps 4–5, "367,005.29 − 359,496.8 = 7,508.49" and "384,372.51 − 359,496.8".
   - The same amounts appear with agorot one line earlier ("359,496.80 ₪").
   - Fix: in all these lessons' `n`/`nv`, use `minimumFractionDigits: 2` whenever the value has agorot.
