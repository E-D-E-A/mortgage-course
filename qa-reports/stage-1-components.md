# QA report: the interactive components of stage 1, in a real browser

Date: 2026-10-09

I edited no source file. I served the built `dist/` with a small Node server on a random port, drove Chromium (`/opt/pw-browsers/chromium-1194`) through `playwright-core` at 390×844 (phone, touch on) and 1280×900 (desktop), and opened the stage-1 lock before each page load. Each component was scrolled into view and waited on until it hydrated. Screenshots are in `qa/components/` (gitignored). Each file is named `<Component>-<phone|desktop>-<n>-<state>.png`. The test scripts are in my scratch folder, not in the repo.

For every component and both widths I checked:
- horizontal page scroll;
- text below 12px, clipped text, and text off screen;
- RTL on the component, LTR on `.ltr` spans;
- touch targets (the box of each button, input or select, or the label around a checkbox or radio);
- Tab order, and whether each Tab stop draws a focus ring;
- Enter and Space on buttons, arrows on sliders, radios and selects;
- console and page errors;
- that the table or list view matches the visual;
- that the numbers match `data/lessons/1-X.json`.

**Colours:** none of the eleven files (`CollateralSale`, `PriceBar`, `CardSort`, `MixSlices`, `DealTree`, `BigPictureMap`, `BigPictureCard`, `MatchTable`, `ProcessTimeline`, `BankCommitment`, `DiyChecklist`) has a raw hex, `rgb()` or `hsl()`. The page clock colours in 1.7 are also `var(--mogi-…)`. Every colour is a token.

**Console:** no component threw or logged an error at either width. The only failed requests were page-level: `/video/1-2.mp4` and `/video/1-7.mp4` are missing from `dist/video/`. That is outside the components, but the lesson videos for 1.2 and 1.7 will not play.

## Bugs that repeat across components

1. **חשוב — every range slider is 24px tall.** This affects CollateralSale (2), PriceBar (2), MixSlices (1–3), ProcessTimeline (1) and BankCommitment (1).
   - Steps: open any of these lessons at 390px and measure the `input[type=range]`.
   - What happened: each slider is 301×24 (phone) or 355×24 (desktop). The thumb is about 16px. On a phone these sliders are the main control, and they are hard to grab.
   - Expected: a hit area at least 44px tall, for example a taller input with a centred track, or padding on the label that forwards to the slider.
   - Screenshots: `qa/components/CollateralSale-phone-01-default.png`, `qa/components/MixSlices-phone-01-default.png`.

2. **קטן — text-style buttons are narrower than 44px.** Every one is 44px tall.
   - DealTree "לשנות": 32×44.
   - BigPictureCard link names: "הבנק" 29×44, "טאבו" 29×44, "שמאי" 33×44, "הלווים" 37×44.
   - DiyChecklist "הדפסה" 41×44 and "איפוס" 35×44.
   - Expected: a `min-w-11` (or padding) on these.
   - Screenshots: `qa/components/DealTree-phone-55-long-path.png`, `qa/components/BigPictureMap-desktop-18-node-selected.png`.

3. **קטן — the lesson's paragraph margins leak into the components.** `.prose-lesson p { margin-block: 16px }` applies to every `<p>` inside a component, as computed in the browser. Cards and piles therefore have large empty gaps.
   - Examples: the three result cards in CollateralSale and PriceBar are about 120px tall each on a phone; the three CardSort piles take a full phone screen while empty.
   - Expected: components keep their own spacing, for example a `not-prose` wrapper or `:where()` on the prose rules.
   - Screenshots: `qa/components/CardSort-phone-22-1_3-sort-wrong.png`, `qa/components/PriceBar-phone-12-over-ceiling.png`.

4. **קטן — focus falls to `<body>` when the focused control disappears.** This happens in CardSort (after a right pick, and after "לקלף הבא"), DealTree (after each answer and after "לשנות"), BigPictureMap (after a link inside the card) and CardSort "להתחיל מחדש".
   - Steps: Tab to an answer button and press Enter or Space.
   - What happened: `document.activeElement` is `body`. A sighted keyboard user still gets to the right next control: the next Tab lands on "לקלף הבא" or on the next question's first option. A screen-reader user loses their place.
   - Expected: move focus on purpose to the new question, the explanation, or the newly selected node.

