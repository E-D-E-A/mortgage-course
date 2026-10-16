/**
 * The teaching offers of stage 5 (lessons 5.1–5.3, and whoever imports them later).
 *
 * Everything here is INVENTED, to illustrate. The three banks are fictional ("בנק א׳",
 * "בנק ב׳", "בנק ג׳"); their rates are the course's, not market quotes; the two
 * forecasts are teaching paths, not the Bank of Israel's published forecast
 * inputs; the borrowers (דנה ויואב) are not the case of נועם ושירה.
 * Label wherever shown: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד;
 * אינם הצעת בנק או נתוני שוק עדכניים".
 */
import { type Basket, type BankRates, basketById, basketOffer, type Forecast, type Offer } from "../lib/calc/offers.ts";

export const EXAMPLE_LABEL = "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים";

/** The loan of דנה ויואב: 900,000 ₪ over 25 years. It divides exactly by 2 and by 3. */
export const EXAMPLE_LOAN = "900000.00";
export const EXAMPLE_MONTHS = 300;
export const EXAMPLE_MONTH = "2026-10";

/** The first illustrative forecast. The anchors rise a little and flatten. */
export const FORECAST_A: Forecast = {
  id: "forecast_a",
  label: "תחזית להמחשה א׳",
  month: EXAMPLE_MONTH,
  prime: ["5.00", "5.20", "5.40", "5.50"],
  variableLinked: ["2.00", "2.40", "2.60"],
  variableUnlinked: ["3.80", "4.30", "4.60"],
  inflation: "2.5",
};

/** The second: rates rise faster, and inflation is higher. A different forecast, never to be mixed with the first in one comparison. */
export const FORECAST_B: Forecast = {
  id: "forecast_b",
  label: "תחזית להמחשה ב׳",
  month: EXAMPLE_MONTH,
  prime: ["5.00", "5.80", "6.50", "6.80"],
  variableLinked: ["2.00", "3.00", "3.50"],
  variableUnlinked: ["3.80", "5.00", "5.60"],
  inflation: "3.2",
};

/** The first forecast's shape, a month later: the anchors moved a little. A different month is a different forecast (the Bank of Israel publishes twice a month). */
export const FORECAST_C: Forecast = {
  id: "forecast_c",
  label: "תחזית להמחשה, נובמבר",
  month: "2026-11",
  prime: ["5.10", "5.30", "5.50", "5.60"],
  variableLinked: ["2.10", "2.50", "2.70"],
  variableUnlinked: ["3.90", "4.40", "4.70"],
  inflation: "2.5",
};

export const FORECASTS: Forecast[] = [FORECAST_A, FORECAST_B, FORECAST_C];

/** The month an offer measured on this forecast is dated: a forecast belongs to one month. */
export const monthOf = (forecast: string): string => {
  const f = FORECASTS.find((x) => x.id === forecast);
  if (!f) throw new RangeError(`no forecast ${forecast}`);
  return f.month;
};

export interface ExampleBank {
  id: "a" | "b" | "c";
  name: string;
  rates: BankRates;
  /** The bank's own proposed basket: a mix of its choosing. */
  proposed: (forecast: string) => Offer;
}

const rates: Record<"a" | "b" | "c", BankRates> = {
  a: { fixed: "5.15", primeMargin: "-0.65", variableMargin: "1.30" },
  b: { fixed: "5.05", primeMargin: "-0.30", variableMargin: "1.40" },
  c: { fixed: "5.30", primeMargin: "-0.55", variableMargin: "0.85" },
};

const proposedOf = (id: "a" | "b" | "c"): ExampleBank["proposed"] => (forecast) => {
  const r = rates[id];
  const name = `בנק ${id === "a" ? "א׳" : id === "b" ? "ב׳" : "ג׳"}`;
  // Each bank proposes its own mix: that is where banks differ (and why proposed baskets are not comparable by price).
  const mixes = {
    a: [
      { kind: "fixed_unlinked", amount: "360000.00", months: 300, rate: "5.05" },
      { kind: "prime", amount: "360000.00", months: 300, margin: "-0.55" },
      { kind: "fixed_linked", amount: "180000.00", months: 300, rate: "3.10" },
    ],
    b: [
      { kind: "fixed_unlinked", amount: "450000.00", months: 300, rate: r.fixed },
      { kind: "prime", amount: "300000.00", months: 180, margin: r.primeMargin },
      { kind: "variable_unlinked", amount: "150000.00", months: 300, margin: "1.20" },
    ],
    c: [
      { kind: "fixed_unlinked", amount: "300000.00", months: 300, rate: r.fixed },
      { kind: "prime", amount: "600000.00", months: 300, margin: r.primeMargin },
    ],
  } as const;
  return { name, month: monthOf(forecast), forecast, upfront: "0.00", tracks: mixes[id].map((t) => ({ ...t })) as Offer["tracks"] };
};

export const BANKS: ExampleBank[] = (["a", "b", "c"] as const).map((id) => ({
  id,
  name: `בנק ${id === "a" ? "א׳" : id === "b" ? "ב׳" : "ג׳"}`,
  rates: rates[id],
  proposed: proposedOf(id),
}));

/** A bank's offer on a uniform basket, for the example loan. */
export function uniformOffer(bank: ExampleBank, basket: Basket, forecast: string, loan: string = EXAMPLE_LOAN, upfront = "0.00", months: number = EXAMPLE_MONTHS): Offer {
  return basketOffer({ name: bank.name, month: monthOf(forecast), forecast, basket, loan, months, rates: bank.rates, upfront });
}

export { basketById };
