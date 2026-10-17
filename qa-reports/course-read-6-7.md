# Whole-course read, stages 6 and 7 (QA, 2026-10-17)

Reader: a beginner who finished stages 0-5. Read in order and in full: lessons 6.1-6.11, 7.1-7.8, `checks/6.mdx`, `checks/7.mdx` (each MDX file, its Sources, hints, exercise feedback), all 19 `.he.vtt`, the components' own text where it reaches the learner (`FeeCalculator.vue`, `lever-map.ts`, `big-picture/stage-6.ts`, `stage-7.ts`), plus `AUTHORING.md`, `course-map.md` and the earlier stage-6/7 reports (closed findings not repeated; items still open from `stage-6-second-read.md` are marked "still open").

No source file was edited, no video rendered, no git. A scratch build (`astro build --outDir <scratchpad>/read67/dist`) was used for the phone check and for frame extraction from the existing mp4 files (ffmpeg read only). Scripts are in `/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/` (`numcheck1-4.py`, `phone.mjs`, `find72.mjs`, `tbl.mjs`, `choice.py`).

## Result in one paragraph

The mathematics is clean: 130 numeric statements recomputed in plain Python `Decimal` (no `src/` import), all agree with the pages and with every place a number repeats (case A in 6.1-6.11 and in stage 9, case C in 7.1-7.8). The problems are elsewhere: internal ids and "Brain" page numbers in learner text, three places that attach the red-line principle to the 2026-08-31 decision, leftovers of the old contract-rate wording (including the 7.2 video), a 3px horizontal overflow on 7.2 at 390px, answer-position and answer-length cues in the multiple-choice items, formulas that mirror in RTL prose, and a set of Hebrew slips. No wording implies a pass mark, a stage lock or "next stage opens". No banker name remains anywhere.

---

## Major

### M1. FK ids, "Brain" and Brain page numbers are shown to learners
Rule (5) broken in 12 lessons and in components. Everything below is learner-visible (prose, callouts, table cells, exercise feedback, `<Sources>`, calculator source strings).

- FK ids in MDX (non-comment lines): 6.1: 82, 418. 6.2: 44 (`calcSource`, shown under the calculator), 110, 118, 353, 509, 510. 6.3: 43, 120, 425, 426. 6.5: 216, 335, 568, 569. 6.6: 94, 103, 104, 105, 119, 196, 459. 6.7: 49, 55, 129, 202, 204, 221, 236, 313, 459, 460. 6.8: 77, 81, 82, 83, 85, 384, 385. 7.5: 47, 48, 50, 53, 125, 130, 140, 145, 150, 155 (a whole table column, "מי אמר, ומתי"), 381, 415, 453, 454.
- FK ids in components: `src/data/lever-map.ts` 86, 90, 101, 123, 134, 145 (6.3 lever cards); `big-picture/stage-5.ts` 58 (FK-H-031), 208 (FK-H-059): these cards are visible on the 6.1 and 7.1 maps.
- "Brain" / page numbers: 7.1: 479, 480 (דף 7798786). 7.2: 504, 505 (דפים 7798786 ו־67469313), 506. 7.3: 456, 457, 458. 7.4: 569 (דף 7733250, "מגרסה 22"), 570, 572 (דפים 5636146, 9895937), 574. `big-picture/stage-2.ts:62` ("ב־Brain") shows on the 6.1/7.1 maps.
- Other internal-document references: 6.6:91 and 6.6:455 "רישום פנימי של הצוות"; 7.3:458 "מסמך ההנחיות של הקורס לחלק 3"; 6.7:214 and 6.7:458 "עמדה שנלקחה במכוון... לא החלטה רשומה" (fine as a label, but the "הצוות כתב" chain refers to a document the learner cannot see).

