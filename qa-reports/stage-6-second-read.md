# Stage 6, second read (lessons 6.1–6.11 and check 6), after the fix round

Date: 2026-10-16. Reader: a beginner who finished stages 0–5. I edited no source. Scratch (my engine `eng.py`, verifiers `v1–v4.py`, Playwright scripts, contact sheets) is in my own scratchpad `/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/q2/`.

## Verdict

**0 blockers. 9 should-fix. 12 nits.** Every first-round blocker is fixed in the current source, built page, video and frames. Every first-round should-fix I re-read is fixed, except the ones listed below as "left over". The numbers are all right.

## What I checked

- **Numbers.** I wrote my own engine in plain Python `Decimal` (annuity, statement rounding, linked index, prime and reset shifts, bank-policy rules, business-day calendar). It reproduced the module's facts. About **290 values** matched to the agora, including:
  - case A: payment 8,181.30, ratio 40.40, totals, stress maximum 9,435.33, the 17,000 / 220,000 / 423,000 steps, closing the car loan (1,676,000, 76.18%, 8,360.88), half-half (8,068.47, 39.84%), term ±5 years, the 10-point mix move, and the plan (21,000 → 39.88%, 7,934.02, 2,856,248.78, relief gain 51,302.17, total gain 89,015.56);
  - the four offers (8,181.30 / 8,150.17 / 8,180.70 / 8,229.71) and the two counters (7,804.61, 3,107,086.13, 13,545.42; 8,261.28, 2,974,055.68, 9,266.10);
  - 6.7 steps and rounds (34,696.77; 11,599.42; 5,771.22; 23,494.13; 29,265.35);
  - the 6.9 files d1–d5, d2w and the four banks' decisions, the relief rules, and 6.10's prime effect (80.41);
  - 6.11's margins (39.96 / 40.04 / 40.28) and the cover case (37,000 → 39.89);
  - **every check-6 answer and every listed wrong answer**: r1–r3, q1–q20 (about 63 numeric checks, all pass).
- **Dates.** The four-clock dates of 6.6, 6.7, 6.10, 6.11 and the check (q11, q12) match my own calendar (Saturday never, Friday counts, 24/12 days, round 3 days, 7 left). All of these match: approvals 3, 5, 6, 9 Nov; validity to 27 and 29 Nov, 30 Nov and 3 Dec; rounds 12, 16, 19 and 23 Nov; latest start 17 Nov; the exercise answers 10 Dec, 8 days, 2 rounds, 17 Nov.
- **Wait lever = 9 payments, 17 left, exactly-18 open.** It is consistent across 6.1, 6.3, 6.4, 6.5, 6.9 (20 → 17), 6.10, 6.11, `WAIT_MONTHS = 9`, check q6 and q8, and 4.2. Car payoff is 36,000 and savings 40,000 everywhere. The one exception is the sentence in check q18 (S-1 below).
- **Equalities.** Every printed equality in the lessons was checked against its printed numbers.
- **Browser.** Chromium 1194, static server on my own port on `dist/`, 390 and 1280 px, all 11 lessons.
  - Every NumericExercise accepts the right answer. The first listed wrong answer shows its own note.
  - Every ChoiceExercise option was clicked, 0 mismatches. Every FillTable accepts the right values.
  - 0 console errors or warnings, 0 horizontal overflow.
  - Phone fixes re-tested at 390:
    - NegotiationLines: the rounds are now cards, there is no table and no scroller. The verdict is sticky at top 8px while the round sliders are at y 400, 594 and 767.
    - BankMixCompare: the verdict is sticky and sits 456px down after the goal is chosen.
    - PositioningCalculator: the status line is sticky and in view.
- **Frames.** I viewed every re-rendered frame as contact sheets (all 11 lessons, 199 frames) and zoomed where text was dense.
  - Shekel sign: on the correct side in 6.4 and 6.5, and in the 6.7 edge frames.
  - 6.6 date labels: dark text now.
  - The 6.1–6.3 illustration cue and frame mark are present.
  - 6.4–6.8 percent and minus signs are fine.
  - One bidi defect remains, in 6.2 (S-8).
- **Not re-tested:** the nits of `stage-6-components.md` (11px badge, 35px reset button, tab arrow keys), keyboard walks, video playback, the hosted site, and a browser run of the check-6 page itself (I recomputed its numbers in Python, not through the UI).

