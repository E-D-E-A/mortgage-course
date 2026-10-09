# Stage 1 beginner review: lessons 1.6–1.10

Date: 2026-10-09

QA review of lessons 1.6–1.10, read as a beginner who has finished stage 0 and lessons 1.1–1.5. I edited no file except this report.

**What I read**
- The built text in `dist/lessons/1-6/` … `1-10/`. The build was refreshed at 15:07 while I worked. I re-extracted every lesson. The only change was 1.10's footer, which now leads to the stage-1 check.
- The MDX files `src/pages/lessons/1-6.mdx` … `1-10.mdx`.
- The data files `data/lessons/1-6.json` … `1-10.json`.
- The 1.7 subtitles and 10 of its key frames in `qa/video/1-7-t*.png`.
- The phone screenshots `qa/screens/phone_lessons_1-6_.png` … `1-10_.png`, cut into strips. These were taken at 15:04.
- The map data `src/components/big-picture/stage-1.ts`, and the components `BigPictureMap`, `ProcessTimeline`, `FillTable` and `DiyChecklist`.
- `course/AUTHORING.md`, `course/course-map.md` (stage 1, case A, the big-picture map), the stage-0 reviews, `research/field-knowledge.md`, `research/eylon-list.md`, `research/notes/brain-product-journey.md` and `research/notes/official-sources.md`.

**Spot checks that passed**
- **Dates.** I recomputed every date and day count in 1.7, 1.8 and 1.10 by hand against the 2026 calendar and the closed days in `calendar.closed_2026`. All are correct, including the Yom Kippur case (17 Sep → 25 Sep, or 23 Sep without the holidays) and the 90-day case (20 Oct → 18 Jan 2027).
- **Case A numbers.** 1,640,000 ₪, 74.55%, 21,700 ₪, 20,250 ₪ and 360,000 ₪ match `data/lessons/1-10.json` and the course map.
- **The 12 steps.** The titles in 1.10 (the list and `DiyChecklist`) match 1.7's `steps` word for word, in the same order.
- **Real bank names.** None in visible text or subtitles. Discount and Mizrahi from the field notes became "בנק אחד".
- **Case A label.** "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד…" appears wherever case A appears (1.6, 1.7, 1.8, 1.9, 1.10).
- **"בשיעור הבא" lines.** Each uses the next lesson's exact title. 1.10 leads to `/checks/1/`, in its summary and in the footer button.
- **Contradictions shown, not hidden.** 24 days against "28–30 days / 3 months"; 90 days against "12–14 months / 3 months / obliged to accept"; "a law from 2021" against the directive; "order an appraiser immediately" against the research. Each appears with both sides.
- **The 1.7 equation on the phone** ("24 − 22 = 2") renders left to right correctly.

Items below: severity (**חוסם** / **חשוב** / **קטן**), the exact quote and where it is, the problem, and the fix.

---

## Lesson 1.6: המשתתפים

1. **חשוב.** Exercise 6 (MDX line 321): "נועם ושירה חתמו בעסקה על שני ייפויי כוח… למי, ולמה?" The premise contradicts the lesson's own worked example.
   - Step 3 of the worked example says they sign the advisor's authorisation "בנוסח של כל בנק שהוא פונה אליו". So they signed one per bank, plus one to the bank: more than two.
   - The wrong option "שניהם ליועץ, אחד לכל בנק" is therefore half true by the lesson's own words.
   - The exercise is also labelled מאתגר but is a recall item that repeats a sentence from "שלושה מסמכים" ("כתב ההרשאה ליועץ הוא ייפוי כוח אחד. … יש עוד אחד").
   - Fix: "נועם ושירה חתמו על שני **סוגים** של ייפוי כוח. מי מקבל כל סוג, ולמה?" Then change the distractor to "שניהם ליועץ: אחד להגשה ואחד למשא ומתן". Relabel it בינוני.

2. **חשוב.** Worked example, line 180: "נעבור על העסקה לפי הסדר". The order shown does not match lesson 1.7.
   - Here the contract is signed (step 2) **before** the advisor is hired (step 3).
   - The appraiser is ordered from bank A's list (step 4) before any bank is chosen.
   - In 1.7, the 12 steps have no contract step at all, and the appraisal comes after "בחירת בנק ופתיחת תיק" (step 8).
   - A beginner who reads "לפי הסדר" takes this as the standard sequence. See cross-lesson items 1 and 2.
   - Fix: "נעבור על העסקה **הזו** לפי הסדר שבו היא קרתה. הסדר משתנה מעסקה לעסקה; את הסדר הכללי נראה בשיעור 1.7."

