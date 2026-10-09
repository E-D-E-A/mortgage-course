# QA report: lessons 0.1, 0.2 and 0.3, read as a beginner

Date: 2026-10-09

I edited no files. For each lesson I read the built page text (dist), the MDX, the subtitles, the data files and the phone and desktop screenshots (cut into sections). I also read the components the lessons use: PercentGrid, LoanTimeline, CompoundGrowth, FillTable and NumericExercise. The numbers I spot-checked are all correct: 200→220→198, 600×0.675=405, 30,000×4%×3=3,600, 10,000×1.05^10=16,288.95, 1.05^30 and 1.06^30, 30,000×1.04^10=44,407.33, and the 8,000 @4% table. Each lesson's "בשיעור הבא" line matches the next lesson's actual title (0.2, 0.3, 0.4).

## Lesson 0.1

1. **חוסם — the spreadsheet formula on the page is broken.** In "איך מחשבים" (MDX line 211), the source `=400*3%` / `=400*3/100` sits across two spans. Markdown reads the two `*` as italics. The page shows `=400<em>3%</em> או =400 3/100`. The learner sees "=4003% או =4003/100" (visible in the phone screenshot) and will type a wrong formula.
   - Fix: write the asterisk as an entity (`=400&#42;3%`) or as a JS string (`{"=400*3%"}`).

2. **חשוב — on a phone, the answer column of the half-solved table is hidden.** In "השלימו את הטבלה", the FillTable has `min-w-[30rem]` inside `overflow-x-auto`. At 390px the "התוצאה" column (and the given 150.00 ₪) is completely off screen, with no sign that the table scrolls. The learner fills one column and gets "wrong" on the blanks they never saw.
   - Fix: let the table fit at 340px (narrower inputs such as `w-20`, smaller padding, or stacked rows on phone), or add a visible "גללו לצד ←" cue. The same problem is in 0.2 and 0.3 (see the cross-lesson list).

3. **חשוב — "שיעור" in the sense of "rate" is never explained, and it clashes with "שיעור" meaning "lesson".**
   - Where: "שיעור מס, שיעור הנחה" (line 115), "נניח ששיעור מסוים עלה מ־4% ל־5%" (line 117, and subtitle 16), "נניח שהשיעור נגבה מ־10,000 ₪" (line 124), the table header "השיעור", exercises 2, 4 and 5, and the glossary entry for נקודת אחוז.
   - The same page says "זה הכלל החשוב ביותר בשיעור" (lesson). A beginner can read "a certain lesson rose to 5%".
   - Fix: define it at first use: "כשמשהו נמדד באחוזים — למשל **שיעור** מס (כמה אחוזים מהמחיר הולכים למס) או שיעור הנחה — …". Replace line 124 with: "נניח שגובים את המס מסכום של 10,000 ₪."

4. **חשוב — "מספר עשרוני" is used, but how to turn a percent into a decimal is never taught.**
   - "10% הם 10 חלקי 100, כלומר 0.1" (line 94) and "מכפילים ב־1 ועוד האחוז כמספר עשרוני" (line 189) assume the reader can do 10/100 = 0.1. The "ביד" tip ("400 הופך ל־4") shows a number with no visible decimal point.
   - 0.2 and 0.3 then rely on 5% = 0.05 and 2.5%.
   - Fix: after line 94, add: "כדי לכתוב אחוז כמספר עשרוני מחלקים ב־100 — מזיזים את הנקודה שני מקומות שמאלה: 10% → 0.10, 5% → 0.05, 2.5% → 0.025." In "ביד", write "400 (כלומר 400.00) הופך ל־4.00".

5. **חשוב — the move from 200 + 0.1×200 to 200 × 1.1 skips a step** (lines 96–100). Someone who has forgotten school maths does not see why adding becomes multiplying. Lines 97–98 also mix a bare "200" with "20 ₪".
   - Fix: add the line `= 200 × 1 + 200 × 0.1 = 200 × (1 + 0.1)`, and write "200 ₪ + 20 ₪".

6. **קטן — the prediction question is ambiguous.** "מוצר עלה 200 ₪. המחיר שלו עלה ב־10%" (line 46) uses the same verb, עלה, for "cost" and "rose".
   - Fix: "מחיר של מוצר היה 200 ₪. המחיר עלה ב־10%, ואחרי חודש ירד ב־10%. כמה עולה המוצר עכשיו?"

7. **קטן — awkward Hebrew in the answer reveal.** "המחיר ירד ב־2 ₪ מתחת להתחלה — 1% ממנה" (line 231).
   - Fix: "המחיר נגמר 2 ₪ מתחת למחיר ההתחלתי — 1% ממנו."

