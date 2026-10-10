# Stage 3, second read: lessons 3.1 to 3.12 and the stage-3 check

Date: 2026-10-10. Reviewer: second-round QA, reading as one beginner who finished stages 0–2, from 3.1 to the check in order. I edited no lesson, component, data or research file and used no git; this report is the only file I wrote. It was written in parts, one lesson at a time.

**What I read:**
- the visible text of every built page (`dist/lessons/3-*/`, `dist/checks/3/`, built 14:11, after the last MDX change at 14:09 and the data rebuild at 14:11);
- the twelve MDX files and `src/pages/checks/3.mdx` (last changed 11:39), including exercise `errors`, FillTable configs and component props;
- the subtitles `public/video/3-1.he.vtt` and `3-11.he.vtt` and the key frames `qa/video/3-1-t*.png`, `3-11-t*.png` (both videos re-rendered at 14:03–14:05, after their scenes changed);
- `data/lessons/3-*.json` and `check-3.json`, with an independent recomputation in Python `Decimal` (my own code; nothing imported from `src/`);
- the phone screenshots `qa/screens/phone_lessons_3-*_.png` and `phone_checks_3_.png` (taken 14:13, after the build), cut into strips;
- `course/AUTHORING.md`, `research/eylon-list.md`, `src/components/big-picture/stage-3.ts`, the three first-round reports (`stage-3-review-3.1-3.6.md`, `stage-3-review-3.7-3.12.md`, `stage-3-components.md`) and `stage-2-second-read.md` (its format).

**How the report is laid out.** Part A goes lesson by lesson: each section opens with the verification of the first-round must-fix and should-fix items (fixed, or not, with the quote) and the numbers I recomputed, then lists what is new or left. Part B is series consistency, Part C reliability and causes that repeat across lessons, Part D the phone; the count and the verdict close it.

Severity: **must fix** (a beginner learns something false, or cannot go on), **should fix** (a beginner is likely to be confused or misled; fix before release), **nit** (polish). Quotes are from the built page unless an MDX line is given.

---

## Part A: lesson by lesson

### 3.1 — מאיפה בא החזר השפיצר

**Verification.** All three should-fix items are fixed. "באמצע" is gone: "ניסיון 3: לא באמצע, אלא לפי היחס" now shows the interpolation from facts (20 × 30.20 ÷ 40.20 = 15.02; 1,000 + 15.02 = 1,015.02), with "כל שקל נוסף בתשלום מזיז את הסוף באותו סכום (חוץ מאגורות של עיגול)". The callout is now "למה התשלום האחרון שונה מעט", and says 1.94 ₪ is "חלק של אגורה בכל אחד מ־240 התשלומים, עם הריבית עליו". The two algebra steps are taught: "כמו 3 × 5 − 3 × 1 = 3 × (5 − 1)" and "כמה רבעים יש ב־20? … 20 ÷ (1 ÷ 4) = 20 × 4". Every nit is fixed too: the formula box is one `whitespace-nowrap` line; "מתרגיל 4 צריך מחשבון"; exercise 2 has the 20.00 error and "(או התשלום עצמו)"; exercise 6 has the n = 25 error (95,285.30); the negative-balance sentence above the illustration; "הם רוצים לבדוק בעצמם את ההחזר החודשי שבהצעה"; "אפס חלקי אפס, שאין לו ערך"; "ונכיר את ״בונה לוח הסילוקין״ של הקורס"; the Mogi decision is now tied to a sentence in the five questions, and 2.9 now reads "מההצעה או ממחשבון", so the quote matches. The video (re-rendered 14:05) says "שילמתם", shows "S = 0.01970395 ÷ 0.01 = 1.970395" before the general formula, and writes "r = 0.004", "n = 240" and "1 − 1.004^−240" on three lines; every number in the 22 frames matches its fact, nothing is clipped, the bottom band is clear.

**Recomputed** (Decimal, statement convention for tables): 1,020 / 30.20; 1,000 / −10; 15.02 → 1,015.02 → 1,004.98 / 10.05 / 0.01; 0.99009901 + 0.98029605 = 1.97039506; 2,000 ÷ 1.97039506 = 1,015.02; 0.99502488 + 0.99007450 + 0.98514876 = 2.97024814 → 20,200.33; 154.09330295 → 3,893.74; 1.004^240 = 2.60670013, 0.38362679, 0.61637321, 2,400 ÷ 0.61637321 = 3,893.74; last payment 3,895.68 (gap 1.94); trials 158,157.51 / −41,875.89 / 1.94 / −2.03 (3.97); bounds 2,500 / 2,400 / 4,900; נגה ואסף 3.56904580 / 0.28018693 / 0.71981307 / 1,912.50 / 2,656.94 / 744.44 / 1,500 / 3,412.50; the half table 0.99601594 / 0.99204775 / 0.98809536 × 10,080.11 = 10,039.95 / 9,999.95 / 9,960.11 = 30,000.01 (the success text says "עד אגורה" and why); exercises 10.10 (errors 0, 1,010, 20), 5,037.53 (5,000 / 5,050 / 5,025), 1,849.71 (12,600.65 / 15,557.35 / 105,000), 3,247.15 (27,636.72 / 21,601.67), 719,641.29 (1,200,000 / 95,285.30 / 88,888.73). All hold on the printed numbers.

#### 3.1-a · nit · "קצת מדי"
- **Where:** PredictionReveal, the note on 1,010 ₪: "…ולכן זה עדיין **קצת מדי**."
- **Problem:** "קצת מדי" is not Hebrew for "too little"; a reader stops on it.
- **Fix:** "…ולכן זה עדיין מעט מדי." (or "קטן מדי", as the other notes say).

#### 3.1-b · nit · the Mogi decision in the body has a date but no who
- **Where:** five questions, "איך משתמשים בזה בהחלטה?": "…לפי שיטת ההחזר של כל מסלול (החלטה של Mogi, 2026-10-08)."
- **Problem:** AUTHORING: Mogi decisions are marked "with who and when"; the sources item has both, the sentence has only the date. Same as stage 2's X-3.
- **Fix:** "(החלטה של Mogi: אילון אישר ב־2026-10-07, ועדן קיבל ב־2026-10-08)".

#### 3.1-c · nit · "שמונה ספרות", then seven
- **Where:** worked example steps 2–3: "1.00425<sup>300</sup> = **3.5690458**" and "1 ÷ **3.5690458** = 0.28018693"; the callout two sections earlier says "השאירו שמונה ספרות אחרי הנקודה בכל צעד".
- **Problem:** the fact is 3.56904580; the page's `dec()` strips the trailing zero. Harmless arithmetically, but the reader was just told to keep eight digits.
- **Fix:** print the factors with `f.raw(...)` as stored (eight digits), or say once "(אפס בסוף לא כותבים)".

### 3.2 — פירוק תשלום לקרן ולריבית

**Verification.** The must-fix item 3.2-1 is fixed well. The heading is now "בהלוואה ארוכה: כמה מהתשלום הוא ריבית"; the page derives "I₁ ÷ C = 1 − (1 + r)<sup>−n</sup>" from 3.1's formula, ties the half-way point to doubling (0.3), prints the threshold rates (4.63 / 3.47 / 2.78 / 2.31% for 15 / 20 / 25 / 30 years — I get the same from 12 × (2<sup>1/n</sup> − 1)), and shows the counter-case (600,000 ₪, 3%, 20 years: 1,500.00 interest against 1,827.59 principal). The summary, the reveal's first note and the five questions now carry the condition, and "what holds at every positive rate" is stated ("רכיב הקרן של החודש הראשון קטן מ־P ÷ n… ומשם הוא רק גדל"). Both should-fix items are fixed: the spreadsheet callout now says "אותיות העמודות בגיליון אינן האותיות של הנוסחאות", gives every column a formula (`=ROUND(B2*0.004,2)`, `=3893.74-C2`, `=B2-D2`, `B3 = =E2`) and closes the last row; on a phone the 3-month table is now month cards (`md:hidden`), each with all five values in the rules' order. The nits are fixed: "רכיב הקרן = C − I<sub>k</sub>" in the box, step 4's "0.4% × 1,493.74 = 5.97", exercise 4's 994.27 error, and the heading "כלל ה־72: מתי רכיב הקרן מוכפל".

