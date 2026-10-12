# Stage 4 beginner review: lessons 4.11–4.15

Date: 2026-10-12

First-round QA of lessons 4.11–4.15. I read them as a beginner who finished stages 0–3 and lessons 4.1–4.10: the deal, property and bank factor cards, how a bank prices, the four banks' public forms, the market and the world, and the workshop (the feasibility page of case A). I edited no source, lesson, component, data or research file. This report is the only file I wrote.

**What I read**
- The built text of `dist/lessons/4-11/` … `4-15/` (built 2026-10-12 11:35), extracted to text, so I read what the learner sees, including cards, components, exercises and the video script.
- The MDX files `src/pages/lessons/4-11.mdx` … `4-15.mdx`, including every exercise's `errors`. Line numbers below are MDX lines.
- `data/lessons/4-11.json` … `4-15.json` (all facts), `src/data/factor-cards.ts` (all 22 cards), `src/data/bank-questionnaires.ts`, `src/data/definitions/4-12.json` … `4-14.json` (there is none for 4.11 and 4.15).
- The components `RateTower`, `FeasibilitySheet`, `QuestionnaireCompare`, and the map data `src/components/big-picture/stage-4.ts` and `stage-4-market.ts`. I bundled all six stage files and checked every node and link by script: no dead link, no duplicate id, no link that appears before its node.
- `public/video/4-11.he.vtt` … `4-15.he.vtt` (all cues at most 55 characters), `video/4-1x.html` for the on-screen labels, and about 30 key frames from `qa/video/4-1x-t*.png`.
- The phone screenshots `qa/screens/phone_lessons_4-11_.png` … `4-15_.png`, cut into 1,500px strips (68 strips).
- `course/AUTHORING.md` (every rule), `course/stage-4-brief.md`, `course/course-map.md` (stage 4, sections 4, 5 and 8), `research/eylon-list.md`, `research/source-map.md` (sections 3 and 4), `research/field-knowledge.md` (every FK id used in these lessons) and the notes `research/notes/brain-calculation.md` and `brain-product-journey.md` where a claim needed its source.
- The four bank records, read-only, at `/home/user/edea-mortgage/context/inputs/*-preapproval-questionnaire.md` and `discount-advisor/README.md`, to check every sentence of 4.13 against what the record shows. I read the Discount record with the Read tool and grep, in parts.
- Not done: I did not run `pnpm check:terms`. I checked term-before-use by hand (grep of later-stage terms over the built text).

**How I checked the math.** I recomputed every displayed number, exercise answer and listed error in plain Python `Decimal` (precision 50), with my own code: Spitzer payments, present value of a payment stream, loan-to-value ratios, date arithmetic, the compound inflation gap, the forward rate between two curve points, and the course's agora rounding. I also computed the breakeven rate for case A myself (about 4.28%; see 4.15).

**Result: every number matches.** I found no wrong figure and no printed equality that fails. All five lessons' worked examples, tables, tower, the pricing example, the feasibility sheet, the 20 exercise answers and every listed error agree with my code to the agora. The faults are claims, labels, clarity and a few cross-lesson contradictions.

Items have an id, a severity (**must fix** / **should fix** / **nit**), the exact place, the problem and a concrete fix. The cross-lesson items at the end are numbered X-n.

A note on the brief: cards 14 and 15 (family; residency) are shown in 4.10, not 4.11 (`shownIn: "4.10"`). 4.11 shows the other 13: 2, 4, 5, 10, 11, 12, 16, 17, 18, 19, 20, 21, 22. I reviewed all of 14–22 and the rest of 4.11's cards.

---

## Lesson 4.11: כרטיסי הגורמים, ב׳: העסקה, הנכס והבנק

**Spot checks that passed.**
- **Math.**
  - 1,000,000 ₪ at 5%: 6,599.56 (240 months) and 5,368.22 (360). The gap is 1,231.34 ₪, which is 18.66%. The "if it fell by a third" figure is 4,399.71 ₪ (6,599.56 × 240 ÷ 360 = 4,399.7067).
  - LTV 75% on the price and 78.95% on 1,900,000 ₪. The replacement-apartment example: 1,680,000 / 1,610,000 / gap 70,000 / equity 720,000 and 790,000.
  - The half table: 1,500,000 / 1,400,000 / 1,000,000, with equity 500,000 / 600,000 / 1,000,000.
  - The exercises: 750,000; 80% (error 73.33); 393.18 (4,446.66 − 4,053.48); total gap 125,254.80 (1,459,252.80 − 1,333,998); 25 December 2026 (errors 31 December and 1 January 2027); 500,000 (error 1,000,000).
  - The cards' own examples: 65% → 60% needs 90,000 ₪; the registration dates (60 and 120 days from 1 November 2026, gap 60 days); 24 days from 20 October 2026 is 13 November, leaving 10 days to the 30th; fees 1,210 ₪ = 0.121%; 25,000 ₪ is 5,000 below the 30,000 line; 5 × 4 = 20 business days.
- **Labels.** The MatchTable ends "בשום שורה לא הייתה עובדה מאומתת". Nothing official is labelled verified. The "lower of price and appraisal" rule is "לא אומת" with the date 2026-10-10 and the pointer to 4.9, and the lesson shows both FK-H-005 and the summary side by side. The card gaps are marked (שאלה פתוחה) on every card I read. Tobi's numbers are written as said, with "the unit was not said".
- **Cards.** All 22 answer all eight questions, every threshold carries a kind, the gaps are visibly open, and I found no invented number. The "ex" 2,000 ₪ per year on card 4 is labelled as a teaching number.
- **Video.** The scene labels the appraisal rule "לא אומת" on screen. The counts (6 + 1 + 6) match the cards.

**4.11-1 · must fix · card 4 "גובה ההלוואה", question 2 (`factor-cards.ts`, card n=4, `why`)**
- **Quote:** "חלק מהעבודה על תיק עולה לבנק אותו דבר בהלוואה קטנה ובגדולה. בגדולה, העלות הזו מתחלקת על יותר שקלים."
- **Problem:** this is a statement of how a bank's costs work, offered as the reason the bank cares about loan size. No source gives it. Tobi said only that the bank prefers "5 files of 2 million" over "10 of 200,000" (FK-H-051), and the source map lists "how a bank prices" as a real gap. The example (question 7) is labelled a teaching number, but the mechanism itself carries no label, so a beginner reads it as why large loans are priced better.
- **Fix:** "הסבר אפשרי של הקורס, לא ממקור: אולי חלק מהעבודה על תיק קבוע בכל גודל. טובי זמיר אמר רק שהבנק מעדיף תיקים גדולים (FK-H-051; ממתין לאישור אילון). אם זה משנה ריבית — לא ידוע." Mark the card's `why` as "השערה של הקורס" or "ידע כלכלי כללי".

**4.11-2 · should fix · other bank-motive sentences with no label (`factor-cards.ts`)**
- Card 16, `why`: "ולקוח שמביא עוד עסקים שווה לו יותר" (the same card says it found no source that an existing customer gets a better rate).
- Card 17, `why`: "ועלות שונה לבנק".
- Card 21, `effect`: "על המחיר: לא על הריבית; הם עלות חודשית נפרדת". This is an unsourced negative ("not on the rate"). The Brain note says only "the bank's own policy is usually the expensive one".
- **Fix:** add "ידע כלכלי כללי" or "השערה של הקורס" to each, or write "לא מצאנו מקור שהם משפיעים על הריבית".

**4.11-3 · should fix · card 19 "הצעות מתחרות", question 3 (`effect`) and 4.12 scenario "offer"**
- **Quote:** "אם המרווח כבר נמוך, הצעה מבנק אחר לא תעזור."
- **Problem:** FK-H-052 says "הצעה **נגדית** לא תעזור" (a counter-offer). The card changes it to an offer from another bank, which is the card's whole subject. The meaning changed. The same wording is in the 4.12 tower scenario note (line 60 of the MDX).
- **Fix:** "אם המרווח כבר נמוך, הצעה נגדית (של הבנק עצמו) לא תעזור (טובי זמיר)", or quote FK-H-052 as it is.

