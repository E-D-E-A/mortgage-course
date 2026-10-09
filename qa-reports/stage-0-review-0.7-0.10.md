# Stage 0 beginner review: lessons 0.7–0.10

Date: 2026-10-09

QA review of lessons 0.7–0.10 in /home/user/mogi-course, read as a beginner. I edited no files.

What I read: the built text in `dist/lessons/*/index.html`, the MDX files `src/pages/lessons/0-7.mdx` … `0-10.mdx`, the data files `data/lessons/0-7.json` … `0-10.json`, the subtitles, the video key frames in `qa/video/`, the phone and desktop screenshots, the definitions in `src/data/definitions/`, `course/AUTHORING.md`, the brief (§2, §6, §9, §10), `research/notes/official-sources.md` and `research/notes/brain-calculation.md`.

I spot-checked every computed number against the data files and found only the wrong equation in 0.7 (first item below). I zoomed into the percent signs in the video frames and they render correctly.

---

## Lesson 0.7: inflation and the consumer price index

1. **חוסם.** Section "סל אחד, שתי שנים", MDX line 127: `3.09 ÷ 103 = 3%`. The equation is false: 3.09 ÷ 103 = 0.03. A beginner who checks it on a calculator gets 0.03 at the exact moment the lesson teaches "points are not percent".
   - Fix: `3.09 ÷ 103 × 100 = 3`, or `3.09 ÷ 103 = 0.03, כלומר 3%`.

2. **חשוב.** "מדד בסיס" and "תקופת הבסיס" contradict each other.
   - Line 116 says "כאן מדד הבסיס הוא 100".
   - Line 189 (formula step 2) then says "מחלקים את המדד החדש במדד הבסיס: 106.09 ÷ 103", so the base index is now 103.
   - The definition list (line 204) gives I₀ = "מדד הבסיס", and condition 2 talks about "תקופת בסיס". Two near-identical terms are never named apart, against AUTHORING's rule.
   - Fix for line 116: "כאן, בחישוב של השנה הראשונה, מדד הבסיס הוא 100. מדד הבסיס הוא תמיד המדד שממנו מודדים — לא בהכרח 100."
   - Fix for line 189: "מחלקים את המדד החדש במדד שממנו מודדים — כאן 103, לא 100 של תקופת הבסיס".

3. **חשוב.** Callout "נקודות מול אחוזים", line 132: "זו אותה הבחנה כמו בשיעור 0.1, בין נקודת אחוז לאחוז". It is an analogy, not the same thing. An index point is not a percentage point. A learner may conclude that "3.09 נקודות" means 3.09 percentage points.
   - Fix: "זו הבחנה דומה לזו שבשיעור 0.1: גם שם הפרש (חיסור) אינו שינוי באחוזים (חילוק). אבל נקודת מדד אינה נקודת אחוז — המדד עצמו אינו אחוז."

4. **חשוב.** Half-solved table (line 261) against exercise 6 (lines 377–396). The table runs 100 → 104 → 109.2. Exercise 6, labelled "מאתגר", asks for the index after +4% then +5% from 100. That is 109.2, already printed in the table.
   - Fix: change exercise 6's inputs, for example 3% then 6% from 100 (= 109.18). Add the new values as facts.

5. **חשוב.** Common mistakes with no `errors` entry:
   - Exercise 2: dividing the change by the new cost, 24 ÷ 824 → 2.91.
   - Exercise 3: the same mistake, 3.3 ÷ 113.3 → 2.91.
   - Exercise 5: dividing instead of multiplying, 2,000 ÷ 1.035 → 1,932.37.
   - Each needs a fact and a message, for example "חילקתם בסכום החדש. שינוי באחוזים נמדד ממה שהיה קודם (שיעור 0.1)."

