import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { DOCUMENTS, EQUITY_PIECES, EVIDENCE, GAPS, PAYSLIPS } from "../../data/case-a-final.ts";
import { RESERVE } from "../../data/case-a-levers.ts";
import { CASE_A, caseARatio } from "../../data/case-a-mix.ts";
import {
  ALTERNATIVES,
  alternativesOf,
  appraisalTable,
  basisOf,
  bestBank,
  breakEvenAppraisal,
  claimStates,
  countStates,
  depositChecks,
  docStates,
  equityOf,
  financingSheet,
  gapList,
  goalWinner,
  grid,
  householdIncome,
  incomeOf,
  incomeSheet,
  numbersFor,
  offerAt,
  originalRequest,
  payslipRow,
  planOf,
  requestOffers,
  shapesOf,
  startingMix,
  statementRows,
  windowMax,
} from "./casefile.ts";

describe("the payslips, by hand", () => {
  it("Noam: gross 16,500 − 4,100 mandatory = שכר נטו 12,400; − 60 dues = נטו לתשלום 12,340", () => {
    const r = payslipRow(PAYSLIPS.noam[0]);
    expect(r.mandatory.toString()).toBe("4100");
    expect(r.net.toString()).toBe("12400");
    expect(r.netToPay.toString()).toBe("12340");
  });
  it("Shira, regular month: 12,200 − 2,900 = 9,300; no dues, so the same net to pay", () => {
    const r = payslipRow(PAYSLIPS.shira[0]);
    expect(r.net.toString()).toBe("9300");
    expect(r.netToPay.toString()).toBe("9300");
  });
  it("Shira, September: the bonus lifts the net to 10,200; without its 900 the month is 9,300", () => {
    const r = payslipRow(PAYSLIPS.shira[2]);
    expect(r.net.toString()).toBe("10200");
    expect(r.recognisedNet.toString()).toBe("9300");
  });
});

describe("recognised income, by hand", () => {
  it("Noam: three months of 12,400 average 12,400 and match the declared income", () => {
    const n = incomeOf("noam");
    expect(n.recognised.toString()).toBe("12400");
    expect(n.naive.toString()).toBe("12400");
    expect(n.declared.toString()).toBe("12400");
  });
  it("Shira: (9,300 + 9,300 + 10,200) ÷ 3 = 9,600 with the bonus left in; 9,300 without it", () => {
    const s = incomeOf("shira");
    expect(s.naive.toString()).toBe("9600");
    expect(s.oneOffs.toString()).toBe("900");
    expect(s.recognised.toString()).toBe("9300");
  });
  it("the household: recognised 21,700 = declared (the case's figure); the naive total would be 22,000", () => {
    const h = householdIncome();
    expect(h.recognised.toString()).toBe("21700");
    expect(h.declared.toString()).toBe("21700");
    expect(h.naive.toString()).toBe("22000");
  });
});

describe("the account statement", () => {
  const rows = statementRows();
  it("closes at 300,000: the savings in the equity (260,000) plus the savings kept outside it", () => {
    expect(rows[2].closing.toString()).toBe("300000");
    expect(rows[2].closing.minus(RESERVE).toString()).toBe(EQUITY_PIECES[0].declared);
  });
  it("each month opens where the one before closed", () => {
    expect(rows[1].opening.toString()).toBe(rows[0].closing.toString());
    expect(rows[2].opening.toString()).toBe(rows[1].closing.toString());
  });
  it("July: 291,020 + 12,340 + 9,300 − 18,700 = 293,960", () => {
    expect(rows[0].closing.toString()).toBe("293960");
  });
  it("only one deposit differs from the payslip: Noam's August, 240 lower", () => {
    const gaps = depositChecks().filter((c) => !c.gap.isZero());
    expect(gaps).toHaveLength(1);
    expect(gaps[0].person).toBe("noam");
    expect(gaps[0].month).toBe("2026-08");
    expect(gaps[0].gap.toString()).toBe("240");
  });
});

