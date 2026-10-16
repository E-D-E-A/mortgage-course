/**
 * Rounding and display of money. The one place the course decides how a
 * computed value becomes a number on the screen.
 *
 * Rule (stated to the learner in the formula sheet): money is rounded to the
 * agora, half away from zero, only at the end of a calculation — never in the
 * middle of one.
 */
import Decimal from "decimal.js";

export function toAgorot(value: Decimal.Value): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Exact value rounded to agorot, as a plain string: "16288.95". */
export function moneyString(value: Decimal.Value): string {
  return toAgorot(value).toFixed(2);
}

const shekelFormat = new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wholeFormat = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });

/** Intl writes a hyphen-minus (with a direction mark); the course shows the real minus sign. */
const minus = (s: string) => s.replace("-", "−");

/** "16,288.95 ₪" — the agorot are shown. */
export function formatShekels(value: Decimal.Value): string {
  return `${minus(shekelFormat.format(toAgorot(value).toNumber()))} ₪`;
}

/** For running text: "50,000 ₪" when there are no agorot, "59,550.80 ₪" when there are. */
export function formatShekelsText(value: Decimal.Value): string {
  const v = toAgorot(value);
  return v.isInteger() ? formatWholeShekels(v) : formatShekels(v);
}

/** "16,289 ₪" — rounded to the shekel, for illustrations where agorot are noise. */
export function formatWholeShekels(value: Decimal.Value): string {
  return `${minus(wholeFormat.format(new Decimal(value).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()))} ₪`;
}

/** "5%" or "4.5%". */
export function formatPercent(ratePercent: Decimal.Value): string {
  return `${new Decimal(ratePercent).toString()}%`;
}
