# Stage 4 beginner review: lessons 4.6–4.10

Date: 2026-10-12

First-round QA of lessons 4.6–4.10. I read them as a beginner who finished stages 0–3 and lessons 4.1–4.5 (recognised income, obligations and the 18-month rule, the payment-to-income ratio, directive 329 and its limits, the three kinds of number) and now meets the family budget, underwriting, credit data and account conduct, the collateral, and the first factor cards. I edited no file except this report, and I ran no git command and no build.

**What I read**
- The built text of `dist/lessons/4-6/` … `4-10/` (extracted, so I saw what the learner sees, components included).
- The MDX `src/pages/lessons/4-6.mdx` … `4-10.mdx`, including every exercise's `errors` and every FillTable config. Line numbers below are MDX lines unless I say "card line" (`src/data/factor-cards.ts`).
- The data `data/lessons/4-6.json` … `4-10.json` (every fact), and the definitions `src/data/definitions/4-6.json` … `4-10.json`.
- The components the lessons use: `FamilyBudget`, `VerifiedGap`, `StatementReader`, `AppraisalGap`, `FactorCards`, `FillTable`, `BigPictureMap`, plus `src/lib/factor-cards-view.ts` and the stage-4 map data `src/components/big-picture/stage-4.ts`.
- The subtitles `public/video/4-6.he.vtt` … `4-10.he.vtt` and all key frames `qa/video/4-{6..10}-t*.png` (as contact sheets, plus the single frames I questioned).
- The phone screenshots `qa/screens/phone_lessons_4-{6..10}_.png` (cut into 1,500px strips). Because the strips cannot say *why* a table is wide, I also served `dist/` locally and measured every table at 390px with Playwright (script in the session scratchpad, not in the project).
- `course/AUTHORING.md` (I checked every rule), `course/stage-4-brief.md`, `course/course-map.md` (stage 4, sections 4 and 8), `research/eylon-list.md`, `research/source-map.md` section 3.1, `research/field-knowledge.md` (FK-H-004/005/012/014/015/018/029/030/033/034/036/044/045/046/048/051), `research/notes/*.md` where a claim needed its source, and the read-only bank questionnaires in `/home/user/edea-mortgage/context/inputs/`.
- Lessons 4.1–4.5 and 4.11–4.15 for contradictions (4.2, 4.3, 4.4, 4.5 in detail; 4.11, 4.13, 4.15 by search).
- The format of `qa-reports/stage-3-review-3.7-3.12.md`.

**Which cards 4.10 shows.** The brief says "cards 1–13 are shown in 4.10". They are not: `cardsFor("4.10")` returns nine cards, numbers 1, 3, 6, 7, 8, 9, 13, 14, 15 (the "client" group), and 4.11 shows the other thirteen. The lesson says "nine" everywhere, so the lesson is consistent; the brief's wording is not. I reviewed the nine. I also read cards 2, 4, 5, 10, 11 and 12 (4.11's) for sources, invented numbers and the price-versus-appraisal contradiction, and list the findings under X.

**How I checked the math.** I recomputed every displayed number independently in plain Python `Decimal` (precision 50), with my own code: Spitzer payments per track and for the mix; the largest loan under a payment-to-income cap (both by the per-shekel shortcut and by stepping the loan up in 1,000 ₪ steps with per-track rounding); the shortfall percentages; every ratio; the family-budget figures; the statement table; the appraisal and ceiling figures; balances at 60/120/240 payments and the first month under 30,000 ₪; every date, weekday and day count; the card examples. Every displayed number, exercise answer and listed error matches the data, with the exceptions below:
- the 4.9 balance table and its exercises use the unrounded closed-form balance, not the statement convention the other tables use (4.9-10);
- two printed percentages in 4.7 use different precision (4.7-12);
- the guided-task answers in 4.7 do not match what the component shows (4.7-3). This one is a text error, not an arithmetic error.

Items have an id, a severity (**must fix** / **should fix** / **nit**), the exact place, the problem and a concrete fix.

---

## Lesson 4.6: תקציב מחיה סביר

**Spot checks that passed.**
- **The family.** Net 19,000, mortgage 6,600, car 1,200 → 11,200 left, 2,800 per person; budget 11,800 → 600 short; the largest payment the budget allows is 6,000 (600 less than asked). After 10 months: 12,400, 600 above the budget. Ratio 6,600 ÷ 19,000 = 34.74%; 50% → 9,500, 40% → 7,600, 60% → 11,400.
- **Small numbers.** 10,000 − 4,000 − 1,000 = 5,000; the two households 16,000 − 6,400 = 9,600 → 4,800 and 1,920 per person.
- **Exercises.** 8,000 (errors 9,000, 13,000, 5,000); 3,000 (error 4,500, 9,000); 600 (errors 8,000, 8,600); 6,500 (errors 8,000, 18,500); the ceilings 10,000 and 8,000 in exercise 7. The half table: 9,000 / 3,000, 10,000 / 2,500, 12,000 / 4,000. All match.
- **The rules.** The lesson says plainly that no source defines a "reasonable" living budget, and that the course invents none. The 50% and 40% are labelled in the component caption and in the sources. Eylon's 60% is marked as field knowledge awaiting him, with the contradiction noted. No real bank name. Case A is absent. The 18-month rule is used the way 4.2 teaches it, and the component follows it (24 months → the loan is deducted, the ratio moves, "what is left" does not).

**4.6-1 · should fix · lines 235 and 237, the video, the video's "מה הבנק רואה" scene**
- **Quote:** step 1 "ההכנסה הפנויה, כמו בבנק"; step 2 "לפי הבנק — הכול בסדר"; video cue 8 "הכנסה פנויה לפי הבנק", cue 10 "לפי הבנק, הכול בסדר"; the scene is titled "מה הבנק רואה" (frames `4-6-t090` and `t098`).
- **Problem:** the lesson itself says (lines 123 and 221) that bank policy "לרוב לא ידועה". "לפי הבנק הכול בסדר" reads as a verdict from the bank. All that is true is that the two regulatory lines are not crossed. A beginner who watches the video first will repeat "the bank says fine".
- **Fix:** "לפי הקווים של ההוראה — הכול בסדר. מה הבנק עצמו יחליט — לא ידוע." Video cue 10: "מתחת לשני הקווים." Scene title: "מה היחס רואה". Step 1: "ההכנסה הפנויה לפי כלל 18 החודשים".

**4.6-2 · should fix · line 151**
- **Quote:** "ואחר כך הוסיפו שני נפשות".
- **Problem:** נפש is feminine: "שתי נפשות".
- **Fix:** "הוסיפו שתי נפשות".

