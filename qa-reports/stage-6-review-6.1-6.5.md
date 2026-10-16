# QA report: lessons 6.1–6.5, read as a beginner

Date: 2026-10-16. Reviewer: first-round QA. I edited no source, lesson, component, data or research file. This report is the only file I wrote. My scratch scripts, screenshots and the throw-away web server I used for the browser checks are outside the project (my own scratchpad folder).

**The reader:** someone who finished stages 0–5 (money, the mortgage world, tracks and rates, schedules, present value and IRR, the bank's view of income and obligations, Directive 329, the three kinds of numbers, the pre-approval, comparing offers, Directive 451, the mix and its goals) and has never planned how to bring a file to a bank.

**What I read:**
- the five MDX files `src/pages/lessons/6-{1..5}.mdx`, with every exercise `errors` list, FillTable, CardSort, MatchTable config and `<Sources>` block;
- the built pages `dist/lessons/6-{1..5}/` (visible text and DOM; they are newer than the MDX, so they are current);
- `public/video/6-{1..5}.he.vtt` and all 73 key frames `qa/video/6-{1..5}-t*.png` (6.1: 10, 6.2: 15, 6.3: 12, 6.4: 17, 6.5: 19), looked at as contact sheets and, where text was dense, at full size, plus the scene sources `video/6-X.html` for the on-screen text;
- `data/lessons/6-{1..5}.json` (every fact) and `src/data/definitions/6-{1..5}.json`;
- the components `BigPictureMap` (as used in 6.1, with `mapUpTo("6.1")`), `PositioningCalculator`, `LeverMap` (and `src/data/lever-map.ts`), `LeverPrice`, `TwoStories`, `CardSort`, and `src/lib/calc/positioning.ts` for the line list the calculator shows;
- the stage-6 cards and links in `src/components/big-picture/stage-6.ts` for lessons 6.1–6.5, and the map graph as a whole (all `stage-*.ts` links) for the 6.1 tasks;
- `src/data/case-a-mix.ts`, `src/data/case-a-levers.ts` (the case-A inputs, read as data, not imported);
- `course/AUTHORING.md` (each rule checked), `course/stage-6-brief.md`, `course/course-map.md` (stage 6 rows), `research/field-knowledge.md` (FK-H-004, 012, 014, 015, 029, 030, 050, 052, 057), lesson 4.2's text (the 18-payment edge) and the earlier report `qa-reports/stage-5-review-5.1-5.5.md`, whose format I follow;
- the phone: my own Chromium at 390px over every table of the five pages and a screenshot of each component (map, calculator, lever map, lever price, two stories, card sort). **The supplied `qa/screens/phone_lessons_6-*_.png` do not exist** (the folder stops at stage 5; stage 6 has not been through `pnpm screens`), so everything about the phone below is mine. Stage 6 is locked until the stage-5 check is passed; I opened it by setting the progress key `mogi-course:check:5` in the test browser.

**Math check.** Everything below was recomputed independently in plain Python `Decimal`, in my own scripts that import nothing from the project (case-A inputs typed in from `case-a-mix.ts` as data): annuity payment per track (rate ÷ 1200, payment rounded to the agora), the mix payment as the sum of the track payments, the ratio over the disposable income (income less the car loan while more than 18 payments are left), the loan after a cut or a closing (tracks scaled in proportion), the smallest cut in steps of 1,000 for each line, the full statement schedule (interest rounded to the agora each month, last payment closing the balance, no re-set when a reset month keeps the same rate) for the totals, and the stress scenario (prime plus 2 from month 13, the variable track plus 2 from month 61) for the highest payment.
- 6.1: loan 1,640,000 and 74.55%; room 10,000; payment 8,181.30; ratio 40.4% (and 40.40 over 20,250, 37.70 over 21,700); until-drop 8; closing: loan 1,676,000, 76.18%, over by 1.18, 26,000 back, payment 8,360.88, ratio 38.53; the two equity actions (73.64 / 39.91, 72.27 / 39.17); the Michal-and-Ido exercise (72.22, 73.33).
- 6.2: all 25 case-A line figures (the cuts 17,000 / 220,000 / 423,000 and their ratios 39.98 / 34.98 / 29.98, 16,000 giving 40.01, 100,000 giving 37.94, the payment and income distances for 40, 35, 30, the 320,000 and 760,000 for 60% and 40% financing, the loan after each cut and its financing ratio); the small family (4,200 on 10,000); Dana and Roi (7,591.79 and 42.18%; 22 years 7,168.63 and 39.83%; totals 1,822,029.60 and 1,892,518.32; 28 years 6,287.76); exercise 5 (768.17 and 149,138.40).
- 6.3: 17,000 / 39.98 / 73.77; the 25-year ratio 44.41; payoff 36,000 vs 37,700; half-half payment 8,068.47, gain 112.83, ratio 39.84, totals 2,945,264.34 and 2,904,646.23 (gap 40,618.11); 8 payments, 11,600 paid, 37.7%; exercises 2–4.
- 6.4: the small example (5,845.90 / 5,368.22 / 29.23 / 26.84 / totals 1,753,770.27 and 1,932,555.88); all seven levers of case A (ratio, cash, total payments, highest stress payment, financing ratio, remaining reserve, left to live on); the price per point (40,476.19; 13,333.33; 74,805.69); 420-month and 300-month payments and totals; the two-thirds line 1,093,333.33 and the mix shift (variable 1,257,000, over by 163,666.67); stress maxima 9,435.33 / 9,334.41 / 9,643.25 / 8,958.24 / 9,587.82.
- 6.5: gap 2.70, price per point 13,333.33, left to live on 12,068.70 and 13,518.70, Avi's assessments (7,500 average, 8,000 latest, 39.4 / 38.19 / 32.22, gaps 1.21 and 7.18), the gift share 35.71%, Dana and Yoav (8,800 / 13,200 / 800; 8,000; 7,500 gives 14,500).
- I also parsed every `=` equality in the five built pages and evaluated both sides (54 distinct ones).

**Every result matches the module. Every printed equality holds on its printed numbers.** The one equality that needs a word is `8,181.30 ÷ 20,250 = 40.4` (6.4, MDX 124): it is a fraction written as a percent, where every other ratio in the stage writes `× 100`. I found no arithmetic error in a worked example, table, exercise answer or listed error. Three agreements are to the agora, not exact, and none is printed in a lesson: the closing-loan total and stress figures (64,655.73 and 9,643.25 in the module, 64,655.75 and 9,643.27 in mine) differ because the 1,676,000 is split into agorot across the three tracks and my split sums to 1,676,000.01; and the 25-year payment (8,992.91 in the module, 8,992.92 as the sum of three rounded track payments), which only the calculator shows (6.4-6). Case A's figures (40.4%, 37.7%, 39.98%, the 36,000 payoff, 76.18%, 38.53%, 8,181.30, 8,360.88) are exact. The numbers are right; the problems are in a formula that prints mirrored (6.2-1), a wrong label on a correct number (6.4-1), an exercise whose wrong-answer note contradicts the lesson (6.1-1), the 18-payment edge answered two different ways (X-1), the red line's own reasoning (6.5-1), and a set of labels.

**Phone.** No page scrolls sideways (document width 390 inside a 390 viewport) and no element sticks out of the page. The tables: 6.4 and 6.5 swap their wide table for cards below 640px, which is the right pattern. Four reading tables are wider than the phone and scroll inside a box (6.2: the three-ways table 544px in a 326px box; 6.3: the four-actions table 544px). Two of them lose the column the text discusses next (6.2-11, 6.3-6). The FillTables fit (332px in a 358px box), except the 6.3 one, which is 338px with 362px of content (4px of side scroll). The five components all lay out and work at 390px; the problems there are small (6.2-11, 6.1-6).

**Case A and case B.** Case A appears in the stage with the figures the brief gives (price 2,200,000, equity 560,000, loan 1,640,000, LTV 74.55%, the initial mix, ratio 40.4%, the car loan of 1,450 for 26 more months); every one of them traces to `case-a-mix.ts`. The levers' extra assumptions (reserve 40,000, payoff 36,000, a parent's 4,000, a gift of 200,000) are each labelled as the course's assumption on the page and in Sources. Case B (Avi and Michal) appears only in 6.5, as documentation of income and the red line, and its numbers match stage 4 (declared 11,000, recognised 7,500, price 1,650,000, equity 520,000). The other families are invented and named as such ("בדויה", "לא התיק של נועם ושירה"). **No violation.** One name clash: 6.1's exercise family "מיכל ועידו" shares a first name with case B's Michal (6.1-6).

