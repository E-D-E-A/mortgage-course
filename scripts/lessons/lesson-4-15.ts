/**
 * Lesson 4.15 — the workshop: the feasibility page of the main case (case A,
 * נועם ושירה), checked against the limits only. Every number the page, its
 * exercises, its feasibility sheet's tasks and its video show is a fact here;
 * the Python checks recompute each computed one (affordability.py, regulation.py,
 * ltv.py, amortization.py, household.py, metrics.py, common.py).
 *
 * All the arithmetic is src/lib/calc/affordability.ts (lesson 4.1–4.3) and
 * regulation.ts (4.4–4.6), through the fact builders of
 * affordability-facts.ts and regulation-facts.ts: nothing is computed twice.
 *
 * Case A appears with the numbers of the course map only: price 2,200,000 ₪,
 * equity 560,000 ₪ (of which a gift of 200,000), incomes 12,400 and 9,300 net,
 * a car loan of 1,450 ₪ for another 26 months. It has NO track, mix or offer:
 * those come in stages 5 and 6. Where a payment has to become a loan, the page
 * uses the course's calculation assumption (a rate and a term, written as such,
 * not an offer): the loan a payment would carry, C × S (lesson 3.1).
 * The 40.4% of stage 5's first mix does not appear. Every other household is invented.
 */
import Decimal from "decimal.js";
import { paymentsValueToday } from "../../src/lib/calc/amortization.ts";
import type { Obligation } from "../../src/lib/calc/affordability.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, disposable, given as givenRaw, sum, untilDrop } from "./affordability-facts.ts";
import { given as givenMoney, ltv, maxLoan, maxPayment, maxVar, minFix, months } from "./regulation-facts.ts";

const CAR: Obligation = { kind: "loan", monthly: "1450", monthsLeft: 26 };

/** The loan a monthly payment would carry at a rate for a number of months (lesson 3.1's C × S). */
const carried = (id: string, payment: Fact, rate: string, n: number): Fact => ({
  id,
  kind: "amort_payments_value_today",
  inputs: { payment: payment.value as string, rate_percent: rate, months: n },
  value: moneyString(paymentsValueToday(payment.value as string, rate, n)),
});

const times = (id: string, of: Fact, count: number): Fact => ({
  id,
  kind: "met_times",
  inputs: { of: of.id, count },
  value: moneyString(new Decimal(of.value as string).mul(count)),
});

/** ltv_min_value: the least value at which a loan stays within a ceiling, loan × 100 ÷ ceiling. */
const minValue = (id: string, loan: Fact, ceiling: string): Fact => ({
  id,
  kind: "ltv_min_value",
  inputs: { loan: loan.value as string, ceiling },
  value: moneyString(new Decimal(loan.value as string).mul(100).div(ceiling)),
});

