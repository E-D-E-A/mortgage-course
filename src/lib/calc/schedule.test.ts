import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { annuityPayment, annuityStatement, equalPrincipalSchedule, equalPrincipalStatement, indexPath, pathSchedule } from "./amortization.ts";
import { moneyString } from "./money.ts";
import {
  exposure,
  indexFactorsFromIndex,
  interimInterest,
  mixCashFlow,
  mixFromInputs,
  mixInputs,
  mixSummary,
  oneFormulaPayment,
  pathInputs,
  rateChangesPath,
  recalculatedPayment,
  recalculationSteps,
  resetPoints,
  scheduleFromInputs,
  scheduleFromPaths,
  scheduleStart,
  scheduleTotals,
  splitLoan,
  trackRatePath,
  trackSchedule,
  type TrackSpec,
} from "./schedule.ts";

const close = (a: Decimal.Value, b: Decimal.Value, places = 10) =>
  expect(new Decimal(a).minus(b).abs().lt(new Decimal(10).pow(-places))).toBe(true);

describe("one track, month by month", () => {
  it("is amortization.ts's pathSchedule for the level payment", () => {
    const rates = rateChangesPath("4.25", 240, [{ month: 61, rate: "5.25" }]);
    const factors = indexPath(["2"], 12, 240);
    const ours = scheduleFromPaths("600000", rates, factors);
    const theirs = pathSchedule("600000", rates, factors);
    for (const k of [0, 59, 60, 61, 239]) {
      expect(ours[k].payment.toString()).toBe(theirs[k].payment.toString());
      expect(ours[k].closing.toString()).toBe(theirs[k].closing.toString());
    }
  });

  it("is amortization.ts's equal-principal schedule when nothing moves", () => {
    const ours = scheduleFromPaths("120000", rateChangesPath("6", 120), undefined, "equal_principal");
    const theirs = equalPrincipalSchedule("120000", "6", 120);
    for (const k of [0, 1, 59, 119]) close(ours[k].payment, theirs[k].payment);
    // By hand: 1,000 of principal and 120,000 × 0.5% = 600 of interest in month 1.
    expect(moneyString(ours[0].payment)).toBe("1600.00");
  });

  it("indexes the balance before each payment, from the first month (checked by hand)", () => {
    // 1,000 at 12% a year (1% a month) over 2 months; the index goes 100 → 101 → 101.
    const rows = scheduleFromPaths("1000", ["12", "12"], indexFactorsFromIndex(["100", "101"], 2));
    // Month 1: 1,000 × 1.01 = 1,010; interest 10.10; payment = 507.5124… × 1.01 = 512.5876…
    expect(rows[0].opening.toString()).toBe("1010");
    expect(moneyString(rows[0].indexation)).toBe("10.00");
    expect(moneyString(rows[0].interest)).toBe("10.10");
    expect(moneyString(rows[0].payment)).toBe("512.59");
    expect(moneyString(rows[0].paymentIndexation)).toBe("5.08");
    // Month 2: the index did not move; the last payment clears the balance.
    expect(rows[1].indexation.toString()).toBe("0");
    expect(moneyString(rows[1].payment)).toBe("512.59");
    expect(rows[1].closing.toString()).toBe("0");
  });

  it("pays C × M ÷ M₀ on a linked track at a fixed rate, even when the index falls", () => {
    const index = ["100", "100.3", "100.5", "100.4"];
    const rows = scheduleFromPaths("400000", rateChangesPath("3", 240), indexFactorsFromIndex(index, 240));
    const c = annuityPayment("400000", "3", 240);
    index.slice(1).forEach((m, k) => close(rows[k].payment, c.mul(m).div(100)));
    expect(rows[2].indexation.isNeg()).toBe(true);
    close(rows[239].indexRatio, "1.004");
  });

  it("adds up: paid = loan + interest + indexation", () => {
    const rows = scheduleFromPaths("400000", rateChangesPath("3", 240), indexPath(["2"], 12, 240));
    const t = scheduleTotals(rows);
    close(t.paid, new Decimal(400000).plus(t.interest).plus(t.indexation), 8);
    close(t.principalPaid, new Decimal(400000).plus(t.indexation), 8);
  });

  it("recalculates the payment on the balance left, over the months left", () => {
    const rows = scheduleFromPaths("600000", rateChangesPath("4.25", 240, [{ month: 61, rate: "5.25" }]));
    close(rows[60].payment, recalculatedPayment(rows[59].closing, "5.25", 180));
    expect(rows[239].closing.toString()).toBe("0");
  });
});

