# QA report: lessons 2.1–2.6, read as a beginner

Date: 2026-10-10. Reviewer: first-round QA. I edited no lesson, component, data or research file; this report is the only file I wrote.

**The reader:** someone who finished stages 0 and 1 (percent, interest, effective rate, present value, inflation and index, banks, Bank of Israel, bonds; the mortgage world, tracks and the mix) and has never seen a mortgage track.

**What I read:**
- the visible text of `dist/lessons/2-{1..6}/` (built 2026-10-09 16:57, after the last MDX change at 16:55);
- the six MDX files, including the exercise `errors`, the card data of 2.4 and the FillTable configs;
- `public/video/2-1.he.vtt` (2.2–2.6 have no video, as the map says);
- `data/lessons/2-{1..6}.json`, and the stage-0/1 facts that 2.x reuses (0.10 decisions, 1.4 case A);
- the phone screenshots `qa/screens/phone_lessons_2-{1..6}_.png` (taken 16:58), cut into strips, plus a live Chromium check at 390px of every `.ltr` span (which ones wrap, and the character order on each line);
- `course/AUTHORING.md`, `course/course-map.md` (stage 2, case A), `research/eylon-list.md`, the stage-0/1 summaries, the stage-1 reports and `qa-reports/stage-2-components.md` (I do not repeat its component bugs).

**Math spot-check.** I recomputed in plain `Decimal`:
- 2.1: every layer (4.75, 3.95, 0.7, 4.5, 3.7, −0.25), 0.3292, 1,975 / 1,850 / 125, the half table (4.25 / 3.45, 5.5 / 5, 5 / −0.7), all six exercises and their errors;
- 2.2: the three factors and 2.723248, 15,422.76, both tables (28,677.24 / 14,688.34 / 0), 15,731.22 / 16,045.84 / 16,366.76, 15,861.15 and 438.39, the 360-month example (2,440, 2,436, 1,960, 1,004, 2,200 / 2,500), the half table, exercises 2, 4, 5, 6;
- 2.3: 105,060, 5.06, 1.94, the inflation table, 0.97, 16,962 / 23,124 / 2.04 / 412,000, the half table, exercises 2, 3, 5, 6;
- 2.4: 6.17, 3.92, 5.12 / 3.04 / 5.10 / 2.01, 6.06, the half table (4.91 / 2.85, 3.66 / 1.63), exercises 3, 4, 5;
- 2.5: the payments 3,959.73 / 3,327.59 / 2,864.98 / 2,423.39 (annuity formula), 3,248.36, 4,056.31, 113.14, 2,741.84, 2,532.22, 614,979.59, 3,898.80 / 3,976.77, the half table, exercises 3–6;
- 2.6: 3,715.41, 493,887.20, 3,970.25, 370,042.52 / 362,699.75, 580,538.94, the four interactive answers (4,043.06 → 3,783.55 / 502,945.28; 3,891.47 → 3,797.92; 3,403.17 / 348,261.19), the case-A track (2,680.77, 488,361.02, 2,817.31, 2,547.91), exercise 6 (+218.44 over 20 years against +182.57 over 5), the 2026 decision table against 0.10's data.

Every displayed result matches its fact. Three places show arithmetic that does not hold on the page, or a rule the page does not follow: items 2.2-1, 2.2-2 and 2.5-1. One rounding difference between lessons is item X-6.

**Phone direction.** Every `<M>` and `.ltr` span reads left to right. Four spreadsheet formulas wrap, with "=" alone at the end of a line (item X-5).

---

## 2.1 — ריבית בנק ישראל, פריים, עוגן ומרווח

The lesson is solid: three layers built from small numbers, the two spreads named apart, the 1.5 shown as an open question, and the Mogi warning turned into a real exercise (5). What is left:

### 2.1-1 · חשוב · "the addition is identical for all banks" is stated as settled, while its source is open
- **Where:** "למה ״פריים פחות״?" → "**מה משתנה מהצעה להצעה?** ריבית בנק ישראל והתוספת זהות לכל הבנקים באותו יום." Also the video cue "שני מספרים זהים לכולם באותו יום.", the five questions ("כי העוגן זהה לכולם באותו יום"), and exercise 1's correct option "ריבית בנק ישראל ועוד תוספת **קבועה**".
- **Problem:** a few lines earlier the lesson says it has not decided whether the 1.5 is the banks' convention or a regulatory rule, and that it is "כלל שנכון ל־9 באוקטובר 2026, לא כלל לתמיד". If it is a convention, "identical for all banks" is exactly the open part. The source badge for this sentence is "ידע כלכלי כללי … לא נבדק מול מקור כתוב", which is the wrong kind for a claim about Israeli banks. "תוספת קבועה" in the graded answer says the opposite of "not a rule forever".
- **Fix:** "נכון ל־9 באוקטובר 2026, הפריים שמפרסמים הבנקים זהה (לא אומת), ולכן המרווח הוא החלק שנקבע בהצעה עצמה." Badge it `לא אומת`. Exercise 1: "ריבית בנק ישראל ועוד תוספת (1.5 נקודות אחוז, נכון ל־9 באוקטובר 2026); היא זזה יחד עם ריבית בנק ישראל".

