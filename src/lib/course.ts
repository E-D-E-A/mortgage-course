import course from "../data/course.json";

export interface LessonRef {
  id: string;
  title: string;
  prereqs: string[];
}

const built = new Set(
  Object.keys(import.meta.glob("../pages/lessons/*.mdx")).map((p) => p.match(/(\d+)-(\d+)\.mdx$/)!.slice(1).join(".")),
);

export const stages = course.stages;
export const allLessons: (LessonRef & { stage: number })[] = course.stages.flatMap((s) =>
  s.lessons.map((l) => ({ ...l, stage: s.id })),
);

export const isBuilt = (id: string) => built.has(id);
export const lessonHref = (id: string) => `/lessons/${id.replace(".", "-")}/`;
export const lessonById = (id: string) => allLessons.find((l) => l.id === id);
export const stageOf = (id: string) => course.stages.find((s) => s.lessons.some((l) => l.id === id))!;

export function neighbours(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return { prev: allLessons[i - 1], next: allLessons[i + 1] };
}

// Each stage ends with a completion check, src/pages/checks/<stage>.mdx. A
// stage opens only after the previous stage's check is passed (StageLock).
const checksBuilt = new Set(
  Object.keys(import.meta.glob("../pages/checks/*.mdx")).map((p) => Number(p.match(/(\d+)\.mdx$/)![1])),
);
export const isCheckBuilt = (stage: number) => checksBuilt.has(stage);
export const checkHref = (stage: number) => `/checks/${stage}/`;
export const stageById = (id: number) => course.stages.find((s) => s.id === id);
