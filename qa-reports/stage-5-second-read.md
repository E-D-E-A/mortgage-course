# QA second read: stage 5 (lessons 5.1–5.10 and check 5), after the fix round

Date: 2026-10-16. Reviewer: second-round QA, reading as a learner who finished stages 0–4. I edited no source file; this is the only file I wrote. Scratch scripts and screenshots are in my scratchpad (`.../scratchpad/sr/`).

## What I did

- Read the three first-round reports, then all ten lesson MDX files, `src/pages/checks/5.mdx`, `stage-5.ts`, the ten `.he.vtt` files and AUTHORING, all against the CURRENT source. `dist/` (13:33) is newer than every MDX (11:15), every component (11:15) and every video (11:40), so it is current.
- Viewed all key frames of videos 5-1…5-10 (contact sheets of every `qa/video/5-*-t*.png`, zoomed on every suspect percent sign, minus sign and money sign).
- **Math:** I wrote my own plain-Python `Decimal` engine (statement rounding, linked tracks, resets, IRR). It reproduces the lesson figures to the agora (for example 5.1: 4,970.56 / 5,807.89 / 1,617,347.35 / 5.22%). With it I recomputed **179 numbers** from inputs and compared them with the facts: all 24 check-5 answers and their listed errors (r1–r4, q1–q20), 5.1 (document), 5.2 (nine uniform-basket cells), 5.3 (base, forecast B, November, 600,000, basket 2, fee), 5.5 (four effective rates), 5.6 (the whole seven-mix table with rises), 5.7 (levers, market, term, amount, ratio), 5.9 (all mix, basket, other-bank and 360-month figures, effective rates), 5.10 (combination, ratios, case A before and after). **Every one matches.** I also parsed 69 printed equalities in the built pages: all hold (7 flagged by the script were superscript/percent artefacts, not errors). One convention note: the stage-2 repeat (`c5.r2`, equal-principal total 695,812.82) holds only under the course's rule "the principal part is rounded to the agora and the last month pays the rest"; an exact-principal schedule gives 695,812.60. That is the stated convention, not an error.
- **Browser** (playwright-core, Chromium, my own static server on dist, 390px touch and 1280px): on each of 5-1…5-10, I typed the right answer into every NumericExercise and FillTable, picked the correct answer of every MatchTable, clicked every option of every ChoiceExercise, typed the first listed common wrong answer of every NumericExercise, and typed a wrong value in every FillTable and MatchTable. Results at both widths: **0 failures, 0 console or page errors, no horizontal page scroll.** Right answers are accepted everywhere, correct choice options show the green state and an "נכון" verdict, no wrong option says "נכון", and the first listed error note shows for every numeric exercise. Check 5 (24 questions): all-right gives 24/24 and "עברתם", all-wrong gives 0/24 and every listed numeric error note appears; no console errors. (My server has no range support, so `.mp4` requests aborted; I filtered those, they are not a site defect.)

## Verdict

**No blocker.** Both first-round blockers (5.3-1, 5.8-1/5.8-2 and 5.1-1) are truly fixed, as are almost all should-fix items. What is left is one learner-confusing naming conflict (S1), a few leftover wording and label items, and internal references still visible in a few places.

## First-round items: verified fixed in the current source

- 5.3-1 (blocker): exercise 5.3-3 now says 5.65% vs 5.20%, and the correct-answer note says A is 5.07% on the same forecast and "קפץ" to 5.65% on forecast B. Matches the facts.
- 5.1-1: the "no loan, no fee" claim is gone from `PreApprovalDoc`. 5.1-2 ("שלושה מקורות"), 5.1-3 ("10% או יותר", one question), 5.1-4, "3.10%", the labelled "ידע מהשטח" row, all fixed.
- 5.8-1 (blocker): the solution now says the gap *shrinks* from "25 שנה" vs "קבועה בלבד" (the fact `cmp.gap_stress`; I verified 50,769.46 against 304,727.51). 5.8-2: page and video cue now say "126.72 ₪ פחות" with no plus. 5.8-3 sentence rewritten, sale year labelled as a workshop assumption with a Sources row.
- Bidi/minus (X-1): the 5.7 video cues, 5.9 solution, 5.10 step 4 no longer carry a bare minus. Frames: "16.8%", "12.5%", "12.6825%", "−19.49 ₪", "−48.30 ₪" all render correctly. 5.9-8 fixed.
- Plural "נקודות אחוז" below one (X-2): grep over lessons, vtt and scenes finds none left; singular forms appear ("0.0332 נקודת אחוז", "0.36 נקודת אחוז").
- 5.9-1 `MixJudge`: words are now in `refNote`/`gapNote`; rendered at 390px as "6,700.00 ₪ תקרה", "38.29 ₪ נשאר מתחת לתקרה", "9.81 ₪ מעל התקרה". Fixed.
- 5.9-2: the "not a price comparison in the sense of 5.3" paragraph and `cannot` text are present. 5.9-3: the feminine plural is gone (Liron and Shachar replace Hila and Yuval in 5.9/5.10). 5.10-1, 5.10-3, 5.10-5, 5.6-1, 5.6-2, 5.7-1, 5.7-2 fixed.
- The letter T is gone (words "עמלות" in the box and a `<dl>`), 5.3-3/4/5/6/7 and the example labels fixed, 5.4-1/2/3 and the "מפקח" gloss fixed, 5.5-1 (term "ריבית חוזית" defined in the opening, with a definitions entry), 5.5-2 (assumption line before step 3), 5.5-3, 5.5-4 ("ארבע סיבות"), 5.5-6, 5.2-1/2/3 fixed.
- Components: `MixComplianceChecker` step is now 1,000, so task 4 reproduces (loan 1,640,000, variable 60.55%, room 100,333.33, payment 8,198.86, ratio 40.49%). `PreApprovalDoc` panel opens 4px under the tapped line. `MixBuilder` has a sticky summary on phones. `OfferCompare` stacks as cards at 390px with no overflow and no wrapped shekel sign.
- Subtitles and frames: no "Brain", "J-xxx", "DEC-n", "FK-H" or person names in any `.he.vtt`; the frame in 5.4 now reads "לפי תעתיק של הצוות"; the 5.6 card title no longer overflows. No "עובדה מאומתת" anywhere. FK-H-031, מק״מ and "prime = BoI + 1.5" remain labelled open or convention.