3. **קטן.** The hint of the "מי עושה את זה?" table (line 223): "בדקו את השורות האדומות במפה למעלה". The map has no red lines.
   - `BigPictureMap.vue` draws the links as teal dashed lines (`--mogi-teal-deep`).
   - On the phone, the map is an accordion list with no lines at all.
   - Fix: "פתחו את המשתתף במפה למעלה, וקראו את הקשרים שלו."

4. **קטן.** Map task 1: "לחצו על ״שמאי״". The map opens with the appraiser already selected (`initial="appraiser"`, line 106).
   - On the phone, a tap calls `toggleInList`, so following the instruction **closes** the card the task asks the learner to read.
   - Fix: "פתחו את ״שמאי״ (אם הוא כבר פתוח, קראו אותו)". Or drop `initial`.

5. **קטן.** The table "שתי שאלות לכל משתתף", lines 161–162. Two cells do not answer their column, "בשביל מי הוא עובד":
   - The appraiser: "נבחר מהרשימה של הבנק, והדוח הולך לבנק".
   - The insurer: "הפוליסה של הלווים, והבנק מקבל את הכסף אם קורה משהו".
   - On the phone, the column the lesson is about, "מי משלם לו", is off screen, and the appraiser's cell is cut ("…והדוח הולך לבנ").
   - Fix, the cells: "בשביל הבנק (נבחר מהרשימה שלו, והדוח הולך אליו)". For the insurer: "בשביל עצמו, כחברה שמוכרת ביטוח; הבנק הוא מי שמקבל את הכסף".
   - Fix, the layout: put "מי משלם לו" as the second column, so the contrast is visible without scrolling.

6. **קטן.** Two rules appear in the body as plain facts, with no "(לא אומת)": "הבנק נותן רשימה של שמאים שהוא עובד איתם … הלווים יכולים לבקש מהבנק עותק".
   - The appraiser list and the right to a copy both come from directive 451 (§4ג(ג)(2), §10).
   - The paragraphs on the insurer and on licensing do carry the mark.
   - Fix: add "(לפי תעתיק של הוראה של בנק ישראל; לא אומת)" after "עותק".

7. **קטן.** Several field-knowledge claims carry no field mark in the body: "השמאי … שולח את הדוח ישירות לבנק" (FK-H-040) and "לכל בנק יש נוסח משלו" (FK-H-075).
   - Their only label in the body is "(לא אומת)", for the forms. The "ממתין לאישור אילון" status is only in the sources.
   - Fix: "(ידע מהשטח ותעתיק של טפסים; ממתין לאישור אילון)".

8. **קטן.** Sources, first line: "הוראת בנק ישראל 451, שנלמד בשיעור 5.1". הוראה is feminine, and the clause has no object. The same wording is in 1.7 and 1.8.
   - Fix: "שנלמד עליה בשיעור 5.1".

---

## Lesson 1.7: התהליך מקצה לקצה

1. **חוסם.** Expected observation 3 of the timeline (MDX line 166): "12 יום במקום 24: אחרי אישור שהגיע ב14 באוקטובר, התנאים נשמרים עד 26 באוקטובר בלבד." The widget never shows this.
   - The answer uses the worked example's approval date (`worked.approved`, 14 Oct).
   - The widget's slider starts at "הבנק ענה אחרי 5 ימי עסקים", so its approval date is 16 Oct and the 12-day window ends on **28 Oct**.
   - A learner who did task 2 first (send date 17 Sep) sees 25 Sep → 7 Oct.
   - The learner sees one date and is told another, at the moment the lesson teaches careful counting.
   - Fix, either way:
     - Make task 3 say "החזירו את התאריך ל־11 באוקטובר, הזיזו את ״הבנק ענה אחרי״ ל־3 ימים, וכבו את ״נרשם שעבוד חדש״", so the widget shows 14 Oct → 26 Oct.
     - Or keep the task, add facts for 16 Oct → 28 Oct, and use them.
   - Also "ב14" is missing its maqaf (see the cross-lesson items).

2. **חשוב.** Exercise 6 (מאתגר, line 395): a request on 17 Sep, before Yom Kippur. This is the same case as illustration task 2: "בחרו שהבקשה נשלחה ב־17 בספטמבר 2026. אילו ימים לא נספרו…".
   - That task's answer, "יום שישי, 25 בספטמבר, ולא 23 בספטמבר", is printed in the "מה הייתם אמורים לראות" box above.
   - The hardest exercise is a repeat with its answer already shown. This is the stage-0 0.7 finding again.
   - Fix: move exercise 6 to another 2026 holiday from `calendar.closed_2026`.
     - Example: a request on Thu 16 Apr 2026, with Independence Day on Wed 22 Apr. Then 17 (1), 19 (2), 20 (3), 21 (4), 23 (5) → Thu 23 Apr. Without the holiday → 22 Apr.
     - Add these as facts. Or change the illustration task to another date.

