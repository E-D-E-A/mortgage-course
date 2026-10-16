/**
 * Fact builders shared by lessons 5.1, 5.2 and 5.3 (stage-5 author A). Not a
 * lesson module: build-data.ts loads only lesson-*.ts and check-*.ts, so this
 * file is imported by those three and nothing else. Every builder records the
 * text forms (src/lib/calc/offers.ts: offerCode, forecastCode) that
 * checks/kinds/offers.py recomputes it from.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  type Basket,
  basisDifferences,
  canSplitExactly,
  compareOffers,
  type Forecast,
  forecastCode,
  impliedRate,
  measureOffer,
  type Offer,
  offerCode,
  offerTracks,
  splitBasket,
  type TrackKind,
  trackOf,
} from "../../src/lib/calc/offers.ts";
import { firstPayment, trackPayments } from "../../src/lib/calc/metrics.ts";
import { roundedString } from "../../src/lib/calc/rates.ts";
import type { Fact } from "../build-data.ts";

export const pack = (o: Offer) => [o.name, o.month, o.forecast, o.upfront, offerCode(o)].join("#");
export const forecastsCode = (fs: Forecast[]) => fs.map((f) => `${f.id}@@${forecastCode(f)}`).join(";;");
const packs = (os: Offer[]) => os.map(pack).join(" | ");

export type MeasureName = "loan" | "received" | "first" | "highest" | "highest_month" | "total" | "irr_monthly" | "rate";

/** One measure of one offer on one forecast (the offer names which). */
export const measure = (id: string, offer: Offer, forecasts: Forecast[], which: MeasureName, decimals = 2): Fact => {
  const f = forecasts.find((x) => x.id === offer.forecast);
  if (!f) throw new Error(`no forecast ${offer.forecast}`);
  const m = measureOffer(offer, f);
  const value =
    which === "highest_month"
      ? m.highestMonth
      : which === "rate"
        ? roundedString(m.expectedTotalRate, decimals)
        : which === "irr_monthly"
          ? roundedString(m.irrMonthly, decimals)
          : which === "first"
            ? m.first
            : which === "highest"
              ? m.highest
              : which === "total"
                ? m.total
                : which === "received"
                  ? m.received
                  : m.loan;
  return { id, kind: "off_measure", inputs: { offer: pack(offer), forecasts: forecastsCode(forecasts), measure: which, decimals }, value };
};

export const split = (id: string, loan: string, basket: Basket): Fact => ({
  id,
  kind: "off_split",
  inputs: { loan, basket: basket.id },
  value: splitBasket(loan, basket),
});

export const canSplit = (id: string, loan: string, basket: Basket): Fact => ({
  id,
  kind: "off_can_split",
  inputs: { loan, basket: basket.id },
  value: canSplitExactly(loan, basket),
});

/** One row per track: kind, amount, term, rate on the day of issue, first payment. */
export const trackRows = (id: string, offer: Offer, forecasts: Forecast[]): Fact => {
  const f = forecasts.find((x) => x.id === offer.forecast);
  if (!f) throw new Error(`no forecast ${offer.forecast}`);
  const tracks = offerTracks(offer, f);
  return {
    id,
    kind: "off_track_rows",
    inputs: { offer: pack(offer), forecasts: forecastsCode(forecasts) },
    value: offer.tracks.map((t, k) => ({
      kind: t.kind,
      amount: moneyString(t.amount),
      months: t.months,
      rate: roundedString(impliedRate(t, f), 4),
      first: moneyString(firstPayment(trackPayments(tracks[k]))),
    })),
  };
};

export const basis = (id: string, offers: Offer[]): Fact => ({ id, kind: "off_basis", inputs: { offers: packs(offers) }, value: basisDifferences(offers) });

export const lowest = (id: string, offers: Offer[], forecasts: Forecast[], which: "rate" | "total" | "highest"): Fact => {
  const c = compareOffers(offers, forecasts);
  const key = which === "rate" ? "expectedTotalRate" : which;
  return {
    id,
    kind: "off_lowest",
    inputs: { offers: packs(offers), forecasts: forecastsCode(forecasts), measure: which },
    value: c.lowest[key].map((k) => offers[k].name),
  };
};

/** A track's rate at the start of each of its first `count` blocks (prime: years; a variable track: resets). The last carries on. */
export const ratePath = (id: string, offer: Offer, forecasts: Forecast[], track: number, count: number): Fact => {
  const f = forecasts.find((x) => x.id === offer.forecast);
  if (!f) throw new Error(`no forecast ${offer.forecast}`);
  const rates = trackOf(offer.tracks[track], f).rates;
  return {
    id,
    kind: "off_rate_path",
    inputs: { offer: pack(offer), forecasts: forecastsCode(forecasts), track, count },
    value: Array.from({ length: count }, (_, k) => roundedString(rates[Math.min(k, rates.length - 1)], 4)),
  };
};

/** One part of a basket: the amount of the first part of a kind. */
export const part = (id: string, loan: string, basket: Basket, kind: TrackKind): Fact => {
  const p = splitBasket(loan, basket).find((x) => x.kind === kind);
  if (!p) throw new Error(`no ${kind} in ${basket.id}`);
  return { id, kind: "off_part", inputs: { loan, basket: basket.id, kind }, value: p.amount };
};

/** loan × percent ÷ 100, to the agora: the slip of writing a third as 33%. */
export const percentOf = (id: string, loan: string, percent: string): Fact => ({
  id,
  kind: "off_percent_of",
  inputs: { loan, percent },
  value: moneyString(new Decimal(loan).mul(percent).div(100)),
});