Fix: delete the id and the page number, keep the person/role and date. Examples:
- `(ידע מהשטח, FK-H-004, מקור יחיד, ממתין לאישור אילון)` -> `(ידע מהשטח, מקור יחיד, ממתין לאישור אילון)`.
- `לפי תעתיק של הצוות ב־Brain (דף 7798786, נקרא ב־2.8.2026 ועודכן ב־17.8.2026), ממתין לבדיקה מול הצו` -> `לפי תעתיק של הצוות (נקרא ב־2.8.2026, עודכן ב־17.8.2026), ממתין לבדיקה מול הצו`.
- 7.3:458: drop `(אותו דף, ומסמך ההנחיות של הקורס לחלק 3)`.
- 7.5 table: keep "אילון, 2026-07-27" and remove the `<span>FK-...</span>`.
Enforcement: add to `scripts/check-terms.mjs` (or a new check) a failure on `/FK-H-\d+|Brain|דף \d{6,}|J-\d{3}/` in every non-comment line of `src/pages`, `src/data/*.ts` strings and `big-picture/*.ts` strings.

### M2. The 2026-08-31 "החלטה של Mogi" is attached to more than the document-vs-client rule
The decision is the contradiction rule only. 6.5 is correct (6.5:191 "הרביעית היא החלטה של Mogi", 6.5:253-260, 6.5:510, 6.5:535, 6.5:565). Three places stretch it:
- 6.10:593 (Sources, kind `החלטה של Mogi`, date 2026-08-31): `...(2026-08-31, לפי תיעוד של הצוות). הקו האדום: מיצוב בוחר בין נתונים אמיתיים ואינו מסתיר, מנפח או מגיש מסמך לא נכון.` Cut the second sentence from this item.
- 6.11:619 (kind `החלטה של Mogi`, date 2026-08-31): `מיצוב אינו בא על חשבון הלקוח, ונתון שסותר את מה שהלקוח אמר לא נשלח לבנק בלי לשאול אותו (2026-08-31). מודל שפה לא מחשב אף מספר: הוחלט ב־2026-07-29.` Three things in one item. Split into (a) `נתון שסותר את מה שהלקוח אמר לא נשלח לבנק בלי לשאול אותו (2026-08-31)`, (b) `מודל שפה לא מחשב אף מספר (2026-07-29)`, and drop "מיצוב אינו בא על חשבון הלקוח" or move it to a `מחקר / הצעה` item.
- 6.5:566 (kind `החלטה של Mogi`, no date): `הקו האדום של הקורס: מיצוב בוחר בין נתונים אמיתיים ... וכישלון גם של תיק שעובר את הבנק וחונק את המשפחה.` This is the course's own construction (6.5:191 says "ארבע הבדיקות הן בנייה של הקורס"). Change the kind to `מחקר / הצעה` with text `הקו האדום של הקורס הוא בנייה של הקורס, לא החלטה רשומה של Mogi`.
Related: `big-picture/stage-6.ts:18` (code comment) says "The red line is a decision of Mogi (Brain 33718276...)": the source of the drift; fix the comment too. 7.8:673 has the same two-decisions-in-one shape (second-degree mortgage 29.7 + LLM never computes 29.7): split.

### M3. Page 7.2 scrolls sideways on a phone (390px)
`scrollWidth` 393 vs 390; every other lesson and both check pages are 390. Cause: the formula box at `7-2.mdx:233` has an unbreakable line `P(q) = C1 ÷ (1 + q)1 + … + Cn ÷ (1 + q)n` (`whitespace-nowrap`, 356px, starts at x = -1 in a 358px box). Fix: split it as 7.3 does at `7-3.mdx:204-207` (`P(q) = C1 ÷ (1 + q)1` / `ps-8 + C2 ÷ (1 + q)2 + …` / `ps-8 + Cn ÷ (1 + q)n`), or add `overflow-x-auto` to the box.

