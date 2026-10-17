# QA report: lessons 8.1–8.9, read as a beginner

Date: 2026-10-17. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. Scratch scripts (independent Python Decimal checkers, an equality parser, a phone-width browser run, contact sheets) are in my own scratchpad folder `.../scratchpad/r1/chk/`. I built from a scratch copy of the tree (`.../r1/tree`, `.../r1/dist`), because a build inside the project collides with other builds' shared `.astro/.prerender` folder.

**The reader:** someone who finished stages 0–7 and has never seen a variance, a least-squares line, an expectation or a weighted score.

**What I read:** the nine MDX files in full (every exercise, error list, FillTable, Sources); the built pages as text and DOM; `public/video/8-{1..9}.he.vtt` (13/13/13/13/12/12/12/22/21 cues) and contact sheets of all key frames (I looked closely at 8.1, 8.3 and 8.8; skimmed the rest); `data/lessons/8-{1..9}.json` (all facts); `course/AUTHORING.md`, `course/stage-8-brief.md`, the stage-8 part of the course map, `research/notes/brain-calculation.md` (for the 15 rules), and the stage-4 text on the one-third rule.

**What I ran:**
- `pnpm check:terms` passes.
- **Independent recomputation in plain Python `Decimal`, no import from `src/`:**
  - every stats fact of 8.1–8.6 from its inputs (197 facts: payments, differences, percents, sums, means, weighted means, linear-interpolation and nearest-rank percentiles, population and sample variance and std, histogram counts, expectation, probabilities, least-squares a and b, residuals, MAE, RMSE, counts, shapes 1,224 and 11 by brute force): **0 mismatches**;
  - all 12 candidates of 8.7, my own implementation of the 11 constraints from the lesson's table: every reason list, family count (12/9/7/2) and measure matches;
  - my own statement-rounding schedule engine (spitzer, equal principal, prime shift from year 2, 60-month resets, monthly index by the twelfth root): all 7 candidates of 8.8 (first, max, max month, total, stress max, exposure), every normalised value, every score of all eight tables, all 66 weight triples (winners 9/32/8/17, "initial" never wins), and all 8.9 monthly payments (months 1/61/121/360, base and stress, per track and per mix), the totals, interest, indexation, the zero residual, the hand example (120,000 at 12%), and the **fingerprints** (FNV-1a of `first|max|maxMonth|total|months`: 82050ed8 / 2b9faffa): **all match, to the agora**.
- **Every `=` equality in the built pages** (34 with a parseable `<M>`; the `y = ax + b` style statements and the E expansion read by hand): all hold on printed numbers.
- **A 390px / 1280px browser run** of all nine pages: no horizontal page scroll (375 inside 390), no element sticking out, no console errors except 404s for the `.mp4`/poster files that I did not copy. All eight interactive components fit 343px.

**Result: no arithmetic error anywhere in 8.1–8.9.** The findings are about labelling, self-contradicting sentences, three exercise/video contradictions, internal names in learner text, and exercise design.

**What is right:**
- The "which of Mogi today / decided / future" box is at the top of every lesson in some form; 8.6–8.9 use the three words, 8.1–8.5 say "general maths, not a Mogi system".
- Weights, thresholds, banks and data are labelled להדגמה / synthetic / fictional (בנק א׳–ד׳), the disclaimer line is on every worked example, the 15 rules are named only as the notes record (first payment shown, projected max kept apart with the 10% highlight, 451 forecast, assumed 5-year reset marked as assumption, the inputs behind each result are kept), and the lessons say outright "the course has not seen the full list".
- The percentile method is stated (PERCENTILE.INC, with the nearest-rank trap shown beside it), the course std is population (÷n) with STDEV.S/STDEV.P named, MAE ≤ RMSE and "the line passes through the means, errors sum to zero" are true, and the dice-is-not-the-market warning (8.4) is strong. All agree with `stats.ts` outputs (my recomputation is independent of it).
- No Brain page numbers, J-codes, DEC/FK ids, file paths or "repo" in the body, subtitles or frames. (Brain page numbers sit only in `<Sources>`.)
- 8.7's constraint table has a phone card layout; it also keeps every reason, not only the first, and the pseudo-code is short.

---

## Cross-lesson findings