**4.6-3 · should fix · line 109**
- **Quote:** "וילדים נשאלים גם בנפרד על גיל וחזקה".
- **Problem:** "חזקה" is the exponent for this learner (defined in 0.3, used in 0.4 and 0.12). Here it means custody (Poalim's form asks "האם הילדים בחזקתך"). The beginner stops and wonders what a power has to do with children.
- **Fix:** "וגם על גיל כל ילד ועל אצל מי הוא גר (חזקה)", or drop the word.

**4.6-4 · should fix · line 80**
- **Quote:** "הכנסה פנויה של 16,000, בשני משקי בית … נשאר לכל אחד 16,000 − 6,400 = 9,600".
- **Problem:** the lesson has just defined "what is left" as net income minus all payments (line 70). Here it subtracts the payment from the disposable income and never says there are no other payments. A beginner who has just learned that disposable income and net income differ will think the formula changed.
- **Fix:** "הכנסה נטו של 16,000, בלי הלוואות אחרות (ולכן גם ההכנסה הפנויה 16,000)".

**4.6-5 · should fix · the half-solved table (lines 255–269), phone**
- Five columns of nowrap amounts with agorot do not fit 341px: the box scrolls 343 against 341, and the left-most column "לנפש" touches the screen edge. See X-1 for the cause and the fix.

**4.6-6 · nit · lines 72, 96 and 122, 110**
- Line 72: "לא ״הוצאות קבועות״ כמו בטפסים של הבנקים. שם הכוונה להתחייבויות" describes bank forms with no label. 4.2 has the source (a questionnaire: "שנה וחצי ומעלה"). Add "(לא אומת; שיעור 4.2)".
- Lines 96 and 122: "אסור לעבור" for the 50% has no "(לא אומת)" in the body. It is only in the component caption and the sources.
- Line 110: "והוא בבדיקה" is vague. Say what the check is: "והוא סותר בחלקו את התעתיק (שיעור 4.5)".

**4.6-7 · nit · step 6 (line 245)**
- **Quote:** "או להקטין את ההחזר בינתיים".
- **Problem:** a beginner cannot lower a mortgage payment "for now" without grace (3.4). The next sentence offers a longer term. "בינתיים" promises something the lessons never showed.
- **Fix:** "או לבקש מההתחלה החזר נמוך יותר: תקופה ארוכה יותר (שיעור 3.1), או הלוואה קטנה יותר". Optionally name how long the shortfall lasts times the monthly gap: 10 × 600 = 6,000 (needs a fact).

**4.6-8 · nit · lines 221 and 375**
- Line 221: "מדיניות; לרוב לא ידוע" says "mostly unknown", i.e. sometimes known. Write "לא ידוע לנו".
- Line 375: "של משכנתא שתוכל לשלם" should be "שהיא תוכל לשלם".

**4.6-9 · nit · exercises and video**
- The correct answer is the first option in all three ChoiceExercises (4.6-1, -5, -7). Nothing shuffles. Move one or two.
- The video draws the regulatory limit as a red bar (frames `t108`, `t131`, `t143`). AUTHORING: never status colours for series; use the validated pair and N300.

---

## Lesson 4.7: חיתום: איך הבנק בודק

**Spot checks that passed.**
- **Case B.** Incomes 11,000 + 8,200 = 19,200 declared and 7,500 + 8,200 = 15,700 verified; gap 3,500 = 18.23% of the household and 31.82% of Avi's. Track payments 3,172.61 + 3,013.56 = 6,186.17; ratios 32.22% (matches the map's 32.2%) and 39.4%; financing ratio 68.5% (matches the map).
- **The loan table.** The largest loans, rounded down to 1,000: 1,753,000 / 1,433,000 (50%), 1,402,000 / 1,147,000 (40%), 1,227,000 / 1,003,000 (35%). Both by the per-shekel shortcut and by stepping the loan with per-track rounding. The drop of 18.19%; equity needed 647,000 (35%); 127,000 short.
- **Exercises.** 31.82 (errors 46.67, 68.18, 3,500); 39.4 (errors 32.22, 15,700); with equity 480,000 the new loan is 1,170,000 and the payment 6,405.15 (3,284.91 + 3,120.24; +218.98), ratio 40.8% on 15,700; the 35% loan 1,003,000. Dates: window end 19 Nov (24 days from Mon 26 Oct); documents day 9; finished day 22; 2 days left; exercise 7: window end 26 Nov, answer 3 days (errors 9 and 27).
- **The distinctions.** The four answers carry "מחקר הצוות; לא אומת" everywhere (body, table, reveal, video, five questions). The lesson says plainly "מה מכריע — לא ידוע" and teaches no "X% gap cancels" rule. The Mogi data decision carries who and when. The 50% is labelled. Bank names are "בנק א׳". The "בלי להסתיר, בלי לנפח" callout is a good guard.

**4.7-1 · must fix · lines 96, 119, 188, 195, 289, 449**
- **Quote:** "(Brain, דפים 5832771 ו־9863169, J-040 ו־J-150, …)"; "(Brain, J-060, אוגוסט 2026 …)"; "(J-070)" twice; "הצוות כתב ב־J-150"; "(J-030, J-040)".
- **Problem:** internal Brain page numbers and J-codes in body text. AUTHORING and the brief keep them in the sources panel only. A beginner has no idea what "J-150" is.
- **Fix:** delete them from the body ("לפי מחקר הצוות, 2026-08-04; לא אומת"). They are already in the Sources (lines 484–485, 492, 493).

**4.7-2 · must fix · the callout "שלושה סוגי מספרים, לא לערבב" (lines 160–163), the cap table, the component, the exercises' intro**
- **Quote:** "40% ו־35% הם מספרים להמחשה. הם לא מגבלה, לא סף הון ולא מדיניות של בנק כלשהו." The same in the Sources (line 496) and the VerifiedGap labels ("לדוגמה בלבד").
- **Problem:** in 4.5, 4.6 and 4.10 the 40% **is** the capital threshold. 4.6 says "בדיוק בסף ההון, 40%", and 4.10's card says the same. So 4.7 tells the learner that 40% is "not a capital threshold" in the very lesson that applies three kinds of number. Worse, the reveal for task 2 (line 233) says the ratio is "כבר מעל 40%", which for a beginner is exactly the real threshold. The demonstration reads as policy at the same time as it is denied to be one.
- **Fix:** use demonstration values that are not a course threshold (for example 45% and 36%; both are `given` facts, so no arithmetic in the MDX). Or keep 40% and write "40% הוא כאן רק מספר להמחשה; בשיעורים 4.5 ו־4.10 הוא סף הון". Update line 496, the component's `caps` labels, line 322, line 470 and the exercise messages ("השאלה מניחה 35%").

**4.7-3 · must fix · the guided tasks 2 and 3 (lines 226–227) against their answers (lines 233–234)**
- **Quote:** task 2 "החזירו את ההכנסה ל־11,000 והורידו את ההון העצמי ל־480,000"; reveal "ההחזר עולה ל־6,405.15, ויחס ההחזר על ההכנסה המאומתת ל־40.8%, כבר מעל 40%". Task 3 "שלבו את שניהם, ובחרו תקרה של 35%. כמה הון עצמי חסר?"; reveal "בהכנסה המאומתת לבדה, 127,000".
- **Problem:** I replayed the component. After task 2's instructions the "verified" column has income 19,200 (it was set back to 11,000) and shows **33.4%**, not 40.8%. The 40.8% appears only if the income stays at 7,500. In task 3 the learner combines both and the card says "ההלוואה צריכה להיות קטנה ב־**167,000**" (loan 1,170,000 − 1,003,000). The reveal answers 127,000 "for the income alone", which is not what they asked. The learner follows the steps and sees different numbers from the "מה הייתם אמורים לראות".
- **Fix:** task 2: "השאירו את ההכנסה כפי שאומתה (7,500) והורידו רק את ההון העצמי ל־480,000". Then 40.8% is right. Task 3: reveal "167,000: 127,000 מההכנסה הנמוכה ועוד 40,000 מההון הנמוך". Both numbers are facts (`demo.equity_short_low`, `ex5.equity_gap`); add a sum fact. Task 1 asks "ובכמה?" and the reveal never says 39.4 − 32.22 = 7.18 points; add it (fact).

