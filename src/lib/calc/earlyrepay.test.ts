import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  WORKED_EXAMPLE,
  addMonths,
  averageMonthlyChange,
  bucketFor,
  daysBetween,
  discountingFee,
  discountingFeeApplies,
  earlyRepaymentFee,
  effective,
  effectiveOfNominal,
  feeOverTime,
  indexFee,
  monthlyFraction,
  nextReset,
  noNoticeFee,
  noticeCounts,
  noticeStatus,
  nominal,
  operationalFee,
  paymentsMade,
  remainingStream,
  streamValue,
  timeServedReduction,
  wholeMonthsBetween,
} from "./earlyrepay.ts";
import { moneyString } from "./money.ts";

const close = (a: Decimal.Value, b: Decimal.Value, places = 8) => expect(new Decimal(a).minus(b).abs().lt(new Decimal(10).pow(-places))).toBe(true);
const m2 = (x: Decimal.Value) => moneyString(x);

describe("the two kinds of annual rate are not the same number", () => {
  it("nominal is divided by 12; effective takes the twelfth root", () => {
    close(monthlyFraction(nominal("6")), "0.005");
    close(monthlyFraction(effective("6.1677811864")), "0.005", 10); // 6% nominal is 6.1677…% effective
    close(monthlyFraction(effective("0")), "0");
  });
  it("5.90% nominal is 6.06% effective (the team's check)", () => {
    expect(new Decimal(effectiveOfNominal(nominal("5.90")).percent).toDecimalPlaces(2).toString()).toBe("6.06");
    expect(new Decimal(effectiveOfNominal(nominal("5.90")).percent).toDecimalPlaces(3).toString()).toBe("6.062");
  });
  it("dividing a published average by 12 instead of the twelfth root changes the monthly rate", () => {
    const right = monthlyFraction(effective("4.823049"));
    const wrong = monthlyFraction(nominal("4.823049"));
    expect(right.lt(wrong)).toBe(true); // the same number read as effective gives the smaller monthly rate
    expect(right.toFixed(8)).not.toBe(wrong.toFixed(8));
  });
});

describe("dates", () => {
  it("counts whole months and payments made", () => {
    expect(wholeMonthsBetween("2023-07-01", "2026-08-02")).toBe(37);
    expect(wholeMonthsBetween("2023-07-01", "2026-08-01")).toBe(37);
    expect(wholeMonthsBetween("2023-07-01", "2026-07-31")).toBe(36);
    expect(paymentsMade("2023-07-01", "2026-08-02", 240)).toBe(37);
    expect(paymentsMade("2023-07-01", "2050-01-01", 240)).toBe(240);
  });
  it("cuts a day that does not exist to the month's last day", () => {
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2023-07-01", 36)).toBe("2026-07-01");
    expect(daysBetween("2026-07-03", "2026-08-02")).toBe(30);
  });
  it("refuses a repayment before the grant", () => {
    expect(() => paymentsMade("2026-01-01", "2025-01-01", 12)).toThrow();
  });
});

describe("the remaining stream", () => {
  it("level payment: 4,974.72, balance 637,956.74 after 37, 203 payments left (the team's example)", () => {
    const s = remainingStream({ principal: "700000", contract: nominal("5.90"), termMonths: 240 }, 37);
    expect(s.remaining).toBe(203);
    expect(m2(s.payments[0])).toBe("4974.72");
    expect(m2(s.balance)).toBe("637956.74");
    // the stream, taken back at the loan's own rate, is the balance
    close(streamValue(s.payments, monthlyFraction(nominal("5.90"))), s.balance, 10);
  });
  it("equal principal by hand: 120,000 over 12 months at 12%: 10,000 + 1,200 = 11,200 first", () => {
    const s = remainingStream({ principal: "120000", contract: nominal("12"), termMonths: 12, method: "equal_principal" }, 0);
    expect(m2(s.payments[0])).toBe("11200.00");
    expect(m2(s.payments[1])).toBe("11100.00"); // 10,000 + 1% of 110,000
    expect(m2(s.payments[11])).toBe("10100.00"); // 10,000 + 1% of 10,000
    close(streamValue(s.payments, "0.01"), "120000", 8);
  });
});