### X-1 · major · internal people named in learner text, plus "a question for Eylon"
- **Where:** 8.5 MDX 41 ("שאלה לאילון"), 326, 340 (Sources: "שאלה פתוחה לאילון (קובץ השאלות של שלב 8)"); 8.6 45, 186 ("וזו שאלה לאילון"), 354; 8.7 234, 378–380; 8.8 387, 413; 8.9 43, 385, 397.
- **Problem:** "the file of questions of stage 8" and "a question for Eylon" are internal work items (stage 7 review 7.4-3 flagged the same). "Eden approved/accepted" is an internal sign-off. A learner has never been told who these people are.
- **Fix:** "שאלה פתוחה שהצוות עוד לא בירר" and "הוחלט בצוות ב־2026-10-07 ואושר ב־2026-10-08"; drop "(קובץ השאלות של שלב 8)" and "(ממתין לאישור אילון)" from learner-facing sentences (the kind label "ידע מהשטח" can carry it in `<Sources>` only).

### X-2 · major · "אדן קיבל" typo and inconsistent verbs for the same decision
- **Where:** 8.9 MDX 43 ("ואדן קיבל ב־2026-10-08"), 397 ("אדן קיבל"); 8.6 186 and 354 and 8.7 378 say "עדן אישר".
- **Fix:** one wording everywhere (see X-1).

### X-3 · major · three exercise sets put the correct option first every time
- **Where:** 8.1 (1, 5, 6 all first), 8.4 (1, 6 first), 8.7 (1, 6 first), 8.8 (1, 4, 5, 7 — all four choice items first), 8.9 (1, 5, 6, 7 — all four first). 8.2 (1, 5) and 8.3 (1, 6) also first. `ChoiceExercise` does not shuffle. Predictions are spread (positions 2, 2, 2, 2, 1, 3, 3, 2, 2).
- **Fix:** move the correct option to position 2–4 in at least half of each lesson's choice items (8.8 and 8.9 first). Also 8.8 1, 8.9 1 and 8.9 7: the correct option is the longest and most hedged.

### X-4 · minor · "we" forms the brief forbids
- "נתחיל / נבדוק / נעשה / ננסה / נחשב ביד / מה למדנו / הגדרנו / שינינו / נראה בשיעור הבא": 8.1 81, 99, 217; 8.2 185, 300; 8.3 123, 119; 8.4 39, 150, 191; 8.5 77, 119; 8.6 154, 224; 8.7 248; 8.8 55, 123, 152, 228; 8.9 182, 211. Use plural address ("מה למדתם", "בדקו", "ראו בשיעור הבא").

### X-5 · minor · the top box does not say which of the three applies (8.1–8.5), and 8.8/8.9 call different things "decided"
- 8.1–8.5 say "general maths, not a Mogi system" (and 8.1 lists the three). The brief wants one of the three stated; say "עתיד (מתמטיקה כללית, לא מערכת)". 8.1 has the box before the opening paragraph (AUTHORING: opening first).
- 8.8 MDX 51 and Sources 412: "הוחלט: שלושת היעדים … תכנון המוצר". The brief's "הוחלט" is only the 15 rules and the layer modes. I could not confirm the three objectives in the notes I read; 8.6 105–106 / Sources 355 also cite a "Mogi decision" (per-track term) while the top box says there is one decided item. **Fix:** either mark the objectives "הצעה / לפי הבריף (עתיד)" or state in each top box that exactly these items are decided. Also 8.8 Sources 412 says "לא נקרא מחדש בכתיבת השיעור" — an authoring admission in learner text; delete.

### X-6 · minor · exercise polish
- Calculator-needed exercises do say so (8.1 3 and 5, 8.2 3–6, 8.3 3–5, 8.5 3–5): good. 8.1 states "מספרים להמחשה… בתרגילים 3 ו־5" but 8.1-4 (31.3%) also needs a calculator.
- Wrong-answer notes exist for most; missing: 8.2-2, 8.3-2, 8.4-2, 8.4-3 (natural error: using 10+ for ≥8), 8.5-2, 8.5-5, 8.6-3/4, 8.7-2/3/4 partially, 8.8-2/3 (natural error: rounding), 8.9-4.
- 390px: FillTables fit (343 box). 8.9's mix-by-month table is 437px in a 343 box and scrolls; the column the text talks about ("התמהיל") is the last one (6th), off-screen. Put it first or use cards.

---

