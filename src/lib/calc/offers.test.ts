import { describe, expect, it } from "vitest";
import { irrMonthly, mixPayments, totalPaid, trackPayments } from "./metrics.ts";
import {
  basisDifferences,
  basketById,
  basketOffer,
  canSplitExactly,
  compareOffers,
  type Forecast,
  impliedRate,
  measureOffer,
  mixSignature,
  type Offer,
  offerCode,
  offerLoan,
  offerTracks,
  scaleOffer,
  splitBasket,
  UNIFORM_BASKETS,
} from "./offers.ts";

const flat: Forecast = { id: "flat", label: "flat", month: "2026-10", prime: ["5"], variableLinked: ["2"], variableUnlinked: ["4"], inflation: "0" };
const rising: Forecast = { id: "rising", label: "rising", month: "2026-10", prime: ["5", "6"], variableLinked: ["2", "3"], variableUnlinked: ["4", "5"], inflation: "2" };

describe("the uniform baskets (appendix 5, as the team transcribed it)", () => {
  it("has three baskets whose fractions each add up to exactly one", () => {
    expect(UNIFORM_BASKETS.map((b) => b.id)).toEqual(["uniform_1", "uniform_2", "uniform_3"]);
    for (const b of UNIFORM_BASKETS) {
      // sum of num/den, in sixths: every den here divides 6
      const sixths = b.parts.reduce((s, p) => s + (p.num * 6) / p.den, 0);
      expect(sixths).toBe(6);
    }
  });

  it("has a fixed linked track in none of the three", () => {
    for (const b of UNIFORM_BASKETS) expect(b.parts.some((p) => p.kind === "fixed_linked")).toBe(false);
  });

  it("splits 900,000 into three thirds and into two halves, exactly", () => {
    expect(splitBasket("900000", basketById("uniform_1"))).toEqual([{ kind: "fixed_unlinked", amount: "900000.00" }]);
    expect(splitBasket("900000", basketById("uniform_2"))).toEqual([
      { kind: "fixed_unlinked", amount: "300000.00" },
      { kind: "prime", amount: "300000.00" },
      { kind: "variable_linked", amount: "300000.00" },
    ]);
    expect(splitBasket("900000", basketById("uniform_3")).map((p) => p.amount)).toEqual(["450000.00", "450000.00"]);
  });

  it("refuses a loan whose third is not a whole number of agorot (a third is exactly a third)", () => {
    // 1,000,000 ₪ = 100,000,000 agorot: a third is 33,333,333.33… agorot.
    expect(canSplitExactly("1000000", basketById("uniform_2"))).toBe(false);
    expect(() => splitBasket("1000000", basketById("uniform_2"))).toThrow(RangeError);
    // ...but it halves, and basket 1 takes it whole.
    expect(canSplitExactly("1000000", basketById("uniform_3"))).toBe(true);
    expect(canSplitExactly("1000000", basketById("uniform_1"))).toBe(true);
    // 100,000,002 agorot divide by 3 (the digits add up to 3); 100,000,001 do not.
    expect(canSplitExactly("1000000.02", basketById("uniform_2"))).toBe(true);
    expect(canSplitExactly("1000000.01", basketById("uniform_2"))).toBe(false);
  });
});

describe("an offer becomes tracks", () => {
  const offer: Offer = {
    name: "x",
    month: "2026-10",
    forecast: "rising",
    upfront: "0.00",
    tracks: [
      { kind: "fixed_unlinked", amount: "100000.00", months: 120, rate: "5" },
      { kind: "prime", amount: "100000.00", months: 120, margin: "-0.5" },
      { kind: "variable_linked", amount: "100000.00", months: 120, margin: "1" },
    ],
  };

  it("adds the forecast's anchors to the margins, year by year for prime and every five years for a variable track", () => {
    const [fixed, prime, linked] = offerTracks(offer, rising);
    expect(fixed.rates).toEqual(["5"]);
    expect(fixed.inflationPercent).toBeUndefined();
    expect(prime.rates).toEqual(["4.5", "5.5"]);
    expect(prime.blockMonths).toBe(12);
    expect(linked.rates).toEqual(["3", "4"]);
    expect(linked.blockMonths).toBe(60);
    expect(linked.inflationPercent).toBe("2");
  });

  it("shows a variable track's rate on the day of issue", () => {
    expect(impliedRate(offer.tracks[1], rising)).toBe("4.5");
    expect(impliedRate(offer.tracks[0], rising)).toBe("5");
  });

  it("refuses an offer measured on another forecast than the one it names", () => {
    expect(() => offerTracks(offer, flat)).toThrow(RangeError);
  });

  it("refuses an offer dated in another month than its forecast: a forecast belongs to one month", () => {
    expect(() => offerTracks({ ...offer, month: "2026-11" }, rising)).toThrow(RangeError);
  });

  it("has the loan as the sum of its tracks", () => {
    expect(offerLoan(offer)).toBe("300000.00");
  });
});

