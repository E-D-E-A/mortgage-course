/**
 * The course map's script: draws this browser's saved progress onto the server-rendered map (opened lessons,
 * check scores, a count per stage), opens the stage the learner is in, and makes each stage's heading a
 * toggle. Everything it fills in has its space reserved by the page, so nothing moves when it runs; it is
 * safe to run again (after a pull of newer progress) and keeps whatever stages the learner opened or closed.
 */
import { pickStage } from "./current-stage.ts";
import { load } from "./progress.ts";

type Check = { score?: number; total?: number; attempts?: number };
const PREFIX = "mogi-course:";

function savedKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k.slice(PREFIX.length));
    }
  } catch {
    /* storage unavailable: show no progress */
  }
  return keys;
}

export function enhanceMap(): void {
  const keys = savedKeys();
  const visited = new Set(keys.filter((k) => k.startsWith("lesson:")).map((k) => k.slice("lesson:".length)));
  // Every list of lessons (the map, the glossary) marks the ones already opened.
  for (const row of document.querySelectorAll<HTMLElement>("a[data-lesson]")) {
    row.toggleAttribute("data-opened", visited.has(row.dataset.lesson ?? ""));
  }
  const map = document.querySelector<HTMLElement>("[data-course-map]");
  if (!map) return;
  const exerciseIds = keys.filter((k) => k.startsWith("exercise:") && !k.endsWith(":first")).map((k) => k.slice("exercise:".length));
  // An exercise id is its lesson id, or the lesson id followed by "-…" ("4.2-3").
  const inLesson = (id: string, lessons: Set<string>) => lessons.has(id) || lessons.has(id.split("-")[0]);

  // The page's own head script already set this before the first paint on a full load; after a client-side swap
  // it may not have run yet, so the same answer is worked out here, before anything is drawn.
  const current = (() => {
    try {
      return pickStage(localStorage, location.hash);
    } catch {
      return 0;
    }
  })();
  document.documentElement.setAttribute("data-cur", String(current));
  let visitedTotal = 0;
  let lessonsTotal = 0;
  let checksDone = 0;
  const stageEls = map.querySelectorAll<HTMLElement>(".stage");
  for (const stage of stageEls) {
    const id = stage.dataset.stage ?? "";
    const line = stage.querySelector<HTMLElement>(".stage-progress");
    const lessons = new Set((line?.dataset.lessons ?? "").split(",").filter(Boolean));
    const seen = [...lessons].filter((l) => visited.has(l)).length;
    const exercises = exerciseIds.filter((e) => inLesson(e, lessons)).length;
    const check = load<Check>(`check:${id}`);
    const answered = typeof check?.score === "number" && typeof check?.total === "number";

    const text = stage.querySelector<HTMLElement>(".stage-progress-text");
    if (text) text.textContent = `${seen} מתוך ${lessons.size} שיעורים נפתחו`;
    const ex = stage.querySelector<HTMLElement>(".stage-exercises");
    if (ex) ex.textContent = `תרגילים שנעשו: ${exercises}`;
    stage.querySelector<HTMLElement>(".stage-done")?.classList.toggle("hidden", !answered);
    const mark = stage.querySelector<HTMLElement>(".check-score");
    if (mark) mark.textContent = answered ? `${check!.score} מתוך ${check!.total}` : "";
    stage.querySelector<HTMLElement>("a[data-check-row]")?.toggleAttribute("data-opened", answered);

    visitedTotal += seen;
    lessonsTotal += lessons.size;
    if (answered) checksDone++;

    // The first paint already showed the right stage open (html[data-cur]); from here the attribute is the state.
    if (!stage.hasAttribute("data-open")) stage.dataset.open = String(Number(id) === current);
    stage.querySelector(".stage-toggle")?.setAttribute("aria-expanded", stage.dataset.open ?? "false");
  }

  const overall = document.getElementById("overall-progress");
  if (overall) {
    overall.textContent =
      visitedTotal > 0 || checksDone > 0 || exerciseIds.length > 0
        ? `ההתקדמות שלכם: ${visitedTotal} מתוך ${lessonsTotal} שיעורים נפתחו, ${checksDone} מתוך ${stageEls.length} בדיקות סיום נענו.`
        : "עוד לא פתחתם שיעור. כל שיעור שתפתחו יסומן כאן.";
    overall.setAttribute("data-ready", "");
  }
  map.setAttribute("data-ready", "");
  // Opening and closing animates, but never the state the page arrives in.
  if (!map.hasAttribute("data-anim")) requestAnimationFrame(() => requestAnimationFrame(() => map.setAttribute("data-anim", "")));
}

/** One click handler for the whole document, registered once: a stage's heading opens and closes it. */
export function listenForStageToggles(): void {
  document.addEventListener("click", (e) => {
    const button = (e.target as Element | null)?.closest?.<HTMLElement>(".stage-toggle");
    const stage = button?.closest<HTMLElement>(".stage");
    if (!button || !stage) return;
    const open = stage.dataset.open !== "true";
    stage.dataset.open = String(open);
    button.setAttribute("aria-expanded", String(open));
  });
}
