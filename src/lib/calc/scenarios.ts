/**
 * Three different statements about the future — lesson 8.10 ("three forecasts: by Directive 451, a
 * stress scenario, and a macro forecast") — each turned into the same shape the engine reads (a
 * schedule.ts Scenario: the index's rise, prime's shift and the variable anchors' shift, a value for
 * each year), so one mix can be run under all three and compared.
 *
 * LABEL (course/stage-8-brief.md): nothing here is an existing Mogi system. "Mogi today": no mix
 * calculation exists in code (the engine call is frozen). "Decided": only that the pre-approval figures
 * follow the Directive 451 forecast inputs and that stress scenarios are kept separate from them (the
 * Brain's calculation-rules page, confirmed by Eylon 2026-10-07, accepted by Eden 2026-10-08; and the
 * Brain's data-connections page: "a market-implied path is not a probability distribution or a worst-case
 * guarantee"). The macro path and the stress shocks below are THE COURSE'S ILLUSTRATIONS, "for
 * illustration" - not the Bank of Israel's Research Department forecast, and not a Mogi decision.
 *
 * The three, and what kind of statement each one is:
 *   forecast451   A calculation PRESCRIBED to compare offers: the forward rates of the (illustrative)
 *                 zero curves in src/data/curves.ts, by forecast.ts. It is what the curves imply, not a
 *                 prediction of what will happen.
 *   stress        A scenario an analyst CHOOSES to ask "what if it goes badly": the course's own
 *                 SCENARIOS.stress (inflation 4%, prime and anchors +2 points). Chosen, not predicted.
 *   macro         Someone's OWN forecast of the economy (an institution's research view). The course
 *                 invents a small table of policy rates and inflation by year and turns it into the same
 *                 shape. Another view than the curves; neither is a guarantee.
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *
 *   forecast451Scenario(opts?)   opts = {curves (default CURVES.A), resetYears (default 5), years (30)}.
 *                                inflation[y] = forecast.ts's yearly inflation; primeShift[y] = the
 *                                1-year forward anchor of year y+1 minus today's; anchorShift[y] (an
 *                                unlinked variable track resetting every `resetYears`) and
 *                                linkedAnchorShift[y] (on the real curve) = the forward anchor of the
 *                                block y falls in minus the first block's. Same payments as
 *                                forecast.ts's forecastTrack for the same track (tested, to the agora).
 *   stressScenario()             scenarioFrom(SCENARIOS.stress)
 *   MACRO                        the invented table (policy rate and inflation, years 1-10, the last carries on)
 *   macroScenario(opts?)         primeShift[y] = policy[y] - policy[0]; anchorShift[y] = (mean of the
 *                                policy rate over the 5 years starting at year y) - (mean over years 1-5),
 *                                to 2 decimals: an anchor follows the average expected policy rate over
 *                                its window (the course's assumption, labelled); inflation[y] from the table.
 *   NAMED_SCENARIOS()            [{id, nameHe, kindHe, scenario}] in the order 451, stress, macro
 *   primePath(scenario, years)   prime's rate in each year: PRIME_TODAY + primeShift[y]
 *   inflationPath(scenario, years)
 *   compareScenarios(tracks, named)   evaluate.ts-style measures of one mix under each scenario
 *
 * Recomputed independently in checks/kinds/scenarios.py (kinds scn_*), which rebuilds the shifts from the
 * curves' text and runs the cash flow through checks/kinds/schedule.py.
 * Exports are stable: other stage-8 modules import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { PRIME_TODAY, SCENARIOS } from "../../data/case-a-mix.ts";
import { CURVES, type CurveSet } from "../../data/curves.ts";
import { evaluate, type Evaluation } from "./engine.ts";
import { forwardAnchors, round2, yearlyInflation } from "./forecast.ts";
import type { Scenario, TrackSpec } from "./schedule.ts";
import { scenarioFrom } from "./sensitivity.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export type ScenarioId = "forecast451" | "stress" | "macro";

export interface NamedScenario {
  id: ScenarioId;
  nameHe: string;
  /** What kind of statement it is, in a few words. */
  kindHe: string;
  scenario: Scenario;
}

export interface ForecastOptions {
  curves?: CurveSet;
  resetYears?: number;
  years?: number;
}

const str = (xs: Decimal[]): string[] => xs.map((x) => x.toString());