describe("measureOffer", () => {
  const fixedOnly: Offer = { name: "fixed", month: "2026-10", forecast: "flat", upfront: "0.00", tracks: [{ kind: "fixed_unlinked", amount: "100000.00", months: 12, rate: "6" }] };

  it("gives a fixed unlinked loan with no charges the effective rate of its contract (lesson 0.4): 6% a year is 0.5% a month", () => {
    const m = measureOffer(fixedOnly, flat);
    // (1.005)^12 − 1 = 6.1677811864…%. The schedule is rounded to the agora as a statement is, so the IRR
    // sits within a thousandth of a point of the contract's.
    expect(m.expectedTotalRate.minus("6.1677811864").abs().lt("0.001")).toBe(true);
    expect(m.irrMonthly.minus("0.5").abs().lt("0.0001")).toBe(true);
    // the loan's own payments: the level payment of 8,606.64 (rounded once), the last closing the balance
    const pays = trackPayments({ principal: "100000.00", rates: ["6"], months: 12, rounding: "statement" });
    expect(m.first).toBe(pays[0].toFixed(2));
    expect(m.total).toBe(totalPaid(pays).toFixed(2));
  });

  it("raises the expected total rate when charges are collected on the day: the borrower received less (A)", () => {
    const withFee = { ...fixedOnly, upfront: "1000.00" };
    const a = measureOffer(fixedOnly, flat);
    const b = measureOffer(withFee, flat);
    expect(b.received).toBe("99000.00");
    expect(b.total).toBe(a.total); // the payments do not change
    expect(b.expectedTotalRate.gt(a.expectedTotalRate)).toBe(true);
    // the IRR is the rate at which the same payments are worth 99,000
    const pays = mixPayments(offerTracks(withFee, flat));
    expect(irrMonthly(pays, "99000").toFixed(12)).toBe(b.irrMonthly.toFixed(12));
  });

  it("finds the highest expected payment and the month it first appears", () => {
    const linked: Offer = { name: "l", month: "2026-10", forecast: "rising", upfront: "0.00", tracks: [{ kind: "fixed_linked", amount: "100000.00", months: 60, rate: "3" }] };
    const m = measureOffer(linked, rising);
    expect(m.highestMonth).toBe(60); // an index that only rises: payments grow, the last is the highest
    expect(Number(m.highest)).toBeGreaterThan(Number(m.first));
  });

  it("measures a mix on its added payments, not on each track alone", () => {
    const mix: Offer = {
      name: "mix",
      month: "2026-10",
      forecast: "rising",
      upfront: "0.00",
      tracks: [
        { kind: "fixed_unlinked", amount: "100000.00", months: 60, rate: "5" },
        { kind: "prime", amount: "100000.00", months: 120, margin: "-0.5" },
      ],
    };
    const m = measureOffer(mix, rising);
    const each = offerTracks(mix, rising).map((t) => trackPayments(t));
    // month 1 is the two first payments added; after month 60 only the prime track pays
    expect(m.first).toBe(each[0][0].plus(each[1][0]).toFixed(2));
    expect(m.total).toBe(totalPaid(mixPayments(offerTracks(mix, rising))).toFixed(2));
  });
});

describe("basketOffer", () => {
  it("builds an offer from a basket and a bank's rates", () => {
    const o = basketOffer({ name: "ב", month: "2026-10", forecast: "flat", basket: basketById("uniform_2"), loan: "900000", months: 300, rates: { fixed: "5.1", primeMargin: "-0.5", variableMargin: "1.2" } });
    expect(o.tracks.map((t) => [t.kind, t.amount, t.rate ?? t.margin])).toEqual([
      ["fixed_unlinked", "300000.00", "5.1"],
      ["prime", "300000.00", "-0.5"],
      ["variable_linked", "300000.00", "1.2"],
    ]);
    expect(offerCode(o)).toBe("fixed_unlinked:300000.00:300:5.1;prime:300000.00:300:-0.5;variable_linked:300000.00:300:1.2");
  });
});

