import { describe, expect, it } from "vitest";
import {
  applyEdit,
  bankClocks,
  daysUntil,
  effectOf,
  eventsInside,
  firstYearMargin,
  governingIndex,
  latestRoundStart,
  roundAnswer,
  roundFits,
  roundsThatFit,
  runRounds,
  simpleMonthly,
  stopReason,
  validityDays,
} from "./outreach.ts";
import { CALENDAR_2026 } from "./process.ts";
import type { TrackSpec } from "./schedule.ts";
import { scenarioFrom } from "./sensitivity.ts";

const cal = CALENDAR_2026;
// Sunday 1 November 2026 is a business day for the banks (Israel's week starts on Sunday); Saturday never is.
const request = "2026-11-01";

describe("the clock of one bank", () => {
  it("runs the validity from that bank's own approval", () => {
    // 2 business days after Sun 1 Nov: Mon 2 = 1, Tue 3 = 2. Then 24 calendar days: 3 Nov + 24 = 27 Nov (by hand).
    const a = bankClocks({ name: "א", requested: request, answeredAfter: 2, newLien: true }, cal);
    expect(a.approved).toBe("2026-11-03");
    expect(a.validUntil).toBe("2026-11-27");
    // A slower bank's own clock starts later: 7 business days = Mon 9 Nov (Sat 7 is skipped), so 9 Nov + 24 = 3 Dec.
    const d = bankClocks({ name: "ד", requested: request, answeredAfter: 7, extended: true, newLien: true }, cal);
    expect(d.approved).toBe("2026-11-09");
    expect(d.validUntil).toBe("2026-12-03");
  });

  it("gives 12 days with no new lien, and 24 with one", () => {
    expect(validityDays(true)).toBe(24);
    expect(validityDays(false)).toBe(12);
    // Thu 5 Nov + 12 = Tue 17 Nov.
    const b = bankClocks({ name: "ב", requested: request, answeredAfter: 4, newLien: false }, cal);
    expect(b.approved).toBe("2026-11-05");
    expect(b.validUntil).toBe("2026-11-17");
  });

  it("counts the last day to answer in business days: 5, or 7 for an extended type", () => {
    const a = bankClocks({ name: "א", requested: request, answeredAfter: 1, newLien: true }, cal);
    expect(a.answerBy).toBe("2026-11-06"); // Mon, Tue, Wed, Thu, Fri
    const d = bankClocks({ name: "ד", requested: request, answeredAfter: 1, extended: true, newLien: true }, cal);
    expect(d.answerBy).toBe("2026-11-09");
  });

  it("refuses an answer slower than the limit, or faster than a day", () => {
    expect(() => bankClocks({ name: "א", requested: request, answeredAfter: 6, newLien: true }, cal)).toThrow(RangeError);
    expect(() => bankClocks({ name: "א", requested: request, answeredAfter: 8, extended: true, newLien: true }, cal)).toThrow(RangeError);
    expect(() => bankClocks({ name: "א", requested: request, answeredAfter: 0, newLien: true }, cal)).toThrow(RangeError);
  });

  it("finds the bank whose terms end first, not the one that answered first", () => {
    const a = bankClocks({ name: "א", requested: request, answeredAfter: 2, newLien: true }, cal); // ends 27 Nov
    const b = bankClocks({ name: "ב", requested: request, answeredAfter: 4, newLien: false }, cal); // ends 17 Nov
    const c = bankClocks({ name: "ג", requested: request, answeredAfter: 5, newLien: true }, cal); // ends 30 Nov
    expect(governingIndex([a, b, c])).toBe(1);
    expect(governingIndex([a, c])).toBe(0);
    // A tie goes to the first.
    expect(governingIndex([a, { ...a, name: "ה" }])).toBe(0);
    expect(() => governingIndex([])).toThrow(RangeError);
  });

  it("counts the days left, negative once the terms ended", () => {
    expect(daysUntil("2026-11-09", "2026-11-27")).toBe(18);
    expect(daysUntil("2026-11-27", "2026-11-27")).toBe(0);
    expect(daysUntil("2026-11-30", "2026-11-27")).toBe(-3);
  });

  it("lists the dates that fall in the window, both ends included", () => {
    expect(eventsInside(["2026-10-21", "2026-11-23"], "2026-11-09", "2026-11-27")).toEqual(["2026-11-23"]);
    expect(eventsInside(["2026-11-09", "2026-11-27"], "2026-11-09", "2026-11-27")).toHaveLength(2);
  });
});

