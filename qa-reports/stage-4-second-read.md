# Stage 4, second read: lessons 4.1 to 4.15 and the stage-4 check

Date: 2026-10-16. Reviewer: second-round QA, reading as one beginner who finished stages 0–3, from 4.1 to the check in order. I edited no lesson, component, data or research file and used no git; this report is the only file I wrote. It was written in parts, one lesson at a time.

**What I read:**
- the visible text of every built page (`dist/lessons/4-*/`, `dist/checks/4/`, all built 2026-10-16 08:02, after the last MDX change at 07:58 and the data rebuild at 08:02; I started reading after 08:05, when the phone screenshots of the same build were written and no build process was running);
- the fifteen MDX files and `src/pages/checks/4.mdx`, including every exercise `errors` list, FillTable config and component prop;
- `data/lessons/4-*.json` and `check-4.json`, with an independent recomputation in Python `Decimal` (my own code in my scratch folder; nothing imported from `src/` or `checks/`);
- the subtitles `public/video/4-*.he.vtt` and key frames `qa/video/4-*-t*.png`;
- `src/data/factor-cards.ts`, `src/data/bank-questionnaires.ts`, `src/components/big-picture/stage-4.ts` and `stage-4-market.ts`;
- the phone screenshots `qa/screens/phone_lessons_4-*_.png` and `phone_checks_4_.png` (08:05), cut into strips;
- `course/AUTHORING.md`, `course/stage-4-brief.md`, `research/eylon-list.md` (stage 4), `research/source-map.md` section 3, and the four first-round reports (`stage-4-review-4.1-4.5.md`, `stage-4-review-4.6-4.10.md`, `stage-4-review-4.11-4.15.md`, `stage-4-components.md`).

**File dates matter for the verification.** The first-round reports were written 2026-10-12 11:41–11:57. Lessons 4.1, 4.2, 4.5 and 4.13 were last changed 2026-10-12 12:01–12:04 (twenty minutes later); the other eleven lessons, the check, the cards and `stage-4.ts` on 2026-10-16 06:59–07:58. The videos of 4.1, 4.2, 4.3 and 4.13 were rendered 2026-10-12 10:11–10:50, **before** the first-round reports, and never again, so no video fix asked for in those four lessons can be in them; the other eleven were re-rendered 2026-10-16 07:09–07:48.

**How the report is laid out.** Part A goes lesson by lesson: each section opens with the verification of the first-round must-fix and should-fix items (fixed, or not, with the quote) and the numbers I recomputed, then lists what is new or left. Part B is series consistency, Part C labels and invention across the stage, Part D the phone; the count, the list of first-round items not fixed, and the verdict close it.

Severity: **must fix** (a beginner learns something false or unsourced, or cannot go on), **should fix** (a beginner is likely to be confused or misled; fix before release), **nit** (polish). Quotes are from the built page unless an MDX line is given.

---

## Part A: lesson by lesson

### 4.1 — הכנסה מוכרת

**Verification.** The must-fix 4.1-1 is fixed: "בתיק של אבי ההכנסה המוכרת נמוכה מההצהרה, והפער הוא חלק מהתיק. כמה זה נפוץ אצל עצמאים — לא ידוע לנו; שאלה פתוחה לאילון." Of the should-fix items, 4.1-2 is fixed on the page (the gloss in the prediction, and "בשומה רואים את ההכנסה השנתית ואת המס שחושב עליה, וההכנסה נטו היא ההפרש ביניהם"), 4.1-3 is fixed ("המפרט הפנימי של Mogi (שעוד לא אושר) מסמן… איך בנק סופר בונוס — שאלה פתוחה לאילון"; "בקורס: חודשים רגילים בלבד"), 4.1-4 is fixed on the page ("ניקח כאן את הנמוך מבין השניים, הממוצע — זו הנחת חישוב של הקורס, ובנק אחר אולי יחשב אחרת"), 4.1-5 is fixed ("החלטה של צוות Mogi, 2026-08-31", with its own source item), and 4.1-6 is fixed (the payslip table is four columns, "הכנסות אחרות" is a list of blocks). X-1 is fixed here: "שימו לב למיכל: נשארו להלוואה שלה 10 תשלומים בלבד… הנימוק של הספירה הכפולה לא חל עליה", and the worked example writes its basis ("נשתמש בשכר נטו, כמו במפרט הפנימי של Mogi; זו לא הכרעה"). X-2 is fixed: no Brain page number or person name of the build team is in the body; they are in Sources only. The nits 4.1-7 (the three statuses are now given to Michal and Avi), 4.1-8, 4.1-9 (`round.*` facts), 4.1-10 (item 3) and 4.1-13 (the payslip and the assessment now have a "ידע כלכלי כללי" source; the unused FK-H-034 is gone) are fixed.

**Not fixed: the video.** `public/video/4-1.*` was rendered 2026-10-12 10:11, before the first-round report, and was not rendered again. So the video halves of 4.1-2 (no frame defines "שומה" before cue 10 uses it) and 4.1-4 (cue 19 still says "החישוב ממשיך מהמספר הנמוך." with no label) are open, and the nit 4.1-12 (cue 5 "מס ופנסיה") too. See 4.1-a.

**Recomputed** (Decimal): the payslips 10,650 / 10,700 / 10,750 − 2,500 = 8,150 / 8,200 / 8,250, − 450 = 7,700 / 7,750 / 7,800; averages 8,200 and 7,750 (24,600 ÷ 3; 23,250 ÷ 3); Avi 96,000 ÷ 12 = 8,000, 180,000 ÷ 24 = 7,500, gaps 3,500 and 3,000; household 19,200 / 15,700 / 16,200 / 15,250; the rounding callout 24,001 ÷ 3 = 8,000.33; the half table 7,650 / 7,750 / 7,850, average 7,750; exercises 9,000 (errors 12,000 / 8,500 / 3,000), 1,300 (14,700 / 5,500), 9,350 (28,050 / 9,450), 8,500 (10,833.33 / 2,333.33), 1,000 (2,000 / 24,000). All hold on the printed numbers.

#### 4.1-a · should fix · the video still states the course's choice without its label (first-round 4.1-2 and 4.1-4, video half)
- **Where:** `public/video/4-1.he.vtt` cue 19, "החישוב ממשיך מהמספר הנמוך."; cue 10 "אבי, עצמאי: אין תלוש, יש שומה." with no gloss of "שומה" on screen; cue 5 "ניכויי חובה: 2,500 ₪ — מס ופנסיה." (the frame lists four deductions).
- **Problem:** the page now calls the lower figure "הנחת חישוב של הקורס, ובנק אחר אולי יחשב אחרת"; the video, which many learners watch first, states it as the rule.
- **Fix:** in `video/4-1.html`, cue 19 "בקורס: ממשיכים מהנמוך. בנק אחר — אולי אחרת."; cue 10 "שומה: החישוב השנתי של הכנסה ומס."; cue 5 "ניכויי חובה: 2,500 ₪ — מס, ביטוח ופנסיה."; render again.

#### 4.1-b · nit · a `<Later>` note repeats the sentence it sits in
- **Where:** "בשיעור 4.7 נקרא להבדל הזה מוצהר מול מאומת (נגיע לזה בשיעור 4.7)."
- **Fix:** `<Later lesson="4.7" quiet>`, as AUTHORING asks when the sentence names the lesson.

#### 4.1-c · nit · "יש הפרש של 7,500 ₪ מול 8,000 ₪"
- **Where:** summary, the self-employed bullet.
- **Problem:** "הפרש" is the difference (500 ₪); the bullet means the two results.
- **Fix:** "…אין כלל מוסכם, והשיטות נותנות 7,500 ₪ מול 8,000 ₪ בתיק של אבי."

### 4.2 — התחייבויות והכנסה פנויה

