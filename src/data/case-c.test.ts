import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { WORKED_EXAMPLE, earlyRepaymentFee } from "../lib/calc/earlyrepay.ts";
import { existingLoan } from "../lib/calc/refinance.ts";
import { CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, FEE_CASE, OPERATIONAL_FEE } from "./case-c.ts";

describe("case C", () => {
  it("is the loan of the early-repayment worked example", () => {
    expect(WORKED_EXAMPLE.loan.principal).toBe(FEE_CASE.principal);
    expect(new Decimal(WORKED_EXAMPLE.loan.contract.percent).eq(FEE_CASE.rate)).toBe(true);
    expect(WORKED_EXAMPLE.loan.termMonths).toBe(FEE_CASE.term);
    expect(WORKED_EXAMPLE.loan.grantedOn).toBe(FEE_CASE.granted);
    expect(WORKED_EXAMPLE.repaidOn).toBe(FEE_CASE.repaid);
    expect(new Decimal(WORKED_EXAMPLE.averageToday.percent).eq(FEE_CASE.avgToday)).toBe(true);
    expect(new Decimal(WORKED_EXAMPLE.averageAtGrant?.percent ?? "0").eq(FEE_CASE.avgGrant)).toBe(true);
  });

  it("has the fee the refinance examples use: the discounting fee after the time-served reduction, and the 60", () => {
    const r = earlyRepaymentFee(WORKED_EXAMPLE);
    expect(r.discount?.toFixed(2)).toBe(CASE_C_DISCOUNT_FEE);
    expect(r.operational.toFixed(2)).toBe(OPERATIONAL_FEE);
    expect(r.total.toFixed(2)).toBe("10365.95");
  });

  it("owes the balance of the worked example after 37 payments", () => {
    expect(CASE_C_PAID).toBe(37);
    const loan = existingLoan([{ track: CASE_C_LOAN, paymentsMade: CASE_C_PAID, fee: CASE_C_DISCOUNT_FEE }], OPERATIONAL_FEE);
    expect(loan.whole.balance.toFixed(2)).toBe("637956.74");
    expect(loan.whole.months).toBe(203);
  });
});