describe("rounds against the clock", () => {
  it("answers a round in business days: Fri and Sun count, Saturday does not", () => {
    expect(roundAnswer("2026-11-09", 3, cal)).toBe("2026-11-12"); // Tue, Wed, Thu
    expect(roundAnswer("2026-11-12", 3, cal)).toBe("2026-11-16"); // Fri, (Sat skipped) Sun, Mon
  });

  it("fits when the answer plus the reserve is not after the last day", () => {
    // Answer 20 Nov + 7 = 27 Nov: fits a 27 Nov end. A start one day later answers 22 Nov (Sat skipped) and does not fit.
    expect(roundFits("2026-11-17", "2026-11-27", 3, 7, cal)).toBe(true);
    expect(roundFits("2026-11-18", "2026-11-27", 3, 7, cal)).toBe(false);
  });

  it("runs the rounds one after another and stops when one no longer fits", () => {
    const rounds = roundsThatFit("2026-11-09", "2026-11-27", 3, 7, cal);
    expect(rounds.map((r) => r.answer)).toEqual(["2026-11-12", "2026-11-16", "2026-11-19"]);
    expect(rounds.map((r) => r.start)).toEqual(["2026-11-09", "2026-11-12", "2026-11-16"]);
    // Without a reserve, one more fits (answer 23 Nov, then a fifth would answer 26 Nov... checked by hand below).
    const noReserve = roundsThatFit("2026-11-09", "2026-11-27", 3, 0, cal);
    expect(noReserve.map((r) => r.answer)).toEqual(["2026-11-12", "2026-11-16", "2026-11-19", "2026-11-23", "2026-11-26"]);
  });

  it("finds the latest day a round can start", () => {
    expect(latestRoundStart("2026-11-27", 3, 7, "2026-11-09", cal)).toBe("2026-11-17");
    // With no reserve: starting 24 Nov answers 27 Nov; starting 25 Nov answers Sun 29 Nov.
    expect(latestRoundStart("2026-11-27", 3, 0, "2026-11-09", cal)).toBe("2026-11-24");
    // Nothing fits when the end is too close.
    expect(latestRoundStart("2026-11-10", 3, 7, "2026-11-09", cal)).toBeNull();
  });
});

describe("a rate that moves", () => {
  // 546,000 at 4.60% for 360 months; the payment's formula: P·m / (1 − (1+m)^−n), m = 0.046 / 12. Checked in Python: 2,799.04.
  const prime: TrackSpec = { kind: "prime", amount: "546000", rate: "4.60", months: 360 };
  const fixed: TrackSpec = { kind: "fixed_unlinked", amount: "547000", rate: "4.40", months: 360 };
  const scenario = scenarioFrom({ inflation: "2", primeShift: "0", anchorShift: "0" });

  it("changes only the tracks the edit names", () => {
    const moved = applyEdit([prime, fixed], { target: "prime", points: "0.25" });
    expect(moved[0].rate).toBe("4.85");
    expect(moved[1].rate).toBe("4.40");
    expect(applyEdit([prime, fixed], { target: 2, points: "-0.10" })[1].rate).toBe("4.3");
    expect(applyEdit([prime, fixed], { target: "all", points: "0.10" }).map((t) => t.rate)).toEqual(["4.7", "4.5"]);
    expect(() => applyEdit([prime], { target: 2, points: "0.1" })).toThrow(RangeError);
    expect(() => applyEdit([prime], { target: "all", points: "-5" })).toThrow(RangeError);
  });

  it("reads the quarter-point on the prime track in shekels", () => {
    // Python Decimal: 546,000 over 360 months at 4.85% pays 2,881.1974 against 2,799.0383 at 4.60%: +82.16.
    const e = effectOf([prime], scenario, { target: "prime", points: "0.25" });
    expect(e.deltaFirst.toFixed(2)).toBe("82.16");
    expect(e.before.first.toFixed(2)).toBe("2799.04");
    // The total is about the payment's change times 360 (29,577 in the facts), to the statement's rounding.
    expect(e.deltaTotal.toNumber()).toBeGreaterThan(29570);
    expect(e.deltaTotal.toNumber()).toBeLessThan(29585);
  });

  it("is negative when the rate falls, and zero when nothing moves", () => {
    expect(effectOf([prime], scenario, { target: "prime", points: "-0.25" }).deltaFirst.isNegative()).toBe(true);
    expect(effectOf([prime, fixed], scenario, { target: "fixed_linked", points: "1" }).deltaFirst.isZero()).toBe(true);
  });

  it("keeps the rule of thumb apart from the payment's change", () => {
    // 546,000 × 0.25 ÷ 100 ÷ 12 = 113.75: interest on the balance for a month, more than the payment's 82.16.
    expect(simpleMonthly("546000", "0.25").toFixed(2)).toBe("113.75");
  });
});