8. **קטן — a negative p is used without a worked line.** p is defined with a minus for decreases (line 197), but no example shows B = A × (1 + p ÷ 100) with a negative p.
   - Fix: add "ירידה של 10%: 200 × (1 + (−10) ÷ 100) = 200 × 0.9 = 180 ₪" (from the fact pred.down).

9. **קטן — a missing intermediate step.** "30 ÷ 200 × 100 = 15" (line 82) and "30 ₪ ממלאים 15 ריבועים" both hide a step: 30 ÷ 2, or 0.15.
   - Fix: show "30 ÷ 200 = 0.15, ו־0.15 × 100 = 15".

10. **קטן — common mistakes with no `errors` entry.**
    - Ex1: 1,200 (400 × 3 without ÷100). This is the classic mistake.
    - Ex3: 83.33 (250 ÷ 300).
    - Ex5: 75 (6 ÷ 8 × 100).
    - Ex6: 80 (400 ÷ 500).
    - Add facts and messages for each, for example: "שכחתם לחלק ב־100".

11. **קטן — the difficulty order is not honest.** Ex7 (two discounts) is a copy of the worked example, so it is easier than Ex6 but labelled מאתגר after it.
    - Fix: label Ex7 בינוני and move it before Ex6.

12. **קטן — "בטבלה" in the expected observations points nowhere** ("מה הייתם אמורים לראות", item 2). 500 ₪ appears only inside the widget's hidden "הצגה כטבלה". The widget also shows "+1 נקודות אחוז" (plural for one).
    - Fix: "פתחו ״הצגה כטבלה״: 400 ₪ הופכים ל־500 ₪". In PercentGrid, show "נקודת אחוז אחת" when the value is 1.

13. **קטן — Ex5 has no actor.** "שיעור ההנחה בחנות ירד…"
    - Fix: "החנות הורידה את שיעור ההנחה מ־8% ל־6%…"

14. **קטן — "1% מ־4%, שזה שינוי זעיר" (line 122) is abstract for a beginner.**
    - Fix: add "(מ־4% ל־4.04%)".

## Lesson 0.2

1. **חשוב — "ריבית" means both the rate and the shekel amount, side by side.**
   - "פי שניים ריבית לשנה — פי שניים ריבית" (line 127, and the summary on line 433).
   - The formula box defines I as "כל הריבית, בשקלים" and r as "הריבית לשנה, כמספר עשרוני".
   - The heading "מה מגדיל את הריבית" and exercise 6 ("מה הייתה הריבית לשנה, באחוזים?") have the same problem.
   - Fix: name the two apart once: "**אחוז הריבית** (5% לשנה) מול **סכום הריבית** (5 ₪)". Then use those names consistently, for example "פי שניים אחוז ריבית לשנה — פי שניים סכום ריבית".

2. **חשוב — the claim that the principal grows "in the same proportion" is shown with a misleading example.** "קרן גדולה יותר — ריבית גדולה יותר באותו יחס. 10,000 ₪ ב־5% לשנה: 500 ₪ בכל שנה, ובעשר שנים 5,000 ₪" (line 128). It changes the years from 3 to 10 as well, so it does not isolate the effect of the principal.
   - Fix: "10,000 ₪ — פי 100 מ־100 ₪ — ב־5% לשלוש שנים: 1,500 ₪ ריבית, פי 100 מ־15 ₪." This needs a new fact, simple_interest(10000, 5, 3).

3. **חשוב — the meaning of "5% לשנה" is stated as a general rule, and 0.3 contradicts it.** "״5% לשנה״ פירושו: בכל שנה הלווה משלם 5% מהקרן" (line 86). The same idea is in the five-questions callout ("נאמרת באחוזים מהקרן") and the summary. In 0.3, 5% a year is charged on the balance and nothing is paid.
   - Fix: "״5% לשנה״ פירושו: על כל שנה מחושבת ריבית של 5%. בריבית פשוטה — 5% מהקרן בכל שנה."

4. **חשוב — on a phone, the third column of the half-solved table is cut off.** The "כל הריבית עד סוף השנה" header and its inputs are clipped at the left edge, with no scroll cue (phone screenshot). Same fix as 0.1 item 2.

5. **חשוב — Ex6 is missing the most likely mistake.** The formula section has just taught r as a decimal (0.06), but Ex6 (unit %) has no `errors` entry for 0.06 or 0.12.
   - Fix: add `{value: "0.06", message: "זה האחוז כמספר עשרוני. כתבו אותו באחוזים: 0.06 הם 6%."}`, and a similar entry for 0.12.

6. **קטן — the next-lesson line contradicts how 0.3 uses "קרן".** "מה קורה כשהריבית … מצטרפת לקרן" (line 436). The same wording is in the last subtitle ("כשהריבית מצטרפת לקרן") and on line 121 ("לא מצטרפת לקרן"). In 0.3 the principal stays "הסכום המקורי" and the interest joins the balance (יתרה).
   - Fix: "…מצטרפת לסכום שבחשבון — ומהשנה הבאה מרוויחה ריבית בעצמה."