## First-round blockers: all fixed

| First round | Now |
|---|---|
| 6.1-1 exercise note said equity does not touch the ratio | Question is "numerator and denominator", note is correct (`6-1.mdx:278`) |
| 6.2-1 mirrored formula steps | Plain RTL prose (`6-2.mdx:240–246`) |
| 6.4-1 "saves 30,528.09 in interest" | 17,000 principal + 13,528.09 interest (`6-4.mdx:134, 335`) |
| 6.5-1 gift story argued by "no gain" | "The paper describes a source that is not the real one. The line holds whether or not there is gain" (`6-5.mdx:99`) |
| X-1 / B-1 wait 8 vs 9 | 9 everywhere (see above) |
| B-2 "waiting costs nothing" | "costs one risk: the rate may move, and not necessarily up" (`6-10.mdx:115`, cue 12) |
| B-3 "יקר ב־−19,610.50" | Reversed fact, now positive (`6-11.mdx:280`) |

## Should-fix (left over or new)

- **S-1. check 6, q18 settles the open "exactly 18" edge.** `src/pages/checks/6.mdx:305`: "הלוואה שנשארו בה 18 תשלומים או פחות לא יורדת מההכנסה". Everywhere else, exactly 18 is open (6.1:128, 6.3:130, 6.4:149, 4.2). The loan in q18 has 17 left, so the answer is not affected. Say "פחות מ־18 תשלומים", as q3 and q6 do.
- **S-2. "up to four banks" is still a *decision* in two places.**
  - `src/components/big-picture/stage-6.ts:149`: "Mogi עובדת עם עד ארבעה בנקים במקביל (החלטה, 2026-08-13)". 6.6, 4.11–4.13 and the factor cards say "model assumption, not a decision".
  - `src/pages/lessons/1-5.mdx:456` is a `החלטה של Mogi` source row with the same sentence, and `1-5.mdx:279` says "ב־Mogi — עד ארבעה" with no label. 1.10:285/288/823 are correct.
- **S-3. 6.4's LeverPrice note calls 30% and 35% "השערות מהשטח".** `src/pages/lessons/6-4.mdx:239`. 6.2 and the component (`positioning.ts`) now say "דוגמה של הקורס". Same fix as the first-round 6.2-2; this spot was missed.
- **S-4. Map cards still carry old labels** (`stage-6.ts`, shown on the course map):
  - `:51` positioning, note: "הדוגמה המספרית של סף היא דוגמה לימודית (ידע מהשטח…)". The 30–35% example is not field knowledge.
  - `:39` margin_step, note: "שיעור מימון ויחס החזר כגורמים למדרגה — ידע מהשטח (טובי זמיר)". Only financing bands (FK-H-004) are his; the ratio line is Eylon's 40% (FK-H-012).
  - `:65` lever, note: "תשעה מנופים, לפי ידע מהשטח". The nine levers are the course's list (6.3 labels it as calculation assumption and general knowledge).
  - `:77` close_loans, note: "ההלוואה הגדלה כבר מחוץ לתקרת שיעור המימון" is garbled. It should say that the grown loan crosses the ceiling.
  - `:319` link underwriting → misleading_info, "הבדיקה מחפשת פער בין מוצהר למאומת" states a bank check as fact. This is the same item as first-round 6.5-5; the node cards were softened, the link was not.
- **S-5. 6.10 tree still says "היא מרמה"** (`src/pages/lessons/6-10.mdx:61`: "היא לא מנוף, היא מרמה"). 6.5 and the lever map no longer use the legal word. Write "מידע לא נכון".
- **S-6. 6.3 still states a bank check unlabelled.** `6-3.mdx:120`: "הבנק בודק את התדפיס בחיתום". The map note (`:43`) has the FK-H-015 label; the body does not. Add "(ידע מהשטח, FK-H-015; ממתין לאישור אילון)".
- **S-7. A Brain page number in the learner's Sources.** `6-8.mdx:385`: "בדף מחקר של הצוות (67469313)". Remove the number (the first-round X-2 asked for this). The rest of the stage is clean: I found no "Brain", "בריף", "J-", "DEC-" or paths in 6.x body, Sources, props, subtitles or the stage-6 cards.
- **S-8. Video 6-2, last frame (`qa/video/6-2-t139.png`, source `video/6-2.html`): percent signs mirrored.** The line "50%, 40%: תעתיק הצוות, לא אומת. 35%, 30%: דוגמה של הקורס, לבדיקה" prints "%50," and "%35," (the sign on the wrong side) while "40%:" and "30%:" are right. Put each number in its own LTR run, as the other frames do.
- **S-9. 6.11 still gives the wrong reason for "in parallel".** `6-11.mdx:295`: "כי כל אישור נספר מהתאריך שלו… ולא מתאריך הפנייה" is true of both orders. The real reason (the last answer arrives 7 days later and leaves 14 days instead of 21) is at `:323`. Say it at `:295`.