## CollateralSale (1.1)

Bugs:
- **קטן — a 2px white sliver in the "sale" bar when nothing is left to the borrower.**
  - Steps: debt 600,000, sale 500,000.
  - What happened: the borrower segment is 0% wide but keeps its `border-s-2 border-n0`, so a white line is drawn at the end of the bank's part.
  - Expected: no segment when the share is 0.
  - Screenshot: `qa/components/CollateralSale-phone-02-short-sale.png`.
- The slider touch target is in cross-component bug 1.

What works:
- The defaults match the data: 600,000 / 400,000 / 0 (`explain.full.*`).
- These states all match the data:
  - sale equal to the debt → 600,000 / 0 / 0;
  - low sale → 550,000 / 0 / 50,000 (`explain.low.*`);
  - lesson task 2 → still owed 100,000 (`slider.t2.still_owed`);
  - task 3 → 0 with the big debt and 300,000 with the small one (`slider.t3.*`).
- Both bars share one scale (0.6/0.4 against 0.6; 0.833 against 0.833 + 0.167 owed).
- The status message switches correctly.
- Debt 0 gives everything to the borrower.
- The sliders work with the arrow keys and End. In RTL, ArrowRight lowers the value, which matches the thumb's direction.
- The table opens with Space and matches the cards.
- No horizontal scroll, nothing below 12px, numbers in LTR spans, focus ring on every stop.

## PriceBar (1.2)

Bugs:
- **קטן — the equity slider's scale moves with the price.**
  - Steps: set equity 300,000, then drag the price.
  - What happened: the equity thumb slides on its own, because its `max` is the price. This is correct but surprising. When the price drops below the equity, equity is clamped to the price (800,000 → loan 0 ₪, 0%), which is correct.
  - Screenshot: `qa/components/PriceBar-phone-14-all-equity.png`.
- **קטן — the legend shows the ceiling as a solid line; the bar draws it dashed.**
  - The legend swatch is `w-0 border-s-2 border-dashed`, which renders as one short solid line at 12px.
  - Screenshot: `qa/components/PriceBar-phone-12-over-ceiling.png`.

What works:
- The ceilings 75/70/50 match `ceiling.*`.
- The defaults (750,000 / 75% / 250,000) match `explain.*`.
- Lesson task 1 (1,500,000 and 300,000) gives:
  - loan 1,200,000;
  - 80%;
  - minimum equity 375,000;
  - the message "עוד 75,000 ₪" (`slider.*`).
- Task 2 gives 450,000; task 3 gives 750,000 (selected with Space).
- The radios move with the arrow keys.
- The ceiling marker sits at 75% and 50% from the right edge, and its label stays inside the bar at both widths.
- A decimal ratio (67.48%) displays correctly.
- The table matches the cards.
- No scroll, RTL correct, every stop has a focus ring.

## CardSort (1.3 ×2, 1.5)

Bugs:
- **קטן — the focus loss after a right pick and after "לקלף הבא"** (cross-component bug 4).
  - Screenshot: `qa/components/CardSort-desktop-35-1_3-sort-right.png`.
- **קטן — the empty piles are very tall on a phone** (cross-component bug 3).
  - Screenshot: `qa/components/CardSort-phone-21-1_3-sort-start.png`.

What works, for all three instances (1.3-sort with 12 cards, 1.3-half with 6 cards and 1 given, 1.5-half with 6 cards and 1 given):
- The counter is right on every card: "קלף N מתוך M", plus the "already sorted" note.
- A wrong pick (Enter) marks the pile and explains which question that pile answers.
- A right pick (Space) shows the reason and "לקלף הבא".
- The finish message counts the mistakes ("עם טעות אחת").
- Every pile holds exactly the cards of its bin, so the table view matches.
- `exercise:<id>` is saved as `{done:true,mistakes:1}`.
- "להתחיל מחדש" returns to the given cards only.
- No scroll, nothing clipped, nothing below 12px, Tab reaches every pile.