describe("the states of the evidence", () => {
  it("documents: five ok, two with a question, two partial, one missing", () => {
    expect(countStates()).toEqual({ ok: 5, question: 2, partial: 2, missing: 1 });
  });
  it("each document and each claim takes the worst of its evidence", () => {
    const d = docStates();
    expect(d.statement).toBe("question");
    expect(d.fund).toBe("missing");
    expect(d.gift).toBe("partial");
    const c = claimStates();
    expect(c.obligations).toBe("ok");
    expect(c.income_noam).toBe("question");
    expect(c.property).toBe("partial");
  });
  it("every document and claim has evidence, and every open piece has a gap row", () => {
    for (const doc of DOCUMENTS) expect(EVIDENCE.some((e) => e.doc === doc.id)).toBe(true);
    const open = EVIDENCE.filter((e) => e.state !== "ok");
    expect(GAPS).toHaveLength(open.length);
    for (const g of GAPS) expect(open.some((e) => e.doc === g.doc && e.claim === g.claim)).toBe(true);
  });
  it("a document that did not arrive is missing, and only that one", () => {
    const missing = DOCUMENTS.filter((d) => !d.received).map((d) => d.id);
    expect(missing).toEqual(["fund"]);
  });
});

describe("the equity, by view", () => {
  it("declared 560,000 (the case's figure); documented 460,000; verified 260,000", () => {
    expect(equityOf("declared").toString()).toBe(CASE_A.equity);
    expect(equityOf("documented").toString()).toBe("460000");
    expect(equityOf("verified").toString()).toBe("260000");
  });
  it("the three gaps in shekels: the fund 100,000, the gift 200,000, the August deposit 240 and the bonus 300 a month, the price", () => {
    const g = Object.fromEntries(gapList().map((x) => [x.claim, x.amount.toString()]));
    expect(g.equity_fund).toBe("100000");
    expect(g.equity_gift).toBe("200000");
    expect(g.income_noam).toBe("240");
    expect(g.income_shira).toBe("300");
    expect(g.property).toBe("2200000");
  });
});

describe("the sheet of feasibility, by hand", () => {
  const s = incomeSheet();
  it("disposable income 21,700 − 1,450 = 20,250; the largest payments 10,125 (50%) and 8,100 (40%)", () => {
    expect(s.disposable.toString()).toBe("20250");
    expect(s.max50.toString()).toBe("10125");
    expect(s.max40.toString()).toBe("8100");
  });
  it("26 payments left, the rule counts more than 18: 8 payments until it stops; then 21,700 and 8,680", () => {
    expect(s.untilDrop).toBe(8);
    expect(s.disposableAfter.toString()).toBe("21700");
    expect(s.max40After.toString()).toBe("8680");
  });
  it("the family's budget: 21,700 − 1,450 − 11,500 = 8,750, above the bank's 8,100", () => {
    expect(s.maxForBudget.toString()).toBe("8750");
  });
  it("financing: declared equity leaves 1,640,000, 74.55%, 10,000 under the ceiling (1,650,000)", () => {
    const f = financingSheet("declared");
    expect(f.loan.toString()).toBe("1640000");
    expect(f.ltv.toFixed(2)).toBe("74.55");
    expect(f.maxLoan.toString()).toBe("1650000");
    expect(f.room.toString()).toBe("10000");
    expect(f.within).toBe(true);
    expect(f.minEquity.toString()).toBe("550000");
  });
  it("only the verified equity: 1,940,000, 88.18%, above the ceiling by 290,000", () => {
    const f = financingSheet("verified");
    expect(f.loan.toString()).toBe("1940000");
    expect(f.ltv.toFixed(2)).toBe("88.18");
    expect(f.within).toBe(false);
    expect(f.room.toString()).toBe("-290000");
  });
  it("with the gift documented: 1,740,000, 79.09%", () => {
    const f = financingSheet("documented");
    expect(f.loan.toString()).toBe("1740000");
    expect(f.ltv.toFixed(2)).toBe("79.09");
  });
  it("the starting mix: the ratio is stage 5's 40.4% (caseARatio), 8,181 over 20,250", () => {
    const m = startingMix();
    expect(m.ratio.toString()).toBe(caseARatio(m.tracks).toString());
    expect(m.ratio.toFixed(1)).toBe("40.4");
    expect(m.left.toFixed(2)).toBe(new Decimal("21700").minus(m.payment).minus("1450").toFixed(2));
    expect(m.roomTo40.isNegative()).toBe(true);
  });
  it("the appraisal table: the lower of price and appraisal; 1,640,000 breaks the ceiling at 2,150,000", () => {
    const t = appraisalTable();
    expect(t[0].used.toString()).toBe("2200000");
    expect(t[0].within).toBe(true);
    expect(t[2].appraisal.toString()).toBe("2150000");
    expect(t[2].within).toBe(false);
    expect(t[2].maxLoan.toString()).toBe("1612500");
  });
  it("break-even appraisal: a loan of 1,650,000 sits on the ceiling at exactly 2,200,000", () => {
    expect(breakEvenAppraisal("1650000").toString()).toBe("2200000");
    expect(breakEvenAppraisal("1619000").toFixed(2)).toBe("2158666.67");
  });
});

