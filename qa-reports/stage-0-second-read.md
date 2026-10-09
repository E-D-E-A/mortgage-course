# Stage 0, second read: lessons 0.1 to 0.12 and the stage-0 check

Date: 2026-10-09. Reviewer: second-round QA, reading as one beginner from 0.1 to the check in order. I edited no lesson, component or data file; this report is the only file I wrote.

**What I read:**
- the visible text of every built page (`dist/`, built at 14:00, after the last MDX change);
- all 12 MDX files and `src/pages/checks/0.mdx`;
- every video script (the subtitles as the page prints them);
- all of `data/lessons/*.json`, including `check-0.json`;
- the glossary definitions in `src/data/definitions/`;
- `course/AUTHORING.md` and the four first-round reports;
- phone screenshots, cut into strips (0.3, 0.6 and 0.9);
- the 0.12 video frames t026 and t120.

**Math spot-check.** I recomputed these by hand and found them correct:
- 0.3: 11.90 (the exact doubling time) and 1.06 to the 11th power;
- 0.4: 616.78 against 616.79, 0.4074 and 4.907;
- 0.5: 245.56 × 1.0816 = 265.60;
- 0.6: 111,003.64;
- 0.7: 106.09 and 109.18;
- 0.8: 2.94 and 485.44;
- 0.9: 2.52;
- 0.10: 23.53 and 20;
- 0.11: 97.33 and 101.94;
- 0.12: 5.01, 100.17 against 100.18, 4.75, 4.67 and 1.96;
- the check: 2,723.25, 96.15 and 10,000.

No displayed number is wrong. The one false statement about math is a sentence, 0.3 item V1 below.

---

## 1. Verification of the first-round חוסם and חשוב items

I checked every חוסם and חשוב item in the four first-round reports against the current page.

**Fixed and fine:**
- **0.1:** the spreadsheet asterisks, the meaning of "שיעור", percent as a decimal, and the step from adding to multiplying.
- **0.2:** אחוז הריבית against סכום הריבית, the principal comparison, the meaning of "5% לשנה", and Ex6's errors.
- **0.3:** תקופה, the rule-of-72 sentence in the text, "72 ÷ 6, not 0.06", and the difficulty order.
- **0.4:** all ten items.
- **0.5:** items 1 and 2.
- **0.6:** items 1 to 3.
- **0.7:** all five items.
- **0.8:** all three items.
- **0.9:** both items.
- **0.10:** items 1 to 4, 6 and 7.
- **0.11:** items 1 to 5 and 7.
- **0.12:** items 1 to 11, 13 and 22.
- **The across-lesson items:** the letter table, "בשקלים של היום" against "בכוח קנייה של היום", and the labels that mark yields as illustration.
- **Phone tables:** FillTable fits 390px, and the 0.9 five-column table fits. Wide tables show the "גררו" hint.

**Not fixed, or fixed badly:**

### V1 · חשוב · 0.3: the new error message is mathematically false and contradicts the lesson
- **Where:** exercise 6 (`id 0.3-4`), the error for 11.90, MDX line 404: "11.9 הוא מה שנותן חישוב שמניח שהריבית מצטרפת כל רגע."
- **Problem:** 11.90 is the solution of 1.06ⁿ = 2 with yearly compounding, letting n be a fraction. If the interest were added "every moment" (continuously), at 6% the money would double after 11.55 years, not 11.9. The same page, line 214, calls 11.90 "בחישוב מדויק". The learner gets two different explanations of one number.
- **Fix:** "11.9 הוא מספר השנים המדויק אם סופרים גם חלקי שנה. אבל הריבית מצטרפת רק בסוף כל שנה: בסוף השנה ה־11 הסכום עוד לא הוכפל, ולכן התשובה בשנים שלמות היא 12." While there, write "11.9" instead of "11.90" on line 214.

### V2 · חשוב · 0.6: putting "שווה היום" early broke the sentence that points at the column
- **Where:** "כל תשלום בנפרד", MDX line 104: "שימו לב לעמודה האחרונה: כל תשלום שווה היום פחות מזה שלפניו."
- **Problem:** the columns are now בסוף שנה | שווה היום | התשלום | מחלקים ב־. The last column is "מחלקים ב־" (1.1, 1.21, 1.331), which grows. On the phone it is also half cut off (screenshot strip 0). The learner looks at growing numbers while the text says they shrink.
- **Fix:** "שימו לב לעמודה ״שווה היום״: כל תשלום שווה היום פחות מזה שלפניו."

