# QA report: lessons 1.1–1.5, read as a beginner

Date: 2026-10-09

Nothing was edited except this report.

**The reader:** someone who finished stage 0 (percent, interest, present value, inflation, banks, bonds) and knows nothing about mortgages.

**Sources read:**
- the visible text from `dist/lessons/1-{1..5}/`;
- the five MDX files;
- `data/lessons/1-{1..5}.json` and `src/data/definitions/1-{1..5}.json`;
- the 1.2 subtitles, plus the scene source `video/1-2.html` and the key frames;
- the phone screenshots, cut into strips;
- `course/AUTHORING.md` and `course/course-map.md` (§1, §3, §8);
- the stage-0 reports;
- `research/notes/official-sources.md` (§1, §9), `research/field-knowledge.md` and `research/eylon-list.md`.

**Math:** every number in the five lessons was recomputed by hand from the facts. All are correct, including:

| Lesson | Numbers checked |
|---|---|
| 1.1 | 40%, 8%, 48%, 35%, 53.85, and the three sale rows |
| 1.2 | 74.55 / 74.5 / 0.45, 10,000 and 10,000, 287,500 / 37,500, 75.0025, 75.45, 24.55, 2,240,000, 746,666.67, 71.03 |
| 1.3 | 17,400 / 18,480 / 7,200, 126,000, 21,600 and 23,400 with their errors |
| 1.4 | 546,666.67 × 3 = 1,640,000.01, the last track 546,666.66, 66.67, 63.33, the 33/33/34 split |
| 1.5 | 600,000 |

One sentence in 1.2 makes a **false claim about** correct numbers. It is item 1.2-2.

**Real bank names:** none on the pages, in the subtitles or in the definitions.

**"בשיעור הבא":** all five lines use the next lesson's exact title (1.2 הון עצמי ושיעור מימון · 1.3 שלושה דברים נפרדים · 1.4 מסלול ותמהיל · 1.5 סוגי עסקאות ולקוחות · 1.6 המשתתפים). Item 1.4-5 is about what the 1.4 line *says* about 1.5.

**The "דוגמה לימודית" label on case A:** present in 1.2, missing in 1.4 (item 1.4-1).

---

## Lesson 1.1 — משכנתא: הלוואה עם בטוחה

1. **חשוב — on a phone, the spreadsheet formulas break in the middle** (callout "איך מחשבים", MDX 177; phone crop at the callout).
   - The four formulas sit in one Hebrew sentence. At 390px the cushion formula splits across lines as "=MAX(A1-" … "B1,0)/A1*100".
   - The labels and formulas also interleave right-to-left ("…=MAX(A1-B1,0) לכם ,=MIN(A1,B1) לבנק"), so it is unclear which formula belongs to which label.
   - Fix: make it a list, one formula per line, label first: "לבנק: <span class="ltr">=MIN(A1,B1)</span>", "לכם: …", "עדיין חייבים: …", "הכרית: …".

2. **קטן — symbols the course never explained** (formula box, MDX 160–161: "אם V ≥ B", "אם V < B").
   - Stage 0 never uses ≥ or <. AUTHORING says not to use a symbol before it is explained.
   - Fix: "אם המכירה גדולה מהחוב או שווה לו (כותבים V ≥ B: ״V גדול מ־B או שווה לו״)". The same applies to "<".

3. **קטן — a new claim appears only in feedback, with no source** (exercise 2, option 3 feedback, MDX 270: "אפשר למכור. בדרך כלל החוב נפרע מהכסף של המכירה, ואז השעבוד מוסר.").
   - Fix: add one line to the "שעבוד" paragraph (MDX 65–69) saying how selling a pledged home works.
   - Add it to the existing "לא אומת" Sources item (MDX 386).
   - Word the feedback as: "אפשר למכור, אבל מכספי המכירה נפרע קודם החוב; רק אז השעבוד מוסר (בפישוט)".

4. **קטן — legal statements in the body carry no marker.**
   - The statements are "השעבוד על דירה נרשם, כדי שכל מי שקונה או מלווה ידע…" (MDX 72) and the default steps (MDX 100–106).
   - They are marked "לא אומת" only in Sources. 1.2 and 1.4 mark the same kind of statement in the body.
   - Fix, MDX 72: append "(לא אומת; לפי דפי המסע ב־Brain, 2026-08-04)".
   - Fix, MDX 100: "…בפישוט, כידע כללי שלא נבדק מול מקור משפטי."