**Verification.** Both must-fix items are fixed: exercise 1 now reads "ונשארו לה 12 תשלומים" (a `given` fact, `ex1.months`), and the six worked steps are six paragraphs. The should-fix items are fixed on the page: 4.2-3 (the moving-out rent is "הנחת החישוב של הקורס, בלי מקור", with the form quote that may say the opposite and "שאלה פתוחה לאילון", plus a `הנחת חישוב` source item); 4.2-4 (exercise 3 asks when 17 are left, answer 9, and the solution says "ב־18 בדיוק — שאלה פתוחה, ולכן לא שאלנו עליו"; the rule table's 18 row is "שאלה פתוחה (לפי התעתיק: לא נספרת)"); 4.2-5 (the bullet is rewritten as the first round proposed, with the repo date and label); 4.2-6 (short headings, whole shekels). The nits 4.2-8 ("התשלום חודשי, ולכן 18 חודשים הם 18 תשלומים"), 4.2-9 (the column letters are named) and 4.2-10 (`ex6.rent_months`; who and when on the 18-month rule) are fixed. X-1 is fixed here too: "ספירה כפולה הייתה קורית רק בהלוואה למעסיק שנשארו לה מעל 18 תשלומים, כמו בתרגיל 5", and Michal's 8,200 is written "שכר הנטו של מיכל". The nit 4.2-7 is half fixed: after hydration the chip of a 0 ₪ example obligation reads "ריקה: אין תשלום" (phone screenshot), but the reason line under it still says "נשארו יותר מ־18 תשלומים: יורדת מההכנסה" (and that is also what the server-rendered page shows before the island loads).

**Not fixed: the video** (rendered 2026-10-12 10:43, before the report). See 4.2-a.

**Recomputed:** 12,400 + 9,300 = 21,700 − 1,450 = 20,250; 26 − 8 = 18, 26 − 9 = 17; רוני ותמר 1,900 + 1,800 = 3,700, 23,400 − 3,700 = 19,700; with the rent 8,200 / 15,200 / 4,500; the half table 1,200 / 0 / 1,600 / 1,500 / 0 = 4,300; the tasks 18,250 / 20,250 / 16,250 / 20,250 / 18,750; exercises 14,900 (14,300 / 16,000), 9 (8 / 17 / 26), 9,100 (8,600), 16,100 (8,900; 14,400 / 21,300 / 17,700). All hold.

#### 4.2-a · should fix · the video settles what the page leaves open (first-round 4.2-3 and 4.2-4, video half)
- **Where:** `4-2.he.vtt`: "אחרי 8 תשלומים נשארו 18: כבר לא מעל 18." then "ההכנסה הפנויה בעיני הבנק: 21,700 ₪."; and "עוברים לדירה הנקנית: שכר הדירה נגמר, לא נספר."
- **Problem:** the page now says the 18 edge is open and the moving-out rent is the course's own assumption with no source; the video states both as the rule. The closing cue "שאלות פתוחות: 18 בדיוק…" comes after the two flat statements and does not name the rent.
- **Fix:** "אחרי 8 נשארו 18: הקצה. לפי התעתיק — כבר לא נספרת." and "עוברים לדירה: בקורס מניחים שלא נספר (בלי מקור)."; render again.

#### 4.2-b · nit · two injected placement words break the Hebrew
- **Where:** "תשלום של 4,000 ₪ בחודש, עם ששה חודשים לסיום החוזה: אם הם ימשיכו לשלם אותו, **הוא יורדת מההכנסה**." (MDX 114, `placeHe[...]`); and "…לא נספר (**לא נספרת; גם עם חוזה ארוך, לא נספרת**)."
- **Problem:** "הוא יורדת" is a gender clash; the bracket repeats one word twice and reads as a stutter. "ששה" is "שישה" in the course's spelling.
- **Fix:** "…עם שישה חודשים לסיום החוזה: אם הם ימשיכו לשלם אותו, הוא יורד מההכנסה."; drop the bracket (the sentence already says "לא נספר").

#### 4.2-c · nit · the moving-on rent rule is "החלטה של Mogi" without who and when in the sentence
- **Where:** "…נספר גם אם נשארו לחוזה מעט חודשים (החלטה של Mogi, כפי שהוכתבה מההוראה לפי התעתיק; לא אומת)."
- **Fix:** "(החלטה של Mogi: אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08; לפי תעתיק ההוראה בצוות, לא אומת)". Also exercise 3's option "נשארו פחות מ־ 18 חודשים" has a stray space after "מ־".

### 4.3 — יחס החזר

**Verification.** Both must-fix items are fixed in the body: 4.3-1 (the ticket dispute is gone; the body says "יש שתי דרכים לשלב התחייבות, והן נותנות תוצאות שונות. Mogi החליטה (אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08)…", and "מחקר של צוות Mogi (לא אומת מול ההוראה)" replaces the names), and 4.3-2 ("אילו לא סופרים אותה כלל (חישוב להמחשה)"). The ids, the names and the story of the two drafts now sit in Sources only, which the house rule allows. **Five should-fix items are not fixed:**
- **4.3-3** (the 288 months): the text and exercise 2 still say "מיליון ₪ ל־25 שנה ב־4.5%, עם 12 חודשי גרייס חלקי… ואחריו 5,684.25 ₪" with no word that 24 years (288 months) remain. I get 5,684.25 on 288 months and 5,558.32 on 300: a learner who checks with what 3.1 taught gets a number 125.93 ₪ away.
- **4.3-4** (the video, rendered 2026-10-12 10:50) still states "עם גרייס…", "בוליט: הריבית החודשית" and "אותו נכס: 26.3%" with no "לא אומת" and no date for the same-property rule.
- **4.3-5:** "(תוספת, או מחזור חלקי)" is still there, undefined; "גרייס" (MDX 91) is still plain text at its first use in the lesson, and "בוליט ובלון" too.
- **4.3-8:** exercise 6 is still the lookup: it asks for 38.19%, which the table two screens up prints and guided task 2 answers; its solution even says "כמו בשיעור".
- **4.3-9:** "והמפקח לא מפרסם דוגמה מחושבת של היחס" is unchanged; the notes say only that the Supervisor's Q&A file was not read.

4.3-6 and 4.3-7 (phone) are in Part D. The nits in 4.3-10 are not fixed (four guided tasks; the right option of exercise 3, "ההחזר הראשון (או ההחזר בתנאים הנוכחיים, כשהם שווים)", is the longest; the Sources typo "אחד היחס לכולם").

**Recomputed** (Decimal, rate ÷ 1200, each payment rounded to the agora): 3,172.61 + 3,013.56 = 6,186.17; 32.22 / 38.19 / 39.40 / 40.57%, gap 7.18 points; grace 3,750.00 and 5,684.25 (288 months); bullet 1,666.67; גלעד ונוי 1,581.59, 14,000, 3,681.59 → 26.30%, 11.30%, 13.29% (on 11,900); the checker 45.77 / 42.08 / 39.40 and bullet 2,165.83 + 1,930.42 = 4,096.25 → 26.09%; the small example 33.33 / 40; the half table 30.00 / 32.00 / 26.36 / 42.11; exercises 30 (333.33), 1,666.67 (3,333.33 / 20,000), 27.03 (32.5 / 25), 38.19 (39.40 / 32.22), 30 (16.67 / 19.23). All hold.

#### 4.3-a · should fix · the five first-round items above
- **Fix:** as the first round wrote them: one sentence after the grace example ("אחרי 12 חודשי גרייס נשארו 24 שנים, 288 חודשים: שפיצר על כל המיליון; אם החוזה מוסיף את הגרייס לתקופה — 300 חודשים") and the same clause in exercise 2; the closing label in `video/4-3.html` and a render; "(תוספת על אותה דירה)" or `<Later lesson="7.1">מחזור</Later>` for "מחזור חלקי", and `<Term>` on גרייס, בוליט, בלון; new inputs for exercise 6 (or label it קל); "לא מצאנו דוגמה מחושבת (קובץ השאלות והתשובות של הפיקוח לא נקרא)".

#### 4.3-b · nit · ratios lose their trailing zero although the lesson asks for two digits
- **Where:** "39.4%" (body, checker, summary), "26.3%", "11.3%" next to "13.29%" in the same table; the exercise intro says "את האחוזים כותבים בשתי ספרות אחרי הנקודה".
- **Fix:** print ratios with two digits everywhere in the lesson (39.40%, 26.30%, 11.30%), as stage 3's second read asked for the factors (its B-2).

### 4.4 — הוראה 329

**Verification.** All four should-fix items are fixed: 4.4-1 (price 1,400,000 ₪, appraisal 1,500,000 ₪, equity 275,000 ₪ = 19.64% of the price, and "ובפועל גם התנאים של התוכנית עצמה והיכולת של הלווים מגבילים. הדוגמה מראה רק את הקו"; exercise 6 is now 1,200,000 / 1,300,000 ₪); 4.4-2 (the video section is "ארבעה איסורים וקו הון", cue 2 "ארבעה מהם איסור; אחד — קו של הון"); 4.4-3 (the box writes "התקרה" and "הקו" in words; no p or c); 4.4-4 (the reveal says "לפי התקצירים (לא אומת)", the five questions "לפי התיעוד הם זהים בכל הבנקים (לא אומת)"). X-3 is fixed with the canonical sentence in the body, the checker caption, the summary and Sources. The nits 4.4-5, 4.4-6 (facts, `tone="info"`), 4.4-7 ("צריך להעביר לפחות 66,666.67 ₪ ממשתנה לקבועה"), 4.4-8, 4.4-9 (one date, no "Brain" on screen: the last frame reads "לפי תיעוד הצוות, נכון ל־2026-10-09. לא אומת מול ההוראה."), 4.4-10 and 4.4-12 are fixed. The video was re-rendered (2026-10-16 07:10) and its cues match the page.

**Recomputed:** 750,000; 1,125,000 / 275,000 / 19.64% / 1,050,000 / 350,000 / 75,000; 5,000 and 4,000; 600,000; the checker default 70.59% (room 75,000), 43.75% (1,000 under 8,000; 600 over 6,400), 70% (800,000 allowed, 40,000 over), 1,190,000 at 70% (10,000 over), 384 months; the worked example 72.5% / 1,400,000 / 50,000 / 43% / 600 / 966,666.66 / 68.97% / 33,333.34 / 933,333.33 / 66,666.67; the callout 666,666.66 / 333,333.34 / 666,600 / 666,700; the half table 700,000 / 350,000 and 666,666.66 / 333,333.34; exercises 1,200,000 (1,120,000 / 800,000 / 400,000), 7,250 (5,800 / 29,000), 900,000 (450,000 / 899,910), 225,000 (300,000 / 325,000 / 975,000), 50,000 (200,000 / 1,050,000 / 1,000,000). All hold, except the one printed number in 4.4-a.

#### 4.4-a · should fix · "666,666.67…": the callout prints the rounded value as if it were the repeating one
- **Where:** callout "ליד קו, מעגלים כלפי מטה": "שני שלישים מ־1,000,000 ₪ הם 1,000,000 × 2 ÷ 3 = **666,666.67…** — הספרות חוזרות בלי סוף. בעיגול רגיל לאגורה יוצא **666,666.67 ₪**, וזה יותר משני שלישים."
- **Problem:** the fact `r.cut` is 666666.666, but the page's `nv()` formats every number to two decimals, so the "endless" value is printed already rounded up. The equality is false as printed, and the callout's own point (the rounded value is *above* two thirds) cannot be seen: the two numbers it contrasts are the same string.
- **Fix:** print `r.cut` with three decimals ("666,666.666…"), e.g. `f.raw("r.cut")` through a formatter that keeps its digits.

#### 4.4-b · should fix · "מגבלת ההון" one lesson before 4.5 teaches that "מגבלה" means a ban
- **Where:** the canonical sentence is right, but the lesson then uses "מגבלת ההון" as the running name of the 40% line: the checker ("כתום: מעל מגבלת ההון — מותר", "יחס החזר — מגבלת ההון · מגבלת ההון, לא איסור", "ההחזר מעל המגבלה ב־600 ₪"), step 3 ("צעד 3 — מגבלת ההון… מעל הסף, מותר"), exercise 3's error ("זו מגבלת ההון"), the summary.
- **Problem:** 4.5 is built on the distinction "מגבלה רגולטורית — אסור" against "סף הון — מותר", and its CardSort asks the learner to sort by exactly these words. Calling the capital line a "מגבלה" in every sentence teaches the confusion the next lesson exists to remove; 4.5 itself repeats it (4.5-a). The same string runs through 4.6–4.15 (Part B).
- **Fix (one shared string, coordinator):** keep the canonical labelling clause and change only the noun: "סף ההון (40%) — לפי תיעוד הצוות, לא אומת; ההוראה שנושאת אותה לא נקבעה (329 או 203)". In running text, "סף ההון". If the coordinator keeps "מגבלת ההון", add one clause in 4.4 and 4.5: "(למרות השם, זו לא מגבלה שאוסרת: זה סף הון)".

#### 4.4-c · nit · "היום" twice
- **Where:** the reveal "…אין **היום** מגבלה נפרדת על פריים"; exercise 7's error "זה הכלל הישן. **היום** סופרים יחד…".
- **Fix:** "נכון לתקצירים מ־2026-10-09" / "לפי התיעוד, סופרים יחד…" (AUTHORING: never "היום"). Also "אתרי בנק ישראל חסומים בסביבה שבה נכתב הקורס" talks about the authors' environment (first-round 4.10-14): "המסמכים הרשמיים עוד לא נבדקו".

#### 4.4-d · nit · "מעל מגבלת ההון הוא יכול — אבל זה עולה לו"
- **Where:** five questions, "איך זה עובד?".
- **Problem:** "it costs him" is the course's general reasoning, not something a source says (4.5 itself: "כמה זה עולה לבנק… לא ידוע לנו").
- **Fix:** "…הוא יכול, אבל הוא צריך להחזיק יותר הון (שיעור 4.5)".

### 4.5 — שלושה סוגי מספרים

**Verification.** All four should-fix items are fixed: 4.5-1 ("א׳: אין בעיה מצד הקווים האלה. זה לא אישור: בנק רשאי לסרב גם להלוואה כזו"; video cue "מתחת לכל הקווים. הקווים לא מונעים, אבל זה לא אישור."); 4.5-2 (the note now says "האיסור אכן מעל 50%. אבל המשפט… אינו נכון, ולכן האפשרות הזו שגויה"); 4.5-3 (the three kinds are three cards; the case table has two short columns); 4.5-4 (the body explains the weight: "היא נספרת בחלק גדול יותר מהסכום שלה… במלוא הסכום שלה בחשבון ההון", with the unknown weight below the line). The nits 4.5-5, 4.5-6 ("כדי לרדת ל־8,000 ₪ או פחות") and 4.5-7 are fixed; X-4's date is in the text ("שהצוות אסף ב־2026-08-25"). The rest of 4.5-4 is a nit: "משקל סיכון" is still a `form` of "סף הון" in `definitions/4-5.json`, so its popover shows the threshold's definition.

**Recomputed:** 8,000 / 6,400 / 5,600, gaps 800 and 1,600; 1,500,000 / 500,000; 1,300,000 / 700,000 / 200,000; 31.25 / 37.5 / 42.5 / 52.5%; the half table 7,000 / 5,600 / 4,200 and 9,000 / 7,200 / 5,400; exercises 3,600 (6,000), 2,400, 42.5%, 600,000 (375,000 / 900,000). All hold.

#### 4.5-a · should fix · the lesson that separates "מגבלה" from "סף" calls the threshold "מגבלת ההון"
- **Where:** "סף הון, מגבלת ההון (40%): 16,000 × 40 ÷ 100 = 6,400 ₪"; the case table "מעל הקו של בנק א׳ ומעל **מגבלת ההון** (40%); בתוך **המגבלה** הרגולטורית"; the worked example "הקווים: 35% (בנק א׳, בדוי), 40% (מגבלת ההון) ו־50% (מגבלה)"; step 4; exercise 5's right option "מדיניות בנק ב׳ (30%) ומגבלת ההון (40%); המגבלה (50%) לא נחצתה"; the ladder card "סף הון · מגבלת ההון (40%) נחצה".
- **Problem:** a learner who has just sorted cards into "מגבלה רגולטורית" and "סף הון" reads "מגבלת ההון" as a ban. The same cause as 4.4-b.
- **Fix:** as 4.4-b: "סף ההון (40%)" in every running use; the canonical labelling clause stays.

#### 4.5-b · should fix · "ויש מחיר": a price effect no source gives
- **Where:** the tool for the head: "אם ״מותר, אבל יקר לבנק״ — סף הון; אפשר לאשר, **ויש מחיר**"; five questions, "איך זה משפיע עליכם?": "סף הון — **לשקול מחיר**, ואולי להקטין"; "למה ההבדל… חשוב": "תפספסו שההלוואה יקרה יותר לבנק".
- **Problem:** the lesson's own "מה לא ידוע לנו" says "כמה זה עולה לבנק, ואיך הוא מתרגם את זה לריבית או לסירוב… לא ידוע לנו", and the one written support ("מתומחר גרוע יותר") is team research, labelled לא אומת. The head tool and the five questions, the parts a learner keeps, state the price effect flat.
- **Fix:** "סף הון; אפשר לאשר, והבנק מחזיק יותר הון. אם זה משנה את הריבית — לא ידוע (לפי מחקר של הצוות אולי כן; לא אומת)"; five questions: "סף הון — לשאול אם ואיך זה משפיע על ההצעה". Keep "ההלוואה דורשת מהבנק יותר הון" instead of "יקרה יותר לבנק", or label it "ידע כלכלי כללי".

#### 4.5-c · nit · "מדרגות" before anyone defines it
- **Where:** the video section title "שלוש מדרגות"; "בנקאי שאינו בצוות סיפר על **מדרגות** של 40/60/75 שקשורות להקצאת ההון".
- **Problem:** first-round X-2 (4.11–4.15) asked for one definition of "מדרגה"; its first use is here, two lessons before 4.11. In the title it means "three rungs" of the ladder; in the body it means Tobi's LTV bands.
- **Fix:** title "שלושה סוגים על סולם אחד"; in the body "…על ספים של שיעור מימון, 40/60/75 (נקודות שבהן, לדבריו, משהו משתנה)…".

### 4.6 — תקציב מחיה סביר

**Verification.** All five should-fix items are fixed: 4.6-1 (step 1 "ההכנסה הפנויה לפי כלל 18 החודשים", step 2 "לפי הקווים של ההוראה — הכול בסדר. מה הבנק עצמו יחליט — לא ידוע."; video cue "מתחת לשני הקווים. מה הבנק יחליט — לא ידוע.", and the scene is now titled "מה היחס רואה"); 4.6-2 ("שתי נפשות"); 4.6-3 ("ואצל מי הוא גר"); 4.6-4 ("בלי הלוואות אחרות (ולכן גם ההכנסה הפנויה היא 16,000 ₪)"); 4.6-5 (the half table is three columns, the household in the row name). The nits 4.6-6 (the forms line is labelled; "אסור לעבור (לפי התיעוד; לא אומת)"; "סותר בחלקו"), 4.6-7 ("תקופה ארוכה יותר (שיעור 3.1) או הלוואה קטנה יותר", and "חוסר של 600 ₪ בכל אחד מהם") and 4.6-9 (the bars are teal and turquoise, frames t098–t131) are fixed. Two nits are left: 4.6-8 (the summary still says "מדיניות הבנק (לרוב לא ידועה)") and 4.10-14 for this lesson ("אתרי הלמ״ס חסומים בסביבה שבה נכתב הקורס").

**Recomputed:** 5,000; 6,400 / 9,600 / 4,800 / 1,920; 6,600 ÷ 19,000 = 34.7368… → 34.74%; 11,200 / 2,800 / 600; 6,000; 9,500 and 7,600; after ten months 12,400 and 600 above; the half table 9,000 / 3,000, 10,000 / 2,500, 12,000 / 4,000; exercises 8,000, 3,000, 600, 6,500, and 10,000 / 8,000 in exercise 7. All hold.

#### 4.6-a · should fix · "C max" means a different thing from the lesson before
- **Where:** formula box "C max = Y − O − T" ("ההחזר הגבוה ביותר שהתקציב מאפשר"); 4.4 and 4.5 defined "C max = הכנסה פנויה × הקו ÷ 100" ("ההחזר הגבוה ביותר שהקו מאפשר").
- **Problem:** AUTHORING: a letter keeps its meaning everywhere. Two lessons in a row give the same symbol two formulas, and this lesson's point is precisely that the two maxima differ (9,500 against 6,000).
- **Fix:** write the new one in words ("ההחזר שהתקציב מאפשר = Y − O − T"), or give it a subscript word ("C לפי התקציב"), and say "שונה מ־C max של שיעור 4.4, שנקבע לפי הקו".

#### 4.6-b · should fix · "Y כמו באנגלית yield, ההכנסה"
- **Where:** formula box, the definition of Y.
- **Problem:** "yield" is תשואה, and the course's letter table already uses y for a bond's yield (0.11). The gloss teaches a wrong English word and ties Y to the one letter it must be told apart from.
- **Fix:** drop the gloss, or "Y — ההכנסה נטו (אות חדשה בטבלת האותיות של הקורס)".

#### 4.6-c · nit · a broken summary line
- **Where:** summary: "הלוואה עם 18 חודשים או פחות לא מנוכה ביחס ההחזר, ובכל זאת **מצטמצם** ממה שנשאר."
- **Fix:** "…ובכל זאת היא יורדת ממה שנשאר לחיים."

#### 4.6-d · nit · the video's limit bar has no label
- **Where:** frames t108–t131, "המגבלה הרגולטורית · 9,500 ₪"; the closing frame labels only the budget ("תקציב המחיה הוא הנחה…").
- **Fix:** add "50% לפי תיעוד הצוות; לא אומת" under the bar, as 4.4's and 4.5's closing frames do.

### 4.7 — חיתום: איך הבנק בודק

**Verification.** All five must-fix items are fixed: 4.7-1 (no page number or J-code outside Sources); 4.7-2 (the demonstration cap is now 35%, "מספר להמחשה בלבד: לא מגבלה רגולטורית, לא מגבלת הון ולא מדיניות של בנק כלשהו", and 40% is called the capital line with the canonical label, "ובשיעור הזה משתמשים בה גם כדוגמה לתקרה שבנק יכול להחיל"); 4.7-3 (task 2 now says "השאירו את ההכנסה של אבי כפי שאומתה, 7,500 ₪, והורידו רק את ההון העצמי", and task 3's answer is "167,000 ₪: 127,000 ₪ בגלל ההכנסה הנמוכה, ועוד 40,000 ₪ בגלל ההון הנמוך"; task 1 asks and answers "בכמה נקודות אחוז", 7.2); 4.7-4 ("בבקשה לאישור עקרוני, לפי תיאור הצוות, חלק מהבנקים עונים מיד… מי בודק בחיתום עצמו… — אין לנו"); 4.7-5 ("זו עמדה של הקורס, לא כלל של בנק"; "והבנק מגלה" is gone). All should-fix items are fixed: 4.7-6 (the table is captioned "מה הצוות בודק לפני הבנק", the label comes first, the five questions say "לפי תיאור הצוות… (מחקר הצוות; לא אומת)"); 4.7-7 (the 1,237,500 ₪ financing ceiling, and the component line "הלוואה מרבית לפי יחס ההחזר בלבד"); 4.7-8 (one worked cell in three steps and a formula box); 4.7-9 ("נניח, להמחשה, חלון של בדיוק 24 יום… זו הרצפה, ובנק יכול לתת יותר", in exercise 7 too); 4.7-10; 4.7-11 (cue 1 "בדרך כלל, אישור עקרוני ניתן על מה שנאמר."). Cross-lesson X-2 (when the bank pulls credit data) and X-3 (the 40.6% under net-to-pay) are fixed here. The nits 4.7-12 (one decimal, said once), 4.7-13 (the מאומת/מוכר sentence; exercise 7's request is on a Sunday) and 4.7-14 (`minutes: 30`; "המימוש" is gone) are fixed, except that the prediction's right option is still by far the longest.

**Recomputed** (Decimal; the largest loan by stepping 1,000 ₪ at a time with each half-track rounded to the agora, and by the per-shekel shortcut): 19,200 / 15,700, 3,500 = 18.23% and 31.82%; 6,186.17 → 32.2 / 39.4 / 40.6%; loans 1,753,000 / 1,433,000, 1,402,000 / 1,147,000, 1,227,000 / 1,003,000 (both methods); 18.19%; 1,237,500; 647,000 / 127,000; with equity 480,000: 1,170,000, 3,284.91 + 3,120.24 = 6,405.15 (+218.98), 40.8%, short 167,000; the cell 5,495 / 5.4745 / 1,003,747.07; dates: Monday 26.10.2026 + 24 = Thursday 19.11, day 9 Wednesday 4.11, day 22 Tuesday 17.11; exercise 7 Wednesday 4.11 + 24 = Saturday 28.11, 22.11 (Sunday) + 5 = Friday 27.11, + 4 = Tuesday 1.12, 3 days (errors 9 and 27); exercises 31.82 (46.67 / 68.18 / 3,500), 39.4 (32.2 / 15,700), 6,405.15 (6,186.17 / 218.98), 1,003,000 (1,227,000 / 1,433,000 / 1,130,000). All hold.

#### 4.7-a · nit · two "=" that are approximations
- **Where:** "צעד 2… 6,186.17 ₪ ÷ 1,130,000 ₪ × 1,000 = 5.4745 ₪" (5.47448…) and "צעד 3… 5,495 ₪ × 1,130,000 ₪ ÷ 6,186.17 ₪ = 1,003,747 ₪" (1,003,747.07); the same in exercise 6's solution.
- **Fix:** "בערך 5.4745 ₪" and "= 1,003,747.07 ₪", so every printed equality holds on its printed numbers.

#### 4.7-b · nit · a credit-data row in a table of what the team checks
- **Where:** the table "מה הצוות בודק לפני הבנק", row "ההתחייבויות וההיסטוריה · נתוני אשראי, שהבנק מושך בעצמו".
- **Problem:** the caption says the team checks; the cell says the bank pulls. A learner asks who reads the report.
- **Fix:** "דוח נתוני אשראי שהלווים מזמינים (שיעור 4.8); את החיווי הבנק מושך בעצמו".

### 4.8 — נתוני אשראי והתנהלות החשבון

**Verification.** Both must-fix items are fixed: 4.8-1 (cue 1 "לפי הודעות של בנקים: בבקשה לאישור עקרוני פונים ללשכה.", cue 2 "ומה בנק קורא בחשבון? אין לנו מקור."); 4.8-2 (no page number, J-code, "בבריף", "מפת המקורות" or question number in the body; they are in Sources). All should-fix items are fixed: 4.8-3 ("שני הטפסים הציבוריים שבדקנו, של שני בנקים, מודיעים… מה עושים האחרים — לא בדקנו (לא אומת). וזה לא אימות של מה שהלווים אמרו"); 4.8-4 (its own source item); 4.8-5 ("פעם אחת בשנה קלנדרית", "ההגבלה היא לשנה אחת"); 4.8-6 (the gloss on חדלות פירעון and הוצאה לפועל); 4.8-7 ("הפקדות מהעסק הן לא רווח… בתיק אמיתי הפער בין השתיים הוא שאלה", and "בשביל אבי החשבון עקבי"); 4.8-8 (two tables of four and five columns). The nits 4.8-9 (reveal note 0 now answers "signing day"; exercise 6 lists 7,300 as an error; "בתרגיל 5 צריך לספור ימים בלוח שנה") and 4.8-10 are fixed.

**Recomputed:** 41,000 + 16,700 − 15,900 = 41,800; + 13,950 − 15,200 = 40,550; + 15,100 − 14,800 = 40,850; deposits 45,750, debits 45,900, 150 out more than in; Avi 7,500 / 6,750 / 7,600 / 7,300, gaps 3,500, 200, 750, 4,250; Monday 26.10.2026 + 60 = Friday 25.12, Monday 28.12 is day 63; Sunday 20.9 + 60 = Thursday 19.11 (errors 20 and 18); exercises 7,500 (22,500 / 11,000 / 9,000), 150 (45,750 / 45,900), 6,750 (7,500 / 7,600 / 9,000 / 7,300). All hold.

#### 4.8-a · should fix · the summary states two bank practices the body only reports
- **Where:** summary: "התנהלות חשבון: הפקדות, חיובים, יתרות והחזרות חיוב. **הבנק משווה אותה למה שהוצהר.**"; and "**הבנק מושך** כבר בבקשה לאישור עקרוני, לפי הודעות שבנקים מפרסמים."
- **Problem:** the body says the first only as Eylon's field knowledge ("לפי אילון, משווים… ממתין לאישור אילון") and the second for two forms of four, with "לא אומת" and the 4.7 description that does not fit it. The summary is what a learner rereads, and it drops both labels.
- **Fix:** "לפי אילון (ממתין לאישור), משווים אותה לתלושים ולמה שהוצהר."; "בשני טפסים ציבוריים, הבנק מודיע שיפנה ללשכה כבר בבקשה לאישור עקרוני (לא אומת)."

#### 4.8-b · nit · the prediction has a definite answer the lesson does not have
- **Where:** prediction "מתי הבנק בודק את נתוני האשראי שלהם?", answer "כבר בבקשה לאישור עקרוני, אחרי שהלווים הסכימו שיפנה".
- **Problem:** the body ends with "שני התיאורים… לא מתיישבים עד הסוף; לא בדקנו אם הבנק מושך בשני המקרים". The reveal adds "(לא אומת מול האתרים.)", but the option itself reads as the rule.
- **Fix:** option "לפי הטפסים שבדקנו — כבר בבקשה לאישור עקרוני, אחרי הסכמה".

### 4.9 — הבטוחה

**Verification.** Both must-fix items are fixed: 4.9-1 ("לפי מחקר הצוות (לא אומת), עם שני לווים מבטחים את שניהם, ולכן ביטוח החיים יקר יותר; בכמה — לא ידוע"), 4.9-2 ("הסכום שהביטוח צריך לכסות יורד כל חודש. כמה זה משפיע על המחיר — לא ידוע (המחיר תלוי גם בגיל)"). All seven should-fix items are fixed: 4.9-3 ("בדרך כלל הבנק דורש שני ביטוחים (לפי ההוראה הוא רשאי לדרוש; ראו בהמשך)"; video "בדרך כלל נדרשים שני ביטוחים"), 4.9-4 ("לפי אותו תעתיק, הלקוח זכאי לעותק (לא אומת)", with a source), 4.9-5 (11(ד)(3) is in the source), 4.9-6 ("הציטוט מנוסח כהגדרה לצורך דיווח (הוראה 876); לא נבדק אם הוא חל גם על מגבלת שיעור המימון"), 4.9-7 (the task names the frame), 4.9-8 ("לא על הרהיטים והציוד שבדירה, שנקראים תכולה"), 4.9-9 (phone, Part D). The nits 4.9-10 (the balances are now the statement schedule, and the solution explains the 0.29 ₪ gap to the closed form), 4.9-11 ("ב־3.9 נקודות אחוז"), 4.9-12 (the caution is in exercise 5's question) and 4.9-13 are fixed. Cross-lesson X-4 is fixed: the formula box writes "התקרה" in words, so T is the living budget only.

**Recomputed** (each track its own statement schedule, summed): 990,233.74 / 816,629.58 / 332,996.53; the first balance at or under 30,000 is after payment 296 (24,522.72); closed form with the unrounded payment 816,629.29; 68.5 / 72.4%; 1,237,500 / 1,170,000 / 40,000; 1,506,666.67; the half table 1,600,000 / 70.63% / 1,200,000, 1,520,000 / 74.34% / 1,140,000, 1,480,000 / 76.35% / 1,110,000; exercises 74.3 (68.5 / 134.5), 20,000, 17 December (Thursday 3.12 + 14), 816,629.58, 106 (2,121.31; 30,783.64 after 105, 28,790.60 after 106); dates Tuesday 20.10.2026 + 90 = Monday 18.1.2027, Monday 2.11 + 14 = Monday 16.11. All hold.

#### 4.9-a · nit · "כמו בדף של בנק" without the condition stage 3 added
- **Where:** "היא מחושבת כמו בדף של בנק: ההחזר נקבע פעם אחת, והריבית מעוגלת לאגורה בכל חודש"; exercise 6's solution "כך מחשב דף של בנק"; the source "(כמו בדף של בנק)".
- **Problem:** the same unlabelled claim stage 3's second read asked to condition (its C-3): the team matched the Spitzer tables of two banks, not every bank's statement.
- **Fix:** "כמו בלוחות שפיצר של שני בנקים שהצוות בדק; בנק יכול לעגל אחרת".

### 4.10 — כרטיסי הגורמים, א׳: הלקוח

**Verification.** All four must-fix items are fixed: 4.10-1 (card 1 now ends "המנוע יחשב את היחס לפי כללי החישוב שהוחלטו (עוד לא נבנה)"; no ticket, page number or J-code in a card body; they sit only in each card's "המקורות של הכרטיס" panel, as Sources); 4.10-2 (card 14: "דרך תקציב המחיה (4.6), שהוא חישוב של הקורס… אם בנק בודק משהו כזה… — לא ידוע"); 4.10-3 (summary "בשניים מהטפסים עד גיל 18, באחד עד גיל 21, ואחד לא מגדיר גיל"); 4.10-4 (card 3: "בטפסים הציבוריים יש שאלה על מקורות ההון (לא אומת); איך בנק מתייחס למתנה — לא ידוע"; the "why" says "אם הבנק בודק גם מאיפה הכסף בא — לא ידוע"). Of the should-fix items, 4.10-5 (card 13 "לפי כללי החישוב של הקורס…"), 4.10-6 (the reveal "אם בנק מסוים מסרב בפועל — זו מדיניות שלו, ולא ידועה לנו"), 4.10-7 (a "מחקר / הצעה" row in the label table), 4.10-9 (card 8 "סימן חשוב", the retention line gone, "בטפסים של שניים מארבעת הבנקים"; card 9's levers "(עצה של הקורס; אין מקור שזה משפיע על ההצעה)"), 4.10-10 (card 15 "למה הבנקים שואלים אותן — לא בדקנו מול מקור"), 4.10-11 (phone, Part D) and 4.10-12 (card 4, "לפי טובי זמיר הוא עצמו מעדיף") are fixed in the cards. **4.10-8 is not fixed** (4.10-a), and 4.10-12 is fixed in the card but not in the map (Part B, B-2). The nits 4.10-13 (the nine-card grid is centred, frames t142–t152), 4.10-14 (מורן ויובל; the environment sentence is gone here), 4.10-15 ("עד הקו"; the prediction now asks "מה ידוע לנו") and 4.10-16 are fixed.

**Recomputed:** 8,400 ÷ 20,000 = 42%, 10,000 and 8,000; מורן ויובל 19,800, 44%, 7,920, 792, 9,900; the half table 15,000 / 40%, 16,000 / 45%, 20,000 / 35%; exercises 40 (250), 11,000 (8,800), 15,300 (14,600 / 16,200), 1 (4 / 3), 83.33 (75 / 25); the nine card examples (42%; 450,000 = 25% and 33.33%; 12,000 and 3,000; 14,800; 11.10.2026 + 60 = 10.12.2026; 35,800 ÷ 3 = 11,933.33; 1,400; 2 and 3 children; 1,500,000 / 1,000,000 / 500,000). All hold.

#### 4.10-a · should fix · "(שאלה N בשאלון)" is still in nine card thresholds (first-round 4.10-8, not fixed)
- **Where:** `factor-cards.ts`, the open-question sources of cards 6 ("שאלה 12 בשאלון"), 8 (10), 9 (9), 13 (19), 2 (5), 4 (5), 5 (20), 16 (11), 20 (15); visible on the page when a card is opened (4.11's default card 2 shows "שאלה פתוחה לאילון (שאלה 5 בשאלון)").
- **Problem:** "השאלון" in a lesson that quotes the banks' questionnaires on every card reads as a bank's form; and a question number on the Eylon list is an internal reference the learner cannot follow. Cards 2 and 4 give the same "שאלה 5" to two different questions.
- **Fix:** "שאלה פתוחה, ברשימת השאלות לאילון", as cards 1, 17 and 19 already say; drop the numbers.

#### 4.10-b · nit · "מגבלת ההון" and "סף הון" side by side in one paragraph
- **Where:** "40% הוא קו אחר: מגבלת ההון (40%)… ומה שאילון אמר… שסותר בחלקו את התעתיק, שבו 40% הוא סף הון ולא תקרה."; card 1's thresholds the same.
- **Fix:** the shared fix of 4.4-b.

#### 4.10-c · nit · exercise 7's solution says the bank asks
- **Where:** "…עם המתנה: 75%. זו הדגמה **למה הבנק שואל מאיפה בא ההון העצמי**."
- **Problem:** card 3, rewritten after the first round, says "אם הבנק בודק גם מאיפה הכסף בא — לא ידוע".
- **Fix:** "זו הדגמה למה מקור ההון העצמי יכול לשנות את החישוב. בטפסים הציבוריים יש שאלה על מקורות ההון (לא אומת)."

### 4.11 — כרטיסי הגורמים, ב׳: העסקה, הנכס והבנק

**Verification.** The must-fix 4.11-1 is fixed: card 4's "why" is now "לפי טובי זמיר הוא עצמו מעדיף תיקים גדולים; למה — לא נאמר", and its effect "אם גודל ההלוואה משנה ריבית — לא ידוע". The should-fix items are fixed in the cards and the lesson: 4.11-2 (card 16 "(הסבר כללי)", card 17's cost-to-the-bank clause gone, card 21 "לא מצאנו מקור שהם משפיעים על הריבית"); 4.11-3 (card 19 "לחזור לבנק ולבקש לשפר את ההצעה שלו לא תעזור"); 4.11-4 ("בהקלטה הדובר מעורב, אילון או טובי זמיר", in the guided answer, card 11 and Sources); 4.11-5 (the paragraph "במילים פשוטות: מרווח הוא… ״לפתוח״ הוא המספר הראשון שהפקיד מציע…", with the unit assumption). The nits 4.11-6, 4.11-7 ("30, 45, 60, 75 ו־90") and 4.11-8 (the half table is 1,600,000 ₪, not card 10's 2,000,000) are fixed. Cross-lesson X-2 is fixed here (the cards and the lesson say "רצועות" and the source keeps Tobi's word, "בלשונו ״מדרגות״"; see 4.5-c for the one left), X-5 is fixed ("הנחת חישוב: עד ארבעה בנקים במקביל: הנחת מודל התיק, לא החלטה על בחירת בנקים"), and X-1's exercise feedback carries no FK id.

**Recomputed:** 6,599.56 / 5,368.22 / 1,231.34 = 18.66%; 6,599.56 × 240 ÷ 360 = 4,399.71; 75% and 78.95%; אסנת ויגאל 1,680,000 / 720,000 / 1,610,000 / 790,000 / 70,000; the half table 1,120,000 / 480,000, 800,000 / 800,000; exercises 750,000 (1,125,000), 80% (73.33), 393.18 (4,446.66 / 4,053.48), 25.12.2026, 500,000 (1,000,000), 125,254.80 (1,333,998 / 1,459,252.80); the thirteen card examples (65% → 60%: 1,080,000 and 90,000; 1,500,000 / 1,300,000 / 200,000; 45 + 30 = 75; 1,500,000 / 1,400,000 / 1,000,000; 1.11.2026 + 60 = 31.12.2026, + 120 = 1.3.2027, 60 days; 400,000 / 800,000; 20.10 + 24 = 13.11, 10 days to the 30th; 0.3 point = 3,000 ₪; 1,210 = 0.121%; 5,000; 5 and 20 days). All hold.

#### 4.11-a · should fix · "בשפיצר, החלק הגדול של התשלומים הראשונים הוא ריבית" — the rule stage 3 made conditional
- **Where:** "למה לא יותר?…: **בשפיצר**, החלק הגדול של התשלומים הראשונים הוא ריבית, וחלק הריבית לא תלוי באורך ההלוואה."; video cue "הוא קטן ב־18.66%. רוב התשלום הראשון הוא ריבית."
- **Problem:** stage 3 made exactly this sentence a must-fix (3.2-1): it holds only above a threshold rate (3.47% for 20 years in 3.2's table). It is true for this loan (4,166.67 of 6,599.56 is interest at 5%), but it is written as a property of every Spitzer loan, and the beginner has just learned otherwise.
- **Fix:** "בהלוואה הזו, ב־5%, רוב התשלום הראשון הוא ריבית (4,166.67 ₪ מתוך 6,599.56 ₪), וחלק הריבית לא תלוי באורך ההלוואה" (a fact for 4,166.67); the cue "כאן, ב־5%, רוב התשלום הראשון הוא ריבית."

#### 4.11-b · should fix · the map still says "הבנק מעדיף תיקים גדולים" on this very page (first-round 4.10-12, map half)
- **Where:** the map below the cards, node "גובה ההלוואה": "לפי טובי זמיר **הבנק מעדיף** תיקים גדולים"; link `loan_amount → customer_value` (4.12): "הבנק מעדיף תיקים גדולים (טובי זמיר; ידע מהשטח)".
- **Problem:** card 4, on the same page, was corrected to "הוא עצמו מעדיף"; FK-H-051 is "אני אעדיף". The map turns one banker's preference into the bank's.
- **Fix:** "לפי טובי זמיר, הוא עצמו מעדיף תיקים גדולים (ידע מהשטח, מקור יחיד)" in both places (`stage-4.ts`).

#### 4.11-c · should fix · card 18 and the map state a bank's monthly targets as fact
- **Where:** card 18 "why": "**הבנק מנהל יעדים לפי חודש ולפי רבעון.** כשהוא רחוק מהיעד, יכול להיות שהוא ירצה את התיק יותר."; map node "יעדים חודשיים": "יעדים שהבנק מנהל לפי חודש ורבעון…"; link `monthly_targets → bank`: "הבנק מנהל יעדים לפי חודש".
- **Problem:** the only source is Tobi, single source, "זה לא מדע מדויק" (FK-H-052, FK-H-054). The card's thresholds label him; the "why" and the map, which a learner reads first, do not.
- **Fix:** "לפי טובי זמיר (מקור יחיד), הבנק שבו עבד מנהל יעדים לפי חודש ורבעון…"; the link "לפי טובי זמיר: יעדים לפי חודש".

#### 4.11-d · nit · "כמה זמן שמאות תקפה (שיעור 1.7)" is called unknown
- **Where:** worked example, step 4: "לא ידוע לנו איך כל בנק מתייחס לשמאות שהוא לא הזמין, או כמה זמן שמאות תקפה (שיעור 1.7)."
- **Problem:** 1.7, 4.9 and card 11 teach the transcribed 90-day rule for an appraisal from another bank.
- **Fix:** "…ומה קורה אחרי 90 הימים שבתעתיק (שיעור 1.7; לא אומת)".

#### 4.11-e · nit · two small wording slips in the cards
- Card 19: "לחזור לבנק ולבקש לשפר את ההצעה שלו **לא תעזור**" → "לא יעזור".
- Card 21: "בהלוואה עד 30,000 ₪ לא נדרש **ביטוח חיים**", while 4.9 (and its transcription) says "לא דורשים ביטוח בכלל". → "לא נדרש ביטוח".

### 4.12 — איך בנק מתמחר

**Verification.** Both must-fix items are fixed: 4.12-1 (the five questions: "הדרך שהקורס מסדר את מה שידוע על המרווח… אף בנק לא פרסם שהוא מתמחר כך"; the "דרישות הון" definition: "אפשר להניח שהון יקר לבנק יותר מכסף של מפקידים (ידע כלכלי כללי); אם וכמה זה מגיע למחיר — לא ידוע"; the map's `offered_rate` and `capital_requirements` cards say the same); 4.12-2 (a paragraph "ריבית בנק ישראל כבר בעוגן… ולכן היא לא נספרת שוב ברכיב ״עלות המימון״"; the "boi" scenario moves the anchor only; MatchTable row 1's answer is "העוגן"; the map link `cost_of_money → spread` agrees). All should-fix items are fixed: 4.12-3 (both halves of FK-H-050, and "הרשימה ״מה אולי משפיע״ היא הרשימה של הקורס"); 4.12-4 ("איך בנק מתרגם את זה להצעה שלו — לא ידוע"); 4.12-5 (the note sits above the tower and says "אין בהם דירוג"; the size and purchase arrows are "unknown", with "הכיוון של כל חץ הוא קריאה של הקורס"); 4.12-6 ("שאלו מאיפה הוא"; option "הון לא משפיע" now answers "גם זה לא ידוע לקורס"); 4.12-7 (the heading is "פער קטן במרווח, בשקלים", the paragraph says 0.3, exercise 5 uses 3.2% with 0.4 and 0.9); 4.12-8; 4.12-9 (no plural "נקודות אחוז" at or below one); 4.12-10 (phone, Part D). The nit 4.12-11 is fixed ("בין 0.7 ל־0.8; נחשב כאן 0.8"). Cross-lesson X-6 (the pricing links say "אולי… לא ידוע") is fixed. The tower is presented as the course's own arrangement in the body, the five questions, the summary, the tower note and Sources.

**Recomputed:** the tower 0.15 + 0.3 + 0.2 − 0.1 − 0.05 + 0.1 = 0.60, 4.60%; the prediction 5,558.32 / 5,729.97, 171.65 × 300 = 51,495 (errors 3,000 and 75,000); the rule of thumb 600.72 / 616.57 / 15.85; the worked example 4,805.79 / 4,932.57 / 126.78 / 30,427.20; the half table 5,061.20 and 255.41; exercises 4.35, 109.10 (3,111.83 / 3,220.93), 26.15 (585.11 / 611.26), 39,276. All hold.

#### 4.12-a · nit · a friend's claim labelled "לא אומת"
- **Where:** exercise 3, right option: "לא אומת: אין לזה מקור, ואין לנו גודל של רצועה. שאלה לאילון".
- **Problem:** 4.10's label table defines "לא אומת" as "כלל רשמי שהצוות העתיק או קרא בתקציר, ועוד לא נבדק מול המסמך עצמו". A friend's sentence is not an official rule; what the course actually does with it is "שאלה פתוחה".
- **Fix:** "אין לזה מקור: שאלה פתוחה לאילון, ולא משתמשים בזה".

#### 4.12-b · nit · two grammar slips in the formula box
- "**שישה החלקים**" → "ששת החלקים"; "0.6 נקודת אחוז **הן** 0.006" → "היא 0.006".

### 4.13 — ארבעת הבנקים

**Verification.** Both must-fix items are fixed: 4.13-1 (the map link `bank_form → residency` now reads "שניים שואלים על תושבות מס ואזרחות נוספת; אחד מציג תנאים בכניסה; באחד הרישום לא מראה שאלה כזו", and `bank_form → family` "בשני בנקים עד 18, באחד עד 21, ובאחד הרישום לא אומר"); 4.13-2 (the body and the comparison's `loan.point`: "שני טפסים מציגים החזר חודשי על המסך, עם ההנחות שלהם", with Leumi's and Discount's own labels quoted). All should-fix items are fixed: 4.13-3 (exercise 1 asks "איזה כלל של בנק ישראל תלוי בתשובה הזו, לפי התעתיק"; the body: "רק הטופס של דיסקונט כותב סיבה… הקורס לא יודע אם זו הסיבה"); 4.13-4 ("חלקם ממעבר על האתר וחלקם מתוכן שנמסר לו, והתיעוד של הפועלים נקטע בסופו", in Sources too); 4.13-5 ("״הרישום״ הוא מה שהצוות כתב על כל טופס"); 4.13-6 (the "only lesson with real names" sentence is gone); 4.13-7 ("מודל התיק של Mogi מניח עד ארבעה בנקים במקביל (הנחת מודל התיק, 2026-08-13); כמה בנקים בפועל… מדיניות שעוד פתוחה"); 4.13-8 (exercise 3 is 186,000 ₪ → 15,500); 4.13-9 (Poalim's "עד 21 ימי עסקים" against the transcribed 5 days, "הקורס לא מכריע"); 4.13-10 ("בחזקת ההורים"); 4.13-11 (each form's income unit is named). The nit 4.13-12 is fixed (the full quote, "הטווח שבטופס הציבורי"). Case A appears with the map's numbers only (price, equity and its 200,000 gift, incomes, the car loan, one child): no track, mix or offer.

**Recomputed:** 1,640,000 / 140,000 / 360,000; 17,500 and 15,500 (errors 186,000 and 7,750); 900,000 (1,350,000 / 1,260,000); 5,677.89 at 5.5% over 360 (errors 6,140.87 and 4,583.33); children 1 and 3; the half table 2 / 2 / 4, and 6 for Discount's household count. All hold.

#### 4.13-a · nit · the summary keeps "חישוב שמופיע בו הוא הדגמה"
- **Where:** summary, first bullet: "הטופס הציבורי הוא בקשה. הוא לא בודק, לא מתמחר ולא מבטיח. **חישוב שמופיע בו הוא הדגמה.**"
- **Problem:** the body now says what first-round 4.13-2 asked: Leumi calls it "סימולציה בלבד", Discount only states its assumptions. "הדגמה" is still a word neither record uses for Discount.
- **Fix:** "חישוב שמופיע בו נשען על ההנחות שהטופס כותב לידו."

#### 4.13-b · nit · "למה זה קיים?" gives the forms a purpose the lesson says it does not know
- **Where:** five questions: "כדי שהבנק יקבל את הנתונים שהוא צריך כדי לענות על הבקשה — ובראשם הנתונים שהכללים של בנק ישראל נשענים עליהם".
- **Fix:** "ככל הנראה כדי לקבל את הנתונים שהבנק צריך… (הסבר של הקורס; רק טופס אחד כותב סיבה)".

### 4.14 — השוק והעולם

**Verification.** All eight should-fix items are fixed: 4.14-1 (a caption above the decisions table, "הריביות לפי תקצירים של הודעות רשמיות, חיפוש ב־10 באוקטובר 2026; לא אומת", the 25.5.2026 decision "מתקציר אחד בלבד", "החלטה מ־1 בספטמבר 2026, בתוקף מ־3 בספטמבר", and the label on screen for the whole scene in frames t022–t057 and t226); 4.14-2 ("(לא אומת)" on the 1.5 add-on in the summary, the reveal, exercise 2's solution and the five questions); 4.14-3 ("נבדקה רק נכון ל־9 באוקטובר 2026"; cue "התוספת של 1.5 לא נבדקה מול מקור. לא אומת."); 4.14-4 ("שתי דוגמאות לא מראות ש״תמיד״… והעלייה ב־22 במאי 2023… לא באה בעקבות אירוע ביטחוני"; exercise 7 now asks what two examples show); 4.14-5 (the link is "נפח המשכנתאות", "כמה ניתנו, לא כמה ביקשו", "החוליה הזו חלשה מבין השש"); 4.14-6 ("שהבנק המלווה ישקול"); 4.14-7 (the market card: "לפי תעתיק בצוות של הוראת בנק ישראל (לא אומת)"); 4.14-8 (the chain is six cards, the decisions table puts the payment second). The nits in 4.14-9 are fixed (`minutes: 30`; `err_nomargin` reads its two primes from facts; "מהעקום הנומינלי והעקום הריאלי"). Every market example carries its date, and "אף דוגמה כאן אינה תחזית" holds through the page.

**Recomputed:** 0.1 → 1.6 → 1.1; 4.75 → 6.25 → 5.75; 4.5 → 6 → 5.5; 3.5 → 5 → 4.5; 3.25 → 4.75 → 4.25; payments on 500,000 ₪ / 300 months 1,907.08 / 3,145.53 / 3,070.44 / 2,779.16 / 2,708.69; gaps 1,238.45 and 70.47; 1.04 ÷ 1.02 → 1.96%, 1.0474 ÷ 1.0325 → 1.44%, 1.05 ÷ 1.03 → 1.94%; the forward rate from 3.8817% (10 y) and 3.5221% (5 y) → 4.2425%, shown 4.24%; exercise 6 → 4.20%; 8.8 → 10 billion = +13.64%; exercise 3 2,846.46 − 2,794.66 = 51.80 (error 52.89 without the margin); the half table of primes. All hold.

#### 4.14-a · should fix · the December 2025 relief "נקבעה לצמיתות" (first-round X-9, not fixed), against 4.4
- **Where:** link 6, the 16.12.2025 item: "…והקלה להלוואה לכל מטרה **נקבעה לצמיתות**."
- **Problem:** 4.4 says "שני תקצירים קוראים אותה אחרת, ולכן הקורס לא משתמש בה", and 4.4's source repeats it. The learner meets the same relief as settled two lessons later. The list header's "(לא אומת)" does not cover the conflict.
- **Fix:** "…והקלה להלוואה לכל מטרה, ששני תקצירים מתארים בשתי דרכים (שיעור 4.4)."

#### 4.14-b · should fix · "הבנק מעדיף נפח" again (the same misattribution as 4.11-b)
- **Where:** link 4: "בצוות נשמעו שני דברים — שהבנק מעדיף נפח (בנקאי חיצוני, 2026-08-05; מקור יחיד)…"; Sources: "הבנק מעדיף תיקים גדולים ומנהל יעדים חודשיים (FK-H-051)".
- **Problem:** FK-H-051 is the banker's own preference ("אני אעדיף…"), and card 4 was corrected to say so.
- **Fix:** "…שבנקאי חיצוני אמר שהוא עצמו מעדיף תיקים גדולים (2026-08-05; מקור יחיד)…", and the same in the source item.

#### 4.14-c · nit · a Mogi decision without who and when in the sentence; a four-minute video
- "כש־Mogi תציג תחזית, היא תשתמש רק בנתוני התחזית שבנק ישראל מפרסם (החלטה של Mogi, שיעור 3.8)" → "(החלטה של Mogi: אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08)".
- The video is "כ־4 דקות" (4:01); AUTHORING asks for 2–3 minutes. Record the exception, or trim.

### 4.15 — סדנה: דף ההיתכנות של התיק המרכזי

**Verification.** The must-fix 4.15-1 is fixed: assumption (2) says the case has no appraisal, so price and appraisal are one number, and "אם שמאות תצא נמוכה מהמחיר, שיעורים 4.9 ו־4.11 לימדו, לפי תקציר של מקור רשמי (לא אומת), שמודדים מול הנמוך מבין השניים"; part 3 applies it; the slider is "שמאות, אם תהיה נמוכה מהמחיר" and starts at the price. All should-fix items are fixed except one half of 4.15-1's companion (4.15-a): 4.15-2 (a caption under the seven-row table and in the sheet's header, "הגבולות לפי תעתיק… לא אומת", and "תקרה (לא אומת)" instead of "איסור"); 4.15-3 ("ההלוואה גדולה מדי ב־27,500 ₪: צריך הון עצמי גדול יותר או הלוואה קטנה יותר"); 4.15-4 (step 5: "ההלוואה היא הערך היום של כל התשלומים: ההחזר כפול סכום גורמי ההיוון (שיעור 3.1)", and "מספיק להלוואה של"); 4.15-5 (the paragraph before exercise 4 no longer prints 8,100; `unit="תשלומים"`; errors 26, 9 and 18); 4.15-6 ("אלה כל הנתונים של התיק"; "ארבעה דברים שאתם מזיזים"); 4.15-7 (the built page ends with "סוף השלב" and the stage-4 check). The nits of 4.15-8 are fixed (the final page is a stack of cards; row 1 names both the Mogi decision and the transcription), except `minutes: 45` (see C-4). **Case A follows the house rule**: only the map's numbers (price, equity with its 200,000 ₪ gift, the loan, the incomes, the car loan), no track, mix or offer, every payment-to-loan step under "הנחה של הקורס: 360 חודשים, ושלוש ריביות — 4%, 4.5% ו־5%… לא ריביות של בנק ולא תחזית", and the 40.4% appears nowhere on the page.

**Recomputed** (exact present value, then to the agora): 21,700 / 20,250 / 8 / 21,700; 10,125 and 8,100, after the car loan 10,850 and 8,680; 74.55%, 1,650,000, room 10,000, 2,186,666.67, 13,333.33; at 2,150,000: 76.28%, 1,612,500, 27,500; 1,093,333.33 / 546,666.67; the loans 8,100 carries 1,696,636.05 / 1,598,625.39 / 1,508,881.10 and 10,125 carries 2,120,795.06 / 1,998,281.73 / 1,886,101.37 at 4 / 4.5 / 5%; 8,680 carries 1,713,094.86 and 1,616,924.44; the payment 1,640,000 needs is 7,829.61 / 8,309.64 / 8,803.87 (breakeven 4.2835%, so "בהנחה גבוהה מספיק הוא מעליו" holds); 41,374.61; רונית ואלון 1,100,000 / 16,000 / 8,000 / 6,400 / 73.33% / 1,125,000 / 25,000 / 1,263,111.42 / 163,111.42. All hold (but see 4.15-c on the last agora).

#### 4.15-a · should fix · "אילון אמר" for a speaker the source says is unclear (first-round 4.11-4, 4.15 half)
- **Where:** assumption (2): "**אילון אמר** שמודדים ״מול השמאות״ (2026-08-05; בהקלטה לא ברור מי הדובר…)"; exercise 6's solution: "**אילון אמר** ״מול השמאות״, והתקציר אומר ״הנמוך מבין השניים״".
- **Problem:** the sentence names Eylon and then says the speaker is unclear; 4.9, 4.11 and card 11 were rewritten to "נאמר בפגישה ב־2026-08-05 (בהקלטה הדובר מעורב: אילון או טובי זמיר)".
- **Fix:** the same wording here, in both places.

#### 4.15-b · should fix · exercise 3 is graded on the 18-payment edge that 4.2 refused to grade
- **Where:** חלק 1, exercise 3: "כמה תשלומים עוד צריכים לשלם… עד שהיא מפסיקה להיספר?", answer 8, `tolerance={0} near={0}`, with 9 listed as "תשלום אחד יותר מדי". The solution itself: "על הקצה: בדיוק 18 לא נספר לפי התעתיק… שאלה פתוחה לאילון, והיא לא משנה את התשובה כאן אלא תזיז אותה בתשלום אחד."
- **Problem:** 4.2 (after its first-round fix 4.2-4) asks only for the certain case, 17 left, "ב־18 בדיוק — שאלה פתוחה, ולכן לא שאלנו עליו". The workshop then marks 9 wrong although 9 is the right answer under the other reading the lesson itself presents. The last clause of the solution ("לא משנה את התשובה כאן אלא תזיז אותה") contradicts itself.
- **Fix:** ask "אחרי כמה תשלומים היא כבר לא נספרת לפי התעתיק (״מעל 18״)?", or accept 9 with the message "אם ״18 בדיוק״ נספר (שאלה פתוחה), זו התשובה; לפי התעתיק — 8"; and the solution: "אם 18 בדיוק נספר, התשובה היא 9".

#### 4.15-c · nit · the page's maxima are rounded half-up, its own source says "כלפי מטה"
- **Where:** Sources, "הנחת חישוב": "…מעוגל כלפי מטה לאגורה בכל מקסימום"; the printed loans: 1,598,625.39 (exact 1,598,625.3880), 1,696,636.05 (…0477), 1,508,881.10 (…0981), 2,120,795.06 (…0596), 1,616,924.44 (…4360), 1,263,111.42 (…4177).
- **Problem:** by 4.4's rule ("סכום מרבי מעוגל תמיד כלפי מטה") each is one agora too high. Harmless for the answers (`tolerance` 0.05), but the page says one thing and prints another.
- **Fix:** floor the six `carry` facts, or say "מעוגל לאגורה הקרובה" in the source.

#### 4.15-d · nit · "יקר לבנק" as the meaning of the capital line
- **Where:** the final page: "יקר לבנק, לא איסור"; part 2: "מותרים, אבל יקרים לבנק"; video "מעל הסף מותר, ויקר לבנק."
- **Fix:** "הבנק מחזיק יותר הון", the wording 4.4 and 4.5 use (see 4.5-b).

### The stage-4 check (`/checks/4/`)

**What I checked.** All 24 questions against `check-4.json`, `checks/4.mdx` and my own Decimal code: 30% (70 / 450,000); 2,507.83 in month 150 (the prime track ended at 120; errors 4,745.70 and 2,237.86); 10,592 (nets 10,274 / 11,026 / 10,476); 14,950 (14,080 / 18,250 / 16,100); 34.15% (27.81 / 25.37 / 32.56); 4,313.14 on 276 months (2,880 / 4,125.58); 1,645,000 (1,762,500 / 1,175,000); 8,000.40 against 8,000, over by 0.40; 1,860 (2,790); 5,350 (6,600 / 8,400); 19.63% (12.59 / 24.42 / 80.37); 1,036,000 (against 1,110,000); 552,605.93 after 96 payments, each track its own statement schedule (339,401.43); 4,401.15 (3,699.43); 44,757 (149.19 × 300; 65,625); 4 children (2 / 7); 141.25 (4,148.11 − 4,006.86; 143.47); 1,211,797.52 (1,514,746.90 / 1,302,583.65 / 2,210,400). Every answer and listed error is right, and every printed equality holds, except one agora in 4-a.

**What holds.** Every lesson of 4.1–4.15 has at least one question (4.3, 4.4, 4.5, 4.7 and 4.12 two). Every numeric question uses new inputs; none repeats a lesson's example or exercise. The four earlier-stage questions are right and new: 0.10 (points against percent: 0.6 point = 12.5% of 4.8%), 1.4 (a track's share), 2.2 (fixed linked: the rate is fixed, the debt and the payment move), 3.7 (the mix cash flow in month 150, after the shorter track ended — a good trap, and fair). The intro lists which official rules are unverified, says 329 or 203 is not settled, says bank behaviour is not known, and keeps case A out ("אף שאלה לא משתמשת בתיק של נועם ושירה"). The seven choice questions are shuffled per question and **no right option is the longest** (I measured each: the right one is within a few characters of the others, and shorter than at least one in six of seven). The labelling question (18) teaches the right label for a form record ("לא אומת"), not "עובדה מאומתת".

#### 4-a · nit · question 4's error and explanation use a month-1 sum that breaks the statement rule by an agora
- **Where:** question 4 (3.7), the error `r4.month1` = 4,745.70 and the explanation "בחודש הראשון שני המסלולים משלמים יחד 4,745.70 ₪".
- **Problem:** the fact sums the two *unrounded* payments (2,507.8318 + 2,237.8637 = 4,745.6955). The course's rule since stage 3 is each track rounded, then summed: 2,507.83 + 2,237.86 = 4,745.69. The error still fires (default tolerance 0.05), but the explanation prints a sum a learner cannot rebuild from the two payments.
- **Fix:** make `r4.month1` the sum of `r4.t1` and `r4.t2` (4,745.69).

#### 4-b · nit · "מגבלת ההון" in the check, and two small wordings
- Questions 11, 12 and 24 and the intro call the 40% line "מגבלת ההון" in running text ("זו מגבלת ההון", "ההחזר במגבלת ההון"); same cause as 4.4-b.
- Question 12: "בכמה שקלים בחודש **רחב טווח** ההחזרים…" → "כמה שקלים בחודש יש בטווח ההחזרים שבין סף ההון לתקרה?".
- Question 17: "היתרה מחושבת כמו בדף של בנק" (see 4.9-a) → "…כמו בלוח של שיעור 3.2: ההחזר נקבע פעם אחת, והריבית מעוגלת לאגורה בכל חודש".

---

## Part B: series consistency, end to end

| Thread | Where | Holds? |
|---|---|---|
| Case B, אבי ומיכל | 4.1 → 4.2 → 4.3 → 4.7 → 4.8 → 4.9 | **Yes.** 11,000 + 8,200 = 19,200 declared; 7,500 (average) or 8,000 (latest) + 8,200 = 15,700 / 16,200; net-to-pay 15,250; Michal's loan 400 ₪ × 10 not counted; price 1,650,000, equity 520,000, loan 1,130,000, two half tracks 3,172.61 + 3,013.56 = 6,186.17 ("הנחת חישוב של התיק"); ratios 32.22 / 38.19 / 39.40 / 40.57% (4.3), 32.2 / 39.4 / 40.6% at one decimal (4.7, said so); 68.5% on the price, 72.4% on the 1,560,000 appraisal (4.9). The map's 68.5% and 32.2% match. |
| Case A, נועם ושירה | 4.2, 4.13, 4.15, the check's intro | **Yes.** Only the map's numbers: 2,200,000 / 560,000 (200,000 gift) / 1,640,000 / 74.55% / 12,400 + 9,300 / car 1,450 × 26 / one child. No track, mix or offer anywhere; 4.3, 4.10 and 4.11 say "תרגיל נפרד, לא התיק של נועם ושירה"; the 40.4% appears in no built page of stage 4; 4.15's payments are "הנחה של הקורס". |
| The canonical 40% wording | 4.4, 4.5, 4.6, 4.7, 4.10, 4.12, 4.15, cards 1–3, 7, 15, 17, map `capital_threshold` and `capital_requirements`, the check's intro and questions 11, 12, 24 | **The sentence is used, word for word, everywhere the 40% line is introduced.** The noun it carries, "מגבלת ההון", then runs through the stage as the line's name, against 4.5's own distinction (B-1). |
| "Up to four banks" | 4.11, 4.12, 4.13 (body and Sources), cards 19 and 22 | **Yes**: "הנחת מודל התיק, לא החלטה על בחירת בנקים", "כמה בנקים בפועל — פתוח". |
| The pricing tower | 4.12 body, tower note, five questions, summary, Sources; map `offered_rate` | **Yes**: "הדרך של הקורס… אף בנק לא פרסם שהוא מתמחר כך". |
| Price against appraisal | 1.2 → 4.4 (V "שאלה פתוחה") → 4.9 (the summary rule, "לפי תקציר, לא אומת") → 4.11, cards 2, 3, 11 → 4.15 (assumption (2), part 3) | **Yes, as an open question with a labelled working rule.** Card 2 marks it open; card 11 keeps the conflicting field claim and the transcription's "ברירת המחדל היא המחיר" beside it. Only the speaker of FK-H-005 is still named outright in 4.15 (4.15-a). |
| The 18-month rule and its edge | 4.2 (open, not graded) → 4.3, 4.6, 4.10, 4.13 (the two forms' wording), 4.15 | **Mostly.** The rule and the open edge read the same everywhere, but 4.15's exercise 3 grades the edge (4.15-b), and 4.2's video settles it (4.2-a). |
| Same-property rule | 4.2, 4.3, 4.14, card 7, map | **Yes**: from 1.10.2026, "לפי התעתיק; לא אומת", the circular unopened. |
| Prime = Bank of Israel + 1.5 | 4.12, 4.14, the check (question 23) | **Yes**, "(לא אומת)" at each use, dated 9.10.2026 where it is said to hold. |
| Credit data at the pre-approval | 4.7 → 4.8 → card 8 → card 19 → map | **Yes** in the body ("שני התיאורים… לא מתיישבים עד הסוף"; "בטפסים של שניים מארבעת הבנקים"); the 4.8 summary drops the hedge (4.8-a). |
| Children's age in the forms | 4.6, 4.10 (summary, card 14), 4.13, map `family`, check question 22 | **Yes**: two forms to 18, one to 21, one with no age. |
| Letters | P, V, C, Y, O, T, L, A, s, r | **Mostly.** T is the living budget only (4.9 now writes "התקרה"); but C max has two formulas (4.6-a), and Y is glossed as "yield" (4.6-b). |
| "בשיעור הבא" lines | 4.1 → 4.15 → the check | **Yes**: each quotes the next lesson's map title; 4.15 ends with "ומכאן — בדיקת הסיום של שלב 4", and the built button is "סוף השלב". |
| Terms before their lesson | `<Later>` for 4.3, 4.4, 4.5, 4.7, 5.1, 5.2, 8.17 | **Yes**, except one non-quiet note that repeats its sentence (4.1-b) and "מדרגות" in 4.5 (4.5-c). |

#### B-1 · should fix · "מגבלת ההון" against "סף הון" — one shared string, many pages
- **Where:** the canonical sentence's noun, used as the running name of the 40% line in 4.4 (checker, steps, exercise 3, summary), 4.5 (the ladder, the case table, the worked example, exercise 5), 4.6, 4.7 (table rows, the "three kinds" callout), 4.10, 4.12 (the tower scenario "יחס ההחזר עובר את מגבלת ההון"), 4.15 (the final page), the check (intro, questions 11, 12, 24).
- **Problem:** 4.5 teaches three kinds of number by their names, "מגבלה רגולטורית" (a ban) and "סף הון" (allowed, more capital), and its CardSort grades the sort. Then nearly every later sentence calls the threshold a "מגבלה". A beginner who learned 4.5 well reads "מעל מגבלת ההון" as "over a ban", and the check's question 11 asks them to tell "סף הון" from "מגבלה רגולטורית" while its own prompt says "מגבלת ההון (40%)".
- **Fix (coordinator, one shared string and a search-and-replace):** "סף ההון (40%) — לפי תיעוד הצוות, לא אומת; ההוראה שנושאת אותה לא נקבעה (329 או 203)", and "סף ההון" in running text. Details at 4.4-b and 4.5-a.

#### B-2 · should fix · invented names reused, one of them inside case B's own stage
- **Where:**
  - **מיכל** — case B's Michal runs through 4.1–4.9; 4.14's worked example is **מיכל ויורם**, another couple, five lessons later.
  - **עומר** — **הדס ועומר** (4.2) and **מאיה ועומר** (4.9); הדס is also 3.5's borrower, מאיה 1.3's and 2.7's.
  - **תמר** — **רוני ותמר** (4.2) after **תמר ועידו** (3.12).
  - **גלית** (4.1, exercise 2) after גלית of 3.6; **יעל** and **יואב** in the check (questions 5 and 14) after יעל of 2.10 and 3.9 and יואב of 1.9 and 2.5; **רונית ואלון** (4.15) after רונית of 0.1 and אלון of 3.11.
- **Problem:** the course trains the reader to follow people across lessons; stage 3's second read made the same item a should-fix (its B-3). A second Michal next to case B's is the one that will actually confuse.
- **Fix:** at least rename 4.14's couple (e.g. "שקד ויונתן"; check they are unused) and 4.9's (e.g. "ליאת וגיא"); the rest when convenient.

---

## Part C: labels and invention across the stage

**What holds.**
- **No "עובדה מאומתת" anywhere in stage 4.** The 22 cards carry 62 "לא אומת", 43 "ידע מהשטח", 20 "מחקר / הצעה", 8 "החלטה של Mogi" and 5 "הנחת חישוב" labels, and none is "verified". Lessons 4.10 (the label table and exercise 6), 4.11 (the MatchTable) and the check (question 18) teach the reader to refuse the label.
- **Official rules are unverified and dated** in the body and in Sources: directive 329's four bans (2026-10-09), the 40% line in the canonical wording, appendix A's 18-month rule, the same-property circulars, directive 451 §§4ג, 9(ה), 10, 11 and the 2026 temporary directive, the credit-data law (2026-10-09/10), the cheque rule, the rate decisions (search of 2026-10-10, one decision from one summary), prime + 1.5 (as of 9.10.2026).
- **Bank forms** are "כפי שתועד בריפו של הצוות ב־2026-08-25; לא נבדק מחדש מול האתר של הבנק", in the body of 4.1, 4.2, 4.5, 4.6, 4.8, 4.10, 4.13 and on the cards; real bank names appear only in 4.13 (page and video), as text with no logo; the cards, the map and the check say "בנק אחד", "בנק א׳".
- **Field knowledge** names who and when and "ממתין לאישור אילון" in the sentence, and Tobi Zamir's single-source status is said wherever he is the source; the stage-4 section of `research/eylon-list.md` exists, lists every FK id the stage uses with "איפה בקורס", and collects the open questions (first-round X-5, X-7, X-10 fixed).
- **Mogi decisions** carry "אילון אישר ב־2026-10-07, עדן קיבל ב־2026-10-08" (or "אילון, 2026-08-03", "צוות Mogi, 2026-08-31"), except three places (4.2-c, 4.14-c, card 22's "היום").
- **The gaps of source-map §3.1 stay gaps**: how a bank prices, what a credit report disqualifies, how many months of an account are read, self-employed income, step durations, bank preferences, the 40% band's price effect. Each is "לא ידוע" in the text and an open question on the Eylon list.
- **No internal ID in body text, cards' bodies, map labels, exercises or videos.** I scanned the visible text of all sixteen pages outside "מקורות" and the cards' source panels for ENG-, J-codes, FK-H-, "Brain", page numbers, repo paths and the builders' names, and every MDX line before `<Sources>`: nothing, except the question numbers of 4.10-a. The sources sections still show repo paths and page numbers (`research/notes/…`, `context/inputs`, `scripts/case_sketch.py`, "Eden ושל Claude בתוך ENG-223" in 4.3), which the brief allows there; first-round X-8 asked to move them to the MDX comment, and that was not done (nit).

**What crosses the line** (all listed in Part A): price or cost effects stated flat (4.5-b "ויש מחיר", 4.4-d, 4.15-d); bank practices stated flat in a summary or a map card (4.8-a, 4.11-b, 4.11-c, 4.14-b); a course assumption stated flat in a video (4.1-a, 4.2-a, and 4.3's whole video); one stage-3 rule re-generalised (4.11-a).

#### C-1 · should fix · in the lessons' choice exercises the right option is still usually the longest
- **Where:** 26 of the 37 `ChoiceExercise`s of 4.1–4.15 have the right option strictly longer than every wrong one (measured on the source text, placeholders counted as four characters), several by a factor of two or more: 4.4-5 (91 against 37), 4.5-5 (66 against 19), 4.6-1 (82 / 36), 4.10-6 (89 / 40), 4.11-1 (110 / 52), 4.12-8 (149 / 62), 4.15-5 (99 / 36).
- **Problem:** stage 3's second read made this a should-fix (its C-2). The shuffle is now in `ChoiceExercise` (positions vary), and the check is clean (no right option is the longest), but a learner trained on the lessons still learns "pick the longest", and the check then punishes it.
- **Fix:** trim the right option, or lengthen the wrong ones, in at least the seven listed; a lint in `check:terms` (right option no more than 1.3 × the longest wrong one) would hold it.

#### C-2 · nit · the sources sections still show repo paths and internal page numbers (first-round X-8)
- Allowed by the brief, but the first round asked for "רישום פנימי של הצוות" in place of `research/…`, `context/…`, `scripts/…` and for "Eden ושל Claude בתוך ENG-223" (4.3) to leave the learner's list.

#### C-3 · nit · lesson and video lengths
- `minutes: 35` (4.3) and 45 (4.15) against the map's 15–30; the 4.14 and 4.15 videos are about 4 minutes against AUTHORING's 2–3. Trim, or record the exception (who and when).

---

## Part D: the phone

I cut each `phone_lessons_4-*_.png` and `phone_checks_4_.png` (390px, 2026-10-16 08:05, from the 08:02 build) into strips and read every table, formula box and component. No page scrolls sideways. **The first-round FillTable cause (FillTable-1, X-1 of 4.6–4.10) is fixed**: the wide fill-in tables of 4.3, 4.6, 4.8, 4.9 and 4.10 now stack into one card per row, every blank visible and full width. Also fixed: 4.1's payslip table (four columns) and "הכנסות אחרות" (blocks), 4.2's worked table, 4.5's three kinds (cards), 4.12's six components (cards), 4.14's chain (cards) and decisions table (payment second), 4.15's final page (cards); the checkers keep a sticky result line on the phone (Checkers-1); Prediction, FactorCards, BigPictureMap and ChoiceExercise carry the component fixes (focus, scroll-into-view, `BidiText`, a single "נכון.").

#### D-1 · should fix · three formula boxes are drawn out of order (4.4, 4.5, 4.9)
- **Where:** `4-4.mdx:202–203`, `4-5.mdx:221`, `4-9.mdx:226`: `<p><span class="ltr">C<sub>max</sub> = </span>הכנסה פנויה<span class="ltr"> × </span>הקו<span class="ltr"> ÷ 100</span></p>` (and the P max line the same way).
- **Problem:** in an RTL paragraph each `ltr` piece keeps its inner order but the pieces run right to left, so the phone shows "÷ 100הקו × הכנסה פנויהC<sub>max</sub> =": the "=" stands outside C<sub>max</sub>, "100" touches "הקו", and "÷ 100" sits at the far left. Read either way, the box does not say "C max = הכנסה פנויה × הקו ÷ 100". The markup is the same at every width, so the desktop has it too. 4.7's box (`<span class="ltr">C<sub>max</sub></span> = ההכנסה × התקרה ÷ 100`, plain RTL around one LTR symbol) reads correctly and is the pattern to copy.
- **Fix:** write each line as 4.7 does: only the symbol in `ltr`, the operators and Hebrew words in the RTL flow ("<span class="ltr">C<sub>max</sub></span> = הכנסה פנויה × הקו ÷ 100"), or put the whole equation in one `ltr` block with the Hebrew words inside `<bdi>`.

#### D-2 · should fix · 4.3's two reading tables still hide their numbers (first-round 4.3-6, not fixed)
- **Where:** the same-property table ("איך סופרים את המשכנתא הקיימת · יחס ההחזר") and the אבי ומיכל table ("איזו הכנסה סופרים · הכנסה בחודש · יחס ההחזר").
- **Problem:** at 390px the first shows only its label column; the second shows the labels and a lone "₪" at the edge. The ladder 32.22% → 40.57%, the lesson's point, is off screen behind the "יש עוד עמודות משמאל" hint.
- **Fix:** as the first round wrote: number column first, short labels; or stack them as 4.12's components are.

#### D-3 · nit · two more tables put the column the text talks about off screen
- 4.7's cap table "הלוואה מרבית לפי יחס ההחזר בלבד": the column "על ההכנסה המאומתת" (1,433,000 / 1,147,000 / 1,003,000, the figures the next paragraph discusses) is cut at the left edge; and the four-answers table loses its third column ("איך זה נראה אצל אבי"). Put the verified column second, or stack.
- 4.8's StatementReader table hides "חיובים" and "יתרה בסוף החודש" (the hint is shown; the card under it gives the lowest balance, so this is minor).

#### D-4 · nit · spreadsheet and calculator formulas break across lines in 4.15
- "איך מחשבים": "=PV(rate/12, months, -" / "payment)" and "(1 − (1 + r)<sup>−n</sup>) ÷ r" wrap mid-formula and lose their order at the line break. Use the `inline-block whitespace-nowrap` that 3.12 uses for formulas in prose.

---

## Count

| Severity | Items |
|---|---|
| must fix | 0 |
| should fix | 21 — 4.1-a, 4.2-a, 4.3-a (five first-round items), 4.4-a, 4.5-b, 4.6-a, 4.6-b, 4.8-a, 4.10-a, 4.11-a, 4.11-b, 4.11-c, 4.14-a, 4.14-b, 4.15-a, 4.15-b, B-1 (with its places 4.4-b, 4.5-a, 4.10-b, 4-b), B-2, C-1, D-1, D-2 |
| nit | 30 — 4.1-b, 4.1-c, 4.2-b, 4.2-c, 4.3-b, 4.4-c, 4.4-d, 4.5-c, 4.6-c, 4.6-d, 4.7-a, 4.7-b, 4.8-b, 4.9-a, 4.10-c, 4.11-d, 4.11-e, 4.12-a, 4.12-b, 4.13-a, 4.13-b, 4.14-c, 4.15-c, 4.15-d, 4-a, 4-b (wording), C-2, C-3, D-3, D-4 |

## First-round items: what is fixed, and what is not

The first round had **26 must-fix** items (4.1–4.5: 6; 4.6–4.10: 14; 4.11–4.15: 6; components: 0) and **116 should-fix** items (27; 36; 44; 9). I checked each against the current page, component or data file.

**All 26 must-fix items are fixed.** So are the nine components items (FactorCards-1, BigPictureMap-1 and -2, Prediction-1, ChoiceExercise-1 and -2, FillTable-1, VerifiedGap-1, Checkers-1).

**Should-fix items not fixed (7):**
- **4.3-3** — the grace example still hides the 288 months (5,684.25 against 5,558.32 on 300).
- **4.3-4** — 4.3's video states the grace, bullet and same-property rules with no "לא אומת" (not re-rendered since 2026-10-12 10:50).
- **4.3-5** — "מחזור חלקי" undefined; "גרייס", "בוליט", "בלון" without `<Term>`.
- **4.3-6** — on the phone, the same-property table and the אבי ומיכל table still hide their ratios (D-2).
- **4.3-8** — exercise 6 still asks for 38.19%, printed in the table above.
- **4.3-9** — "והמפקח לא מפרסם דוגמה מחושבת של היחס" is unchanged.
- **4.10-8** — "(שאלה N בשאלון)" in nine card sources (4.10-a).

**Should-fix items fixed only in part (6):**
- **4.1-2** and **4.1-4** — fixed on the page; the 4.1 video (rendered before the report) still says "החישוב ממשיך מהמספר הנמוך" and never glosses "שומה" (4.1-a).
- **4.2-3** and **4.2-4** — fixed on the page; the 4.2 video still settles the 18 edge and the moving-out rent (4.2-a).
- **4.10-12** — fixed in card 4; the map still says "הבנק מעדיף תיקים גדולים" (4.11-b), and 4.14 repeats it (4.14-b).
- **4.11-4** — the speaker caveat is in 4.9, 4.11 and card 11; 4.15 still writes "אילון אמר" (4.15-a).

**First-round nits not fixed that this report raises again:** X-9 of 4.1–4.5 (the December 2025 relief "נקבעה לצמיתות", now a should-fix because it contradicts 4.4: 4.14-a), 4.2-7 (half: the reason line), 4.3-10, 4.5-4's popover, 4.6-8, 4.7-14's phone table (D-3), X-8 (repo paths in Sources, C-2), X-8 of 4.11–4.15 (lesson lengths, C-3). First-round question X-11 (naming Tobi Zamir, a banker outside the team, in a public course) is still open; the lessons name him in full in 4.5, 4.7, 4.9, 4.11, 4.12, 4.14 and the cards. It needs an answer from the coordinator, not a text fix.

**What the fixes brought in.** Four new problems came with the rewrites: the callout in 4.4 now prints "666,666.67…" for the endless value (4.4-a: a formatter rounds the fact); the canonical 40% sentence made "מגבלת ההון" the line's running name across the stage (B-1); 4.15's exercise 3 grades the 18 edge that 4.2 was rewritten not to grade (4.15-b); and the new formula boxes of 4.4, 4.5 and 4.9 are drawn out of order (D-1). No fix introduced a wrong number: every figure on the sixteen pages, every exercise answer and listed error, every card example, the components' defaults and the check recompute in Decimal with my own code and hold on the printed numbers, apart from the agora-level points in 4.4-a, 4.7-a, 4.15-c and 4-a.

## Verdict

**Stage 4 can close after these fixes.** Nothing is blocking: every first-round must-fix is fixed, the math is sound, case A stays inside the map's numbers with no track, mix or offer, case B carries the same numbers through 4.1–4.9, nothing is labelled verified, the canonical 40% sentence is used everywhere, "up to four banks" is a case-model assumption, the pricing tower is the course's own arrangement, price against appraisal stays an open question with a labelled working rule, and no internal id reaches body text, cards, map, exercises or videos.

What should be done before release, in the order I would do it:
1. **Lesson 4.3**, the one lesson the first round's fixes mostly missed: the 288 months, `<Term>` and "מחזור חלקי", exercise 6, the Supervisor sentence, the phone tables, and a re-rendered video with its label (4.3-a, D-2).
2. **The three videos rendered before the first-round report** — 4.1, 4.2 and 4.3 — each needs one or two cues changed and a render (4.1-a, 4.2-a, 4.3-a).
3. **B-1**, one shared string: "סף ההון (40%)" in place of "מגבלת ההון (40%)", so 4.5's three kinds of number survive the rest of the stage.
4. **D-1**, three formula boxes that read out of order on every screen, and **4.4-a**, the "666,666.67…" that defeats its own callout.
5. **The label leaks**: the price effect in 4.5's head tool (4.5-b), the bank practices in 4.8's summary (4.8-a), Tobi's own preference turned into the bank's (4.11-b, 4.14-b), the monthly targets (4.11-c), the "always interest first" rule re-generalised (4.11-a), the relief "לצמיתות" (4.14-a), and "אילון אמר" in 4.15 (4.15-a).
6. **4.15-b** (an exercise graded on an open edge), **4.10-a** (question numbers on nine cards), **4.6-a/b** (C max and "yield"), **B-2** (a second Michal) and **C-1** (right options that are still the longest).

The rest is polish. The stage is sound as a path: recognised income (4.1) → obligations and the 18-month rule (4.2) → the payment ratio (4.3) → directive 329's lines (4.4) → three kinds of number (4.5) → the family's own line (4.6) → underwriting (4.7) → credit data and the account (4.8) → the collateral (4.9) → the factor cards (4.10–4.11) → how a bank prices, as far as anyone knows (4.12) → what the four forms ask (4.13) → the market, dated and never a forecast (4.14) → case A's feasibility page against the limits only (4.15) → a check that is answerable from the lessons and cannot be passed by option length.
