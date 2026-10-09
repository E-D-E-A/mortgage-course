/**
 * Stage 0's nodes on the big-picture map: the market and the bank's cost of
 * money (lessons 0.7–0.12). They enter the map at its first version (1.6), so
 * the participants have the money basics to connect to.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  {
    id: "boi_rate",
    label: "ריבית בנק ישראל",
    region: "market",
    lesson: "0.10",
    kind: "factor",
    card: {
      what: "הריבית שבנק ישראל קובע לכסף שהוא מלווה לבנקים ומקבל מהם לזמן קצר.",
      role: "היא משפיעה על עלות הכסף של כל הבנקים, ודרכה על הריביות על הלוואות חדשות.",
      note: "שיעור 0.10.",
    },
  },
  {
    id: "inflation",
    label: "אינפלציה",
    region: "market",
    lesson: "0.7",
    kind: "factor",
    card: {
      what: "עליית המחירים הכללית במשק, כפי שמודדים אותה במדד המחירים לצרכן.",
      role: "בנק ישראל מזיז את הריבית שלו כדי להשפיע עליה. בהלוואה עם הצמדה היא מגדילה גם את החוב.",
      note: "שיעורים 0.7 ו־0.8.",
    },
  },
  {
    id: "bond_yields",
    label: "תשואות אג״ח",
    region: "market",
    lesson: "0.12",
    kind: "factor",
    card: {
      what: "התשואה שהשוק דורש על חוב של הממשלה, לכל אורך זמן: עקום התשואות.",
      role: "היא מראה כמה עולה כסף לתקופה ארוכה, ולכן משפיעה על הריבית שבנק מציע להלוואה ארוכה.",
      note: "שיעורים 0.11 ו־0.12.",
    },
  },
  {
    id: "cost_of_money",
    label: "עלות הכסף",
    region: "bank",
    lesson: "0.9",
    kind: "factor",
    card: {
      what: "כמה עולה לבנק הכסף שהוא מלווה: מה שהוא משלם למפקידים ולמי שמלווה לו.",
      role: "הריבית שהבנק גובה בנויה מעלות הכסף ועוד מרווח.",
      note: "שיעור 0.9.",
    },
  },
];

export const links: MapLink[] = [
  { from: "boi_rate", to: "cost_of_money", label: "משפיעה על עלות הכסף של הבנקים", lesson: "0.10" },
  { from: "inflation", to: "boi_rate", label: "בנק ישראל מזיז את הריבית כדי להשפיע עליה", lesson: "0.10" },
  { from: "bond_yields", to: "cost_of_money", label: "המחיר של כסף לתקופה ארוכה", lesson: "0.12" },
];