### M4. Contract-rate wording: leftovers of the pre-2026-10-17 phrasing
Decision: "ריבית חוזית". Still say "ריבית החוזה / ריבית חוזה / הריבית בחוזה / הריבית שבחוזה" or the masculine "חוזי":
- Lessons: 7.2:133 (`כאילו היה ריבית חוזה`), 7.2:140, 7.2:244 (`בריבית m של החוזה`), 7.2:258 (`ריבית החוזה`), 7.2:307 (`בריבית החוזה`), 7.2:436 (`ריבית החוזה היא 4.80% חוזית`), 7.2:488; 7.4:117 (`הריבית שבחוזה`); 7.8:121 and 7.8:344 (`הריבית שבחוזה`). Masculine: 7.2:431 (`4.80% חוזי הם ... אפקטיבי`; its feedback right below says `חוזית`), 7.4:212, 7.4:362, 7.4:368, 7.8:121 (`5.90% חוזי הם ...`).
- Checks: `checks/7.mdx:198`, `:203`, `:324` (`הריבית בחוזה`).
- `FeeCalculator.vue`: 131 (`הריבית בחוזה (חוזית ...): חלקי 12`), 135, 145 (`בריבית של החוזה`), 153, 154 (`פחות החוזה`, `מהחוזה`), 214 and 215 (`הריבית בחוזה (חוזית, לשנה)`, aria-label `הריבית בחוזה`).
- `big-picture/stage-7.ts:88` (`וריבית החוזה חוזית`).
- Video 7.2: `video/7-2.html:95` and VTT line 89 (`ריבית החוזה והממוצע`), VTT 93 (`5.90% בחוזה הם 6.06% אפקטיבי`), `video/7-2.html:97` / VTT 97 (`מהחוזה מגיעים לחודשית ב־÷ 12`), frame text `7-2.html:236, 241, 252, 292` (`אפקטיבי מול חוזי`, `5.90% חוזי הם 6.06% אפקטיבי`, `חוזה ÷ 12`; confirmed on the rendered frame at 160s). The mp4 must be re-rendered after the text fix.
Suggested text: `מה קורה אם מחלקים את הממוצע ב־12, כאילו היה ריבית חוזית?`; `q₂ נמוכה מ־m, הריבית החוזית`; `בריבית החוזית: ...`; calculator label `ריבית חוזית (לשנה)` and step label `ריבית חוזית: חלקי 12`; `5.90% חוזית הם 6.06% אפקטיבית`.
Cross-stage note: stages 2-5 still say `אחוז הריבית שבחוזה` (2.4:80,84; 2.5:223; 3.10:186,244,383; 3.11:228; 5.3:353; 5.9:262,463). Not mine to fix, but the new term is now defined in 5.5 and 7.x depends on it.

### M5. Multiple-choice answer cues (position and length)
`ChoiceExercise` does not shuffle (only `StageCheck` does). In the 60 in-lesson items:
- The correct option is the first one in all of 6.1 (1,3,5,7), 6.2 (4,7), 6.3 (1,6,7), 6.9 (1,5,7), 6.10 (1,5,7), 6.11 (1,4,7), plus 7.2-4, 7.5-5, 7.6-1: 21 of 60 first, 18 of 18 in the six lessons named.
- The correct option is also the longest option in 49 of 60 (82%), and in 10 of 11 choice questions in each of check 6 and check 7 (the check shuffles order, but length gives it away). Examples: `7.4-7` third option (2 lines vs 1), `7.8-7` fourth option, `c7.q9`, `c7.q12`, `c7.q17`, `c6.q8`.
Fix: shuffle options in `ChoiceExercise.vue` with the same seeded shuffle as `StageCheck.vue:89-100`, and for the checks and for 6.x/7.x items rewrite one wrong option per item to be as long as the right one (a "good-sounding" distractor with the misconception inside it).

