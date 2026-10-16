/**
 * Lesson 6.9's day at an underwriter's desk: the policy of the bank the learner plays, and the five
 * files that reach the desk — defined once, so the page, the simulation and the lesson's facts read
 * the same numbers (stage-6 author D).
 *
 * The bank is "בנק א׳" of src/data/case-a-positioning.ts, a FICTIONAL bank, and its policy is the
 * exercise's invented rule, not how a real bank works. The first four files are invented households
 * ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים"); the fifth
 * is case A with the initial mix, as a clerk who knows nothing but the numbers would see it.
 *
 * Every file asks for the same shape of loan: three tracks of equal size (prime, variable
 * unlinked, fixed unlinked) over 360 months, as lesson 5.8's initial mix. The bank prices the
 * tracks at its own list (bankpolicy.ts); a file carries no rates.
 */
import type { Obligation } from "../lib/calc/affordability.ts";
import type { LoanFile } from "../lib/calc/bankpolicy.ts";
import { caseAFile } from "./case-a-positioning.ts";

const thirds = (each: number) => [
  { kind: "prime" as const, amount: String(each), months: 360 },
  { kind: "variable_unlinked" as const, amount: String(each), months: 360 },
  { kind: "fixed_unlinked" as const, amount: String(each), months: 360 },
];

export interface DayFile {
  id: string;
  /** A short Hebrew title for the desk's list. */
  title: string;
  /** What the clerk's file says about the household, in words (no number: the numbers come from the file). */
  about: string;
  /** What the family knows and the file does not say. */
  unseen: string;
  file: LoanFile;
}

const car = (monthly: string, monthsLeft: number): Obligation => ({ kind: "loan", monthly, monthsLeft });

export const DAY_BANK = "a";

export const DAY_FILES: DayFile[] = [
  {
    id: "f1",
    title: "תיק 1",
    about: "זוג עם שתי משכורות, בלי התחייבויות. מבקשים הלוואה קטנה יחסית לדירה.",
    unseen: "הם חסכו שנים לדירה הזו, ויש להם עוד חיסכון שלא נכנס להון העצמי.",
    file: { value: "1800000", income: "24000", obligations: [], tracks: thirds(300000) },
  },
  {
    id: "f2",
    title: "תיק 2",
    about: "משפחה עם הלוואת רכב: נשארו בה 19 תשלומים. הלוואה בינונית, ומחיר דירה סביר.",
    unseen: "עוד חודש הלוואת הרכב תהיה בת 18 תשלומים, ואז היא כבר לא תיספר בחישוב.",
    file: { value: "2000000", income: "17000", obligations: [car("1500", 19)], tracks: thirds(420000) },
  },
  {
    id: "f3",
    title: "תיק 3",
    about: "זוג שמבקש הלוואה גדולה יחסית לשווי הדירה. ההכנסה נוחה.",
    unseen: "ההורים של אחד מהם הם הבעלים של הדירה הסמוכה, ומתכוונים לעזור אם צריך.",
    file: { value: "1250000", income: "18000", obligations: [], tracks: thirds(300000) },
  },
  {
    id: "f4",
    title: "תיק 4",
    about: "משפחה עם הכנסה נמוכה יחסית להלוואה שהיא מבקשת.",
    unseen: "אחד מבני הזוג עומד לעבור לעבודה בשכר גבוה יותר, אבל ההצעה עוד לא נחתמה.",
    file: { value: "1700000", income: "13000", obligations: [], tracks: thirds(400000) },
  },
  {
    id: "f5",
    title: "תיק 5",
    about: "זוג שכירים עם ילד ועם הלוואת רכב. קונים דירה יד שנייה.",
    unseen: "הלוואת הרכב נגמרת בעוד 26 חודשים, ויש לזוג עוד הוצאות שהקובץ לא מראה.",
    file: caseAFile("initial"),
  },
];
