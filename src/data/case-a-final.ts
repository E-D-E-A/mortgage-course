/**
 * Case A (נועם ושירה) as a whole file — stage 9, units 9.1–9.4 (stage-9 author A). The file as it arrives:
 * the documents, what each one shows, and the few teaching numbers that stages 4–8 did not need.
 * Defined once; src/lib/calc/casefile.ts computes from it, lessons, components and checks import it.
 * Nobody retypes a number from here.
 *
 * EVERYTHING HERE IS INVENTED, to illustrate:
 *   "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים".
 * The family, the employers ("מעסיק א׳", "מעסיק ב׳"), the payslips, the account, the lender of the car loan
 * and the seller are fictional. Every document is a teaching prop marked "מסמך לדוגמה"; which documents a
 * real bank asks for, in what form, and how old they may be, is field knowledge or each bank's own form
 * (FK-H-033, FK-H-034, awaiting Eylon). A real file holds personal data and needs the client's signed
 * consent before any document is read (Mogi decision, 2026-09); the course file is fictional.
 *
 * What the case's earlier stages already fix, and this file keeps unchanged:
 *   price 2,200,000; equity 560,000; incomes 12,400 + 9,300 net; a car loan of 1,450 with 26 payments left;
 *   savings kept outside the equity 40,000 (case-a-levers.ts RESERVE); the car loan's payoff 36,000.
 * What this file adds (all TEACHING ASSUMPTIONS):
 *   - how the equity of 560,000 is made: savings 260,000 + a provident fund (קרן השתלמות) 100,000 + the parents'
 *     gift 200,000 (the course map names the gift and "savings, a fund"; the split of the rest is invented);
 *   - the payslips: gross, the mandatory deductions, a small union fee, and one holiday bonus on Shira's
 *     September payslip, so that her three months average more than her regular pay;
 *   - the account statement for July–September 2026 (a joint current and savings account), with one
 *     deposit of Noam's that is 240 below his net-to-pay in August;
 *   - the living budget of the family: LIVING_BUDGET. The course has no source for what a reasonable living
 *     budget is (lesson 4.6); this is the file's own number.
 *
 * The states of the evidence (`EVIDENCE`) are the file's facts: what each document, as received, shows about
 * each claim in the file. `casefile.ts` derives the state of every document and claim from them.
 */
import type { Obligation } from "../lib/calc/affordability.ts";
import { CAR_PAYOFF, RESERVE } from "./case-a-levers.ts";
import { CASE_A } from "./case-a-mix.ts";
import { EXAMPLE_LABEL } from "./case-a-offers.ts";

/** The label every worked table of stage 9 carries. */
export const FINAL_LABEL = `${EXAMPLE_LABEL}. כל המסמכים בדויים.`;

/** The mark each example document carries. */
export const DOC_MARK = "מסמך לדוגמה";

/** One sentence for the personal-data point, said once (brief of stage 9). */
export const DATA_NOTE =
  "תיק אמיתי מכיל נתונים אישיים, ולפי הכלל של Mogi אין לקרוא בו מסמך של לקוח לפני שהסכמתו החתומה רשומה ביומן. תיק הקורס בדוי, ושום מסמך בו אינו אמיתי.";

/**
 * What the family needs for living each month, shekels. A TEACHING ASSUMPTION of the file (lesson 4.6 says the
 * course has no source for a reasonable living budget). With it the largest payment the family's own budget
 * allows is 21,700 − 1,450 − 11,500 = 8,750 a month while the car loan runs.
 */
export const LIVING_BUDGET = "11500";

export const PEOPLE = {
  noam: { name: "נועם", age: 31, employer: "מעסיק א׳" },
  shira: { name: "שירה", age: 30, employer: "מעסיק ב׳" },
} as const;
export type PersonId = keyof typeof PEOPLE;

export const HOUSEHOLD = { adults: 2, children: 1 } as const;

// ── Payslips ──────────────────────────────────────────────────────────────

export interface Deduction {
  label: string;
  amount: string;
}

/**
 * A payslip, in the structure of the team's spec (a gross total, the mandatory deductions, the net pay ["שכר נטו"],
 * the other deductions, the net to pay). `oneOffNet` is the net effect of a payment that does not repeat (a holiday
 * bonus): the advisor marks the line and takes it out of the month's net before averaging (field spec: one-off payments
 * are flagged). 0 for a regular month.
 */
