/**
 * Illustrative zero curves for lessons 5.4 onwards (stage 5, author B).
 *
 * EVERY CURVE HERE IS INVENTED, to show shapes and to make the arithmetic of
 * the Directive 451 forecast visible. They are NOT the Bank of Israel's
 * workbook, not a copy of it and not a rounded version of it. A page that shows
 * one writes the label below next to it (CURVE_LABEL).
 *
 * A curve is a list of 30 zero yields in percent a year, as strings: index 0 is
 * the yield for 1 year, index 29 for 30 years. Version A is a smooth rising
 * curve, y(t) = start + rise × (1 − e^(−(t−1)/10)), rounded to four decimals
 * (the real workbook, as the team recorded it, shows four: 3.4012), once, here (nominal: 3.20 + 1.50 × …; real: 1.30 + 1.05 × …); the course never
 * computes a yield at run time, so every yield a page shows is a number written
 * in this file. (The Bank of Israel's real workbook, as the
 * team recorded it, has a yield for every month up to 30 years; the course
 * uses whole years only. Reset intervals that are not whole years, such as the
 * 30 months of the directive's supported list, are therefore not forecast here.)
 *
 * Two "versions" stand for two publications of the forecast inputs on two
 * dates. Version B is version A until year 5; beyond it the nominal curve is
 * higher (0.10 more for every year up to year 10, then 0.50 more all the way),
 * and the real curve is unchanged, so the long end is steeper and expected
 * inflation beyond 5 years is higher. Which publication a bank used is what
 * makes two pre-approvals comparable or not (lesson 5.4). (Only the
 * shape matters to a forecast whose offer rate stays the same: if the whole
 * curve moved up in parallel, today's anchor and every forward anchor would move
 * together, the spread would absorb it, and the forecast rates would hardly
 * change. A real offer's rate moves with the market; the course's does not.)
 */

export const CURVE_LABEL = "עקום להמחשה, לא נתוני בנק ישראל";

export type ZeroCurve = string[];

export interface CurveSet {
  /** Shown to the learner: "גרסה א׳" / "גרסה ב׳". */
  label: string;
  /** Zero yields of unlinked government bonds: before inflation. */
  nominal: ZeroCurve;
  /** Zero yields of CPI-linked government bonds: after inflation. */
  real: ZeroCurve;
}

const NOMINAL_A: ZeroCurve = ["3.2000", "3.3427", "3.4719", "3.5888", "3.6945", "3.7902", "3.8768", "3.9551", "4.0260", "4.0901", "4.1482", "4.2007", "4.2482", "4.2912", "4.3301", "4.3653", "4.3972", "4.4260", "4.4521", "4.4756", "4.4970", "4.5163", "4.5338", "4.5496", "4.5639", "4.5769", "4.5886", "4.5992", "4.6088", "4.6175"];
const REAL_A: ZeroCurve = ["1.3000", "1.3999", "1.4903", "1.5721", "1.6462", "1.7131", "1.7737", "1.8286", "1.8782", "1.9231", "1.9637", "2.0005", "2.0337", "2.0638", "2.0911", "2.1157", "2.1380", "2.1582", "2.1764", "2.1930", "2.2079", "2.2214", "2.2337", "2.2447", "2.2547", "2.2638", "2.2720", "2.2794", "2.2861", "2.2922"];
const NOMINAL_B: ZeroCurve = ["3.2000", "3.3427", "3.4719", "3.5888", "3.6945", "3.8902", "4.0768", "4.2551", "4.4260", "4.5901", "4.6482", "4.7007", "4.7482", "4.7912", "4.8301", "4.8653", "4.8972", "4.9260", "4.9521", "4.9756", "4.9970", "5.0163", "5.0338", "5.0496", "5.0639", "5.0769", "5.0886", "5.0992", "5.1088", "5.1175"];
const REAL_B: ZeroCurve = REAL_A;
const NOMINAL_FLAT: ZeroCurve = ["3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000", "3.7000"];
const REAL_FLAT: ZeroCurve = ["1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000", "1.7000"];

export const CURVES: Record<"A" | "B" | "flat", CurveSet> = {
  A: { label: "גרסה א׳", nominal: NOMINAL_A, real: REAL_A },
  B: { label: "גרסה ב׳", nominal: NOMINAL_B, real: REAL_B },
  /** A flat pair of curves: the forecast then equals today's terms. For the lesson's "what if the curve were flat". */
  flat: { label: "עקום שטוח", nominal: NOMINAL_FLAT, real: REAL_FLAT },
};

/** The curve as the independent check reads it: 30 yields, comma-separated. */
export const curveString = (curve: ZeroCurve): string => curve.join(",");
