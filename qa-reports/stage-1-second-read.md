# Stage 1, second read: lessons 1.1 to 1.10 and the stage-1 check

Date: 2026-10-09. Reviewer: second-round QA, reading as one beginner who finished stage 0, from 1.1 to the check in order. I edited no lesson, component, data or research file; this report is the only file I wrote.

**What I read:**
- the visible text of every built page (`dist/`, built at 15:37, after the last MDX change at 15:33);
- all ten MDX files and `src/pages/checks/1.mdx`;
- the subtitles `public/video/1-2.he.vtt` and `1-7.he.vtt` (as the page prints them), and the re-rendered 1.7 frames t088 and t106;
- `data/lessons/1-*.json` and `check-1.json`, recomputed by an independent script;
- the stage-1 glossary entries (`src/data/definitions/1-*.json`) and the map data `src/components/big-picture/stage-1.ts`;
- the phone screenshots (taken 15:38), cut into 900px strips (1.1, 1.2, 1.6, 1.9, 1.10 and the check in detail);
- `course/AUTHORING.md`, `course/course-map.md` (stage 1 and case A), `research/eylon-list.md`, the three first-round reports, and the stage-0 summaries.

**Math spot-check.** I recomputed every fact of kinds `ltv_*`, `difference`, `percent_of`, `share_percent` and `hh_disposable_income` in the ten lesson files and the check with plain `Decimal`. All match. By hand I also checked:
- 1.2: 74.55, 0.45, 1,650,000 − 1,640,000 = 10,000, 1,640,000 ÷ 75 × 100 = 2,186,666.67 (13,333.33 below the price), 712,500 / 287,500, 75.45, 345,000, 2,240,000;
- 1.4: 546,666.67 × 2 + 546,666.66, 66.67, 63.33 / 36.67;
- 1.9: 15,400, 13,050, 2,200 (half table), 20,250, 15,600;
- 1.10: 360,000, 1,690,000, 76.82, 24 − 11 = 13, and exercise 8 (10 Nov + 24 = 4 Dec; 24 Nov + 7 = 1 Dec; signing 2 Dec = day 22; 2 left);
- every date in 1.7 and 1.8 against the 2026 weekdays: 11 Oct is a Sunday; 16/18/19 Oct; 14 Oct + 24 = Sat 7 Nov; + 12 = Mon 26 Oct; 29 Oct + 90 = 27 Jan 2027; 2 Nov + 24 = Thu 26 Nov; 22 Oct → Wed 28 Oct; 9 Nov + 12 = Sat 21 Nov; 1 Sep → 15 Nov = 75; 16 Apr → Thu 23 Apr (Independence Day Wed 22 Apr); 17 Sep → Fri 25 Sep (23 Sep without the holidays); 1.8: 3 Nov = day 20, 12 Nov = day 29, 23 Oct + 12 = 4 Nov, 12/14/16 Oct + 24 = 5/7/9 Nov;
- the check: 5, 6.67, 11,248.64, 306,000, 300,000, 100,000, 70, 1,500,000, 70, 375,000, 20,250.

No displayed number is wrong. One date may be wrong for a reason outside the math (item T1 in part 4: the 2026 closed-day list).

**Phone direction.** The `<M>` equations render left to right (checked the 1.2 "950,000 × 75% = 712,500 ₪" and the 1.10 "1,690,000 ÷ 2,200,000 × 100 = 76.82" strips). The 1.1 spreadsheet formulas are now one per line. The 1.10 deal map is cards plus a two-column number list and fits 390px.

---
## 1. Verification of the first-round חוסם and חשוב items

I checked every חוסם and חשוב item in `stage-1-review-1.1-1.5.md`, `stage-1-review-1.6-1.10.md` and `stage-1-components.md` against the current page.

