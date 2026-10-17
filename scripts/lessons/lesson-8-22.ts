/**
 * Lesson 8.22 — where the data comes from: the event log, shadow mode, assisted mode. Stage 8, author D.
 * Status triple: the event log is "Mogi היום" (the team's own record of its capture system, not re-opened);
 * the four mode NAMES are "הוחלט"; what a mode does in practice, and everything that learns, is "עתיד".
 * Numbers: three capture lags (two dates each) and an agreement table of twelve invented cases. All synthetic.
 */
import type { LessonData } from "../build-data.ts";
import { agreementFact, lagFact, totalFact } from "./_drift-facts.ts";

export const B1: [string, string][] = [["A", "A"], ["B", "C"], ["C", "C"], ["D", "A"]];
export const B2: [string, string][] = [["B", "B"], ["A", "A"], ["C", "D"], ["B", "B"]];
export const B3: [string, string][] = [["A", "A"], ["D", "D"], ["C", "B"], ["B", "B"]];

export default function lesson822(): LessonData {
  const facts = [
    lagFact("lag.1", "2026-03-02", "2026-03-02"),
    lagFact("lag.2", "2026-03-04", "2026-03-09"),
    lagFact("lag.3", "2026-03-18", "2026-03-21"),
    agreementFact("ag.b1", B1, "agree"),
    agreementFact("ag.b2", B2, "agree"),
    agreementFact("ag.b3", B3, "agree"),
    agreementFact("ag.b1.rate", B1, "rate"),
    agreementFact("ag.b2.rate", B2, "rate"),
    agreementFact("ag.b3.rate", B3, "rate"),
    totalFact("ag.sum", [2, 3, 3]),
    agreementFact("ag.all", [...B1, ...B2, ...B3], "agree"),
    agreementFact("ag.n", [...B1, ...B2, ...B3], "total"),
    agreementFact("ag.rate", [...B1, ...B2, ...B3], "rate"),
  ];
  return {
    lesson: "8.22",
    title: "מאיפה הדאטה מגיעה: יומן האירועים, מצב צל ומצב מסייע",
    note: "Synthetic: three capture lags and twelve invented cases (the advisor's choice beside the software's). Nothing here is Mogi data. Status: event log = Mogi today (team record); mode names = decided; the rest = future.",
    facts,
  };
}