### V3 · חשוב · the check: the "8 decisions" claim, removed from 0.10, is back as the right answer
- **Where:** check question 15, the correct option: "הוועדה המוניטרית של בנק ישראל, שמונה פעמים בשנה במועדים קבועים". The explanation repeats "שמונה פעמים בשנה".
- **Problem:** the first round (0.10 item 5) narrowed this to the 2026 schedule only, and 0.10 now says "ב־2026 נקבעו מראש 8 החלטות (לא אומת)". The check grades the old permanent rule as correct. The glossary entry ("בכמה מועדים קבועים בשנה") is right.
- **Fix:** make the option "הוועדה המוניטרית של בנק ישראל, במועדים שנקבעים מראש (ב־2026 — שמונה)". Make the explanation "...במועדים שנקבעים מראש; ב־2026 נקבעו שמונה (לא אומת)."

### V4 · חשוב · 0.11: the formula mapping names a letter that 0.6 no longer has
- **Where:** "הנוסחה", step 3, MDX line 229: "זו הנוסחה מ־0.6, כשהערך הנוכחי V הוא המחיר P, הריבית r היא התשואה y".
- **Problem:** after the letter-table fix, 0.6 writes the present value as **P** (`P = C₁ ÷ (1 + r) + …`). There is no V anywhere in 0.6. A beginner who goes back to 0.6 to follow the mapping finds nothing. This is the across-lesson letter item (חשוב in both earlier rounds), fixed in 0.6 but not followed through in 0.11.
- **Fix:** "זו הנוסחה מ־0.6: P הוא שוב הערך הנוכחי — כאן, המחיר של האג״ח; במקום r כותבים y, התשואה; ובתשלום האחרון מצטרפת הקרן F."

### V5 · קטן · 0.11 item 6: the glossary still defines קרן as the money that was lent
- **Where:** `src/data/definitions/0-2.json`, "קרן": "הסכום המקורי: הכסף שהופקד או שנלקח בהלוואה".
- **Problem:** in 0.11 the `<Term>` popover shows this definition right next to the corrected sentence "הסכום שהאג״ח מבטיחה להחזיר. הוא לא תמיד שווה למחיר ששילמתם". The two contradict each other for a bond bought at 97.33 ₪.
- **Fix:** add to the glossary entry: "באג״ח — הסכום שמוחזר בסוף, גם אם קניתם אותה במחיר אחר."

### V6 · קטן · 0.5 and 0.6: the new rounding instruction gives away an answer
- **Where:** both half tables: "כתבו את המספר שמחלקים בו עם כל הספרות (למשל 1.1025)".
- **Problem:** 1.1025 is the row-2 blank, 1.05², in both tables.
- **Fix:** use an example that is not in the table, such as "(למשל 1.0816, ולא 1.08)".

### V7 · קטן · 0.8 item 2: fixed, but with the phrase AUTHORING reserves for discounting
- **Where:** worked example, step 3 heading: "הרווח בשקלים של סוף השנה".
- **Problem:** AUTHORING keeps "בשקלים של …" for discounting at an interest rate. Here the amount is adjusted for inflation, which AUTHORING calls "בכוח קנייה". Step 4 already says "בכוח קנייה של תחילת השנה".
- **Fix:** "הרווח בכוח קנייה של סוף השנה".

---

## 2. Regressions

The only regressions are V1, V2 and V4 above:
- V1: a new error message that is false;
- V2: a column reorder that broke the sentence pointing at it;
- V4: a letter mapping that refers to a letter removed in 0.6.

The math checks found no other broken equation, no contradiction and no term used early. Every `<Later>` in a "בשיעור הבא" line is `quiet`. No nested brackets remain.

---

## 3. Series consistency, read end to end

### "בשיעור הבא" lines: all correct
Every lesson names the next lesson's exact title from the map, and the sentence matches what that lesson does:
- 0.1 → 0.2 ריבית: המחיר של כסף;
- 0.2 → 0.3 ריבית דריבית;
- 0.3 → 0.4 שנתית מול חודשית;
- 0.4 → 0.5 ערך הזמן של כסף;
- 0.5 → 0.6 ערך נוכחי;
- 0.6 → 0.7 אינפלציה ומדד המחירים לצרכן ("why prices rise" is now in 0.7);
- 0.7 → 0.8 הצמדה;
- 0.8 → 0.9 מה זו הלוואה, ואיך בנק מרוויח;
- 0.9 → 0.10 בנק ישראל וריבית בנק ישראל ("…ב־2026");
- 0.10 → 0.11 אג״ח ותשואה;
- 0.11 → 0.12 עקום התשואות;
- 0.12 → a link to `/checks/0/`.

