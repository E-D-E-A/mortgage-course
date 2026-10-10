# QA report: the interactive components of stage 3, in a real browser

Date: 2026-10-10

I edited no source file. I copied the built `dist/` (built 2026-10-10 11:20, after the last component change at 11:05; `dist/lessons/3-12/` was present, so I did not rebuild) to my scratch folder and served the copy with a small Node server on a random port. I drove Chromium (`/opt/pw-browsers/chromium-1194`) through `playwright-core` at 390×844 (phone, touch on) and 1280×900 (desktop), and opened every stage lock with `addInitScript` before each page load. Each component was scrolled into view and waited on until its island hydrated. Screenshots are in `qa/components/stage-3/` (gitignored), named `<Component>-<phone|desktop>-<n>-<state>.png` (the first survey pass is named `<Component>-3_<lesson>-<width>-<n>-default.png`); the site header is made static only while a screenshot is taken, so it does not cover the component. The scripts are in my scratch folder, not in the repo.

For every component and both widths I checked:
- horizontal page scroll;
- text below 12px, clipped text, and text off screen;
- RTL on the component, LTR on `.ltr` spans, and signed numbers, ranges and equations outside an `.ltr` span;
- touch targets (the box of each button, input or select);
- the Tab order, and whether each Tab stop draws a focus ring;
- Enter and Space on buttons, arrows, Home and End on sliders;
- where focus is after each action (never `<body>`);
- console errors and warnings, page errors and hydration messages;
- that the table or list view matches the visual;
- that the numbers match `data/lessons/3-X.json`, with a few recomputed in Python `Decimal`;
- edge inputs: empty, zero, negative, huge, non-numeric and out-of-range values, in every typed field and at both ends of every slider;
- names for screen readers on controls and charts.

Components: PaymentFinder (3.1), ScheduleBuilder (3.2, 3.3, 3.4), LinkedSchedule (3.5), RateReset (3.6), MixBuilder (3.7), ForecastPaths (3.8), WhereMoneyGoes (3.9), OneRateSearch (3.10), ThreeMeasures (3.11), ScheduleByHand and SheetMatch (3.12), the eleven FillTable instances (3.1–3.11), all 55 NumericExercise instances (3.1–3.12), and BigPictureMap in 3.12. No stage-3 page uses CardSort.

**Colours:** none of the fifteen files (the thirteen components above plus `BigPictureMap`, `BigPictureCard`) has a raw hex, `rgb()` or `hsl()`. No rendered element inside them carries one in a `style`, `fill`, `stroke` or `stop-color` attribute. Inline styles and SVG attributes use `var(--mogi-…)` tokens only (`--mogi-teal-deep`, `--mogi-turquoise-2`, `--mogi-n300`, `--mogi-n400`, `--mogi-n500`, `--mogi-mint`, `--mogi-navy`, `--mogi-n0`). The only hex values are in `src/styles/tokens.css`.

