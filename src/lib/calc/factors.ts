/**
 * The arithmetic behind the factor cards (course map, section 4; lessons 4.10 and 4.11).
 *
 * Every card answers "a numerical example" (question 7). The example's teaching
 * inputs and the steps that compute from them are data, in src/data/factor-cards.ts;
 * this module runs those steps, so the lesson data scripts (scripts/lessons/lesson-4-10.ts
 * and lesson-4-11.ts) turn each step into a fact and checks/kinds/factors.py recomputes it.
 *
 * Values travel as strings. A number is written plainly with at most `decimals`
 * decimals (default 2), half away from zero, without trailing zeros: "42", "78.95",
 * "11933.33". A date is ISO ("2026-12-10"). Nothing here formats for display.
 */
import Decimal from "decimal.js";
import { annuityPayment } from "./amortization.ts";

export type Numeric = Decimal.Value;

/** One computed step of a card's example. Every operand names an earlier value of the same example. */
export type CardCalc =
  /** a ÷ b × 100: a share in percent. */
  | { op: "ratio"; a: string; b: string; decimals?: number }
  /** amount × percent ÷ 100. */
  | { op: "share"; amount: string; percent: string; decimals?: number }
  | { op: "sum"; of: string[]; decimals?: number }
  | { op: "minus"; a: string; b: string; decimals?: number }
  | { op: "times"; a: string; b: string; decimals?: number }
  | { op: "divide"; a: string; b: string; decimals?: number }
  /** The level monthly payment (שפיצר), annual rate ÷ 12, rounded to the agora. */
  | { op: "payment"; principal: string; rate: string; months: string }
  | { op: "addDays"; date: string; days: string }
  | { op: "daysBetween"; from: string; to: string }
  /** How many of the values are at most `limit` (children counted "up to age 18"). */
  | { op: "countUpTo"; of: string[]; limit: string };

/** A number as the cards write it: at most `decimals` decimals, half away from zero, no trailing zeros. */
export function plain(value: Numeric, decimals = 2): string {
  const d = new Decimal(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  const s = d.toFixed();
  return s === "-0" ? "0" : s;
}

const day = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new RangeError(`not an ISO date: ${iso}`);
  return new Date(`${iso}T00:00:00Z`);
};

export function addDays(iso: string, days: Numeric): string {
  const n = new Decimal(days);
  if (!n.isInteger()) throw new RangeError(`days must be whole, got ${days}`);
  const d = day(iso);
  d.setUTCDate(d.getUTCDate() + n.toNumber());
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((day(to).getTime() - day(from).getTime()) / 86_400_000);
}

/** Runs one step on already known values. */
export function runCalc(calc: CardCalc, v: (name: string) => string): string {
  const d = "decimals" in calc && calc.decimals !== undefined ? calc.decimals : 2;
  switch (calc.op) {
    case "ratio":
      return plain(new Decimal(v(calc.a)).div(v(calc.b)).mul(100), d);
    case "share":
      return plain(new Decimal(v(calc.amount)).mul(v(calc.percent)).div(100), d);
    case "sum":
      return plain(calc.of.reduce((s, name) => s.plus(v(name)), new Decimal(0)), d);
    case "minus":
      return plain(new Decimal(v(calc.a)).minus(v(calc.b)), d);
    case "times":
      return plain(new Decimal(v(calc.a)).mul(v(calc.b)), d);
    case "divide":
      return plain(new Decimal(v(calc.a)).div(v(calc.b)), d);
    case "payment":
      return plain(annuityPayment(v(calc.principal), v(calc.rate), Number(v(calc.months))), 2);
    case "addDays":
      return addDays(v(calc.date), v(calc.days));
    case "daysBetween":
      return String(daysBetween(v(calc.from), v(calc.to)));
    case "countUpTo":
      return String(calc.of.filter((name) => new Decimal(v(name)).lte(v(calc.limit))).length);
  }
}

/** The inputs a fact records for a step: each operand by its value (lists joined with "|"), plus the rounding. */
export function calcInputs(calc: CardCalc, v: (name: string) => string): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, ref] of Object.entries(calc)) {
    if (key === "op") continue;
    if (key === "decimals") out.decimals = ref as number;
    else if (Array.isArray(ref)) out[key] = ref.map(v).join("|");
    else out[key] = v(ref as string);
  }
  return out;
}

export interface ExampleStep {
  name: string;
  /** A teaching input, written as a string ("8400", "2026-10-11"). */
  given?: string;
  calc?: CardCalc;
}

export interface StepValue {
  name: string;
  kind: string;
  inputs: Record<string, string | number>;
  value: string;
}

/** Runs an example's steps in order. A step uses only values named before it. */
export function evaluateSteps(steps: ExampleStep[]): StepValue[] {
  const known = new Map<string, string>();
  const v = (name: string) => {
    const x = known.get(name);
    if (x === undefined) throw new Error(`unknown value "${name}"`);
    return x;
  };
  return steps.map((s) => {
    if ((s.given === undefined) === (s.calc === undefined)) throw new Error(`step "${s.name}" needs exactly one of given or calc`);
    if (known.has(s.name)) throw new Error(`step "${s.name}" named twice`);
    const value = s.given ?? runCalc(s.calc as CardCalc, v);
    const out: StepValue = s.given !== undefined
      ? { name: s.name, kind: "given", inputs: {}, value }
      : { name: s.name, kind: `fc_${(s.calc as CardCalc).op}`, inputs: calcInputs(s.calc as CardCalc, v), value };
    known.set(s.name, value);
    return out;
  });
}