export interface Payslip {
  /** "2026-07" … */
  month: string;
  gross: string;
  mandatory: Deduction[];
  other: Deduction[];
  oneOffNet: string;
  /** A short Hebrew name of the one-off line, when there is one. */
  oneOffLabel?: string;
}

const MANDATORY_NOAM: Deduction[] = [
  { label: "מס הכנסה", amount: "1950" },
  { label: "ביטוח לאומי", amount: "610" },
  { label: "מס בריאות", amount: "480" },
  { label: "פנסיה (עובד)", amount: "1060" },
];
const MANDATORY_SHIRA: Deduction[] = [
  { label: "מס הכנסה", amount: "1350" },
  { label: "ביטוח לאומי", amount: "480" },
  { label: "מס בריאות", amount: "380" },
  { label: "פנסיה (עובד)", amount: "690" },
];
/** September: a holiday bonus makes the gross and the tax higher; the net is 900 above a regular month. */
const MANDATORY_SHIRA_SEP: Deduction[] = [
  { label: "מס הכנסה", amount: "1500" },
  { label: "ביטוח לאומי", amount: "510" },
  { label: "מס בריאות", amount: "400" },
  { label: "פנסיה (עובד)", amount: "690" },
];
const UNION: Deduction[] = [{ label: "דמי חבר ועד", amount: "60" }];

export const PAYSLIPS: Record<PersonId, Payslip[]> = {
  noam: ["2026-07", "2026-08", "2026-09"].map((month) => ({ month, gross: "16500", mandatory: MANDATORY_NOAM, other: UNION, oneOffNet: "0" })),
  shira: [
    { month: "2026-07", gross: "12200", mandatory: MANDATORY_SHIRA, other: [], oneOffNet: "0" },
    { month: "2026-08", gross: "12200", mandatory: MANDATORY_SHIRA, other: [], oneOffNet: "0" },
    { month: "2026-09", gross: "13300", mandatory: MANDATORY_SHIRA_SEP, other: [], oneOffNet: "900", oneOffLabel: "שי לחג" },
  ],
};

export const MONTH_HE: Record<string, string> = { "2026-07": "יולי", "2026-08": "אוגוסט", "2026-09": "ספטמבר" };

// ── The account statement (a joint current and savings account) ───────────

export interface StatementMonth {
  month: string;
  /** What reached the account from each employer. Noam's August deposit is 240 under his net to pay. */
  deposit: Record<PersonId, string>;
  /** Everything that left the account, the car loan's 1,450 among it. */
  debits: string;
}

/** The balance on 1 July 2026, chosen so that the balance on 30 September is 300,000 = the savings in the equity + RESERVE. */
export const STATEMENT_OPENING = "291020";
export const STATEMENT: StatementMonth[] = [
  { month: "2026-07", deposit: { noam: "12340", shira: "9300" }, debits: "18700" },
  { month: "2026-08", deposit: { noam: "12100", shira: "9300" }, debits: "18900" },
  { month: "2026-09", deposit: { noam: "12340", shira: "10200" }, debits: "19000" },
];
/** The car loan's debit on the statement, every month (the description repeats in all three months). */
export const STATEMENT_CAR_DEBIT = "1450";

// ── The equity, piece by piece ────────────────────────────────────────────

export type ClaimId = "income_noam" | "income_shira" | "obligations" | "equity_savings" | "equity_fund" | "equity_gift" | "property" | "household";

export interface EquityPiece {
  id: "equity_savings" | "equity_fund" | "equity_gift";
  label: string;
  /** What the client declared, shekels. */
  declared: string;
}

export const EQUITY_PIECES: EquityPiece[] = [
  { id: "equity_savings", label: "חיסכון בחשבון", declared: "260000" },
  { id: "equity_fund", label: "קרן השתלמות", declared: "100000" },
  { id: "equity_gift", label: "מתנה מההורים", declared: "200000" },
];

// ── The documents and the claims ──────────────────────────────────────────

export type DocId = "id" | "payslips_noam" | "payslips_shira" | "statement" | "credit" | "car" | "tabu" | "contract" | "gift" | "fund";

/** The state of evidence: ok (matches), question (received, one thing to clear), partial (received, proves only part), missing (not received). */
export type State = "ok" | "question" | "partial" | "missing";
export const STATE_ORDER: State[] = ["ok", "question", "partial", "missing"];
export const STATE_HE: Record<State, string> = { ok: "תקין", question: "תקין, עם שאלה", partial: "חלקי", missing: "חסר" };

export interface Claim {
  id: ClaimId;
  /** What the file says, in a few words. */
  label: string;
}

