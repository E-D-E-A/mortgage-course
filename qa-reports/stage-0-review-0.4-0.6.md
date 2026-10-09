# QA report: lessons 0.4, 0.5 and 0.6, read as a beginner

Date: 2026-10-09

Nothing was edited.

**Sources read:** the visible text from `dist/` (rebuilt at 13:26 during the review; same content), the MDX files, `data/lessons/0-{4,5,6}.json`, the subtitles, the phone and desktop screenshots (cropped), `RateConverter.vue` and `FillTable.vue`, `course/AUTHORING.md`, brief §2 and the course map.

**Math:** I recomputed every number in all three lessons with Decimal. They are all correct, including 51,830.00, 0.4074, 4.907, 111,003.64, 7,721.73, 15,372.45 and 6,710.08, and the loan table's row-by-row rounding.

---

## Lesson 0.4 — שנתית מול חודשית

1. **חשוב — "שורש 12" (ההסבר ›‎ "הדרך השנייה: שורש 12", MDX 112–118, the table, the converter, the summary, the video).** A reader who remembers school math reads "שורש 12" as √12 ≈ 3.46. Only the first use says "של 1.06".
   - Fix: use the ordinal everywhere: "השורש ה־12 (של 1.06)". In tables and cards write "השורש ה־12".
   - Add a definitions entry "שורש" (lesson 0.4), as 0.3 did for חזקה. Report it, because the map does not list it.

2. **חשוב — fractional power stated with no reason (MDX 202: "כותבים את זה כחזקה של שבר: 1.06^1/12. ״בחזקת 1/12״ פירושו ״שורש 12״").** 0.3 defined a power as "multiply by itself n times", and "1/12 times" makes no sense under that definition. 0.12 later relies on this for a 1/5 power.
   - Fix (present it as notation): "זה סימון מוסכם, לא ״להכפיל 1/12 פעמים״: מחשבון וגיליון מבינים ״בחזקת 1/12״ כ״המספר שאם מכפילים אותו בעצמו 12 פעמים מקבלים 1.06״. באותו אופן ״בחזקת 1/5״ הוא השורש ה־5."

3. **חשוב — one letter with two values (MDX 211–223: "שימו לב: ה־m בשורה השלישית הוא לא אותו m של השורה הראשונה").** The page warns about the clash instead of removing it. The summary (MDX 437) then shows both formulas with the same m.
   - Fix: give the twelfth-root monthly rate its own letter, for example `q = (1 + R)^(1/12) − 1`, define it in the `<dl>`, and delete the warning sentence.

4. **חשוב — the percent conversion is skipped (step 3, MDX 200: "כל שקל הפך ל־1.061678 שקלים. מורידים את השקל המקורי, ונשאר מה שנוסף: 6.1678%"; step 4, MDX 208, has the same gap).** 0.061678 → 6.1678% is never shown. The formulas define R and m "כמספר עשרוני", but exercises 3 and 5 ask in percent.
   - Fix: "ונשאר 0.061678. כדי לכתוב באחוזים מכפילים ב־100: 6.1678%." Do the same in step 4 (0.004868 → 0.4868%).

5. **חשוב — missing errors in exercise 3 (MDX 352–358) and exercise 5 (MDX 392–398).** These are the most likely wrong answers, because the formula and the page's own spreadsheet formula `=(1+6%/12)^12-1` both output decimals.
   - Exercise 3 needs:
     - 0.1268: "כתבתם כמספר עשרוני; באחוזים 12.68"
     - 1.1268 or 112.68: "שכחתם להוריד 1"
   - Exercise 5 needs:
     - 0.004074: decimal
     - 1.004074 or 100.4074: forgot to subtract 1

6. **חשוב — exercise 2 is ambiguous by the lesson's own logic (MDX 337–343: "באיזה מקרה הריבית האפקטיבית שווה בדיוק לריבית השנתית?").** The lesson just showed that compounding every month at the twelfth-root rate gives effective = 6% exactly. Option 1's feedback ("כשהריבית מצטרפת כל חודש... האפקטיבית גבוהה מהשנתית") contradicts the "שורש 12" row of the lesson's own table.
   - Fix the stem: "לקחתם הלוואה בריבית שנתית של 6%. בכל פעם שהריבית מצטרפת, מחשבים אותה כ־6% חלקי מספר הפעמים בשנה. באיזה מקרה החוב יגדל בשנה בדיוק ב־6%?"

