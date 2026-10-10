# QA report: the interactive components of stage 2, in a real browser

Date: 2026-10-10

I edited no source file. I copied the built `dist/` (built 2026-10-09 16:57; `dist/lessons/2-12/` was present, so I did not rebuild) to my scratch folder and served the copy with a small Node server on a random port. I drove Chromium (`/opt/pw-browsers/chromium-1194`) through `playwright-core` at 390×844 (phone, touch on) and 1280×900 (desktop), and opened every stage lock with `addInitScript` before each page load. Each component was scrolled into view and waited on until its island hydrated. Screenshots are in `qa/components/stage-2/` (gitignored), named `<Component>-<phone|desktop>-<n>-<state>.png`; the site header is made static only while a screenshot is taken, so it does not cover the component. The scripts are in my scratch folder, not in the repo.

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
- that the numbers match `data/lessons/2-X.json`, with a few recomputed in Python `Decimal`.

**Colours:** none of the eleven files (`RateLayers`, `LinkedOrNot`, `CardSort`, `TrackOverTime`, `UpdatePointsTimeline`, `RepaymentPaths`, `BalanceForces`, `TrackCompare`, `TrackOrder`, `BigPictureMap`, `BigPictureCard`) has a raw hex, `rgb()` or `hsl()`, and no rendered element inside them carries one in a `style`, `fill` or `stroke` attribute. Every colour is a `var(--mogi-…)` token or a Tailwind token class. The only hex values are the two in `src/styles/tokens.css` (`#00CECB`, `#0A9396`), plus the slider focus glow in `main.css` (`rgba(0, 206, 203, 0.18)`, the same turquoise).

**Since stage 1:** every range slider is now 44px tall (`main.css`), so the slider touch-target bug from stage 1 is fixed for all of these components.

**Outside the components:** `/video/2-1.mp4` (and the other stage-2 lesson videos, see below) are missing from `dist/video/`, so the request fails on load. That is the page, not a component.

## RateLayers (2.1)

Bugs:
- **קטן — with a Bank of Israel rate near 0 and a large negative spread, the track's bar is longer than prime's.**
  - Steps: set the Bank of Israel rate to 0% and the spread to −2.
  - What happened: prime is 1.5%, the track's rate is −0.5%. The prime row shows a bar 1.5 points long, but the track row shows a dashed "falls away" part 2 points long, filling the whole scale (0–2%). The track's row reads as if it were bigger than prime. The cards (−0.5%, "מתחתיה ב־0.5 נקודת אחוז") are right.
  - Expected: the dashed part never wider than prime (clamp it at prime, and mark the part below zero differently), or sliders that cannot reach a negative rate.
  - Screenshot: `qa/components/stage-2/RateLayers-phone-06-boi-0-spread-2.png`.
- **קטן — the scale's labels sit 7–8px to the right of their ticks.** Each `w-0 text-center` label overflows to one side instead of centring on its point.
  - Steps: open 2.1 at either width and compare the labels under the bars with the bar ends.
  - What happened: at 390px, "3%" is centred at x=203 while 3% on the bars is at x=195; every label is 7–8px off in the same direction, at both widths. "0%" sticks out past the end of the bars into the card's padding.
  - Expected: each label centred on its point (for example `translate-x-1/2` on a 0-width span, or absolute positions as in TrackOverTime).
  - Screenshot: `qa/components/stage-2/RateLayers-phone-01-default.png`.

What works:
- The defaults match `data/lessons/2-1.json`: Bank of Israel 3.25%, prime 3.25 + 1.5 = 4.75% (`prime.current`), spread −0.8, track 3.95% (`track.example`), "מעליה ב־0.7 נקודת אחוז" (`track.over_boi`).
- The three tasks match the data: spread −0.5 → 4.25% (`slider.rate`); Bank of Israel 2.75% → prime 4.25%, track 3.75% (`slider.prime_two_cuts`, `slider.rate_two_cuts`), and the status says it fell by 0.5 points; spread −1.5 → 3.25%, "בדיוק בגובה שלה" (`slider.at_boi_spread`).
- The bars share one scale and add up: at the defaults on a phone, 171px (3.25) + 37px (0.7) + 42px dashed (0.8) = 250px = prime's 171 + 79; at 6% and +2 the grey spread is 145px = 2 points of a 10-point scale.
- The sliders take ArrowLeft/ArrowRight (in RTL, ArrowLeft raises the value, as the thumb moves), Home (0) and End (6). Focus stays on the slider.
- Tab order: slider, slider, the table button; each draws a focus ring.
- The table opens with Enter and closes with Space; focus stays on its button, now named "הסתרת הטבלה". Its five rows match the bars and the cards.
- No horizontal scroll, nothing under 12px, nothing clipped, every number with a sign inside an `.ltr` span, no console errors.

