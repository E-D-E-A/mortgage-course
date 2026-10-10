/**
 * Lesson 3.8 — the first payment, the payment under today's terms, and the
 * highest payment under a forecast. Every number the lesson, its exercises and
 * its illustration's guided tasks show is declared here as a fact; the page
 * reads data/lessons/3-8.json, and checks/independent_check.py recomputes
 * every fact (checks/kinds/metrics.py).
 *
 * The helpers below build a fact for each measure of src/lib/calc/metrics.ts.
 * Lessons 3.9-3.11 import them from this file.
 *
 * Inputs are teaching numbers, not market rates. The variable track's future
 * rates are an invented path for teaching, never the Bank of Israel's
 * forecast; the lesson says so where it shows them.
 */
import Decimal from "decimal.js";
import {
  annualByMultiplication,
  bisectionSteps,
  breakdown,
  effectiveAnnual,
  firstPayment,
  highestPayment,
  irrMonthly,
  mixPayments,
  paymentInMonth,
  percentAbove,
  presentValue,
  presentValueAtAnnual,
  presentValueRows,
  ratePath,
  type Track,
  totalPaid,
  trackPayments,
  trackRows,
} from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact, LessonData } from "../build-data.ts";

/**
 * Teaching numbers follow the statement convention (course/AUTHORING.md): every
 * schedule a fact is built from is rounded the way a statement is, unless the
 * track says otherwise. So the same loan gives the same totals in 2.9, 3.9 and
 * 3.12. Present values and IRRs are computed on those payments.
 */
export const st = (t: Track): Track => ({ ...t, rounding: t.rounding ?? "statement" });

/** The schedule as the Python check reads it: one track per ";", fields "|"-separated; the last is the rounding. */
export const enc = (tracks: Track[]) =>
  tracks
    .map(st)
    .map((t) =>
      [t.method ?? "spitzer", t.principal, t.rates.join(","), t.blockMonths ?? t.months, t.months, t.inflationPercent ?? 0, t.graceMonths ?? 0, t.rounding].join("|"),
    )
    .join(";");

const pays = (tracks: Track[]) => (tracks.length === 1 ? trackPayments(st(tracks[0])) : mixPayments(tracks.map(st)));

export const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export const sumOf = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "met_sum",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: moneyString(parts.reduce((s, p) => s.plus(p.value as string), new Decimal(0))),
});

/** A money fact times a whole count (a rounded payment times the number of payments). */
export const times = (id: string, of: Fact, count: number): Fact => ({
  id,
  kind: "met_times",
  inputs: { of: of.id, count },
  value: moneyString(new Decimal(of.value as string).mul(count)),
});

export const months = (id: string, years: number): Fact => ({ id, kind: "met_months", inputs: { years }, value: years * 12 });

export const payment = (id: string, tracks: Track[], month: number): Fact => ({
  id,
  kind: "met_payment",
  inputs: { tracks: enc(tracks), month },
  value: moneyString(paymentInMonth(pays(tracks), month)),
});

export const first = (id: string, tracks: Track[]): Fact => ({
  id,
  kind: "met_first_payment",
  inputs: { tracks: enc(tracks) },
  value: moneyString(firstPayment(pays(tracks))),
});

export const highest = (id: string, tracks: Track[]): Fact => ({
  id,
  kind: "met_highest_payment",
  inputs: { tracks: enc(tracks) },
  value: moneyString(highestPayment(pays(tracks)).payment),
});

export const highestMonth = (id: string, tracks: Track[]): Fact => ({
  id,
  kind: "met_highest_month",
  inputs: { tracks: enc(tracks) },
  value: highestPayment(pays(tracks)).month,
});

/** By how many percent one money fact is above another, rounded for display. */
export const above = (id: string, value: Fact, base: Fact, decimals: number): Fact => ({
  id,
  kind: "met_percent_above",
  inputs: { value: value.id, base: base.id, decimals },
  value: roundedString(percentAbove(value.value as string, base.value as string), decimals),
});

/** The payment `percent` above a base payment: base × (1 + percent ÷ 100). */
export const threshold = (id: string, base: Fact, percent: string): Fact => ({
  id,
  kind: "met_threshold",
  inputs: { base: base.id, percent },
  value: moneyString(new Decimal(base.value as string).mul(new Decimal(1).plus(new Decimal(percent).div(100)))),
});