describe("the discounting fee on numbers small enough to check by hand", () => {
  // Two payments of 100; the loan's rate is 12% nominal (1% a month); the market rate is 0.
  const base = { payments: [100, 100], monthsToReset: null, contract: nominal("12"), contractAtGrant: nominal("12"), averageToday: effective("0"), averageAtGrant: null };
  it("§3(3) is the value at the market rate minus the value at the loan's rate", () => {
    const r = discountingFee(base);
    close(r.pvToday, "200"); // no discounting at 0
    close(r.pvContract, new Decimal(100).div("1.01").plus(new Decimal(100).div("1.0201"))); // 197.0395…
    close(r.v1!, "2.96049407", 7);
    expect(r.v2).toBeNull(); // no C published: C := R0, so §3(4) does not exist
    expect(r.binding).toBe("v1");
  });
  it("§3(4) exists only when C is below R0, and the lower of the two is taken", () => {
    const r = discountingFee({ ...base, averageAtGrant: effective("6.1677811864") }); // C = 0.5% a month
    close(r.pvGrant!, new Decimal(100).div("1.005").plus(new Decimal(100).div("1.005").div("1.005")));
    expect(r.v2!.lt(r.v1!)).toBe(true);
    expect(r.binding).toBe("v2");
    expect(r.lower!.eq(r.v2!)).toBe(true);
  });
  it("a market rate at or above the loan's rate: no §3(3)", () => {
    const r = discountingFee({ ...base, averageToday: effective("13") });
    expect(r.v1Applies).toBe(false);
    expect(r.v1).toBeNull();
    expect(r.lower).toBeNull();
  });
  it("compares monthly rates, not the two printed numbers: 5.00% nominal against an average of 5.05% effective", () => {
    // Printed side by side 5.00 < 5.05 looks like "does not apply"? No: the other way round. Nominal 5.00 is 5.116% effective.
    const r = discountingFee({ payments: [100], monthsToReset: null, contract: nominal("5.00"), contractAtGrant: nominal("5.00"), averageToday: effective("5.05"), averageAtGrant: null });
    expect(r.v1Applies).toBe(true); // 5.05% effective < 5.116% effective
    const wrong = discountingFee({ payments: [100], monthsToReset: null, contract: nominal("5.00"), contractAtGrant: nominal("5.00"), averageToday: effective("5.20"), averageAtGrant: null });
    expect(wrong.v1Applies).toBe(false); // 5.20% effective is above 5.116%
  });
  it("a variable track: the part after the reset is taken back to the reset day at the loan's rate", () => {
    const r = discountingFee({ payments: [100, 100, 100], monthsToReset: 1, contract: nominal("12"), contractAtGrant: nominal("12"), averageToday: effective("0"), averageAtGrant: null });
    const tail = new Decimal(100).div("1.01").plus(new Decimal(100).div("1.0201"));
    close(r.pvToday, new Decimal(100).plus(tail)); // A = 0: nothing shrinks
    // At the loan's own rate the whole stream is worth the balance: 100/1.01 + 100/1.0201 + 100/1.030301
    close(r.pvContract, new Decimal(100).div("1.01").plus(new Decimal(100).div("1.0201")).plus(new Decimal(100).div("1.030301")));
  });
});

describe("the worked example — the team's own computation, to the agora", () => {
  const r = earlyRepaymentFee(WORKED_EXAMPLE);
  it("payments made, remaining, payment and balance", () => {
    expect(r.paid).toBe(37);
    expect(r.remaining).toBe(203);
    expect(m2(r.payment)).toBe("4974.72");
    expect(m2(r.balance)).toBe("637956.74");
    expect(r.bucket.label).toBe("15–20");
    expect(r.bucket.onEdge).toBe(false);
  });
  it("present values at today's average and at the grant average", () => {
    expect(m2(r.discounting!.pvToday)).toBe("694721.98");
    expect(m2(r.discounting!.pvGrant!)).toBe("681839.54");
    expect(m2(r.discounting!.pvContract)).toBe("637956.74");
  });
  it("§3(3) 56,765.24; §3(4) 12,882.44; the lower is §3(4)", () => {
    expect(m2(r.discounting!.v1!)).toBe("56765.24");
    expect(m2(r.discounting!.v2!)).toBe("12882.44");
    expect(r.discounting!.binding).toBe("v2");
    expect(m2(r.lower!)).toBe("12882.44");
    expect(m2(r.discounting!.v1!.minus(r.discounting!.v2!))).toBe("43882.80"); // what choosing the right version is worth
  });
  it("−20% for time served, +₪60, total 10,365.95; a notice was given, so no no-notice fee", () => {
    expect(r.reduction.percent).toBe(20);
    expect(m2(r.discount)).toBe("10305.95");
    expect(m2(r.operational)).toBe("60.00");
    expect(r.notice.status).toBe("ok");
    expect(m2(r.noNotice)).toBe("0.00");
    expect(m2(r.total)).toBe("10365.95");
  });
  it("the sensitivity the team's page does not show: A = 4.823 exactly gives ₪2.40 more", () => {
    const r2 = earlyRepaymentFee({ ...WORKED_EXAMPLE, averageToday: effective("4.823") });
    expect(m2(r2.discounting!.v1!)).toBe("56767.64");
    expect(m2(r2.discounting!.v2!)).toBe("12884.84");
  });
  it("dividing A by 12 instead of the twelfth root understates the fee by thousands", () => {
    const wrongMonthly = monthlyFraction(nominal("4.823049"));
    const wrongPv = streamValue(remainingStream(WORKED_EXAMPLE.loan, 37).payments, wrongMonthly);
    expect(wrongPv.lt(r.discounting!.pvToday)).toBe(true);
    expect(m2(wrongPv)).toBe("689461.93");
  });
});