3. **חשוב.** Exercise 4 (line 340) has only one error: counting from day 1. It lacks the mistake the exercise exists to catch: using 24 days instead of 12.
   - The fact `ex4.err_24` (3 Dec) exists, and the solution mentions it, but typing 3 gets no message.
   - Fix: `{ value: day("ex4.err_24"), tolerance: 0, message: "השתמשתם ב־24 יום. בלי שעבוד חדש החלון הוא 12 יום." }`. Lesson 1.8, exercise 5 already has this error.

4. **חשוב.** Exercises 3 and 6: "…אם זו הלוואה רגילה?" In 1.1, "הלוואה רגילה" was set against a mortgage (the map title of 1.1: "ומה ההבדל מהלוואה רגילה").
   - Here it means "a loan type the bank did not define in advance for 7 days". A beginner can read it as "not a mortgage".
   - Fix: "…אם הבנק לא הגדיר את סוג ההלוואה הזה מראש ל־7 ימי עסקים?"

5. **חשוב.** The worked example and the half-solved table give case A two different appraisal dates.
   - Step 5 (line 248): "השמאי ביקר ביום שלישי, 20 באוקטובר".
   - The half-solved table: "התיק נפתח 26 באוקטובר", "השמאי ביקר 29 באוקטובר".
   - In step 5, the appraisal also comes before the file is opened, against the lesson's own order (step 7 before step 8).
   - Fix: use 29 Oct in step 5. 29 Oct + 90 days = 27 Jan 2027; add it as a fact.

6. **חשוב.** The 12 steps never say where the purchase contract is signed. See cross-lesson item 1.
   - Lesson 1.6 promised "באיזה סדר כל המשתתפים האלה נכנסים לעסקה". In 1.7 the seller and the lawyer never get a step; the contract appears only inside step 2's card, as a document ("חוזה ונסח טאבו").

7. **קטן.** The guided date picker on the phone shows "10/11/2026" for 11 October. The headless browser uses a month-first locale. An Israeli reader reads it as 10 November.
   - Fix: print the chosen date in words under the input, for example "יום ראשון, 11 באוקטובר 2026", as the result cards already do.

8. **קטן.** Line 91: "לפי אילון, אצל רוב האנשים התשובה מגיעה מיד … (ידע מהשטח, ממתין לאישור אילון)". It has no date. Every other field claim in the lesson has one.
   - Fix: "(ידע מהשטח, 2026-07-27, ממתין לאישור אילון)".

9. **קטן.** "ב־Mogi הוחלט (2026-08-18) שהמערכת תזכיר את זה ליועץ ביום העסקים השישי." For a loan type with a 7-business-day limit, asking on day 6 is too early.
   - Fix: add "(ובסוג הלוואה שהבנק הגדיר ל־7 ימים — ביום העסקים השמיני)". Or say the reminder is set for the usual 5-day case.

10. **קטן.** Line 95: "ושם מתחיל העבודה האמיתית". עבודה is feminine. Fix: "ושם מתחילה העבודה האמיתית".

11. **קטן.** Card of step 3 in the timeline: "בשלב הזה הבנק בודק גם את היסטוריית האשראי של הלווים."
    - The term is new and not explained.
    - It is stated as fact, while the source says only "בנקים **מפרסמים** שהם בודקים".
    - Fix: "בנקים מפרסמים שבשלב הזה הם בודקים גם איך הלווים החזירו הלוואות בעבר (לא אומת)."

12. **קטן.** "הוראת שעה … בזמן מבצע ״שאגת הארי״": the terms "הוראת שעה" and "מבצע" are not explained.
    - Fix: "הוראה זמנית (הוראת שעה), בזמן המלחמה שהחלה בפברואר 2026 (מבצע ״שאגת הארי״)".

13. **קטן.** Five-questions callout, line 404: "המטרה היא להגן על הלווים ולאפשר להם להשוות בין בנקים." This states the regulator's purpose as fact, with no source. Lesson 1.8, line 396, has the same pattern.
    - Fix: "כנראה, המטרה היא…". Or cite the directive's stated purpose if the transcript has it.

