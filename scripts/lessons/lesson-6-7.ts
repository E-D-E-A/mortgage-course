/**
 * Lesson 6.7 — negotiation: what is open, how a competing offer is used, and when to stop. Every number
 * the page, the exercises and the video show is declared here as a fact; the page reads
 * data/lessons/6-7.json and checks/kinds/outreach.py (and sensitivity.py, for the payments of a mix)
 * recompute every computed one.
 *
 * WHAT IS A RULE AND WHAT IS AN EXERCISE'S ASSUMPTION
 *   - What each round of the example moved (0.10 point on every track, then 0.05 on the fixed one), how
 *     long a round takes (3 business days) and how many days must stay after its answer (7), and the
 *     family's own line (a round that saves less than 10,000 ₪ over the loan's life is not worth the
 *     wait) are RULES OF THE EXERCISE. Nobody knows how much a bank moves in a second round, or whether
 *     it moves at all (Brain J-100, J-110).
 *   - The competing offer is a whole offer of another bank for the same mix, amount and date: the only
 *     kind of competing offer the course treats as comparable (lesson 5.3).
 *   - Banks, prices and dates are invented teaching data.
 */
import { BANK_PRICES, NEGOTIATION, requestedAt, ROUND_RULE } from "../../src/data/case-a-offers.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { applyEdit, bankClocks, roundAnswer, WINDOW_DAYS } from "../../src/lib/calc/outreach.ts";
import { addCalendarDays, CALENDAR_2026 } from "../../src/lib/calc/process.ts";
import type { Fact, LessonData } from "../build-data.ts";
import {
  clocksFact,
  daysUntilFact,
  difference,
  effectFact,
  given,
  mixFact,
  roundAnswerFact,
  roundFitsFact,
  stopFact,
} from "./_outreach-facts.ts";

const cal = CALENDAR_2026;
const { roundDays, reserve } = ROUND_RULE;
const scenario = SCENARIOS.base;
const addDays = (id: string, start: string, days: number): Fact => ({ id, kind: "proc_add_calendar_days", inputs: { start, days }, value: addCalendarDays(start, days) });