describe("the second case: the grant average is below today's", () => {
  // C below A: version two is negative; it is set off against the other fees; the total is floored at zero (our reading).
  const input = { ...WORKED_EXAMPLE, loan: { ...WORKED_EXAMPLE.loan, grantedOn: "2023-01-01" }, averageAtGrant: effective("4.40") };
  const r = earlyRepaymentFee(input);
  it("version two is negative and is the lower", () => {
    expect(r.discounting!.v2!.lt(0)).toBe(true);
    expect(r.discounting!.binding).toBe("v2");
    expect(r.discounting!.v1!.gt(50000)).toBe(true); // a calculator with version one only would quote this
  });
  it("the reduction does not touch a negative fee; the total is zero, not negative", () => {
    expect(r.discount.eq(r.lower!)).toBe(true);
    expect(r.sum.lt(0)).toBe(true);
    expect(r.floored).toBe(true);
    expect(m2(r.total)).toBe("0.00");
  });
});

describe("the reductions for time served", () => {
  it("under 3 years 0%, 3 to under 5 years 20%, 5 years and more 30%", () => {
    expect(timeServedReduction("2023-07-01", "2026-06-30").percent).toBe(0);
    expect(timeServedReduction("2023-07-01", "2026-08-02").percent).toBe(20);
    expect(timeServedReduction("2023-07-01", "2028-06-30").percent).toBe(20);
    expect(timeServedReduction("2023-07-01", "2028-07-02").percent).toBe(30);
  });
  it("flags the anniversary itself: the table's words do not settle the day", () => {
    expect(timeServedReduction("2023-07-01", "2026-07-01").onBoundary).toBe(true);
    expect(timeServedReduction("2023-07-01", "2026-07-02").onBoundary).toBe(false);
  });
});

describe("notice, and the three small fees", () => {
  it("10 to 45 days ahead is a notice; fewer, none, or more than 45 earn the 0.1% fee", () => {
    expect(noticeStatus("2026-07-03", "2026-08-02")).toMatchObject({ status: "ok", days: 30, feeCharged: false });
    expect(noticeStatus("2026-07-25", "2026-08-02")).toMatchObject({ status: "short", days: 8, feeCharged: true });
    expect(noticeStatus("2026-06-01", "2026-08-02")).toMatchObject({ status: "early", days: 62, feeCharged: true });
    expect(noticeStatus(null, "2026-08-02")).toMatchObject({ status: "none", days: null, feeCharged: true });
  });
  it("the no-notice fee is 0.1% of the amount repaid", () => {
    expect(m2(noNoticeFee("637956.74", noticeStatus(null, "2026-08-02")))).toBe("637.96");
    expect(m2(noNoticeFee("300000", noticeStatus(null, "2026-08-02")))).toBe("300.00");
    expect(m2(noNoticeFee("300000", noticeStatus("2026-07-03", "2026-08-02")))).toBe("0.00");
  });
  it("a second notice within six months of an unused one does not count", () => {
    expect(noticeCounts("2026-01-10", "2026-05-01")).toBe(false);
    expect(noticeCounts("2026-01-10", "2026-07-11")).toBe(true);
    expect(noticeCounts(null, "2026-05-01")).toBe(true);
  });
  it("the operational fee is ₪60, once", () => {
    expect(m2(operationalFee())).toBe("60.00");
  });
  it("the index fee: amount × ½ × the average monthly change, 1st–15th only, linked loans only", () => {
    const base = { amount: "500000", avgMonthlyChangePercent: "0.2", linkage: "linked" as const };
    expect(m2(indexFee({ ...base, repaidOn: "2026-08-10" }))).toBe("500.00");
    expect(m2(indexFee({ ...base, repaidOn: "2026-08-15" }))).toBe("500.00");
    expect(m2(indexFee({ ...base, repaidOn: "2026-08-16" }))).toBe("0.00");
    expect(m2(indexFee({ ...base, linkage: "unlinked", repaidOn: "2026-08-10" }))).toBe("0.00");
    expect(m2(indexFee({ ...base, avgMonthlyChangePercent: "-0.1", repaidOn: "2026-08-10" }))).toBe("0.00");
  });
  it("the average monthly change of index values: 100 → 101 → 102.01 is 1% a month", () => {
    close(averageMonthlyChange(["100", "101", "102.01"]), "1", 10);
  });
});

