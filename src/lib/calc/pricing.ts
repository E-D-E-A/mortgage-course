/**
 * Pricing — the arithmetic behind lesson 4.12's rate tower.
 *
 * The tower is a way of thinking, not a price list: a bank's rate on a track is
 * the anchor (lesson 2.1) plus a spread, and the spread can be thought of as a
 * sum of parts that each answer to something different (the risk, the capital,
 * the competition ...). Nobody has given the course the size of any part, so the
 * sizes here are the learner's own teaching numbers. Percent in, percent out,
 * as plain strings: "4.8".
 */
import Decimal from "decimal.js";
import { plain } from "./factors.ts";

export type Numeric = Decimal.Value;

/** Anchor + the parts of the spread, in percent: towerRate("4", ["0.3", "0.2"]) → "4.5". */
export function towerRate(anchorPercent: Numeric, partsPercent: Numeric[]): string {
  return plain(partsPercent.reduce<Decimal>((s, p) => s.plus(p), new Decimal(anchorPercent)));
}

/** The spread alone: the sum of its parts, in percent points. */
export function towerSpread(partsPercent: Numeric[]): string {
  return plain(partsPercent.reduce<Decimal>((s, p) => s.plus(p), new Decimal(0)));
}