export function forecast451Scenario(opts: ForecastOptions = {}): Scenario {
  const curves = opts.curves ?? CURVES.A;
  const reset = opts.resetYears ?? 5;
  const years = opts.years ?? 30;
  const inflation = yearlyInflation(curves.nominal, curves.real, years);
  const prime = forwardAnchors(curves.nominal, 1, years);
  const blocks = Math.ceil(years / reset);
  const nominal = forwardAnchors(curves.nominal, reset, blocks);
  const real = forwardAnchors(curves.real, reset, blocks);
  const byBlock = (anchors: Decimal[]) => Array.from({ length: years }, (_, y) => anchors[Math.floor(y / reset)].minus(anchors[0]));
  return {
    inflation: str(inflation),
    primeShift: str(prime.map((a) => a.minus(prime[0]))),
    anchorShift: str(byBlock(nominal)),
    linkedAnchorShift: str(byBlock(real)),
    blockMonths: 12,
    rounding: "statement",
  };
}

export function stressScenario(): Scenario {
  return scenarioFrom(SCENARIOS.stress);
}

/** The invented macro table: one value per year, years 1-10; the last carries on. Percent, for illustration. */
export const MACRO = {
  nameHe: "תחזית מקרו להמחשה",
  policy: ["3.25", "3.00", "2.75", "2.75", "3.00", "3.25", "3.25", "3.50", "3.50", "3.50"],
  inflation: ["2.60", "2.30", "2.10", "2.00", "2.00", "2.00", "2.00", "2.00", "2.00", "2.00"],
} as const;

const carry = (table: readonly string[], y: number): Decimal => new D(table[Math.min(y, table.length - 1)]);
/** The mean of the policy rate over the 5 years that start at (0-based) year y. */
const windowMean = (y: number): Decimal => {
  let s = new D(0);
  for (let k = 0; k < 5; k++) s = s.plus(carry(MACRO.policy, y + k));
  return s.div(5);
};

export function macroScenario(opts: { years?: number } = {}): Scenario {
  const years = opts.years ?? 30;
  const first = windowMean(0);
  return {
    inflation: Array.from({ length: years }, (_, y) => carry(MACRO.inflation, y).toString()),
    primeShift: Array.from({ length: years }, (_, y) => carry(MACRO.policy, y).minus(MACRO.policy[0]).toString()),
    anchorShift: Array.from({ length: years }, (_, y) => round2(windowMean(y).minus(first)).toString()),
    blockMonths: 12,
    rounding: "statement",
  };
}

export function NAMED_SCENARIOS(): NamedScenario[] {
  return [
    { id: "forecast451", nameHe: "תחזית לפי הוראה 451", kindHe: "חישוב שנקבע מראש, לצורך השוואת הצעות", scenario: forecast451Scenario() },
    { id: "stress", nameHe: "תרחיש לחץ", kindHe: "מצב שבוחרים לבדוק: ״מה אם זה הולך רע״", scenario: stressScenario() },
    { id: "macro", nameHe: "תחזית מקרו", kindHe: "הערכה של גוף מחקר על הכלכלה כולה", scenario: macroScenario() },
  ];
}

/** Prime's rate in each of the first `years` years (percent): today's prime plus the scenario's shift. */
export function primePath(scenario: Scenario, years: number, today: string = PRIME_TODAY): Decimal[] {
  const shifts = scenario.primeShift && scenario.primeShift.length > 0 ? scenario.primeShift : ["0"];
  return Array.from({ length: years }, (_, y) => new D(today).plus(shifts[Math.min(y, shifts.length - 1)]));
}

/** The index's rise in each of the first `years` years (percent). */
export function inflationPath(scenario: Scenario, years: number): Decimal[] {
  const xs = scenario.inflation && scenario.inflation.length > 0 ? scenario.inflation : ["0"];
  return Array.from({ length: years }, (_, y) => new D(xs[Math.min(y, xs.length - 1)]));
}

export interface ScenarioRow {
  id: ScenarioId;
  nameHe: string;
  evaluation: Evaluation;
}

export function compareScenarios(tracks: TrackSpec[], named: NamedScenario[] = NAMED_SCENARIOS()): ScenarioRow[] {
  return named.map((n) => ({ id: n.id, nameHe: n.nameHe, evaluation: evaluate(tracks, n.scenario) }));
}