14. **קטן.** In the video:
    - Cue 15 states "כל מה שעד החתימה רץ מול השעון הזה" as a rule. The text marks it "הערכה של הצוות… לא כלל כתוב".
    - Cue 19 and the last frame ("לפי תעתיק של הצוות… לא אומת מול המקור") carry no date.
    - In the 24-day strip, Saturdays are drawn lighter, which says "these count less" just as the cue says they count.
    - Cue 11 computes a date but says nothing about day 0.
    - Fix:
      - Cue 15: "לפי הצוות, כל מה שעד החתימה רץ מול השעון הזה."
      - Cue 19: "…לא אומתו. נכון ל־9 באוקטובר 2026."
      - Draw all 24 days in one colour; keep the "שבת" label.
      - Cue 11: "בקשה ב־11 באוקטובר (יום 0): תשובה עד 16 באוקטובר."

---

## Lesson 1.8: אישור עקרוני מול העמדת כסף

1. **חשוב.** Exercise 5 (בינוני) repeats lesson 1.7's exercise 4 word for word: "זוג ממחזר משכנתא, ובהלוואה החדשה לא נרשם שעבוד חדש. האישור העקרוני הגיע ביום שני, 9 בנובמבר…" The answer is again 21.
   - Fix: use a new date and a new twist, for example a refinance approved on Fri 23 Oct (no lien, 12 days → Wed 4 Nov). Add it as a fact.

2. **חשוב.** Exercise 2: "כמה ימים נשארו לפחות עד שהבנק כבר לא חייב בתנאים?" The question is ambiguous, and two of its error messages do not match a real mistake.
   - The bank is still bound on day 24, so "until it is no longer bound" is 8 days (day 25), not 7.
   - "לפחות" in that place has no clear meaning.
   - `err_inclusive` = 6 says "ספרתם את יום האישור כיום 1", but the exercise gives the days already passed (17), so nothing is counted.
   - `err_twelve` = −5 is a number nobody types.
   - Fix, the question: "עברו 17 ימים מיום האישור. כמה ימים נשארו עד סוף החלון (היום ה־24)?"
   - Fix, the errors: replace them with 8 ("ספרתם גם את יום 25. החלון נגמר ביום 24") and 0 ("השתמשתם ב־12 יום; כאן נרשם שעבוד חדש").

3. **קטן.** Worked example, step 1: "24 יום מיום האישור: … עד יום שבת, 7 בנובמבר". This computes a date without restating the counting rule. Day 0 appears only above the exercises and in the sources.
   - Fix: "יום האישור, 14 באוקטובר, הוא יום 0. 24 יום אחריו — כולל שבתות — הם יום שבת, 7 בנובמבר."

4. **קטן.** Five-questions callout, line 397: "השעון מתחיל ביום האישור". This is stated as fact. Lesson 1.7 says it is open ("בצוות עוד פתוחה השאלה אם 24 הימים נספרים מהיום שבו האישור ניתן או מהיום שבו הגיע ללווים"), and `eylon-list.md` lists it as an open question.
   - Fix: "בקורס סופרים מיום האישור (שאלה פתוחה, ראו שיעור 1.7)".

5. **קטן.** Line 141: "לפי אילון, הבנק מודד את שיעור המימון מול השווי שהשמאי קבע". FK-H-005 and the lesson's own source say the speaker in the recording is uncertain ("זיהוי הדובר בהקלטה לא ודאי"). The body attributes the claim with certainty.
   - Fix: "כך נאמר בפגישה עם בנקאי ב־2026-08-05 (הדובר לא ודאי; ידע מהשטח, ממתין לאישור אילון)".

6. **קטן.** Line 162: "בהעמדת ההלוואה: הכסף עובר, ומעכשיו הלווים הם שחייבים." This suggests the borrowers owe nothing until the money moves, though the lesson has just said the signed agreement binds **both** sides.
   - Fix: "בהעמדת ההלוואה: הכסף עובר, ומתחיל החוב — ואיתו התשלומים."

7. **קטן.** Callout title, line 145: "ניסוח אחד, שני קריאות". קריאה is feminine. Fix: "ניסוח אחד, שתי קריאות".

8. **קטן.** Worked example step 4 and the widget (line 92): "…או לבקש בקשה חדשה". The bank asks for a request; the subject is wrong.
   - Fix: "…או לדרוש מכם להגיש בקשה חדשה".

9. **קטן.** Exercise 6 (three banks) has errors for the latest bank and for bank A, but none for the classic mistake of counting from day 1 (4 Nov).
   - Fix: add `ex6.err_day_one` (4 Nov) with "ספרתם את יום האישור כיום 1. הוא יום 0."
   - Also "ב14 / ב16 / ב12 באוקטובר" lack the maqaf.

---

