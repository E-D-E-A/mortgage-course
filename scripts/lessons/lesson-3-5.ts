/**
 * Lesson 3.5 — indexation along the timeline: the base index, the day the
 * schedule starts (the team's transcription of Directive 451 §17, not verified),
 * the interim period, and a linked schedule month by month against an unlinked one.
 *
 * Every number the page and its exercises show is a fact here; the page reads
 * data/lessons/3-5.json and checks/kinds/schedule.py (with amortization.py and
 * indexation.py for the kinds reused from stage 2) recomputes each one.
 *
 * The index series (100 → 100.3 → 100.5 → 100.4 …) and the inflation paths are
 * teaching scenarios, not forecasts. The schedule engine is src/lib/calc/schedule.ts:
 * the balance is indexed every month before the payment (Mogi decision DEC-3), so
 * already payment 1 carries one month of index. Every table and worked row uses its
 * statement rounding (course/AUTHORING.md): balance, interest and payment in agorot
 * each month, the payment the printed C × M_k ÷ M_0 rounded, so every equality the
 * page prints holds on the printed numbers. LinkedSchedule.vue uses the same.
 *
 * The fact builders at the top are exported for lessons 3.6 and 3.7.
 */
import Decimal from "decimal.js";
import { annuityBalance, annuityPayment, monthInterest } from "../../src/lib/calc/amortization.ts";
import { changePercent, indexedAmount, plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { periodicRateByDivision, periodicRateFromEffective, roundedString } from "../../src/lib/calc/rates.ts";
import {
  interimInterest,
  type PathInputs,
  pathInputs,
  type ScheduleRow,
  scheduleFromInputs,
  scheduleStart,
} from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";

// ---------------------------------------------------------------------------
// Fact builders (shared with lessons 3.6 and 3.7)
// ---------------------------------------------------------------------------

export const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });
export const v = (f: Fact) => f.value as string;

/** The row fields a fact can name; the Python check uses the same names. */
const FIELDS = {
  opening: "opening",
  indexation: "indexation",
  interest: "interest",
  payment: "payment",
  principal_paid: "principalPaid",
  closing: "closing",
  payment_indexation: "paymentIndexation",
} as const;
export type RowField = keyof typeof FIELDS;
const pick = (r: ScheduleRow, field: RowField) => r[FIELDS[field]] as Decimal;

export const schRow = (id: string, inputs: PathInputs, month: number, field: RowField): Fact => ({
  id,
  kind: "sch_row",
  inputs: { ...inputs, month, field },
  value: moneyString(pick(scheduleFromInputs(inputs)[month - 1], field)),
});

export const schSeries = (id: string, inputs: PathInputs): Fact => {
  const rows = scheduleFromInputs(inputs);
  const value = [];
  for (let k = 12; k <= rows.length; k += 12) value.push({ year: k / 12, payment: moneyString(rows[k - 1].payment), balance: moneyString(rows[k - 1].closing) });
  return { id, kind: "sch_series", inputs, value };
};

export const schTotal = (id: string, inputs: PathInputs, field: RowField, through?: number): Fact => {
  const rows = scheduleFromInputs(inputs).slice(0, through ?? undefined);
  return {
    id,
    kind: "sch_total",
    inputs: { ...inputs, field, ...(through === undefined ? {} : { through }) },
    value: moneyString(rows.reduce((s, r) => s.plus(pick(r, field)), new Decimal(0))),
  };
};

export const payment = (id: string, principal: string, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: rate, months },
  value: moneyString(annuityPayment(principal, rate, months)),
});

export const balance = (id: string, principal: string, rate: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_balance",
  inputs: { principal, rate_percent: rate, months, paid },
  value: moneyString(annuityBalance(principal, rate, months, paid)),
});

export const interest = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "amort_month_interest",
  inputs: { balance: amount, rate_percent: rate },
  value: moneyString(monthInterest(amount, rate)),
});

export const indexed = (id: string, amount: string, base: string, now: string): Fact => ({
  id,
  kind: "infl_indexed_amount",
  inputs: { amount, base_index: base, new_index: now },
  value: moneyString(indexedAmount(amount, base, now)),
});

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const startFacts = (prefix: string, payout: string): Fact[] => {
  const s = scheduleStart(payout);
  return [
    given(`${prefix}.payout`, payout),
    { id: `${prefix}.start`, kind: "sch_start_date", inputs: { payout }, value: s.start },
    { id: `${prefix}.first`, kind: "sch_first_payment_date", inputs: { payout }, value: s.firstPayment },
    { id: `${prefix}.days`, kind: "sch_interim_days", inputs: { payout }, value: String(s.interimDays) },
  ];
};

const interim = (id: string, amount: string, rate: string, days: number): Fact => ({
  id,
  kind: "sch_interim_interest",
  inputs: { amount, rate_percent: rate, days },
  value: moneyString(interimInterest(amount, rate, days)),
});

