/**
 * Case A (נועם ושירה) at the banks, for lessons 6.6–6.8 (stage-6 author C): four FICTIONAL banks
 * ("בנק א׳" … "בנק ד׳"), their prices for the mix the family asked for, and the counters two of
 * them came back with. Defined once, so the lessons, the exercises and the components do not
 * retype a rate. (Other stage-6 files may import it; nothing here is edited by them.)
 *
 * EVERYTHING HERE IS INVENTED, to illustrate:
 *   "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים".
 *   - The prices are the course's, not quotes. Bank א׳ prices exactly like the price list of lesson
 *     5.6 (case-a-mix.ts PRICE_LIST); the others differ by a few hundredths of a point, so that
 *     each is cheapest on one kind of track and no bank wins every track.
 *   - The counters are teaching examples of the KINDS of answer the team heard of (FK-H-072: swap a
 *     track, more fixed, a mix of four). Whether a real bank answers this way, and why, is unknown.
 *   - The cost of funds in EXERCISE_COST_OF_FUNDS is invented. The general mechanism (a bank earns
 *     the gap between the rate it charges and what the money costs it) is general economics; the
 *     numbers, and which kind of track pays a bank more, are not known to us.
 *   - The rules of the exercise for a negotiation round (how many business days it takes, how many
 *     days must stay after the answer) are not known rules of any bank.
 *
 * The family's request is the starting mix of case A (case-a-mix.ts INITIAL_MIX): a third each in
 * prime, a variable unlinked track resetting every 5 years, and a fixed unlinked track, over 30 years.
 */
import type { MixEdit } from "../lib/calc/outreach.ts";
import { firstYearMargin } from "../lib/calc/outreach.ts";
import type { TrackKind, TrackSpec } from "../lib/calc/schedule.ts";
import { loanOf, measuresOf, scenarioFrom, stressRise, variableAmount, type GoalContext } from "../lib/calc/sensitivity.ts";
import { GOAL_CONTEXT, INITIAL_MIX, SCENARIOS, caseAPasses, caseARatio } from "./case-a-mix.ts";
import { PTI_CAPITAL_THRESHOLD } from "../lib/calc/regulation.ts";
import Decimal from "decimal.js";

export const EXAMPLE_LABEL = "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים";

export type BankId = "a" | "b" | "c" | "d";
export const BANK_IDS: BankId[] = ["a", "b", "c", "d"];
export const BANK_NAME: Record<BankId, string> = { a: "בנק א׳", b: "בנק ב׳", c: "בנק ג׳", d: "בנק ד׳" };

/** Each fictional bank's starting rate for each kind of track, percent a year (linked tracks: the real rate, before the index). */
export const BANK_PRICES: Record<BankId, Record<TrackKind, string>> = {
  a: { prime: "4.60", variable_unlinked: "4.10", fixed_unlinked: "4.40", fixed_linked: "2.90", variable_linked: "2.50" },
  b: { prime: "4.70", variable_unlinked: "4.00", fixed_unlinked: "4.30", fixed_linked: "2.85", variable_linked: "2.55" },
  c: { prime: "4.55", variable_unlinked: "4.20", fixed_unlinked: "4.35", fixed_linked: "3.00", variable_linked: "2.45" },
  d: { prime: "4.65", variable_unlinked: "4.15", fixed_unlinked: "4.45", fixed_linked: "2.80", variable_linked: "2.60" },
};

/** A mix as (kind, amount) pairs over the family's 30 years: the same shares at any bank's prices. */
export type MixShape = [TrackKind, number][];

export const REQUESTED: MixShape = INITIAL_MIX.map((t) => [t.kind, Number(t.amount)]);

const TERM_MONTHS = 360;

/** A shape priced at one bank. */
export function priced(bank: BankId, shape: MixShape, months = TERM_MONTHS): TrackSpec[] {
  return shape.map(([kind, amount]) => ({ kind, amount: String(amount), rate: BANK_PRICES[bank][kind], months }));
}

/** What the family asked for, at a bank's prices. */
export const requestedAt = (bank: BankId): TrackSpec[] => priced(bank, REQUESTED);

export interface Counter {
  id: "swap_linked" | "half_half";
  bank: BankId;
  /** A short Hebrew name for tables. */
  name: string;
  /** One line: what the counter changed. */
  note: string;
  shape: MixShape;
}

/**
 * Two counters a bank might come back with, at that bank's own prices:
 *  - swap_linked (בנק ב׳): the variable unlinked track becomes a fixed linked one, a track the family did not ask for.
 *  - half_half (בנק ג׳): half prime, half fixed unlinked: no variable track at all.
 */
export const COUNTERS: Counter[] = [
  {
    id: "swap_linked",
    bank: "b",
    name: "החלפת המשתנה בצמודה",
    note: "המסלול המשתנה הלא צמוד הוחלף בקבועה צמודה; הסכומים והתקופות כמו בבקשה",
    shape: [
      ["prime", 546000],
      ["fixed_linked", 547000],
      ["fixed_unlinked", 547000],
    ],
  },
  {
    id: "half_half",
    bank: "c",
    name: "חצי פריים, חצי קבועה",
    note: "בלי מסלול משתנה: מחצית פריים ומחצית קבועה לא צמודה",
    shape: [
      ["prime", 820000],
      ["fixed_unlinked", 820000],
    ],
  },
];