/** A single track's balance after the payment of month `month`. */
export const balanceAfter = (id: string, track: Track, month: number): Fact => ({
  id,
  kind: "met_balance",
  inputs: { tracks: enc([track]), month },
  value: moneyString(trackRows(st(track))[month - 1].closing),
});

export const total = (id: string, tracks: Track[]): Fact => ({
  id,
  kind: "met_total_paid",
  inputs: { tracks: enc(tracks) },
  value: moneyString(totalPaid(pays(tracks))),
});

export const interest = (id: string, track: Track): Fact => ({
  id,
  kind: "met_total_interest",
  inputs: { tracks: enc([track]) },
  value: moneyString(breakdown(st(track)).interest),
});

export const indexation = (id: string, track: Track): Fact => ({
  id,
  kind: "met_total_indexation",
  inputs: { tracks: enc([track]) },
  value: moneyString(breakdown(st(track)).indexation),
});

/** The value today of a schedule at a rate: "annual" (÷ 12) or "monthly". */
export const pv = (id: string, tracks: Track[], rate: string, basis: "annual" | "monthly" = "annual"): Fact => ({
  id,
  kind: "met_pv",
  inputs: { tracks: enc(tracks), rate_percent: rate, basis },
  value: moneyString(basis === "annual" ? presentValueAtAnnual(pays(tracks), rate) : presentValue(pays(tracks), rate)),
});

/** The value today of the same rounded payment `months` times, at an annual rate (monthly = annual ÷ 12): a spreadsheet's =PV. */
export const pvLevel = (id: string, payment: Fact, months: number, rate: string): Fact => ({
  id,
  kind: "met_pv_level",
  inputs: { payment: payment.id, months, rate_percent: rate },
  value: moneyString(presentValueAtAnnual(Array.from({ length: months }, () => payment.value as string), rate)),
});

/** The value today of a plain list of monthly payments, at a monthly rate. */
export const pvList = (id: string, payments: string[], monthly: string): Fact => ({
  id,
  kind: "met_pv_list",
  inputs: { payments: payments.join(","), monthly_percent: monthly },
  value: moneyString(presentValue(payments, monthly)),
});

/** One row per payment: the payment, what it is divided by, and its value today. */
export const pvRows = (id: string, tracks: Track[], monthly: string, decimals: number): Fact => ({
  id,
  kind: "met_pv_rows",
  inputs: { tracks: enc(tracks), monthly_percent: monthly, decimals },
  value: presentValueRows(pays(tracks), monthly).map((r) => ({
    month: r.month,
    payment: moneyString(r.payment),
    growth: roundedString(r.growth, decimals),
    value_today: moneyString(r.valueToday),
  })),
});

export const irr = (id: string, tracks: Track[], received: string, decimals: number): Fact => ({
  id,
  kind: "met_irr_monthly",
  inputs: { tracks: enc(tracks), received, decimals },
  value: roundedString(irrMonthly(pays(tracks), received), decimals),
});

export const irrX12 = (id: string, tracks: Track[], received: string, decimals: number): Fact => ({
  id,
  kind: "met_irr_x12",
  inputs: { tracks: enc(tracks), received, decimals },
  value: roundedString(annualByMultiplication(irrMonthly(pays(tracks), received)), decimals),
});

export const irrEffective = (id: string, tracks: Track[], received: string, decimals: number): Fact => ({
  id,
  kind: "met_irr_effective",
  inputs: { tracks: enc(tracks), received, decimals },
  value: roundedString(effectiveAnnual(irrMonthly(pays(tracks), received)), decimals),
});

export const x12 = (id: string, monthly: string, decimals: number): Fact => ({
  id,
  kind: "met_x12",
  inputs: { monthly_percent: monthly, decimals },
  value: roundedString(annualByMultiplication(monthly), decimals),
});

export const effective = (id: string, monthly: string, decimals: number): Fact => ({
  id,
  kind: "met_effective_from_monthly",
  inputs: { monthly_percent: monthly, decimals },
  value: roundedString(effectiveAnnual(monthly), decimals),
});

