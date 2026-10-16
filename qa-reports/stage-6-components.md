# QA report: the interactive components of stage 6, in a real browser

Date: 2026-10-16

I edited no source file. I served `dist/` with a small Node static server and drove Chromium (`/opt/pw-browsers/chromium-1194`, `playwright-core`) at 390x844 (touch) and 1280x900, with every stage lock opened by `addInitScript`. Scripts and screenshots are in my scratch folder (`.../scratchpad/qa6/`), not in the repo. Props of every island were read from the `astro-island` attributes, and the expected numbers from `data/lessons/6-X.json`.

**Coverage, all done at both widths.**
- PositioningCalculator (6.2), LeverMap (6.3), BigPictureMap (6.1), LeverPrice (6.4), TwoStories + CardSort (6.5), FourClocks (6.6), NegotiationLines (6.7), BankMixCompare (6.8), UnderwriterDay (6.9), ConversationTree (6.10), CaseAPlanner (6.11). Also, because they sit in the same lessons: CardSort in 6.1 and 6.2, MatchTable in 6.3, and Prediction + PredictionReveal in all eleven lessons.
- **Exercises, in full.** Every NumericExercise (42), ChoiceExercise (35) and FillTable (11) of lessons 6.1 to 6.11, 178 components per run, both widths (the runs were repeated after I fixed a bug in my own option matcher):
  - Numeric: the first listed wrong answer gives exactly its own note; every other listed wrong answer gives its note; an unlisted wrong answer gives the hint (or the default line); "abc" gives the unreadable line; the right answer is accepted and opens the solution; the solution stays closed after one wrong try and opens after two; no listed wrong answer lies within tolerance of the right one; no duplicate error values; each solution text contains the answer.
  - Choice: every option clicked; exactly one correct option per exercise; the correct one turns green and its verdict does not read as a refusal; every wrong one turns amber and does not read as "נכון".
  - FillTable: a wrong cell is refused and is the only red cell; the right values give "הכול נכון"; "הצגת הטבלה המלאה" shows the same values.
- Whole-page checks on all 11 lessons at both widths: horizontal overflow, text under 12px, tap targets under 44px, console, and (desktop) Tab rings through every control of every component. Table views opened and finished states reached for the phone audit.
- **Untested:** the 1280px keyboard ring walk was done on desktop only; at 390px I checked rings by the same CSS, not with a physical keyboard. Hebrew bidi order of numbers was not probed (stage 5 did that); I only read the text. The hosted site (as opposed to `dist` on my server) was not tested, and video playback was not tested (my static server has no range support, so `/video/6-X.mp4` shows as a failed request in my logs; that is my server, not a defect).

**Clean.**
- No console error, warning, hydration message or page error in any state, in any lesson.
- No page-level horizontal scroll at 390px (document width 390 in every lesson, also with all tables open).
- All numbers of all guided tasks reproduce the lesson and `data/lessons/6-X.json` (details per component below).
- All 178 exercises behave as described above: 0 failures.
- All 325 paths of the ConversationTree, walked through the UI, work.
- Every Tab stop in the 12 stage-6 components draws a ring, except one native control (nit).

## Summary

| Severity | Count | Items |
| --- | --- | --- |
| blocker | 0 | none |
| should-fix | 3 | NegotiationLines-1 (rounds table cut on a phone: the rule column is out of sight) · BankMixCompare-1 (the verdict is 700-1,120px below the controls on a phone) · NegotiationLines-2 (round sliders are 617-793px above their result on a phone) |
| nit | 12 | listed below |

## Should-fix