**4.7-4 · must fix · "מי בודק" (line 119)**
- **Quote:** "בחלק מהמקרים בדיקות אוטומטיות עונות מיד. באחרים התיק עובר לרפרנט".
- **Problem:** the source (line 492) says some banks answer the **approval in principle** at once and pass others to a referent (FK-H-019 says the same about the pre-approval). The lesson puts this under "מי בודק" in underwriting. That moves a pre-approval fact into underwriting, and the beginner learns that underwriting is sometimes automatic and instant. No source says so.
- **Fix:** "בבקשה לאישור עקרוני, לפי תיאור הצוות, חלק מהבנקים עונים מיד וחלק מעבירים לרפרנט (לא אומת). מי בודק בחיתום עצמו, ומתי הוא עובר לרפרנט — אין לנו." Keep the definition of רפרנט.

**4.7-5 · must fix · the callout "בלי להסתיר, בלי לנפח" (lines 287–290)**
- **Quote:** "זו מרמה, והבנק מגלה אותה בדיוק בחיתום, שבו נמצאים שני הצדדים של ההשוואה."
- **Problem:** a bank behaviour ("the bank discovers it exactly in underwriting") that no source gives. The sources say only that the team checks before the bank. It is also a position ("זו מרמה") with no label. The three-sentence logic is the lesson's own.
- **Fix:** "הדרך להתמודד עם פער כזה היא לגלות אותו מוקדם ולהציג את הנתונים האמיתיים. זו עמדה של Mogi (דביר ואילון: …, תאריך), לא כלל של בנק. הצוות בודק לפני הבנק כדי לתת הצעה על נתונים נכונים (מחקר הצוות; לא אומת)." Drop "והבנק מגלה". Label the position with who and when, or "עמדה של הקורס".

**4.7-6 · should fix · lines 72–94 and 455**
- **Problem:** "מה הבנק בודק? כמעט כל דבר שנמסר בבקשה" and the table "מול מה אפשר לבדוק" read as bank practice. The label "הטבלה היא התיאור של הצוות … זו לא רשימה שבנק מפרסם" arrives two paragraphs later (line 96), after the table. The five-questions line "הבנק מקבל מסמכים ושמאות, מושך נתוני אשראי, בודק את הרישום, ומשווה הכול" (line 455) has no label. Summary line 466 repeats it. The learner who stops at the table has learned a list of bank checks that the team described for its own pre-check.
- **Fix:** put the label in the first sentence ("לפי תיאור הצוות לבדיקה שהוא עושה בעצמו; לא אומת") and title the table "מה הצוות בודק לפני הבנק". Add "(מחקר הצוות; לא אומת)" to line 455 and line 466.

**4.7-7 · should fix · the cap table (lines 143–158), the component, line 165**
- **Problem:** the first row says the largest loan on the declared income is **1,753,000 ₪**. Avi's property costs 1,650,000, and the ceiling of 75% is 1,237,500 (4.4). A beginner who just learned that the financing ratio caps the loan reads "the bank will lend more than the apartment costs". The 40% row (1,402,000 = 85% of the price) has the same problem. The component's default 50% card shows the same figure.
- **Fix:** add a sentence and a row: "זה רק מה שיחס ההחזר מאפשר. שיעור המימון מגביל בנפרד: 75% × 1,650,000 = 1,237,500 (שיעור 4.4). ההלוואה בפועל היא הנמוכה משתיהן." (a fact for 1,237,500; `case.max_loan_price`-like). Rename the component's line to "הלוואה מרבית לפי יחס ההחזר בלבד".

**4.7-8 · should fix · the maximum loan, lines 141–158, Solution 4.7-6 (line 428), Solution 4.7-5 (line 408)**
- **Problem:** "ההלוואה המרבית היא ההחזר המותר חלקי ההחזר לכל שקל הלוואה" is never shown with numbers, and the lesson has no formula box (the house rule asks for one when a formula appears). The learner cannot reproduce a single cell of the table, and exercise 6 is "מאתגר" with a solution that gives only the final figure. Exercise 5's solution says "בגיליון או במחשבון של הקורס: 6,405.15" with no step.
- **Fix:** add one worked cell: allowed payment 35% × 15,700 = **5,495.00**; payment per shekel of loan 6,186.17 ÷ 1,130,000 ≈ 0.0054745; 5,495 ÷ 0.0054745 ≈ **1,003,747** → down to 1,003,000. In Solution 4.7-5 show the two track payments (585,000 at 4.60% = 3,284.91; at 4.10% = 3,120.24; sum 6,405.15). All are computable facts. Add a small formula box with letters from the table (P = loan, C = payment, Cmax; "p" for the cap as in 4.4).

**4.7-9 · should fix · lines 275, 445, the video's "סוף החלון"**
- **Quote:** "לפחות 24 יום, ימים רגילים. הוא נגמר ב־יום חמישי 19 בנובמבר."
- **Problem:** "at least 24 days" is a floor, so it has no end date, yet the step says it "ends" on 19 November, and exercise 7 asks "how many days after the end of the window". The beginner asks "so does it end or not?".
- **Fix:** "נניח, להמחשה, חלון של בדיוק 24 יום (הרצפה). בנק יכול לתת יותר." Same in exercise 7 and the video's second scene.

**4.7-10 · should fix · line 96, Hebrew**
- **Quote:** "הטבלה היא התיאור של הצוות לבדיקה שהוא עושה בעצמו לפני שהבנק בודק (…), וליועץ שהוא מתכוון להיות לפחות מחמיר כמו הבנק." Also "וכאן אין בה מסמכי הכנסה".
- **Problem:** the first sentence cannot be parsed ("and for an advisor that he intends to be at least as strict as the bank"). The second is awkward.
- **Fix:** "הצוות בודק את התיק בעצמו לפני שהבנק בודק, ומתכוון להיות לפחות מחמיר כמו הבנק. הטבלה מתארת את הבדיקה הזו (…)". "ואין בה מסמכי הכנסה".

**4.7-11 · should fix · the video's first cue**
- **Quote:** "אישור עקרוני ניתן על מה שהלווים אמרו."
- **Problem:** stated as a rule. The lesson (line 109) has the nuance: Eylon said it, and a portal of one bank asks for documents already at the request. The video states the general rule with no label until the last cue says "הכללים לפי תעתיק".
- **Fix:** "לפי אילון, אישור עקרוני ניתן בדרך כלל על מה שהלווים אמרו." (60 characters or fewer: "בדרך כלל, אישור עקרוני ניתן על מה שנאמר." works.)

**4.7-12 · nit · lines 136–137 and the video**
- Two ratios in one breath: "32.22%" (two decimals) and "39.4%" (one). The map gives 32.2%. Use one precision, or say "בעיגול". Exercise 4 asks for one decimal; exercise 3 asks for two, which is fine.

**4.7-13 · nit · terms and exercise 7**
- The lesson uses "מוצהר", "מאומת" and "מוכר" almost as synonyms ("הכנסה מאומתת היא, בדרך כלל, הכנסה שאפשר להכיר בה"). Avi's 7,500 is a two-year average that Mogi computes from assessments, which is "מוכר"; the assessments are what is "מאומת". Add one sentence, or choose one word.
- Exercise 7: the bank "asks for a document" on Friday 20 November (2026-11-20). Whether banks work on Fridays is an open question in the course (Eylon list). Pick a weekday.

