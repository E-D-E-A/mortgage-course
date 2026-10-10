# Stage 2, second read: lessons 2.1 to 2.12 and the stage-2 check

Date: 2026-10-10. Reviewer: second-round QA, reading as one beginner who finished stages 0 and 1, from 2.1 to the check in order. I edited no lesson, component, data or research file; this report is the only file I wrote. It was written in parts, one lesson at a time.

**What I read:**
- the visible text of every built page (`dist/lessons/2-*/`, `dist/checks/2/`, built 09:52, after the last MDX change at 09:46 and the data rebuild at 09:52);
- the twelve MDX files and `src/pages/checks/2.mdx`, including exercise `errors`, FillTable configs and card data;
- the subtitles `public/video/2-1.he.vtt`, `2-9.he.vtt`, `2-11.he.vtt`;
- `data/lessons/2-*.json` and `check-2.json`, with an independent recomputation (below);
- the phone screenshots `qa/screens/phone_lessons_2-X_.png` (taken 09:51), cut into 900px strips, and the tables re-shot at 390px from the current `dist/` in Chromium (FillTable changed at 09:52, after the screenshots);
- `course/AUTHORING.md`, `research/eylon-list.md`, `src/components/big-picture/stage-2.ts`, the stage-2 glossary entries, the three first-round reports and `stage-1-second-read.md`; the summaries of stages 0 and 1.

**How the report is laid out.** Part A goes lesson by lesson: each section opens with the verification of the first-round items (fixed, or not, with the quote) and the numbers I recomputed, then lists what is new or left. Part B is series consistency, Part C reliability and causes that repeat across lessons, Part D anything else; the count and the verdict close it.

Severity: **חוסם** (a beginner learns something false, or cannot go on), **חשוב** (a beginner is likely to be confused or misled; fix before release), **קטן** (polish). Quotes are from the built page unless an MDX line is given.

---

## Part A: lesson by lesson

### 2.1 — ריבית בנק ישראל, פריים, עוגן ומרווח

**Verification.** Both first-round חשוב items are fixed: "the addition is identical" is now "נכון ל־9 באוקטובר 2026 … (לא אומת; מקור התוספת פתוח)", badged `לא אומת`, and exercise 1's answer carries the date; "compare by the spread" is now limited to "מסלול אחד שהעוגן שלו הוא הפריים", with "הצעה שלמה משווים בשלב 5" in the five questions and the summary. All קטן items are fixed too (actor in exercises 5 and 6, the `no_hundred` error, exercise 6 now בינוני, the video cue "אנשים פרטיים", the double brackets, the video now 2:59). Case A is gone from the lesson: the worked example is טל וגיל, "תרגיל נפרד, לא התיק של נועם ושירה", and the sources say case A "מקבל הצעות רק בשלב 6". The Mogi decision is marked with who and when in the body.

#### 2.1-a · קטן · exercise 5's solution says "היום" for a live figure
- **Where:** exercise 5, solution: "הפריים **היום**: 4.75%."; its error message: "זו הפריים **של היום**. הורידו ממנה את המרווח מהחוזה."
- **Problem:** AUTHORING: live data gets its date, "never היום". The question itself is careful ("נכון ל־9 באוקטובר 2026"); the solution, read weeks later, states it as today's prime.
- **Fix:** "הפריים נכון ל־9 באוקטובר 2026: 4.75%." and "זו הפריים נכון ל־9 באוקטובר 2026."

#### 2.1-b · קטן · the interactive's intro calls the addition "קבועה"
- **Where:** "שלוש השכבות" (the illustration): "התוספת של הפריים **קבועה**: 1.5 נקודות אחוז, נכון ל־9 באוקטובר 2026."
- **Problem:** the first round removed "תוספת קבועה" from exercise 1 because the lesson says the 1.5 is "כלל שנכון ל־9 באוקטובר 2026, לא כלל לתמיד". "קבועה" here means only that the widget has no slider for it, but a beginner reads it as the same claim.
- **Fix:** "במחוון התוספת של הפריים לא זזה: 1.5 נקודות אחוז, נכון ל־9 באוקטובר 2026."

### 2.2 — קבועה מול משתנה, ו״ריבית קבועה מול תשלום קבוע״

**Verification.** All three חשוב items are fixed: the 300 ₪ gap now "קטן קצת בכל חודש, כי החוב קטן"; exercise 5 prints eight places (0.94339623 + 0.88999644 = 1.83339267 → 10,908.74, which adds up); the check table now runs שנה · התשלום · חוב בתחילת השנה · סכום הריבית · חוב בסוף השנה, so the payment column is visible on the phone. The קטן items are fixed (the "קבוע מה?" column order, exercise 1's option, exercise 4's actor, "חוב בהתחלה"). I recomputed exercise 6 (10,291.26 × 1.08 = 11,114.56, interest 823.30) and the half table (239,000 / 1,195 / 2,195; 228,000 / 1,140 / 2,140; 120,000 / 600 / 1,600).