## MixSlices (1.4)

Bugs:
- Only the slider touch targets (cross-component bug 1).
- One limit, not a defect: with four tracks, pushing track 1 to its maximum (45%) leaves no room for tracks 2 and 3 to grow until it moves back. Screenshot: `qa/components/MixSlices-phone-05-four-squeezed.png`.

What works:
- The default 40/35/25 gives 656,000 / 574,000 / 410,000, adding up to exactly 1,640,000, with 60% able to move. All of these match `slider.split`, `slider.sum` and `slider.moving_share`.
- Unticking track 3 with Space leaves 35%, as the lesson says.
- "3" (Enter) gives 33/33/34 → 541,200 / 541,200 / 557,600, matching `slider.evenish`.
- 4 tracks → 25% each; 1 track → 100%.
- The sliders respect the 5% minimum (End → 95/5, Home → 5/95), and the tracks always add up to the loan.
- The bar segments match the shares.
- Labels under narrow segments shrink to the number.
- The table matches the cards.
- No scroll, focus ring on every stop.

## DealTree (1.5)

Bugs:
- **קטן — five identical "לשנות" buttons.**
  - A screen reader hears "לשנות" with no question attached.
  - Expected: an `aria-label` such as "לשנות את התשובה ל־<question>".
- **קטן — the answer rows are laid out inconsistently.**
  - When the question wraps, the answer and "לשנות" drop to their own line on the right. When the question is short, they sit on the far left of the same line.
  - Screenshot: `qa/components/DealTree-phone-55-long-path.png`.
- The narrow "לשנות" targets and the focus loss after each answer are in cross-component bugs 2 and 4.

What works:
- The tree has 27 nodes and 15 paths.
- By mouse I walked the first, middle and last paths; each reached the right result, and the answers so far are listed.
- By keyboard (Enter and Space) I walked the longest path (5 answers) to "קניית דירה יחידה, במחיר למשתכן".
- Changing an earlier answer works:
  - "לשנות" on step 1 returns to the first question with no answers kept;
  - "לשנות" on step 2 keeps step 1 and asks "על מה הכסף?" again;
  - picking "קונים מגרש" there leads to the land question.
  Screenshot: `qa/components/DealTree-phone-56-changed-step-2.png`.
- "עסקה אחרת" restarts.
- The table lists all 15 paths, with the answers joined by "←" (right to left).
- No scroll, nothing clipped.

## BigPictureMap (1.6)

Bugs:
- **חשוב — on a phone, a link inside a card moves the open node off screen.**
  - Steps: 390px, lesson 1.6. Tap "טאבו", then tap "עורך דין" in its card's links.
  - What happened: the טאבו card closes and the עורך דין card opens above it. The page content shifts up, and the viewport now shows the bottom of the map and the text below it. The newly opened node is above the screen (`in view = false`), and focus is on `body`.
  - Expected: scroll the newly opened node into view, and move focus to it.
  - Screenshot: `qa/components/BigPictureMap-phone-15-after-card-link-viewport.png`.
- **חשוב — after "הצגה כרשימה" → "הצגה כמפה", the link lines stop following the layout.**
  - Steps: desktop. Press "הצגה כרשימה", then "הצגה כמפה". Then make the window narrower (I used 700px).
  - What happened: all 3 of שמאי's lines end away from their nodes (`miss: 3`), and they start from the wrong place. Without the toggle, the same resize redraws correctly. The cause: the `ResizeObserver` is attached once in `onMounted`, to the map element that `v-if` destroys; the new map element is never observed.
  - Expected: re-observe the element whenever it is re-created.
  - Screenshot: `qa/components/BigPictureMap-desktop700-03-stale-lines-after-list-toggle.png`.
- **קטן — on desktop, a link inside the card drops focus to `body`.** The card's buttons are replaced when the node changes.
- **קטן — the lines cross region headings.** The dashed lines run through the headings ("הנכס והעסקה", "התמהיל"). When several lines converge, it is hard to tell which node a line ends at.
  - Screenshot: `qa/components/BigPictureMap-desktop-18-node-selected.png`.

