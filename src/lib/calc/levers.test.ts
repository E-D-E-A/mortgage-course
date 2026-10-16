import { describe, expect, it } from "vitest";
import { CASE_A_POSITION, CAR_PAYOFF, EQUITY_STEP, TARGET_RATIO } from "../../data/case-a-levers.ts";
import { type PositionCase, applyMove, perPoint, positionOf, pull, smallestEquityStep } from "./levers.ts";
import type { TrackSpec } from "./schedule.ts";

const FLAT = { inflation: "0", primeShift: "0", anchorShift: "0" };
const one = (months: number, amount = "1000000"): TrackSpec => ({ kind: "fixed_unlinked", amount, rate: "5", months });
// A single fixed track: 1,000,000 at 5% for 25 years pays 5,845.90 a month; for 30 years, 5,368.22 (the standard level-payment values).
const MINI: PositionCase = {
  deal: "only_home",
  price: "1250000",
  equity: "250000",
  reserve: "50000",
  tracks: [one(300)],
  base: FLAT,
  stress: FLAT,
  incomes: ["20000"],
  obligations: [],
};

describe("positionOf — a plain case, by hand", () => {
  const p = positionOf(MINI);
  it("the loan, the financing ratio and the payment", () => {
    expect(p.loan.toString()).toBe("1000000");
    expect(p.ltv.toString()).toBe("80"); // 1,000,000 ÷ 1,250,000
    expect(p.first.toFixed(2)).toBe("5845.90");
    expect(p.qualifying.toFixed(2)).toBe("5845.90");
  });
  it("the ratio is the payment over the income (nothing to deduct)", () => {
    expect(p.disposable.toString()).toBe("20000");
    expect(p.ratio.toFixed(2)).toBe("29.23"); // 5,845.90 ÷ 20,000
    expect(p.aboveCapital).toBe(false);
  });
  it("the total is 300 payments of the level payment, within the agorot of rounding", () => {
    expect(p.total.toNumber()).toBeCloseTo(300 * 5845.90, -1);
    expect(p.months).toBe(300);
  });
  it("a loan above the ceiling is a ban, named; the capital threshold is not", () => {
    expect(p.bans).toEqual(["ltv"]); // 80% > 75%
  });
  it("refuses tracks that do not add up to price minus equity", () => {
    expect(() => positionOf({ ...MINI, tracks: [one(300, "900000")] })).toThrow(RangeError);
  });
});

describe("the term lever — the textbook trade", () => {
  const price = pull({ ...MINI, equity: "400000", tracks: [one(300, "850000")] }, { lever: "term", months: 60 });
  it("a longer term lowers the payment and raises what is paid in all", () => {
    expect(price.after.first.toNumber()).toBeLessThan(price.before.first.toNumber());
    expect(price.gain.paymentMonthly.toNumber()).toBeGreaterThan(0);
    expect(price.cost.extraTotal.toNumber()).toBeGreaterThan(0);
    expect(price.gain.ratioPoints.toNumber()).toBeGreaterThan(0);
  });
  it("matches the level payments by hand: 1,000,000 at 5%, 25 years against 30", () => {
    const p = pull(MINI, { lever: "term", months: 60 });
    expect(p.after.first.toFixed(2)).toBe("5368.22");
    expect(p.gain.paymentMonthly.toFixed(2)).toBe("477.68"); // 5,845.90 − 5,368.22
    expect(p.cost.extraTotal.toNumber()).toBeCloseTo(360 * 5368.22 - 300 * 5845.90, -1); // 178,882.2
  });
  it("a shorter term is the same lever the other way: the ratio rises, the total falls", () => {
    const p = pull(MINI, { lever: "term", months: -60 });
    expect(p.gain.ratioPoints.toNumber()).toBeLessThan(0);
    expect(p.cost.extraTotal.toNumber()).toBeLessThan(0);
  });
  it("above 30 years it crosses a ban", () => {
    const p = pull({ ...MINI, equity: "400000", tracks: [one(360, "850000")] }, { lever: "term", months: 60 });
    expect(p.newBans).toEqual(["term"]);
    expect(p.allowed).toBe(false);
  });
});

describe("case A — the starting point", () => {
  const p = positionOf(CASE_A_POSITION);
  it("is the case of stage 5: 74.55% financing, a ratio just over 40%", () => {
    expect(p.loan.toString()).toBe("1640000");
    expect(p.ltv.toFixed(2)).toBe("74.55"); // 1,640,000 ÷ 2,200,000
    expect(p.disposable.toString()).toBe("20250"); // 21,700 − 1,450
    expect(p.ratio.toFixed(2)).toBe("40.40");
    expect(p.aboveCapital).toBe(true);
    expect(p.bans).toEqual([]);
  });
  it("the ratio is the qualifying payment over the disposable income", () => {
    expect(p.qualifying.div(p.disposable).mul(100).toFixed(4)).toBe(p.ratio.toFixed(4));
  });
});

describe("case A — more equity", () => {
  const eq = (add: string) => pull(CASE_A_POSITION, { lever: "equity", add });
  it("takes the same amount from the reserve and the loan", () => {
    const p = eq("17000");
    expect(p.after.loan.toString()).toBe("1623000");
    expect(p.cost.reserveAfter.toString()).toBe("23000");
    expect(p.cost.cashNow.toString()).toBe("17000");
  });
  it("brings the ratio to just under 40%: 17,000 does, 16,000 does not", () => {
    expect(eq("17000").after.ratio.toFixed(2)).toBe("39.98");
    expect(eq("16000").after.ratio.toNumber()).toBeGreaterThan(40);
  });
  it("also lowers the total paid and the financing ratio", () => {
    const p = eq("17000");
    expect(p.cost.extraTotal.toNumber()).toBeLessThan(0);
    expect(p.gain.ltvPoints.toNumber()).toBeGreaterThan(0);
  });
  it("cannot take more than the reserve holds", () => {
    expect(() => eq("40001")).toThrow(RangeError);
  });
  it("smallestEquityStep finds the same 17,000", () => {
    expect(smallestEquityStep(CASE_A_POSITION, TARGET_RATIO, EQUITY_STEP)?.toString()).toBe("17000");
    expect(smallestEquityStep(CASE_A_POSITION, "30", EQUITY_STEP)).toBeNull(); // the whole reserve does not get there
  });
});