describe("the plan (lesson 6.11 on this file)", () => {
  const p = planOf();
  it("21,000 more equity: 581,000, a loan of 1,619,000, savings 19,000 left", () => {
    expect(p.extraEquity.toString()).toBe("21000");
    expect(p.equity.toString()).toBe("581000");
    expect(p.loan.toString()).toBe("1619000");
    expect(p.reserveAfter.toString()).toBe("19000");
    expect(p.ltv.toFixed(2)).toBe("73.59");
  });
  it("the request is the starting mix's kinds in whole shekels that add up to the loan", () => {
    expect(p.request.map((t) => t.kind)).toEqual(INITIAL_KINDS);
    expect(p.request.reduce((s, t) => s.plus(t.amount), new Decimal(0)).toString()).toBe("1619000");
    expect(p.request.map((t) => t.amount)).toEqual(["539000", "540000", "540000"]);
  });
});
const INITIAL_KINDS = ["prime", "variable_unlinked", "fixed_unlinked"];

describe("the three alternatives", () => {
  it("each adds up to the plan's loan and keeps a third fixed (variable at most 1,079,333)", () => {
    for (const a of ALTERNATIVES) {
      const loan = a.tracks.reduce((s, t) => s.plus(t.amount), new Decimal(0));
      expect(loan.toString()).toBe("1619000");
      const variable = a.tracks.filter((t) => t.kind.startsWith("variable")).reduce((s, t) => s.plus(t.amount), new Decimal(0));
      expect(variable.lte(new Decimal("1619000").mul(2).div(3))).toBe(true);
    }
  });
  it("the shapes: linked 1,079,000 + 540,000; 25 years 1,079,000 + 540,000; fixed 1,619,000", () => {
    expect(ALTERNATIVES.map((a) => a.tracks.map((t) => `${t.kind}:${t.amount}:${t.months}`))).toEqual([
      ["variable_linked:1079000:360", "fixed_linked:540000:360"],
      ["variable_unlinked:1079000:300", "fixed_unlinked:540000:300"],
      ["fixed_unlinked:1619000:360"],
    ]);
    expect(alternativesOf(new Decimal("1640000"))[0].tracks[0].amount).toBe("1093000");
  });
});

describe("the cuts of a loan and the original request", () => {
  it("1,619,000: a third rounds down to 539,000, the other two 540,000; two-thirds rounds down to 1,079,000", () => {
    const c = shapesOf("1619000");
    expect([c.third, c.rest, c.variable, c.fixed].map(String)).toEqual(["539000", "540000", "1079000", "540000"]);
  });
  it("the original request is the starting mix: 546,000 · 547,000 · 547,000, which bank א׳ prices at the list (ratio 40.4 is above its 40 line)", () => {
    expect(originalRequest().map((t) => t.amount)).toEqual(["546000", "547000", "547000"]);
    const o = offerAt("original", "a");
    expect(o.verdict.relief.toString()).toBe("0");
    expect(o.verdict.ratio.toFixed(1)).toBe("40.4");
  });
});