**Fixed and fine:**
- **1.1:** the phone spreadsheet formulas (now a list).
- **1.2:** the asterisks (no `<em>` left in any stage-1 page), the false "even slightly" claim (now 13,333.33 ₪), the third formula line (now in words), value against price (now an open question with both sides), the one-decimal rounding, the rounding instruction for percent answers.
- **1.3:** both rules marked in the body, indexation shown as an open question, the worked example's indexation conflict (steps 3, 4, 6).
- **1.4:** the case-A label, the inline field-knowledge marker, the rounding instruction.
- **1.5:** the tree path for land already owned, the full field-knowledge markers, "תקופה מוגבלת" in the lesson and the glossary.
- **1.6:** exercise 6 (two *types*, בינוני), the worked example's "הזו… הסדר משתנה".
- **1.7:** task 3 now sets the slider to 3 days and shows 14 → 26 Oct; exercise 6 moved to Independence Day; exercise 4 has the 24-day error; "הלוואה רגילה" replaced; case A's appraisal date is 29 Oct everywhere; the contract and the appraiser now have their own paragraphs.
- **1.8:** exercise 5 is a new case (23 Oct → 4 Nov); exercise 2's question and errors.
- **1.9:** "לחלק מהצעדים יש שעון… בעיקר".
- **1.10:** exercise 6 (now "הכי רחוק מיום המשכורת", with the 10th called risky too); the appraiser feedback; the deal map (cards, saved, printable); the difficulty order (a real מאתגר planning item); the reserve line under the numbers.
- **The cross-lesson items:** the 1.2 → 1.5 promise, the 50% row's two names, purpose against deal type, the contract, the appraiser's three positions, the reliability markers.
- **Components (checked in the source, not in a browser):** sliders are 44px tall (`main.css` 176); BigPictureMap scrolls the new node into view and re-observes the re-created map (`BigPictureMap.vue` 87–113); MatchTable writes "לא נכון" and sets `aria-invalid`; ProcessTimeline clamps `answeredAfter` (line 64) and now defaults to 3; BankCommitment's table has the "הבנק לא חייב" column; the 1.2 and 1.7 videos are in `dist/video/`.

**Not fixed, or fixed badly:**

### V1 · חשוב · 1.2: on a phone the ceilings table still hides the column the text quotes
- **Where:** "התקרה: כמה מותר לממן", the table (phone strip 1.2-03, 390px).
- **Problem:** the columns were reordered to התקרה · סוג העסקה · הון עצמי מינימלי · הלוואה מרבית, but the "סוג העסקה" cells are three lines long and take the width. The minimum-equity column shows only "‎.00 ₪" and a cut header ("דירה ב… : הון"). The next bullet quotes exactly that column ("250,000 ₪, 300,000 ₪ או 500,000 ₪"). ".00 ₪" reads like zero. The "גללו" hint is there, but AUTHORING asks for the quoted column early, and this one is still off screen.
- **Fix:** keep only the name in the type column ("דירה יחידה", "דירה חליפית", "דירה נוספת") and move the one-line descriptions under the table, or put the minimum-equity column second (right after התקרה) and drop the max-loan column, which the text never quotes.

### V2 · חשוב · the check: the 1.5 fix ("תקופה מוגבלת") did not reach the check
- **Where:** check question 13 (`c1.q10`), the explanation: "דירה חליפית — יש לכם דירה ותמכרו אותה בתוך תקופה שהבנק קובע."
- **Problem:** 1.5 now says "בתוך תקופה מוגבלת. מי קובע אותה וכמה זמן — לא נבדק מול כללי בנק ישראל (לא אומת)", and the glossary agrees. The graded explanation states the old, unchecked claim as fact.
- **Fix:** "דירה חליפית — יש לכם דירה ותמכרו אותה בתוך תקופה מוגבלת."