## New and remaining findings

### Blocker
None.

### Should-fix

**S1. The contract rate is "חוזית" in 5.5 and "נומינלית" in 5.9 (and the 5.9 video).**
- Where: 5.5 MDX 50 ("לא לבלבל עם ״נומינלית״ משיעור 0.8") and 137; 5.9 MDX 76–80 (yardstick labels "השוו ריבית נומינלית לממוצע"), 85, 238 (`<Term t="ריבית נומינלית" lesson="0.8">`), 287 ("ריבית בחוזה היא נומינלית"), the predictionOptions line 37, exercise 5.9-1 option 3; `5-9.he.vtt` cue 10 ("12% נומינלית הם 12.6825% אפקטיבית") and the frames "נומינלית 12%".
- How a learner is confused: in 5.5 they were told explicitly that the yearly contract rate is "חוזית" and that "נומינלית" is a different word (before inflation, 0.8). Four lessons-pages later the same quantity is called "נומינלית", with a popover from 0.8 that defines it as "before inflation" (the 0.8 definition does mention the other use in brackets). A careful learner will ask whether 5.9 changed the subject or whether 5.5 was wrong. AUTHORING itself calls contract rates "nominal annual", so the course needs one decision.
- Fix: in 5.9 (text, yardstick labels, exercise option, video cue and frame) use "חוזית" and write "(ריבית חוזית; בשיעור 0.8 קראנו לה גם נומינלית)" once; drop the 0.8 Term there.

**S2. 5.8 summary still says "ההצעות האמיתיות מגיעות בשלב 6"** (MDX 599). The callout (586) and the video cue were fixed to "הבנקים הבדויים של הקורס", but the last summary bullet was not. Same fix.

**S3. "מחויב/חייב להציע" persists against the open Eylon question (5.2, X-3).** 5.9 MDX 142 and 209 ("תמהילים שכל בנק חייב להציע"), 5.9 MDX 303 ("הוראה 451 מחייבת כל בנק להציע אותם"), and the map link label `stage-5.ts:270` ("מחייבת כל בנק להציע אותם"). 5.1 and 5.2 were softened ("שבנקים מציעים … לפי התעתיק"); these were missed.

**S4. 5.9 calls the basket "מדד השוואה הוגן" right after saying it is not a price comparison.** 5.9 MDX 303 ("והם מדד השוואה הוגן כי הם זהים בין בנקים") and the summary bullet 617 ("הסל הוא מדד הוגן, לא יעד"). The new paragraph at 305 is correct; these two sentences still contradict it and 5.3's four conditions. Say "נקודת ייחוס למבנה" in both.

**S5. Internal references still learner-visible.**
- `stage-5.ts` card notes (shown in the map popover): line 56 "העמוד הוא J-080", and the `three_goals` note "עמוד J-090 ב־Brain" (around line 208). Also `checks/5.mdx:343`: "תעתיק של הצוות ב־Brain" in the page text above the questions.
- Sources blocks (learner-visible): "עדן קיבל ב־2026-10-08" is still in 5.4:706, 5.6:555, 5.7:557, 5.8:618 (5.3 was changed to "הצוות קיבל"; make them the same). J-codes (J-050/060/070/080/090/100) remain in Sources of 5.1, 5.2, 5.6, 5.9, 5.10. AUTHORING sanctions "Brain (דף N …)" in Sources but not J-codes; decide one policy.
- Typos in Sources: 5.9:636 is garbled and duplicated ("דף מחקר של אילון, דף המחקר של אילון, 2026-10-08, 2026-10-08"); 5.9:634 and 5.10:590 end with a double period ("..").

