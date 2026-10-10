# QA report: lessons 3.1–3.6, read as a beginner

Date: 2026-10-10. Reviewer: first-round QA. I edited no source, lesson, component, data or research file; this report is the only file I wrote.

**The reader:** someone who finished stages 0–2 (percent, interest, effective rate, present value, inflation and index, banks, bonds; the mortgage world, tracks, the mix; rates, prime, anchors, indexation, Spitzer against equal principal, grace, balloon) and has never built an amortization schedule.

**What I read:**
- the visible text of `dist/lessons/3-{1..6}/` (rebuilt 11:37; the MDX last changed at 11:04, so the build is current), and the six MDX files, including every exercise `errors` list and FillTable config;
- `public/video/3-1.he.vtt` and the 22 key frames `qa/video/3-1-t*.png` (3.2–3.6 have no video, as the map says);
- `data/lessons/3-{1..6}.json` (regenerated at 11:39; I re-read the facts I quote and they were unchanged), the definitions files `src/data/definitions/3-{1..6}.json`, and the labels of `PaymentFinder`, `ScheduleBuilder`, `LinkedSchedule` and `RateReset`;
- the phone screenshots `qa/screens/phone_lessons_3-{1..6}_.png`, cut into strips. I also ran a live Chromium check at 390px over every `.ltr` span on the six pages (whether it reads right to left, wraps or overflows), and took my own phone shots of each table. Note: the spreadsheet formulas in the callouts look scrambled when you view a strip at reduced size, but a pixel crop shows they render correctly ("=" on the left). That is not a bug;
- `course/AUTHORING.md` (each rule checked), `course/course-map.md` (stage 3, the term list, the case timeline), `research/eylon-list.md`, the earlier report `qa-reports/stage-2-review-2.1-2.6.md` (I follow its format), and the stage 0–2 passages that 3.x cites (0.3 rule of 72, 0.6, 2.2 `C = P ÷ S`, 2.5 `C × M₁ ÷ M₀`, 2.7, 2.9, 2.10).