describe("statement rounding (teaching tables)", () => {
  const same = (ours: { opening: Decimal; payment: Decimal; interest: Decimal; principalPaid: Decimal; closing: Decimal }[], theirs: typeof ours) => {
    expect(ours).toHaveLength(theirs.length);
    ours.forEach((r, k) => {
      for (const f of ["opening", "payment", "interest", "principalPaid", "closing"] as const) expect(r[f].toString(), `month ${k + 1} ${f}`).toBe(theirs[k][f].toString());
    });
  };

  it("is annuityStatement row for row on a flat unlinked Spitzer path", () => {
    same(scheduleFromPaths("600000", rateChangesPath("4.8", 240), undefined, "spitzer", "statement"), annuityStatement("600000", "4.8", 240));
    same(scheduleFromPaths("400000", rateChangesPath("3", 240), undefined, "spitzer", "statement"), annuityStatement("400000", "3", 240));
    same(scheduleFromPaths("12000", rateChangesPath("6", 12), undefined, "spitzer", "statement"), annuityStatement("12000", "6", 12));
  });

  it("is equalPrincipalStatement row for row on a flat unlinked equal-principal path", () => {
    same(scheduleFromPaths("500000", rateChangesPath("4.8", 240), undefined, "equal_principal", "statement"), equalPrincipalStatement("500000", "4.8", 240));
    same(scheduleFromPaths("100", rateChangesPath("12", 3), undefined, "equal_principal", "statement"), equalPrincipalStatement("100", "12", 3));
  });

  it("keeps every row in agorot and every row adds up, on a linked track with a rate change", () => {
    const rows = scheduleFromPaths("400000", rateChangesPath("3", 240, [{ month: 61, rate: "4" }]), indexPath(["2"], 12, 240), "spitzer", "statement");
    let previous = new Decimal("400000");
    for (const r of rows) {
      for (const v of [r.opening, r.payment, r.interest, r.principalPaid, r.closing]) expect(v.decimalPlaces()).toBeLessThanOrEqual(2);
      expect(r.payment.minus(r.interest).toString()).toBe(r.principalPaid.toString());
      expect(r.opening.minus(r.principalPaid).toString()).toBe(r.closing.toString());
      expect(r.opening.minus(previous).toString()).toBe(r.indexation.toString());
      previous = r.closing;
    }
    expect(rows[239].closing.toString()).toBe("0");
  });

  it("indexes and rounds the balance, and pays the printed C × M_k ÷ M_0 rounded, on a linked track (checked by hand)", () => {
    // 1,000 at 12% a year over 2 months; the index goes 100 → 101.
    const rows = scheduleFromPaths("1000", ["12", "12"], indexFactorsFromIndex(["100", "101"], 2), "spitzer", "statement");
    // Month 1: 1,010.00; interest 10.10; C = 507.51 (507.5124…), × 101 ÷ 100 = 512.5851 → 512.59.
    expect([rows[0].opening, rows[0].interest, rows[0].payment, rows[0].closing].map(moneyString)).toEqual(["1010.00", "10.10", "512.59", "507.51"]);
    // Month 2: the index did not move, interest 5.08 (5.0751), the last payment clears 507.51.
    expect([rows[1].interest, rows[1].payment, rows[1].closing].map(moneyString)).toEqual(["5.08", "512.59", "0.00"]);
  });

  it("keeps lesson 2.5's rule on the printed payment: 1,211.70 × 100.4 ÷ 100 = 1,216.55 (lesson 3.5's worked example)", () => {
    const rows = scheduleFromPaths("250000", rateChangesPath("3.2", 300), indexFactorsFromIndex(["100", "100.4"], 300), "spitzer", "statement");
    expect(moneyString(annuityPayment("250000", "3.2", 300))).toBe("1211.70");
    expect([rows[0].opening, rows[0].interest, rows[0].payment, rows[0].principalPaid, rows[0].closing].map(moneyString)).toEqual(["251000.00", "669.33", "1216.55", "547.22", "250452.78"]);
  });

  it("recalculates on the balance left at a rate change, over the months left", () => {
    const rows = scheduleFromPaths("500000", rateChangesPath("4.8", 240, [{ month: 37, rate: "6" }]), undefined, "spitzer", "statement");
    expect(moneyString(rows[36].payment)).toBe(moneyString(recalculatedPayment(rows[35].closing, "6", 204)));
    expect(rows[239].closing.toString()).toBe("0");
  });

  it("threads through a track, a mix and flat inputs, and stays exact by default", () => {
    const track: TrackSpec = { kind: "fixed_unlinked", amount: "600000", rate: "4.8", months: 240 };
    const st = annuityStatement("600000", "4.8", 240);
    expect(trackSchedule({ ...track, rounding: "statement" })[239].payment.toString()).toBe(st[239].payment.toString());
    expect(mixCashFlow([track], { rounding: "statement" })[239].payment.toString()).toBe(st[239].payment.toString());
    expect(scheduleFromInputs(pathInputs({ principal: "600000", months: 240, rate: "4.8", rounding: "statement" }))[239].payment.toString()).toBe(st[239].payment.toString());
    expect(trackSchedule(track)[0].payment.toString()).toBe(annuityPayment("600000", "4.8", 240).toString());
    const back = mixFromInputs(mixInputs([{ ...track, rounding: "statement" }], { rounding: "statement" }));
    expect(back.tracks[0].rounding).toBe("statement");
    expect(back.scenario.rounding).toBe("statement");
  });
});