export default function lesson67(): LessonData {
  const mixA = requestedAt(NEGOTIATION.bank);
  const mixB = requestedAt(NEGOTIATION.competitor);
  const facts: Fact[] = [
    given("data_date", "2026-10-16"),
    given("round.days", roundDays),
    given("round.reserve", reserve),
    given("clock.window", WINDOW_DAYS),
    given("threshold", NEGOTIATION.threshold),
    given("case.loan", "1640000"),
    given("calendar.closed_2026", cal.closed.join(",")),
  ];

  // ── The state of the example: the same four requests as lesson 6.6, bank א׳'s clock ───────────────────
  const request = "2026-11-01";
  const today = "2026-11-09";
  const reqA = { name: "בנק א׳", requested: request, answeredAfter: 2, newLien: true };
  facts.push(given("state.request", request), given("state.today", today), clocksFact("state.approved", reqA, cal, "approved"), clocksFact("state.valid_until", reqA, cal, "valid_until"));
  const validUntil = bankClocks(reqA, cal).validUntil;
  facts.push(daysUntilFact("state.left", today, validUntil));

  // ── Two whole offers for the same mix: bank א׳ (where the family would like to stay) and bank ב׳ ───────
  const aFirst = mixFact("offer.a.first", { tracks: mixA, scenario }, "first");
  const bFirst = mixFact("offer.b.first", { tracks: mixB, scenario }, "first");
  const aTotal = mixFact("offer.a.total", { tracks: mixA, scenario }, "total");
  const bTotal = mixFact("offer.b.total", { tracks: mixB, scenario }, "total");
  facts.push(
    aFirst,
    bFirst,
    aTotal,
    bTotal,
    difference("gap.first", aFirst, bFirst),
    difference("gap.total", aTotal, bTotal),
    // The prices behind them, track by track: the family asked for prime, a variable unlinked track and a fixed unlinked one.
    given("price.a.prime", BANK_PRICES.a.prime),
    given("price.a.variable", BANK_PRICES.a.variable_unlinked),
    given("price.a.fixed", BANK_PRICES.a.fixed_unlinked),
    given("price.b.prime", BANK_PRICES.b.prime),
    given("price.b.variable", BANK_PRICES.b.variable_unlinked),
    given("price.b.fixed", BANK_PRICES.b.fixed_unlinked),
    given("price.c.prime", BANK_PRICES.c.prime),
  );

  // ── What a notch is worth, on bank א׳'s offer: 0.10 point off one track, and off all three ────────────
  const notch = "-0.10";
  facts.push(given("notch.points", "0.10"), given("notch.half", "0.05"));
  [1, 2, 3].forEach((k) => {
    facts.push(
      effectFact(`notch.t${k}.first`, mixA, scenario, { target: k, points: notch }, "first_gain"),
      effectFact(`notch.t${k}.total`, mixA, scenario, { target: k, points: notch }, "total_gain"),
      given(`notch.t${k}.amount`, mixA[k - 1].amount),
      given(`notch.t${k}.rate`, mixA[k - 1].rate),
    );
  });
  facts.push(
    effectFact("notch.all.first", mixA, scenario, { target: "all", points: notch }, "first_gain"),
    effectFact("notch.all.total", mixA, scenario, { target: "all", points: notch }, "total_gain"),
    effectFact("notch.half.first", mixA, scenario, { target: 3, points: "-0.05" }, "first_gain"),
    effectFact("notch.half.total", mixA, scenario, { target: 3, points: "-0.05" }, "total_gain"),
  );

  // ── Rounds: each bank answer arrives, the next round starts, and the clock runs ────────────────────────
  const [edit1, edit2] = NEGOTIATION.rounds;
  const mix1 = applyEdit(mixA, edit1);
  let at = today;
  for (let k = 1; k <= 3; k++) {
    facts.push(roundFitsFact(`round_${k}.fits`, at, validUntil, roundDays, reserve, cal), roundAnswerFact(`round_${k}.answer`, at, roundDays, cal));
    at = roundAnswer(at, roundDays, cal);
  }
  // A fourth round would start on round 3's answer day: it does not fit.
  facts.push(roundFitsFact("round_4.fits", at, validUntil, roundDays, reserve, cal), roundAnswerFact("round_4.answer", at, roundDays, cal));

  // Round 1: every track down by 0.10 point.
  const r1Before = effectFact("round_1.total_before", mixA, scenario, edit1, "total_before");
  const r1After = effectFact("round_1.total_after", mixA, scenario, edit1, "total_after");
  const r1Gain = difference("round_1.gain", r1Before, r1After);
  facts.push(
    given("round_1.points", String(edit1.points).replace("-", "")),
    effectFact("round_1.first_before", mixA, scenario, edit1, "first_before"),
    effectFact("round_1.first_after", mixA, scenario, edit1, "first_after"),
    r1Before,
    r1After,
    r1Gain,
    difference("round_1.vs_b", bTotal, r1After),
  );
  // Round 2: the fixed track down by another 0.05 point.
  const r2Before = effectFact("round_2.total_before", mix1, scenario, edit2, "total_before");
  const r2After = effectFact("round_2.total_after", mix1, scenario, edit2, "total_after");
  const r2Gain = difference("round_2.gain", r2Before, r2After);
  facts.push(given("round_2.points", String(edit2.points).replace("-", "")), r2Before, r2After, r2Gain, difference("round_2.vs_b", bTotal, r2After));
  // The rule of the exercise after each round.
  facts.push(
    stopFact("stop.after_1", true, r1Gain.value as string, NEGOTIATION.threshold),
    stopFact("stop.after_2", true, r2Gain.value as string, NEGOTIATION.threshold),
    stopFact("stop.late", false, r1Gain.value as string, NEGOTIATION.threshold),
  );
  // Slack: how many days remain after round 2's answer and the reserve.
  facts.push(
    daysUntilFact("slack.left", facts.find((f) => f.id === "round_2.answer")?.value as string, validUntil),
    addDays("slack.reserve_end", facts.find((f) => f.id === "round_2.answer")?.value as string, reserve),
  );
  facts.push(daysUntilFact("slack.answer", facts.find((f) => f.id === "slack.reserve_end")?.value as string, validUntil));

  return {
    lesson: "6.7",
    title: "משא ומתן",
    note: "The rounds' effects, the 3-business-day round, the 7 reserve days and the 10,000 ₪ line are the exercise's own rules, not how any bank acts. Banks, prices and dates are invented.",
    facts,
  };
}
