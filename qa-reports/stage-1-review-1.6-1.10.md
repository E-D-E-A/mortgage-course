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
