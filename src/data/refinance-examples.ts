/**
 * The teaching loans and offers of lessons 7.4 and 7.5 (stage-7 author B), and the two presets of the refinance
 * calculator (src/components/RefinanceCalculator.vue).
 *
 * What is real and what is invented:
 *  - The existing loan of תיק ג׳ (עדי וירון) is the worked example of the early-repayment fee, the team's own computation
 *    (Brain 7798786, 2 August 2026): 700,000 ₪, fixed unlinked, 5.90% nominal, 20 years from July 2023, 37 payments made.
 *    The balance 637,956.74 ₪ is that computation's, carried with the level payment unrounded ("exact"); a bank's
 *    statement, which rounds every month, can differ from it by some agorot. The fee, 10,305.95 ₪ after the reduction
 *    for time served plus the ₪60 operational fee, is the result of lesson 7.2's calculation (the fixture); this module
 *    takes it as an input, it does not compute it.
 *  - Everything else is INVENTED, to illustrate: the banks (בנק ב׳, ג׳, ד׳), their rates and terms, the up-front costs of
 *    a new loan, and the second existing loan (three tracks, with fees chosen to show a point). The rates are the
 *    course's, not market quotes; the forecast is a teaching path (offer-examples.ts), never the Bank of Israel's.
 *    Label wherever shown: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים".
 */
import type { Track } from "../lib/calc/metrics.ts";
import { FORECAST_A } from "./offer-examples.ts";

export { EXAMPLE_LABEL } from "./offer-examples.ts";

/** The forecast every new offer here is measured on (a fixed track needs none, but an offer names one). */
export const REFINANCE_FORECAST = FORECAST_A;

/** תיק ג׳: the existing loan, unrounded (the team's computation). */
export const CASE_C_LOAN: Track = { principal: "700000", rates: ["5.90"], months: 240, rounding: "exact" };
export const CASE_C_PAID = 37;
/** Lesson 7.2's result for this loan on 2 August 2026: the discounting fee after the reduction for time served. */
export const CASE_C_DISCOUNT_FEE = "10305.95";
/** The operational fee: once per repayment, not per track (Supervisor of Banks ruling, 2021-09-13, as transcribed by the team). */
export const OPERATIONAL_FEE = "60.00";
/** The up-front costs of a new loan in the examples: INVENTED (a file-opening fee, a valuation, a lawyer). */
export const NEW_LOAN_COSTS = "2400.00";

export interface ExampleBank {
  id: "b" | "c" | "d";
  name: string;
  /** The nominal annual rate of the new fixed unlinked loan. */
  rate: string;
  /** Its term in months. */
  months: number;
}

/** The new offers of lesson 7.4 for the loan of תיק ג׳. 203 months is what is left of the old loan. */
export const BANKS: ExampleBank[] = [
  { id: "b", name: "בנק ב׳", rate: "5.2", months: 203 },
  { id: "c", name: "בנק ג׳", rate: "5.2", months: 300 },
  { id: "d", name: "בנק ד׳", rate: "5.7", months: 300 },
];
export const bank = (id: ExampleBank["id"]): ExampleBank => BANKS.find((b) => b.id === id) as ExampleBank;

/** A second existing loan for the calculator: three tracks, taken 5 years ago. INVENTED, fees included. */
export interface PresetTrack {
  name: string;
  track: Track;
  paymentsMade: number;
  /** T for this track in shekels: an input here (lesson 7.2 is where it is computed). */
  fee: string;
  note: string;
}

export interface Preset {
  id: "case_c" | "three" | "external" | "internal";
  label: string;
  tracks: PresetTrack[];
  shared: string;
  /** The new loan's starting rate, term and costs in the calculator. */
  rate: string;
  months: number;
  upfront: string;
  /** A sentence under the preset: where its numbers come from. */
  source: string;
}

export const PRESETS: Preset[] = [
  {
    id: "case_c",
    label: "תיק ג׳: מסלול אחד",
    tracks: [{ name: "קבועה לא צמודה", track: CASE_C_LOAN, paymentsMade: CASE_C_PAID, fee: CASE_C_DISCOUNT_FEE, note: "5.90%, 20 שנה, 37 תשלומים שולמו" }],
    shared: OPERATIONAL_FEE,
    rate: "5.2",
    months: 203,
    upfront: NEW_LOAN_COSTS,
    source: "ההלוואה והעמלה: הדוגמה המחושבת של שיעור 7.2 (ערכים שהצוות קרא ב־2.8.2026, לא אומתו). ההצעה החדשה והעלויות שלה: בדויות.",
  },
  {
    id: "three",
    label: "דוגמה בדויה: שלושה מסלולים",
    tracks: [
      { name: "קבועה לא צמודה, 6.3%", track: { principal: "300000", rates: ["6.3"], months: 300, rounding: "exact" }, paymentsMade: 60, fee: "5200", note: "300,000 ₪, 25 שנה, 5 שנים שולמו" },
      { name: "פריים (הנחה: נשאר 5.2%)", track: { principal: "200000", rates: ["5.2"], months: 240, rounding: "exact" }, paymentsMade: 60, fee: "0", note: "200,000 ₪, 20 שנה. בפריים אין עמלת היוון" },
      { name: "קבועה לא צמודה, 3.9%", track: { principal: "150000", rates: ["3.9"], months: 300, rounding: "exact" }, paymentsMade: 60, fee: "1500", note: "150,000 ₪, 25 שנה" },
    ],
    shared: OPERATIONAL_FEE,
    rate: "5.2",
    months: 240,
    upfront: NEW_LOAN_COSTS,
    source: "הלוואה בדויה לגמרי: המסלולים, הריביות והעמלות לכל מסלול הם קלט להמחשה (העמלה מחושבת בשיעור 7.2; כאן היא קלט). הפריים מוחזק קבוע כהנחת הלימוד.",
  },
];

/** Lesson 7.5: the same loan, two ways to leave it. The up-front costs differ by an INVENTED amount: the course does not know what an internal refinance costs. */
export const EXTERNAL_COSTS = "2400.00";
export const INTERNAL_COSTS = "900.00";
export const INTERNAL_PRESETS: Preset[] = [
  {
    id: "external",
    label: "מחזור חיצוני: בנק אחר",
    tracks: PRESETS[0].tracks,
    shared: OPERATIONAL_FEE,
    rate: "5.2",
    months: 203,
    upfront: EXTERNAL_COSTS,
    source: "הלוואה קיימת: תיק ג׳ (הדוגמה של שיעור 7.2). ההצעה והעלויות של בנק אחר: בדויות; העלויות כוללות שמאות (הנחה: מחזור חיצוני דורש שמאות; ידע מהשטח, לא אומת).",
  },
  {
    id: "internal",
    label: "מחזור פנימי: הבנק הנוכחי",
    tracks: PRESETS[0].tracks,
    shared: OPERATIONAL_FEE,
    rate: "5.3",
    months: 203,
    upfront: INTERNAL_COSTS,
    source: "אותה הלוואה קיימת. ההצעה והעלויות של הבנק הנוכחי: בדויות; העלויות נמוכות יותר כי אין שמאות (הנחה: מחזור פנימי לא דורש שמאות; ידע מהשטח, לא אומת). העמלה: אותה עמלה (האם הבנק מפחית אותה: לא ידוע).",
  },
];