describe("the recalculated payment, step by step", () => {
  it("is the 3.1 formula on the balance left (checked by hand)", () => {
    // 1,000 left, 2 months, 12% a year: r = 0.01; 1.01^−2 = 0.980296…; 10 ÷ 0.019703… = 507.51
    const s = recalculationSteps("1000", "12", 2);
    expect(s.r.toString()).toBe("0.01");
    expect(s.power.toDecimalPlaces(6).toString()).toBe("0.980296");
    expect(s.top.toString()).toBe("10");
    expect(moneyString(s.payment)).toBe("507.51");
    close(s.payment, recalculatedPayment("1000", "12", 2));
  });

  it("lists every rate change with the balance and months left at that moment", () => {
    const rows = scheduleFromPaths("400000", rateChangesPath("5", 240, [{ month: 13, rate: "5.5" }, { month: 49, rate: "5.25" }]));
    const points = resetPoints(rows);
    expect(points.map((p) => [p.month, p.monthsLeft, p.rate.toString()])).toEqual([[13, 228, "5.5"], [49, 192, "5.25"]]);
    close(points[0].payment, recalculatedPayment(points[0].balance, "5.5", 228));
  });
});

describe("rate paths", () => {
  it("changes from the month named, in order", () => {
    const p = rateChangesPath("4", 10, [{ month: 8, rate: "6" }, { month: 3, rate: "5" }]);
    expect(p.map(String)).toEqual(["4", "4", "5", "5", "5", "5", "5", "6", "6", "6"]);
    expect(() => rateChangesPath("4", 10, [{ month: 11, rate: "5" }])).toThrow(RangeError);
  });

  it("moves prime with the scenario, and a variable track only at its reset points", () => {
    const prime: TrackSpec = { kind: "prime", amount: "100000", rate: "4.25", months: 240 };
    const p = trackRatePath(prime, { primeShift: ["0", "1"] });
    expect([p[11], p[12], p[239]].map(String)).toEqual(["4.25", "5.25", "5.25"]);

    const variable: TrackSpec = { kind: "variable_unlinked", amount: "100000", rate: "4.7", months: 240 };
    // The anchor is 1 point higher from year 2 on, but the rate waits for month 61.
    const v = trackRatePath(variable, { anchorShift: ["0", "1"] });
    expect([v[0], v[12], v[59], v[60], v[239]].map(String)).toEqual(["4.7", "4.7", "4.7", "5.7", "5.7"]);
    // Every 30 months instead: the first reset is after month 30.
    const v30 = trackRatePath({ ...variable, resetMonths: 30 }, { anchorShift: ["0", "1"] });
    expect([v30[29], v30[30]].map(String)).toEqual(["4.7", "5.7"]);
    // A linked variable track reads its own anchor when one is given.
    const vl = trackRatePath({ ...variable, kind: "variable_linked", rate: "3.25" }, { anchorShift: ["1"], linkedAnchorShift: ["0.5"] });
    expect(vl[60].toString()).toBe("3.75");
  });

  it("keeps a fixed track's rate whatever the scenario, and refuses a rate below zero", () => {
    const fixed: TrackSpec = { kind: "fixed_unlinked", amount: "100000", rate: "5", months: 120 };
    expect(trackRatePath(fixed, { primeShift: ["3"], anchorShift: ["3"] }).every((r) => r.eq(5))).toBe(true);
    expect(() => trackRatePath({ kind: "prime", amount: "1", rate: "1", months: 24 }, { primeShift: ["0", "-2"] })).toThrow(RangeError);
  });

  it("indexes only linked tracks", () => {
    const s = { inflation: ["2"] };
    const unlinked = trackSchedule({ kind: "fixed_unlinked", amount: "100000", rate: "3", months: 120 }, s);
    const linked = trackSchedule({ kind: "fixed_linked", amount: "100000", rate: "3", months: 120 }, s);
    expect(unlinked[119].indexRatio.toString()).toBe("1");
    close(linked[11].indexRatio, "1.02");
    close(linked[11].payment, unlinked[11].payment.mul("1.02"));
  });
});

