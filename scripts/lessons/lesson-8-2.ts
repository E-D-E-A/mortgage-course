/**
 * Lesson 8.2 — sum and mean (also the weighted mean). General maths on a mix of tracks. The mix is the synthetic case's candidate c05-like
 * shape in three kinds (50/30/20 of 1,640,000 ₪, rates of case A's price list); the "ratio trap" households are teaching inputs.
 * The weighted mean of a mix's rates is the average STARTING rate; it is not the price of the loan (terms, resets and payments differ).
 */
import { S8_CASE, loanOfChoice, BASE_CHOICE } from "../../src/data/case-s8.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given } from "./lesson-3-8.ts";
import { factPercent, mean, percentOf, prod, spitzer, total, wmean } from "./_stats-facts.ts";

export default function lesson82(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  void S8_CASE;

  // ── The mix: fixed unlinked 820,000 at 4.40; prime 492,000 at 4.60; variable unlinked 328,000 at 4.10. ──
  const amounts = ["820000", "492000", "328000"];
  const rates = ["4.40", "4.60", "4.10"];
  push(...amounts.map((a, k) => given(`m.a${k}`, a)), ...rates.map((r, k) => given(`m.r${k}`, r)));
  const loan = total("m.loan", amounts, 0);
  push(loan, given("m.loan_case", loanOfChoice(BASE_CHOICE).toString()));
  push(...amounts.map((a, k) => percentOf(`m.share${k}`, a, loan.value as string, 0)));
  push(mean("m.simple", rates, 2), mean("m.simple4", rates, 4), wmean("m.weighted", rates, amounts, 2), wmean("m.weighted3", rates, amounts, 3));
  // the products and their sum, the by-hand route
  const prods = amounts.map((a, k) => prod(`m.prod${k}`, a, rates[k], 0));
  push(...prods, total("m.prod_sum", prods.map((p) => p.value as string), 0));
  // the weights as shares (the same mean, weights 50, 30, 20)
  push(wmean("m.weighted_shares", rates, ["50", "30", "20"], 2));

  // ── Σ of three track payments (a sum of different things that add up). Spitzer, 360 months. ──
  const pays = amounts.map((a, k) => spitzer(`pay${k}`, a, rates[k], 360));
  push(...pays, total("pay.sum", pays.map((p) => p.value as string), 2));

  // ── The ratio trap: two households. ──
  push(given("h.inc1", "10000"), given("h.pay1", "3000"), given("h.inc2", "20000"), given("h.pay2", "10000"));
  push(percentOf("h.r1", "3000", "10000", 0), percentOf("h.r2", "10000", "20000", 0), mean("h.avg", ["30", "50"], 1));
  const incSum = total("h.inc_sum", ["10000", "20000"], 0);
  const paySum = total("h.pay_sum", ["3000", "10000"], 0);
  push(incSum, paySum, factPercent("h.overall", paySum, incSum, 1));

  // ── Exercises. ──
  push(mean("ex.mean", ["4.40", "4.30", "4.35", "4.55"], 2), wmean("ex.w", ["4.2", "4.8"], ["600000", "400000"], 2));
  push(percentOf("ex.ra", "2400", "8000", 0), percentOf("ex.rb", "16000", "32000", 0));
  const exInc = total("ex.inc", ["8000", "32000"], 0);
  const exPay = total("ex.pay", ["2400", "16000"], 0);
  push(exInc, exPay, factPercent("ex.overall", exPay, exInc, 1), mean("ex.avg", ["30", "50"], 1));
  push(wmean("ex.nine", ["4.0", "6.0"], ["900000", "100000"], 2), mean("ex.nine_simple", ["4.0", "6.0"], 2));
  push(wmean("ex.c05", ["4.40", "4.60"], ["50", "50"], 2));

  return { lesson: "8.2", title: "סכום וממוצע", note: "General maths; mix numbers are the synthetic case's, households are teaching inputs.", facts };
}