### Letters
The table is followed in every lesson: P, B, r, n, I, C, k, m, e, q, π, i, F, y and s. Each reused formula says where it comes from ("זו הנוסחה מ־0.5 / 0.3 / 0.8"). The one exception is V4. Four smaller points:

**C1 · קטן · 0.9: s is defined in a different unit from the AUTHORING table.**
- **Where:** 0.9 formula box: "s — המרווח … כמספר עשרוני: 0.03 הם 3 נקודות אחוז". The AUTHORING table says "s: a spread, **in percentage points**".
- **Problem:** the formula `P × s` needs a decimal, so the lesson is right. The table is the shared rule, though, and later lessons (2.1, the spread in "P−0.8") will read it.
- **Fix:** keep the lesson. Report a one-line correction to AUTHORING: "s — a spread; as a decimal in formulas, said in percentage points." (`course/*` is a shared file, so the coordinator makes this change.)

**C2 · קטן · 0.9: the subscript F.**
- **Where:** `r_F` ("F כמו funds").
- **Problem:** two lessons later, F is a bond's principal. AUTHORING says "never a table letter for something else".
- **Fix:** `r_D` (D for deposits, פיקדונות), or `r_C` (C for cost). C is also a table letter (a payment), so D is cleaner.

**C3 · קטן · 0.7: M for the index sits next to m for the monthly rate.**
- **Where:** `M = K ÷ K₀ × 100`, `π = M₁ ÷ M₀ − 1`, and again in 0.8.
- **Problem:** M is not in the table, so it is allowed. But a beginner who reads m as "the monthly rate" (0.4) meets an uppercase M three lessons later and in 0.8.
- **Fix:** keep M, and add a short line to the `<dl>`: "(לא m, הריבית החודשית משיעור 0.4)". Or add M to the AUTHORING table, so no later lesson uses it for anything else.

