/**
 * What a bank's public pre-approval form asks you to write — the arithmetic
 * behind lesson 4.13 (the four banks' questionnaires).
 *
 * The forms ask for the same facts in different units and definitions: a
 * child is someone "up to 18" in one form and "up to 21" in another; one form
 * counts the people living at home; a self-employed income is asked yearly in
 * one form and as a monthly average in another. These helpers turn one
 * household's facts into the number each form asks for. They say nothing about
 * what a bank later counts in its own check (stage 4, lessons 4.1–4.3).
 *
 * The forms do not say whether "עד גיל 18" includes a child who has just turned
 * 18. Here a child counts when the age is below the limit; the lesson's examples
 * avoid the limit year itself, so that choice never decides an answer.
 *
 * Amounts are strings or Decimals in shekels; results are exact Decimals,
 * rounded to the agora only for display (money.ts). Recomputed independently
 * in checks/kinds/forms.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

function wholeAge(age: number): number {
  if (!Number.isInteger(age) || age < 0) throw new RangeError(`an age is a whole number of at least 0, got ${age}`);
  return age;
}

/** How many children a form counts when it asks for "children up to `limitAge`": ages below the limit. 4, 19, 20 with 18 → 1; with 21 → 3. */
export function childrenUnder(ages: number[], limitAge: number): number {
  wholeAge(limitAge);
  return ages.map(wholeAge).filter((a) => a < limitAge).length;
}

/** The people living at home, as a form that asks for the household's size counts them: the adults and every child who lives there. */
export function householdSize(adults: number, childAgesAtHome: number[]): number {
  if (!Number.isInteger(adults) || adults < 1) throw new RangeError(`a household has at least one adult, got ${adults}`);
  childAgesAtHome.forEach(wholeAge);
  return adults + childAgesAtHome.length;
}

/** A yearly amount as a monthly average: yearly ÷ 12. Exact. 210,000 → 17,500. */
export function monthlyFromYearly(yearly: Numeric): Decimal {
  const y = new Decimal(yearly);
  if (y.isNegative()) throw new RangeError("a yearly income is not negative");
  return y.div(12);
}
