import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { INTERNAL_PRESETS, PRESETS } from "../../data/refinance-examples.ts";
import { earlyRepaymentFee, WORKED_EXAMPLE } from "./earlyrepay.ts";
import { presentValue, type Track } from "./metrics.ts";
import { moneyString } from "./money.ts";
import { type Forecast } from "./offers.ts";
import {
  existingLoan,
  fixedOffer,
  monthsAtPayment,
  newLoanOf,
  refinanceTest,
  stayFigures,
  stayStream,
  switchStream,
  switchSummary,
  tailOf,
  trajectory,
} from "./refinance.ts";

const money = (d: Decimal) => moneyString(d);
const near = (d: Decimal, x: Decimal.Value, eps = "1e-9") => expect(d.minus(x).abs().lte(eps)).toBe(true);
const FORECAST: Forecast = { id: "t", label: "t", month: "2026-10", prime: ["5"], variableLinked: ["2"], variableUnlinked: ["4"], inflation: "2.5" };

// The worked example of lesson 7.2 (the team's own computation, Brain 7798786, 2 August 2026): 700,000 ₪, fixed unlinked,
// 5.90% nominal, 20 years, 37 payments made. Exact arithmetic: that is how the team's balance 637,956.74 comes out.
const WORKED: Track = { principal: "700000", rates: ["5.90"], months: 240 };
const FEE = "10365.95"; // 10,305.95 after the reduction for time served, plus the ₪60 operational fee

describe("tailOf: the loan as it stands", () => {
  it("reproduces the worked example's balance and payments left, to the agora", () => {
    const t = tailOf(WORKED, 37);
    expect(money(t.balance)).toBe("637956.74");
    expect(t.payments).toHaveLength(203);
    expect(money(t.payments[0])).toBe("4974.72");
    expect(t.balances).toHaveLength(203);
    near(t.balances[202], 0, "1e-6");
  });

  it("is the whole loan when nothing was paid", () => {
    const t = tailOf({ principal: "30000", rates: ["6"], months: 3 }, 0);
    expect(money(t.balance)).toBe("30000.00");
    expect(t.payments).toHaveLength(3);
  });

  it("refuses a loan that has been repaid", () => {
    expect(() => tailOf({ principal: "30000", rates: ["6"], months: 3 }, 3)).toThrow(/nothing is left/);
  });
});

describe("stayFigures: the two figures of §15א", () => {
  // Hand check (lesson 7.4's small example): 30,000 ₪, three monthly payments of 10,100.17 (6% a year, 0.5% a month).
  const small = tailOf({ principal: "30000", rates: ["6"], months: 3 }, 0);

  it("without a fee the loan's own rate explains the payments: 0.5% a month, 6.17% a year", () => {
    const s = stayFigures(small.payments, small.balance, 0);
    near(s.irrWithout, "0.5");
    expect(s.expectedTotalRate.toDecimalPlaces(2).toString()).toBe("6.17"); // 1.005^12 − 1 = 6.1678%
    near(s.comparisonRate, s.expectedTotalRate);
  });

  it("a fee added to what is owed LOWERS the rate that explains the payments", () => {
    const s = stayFigures(small.payments, small.balance, 150);
    expect(money(s.financed)).toBe("30150.00");
    // Hand: the same three payments, worth 30,150 instead of 30,000 today: a lower monthly rate, about 0.2494%.
    expect(s.irrWith.toDecimalPlaces(4).toString()).toBe("0.2494");
    expect(s.comparisonRate.toDecimalPlaces(2).toString()).toBe("3.03");
    expect(s.comparisonRate.lt(s.expectedTotalRate)).toBe(true);
    // And it really explains them: the payments are worth P + T at that rate.
    near(presentValue(s.payments, s.irrWith), 30150, "1e-6");
  });

  it("the worked example: 6.06% without the fee (the contract's 5.90% nominal), 5.82% with it", () => {
    const t = tailOf(WORKED, 37);
    const s = stayFigures(t.payments, t.balance, FEE);
    expect(s.months).toBe(203);
    expect(s.expectedTotalRate.toDecimalPlaces(4).toString()).toBe("6.0622");
    expect(s.irrWithout.toDecimalPlaces(8).toString()).toBe("0.49166667"); // 5.90 ÷ 12
    expect(s.comparisonRate.toDecimalPlaces(4).toString()).toBe("5.8232");
    expect(money(s.financed)).toBe("648322.69");
    expect(money(s.total)).toBe("1009867.74");
  });

  it("a fee of zero is allowed, a negative one is not", () => {
    expect(() => stayFigures(small.payments, small.balance, -1)).toThrow(/negative/);
  });
});

