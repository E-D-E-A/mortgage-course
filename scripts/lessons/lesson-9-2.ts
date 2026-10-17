/**
 * Lesson 9.2 — the whole file of case A, part 2: the positioning plan, the four banks' offers, three alternatives for the three goals,
 * and three scenarios for each. Every number the page, its exercises, its comparison tool and its video show is a fact here.
 *
 * Built from the stages' modules, retyping nothing: the case and the plan are lessons 6.4 and 6.11's (src/data/case-a-levers.ts,
 * case-a-positioning.ts, levers.ts), the four fictional banks' price lists are lessons 6.6–6.8's and their INVENTED rules lesson 6.9's
 * (bankpolicy.ts), the three alternatives are lesson 5.8's on the plan's loan (casefile.ts), the three scenarios are lesson 8.10's
 * (scenarios.ts; the base is the Directive 451 forecast, a prescribed calculation), and the cash flow is the engine's (engine.ts).
 * Nothing here says how a real bank decides or prices a mix (FK-H-050…057, awaiting Eylon). The 40% line and the 75% ceiling are the
 * team's transcriptions of Directive 329 (not verified); the living budget is the file's own assumption.
 *
 * Checked by casefile.py (cf_*), bankpolicy.py, scenarios.py, sensitivity.py, levers.py, ltv.py, regulation.py, underwriting.py,
 * offers.py, metrics.py, common.py.
 */
import { CASE_A_POSITION as POS, EQUITY_STEP, RESERVE } from "../../src/data/case-a-levers.ts";
import { APPRAISALS, FILE, LIVING_BUDGET } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BANK_IDS, type BankId } from "../../src/data/case-a-offers.ts";
import { BANKS, PLAN_RATIO } from "../../src/data/case-a-positioning.ts";
import {
  ALTERNATIVES,
  basisOffer,
  bestBank,
  type CaseOffer,
  fileOf,
  householdIncome,
  offerAt,
  type OfferSource,
  planOf,
  SCENARIOS3,
} from "../../src/lib/calc/casefile.ts";
import type { ScenarioId } from "../../src/lib/calc/scenarios.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, sum } from "./affordability-facts.ts";
import { lowestFact, shapesFact, windowFact } from "./_casefile-facts.ts";
import { scnEvalFact } from "./_stage8b-facts.ts";
import { basis } from "./_offer-facts.ts";
import { stepFact } from "./_lever-facts.ts";
import { totalFact, verdictFacts } from "./_bankpolicy-facts.ts";
import { difference as diffAny, given, givenMoney } from "./_sensitivity-facts.ts";
import { appraisalTable, dividePercent } from "./_underwriting-facts.ts";
import { ltv, maxLoan, maxPayment } from "./regulation-facts.ts";

const SID: Record<ScenarioId, string> = { forecast451: "base", stress: "stress", macro: "macro" };
const SOURCES: OfferSource[] = ["request", ...ALTERNATIVES.map((a) => a.id)];