describe("the offers (the banks' rules are the exercise's)", () => {
  it("the plan's request: banks א׳, ב׳, ג׳ approve, bank ד׳ refuses on the financing ratio; only א׳ gives relief (0.15)", () => {
    const o = requestOffers();
    expect(o.map((x) => x.verdict.decision)).toEqual(["approve", "approve", "approve", "refuse"]);
    expect(o.map((x) => x.verdict.relief.toString())).toEqual(["0.15", "0", "0", "0"]);
    expect(o[0].verdict.ratio.toFixed(2)).toBe("39.88");
    expect(o[0].tracks!.map((t) => t.rate)).toEqual(["4.45", "3.95", "4.25"]);
  });
  it("a refused offer has no readings; an approved one has three", () => {
    const refused = offerAt("request", "d");
    expect(refused.readings).toBeNull();
    expect(refused.rise).toBeNull();
    expect(Object.keys(offerAt("request", "a").readings!)).toEqual(["forecast451", "stress", "macro"]);
  });
  it("the first payment is the same in every scenario for an unlinked loan; the stress scenario raises the highest payment", () => {
    const r = offerAt("total", "b").readings!;
    expect(r.forecast451.first.toString()).toBe(r.stress.first.toString());
    expect(r.stress.max.gt(r.forecast451.max)).toBe(true);
    expect(r.macro.max.lt(r.stress.max)).toBe(true);
  });
  it("the fixed alternative does not move with any scenario: rise 0", () => {
    const o = offerAt("exposure", "b");
    expect(o.rise!.toString()).toBe("0");
    expect(o.readings!.stress.total.toString()).toBe(o.readings!.macro.total.toString());
  });
  it("the grid has an offer for every alternative at every bank", () => {
    expect(grid()).toHaveLength(12);
  });
  it("each goal is won at bank ב׳ by the alternative built for it", () => {
    expect(goalWinner("payment", "b")).toBe("payment");
    expect(goalWinner("total", "b")).toBe("total");
    expect(goalWinner("exposure", "b")).toBe("exposure");
  });
  it("the cheapest bank for an alternative is the one with the lowest total on the base scenario", () => {
    for (const a of ALTERNATIVES) {
      const best = bestBank(a.id)!;
      const t = offerAt(a.id, best).readings!.forecast451.total;
      for (const b of ["a", "b", "c"] as const) expect(offerAt(a.id, b).readings!.forecast451.total.gte(t)).toBe(true);
    }
  });
});

describe("when a price comparison is allowed", () => {
  it("the same request at four banks is on one basis", () => {
    expect(basisOf([["request", "a"], ["request", "b"], ["request", "c"]])).toEqual([]);
  });
  it("two alternatives at the same bank differ in the mix, not in the amount", () => {
    expect(basisOf([["payment", "b"], ["total", "b"]])).toEqual(["mix"]);
  });
});

describe("the numbers of a chosen pair", () => {
  it("fixed at bank ב׳: ratio under 40, the financing room to 75%, the break-even appraisal", () => {
    const n = numbersFor("exposure", "b");
    expect(n.approved).toBe(true);
    expect(n.ltvRoom.toString()).toBe("31000");
    expect(n.breakEvenAppraisal.toFixed(2)).toBe("2158666.67");
    expect(n.roomTo40.gt(0)).toBe(true);
    expect(n.roomToRelief!.isNegative()).toBe(true);
  });
  it("a window maximum looks only at the months it is asked for, and the first month it is reached wins ties", () => {
    const p = ["10", "12", "12", "30"].map((x) => new Decimal(x));
    expect(windowMax(p, 3)).toEqual({ value: new Decimal("12"), month: 2 });
    expect(windowMax(p, 4).month).toBe(4);
  });
});