**4.7-14 · nit · other**
- `minutes: 35`; AUTHORING and the map say 15–30 (as in the 3.7 review).
- Line 111: "המימוש עוד לא הושלם" is an internal system note, and a data-model decision does not help a mortgage learner.
- Prediction option 3 is by far the longest, and it is the correct one; the learner can find it by length.
- Phone: the cap table's two number columns sit behind the scroll hint; the text talks about those two columns. AUTHORING: keep the column the text talks about early.

---

## Lesson 4.8: נתוני אשראי והתנהלות החשבון

**Spot checks that passed.**
- **The statement.** July 41,000 + 16,700 − 15,900 = 41,800; August 41,800 + 13,950 − 15,200 = 40,550; September 40,550 + 15,100 − 14,800 = 40,850. Deposits 45,750, debits 45,900, 150 more out than in (the balance fell 150). Michal's deposits 7,700 / 7,750 / 7,800 equal the net-to-pay of the 4.1 payslips (July–September).
- **Averages.** Avi 9,000 / 6,200 / 7,300 → 7,500 (three months), 6,750 (two), 7,600 (first two); gaps 3,500, 200, 750, 4,250, 2,000.
- **Dates.** 26 Oct + 60 = 25 Dec; 28 Dec is day 63; 20 Sep + 60 = 19 Nov (errors 20 and 18 correct).
- **Labels.** Every statement about the credit-data law is labelled "לא אומת, לפי תקציר" with its date; the lesson says three times what it does not know (what disqualifies, how many months, differences between banks); no promise ("לא מבטיחים … התנהלות טובה"); "החזרת חיוב" is marked a general term. The questionnaire facts match the repo files (Leumi: notice, 60 days; Discount: notice to the bureau).
- **The two versions of the 60 days** (stale versus retained) are shown, not chosen.

**4.8-1 · must fix · the video, cues 1 and 2**
- **Quote:** "בבקשה לאישור עקרוני הבנק מסתכל גם על האשראי. ועל החשבון בחודשים שלפני הבקשה."
- **Problem:** the second sentence says the bank looks at the account **at the pre-approval request**. No source says so. The lesson itself says "מה בנק קורא — אין לנו", and FK-H-029 (used in 4.7) says nobody verifies you until the pre-approval. The first sentence is "לפי הודעות … לא אומת" in the lesson but is stated flat in the video.
- **Fix:** cue 1: "לפי הודעות של בנקים, בבקשה לאישור עקרוני הבנק עשוי לפנות ללשכת אשראי." Cue 2: "ובחיתום, לפי הצוות, בודקים גם את החשבון." Or drop cue 2.

**4.8-2 · must fix · lines 89, 95, 106, 120, 140**
- **Quote:** "(דף 6455298, 2026-08-11)"; "(Brain, דפים 6455298 ו־5898285 …)"; "(J-050)"; "(שאלה 10)" with "במפת המקורות של הקורס … השאלה נשלחה לאילון"; "בבריף של הקורס … (מפת המקורות, שאלה 9)".
- **Problem:** Brain page numbers, a J-code, and references to the course's own working documents ("בבריף", "מפת המקורות", question numbers). Not for a learner.
- **Fix:** "לפי מחקר הצוות (2026-08-11; לא אומת)"; "שאלה פתוחה לאילון". Delete the question numbers and the words "בבריף", "מפת המקורות" and "נשלחה".

**4.8-3 · should fix · lines 95–97**
- **Quote:** "אצל הבנק, זה קורה מוקדם … **כל מי שמוכן לענות על בקשה לאישור עקרוני כבר מסתכל, בדרך כלל, על האשראי.**"
- **Problem:** the evidence is the notices of one bank plus "others publish a similar one" (research, unchecked) and two questionnaires (Leumi and Discount). "כל מי שמוכן לענות" is a claim about every lender, in bold. FK-H-029 (4.7, 1.10) says nobody checks you at the pre-approval, so 4.7 and 4.8 look contradictory to a beginner (see X-2). The card for credit history says the same ("הבנקים פונים ללשכת אשראי כבר בבקשה").
- **Fix:** "שני הטפסים הציבוריים שבדקנו (של שני בנקים) מודיעים שהבנק יפנה ללשכת אשראי כבר בבקשה. מה עושים האחרים — לא בדקנו (לא אומת)." Add the bridge: "זה לא אימות של מה שאמרתם: הבנק מושך נתונים בעצמו, בלי שתביאו מסמך."

**4.8-4 · should fix · line 102**
- **Quote:** "לבקש מבנק ישראל לא להעביר נתונים ללווה מסוים, לסוג מלווים או לכולם (לפי תקציר ממקור יחיד; לא אומת)".
- **Problem:** the label is right but this claim has no entry in the Sources list (lines 410–422 do not mention a block request). A reader cannot trace it.
- **Fix:** add a source line ("תקציר חיפוש, 2026-10-10, מקור יחיד; לא אומת") or cut the bullet.

**4.8-5 · should fix · lines 100 and 137, Hebrew**
- **Quote:** "בלי תשלום, 1 בשנה קלנדרית"; "הגבלה כזו נמשכת 1 שנה".
- **Problem:** a digit in place of the count ("פעם אחת", "שנה אחת"). AUTHORING also warns about "נמשכת" (continues or withdrawn).
- **Fix:** "בלי תשלום, פעם אחת בשנה קלנדרית"; "ההגבלה היא לשנה אחת".

**4.8-6 · should fix · line 91**
- **Quote:** "הליכי חדלות פירעון ושיקום כלכלי, הוצאה לפועל והגבלות חשבון".
- **Problem:** quoted from a bank's consent screen; three terms the beginner has never met, defined nowhere in the course.
- **Fix:** one gloss: "(חדלות פירעון והוצאה לפועל הם הליכים משפטיים לגביית חובות)" or cut the quote down to "הלוואות, מסגרות ומשכנתאות, ועוד".