**S6. 5-1 video cue 20 is ambiguous:** "אחרי החלון הבנק כבר לא חייב. אפשר לקבל יותר, לא פחות." A beginner can read "you can get a higher price". It means the window may be longer than the floor, never shorter. Say "בנק רשאי לתת יותר ימים, לא פחות".

### Nit

- 5.10 expected observation 4 (MDX 317) says the variable part is "993,000 ₪"; the checker shows the share (60.55%) and the room (100,333.33), not the amount. Either print the amount in the checker or say "60.55%".
- 5.10 `5-10.he.vtt` cue 7 prints "1,200,000.00 ₪" and "1,700,000.00 ₪"; every other cue writes whole amounts without ".00".
- 5.1 text says "24 יום"; the 5.1 video frames say "24 ימים". Both are valid Hebrew; pick one.
- Shekel sign side differs between components (₪ left of the number in plain text, e.g. 5-8 frame t145 label and `MixJudge` cells, right of it in `.ltr` spans elsewhere). Readable, inconsistent.
- 5.3 `MatchTable` row 5 prompt ends "מה ההבדל הראשוני?" (odd word; "מה ההבדל הראשון?").
- 5.6 MDX 94 "(… ובקבוצה שלנו זה נכון בחלקו …)" and 5.9 MDX 422 "והם קטנים;" read awkwardly. `stage-5.ts` `three_goals` role still says "ובדרך כלל יעד אחד עולה ביעד אחר".
- 5.1 video charts still start above zero with the 12px grey "הציר האנכי לא מתחיל באפס" (first-round nit not acted on).
- Typed numbers remain (5.7 table steps "164,000 ₪", hint "20250", 5.8-5 note "74.55%", 5.4 "3.2%"). Harmless inputs, but AUTHORING says facts.
- Exercises 5.10-3 and 5.10-7 ("בינוני"/"מאתגר") repeat the worked lines of the page with the same numbers; 5.6-6, 5.8-6, 5.2-6 are single subtractions with printed operands.
- 5.9 Sources and 5.1 body name a banker in full ("טובי זמיר"); 5.9 body already uses "בנקאי בשטח".
- Check 5 (q18, q19) still uses "הילה ויובל", while the lessons these test (5.9, 5.10) now use "לירון ושחר" (and 5.4 uses Hila with Oren). Not wrong, but a learner meets a different couple.
- 5.9 uses "קנה מידה" (yardstick) and 5.3 "מדד" (measure) for different things; fine, but the summary table could say so.

## Other requested checks

- **Term before use.** The new terms are introduced before use: "ריבית חוזית" (5.5 opening, with a definition entry), "בדיקת הבסיס" is now used from 5.2 only as a described check ("בודקים אם … ואת שמה נלמד בשיעור 5.3"). No later-lesson term appears without `<Later>`. No "בסיסי ריבית" or the letter p remains.
- **Claim labels.** Bank-behaviour sentences are labelled "לא ידוע / שאלה לאילון / ידע מהשטח" in 5.1–5.10. Remaining unlabeled-sounding spots: S3 (obligation to offer) only. FK-H-031, FK-H-032 (not printed in the body), the מק״מ row and prime = BoI + 1.5 are all still open and labelled.
- **Plural address.** Present throughout. Remaining "we" forms ("נבדיל", "חישבנו") are in 5.4 MDX 56, 5.5 opening; AUTHORING wants plural address to the learner, so these are nits.
- **Case A.** 5.6–5.8 and the 5.10 checker use only the map's numbers and the assumed mix; no bank offer anywhere; 40.4%, 8,181.30, 81.30, 333.33 and 100,333.33 agree across lessons, videos and check 5. Labelled "תיק א׳ (נועם ושירה)" in 5.10. No violation.
- **Map cards** (`stage-5.ts`): fixed — "הדרך הקלה ביותר להשוות" (uniform baskets), `comparison_basis` lists four conditions plus the 5.9 extras, `estimate` no longer says "אלגוריתם מחשב", `REGIONS` mentions stage 5, a 5.8 link exists. Open: S3 (link label), S5 (J-codes in notes), the generic "בדרך כלל" in `three_goals`.
- **Check 5 against the lessons.** Every question is answerable from its lesson (q7/q8 from 5.4's formula and exercise 6, q10 from 5.5, q14 from 5.7-7, q15/q16 from 5.8, q17 from 5.9, q20 from 5.10-7). Pairs go easy first. Wrong-answer notes are specific and sensible (each listed error is the genuine slip of the lesson). The check intro says it holds 24 questions: 4 repeated plus 20, which is what the page has.
- **Phone.** No page scrolls sideways at 390px on any of the ten lessons or the check. The three FillTables and the comparer fit; the wide reading tables still scroll with the layout hint, and the first-round list of tables that hide the discussed column was not changed (not re-measured here beyond the no-overflow test).

## Counts
0 blockers, 6 should-fix (S1–S6), about 13 nits. All 179 recomputed numbers and 69 printed equalities match; all exercises accept right answers and show their error notes at 390px and 1280px with no console errors.
