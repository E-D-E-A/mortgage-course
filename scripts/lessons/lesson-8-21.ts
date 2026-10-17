/**
 * Lesson 8.21 — the full pipeline, end to end, once for each of the four fictional banks.
 *
 * positioning -> mix -> predicted price -> probability of approval -> ranking -> explanation, on case A (the family of
 * stages 5-6) with two positionings (as asked; a parent joins as a borrower). The search is lesson 8.14's grid (kinds fixed,
 * prime, variable; 10% steps; 25 or 30 years, one term for the mix) with the constraints of 8.7 at each bank; the prices are
 * the invented rules of stage 6 (list less relief); the probability is lesson 8.19's synthetic model taken as if calibrated.
 * A real offer of bank ג׳ then replaces its estimate. Everything is SYNTHETIC and for illustration; the banks are fictional.
 * Facts: srch_grid (the search's best), sens_mix / ltv_percent / bp_* (the bank's reading of the file, and what it costs),
 * pipe_prob and pipe_rank (checks/kinds/pipeline.py).
 */
import Decimal from "decimal.js";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { type BankId, S8_CASE, s8Bank, BANK_IDS, requestOf } from "../../src/data/case-s8.ts";
import { evaluate as bankEvaluate } from "../../src/lib/calc/bankpolicy.ts";
import { POSITIONINGS, RANK_THRESHOLD, gridFor, runBank, searchContextFor, type BankRun, type RankInput } from "../../src/lib/calc/pipeline.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { verdictFacts } from "./_bankpolicy-facts.ts";
import { difference, given as given38 } from "./lesson-3-8.ts";
import { engFact, gridFact } from "./_stage8b-facts.ts";
import { pipeProb, pipeRank } from "./_s8c-facts.ts";

/** Bank ג׳'s offer: the rate it writes for its fixed track, percent. Invented. */
export const OFFER_BANK: BankId = "c";
export const OFFER_RATE = "4.05";