**Recomputed:** the 3-month table (300 / 19,900.33 / 40,099.67; 200.50 / 19,999.83 / 20,099.84; 100.50 / 20,099.84 / 0, last payment 20,200.34; interest 601); the 20-year loan months 1, 2, 67, 68, 175, 240 (2,400 / 1,493.74; 598,506.26 / 2,394.03 / 1,499.71; 1,949.72 / 1,944.02; 1,941.95 / 1,951.79; 2,991.86; 15.52 / 3,880.16 / 3,895.68), totals 934,499.54 / 334,499.54, 1,493.74 × 1.004 = 1,499.71, 72 ÷ 4.8 = 15, doubling at month 175 (2,987.48 target); 30 years 3,147.99 / 747.99; הילה month 37 (324,675.50 → 1,136.36 / 749.94 / 323,925.56); the half table (360 / 29,880.32 / 60,119.68; 240.48 / 29,999.84 / 30,119.84; 120.48 / 30,119.84 / 0); exercises 1,000 (12,000), 432.49 (833.33), 998.27 (994.27), 698.27 at month 121 (183,555.79, 734.22), 179,748.54 (429,748.54; 429,747.00; the formula route 179,747.00 is within `near={2}`, as the solution says). All match.

#### 3.2-a · nit · "רוב התשלום בהתחלה הוא בכלל ריבית"
- **Where:** five questions, "איך זה משפיע עליכם?": "בהלוואה ארוכה באחוז כמו בדוגמאות של השיעור, רוב התשלום בהתחלה הוא **בכלל** ריבית."
- **Problem:** "בכלל" reads as "at all" or "in general"; neither is meant.
- **Fix:** drop the word: "…רוב התשלום בהתחלה הוא ריבית."

### 3.3 — יתרת החוב בכל נקודת זמן

**Verification.** All three should-fix items are fixed. The two divisions now print what the division gives: "S = 0.51254818 ÷ 0.004 = 128.137045" and "0.44228425 ÷ 0.00375 = 117.94246667" (a `shown_sum` fact), and the products on them still give 498,932.34 and 373,081.51. The reveal now says "הפרש של 1.19 ₪ מהלוח, מ־180 חודשים של עיגול". Exercise 5 is no longer a lookup: it asks for the principal repaid in the first ten years of the 250,000 ₪ loan (66,444.96 by the formula, 66,444.21 from the table, `near={2}`). The nits are fixed: the prediction option is "בערך 622,000" (a `floorThousands` rounding, so it no longer stands out), the heading is "היתרה בשפיצר מעל הקו הישר (באחוז קבוע, בלי הצמדה)", exercise 4's solution says "הפרש של 1.54 ₪". The 3.2-1 cascade is fixed here too: exercise 1's right option is now "יותר מחצי, כי בהתחלה רכיב הקרן קטן מהקרן חלקי מספר החודשים", and the "חצי מהזמן" paragraph says "בהלוואה הזו, ב־4.8% ל־20 שנה, בהתחלה רוב התשלום אפילו ריבית". The worked couple is now ענבל ורועי (cross-lesson X-6).

**Recomputed:** 5,053.78; 123.18508204 → 622,550.30 against the table 622,549.11 (1.19); 909,680.40; 0.99502488 + 0.99007450 = 1.98509938, 20,200.33 × 1.98509938 = 40,099.66 against 40,099.67; 1.004<sup>−180</sup> = 0.48745182; 0.51254818; 3,893.74 × 128.137045 = 498,932.34 against the table 498,933.29 (0.95) and the exact-payment formula 498,932.96; 233,624.40 paid, 101,066.71 repaid; the 5-year marks 498,933.29 / 370,513.81 / 207,338.76; first month under 300,000 is 148 (299,210.52); the straight line 450,000; ענבל ורועי 3,163.25, 156 left, 1.00375<sup>−156</sup> = 0.55771575, 117.94246667, 373,081.51 against the table 373,080.82, 265,713.00 paid, 126,919.18 repaid; the half table 10,125.31 × 2.97024814 / 1.98509938 / 0.99502488 = 30,074.68 / 20,099.75 / 10,074.94 (table 30,074.69 / 20,099.75 / 10,074.94); exercises 20,099.83 (error 20,200.33), 220,737.12 (164,050.60 / 200,000; table 220,737.66), 467,806.40 (300,000 / 740,750.20; table 467,804.86), 66,444.96 (171,898.80 / 183,555.04 / 100,000), 1,886.30 (S = 172.12314150; error 1,749.81). All hold.

#### 3.3-a · nit · the summary keeps the "תמיד" the heading dropped
- **Where:** summary: "**חצי מהזמן אינו חצי מהחוב:** בשפיצר היתרה **תמיד** מעל הקו הישר של קרן שווה."
- **Problem:** the first round's nit 3.3-5 was fixed in the heading and the body ("בריבית גדולה מאפס שלא זזה ובלי הצמדה"); the summary, which a learner rereads, states it without the condition. 3.5 then shows an indexed balance above the loan itself.
- **Fix:** "…בשפיצר, באחוז שלא זז ובלי הצמדה, היתרה מעל הקו הישר של קרן שווה."