### V3 · חשוב · 1.6: the big-picture map and the map task still settle value against price
- **Where:**
  - 1.6, "מה הייתם אמורים לראות", item 1 (MDX 119): "השמאי מעריך את שווי הנכס, והבנק מודד מול השווי כמה להלוות."
  - The map node "שווי הנכס" (`stage-1.ts` 147): "הבנק מודד מולו כמה הוא מוכן להלוות (שיעור המימון)." and the link (line 180): "הבנק מודד מולו כמה להלוות".
- **Problem:** 1.2, 1.8, the glossary and `eylon-list.md` all present "price or value" as open. The first-round cross-lesson item 4 was fixed in 1.2, 1.5 and 1.8 but not here. The map is the course's long-lived object: it will show this sentence in every later stage.
- **Fix:** node: "הבנק בודק אותו לפני שהוא מלווה. אם שיעור המימון נמדד מולו או מול המחיר — שאלה פתוחה (שיעור 1.2)." Link: "הבנק בודק אותו". Task answer: "…והדוח הולך לבנק. השמאי מעריך את שווי הנכס בשביל הבנק."

### V4 · קטן · 1.4: the DEC-2 source badge still says "החלטה של Mogi"
- **Where:** 1.4 Sources, the item "לכל מסלול תקופה משלו; ״30 שנה לצד 12 שנה זה רגיל ונפוץ״".
- **Problem:** the body is now marked "(החלטה של Mogi על בסיס ידע מהשטח של אילון, 2026-08-03; ממתין לאישור אילון)", but the only badge is "החלטה של Mogi". The market claim ("רגיל ונפוץ") is field knowledge, and exercise 2 grades "אפשר, וזה נפוץ" on it.
- **Fix:** split it: one "ידע מהשטח" item for "רגיל ונפוץ" (אילון, 2026-08-03, ממתין לאישור אילון), one "החלטה של Mogi" item for the calculation rule.

### V5 · קטן · "the bank does not lend before an appraisal" is still universal
- **Where:** 1.6 MDX 69 ("הבנק לא מלווה לפני שהוא יודע כמה הדירה שווה"); 1.10 step 8 ("הבנק לא מלווה לפני זה"); the glossary "שמאות" ("הבנק לא מלווה על נכס לפני שיש לו שמאות שלו").
- **Problem:** the first round (1.10 item 2) noted that the team's notes say an internal refinance needs no appraisal, and a project-level report replaces it in a developer's project. The exercise feedback was fixed; the general sentence was not. The glossary's "שמאות **שלו**" also contradicts the third clock, which lets bank B use an appraisal made for bank A.
- **Fix:** glossary: "בקנייה, הבנק לא מלווה על נכס לפני שיש לו שמאות (שלו, או של בנק אחר בתנאים של שיעור 1.7). יש מקרים, כמו מחזור באותו בנק, שבהם לפי הצוות לא תמיד צריך." In 1.6 and 1.10 add "בקנייה".

---

## 2. Regressions the fixes introduced

### R1 · חשוב · 1.10: the new reserve paragraph offers a loan above the ceiling as a choice
- **Where:** 1.10, after exercise 1 (MDX 602): "…כלומר 76.82% — מעל התקרה של 75%. כאן נועם ושירה צריכים לבחור: כסף בצד, או שיעור מימון בתוך התקרה. אין בחירה נכונה אחת; נחזור אליה בשלב 6."
- **Problem:** 1.2 taught that the ceiling is a maximum ("התקרה היא מקסימום, לא הבטחה"): no bank may lend 1,690,000 ₪ on a 2,200,000 ₪ home with a 75% ceiling. "לבחור: כסף בצד, או שיעור מימון בתוך התקרה" presents an over-ceiling loan as one of two legitimate options. A do-it-yourself reader may plan on it. The deal map's row "הלוואה שצריך, אם משאירים את זה בצד" adds to the impression that this loan exists.
- **Fix:** "…מעל התקרה של 75%, ובנק לא ייתן הלוואה כזו. כדי להשאיר 50,000 ₪ בצד, נועם ושירה צריכים דירה זולה יותר או עוד הון עצמי; בלי אלה, הם יכולים להשאיר בצד לכל היותר 10,000 ₪ (המקום שנשאר להם בשיעור 1.2). איך מאזנים בין כסף בצד לשיעור המימון — בשלב 6." Rename the map row "הלוואה שהייתה נדרשת, אם משאירים את זה בצד".