5. **קטן — a common error is missing** (exercise 6, MDX 339–343, unit %).
   - A learner who types 0.35 gets a plain "wrong".
   - Fix: add an error for 0.35 (a fact): "כתבתם כמספר עשרוני. באחוזים כופלים ב־100: 35."

6. **קטן — two exercises have no actor** (exercise 4, MDX 308: "דירה משועבדת נמכרה ב־…"; exercise 6, MDX 345: "דירה שווה היום…").
   - Exercise 4: "הפסקתם לשלם, והדירה המשועבדת שלכם נמכרה ב־…, כשהחוב היה …. כמה אתם עדיין חייבים…?"
   - Exercise 6: "יש לכם דירה ששווה היום …, ונשאר עליה חוב של …. בכמה אחוזים…?"

7. **קטן — grammar** ("מה הייתם אמורים לראות", item 3, MDX 143: "ירידה של 10% במחיר אכלה את כל הכרית של החוב הגדול, והשאירו כרית גדולה לחוב הקטן").
   - Fix: "…והשאירה כרית גדולה לחוב הקטן."

---

## Lesson 1.2 — הון עצמי ושיעור מימון

1. **חוסם — the spreadsheet formulas on the page are wrong** (callout "איך מחשבים", MDX 224).
   - This is the same bug as stage-0 item 0.1-1.
   - The paragraph holds two `*`: `=(A1-B1)/A1*100` and `=A1*C1/100`. Markdown reads them as italics. The built HTML is `=(A1-B1)/A1<em>100</em>. … =A1</span>C1/100`.
   - On the phone the learner sees "=(A1-B1)/A1100" and "=A1C1/100". Both give a wrong number when typed into a spreadsheet.
   - Fix: write the formulas as JS strings: `<span class="ltr">{"=(A1-B1)/A1*100"}</span>`, `<span class="ltr">{"=A1*C1/100"}</span>`, or escape them as `\*`.
   - Worth a build check: fail on `<em>` inside `.ltr`.

2. **חשוב — the case-A warning makes a false claim** (callout "תיק על הקצה", MDX 282: "…או שהשווי שייקבע יהיה נמוך מהמחיר אפילו במעט — שיעור המימון יעבור את התקרה").
   - The claim is false. A loan of 1,640,000 ₪ stays at or below 75% as long as the value is at least 1,640,000 ÷ 0.75 = 2,186,666.67 ₪.
   - That is 13,333.33 ₪ (about 0.6%) below the price. A value 10,000 ₪ below the price (2,190,000 ₪) gives 74.89%, still within the ceiling.
   - The sentence teaches the reader to panic at any small gap. It also hides a nice symmetry: 10,000 ₪ of slack in the loan equals 13,333 ₪ of slack in the value, because 10,000 ÷ 0.75 = 13,333.
   - Fix: add facts for the lowest value (loan ÷ ceiling × 100) and its difference from the price. Then write: "…או שהשווי שייקבע יהיה נמוך מהמחיר ביותר מ־13,333.33 ₪ — פחות מאחוז אחד — שיעור המימון יעבור את התקרה."

3. **חשוב — on a phone, the ceilings table hides the column the text talks about** (MDX 110–141; phone crop at "התקרה: כמה מותר לממן").
   - At 390px the "הלוואה מרבית" column is cut, and its cells show only "0.00 ₪", which reads as zero.
   - "הון עצמי מינימלי" is fully off-screen. Yet the next bullet (MDX 146) quotes exactly that column: "250,000 ₪, 300,000 ₪ או 500,000 ₪".
   - AUTHORING: "keep the column the text talks about early (on the right)".
   - Fix: reorder to התקרה · סוג העסקה · הון עצמי מינימלי · הלוואה מרבית, or drop the max-loan column. The text never quotes it.

4. **חשוב — on a phone, the third formula line is unreadable** (formula box, MDX 207: `הלוואה מרבית = <span class="ltr">V × </span>התקרה<span class="ltr"> ÷ 100</span>`).
   - Two LTR runs around a Hebrew word render as "÷ 100התקרהV × = הלוואה מרבית".
   - Fix: give the ceiling a letter that is not in the letter table, for example T, and define it in the `<dl>`: "התקרה, באחוזים כמספר שלם: 75". Then write the line as `<span class="ltr">V × T ÷ 100</span>`.
   - Alternatively, write it in words with no LTR run: "הלוואה מרבית: השווי כפול התקרה, חלקי 100".

