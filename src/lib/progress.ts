/**
 * Where a learner's answers are kept. Today: this browser's localStorage, so
 * the pilot works without a server. Later: the course's Supabase project,
 * behind the same two functions, so no component changes.
 * Storage can be unavailable (private window, blocked site data); every
 * access is guarded and the page works without it.
 */
const PREFIX = "mogi-course:";

export function load<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* progress is a convenience here; the lesson still works */
  }
}

/** Parses what a learner typed as a number: "1,210", "1210 ₪", "1210.5". */
export function parseAnswer(text: string): number | null {
  const cleaned = text.replace(/[₪,\s%]/g, "").replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
