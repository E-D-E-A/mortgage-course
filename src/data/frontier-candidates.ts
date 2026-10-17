/**
 * The fifteen candidate mixes of lesson 8.15 (stage-8 author C), defined once. Every one is a mix of the SAME
 * request of case A with a parent joining as a borrower (case-s8.ts: BASE_CHOICE with `parent: true`), priced at bank
 * א׳'s list, the shapes chosen so that the three goals genuinely pull apart (shorter terms: a higher first payment and a
 * lower total; more variable: a lower first payment and a higher exposure). Which of them are feasible, and which are
 * on the frontier, is NEVER typed: constraints.ts and frontier.ts compute it.
 *
 * SYNTHETIC and for illustration: the prices are the course's list, not a bank's offer.
 */
import { type Candidate as CCandidate } from "../lib/calc/constraints.ts";
import type { Candidate as MixCandidate } from "../lib/calc/sensitivity.ts";
import type { TrackKind } from "../lib/calc/schedule.ts";
import { BASE_CHOICE, candidateOf, type Choice, type ShapePart } from "./case-s8.ts";

export const FRONTIER_CHOICE: Choice = { ...BASE_CHOICE, parent: true };

const F = "fixed_unlinked" as const;
const P = "prime" as const;
const V = "variable_unlinked" as const;
const p = (kind: TrackKind, share: number, years = 30): ShapePart => ({ kind, share, years });

interface Entry {
  id: string;
  shape: ShapePart[];
}

export const ENTRIES: Entry[] = [
  { id: "m01", shape: [p(F, 100, 20)] },
  { id: "m02", shape: [p(F, 100, 25)] },
  { id: "m03", shape: [p(F, 100, 30)] },
  { id: "m04", shape: [p(F, 50, 25), p(P, 50, 25)] },
  { id: "m05", shape: [p(F, 50, 30), p(P, 50, 30)] },
  { id: "m06", shape: [p(F, 40, 25), p(V, 60, 25)] },
  { id: "m07", shape: [p(F, 40, 30), p(V, 60, 30)] },
  { id: "m08", shape: [p(F, 60, 25), p(V, 40, 25)] },
  { id: "m09", shape: [p(F, 60, 30), p(V, 40, 30)] },
  { id: "m10", shape: [p(F, 40, 20), p(P, 30), p(V, 30)] },
  { id: "m11", shape: [p(F, 70, 25), p(P, 30, 30)] },
  { id: "m12", shape: [p(F, 34), p(P, 33), p(V, 33)] },
  { id: "m13", shape: [p(F, 50, 20), p(V, 50, 30)] },
  { id: "m14", shape: [p(F, 40, 30), p(P, 60, 20)] },
  { id: "m15", shape: [p(F, 35, 30), p(V, 65, 20)] },
];

const KIND_HE: Record<string, string> = { fixed_unlinked: "קבועה", prime: "פריים", variable_unlinked: "משתנה" };

/** A short Hebrew name from the shape: "קבועה 40% (25 שנה) + משתנה 60% (25 שנה)"; one term when all are equal. */
export function nameOf(shape: ShapePart[]): string {
  const years = new Set(shape.map((s) => s.years));
  const parts = shape.map((s) => (shape.length === 1 ? KIND_HE[s.kind] : `${KIND_HE[s.kind]} ${s.share}%${years.size > 1 ? ` (${s.years})` : ""}`));
  return `${parts.join(" + ")}${years.size === 1 ? `, ${[...years][0]} שנה` : ""}`;
}

export const NAMES: Record<string, string> = Object.fromEntries(ENTRIES.map((e) => [e.id, nameOf(e.shape)]));

/** The candidate with the client's own limits (largest payment, target ratio) as case-s8.ts sets them. */
export function withClientLimits(): CCandidate[] {
  return ENTRIES.map((e) => candidateOf(e.id, FRONTIER_CHOICE, e.shape));
}

/** The same candidates judged by the law and the asked bank only: the client's limits are taken off. */
export function lawOnly(): CCandidate[] {
  return withClientLimits().map((c) => ({ ...c, request: { ...c.request, maxPayment: null, targetRatio: null } }));
}

export const mixCandidates = (): MixCandidate[] => withClientLimits().map((c) => ({ id: c.id, tracks: c.tracks }));