### R2 · קטן · 1.10: the third appraiser position is labelled "שיעור 1.7", though 1.7 does not choose
- **Where:** 1.10 step 8 pitfall (MDX 429): "בשטח: מיד. הצוות: אחרי שהאישורים מגיעים… שיעור 1.7: אחרי שבוחרים בנק." Exercise 5 (MDX 721): "ובשיעור 1.7 השמאות באה אחרי שבוחרים בנק." The 1.10 Sources item: "(בשטח, הצוות, שיעור 1.7)".
- **Problem:** 1.7 lists the same three positions and ends "הקורס לא בוחר ביניהן". Calling the third one "שיעור 1.7" makes it read as the course's own answer, and sets it against the team's.
- **Fix:** "בסדר של 12 הצעדים (שיעור 1.7): אחרי שבוחרים בנק." Same in exercise 5 and in the Sources item.

### R3 · קטן · 1.10: the new exercise 8 breaks case A's timeline and repeats 1.7's arithmetic
- **Where:** 1.10, intro to the exercises (MDX 655): "כל תרגיל הוא רגע אחד מהתהליך של נועם ושירה"; exercise 8 (MDX 769): "אישור עקרוני הגיע ב־10 בנובמבר 2026…".
- **Problem:**
  - In 1.7 and 1.8, case A's approval came on 14 October and the signing was set for 5 November. Exercise 8 gives the same couple an approval on 10 November.
  - Exercise 8's answer, "24 − 22 = 2", is the same arithmetic and the same answer as 1.7's worked example step 5 ("24 − 22 = 2 ימים"). A learner who remembers "2" passes without planning.
- **Fix:** change the intro to "כל תרגיל הוא רגע אחד מתהליך כמו של נועם ושירה; התאריכים בתרגילים בדויים ושונים מהדוגמאות". In exercise 8 move the appraiser to 25 November (signing 3 December, day 23, 1 day left) or change the underwriting to 5 days, so the answer is not 2. Add the facts.

### R4 · קטן · 1.2: grammar in the new case-A sentence
- **Where:** 1.2, callout "תיק על הקצה" (MDX 286): "שווי נמוך מזה יעביר אותם את התקרה."
- **Fix:** "שווי נמוך מזה יעביר את שיעור המימון שלהם מעל התקרה."

### R5 · קטן · 1.3: two new sentences around indexation read oddly
- **Where:**
  - "מה הייתם אמורים לראות", item 3 (MDX 193): "אם תחליטו שהיא שאלה רביעית ונפרדת — גם זה תיאור שקיים, וההכרעה עוד פתוחה."
  - Worked example, step 3 (MDX 224): "…זז עם המדד (שיעור 0.8). לפחות בחלק מההלוואה."
- **Problem:** "אם תחליטו" puts the open question on the learner; the lesson says it waits for Eylon. "לפחות בחלק מההלוואה" is a fragment hanging after the parenthesis; the couple said nothing about part of the loan, and tracks are only taught in 1.4.
- **Fix:** "יש מקורות שמתארים אותה כשאלה רביעית ונפרדת; ההכרעה עוד פתוחה." Step 3: delete the fragment, and in step 6 (MDX 232) write "אחוז ריבית שלא זז" without "לפחות בחלק מההלוואה", or explain it with `<Later lesson="1.4">`.

