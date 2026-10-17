/**
 * The stage-8 completion check (src/pages/checks/8.mdx): every number its questions, answers and common wrong answers
 * show, including the four questions it repeats from stages 3, 4, 6 and 7 (lessons 3.9, 4.2, 6.5, 7.4). Each fact reuses
 * a kind a lesson already defined, through the stage's own fact builders (_stats-facts for 8.2-8.5, _constraints-facts
 * for 8.7, _stage8b-facts for 8.8-8.13, _s8c-facts for 8.15-8.21, _drift-facts for 8.22-8.24) and the older ones
 * (lesson-3-8, affordability-facts), so checks/independent_check.py rechecks every computed one with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise (new mixes, new weight sets, new points,
 * new thresholds, new seeds). The one thing that is shared with a lesson on purpose is the machinery: the seeded
 * generators, the synthetic series of drift.ts and case A's candidates and scenarios.
 *
 * What is maths and what is a label. Questions on maths (the weighted mean, the percentile, the expectation, the line,
 * the count of a space, the front, the calibration table) are general knowledge and say so. Questions on what the
 * course says about Mogi test the LABEL, never the claim: "Mogi היום" (no mix calculation exists in code; the engine
 * call is frozen), "הוחלט" (only the 15 calculation rules of Eylon, as the team recorded them, and the four layer-mode
 * names; the rule that a language model explains and classifies, never computes and never writes state; the rule that
 * an offer's own terms beat the simulation's defaults; the rule that the pre-approval figures use the forecast inputs of
 * Directive 451 and a stress scenario is shown apart), "עתיד" (everything else). Every weight, threshold, margin, step
 * size and model number is "להדגמה": not a Mogi decision and not a bank's policy. Every bank is the course's fictional
 * "בנק א׳ … ד׳". The Directive 329 lines used in q6 are the team's transcription (unverified), stated as a premise.
 * Doubts and questions for Eylon: research/stage-8-raw/eylon-8-E.md.
 */
import { CANDIDATES, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BASE_CHOICE, candidateOf } from "../../src/data/case-s8.ts";
import { evaluate } from "../../src/lib/calc/constraints.ts";
import { DEFAULT_MONITOR } from "../../src/lib/calc/drift.ts";
import type { Row } from "../../src/lib/calc/objectives.ts";
import { DEFAULT_MODEL, type FutureModel } from "../../src/lib/calc/montecarlo.ts";
import type { PricingModel } from "../../src/lib/calc/pricingmodel.ts";
import { scenarioFrom } from "../../src/lib/calc/sensitivity.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Obligation } from "../../src/lib/calc/affordability.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as AF from "./affordability-facts.ts";
import { measureFact, reasonsFact } from "./_constraints-facts.ts";
import { monitorFact, splitFact } from "./_drift-facts.ts";
import * as M from "./lesson-3-8.ts";
import { calGapData, calTableData, frCount, frFront, lpSolve, lpValue, pipeRank, pmMargin, pmRate, pmStepSize, pmWhatIf } from "./_s8c-facts.ts";
import { tableFact } from "./_sensitivity-facts.ts";
import { countFact, engFact, mcFact, minutesFact, objTableFact, scnEvalFact } from "./_stage8b-facts.ts";
import * as S from "./_stats-facts.ts";

/** A claim the questions make about computed numbers: the build fails if the data say otherwise. */
const claim = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`check-8: ${what}`);
};