/** One row of the half-worked table: the index, and C × M ÷ M₀ with its indexation part. */
const halfRows = (c: string, index: string[]) =>
  index.slice(1).map((m, k) => {
    const pay = indexedAmount(c, index[0], m);
    return { period: k + 1, index: m, payment: moneyString(pay), extra: moneyString(pay.minus(c)) };
  });

export default function lesson35(): LessonData {
  // The explanation: a fixed linked track of 400,000 ₪ for 20 years at 3%.
  const P = "400000";
  const N = 240;
  const R = "3";
  const INDEX = ["100", "100.3", "100.5", "100.4"];
  const S = "statement" as const; // every teaching row in agorot, as a statement shows it
  const linked = pathInputs({ principal: P, months: N, rate: R, index: INDEX, rounding: S });
  const once = pathInputs({ principal: P, months: N, rate: R, index: ["100", "100.3"], rounding: S });
  const unlinked = pathInputs({ principal: P, months: N, rate: R, rounding: S });
  const c = payment("explain.c", P, R, N);
  const oncePaid = schTotal("once.paid_total", once, "payment");
  const unlinkedPaid = schTotal("unlinked.paid_total", unlinked, "payment");
  const onceExtra = difference("once.payment_extra_total", oncePaid, unlinkedPaid);
  const onceIndexation = schTotal("once.indexation_total", once, "indexation");

  const m1Index = schRow("m1.indexation", linked, 1, "indexation");
  const m1Opening = schRow("m1.opening", linked, 1, "opening");
  const m1Interest = schRow("m1.interest", linked, 1, "interest");
  const m1Payment = schRow("m1.payment", linked, 1, "payment");
  const m1Principal = schRow("m1.principal", linked, 1, "principal_paid");
  const m1Closing = schRow("m1.closing", linked, 1, "closing");
  const u1Interest = interest("u1.interest", P, R);
  const u1Closing = schRow("u1.closing", unlinked, 1, "closing");

  const m2Index = schRow("m2.indexation", linked, 2, "indexation");
  const m2Opening = schRow("m2.opening", linked, 2, "opening");
  const m2Interest = schRow("m2.interest", linked, 2, "interest");
  const m2Payment = schRow("m2.payment", linked, 2, "payment");
  const m2Principal = schRow("m2.principal", linked, 2, "principal_paid");
  const m2Closing = schRow("m2.closing", linked, 2, "closing");

  const m3Index = schRow("m3.indexation", linked, 3, "indexation");
  const m3Opening = schRow("m3.opening", linked, 3, "opening");
  const m3Interest = schRow("m3.interest", linked, 3, "interest");
  const m3Payment = schRow("m3.payment", linked, 3, "payment");
  const m3Principal = schRow("m3.principal", linked, 3, "principal_paid");
  const m3Closing = schRow("m3.closing", linked, 3, "closing");

  // The illustration: 2% a year, evenly; the same track unlinked at the same 3%.
  const two = pathInputs({ principal: P, months: N, rate: R, inflation: ["2"], rounding: S });
  const four = pathInputs({ principal: P, months: N, rate: R, inflation: ["4"], rounding: S });

  // Worked example: Hadas, a linked track of 250,000 ₪ for 25 years at 3.2%, paid out on 18 December 2026.
  const W = "250000";
  const WN = 300;
  const WR = "3.2";
  const worked = pathInputs({ principal: W, months: WN, rate: WR, index: ["100", "100.4"], rounding: S });
  const wStart = scheduleStart("2026-12-18");
  const wc = payment("worked.c", W, WR, WN);
  const wPay = schRow("worked.payment", worked, 1, "payment");

  // Exercises.
  const ex4 = pathInputs({ principal: "320000", months: 240, rate: "3.5", index: ["100", "100.4"], rounding: S });
  const ex5c = payment("ex5.c", "320000", "3.5", 240);

  const facts: Fact[] = [
    given("case.amount", "400000.00"),
    given("case.rate", R),
    given("case.months", String(N)),
    ...INDEX.map((m, k) => given(`index.${k}`, m)),
    { id: "index.rise1", kind: "infl_change_percent", inputs: { old: "100", new: "100.3" }, value: plainNumber(changePercent("100", "100.3")) },

    // Prediction: the first payment when the index rose 0.3% in month 1.
    c,
    m1Payment,
    m1Index,

    // The start of the schedule: two payout days in November 2026.
    ...startFacts("early", "2026-11-10"),
    ...startFacts("late", "2026-11-20"),
    interim("early.interest", P, R, scheduleStart("2026-11-10").interimDays),
    interim("late.interest", P, R, scheduleStart("2026-11-20").interimDays),

    // Month by month.
    m1Opening,
    m1Interest,
    m1Principal,
    m1Closing,
    difference("m1.payment_extra", m1Payment, c),
    u1Interest,
    difference("u1.principal", c, u1Interest),
    u1Closing,
    difference("m1.gap", m1Closing, u1Closing),
    // The check: the unlinked balance after month 1, × 100.3 ÷ 100, is the linked balance.
    indexed("check.m1", v(u1Closing), "100", "100.3"),
    m2Index,
    m2Opening,
    m2Interest,
    m2Payment,
    m2Principal,
    m2Closing,
    m3Index,
    m3Opening,
    m3Interest,
    m3Payment,
    m3Principal,
    m3Closing,
    difference("m3.payment_fall", m2Payment, m3Payment),
    // The 1,200 ₪ is not paid at once: if the index stays at 100.3, all the payments' indexation parts add up to more.
    oncePaid,
    unlinkedPaid,
    onceExtra,
    onceIndexation,
    difference("once.interest_on", onceExtra, onceIndexation),
    schTotal("once.principal_total", once, "principal_paid"),

    // The illustration's guided tasks (2% a year, evenly; then 4%).
    schRow("slider.m1_payment", two, 1, "payment"),
    schRow("slider.m1_indexation", two, 1, "indexation"),
    schRow("slider.m120_payment", two, 120, "payment"),
    schRow("slider.m120_balance", two, 120, "closing"),
    schRow("slider.u120_balance", unlinked, 120, "closing"),
    // The illustration's monthly index step: the twelfth root of 1.02 (lesson 0.4), not 2% ÷ 12.
    { id: "slider.monthly_root", kind: "monthly_rate_from_effective", inputs: { effective_percent: "2", periods_per_year: 12, decimals: 3 }, value: roundedString(periodicRateFromEffective("2", 12), 3) },
    { id: "slider.monthly_div", kind: "monthly_rate_by_division", inputs: { annual_percent: "2", periods_per_year: 12, decimals: 3 }, value: roundedString(periodicRateByDivision("2", 12), 3) },
    schTotal("slider.indexation_120", two, "indexation", 120),
    schRow("slider.four_m60_balance", four, 60, "closing"),
    schRow("slider.four_m12_balance", four, 12, "closing"),

    // Worked example.
    given("worked.amount", "250000.00"),
    ...startFacts("worked", "2026-12-18"),
    { id: "worked.rise", kind: "infl_change_percent", inputs: { old: "100", new: "100.4" }, value: plainNumber(changePercent("100", "100.4")) },
    interim("worked.interim", W, WR, wStart.interimDays),
    wc,
    schRow("worked.indexation", worked, 1, "indexation"),
    schRow("worked.opening", worked, 1, "opening"),
    schRow("worked.interest", worked, 1, "interest"),
    wPay,
    difference("worked.payment_extra", wPay, wc),
    schRow("worked.principal", worked, 1, "principal_paid"),
    schRow("worked.closing", worked, 1, "closing"),

    // Half-worked table: the explanation's C, the index for payments 1–4.
    {
      id: "half.table",
      kind: "sch_half_linked",
      inputs: { payment: v(c), index_0: "100", index_1: "100.3", index_2: "100.5", index_3: "100.4", index_4: "100.6" },
      value: halfRows(v(c), ["100", "100.3", "100.5", "100.4", "100.6"]),
    },

    // Exercise 2: §17 — paid out on 16 March 2027 (and the 15th, for the error message).
    ...startFacts("ex2", "2027-03-16"),
    ...startFacts("ex2b", "2027-03-15"),
    // Exercise 3: payment C × M ÷ M₀ with a base index of 104.2.
    indexed("ex3.answer", "3100", "104.2", "105"),
    indexed("ex3.wrong_100", "3100", "100", "105"),
    // Exercise 4: the indexation added to 320,000 ₪ when the index rose from 100 to 100.4 in month 1.
    schRow("ex4.answer", ex4, 1, "indexation"),
    schRow("ex4.payment_extra", ex4, 1, "payment_indexation"),
    // Exercise 5: the first payment of that track: C × 100.4 ÷ 100.
    ex5c,
    schRow("ex5.answer", ex4, 1, "payment"),
    indexed("ex5.four_percent", v(ex5c), "100", "104"),
    // Exercise 6: interim interest, at 4% on 500,000 ₪, paid out on 19 January 2027.
    ...startFacts("ex6", "2027-01-19"),
    interim("ex6.answer", "500000", "4", scheduleStart("2027-01-19").interimDays),
    interim("ex6.from_first", "500000", "4", 18),
    given("ex6.from_first_days", "18"),
    interest("ex6.month", "500000", "4"),
    // Exercise 7: the balance after month 1 of the exercise-4 track.
    schRow("ex7.opening", ex4, 1, "opening"),
    schRow("ex7.interest", ex4, 1, "interest"),
    schRow("ex7.principal", ex4, 1, "principal_paid"),
    schRow("ex7.answer", ex4, 1, "closing"),
    balance("ex7.unlinked", "320000", "3.5", 240, 1),
  ];

  return {
    lesson: "3.5",
    title: "הצמדה לאורך ציר הזמן",
    note: "Teaching numbers: loans, rates, the index series and the inflation paths are illustrations, not forecasts. Schedules from src/lib/calc/schedule.ts (balance indexed every month before the payment, DEC-3), in statement rounding (every row in agorot). The §17 start rule and the interim period follow the team's transcription of Directive 451 in the Brain, not verified; interim interest by the day uses ÷ 365, the course's assumption.",
    facts,
  };
}