### R6 · קטן · 1.10: "משכון זכויות" arrives with no explanation
- **Where:** 1.10, the short step list, step 12 (MDX 635), and the checklist step 12 (MDX 508): "(או משכון זכויות, כשהזכויות לא רשומות בטאבו)".
- **Problem:** added by the fix to first-round item 1.10-14. No lesson, no glossary entry and no source badge says what it is. A beginner meets a new legal term in the summary of the process.
- **Fix:** "(או, כשהזכויות לא רשומות בטאבו, רישום של הזכויות לטובת הבנק אצל רמ״י או החברה המשכנת — ״משכון זכויות״)", and add the J-170 source to that step.

---

## 3. Series consistency, end to end

### The open questions

| Question | Where it appears | Same, and open? |
|---|---|---|
| Value or price for the financing ratio | 1.2 (both sides, "השאלה נשלחה לאילון"), 1.5 (4.4), 1.8 ("שאלה פתוחה ברשימה לאילון"), 1.10 ex 1 ("וכאן השווי הוא המחיר"), glossary "שווי הנכס", check (every question says value = price) | Yes, **except 1.6 and the map** (V3). |
| Indexation: part of the interest mechanism, or a fourth question | 1.3 (callout, card feedback, sources), glossary "מנגנון ריבית" | Yes. The card sort grades indexation as "מנגנון ריבית", but the card's feedback and the lesson say this is the course's choice. The check does not grade it. Wording: R5. |
| Purchase contract | 1.6 (step 2), 1.7, 1.9, 1.10 (topic 1, step 1, the list) | Yes, everywhere "a parallel track; order not decided; on the Eylon list". Story slip: C1 below. |
| When to order the appraiser | 1.6, 1.7 (three positions, "הקורס לא בוחר"), 1.7 step-8 card, 1.10 step 8 and ex 5 | Yes; ex 5 grades only the trade-off, not a position. Label slip: R2. |
| Friday as a business day | 1.7 (text, toggle, video cue "שישי נספר, לפי הנחת הקורס", exercise intro and errors), 1.10 (not needed) | Yes, **except the glossary** (C2). |
| Day 0: the day the approval is given or received | 1.7 ("בצוות עוד פתוחה"), 1.8 five questions ("זו שאלה פתוחה (ראו שיעור 1.7)") | Yes. |

### C1 · קטן · case A: 1.6 says the contract is signed; 1.9 and 1.10 ask whether it is
- **Where:** 1.6 worked example, step 2: "נועם ושירה חותמים עם המוכר… בעסקה הזו החוזה נחתם לפני הפנייה לבנקים", and step 3 hires the advisor afterwards. 1.10, topic 1, "מה כבר ידוע": only "דירה יד שנייה ב־2,200,000 ₪…"; "מה שואלים": "כבר חתמתם על חוזה עם המוכר?".
- **Problem:** the reader followed case A from 1.6: the advisor's first meeting happens after the contract. The workshop lists the contract as unknown. The reader cannot tell whether 1.6 was a different version of the story.
- **Fix:** in 1.10 topic 1, "מה כבר ידוע": "לפי שיעור 1.6, החוזה עם המוכר כבר נחתם." Then the first question becomes "מה מועדי התשלום בחוזה, ומה יקרה אם האישור יתעכב?" Keep the "אם לא" branch in the generic step-1 checklist.

### C2 · קטן · the glossary settles Friday by leaving it out
- **Where:** glossary "יום עסקים בנקאי" (`1-7.json`): "כל יום חוץ משבת ומחגים מסוימים. חול המועד, למשל, הוא יום עסקים."
- **Problem:** read alone (it is the popover on every later use), it says Friday counts, with no hint that this is the course's assumption and on the Eylon list.
- **Fix:** add "שישי הוא ״יום קצר״ לפי ההגדרה שהועתקה, ובקורס נספר; אם ההוראה משתמשת בהגדרה הזו — עוד לא נבדק."

