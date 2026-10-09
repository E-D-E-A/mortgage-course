/**
 * The big-picture map (course map, section 5): one map of everything that moves
 * a mortgage, which grows from stage to stage. Each stage adds its nodes and
 * links in its own file (stage-0.ts, stage-1.ts, …); index.ts merges them, and a
 * lesson shows the map as it stands at that lesson.
 */

/** The seven regions of the course map, in the map's order. */
export type RegionId = "market" | "regulation" | "bank" | "client" | "property" | "mix" | "result";

export interface Region {
  id: RegionId;
  label: string;
  /** Shown while the region has no node yet: when it fills. */
  empty: string;
}

export interface MapNode {
  id: string;
  label: string;
  region: RegionId;
  /** The lesson that adds this node to the map ("1.6"). A lesson shows nodes up to its own number. */
  lesson: string;
  /** A participant in the deal (a person or a body), or a factor (a quantity or a rule). */
  kind: "actor" | "factor";
  card: {
    /** What it is, in one or two plain sentences. */
    what: string;
    /** What it does in a mortgage deal. */
    role: string;
    /** When it enters the deal. */
    when?: string;
    /** A caveat: how reliable the card is, or where the topic is taught. */
    note?: string;
  };
}

export interface MapLink {
  from: string;
  to: string;
  /** The mechanism, read as "from → to: label". */
  label: string;
  lesson: string;
}

export interface BigPicture {
  regions: Region[];
  nodes: MapNode[];
  links: MapLink[];
}