export default function check8(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const v = (id: string) => get(id).value as string;
  const num = (id: string) => Number(v(id));
  const given = (id: string, value: string | number) => add(M.given(id, String(value)));

  // ═══ Review r1 (3.9): the interest in shekels is the total paid minus the loan ═══
  const loan1: Track = { principal: "520000", rates: ["4.1"], months: 240 };
  add(M.given("r1.principal", "520000.00"));
  given("r1.rate", "4.1");
  add(M.total("r1.total", [loan1]));
  add(M.difference("r1.answer", get("r1.total"), get("r1.principal")));
  add(M.first("r1.first", [loan1]));
  claim(num("r1.answer") > 0 && num("r1.total") > num("r1.principal") && num("r1.answer") < num("r1.principal"), "r1: interest is positive and below the loan");

  // ═══ Review r2 (4.2): the 18-month rule: only obligations with more than 18 months left come off the income ═══
  const car: Obligation = { kind: "loan", monthly: "1400", monthsLeft: 30 };
  const lease: Obligation = { kind: "leasing", monthly: "1100", monthsLeft: 20 };
  const study: Obligation = { kind: "loan", monthly: "900", monthsLeft: 10 };
  given("r2.income", "17800");
  given("r2.car", "1400");
  given("r2.car_months", "30");
  given("r2.lease", "1100");
  given("r2.lease_months", "20");
  given("r2.study", "900");
  given("r2.study_months", "10");
  add(AF.disposable("r2.answer", "17800", [car, lease, study]));
  add(AF.disposable("r2.err_all", "17800", [car, lease, { ...study, monthsLeft: 24 }]));
  add(AF.disposable("r2.err_none", "17800", []));
  add(AF.disposable("r2.err_long_only", "17800", [car]));
  claim(num("r2.answer") === 17800 - 1400 - 1100 && num("r2.err_all") < num("r2.answer") && num("r2.err_none") > num("r2.answer"), "r2: the short obligation does not count");

  // ═══ Review r3 (6.5): positioning changes the deal; wrong information changes the paper ═══
  const carLoan: Obligation = { kind: "loan", monthly: "1300", monthsLeft: 40 };
  given("r3.net", "21000");
  given("r3.payment", "7800");
  given("r3.loan", "1300");
  given("r3.loan_months", "40");
  add(AF.ratioFromParts("r3.real", "21000", [carLoan], "7800"));
  add(AF.ratioFromParts("r3.on_paper", "21000", [], "7800"));
  add(AF.ratioFromParts("r3.after_closing", "21000", [], "7800"));
  claim(num("r3.on_paper") < num("r3.real") && v("r3.after_closing") === v("r3.on_paper"), "r3: the paper ratio without the loan equals the real ratio after really closing it");

  // ═══ Review r4 (7.4): a lower payment is not a lower total ═══
  const t20: Track = { principal: "400000", rates: ["4.5"], months: 240 };
  const t30: Track = { principal: "400000", rates: ["4.5"], months: 360 };
  add(M.given("r4.principal", "400000.00"));
  given("r4.rate", "4.5");
  add(M.first("r4.first20", [t20]));
  add(M.first("r4.first30", [t30]));
  add(M.total("r4.total20", [t20]));
  add(M.total("r4.total30", [t30]));
  add(M.difference("r4.first_gap", get("r4.first20"), get("r4.first30")));
  add(M.difference("r4.total_gap", get("r4.total30"), get("r4.total20")));
  claim(num("r4.first_gap") > 0 && num("r4.total_gap") > 0, "r4: the longer loan has the lower payment and the higher total");

  // ═══ 8.2: the weighted mean (8א) ═══
  const amounts = ["450000", "300000", "250000"];
  const rates = ["3.9", "4.7", "4.2"];
  amounts.forEach((a, k) => add(M.given(`q1.a${k}`, `${a}.00`)));
  rates.forEach((r, k) => given(`q1.r${k}`, r));
  add(S.total("q1.loan", amounts, 0));
  const prods = amounts.map((a, k) => add(S.prod(`q1.prod${k}`, a, rates[k], 0)));
  add(S.total("q1.prod_sum", prods.map((f) => f.value as string), 0));
  add(S.wmean("q1.answer", rates, amounts, 3));
  add(S.mean("q1.err_simple", rates, 3));
  claim(num("q1.answer") !== num("q1.err_simple") && Math.abs(num("q1.answer") - num("q1.err_simple")) > 0.01, "q1: the weighted mean differs from the simple one");

  // ═══ 8.3: a percentile by the course's method ═══
  const ratios = [31, 38, 29, 44, 36, 41, 33, 47, 39, 34, 42];
  given("q2.values", ratios.join(", "));
  given("q2.n", ratios.length);
  add(S.position("q2.pos", ratios.length, 75));
  add(S.percentile("q2.x8", ratios, 70, 0));
  add(S.percentile("q2.x9", ratios, 80, 0));
  add(S.percentile("q2.min", ratios, 0, 0));
  add(S.percentile("q2.max", ratios, 100, 0));
  add(S.percentile("q2.answer", ratios, 75, 2));
  add(S.percentile("q2.err_nearest", ratios, 75, 2, "nearest"));
  add(S.percentile("q2.median", ratios, 50, 2));
  add(S.mean("q2.mean", ratios, 2));
  claim(num("q2.answer") !== num("q2.err_nearest") && num("q2.answer") !== num("q2.median"), "q2: the interpolated 75th percentile is neither the nearest rank nor the median");

  // ═══ 8.4: expectation: a toy on a variable track's reset (not a forecast) ═══
  const qRates = ["3.0", "4.0", "5.0", "6.0"];
  const qCounts = [1, 3, 3, 1];
  given("q3.balance", "600000");
  given("q3.months", "240");
  const qPays = qRates.map((r, k) => {
    given(`q3.rate${k + 1}`, r);
    return add(S.spitzer(`q3.pay${k + 1}`, "600000", r, 240));
  });
  add(S.total("q3.cases", qCounts, 0));
  add(S.factExpect("q3.answer", qPays, qCounts));
  add(S.mean("q3.err_mean", qPays.map((p) => p.value as string), 2));
  add(S.expect("q3.rate_exp", qRates.map((value, k) => ({ value, count: qCounts[k] })), 2));
  add(S.spitzer("q3.err_at_mean_rate", "600000", v("q3.rate_exp"), 240));
  add(S.prob("q3.p_above", qRates.map((value, k) => ({ value, count: qCounts[k] })), 5, 6, 1));
  claim(Math.abs(num("q3.answer") - num("q3.err_mean")) > 1 && Math.abs(num("q3.answer") - num("q3.err_at_mean_rate")) >= 0.5, "q3: the expectation is not the plain mean of the payments, and not the payment at the expected rate (to the shekel)");

  // ═══ 8.5: the least-squares line through five points; a prediction ═══
  const P5 = [[40, "0.90"], [50, "1.00"], [60, "1.15"], [70, "1.20"], [80, "1.35"]].map(([x, y]) => ({ x: x as number, y: y as string }));
  add(S.mean("q4.xbar", P5.map((p) => p.x), 0));
  add(S.mean("q4.ybar", P5.map((p) => p.y), 3));
  add(S.fit("q4.a", P5, "a", 4));
  add(S.fit("q4.b", P5, "b", 3));
  add(S.lin("q4.answer", v("q4.a"), v("q4.b"), 65, 3));
  add(S.lin("q4.far", v("q4.a"), v("q4.b"), 100, 3));
  add(S.prod("q4.err_no_intercept", v("q4.a"), 65, 3));
  add(S.prod("q4.a_xbar", v("q4.a"), v("q4.xbar"), 3));
  add(S.fitErr("q4.mae", P5, "mae", 3));
  given("q4.x", 65);
  given("q4.x_far", 100);
  claim(Math.abs(num("q4.answer") - num("q4.ybar")) > 0.02 && num("q4.err_no_intercept") !== num("q4.answer"), "q4: the prediction differs from the mean and from the slope alone");

  // ═══ 8.6: decision variables: no numbers (the question tests which of four things the algorithm may change) ═══

  // ═══ 8.7: feasible versus optimal: a cheaper mix that a hard constraint of the client rejects ═══
  const P = (kind: TrackSpec["kind"], share: number, years: number) => ({ kind, share, years });
  const cheap = candidateOf("q6x", BASE_CHOICE, [P("fixed_unlinked", 40, 25), P("variable_unlinked", 60, 25)]);
  const kept = candidateOf("q6y", BASE_CHOICE, [P("fixed_unlinked", 40, 30), P("variable_unlinked", 60, 30)]);
  const flatBase = scenarioFrom(SCENARIOS.base);
  given("q6.max_payment", "8300");
  given("q6.target", "40");
  given("q6.law_ratio", "50");
  given("q6.law_ltv", "75");
  add(reasonsFact("q6.cheap.reasons", cheap));
  add(reasonsFact("q6.kept.reasons", kept));
  for (const [tag, c] of [["cheap", cheap], ["kept", kept]] as const) {
    add(measureFact(`q6.${tag}.payment`, c, "payment", 2));
    add(measureFact(`q6.${tag}.ratio`, c, "ratio", 2));
    add(measureFact(`q6.${tag}.ltv`, c, "ltv", 2));
    add(measureFact(`q6.${tag}.variable`, c, "variable_percent", 0));
    add(engFact(`q6.${tag}.total`, c.tracks, flatBase, "total"));
  }
  add(M.difference("q6.saving", get("q6.kept.total"), get("q6.cheap.total")));
  claim(
    v("q6.cheap.reasons") === "client_max_payment,client_target_ratio" && v("q6.kept.reasons") === "" && evaluate(kept).feasible && num("q6.cheap.total") < num("q6.kept.total") && num("q6.cheap.ratio") < 50 && num("q6.cheap.ltv") <= 75,
    "q6: the cheaper mix fails exactly the client's two limits and passes the law; the kept one is feasible",
  );

  // ═══ 8.8: the weights change the winner ═══
  const table = add(tableFact("q7.table", CANDIDATES, SCENARIOS.base, SCENARIOS.stress));
  const rows = table.value as { id: string; first: string; passes: string }[];
  const allowed = rows.filter((r) => r.passes === "yes").map((r) => r.id);
  const W1 = [50, 25, 25];
  const W2 = [25, 25, 50];
  add(objTableFact("q7.w1", "q7.table", rows as never, allowed, W1));
  add(objTableFact("q7.w2", "q7.table", rows as never, allowed, W2));
  const winner = (id: string) => (get(id).value as { id: string; rank: number | null }[]).find((r) => r.rank === 1)?.id;
  const lowestFirst = [...rows].filter((r) => allowed.includes(r.id)).sort((a, b) => Number(a.first) - Number(b.first))[0].id;
  claim(winner("q7.w1") === "half" && winner("q7.w2") === "short" && lowestFirst === "linked" && CANDIDATES.find((c) => c.id === "half")?.name === "חצי־חצי" && CANDIDATES.find((c) => c.id === "short")?.name === "25 שנה" && CANDIDATES.find((c) => c.id === "linked")?.name === "צמוד", "q7: different weights, different winners; the lowest first payment wins neither");
  claim(allowed.length === 5, "q7: five candidates pass");
  given("q7.n", allowed.length);

  // ═══ 8.9: the engine: a mix is the sum of its tracks, each with its own term ═══
  const flat = scenarioFrom({ inflation: "0", primeShift: "0", anchorShift: "0" });
  const longTrack: TrackSpec = { kind: "fixed_unlinked", amount: "700000", rate: "4.40", months: 300 };
  const shortTrack: TrackSpec = { kind: "prime", amount: "300000", rate: "4.60", months: 180 };
  const mixTracks = [longTrack, shortTrack];
  given("q8.amount_long", "700000");
  given("q8.rate_long", "4.40");
  given("q8.years_long", "25");
  given("q8.amount_short", "300000");
  given("q8.rate_short", "4.60");
  given("q8.years_short", "15");
  given("q8.month", "200");
  add(engFact("q8.long.1", [longTrack], flat, "payment", 1));
  add(engFact("q8.short.1", [shortTrack], flat, "payment", 1));
  add(engFact("q8.mix.1", mixTracks, flat, "payment", 1));
  add(engFact("q8.answer", mixTracks, flat, "payment", 200));
  add(engFact("q8.short.200", [shortTrack], flat, "payment", 200));
  add(engFact("q8.fp1", mixTracks, flat, "fingerprint"));
  add(engFact("q8.fp2", mixTracks, flat, "fingerprint"));
  claim(v("q8.fp1") === v("q8.fp2"), "q8: the same input gives the same output");
  claim(num("q8.answer") === num("q8.long.1") && num("q8.short.200") === 0 && num("q8.mix.1") > num("q8.answer"), "q8: after month 180 the mix pays like the long track alone");

  // ═══ 8.10: three forecasts are three different things ═══
  const varTrack: TrackSpec[] = [{ kind: "variable_unlinked", amount: "600000", rate: "4.00", months: 300 }];
  given("q9.amount", "600000");
  given("q9.years", "25");
  for (const sid of ["forecast451", "stress", "macro"] as const) {
    add(scnEvalFact(`q9.${sid}.max`, sid, varTrack, "max"));
    add(scnEvalFact(`q9.${sid}.first`, sid, varTrack, "first"));
  }
  add(M.difference("q9.stress_gap", get("q9.stress.max"), get("q9.forecast451.max")));
  claim(num("q9.stress.max") > num("q9.forecast451.max") && num("q9.forecast451.max") !== num("q9.macro.max") && num("q9.stress.max") !== num("q9.macro.max"), "q9: three different highest payments, the stress one the largest");

  // ═══ 8.11-8.12: a simulation of futures; when a probability may be attached ═══
  const mcTrack: TrackSpec = { kind: "prime", amount: "250000", rate: "4.60", months: 120 };
  const mcModel: FutureModel = { ...DEFAULT_MODEL, years: 10 };
  const TH = "2650";
  const wild: FutureModel = { ...mcModel, scale: 2 };
  const calm: FutureModel = { ...mcModel, scale: 0.5 };
  given("q10.amount", "250000");
  given("q10.years", "10");
  add(M.given("q10.threshold", `${TH}.00`));
  add(mcFact("q10.first", [mcTrack], 5, 1000, mcModel, "first"));
  for (const [tag, model] of [["normal", mcModel], ["wild", wild], ["calm", calm]] as const) {
    add(mcFact(`q10.${tag}.p_pct`, [mcTrack], 5, 1000, model, "p_pct", TH));
    add(mcFact(`q10.${tag}.se_pct`, [mcTrack], 5, 1000, model, "se_pct", TH));
  }
  add(mcFact("q10.other_seed.p_pct", [mcTrack], 6, 1000, mcModel, "p_pct", TH));
  claim(num("q10.wild.p_pct") - num("q10.calm.p_pct") > 5 && Number(v("q10.normal.se_pct")) < 3, "q10: the assumptions move the share by more than the simulation's own error");

  // ═══ 8.13: the space of mixes ═══
  const space = { kinds: 5, stepPercent: 10, terms: 12, termMode: "per_track" as const };
  given("q11.kinds", 5);
  given("q11.step", 10);
  given("q11.terms", 12);
  add(countFact("q11.answer", space));
  add(countFact("q11.splits", { ...space, terms: 1, termMode: "one" }));
  add(countFact("q11.one_term", { ...space, termMode: "one" }));
  add(countFact("q11.coarse", { ...space, stepPercent: 20 }));
  given("q11.ms", 1);
  add(minutesFact("q11.minutes", "q11.answer", 1, BigInt(v("q11.answer"))));
  claim(num("q11.answer") === num("q11.splits") * 12 ** 5 && num("q11.answer") > num("q11.one_term"), "q11: splits times terms to the power of the kinds");

  // ═══ 8.15: the efficient front ═══
  // first payment, total paid, rise under stress: smaller is better in all three. Fictional numbers.
  const CANDS: { id: string; first: string; total: string; rise: string; ok: boolean }[] = [
    { id: "א", first: "8100", total: "2950000", rise: "900", ok: true },
    { id: "ב", first: "7900", total: "3050000", rise: "1500", ok: true },
    { id: "ג", first: "8300", total: "2900000", rise: "400", ok: true },
    { id: "ד", first: "8200", total: "3000000", rise: "1000", ok: true },
    { id: "ה", first: "7900", total: "3100000", rise: "1600", ok: true },
    { id: "ו", first: "8500", total: "2950000", rise: "1200", ok: true },
    { id: "ז", first: "7000", total: "2800000", rise: "100", ok: false },
  ];
  const frRows: Row[] = CANDS.map((c) => ({ id: c.id, values: [c.first, c.total, c.rise], feasible: c.ok }));
  for (const c of CANDS) {
    add(M.given(`q12.${c.id}.first`, `${c.first}.00`));
    add(M.given(`q12.${c.id}.total`, `${c.total}.00`));
    add(M.given(`q12.${c.id}.rise`, `${c.rise}.00`));
  }
  add(frCount("q12.answer", frRows, "efficient"));
  add(frCount("q12.dominated", frRows, "dominated"));
  add(frCount("q12.err_all_feasible", frRows, "feasible"));
  add(frCount("q12.err_with_g", frRows.map((r) => ({ ...r, feasible: true })), "efficient"));
  add(frFront("q12.front", frRows));
  const dom = (id: string) => ((get("q12.front").value as { id: string; dominatedBy: string[] }[]).find((r) => r.id === id) as { dominatedBy: string[] }).dominatedBy.join("+");
  claim(dom("ד") === "א" && dom("ה") === "ב" && dom("ו") === "א+ג", "q12: ד is dominated by א, ה by ב, ו by א and ג");
  claim(num("q12.answer") === 3 && num("q12.dominated") === 3 && num("q12.err_with_g") === 1 && num("q12.err_all_feasible") === 6, "q12: three efficient, three dominated, one rejected that would have dominated everyone");

  // ═══ 8.16: "optimal" is relative to the data and the conditions ═══
  const UNIT = "100000";
  const LONG: Track = { principal: UNIT, rates: ["4.00"], months: 360 };
  const SHORT: Track = { principal: UNIT, rates: ["4.00"], months: 180 };
  given("q13.unit", UNIT);
  given("q13.need", "10");
  given("q13.cap1", "6200");
  given("q13.cap2", "6800");
  add(M.first("q13.lg.pay", [LONG]));
  add(M.total("q13.lg.cost", [LONG]));
  add(M.first("q13.sh.pay", [SHORT]));
  add(M.total("q13.sh.cost", [SHORT]));
  const conds = (cap: string) => [
    { label: "כיסוי ההלוואה", a: ["-1", "-1"] as [string, string], b: "-10" },
    { label: "לפחות 40% בארוכה", a: ["-3", "2"] as [string, string], b: "0" },
    { label: "ההחזר החודשי", a: [v("q13.lg.pay"), v("q13.sh.pay")] as [string, string], b: cap },
  ];
  const cost: [string, string] = [v("q13.lg.cost"), v("q13.sh.cost")];
  const pay: [string, string] = [v("q13.lg.pay"), v("q13.sh.pay")];
  add(lpSolve("q13.a", cost, "min", conds("6200"), 10));
  add(lpSolve("q13.b", cost, "min", conds("6800"), 10));
  const bestOf = (id: string) => (get(id).value as { best: { x: string; y: string }[] }).best[0];
  const a = bestOf("q13.a");
  const b = bestOf("q13.b");
  add(lpValue("q13.a.pay", pay, a.x, a.y, 2));
  add(lpValue("q13.a.cost", cost, a.x, a.y, 2));
  add(lpValue("q13.b.pay", pay, b.x, b.y, 2));
  add(lpValue("q13.b.cost", cost, b.x, b.y, 2));
  add(M.difference("q13.saving", get("q13.a.cost"), get("q13.b.cost")));
  claim(a.x !== b.x && num("q13.b.cost") < num("q13.a.cost") && num("q13.a.pay") <= 6200 && num("q13.b.pay") <= 6800, "q13: another cap, another corner, a lower cost");

  // ═══ 8.17: a pricing model with steps around thresholds (a shape; every number is invented) ═══
  const PM: PricingModel = { base: "0.90", ltv: [{ above: "50", add: "0.15" }, { above: "70", add: "0.45" }], pti: [{ above: "35", add: "0.20" }] };
  given("q14.base", PM.base);
  given("q14.th1", "50");
  given("q14.add1", "0.15");
  given("q14.th2", "70");
  given("q14.add2", "0.45");
  given("q14.pti_th", "35");
  given("q14.pti_add", "0.20");
  given("q14.ltv_before", "72");
  given("q14.ltv_after", "70");
  given("q14.pti", "36");
  given("q14.anchor", "4.20");
  add(pmMargin("q14.margin_before", PM, 72, 36));
  add(pmMargin("q14.margin_after", PM, 70, 36));
  add(pmRate("q14.rate_before", "4.20", PM, 72, 36));
  add(pmRate("q14.rate_after", "4.20", PM, 70, 36));
  add(pmStepSize("q14.step_back", PM.ltv, 70, 72));
  add(pmStepSize("q14.step_one_point", PM.ltv, 71, 72));
  add(pmStepSize("q14.err_cumulative", [{ above: "50", add: "0.15" }, { above: "70", add: "0.60" }], 70, 72));
  add(pmWhatIf("q14.whatif", "4.20", PM, { ltv: 72, pti: 36 }, { ltv: 70 }));
  claim(v("q14.step_back") === "0.30" && v("q14.step_one_point") === "0.00" && v("q14.margin_before") === "1.55" && v("q14.margin_after") === "1.25", "q14: 70% is not above 70%; the band 70+ adds 0.45 from zero, the band 50-70 adds 0.15");

  // ═══ 8.19 (q15): calibration: a reliability table from hand-sized synthetic data ═══
  const HAND: [string, 0 | 1][] = [
    ...[1, 1, 1, 1, 0, 0].map((o) => ["0.9", o] as [string, 0 | 1]),
    ...[1, 1, 1, 0, 0, 0].map((o) => ["0.3", o] as [string, 0 | 1]),
  ];
  given("q15.n", HAND.length);
  given("q15.pred_high", "0.9");
  given("q15.happened_high", "4");
  given("q15.n_high", "6");
  given("q15.pred_low", "0.3");
  given("q15.happened_low", "3");
  add(calTableData("q15.table", HAND, 5));
  add(calGapData("q15.gap", HAND, 5));
  add(S.percentOf("q15.answer", "4", "6", 1));
  add(S.percentOf("q15.low_pct", "3", "6", 1));
  add(S.prod("q15.err_promised", "0.9", "100", 0));
  given("q15.min_per_bin", "30");
  claim(v("q15.answer") === "66.7" && Number(v("q15.gap")) > 0.2, "q15: 4 of 6 is 66.7% against a promise of 90%");

  // ═══ 8.20 (q16): an estimate against a bank offer ═══
  const estimate: Track = { principal: "700000", rates: ["4.30"], months: 300 };
  const offer: Track = { principal: "700000", rates: ["4.38"], months: 300 };
  add(M.given("q16.amount", "700000.00"));
  given("q16.est_rate", "4.30");
  given("q16.off_rate", "4.38");
  given("q16.years", "25");
  add(M.first("q16.est_first", [estimate]));
  add(M.first("q16.off_first", [offer]));
  add(M.total("q16.est_total", [estimate]));
  add(M.total("q16.off_total", [offer]));
  add(M.difference("q16.gap_first", get("q16.off_first"), get("q16.est_first")));
  add(M.difference("q16.gap_total", get("q16.off_total"), get("q16.est_total")));
  claim(num("q16.gap_first") > 0 && num("q16.gap_total") > 0, "q16: the offer costs more than the estimate");

  // ═══ 8.21: the pipeline: a real offer replaces the estimate ═══
  const rank = (id: string, rowsIn: { id: string; decision: "approve" | "refuse"; total: string; p: string }[]) => add(pipeRank(id, rowsIn, "0.55"));
  const est = [
    { id: "א", decision: "approve" as const, total: "3010000.00", p: "0.820000" },
    { id: "ב", decision: "approve" as const, total: "2940000.00", p: "0.410000" },
    { id: "ג", decision: "approve" as const, total: "3090000.00", p: "0.740000" },
    { id: "ד", decision: "refuse" as const, total: "0.00", p: "0.000000" },
  ];
  for (const r of est) {
    if (r.decision === "approve") {
      add(M.given(`q17.${r.id}.total`, r.total));
      given(`q17.${r.id}.p`, r.p);
    }
  }
  given("q17.threshold", "0.55");
  add(M.given("q17.ב.offer_total", "2980000.00"));
  given("q17.ב.offer_p", "1.000000");
  rank("q17.rank_estimate", est);
  rank("q17.rank_offer", est.map((r) => (r.id === "ב" ? { ...r, total: "2980000.00", p: "1.000000" } : r)));
  add(M.difference("q17.offer_over_estimate", get("q17.ב.offer_total"), get("q17.ב.total")));
  add(M.difference("q17.offer_under_first", get("q17.א.total"), get("q17.ב.offer_total")));
  const ranks = (id: string) => Object.fromEntries((get(id).value as { id: string; rank: number | null }[]).map((r) => [r.id, r.rank]));
  const r0 = ranks("q17.rank_estimate");
  const r1 = ranks("q17.rank_offer");
  claim(r0["א"] === 1 && r0["ג"] === 2 && r0["ב"] === 3 && r0["ד"] === null && r1["ב"] === 1 && r1["א"] === 2 && r1["ג"] === 3 && num("q17.offer_over_estimate") > 0, "q17: bank ב׳ is third on its estimate and first on its offer, which is above the estimate");

  // ═══ 8.22: labels: no numbers ═══

  // ═══ 8.23: out-of-sample error: a random split flatters a model that remembers; a time split does not ═══
  const rs = { split: "random" as const, seed: 8 };
  const ts = { split: "time" as const };
  given("q19.months", "60");
  given("q19.train", "36");
  given("q19.test", "24");
  for (const model of ["spread", "memory"] as const) {
    add(splitFact(`q19.rand.${model}`, rs, model, "test", "mae", 36, 24));
    add(splitFact(`q19.time.${model}`, ts, model, "test", "mae", 36, 24));
  }
  add(splitFact("q19.rand.memory.train", rs, "memory", "train", "mae", 36, 24));
  add(splitFact("q19.time.memory.train", ts, "memory", "train", "mae", 36, 24));
  claim(
    num("q19.rand.memory") < num("q19.rand.spread") && num("q19.time.memory") > num("q19.time.spread") && num("q19.rand.memory.train") === 0 && num("q19.time.memory") > num("q19.rand.memory"),
    "q19: the random split makes the model that remembers look better, the time split reverses it",
  );

  // ═══ 8.24: drift: a model fitted before the jump, an alarm that comes late, a refit ═══
  const mon = { ...DEFAULT_MONITOR, factor: 4, window: 6, retrainWindow: 6 };
  given("q20.train_to", "24");
  given("q20.change", "37");
  given("q20.factor", "4");
  given("q20.window", "6");
  for (const m of ["baseline", "threshold", "alarm_month", "delay", "v1_after", "v2_after"] as const) add(monitorFact(`q20.${m}`, m, mon));
  claim(num("q20.delay") > 0 && num("q20.v1_after") > num("q20.v2_after") && num("q20.v1_after") > 3 * num("q20.baseline"), "q20: the alarm comes after the jump, and a refit helps");
  add(M.difference("q20.gain", get("q20.v1_after"), get("q20.v2_after")));

  return {
    lesson: "check-8",
    title: "בדיקת סיום שלב 8",
    note: "Teaching numbers only, new inputs (case A's candidates and scenarios, the synthetic series of drift.ts and the seeded generators are the stage's own machinery). Each fact reuses a lesson's kind. Every bank is the course's fictional one. Nothing in stage 8 is an existing Mogi system: weights, thresholds, margins, steps and model numbers are for illustration, the data are synthetic, the Directive 329 lines are the team's transcription (unverified) stated as a premise, and the decided parts are only Eylon's 15 calculation rules (as the team recorded them), the four mode names, the language-model rule, the rule that an offer's terms beat the simulation's defaults and the rule that Directive 451 figures use the forecast inputs of that directive.",
    facts,
  };
}