**Layout, text, targets, rings:** at both widths no component causes horizontal page scroll. No text is under 12px, and no text is clipped or off screen. Every button, input and select is at least 44×44, and every Tab stop draws a focus ring (outline or the input's `shadow-ring-input`). Every slider, typed field and select has a name (`aria-label` or a wrapping `<label>`), and every chart is `role="img"` with an `aria-label`.

**Since stage 2:** the layout's scroll-hint script now looks at `.overflow-auto` too, so the wide year tables in ForecastPaths, WhereMoneyGoes and ScheduleByHand get the "בתוך הרכיב יש טבלה רחבה…" hint on a phone. The print rule for the sticky header is in `main.css`.

**Console:** no component threw, warned or reported a hydration mismatch at either width. The only failed requests were the lesson videos of 3.1 and 3.11 (`/video/3-X.mp4`); the files are in `dist/video/`, the server answers 200, and Chromium then stops the download after reading the metadata (`net::ERR_ABORTED`). Nothing is missing.

## Summary

| Severity | Count | Bugs |
| --- | --- | --- |
| חוסם (must fix) | 0 | — |
| חשוב (should fix) | 4 | ScheduleBuilder-1: focus falls to `<body>` at the first and last year of the table · ScheduleByHand-1: focus falls to `<body>` when a month is solved or revealed · SheetMatch-1: with two figures filled, a sheet without the last-month fix is named "בלי ROUND בכלל" · BigPictureMap-1: nothing is marked "חדש בשיעור הזה" in 3.12, again |
| קטן (nit) | 19 | listed under each component |

Three causes repeat across components:
- **A signed number or a range in plain RTL text, outside an `.ltr` span, is drawn backwards.** "−1 ₪" reads "1−" (PaymentFinder-1), "(+1.2 נקודות" reads "1.2+" (RateReset-1), the period "1–5" in a FillTable cell is drawn "5–1" (FillTable-1), and "3.2–3.4" in a map card is drawn "3.4–3.2" (BigPictureMap-3). The components' own sliders and cards already wrap these in `.ltr`.
- **A button that removes or disables itself takes focus with it.** ScheduleBuilder's year buttons (ScheduleBuilder-1) and ScheduleByHand's check and reveal buttons (ScheduleByHand-1). MixBuilder's add and remove buttons show how to do it: they move focus on purpose.
- **`parseAnswer` deletes every character that is not a digit, a point or a minus sign** (`src/lib/progress.ts:29`). So "1e1" is read as 11 and "12abc" as 12. It is the parser behind ScheduleBuilder, ScheduleByHand, SheetMatch, FillTable and NumericExercise (ScheduleBuilder-2). PaymentFinder uses `Number()` and reads "1e3" as 1,000. The two parsers disagree.

Two cross-component notes, not counted as bugs:
- **Two rounding conventions for the "same" loan.** ScheduleBuilder, ScheduleByHand and SheetMatch use the statement convention (payment and each month's interest rounded). LinkedSchedule and RateReset show the formula balance. So the RateReset card's "451,903.77 ₪" after 36 months of 500,000 ₪ at 4.8% is 14 agorot away from what ScheduleBuilder shows for the same loan: 451,903.63 ₪, recomputed in `Decimal`. WhereMoneyGoes says outright that it does not round, and shows interest of 334,498.76 ₪ against 334,499.54 ₪ in 3.2. Each lesson is consistent with its own data file, but a learner who checks one widget against another sees agorot move.
- **No slider has `aria-valuetext`.** A screen reader hears "4.8" or "600000", not "4.8%" or "600,000 ₪". The visible output next to each slider is right.

## PaymentFinder (3.1)

Bugs:
- **PaymentFinder-1 · קטן (nit): the step buttons "−1 ₪" and "+1 ₪" draw the sign on the wrong side.** The label is plain text in an RTL button, so the sign is resolved as RTL and lands to the right of the digit.
  - Steps: open 3.1 at either width and look at the four step buttons.
  - Expected: "−1 ₪", with the minus to the left of the 1.
  - Actual: measured at 1280px: "−" at x=887, "1" at x=879, "₪" at x=864, so the button reads "₪ 1−". The same happens on "+1 ₪". "−אגורה" and "+אגורה" are correct, because there the sign sits before a Hebrew word.
  - Screenshot: `qa/components/stage-3/PaymentFinder-phone-02-loan3-4000.png`.
  - Likely code: `src/components/PaymentFinder.vue:138–139`. Wrap the amount in `<span class="ltr">`, as OneRateSearch does with "−0.01".
- **PaymentFinder-2 · קטן (nit): a typing error stays on screen after the slider or a button has changed the payment.**
  - Steps: type "abc" and press Enter. Then move the slider to 3,900.
  - Expected: the error goes away once the payment comes from the slider.
  - Actual: the field shows "3900.00" and the payment is 3,900.00 ₪, but "כתבו מספר, למשל 1015.5" is still under the field. Switching loans does clear it.
  - Screenshot: `qa/components/stage-3/PaymentFinder-phone-06-error-after-slider.png`.
  - Likely code: `src/components/PaymentFinder.vue:42–48`. `setPayment` never resets `typedError`; clear it in `fromSlider` and in the step buttons.
- **PaymentFinder-3 · קטן (nit): "זה התשלום. מה שנשאר (1.94 ₪) הוא העיגול לאגורה".** For the 20-year loan, 1.94 ₪ is 240 roundings added up, not one rounding to the agora. The lesson's own answer says "העיגול, שהתשלום האחרון סוגר".
  - Steps: choose "600,000 ₪, 20 שנה" and press "הראו לי את התשלום".
  - Expected: wording such as "הוא מה שהעיגולים השאירו".
  - Screenshot: `qa/components/stage-3/PaymentFinder-phone-03-loan3-3893.74.png`.
  - Likely code: `src/components/PaymentFinder.vue`, the `v-else` branch of the third line of the live box.

What works:
- The three tasks match `data/lessons/3-1.json`. Loan 1 at 1,015.02 leaves 0.01 ₪ (`explain.try_pay`), and 1,015.03 overpays 0.01 ₪ (`explain.try_up`). Loan 3 at 3,500 leaves 158,157.51 ₪ (`long.try_3500`). At 4,000 the loan is overpaid by 41,875.89 ₪ (`long.over_4000`). At 3,893.74 it leaves 1.94 ₪ (`long.try_pay`), and at 3,893.75 it is overpaid by 2.03 ₪, so one agora moves the end by 3.97 ₪ (`long.agora_effect`). I recomputed all of these in Python `Decimal`, rounding each month's interest to the agora.
- The slider's range is P ÷ n to P ÷ n + P × m: 1,000–1,020 for loan 1 and 2,500–4,900 for loan 3. Home, End and the arrows work and keep focus; in RTL, ArrowRight lowers the payment by one agora.
- Edge inputs never break it. "", "abc", "Infinity", "NaN" and "1/2" show "כתבו מספר" and leave the payment as it was. "0", "-5", "1e3" and "99999999999" are clamped to the range, with "התשלום כאן בין 2,500 ₪ ל־4,900 ₪." "4,000.5" and " 3,893.74 ₪ " are read correctly. Nothing shows NaN or Infinity.
- Below the minimum, "−1 ₪" stays at the minimum. The loan buttons take Enter and report `aria-pressed`. Every button keeps focus after Enter or Space, and so does the typed field.
- The table at 640px and up, and the cards below it, show the same five rows (months 1–3 and 239–240) as the live box and the chart's label. The chart's `aria-label` follows the end balance.

## ScheduleBuilder (3.2, 3.3, 3.4)

Bugs:
- **ScheduleBuilder-1 · חשוב (should fix): "שנה הבאה" on the last year, or "שנה קודמת" on the first, drops focus to `<body>`.** The button becomes `disabled` while it has focus, so the browser blurs it. A keyboard user who pages through the table with Enter loses their place, and the next Tab starts from the top of the page.
  - Steps: in 3.2 pick year 19 and press Enter on "שנה הבאה". Or pick year 2 and press Enter on "שנה קודמת".
  - Expected: focus stays in the pager, for example on the year `<select>` or on the other button.
  - Actual: `document.activeElement` is `<body>` at both widths. In 3.2 at 30 years it happens after year 30.
  - Screenshot: `qa/components/stage-3/ScheduleBuilder-desktop-01-last-year-focus-lost.png`.
  - Likely code: `src/components/ScheduleBuilder.vue:274` and `:281`. Move focus before disabling, or use `aria-disabled` and ignore the click.
- **ScheduleBuilder-2 · קטן (nit): "1e1" in the rate field is read as 11%, with no error.** `parseAnswer` deletes the "e" (see the repeated causes above). "12abc" is read as 12 in the same way.
  - Steps: type "1e1" in "אחוז הריבית לשנה" and press Enter.
  - Expected: either 10% or "כתבו אחוז הריבית לשנה במספרים."
  - Actual: "0.9167% לחודש", a first payment of 6,193.13 ₪, which is 11% a year.
  - Screenshot: `qa/components/stage-3/ScheduleBuilder-desktop-02-rate-1e1-read-as-11.png`.
  - Likely code: `src/lib/progress.ts:29`. Refuse letters instead of deleting them.
- **ScheduleBuilder-3 · קטן (nit): with a one-month bullet, the caption says the payment "is not drawn" while it is the whole chart.** With n = 1, `scaleRows` keeps the last row, so the payment sets the scale and fills the chart. The caption still says "התשלום בחודש האחרון, 602,400.00 ₪, גבוה מדי לגרף, ולכן הוא לא מצויר".
  - Steps: in 3.4 choose "בוליט מלא" and set the months to 1.
  - Screenshot: `qa/components/stage-3/ScheduleBuilder-desktop-03-bullet-1-month-caption.png`.
  - Likely code: `src/components/ScheduleBuilder.vue:257`. Use the same `n > 1` condition as `scaleRows`.

What works:
- **3.2** matches `data/lessons/3-2.json`. 60,000 ₪ / 6% / 3 months gives the lesson's small table: 20,200.33 / 20,200.33 / 20,200.34, balances 40,099.67 / 20,099.84 / 0.00 (`small.rows`). For 600,000 ₪ at 4.8% over 240 months, month 68 is the first where principal (1,951.79) beats interest (1,941.95) (`long.overtake`, `long.prin_k`, `long.int_k`). At 360 months, month 1 is 2,400.00 interest, 747.99 principal and 3,147.99 paid (`long30.*`). Totals are 934,499.54 paid and 334,499.54 interest, with a last payment of 3,895.68.
- **3.3**: the row check on month 60 with the formula balance (498,932.34) answers "קרוב: 498,933.29 ₪ בבונה, הפרש של 0.95 ₪" (`long.table_60`, `long.gap_60`). 900,000 / 5.4% / 360 gives 622,549.11 at month 180 (`pred.answer`). Month 148 is the first under 300,000: 299,210.52 (`long.half_month`, `long.table_below`). The row check also handles "תואם", "לא תואם", month 0 or 241 ("מ־1 עד 240"), an empty amount, and "−2400" with a real minus. Any change to the loan clears the old verdict.
- **3.4**: all six methods match `data/lessons/3-4.json`: Spitzer, equal principal (4,900.00 / 2,510.00 / 289,200.00), partial grace (13th payment 4,016.41, balance 600,000.00 after 12), full grace (4,213.50, balance 629,442.14), and both bullets (602,400.00 and 1,564,020.10; interest 576,000.00 and 964,020.10). Negative principal rows show the note "רכיב קרן שלילי…". Grace is clamped when the term shrinks (12 → 5 at 6 months), 240 grace months gives "חודשי הגרייס: בין 0 ל־239.", and grace 0 falls back to Spitzer.
- Python `Decimal` (statement convention) agrees on the 600,000/4.8%/240 and /360 totals, month 68, the 60- and 148-month balances, and 622,549.11.
- Edge inputs show a message and keep the last valid schedule, with no NaN anywhere. Rate 0 gives a flat 2,500.00, rate 20 gives 10,192.95, months 1 and 480 work, and principal 10,000,000 works. Out-of-range or non-numeric values ("-1", "abc", "", "0", "99999999999", "481", "2.5") each get their own message.
- The method buttons take Enter and Space, report `aria-pressed` and keep focus. Enter in a field keeps focus there. The table (1024px and up) and the cards below it show the same twelve rows.

## LinkedSchedule (3.5)

Bugs:
- **LinkedSchedule-1 · קטן (nit): when the index falls, the sentence under the cards says the index "added" a negative amount, which is "added to the balance and paid over the remaining payments".** The slider goes down to −1%.
  - Steps: set the index to −1% and the month to 240.
  - Actual: "עד סוף חודש 240, ההצמדה הוסיפה לחוב במסלול הצמוד −41,394.08 ₪. את הסכום הזה לא שילמתם בבת אחת: הוא נוסף ליתרה, ומשולם לאורך התשלומים שנשארו." At month 240 there are no payments left either. The slider's output also uses a hyphen ("-1%"), while the cards use a real minus ("−1.52 ₪"). This is the same pair of slips as BalanceForces in stage 2.
  - Expected: a branch for a falling index ("המדד ירד, והחוב קטן ב־41,394.08 ₪"), and a real minus in the output.
  - Screenshot: `qa/components/stage-3/LinkedSchedule-phone-02-inflation-1-m240.png`.
  - Likely code: `src/components/LinkedSchedule.vue:146–149` (the sentence) and `pct()` at line 32 (the hyphen).

What works:
- The four tasks match `data/lessons/3-5.json`. Month 1 at 2%: indexation 660.63 and payment 2,222.05, against 2,218.39 unlinked (`slider.m1_*`, `explain.c`). Month 120: 2,704.21 and 280,052.26 linked, 229,740.40 unlinked, and 69,425.93 of indexation so far (`slider.m120_*`, `slider.u120_balance`, `slider.indexation_120`). At 0% the two series are identical. At 4%: 400,583.66 after month 12 and 390,831.58 after month 60 (`slider.four_m12_balance`, `slider.four_m60_balance`). `Decimal`: 400,000 × (1.02^(1/12) − 1) = 660.63.
- Both sliders take Home, End and the arrows, plus PageUp on the month slider, and keep focus. The year labels sit on their positions (0 at x=319 of 324). The dashed month marker moves in both charts.
- The year table is in a `max-h-80 overflow-auto` box that fits at 390px (324 of 324px), so no hint is needed. Year 10 in the table equals the month-120 cards. Each cell names its track for screen readers (`sr-only`).

## RateReset (3.6)

Bugs:
- **RateReset-1 · קטן (nit): the legend's "(+1.2 נקודות אחוז מחודש 37)" draws the sign after the number.** The text is plain, outside `.ltr`, so in RTL the "+" lands to the right of "1.2". The same string is the `sr-only` label of every table cell. The slider's own output, "+1.2" in `.ltr`, is right.
  - Steps: open 3.6 and read the first legend entry (or set the change to −2).
  - Actual: measured at 1280px: "+" at x=815, "1.2" at x=799–809.
  - Expected: `<span class="ltr">` around the signed number in the legend.
  - Screenshot: `qa/components/stage-3/RateReset-phone-01-default.png`.
  - Likely code: `src/components/RateReset.vue:56` (`names`), rendered at line 170.
- **RateReset-2 · קטן (nit): on the prime track with a change of 0, the card says "לא הזזתם את העוגן".** On prime the learner moved the prime, and the slider is labelled "הפריים זזה".
  - Steps: keep "פריים" and set "בכמה" to 0.
  - Screenshot: `qa/components/stage-3/RateReset-desktop-08-prime-zero-says-anchor.png`.
  - Likely code: `src/components/RateReset.vue:194`. Use `kind === 'prime' ? 'את הפריים' : 'את העוגן'`.

What works:
- The four tasks match `data/lessons/3-6.json`. Default: balance 451,903.77, 204 months left, 3,244.79 → 3,538.86, and "one formula" would say 3,582.16 (`explain.*`, `wrong.one_formula`). Variable track: "העוגן זז בחודש 37, אבל… מחודש 61", balance 415,777.46, then 3,508.57 (`slider.variable_*`). Equal principal: 3,791.67 → 4,208.33 with the principal part unchanged (`ep.*`). −1.2 points gives 2,965.00 (`slider.lower_37`). The table's year 10 shows 318,757.51 against 308,760.88 (`slider.balance_120_*`). `Decimal`: 3,538.86 and 3,582.16 match.
- Edge cases read correctly. A change at month 239 leaves 2 months. A change at month 200 on the variable track gives "אחרי החודש שבחרתם אין עוד נקודת עדכון". A change at month 181 resets at 181. The change slider stops at −2 (4.8 − 2 = 2.8%). No NaN in the charts.
- The toggle buttons take Enter and Space, report `aria-pressed` and keep focus. Both sliders take Home, End and the arrows. The year table fits at 390px.

## MixBuilder (3.7)

Bugs:
- **MixBuilder-1 · קטן (nit): the reset choice "every 12 months" reads "1 שנים".**
  - Steps: set a track to "משתנה צמודה" and open "אחוז הריבית נקבע מחדש כל".
  - Expected: "שנה" (and "2.5 שנים" is fine).
  - Screenshot: `qa/components/stage-3/MixBuilder-desktop-10-reset-1-shanim.png`.
  - Likely code: `src/components/MixBuilder.vue:162` (`yearsText`).

What works:
- The four tasks match `data/lessons/3-7.json`. Default: first payment 5,903.69, highest 6,485.07 in month 144, total 1,458,674.88; prime 33.33%, linked 33.33%, fixed for the term 66.67% (`sc.*`, `exp.*`). Prime at 25 years: 4,865.75, 5,838.42 in month 240, 1,592,619.11 (`long.*`). Track 3 as "משתנה צמודה" at 3.25% with the anchor +1: 5,941.55, 6,685.36 in month 144, 1,497,636.20, resetting 33.33%, fixed 33.33% (`var.*`). Everything flat: highest 5,900.94 in month 1 (`flat.*`).
- A scenario that takes a rate below zero (prime −3 with a 0.5% track) is refused with the message, and the chart is hidden. Amount sliders are capped so the tracks never exceed the loan, and the last track shows "(מה שנשאר): 0 ₪ · 0%".
- Focus is managed. "להוסיף מסלול" (Enter) moves focus to the new track's type select, and the add button then disappears at 4 tracks. "להסיר את מסלול 2" (Space) moves focus to track 2's select. Removing the last track moves it to the new last track, and removing down to one moves it to "סוג מסלול 1". Changing a type with the keyboard keeps focus on the select. Every control is named per track ("אחוז הריבית במסלול 3").
- The year table with 4 tracks still fits at 390px. Its year 12 equals the highest-payment card (6,485.07). The legend's colours follow the tracks.

## ForecastPaths (3.8)

Bugs: none.

What works:
- The three tasks match `data/lessons/3-8.json`. Forecast as given: 4,030.31 from month 121 on both lines, "שווה להחזר המרבי החזוי", and 5.3% above the current-terms payment (`explain.max`, `explain.max_month`, `explain.above`). Years 11–15 at 6.5%: 4,216.80 from month 121, 186.49 above the forecast, which does not move (`slider.high_max`). 4% / 3.5% / 3.5%: the highest is the first payment, 3,828.36 in month 1 (`explain.low_max`).
- Extremes (all 9%, all 1%) draw without NaN. The circles move to the right month (61, or 1), and the current-terms line stays at the first payment.
- "חזרה לתחזית" (Enter) restores 5.1 / 5.5 / 5.3 and keeps focus. The sliders take Home, End and the arrows, and each is named by its years ("הריבית בשנים 6–10").
- The table matches the chart's four steps. At 390px it is 480px wide in a 324px `overflow-x-auto` box, and the scroll hint is shown.

## WhereMoneyGoes (3.9)

Bugs:
- **WhereMoneyGoes-1 · קטן (nit): "מכל 100 ₪" rounds each part on its own, so the parts do not add up to 100.**
  - Steps: choose "צמוד למדד" and set the rate to 3% (the lesson's third task).
  - Actual: "61 ₪ מחזירים את ההלוואה, 23 ₪ הם ריבית, ו־15 ₪ הם מה שהמדד הוסיף", which is 99. At the maximums (2,000,000, 8%, 30 years, 5%) it is 17 + 52 + 32 = 101. The caption says "מעוגל לשקל", but a sentence that starts "of every 100 ₪" and ends at 99 reads as a mistake.
  - Expected: round so the parts add to 100 (largest remainder), or show one decimal.
  - Screenshot: `qa/components/stage-3/WhereMoneyGoes-desktop-11-per100-sums-to-99.png`.
  - Likely code: `src/components/WhereMoneyGoes.vue:54` (`per100`) and lines 128–131.
- **WhereMoneyGoes-2 · קטן (nit): two wording slips.**
  - The lesson's answer gives the fee as "0.04% בלבד" (`slider.fee_share`), but the component can only show "פחות מ־0.1%", so the learner cannot read 0.04 off the screen (`src/pages/lessons/3-9.mdx:143`; `shareText` in the component).
  - The term is written "{{ years }} שנה" for every value, so the minimum reads "5 שנה (60 תשלומים)" (`src/components/WhereMoneyGoes.vue:81`).
  - Screenshot: `qa/components/stage-3/WhereMoneyGoes-phone-01-linked-3.png`.

What works:
- The three tasks match `data/lessons/3-9.json`. Default: 934,858.76 in all, 334,498.76 interest (35.8%), fee 360 (`slider.everything`, `big.interest`, `slider.interest_share`). 30 years: 533,277.17 (47%), with a first payment of 3,147.99 (`big30.*`, `slider.interest_share_30`). Linked at 3% with 2% index: indexation 151,298.67 (15.4%), interest 229,399.17, 981,057.84 in all (`lnk.*`, `slider.index_share`, `slider.everything_linked`). `Decimal` without rounding gives 334,498.76.
- The bar's segments are in proportion (64.2% of 324px is 205.5px), the 2px minimum keeps the fee visible, and the bar's `aria-label` lists the same parts as the list. At the extremes (100,000 / 1% / 5 years / no fee, and 2,000,000 / 8% / 30 / 5,000 / 5%) nothing overflows and there is no NaN.
- The toggle takes Enter and keeps focus. The year table is 480px in a 324px box at 390px, and the scroll hint is shown.

## OneRateSearch (3.10)

Bugs:
- **OneRateSearch-1 · קטן (nit): with a fee, "מצאתם… שווים היום בדיוק (עד שקלים בודדים)" shows while the two bars are 28.80 ₪ apart.** The slider moves in steps of 0.01, so it cannot get closer than that. With a 6,000 ₪ fee and 4.92%, the card shows received 594,000.00 against a value of 593,971.20.
  - Steps: set the fee to 6,000 and the rate to 4.92.
  - Expected: wording that matches the step ("הקרוב ביותר בצעדים של 0.01: ההפרש X ₪"), or no "עד שקלים בודדים".
  - Screenshot: `qa/components/stage-3/OneRateSearch-desktop-09-fee-6000-found-28-shekels-apart.png`.
  - Likely code: `src/components/OneRateSearch.vue:28` and the "found" text at line 104.

What works:
- The three tasks match `data/lessons/3-10.json`. No fee: found at 4.80, with exact values of 0.4% a month, 4.8% × 12 and 4.907% effective (`slider.x12_fee0`, `slider.eff_fee0`). Fee 6,000: found at 4.92, exact 4.919% and 5.032% (`slider.x12_fee6000`, `slider.eff_fee6000`). Equal principal: found at 4.80 again (`slider.x12_ep`).
- The ±0.01 buttons take Enter and Space, keep focus, and stop at 3 and 8. At 3% and 8% the verdict says too low or too high, with the gap. The table's 11 rows match the slider's value at each rate (4.8 lies between 4.5% and 5%).

## ThreeMeasures (3.11)

Bugs:
- **ThreeMeasures-1 · קטן (nit): the whole comparison table is `aria-live`.** Every slider step makes a screen reader read three rows and six values again, although only one row changes.
  - Steps: with a screen reader, move "כמה הכסף שלכם יכול להרוויח" one step.
  - Expected: a live region on the present-value row only, or one short status line ("בריבית 4%: הצעה ב׳ נמוכה יותר").
  - Screenshot: `qa/components/stage-3/ThreeMeasures-phone-03-offers-4.png`.
  - Likely code: `src/components/ThreeMeasures.vue:105`.

What works:
- The three tasks match `data/lessons/3-11.json`. At 3%: total paid picks equal principal (607,576.92 against 581,000.00), IRR is "שווים" at 6%, and PV picks equal principal (478,210.06 against 488,780.34). At 9% PV picks Spitzer (332,794.88). At 6% both are 400,000.00, "שווים". For the offers: total picks א׳ (950,336.26), IRR picks ב׳ (4.6%), PV at 3% picks א׳ (713,983.34 against 729,562.80), and at 4% picks ב׳ (644,274.75 against 653,442.73). `Decimal` gives 488,780.34 at 3%.
- The x labels sit on their points (0% at x=318, 10% at x=6 of 324). The rate marker moves with the slider, at 0% and at 10% too. The pair buttons take Enter and keep focus. The PV table (0–10%) matches the chart's curves at the integer rates.

## ScheduleByHand (3.12)

Bugs:
- **ScheduleByHand-1 · חשוב (should fix): when a month is checked right, or its solution is revealed, focus falls to `<body>`.** The button "בדיקת חודש k" (or "הצגת הפתרון לחודש k") is inside `v-if="isOpen(k) && !solved[k]"`, so it is removed while it has focus. A keyboard user has to Tab from the top of the page to reach month k+1.
  - Steps: fill month 1 (60, 972.80, 11027.20) and press Enter on "בדיקת חודש 1". Or make two wrong checks on month 2 and press Enter on "הצגת הפתרון לחודש 2".
  - Expected: focus on month k+1's first field (it just opened), or on month k's "נכון ✓" heading.
  - Actual: `document.activeElement` is `<body>` at both widths, in both cases.
  - Screenshot: `qa/components/stage-3/ScheduleByHand-desktop-04-m1-solved-focus-on-body.png`.
  - Likely code: `src/components/ScheduleByHand.vue`, `check()` (line 133) and `reveal()` (line 142). After `nextTick`, focus the next month's first input.
- **ScheduleByHand-2 · קטן (nit): Enter in a month's fields does nothing.** The fields are not in a `<form>`, unlike ScheduleBuilder's row check and every NumericExercise, so the learner has to Tab to the button.
  - Steps: fill a month and press Enter in the last field.
  - Screenshot: `qa/components/stage-3/ScheduleByHand-phone-01-after-reload.png`.
  - Likely code: `src/components/ScheduleByHand.vue:262–292`. Wrap each month in `<form @submit.prevent="check(k)">`.

What works:
- The months match `hand.schedule` in `data/lessons/3-12.json`: 1,032.80 a month; 60.00 / 972.80 / 11,027.20, then 55.14 / 977.66 / 10,049.54, then 50.25 / 982.55 / 9,066.99. In the full table the last payment is 1,032.78. `Decimal` agrees (and gives 393.58 of interest).
- Every named mistake in the data gives its own message: annual rate, whole payment, stale opening, interest on the original loan, unrounded (55.136), truncated (55.13), and the chained "החיסור נכון — אבל לפי הריבית שכתבתם…" for a right subtraction on a wrong cell. An empty field or "abc" gives "חסר מספר". After two wrong checks "הצגת הפתרון" appears. Each message is tied to its field with `aria-describedby`.
- Month k+1 opens only when k is right. After all three, "3 חודשים, עד האגורה." appears. What was typed, the solved months and the revealed months are saved (`mogi-course:schedule-by-hand:3.12-hand`) and restored after a reload. "להתחיל מחדש" clears everything and keeps focus.
- The print view shows "✓" and "(הפתרון הוצג)" beside the months. The "הדפסה" button adds `diy-printing` and `data-diy-print="active"` before `window.print()`; in print media only the block is visible (104 text elements inside, 0 outside), and `afterprint` removes both. The full table (480px) and the print view's course table (373px) get the scroll hint at 390px.

## SheetMatch (3.12)

Bugs:
- **SheetMatch-1 · חשוב (should fix): with only the first two figures filled, a sheet without the last-month fix is told it has "no ROUND at all".** In this loan the regular payment is 3,247.15 under every convention, and the last payment is 3,247.15 both with no ROUND at all and with no last-month fix. The check tries "exact" first, so two figures match it and the learner gets a confident wrong diagnosis and a wrong fix. All four figures give the right answer ("בגיליון שלכם גם החודש האחרון משלם את ההחזר הרגיל").
  - Steps: type 3247.15 in "ההחזר בחודש 1" and 3247.15 in "ההחזר בחודש האחרון", and press "השוואה".
  - Expected: when more than one convention fits what was filled, say so ("אחת משתיים: … או …; מלאו גם את סך התשלומים כדי לדעת"), or ask for all four before naming one.
  - Actual: "ההפרש הוא עיגול. הגיליון שלכם בלי ROUND בכלל: …"
  - Screenshot: `qa/components/stage-3/SheetMatch-desktop-05-partial-no-last-adjust-misnamed.png`.
  - Likely code: `src/components/SheetMatch.vue:117–125`. The first matching variant wins.
- **SheetMatch-2 · קטן (nit): two small gaps.**
  - Pressing "השוואה" with only non-numbers typed ("abc") does nothing at all: no table and no message (`filled` is empty, so the result block stays hidden). Screenshot: `qa/components/stage-3/SheetMatch-desktop-06-non-number-silent.png`.
  - The print view writes the loan as typed, "400000 ₪", while every other amount is formatted ("3,247.15 ₪"). Screenshot: `qa/components/stage-3/SheetMatch-phone-09-print-view.png`.
  - Likely code: `src/components/SheetMatch.vue`, the `v-if="checked && course && filled.length"` block and the print paragraph.

What works:
- The course's four figures match `sheet.statement.*`: 3,247.15 / 3,246.15 / 584,486.00 / 184,486.00. `Decimal` agrees.
- Each convention, with all four figures, is named correctly: statement ("תואם עד האגורה"), exact (36 agorot more), payment unrounded (98 / 34 / 34 agorot), and no last-month fix (1.00 ₪ more on the last payment and the total). Differences of a few shekels give the "כמעט בטוח עיגול" text. Tens of shekels give "ההפרש גדול מעיגול". A minus sign ("−3247.15") is read as negative.
- Loan errors have their own messages (0, "abc", 60%, 0 or 601 months, 12.5 months). A 0% loan works (1,000.00 a month). "חזרה להלוואה של הסדנה" restores 400000 / 5.4 / 180 and keeps focus. What was typed is saved and restored.

## FillTable (3.1–3.11)

Bugs:
- **FillTable-1 · קטן (nit): in 3.8 the period column ("1–5", "6–10", "11–15", "16–20") is drawn backwards.** The row name is plain text in an RTL cell. ForecastPaths, a few paragraphs above, shows the same ranges in `.ltr`.
  - Steps: open 3.8's "השלימו את הלוח החזוי".
  - Actual: measured at 390px, "6–10" is "6" at x=354, "–" at x=346 and "10" at x=333–340, so it reads "10–6" left to right.
  - Screenshot: `qa/components/stage-3/FillTable-3_8-phone-01-period-ranges.png`.
  - Likely code: `src/components/FillTable.vue:80`. Put `nameOf(row, i)` in `<span class="ltr">`.
- **FillTable-2 · קטן (nit): in four lessons the success line reads "הכול נכון. נכון. …".** The component writes "הכול נכון." and the page's `success` text starts with "נכון." again.
  - Steps: fill the half-worked table in 3.8, 3.9, 3.10 or 3.11 correctly and press "בדיקה".
  - Screenshot: `qa/components/stage-3/FillTable-3_8-desktop-07-success-double-nachon.png`.
  - Likely code: `src/pages/lessons/3-8.mdx:304`, `3-9.mdx:240`, `3-10.mdx:280`, `3-11.mdx:259`.

What works:
- For all eleven tables I filled every blank with its value from the props, written as a learner would ("1,234.56", "31.25%"). Each answered "הכול נכון." and saved `{"done":true}`. One wrong cell gives "יש תאים שעוד לא נכונים (מסומנים באדום)". Focus stays on "בדיקה", and on the reveal button after "הצגת הטבלה המלאה" (now "חזרה למילוי").
- Every input is named by its column and row ("רכיב ריבית, חודש 2", "התמהיל בחודש, שנים 6–10"). Nothing is under 12px, and every input is at least 44px.

## NumericExercise (all 55 in 3.1–3.12)

Bugs: none in the component. The `parseAnswer` note above applies here too.

What works:
- For every exercise: the answer in the props is accepted, written with grouping ("1,032.8"). Every common error in the props gets its own message rather than "נכון" (none sits within the tolerance of the answer). "abc" and an empty field give "לא הצלחנו לקרוא מספר". Two wrong answers open the solution and add "הפתרון המלא נפתח מתחת לתרגיל". Shekel answers off by under 1 ₪ are "נכון בקירוב" with the exact value. The exact answer, formatted, appears in its `<Solution>` text, so answers and solutions agree.
- Answers checked against the data files include 3.12-1 = 1,032.80 (`hand.payment`), 3.12-7 = −1.00 (`ex6.answer`), 3.10-3 = 5.54%, 3.7-4 = 31.25% and 3.6-3 = 216 months. Enter in the field keeps focus there. A right answer is saved (`{"text":…, "correct":true}`).

## BigPictureMap in 3.12

Bugs:
- **BigPictureMap-1 · חשוב (should fix): "חדש בשיעור הזה" marks nothing in 3.12. This is the stage-2 bug, unfixed.** A node is new when `node.lesson === lesson`, and no node has lesson "3.12": the nine stage-3 nodes came in at 3.1, 3.2, 3.7, 3.8, 3.9 and 3.10. The legend still shows the "new" swatch, and the text above the map says "בשלב 3 נכנסו אליה החישובים…", but all 40 nodes look like "משיעורים קודמים".
  - Steps: open the map in 3.12 at either width.
  - Expected: in a stage summary, mark the stage's nodes as new (for example a `since="3.1"` prop compared by lesson number), or drop the legend entry.
  - Screenshot: `qa/components/stage-3/BigPictureMap-desktop-06-start-schedule.png`, `qa/components/stage-3/BigPictureMap-phone-01-start-schedule.png`.
  - Likely code: `src/components/BigPictureMap.vue:44` (and line 124 for the legend).
- **BigPictureMap-2 · קטן (nit): the lesson's answer to task 3 leaves out a link the map draws.** "החזר מרבי חזוי" is linked to תזרים התמהיל, אינפלציה **and עוגן** ("התחזית שלו מזיזה את המסלולים המשתנים"). The answer names only "תזרים התמהיל, והאינפלציה".
  - Steps: select "החזר מרבי חזוי" and compare with "מה הייתם אמורים לראות", item 3.
  - Screenshot: `qa/components/stage-3/BigPictureMap-desktop-08-max-payment.png`.
  - Likely code: `src/pages/lessons/3-12.mdx:426`.
- **BigPictureMap-3 · קטן (nit): three display slips, two of them from stage 2.**
  - The "לוח סילוקין" card's note "שיעורים 3.2–3.4" is drawn "3.4–3.2" (measured: "3.2" at x=829–839, "3.4" at x=804–814). The note is plain text in RTL (`src/components/big-picture/stage-3.ts:42`).
  - On the desktop map, link lines still run straight behind unrelated nodes. From "תזרים התמהיל" the line to "תמהיל" runs up through the whole track column (קבועה צמודה … הסיכון בכל מסלול), and lines to "סך תשלומים" pass behind "לוח סילוקין" and "החזר ראשון".
  - Cards show internal references to learners: "Brain, ENG-223", "Brain, 16646263", "המימוש לא הושלם" (`stage-3.ts:31, 55, 91`).
  - Screenshot: `qa/components/stage-3/BigPictureMap-desktop-07-mix-cashflow.png`.

What works:
- The map at 3.12 has 40 nodes and 76 links. The three tasks match the lesson's answers in the highlights, the lines and the card's links:
  - "לוח סילוקין" (open at first): in, החזר חודשי, קרן שווה, גרייס, אינפלציה, פריים, עוגן; out, יתרת חוב, תזרים התמהיל.
  - "תזרים התמהיל": the six measures, החזר ראשון, החזר בתנאים הנוכחיים, החזר מרבי חזוי, סך תשלומים, ערך נוכחי של התשלומים and שיעור תשואה פנימי (IRR), plus לוח סילוקין and תמהיל.
- On the desktop map every line starts and ends within 2px of a button's centre: after a selection, after list → map, and after resizing to 900px.
- Nodes select with Enter and Space and keep focus. A link in the card selects that node and focuses it, in view. On a phone the list is the only view, each node opens its card under it (`aria-expanded`, "+"/"−"), and closing keeps focus. "הצגה כרשימה" on desktop keeps focus on the toggle. Every Tab stop has a ring, and every button is at least 44×44.