describe("a mix: one cash flow", () => {
  const tracks: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "300000", rate: "5", months: 360 },
    { kind: "prime", amount: "200000", rate: "4.25", months: 144 },
  ];

  it("adds the tracks month by month, each with its own term", () => {
    const flow = mixCashFlow(tracks);
    expect(flow).toHaveLength(360);
    const a = annuityPayment("300000", "5", 360);
    const b = annuityPayment("200000", "4.25", 144);
    close(flow[0].payment, a.plus(b));
    close(flow[143].payment, a.plus(b));
    close(flow[144].payment, a); // the short track has ended
    expect(flow[144].byTrack[1].toString()).toBe("0");
    close(flow[359].balance, 0);
  });

  it("finds the first payment, the highest one in a scenario, and the total", () => {
    const flat = mixSummary(mixCashFlow(tracks));
    close(flat.firstPayment, flat.maxPayment);
    expect(flat.maxMonth).toBe(1);
    const up = mixSummary(mixCashFlow(tracks, { primeShift: ["0", "2"] }));
    expect(up.maxMonth).toBe(13);
    expect(up.maxPayment.gt(up.firstPayment)).toBe(true);
    const total = mixCashFlow(tracks).reduce((s, m) => s.plus(m.payment), new Decimal(0));
    close(flat.totalPaid, total);
  });

  it("ties equal payments to the agora: the first month wins", () => {
    expect(mixSummary(mixCashFlow(tracks)).maxMonth).toBe(1);
  });

  it("shows how far one formula for the whole mix is from the sum of its tracks", () => {
    // Weighted rate (300 × 5 + 200 × 4.25) ÷ 500 = 4.7%; weighted term (300 × 360 + 200 × 144) ÷ 500 = 273.6 → 274 months.
    close(oneFormulaPayment(tracks), annuityPayment("500000", "4.7", 274));
    expect(oneFormulaPayment(tracks).lt(mixCashFlow(tracks)[0].payment)).toBe(true);
  });

  it("measures the exposure in shekels and in percent", () => {
    const e = exposure([...tracks, { kind: "variable_linked", amount: "100000", rate: "3", months: 240 }, { kind: "fixed_linked", amount: "100000", rate: "3", months: 240 }]);
    expect(e.total.toString()).toBe("700000");
    expect(e.prime.toString()).toBe("200000");
    expect(e.linked.toString()).toBe("200000");
    expect(e.fixedForTerm.toString()).toBe("400000");
    expect(e.resetting.toString()).toBe("100000");
    expect(moneyString(e.share.fixedForTerm)).toBe("57.14");
  });

  it("splits a loan so the tracks add up to it exactly", () => {
    const parts = splitLoan("1000000", ["33.33", "33.33", "33.34"]);
    expect(parts.reduce((s, p) => s.plus(p), new Decimal(0)).toString()).toBe("1000000");
  });
});

