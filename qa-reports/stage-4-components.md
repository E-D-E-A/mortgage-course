# QA report: the interactive components of stage 4, in a real browser

Date: 2026-10-12

I edited no source file. I copied the built `dist/` (built 2026-10-12 11:15, after the last change to `src/` and `data/`) to my scratch folder and served the copy with a small Node server on a random port. I drove Chromium (`/opt/pw-browsers/chromium-1194`) through `playwright-core` at 390×844 (phone, touch on) and 1280×900 (desktop), and opened every stage lock with `addInitScript` (`mogi-course:check:0..9 = {"passed":true}`) before each page load. Each component was scrolled into view and waited on until its island hydrated. Screenshots are in `qa/components/stage-4/` (gitignored). The scripts are in my scratch folder, not in the repo. The harness is the stage-3 one, extended with a bidi probe: it measures the x position of the first and last character of every number, range, signed number, date and Latin id to see whether it is drawn backwards, and it finds a number whose ₪ sign wraps onto the next line.

For every component and both widths I checked:
- horizontal page scroll;
- text below 12px, clipped text, and text off screen;
- RTL on the component, LTR on `.ltr` spans, and numbers, ranges, signs and ids outside an `.ltr` span (measured, not guessed);
- touch targets (the box of each button, input, select and slider; a checkbox or radio by its label);
- the Tab order, and whether each Tab stop draws a focus ring;
- Enter and Space on buttons, arrows, Home and End on sliders, arrows on radios and selects;
- where focus is after each action (never `<body>`);
- console errors and warnings, page errors and hydration messages;
- that the table or list view matches the visual;
- that the numbers match `data/lessons/4-X.json`, with the checkers' figures recomputed in Python `Decimal`;
- edge inputs: empty, zero, negative, huge, non-numeric and out-of-range values, a zero income, a negative disposable income, and both ends of every slider;
- names for screen readers on controls and charts.

Components, and where they are used: PayslipAnatomy (4.1), PaymentRatioChecker in `disposable` mode (4.2) and in `ratio` mode (4.3), RegulationChecker (4.4), ThreeKindsLadder (4.5), FamilyBudget (4.6), VerifiedGap (4.7), StatementReader (4.8), AppraisalGap (4.9), FactorCards (4.10 with 9 cards, 4.11 with 13 cards: all 22), RateTower (4.12), QuestionnaireCompare (4.13), FeasibilitySheet (4.15), BidiText (inside FactorCards and RateTower, and on its own), BigPictureMap in 4.10 and in 4.14. Also every shared exercise on the stage-4 pages: 15 FillTable (one on each page), 67 NumericExercise, 38 ChoiceExercise, 1 CardSort (4.5), 15 Prediction with their 15 PredictionReveal, and 2 MatchTable (4.11, 4.12).

**Colours:** none of the 22 component files, the two big-picture stage files, `factor-cards-view.ts`, `bidi.ts` or the two data files has a raw hex, `rgb()` or `hsl()`. No rendered element inside any of them carries one in a `style`, `fill`, `stroke` or `stop-color` attribute. Inline styles and SVG attributes use `var(--mogi-…)` tokens only (`--mogi-teal-deep`, `--mogi-turquoise-2`, `--mogi-navy`, `--mogi-n300`, `--mogi-warning`, `--mogi-danger`). Every Tailwind colour class used exists as a token (`bg-info-bg`, `bg-success-bg`, `bg-warning-bg`, `bg-danger-bg`, and the rest). The only hex values are in `src/styles/tokens.css`.

**Layout, text, targets, rings:** at both widths no component causes horizontal page scroll. No text is under 12px and none is clipped or off screen, except the clipped answers in the five FillTables below. Every button, input, select and slider is at least 44×44 except the inline glossary buttons (`<Term>`) in the text of a question, which are 25px tall (see the nits at the end). Every Tab stop draws a focus ring, and the Tab order follows the reading order in all 14 components. Every chart is `role="img"` with an `aria-label` (RegulationChecker, ThreeKindsLadder, FamilyBudget); the bars of PaymentRatioChecker and the tower of RateTower are `aria-hidden`, and the same figures are in text next to them.

**Since stage 3:** the three stage-3 repeated bugs have been fixed where I could see it. `parseAnswer` now refuses "12abc", "1e1", "1.2.3" and "5-" (all four tested in every NumericExercise and every FillTable). BigPictureMap has a `newFrom` prop, so 4.10 marks the nodes of 4.1–4.10 as "חדש בשלב הזה" (22 marked plus the selected node plus 3 that are shown as "related", which has priority over "new"; 26 in all). `BidiText` and `numberPieces` are used in FactorCards, RateTower, FillTable row names and BigPictureCard, and every number, range, id and date in those is drawn correctly.

**Console:** no component threw, warned or reported a hydration mismatch, at either width, in any state I opened. The only failed requests were the lesson videos (`/video/4-X.mp4`), which Chromium aborts after reading the metadata.

## Summary

| Severity | Count | Bugs |
| --- | --- | --- |
| חוסם (must fix) | 0 | — |
| חשוב (should fix) | 9 | FactorCards-1: opening a card while another is open above it throws the clicked card off screen · BigPictureMap-1: the same on a phone list · BigPictureMap-2: focus lands under the sticky header after a card link on desktop · Prediction-1: focus falls to `<body>` after "זה הניחוש שלי" (all 15 pages) · ChoiceExercise-1: ranges drawn backwards in 4.11 · ChoiceExercise-2: "נכון. נכון." on every correct answer (all 38) · FillTable-1: five tables wider than a phone and their answers clipped · VerifiedGap-1: tasks 2 and 3 on the page do not produce the numbers the answers give · Checkers-1: on a phone the result is up to 1,350px from the slider you are moving |
| קטן (nit) | 26 | listed under each component |

Three causes repeat across components:
- **An element that removes itself takes focus with it, or removes what the learner just clicked from the screen.** The Prediction lock button (Prediction-1); the open card above a clicked card in FactorCards and in the BigPictureMap list (the page does not scroll to compensate).
- **A number and its sign that wrap or are drawn in plain RTL text.** The ₪ sign wraps alone onto the next line in FeasibilitySheet and in two phone tables (RegulationChecker-2). "0.7–0.8" is drawn "0.8–0.7" in plain text inside a ChoiceExercise (ChoiceExercise-1). The stage-3 fix (BidiText) was applied to FactorCards, RateTower and the map cards but not to ChoiceExercise's question and option text, nor to the prose of 4-12.
- **Negative amounts use the Intl hyphen-minus ("‎-2,950.00 ₪", "-1.5", "-0.5%") while the rest of the course writes "−".** PaymentRatioChecker, FamilyBudget, RegulationChecker's table, StatementReader's table and RateTower's spread and rate. FeasibilitySheet and RateTower's layer sizes already use "−". The order is right everywhere (all inside `.ltr`), so this is cosmetic; see the nit under each component.