export const CLAIMS: Claim[] = [
  { id: "income_noam", label: "ההכנסה של נועם" },
  { id: "income_shira", label: "ההכנסה של שירה" },
  { id: "obligations", label: "ההתחייבויות" },
  { id: "equity_savings", label: "ההון העצמי: החיסכון" },
  { id: "equity_fund", label: "ההון העצמי: קרן ההשתלמות" },
  { id: "equity_gift", label: "ההון העצמי: המתנה" },
  { id: "property", label: "הנכס והמחיר" },
  { id: "household", label: "הלווים והמשפחה" },
];

export interface DocumentInfo {
  id: DocId;
  /** Name on the page. */
  name: string;
  /** Teaching date of issue, ISO, or null when the document has not arrived. */
  date: string | null;
  /** Whether the document is in the file. */
  received: boolean;
  /** What it shows (when it is a good one). */
  proves: string;
  /** What it does not show. */
  notProves: string;
}

export const DOCUMENTS: DocumentInfo[] = [
  {
    id: "id",
    name: "תעודות זהות וספח",
    date: "2026-10-03",
    received: true,
    proves: "מי הלווים, מי עוד בבית וכמה ילדים יש",
    notProves: "הכנסה, כתובת מגורים עדכנית או מצב אשראי",
  },
  {
    id: "payslips_noam",
    name: "שלושה תלושי שכר של נועם",
    date: "2026-10-03",
    received: true,
    proves: "השכר ברוטו, הניכויים, שכר הנטו והנטו לתשלום, שלושה חודשים",
    notProves: "שהכסף הגיע לחשבון, וכמה זמן המשכורת תימשך",
  },
  {
    id: "payslips_shira",
    name: "שלושה תלושי שכר של שירה",
    date: "2026-10-03",
    received: true,
    proves: "השכר ברוטו, הניכויים, שכר הנטו והנטו לתשלום, שלושה חודשים, ותשלומים חד־פעמיים",
    notProves: "אם תשלום חד־פעמי יחזור. את זה שואלים",
  },
  {
    id: "statement",
    name: "דף חשבון עו״ש, שלושה חודשים",
    date: "2026-10-02",
    received: true,
    proves: "שהמשכורות הגיעו, החיסכון הנוכחי, והחיובים הקבועים (כמו הלוואת הרכב)",
    notProves: "מה ההתחייבויות הכוללות (חשבון אחר או הלוואה שחוזרת בכרטיס לא ייראו), ומקור הכסף בחשבון",
  },
  {
    id: "credit",
    name: "סיכום דוח אשראי",
    date: "2026-10-05",
    received: true,
    proves: "אילו הלוואות רשומות על הלווים, בכמה, ואם היו חיובים שחזרו",
    notProves: "התחייבות שלא נרשמה במאגר, והכנסה. הבנק מושך חיווי אשראי משלו",
  },
  {
    id: "car",
    name: "דף יתרת סילוק של הלוואת הרכב",
    date: "2026-09-30",
    received: true,
    proves: "ההחזר החודשי, כמה תשלומים נשארו ומה סכום הסילוק",
    notProves: "שאין הלוואות אחרות",
  },
  {
    id: "tabu",
    name: "נסח טאבו של הנכס",
    date: "2026-10-06",
    received: true,
    proves: "מי רשום כבעלים ושאין משכנתא רשומה על הנכס",
    notProves: "המחיר, ושווי הנכס בעיני הבנק (את זה קובע שמאי)",
  },
  {
    id: "contract",
    name: "חוזה רכישה (טיוטה, לא חתומה)",
    date: "2026-10-04",
    received: true,
    proves: "המחיר שהצדדים מתכוונים אליו ותנאי העסקה",
    notProves: "שהעסקה סגורה: רק חוזה חתום מוכיח את זה",
  },
  {
    id: "gift",
    name: "מכתב מתנה מההורים",
    date: "2026-10-03",
    received: true,
    proves: "מי נותן, כמה, ושזו מתנה ולא הלוואה",
    notProves: "שהכסף עבר: זה רואים בדף חשבון אחרי ההעברה",
  },
  {
    id: "fund",
    name: "דוח קרן השתלמות",
    date: null,
    received: false,
    proves: "כמה יש בקרן ומה אפשר למשוך ממנה",
    notProves: "שהכסף כבר בחשבון",
  },
];

export const doc = (id: DocId): DocumentInfo => {
  const d = DOCUMENTS.find((x) => x.id === id);
  if (!d) throw new Error(`no document "${id}"`);
  return d;
};