export const bisection = (id: string, tracks: Track[], received: string, low: string, high: string, steps: number, decimals: number): Fact => ({
  id,
  kind: "met_bisection_table",
  inputs: { tracks: enc(tracks), received, low, high, steps, decimals },
  value: bisectionSteps(pays(tracks), received, low, high, steps).map((s) => ({
    step: s.step,
    low: roundedString(s.low, decimals),
    high: roundedString(s.high, decimals),
    mid: roundedString(s.mid, decimals),
    value_today: moneyString(s.valueToday),
    verdict: s.verdict,
  })),
});

/** One row per block of months: each track's rate and payment in the block's first month, and the mix's total. */
export const blocks = (id: string, tracks: Track[], blockMonths: number): Fact => {
  const each = tracks.map((t) => trackPayments(st(t)));
  const paths = tracks.map(ratePath);
  const n = Math.max(...each.map((p) => p.length));
  const rows: Record<string, string | number>[] = [];
  for (let start = 0, b = 1; start < n; start += blockMonths, b++) {
    const to = Math.min(start + blockMonths, n);
    // The years a block covers, for tables: whole years when the blocks are whole years.
    const row: Record<string, string | number> = { block: b, from_month: start + 1, to_month: to, years: `${start / 12 + 1}–${to / 12}` };
    let sum = new Decimal(0);
    each.forEach((p, j) => {
      row[`rate_${j + 1}`] = roundedString(paths[j][Math.min(start, paths[j].length - 1)], 4);
      const pay = start < p.length ? p[start] : new Decimal(0);
      row[`payment_${j + 1}`] = moneyString(pay);
      sum = sum.plus(pay);
    });
    row.total = moneyString(sum);
    rows.push(row);
  }
  return { id, kind: "met_block_table", inputs: { tracks: enc(tracks), block_months: blockMonths }, value: rows };
};

/** The payment every `every` months from month 1 (a light series for a video). */
export const series = (id: string, tracks: Track[], every: number): Fact => {
  const p = pays(tracks);
  const out: string[] = [];
  for (let t = 0; t < p.length; t += every) out.push(moneyString(p[t]));
  return { id, kind: "met_series", inputs: { tracks: enc(tracks), every }, value: out };
};

/** The value today at each annual rate of a list (monthly = annual ÷ 12): a curve for a video. */
export const pvCurve = (id: string, tracks: Track[], rates: string[]): Fact => ({
  id,
  kind: "met_pv_curve",
  inputs: { tracks: enc(tracks), rates: rates.join(",") },
  value: rates.map((rate) => ({ rate, value_today: moneyString(presentValueAtAnnual(pays(tracks), rate)) })),
});

/** part ÷ whole × 100, in percent, rounded for display. */
export const share = (id: string, part: Fact, whole: Fact, decimals: number): Fact => ({
  id,
  kind: "met_share",
  inputs: { part: part.id, whole: whole.id, decimals },
  value: roundedString(new Decimal(part.value as string).div(whole.value as string).mul(100), decimals),
});