### M6. Video 6.6 states regulatory clocks as fact (still open from the second read)
VTT 6-6: `הקו המקווקו הוא שעון התשובה: 5 ימי עסקים, 7 לסוג מסוים.`, `הפס המלא הוא שעון התוקף: 24 יום מהאישור של אותו בנק.`, `בלי שעבוד חדש התוקף הוא 12 יום בלבד.`; the lesson (6.6:129-130) says `לפי תעתיק של הצוות; לא אומת`. Add one cue (or a clause) `אלה כללים לפי תעתיק של הצוות, לא אומתו` right after the 24-day cue in `video/6-6.html`, then re-render. The other stage-6/7 videos carry the label where needed (7.1, 7.2, 7.3, 7.4, 7.5, 7.7 do).

### M7. Formulas written inside RTL prose mirror
Confirmed by rendering the same strings in Chromium: `=PMT` shows as `PMT=` and `=NPER(ריבית חודשית; ...)` shows scrambled. Occurrences: `6-10.mdx:504` (prompt text: `(החישוב בגיליון: =PMT של הריבית החדשה פחות PMT של הריבית הנוכחית.)`), `6-10.mdx:431` (hint `=תאריך סיום − תאריך היום`), `7-4.mdx:513` (hint `=NPER(ריבית חודשית; -ההחזר; סכום ההלוואה)`). Fix 6.10:504: `(בגיליון: חשבו PMT בריבית החדשה ו־PMT בריבית הנוכחית, והפרש ביניהם.)`; 6.10:431: `בגיליון: תאריך הסיום פחות תאריך היום.`; 7.4:513: `בגיליון: הפונקציה NPER, עם הריבית החודשית (אחוז הריבית לשנה חלקי 12), ההחזר עם מינוס וסכום ההלוואה. עגלו כלפי מעלה למספר שלם.` (If a formula must show, use `<span class="ltr">` as 7.4:316 does; hints are plain strings, so word the hint instead.)

### M8. The plan's 21,000 appears in 6.9 and 6.10 before the margin that explains it
6.2, 6.3 and 6.4 all teach "17,000 is the step to 40%". 6.9:194, 6.9:204, 6.10:55, 6.10:274 and the 6.10 video use 21,000 with no reason; 6.11 (212) explains it (17,000 leaves 3.51 ₪ a month under the line, so the workshop adds a 0.1-point margin). A beginner stops at 6.9 asking "why 21,000?". Fix: in 6.9:204 add `(17,000 ₪ מגיעים לקו בקושי; ב־21,000 יש מרווח של עשירית נקודת אחוז, ועל כך בשיעור 6.11)`, and in 6.10:55/274 `21,000 ₪ (הצעד של שיעור 6.4 ועוד מרווח, שיעור 6.11)`. Stage 9 (9-2:108) already explains it.

---

## Minor

