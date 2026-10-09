# Beginner-reader review: lessons 0.11 and 0.12

Date: 2026-10-09. Reviewer: a QA agent reading as a complete beginner; no files edited. Saved by the coordinator from the reviewer's delivered report (the reviewer's own write was cut off).

Read: dist text, both MDX files, both subtitle files, the video key frames, phone and desktop screenshots, data files, AUTHORING, the brief's reliability section, the research notes, lessons 0.4, 0.6, 0.8, 0.10 and the stage-0 check. Every displayed number was re-checked by hand; all correct except the rounding mismatch in 0.12 item 2.

## Lesson 0.11 — אג״ח ותשואה

1. **חשוב — the prediction never says the new bonds cost 100 ₪** (MDX ~55, and the explanation ~121). "אג״ח חדשות ודומות כבר נותנות 6 ₪ בשנה על כל 100 ₪" — price or principal? The step "new bonds sell at 100 and pay 6, so the market yield is now 6%" is never shown, and the reveal depends on it. Fix the question: "למחרת, אג״ח חדשות ודומות נמכרות ב־100 ₪ ומשלמות 6 ₪ בשנה." At ~121: "האג״ח החדשות נותנות 6 ₪ על כל 100 ₪ ששילמו עליהן — כלומר התשואה בשוק עכשיו 6%."
2. **חשוב — 4.76% appears without the division** (~80; also the table and video cue 5). "הרווח קטן: 5 ₪ על 105 ₪. התשואה: 4.76%". Add `<M>5 ÷ 105 = 0.0476</M>`, כלומר 4.76%; in the definition (~78) add "מחלקים את הרווח במחיר".
3. **חשוב — the definition of תשואה is wrong for bonds with several payments** (~78, five-questions ~492, summary ~506, glossary 0-11.json). "הרווח לשנה, באחוזים מהמחיר ששילמתם": for the 3-year bond at 97.33 ₪ the average profit is (15 + 2.67) ÷ 3 = 5.89 ₪ = 6.05% of the price, not 6%. The correct meaning appears only at ~162 ("התשואה היא הריבית שבה מהוונים אותם"). Fix after ~162: "באג״ח עם כמה תשלומים, התשואה היא הריבית שבה הערך הנוכחי של כל התשלומים שווה למחיר — לא הרווח הממוצע לשנה." Same wording in summary and glossary.
4. **חשוב — "מחירים" means two things.** Lines ~172, 175, 178 and exercise 4 use it for consumer prices; the lesson uses "המחיר" for the bond's price, and 0.12 "המחירים מגלמים" for bond prices. Fix: "כשהמחירים במשק עולים (אינפלציה)" / "כשהמדד עולה"; for real terms use "בכוח קנייה של היום" (AUTHORING), not "במחירים של היום" (~175, 177–178, exercise 5).
5. **חשוב — the worked example implies holding avoids a loss** (step 4 ~311, callout ~314). "תקבלו את כל מה שהובטח: ארבעה תשלומים, יחד 116 ₪" invites comparing 116 ₪ later with 93.07 ₪ today — the mistake 0.6 warns about. Add: "שימו לב: 116 ₪ לאורך 4 שנים ו־93.07 ₪ היום אינם בני השוואה. 93.07 ₪ הם בדיוק הערך הנוכחי של אותם תשלומים ב־6%. ההפסד האמיתי הוא שננעלתם על 4% כשהשוק נותן 6%." Show `<M>4 + 4 + 4 + 104 = 116</M>` (from facts). Add "(התשלום של השנה שעברה כבר התקבל ואינו נכלל כאן)".
6. **חשוב — "הקרן … הסכום שהלוויתם" (~117) is wrong when the price is not 100.** Fix: "ה־100 ₪ שמוחזרים בסוף הם הקרן של האג״ח — הסכום שהאג״ח מבטיחה להחזיר. הוא לא תמיד שווה למחיר ששילמתם." Optionally name "ערך נקוב" once.
7. **חשוב (reliability) — מק״מ stated as fact in the text** (~109, summary ~511, glossary), while marked לא אומת only in sources. Move it into the "השמות בשוק הישראלי" callout, or add "(לא אומת; ראו מקורות)".
8. **חשוב (layout, phone) — key columns off-screen** in the one-payment table, the 6% table, the worked-example table and the FillTable. *Coordinator: FillTable now fits 340px and wide tables get a scroll hint (commit f4efbe3); still keep the column the text discusses early, or merge "איך מהוונים" into the "ערך נוכחי" cell on phone.*
9. **קטן — last subtitle broken.** Cue 17 "בשיעור: ומה קורה כשהתשלומים צמודים למדד." → "בהמשך השיעור: מה קורה כשהתשלומים צמודים למדד."
10. **קטן — calculator note incomplete** (~348 "בתרגילים 6–7"): exercise 3 needs one too → "בתרגילים 3, 6 ו־7".
11. **קטן — difficulty order.** Exercise 5 (103 × 1.02, in the head) after exercise 3 (calculator); exercise 6 "מאתגר" is a two-term version of the half table. Swap 3 and 5; mark 6 בינוני.
12. **קטן — missing errors.** Exercise 6: 93.56 (forgot the year-2 payment: 3 ÷ 1.05 + 100 ÷ 1.05²) — "שכחתם שבשנה השנייה מגיעים גם 3 ₪ וגם 100 ₪." Exercise 5: 2.06 (only the increase).
13. **קטן — "מוכפל בשינוי של מדד"** (~177, exercise 5 solution): by 3% or 1.03? → "מוכפל ביחס בין המדד החדש למדד הבסיס (שיעור 0.8) — כאן 1.03".
14. **קטן — "התשלום השנתי באחוזים"** (~160, 207, 508): of what? → "התשלום השנתי כאחוז מהקרן".
15. **קטן — hint wording** (~338) "מחלקים ב־1.04 t פעמים" → "מחלקים ב־1.04, t פעמים".
16. **קטן — symbols renamed without saying so** (0.6's V and r became P and y). Follow the AUTHORING letter table (P = price, y = yield, C, F) and add one line: "זו הנוסחה מ־0.6, כשהערך הנוכחי הוא המחיר P והריבית היא התשואה y." The Σ in the sources code is never explained — remove it.
17. **קטן — nested parentheses** in five-questions (~495): "(משתנה צמודה (נגיע לזה בשיעור 2.7))" → "…ושל ריביות שמתעדכנות לפי תשואות של אג״ח, כמו <Later>משתנה צמודה</Later>." Also "תשואות… כבסיס להבנת ריבית קבועה" has no source entry.
18. **קטן — the next-lesson teaser over-claims** (~513 "הריביות שהשוק מצפה להן בעתיד"); 0.12 insists it is not an expectation. → "הריביות שהמחירים של היום מגלמים לעתיד".
19. **קטן — video price-vs-yield chart** (frame t106): the x-axis "(עולה מימין לשמאל)" is yield, not time; the y-axis has only the 100 ₪ tick. Add two or three price ticks.

## Lesson 0.12 — עקום התשואות

1. **חשוב — "התשואה לשנה" means both "the 1-year yield" and "yield per year"** (prediction, table header, exercises 4 and 7, guided task 2, the y₁ definition). For the length write "של אג״ח לשנה אחת" / "ל־1 שנה"; for the rate "4% בשנה". y₁: "התשואה השנתית של אג״ח לאורך t₁".
2. **חשוב — the worked example does not add up** (step 3 ~284): rows 4.85 + 4.62 + 90.70 = 100.17, the text says 100.18 and step 4's gap of 0.18 follows. Add a table-total fact (100.17) and write "בטבלה 100.17 ₪; בלי עיגול בדרך — 100.18 ₪", with a rounding callout like 0.11's.
3. **חשוב — 5.01% without its division** (~112). Show `<M>5.16 ÷ 103 = 5.01%</M>` (as a decimal then percent).
4. **חשוב — the general formula (with the root) has no worked number and no exercise.** Add the steps `1.0425^10 ÷ 1.0375^5 = 1.2613`, `1.2613^(1/5) = 1.0475`, 4.75% (facts), and one exercise on a segment longer than a year.
5. **חשוב — letters clash in the inflation formula** (~199 "π = (1 + n) ÷ (1 + r) − 1"; n is a count of years). Per the letter table: "π = (1 + i) ÷ (1 + r) − 1", plus "זו הנוסחה מ־0.8, כשפותרים אותה לאינפלציה". Same in summary and sources. Match 0.8's way of writing percent (× 100 or "כלומר").
6. **חשוב — forward rates the guided tasks ask for cannot be read from the chart** (YieldCurve.vue: 2%-step gridlines, no segment labels; numbers only behind "הצגה כטבלה"). Add "(את המספרים המדויקים תמצאו ב״הצגה כטבלה״ מתחת לגרף)" or label each segment. Slider labels "תשואה ל5 שנים" → "ל־5 שנים".
7. **חשוב (accuracy) — the zero curve presented as built from single-payment bonds** (glossary, ~97, five-questions). Fix: "עקום אפס הוא התשואה לכל אורך זמן כאילו הייתה אג״ח שמשלמת רק אז. במציאות מחשבים אותו ממחירי אג״ח רבות, גם כאלה עם כמה תשלומים. בעקום רגיל, התשואה של אג״ח עם כמה תשלומים מערבבת כמה מועדים, ולכן לא אומרת באיזו תשואה להוון תשלום של שנה מסוימת."
8. **חשוב — "מגלם" used before it is explained** (~45, the prediction, and 0.11 ~181). At first use: "מגלם — כלומר: מה שיוצא מהמחירים של היום, אם מניחים ששתי הדרכים שוות".
9. **חשוב — the inflation "gap" is a division, but called a gap** (~136, video cue 17; frame t147 shows 1.96% before it is explained). Text: "היחס ביניהם (מחושב בחילוק, לא בחיסור)". Cue (≤60 chars): "הפער, בחילוק ולא בחיסור: 1.96% לשנה." Line ~142 "4% − 2% = 2.00%" → "2%".
10. **חשוב — video "three shapes" frame (t120) misleads**: no axes or direction; "עקום יורד" climbs to the right. Add a "זמן ←" arrow and "תשואה ↑" under each panel, or mark "שנה 1" at the right end.
11. **חשוב — the term premium has three names** ("תוספת על אי־הוודאות", "תוספת על קשירת הכסף לזמן ארוך", "תוספת על זמן"). *Coordinator decision: "תוספת על זמן ארוך"* — define it once in the callout and use it everywhere (the stage-0 check already does).
12. **חשוב (layout, phone)** — as 0.11 item 8.
13. **חשוב (reliability) — regulatory claim unmarked in the text** (five-questions ~461 "הרגולטור… משתמש בעקומים כדי להעריך ריביות עתידיות"). The Brain says the comparison uses a specific Bank of Israel forecast workbook. Add "(לא אומת; בשיעור 5.4 נראה באיזה עקום בדיוק)".
14. **קטן — imprecise reference to 0.4** (~186). → "אותו רעיון כמו השורש ה־12 בשיעור 0.4, שהפך ריבית אפקטיבית שנתית לחודשית". Write the exponent as "1/(t₂ − t₁)". On phone the "− 1" wraps alone.
15. **קטן — tie the forward rate to its later name.** Step 1: "בשיעור 5.4 תפגשו לה גם את השם <Later lesson=\"5.4\">ריבית פורוורד</Later>."
16. **קטן — exercise wording.** Exercise 2: "…גבוהה מהתשואה לשנה אחת?" Exercise 7: "מה נכון לענות לו?"
17. **קטן — difficulty order.** Exercise 7 "מאתגר" is a conceptual choice repeating the prediction; the right option is recognisable by length. Mark קל/בינוני and move earlier; even out option lengths.
18. **קטן — missing errors.** Exercise 4: 0.0401 (decimal), 0.98 (forgot the square). Exercise 5: 0.0246, −2.4 (divided the wrong way). Exercise 3: 108.16 (multiplied instead of divided).
19. **קטן — rule of thumb skips a step** ("בערך 5%"): add "כי 3 + 5 = 2 × 4".
20. **קטן — subtitle cue 16** "ועקום של אחריה" → "ועקום של תשואות אחרי אינפלציה".
21. **קטן — a coupon bond's single yield vs the curve**: add "לאג״ח כזו עדיין יש תשואה אחת, כמו ב־0.11 — מעין ממוצע של תשואות העקום לפי מועדי התשלומים."
22. **חשוב — the ending does not lead to the stage-0 check** (~477): no link; the footer button skipped the check (*coordinator: fixed in the layout, f4efbe3*); `<Later lesson="1.1">עולם המשכנתא</Later>` attaches a stage name to a lesson number. Link the text to `/checks/0/` and write "את שלב 1, עולם המשכנתא, שמתחיל בשיעור 1.1" (with the title as a quiet Later). Optional: one line recalling stage 0's goal.

## Across both lessons

- **חשוב (reliability) — unlabelled teaching yields look like current Israeli market data** (0.11 exercise 4; 0.12 the inflation example and exercises 1, 3–7). One line above each exercise set: "כל התשואות בתרגילים הן מספרים להמחשה, לא נתוני שוק." In 0.12's inflation example write "נניח ש…".
- **קטן — gender of אג״ח**: feminine throughout (*coordinator: the stage-0 check is fixed*); glossary key "אג״ח ממשלתי" is the map's spelling — keep the key, write feminine in text.
- **Phone tables** — see 0.11 item 8.
- **Chart direction** — only the 0.12 three-shapes frame and 0.11's yield axis are hard to read.
- **Consistency with 0.6 and 0.8** — methods match; the gaps are the unannounced symbol changes and "בשקלים של היום" vs "במחירים של היום".
- **Checked and fine:** שחר/גליל, מק״מ and curve-publication claims marked לא אומת with dates, matching the research notes; no real market yields; 0.10's ending matches 0.11's start.