describe("which tracks, exit points and buckets", () => {
  it("fixed yes, prime no, variable only if it resets less often than yearly", () => {
    expect(discountingFeeApplies({ kind: "fixed" })).toBe(true);
    expect(discountingFeeApplies({ kind: "prime" })).toBe(false);
    expect(discountingFeeApplies({ kind: "variable", resetEveryMonths: 12 })).toBe(false);
    expect(discountingFeeApplies({ kind: "variable", resetEveryMonths: 24 })).toBe(true);
    expect(discountingFeeApplies({ kind: "variable", resetEveryMonths: 60 })).toBe(true);
  });
  it("finds the next reset and the exit point", () => {
    expect(nextReset("2022-01-01", 60, "2026-09-01")).toEqual({ date: "2027-01-01", monthsToReset: 4, isExitPoint: false });
    expect(nextReset("2022-01-01", 60, "2027-01-01")).toEqual({ date: "2027-01-01", monthsToReset: 0, isExitPoint: true });
    expect(nextReset("2022-01-01", 60, "2027-01-02")).toEqual({ date: "2032-01-01", monthsToReset: 60, isExitPoint: false });
  });
  it("a variable track repaid ON its reset day pays only the operational fee; four months earlier it pays more", () => {
    const loan = { principal: "400000", contract: nominal("4.5"), termMonths: 300, grantedOn: "2022-01-01", kind: "variable" as const, resetEveryMonths: 60, linkage: "unlinked" as const };
    const input = { loan, repaidOn: "2027-01-01", averageToday: effective("3.9"), averageAtGrant: effective("4.2"), noticeGivenOn: "2026-12-01" };
    const on = earlyRepaymentFee(input);
    expect(on.status).toBe("exit_point");
    expect(m2(on.total)).toBe("60.00");
    const before = earlyRepaymentFee({ ...input, repaidOn: "2026-09-01", noticeGivenOn: "2026-08-01" });
    expect(before.monthsToReset).toBe(4);
    expect(before.total.gt(60)).toBe(true);
    // The fee falls as the reset approaches
    const far = earlyRepaymentFee({ ...input, repaidOn: "2025-01-01", noticeGivenOn: "2024-12-01" });
    expect(far.discount.gt(before.discount)).toBe(true);
  });
  it("a prime track has no discounting fee, a directed loan no fee at all", () => {
    const loan = { principal: "300000", contract: nominal("5.2"), termMonths: 240, grantedOn: "2024-01-01", kind: "prime" as const };
    const prime = earlyRepaymentFee({ loan, repaidOn: "2026-08-02", averageToday: effective("4.5"), noticeGivenOn: null });
    expect(prime.status).toBe("track_exempt");
    expect(prime.discounting).toBeNull();
    expect(m2(prime.total)).toBe(m2(operationalFee().plus(prime.noNotice))); // ₪60 plus the no-notice fee
    const directed = earlyRepaymentFee({ loan, repaidOn: "2026-08-02", averageToday: effective("4.5"), directed: true });
    expect(m2(directed.total)).toBe("0.00");
  });
  it("buckets by REMAINING time, and flags an edge", () => {
    expect(bucketFor(203, "unlinked").label).toBe("15–20");
    expect(bucketFor(6, "unlinked").label).toBe("≤1");
    expect(bucketFor(400, "unlinked").label).toBe(">25");
    expect(bucketFor(30, "linked").label).toBe("≤5");
    expect(bucketFor(180, "unlinked").onEdge).toBe(true);
    expect(bucketFor(181, "unlinked").onEdge).toBe(false);
  });
});

describe("the fee over time", () => {
  it("steps down when the 5-year reduction starts, other things held still", () => {
    const { loan, averageToday, averageAtGrant } = WORKED_EXAMPLE;
    const rows = feeOverTime({ loan, averageToday, averageAtGrant, noticeGivenOn: null }, ["2028-06-01", "2028-07-02"]);
    expect(rows[0].result.reduction.percent).toBe(20);
    expect(rows[1].result.reduction.percent).toBe(30);
    expect(rows[1].result.lower!.lt(rows[0].result.lower!)).toBe(true);
  });
});