describe("when comparing is allowed: the same amount, mix, month and forecast", () => {
  const rates = { fixed: "5.1", primeMargin: "-0.5", variableMargin: "1.2" };
  const make = (name: string, basket: "uniform_1" | "uniform_2" | "uniform_3", loan: string, forecast: string, month = "2026-10") =>
    basketOffer({ name, month, forecast, basket: basketById(basket), loan, months: 120, rates });

  it("finds no difference between two banks' offers on the same basket, amount, month and forecast", () => {
    expect(basisDifferences([make("a", "uniform_2", "900000", "flat"), make("b", "uniform_2", "900000", "flat")])).toEqual([]);
  });

  it("names each thing that differs, in a fixed order", () => {
    expect(basisDifferences([make("a", "uniform_2", "900000", "flat"), make("b", "uniform_2", "600000", "flat")])).toEqual(["amount"]);
    expect(basisDifferences([make("a", "uniform_2", "900000", "flat"), make("b", "uniform_3", "900000", "flat")])).toEqual(["mix"]);
    expect(basisDifferences([make("a", "uniform_2", "900000", "flat"), make("b", "uniform_2", "900000", "flat", "2026-11")])).toEqual(["month"]);
    expect(basisDifferences([make("a", "uniform_2", "900000", "flat"), make("b", "uniform_2", "900000", "rising")])).toEqual(["forecast"]);
    expect(basisDifferences([make("a", "uniform_1", "900000", "flat"), make("b", "uniform_3", "600000", "rising")])).toEqual(["amount", "mix", "forecast"]);
  });

  it("counts a different term as a different mix, and a different rate as no difference at all (the rate is what is compared)", () => {
    const a = make("a", "uniform_3", "900000", "flat");
    const longer = { ...a, tracks: a.tracks.map((t) => ({ ...t, months: 180 })) };
    expect(basisDifferences([a, longer])).toEqual(["mix"]);
    const dearer = { ...a, tracks: a.tracks.map((t) => (t.rate ? { ...t, rate: "6" } : t)) };
    expect(basisDifferences([a, dearer])).toEqual([]);
    expect(mixSignature(a)).toBe(mixSignature(dearer));
  });

  it("reads a mix by its shares, so a mix of the same shares at the same terms is the same mix whatever the order of the tracks", () => {
    const a = make("a", "uniform_3", "900000", "flat");
    const reversed = { ...a, tracks: [...a.tracks].reverse() };
    expect(mixSignature(a)).toBe(mixSignature(reversed));
  });

  it("compares measures and marks the lowest of each; ties are judged at half an agora or half a hundredth of a point", () => {
    const flat2: Forecast = { ...flat, id: "flat2" };
    const offers = [make("a", "uniform_3", "900000", "flat"), { ...make("b", "uniform_3", "900000", "flat"), tracks: make("b", "uniform_3", "900000", "flat").tracks.map((t) => (t.rate ? { ...t, rate: "6" } : t)) }];
    const c = compareOffers(offers, [flat, flat2]);
    expect(c.sameBasis).toBe(true);
    expect(c.lowest.expectedTotalRate).toEqual([0]);
    expect(c.lowest.total).toEqual([0]);
    const twin = compareOffers([offers[0], { ...offers[0], name: "same" }], [flat, flat2]);
    expect(twin.lowest.expectedTotalRate).toEqual([0, 1]);
  });

  it("does not call a ranking a comparison when the basis differs, and still computes every measure", () => {
    const c = compareOffers([make("a", "uniform_3", "900000", "flat"), make("b", "uniform_3", "900000", "rising")], [flat, rising]);
    expect(c.sameBasis).toBe(false);
    expect(c.differences).toEqual(["forecast"]);
    expect(c.measures).toHaveLength(2);
  });

  it("needs a forecast for every offer", () => {
    expect(() => compareOffers([make("a", "uniform_3", "900000", "nope")], [flat])).toThrow(RangeError);
  });
});

describe("scaleOffer", () => {
  const o: Offer = {
    name: "x",
    month: "2026-10",
    forecast: "flat",
    upfront: "0.00",
    tracks: [
      { kind: "fixed_unlinked", amount: "450000.00", months: 300, rate: "5" },
      { kind: "prime", amount: "300000.00", months: 180, margin: "-0.5" },
      { kind: "variable_unlinked", amount: "150000.00", months: 300, margin: "1.2" },
    ],
  };

  it("keeps the shares, the terms and the rates, and changes the amounts", () => {
    const scaled = scaleOffer(o, "1200000");
    expect(scaled?.tracks.map((t) => t.amount)).toEqual(["600000.00", "400000.00", "200000.00"]);
    expect(scaled?.tracks.map((t) => t.months)).toEqual([300, 180, 300]);
    expect(mixSignature(scaled as Offer)).toBe(mixSignature(o));
    expect(basisDifferences([o, scaled as Offer])).toEqual(["amount"]);
  });

  it("gives null when a track would not be whole agorot (a third of 1,000,000)", () => {
    expect(scaleOffer(o, "1000000")).toBeNull();
  });
});