**What is right (checked and clean):**
- **The 30%–35% numbers are hypotheses, and 6.2 says so in plain words**: "זו השערה לבדיקה … כל המספרים כאן הם מספרי הדגמה, ואל תציגו אותם ללקוח כמו עובדה" (6.2, MDX 110). They never appear as how banks decide. (Their *label* is wrong, see 6.2-2; their treatment is right.)
- **The step is admitted to be unknown in the sentence that matters**: "גודל המדרגה לא ידוע לנו … אפשר לחשב כמה עולה להגיע לקו, אי אפשר לחשב כמה שווה להגיע אליו" (6.2, MDX 122–129), and 6.4 repeats it in the recommendation's own "החיסרון" line (MDX 337).
- **No "עובדה מאומתת"** in any of the five pages, subtitles, frames or components. Sources kinds used: `לא אומת`, `ידע מהשטח` (each "ממתין לאישור אילון"), `הנחת חישוב`, `מחקר / הצעה`, `החלטה של Mogi`, `ידע מתמטי כללי`, `ידע כלכלי כללי`, `בדיקת חישוב`.
- **No real bank's name or branding.** The only portal in the stage (FK-H-030) is written "הפורטל של בנק אחד"; the fictional banks are "בנק א׳, ב׳".
- **Every lever page shows what the client gains, what the client pays, and when not to pull it** (6.3 cards, 6.4 sections and its two-sided price panel, "אין מנוף חינם"), and 6.4 and 6.5 both say that a file that passes the bank and strangles the family is a failure, with a computed example (Dana and Yoav, 800 short a month).
- **6.4 states its limits honestly**: three levers cross a wall (financing ratio, term, two-thirds variable), the wall figures are computed (1,093,333.33 vs 1,257,000), and the "price per point" is only compared inside one currency.
- **The red line (6.5) uses forbidden practices only as counter-examples**, each with its reason, and teaches no method: no sentence says how to do any of them, every one is a wrong option, a wrong card or story 2 beside a true story 1, and the legal consequences are written as "חששות, לא קביעות" with five questions to a lawyer (6.5, MDX 218–233; Sources 567). The decision to ask the client before sending a figure that contradicts what they said is labelled "החלטה של Mogi" with its date. One reasoning problem is in 6.5-1.
- **The LLM-never-computes line is not at risk**: every number on the pages comes from a fact; I found no number typed in the body that a calculation produces, apart from the small items in 6.2-9.

---

## 6.1 — התמונה הכוללת

The idea is right and the order is right: the map's arrows come in three kinds (compute, rule, guess), one action is followed down the chain, and then the same action is shown pulling two numbers in opposite directions (closing the car loan from the equity lowers the payment ratio and pushes the financing ratio over the ceiling). The prediction and its reveal are the best use of case A in the stage. What is left:

### 6.1-1 · blocker · exercise 1's wrong-answer note says the opposite of what the lesson teaches
- **Where:** MDX 273–280 (exercise 6.1-1), the note on option 2 (MDX 274): "שווי הנכס והון עצמי — הם משפיעים על שיעור המימון, לא על יחס ההחזר".
- **Problem:** the whole lesson says equity moves **both** ratios ("פעולה אחת בהון העצמי מזיזה את שניהם", MDX 158; the new 6.1 arrow `equity → pti`, "יותר הון עצמי — פחות הלוואה, ולכן פחות החזר", `stage-6.ts` links; the worked example, MDX 206–214). The map the question says to read ("לפי המפה") has **nine** arrows into "יחס החזר" (first payment, disposable income, same property, Directive 329, mix, term, loan amount, equity, existing obligations). So "which two factors are connected directly" has no unique answer on this map, and the note on option 2 tells the learner a falsehood the lesson spends 20 minutes refuting. A learner who picked option 2 is told equity does not touch the payment ratio.
- **Fix:** ask what the question can honestly ask: "ביחס ההחזר, מה המונה ומה המכנה?" (answer: ההחזר הראשון וההכנסה הפנויה, MDX 273 stays correct), with option 2's note changed to "הון עצמי משפיע על יחס ההחזר דרך גובה ההלוואה, לא ישירות כמונה או כמכנה". Do not use "ישירות" about the map.