## Lesson 1.9: מה היועץ מברר לפני שמדברים על ריבית

1. **חשוב.** Line 163: "לכל צעד בתהליך יש שעון (שיעור 1.7)". This contradicts 1.7, which says only three rules are clocks: "ושאר הצעדים? אין להם שעון", and in the summary, "לשאר הצעדים אין שעון שמצאנו".
   - Fix: "לחלק מהצעדים יש שעון (שיעור 1.7) — ובעיקר 24 הימים שבהם האישור בתוקף — ולכן חשוב לדעת מראש מתי הכסף צריך להיות מוכן."

2. **קטן.** The field claims in the body are marked only "(ידע מהשטח, ראו מקורות)", at lines 96 and 100 and in the five-questions callout. They have no date and no "ממתין לאישור אילון", unlike 1.7 and 1.8.
   - Fix: "(ידע מהשטח, אילון, 2026-07-27; ממתין לאישור אילון)" and the matching dates for FK-H-034 (2026-08-26) and FK-H-062 (2026-09-16).

3. **קטן.** Exercise 8, wrong option (line 384): "לבקש מהם לוותר על הלימודים, כדי שההלוואה תעבור." Shira's plan in exercise 7 is a move to half-time work. Nobody mentioned studies, so the reader wonders what was missed.
   - Fix: "לבקש משירה לוותר על המעבר לחצי משרה, כדי שההלוואה תעבור."

4. **קטן.** The prediction's correct option is three times longer than the others and repeats the lesson's title ("…ורק אחר כך לדבר על ריבית"). It can be picked without thinking. See the cross-lesson item on answer length.
   - Fix: shorten it to "לברר קודם את המצב הכספי שלהם" and lengthen one wrong option to match.

5. **קטן.** On the phone, the half-solved table's headers "משפחה" and "הכנסה 1" run together as "משפחההכנסה 1". In the income columns, the "₪" wraps to its own line.
   - Fix: give the first column a minimum width and a gap. Or use "מס׳" as its header.

6. **קטן.** The worked example's family is "דנה ויואב". "דנה" was already the borrower who lost her income in 1.1's worked example. A reader who goes back to 1.1 meets two different Danas.
   - Fix: rename this one, for example "מיכל ויואב".

---

## Lesson 1.10: סדנה: עושים את זה לבד

**Does it deliver the stage's three products?** Mostly.
- The first-meeting questions (14 items) and the do-it-yourself list (12 steps, 64 items) are real take-aways: saved in the browser, with notes, and printable.
- The deal map is a reading table plus a `FillTable`. `FillTable` saves only a done flag (`save(exercise:…, {done})`), not the values. The map vanishes on reload and is left out of the print view. See item 3.
- The stage check is linked from the summary and from the footer button.

1. **חשוב.** Exercise 5 (line 693): the salary arrives on the 9th, and the payment day can be the 1st, 10th or 15th. "איזה יום מסוכן להם?" The answer is "the 1st", but its explanation is wrong, and the question has two defensible answers.
   - The feedback says "ב־1 בחודש המשכורות עוד לא נכנסו, והתשלום יורד מחשבון שעוד לא קיבל אותן". But on the 1st, last month's salary has been in the account for 22 days.
   - The real risk on the 1st is that the account is at its lowest at the end of the pay cycle.
   - The 10th is also risky, with one day of margin if a salary is late, and the feedback calls it only "אפשרי".
   - Fix:
     - The question: "איזה יום הכי רחוק מיום המשכורת, ולכן הכי מסוכן?"
     - The feedback: "ב־1 בחודש עברו 22 יום מאז שהמשכורות נכנסו, ובחשבון נשאר בדרך כלל הכי מעט כסף."
     - Under the 10th, add: "יום אחד של מרווח: אם משכורת מתעכבת, גם זה מסוכן."
   - Also add "(בנקים רשאים להציע גם ימים אחרים)". The notes on J-160 say so, and the lesson implies the three days are the only choice.

2. **חשוב.** Exercise 2, feedback on "אין צורך בשמאי בדירה יד שנייה" (line 644): "בנק לא מלווה לפני שיש לו שמאות של הנכס. זה נכון לכל דירה." The notes say otherwise.
   - J-140 / J-160 (`brain-product-journey.md` line 851): "internal refinance needs no appraisal".
   - FK-H-036: in a developer's project or מחיר למשתכן, a project-level report replaces an individual appraisal.
   - The feedback on "מיד, לפני ההגשה" also says "בנק **מתחייב** רק לגבי שמאות של שמאי שברשימה שלו". The rule as copied is only "לא יסרב שלא באופן סביר".
   - Fix:
     - "בקנייה של דירה יד שנייה הבנק מבקש שמאות לפני שהוא מלווה. (יש מקרים אחרים, כמו מחזור באותו בנק, שבהם לפי הצוות לא תמיד צריך.)"
     - "…בנק לא יסרב שלא באופן סביר רק לשמאות של שמאי שברשימה שלו."

