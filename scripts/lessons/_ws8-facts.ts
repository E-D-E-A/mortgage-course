/**
 * Fact builders for workshop 8.28 (stage 8, author D). A fact is { kind: "ws8_value", inputs: {choice, weights, what}, value }
 * with the value read from src/lib/calc/ws8.ts, and checks/kinds/ws8.py (through checks/ws8_engine.py, which is also the
 * notebook's code) recomputes it from the case alone. The case is the fact `ws.case`, built from src/data/case-s8.ts.
 */
import type { Choice } from "../../src/data/case-s8.ts";
import { checkAgainstOffer, runWorkshop, type WorkshopResult, WS_WEIGHTS, workshopCase } from "../../src/lib/calc/ws8.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { scoreText } from "../../src/lib/calc/objectives.ts";
import type { Fact } from "../build-data.ts";

const MEASURE = { first: 0, total: 1, exposure: 2 } as const;
const IDS = ["sum_equals_loan", "positive_tracks", "equity_available", "ltv", "pti", "variable_share", "term", "bank_ratio", "bank_ltv", "client_max_payment", "client_target_ratio"];

export const caseFact = (): Fact => ({ id: "ws.case", kind: "given", inputs: {}, value: workshopCase() });

const cache = new Map<string, WorkshopResult>();
function resultOf(choice: Choice, weights: number[]): WorkshopResult {
  const key = JSON.stringify([choice, weights]);
  let r = cache.get(key);
  if (!r) cache.set(key, (r = runWorkshop(choice, weights)));
  return r;
}

function readValue(r: WorkshopResult, what: string): unknown {
  const m = (v: { toString(): string }) => moneyString(v.toString());
  const part = what.split(":");
  const winner = r.winner;
  const runner = r.rows.find((x) => x.rank === 2);
  switch (part[0]) {
    case "loan":
      return m(r.loan);
    case "ltv":
      return r.ltv.toDecimalPlaces(2, 4).toFixed(2);
    case "disposable":
      return m(r.disposable);
    case "front_ids":
      return r.rows.filter((x) => x.efficient).map((x) => x.id).join("|");
    case "feasible_ids":
      return r.rows.filter((x) => x.feasible).map((x) => x.id).join("|");
    case "space":
      return Number(r.spaceSize);
    case "feasible":
      return r.feasibleCount;
    case "efficient":
      return r.efficientIds.length;
    case "reject":
      return r.rejectionCounts[part[1] as keyof typeof r.rejectionCounts];
    case "winner_id":
      return winner?.id;
    case "runner_id":
      return runner?.id;
    case "winner":
      return m((winner as NonNullable<typeof winner>).values[MEASURE[part[1] as keyof typeof MEASURE]]);
    case "gap":
      return m((runner as NonNullable<typeof runner>).values[MEASURE[part[1] as keyof typeof MEASURE]].minus((winner as NonNullable<typeof winner>).values[MEASURE[part[1] as keyof typeof MEASURE]]));
    case "row": {
      const row = r.rows.find((x) => x.id === part[1]) as NonNullable<(typeof r.rows)[number]>;
      const f = part[2];
      if (f in MEASURE) return m(row.values[MEASURE[f as keyof typeof MEASURE]]);
      if (f === "feasible") return row.feasible;
      if (f === "efficient") return row.efficient;
      if (f === "reasons") return IDS.filter((id) => row.reasons.includes(id as never)).join("|");
      if (f === "score") return scoreText(row.score);
      break;
    }
    case "offer": {
      const o = checkAgainstOffer();
      const t = { estimate_first: o.estimate.base.first, offer_first: o.offer.base.first, estimate_total: o.estimate.base.total, offer_total: o.offer.base.total, first_gap: o.firstGap, total_gap: o.totalGap };
      return m(t[part[1] as keyof typeof t]);
    }
  }
  throw new Error(`unknown ws8 value ${what}`);
}

/** The inputs of a choice, flat, as checks/kinds/ws8.py reads them. */
export const choiceInputs = (c: Choice, weights: number[] = WS_WEIGHTS) => ({
  extra_equity: c.extraEquity,
  close_car: c.closeCar ? 1 : 0,
  parent: c.parent ? 1 : 0,
  bank: c.bank,
  weights: weights.join("|"),
});

export function ws8Fact(id: string, choice: Choice, what: string, weights: number[] = WS_WEIGHTS): Fact {
  return { id, kind: "ws8_value", inputs: { ...choiceInputs(choice, weights), what }, value: readValue(resultOf(choice, weights), what) };
}