**4.11-4 · should fix · speaker of FK-H-005 and FK-H-043 (lines 137, 421; cards 11 and 20)**
- **Quote:** "ואילון אמר ב־2026-08-05 שמודדים מול ערך השמאות".
- **Problem:** `field-knowledge.md` records FK-H-005 and FK-H-043 as "אילון (התיוג בהקלטה מעורבב), 2026-08-05", from the meeting with Tobi. The lesson names Eylon without the caveat, so Eylon is asked to approve something that may be Tobi's. The same applies to 4.15 lines 88 and 271 and the card.
- **Fix:** "נאמר בפגישה ב־2026-08-05 (הקלטה שבה הדובר לא ברור: אילון או טובי)".

**4.11-5 · should fix · unexplained jargon a beginner cannot follow (lines 111–112, card 19, exercise 8)**
- "מרווח יעד", "רצפת רווחיות", "מתחתיה צריך מנהל", "הפקיד פותח גבוה ממה שמותר לו" and "מותר לו 0.5". Nothing says what "opens" means (the first number of an offer), that "allowed" is the lowest margin the clerk may offer, or that 0.5 is read as percentage points (which the lesson only says in 4.12).
- **Fix:** one sentence in "מי אמר את זה", in plain words: "פקיד מציע בהתחלה מרווח גבוה (0.7–0.8), ומותר לו לרדת עד 0.5 בלי לשאול מנהל. היחידה לא נאמרה; אנחנו מניחים נקודות אחוז." And one line for "מדרגה", which the lesson uses 17 times and never defines (see X-2).

**4.11-6 · nit · card 12 example and card 16 example**
- Card 12: the 60-day payment term and 120 days to register are teaching inputs with no `הנחת חישוב` source line. Add one. The Hebrew "הלוח־זמנים" should be "לוח הזמנים". Card 20 has "ו־טובי"; it should be "וטובי" (the maqaf is not used before a Hebrew name).
- Card 16's example counts three monthly statements as three "documents" ("6 מסמכים לכל לווה"). Write "3 תלושים ותדפיסים של 3 חודשים".

**4.11-7 · nit · bidi on the phone**
- On a 390px screen card 2 shows the BoI bands as "(90/75/60/45/30)" although the text is "30/45/60/75/90". In an RTL line the slash sequence flips. Write "30, 45, 60, 75 ו־90" or wrap it in an LTR isolate.

**4.11-8 · nit · the half table repeats card 10's example**
- 2,000,000 ₪ with 1,500,000 / 1,400,000 / 1,000,000 is exactly the example of the open card "סוג הנכס", so the half-solved table can be copied from the card above it. Use another price.

---

## Lesson 4.12: איך בנק מתמחר

**Spot checks that passed.**
- **Math.**
  - The opening prediction: 5,558.32 at 4.5% and 5,729.97 at 4.8% (1,000,000 ₪, 300 months). The gap is 171.65 ₪ a month, and 171.65 × 300 = 51,495 ₪ exactly. The wrong options are 3,000 and 75,000.
  - The tower start: 0.15 + 0.3 + 0.2 − 0.1 − 0.05 + 0.1 = 0.6, and 4 + 0.6 = 4.6.
  - The worked example (800,000 ₪, 20 years, anchor 3.5): 3.9% and 4.2%, payments 4,805.79 and 4,932.57, gap 126.78, total 30,427.20.
  - The half table: 5,061.20 at 4.5%, and the extras 126.78 and 255.41.
  - The rule of thumb: 600.72 and 616.57 per 100,000 ₪, gap 15.85, which is "×8" for 800,000 (126.80 against the exact 126.78: "בערך" is right).
  - The exercises: 4.35; 109.10 (error 3,220.93, 3,111.83); 39,276 (errors 109.10 and 1,800).