## 8.1 — משתנה ופונקציה

Good first hook (input ← rule ← output on a 4.8% / 0.004 rule), then the payment as a non-linear function (table 4742.11 → 6443.01, increments 536.26 / 567.53 / 597.11), chain of two functions. All numbers verified.

### 8.1-1 · minor · "you only need stage 0" is false
- MDX 48: "תצטרכו רק את מה שלמדתם בשלב 0", but the lesson uses Spitzer (2.9), the payment ratio (4.2–4.3) and Directive 329 (180). Fix: "רוב מה שתצטרכו הוא משלב 0; הדוגמאות משתמשות גם בהחזר ובשיעור ההחזר שכבר הכרתם".

### 8.1-2 · minor · definition wording and a typed number
- MDX 90: "בפונקציה כל קלט נותן פלט אחד בלבד" is stated as a definition, then 89 says P is the input and I the output, but 124 allows several inputs; fine, but the callout "מונחים" never says that the symbol f is not a quantity until 95 (after use at 90). Move 95's sentence into the callout.
- MDX 241: hint "0.004" is typed; it equals fact `rate.month`. Use the fact.
- MDX 129: "4.40% ל־360 חודשים" typed; they are inputs of facts, acceptable.
- MDX 217 step 3 "זו בדיוק השאלה שהאלגוריתם שואל" and the reference "(שיעור 8.6)" are fine (a later lesson is named, no term used).

### 8.1-3 · minor · tasks and FunctionMachine
- MDX 146: task 3 compares "60 months less" against "one percentage point more" without saying that the answer depends on the starting point until the closed note; fine, but the note (153) says "הפונקציה אינה קו ישר ולכן אין תשובה אחת": the learner who sees a clear winner in the tool will think the note is wrong. Add "בנקודת ההתחלה של התיק: …" with the fact.
- Video frame t097 (chain) shows 1,640,000 → 8,212.48 → 40.6% without "4.40%, 360 months, income 20,250" — a beginner cannot reproduce it. Add the three inputs as a caption.

---

## 8.2 — סכום וממוצע

Sum, mean, weighted mean from the mix (4.37 vs 4.40), the ratio trap (40% vs 43.3%). Correct. 4.40 = the fixed track's own rate is a coincidence; the lesson says the fixed track "pulls", which is fine.

### 8.2-1 · minor · "שלוש התוצאות" with two rows
- MDX 193: "השלימו את שלוש התוצאות" but the table has two rows and one blank (`blanks` = one). Fix: "השלימו את התוצאה החסרה".

### 8.2-2 · minor · typed numbers, notation
- MDX 179 "1,000,000 ₪ … 900,000 … 4.0% … 6.0%", 193 (8,000 / 2,400 / 32,000 / 16,000), 234, 242, 250, 273 are typed teaching inputs of facts: acceptable, but the sub-label "בית א / בית ב" (149–150) vs "בית ג / בית ד" (193) with a different pair of numbers is easy to confuse. Reuse the same two houses or name them "בית 1, 2" and "בית 3, 4".
- MDX 80: "Σ" is explained, but "x<sub>k</sub>" and "n" as count: stated at 131 (after use at 80–90). Move the "n has a new meaning" sentence next to the first use at 80.
- MDX 112 (table "הסכום כפול הריבית" = 3,608,000 etc.): explain once that the units are "שקל־אחוז" (98 does); fine.

### 8.2-3 · minor · weights as shares claim
- MDX 120: "התוצאה זהה, כי מה שחשוב הוא היחס בין המשקלים" correct and verified (4.4 with 50/30/20).

---

## 8.3 — התפלגות, פיזור ואחוזון

The strongest of the maths lessons: histogram with a choice of bin width, mean vs median under an outlier, a 4-step std table, and the PERCENTILE.INC method with positions 6 / 10 / 2 / 3.5 / 8.5 on the same 11 data, plus the nearest-rank warning. All numbers verified (mean 35.82, median 35, population var 28.69, std 5.36, sample std 5.62, p25 32, p75 39, p90 42, outlier mean 37.91 / std 10.92, 30-case histogram 3,7,8,5,4,2,1, mean 35.2, median 34.3, p90 43.3, std 5.9).

