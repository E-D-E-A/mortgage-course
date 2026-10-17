/**
 * Fact builders for units 9.1–9.4 (stage-9 author A). Each builder computes its value with src/lib/calc/casefile.ts (which composes the
 * earlier stages' modules) and names a kind that checks/kinds/casefile.py recomputes on its own, or a kind an earlier stage already
 * checks. Not a lesson module: build-data.ts loads only lesson-*.ts and check-*.ts. Authors of 9.3–9.4 may import it.
 */
import Decimal from "decimal.js";
import {
  CLAIMS,
  DOCUMENTS,
  EQUITY_PIECES,
  EVIDENCE,
  FILE,
  LIVING_BUDGET,
  PAYSLIPS,
  STATEMENT,
  STATEMENT_OPENING,
  type ClaimId,
  type DocId,
  type PersonId,
} from "../../src/data/case-a-final.ts";
import {
  shapesOf,
  claimStates,
  countStates,
  docStates,
  equityOf,
  householdIncome,
  incomeOf,
  readingOf,
  scenarioDef,
  statementRows,
  type View,
  WINDOW_MONTHS,
} from "../../src/lib/calc/casefile.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { ScenarioId } from "../../src/lib/calc/scenarios.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact } from "../build-data.ts";
import { scnEvalFact } from "./_stage8b-facts.ts";

export { difference, given, givenMoney } from "./_sensitivity-facts.ts";

const pack = (xs: (string | number)[]) => xs.map(String).join("|");

export const evidenceText = EVIDENCE.map((e) => `${e.doc}:${e.claim}:${e.state}`).join("|");
const docsText = DOCUMENTS.map((d) => d.id).join("|");
const piecesText = EQUITY_PIECES.map((p) => `${p.id}:${p.declared}`).join("|");

/** The recognised monthly income of a person (mode "recognised"), the plain average of the nets ("naive"), or the one-offs added up ("oneoffs"). */
export const incomeFact = (id: string, person: PersonId, mode: "recognised" | "naive" | "oneoffs"): Fact => {
  const i = incomeOf(person);
  const value = mode === "recognised" ? i.recognised : mode === "naive" ? i.naive : i.oneOffs;
  return {
    id,
    kind: "cf_income",
    inputs: { nets: pack(i.rows.map((r) => r.net.toString())), oneoffs: pack(i.rows.map((r) => r.oneOffNet.toString())), mode },
    value: moneyString(value),
  };
};

const statementInputs = () => ({
  opening: STATEMENT_OPENING,
  ...Object.fromEntries(STATEMENT.flatMap((m, k) => [[`month_${k + 1}`, m.month], [`noam_${k + 1}`, m.deposit.noam], [`shira_${k + 1}`, m.deposit.shira], [`debits_${k + 1}`, m.debits]])),
});

/** The statement table: rows {period, month, opening, noam, shira, deposits, debits, closing}. */
export const statementFact = (id: string): Fact => {
  const rows = statementRows();
  return {
    id,
    kind: "cf_statement",
    inputs: statementInputs(),
    value: rows.map((r, k) => ({
      period: k + 1,
      month: r.month,
      opening: moneyString(r.opening),
      noam: moneyString(r.deposits.noam),
      shira: moneyString(r.deposits.shira),
      deposits: moneyString(r.depositsTotal),
      debits: moneyString(r.debits),
      closing: moneyString(r.closing),
    })),
  };
};

/** The balance at the end of the statement. */
export const closingFact = (id: string): Fact => ({ id, kind: "cf_statement", inputs: { ...statementInputs(), field: "closing" }, value: moneyString(statementRows()[2].closing) });

export const claimStateFact = (id: string, claim: ClaimId): Fact => ({ id, kind: "cf_claim_state", inputs: { evidence: evidenceText, claim }, value: claimStates()[claim] });
export const docStateFact = (id: string, doc: DocId): Fact => ({ id, kind: "cf_doc_state", inputs: { evidence: evidenceText, doc }, value: docStates()[doc] });
export const countStatesFact = (id: string): Fact => ({ id, kind: "cf_count_states", inputs: { evidence: evidenceText, docs: docsText }, value: countStates() });
export const equityFact = (id: string, view: View): Fact => ({ id, kind: "cf_equity", inputs: { evidence: evidenceText, pieces: piecesText, view }, value: moneyString(equityOf(view)) });

export const CLAIM_IDS = CLAIMS.map((c) => c.id);

export type WindowMeasure = "max" | "max_month" | "left_first" | "left_max" | "margin_first" | "margin_max";

/** The highest payment in the first 60 months of a mix under a scenario, the month it is paid, and what the family has left in the first month and in that month. */
export function windowFact(id: string, tracks: TrackSpec[], sid: ScenarioId, measure: WindowMeasure): Fact {
  const probe = scnEvalFact(id, sid, tracks, "first");
  const { measure: _m, month: _mo, ...inputs } = probe.inputs as Record<string, string | number>;
  void _m;
  void _mo;
  const r = readingOf(tracks, scenarioDef(sid));
  const value =
    measure === "max" ? moneyString(r.max60) : measure === "max_month" ? r.max60Month : measure === "left_first" ? moneyString(r.leftFirst) : measure === "left_max" ? moneyString(r.left60) : measure === "margin_first" ? moneyString(r.marginFirst) : moneyString(r.margin60);
  return {
    id,
    kind: "cf_window",
    inputs: { ...inputs, window: WINDOW_MONTHS, measure, net: householdIncome().recognised.toString(), car_monthly: FILE.car.monthly, car_months: FILE.car.monthsLeft as number, budget: LIVING_BUDGET },
    value,
  };
}

/** The label of the lowest of several facts (a tie keeps the first). */
export const lowestFact = (id: string, of: Fact[], labels: string[]): Fact => {
  if (of.length !== labels.length || of.length === 0) throw new Error("one label for each fact");
  let best = 0;
  of.forEach((f, k) => {
    if (new Decimal(f.value as string).lt(of[best].value as string)) best = k;
  });
  return { id, kind: "cf_lowest", inputs: { ids: pack(of.map((f) => f.id)), labels: pack(labels) }, value: labels[best] };
};

/** The payslips as given facts: gross, each mandatory deduction, each other deduction, the one-off. */
export const payslipInputs = (person: PersonId) => PAYSLIPS[person];

/** The whole-thousand cuts of a loan (cf_shapes): third · rest · rest for the request; variable · fixed for the alternatives. */
export const shapesFact = (id: string, loan: string): Fact => {
  const s = shapesOf(loan);
  return { id, kind: "cf_shapes", inputs: { loan }, value: { third: moneyString(s.third), rest: moneyString(s.rest), variable: moneyString(s.variable), fixed: moneyString(s.fixed) } };
};