export default function lesson92(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const diff = (id: string, a: string, b: string) => add(diffAny(id, get(a), get(b)));
  const plan = planOf();

  // ── The file, as lesson 9.1 leaves it (assuming every gap is closed: the declared figures stand) ──
  add(givenMoney("a.price", FILE.price));
  add(givenMoney("a.equity", FILE.equity));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("a.car", FILE.car.monthly));
  add(givenMoney("a.recognised", householdIncome().recognised.toString()));
  add(givenMoney("bud.value", LIVING_BUDGET));
  add(given("in.line40", "40"));
  // The financing ceiling of bank ד׳ is a rule of lesson 6.9 (an input): compared with the plan's financing ratio.
  add(given("in.ceiling_d", BANKS.find((x) => x.id === "d")!.ltvMax));
  add(disposable("a.disposable", get("a.recognised").value as string, [FILE.car]));
  add(maxPayment("a.max40", get("a.disposable").value as string, "40"));
  diff("a.loan", "a.price", "a.equity");
  add(ltv("a.ltv", get("a.loan").value as string, get("a.price").value as string));

  // ── The plan of lesson 6.11 (the smallest whole thousand of the savings that leaves the ratio 0.1 point under the 40% line) ──
  add(stepFact("plan.extra", POS, PLAN_RATIO, EQUITY_STEP));
  if (get("plan.extra").value !== moneyString(plan.extraEquity)) throw new Error("the plan's equity differs from casefile.ts");
  add(sum("plan.equity", [FILE.equity, get("plan.extra").value as string]));
  diff("plan.loan", "a.price", "plan.equity");
  add(ltv("plan.ltv", get("plan.loan").value as string, get("a.price").value as string));
  diff("plan.reserve", "a.reserve", "plan.extra");
  add(shapesFact("plan.shape", get("plan.loan").value as string));

  // ── The appraisal and the plan's loan ──
  add(appraisalTable("apr.table", FILE.price, get("plan.loan").value as string, "75", [...APPRAISALS]));
  add(dividePercent("apr.breakeven", get("plan.loan").value as string, "75"));
  diff("apr.slack", "a.price", "apr.breakeven");
  add(maxLoan("apr.max2150", "2150000", "only_home"));
  diff("apr.short", "plan.loan", "apr.max2150");
  diff("apr.reserve_after", "plan.reserve", "apr.short");

  // ── The offers: the request and the three alternatives, read by the four banks ──
  const sc = SCENARIOS.base;
  const focus: Record<string, BankId> = {};
  for (const src of SOURCES) {
    const best = bestBank(src);
    if (best) focus[src] = best;
  }
  const readOffer = (src: OfferSource, bank: BankId, o: CaseOffer, full: boolean) => {
    const p = `o.${src}.${bank}`;
    const policy = BANKS.find((b) => b.id === bank)!;
    verdictFacts(add, p, policy, fileOf(o.asked), { scenario: sc, priced: false });
    if (!o.approved || !o.tracks) return;
    add(totalFact(`${p}.qual`, o.tracks, sc, "qualifying"));
    const scenarios = full ? SCENARIOS3 : SCENARIOS3.filter((s) => s.id === "forecast451");
    for (const s of scenarios) {
      const q = `${p}.${SID[s.id]}`;
      add(scnEvalFact(`${q}.first`, s.id, o.tracks, "first"));
      add(scnEvalFact(`${q}.max`, s.id, o.tracks, "max"));
      add(scnEvalFact(`${q}.total`, s.id, o.tracks, "total"));
      if (full) {
        add(windowFact(`${q}.max60`, o.tracks, s.id, "max"));
        add(windowFact(`${q}.m1`, o.tracks, s.id, "margin_first"));
        add(windowFact(`${q}.m60`, o.tracks, s.id, "margin_max"));
      }
    }
    if (full) diff(`${p}.rise`, `${p}.stress.max`, `${p}.base.first`);
  };
  // The family's own request before the plan, at bank א׳ only (what the plan is measured against).
  readOffer("original", "a", offerAt("original", "a"), false);
  for (const src of SOURCES) {
    for (const bank of BANK_IDS) {
      const o = offerAt(src, bank);
      readOffer(src, bank, o, focus[src] === bank);
    }
  }
  diff("o.request.d.short", "o.request.d.ltv", "in.ceiling_d");

  // The cheapest bank for each, among the banks that approve (on the base scenario's total).
  for (const src of SOURCES) {
    const ok = BANK_IDS.filter((b) => offerAt(src, b).approved);
    add(lowestFact(`best.${src}`, ok.map((b) => get(`o.${src}.${b}.base.total`)), ok));
    if (focus[src] !== get(`best.${src}`).value) throw new Error(`best bank for ${src} differs from casefile.ts`);
  }

  diff("req.b_over_a", "o.request.b.base.total", "o.request.a.base.total");
  diff("req.c_over_a", "o.request.c.base.total", "o.request.a.base.total");
  // Like for like: the fixed track over 25 years, as the "total" alternative's term, at bank ב׳.
  {
    const o = offerAt("fixed25", "b");
    readOffer("fixed25", "b", o, false);
    add(windowFact("o.fixed25.b.base.m1", o.tracks!, "forecast451", "margin_first"));
    diff("fx.vs_total", "o.fixed25.b.base.total", "o.total.b.base.total");
    diff("fx.term_effect", "o.exposure.b.base.total", "o.fixed25.b.base.total");
    diff("fx.term_gap", "o.total.b.base.total", "o.fixed25.b.base.total");
  }
  // What the plan buys at bank א׳, on the stage-9 base scenario.
  diff("gain.total", "o.original.a.base.total", "o.request.a.base.total");
  diff("gain.first", "o.original.a.base.first", "o.request.a.base.first");

  // The three goals: each alternative at its cheapest bank, and the winner of each goal.
  const alts = ALTERNATIVES.map((a) => a.id);
  const of = (what: string) => alts.map((a) => get(`o.${a}.${focus[a]}.${what}`));
  add(lowestFact("goal.payment", of("base.first"), alts));
  add(lowestFact("goal.total", of("base.total"), alts));
  add(lowestFact("goal.exposure", of("rise"), alts));
  // What each goal costs, measured against the alternative that wins the total.
  const bt = (a: string) => `o.${a}.${focus[a]}.base.total`;
  const bf = (a: string) => `o.${a}.${focus[a]}.base.first`;
  diff("cost.payment", bt("payment"), bt("total"));
  diff("cost.exposure", bt("exposure"), bt("total"));
  diff("price.first_total", bf("total"), bf("payment"));
  diff("price.first_exposure", bf("exposure"), bf("payment"));
  // The distance of each alternative from the 40% line, in shekels a month and in points (the sign: above the line is positive).
  for (const a of alts) {
    const p = `o.${a}.${focus[a]}`;
    diff(`${p}.over40`, `${p}.qual`, "a.max40");
    diff(`${p}.pts40`, `${p}.ratio`, "in.line40");
  }
  // Bank-by-bank prices of one alternative: the spread between the cheapest and the dearest approving bank.
  for (const a of alts) {
    const ok = BANK_IDS.filter((b) => offerAt(a, b).approved);
    const worst = ok.reduce((w, b) => (offerAt(a, b).readings!.forecast451.total.gt(offerAt(a, w).readings!.forecast451.total) ? b : w), ok[0]);
    add(lowestFact(`spread.${a}.cheapest`, ok.map((b) => get(`o.${a}.${b}.base.total`)), ok));
    diff(`spread.${a}`, `o.${a}.${worst}.base.total`, `o.${a}.${focus[a]}.base.total`);
    add(given(`spread.${a}.worst`, worst));
  }

  // ── When a price comparison is allowed (offers.ts, Directive 451's rule as the team transcribed it) ──
  add(basis("basis.request", [offerAt("request", "a"), offerAt("request", "b"), offerAt("request", "c")].map(basisOffer)));
  add(basis("basis.alts", [offerAt("payment", "b"), offerAt("total", "b")].map(basisOffer)));
  add(basis("basis.plan", [offerAt("original", "a"), offerAt("request", "a")].map(basisOffer)));

  return {
    lesson: "9.2",
    title: "התיק המסכם, ב׳: תוכנית מיצוב, הצעות, שלוש חלופות ותרחישים",
    note: "Case A with lesson 6.11's plan (21,000 more equity from the savings), the four fictional banks of lessons 6.6–6.9 with the exercise's INVENTED rules, three alternatives for the three goals of lesson 5.8 on the plan's loan, and the three scenarios of lesson 8.10 (the base is the Directive 451 forecast; the stress and macro paths are the course's, the macro table invented). Totals differ from lesson 6.11's because the base scenario differs. The living budget of 11,500 a month is a calculation assumption. Nothing here says what a real bank would do or price.",
    facts,
  };
}