### The 12 steps and the three clocks
- The 12 titles are word for word the same in 1.7 (`steps`), the 1.7 video grid, the 1.10 short list and both `DiyChecklist` step titles. 1.8 places the approval at step 4 and disbursement at step 12, matching.
- The clocks are the same in 1.7 (text, timeline bars 3–4 / 4–11 / 8, video), 1.8, 1.10 (step 4 now "5 ימי עסקים (7 רק בסוגי הלוואות שהבנק הגדיר מראש; לא אומת)", steps 4 and 8) and check questions 17 and 19.

### Case A's numbers
- 2,200,000 / 560,000 / 1,640,000 / 74.55% / 0.45 points / 10,000 ₪ of loan room: 1.2, 1.4, 1.10, matching the course map.
- 13,333.33 ₪ of slack in the value: only in 1.2 (fine; nothing contradicts it).
- 21,700 and 20,250 ₪: 1.9 ex 2, 1.10 (the map, topic 4), check question 20.
- 360,000 ₪ available today: 1.9 ex 4, 1.10 map and topic 5.
- Dates: approval 14 Oct, offers 21 Oct, file 26 Oct, appraiser 29 Oct, signing 5 Nov in 1.7; 1.8 adds underwriting 3 Nov and a hypothetical delay to 12 Nov — consistent. Exercise 8 of 1.10 is the exception (R3).

### Deal-type naming
- "דירה יחידה / חליפית / נוספת" in 1.2 (table, PriceBar, summary, video), 1.5 (field, tree, card sort, glossary) and the check. 1.2 and 1.5 both say the directive and some forms call the third "דירה להשקעה". Purpose against deal type is consistent in 1.3, 1.4 and 1.5.
- The one slip is the check's explanation (V2).

### "בשיעור הבא" lines
All ten use the next lesson's exact title from the course map; 1.10 leads to `/checks/1/` in its summary and its footer.

### C3 · קטן · repeated example: the 1.8 prediction is asked three times
- **Where:** 1.8 prediction ("…מתברר שההכנסה שלכם נמוכה ממה שמסרתם. מה קורה?"); 1.8 exercise 4 (בינוני: "ביום 12 אחרי האישור, החיתום מוצא שההכנסה של אחד הלווים נמוכה ממה שנמסר"); 1.8 half table, situation 4; check question 18.
- **Problem:** exercise 4 is the prediction with a day number added, after the reveal printed the answer. As a בינוני item it inflates the difficulty.
- **Fix:** give exercise 4 a different twist, for example a gap found on day 23 together with a request to add 50,000 ₪ (two reasons, one answer), or relabel it קל.

### C4 · קטן · honest difficulty
- 1.10 exercise 4 (one subtraction, 24 − 11) is בינוני, while exercise 1 (a division with a calculator) is קל. Relabel 4 as קל.
- Otherwise the order is honest: 1.6 has no מאתגר, which is fine; 1.7, 1.9 and 1.10 end on a real multi-step item.

### The check against the lessons
- All 21 questions ask what the lessons now say. The clocks (questions 17, 19) use the 1.7 facts and say "לא אומת". The definitions of שעבוד, תמהיל, דירה נוספת, מחזור חיצוני and נזילות match the glossary.
- Nothing graded is open in the lessons: value = price is stated in every LTV question, indexation and Friday are not graded, the appraiser and the contract are not asked.
- Two slips: the explanation in V2, and the names (C5).

### C5 · קטן · the check reuses "דנה"
- **Where:** check question 13: "לדנה יש דירה, והיא קונה עוד דירה…".
- **Problem:** the first round renamed the other Danas so that 1.1's Dana (who lost her home) stays one person. The check brings back a Dana who owns a home and buys a second one.
- **Fix:** another name, for example "לרותם יש דירה…".

---

## 4. Reliability

**What holds:**
- Every official rule in the body is marked "לא אומת" with its source date, and the stage-wide "נכון ל־9 באוקטובר 2026" appears in 1.2, 1.5, 1.6, 1.7, 1.8, 1.10 and the check intro.
- Every field claim in the body names the speaker and the date and says "ממתין לאישור אילון" (1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10). FK-H-005's uncertain speaker is said in 1.2, 1.8 and the sources.
- No real bank names in visible text, subtitles, glossary or map data ("פועלים" matches only "אינם פועלים בשם הבנק"). Banks are "בנק א׳", "בנק אחד".
- The case label ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד…") is present wherever case A or C appears, and on the check.