### Wording, labels, attribution
1. 6.3:126 `שם יש חומה` uses "חומה" before it is explained at 6.4:113 (still open). Fix: `ושם החלוקה חוצה מגבלה של ההוראה`.
2. 6.6:58, 6.6:59, 6.6:75 use "שעון" before its definition at 6.6:127 (still open). Add to 6.6:57: `(״שעון״ הוא ספירת זמן עם התחלה, אורך וסוף; בשיעור ארבעה כאלה)`.
3. 6.5:260 `"יעבור"`, 6.5:524-525 `'תמיד'`, 7.8:98 `"ההמלצה"`: straight quotes among ״״ elsewhere. Replace with ״ ״.
4. 6.4:545 and 6.5:571: `משמש בקורס כסף של דוגמה` -> `קו של דוגמה`.
5. 6.8:329 `זה ההכנסה של הבנק` -> `זו ההכנסה של הבנק`.
6. 6.7:239 `הבנק ב׳ זול מבנק א׳` -> `בנק ב׳ זול מבנק א׳`.
7. 6.10:59, 6.10:61 `בעוד שנתיים` for 26 payments -> `בעוד יותר משנתיים` (still open). 6.10:329 `״חותמים עכשיו״ עולה את ההשוואה` -> `״חותמים עכשיו״ מוותר על ההשוואה` (still open). 6.7:198 double colon (still open). 6.6:457 stray space before the period (still open).
8. 6.6:186 `ההלוואה בתמהיל: ראשונה בפריים, ...` -> `המסלול הראשון בתמהיל הוא פריים: ...`.
9. `checks/6.mdx:31`, `:318`, `6-10.mdx:159`: `בנק ישראל מורידה/מעלה ... שלה` (feminine for a masculine noun) -> `מוריד / מעלה ... שלו`.
10. 7.3:44 `איזה תאריכים` -> `אילו תאריכים`. 7.4:232 `הכסף נשאר חייב עוד כ־300 חודשים` -> `החוב נשאר עוד כ־300 חודשים`. 7.5:101 `ובכתוב ש״חלק טוב מהמחזורים״ הם כאלה` -> `ונכתב ש״חלק טוב מהמחזורים״ הם כאלה`.
11. 7.7:229 `כל המשכנתאות שלמדתם עד כה לווים משלמים כדי לקנות נכס` (missing words) -> `בכל המשכנתאות שלמדתם עד כה הלווים משלמים כדי לקנות נכס`. 7.7:144 `אילו התקרות האלה נכונות, וקוראים את התקרה השנייה...` -> `אם התקרות האלה נכונות, ואם קוראים את התקרה השנייה כסך ההלוואה בסוף ...`.
12. "אילו" used as "if" in about 30 places (7.7:108, 141, 144, 199, 218, 221, 289, 301, 325, 341, 364, 406, 442, 460; 7.5:100; 6.x several) reads to a beginner as "which ones". Replace the hypothetical by `אם`.
13. `checks/7.mdx:198, 200` `שתיהן נמוכות ... בנק ב׳ וג׳ גבוהות ממנה` -> `שתי ההצעות נמוכות ...` / `ההצעות של בנק ב׳ וג׳ גבוהות ממנה`.
14. 7.3-7 (`7-3.mdx:422`) asks `מה לא נכון?` over options starting `החבר צודק`; ask `מה נכון?`.
15. Date style differs: ISO `2026-08-05` in 6.x prose, `27.7.2026` in 7.6/7.7, `2.8.2026` in 7.1-7.4. One style (`5 באוגוסט 2026`) across the stage.
16. Evidence wording: `לפי תיעוד הצוות` (6.2:102, 344, 347; 6.4:66, 545, 571) vs `לפי תעתיק של הצוות` everywhere else. Keep `תיעוד` only if it truly means something different (the unidentified directive), and say so once.
17. "we" forms: the course voice is `הקורס`, but `אנחנו/שלנו/הקריאה שלנו` appear about 160 times in the stage (heaviest: 7.5, 7.2, 7.4, 6.7, 6.8). `הקריאה שלנו` is also a label not in the AUTHORING vocabulary (7.2:153, 186, 259, 465; 7.3:142, 159, 460; 7.4:127, 269, 573; 7.7:128, 144, 329, 460; 7.8:275, 650). Suggest `קריאה של הקורס` and source kind `הנחת חישוב`; `אנחנו מציגים` at 6.7:273 -> `היועץ מציג`.
18. `בדיקה`/label variants: `ממתין לאישור` without `אילון` (7.8:59, 7.8:61, VTT 7-7); `LeverMap` basis kinds `חישוב` and `לא ידוע` (`lever-map.ts:123, 134`) are not in the `<Sources>` vocabulary.
19. The phrase `שאלה לאילון / שרשומה לאילון / שאלות פתוחות לאילון` (an internal to-do) in learner text: 6.4:149, 6.5:92, 6.5:222 area, 6.6:182, 6.7:61, 6.7:130, 6.7:223, 6.9:249, 6.9:462, 6.10:339, 6.11:281, 7.5 table/summary, 7.6:42, 7.6:595, 7.7:545. Suggest `שאלה פתוחה, שהצוות מברר`.
20. A Mogi decision is credited to a person in 6.6:115 and 6.6:456 (`עדן, 2026-08-13`) but the 2026-08-31 decision in 6.5 names nobody. One policy (AUTHORING: "who and when") for both.
21. 6.9:91 says the max-payment formula is from 4.4; 6.2:244 says 4.5. Pick one (4.4 teaches it).
22. 6.11:180 `המנופים הם של שיעור 6.4, ושמונה מהם בטבלה`: 6.4 has seven levers (6.4:182); the table has eight rows (the extra is the 17,000 step). Write `שבעה מנופים, בשמונה שורות (הצעד הקטן ביותר והצעד עם מרווח)`. 6.4:233 says `שישה מנופים` for the calculator; say why one fewer.
23. 6.7:165, 185, 431 and VTT 6-7 `בסך הכול, אלפים`: on all tracks the saving is 34,696.77 (tens of thousands). `בסך הכול, אלפי שקלים (על כל המסלולים: עשרות אלפים)`.
24. 7.8:386 repeats the same sentence twice (`ביחד הן מפת הנושאים ... זו מפת הנושאים ...`); delete the last sentence. 7.8:344: sentence with three nested parentheses; split in two.
25. Term-before-use beyond `check:terms`: `דסק` (7.5:50, 143, 454) is never explained -> `דסק (המחלקה בבנק שמטפלת במחזורים)`. 7.2:176 `הלוואה משלימה לצד הלוואה מסובסדת` uses two undefined phrases.
26. 7.1:44-45 and 7.2:46: `Term lesson="..."` attributes are the current lesson for earlier terms (harmless: the popover still says "הוסבר בשיעור 0.6"); no change needed.