#### 2.2-a · קטן · the reordered table now hides the column the next sentence quotes
- **Where:** "דרך ב׳", the check table, phone strips 2.2-03 and 2.2-04: the last column "חוב בסוף השנה" is cut off ("‎…00 ₪", "חוב ב… השנה"). The sentence under it: "והחוב בסוף השנה השלישית **(בעמודה האחרונה)** הוא 0 ₪ בדיוק."
- **Problem:** the fix moved the problem from the payment column to the closing-balance column. The scroll hint is shown and the sentence names the column, so a reader can find it; it is no longer a trap, only a scroll.
- **Fix:** none needed if the hint is accepted. To keep both columns in view, drop "חוב בתחילת השנה" (it equals the previous row's closing balance) or shorten the headers to "התשלום · חוב בהתחלה · ריבית · חוב בסוף".

### 2.3 — צמוד מול לא צמוד

**Verification.** Both חשוב items are fixed: the prediction now says "ללוות", and the worked example shows "ההצמדה בשקלים: 406,000 − 400,000 = 6,000", adds 6,000 + 10,962, and says the 6,000 "לא משלמים השנה… מתווספים לחוב (צעד 5)" (same for 12,000 + 11,124). The קטן items are fixed: exercise 2 says "עם הריבית", exercise 5 is now 2.4% → 5.47 with an actor and labelled בינוני, the third formula is written without π. The spreadsheet formulas are now one per line (first-round X-5). I recomputed the inflation table, 1.94 / 0.97 / 2.04 / 1.95 / 5.47, exercise 6 (510,600) and the half table (209,000; 205,000 … 209,100 → the differences −4,000 / −1,950 / 100 / 2,150 are in the data and the FillTable).

#### 2.3-a · קטן · the half table's headers still run together on the phone
- **Where:** "השלימו את הטבלה", header row at 390px (re-shot from the current build): "**אינפלציהלא צמוד**".
- **Problem:** first-round item 2.2-7 asked for a gap after the period column in FillTable. 2.2 shortened its header, but the shared cause is still there, and in 2.3 two headers read as one word. The same tightness, milder, in 2.9 ("חודש ריבית החודש") and 2.11 ("שנה יתרה בהתחלה").
- **Fix:** in `FillTable.vue` (shared — report to the coordinator), give the period `<th>` the same end padding as the other headers (`pe-3` at every width, not only `sm:pe-3`), or add `ps-2` to every column header.

#### 2.3-b · קטן · "את כוח הקנייה שהלווה" can be read two ways
- **Where:** five questions, "למה זה קיים?": "המלווה מקבל בחזרה את כוח הקנייה **שהלווה**, ועליו ריבית."
- **Problem:** "שהלווה" is both "that he lent" (הִלְוָה) and "that the borrower…" (הַלֹּוֶה). The sentence is about who carries the risk, and the two readings name opposite sides.
- **Fix:** "המלווה מקבל בחזרה את כוח הקנייה של הכסף שנתן, ועליו ריבית."

### 2.4 — ״נומינלית״ — מילה אחת, שתי משמעויות

**Verification.** All three חשוב items are fixed: card 1 now reads "ריבית **נומינלית** של 6% לשנה"; the formula box writes axis 2 as "1 + i = (1 + e) × (1 + π)" and says "לציר 2 נכנסת e — האפקטיבית — ולא האחוז שבחוזה"; the Bank of Israel averages are narrowed to "הממוצעים שבנק ישראל מפרסם לחישוב התשלום כשמחזירים משכנתא לפני הזמן", with "(אוגוסט 2026, לא אומת)" in the sentence and under the table. Exercise 6's four options are now the same length. The CardSort piles are now questions, so the hint reads correctly (components report). I recomputed 6.17 / 3.92 / 5.12 / 3.04 / 5.10 / 2.01, the half table (0.5 / 6.17 / 4.09; 0.4 / 4.91 / 2.85; 0.3 / 3.66 / 1.63) and exercises 3–5 (0.35 / 2.43 / 6.25).

#### 2.4-a · קטן · the sources still print axis 2 with r, the formula the box just replaced
- **Where:** Sources, the first item (`ידע מתמטי כללי`), its code lines: "1 + i = (1 + r) × (1 + π)".
- **Problem:** the box above now uses e for exactly the reason the first round gave (r is the contract rate; the contract rate must not go into axis 2). A reader who checks the sources finds the old, misleading form.
- **Fix:** "1 + i = (1 + e) × (1 + π)".

#### 2.4-b · קטן · "5.1%" beside "5.12%", in a lesson that asks for two decimals
- **Where:** worked example, step 3: "(1 + 3.04%) × (1 + 2%) − 1 = **5.1%**"; step 4: "5.12% מול **5.1%**".
- **Problem:** the exercises say "בשתי ספרות אחרי הנקודה". The trailing zero is dropped by `f.plain`, so the two numbers being compared look as if they had different precision.
- **Fix:** format percentages in this lesson with two fixed decimals ("5.10%"), or write the fact as the string "5.10".

### 2.5 — מסלולים קבועים

**Verification.** The חשוב item is fixed well: the half table now says the method above it ("חשבו קודם את המדד — … בעיגול לשתי ספרות… אחר כך את התשלום, בנוסחה של צעד 2"), and the expected payments follow that method (104.04 → 3,462.02; 106.12 → 3,531.24; 108.24 → 3,601.78; I recomputed them). The קטן items are fixed: "כמו שראינו בשיעור 2.3"; exercise 6 has new numbers (481,852.60 × 1.06⁵ = 644,827.47, checked) and exercise 5 is בינוני; the "מתי משהו זז בגלל מספר מבחוץ" row. The cross-lesson items landed here too: the worked example is "דנה ויואב … תרגיל נפרד, לא התיק של נועם ושירה" (X-1); the February 2026 averages now say "לא בדקנו אם אלה אחוזים כמו שכתובים בחוזה או ריביות אפקטיביות (שיעור 2.4)" (X-2); the rounding callout "למה הלוח של בנק יכול להיבדל באגורות" (X-6).

#### 2.5-a · קטן · exercise 6's solution drops the agora digit
- **Where:** exercise 6, solution: "**481,852.6** × 1.06⁵ = 644,827.47"; the question says "481,852.60 ₪".
- **Problem:** the same amount in two formats, one line apart, in a lesson that just warned about agorot. The same cause as the first-round item on `n()` in 2.9 and 2.10 (here `f.plain` inside `<M>`).
- **Fix:** `f.shekels("ex6.plain_balance")` inside the `<M>`, or a two-decimal formatter for money in equations.

### 2.6 — מסלול הפריים

**Verification.** Fixed: the gender in the body, the headings and the component ("הפריים זזה, המרווח נשאר", "אילו הפריים נשארה 4.75%"); "4.75% … חשבון שלנו … (לא אומת)" instead of "נתון אמיתי"; the rule of thumb's reason (now "התשלום החדש מחזיר פחות מהחוב בכל חודש… ככל שנשארו יותר חודשים… העלייה קרובה יותר לכלל", which supports exercise 6); the prediction's answer ("ולכן גם התשלום (איך בדיוק — לפי החוזה)"); exercise 1's options; "הצמדה: אין… (לא אומת; לפי תעתיק…)"; "היום" and "נכונה נכון"; the button "להוסיף את המדד". The worked example is now רוני, "תרגיל נפרד, לא התיק של נועם ושירה" (X-1). I recomputed 3,715.41 / 493,887.20 / 1,749.18 / 2,160.76 / 3,970.25 / 370,042.52 / 362,699.75, רוני's 2,680.77 / 488,361.02 / 2,817.31 / 2,547.91, and exercises 4 and 5 (104.17, 3.8). The 2026 decision table matches 0.10 (4 / 3.75 / 3.5 / 3.25, dates 5 Jan, 25 May, 6 Jul, 1 Sep).

#### 2.6-a · חשוב · the first sentence restates the 1.5 as fixed, in the masculine
- **Where:** opening paragraph (MDX 43): "בשיעור 2.1 ראינו ש**הפריים הוא** ריבית בנק ישראל ועוד **תוספת קבועה**".
- **Problem:** this is the sentence that tells the learner what 2.1 taught, and it says the opposite: 2.1 now says the addition is "כלל שנכון ל־9 באוקטובר 2026, לא כלל לתמיד" and that its source is open; the first round removed "תוספת קבועה" from 2.1's exercise 1 for that reason (item 2.1-1, חשוב). It is also the one masculine "הפריים הוא" left in the lesson the first round fixed for gender (2.6-1).
- **Fix:** "בשיעור 2.1 ראינו ש<Term>הפריים</Term> היא <Term>ריבית בנק ישראל</Term> ועוד תוספת (1.5 נקודות אחוז, נכון ל־9 באוקטובר 2026, לא אומת), ושמסלול נקבע לפי…".

#### 2.6-b · קטן · "493,887.2" beside "493,887.20"
- **Where:** explanation step 4: "לפני: **493,887.2** × 4.25% ÷ 12 = 1,749.18 ₪"; the same in "אחרי", in "מהדוגמה לנוסחה" step 3, while step 3 above and the rule of thumb say "493,887.20 ₪".
- **Problem and fix:** as 2.5-a (one cause, see part C).

### 2.7 — משתנה צמודה ולא צמודה

**Verification.** Both חשוב items are fixed. The linked example now shows the original-schedule payment ("2,835.98 ₪ (תוצאה מוכנה)"), states the even-index assumption in the body ("המדד עולה 2% בשנה, באופן אחיד — קצת בכל חודש"), shows the indexed balance at the update point (403,601.09 × 1.02⁵ = 445,608.22) and splits the jump ("3,240.56 − 3,131.15 = 109.41 ₪ יותר — החלק שאחוז הריבית החדש הוסיף"; correct, since the old rate on the indexed balance gives back exactly 3,131.15). The exercises now practise `I = B × m` (5), the spread mistake (7), the exit station (8) and the linked payment between points (6). The קטן items are fixed (the prediction's "בעוד 36 חודשים", "נמוכה מהתשואה של אג״ח לא צמודות", the linked/unlinked split in "מה לקחת מזה", "בנקודת אחוז אחת, מ־3.5% ל־4.5%"). I recomputed every amount (3,217.48 / 415,022.58 / 1,625.51 / 1,971.36 / 3,435.29; 2,835.98 / 2,892.70 / 3,131.15 / 445,608.22 / 3,240.56; 2,268.98 / 352,602.15 / 2,465.51 / 2,081.37) and the half table (3.75 / 3.05 / 3.5).

#### 2.7-a · קטן · both מאתגר items are lookups of something just shown
- **Where:** exercise 8 (מאתגר), "מתי ואיך?" — the right option repeats the callout "שלושה דברים לזכור כבר עכשיו" word for word (a specific day, 10–45 days' notice, none in a fixed track). Exercise 9 (מאתגר): every 30 months, 40 months passed → "60 − 40 = 20"; guided task 3 is every 60 months, month 38 → "בחודש 60, בעוד 22 חודשים".
- **Problem:** honest difficulty. Exercise 9 is task 3 with the period and "today" moved, landing on the same month 60. The hardest item in the set is now exercise 6 (בינוני), which needs the linked/unlinked distinction.
- **Fix:** exercise 8 → בינוני. Make exercise 9 land elsewhere and need a step, for example "30 שנה, כל 2.5 שנים; עברו 95 חודשים. מתי הנקודה הבאה, וכמה נקודות נשארו?" (next at 120, in 25 months; 8 more points: 120…330), as facts.

#### 2.7-b · קטן · "נתון אמיתי" over an unverified figure
- **Where:** "נתון אמיתי, לדוגמה. לפי נתוני בנק ישראל כפי שתועדו בצוות… (לא אומת מול המקור)"; and the callout "נתונים אמיתיים מסומנים בתאריך."
- **Problem:** the first round (2.6-2) had "נתון אמיתי" removed from 2.6 because an unverified number should not be called real. 2.7 kept the phrase, so the two lessons label the same kind of figure differently.
- **Fix:** "נתון מהשוק, לדוגמה (לא אומת)…" and "נתונים מהשוק מסומנים בתאריך ובמילים ״לא אומת״."

#### 2.7-c · קטן · "2,892.7 ₪"
- **Where:** linked example, step 2: "2,835.98 × 1.02 = **2,892.7** ₪".
- **Problem and fix:** as 2.5-a (part C).

### 2.8 — מסלולי זכאות ומסלולים מיוחדים

**Verification.** The חשוב item is fixed: a callout "שימו לב — ״באיזה מובן?״" now says the rule is applied to an effective average, that whether the result is a contract rate is not checked ("השאלה ברשימה לאילון"), and that the lesson computes no payments from it; the question is on `eylon-list.md`. The קטן items are fixed: the % inside `<M>`, "התקרה של 75% לדירה יחידה (שיעורים 1.2 ו־1.5)", the table's column order (השם · מה יכול לזוז · מסלול במשכנתא? · מי קובע), exercise 4's error ("ההנחה היא 20% מהמחיר: 270,000 ₪"). E50 is now stated as a Mogi decision ("אילון אישר אותה ב־2026-10-07, ועדן קיבל אותה ב־2026-10-08"), without "ממתין", which matches the list's new section "החלטות של Mogi… לידיעה, לא ממתינות". I recomputed every number (2.7 / 3 / 2.9 / 3; 240,000 / 960,000; 300,000 / 1,700,000; 390,000 / 360,000; 75 / 10 / 82.5; the half table 200,000 / 300,000 / 300,000; exercises 1,080,000 / 1,900,000 / 444,000).

#### 2.8-a · קטן · repository paths are still shown to learners here
- **Where:** Sources, "לא אומת" item on the questionnaires: "(ריפו edea-mortgage, context/inputs, נקרא 2026-10-09)"; "החלטה של Mogi" item on track types: "מתוך הרישום packages/schemas/registry/v1.yaml בריפו edea-mortgage".
- **Problem:** first-round X-4 was fixed in 2.4–2.6 ("רישום השדות של אפליקציית היועץ של Mogi, גרסה 1"), not here. AUTHORING puts code paths in an MDX comment.
- **Fix:** "לפי תעתיק של הצוות לשאלונים של הבנקים, נקרא 2026-10-09" and "רישום השדות של אפליקציית היועץ של Mogi, גרסה 1"; the paths into the closing MDX comment.

### 2.9 — שפיצר וקרן שווה: האינטואיציה

**Verification.** All first-round items are fixed: the doubled "שיעור 3.1" note, "200.50 ₪" and "100.50 ₪" with agorot, the formula box (`text-body-l sm:text-h3`, so it no longer wraps on the phone), and the summary's condition on equal principal ("כל עוד אחוז הריבית לא זז ואין הצמדה"). The cross-lesson item on "cheaper" is answered: after the worked example, "ומה ״זול יותר״ באמת? ״פחות שקלים של ריבית״ זה לא בדיוק ״זול יותר״. בערך נוכחי… כל לוח סילוקין… שווה בדיוק 400,000 ₪", and the summary repeats it. I rebuilt every schedule with the statement convention (interest rounded monthly, the Spitzer payment rounded once, the last month closing): 20,200.33 / 40,099.67 / 20,099.84 / 20,200.34; 3,893.74 / 3,895.68 / 334,499.54 / 289,200 / 370,513.81 / month 102 / 3,147.99 / 533,278.18; 3,247.15 / 184,486.00 / 162,900 / 239,867.71; the half table and exercises 1,000 / 1,600 / 1,300 / 570.22 / 390. All match to the agora.

#### 2.9-a · קטן · the video still ends on "a different price"
- **Where:** subtitles, the last two cues: "‏אותו אחוז ריבית. שני שבילים, **ומחיר שונה**." / "‏תשלום נמוך בהתחלה אינו עלות נמוכה."
- **Problem:** the page now says "״פחות שקלים של ריבית״ זה לא בדיוק ״זול יותר״", and that in present value both schedules equal the loan. The video (not re-rendered since yesterday 16:54) still tells the learner, before they read the page, that Spitzer has a higher price.
- **Fix:** "‏אותו אחוז ריבית. שני שבילים, וסכום ריבית שונה." (fits 60 characters); the last cue can stay ("עלות" is qualified on the page), or become "‏תשלום נמוך בהתחלה אינו ריבית נמוכה בסך הכול."

#### 2.9-b · קטן · the "what is really cheaper" sentence points to 5.6, not 3.11
- **Where:** "מה באמת עולה פחות תלוי גם במה שהכסף הזה יכול להרוויח אצלכם בינתיים — שאלה ליעדי התמהיל (נגיע לזה בשיעור 5.6)."
- **Problem:** the course map gives the comparison itself to 3.11, "למה סך תשלומים, ערך נוכחי ו־IRR הם שלושה מדדים שונים" ("שני לוחות, שלושה מדדים"). 5.6 is about the mix's goals. A learner who wants the answer to this paragraph will look in the wrong stage.
- **Fix:** "…— נשווה את זה במספרים בשיעור 3.11 (סך תשלומים, ערך נוכחי ו־IRR)", with `<Later lesson="3.11">`.

### 2.10 — גרייס, בלון ובולט

**Verification.** All first-round items are fixed: exercise 5 now asks for the 24-month gap between full and partial grace after the grace (4,571.33 − 4,153.69 = 417.64), which nothing on the page prints; exercise 6 has new inputs (80,000 ₪, 4.8%, 24 months: 88,043.88 with monthly rounding, 88,043.86 by the 0.3 formula, the difference explained; 363.88); the contractor clause is explained ("הקבלן שמוכר את הדירה משלם לבנק חלק מהריבית במקום הקונה"); "השמות לא תמיד משמשים באותו מובן… בודקים בחוזה", with the question on the Eylon list; "359,496.80" with agorot. The present-value line is mirrored here ("בערך נוכחי… כל שלוש העמודות בטבלה שוות בדיוק לסכום ההלוואה"). FK-H-053 is marked in the body and the sources, pending Eylon, and listed. I rebuilt every schedule (grace 0 / 12 / 24 / 36, partial and full; 100,000 ₪ × 12 months; יעל ותומר's 2,864.98 / 2,927.11 / 3,070.74 / 359,496.80 / 367,005.29 / 384,372.51 / 524,535.10; the half table 250 / 251.25 / 252.51). All match to the agora.

#### 2.10-a · קטן · the same 5.6 pointer as 2.9
- **Where:** "מה באמת עולה לכם יותר תלוי גם במה שהכסף שלא שילמתם יכול להרוויח בינתיים — שאלה ליעדי התמהיל (נגיע לזה בשיעור 5.6)."
- **Fix:** as 2.9-b: point to 3.11.

### 2.11 — אותה יתרת חוב: ריבית מול הצמדה, כל אחד בנפרד

**Verification.** The חשוב item is fixed: exercise 6 no longer repeats 2.3's break-even; it now asks for the smallest payment that keeps the balance from growing (16,000 + 12,480 = 28,480), which needs the lesson's own decomposition. The formula box is split on purpose ("B = P + P × π + P × r" / "+ P × π × r − C") and no longer wraps. "הפריים עלתה" is feminine in the body, the exercise and the subtitles. The five questions now end "ריבית פועלת על כל חוב. כשבוחרים מסלול, בודקים מה בו יכול להשתנות: אחוז הריבית, ההצמדה, שניהם, או אף אחד מהם", which is the bridge 2.12 picks up (part B). I recomputed 25,000 / 495,000 / 30,000 / 500,000; 510,000 / 15,300 / 300 / 495,300 / 485,000 / 10,300 / 515,900; אורי ומיכל's 294,000 / 307,500 / 9,225 / 292,725 / 7,725; the half table (1,941.20 / 2,970.04 / 93,971.24; 1,879.42 / 2,875.52 / 90,726.18); exercises 288,000 / 8,240 / 2,580 / 5,150 / 28,480.

#### 2.11-a · קטן · a run-on sentence states the course's assumption as how banks work
- **Where:** step 2, the note under the "if you paid 30,000 again" line: "בהלוואה אמיתית התשלום לא נשאר אותו דבר כשהריבית במסלול משתנה, הבנק מחשב מחדש גם את התשלום, כך שההלוואה עדיין תיגמר בזמן."
- **Problem:** two sentences joined by a comma, so the first clause reads "the payment does not stay the same when the rate changes" and the second arrives without a connector. And "כך שההלוואה עדיין תיגמר בזמן" is what 2.6 and 2.12 call "הנחה של הקורס; בודקים בחוזה"; here it is a fact about every real loan.
- **Fix:** "בהלוואה אמיתית התשלום לא נשאר אותו דבר: כשהריבית במסלול משתנה, הבנק מחשב מחדש גם את התשלום (בקורס מניחים שסוף ההלוואה לא זז; בודקים בחוזה)."

### 2.12 — סיכום: טבלת המסלולים

**Verification.** Both חשוב items are fixed. The eligibility row now says the rate "נקבע לפי כלל של המדינה, לא במשא ומתן עם הבנק", the contract cell lists 2.8's checks (certificate amount and validity, fixed and linked, prepayment "לפי המקורות של שיעור 2.8, כלום"), and the principal cell says "בתוך התמהיל ובתוך התקרה… לא תוספת מעליה"; the map card `track_eligibility` follows. The risk situations are unambiguous ("עברו חמש שנים מיום ההלוואה…", "אחוז הריבית נקבע לכל התקופה, ולא זז"). The קטן items are fixed: "בכוח קנייה של היום", "(הנחה של הקורס; בודקים בחוזה)" in the prime and variable payment cells, the early-exit cost in קבועה צמודה's risk, "חוץ מהתוספת של 1.5 נקודות לפריים", and a line for "אחר" and מט״ח. The components: TrackOrder now says "גבוה מדי / נמוך מדי", the map marks "הסיכון בכל מסלול" as new in 2.12, the TrackOverTime table is three columns. I recomputed the worked example (4,000 / 12,000 / 412,000 / 360 / 12,360) and exercises 1,500 / 10,000 / 260,000; the two sorts' answers agree with the table's rows; exercise 6's answer ("אף אחד מהם") is right, since no update point came.

No new item in 2.12.

### The stage-2 check (`/checks/2/`)

**What I checked.** All 21 answers against `check-2.json` and by hand: 0.5 / 75 / 21,000 / 3.7 / 3,060 / 1.94 / 4.75 / 1,600 / 1,000 / 96,080, and every error value (4.5, 5.3, 2.2, 3,000, 5,000, 2, 4.5, 5.25, 1,000, 600, 1,332.25, 0, 94,000, 106,080). All right. Each of 2.1–2.12 has at least one question; three questions go back to 0.4, 1.2 and 1.9, as the intro says. Every explanation agrees with the lesson it cites (the 1.5 is "נניח", the eligibility rules and the 1.5 are flagged as unverified in the intro, הפריים is feminine).

#### C-1 · חשוב · in every multiple-choice question the right answer is the first option, and usually the longest
- **Where:** all eleven choice questions (שאלות 5, 6, 9, 10, 12, 13, 14, 16, 18, 20, 21). `StageCheck.vue` renders `options` in source order and does not shuffle. In nine of the eleven the right option is also the longest (for example שאלה 12: "אחוז הריבית קבוע בין נקודות העדכון; בכל נקודה הוא נקבע מחדש לפי העוגן ועוד מרווח קבוע" against "ההלוואה נמשכת 5 שנים").
- **Problem:** the check is the gate to stage 3 (80%, 17 of 21). A learner who notices the pattern gets 11 points without reading, and needs 6 of the 10 numeric questions, several of which are answers they have already seen (C-2). The lessons' own exercises vary the position; only the checks do not. The same pattern is in checks 0 and 1 (every correct option is at index 0), so it is a course-wide cause.
- **Fix:** shuffle the options in `StageCheck.vue` (shared component — report it), with a seed per attempt so "נסו שוב" reorders; or reorder the data in all three checks. Trim the right options to the length of the others (שאלה 5: "המרווח מהפריים"; שאלה 12: "אחוז הריבית קבוע בין נקודות העדכון").

#### C-2 · חשוב · four numeric questions are answers the learner has already been given
- **Where and what:**
  - שאלה 15 (120,000 ₪, 120 months, 6%, equal principal, first month → 1,600) is 2.9's exercise 3, word for word, with the same answer.
  - שאלה 8 (5% against 3% → 1.94) is 2.3's prediction, explanation, interactive default and summary, and 2.4 asks "למה לא 1.94%".
  - שאלה 7 (100,000 ₪, 3%, index +2% → 3,060) is 2.3's explanation step ("102,000 × 3% = 3,060").
  - שאלה 4 (Bank of Israel 3%, P−0.8 → 3.7) is 2.1's worked example step 4 and the answer to 2.1's prediction (3.95 → 3.7).
- **Problem:** with C-1, a learner can pass on memory. The stage-1 second read asked for the same thing in 1.10 (R3: an exercise whose answer "2" was a worked example's).
- **Fix:** new inputs, as facts: שאלה 15: 90,000 ₪ ל־60 חודשים ב־4.8% (1,500 + 360 = 1,860); שאלה 8: 4.6% מול 2.8% (1.75%); שאלה 7: 250,000 ₪, 2.5%, מדד +3% (6,437.50); שאלה 4: ריבית בנק ישראל 3.5%, P−0.65 (4.35).

#### C-3 · קטן · two wording slips in the check
- **שאלה 12**, option: "ההלוואה **נמשכת** 5 שנים" — AUTHORING lists "נמשכת" as ambiguous (withdrawn / continues). Fix: "אורך ההלוואה 5 שנים".
- **שאלה 13**, explanation: "בכל נקודת עדכון אפשר לצאת מהמסלול בעלות נמוכה, בהודעה מראש. במסלול קבוע אין תחנות כאלה." — 2.7 marks the exit-station rules "(לא אומת)", and the check's intro lists only "התוספת של הפריים, תנאי הלוואת הזכאות" as unverified. Fix: add "(לפי תעתיק של צו הבנקאות, לא אומת)" to the explanation, or add "תחנות היציאה" to the intro's list.

---

## Part B: series consistency, end to end

| Thread | Where | Holds? |
|---|---|---|
| Prime's layers and the 1.5 (dated, unverified, source open) | 0.10 → 2.1 (body, video, formula box, sources) → 2.2 → 2.6 (callout, formula box) → 2.12 (table cell and sources) → check (intro, "נניח") | Yes in the bodies, **except 2.6's first sentence (2.6-a), the map card and the glossary (B-1)**. |
| הפריים is feminine | 2.1, 2.2, 2.6 body and component, 2.11 body and subtitles, 2.12, the check | Yes, **except 2.6's first sentence and the glossary entries "פריים" and "עוגן" (B-1)**. |
| "Fixed rate ≠ fixed payment" | 1.3 → 2.2 (four ways, the "קבוע מה?" table, the three questions) → 2.5 ("קבוע במה?") → 2.9 ("״שווה״ — בתנאי") → 2.12 (summary, exercise 2) → check שאלות 6 and 10 | Yes. Same three conditions everywhere. |
| Real vs nominal | 0.4, 0.8 → 2.3 ("האחוז בצמוד הוא ריבית ריאלית") → 2.4 (two axes, four corners) → 2.8 (the "באיזה מובן?" callout) → check שאלה 9 | Yes. Letters i, r, e, m, π agree; 2.4's sources still print the old axis-2 formula (2.4-a). |
| Track definitions 2.5–2.8 vs 2.12 vs the map | six tracks: what is fixed, what moves, when, principal, payment, contract | Yes. The eligibility row and card now match 2.8. The map's prime-track card states the course's recalculation assumption as fact (B-3). |
| "Two forces" | 2.10's next-lesson line ("הריבית והמדד") → 2.11 (interest and indexation; ends "ריבית פועלת על כל חוב… מה בו יכול להשתנות") → 2.12 opening ("ריבית פועלת על כל חוב. מה שמבדיל… שני דברים שיכולים להשתנות: אחוז הריבית, והמדד"), the sort "כמה דברים יכולים לזוז", the map card `track_risk` | Yes now. "כוחות" is used only for interest and indexation, and the 2.12 sorts count "דברים שיכולים לזוז". |
| "Fewer shekels of interest" and present value | 2.9 (after the worked example, and the summary) → 2.10 ("הכלל") → map `equal_principal` ("פחות ריבית") → check שאלה 16 ("יותר ריבית בסך הכול") | Yes on the page. The 2.9 video still says "מחיר שונה" (2.9-a); both lessons point to 5.6 instead of 3.11 (2.9-b). |
| Monthly rate = annual ÷ 12 | every lesson and the check; 2.8 leaves the eligibility rule's corner open | Yes. The source of the convention is cited three ways (B-4). |
| Case A only with its stage-1 numbers | stage 2 | Yes: case A no longer appears in any lesson, video, exercise or the check; every worked example is a named fictitious client, "תרגיל נפרד, לא התיק של נועם ושירה". |
| "בשיעור הבא" lines | 2.1 → 2.11 | Yes: each uses the map's exact title; 2.12 leads to the stage-2 check. |
| Repeated examples and answers | lessons and the check | Inside lessons, only 2.7's exercise 9 (2.7-a). The check repeats four answers (C-2). |
| Honest difficulty | all exercise sets | Yes, except 2.7's two מאתגר items (2.7-a) and the check's option order (C-1). |
| The check's 21 questions vs the lessons | | Every explanation agrees with its lesson; see C-1 to C-3, and B-2 for שאלה 16. |

#### B-1 · חשוב · the map card and the glossary still teach "a fixed addition" and a masculine הפריים
- **Where:**
  - map card "פריים" (`stage-2.ts`, `what`): "היא ריבית בנק ישראל ועוד **תוספת קבועה**, ולכן זזה בכל פעם…"; its note: "גובה התוספת — לפי תקציר של מקור רשמי, לא אומת." (no date, nothing on the open source);
  - glossary "פריים" (`definitions/2-1.json`, shown as a popover on every `<Term t="פריים">` in 2.1–2.12): "…ולכן **הפריים זז** יחד עם ריבית בנק ישראל. … פריים פחות 0.8 **נקודות אחוז**";
  - glossary "עוגן": "**הפריים הוא** עוגן אחד".
- **Problem:** these are the course's two long-lived objects; the map shows this card in every later stage, and the popover appears each time the word is tapped. Both say what 2.1 now refuses to say ("תוספת קבועה" against "כלל שנכון ל־9 באוקטובר 2026, לא כלל לתמיד"), and both break the house gender rule that the lessons now follow. "0.8 נקודות אחוז" breaks the singular rule. The first round listed the glossary entry (item 4 of its cross-lesson list); it is unchanged.
- **Fix:** card: "היא ריבית בנק ישראל ועוד תוספת (1.5 נקודות אחוז, נכון ל־9 באוקטובר 2026), ולכן זזה…"; note: "שיעור 2.1. התוספת ומקורה — לפי תקציר של מקור רשמי, לא אומת; נכון ל־9 באוקטובר 2026." Glossary: "ולכן הפריים זזה…", "פריים פחות 0.8 נקודת אחוז", "הפריים היא עוגן אחד".

#### B-2 · קטן · "at first most of the Spitzer payment is interest" is stated without its condition
- **Where:** 2.9 summary: "שפיצר: … בהתחלה רובו ריבית, בסוף רובו קרן."; map card `spitzer`: "בהתחלה רוב התשלום הולך לריבית"; check שאלה 16, explanation: "בשפיצר רוב התשלום בהתחלה הוא ריבית".
- **Problem:** true for a long loan, false for 2.9's own first example: the first Spitzer payment of the 60,000 ₪, three-month loan is 20,200.33 ₪, of which 300 ₪ is interest. A learner who has just built that table reads the summary as contradicting it. In 2.9's exercise 5 (200,000 ₪, 3.6%, 20 years) interest is 600 of 1,170.22 — barely half.
- **Fix:** "בהלוואה ארוכה, בהתחלה רוב התשלום הוא ריבית…" in all three places; in שאלה 16: "בשפיצר, בהתחלה חלק קטן יותר מהתשלום מחזיר קרן, ולכן היתרה יורדת לאט…".

#### B-3 · קטן · the map's prime-track card states the course's assumption as fact
- **Where:** `track_prime` role (`stage-2.ts`): "בכל פעם שבנק ישראל משנה את הריבית שלו, הריבית במסלול זזה, **והתשלום מחושב מחדש**."
- **Problem:** 2.6, 2.7 and 2.12 now label the recalculation "הנחה של הקורס; בודקים בחוזה"; the map card, which outlives the lessons, does not.
- **Fix:** `track_prime`: "…הריבית במסלול זזה, ואיתה התשלום (בקורס מניחים שהוא מחושב מחדש; בודקים בחוזה)."

#### B-4 · קטן · the ÷ 12 convention is sourced three ways
- **Where:** 2.1 and 2.2 sources: "(שיעור 0.4; Brain ENG-223)"; 2.4: "(Linear ENG-223, 2026-10-04)"; 2.9: "(Linear ENG-223, 2026-10-05)".
- **Problem:** one check, two systems, two dates. A reader who looks for the evidence does not know where it is.
- **Fix:** one wording in all four: "לפי בדיקה של הצוות מול לוחות ששני בנקים פרסמו (Linear ENG-223, 2026-10-05; לא נבדק מול מקור רשמי)", with the right date.

---

## Part C: reliability, and causes that repeat

**What holds.**
- **Official facts are unverified and dated.** Every official figure in the lessons and the check carries "(לא אומת)" and a date in the sentence: the Bank of Israel rate and decisions, the 1.5, the February 2026 averages, the third-for-fixed rule, the 2020 cancellation, the prepayment order, the eligibility rule and its 2023 amounts, the target-price discount, the 2025 bullet circular, the 451 forecast table. 2.8 opens with a callout saying none of its official rules was read from the source.
- **FK-H-053** is in 2.10's body and sources as field knowledge, single source, "ממתין לאישור אילון", and on `research/eylon-list.md` under 2.10.
- **DEC-3 and E50** are badged "החלטה של Mogi" with Eylon's 2026-10-07 approval and Eden's 2026-10-08 acceptance, and nowhere wait for Eylon; the list now has a separate section "החלטות של Mogi… לידיעה, לא ממתינות". The two open questions the lessons raise (the eligibility rule's corner, בלון/בוליט) are on the list.
- **No real bank names** in any lesson, subtitle, map card, data file or the check ("בנק אחד", "בנק אחר").
- **Teaching numbers are labelled** above every exercise set and in every worked example ("מספרים להמחשה, לא נתוני שוק").

#### X-1 · קטן · money loses its agora digit inside equations (one cause, four lessons)
- **Where:** 2.5 exercise 6 "481,852.6 × 1.06⁵"; 2.6 step 4 and the formula section "493,887.2 × 4.25% ÷ 12"; 2.7 linked step 2 "2,835.98 × 1.02 = 2,892.7 ₪"; 2.4 step 3 "= 5.1%" (a rate, same cause).
- **Problem:** `f.plain` and the lessons' `n()` drop a trailing zero; the same amount appears with agorot a line away. The first round fixed this in 2.9 and 2.10 only.
- **Fix:** a money formatter with two fixed decimals when the value is not whole (`f.shekels` without the ₪ inside `<M>`), used for every amount in an equation.

#### X-2 · קטן · repository paths are still shown in three lessons' sources
- **Where:** 2.8 (twice: "ריפו edea-mortgage, context/inputs"; "packages/schemas/registry/v1.yaml בריפו edea-mortgage"), 2.9 and 2.10 ("מתוך הרישום packages/schemas/registry/v1.yaml בריפו edea-mortgage").
- **Problem and fix:** as 2.8-a: "רישום השדות של אפליקציית היועץ של Mogi, גרסה 1"; the paths into the closing MDX comment.

#### X-3 · קטן · some Mogi decisions in the body lack who and when
- **Where:** 2.2 "**מה Mogi מציגה.** לפי החלטה של Mogi, ליד תשלום…"; 2.3 "לפי החלטה של Mogi, כשהמנוע יחשב תשלומים עתידיים… (לא אומת; ראו מקורות)"; 2.10 "החלטה של Mogi: כברירת מחדל הגרייס נמצא בתוך התקופה." Compare 2.1, 2.7 and 2.8, which say "(אילון אישר ב־2026-10-07, ועדן קיבל ב־2026-10-08)" in the sentence.
- **Problem:** AUTHORING: Mogi decisions are marked "with who and when". The sources have it, the sentence does not. In 2.3 "(לא אומת)" sits on the decision itself, so it reads as if the decision were unconfirmed; what is unverified is the Bank of Israel forecast it relies on.
- **Fix:** add "(החלטה של Mogi: אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08)" in the three places; in 2.3 move "(לא אומת)" to "בתחזית שבנק ישראל מפרסם… (לא אומת)".

#### X-4 · קטן · the Eylon list does not show every lesson that uses DEC-3
- **Where:** `research/eylon-list.md`, DEC-3 row, "איפה בקורס": "2.1, 2.2, 2.3, 2.5, 2.6, 2.7".
- **Problem:** 2.9 (the payment shown by repayment method), 2.10 (grace inside the term; the payment used in the income check) and 2.12 (the five-year assumption, the eligibility simulation) also cite Brain 67436545. The list is "for Eylon to see where the course uses them".
- **Fix:** "2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.9, 2.10, 2.12".

---

## Part D: anything else a beginner would stumble on

Nothing beyond the items above. I read the stage as a beginner, in order, and the line of the stage now holds: three layers of a rate (2.1) → what "fixed" fixes (2.2) → what a linked rate measures (2.3) → which "nominal" (2.4) → five tracks, each by the same five questions (2.5–2.7) → what is outside them (2.8) → two repayment paths and what "cheaper" means (2.9) → deferring (2.10) → the two forces on a balance (2.11) → one table (2.12). Every number on the twelve pages and in the check recomputes; every amortisation table matches the statement convention to the agora; the tables I re-shot at 390px from the current build (the FillTables and reading tables of 2.2, 2.3, 2.5, 2.6, 2.9, 2.10, 2.11) read correctly apart from 2.2-a and 2.3-a.

---

## Count

| Severity | Items |
|---|---|
| חוסם | 0 |
| חשוב | 4 — 2.6-a, B-1, C-1, C-2 |
| קטן | 21 — 2.1-a, 2.1-b, 2.2-a, 2.3-a, 2.3-b, 2.4-a, 2.4-b, 2.7-a, 2.7-b, 2.9-a, 2.9-b, 2.10-a, 2.11-a, C-3, B-2, B-3, B-4, X-1 (with 2.5-a, 2.6-b, 2.7-c), X-2 (with 2.8-a), X-3, X-4 |

**Verification summary.** The first round had 25 חשוב items in the lesson reports (15 in 2.1–2.6 with its cross-lesson items; 10 in 2.7–2.12 with its cross-lesson items) and 7 חשוב entries in the components report. I checked each against the current page or, for components, the source (`TrackOverTime.vue` now resets to paper shekels when the index is hidden and has a three-column table; the layout's scroll-hint script now also sees `.overflow-auto`; `BalanceForces.vue` has branches for a falling index and a zero payment; `main.css` has the print rule for the header and the hint; `TrackOrder.vue` says "גבוה מדי / נמוך מדי"; the map marks "הסיכון בכל מסלול" as new in 2.12). All are fixed, with one exception that was fixed only where the report pointed: the 1.5 and the gender of הפריים are right in every lesson body but still wrong in 2.6's first sentence, the map card and the glossary (2.6-a, B-1). One fix moved a problem without making a trap (2.2-a). No fix introduced a wrong number.

## Verdict

Stage 2 is ready for a beginner once four things are done, and none of them is large. Two are about the 1.5 and הפריים: one sentence in 2.6 and three short strings in the map and the glossary still say "a fixed addition" and use the masculine, which undoes what 2.1 now teaches carefully; those are four string edits. Two are about the check: its right answers are always the first option, and four of its numeric questions repeat answers the lessons already printed, so as it stands the gate to stage 3 can be passed on pattern and memory; the option order is one shared-component change (it also affects checks 0 and 1), and the four questions need new facts. Everything else is polish. The teaching itself is sound: the math is right to the agora everywhere I checked, the open questions are open in the same words in every lesson, case A waits for stage 5 as the map says, the Mogi decisions are marked as decisions, field knowledge waits for Eylon, and the "two forces", "fixed rate ≠ fixed payment" and "fewer shekels of interest" threads now mean the same thing from the lesson that introduces them to the check.
