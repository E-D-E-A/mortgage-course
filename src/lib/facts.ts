/**
 * The lesson pages' only way to show a computed number: look it up by id in
 * data/lessons/<lesson>.json (written by scripts/build-data.ts) and format it.
 * A missing id fails the build, so a page can never show a number nobody computed.
 */
import { formatShekels, formatShekelsText, formatWholeShekels } from "./calc/money.ts";

interface Fact {
  id: string;
  kind: string;
  inputs: Record<string, string | number>;
  value: unknown;
}

const files = import.meta.glob<{ default: { lesson: string; facts: Fact[] } }>("../../data/lessons/*.json", {
  eager: true,
});

export function facts(lesson: string) {
  const file = Object.values(files).find((f) => f.default.lesson === lesson);
  if (!file) throw new Error(`no data file for lesson ${lesson}; run pnpm data`);
  const byId = new Map(file.default.facts.map((f) => [f.id, f]));
  const get = (id: string): Fact => {
    const fact = byId.get(id);
    if (!fact) throw new Error(`lesson ${lesson}: no fact "${id}" in the data file`);
    return fact;
  };
  return {
    raw: (id: string) => get(id).value,
    /** For running text: "16,288.95 ₪", or "50,000 ₪" when there are no agorot. */
    shekels: (id: string) => formatShekelsText(get(id).value as string),
    /** Always with agorot, for tables: "50,000.00 ₪". */
    shekelsExact: (id: string) => formatShekels(get(id).value as string),
    /** "16,289 ₪" */
    whole: (id: string) => formatWholeShekels(get(id).value as string),
    /** Rounded down to the thousand, for rough answer choices: "16,000 ₪". */
    floorThousands: (id: string) =>
      `${new Intl.NumberFormat("he-IL").format(Math.floor(Number(get(id).value) / 1000) * 1000)} ₪`,
    /** A plain number as written in the data: "12". */
    plain: (id: string) => String(get(id).value),
    rows: <T = Record<string, string>>(id: string) => get(id).value as T[],
  };
}
