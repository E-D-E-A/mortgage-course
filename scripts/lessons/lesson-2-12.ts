/**
 * Lesson 2.12 — stage 2's summary: the comparison table of the tracks. The
 * lesson computes little; its numbers are the yearly risk-in-shekels examples
 * (lesson 2.11's model, src/lib/calc/balance.ts) and three dated references.
 * The page reads data/lessons/2-12.json; checks/kinds/balance.py recomputes
 * every computed fact.
 *
 * Balances, rates and index rises are invented round teaching numbers
 * ("מספרים להמחשה"), not market data and not a forecast. The prime's addition
 * over the Bank of Israel rate is from a search summary of the Bank of Israel's
 * consumer page (as in lesson 0.10), not yet checked against the page itself;
 * the five-year update interval is only an example (the team's Brain, page
 * 67436545: the contract decides, and banks offer many intervals).
 */
import Decimal from "decimal.js";
import { indexationAdded, interestOnIndexation, rateChangeInterest } from "../../src/lib/calc/balance.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

const indexation = (id: string, balance: string, inflation: string): Fact => ({
  id,
  kind: "bal_indexation",
  inputs: { balance, inflation_percent: inflation },
  value: moneyString(indexationAdded(balance, inflation)),
});

const interestOnIdx = (id: string, balance: string, rate: string, inflation: string): Fact => ({
  id,
  kind: "bal_interest_on_indexation",
  inputs: { balance, rate_percent: rate, inflation_percent: inflation },
  value: moneyString(interestOnIndexation(balance, rate, inflation)),
});

const rateChange = (id: string, balance: string, oldRate: string, newRate: string): Fact => ({
  id,
  kind: "bal_rate_change_interest",
  inputs: { balance, old_rate_percent: oldRate, new_rate_percent: newRate },
  value: moneyString(rateChangeInterest(balance, oldRate, newRate)),
});

const sum = (id: string, ...addends: Fact[]): Fact => ({
  id,
  kind: "bal_sum",
  inputs: Object.fromEntries(addends.map((a, k) => [`addend_${k + 1}`, a.id])),
  value: moneyString(addends.reduce((s, a) => s.plus(a.value as string), new Decimal(0))),
});

export default function lesson212(): LessonData {
  // The worked example: 400,000 in each of three tracks, one year in which the
  // Bank of Israel raised its rate by one point (the prime with it) and the index rose 3%.
  const wIdx = indexation("worked.indexation", "400000", "3");
  const wOnIdx = interestOnIdx("worked.interest_on_indexation", "400000", "3", "3");
  const wBalance = given("worked.balance", "400000.00");

  // Exercise 7: 250,000 in a fixed indexed track, the index rose 4%.
  const e7Balance = given("ex7.balance", "250000.00");
  const e7Idx = indexation("ex7.answer", "250000", "4");

  const facts: Fact[] = [
    given("data_date", "2026-10-09"),
    // References, dated in the text: the prime is the Bank of Israel rate plus this many points (לא אומת).
    given("ref.prime_addition", "1.5"),
    // An example of the time between update points, in years; the contract decides.
    given("ref.reset_years", "5"),

    // Worked example.
    wBalance,
    rateChange("worked.prime_extra", "400000", "5", "6"),
    wIdx,
    wOnIdx,
    sum("worked.index_total", wIdx, wOnIdx),
    sum("worked.indexed_balance", wBalance, wIdx),

    // Exercise 6: 300,000 in a prime track; the Bank of Israel raised its rate by half a point.
    rateChange("ex6.answer", "300000", "4.5", "5"),
    rateChange("ex6.whole_point", "300000", "4.5", "5.5"),
    { id: "ex6.rate_as_share", kind: "bal_interest", inputs: { balance: "300000", rate_percent: "0.05", inflation_percent: "0" }, value: moneyString(new Decimal(300000).mul("0.0005")) },

    // Exercise 7.
    e7Balance,
    e7Idx,
    sum("ex7.new_balance", e7Balance, e7Idx),
  ];

  return {
    lesson: "2.12",
    title: "סיכום: טבלת המסלולים",
    note: "Invented teaching numbers in the worked example and exercises; the yearly model of lesson 2.11. The prime's addition and the update interval are dated references, not computed.",
    facts,
  };
}