### 8.3-1 · major · the video uses a std that belongs to another data set without saying so
- **Where:** `8-3.he.vtt` cues 9–11 ("סטיית תקן … כאן: 4.34 נקודות אחוז") right after the eleven-case mean/median story (35.82 / 35 / 37.91); the frame t102 says "בדוגמה: 4.34". 4.34 is the std of the *five* values 30, 34, 35, 38, 43 of the page's table; the eleven cases have 5.36 (10.92 with the outlier).
- **Problem:** a learner who computes the std of the eleven cases from the first frames gets 5.36 and thinks they erred.
- **Fix:** say "חמישה יחסים: 30, 34, 35, 38, 43" in the frame and the cue ("בחמישה תיקים: 4.34").

### 8.3-2 · minor · wording
- MDX 172: "ערך שמתחתיו נמצא (בערך) p אחוז מהנתונים" — "בערך" is not explained; the step list that follows explains it. Fine, but the cue 13 ("תשעה מכל עשרה … לא עוברים אותו", p90 = 42 of 11 cases) is exact only for the 30-case data; with 11 cases 10 of 11 are ≤ 42. Say "בערך תשעה מכל עשרה".
- MDX 101: "יש זנב ארוך לצד הגבוה … שם הסיכון": the claim "that is where the risk is" is a general statement; fine as maths, but ties to nothing in the lesson. Keep, or add "(בדוגמה הזו, תיקים עם יחס החזר גבוה)".
- MDX 123, 160: the two-list example "33, 35, 37 ו־20, 35, 50" appears as bare numbers; label them "רשימה א / ב".
- MDX 137: column label "הסטייה מהממוצע (36)" hard-codes 36.
- 8.3-3 solution: add why PERCENTILE.INC vs PERCENTILE.EXC (a beginner's spreadsheet offers both); one clause.

---

## 8.4 — הסתברות ותוחלת

Probability by counting, expectation as a weighted mean with weights summing to 1, the dice-to-payments example with a clear "a die is not the market" label. All numbers verified (expected 3,127.58 vs today 3,056.31, +71.27; average rate shift +0.25).

### 8.4-1 · major · a wrong-answer note whose numbers contradict the option it annotates
- **Where:** MDX 166/168 and the reveal notes: the first note (for "same as today") is right; the note for "one of the six: the middle one" (index 3, line 169) says "התוחלת 3,127.58 אינה אחד מששת ההחזרים: 3,056.31 ו־3,190.30 הם השכנים שלה" — but the option text names 3,056.31 or **3,190.30** as "the middle" and the note says they are the neighbours; fine; the real issue is the note at index 0 (line 166): "הפאות לא סימטריות…" attached to the option "כמו ההחזר היום" — good — but the note at index 2 (168) for "lower than today" says only two faces lower and three higher; it does not say why the raises matter more (convexity). Add "וההחזר עולה בקצב שגדל (שיעור 8.1)".
- Lower severity but worth fixing: line 122 gives two reasons for the +71.27 (asymmetric faces; convexity) with no split of how much each contributes. A learner will ask. Add the check: "בריבית ממוצעת של 4.35% ההחזר הוא X, ולכן ההפרש הנותר הוא הקמירות" (needs a new fact).

### 8.4-2 · minor · wording and structure
- MDX 146 (the closed note) and 138 (task 4: "עד שהסיכוי … שליש. איפה הוא נמצא?") — answer given as "between the 4th (3,190.30) and the 5th (3,327.46)": fine.
- MDX 80: "הסכום 7 יוצא מכמה צירופים (1 ו־6, 2 ו־5, ועוד)": say "שישה צירופים" (187 does).
- MDX 249 exercise 3 hands the counts over in the stem, so level "בינוני" is "קל".
- MDX 150: "שינינו את ההסתברויות" (we-form).
- MDX 214 hint types "1, 1, 1, 1, 2, 3" (inputs of facts, OK).
- The "הוגנת" die and the "מוטה" dice are explained in words only; the DiceToPayments component shows them (fits 343px).

---

## 8.5 — קו מגמה ושגיאה

Line fit from 5 points by hand (slope 2.35 ÷ 250 = 0.0094, b = 0.642, residuals 0.008, −0.019, 0.014, −0.003, 0), then the ten-point fit (a 0.0123, b 0.491, MAE 0.025, RMSE 0.030), the outlier effect (a 0.023, RMSE 0.274) and extrapolation at 90% (1.60, not knowledge). Everything verified. Good "three things the line does not say" callout.

### 8.5-1 · major · internal question in learner text (see X-1)
- MDX 41, 326, 340.

### 8.5-2 · minor · notation collisions are said out loud but late, and one is missing
- MDX 77 reuses a, b, x, y (a was the anchor in 2.1, b the later balance in 0.3, y a bond yield) and says so: good. It does not say that the course's **table letter m / s** (spread) is *not* used for the vertical axis y (the spread). Add "y כאן הוא המרווח (בלשון שיעור 0.9: s)".
- MDX 160: the five-point line (0.0094, 0.642) and the ten-point line (0.0123, 0.491) both appear in one paragraph; add "שני קווים שונים, כי הנתונים שונים".
- MDX 119: "נחשב ביד" (we-form).

### 8.5-3 · minor · tasks and exercises
- MDX 98: "הזיזו … עד שהקו נראה לכם טוב. כמה ה־MAE וה־RMSE שלכם?" — the closed answer (106) gives "כמה אלפיות עד כמה מאיות" but the example line (0.012, 0.55) has MAE 0.044: say "מאיות".
- 8.5-4 requires four digits (tolerance 0.0005 at MAE 0.0088 is 6%): the "near" band is wide; use 0.00005.
- Prediction options: option 1 "0.2" is described in the note as "one outlier's size"; it is also the value with the outlier (0.194): a good trap.

---

## 8.6 — משתני ההחלטה בשתי רמות

Four kinds (data, decision variable, constraint, objective); two levels; the second depends on the first (the table of four requests on the same mix: ratio 41.04 → 40.04 / 38.29 / 34.27); counting candidates (80 × 1,224 = 97,920, verified by brute force). Top box says "עתיד" and lists the one decided item.

### 8.6-1 · major · a prediction note says the opposite of what the numbers show
- **Where:** MDX 200 (note for the option "כמה אלפים"): "1,224 המבנים של התמהיל בלבד כבר חורגים מכמה אלפים, ועוד הבקשות".
- **Problem:** 1,224 is about one thousand, not above "several thousands". Only the product (97,920) exceeds. The note also contradicts 199 ("זה מספר הצירופים ברמה 1 בלבד, 80, ועוד כל התמהילים שמעליו" — "שמעליו" is meaningless).
- **Fix:** option "כמה אלפים": "1,224 מבנים כפול 80 בקשות הם 97,920, לא כמה אלפים"; option "כמה מאות": "80 בקשות כפול 1,224 מבנים".

### 8.6-2 · minor · undefined word "פסק" and a hidden assumption
- MDX 146: "מה קורה לפסק?" — "פסק" (verdict) is not a course word; the component shows "המועמד נפסל: N סיבה". Fix: "מה קורה לסטטוס של המועמד".
- MDX 125–127 and the table: closing the car loan uses 36,000 ₪ of savings (avail 600,000 → 564,000, not the 37,700 of 26 × 1,450) and "הורה כלווה" adds 4,000 income; none of these assumptions is stated. The text says only "ההון הנוסף מקטין את ההלוואה… שני האחרים מגדילים את ההכנסה הפנויה". A learner who tries to reproduce 38.29% cannot. Add the two assumptions (the saving needed and the parent's income) next to the table, labelled "הנחות להדגמה".
- MDX 130 and 8.6-6: the car-loan ratio gain 2.75 points matches the table.
- MDX 106 and Sources 355 "הנחת עבודה של Mogi, לכל מסלול תקופה משלו": see X-5 (a second "decided" item).

### 8.6-3 · minor · the 15 rules callout
- MDX 186: all items agree with the notes I could check (first payment shown beside the projected maximum, 451 forecast, assumed reset every five years as an assumption, ratio = relevant payment ÷ recognised disposable income, grace inside the term). The sentence "מה שלא נקרא כאן, הקורס לא ראה" is the honest one; keep it but remove "וזו שאלה לאילון" (X-1). The callout is long (one paragraph of 100 words): split into four bullets.
- MDX 190: `=COMBIN(n, k)` is announced "בקורס מכאן ועד שיעור 8.13" but never used in 8.6; remove or move to 8.13.
- Exercise 8.6-4 (two track kinds, one term, 10% steps, may leave one out → 11) is a good small counting problem, but "אפשר להשאיר מסלול בחוץ" and "חלק 0 פירושו…" are contradictory wording (leaving out = one track gets 100%). Fix: "אפשר להשתמש במסלול אחד בלבד או בשניהם".

---

## 8.7 — הנתונים, האילוצים הקשיחים ופתרון אפשרי

A constraint is a "must", rejection keeps every reason (short pseudo-code), 12 candidates, four families, then feasible ≠ good. All reason lists, the 12/9/7/2 funnel, the c03 four-reason example (ratio 50.8%, payment 10,287, bank line 45%), the c07/c11 survivors (39.97% / 39.43%) and the exercise answers (1,500,000; 800,000; 9; 8,100) verified independently. 8.7 uses the stage-4 reading (prime and 5-year variable both count as "can change") consistently with 4.4.

### 8.7-1 · major · a candidate printed as 45.00% is rejected against a 45% line, and the page teaches "equal passes"
- **Where:** MDX 200–202 ("שוויון עובר … חישוב על המספרים המדויקים") vs candidate c06 (`m.c06_ratio` = "45"), exercise 8.7-half (258) and the filter's chip "יחס ההחזר עד נקודת הסירוב של הבנק".
- **Problem:** c06's ratio is 9,113.16 ÷ 20,250 = 45.0033%, rounds to 45.00, fails the bank line 45. The lesson says exactly-equal passes and says to compute on exact numbers, but gives no number that lets a learner see 45.0033. A careful learner who sees "45%" anywhere (the fact exists; the filter detail may show it) will call it a bug.
- **Fix:** replace c06 by a candidate that fails by a visible margin (e.g. 46%+), or print the ratio to four digits in the exercise's solution ("45.0033%, מעל 45%").

### 8.7-2 · minor · the c07 story and the "rounded" sentence
- MDX 248: "c07 מוסיף הון נוסף ועובר" — c07 also changes the mix (more fixed, 40% variable instead of 66%), so the pass is not only the 20,000 ₪. Say "מוסיף הון נוסף ומעביר חלק לקבועה".
- MDX 250: "הבדיקה נעשית על המספר המדויק, ולא על זה שמוצג בעיגול" is irrelevant here (39.97 vs 40.00 is a margin of 0.03, visible at two digits). Replace by "יחס של 39.97% עומד על 0.03 נקודות מהיעד: שינוי קטן בריבית פוסל אותו".
- MDX 84 and 79: "מאומתים ממסמכים (שלב 4)" states as if running; this lesson is "עתיד": "בתכנון: יאומתו ממסמכים".
- MDX 205: "בדיוק כך בנוי המנוע של הסדנה בשיעור 8.28" — a forward reference to an unseen workshop stated as fact; "יבנו בשיעור 8.28".
- MDX 134: the "research note" on which lines limit the split is labelled; keep.
- Facts: `f.rejected` (10) and `k.n` (12) are typed `given` values that are 12 − 2 and the candidate count; make them derived (AUTHORING: no arithmetic by hand).

### 8.7-3 · minor · exercises
- 8.7-4 solution: "המועמדים ש״…״ נופלים בחוק (יחס החזר או שליש קבוע)" — grammar; the sentence names the family but not that c02 and c09 fail the third rule and c03 the ratio.
- Correct option first in 8.7-1 and 8.7-6 (X-3); 8.7-5 level "בינוני" is a one-step multiplication.

---

## 8.8 — העדפות ומשקולות

Objective = a function of a candidate; min-max normalisation (0 best, 1 worst, 4 digits), weighted score, feasible vs optimal, weights change the winner, the group changes the scale. All verified (norm.first 0.6548 / 0 / 1; 0.4259 / 1 / 0; score 0.38969; five-mix scores 0.451200 / 0.404120 / 0.441710 / 0.600000 / 0.417520; winners by weights linked/short/fixed; dropping "linked" makes "fixed" win; 66 combinations, 4 different winners).

### 8.8-1 · major · the worked example's conclusion contradicts its own numbers (page and video)
- **Where:** MDX 142 and 149 ("half מנצח … בלי לנצח אף יעד אחד לבד בשלושה: הוא בינוני בהחזר הראשון ובסך התשלומים, והטוב ביותר רק בחשיפה בתוך הקבוצה הקטנה"); video cue 14 ("הוא לא ניצח אף יעד לבד, אבל בינוני בכולם"); frame t103 shows score 0.389690.
- **Problem:** in the three-mix group the page uses, `half` has normalised exposure 0 (the best): it **does** win one objective. The sentence says "wins none" and "is best in exposure" in one breath, and the video says "middling in all". The pedagogic point (a mix can win the weighted score without winning any objective) is true only in the five-mix group (half's exposure there is 0.0481; score 0.404120), which is what the prediction reveal uses. The learner sees two scores for the same mix and weights (0.38969 and 0.404120) with the reason ("different group") coming only 40 lines later.
- **Fix:** use the five-mix group for the hand example (n_exposure 0.0481, score 0.404120), or drop "בלי לנצח אף יעד" and say plainly "במבחר של שלושה הוא הטוב ביותר בחשיפה; במבחר של חמישה הוא לא מנצח אף יעד, ועדיין מנצח בציון". Change cue 14 likewise.

### 8.8-2 · major · "a mix that did not win" is a mix that won the first payment
- **Where:** MDX 194 ("כשמורידים את ״צמוד״, תמהיל שלא ניצח"), video cue 18 ("מורידים תמהיל שלא ניצח: ״צמוד״") and exercise 8.8-5's option 4 (344: "צמוד היה אחד המנצחים" — "לא: בשיעור 5.6 הוא ניצח את ההחזר הראשון, אבל במשקולות האלה …").
- **Problem:** cue 5 (and MDX 66, 123) say "צמוד" won the first payment; cue 18 says he did not win. The option-4 feedback starts with "לא" and then states the option is true. A beginner is told two opposite things.
- **Fix:** "מורידים תמהיל שאינו המנצח במשקולות האלה"; rewrite option 4 as "כל מי שהוסר חייב להיות המפסיד הגדול" (a real distractor) or give it true-with-nuance feedback ("נכון שניצח את ההחזר הראשון; אבל במשקולות האלה לא ניצח, והשאלה היא למה ההסרה שינתה את המנצח").

### 8.8-3 · minor · rounding artefact shown as exposure, and a "max month" that is the last month
- A fixed-rate 20-year loan (`fixed_20`) has exposure 1.03 ₪ (max 10,288.16 at month 240 vs first 10,287.13): the last payment absorbs rounding drift. The playground shows it in the table; a fixed-rate loan has no rate exposure. Same in 8.9 (below). One sentence ("הפרש של שקל מעיגול החודשים") or round the last month's drift out.

### 8.8-4 · minor · wording / phone
- MDX 278: "בנק ישראל לא מקבל ״כמעט״" is an unlabelled claim about the regulator; delete. MDX 279: "ההפך קרוב יותר" is confusing.
- MDX 259 (success text): "אחד מושך את הציון למעלה בגלל שני האחרים" is unclear.
- MDX 98–100: the exposure definition uses the name "חשיפה" while the prediction (66) and the video (cues 5, 6, 17) call the goal "יציבות". Use one word.
- MDX 135: tie rule "המופיע ראשון ברשימה" is the code's; say it is a convention.
- Video cue 2: "זה המחשה" → "זו המחשה".
- MDX 121: "n" as the normalised value is announced; fine.
- Phone: tables fit; the playground (343px) shows scores with bars; the three sliders are readable.

---

## 8.9 — תזרים לכל מסלול לפי תרחיש

Engine as a function (mix + scenario → cash flow + measures), hand example (120,000 at 12% equal principal: interest 1,200 → 1,100 → … → 100, total 127,800, interest 7,800), the mix as the sum of tracks (8,181.30 in base; 9,432.17 in stress at month 61), determinism by fingerprint (82050ed8, 2b9faffa, same for reversed order, 0efa2ea5 for a ±1 ₪ nudge), and total = loan + interest + indexation with zero residual. I reproduced all of it with my own engine.

### 8.9-1 · major · "the highest payment is in month 360" is a rounding artefact presented as an effect of rates
- **Where:** MDX 131 ("ובחודש 360 במחמיר … הריביות הגבוהות עשו את שלהן"), 135 (stress max 9,435.33 "בחודש 360"), video cue 14, and the exposure measure of 8.8.
- **Problem:** from month 61 on, the stress rates do not change: months 61 and 121 pay 9,432.17; month 360 pays 9,435.33 only because the last payment clears the accumulated rounding (+5.32 on prime, −3.52 on the variable, +1.36 on the fixed). A beginner will read "the rates push the payment up over time" and "the peak is at the end".
- **Fix:** state it: "ההפרש של 3.16 ₪ בין חודש 61 לחודש 360 הוא עיגול של החודש האחרון, לא ריבית"; or define the exposure on the highest payment before the last month, or show month 61 in the sentence and the video.

### 8.9-2 · major · the video and page state "הוחלט" items with the wrong verb and a typo (see X-2), and "לפי הדף בצוות" is used for things not in the box
- MDX 179, 358, 372 ("לפי הדף בצוות, המדיניות המוסכמת היא …"): the "keep the inputs behind every result", "a projected max is a forecast not a cap", "10% highlight" are in the notes I read (brain-calculation, items 14 and the section on the 15 rules); "the plausible threshold of a difference is not yet set" (358, 361) I could not find. Mark each as "לפי הרישום של הצוות" and the unseen one as "לא ידוע".
- MDX 372: "(סף שהוחלט)" is the right word for the 10%, but the same sentence's other items are not: separate them.

### 8.9-3 · minor · jargon without a definition
- MDX 177, Sources 400: "טביעת אצבע", "קוד גיבוב (FNV)"; MDX 202: "שברים מצוף", "כמה ננו־שקלים". A beginner who finished stage 7 has never met hashing or floating point. Replace with one sentence each ("קוד קצר שמחושב מהתוצאה") and move "FNV" to Sources only; or cut the aside at 202.
- MDX 177: the five-part list inside one 120-word paragraph (run1, run2, stress, reversed, nudged); make it a small table or bullets.
- MDX 99: base "הפריים והעוגנים לא זזים", stress "עולים ב־2 נקודות אחוז" — add "החל מהשנה השנייה" (the stress prime starts in month 13; that is why month 1 is equal).
- 8.9's top box says "הוחלט: 15 כללי החישוב… ואדן קיבל" (X-2).

### 8.9-4 · minor · layout and exercises
- The mix table (437px in 343px) scrolls on a phone; "התמהיל" is the last column (see X-6).
- 8.9-5 says "הבדל של 3 אגורות": typed number, harmless. 8.9-7 (comparing to a bank's table): the feedback relies on "לפי הדף בצוות … סף … עוד לא נקבע"; fine.
- MixBuilder (the stage-3 component) is 2,688px tall at 390px (long scroll); consider a "show only the totals" collapse.
- The video (cue 10) shows month 61 base only; show the stress month 61 (9,432.17) beside it, since the half-solved exercise asks for it.

---

## Summary by severity

**Blocker:** none. No arithmetic error and no step a beginner cannot follow in the maths.

**Major (fix before release):**
1. X-1 / X-2: internal names, "שאלה לאילון", "קובץ השאלות", the "אדן" typo (8.5, 8.6, 8.7, 8.8, 8.9).
2. X-3: the correct choice option is first in most choice exercises (8.1, 8.2, 8.3, 8.4, 8.7, 8.8, 8.9).
3. X-5: 8.8 labels the three objectives "הוחלט" (outside the brief's list); "not re-read when writing the lesson" in Sources.
4. 8.3-1: the video's 4.34 is a different data set.
5. 8.6-1: a prediction note that says the opposite of its numbers (1,224 "exceeds several thousands").
6. 8.7-1: c06 prints as 45% and fails a 45% line while the page teaches "equal passes".
7. 8.8-1: the worked example says "wins no objective" while its own numbers show the best exposure (page and video).
8. 8.8-2: "a mix that did not win" is the first-payment winner (video cue 18, page, option 4).
9. 8.9-1: the stress peak "in month 360" is rounding, presented as rates.
10. 8.9-2: "לפי הדף בצוות" for a claim not found in the notes.

**Minor:** we-forms (X-4), unclear tops (X-5), exercise notes (X-6), 8.9 table on phone, 8.1-1, 8.2-1, 8.5-2, 8.6-2, 8.7-2, 8.8-3, 8.8-4, 8.9-3.

## Files
- Report: `/home/user/mogi-course/qa-reports/stage-8-review-8.1-8.9.md`
- My checkers (scratch): `/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/r1/chk/` (`stats_chk.py`, `cons_chk.py`, `engine_chk.py`, `eqs3.py`, `phone.mjs`, `comp.mjs`)