Cross-component notes, not counted as bugs:
- **No slider has `aria-valuetext`.** A screen reader hears "1700000", not "1,700,000 ₪". The slider's name is its whole `<label>` text, caption, value and help text together: up to 105 characters in RegulationChecker, 98 in FamilyBudget ("החלק בריבית שיכולה להשתנות 840,000 ₪ פריים, ומסלול שהריבית בו…"), so the name changes every time the value does.
- **The library has a display gap at the 50% line that the sliders cannot reach.** `checkRegulation` with a payment of 8,000.79 on an income of 16,000 gives 50.0049%, status "over", and the screen writes "50%" beside "חוצה — אסור" (`percentString` rounds to two decimals, the verdict is exact). Every slider step in the stage-4 components lands on 50.00% exactly or on 50.2% and above, so no learner sees it today, but RegulationChecker is reused in 5.10 and 8.7 with other props.
- **The boundary itself is right everywhere.** Exactly 50.00% (8,000 on 16,000) is "בתוך הקו" with "אפשר לגדול עוד 0 ₪" in RegulationChecker, and "לא נחצה" in ThreeKindsLadder. 50.63% (8,100) is "חוצה — אסור" in both. Exactly 40.00% (6,400) is "בתוך הקו" / "לא נחצה" and 40.63% is "מעל הסף — מותר". This is what 4.4 says ("עולה על", so exactly 50.00% is allowed; `4-4.mdx:467`). In Python `Decimal`: 8000/16000 = 50.0000 (not greater than 50), 8001.60/16000 = 50.0100 (greater).

## PayslipAnatomy (4.1)

Bugs:
- **PayslipAnatomy-1 · קטן (nit): the payslip box has an `aria-label` and no role.** `<div aria-label="תלוש שכר לדוגמה של מיכל, אוגוסט">` is ignored by screen readers (a name on a generic element is not announced), so the learner hears the lines but not which month and person they belong to, except from the heading line inside.
  - Likely code: `src/components/PayslipAnatomy.vue:65`. Add `role="group"` (or `role="region"`) or move the label to the `<p>` heading with `aria-labelledby`.

What works:
- All three months match `data/lessons/4-1.json` (`slip.table`): gross 10,650 / 10,700 / 10,750; net 8,150 / 8,200 / 8,250; net to pay 7,700 / 7,750 / 7,800. The average is 8,200 (net) or 7,750 (net to pay), the gap 450, as the lesson's second answer says.
- The month buttons and the basis buttons take Enter and Space, report `aria-pressed`, and keep focus. The note changes with the basis ("לא ירד כאן" against "כבר ירדו… ספרנו אותה פעמיים"). The table button keeps focus when it turns into "הסתרת הטבלה". The table equals the three months. On a phone it is 480px in a 324px box and the scroll hint is shown.
- No bidi problem, no small text, no console message at either width.

## PaymentRatioChecker, `disposable` mode (4.2)

Bugs:
- **PaymentRatioChecker-1 · קטן (nit): a negative disposable income is written with the hyphen-minus and has no word of explanation.** With both incomes at 0 and the 1,450 ₪ car loan counted, the card says "‎-2,950.00 ₪" (hyphen, from `Intl.NumberFormat`) next to "0.00 ₪ מוכרת, פחות 2,950.00 ₪ התחייבויות". The table row shows the same. In `ratio` mode the same state shows "אין הכנסה פנויה", which is right, but the number beside it is the same hyphen.
  - Steps: in 4.2 set both incomes to 0.
  - Expected: "−2,950.00 ₪" (the real minus the rest of the course uses), or a sentence "ההתחייבויות גדולות מההכנסה".
  - Screenshot: `qa/components/stage-4/PaymentRatioChecker-ratio-phone-03-negative-disposable-table.png`.
  - Likely code: `src/lib/calc/money.ts:formatShekels`, used through `sh()` at `PaymentRatioChecker.vue:120` (shown at `:213` and `:269`). FeasibilitySheet already has `.replace("-", "−")` (line 38).
- **PaymentRatioChecker-2 · קטן (nit): three checkboxes with the same name.** "אין תאריך סיום" appears once per obligation (three times in 4.2, with the label as plain text), so a screen-reader user who lists the checkboxes cannot tell which obligation each one belongs to. The sliders do say it ("כמה תשלומים נשארו: הלוואת הרכב").
  - Likely code: `src/components/PaymentRatioChecker.vue:157–160`. Add `:aria-label="`אין תאריך סיום: ${o.label}`"`.

What works:
- The four tasks of the page match `data/lessons/4-2.json`. Default: recognised 21,700, car 1,450 counted, disposable 20,250 (`case.disposable`). The car at 19 payments is still counted (20,250), at 18 it is not (21,700 = `task.car_gone`). A 2,000 ₪ leasing at 19 payments gives 18,250, at 18 payments 20,250 (`task.leasing19`, `task.leasing18`). Rent of 4,000 with "ימשיכו לשלם" gives 16,250, without 20,250 (`task.rent_continues`, `task.rent_ends`), with no dependence on the months. Alimony of 1,500 with "אין תאריך סיום" gives 18,750 (`task.alimony_unknown`), and its months slider is disabled.
- Each obligation shows the right reason line ("נשארו יותר מ־18…", "…18 או פחות: לא נספרת", "אין תאריך סיום: נספרת, ומסומנת לבדיקה", "שכר דירה שייגמר… לא נספר").
- Checkboxes take Space and keep focus. The table matches the cards. Zero income and a negative disposable income do not break it (no NaN, no division by zero).

## PaymentRatioChecker, `ratio` mode (4.3)

Bugs:
- See Checkers-1 below (results far from the sliders on a phone), and PaymentRatioChecker-1 and -2 above, which apply here too.

