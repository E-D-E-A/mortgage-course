# QA report: lessons 4.1–4.5, read as a beginner

Date: 2026-10-12. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts are outside the project.

**The reader:** someone who finished stages 0–3 (money, the mortgage world, tracks and rates, schedules, payments, present value and IRR) and has never looked at a mortgage through the bank's eyes.

**What I read:**
- the five MDX files with every exercise `errors` list, FillTable config and `<Sources>` block;
- the built pages `dist/lessons/4-{1..5}/` (visible text and DOM);
- `public/video/4-{1..5}.he.vtt` and all 91 key frames `qa/video/4-{1..5}-t*.png`;
- `data/lessons/4-{1..5}.json` and the definitions files `src/data/definitions/4-{1..5}.json`;
- the components `PayslipAnatomy`, `PaymentRatioChecker`, `RegulationChecker`, `ThreeKindsLadder` and `FillTable`;
- the phone screenshots `qa/screens/phone_lessons_4-{1..5}_.png`, cut into strips. I also ran my own Chromium at 390px over every table of the five built pages, measuring which header cells fall outside the scroll box;
- `course/AUTHORING.md` (each rule checked), `course/stage-4-brief.md`, `course/course-map.md` (stage 4, sections 4 and 8), `research/eylon-list.md`, `research/field-knowledge.md` and the notes it points to (`brain-calculation.md`, `brain-product-journey.md` §42, `official-sources.md`);
- `scripts/case_sketch.py`, and the earlier report `qa-reports/stage-3-review-3.1-3.6.md` (I follow its format);
- for cross-lesson checks: 1.2, 1.9, 2.10, 3.8 and a grep of 4.6–4.15.

**Math check.** Everything below was recomputed independently in Python `Decimal` (rate ÷ 1200, each payment rounded to the agora, ratios rounded to two digits). I did not read the numbers by eye.
- 4.1: the three payslips and their nets (8,150 / 8,200 / 8,250; 7,700 / 7,750 / 7,800), the averages 8,200 and 7,750, the 450 gap, the assessments (8,000, 7,500, 3,500, 3,000), the household (19,200, 15,700, 16,200, 15,250, gap 3,500), the half table (7,650 / 7,750 / 7,850, average 7,750), and exercises 2–7 with every listed error (12,350, 3,950, 28,050, 9,450, 10,833.33, 2,333.33, 2,000, 24,000).
- 4.2: 21,700 / 20,250, the 8 and 9 payments (26 − 18, 26 − 9 = 17), the Roni and Tamar table (3,700; 19,700; 8,200; 15,200; 4,500), the half table (4,300), the task values (18,250 / 20,250 / 16,250 / 18,750), and exercises 2–6 with every error (14,300, 8,600, 14,400, 21,300, 17,700).
- 4.3: Spitzer 565,000 at 4.6% and 4.1% over 300 months (3,172.61, 3,013.56, 6,186.17); the four ratios (32.22, 38.19, 39.40, 40.57) and the 7.18 gap; the bullet interests (1,666.67, 2,165.83, 1,930.42, 4,096.25, 26.09%); the grace case (3,750.00 during, 5,684.25 after, **computed over 288 months**); Gilad and Noy (1,581.59; 14,000; 3,681.59; 26.30 / 11.30 / 13.29); the checker rows (45.77 / 42.08 / 39.40); the half table (30.00 / 32.00 / 26.36 / 42.11); exercises 1–7 and every error (333.33, 3,333.33, 20,000, 32.5, 25, 16.67, 19.23).
- 4.4: every ceiling, line and rounding (750,000; 5,000; 4,000; 600,000; 666,666.66 / 333,333.34; 899,910); the checker default (70.59, 43.75, 70%, 40,000 over); the worked example (72.5; 1,400,000; 50,000; 43; 600; 68.97; 33,333.34; 933,333.33; 66,666.67); the reduced-price example (1,350,000 / 1,050,000, equity 50,000 / 350,000); exercises 2–7 and every error.
- 4.5: all four case ratios (31.25 / 37.5 / 42.5 / 52.5), the gaps (800, 1,600, 2,400), the LTV lines (1,500,000 / 1,300,000, extra equity 200,000), the half table, exercises 2–6 and every error.
- Both checker components' defaults, the video cues and the video frames.
- I also parsed every `=` equality in the five built pages and evaluated both sides.

**Every result matches the module. Every printed equality holds on its printed numbers**, within the stated rounding. I found no math error in a worked example, table, exercise answer or listed error. The problems are in wording, labels, structure and two rendering bugs.

**Phone.** No page scrolls sideways (document width 375 inside a 390 viewport). The five FillTables fit, except the 4.3 one by 5 px (4.3-7). Eight reading tables are wider than the phone. Four of them push out the column the text talks about (4.1-6, 4.2-6, 4.3-6, 4.5-3). Two screen defects need fixing at the source: the word "none" (4.2-1) and a merged paragraph (4.2-2).

**Case A and case B.**
- **Case A (נועם ושירה)** appears in 4.2 only, with the numbers the map allows: nets 12,400 and 9,300, car loan 1,450 for 26 months. It gets no track, mix, offer, rate or loan. 4.3 says plainly that it "does not appear here: no tracks or mix yet". 4.4 and 4.5 use no case. The 40.4% figure appears nowhere. **No violation.**
- **Case B (אבי)** is consistent with the map and `scripts/case_sketch.py`: declared 11,000 + 8,200, equity and loan 1,130,000 over 25 years, ratio 32.22% on the declaration. The recognised side (39.40%, 38.19%, 40.57%) is the exercise the map asks for. His tracks (4.6% and 4.1% in halves) are a calculation assumption, and the lesson says so.

---

## 4.1 — הכנסה מוכרת

The structure is right: two numbers per income, then the payslip, then the assessment, then a household. The open question (net or net-to-pay) is shown honestly instead of hidden. The video follows the page. What is left:

### 4.1-1 · must fix · a rule of thumb that no source gives
- **Where:** MDX 160, the bolded sentence: "**ההכנסה המוכרת של עצמאי נמוכה בדרך כלל ממה שהוא מרגיש שהוא מרוויח, ולכן הפער הוא חלק מהתיק, לא מקרה חריג.**"
- **Problem:** this is a general practice claim with no source. The Brain, FK-H-014 and the questionnaires say how the number is built, not how often it is lower than the self-employed person's own figure. It is also bolded as the lesson's conclusion about self-employed clients.
- **Fix:** write it about the case only: "בתיק של אבי ההכנסה המוכרת נמוכה מההצהרה, והפער הוא חלק מהתיק. כמה זה נפוץ אצל עצמאים — לא ידוע לנו; שאלה פתוחה לאילון." Add it to the Eylon list.

### 4.1-2 · should fix · "שומה" is used before it is explained, and the step from the assessment to "net" is never taught
- **Where:** the prediction question (MDX 51: "בשומות של השנתיים האחרונות מופיעה הכנסה שנתית נטו"), video cues 10–11 and the frames "שומה ישנה / אחרונה"; exercise 5 (MDX 429); the step "עצמאי: מהשומה" (MDX 138–140, 259–267).
- **Problem:** the first two meetings with the word are the prediction and the video, before the term is defined. The explanation then says the assessment shows "הכנסה שנתית נטו". Exercise 5 gives income before tax and a tax amount and expects the learner to subtract. The explanation never says that an assessment shows income before tax and the tax, and that net is the difference. That appears only inside the FK-H-014 bullet ("הכנסה שנתית פחות מס"). The learner is tested on a step that was not taught.
- **Fix:**
  - gloss it in the question: "(שומה — החישוב השנתי של ההכנסה והמס, שעצמאי מקבל מרשות המסים)";
  - add two lines to the step: "בשומה רואים את ההכנסה השנתית ואת המס עליה. נטו = ההכנסה פחות המס", with exercise 5's own facts or a new `difference` fact;
  - add one frame to the video (cue 10) defining "שומה".

### 4.1-3 · should fix · bonuses and one-off payments are stated as settled; FK-H-015 says they are open
- **Where:** MDX 128, "…ולכן לפי המפרט של Mogi מסמנים אותו ולא סופרים אותו כהכנסה קבועה"; MDX 271, "תשלום חד־פעמי לא נכנס לממוצע".
- **Problem:** the spec the lesson cites is marked unapproved by the lesson itself (callout, MDX 131). FK-H-015 (in Sources) says "איך סופרים בונוסים ומענקים — עוד פתוח". The brief says do not fill the gaps. Item 2 of "מתי זה נכון" is written as a rule.
- **Fix:** "המפרט הפנימי (עוד לא אושר) מסמן תשלום חד־פעמי ולא סופר אותו כהכנסה קבועה. איך בנק סופר בונוס — שאלה פתוחה (FK-H-015, ממתין לאישור אילון)." Item 2: "בקורס: חודשים רגילים בלבד".

### 4.1-4 · should fix · "ניקח את הממוצע, הזהיר מבין השניים"
- **Where:** MDX 308 (worked example, step 2); video cue 19, "החישוב ממשיך מהמספר הנמוך".
- **Problem:** the lesson itself says (MDX 158) that when income falls, the average gives *more*. "Cautious" is true only in Avi's case. The choice is a course assumption but is not marked "הנחת חישוב" there. The video states it with no label.
- **Fix:** "ניקח כאן את הנמוך מבין השניים: הממוצע (הנחת חישוב של הקורס; בנק אחר אולי אחרת)". Video cue 19: "בקורס: ממשיכים מהמספר הנמוך. בנק אחר — אולי אחרת".

### 4.1-5 · should fix · a Mogi decision with no "who" and no source row
- **Where:** MDX 205, "(החלטה של Mogi, 2026-08-31)".
- **Problem:** AUTHORING says a Mogi decision carries who and when. Here there is only a date, and no Sources item records it. The notes show it is a real decision (domain rules page, 2026-08-31, "not read"), with no person named.
- **Fix:** add a Sources item, "החלטה של Mogi, 2026-08-31, דף כללי התחום; לא נקרא בסביבה הזו". In the text: "החלטה של צוות Mogi, 2026-08-31".

### 4.1-6 · should fix · phone: the payslip table hides the two columns the text is about
- **Where:** the six-column payslip table (MDX 99–124, `min-w-[34rem]`), and the "הכנסות אחרות" table (MDX 166–203).
- **Problem:** at 390px (box 341px, table 544px) the columns "שכר נטו", "ניכויים אחרים" and "נטו לתשלום" are outside the box. The next paragraph is about the nets and their average. In the "הכנסות אחרות" table the column "מה אפשר לראות בשאלונים הציבוריים" is out of view, and the middle column is cut mid-sentence.
- **Fix:** for the payslips, drop "ניכויי חובה" and "ניכויים אחרים" (the lines above and PayslipAnatomy show them) and keep חודש · ברוטו · שכר נטו · נטו לתשלום. That is four columns and fits. For "הכנסות אחרות", turn each income into a small block (name, how Mogi handles, what the forms show) instead of a table.

### 4.1-7 · nit · the three statuses are never shown
- **Where:** MDX 76 (נכלל / דורש בדיקה / לא נכלל); the summary; the five questions.
- **Problem:** the learner is told the three states exist and no income is ever given one. No exercise uses them.
- **Fix:** one sentence in the household example: "הכנסת מיכל — נכלל; הכנסת אבי — דורש בדיקה, כי יש שתי שיטות". Or a short exercise.

### 4.1-8 · nit · "היחס" before 4.3
- **Where:** the five questions, "הכנסה מוכרת נמוכה מההצהרה מעלה את היחס, וזה מקטין את הסכום שאפשר לקבל".
- **Problem:** "the ratio" is introduced in 4.3. The worked example uses `<Later>` correctly; this line does not.
- **Fix:** `<Later lesson="4.3">יחס ההחזר</Later>`.