3. **חשוב.** Product 1, the deal map ("תוצר 1: מפת העסקה"):
   - **It is not kept.** Its four computed numbers are not saved, and the summary says only the two lists can be printed ("אפשר להדפיס את שתי הרשימות"). The learner ends the stage without the first product.
   - **It breaks on the phone.** The two-column table has no row lines. "(אם יש)" splits from "יועץ משכנתאות" and lands beside the next cell's text. The prefix "ו" of "ומשכנתא" sits alone at the end of a line. "טאבו, או / רשות מקרקעי ישראל / , או חברה משכנת" starts a line with a comma.
   - Fix:
     - Render the map as cards, or give each row a border.
     - Keep the prefix and the parenthesis inside a `whitespace-nowrap` span.
     - After "בדיקה", show the completed numbers, and add the map, people and numbers both, to the printable view, or to a `DiyChecklist`-style saved block.

4. **חשוב.** Difficulty order of the six "איפה נופלים" exercises (lines 629 on) is not honest.
   - Exercise 2 is labelled **קל**, but it is the one question the lesson calls an open contradiction ("זו סתירה פתוחה (ראו צעד 8)").
   - Exercises 6 and 7 are labelled **מאתגר**, but each is a multiple choice where one option is plainly sensible and the others are absurd ("לוותר על הביטוחים", "לוותר על הדירה").
   - Fix: relabel 2 as בינוני and 6–7 as קל or בינוני. For a real מאתגר, add a planning item that mixes two clocks.
     - Example: "האישור הגיע ב־X; האיסוף לקח N ימים; השמאי פנוי רק ב־Y. האם החתימה ב־Z עוד בתוך החלון?" Add the dates as facts.

5. **חשוב.** "המספרים החשובים": "הלוואה שצריך" = price − all the equity (1,640,000 ₪). This silently uses every shekel for the price.
   - Lesson 1.9 has just taught "יש הוצאות סביב העסקה, מעבר למחיר הדירה… גם הן צריכות כסף זמין" and "כמה יישאר בצד אחרי העסקה".
   - The table also lists "מזה: מתנה, עוד לא הגיעה" one line above. A do-it-yourself reader copies this and under-borrows, or plans to spend money that is not there yet.
   - Fix: label the row "הלוואה שצריך, אם כל ההון העצמי הולך למחיר", with a line under the table: "בפועל צריך להשאיר גם כסף להוצאות סביב העסקה ולמקרה חירום (שיעור 1.9) — ואז ההלוואה גדלה, ושיעור המימון עולה. נחזור לזה בשלב 6."

6. **קטן.** Line 496: "אין בה הסבר חדש". The checklist brings several new facts and terms with no explanation:
   - "חיוב או זיכוי על הימים שבין העברת הכסף לתחילת ההלוואה" (step 12). "Start of the loan" reads as the same moment as the money moving.
   - "מוטב" (step 10, line 431); 1.6 said "רשום כמי שמקבל את הכסף".
   - "ספח" (step 2, line 188).
   - "דיווח לרשויות המס על העסקה" (step 7).
   - The file-opening fee, and the 3–4 months for registration at רמ״י.
   - Fix:
     - Line 496: "אין בה נושא חדש, אבל ברשימה יש פרטים מעשיים חדשים, כל אחד עם המקור שלו."
     - Step 12: "בין היום שבו הכסף עובר לבין היום שממנו הבנק סופר את התשלומים".
     - Step 10: "כמוטב (מי שמקבל את הכסף מהביטוח)".
     - Step 2: "ספח (הדף שמצורף לתעודה, עם הכתובת ובני המשפחה)".

7. **קטן.** Line 591: "אלה שש השאלות של שיעור 1.9". The six topics here differ from 1.9's six.
   - 1.9: יכולת החזר · ההכנסה · ההתחייבויות · הנזילות · לוחות הזמנים · התוכניות.
   - 1.10: העסקה · יכולת החזר · ההכנסה · ההתחייבויות · הכסף והנזילות · זמנים ותוכניות. A new "העסקה" is added, and two topics are merged.
   - Fix: "אלה שאלות הבירור של שיעור 1.9, בשישה נושאים: הוספנו את העסקה עצמה, וחיברנו את לוחות הזמנים והתוכניות."

