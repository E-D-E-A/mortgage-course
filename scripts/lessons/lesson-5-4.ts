/**
 * Lesson 5.4 — the forecast of Directive 451, built from zero curves. Every
 * number the lesson, its exercises, its illustration (CurveForecast.vue) and its
 * video show is declared here as a fact; the page and the video read
 * data/lessons/5-4.json, and checks/independent_check.py recomputes each fact
 * (checks/kinds/forecast.py, and metrics.py for the exercise that uses 3.8's
 * helpers).
 *
 * The curves are the course's illustrative curves (src/data/curves.ts), never
 * the Bank of Israel's workbook. The directive's rules are the team's
 * transcription (Brain 7733250, read 3 August 2026), not re-checked.
 */
import { CURVES } from "../../src/data/curves.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as F from "./_forecast-facts.ts";
import * as M from "./lesson-3-8.ts";

const A = CURVES.A;
const B = CURVES.B;
const FLAT = CURVES.flat;

const LOAN = "400000";
const spec = (kind: F.TrackSpec["kind"], rate: string, curves: F.Curves = A, resetYears?: number): F.TrackSpec => ({ kind, principal: LOAN, rate, months: 240, resetYears, curves });

export default function lesson54(): LessonData {
  // The worked example: a variable unlinked track, 5-year resets, 4.30% on the offer day, curve A.
  const W = spec("variable_unlinked", "4.3", A, 5);
  const WB = spec("variable_unlinked", "4.3", B, 5);
  const WF = spec("variable_unlinked", "4.3", FLAT, 5);
  // The five track types of the reference table, same amount and term, each at its own invented rate.
  const FU = spec("fixed_unlinked", "4.8");
  const FL = spec("fixed_linked", "3.2");
  const PR = spec("prime", "4.2");
  const VL = spec("variable_linked", "2.5", A, 5);
  const FX = spec("fx", "5");
  const FLB = spec("fixed_linked", "3.2", B);
  const FLF = spec("fixed_linked", "3.2", FLAT);
  // The half-worked example.
  const H: F.TrackSpec = { kind: "variable_unlinked", principal: "300000", rate: "4", months: 240, resetYears: 5, curves: A };

  // Exercise 6: a variable unlinked track reset once, on the balance left.
  const x6: Track = { principal: "300000", rates: ["4", "4.7"], blockMonths: 60, months: 300 };
  const x6Flat: Track = { ...x6, rates: ["4"] };
  const x6Anchor: Track = { ...x6, rates: ["4", "4.2"] };
  const x6Balance = M.balanceAfter("ex6.balance_60", x6, 60);

  const wFirst = F.first("w.first", W);
  const wHigh = F.highest("w.highest", W);
  const wbHigh = F.highest("wb.highest", WB);
  const wTotal = F.total("w.total", W);
  const wbTotal = F.total("wb.total", WB);
  const flFirst = F.first("fl.first", FL);
  const flHigh = F.highest("fl.highest", FL);

  // Exercise inputs that other facts are computed from.
  const ex2Rate = F.num("ex2.rate", "4.5");
  const ex2A0 = F.num("ex2.anchor0", "3.7");
  const ex2A1 = F.num("ex2.anchor1", "4.3");
  const ex2S = F.points("ex2.spread", "minus", ex2Rate, ex2A0, 2);
  const ex4Y3 = F.num("ex4.y3", "3");
  const ex4Y6 = F.num("ex4.y6", "4");
  const ex4Twice = F.num("ex4.twice_y6", "8");
  const ex6Rate0 = F.num("ex6.rate0", "4");
  const ex6A0 = F.num("ex6.anchor0", "3.5");
  const ex6A1 = F.num("ex6.anchor1", "4.2");
  const ex6S = F.points("ex6.spread", "minus", ex6Rate0, ex6A0, 2);

  const yearsShown = [1, 5, 10, 15, 20];

  const facts: Fact[] = [
    // ── The prediction ──
    F.num("pred.y5", "3.5"),
    F.num("pred.y10", "4"),
    F.forwardYieldsFact("pred.forward", "3.5", 5, "4", 10, 1),
    F.forwardYieldsFact("pred.forward4", "3.5", 5, "4", 10, 4),

    // ── The curve, as the lesson shows it (illustrative) ──
    ...yearsShown.flatMap((n) => [F.curvePoint(`curve.nom${n}`, A.nominal, n), F.curvePoint(`curve.real${n}`, A.real, n)]),

    // ── A forward anchor, step by step: years 6-10 on curve A ──
    F.factor("fwd.f10", A.nominal[9], 6),
    F.factor("fwd.f5", A.nominal[4], 6),
    F.growth("fwd.g10", A.nominal[9], 10, 4),
    F.growth("fwd.g5", A.nominal[4], 5, 4),
    F.growthRatio("fwd.ratio", A.nominal[4], 5, A.nominal[9], 10, 4),
    F.forwardYieldsFact("fwd.root", A.nominal[4], 5, A.nominal[9], 10, 4),
    F.forward("fwd.a2", A.nominal, 5, 10, 2),
    F.forward("fwd.a3", A.nominal, 10, 15, 2),
    F.forward("fwd.a4", A.nominal, 15, 20, 2),
    F.anchorsFact("fwd.anchors", A.nominal, 5, 4),
    F.anchorsFact("fwd.anchors_real", A.real, 5, 4),

    // ── The worked example: 400,000 ₪, 20 years, variable unlinked, resets every 5 years ──
    F.num("w.amount", "400000.00"),
    F.num("w.rate", "4.3"),
    F.spread("w.spread", W),
    F.rateBlocks("w.blocks", W),
    F.pathRows("w.path", W, [1, 61, 121, 181]),
    wFirst,
    wHigh,
    F.highestMonth("w.highest_month", W),
    wTotal,
    M.difference("w.gap", wHigh, wFirst),
    M.above("w.above", wHigh, wFirst, 1),

    // ── The same track and the same offer rate, on curve version B ──
    F.anchorsFact("wb.anchors", B.nominal, 5, 4),
    F.rateBlocks("wb.blocks", WB),
    F.pathRows("wb.path", WB, [1, 61, 121, 181]),
    F.first("wb.first", WB),
    wbHigh,
    F.highestMonth("wb.highest_month", WB),
    M.difference("wb.gap", wbHigh, wHigh),
    wbTotal,
    M.difference("wb.total_gap", wbTotal, wTotal),

    // ── The flat curve (the forecast is today's terms) ──
    F.highest("wf.highest", WF),
    F.highestMonth("wf.highest_month", WF),
    F.first("wf.first", WF),

    // ── Expected inflation: divide, don't subtract ──
    F.curvePoint("infl.n5", A.nominal, 5),
    F.curvePoint("infl.r5", A.real, 5),
    F.inflationFact("infl.pi5", A.nominal[4], A.real[4], 4),
    F.gapPoints("infl.simple5", A.nominal[4], A.real[4], 4),
    F.gapError("infl.err5", A.nominal[4], A.real[4], 4),
    F.factor("infl.fn5", A.nominal[4], 6),
    F.factor("infl.fr5", A.real[4], 6),
    F.num("infl.small_nominal", "4"),
    F.num("infl.small_real", "2"),
    F.inflationFact("infl.small", "4", "2", 4),
    ...[1, 2, 5, 10, 20].flatMap((n) => [F.inflationAt(`infl.at${n}`, A, n, 2), F.inflationForward(`infl.year${n}`, A, n - 1, n, 2)]),
    ...[1, 2, 10, 20].flatMap((n) => [F.curvePoint(`infl.n${n}`, A.nominal, n), F.curvePoint(`infl.r${n}`, A.real, n)]),
    F.indexFact("idx.comp20", A, 20, 4),
    F.indexSimple("idx.simple20", A, 20, 4),
    F.indexGapPercent("idx.gap20", A, 20, 2),
    F.yearlyInflationFact("infl.yearly", A, 20),

    // ── A fixed linked track: the index follows the expected inflation ──
    flFirst,
    flHigh,
    F.highestMonth("fl.highest_month", FL),
    F.total("fl.total", FL),
    F.pathRows("fl.path", FL, [1, 61, 121, 181, 240]),
    M.difference("fl.gap", flHigh, flFirst),

    // ── The five track types, one table ──
    ...(
      [
        ["fu", FU],
        ["fl", FL],
        ["pr", PR],
        ["vu", W],
        ["vl", VL],
      ] as [string, F.TrackSpec][]
    ).flatMap(([k, s]) => [F.first(`t.${k}.first`, s), F.highest(`t.${k}.highest`, s), F.highestMonth(`t.${k}.month`, s), F.total(`t.${k}.total`, s)]),
    F.rateBlocks("t.pr.blocks", PR),
    F.rateBlocks("t.vl.blocks", VL),
    F.spread("t.pr.spread", PR),
    F.spread("t.vl.spread", VL),
    F.hasForecast("t.fx.has", FX),

    // ── The illustration's guided tasks ──
    F.highest("ill.fl_flat.highest", FLF),
    F.highestMonth("ill.fl_flat.month", FLF),
    F.highest("ill.fl_b.highest", FLB),

    // ── Half-worked: 300,000 ₪, rate 4% on the offer day, curve A ──
    F.num("half.amount", "300000.00"),
    F.num("half.rate", "4"),
    F.spread("half.spread", H),
    F.rateBlocks("half.blocks", H),
    F.pathRows("half.path", H, [1, 61, 121, 181]),
    F.highest("half.highest", H),
    F.highestMonth("half.highest_month", H),
    F.first("half.first", H),

    // ── Exercise 2: rate = anchor + spread ──
    ex2Rate,
    ex2A0,
    ex2A1,
    ex2S,
    F.points("ex2.answer", "plus", ex2A1, ex2S, 2),

    // ── Exercise 3: expected inflation ──
    F.num("ex3.nominal", "6"),
    F.num("ex3.real", "2"),
    F.inflationFact("ex3.answer", "6", "2", 2),
    F.gapPoints("ex3.err_simple", "6", "2", 2),

    // ── Exercise 4: a forward anchor from two yields ──
    ex4Y3,
    ex4Y6,
    ex4Twice,
    F.forwardYieldsFact("ex4.answer", "3", 3, "4", 6, 2),
    F.num("ex4.err_avg", "3.5"),
    F.points("ex4.err_double", "minus", ex4Twice, ex4Y3, 2),

    // ── Exercise 6: the payment after the first reset ──
    F.num("ex6.loan", "300000.00"),
    ex6Rate0,
    ex6A0,
    ex6A1,
    ex6S,
    F.points("ex6.rate", "plus", ex6A1, ex6S, 2),
    M.first("ex6.first", [x6]),
    x6Balance,
    M.payment("ex6.answer", [x6], 61),
    M.payment("ex6.err_flat", [x6Flat], 61),
    M.payment("ex6.err_anchor", [x6Anchor], 61),
    M.first("ex6.err_all_months", [{ principal: x6Balance.value as string, rates: ["4.7"], months: 300 }]),

    // ── Exercise 7 ──
    F.num("ex7.total_rate", "4.1"),
  ];

  return {
    lesson: "5.4",
    title: "תחזית לפי הוראה 451: עקום אפס וציפיות אינפלציה",
    note: "Illustrative zero curves (src/data/curves.ts), not Bank of Israel data. The directive's rules are the team's transcription (Brain 7733250). Course assumptions: today's anchor is the curve's yield at the reset length; spread = offer rate − today's anchor; prime is treated as a track resetting every year; every anchor and each year's expected inflation rounded to 2 decimals; linked tracks follow the expected-inflation path year by year, evenly by month; statement rounding.",
    facts,
  };
}