6. **קטן.** Line 107: "התוצאה, 3%, קרובה לשינוי באוטובוס ובחלב". 3 is not close to 5. The point being taught is weighting.
   - Fix: "התוצאה, 3%, אינה ממוצע פשוט של ארבעת השינויים: האוטובוס והחלב, יחד יותר ממחצית הסל, מושכים אותה למעלה, והירקות — רבע מהסל — מורידים אותה."

7. **קטן.** Line 106: "הירקות השתנו ב־−9%" is awkward Hebrew. Fix: "הירקות הוזלו ב־9%" (add an absolute-value fact).

8. **קטן.** FillTable `success` text, line 275: "...האינפלציה בשנה השנייה ובשלישית זהה — כי מחלקים כל פעם במדד גדול יותר". The cause is attached to the wrong half of the sentence.
   - Fix: "האינפלציה בשנה השנייה ובשלישית זהה, אבל השינוי בנקודות גדל — כי אותם 5% מחושבים כל פעם על מדד גדול יותר."

9. **קטן.** Exercise 5, line 370: "הוצאתם 2,000 ₪ בחודש על הסל". It does not say which basket.
   - Fix: "...על סל קניות זהה לסל של המדד".

10. **קטן.** Line 212: "אז צריך לתרגם בין הסדרות לפני שמחלקים". This names a step the learner cannot do. Fix: add "(איך עושים את זה — בשיעור 3.5)" or drop the clause.

11. **קטן.** Five-questions callout, line 401: "...המדד החדש חלקי הישן, פחות 1". The "× 100" or "באחוזים" is missing.

12. **קטן.** Reliability in the video: the frame "הלמ״ס" (`video/0-7.html` line 188) says "לא אומת…" with no date. Add "נכון ל־2026-10-09".

13. **קטן.** Lesson 0.6 promises that 0.7 covers "למה מחירים עולים" (0.6 line 431). Lesson 0.7 never says why prices rise. Fix the sentence in 0.6, or add one line to 0.7.

14. **קטן.** Next-lesson line, line 419: "0.8, סכום שקשור למדד". Lesson 0.8's title is "הצמדה". Use the title.

Reliability otherwise matches `official-sources.md`: 15th of the month, 18:30/14:00, house prices out since 1999, base 2024 = 100, next release 2026-10-15. Each item is marked `לא אומת` with a date, and every index value is labelled invented.

---

## Lesson 0.8: indexation

1. **חשוב.** Line 126 and the glossary entry for "ריבית נומינלית": "ריבית נומינלית היא הריבית כפי שהיא כתובה". This is wrong for CPI-linked loans. The rate written on a צמוד loan sits on top of indexation, so it is close to a real rate. Lesson 2.3 (צמוד מול לא צמוד) will contradict it.
   - Fix: "ריבית נומינלית היא בכמה גדל מספר השקלים, בלי להביא בחשבון את האינפלציה. שימו לב: ריבית שכתובה על חוב מוצמד מתווספת מעל ההצמדה — נלמד בשיעור 2.3."
   - Apply the same fix to the summary bullet (line 404) and to `src/data/definitions/0-8.json`.

2. **חשוב.** Worked example "הרווחתם, או רק נראה כך?", lines 233–237. "היום" means two different moments.
   - Step 2 says "עולה היום 51,500 ₪", meaning the end of the year.
   - Step 4's heading "בשקלים של היום" means the start of the year.
   - The question "כמה הרווחתם באמת?" then gets two answers, 500 ₪ and 485.44 ₪, with no statement of which one answers it.
   - Fix: step 2 "עולה בסוף השנה"; step 4 heading "בשקלים של תחילת השנה". Add a closing line: "שני המספרים נכונים — כל אחד במחירים של רגע אחר. הריבית הריאלית, 0.97%, אינה תלויה ברגע."

3. **חשוב.** Missing `errors`:
   - Exercise 4: dividing the wrong way round, (1.06 − 1.04) ÷ 1.06 → 1.89.
   - Exercise 6: dividing instead of multiplying, 1.03 ÷ 1.02 → 0.98.

