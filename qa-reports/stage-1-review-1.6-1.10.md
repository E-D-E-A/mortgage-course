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
