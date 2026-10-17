/**
 * Which stage of the course map is open when the map first appears: the one in the link's #stage-N, else the
 * stage of the lesson the learner opened last, else stage 0.
 *
 * This function is also printed into an inline script in the map page's HTML (index.astro), so that the right
 * stage is open on the very first paint with no flash. For that it must stay self-contained: no imports, no
 * outside names, no constants from this file.
 */
export function pickStage(storage: Pick<Storage, "getItem" | "key" | "length">, hash: string): number {
  try {
    const fromLink = /^#stage-(\d+)$/.exec(hash);
    if (fromLink) return Number(fromLink[1]);
    const prefix = "mogi-course:";
    const last = JSON.parse(storage.getItem(prefix + "last-lesson") || "null");
    if (last && typeof last.id === "string" && /^\d+\./.test(last.id)) return Number(last.id.split(".")[0]);
    let best = -1;
    let bestAt = "";
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key || key.indexOf(prefix + "lesson:") !== 0) continue;
      const value = JSON.parse(storage.getItem(key) || "null");
      const at = value && typeof value.at === "string" ? value.at : "";
      const stage = Number(key.slice((prefix + "lesson:").length).split(".")[0]);
      if (at >= bestAt && Number.isFinite(stage)) {
        bestAt = at;
        best = stage;
      }
    }
    return best >= 0 ? best : 0;
  } catch {
    return 0;
  }
}
