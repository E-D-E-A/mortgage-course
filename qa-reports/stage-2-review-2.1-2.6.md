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
- **Fix:** print the factors to 8 places (0.94339623 + 0.88999644 = 1.83339267, which adds up and gives 10,908.74), or add one line: "(מחברים את המספרים המלאים; עם המעוגלים יוצא 1.833392, והתשלום 10,908.75 — הפרש של אגורה)".

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

---

## 2.3 — צמוד מול לא צמוד

The answer to 0.8's open question ("the rate on an indexed debt is real") arrives on time, the break-even is built from small numbers, and the risk section says what each track protects from. What is left:

### 2.3-1 · חשוב · the prediction asks about lending, then asks how much "you will pay"
- **Where:** the prediction (MDX 48): "שתי אפשרויות **להלוות** 100,000 ₪ לשנה אחת, ואת הכול מחזירים בסוף השנה. … באיזה מסלול **תשלמו** יותר שקלים?"
- **Problem:** "להלוות" is to lend. A beginner reads "you lend 100,000", then "where will you pay more" — and cannot tell whose side they are on. It is the first sentence of the lesson.
- **Fix:** "שתי אפשרויות **ללוות** 100,000 ₪ לשנה אחת…".

### 2.3-2 · חשוב · the worked example's yearly "cost" appears without its first part
- **Where:** "צעד 2": "ההצמדה: 400,000 × 1.015 = 406,000. הריבית: 406,000 × 2.7% = 10,962. העלות לשנה — ההצמדה ועוד הריבית: 16,962 ₪." Same in "צעד 3" (23,124 ₪).
- **Problem:** the step shows the indexed debt (406,000), not the indexation in shekels (6,000), and then adds "the indexation" to the interest. 16,962 appears from nowhere. It is also the first time the course calls indexation a "cost" of the year, although nobody pays it that year (it is added to the debt; step 5 shows that). A beginner compares 16,962 with 19,200 without knowing that 6,000 of it is not paid now.
- **Fix:** add a `difference` fact and a line: "ההצמדה בשקלים: 406,000 − 400,000 = 6,000. העלות לשנה: 6,000 + 10,962 = 16,962 ₪. את ה־6,000 לא משלמים השנה: הם מתווספים לחוב (צעד 5)." Same for 12,000 + 11,124.

### 2.3-3 · קטן · exercise 2's solution calls the total "the interest"
- **Where:** "ההצמדה: 200,000 × 1.03 = 206,000. **הריבית:** 206,000 × 1.02 = 210,120."
- **Problem:** 210,120 is the debt plus the interest; the interest is 4,120. The lesson asks to say which interest is meant.
- **Fix:** "עם הריבית: 206,000 × 1.02 = 210,120."

### 2.3-4 · קטן · exercise 5 lands exactly on a half, has no actor, and is not harder than exercise 3
- **Where:** exercise 5: "מסלול צמוד ב־3% לשנה, ונניח אינפלציה של 2.5% בשנה. איזה אחוז במסלול לא צמוד יעלה בדיוק אותו דבר בשנה (בשתי ספרות אחרי הנקודה)?" Answer 5.58 (exactly 5.575), `tolerance={0.005} near={0}`.
- **Problem:** 1.03 × 1.025 − 1 = 5.575% exactly. Rounding "to two places" can give 5.57 or 5.58 depending on the calculator or habit; 5.57 is marked wrong. The item is one multiplication, the same as "1.03 × 1.02 − 1 = 5.06%" in the explanation, and is labelled מאתגר while exercise 3 (a division) is בינוני. No actor ("מוצע לכם").
- **Fix:** use 2.4% (1.03 × 1.024 − 1 = 5.472 → 5.47), say "מוצע לכם מסלול צמוד…", and label it בינוני; or keep it מאתגר by asking for the break-even of two offers that both need a step.

### 2.3-5 · קטן · one letter, two meanings in the formula box
- **Where:** the box: "π — האינפלציה בשנה … בנוסחה השלישית — האינפלציה שבה שני המסלולים שווים".
- **Problem:** within one box, π is the actual inflation in two formulas and the break-even in the third. The text then says "π היא האינפלציה שהייתה בפועל". A beginner substitutes a forecast into the third formula, or the break-even into the second.
- **Fix:** keep π for inflation and write the third line in words: "נקודת האיזון = (1 + i) ÷ (1 + r) − 1", or note under it "כאן π היא לא האינפלציה שתהיה, אלא זו שבה שני המסלולים שווים".