- **NegotiationLines-1: on a phone the rounds table is cut and its key column is invisible.** At 390px the table is 544px in a 292px box. You see "סבב / מתי / חסך", and the "מול ההצעה" column is cut after the word "זולה"/"יקרה" (the amount is gone); "מה אומר הכלל", the column the lesson task 2 and 3 ask about, is never seen without sideways scrolling. The box has no focus stop (`tabIndex` -1) so a keyboard user cannot scroll it. The component-level hint ("בתוך הרכיב יש טבלה רחבה…") is drawn at the very top of the component, 1,000px or more above the table. The verdict box below repeats the stop reason, which softens it, but not the per-round numbers.
  - Steps: lesson 6.7, 390px, scroll to the second box of the component ("סבבים"). Screenshot: `qa6/nl-table-390.png`.
  - Likely code: `src/components/NegotiationLines.vue:170` (`min-w-[34rem]` in an `overflow-x-auto` box); the hint comes from the `astro-island[data-wide-table]::before` rule in `src/styles/main.css:247`.
  - Fix: below `sm` draw each round as a card (the pattern FillTable already uses with `data-stacked`), or put the verdict column first.
- **BankMixCompare-1: the verdict sits far below the controls on a phone.** At 390px the sentence that answers the chosen goal ("ביעד … ההצעה הנגדית טובה יותר. המחיר: …", the thing lesson tasks 1-3 ask for) is 714px below the goal radios and 1,122px below the tab you tap; the four measure cards are 88px (radios) / 496px (tab) below. Cause: verdict is after the four cards and the 329 box.
  - Steps: 6.8, 390px, tap the second tab or a goal radio; the verdict is outside the 844px viewport.
  - Likely code: `src/components/BankMixCompare.vue:149` (the verdict box) comes after `:131` (the rows).
  - Fix: move the verdict directly under the goal radios (the same fix as stage 4 Checkers-1 / stage 5 MixBuilder-1), or make it sticky on a phone like PositioningCalculator's status line.
- **NegotiationLines-2: round sliders far from their result on a phone.** Round 1 slider to the rounds table: 617px; to the verdict: 793px. The notch slider and the threshold slider are near their results (56px, 232px), so only the three round sliders are affected.
  - Fix: put the verdict (or a one-line summary) above the table, or sticky.

## Nits