export interface Evidence {
  doc: DocId;
  claim: ClaimId;
  state: State;
}

/**
 * What each document, as it is in the file, shows about each claim. A document may support several claims, and a claim
 * may rest on several documents. The states are the file's facts (teaching): five things are open.
 */
export const EVIDENCE: Evidence[] = [
  { doc: "id", claim: "household", state: "ok" },
  { doc: "payslips_noam", claim: "income_noam", state: "ok" },
  { doc: "payslips_shira", claim: "income_shira", state: "question" },
  { doc: "statement", claim: "income_noam", state: "question" },
  { doc: "statement", claim: "income_shira", state: "ok" },
  { doc: "statement", claim: "equity_savings", state: "ok" },
  { doc: "statement", claim: "obligations", state: "ok" },
  { doc: "credit", claim: "obligations", state: "ok" },
  { doc: "car", claim: "obligations", state: "ok" },
  { doc: "tabu", claim: "property", state: "ok" },
  { doc: "contract", claim: "property", state: "partial" },
  { doc: "gift", claim: "equity_gift", state: "partial" },
  { doc: "fund", claim: "equity_fund", state: "missing" },
];

/** What to ask for, one row for every piece of evidence that is not ok. */
export interface Gap {
  doc: DocId;
  claim: ClaimId;
  /** What is open, in a sentence. */
  open: string;
  /** What to ask for. */
  ask: string;
  /** Whom. */
  from: string;
  /** What it holds up. */
  blocks: string;
}

export const GAPS: Gap[] = [
  {
    doc: "fund",
    claim: "equity_fund",
    open: "אין מסמך שמראה את הסכום בקרן ההשתלמות",
    ask: "הדוח האחרון מהקרן, עם הסכום ומה אפשר למשוך",
    from: "נועם ושירה",
    blocks: "החלק של הקרן בהון העצמי",
  },
  {
    doc: "gift",
    claim: "equity_gift",
    open: "יש מכתב מתנה, אבל הכסף עוד לא הופיע בחשבון",
    ask: "אחרי ההעברה: דף חשבון שמראה אותה, ושההורים חתומים על המכתב",
    from: "ההורים, דרך נועם ושירה",
    blocks: "החלק של המתנה בהון העצמי",
  },
  {
    doc: "statement",
    claim: "income_noam",
    open: "באוגוסט הופקד לנועם פחות ממה שרשום בתלוש כנטו לתשלום",
    ask: "תלוש מתוקן או הסבר של המעסיק להפרש",
    from: "נועם",
    blocks: "הודאות לגבי ההכנסה של נועם",
  },
  {
    doc: "payslips_shira",
    claim: "income_shira",
    open: "בתלוש של ספטמבר יש תשלום שאינו חוזר: שי לחג",
    ask: "אישור שהתשלום חד־פעמי, ואם קיים תשלום דומה אחר בשנה",
    from: "שירה",
    blocks: "ההכנסה המוכרת של שירה",
  },
  {
    doc: "contract",
    claim: "property",
    open: "החוזה עוד לא חתום",
    ask: "החוזה החתום, כשהוא מוכן",
    from: "נועם ושירה, דרך עורך הדין",
    blocks: "המחיר שהתיק נשען עליו",
  },
];

/**
 * An open item that no one in the family can supply: the bank orders it after the pre-approval (field knowledge, the
 * appraiser comes from the bank's list: FK-H-040 to 042, awaiting Eylon). The file cannot close it; it can only plan for it.
 */
export const APPRAISAL_NOTE = "שמאות: הבנק מזמין שמאי אחרי האישור העקרוני. עד אז אין ערך לנכס מלבד המחיר, והתיק מתכנן את הטווח.";

/** Appraisals the file plans for, shekels: at the price, a little under it, and two steps down (4.15 used 2,150,000). */
export const APPRAISALS = ["2200000", "2175000", "2150000", "2100000"] as const;

// ── The facts of the case, repeated from the earlier stages as one object ─

export const FILE = {
  price: CASE_A.price,
  equity: CASE_A.equity,
  incomes: { noam: "12400", shira: "9300" } as Record<PersonId, string>,
  car: CASE_A.car as Obligation,
  carPayoff: CAR_PAYOFF,
  reserve: RESERVE,
};

/** The pre-approval request goes out on this date in stage 6's plan (outreach clocks); the file's documents are all older. */
export const FILE_DATE = "2026-10-12";
