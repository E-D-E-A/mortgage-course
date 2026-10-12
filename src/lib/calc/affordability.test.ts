import { describe, expect, it } from "vitest";
import {
  addedToPayment,
  affordability,
  assessmentMonthly,
  averageMonthly,
  classifyObligation,
  declaredIncome,
  deductedObligations,
  disposableIncome,
  monthlyFromAnnual,
  monthsUntilDrop,
  type Obligation,
  obligationsFromInput,
  obligationsToInput,
  overMonthsLine,
  paymentToIncome,
  payslipNet,
  payslipNetToPay,
  qualifyingPayment,
  ratioPayment,
  recognisedIncome,
} from "./affordability.ts";
import { moneyString } from "./money.ts";
import { percentString } from "./percent.ts";

describe("payslip", () => {
  it("net pay is gross minus the mandatory deductions", () => {
    // Brain 43384833's example: 11,200 − 2,800 = 8,400.
    expect(payslipNet("11200", ["2800"]).toString()).toBe("8400");
    // 10,700 − (900 + 950 + 650) = 10,700 − 2,500 = 8,200 (by hand).
    expect(payslipNet("10700", ["900", "950", "650"]).toString()).toBe("8200");
  });

  it("net to pay takes the other deductions off the net pay", () => {
    // 8,400 − 550 = 7,850 (Brain 43384833); 8,200 − 400 − 50 = 7,750.
    expect(payslipNetToPay("8400", ["550"]).toString()).toBe("7850");
    expect(payslipNetToPay("8200", ["400", "50"]).toString()).toBe("7750");
  });
});

describe("averages and annual amounts", () => {
  it("averages months exactly", () => {
    // (8,150 + 8,200 + 8,250) ÷ 3 = 24,600 ÷ 3 = 8,200.
    expect(averageMonthly(["8150", "8200", "8250"]).toString()).toBe("8200");
    // (8,000 + 8,000 + 8,001) ÷ 3 = 8,000.333…, kept exact; shown as 8,000.33.
    expect(moneyString(averageMonthly([8000, 8000, 8001]))).toBe("8000.33");
    expect(() => averageMonthly([])).toThrow(RangeError);
  });

  it("divides an annual amount by 12", () => {
    expect(monthlyFromAnnual("96000").toString()).toBe("8000");
    expect(moneyString(monthlyFromAnnual("100000"))).toBe("8333.33");
  });

  it("reads tax assessments two ways", () => {
    // Oldest first: 84,000 then 96,000. Latest: 96,000 ÷ 12 = 8,000. Average: 180,000 ÷ 24 = 7,500.
    expect(assessmentMonthly(["84000", "96000"], "latest").toString()).toBe("8000");
    expect(assessmentMonthly(["84000", "96000"], "average").toString()).toBe("7500");
  });
});

describe("income lines", () => {
  const lines = [
    { label: "אבי", declared: "11000", recognised: "7500", status: "review" as const },
    { label: "מיכל", declared: "8200", recognised: "8200", status: "included" as const },
    { label: "שכירות", declared: "2000", recognised: "0", status: "excluded" as const },
  ];
  it("adds what was declared", () => {
    expect(declaredIncome(lines).toString()).toBe("21200");
  });
  it("counts only included lines unless review lines are asked for", () => {
    expect(recognisedIncome(lines).toString()).toBe("8200");
    expect(recognisedIncome(lines, { countReview: true }).toString()).toBe("15700");
  });
});

describe("the 18-month line", () => {
  it("counts only more than 18 months", () => {
    expect(overMonthsLine(26)).toBe(true);
    expect(overMonthsLine(19)).toBe(true);
    expect(overMonthsLine(18)).toBe(false);
    expect(overMonthsLine(0)).toBe(false);
  });
  it("treats an unknown end as more than 18 months", () => {
    expect(overMonthsLine(null)).toBe(true);
  });
  it("says how many payments are left before an obligation stops counting", () => {
    expect(monthsUntilDrop(26)).toBe(8);
    expect(monthsUntilDrop(18)).toBe(0);
    expect(monthsUntilDrop(5)).toBe(0);
  });
});

describe("classifyObligation", () => {
  it("takes a long loan off the income", () => {
    expect(classifyObligation({ kind: "loan", monthly: "1450", monthsLeft: 26 })).toEqual({ placement: "income", reason: "over_months", flagged: false });
  });
  it("ignores a loan about to end", () => {
    expect(classifyObligation({ kind: "loan", monthly: "400", monthsLeft: 10 }).placement).toBe("none");
  });
  it("counts an obligation with no end date, flagged", () => {
    expect(classifyObligation({ kind: "alimony", monthly: "2000", monthsLeft: null })).toEqual({ placement: "income", reason: "no_end_date", flagged: true });
  });
  it("counts rent that goes on, whatever is left on the lease", () => {
    expect(classifyObligation({ kind: "rent", monthly: "4200", monthsLeft: 6, rentContinues: true }).placement).toBe("income");
    expect(classifyObligation({ kind: "rent", monthly: "4200", monthsLeft: 40, rentContinues: false }).placement).toBe("none");
  });
  it("sends a same-property mortgage to the payment, another property's to the income", () => {
    expect(classifyObligation({ kind: "mortgage", monthly: "2100", monthsLeft: 120, mortgage: "same_property" }).placement).toBe("payment");
    expect(classifyObligation({ kind: "mortgage", monthly: "2100", monthsLeft: 120, mortgage: "other_property" }).placement).toBe("income");
    expect(classifyObligation({ kind: "mortgage", monthly: "2100", monthsLeft: 120, mortgage: "repaid" }).placement).toBe("none");
    expect(classifyObligation({ kind: "mortgage", monthly: "2100", monthsLeft: 12, mortgage: "same_property" }).placement).toBe("none");
  });
});