describe("the start of a schedule (Directive 451 §17, as the team transcribed it)", () => {
  it("counts from the 1st of the month up to the 15th, and from the next 1st after it", () => {
    expect(scheduleStart("2026-11-10")).toEqual({ start: "2026-11-01", firstPayment: "2026-12-01", interimDays: 9, direction: "credit" });
    expect(scheduleStart("2026-11-15")).toEqual({ start: "2026-11-01", firstPayment: "2026-12-01", interimDays: 14, direction: "credit" });
    expect(scheduleStart("2026-11-16")).toEqual({ start: "2026-12-01", firstPayment: "2027-01-01", interimDays: 15, direction: "charge" });
    expect(scheduleStart("2026-11-20")).toEqual({ start: "2026-12-01", firstPayment: "2027-01-01", interimDays: 11, direction: "charge" });
    expect(scheduleStart("2026-12-20")).toEqual({ start: "2027-01-01", firstPayment: "2027-02-01", interimDays: 12, direction: "charge" });
    expect(scheduleStart("2026-11-01").direction).toBe("none");
    expect(() => scheduleStart("2026-02-30")).toThrow(RangeError);
  });

  it("charges interest by the day for the interim period (÷ 365, the course's assumption)", () => {
    // 400,000 × 3% × 11 ÷ 365 = 361.6438…
    expect(moneyString(interimInterest("400000", "3", 11))).toBe("361.64");
  });
});

describe("flat inputs for facts", () => {
  it("round-trip a path", () => {
    const i = pathInputs({ principal: "400000", months: 240, rate: "3", index: ["100", "100.3"], changes: [{ month: 61, rate: "4" }] });
    expect(i).toMatchObject({ principal: "400000", months: 240, method: "spitzer", rate: "3", index_0: "100", index_1: "100.3", change_1_month: 61, change_1_rate: "4" });
    const rows = scheduleFromInputs(i);
    close(rows[0].payment, annuityPayment("400000", "3", 240).mul("1.003"));
    expect(rows[60].rate.toString()).toBe("4");
  });

  it("round-trip a mix and its scenario", () => {
    const tracks: TrackSpec[] = [
      { kind: "fixed_linked", amount: "200000", rate: "3", months: 300, method: "equal_principal" },
      { kind: "variable_unlinked", amount: "300000", rate: "4.7", months: 240, method: "spitzer", resetMonths: 60 },
    ];
    const scenario = { inflation: ["2"], anchorShift: ["0", "1"], blockMonths: 12 };
    const back = mixFromInputs(mixInputs(tracks, scenario));
    expect(back.tracks).toEqual(tracks);
    expect(back.scenario).toEqual(scenario);
  });
});