### Exercises
27. Level order ("easy to hard"): 6.6-6 is labelled `קל` but sits after three `בינוני`; 6.7-7 is `בינוני` after `מאתגר`. Reorder or relabel.
28. 6.7-1 etc. all fine on units: every NumericExercise has the right `unit` (checked all 63).
29. `checks/6.mdx:343-344` say `ואפשר לנסות שוב` twice; one is enough. (`אין ציון עובר, ושום שלב לא ננעל` is a denial, not a violation: no pass/lock wording anywhere. `StageCheck.vue` only says `הציון האחרון... נשמר`.)

### Phone (390px)
Scratch build, Chromium 390x844, touch, all 19 lessons and both checks:
- No horizontal scroll except 7.2 (M3). Wide tables (544px) are inside `overflow-x-auto` boxes in 6.2, 6.3, 7.5, 7.7 (x2), 7.8 (x4): they scroll, with the layout's hint; the key column (`ההצעה`, `הקו`) is the right-most, so it is visible first.
- `6.9` policy table (`6-9.mdx:102-126`) and 6.11 table (`:142-166`) fit but wrap `בנק א׳` onto two lines and break `0.10 נקודת אחוז` onto four. Add `whitespace-nowrap` to the bank-name `td`, and move `נקודת אחוז` to the header.
- Tap targets under 44px, present on every lesson: the two `<summary>` rows (`מה הייתם אמורים לראות` and `התסריט המלא`) are 20px high (padding sits on the `<details>`, not the summary: add `py-3` or `min-h-11` on `summary`); inline `Term` buttons are 25-29px high (inline text, acceptable by the WCAG inline exception); 20px checkboxes in `FourClocks` (6.6), the 6.11 planner and 7.2/7.8 calculators are inside larger labels (fine).
- Mobile alternates for the 6.4 and 7.4 tables (`hidden sm:block` plus a list) work.

