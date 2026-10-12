/**
 * Fills the {placeholders} of a factor card's example with the lesson's facts,
 * for the page to hand to FactorCards.vue. Formatting only: every value is a
 * fact ("card.<id>.<name>"), computed in scripts/lessons and rechecked in Python.
 */
import { type FactorCard, GROUP_LABELS } from "../data/factor-cards.ts";
import { formatShekelsText } from "./calc/money.ts";

const date = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
const number = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 3 });

export function fillExample(card: FactorCard, raw: (id: string) => unknown): string {
  return card.example.text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = String(raw(`card.${card.id}.${name}`));
    switch (card.example.formats[name] ?? "number") {
      case "shekels":
        return formatShekelsText(value);
      case "percent":
        return `${value}%`;
      case "date":
        return date.format(new Date(`${value}T12:00:00Z`));
      default:
        return number.format(Number(value));
    }
  });
}


/** The cards as FactorCards.vue takes them: group named, example filled from the lesson's facts. */
export function viewCards(cards: FactorCard[], raw: (id: string) => unknown) {
  return cards.map((c) => ({
    n: c.n,
    id: c.id,
    title: c.title,
    groupLabel: GROUP_LABELS[c.group],
    what: c.what,
    why: c.why,
    effect: c.effect,
    thresholds: c.thresholds,
    levers: c.levers,
    cost: c.cost,
    example: fillExample(c, raw),
    algorithm: c.algorithm.text,
    algorithmKind: c.algorithm.kind,
    sources: c.sources,
    taught: c.taught,
  }));
}
