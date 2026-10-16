/**
 * Fact builders for lessons 6.9–6.11 (stage-6 author D): one file read by one bank's invented policy
 * (src/lib/calc/bankpolicy.ts). Each fact names a kind that a checks/kinds/ module recomputes on its own:
 * sens_mix (the ratio, the first payment, the total: sensitivity.py), ltv_percent (ltv.py) and bp_decision,
 * bp_relief, bp_rate (bankpolicy.py). Not a lesson module: build-data.ts loads only lesson-*.ts and check-*.ts.
 *
 * A fact about a file is `<prefix>.<what>`: loan, ltv, ratio, decision, relief; and, when the bank approves,
 * rate_1…rate_n (the final rate of each track), first and total (the final tracks under the base scenario).
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { floorAgora } from "../../src/lib/calc/regulation.ts";
import { evaluate, type BankPolicy, type LoanFile, type Verdict } from "../../src/lib/calc/bankpolicy.ts";
import { mixInputs } from "../../src/lib/calc/schedule.ts";
import { measuresOf, qualifyingTotal, scenarioFrom, type ScenarioSpec } from "../../src/lib/calc/sensitivity.ts";
import type { Fact } from "../build-data.ts";

/** The base teaching scenario of case-a-mix.ts, repeated here as a type only through the caller. */
export interface FileFactsOptions {
  scenario: ScenarioSpec;
  /** Facts of the final tracks (first payment, total) when the bank approves. Default true. */
  priced?: boolean;
}

const obligationInputs = (file: LoanFile): Record<string, string | number> => {
  const o = file.obligations[0];
  if (file.obligations.length > 1) throw new Error("a file in these lessons has at most one obligation");
  return o ? { obligation_monthly: new Decimal(o.monthly).toString(), obligation_months: o.monthsLeft ?? 0 } : { obligation_monthly: "0", obligation_months: 0 };
};

/** The decision, and its facts, for one bank reading one file. Returns the Verdict. */
export function verdictFacts(add: <T extends Fact>(f: T) => T, p: string, policy: BankPolicy, file: LoanFile, opts: FileFactsOptions): Verdict {
  const v = evaluate(policy, file);
  const sc = scenarioFrom(opts.scenario);
  // A refusal or a relief that depends on a number within a hundredth of its line cannot be rechecked on the two-decimal value: never build one.
  for (const l of v.lines) {
    for (const line of [l.max, l.reliefLine]) if (line !== null && l.actual.minus(line).abs().lt("0.01")) throw new Error(`${p}: ${l.id} ${l.actual.toString()} is within a hundredth of the line ${line}`);
  }
  add({ id: `${p}.loan`, kind: "sens_mix", inputs: { ...mixInputs(v.listTracks, sc), measure: "loan" }, value: moneyString(v.loan) });
  add({ id: `${p}.ltv`, kind: "ltv_percent", inputs: { loan: moneyString(v.loan), value: new Decimal(file.value).toString() }, value: percentString(v.ltv) });
  add({
    id: `${p}.ratio`,
    kind: "sens_mix",
    inputs: { ...mixInputs(v.listTracks, sc), measure: "ratio", income: new Decimal(file.income).toString(), ...obligationInputs(file) },
    value: percentString(v.ratio),
  });
  const ratio = percentString(v.ratio);
  const ltv = percentString(v.ltv);
  add({ id: `${p}.decision`, kind: "bp_decision", inputs: { ratio, ltv, ratio_max: policy.ratioMax, ltv_max: policy.ltvMax }, value: v.decision });
  add({
    id: `${p}.relief`,
    kind: "bp_relief",
    inputs: {
      ratio,
      ltv,
      ratio_max: policy.ratioMax,
      ltv_max: policy.ltvMax,
      ratio_relief_line: policy.ratioReliefLine ?? "none",
      ratio_relief_points: policy.ratioReliefPoints,
      ltv_relief_line: policy.ltvReliefLine ?? "none",
      ltv_relief_points: policy.ltvReliefPoints,
    },
    value: v.relief.toString(),
  });
  if (v.decision === "approve") {
    v.finalTracks.forEach((t, k) =>
      add({ id: `${p}.rate_${k + 1}`, kind: "bp_rate", inputs: { list_rate: policy.prices[file.tracks[k].kind], relief: v.relief.toString() }, value: new Decimal(t.rate).toFixed(2) }),
    );
    if (opts.priced !== false) {
      const m = measuresOf(v.finalTracks, sc);
      add({ id: `${p}.first`, kind: "sens_mix", inputs: { ...mixInputs(v.finalTracks, sc), measure: "first" }, value: moneyString(m.first) });
      add({ id: `${p}.total`, kind: "sens_mix", inputs: { ...mixInputs(v.finalTracks, sc), measure: "total" }, value: moneyString(m.total) });
    }
  }
  return v;
}

/** The largest loan a ceiling (percent of the value) allows, cut down to the agora (kind bp_max_loan). */
export const maxLoanAt = (id: string, value: string, percent: string): Fact => ({
  id,
  kind: "bp_max_loan",
  inputs: { value, percent },
  value: moneyString(floorAgora(new Decimal(value).mul(percent).div(100))),
});

/** The total paid by tracks under a scenario (kind sens_mix, measure total). */
export function totalFact(id: string, tracks: Parameters<typeof mixInputs>[0], scenario: ScenarioSpec, measure: "total" | "first" | "qualifying" = "total"): Fact {
  const sc = scenarioFrom(scenario);
  const m = measuresOf(tracks, sc);
  const value = measure === "total" ? m.total : measure === "first" ? m.first : qualifyingTotal(tracks);
  return { id, kind: "sens_mix", inputs: { ...mixInputs(tracks, sc), measure }, value: moneyString(value) };
}