---

## 2.4 — ״נומינלית״ — מילה אחת, שתי משמעויות

The two-axes table answers the promise made in 0.4 and 0.8, and the worked example shows why 2.3's 1.94% becomes 2.01% with monthly interest. Real and nominal agree across 0.4, 0.8, 2.3 and 2.4. What is left:

### 2.4-1 · חשוב · the first card has no "נומינלית" in it
- **Where:** the card sort. The instruction: "על כל קלף משפט עם המילה ״נומינלית״ (או ״נומינלי״). באיזה מובן היא נאמרת?" Card 1 (MDX 28), the first one shown: "ריבית של 6% לשנה, כלומר 0.5% לחודש".
- **Problem:** the reader is asked in which sense a word is used, on a card that does not contain it. On card 1 of 10 they either doubt the instruction or guess. The card's own explanation ("אינפלציה לא מוזכרת בכלל") assumes the word is there.
- **Fix:** "ריבית **נומינלית** של 6% לשנה, כלומר 0.5% לחודש".

### 2.4-2 · חשוב · the formula box gives r two meanings, then asks to swap it for e
- **Where:** "שתי המרות, אחת אחרי השנייה": "r — בציר 1: הריבית השנתית שכתובה בחוזה. בציר 2: הריבית הריאלית." Then: "בנוסחה של ציר 2 מציבים את e במקום r."
- **Problem:** in a linked track the contract rate (r on axis 1) is 3%, but the r that goes into axis 2 is 3.04% (e). With one letter for both, the natural mistake — putting the contract's 3% into axis 2 — looks correct on the page. The lesson's own point is "say which one"; the box does the opposite. (The table allows r beside i for the real rate, but not two rs in one box.)
- **Fix:** write axis 2 with e directly: "1 + i = (1 + e) × (1 + π)", and define e there as "הריבית האפקטיבית לשנה; במסלול צמוד — אפקטיבית וריאלית". Keep r only for the contract rate.

### 2.4-3 · חשוב · an official claim is stated as fact, with no date and no marker in the sentence
- **Where:** "מובן 1": "לעומת זאת, ממוצע הריביות על משכנתאות שבנק ישראל מפרסם הוא ריבית אפקטיבית. דף מחקר של הצוות מביא דוגמה…"
- **Problem:** this is an official fact that comes from a team research page (the source is `לא אומת`). The sentence has no "(לא אומת)" and no date. The marker appears only under the four-corners table. AUTHORING asks for both in the text. It matters beyond 2.4: 2.5 quotes those averages next to contract rates (item X-2).
- **Fix:** "לעומת זאת, לפי דף מחקר של הצוות (אוגוסט 2026, לא אומת), ממוצע הריביות על משכנתאות שבנק ישראל מפרסם, לחישוב עמלת פירעון מוקדם, הוא ריבית אפקטיבית."

### 2.4-4 · קטן · exercise 6: the right answer is the only long one
- **Where:** exercise 6 (מאתגר): the correct option is "לא צודק: מביאים את שתיהן לאותה פינה — אפקטיבית ולפני אינפלציה — עם הנחה על האינפלציה, ובודקים מה קורה אם ההנחה טועה"; the others are half its length.
- **Problem:** dishonest difficulty: it is found by length, not by understanding.
- **Fix:** make the distractors as complete, for example "לא צודק: מחשבים אפקטיבית לשתיהן ומשווים — האינפלציה לא משנה", and "לא צודק: מחברים את האינפלציה לריבית הצמודה, ואז מחשבים אפקטיבית".

---

## 2.5 — מסלולים קבועים

Both fixed tracks are told in the same five questions, the payments are honestly "תוצאה מוכנה" until 3.1, and "fixed rate ≠ fixed payment" is tied back to 2.2. What is left:

### 2.5-1 · חשוב · the half table marks the lesson's own formula wrong
- **Where:** "השלימו את הטבלה": row 4 gives the index 108.24 and asks for the payment (expected 3,601.89; FillTable tolerance 0.02 ₪). The hint: "כפלתם ב־1.02 את התשלום של השנה הקודמת…? ובמדד, עגלו לשתי ספרות".
- **Problem:** the lesson taught "התשלום בפועל = C × M₁ ÷ M₀", and the table's header is "המדד בסוף השנה". A reader who uses that formula with the index printed in the row gets 3,327.59 × 108.24 ÷ 100 = 3,601.78 and is told "wrong" (11 agorot off). The expected value comes from a different method (chain the previous rounded payment × 1.02), stated only in the sources ("כל שנה מעוגלת לאגורה לפני הכפל הבא"). Row 3 has the same trap at the edge of the tolerance (106.12 gives 3,531.24 against 3,531.26). The worked example even warns "כופלים בחזקה עצמה, לא במדד המעוגל".
- **Fix:** accept both methods (expected 3,601.89, near 3,601.78 → a "נכון בקירוב" note naming the rounded index), or ask the reader to use the formula and set the expected payments from the rounded index: 3,394.14 / 3,462.02 / 3,531.24 / 3,601.78. Either way, say the method above the table.

### 2.5-2 · קטן · the wrong lesson is named for "the rate on an indexed debt is above the indexation"
- **Where:** "למה אחוז הריבית בצמודה נמוך יותר?": "כמו שראינו בשיעור 0.8, ריבית על חוב צמוד מתווספת מעל ההצמדה".
- **Problem:** 0.8 explicitly left this open ("ריבית שכתובה על חוב מוצמד היא משהו אחר — שיעור 2.3"); 2.3 taught it.
- **Fix:** "כמו שראינו בשיעור 2.3".

### 2.5-3 · קטן · exercise 6's answer is printed in the guided tasks
- **Where:** guided task 3 → "מה הייתם אמורים לראות": "614,979.59 ₪"; exercise 6 (מאתגר) asks for the same number, and its solution says "זה מה שראיתם בהמחשה, במשימה 3".
- **Problem:** dishonest difficulty: the מאתגר item is a lookup for anyone who opened the details. Exercise 5 (מאתגר) is also explanation step 4 with new numbers (one division).
- **Fix:** give exercise 6 other numbers (for example 3% a year for 5 years from 481,852.60: 558,599.23 — add a fact), and label exercise 5 בינוני.

### 2.5-4 · קטן · "nothing ever moves" in קל״צ, one row after "the debt only goes down"
- **Where:** the table "מה קבוע, מה משתנה, ומתי", row "מתי משהו זז": "אף פעם, לפי החוזה".
- **Problem:** the debt moves every month (row 2 says so). The row means "nothing moves because of an outside number".
- **Fix:** "מתי משהו זז בגלל מספר מבחוץ (מדד או עוגן)": "אף פעם" / "בכל חודש, עם המדד".

---

## 2.6 — מסלול הפריים

The prime track is built on 2.1 without repeating it, and the interactive answers the map's required "שינוי פריים ומדד לאורך זמן". Recalculation over the remaining months is labelled a course assumption, and every number checks. What is left:

### 2.6-1 · חשוב · הפריים is masculine throughout the lesson
- **Where:** the heading "הפריים **זז**, המרווח נשאר"; "כשהפריים **זז**"; "הפריים **עולה** ל־5%"; "נניח שהפריים **עולה** ל־5.75%"; "אילו הפריים **היה** נשאר"; exercise 5 "הפריים **היה** 5.25%"; the five questions "הפריים **הוא** ריבית בנק ישראל…", "הפריים **זז**"; the exercise 1 option "הפריים **זז**"; the component labels "**הפריים שבחרתם**" and "אילו הפריים **נשאר** 4.75%" (`TrackOverTime.vue` 70–71).
- **Problem:** AUTHORING: "הפריים is feminine (היא זזה)". 2.1 and 2.2 follow it ("הפריים זזה", "הפריים היא"). A reader going from 2.1 to 2.6 meets the same word in two genders, and the lesson's own heading is the most visible case.
- **Fix:** "הפריים זזה, המרווח נשאר"; "כשהפריים זזה"; "הפריים עולה" is the same in both genders, but "היה" → "הייתה", "הוא" → "היא", "זז" → "זזה", "נשאר" → "נשארה"; component: "הפריים שבחרתם" stays, "אילו הפריים נשארה 4.75%". (`TrackOverTime.vue` is shared with 2.5; the label is 2.6's.)

### 2.6-2 · חשוב · 4.75% is called "the real figure", contradicting 2.1
- **Where:** the callout "מספרים להמחשה": "ריבית בנק ישראל והפריים בשיעור הם **נתונים אמיתיים**, עם תאריך."; the worked example's callout: "הפריים 4.75% הוא **הנתון האמיתי** נכון ל־9 באוקטובר 2026 (לא אומת)."
- **Problem:** 2.1 says "גם הערך 4.75% הוא חשבון שלנו: לא מצאנו דף של בנק ישראל שכתוב בו המספר הזה", and both numbers are `לא אומת`. "Real data" over an unverified, computed number is the claim the reliability rules forbid, and the first callout has no "(לא אומת)" at all.
- **Fix:** "ריבית בנק ישראל (3.25%) והפריים (4.75%, חשבון שלנו) נכונים ל־9 באוקטובר 2026 (לא אומת). כל השאר בדוי…"; worked example: "הפריים 4.75% נכון ל־9 באוקטובר 2026 (חשבון שלנו, לא אומת)."

### 2.6-3 · קטן · the rule of thumb's reason points the wrong way for exercise 6
- **Where:** "כלל אצבע: נקודה של פריים": "בדוגמה התשלום עלה פחות, 254.84 ₪, **כי הוא מחושב מחדש על כל החודשים שנשארו**." Exercise 6 (מאתגר): which payment rises more, 20 years left or 5? Correct: 20 years (+218.44 against +182.57).
- **Problem:** "it rises less because it is spread over the remaining months" suggests more months → a smaller rise, which leads to the wrong answer (5 years). The real reason is the one in the next sentence: part of each payment is principal, and that part shrinks; the feedback of exercise 6 says it well ("כשנשאר הרבה זמן, חלק גדול מכל תשלום הוא ריבית"). As it stands the lesson primes the mistake and the exercise punishes it.
- **Fix:** "בדוגמה התשלום עלה פחות, 254.84 ₪: התשלום החדש מחזיר פחות קרן בכל חודש, ואת ההפרש משלמים בחוב שיורד לאט יותר. ככל שנשארו יותר חודשים, התשלום קרוב יותר לריבית עצמה, והעלייה קרובה יותר לכלל."

### 2.6-4 · קטן · the prediction's right answer settles what the lesson calls an assumption
- **Where:** the prediction's correct option: "אחוז הריבית במסלול עולה ב־0.25 נקודת אחוז, **והתשלום מחושב מחדש על היתרה — ועולה**"; later "״התקופה נשארת, התשלום משתנה״ — הנחה של הקורס … כתוב בחוזה".
- **Problem:** the rate part is general; the recalculation is a course and Mogi assumption (DEC-3, pending Eylon). The graded answer states it as the fact.
- **Fix:** "אחוז הריבית במסלול עולה ב־0.25 נקודת אחוז, ולכן גם התשלום (איך בדיוק — לפי החוזה)".

### 2.6-5 · קטן · exercise 1's right answer is the only one with an explanation attached
- **Where:** exercise 1 options: "המרווח: חצי נקודת אחוז מתחת לפריים. הפריים זז" against "אחוז הריבית במסלול", "התשלום החודשי", "הפריים".
- **Fix:** "המרווח מהפריים" alone (the feedback already explains).

### 2.6-6 · קטן · "not indexed" lost its marker, and live figures say "היום"
- **Where:** "**הצמדה:** אין. מסלול הפריים לא צמוד למדד." (2.3 wrote "מסלול שהעוגן שלו הוא הפריים אינו צמוד (לא אומת; שיעור 2.6)", and 2.6's sources have no item for it). "ב־P−0.5: 4.25% **היום**."; "**התוספת של 1.5 נקודות אחוז נכונה נכון ל־**9 באוקטובר 2026".
- **Problem:** the claim 2.3 deferred to 2.6 arrives without its source or marker. AUTHORING: never "היום" for live data. "נכונה נכון" is a doubled word.
- **Fix:** "הצמדה: אין. מסלול הפריים לא צמוד למדד (לא אומת; לפי תעתיק ההוראה 451 ב־Brain)", with the source from 2.3; "ב־P−0.5: 4.25%, נכון ל־9 באוקטובר 2026"; "התוספת של 1.5 נקודות אחוז היא הערך נכון ל־9 באוקטובר 2026 (לא אומת)".

### 2.6-7 · קטן · a button named "שלב 2" in a course whose stages are "שלב"
- **Where:** the interactive's button "שלב 2: להזיז גם את המדד", and task 4 "לחצו על ״שלב 2…״".
- **Problem:** the reader is in "שלב 2 · ריביות, מסלולים ושיטות החזר"; the button reads like a link to the stage.
- **Fix:** "גם המדד: להזיז אותו" / "להוסיף את המדד".

---

## Cross-lesson items

**What agrees, and needs nothing:** prime's three layers and the 1.5 (0.10 → 2.1 → 2.2 → 2.6: always "נכון ל־9 באוקטובר 2026, לא אומת", the source an open question); "ריבית קבועה אינה תשלום קבוע" (1.3 → 2.2 → 2.5, same three conditions); real against nominal (0.4, 0.8, 2.3, 2.4 use the words and the letters i, r, e, m, π the same way, and 2.4 settles both promises); the monthly rate as annual ÷ 12 (every lesson, with ENG-223 as the source); the 2026 Bank of Israel decisions (2.6's table matches 0.10's 4.25% → 3.25%); no real bank names anywhere; every teaching rate under a "מספרים להמחשה" line; every "בשיעור הבא" line uses the map's exact title (2.2, 2.3, 2.4, 2.5, 2.6, 2.7); "נקודת אחוז" singular up to one and plural above it.

### X-1 · חשוב · case A has a different prime track in 2.1 and 2.6, and 1.4 gave it a third
- **Where:** 1.4: "יועץ מציע לנועם ושירה תמהיל להמחשה, בשלושה חלקים שווים: שליש … שליש באחוז שזז יחד עם ריבית בנק ישראל…" (546,666.67 ₪ each). 2.1: "נועם ושירה (תיק א׳) **מקבלים הצעה**: אחד המסלולים בתמהיל שלהם הוא 600,000 ₪ ב״פריים פחות 0.8״". 2.6: "נועם ושירה מתיק א׳ **שוקלים** לשים 500,000 ₪ במסלול פריים ל־25 שנה, ב־P−0.6". In between, 2.2 (360,000 ₪, 30 years, fixed), 2.3 (400,000 ₪) and 2.5 (500,000 ₪ + 500,000 ₪, 25 years) — 2,360,000 ₪ of tracks on a 1,640,000 ₪ loan.
- **Problem:** the course map makes case A the one story the learner follows. In 2.1 they already hold an offer at P−0.8; four lessons later they "consider" P−0.6 for a different amount and term, with no word on what changed. A beginner who tracks the case (as stage 1 trained them to) either thinks they missed a lesson or that a spread changes on its own — the exact mistake 2.1 exercise 5 warns against.
- **Fix:** make 2.1 a consideration, not an offer ("נועם ושירה שוקלים מסלול של 600,000 ₪ ב״פריים פחות 0.8״"), and in 2.6 reuse it or say why it differs ("בהצעה אחרת, מבנק ב׳, המרווח הוא −0.6"). Add one line to each case-A example in 2.2–2.6: "זה תרגיל על חלק מההלוואה, לא התמהיל שלהם; את התמהיל נבנה בשלב 5."

### X-2 · חשוב · 2.5 quotes Bank of Israel averages next to contract rates; 2.4 just said those averages are effective rates
- **Where:** 2.4: "ממוצע הריביות על משכנתאות שבנק ישראל מפרסם הוא ריבית אפקטיבית". 2.5: "בפברואר 2026 הממוצע של אחוזי הריבית על הלוואות חדשות היה 4.74% בקל״צ ו־3.25% בקבועה צמודה (לא אומת מול המקור)", in a lesson whose tracks are 5% and 3% contract rates.
- **Problem:** the reader leaves 2.4 with "always ask which corner"; one lesson later the course puts two numbers from possibly different corners side by side and does not say which. Either 2.4 over-generalises (its source is about the early-repayment averages, not every series) or 2.5 compares an effective average with nominal contract rates. Both are official facts from team transcriptions, unverified.
- **Fix:** narrow 2.4 to what its source says ("הממוצעים שבנק ישראל מפרסם לחישוב עמלת פירעון מוקדם"), and in 2.5 add which kind the February 2026 series is, or "(לא בדקנו אם אלה ריביות כתובות או אפקטיביות; שיעור 2.4)".

### X-3 · קטן · the Eylon list and the "Eylon approved" wording disagree
- **Where:** `research/eylon-list.md`, DEC-3: "איפה בקורס: 2.5, 2.6, 2.7", Eylon column empty. The lessons: 2.1 (answers 5 and 15), 2.2 (answers 1 and 4) and 2.3 (answers 3 and 4) also cite Brain 67436545, and all six write "אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08". 2.5's and 2.6's badges are "החלטה של Mogi על בסיס ידע מהשטח של אילון".
- **Problem:** the list sent to Eylon misses three lessons that use the decision. And either Eylon approved it (then why is it on the pending list?) or it is pending (then "אילון אישר" presents it as settled). Where a market claim rides on the decision (2.5: indexation is monthly; 2.6: the prime change applies "לפי תנאי המסלול"), stage 1's second read (V4) asked for a separate `ידע מהשטח … ממתין לאישור אילון` badge.
- **Fix:** add 2.1, 2.2 and 2.3 to DEC-3's row. Say in the list what Eylon approved on 2026-10-07 (the calculation rules) and what is still for him to confirm (the market claims). In 2.5 and 2.6, split the badge as in V4.

### X-4 · קטן · repository paths are shown to learners in the sources
- **Where:** 2.4: "(מילון המונחים של הריפו edea-mortgage, CONTEXT.md)"; 2.5: "(רישום השדות v1.yaml של Mogi, כפי שנקרא ב־research/notes/repo-domain.md)"; 2.6: "ורישום השדות v1.yaml".
- **Problem:** AUTHORING: code paths go in an MDX comment, never shown. A file path means nothing to the reader.
- **Fix:** "רישום השדות של אפליקציית היועץ של Mogi (גרסה 1)" / "מילון המונחים של Mogi", and the paths in the closing MDX comment.

### X-5 · קטן · four spreadsheet formulas break on the phone, with "=" alone on a line
- **Where:** 2.3 "איך מחשבים": `=100000*(1+C1/100)*(1+B1/100)` and `=((1+A1/100)/(1+B1/100)-1)*100`; 2.4: `=((1+A1/1200)^12-1)*100` and `=((1+A1/1200)^12*(1+B1/100)-1)*100`. At 390px each wraps after "=" (checked in Chromium: "= ⏎ ((1+A1/1200)^12-1)*100").
- **Problem:** in an RTL paragraph the "=" lands at the left end of one line and the formula starts the next, so the reader sees a formula without its "=" and a stray "=". Stage 1 fixed the same thing in 1.1 by putting one formula per line.
- **Fix:** as in 1.1: a short list, one formula per item, each in its own `.ltr` block (`white-space: nowrap` with horizontal scroll if needed).

### X-6 · קטן · two rounding rules for the same table, unannounced
- **Where:** 2.2's "עיגול" callout states the course rule: "את התשלום מעגלים לאגורה, ובטבלה מעגלים לאגורה את סכום הריבית של כל שנה … את האגורה הזו מתקנים בתשלום האחרון" (as AUTHORING: the statement convention). 2.5 and 2.6 print balances computed with the unrounded payment ("עיגול לאגורה בסוף החישוב"): 582,076.13 after a year where a statement paying 3,959.73 ₪ with interest rounded monthly shows 582,076.18; 481,852.60 after five years against 481,852.28.
- **Problem:** stage 3 builds amortisation tables by the statement rule; a learner who rebuilds 2.5's numbers will be off by agorot to tens of agorot and think they erred. AUTHORING asks for a rounding callout "the moment two numbers could differ by an agora".
- **Fix:** a one-line callout in 2.5 and 2.6: "היתרות כאן מחושבות בנוסחה, בלי לעגל את התשלום. בלוח של בנק, שמעגל כל חודש, הן יכולות לצאת שונות בכמה אגורות (שלב 3)." Or recompute with the statement convention.

---

## Count

No חוסם. 15 חשוב, 26 קטן.

The חשוב items, in the order I would fix them: 2.2-1 and 2.2-2 (false statements about right numbers), 2.5-1 (the half table marks the taught formula wrong), 2.3-1 (lend/borrow), 2.4-1 (the card without the word), 2.4-2 (two meanings of r), 2.6-2 and 2.4-3 (reliability wording), 2.1-1 and 2.1-2 (the addition and the spread comparison stated without their conditions), X-1 (case A), X-2 (effective against contract rates), 2.6-1 (the gender of הפריים), 2.2-3 (the hidden payment column), 2.3-2 (the yearly cost from nowhere).
