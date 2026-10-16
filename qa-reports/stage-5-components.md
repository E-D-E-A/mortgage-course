# QA report: the interactive components of stage 5, in a real browser

Date: 2026-10-16

I edited no source file. I copied `dist/` to my scratch folder, served it with a small Node server and drove Chromium (`/opt/pw-browsers/chromium-1194`, `playwright-core`) at 390x844 (touch) and 1280x900, with every stage lock opened by `addInitScript`. Scripts and screenshots are in my scratch folder, not in the repo.

**Coverage.** Done at both widths: PreApprovalDoc (5.1), UniformBaskets (5.2), OfferCompare (5.3), CurveForecast (5.4), WhichNumber (5.5), MixBuilder (5.6, 5.7, 5.8: every guided task), MixJudge (5.9), MixComplianceChecker (5.10). For each: horizontal overflow, text under 12px, tap targets, Tab rings, console, a bidi probe (character positions of every number, sign and range). **Not finished:** the FillTable, NumericExercise and ChoiceExercise samples of lessons 5-1..5-10 (right answers, common wrong answers, hint logic). The first run of my driver had a bug in reading the islands' props, so its results are void. A corrected run was started and had not finished. Treat the exercises as untested.

**Clean.** No console error, warning, hydration message or page error in any state. No page-level horizontal scroll. No text under 12px. No tap target under 44px (sliders included, 44px high). Every Tab stop draws a ring. Every figure of every guided task matches the lesson page and `data/lessons/5-X.json`.

## Summary

| Severity | Count | Items |
| --- | --- | --- |
| blocker | 0 | none |
| should-fix | 4 | MixComplianceChecker-1 (task 4 cannot be reproduced) · MixBuilder-1 (result 1,100-1,400px from the sliders on a phone) · PreApprovalDoc-1 (explanation about 1,100px below the line you tap) · OfferCompare-1 (phone table clipped, the shekel sign wraps) |
| nit | 8 | listed below |

## Should-fix