5. **חשוב — "שיעור המימון נמדד מול השווי, לא מול המחיר" is stated as a rule. The sources do not support it that firmly** (MDX 159; also the glossary entry "שווי הנכס", the summary MDX 467 and exercise 5).
   - **The only support is field knowledge.** It is FK-H-005, marked "לא נבדק" in `research/field-knowledge.md`, and the speaker label in the recording is mixed up.
   - **The page contradicts itself about the speaker.** The body says "כך אמר גם אילון…". The Sources item (MDX 488) says "בהקלטה לא ברור מי הדובר".
   - **The research note on Directive 329 points the other way for the general case** (`official-sources.md` §1). The directive needs a special clause that *lets* the bank use the appraiser's value instead of the price for reduced-price homes, which suggests the price is the default.
   - **1.5 also contradicts it** (MDX 180): "לפי איזה מחיר מחשבים את המימון — זה כלל שנלמד בהמשך".
   - **The lesson never says what happens when the value is above the price.** A beginner will conclude that a high appraisal lets them borrow more.
   - Fix (MDX 159): "כשהשווי שנקבע נמוך מהמחיר, ההלוואה המרבית מחושבת מהשווי (ידע מהשטח, 2026-08-05; הדובר בהקלטה לא מזוהה בוודאות; ממתין לאישור אילון). מה קורה כשהשווי גבוה מהמחיר, ובדירה במחיר מופחת — בשיעור 4.4 (לא אומת)."
   - Make the glossary and the summary match.
   - Add to the Eylon list the question: when the value is above the price, which one counts?

6. **חשוב — rounding to one decimal looks like a mistake** (worked example, step 2, MDX 274: "74.55… (בעיגול לספרה אחת אחרי הנקודה: 74.5%)").
   - A beginner rounds the 74.55 on the screen and gets 74.6. The exact value is 74.5454…, and rounding an already-rounded number is the very mistake the warning callout (MDX 227–230) is about.
   - Fix: add a 4-decimal fact, as `round.ltv4` does. Write: "<M>1,640,000 ÷ 2,200,000 × 100 = 74.5454…</M>. בעיגול לשתי ספרות 74.55%; בעיגול לספרה אחת 74.5% — מעגלים מהמספר המדויק, לא מ־74.55."

7. **חשוב — percent answers come with no rounding instruction** (exercise 6, MDX 411–419: answer 75.45, `tolerance={0.01}`, `near={0}`).
   - The exact value is 75.4545…. A learner who types 75.5 gets a plain "wrong" with no message.
   - The exercises' intro (MDX 314) says only "את האחוזים בלי הסימן %". The half-worked table says "עד שתי ספרות", but the exercises do not.
   - Fix: add to the intro "באחוזים, עגלו לשתי ספרות אחרי הנקודה", or set `near={0.05}` for percent answers.

8. **קטן — "נקודות אחוז" appears before its reminder** ("מה הייתם אמורים לראות", item 2, MDX 187).
   - The first use has no `<Term>`; the reminder comes only in the worked example (MDX 276).
   - Fix: move the `<Term t="נקודת אחוז">` to MDX 187.

9. **קטן — the rounding callout drops the two digits** (MDX 229: "בעיגול לשתי ספרות זה 75%").
   - The point is that 75.0025 shows as 75.00. Show "75.00%" so the reader sees the two digits.

10. **קטן — the difficulty order is dishonest.**
    - Exercise 5 (value below price, the subtlest idea in the lesson) is labelled בינוני.
    - Exercise 6 (subtract, then divide, as in exercise 3) is labelled מאתגר.
    - Fix: swap the labels, or the order.

11. **קטן — common errors are missing.**
    - Exercise 3: 0.72 (written as a decimal).
    - Exercise 6: 0.7545.
    - Exercise 7: 22,400 (560,000 ÷ 25, the percent not converted) and 700,000 (560,000 × 1.25).

12. **קטן — exercise 1 has no actor** (MDX 328: "בעסקה מסוימת שיעור המימון הוא 70%").
    - Fix: "קיבלתם אישור למשכנתא בשיעור מימון של 70%. מה זה אומר?"