### 4.1-9 · nit · three typed numbers inside a calculation
- **Where:** the "עיגול" callout (MDX 280): "ממוצע של 8,000 ₪, 8,000 ₪ ו־8,001 ₪ הוא 8,000.333…".
- **Problem:** AUTHORING requires every number from a fact, and no arithmetic in MDX. 8,000.333 is a computed value. It is correct (24,001 ÷ 3).
- **Fix:** an `aff_average` fact, or the real example: 8,150 / 8,200 / 8,250 gives exactly 8,200, so use another triple from a fact.

### 4.1-10 · nit · unclear Hebrew
- MDX 272, item 3: "וה־12 הוא קבוע רק כשהכנסה שנתית". Suggest: "ה־12 מתאים רק להכנסה שנתית; להכנסה אחרת מחלקים במספר החודשים שלה".
- Solution 4.1-7: "ובשיטה שבה הבנק בוחר מתחיל הפער". Suggest: "ככל שההכנסה עולה משנה לשנה, השומה האחרונה והממוצע מתרחקים".
- Exercise 4.1-7 message `err_years`: "השוויתם את החודשי של השומה האחרונה לחודשי של השומה הישנה" is hard to read. Suggest: "חישבתם את ההפרש בין שתי שומות. השאלה היא על ההפרש בין שתי שיטות חישוב".
- Exercise 4.1-6 option feedback: "בפי Mogi" is not Hebrew idiom; write "לפי Mogi".

### 4.1-11 · nit · exercises
- Exercise 7 ("מאתגר") repeats the lesson's own example with new numbers: 102,000 ÷ 12 against 180,000 ÷ 24. Exercises 2 and 3 are the same operation.
- Nothing tests the lesson's thesis, "declared − recognised" for a household, or which line the course counts. Suggest replacing exercise 3 with a household of two people (one payslip, one assessment) asking for the gap.

### 4.1-12 · nit · video
- Cue 5 says "מס ופנסיה"; the frame lists "מס הכנסה, ביטוח לאומי ומס בריאות, פנסיה". Align the cue.
- Frames t098–t128 show "הכנסה מוכרת 15,700" with no hint that Michal's part is שכר נטו.
- The closing frame is fine. The video is 2:31 and the numbers match the facts.

