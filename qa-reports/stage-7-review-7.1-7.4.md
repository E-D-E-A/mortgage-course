# QA report: lessons 7.1–7.4, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts (a plain-Python Decimal checker, an equality parser, a phone-width browser run, contact sheets) are in my own scratchpad folder. `pnpm astro build` also refreshes the generated `.astro/` cache in the project; that is build output, not source.

**The reader:** someone who finished stages 0–6 (money, the mortgage world, tracks and rates, schedules, present value and IRR, the bank's view of income, Directive 329, the pre-approval, comparing offers, Directive 451, the mix, positioning, the red line) and has never met an early-repayment fee or a refinance test.

**What I read:**
- the four MDX files `src/pages/lessons/7-{1..4}.mdx` in full (every exercise, error list, FillTable, Sources block);
- the built pages from my own build (`<scratch>/r1/dist/lessons/7-{1..4}/`; my first build collided with another build's shared `.astro/.prerender` folder and died on 6-8, the second was clean), as visible text and DOM;
- `public/video/7-{1..4}.he.vtt` (30 / 30 / 29 / 24 cues) and all 119 key frames `qa/video/7-{1..4}-t*.png` as contact sheets, plus full-size crops where the sign or the direction mattered, and the scene sources `video/7-X.html` for the amount strings;
- `data/lessons/7-{1..4}.json` (every fact, 54 / 78 / 75 / 147), `src/data/definitions/7-{1..4}.json`, the glossary entries of the earlier-lesson terms used;
- `course/AUTHORING.md` (every rule), `course/stage-7-brief.md`, the stage-7 part of `course/course-map.md` (and the term list), `research/notes/brain-calculation.md` §6–7 (the team's transcription of the Order and of §15א) for every non-math claim; no field-knowledge ids are used in 7.1–7.4;
- the components as the learner meets them (`FiveFees`, `FeeCalculator`, `FeeOverTime`, `RefinanceCalculator`), in the browser at 390px;
- earlier lessons for the cross-references (2.7, 3.10, 4.3, 4.6, 5.3, 5.5) and `qa-reports/stage-6-review-6.1-6.5.md` for method and for the items that repeat.

**What I ran:**
- `pnpm check:terms`: passes (every lesson, 7.8 included).
- **Independent arithmetic in plain Python `Decimal`, no code from `src/`:** the Spitzer payment and balance of case C; the twelfth-root monthly rates; both discounting formulas §3(3) and §3(4) with the published averages, "the lower", the time-served reduction and the operational fee (7.2 and the four 7.3 variable-track points, with the cut at the reset and the balance at the reset discounted); the sensitivity to 4.823 vs 4.823049; the negative second formula and its set-off (granted January 2023); the 300,000 ₪ half-solved example; the one-year bullet example; the 7.3 fixed-track points on 2.6.2028 / 2.7.2028 and the 31.8 / 2.9.2026 step, the month's interest 3,154.56; the day's interest 58.33 / 46.67 and the net 566.67 / 453.33; the 45 / 10 day window and the six-month date; the no-notice and index fees; the 7.4 small example (payments, IRR 0.5% and 0.2494%, effective 6.17% and 3.03%, the check present value); the existing loan's expected total rate 6.06% and rate for comparison 5.82% (T = 10,365.95); the three offers (statement-rounded schedules: first payment, total, total with costs, gap, saving, rate with costs 5.38 / 5.37 / 5.89), the break-evens 15 / 41 months and 3 months / never, the positions at 12 / 36 / 60 months (−8,865.63 / −1,275.34 / 5,936.91, and −3,978.72 at 36 for bank ג׳), the present value of the saving at the comparison rate (19,297.29 / 26,855.16 / −4,068.96), the keep-the-payment months (192.37 → 193; 208.73 → 209), the 5.6% / 5.7% threshold, and the three-track loan (every track's balance and both rates, the whole-loan pair, the new loan 575,628.22, the partial refinance 276,201.30).
- **Every `=` equality in the four built pages parsed and evaluated both sides** (19 equalities with an operator; the two percent-to-percent ones read by hand).
- **A 390px browser run** of all four pages: document width, overflow, every table's box, hydration warnings, and screenshots of the four interactive components.

**Every result matches the module. Every printed equality holds on its printed numbers.** The fixture reproduces to the agora (56,765.24 / 12,882.44 / 12,882.44 / 10,305.95 / 10,365.95; 637,956.74; 4,974.72; 37 / 203), as does the 4.823 sensitivity (+2.40 ₪), the January-2023 case (v2 −20,256.45, total 0) and every 7.3 and 7.4 figure listed above. No arithmetic error in a worked example, table, exercise answer or listed error. The findings below are about wording, labels, a few misleading juxtapositions, exercise design, letters and the videos.

**Phone.** No page scrolls sideways (document 375px inside the 390 viewport minus the scrollbar), nothing sticks out, no hydration warnings. The 7.1–7.3 tables all fit (box 341px, tables 309–317px). In 7.4 the offers table is 544px in a 341px box and scrolls (7.4-6); the calculator's own per-track table scrolls too (480 in 309). The 7.4 calculator's sticky summary at the bottom of the screen behaves as designed.

**What is right (checked and clean):**
- **Nothing is called a verified fact.** Source kinds used: `לא אומת`, `מחקר / הצעה`, `הנחת חישוב`, `ידע כלכלי כללי`, `בדיקת חישוב`. No "עובדה מאומתת". The Order and §15א are labelled "תעתיק של הצוות, לא נבדק מול הצו / ההוראה" in the body, in the five-questions callout and in `<Sources>`; the quoted sentence of §3(5) and the quoted regulator sentence of §15א are each labelled "ציטוט מהתעתיק, הנוסח לא נבדק".
- **The team's own readings are separated from the Order's words**, in plain sentences: the 45-day ceiling ("הקריאה שלנו, ולא של הצו"), the floor at zero, "the reduction applies to a positive result only", "which bucket for the grant average", the 4.823 / 4.823049 discrepancy, and the explanation of why a variable track's fee stops at the reset ("ההסבר שלנו, לא של הצו"). 7.3 and 7.2 list what is unknown and refuse to decide it ("מה לא ידוע, ולכן לא נחליט", "פתוח"), and the exercises avoid the open edges (days 10 and 45, the exact anniversary).
- **The classic mistake is taught with its price:** mixing the nominal contract rate with the effective average shrinks the fee by 5,260.05 ₪ in the fixture, and the lesson says the mixed number is "נוח מדי".
- **7.4 does what the brief asks of "a lower payment is not a total saving":** three questions asked separately, with bank ג׳ passing the test and still costing 152,319.24 ₪ more, bank ד׳ failing it, and a computed "keep the payment, shorten the loan" view. The direction trap (a fee lowers the comparison rate here, where it raised the IRR in 3.10) has its own warning callout.
- **Honest about its limits:** the calculator's fee is an input, "the cost of leaving the new loan later is unknown", partial refinance is an open question with the "same property" rule explained as our reading, and the lesson says outright that the test "is not a recommendation".
- **Fictional banks only** (בנק ב׳ / ג׳ / ד׳; "the public form of one bank"); the only real institution is the Bank of Israel as the publisher. No real client data.
- **No Brain page ids, J-codes, DEC numbers, file paths or FK ids in the body, the subtitles or the frames.** The Brain page numbers appear only in `<Sources>`, as the stage briefs allow (the two exceptions are 7.4-3).
- **Every figure on the pages, in the exercises' answers and errors, in the solutions and in the videos comes from a fact** (the only typed numbers are teaching inputs; see 7.2-7 for the one small exception).
- **Numbers agree across the four lessons:** the fixture (balance, payment, 37 / 203, fee 10,365.95) is identical in 7.1–7.4; 7.4's T = 10,365.95 and financed amount 648,322.69 are 7.2's fee plus 7.2's balance; 7.3's 8,722.57 → 7,575.34 and 7.4's use of the same loan agree.

---

## 7.1 — חמש עמלות הפירעון המוקדם

The order is right: one fee at a time, each with the rule that decides when it applies and one small number, then a table of which fee a track pays, then the calculator, then the exercise that makes the learner name every fee before adding. The "operational fee is once per repayment, not per track" story (180 ₪ vs 60 ₪) is the right first hook.

### 7.1-1 · major · the prime exercise note states, from memory and unlabelled, a claim that is also wrong
- **Where:** MDX 401 (the wrong-answer note of option 3 in 7.1-5): "בפריים אין את העמלה הגדולה בכלל: הריבית שלו זזה לפי בנק ישראל, בתאריכים שאי אפשר לדעת מראש."
- **Problem:** the team's note gives this as the reason the Order exempts prime ("BoI rate moves on dates not known in advance"), but here it is a flat statement with no label, outside the labelled table. It is also not accurate as written: the Bank of Israel's rate-decision dates are published in advance; what cannot be known is the direction. A beginner will repeat it.
- **Fix:** "בפריים אין את העמלה הגדולה בכלל (לפי התעתיק של הצוות)." and drop the reason, or "הצוות מסביר זאת בכך שהפריים זז בעקבות החלטות ריבית (הסבר של הצוות; לא אומת)".

### 7.1-2 · minor · "אחוז אחד מאלף" is the wrong size
- **Where:** MDX 136 (heading).
- **Problem:** 0.1% is one tenth of a percent, one part in a thousand. "אחוז אחד מאלף" reads as 1% of 1,000, and the page's first prediction option is literally "אחוז אחד מהיתרה". Two lines below it the text does say "שקל על כל אלף".
- **Fix:** heading "עמלת אי־הודעה: שקל על כל אלף".

### 7.1-3 · minor · the prediction gives its answer away, and two of the three choice exercises put the right option first
- **Where:** MDX 29–34 (option 4 is the longest, the only one that says "אחת מהן עלולה להיות גדולה בהרבה" and the only one with the word "כמה"), 334 (7.1-1, correct first), 367 (7.1-3, correct first). 7.1-5 has it second.
- **Fix:** shorten option 4 to the length of the others ("חמש עמלות, לכל אחת כלל משלה"); move the correct option of 7.1-1 or 7.1-3 to position 3 or 4. `ChoiceExercise` does not shuffle.

### 7.1-4 · minor · small wording
- MDX 299: "בכל טבלה לא נכללת עמלת ההיוון" there is one table; "בכל שורה".
- MDX 351: the note "כתבתם 0.1 כאילו הוא 10%" is hard to follow (the learner typed 25,000 = 10% of 250,000, i.e. read "0.1%" as "0.1 as a decimal fraction of ten percent"). Say "זה 10% מהיתרה. 0.1% הוא עשירית האחוז, כלומר ×0.001".
- MDX 41, 42, 77, 128: "למדנו / נשאל / אנחנו" see X-3.
- MDX 77: "בישראל הבנק לא קובע לבד מה לגבות … מוגבלות בצו" is stated before the label "את הצו עצמו לא פתחנו" two sentences later; reorder so the label comes first or add "(לפי התעתיק)" after "בצו".

---

## 7.2 — עמלת ההיוון

The strongest lesson of the four. The one-year bullet example, with the bank re-lending at 5% and the 12% counter-case, is exactly the small-numbers-first the course asks for, and the connection back to 3.10 ("at the loan's own rate the present value of the remaining payments is the balance") is correct and well placed. The calculator walks every step.

### 7.2-1 · major · "this saves them 43,882.80" is not what they save
- **Where:** MDX 279 (the wrong-answer note of the first option of the prediction: "בדוגמה זה חוסך לעדי וירון 43,882.80"), MDX 350 (the same sentence in the feedback of option 1 of 7.2-1). MDX 149 says it correctly ("הכלל … שווה כאן 43,882.80").
- **Problem:** 43,882.80 is v1 − v2 **before** the time-served reduction. What the rule actually saves them in what they pay is 45,472.19 − 10,365.95 = 35,106.24 (the same page prints 45,472.19 and 10,365.95 in line 149). The notes say "saves" and attach the pre-reduction number, so a learner who adds the two numbers from line 149 finds a different saving.
- **Fix:** "זה חוסך לעדי וירון, לפני ההפחתה לפי ותק, 43,882.80 ₪" or use a fact for the real difference (35,106.24, needs a `difference` fact of `total_v1_only` and `total`).

### 7.2-2 · minor · the table and the formula box print 4.82%, the calculation uses 4.823049%
- **Where:** MDX 107 ("בערך 4.82%"), 125 (table "4.82% אפקטיבית"), 245 ("4.82% הם 0.0482").
- **Problem:** the page is honest about 4.823 vs 4.823049 in the open callout (MDX 187) and in the spreadsheet recipe (0.04823049). But the reading table the learner will try to reproduce says "4.82% → 0.3933%", and the formula box says "0.0482". Twelfth root of 1.0482 is 0.3930%; with 4.82 in the whole calculation the first formula is 56,914.56, 149 ₪ above the page's 56,765.24.
- **Fix:** print "4.823049%" in the table and in the dd (and say "הצוות כתב 4.823%" only in the open callout, as now), or write "4.82% (מעוגל; בחישוב 4.823049%)" at MDX 107 and 125.

### 7.2-3 · minor · wording that misreads
- MDX 178: "{37} חודשים, יותר משלוש שנים וקצת פחות מחמש" 37 months is just over three years; "קצת פחות מחמש" is not true. Fix: "קצת יותר משלוש שנים".
- MDX 258: "W₂ חלה רק אם q₂ נמוכה מ־m של יום ההעמדה": m is the contract's monthly rate (the box defines m that way). Fix: "q₂ נמוכה מ־m, ריבית החוזה".
- MDX 139, 211 and elsewhere: "הממוצע של היום" for the average on the repayment day. AUTHORING says never "היום" for live data; here the value is dated 2.8.2026 in the text, but the reader will read "today". Fix: "הממוצע ביום הפירעון" throughout (the video already says "ממוצע של יום ההעמדה"; use the same pattern).
- MDX 100–101, 216: "פרק" for a band of years ("פרק 15–20 שנים") is an odd word for a beginner. "טווח" or "קבוצת שנים" is clearer.

### 7.2-4 · minor · reproduction note for the spreadsheet recipe
- **Where:** MDX 264–265.
- **Problem:** the recipe is right, but the fixture is computed with the unrounded payment (4,974.7179…). A learner who types the displayed 4,974.72 in B2 gets first formula 56,765.26 (two agorot) and a balance of 637,956.77 (three). Nothing is wrong, but "reproduces to the agora" is the page's own claim (Sources).
- **Fix:** one clause: "(מי שמקליד את 4,974.72 המעוגל יקבל הפרש של כמה אגורות)". Same remark in 7.4-5.

### 7.2-5 · minor · exercise polish
- MDX 454 (7.2-7 option 1): "הבנק משלם ללקוח 2,000 ₪" is a typed number; the fact `ex7.v2` is −2,000. Build it from the fact.
- MDX 455: the correct option is again the longest and most hedged (also 7.2-1's pattern). Shorten it.
- Choice exercises put the right option 2nd, 1st, 2nd, 2nd: well spread.
- 7.2-3's error "5.9" with tolerance 0.01 is a good wrong-answer note.

---

## 7.3 — תחנות יציאה ותזמון

The concept (a day, not a window; fixed has none; the fee shrinks as the reset approaches; waiting for a seniority step) is taught with the right amount of "we do not know". The checks of the figures are clean. The problems are three misleading wordings and one confusing exercise premise.

### 7.3-1 · major · "waiting a month costs 3,154.56" is put beside the fee saving as if it were the cost of waiting
- **Where:** MDX 135, 392 (solution of 7.3-6); video cue 27 and frame `qa/video/7-3-t218.png`, "אבל חודש המתנה עולה ₪ 3,154.56 בריבית של ההלוואה הקיימת". The same shape at MDX 155 (a day's interest 58.33 against the index fee 625; the exercise 7.3-4 asks for the "net").
- **Problem:** after "waiting a month saves 2,689.99" the very next sentence says the month costs 3,154.56 of interest. A beginner concludes: 3,154.56 > 2,689.99, so do not wait. But if the loan is being **replaced** by a cheaper one, the real cost of waiting a month is the *difference* in the month's interest between the old loan and the new one (a few hundred shekels at most), not the whole month's interest; the new loan would charge its own interest in that same month. MDX 135 and 392 half-hedge it ("תלוי בהצעה האחרת"); the video does not, and it is the one place the two numbers are on one screen. The index-fee trick (7.3-4) is right only for someone repaying from their own money; the page says "יום ריבית" without saying that.
- **Fix:** say it in one clause where the two numbers meet: "זו הריבית על כל היתרה, ואם ההלוואה הקיימת מוחלפת בחדשה, מה שמחכה עולה רק את ההפרש בין שתי הריביות". In the video replace cue 27 by "אבל חודש המתנה עולה ריבית. כמה — תלוי בהצעה האחרת" and drop the 3,154.56 from the frame, or label it "הריבית על כל היתרה". For 7.3-4 add "(מי שפורע מכספו)" to the exercise.

### 7.3-2 · major · "שלושים אחד" reads as thirty-one
- **Where:** MDX 155 ("שלושים אחד מהריבית של חודש"), 354 (the exercise, the only place that defines the day's interest for the learner), Sources 444.
- **Problem:** in Hebrew "שלושים אחד" is 31. The intended meaning is 1/30 (and the solution at MDX 358 says "שלושים ימים בחודש"). A learner who follows the exercise text computes 400,000 × 0.042 ÷ 12 ÷ 31 = 45.16 and the net 454.84, which the exercise rejects (tolerance 0.05).
- **Fix:** "אחד חלקי שלושים מהריבית של חודש" or "חודש הוא 30 יום", in all three places.

### 7.3-3 · major · exercise 7.3-7 has a premise that, by the lesson's own definitions, makes the friend right
- **Where:** MDX 407 (the stem), 401–405 (options).
- **Problem:** the friend says "ההלוואה שלכם קבועה לחמש שנים, אז בעוד חמש שנים מתחילה תקופה חדשה". In the course's words, a track whose rate starts a new period every five years is the **variable** track of this very lesson (MDX 75, 85: "מסלול משתנה … עדכון כל חמש שנים"), and for it the friend is right: there is an exit station. The stem never says the loan is fixed to the end (case C's is 20 years fixed), so a learner who reasons correctly from the lesson can choose option 2 or 4 and be marked wrong. Option 2 ("הכול נכון: הריבית תתעדכן ב־2031") is not an answer to "מה לא נכון?" at all. Also three of four choice exercises in this lesson have the correct option first (7.3-3, -5, -7).
- **Fix:** put the premise in the stem: "ההלוואה שלכם קבועה לכל 20 השנים, בלי עדכון ריבית. חבר אומר: ״אחרי חמש שנים תפרעו ביום מסוים ותשלמו רק עמלה תפעולית״". Rewrite option 2 as "החבר צודק: יש תחנת יציאה כל חמש שנים". Move the correct option to position 3 or 4.

### 7.3-4 · minor · the case-C averages are not labelled in 7.3
- **Where:** MDX 110–129, 261 (the fixed-track table and the worked example), 441–446 (Sources).
- **Problem:** the brief says the page labels the A and C values "ערכים שהצוות קרא ב־2.8.2026, לא אומת" wherever they drive a number. In 7.3 the fixed-track figures (10,365.95; 8,722.57; 7,575.34; 13,131.56 → 10,441.57 …) rest on them, and the body only says "הממוצעים לא משתנים (הנחת חישוב)". The label is in the component's note and in 7.2, not here.
- **Fix:** one sentence at MDX 110 and one line in the Sources: "הממוצעים של עדי וירון (4.823049% היום, 5.09% בהעמדה) הם ערכים שהצוות קרא ב־2.8.2026, לא אומתו".

### 7.3-5 · minor · the prediction and its answer leave out the assumption that makes the number
- **Where:** MDX 55 (question), 244 (reveal).
- **Problem:** 512.63 for 16.11.2026 is with a timely written notice (the page says so only at MDX 85); without it the fee is higher by 0.1% of the 355,019.76 balance. The prediction question gives the figure with no such condition.
- **Fix:** add "עם הודעה בכתב בזמן" to the question.

### 7.3-6 · minor · readability and notation
- MDX 104 prints "פרק ≤1 שנה" (a symbol with no explanation; AUTHORING: "don't use symbols before explaining them"). Use "עד שנה".
- MDX 83 is one dense paragraph ("מה שבא אחרי העדכון מובא קודם ליום העדכון בריבית של ההלוואה, ורק אחר כך להיום"). The lesson goes from a table of large numbers straight to the formula; AUTHORING asks for small round numbers first. A two-line mental example (one payment before the reset, one balance after it) would make the formula box readable.
- MDX 145, 271, 321: "ימי לוח" is never defined (the course has taught "ימי עסקים"; this is the other word). One parenthesis: "ימי לוח — כל יום, גם שבת וחג".
- MDX 44 and 224: the term cards say lesson 7.3 for "תחנת יציאה" and "נקודת עדכון ריבית", terms 2.7 introduced ("תחנת יציאה" has its own definition in `2-7.json`). `check:terms` passes, but the popover is labelled as if the term is new here. Use `lesson="2.7"`.
- The exercises: 7.3-2 has no `errors` (add 19 and 21: counting one day short or one over); 7.3-4's most natural wrong answer, forgetting the half (1,000 − 46.67 = 953.33), is not in the list though the fact `ex4.balance_pct` (1,000) exists unused.

---

## 7.4 — מחזור: מתי זה כדאי

The most careful of the four: the definitions of the two numbers, the small three-payment example, the direction callout, the three offers that separate the three questions, the break-even and "your position" views, and the multi-track exercise. The math is all correct; the findings are about a letter, a false cross-reference, internal words, and layout.

### 7.4-1 · major · the letter T means the living budget in 4.6, and here it means a fee
- **Where:** MDX 264, 266, 270, 277 (the formula box, "T"), 286.
- **Problem:** the course's one-table rule: "a letter keeps its meaning everywhere … never a table letter for something else". The table gives **T = the living budget (תקציב מחיה)**, first in 4.6. 7.4 defines T as "the early-repayment fee and whatever else is due if repaid today", and MDX 286 says "האותיות כאן הן של שיעורים 0.6 ו־3.10", which is not true for T. A learner who carries 4.6 reads "P + T" as a debt plus a budget. (The other letters of 7.1–7.3, U, Z, W, d, t, are free and each says so; 7.2's A/C handling is exactly right.)
- **Fix:** another letter or word, for example "X" ("עמלת היציאה"), or write "P + עמלת היציאה" and drop the letter; update the dd (MDX 277), the Sources `code` field (MDX 554) and the definitions file text.

### 7.4-2 · major · "in 7.2 the letters A, C and R marked rates" is not what 7.2 did
- **Where:** MDX 286: "בשיעור 7.2 האותיות A, C ו־R סימנו ריביות; כאן C חזרה להיות תשלום."
- **Problem:** 7.2 uses e₁, e₂, q₁, q₂, m, and says only that the **Order** calls the two averages A and C. R is not used anywhere in 7.2, and C is not used for a rate. The sentence misdescribes the lesson the learner just left, and mentions R, a letter the learner has never seen.
- **Fix:** "בשיעור 7.2 כתבנו e₁ ו־e₂ לריביות; כאן C הוא תשלום, כמו בשיעור 0.6".

### 7.4-3 · major · internal words in learner text
- **Where:** MDX 246: "כפי שתועד בריפו של הצוות; לא נבדק מחדש מול האתר" ("repo" is a word the learner has never been told; the stage-6 review flagged the same phrase, 6.1-4 and X-2); MDX 254: "(שאלה לאילון)" (an internal person and an internal question list; `research/stage-7-raw/eylon-7-*.md` is where that belongs).
- **Fix:** "לפי טופס ציבורי של בנק אחד, כפי שתועד אצל הצוות (לא נבדק מחדש מול האתר)"; "שאלה פתוחה, שהצוות לא בירר".

### 7.4-4 · minor · the offers table on a phone, and the definition of "המצב שלכם"
- **Where:** MDX 169–213 (7 columns, min-width 34rem); MDX 235.
- **Problem (table):** at 390px it is 544px in a 341px box. The two columns the argument rests on, "חיסכון בסך הכול" and "המבחן של §15א", are 5th and 7th, so the table's whole point ("passes the test, still costs more") is off-screen. The scroll hint is there; 6.4 and 6.5 solved this with cards below 640px.
- **Problem (definition):** MDX 235 defines "המצב שלכם" as the saving in payments plus the difference in debt; the numbers (b.pos12 = −8,865.63 etc.) also subtract the 2,400 ₪ entry costs (cash12 = −402.15 is already net of them). Without "פחות עלויות הכניסה" the sentence does not reproduce the figure.
- **Fix:** cards below 640px (offer, payment, saving, test first); add "פחות עלויות הכניסה" to MDX 235.

### 7.4-5 · minor · an implied multiplication that does not hold on the printed numbers
- **Where:** MDX 349, "נשארו 203 תשלומים של 4,974.72, ובסך הכול 1,009,867.74" (4,974.72 × 203 = 1,009,868.16; the 42 agorot come from the unrounded payment).
- **Fix:** the callout at MDX 307 says it, but 30 lines earlier and 40 lines away; add "(החישוב בלי עיגול החודשים; ראו ״הנחות החישוב״)" at MDX 349 and 167.

### 7.4-6 · minor · wording
- MDX 316, 319 and the calculator ("ההלוואה החדשה נמשכת …"): "נמשכת" is on AUTHORING's ambiguous list (withdrawn / continues); "נמשכת" → "נגמרת רק אחרי".
- MDX 406: "הבנק מורידה לכם" → "מוריד".
- MDX 127 says "בהחלטה של המפקח", 7.1 says "פסיקה": use one word.
- MDX 48 ("למדנו"), 135 etc.: see X-3.
- Correct options of 7.4-4 and 7.4-7 are the longest and most hedged (the pattern of X-4).
- Offer D's "5.7%" (nominal) is lower than the old contract's 5.90 (nominal) but "does not pass" the test against 5.82 (an effective figure with the fee added). The text explains it ("הוא יקר יותר מהישנה, כולל המחיר של היציאה ממנה"), and it is correct; a one-line "5.7% נומינלי הם 5.85% אפקטיבי, ועוד עלויות הכניסה: 5.89%" near the table would stop a beginner from reading it as a bug.

---

## Cross-lesson items

### X-1 · major · the standard learning-example mark is missing from 7.1, 7.2 and 7.3
- **Where:** 7.1 (MDX 42, 281, 299, 326), 7.2 (MDX 47, 294, 322, 342), 7.3 (MDX 85, 253, 294); the calculators `FiveFees`, `FeeCalculator`, `FeeOverTime`. 7.4 has it (MDX 78–80, 343–345, the calculator's `note`), as do 7.5, 7.6, 7.8 and stage 6.
- **Problem:** the stage brief: "each example carries the standard learning-example mark" (`EXAMPLE_LABEL`: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים"). 7.1–7.3 carry only "בדויים" / "מספרים להמחשה" above the exercise sets, and the worked examples (which use real-looking rates, 5.90%, 4.82%, 5.09%) carry nothing. The only video that shows an illustration mark on a frame is 7.1's title card ("(בדויים)") and 7.4's first card; 7.2 and 7.3's cues call Adi and Yaron by name with no mark.
- **Fix:** the `Callout` "דוגמה לימודית" as in 7.4 before each worked example and under each of the three calculators; one cue or one frame line in each of the three videos ("מספרים להמחשה, לא נתוני שוק").

### X-2 · minor · the shekel sign sits on the reading-start side in the videos (the stage-6 item X-5 again)
- **Where:** every cue and frame that builds an amount as `lr("N ₪")` (7.1 cues 5, 8, 16, 19, 20, 24, 25; 7.2 3–28; 7.3 6–26; 7.4 7–22) and the big values in the frames (for example `qa/video/7-1-t154.png`, "637.96 ₪" and "0 ₪"; 7-2-t126; 7-3-t227; 7-4-t161).
- **Problem:** an LTR isolate around "637.96 ₪" puts the sign right of the digits, so a Hebrew reader meets the sign first. The same frames put it correctly in the small line above the big values ("₪ 637,956.74 × 0.1%"), and 6.1–6.3 did it correctly (the number and the sign are not isolated together). Same finding, same fix as stage 6 X-5: isolate the number only, leave the ₪ outside the isolate.

### X-3 · minor · "we" address
- 7.1 MDX 41, 42, 77, 128, 132; 7.2 46, 47, 76, 187; 7.3 44, 83, 135; 7.4 48, 127, 128, 254: "למדנו / חישבנו / אנחנו לא נוגעים / ראינו". AUTHORING: plural address to the learner. Nit, as in stage 6 X-4.

### X-4 · minor · the videos state the Order's content flat, and label it several cues later
- 7.1 cue 7 ("לפי הצו, חמש עמלות"; the label is cue 13), 7.2 cue 21 ("הבנק גובה את הנמוכה"; cue 29), 7.3 cues 8–12 (cue 19). Fix: "לפי התעתיק של הצוות" in the first cue that states a rule, as 7.4 cue 18 does.
- Choice answers: the correct option is the longest and most hedged in 7.1 (prediction), 7.2-7, 7.3-5, 7.4-4 and 7.4-7; and it is first in 7.1-1, 7.1-3, 7.3-3, 7.3-5, 7.3-7. A learner can guess by length and position.

### X-5 · minor · 4.823 vs 4.823049 and exact vs statement rounding
- The 4.823 / 4.823049 distinction is handled well in 7.2 (callout, sources, spreadsheet recipe) and never contradicted in 7.3 and 7.4 (both use 4.823049); the only leak is the printed "4.82%" (7.2-2).
- The "rounding statement vs exact" distinction: 7.4 is the only lesson that says the existing loan is carried unrounded (MDX 307). A learner who builds the fixture with the course's statement convention (interest rounded each month, payment 4,974.72) gets a balance of 637,956.67, seven agorot from the page's 637,956.74 (3.3's closed form gives the page's number). One sentence in 7.1 at MDX 283 ("מחושב בלי עיגול החודשים, כמו בדוגמה של הצוות") closes it.

### X-6 · minor · other
- No phone screenshots for stage 7: `qa/screens/` stops at 6.9. Run `pnpm screens` once the stage is unlocked in the screenshot profile.
- The terms the popover reminds for ("עמלה", "יתרת חוב" in 7.1) carry `lesson="7.1"` although 3.9 and 2.11 introduced them; harmless, but the popover then says "הוסבר בשיעור 3.9".

---

## Count

0 blockers, 9 major, 18 minor (each minor is a group of small points; 7.1: 1 major + 3 minor; 7.2: 1 major + 4 minor; 7.3: 3 major + 3 minor; 7.4: 3 major + 3 minor; cross-lesson: 1 major + 5 minor).

**The most important items, in the order I would fix them:**
1. **7.3-3:** the premise of exercise 7.3-7 makes the friend right by the lesson's own definition of a variable track; state "fixed for the full 20 years", rewrite option 2, move the correct option.
2. **7.3-2:** "שלושים אחד" is 31 in Hebrew; the exercise's own wording is the only definition and gives a wrong answer for a careful reader. Use "אחד חלקי שלושים" in three places.
3. **7.3-1:** the full month's interest (3,154.56) is shown as the cost of waiting beside the 2,689.99 saving, in the page, the solution and the video; the real cost, when the loan is being replaced, is the difference between the two rates.
4. **7.4-1 and 7.4-2:** T is the living budget in 4.6, and the sentence that explains the letters misdescribes 7.2 (A, C, R were never used there).
5. **7.2-1:** the notes say the rule "saves" 43,882.80; after the reduction it is 35,106.24.
6. **X-1:** the standard learning-example mark is missing from the worked examples, the exercises' sets and the calculators of 7.1–7.3 (and from the videos of 7.2 and 7.3).
7. **7.4-3:** "ריפו" and "שאלה לאילון" in the body.
8. **7.1-1:** the prime reason "dates that cannot be known in advance" is unlabelled and not accurate.
9. **X-2 and 7.4-4:** the shekel sign in the videos; the 7-column offers table on a phone.