describe("case A — closing the car loan", () => {
  it("from the equity: the ratio falls to about 38.5%, and the financing ratio crosses 75%", () => {
    const p = pull(CASE_A_POSITION, { lever: "close_loan", payoff: CAR_PAYOFF, from: "equity" });
    expect(p.after.loan.toString()).toBe("1676000"); // 1,640,000 + 36,000
    expect(p.after.ltv.toFixed(2)).toBe("76.18"); // 1,676,000 ÷ 2,200,000
    expect(p.after.disposable.toString()).toBe("21700");
    expect(p.after.ratio.toFixed(2)).toBe("38.53");
    expect(p.newBans).toEqual(["ltv"]);
    expect(p.allowed).toBe(false);
  });
  it("from the reserve: the same disposable income, the loan unchanged, no ban", () => {
    const p = pull(CASE_A_POSITION, { lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" });
    expect(p.after.ratio.toFixed(2)).toBe("37.70"); // 8,181.30 ÷ 21,700
    expect(p.after.loan.toString()).toBe("1640000");
    expect(p.cost.reserveAfter.toString()).toBe("4000");
    expect(p.cost.extraTotal.toString()).toBe("0");
    expect(p.allowed).toBe(true);
  });
  it("refuses to close a loan from a reserve that is too small", () => {
    expect(() => applyMove({ ...CASE_A_POSITION, reserve: "30000" }, { lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" })).toThrow(RangeError);
  });
});

describe("case A — waiting for the 18-month rule", () => {
  it("26 payments left: after 8 months only 18 are left, and the loan stops counting", () => {
    const p = pull(CASE_A_POSITION, { lever: "wait", months: 8 });
    expect(p.after.disposable.toString()).toBe("21700");
    expect(p.after.ratio.toFixed(2)).toBe("37.70");
    expect(p.cost.months).toBe(8);
    expect(p.cost.cashNow.toString()).toBe("0");
  });
  it("after 7 months, 19 are left and it still counts", () => {
    expect(pull(CASE_A_POSITION, { lever: "wait", months: 7 }).after.disposable.toString()).toBe("20250");
  });
});

describe("case A — a borrower, a term, a mix", () => {
  it("a second income of 4,000 a month: 8,181.30 ÷ 24,250", () => {
    const p = pull(CASE_A_POSITION, { lever: "borrower", income: "4000" });
    expect(p.after.disposable.toString()).toBe("24250");
    expect(p.after.ratio.toFixed(2)).toBe("33.74");
  });
  it("case A is already at 30 years: five more is a ban, five fewer raises the ratio", () => {
    const longer = pull(CASE_A_POSITION, { lever: "term", months: 60 });
    expect(longer.newBans).toEqual(["term"]);
    expect(longer.after.ratio.toNumber()).toBeLessThan(longer.before.ratio.toNumber());
    const shorter = pull(CASE_A_POSITION, { lever: "term", months: -60 });
    expect(shorter.after.ratio.toNumber()).toBeGreaterThan(44);
    expect(shorter.cost.extraTotal.toNumber()).toBeLessThan(0);
  });
  it("the variable part has 333 ₪ of room: any real move toward the variable tracks crosses two-thirds", () => {
    const p = pull(CASE_A_POSITION, { lever: "mix", from: 3, to: 2, points: "10" });
    expect(p.newBans).toEqual(["variable"]);
    expect(p.gain.ratioPoints.toNumber()).toBeGreaterThan(0); // it does lower the ratio — and it is forbidden
    expect(p.cost.stressRise.toNumber()).toBeGreaterThan(0); // and it raises the exposure
  });
  it("the other way, toward the fixed track, raises the ratio and lowers the exposure", () => {
    const p = pull(CASE_A_POSITION, { lever: "mix", from: 2, to: 3, points: "10" });
    expect(p.gain.ratioPoints.toNumber()).toBeLessThan(0);
    expect(p.cost.stressRise.toNumber()).toBeLessThan(0);
    expect(p.allowed).toBe(true);
  });
});

describe("the family's own budget", () => {
  const withBudget: PositionCase = { ...CASE_A_POSITION, livingBudget: "12000" };
  it("what is left in month 1 is the incomes minus the payment and the car loan; the margin is that minus the budget", () => {
    const p = positionOf(withBudget);
    expect(p.leftFirst.toFixed(2)).toBe("12068.70"); // 21,700 − 8,181.30 − 1,450
    expect(p.marginFirst?.toFixed(2)).toBe("68.70");
  });
  it("without a budget there is no margin", () => {
    expect(positionOf(CASE_A_POSITION).marginFirst).toBeNull();
  });
});

describe("perPoint", () => {
  it("is the price divided by the points it bought", () => {
    expect(perPoint("17000", "0.42")?.toFixed(2)).toBe("40476.19");
  });
  it("is null when the lever did not lower the ratio", () => {
    expect(perPoint("1000", "0")).toBeNull();
    expect(perPoint("1000", "-1")).toBeNull();
  });
});
