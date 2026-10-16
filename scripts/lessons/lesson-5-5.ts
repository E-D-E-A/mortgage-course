/**
 * Lesson 5.5 — four numbers that look alike: the Bank of Israel's average, an
 * estimate, a bank's personal offer and the rate of an executed deal. Every
 * number the lesson, its exercises, its illustration (WhichNumber.vue) and its
 * video show is declared here as a fact; the page and the video read
 * data/lessons/5-5.json, and checks/independent_check.py recomputes each fact
 * (checks/kinds/forecast.py for averages and gaps, rates.py for effective
 * rates, metrics.py for payments and totals).
 *
 * All rates here are invented for teaching: not market data, not a bank's
 * quote, not an average the Bank of Israel published. The only thing the lesson
 * asserts about the official publications is what the team recorded in the Brain
 * (page 67469313, 8 October 2026; 7831553, 3 August 2026), labelled "לא אומת".
 */
import type { Track } from "../../src/lib/calc/metrics.ts";
import { effectiveAnnualRate, roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as F from "./_forecast-facts.ts";
import * as M from "./lesson-3-8.ts";

/** The effective annual rate of a contract's annual rate (monthly = annual ÷ 12), lesson 0.4. */
const effective = (id: string, annual: string, decimals: number): Fact => ({
  id,
  kind: "effective_annual_rate",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals },
  value: roundedString(effectiveAnnualRate(annual, 12), decimals),
});

const track = (principal: string, rate: string, months = 300): Track => ({ principal, rates: [rate], months });

export default function lesson55(): LessonData {
  // ── The prediction: an average (effective) against an offer (contract rate) ──
  const predAvg = F.num("pred.avg", "4.80");
  const predOffer = F.num("pred.offer", "4.7");
  const predOfferEff = effective("pred.offer_eff", "4.7", 2);

  // ── The four numbers of the scenario (fixed unlinked, 500,000 ₪, 25 years) ──
  const avg = F.num("n.avg", "4.80");
  const bankB = F.num("n.bank_b_avg", "4.85");
  const offer = F.num("n.offer", "4.65");
  const quote = F.num("n.quote", "4.58");
  const est = F.num("n.est", "4.55");
  const calc = F.num("n.calc", "4.6");
  const deal = F.num("n.deal", "4.45");
  const neighbor = F.num("n.neighbor", "4.2");
  const offerEff = effective("n.offer_eff", "4.65", 2);

  // ── What a tenth of a percentage point is worth: 500,000 ₪, 25 years ──
  const vOffer = M.first("v.offer", [track("500000", "4.65")]);
  const vEst = M.first("v.est", [track("500000", "4.55")]);
  const vDeal = M.first("v.deal", [track("500000", "4.45")]);
  const tOffer = M.total("v.total_offer", [track("500000", "4.65")]);
  const tEst = M.total("v.total_est", [track("500000", "4.55")]);

  // ── Why an average is not a price: ten loans a month, the prices of three profiles do not move ──
  const profileS = F.num("m.price_s", "4.2");
  const profileM = F.num("m.price_m", "4.7");
  const profileW = F.num("m.price_w", "5.4");
  const monthX = ["4.2", "4.2", "4.2", "4.2", "4.2", "4.2", "4.7", "4.7", "4.7", "5.4"];
  const monthY = ["4.2", "4.2", "4.2", "4.7", "4.7", "4.7", "5.4", "5.4", "5.4", "5.4"];
  const xAvg = F.average("m.x_avg", monthX, 2);
  const yAvg = F.average("m.y_avg", monthY, 2);

  // ── An average by loan size ──
  const wRates = ["4.3", "4.7", "5.4"];
  const wAmounts = ["800000", "400000", "200000"];
  const wSimple = F.average("w.simple", wRates, 2);
  const wSize = F.weightedAverage("w.size", wRates, wAmounts, 2);

  // ── Exercises ──
  const ex4Rates = ["4.1", "4.9", "5.5"];
  const ex4Amounts = ["600000", "300000", "100000"];
  const ex3Nominal = F.num("ex3.nominal", "5.1");
  const ex6Hi = track("600000", "5", 360);
  const ex6Lo = track("600000", "4.9", 360);
  const ex6First = M.first("ex6.pay_high", [ex6Hi]);
  const ex6Low = M.first("ex6.pay_low", [ex6Lo]);
  const ex6TotHi = M.total("ex6.total_high", [ex6Hi]);
  const ex6TotLo = M.total("ex6.total_low", [ex6Lo]);

  const facts: Fact[] = [
    predAvg,
    predOffer,
    predOfferEff,
    F.points("pred.naive_gap", "minus", predAvg, predOffer, 2),

    avg,
    bankB,
    offer,
    quote,
    est,
    calc,
    deal,
    neighbor,
    offerEff,
    F.num("n.loan", "500000.00"),
    F.points("n.avg_gap", "minus", avg, offerEff, 2),
    F.points("n.est_gap", "minus", offer, est, 2),

    vOffer,
    vEst,
    vDeal,
    M.difference("v.pay_gap", vOffer, vEst),
    M.difference("v.deal_gap", vOffer, vDeal),
    tOffer,
    tEst,
    M.difference("v.total_gap", tOffer, tEst),

    profileS,
    profileM,
    profileW,
    xAvg,
    yAvg,
    F.points("m.gap", "minus", yAvg, xAvg, 2),
    F.countBelow("m.y_below", monthY, yAvg),
    F.count("m.y_count", monthY),
    F.countBelow("m.x_below", monthX, xAvg),

    wSimple,
    wSize,
    F.points("w.gap", "minus", wSimple, wSize, 2),
    F.num("w.amount1", "800000.00"),
    F.num("w.amount2", "400000.00"),
    F.num("w.amount3", "200000.00"),
    F.num("w.rate1", "4.3"),
    F.num("w.rate2", "4.7"),
    F.num("w.rate3", "5.4"),
    F.num("w.total_amount", "1400000.00"),

    // The conversion table, nominal to effective.
    ...["4.2", "4.7", "5.1", "5.6"].map((r) => effective(`eff.${r}`, r, 2)),
    ...["4.2", "4.7", "5.1", "5.6"].map((r) => F.num(`nom.${r}`, r)),

    // Exercise 3.
    ex3Nominal,
    effective("ex3.answer", "5.1", 2),
    // Exercise 4.
    F.weightedAverage("ex4.answer", ex4Rates, ex4Amounts, 2),
    F.average("ex4.err_simple", ex4Rates, 2),
    // Exercise 6.
    ex6First,
    ex6Low,
    M.difference("ex6.answer", ex6First, ex6Low),
    ex6TotHi,
    ex6TotLo,
    M.difference("ex6.err_total", ex6TotHi, ex6TotLo),
  ];

  return {
    lesson: "5.5",
    title: "ממוצע שוק, אומדן, הצעה אישית ועסקה שבוצעה",
    note: "All rates are invented for teaching: not market data, not a bank's quote, not a Bank of Israel average. Contract rates are nominal annual rates; monthly = annual ÷ 12; the effective rate is the twelfth-root conversion of lesson 0.4. Schedules follow the statement convention.",
    facts,
  };
}