What works:
- The map has 7 regions, 16 nodes and 26 links. The appraiser node is open at first.
- Clicking בנק ישראל, טאבו and הבנק opens the right card and draws 2, 3 and 10 lines, each ending on its node.
- Enter on a node, and Space on a card link, select the node.
- The list view (desktop toggle) lists all 16 nodes.
- At 390px the map is replaced by the list: every node is a 44px-tall row, a tap opens and closes it, and there is no horizontal scroll.
- Tab reaches every node and the toggle.

## MatchTable (1.6, 1.8)

Bugs:
- **חשוב — a wrong row is marked by colour only.**
  - Steps: lesson 1.8, pick a wrong answer in "מצב 2", press "בדיקה".
  - What happened: the message says "מסומנות באדום", and the only mark is a red border on the select. There is no icon or text on the row, which fails for colour-blind learners and screen readers.
  - Expected: a "לא נכון" text (or icon plus text) on the row, and `aria-invalid` on the select.
  - Screenshots: `qa/components/MatchTable-phone-73-1_8-half-one-wrong.png`, `qa/components/MatchTable-desktop-77-1_6-half-one-wrong.png`.
- **קטן — a corrected row stays red until "בדיקה" is pressed again.** The red mark refers to an answer that is no longer there.
- **קטן — "בדיקה" with nothing picked marks every row red** ("יש שורות שעוד לא נכונות"). "Pick an answer first" would be clearer.

What works:
- There is one select per open row.
- Arrow keys change a select.
- Enter and Space press "בדיקה".
- All right → success message, and `{done:true}` is saved.
- "הצגת כל התשובות" shows exactly the right answers with their reasons.
- In 1.8 the reasons use the data file's values (5 business days, 24 and 12 days).
- No scroll, focus ring on the selects.

## ProcessTimeline (1.7)

Bugs:
- **חשוב — the slider and its label disagree after the 7-day box is toggled.**
  - Steps: tick "סוג הלוואה שהבנק הגדיר מראש ל־7 ימי עסקים", drag "הבנק ענה אחרי" to 7, untick the box, tick it again.
  - What happened: the label and the dates say 7 days (approval Monday 19 October), but the slider thumb sits at 5 of 7. The browser clamped the input to 5 while `answeredAfter` stayed 7.
  - Expected: the thumb and the number always agree, for example by clamping `answeredAfter` itself when the limit changes.
  - Screenshot: `qa/components/ProcessTimeline-phone-01-slider-label-mismatch.png`.
- **קטן — at 390px the table is 480px wide in a 309px box.**
  - What happened: the "שעון" column — the one that carries the clocks — is off screen. The page shows a hint, "גררו אותה שמאלה", but in RTL you reveal the left columns by dragging right (the content moves right), so the hint's direction can mislead.
  - Screenshot: `qa/components/ProcessTimeline-phone-88-table.png`. The same table width is in BankCommitment.
- **קטן — the date field shows the browser's format.** Here it showed "10/11/2026" for 11 October; an Israeli reader on an English browser reads it as 10 November. Nothing near the field echoes the chosen date in words.
  - Expected: show the chosen date in Hebrew under the field.
  - Screenshot: `qa/components/ProcessTimeline-phone-88-table.png`.
- **קטן — the default "answered after" equals the maximum (5).** As a result "האישור הגיע" equals "היום האחרון לתשובה" when the lesson opens. The lesson's worked example uses 3 days (14 October → terms until 7 November). Starting at 3 would show two different dates and match the text.

What works:
- 12 steps, matching `steps.count`.
- The three clock bars span exactly steps 3–4, 4–11 and 8, at both widths.
- The steps open with Enter and close with Space.
- The dates match the data:
  - default last answer: Friday 16 October (`worked.answer_by`);
  - Friday not counted: Sunday 18 October (`worked.answer_by_no_friday`);
  - 7 days: Monday 19 October (`worked.answer_by_7`);
  - answered after 3: 14 October, terms until 7 November (`worked.approved`, 1.8 `worked.window_end`);
  - no new lien: 12 days.
