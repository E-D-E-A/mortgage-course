/**
 * Lesson 2.1 — the Bank of Israel rate, prime, anchor and spread. Every number
 * the lesson, its exercises, its illustration's tasks and its video show is
 * declared here as a fact; the page and the video read data/lessons/2-1.json,
 * and checks/kinds/tracks.py recomputes each computed one.
 *
 * Data, not teaching numbers: the Bank of Israel rate 3.25% (decided
 * 2026-09-01, in force from 2026-09-03) and the next decision on 2026-10-21,
 * from search-index summaries of Bank of Israel releases and the team's check
 * recorded in the Brain (research/notes/official-sources.md §6; Brain 67469313),
 * NOT read from the releases. Prime = that rate + 1.5 points is arithmetic on a
 * consumer explainer read through a search summary; the Brain (7831553) gives a
 * different source for the 1.5. Every spread, cut and loan amount is an
 * invented teaching number.
 */
import Decimal from "decimal.js";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  PRIME_ADDITION,
  monthInterest,
  monthlyByDivision,
  primeRate,
  primeTrackRate,
  rateFromAnchor,
  spreadFromRate,
} from "../../src/lib/calc/tracks.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

const prime = (id: string, policy: string): Fact => ({
  id,
  kind: "trk_prime",
  inputs: { policy, addition: PRIME_ADDITION },
  value: plainNumber(primeRate(policy)),
});

const track = (id: string, policy: string, spread: string): Fact => ({
  id,
  kind: "trk_prime_track",
  inputs: { policy, addition: PRIME_ADDITION, spread },
  value: plainNumber(primeTrackRate(policy, spread)),
});

/** anchor + spread (also used to move a rate by a number of points). */
const fromAnchor = (id: string, anchor: string, spread: string): Fact => ({
  id,
  kind: "trk_rate",
  inputs: { anchor, spread },
  value: plainNumber(rateFromAnchor(anchor, spread)),
});

/** rate − anchor, in points. */
const spreadOf = (id: string, rate: string, anchor: string): Fact => ({
  id,
  kind: "trk_spread",
  inputs: { rate, anchor },
  value: plainNumber(spreadFromRate(rate, anchor)),
});

const monthInt = (id: string, balance: string, rate: string): Fact => ({
  id,
  kind: "trk_month_interest",
  inputs: { balance, rate },
  value: moneyString(monthInterest(balance, rate)),
});