export default function lesson38(): LessonData {
  // ── The explanation: 600,000 ₪ for 20 years. Today's rate 4.6%. ──
  const fixed: Track = { principal: "600000", rates: ["4.6"], months: 240 };
  // A variable unlinked track reset every 5 years, with an invented path for its rate.
  const forecast: Track = { principal: "600000", rates: ["4.6", "5.1", "5.5", "5.3"], blockMonths: 60, months: 240 };
  const higher: Track = { ...forecast, rates: ["4.6", "6", "7", "6.5"] };
  const lower: Track = { ...forecast, rates: ["4.6", "4", "3.5", "3.5"] };

  const fFirst = first("explain.first", [forecast]);
  const fMax = highest("explain.max", [forecast]);
  const fHighMax = highest("explain.high_max", [higher]);

  // ── Worked example: a mix of two tracks, 20 years each. ──
  const wFixed: Track = { principal: "300000", rates: ["5.2"], months: 240 };
  const wVar: Track = { principal: "300000", rates: ["4.6", "5.1", "5.5", "5.3"], blockMonths: 60, months: 240 };
  const wVarHigh: Track = { ...wVar, rates: ["4.6", "6", "7", "6.5"] };
  const W = [wFixed, wVar];
  const wFirst = first("worked.first", W);
  const wMax = highest("worked.max", W);
  const wFixedPay = first("worked.fixed_pay", [wFixed]);
  const wVarFirst = first("worked.var_first", [wVar]);
  const wVarMax = highest("worked.var_max", [wVar]);
  const wHighMax = highest("worked.high_max", [wFixed, wVarHigh]);

  // ── Exercises. ──
  // 2: the payment Mogi's highlight starts at, 10% above today's.
  const x2Base = first("ex2.base", [{ principal: "450000", rates: ["4.8"], months: 300 }]);
  const x2Answer = threshold("ex2.answer", x2Base, "10");
  // 3: a variable track reset after 5 years — the payment on the balance left.
  const x3: Track = { principal: "400000", rates: ["4", "5"], blockMonths: 60, months: 300 };
  const x3Flat: Track = { ...x3, rates: ["4"] };
  const x3Balance = balanceAfter("ex3.balance_60", x3, 60);
  // 5: two tracks of different terms: the mix's highest payment is not the sum of the highest payments.
  const x5Fixed: Track = { principal: "250000", rates: ["5"], months: 180 };
  const x5Var: Track = { principal: "350000", rates: ["4.5", "5", "5.5", "6"], blockMonths: 60, months: 240 };
  // The answer is what the learner's table shows: the mix's payment in the first month of years 11-15
  // (month 121). The very highest single month is month 180, where the fixed track's last payment
  // clears its rounding; the solution names it, and the exercise accepts it as near.
  const x5Max = payment("ex5.answer", [x5Fixed, x5Var], 121);
  const x5Closing = highest("ex5.closing_max", [x5Fixed, x5Var]);
  const x5FixedPay = first("ex5.fixed_pay", [x5Fixed]);
  // The variable track's payment in years 16-20 (month 181), as the table shows it. (Its very last
  // payment, which clears the balance, is a few agorot more: the statement convention.)
  const x5VarMax = payment("ex5.var_max", [x5Var], 181);
  // 6: Mogi's highlight — the forecast maximum against today's payment.
  const x6: Track = { principal: "500000", rates: ["4.2", "5.2", "5.8", "5.5"], blockMonths: 60, months: 240 };
  const x6First = first("ex6.first", [x6]);
  const x6Max = highest("ex6.max", [x6]);
  const x6Gap = difference("ex6.gap", x6Max, x6First);

  // ── Half-worked: a fixed track for 10 years beside a variable one for 20. ──
  const hFixed: Track = { principal: "200000", rates: ["4.9"], months: 120 };
  const hVar: Track = { principal: "400000", rates: ["4.4", "5.4", "6", "5.6"], blockMonths: 60, months: 240 };

  // ── When the first payment and the payment under today's terms differ. ──
  // (a) A prime track taken three years ago at 4.5%; prime has since risen one point: 5.5% from month 37.
  const prime: Track = { principal: "400000", rates: ["4.5", "5.5"], blockMonths: 36, months: 240 };
  const dFirst = first("diff.prime_first", [prime]);
  const dNow = payment("diff.prime_now", [prime], 37);
  // (b) A fixed linked track, 3% a year, the index rising 2% a year (a teaching assumption):
  // the payment under today's terms has no index move; the first payment already has one month of it.
  const dLinked: Track = { principal: "600000", rates: ["3"], months: 240, inflationPercent: "2" };
  const dLinkedNow = first("diff.linked_now", [{ ...dLinked, inflationPercent: "0" }]);
  const dLinkedFirst = first("diff.linked_first", [dLinked]);

  // ── The illustration's defaults (ForecastPaths.vue): the explanation's track. ──
  const sHigh: Track = { ...forecast, rates: ["4.6", "5.1", "6.5", "5.3"] };

  const facts: Fact[] = [
    given("explain.loan", "600000.00"),
    months("explain.months", 20),
    first("explain.fixed_pay", [fixed]),
    fFirst,
    payment("explain.pay_61", [forecast], 61),
    payment("explain.pay_121", [forecast], 121),
    payment("explain.pay_181", [forecast], 181),
    fMax,
    highestMonth("explain.max_month", [forecast]),
    difference("explain.max_gap", fMax, fFirst),
    blocks("explain.blocks", [forecast], 60),
    blocks("explain.blocks_high", [higher], 60),
    blocks("explain.blocks_low", [lower], 60),
    fHighMax,
    highestMonth("explain.high_max_month", [higher]),
    highest("explain.low_max", [lower]),
    highestMonth("explain.low_max_month", [lower]),
    difference("explain.high_over_forecast", fHighMax, fMax),
    above("explain.above", fMax, fFirst, 1),
    threshold("explain.highlight_at", fFirst, "10"),

    // When the first payment and the payment under today's terms differ.
    given("diff.prime_loan", "400000.00"),
    dFirst,
    dNow,
    difference("diff.prime_gap", dNow, dFirst),
    given("diff.linked_loan", "600000.00"),
    dLinkedNow,
    dLinkedFirst,
    difference("diff.linked_gap", dLinkedFirst, dLinkedNow),

    // The illustration's guided tasks.
    highest("slider.high_max", [sHigh]),
    highestMonth("slider.high_max_month", [sHigh]),

    // Worked example.
    given("worked.fixed_amount", "300000.00"),
    given("worked.var_amount", "300000.00"),
    wFixedPay,
    wVarFirst,
    wFirst,
    blocks("worked.blocks", W, 60),
    wVarMax,
    difference("worked.var_gap", wVarMax, wVarFirst),
    above("worked.var_above", wVarMax, wVarFirst, 1),
    wMax,
    highestMonth("worked.max_month", W),
    difference("worked.max_gap", wMax, wFirst),
    above("worked.above", wMax, wFirst, 1),
    threshold("worked.highlight_at", wFirst, "10"),
    wHighMax,
    difference("worked.high_gap", wHighMax, wMax),

    // Half-worked.
    given("half.fixed_amount", "200000.00"),
    given("half.var_amount", "400000.00"),
    blocks("half.blocks", [hFixed, hVar], 60),
    highest("half.max", [hFixed, hVar]),
    highestMonth("half.max_month", [hFixed, hVar]),
    highestMonth("ex6.max_month", [x6]),
    highest("half.var_max", [hVar]),
    first("half.fixed_pay", [hFixed]),

    // Exercise 2: the threshold for Mogi's highlight.
    x2Base,
    x2Answer,
    difference("ex2.err_tenth", x2Answer, x2Base),
    // Exercise 3: the payment after the reset.
    given("ex3.loan", "400000.00"),
    first("ex3.first", [x3]),
    x3Balance,
    payment("ex3.answer", [x3], 61),
    payment("ex3.err_flat", [x3Flat], 61),
    first("ex3.err_full_amount", [{ principal: "400000", rates: ["5"], months: 300 }]),
    first("ex3.err_all_months", [{ principal: x3Balance.value as string, rates: ["5"], months: 300 }]),
    // Exercise 5.
    x5FixedPay,
    first("ex5.var_first", [x5Var]),
    x5VarMax,
    blocks("ex5.blocks", [x5Fixed, x5Var], 60),
    x5Max,
    x5Closing,
    highestMonth("ex5.closing_month", [x5Fixed, x5Var]),
    payment("ex5.fixed_last", [x5Fixed], 180),
    sumOf("ex5.err_sum", [x5FixedPay, x5VarMax]),
    first("ex5.mix_first", [x5Fixed, x5Var]),
    // Exercise 6.
    given("ex6.loan", "500000.00"),
    x6First,
    blocks("ex6.blocks", [x6], 60),
    x6Max,
    above("ex6.answer", x6Max, x6First, 1),
    x6Gap,
    share("ex6.err_of_max", x6Gap, x6Max, 1),
    threshold("ex6.highlight_at", x6First, "10"),
  ];

  return {
    lesson: "3.8",
    title: "החזר ראשון, החזר בתנאים הנוכחיים, החזר מרבי חזוי",
    note: "Teaching numbers, not market rates. The variable tracks' later rates are invented paths for teaching, not the Bank of Israel's forecast. Monthly rate = annual ÷ 12; the payment is recalculated on the balance left at each reset; schedules follow the statement convention (balance and each month's interest in agorot, the payment rounded when set, the last payment clearing the balance).",
    facts,
  };
}