### 2.1-2 · חשוב · "compare offers by the spread" is a slogan without its conditions
- **Where:** the five questions, "איך משתמשים בזה בהחלטה?": "משווים הצעות לפי המרווח, כי העוגן זהה לכולם באותו יום."; the summary: "לכן משווים הצעות לפי המרווח".
- **Problem:** the body limits it correctly ("למסלולים שהעוגן שלהם הוא הפריים"); the two places a reader takes away drop the limit. A beginner will apply it to offers whose tracks have different anchors, amounts or terms, and 1.10 already told them (FK-H-057, pending Eylon) that changing the mix can change the bank's rates, so one track's spread is not the whole offer.
- **Fix:** "משווים מסלולי פריים בהצעות שונות לפי המרווח, כי הפריים זהה לכולם באותו יום. הצעה שלמה משווים בשלב 5."

### 2.1-3 · קטן · exercise 5 has no actor for the contract, and the question asks about "the track" without saying whose
- **Where:** "חוזה נחתם כשריבית בנק ישראל הייתה 4.5% … חבר אומר: ״הריבית שלי הייתה 5.5% …״. נכון ל־9 באוקטובר 2026, מה אחוז הריבית במסלול?"
- **Problem:** AUTHORING wants the actor and the verb. The reader has to infer that the contract is the friend's. The question also applies today's 1.5 to a past date, right after the lesson stressed that the 1.5 is "not a rule forever".
- **Fix:** "חבר חתם על מסלול ״פריים פחות 0.5״ כשריבית בנק ישראל הייתה 4.5% (מספר בדוי), ואז הריבית שלו הייתה 5.5% (בהנחה שגם אז התוספת הייתה 1.5). הוא אומר … מה אחוז הריבית במסלול שלו, נכון ל־9 באוקטובר 2026?"

### 2.1-4 · קטן · exercise 6: no actor, and the common "forgot the %" mistake has no message
- **Where:** "במסלול שהעוגן שלו הוא הפריים נשאר חוב של 480,000 ₪."; errors list (`ex6.year`, `ex6.spread_mix`).
- **Problem:** no "לכם". The likeliest slip, `480,000 × 0.25 ÷ 12 = 10,000`, gets a generic "wrong". 2.6 exercise 4 has this exact error (`no_hundred`); 2.1 does not. The item is also marked מאתגר but is the worked example's step 4 with one number changed; 2.1-5 below.
- **Fix:** "במסלול הפריים שלכם נשאר חוב של 480,000 ₪." Add `{ value: 10000, message: "כפלתם ב־0.25 במקום ב־0.25%. כמספר עשרוני 0.25% הם 0.0025." }`.

### 2.1-5 · קטן · difficulty labels: two "מאתגר" items are one-step
- **Where:** exercises 5 and 6.
- **Problem:** 6 is one multiplication, the same as worked step 4 (and the lesson says "לא צריך לדעת את הריבית עצמה"). 5 is the hardest idea in the lesson and is rightly מאתגר. Labelling 6 the same overstates it.
- **Fix:** 6 → בינוני, or make it two steps (for example: two decisions, +0.25 and then −0.5, and the net change in shekels).

### 2.1-6 · קטן · the video says nobody borrows at the Bank of Israel rate
- **Where:** video cue 5: "אותה קובעת הוועדה המוניטרית. אף אחד לא לווה בה ישירות."
- **Problem:** the page says, correctly, "אנשים פרטיים לא לווים בריבית הזו ישירות". "אף אחד" is false for the banks, and 0.10 taught that this rate works through the banks' cost of money.
- **Fix:** "אנשים פרטיים לא לווים בה ישירות." (fits 60 characters).

### 2.1-7 · קטן · the "when is it true" list prints double brackets
- **Where:** "מתי הנוסחה נכונה?", item 1: "במסלול שהריבית בו נקבעת לכל התקופה (ריבית קבועה (נגיע לזה בשיעור 2.2)) אין עוגן".
- **Problem:** `<Later>` inside parentheses renders "(… (נגיע לזה בשיעור 2.2))", which reads as a typo on the phone (strip 2.1-04).
- **Fix:** drop the outer parentheses: "במסלול <Later>בריבית קבועה</Later>, שנקבעת לכל התקופה, אין עוגן שמזיז אותה."

### 2.1-8 · קטן · the video runs 3:25
- **Where:** VTT ends at 00:03:25; the page says "כ־3.5 דקות".
- **Problem:** AUTHORING sets 2–3 minutes. Honest label, but over the house limit. (The missing `dist/video/2-1.mp4` is already in `stage-2-components.md`.)
- **Fix:** cut cues 13–14 ("זה עדיין 0.7…", "המרווח הוא החלק…"), which the page covers.

