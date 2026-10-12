/**
 * Fact builders for lessons 4.10, 4.11 and 4.12 (stage-4 author D). Not a lesson
 * module: build-data.ts loads only lesson-*.ts and check-*.ts. Every computed
 * fact is one step of src/lib/calc/factors.ts (kind "fc_<op>"), which
 * checks/kinds/factors.py recomputes with its own arithmetic.
 */
import type { Fact } from "../build-data.ts";
import { type CardCalc, calcInputs, evaluateSteps, runCalc } from "../../src/lib/calc/factors.ts";
import type { FactorCard } from "../../src/data/factor-cards.ts";
import { towerRate, towerSpread } from "../../src/lib/calc/pricing.ts";

/** A bag of facts for one lesson: a calculation names earlier facts by id. */
export class FactBag {
  readonly facts: Fact[] = [];
  private readonly values = new Map<string, string>();
  private readonly v = (id: string) => {
    const x = this.values.get(id);
    if (x === undefined) throw new Error(`no fact "${id}" yet`);
    return x;
  };
  private push(f: Fact) {
    if (this.values.has(f.id)) throw new Error(`duplicate fact ${f.id}`);
    this.values.set(f.id, String(f.value));
    this.facts.push(f);
    return f;
  }
  /** A teaching input. */
  given(id: string, value: string): Fact {
    return this.push({ id, kind: "given", inputs: {}, value });
  }
  /** A computed value; the operands are ids of facts already in the bag. */
  calc(id: string, calc: CardCalc): Fact {
    return this.push({ id, kind: `fc_${calc.op}`, inputs: calcInputs(calc, this.v), value: runCalc(calc, this.v) });
  }
  /** Lesson 4.12: the anchor plus the parts of the spread, in percent (checks/kinds/factors.py: pr_tower_rate). */
  towerRate(id: string, anchorId: string, partIds: string[]): Fact {
    const parts = partIds.map((p) => this.v(p));
    return this.push({ id, kind: "pr_tower_rate", inputs: { anchor: this.v(anchorId), parts: parts.join("|") }, value: towerRate(this.v(anchorId), parts) });
  }
  towerSpread(id: string, partIds: string[]): Fact {
    const parts = partIds.map((p) => this.v(p));
    return this.push({ id, kind: "pr_tower_spread", inputs: { parts: parts.join("|") }, value: towerSpread(parts) });
  }
  get(id: string): string {
    return this.v(id);
  }
  /** All the steps of a card's example, as facts "card.<card id>.<step name>". */
  card(card: FactorCard) {
    const prefix = `card.${card.id}.`;
    const renamed = card.example.steps.map((s) => ({
      ...s,
      name: prefix + s.name,
      calc: s.calc && (Object.fromEntries(Object.entries(s.calc).map(([k, x]) => [k, k === "op" || k === "decimals" ? x : Array.isArray(x) ? x.map((n) => prefix + n) : prefix + x])) as CardCalc),
    }));
    for (const s of evaluateSteps(renamed)) this.push({ id: s.name, kind: s.kind, inputs: s.inputs, value: s.value });
  }
}