describe("existingLoan: per track and for the whole loan", () => {
  const fixed: Track = { principal: "400000", rates: ["5"], months: 240 };
  const prime: Track = { principal: "200000", rates: ["5.5"], months: 120 };

  it("a single track is the whole loan, except a shared charge, which belongs to the whole loan only", () => {
    const one = existingLoan([{ track: WORKED, paymentsMade: 37, fee: "10305.95" }], 60);
    expect(money(one.tracks[0].fee)).toBe("10305.95");
    expect(money(one.whole.fee)).toBe("10365.95");
    near(one.tracks[0].expectedTotalRate, one.whole.expectedTotalRate);
    expect(one.whole.comparisonRate.lt(one.tracks[0].comparisonRate)).toBe(true);
  });

  it("adds the tracks month by month, the shorter one simply ending", () => {
    const two = existingLoan([
      { track: fixed, paymentsMade: 12, fee: "3000" },
      { track: prime, paymentsMade: 12, fee: "0" },
    ]);
    const a = tailOf(fixed, 12);
    const b = tailOf(prime, 12);
    expect(two.whole.months).toBe(228);
    expect(money(two.whole.payments[0])).toBe(money(a.payments[0].plus(b.payments[0])));
    expect(money(two.whole.payments[200])).toBe(money(a.payments[200])); // the 10-year track has ended
    expect(money(two.whole.balance)).toBe(money(a.balance.plus(b.balance)));
    expect(money(two.whole.fee)).toBe("3000.00");
    expect(two.balances).toHaveLength(228);
  });

  it("a track without a fee has the same two figures", () => {
    const two = existingLoan([
      { track: fixed, paymentsMade: 12, fee: "3000" },
      { track: prime, paymentsMade: 12, fee: "0" },
    ]);
    near(two.tracks[1].expectedTotalRate, two.tracks[1].comparisonRate);
    expect(two.tracks[0].comparisonRate.lt(two.tracks[0].expectedTotalRate)).toBe(true);
  });

  it("refuses an empty loan", () => {
    expect(() => existingLoan([])).toThrow();
  });
});

describe("refinanceTest: the regulator's sentence", () => {
  it("is worthwhile when the rate for comparison purposes is higher than the new loan's expected total rate", () => {
    const r = refinanceTest("5.8232", "5.3257");
    expect(r.worthwhile).toBe(true);
    expect(r.margin.toDecimalPlaces(4).toString()).toBe("0.4975");
  });
  it("is not when it is lower, and not when it is equal (the sentence says 'higher')", () => {
    expect(refinanceTest("5.1", "5.3").worthwhile).toBe(false);
    expect(refinanceTest("5.3", "5.3").worthwhile).toBe(false);
  });
});