### Videos (8 frames spot-checked from the current mp4 files, plus all 19 VTT)
Frames viewed: 6-1@40s, 6-5@80s, 6-6@120s, 6-9@100s, 7-2@160s (and 168s), 7-3@110s, 7-4@100s, 7-8@150s. Numbers and direction are right (72.27% / 39.17%; 37.7% vs 40.4% gap 2.70; 9.11 and 23.11 on the 6.6 timeline; 1,243,585 vs 1,204,301 bars in proportion; the 7.3 notice window 18.6-23.7 matches the axis ticks). The numbers in every VTT equal the page's facts (generated from the same fact files).
- 7.2 frame at 160s: `5.90% חוזי הם 6.06% אפקטיבי` and row label `בחוזה` (M4).
- 6.9 at 100s: card fills only the right half of the 1280px frame, the left half is empty for the whole cue; 7.4 at 100s: title only, empty body for the 8-second cue (93-101s: `תיק ג׳ ...`). Add the loan summary card or shorten the cue.
- VTT 6-6 unlabelled clocks (M6).
- No Mogi decision, FK id or name appears in any VTT or checked frame.

### What was checked and is clean
- Banker name: no occurrence of `טובי זמיר` (or any name for the external banker) in lessons, checks, definitions, components, data, VTT, `video/*.html`, or the built HTML. Every instance is `בנקאי בשטח` (6.1, 6.2, 6.6-6.9, 7.5, factor/lever data). Command: `grep -rn "טובי זמיר\|זמיר" src scripts video public data`.
- Stage lock / pass mark: no wording implying either. `checks/6.mdx:343`, `checks/7.mdx:335` explicitly deny both; `StageCheck.vue`, `CheckLayout.astro`, `LessonLayout.astro` have no pass/lock text; "(בכתיבה)" appears only for unbuilt lessons.
- Source kinds in 6.x/7.x are only the allowed set (no `עובדה מאומתת`); 48 `לא אומת`, 32 `הנחת חישוב`, 23 `ידע מהשטח`, 19 `בדיקת חישוב`, 11 `מחקר / הצעה`, 8 `החלטה של Mogi`, 6+4 general knowledge.
- `נקודת/נקודות אחוז` agreement: every `{value} נקודת|נקודות אחוז` checked against its fact value, 0 mismatches.
- "בשיעור הבא" lines use the map's exact next-lesson titles (all 19).
- Case A against stage 9: 21,000 plan, 1,619,000 loan, 8,181.30, 40.4% agree in 9-1 and 9-2 and 6.11.

---

## Numeric verification (item 3): 130 statements, 0 disagreements

Independent Python `Decimal` (no import from `src/`; annuity with the statement convention: interest rounded to the agora each month; IRR by bisection; PV by closed form). Case A: price 2,200,000, equity 560,000, loan 1,640,000, nets 12,400 + 9,300, car 1,450 x 26, mix 546,000/4.60, 547,000/4.10, 547,000/4.40, 360 months.