- A request on 17 September skips שבת 19.9 and the two holidays on 20.9 and 21.9, and lists them.
- A date outside the range (10 December), or an empty date, shows the "בחרו תאריך בטווח" message with no error.
- The date field works with the arrow keys.
- No page scroll.

## BankCommitment (1.8)

Bugs:
- **חשוב — the table leaves out "הבנק לא חייב".**
  - Steps: press "הצגה כטבלה".
  - What happened: the columns are הרגע · מצב · הבנק חייב · מה יכול לשנות את זה. The cards show a third list, "הבנק לא חייב", which the table drops. The table is not a full alternative to the visual.
  - Screenshot: `qa/components/BankCommitment-phone-99-table.png`.
- **קטן — Hebrew grammar with 0 and 1.**
  - "נשארו 1 ימים" on day 23, "נשארו 0 ימים" on day 24, and "נגמר לפני 1 ימים" on day 25.
  - Expected: "נשאר יום אחד", "זה היום האחרון", "נגמר אתמול".
  - Screenshot: `qa/components/BankCommitment-phone-96-day-24.png`.
- **קטן — at 390px the table is 576px wide in a 309px box.** It scrolls inside its box; see the ProcessTimeline note.

What works:
- The window props (24 and 12) match the data.
- All 7 moments open by keyboard (Enter and Space) with the right title, chip and lists.
- The simulator matches the data:
  - day 20 → 4 days left (`worked.underwriting_left`);
  - day 29 → the window ended 5 days ago;
  - day 17 → 7 left (`ex2.answer`);
  - day 17 without a new lien → "החלון של 12 יום נגמר לפני 5 ימים" (`ex2.err_twelve`).
- A gap → not bound. Everything as reported → bound. A changed request → not bound (Space).
- The radios and the slider work with the arrow keys.
- No page scroll, focus ring on every stop.

## DiyChecklist (1.10, two lists)

Bugs:
- **קטן — printing from the browser menu (Ctrl+P) instead of the "הדפסה" button prints the working view.**
  - In that view 11 of the 12 steps are collapsed (`display:none`), so only their titles print, along with the whole page.
  - Expected: a print rule that opens the closed steps, or a note next to "הדפסה".
  - Screenshot: `qa/components/DiyChecklist-desktop-119-ctrlp-working-view.png`.
- **קטן — one price in the question list sits outside an LTR span.** "2,200,000 ₪" renders with ₪ on the left, while every other amount in the course renders inside an LTR span.
  - Screenshot: `qa/components/DiyChecklist-phone-113-questions-list.png`.
- The narrow "הדפסה" and "איפוס" are in cross-component bug 2.

What works:
- The counter starts at "סימנתם 0 מתוך 64".
- A tick by mouse and a tick by Space bring it to 2, and the progress bar follows.
- A two-line note is typed.
- Steps open with Enter and close with Space.
- Storage holds `{"checked":["s1.b1","s1.b2"],"notes":{"s1":"…"}}`.
- **After a reload** both ticks, the note and the counter are back. Screenshot: `qa/components/DiyChecklist-phone-108-after-reload.png`.
- "תצוגה להדפסה" shows ☑/☐, the note and the "דוגמה לימודית" marking. Screenshot: `qa/components/DiyChecklist-phone-109-print-view.png`.
- "הדפסה" calls `window.print`. Under print media only this list is visible: not the other list, not the page header, not the controls. `afterprint` removes the marking class. The A4 PDF (8 pages) reads correctly. Files: `qa/components/DiyChecklist-desktop-118-print-media.png` and `qa/components/DiyChecklist-desktop-print.pdf`.
- "איפוס" asks for confirmation, then clears the ticks and the note. That holds after a reload.
- The two lists keep separate storage keys.
- No horizontal scroll, nothing below 12px, Tab reaches every control with a ring.

<!-- Browser QA by Claude, 2026-10-09: playwright-core 1.63 + Chromium 1194 against dist/, 390×844 and 1280×900. -->