---

## 2.2 — קבועה מול משתנה, ו״ריבית קבועה מול תשלום קבוע״

The four ways (א׳–ד׳) and the "קבוע מה?" table make the required distinction well, and the numbers are right. Two places print a false statement about right numbers.

### 2.2-1 · חשוב · the worked example says the 300 ₪ gap lasts until the next update; it shrinks every month
- **Where:** "צעד 6 — אילו הריבית הייתה משתנה" (MDX 288): "ההפרש: 300 ₪ בחודש, מהחודש ה־61 ועד העדכון הבא."
- **Problem:** in equal principal the gap is the balance × (0.5% − 0.4%). It is 300 ₪ in month 61 (300,000 ₪), 299 ₪ in month 62, and 241 ₪ in month 120 (241,000 ₪). The lesson has just taught, in steps 3–5, that the interest falls as the debt falls; the sentence contradicts it, and a reader who checks month 62 finds 299.
- **Fix:** "ההפרש: 300 ₪ בחודש ה־61. הוא קטן קצת בכל חודש, כי החוב קטן — עד העדכון הבא." (If a number is wanted for month 120, add a fact; no arithmetic in MDX.)

### 2.2-2 · חשוב · exercise 5's solution adds two numbers to the wrong total
- **Where:** exercise 5, solution: "המקדמים: 1 ÷ 1.06 = 0.943396 ו־1 ÷ 1.06² = 0.889996. יחד: 1.833393."
- **Problem:** 0.943396 + 0.889996 = 1.833392. The fact `ex5.factor_sum` (1.833393) is the unrounded sum rounded once, so it is right, but the page shows it as the sum of the two printed numbers. A reader who follows the printed steps gets 20,000 ÷ 1.833392 = 10,908.75, not 10,908.74. The answer box accepts both (tolerance 0.05), so the reader is told "right", then reads a solution whose addition is wrong. The "עיגול" callout covers the payment, not the factors.
- **Fix:** print the factors to 7 places (0.9433962, 0.8899964, together 1.8333927), or add one line: "(מחברים את המספרים המלאים; עם המעוגלים יוצא 1.833392, והתשלום 10,908.75 — הפרש של אגורה)".

### 2.2-3 · חשוב · on a phone, the table that proves "the payment does not move" hides the payment column
- **Where:** "דרך ב׳", the check table (MDX 121–128), phone strip 2.2-02.
- **Problem:** the columns are שנה · חוב בסוף השנה · חוב בתחילת השנה · סכום הריבית · התשלום. At 390px the last column shows only "76 ₪". The sentence under it says "כאן גם אחוז הריבית וגם התשלום לא זזים" — about the column the reader cannot see. "End of year" before "start of year" also reads backwards.
- **Fix:** order the columns as the year happens and as table A does: שנה · התשלום · חוב בתחילת השנה · סכום הריבית · חוב בסוף השנה. The payment is then second, as in table A.

### 2.2-4 · קטן · the "קבוע מה?" table puts the row name last
- **Where:** "קבוע מה? ארבעת המצבים" (MDX 169–174): התשלום · אחוז הריבית · המצב.
- **Problem:** in RTL the first column is the right one, so each row starts with "יורד / לא זז" and ends with its name ("א׳: חלק שווה מהקרן"). The reader has to read every row backwards.
- **Fix:** המצב · אחוז הריבית · התשלום.

### 2.2-5 · קטן · exercise 1 teaches that a variable rate means "every five years"
- **Where:** exercise 1, "איזה משפט מתאר ריבית משתנה?", correct option: "אחוז הריבית מתעדכן פעם בחמש שנים, לפי העוגן באותו יום".
- **Problem:** the lesson defines a variable rate with two rules, and its first example is the prime track. The only accepted description is the second rule, with a specific "five years" the lesson has not called typical (the "מילים שמבלבלות" box only explains the phrase). A reader who thinks of the prime track finds no option for it and may conclude prime is not variable.
- **Fix:** "אחוז הריבית יכול לזוז במהלך המסלול, לפי כלל שבחוזה — למשל עם הפריים, או פעם בכמה שנים".

### 2.2-6 · קטן · exercise 4 has no actor
- **Where:** "במסלול בריבית משתנה נשאר חוב של 180,000 ₪, ל־180 חודשים."
- **Fix:** "במסלול בריבית משתנה נשאר לכם חוב של 180,000 ₪, ל־180 חודשים."

### 2.2-7 · קטן · on the phone, the half-table headers run into each other
- **Where:** "השלימו את הטבלה", phone strip 2.2-05: "חודשחוב בתחילת החודש סכום הריבית".
- **Problem:** "חודש" and "חוב בתחילת החודש" touch, and read as one word. (The same crowding, milder, in 2.6's table: "ריבית בנק ישראל" against "החלטה".)
- **Fix:** shorter headers ("חוב בהתחלה") or a gap after the period column in FillTable (a shared component: report it, do not edit).