8. **קטן.** Exercise 1: "שימו לב למספר הזה: בשלב 4 נראה שהוא קרוב מאוד לסף חשוב." Lesson 1.2 already showed this: its summary has "נועם ושירה: שיעור מימון של 74.55%, 10,000 ₪ מתחת לגבול".
   - Fix: "זה המספר משיעור 1.2: 10,000 ₪ מתחת לתקרה של 75%. בשלב 4 נראה למה זה חשוב."

9. **קטן.** Line 742: "בשלב 2 נכיר את המסלולים". Lesson 1.4 already taught what a track is.
   - Fix: "בשלב 2 נכיר את סוגי המסלולים ואת הריביות שלהם".

10. **קטן.** In the checklists, the pitfalls ("איפה נופלים") have checkboxes and count toward "סימנתם 0 מתוך 64". It is unclear what ticking a pitfall means: "I fell in", or "I checked I avoided it".
    - Fix: put a line above each pitfall group, "סמנו כשבדקתם שזה לא קורה לכם". Or leave pitfalls without checkboxes and count only "מה מביאים / מה שואלים".

11. **קטן.** The slogan is inserted into a question and inverted into a pitfall, where it reads as a riddle.
    - Question list, topic 2: "כמה אתם משלמים היום על דיור? המשכנתא אמורה להחליף את השכירות, לא את החיים."
    - Step 1 (line 174): "בונים על תשלום שמחליף את החיים, לא את שכר הדירה."
    - Fix:
      - Topic 2: keep only the question, and put the quote in the source badge.
      - Step 1: "קובעים תשלום חודשי שלא משאיר מספיק למחיה. אילון: ״המשכנתא אמורה להחליף את השכירות — לא את החיים״."

12. **קטן.** Deal map row "עורכי דין — החוזה בין הקונים למוכר" (line 533). It names only the contract and puts the lawyers in the plural.
    - 1.6 taught one buyers' lawyer, who checks the registry and has the caution note registered.
    - Fix: "עורך הדין של הקונים — בודק מה רשום על הדירה, החוזה, והערת האזהרה לטובת הקונים".

13. **קטן.** Step 10 lacks a pitfall the notes support. When a policy is bought outside the bank, the bank has up to **14 days** to say whether it meets the requirements (451 §11(ב)(2), in `brain-product-journey.md` line 867; directive 253 may have changed this deadline). Buying it in the last days before the signing is exactly the risk exercise 6 is about.
    - Fix, a pitfall: "קונים ביטוח מחוץ לבנק ימים ספורים לפני החתימה. לפי ההוראה, כפי שהצוות העתיק, לבנק יש עד 14 יום לאשר פוליסה חיצונית (לא אומת; ייתכן ששונה בהוראת שעה)."

14. **קטן.** Steps 11–12 and the timeline: "נרשמת הערת אזהרה לטובת הבנק". Per the J-170 notes, the security is a הערת אזהרה **or** a משכון זכויות when the rights are not registered (line 476). Exercise 7 (rights at רמ״י) is exactly that case.
    - Fix, step 12: "נרשמת לטובת הבנק הערת אזהרה (או, כשהזכויות לא רשומות בטאבו, משכון זכויות)".

15. **קטן.** The badge "ידע מהשטח — לא מיוחס" on step 10 (FK-H-049), "הפוליסה של הבנק היא בדרך כלל היקרה", is used in the checklist and in exercise 6's feedback. `eylon-list.md` marks FK-H-049 "אין דובר בשם — צריך ייחוס או מחיקה". Lesson 1.7 uses FK-H-079 ("משכנתא מהירה כ־21 יום"), which has the same mark.
    - Fix: before publishing, attribute both or remove them, as the list asks. Until then, remove the claim from exercise 6's feedback, so that a graded answer does not rest on it.

---

## Cross-lesson items

1. **חשוב. The purchase contract has no place in the process.**
   - In 1.6's worked example, the contract and the caution note for the buyers come first, before the advisor is hired.
   - 1.7's 12 steps (and 1.10's copy of them) have no contract step. The contract appears only as a document in step 2.
   - 1.9 and 1.10 then ask "מתי נחתם החוזה" and "כבר נחתם חוזה?".
   - A do-it-yourself reader is never told whether people usually sign before or after the pre-approval, or what the risk is either way. That is the stage's main practical question.
   - The research does not settle it: J-020 only notes that "a signed contract marks a different client type".
   - Fix:
     - In 1.7, after the four parts: "ואיפה החוזה עם המוכר? הוא לא אחד מ־12 הצעדים, כי אין לו מקום קבוע: יש מי שחותמים לפני האישור העקרוני ויש מי שאחרי. מי שחותם לפני, מתחייב למועדי תשלום לפני שהוא יודע כמה בנק ילווה לו."
     - Mark that sentence as the team's description, and add the question to `eylon-list.md`.
     - In 1.10, step 1 or step 3, add the matching question: "חתמנו כבר על חוזה? אם כן, מה מועדי התשלום בו, ומה קורה אם האישור מתעכב?"