- **MixComplianceChecker-1: guided task 4 of 5.10 cannot be reproduced.** Slider `STEP = 10000` (`src/components/MixComplianceChecker.vue:61`, used at `:114`) but the case-A preset has amounts 546,000 / 547,000 / 547,000, which are off the grid. The label shows 547,000 while the thumb sits at 550,000 (`input.value` is "550000"). The first touch jumps the amount by 7,000 or 13,000 and the loan changes.
  - Steps: 5.10, pick "תיק א׳: תמהיל הפתיחה", move the second and third amount by 100,000 (set 447,000 and 647,000, which snap to 450,000 and 650,000).
  - Expected (lesson): variable part 993,000, room 100,333.33, payment 8,198.86, ratio 40.49%. Actual: loan 1,646,000, variable part 60.51% with room 101,333.33, payment 8,228.38, ratio 40.63%. One ArrowRight from the start gives 540,000, one ArrowLeft 560,000 (loan 1,653,000).
  - Fix: let the preset set the step (a prop, 1,000 as in MixBuilder's `amountStep`) or move case A onto the grid. The preset itself is right: 40.4%, above the capital line by 81.30 ₪, variable part 333.33 ₪ inside, all as the lesson says.
- **MixBuilder-1: on a phone the result is far from the sliders.** At 390px the `role=status` block sits 1,418px (5.6, 5.7: track 1 rate) and 1,103px (5.8) below the slider you move; the viewport is 844px. You cannot see a number change. Same cause as stage 4 Checkers-1. Likely code: `src/components/MixBuilder.vue` results block (`role="status"`, about line 428). Make the three headline cards sticky on a phone. Also: the guided tasks say "החזירו" and the component has no reset button (restoring a type and a 4.40 rate by slider is fiddly).
- **PreApprovalDoc-1: the explanation is out of view after a tap.** At 390px, tapping any of the 13 lines leaves the "מה כתוב בהוראה / מה זה אומר" panel at y=1003..1499 while the line is at y=386..558 (viewport 844). Likely code: `src/components/PreApprovalDoc.vue:197`. Put the panel under the tapped line, or scroll it into view.
- **OfferCompare-1: phone table clipped and the shekel sign wraps.** At 390px the table is 344px in a 324px box, the left column is cut and "1,593,393.78 ₪" breaks with the sign alone on the next line. The box is not focusable and has no scroll hint. Likely code: `src/components/OfferCompare.vue:148` (`overflow-x-auto`, no min-width) and `:162` (the `.ltr` span has no `whitespace-nowrap`). Same pattern as stage 4 RegulationChecker-2.

## Nits

- **WhichNumber-1:** "מההתחלה" removes its own button, focus falls to `<body>` (`WhichNumber.vue:49`, `:103`). Same cause as stage 4 Prediction-1.
- **WhichNumber-2:** statement 5 ("הריבית הממוצעת של בנק ב׳") is classed "ריבית ממוצעת (בנק ישראל)" although it is a bank's own average. Also the score counts the last pick, so clicking all four buttons reaches 8/8 (`:44-47`). "על אותה בסיס" should be "על אותו בסיס" (`:29`).
- **MixJudge-1:** `role="tab"` without arrow keys and with every tab `tabindex=0` (`MixJudge.vue:63`). The ARIA tab pattern is half done.
- **Axis ticks:** the first tick label sticks out 2px past its box in CurveForecast (`:194`, `:206`) and MixBuilder (`:563`). No page scroll.
- **Money in plain text:** in PreApprovalDoc, OfferCompare's mix line and MixJudge's note the sign sits left of the number ("₪ 360,000" in reading order) while `.ltr` spans elsewhere put it on the right. Same content, two conventions.
- **5.7 answer text:** "8,133 ₪" is written without ".00" next to "8,181.30 ₪" (page text, not the component).
- **5.1 text:** "24 יום" should be "24 ימים".
- **Solutions:** no sliders have `aria-valuetext` (as in stage 4).

## Per component

- **PreApprovalDoc (5.1):** 13 lines all select and update the panel, `aria-pressed` is single. The highlight toggle (Enter and Space work) leaves exactly "מי ומה מבקשים", "עמלות שנגבות ביום ההעמדה" and "מה צריך להשלים" unmarked, as the lesson says. The table has 13 rows. Figures: first 4,970.56 (2,115.02 + 1,990.79 + 864.75), highest 5,807.89 at month 300, total 1,617,347.35, rate 5.22%.
- **UniformBaskets (5.2):** default 4,895.06 / 6,364.93 / 5.51% (basket 2), 5.07% (basket 3), as the lesson. 1,000,000 replaces basket 2 with the message. Bank B basket 1 = 5.17% lowest. All 48 bank/loan/term combinations: no NaN.
- **OfferCompare (5.3):** all five presets match the lesson (5.07%, 5.65%, 1,049,100.12, third proposed row lowest in C, B, C). Deliberately breaking the basis by hand: a different amount, mix, forecast or "month" (forecast C) each warns and names what differs; amount plus mix names both; all three identical (even on 600,000 / uniform 1 / forecast B) compares and marks "נמוך ביותר". A preset button stops being pressed after a manual change. "Month" cannot be changed apart from the forecast (forecast C carries November).
- **CurveForecast (5.4):** tasks 1-4 reproduce: 2,668.92 at month 240, 2,798.92 at month 61, 2,487.62 flat, 3,337.53 at month 240 for fixed linked flat. 5 types x 3 versions x resets: no NaN. The reset buttons show only for variable types.
- **WhichNumber (5.5):** 8 statements x 4 buttons: feedback right every time, the right class is named, one `aria-pressed`. The picks survive a reload. On a phone an item is 196-308px tall, the feedback stays on screen after a tap.
- **MixBuilder 5.6:** initial 8,181.30 / 8,181.30 / 2,945,264.34. Task 1 7,722.68 / 9,559.41 / 3,079,509.11; task 2 8,992.92 / 2,697,873.23; task 3 8,181.30 / 9,435.33 / 3,352,731.52. All as the lesson.
- **MixBuilder 5.7:** task 1 -48.30 / -45.30 / -17,381.34, variable share 66.65%; loan slider 1,600,000: 7,981.75, ratio 39.42%, financing 72.73%; rate 4.85: +82.16 and +29,577.01; 25 years: +811.62 and -247,391.11; prime and anchor +1: max +609.84, total +198,653.35; linked at 2.9 with inflation 2 to 3: +1,401.48 and +200,505.43. Five lines at start: ratio 40.4% above the capital line by 81.30, variable part 333.33 inside.
- **MixBuilder 5.8:** alternative A 6,606.34 (-1,574.96) / 11,945.41 (+3,764.11) / 3,245,453.79, ratio 32.57%, balances 1,598,808.49 / 1,566,792.61 / 1,498,448.75 / 1,318,518.24, stress 24,729.94 and 5,175,531.31. Alternative C 8,212.48, 2,956,492.09, ratio 40.56%, 1,309,253.38 after 10 years. Task 3 8,712.50 and 2,724,760.27. The three scenario presets set `aria-pressed` correctly, the second mix draws, the deltas carry a true "−". Remove and add keep focus on a select; the add button vanishes at four tracks. A rate pushed below zero shows the message.
- **MixJudge (5.9):** the four yardsticks, their same and broken tables match the lesson (7,409.81 over 7,400 by 9.81; 6,662.19 with 737.81 room; 0.044 point; -13.81; 633.45 and 171,663.93). Negative gaps ("−13.81 ₪", "−0.1 נק׳") are drawn left to right with the minus on the left (probe: none reversed). The phone card list equals the table.
- **MixComplianceChecker (5.10):** case A preset: 40.4%, above the capital line by -81.30 ₪ (shown "‎−81.30 ₪"), variable part 333.33 ₪ inside. A's offer 41.64% / 261.71, the mixed preset 41.17% with a yellow source row, all as the lesson. Over states (income 15,000: 54.86% crosses the ban; value 500,000: 329.2%) show "חוצה — אסור" with negative rooms, correct order. The deal radios take arrows. On a phone the verdict is sticky at the bottom.