describe("when to stop", () => {
  it("checks the time first, then the size of the last gain", () => {
    expect(stopReason(false, "50000", "10000")).toBe("time");
    expect(stopReason(true, "5832", "10000")).toBe("small_gain");
    expect(stopReason(true, "10000", "10000")).toBe("continue");
    expect(stopReason(true, "34909.6", "10000")).toBe("continue");
  });
});

describe("a bank's view (a toy with invented costs)", () => {
  const costs = { prime: "4.40", variable_unlinked: "3.70", fixed_unlinked: "3.75", fixed_linked: "2.45", variable_linked: "2.15" } as const;
  it("adds up amount × (rate − cost) ÷ 100", () => {
    // 546,000 × (4.70 − 4.40) = 1,638; 547,000 × (4.00 − 3.70) = 1,641; 547,000 × (4.30 − 3.75) = 3,008.5 (all ÷ 100 × 100): 6,287.50 by hand.
    const tracks: TrackSpec[] = [
      { kind: "prime", amount: "546000", rate: "4.70", months: 360 },
      { kind: "variable_unlinked", amount: "547000", rate: "4.00", months: 360 },
      { kind: "fixed_unlinked", amount: "547000", rate: "4.30", months: 360 },
    ];
    expect(firstYearMargin(tracks, costs).toFixed(2)).toBe("6287.50");
  });
});

describe("a whole negotiation", () => {
  const cal2 = CALENDAR_2026;
  const sc = scenarioFrom({ inflation: "2", primeShift: "0", anchorShift: "0" });
  const mix: TrackSpec[] = [
    { kind: "prime", amount: "546000", rate: "4.60", months: 360 },
    { kind: "variable_unlinked", amount: "547000", rate: "4.10", months: 360 },
    { kind: "fixed_unlinked", amount: "547000", rate: "4.40", months: 360 },
  ];

  it("takes points off the rates, round after round, and advises", () => {
    const rows = runRounds(
      mix,
      sc,
      [
        { target: "all", points: "0.10" },
        { target: "fixed_unlinked", points: "0.05" },
      ],
      "2026-11-09",
      "2026-11-27",
      3,
      7,
      "10000",
      cal2,
    );
    // The same numbers as the facts of lesson 6.7 (rechecked in Python by checks/kinds/outreach.py).
    expect(rows[0].gainTotal.toFixed(2)).toBe("34696.77");
    expect(rows[0].totalAfter.toFixed(2)).toBe("2910567.57");
    expect(rows[0].advice).toBe("continue");
    expect(rows[1].gainTotal.toFixed(2)).toBe("5771.22");
    expect(rows[1].totalAfter.toFixed(2)).toBe("2904796.35");
    expect(rows[1].advice).toBe("small_gain");
    expect(rows[0].start).toBe("2026-11-09");
    expect(rows[1].start).toBe(rows[0].answer);
    expect(rows[1].tracksAfter[2].rate).toBe("4.25");
  });

  it("gives no offer for a round that does not fit, and leaves the mix as it was", () => {
    const rows = runRounds(mix, sc, [{ target: "all", points: "0.10" }], "2026-11-23", "2026-11-27", 3, 7, "10000", cal2);
    expect(rows[0].fits).toBe(false);
    expect(rows[0].gainTotal.isZero()).toBe(true);
    expect(rows[0].tracksAfter.map((t) => t.rate)).toEqual(["4.60", "4.10", "4.40"]);
    expect(rows[0].advice).toBe("time");
  });
});
