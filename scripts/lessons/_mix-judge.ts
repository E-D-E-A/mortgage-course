/**
 * Shared by lessons 5.9 (is the mix good?) and 5.10 (is the mix realistic?).
 * Not a lesson module: build-data.ts only loads lesson-*.ts and check-*.ts.
 *
 * The household of the two lessons is invented ("הילה ויובל"): a loan of
 * 1,200,000 ₪ over 300 months, priced by two fictional banks. Every rate is the
 * course's own, for teaching; none is a market quote or a bank's offer. The
 * "rise" is a teaching scenario (a rise of the changing rates, once), never a
 * forecast: the Directive 451 forecast is lessons 5.3–5.4's business.
 *
 * The measures (first payment, highest payment, total) come from
 * src/lib/calc/mixcheck.ts, which hands them to metrics.ts (lessons 3.8–3.9);
 * the Python check is metrics.py's met_* kinds. The five lines and the payment
 * of the ratio come through mixcheck.ts to regulation.ts and affordability.ts,
 * and are rechecked by checks/kinds/mixcheck.py.
 */
import Decimal from "decimal.js";
import {
  argMin,
  bestRatePerTrack,
  canChange,
  changingAmount,
  checkMix,
  contractEffective,
  type MixContext,
  type MixTrack,
  mixLoan,
  ratioPayment,
  stressTracks,
  withRates,
} from "../../src/lib/calc/mixcheck.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact } from "../build-data.ts";
import { first, highest, total } from "./lesson-3-8.ts";

export { given, difference } from "./lesson-3-8.ts";

const track = (label: string, type: MixTrack["type"], amount: string, ratePercent: string, months = 300): MixTrack => ({ label, type, amount, ratePercent, months });

/** The tracks of the household's mix, in the order of the lessons' tables. */
export const TRACK_LABELS = ["קבועה לא צמודה", "פריים", "משתנה לא צמודה, כל 5 שנים"] as const;
export const TERM = 300;
export const RISE = "2";

/** The mix as bank א׳ offers it (invented rates). */
export const MIX_A: MixTrack[] = [
  track(TRACK_LABELS[0], "fixed_unlinked", "500000", "4.9"),
  track(TRACK_LABELS[1], "prime", "400000", "3.95"),
  track(TRACK_LABELS[2], "variable_unlinked", "300000", "4.5"),
];
/** The same amounts and terms as bank ב׳ offers it (invented rates). */
export const RATES_B = ["4.7", "4.1", "4.4"];
export const MIX_B: MixTrack[] = withRates(MIX_A, RATES_B);
/** The same mix at the same terms but over 360 months: a different basis. */
export const withTerm = (tracks: MixTrack[], months: number): MixTrack[] => tracks.map((t) => ({ ...t, months }));

/** Bank א׳'s uniform basket 3 (half fixed unlinked, half prime) on the same loan and term; invented rates. */
export const BASKET_3: MixTrack[] = [
  track("קבועה לא צמודה", "fixed_unlinked", "600000", "5.05"),
  track("פריים", "prime", "600000", "3.95"),
];

/** Averages for the yardstick of lesson 5.9: INVENTED, labelled "להמחשה", defined as effective annual rates. */
export const AVERAGES = ["5", "4", "4.55"];

/** A track list as the Python check reads it: "type|amount|rate|months;…". */
export const encMix = (tracks: MixTrack[]) => tracks.map((t) => [t.type, t.amount, t.ratePercent, t.months].join("|")).join(";");

export const effectiveOf = (id: string, nominal: string, decimals: number): Fact => ({
  id,
  kind: "mix_effective",
  inputs: { nominal, decimals },
  value: roundedString(contractEffective(nominal), decimals),
});

/** The monthly rate of a nominal contract rate: ÷ 12 (lesson 0.4), rounded for display. */
export const monthlyOf = (id: string, nominal: string, decimals: number): Fact => ({
  id,
  kind: "mix_monthly",
  inputs: { nominal, decimals },
  value: roundedString(new Decimal(nominal).div(12), decimals),
});

/** a − b in percentage points, from two rate facts, rounded for display. */
export const pointsGap = (id: string, a: Fact, b: Fact, decimals: number): Fact => ({
  id,
  kind: "mix_points_gap",
  inputs: { a: a.id, b: b.id, decimals },
  value: roundedString(new Decimal(a.value as string).minus(b.value as string), decimals),
});

export const loanOf = (id: string, tracks: MixTrack[]): Fact => ({ id, kind: "mix_loan", inputs: { tracks: encMix(tracks) }, value: moneyString(mixLoan(tracks)) });

export const changingOf = (id: string, tracks: MixTrack[]): Fact => ({ id, kind: "mix_changing", inputs: { tracks: encMix(tracks) }, value: moneyString(changingAmount(tracks)) });

export const payOf = (id: string, tracks: MixTrack[], added = "0"): Fact => ({
  id,
  kind: "mix_ratio_payment",
  inputs: { tracks: encMix(tracks), added },
  value: moneyString(ratioPayment(tracks).plus(added)),
});

/** The five lines for a mix: rows {id, kind, limit, actual, status, room}, as reg_check writes them. */
export const mixCheckFact = (id: string, tracks: MixTrack[], ctx: MixContext): Fact => {
  const r = checkMix(tracks, ctx);
  return {
    id,
    kind: "mix_check",
    inputs: { tracks: encMix(tracks), deal: ctx.deal, value: String(ctx.value), income: String(ctx.disposableIncome), added: String(ctx.addedPayment ?? 0) },
    value: r.lines.map((l) => ({
      id: l.id,
      kind: l.kind,
      limit: l.id === "term" ? l.limit.toFixed(0) : percentString(l.limit),
      actual: l.id === "term" ? l.actual.toFixed(0) : percentString(l.actual),
      status: l.status,
      room: l.id === "term" ? l.room.toFixed(0) : moneyString(l.room),
    })),
  };
};

/** The rates no bank offered together: the lowest each track has in any offer, as "4.7,3.95,4.4". */
export const bestRatesFact = (id: string, offers: string[][]): Fact => ({
  id,
  kind: "mix_best_rates",
  inputs: { offers: offers.map((o) => o.join(",")).join("|") },
  value: bestRatePerTrack(offers.map((rates, k) => ({ bank: String(k), rates }))).join(","),
});

/** The 1-based place of the smallest of several facts' values. */
export const argMinFact = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "mix_argmin",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: argMin(parts.map((p) => p.value as string)) + 1,
});

/** The three measures of a mix as facts: `${p}.first`, `${p}.high` (under the rise), `${p}.total` and `${p}.total_s` (total under the rise). */
export function measureFacts(p: string, tracks: MixTrack[], rise = RISE): Fact[] {
  const flat = stressTracks(tracks, 0);
  const stress = stressTracks(tracks, rise);
  return [first(`${p}.first`, flat), highest(`${p}.high`, stress), total(`${p}.total`, flat), total(`${p}.total_s`, stress)];
}

export { canChange };