2. **חשוב. When is the appraiser ordered? Three answers.**
   - 1.6's worked example: from bank A's list, before a bank is chosen.
   - 1.7: step 8, after "בחירת בנק ופתיחת תיק", with the card "מזמינים שמאי מהרשימה של הבנק" (singular).
   - 1.10, exercise 2 (graded correct) and step 8: "אחרי שהאישורים מגיעים … שמאי שמופיע אצל כל הבנקים שעוד בתמונה", that is, between steps 4 and 7.
   - Plus the field advice "להזמין שמאי מיד", shown as an open contradiction.
   - Each answer is defensible, but nothing tells the reader they are alternatives. The 1.7 timeline, which the learner treats as the order, conflicts with the 1.10 exercise.
   - Fix:
     - In 1.7's step-8 card: "את השמאי אפשר להזמין כבר אחרי שהאישורים מגיעים, משמאי שנמצא ברשימות של כל הבנקים שעוד בתמונה (כך מציע הצוות); אז שמאות אחת משמשת כמה בנקים. בשטח יש מי שממליץ להזמין מיד (ראו שיעור 1.10)."
     - In 1.6, see 1.6 item 2.

3. **קטן. Eylon and Tobi are cited before anyone says who they are.**
   - "לפי אילון" appears in 1.1, 1.2, 1.7 and 1.8. Eylon is first introduced in 1.9: "אילון, יועץ המשכנתאות של הצוות".
   - In 1.7, "וטובי זמיר אמר…" has no description; 1.8 describes him as "בנקאי מחוץ לצוות".
   - Fix: describe both at first use in stage 1 (lesson 1.1), and again at first use in 1.7: "אילון, יועץ המשכנתאות שמלווה את הצוות" and "טובי זמיר, בנקאי מחוץ לצוות".

4. **קטן. The directive rules in the body carry "לא אומת" but no date.**
   - 1.7, line 110: "המספרים כאן הם לפי תעתיק שהצוות עשה מההוראה, ועוד לא נבדקו".
   - 1.8, line 131: "לפי התעתיק… (לא אומת מול ההוראה עצמה)".
   - The date appears only in the widget notes ("נכון ל־9 באוקטובר 2026") and in the sources. AUTHORING asks for the date in the text.
   - Fix: "…לפי תעתיק של הצוות מאוגוסט 2026, ועוד לא נבדקו מול ההוראה עצמה (נכון ל־9 באוקטובר 2026)".

5. **קטן. The maqaf is missing between a prefix and a date.**
   - 1.7, illustration answer 3 and the half-solved intro: "ב14 באוקטובר".
   - 1.8, exercise 6: "ב14 / ב16 / ב12 באוקטובר".
   - The cause is MDX of the form `ב{dm(…)}`. Other places use `ב{dw(…)}`, which starts with "יום", so the problem never shows there.
   - Fix: write `ב־{dm(…)}` in those four places. Or make `dm` return its value with a leading "־" when it follows a letter.

6. **קטן. The correct option is often the longest, most balanced one.**
   - Examples: 1.6 exercises 1 and 6, the 1.9 prediction, and 1.10 exercises 2, 6 and 7.
   - A reader can score well by picking the longest option, which hides whether they learned the rule.
   - Fix: give at least one wrong option the same length and the same careful tone in each of these items.

7. **קטן. The clocks: one vague description.**
   - The clocks are described the same way in 1.7, 1.8 and 1.10:
     - 5 business days, 7 only for loan types defined in advance, with the reason;
     - at least 24 days, 12 with no new lien, calendar days;
     - 90 days, from an appraiser on the receiving bank's list, "לא יסרב שלא באופן סביר".
   - The exception is 1.10's short step list, item 4: "האישורים מגיעים — בתוך כמה ימי עסקים".
   - Fix: "תוך 5 ימי עסקים (7 רק בסוגי הלוואות שהבנק הגדיר מראש)".
   - The other gaps in counting are in 1.7 item 14 (the video does not say day 0) and 1.8 items 3 and 4 (the worked example does not say day 0; the start day is stated as settled).

---

**Totals:** 1 חוסם, 17 חשוב, 41 קטן.