- **FourClocks-1: text 11px.** The "הקובע" badge uses `text-micro` (11px): `src/components/FourClocks.vue:148` (`--text-micro: 11px` in `src/styles/main.css:64`). Under the 12px floor.
- **LeverPrice-1: reset button is 35px wide.** "איפוס" is 35x44 at both widths (`src/components/LeverPrice.vue:200`, `min-h-11` without `min-w-11`). Under 44px in one dimension.
- **FourClocks-2: the slider label says "עד 5" while the slider goes to 7.** Each bank's answer slider has `max=7`, but the aria-label reads "ימי עסקים עד התשובה, עד 5" for banks that answered in 5 or fewer (`FourClocks.vue:131`, `limit(b.id)` depends on the current value). A screen-reader user is told 5 and can set 7.
- **Tab pattern, half done (TwoStories, BankMixCompare).** `role="tab"` / `aria-selected`, every tab `tabindex=0`, ArrowRight/ArrowLeft do nothing (`TwoStories.vue:87`, `BankMixCompare.vue:91`). Same as stage 5 MixJudge-1. No `role="tabpanel"` either.
- **FourClocks-3: the native date-picker icon is a Tab stop with no ring** (Chromium's calendar indicator inside `input[type=date]`, `FourClocks.vue` date input). The input itself has a ring.
- **FourClocks-4: money format.** "+65 ₪" for a fact that is 65.00, next to "+82.16 ₪" and "+29,577.01 ₪" in the same panel. `.00` is dropped by `formatShekelsText`. Also BankMixCompare's toy line shows "6,836 ₪" next to "6,287.50 ₪". Consistent in itself, but two conventions side by side.
- **Money in plain text: the sign sits left of the number in several cards** ("₪ 423,000", "₪ 2,106.30" in the PositioningCalculator cards on a phone, as in the screenshot `qa6/pc390.png`) while the `.ltr` spans put it right. Same as stage 5.
- **UnderwriterDay-1: "0.10 נקודת אחוז" in the relief buttons** versus "0.25 נקודות אחוז" in the result text (`UnderwriterDay.vue`, the `p === 0 ? … : \`${pts(p)} נקודת אחוז\`` button label). Same for CaseAPlanner's "הנחה של 0.15 נקודות אחוז" (plural) beside the lesson's "נקודת אחוז".
- **BankMixCompare-2: "ב־סך התשלומים".** The verdict joins labels with a hyphen prefix: "מה שביקשתם טוב יותר ב־סך התשלומים, כמה ההחזר יכול לעלות (תרחיש מחמיר)." (`BankMixCompare.vue`, `others.map((o) => o.label).join(", ")` after "ב־"). Reads oddly; the second label also lacks its own "ב".
- **NegotiationLines-3: row 3 of the round table says "עצרו: אין זמן" although round 3 fits.** In the default state the third round (0 points, answered 19.11, inside the terms) is labelled "אין זמן" because round 4 would not fit (fact `stop.late`). The verdict box (stop after round 2) is right, so this only confuses a reader of the table. Component: `NegotiationLines.vue:186`. Also there is no fourth round row, though the lesson facts have four round dates (`round_4.fits = no`); the lesson text does not depend on it.
- **LeverMap-1: lesson 6.3 task 2 says both "התנהלות החשבון" and "הבנק" are marked "לא ידוע".** On the cards the claim-type tag of התנהלות החשבון is "ידע מהשטח" (the words "לא ידוע" are inside its text), and only "הבנק שפונים אליו" carries the tag "לא ידוע" (`src/data/lever-map.ts:90`, `:134`; text in `src/pages/lessons/6-3.mdx` item 2 of "מה הייתם אמורים לראות"). Task 3 says the same about "הרכב התמהיל" and "עיתוי" (tags "חישוב" and "ידע מהשטח"). Say "בטקסט כתוב לא ידוע" or align the tags.
- **Phone: the cards a guided task asks for are far below the sliders in PositioningCalculator (6.2).** The status line is sticky (good: ratios visible, 108-324px from each slider), but the shekel costs the tasks read ("423,000 ₪", "17,000 ₪", "3,125.15 ₪") are in the line cards 560-1,890px below (first card 562-778px, the 40% line is the third card). Not as bad as stage 5 (1,100-1,400px), and the status line mitigates it. Also LeverPrice (results 264px below, not sticky), FourClocks (timeline 291-404px, summary 599-712px below the today and answer sliders; the prime and lapse panels are 52px, good), CaseAPlanner (first bank card 100-322px, last 472-694px), LeverMap (card 64-412px below the button you tap, card 640-770px tall). Within a screen and a half; no result is above 1,200px.

## Per component

- **PositioningCalculator (6.2).** Controls: equity (0-400,000 step 1,000), income (0-4,000 step 50), term (15-30, step 1), table toggle; the car and wait controls are not configured here. Start: ratio 40.4%, financing 74.55%, payment 8,181.30, disposable 20,250; lines match the lesson: crossed 30%, 35%, 40% (capital) on payment ratio and 40%, 60% on financing; 50% and 75% not crossed. Task 2: equity 16,000 gives 40.01% (still over), 17,000 gives 39.98% and 73.77%, the 40% card flips to "לא נחצה"; the 40% card at start says 17,000 and 203.25 (facts `a.loancut.40`, `a.income.40`). Task 3: 35% card says 220,000 and 3,125.15 (facts `a.loancut.35`, `a.income.35`); at 220,000 the ratio is 34.98%; income 3,100 gives 35.04% (still over), 3,150 gives 34.96%. Term 15 gives 61.41%, 30 returns to 40.4%. Same at both widths.
- **LeverMap (6.3).** 9 levers, one `aria-pressed` at a time, every card has the three text parts, four effects, the case-A sentence and a claim tag. Every case-A sentence number is in `data/lessons/6-3.json` (38.53, 76.18, 39.84, 8,068.47, 112.83, 40,618.11, 37.7, 11,600, 44.41, 3,125.15, 203.25, 10,000). Task 1 (closing loans vs extra equity: ratio better both, financing opposite, cushion worse both) holds; task 2 holds (conduct and bank "לא זז" on the ratio). The table view has 9 rows (576px in a 324px box on a phone, hint present).
- **BigPictureMap (6.1).** All 104 nodes clicked in the map view (1280px), in the list view (1280px "הצגה כרשימה" and 390px). Each click: exactly one selected node, card shows the label, every incoming and outgoing link's text, the number of link buttons equals the data (215 links), the neighbours are highlighted, the card opens directly under the node on a phone (never more than 120px from it). Tasks 1-3 hold: equity leads to seller, financing ratio, loan amount, payment ratio; loan amount to financing ratio and monthly payment; obligations to disposable income, feasibility sheet and payment ratio, with no link to financing ratio; financing ratio and payment ratio both reach credit risk, capital requirements (through capital threshold on the payment side) and bank policy.
- **LeverPrice (6.4).** Six levers; equity 16,000 and 17,000 (39.98%, 8,096.49, 73.77%, 12,153.51 left, 17,000 cash, 23,000 savings left, 30,528 less over the loan, 100.92 less in the stress, 40,476 per point), close from savings (37.7%, 36,000, 4,000 left, 13,333 per point), close from equity (76.18%, 38.53%, 8,360.88, "לא אפשרי", +64,656, +208), wait 7 (40.4%), 8 (37.7%), 9 (37.7%, "9 חודשי המתנה"), borrower 4,000 (33.74%, gain 6.66), term +60 months (37.67%, 7,627.74, +258,386, ban at 420 months) and -60 (44.41%, 8,992.91, 247,391 less, gain "גבוה יותר" 4.01), mix +10 (40.26%, 8,152.49, ban, 10,366 less, +152 stress). All match the facts. "איפוס" resets every control. The table has 8 rows.
- **TwoStories (6.5).** Three scenarios; wrong picks give "סימנתם ״…״", the four check tables, "לנסות שוב" clears the picks; "בדקו" is disabled until both stories are picked; verdicts equal the four answers (all "כן" = מיצוב). Lesson tasks hold (37.7% in both stories; Avi's second story passes only check 4; the gift scenario gains nothing). End state: "נפתרו 3 מתוך 3" and the success line. Table: 6 rows.
- **CardSort (6.5, also 6.1 and 6.2).** 6.5: ten cards: every wrong pile gives "לא בדיוק … ״pile״ עונה על …", the right pile gives "נכון: …" with the reason, focus moves to the explanation then back to the next card, the end line counts mistakes ("עם 10 טעויות בדרך"), "להתחיל מחדש" resets to "קלף 1 מתוך 10". 6.1 (6 cards, 3 piles, 1 given) and 6.2 (8 cards, 4 piles, 1 given): same, no issue.
- **FourClocks (6.6).** Start: A is "הקובע", 18 days, 3 rounds, last day to ask 17.11, one decision (23.11), as the lesson. Task 2 (B without a new lien): B governing, terms to 17.11, 8 days, 0 rounds, no decisions inside. Task 3 (today = 2 days after the request): 5 rounds. A answers at 7 (extended): terms to 3.12 and B becomes the governing one. Prime +0.25: +82.16 / +29,577.01; -0.25: -80.99 / -29,153.19; fixed lapse +0.2: +65 / +23,402.11; zero positions give 0. The target select works. A date out of range shows the message and hides the results. Table opens (480px in a 324px box on a phone, hint present).
- **NegotiationLines (6.7).** Notch 0.1: prime 32.54 / 11,711.43, variable 31.64 / 11,385.92, fixed 32.21 / 11,599.42, all 96.39 / 34,696.77; 0.05: 16.13 / 5,807.84 on the fixed track; 0.25 scales. Round simulator, default: round 1 saves 34,696.77 ("זולה ב־23,494.13", continue), round 2 saves 5,771.22 ("זולה ב־29,265.35", stop: small gain), verdict "עוצרים אחרי סבב 2". Line at 36,000: stop after round 1. Round 1 set to 0: gain 0, "יקרה ב־11,202.64", stop after round 1. Everything at 0.3: "עוצרים: הסבב הבא לא נכנס בזמן". Exercise 6.7-4's answer (23,494.13) is on the page. The target select works (prime only: 11,711.43, gap 508.79).
- **BankMixCompare (6.8).** Two counters (bank B swap, bank C half-half) x three goals. B: first 8,150.17 to 7,804.61, total 2,934,061.70 to 3,107,086.13, rise 1,250.54 to 5,740.81, ratio 40.25% to 38.52%, shares 66.65/33.29 and 0/33.35: tasks 1 and 2 hold ("יציבות": the request is better). C: 8,180.70 to 8,261.28, 2,945,052.53 to 2,974,055.68, 1,252.95 to 1,004.82, 40.4% to 40.8%: task 3 holds (better for stability, paid with first payment, total and ratio over 40%). Toy margins 6,287.50 / 6,834.50 and 6,836 / 6,150 match the facts. Goal row is highlighted.
- **UnderwriterDay (6.9).** Five files, each shows the right LTV and ratio (50/18.71, 63/40.55, 72/24.94, 70.59/46.05, 74.55/40.4). Wrong decisions on all five give "לא מדויק" with the rule lines and "מה התיק לא אומר לחתם"; the end line says "0 מתוך 5"; "להתחיל את היום מחדש" resets. The decisions as the lesson says are accepted: file 1 approve with 0.25, file 2 approve with 0.10, file 3 approve with 0.15, file 4 refuse (46.05% over 45%), file 5 approve with no relief at 4.60/4.10/4.40 (the check button stays disabled until a relief is chosen after "מאשרים"); the end line says "5 מתוך 5", the table lists all five. After a check the decision buttons are disabled.
- **ConversationTree (6.10).** 11 nodes, 325 root-to-end paths, all walked through the UI at both widths (974 clicks each). Every option shows its question and label, the feedback box has the right tone class and word, focus moves to the new question, "לשנות" goes back to the right step, each ending shows its title and the right tally ("הבחירות שלכם: x שמשרתות, y עם מחיר, z שפוגעות"). Endings: good 108 paths, ok 108, bad 108, red-line 1. No dangling or unreachable node. The numbers of the good path match the facts (60,000 short, 80.41 vs 238.23, 40,245.89).
- **CaseAPlanner (6.11).** Start 40.4%, banks A/B/C approve at list, D refuses on LTV over 70%. Equity 17,000: 39.98%, A gets 0.15 relief; 21,000: 39.88% / 73.59% / 19,000 left, A 7,934 and 2,856,249, B 8,046 and 2,896,495, C 8,076 and 2,907,344, no relief for B and C. Car close or wait: 37.7%, A 0.15 and C 0.20 relief, 4,000 left on the close. Parent: 33.74%, relief 0.15 / 0.25 / 0.20. 21,000 + car close: "החסכונות לא מספיקים לכל המנופים שבחרתם." The table (4 rows) fits on a phone.
- **Prediction + PredictionReveal (all 11 lessons).** Every option picked, the page reloaded: the lock persists, the reveal shows the guess, praises only the correct one and shows the note of the wrong one (all wrong options have notes). The lock button is disabled until a choice is made, focus goes to the saved line.
- **MatchTable (6.3).** Empty check asks for answers, wrong answers get `aria-invalid` on all 4, right answers give "הכול נכון", reveal shows all.

## Exercises (6.1 to 6.11): result

| Lesson | Numeric | Choice | FillTable | Result |
| --- | --- | --- | --- | --- |
| 6.1 | 3 | 4 | 1 | all ok |
| 6.2 | 5 | 2 | 1 | all ok |
| 6.3 | 4 | 2 | 1 | all ok |
| 6.4 | 5 | 3 | 1 | all ok |
| 6.5 | 3 | 5 | 1 | all ok |
| 6.6 | 5 | 2 | 1 | all ok |
| 6.7 | 4 | 3 | 1 | all ok |
| 6.8 | 4 | 3 | 1 | all ok |
| 6.9 | 4 | 3 | 1 | all ok |
| 6.10 | 4 | 3 | 1 | all ok |
| 6.11 | 4 | 3 | 1 | all ok |

Hint logic: only two exercises carry their own `hint` (6.4-3 and 6.5-3); both show it for an unlisted wrong answer; all others show the default "עדיין לא. חזרו לדוגמה הפתורה…". Every unit that is not shekels (percent, days, months, points) is exact (tolerance 0.05, `near` 0).