What works:
- Every number of the page matches `data/lessons/4-3.json`. Default (two tracks of 565,000 at 4.6% and 4.1%, 25 years): payment 6,186.17, disposable 15,700, ratio 39.4% (`b.payment`, `b.ratio_recognised`). Avi at 11,000: 32.22%. Avi at 8,000: 38.19%. A 1,000 ₪ existing mortgage on the same property with 120 payments: 7,186.17 over 15,700 = 45.77% (`t.same`); on another property 42.08% (`t.other`); with 15 payments left 39.4% (`t.short`). Bullet: 4,096.25 and 26.09% (`t.bullet_pay`, `t.bullet_ratio`).
- Recomputed in Python `Decimal` (each track's payment rounded to the agora, then added, as the component says): 3,172.61 + 3,013.56 = 6,186.17 = 39.4024% of 15,700; with 12 months of partial grace the payment after it is 6,329.34 (shown 6,329.34, ratio 40.31%); bullet 2,165.83 + 1,930.42 = 4,096.25; two tracks of 2,500,000 at 9% for 4 years: 124,425.22 (shown 124,425.22, ratio 159.52% on 78,000).
- Edge cases: both incomes at 0 gives "אין הכנסה פנויה", both tracks at 0 gives 0 ₪ and 0%, the ratio of 159.52% fills the bar to 100% and no more. The structure buttons take Enter and keep focus. The rate slider takes Home, End, arrows and PageDown (in RTL, ArrowLeft raises the rate).
- The bar and its legend are text-labelled, and the ratio is also in a `role="status"` card. The table has one row per obligation plus the disposable income and the ratio ("—" when there is none).

## RegulationChecker (4.4)

Bugs:
- **RegulationChecker-1 · קטן (nit): in the table view the term's distance from the line is drawn backwards and with a hyphen.** With a term over 30 years, the "מרחק מהקו" cell reads "-60 חודשים", and because it is plain text in an RTL cell the minus lands on the right of the number ("60-").
  - Steps: in 4.4 move "התקופה של המסלול הארוך ביותר" to 35 and press "הצגה כטבלה".
  - Expected: "−60 חודשים", the sign on the left of the number (a `.ltr` span, as the shekel cells next to it have).
  - Actual: measured at 1280px, the "-" at x=323 and the "6" at x=315 for the cell text "-60"; at 390px x=116 and x=108. The shekel cells show "‎-3,333.34 ₪" in an `.ltr` span, which is the right order but again with the hyphen.
  - Screenshot: `qa/components/stage-4/RegulationChecker-BUG-table-term-32y-desktop-02-term-room-reversed-and-cells-squeezed.png` (and `…-phone-01-…`).
  - Likely code: `src/components/RegulationChecker.vue:233`: `<span v-if="isTerm(l)">{{ l.room.toNumber() }} חודשים</span>`. Use `.ltr` and "−".
- **RegulationChecker-2 · קטן (nit): on a phone the table has no minimum width, so its cells squeeze and break.** The other stage-4 tables have `min-w-[22rem]` or `min-w-[30rem]` inside `overflow-x-auto`. This one wraps instead: "2,990,000.00" and its "₪" fall on two lines, "בתוך הקו" on two, and the row labels on three. The scroll hint is not needed because it never scrolls.
  - Steps: at 390px press "הצגה כטבלה".
  - Screenshot: `qa/components/stage-4/RegulationChecker-phone-03-table.png`.
  - Likely code: `src/components/RegulationChecker.vue:217`: add `min-w-[30rem]` inside the `overflow-x-auto` box, as VerifiedGap, AppraisalGap and PaymentRatioChecker have. (ThreeKindsLadder's table has the same lack, but its cells are short and it did not wrap in my checks.)
- **RegulationChecker-3 · קטן (nit): a space after "ב־".** The "room" sentences are `"ההלוואה גדולה מהמותר ב־" + " " + "40,000 ₪"`, so the Hebrew prefix is cut off from its number: "יותר מהמותר ב־ 40,000 ₪". On a phone the prefix and the number can also land on two lines ("ב־" / "1,000,000 ₪").
  - Likely code: `src/components/RegulationChecker.vue:94–96` and `:105`: join with no space, and put the number and the ₪ in one no-break piece.
- **RegulationChecker-4 · קטן (nit): the numbers can disagree at the 50% line when the props are not the page's.** See the cross-component note above (50.0049% shown as "50%" and "חוצה — אסור"). The sliders cannot reach it.

What works:
- The numbers match `data/lessons/4-4.json` (`ch.*`). Default (value 1,700,000, loan 1,200,000, payment 7,000, income 16,000, variable 840,000, 30 years): LTV 70.59% with room 75,000; ratio 43.75%, room under the ceiling 1,000, 600 over the capital line; variable 70%, over by 40,000; term 30 years. "Only the variable line is crossed"; the capital line is orange and allowed. With the variable part moved back to 800,000 (66.67%) and "מחליפים דירה": the ceiling drops to 70% and the loan is over it by 10,000 (`ch.loan_over_70`). At 32 years the term line is crossed by 24 months (`ch.long_months` = 384).
- The loan is clamped to the value and to at least 10,000; the variable part to the loan. At value 500,000 the loan follows it (500,000) and the variable part too. All sliders at their extreme (a ratio of 500%, a loan of 4,000,000 on a value of 4,000,000, 35 years) give four crossed bans, no NaN, and bars clamped at 100%. The limit label flips to the other side of its line near the edge and is never cut.
- The radio group takes arrows (ArrowDown moves to the next deal and checks it). The table at 640px and up has the five lines and the deal type, matching the visual.

## ThreeKindsLadder (4.5)

Bugs:
- **ThreeKindsLadder-1 · קטן (nit): at a bank policy of 48–50% the three line labels overlap and cannot be read.** The policy label and the 50% label sit at the same height; with the policy at 49% they print "49%" over "50%" ("5049%" in the screenshot), and at 50% the policy line is hidden behind the red one. The two lines at 35 and 40 are on different heights for this reason, but 48–50 are not.
  - Steps: in 4.5 move "הקו של בנק א׳" to 49 (or 50).
  - Measured: the label boxes of the policy and the limit overlap at 48, 49 and 50 at both widths (the other 12 values I tried, 20–47, do not overlap).
  - Screenshot: `qa/components/stage-4/ThreeKindsLadder-phone-02-policy49.png`, `qa/components/stage-4/ThreeKindsLadder-desktop-06-policy49.png`.
  - Likely code: `src/components/ThreeKindsLadder.vue:121`. Choose the height by the distance from the nearest other line, not by `l.key === 'threshold'`.

What works:
- The numbers match `data/lessons/4-5.json`: at 16,000 income the three maxima are 5,600 / 6,400 / 8,000 (`l.max_policy`, `l.max_40`, `l.max_50`). 6,800 gives 42.5% with the bank line (35) and the capital line (40) crossed and the ban (50) not (`c.c.ratio`). 5,000 gives 31.25% with nothing crossed. 8,400 gives 52.5% with all three crossed (`c.d.ratio`).
- Each line is judged on its own, with exact numbers: 50.00% is "לא נחצה", 50.63% is "נחצה"; 40.00% is "לא נחצה", 40.63% is "נחצה". A policy of 50 with a ratio of 50% is "לא נחצה" for the bank too.
- Extremes (income 5,000, payment 25,000: 500%) give a full bar, no NaN, and the `aria-label` follows the state ("יחס החזר 500%. מדיניות בנק א׳ 40%…"). The table matches the cards.

## FamilyBudget (4.6)

Bugs:
- **FamilyBudget-1 · קטן (nit): "1 חודשים".** The months slider's output and the table row say "1 חודשים" at the lowest value.
  - Steps: move "כמה חודשי תשלום נשארו להלוואה הזו" to 1.
  - Likely code: `src/components/FamilyBudget.vue:87` and `:164`.
  - Screenshot: `qa/components/stage-4/FamilyBudget-BUG-months-1-phone-07-1-hodashim.png`.
- **FamilyBudget-2 · קטן (nit): when the payments are bigger than the income the bar misleads.** With net 8,000, a mortgage of 20,000 and a loan of 5,000, the mortgage segment is drawn at 61% of the bar and the loan at 39% (the flex row shrinks both), as if they were shares of the income. The aria-label and the cards give the true figures ("נשאר לחיים -17,000 ₪").
  - Screenshot: `qa/components/stage-4/FamilyBudget-phone-01-extreme.png`.

What works:
- The numbers match `data/lessons/4-6.json`: left for living 11,200, 2,800 each, budget 11,800 so 600 short; ratio 34.74% on a disposable income of 19,000; the maxima 9,500 by the limit and 6,000 by the family's budget (`w.left`, `w.each`, `w.shortfall`, `w.ratio`, `w.max_50`, `w.max_for_budget`). Python: 19,000 − 6,600 − 1,200 = 11,200; 6,600 / 19,000 = 34.74%.
- The 18-month rule: 24 months gives a disposable income of 17,800, ratio 37.08% and a limit of 8,900, with "left for living" unchanged; 18 months gives 19,000 again; 19 months is counted (`w.months_over` = 24). A payment of 6,000 makes the margin exactly 0 ("מעל התקציב 0 ₪"). Six people give 1,866.67 each.
- Extremes (net 8,000, payment 20,000, loan 5,000, budget 25,000: a ratio of 666.67%; or everything at its minimum) give no NaN and no division by zero. The table has all ten rows and matches the cards.

## VerifiedGap (4.7)

Bugs:
- **VerifiedGap-1 · חשוב (should fix): tasks 2 and 3 on the page do not lead to the numbers the "מה הייתם אמורים לראות" gives.**
  - Task 2 says "החזירו את ההכנסה ל־11,000 והורידו את ההון העצמי ל־480,000". Followed to the letter (income slider at 11,000, equity at 480,000, cap 40%) the verified frame shows income 19,200, loan 1,170,000, payment 6,405.15 and ratio **33.4%**, "בתוך התקרה". The answer says the ratio on the verified income goes to **40.8%**, "כבר מעל 40%" (`ex5.ratio`). That number needs the income left at 7,500: the answer's state is income 7,500 and equity 480,000.
  - Task 3 says "שלבו את שניהם, ובחרו תקרה של 35%. כמה הון עצמי חסר?" Income 7,500, equity 480,000, cap 35% gives "ההלוואה צריכה להיות קטנה ב־**167,000** ₪"; the answer says **127,000** (`demo.equity_short_low`), which is the figure at the original equity of 520,000 ("בהכנסה המאומתת לבדה").
  - Steps: 4.7, set the sliders as the tasks say, compare with the answers.
  - Expected: the task text and the answers describe the same state (for task 2, "השאירו את ההכנסה ב־7,500 והורידו את ההון העצמי ל־480,000"; for task 3 either the answer's 167,000 or "בהכנסה המאומתת לבדה").
  - Screenshot: `qa/components/stage-4/VerifiedGap-BUG-task2-as-written-desktop-03-income-11000-equity-480000-cap40-ratio-33.4.png`, `qa/components/stage-4/VerifiedGap-BUG-task3-as-written-desktop-04-income-7500-equity-480000-cap35-short-167000.png`.
  - Likely code: `src/pages/lessons/4-7.mdx:226–227` (the tasks) and `:233–234` (the answers). The component is right.
- **VerifiedGap-2 · קטן (nit): one decimal here, two on the page.** The component shows "32.2%" and "39.4%"; the page's answer says "32.22%" (`case.ratio_declared`). It rounds with `toDecimalPlaces(1)`.
  - Likely code: `src/components/VerifiedGap.vue:56` (`pct`).

What works:
- The default frames match `data/lessons/4-7.json`: declared income 19,200, loan 1,130,000, payment 6,186.17, ratio 32.22%; verified 15,700 and 39.4%. The maximum loans at each cap match the data and a Python `Decimal` recompute (floored to 1,000): cap 50%: 1,753,000 declared and 1,433,000 verified; cap 40%: 1,402,000 and 1,147,000; cap 35%: 1,227,000 and 1,003,000 (`demo.max_loan_*`). With equity 480,000 the loan is 1,170,000 and the payment 6,405.15 (`ex5.answer`); with 400,000, 1,250,000 and 6,843.11 (Python agrees: 6,405.15 and 6,843.11, each track rounded to the agora).
- The first task's answer (39.4% and 32.22%, both under the 40% cap) holds. A cap radio takes arrow keys and keeps focus. Extreme (income 4,000, equity 400,000, cap 50%) gives 56.1% and a message with the shortfall of loan, no NaN. The table equals the two frames.

## StatementReader (4.8)

Bugs:
- **StatementReader-1 · קטן (nit): the months that are not read are only dimmed.** Rows outside the window get `opacity-40`, with no text, no `aria` state and no marker. For a screen reader, or on a bright phone, the three rows look the same, and the 40% opacity takes the grey text under 3:1.
  - Likely code: `src/components/StatementReader.vue:63`. Add a visible word ("לא נקרא") or a second cue.
- **StatementReader-2 · קטן (nit): "ב־1 החודש האחרון".** One month reads "ב־1 החודש האחרון" instead of "בחודש האחרון".
  - Likely code: `src/components/StatementReader.vue:78`.
  - Screenshot: `qa/components/stage-4/StatementReader-BUG-1-month-phone-08-b1-hachodesh-dim-rows.png`.

What works:
- The three windows match `data/lessons/4-8.json`: one month (September) 7,300, which is 200 under the recognised 7,500 (`window.gap_recognised_1`); two months 6,750, which is 750 under (`window.avg_2`, `window.gap_recognised_2`); three months 7,500, "בדיוק" the recognised amount, 3,500 under the declared 11,000 (`window.avg_3`, `window.gap_declared_3`). The lowest month-end balance follows the window (40,850 for one month, 40,550 for two and three).
- The slider takes Home, End and arrows, keeps focus, and stops at 1 and 3. The wide table is 480px in a 316px box on a phone with the scroll hint, and the box itself can be reached by Tab with a focus ring. The small table at the bottom ("הצגה כטבלה") matches the cards.

## AppraisalGap (4.9)

Bugs:
- **AppraisalGap-1 · קטן (nit): "הנמוך מבין המחיר לשמאות".** The frame title and the table header say "מול הנמוך מבין המחיר לשמאות", where the Hebrew needs "המחיר והשמאות".
  - Likely code: `src/components/AppraisalGap.vue:35`.
- **AppraisalGap-2 · קטן (nit): the phone table's cells wrap (the ₪ sign alone on a line).** "1,650,000.00 ₪" and "1,237,500.00 ₪" break after the number at 390px, because the table's `min-w-[22rem]` (352px) is not enough once the cells have padding.
  - Screenshot: `qa/components/stage-4/AppraisalGap-BUG-table-phone-09-table-cells-wrap-shekel-sign.png`.
  - Likely code: `src/components/AppraisalGap.vue:111` (`min-w-[22rem]`, and the `ltr` spans need `whitespace-nowrap`).

What works:
- The numbers match `data/lessons/4-9.json`: LTV against the price 68.5%, against the lower value 72.4%; maxima 1,237,500 and 1,170,000 (`case.ltv_price`, `case.ltv_appraisal`, `case.max_loan_*`). Python: 1,130,000 / 1,560,000 = 72.4%. The first task's edge holds: at an appraisal of 1,510,000 the loan is 74.8% (inside), at 1,500,000 it is 75.3% and "חסרים 5,000 ₪". With an appraisal above the price the two frames are equal and say so. With "דירה חליפית" (70%): 68.5% inside against the price, 72.4% over against the lower value, 38,000 missing (`1,130,000 − 1,092,000`).
- Extremes (price 500,000, loan 4,000,000: 800%; price 4,000,000 and appraisal 500,000; loan 0) give no NaN. The table matches the frames.

## FactorCards (4.10, 4.11: all 22 cards)

Bugs:
- **FactorCards-1 · חשוב (should fix): opening a card while another is open above it scrolls the clicked card off the screen.** The component keeps one card open: clicking a new card first closes the open one. When the closed card is above the clicked one, everything below it moves up, and the browser does not compensate, so the learner's header ends up above the viewport and the page shows some card further down.
  - Steps: open 4.11 (card 2 is open at first), scroll so the header of card 4 is in the middle of the screen, click it.
  - Expected: the clicked header stays where it is (or is scrolled into view).
  - Actual (a real mouse click): the clicked header moves from y=424 to y=−569 at 1280×900, and from y=396 to y=−1129 on a phone; the scroll position does not change. It happens every time with the card above it open (all five cards I tried in each of 4.10 and 4.11, at both widths).
  - Screenshot: `qa/components/stage-4/FactorCards-BUG-jump-desktop-before.png`, `…-after.png`, `…-phone-before.png`, `…-phone-after.png`.
  - Likely code: `src/components/FactorCards.vue:37` and `:78` (`toggle`). After the card changes, scroll the header into view (`scrollIntoView({block:"nearest"})` on `nextTick`, with a `scroll-mt` for the sticky header), or let more than one card stay open.
- **FactorCards-2 · קטן (nit): `aria-controls` points to an id that does not exist while the card is closed**, and the card texts show internal references to a learner ("FK-H-004", "BIR_MRTG_99", "Brain (דף 7503881)", "J-090"). The ids are drawn correctly (left to right, whole), so this is content, not display.
  - Likely code: `src/components/FactorCards.vue:77` (render the panel with `v-show`, or drop `aria-controls`); the references are in `src/data/factor-cards.ts`.

What works:
- All 22 cards open and show their eight questions (`<dt>` ×8) with no placeholder, NaN, `undefined` or `null`. 4.10 has nine cards (1, 3, 6, 7, 8, 9, 13, 14, 15; all "הלקוח", so there is no filter) and 4.11 has thirteen (2, 4, 5, 10, 11, 12, 16–22). The group filter in 4.11 has "כל הכרטיסים", "העסקה" (6 cards), "הבנק" (2), "התמהיל" (1), "הבנק והשוק" (1) and "התהליך" (3), reports `aria-pressed` on one button at a time, and keeps focus on the pressed filter.
- The examples are filled from the facts, and I recomputed all 22 by hand or in Python: card 1 (8,400 over 20,000 is 42%; the ceiling payment 10,000 and the capital-line payment 8,000), card 3 (450,000 of 1,800,000 is 25%; the gift 150,000 of 450,000 is 33.33%), card 5 (6,599.56 and 5,368.22, a difference of 1,231.34 in Python `Decimal`), card 8 (11 October + 60 days = 10 December 2026), card 11 (1,500,000 over 1,900,000 is 78.95%), card 12 (1 November + 60 = 31 December; + 120 = 1 March 2027), card 18 (20 October + 24 days = 13 November), card 19 (0.3 point on 1,000,000 is about 3,000), card 20 (360 + 850 = 1,210, 0.121%).
- Enter and Space open and close a card and keep focus on its header. The sources are in a `<details>`. Dates and ids are LTR. At 390px nothing is clipped.

## RateTower (4.12)

Bugs:
- **RateTower-1 · קטן (nit): the rate can go below zero with no word about it, and the spread and rate use the hyphen.** With every layer at its lowest (competition, value and appetite at −0.5) and the anchor at 1, the tower shows "-1.5 נקודות" and "-0.5%" (hyphen-minus; the layers' own sizes use "−"). Nothing says that a negative rate is not something a bank offers. MixBuilder in stage 3 refuses a negative rate with a message.
  - Steps: in 4.12 set all seven sliders to their lowest.
  - Screenshot: `qa/components/stage-4/RateTower-phone-03-all-min.png`.
  - Likely code: `src/components/RateTower.vue:84`, `:88`, `:133–134`: run `spread` and `rate` through `minus()`; add a one-line note under 0.
- **RateTower-2 · קטן (nit): two details of the picture.** A scenario that moves the anchor ("ריבית בנק ישראל עולה": "העוגן: ↑ עולה") does not outline the anchor block, only the layers, so the picture and the list disagree. And a negative layer is drawn as a block of the minimum height (34px), the same as a size of 0.05, stacked on top, although it lowers the rate.
  - Likely code: `src/components/RateTower.vue:62–76` and `:39` (`height`).

What works:
- The default matches `data/lessons/4-12.json`: anchor 4%, layers 0.15 / 0.3 / 0.2 / −0.1 / −0.05 / 0.1, spread 0.6, rate 4.6% (`tower.spread`, `tower.rate`). The third task, risk 0.5: spread 0.8, rate 4.8% (Python: 4 + 0.15 + 0.5 + 0.2 − 0.1 − 0.05 + 0.1 = 4.8). All sliders at their maximum: anchor 7% + 9 points = 16%; no float noise anywhere ("0.30000000000000004" never shows).
- All eight scenarios outline the layers the lesson lists (rate up: cost; more equity: risk and capital; capital line passed: capital and risk; bigger loan: customer value; another bank's offer: competition; end of the month: appetite; purchase not refinance: appetite; existing customer: customer value, "? לא ברור לאן"), each with its kind of source and the line "כמה בנקודות אחוז — לא ידוע". A second click on the pressed scenario turns it off. Buttons keep focus and report `aria-pressed`.
- Sliders take Home, End and arrows, and keep focus. The table matches the tower (and the table after the extremes: 1.5 + 0 + 0 − 0.5 × 3 = 0).

## QuestionnaireCompare (4.13)

Bugs: none.

What works:
- All 13 topics show four banks each, each with text of real length, with one `aria-pressed` button and focus kept on the topic button. The table (13 rows × 4 banks) equals the 13 cards, cell by cell (0 mismatches at both widths), plus the four form notes under it ("לאומי: ״צעד ראשון לדירה״ ← … כ־60 שדות", and the same for the other three). On a phone the table is 720px in a 324px box and the scroll hint is shown.
- The date line reads "25 באוגוסט 2026" (from `READ_ON`). No bidi problem, no small text.

## FeasibilitySheet (4.15)

Bugs:
- **FeasibilitySheet-1 · קטן (nit): the ₪ sign wraps alone onto the next line.** The seven rows are plain text, so on a phone "1,640,000 ₪" and "8,100 ₪" break between the number and the sign, and a line can start with "₪." (measured: two such breaks in the default state; they come and go with the sliders).
  - Screenshot: `qa/components/stage-4/FeasibilitySheet-4_15-phone-14-default.png`.
  - Likely code: `src/components/FeasibilitySheet.vue:58` (`money`) and the template strings at `:70–99`. Join the number and the sign with a no-break space.
- **FeasibilitySheet-2 · קטן (nit): "בעוד 1 תשלומים" and "נשארו 1 תשלומים".** At 19 payments left the car row says "היא תפסיק להיספר בעוד 1 תשלומים", and at 1 left "נשארו 1 תשלומים".
  - Likely code: `src/components/FeasibilitySheet.vue:99–100`.
  - Screenshot: `qa/components/stage-4/FeasibilitySheet-phone-01-car-19-plural.png`.
- **FeasibilitySheet-3 · קטן (nit): the whole list is `aria-live`.** Every slider step makes a screen reader read all seven rows again (the same note as ThreeMeasures in stage 3), and the line above it is a second live region.
  - Likely code: `src/components/FeasibilitySheet.vue:157` and `:161`.
- **FeasibilitySheet-4 · קטן (nit): a 35-year assumption is called "תקופה: מעל 30 שנה: אסור", while the two ratio rows still say "ההלוואה נכנסת" and carry a loan for 420 months.** The page checks each line on its own, so the rows do not contradict the term row, but a learner reads "נכנסת" under a banned term.
  - Steps: move "תקופה בהנחה" to 35.

What works:
- The numbers match `data/lessons/4-15.json` and a Python `Decimal` recompute. Default: disposable 20,250, loan 1,640,000, LTV 74.55% with room for 10,000 (`a.ltv`, `a.ltv_room`); at the 50% ceiling 10,125 carries 1,998,281.73, which is more than the loan; at the 40% line 8,100 carries 1,598,625.39, which is less, so "מעל הסף: מותר" (`a.carry50_4_5`, `a.carry40_4_5`; Python: 1,998,281.73 and 1,598,625.39).
- The three tasks: a value of 2,150,000 gives 76.28%, "מעל התקרה: אסור", 27,500 missing (`a.ltv_low`, `a.low_short`); the car at 18 payments gives a disposable income of 21,700, a threshold payment of 8,680 and 1,713,094.86, so "מתחת לסף"; the rate raised to 5% gives 1,616,924.44, "מעל הסף" again (`a.carry40_after_4_5`, `a.carry40_after_5`). The LTV line flips between 2,185,000 (75.06%, over) and 2,190,000 (74.89%, inside).
- Edge cases: 15 years makes "ההלוואה לא נכנסת"; the car at 0 or 40 payments works; 35 years crosses the term line. No NaN. The sliders take the arrows and keep focus.

## BidiText (and `numberPieces`)

Bugs:
- **BidiText-1 · קטן (nit): a time range is split into three pieces.** `numberPieces("12:30–14:00")` gives `12`, `30–14`, `00`, so the colons are left in the RTL text. Nothing in stage 4 contains a time, so no learner sees it; the dates ("2026-08-05"), ids ("FK-H-004", "ENG-223", "BIR_MRTG_99"), ranges ("0.7–0.8", "12.5%–15%", "1,000–2,000"), signed numbers ("−0.5%", "+1.2%") and a trailing comma or full stop are all kept right.
  - Likely code: `src/lib/bidi.ts:9` (`NUM` does not know `:`).

What works:
- In the browser, every piece BidiText produced in FactorCards (22 cards) and RateTower (8 scenarios) is drawn left to right: no number, range or id is reversed.

## BigPictureMap in 4.10 and 4.14

Bugs:
- **BigPictureMap-1 · חשוב (should fix): in the phone list, opening a node below the open card throws the clicked node off the screen.** The same cause as FactorCards-1: the open card above it closes.
  - Steps: at 390px open 4.10 (the card of "הרכב הלווים" is open), scroll so a node a few places below it is in the middle of the screen, tap it.
  - Actual: the tapped node moves from y=448 to y=−126 (4.10) and from y=448 to y=−114 (4.14).
  - Screenshot: `qa/components/stage-4/BigPictureMap-jump-phone-4_10-after.png`.
  - Likely code: `src/components/BigPictureMap.vue:206` and `:282` (`toggleInList`). After the toggle, scroll the node's button into view, as `selectFromCard` already does.
- **BigPictureMap-2 · חשוב (should fix): on desktop, a link in the card moves focus to a node that is hidden behind the sticky header.** `selectFromCard` focuses the new node and calls `scrollIntoView({block:"nearest"})`; the card is below the map, so the node is above the screen, and "nearest" puts it at y=0, under the 65px sticky header (`elementFromPoint` at its centre returns the header). The list view uses `scroll-mt-24` and is fine.
  - Steps: in 4.14 select "ביטחון ומשברים", press the link "ריבית בנק ישראל" in the card (from the keyboard: Tab to it and Enter).
  - Expected: the focused node visible below the header.
  - Screenshot: `qa/components/stage-4/BigPictureMap-BUG-card-link-focus-under-header-desktop.png`.
  - Likely code: `src/components/BigPictureMap.vue:203`, and `scroll-mt-24` on the desktop node buttons (line 244).
- **BigPictureMap-3 · קטן (nit): a node linked to the selected one loses its "new" mark.** "קשור אליו" has priority over "חדש" in `nodeClass`, so with "הרכב הלווים" selected in 4.10, three of the 26 new nodes (הכנסה מוכרת, התחייבויות קיימות, ערב) look like earlier ones. In 4.14, two of the three new nodes are mint ("ציפיות אינפלציה", "ביטחון ומשברים") because they are linked to "תשואות אג״ח" at first.
  - Likely code: `src/components/BigPictureMap.vue:57–62`.

What works:
- The maps have 68 nodes and 122 links (4.10) and 84 nodes and 161 links (4.14), the same as `mapUpTo()`. For every node of both maps, selecting it highlights exactly its linked nodes (compared with the data, both directions), opens a card whose links list exactly those nodes, and draws one line per linked node in another region (the number of lines equals the number of cross-region links, no NaN in any path). No line crosses an unrelated node (checked geometrically for all 152 selections).
- The 4.14 tasks hold: "ציפיות אינפלציה" is fed by אינפלציה and תשואות אג״ח and reaches "קבועה צמודה"; "ביטחון ומשברים" moves ריבית בנק ישראל, בנק ישראל and תשואות אג״ח; "ריבית בנק ישראל" moves עלות הכסף, פריים and ביקוש לדיור, and "קבועה לא צמודה" is not among them. The legend says "חדש בשלב הזה" in 4.10 (with `newFrom="4.1"`) and "חדש בשיעור הזה" in 4.14 (3 new nodes), and the "new" swatch is shown in both.
- "הצגה כרשימה" and back keep focus on the toggle, at 900px the line is redrawn for the selected node, below 640px the list is the only view. In the list a node opens its card (`aria-expanded`, "+"/"−") and closing keeps focus; a link in a card selects its node and focuses it (top 96px, below the header). 71 and 90 Tab stops, each with a ring. No raw colour in the SVG.

## FillTable (all 15 on the stage-4 pages)

Bugs:
- **FillTable-1 · חשוב (should fix): five tables are wider than a phone, and in them the learner's answer is cut off inside the box.** The page has the scroll hint, so the table can be scrolled, but the `qa:browser` check reports them as too wide because the blanks are inside. Measured as `scrollWidth − clientWidth` of the `overflow-x-auto` box (clientWidth 356px at 390px; 341px on a desktop Chromium at 390px or on a 375px phone; 326px at 360px):

  | Lesson | 390 phone | 390 with scrollbar / 375 | 360 | 320 |
  | --- | --- | --- | --- | --- |
  | 4.3 | fits | +5px (1%) | +20px (6%) | +60px (21%) |
  | 4.6 | fits | +2px (1%) | +17px (5%) | +57px (20%) |
  | 4.8 | +145px (41%) | +160px (47%) | +175px (54%) | +215px (75%) |
  | 4.9 | +33px (9%) | +48px (14%) | +63px (19%) | +103px (36%) |
  | 4.10 | +58px (16%) | +73px (21%) | +88px (27%) | +128px (45%) |

  4.5 also overflows, by 8px, at 320px only. The widest is 4.8 (a seven-column statement table). The reason is the same in all of them: each input is `w-full min-w-14 max-w-28`, which becomes 56–70px in a crowded table, and the answers need more: "13950.00", "40550.00" in 4.8, and "1,600,000", "1,520,000" in 4.9.
  - Clipped answers (input `scrollWidth` > `clientWidth` after typing the right answer with its agorot): 4.3 (5 of 9 blanks), 4.6 (4 of 4), 4.8 (6 of 6), 4.9 (6 of 9), 4.10 (2 of 4). The other ten tables have 77–112px inputs and no clipping.
  - Steps: open 4.8 at 390px, type 13950 in the first blank of the "סך ההפקדות" column.
  - Expected: the whole answer visible, and no horizontal scroll to reach a blank.
  - Screenshot: `qa/components/stage-4/FillTable-BUG-overflow-4_8-phone-14-default.png`, `…-4_9-phone-15-default.png`, `…-4_10-phone-16-default.png`, `…-4_3-phone-17-default.png`, `…-4_6-phone-18-default.png`.
  - Likely code: `src/components/FillTable.vue:93` (the input width) and the cell padding at `:77` and `:87`; for 4.8, hide the "יתרה בתחילת החודש" column on a phone, or stack each row as a card as PaymentFinder does in 3.1.
- **FillTable-2 · קטן (nit): a mark stays after the cell is changed.** After a check, a cell stays red or green, and the verdict line keeps its text, while the learner retypes it, until "בדיקה" is pressed again. MatchTable clears a row's mark on change (`watch`).
  - Likely code: `src/components/FillTable.vue:40–51`.
- **FillTable-3 · קטן (nit): the result lines are `aria-live` regions created with their text** (`v-if="Object.keys(result).length"`), as are those of ChoiceExercise and MatchTable, so some screen readers do not announce the first result. NumericExercise keeps its region in the page and is the better pattern.

What works:
- For all 15 tables I filled every blank from the cells of "הצגת הטבלה המלאה" and every one answered "הכול נכון" and saved `{"done":true}`; a wrong cell ("abc") gives "יש תאים שעוד לא נכונים (מסומנים באדום)" and the page's hint. Focus stays on "בדיקה" and on the reveal button.
- No row name in stage 4 is drawn backwards (they go through `numberPieces`). Every input is named by its column and row ("סך ההפקדות, חודש אוגוסט"). Nothing is under 12px and every input is 44px high.

## NumericExercise (all 67 on the stage-4 pages)

Bugs: none in the component.

What works:
- For every exercise, in the order below, I submitted with Enter: an empty field, "abc", "12abc", "1e3", "1.2.3", "5-", "--5", "NaN" and "Infinity" give "לא הצלחנו לקרוא מספר" and do not unlock the solution; "99999999999999999999", "-1", "0" and "-0" are not accepted; each common error in the props gives its own message (not "נכון"); an answer far from the right one twice opens the solution ("הפתרון המלא נפתח מתחת לתרגיל"); the right answer, with grouping and with "₪" where the unit is shekels, is accepted and opens the solution; the answer, as a number, is in the solution text; Enter keeps focus in the field; the input has a visible label.
- None of the common-error values lies within the tolerance of the answer. (Three exercises, 4.3-6, 4.9-3 and 4.14-6, have `near` equal to twice their `tolerance`; an answer at half of `near` is accepted as exact, not as "בקירוב", which is the code's rule and not a fault.)
- Answers checked in Python `Decimal` against the data: 4.3-4 = 27.03% (`ex4.answer`), 4.7-5 = 6,405.15, 4.9-6 = 816,629.29 (the solution text and the answer agree), 4.15-7 = 1,598,625.39 (the same as the FeasibilitySheet row).

## ChoiceExercise (all 38 on the stage-4 pages)

Bugs:
- **ChoiceExercise-1 · חשוב (should fix): a range in a question or a feedback is drawn backwards.** Plain text in the slot and in `feedback` does not go through `numberPieces`.
  - In 4.11, the third ChoiceExercise ("תרגיל 8", `4-11.mdx:383`): the question says "פקיד פותח ב־0.7–0.8 כשמותר לו 0.5", and it reads "ב־0.8–0.7" (at 1280px: "0.7" at x=591, "0.8" at x=571 for the match "0.7–0.8").
  - In 4.11, the second ChoiceExercise (`4-11.mdx:328`): the feedback of the right option, "…כמו בשיעורים 1.7–1.8", reads "1.8–1.7".
  - The same range is in the prose of 4.12 (`4-12.mdx:146`), outside any component.
  - Steps: 4.11, scroll to the exercises.
  - Screenshot: `qa/components/stage-4/ChoiceExercise-BUG-reversed-range-desktop-11-4-11-ex3-question.png`, `qa/components/stage-4/ChoiceExercise-BUG-reversed-range-desktop-12-4-11-ex2-feedback.png`.
  - Likely code: `src/components/ChoiceExercise.vue:59` (option text) and `:64` (feedback): render them with `BidiText`, as the factor cards do. The slot text at `4-11.mdx:383` is MDX prose; wrap the range in `<span class="ltr">`.
- **ChoiceExercise-2 · חשוב (should fix): every correct answer starts "נכון. נכון."** The component writes a bold "נכון." and then the option's `feedback`, and the feedback of the correct option in all 38 exercises also starts with "נכון." (so "נכון. נכון. ההחלטה של Mogi: אם יש רק ברוטו…"). In 4.8-2 the feedback is only "נכון.", so the learner reads "נכון. נכון." and nothing else, with no explanation.
  - Steps: 4.1, exercise 1: choose the right option.
  - Expected: one "נכון." (and, in 4.8-2, an explanation).
  - Screenshot: `qa/components/stage-4/ChoiceExercise-BUG-double-nachon-desktop-10-4-1-ex1.png`.
  - Likely code: `src/components/ChoiceExercise.vue:63–64` or the `feedback` strings in `src/pages/lessons/4-*.mdx` (a one-line grep of the `.mdx` files finds 35 of the 38 correct options starting with "נכון", and all 38 show the double word in the browser; the same habit is in stages 1–3: 29, 21 and 20 options by the same grep).
- **ChoiceExercise-3 · קטן (nit): inline glossary buttons are 25px tall.** The `<Term>` buttons inside a question ("מאומתת", "מאגר נתוני האשראי", "חיווי אשראי", "דוח ריכוז נתונים", and "שפיצר" in a NumericExercise) are 25px high, below 44px. They are inline text links, which most guidance exempts, but this report's rule is 44px.

What works:
- In every exercise each option can be pressed (Enter and Space), reports `aria-pressed`, shows its feedback in a live region and keeps focus on the button; there is exactly one correct option in each (38 of 38), and the shuffled order is the same on the server and in the browser (no hydration message). Every question has at least three options.

## CardSort (4.5, one instance)

Bugs: none.

What works:
- Seven cards, the first already sorted ("קלף 2 מתוך 7 · הקלף הראשון כבר ממוין"). A wrong pile gives a message that names the pile and its question and keeps focus on the pile; a right pile moves focus to the explanation (`tabindex=-1`); "לקלף הבא" moves focus to the next card; the last right pick leaves focus on the explanation and shows "כל הקלפים ממוינים (עם טעות אחת בדרך)". The piles below are the table view and equal the sorted cards (3, 1, 3). "להתחיל מחדש" moves focus to the card, returns to the first card and the one given. The result is saved as `{"done":true,"mistakes":1}`. The piles take Enter and Space, with a ring on each Tab stop.

## Prediction and PredictionReveal (15 pairs)

Bugs:
- **Prediction-1 · חשוב (should fix): "זה הניחוש שלי" takes focus with it to `<body>`.** The button is removed (`v-if="!locked"`) while it has focus and the fieldset is disabled, so a keyboard user who presses Enter has to Tab from the top of the page. It happens on all 15 pages.
  - Steps: in 4.1 choose an option with the keyboard, move to "זה הניחוש שלי" and press Enter.
  - Expected: focus on the locked group or on the "שמרנו את הניחוש שלכם" line.
  - Actual: `document.activeElement` is `<body>` on all 15 pages at 1280px (and the same code runs on a phone).
  - Screenshot: `qa/components/stage-4/Prediction-BUG-focus-lost-desktop-13-after-lock-active-element-is-body.png`.
  - Likely code: `src/components/Prediction.vue:42` and the `lock()` function; focus the paragraph (give it `tabindex="-1"` and `ref`) after `nextTick`.

What works:
- The lock is disabled until an option is chosen; radios take arrow keys; each pair has the same id and the same options; the notes cover every wrong guess (one `""` for the correct one), and for all 15 pairs and every guess I set the saved guess and reloaded: PredictionReveal shows "ניחשתם: …", "צדקתם" for the right one, and the note for each wrong guess (0 problems in 15 pairs).

## MatchTable (4.11 and 4.12)

Bugs: none.

What works:
- Five open rows in each (one given). An empty check says "בחרו תשובה בכל השורות, ואז בדקו."; five wrong answers give "לא נכון" with `aria-invalid` on each select and an `aria-describedby` that resolves; changing a select clears its mark; all right gives "הכול נכון" and saves `{"done":true}`; "הצגת כל התשובות" removes the selects and keeps focus on the button ("חזרה למילוי" brings the choices back). Selects take arrows and every select has a label. Focus stays on "בדיקה".

## QA scripts' own limits

- I did not run the Python `check:python` for stage 4 line by line, but `python3 -I checks/independent_check.py` reports "check-4: 179 facts, ok", and the numbers I recomputed above (about 40 figures in Python `Decimal`) agree with the screen.
- The 50.01% case cannot be typed into any stage-4 slider (see the cross-component note); I checked it on the library.

## Checkers-1 (the cross-component should-fix)

- **Checkers-1 · חשוב (should fix): on a phone, the result is far from the slider the learner is moving.** In PaymentRatioChecker, RegulationChecker and FamilyBudget all the sliders come first and the results after them, so one cannot see a figure change while moving the slider. Measured at 390×844 as the distance between a slider and the nearest result element: PaymentRatioChecker 4.3: 134 to 1,352px (nine of eleven sliders more than 450px away); 4.2: 105 to 1,222px; FamilyBudget: 488 to 1,048px (none within a screen); RegulationChecker: 76 to 672px; AppraisalGap 180 to 396px; VerifiedGap 252 to 380px; FeasibilitySheet 120 to 444px; ThreeKindsLadder 44 to 260px. The lessons' tasks ("הזיזו… וראו מה קורה ליחס") depend on seeing both.
  - Expected: the figure that the task asks about stays on screen while the slider moves (a sticky result bar on a phone, or the result above the sliders).
  - Screenshot: `qa/components/stage-4/PaymentRatioChecker-4_3-phone-03-default.png` (the whole component at 390px: the first slider is at the top and the ratio at the bottom).
  - Likely code: the template order in `src/components/PaymentRatioChecker.vue` (sliders from line 126, results from line 209), `RegulationChecker.vue` (sliders at 138, lines at 180) and `FamilyBudget.vue` (sliders at 68, cards at 131).