#### 3.3-b · nit · exercise 5's balance was printed one lesson earlier
- **Where:** exercise 5 (מאתגר) asks how much principal of the 250,000 ₪ loan was repaid in ten years; 3.2's exercise 5 (same loan) printed "בתחילת חודש 121, היתרה היא 183,555.79 ₪".
- **Problem:** the formula route needs a step, but a learner who remembers 3.2 subtracts 250,000 − 183,555.79 and is done; the solution itself reuses the explanation's S ("ולכן אותו S"). It is honest, but it is the stage's second lookup-shaped מאתגר item in a row (3.2's exercise 6 is the other hard one).
- **Fix:** keep it, and label it בינוני; or ask for 12 years (144 payments left), which needs its own S.

#### 3.3-c · nit · the formula box splits after the bracket
- **Where:** formula box: "B<sub>k</sub> = C × (1 − (1 + r)<sup>−(n−k)</sup>)" on one line, "÷ r" on the next (the phone strip shows it).
- **Problem:** the same thing the first round flagged in 3.1 (3.1-4, fixed there): the first line reads as a whole formula. The summary writes it on one line and it fits.
- **Fix:** one line with `whitespace-nowrap`, as 3.1's box now does.

### 3.4 — לוחות של קרן שווה, גרייס ובולט

**Verification.** Both should-fix items are fixed: "g — אות חדשה בטבלת האותיות של הקורס, ומעכשיו היא תסמן תמיד חודשי גרייס"; the market claim is now a condition, "אם בחוזה הגרייס מתווסף לתקופה, n גדל ב־g", and the course default is badged as a Mogi decision with who and when in the sentence. The nits are fixed: the opening explains balloon ("לפי ההגדרה ששיעור 2.10 הביא, הוא אותה הלוואה כמו בוליט") and the two spellings; exercise 6 now gives the route without the builder ("מספר החודשים כפול ההחזר החודשי בשפיצר, פחות 150,000 ₪"), and its solution prints both answers (32,836.89 and 32,836.80) and says both are accepted.

**Recomputed** with my own six-method schedule (statement convention; grace inside the term; the payment after grace is the 3.1 payment on the balance, rounded once; the last month closes): Spitzer 3,893.74 / 3,895.68 / 334,499.54; equal principal 4,900 / 4,890 / 2,510 / 289,200; partial grace 2,400, 600,000 after 12, 1 − 1.004<sup>−228</sup> = 0.59754857, 2,400 ÷ 0.59754857 = 4,016.41, interest 344,541.47; full grace 602,400 / 2,409.60 / 629,442.14 (power 629,442.12), 29,442.14, 629,442.14 × 0.004 = 2,517.77, ÷ 0.59754857 = 4,213.50, interest 360,676.60; partial bullet 2,400 / 602,400 / 576,000; full bullet 1,564,020.10 (power 1,564,020.08), interest 964,020.10, 629,520.56 above Spitzer; the prediction 134,885.02 (130,000 / 133,822.56); גל ורותם 1,800 / 401,800 / 410,922.24 (power 410,922.23), 1,849.15 ÷ 0.65028538 = 2,843.60, 2,729.01, 114.59, 265,401.56 − 254,960.85 = 10,440.71; the half table (100 / 100 / 20,000 twice; 100 / 10,075.06 / 10,024.94; 50.12 / 10,075.06 / 0); exercises 1,900 (1,000 / 900 / 1,518.94), 1,981.73 (1,849.71 / 1,050), 206,075.51 (206,075.50; 206,000), 242,179.15 (242,179.18; 222,000 / 239,719.90), 32,836.89 (72,000 − 39,163.11; 1,576.36 × 120 = 189,163.20). All hold.

#### 3.4-a · nit · a claim about the directive's spelling, with no label
- **Where:** opening: "״בולט״ בכותרת השיעור הוא הכתיב של ההוראה של בנק ישראל; ״בוליט״ — של אפליקציית Mogi, וכך נכתוב כאן."
- **Problem:** this is the one non-math claim on the page without a source or a "לא אומת"; the sources list has no item for it. The official sites are blocked here, so the spelling was not read from the directive.
- **Fix:** "…הוא הכתיב בתעתיק של הצוות להוראה של בנק ישראל (לא אומת)…", and a `לא אומת` source item with the date of the transcript.

### 3.5 — הצמדה לאורך ציר הזמן

**Verification.** The two must-fix items and the cross-lesson X-1 are fixed at the cause: 3.5 now computes with the statement convention (indexed balance, interest and payment each rounded to the agora; payment = rounded C × M<sub>k</sub> ÷ M<sub>0</sub>; the last month closes), and a callout "עיגול, כמו בלוח של בנק" stands **before** month 1. The worked example now reads "1,211.70 × 100.4 ÷ 100 = 1,216.55", 4.85 more, principal 547.22, balance 250,452.78; exercise 7's solution reads "1,863.29 − 937.07 = 926.22" and 320,353.78. The walk-through holds on the printed numbers (399,977.95 × 100.5 ÷ 100.3 = 400,775.51; 400,775.51 − 1,227.54 = 399,547.97; 2,227.26 − 997.88 = 1,229.38; 399,150.41 − 1,229.38 = 397,921.03). The should-fix items: the heading is "עד ה־15, או מה־16 ואילך" and step 2 and exercise 6 say "מה־16 ואילך"; the illustration's monthly step is explained ("השורש ה־12 של 1.02, כמו בשיעור 0.4 — ולא 2% חלקי 12", 0.165% against 0.167%); the three-month table has no ₪ in the cells, `whitespace-nowrap`, and short headers (חודש · מדד · הצמדה · ריבית · תשלום · קרן · יתרה); X-2 is fixed (the box writes r, "זו ה־m משיעור 0.4"). The 240 × 6.66 item (3.5-4) is mostly fixed (see 3.5-b). Every nit is fixed: "I = r × B, כמו בשיעור 3.2"; the prediction's option "חודש אחד של מדד נכנס כבר לתשלום הראשון"; the "בדיקה" paragraph (398,781.61 × 100.3 ÷ 100 = 399,977.95); "המסלול של תרגיל 4 הוא ל־20 שנה, ב־3.5%"; "לא מה שצפוי לקרות" instead of "תחזית"; three guided tasks; "מה לקחת מזה" no longer in warning tone; the column-letter sentence.

**Recomputed** with my own linked statement schedule: 2,218.39; months 1–3 (401,200 / 1,200 / 1,003.00 / 2,225.05 / 1,222.05 / 399,977.95; 400,775.51 / 797.56 / 1,001.94 / 2,229.48 / 1,227.54 / 399,547.97; 399,150.41 / −397.56 / 997.88 / 2,227.26 / 1,229.38 / 397,921.03); unlinked 1,000 / 1,218.39 / 398,781.61, gap 1,196.34; index held at 100.3: 534,010.48 against 532,413.82 = 1,596.66 = 1,200 + 396.66, principal parts 401,200 (last payments 2,223.53 and 2,218.61); the slider at 2% (twelfth-root monthly index) 660.63 / 2,222.05 / 2,704.21 / 280,052.19 / 229,740.49 / 69,425.91, at 4% 400,583.66 / 390,831.61; dates and interim days (9, 11, 14, 16, 13; 18 from the 1st) and 295.89 / 361.64 / 306.85 / 712.33 / 986.30 / 1,666.67; הדס 1,211.70 / 251,000 / 669.33 / 1,216.55 / 547.22 / 250,452.78; the half table 2,225.05 / 2,229.48 / 2,227.26 / 2,231.70 with 6.66 / 11.09 / 8.87 / 13.31; exercises 3,123.80 (3,255), 1,280 (7.42 / 321,280), 1,863.29 (1,855.87 / 1,930.10), 712.33, 320,353.78 (319,077.46 / 321,280). All hold.

#### 3.5-a · nit · "כוח הקנייה של מה שהלווה"
- **Where:** five questions, "למה זה קיים?": "בהלוואה צמודה המלווה מקבל בחזרה את כוח הקנייה של מה **שהלווה** (שיעור 0.8)."
- **Problem:** the same ambiguity the stage-2 second read flagged in 2.3 (2.3-b): "שהלווה" reads as "that he lent" or "that the borrower…", opposite sides of the loan.
- **Fix:** "…המלווה מקבל בחזרה את כוח הקנייה של הכסף שנתן (שיעור 0.8)."

#### 3.5-b · nit · "כל תשלום גבוה ב־6.66" and a total a reader cannot rebuild
- **Where:** "וכמה זה בסוף?": "אז כל תשלום גבוה ב־6.66 ₪ מהלוח המקורי…, והתשלום האחרון סוגר את העיגול… ההפרש, כל התוספות יחד, הוא 1,596.66 ₪."
- **Problem:** a reader who checks multiplies 240 × 6.66 = 1,598.40 and finds 1.74 ₪ missing; the page never says how much the last payment differs (it is 4.92 ₪: 2,223.53 against 2,218.61). The first round's 3.5-4 asked for exactly this check to work.
- **Fix:** "…239 תשלומים גבוהים ב־6.66 ₪, והתשלום האחרון, שסוגר את העיגול, גבוה ב־4.92 ₪ (2,223.53 מול 2,218.61)…", with facts for the two last payments and the 4.92 difference.

#### 3.5-c · nit · on a phone the table cuts the balance into a smaller-looking number
- **Where:** the three-month table, phone strip at about y = 2,000: the last column shows "9,977.95", "9,547.97", "7,921.03" (the leading "39" is past the edge); the scroll hint is shown.
- **Problem:** much better than the first round (only the last column is cut), but the cut lands inside the numbers and leaves a plausible-looking amount.
- **Fix:** drop the "מדד" column (the text gives 100.3 / 100.5 / 100.4 in each month's heading), which frees about 40px; or move "יתרה" to second place, as AUTHORING asks for the column the text talks about.

### 3.6 — כשהריבית מתעדכנת

**Verification.** The must-fix item 3.6-1 is fixed: "שינוי של s נקודות אחוז מזיז את רכיב הריבית של החודש הבא ב־s% מהיתרה, חלקי 12… בהסבר, 1.2 נקודות אחוז: 1.2% × 451,903.63 ÷ 12 = 451.90 — כמו הפרש הריביות בצעד 4, 451.91, עד אגורה של עיגול", and it now adds why the payment rises by less (294.07). All four should-fix items are fixed: the lesson moved to the statement convention (X-1), so step 1 takes the balance "בלוח (שיעורים 3.2–3.3): 451,903.63" and a rounding callout before the explanation says the 3.3 formula gives "כמעט אותו מספר"; RateReset now computes with `rounding: "statement"` and its card shows the same 451,903.63 / 3,538.86, so guided task 1's "אותם מספרים כמו בהסבר" is true; guided task 3 now states the jump, "ב־416.67 ₪… עלה ב־425.00 ₪ בגלל האחוז החדש, וירד ב־8.33 ₪ כי היתרה קטנה"; the half table is keyed by "מחודש" and has no "שינוי" column, and reads cleanly at 390px (phone strip: 13 · 228 · 5.5% · 388,050.79 · 2,746.96). The nits are fixed: eight digits (0.36151257 / 0.63848743, no "בערך"); equal-principal month 36 adds up (2,083.33 + 1,708.33 = 3,791.66); three guided tasks; "מה לקחת מזה" no longer in warning tone (the "התקופה נשארת… בודקים בחוזה" callout rightly still is).

**Recomputed** with my own reset schedule (statement convention; the payment recalculated on the statement balance at each change, rounded once): 3,244.79; 451,903.63; 204; 1,807.61 / 2,259.52 / 451.91; 1.005<sup>−204</sup> = 0.36151257; 2,259.52 ÷ 0.63848743 = 3,538.86; 294.07; end balance 0.00; the wrong answers 3,582.16 / 3,915.50 / 3,237.58; equal principal 2,083.33 / 1,708.33 / 3,791.66 / 425,000.12 / 1,700.00 / 2,125.00 / 4,208.33 / 416.67 / 8.33; the slider's variable track 415,777.25 → 3,508.56, −1.2 points 2,965.00, year-10 balances 318,757.47 / 308,760.42; גלית 1,940.19 / 314,674.85 / 1,258.70 / 0.61637321 / 2,042.11 / 101.92; the half table 388,050.79 → 2,746.96, 376,132.61 → 2,851.70, 351,437.24 → 2,709.33; exercises 216 (293 / 18), 2,531.57 (2,372.38 / 2,149.29), 2,717.82 on 374,967.75 (2,729.01 / 2,899.26 / 2,558.22), 3,800 (3,440 / 3,037.88). All hold.

No new item in 3.6 beyond the cross-lesson ones (C-2 on option order, C-3 on "כמו בלוח של בנק").

### 3.7 — מתמהיל לתזרים אחד

**Verification.** The must-fix item 3.7-1 is fixed: "מתי הנוסחה נכונה?" item 4 now reads "החשיפה נכונה בכל תרחיש. ההחזר הראשון ידוע מראש, חוץ מההצמדה של החודש הראשון במסלולים צמודים. אם בתמהיל יש מסלול צמוד, גם התשלום הראשון זז עם המדד שמתפרסם לפניו. התשלום הגבוה ביותר וכל התשלומים יחד — רק לתרחיש שבו חישבתם אותם", and the same sentence is in the three-numbers list, the summary and the sources. Both should-fix items are fixed: יונתן's maximum is "מחודש 61 ועד חודש 179 (בחודש 180, התשלום האחרון של הפריים, 0.02 ₪ פחות: הוא סוגר את העיגול)", and the callout says "מחודש 61"; exercise 4 says "(עד שתי ספרות אחרי הנקודה.)" with `tolerance={0.05}`. The nits are fixed: step 2 gives the new rate and months ("ב־5%, על היתרה, ל־168 החודשים שנשארו"); the hard pair is reordered (the given-sum item is now exercise 5, בינוני; the two-Spitzer item is exercise 6, מאתגר, with the prime-only error 2,024.90); the `<Later>` tags in the "3.8 ו־3.9" sentence are `quiet`; `minutes: 30`; the source chip is "Σ Cₖ"; the exercises have actors ("יש לכם תמהיל"). The lesson now uses the statement convention per track, with a rounding callout before the explanation and a table note on the closing month (month 144: 5,901.57).

**Recomputed** (each track its own statement schedule, prime recalculated on the balance at month 13, linked track indexed by 1.02<sup>k/12</sup>, summed by month): 1,574.00 / 2,663.15 / 1,663.79 = 5,900.94; 3,237.79 (drop 2,663.15); 1,574.00; flat maximum 5,901.57 in month 144 (0.63), flat total 1,349,441.81; the scenario 5,903.69 / 5,934.22 / 6,074.85 (prime 2,800.98) / 1,697.07 / 2,110.09 / 2,801.24 → 6,485.33 in month 144, 581.64 above the first, 3,687.57 from month 145, total 1,458,673.99 (109,232.18 above flat); exposure 33.33 / 33.33 / 66.67 / 0; one formula 5,347.05 (553.89); long prime 4,865.75 / 5,839.85 in month 240 / 1,592,617.08; variable linked 5,941.55 / 6,685.63 in month 144; יונתן 2,046.07 + 1,529.99 + 957.09 = 4,533.15, 1,578.54 / 4,581.70, 1,022.07 / 4,646.68 from 61 to 179 (4,646.66 in 180), 3,068.14, 2,046.07, total 1,138,770.80, shares 28.57 / 50 / 21.43; the half table (144: 2,663.78 / 5,901.57; 240: 1,664.72); exercises 3,525.75, 3,185.35 (5,716.48 / 2,338.36), 31.25% (68.75), 5,741.89 (5,716.48), 4,363.26 (3,850.09 / 2,338.36 / 2,024.90). All hold. (The variable-linked total in the data, 1,497,634.00, is 24 agorot from my run; it is not printed on the page.)

No new item in 3.7 apart from the name collision in Part B (B-3).

### 3.8 — החזר ראשון, החזר בתנאים הנוכחיים, החזר מרבי חזוי

**Verification.** The must-fix item 3.8-1 (and cross-lesson X-1) is fixed with a new section, "למה צריך גם ״החזר ראשון״ וגם ״החזר בתנאים הנוכחיים״": the first payment belongs to month 1 and does not change, the current-terms payment moves with the terms; two worked cases where they differ (a prime track three years in: 2,530.60 against 2,722.89; a linked track on signing day: 3,327.59 against 3,333.09) and grace as a third; the rule "ההחזר הראשון ידוע מראש, חוץ מההצמדה של החודש הראשון במסלולים צמודים" in the body, the reveal, the five questions, the summary and the sources. The callout now says "מובטח… ולכן — במסלול לא צמוד — ההחזר הראשון", and "במסלול צמוד גם ההחזר הראשון תלוי במדד של החודש הראשון". The should-fix items are fixed: "מתוך עקומי התשואות שלו" and "לידו מוצגים"; the income-check paragraph separates the transcribed rule ("לפי התעתיק בצוות של נספח א׳… (לא אומת)") from the Mogi decision (who and when), with separate source items; the worked "מה לקחת מזה" now compares in shekels and percent against the all-variable case (100.98 against 201.95; 2.6% against 5.3%). The nits are fixed: "במסלול קבועה צמודה לבדו… בתמהיל — לא בהכרח (שיעור 3.7, תרגיל 7)"; "לפי תעתיק מגרסה שהורדה ב־2026-08-03"; `f.shekels` in prose; "ב־10% ומעלה מההחזר בתנאים הנוכחיים"; "(ובהלוואה עם גרייס — התשלום שאחרי הגרייס)"; the glossary "תחזית" has who and when; the half table's periods read "6 עד 10"; the exercises have actors. On the phone every 3.8 table now fits with its key column first.

**Recomputed** (each variable track reset every 60 months at the forecast rate on its statement balance): 3,828.36 / 3,957.11 / 4,030.31 / 4,010.86, maximum 4,030.31 from month 121, 201.95, 5.3%, threshold 4,211.20; higher path 4,194.95 / 4,387.20 / 4,335.11 (356.89 over); lower path 3,677.11 / 3,591.42, maximum the first payment; slider 4,216.80; the prime case 2,530.60 / 2,722.89 / 192.29; the linked case 3,327.59 / 3,333.09 / 5.50; גלית ואורן 2,013.16 + 1,914.18 = 3,927.34, 3,991.71 / 4,028.32 / 4,018.60, 100.98 (2.6%), 4,320.07, high path 4,206.76 (178.44); the half table 4,620.61 / 4,791.95 / 2,754.57 / 2,728.14, maximum 4,791.95 from month 61; exercises 2,836.34 (257.85 / 2,578.49), 2,299.41 on 348,418.33 (2,111.35 / 2,338.36 / 2,036.82), 9.8% (9.0; threshold 3,391.14). All hold, except exercise 5 below.

#### 3.8-a · must fix · exercise 5: the answer key is not the maximum of the table the learner is given
- **Where:** exercise 5 (מאתגר), "מה ההחזר המרבי החזוי של התמהיל?"; `answer={f.raw("ex5.answer")}` = 4,320.22, no `near` (so the default 1 ₪ applies). The table in the question gives, per period, 1,976.98 + 2,214.27 / 1,976.98 + 2,288.95 / 1,976.98 + 2,342.06 / 0.00 + 2,370.46. The solution: "מחברים כל תקופה: 1–5: 4,191.25 ₪ · 6–10: 4,265.93 ₪ · 11–15: 4,319.04 ₪ · 16–20: 2,370.46 ₪. הגבוה ביותר: **4,320.22 ₪**, בשנים 11–15."
- **Problem:** since the switch to the statement convention, the highest month is month 180 alone, where the 15-year fixed track's last payment closes its rounding (1,978.16 instead of 1,976.98): 1,978.16 + 2,342.06 = 4,320.22 (`ex5.answer_month` = 180; I get the same). Nothing on the page shows that payment. A learner who does exactly what the lesson teaches answers 4,319.04, which is 1.18 ₪ off: outside `near`, not a listed error, so it is marked plainly wrong, and the solution then prints a sum list whose maximum is 4,319.04 next to "הגבוה ביותר: 4,320.22". The first round's answer was 4,319.04 (exact convention); the rounding fix moved it.
- **Fix:** make the answer the table's maximum: a fact for the highest *period-start* payment (4,319.04), or keep 4,320.22 and add `near={2}` plus a sentence in the solution: "בחודש 180 התשלום האחרון של הקבועה סוגר את העיגול (1,978.16 ₪), ולכן בחודש הזה בדיוק התמהיל משלם 4,320.22 ₪; בתשובה מתקבלים שני המספרים." The first is cleaner, because the lesson's own callout says the period tables show "התשלום בחודש הראשון של כל תקופה".

#### 3.8-b · should fix · the map card and the glossary say the opposite of the new section
- **Where:** map card `first_payment` (`stage-3.ts`): "בלי גרייס ובלי הצמדה הוא שווה להחזר בתנאים הנוכחיים"; glossary "החזר ראשון" (`definitions/3-8.json`): "בדרך כלל הוא שווה להחזר בתנאים הנוכחיים (חוץ ממסלול צמוד ומגרייס)".
- **Problem:** the lesson's case א is an unlinked prime track without grace where the two differ (2,530.60 against 2,722.89) because the prime moved; the lesson says "ההחזר בתנאים הנוכחיים… זז כשהתנאים זזים". The card and the popover are what a learner rereads later, and they state the equality without "on signing day".
- **Fix:** card: "ביום החתימה, בלי גרייס ובלי הצמדה, הוא שווה להחזר בתנאים הנוכחיים; אחרי שהריבית או המדד זזים, ההחזר בתנאים הנוכחיים זז, והראשון נשאר." Glossary: "ביום החתימה הוא בדרך כלל שווה להחזר בתנאים הנוכחיים (חוץ ממסלול צמוד ומגרייס); אחר כך הם נפרדים כשהתנאים זזים."

### 3.9 — סך תשלומים, ריבית, הצמדה ועמלות

**Verification.** The must-fix item 3.9-1 (and cross-lesson X-2) is fixed by the stronger of the two fixes the first round offered: 3.9 now computes every total with the statement convention ("בלוח, כמו בשיעור 2.9, הריבית של כל חודש מעוגלת לאגורה, והתשלום האחרון סוגר את מה שנשאר"), so the same loans give the same numbers as 2.9, 3.2 and 3.12 (334,499.54 / 533,278.18; איתי's 12,393.58), and the callout "למה ״התשלום כפול מספר החודשים״ יוצא קצת אחרת" now says what is true: the product assumes the last payment equals the others (0.02 ₪ on the small loan, 1.78 ₪ on 30 years, both from difference facts; the typed "3 אגורות" is gone). The should-fix items are fixed: FK-H-062 is quoted as "נמוך משכר הדירה הצפוי"; the linked-vs-unlinked paragraph now calls it "שאלה של כוח קנייה", says 3.10–3.11 compare by interest "על הלוואות לא צמודות", and points the full comparison to stage 5 (`<Later lesson="5.4">`). The nits are fixed: the fee is dated in the body and the summary ("נכון לאוגוסט 2026"); the expected observation says "פחות מעשירית האחוז (0.04%)", and WhereMoneyGoes now rounds "מכל 100 ₪" by largest remainder (64 + 36 on the phone strip); the 3.11 pointer is `quiet`; "לפי התעתיק בצוות, בנק ישראל דורש… (לא אומת)"; "שפיצר (לעומת קרן שווה)".

**Recomputed** (statement schedules; linked track indexed by 1.02<sup>k/12</sup>, 1.025<sup>k/12</sup> in the exercise): 1,032.80 / 1,032.78 / 12,393.58 (product 12,393.60, gap 0.02) / 393.58; 3,893.74 / 934,499.54 / 334,499.54 / 35.8%; 3,147.99 / 745.75 / 533,278.18 / 198,778.64 / 47.1%; linked 3,333.09 → 4,942.39, 980,696.87 = 600,000 + 229,398.59 + 151,298.28, 46,197.33 above; fee 0.11% of interest; the slider 934,859.54 / 35.8% / 0.04% / 47% / 15.4% of 981,056.87; יעל 2,969.80 / 2,630.66 / 339.14, 712,752.33 / 789,195.11 / 76,442.78, 36.9 / 43%, 713,112.33; the half table by product 404,865 / 443,930.40 / 485,049 (as the instructions ask); exercises 25,373.28, 533,276.40 (1,133,276.40 / 864,000; table 533,278.18, 1.78), 90,894.55 (194,069.91 / 490,894.55; I get the same table totals 594,069.91 / 103,175.36), 101,882.40 (289.99 / 431,394). All hold.

No new item in 3.9 apart from the name in Part B (B-3).

### 3.10 — ערך נוכחי ושיעור תשואה פנימי (IRR)

**Verification.** All three should-fix items are fixed. The present-value table now uses the statement schedule (10,100.17 / 10,100.17 / 10,100.16, "העיגול לאגורה, כמו בשיעור 3.9"), its rounded rows add to exactly 30,000.00, and the page says so ("שלוש השורות, כפי שהן מעוגלות בטבלה, מסתכמות בדיוק לזה"). "נמשכה / נמשכת" are gone ("ההלוואה כולה הייתה לשלושה חודשים בלבד", "במספר החודשים שהיא פתוחה"). "באלפיות האחוז" is now "בפחות מעשירית של נקודת אחוז: מ־4.8% ל־4.8071%". The nits are fixed: "לכן בנק ישראל בחר מדד אחד שמכניס את העמלה… (לפי התעתיק, לא אומת). למה גם הוא לא כל התמונה — בשיעור הבא"; one parenthesis on "הוראה 451" (`quiet`); "פחות ממיליונית של מיליונית נקודת אחוז". On the phone the present-value and bisection tables now fit (the period range is in an `ltr` span). Exercise 3 has an actor.

**Recomputed** (statement schedules; my own bisection to 200 halvings, independent of the course's): 30,300.50 / 300.50; rows 10,049.92 / 9,999.92 / 9,950.16 = 30,000.00; 30,059.70 at 0.4%, 29,940.50 at 0.6%; the six bisection steps 29,558.48 / 29,777.87 / 29,667.84 / 29,722.77 / 29,695.28 / 29,709.02 with their verdicts; IRR 1.007576% → 1.0076, × 12 = 12.09%, power 12 = 12.78%, 29,699.99 at 1.0076%; without fee 4.8% / 4.907%; slider 4.92 / 5.03 with 6,000 ₪, equal principal 4.8%; שחר 599,640, 0.400593%, 4.8071% / 4.9145%; the half table 3,014.98 / 2,970.42 / 2,926.52 = 8,911.92, IRR 1.51%; exercises 18,000 (18,252.84), 5.54% (5.40), 7.89% (8.18 / 0.66), 12.11% against 4.8071%. All hold.

#### 3.10-a · nit · exercise 5 describes 3.12's loan with twelve equal payments
- **Where:** exercise 5: "לקחתם 12,000 ₪ לשנה, ב־6% לשנה, בשפיצר: 1,032.80 ₪ בכל חודש, 12 פעמים"; the solution: "בתאים A2 עד A13 התשלום 1,032.80".
- **Problem:** this is איתי's loan in 3.9 and 3.12, where the page teaches that the twelfth payment is 1,032.78 ₪ ("התשלום האחרון סוגר"). The IRR is the same to two decimals either way (I get 7.8866% with twelve equal payments and 7.89% from the statement schedule), but a learner who just did 3.9 sees the lesson ignore its own last-payment rule.
- **Fix:** "…1,032.80 ₪ בכל חודש (והאחרון, שסוגר את העיגול, 1,032.78 ₪)…", and in the solution "A13 = 1032.78"; or keep it and add "(לשם הפשטות, 12 תשלומים שווים)".

### 3.11 — למה סך תשלומים, ערך נוכחי ו־IRR הם שלושה מדדים שונים

**Verification.** All five should-fix items are fixed. Exercise 3 is a new loan (300,000 ₪, 5%, 20 years, 6 months of full grace; total 482,103.84), so the answer is a concept to apply, not a number on the page; exercise 5 asks for offer ב׳ at 3.5% (684,980.82), which nothing prints. The IRR sentence and the summary now read "כשאין עמלות, הוא לא תלוי בכמה לוויתם ולכמה זמן; עם עמלה ביום הראשון — כן… (שיעור 3.10, תרגיל 6)". "תמיד בוחר בלוח שמחזיר מהר" now carries "בין לוחות של אותה הלוואה ובאותו אחוז ריבית", with the counter-case in brackets. The summary table is "השאלה · מה זול יותר · המדד" and fits at 390px (phone strip). "נמשכת" is gone ("והיא ל־30 שנה במקום 20"). The nits are fixed: "בשיעורים 3.9 ו־3.10 פגשנו"; "זו העובדה מהשיעורים 0.6, 2.9 ו־2.10"; "בשקלים של היום" throughout; "בנק ישראל קבע אותו כמדד להשוואה… (לפי התעתיק בצוות, לא אומת)"; the half table explains its agora ("התשלום השלישי… 1,040.27 — אגורה יותר"); exercise 5 has an actor. The video (re-rendered 14:03) now prints the statement figures (607,576.56 / 581,000.19 / 26,576.37; 478,210.14; 332,794.93; 10,570.06; 6,903.86) and says "שניהם 400,000 ₪, עד אגורות"; the 24 frames are clean.

**Recomputed** (statement Spitzer, statement equal principal with the last month closing, full-grace schedule; PV at annual ÷ 12; my bisection IRR): 3,375.43 (last 3,374.59) / 4,222.22; 607,576.56 / 581,000.19 / 26,576.37; IRR 6.0000% both, 6.17% effective; PV at 6% 399,999.98 / 400,000.01, at 3% 488,780.20 / 478,210.14 (10,570.06), at 9% 332,794.93 / 339,698.79 (6,903.86); grace 628,715.91 → 399,999.97; אסף ומאיה 3,959.73 / 3,075.87 / 883.86, 950,337.09 / 1,107,310.09 / 156,973.00, 5.12 / 4.70% effective, PV at 3% 713,983.58 / 729,562.44 (15,578.86), at 4% 653,442.85 / 644,274.61, at 6% 552,702.74 / 513,028.81 (39,673.93); the half table 3,120.79 / 3,120.00, 3,059.40 / 3,059.01, 2,942.50 / 2,942.87; exercises 299,999.97 (482,103.84 / 182,103.84 / 359,235.36), 684,980.82 (1,107,310.09 / 600,000.74 / 513,029.32). All hold.

#### 3.11-a · nit · exercise 5's last error is not "the number from the worked example"
- **Where:** exercise 5, the error `{ value: f.raw("ex5.err_6") = 513,029.32, message: "זה הערך הנוכחי ב־6% — המספר מהדוגמה הפתורה." }`; the worked example, step 5, prints ב׳ at 6% as **513,028.81 ₪**.
- **Problem:** the error is the level-payment PV, the worked example's figure is the statement schedule's; they are 0.51 ₪ apart, outside the error's 0.05 tolerance. A learner who copies the worked example's 513,028.81 gets a generic "wrong" instead of this message, and the message names a number the page never printed.
- **Fix:** use `f.raw("worked.b_pv_6")` as the error value (or give the error `tolerance: 1`).

### 3.12 — סדנה: לוח סילוקין ביד ובגיליון

**Verification.** Both should-fix items are fixed: the workshop parts are now "חלק 1 / 2 / 3" (Section kinds, the list "לסדנה שלושה חלקים", "נראה את זה בחלק 3 של הסדנה", "לחלקים 2–3"), and "שלב 3" means only the course stage; the template's hints now say "את הנוסחה כותבים בתא B10 (צעד 1), לא בתא הזה" and the same for B11 (I opened `public/downloads/schedule-template.xlsx`). The nits are fixed: spreadsheet formulas in prose are `inline-block whitespace-nowrap` (no break on the phone strip); map task 3 names the anchor too ("והתחזית של העוגן מזיזה את המסלולים המשתנים"); "שישה תרגילים (2–7)"; "בגיליון שמעגל כמו הקורס"; the summary says the mix is built in stage 5. Of the components report's should-fix items, BigPictureMap-1 is fixed here: the map gets `newFrom="3.1"`, the legend says "חדש בשלב הזה" / "משלבים קודמים", and the text above it says so. One first-round nit is not fixed: 3.12-3 (see 3.12-a).

**Recomputed:** איתי 1,032.80 (errors 1,060 / 1,000 / 1,431.32); months 1–3 (60.00 / 972.80 / 11,027.20; 55.14 [55.136] / 977.66 / 10,049.54; 50.25 [50.2477] / 982.55 / 9,066.99); last payment 1,032.78 (0.02), totals 12,393.58 / 393.58 — the same as 3.9 now; every named hand mistake in the data (720, 1,032.80, 1,000, 312.80, 10,967.20, 11,000, 11,687.20; 12,000, 60, 661.63, 55.136, 55.13, 972.80, 371.17, 9,994.40, 10,027.20, 10,049.536, 10,054.40, 10,656.03; 11,027.20, 602.97, 50.2477, 50.24, 429.83, 9,016.74, 9,049.54, 9,066.9877, 9,076.74, 9,619.71); תמר ועידו 3,247.15 / 3,246.15 / 584,486.00 / 184,486.00; no ROUND 184,486.36 (0.36); payment unrounded 184,486.34 (0.34; last 3,247.13); no last-month fix 584,487.00, end balance −1.00; month 1 1,800.00 / 1,447.15; month 60 300,573.94 (opening 302,460.02; naïve 205,171.00; equal principal 266,666.80); year-1 interest 21,163.66; 99,426.06 repaid. All hold.

#### 3.12-a · nit · the solution sheet still opens empty in a preview (first-round 3.12-3, not fixed)
- **Where:** `public/downloads/schedule-solution.xlsx` (and the copy in `dist/downloads/`, 14:11): `openpyxl` with `data_only=True` returns `None` for B10–B17 and for every cell of rows 20 onward.
- **Problem:** unchanged since the first round. Excel and Google Sheets recalculate on open, but a phone's file preview, a mail preview or Quick Look shows an empty table, and the page sends phone readers to "לפתוח אחרי שניסיתם". The source item says the solution "נבדק אחרי חישוב מחדש ב־LibreOffice", but the recalculated values were not saved into the file.
- **Fix:** in `scripts/build-sheets.py`, save the LibreOffice-recalculated file as the published one (or set `fullCalcOnLoad`), so cached values ship with the formulas.

#### 3.12-b · nit · the sources write the payment formula with m
- **Where:** Sources, first item: "התשלום השווה הוא P × m ÷ (1 − (1 + m) בחזקת −n)".
- **Problem:** the page's own box (and 3.1's) writes r and says "(ה־m של שיעור 0.4)"; AUTHORING: the box writes r. The source item is the only place in stage 3 where the payment formula uses m.
- **Fix:** "P × r ÷ (1 − (1 + r) בחזקת −n), כש־r היא הריבית החודשית (ה־m של שיעור 0.4)".

### The stage-3 check (`/checks/3/`)

**What I checked.** All 22 questions against `check-3.json` and by hand: 17,779.93 (22,497.28 / 17,600); 4.8% (5.5 / 6.2 / 3.3); 3,806.42 (3,840 / 3,750 / 4,448.43); 578.66 (1,200 / 1,066.67 / 1,778.66); 2,149.29 × 90.073453 = 193,593.97, table 193,594.80 (0.83, accepted as near, as the explanation says), errors 150,000 / 42,085.20 / 299,999.56; 255,037.62 (power 255,037.63; 255,000); 3,503.85 (3,591.45 / 3,450 / 53.85); 241,323.11 × 0.0045 ÷ (1 − 0.583455) = 2,607.05 (2,466.28 / 2,729.01 / 4,321.26 / 1,646.43); 2,087.06 + 862.25 = 2,949.31 (5,012.45 / 4,150.20); 337.49 ÷ 3,010.87 = 11.2% (10.1 / 1.8; threshold 3,311.96; I get the same 3,348.36 maximum from month 121); 3,426.84 (statement table 3,426.81, within tolerance; 39,426.84 / 6,480); 11,857.43 (12,000 / 11,786.57); 6.80% (6.60); 16,732.84 (16,659.36 / 16,703.01 / 16,739.36 / 17,541.10). Every answer and every listed error is right, and every printed equality holds.

**The stage-2 check's two main problems (its C-1 and C-2) are fixed here.** `StageCheck.vue` now shuffles the options with a seed per question (the right answer lands at positions 0, 2, 2, 1, 2, 2, 0, 3 in the eight choice questions), and the right option is no longer the longest (it ties or is within a few characters in every set). Every numeric question uses new inputs; none repeats a lesson's worked example or exercise (שאלה 13 has 3.7 exercise 3's shape, with new payments). Each of 3.1–3.12 has at least one question. The three earlier-stage questions are right and new: 0.5 (present value of 20,000 ₪ in three years at 4%), 1.3 (what a repayment method decides; the explanation separates it from the rate mechanism and the loan's purpose, as 1.3 does), 2.1 (prime as Bank of Israel + 1.5, "נניח", minus 0.7; not a 2.1 example). The intro says which official rules are unverified. No case A. The phone strips read cleanly (the signed exponent "−120" in שאלה 12 is isolated and reads correctly).

But `checks/3.mdx` was last changed at 11:39, before the lesson fixes of 13:51–14:09, and two of its explanations still carry wording the lessons have since corrected.

#### K-1 · should fix · שאלה 6's explanation restates the rule 3.2 now qualifies
- **Where:** שאלה 6 (from 3.2), explanation: "…רכיב הקרן: 1,778.66 − 1,200.00 = 578.66 ₪. **בהלוואה ארוכה, בהתחלה רוב התשלום הוא ריבית.**"
- **Problem:** this is the exact sentence the first round made a must-fix in 3.2 (3.2-1), and 3.2 now teaches "זה תלוי באחוז" with a threshold table. The check is where a learner is told what to remember. (It happens to be true for this loan: 4.5% for 25 years is above 2.78%.)
- **Fix:** "בהלוואה הזו, ב־4.5% ל־25 שנה, בהתחלה רוב התשלום הוא ריבית (באחוז נמוך יותר זה יכול להיות הפוך — שיעור 3.2)."

#### K-2 · nit · four small wording slips in the check
- **שאלה 21** (3.11), explanation: "בריבית של ההלוואה, 5%, שני הלוחות שווים **בדיוק** את ההלוואה." 3.11 now says, for its rounded tables, "עד כמה אגורות". Fix: "שווים את ההלוואה (בלוח מעוגל — עד אגורות)".
- **שאלה 17** (3.9), explanation: "**בלוח המדויק** התשלום האחרון סוגר את העיגול". In 3.12 "מדויק" is the sheet *without* ROUND; the statement table is the rounded one. Fix: "בלוח עצמו התשלום האחרון סוגר את העיגול, ולכן סך הריבית שם שונה באגורות (והוא מתקבל)".
- **שאלה 20** (3.10): the question asks for two decimals, the explanation prints "בערך 6.8%" and "6.6%" (`f.plain` drops the zero). Fix: "6.80%", "6.60%".
- **שאלה 14** (3.7), explanation: "(תקופה נפרדת לכל מסלול — החלטה של Mogi)" without who and when; and שאלות 13, 15 and 18 have no actor ("לתמהיל שלושה מסלולים", "מסלול משתנה לא צמודה של 480,000 ₪", "הלוואה מוחזרת"). Fix: "(החלטה של Mogi: אילון, 2026-08-03)"; "יש לכם תמהיל…", "לקחתם מסלול…", "לקחתם הלוואה ואתם מחזירים אותה…".

---

## Part B: series consistency, end to end

| Thread | Where | Holds? |
|---|---|---|
| One rounding convention (statement) | 3.1–3.12, the components, the check | **Yes.** The first round's two must-fix causes (X-1 in 3.5–3.6, X-2 in 3.8–3.11) are fixed at the source: every lesson, ScheduleBuilder, LinkedSchedule, RateReset, MixBuilder, ForecastPaths, WhereMoneyGoes and ThreeMeasures now use `rounding: "statement"`, each lesson that rounds says so in a callout before its first table, and the formula-vs-table gaps are named with difference facts. Exceptions: 3.8-a (a closing-month maximum that the exercise table cannot show) and 3.10-a. |
| The same loan, the same numbers | 600,000 ₪ / 4.8% / 20 y: 3,893.74, 3,895.68, 934,499.54, 334,499.54 in 2.9, 3.1, 3.2, 3.4, 3.9; 30 y: 3,147.99 / 533,278.18 in 2.9, 3.2, 3.9; 60,000 ₪ / 6% / 3 m: 20,200.33 … 20,200.34 in 2.9, 3.1–3.3; 400,000 ₪ / 5.4% / 15 y: 3,247.15 / 184,486.00 in 2.9, 3.1, 3.12; 12,000 ₪ / 6% / 12 m: 1,032.80 / 1,032.78 / 12,393.58 in 3.9, 3.12 (and 3.10 exercise 5); 250,000 ₪ / 4.8% / 25 y: 183,555.79 at month 121 in 3.2 and 3.3; 500,000 ₪ / 4.8% / 20 y after 36 months: 451,903.63 in the 3.6 text and in RateReset | **Yes**, to the agora. The first round's 3.9 ≠ 3.12 total (12,393.57 against 12,393.58) and RateReset ≠ ScheduleBuilder (451,903.77 against 451,903.63) are gone. |
| r vs m | every formula box | **Yes.** All twelve boxes write r and say once "(ה־m של שיעור 0.4)"; 3.5 now does too. One stray m in 3.12's sources (3.12-b). |
| "ההחזר הראשון ידוע מראש, חוץ מההצמדה של החודש הראשון במסלולים צמודים" | 3.5 (the mechanism), 3.7 (three numbers, conditions, summary, sources), 3.8 (body, rule, reveal, five questions, summary, sources), glossary "החזר ראשון", map card `first_payment` | **Yes**, word for word. The card and the glossary still state "equal to the current-terms payment" without "on signing day" (3.8-b). |
| First / current terms / projected maximum | 3.7 → 3.8 → 3.12 map → check שאלות 15–16 | **Yes.** "תחזית אינה הבטחה" holds everywhere; the new 3.8 section finally shows when "first" and "current" differ. |
| Total paid vs PV vs IRR | 3.9 → 3.10 → 3.11 → check שאלות 17–21 | **Yes.** The over-broad "always" and "independent of size and term" claims are conditioned in 3.11 and match 3.10. Small slip in the check (K-2, "בדיוק"). |
| What the total counts | 3.9 ("רק התשלומים החודשיים שבלוח; עמלות לידו") → 3.10 (T) → 3.11 → 3.12 | **Yes.** |
| Discounting rate | the loan's own (3.10), "what your money could earn" (3.11), said aloud as an assumption | **Yes.** |
| "בשקלים של היום" / "בכוח קנייה של היום" | 3.9 (linked vs unlinked: "שאלה של כוח קנייה"), 3.11 (only "בשקלים של היום") | **Yes**; "בכסף של היום" is gone. |
| "בשיעור הבא" lines | 3.1 → 3.11; 3.12 → check | **Yes**: each quotes the map's exact title. |
| Case A | 3.1–3.12, components, video, check | **Yes**: נועם ושירה appear only as "תרגיל נפרד, לא התיק של נועם ושירה" and "בשלב 5"; the map's case-A path now says stage 3 moved to stage 5. |
| Terms before their lesson | `<Later>` for 3.8–3.11, 4.x, 5.x, 7.1 | **Yes**; "תחזית" before 3.8 is gone; the `<Later>` tags inside sentences that name the lesson are `quiet`. |

#### B-1 · nit · map cards show "Brain" to learners
- **Where:** `stage-3.ts`, cards `max_payment` ("כפי שהצוות העתיק ב־Brain, ממתין לבדיקה") and `irr` ("לפי תעתיק בצוות ב־Brain").
- **Problem:** the page numbers are gone (first-round BigPictureMap-3 is fixed), but "Brain" is an internal system name a learner does not know; the lessons say "לפי תעתיק בצוות" without it.
- **Fix:** "כפי שהצוות העתיק, ממתין לבדיקה מול המקור" in both cards.

#### B-2 · nit · repeated cause: `dec()` drops a trailing zero from eight-digit factors
- **Where:** 3.1 "0.99502488 + 0.9900745 + 0.98514876", "1.00425<sup>300</sup> = 3.5690458", exercise 3 "1 ÷ 1.005<sup>2</sup> = 0.9900745"; 3.3 "0.99502488 + 0.9900745", exercise 6 "S = … = 172.1231415".
- **Problem and fix:** as 3.1-c: the lessons say "שמונה ספרות"; print the stored eight digits.

#### B-3 · should fix · invented names reused for different people, some inside stage 3
- **Where:**
  - **גלית** — 3.6 (alone: 360,000 ₪ variable, reset every 5 years, 4.2%) and 3.8 (**גלית ואורן**: a two-track mix with a variable track reset every 5 years). Same stage, same kind of track; a learner will look for 3.6's Galit in 3.8 and not find her numbers.
  - **אסף** — 3.1 (**נגה ואסף**) and 3.11 (**אסף ומאיה**).
  - **מיכל ואורי** (3.7) — the same couple as **אורי ומיכל** in 2.11's worked example, with a different loan.
  - **יעל** (3.9) — 2.10's **יעל ותומר**, with a different loan (the first round's X-6 flagged יעל; the rename of 3.9's נעמה moved to it).
- **Problem:** the course trains the reader to follow people across lessons (הילה in 3.2 → 3.3 is deliberate and says so). These collisions came in with the first-round renames.
- **Fix:** rename 3.8's couple (e.g. "ענת ונדב"), 3.11's (e.g. "ליה ואלון"), 3.7's (e.g. "מירב ויואל") and 3.9's (e.g. "רעות"); none of these appears in stages 0–3 (I grepped), and avoid names that are also words ("שני").

---

## Part C: reliability, and causes that repeat

**What holds.**
- **Official rules are unverified and dated.** Directive 451 §17–18 (3.5), §4ג(ב4) and appendix 4 (3.8–3.11), directive 329's appendix (3.8), the 2002 prepayment order and the file-opening fee (3.9), the CBS publication day (3.5): each says "(לא אומת)" in the sentence and has a dated `לא אומת` source with the transcript page.
- **Mogi decisions carry who and when in the sentence**: DEC-2 ("אילון, 2026-08-03", 3.7) and DEC-3 ("אילון אישר ב־2026-10-07, ועדן קיבל ב־2026-10-08": 3.4, 3.5, 3.6, 3.7, 3.8 ×3, 3.9, the 3.8 glossary), with the 10% threshold marked "בחירה של Mogi, לא כלל של בנק ישראל". Two places give a date or nothing (3.1-b; check K-2).
- **Field knowledge** FK-H-062 (3.9, now quoted as "נמוך משכר הדירה הצפוי") and FK-H-059 (3.11) say "ידע מהשטח: אילון, <date>; ממתין לאישור אילון" in the body, have their ids in the sources only, and are on `research/eylon-list.md` under stage 3; DEC-3's row there now lists 3.1, 3.4–3.12.
- **No internal IDs in body text.** "Linear ENG-223", "Brain, דף …" and "FK-H-…" appear only in the Sources sections and in MDX comments (I searched the visible text of all 13 pages outside "מקורות"). The map cards keep the word "Brain" (B-1).
- **Teaching numbers are labelled** above every exercise set and in every worked example; scenarios are "תרחיש להמחשה, לא מה שצפוי לקרות".

#### C-1 · should fix (or record the scope) · AUTHORING now requires a video in every regular lesson; 3.2–3.10 have none
- **Where:** `course/AUTHORING.md`: "**Every regular lesson has a video** (Dvir, 2026-10-10), even where the map's video column says '—'". `public/video/` has 3-1 and 3-11 only; the MDX comments of 3.2–3.10 still say "The map lists no video for this lesson".
- **Problem:** nine regular lessons break a house rule dated today. Stages 1 and 2 are in the same state (1-2, 1-7; 2-1, 2-9, 2-11), so this is a scope question as much as a stage-3 gap.
- **Fix:** either add the videos (3.2's "הבונה", 3.5's linked row and 3.8's forecast-not-ceiling are the strongest candidates), or record in AUTHORING (with who and when) that the rule applies from stage 4, or to stages 1–3 in a later pass.

#### C-2 · should fix · in the lessons' multiple-choice exercises the right answer is usually first and longest
- **Where:** `ChoiceExercise.vue` renders options in source order and does not shuffle. In stage 3, 13 of 24 choice exercises put the right answer first, and in 16 of 24 it is the longest option (measured on the source text); every first exercise of 3.1–3.6 has both (e.g. 3.6-7: "על היתרה המוצמדת ביום נקודת העדכון, לחודשים שנשארו, ומשם התשלום שוב זז עם המדד" against "לא מחשבים מחדש: במסלול צמוד רק המדד מזיז את התשלום").
- **Problem:** the stage-2 fix shuffled the check, not the practice. A learner trained on the lessons learns "pick the first, longest option", and the check then punishes it.
- **Fix:** give `ChoiceExercise` the same per-id seeded shuffle `StageCheck` now has (one shared-component change), and trim the longest right options (3.1-1, 3.5-1, 3.6-7, 3.7-7, 3.11-6, 3.12-2) to the length of the others.

#### C-3 · should fix · "כמו בלוח של בנק" states as fact what the course only assumes
- **Where:** 3.1 (illustration intro, "מעוגלת לאגורה, כמו בלוח של בנק"); the callout title "עיגול, כמו בלוח של בנק" in 3.5, 3.6 and 3.7; "מחושבים כמו לוח של בנק" in 3.8, 3.10, 3.11 and the sources of 3.5–3.11.
- **Problem:** 3.1, 3.2, 3.4 and 3.12 say the opposite in their sources ("בנק יכול לעגל אחרת"; "הצוות לא קבע עדיין סף מספרי להתאמה ללוח של בנק"), and 3.4's source says the bank-table check covered Spitzer only. Nothing checked a bank's linked rows (3.5), reset rows (3.6) or forecast tables (3.8). An unlabelled claim about how banks compute.
- **Fix:** "עיגול, כמו בלוח שבנינו בשיעור 3.2" (or "לפי כלל העיגול של הקורס"), and in the sources: "זו הנחת החישוב של הקורס; לוחות שפיצר של שני בנקים תאמו לה (ENG-223), לוחות צמודים ומשתנים לא נבדקו; בנק יכול לעגל אחרת."

---

## Part D: the phone

I cut each `phone_lessons_3-*_.png` (390px, taken 14:13 from the 14:11 build) and `phone_checks_3_.png` into strips and read every table, formula box and component. No page scrolls sideways; no `<M>` or `.ltr` span reads backwards (I zoomed into the spreadsheet formulas, the signed numbers and the check's "−120").
- **Fixed since the first round:** 3.2's three-month table is month cards; 3.5's table no longer wraps ₪ (3.5-c is what is left); 3.6's half table and the FillTable headers in 3.2–3.11 have a gap between columns; 3.8's three reading tables fit with the key column first, and its FillTable periods read "6 עד 10"; 3.10's present-value and bisection tables fit; 3.11's summary table fits; 3.12's inline formulas do not break; PaymentFinder's "−1 ₪ / +1 ₪" and RateReset's "+1.2" read correctly; WhereMoneyGoes's "מכל 100 ₪" adds to 100.
- **Left:** 3.5-c (the balance column cut inside its numbers) and 3.3-c (the formula box broken after the bracket). Long but correct: ScheduleBuilder's twelve month cards per year (3.2–3.4) and the 3.12 cell table, whose "מה" column wraps to five lines.

---

## Count

| Severity | Items |
|---|---|
| must fix | 1 — 3.8-a |
| should fix | 6 — 3.8-b, K-1, B-3, C-1, C-2, C-3 |
| nit | 18 — 3.1-a, 3.1-b, 3.1-c, 3.2-a, 3.3-a, 3.3-b, 3.3-c, 3.4-a, 3.5-a, 3.5-b, 3.5-c, 3.10-a, 3.11-a, 3.12-a, 3.12-b, K-2 (four slips, counted once), B-1, B-2 (the cause behind 3.1-c) |

**Verification summary.** The first round had 10 must-fix and 37 should-fix items in the two lesson reports (3.1–3.6: 5 and 19; 3.7–3.12: 5 and 18) and 4 should-fix items in the components report. I checked each against the current page or source: **all 10 must-fix and all 41 should-fix items are fixed.** Two were fixed most of the way and leave a nit (3.5-4 → 3.5-b; 3.5-7 → 3.5-c). Of the nits, one is not fixed (3.12-3, the solution sheet's cached values → 3.12-a) and one was fixed in the heading but not the summary (3.3-5 → 3.3-a). Three new problems came in with the fixes: the switch to the statement convention moved 3.8 exercise 5's maximum to a closing month the learner cannot see (3.8-a, the one must-fix), the renames created four name collisions (B-3), and the check, untouched since 11:39, kept two sentences the lessons corrected (K-1, K-2). No fix introduced a wrong number anywhere else: every number on the twelve pages, in every exercise answer and listed error, and in the check, recomputes in Decimal with my own code and holds on the printed numbers.

## Verdict

**Stage 3 can close after these fixes.** Only one item is blocking, and it is small: 3.8's exercise 5 marks the correct reading of its own table as wrong, because the answer key took the one closing month (1.18 ₪ higher) that the table does not show; replacing the answer fact with the period-start maximum, or adding `near={2}` and a sentence, fixes it. The six should-fix items are cheap and mostly text: two strings in the map card and the glossary (3.8-b), one sentence in the check (K-1), four renames (B-3), one shared-component shuffle (C-2), a reworded callout title (C-3), and a decision about videos that also covers stages 1–2 (C-1). The rest is polish.

The stage itself is now sound as a path: the payment from present value (3.1) → its two parts (3.2) → the balance at any month (3.3) → every method (3.4) → indexation row by row (3.5) → rate resets (3.6) → a mix as one cash flow (3.7) → three payment figures and what is known (3.8) → the total (3.9) → present value and IRR (3.10) → three measures, three answers (3.11) → the workshop (3.12). One rounding convention runs through all of it, the same loan gives the same number in every lesson and in 2.9, the first-payment line reads the same everywhere, the forecast is never a ceiling, the official rules are unverified and dated, Mogi decisions and field knowledge are marked as the house rules require, and case A waits for stage 5.