### T1 · חשוב (to verify) · the 2026 closed-day list may be missing the Knesset election day
- **Where:** 1.7, `calendar.closed_2026` (3 Mar, 2 Apr, 8 Apr, 22 Apr, 22 May, 23 Jul, 13 Sep, 20 Sep, 21 Sep); exercise 3: "היועץ שלח בקשה… ביום חמישי, 22 באוקטובר… מה היום האחרון…?" (answer 28 October); the ProcessTimeline widget.
- **Problem:** by the Basic Law the Knesset elections fall on the third Tuesday of Cheshvan in the year the term ends, which in 2026 is Tuesday 27 October, unless they were brought forward. Election day is a statutory day of rest, and banks are closed. If the elections are on 27 October, exercise 3's count passes through a closed day and the answer is Thursday 29 October; the widget is also wrong for any request sent from 21 October to 26 October (from 19 October with the 7-day box).
- **Fix:** check the current election date. If it is 27 October 2026, add it to `calendar.closed_2026` (with a "לא אומת" source and a date), and regenerate 1.7's facts. If not, no change, but note in the 1.7 Sources that the table holds holidays only.

### T2 · קטן · two field claims still have no speaker
- **Where:** 1.7, "״משכנתא מהירה היא כ־21 יום״… הדובר לא מזוהה" (FK-H-079); 1.10 step 10, "בדפי הצוות כתוב שהפוליסה של הבנק היא בדרך כלל היקרה… דובר לא מזוהה" (FK-H-049).
- **Problem:** both are honestly marked, and FK-H-049 no longer decides a graded answer. But `eylon-list.md` lists both as "צריך ייחוס או מחיקה". Until someone does that, they are a publish blocker that lives only in a research file.
- **Fix:** attribute or delete before stage 1 ships, as the list says.

### T3 · קטן · 1.9 states an income rule that rests on a Mogi decision
- **Where:** 1.9, "ההכנסה": "עבודה נוכחית נחשבת. עבודה שנגמרה — לא." Its only source is "החלטה של Mogi… על בסיס ידע מהשטח של אילון".
- **Problem:** a decision about how Mogi computes is not evidence of how banks count income (the same point the first round made for the eligibility loan in 1.3).
- **Fix:** "כך Mogi מחשבת, לפי ידע מהשטח של אילון (ממתין לאישור אילון); איך הבנקים סופרים — בשלב 4."

### T4 · קטן · the file-opening fee is a fact in two places and a secondary source in a third
- **Where:** glossary "פתיחת תיק": "הבנק גובה על זה תשלום."; 1.7 step-7 card: "והבנק פותח תיק ומבקש תשלום על כך." 1.10 step 7: "לפי מקור משני, עד כ־360 ₪ (לא אומת)".
- **Fix:** glossary and card: "בדרך כלל הבנק גובה על זה תשלום (לא אומת; שיעור 1.10)".

### T5 · קטן · the Eylon list describes the old 1.2
- **Where:** `research/eylon-list.md`, "FK-H-005 — כששווי השמאי גבוה מהמחיר…": "הקורס (1.2) מלמד ״מול השווי״ לפי FK-H-005… צריך הכרעה, ואז לתקן את 1.2 ו־1.5."
- **Problem:** 1.2 now presents both sides as open. Eylon will read a description of a page that no longer exists, and the list does not mention that 1.6's map (V3) and 1.8 also depend on the answer.
- **Fix:** "הקורס מציג את השאלה כפתוחה (1.2, 1.8; וגם במפה של 1.6 אחרי התיקון). צריך הכרעה, כולל מה קורה כשהשווי גבוה מהמחיר."