## Nits

1. Names in learner text:
   - "טובי זמיר" is in the body of 6.1:82, 6.2:110/352/455 and 6.9:55, while 6.6–6.8 say "בנקאי בשטח". Stage 4 introduces him by name, so this is only inconsistent.
   - "עדן" appears in 6.6:115 and 6.6:456 as the author of a Mogi decision. 6.5:253 gives the date but no name. AUTHORING says "who and when".
2. `6-3.mdx:126` uses "חומה" before 6.4 defines it. `check:terms` passes, so this is not caught. Use `<Later>` or rephrase.
3. `6-6.mdx:58, 69, 75` use "שעון" before its definition at `:127`.
4. `6-10.mdx:329`: "״חותמים עכשיו״ עולה את ההשוואה" is garbled; write "מוותר על ההשוואה". `6-10.mdx:59`: "בעוד שנתיים" for 26 payments; write "בעוד יותר משנתיים".
5. `6-7.mdx:198`: a double colon in "…הטובה בכל בנק: אין הצעה כזו". `6-6.mdx:457` has a stray space before the full stop.
6. `stage-6.ts:189` competing_offer: "ובעלת תוקף" is not in 6.7's definition ("בכתב"). `stage-6.ts` negotiation note says "הצעה נגדית" where it means "בקשה לשפר", which clashes with 6.8's term.
7. Videos: 6.6 and 6.11 cues state the 24-day window and "ask each bank where its line is" with no "לפי תעתיק" or "אם מוכן לענות" mark (the lessons have it). 6.11 cue 3 says "הקווים של הבנקים נמוכים יותר", but only banks ב׳ and ג׳ are lower than 40.
8. `UnderwriterDay.vue:43`, `CaseAPlanner.vue:53` and `LeverPrice.vue:241` use `< 1` for the singular, so exactly 1 would read "1 נקודות אחוז". It cannot occur with today's values.
9. `qa/video/6-11-t134.png` is an orphan from an earlier render (15:49, the rest at 17:04). Its content matches the current video.
10. Check 6 q20: the three tracks are 493,000 / 493,000 / 494,000 (rounded to thousands), not equal thirds. The question says only "לפי המחירון", and the answer is derivable from the printed totals. Not a defect.
11. The facts' totals for the term route in 6.2 are payment × months (6.2:201 says so). 6.2-5's `extra` therefore differs by 0.90 ₪ from a full schedule. The exercise tolerance covers it.
12. 6.5:253 "החלטה של Mogi (2026-08-31)" has no decider named. The research note does not name one either; say so if the coordinator knows.

## Other reads

- **Claim labels.**
  - "עובדה מאומתת" appears nowhere in 6.x (text, props, subtitles, frames, components).
  - Invented banks and policies are stated as the exercise's own rules in every lesson, callout and frame.
  - 30%–35% appear only as "דוגמה של הקורס".
  - Field claims carry "ממתין לאישור אילון".
  - Legal consequences appear only as "חששות / לא אומת / שאלה לעורך הדין" (6.5, 6.10, 6.11, `stage-6.ts:122`).
  - The second-round residues are S-4, S-5 and S-6.
- **Case A across stages.** Case A against stage 5: 40.4%, 8,181.30, the initial mix, 5.6/5.8 references, and ages 31 and 30 with a child (5.8:103). All consistent. Offers in 6.7–6.11 are the same.
- **Plural address and gender.** Clean. "נקודת אחוז" is singular up to one and plural above in text, props and subtitles. The only "0 נקודות אחוז" is a zero in a component's initial state, which is correct.
- **Check 6 against the lessons.** The prompts carry their own invented rules, and every question is answerable from the lessons. The deliberate exceptions are the spreadsheet or calculator questions (q2, q13, q19), which the prompt says need one.