4. **קטן.** Line 113: "מחלקים במה שהמחירים עלו". This reads as dividing by 34.39%.
   - Fix: "מחלקים בפי כמה שהמחירים גדלו — 1.03 בחזקת 10".

5. **קטן.** Line 75: "אבל ב־3% מעצמו" is awkward. Fix: "אבל רק ב־3% ביחס ל־104".

6. **קטן.** "כוח קנייה" carries the whole lesson but is never defined.
   - Add once, at line 119: "כוח קנייה — כמה מוצרים ושירותים אפשר לקנות בסכום".

7. **קטן.** Exercise 2, line 306: "בהודעה כתוב" names no actor. Fix: "בפרסומת של תוכנית חיסכון כתוב".

8. **קטן.** Subtitle "החוב המוצמד גדל משנה לשנה. השני נשאר כמו שהיה". "השני" appears before the video has introduced a second, unindexed debt.
   - Fix: "חוב שלא מוצמד נשאר כמו שהיה."

The next-lesson line matches 0.9. Every number is labelled as illustration.

---

## Lesson 0.9: what a loan is, and how a bank earns

1. **חשוב.** Five-questions callout, line 339: "כשמשווים הצעות מכמה מלווים, עלות הכסף של כולם דומה בדרך כלל, וההבדל הוא בעיקר במרווח". This is an unsourced generalisation about all banks, which brief §2 forbids.
   - Fix: "כשמשווים הצעות, חלק מההבדל יכול לנבוע מעלות הכסף של כל מלווה, וחלק מהמרווח. המרווח הוא החלק שתלוי גם בכם — נחזור לזה כשנגיע להצעות של בנקים."

2. **חשוב.** Exercise 6 (lines 313–328) is missing two `errors`:
   - Forgetting × 100: 0.02 + 2.5 → 2.52.
   - Entering the bare fraction 0.02.

3. **קטן.** Line 81: "3 נקודות אחוז מ־100,000 ₪ הם 3,000 ₪". This takes "points" of an amount and blurs the distinction from 0.1.
   - Fix: "מרווח של 3 נקודות אחוז פירושו שעל כל 100,000 ₪ נשארים 3% מהם — 3,000 ₪."

4. **קטן.** Next-lesson line, line 355: "0.10, הבנק המרכזי והריבית שלו … ומה הוחלט בשנה האחרונה". Lesson 0.10's title is "בנק ישראל וריבית בנק ישראל", and it covers 2026 to date, not the past twelve months.
   - Fix: "0.10, בנק ישראל וריבית בנק ישראל: … ומה הוחלט ב־2026."

5. **קטן.** The bank-funding model (line 65, "מלווה כסף שאחרים הפקידו") is a teaching simplification. It is acceptable at this level, but the source kind "ידע כלכלי כללי" should say it is simplified.

---

## Lesson 0.10: the Bank of Israel and its rate

1. **חשוב.** Line 100 says prime "שווה **תמיד** לריבית בנק ישראל ועוד 1.5 נקודות אחוז", and line 150 repeats "תמיד". The lesson's own callout (line 106) says where the 1.5 comes from is undecided. `official-sources.md` supports only the current relation, and `brain-calculation.md` §contradictions says it is a convention not yet verified.
   - Fix: "היום היא שווה לריבית בנק ישראל ועוד 1.5 נקודות אחוז (לא אומת, נכון ל־2026-10-09)".
   - Remove "תמיד" in both places.

2. **חשוב.** Worked example, step 4 (line 196): "עלות הכסף שלהם ירדה. אם המרווח שלהם לא השתנה, גם הריבית על הלוואות חדשות ירדה בערך באותו מספר נקודות אחוז." This implies every new loan rate, mortgages included, fell by 1 point in 2026. Long fixed rates follow bond yields (lessons 0.11–0.12).
   - Fix: "ריביות שקשורות ישירות לריבית בנק ישראל, כמו הפריים, ירדו באותה נקודת אחוז. ריביות אחרות, למשל קבועות לטווח ארוך, תלויות גם בגורמים אחרים — נלמד בשיעורים 0.11–0.12."

