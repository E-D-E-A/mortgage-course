/** Fact builders for constraints.ts (lesson 8.7 and the later users). Encodes a candidate the way checks/kinds/constraints.py reads it. */
import Decimal from "decimal.js";
import type { Candidate, Family } from "../../src/lib/calc/constraints.ts";
import { CONSTRAINTS, evaluate, measures } from "../../src/lib/calc/constraints.ts";
import { formatPlain } from "../../src/lib/calc/stats.ts";
import type { Fact } from "../build-data.ts";

export function encodeCandidate(c: Candidate): string {
  const r = c.request;
  const bank = r.bank ? `${r.bank.ratioMax}:${r.bank.ltvMax}:${Object.entries(r.bank.prices).map(([k, v]) => `${k}=${v}`).join(",")}` : "-";
  return [
    `price=${new Decimal(r.price).toString()}`,
    `equity=${new Decimal(r.equity).toString()}`,
    `avail=${new Decimal(r.equityAvailable).toString()}`,
    `incomes=${r.incomes.map((x) => new Decimal(x).toString()).join(",")}`,
    `obl=${r.obligations.map((o) => `${new Decimal(o.monthly).toString()}:${o.monthsLeft ?? "-"}`).join(",")}`,
    `max=${r.maxPayment === null ? "-" : new Decimal(r.maxPayment).toString()}`,
    `target=${r.targetRatio === null ? "-" : new Decimal(r.targetRatio).toString()}`,
    `bank=${bank}`,
    `tracks=${c.tracks.map((t) => `${t.kind}:${new Decimal(t.amount).toString()}:${new Decimal(t.rate).toString()}:${t.months}`).join(",")}`,
  ].join(";");
}

/** The ids of every constraint the candidate fails, comma-separated ("" = feasible). */
export const reasonsFact = (id: string, c: Candidate): Fact => ({
  id,
  kind: "cons_reasons",
  inputs: { candidate: encodeCandidate(c) },
  value: evaluate(c).reasons.map((r) => r.id).join(","),
});

export const feasibleCountFact = (id: string, cs: Candidate[], families: Family[] = ["identity", "law", "bank", "client"]): Fact => {
  const active = CONSTRAINTS.filter((k) => families.includes(k.family));
  return { id, kind: "cons_feasible_count", inputs: { candidates: cs.map(encodeCandidate).join("|"), families: families.join(",") }, value: cs.filter((c) => evaluate(c, active).feasible).length };
};

export type Part = "loan" | "ltv" | "disposable" | "payment" | "ratio" | "variable_percent";
export const measureFact = (id: string, c: Candidate, part: Part, decimals: number): Fact => {
  const m = measures(c);
  const v = { loan: m.loan, ltv: m.ltv, disposable: m.disposable, payment: m.payment, ratio: m.ratio as Decimal, variable_percent: m.variablePercent }[part];
  return { id, kind: "cons_measure", inputs: { candidate: encodeCandidate(c), part, decimals }, value: formatPlain(v, decimals) };
};