**4.8-7 · should fix · step 4 (line 216), step 6 (line 220), the guided task**
- **Quote:** "זה מתאים להכנסה המוכרת … ולא להצהרה"; "החשבון עקבי עם ההכנסה המוכרת".
- **Problem:** two jumps. (a) The 9,000 / 6,200 / 7,300 are **deposits from the business**, which are revenue before the business's expenses and tax. Avi's recognised 7,500 is net income from assessments. They match here by design (average 7,500), and the lesson never says that in real life they are different things. FK-H-014 compares the assessed income "מול תזרים" and that comparison needs this care. (b) The household deposits average 15,250 (Michal's are net-to-pay), the household recognised income is 15,700 (4.1 uses net), so "the account matches the recognised income" holds for Avi only.
- **Fix:** add: "הפקדות מהעסק הן לא רווח: הן לפני הוצאות העסק והמס. כאן הן במקרה שוות בממוצע להכנסה המוכרת; בתיק אמיתי הפער בין השתיים הוא שאלה." Step 6: "בשביל אבי החשבון עקבי עם ההכנסה המוכרת".

**4.8-8 · should fix · the half-solved table (lines 230–247), phone**
- Seven columns with the row label. The "חיובים" and "יתרה בסוף החודש" columns are off screen, so the learner cannot see most of the blanks. See X-1.

**4.8-9 · nit · prediction, exercises**
- Reveal note 0 (line 181, for "רק ביום החתימה") says "החיתום הוא הבדיקה המלאה", which does not answer the option (signing day).
- Exercise 6 has no error for 7,300 (the last month alone), the number the learner just saw in task 1.
- AUTHORING: "if exercises need a calculator, say so above them". Exercise 5 needs date arithmetic; the intro (line 255) does not say so.

**4.8-10 · nit · video, length**
- Cue 11 "חתימה ביום 63? כבר לא עדכני." The question mark makes it sound unsure. `minutes: 35`.

---

## Lesson 4.9: הבטוחה

**Spot checks that passed.**
- **Avi.** Price 1,650,000, loan 1,130,000 → 68.5% on the price; appraisal 1,560,000 → 72.4%; 75% of 1,560,000 = 1,170,000, room 40,000; 75% of 1,650,000 = 1,237,500; the edge appraisal 1,130,000 × 100 ÷ 75 = 1,506,666.67.
- **The half table.** 68.48 / 70.63 / 74.34 / 76.35 and 1,237,500 / 1,200,000 / 1,140,000 / 1,110,000.
- **Exercises.** 74.3 (errors 68.5, 134.5); 20,000 (errors 170,000, 1,110,000, 0); 17 December (error 16); 106 payments (error 105); 816,629 within the stated tolerance. Dates: 90 days from 20 Oct = 18 Jan 2027; 14 days from 2 Nov = 16 Nov.
- **Labels.** The "lower of price and appraisal" rule, the headline risk in this lesson, is **labelled everywhere it is used**: "לפי תקציר של מקור רשמי מ־2026-10-10; לא אומת" in the body (line 84), the reveal, the formula box, the component source line, the summary, the video ("לפי תקציר") and the cards. The lesson says it is the new source for the question 1.2 left open, and it keeps FK-H-005 beside it with its conflict. I found no contradiction with 4.4, 4.11 and 4.15 (see X-6). Directive 451 §11 is labelled as the team's transcription and the temporary directive (2026) is flagged as possibly changing the 14 and 30 days. The "רשאי" versus "חובה" conflict with Eylon is shown with both sides.

**4.9-1 · must fix · step 6 (line 259)**
- **Quote:** "לפי מחקר הצוות (מקור משני; לא אומת), עם שני לווים עלות ביטוח החיים מוכפלת."
- **Problem:** a price consequence. The source (line 467) says only "כשיש שני לווים מבטחים את שניהם". "Doubled" is the lesson's inference, and the lesson says three lines earlier that the cost "תלוי בגיל, בסכום ובמבטח" and that the team does not have the numbers.
- **Fix:** "עם שני לווים מבטחים את שניהם, ולכן הביטוח יקר יותר; בכמה — לא ידוע."

**4.9-2 · must fix · Solution 4.9-6 (line 401)**
- **Quote:** "ביטוח שמשולם לפי היתרה זול יותר עם השנים".
- **Problem:** an insurance-pricing consequence with no source. It also contradicts line 158, which says the price depends on age: premiums normally rise with age. The sentence says a falling sum insured makes it cheaper; nothing shows the net effect.
- **Fix:** "הסכום שהביטוח צריך לכסות יורד כל חודש. כמה זה משפיע על המחיר — לא ידוע (המחיר תלוי גם בגיל)."

**4.9-3 · should fix · line 117**
- **Quote:** "הבנק דורש שני ביטוחים, אחד לכל ״מה אם״".
- **Problem:** stated as fact. Seven lines later the transcription says "רשאי לדרוש" and Eylon's "חובה" is shown as a conflict. The sentence the learner reads first is the unqualified one. The video's "שני ביטוחים" scene has the same flat tone before the last cue.
- **Fix:** "בדרך כלל הבנק דורש שני ביטוחים (לפי ההוראה הוא רשאי; ראו להלן), אחד לכל ״מה אם״."

**4.9-4 · should fix · line 81**
- **Quote:** "הלקוח זכאי לעותק".
- **Problem:** an entitlement stated as fact, with no label and no entry in the 4.9 Sources (the source is the team's transcription of directive 451, used in card 11).
- **Fix:** "לפי תעתיק של הצוות, הלקוח זכאי לעותק (לא אומת)", and add the line to the Sources.

**4.9-5 · should fix · Solution 4.9-7 (line 421)**
- **Quote:** "לפי התעתיק, הבנק גם חייב להודיע שאפשר לבטל את הביטוח כשהיתרה יורדת לסכום הזה (לא אומת)."
- **Problem:** labelled, and the research notes have it (§11(ד)(3)), but the Sources entry for §11 (line 464) does not list this duty, so a reader cannot find it.
- **Fix:** add "וחובה להודיע על אפשרות ביטול כשהיתרה יורדת (11(ד)(3))" to the §11 source.

**4.9-6 · should fix · lines 84, 454**
- **Problem:** the quoted rule "שווי הנכס לא יעלה על הנמוך מבין הערכת השמאי ועלות הנכס בהסכם הרכישה" is cited to "הוראת דיווח 876 והשאלות והתשובות להוראה 329". A reporting directive defines values for reports. The summary does not say which document the sentence is in, or that it was written for the 329 limit. The lesson already says "ממתין לבדיקה מול המסמך".
- **Fix:** in the source: "הציטוט מנוסח כהגדרה לצורך דיווח (הוראה 876); לא נבדק אם הוא חל על מגבלת 329", and let the open question to Eylon say so. The label stays.

**4.9-7 · should fix · task 1 (line 182), phone**
- **Quote:** "הורידו את השמאות עד שהמסגרת השמאלית נצבעת."
- **Problem:** "left" is right on desktop (RTL, the second card), but on the phone the two cards are stacked and the second one is the lower.
- **Fix:** "עד שהמסגרת ״מול הנמוך מבין המחיר לשמאות״ נצבעת".

**4.9-8 · should fix · line 119**
- **Quote:** "ביטוח מבנה: … התכולה לא בפנים."
- **Problem:** "תכולה" (contents of the home) is never explained in the course.
- **Fix:** "(ולא הרהיטים והציוד בדירה, שנקראים תכולה)".

**4.9-9 · should fix · the half-solved table (lines 271–285), phone**
- Five columns: the last column "הלוואה מרבית (75%)" with its blanks is cut off. See X-1.

**4.9-10 · nit · lines 148–156, 401, 421**
- The balances 990,233.65 / 816,629.29 / 332,995.79 and 30,783.58 / 28,790.54 are the **unrounded closed form**. The tables of this stage follow the statement convention (payment rounded once, interest rounded each month), which gives 990,233.74 / 816,629.58 / 332,996.53 and, for exercise 7, 30,783.64 / 28,790.60. The solution of 4.9-6 mentions that the spreadsheet formula "may differ by agorot". But the sheet formula it prints uses the rounded payments, which gives **816,629.61**, a third number. A learner who builds the month-by-month column the exercise hints at will not match the page by 6 agorot. The 106-payment answer and the 296 are the same in all conventions.
- **Fix:** say once "היתרות כאן מחושבות בנוסחה, בלי עיגול חודשי" and give the statement-convention figures in the 4.9-7 solution, or recompute the facts by the statement convention.

**4.9-11 · nit · line 94**
- "שמאות נמוכה ב־90,000 ₪ הזיזה את שיעור המימון בכמה נקודות אחוז." The number is 3.9 points (72.4 − 68.5). Give it (a `difference` fact).

**4.9-12 · nit · exercise 5, prediction**
- Exercise 5 (14 days) depends on a rule that the lesson says a 2026 temporary directive may have changed. The caution is only in the solution. Put it in the question: "(לפי תעתיק; ייתכן שהמועד שונה)".
- The correct prediction option (line 36) states the unverified rule as a reason with no "לפי תקציר" in the option text (the reveal has the label).

**4.9-13 · nit · length**
- `minutes: 35`.

---

## Lesson 4.10: כרטיסי הגורמים, א׳: הלקוח

**Spot checks that passed.**
- **The numbers.** 8,400 ÷ 20,000 = 42%; 50% → 10,000; 40% → 8,000. Anat and Boaz: 21,000 − 1,200 = 19,800; 8,712 ÷ 19,800 = 44%; 40% → 7,920; gap 792; 50% → 9,900. The half table: 15,000 / 40%, 16,000 / 45%, 20,000 / 35%.
- **Exercises.** 40 (error 250); 11,000 (error 8,800); 15,300 (errors 14,600, 16,200); 1 child (errors 4, 3); 83.33% (errors 75, 16.67). The card examples: 450,000 = 25% of 1,800,000; 144,000 ÷ 12 = 12,000 (3,000 below the declaration); 60 days from 11 Oct = 10 Dec; 7,000 × 20% = 1,400; ages 19/16/11 → 2 and 3; 1,500,000 against 1,000,000.
- **The nine cards.** Every card answers all eight questions. Every threshold has its source kind. Open gaps are marked "שאלה פתוחה" (eight of nine have one; card 7 has none, and the video shows exactly that). No card invents a number: the 20% is from Leumi's questionnaire as the repo recorded it; the 25/30/50 follow from the 75/70/50; the 50% for a non-resident is from the search summary and is labelled; the "30%–35%" appears only as "אין לו מקור כתוב". No "עובדה מאומתת" anywhere; exercise 6 teaches why.
- **Case A.** Absent ("תרגיל זה נפרד מהתיק של נועם ושירה").
- **The 40%/50%.** Consistent with 4.5 (capital threshold versus limit) and with 4.6; Eylon's 40% appears as field knowledge with the partial contradiction.

**4.10-1 · must fix · card 1, line 149 (visible on the card); the cards' threshold lines**
- **Quote:** "ב־Mogi: המנוע יחשב את היחס לפי כללי החישוב שהוחלטו (**ENG-223**, עוד לא נבנה)". Also the threshold sources "(דפים 7503881 ו־67436545)", "(Brain, דף 7503881, J-090)" in cards 1, 3, 13 and others, and "שאלות 5–6 בשאלון", "שאלה 12 בשאלון" (card lines 131, 173, 214, 289, 325, 364, 399).
- **Problem:** a Linear issue number in learner text (the house rule is explicit); Brain page numbers and J-codes in the card body, where the thresholds and their sources are shown inline (the sources panel is a separate `<details>`). The beginner does not know what "ENG-223" is, nor which "שאלון" is meant (see 4.10-8).
- **Fix:** card 1: "המנוע יחשב את היחס לפי כללי החישוב שהוחלטו (עוד לא נבנה)". Move page numbers into the "המקורות של הכרטיס" panel only. Replace "(שאלות 5–6 בשאלון)" with "שאלה פתוחה לאילון".

**4.10-2 · must fix · card 14, card line 396**
- **Quote:** "דרך תקציב המחיה (4.6): **הבנק בודק אם נשאר מספיק כסף למשפחה אחרי התשלום.** אם ואיך מספר הילדים נכנס לחישוב של הבנק — לא כתוב בשאלונים."
- **Problem:** the first sentence states a bank practice (a living-budget check) that 4.6 says in bold the course does not know: "מה הבנק עושה עם התשובה — לא ידוע לנו. זה לא אומר שהוא מחשב תקציב מחיה, ולא אומר שלא". The card contradicts the lesson that precedes it, and the second sentence of the same card contradicts the first.
- **Fix:** "דרך תקציב המחיה (4.6), שהוא חישוב של הקורס: מה שנשאר למשפחה אחרי התשלום. אם הבנק בודק משהו כזה, ואם ואיך מספר הילדים נכנס לחישוב שלו — לא ידוע." Same in the algorithm line: drop "לפי ההגדרה של כל בנק" unless a bank is known to have a definition.

**4.10-3 · must fix · summary, line 395**
- **Quote:** "ילד הוא עד גיל 18 בשאלונים של שלושה בנקים, ועד 21 באחד (לא אומת)."
- **Problem:** wrong against the source and against 4.6. The four questionnaires: two define a child up to 18 (Leumi, Mizrahi), one up to 21 (Poalim, which also asks custody and each child's age), and one asks the number of children with no age limit (Discount). 4.6 says exactly that ("בשניים … 18, ובאחד … 21"; the sources line says the fourth asks the number). The card (line 398) says "בשאלון אחד … ובאחר" and is right.
- **Fix:** "בשניים מהטפסים עד גיל 18, באחד עד גיל 21, ואחד לא מגדיר גיל (לא אומת)".

**4.10-4 · must fix · card 3, card lines 168 and 187**
- **Quote:** example "המתנה היא 33.3% מההון העצמי, **ולכן הבנק ישאל עליה**"; the card's "why": "והבנק רוצה לדעת שהכסף באמת קיים, ומאיפה הוא מגיע."
- **Problem:** the first claims a bank behaviour ("because a third of the equity is a gift, the bank will ask") that no source gives. The sources behind the card are the 329 ceilings, FK-H-001 and the field registry; none says a bank asks about a gift. The "why" is a motive with no label. (The bank questionnaires do ask about sources of equity, and exercise 7 and its footnote are careful: "איך כל בנק מתייחס למתנה — לא ידוע".)
- **Fix:** "המתנה היא 33.3% מההון העצמי. בטפסים הציבוריים יש שאלה על מקורות ההון (לא אומת); איך בנק מתייחס למתנה — לא ידוע." "Why": "הבנק מלווה על מה שנשאר אחרי ההון העצמי, ולכן ההון משפיע על ההלוואה; אם הוא בודק מאיפה הכסף — לא ידוע."

**4.10-5 · should fix · card 13, card line 360**
- **Quote:** "לווה (גם לווה שאינו ממשכן) מוסיף את ההכנסה שלו — וגם את ההתחייבויות שלו — לחישוב של יחס ההחזר. … איך כל בנק סופר הכנסה של ערב או של לווה שאינו ממשכן — לא ידוע לנו."
- **Problem:** the first sentence says a non-pledging borrower's income enters the ratio, the last says how banks count that income is unknown. The map link says the same as the first ("כל לווה מוסיף את ההכנסה שלו").
- **Fix:** "לפי כללי החישוב של הקורס, כל לווה מוסיף את ההכנסה ואת ההתחייבויות שלו ליחס (שיעור 4.3). איך בנק סופר את ההכנסה של לווה שאינו ממשכן או של ערב — לא ידוע."

**4.10-6 · should fix · PredictionReveal note 0 (line 175), exercise 1 option 4 (line 261)**
- **Quote:** "מעל 40% הבנק לא מסרב." and "מדיניות של בנק מסוים יכולה להיות שונה, ולא מפורסמת."
- **Problem:** the first is a bank behaviour stated flat. The course's own 4.5/4.10 position is that **regulation** does not forbid, and a bank's own line is unknown (Eylon: "בפועל בנקים מחמירים ל־40%"). The second says "not published", which the course does not know either.
- **Fix:** "לפי התעתיק, מעל 40% אין איסור: הבנק מחזיק יותר הון. אם בנק מסוים מסרב בפועל — מדיניות שלו, ולא ידועה לנו." Replace "ולא מפורסמת" with "ולא ידועה לנו".

**4.10-7 · should fix · label table (lines 93–110)**
- Each card shows a badge "מחקר / הצעה" next to question 8 ("איך האלגוריתם משתמש בו?"), but the table of labels has no such row. Add one: "מחקר / הצעה: רעיון של הצוות, לא נבדק מול בנק או מקור".

**4.10-8 · should fix · cards, "שאלה פתוחה לאילון (שאלה N בשאלון)"**
- "השאלון" is ambiguous in a lesson that also quotes the banks' questionnaires ("בשאלון של בנק אחד"). Write "ברשימת השאלות לאילון".

**4.10-9 · should fix · cards 8 and 9**
- Card 8: "העבר הוא הסימן הטוב ביותר שיש לבנק" (an absolute ranking, no label); "עבר אמיתי לא נמחק מהר" (a retention claim; the lesson 4.8's sources deliberately left retention out); "הבנקים פונים ללשכת אשראי כבר בבקשה" (all banks, see 4.8-3). The example says the bank "יכול לשמור" the report 60 days, while 4.8 says "לא עדכני אחרי 60" (two versions in 4.8; the card picks one silently).
- Card 9: "מה הלקוח באמת יכול לשנות": "חודשים מסודרים … בלי חיובים חוזרים, בלי מינוס שאפשר למנוע" reads as a recommendation that it helps, while 4.8's callout says "לא מבטיחים … שחודש של התנהגות טובה משנה משהו".
- **Fix:** "סימן חשוב"; delete or label the retention line; "הבנקים שבדקנו"; for the card 9 levers add "(עצה של הקורס; אין מקור שזה משפיע על ההצעה)".

**4.10-10 · should fix · card 15, card line 434**
- "אלה שאלות של חובות דיווח ובדיקה שחלות על הבנק עצמו … למה בדיוק — לא בדקנו מול מקור." The first clause states the reason and the second admits there is none. Delete the first clause.

**4.10-11 · should fix · the half-solved table (lines 227–242), phone**
- Six columns: the "יחס החזר" column with two blanks is hidden. It is not in the list qa:browser gave, but it overflows the same way (table 390px, box 341px). See X-1.

**4.10-12 · should fix · cards 4 (and 1–13 in 4.11), card lines 516–520**
- Card 4 effect: "לפי טובי זמיר, **הבנק מעדיף** תיקים גדולים". Tobi said "אני אעדיף" about himself, one banker's preference; the card turns it into the bank's preference. Card 4 "why" ("חלק מהעבודה על תיק עולה לבנק אותו דבר …") is a bank-economics claim with no label (general economic knowledge at best; label it or say "השערה"). The example's 2,000 ₪ is labelled. These sit in 4.11; I list them here because the brief gave me cards 1–13.
- **Fix:** "לפי טובי זמיר, הוא עצמו מעדיף …"; label the "why".

**4.10-13 · nit · the video's card-grid scene (frames `t142` and the two before it)**
- The nine-card grid is not centred: the right-hand card ends 10px from the right edge of the frame (x = 1270 of 1280), outside the logo's margin (1240), and the left gutter is 220px. The title is centred.
- The dashed "אסור" zone and the bars use warning orange and danger red as plain series; same note as 4.6-9.

**4.10-14 · nit · names, wording**
- "ענת" is also the name in 3.8 (ענת ונדב); "עומר" appears in 4.2 (הדס ועומר), 4.9 (מאיה ועומר) and card 3 (יעל ועומר). Pick different names.
- Line 112 (and 4.6 line 111): "האתרים הרשמיים חסומים בסביבה שבה נכתב" talks about the authors' environment. Say "עוד לא נבדקו מול המסמכים הרשמיים".

**4.10-15 · nit · lines 124–125, prediction**
- "התשלום הגבוה ביותר שמתחת לקו: 10,000" while the line above says exactly 50% is allowed; say "עד הקו".
- The prediction's correct answer is "לא ידוע". A beginner cannot predict that, and a prediction is meant to be a thing one can reason to. Consider asking "מה ידוע לנו על …".

**4.10-16 · nit · card 7 and 1**
- Card 1 `effect` says "מעל התקרה הבנק לא מאשר בכלל" in the flat voice; the thresholds below it are labelled, so this is minor, but the one-line "(לפי תעתיק; לא אומת)" costs nothing.

---

## Cross-lesson items

**X-1 · must fix · half-solved tables hide their blanks on the phone (4.6, 4.8, 4.9, 4.10)**
- **What I measured** (390px, the fill-in box against its content):

| Lesson | Columns (with the row label) | Table | Box | Result |
|---|---|---|---|---|
| 4.6 | 5 | 319 | 343 scroll / 341 client | 2px over; the last column touches the edge |
| 4.7 | 4 | 317 | 341 / 341 | fits |
| 4.8 | 7 | 477 | 501 / 341 | "חיובים" and "יתרה בסוף החודש" off screen |
| 4.9 | 5 | 365 | 389 / 341 | "הלוואה מרבית" and its blanks off screen |
| 4.10 | 6 | 390 | 414 / 341 | "יחס החזר" and its blanks off screen |

- **Why.** `FillTable.vue` formats every shekel cell with `formatShekels` (always agorot: "1,650,000.00 ₪" about 95px) and sets it `whitespace-nowrap`; the blank inputs are `min-w-14` (56px). Each shekel column needs 70–100px. With the 12px box padding the usable width is 315px, so it holds three, at most four, columns. The component's header comment says it fits 340px, and AUTHORING repeats it. It does, up to four columns. qa:browser reported 4.6, 4.8 and 4.9; the build I measured also overflows in 4.10.
- **Why it matters.** Unlike a reading table, a fill-in table has no scroll hint, so the learner sees a table whose last column simply is not there. In 4.8 and 4.10 the right column is the one being tested.
- **Fix (shared file, for the coordinator):** below `sm`, render each row as a small card (label: value, input beside the label), or at least show whole-shekel values without ".00" and add the scroll hint. **Fix (in the lessons, if the component stays):** keep fill-in tables to four columns. 4.6: put the number of people into the row name and drop the column. 4.8: split into a deposits table (month, opening, total deposits) and a balance table (month, debits, closing). 4.9: drop the "שמאות" column by naming the row "שמאות 1,600,000" (the row label carries it). 4.10: merge "הכנסה נטו" and "התחייבויות שנספרות" into the row name or give "הכנסה פנויה" given and ask only the ratio.

**X-2 · should fix · when the bank pulls credit data: 4.7, 4.8, the map and card 8 disagree**
- 4.7 line 72 says the bank reads for the first time in underwriting ("עד אז הוא ענה על מה שהלווים סיפרו"), its table lists "נתוני אשראי, שהבנק מושך בעצמו" among underwriting's checks, the five-questions line says "אישור עקרוני ניתן בלי בדיקה", and the map link says "הבנק קורא אותם בחיתום" (`stage-4.ts`, the `credit_data → underwriting` link). 4.8 says the bank pulls the credit data **already at the pre-approval request**. A beginner who has just read FK-H-029 ("אף אחד לא מאמת אותך עד האישור העקרוני") in 4.7 and 1.10 meets the opposite in the next lesson.
- **Fix:** 4.7 line 72: "הבנק קורא לראשונה את המסמכים; את נתוני האשראי הוא מושך כבר בבקשה (שיעור 4.8)". Add the bridge sentence to 4.8: credit data is not verification of what you said. The map link: "הבנק מבקש חיווי כבר בבקשה (לא אומת)".

**X-3 · should fix · the net or net-to-pay question flips Avi's result in 4.7**
- 4.1 leaves open whether the bank counts payslip "נטו" or "נטו לתשלום" (FK-H-015 versus Mogi's spec). With net-to-pay, Michal's income is 7,750, the household's recognised income is 15,250, and the ratio is 6,186.17 ÷ 15,250 = **40.6%**, above 40%. 4.7 says "39.4%, מתחת ל־40%, אבל המרווח קטן" (line 232) and never mentions this. 4.8's account (net-to-pay deposits) points the same way.
- **Fix:** one sentence in 4.7 after the ratios: "אם הבנק סופר את הנטו לתשלום של מיכל (שאלה פתוחה, שיעור 4.1), ההכנסה היא 15,250 והיחס 40.6%." (two facts).

**X-4 · should fix · letters**
- 4.9 uses **T** for the ceiling of the financing ratio (lines 225 and 231). 4.4 uses lower-case **c** for the same quantity in the same formula ("P_max = V × c ÷ 100"), and 4.6 uses **T** for the living budget. AUTHORING: a letter keeps its meaning everywhere. Use **c** in 4.9 and keep T for the budget. (C, C_max, P, V, LTV are consistent across 4.4, 4.5, 4.6, 4.9.)

**X-5 · should fix · internal IDs in 4.3 and 4.4 (outside this range, found while checking contradictions)**
- "ENG-223" appears in the body of 4.3 (lines 84, 97, 467) and in a source of 4.4 (line 467); `BidiText.vue` even mentions it in a comment. Same rule as 4.10-1.

**X-6 · pass · the price-versus-appraisal headline**
- 1.2, 1.6, 1.8 leave it open; 4.9 states the "lower of the two" as a search-summary rule, labelled "לא אומת" at each use; 4.11, card 2 and card 11 repeat the label, and card 2 even keeps it marked "שאלה פתוחה"; 4.15 measures against the price by an explicit stated assumption ("אלא אם נאמר אחרת") and its exercise 7 gives the appraisal as the premise. 4.4's discounted-price special case (appraiser's value up to a cap) is consistent with the 4.9 formula box. I found no place that contradicts 4.9 without a label. Two remaining points: card 3 states the 25/30/50% equity "מהמחיר" while the rule used elsewhere is the lower of price and appraisal (add "(לפי השווי לחישוב, שיעור 4.9)"), and 4.9-6 above on the document the quote comes from.

**X-7 · nit · the Eylon list (`research/eylon-list.md`) has no stage-4 section**
- FK ids used in 4.6–4.10 and not yet on it: **FK-H-014, FK-H-015, FK-H-018, FK-H-036, FK-H-045, FK-H-048, FK-H-051, FK-H-004, FK-H-006, FK-H-007** (FK-H-001, 005, 012, 029, 030, 033, 034, 040, 044, 046 and 062 are on it from stage 1; add "4.6–4.10" to their "איפה בקורס" cells: FK-H-012 in 4.6, 4.7, 4.10 and the cards; FK-H-029/030/033/034 in 4.7, 4.8; FK-H-005 in 4.9 and cards 2 and 11).
- Questions these lessons put on the list (each is already marked in the text): what decides between the four underwriting answers (4.7); how long underwriting takes; whether the pre-approval pull of credit data is the practice of all four banks (4.8); what in a credit report disqualifies, costs more or does not matter; how many months of the account are read and what fails a file; whether a bank checks a living budget and how it uses the number of children; whether a bank waives life insurance in practice, and what happens to a borrower who cannot get it; whether a gift counts as equity at each bank; how a guarantor's or a non-pledging borrower's income is counted; whether every inquiry leaves a mark the next bank sees (J-050) and what that costs.

**X-8 · nit · names and numbers**
- See 4.10-14 (names). The map's case-B line and the lessons agree (68.5% and 32.2%).
- Lesson length: 4.7, 4.8 and 4.9 are 35 minutes (the map says 15–30).

**X-9 · pass · Case A and Case B**
- Case A (נועם ושירה) appears only in 4.10's disclaimer. It has no track, mix or offer in 4.6–4.10. Case B (אבי) is used as the map gives it: price 1,650,000, equity 520,000, declared 68.5% and 32.2%, the recognised income from 4.1 (7,500 + 8,200). The two tracks (4.60% and 4.10%, 300 months) are labelled "הנחת חישוב של התיק, לא הצעה", and the map's 32.2% was computed from the same tracks (`scripts/case_sketch.py`).

---

## Summary

| Lesson | must fix | should fix | nit |
|---|---|---|---|
| 4.6 | 0 | 5 | 4 |
| 4.7 | 5 | 6 | 3 |
| 4.8 | 2 | 6 | 2 |
| 4.9 | 2 | 7 | 4 |
| 4.10 | 4 | 8 | 4 |
| Cross | 1 | 4 | 2 |

(4.10's eighth "should" is 4.10-12, a 4.11 card the brief assigned to me. The two Cross "pass" items are not counted.)

**The math is sound.** I recomputed every displayed number, every exercise answer and every listed error in `Decimal`. All agree with the data. The numeric faults are small and all are in the text around the numbers:
- the guided-task answers in 4.7 describe a state the component does not show (4.7-3: 40.8% where the component shows 33.4%, and 127,000 where it shows 167,000);
- the 4.9 balances use a different rounding from the rest of the stage (4.9-10);
- 4.7's "largest loan" table prints a figure above the price of the home (4.7-7).

**The big risk, invented bank behaviour, is mostly held.** Every lesson says plainly what is not known (underwriting duration, what decides the four answers, what disqualifies in a credit report, how many months of the account are read, what banks do with the number of children). The "lower of price and appraisal" rule is labelled at every use and is not contradicted. The sentences that cross the line are few and fixable:
1. 4.7: the "מי בודק" paragraph moves a pre-approval fact into underwriting (4.7-4), and the fraud callout says the bank "discovers it exactly in underwriting" (4.7-5).
2. 4.8: the video says the bank reads the account at the pre-approval request (4.8-1), and the body generalises one or two banks' notices to "כל מי שמוכן לענות" (4.8-3).
3. 4.9: "the cost is doubled" and "cheaper over the years" are unsourced price claims (4.9-1, 4.9-2).
4. 4.10: card 14 says the bank checks the living budget, which 4.6 says nobody knows (4.10-2); card 3 says the bank "will ask" about a gift (4.10-4); the summary miscounts the banks' definitions of a child (4.10-3); the capital threshold is called "not a capital threshold" in 4.7 (4.7-2).

**What a beginner will trip on:**
1. **X-1.** On the phone, the fill-in tables of 4.8, 4.9 and 4.10 hide the columns being tested, with no hint. 4.6 touches the edge. The cause is agorot-formatted nowrap amounts in five to seven columns.
2. **4.7-3 and 4.7-7.** The guided tasks promise numbers the component does not show, and the loan table lets the bank lend more than the apartment costs.
3. **X-2.** 4.7 says the bank reads first in underwriting, 4.8 says it pulls credit data at the pre-approval; the bridge is missing.
4. **4.7-2.** The lesson about the three kinds of number calls the capital threshold "not a capital threshold".
5. **The rest is wording:** "שני נפשות", "חזקה" for custody next to the exponent from 0.3, a garbled sentence in 4.7, digits for counts and an undefined jargon quote in 4.8, "תכולה" in 4.9, "השאלון" meaning two things in the cards, and Brain page numbers, J-codes and "ENG-223" in body text and cards.

The factor cards are clean in structure: eight questions each, a source per card, open gaps marked, no invented number. The four must-fix items in 4.10 are all about a sentence that says what a bank does.
