/**
 * The big-picture map as it stands at a lesson. A later stage adds its own
 * stage-N.ts (nodes and links), imports it here and adds it to STAGES; nothing else changes.
 */
import * as stage0 from "./stage-0.ts";
import * as stage1 from "./stage-1.ts";
import * as stage2 from "./stage-2.ts";
import * as stage3 from "./stage-3.ts";
import * as stage4 from "./stage-4.ts";
import * as stage4market from "./stage-4-market.ts";
import * as stage5 from "./stage-5.ts";
import * as stage6 from "./stage-6.ts";
import type { BigPicture, MapLink, MapNode, Region } from "./types.ts";

export type { BigPicture, MapLink, MapNode, Region, RegionId } from "./types.ts";

export const REGIONS: Region[] = [
  { id: "market", label: "השוק", empty: "יתמלא בשלבים 0, 2, 4 ו־5." },
  { id: "regulation", label: "הרגולציה", empty: "יתמלא בשלבים 1, 4, 5 ו־7." },
  { id: "bank", label: "הבנק", empty: "יתמלא בשלבים 0 עד 4." },
  { id: "client", label: "הלקוח", empty: "יתמלא בשלבים 1 ו־4." },
  { id: "property", label: "הנכס והעסקה", empty: "יתמלא בשלבים 1 ו־4." },
  { id: "mix", label: "התמהיל", empty: "יתמלא בשלבים 1, 2, 3 ו־5." },
  { id: "result", label: "התוצאה", empty: "יתמלא בשלבים 2 עד 6." },
];

const STAGES = [stage0, stage1, stage2, stage3, stage4, stage4market, stage5, stage6];
const ALL_NODES: MapNode[] = STAGES.flatMap((s) => s.nodes);
const ALL_LINKS: MapLink[] = STAGES.flatMap((s) => s.links);

const order = (id: string) => id.split(".").map(Number);
/** a ≤ b, comparing lesson numbers ("1.10" comes after "1.9"). */
export function notAfter(a: string, b: string): boolean {
  const [as, al] = order(a);
  const [bs, bl] = order(b);
  return as < bs || (as === bs && al <= bl);
}

/** The map as a learner at `lesson` knows it: only nodes and links added up to that lesson. */
export function mapUpTo(lesson: string): BigPicture {
  const nodes = ALL_NODES.filter((n) => notAfter(n.lesson, lesson));
  const ids = new Set(nodes.map((n) => n.id));
  const links = ALL_LINKS.filter((l) => notAfter(l.lesson, lesson) && ids.has(l.from) && ids.has(l.to));
  return { regions: REGIONS, nodes, links };
}
