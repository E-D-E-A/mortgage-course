/**
 * The lever map (lesson 6.3): everything a client can really change before and on the way to a bank. A lever is
 * something the client (or the advisor, for the client) can move, that moves a file toward or away from a line.
 * Not levers: the Bank of Israel's rate, the directives, a bank's cost of money, the market (lesson 6.3 says so).
 *
 * Each lever answers three questions: what does it improve, what does it cost, and when not to pull it. The four
 * "effects" columns are logic or arithmetic, not field claims: what happens to the payment ratio, the financing
 * ratio, the total paid and the family's cushion when THIS lever is pulled in the direction that helps the ratio.
 * Where the effect depends on how it is pulled, it says "depends". What a bank DOES about a changed ratio is not
 * here: it is unknown (lesson 4.12), and the lever map never says it.
 *
 * Every card carries a `basis`: what kind of claim it is. "חישוב" means exact arithmetic on the course's own
 * numbers; "תעתיק הצוות" a directive as the team transcribed it, not checked against the source; "ידע מהשטח" a
 * professional's claim with its FK id, waiting for Eylon; "לא ידוע" says what no source gives.
 *
 * The case-A numbers are NOT here: the lesson page passes them to the component as notes, computed in code
 * (scripts/lessons/lesson-6-3.ts). Lesson 6.4 (author B) prices each lever; it may import this list for names.
 */
export type Effect = "better" | "worse" | "none" | "depends";

export interface LeverCard {
  id: string;
  name: string;
  /** "file": changes the application itself. "road": changes how and when it reaches the bank. */
  group: "file" | "road";
  /** One sentence: what the client does. */
  what: string;
  improves: string;
  costs: string;
  whenNot: string;
  /** What the lever does to four things, when pulled in the direction that helps the payment ratio. */
  effects: { pti: Effect; ltv: Effect; total: Effect; cushion: Effect };
  basis: { kind: string; text: string };
}

export const EFFECT_COLUMNS: { key: keyof LeverCard["effects"]; label: string }[] = [
  { key: "pti", label: "יחס ההחזר" },
  { key: "ltv", label: "שיעור המימון" },
  { key: "total", label: "סך התשלומים" },
  { key: "cushion", label: "כרית המשפחה" },
];

export const EFFECT_TEXT: Record<Effect, string> = { better: "משתפר", worse: "מחמיר", none: "לא זז", depends: "תלוי" };

export const GROUP_NAME: Record<LeverCard["group"], string> = { file: "מה משנים בתיק", road: "מה משנים בדרך לבנק" };