7. **חשוב — the claim is wider than its evidence (Sources, MDX 454: "בחוזי הלוואות בישראל הריבית החודשית היא הריבית השנתית חלקי 12").** The evidence is two banks' published tables. The glossary entry "ריבית שנתית" says "בהלוואות מקובל לחלק אותה ב־12", and the video says flatly "ריבית של חוזה — מחלקים ב־12".
   - Fix the source text: "לוחות תשלומים שפרסמו שני בנקים (לאומי ודיסקונט) תאמו לחלוקה ב־12 עד האגורה, לפי בדיקת הצוות ב־ENG-223 (2026-10-04, 2026-10-08). לא נבדק בשאר הבנקים; ממתין למסמך של בנק."
   - Match the glossary: "בלוחות התשלומים של הבנקים שנבדקו מחלקים אותה ב־12".
   - Match the video cue: "בלוחות שנבדקו — מחלקים ב־12".

8. **חשוב — "נומינלית" points to the wrong lesson (MDX 156: `<Later lesson="0.8">ריבית נומינלית</Later>`).** The reader sees "(נגיע לזה בשיעור 0.8)" right after the divide-by-12 meaning. The next sentence says 0.8 teaches the other meaning, and so does 0.8 itself (line 138: "בשיעור הזה: נומינלית = לפני אינפלציה"). The course map puts the two-meanings lesson at 2.4.
   - 0.4 and 0.8 otherwise agree: 0.8 lines 137–139 and 407 point back to 0.4 correctly.
   - Fix: "...מכנים לפעמים ריבית נומינלית. בשיעור 0.8 תפגשו את אותה מילה במשמעות אחרת... ההבדל המלא — בשיעור 2.4." If check-terms allows it, set the `Later` to 2.4.

9. **חשוב — phone layout: the half-worked table (screenshot `phone_lessons_0-4_`, crop 5).** The "ריבית אפקטיבית" column is half off-screen. Its inputs are clipped, and the given first-row value shows as "4%".
   - The 12-month table in "ההסבר" also hides "חוב בסוף החודש", the column the next sentence quotes (10,616.79 ₪). "מזה: ריבית על ריבית" is cut.
   - Nothing on the page signals that the table scrolls sideways. See the cross-lesson item.

10. **חשוב — the converter text is wrong on phone (MDX 166: "בצד ימין: ... בצד שמאל: ...").** Below 640px the two cards stack.
    - Fix: "בכרטיס ״דרך 1״: מה קורה כשמחלקים ב־12. בכרטיס ״דרך 2״: מה קורה כשלוקחים שורש 12."

11. **קטן — the guided-task answer is not on screen (details, item 3: "ב־1% הריבית האפקטיבית היא 1.0046%").** The converter rounds the effective rate to 2 decimals, so both cards show "1%" and the learner never sees 1.0046.
    - Fix: "ב־1%: הריבית אחרי 12 חודשים היא 100.46 ₪ מול 100.00 ₪ — כמעט אותו דבר." (Both values are already shown in the cards.) Alternatively, show 4 decimals in the card.

12. **קטן — the prediction is ambiguous for the same reason as item 6 (MDX 43).** The question does not say the 6% is a contract rate, but the reveal note assumes it ("6% הוא המספר שכתוב בחוזה").
    - Fix: "...בריבית של 6% לשנה, כפי שכתוב בחוזה..."

13. **קטן — a number appears from nowhere (MDX 109: "בחישוב מדויק (נראה אותו בהמשך השיעור): ב־6.17%").** The learner can already get it from the table.
    - Fix: "616.79 ₪ מתוך 10,000 ₪ הם 6.17%."

14. **קטן — no actor in exercises 3, 5 and 6 (MDX 360, 400, 419).** AUTHORING requires an actor and a verb.
    - Exercise 3: "לקחתם הלוואה בריבית שנתית של 12%..."
    - Exercise 5: "ראיתם בפרסום ריבית אפקטיבית של 5% לשנה..."
    - Exercise 6: "קיבלתם שתי הצעות להלוואה..."

15. **קטן — "מכפילים בו 12 פעמים" (MDX 117; video: "מספר שבהכפלה 12 פעמים").** It is unclear what gets multiplied.
    - Fix: "מספר שאם מכפילים אותו בעצמו 12 פעמים..."

