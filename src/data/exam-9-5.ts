/**
 * The shape of the final exam (unit 9.5, stage-9 author C): which questions it has and how many points each is worth. The exam has no pass mark. The TEXT of the questions lives in src/pages/lessons/9-5.mdx (their numbers are facts of scripts/lessons/lesson-9-5.ts);
 * the page checks at build time that its questions are exactly these ids. The points are computed from here by lesson-9-5.ts
 * (fact kind exam_points, rechecked in checks/kinds/exam.py), so a question added here is counted everywhere or the build stops.
 *
 * Points: one for every closed question (graded by code) and one for every rubric line of an open question (ticked by the learner after
 * reading the model answer: the learner grades, never a language model).
 */

/** The sections of the exam, in the order of the page. "A" is case A; "0"…"8" are the short questions of each stage. */
export const SECTION_IDS = ["A", "0", "1", "2", "3", "4", "5", "6", "7", "8"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Closed questions (numeric or choice), in page order. */
export const CLOSED: { id: string; section: SectionId }[] = [
  { id: "a1", section: "A" },
  { id: "a2", section: "A" },
  { id: "a3", section: "A" },
  { id: "a4", section: "A" },
  { id: "a5", section: "A" },
  { id: "a6", section: "A" },
  { id: "a7", section: "A" },
  { id: "a8", section: "A" },
  { id: "s0a", section: "0" },
  { id: "s0b", section: "0" },
  { id: "s1a", section: "1" },
  { id: "s1b", section: "1" },
  { id: "s2a", section: "2" },
  { id: "s2b", section: "2" },
  { id: "s3a", section: "3" },
  { id: "s3b", section: "3" },
  { id: "s4a", section: "4" },
  { id: "s4b", section: "4" },
  { id: "s5a", section: "5" },
  { id: "s5b", section: "5" },
  { id: "s6a", section: "6" },
  { id: "s6b", section: "6" },
  { id: "s7a", section: "7" },
  { id: "s7b", section: "7" },
  { id: "s8a", section: "8" },
  { id: "s8b", section: "8" },
];

/** Open questions: the learner writes, then reads the model answer and ticks the rubric lines the answer meets. `lines` = rubric lines = points. */
export const OPEN: { id: string; section: SectionId; lines: number }[] = [
  { id: "o1", section: "A", lines: 5 },
  { id: "o2", section: "A", lines: 4 },
  { id: "o3", section: "A", lines: 4 },
  { id: "o4", section: "5", lines: 4 },
];
