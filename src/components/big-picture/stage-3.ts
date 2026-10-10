/**
 * Stage 3's nodes on the big-picture map: the calculation. A track's schedule
 * (3.1–3.6), the mix as one cash flow (3.7), and the measures read off it — the
 * three payments of 3.8, the total paid (3.9), present value and IRR (3.10) —
 * with the links that say what moves each one. Lesson 3.11 (why the three
 * measures differ) and workshop 3.12 add links, not nodes.
 *
 * Sources for the cards: the course map's stage-3 rows; the Brain's calculation
 * decisions (67436545: the payment under current terms is the headline, the
 * first payment and the projected maximum are kept beside it, and a projected
 * maximum is a forecast, not a ceiling), the per-track term (16646263), the
 * comparison measures of Directive 451 (7733250, team transcription, not yet
 * checked against the source) and the three-measures page (67469313).
 * Lessons 3.1–3.11 were written in parallel with this file: each card follows
 * the map's row for its lesson, and is re-read against the lesson once it lands.
 * No card states a number.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  {
    id: "monthly_payment",
    label: "החזר חודשי",
    region: "result",
    lesson: "3.1",
    kind: "factor",
    card: {
      what: "הסכום שמשלמים על מסלול בכל חודש. בשפיצר: התשלום השווה שמביא את היתרה לאפס בדיוק בסוף התקופה, בריבית של המסלול.",
      role: "נגזר מארבעה דברים: הסכום, אחוז הריבית, התקופה ושיטת ההחזר. ההחזר של התמהיל הוא הסכום של ההחזרים של המסלולים.",
      note: "שיעור 3.1. ריבית חודשית = אחוז הריבית לשנה חלקי 12 (לפי בדיקה של הצוות מול לוחות של שני בנקים; Brain, ENG-223).",
    },
  },
  {
    id: "schedule",
    label: "לוח סילוקין",
    region: "result",
    lesson: "3.2",
    kind: "factor",
    card: {
      what: "הטבלה של מסלול, חודש אחר חודש: היתרה בתחילת החודש, התשלום, רכיב הריבית, רכיב הקרן והיתרה בסוף החודש.",
      role: "ממנו קוראים כל מספר אחר: כמה עוד חייבים בכל חודש, כמה הולך לריבית, וכמה משלמים בסך הכול. בכל חודש הריבית מחושבת על היתרה, מעוגלת לאגורה, והחודש האחרון סוגר את מה שנשאר.",
      note: "שיעורים 3.2–3.4; בונים אותו ביד ובגיליון בסדנה 3.12. העיגול הוא הנחת החישוב של הקורס; בנק יכול לעגל אחרת.",
    },
  },
  {
    id: "mix_cashflow",
    label: "תזרים התמהיל",
    region: "mix",
    lesson: "3.7",
    kind: "factor",
    card: {
      what: "כל התשלומים של המשכנתא, חודש אחר חודש: הסכום של הלוחות של כל המסלולים.",
      role: "לכל מסלול תקופה משלו, ולכן בחודשים שונים משלמים על מספר שונה של מסלולים. מהתזרים הזה מחשבים את המדדים של התמהיל כולו.",
      note: "שיעור 3.7. תקופה נפרדת לכל מסלול — החלטה של Mogi (Brain, 16646263).",
    },
  },
  {
    id: "first_payment",
    label: "החזר ראשון",
    region: "result",
    lesson: "3.8",
    kind: "factor",
    card: {
      what: "התשלום החודשי הראשון, לפי התנאים שבהצעה. בלי גרייס הוא בדרך כלל שווה להחזר בתנאים הנוכחיים; עם גרייס הוא רק ריבית, או אפס.",
      role: "מה שיורד מהחשבון בהתחלה. הוא לא מספר מה יקרה אחר כך: במסלולים צמודים ומשתנים התשלום יכול לזוז.",
      note: "שיעור 3.8.",
    },
  },
  {
    id: "current_payment",
    label: "החזר בתנאים הנוכחיים",
    region: "result",
    lesson: "3.8",
    kind: "factor",
    card: {
      what: "התשלום החודשי לפי התנאים של היום: הריביות, המדד והפריים כפי שהם עכשיו.",
      role: "ב־Mogi זה ההחזר שמוצג ללקוח בראש, וההחזר הראשון וההחזר המרבי החזוי מוצגים לידו.",
      note: "שיעור 3.8. החלטה של Mogi (Brain, 67436545, 2026-10-07, התקבלה 2026-10-08; המימוש לא הושלם).",
    },
  },
  {
    id: "max_payment",
    label: "החזר מרבי חזוי",
    region: "result",
    lesson: "3.8",
    kind: "factor",
    card: {
      what: "התשלום החודשי הגבוה ביותר בלוח שמחושב לפי תחזית: של העוגן במסלול משתנה, ושל המדד במסלול צמוד.",
      role: "מראה כמה התשלום עלול לעלות. זו תחזית, לא תקרה מובטחת: אם המדד או הריביות יזוזו אחרת מהתחזית, התשלום יזוז אחרת.",
      note: "שיעור 3.8. שבנק מציג אותו — לפי ההוראה של בנק ישראל, כפי שהצוות העתיק ב־Brain, ממתין לבדיקה מול המקור. ב־Mogi מוצג ליד ההחזר בתנאים הנוכחיים (Brain, 67436545).",
    },
  },
  {
    id: "total_paid",
    label: "סך תשלומים",
    region: "result",
    lesson: "3.9",
    kind: "factor",
    card: {
      what: "כל התשלומים של המשכנתא, מהראשון עד האחרון, מחוברים בשקלים: הקרן, כל הריבית, ובמסלול צמוד גם מה שהמדד הוסיף לחוב.",
      role: "עונה על השאלה ״כמה כסף יוצא בסך הכול״. הוא סוכם שקלים מתקופות שונות כאילו שווים אותו דבר, ולכן הוא לא מדד של מחיר הכסף.",
      note: "שיעור 3.9; למה הוא שונה מערך נוכחי ומ־IRR — שיעור 3.11.",
    },
  },
  {
    id: "present_value",
    label: "ערך נוכחי של התשלומים",
    region: "result",
    lesson: "3.10",
    kind: "factor",
    card: {
      what: "כמה שווים היום כל התשלומים העתידיים, כשמהוונים אותם בריבית שבוחרים (שיעור 0.6).",
      role: "מאפשר להשוות תזרימים שהכסף בהם יוצא בזמנים שונים. התשובה תלויה בריבית שבה מהוונים, ולכן אומרים תמיד באיזו ריבית.",
      note: "שיעור 3.10.",
    },
  },
  {
    id: "irr",
    label: "שיעור תשואה פנימי (IRR)",
    region: "result",
    lesson: "3.10",
    kind: "factor",
    card: {
      what: "הריבית האחת שבה הערך הנוכחי של כל התשלומים שווה לכסף שקיבלתם ביום ההלוואה.",
      role: "מסכם את מחיר הכסף של כל התמהיל במספר אחד. ההוראה של בנק ישראל להשוואת הצעות בנויה על מדד כזה — מדד להשוואה, לא היעד של הלקוח.",
      note: "שיעור 3.10. ההוראה של בנק ישראל על השוואת הצעות — לפי תעתיק בצוות ב־Brain, ממתין לבדיקה מול המקור; היא נלמדת בשלב 5.",
    },
  },
];

export const links: MapLink[] = [
  { from: "spitzer", to: "monthly_payment", label: "בשפיצר: התשלום השווה שמאפס את החוב", lesson: "3.1" },
  { from: "monthly_payment", to: "schedule", label: "בכל חודש: ריבית על היתרה, והשאר לקרן", lesson: "3.2" },
  { from: "schedule", to: "debt_balance", label: "היתרה בכל חודש נקראת מהלוח", lesson: "3.3" },
  { from: "equal_principal", to: "schedule", label: "לוח אחר: אותה קרן בכל חודש", lesson: "3.4" },
  { from: "grace", to: "schedule", label: "בחודשי הגרייס הלוח לא מחזיר קרן", lesson: "3.4" },
  { from: "inflation", to: "schedule", label: "במסלול צמוד: היתרה והתשלום בלוח זזים עם המדד", lesson: "3.5" },
  { from: "prime", to: "schedule", label: "בכל שינוי: התשלום מחושב מחדש על היתרה", lesson: "3.6" },
  { from: "anchor", to: "schedule", label: "בכל נקודת עדכון: התשלום מחושב מחדש על היתרה", lesson: "3.6" },
  { from: "schedule", to: "mix_cashflow", label: "לוח לכל מסלול, כל אחד בתקופה שלו", lesson: "3.7" },
  { from: "mix", to: "mix_cashflow", label: "מחברים את המסלולים חודש אחר חודש", lesson: "3.7" },
  { from: "mix_cashflow", to: "first_payment", label: "התשלום בחודש הראשון", lesson: "3.8" },
  { from: "mix_cashflow", to: "current_payment", label: "התשלום לפי התנאים של היום", lesson: "3.8" },
  { from: "mix_cashflow", to: "max_payment", label: "התשלום הגבוה ביותר בתחזית", lesson: "3.8" },
  { from: "inflation", to: "max_payment", label: "התחזית שלה מזיזה את המסלולים הצמודים", lesson: "3.8" },
  { from: "anchor", to: "max_payment", label: "התחזית שלו מזיזה את המסלולים המשתנים", lesson: "3.8" },
  { from: "mix_cashflow", to: "total_paid", label: "סוכמים את כל התשלומים", lesson: "3.9" },
  { from: "mix_cashflow", to: "present_value", label: "מהוונים כל תשלום להיום", lesson: "3.10" },
  { from: "mix_cashflow", to: "irr", label: "הריבית שבה ערך התשלומים שווה לסכום שהתקבל", lesson: "3.10" },
  { from: "total_paid", to: "irr", label: "שתי שאלות שונות: כמה שקלים, ובאיזה מחיר", lesson: "3.11" },
  { from: "present_value", to: "irr", label: "ב־IRR, הערך הנוכחי שווה לסכום שהתקבל", lesson: "3.11" },
];