**Math check.** I recomputed independently in Python `Decimal` (my own amortization code: the monthly rate is the annual rate ÷ 1200, each month's interest is rounded half-up to the agora, the payment is rounded once and the last month closes the schedule. The 3.5/3.6 variants run without rounding):
- 3.1: all trials (1,000 / 1,020 / 1,015 / 1,015.02 / 1,015.03), the factors and S (1.97039506, 2.97024814, 154.09330295), 1,015.02, 20,200.33, 3,893.74 and the last payment 3,895.68, the leftovers 158,157.51 / 1.94 / −2.03 / 3.97, the worked example (3.56904580, 0.28018693, 0.71981307, 2,656.94, 744.44), the half table (10,039.95 / 9,999.95 / 9,960.11 / 30,000.01), all six exercises and every listed error, and the Brain checks 4,974.72 and 4,742.11;
- 3.2: the 3-month table, rules 1–3, months 1, 2, 67, 68 and 240 of the 20-year loan, 934,499.54 / 334,499.54, the rule of 72 (174 / 175, 2,979.94 against 2,987.48 against 2,991.86), the 30-year case (3,147.99 / 747.99), Dana's row 37, the half table, and exercises 2–6 with their errors;
- 3.3: the prediction (622,549.11 table, 622,550.30 formula), 40,099.66, 498,932.34 / 498,933.29 / 498,932.96, 101,066.71, 370,513.81, 207,338.76, month 148, Yael and Tomer (373,081.51 / 373,080.82), the half table, and exercises 2–6;
- 3.4: all six methods on 600,000 ₪ (4,900 / 4,890 / 2,510; 4,016.41; 629,442.14 / 629,442.12 / 4,213.50; 602,400; 1,564,020.10 / 1,564,020.08; total interest 334,499.54 / 289,200 / 344,541.47 / 360,676.60 / 576,000 / 964,020.10), the prediction (134,885.02 / 133,822.56), the worked example (410,922.24, 2,843.60, 10,440.71), the half table, and exercises 2–6;
- 3.5: the dates and interim days (9, 11, 14, 16, 13, 18), every interim-interest amount, months 1–3 of the linked table, 1,597.24 / 397.24 / 401,200, the illustration answers (660.63, 2,222.05, 2,704.21, 280,052.26, 69,425.93, 400,583.66, 390,831.58), the worked example, the half table, and exercises 3–7;
- 3.6: 451,903.77, 2,259.52, 1,807.62, 0.361513 / 0.638487, 3,538.86, the three wrong formulas (3,582.16 / 3,915.50 / 3,237.58), the zero end balance, the equal-principal case, the illustration answers (3,508.57, 415,777.46, 2,965.00), Galit (314,674.74, 2,042.11), the half table (2,746.96 / 2,851.70 / 2,709.33), and exercises 3–6.

Every result the module produced matches my recomputation. The trouble is elsewhere: in several places the page prints an equality whose **displayed** operands do not give the displayed result, or states a rule the numbers contradict. Those are items 3.3-1, 3.3-2, 3.5-1 to 3.5-4, 3.6-1, 3.6-3 and 3.6-6, and the shared cause is X-1.

**Phone.** No `<M>` or `.ltr` span reads right to left, and no page scrolls sideways. Three tables lose the column the text talks about, or run two numbers together: 3.2-3, 3.5-7 and 3.6-4.

---

## 3.1 — מאיפה בא החזר השפיצר

This is a strong lesson. It guesses first, then uses present value, then derives the series step by step, and the "between two bounds" check catches the two classic slips. The video follows the page. What is left:

### 3.1-1 · should fix · "באמצע" is not the middle
- **Where:** "**ניסיון 3: באמצע — 1,015 ₪.**"
- **Problem:** the two earlier tries were 1,000 and 1,020, so the middle is 1,010. That is also the prediction's distractor and exercise 2's payment. A beginner who checks the arithmetic stalls on the lesson's first new idea. The page gives no reason for choosing 1,015.
- **Fix:** "ניסיון 3: בין השניים, קרוב יותר ל־1,020 — 1,015 ₪." Better still, show why: 1,000 leaves 30.20 and 1,020 overpays 10, so the answer is 30.20 ÷ 40.20 of the way from 1,000. That gives <M>1,000 + 20 × 30.20 ÷ 40.20 = 1,015.02</M>, which is the exact payment to the agora. I checked it: 1,015.0249 against the exact 1,015.0249. This is a nice beginner tool, but it needs a fact for each number.

### 3.1-2 · should fix · the callout says "באגורות" but its own example differs by almost 2 ₪
- **Where:** the callout "למה התשלום האחרון שונה באגורות": "בהלוואה של 20 שנה 3,895.68 ₪ במקום 3,893.74 ₪ … בתרגילים, תשובה שרחוקה באגורות מתקבלת."
- **Problem:** 3,895.68 − 3,893.74 = 1.94 ₪. That is shekels, not agorot, and an exercise answer 1.94 ₪ off is outside `near` (1 ₪). Guided task 3 says it correctly ("עיגול קטן בתשלום מצטבר לשקלים בסוף").
- **Fix:** retitle it "למה התשלום האחרון שונה מעט". Add a difference fact and write: "בהלוואה של 20 שנה, 1.94 ₪ יותר: אגורה של עיגול, 240 פעמים, עם הריבית עליה (משימה 3 בהמחשה)."

### 3.1-3 · should fix · two algebra steps a beginner has not been taught
- **Where:** step 3, "בצד שמאל: S × 1.01 − S הוא S × 0.01"; step 6, "לחלק ב־S פירושו לכפול ב־r ולחלק ב־(1 − (1 + r)^−n)".
- **Problem:** stages 0–2 never taught factoring a common term or dividing by a fraction. The reader can check step 6 numerically ("בדיקה על הדוגמאות"), but cannot see why it holds. This is the one place in the derivation where the reader has to take the step on trust.
- **Fix:** step 3: "<M>S × 1.01 − S × 1 = S × (1.01 − 1) = S × 0.01</M>". Step 6, one line with small numbers: "לחלק בשבר זה לכפול בשבר ההפוך: <M>20 ÷ (1 ÷ 4) = 20 × 4</M>. כאן <M>S = (1 − (1 + r)<sup>−n</sup>) ÷ r</M>, ולכן <M>P ÷ S = P × r ÷ (1 − (1 + r)<sup>−n</sup>)</M>."

### 3.1-4 · nit · the formula box splits the formula after "C = P × r"
- **Where:** the formula box, lines "C = P × r" and "÷ (1 − (1 + r)^−n)".
- **Problem:** on a phone the first line reads as a complete formula. The summary and the five questions write it on one line, and it fits 340px.
- **Fix:** one line, `whitespace-nowrap`.

### 3.1-5 · nit · "מתרגיל 3 צריך מחשבון עם מקש חזקה"
- **Problem:** exercise 3 is two divisions (1 ÷ 1.005, 1 ÷ 1.005²). The power key is first needed in exercise 4.
- **Fix:** "מתרגיל 4".

### 3.1-6 · nit · likely mistakes with no message
- **Where:** exercise 2 and exercise 6.
- **Problem:** in exercise 2, charging 1% of 2,000 in both months gives 20.00 (2,000 + 20 − 1,010, then 1,010 + 20 − 1,010), and that gets a generic "wrong". The listed error 1,010 (the balance after month 1) is also the payment itself, but its message speaks only of the balance. In exercise 6, n = 25 (years) gives 95,285.30, with no message.
- **Fix:** add `{20, "חישבתם ריבית על 2,000 ₪ בשני החודשים. בחודש השני הריבית היא על היתרה, 1,010 ₪."}`, and for exercise 6 `{95,285.30, "הצבתם n = 25, מספר השנים. התשלומים חודשיים: n = 300."}` (as facts). Extend the 1,010 message: "…או שזה התשלום עצמו".

### 3.1-7 · nit · a rule for a negative balance that the page does not state
- **Where:** guided task 2: "בתשלום של 4,000 ₪ שילמתם 41,875.89 ₪ יותר מדי."
- **Problem:** `paymentTrial` stops charging interest once the balance is below zero. A reader who copies the lesson's rules into a sheet gets −42,680.02 and thinks they made a mistake.
- **Fix:** one sentence above the illustration: "כשהיתרה יורדת מתחת לאפס, ההמחשה לא מחשבת עליה ריבית: היא רק מראה כמה שילמתם מעבר לחוב."

### 3.1-8 · nit · the worked example's premise
- **Where:** "ההצעה לא מראה את ההחזר החודשי. כמה הוא?"
- **Problem:** real offers show a first payment (3.8 teaches "החזר ראשון"), so the premise plants a false picture of an offer.
- **Fix:** "רון ומאיה רוצים לבדוק בעצמם את ההחזר שבהצעה. כמה הוא צריך להיות?"

### 3.1-9 · nit · "בריבית אפס אין מה לחלק"
- **Where:** "מתי הנוסחה נכונה?", item 5.
- **Fix:** "בריבית אפס הנוסחה נותנת 0 ÷ 0; התשלום הוא פשוט P ÷ n."

### 3.1-10 · nit · video
- **Where / problem:**
  - Cue 5, "שילמנו 10 ₪ יותר מדי": the course addresses the learner in the plural ("שילמתם"), as the page does.
  - Frames t146–t154 show "r = 0.004 · n = 240 · 1 − 1.004^−240 = 0.61637321". The middle dots read as multiplication ("240 · 1").
  - Frames t104–t112 jump from "S × 0.01 = 0.01970395" straight to the general S formula with r. The page shows "S = 0.01970395 ÷ 0.01" first.
- **Fix:** "שילמתם". Put r, n and the subtraction on three lines. Add one frame, "S = 0.01970395 ÷ 0.01 = 1.970395". The length (2:51) and the subtitle area are fine, and every number matches its fact.

### 3.1-11 · nit · the next-lesson line reads as a verb
- **Where:** "…חודש אחר חודש — ובונה לוח הסילוקין של הקורס."
- **Fix:** "— ונכיר את ״בונה לוח הסילוקין״ של הקורס."

### 3.1-12 · nit · a misquote, and a source that nothing cites
- **Where:** exercise 5: "״מההצעה או ממחשבון״"; in Sources, the Mogi decision "ההחזר שמוצג ללקוח מחושב לפי שיטת ההחזר של כל מסלול…".
- **Problem:** 2.9 actually reads "מההצעה או מחשבון" (2.9 is missing the מ). No sentence in 3.1 uses the Mogi decision.
- **Fix:** correct 2.9's typo so the quote matches. Either tie the decision to a sentence ("כך גם Mogi מחשבת את ההחזר בשפיצר") or drop it.

---

## 3.2 — פירוק תשלום לקרן ולריבית

The three row rules, the (1 + r) growth of the principal part, and the builder with its "check a row" box answer what the map requires. All the numbers check. What is left:

### 3.2-1 · must fix · "בהלוואה ארוכה, בהתחלה רוב התשלום ריבית" is taught as a rule, but it depends on the rate
- **Where:** the summary, "בהלוואה ארוכה, בהתחלה רוב התשלום ריבית. בהלוואה קצרה — לא."; the five questions, "בהלוואה ארוכה, בשנים הראשונות רוב התשלום הוא ריבית"; the heading "בהלוואה ארוכה: בהתחלה, רוב התשלום ריבית". It carries on into 3.3: the "חצי מהזמן" paragraph and exercise 1's **graded** correct option, "יותר מחצי, כי בהתחלה רוב התשלום הוא רכיב ריבית".
- **Problem:** in month 1 the interest is more than half the payment only above a threshold rate: about 3.47% for 20 years, 2.78% for 25 and 2.31% for 30 (computed). The course's own 3.5 track (400,000 ₪, 3%, 20 years) pays 1,222.05 principal against 1,003.00 interest in month 1. A learner will repeat this as a fact. What holds at any positive rate is weaker: the principal part starts small, below P ÷ n, and grows.
- **Fix:** "בהלוואה ארוכה, באחוז ריבית כמו בדוגמה (4.8% ל־20 שנה), בהתחלה רוב התשלום ריבית. באחוז נמוך יותר — למשל 3% ל־20 שנה (שיעור 3.5) — רכיב הקרן גדול מרכיב הריבית כבר מהחודש הראשון; אבל גם אז הוא מתחיל קטן וגדל." In 3.3 exercise 1: "יותר מחצי, כי בהתחלה רכיב הקרן קטן מהקרן חלקי מספר החודשים". That reason is true at every positive rate.

### 3.2-2 · should fix · the spreadsheet callout uses "C" for two things, and the sheet never closes
- **Where:** "ב־C רכיב הריבית, =ROUND(B2*0.004,2); ב־D רכיב הקרן, ההחזר החודשי פחות C; ב־E היתרה בסוף, B פחות D."
- **Problem:** in this lesson C is the monthly payment, so "ההחזר החודשי פחות C" reads as "C minus C". Only column C gets a formula. And the sheet as described ends with 1.94 ₪ unpaid, because nothing tells the reader that the last row closes the schedule.
- **Fix:** "בעמודה C … ב־D: <span class="ltr">=3893.74-C2</span>; ב־E: <span class="ltr">=B2-D2</span>; ובשורה הבאה B3 הוא <span class="ltr">=E2</span>. (אותיות העמודות אינן האותיות של הנוסחה.) בשורה האחרונה התשלום הוא היתרה ועוד הריבית, כדי לסגור את העיגול."

### 3.2-3 · should fix · on a phone, the first table hides the columns the rules read from
- **Where:** the 3-month table (MDX 63–88), `min-w-[32rem]`.
- **Problem:** at 390px only חודש · יתרה בתחילת החודש · רכיב ריבית · רכיב קרן are visible (my shot). Rule 1 ("…הם התשלום") and rule 2 ("…היא היתרה בסוף החודש") read from the two hidden columns. "חודש" also touches "יתרה בתחילת החודש".
- **Fix:** drop `min-w`, shorten the headers ("יתרה בהתחלה", "יתרה בסוף"), and order the columns the way the rules run: חודש · יתרה בהתחלה · רכיב ריבית · רכיב קרן · התשלום · יתרה בסוף. Or render this table as the builder's month cards.

### 3.2-4 · nit · a formula line with no left side
- **Where:** the formula box, line 2: "C − I_k".
- **Fix:** "רכיב הקרן = C − I_k" (3.5 already writes its lines with Hebrew names).

### 3.2-5 · nit · step 4 could show its number
- **Where:** "…רכיב הריבית קטן ב־r כפול רכיב הקרן הזה."
- **Fix:** add "בדוגמה: <M>0.4% × 1,493.74 = 5.97</M> — בדיוק ההפרש בין 2,400 ל־2,394.03." The fact `long.int_drop` already exists.

### 3.2-6 · nit · exercise 4's likeliest mistake has no message
- **Problem:** taking the whole payment off the balance gives (250,000 − 1,432.49) × 0.4% = 994.27.
- **Fix:** add `{994.27, "הורדתם מהיתרה את כל התשלום. רק רכיב הקרן מקטין אותה: 250,000 − 432.49."}`.

### 3.2-7 · nit · a math sign in a heading
- **Where:** "## רכיב הקרן מוכפל בערך כל 72 ÷ אחוז הריבית שנים". On a phone it breaks after "72 ÷".
- **Fix:** "רכיב הקרן מוכפל בערך כל 72 חלקי אחוז הריבית — בשנים".

---

## 3.3 — יתרת החוב בכל נקודת זמן

The idea "the balance is the present value of what is left" is built cleanly on 3.1. "Why not 600,000 minus what you paid" answers the classic error, and the inverse exercise (6) leads into 3.6. What is left:

### 3.3-1 · should fix · two divisions on the page do not give the printed result
- **Where:** "<M>S = 0.51254818 ÷ 0.004 = 128.13704553</M>"; worked step 3, "<M>0.44228425 ÷ 0.00375 = 117.94246734</M>".
- **Problem:** 0.51254818 ÷ 0.004 = 128.137045 and 0.44228425 ÷ 0.00375 = 117.94246667. The printed S comes from summing the series directly, not from the division shown. The shekel results are the same either way (498,932.34 and 373,081.51). But the lesson tells the reader to keep eight digits, and a reader who checks gets different digits. This is the same kind of item as 2.2-2.
- **Fix:** print what the division gives (128.137045, 117.94246667), or write "<M>S = (1 − 1.004<sup>−180</sup>) ÷ 0.004 = …</M>" without the rounded middle step, as the exercise 3 solution already does.

### 3.3-2 · should fix · "עד שקל של עיגול" — the gap is 1.19 ₪
- **Where:** PredictionReveal: "…= 622,550.30 — אותו סכום, עד שקל של עיגול."
- **Problem:** the table says 622,549.11, a gap of 1.19 ₪.
- **Fix:** add a difference fact and write "הפרש של 1.19 ₪, מ־180 חודשים של עיגול".

### 3.3-3 · should fix · the hard exercise 5 is answered in the explanation
- **Where:** exercise 5 (מאתגר): "כמה מהקרן החזרתם בחמש השנים הראשונות?" on the 600,000 ₪ loan. The explanation already prints "החוב ירד רק ב־600,000 − 498,933.29 = 101,066.71 ₪", and the exercise 5 solution says "(מהההסבר)".
- **Problem:** the exercise is a lookup. This is the same kind of item as 2.5-3.
- **Fix:** ask about 10 years (table 370,513.81, so 229,486.19 repaid; the formula value needs a fact), or use another loan; otherwise relabel it קל.

### 3.3-4 · nit · the prediction gives itself away
- **Where:** the options "בערך 450,000 — חצי…", "**בערך 622,549**", "כמעט אפס…", "אי אפשר לדעת…".
- **Problem:** only one option is an odd, exact-looking number, and it carries "בערך".
- **Fix:** "בערך 620,000" (a rounding fact), or make the distractors equally specific.

### 3.3-5 · nit · "תמיד" in the heading drops the conditions
- **Where:** "## היתרה בשפיצר תמיד מעל הקו הישר" (the body says "בריבית גדולה מאפס").
- **Problem:** the claim needs a rate that does not move and no indexation. In 3.5 an indexed balance even rises above the loan.
- **Fix:** "היתרה בשפיצר מעל הקו הישר (באחוז קבוע, בלי הצמדה)".

### 3.3-6 · nit · a number in words that comes from no fact
- **Where:** exercise 4 solution, "הפרש של שקל וחצי".
- **Fix:** a difference fact (1.54 ₪).

---

## 3.4 — לוחות של קרן שווה, גרייס ובולט

"Same three rules, different payment" is the right frame. Negative principal explains 2.10's "interest joins the debt" in one line, and the six-method builder works. Every number checks. What is left:

### 3.4-1 · should fix · the page says g is not in the letter table; it is
- **Where:** "מספר חודשי הגרייס מסומן ב־g (אות שאינה בטבלת האותיות של הקורס, ולכן לא מתבלבלת עם אחרת)."
- **Problem:** AUTHORING's table lists "g — grace months (חודשי גרייס), first 3.4". The sentence is false, and it tells the reader the letter is a one-off when the course will reuse it.
- **Fix:** "מספר חודשי הגרייס מסומן ב־g — אות חדשה בטבלת האותיות של הקורס, והיא תסמן חודשי גרייס מעכשיו."

### 3.4-2 · should fix · a market claim with no source and no marker
- **Where:** "מתי הנוסחאות נכונות?": "בהצעה אמיתית קובעים התנאים שבה: **יש הלוואות שבהן הגרייס מתווסף לתקופה**."
- **Problem:** the Mogi-decision badge covers the course default (grace inside the term), not the claim about the market. This is the same split stage 1's second read (V4) asked for.
- **Fix:** add "(לא אומת)" and a source item, or rephrase it as a condition: "אם בחוזה הגרייס מתווסף לתקופה, n גדל ב־g."

### 3.4-3 · nit · balloon is promised but never shown, and בולט/בוליט changes without a word
- **Where:** the opening lists "בלון ובוליט (שיעור 2.10)", but no table or sentence covers balloon. The title (from the map) is "…גרייס ובולט" and the body says "בוליט".
- **Fix:** one line in the opening: "בלון — לפי ההגדרה ששיעור 2.10 הביא, כמו בוליט. ״בולט״ בכותרת הוא הכתיב של ההוראה; ״בוליט״ — של אפליקציית Mogi."

### 3.4-4 · nit · exercise 6 can only be done in the builder
- **Where:** "(את הריבית בשפיצר קחו מהבונה, ״מזה ריבית״.)"
- **Fix:** add the route the reader already knows from 3.2: "או: 120 כפול ההחזר החודשי, פחות 150,000 ₪". That gives 39,163.20, within `near`.

---

## 3.5 — הצמדה לאורך ציר הזמן

The lesson pairs the base index with the 1/15/16 rule and the interim period (all marked "לא אומת", with the transcript as source). The linked table makes "the indexation joins the debt, not the payment" visible, and the worked "מה לקחת מזה" (a balance above the loan after one payment) is a real insight. The arithmetic on the page is the problem, because 3.5 computes without rounding (see X-1):

### 3.5-1 · must fix · the worked example's payment equation is false
- **Where:** step 3, "<M>C = 1,211.70</M>"; step 5, "<M>1,211.70 × 100.4 ÷ 100 = 1,216.54</M>, כלומר 4.84 ₪ יותר".
- **Problem:** 1,211.70 × 1.004 = 1,216.5468, which rounds to **1,216.55**. The page uses the unrounded payment (1,211.6975). Everything after it shifts: 4.85 more, principal 547.22, balance 250,452.78. This is the lesson's central formula, and its worked example does not hold. Meanwhile the half table uses the rounded 2,218.39, which is right.
- **Fix:** compute from the payment the page prints: 1,216.55 / 4.85 / 547.22 / 250,452.78. Or print C unrounded and say so. The first is better (X-1).

### 3.5-2 · must fix · exercise 7's solution subtracts wrong
- **Where:** "<M>1,863.29 − 937.07 = 926.23</M>… היתרה … 320,353.77".
- **Problem:** 1,863.29 − 937.07 = 926.22, so the steps as printed give 320,353.78. The answer box accepts both (tolerance 0.05), but the solution the reader checks against is wrong.
- **Fix:** as 3.5-1.

### 3.5-3 · should fix · the month-by-month walk-through prints equalities that fail by an agora
- **Where:**
  - "<M>399,977.95 × 100.5 ÷ 100.3 = 400,775.52</M>": the printed operands give 400,775.51;
  - month 2's balance "399,547.97", where 400,775.52 − 1,227.54 = 399,547.98;
  - month 3's principal "1,229.39", where 2,227.26 − 997.88 = 1,229.38, and its balance 397,921.03 against 397,921.02.
- **Problem:** the "עיגול" callout warns this can happen. But a lesson that teaches by row arithmetic should not print a failing equality, and the warning comes after the table.
- **Fix:** compute the rows from rounded values, as 3.2 does (X-1). If you keep continuous values, move the rounding callout above "חודש 1" and write "בערך" in the equalities that do not close.

### 3.5-4 · should fix · "כל אחד מ־240 התשלומים גבוה ב־0.3%… יחד 1,597.24"
- **Problem:** the page has just shown the per-payment extra as 6.66 ₪, and 240 × 6.66 = 1,598.40. The 1,597.24 uses 6.655….
- **Fix:** "כל תשלום גבוה ב־6.655 ₪ בערך (מוצג מעוגל, 6.66)", or compute the total from the rounded payments.

### 3.5-5 · should fix · the 16th falls into neither half of the heading
- **Where:** the heading "## מאיזה יום הלוח מתחיל: עד ה־15 או אחרי ה־16" (the map's wording); "צעד 2 — כסף ב־20 בנובמבר 2026. זה אחרי ה־16."; exercise 6's message "הכסף הגיע אחרי ה־16" (19 January).
- **Problem:** the rule itself says "מה־16 ועד סוף החודש", and exercise 2 tests exactly the 16th. A reader of the heading sees a gap.
- **Fix:** "עד ה־15, או מה־16"; "זה מה־16 ואילך". The map wording would also change; the map is a shared file, so I flag this for the coordinator.

### 3.5-6 · should fix · the illustration's monthly index step is the twelfth root, and the page does not say so
- **Where:** "בהמחשה המדד עולה באופן אחיד, באותו אחוז בכל שנה"; expected answer 1, "ההצמדה הוסיפה 660.63 ₪".
- **Problem:** 660.63 = 400,000 × (1.02^(1/12) − 1). A reader who does what 0.4 and 3.x taught for rates (2% ÷ 12) gets 666.67. AUTHORING: "Effective conversion uses the twelfth root. Never mix them silently."
- **Fix:** "המדד עולה בכל חודש באותו אחוז, כך שאחרי 12 חודשים הוא עלה 2%: בכל חודש בשורש ה־12 של 1.02 (שיעור 0.4), כ־0.165%, ולא 2% ÷ 12."

### 3.5-7 · should fix · on a phone, the linked table cuts the balance column and breaks every cell
- **Where:** the three-month table (MDX 139–159), seven columns, `text-caption`.
- **Problem:** at 390px each cell wraps "₪" onto a second line. The last column, "יתרה בסוף", which the text discusses ("היתרה גבוהה…"), shows only "977.95 / 547.97 / 921.03" (my shot). The leading digits are past the scroll edge.
- **Fix:** drop "₪" from the cells and say it once in the header row ("בשקלים"), add `whitespace-nowrap`, and shorten the headers ("הצמדה", "יתרה").

### 3.5-8 · nit · a wrong lesson reference, and a different letter
- **Where:** "**צעד 3 — הריבית.** <M>I = B × m</M> משיעור 0.4".
- **Problem:** 0.4 has no such formula; this is 3.2's <M>I<sub>k</sub> = r × B<sub>k−1</sub></M>. On m against r, see X-2.
- **Fix:** "<M>I = r × B</M>, כמו בשיעור 3.2".

### 3.5-9 · nit · the prediction's correct option explains itself
- **Where:** option 2: "2,225.05 ₪: התשלום מהלוח המקורי, כפול 100.3 וחלקי 100". The other options give reasons, not methods.
- **Fix:** "2,225.05 ₪: חודש אחד של מדד נכנס כבר לתשלום הראשון".

### 3.5-10 · nit · the payment rule is asserted without the check that makes it believable
- **Problem:** the reader is told to index the balance by M_k ÷ M_{k−1} but the payment by M_k ÷ M_0, and is never shown why the two agree.
- **Fix:** one line with facts: "בדיקה: היתרה הלא צמודה אחרי חודש 1, כפול 1.003: <M>398,781.61 × 1.003 = 399,977.95</M> — היתרה הצמודה. כל הלוח המקורי, יתרה ותשלום, מוכפל ב־<M>M<sub>k</sub> ÷ M<sub>0</sub></M>."

### 3.5-11 · nit · "אותו מסלול" adds data
- **Where:** exercise 5: "אותו מסלול: 320,000 ₪ ל־20 שנה ב־3.5%". Exercise 4 gave neither the term nor the rate.
- **Fix:** "המסלול של תרגיל 4 הוא ל־20 שנה, ב־3.5%."

---

## 3.6 — כשהריבית מתעדכנת

"Three ways to be wrong", each a believable number, is the best teaching device in the stage. The table "what is recalculated, when" answers "why one formula does not fit every track", and הפריים is feminine throughout (the lesson and `RateReset`). What is left:

### 3.6-1 · must fix · the rule of thumb's example uses 1.2 points while the rule speaks of 1
- **Where:** the callout "כלל אצבע": "שינוי של נקודת אחוז מזיז את רכיב הריבית של החודש הבא באחוז אחד מהיתרה, חלקי 12 (שיעור 2.6). בהסבר: 451.90 ₪."
- **Problem:** the explanation's change is 4.8% → 6%, which is 1.2 percentage points. One point gives 1% × 451,903.77 ÷ 12 = 376.59. A reader who applies the rule to the example gets 376.59 and sees 451.90.
- **Fix:** "שינוי של s נקודות אחוז מזיז את רכיב הריבית של החודש הבא ב־s% מהיתרה, חלקי 12. בהסבר, 1.2 נקודות אחוז: <M>1.2% × 451,903.77 ÷ 12 = 451.90</M>."

### 3.6-2 · should fix · "בנוסחה של היתרה משיעור 3.3" gives a different balance from the one printed
- **Where:** step 1, "אחרי 36 תשלומים, בנוסחה של היתרה משיעור 3.3: 451,903.77"; Galit's step 2, "314,674.74"; exercise 5's hint, "קודם היתרה, בנוסחה משיעור 3.3" (374,967.75).
- **Problem:** 3.3 taught <M>B<sub>k</sub> = C × S</M> with C "התשלום ששולם בפועל" (3,244.79), which gives 451,904.14. The page uses the unrounded payment, and the statement table says 451,903.63. Galit gives 314,674.36 against 314,674.74, and exercise 5 gives 374,967.77. The new payments still come out within the exercise tolerance, but the first number the reader is told to reproduce does not match the method named. 3.6 also has no rounding callout in the text, only one in Sources.
- **Fix:** write "בנוסחה של 3.3, עם ההחזר המדויק — בלי לעגל אותו" (3.3's rounding callout already introduces "ההחזר המדויק"), or use the statement balance. Add a one-line rounding callout as in 3.2–3.5.

### 3.6-3 · should fix · guided task 3: the jump is 416.66, but the answer names 425
- **Where:** task 3, "בכמה התשלום קפץ בחודש 37…?"; the expected answer: "הוא קפץ מ־3,791.67 ל־4,208.33… רק רכיב הריבית עלה, ב־425."
- **Problem:** 4,208.33 − 3,791.67 = 416.66. The 425 compares month 37 at the old rate with month 37 at the new rate. The month-36 payment also includes one more month of interest on 2,083.33 (8.33 ₪). The answer never states the number the task asked for.
- **Fix:** add a difference fact: "הוא קפץ ב־416.66 ₪: הריבית עלתה ב־425 ₪ בגלל האחוז החדש, וירדה ב־8.33 ₪ כי היתרה קטנה ב־2,083.33 ₪, כמו בכל חודש."

### 3.6-4 · should fix · on a phone, the half table runs two numbers together
- **Where:** the FillTable "השלימו את הטבלה": שינוי · מחודש · היתרה · חודשים שנשארו · אחוז חדש · התשלום החדש.
- **Problem:** at 390px "228" (months left) touches "388,050.75 ₪" and reads as one number, "228 388,050.75" (my shot). The headers "שינוי מחודש היתרה" also run together.
- **Fix:** use the month as the row key and drop the "שינוי" column, or add a gap between columns in FillTable (a shared component; X-7).

### 3.6-5 · nit · six digits and "בערך", where 3.1 taught eight
- **Where:** steps 5–6: "0.361513 בערך … 0.638487 בערך … נותן בערך 3,539. בלי לעגל באמצע: 3,538.86". Galit's steps are the same.
- **Problem:** 3.1 says "השאירו שמונה ספרות … ועגלו רק את התשלום". With eight digits (0.36151257, 0.63848743), 2,259.52 ÷ 0.63848743 = 3,538.86 exactly, and the "בערך" can go. With six digits a reader gets 3,538.87.
- **Fix:** use eight digits in both examples and drop "בערך".

### 3.6-6 · nit · the equal-principal month 36 does not add up from its parts
- **Where:** "רכיב הקרן … בחודש 36 2,083.33"; "התשלום: בחודש 36 3,791.67".
- **Problem:** the month-36 interest is 427,083.33 × 0.4% = 1,708.33, and 2,083.33 + 1,708.33 = 3,791.66. This comes from the unrounded convention (X-1).
- **Fix:** round each part, as 3.4 does, or show the interest and say "(עיגול)".

---

## Cross-lesson items

**What agrees, and needs nothing:**
- the monthly rate is the annual rate ÷ 12, sourced to ENG-223 in every lesson; 3.4 adds honestly that the check covered Spitzer only;
- P, C, r, n, S, B, k, I, M (written "M (מדד)") and g keep their meanings, apart from X-2;
- each reuse of the 3.1 formula says so in a line (3.3, 3.4, 3.6);
- every example says "תרגיל נפרד, לא התיק של נועם ושירה", as the case timeline requires;
- "מספרים להמחשה, לא נתוני שוק" stands above every exercise set;
- each "בשיעור הבא" line uses the map's exact title;
- the new terms match the map (החזר חודשי; רכיב קרן / רכיב ריבית; הפרשי הצמדה / תקופת ביניים), with definitions;
- there are no real bank names, and every Mogi decision is marked with who and when;
- `eylon-list.md`'s DEC-3 row already lists 3.1, 3.4, 3.5 and 3.6;
- הפריים is feminine;
- the Brain checks 4,974.72 and 4,742.11 reproduce.

### X-1 · must fix · stage 3 uses two rounding conventions, and the second one produces false equalities
- **Where:** 3.1–3.4 use the statement convention (each month's interest rounded, the payment rounded once, the last month closes); this is the convention AUTHORING requires for teaching tables. 3.5 and 3.6 compute without rounding: an unrounded payment, rounding "רק כשמוצגים" (3.5) or "רק בסוף" (3.6), and formula balances built on the exact payment.
- **Problem:** this one choice causes 3.5-1 to 3.5-4, 3.6-2 and 3.6-6. A learner who finished 3.2's workshop logic computes from the printed, rounded numbers and keeps missing by an agora, or by tens of agorot, in the two lessons where the arithmetic is hardest. 3.5's half table, meanwhile, uses the rounded payment, so 3.5 contradicts itself.
- **Fix:** compute 3.5 and 3.6 from the rounded payment with per-row rounding (the module already has statement functions). At the very least, never print an equality whose displayed operands do not give the displayed result. Write "בערך" there, with a rounding callout placed before the first such row.

### X-2 · should fix · r in 3.1–3.4 and 3.6, m in 3.5
- **Where:** 3.5's formula box: "I = היתרה אחרי ההצמדה × m", and "m: הריבית החודשית…". Every other stage-3 box writes r for the same quantity.
- **Problem:** AUTHORING: "For monthly payments the formula box writes r … and says once that it is 0.4's m." A reader moving from 3.4 to 3.5 sees the same formula with a new letter.
- **Fix:** r in 3.5 (box, dl, step 3 and the sources code).

### X-3 · nit · spreadsheet column letters collide with formula letters
- **Where:** 3.2 (item 3.2-2); 3.5: "היתרה אחרי ההצמדה (C2)", "ב־B1 התשלום מהלוח המקורי, וב־F1 סכום ההלוואה". Here C is a balance, B a payment and F a loan, while the formulas use C, B and P.
- **Fix:** add one sentence the first time (3.2): "אותיות העמודות בגיליון אינן האותיות של הנוסחאות". In prose, always write "עמודה C".

### X-4 · nit · typed numbers that come from a calculation
- **Where:**
  - 3.1 exercise 5 solution: "n = 15 × 12 = 180" (the fact `ex5.months` exists and is not used);
  - 3.1 exercise 4/5 messages: "240", "180";
  - "1.00375", "0.00375", "1.0035", "1.0045" inside solution equations (3.1, 3.3);
  - 3.3 "שקל וחצי"; 3.4 exercise 3 message "216";
  - 3.5 "גדלה ב־0.3%";
  - 3.6 exercise 3 solution "300 … 84", exercise 5 message "216".
- **Problem:** AUTHORING: every number that is not a teaching input comes from a fact.
- **Fix:** use the existing facts, or add `given` / `difference` facts.

### X-5 · nit · internal identifiers shown to learners
- **Where:** Sources in 3.1–3.4: "Linear ENG-223, 2026-10-04"; 3.1, 3.4, 3.5, 3.6: "Brain, דף 67436545"; 3.5: "דף 9895937". This continues stage 2's X-4.
- **Fix:** "לפי בדיקה של צוות Mogi מול לוחות ששני בנקים פרסמו (2026-10-04)", "דף ההחלטות של Mogi". Move the IDs into the closing MDX comment.

### X-6 · nit · invented names reused for different people
- **Where:**
  - יעל ותומר: in 2.10 they buy (500,000 ₪, 4.8%, 25 years); in 3.3 they sell after 7 years (500,000 ₪, 4.5%, 20 years);
  - "יעל" alone in 3.5;
  - רון ומאיה in 1.10 and 3.1;
  - דנה in 0.2, 1.1 and 3.2–3.3.
- **Problem:** stage 1 trained the reader to follow people across lessons. The same names with new numbers read as an inconsistency.
- **Fix:** new names in 3.3 and 3.5, or "יעל ותומר משיעור 2.10, שנים אחר כך" if they are meant to be the same people.

### X-7 · nit · FillTable headers touch on a phone (the shared component; stage 2's 2.2-7)
- **Where:** 3.2 and 3.4: "חודש רכיב ריבית"; 3.5: "תשלום המדד התשלום"; 3.6: item 3.6-4.
- **Fix:** a column gap in `FillTable.vue` after the period column (a shared file: report it to the coordinator), or shorter headers.

### X-8 · nit · "תחזית" (a 3.8 term) appears in 3.5 and 3.6 without `<Later>`
- **Where:** 3.5 and 3.6 "מספרים להמחשה": "…תרחיש להמחשה, לא תחזית"; the same phrase is in `LinkedSchedule.vue` and `RateReset.vue`.
- **Fix:** "לא מה שצפוי לקרות", or `<Later lesson="3.8">תחזית</Later>`.

### X-9 · nit · house-rule details
- 3.5 and 3.6 have four guided tasks; AUTHORING says 2–3. Fold task 3 into task 4 in each.
- 3.5 and 3.6 put the takeaway callout "מה לקחת מזה" in `tone="warning"`. Status colours are for their meaning only, and these callouts are not warnings (3.6's "התקופה נשארת… בודקים בחוזה" rightly is).

---

## Count

5 must fix, 19 should fix, 31 nit.

**The most important items, in the order I would fix them:**
1. **X-1, with 3.5-1, 3.5-2 and 3.6-6:** 3.5 and 3.6 compute without rounding, so the page prints equalities that fail, including the worked payment "1,211.70 × 100.4 ÷ 100 = 1,216.54" and exercise 7's "1,863.29 − 937.07 = 926.23". Switch to the statement convention used in 3.1–3.4.
2. **3.6-1:** the rule of thumb uses a 1.2-point change as its example for "one point" (451.90 against 376.59).
3. **3.2-1:** "in a long loan most of the early payment is interest" is taught as a rule, and as a graded reason in 3.3 exercise 1. It is false below about 3.5% for 20 years, and the 3% track in 3.5 contradicts it.
4. **3.5-3, 3.5-4, 3.3-1, 3.3-2, 3.6-2, 3.6-3:** more printed numbers that do not follow from what is printed (agora-level divisions and subtractions, "עד שקל" for 1.19, 240 × 6.66 ≠ 1,597.24, 425 named where the jump is 416.66, a 3.3 balance that 3.3's method does not give).
5. **3.1-1, 3.1-2, 3.1-3:** "באמצע" is not the middle, "באגורות" is about 2 ₪, and two algebra steps (factoring, dividing by a fraction) a beginner has not seen.
6. **3.4-1 and 3.4-2:** the false sentence about g, and an unmarked market claim.
7. **3.5-5 and 3.5-6:** the 16th falls into neither half of the heading, and the twelfth root is used without being named.
8. **Phone:** 3.2-3, 3.5-7 and 3.6-4, where tables hide the column the text reads from or merge two numbers.
9. **Smaller structural items:** 3.3-3 (an exercise answered in the explanation) and X-2 (r against m).