13. **קטן — "below which limit?"** (summary, MDX 471: "נועם ושירה: שיעור מימון של 74.55%, 10,000 ₪ מתחת לגבול").
    - Fix: "…ההלוואה שלהם קטנה ב־10,000 ₪ מההלוואה המרבית."

**Video:** the subtitles match the lesson. The ceilings scene shows the unverified line with its date (`video/1-2.html` line 189). Nothing to fix.

---

## Lesson 1.3 — שלושה דברים נפרדים

1. **חשוב — two rules are stated in the body with no marker** (MDX 156).
   - **The variable-rate rule:** "כלל של בנק ישראל מגביל איזה חלק מהמשכנתא מותר לתת בריבית שיכולה לזוז". It is marked "לא אומת" only in Sources (MDX 402). 1.4 (MDX 105) marks the same rule in the body, with its date.
   - **The eligibility loan:** "יש הלוואות מיוחדות שמגיעות עם מנגנון ריבית אחד שנקבע מראש (הלוואת זכאות)". Its Sources item (MDX 403) is kind "החלטה של Mogi". A decision about how Mogi computes the loan is not evidence of what the loan is.
   - `official-sources.md` §9 has a better source: a summary of the Knesset Research Center (2023), single source, saying fixed rate and CPI-indexed.
   - Fix, body: "(לא אומת; לפי תעתיק בצוות ב־Brain, 2026-10-08)" after the first claim, and "(לא אומת)" after the second.
   - Fix, Sources: add an item of kind "לא אומת" for the eligibility loan: "לפי תקציר של מקור רשמי (מרכז המחקר והמידע של הכנסת, 2023); ממתין לבדיקה".

2. **חשוב — indexation is taught inside the "interest mechanism" as settled, but it is an open question** (MDX 83, the indexation card MDX 30, task 3 MDX 184).
   - **The lesson's own source separates it.** The research page (Sources MDX 400) describes "שלוש תכונות נפרדות: ריבית, הצמדה ולוח החזר".
   - **The Eylon list asks it.** `research/eylon-list.md` lists "הצמדה — חלק ממנגנון הריבית, או ממד נפרד?".
   - **The reader meets a contradiction.** Whoever opens the source sees one, and the card sort grades indexation as having one right answer.
   - Fix: after MDX 84, add "יש מקורות שמתארים את ההצמדה כשאלה רביעית, נפרדת. בקורס היא חלק ממנגנון הריבית, כמו באפליקציית היועץ, שם היא חלק מסוג המסלול. זו בחירה של הקורס, וממתינה להכרעה."
   - Add a matching Sources item.

3. **חשוב — the worked example draws the wrong conclusion about indexation** (step 3, MDX 222; step 6, MDX 230).
   - The couple says "אנחנו רוצים לדעת מראש כמה ריבית נשלם, גם אם הריבית במשק תעלה". The advisor records "אחוז ריבית שלא זז… ההצמדה עוד פתוחה".
   - With indexation, the debt, and with it the interest in shekels, moves with the index (0.8). So the couple *has* answered the indexation question as well.
   - The advice in step 4 ("לקשור את החוב למדד") conflicts with what they asked for. The example teaches the reader to miss that.
   - Fix, step 3: "…זה מנגנון הריבית, בשתי השאלות הקטנות שלו: אחוז שלא זז, וגם בלי הצמדה — כי בהצמדה החוב, ואיתו הריבית בשקלים, זז עם המדד."
   - Fix, step 4: add "העצה הזו מתנגשת במה שביקשו בצעד 3; היועץ צריך לשאול."
   - Fix, step 6: "הצמדה: מה שביקשו בצעד 3 אומר בלי; העצה מצעד 4 — לברר."

4. **קטן — the prediction reveal overclaims** (MDX 207: "הגבול היחיד הוא כללים שחוסמים צירופים מסוימים").
   - A bank may also simply not offer a combination.
   - Fix: "הגבולות הם כללים — של בנק ישראל ושל כל בנק — שחוסמים צירופים מסוימים."

5. **קטן — a common error is missing** (exercise 3, MDX 303–305).
   - The likeliest wrong answer is 8, copied from "2 × 2 × 2" in the explanation.
   - Fix: add an error for 8: "העתקתם את 2 × 2 × 2 מההסבר. כאן יש שתי שאלות בלבד: 3 מנגנונים × 2 שיטות."