describe("the new loan and the switch", () => {
  const t = tailOf(WORKED, 37);
  const stay = stayStream(t.balance, t.payments, t.balances);
  const financed = new Decimal(t.balance).plus(FEE);

  it("the new loan: 648,322.69 ₪ at 5.2% for the 203 months that are left", () => {
    const offer = fixedOffer({ name: "בנק ב׳", amount: financed, months: 203, rate: "5.2" }, FORECAST);
    const n = newLoanOf(offer, FORECAST);
    expect(money(n.loan)).toBe("648322.69");
    expect(n.months).toBe(203);
    expect(money(n.first)).toBe("4808.23");
    expect(n.expectedTotalRate.toDecimalPlaces(2).toString()).toBe("5.33"); // 5.2% nominal = 5.33% effective
    expect(n.balances).toHaveLength(203);
    near(n.balances[202], 0, "1e-6");
  });

  it("the same rate over 25 years: a much lower payment, and MORE shekels in all", () => {
    const short = newLoanOf(fixedOffer({ name: "x", amount: financed, months: 203, rate: "5.2" }, FORECAST), FORECAST);
    const long = newLoanOf(fixedOffer({ name: "y", amount: financed, months: 300, rate: "5.2" }, FORECAST), FORECAST);
    const sShort = switchSummary(stay, switchStream(short), 0);
    const sLong = switchSummary(stay, switchStream(long), 0);
    expect(sShort.monthlyGap.gt(0)).toBe(true);
    expect(sLong.monthlyGap.gt(sShort.monthlyGap)).toBe(true);
    expect(sShort.totalSaving.gt(0)).toBe(true);
    expect(sLong.totalSaving.lt(0)).toBe(true);
    // Both pass the §15א rate test (same rate), but only one saves shekels in all.
    near(short.expectedTotalRate, long.expectedTotalRate, "1e-6");
  });

  it("the totals add up: staying costs the payments left; switching costs the new payments plus the cash paid on day 0", () => {
    const n = newLoanOf(fixedOffer({ name: "z", amount: financed, months: 203, rate: "5.2", upfront: "2400" }, FORECAST), FORECAST);
    const s = switchSummary(stay, switchStream(n), 2400);
    expect(money(s.stayTotal)).toBe("1009867.74");
    expect(s.switchTotal.minus(2400).toString()).toBe(n.payments.reduce((a, p) => a.plus(p), new Decimal(0)).toString());
    expect(s.totalSaving.toString()).toBe(s.stayTotal.minus(s.switchTotal).toString());
  });

  it("the trajectory starts in a hole of the fee and the cash paid, and the position ends at the total saving", () => {
    const n = newLoanOf(fixedOffer({ name: "w", amount: financed, months: 203, rate: "5.2", upfront: "2400" }, FORECAST), FORECAST);
    const path = trajectory(stay, switchStream(n), 2400);
    expect(path).toHaveLength(204);
    // Day 0: owed 637,956.74 on the old loan, 648,322.69 on the new: 10,365.95 behind, plus 2,400 paid in cash.
    expect(money(path[0].position)).toBe("-12765.95");
    // When both are repaid, nothing is owed on either: the position is the total saving.
    const s = switchSummary(stay, switchStream(n), 2400);
    near(path[203].balanceGap, 0, "1e-6");
    near(path[203].position, s.totalSaving, "1e-6");
  });

  it("cash break-even comes before position break-even for a longer loan", () => {
    const long = newLoanOf(fixedOffer({ name: "v", amount: financed, months: 300, rate: "5.2", upfront: "2400" }, FORECAST), FORECAST);
    const s = switchSummary(stay, switchStream(long), 2400);
    expect(s.cashBreakEven).not.toBeNull();
    // In payments alone the long loan is ahead within a few months…
    expect(s.cashBreakEven as number).toBeLessThan(6);
    // …but what is owed on it falls more slowly: whether the position ever catches up is the point of the lesson.
    const path = trajectory(stay, switchStream(long), 2400);
    expect(path[12].balanceGap.lt(0)).toBe(true);
  });

  it("the present value of the saving at the comparison rate is positive exactly when the new loan's rate is lower", () => {
    const cheaper = newLoanOf(fixedOffer({ name: "c", amount: financed, months: 300, rate: "5.2" }, FORECAST), FORECAST);
    const dearer = newLoanOf(fixedOffer({ name: "d", amount: financed, months: 300, rate: "6.4" }, FORECAST), FORECAST);
    const fig = stayFigures(t.payments, t.balance, FEE);
    const a = switchSummary(stay, switchStream(cheaper), 0, fig.irrWith);
    const b = switchSummary(stay, switchStream(dearer), 0, fig.irrWith);
    expect((a.presentValueSaving as Decimal).gt(0)).toBe(true);
    expect((b.presentValueSaving as Decimal).lt(0)).toBe(true);
    // At the comparison rate the old payments are worth exactly P + T today.
    near(presentValue(t.payments, fig.irrWith), financed, "1e-6");
  });
});