export const LEVERS: LeverCard[] = [
  {
    id: "equity",
    name: "הון עצמי נוסף, והלוואה קטנה יותר",
    group: "file",
    what: "מביאים יותר הון עצמי ולוקחים הלוואה קטנה בהתאם. כשהמחיר קבוע, ״גובה ההלוואה״ ו״ההון העצמי״ הם מנוף אחד משני צדדים.",
    improves: "ההחזר קטן, ולכן יחס ההחזר יורד; שיעור המימון יורד; סך הריבית שמשלמים יורד.",
    costs: "חיסכון שכבר לא נשאר בצד, ככרית למשפחה. הכסף לא ״הולך לאיבוד״: הוא מקטין את ההלוואה. אבל מי שמשקיע את כל חסכונו בדירה נשאר בלי כרית לתיקון, לאובדן הכנסה או להוצאה לא צפויה.",
    whenNot: "כשההון העצמי הוא כבר כל מה שיש, או כשהסכום הנוסף נלקח מכרית ההוצאות; וכשהקו שרוצים להגיע אליו רחוק, כי המחיר גדל עם המרחק (שיעור 6.2).",
    effects: { pti: "better", ltv: "better", total: "better", cushion: "worse" },
    basis: { kind: "חישוב", text: "חשבון מדויק על המספרים של הקורס (שיעור 6.2). שהכרית חשובה היא ידע כלכלי כללי, בלי מספר." },
  },
  {
    id: "term",
    name: "תקופה ארוכה יותר",
    group: "file",
    what: "מאריכים את התקופה של המסלולים, עד התקופה המרבית.",
    improves: "ההחזר החודשי קטן, ויחס ההחזר יורד. הכרית החודשית של המשפחה גדלה.",
    costs: "סך התשלומים גדל: משלמים ריבית על יותר חודשים. ההפרש נמדד בשקלים, ולא נעלם.",
    whenNot: "כשהתקופה כבר המרבית, 30 שנה לפי תעתיק הצוות להוראה 329 (כמו בתיק א׳); וכשהאורך הנוסף בא על חשבון גיל הלווים בסוף ההלוואה (שאלה פתוחה משיעור 4.11).",
    effects: { pti: "better", ltv: "none", total: "worse", cushion: "better" },
    basis: { kind: "חישוב", text: "חשבון מדויק (שיעור 6.2). התקופה המרבית: תעתיק הצוות של הוראה 329, לא אומת." },
  },
  {
    id: "close_loans",
    name: "סגירת הלוואות קטנות לפני הבקשה",
    group: "file",
    what: "סוגרים הלוואה קיימת (רכב, צרכנית) לפני שמגישים, כדי שהיא לא תירד מההכנסה.",
    improves: "התחייבות שנשארו לה יותר מ־18 חודשים נספרת, וסגירתה מוציאה אותה מהחישוב: ההכנסה הפנויה גדלה: יחס ההחזר יורד. גם הריבית על אותה הלוואה כבר לא משולמת.",
    costs: "כסף לסגירה. אם הוא בא מההון העצמי, ההלוואה לדירה גדלה בדיוק בסכום הזה ושיעור המימון עולה, ולפעמים מעל התקרה. אם הוא בא מחיסכון אחר, הכרית קטנה. ייתכנו עמלות סגירה שלא נבדקו.",
    whenNot: "כשנשארו להלוואה פחות מ־18 חודשים (היא כבר לא נספרת); כשהסגירה דוחפת את שיעור המימון מעל תקרה.",
    effects: { pti: "better", ltv: "worse", total: "depends", cushion: "worse" },
    basis: { kind: "תעתיק הצוות", text: "כלל 18 החודשים לפי הוראה 329, נספח א׳, כפי שהצוות תעתק; לא אומת. מה קורה בדיוק ב־18 — שאלה פתוחה. החשבון מדויק." },
  },
  {
    id: "conduct",
    name: "התנהלות החשבון בחודשים שלפני הבקשה",
    group: "road",
    what: "מתנהלים בחשבון כך שהתדפיס נקי: בלי חריגות ובלי החזרות חיוב, והכנסות שנכנסות כסדרן.",
    improves: "מה שהבנק רואה כשהוא בודק את התדפיס מול התלושים (לפי ידע מהשטח, FK-H-015). זה לא מספר ביחס; זה חלק מהחיתום.",
    costs: "זמן: צריך חודשים של התנהלות נקייה, ואי אפשר לתקן אחורה. וגם משמעת בהוצאות באותם חודשים.",
    whenNot: "כשההגשה לא יכולה לחכות, וההתנהלות כבר עברה. אז מה שאפשר הוא להסביר את החריגים, לא לשנות אותם.",
    effects: { pti: "none", ltv: "none", total: "none", cushion: "none" },
    basis: { kind: "ידע מהשטח", text: "בדיקת העו״ש מול התלושים, בממוצע של 3 חודשים (FK-H-015, לפי הצוות ואילון, 2026-09-16; ממתין לאישור אילון). כמה משקל הבנק נותן להתנהלות — לא ידוע." },
  },
  {
    id: "income_docs",
    name: "תיעוד ההכנסות",
    group: "file",
    what: "מביאים לבנק את ההכנסות האמיתיות שיש, בצורה שהוא מכיר: תלושים, שומה, חוזה, דוחות.",
    improves: "ההכנסה המוכרת גדלה, ויחס ההחזר יורד, בלי לשנות את ההלוואה.",
    costs: "זמן ומאמץ לאסוף ולהסביר. ותיעוד אפשרי רק למה שקיים: הכנסה שאין לה בסיס אי אפשר להציג. הצגה כזו היא מידע לא נכון, והקו האדום של שיעור 6.5.",
    whenNot: "כשההכנסה לא קיימת, או שהיא לא יציבה ולא ניתן להוכיח אותה. הצגה של הכנסה שאין היא מידע לא נכון, ולא דרך להציג את התיק בצורה חזקה.",
    effects: { pti: "better", ltv: "none", total: "none", cushion: "none" },
    basis: { kind: "ידע מהשטח", text: "איך כל בנק מכיר בהכנסה, ובעיקר של עצמאי, לא ידוע (FK-H-014, FK-H-015; ממתין לאישור אילון). החשבון מדויק." },
  },
  {
    id: "borrowers",
    name: "הרכב הלווים",
    group: "file",
    what: "מוסיפים לווה (בן משפחה עם הכנסה), או משנים מי חתום ובאיזה תפקיד.",
    improves: "הלווה הנוסף מוסיף הכנסה, ולפעמים הון עצמי: יחס ההחזר יורד.",
    costs: "עוד אדם חתום על ההלוואה ואחראי לה. ההתחייבויות שלו נכנסות לחישוב, וההיסטוריה שלו בבדיקה. זו החלטה משפחתית, לא רק מספר.",
    whenNot: "כשהלווה הנוסף מביא התחייבויות או נתוני אשראי שמחמירים את התמונה; כשהוא לא רוצה או לא יכול להיות אחראי (שיעור 4.10).",
    effects: { pti: "better", ltv: "none", total: "none", cushion: "depends" },
    basis: { kind: "תעתיק הצוות", text: "ההכנסה וההתחייבויות של כל לווה נכנסות לחישוב (שיעורים 4.1, 4.2, 4.10). החשבון מדויק; לא אומת מול ההוראה." },
  },
  {
    id: "mix",
    name: "הרכב התמהיל",
    group: "file",
    what: "משנים אילו מסלולים ובאיזה חלק, על אותה הלוואה ואותה תקופה.",
    improves: "ההחזר הראשון יכול לרדת, ויחס ההחזר איתו.",
    costs: "חשיפה וסך תשלומים שונים (שיעורים 5.6 עד 5.8), וגם אי־ודאות: בנק מתמחר חבילה, ולא בטוח שיציע את אותן ריביות בתמהיל אחר (שיעור 5.10).",
    whenNot: "כשהתמהיל נבחר רק כדי להוריד את היחס, ולא מתאים ליעדים של הלקוח; כשהריביות בחישוב אינן הצעה של בנק.",
    effects: { pti: "depends", ltv: "none", total: "depends", cushion: "depends" },
    basis: { kind: "חישוב", text: "חשבון מדויק על מחירון הקורס, שנותן ריבית אחת לכל סוג מסלול. שבנק אמיתי יתמחר אחרת — FK-H-057 (אילון, 2026-10-08)." },
  },
  {
    id: "bank",
    name: "הבנק שפונים אליו",
    group: "road",
    what: "בוחרים לאילו בנקים פונים, ובכמה במקביל.",
    improves: "קווי המדיניות והמחיר שונים בין בנקים, ולכן אולי בנק אחד יאשר או יציע טוב יותר. איפה, לא ידוע.",
    costs: "זמן ומאמץ לכל בנק; פנייה לכמה בנקים משפיעה על תוקפי האישורים ועל לוחות הזמנים (שיעור 6.6).",
    whenNot: "כשהמכשול הוא מגבלה רגולטורית: היא זהה בכל הבנקים, ואין טעם לעבור בנק כדי לעקוף אותה (שיעור 4.5).",
    effects: { pti: "none", ltv: "none", total: "depends", cushion: "none" },
    basis: { kind: "לא ידוע", text: "איזה בנק מעדיף איזה תיק — שאלה פתוחה לאילון. כמה בנקים לשלוח לאישור: FK-H-055, FK-H-073, FK-H-081, והם סותרים." },
  },
  {
    id: "timing",
    name: "עיתוי",
    group: "road",
    what: "מחכים עם ההגשה, או בוחרים מתי להגיש.",
    improves: "הלוואה שנשארו לה פחות מ־18 חודשים יוצאת מהחישוב בלי לשלם על כך (בדיוק 18: שאלה פתוחה). וייתכן שגם חודש ההגשה בבנק משנה (ידע מהשטח, לא נבדק).",
    costs: "זמן: המתנה מסכנת עסקה שיש לה מועדים, ריבית שזזה (לא ידוע לאן), ואישור שפג תוקפו. המחיר אינו בשקלים, ואין לו מספר.",
    whenNot: "כשיש מועד חוזי שלא זז; כשהריבית עולה ואין סיבה להאמין שתרד.",
    effects: { pti: "better", ltv: "none", total: "depends", cushion: "none" },
    basis: { kind: "ידע מהשטח", text: "יעדים חודשיים של בנק: FK-H-052 (בנקאי בשטח, 2026-08-05): ״זה לא מדע מדויק״; ממתין לאישור אילון. כלל 18 החודשים: תעתיק הצוות, לא אומת." },
  },
];