6. **קטן — a slogan** (callout "מה לקחת מזה", MDX 235: "יועץ שמסיק תשובה לשאלה אחת מתשובה לשאלה אחרת, מנחש.").
   - Fix: "לכן היועץ שואל כל שאלה בנפרד, ולא מסיק תשובה אחת מאחרת."

---

## Lesson 1.4 — מסלול ותמהיל

1. **חשוב — case A appears with no "דוגמה לימודית" label** (MDX 60, the illustration MDX 113, the worked example MDX 152).
   - The label appears only in Sources (MDX 355).
   - Fix: put the same callout as 1.2 MDX 265–267 just before MDX 60.

2. **חשוב — field knowledge is not marked as waiting for Eylon** (MDX 80; also the prediction note MDX 139 and the exercise 5 feedback MDX 287).
   - The text is "לפי אילון, איש המקצוע של הצוות, זה רגיל ונפוץ… Mogi קיבלה את זה כהחלטה (2026-08-03)". It carries no "ידע מהשטח … ממתין לאישור אילון".
   - Its Sources item (MDX 350) is kind "החלטה של Mogi". A product decision is not evidence of a market fact. `field-knowledge.md` DEC-2 notes that Directive 451 says nothing on it.
   - The claim is also missing from `research/eylon-list.md`, whose stage-1 table has no row for 1.4.
   - Fix: inline "(ידע מהשטח, אילון, 2026-08-03; ממתין לאישור אילון)".
   - Add a Sources item of kind "ידע מהשטח".
   - Add DEC-2 to the Eylon list (coordinator).

3. **חשוב — a percent answer comes with no rounding instruction** (exercise 6, MDX 296–311: answer 63.33, `tolerance={0.01}`, `near={0}`).
   - A learner who types 63.3 gets a plain "wrong". The intro (MDX 206) gives no rule for decimals.
   - Fix: "באחוזים, עגלו לשתי ספרות אחרי הנקודה", or `near={0.05}`.

4. **קטן — the line that leads to 1.5 calls the deal type "the purpose"** (MDX 339: "מטרת ההלוואה לעומק: מי קונה דירה ראשונה, מי מחליף דירה, מי קונה עוד דירה…").
   - 1.5 itself says that single / replacement / additional is a separate field, not the purpose. See cross-lesson item 3.
   - Fix: "סוג העסקה לעומק: מטרת ההלוואה, כמה דירות כבר יש לכם ומה יקרה להן, וממי קונים."

5. **קטן — a rule appears in the "five questions" callout with no marker** (MDX 320: "וגם לבנק ישראל יש כללים על החלוקה, כדי שלא כל המשכנתא תהיה חשופה לעליית ריבית").
   - Fix: append "(לא אומת; שיעור 4.4)".

6. **קטן — the difficulty order is dishonest** (exercise 5, MDX 281–293).
   - It is a conceptual multiple-choice that restates MDX 80, labelled בינוני and placed after two numeric בינוני items. AUTHORING says a conceptual multiple-choice item is usually קל.
   - Fix: label it קל and move it to position 2.

7. **קטן — common errors are missing** (exercise 2, MDX 229–232).
   - 24,000,000 (800,000 × 30, the ÷ 100 forgotten).
   - 26,666.67 (800,000 ÷ 30).

8. **קטן — exercise 6 has no actor** (MDX 311: "תמהיל של שלושה מסלולים: …").
   - Fix: "קיבלתם הצעה בשלושה מסלולים: …".

---

## Lesson 1.5 — סוגי עסקאות ולקוחות

1. **חשוב — the decision tree has no honest path for building on land the learner already owns** (DealTree, MDX 57–82).
   - The node "על מה הכסף?" offers three answers: "קונים דירה", "קונים מגרש", or "כסף כנגד נכס שכבר בבעלותנו" (which leads to שיפוץ, or לכל צורך אחר).
   - The self-build result says "גם מי שהמגרש כבר שלו מגיע לכאן" (MDX 72). But the only way there is "קונים מגרש", which is false for that person.
   - Exercise 7 (MDX 388: the couple inherited the land) shows the cost. A learner who follows the tree honestly ends at "הלוואה לכל מטרה", the very answer the exercise marks wrong.
   - Fix: replace "קונים מגרש" with "בונים בית, או קונים מגרש". Under it, ask "המגרש כבר שלכם, או שאתם קונים אותו?", then "תבנו עליו בית בכסף מההלוואה?".

