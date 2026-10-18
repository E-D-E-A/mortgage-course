/**
 * Case A (נועם ושירה) — the recommendation of units 9.3 and 9.4 (stage-9 author B). Defined once, so the two lessons, the
 * report template and the explainer do not retype a choice or an assumption. The numbers themselves come from
 * src/lib/calc/casefile.ts (author A) and the earlier stages' modules; this file holds only the CHOICES and the teaching
 * assumptions that are the recommendation's own.
 *
 * LABEL. Case A, the four banks and every price are FICTIONAL ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק
 * או נתוני שוק עדכניים"). The recommendation is ONE reasonable recommendation, for the priority stated below. It is not advice, and
 * a different reasonable choice exists when the family's priority differs: the lessons say so.
 *
 * The priority behind the choice (a teaching assumption: the course does not know what these two people want):
 *   a family on its first home, one child, a living budget of its own (LIVING_BUDGET in case-a-final.ts) that leaves a thin margin
 *   under every alternative, so the choice puts a payment it can count on before a lower first payment or a lower total.
 * The rule of choice, in the order the lessons apply it:
 *   1. a bank that refuses the file is out (hard);
 *   2. an alternative that breaks the family's own budget in the stressed month, within the first five years, is out (hard);
 *   3. among what is left, the priority picks the alternative with the smallest rise of the payment (the exposure goal);
 *   4. among the banks that approve that alternative, the lowest total under the base scenario.
 *   A ratio over the 40% capital threshold is NOT a reason to reject (it is a price threshold, lesson 4.5): it is a flag.
 */
import type { AltId } from "../lib/calc/casefile.ts";
import type { BankId } from "./case-a-offers.ts";

export const CHOICE: { alt: AltId; bank: BankId } = { alt: "exposure", bank: "b" };
/** The bank that would be chosen if the chosen one fell away (the next lowest total for the same alternative). */
export const RUNNER_UP: { alt: AltId; bank: BankId } = { alt: "exposure", bank: "c" };
/** The alternative a family with a different priority (the lowest payment now) would look at. */
export const OTHER_PRIORITY: { alt: AltId; bank: BankId } = { alt: "payment", bank: "b" };

/** "Today" in stage 6's plan (lesson 6.11): the approvals of the request have arrived and the family chooses. */
export const TODAY = "2026-11-09";

/** The line the rule of choice reads the ratio against (the capital threshold of lesson 4.5), percent. */
export const THRESHOLD_PTI = "40";

/** The appraisals planned for after the bank's appraiser has been (shekels): one near the price, one at the edge, one clearly under. */
export const APPRAISAL_CASES = ["2175000", "2150000", "2100000"] as const;

/** What the bank might move the fixed rate by before signing, percentage points (a "what if", not a forecast; the course does not know what a bank holds). */
export const RATE_MOVES = ["0.05", "0.10", "0.25"] as const;

/** How many months before the family looks again, if nothing happens, as the lesson proposes (a choice of the family, not a rule). */
export const REVIEW_MONTHS = 24;

export const REASON_HE = {
  refused: "הבנק מסרב לתיק",
  budget: "תקציב המחיה נשבר בחלון של חמש השנים",
  ok: "עומד בבדיקות הקשיחות",
} as const;

/**
 * The pre-release checklist of unit 9.3: what must be true before a loan is released. Every item names its kind and source.
 * `n` are the numbers of the page, already formatted from the facts (the checklist retypes none).
 */
export interface ReleaseNumbers {
  validUntil: string;
  daysLeft: string;
  loan: string;
  ltvCeiling: string;
  breakEven: string;
  reserve: string;
  ratio: string;
  roomTo40: string;
  margin: string;
  carLeft: string;
}

