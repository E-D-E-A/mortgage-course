/**
 * Stage 6's nodes on the big-picture map: positioning and strategy. What a threshold is and how a
 * step in the price hangs on it (6.2), the levers a client can pull and what each costs (6.3–6.4),
 * the red line between positioning and wrong information (6.5), the process with the banks —
 * outreach, how long an offer holds, what moves while waiting (6.6), negotiation and the competing
 * offer (6.7), why a bank answers with its own mix (6.8), the underwriter (6.9) and the plan the
 * workshop ends with (6.11). Lesson 6.1 adds links only: how the factors already on the map act on
 * each other. Lesson 6.10, the conversation tree, adds two links.
 *
 * Written by the author of 6.9–6.11 from the stage brief (course/stage-6-brief.md), the course map
 * (sections 1 and 5) and the research notes, on 2026-10-16, while the authors of 6.1–6.8 were
 * writing their lessons: the cards of 6.1–6.8 need one consistency read against those lessons'
 * final text. No card states a number: every figure belongs in the lesson, with its label.
 *
 * Sources for the cards: almost all of stage 6 is field knowledge (research/field-knowledge.md:
 * FK-H-050, 051, 052, 055, 071, 072, 073, 081, 091, 093), which the course labels as such and which
 * waits for Eylon; what the cards say about how a bank prices or decides is NOT known to the
 * course, and the cards say so. The red line is a decision of Mogi (Brain 33718276, through
 * research/notes/brain-calculation.md, 2026-08-31). The fictional banks and their rules in lessons
 * 6.9–6.11 are the exercise's, never the market's.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  // ───────────── 6.2: thresholds and steps ─────────────
  {
    id: "threshold",
    label: "סף",
    region: "bank",
    lesson: "6.2",
    kind: "factor",
    card: {
      what: "ערך של גורם שמעליו משהו משתנה: אסור לבנק לאשר, הבנק צריך להחזיק יותר הון, בנק מסרב על פי קו משלו, או שהמחיר קופץ.",
      role: "ספים הם הסיבה שהמרחק מהקו חשוב יותר מהמספר עצמו. מי שיושב מעט מעל סף יכול להיות במצב אחר לגמרי ממי שיושב מעט מתחתיו.",
      note: "שיעור 6.2. חמישה סוגי סף: מגבלה רגולטורית, סף הון, מדיניות בנק, השערה מהשטח ודוגמה של הקורס (הנחת חישוב). רק הראשון הוא חוק, לפי תעתיק הצוות, לא אומת. ספים של בנקים אינם ידועים לקורס (ידע מהשטח; ממתין לאישור אילון).",
    },
  },
  {
    id: "margin_step",
    label: "מדרגת מרווח",
    region: "bank",
    lesson: "6.2",
    kind: "factor",
    card: {
      what: "קפיצה במרווח, ולכן בריבית, כשגורם חוצה סף. לא עלייה הדרגתית: בצד אחד של הקו מחיר אחד, ובצד השני מחיר אחר.",
      role: "היא מה שהופך מרחק קטן מהקו להבדל של שקלים לאורך כל ההלוואה.",
      note: "שיעור 6.2. שיעור מימון ויחס החזר כגורמים למדרגה — ידע מהשטח (טובי זמיר, 2026-08-05), ממתין לאישור אילון. גובה המדרגה בכל בנק — לא ידוע.",
    },
  },
  {
    id: "positioning",
    label: "מיצוב",
    region: "property",
    lesson: "6.2",
    kind: "factor",
    card: {
      what: "ההחלטות על הבקשה עצמה, לפני התמהיל: כמה מבקשים, באיזה הרכב, מתי, ואילו נתונים אמיתיים מציגים ובאיזו צורה. מיצוב בוחר בין נתונים אמיתיים ומציג אותם במלואם, בצורה החזקה ביותר.",
      role: "מטרתו להביא את התיק לבנק רחוק מהספים הרלוונטיים, ולהשאיר ללקוחות כוח מיקוח. הוא לא בא על חשבון המשפחה.",
      note: "שיעור 6.2, וההגדרה המלאה והקו האדום בשיעור 6.5. הדוגמה המספרית של סף היא דוגמה לימודית (ידע מהשטח; ממתין לאישור אילון).",
    },
  },

  // ───────────── 6.3–6.4: levers and what they cost ─────────────
  {
    id: "lever",
    label: "מנוף",
    region: "client",
    lesson: "6.3",
    kind: "factor",
    card: {
      what: "דבר שהלקוחות יכולים באמת לשנות לפני הבקשה: הון עצמי נוסף והלוואה קטנה יותר, התקופה, סגירת הלוואות, התנהלות החשבון, תיעוד ההכנסות, הרכב הלווים, הרכב התמהיל, הבנק והעיתוי.",
      role: "מנוף מושך גורם אחד לכיוון טוב, ולרוב מושך גורם אחר לכיוון רע. אין מנוף חינם.",
      note: "שיעור 6.3. תשעה מנופים, לפי ידע מהשטח (ממתין לאישור אילון). מה שאי אפשר לשנות — הרגולציה, ההיסטוריה — אינו מנוף.",
    },
  },
  {
    id: "close_loans",
    label: "סגירת הלוואות",
    region: "client",
    lesson: "6.3",
    kind: "factor",
    card: {
      what: "פירעון הלוואה קיימת לפני הבקשה, כדי שההחזר שלה לא ייספר מול ההכנסה.",
      role: "הוא מוריד את יחס ההחזר, אבל הכסף לסגירה בא בדרך כלל מההון העצמי. הון עצמי קטן יותר פירושו הלוואה גדולה יותר ושיעור מימון גבוה יותר, ולפעמים חציית הקו.",
      note: "שיעורים 6.3 ו־6.11. בתיק א׳ זה בדיוק המנוף שמושך לשני כיוונים: ההלוואה הגדלה כבר מחוץ לתקרת שיעור המימון.",
    },
  },
  {
    id: "income_docs",
    label: "תיעוד ההכנסות",
    region: "client",
    lesson: "6.3",
    kind: "factor",
    card: {
      what: "הצגת כל ההכנסה האמיתית במסמכים שהבנק מקבל, בצורה שהוא מכיר.",
      role: "הכנסה שהיא אמיתית אבל לא מתועדת לא נספרת. תיעוד אותה במלואה הוא מיצוב. ניפוח הכנסה אינו תיעוד.",
      note: "שיעורים 6.3 ו־6.5. מה בנק מכיר בפועל — ידע מהשטח, ממתין לאישור אילון.",
    },
  },
  {
    id: "lever_price",
    label: "מחיר המנוף",
    region: "result",
    lesson: "6.4",
    kind: "factor",
    card: {
      what: "מה המנוף עולה ללקוחות, בשקלים: סכום תשלומים גבוה יותר, כרית ביטחון קטנה יותר, חשיפה גדולה יותר או זמן.",
      role: "מיצוב טוב הוא השוואה בשקלים בין מה שמרוויחים לבין מה שמשלמים, ולא רק ירידה במספר אחד.",
      note: "שיעור 6.4. הרווח מחושב. הרווח מול הבנק, כלומר כמה הריבית יורדת, אינו ידוע: בשיעורים 6.9–6.11 הוא נקבע בכללים בדויים.",
    },
  },

  // ───────────── 6.5: the red line ─────────────
  {
    id: "red_line",
    label: "הקו האדום",
    region: "regulation",
    lesson: "6.5",
    kind: "factor",
    card: {
      what: "הגבול שהקורס, והחלטה של Mogi, לא עוברים: לבחור בין נתונים אמיתיים ולהציג אותם במלואם מותר. להסתיר התחייבות, לנפח הכנסה או להגיש מסמך לא נכון אסור.",
      role: "הוא מפריד בין מיצוב לבין מידע לא נכון. הצד השני של הקו עלול לעלות ביוקר: בנק אולי יסרב, יבטל או ידרוש פירעון, ואולי יש סיכון משפטי ליועץ וללקוחות. כל זה לא אומת.",
      note: "שיעור 6.5. החלטה של Mogi מ־2026-08-31: נתון שסותר את מה שהלקוח אמר לא נשלח לבנק בלי לשאול אותו. המשמעות המשפטית לא נבדקה, ושאלה לעורך הדין.",
    },
  },
  {
    id: "misleading_info",
    label: "מידע לא נכון",
    region: "client",
    lesson: "6.5",
    kind: "factor",
    card: {
      what: "הסתרת התחייבות, ניפוח הכנסה או מסמך לא נכון. אותה עובדה אפשר להציג בשני סיפורים, ורק אחד מהם נשאר נאמן לעובדות.",
      role: "בנק אולי בודק את המוצהר מול המאומת, ופער ביניהם עלול להיות בדיוק מה שהבדיקה מחפשת. איך בנק אמיתי בודק: לא אומת.",
      note: "שיעור 6.5. מופיע בקורס רק כדוגמה למה שאסור, ולא כטכניקה.",
    },
  },

  // ───────────── 6.6–6.7: the process with the banks ─────────────
  {
    id: "outreach",
    label: "פנייה לבנקים",
    region: "bank",
    lesson: "6.6",
    kind: "factor",
    card: {
      what: "לאילו בנקים פונים, באיזה סדר, ולמה בכמה במקביל. כל בקשה נבדקת בנפרד, וכל בנק עונה בזמן אחר.",
      role: "הפנייה במקביל היא מה שמאפשר להשוות הצעות, כשהן על אותו בסיס. כמה בנקים נכון לבקש ממנו — שאלה פתוחה: ידע מהשטח אומר דברים שונים.",
      note: "שיעור 6.6. ידע מהשטח (ממתין לאישור אילון) סותר את עצמו: להתמקד בשניים או שלושה, בכמה שיותר, או בשניים שכבר עובדים איתם. Mogi עובדת עם עד ארבעה בנקים במקביל (החלטה, 2026-08-13).",
    },
  },
  {
    id: "offer_validity",
    label: "תוקף הצעה",
    region: "bank",
    lesson: "6.6",
    kind: "factor",
    card: {
      what: "כמה זמן אישור עקרוני מחזיק, מתאריך שלו. כל אישור נספר מתאריכו, לא מתאריך הפנייה.",
      role: "הוא השעון שמכתיב כמה זמן יש להחליט, ומתי כבר אין זמן לסבב נוסף.",
      note: "שיעור 6.6. הרצפה לפי תעתיק של הצוות להוראה 451, לא אומת. מה שבנקים נותנים בפועל — ידע מהשטח, ממתין לאישור אילון.",
    },
  },
  {
    id: "rate_drift",
    label: "ריבית שזזה בהמתנה",
    region: "market",
    lesson: "6.6",
    kind: "factor",
    card: {
      what: "הריבית בשוק ובפריים יכולה לזוז בין הצעה לחתימה. מסלול פריים זז איתה בהגדרה.",
      role: "הצעה היא נקודת זמן. מה שקורה לריבית שהוצעה כשהשוק זז בזמן ההמתנה תלוי בתנאים של כל הצעה, ובכמה מהר זה קורה — לא ידוע.",
      note: "שיעורים 6.6 ו־6.10. השאלה מה בנק מחזיק ומה לא היא שאלה פתוחה לאילון.",
    },
  },
  {
    id: "negotiation",
    label: "משא ומתן",
    region: "bank",
    lesson: "6.7",
    kind: "factor",
    card: {
      what: "הדיבור עם הבנק על התנאים אחרי שיש הצעה: המרווח בכל מסלול, עמלות, שמאות, ביטוחים. את הרגולציה אי אפשר לשנות.",
      role: "מה פתוח למשא ומתן הוא ידע מהשטח ולא כלל כתוב. אילו בקשות בנק יסרב אפילו לשמוע — לא ידוע.",
      note: "שיעור 6.7. ידע מהשטח (ממתין לאישור אילון): אם המרווח כבר נמוך, הצעה נגדית לא תעזור.",
    },
  },
  {
    id: "competing_offer",
    label: "הצעה מתחרה",
    region: "bank",
    lesson: "6.7",
    kind: "factor",
    card: {
      what: "הצעה כתובה של בנק אחר, לאותו סכום, אותו תמהיל ואותו חודש.",
      role: "זו הדרך שהקורס מלמד להראות לבנק מחיר אחר, ורק הצעה אמיתית ובעלת תוקף. לומר שיש הצעה כשאין היא מידע לא נכון.",
      note: "שיעור 6.7. האם סבב נוסף משפר הצעה — לא ידוע: ההנחה המסחרית המרכזית של הקורס, שלא נבדקה, ושאלה פתוחה לאילון.",
    },
  },

  // ───────────── 6.8: why a bank answers with its own mix ─────────────
  {
    id: "counter_offer",
    label: "הצעה נגדית",
    region: "bank",
    lesson: "6.8",
    kind: "factor",
    card: {
      what: "תמהיל שהבנק מציע במקום התמהיל שביקשו, כשהוא לא רוצה לתת את מה שנתבקש כפי שהוא.",
      role: "היא יכולה להיות טובה ללקוחות או רק לבנק. הדרך לדעת היא להשוות אותה בשקלים לבקשה המקורית, באותו בסיס.",
      note: "שיעור 6.8. למה בנק בוחר תמהיל מסוים — לא ידוע; ידע מהשטח (ממתין לאישור אילון) רק מתאר דוגמה לתשובה כזו.",
    },
  },
  {
    id: "bank_preference",
    label: "מה משתלם לבנק",
    region: "bank",
    lesson: "6.8",
    kind: "factor",
    card: {
      what: "אילו מסלולים וסכומים הבנק מעדיף לתת, לפי העלות שלו, ההון שהוא מחזיק והיעד של החודש.",
      role: "הוא מסביר למה הצעה נראית כמו שהיא נראית, אבל הקורס לא יודע אילו מסלולים משתלמים לבנק בפועל.",
      note: "שיעור 6.8. כל מה שנאמר על תיאבון של בנק הוא ידע מהשטח (ממתין לאישור אילון), ולא נבדק.",
    },
  },

  // ───────────── 6.9: the underwriter ─────────────
  {
    id: "underwriter",
    label: "חתם אשראי",
    region: "bank",
    lesson: "6.9",
    kind: "actor",
    card: {
      what: "האדם בבנק שמקבל תיק, בודק אותו מול הקווים של הבנק ואומר אישור או סירוב, ובאיזה מחיר.",
      role: "הוא רואה מספרים ומסמכים, לא את המשפחה. מה שלא כתוב בתיק לא קיים מבחינתו. לכן מה שמגישים, ובאיזו צורה, הוא חלק מההחלטה.",
      note: "שיעור 6.9: סימולציה של יום בתור חתם, בבנק בדוי ובכללים בדויים. איך חתם אמיתי מחליט, ובאיזו מידה ההחלטה שלו מכוונת על ידי יעדים, לא ידוע (ידע מהשטח; ממתין לאישור אילון).",
    },
  },

  // ───────────── 6.11: the plan ─────────────
  {
    id: "positioning_plan",
    label: "תוכנית מיצוב",
    region: "result",
    lesson: "6.11",
    kind: "factor",
    card: {
      what: "אילו מנופים מפעילים בתיק, כמה כל אחד עולה בשקלים, ומה הוא אמור להשיג.",
      role: "היא התוצר הראשון של השלב. היא נכתבת מול הקווים הידועים והלא ידועים של הבנקים, ומציגה גם מה לא ידוע ומה ישנה אותה.",
      note: "שיעור 6.11, על תיק א׳ ובבנקים בדויים.",
    },
  },
  {
    id: "outreach_plan",
    label: "תוכנית פנייה",
    region: "result",
    lesson: "6.11",
    kind: "factor",
    card: {
      what: "אילו בנקים מקבלים את הבקשה, באיזה סדר ובאילו תאריכים, ומה ידוע על התוקף של כל הצעה שתחזור.",
      role: "היא מה שהופך תוכנית מיצוב לצעדים בלוח שנה, והיא נבדקת מול שעוני התוקף.",
      note: "שיעור 6.11.",
    },
  },
  {
    id: "bank_questions",
    label: "שאלות ממוקדות",
    region: "result",
    lesson: "6.11",
    kind: "factor",
    card: {
      what: "מה שואלים כל בנק, כדי לגלות את מה שהקורס לא יודע: איפה הקווים שלו, מה נפתח למשא ומתן ועד מתי ההצעה מחזיקה.",
      role: "ספים של בנק אינם נגלים מבחוץ. הדרך לדעת אותם היא לשאול, ולכתוב את התשובה.",
      note: "שיעור 6.11.",
    },
  },
];

export const links: MapLink[] = [
  // 6.1 — how the factors already on the map act on each other
  { from: "mix", to: "pti", label: "התמהיל קובע את ההחזר שנכנס ליחס", lesson: "6.1" },
  { from: "term", to: "pti", label: "תקופה ארוכה מורידה את ההחזר, ולכן את היחס", lesson: "6.1" },
  { from: "loan_amount", to: "pti", label: "הלוואה גדולה יותר — החזר גבוה יותר, ולכן יחס גבוה יותר", lesson: "6.1" },
  { from: "equity", to: "pti", label: "יותר הון עצמי — פחות הלוואה, ולכן פחות החזר", lesson: "6.1" },
  { from: "obligations", to: "pti", label: "התחייבות שנספרת מקטינה את ההכנסה הפנויה, ולכן מגדילה את היחס", lesson: "6.1" },
  { from: "ltv", to: "bank_policy", label: "גם שיעור המימון נבחן מול קו של הבנק (השערה מהשטח, לא נבדק)", lesson: "6.1" },
  // 6.2
  { from: "pti", to: "threshold", label: "היחס נבחן מול כמה ספים", lesson: "6.2" },
  { from: "ltv", to: "threshold", label: "גם שיעור המימון נבחן מול ספים", lesson: "6.2" },
  { from: "directive_329", to: "threshold", label: "סוג אחד של סף: מגבלה רגולטורית", lesson: "6.2" },
  { from: "capital_threshold", to: "threshold", label: "סוג שני: סף הון", lesson: "6.2" },
  { from: "bank_policy", to: "threshold", label: "סוג שלישי: קו של בנק", lesson: "6.2" },
  { from: "threshold", to: "margin_step", label: "חציית סף יכולה להזיז את המחיר בקפיצה (ידע מהשטח)", lesson: "6.2" },
  { from: "margin_step", to: "spread", label: "המדרגה נוספת למרווח", lesson: "6.2" },
  { from: "positioning", to: "threshold", label: "מיצוב בודק היכן התיק יושב ביחס לספים", lesson: "6.2" },
  // 6.3
  { from: "lever", to: "loan_amount", label: "מנוף: לשנות את סכום ההלוואה", lesson: "6.3" },
  { from: "lever", to: "equity", label: "מנוף: להכניס יותר או פחות הון עצמי", lesson: "6.3" },
  { from: "lever", to: "term", label: "מנוף: לשנות את התקופה", lesson: "6.3" },
  { from: "lever", to: "mix", label: "מנוף: לבקש הרכב אחר", lesson: "6.3" },
  { from: "lever", to: "borrower_composition", label: "מנוף: להוסיף או להסיר לווה", lesson: "6.3" },
  { from: "lever", to: "account_conduct", label: "מנוף: התנהלות החשבון בחודשים שלפני (ידע מהשטח, פער)", lesson: "6.3" },
  { from: "lever", to: "close_loans", label: "מנוף: לסגור הלוואה לפני הבקשה", lesson: "6.3" },
  { from: "lever", to: "income_docs", label: "מנוף: לתעד את כל ההכנסה", lesson: "6.3" },
  { from: "close_loans", to: "obligations", label: "ההתחייבות נעלמת מהחישוב", lesson: "6.3" },
  { from: "close_loans", to: "equity", label: "הכסף לסגירה בא בדרך כלל מההון העצמי", lesson: "6.3" },
  { from: "close_loans", to: "ltv", label: "פחות הון עצמי — הלוואה גדולה יותר — שיעור מימון גבוה יותר", lesson: "6.3" },
  { from: "income_docs", to: "recognized_income", label: "מה שמתועד נספר", lesson: "6.3" },
  { from: "positioning", to: "lever", label: "המיצוב מפעיל מנופים", lesson: "6.3" },
  // 6.4
  { from: "lever", to: "lever_price", label: "לכל מנוף יש מחיר", lesson: "6.4" },
  { from: "term", to: "total_paid", label: "תקופה ארוכה — סך תשלומים גבוה יותר", lesson: "6.4" },
  { from: "lever_price", to: "positioning", label: "מיצוב טוב משווה בשקלים רווח מול מחיר", lesson: "6.4" },
  { from: "lever_price", to: "living_budget", label: "יש מחיר שמשלמת הכרית של המשפחה", lesson: "6.4" },
  // 6.5
  { from: "red_line", to: "positioning", label: "מיצוב נשאר בתוך הקו", lesson: "6.5" },
  { from: "misleading_info", to: "red_line", label: "הצד השני של הקו", lesson: "6.5" },
  { from: "underwriting", to: "misleading_info", label: "הבדיקה מחפשת פער בין מוצהר למאומת", lesson: "6.5" },
  { from: "obligations", to: "misleading_info", label: "הסתרת התחייבות", lesson: "6.5" },
  { from: "recognized_income", to: "misleading_info", label: "ניפוח הכנסה", lesson: "6.5" },
  // 6.6
  { from: "advisor", to: "outreach", label: "מחליט למי פונים ובאיזה סדר", lesson: "6.6" },
  { from: "outreach", to: "bank", label: "בקשה לכל בנק בנפרד", lesson: "6.6" },
  { from: "other_offers", to: "outreach", label: "פנייה במקביל מייצרת הצעות להשוואה", lesson: "6.6" },
  { from: "pre_approval", to: "offer_validity", label: "כל אישור נספר מתאריכו", lesson: "6.6" },
  { from: "boi_rate", to: "rate_drift", label: "ריבית בנק ישראל זזה", lesson: "6.6" },
  { from: "prime", to: "rate_drift", label: "מסלול פריים זז איתה", lesson: "6.6" },
  { from: "rate_drift", to: "offered_rate", label: "מה קורה לריבית שהוצעה — תלוי בתנאי ההצעה; לא ידוע", lesson: "6.6" },
  // 6.7
  { from: "personal_offer", to: "competing_offer", label: "הצעה אישית של בנק אחד היא מתחרה אצל אחר", lesson: "6.7" },
  { from: "competing_offer", to: "negotiation", label: "כלי של המשא ומתן, אם היא אמיתית", lesson: "6.7" },
  { from: "negotiation", to: "spread", label: "המרווח הוא מה שאולי נפתח", lesson: "6.7" },
  { from: "directive_329", to: "negotiation", label: "הרגולציה אינה פתוחה למשא ומתן", lesson: "6.7" },
  { from: "negotiation", to: "offered_rate", label: "יכול לשנות את הריבית; כמה — לא ידוע", lesson: "6.7" },
  // 6.8
  { from: "proposed_basket", to: "counter_offer", label: "התשובה של הבנק היא סל מוצע משלו", lesson: "6.8" },
  { from: "bank_preference", to: "counter_offer", label: "אולי מסביר למה הבנק עונה כך; לא ידוע", lesson: "6.8" },
  { from: "counter_offer", to: "good_mix", label: "נבדקת כמו כל תמהיל: בשקלים, באותו בסיס", lesson: "6.8" },
  { from: "mix", to: "counter_offer", label: "הבקשה שאליה הבנק משיב", lesson: "6.8" },
  // 6.9
  { from: "bank", to: "underwriter", label: "מעסיק אותו, ונותן לו קווים", lesson: "6.9" },
  { from: "bank_policy", to: "underwriter", label: "הקווים שהוא מפעיל", lesson: "6.9" },
  { from: "pti", to: "underwriter", label: "אחד המספרים שהוא קורא", lesson: "6.9" },
  { from: "ltv", to: "underwriter", label: "והמספר השני", lesson: "6.9" },
  { from: "underwriter", to: "underwriting", label: "עושה את הבדיקה", lesson: "6.9" },
  { from: "underwriter", to: "approval", label: "אומר אישור או סירוב", lesson: "6.9" },
  { from: "underwriter", to: "margin_step", label: "מוסיף מדרגה כשחצו קו", lesson: "6.9" },
  // 6.10 — the conversation tree
  { from: "advisor", to: "competing_offer", label: "מביא הצעה כתובה לשיחה", lesson: "6.10" },
  { from: "advisor", to: "offer_validity", label: "שואל מה מחזיק ועד מתי", lesson: "6.10" },
  // 6.11
  { from: "lever_price", to: "positioning_plan", label: "כל מנוף בתוכנית עם מחירו", lesson: "6.11" },
  { from: "positioning", to: "positioning_plan", label: "התוכנית היא המיצוב על הנייר", lesson: "6.11" },
  { from: "outreach", to: "outreach_plan", label: "הפנייה בסדר ובתאריכים", lesson: "6.11" },
  { from: "offer_validity", to: "outreach_plan", label: "התאריכים נקבעים לפי התוקף", lesson: "6.11" },
  { from: "threshold", to: "bank_questions", label: "ספים לא ידועים — שואלים", lesson: "6.11" },
  { from: "bank_questions", to: "outreach_plan", label: "כל פנייה נושאת את השאלות שלה", lesson: "6.11" },
  { from: "positioning_plan", to: "feasibility", label: "הדף שמתחילים ממנו הוא דף ההיתכנות", lesson: "6.11" },
];