2. **חשוב — field knowledge is not marked as waiting for Eylon** (MDX 193, 194 and 255).
   - Each place says only "(ידע מהשטח)", with no date and no "ממתין לאישור אילון". 1.1 and 1.2 give the full marker.
   - Fix: "(ידע מהשטח, אילון, 2026-07-27; ממתין לאישור אילון)".

3. **חשוב — "בתוך תקופה שהבנק קובע" contradicts the lesson's own callout.**
   - It appears at MDX 155, in the tree note MDX 27, in the reveal MDX 238, in exercise 6 (MDX 367, 369), in the summary MDX 406 and in the glossary entry "דירה חליפית".
   - The callout (MDX 166) says "להגדרות המדויקות בכללי בנק ישראל יש פרטים נוספים, למשל כמה זמן יש למכור את הדירה הקודמת", so the period may be set by the rules rather than by the bank.
   - The research notes do not say who sets it.
   - Fix everywhere: "בתוך תקופה מוגבלת". At MDX 155, add "מי קובע אותה וכמה זמן — לא נבדק מול כללי בנק ישראל (לא אומת)".

4. **קטן — "ממ״ד" is never spelled out** (MDX 77, 81, 138, 190).
   - 1.3 wrote "חדר מוגן" in words.
   - Fix, at first use: "בניית ממ״ד (מרחב מוגן דירתי, חדר ביטחון)".

5. **קטן — "הטופס" means two different things.**
   - **The app:** "בטופס יש 9 אפשרויות" (MDX 138) is the "העסקה" screen of the advisor app.
   - **A bank:** in MDX 157, 196 and 253 it is a bank's form.
   - **Unclear:** MDX 163 ("הטופס שואל מה יקרה לה"), MDX 188 and the tree note MDX 73 ("מטרה נפרדת בטופס") could be either.
   - Fix: "במסך ״העסקה״" for the app, and "בטופס של בנק" for a bank.

6. **קטן — a claim has no source** (MDX 163: "ואז הטופס שואל מה יקרה לה: האם היא תיסגר, תעבור לדירה החדשה (גרירה), או תישאר בלי שינוי").
   - The registry item in Sources (MDX 424) lists only four fields.
   - Fix: add this field to that item, or mark the claim.

7. **קטן — case C does not carry the full label** (MDX 247: "תיק לימודי בדוי").
   - The course map (§8) asks every case to carry "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד…".
   - Fix: use the same callout as 1.2.

8. **קטן — overclaims in the "five questions" callout.**
   - MDX 396: "מחליטים קודם, כי היא משנה את כל השאר". Fix: "…כי היא משנה את שיעור המימון המרבי ואת השאלות שיישאלו".
   - MDX 393: "הכללים של בנק ישראל… מתחילים מסוג העסקה" has no marker. Fix: append "(לא אומת)".

9. **קטן — no ceiling is given for the deal types that are not purchases** (summary MDX 412: "סוג העסקה משנה כמה מותר לממן (שיעור 1.2)").
   - 1.2 gave ceilings for purchases only. All-purpose loans (exercise 5), refinancing and self-build have no ceiling anywhere.
   - The research note on 329 has a base of 50% for all-purpose loans and a possible 70% / 200,000 ₪ relief, and the summaries disagree about it.
   - Fix (no numbers): "לתקרות של הלוואה לכל מטרה, מחזור ובנייה עצמית — בשיעור 4.4 (לא אומת)."

10. **קטן — the tree asks "how many" and answers yes/no** (MDX 84: "כמה דירות יש לכם היום, לפני הקנייה?").
    - The answers are "אין לנו דירה" and "יש לנו דירה, ונמכור / ונשאיר אותה".
    - Fix: "יש לכם היום דירה? ואם כן, מה יקרה לה?"

11. **קטן — the prerequisites are incomplete.**
    - The page shows only 1.2, following the map. But it relies on 1.3 (מטרת ההלוואה) and on 1.4 (מסלול and תמהיל at MDX 193 and 196).
    - Fix: in the map, set 1.5's prerequisites to 1.2–1.4. The map is a shared file, so this is for the coordinator.

12. **קטן — "מחיר למשתכן" is described in the present tense, with no date** (MDX 179 and the glossary).
    - The research note groups מחיר למשתכן, דירה בהנחה and מחיר מטרה together, and whether מחיר למשתכן is still running in 2026 is not checked.
    - Fix: "תוכניות של המדינה, כמו מחיר למשתכן…" and add "(לא אומת, נכון ל־9 באוקטובר 2026)".

