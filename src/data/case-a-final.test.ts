import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { CASE_A } from "./case-a-mix.ts";
import { EXAMPLE_LABEL } from "./case-a-offers.ts";
import { CLAIMS, DOCUMENTS, EQUITY_PIECES, EVIDENCE, FILE, FINAL_LABEL, GAPS, LIVING_BUDGET, PAYSLIPS } from "./case-a-final.ts";

describe("the whole file of case A keeps the numbers of the earlier stages", () => {
  it("the equity pieces add up to the case's equity", () => {
    expect(EQUITY_PIECES.reduce((s, p) => s.plus(p.declared), new Decimal(0)).toString()).toBe(CASE_A.equity);
  });
  it("the file repeats the case: price, incomes, the car loan", () => {
    expect(FILE.price).toBe(CASE_A.price);
    expect(Object.values(FILE.incomes)).toEqual(CASE_A.netIncomes);
    expect(FILE.car).toEqual(CASE_A.car);
  });
  it("a regular payslip's net is the declared income of its owner", () => {
    for (const p of ["noam", "shira"] as const) {
      const regular = PAYSLIPS[p][0];
      const mandatory = regular.mandatory.reduce((s, d) => s.plus(d.amount), new Decimal(0));
      expect(new Decimal(regular.gross).minus(mandatory).toString()).toBe(FILE.incomes[p]);
    }
  });
  it("the living budget is a whole amount below the recognised income", () => {
    expect(new Decimal(LIVING_BUDGET).lt(CASE_A.recognisedIncome)).toBe(true);
  });
});

describe("the structure of the evidence", () => {
  it("every piece of evidence names a document and a claim that exist", () => {
    for (const e of EVIDENCE) {
      expect(DOCUMENTS.some((d) => d.id === e.doc)).toBe(true);
      expect(CLAIMS.some((c) => c.id === e.claim)).toBe(true);
    }
  });
  it("document ids and claim ids are unique", () => {
    expect(new Set(DOCUMENTS.map((d) => d.id)).size).toBe(DOCUMENTS.length);
    expect(new Set(CLAIMS.map((c) => c.id)).size).toBe(CLAIMS.length);
  });
  it("every claim has at least one document, and every gap points at a piece of evidence that is not ok", () => {
    for (const c of CLAIMS) expect(EVIDENCE.some((e) => e.claim === c.id)).toBe(true);
    for (const g of GAPS) expect(EVIDENCE.find((e) => e.doc === g.doc && e.claim === g.claim)?.state).not.toBe("ok");
  });
});

describe("the label", () => {
  it("every worked table of stage 9 carries the course's example label", () => {
    expect(FINAL_LABEL.startsWith(EXAMPLE_LABEL)).toBe(true);
  });
});