### 6.1-2 · should fix · the payoff assumption is stated backwards
- **Where:** MDX 118: "סכום התשלומים שנשארו הוא פחות מ־1,450 ₪ כפול 26, ומה שצריך כדי לסגור אותה היום נמוך מזה".
- **Problem:** the payments left *are* 1,450 × 26 = 37,700 (Sources, MDX 412 says exactly that). "Less than 1,450 times 26" is false, and "lower than this" then has no referent. The sentence also asks the reader to multiply, which AUTHORING forbids in prose.
- **Fix:** "(הנחת חישוב: התשלומים שנשארו הם 37,700 ₪ בלי ריבית, וסכום הסגירה היום נמוך מזה)", with 37,700 from the fact (`l3.sum_left` exists in 6.3's data).

### 6.1-3 · should fix · task 1 asks for "two factors", the card shows four; and one new arrow carries a bank claim with no label
- **Where:** MDX 151 (task 1) and 158 (expected observation 1); `stage-6.ts:287`.
- **Problem:** "גובה ההלוואה: אילו שני גורמים הוא מזיז?" The card lists four outgoing arrows (financing ratio, monthly payment, customer value, payment ratio). The expected answer names two. The new 6.1 arrow `ltv → bank_policy`, "גם שיעור המימון נבחן מול קו של הבנק", is a claim about how banks work with no label (the lesson teaches that every arrow has a type; this one is neither a computation nor a rule; the 6.2 arrow beside it carries "(ידע מהשטח)").
- **Fix:** "אילו גורמים הוא מזיז? אילו מהם חשבון, ואילו השערה?" and in the answer name the four with their types ("ערך הלקוח" is Tuvi Zamir's single-source claim, 4.12). Label the arrow "(השערה: ידע מהשטח, לא נבדק)" or drop it; the rest of the lesson does not need it.

### 6.1-4 · should fix · "ריפו" in the body
- **Where:** MDX 126: "כפי שתועד בריפו של הצוות ולא נבדק מחדש".
- **Problem:** the learner has never been told what a repo is. Stage 4 uses the same phrase, but there it is followed by "(2026-08-25; לא נבדק מחדש מול האתר של הבנק)" and reads as a record; here it is bare. The sentence it sits in is also hard to follow: "כלומר ההמתנה ארוכה בתשלום אחד" (one payment longer than what?), and "והמחיר? לא בשקלים. הוא בזמן, ושאלה אם הזמן הזה אפשרי" (MDX 126) is not a sentence ("וזו שאלה אם…").
- **Fix:** "לפי שאלון ציבורי של בנק אחד, כפי שתועד אצל הצוות (לא נבדק מחדש מול האתר)". And: "אם הקו הוא ״שנה וחצי או יותר״, צריך להמתין תשלום אחד יותר: שאלה פתוחה משיעור 4.2".

### 6.1-5 · nit · "נקודות אחוז" for a number below one, "we", and a name clash
- MDX 112: "בכ־0.40 נקודות אחוז" → "בכ־0.4 נקודת אחוז" (AUTHORING: singular up to one). See X-3.
- MDX 46, 80: "פתחנו", "מסתכלים", "אנחנו לא יודעים" (we). AUTHORING: plural address to the learner ("פתחתם", "ראיתם"). See X-4.
- MDX 326 (exercise 6.1-4): the invented family "מיכל ועידו" has the first name of case B's Michal (Avi's partner, 4.x and 6.5). Use another name (e.g. "ליאור ועדי").
- MDX 224–238 (the half table): every blank is a number printed one screen above (72.27 / 39.17 in the worked example, 76.18 / 38.53 in the explanation). The exercise is copying. Give the learner something to compute (a third equity amount that is not in the text).

### 6.1-6 · nit · the map on the phone is a 124-item list
- **Where:** the `BigPictureMap` at 390px.
- **Problem:** the component is 6,293px tall (an accordion of all nodes, grouped by region). The node the tasks start from ("הון עצמי", `initial="equity"`) is open about 2,300px down, in the last region. The tasks work, but a phone learner scrolls about three screens inside the component before the first task.
- **Fix:** open the lesson's tasks with "גללו אל ״הלקוח״ …" or let `initial` scroll its card into view; or collapse regions by default on phones.

### 6.1-7 · nit · the video has no illustration mark
- Neither the cues nor any frame of `6-1.mp4` says the numbers are the course's illustration (6.4 and 6.5 do, cue 2). The last frame carries "סכום הסגירה: הנחת חישוב. התקרה והסף: תעתיק הצוות, לא אומת", which is the right label for the thresholds, but not for the family. Same in 6.2 and 6.3 (X-5).

---

## 6.2 — מיצוב: ספים ומדרגות

Distance to a line in four currencies (points, payment, income, loan), then four kinds of line, then the price of getting to each one in case A. The "same distance in different currencies" idea is clear and the calculator makes it visible. What is left:

### 6.2-1 · blocker · three of the four formula steps print mirrored
- **Where:** MDX 232, 236, 238 (the numbered steps under "ארבע שאלות על מרחק"); step 2 (MDX 234) is fine.
- **Problem:** the formulas are written inside `<M>`, which is a left-to-right isolate, but they contain Hebrew words. In the browser (390px and the DOM: `dir="ltr"`), the Hebrew words and the numbers around them re-order. Read right to left, as a Hebrew reader reads the line:
  - step 1 shows **"הכנסה פנויה × 100 ÷ C"**; the source is `C ÷ הכנסה פנויה × 100` (the ratio, upside down);
  - step 3 shows **"C − הכנסה פנויה × הקו ÷ 100"**; the source is `הכנסה פנויה × הקו ÷ 100 − C`, so the sign is reversed, and the next sentence ("שלילי הוא כמה להקטין") is then false;
  - step 4 shows **"הקו ÷ 100 × C"**; the source is `C × 100 ÷ הקו`.
  The three formulas the lesson says it is teaching ("מהדוגמה לנוסחה") are the ones that show wrong. The worked numbers further down are right, so the page contradicts itself. `M.astro` says what it is for: an equation of numbers.
- **Fix:** do not put Hebrew words in `<M>`. Write the four steps as plain RTL prose lines, like the box under them, which renders correctly ("מרחק = הקו − היחס"): "היחס = ההחזר ÷ ההכנסה הפנויה × 100", "המרחק בשקלים = ההכנסה הפנויה × הקו ÷ 100 − ההחזר", "ההכנסה שהקו דורש = ההחזר × 100 ÷ הקו". Check step 3's sign sentence after the change.

### 6.2-2 · should fix · the course's own example numbers carry the label "השערה מהשטח"
- **Where:** the kind card MDX 104–106 ("השערה מהשטח … הדוגמות: 35% או 30% יחס החזר (דוגמה מהבריף של הקורס …)"); MDX 40 (`calcSource`), 141, 220, 397 ("קו שהוא השערה מהשטח"), 239 (6.4's note); `positioning.ts:138–139` (`kind: "field_hypothesis"`), the badges in the calculator ("30% יחס החזר · השערה מהשטח"), the sorter card MDX 341, video cue 13 and the frames ("השערה").
- **Problem:** AUTHORING's kind "ידע מהשטח" means a named professional said it. 6.2 itself says the opposite for 30%–35%: "הקורס לא מצא לה מקור: לא שורה של ידע מהשטח שאומרת את המספרים האלה" (MDX 110) and Sources row 2: "דוגמה בבריף של הקורס … לא נמצאה שורה של ידע מהשטח". The page then files it under the fourth kind, "השערה מהשטח", beside Tuvi Zamir's 40/60 (which really is a field claim). A learner who knows the four kinds reads "35%" as something a professional said.
- **Fix:** split the fourth kind in two on the page, in the calculator and in the video: "השערה מהשטח (מקור: טובי זמיר, FK-H-004)" for 40%/60% financing, and "דוגמה של הקורס, לבדיקה" for 30%/35%. In the sorter, card 4 becomes its own answer or moves to a separate bin.

### 6.2-3 · should fix · the calculator hangs a claim on a named source that did not say it, and shows internal names
- **Where:** `positioning.ts:130` (the `crossing` text of every field-hypothesis line), `:138–139` and `:140–144` (sources); shown in the calculator on the 40% and 60% financing lines and on the 30%/35% payment lines.
- **Problem:** under "40% מימון · השערה מהשטח" the calculator prints "לא ידוע: ייתכן שמתחתיו התיק נראה בטוח יותר ויש כוח מיקוח · טובי זמיר, 2026-08-05 (FK-H-004); מקור יחיד". FK-H-004 is about financing bands being tied to the bank's capital allocation (and the Bank of Israel's own bands are different). Nobody in the sources said a file under 40% financing "looks safer and has bargaining power"; that sentence is the 30–35% payment-ratio hypothesis from the brief, pasted onto a different line and a different source. The same cards show "תיעוד הצוות (Brain 7503881)" (rendered "(7503881 Brain)" in the phone screenshot: the id and the word swap places) and "דוגמה מהבריף של הקורס".
- **Fix:** per line `crossing` text: financing lines "לא ידוע מה משתנה בבנק כשחוצים אותו" only; payment-ratio example lines keep the bargaining hypothesis, labelled as the course's example (6.2-2). Replace "Brain 7503881" with "תעתיק הצוות" and "הבריף של הקורס" with "דוגמה של הקורס".

### 6.2-4 · should fix · the step model is asserted as a fact, and it is a slogan
- **Where:** MDX 118–120 ("בין שני קווים הגורל של התיק דומה … מי שהגיע בדיוק לקו קיבל את אותו דבר כמו מי שירד עמוק"), 172 ("המחיר עולה בקו ישר, והרווח (אם יש) הוא מדרגה"), 483 ("בין ספים המצב שטוח"); `6-2.json` ("בין שני ספים המצב שטוח"); the headings and titles "קרוב זול, רחוק יקר" (MDX 120, 273, 486; video cue 9 and the whole last title card); 6.2-7's note (MDX 461).
- **Problem:** the lesson later says (rightly) that the size of the step is unknown and that for a capital threshold the client is "מתומחר גרוע יותר" (MDX 125, a research suggestion). But the earlier paragraphs already decided the shape: flat between lines, a jump at the line, and "no point in going far under it". That is a model, not a finding, and the sentence "אין טעם לרדת הרבה מתחת לקו" is advice built on it. AUTHORING: no slogans, say under which conditions a statement holds; the box says "זה לא נבדק" only in the head tool (MDX 277), a screen later.
- **Fix:** put the label where the model is introduced: "הנחת מודל של הקורס, לא ממצא: נניח שבין שני קווים אין הבדל, ושבקו יש קפיצה. אם זה נכון, אין טעם לרדת הרבה מתחת לקו. אם זה לא נכון, זה משתנה". Change the headline to a statement ("הקו הקרוב זול יותר להגיע אליו; מה הוא קונה — לא ידוע") and drop the slogan from the summary and the video's closing card.

### 6.2-5 · should fix · "the capital threshold is the Bank of Israel's" is a claim, shown without a label
- **Where:** MDX 94 and 98 (the first two kind cards: "בנק ישראל. חציה: מותר, והבנק מחזיק יותר הון", "זהה בכל הבנקים"), MDX 249 ("בשני הקווים של בנק ישראל" and "ממש מעל"), `6-2.json` ("סף"), the sorter cards (MDX 338–339), video cue 11 and its card ("מי קבע: בנק ישראל").
- **Problem:** the label "(תעתיק הצוות, לא אומת)" is on the *example numbers*, not on the claim about who set the line and what happens. Sources row 1 says "ההוראה שנושאת את סף ההון לא נקבעה (329 או 203)", and FK-H-012's note says the 40% is "בהוראה 329, מעל 40% הבנק מחזיק יותר הון … לא איסור" with the speaker contradicting himself. So "who set it" and "what happens above it" are the team's transcription, and "exactly at the line has not crossed it" (MDX 249) is the only place the lesson says what the edge does: for the 50% limit nothing in the sources says it.
- **Fix:** write the label inside each card: "בנק ישראל (לפי תעתיק הצוות; לא ידוע איזו הוראה; לא אומת)". For the edge: "ממש מעל: כך לפי תעתיק הצוות לגבי 40%; לגבי 50% לא ידוע".

### 6.2-6 · should fix · internal wording and an unsupported frequency claim in the explanation
- **Where:** MDX 106 ("דוגמה מהבריף של הקורס"), 110: "הטענה שקורס כזה שומע הכי הרבה היא ש…", "לא שורה של ידע מהשטח שאומרת את המספרים האלה".
- **Problem:** "הבריף" and "שורה של ידע מהשטח" are the authors' working words, not the learner's; and "the claim a course like this hears most" says how often a claim is made and by whom: no source gives that. The brief calls it an example ("40% versus 30%–35%").
- **Fix:** "דוגמה שלפיה תיק עם 30%–35% יחס החזר נראה בטוח יותר ומשאיר כוח מיקוח. זו השערה לבדיקה: לא מצאנו לה מקור ולא ראינו אותה אצל איש מקצוע".

### 6.2-7 · nit · three exercise details
- Exercise 6.2-3 (MDX 397) needs the case-A mix and the lever calculation; it says only "כדאי מחשבון" above the set. Add "השתמשו במחשבון הספים למעלה" to the stem.
- Exercise 6.2-6's solution (MDX 451): "משפחה שכבר הביאה את כל ההון שלה" and "סכום כזה לא נראה זמין" are invented facts about the family; the reserve in 6.4 is 40,000, so say "סכום גדול בהרבה מהחיסכון של המשפחה (הנחה של הקורס)".
- The prediction's option 2 (MDX 35) is the only one with a caption ("זה ההחזר שצריך להוריד"), which tells the learner what it is. Make all four bare numbers, as in 6.3.

### 6.2-8 · nit · wording
- MDX 76: "נמצאת ב־{2}" prints "נמצאת ב־2." with no unit; add "נקודות אחוז". MDX 268: "הוא −0.4 נקודות אחוז בלבד" and MDX 141 "0.45 נקודות אחוז": "נקודת אחוז" below one (X-3).
- MDX 102: "בנק אחר אולי אחרת" → "בנק אחר אולי יקבע אחרת".
- MDX 43: "הלשון של שיעור 4.5 מחולקת" → "בשיעור 4.5 חילקנו מספרים לשלושה סוגים".
- MDX 177: "מקטין את ההלוואה, ולכן את הריבית": AUTHORING says which ריבית: "את סכום הריבית". "חיסכון שכבר אי אפשר לגעת בו אם יש תיקון" (תיקון of what?) → "אם צריך לתקן משהו בדירה". "ולא עלות מושלמת ולא חינם" is unclear.
- MDX 433: "סך התשלומים הגדל" → "שגדל". MDX 471: "בנק ישראל … מבקש הון" reads as asking the client; "מבקש מהבנק להחזיק יותר הון".
- Sources 505 name "בנק א׳, ב׳ ו־ג׳ (38%, 65%)"; the sorter uses בנק ב׳ (38%) and בנק א׳ (65%); one of them is ג׳ nowhere.

### 6.2-9 · nit · small arithmetic and typed numbers in MDX
- MDX 433: "60 חודשים נוספים" is (25 − 20) × 12 written by hand; AUTHORING: no arithmetic in MDX. Make it a fact.
- MDX 40 (`calcSource`) and 6.2's text type 50, 40, 75, 35, 30, 60 as bare percentages, and "בצעדים של 1,000 ₪" appears five times; they are the inputs of facts (`l.*`, `in.step` exists in 6.4) but are not read from them.

### 6.2-10 · nit · video
- `video/6-2.html:158`: the closing card prints "המחיר מחושב. הערך של המדרגה — לא תמיד" (the cue says "לא תמיד ידוע"); the sentence stops.
- The four-kinds frames (t≈125–133) say "מי קבע: בנק ישראל / מותר, יותר הון" with only "המספרים לבדיקה" below; the label "תעתיק הצוות, לא אומת" comes two frames later (see 6.2-5). No illustration mark (X-5).

### 6.2-11 · nit · phone
- The three-ways table (MDX 145–168, `min-w-[34rem]`): at 390px the column "או להביא הון עצמי" (17,000 / 220,000 / 423,000, the one the paragraph below discusses) and "ואז שיעור המימון" are out of view; the layout's hint is there. **Fix:** put the equity column before the income column, or drop the income column (it is repeated in the text).
- The calculator's ratio bar: the labels 30%, 35%, 40% sit on top of each other and of the dotted lines at 390px; "35%" is overprinted by the orange line. Stagger the labels or show them under the bar.

---

## 6.3 — מפת המנופים

Nine levers in two groups, three questions each (what it improves, what it costs, when not), and then the case-A table with the courage to put "לא בטוח שהבנק יציע" and "חוצה את התקרה: אסור" beside the numbers. The "תיק שעובר את הבנק ופוגע במשפחה הוא כישלון" callout is the right opening. What is left:

### 6.3-1 · should fix · exercise 6 cannot be answered from the page, and the half table asks for numbers printed above it
- **Where:** MDX 361–377 (exercise 6.3-6); MDX 250–263 (the half table).
- **Problem:** 6.3-6 asks "מה יחס ההחזר שלהם אז, באחוזים?" for shortening *all tracks* from 30 to 25 years. The answer (44.41%) needs the three tracks, amounts and rates of the initial mix, none of which is on the page, and the exercise is marked "מאתגר". The solution's last sentence ("הוא חוצה את הקו הרחוק יותר") has no meaning (the ratio is already over 40%; the next line it crosses is 50%, which it does not reach). The half table (action 1 given; blanks 38.53, 76.18, 39.84, 74.55) asks for four numbers all printed in the solved table directly above (MDX 201–238).
- **Fix:** give the exercise the tracks ("546,000 ב־4.60% בפריים, 547,000 ב־4.10% במשתנה, 547,000 ב־4.40% בקבועה, כולם ל־25 שנה") or ask a conceptual question ("מה קורה להחזר החודשי ולסך התשלומים?"). Solution: "הוא עולה מ־40.4% ל־44.41%: עוד קו נחצה (35%) ואחד מתרחק". For the half table, give a new input the learner must compute.

### 6.3-2 · should fix · unlabelled bank behaviour, a legal word, a person's name and a repo path in learner text
- **Where:** MDX 118 ("הבנק בודק את התדפיס בחיתום"); `lever-map.ts:90` and 98–99 ("וניסיון לעשות את זה הוא מרמה", "היא מרמה"); `lever-map.ts:79` ("Brain 67436545"); `lever-map.ts:90` and MDX 427 ("אילון ועדן"); MDX 424 (`src/data/case-a-mix.ts`) and 425 (Brain page ids, in Sources).
- **Problem:**
  - "הבנק בודק את התדפיס בחיתום" says what a bank does; the field-knowledge row behind it (FK-H-015) is in Sources only, and the body states it as a fact. The "conduct" card (LeverMap) puts it under "improves" with the FK id in the small print.
  - "מרמה" (fraud) is a legal description of an act. 6.5 says the course does not determine the law; the lever card says what the act *is*. (The map's own 6.5 title says "למה זו מרמה"; see 6.5-2.)
  - "אילון ועדן" in a learner-visible lever card: the learner knows Eylon (stage 1) and has never been told who "עדן" is (stage-5 X-1 flagged the same).
  - "(Brain 67436545)" in a lever card; a source path in Sources is acceptable, a path in the body or a card is not.
- **Fix:** "(ידע מהשטח, FK-H-015: הבנק בודק את העו״ש מול התלושים; ממתין לאישור אילון)" in the body; "הצגת הכנסה שאין לה בסיס היא מידע לא נכון, והקו האדום של שיעור 6.5" in the cards; "לפי הצוות, ב־2026-09-16" for the people; "תעתיק הצוות" for Brain.

### 6.3-3 · should fix · the head tool says "two axes" and lists four
- **Where:** MDX 187–191 (heading "שני צירים", text "שקלים של הון עצמי, שקלים של הכנסה בחודש, חודשים של המתנה, נקודות בתמהיל").
- **Problem:** the heading says two, the text names four (and "ציר" is a word nobody has defined: an axis in a chart, or a scale?). The same word ("ציר") appears in 6.3's intro to the table (MDX 110, "לאורך הציר שלו").
- **Fix:** "## מטבעות שונים, לא אותו ציר" with one line: "כל מנוף נמדד במטבע אחר: שקלים של הון עצמי, שקלים של הכנסה, חודשים, נקודות".

### 6.3-4 · should fix · the mix lever in 6.3 and in 6.4 gives opposite pictures
- **Where:** MDX 124 (6.3: half-half passes under 40%, 39.84%, with the payment 112.83 lower and no wall) against 6.4 MDX 172 and 225 ("הזזת 10 נקודות … החלוקה בין המסלולים … חומה, כמעט מההתחלה"; "שלושה מנופים חוצים חומה").
- **Problem:** in 6.3 the mix lever helps (and its cost is "לא בטוח שהבנק יציע"); in 6.4 the same lever is a wall, because 6.4 tests a different move (10 points from fixed to variable). Both are computed correctly, but a learner who reads the two lessons sees "mix: works" and "mix: a wall". Nothing says they are two different moves, and half-half (which lowers the variable part from 1,093,000 to 820,000) is the move that makes sense.
- **Fix:** in 6.4, name the tested move in the table row and the section heading ("הזזת 10 נקודות מקבועה למשתנה, בכיוון הזה") and add one sentence: "בכיוון ההפוך (חצי־חצי, שיעור 6.3) אין חומה, והמחיר הוא ההנחה שבנק יציע את אותן ריביות".

### 6.3-5 · nit · wording
- MDX 411 (summary): "ומחצה את התקרה" → "וחוצה את התקרה".
- MDX 126: "איזה בנק יאשר, או יציע, אחרת, לא ידוע" is unreadable; "איזה בנק יאשר או יציע בתנאים טובים יותר — לא ידוע".
- MDX 130: "ובכל מנוף שיש לו מחיר שהוא לא בשקלים, אי אפשר להשוות לו" → "מנופים שמחירם לא בשקלים אי אפשר להשוות לשקלים".
- MDX 54: "למדנו / נמפה" (we); MDX 240: "בשיעורי הפנייה לבנקים נדון" → "בשיעורים 6.6–6.8".
- MDX 120: "בתיק א׳ שני הלווים עם תלושים": stated as a fact about case A with no source line; stage 4 gives their net incomes, not their documents. Add "(הנחה של הקורס)".

### 6.3-6 · nit · phone
- The four-actions table (MDX 201–238) shows three columns at 390px; the fourth, "מה זה עולה" (the lesson's point: "אין מנוף חינם"), is the one out of view. **Fix:** put "מה זה עולה" second.
- The half table is 338px wide with 362px of content in a 358px box (4px of side scroll); shorten the first column ("להמתין 8 חודשים").

### 6.3-7 · nit · small things
- Sources 427 lists FK-H-055, 073, 081 and 052 that no sentence of the lesson body uses (the `timing` card quotes FK-H-052); list only what is used.
- `stage-6.ts:73`: the lever card's "note" reads "הרשימה לפי הבריף וידע מהשטח"; and its list has ten items ("סכום ההלוואה" and "ההון העצמי" separately) where the lesson says nine.
- **Video:** `video/6-3.html:138`: the last card prints "מה שאי אפשר למדוד בשקלים, אומרים שאי אפשר" (the sentence ends one word short: "…אי אפשר למדוד"), and the cue says something else ("מה שאין לו מספר, כותבים בלי מספר"). No illustration mark (X-5).

---

## 6.4 — לכל מנוף יש מחיר בשקלים

The strongest lesson of the five: a lever is a pair, the price comes in four currencies that are not added, the wall is shown as a column, the two-sided panel and the recommendation with its own flaw ("החיסרון של ההמלצה") are what a beginner needs. The numbers are all right. What is left:

### 6.4-1 · blocker · "חוסך 30,528.09 בריבית" is wrong: that figure includes the 17,000 that is never borrowed
- **Where:** MDX 335 (worked example, step 4: "הון עצמי נוסף … גם חוסך 30,528.09 ₪ בריבית"); MDX 134 ("סך התשלומים יורד ב־30,528.09 ₪ … זה המנוף היחיד כאן שמשלם גם בשקלים של ריבית"); MDX 337 ("ועוד חוסך ריבית").
- **Problem:** the fact `l.eq.saving` is the fall in the **total of all payments**: 2,945,264.34 → 2,914,736.25. With 17,000 less borrowed, 17,000 of that fall is principal. The interest saved is 30,528.09 − 17,000 = **13,528.09** (interest over the loan: 1,305,264.34 → 1,291,736.25). MDX 134 says "total payments", which is right; MDX 335 says "בריבית", which is not, and it sits in the paragraph that decides which lever to pull. A learner reads that 17,000 now saves 30,528 of interest, a return the real figure (13,528) is less than half of.
- **Fix:** MDX 335: "וגם מקטין את סך התשלומים ב־30,528.09 ₪ (מהם 17,000 קרן שלא לוקחים, והשאר, 13,528.09, ריבית)", with the 13,528.09 as a new `difference` fact. MDX 134: "זה המנוף היחיד שמקטין את סך התשלומים" is also not true (shortening the term does it, MDX 166, by 247,391.11; and closing the car loan from the savings removes the loan's own interest, which the course does not price); say "המנוף היחיד בין הארבעה האפשריים שמקטין את סך התשלומים".

### 6.4-2 · should fix · "ארבעת המגבלות"
- **Where:** MDX 114: "ארבעת המגבלות שמעניינות כאן".
- **Problem:** "מגבלה" is feminine: "ארבע המגבלות". (The same sentence lists the limits correctly; the count is the slip.)

### 6.4-3 · should fix · "חוקי" says legal
- **Where:** MDX 272 ("לא עובר בדיקה גם אם הוא חוקי"); 6.5 MDX 243 ("גם מנוף חוקי נבדק בשאלה השלישית של 6.4").
- **Problem:** the wall is the team's transcription of Directive 329 (the page says so two paragraphs earlier, MDX 114); "חוקי" asserts that the lever is lawful. Stage 5's 5.4-1 flagged the same word for the same reason.
- **Fix:** "גם אם הוא מותר לפי ההוראה (כפי שהצוות תעתק אותה)".

### 6.4-4 · should fix · "the only lever that pays in interest" and the interest word itself
- **Where:** MDX 134 (see 6.4-1), 337.
- **Problem:** besides the arithmetic, "משלם גם בשקלים של ריבית" is the wrong verb: the lever *saves*; and "ריבית" is both the rate and the shekels (AUTHORING: say "סכום הריבית"). Closing the car loan from the savings also saves that loan's interest, so "היחיד" is not accurate.
- **Fix:** see 6.4-1.

### 6.4-5 · should fix · the 18-payment edge: the component and the text disagree
- See X-1. The "המתנה" lever in `LeverPrice` at 8 months shows "37.7% ← 40.4%" and no caveat (the text at MDX 149 and the error note at MDX 471 say 8 months is the open edge and 9 is the clear case; the slider defaults to nothing). At 9 it shows the same.

### 6.4-6 · nit · small things
- The prediction's option 2 (MDX 39: "הוא מוריד את היחס מתחת ל־40%, ו־(א) מעלה את שיעור המימון ל־76.18%, מעל התקרה של 75%") contains the whole reasoning; the other three are one clause. The correct option can be found by its length.
- MDX 124: `8,181.30 ÷ 20,250 = 40.4%` has no `× 100`; every other ratio in the stage has.
- "הגבוה ביותר בתרחיש מחמיר" for the base case is the *last* payment (month 360: 9,435.33), which carries the rounding residue and is 3.16 ₪ above the plateau (9,432.17 from month 61). The equity lever's maximum is the month-61 plateau, so the printed difference (100.92) mixes a closing payment and a plateau; the true plateau difference is 97.76. Say "ההחזר הגבוה ביותר" is approximate, or compare plateaus.
- The calculator's 25-year payment is shown as 8,992.91 while the "left to live on" next to it is computed from 8,992.92 (the sum of the three rounded track payments; 11,257.08 = 20,250 − 8,992.92). A 1-agora disagreement inside one panel.
- MDX 149 types 7 and 8 (months) in the body; they should come from facts (`l.wait7`, `l.wait8` exist).
- 6.2's label for the 40% line is "סף הון, לפי תיעוד הצוות (לא אומת)"; MDX 66 and Sources 545 here call it "סף של דוגמה". Same number, two labels; pick one.

### 6.4-7 · nit · video
- The card values print the shekel sign on the reading-start side of the number (visually "5,845.90 ₪", so a Hebrew reader meets "₪" first): t037, t047 and the cost card (5,368.22, 477.68, 1,753,770.27, 178,785.61). The title card ("הלוואה של 1,000,000 ₪") and the 6.1 frames have it right. See X-5.
- The dot chart's axis runs 32% → 40% from left to right; the bars in 6.1 and 6.2 run 50% → 30% (larger to the left). Same stage, two directions.
- The title says "חמישה מנופים" while the page works with seven rows (six sections); say "חמישה מנופים מתוך שבעה".

---

## 6.5 — הקו האדום: מיצוב מול מידע לא נכון

The lesson's structure is the right one: one fact, two stories, four questions, and a price that is visible or not; the red line is drawn through the *paper*, not the *number*. The forbidden practices appear only as the wrong half of a pair, always with the reason, and the legal consequences are listed as questions. What is left:

### 6.5-1 · blocker · the lesson argues against the gift story by "no gain", which is a cost-benefit rule for a forbidden practice, and the "no gain" is not known
- **Where:** `scenarios` in MDX 83–101: story 2 of the gift, `outcome` ("אותם מספרים בדיוק") and `why` (MDX 99): "המספרים לא השתנו, ולכן אין כאן רווח שאפשר למדוד, יש רק פרט שנאמר לא נכון. כשלא מצליחים לנקוב ברווח, אין סיבה לקחת סיכון שהמחיר שלו לא ידוע"; the expected observation 3 (MDX 288): "כשלא מצליחים לנקוב ברווח, אין מה לקחת סיכון בשבילו"; solution 6.5-4 (MDX 467): "בדרך האסורה, לא נראה מחיר, אבל זה לא אומר שאין".
- **Problem:** this is the one lesson whose job is to say plainly why the line holds. Two sentences earlier it says the line holds whatever "passes": "הקו הזה נשמר בכלל, בלי קשר לשאלה מה ״יעבור״" (MDX 260), and "ומי שנשאר עם ההלוואה, במציאות, הוא המשפחה" (MDX 208). The gift scenario's reasoning is the opposite: it is wrong because nothing is gained and the risk is unknown, which a learner reads as "if it did gain, the risk might be worth it". And the premise itself is not known: story 1 of the same scenario says "אם בנק מתייחס למתנה אחרת מחיסכון, זו שאלה לאילון" (MDX 92); if a bank does treat a gift differently, then presenting it as savings has exactly the gain the story says it lacks. "אין רווח" is an unlabelled claim about bank behaviour; the honest statement is "לא ידוע".
- **Fix:** replace both `why` and the observation by the lesson's own reason: "הנייר מתאר משפחה שאינה קיימת. לא משנה אם יש כאן רווח: אין הצגה כזו, וזו גם החלטה של Mogi (שואלים לפני שנוגעים בנתון)". Keep "אם בנק מתייחס למתנה אחרת — לא ידוע" as the open question, and delete every sentence that weighs the risk against a gain (MDX 99, 288, and the last clause of 467).
- **Note:** the same pattern is quieter in MDX 347 ("מי שילם?" as a rule of thumb: a number that arrives without paying "כנראה שהנייר השתנה"), which is fine as a warning sign and labelled "כלל אצבע, לא הוכחה"; keep it.

### 6.5-2 · should fix · "למה זו מרמה" names the act in legal terms
- **Where:** MDX 212 (heading "למה זו מרמה, ומה המחיר"), the map's row for 6.5 ("למה זו מרמה, ומה המחיר שלה"), `lever-map.ts:98–99` (6.3-2).
- **Problem:** "מרמה" is the legal word for fraud; the lesson says in three places that it does not say what the law says ("הקורס לא קובע דין", MDX 126, 221, 324). The heading and the lever cards do exactly that.
- **Fix:** "למה זה מידע לא נכון, ומה המחיר". If the course wants the word "מרמה", it goes in the lawyer questions ("האם זה מרמה לפי החוק?") and nowhere else. The map row is the coordinator's; say so in the hand-over.

### 6.5-3 · should fix · internal names and paths in the learner's text and cards
- **Where:** MDX 253 ("החלטה של Mogi (2026-08-31, Brain 33718276, דרך הסיכום בריפו של הצוות; הדף עצמו לא נקרא)"); MDX 565 ("research/notes/brain-calculation.md"), 566 ("כפי שנקבע בבריף"); `stage-6.ts:123` (the red-line card's note: "Brain 33718276 … דרך research/notes/brain-calculation.md"); `stage-6.ts:73`.
- **Problem:** the body sentence carries a Brain id, "ריפו", and a statement about which page the author has not read; the decision is also missing *who* decided (AUTHORING: "with who and when"). The same text is in the map card that shows in every later lesson.
- **Fix:** "**החלטה של Mogi (<מי שהחליט>, 2026-08-31).**" in the body, with the name taken from the research note (I could not tell who from the page; the coordinator can), and move the page id and the path into Sources and the closing comment.

### 6.5-4 · should fix · the 18-payment edge, in the red-line lesson
- **Where:** MDX 187 ("הלוואה שלא נספרת בחישוב (כשנשארו עליה 18 תשלומים או פחות)"). See X-1: 6.5's own cards use 9 months and 17 left (MDX 106) and Sources 571 says the edge is open, so the body's "18 או פחות" contradicts its own Sources.

### 6.5-5 · should fix · the map cards for the red line state legal consequences and bank checks as fact
- **Where:** `stage-6.ts:122` (`red_line.role`), `:134` (`misleading_info.role`), and the link `underwriting → misleading_info` ("הבדיקה מחפשת פער בין מוצהר למאומת").
- **Problem:** "בנק יכול לסרב, לבטל או לדרוש פירעון, והיועץ והלקוחות נושאים בסיכון משפטי" is the list the lesson labels "חששות, לא קביעות" (MDX 221) and sends to a lawyer; the card, which shows up in the map of every later lesson, drops the label (the `note` adds "המשמעות המשפטית לא נבדקה" but the `role` line reads as fact). "הבנק בודק את המוצהר מול המאומת. פער ביניהם הוא בדיוק מה שהבדיקה מחפשת" says what banks do; the lesson says it depends on the channel and the bank (FK-H-029 and 030, MDX 216), and FK-H-029 says nobody verifies at the pre-approval.
- **Fix:** "הצד השני של הקו הוא מחיר שהקורס לא יודע לתמחר: בנק אולי יסרב, יבטל או ידרוש פירעון, ואולי יש אחריות משפטית (שאלות לעורך הדין)"; "אם בנק בודק את המוצהר מול המאומת, ובאיזה שלב — תלוי בערוץ ובבנק (ידע מהשטח)".

### 6.5-6 · nit · the stories' fourth check and a few word choices
- `TwoStories` marks "האם זה מה שהלקוח אמר?" as **false** for car story 2 and gift story 2 (MDX 55, 97) while the facts never say what the client said; only Avi's story 2 has a client statement. State it in the fact ("הם אמרו ליועץ שהחסכונות כולם שלהם").
- The course's four checks are the course's construction; only the fourth is a Mogi decision (MDX 191 says so). Add one line before the list: "ארבע הבדיקות הן בנייה של הקורס".
- MDX 122, 251, 332, 338: straight quotes around "מנוף", "מיישר", "אותו דבר", "אפס" where the rest of the stage uses ״…״.
- MDX 241: "דנה ויואב" next to 6.2's "דנה ורועי": two invented couples with the same first name one lesson apart.
- MDX 251: "מי שרוצה לכתוב את המספר הנוח, כותב." reads as a description of what people do; say "מי שכותב את המספר הנוח, כותב מה שהלקוח לא אמר".

### 6.5-7 · nit · video
- Same shekel-sign placement as 6.4 (t025, t035: "₪ 1,450 בחודש" reads sign first). "פער של 2.70 נקודות" on the frame, "נקודות אחוז" in the cue. The "אותו מספר" label touches the bottom border of the two cards (t044).

---

## Cross-lesson items

### X-1 · blocker · "when does the car loan stop counting?" has two answers in the stage, and one is the question stage 4 left open
- **Where:**
  - 6.1: MDX 126 ("אחרי 8 תשלומים נשארים להלוואת הרכב 18 חודשים, והיא כבר לא יורדת מההכנסה", with the open question in a parenthesis), 260 (sorter: "ממתינים עד שלהלוואת הרכב נשארו 18 חודשים" → "ההתחייבות יוצאת מהחישוב");
  - 6.3: MDX 49–51 (half-table row "להמתין 8 חודשים"), 128, 219 (table "המתנה של 8 חודשים … 37.7%"), 324 (solution 6.3-3: 30 − 18 = 12), 411 (summary: "8 חודשי המתנה מורידים אותם מתחת ל־40%"), the notes of the lever map (`timing`), `lever-map.ts` (close-loans `whenNot`: "כשנשארו להלוואה 18 חודשים או פחות"; timing `improves`: "18 חודשים או פחות יוצאת מהחישוב"), video 6.3 cue 7 ("המתנה: 8 תשלומים. יחס 37.7%");
  - 6.5: MDX 187 ("18 תשלומים או פחות");
  - against 6.4: MDX 149 ("אחרי 8 חודשים נשארים 18 בדיוק, ובשיעור 4.2 ראיתם שב־18 בדיוק זו שאלה פתוחה … אחרי 9 חודשים נשארים 17, ושם הכלל ברור"), 471 (the wrong-answer note of 6.4-6: "אחרי 8 חודשים נשארים 18 תשלומים בדיוק, ושם הכלל פתוח"), 475–478, the video of 6.4 (9 months), 6.5's cards (9 months, 17 left), and **lesson 4.2**, which chose 17 on purpose ("אחרי כמה תשלומים נוספים יישארו 17 — פחות מ־18, ולכן בוודאות היא לא נספרת … ב־18 בדיוק — שאלה פתוחה, ולכן לא שאלנו עליו").
- **Problem:** stage 4's transcription says "מעל 18"; a public questionnaire says "שנה וחצי ומעלה", which may include 18; the team put it to Eylon. 6.4 and 6.5's cards respect that and use 9 months. 6.1 and 6.3 treat 8 months as settled in their tables, summaries, exercise key (6.3-3 asks "כמה תשלומים עד שתצא מהחישוב?" and accepts only 12, which is the transcription's reading as if the edge were closed) and the video. A learner meets "8 months, 37.7%, no money" in 6.1 and 6.3 and, three screens later, "8 is wrong, you need 9" in 6.4 (an error note, MDX 471). The 6.4 component itself (`LeverPrice`, "המתנה") shows 37.7% at 8 months with no caveat while the page text says that is the open edge.
- **Fix:** use the edge-free number everywhere: "אחרי 9 תשלומים נשארים 17, ושם הכלל ברור" (6.1 MDX 126 and 260, 6.3 table/half table/summary/exercise 6.3-3 with a stem on 17, the lever-map cards, 6.3 cue 7 and its frame, 6.5 MDX 187), and keep one sentence on the open edge in 6.1 or 6.3 (as 6.4 has it). In `LeverPrice`, show "הכלל פתוח" at exactly 18 left. 6.1/6.3's facts `c.until_drop` and `l9.months` (8) are 4.2's "edge" fact; the lessons need 9 (the fact 6.4 already has: `in.wait`).

### X-2 · should fix · internal names, paths and ids in learner text
- **Where (outside the `<Sources>` list):** the bare word "Brain": `positioning.ts:140–144` (shown in the 6.2 calculator, six times, with the id swapped to "(7503881 Brain)" on the phone), `lever-map.ts:79`, `stage-6.ts:123`; "בריפו": 6.1 MDX 126, 6.5 MDX 253; "הבריף של הקורס" (the course brief): 6.2 MDX 106, `positioning.ts:138–139` (calculator), `stage-6.ts:73`, 6.5 Sources 566; the name "עדן": 6.3 Sources 427, `lever-map.ts:90` (a lever card the learner opens); paths: `src/data/case-a-mix.ts` (6.1 Sources 411, 6.3 Sources 424), `course/brief/part-3.md` (6.2 Sources 500), `research/notes/brain-calculation.md` (6.5 Sources 565, `stage-6.ts:123`).
- **Problem:** the same defect stage 4's and stage 5's X-1 listed. The learner is never told what Brain, the brief, a repo or "עדן" is. "אילון" and "טובי זמיר" are established (stage 1) and are fine; so are FK ids next to "ידע מהשטח" (the house label) in the text; page ids and paths belong in the closing comment, not in Sources the learner reads, and certainly not in the body or a card.
- **Fix:** "לפי תעתיק הצוות (לא אומת)", "לפי דוגמה של הקורס", "לפי החלטה של Mogi"; keep page ids in the closing MDX comment.

### X-3 · should fix · "נקודות אחוז" below one
- **Where:** 6.1 MDX 112 (0.40); 6.2 MDX 76 (renders "2", no unit), 141 (0.45), 268 (−0.4) and the calculator's cards ("מעל הקו ב־0.4 נקודות אחוז", "מתחת לקו ב־0.45"); 6.3 MDX 110 (0.40); 6.4 MDX 132 (0.42), 172 ("0.14 נקודות", no "אחוז"); the cards of the 6.2 calculator.
- **Problem:** AUTHORING: "נקודת אחוז" is singular up to one. 5.4 and 5.5 had the same slip (stage-5 X-2); 6.5 is clean (all its gaps are above one).
- **Fix:** "0.4 נקודת אחוז", "0.45 נקודת אחוז", "0.42 נקודת אחוז", "0.14 נקודת אחוז". Include the component's text.

### X-4 · nit · the stage addresses "we" in the opening lessons
- 6.1 MDX 46, 80; 6.2 MDX 42–43 ("נלמד", "ראינו"); 6.3 MDX 54 ("למדנו / נמפה"). 6.4 and 6.5 use "מיפיתם", "ראיתם" as AUTHORING says.

### X-5 · should fix · the videos: no illustration mark in three, the shekel sign in two, a short card in one
- **No "numbers for illustration" mark** anywhere in the cues or the frames of 6.1, 6.2, 6.3 (6.4 and 6.5 say it in cue 2 and on the first frame). The numbers are case A's invented ones; the brief asks every example to carry the mark. 6.1's last frame labels the thresholds only.
- **The shekel sign sits on the reading-start side of the number** in 6.4 (t037, t047, t057) and 6.5 (t025–t062). 6.1–6.3 and the 6.4 title place it correctly.
- **Direction of the axes** (6.4's dot chart ascends left to right, 6.1/6.2 descend) and the closing cards of 6.2 and 6.3 whose last sentence stops (6.2-10, 6.3-7).
- **Fix:** add the mark as the second cue of 6.1–6.3 and on the first frame; build the amount strings so the sign follows the number in reading order; use one direction for percent axes across the stage.

### X-6 · nit · "2.70" next to "37.7%"
- Facts printed with `f.plain` keep the data's two decimals ("2.70", "0.40") beside ratios the page prints with their natural digits ("37.7%", "40.4%"). One rule for percentage points: the same number of digits as the ratios they are the difference of ("2.7"), or all two decimals.

### X-7 · nit · no phone screenshots for stage 6
- `qa/screens/phone_lessons_6-*_.png` and `desktop_lessons_6-*_.png` do not exist; the folder stops at 5.9. Run `pnpm screens` after the stage is unlocked in the screenshot profile (the lessons are hidden behind the stage lock without the key `mogi-course:check:5`).

---

## Count

5 blockers, 23 should fix, 18 nits (6.4-4, 6.4-5 and 6.5-4 are short pointers to items counted elsewhere: 6.4-1 and X-1).

**The most important items, in the order I would fix them:**
1. **X-1:** the 18-payment edge. 6.1, 6.3 and the lever cards say 8 months and "18 or fewer"; 6.4 and 6.5's cards say 9 and call 8 the open edge; stage 4 chose 17 on purpose. Use 9 everywhere and keep one sentence on the open edge.
2. **6.2-1:** three of the four formula steps print mirrored (Hebrew inside `<M>`): the ratio upside down, the sign of the distance reversed. Write them as plain RTL lines.
3. **6.1-1:** the wrong-answer note of exercise 1 says equity does not touch the payment ratio, the opposite of the lesson.
4. **6.4-1:** "חוסך 30,528.09 ₪ בריבית" in the worked example; the interest saved is 13,528.09 (17,000 of the figure is principal never borrowed).
5. **6.5-1:** the gift story is argued by "no gain, unknown risk", a cost-benefit rule for a forbidden practice, contradicting the lesson's own "the line holds whatever passes"; and "no gain" is not known.
6. **6.2-2 and 6.2-3:** the course's own 30%–35% example is labelled "השערה מהשטח", and the calculator hangs the bargaining-power sentence on Tuvi Zamir's financing lines (FK-H-004 does not say it).
7. **6.5-5 and 6.5-2:** the map cards state the bank's possible reactions and bank checks as fact; "מרמה" names the act in legal terms where the lesson says it does not decide the law.
8. **X-2 and X-3:** internal words (Brain, ריפו, בריף, עדן, paths) in the body, the calculator and the cards; "נקודות אחוז" for numbers below one.
9. **6.3-1 and 6.3-4:** exercise 6 cannot be answered from the page; the mix lever is "works" in 6.3 and "a wall" in 6.4 with no word that these are two different moves.
10. **X-5 and phone:** the videos of 6.1–6.3 lack the illustration mark and the shekel sign sits on the wrong side in 6.4 and 6.5; the 6.2 and 6.3 reading tables push the equity and cost columns out of view.