---

## Cross-lesson items

1. **חשוב — 1.2 promises definitions checked against the source in 1.5; 1.5 says they were not checked.**
   - 1.2, MDX 143: "ההגדרות המדויקות של כל סוג עסקה — בשיעור 1.5".
   - 1.2, Sources MDX 485: "ההגדרות המדויקות — בשיעור 1.5, אחרי בדיקה מול המקור".
   - 1.5, MDX 166: "ההגדרות לא נבדקו מול נוסח ההוראה (לא אומת…)". It then points to 4.4.
   - Fix (1.2, MDX 143 and 485): "ההגדרות של כל סוג עסקה, כפי שהבנקים שואלים עליהן — בשיעור 1.5. ההגדרות בכללי בנק ישראל — בשיעור 4.4 (לא אומת)."

2. **חשוב — the 50% ceiling has two names, and nothing says they are the same.**
   - **In 1.2 it is "דירה להשקעה":** in the table (MDX 135), on the PriceBar label (MDX 33), in subtitle 14 and in the summary (MDX 468).
   - **In 1.5 it is "דירה נוספת":** the term, the tree and the card sort, with only "בטופס של אחד הבנקים התשובה הזו נקראת ״דירה להשקעה״" (MDX 157).
   - **1.2 also links only two of the three rows ahead.** Rows 1 and 2 carry `<Later lesson="1.5">`; row 3 does not.
   - **The official name** in the 329 summaries is "דירה להשקעה" (`official-sources.md` §1).
   - Fix (1.2, row 3): `<Later lesson="1.5">דירה נוספת</Later> (בהוראה ובחלק מהטפסים: ״דירה להשקעה״)`.
   - Fix (1.5, MDX 157): add "זו השורה של 50% בטבלת התקרות בשיעור 1.2".

3. **חשוב — purpose and deal type are mixed up across 1.3, 1.4 and 1.5.**
   - **1.3** says the purpose sets the ceiling. MDX 152: "המטרה משפיעה על דברים אחרים: כמה מותר ללוות (שיעור 1.2)". The "five questions" callout (MDX 370, 372) says the same.
   - **1.4** calls home ownership "the purpose" (MDX 339, item 1.4-4).
   - **1.2's ceilings** depended on how many homes you own, not on the purpose.
   - **1.5 shows the opposite of 1.3.** It makes single / replacement / additional a separate field (MDX 139, 199). Its tree answer (MDX 221) says "המטרה וממי קונים לא השתנו. ובכל זאת, כמה מותר לממן יכול להשתנות". So the reader sees the ceiling change while the purpose stays.
   - Fix (1.3, MDX 152): "המטרה היא חלק מ״סוג העסקה״ (שיעור 1.5), ויחד עם שאר חלקיו — למשל כמה דירות כבר יש לכם — הוא משפיע על כמה מותר ללוות (שיעור 1.2)…"
   - Fix (1.4, MDX 339): see item 1.4-4.

4. **חשוב — whether financing is measured against the price or the value is told two ways.**
   - 1.2 says it is always the value (item 1.2-5). 1.5 (MDX 180) says it is a rule still to come.
   - Fix: as in item 1.2-5.

5. **חשוב — the reliability markers in the body are uneven.**
   - **Field knowledge:** 1.1 and 1.2 give "(ידע מהשטח, date; ממתין לאישור אילון)". 1.4 gives nothing (item 1.4-2). 1.5 gives "(ידע מהשטח)" only (item 1.5-2).
   - **Bank of Israel rules:** 1.2 and 1.4 mark them "לא אומת" with a date in the body. 1.3 (item 1.3-1), the 1.4 callout (item 1.4-5) and the 1.5 callout (item 1.5-8) do not.
   - Fix: one form everywhere, as in 1.2.

6. **קטן — one name, two people.**
   - "דנה" is the borrower who lost her home in 1.1 (MDX 197). In 1.3 (MDX 216) she is a new buyer, "דנה ויואב".
   - Fix: rename the 1.3 couple.

### For the Eylon list (`research/eylon-list.md`, coordinator)

- Add **DEC-2** (each track has its own term; "30 שנה לצד 12 שנה זה רגיל ונפוץ"), used in 1.4.
- Under **FK-H-005**, which counts when the appraised value is *above* the price? Also fix the speaker attribution (see item 1.2-5).