**C4 · קטן · 0.11: "how many years until the payment" is t here and k in 0.6.**
- **Where:** 0.11 step 1, "תשלום שמגיע בעוד t שנים", and the FillTable hint, "שנה t".
- **Problem:** 0.6 named exactly this quantity k (the table's letter for it).
- **Fix:** use k in 0.11, or say "(ב־0.6 קראנו לזה k)". 0.12's t₁ and t₂ (lengths of time) can stay.

### The same term, worded the same way
**C5 · קטן · the shared component: the answer label uses the singular.**
- **Where:** every lesson's numeric exercise shows "התשובה שלך (₪)" (`NumericExercise.vue`, line 93). The check shows "התשובה שלכם".
- **Problem:** this breaks the plural-address rule, on every exercise in the stage.
- **Fix:** "התשובה שלכם". This is a shared-component change.

Otherwise the terms are stable from lesson to lesson:
- אחוז הריבית / סכום הריבית;
- נקודות אחוז;
- ריבית דריבית / ריבית על ריבית;
- "השורש ה־12";
- "בכוח קנייה של היום";
- "תוספת על זמן ארוך", used everywhere, the check included;
- "מגלם", explained at first use in 0.12.

### The check's 18 questions against the lessons
The check covers every lesson (0.1 ×2, 0.2, 0.3 ×2, 0.4 ×2, 0.5, 0.6, 0.7, 0.8 ×2, 0.9, 0.10 ×2, 0.11 ×2, 0.12). It uses no letters, and its terms match the lessons, including the way q14 avoids the word "prime". The one real defect is V3 (q15). Two smaller ones:

**C6 · קטן · the check, q8: an error message names a different mistake from the one it catches.**
- **Where:** q8 error `q8.percent_off` = 9,950.72, message "הורדתם 4% על כל שנה".
- **Problem:** 9,950.72 is 10,816 × 0.92, which is 8% taken off once. Taking 4% off each year gives 10,816 × 0.96² = 9,968.03, and that answer gets no message. 0.5's exercise 5 was fixed for exactly this pair.
- **Fix:** relabel 9,950.72 as "הורדתם 8% (פעמיים 4%)". Add 9,968.03 with "הורדתם 4% בכל שנה. מחלקים ב־1.04 פעמיים, לא מורידים אחוזים."

**C7 · קטן · the check: wording the lessons already fixed comes back.**
- **q1:** "מוצר עלה 240 ₪, והמחיר שלו עלה ב־15%" uses the same verb twice, the ambiguity fixed in 0.1's prediction. Fix: "מחיר של מוצר היה 240 ₪, והוא עלה ב־15%."
- **q3** (an error message): "ההלוואה נמשכת שלוש שנים". "נמשכת" is on AUTHORING's list of words to avoid. Fix: "ההלוואה היא לשלוש שנים."
- **q9:** "לפי ריבית של 5% לשנה" does not say whose rate. The lessons say "אפשר להפקיד כסף בריבית דריבית של 5% לשנה". Use that phrase.

### Repeated examples without purpose
**C8 · חשוב · 0.6's half-worked table repeats 0.5's half-worked table, number for number.**
- **Where:** 0.5 "השלימו את הטבלה": 2,000 ₪ at 5%, years 1 to 4. 0.6 "השלימו את הטבלה": 2,000 ₪ a year at 5%, years 1 to 3.
- **Problem:** both tables have the same blanks with the same answers: 1.1025 and 1.157625; 1,814.06 and 1,727.68. A learner who did 0.5 copies the answers. 0.6's only new step, adding the rows, sits outside the table.
- **Fix:** give 0.6's table other inputs, for example 3,000 ₪ a year at 6%: growth 1.06 / 1.1236 / 1.191016, worth today 2,830.19 / 2,669.99 / 2,518.86, total 8,019.04 (new facts).

**C9 · חשוב · 0.7: the answer is "3%" five times in a row.**
- **Where:**
  - explanation year 1 (400 → 412: 3%);
  - explanation year 2 (103 → 106.09: 3%);
  - the worked example (102 → 105.06: 3%);
  - exercise 2 (800 → 824: 3%);
  - exercise 3 (110 → 113.3: 3%).
- **Problem:** both exercises also share the wrong answer 2.91. A learner who types "3" passes both without dividing anything, and exercise 3 (בינוני) is the explanation's year 2 with other numbers.
- **Fix:** exercise 2: 800 → 836 (4.5%). Exercise 3: 125 → 130 (4%; 5 points). Use new facts and errors (on_new: 4.31 and 3.85).

**C10 · חשוב · 0.4: exercise 3 is the third time the learner computes the same number.**
- **Where:** exercise 3 (בינוני): "ריבית שנתית של 12% … מה הריבית האפקטיבית" = 12.68.
- **Problem:** the same 12% → 1% → 12.68% is:
  - printed in guided task 2's answer ("ב־12%: … 12.68%");
  - a blank in the half-worked table (row 4).
- The 6% row of that table (0.5 / 6.17) is the explanation's own numbers, too.
- **Fix:** change exercise 3 to 18% (1.5% a month, effective 19.56%), or to 2.4% (0.2% a month, effective 2.43%). In the half table, replace 6% with 4.8% or 7.2%.

**C11 · קטן · 0.6: exercise 2 is the explanation multiplied by two.**
- **Where:** "תקבלו 2,200 ₪ בעוד שנה, ו־2,420 ₪ בעוד שנתיים … 10%" gives 2,000 + 2,000.
- **Problem:** the explanation opens with 1,100 and 1,210 at 10% (1,000 + 1,000). The first round flagged this (0.6 item 10). The numbers were doubled but not changed.
- **Fix:** 1,650 in a year and 1,815 in two years at 10% (1,500 + 1,500), or different amounts for the two payments.

**C12 · קטן · 0.12: exercise 7 ("מאתגר") is the half-worked table with other rates.**
- **Where:** the half-worked table: 4 ₪ a year for 3 years, curve 2/3/4%. Exercise 7: 4 ₪ a year for 3 years, curve 3/3.5/4%.
- **Problem:** exercise 7 is the same task, labelled harder.
- **Fix:** label it בינוני, or make it 4 years with a 4-point curve. Exercise 8 is already the real challenge.

### Difficulty across the stage
The difficulty rises sensibly, from percent of an amount (0.1) to forward rates with a fifth root (0.12). Every calculator-heavy lesson says so above its exercises, and the order inside each lesson is honest, except for C10 and C12. 0.10 is lighter in arithmetic (its "מאתגר" exercise 5 is a 0.1-style percent change), but it is the lesson about institutions, so that is acceptable.

---

## 4. What a beginner would still stumble on

**B1 · חשוב · 0.12: two different two-year yields for the same one-year yield, within one screen and in the video.**
- **Where:**
  - "תשואה לכל אורך זמן": the table gives שנה אחת 3%, **שנתיים 3.25%**, 5 שנים 3.75% and so on.
  - Five lines later: "כשבעקום האפס התשואה לשנתיים היא **4%** בשנה".
  - Then "נחזור לשאלה… דרך א׳ — אג״ח לשנתיים, 4% בשנה".
  - The video does the same in back-to-back cues: "לשנה אחת: 3%. לשנתיים: 3.25%…", then "דרך א׳: אג״ח לשנתיים, 4% לשנה".
- **Problem:** the one-year yield is 3% in both examples, so the learner reads one curve. Then guided task 1 says the curve implies 3.50% between year 1 and year 2, while the text just derived 5.01% for the same segment.
- **Fix:** say plainly that these are two separate examples. Before "נחזור לשאלה" add "(זה עקום אחר מזה שבטבלה למעלה: כאן, כמו בשאלת החיזוי, התשואה לשנתיים היא 4%)". In the zero-curve sentence use the table's own 3.25% (100 ÷ 1.0325² = 93.80, a new fact), or say "בעקום אחר". In the video, add a cue such as "דוגמה אחרת: לשנה 3%, לשנתיים 4%." (under 60 characters). The cleaner fix is to make the explanation's rising curve start at 3% / 4% and rebuild its segments.

**B2 · קטן · 0.4: the video and the text give different numbers before the page explains why.**
- **Where:** video cue "אחרי 12 חודשים נצברו 616.78 ₪: 6.17% בשנה". The text, a few lines later: "נוספו 616.79 ₪ ריבית".
- **Problem:** the rounding callout that explains the agora comes about 130 lines later.
- **Fix:** use the table value, 616.79, in the video (the video shows the month-by-month build-up, not the formula), or add "(על האגורה — בהמשך)" next to 616.79 in the text.

**B3 · קטן · 0.6: in the loan table the column the text quotes is hidden on a phone.**
- **Where:** "מה זה אומר על הלוואה": the columns are שנה | חוב בתחילת השנה | סכום הריבית | תשלום | **חוב בסוף השנה**. The next sentence is "אחרי התשלום השלישי החוב הוא 0 ₪ בדיוק".
- **Problem:** on a phone the last column is off screen (the scroll hint is there). AUTHORING says to keep the column the text talks about early.
- **Fix:** move "חוב בסוף השנה" to the second column.

**B4 · קטן · 0.1: a number appears without its step.**
- **Where:** exercise 6 solution: "אחרי ההנחה הראשונה: 1,000 − 300 ₪ = 700 ₪".
- **Problem:** the 300 is never derived ("30% מ־1,000 ₪ הם 300 ₪"), and the equation mixes a bare number with shekels.
- **Fix:** "30% מ־1,000 ₪ הם 300 ₪. ‏1,000 ₪ − 300 ₪ = 700 ₪."

**B5 · קטן · 0.1: "moving the decimal point" starts from a number with no visible point.**
- **Where:** "מזיזים את הנקודה העשרונית שני מקומות שמאלה: 10% הם 0.1, 5% הם 0.05".
- **Problem:** someone who has forgotten school math does not see a point in "10" or "5", or know where zeros come from.
- **Fix:** "10 הוא 10.0 — מזיזים את הנקודה שני מקומות שמאלה ומוסיפים אפס: 0.10. וכך 5 → 0.05." (The "ביד" callout already does this for 400.00 → 4.00.)

---

## Verdict

Stage 0 is close to ready for a beginner, but not quite there yet. Of the first round's items, the חוסם items and nearly all the חשוב items are truly fixed:
- the broken equations;
- the letter clash, settled by the AUTHORING table;
- the phone tables;
- the dated, unverified official data;
- the bond and curve definitions.

No displayed number is wrong. Seven items still need fixing before a real learner sees the stage; every one is a text or data change, with no new component:
1. V1: 0.3's false "continuous" error message;
2. V2: 0.6's "העמודה האחרונה";
3. V3: the check's "eight times a year";
4. V4: 0.11's reference to a letter V that 0.6 no longer has;
5. B1: 0.12's two different two-year yields;
6. C8: 0.6's half-worked table copied from 0.5;
7. C9 and C10: 0.7's and 0.4's repeated answers, which let a learner pass by pattern rather than by method.

The קטן items can follow in the same pass. Once those seven are done, I would give stage 0 to a beginner.