- 6.1 (9): LTV 74.55, room 10,000, car sum 37,700, closed loan 1,676,000, LTV 76.18, equity back 26,000, initial payment 8,181.30, ratio 40.4, closed ratio 38.53.
- 6.2 (8): smallest 1,000-step to 40/35/30% = 17,000 / 220,000 / 423,000; ratios 39.98 / 34.98 / 29.98; 16,000 still 40.01; 60% LTV equity 320,000; "each 5 points costs the same" (203,000 and 203,000, exact).
- 6.3, 6.4 (19): totals 2,945,264.34; 2,914,736.25 (equity lever); saving 30,528.09 and interest part 13,528.09; car-from-savings ratio 37.70; extra borrower ratio 33.74; car-from-equity total 3,009,920.07 and extra 64,655.73; point prices 40,476.19 and 13,333.33; variable limit 1,093,333.33.
- 6.5 (8): 37.7 / gap 2.70 / point price 13,333.33; Hadas-and-Itai 13,200, 800, 8,000.
- 6.6, 6.7, 6.8 (12): prime +0.25 = +82.16 and -0.25 = -80.99; bank A/B totals 2,945,264.34 / 2,934,061.70, gap 11,202.64 and 31.13 a month; one 0.10 step on all tracks 34,696.77 and 96.39 a month; counter-offer baseline 8,150.17 / 40.25 / 2,934,061.70. Round and validity dates (9.11 today; answers 12.11, 16.11, 19.11; fourth round 23.11 does not fit; B no-lien window ends 17.11; D ends 3.12) recomputed on the calendar.
- 6.9, 6.10, 6.11 (19): plan loan 1,619,000 ratio 39.88 and 7,934.02 first payment with the 0.15 relief; total 2,856,248.78; list total 2,907,550.95; saving 89,015.56 = 37,713.39 (smaller loan) + 51,302.17 (relief); room 23.46 (and 3.51 at 17,000); bank B 39.73 / 2,896,494.67; bank C wait variant 37.22 / 2,839,033.60; relief on the full loan 51,966.24; each equal across 6.9, 6.10, 6.11, 9.2.
- 7.1, 7.2, 7.3 (23): case C payment 4,974.72, balance 637,956.74, monthly rates 0.4917 / 0.3933 / 0.4146, PVs 694,721.98 / 681,839.54, formula 1 = 56,765.24, formula 2 = 12,882.44, after 20% = 10,305.95, total 10,365.95, "formula 1 only" 45,472.19 (x4.39), mistake case 51,505.19; 0.1% = 637.96; index fee 625; one-year example 104,761.90 / 98,214.29; the 2 June / 2 July 2028 totals 8,722.57 / 7,575.34 and the 1,147.23 step.
- 7.4, 7.5 (22): financed 648,322.69; benchmark 0.4728 monthly = 5.82% effective; bank B 4,808.23, total 976,070.69, saving 31,397.05, rate with costs 5.38; bank C 3,865.96 and +152,319.24 (and the "naive" 225,078.28); bank D 4,059.07 and +210,255.70; NPER 193 and 209 months; cash break-even 15; 7.5 equals 7.4 for the external bank and 32,897.05 for the internal at equal rate.
- 7.6, 7.7, 7.8 (20): 70% x 2,400,000 = 1,680,000, equity 720,000, spare 580,000; 60% joint LTV, room 300,000; self-build 1,600,000; top-up loan 798,322.69, first payment 5,920.69, extra 1,112.46 and 225,830.07; ratio 37.00 (and 39.21 with the separate loan); separate loan 1,298.43 / 233,717.14; 39,284.12 = 31,397.05 + 7,887.07; LTV 42.02, room 151,677.31.

## Cross-stage dependencies noticed

1. 7.x depends on `ריבית חוזית` being defined in 5.5; stages 2-5 still use `אחוז הריבית שבחוזה` and `ריבית בחוזה` (list in M4). A learner moving 5 -> 7 meets the new term with no bridge sentence in 7.2 except 7.2:111.
2. 6.6 (and 6.7, 6.10, 6.11) lean on 4.2's open question "exactly 18 months left"; they avoid it consistently (9 months wait -> 17 left). Any change to the 4.2 answer changes 6.3, 6.4, 6.6-6.11 and stage 9.
3. 6.9/6.11 use bank A's 40% "relief line" which coincides with the capital threshold of 4.5; 4.5 says the directive carrying that threshold is unidentified (329 or 203). 6.1, 6.2, 6.8 repeat that doubt; 7.8:352 treats 329 as the source without it. Keep one wording.
4. The stage-7 big-picture map and the 6.1 map carry text from stages 2 and 5 (`stage-2.ts:62`, `stage-5.ts:58, 208`) with `Brain` and FK ids (M1).
5. Videos 6.6 and 7.2 must be re-rendered after the text fixes above; the VTT is generated from `video/<id>.html`.
6. 6.11 and 9.2 share the 21,000 plan; if 6.9/6.10 are reworded (M8), 9.2:108 needs no change.
7. 4.3 owns `כלל אותו נכס`; 7.4:269, 7.6, 7.8:373-376 reuse it with "from 1.10.2026" and "more than 18 months". Consistent today.
8. `lever-map.ts` and `factor-cards.ts` hold FK ids and the `חישוב / לא ידוע` kinds; they are consumed by 6.3 and the stage-8 cards.