const monthly = (id: string, annual: string, decimals: number): Fact => ({
  id,
  kind: "trk_monthly",
  inputs: { annual, decimals },
  value: monthlyByDivision(annual).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toString(),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

/** The half-worked table: each row's Bank of Israel rate and spread, and the prime and track rate they give. */
const layersTable = (id: string, rows: [policy: string, spread: string][]): Fact => ({
  id,
  kind: "trk_layers_table",
  inputs: { addition: PRIME_ADDITION, ...Object.fromEntries(rows.flatMap(([p, s], n) => [[`policy_${n + 1}`, p], [`spread_${n + 1}`, s]])) },
  value: rows.map(([p, s], n) => ({
    period: n + 1,
    policy: plainNumber(p),
    prime: plainNumber(primeRate(p)),
    spread: plainNumber(s),
    rate: plainNumber(primeTrackRate(p, s)),
  })),
});

export default function lesson21(): LessonData {
  const BOI = "3.25";
  const SPREAD = "-0.8";

  // The worked example: a 600,000 ₪ track of case A at prime − 0.8, and the same after a 0.25-point cut.
  const wNow = monthInt("worked.month_interest", "600000", plainNumber(primeTrackRate(BOI, SPREAD)));
  const wCut = monthInt("worked.month_interest_cut", "600000", plainNumber(primeTrackRate("3", SPREAD)));

  const facts: Fact[] = [
    // Official data as of 2026-10-09 (לא אומת).
    given("boi.rate", BOI),
    given("boi.announced", "2026-09-01"),
    given("boi.effective", "2026-09-03"),
    given("boi.next", "2026-10-21"),
    given("data.date", "2026-10-09"),
    given("prime.addition", PRIME_ADDITION),
    prime("prime.current", BOI),
    // The explainer's own example (search summary): a 1% rate gives a 2.5% prime.
    given("src.example_boi", "1"),
    prime("src.example_prime", "1"),

    // The example track: prime − 0.8 (a teaching spread).
    given("spread.example", SPREAD),
    given("spread.below", "0.8"),
    track("track.example", BOI, SPREAD),
    // How far above the Bank of Israel rate the track sits: 1.5 − 0.8.
    spreadOf("track.over_boi", plainNumber(primeTrackRate(BOI, SPREAD)), BOI),

    // Prediction and the cut scenario: a 0.25-point cut (a thought experiment, not a forecast).
    given("cut.size", "0.25"),
    { id: "pred.both", kind: "trk_points_sum", inputs: { a: "0.25", b: "0.8" }, value: plainNumber(new Decimal("0.25").plus("0.8")) },
    fromAnchor("boi.after_cut", BOI, "-0.25"),
    prime("prime.after_cut", "3"),
    track("track.after_cut", "3", SPREAD),
    spreadOf("track.cut_change", plainNumber(primeTrackRate("3", SPREAD)), plainNumber(primeTrackRate(BOI, SPREAD))),

    // Another anchor (a teaching number): an anchor of 3.5% and a spread of +1.
    given("anchor.other", "3.5"),
    given("spread.other", "1"),
    fromAnchor("rate.other", "3.5", "1"),

    // The illustration's tasks.
    given("slider.spread", "-0.5"),
    track("slider.rate", BOI, "-0.5"),
    given("slider.boi_two_cuts", "2.75"),
    spreadOf("slider.boi_drop", BOI, "2.75"),
    prime("slider.prime_two_cuts", "2.75"),
    track("slider.rate_two_cuts", "2.75", "-0.5"),
    spreadOf("slider.at_boi_spread", BOI, plainNumber(primeRate(BOI))),

    // Worked example (case A).
    given("worked.amount", "600000"),
    monthly("worked.monthly_rate", plainNumber(primeTrackRate(BOI, SPREAD)), 4),
    wNow,
    wCut,
    difference("worked.month_saving", wNow, wCut),

    // Half-worked table.
    layersTable("half.table", [
      [BOI, SPREAD],
      ["2.75", SPREAD],
      ["4", "-0.5"],
      ["3.5", "-0.7"],
    ]),

    // Exercise 2: prime − 0.6, as of the data date.
    given("ex2.spread", "-0.6"),
    track("ex2.answer", BOI, "-0.6"),
    track("ex2.added", BOI, "0.6"),
    fromAnchor("ex2.on_boi", BOI, "-0.6"),

    // Exercise 3: the same track after a 0.5-point rise (thought experiment).
    fromAnchor("ex3.boi", BOI, "0.5"),
    track("ex3.answer", "3.75", "-0.6"),
    prime("ex3.prime", "3.75"),
    track("ex3.down", "2.75", "-0.6"),

    // Exercise 4: a track at 4.2% when prime is 4.75%.
    given("ex4.rate", "4.2"),
    spreadOf("ex4.answer", plainNumber(primeRate(BOI)), "4.2"),
    spreadOf("ex4.signed", "4.2", plainNumber(primeRate(BOI))),
    spreadOf("ex4.vs_boi", "4.2", BOI),

    // Exercise 5: a contract signed when the Bank of Israel rate was 4.5% (invented), prime − 0.5.
    given("ex5.boi_then", "4.5"),
    given("ex5.spread", "-0.5"),
    prime("ex5.prime_then", "4.5"),
    track("ex5.rate_then", "4.5", "-0.5"),
    spreadOf("ex5.wrong_spread", plainNumber(primeTrackRate("4.5", "-0.5")), plainNumber(primeRate(BOI))),
    track("ex5.answer", BOI, "-0.5"),
    fromAnchor("ex5.on_boi", BOI, "-0.5"),

    // Exercise 6: a monthly interest change on 480,000 ₪ when the rate rises 0.25 points.
    given("ex6.balance", "480000"),
    monthInt("ex6.answer", "480000", "0.25"),
    { id: "ex6.year", kind: "trk_year_interest", inputs: { balance: "480000", rate: "0.25" }, value: moneyString(new Decimal("480000").mul("0.25").div(100)) },
    monthInt("ex6.spread_mix", "480000", "0.8"),
  ];

  return {
    lesson: "2.1",
    title: "ריבית בנק ישראל, פריים, עוגן ומרווח",
    note: "The Bank of Israel rate and dates are search-index summaries and the team's Brain record (official-sources.md §6; Brain 67469313), as of 2026-10-09, not read from the releases. Prime = rate + 1.5 is arithmetic. Spreads, cuts and amounts are invented teaching numbers.",
    facts,
  };
}