### 4.1-13 · nit · Sources
- Two items cite things the body never says. The Bank of Israel "הבהרות להכרה בהכנסה" item says the document was not opened, but nothing in the body cites it. FK-H-034 is listed but no sentence uses it.
- The payslip anatomy (what each line is, that the employee's pension share is a mandatory deduction) and the meaning of "שומה" have no source row. Add "ידע כלכלי כללי" for both.

---

## 4.2 — התחייבויות והכנסה פנויה

The prediction hits the real edge (17 payments left). The rule table (30 / 19 / 18 / 12) is the best teaching device in the stage. "Same payment, once, in one place" is a good thread. The checker shows where each obligation goes and why. What is left:

### 4.2-1 · must fix · exercise 1 prints the English word "none"
- **Where:** MDX 304. Built page text: "ללווה הלוואה אישית של 1,000 ₪ בחודש, ונשארו לה **none** תשלומים."
- **Problem:** the code is `{f.plain("rule.loan_12")}`, but `rule.loan_12` is a *placement* fact (value `none`), not the number 12. The learner cannot answer the question without the number of payments left.
- **Fix:** add a `given` fact (12) and use it. Re-read the other uses of the `rule.*` facts in the page (MDX 88–91 and 113 use them as placements, correctly).

### 4.2-2 · must fix · the worked example's six steps are one paragraph
- **Where:** MDX 252–257 ("צעד 1 — ליסינג … צעד 6 — ההכנסה הפנויה"). The phone screenshot and the built page show one run-on block.
- **Problem:** the lines have no blank line between them, so Markdown merges them. The steps are the lesson's central calculation and cannot be followed.
- **Fix:** a blank line between steps, as in 4.1, 4.3 and 4.4.

### 4.2-3 · should fix · a rent that ends but still has more than 18 months on the lease
- **Where:** MDX 111–113 and 181; the checker (rent hides "payments left"); the half table (rent "ייגמר" with 9 months).
- **Problem:** the notes give one rule: rent counts even with under 18 months left when the borrower will *not* live in the bought home. The lesson adds the converse: rent that ends because they move in is *not* counted, whatever is left on the lease. A beginner with a 30-month lease who moves in has no answer, and the generic "מעל 18" rule would count it. The bank-form quote used as support ("חוץ משכירות, שנספרת בלי קשר למשך") suggests rent is counted regardless of duration, which is the opposite reading.
- **Fix:** write the extension as a course assumption ("הנחת חישוב: שכר דירה שייגמר כשעוברים לדירה לא נספר, גם אם נשאר זמן בחוזה"), put "שאלה פתוחה לאילון" next to it, and add a row to the rule table.

### 4.2-4 · should fix · "18 exactly" is called open, then used as settled
- **Where:** exercise 4.2-3 (`tolerance={0}`, MDX 335: "…לפי הכלל, ב־18 היא כבר לא ״מעל 18״"); the video frames at 18 ("לא נספרת"); the PredictionReveal.
- **Problem:** the lesson says (MDX 99) that one public form reads "שנה וחצי ומעלה", which may include 18. 4.13 shows that Discount's form does. Yet a graded answer (8, not 9) and a feedback message depend on 18 being excluded.
- **Fix:** ask a question that does not depend on the edge: "אחרי כמה תשלומים נוספים היא בוודאות לא נספרת (נשארו 17)?" (answer 9), or keep the question and open the message with "לפי התעתיק (ב־18 בדיוק — שאלה פתוחה):".

### 4.2-5 · should fix · a bullet nobody can parse
- **Where:** MDX 121, "הכנסה שנרשמה אצל לווה אחד. גם הכנסה וגם התחייבות משויכות ללווה או לכמה לווים, ושני שאלונים ציבוריים מבקשים לא לרשום אותן פעמיים."
- **Fix:** "כל הכנסה וכל התחייבות שייכות ללווה מסוים. לא רושמים אותן פעם אצל אחד ופעם אצל השני (כך מבקשים שניים מהשאלונים הציבוריים)". Add the date and the "לא נבדק" label (X-4).

### 4.2-6 · should fix · phone: the worked table hides its answer column
- **Where:** the Roni and Tamar table (MDX 229–250, `min-w-[30rem]`).
- **Problem:** at 390px the column "נספרת?" is outside the box. That column is the answer of the table.
- **Fix:** shorten "התחייבות / בחודש / נשארו / נספרת?" to fit. Drop `min-w` and write the amounts without ".00".

### 4.2-7 · nit · the checker marks empty example obligations "יורדת מההכנסה"
- **Where:** the screenshot of `PaymentRatioChecker` in 4.2: leasing, alimony and rent at 0 ₪ show the chip "יורדת מההכנסה". The intro says they "start at zero".
- **Fix:** show "ריקה" (or no chip) while the monthly amount is 0.

### 4.2-8 · nit · months and payments
- **Where:** the rule is worded "מעל 18 חודשים" (MDX 77) while the tables, tasks and exercises count payments.
- **Fix:** one clause: "תשלום חודשי, ולכן 18 חודשים הם 18 תשלומים".

### 4.2-9 · nit · the spreadsheet callout does not say which column is which
- **Where:** `=SUMIF(C2:C6,">18",B2:B6)` (MDX 202).
- **Fix:** "B — התשלום החודשי, C — כמה תשלומים נשארו". In this course C also means a payment in formulas, which stage 3's X-3 already noted.

### 4.2-10 · nit · small items
- Exercise 6 message `err_rent` types "7 חודשים"; the fact `ex6.rent_months` exists.
- The 18-month rule and the rent exception are marked "Mogi" in the body without who: "(החלטה של Mogi, 2026-10-07)". Add "אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08", as 4.1 and 4.3 do.

---

## 4.3 — יחס החזר

The "which payment goes in" section, the same-property table and the Avi and Michal ladder (32.22% to 40.57%) make the lesson. The checker works. Almost everything I recomputed matches. What is left:

### 4.3-1 · must fix · an internal ticket dispute, with ticket numbers, page numbers and the names of agents
- **Where:** MDX 84, "זו סתירה שמצאנו בין שני מקורות של Mogi. בתיאור של משימת ENG-223 (2026-10-02) … בדף ההחלטה … (Brain 67436545, …)"; MDX 97, "לפי מחקר של Eden ושל Claude בתוך ENG-223"; MDX 105 ("ותיקון של עדן מ־2026-10-08"); MDX 133 ("דף 67436545"); MDX 467 (summary: "הסתירה בין ENG-223 לדף ההחלטה נפתרה").
- **Problem:** AUTHORING forbids IDs in the body; the brief says to cite the Brain only through the note and only in Sources. Beyond that, the learner has never heard of ENG-223, Eden or Claude, and a dispute between two internal drafts is not course content. It also forces a beginner to follow a side argument in the middle of the key rule.
- **Fix:** keep what the learner needs: "יש שתי דרכים לשלב התחייבות, והן נותנות 33.33% או 40%. הצוות החליט (אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08): התחייבות יורדת מההכנסה; רק משכנתא על אותו נכס מתווספת לתשלום." Move the draft-versus-page story to the Sources item (it is already there, MDX 487). Replace "מחקר של Eden ושל Claude" with "מחקר של צוות Mogi, לא אומת". See X-2 for the whole list.

### 4.3-2 · must fix · "לפני הכלל" states a practice no source gives
- **Where:** MDX 121, the table row "לא סופרים אותה (לפני הכלל)"; step 6 "מה היה בלי הכלל" is a legitimate hypothetical.
- **Problem:** the row says that before 1.10.2026 a same-property mortgage was not counted at all. Nothing in the notes says how it was treated before. For a mortgage on another property the Brain says it is deducted from income. A learner will repeat the row as history.
- **Fix:** "אילו לא סופרים אותה כלל (חישוב להמחשה)". Do not use "לפני" unless a source states the previous treatment.

### 4.3-3 · should fix · the grace example hides the 288-month step
- **Where:** MDX 91, "בגרייס משלמים 3,750.00, ואחריו 5,684.25"; exercise 4.3-2; video cue 11.
- **Problem:** 5,684.25 is a Spitzer payment on 1,000,000 at 4.5% over **288** months (24 years, grace inside the term). A learner who recomputes from the lesson's "25 years" uses 300 months and gets 5,558.32, a difference of 125.93. The lesson never says 24 years remain, and 3.4 teaches the Mogi default that grace is inside the term.
- **Fix:** one sentence: "אחרי 12 חודשי גרייס נשארו 24 שנים (288 חודשים): שפיצר על כל המיליון". Add "אם החוזה מוסיף את הגרייס לתקופה — 300 חודשים".

### 4.3-4 · should fix · the video states Bank of Israel rules with no label
- **Where:** `4-3.he.vtt` cues 9–17 and the frames.
- **Problem:** 4.4 and 4.5 end their video with "לפי תעתיק של הצוות · לא אומת". 4.3's final frame says only "הריביות הן הנחת קורס". The video presents "grace: after", "bullet: monthly interest" and "אותו נכס: 26.3%" as fixed rules. All of it comes from a transcription that was not verified.
- **Fix:** add the same closing label to the last frame and to cue 13: "הכללים לפי תעתיק של הצוות; לא אומת. כלל ״אותו נכס״ — מ־1.10.2026, לא אומת".

### 4.3-5 · should fix · a term nobody taught, and earlier terms without a reminder
- **Where:** MDX 101: "(תוספת, או מחזור חלקי)"; MDX 91–92: "גרייס", "בוליט ובלון".
- **Problem:** "מחזור חלקי" appears in no earlier lesson (1.5 teaches refinancing, internal and external). "גרייס", "בוליט" and "בלון" are used at first meeting in this lesson without `<Term>` (AUTHORING: first use of an earlier lesson's term gets `<Term>`).
- **Fix:** define "מחזור חלקי" in one clause (a refinance of part of the loan) or use `<Later lesson="7.1">` and rephrase. Add `<Term t="גרייס" lesson="2.10">`, `<Term t="בוליט">`, `<Term t="בלון">`.

### 4.3-6 · should fix · phone: two tables hide the numbers
- **Where:** the same-property table (MDX 112–127) and the Avi and Michal table (MDX 144–160), both `min-w-[30rem]`.
- **Problem:** at 390px the first table shows only its label column (and even that is cut), so none of the four ratios is visible. The second shows the label and cuts "הכנסה בחודש" and "יחס ההחזר", so the 32.22% to 40.57% ladder is invisible. The paragraphs below repeat the figures, but the table is what the learner sees.
- **Fix:** drop `min-w` and `whitespace-nowrap`; put the number column first (right), then a short label; keep the label under 20 characters ("על אותו נכס", "על נכס אחר", "לא נספרת", "15 תשלומים").

### 4.3-7 · should fix · the half-solved table overflows its box on a phone, and its data sits above it
- **Where:** MDX 290–311; this is the `qa:browser` finding.
- **Why it overflows:** five columns (משפחה plus four numbers). The table is 322px wide inside a 317px content area (box 341, scrollWidth 346), because three cells show "20,000.00 ₪"-width values with `whitespace-nowrap` and the inputs are at least 56px. It is the only FillTable of the five that does so.
- **Second problem:** the four families' data are in bullets above the table, so on a phone the learner scrolls up and down to fill a cell.
- **Fix:** drop the column "הכנסה מוכרת" (the bullets give it) so the table has three numbers, or put the obligation and payment inside the table.

### 4.3-8 · should fix · exercise 6 is a lookup
- **Where:** 4.3-6 (MDX 410–429): "אבי ומיכל משלמים 6,186.17 … שומה אחרונה בלבד … מה היחס?" The answer, 38.19%, is printed in the lesson table (MDX 155) and in task 2.
- **Fix:** change the inputs (another tax-year pair, or ask for the gap between two methods), or relabel it קל.

### 4.3-9 · should fix · a negative stated as a fact about the regulator
- **Where:** MDX 97, "והמפקח לא מפרסם דוגמה מחושבת של היחס, ולכן יש מקום לטעות בפרטים".
- **Problem:** the notes say the Supervisor's Q&A file for Directive 329, which may hold worked examples, "was not read". "Not found" is what is known, not "not published".
- **Fix:** "לא מצאנו דוגמה מחושבת (קובץ השאלות והתשובות של הפיקוח לא נקרא)".

### 4.3-10 · nit · overlaps and house rules
- Exercises 2 and 3 are the same conceptual question (which payment enters) and the correct option of 3 is the longest.
- Four guided tasks (AUTHORING says 2–3).
- Sources: a typo, "אחד היחס לכולם" (should be "יחס אחד לכולם"); and the file path `scripts/case_sketch.py` shown to learners (X-8).

---

## 4.4 — הוראה 329

A clean "five lines, four of them bans" frame, with the rounding callout for two thirds. The checker is clear. Every number matches. What is left:

### 4.4-1 · should fix · the reduced-price example reads like a 96% loan
- **Where:** MDX 100–104 (price 1,400,000, appraisal 1,800,000, equity 50,000 against 350,000); exercise 4.4-6 (price 1,200,000, appraisal 1,500,000, equity 75,000).
- **Problem:** the numbers show a buyer paying 3.6% (and 6.25%) of the price in equity. The lesson says the ceiling was not found and "the bank may", but a beginner reads it as a rule: "אפשר לקנות ב־4% הון". The appraisal is also 29% and 25% above the price, with no reason given.
- **Fix:** use a smaller gap (for example price 1,400,000, appraisal 1,500,000) and add one sentence: "בפועל גם תנאי התוכנית עצמה והיכולת של הלווים מגבילים; הדוגמה מראה רק את הקו".

### 4.4-2 · should fix · "red lines" for five lines when one is not a ban
- **Where:** the video title "חמשת הקווים האדומים" (the map's wording, kept) and `4-4.he.vtt` cue 2 ("לבנק אסור לחצות את רובם").
- **Problem:** the lesson's own point is that line 3 (40%) is *not* a ban, and 4.5 is built on it.
- **Fix:** "חמשת הקווים של הוראה 329"; cue 2: "ארבעה מהם איסור; אחד — קו הון". The map title would change too; the map is shared (coordinator).

### 4.4-3 · should fix · the formula box uses p and P, c and C
- **Where:** MDX 201–214: `P_max = V × c ÷ 100`, `C_max = הכנסה פנויה × p ÷ 100`, "P × 2 ÷ 3".
- **Problem:** the box defines P (the loan) and p (a line) side by side, and C (a payment) and c (a ceiling). The lesson itself says c is chosen "כדי לא לבלבל עם C", yet p and P collide in the same box. A beginner who skims reads "P ÷ 100" for the wrong quantity. AUTHORING: one table for the whole course. Neither c nor p is in the table.
- **Fix:** write the two new quantities in words ("התקרה", "הקו") inside the formulas, or use two clearly different letters. Add the chosen letters to AUTHORING's table (coordinator; shared file).

### 4.4-4 · should fix · two flat statements that rest on unverified summaries
- **Where:** the last sentence of the PredictionReveal (MDX 244): "הכלל נשמר, ובפריים אין היום מגבלה נפרדת"; the five questions (MDX 439): "הם זהים בכל הבנקים — ולכן פנייה לבנק אחר לא תעקוף אותם".
- **Problem:** the cancellation of the prime cap (December 2020) comes from a search summary. The lesson says so in the body (MDX 134) and in Sources, but the reveal and the summary card drop the label.
- **Fix:** "לפי התקצירים (לא אומת)". The same in the exercise 4.4-1 option text.

### 4.4-5 · nit · unclear Hebrew
- MDX 89: "ההלוואה, חלקי שווי הנכס, לא עוברת תקרה שתלויה בסוג העסקה". Suggest: "שיעור המימון (ההלוואה חלקי שווי הנכס) לא יכול לעבור תקרה, והתקרה תלויה בסוג העסקה".
- MDX 114: "מה שמשתנה הוא החשבון הפנימי של הבנק". Suggest: "מה שמשתנה הוא כמה הון הבנק צריך להחזיק כנגד ההלוואה".
- 4.4 uses "הון" (bank capital) before 4.5 defines it; one clause pointing to 4.5 would help.

### 4.4-6 · nit · typed numbers and a warning colour
- **Where:** the callout "ליד קו, מעגלים כלפי מטה" (MDX 227–230): "666,666.666…" and "666,666.67" are typed. Every number should come from a fact; `r.max_var` already has 666,666.66. The callout is `tone="warning"`; it is a rounding rule, not a warning.
- **Fix:** facts for both, and `tone="info"`.

### 4.4-7 · nit · the worked example ends without the final fix
- **Where:** MDX 277–280, step 6.
- **Problem:** the learner is shown that taking the cut from the fixed part makes the variable excess grow (66,666.67). The last move that fixes both lines is not stated.
- **Fix:** "אחרי שההלוואה ירדה ל־1,400,000: מעבירים לפחות 66,666.67 ממשתנה לקבועה, כך שהמשתנה לא עולה על 933,333.33".

### 4.4-8 · nit · the checker's inputs are not linked, and task 2 is vague
- **Where:** `RegulationChecker`: moving the loan does not move the payment (set separately); lesson step 6 says "מחשבים את ההחזר מחדש (שלב 3)" ("שלב 3" can be read as step 3 of this lesson). Task 2: "החזירו את החלק המשתנה לקו" gives no number.
- **Fix:** one line above the checker: "הבודק לא מחשב את ההחזר מההלוואה; מזיזים כל מחוון בנפרד". In task 2 write "ל־800,000". Replace "(שלב 3)" with "(שיעור 3.1)".

### 4.4-9 · nit · video and date details
- The first frame says "נכון ל־2026-10-09" and the last "Brain, 2026-10-08": two dates for the same source, and a bare "Brain" the learner does not know. Use one date.
- On the video's "קו הון" frame: "קו הון" is used before 4.5 explains the term; fine, but it needs the one clause of 4.4-5.

### 4.4-10 · nit · wording and code
- Heading "חמשה מספרים לזכור" → "חמישה מספרים לזכור" (as in "חמישה קווים").
- Exercise 4.4-6 message for `ex6.quarter` is built with `f.plain("ex6.quarter") ? "רבע" : ""`, a typed word hidden in code; use the fact's meaning ("25% מהשווי").

### 4.4-11 · nit · the half table accepts the rounding the lesson forbids
- **Where:** `FillTable 4.4-half` tolerates 0.02, so 666,666.67 is accepted although the lesson says "round down". Either keep the tolerance and add a sentence, or note in `success` that 666,666.67 is slightly over.

### 4.4-12 · nit · Sources
- The "החלטה של Mogi" row (2026-08-03, per-track term) also contains "ולכן הקו של התקופה נבדק על המסלול הארוך". That is a course inference, not part of the decision. Move it to "הנחת חישוב".
- "Latest version found: 12, February 2026" (MDX 81) and 4.3's "חוזר 2852 מ־30.6.2026" can leave the learner wondering whether 4.4's lines already include the circular. One clause ("ייתכן שהקווים כאן קודמים לחוזר") settles it.

---

## 4.5 — שלושה סוגי מספרים

The three questions ("who set it, what happens if you cross it, is it the same in all banks") are the right tool. The ladder and the case table are clear. The lesson is honest about what is unknown. What is left:

### 4.5-1 · should fix · "אין בעיה בשום בנק" contradicts the lesson's own warning
- **Where:** MDX 309 (case א׳: "אין בעיה בשום בנק"), video cue 4 ("אין בעיה בשום בנק"); exercise 4.5-7 and the callout "תקרה היא מקסימום, לא הבטחה" say the opposite.
- **Problem:** 31.25% is below every line, but a bank may still refuse for underwriting reasons. The lesson teaches exactly that three screens later.
- **Fix:** "אין בעיה מצד הקווים האלה" (lesson) and cue 4: "מתחת לכל הקווים. הקווים לא מונעים אישור".

### 4.5-2 · should fix · the reveal note for one wrong option confirms half of it
- **Where:** PredictionReveal `notes[2]` (MDX 249), for the option "המשפט נכון, אבל האיסור הוא רק מעל 50%": "45% הוא מתחת ל־50%, ולכן בנק ישראל לא אוסר…".
- **Problem:** the note agrees with the second half of the option (the ban is above 50%) and never says why the first half, "המשפט נכון", is wrong. The learner may think the option was nearly right.
- **Fix:** "האיסור אכן מעל 50%. אבל המשפט ״בנק ישראל לא מרשה מעל 40%״ אינו נכון, ולכן האפשרות הזו שגויה".

### 4.5-3 · should fix · phone: the three-kinds table hides its third question
- **Where:** MDX 83–114 (four columns, `min-w-[34rem]`); also the case table (MDX 285–306).
- **Problem:** at 390px the column "זהה בכל הבנקים?" is out of the box, and the column "מה קורה כשחוצים" is cut mid-sentence. The lesson builds on those three questions. In the case table "מה נחצה" is cut.
- **Fix:** stack the three kinds as three small cards (name, who set it, what happens, same in all banks) instead of a four-column table.

### 4.5-4 · should fix · "משקל סיכון 100%" is not explained
- **Where:** MDX 136–138, and `<Term t="סף הון">משקל סיכון</Term>`.
- **Problem:** the learner is told a loan above 40% is "counted at a risk weight of 100%" and has no way to interpret the number. 100% of what, and against what? The Term popover for "משקל סיכון" shows the definition of "סף הון". The sentence "ככל שהוא גבוה יותר, צריך יותר הון" helps, but the 100% stays abstract. The lesson itself says the weight below the line is unknown.
- **Fix:** "100% — ההלוואה נספרת במלוא סכומה בחשבון ההון של הבנק. מתחת לקו המשקל נמוך יותר; כמה — לא ידוע לנו". Give "משקל סיכון" its own definition in `4-5.json`.

### 4.5-5 · nit · "no bank-policy line was found" sits beside three
- **Where:** MDX 163 ("אף קו של מדיניות בנק … לא נמצא בשום מסמך שקראנו") directly under FK-H-012 (banks tighten to 40%), the form minimum terms and Tovi's tiers.
- **Fix:** "לא נמצא קו של מדיניות בנק שפורסם", then the three items as unverified claims.

### 4.5-6 · nit · "מתחת ל־8,000" for a limit that allows 8,000
- **Where:** MDX 312 (loan ד׳: "כדי לרדת מתחת ל־8,000"), the half-table intro ("מתחת למגבלה, מתחת לסף ההון").
- **Problem:** "exceeds" means exactly 50% is allowed; the lesson itself says so (step 4 and the formula box).
- **Fix:** "כדי לרדת ל־8,000 או פחות"; "עד המגבלה".

### 4.5-7 · nit · exercise wording
- 4.5-3: the correct option is the longest and most polished; make the four options similar in length.
- 4.5-7: the feedback of the last option ends with "וזו גם לא הנקודה כאן", which does not say anything the learner can use.

### 4.5-8 · nit · field knowledge in the body without its ID
- The FK-H-012 statement (MDX 160) and Tovi's tiers (MDX 143) carry who, when and "ממתין לאישור אילון" but no FK id in the body; the ids are in Sources only. Add "(FK-H-012)" and "(FK-H-004)" next to the sentences, as 4.1 does for FK-H-014/015.

---

## Cross-lesson items

**What agrees, and needs nothing:**
- the 18-month rule ("מעל 18") is the same in 4.2, 4.3, 4.4 callout, 4.10, 4.13 and 4.15, and 4.13 shows the exact "18 exactly" difference between two forms that 4.2 lists as open;
- the same-property rule is dated 1.10.2026 in 4.3 and 4.14, always "לא אומת", and the other two summaries do not contradict it;
- which payment enters the ratio is the same in 2.10, 3.8, 4.3, and the 4.4 callout (first payment; after grace; monthly interest for bullet and balloon; never the forecast maximum);
- the limits are the same everywhere: 75/70/50, any purpose 50, ratio 50 with "עולה על", 40 as a capital line, two thirds variable, 30 years;
- Avi and Michal carry the same numbers into 4.1, 4.2, 4.3 and 4.8 (7,500 and 8,200; 15,700; 6,186.17; 39.40%);
- Mogi decisions carry "אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08" in 4.1 and 4.3; "אילון, 2026-08-03" in 4.4;
- there is no "עובדה מאומתת" in the five lessons;
- nothing from a bank's form, a directive or the Brain is labelled verified: all are "לא אומת" or "ידע מהשטח / ממתין לאישור אילון";
- the three kinds of number (limit, capital line, bank policy) are kept apart already in 4.3 and 4.4, before 4.5.

### X-1 · should fix · the headline example: net or net-to-pay, and a rationale that fails on the lesson's own numbers
- **Where:** 4.1 callout (MDX 130–134); 4.1 worked example "נשתמש בשכר נטו"; 4.2 MDX 131 ("אם היינו סופרים את הנטו לתשלום … ושוב ההלוואה כבר מנוכה"); 4.3 prediction and table (15,700 against 15,250); 4.8.
- **Problem 1:** the Mogi spec chooses שכר נטו "because net-to-pay already subtracts the employer loan, which will be tested as an obligation (double count)". In the course's own case, Michal's employer loan has **10 months left**, so under the 18-month rule (4.2) it is *not* counted at all. Under שכר נטו the bank ignores the 450 ₪ that never reaches her account. The double-count reasoning applies only to a loan with more than 18 months left. 4.2 never says so. The reader may infer that the two bases give the same answer, which is true only in exercise 4.2-5.
- **Problem 2:** 4.1 says "הקורס לא מכריע, ובתרגילים כתוב בכל פעם באיזה מהם משתמשים", but 4.2 and 4.3 use Michal's 8,200 (net) with no basis written next to it, and the 4.1 worked example chooses net outright. Only the 4.3 table row and 4.2-5 name a basis.
- **Fix:** in 4.2 (Michal's paragraph): "שימו לב: ההלוואה של מיכל נשארו לה 10 תשלומים, ולכן היא לא נספרת בכלל. בשכר נטו הבנק לא רואה את ה־450 ₪ האלה, ובנטו לתשלום הוא כן רואה אותם. זה בדיוק ההבדל בין שתי הגישות". Write "(שכר נטו)" next to every use of Michal's 8,200 (4.2 line 131, 4.3 prediction and the checker intro). Put the question in the Eylon list.

### X-2 · must fix · internal IDs, ticket numbers and names in body text
AUTHORING and the brief put these in Sources only. Complete list in the body (outside `<Sources>`):

| Lesson | Line | What |
|---|---|---|
| 4.1 | 97 | "Brain 43384833, 2026-10-02" |
| 4.1 | 131 | "Brain 43384833, דביר, 2026-10-02" (callout) |
| 4.2 | 77 | "בתעתיק בצוות ב־Brain, דף 67436545" |
| 4.3 | 84 | "ENG-223 (2026-10-02)" and "Brain 67436545" |
| 4.3 | 97 | "Eden ושל Claude בתוך ENG-223" |
| 4.3 | 105 | "תיקון של עדן מ־2026-10-08" |
| 4.3 | 133 | "דף 67436545" |
| 4.3 | 467 | "ENG-223" (summary) |
| 4.4 | 149 | "Brain, דף 7634954" |
| 4.5 | 142 | "דף 7503881" |

The bare word "Brain" appears in the body as well (4.4 MDX 81, 4.5 MDX 138 and 142), and the learner is never told what it is.

**Fix:** keep the sentences and drop the IDs. Use "לפי המפרט הפנימי של Mogi לגרסה 1 (דביר, 2026-10-02)" and "לפי תעתיק של הצוות (לא אומת)", and "the team's records" for "Brain". Move every ID to the closing MDX comment.

### X-3 · should fix · the 40% line is attributed to two different directives
- **Where:** 4.4 body, the checker and the video ("הוראה 329 … הקו השלישי"); 4.5 `ThreeKindsLadder` ("הוראה 329, מעל 40%"); 4.6, 4.10 and 4.12 say the same; against the 4.5 Sources item ("מכוח הוראה 203"), and `official-sources.md` ("100% risk weight under Directive 203 … a capital rule, not a ban").
- **Problem:** the Brain page records it under 329 §6, the search summaries under Directive 203. The body never says the source is uncertain, so a learner will quote "329" for the 40%.
- **Fix:** in 4.4 and 4.5: "קו ההון: לפי התעתיק הוא בהוראה 329; לפי תקצירים — מכוח הוראה אחרת על הון (203). לא אומת." Do the same in the component caption. The two sources should agree before 4.6, 4.10 and 4.12 are final.

### X-4 · should fix · bank-form claims without their date and label in the text
- **Where:**
  - the 4.1 table column "מה אפשר לראות בשאלונים הציבוריים" (no caption);
  - the 4.2 quotes ("שנה וחצי ומעלה", "חוץ משכירות…") and the rent exception;
  - the 4.3 "גרירה" quote ("אסגור · אגרור · אשאיר"), which has a date only in Sources;
  - the 4.5 minimum terms (5, 4 and 12 months), with no date even in Sources.
- **Problem:** AUTHORING: "כפי שתועד בריפו של הצוות ב־<תאריך>; לא נבדק מחדש מול האתר של הבנק". It is present once per lesson but not beside every quote.
- **Fix:** add the sentence to the 4.1 table caption, once more in 4.2 and 4.3, and add "(2026-08-25)" to 4.5's text and Sources item.

### X-5 · nit · `research/eylon-list.md` has no stage-4 section
Stage 4 uses FK-H-012 (4.5, and 4.6, 4.7, 4.10), FK-H-013 (4.2), FK-H-014 and FK-H-015 (4.1, 4.8), FK-H-034 (4.1), FK-H-004 and FK-H-007 (4.5). Add them, and the Mogi decisions: DEC-3 for 4.1–4.3, DEC-2 for 4.4. Note that the existing FK-H-012 row quotes only half of the record (the 50%/40% sentence is missing). Questions the lessons themselves raise for Eylon, to be listed:
1. net or net-to-pay, and bonuses and one-off payments (X-1, 4.1-3);
2. which method for the self-employed (last assessment or an average) and how many years;
3. "18 exactly" and the date on which months are counted;
4. a rent that ends with more than 18 months left (4.2-3);
5. whether 40% is a bank policy, a capital line, or both, and in which directive (X-3);
6. the minimum terms per form.

### X-6 · nit · letters
4.4 adds c and p (plus a "max" subscript) and AUTHORING's table has neither. Coordinator: add them or replace them (4.4-3).

### X-7 · nit · guided tasks
4.2 and 4.3 have four guided tasks each; AUTHORING says 2–3. Fold the last into the previous one.

### X-8 · nit · file and repo paths shown to learners in Sources
"דרך research/notes/brain-calculation.md" (all five), "scripts/case_sketch.py" (4.3), "context/inputs" (4.5), "h2852.pdf" (4.2). They belong in the closing comment. This continues stage 3's X-5.

### X-9 · nit · the December 2025 relief
4.14 (MDX 223) writes that the any-purpose relief "נקבעה לצמיתות" (with the label "לא אומת" above it) while 4.4 says two summaries describe it differently and the course does not use it. Make 4.14 say "מתוארת בשני תקצירים בשתי דרכים".

### X-10 · nit · a name used for a different person
4.1 exercise 2 ("דנה") reuses a name from 0.2, 1.1 and 3.2–3.3 for another person (stage 3's X-6).

---

## Count

6 must fix, 27 should fix, 30 nit.

**The most important items, in the order I would fix them:**
1. **4.2-1 and 4.2-2:** exercise 1 prints "none" instead of 12 (the wrong fact id), and the worked example's six steps render as one paragraph.
2. **X-2 and 4.3-1:** ticket numbers, Brain page numbers and the names "Eden" and "Claude" in the body text of four lessons, plus an internal dispute between two drafts told in the middle of the key rule.
3. **4.1-1 and 4.3-2:** two statements no source gives: "self-employed recognised income is usually below what they feel they earn", and "before the same-property rule it was not counted".
4. **X-1:** the net or net-to-pay example. Michal's loan has 10 months left, so under the course's own rule the spec's "double count" reason does not apply, and Michal's 8,200 appears without a basis in 4.2 and 4.3.
5. **X-3:** the 40% capital line is attributed to Directive 329 in 4.4 and 4.5's component, and to Directive 203 in 4.5's own Sources.
6. **4.3-3:** the grace payment 5,684.25 is a 288-month payment; the text never says 24 years remain. A learner using 25 years gets 5,558.32.
7. **4.2-3 and 4.2-4:** the rent that ends (more than 18 months left) is an extension no source gives, and "18 exactly" is called open and then graded as settled.
8. **4.5-1 and 4.4-2:** "no problem in any bank" against the lesson's own warning, and "red lines" for five lines when one is not a ban.
9. **Phone:** 4.1-6, 4.2-6, 4.3-6 and 4.5-3, where tables push out the column the text talks about; and 4.3-7, the FillTable that overflows by 5 px because of its five columns.
10. **4.4-1 and 4.4-3:** a reduced-price example that reads like a 96% loan, and p and P, c and C in one formula box.
