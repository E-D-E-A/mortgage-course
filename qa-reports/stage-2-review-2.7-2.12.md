# Stage 2 beginner review: lessons 2.7–2.12

Date: 2026-10-10

QA review of lessons 2.7–2.12, read as a beginner who has finished stages 0–1 and lessons 2.1–2.6 (skimmed). I edited no file except this report.

**What I read**
- The built text in `dist/lessons/2-7/` … `2-12/` (built 2026-10-09 16:57, after the last MDX change at 16:55, so no rebuild was needed).
- The MDX files `src/pages/lessons/2-7.mdx` … `2-12.mdx`; line numbers below are MDX lines.
- The data files `data/lessons/2-7.json` … `2-12.json`.
- The subtitles `public/video/2-9.he.vtt` and `2-11.he.vtt`.
- The phone screenshots `qa/screens/phone_lessons_2-7_.png` … `2-12_.png` (taken 16:58), cut into 900px strips.
- The map data `src/components/big-picture/stage-2.ts`, the glossary (`src/data/glossary.json`), `course/AUTHORING.md`, `course/course-map.md` (stage 2), `research/eylon-list.md`, `research/field-knowledge.md`, and the stage-1 reviews.
- `pnpm check:terms` passes.

Items: severity (**חוסם** / **חשוב** / **קטן**), the exact quote and where it is, the problem, and the fix.

---

## Lesson 2.7: משתנה צמודה ולא צמודה

**Spot checks that passed.** I recomputed every amount in plain Python `Decimal`: 3,217.48 ₪ (500,000 ₪, 4.7%, 240 months), 415,022.58 ₪ after 60 payments, 3,435.29 ₪ on 180 months at 5.7%, 1,625.51 / 1,971.36 ₪ of monthly interest; the worked example 2,268.98, 352,602.15, 2,465.51 and 2,081.37 ₪; the linked path 2,840.66 / 2,892.70 / 3,131.15 ₪ (2,835.98 ₪ × 1.02 to the power months÷12) and 3,245.92 ₪ at month 61 (I get 3,245.91 ₪ when I round the indexed balance first; within the stated tolerance). The update-point counts (3, 7, 4; 22 months; 20 months) and the spreadsheet formula `=CEILING(A1/B1,1)-1` agree with the "take the whole part, minus one if exact" rule for 20÷5, 20÷2.5, 25÷5 and 25÷7. The market line 1.81 + 1.45 = 3.26 adds up. No bank names; the survey is dated and marked (לא אומת). The comparison table and the timeline fit at 390px.

1. **חשוב.** The linked example, lines 109–113: "התשלום הראשון (אחרי חודש של מדד): 2,840.66 ₪ … בסוף השנה הראשונה: 2,892.70 ₪". Both numbers appear from nowhere.
   - The original-schedule payment they are built from (2,835.98 ₪) is never shown, so the learner cannot redo 2.5's step "התשלום מהלוח המקורי × המדד ÷ מדד הבסיס".
   - "אחרי חודש של מדד" relies on an assumption the page never states: the index rises evenly *inside* the year (2% a year → the twelfth root each month). It is only in the sources ("המדד עולה באופן אחיד בתוך השנה"). 2.5 only ever multiplied by 102 ÷ 100 at year end.
   - Month 61 has the same jump: "התשלום מחושב מחדש על היתרה הצמודה" — the indexed balance (about 445,608 ₪) is not shown, so the learner cannot tell how much of the 114.77 ₪ rise is the index and how much is the new rate.
   - Fix: add a line "בלוח המקורי, בלי מדד, התשלום 2,835.98 ₪ (מתוך fact)". Say "נניח שהמדד עולה באופן אחיד, 2% לשנה, ולכן קצת בכל חודש". Show the indexed balance at month 60 as a fact before month 61.

2. **חשוב.** Exercises (lines 312–424) test only "anchor + spread" (2, 5) and counting points (3, 4). Nothing practises what the lesson itself calls the point. Its callout "מה לקחת מזה" (line 279) says: "שואלים: מה יקרה לתשלום אם העוגן יעלה… ואיפה תחנות היציאה".
   - No exercise asks for a payment or a month's interest at an update point. `I = B × m` (line 215) is never practised.
   - No exercise touches the exit station. Common mistakes are left untested: "I can leave a variable track penalty-free any day", "a fixed track has exit stations too", "notice can be given on the day".
   - Missing too: the mistake the warning callout (line 95) names, "subtract today's anchor from my old rate to find my spread".
   - Fix: add a choice item on the exit station (one specific day; notice 10–45 days before; none in fixed). Add a numeric item: "היתרה בנקודת העדכון 300,000 ₪, אחוז הריבית החדש 5.4%. מה הריבית של החודש הבא?" (with a fact). Turn the spread mistake into an error message somewhere.

3. **קטן.** Difficulty labels. Exercise 6 is marked מאתגר (line 415). It is a recall item: the callout "״כל 5 שנים״ — של מה?" (line 116) and the table row "התשלום" give the answer word for word. Exercise 4 (בינוני), with its two traps, is the hardest item. Exercise 5 (בינוני) is the same operation as exercise 2 (קל).
   - Fix: exercise 6 → בינוני; exercise 4 → מאתגר and move it last. Or make 6 harder: ask what happens to the payment at month 61 against month 60, and why.

4. **קטן.** Prediction, correct option (line 34): "אחוז הריבית ייקבע מחדש רק בנקודת העדכון, אחרי 5 שנים". The question has just said "עברו שנתיים". "אחרי 5 שנים" reads as "5 years from now", which is exactly exercise 4's trap (counting from today). The reveal says "מיום ההלוואה", but the option does not.
   - Fix: "…בנקודת העדכון — 5 שנים מיום ההלוואה, כלומר בעוד 3 שנים — לפי העוגן של אותו יום".

5. **קטן.** Line 89: "זו תשואה מעל ההצמדה, ולכן בדרך כלל היא נמוכה יותר." Lower than what is not said.
   - Fix: "…ולכן בדרך כלל היא נמוכה מהתשואה של אג״ח לא צמודות".

6. **קטן.** Callout "מה לקחת מזה" (line 279): "במשתנה, התשלום של היום מובטח רק עד נקודת העדכון הראשונה." True only of the unlinked track. In משתנה צמודה the payment moves every month, as exercise 6 itself teaches.
   - Fix: "במשתנה לא צמודה, התשלום… במשתנה צמודה גם זה לא: הוא זז עם המדד בכל חודש."

7. **קטן.** Worked example step 5 (line 272): "אם העוגן עולה לנקודת אחוז מעל היום." Awkward and ambiguous Hebrew ("rises to one point" / "above today").
   - Fix: "אם העוגן עולה בנקודת אחוז אחת, מ־3.5% ל־4.5%". Same for step 6: "יורד בנקודת אחוז אחת, ל־2.5%".