- **Labelling of the tower.** The note under the tower says the sizes are teaching numbers and that no source gave a size for any layer. The scenarios carry a source kind each. The page says in plain words "אנחנו יודעים את המבנה, ולא יודעים את הגדלים", and "אלה לא שש שורות שבנק פרסם: זו הדרך של הקורס". That is the right framing. The problems are in what surrounds it (4.12-1 to 4.12-6).
- **Exercises.** Option feedback for 4.12-3 (the friend's "quarter percent") and 4.12-8 ("one bank always cheapest") is correct and helpful. The unit assumption (0.5 and 0.8 as percentage points) is labelled "הנחה שלנו" in the prediction, in the sources and in the video.

**4.12-1 · must fix · the six layers are presented as how the bank arrives at the margin; a price effect is stated as fact**
- **Where and quotes:**
  - Callout "חמש שאלות", "מה זה?" (line 463): "הדרך שבה הבנק מגיע למרווח שהוא כותב בהצעה: ששת הרכיבים שהקורס מסדר".
  - `src/data/definitions/4-12.json`, "דרישות הון": "הון עולה לבנק יותר מכסף של מפקידים, ולכן יש לזה השפעה על המחיר. כמה — לא ידוע."
  - The map card `offered_rate.role` (4.12): "המרווח הוא מה שהבנק מחליט עליו לתיק הזה, בהתאם לשכבות של סיכון, הון, תחרות, ערך הלקוח ותיאבון."
  - The map card `capital_requirements.role`: "ולכן הלוואה שדורשת יותר הון עולה לו יותר."
- **Problem:**
  - Line 114 and the sources say the six layers are the course's own way to order what is known. The five-questions sentence, the map card and the definition say the opposite: this is how the bank decides. A beginner who reads only the callout (the part most people remember) leaves believing a bank prices by six layers.
  - The source map (section 3.1) says it plainly: the price effect of capital, and of thresholds, has no written source. The definition and the map card turn "no source says how much" into "it affects the price".
- **Fix:**
  - Callout: "הדרך שהקורס מסדר את מה שידוע על המרווח: שישה רכיבים. אף בנק לא פרסם שהוא מתמחר כך."
  - Definition: "אפשר להניח שהון יקר יותר מכסף של מפקידים (ידע כלכלי כללי); אם וכמה זה מגיע למחיר — לא ידוע."
  - `offered_rate.role`: "המרווח הוא מה שהבנק קובע לתיק. אילו שיקולים נכנסים בו ובאיזה משקל — לא ידוע; הקורס מסדר אותם בשש שכבות כדי לשאול על כל אחת."

**4.12-2 · must fix · the Bank of Israel rate is in the anchor and in the first layer of the spread, and the lesson never says how they differ**
- **Where:**
  - Line 110: the anchor "בא מהשוק (ריבית בנק ישראל, הפריים, תשואות אג״ח)".
  - The table row "עלות המימון של הבנק", "מה משפיע עליו": "ריבית בנק ישראל, תשואות אג״ח, מה שהוא משלם למפקידים".
  - The tower scenario "ריבית בנק ישראל עולה" (lines 45–48): the anchor goes up and the layer "עלות המימון" goes up.
  - MatchTable row 1 (line 204): "ריבית בנק ישראל עלתה" → answer "עלות המימון", "והפריים זזה איתה".
- **Problem:** in a prime track the Bank of Israel rate already moves the anchor (the prime). If it also raises the cost-of-funding layer inside the spread, the same rise is counted twice, and the learner cannot tell what the first layer is for. The course's own map says the right thing and the lesson does not: the link `cost_of_money → spread` reads "הבנק צריך לכסות אותה (ובמסלולים שהעוגן שלהם זז איתה, היא כבר בעוגן)". Line 240 warns about double counting only for risk and capital. MatchTable row 1 teaches the learner that a Bank of Israel move is a "cost of funding" move, which contradicts that map link.
- **Fix:** add a short paragraph after the table: "אם העוגן כבר זז עם ריבית בנק ישראל (פריים), השכבה ״עלות המימון״ היא רק מה שמעבר לעוגן: למשל מה שהבנק משלם למפקידים מעל הריבית הזו. מה גודלה — לא ידוע." Change the scenario so that "boi" moves the anchor only, and change MatchTable row 1 (or remove it).

**4.12-3 · should fix · the table says "target margin is the same for every file" and the tower says it depends on the customer (line 146)**
- **Quote:** "ויש מרווח יעד, אחיד לכל התיקים כיום (טובי זמיר…)".
- **Problem:** FK-H-050 continues: "פעם הוא השתנה לפי לקוח ושיעור מימון". The lesson leaves that half out, so the beginner reads two incompatible things: a uniform target margin, and six layers that each depend on the customer. The reconciliation is the most informative sentence Tobi gave about pricing.
- **Fix:** "לפי טובי זמיר, היום מרווח היעד זהה לכל תיק; פעם הוא השתנה לפי לקוח ושיעור מימון. כלומר ייתכן שההבדל בין לקוחות לא בא מהיעד אלא ממה שהפקיד פותח ומה שמותר לו (FK-H-071)."
- Also column 3 of the table ("מה משפיע עליו") lists drivers with no label in four of six rows. The row "ערך הלקוח" lists "חשבון, עסקים נוספים", which 4.11 (card 16) says it found no source for. Label the column as the course's own list, or remove the row's unsourced items.

**4.12-4 · should fix · fixed-rate pricing described as a method (line 241)**
- **Quote:** "במסלול קבוע אין עוגן שנכתב בחוזה (שיעור 2.5): הבנק קובע ריבית אחת. ההיגיון דומה: הוא מתחיל מעלות הכסף לתקופה ארוכה (שיעור 0.12), ומוסיף."
- **Problem:** it is labelled "ידע כלכלי כללי", but it states how a bank prices a fixed track. 4.14 (line 200) says the opposite: "הקורס לא יודע איך בנק מסוים מתרגם את העקום להצעה שלו — לא אומת". Two lessons in a row disagree on whether this is known.
- **Fix:** "במסלול קבוע אין עוגן בחוזה. כסף לתקופה ארוכה עולה לפי העקום (שיעור 0.12); איך בנק מתרגם את זה להצעה — לא ידוע (ראו 4.14)."

**4.12-5 · should fix · the tower's start values and the scenario arrows**
- **Start values.** The note says "הגדלים הם מספרים להמחשה שלכם", but the starting numbers (risk 0.3, capital 0.2, cost 0.15, …) are the course's choice. The bars give a ranking (risk is the tallest). The second sentence ("וגם לא את ההתחלה (העוגן מצויר קבוע…)") is unclear. **Fix:** "גם הגדלים שבהתחלה הם בחירה של הקורס להמחשה, לא נתונים של בנק; אין בהם דירוג." Put the note above the tower, not as a small grey caption beneath.
- **Arrows.** The directions come from the course's reading of Tobi, but they are shown with his source label.
  - "ההלוואה גדולה יותר → ערך הלקוח ↓ אולי יורדת" (kind: ידע מהשטח), while the table (row "ערך הלקוח") says "האם זה מוריד מרווח — לא ידוע". The scenario's own text says "הוא לא אמר שהמרווח יורד"; the arrow contradicts it.
  - "רכישה, ולא מחזור → תיאבון ↑ אולי עולה": Tobi did not attribute the purchase premium to appetite.
  - "ריבית בנק ישראל עולה → העוגן ↑ עולה": certain for the prime, not for fixed anchors, as 4.14 says.
- **Fix:** use "?" for those arrows ("לא ברור לאן"), and add "הכיוון הוא קריאה של הקורס".

**4.12-6 · should fix · exercise 6 and the sentence on line 151**
- **Exercise 4.12-6, option 4:** "הון לא משפיע על הריבית, כי הוא כסף של הבנק". The feedback says "לא נכון להגיד שלא". The course's own position is that it does not know whether capital reaches the price. An option that says "no effect" is marked as wrong, not as "unknown". The correct option itself is fine.
- **Line 151:** "מי שאומר לכם מספר כזה, ממציא." It accuses; someone may have a real source. **Fix:** "מי שאומר לכם מספר כזה — שאלו מאיפה הוא."
- **Fix for the exercise:** change the feedback to "זה לא ידוע לקורס: אין מקור שאומר שכן או שלא. לכן ההצהרה ״הון לא משפיע״ אינה ידועה אף היא."

**4.12-7 · should fix · the rule of thumb is titled "one percentage point" but computes 0.3; its answer is given before exercise 5**
- The heading (line 269) "נקודת אחוז אחת של מרווח" and the summary line 481 "נקודת אחוז אחת של מרווח היא סכום גדול" are not what the paragraph computes: it is the gap of 0.3 (`w.gap`), 15.85 ₪ per 100,000 ₪. A learner who reads "one point" will multiply the wrong thing.
- **Exercise 5** asks for the same 15.85 ₪ that the rule of thumb printed three paragraphs above, with the full subtraction. The exercise is answered on the page. **Fix:** change the exercise numbers (for example anchor 3.2, spreads 0.4 and 0.9), or change the heading to "פער של 0.3 נקודת אחוז" and leave exercise 5 on another loan.

**4.12-8 · should fix · a garbled sentence (line 236, step 3)**
- **Quote:** "והריבית 4 + 0.6 = 4.6% בשיעור הזה, כמו בטבלאות, נכתוב את המספרים באחוזים ובנקודות אחוז."
- **Problem:** the sentence has no break; it reads as one run-on with two thoughts. The unit of r in the box above is a decimal (0.046) and the equation is in percent, and the sentence tries to say so in the middle.
- **Fix:** "הריבית: <M>4 + 0.6 = 4.6%</M>. בשיעור הזה נכתוב ריביות באחוזים ומרווחים בנקודות אחוז; בנוסחה, כמו בשיעור 2.1, אלה מספרים עשרוניים."

**4.12-9 · should fix · "נקודות אחוז" with a value of 1 or less (AUTHORING)**
- The house rule is "singular up to one": "0.25 נקודת אחוז". 4.12 writes the plural in 11 places: "0.2 נקודות אחוז" (line 151 and exercise 6), "0.3 נקודות אחוז" (the tower note, the worked example's "הפער", exercise 7's solution), "0.4 נקודות אחוז" and "0.5/0.55/0.6 נקודות אחוז" (the worked example, exercises 2 and 4, the formula box, step 3, the "what you should see" list). 4.14 follows the rule ("0.25 נקודת אחוז").
- **Fix:** replace the plural by "נקודת אחוז" wherever the value is 1 or less. Only 1.5 stays plural.

**4.12-10 · should fix · phone layout: the table's key column is hidden (`min-w-[34rem]`)**
- On a 390px screen the six-component table shows "הרכיב" and "מה הבנק שואל" and cuts "מה משפיע עליו" mid-word ("(שיעורים 0.9–0.12)" and the Tobi labels start outside the frame). The fourth column, "מה ידוע על הגודל", which carries the lesson's whole point ("לא ידוע"), is off-screen to the left. The layout's hint exists but is small.
- **Fix:** put "מה ידוע על הגודל" in column 2, or render the table as six cards on a phone.

**4.12-11 · nit · the prediction and the video use only the top of Tobi's range**
- Tobi said "0.7–0.8" (FK-H-071). The prediction (`pred.opened`) and the video cue ("פקיד פותח ב־0.8 כשמותר לו 0.5") drop the 0.7. Write "0.7–0.8; נחשב כאן 0.8".

---

## Lesson 4.13: ארבעת הבנקים

I checked every bank claim in the lesson, the comparison component and the card data against the four records. What matched: Leumi "כ־60 שדות", children to 18, tenure ranges, "הכנסה שנתית נטו לפי אישור רו״ח", "יש התחייבויות מעל 18 חודשים?" and the rent exception, the 40,000–1,500,000 ₪ and 4–30 year ranges, the consent expiry, "סימולציה בלבד"; Mizrahi "138 שאלות (כולל החזרה...)", children to 18, tenure ranges, the 20 equity sources (I counted them), "תמהיל גנרי או עצמאי?", the advisors' "שלב 0"; Poalim "עד גיל 21", "ממוצע 3 חודשים אחרונים ללא בונוסים", 12–360 months, "ההצעה תהיה גנרית", the family-seller routing, "עד 50% מערך הנכס"; Discount tenure ranges, "ממוצעת נטו" and "הכנסה שנתית (ברוטו) לפי שומה", "שנה וחצי ומעלה", "לכמות הדירות... אחוז המימון", ages 18–90, "30 שנה, בריבית של 5.5%, במסלול קבוע", and the advisor channel (1–4 borrowers, birth date from 17, README dated 2026-09-17).

**Spot checks that passed.**
- **Math.** Case A: 2,200,000 − 560,000 = 1,640,000; 140,000 above the 1,500,000 limit; 560,000 − 200,000 = 360,000. Self-employed: 210,000 ÷ 12 = 17,500 (error 8,750 = 210,000 ÷ 24). Any-purpose loan: 50% of 1,800,000 = 900,000 (errors 1,260,000 and 1,350,000). Discount payment: 5,677.89 ₪ for 1,000,000 ₪ at 5.5% over 360 months (errors 6,140.87 for 300 months and 4,583.33 interest only). Kids: ages 4/19/20 give 1 and 3; ages 2/16/19/20 give 2, 2, 4 and 6 (household).
- **Names and branding.** Real bank names appear on this page and in the video, as text, with no logo and no colour. Case A gets no track, mix or offer, and the 40.4% appears nowhere in the learner-visible text.
- **Distinctions kept.** "הטופס הוא בקשה", "טופס יכול להשתנות", "ריבית שראיתם אצל בנק אחד היא נקודה אחת, לא תיאור של הבנק", "גבול של טופס הוא לא תשובה של הבנק" and exercise 6 ("the shorter form means the bank is easier") are well handled.

**4.13-1 · must fix · the map says "everyone asks about residency, foreign tax and public figures" (`stage-4.ts`, link `bank_form → residency`, 4.13)**
- **Quote:** "כולם שואלים על תושבות, מס זר ואיש ציבור".
- **Problem:** the records do not show that. Leumi and Poalim ask about foreign tax residence and citizenship (Leumi also about public figures). Mizrahi's record has no such question. Discount's entry screen lists conditions ("אזרח ישראל… השירות אינו מיועד לתושבי חוץ… למי שאינו איש ציבור"), which is not a question. The lesson itself says elsewhere "ברישום של שני הטפסים האחרים אין שאלה כזו" for another topic. Card 15 is more careful ("השאלונים שואלים…"), but the link is a flat "כולם".
- **Fix:** "לאומי והפועלים שואלים על תושבות מס ואזרחות נוספת; דיסקונט מציג תנאים בכניסה; במזרחי־טפחות הרישום לא מראה שאלה כזו". Check the `bank_form → family` link too: "הבנקים מגדירים ״ילד״ אחרת" is true for 3 of 4 (see X-4).

**4.13-2 · must fix · `QuestionnaireCompare` topic "סכום, תקופה ומסלולים" says all four calculate on the screen (`bank-questionnaires.ts`, `loan.point`)**
- **Quote:** "שני טפסים מאפשרים לבקש הרכב מסלולים משלכם; בכולם החישוב שעל המסך הוא הדגמה, לא הצעה."
- **Problem:** the record has a monthly payment shown only at Leumi ("סימולציה בלבד") and Discount ("לפי פריסה ל־30 שנה, בריבית של 5.5%"). Poalim has a "יכולת החזר" screen showing a maximum mortgage; Mizrahi has no calculation in the record. The lesson text itself (line 74) says "בשני טפסים" and then adds that "הבנק כותב לידו שזו הדגמה", but Discount's text says only what the figure assumes; it never says "demonstration". So "בכולם", and "הדגמה" for Discount, go beyond the record.
- **Fix:** "בשני הטפסים שמציגים החזר חודשי, הוא נכתב עם הנחות (לאומי: ״סימולציה בלבד״; דיסקונט: 30 שנה ו־5.5%)". Same fix for line 74 (the quote "ההחזר החודשי הצפוי" is Leumi's label only; Discount's is "ההחזר החודשי המוצג").

**4.13-3 · should fix · motives are attributed to all four banks (exercise 1, the topic "homes", callout "למה זה קיים")**
- **Where:** exercise 4.13-1's correct answer, "כי מזה נגזרת תקרת שיעור המימון", and its feedback "ודיסקונט אפילו כותב את זה"; the comparison's `homes.point` "כי ממנה נגזרת תקרת שיעור המימון"; the callout "הנתונים שהכללים של בנק ישראל נשענים עליהם".
- **Problem:** line 88 says it right: "הקורס לא יודע אם זו הסיבה היחידה לכל שאלה". Only Discount's form states the reason; Poalim's shows the maximum LTV beside the answer; Leumi and Mizrahi say nothing. The exercise asks "למה?" about all four and gives one reason as the right one.
- **Fix:** ask "איזה כלל תלוי בתשובה הזו, לפי הוראה 329 (לא אומת)?", or ask "מה כתוב בטופס של דיסקונט על הסיבה?". Use "ייתכן" in the `point`.

**4.13-4 · should fix · "the team went through the four forms and recorded every field, option and condition" (line 72)**
- **Problem:** the records say less. The Poalim record: "המקור שנמסר נקטע" (the source was cut off), written "מתוך תוכן שאלון שנמסר על ידי אדן", with no "required" column because the source does not state it. The Mizrahi record also says "מתוך תוכן שאלון שנמסר על ידי אדן". The Discount record says steps 2–4 were taken from the bank's content API and the bundle, not walked live. Only the Poalim cut-off is mentioned (in Sources).
- **Fix:** "הצוות רשם את הטפסים ב־25 באוגוסט 2026, חלקם מתוכן שנמסר לו ולא ממעבר חי; הרישום של הפועלים נקטע בסופו". Add this to the Sources item too.

**4.13-5 · should fix · "הרישום" is never explained**
- The lesson says "הרישום" about 10 times ("בדיסקונט הרישום מזכיר…", "ברישום של שני הטפסים האחרים…"). It means the team's written record. The beginner knows "רישום" from the land registry (4.9, card 12). **Fix:** at first use, "(לאורך השיעור, ״הרישום״ הוא מה שהצוות כתב על כל טופס)".

**4.13-6 · should fix · the "only lesson with real bank names" claim is false (line 72)**
- **Quote:** "זה השיעור היחיד בקורס שבו מופיעים שמות של בנקים אמיתיים".
- **Problem:** the Sources of lesson 0.4 (line 462) name "לאומי ודיסקונט" ("לוחות תשלומים שפרסמו שני בנקים"). The brief says real names only in 4.13 and the page repeats that, so either the sentence or 0.4 is wrong.
- **Fix:** in 0.4 write "שני בנקים" without names; keep 4.13's sentence. Or soften 4.13: "השיעור שבו מתוארים הטפסים של בנקים בשמותיהם".

**4.13-7 · should fix · the callout "למה דווקא ארבעה בנקים" (line 132) and the "four banks" decision**
- **Quote:** "Mogi עובדת עם עד ארבעה בנקים במקביל על כל תיק (החלטה של Mogi, 2026-08-13). אלה ארבעת הבנקים שהטפסים שלהם נרשמו."
- **Problem:** the note behind it (`brain-calculation.md`, 2026-08-13) says the *case model* assumes up to four banks in parallel, and that "how many banks stay alive per file is policy, not model". It does not say Mogi chose these four banks. The sentence "אלה ארבעת הבנקים" joins two unrelated facts. No who. See X-5.
- **Fix:** "מודל התיק של Mogi מניח עד ארבעה בנקים במקביל (החלטה של Mogi מ־2026-08-13; כמה בנקים בפועל לכל תיק — מדיניות פתוחה). רשמנו ארבעה טפסים כי אלה הטפסים שהיו לצוות; הקורס לא אומר שאין בנקים אחרים."

**4.13-8 · should fix · exercise 3 is answered on the page**
- The explanation (line 100, "הכנסה {17,500}") prints the answer 17,500 ₪, the "what you should see" item 3 shows "210,000 ÷ 12 = 17,500", and the video frame shows it. Exercise 4.13-3 then asks for 210,000 ÷ 12. **Fix:** change the exercise's number (for example 186,000 → 15,500), or remove 17,500 from line 100.

**4.13-9 · should fix · "כמה זמן לוקח כל שלב בכל בנק" is called unknown while a form gives a time, and the card says something else**
- The Poalim record ends: "תשובה ב־SMS או בטלפון, עד 21 ימי עסקים". Card 22 says the directive transcription gives "5 ימי עסקים (7 בקטגוריות שהבנק הגדיר)". The lesson (line 127) lists the time per step as unknown and omits the Poalim figure. The 5-day rule and the 21 days are in tension (source map, contradictions 5 and 16 and gap "משך כל שלב").
- **Fix:** add to the list of what each form says: "הפועלים: ״עד 21 ימי עסקים״ (הטופס)", and one sentence: "זה שונה מ־5 ימי העסקים שבתעתיק של ההוראה (לא אומת); הקורס לא מכריע".

**4.13-10 · should fix · the examples' children and the Poalim question "האם הם בחזקתך" (prediction, half-solved)**
- Line 94 says Poalim also asks whether the children are in your custody. The prediction (ages 4/19/20) and the half-solved example (ages 2/16/19/20, "וכולם גרים בבית") count 19- and 20-year-olds as children for Poalim without saying they are dependents. **Fix:** add "וכולם בחזקתם".

**4.13-11 · should fix · case A, step 4: "בשלושה טפסים כותבים אותם כמו שהם" (line 192)**
- Of the three, Mizrahi's field is "מה סכום ההכנסה החודשי?" with no word about net or gross, and Discount asks for "ממוצעת נטו" (an average of an unspecified number of months). Writing 12,400 "as it is" is exactly the unit trap the lesson warns about two sections earlier. **Fix:** "בלאומי: נטו חודשי; במזרחי־טפחות: הטופס לא אומר נטו או ברוטו; בדיסקונט: ממוצע נטו, בלי לומר כמה חודשים — צריך לברר".

**4.13-12 · nit · quotations and small wording**
- Line 186 (step 1) quotes Mizrahi as "האם בבעלותך דירה?". The record (and the comparison component) reads "האם בבעלותך דירה או חלק מדירה?". Do not shorten a quotation inside the marks.
- Line 188: "הטופס הציבורי פשוט לא יקבל את הסכום". The record shows a range, not that the form refuses; write "הטווח שבטופס הוא עד 1,500,000 ₪".
- Not used, and worth one line: Discount's minimum term is 5 years (the record, "המינימום הוא 5 שנים"), which supports FK-H-007; and for a second borrower Discount's text is "הוצאות שמשולמות כבר שנה וחצי ומעלה" (already paid, not "will continue"), a different meaning of the 18-month rule.

---

## Lesson 4.14: השוק והעולם

**Spot checks that passed.**
- **Math.**
  - Bank of Israel rate to prime (+1.5) to a "prime minus 0.5" track: 0.1 → 1.6 → 1.1; 4.75 → 6.25 → 5.75; 4.5 → 6 → 5.5; 3.5 → 5 → 4.5; 3.25 → 4.75 → 4.25.
  - The payments (500,000 ₪, 300 months): 1,907.08 / 3,145.53 / 3,070.44 / 2,779.16 / 2,708.69; the September gap 70.47 and the 2023–2020 gap 1,238.45.
  - The inflation gap by division: 1.96% (4 and 2), 1.44% (4.74 and 3.25), 1.94% (5 and 3; the error 2%).
  - The forward rate: (1.038817^10 ÷ 1.035221^5)^(1/5) − 1 = 4.2425%, shown 4.24, which equals the Brain note's 4.2425%. And (1.036^10 ÷ 1.03^5)^(1/5) − 1 = 4.2035% (4.20).
  - 8.8 → 10 billion is +13.64%.
  - Exercise 3 (400,000 ₪, 200 months): 2,846.46 and 2,794.66, difference 51.80; the "no margin" error 52.89 differs from the answer by more than the 1 ₪ tolerance, so it cannot be mistaken for "about right".
- **Never a forecast.** "אף דוגמה כאן אינה תחזית" is stated, the callout "מה השרשרת לא עושה" repeats it, and the Mogi forecast decision is attached to the Bank of Israel's published forecast data.
- **The chain.** Six links, each with a mechanism, a dated example and a "how sure" column; the contradiction between the 1.44% (February) and the 1.80% (July) is shown rather than hidden. The February averages are marked "לא ידוע אם חוזיים או אפקטיביים".
- **Links of the market layer.** No dead link. The expected observations (what feeds inflation expectations, what the events node can move, which track is not connected to the Bank of Israel rate) match the map.

**4.14-1 · should fix · labels on the dated market data**
- **Main table of five decisions (line 153).** There is no "לא אומת" or source near it. The reader meets "6 ביולי 2026 · ירידה מ־3.75%" and "1 בספטמבר 2026 · ירידה מ־3.5%" as facts. The sources say the 3.75% decision (25 May 2026) comes from **one summary only**; the body says nothing. The label appears only in the half-solved intro and in Sources.
- **Dates.** The example is "1 בספטמבר 2026", but the Sources say the decision is "בתוקף מ־3 בספטמבר". The table, the video bar chart and the tracks are all "taken on the day of the decision".
- **Video.** The key frames at t=15, 22, 75, 85 and 226 (the 1 September card, the prime card, the five-decision bar chart, the events list) show dates and rates with no "לא אומת" on screen. The captions arrive later (`video/4-14.html` lines 209 and 304) or only in the subtitles.
- **Fix:** a one-line caption above the table: "הריביות לפי תקצירים של הודעות רשמיות, חיפוש ב־2026-10-10; לא אומת. ההחלטה של 25.5.2026 מתקציר אחד". Change "1 בספטמבר" to "החלטה מ־1 בספטמבר (בתוקף מ־3 בספטמבר)". Keep the label on screen for the whole of each scene in the video.

**4.14-2 · should fix · "prime = BoI + 1.5" is unlabelled everywhere except the first mention**
- It is handled as unverified in the first mention (line 145: "נכון ל־9 באוקטובר 2026… (לא אומת)"), in the table ("התוספת לא אומתה"), in caveat 1 and in the sources. But it reappears as a plain fact in: the summary bullet "ריבית בנק ישראל ← פריים ← התשלום **באותו גודל**"; the `PredictionReveal` ("הפריים היא ריבית בנק ישראל ועוד תוספת, ולכן ההורדה… עוברת אליה ישירות"); exercise 4.14-1's correct feedback "ולכן היא זזה באותו גודל"; the "חמש שאלות" ("הפריים נגזרת מריבית בנק ישראל"); and the map card chain.
- The source map flags exactly this: one Brain page attributes the 1.5 to Directive 451, a consumer page of the Bank of Israel calls it a fixed add-on, and the primary source is unread.
- **Fix:** add "(לפי תוספת של 1.5 נקודות אחוז; לא אומת)" to the summary, the reveal and exercise 1's feedback.

**4.14-3 · should fix · "היום" in the body and the video (the house rule says never "today")**
- Line 180: "התוספת של 1.5 נקודות אחוז נבדקה רק להיום". The video cue at 90–101 s says "נבדקה להיום בלבד". **Fix:** "נבדקה רק נכון ל־9 באוקטובר 2026".

**4.14-4 · should fix · exercise 7 and line 216: the counterexample is not an event**
- **Quote (line 216):** "ב־2020 ובינואר 2024 הריבית ירדה, ובמאי 2023 היא עלתה (ראו בטבלה). **אירוע אינו מכתיב כיוון**". Exercise 4.14-7's correct option: "בשתי דוגמאות מתוארכות הריבית ירדה בזמן אירוע… ובדוגמה אחרת מהשיעור היא עלתה", and the feedback of the wrong options: "בדוגמאות של השיעור אפילו ההחלטה במאי 2023 הייתה עלייה".
- **Problem:** the table gives the reason for 22 May 2023 as "פעילות גבוהה, שוק עבודה הדוק ואינפלציה רחבה": it is not a war or a crisis. A rise with no crisis does not answer "when there is a war or a crisis the rate always falls". The learner is taught a conclusion ("an event does not dictate a direction") that the dated examples do not show. Two cuts at two events do not show "always" either, but they do not refute it.
- **Fix:** write what the examples show: "בשתי הדוגמאות של משבר או מלחמה הריבית ירדה; שתי דוגמאות לא מראות ש״תמיד״; והדוגמה של 2023 (עלייה) לא הייתה אירוע ביטחוני — היא רק מראה שהריבית יכולה לעלות". For the exercise, ask what two examples can and cannot show ("שתי דוגמאות אינן כלל").

**4.14-5 · should fix · the "demand" link: the example does not measure what the link says**
- The table row says "ביקוש לדיור ← נפח הבקשות: יותר קונים, יותר בקשות", but the example is the **volume of new mortgages the banks gave** (10 against 8.8 billion ₪ a month), not requests. Demand is never measured, and nothing in the chain connects it to the rate a client is offered (the lesson says so, correctly, in "מה לא ידוע"). The map link `boi_rate → housing_demand` ("ריבית גבוהה מייקרת משכנתא ומקטינה ביקוש") is next to an example from a period in which, per the same lesson, the rate had fallen.
- **Fix:** rename the row "נפח משכנתאות חדשות" and write what it is evidence of ("כמה משכנתאות ניתנו; לא כמה ביקשו"). Say once that the link is weak: "הקשר בין הנפח לריבית שתקבלו — לא ידוע".

**4.14-6 · should fix · "הבנק" is ambiguous (line 214)**
- **Quote:** "בתוך ימים פרסם בנק ישראל הוראת שעה (…), שבין היתר אומרת שהבנק ישקול להאריך אישורים עקרוניים".
- **Problem:** "הבנק" after "בנק ישראל" reads as the Bank of Israel, but the directive says the lending bank. AUTHORING: avoid "the bank" when the lender is not clear. **Fix:** "שהבנק המלווה ישקול…".

**4.14-7 · should fix · the map card of inflation expectations (`stage-4-market.ts`, `inflation_expectations.role`)**
- **Quote:** "ועל פיהן נקבעת התחזית למסלולים הצמודים בחישובים לפי הוראת בנק ישראל".
- **Problem:** a statement about what a Bank of Israel directive does, with no label. The note says "שיעורים 0.12 ו־4.14" only. The source is the team's transcription of the Brain (`brain-calculation.md`: "Expected inflation = (1+nominal)÷(1+real)−1", Directive 451 forecast table), which is `לא אומת`.
- **Fix:** "(לפי תעתיק בצוות של הוראת בנק ישראל; לא אומת)".

**4.14-8 · should fix · phone layout: two tables lose their key columns**
- The six-link table (`min-w-[640px]`) shows "החוליה" and "המנגנון" on a phone; "דוגמה מתוארכת" and "כמה בטוח", the two columns that carry the dates and the labels, are off-screen.
- The five-decision table (`min-w-[560px]`) shows "ההחלטה" and "ריבית בנק ישראל" only; the prime, the track rate and the payment (the column the paragraph below talks about, "1,238.45") are hidden.
- **Fix:** put the dated example and the label next to the link name, and give the decisions table "ההחלטה, הפריים, התשלום" first; or render both as cards.

**4.14-9 · nit · wording and small items**
- `minutes: 35` and 4.15 `minutes: 50` against the map's 15–30 (see X-8).
- The message of exercise 3's error (`ex3.err_nomargin`) types "5% ואז 4.75%" in the string; they are the prime before and after, so they should come from `d2026a.prime` and `d2026b.prime`.
- Sources, item 3: "ציפיות האינפלציה שהצוות חישב **מהן**" can be read as "from the nominal points shown", which cannot give inflation expectations (they need the real curve too). Write "מהעקום הנומינלי והריאלי".
- Line 192, "ציפיות האינפלציה שחישבו מעקום האג״ח" has the same ambiguity.
- The Brain note says the published expectations match the team's within 0.00002; the lesson does not need it, but "לפי אותה קריאה" could say "פורסמו ונבדקו אצל הצוות".

---

## Lesson 4.15: סדנה: דף ההיתכנות של התיק המרכזי

**Spot checks that passed.**
- **Math (from the stated limits and assumptions, with my own code).**
  - Recognised income 12,400 + 9,300 = 21,700. The car loan has 26 months left, so it counts: disposable 20,250. After 8 payments 18 remain and the loan stops counting: disposable 21,700.
  - Largest payment: 50% of 20,250 = 10,125; 40% = 8,100. After the car loan drops: 10,850 and 8,680.
  - Financing ratio: 1,640,000 ÷ 2,200,000 = 74.5454…% (shown 74.55); the ceiling loan is 1,650,000, so the room is 10,000. The loan needs a value of at least 2,186,666.67, so the appraiser may go below the price by at most 13,333.33. At 2,150,000 the ratio is 76.2791% (76.28), the ceiling loan is 1,612,500, and 27,500 is missing.
  - Structure: variable at most 1,093,333.33 (rounded down), fixed at least 546,666.67, and the two add up to exactly 1,640,000.00.
  - Payment to loan under the course's assumption (360 months): the loan that 8,100 carries is 1,696,636.05 / 1,598,625.39 / 1,508,881.10 at 4% / 4.5% / 5%; 10,125 carries 2,120,795.06 / 1,998,281.73 / 1,886,101.37. The gaps against 1,640,000 are +56,636.05 / −41,374.61 / −131,118.90. After the car loan drops, 8,680 carries 1,713,094.86 (4.5%) and 1,616,924.44 (5%).
  - Hand check of the page's conclusion: the payment a 1,640,000 ₪ loan needs is 7,829.61 at 4%, 8,309.64 at 4.5% and 8,803.87 at 5%. Against the 8,100 limit that is inside at 4% and above at 4.5% and 5%. The breakeven rate is about 4.283%. So "בהנחה גבוהה מספיק הוא מעליו" holds, and a learner can check it by hand with `=PV(4.5%/12,360,-8100)`.
  - Ronit and Alon: 1,100,000; disposable 16,000 (the 10-month car loan is dropped); 8,000 and 6,400; LTV 73.33% with 25,000 of room; 6,400 carries 1,263,111.42, 163,111.42 above the loan.
  - The exercise answers and errors: 21,700 (12,400); 20,250 (21,700 and 23,150); 8 (26); 8,100 (10,125 and 8,680); 76.28 (74.55); 1,598,625.39 (2,916,000).
- **Case A.** No track, no mix, no offer, and no 40.4% in any learner-visible text. Every payment shown rests on the stated assumption (360 months, 4% / 4.5% / 5%, "לא הצעת בנק ולא נתוני שוק"). The 18-month rule, the financing ratio and the largest payment are all on the page. It agrees with 4.2 (which already uses 20,250 and 8 payments).
- **Page conclusion.** "מה הדף אומר" / "מה הדף לא אומר", the explicit "לא אומת" row for bank policy, the five things the page does not say (approval, recognised income, equity documents, bank policy, age limits) and the tie to stage 6's exercise are exactly what the brief asks for.
- **Phone.** The sheet component is a stack of cards, and works well at 390px.

**4.15-1 · must fix · the financing ratio is measured against the price here, and against the lower of price and appraisal in 4.9 and 4.11**
- **Quote (line 88):** "(2) שיעור המימון נמדד מול המחיר, אלא אם נאמר אחרת. זו שאלה פתוחה: ההוראה מדברת על המחיר, ואילון אמר שמדדים מול השווי של השמאי (FK-H-005…)". Line 252: "ומה אם הבנק מודד מול השווי של השמאי?". Solution 6 and the Sources repeat "מהתעתיק של הוראה 329 עולה שברירת המחדל היא המחיר".
- **Problem:** lesson 4.9 (line 84, "מאז מצאנו עוד מקור") and 4.11 (line 103) teach, from the search summary of 2026-10-10, that the value used is "הנמוך מבין הערכת השמאי ועלות הנכס בהסכם הרכישה" (לא אומת). 4.15 ignores it and presents "price or appraisal?" as the open choice. Under the 4.9 rule the second line of the sheet ("what if the appraiser says 2,150,000") is not a what-if, it is the rule. The beginner has just learned one thing in 4.9 and 4.11 and is told another here. The sheet's slider also goes above the price (to 2,300,000), where the 4.9 rule would still use the price.
- **Fix:** write "לפי תקציר החיפוש משיעורים 4.9 ו־4.11 (לא אומת), מודדים מול הנמוך מבין המחיר לשמאות; אילון אמר ״מול השמאות״ (FK-H-005). כל עוד אין שמאות, הדף משתמש במחיר." Cap the slider's value at the price, or say that a higher value changes nothing.

**4.15-2 · should fix · the limits are labelled "לא אומת" once, then shown as plain rules**
- Line 113 labels them ("כפי שהצוות תעתק אותם (לא אומת, ממתין לבדיקה מול ההוראה)"). But the seven-row table (line 92), the "full page" table (line 376: "50%: איסור", "75%: איסור", "שני שלישים: איסור", "30 שנה: איסור"), the interactive sheet's rows ("מעל התקרה: אסור") and the video carry no label except the last row ("מדיניות כל בנק: לא אומת"). A beginner who skips line 113 sees "איסור" as a fact of law.
- **Fix:** a caption line under both tables and in the component header: "הגבולות לפי תעתיק של הוראה 329 בצוות; לא אומת". Change "איסור" to "תקרה (לא אומת)".

**4.15-3 · should fix · "חסרים 27,500 של הלוואה" is the wrong way round**
- **Where:** `FeasibilitySheet.vue`, the line text when the ratio is above the ceiling ("חסרים … של הלוואה כדי לחזור לתקרה"), and the "what you should see" item 2 ("חסרים 27,500 של הלוואה").
- **Problem:** the loan is too big, not too small. What is missing is equity. A beginner reads "I lack a loan".
- **Fix:** "ההלוואה גדולה מדי ב־27,500 ₪: צריך הון עצמי גדול יותר או הלוואה קטנה יותר". (The solution to exercise 6 says it right: "חסרים 27,500: הון עצמי גדול יותר או הלוואה קטנה יותר".)

**4.15-4 · should fix · the step from a payment to a loan is the hardest and it is explained in one unclear sentence**
- **Quote (step 5, line 131):** "נשתמש בנוסחה של שיעור 3.1 בכיוון ההפוך, הסכום של התשלומים מוחזר להיום". "מוחזר" ("returned") is not "מהוונים". Throughout the page, "ההחזר נושא הלוואה של…" and the FillTable headers "ההלוואה שהחזר בסף 40% נושא" are unusual Hebrew for "מספיק להלוואה של". A beginner stops here: why does a payment "carry" a loan?
- **Fix:** step 5: "ההלוואה היא הערך של כל התשלומים היום: ההחזר כפול סכום גורמי ההיוון (שיעור 3.1). אם ההחזר המרבי הוא 6,400 ₪ ל־360 חודשים בריבית 4.5%, זו הלוואה של עד 1,263,111.42 ₪." Replace "נושא" by "מספיק להלוואה של" or "מממן הלוואה של".

**4.15-5 · should fix · exercises: one is answered above it; one shows an empty unit; one error is missing**
- Exercise 4.15-4 asks for 8,100 ₪. The paragraph directly above it prints "20,250 × 40 ÷ 100 = 8,100 ₪". **Fix:** drop the numeric line from the paragraph before the exercise, or change the exercise (for example ask for the threshold after the car loan stops counting).
- Exercise 4.15-3 has `unit=""`, so the learner sees "התשובה שלכם ()" with empty brackets (the built page, line 93 of the text). Use `unit="תשלומים"`.
- Exercise 4.15-3 lists only the error 26. The common slip is off by one: 9 ("עד שנשארים פחות מ־18") and 18. Add 9 with "נשארים 18 אחרי 8 תשלומים, וההלוואה כבר לא ״מעל 18״".

**4.15-6 · should fix · wording of the case's source ("המפה", "מפת הקורס") and "four open things"**
- Line 80: "אלה כל המספרים שהמפה נותנת". In 4.10–4.14 "המפה" is the interactive big-picture map; here it means `course-map.md`. The sheet component's caption repeats "רק עם מספרי המפה", and the first Sources item says "לפי מפת הקורס, סעיף 8" (a file the learner never sees). **Fix:** "אלה כל הנתונים של התיק, ורק עליהם הדף נשען", and cite the case without "section 8".
- Line 337 says the sheet shows "ארבעה דברים שהתיק משאיר פתוחים", one of which is "כמה תשלומים נשארו על הלוואת הרכב". That number is given (26); the slider is a what-if on time passing. **Fix:** "ארבעה דברים שאתם מזיזים".

**4.15-7 · should fix · the navigation button of the built page**
- The text ends "ומכאן — בדיקת הסיום של שלב 4", but the built page `dist/lessons/4-15` ends with the button "השיעור הבא (בכתיבה) 5.1", which links to "/", and so did the phone screenshots. `src/pages/checks/4.mdx` was created at 11:34:42, and the page was built at 11:35:08. `lastInStage && isCheckBuilt(4)` is evaluated by an `import.meta.glob` at build start, so I think the build predates the file. `dist/checks/4/index.html` exists.
- **Fix:** rebuild and check that the last button reads "סוף השלב · בדיקת הסיום של שלב 4" (as 3.12 does). If it still reads "5.1", stage 4's check is not registered.

**4.15-8 · nit · small items**
- The final table (line 376), `min-w-[560px]`, on a phone hides "איפה עומדים" and cuts the first digit of "546,666.67" ("46,666.67 ₪" at the left edge). See X-9.
- "ההחזר הגבוה ביותר: סף ההון" in the seven-row table says "מגבלה רגולטורית" for the 50% row and "סף הון, לא איסור" for the 40% row; clear. But the first row, "הכנסה פנויה והלוואת הרכב", is "כלל של הוראה 329 (תעתיק בצוות)", while the netting itself (deduct from income) is a Mogi decision (Brain 67436545, Eylon 2026-10-07, Eden 2026-10-08, as the Sources say). Say both in the row.
- Line 121 types "9,000" and "7,000" through `nv(9000)`. They are inputs of `w.recognised`, so they are allowed; leave.
- `minutes: 50`: the longest lesson in the course (see X-8).

---

## Cross-lesson items

**X-1 · should fix · internal ids and file paths in text the learner reads**
- **Exercise feedback:** 4.11-1 ("FK-H-004"), 4.11-8 ("FK-H-071"), 4.12-8 ("FK-H-054").
- **Body:** 4.12 line 149 ("Brain 67469313, לא אומת"); 4.15 lines 88, 209 and 271 ("FK-H-005", "FK-H-012").
- **Map:** `credit_law` (4.8) note "(Brain 6455298)".
- **Sources items** (these are the learner's "מקורות" block) show repo paths: "research/source-map.md", "research/field-knowledge.md", "research/notes/…", "context/inputs/…", "מפת הקורס, סעיף 8". The FK id belongs in Sources next to the label; it should not sit in a sentence.
- **Fix:** move the ids to the Sources items; in the body say who and when. Replace the repo paths in Sources by "רישום פנימי של הצוות".

**X-2 · should fix · "מדרגה" is a stage-6 term used 21 times in 4.11–4.12 with no definition**
- The map lists "סף, מדרגה" under 6.2, and nothing defines it before. 4.11 uses it in a core sentence, in card 2, in the exercise 4.11-1 and in the "מי אמר" list. The beginner has to guess that a "tier" means the point where the price changes. **Fix:** define it once at first use in 4.11 ("מדרגה: נקודה שבה, לפי טובי זמיר, משהו משתנה, כאן הון הבנק"), add it to the 4.11 definitions file and fix the map line, or use `<Later>`.

**X-3 · should fix · "the banks approach a credit bureau already at the request" (cards 8 and 19) against what 4.13 shows**
- Card 8 (`thresholds`): "הבנקים פונים ללשכת אשראי כבר בבקשה לאישור עקרוני"; card 19 (`cost`): "כל בנק פונה ללשכת אשראי (כרטיס 8)". 4.13 shows that two of the four forms say so (Leumi, Discount) and that in the other two the record shows no such question.
- **Fix:** "שני הטפסים שהצוות רשם (בנק א׳ ובנק ב׳)" in the cards, or "בטפסים של שניים מארבעת הבנקים".

**X-4 · should fix · "three banks' children up to 18" (the 4.10 map node `family`) against 4.13**
- **Quote:** "עד גיל 18 בשאלונים של שלושה בנקים ועד 21 בשאלון של בנק אחד". 4.13 says Leumi and Mizrahi (18), Poalim (21), and for Discount the record does not say. **Fix:** "בשני בנקים עד 18, באחד עד 21, ובאחד הרישום לא אומר".

**X-5 · should fix · the "up to four banks in parallel" Mogi decision, no who, and a wider meaning than the source**
- It appears in the 4.11 MatchTable row 3 ("החלטה מאוגוסט 2026"), the 4.11, 4.12 and 4.13 Sources, cards 19 and 22, and the 4.13 callout. The only support is `brain-calculation.md`: "the case model assumes up to four banks in parallel… how many stay alive is policy, not model", 2026-08-13, with no name. AUTHORING: a Mogi decision carries who and when.
- **Fix:** "הנחה של מודל התיק של Mogi (2026-08-13, <מי החליט>): עד ארבעה בנקים במקביל; כמה בנקים בפועל — מדיניות פתוחה". Ask for the name from the Brain page 16875545, which no one has read. The same applies to "המייסדים מטפלים בכל תיק ביד" (2026-10-01).

**X-6 · should fix · the pricing links on the map read as facts (`stage-4.ts`, 4.12)**
- `credit_risk → spread`: "הבנק מוסיף למרווח על סיכון". `capital_requirements → spread`: "הון עולה כסף, והבנק מוסיף למרווח". `competition → spread`: "בנק שמתחרה על התיק מוריד אותו". `client_relationship → customer_value`: "לקוח שמביא עוד עסקים שווה יותר". `risk_appetite → spread`: "כמה הוא רוצה סוג כזה של הלוואה עכשיו".
- These are a click away from the lesson's own warning that no source says which layers move the price. "בנק שמתחרה על התיק מוריד אותו" is a price effect Tobi did not say (he said the opposite when the margin is already low). Only `customer_value → spread` ("אולי מרווח נמוך יותר") and the 4.11 links are hedged.
- **Fix:** "אולי / לא ידוע" on each of these labels, with the source kind in brackets, as the 4.11 links do.

**X-7 · should fix · conflicting field claims on the digital form, shown without saying they conflict (card 22)**
- `effect`: "בטופס הדיגיטלי ״לרוב האנשים ניתן ׳אישור מהיר׳ במקום״ (אילון)" and `thresholds`: "״זה לא אישור עקרוני מה שאתה מגיש במחשב… בקשה לאישור עקרוני״ (טובי זמיר)". They disagree (FK-H-019 against FK-H-021), and 4.13 teaches "הטופס הוא בקשה". **Fix:** one line: "אילון וטובי אומרים דברים שונים על מה קורה אחרי הטופס; הטפסים עצמם לא אומרים". Also card 19 and card 22 "לפנות לכמה בנקים" and "להגיש לכמה בנקים במקביל" omit the tension between FK-H-073 ("כמה שיותר") and FK-H-055 ("2–3 בנקים"), which the source map lists.

**X-8 · nit · lesson length**
- `minutes`: 4.14 is 35 and 4.15 is 50. The map and AUTHORING say every lesson takes 15–30 minutes (3.7's 35 was flagged earlier). Trim, or record why the workshop is longer.

**X-9 · should fix · phone layout of the wide tables**
- 4.12 (six components, `min-w-[34rem]`), 4.14 (the chain, `min-w-[640px]`; the decisions, `min-w-[560px]`) and 4.15 (the final page, `min-w-[560px]`) hide on a 390px screen the column the text talks about (see 4.12-10, 4.14-8, 4.15-8). AUTHORING: keep that column early (on the right). The wide-table hint is there but small.

**X-10 · should fix · the Eylon list is not updated for stage 4 (`research/eylon-list.md`)**
- It stops at stage 3. The stage-4 lessons in this range use these FK ids, all "ממתין לאישור אילון":
  - FK-H-001, 004, 005, 006, 007, 012, 014, 015, 018, 019, 021, 033, 034, 042, 043, 046, 048, 050, 051, 052, 053, 054, 057, 060, 062, 071, 074, 082, 100, 103.
  - Cards 14 and 15 are shown in 4.10; the others in 4.11, 4.13, 4.14 and 4.15.
- Add them with "איפה בקורס". FK-H-005 and FK-H-043 need the speaker caveat from 4.11-4. FK-H-060 and FK-H-103 are shown as "לא נלמד" (fine).

**X-11 · question · naming a private banker**
- "טובי זמיר" is named many times (every card of the bank and process groups, 4.11, 4.12, 4.14, the definitions and the map) as the single source of most of the bank-side knowledge (employer not named, "כ־4–5 שנים בבנק"), in a course that will be public. AUTHORING asks for who and when, so the lessons follow it, but the person is not on the team and spoke in a meeting. Ask whether he agreed to be named; if not, use "בנקאי חיצוני (מקור יחיד, 2026-08-05)" and keep the name in the Eylon list.

---

## Questions for Eylon or for an official source (collected)

1. FK-H-005: who said "financing is measured against the appraisal" (Eylon or Tobi), and does it contradict the "lower of price and appraisal" summary? (4.11, 4.15.)
2. The directive wording for the financing-ratio basis: price, appraisal, or the lower. (Open in 1.2 and 4.9.)
3. What "מרווח יעד… היום זהה לכל תיק" means next to "פעם הוא השתנה לפי לקוח ושיעור מימון" (FK-H-050), and what unit 0.5 and 0.8 are in (FK-H-071).
4. Whether an existing customer gets a better rate (card 16), and what a LTV tier is worth (card 2). Both are open questions 5 and 11 of the questionnaire.
5. Poalim's "עד 21 ימי עסקים" against the 5 and 7 business days of the directive (4.13-9).
6. The primary source of "prime = Bank of Israel + 1.5" (Directive 451, or a convention). (4.14, source map section 3.2.)
7. Who made the decision "up to four banks in parallel" on 2026-08-13 (X-5).

---

## Summary

| Lesson | must fix | should fix | nit |
|---|---|---|---|
| 4.11 | 1 | 4 | 3 |
| 4.12 | 2 | 8 | 1 |
| 4.13 | 2 | 9 | 1 |
| 4.14 | 0 | 8 | 1 |
| 4.15 | 1 | 6 | 1 |
| Cross | 0 | 9 | 1 (plus 1 question, X-11) |

**The math is sound.** I recomputed every displayed number, every exercise answer and every listed error, and the whole of case A's sheet from the stated limits and assumptions (the 50% and 40% payments, the 18-month rule and its 8 payments, the 74.55% financing ratio and its 10,000 ₪ of room, the loan each payment carries, and the 4.28% breakeven rate), and they all agree. There is no failing equality. The only numeric weaknesses are exercises whose answers are printed on the page (4.12-5, 4.13-3, 4.15-4).

**The big risk, inventing how banks price, is mostly avoided and leaks in five places.** The sources say plainly that how a bank prices is unknown, 4.12 says so in its own words, and every size is "לא ידוע". Where it leaks:
1. 4.11 card 4 explains why banks like big loans with a fixed-cost mechanism no source gives (4.11-1).
2. The 4.12 callout "מה זה?", the "דרישות הון" definition and the map's `offered_rate` card describe the six layers as the bank's method and capital as a price driver (4.12-1).
3. The pricing links on the map are categorical ("בנק שמתחרה על התיק מוריד אותו", X-6).
4. 4.12 line 241 says how a fixed-rate bank starts, while 4.14 says this is unknown (4.12-4).
5. The tower mixes the Bank of Israel rate in the anchor and in the cost layer without saying how they differ, and the lesson contradicts the map's own caution (4.12-2).

**What a beginner will trip on:**
1. **4.12.** What the "cost of funding" layer is, if the Bank of Israel rate is already the anchor (4.12-2), and why the target margin is "the same for every file" when six layers depend on the customer (4.12-3).
2. **4.13.** A few sentences go beyond the record: "everyone asks about residency" and "all four show a demonstration calculation" (4.13-1, 4.13-2), and the lesson claims the team recorded every field of every form while the Poalim record is cut and two records came from content given to the team (4.13-4).
3. **4.15.** The lesson says the ratio basis is the price while 4.9 and 4.11 taught the lower of price and appraisal (4.15-1), and the step from a payment to a loan is one unclear sentence (4.15-4).
4. **Labels.** The dated market data in 4.14 (the table, the video frames) and the 329 limits in 4.15's tables are labelled once and then shown as plain facts (4.14-1, 4.14-2, 4.15-2).
5. **Phone.** On a 390px screen the key columns of four tables are off-screen (X-9).

**What works well:** the three-colour habit (limit, price, process), the MatchTable of labels, the "שלוש שאלות לכל מספר" tools, the half-solved tables, the "no rule, no forecast" framing of 4.14 (once the 2023 example is fixed), the sheet component on the phone, and case A staying out of tracks, mix and offer until stage 5. Real bank names are only in 4.13, as text, with no logo.