describe("disposable income and the ratio", () => {
  const caseA: Obligation[] = [{ kind: "loan", monthly: "1450", monthsLeft: 26 }];
  it("takes counted obligations off the income", () => {
    // 21,700 − 1,450 = 20,250 (lesson 1.9).
    expect(deductedObligations(caseA).toString()).toBe("1450");
    expect(disposableIncome("21700", caseA).toString()).toBe("20250");
  });
  it("never counts a payment twice", () => {
    const list: Obligation[] = [
      { kind: "loan", monthly: "1000", monthsLeft: 30 },
      { kind: "mortgage", monthly: "2000", monthsLeft: 100, mortgage: "same_property" },
    ];
    // The loan is taken off the income, the mortgage added to the payment — each once.
    expect(deductedObligations(list).toString()).toBe("1000");
    expect(addedToPayment(list).toString()).toBe("2000");
    expect(ratioPayment("5000", list).toString()).toBe("7000");
  });
  it("divides the payment by the disposable income", () => {
    // 6,186.17 ÷ 19,200 × 100 = 32.2196…%; ÷ 15,700 = 39.4023…%.
    expect(percentString(paymentToIncome("6186.17", "19200"))).toBe("32.22");
    expect(percentString(paymentToIncome("6186.17", "15700"))).toBe("39.4");
    // 5,000 ÷ 10,000 = exactly 50.
    expect(paymentToIncome(5000, 10000).toString()).toBe("50");
    expect(() => paymentToIncome(1000, 0)).toThrow(RangeError);
  });
  it("does it all at once", () => {
    const r = affordability({ income: "21700", obligations: caseA, newPayment: "6000" });
    expect(r.disposable.toString()).toBe("20250");
    expect(r.payment.toString()).toBe("6000");
    // 6,000 ÷ 20,250 = 29.6296…%.
    expect(percentString(r.ratioPercent!)).toBe("29.63");
    expect(affordability({ income: "1000", obligations: [{ kind: "loan", monthly: "1200", monthsLeft: 40 }], newPayment: "1" }).ratioPercent).toBeNull();
  });
});

describe("qualifyingPayment", () => {
  it("uses the first payment of an ordinary loan", () => {
    // Brain's worked example: 700,000 at 5.90% for 240 months → 4,974.72.
    expect(moneyString(qualifyingPayment({ amount: "700000", ratePercent: "5.9", months: 240 }))).toBe("4974.72");
    // Equal principal: 240,000 ÷ 240 = 1,000, plus 240,000 × 6% ÷ 12 = 1,200 → 2,200.
    expect(qualifyingPayment({ amount: "240000", ratePercent: "6", months: 240, method: "equal_principal" }).toString()).toBe("2200");
  });
  it("uses the payment after grace", () => {
    // Brain ENG-223: 1,000,000 at 4.5%, 300 months, 12 of grace → 5,684.25 after it.
    expect(moneyString(qualifyingPayment({ amount: "1000000", ratePercent: "4.5", months: 300, graceMonths: 12 }))).toBe("5684.25");
  });
  it("uses the monthly interest of a bullet", () => {
    // 600,000 × 5% ÷ 12 = 2,500.
    expect(qualifyingPayment({ amount: "600000", ratePercent: "5", months: 120, bullet: true }).toString()).toBe("2500");
  });
  it("grows the debt in full grace", () => {
    // 120,000 at 12% (1% a month), 2 months of full grace: 120,000 × 1.01² = 122,412; then 12 equal-principal months:
    // 122,412 ÷ 12 + 1,224.12 = 10,201 + 1,224.12 = 11,425.12.
    expect(qualifyingPayment({ amount: "120000", ratePercent: "12", months: 14, graceMonths: 2, grace: "full", method: "equal_principal" }).toString()).toBe("11425.12");
  });
});

describe("obligations as fact input", () => {
  it("round-trips", () => {
    const list: Obligation[] = [
      { kind: "loan", monthly: "1450", monthsLeft: 26 },
      { kind: "rent", monthly: "4200", monthsLeft: 6, rentContinues: true },
      { kind: "alimony", monthly: "1800", monthsLeft: null },
      { kind: "mortgage", monthly: "2100", monthsLeft: 120, mortgage: "same_property" },
    ];
    const text = obligationsToInput(list);
    expect(text).toBe("loan,1450,26|rent,4200,6,continues|alimony,1800,-|mortgage,2100,120,same_property");
    expect(obligationsToInput(obligationsFromInput(text))).toBe(text);
    expect(obligationsFromInput("")).toEqual([]);
  });
});