## LinkedOrNot (2.3)

Bugs:
- **קטן — the inflation labels under the chart sit 7–8px to the right of their grid lines.** Same cause as in RateLayers: `w-0 text-center` spans with `px-[1.5%]` do not centre on the SVG's x positions.
  - Steps: open 2.3 and compare "4%" with the fourth grid line.
  - What happened: at 390px "4%" is centred at x=203 and its grid line is at x=195; at 1280px, 552 against 545. Every label is off by the same amount, and "0%" pokes past the chart's right edge.
  - Expected: each label centred on its grid line.
  - Screenshot: `qa/components/stage-2/LinkedOrNot-phone-01-default.png`.
- **קטן — the table shows agorot, the cards do not.** The cards say "105,060 ₪"; the table says "105,060.00 ₪" and "לא צמוד, בכל שורה: 105,000.00 ₪". Same values, two formats on one screen.
  - Expected: one format (the cards' `formatShekelsText`, or agorot in both).
  - Screenshot: `qa/components/stage-2/LinkedOrNot-phone-07-table.png`.
- **קטן — when the break-even point is off the chart, nothing says so.**
  - Steps: non-indexed 0%, indexed 6%, inflation 8%.
  - What happened: the text says "נקודת האיזון: אינפלציה של −5.66%" (right: 1/1.06 − 1), and the dashed line is gone, because it is outside 0–8%. The legend still lists "נקודת האיזון" with no line to match it.
  - Expected: a short note such as "מחוץ לגרף", or hide the legend entry.
  - Screenshot: `qa/components/stage-2/LinkedOrNot-phone-05-break-even-negative.png`.

What works:
- The defaults match `data/lessons/2-3.json`: 105,000 (`explain.plain_owed`), 105,060 (`explain.indexed_owed`), 102,000 after indexation (`explain.indexed_amount`), "זול יותר ב־60 ₪" (`explain.gap`), break-even 1.94% (`slider.break_even`).
- Inflation 4% → 107,120 (`slider.owed_4`); non-indexed 4% → break-even 0.97% (`slider.break_even_2`). Python `Decimal`: 1.05/1.03 − 1 = 1.9417%, 1.04/1.03 − 1 = 0.9709%.
- The table's nine rows match a `Decimal` recomputation (100,000 × (1+π) × 1.03) and the five rows of `explain.table` (−2,000 / −970 / 60 / 1,090 / 2,120).
- The chart is consistent with itself: the dashed break-even line sits exactly where the two lines cross (x 479.5 in the viewBox, also at 0.97% → 554.8), and the dot lies on the rising line at every inflation tried.
- Equal costs (3%/3%/0%, and 8%/0%/8%) say "שני המסלולים עולים אותו דבר".
- Keyboard: Tab goes slider, slider, slider, table button, each with a focus ring; the inflation slider steps by 0.25 with the arrows (eight ArrowLeft presses: 2% → 4%) and keeps focus. The table opens with Enter and keeps focus on its button.
- On a phone the odd labels (1%, 3%, 5%, 7%) are hidden so the even ones do not collide.
- No horizontal scroll, nothing under 12px, nothing clipped, no console messages.

## CardSort in 2.4

Bugs:
- **קטן — on desktop, two piles sit in a three-column grid.** The pile buttons and the piles use `sm:grid-cols-3`, written for lesson 1.3's three piles. Lesson 2.4 has two, so the left third of the card is empty, both above and below.
  - Steps: open 2.4 at 1280px.
  - Expected: as many columns as piles (for example `sm:grid-cols-2` when there are two).
  - Screenshot: `qa/components/stage-2/CardSort-desktop-06-wrong.png`.
- **קטן — the hint after a wrong pick reads oddly in this lesson.** The template says the pile "עונה על השאלה ״…״", but 2.4 passes descriptions, not questions: "הערימה ״מובן 2: לפני אינפלציה״ עונה על השאלה ״ההפך שלה: ריאלית (שיעור 0.8)״ — והמשפט הזה לא עונה עליה."
  - Steps: pick "מובן 2" for the first card.
  - Expected: wording that fits a description (for example "בערימה ״…״ ההפך של נומינלית הוא ריאלית; במשפט הזה אין…"), or questions in the lesson's data.
  - Screenshot: `qa/components/stage-2/CardSort-phone-02-wrong.png`.

What works:
- Ten cards, five in each pile, as the lesson's answer says. I sorted all ten by keyboard (Enter on even cards, Space on odd), with one wrong pick on cards 1 and 4. The end message counts "עם 2 טעויות בדרך", and `mogi-course:exercise:2.4-sort` is saved as `{"done":true,"mistakes":2}`.
- Focus is now managed (the stage-1 "focus drops to body" bug is fixed here): after a wrong pick it stays on the pile button; after a right pick it moves to the explanation; Tab from there lands on "לקלף הבא"; after "לקלף הבא" it moves to the new card; after "להתחיל מחדש" it moves to the first card again. It never fell to `<body>`.
- The piles below are the table view and match what was sorted, card by card.
- The numbers in the cards check out in `Decimal`: (1 + 5.9%/12)^12 − 1 = 6.06%; 1.06/1.02 − 1 = 3.92%.
- Pile buttons are at least 44px tall and show a focus ring; no horizontal scroll, nothing under 12px, nothing clipped, no console messages.

## TrackOverTime (2.5 "fixed" and 2.6 "prime")

Bugs:
- **חשוב — in 2.6, hiding the index leaves the numbers in purchasing power, with no switch to turn it off.**
  - Steps: in 2.6 press "שלב 2: להזיז גם את המדד", set the index to 3% in all four periods, press "בכוח קנייה של היום", then press "הסתרת המדד".
  - What happened: the index sliders and the view switch disappear, but `real` stays on and the hidden 3% path still applies. In year 10 the cards still say 2,764.61 ₪ and 269,882.68 ₪ (paper: 3,715.41 ₪ and 362,699.75 ₪), and the graph captions still say "בכוח קנייה של היום". The only way back to paper shekels is to open step 2 again.
  - Expected: hiding the index returns to "בשקלים שעל הנייר" (and preferably resets the hidden path to 0%), or the view switch stays visible while it is on.
  - Screenshot: `qa/components/stage-2/TrackOverTime-phone-21-2_6-prime-index-hidden-still-real.png` (before: `…-20-2_6-prime-index-3-real.png`).
- **חשוב — at 390px the year-by-year table is wider than its box, and no scroll hint is shown.**
  - Steps: open "הצגה כטבלה" on a phone, in 2.5 or 2.6.
  - What happened: the table is `min-w-[30rem]` (480px) inside a 324px box, so the two balance columns are past the left edge. The box is `max-h-80 overflow-auto`, and the layout's scroll-hint script only looks for `.overflow-x-auto`, so the island never gets `data-wide-table` and the hint "הטבלה רחבה מהמסך…" never appears.
  - Expected: the hint, as for every other wide table (add `overflow-x-auto` to the box, or widen the script's selector).
  - Screenshot: `qa/components/stage-2/TrackOverTime-phone-07-2_5-fixed-table.png`, `qa/components/stage-2/TrackOverTime-phone-22-2_6-prime-table.png`.

What works:
- **2.5:** year 1 matches `data/lessons/2-5.json`: 3,959.73 / 582,076.13 non-indexed, 3,394.14 / 589,320.19 indexed. Year 8: 3,898.80 indexed (under 3,959.73); year 9: 3,976.77 (over it), as the lesson says. Index 0% everywhere: a flat 3,327.59. "שנים 1–5" at 5%, year 5: balance 614,979.59 (`slider.linked_5_after5`). Purchasing power, year 10: 3,327.59 indexed and 3,248.36 non-indexed (`explain.unlinked_real10`).
- **2.6:** the default is 3,715.41 / 580,538.94. "שנים 1–5" at 5.75% (four ArrowLeft presses from 4.75): year 1 is 4,043.06, year 6 is 3,783.55, not back to 3,715.41. With step 2 and 3% index, the paper figures do not move; in purchasing power, year 10 is 3,715.41 / 1.03^10 = 2,764.61.
- All twenty table rows match the data series, for 2.5 at the defaults (`slider.unlinked`, `slider.linked_2`) and for 2.6 at four settings (`slider.base`, `slider.first_up`, `slider.third_up`, `slider.lower`): 0 mismatches out of 80 rows at each width.
- Python `Decimal` agrees on the payments: 600,000 at 5%, 3%, 4.25%, 5.25% and 3.25% over 240 months gives 3,959.73, 3,327.59, 3,715.41, 4,043.06 and 3,403.17.
- The year slider takes End (year 20, balance 0.00), Home and the arrows, and keeps focus. The dashed marker moves with it, and the cards follow.
- The view switch reports `aria-pressed` and keeps focus after Enter; "שלב 2" keeps focus and renames itself "הסתרת המדד".
- Tab order follows the screen (the period sliders, the view switch, the year slider, the table button), every stop has a visible ring, and every slider has its own `aria-label` naming its period.
- The year labels under the graphs are centred on their positions (0 at the right edge, 20 at the left), unlike the `w-0` labels in RateLayers and LinkedOrNot.
- No horizontal page scroll, nothing under 12px, nothing clipped, no console messages, at either width.

## UpdatePointsTimeline (2.7)

Bugs:
- **קטן — points that have passed look the same as points still to come.** The table marks each point "עברה", "הבאה" or "בהמשך"; the lane only marks the next one (navy). Points before "today" are the same teal as later ones, and the grey "passed" fill under them is hidden by the dots when they are dense.
  - Steps: choose "כל שנה" with today at month 38.
  - What happened: points 1, 2 and 3 (already passed) look like points 5–19.
  - Expected: passed points drawn differently (for example hollow or grey), so the lane says what the table says.
  - Screenshot: `qa/components/stage-2/UpdatePointsTimeline-phone-03-every-year.png`.
- **קטן — the year labels under the lane are not centred on their points.** A label starts 10px past its point instead of being centred: one-digit labels are 6–7px off ("5" at 74px from the start, its point at 81px, phone), two- and three-character ones 1–4px off.
  - Expected: each label centred on its point (`translate-x` by half its width, in the inline direction).
  - Screenshot: `qa/components/stage-2/UpdatePointsTimeline-desktop-09-default.png`.

What works:
- The defaults match `data/lessons/2-7.json`: 20 years, every 5 → 3 points after 5, 10, 15 years (`slider.points_20_5`, `slider.count_20_5`); today at month 38 ("3 שנים ו־חודשיים") → next point at month 60, "בעוד 22 חודשים" (`slider.next_38`).
- "כל 2.5" → 7 points: 2.5, 5, 7.5, 10, 12.5, 15, 17.5 (`slider.count_20_2_5`, `slider.years_20_2_5`). 25 years, every 5 → 4 points (`slider.count_25_5`).
- Edge cases read correctly: 5 years every 10 → "אין נקודות עדכון: המסלול נגמר לפני…"; today after the last point → "לא נשארו נקודות עדכון"; today at 0 → "יום ההלוואה", next in 60 months. Shortening the term to 10 years with today at 290 clamps today to 120 ("10 שנים מתחילת ההלוואה").
- The dots sit exactly at month/term of the lane (81, 162, 243 of 324px), the "today" line moves with its slider, and the prime and fixed lanes show the same "today".
- The table rows match the status line (60/120/180; "הבאה", "בהמשך").
- Keyboard: Tab goes term, today, the eight interval buttons, the table button, each with a ring. Enter and Space select an interval, `aria-pressed` follows, and focus stays on the button. ArrowLeft on the term slider steps one year (20 → 25 with five presses), and today's slider `max` follows the term (240 → 300).
- The interval buttons are at least 44×44; no horizontal scroll, nothing under 12px, nothing clipped, no console messages.

## RepaymentPaths (2.9 "methods" and 2.10 "grace")

Bugs:
- **חשוב — at 390px the year-by-year table is wider than its box, and no scroll hint is shown.** Same cause as TrackOverTime: the table is `min-w-[30rem]` (480px) in a 324px `max-h-80 overflow-auto` box, which the layout's scroll-hint script (`.overflow-x-auto` only) never sees, so `data-wide-table` is never set.
  - Steps: open "הצגה כטבלה" on a phone, in 2.9 or 2.10.
  - What happened: "מזה ריבית" and "יתרה בסוף השנה" are past the left edge, with nothing saying so.
  - Expected: the scroll hint, as for other wide tables.
  - Screenshot: `qa/components/stage-2/RepaymentPaths-phone-05-2_9-methods-table.png`, `qa/components/stage-2/RepaymentPaths-phone-17-2_10-grace-table.png`.
- **קטן — on a phone the "600,000 ₪" label on the balance chart is drawn right on the lines.** Its `top` is the line's position minus 9% of the chart's height; on a phone the chart is about 100px tall, so 9% is about 9px, half the label's height. The label's centre lands 1px from the principal line, at the exact corner where every balance line starts and the dashed month marker sits.
  - Steps: open 2.9 or 2.10 at 390px; clearer with 36 grace months in 2.10, where the full-grace line climbs through the label.
  - What happened: the grey line, the curves and the marker cross the text. At 1280px the label clears the line by 13px.
  - Expected: a fixed offset in pixels (for example `translate-y-[-100%]`), not a percentage of the chart.
  - Screenshot: `qa/components/stage-2/RepaymentPaths-phone-13b-2_10-grace-36-balance-label-crop.png` (crop of `…-phone-13-2_10-grace-grace-36.png`).

What works:
- **2.9** matches `data/lessons/2-9.json`: Spitzer first 3,893.74 and last 3,895.68 (`slider.spitzer_first`, `slider.spitzer_last`), equal principal first 4,900.00 and last 2,510.00; interest 334,499.54 against 289,200.00, "45,299.54 ₪ פחות ריבית" (`slider.interest_gap`); paid 934,499.54 and 889,200.00. Month 101: equal 3,900.00 over Spitzer's 3,893.74; month 102: 3,890.00, under it, so the first cheaper month is 102 (`slider.crossover`). 30 years: Spitzer 3,147.99, interest 533,278.18 (`slider.spitzer_first_30`, `slider.spitzer_interest_30`).
- **2.10** matches `data/lessons/2-10.json`: first month 3,893.74 / 2,400.00 / 0.00; after the grace 3,893.74 / 4,016.41 / 4,213.50 (`slider.partial_after`, `slider.full_after`); interest 334,499.54 / 344,541.47 / 360,676.60, gaps 10,041.93 and 26,177.06 (`slider.partial_extra`, `ex5.answer`). Month 12 of full grace: payment 0, "נוסף לחוב 2,507.74", balance 629,442.14 (`slider.full_balance`). 36 grace months: full-grace interest 414,695.03, 80,195.49 more (`slider.full_interest_36`, `slider.full_extra_36`). Grace 0 makes all three ways identical.
- Python `Decimal`, with each month's interest rounded to agorot: the four schedules (Spitzer, equal principal, partial and full grace) give the same totals, and the year-by-year tables (Spitzer and equal principal in 2.9, partial and full grace in 2.10) match my recomputation in all 20 rows.
- The payment panels share one scale ("גובה מלא: 5,292 ₪" = 4,900 × 1.08), the month marker moves in all panels and the balance chart, and the dotted line over the grace months in 2.10 shows the partial-grace panel as interest only and the full-grace panel empty.
- Keyboard: Tab goes amount, rate, term, (grace,) month, table button, each with a ring and an `aria-label`. End on the month slider goes to month 240; ArrowLeft steps one month; End on the grace slider goes to 36; focus stays on the slider. In the table, the way buttons take Space, report `aria-pressed`, and keep focus.
- Extremes (2,000,000 ₪ at 8%; 5 years with 36 grace months) render without overflow, clipping or errors.
- No horizontal page scroll, nothing under 12px, no console messages from the component. (`/video/2-9.mp4` is missing from `dist/video/`.)