export function releaseChecklist(n: ReleaseNumbers) {
  const FIELD = "ידע מהשטח · ממתין לאישור מומחה";
  const UNVERIFIED = "לא אומת · לפי תעתיק של הצוות להוראה 451, ממתין לבדיקה מול ההוראה";
  return [
    {
      label: "המסמכים והעובדות",
      note: "מה שהבנק יקרא שוב לפני שהוא משחרר כסף. הסימון: ״בדקתי, וזה תואם למה שנמסר״.",
      items: [
        { id: "docs-match", text: "כל מסמך בתיק תואם לטופס שהבנק קיבל: הכנסות, התחייבויות והון עצמי. שום דבר לא הושמט, נופח או שונה.", source: "כלל הוראה של הקורס · הקו האדום של שיעור 6.5 (מיצוב אינו מידע לא נכון)" },
        { id: "docs-fresh", text: "המסמכים שהבנק מבקש לפני ההעמדה הם עדכניים: שלושה תלושים אחרונים ושלושה חודשי תנועות בחשבון.", source: `${FIELD}` },
        { id: "gap-fund", text: "הדוח של קרן ההשתלמות הגיע והכסף בחשבון, או שהסכום יצא מההון העצמי והתיק חושב מחדש.", source: "הנחת חישוב · מהתיק של 9.1" },
        { id: "gap-gift", text: "המתנה מההורים הועברה, ויש דף חשבון שמראה אותה וגם מכתב מתנה חתום.", source: "הנחת חישוב · מהתיק של 9.1" },
        { id: "gap-income", text: "כל פער בהכנסה שנשאל ב־9.1 נסגר בכתב: ההפרש בהפקדה של נועם, והתשלום החד־פעמי בתלוש של שירה, שלא נכלל בהכנסה המוכרת (שיעור 9.4).", source: "הנחת חישוב · מהתיק של 9.1" },
        { id: "car-loan", text: `הלוואת הרכב עדיין רשומה כפי שנמסרה: ${n.carLeft} תשלומים נשארו, ויחס ההחזר חושב עם ההלוואה.`, source: "הנחת חישוב · כלל 18 החודשים, שיעור 4.2" },
      ],
    },
    {
      label: "הנכס, השמאות והבטוחה",
      note: "מה שמסתיים בשמאי, בטאבו ובעורך הדין.",
      items: [
        { id: "appraisal", text: `השמאות הגיעה משמאי מהרשימה של הבנק. אם היא נמוכה מ־${n.breakEven}, ההלוואה (${n.loan}) כבר מעל תקרת ${n.ltvCeiling}% והתיק חושב מחדש לפני כל צעד אחר.`, source: `${UNVERIFIED}; מה בנק עושה בשמאות נמוכה: לא ידוע` },
        { id: "reserve", text: `אם צריך הון נוסף בגלל שמאות נמוכה: ${n.reserve} החסכונות שנשארו מספיקים, והמשפחה מסכימה להוציא אותם.`, source: "הנחת חישוב · התוכנית של שיעור 6.11" },
        { id: "title", text: "נסח הטאבו נקי: אין הערת אזהרה של אחר, והנכס רשום כפי שנמסר. עורך הדין אישר.", source: `${FIELD}; מה עורך הדין בודק: שאלה לעורך הדין` },
        { id: "lawyer-money", text: "עורך הדין קיבל הוראה בכתב לאן הכסף עובר ולאיזו מטרה, והבנק ועורך הדין מדברים על אותו סכום.", source: `${FIELD}` },
      ],
    },
    {
      label: "תנאי האישור והתוקף",
      note: "מה שמתיישן.",
      items: [
        { id: "validity", text: `האישור של הבנק שנבחר בתוקף עד ${n.validUntil}; ביום הבדיקה נשארו ${n.daysLeft} ימים, והעמדת ההלוואה נכנסת בתוכם. אם לא: מבקשים הארכה או אישור חדש לפני שהתוקף נגמר.`, source: UNVERIFIED },
        { id: "conditions", text: "כל תנאי שכתוב באישור נסגר או מוסכם בכתב: מה נשאר פתוח ומי אחראי עליו.", source: `${FIELD} · תנאים בדוגמה של שיעור 5.1` },
        { id: "exact-mix", text: "ההצעה שהבנק נתן היא על התמהיל המדויק של ההמלצה: אותם מסלולים, סכומים ותקופות. לא ״בערך״.", source: "עיקרון של הקורס · שיעורים 6.7–6.8" },
        { id: "rate-held", text: "ידוע בכתב איזה חלק מהריבית מוחזק, ועד מתי: מתאריך האישור, עד החתימה או עד העמדת הכסף. אם התשובה לא ידועה, כותבים ״לא ידוע״ ושואלים.", source: `${FIELD}; מה בנק מחזיק: לא ידוע` },
      ],
    },
    {
      label: "המספרים לפני החתימה",
      note: "בודקים מחדש, על ההצעה הסופית, את מה שההמלצה אמרה.",
      items: [
        { id: "ratio", text: `יחס ההחזר על ההצעה הסופית הוא ${n.ratio}, ויש מרווח של ${n.roomTo40} בחודש מתחת לקו ה־40%. אם עלה מעל הקו: חוזרים להמלצה.`, source: "הנחת חישוב · סף ההון של שיעור 4.5 (לא אומת)" },
        { id: "budget", text: `אחרי ההחזר, מה שנשאר למשפחה בחודש הוא ${n.margin} מעל תקציב המחיה שלה. אם פחות: חוזרים להמלצה.`, source: "הנחת חישוב · תקציב המחיה של התיק" },
        { id: "schedule", text: "לוח הסילוקין שהבנק שולח מראה את אותו החזר ראשון ואת אותו סך תשלומים שחושבו בהמלצה, בפער של אגורות בלבד.", source: "בדיקת חישוב · שיטת הסילוקין של שלב 3" },
      ],
    },
    {
      label: "ביטוחים והחתימה",
      note: "הלקוח חותם בעצמו, אחרי שקרא.",
      items: [
        { id: "insurance", text: "ביטוח החיים וביטוח המבנה נבדקו גם מחוץ לבנק לפני שבוחרים. המחיר, הכיסוי והמוטב הושוו.", source: `${UNVERIFIED}; ${FIELD}` },
        { id: "read", text: "נועם ושירה קראו את הסכם ההלוואה ואת הנספחים. כל שאלה נשאלה וקיבלה תשובה בכתב לפני החתימה.", source: "עיקרון של הקורס · מה חותמים עליו, לא מה היועץ אומר" },
        { id: "no-pressure", text: "אף אחד לא לחץ על תאריך. אם הבנק או הצד שמולו קובעים מועד שדוחק, כותבים מי קבע אותו ולמה.", source: `${FIELD}` },
      ],
    },
    {
      label: "אחרי ההעמדה",
      note: "הקשר עם התיק לא נגמר בכסף.",
      items: [
        { id: "review-date", text: "נקבע תאריך לבדיקה מחדש, ורשומים בכתב המצבים שמקדימים אותו: שינוי בהכנסה, בני משפחה, או הצעה חדשה נמוכה בהרבה.", source: "הצעה של הקורס · שיעור 9.4" },
        { id: "copy", text: "בידי המשפחה עותק של הדוח, של ההצעה החתומה ושל לוח הסילוקין.", source: "הצעה של הקורס · ללא כלל כתוב" },
      ],
    },
  ];
}