16. **קטן — general statement (MDX 63: "אבל הריבית לא מחכה לסוף השנה. היא מחושבת ומצטרפת לחוב כל חודש").**
    - Fix: "בהלוואה שלנו הריבית לא מחכה..."

17. **קטן — calculator help (MDX 231).** A phone calculator held upright has no xʸ or parentheses keys.
    - Add: "במחשבון של הטלפון — סובבו אותו לרוחב."

"בשיעור הבא" (0.5, ערך הזמן של כסף) matches the next lesson.

---

## Lesson 0.5 — ערך הזמן של כסף

1. **חשוב — letters renamed without saying so (formula, step 1, MDX 152: "מהשיעור על ריבית דריבית: סכום S של היום, אחרי n שנים, יהיה S × (1 + r)ⁿ. נקרא לסכום הזה F").** The reader remembers 0.3's `B = P × (1 + r)ⁿ`.
   - Fix: reuse 0.3's letters: "בשיעור 0.3 כתבנו B = P × (1 + r)ⁿ: P הסכום של היום, B הסכום בעתיד. הפעם יודעים את B ומחפשים את P: P = B ÷ (1 + r)ⁿ."
   - Alternatively, keep S and F but say explicitly that S is 0.3's P and F is 0.3's B.

2. **חשוב — the half-worked table has no rounding instruction** ("השלימו את הטבלה": "...השלימו את השאר (תצטרכו מחשבון)"). FillTable accepts the "מחלקים ב־" factor rounded (1.16 passes at ±0.005) but checks "שווה היום" to ±0.02 ₪; dividing by a rounded 1.16 gives 1,724.14 instead of 1,727.68 and is marked wrong with no explanation. Fix: "כתבו את המספר שמחלקים בו עם כל הספרות (למשל 1.1025), ואל תעגלו אותו לפני החלוקה."
3. **חשוב — phone layout**: the FillTable's "שווה היום" column was off-screen. *(Coordinator: FillTable fits 340px since f4efbe3.)*
4. **קטן — exercise 5's error message does not match its value** (`ex5.err_off` = 4,400, message "הורדתם 4% על כל שנה"): 4,400 is 12% off once; 4% off three times in a row is 4,423.68, which has no entry. Add 4,423.68 ("הורדתם 4% שלוש פעמים. מורידים — לא נכון; מחלקים ב־1.04 שלוש פעמים") and reword 4,400 to "הורדתם 12% (שלוש פעמים 4%)".
5. **קטן — exercise 3 repeats the explanation** (1,100 ₪ in a year at 10% → 1,000 ₪, printed in "אחורה בזמן") yet is labelled בינוני. Change the numbers (e.g. 1,650 → 1,500) or label it קל.
6. **קטן — "מחלקים את שני הצדדים"** (~158) is forgotten algebra → "כדי לבטל הכפלה ב־(1 + r)ⁿ, מחלקים בו."
7. **קטן — slogan** (~76 "כסף שכבר אצלכם, אצלכם.") → "מי שמחכה לכסף לוקח סיכון שהוא יגיע באיחור, חלקית, או בכלל לא."
8. **קטן — ambiguous summary line** ("וככל שהריבית גבוהה יותר — גם כן") → "וככל שהריבית גבוהה יותר, הוא שווה היום פחות."
9. **קטן — doubled later markers**: "נגיע לזה באינפלציה (נגיע לזה בשיעור 0.7)" → "נדבר על זה בשיעור על אינפלציה"; the "בשיעור הבא — 0.6" line → `<Later quiet>` (now available).
10. **קטן — the bills in the illustration** are empty boxes scaled by area, so 613.91 vs 1,000 look almost the same size. Print the amount inside each bill.

"בשיעור הבא" (0.6) matches the next lesson.

## Lesson 0.6 — ערך נוכחי