export default function lesson821(): LessonData {
  const facts: Fact[] = [];
  const push = <T extends Fact>(...fs: T[]): T => (facts.push(...fs), fs[fs.length - 1]);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  const v = (id: string) => byId(id).value as string;
  const base = scenarioFrom(SCENARIOS.base);
  const stress = scenarioFrom(SCENARIOS.stress);

  push(given38("threshold", RANK_THRESHOLD));
  push(given38("price", String(S8_CASE.price)));
  const runs: Record<string, BankRun> = {};
  const rowOf = (key: string, run: BankRun): RankInput => {
    if (!run.bestId) return { id: key, decision: "refuse", total: "0.00", p: "0.000000" };
    return { id: key, decision: run.verdict?.decision as "approve" | "refuse", total: v(`${key}.v.total`), p: v(`${key}.p`) };
  };
  const rowsByBank: Record<string, RankInput[]> = {};
  for (const bank of BANK_IDS) {
    for (const pos of POSITIONINGS) {
      const key = `${bank}.${pos.id}`;
      const run = runBank(bank, pos.id);
      runs[key] = run;
      const request = requestOf(run.choice);
      // Same fact as srch_grid, checked by pipe_grid (the same search written in Python, with a clean memo: see checks/kinds/pipeline.py).
      push({ ...gridFact(`${key}.grid`, gridFor(bank, run.choice), { id: "request", request, tracks: [] }, searchContextFor(request), true), kind: "pipe_grid" });
      if (!run.bestId) {
        push(given38(`${key}.p`, "0.000000"));
        push(given38(`${key}.v.total`, "0.00"));
        continue;
      }
      const income = request.incomes.reduce<Decimal>((s, x) => s.plus(x), new Decimal(0));
      const file = { value: S8_CASE.price, income: income.toString(), obligations: request.obligations, tracks: (run.listTracks as TrackSpec[]).map((t) => ({ kind: t.kind, amount: t.amount, months: t.months })) };
      const verdict = verdictFacts(push, `${key}.v`, s8Bank(bank), file, { scenario: SCENARIOS.base });
      if (verdict.decision !== (run.verdict?.decision as string)) throw new Error(`${key}: the bank's verdict is not the pipeline's`);
      push(pipeProb(`${key}.p`, v(`${key}.v.ratio`), v(`${key}.v.ltv`), verdict.decision));
    }
    // The bank's better positioning: the same ranking rule on its two positionings.
    const rows = POSITIONINGS.map((p) => rowOf(`${bank}.${p.id}`, runs[`${bank}.${p.id}`]));
    rowsByBank[bank] = rows;
    push(pipeRank(`${bank}.pick`, rows, RANK_THRESHOLD));
  }

  // The kept positioning of each bank, and the ranking of the banks on it.
  const picked: Record<string, string> = {};
  const finalRows: RankInput[] = [];
  for (const bank of BANK_IDS) {
    const ranked = byId(`${bank}.pick`).value as { id: string; group: number; rank: number | null }[];
    const win = ranked.find((r) => r.rank === 1) ?? ranked[0];
    picked[bank] = win.id.split(".")[1];
    const row = rowsByBank[bank].find((r) => r.id === win.id) as RankInput;
    finalRows.push({ ...row, id: bank });
  }
  push(pipeRank("rank.estimate", finalRows, RANK_THRESHOLD));

  // A real offer from bank ג׳ replaces its estimate: its fixed track at the offered rate, a chance of 1.
  const cKey = `${OFFER_BANK}.${picked[OFFER_BANK]}`;
  const cFinal = (runs[cKey].finalTracks as TrackSpec[]).map((t) => ({ ...t }));
  const offered = cFinal.map((t) => (t.kind === "fixed_unlinked" ? { ...t, rate: OFFER_RATE } : t));
  push(given38("offer.rate", OFFER_RATE));
  push(engFact("offer.first", offered, base, "first"), engFact("offer.total", offered, base, "total"));
  const offerRows = finalRows.map((r) => (r.id === OFFER_BANK ? { id: r.id, decision: "approve" as const, total: v("offer.total"), p: "1.000000" } : r));
  push(pipeRank("rank.offer", offerRows, RANK_THRESHOLD));
  // The estimate against the offer for that bank.
  push(difference("offer.gap_total", byId("offer.total"), byId(`${cKey}.v.total`)), difference("offer.gap_first", byId("offer.first"), byId(`${cKey}.v.first`)));
  // What the ranking would be if every bank were read on the request as asked (no positioning), and with a stricter threshold.
  const askedRows: RankInput[] = BANK_IDS.map((bank) => ({ ...(rowsByBank[bank].find((r) => r.id === `${bank}.asked`) as RankInput), id: bank }));
  push(pipeRank("rank.asked", askedRows, RANK_THRESHOLD));
  push(given38("threshold.strict", "0.60"), pipeRank("rank.strict", finalRows, "0.60"));
  // Gaps between neighbours in the estimate's ranking, for the explanation.
  const est = byId("rank.estimate").value as { id: string; group: number; rank: number | null }[];
  const orderIds = est.filter((r) => r.rank !== null).sort((a, b) => (a.rank as number) - (b.rank as number)).map((r) => r.id);
  for (let k = 1; k < orderIds.length; k++) {
    const hi = byId(`${orderIds[k]}.${picked[orderIds[k]]}.v.total`);
    const lo = byId(`${orderIds[k - 1]}.${picked[orderIds[k - 1]]}.v.total`);
    push(difference(`gap.rank_${k}`, hi, lo));
  }
  push(given38("picked.a", picked.a === "parent" ? "1" : "0"), given38("picked.b", picked.b === "parent" ? "1" : "0"), given38("picked.c", picked.c === "parent" ? "1" : "0"));
  void bankEvaluate;

  return {
    lesson: "8.21",
    title: "הצנרת המלאה",
    note: "Synthetic and fictional: case A's family, four fictional banks with stage 6's invented price lists and lines (list less relief; a refusal above a line). Positionings: as asked, and with a parent joining as a borrower. The mix is the best of lesson 8.14's grid at each bank (kinds fixed, prime, variable; steps of 10%; 25 or 30 years; weights 1, 1, 1; hard constraints of 8.7). The probability of approval is lesson 8.19's synthetic model taken as if calibrated (k = 1); Mogi has no approvals data. The ranking rule (approved with a chance of at least 0.55 first, by total paid; then approved below it; then refused) and the threshold are the course's, for illustration. Bank ג׳'s offer (4.05% on its fixed track) is invented and replaces its estimate with a chance of 1.",
    facts,
  };
}