3. **חשוב.** Exercise 4, line 294: "בכמה נקודות אחוז היא ירדה?". The half-solved table just taught "ירידה כותבים עם מינוס". A learner who types −0.5 gets no explanation.
   - Fix: add `{ value: "-0.5", message: "הכיוון נכון. כאן השאלה כבר אומרת ׳ירדה׳, אז כותבים את הגודל: 0.5." }`, or accept −0.5.

4. **חשוב.** Exercise 5, line 314.
   - Its answer, 23.53%, is printed three times above it: in the callout (line 164), worked-example step 2 (line 192) and the summary (line 362). Calling it "מאתגר" is not honest.
   - It also lacks the classic error from 0.1, dividing by the new rate: 1 ÷ 3.25 → 30.77.
   - Fix: use different numbers, for example a rate from 4.5% to 3.6%, and add the 30.77-type error.

5. **חשוב.** "8 החלטות בשנה" (lines 95 and 344, summary line 360, video) is stated as a permanent rule. The source supports only the 2026 schedule, a single summary that adds "ייתכנו שינויים".
   - Fix: "ב־2026 נקבעו מראש 8 החלטות (לא אומת)".

6. **חשוב.** Live data is written in the present tense: "היום" (line 101, summary line 361) and exercise 2, "ריבית בנק ישראל היא 3.25%". The next decision is 2026-10-21, 12 days after the data date. Exercise 2 and the summary carry no date.
   - Fix: "נכון ל־9 באוקטובר 2026, ריבית בנק ישראל הייתה 3.25% (לא אומת)".
   - Add the same date to the worked example and to the half-table intro, which use real data with no label next to them.

7. **חשוב.** Illustration, task 2 (line 132): "עברו מההחלטה הראשונה לאחרונה. כמה ירדה ריבית בנק ישראל". The first decision's panel shows 4% after the decision, so a learner computes 0.75. The expected answer is 1, measured from 4.25%.
   - Fix: "כמה ירדה ריבית בנק ישראל מתחילת השנה (4.25%, לפני ההחלטה הראשונה) ועד אחרי האחרונה?"

8. **קטן.** Half-table instruction, line 204: "למשל -0.25". The example is the answer to all three "change" blanks. Use "למשל −0.5".

9. **קטן.** The metaphor "הכפתור" ("הכפתור של הכלכלה"; line 87, "כפתור שמזיז את הכלכלה, לא מתג שקובע אותה") is slogan-like. In Hebrew "כפתור" suggests an on/off button, which contradicts "לא מתג".
   - Fix: drop the metaphor, or use "ידית כוונון".

10. **קטן.** Wording of a factual claim:
    - Line 36: "כדי לשלוט באינפלציה" overstates. Fix: "כדי להשפיע על האינפלציה".
    - Exercise 3, line 278: "טווח היעד שבנק ישראל קבע" asserts who sets the target, which nobody checked. Fix: "טווח היעד".

11. **קטן.** "הביקוש" (line 84) and "מוניטרית" are never explained. Fix: "אנשים ועסקים קונים פחות מוצרים ושירותים". Add one line on "מוניטרית" (של מדיניות הכסף).

12. **קטן.** "בנק ישראל לא מנסה להגיע לאינפלציה של אפס" (line 68) gives no reason. Give one, or say it is outside this lesson.

13. **קטן.** "הריבית החדשה נכנסת לתוקף כמה ימים אחרי ההחלטה" (line 161) generalises from one decision. Fix: "בהחלטה האחרונה — יומיים אחרי ההודעה".

14. **קטן.** Hebrew corrections:
    - "זה החוליה השלישית" (line 179) → "זו החוליה השלישית".
    - "ירידה של 1 נקודת אחוז" / "ב־1 נקודת אחוז" (lines 139, 164, 194, video) → "נקודת אחוז אחת".
    - Lines 157 and 336 render as nested brackets "(הפריים (נגיע לזה בשיעור 2.1))".