### T6 · קטן · the case label is printed twice in 1.6, 1.7 and 1.8
- **Where:** the callout titled "דוגמה לימודית" whose body starts again "דוגמה לימודית — נתוני הלקוח…" (1.6, 1.7 and 1.8 worked examples).
- **Fix:** start the body at "נתוני הלקוח…", as 1.2, 1.4 and 1.5 do.

---

## 5. Other things a beginner would still stumble on

### O1 · קטן · Eylon is quoted twice before anyone says who he is
- **Where:** 1.1, "לפי אילון, בפועל בנקים לא ששים…"; 1.2, "כך תיאר אילון את הדירה הראשונה". He is first described in 1.4 ("איש המקצוע של הצוות").
- **Fix:** at 1.1's first use: "לפי אילון, יועץ המשכנתאות שמלווה את הצוות,".

### O2 · קטן · "כל זכות" appears with no introduction
- **Where:** 1.8, "ניסוח אחד, שתי קריאות": "באתר ״כל זכות״, כפי שהצוות ציטט אותו…"; also 1.10 badges "לפי כל־זכות".
- **Fix:** "באתר המידע הציבורי ״כל זכות״ (מקור משני)".

### O3 · קטן · 1.3 promises to teach indexation, which stage 0 already taught
- **Where:** 1.3 worked example, step 4: "(נלמד על הצמדה בשיעור 2.3.)".
- **Problem:** the reader learned "הצמדה" in 0.8 (its summary: "הצמדה = הסכום זז באותו אחוז שבו זז המדד"). The sentence makes them think they missed something.
- **Fix:** "(מסלולים צמודים למדד — בשיעור 2.3.)".

### O4 · קטן · case letters appear before they are named
- **Where:** 1.4: "נחזור לנועם ושירה מתיק א׳, שהכרנו בשיעור 1.2" — 1.2 never calls them "תיק א׳". 1.5: "עדי וירון מתיק ג׳" — there has been no case B.
- **Fix:** 1.2 worked-example heading: "נועם ושירה (תיק א׳): התיק שילווה אותנו". 1.5: "מתיק ג׳ (את תיק ב׳ נפגוש בשלב 4)".

### O5 · קטן · one checklist item still has no explanation
- **Where:** 1.10 step 7, the documents a bank publishes: "…ודיווח לרשויות המס על העסקה."
- **Problem:** first-round item 1.10-6 (קטן); ספח, מוטב and the first-payment item were explained, this one was not. The lesson says the lists bring "פרטים מעשיים חדשים".
- **Fix:** "…ודיווח לרשויות המס על העסקה (הצהרה שעורך הדין מגיש על הקנייה, לצורך מס רכישה)" — and mark it "לא אומת" if the team's notes do not say so.

---

## Totals

3 חשוב not fixed or fixed badly (V1–V3), 1 חשוב regression (R1), 1 חשוב to verify (T1). קטן: 22 (V4–V5, R2–R6, C1–C5, T2–T6, O1–O5).

## Verdict

Stage 1 is close to ready for a beginner, but not yet. The first round's work holds up: every number and date I recomputed is right, the 12 steps and the three clocks read the same from 1.7 to the check, case A's numbers agree everywhere, the deal-type names and "בשיעור הבא" lines are consistent, and the purchase contract, the appraiser's timing, indexation, Friday and day 0 are shown as open in the lessons and never graded in the check. Before a beginner gets it, four things must change, each small: the check's "תקופה שהבנק קובע" (V2); the 1.6 map task and the map data, which still settle value against price in the one object that follows the learner through the whole course (V3); the new 1.10 reserve paragraph, which presents a loan above the ceiling as a legitimate choice (R1); and the 1.2 ceilings table on a phone, which still shows ".00 ₪" where the text points (V1). Someone should also check whether 27 October 2026 is election day (T1), since it would move one graded date. The קטן items can follow in the next pass.
