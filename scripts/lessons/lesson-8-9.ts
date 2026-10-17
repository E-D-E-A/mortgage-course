/**
 * Lesson 8.9 - the calculation engine: a cash flow per track per scenario, the mix as the sum of its tracks, the stage-3 measures,
 * and "same input, same output". LABEL: Mogi today has no mix calculation in code (the engine call is frozen); the only thing decided
 * is Eylon's 15 calculation rules (as the Brain's page records them: confirmed 2026-10-07, accepted by Eden 2026-10-08; "the
 * implementation is not complete"). The engine here is the COURSE'S illustration, built from the course's schedule rules.
 * Numbers: engine.ts; rechecked by checks/kinds/engine.py (through schedule.py). Case A's initial mix (src/data/case-a-mix.ts) and
 * its base and stress scenarios (lesson 5.6) are teaching assumptions, not a bank's offer.
 */
import Decimal from "decimal.js";
import { CANDIDATES, CASE_A, INITIAL_MIX, SCENARIOS, candidate } from "../../src/data/case-a-mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import { evaluate } from "../../src/lib/calc/engine.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { engFact, engSumFact } from "./_stage8b-facts.ts";

export const MONTHS = [1, 61, 121, 360] as const;
export const HAND_MONTHS = [1, 2, 12] as const;
const base = scenarioFrom(SCENARIOS.base);
const stress = scenarioFrom(SCENARIOS.stress);
const flat = scenarioFrom({ inflation: "0", primeShift: "0", anchorShift: "0" });
// 120,000 at 12% a year (1% a month) for 12 months, equal principal: a hand-sized track.
export const HAND: TrackSpec = { kind: "fixed_unlinked", amount: "120000", rate: "12", months: 12, method: "equal_principal" };

export default function lesson89(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  // ── A track you can do by hand ──
  add(givenMoney("hand.amount", HAND.amount as string));
  add(given("hand.rate", HAND.rate as string));
  add(given("hand.months", HAND.months));
  for (const m of HAND_MONTHS) {
    add(engFact(`hand.pay_${m}`, [HAND], flat, "payment", m));
    add(engFact(`hand.int_${m}`, [HAND], flat, "interest_at", m));
    add(engFact(`hand.prin_${m}`, [HAND], flat, "principal_at", m));
    add(engFact(`hand.close_${m}`, [HAND], flat, "closing_at", m));
  }
  add(engFact("hand.total", [HAND], flat, "total"));
  add(engFact("hand.interest", [HAND], flat, "interest"));

  // ── Case A: the initial mix, track by track ──
  INITIAL_MIX.forEach((t, k) => {
    add(givenMoney(`init.amount_${k + 1}`, t.amount as string));
    add(given(`init.rate_${k + 1}`, t.rate as string));
  });
  add(given("init.years", CASE_A.termMonths / 12));
  for (const [sid, sc] of [["base", base], ["stress", stress]] as const) {
    for (const m of MONTHS) {
      const ids: string[] = [];
      let sum = new Decimal(0);
      INITIAL_MIX.forEach((t, k) => {
        const f = add(engFact(`pay.${sid}.t${k + 1}.${m}`, [t], sc, "payment", m));
        ids.push(f.id);
        sum = sum.plus(f.value as string);
      });
      const mix = add(engFact(`pay.${sid}.mix.${m}`, INITIAL_MIX, sc, "payment", m));
      const s = add(engSumFact(`pay.${sid}.sum.${m}`, ids, moneyString(sum)));
      if (s.value !== mix.value) throw new Error(`the mix is not the sum of its tracks at month ${m} (${sid})`);
    }
  }
  {
    const g = (id: string) => facts.find((f) => f.id === id) as Fact;
    add(difference("stress.round_gap", g("pay.stress.mix.360"), g("pay.stress.mix.61")));
  }
  for (const [sid, sc] of [["base", base], ["stress", stress]] as const) {
    for (const meas of ["first", "max", "max_month", "total", "interest", "loan", "residual"] as const) add(engFact(`init.${sid}.${meas}`, INITIAL_MIX, sc, meas));
  }
  add(difference("init.base.interest_check", { id: "init.base.total", kind: "x", inputs: {}, value: facts.find((f) => f.id === "init.base.total")?.value } as Fact, { id: "init.base.loan", kind: "x", inputs: {}, value: facts.find((f) => f.id === "init.base.loan")?.value } as Fact));
  // The difference (total - loan) is the interest on an unlinked mix: the same number as the engine's own interest.
  const chk = facts.find((f) => f.id === "init.base.interest_check");
  const intr = facts.find((f) => f.id === "init.base.interest");
  if (!chk || !intr || chk.value !== intr.value) throw new Error("total - loan is not the interest");
  facts.pop();
  add(difference("init.base.interest_gap", facts.find((f) => f.id === "init.base.total") as Fact, facts.find((f) => f.id === "init.base.loan") as Fact));

  // ── The linked mix: the third part of the total ──
  const linked = candidate("linked").tracks;
  for (const meas of ["loan", "interest", "indexation", "total", "residual"] as const) add(engFact(`linked.${meas}`, linked, base, meas));

  // ── Same input, same output ──
  const run1 = add(engFact("fp.run1", INITIAL_MIX, base, "fingerprint"));
  const run2 = add(engFact("fp.run2", INITIAL_MIX, base, "fingerprint"));
  if (run1.value !== run2.value) throw new Error("not deterministic");
  add(engFact("fp.stress", INITIAL_MIX, stress, "fingerprint"));
  add(engFact("fp.reversed", [...INITIAL_MIX].reverse(), base, "fingerprint"));
  // One agora of rate-free change: the first track a shekel larger, the last a shekel smaller.
  const nudged = INITIAL_MIX.map((t, k) => (k === 0 ? { ...t, amount: new Decimal(t.amount as string).plus(1).toFixed(2) } : k === 2 ? { ...t, amount: new Decimal(t.amount as string).minus(1).toFixed(2) } : t));
  add(engFact("fp.nudged", nudged, base, "fingerprint"));
  void CANDIDATES;
  void evaluate;

  return {
    lesson: "8.9",
    title: "תזרים לכל מסלול לפי תרחיש, ותזרים התמהיל",
    note: "Case A's initial mix and the base/stress scenarios of lesson 5.6 (teaching assumptions). Engine = the course's illustration of an engine (src/lib/calc/engine.ts over schedule.ts); Mogi has none in code. Statement rounding.",
    facts,
  };
}
