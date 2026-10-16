# QA report: lessons 5.1–5.5, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts and screenshots are outside the project (my own scratchpad folder).

**The reader:** someone who finished stages 0–4 (money, the mortgage world, tracks and rates, schedules and payments, present value and IRR, and the bank's view of income, obligations, payment ratio, Directive 329 and the three kinds of numbers) and has never read a pre-approval or compared offers from several banks.

**What I read:**
- the five MDX files `src/pages/lessons/5-{1..5}.mdx`, with every exercise `errors` list, FillTable and MatchTable config and `<Sources>` block;
- the built pages `dist/lessons/5-{1..5}/` (visible text and DOM), which are current;
- `public/video/5-{1..5}.he.vtt` and all 127 key frames `qa/video/5-{1..5}-t*.png` (5.1: 26, 5.2: 26, 5.3: 26, 5.4: 27, 5.5: 22, plus the scene sources `video/5-X.html` for on-screen text);
- `data/lessons/5-{1..5}.json` (every fact) and the definitions `src/data/definitions/5-{1..5}.json`;
- the components `PreApprovalDoc`, `UniformBaskets`, `OfferCompare`, `CurveForecast`, `WhichNumber`, and the data files `src/data/offer-examples.ts` and `src/data/curves.ts`;
- the calculation conventions in `src/lib/calc/offers.ts` and `schedule.ts` (statement rounding, index factor, payment reset on a rate change);
- the phone: my own Chromium at 390px, over every table of the five pages and a screenshot of each of the five components; plus the supplied `qa/screens/phone_lessons_5-*_.png` (only for the page width);
- `course/AUTHORING.md` (each rule checked), `course/stage-5-brief.md`, `course/course-map.md` (stage 5), `research/field-knowledge.md` (FK-H-027, 029, 030, 031, 032, 057), `research/eylon-list.md` (the stage-5 rows), and the earlier report `qa-reports/stage-4-review-4.1-4.5.md` (I follow its format);
- for cross-lesson checks: the definitions of 0.4, 0.8, 0.11, 0.12, 1.7, 3.8, and a grep of 5.6–5.10 for the same wording slips.

**Math check.** Everything below was recomputed independently in plain Python `Decimal`, in my own scripts that import nothing from the project: the schedules (rate ÷ 1200, interest rounded to the agora each month, the payment set in month 1 and again at every rate change on the balance left, linked tracks indexed and rounded each month, the last payment closing the balance), the IRR by bisection, the zero-curve forward rates, expected inflation by division, the yearly inflation list, effective rates, and the averages. I did not read the numbers by eye.
- 5.1: the three first payments and their sum (4,970.56); highest expected payment 5,807.89 (month 300); total 1,617,347.35; the cost of credit 5.22% on 899,640; gap 837.33 and 16.8% (and the 14.4% wrong answer); the prime path 4.45 / 4.65 / 4.85 / 4.95; 29 October (5 October plus 24 days); the exercises 15, 3 and 14 (24 − 9, 12 − 9, 24 − 10).
- 5.2: the nine uniform-basket results (first payment, highest payment, total, cost of credit) for the three banks, the three proposed baskets (4,970.56 / 5,846.43 / 5,124.59; 5.22 / 5.24 / 5.13), the lowest per basket, the splits (300,000 and 450,000; 400,000 and 600,000 for 1,200,000), the 33% error (297,000, a 3,000 gap, 396,000), and exercise 6 (207.04 and the wrong 445.20).
- 5.3: the base case (5.07 / 5.20 / 5.20), the five broken rows (forecast B 5.65; November 5.13; 600,000 loan; basket 2 5.51), the proposed baskets under forecast A and B (lowest rate, total and highest payment), the 3,000 ₪ fee (5.24), the gaps 127.71 and 19,615.32 and 63.16, exercise 5 (30.0% and 23.1%), the monthly IRR 0.41325 and the yearly 5.0733.
- 5.4: the curve points, the forward 4.4872 and the anchors 3.69 / 4.49 / 4.81 / 4.91 (real 1.65 / 2.20 / 2.43 / 2.50), spread 0.61, the four payments (2,487.62 / 2,623.40 / 2,662.19 / 2,668.63), the highest 2,668.92 (month 240), version B (5.49 / 5.31 / 5.41; highest 2,798.92 in month 61; gaps 130.00 and 24,230.00), the flat curve, the yearly inflation list (20 values), the cumulative 1.88 / 1.92 / 2.02 / 2.13 / 2.23, the subtraction error 0.0332 and the 0.96% index gap, the five track shapes (including prime's highest in month 205), the half table (0.31 spread, 1,951.28), and exercises 2–6 with every listed error (1,583.51 / 1,611.18 / 1,482.29 / 1,681.54 on a balance of 261,313.86).
- 5.5: the four effective rates (4.28 / 4.80 / 5.22 / 5.75, and 4.75), the two profile averages (4.47 and 4.83, gap 0.36, six of ten below), the simple and weighted averages (4.80 / 4.57 and 4.83 / 4.48), the five payments (2,821.90 / 2,793.37 / 2,764.99), the gaps 28.53, 56.91, 8,560.09, and exercise 6 (3,220.93 / 3,184.36, gap 36.57, 13,164.66 over 30 years).
- I also parsed every `=` equality in the five built pages (36 in all, plus the powers in the formula lines) and evaluated both sides.

**Every result matches the module. Every printed equality holds on its printed numbers**, within the stated rounding. I found no arithmetic error in a worked example, table, exercise answer or listed error. The problems are in one wrong word in a correct-answer note (5.3-1), an unlabelled statement about bank fees (5.1-1), labelling and wording, a letter clash, and phone tables. One equality needs a footnote it already has: `1.2454^(1/5) − 1` on the printed 1.2454 gives 4.4869%, the page prints 4.4872% (from the unrounded figure), and the page says "המספרים מעוגלים להצגה" (5.4, MDX 163).

**Phone.** No page scrolls sideways (document width 375 inside a 390 viewport) and no element sticks out of the page. The three FillTables fit (317px in a 343px box). Thirteen reading tables are wider than the phone; the layout's hint "יש עוד עמודות משמאל" is present. Seven of them push out the column the text talks about next (5.3-8: three tables, 5.4-3: three tables, 5.5-5: one; the comparer is one of the three in 5.3). The five components all lay out and work at 390px.

**Case A and case B.** Neither appears with numbers. Case A (נועם ושירה) is named three times only to say it is not the case in the example ("זה לא התיק של נועם ושירה", 5.1 MDX 116, 5.4 MDX 199, 5.5 MDX 253); the 40.4% figure, the mix, the tracks and the car loan appear nowhere. The stage-5 brief gives case A its mix in 5.6, so this is correct. Case B does not appear. **No violation.**

**What is right (checked and clean):**
- **The 451 contradictions stay open, in the lesson and not only in a list.** FK-H-031 is taught as the transcription (three baskets; a CPI-linked fixed track in none) with the field claim and the date conflict (end of 2020 against 31 August 2022) set beside it (5.2 MDX 135–139). The "משתנה צמודה על בסיס מק״מ" row is shown as unverified and not taught (5.4 MDX 115). "Prime = Bank of Israel rate + 1.5" is called a convention and not a rule of the directive (5.4 MDX 347). The three-months folklore is named as folklore (5.1 MDX 230). The open legal question about which charges belong in the up-front charges is stated in 5.1 and 5.3, and the formula takes it as an input.
- **No "עובדה מאומתת" in any of the five.** Sixteen "לא אומת" rows, four "מחקר / הצעה", three "ידע מהשטח" (each ends "ממתין לאישור אילון"), five "החלטה של Mogi" (each with who and when), five "הנחת חישוב", five "בדיקת חישוב".
- **No real bank's name or branding** in the lessons, components, data, subtitles or video scenes. The field-knowledge row that names a real bank's portal (FK-H-030) is written as "בנק אחד".
- **The comparability rule is taught** (4): four things that must be the same, shown broken one at a time with real numbers (5.3 table, MDX 162–198), practised in a half table and three exercises (5.3-3, 5.3-6, 5.3-7), carried into 5.4 (same version of the forecast) and 5.5 (same language, same type). See 5.3-7 and 5.4-1 for what is missing or wrong in how it is written.
- **The "LLM never computes" line** appears in 5.3 and 5.4 (MDX 285, 234) as a Mogi decision with a date.

---

## 5.1 — מה כתוב באישור העקרוני

The structure is right: a real-looking page, each line opened and tagged "the directive requires it / the bank adds it", then the three kinds of numbers, then what is still missing before the money arrives. The honesty callout ("מי כתב את הדף") is exactly what a beginner needs. The video follows the page. What is left:

### 5.1-1 · blocker · a statement about how banks charge a fee, with no label and no source
- **Where:** `PreApprovalDoc.vue` line 125, the explanation that opens under "עמלות שנגבות ביום ההעמדה": "העמלה נגבית רק בהעמדה. אם ההלוואה לא תיפתח, אין עמלה."
- **Problem:** this says when a fee is charged and when it is not, as a general fact about banks. No source gives it. The only grounding for the 360 ₪ is the Sources row "הנחת חישוב" (an invented fee, taken into the cost of credit as an assumption). The brief says "How banks price, what banks prefer: unknown. Do not invent". A learner will read "no loan, no fee" as a consumer protection and rely on it. The same panel also says, in other lines, "רשימת המסמכים שהבנק יבקש בפתיחת התיק" (line 147; labelled in Sources as the course's assumption, but not in the panel) and "בתוך החלון הזה צריך להספיק: למסור מסמכים, לשמאות, לחתימה" (line 69; a practice claim).
- **Fix:** replace line 125 with "בדוגמה כאן העמלה נגבית ביום שהכסף מועבר (הנחת הקורס). מתי בנק אמיתי גובה אותה, ומה קורה אם ההלוואה לא נפתחת — לא ידוע לנו; שאלה לאילון." Add that question to the Eylon list. In the "after" line write "רשימה כזו מגיעה עם האישור (לפי מחקר הצוות), והרשימה בדוגמה היא הנחה של הקורס".

### 5.1-2 · should fix · "one of two kinds", then three kinds; and the name clashes with 4.5
- **Where:** MDX 141 ("כל המספרים שבאישור הזה הם אחד משני סוגים, וההבדל ביניהם הוא העיקר בשיעור"); MDX 166 and 168 (add a third kind, "נמסר על ידכם, ועוד לא נבדק"); MDX 412 (summary: "שלושה סוגי מספרים"); video cues 25–26 and the last two frames ("שלושה סוגי מספרים באישור").
- **Problem:** the lesson announces two kinds and ends with three. And "שלושה סוגי מספרים" is already the name of lesson 4.5 (a limit, a capital line, a bank's policy). Two different triples with the same name, one stage apart, will blur: the 5.1 triple (set in the contract, forecast, given and not yet checked) is about *where a number comes from*; the 4.5 triple is about *what kind of rule it is*.
- **Fix:** MDX 141: "כל מספר באישור הזה הוא מאחד משלושה מקורות, וההבדל ביניהם הוא העיקר בשיעור". Rename the 5.1 triple "שלושה מקורות למספר" in the page, the summary, cue 25 and the last frame.

### 5.1-3 · should fix · exercise 4 asks two things, and its threshold says "מעל" where the decision says "או יותר"
- **Where:** MDX 346–358 (exercise 5.1-4); MDX 250 (worked example) and the Sources row (MDX 430).
- **Problem:** the exercise asks for a percentage and for a yes/no ("האם כאן מודגש?"), but accepts one number; the yes/no is never checked. The decision (the example and Sources) is "10% או יותר"; the exercise says "מדגישים מעל 10%". At exactly 10.0% the two disagree.
- **Fix:** ask only for the percentage and move the yes/no into the solution, or turn it into a second ChoiceExercise. Use one wording: "10% או יותר".

### 5.1-4 · nit · exercise 2's wrong-answer note is garbled
- **Where:** MDX 316, `err_next_day`: "ספרתם גם את היום שהיום כבר עבר."
- **Fix:** "ספרתם יום אחד יותר ממה שעבר: עברו 9 ימים, לא 10". The fact `err_next_day` is built from used = 10, so the sentence should say that.

### 5.1-5 · nit · small items
- The table shows "3.1%" for the linked track (MDX 130, `{t.rate}`); the data, the video cue 6 and the Sources say 3.10. Show "3.10%", as the fixed track shows 5.05%.
- The "מה עוד צריך לקרות" table (MDX 223) says "הבנק רשאי לתמחר מחדש" when the amount, term or mix change. That is a statement about bank behaviour with no label. Add "(ידע מהשטח, שיעור 1.8)" as exercise 6 does, or drop it.
- The video's bar charts start above zero (4,970.56 against 5,807.89 looks like a doubling, and 4.45 against 4.95 even more). The small line "הציר האנכי לא מתחיל באפס" is there, but it is 18px grey under the bars. Make it the same size as the caption, or start the axis at zero.
- The first frames of two scenes are empty cards (the table header with no rows, t=22 and t=31); they last about a second. Harmless; mention only to the video author.

---

## 5.2 — הסלים האחידים והסל המוצע

The problem-then-solution order is good: first two proposed baskets that cannot be compared, then three baskets that can. The three banks' table, with the lowest per basket marked, makes the point ("אין בנק זול ביותר בכלל") better than any sentence. The callout on amounts that do not divide, and the Eylon question beside it, are honest. What is left:

### 5.2-1 · should fix · "בדיקת הבסיס" is used before the lesson that teaches it
- **Where:** MDX 145 ("בדיקת הבסיס של הקורס, על שני הסלים המוצעים … מוצאת הבדל אחד: בתמהיל … בדיקה על סל אחיד 3 … לא מוצאת שום הבדל בבסיס"); the feedback of exercise 5.2-5 (MDX 369, "בדיקת הבסיס מראה הבדל בתמהיל"); the prediction reveal (MDX 220, "ובשיעור 5.3 נראה…").
- **Problem:** "the basis check" and "the basis" mean the four-things-the-same rule, which 5.3 teaches. In 5.2 they appear as if known. A learner who finished stage 4 has never seen the phrase (5.1 only says "על אותו בסיס … את זה נלמד בשיעור 5.3", MDX 400).
- **Fix:** in 5.2 say what the check looks at, without the name: "בודקים אם שתי ההצעות על אותו סכום, אותו תמהיל, אותו חודש ואותה תחזית. בסלים המוצעים של א׳ ו־ג׳ ההבדל הוא בתמהיל בלבד" and let 5.3 give it its name.

### 5.2-2 · should fix · the correction of FK-H-032 rests on a guide nobody here opened
- **Where:** MDX 148 (callout "מה הסלים נועדו לו"); the feedback of exercise 5.2-1 (MDX 302, "הצוות תיקן את ״הצעת דמה״ בסיכום מ־26 באוגוסט 2026"); Sources row 4 (MDX 429, "תוקן בסיכום ב־Drive … לפי המדריך של בנק ישראל").
- **Problem:** the field claim is quoted ("הצעת דמה עם מרווח גבוה") and refuted by "the team fixed it in a summary in Drive, according to the Bank of Israel's guide". The guide was not opened (official sites are blocked), the summary is not in the course, and the correction has no label of its own: it sits inside the "ידע מהשטח" row. The field-knowledge table lists FK-H-032 as "do not teach without correction", and AUTHORING says "never the do-not-teach items". The lesson prints the phrase, tells the learner "the course does not teach it", and then uses the unopened correction as the authority in a correct-answer note.
- **Fix:** keep the Eylon question, but print neither the phrase nor the Drive correction in the body. Write: "מה הסלים נועדו לו? לפי התעתיק של הצוות — להשוות מחיר על אותו תמהיל (לא נבדק מול ההוראה). איך בנקים מתמחרים אותם לעומת סל מוצע — לא ידוע; שאלה פתוחה לאילון." Keep the FK-H-032 quote in the Sources row, labelled "לא אומת", with the correction as a second row labelled "לא אומת".

### 5.2-3 · should fix · two sentences give the bank a motive
- **Where:** MDX 398 ("הסל המוצע הוא מה שהבנק חושב שמתאים לכם"); MDX 143 ("זה הסל שבו בנקים נבדלים זה מזה").
- **Problem:** the first one says what a bank thinks. No source gives that, and the same page says (MDX 148) that what banks prefer is unknown. The second is fine as a description of the example, but it reads as a general fact.
- **Fix:** MDX 398: "הסל המוצע הוא התמהיל שהבנק בחר; למה הוא בחר אותו — לא ידוע". MDX 143: "בדוגמה כאן, הסלים המוצעים הם מה שמבדיל בין הבנקים".

### 5.2-4 · nit · phone: two tables cut a column
- **Where:** the baskets table (MDX 93–120, `min-w-[26rem]`) and the rates table of the worked example (MDX 235–254, `min-w-[24rem]`).
- **Problem:** at 390px (box 343px) the amount column "ב־900,000 ₪" and the third rate column "משתנה צמודה" are out of view. The text that follows does not depend on them, so this is a nit.
- **Fix:** in the baskets table put the amount before the composition (the amount is short); in the rates table shorten the headers ("קבועה", "פריים", "צמודה משתנה").

### 5.2-5 · nit · the numbers in the table and the video differ in decimals
- **Where:** MDX 169 (`f.plain`) and video cues for the basket-3 row: "5.2%" next to "5.07%" and "5.51%".
- **Fix:** one rule for all rates in the tables: two decimals ("5.20%"). Same in 5.3 (table, video frames "5.2%" → "5.24%").

### 5.2-6 · nit · wording
- "ו־חצי" (MDX 318): "וחצי".
- "משווה כמעט שני דברים שונים" (MDX 85): "כמעט" weakens the point; "משווה שני דברים שונים".
- The heading "מה הסלים נועדו לו" (MDX 147) reads wrongly; "למה נועדו הסלים".
- Exercise 5.2-5 option 1 ("בנק ג׳ זול יותר, כי ההחזר הראשון שלו … גבוה") contradicts itself; the note has to say so ("גבוה יותר פירושו יקר יותר"). A beginner will not pick it; replace it with a real misconception, e.g. "בנק ג׳ זול יותר, כי העלות הממשית שלו נמוכה" (the trap the lesson builds).
- Exercise 5.2-6 is labelled "מאתגר" but is one subtraction of two given numbers (MDX 381–392); "בינוני" at most, or make it ask for the basket with the lowest first payment and the gap.
- The success line of the half table types "מיליון ומאתיים אלף" (MDX 283); use the fact.
- The video cue "לא 33%: כך חסרים אלפי שקלים בכל חלק" (3,000 ₪): "שלושת אלפים ₪ בכל חלק".

### 5.2-7 · nit · internal names in the body and the subtitles
- MDX 124 ("כך הצוות סימן בדף הסלים ב־Brain"), MDX 125 and 411 ("לפי דף J-080 ב־Brain"; "לפי Brain J-080"), cue 14 ("לפי Brain, לא נבדק"), and the on-screen "אילון (FK-H-031)". The learner never learned what "Brain" or J-080 is. See X-1.

---

## 5.3 — מדדי ההשוואה לפי הוראה 451

The three measures, then four conditions broken one at a time on the same bank, is the best idea in the stage. The comparer works and says plainly "לא להשוות מחיר". What is left:

### 5.3-1 · blocker · the correct-answer note of exercise 3 says the rate "went down" when it went up, and its premise contradicts itself
- **Where:** MDX 374–386 (exercise 5.3-3); the note is on the correct option, MDX 380: "נכון. בנק א׳ ירד מ־5.07% ל־5.65%, בלי ששום ריבית בהצעה השתנתה".
- **Problem:** 5.07 to 5.65 is an increase. The page's own table says so (MDX 190: "בנק א׳ קפץ"). There is also a conflict in the stem (MDX 385): it says bank A showed 5.07% and bank B 5.20%, "and it turns out A computed on one forecast and B on another". But 5.07% *is* A's number on the same forecast as B's 5.20%; on forecast B, A would show 5.65%. So the numbers in the stem cannot be the numbers of two different forecasts, and the note then tells a third story.
- **Fix:** rebuild the stem on the fact that exists: "בנק א׳ הציג 5.65% ובנק ב׳ 5.20%. מתברר שבנק א׳ חישב על תחזית ב׳ ובנק ב׳ על תחזית א׳, ושאר הדברים זהים" (`fc.a.rate`, `base.b.rate`), and the note: "נכון. על אותה תחזית בנק א׳ יוצא 5.07%, כלומר נמוך מבנק ב׳. כשהוא חישב על תחזית ב׳ הוא קפץ ל־5.65%, בלי ששום ריבית בהצעה השתנתה."

### 5.3-2 · should fix · the letter T is taken, and the comparer and the Sources still say A
- **Where:** the formula box MDX 261–276 (`P − T = …`, T defined at MDX 270); the summary MDX 474 ("(T)"); `OfferCompare.vue` line 171 ("(A = 0)"); Sources rows MDX 486 and 491 ("פחות A", "ל־A").
- **Problem:** the lesson moves the up-front charges from the directive's A to T, because A is the anchor from 2.1 (the box says so). But T is the living budget since 4.6 (AUTHORING table: "T — the living budget"), a lesson this learner has just finished. And inside the same lesson the comparer says A, the Sources say A, the body says T. Three letters for one thing across one lesson; the same learner met A as the anchor in 5.4.
- **Fix:** use words, not a letter, for this one quantity: write the box as `P − עמלות ההעמדה = C₁ ÷ (1 + r)¹ + …` and define it in the `<dl>` ("מה שנגבה ביום שההלוואה ניתנת, בשקלים; בלי עמלה — 0"). Use the same words in the comparer's footnote, the summary bullet and the Sources rows, and keep "A" only inside the quotation of the directive's own notation. If a letter is wanted, ask the coordinator for a row in the AUTHORING table; do not reuse T.

### 5.3-3 · should fix · "כמה עולה כל שקל לכל חודש" says the wrong period
- **Where:** MDX 126, table "מה כל מספר אומר", column "עונה על", row "ריבית כוללת חזויה".
- **Problem:** the measure is an annual effective rate (5.07% a year). "Per month" reads as the monthly IRR (0.41325%), which the lesson computes one step earlier. A learner who reads the table for the question each number answers gets the wrong unit.
- **Fix:** "כמה עולה כל שקל שלוויתם, בשנה, אחרי עמלות ותחזית".

### 5.3-4 · should fix · "נמשכו" is the word AUTHORING bans
- **Where:** MDX 159 ("מסלולים שנמשכו בתאריכים שונים מחושבים כאילו כל ההלוואה נמשכה ביום החישוב"); Sources row MDX 488.
- **Problem:** AUTHORING lists "נמשכת" (withdrawn / continues) as an ambiguous word to rephrase. Here "נמשכו" can be read as "lasted". 5.4 uses "הועמדו" for the same rule (MDX 494); the two lessons should say the same thing.
- **Fix:** "מסלולים שהכסף שלהם הועבר בתאריכים שונים מחושבים כאילו כל ההלוואה הועברה ביום החישוב" in both lessons.

### 5.3-5 · should fix · "two of them you already know" (it is three), and two grammar slips
- **Where:** MDX 50: "האישור מציג שלושה מספרים שמודדים הצעה. שניים מהם כבר מכירים משלב 3"; MDX 110: "הראשון: … שנייה: …"; MDX 200: "ארבעה התנאים".
- **Problem:** the lesson itself cites 3.10, 3.9 and 3.8 for the three (MDX 106–108). All three are known. "שנייה" does not agree with "דברים"; "ארבעה התנאים" should be "ארבעת התנאים".
- **Fix:** "שלושתם כבר מוכרים משלב 3; היום נראה איך הם נקראים באישור"; "השני:"; "ארבעת התנאים".

### 5.3-6 · should fix · the description of the "different mix" row is wrong
- **Where:** MDX 193: "בסל 2 בנק א׳ יוצא 5.51%: מסלול משתנה צמוד במקום חצי מהפריים, וחלוקה אחרת."
- **Problem:** basket 3 is half fixed and half prime. Basket 2 is a third fixed, a third prime, a third variable linked. "A variable linked track in place of half of the prime" is not what changed: the prime falls from a half to a third, the fixed from a half to a third, and a third is added. Also "משתנה צמוד" is masculine; the track is "משתנה צמודה".
- **Fix:** "בסל 2 בנק א׳ יוצא 5.51%: שלישים של קבועה, פריים ומשתנה צמודה במקום חצי–חצי של קבועה ופריים. זה תמהיל אחר, לא מחיר אחר".

### 5.3-7 · should fix · the three banks' offers and the scenario table carry no example label
- **Where:** the first table (MDX 79–102, three banks) and the scenario table (MDX 162–187). `EXAMPLE_LABEL` is imported (MDX 22) and never used on the page; the built page shows it once, from the comparer.
- **Problem:** the brief says every example document and offer carries "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים". 5.1 and 5.2 print it; 5.3's tables of three banks' "offers" say only "בדויים" in a sentence. A reader who scrolls to the table sees three banks, three rates, no label.
- **Fix:** print `{EXAMPLE_LABEL}` as a caption under each of the two tables (as 5.2 does at MDX 178).
- **Also (taught rule):** the four conditions say nothing about *who* the offers are for. Two offers for two different households are not comparable even with the same amount and mix. One line: "ובכל מקרה: אותו תיק, אותם לווים". The prediction (MDX 61) says "לאותה בקשה", so the idea is there; the list should hold it.

### 5.3-8 · should fix · phone: the scenario table and the first table hide the columns the text discusses
- **Where:** the scenario table (MDX 164–187): at 390px (box 343px, table 544px) "סך תשלומים של א׳", "בדיקת הבסיס" and "נמוך בריבית" are out of view; the next list talks about exactly those. The first table (MDX 81–102) hides "ההחזר המרבי החזוי". The "what each says" table (MDX 114–141) hides "לא עונה על". In the comparer (`OfferCompare`), the "בנק ג׳" column is cut at the edge ("93,393.78 ₪" visible).
- **Fix:** scenario table: drop "סך תשלומים של א׳" (the list below gives the one total that matters) and shorten "נמוך בריבית" to "הנמוך" — three columns fit. First table: put the highest payment before the total, or turn each bank into a card. Comparer: below 640px stack the three banks as three blocks of three rows.

### 5.3-9 · nit · smaller things
- **MatchTable `5.3-half`, row 5** (MDX 325): the prompt is "בנק א׳ באוקטובר ובנק ב׳ בנובמבר, וכל אחד חישב לפי התחזית של החודש שלו"; the key says "החודש", but the forecast also differs, and the lesson's own check says both (MDX 191). A learner who answers "התחזית" (row 4's answer) is marked wrong. Reword the prompt or accept both.
- **Prediction option 1** (MDX 43) shows bare numbers: "5.07 קטן מ־5.2"; add "%" and write "5.20%".
- **The "different month" row** (5.13% against 5.07%) does not change who is lowest, so it shows the rule less well than the other rows. Fine as is; consider forecast C with a bigger move.
- **Four guided tasks** (MDX 216–220); AUTHORING says 2–3. Fold task 3 into 2.
- **The decision of 2026-10-07** (use only the published forecast data, MDX 196) is not in the Sources of 5.3 (5.4 has it). Add the row.
- **Video:** the table card is too short, so the last row ("תמהיל אחר", t≈154–162) sits on the card's bottom border. "5.2%" instead of "5.20%" (see 5.2-5). Cue "5.07% קופץ" — "5.07% קופצת"? Better: "תחזית אחרת: מ־5.07% ל־5.65%".
- **The highest-payment month 300 for bank A** (5,254.41, MDX 110) is 27 agorot above the plateau (5,254.14): a rounding artefact the page mentions ("עוד כמה אגורות"). Say the number: "27 אגורות", so it is clear the month is not a real peak.

---

## 5.4 — תחזית לפי הוראה 451

The longest lesson (40 minutes) and, with 5.3, the one a beginner will find hardest. It earns it: the forward rate is explained in one worked table, the "divide, do not subtract" point has a number (0.0332 points a year, 0.96% in the index after 20 years), and the course's own assumptions (anchor of the day, prime as a yearly track, rounding) are listed apart from the directive. All five track shapes recompute. What is left:

### 5.4-1 · should fix · "חוקית" means legal, and the rule is the course's own
- **Where:** MDX 498 ("השוואה בין הצעות חוקית רק על אותה גרסה של התחזית"); the feedback of exercise 5.4-5 (MDX 639, "השוואה חוקית רק על אותה גרסה").
- **Problem:** "legal" says the law forbids it. The same stage says (5.3, MDX 200 and Sources 492) that the four conditions "הם בנייה של הקורס … לא ניסוח של ההוראה". The brief's word is "legitimate" (לגיטימית).
- **Fix:** "השוואה בין הצעות הוגנת רק על אותה גרסה של התחזית (כלל של הקורס)". Same wording in the feedback.

### 5.4-2 · should fix · "a fixed rule that all banks compute the same" contradicts the callout above it
- **Where:** MDX 188 (callout "מה העוגן העתידי אינו"): "…לפי כלל קבוע שכל הבנקים מחשבים אותו אותו דבר. הכלל מאפשר להשוות".
- **Problem:** MDX 113–114 say that the transcription does not say how the curve becomes a prime forecast, nor which day or which bond each bank uses for its anchor, nor how it rounds. So "all banks compute it the same" is not known, and it is not labelled.
- **Fix:** "…לפי כלל שההוראה קובעת, כפי שהצוות תעתק אותה (לא נבדק). איך כל בנק מיישם אותו בפועל — לא ידוע לנו".

### 5.4-3 · should fix · phone: three tables lose the column the text is about
- **Where:** the expected-inflation table (MDX 267–291): at 390px the last column "האינפלציה החזויה באותה שנה", the one the paragraph above it is about, is out of view; the five-tracks table (MDX 305–337): "החזר מרבי חזוי", "בחודש" and "סך תשלומים חזוי" are out, and the bullets below talk about exactly them; the two-versions table (MDX 463–487): both version-B columns, the point of the table, are out. The four-column worked table (MDX 209–230) loses "התשלום בחודש הראשון של התקופה".
- **Fix:** inflation table: drop "נומינלי" and "ריאלי" (shown in the first curve table, MDX 128–148) and keep אורך · ציפיות עד האורך · האינפלציה באותה שנה. Five tracks: keep המסלול · החזר ראשון · החזר מרבי חזוי · בחודש (four columns), move the total to the bullets. Versions table: show version A and B as two small blocks of four rows, or stack them.

### 5.4-4 · should fix · "נקודות אחוז" for numbers below one
- **Where:** MDX 201 and 510 ("0.61 נקודות אחוז"), 260 ("0.0332 נקודות אחוז"), 530 ("0.31 נקודות אחוז"), 656 (the exercise-6 note, "0.5 נקודות אחוז"); video frames ("ההפרש: 0.0332 נקודות אחוז בשנה"); and see X-2 for 5.5.
- **Problem:** AUTHORING: "נקודת אחוז" is singular up to one (0.25 נקודת אחוז, נקודת אחוז אחת) and plural above it. 5.7 and 5.9 follow it ("0.25 נקודת אחוז"); 5.4 and 5.5 do not.
- **Fix:** "0.61 נקודת אחוז", "0.0332 נקודת אחוז בשנה", "0.31 נקודת אחוז", "0.5 נקודת אחוז". Same in the video scene (`video/5-4.html` line 269).

### 5.4-5 · nit · jargon and letters
- "מפקח על הבנקים" (MDX 113) is not defined anywhere in the course. One clause: "(הגוף בבנק ישראל שמפקח על הבנקים)".
- "בסיסי ריבית" (Sources, MDX 715): a term the course never teaches; in the Sources only, so a nit. Say "מאיות נקודת אחוז".
- "מק״מ הוא בדרך כלל לא צמוד" (MDX 115) is a statement of fact without a label; 0.11 teaches it as "לא אומת", so add "(שיעור 0.11)".
- The formula box introduces "p" (MDX 382, "כל p שנים"), used once, and "t₁, t₂, t". They are not in AUTHORING's letter table. A word ("כל כמה שנים") instead of p; add t to the table, or say "שנים".
- `1.2454^(1/5) − 1` (MDX 160) gives 4.4869 on the printed figure; the printed 4.4872 is from the unrounded 1.24539… The sentence "המספרים מעוגלים להצגה" is there; add "ולכן התוצאה מהמספרים המודפסים תהיה שונה בספרה הרביעית".

### 5.4-6 · nit · the lesson is dense, and the video loses the numbers
- Four guided tasks (MDX 360–364); AUTHORING says 2–3.
- **Video:** the on-screen line "לפי תעתיק של הצוות ב־Brain · לא נבדק מחדש מול ההוראה" (`video/5-4.html` line 190) names "Brain" without saying what it is. The fixed-linked chart ends at month 181 with no label for the highest payment (3,514.67 at month 240), which the cue talks about. Its caption says "הציר האנכי לא מתחיל באפס". The curve chart has no vertical scale at all: bars and the line have no numbers except at four points.

---

## 5.5 — ממוצע שוק, אומדן, הצעה אישית ועסקה שבוצעה

The sorting component is the best interactive in the stage: one sentence, four buttons, a clue after each. The profile-mix example (4.47% to 4.83% with no price moving) is the clearest piece of statistics in the course so far. What is left:

### 5.5-1 · should fix · "ריבית חוזית" is used from the first question and never taught, and it collides with 0.8
- **Where:** the prediction question (MDX 62, "כריבית חוזית"), the exercise sentences (MDX 41, 255), the definition at MDX 139 (the first place it is explained); `src/data/definitions/5-5.json` (no entry); the `<Term>` at MDX 139 is for "ריבית שנתית" (0.4) and "ריבית אפקטיבית" (0.4).
- **Problem:** "ריבית חוזית" appears nowhere in stages 0–4. It is used before the page explains it. And 0.8 teaches "ריבית נומינלית" as "before inflation", while 5.5 needs the other split (a yearly rate divided by 12, against the rate that compounding gives). The learner who knows "נומינלית" from 0.8 sees "חוזית" and wonders if it is the same word. 5.9 (MDX 216–218) uses "נומינלית" for the same contract rate, so the two lessons say it differently.
- **Fix:** define it in one line before the prediction or in the opening: "ריבית חוזית — הריבית השנתית שכתובה בחוזה, שחוצים ב־12 כדי לקבל את החודשית (זו ריבית שנתית משיעור 0.4; לא לבלבל עם ״נומינלית״ משיעור 0.8, שפירושה ״לפני אינפלציה״)". Add an entry to `5-5.json`. Decide, with 5.9, one name for the contract rate.

### 5.5-2 · should fix · the worked example breaks the rule it teaches
- **Where:** MDX 257–261 (steps 2–4); MDX 171 ("לפני שמשווים לממוצע, שואלים באיזו שפה הוא כתוב").
- **Problem:** step 2 converts the offer (4.65% contract) to effective (4.75%) before comparing it with the average (4.80% effective): correct. Steps 3 and 4 then compare the estimate (4.55%) and the neighbours' deal (4.45%) with the offer (4.65%) and compute payments from them as if all were contract rates, and never say what language the estimate and the deal are written in. The reader just learned that this is the question to ask first.
- **Fix:** add "(האומדן והעסקה כתובים בריבית חוזית, כמו ההצעה; הנחה של התרגיל)" before step 3. Same for the sentences of items 3, 4 and 8 in the sorting component ("בקבועה לא צמודה, בערך 4.55%").

### 5.5-3 · should fix · advice about negotiating, stated as fact
- **Where:** MDX 261 ("אפשר להזכיר אותה לבנק כרמז, ואי אפשר לדרוש אותה"); the correct option and note of exercise 5.5-7 (MDX 402: "אפשר להזכיר אותה בשיחה, אי אפשר לדרוש אותה"; "היא רמז על מה בנקים עושים לפעמים, לא זכות"); MDX 415 ("בעסקאות של אחרים כרמז בלבד").
- **Problem:** how a bank reacts when a client mentions another deal is bank behaviour. The brief lists mix examples in negotiation (FK-H-072) as "field knowledge, unchecked". The correct answer of a graded exercise rests on it, with no label.
- **Fix:** keep the safe half as the rule ("עסקה של אחרים היא עובדה על מקרה אחד; היא לא נאמרה לכם והיא לא מחייבת בנק"), and mark the practice half: "מה בנקים עושים כשמזכירים להם עסקה אחרת — לא ידוע לנו; שאלה לאילון". Make the correct option of 5.5-7 the safe half only.

### 5.5-4 · should fix · "three reasons", then a fourth
- **Where:** MDX 123 ("שלוש סיבות. הראשונה … השנייה … והשלישית"); MDX 139 ("הסיבה האחרונה היא הכי מעשית: המספרים כתובים בשפות שונות").
- **Fix:** "ארבע סיבות", or call the language point "ועוד מלכודת אחת", not a reason. The video does the second (cue "עוד מלכודת").

### 5.5-5 · should fix · phone: the lesson's main table loses two of its four columns
- **Where:** the four-numbers table (MDX 90–107, `min-w-[34rem]`): at 390px "על מי, ומתי" and "מה אפשר לעשות איתו" are out of view; they are the two columns that separate the four numbers.
- **Fix:** four cards ("ריבית ממוצעת: מי מייצר, על מי, מה אפשר"), or a two-column table (המספר · מה אפשר לעשות איתו) with the other two as a line under each name.

### 5.5-6 · should fix · the exercise says the Bank of Israel average is "effective", while the lesson says nobody knows
- **Where:** MDX 40 (item 1, "בנק ישראל מפרסם … (אפקטיבית שנתית)"), the prediction question (MDX 62); MDX 114 and 171 ("בסדרות הממוצעים של בנק ישראל — לא ידוע לנו").
- **Problem:** the item presents the Bank of Israel's published average as effective annual, which is what the lesson says is open. The same unknown is the reason for the lesson's rule. Since all numbers are invented, the fix is to say whose they are.
- **Fix:** in the sentence: "ממוצע שפורסם (בדוי; בדוגמה כאן הוא כתוב בריבית אפקטיבית)". In the prediction: "כתבה אומרת: ... 4.80% אפקטיבית שנתית (מספר בדוי)".

### 5.5-7 · should fix · "נקודות אחוז" below one
- **Where:** MDX 34 ("נמוכה ב־0.1 נקודות אחוז"), 125 ("0.36 נקודות אחוז"), 160 ("0.1 נקודות אחוז"), 184 ("0.23 נקודות אחוז"), 257 ("0.05 נקודות אחוז"), 259 ("0.1 נקודות אחוז"); the subtitle cue "0.1 נקודות אחוז" (`public/video/5-5.he.vtt` line 73, `video/5-5.html` lines 87 and 204) and the frame "עלייה של 0.36 נקודות אחוז".
- **Fix:** see 5.4-4: "0.1 נקודת אחוז", "0.36 נקודת אחוז", and so on. Note the video's own title frame says "עשירית נקודת אחוז" correctly.

### 5.5-8 · nit · letters, jargon, person
- The weighted-average box (MDX 192–199) writes `r_k` as "באחוזים בשנה"; in the course r is a decimal per period. Say "R" or "הריבית באחוזים" without a letter, and keep W.
- "חתכים נוספים" (MDX 82) is undefined; "לפי סוג מסלול, שווי הנכס ושיעור המימון".
- The opening says "למדנו / נבדיל" (we); AUTHORING says plural address to the learner ("למדתם"). 5.4 has the same ("חישבנו", "ראינו").
- "ב־Mogi יש הצעה … (לפי דף מחקר ב־Brain …)" (MDX 109): "Brain" again; see X-1.
- Exercise 5.5-6's wrong-answer note covers one error (the 30-year total); a learner who types 36 (one agora off) gets "נכון בקירוב" from `near={1}`, which is fine.

---

## Cross-lesson items

### X-1 · should fix · internal names in the body and the subtitles
- **Where (outside `<Sources>`):** the bare word "Brain": 5.1 MDX 94; 5.2 MDX 124, 125, 411; 5.5 MDX 109; the video cue "(לפי Brain, לא נבדק)" (5.2, `public/video/5-2.he.vtt` line 53) and the on-screen line in 5.4. "J-080" in 5.2 MDX 125 and 411. The name "עדן" as the person who accepted a decision: 5.3 MDX 196, 5.4 MDX 204 and 498. The internal ID "FK-H-031" on the 5.2 video frame (`video/5-2.html` line 249).
- **Problem:** the same defect stage 4's X-2 listed. The learner is never told what Brain, J-080 or עדן is. "אילון" is the one name the course established (1.x), and it is fine; "FK-H-…" ids beside "ידע מהשטח" are the house label and are fine in the text.
- **Fix:** "לפי תעתיק של הצוות (לא נבדק)", "לפי מחקר הצוות", "לפי החלטה של Mogi (אילון אישר ב־2026-10-07)". Keep the page ids and J-codes in `<Sources>` and the closing comment.

### X-2 · should fix · "נקודות אחוז" below one (5.4 and 5.5)
See 5.4-4 and 5.5-7: 12 places and two video scenes. 5.7 and 5.9 are right; a search for `0\.\d+ נקודות אחוז` over the lessons and `video/` finds all of them.

### X-3 · should fix · "every bank must offer / all offer" against an open question
- **Where:** 5.1 MDX 417 ("שלושה תמהילים שכל בנק חייב להציע"); 5.2 MDX 54, 89 ("שכל הבנקים מציעים", "שלושה תמהילים שכולם מציעים"), the definition in `5-2.json`, the video cue and the frame ("שלושה סלים שכולם מציעים").
- **Problem:** `research/eylon-list.md` row 5 asks whether a bank offers the three baskets to every borrower by default or only on request, and says the course will say "every bank offers the three baskets" and not "automatically". 5.1's "חייב להציע" is stronger than that and states an obligation. The 5.2 wording is the safe one, but it opens the lesson without the label that later lines carry ("לפי התעתיק").
- **Fix:** 5.1: "שלושה תמהילים קבועים שבנקים מציעים באותו הרכב (לפי התעתיק)". 5.2 opening: add "לפי התעתיק" once, and put row 5 in the callout beside the amounts question (MDX 127–129).

### X-4 · nit · the next-lesson titles are shorter than the map's
5.2 → 5.3 is "מדדי ההשוואה של הוראה 451 ומתי מותר להשוות" (the map: "מדדי ההשוואה לפי הוראה 451: …"), 5.3 → 5.4 "תחזית לפי הוראה 451" (the map adds ": עקום אפס וציפיות אינפלציה"), 5.5 → 5.6 "שלושת יעדי התמהיל" (the map adds the clause). AUTHORING says the exact map title. One word ("של" for "לפי") is the only real difference; either is a nit.

### X-5 · nit · the date of the reform
5.2 MDX 137 and Sources: "הסבר של בנק ישראל על הרפורמה, נקרא ב־2026-10-09" with kind "לא אומת". "נקרא" suggests someone read the page; the brief says a summary of a search (no official page opened). Write "לפי תקציר חיפוש של הסבר של בנק ישראל (2026-10-09)".

### X-6 · nit · the three-decimals habit in tables
Rates shown with the fewest decimals ("5.2%", "3.1%", "4.3%") next to rates with two ("5.07%"). Format all rates in tables with two decimals (the data already holds "5.20", "3.10"; the pages use `f.plain`).

---

## Count

2 blockers, 26 should fix, 13 nits.

**The most important items, in the order I would fix them:**
1. **5.3-1:** the correct-answer note of exercise 5.3-3 says "בנק א׳ ירד מ־5.07% ל־5.65%" (it went up), and the stem's numbers cannot come from two different forecasts. Rebuild the stem on `fc.a.rate`.
2. **5.1-1:** "אם ההלוואה לא תיפתח, אין עמלה" in the pre-approval component is a claim about how banks charge, with no source and no label. The brief says banks' behaviour is unknown.
3. **5.3-2:** the letter T (the up-front charges) is the living budget of 4.6, and the same lesson writes A in the comparer and the Sources.
4. **5.5-1:** "ריבית חוזית" is used from the first question and never defined or listed as a term, next to 0.8's "נומינלית" that means something else.
5. **5.2-1 and 5.1-2:** "בדיקת הבסיס" used one lesson before it is taught, and "שני סוגים / שלושה סוגי מספרים", which clashes with 4.5's name.
6. **5.4-1 and 5.4-2:** the comparison rule called "חוקית" (the course's own rule), and "all banks compute it the same" against the callout that says it is unknown.
7. **X-2:** "נקודות אחוז" for numbers below one, in twelve places and two videos.
8. **5.2-2 and X-3:** the FK-H-032 correction rests on an unopened guide; "חייב להציע" and "כולם מציעים" against the open Eylon question 5.
9. **5.5-2 and 5.5-3:** the worked example breaks its own language rule; negotiation advice with no label, as the correct answer of exercise 7.
10. **Phone:** 5.3-8, 5.4-3 and 5.5-5, where tables push out the column the text talks about.