1. **חשוב — "בשיעור הבא" does not match 0.7** ("למה מחירים עולים, איך מודדים..."); 0.7 covers what is measured, who publishes and when. → "בשיעור הבא — 0.7, אינפלציה ומדד המחירים לצרכן: מה זו אינפלציה, איך מודדים אותה, מי מפרסם ומתי." Remove the two duplicated "(נגיע לזה בשיעור 0.7)" (use `quiet`).
2. **חשוב — which monthly rate is not stated** ("מתי הנוסחה נכונה?" item 3: "בתשלומים חודשיים משתמשים בריבית חודשית ובמספר חודשים (ראו שיעור 0.4)"). 0.4 teaches two monthly rates; for a loan it is the contract rate ÷ 12. → "...בהלוואה — הריבית השנתית שבחוזה חלקי 12 (שיעור 0.4)."
3. **חשוב — letters change again** (step 1, ~171 "תשלום C שמגיע בסוף שנה k שווה היום C ÷ (1 + r)ᵏ", "מהשיעור הקודם", but 0.5 wrote S = F ÷ (1 + r)ⁿ). Follow the AUTHORING letter table (P, B, r, n, C, k) and say: "זו הנוסחה מ־0.5, P = B ÷ (1 + r)ⁿ, כשהסכום העתידי הוא תשלום C והוא מגיע אחרי k שנים."
4. **חשוב — phone layout**: the worked example's step-1 table hid "שווה היום", so step 2's total (111,003.64 ₪) appeared from nowhere; the FillTable hid its inputs. *(Coordinator: FillTable fixed; wide tables now get a scroll hint. Still consider putting "שווה היום" early.)*
5. **קטן — undefined symbols**: "…" in the formula and the prediction reveal (0.11 defines it; 0.6 uses it first) — add a `<dt>…</dt>` row "ממשיכים באותה צורה, תשלום אחר תשלום, עד התשלום ה־n". The sources show `V = Σ Cₖ ÷ (1 + r)ᵏ`; Σ is never explained — use the box's form.
6. **קטן — a step never taught** (exercise 5's solution: "כלומר, ההלוואה נותנת לכם קצת יותר מ־6% לשנה") → "ככל שהריבית שבה מהוונים גבוהה יותר, הערך הנוכחי קטן. ב־6% יצא יותר מ־10,000, ולכן הריבית שבה הוא יוצא בדיוק 10,000 ₪ גבוהה מעט מ־6%."
7. **קטן — 0.5's common mistake has no error entry here**: taking percents off instead of dividing. Exercise 3: add 9,400 (5,000×0.96 + 5,000×0.92) and 9,408 (5,000×0.96 + 5,000×0.96²); exercise 4 the equivalents. Message: "הורדתם אחוזים במקום לחלק — ראו ״הטעות הנפוצה״ בשיעור 0.5."
8. **קטן — whose interest rate?** (exercises 3, 4 and the half table: "הריבית היא 4% לשנה") → "אפשר להפקיד כסף בריבית דריבית של 4% לשנה."
9. **קטן — misleading prediction option** ("קצת יותר מ־7,000 ₪" via floorThousands, for 7,721.73) → "בין 7,000 ל־8,000 ₪".
10. **קטן — exercise 2 is the explanation verbatim** (1,100 and 1,210 at 10% → 2,000). Acceptable for קל, but consider other numbers.

Difficulty order across 0.4–0.6 is honest overall, except 0.5 exercise 3 and 0.6 exercise 2.

## Cross-lesson issues

1. **חשוב — letters drift across the series** (r, m, R, P, S, F, C mean different things in different lessons; within 0.3 → 0.6 the money letters change every lesson: B/P, S/F, V/C). *Coordinator: resolved by the letter table in `course/AUTHORING.md` (f4efbe3); each lesson follows it and names the mapping when it reuses a formula.*
2. **חשוב — phone tables clip their key column, with no scroll cue.** *Coordinator: fixed in shared code (f4efbe3).*
3. **חשוב — the divide-by-12 vs twelfth-root convention**: 0.5 and 0.6 say only "ראו שיעור 0.4" without naming which rate applies to a loan (0.6-2); 0.12 uses a 1/5 power that depends on 0.4's fractional-power explanation (0.4-2); the claim itself needs narrowing to the banks checked (0.4-7).
4. **קטן — answer checking is inconsistent**: NumericExercise accepts within 1 ₪ as "נכון בקירוב", FillTable rejects beyond ±0.02 ₪ with no message — exactly where rounding an intermediate factor bites (0.5-2; same risk in 0.6's FillTable). Address with the rounding instruction in the table intro.
5. **קטן — doubled Later markers in "בשיעור הבא" lines.** *Coordinator: use `<Later quiet>`.*
6. **0.4 and 0.8 on "נומינלית"** — consistent in substance; the only defect is 0.4's Later pointing to 0.8 for the divide-by-12 meaning (0.4-8).
7. **No problems found** with sources marked as the wrong kind (beyond 0.4-7), real-bank branding in examples, desktop layout, or the subtitles vs the page (apart from the unhedged cue in 0.4-7).