export const RATES = ["4", "4.5", "5"] as const;
const TERM_MONTHS = 360;

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  // ── Case A, as the course map gives it ──
  const price = add(givenMoney("a.price", "2200000"));
  const equity = add(givenMoney("a.equity", "560000"));
  const gift = add(givenMoney("a.gift", "200000"));
  const own = add(difference("a.own", equity, gift));
  const loan = add(difference("a.loan", price, equity));
  const inc1 = add(givenMoney("a.income_1", "12400"));
  const inc2 = add(givenMoney("a.income_2", "9300"));
  const recognised = add(sum("a.recognised", ["12400", "9300"]));
  add(givenMoney("a.car_payment", "1450"));
  add(givenRaw("a.car_months", 26));
  void inc1;
  void inc2;

  // ── The income side: the 18-month rule on the car loan ──
  const dispNow = add(disposable("a.disposable_now", recognised.value as string, [CAR]));
  add(untilDrop("a.until_drop", 26));
  const dispAfter = add(disposable("a.disposable_after", recognised.value as string, []));
  const max50 = add(maxPayment("a.max50", dispNow.value as string, "50"));
  const max40 = add(maxPayment("a.max40", dispNow.value as string, "40"));
  add(maxPayment("a.max50_after", dispAfter.value as string, "50"));
  const max40After = add(maxPayment("a.max40_after", dispAfter.value as string, "40"));

  // ── The financing ratio ──
  add(ltv("a.ltv", loan.value as string, price.value as string));
  const cap = add(maxLoan("a.max_loan", price.value as string, "only_home"));
  add(difference("a.ltv_room", cap, loan));
  const minVal = add(minValue("a.min_value", loan, "75"));
  add(difference("a.value_slack", price, minVal));
  const low = add(givenMoney("a.low_value", "2150000"));
  add(ltv("a.ltv_low", loan.value as string, low.value as string));
  const lowCap = add(maxLoan("a.max_loan_low", low.value as string, "only_home"));
  add(difference("a.low_short", loan, lowCap));

  // ── The structure the later stages must respect ──
  add(maxVar("a.max_variable", loan.value as string));
  add(minFix("a.min_fixed", loan.value as string));
  add(months("a.max_months", 30));

  // ── The loan a payment would carry (the course's assumption: a rate, 30 years) ──
  add(givenRaw("assume.months", TERM_MONTHS));
  for (const r of RATES) {
    const k = r.replace(".", "_");
    add(givenRaw(`assume.rate_${k}`, r));
    const c40 = add(carried(`a.carry40_${k}`, max40, r, TERM_MONTHS));
    const c50 = add(carried(`a.carry50_${k}`, max50, r, TERM_MONTHS));
    add(difference(`a.gap40_${k}`, c40, loan));
    if (r === "4.5") add(difference("a.short40_4_5", loan, c40));
    add(difference(`a.gap50_${k}`, c50, loan));
  }

  // The same 40% line after the car loan stops counting, at the middle assumption.
  const c40After = add(carried("a.carry40_after_4_5", max40After, "4.5", TERM_MONTHS));
  add(difference("a.gap40_after_4_5", c40After, loan));
  const c40After5 = add(carried("a.carry40_after_5", max40After, "5", TERM_MONTHS));
  add(difference("a.gap40_after_5", c40After5, loan));

  // ── The worked example: רונית ואלון (invented) ──
  const wPrice = add(givenMoney("w.price", "1500000"));
  const wEquity = add(givenMoney("w.equity", "400000"));
  const wLoan = add(difference("w.loan", wPrice, wEquity));
  const wRec = add(sum("w.recognised", ["9000", "7000"]));
  add(givenMoney("w.car_payment", "900"));
  add(givenRaw("w.car_months", 10));
  const wCar: Obligation = { kind: "loan", monthly: "900", monthsLeft: 10 };
  const wDisp = add(disposable("w.disposable", wRec.value as string, [wCar]));
  const w50 = add(maxPayment("w.max50", wDisp.value as string, "50"));
  const w40 = add(maxPayment("w.max40", wDisp.value as string, "40"));
  add(ltv("w.ltv", wLoan.value as string, wPrice.value as string));
  const wCap = add(maxLoan("w.max_loan", wPrice.value as string, "only_home"));
  add(difference("w.ltv_room", wCap, wLoan));
  const w40c = add(carried("w.carry40", w40, "4.5", TERM_MONTHS));
  add(carried("w.carry50", w50, "4.5", TERM_MONTHS));
  add(difference("w.gap40", w40c, wLoan));

  // ── Exercises ──
  // 1: recognised income is a2's sum (a.recognised). 2: disposable (a.disposable_now); errors:
  add(sum("ex2.err_added", ["21700", "1450"])); // the car loan added instead of deducted
  // 3: months until the car loan stops counting (a.until_drop); errors: all the months left (a.car_months),
  // one payment too many (the loan counts while MORE than 18 are left), and the threshold itself.
  add(givenRaw("ex3.err_one_more", 9));
  add(givenRaw("ex3.err_threshold", 18));
  // 4: the 40% line's payment (a.max40); errors: the 50% line (a.max50), and the 40% of the income after the drop (a.max40_after).
  // 6: the financing ratio at a lower appraisal (a.ltv_low); error: the ratio at the price (a.ltv).
  // 7: the loan 8,100 carries at 4.5% for 360 months (a.carry40_4_5); error: the payments added without discounting.
  add(times("ex7.err_sum", max40, TERM_MONTHS));

  return {
    lesson: "4.15",
    title: "סדנה: דף ההיתכנות של התיק המרכזי",
    note: "Case A with the course map's numbers only; no track, mix or offer. Rates of 4%, 4.5% and 5% over 360 months are the course's calculation assumption, not offers. Household of the worked example invented.",
    facts,
  };
}