7. **קטן — ambiguous word in Ex1.** "השאלתם לחברה 2,000 ₪": "חברה" can mean a female friend or a company.
   - Fix: "השאלתם לחברה שלכם, נועה, 2,000 ₪…"

8. **קטן — "השאלתם / משאילים" is used for money, while the lesson teaches "מלווה" (from להלוות).** This appears in the prediction and in Ex4 and Ex7.
   - Fix: "הלוויתם". The video can keep its "אני משאיל לך" title, plus one sentence: "להשאיל כסף — בשפה של הלוואות: להלוות."

9. **קטן — a missing error in Ex3.** 14,400 (3% read as 0.3) has no entry.

10. **קטן — "ריבית (נגיע לזה בשיעור 0.2)" sits inside the 0.1 next-lesson line, and "ריבית דריבית (נגיע לזה בשיעור 0.3)" inside 0.2's.** It breaks the title and repeats the lesson number.
    - Fix: drop `<Later>` in the "בשיעור הבא" line.

## Lesson 0.3

1. **חשוב — "תקופה" is defined as the compounding unit, then used to mean the whole duration.**
   - The definition (line 77): "בכל תקופה (כאן, שנה)".
   - The contrary uses: "ככל שהתקופה ארוכה יותר, ההשפעה גדולה יותר" (line 418), "לאורך כל התקופה" (line 419), and "נקודת אחוז אחת עושה הבדל גדול כשהתקופה ארוכה" (line 431).
   - By the lesson's own definition, a longer period means less compounding.
   - Fix: "ככל שהזמן ארוך יותר" / "לאורך כל הזמן" / "כשמספר השנים גדול".

2. **חשוב — the rule-of-72 explanation contradicts the lesson's own model, and the lesson contradicts itself.**
   - "יוצא 11.90 שנים — כלומר, הסכום מוכפל קצת לפני סוף השנה ה־12" (line 214).
   - Ex4's error message says "11.90 היא הנקודה המדויקת — באמצע השנה ה־12" (line 385).
   - Interest is added only at the end of each year, so the balance doubles at the end of year 12, not partway through it.
   - Fix (line 214): "בחישוב מדויק יוצא 11.90 — כלומר, בסוף השנה ה־11 הסכום עוד לא הוכפל, ובסוף השנה ה־12 כבר כן."
   - Fix (line 385): "11.90 הוא מה שנוסחה רציפה נותנת, אבל הריבית מצטרפת רק בסוף כל שנה. השאלה היא על שנים שלמות."

3. **חשוב — "מחלקים 72 בריבית לשנה" (lines 212, 433) comes right after r was defined as 0.05.** A learner will divide 72 by 0.06.
   - Fix: "מחלקים 72 במספר האחוזים של הריבית לשנה (6, לא 0.06)."

4. **חשוב — on a phone, the key column is cut off in two tables.**
   - The explanation table cuts "מזה: ריבית על ריבית" in half, and "יתרה בסוף השנה" is gone. The text then says "שימו לב לעמודה הרביעית".
   - The half-solved FillTable's "יתרה בסוף השנה" column and its inputs are entirely off screen.
   - There is no scroll cue in either table. Same fix as 0.1 item 2.

5. **חשוב — the difficulty order is not honest, and n=5 uses a method the lesson never shows.**
   - Exercise n=5 (0.3-4, "בינוני"): find the first whole year that doubles the money. This needs searching powers, and the lesson never demonstrates finding n for a target.
   - Exercise n=6 ("מאתגר"): two formula plug-ins and a subtraction, which is easier.
   - Fix: mark n=5 מאתגר and put it last, or add one line to "כלל ה־72" showing the check of 1.06^11 and 1.06^12.

6. **קטן — the ambiguous word the house rules flag is used here.** "משכנתא, שנמשכת לפעמים עשרות שנים" (line 419). "נמשכת" can mean "is withdrawn" or "lasts".
   - Fix: "משכנתא, שמחזירים לפעמים במשך עשרות שנים."

7. **קטן — two numbers appear without being shown.**
   - "מאיפה 25 ₪ הנוספים?" (line 74): the comparison 525 − 500 is not shown.
   - "נצברו 1,025 ₪ ריבית" (line 82): 500 + 525 is not shown.
   - Fix: "525 ₪ לעומת 500 ₪ בשנה הראשונה — 25 ₪ יותר" and "500 + 525 = 1,025 ₪". Both need `difference`/sum facts.

8. **קטן — "1.06^11 = 1.90" is a rounded value written as an exact equality** (Ex4 solution, line 392; the true value is 1.898).
   - Fix: "בערך 1.90". "11.90" would also read better as "11.9".