export const counter = (id: Counter["id"]): Counter => {
  const c = COUNTERS.find((x) => x.id === id);
  if (!c) throw new Error(`no counter ${id}`);
  return c;
};
export const counterTracks = (id: Counter["id"]): TrackSpec[] => priced(counter(id).bank, counter(id).shape);

// ── The measures a mix is judged on (the three goals of lesson 5.6, and the limits) ────────────────────────

export const BASE_SCENARIO = SCENARIOS.base;
export const STRESS_SCENARIO = SCENARIOS.stress;
export const GOALS: GoalContext = GOAL_CONTEXT;

export interface MixReading {
  /** The payment in month 1, base scenario. */
  first: Decimal;
  /** The highest payment under the stress scenario. */
  stressMax: Decimal;
  /** How far the highest stress payment rises above the first base payment (the exposure goal). */
  rise: Decimal;
  /** Every payment added up, base scenario. */
  total: Decimal;
  /** Percent of the loan that is not fixed for its whole term. */
  variableShare: Decimal;
  /** Payment-to-income ratio of case A, percent (affordability.ts through case-a-mix.ts). */
  ratio: Decimal;
  /** Above the 40% capital threshold (a threshold, not a ban). */
  aboveThreshold: boolean;
  /** No ban of Directive 329 crossed. */
  passes: boolean;
  /** Share of the loan in linked tracks, percent: the exposure to the index. */
  linkedShare: Decimal;
}

export function readMix(tracks: TrackSpec[]): MixReading {
  const base = measuresOf(tracks, GOALS.base);
  const stress = measuresOf(tracks, GOALS.stress);
  const loan = loanOf(tracks);
  const ratio = caseARatio(tracks);
  const linked = tracks.filter((t) => t.kind === "fixed_linked" || t.kind === "variable_linked").reduce((s, t) => s.plus(t.amount), new Decimal(0));
  return {
    first: base.first,
    stressMax: stress.max,
    rise: stressRise(tracks, GOALS),
    total: base.total,
    variableShare: variableAmount(tracks).div(loan).mul(100),
    ratio,
    aboveThreshold: ratio.gt(PTI_CAPITAL_THRESHOLD),
    passes: caseAPasses(tracks),
    linkedShare: linked.div(loan).mul(100),
  };
}

export type ReadKey = "first" | "stressMax" | "rise" | "total" | "ratio";
/** The measures where a lower figure is better for the family, in the order a table shows them. */
export const LOWER_IS_BETTER: { key: ReadKey; label: string }[] = [
  { key: "first", label: "החזר ראשון" },
  { key: "total", label: "סך התשלומים" },
  { key: "rise", label: "כמה ההחזר יכול לעלות (תרחיש מחמיר)" },
  { key: "ratio", label: "יחס ההחזר" },
];

/** Which of two mixes is better on one measure: "requested", "counter" or "same". Lower wins; equal to the agora is "same". */
export function better(a: MixReading, b: MixReading, key: ReadKey): "requested" | "counter" | "same" {
  const x = a[key].toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const y = b[key].toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return x.eq(y) ? "same" : x.lt(y) ? "requested" : "counter";
}

// ── A bank's view: INVENTED cost of funds by kind of track (percent a year) ───────────────────────────────

/** Invented. The mechanism (income = rate − cost of the money) is general; the numbers are the exercise's. */
export const EXERCISE_COST_OF_FUNDS: Record<TrackKind, string> = {
  prime: "4.40",
  variable_unlinked: "3.70",
  fixed_unlinked: "3.75",
  fixed_linked: "2.45",
  variable_linked: "2.15",
};

export const bankMargin = (tracks: TrackSpec[]): Decimal => firstYearMargin(tracks, EXERCISE_COST_OF_FUNDS);

// ── Rules of the exercise for the rounds of negotiation (not known rules of any bank) ─────────────────────

/** A re-pricing round takes this many business days; this many calendar days must remain after the answer for what comes before signing. */
export const ROUND_RULE = { roundDays: 3, reserve: 7 };

/** The bank the family would like to stay with in the negotiation example, and the best price the others gave for the same mix. */
export const NEGOTIATION = {
  /** The bank the family is negotiating with. */
  bank: "a" as BankId,
  /** The competing offer: the same mix, a whole offer from another bank. */
  competitor: "b" as BankId,
  /** What each round of the example moved: edits applied one after another to the rates of bank א׳'s offer. */
  rounds: [
    { target: "all", points: "-0.10" },
    { target: "fixed_unlinked", points: "-0.05" },
  ] as MixEdit[],
  /** The family's own line: a round that saves less than this over the life of the loan is not worth another wait (a choice, in shekels). */
  threshold: "10000",
};

