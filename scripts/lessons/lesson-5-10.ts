/**
 * Lesson 5.10 — is the mix realistic? The five lines of Directive 329 on a
 * whole mix, the payment ratio, what cannot be computed (a bank's policy), and
 * the rule "do not build an offer from the best rate at each bank": a mix put
 * together from two banks' lowest rates passes every line and is still not an
 * offer. Every number the page, its exercises, its checker and its video show
 * is a fact; the Python checks recompute each (metrics.py, mixcheck.py,
 * regulation.py, ltv.py, common.py).
 *
 * The household and every rate are invented (_mix-judge.ts). The same two
 * offers as lesson 5.9, so the two lessons read as one story.
 */
import { CASE_A, INITIAL_MIX, KIND_NAME_HE, caseADisposable } from "../../src/data/case-a-mix.ts";
import { type MixTrack, withRates } from "../../src/lib/calc/mixcheck.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import {
  AVERAGES,
  MIX_A,
  MIX_B,
  RATES_B,
  TERM,
  RISE,
  argMinFact,
  bestRatesFact,
  changingOf,
  difference,
  effectiveOf,
  given,
  loanOf,
  measureFacts,
  mixCheckFact,
  payOf,
  pointsGap,
} from "./_mix-judge.ts";
import { ltv, maxPayment, maxVar, minFix, ratio, varShare } from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const adds = (fs: Fact[]) => fs.map(add);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;

  // The household: a home worth 1,700,000 ₪, a disposable income of 16,000 ₪.
  add(given("home.value", "1700000"));
  add(given("home.income", "16000"));
  add(given("term.months", String(TERM)));
  add(given("rise", RISE));
  const ctx = { deal: "only_home" as const, value: "1700000", disposableIncome: "16000" };

  // Bank א׳'s offer: the mix, as in lesson 5.9.
  MIX_A.forEach((t, k) => {
    add(given(`a.amount_${k + 1}`, t.amount));
    add(given(`a.r${k + 1}`, t.ratePercent));
  });
  add(loanOf("a.loan", MIX_A));
  add(changingOf("a.changing", MIX_A));
  add(varShare("a.changing_share", "700000", "1200000"));
  add(ltv("a.ltv", "1200000", "1700000"));
  add(payOf("a.pay", MIX_A));
  add(ratio("a.ratio", get("a.pay").value as string, "16000"));
  add(maxPayment("a.max40", "16000", "40"));
  add(difference("a.above40", get("a.pay"), get("a.max40")));
  add(maxVar("a.max_changing", "1200000"));
  add(minFix("a.min_fixed", "1200000"));
  add(mixCheckFact("a.check", MIX_A, ctx));
  adds(measureFacts("a", MIX_A));

  // Bank ב׳'s offer on the same mix; and the rates no bank offered together.
  RATES_B.forEach((r, k) => add(given(`b.r${k + 1}`, r)));
  adds(measureFacts("b", MIX_B));
  add(bestRatesFact("h.rates", [MIX_A.map((t) => t.ratePercent), RATES_B]));
  const best = (get("h.rates").value as string).split(",");
  const MIX_H = withRates(MIX_A, best);
  best.forEach((r, k) => add(given(`h.r${k + 1}`, r)));
  adds(measureFacts("h", MIX_H));
  add(payOf("h.pay", MIX_H));
  add(mixCheckFact("h.check", MIX_H, ctx));
  add(ratio("h.ratio", get("h.pay").value as string, "16000"));

  // On paper, H beats both real offers; by how much against the better one?
  add(difference("hb.first", get("b.first"), get("h.first")));
  add(difference("hb.total", get("b.total"), get("h.total")));
  add(difference("hb.high", get("b.high"), get("h.high")));
  add(difference("ha.first", get("a.first"), get("h.first")));
  add(difference("ha.total", get("a.total"), get("h.total")));
  add(argMinFact("win.total", [get("a.total"), get("b.total"), get("h.total")]));

  // H's rates against the illustrative averages (lesson 5.9's yardstick): effective, same basis.
  best.forEach((r, k) => {
    const n = k + 1;
    add(given(`avg.${n}`, AVERAGES[k]));
    add(effectiveOf(`h.eff.${n}`, r, 4));
    add(pointsGap(`h.gap.${n}`, get(`h.eff.${n}`), get(`avg.${n}`), 3));
  });

  // A bank's rate that depends on the package (exercise 5): an invented example.
  add(given("g.rate", "3.6"));
  add(given("g.prime", "600000"));
  add(given("g.want", "400000"));

  // ── Case A's initial mix (src/data/case-a-mix.ts, written once by author C), against the five lines ──
  const caseTracks: MixTrack[] = INITIAL_MIX.map((t) => ({ label: KIND_NAME_HE[t.kind], type: t.kind, amount: t.amount, ratePercent: t.rate, months: t.months }));
  const caseCtx = { deal: CASE_A.deal, value: CASE_A.price, disposableIncome: moneyString(caseADisposable()) };
  add(given("ca.price", CASE_A.price));
  add(given("ca.income", moneyString(caseADisposable())));
  caseTracks.forEach((t, k) => {
    add(given(`ca.amount_${k + 1}`, t.amount));
    add(given(`ca.r${k + 1}`, t.ratePercent));
  });
  add(given("ca.months", String(caseTracks[0].months)));
  add(loanOf("ca.loan", caseTracks));
  add(ltv("ca.ltv", CASE_A.loan, CASE_A.price));
  add(changingOf("ca.changing", caseTracks));
  add(maxVar("ca.max_changing", CASE_A.loan));
  add(difference("ca.room", get("ca.max_changing"), get("ca.changing")));
  add(payOf("ca.pay", caseTracks));
  add(ratio("ca.ratio", get("ca.pay").value as string, get("ca.income").value as string));
  add(maxPayment("ca.max40", get("ca.income").value as string, "40"));
  add(difference("ca.above40", get("ca.pay"), get("ca.max40")));
  add(mixCheckFact("ca.check", caseTracks, caseCtx));
  // The lesson's text says: no ban crossed, the variable part inside the line by a small margin, the ratio above the capital line.
  const lines = get("ca.check").value as { id: string; status: string }[];
  const status = Object.fromEntries(lines.map((l) => [l.id, l.status]));
  if (status.ltv !== "within" || status.pti !== "within" || status.variable !== "within" || status.term !== "within" || status.capital !== "above") {
    throw new Error(`lesson 5.10 reads case A's initial mix as inside every ban and above the capital line; the data says ${JSON.stringify(status)}`);
  }
  // Moving 100,000 ₪ from the variable track to the fixed one: what happens to the two lines that move.
  const moved = caseTracks.map((t, k) => (k === 1 ? { ...t, amount: String(Number(t.amount) - 100000) } : k === 2 ? { ...t, amount: String(Number(t.amount) + 100000) } : t));
  add(given("ca.moved", "100000"));
  add(changingOf("ca2.changing", moved));
  add(difference("ca2.room", get("ca.max_changing"), get("ca2.changing")));
  add(payOf("ca2.pay", moved));
  add(difference("ca2.pay_more", get("ca2.pay"), get("ca.pay")));
  add(ratio("ca2.ratio", get("ca2.pay").value as string, get("ca.income").value as string));

  return {
    lesson: "5.10",
    title: "האם התמהיל ריאלי?",
    note: "Invented household, invented rates; the same two offers as lesson 5.9. The combined mix H uses the lowest rate each track has in either offer: it is not an offer of any bank.",
    facts,
  };
}