describe("monthsAtPayment: keep the payment, finish sooner", () => {
  it("at the loan's own rate, the payment you pay repays it in the months it was set for", () => {
    // 30,000 ₪ at 6% over 3 months is 10,100.1662…; any payment of at least that finishes in 3 months, a cent less needs a fourth.
    expect(monthsAtPayment("30000", "6", "10100.17")).toBe(3);
    expect(monthsAtPayment("30000", "6", "10100.16")).toBe(4);
  });
  it("a cheaper rate finishes sooner on the same payment", () => {
    const sameRate = monthsAtPayment("648322.69", "5.9", "4974.72");
    const cheaper = monthsAtPayment("648322.69", "5.2", "4974.72");
    expect(cheaper).toBeLessThan(sameRate);
  });
  it("refuses a payment that does not cover the interest", () => {
    expect(() => monthsAtPayment("100000", "6", "400")).toThrow(/60 years/);
  });
});

describe("the fee comes from lesson 7.2's module (earlyrepay.ts), and the two modules agree on the loan", () => {
  it("the worked example's fee input here (10,305.95 + 60) is what earlyRepaymentFee computes", () => {
    const r = earlyRepaymentFee(WORKED_EXAMPLE);
    expect(money(r.discount)).toBe("10305.95");
    expect(money(r.operational)).toBe("60.00");
    expect(money(r.total)).toBe(FEE);
  });
  it("both modules reach the same balance and number of payments left", () => {
    const r = earlyRepaymentFee(WORKED_EXAMPLE);
    const t = tailOf(WORKED, r.paid);
    expect(r.paid).toBe(37);
    expect(t.payments).toHaveLength(r.remaining);
    expect(money(t.balance)).toBe(money(r.balance));
  });
});

describe("the lessons' presets and a new loan that is not fixed", () => {
  it("every preset of lessons 7.4 and 7.5 builds, with a fee for each track and a whole-loan figure", () => {
    for (const p of [...PRESETS, ...INTERNAL_PRESETS]) {
      const loan = existingLoan(p.tracks.map((t) => ({ track: t.track, paymentsMade: t.paymentsMade, fee: t.fee })), p.shared);
      expect(loan.tracks).toHaveLength(p.tracks.length);
      expect(loan.whole.fee.gte(p.tracks.reduce((s, t) => s.plus(t.fee), new Decimal(0)))).toBe(true);
      expect(loan.whole.comparisonRate.lte(loan.whole.expectedTotalRate)).toBe(true);
    }
  });

  it("a prime track in the new offer (variable: the rate moves each year) still gives a payment path and a balance that ends at zero", () => {
    const offer = {
      name: "בנק ב׳",
      month: FORECAST.month,
      forecast: FORECAST.id,
      upfront: "0.00",
      tracks: [{ kind: "prime" as const, amount: "100000.00", months: 120, margin: "-0.5" }],
    };
    const n = newLoanOf(offer, FORECAST);
    expect(n.payments).toHaveLength(120);
    near(n.balances[119], 0, "1e-6");
    expect(n.expectedTotalRate.gt(0)).toBe(true);
  });

  it("with a track that has a fee and one that has none, whole-loan figures sit between the tracks'", () => {
    const loan = existingLoan(
      [
        { track: { principal: "300000", rates: ["6.3"], months: 300 }, paymentsMade: 60, fee: "5200" },
        { track: { principal: "200000", rates: ["5.2"], months: 240 }, paymentsMade: 60, fee: "0" },
      ],
      0,
    );
    const [a, b] = loan.tracks;
    const lo = Decimal.min(a.expectedTotalRate, b.expectedTotalRate);
    const hi = Decimal.max(a.expectedTotalRate, b.expectedTotalRate);
    expect(loan.whole.expectedTotalRate.gte(lo)).toBe(true);
    expect(loan.whole.expectedTotalRate.lte(hi)).toBe(true);
  });
});