15. **קטן.** Prime is a lesson-2.1 term, yet it carries this lesson's formula section, exercises 2 and 6, and a table column, all through the circumlocutions "הריבית ועוד 1.5" and "הריבית שנגזרת ממנה". Either introduce prime here (a course-map change) or cut its weight.

16. **קטן.** Next-lesson line, line 364: "בשיעור הבא — 0.11:" has no title. Fix: "0.11, אג״ח ותשואה:".

17. **קטן.** The rate chart on phone is about 100px tall with the y-axis starting at 0. The 1-point drop is barely visible and there are no axis values.

The rate path, effective date, next dates, 1–3% target and the 25 May single-source note all match `official-sources.md`. The open contradictions (31 Aug vs 1 Sep; where the 1.5 comes from) are shown rather than silently chosen.

---

## Cross-lesson issues

1. **חשוב, layout.** On phone (390px) the tables scroll sideways with no cue, and the columns the learner must fill are hidden.
   - 0.7: the basket table hides "מחיר/עלות היום", and the half-solved table hides the whole "אינפלציה (%)" column, which is one of two blank columns.
   - 0.8: the explanation table and the half-solved table hide "החוב בסוף השנה", which holds blanks.
   - 0.9 and 0.10: the half-solved tables hide the last column, and the headers run together ("הלוואהסכום", "הריבית לפניהריבית אחריהשינוי").
   - Fix in the shared `FillTable.vue` and in the inline tables: a stacked card layout below the small breakpoint, or a visible "גללו הצידה" cue plus a sticky first column. This needs a shared-file change.

2. **חשוב.** "בשקלים של היום" has two meanings.
   - In 0.5 and 0.6 it means discounted at an interest you could earn (present value).
   - In 0.8 it means deflated by inflation (purchasing power), with the same ÷ (1 + x)ⁿ form.
   - 0.8 exercise 5 ("הלוויתם לחבר … כמה שווה … בשקלים של היום?") mirrors 0.6's friend-loan exercise but expects the other meaning.
   - Fix in 0.8: say "במחירים של היום" / "בכוח קנייה של היום". Add a callout: "זה נראה כמו ההיוון משיעור 0.6, אבל כאן מחלקים באינפלציה — לא בריבית שאפשר לקבל."

3. **חשוב.** Symbols collide between consecutive lessons. Rename, or add a line "שימו לב: כאן X מסמן …" each time.

   | Symbol | Earlier meaning | Lesson | New meaning | Lesson |
   |---|---|---|---|---|
   | π | inflation, in percent | 0.7 | inflation, as a decimal | 0.8 |
   | r | the interest rate | 0.3–0.6 | the real rate | 0.8 |
   | m | the monthly rate | 0.4 | the spread | 0.9 |
   | P | the principal | 0.3 | prime | 0.10 |
   | R | the effective rate | 0.4 | the Bank of Israel rate | 0.10 |
   | S | value today | 0.5 | what is left to the bank | 0.9 |

4. **קטן.** Real vs nominal: the meanings themselves line up (0.4's callout and 0.8's callout point at each other correctly). The weak point is 0.8's definition, covered in 0.8 item 1.

5. **קטן.** Index points vs percentage points: 0.7 item 3. Lessons 0.9 and 0.10 use percentage points correctly.

6. **קטן.** The "בשיעור הבא" titles drift from the real titles (0.7 → 0.8, 0.9 → 0.10, 0.10 → 0.11). Use the exact titles.

7. **קטן, house rule.** Some numbers in exercise messages and steps are typed by hand rather than taken from facts:
   - 0.7 exercise 5 message "3.5".
   - 0.8 exercise 4 error "6".
   - 0.9 exercise 2 errors "3.5" and "6", exercise 6 error "2.5".
   - 0.10 worked-example step 3 "+ 1.5".
   - None is wrong, but the house rule wants every one from a fact.