9. **קטן — typed numbers break the "every number from a fact" rule.**
   - Ex1 error "210" and its message.
   - Ex4 errors "17", "16" and "11".
   - Ex5 error "30000" and "1% × 30 × 100,000".
   - Prediction options "בערך 20,000 ₪" and "יותר מ־30,000 ₪".

10. **קטן — the half-solved example has no actor or verb.** "הפקדה של 8,000 ₪, בריבית של 4% לשנה…" (line 270).
    - Fix: "הפקדתם 8,000 ₪ בריבית דריבית של 4% לשנה, לשלוש שנים."

11. **קטן — two claims are stated without a source.**
    - The rule of 72 and "טוב לריביות של כמה אחוזים בודדים" are not in `<Sources>`.
    - Fix: add them under ידע מתמטי כללי.
    - "בטבלה, כמו בדף חשבון של בנק, הריבית … מעוגלת לאגורה" (line 187) states a fact about banks; the sources list it only as הנחת חישוב.
    - Fix: "בטבלה מעגלים את הריבית של כל שנה לאגורה (זו הנחת החישוב של הקורס)."

## Cross-lesson issues

1. **חשוב — the formula letters clash between lessons.**
   - 0.1 uses lowercase **p** for the percent as a whole number (3), and **A** for the starting amount.
   - 0.2 and 0.3 use uppercase **P** for the principal and **r** for the rate as a decimal (0.05).
   - 0.1's B = A × (1 + p ÷ 100) is the same formula as 0.3's one-year B = P × (1 + r), but nothing says so.
   - Fix: use one letter set from 0.1 on (P for the starting amount, r as a decimal). Or add a line in 0.2 and 0.3: "שימו לב: כאן r הוא מספר עשרוני, לא מספר האחוזים כמו p בשיעור 0.1."

2. **חשוב — "קרן" is used inconsistently.** 0.2 says the interest "מצטרפת לקרן" (text, video, next-lesson line). 0.3 and the glossary keep קרן as the original sum and add the interest to the יתרה. Use "יתרה" or "הסכום שבחשבון" in 0.2.

3. **חשוב — "תקופה" will clash with later lessons.** The 0.3 glossary defines it as the compounding unit. The course map (lesson 5.7, factor card 5 "תקופה, וגיל הלווים בסופה", stage 1 in the brief) uses it for the loan's term. 0.3 itself already uses it both ways.
   - Fix: add the second meaning to the glossary ("וגם: כל משך ההלוואה — ׳תקופת ההחזר׳"), or always say "תקופת ההחזר" for the term. "תקופת ההחזר" is the registry's label.

4. **חשוב — on a phone, every lesson's tables hide columns with no scroll cue.** This covers the FillTable (`min-w-[30rem]`) and the MDX tables in 0.3 (`min-w-[34rem]`, `[30rem]`). The key column is the one that disappears.

5. **קטן — NumericExercise uses a "near" tolerance of 1 by default, and its message says "עד האגורה" even for % answers.**
   - With a % unit, a full percentage point counts as "נכון בקירוב", and the message reads "התשובה המדויקת, עד האגורה: 20 %". This affects 0.1 Ex3, 5, 6 and 7, and 0.2 Ex6.
   - Fix: set `near={0.05}` on % exercises, and word the message by unit. This needs a shared-component change.

6. **קטן — rounding is displayed inconsistently.** 0.1 promises percentages to two decimals. The 0.3 widget shows "20% מכל הריבית שנצברה" (true value 20.50%) and "11.90".

7. **קטן — `<Later>` inside text that already names the lesson repeats itself.**
   - "ריבית (נגיע לזה בשיעור 0.2) שנכיר בשיעור הבא": 0.1, line 115 and the five-questions callout.
   - The "בשיעור הבא" lines in 0.1 and 0.2.
   - Fix: drop "שנכיר בשיעור הבא", or drop `<Later>` there.

8. **OK — no fix needed.** The "בשיעור הבא" line in each lesson matches the next lesson. The prerequisites hold: 0.2 uses only אחוז, and 0.3 uses only 0.2's terms plus its own. The video subtitles match the page numbers.

Files reviewed: /home/user/mogi-course/src/pages/lessons/0-1.mdx, 0-2.mdx, 0-3.mdx; /home/user/mogi-course/data/lessons/0-1.json, 0-2.json, 0-3.json; /home/user/mogi-course/public/video/0-1.he.vtt, 0-2.he.vtt, 0-3.he.vtt; /home/user/mogi-course/src/components/FillTable.vue, NumericExercise.vue, PercentGrid.vue; /home/user/mogi-course/src/data/definitions/0-1.json, 0-2.json, 0-3.json; /home/user/mogi-course/qa/screens/phone_lessons_0-{1,2,3}_.png.
