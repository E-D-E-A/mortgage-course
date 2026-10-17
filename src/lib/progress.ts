/**
 * Where a learner's answers are kept. Today: this browser's localStorage, so
 * the pilot works without a server. Also mirrored, per learner, to the course's
 * Supabase project (progress-sync.ts), behind the same two functions.
 * Storage can be unavailable (private window, blocked site data); every
 * access is guarded and the page works without it.
 */
import { recordSave } from "./progress-sync.ts";

export { pullProgress, pullProgressWithTimeout } from "./progress-sync.ts";

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
  recordSave(key, value); // mirrored to Supabase, debounced and best-effort (see progress-sync.ts)
}

/**
 * Parses what a learner typed as a number: "1,210", "1210 ₪", "1210.5", "5.4%", "−1" (a Unicode minus).
 * Thousands commas, ₪ and % signs, a trailing ש״ח, spaces and invisible direction marks are dropped; what
 * is left must be a plain decimal number with an optional leading sign, or the answer is not a number (null).
 * So "12abc", "1e1", "1.2.3" and "5-" are refused rather than read as some other number.
 */
export function parseAnswer(text: string): number | null {
  const cleaned = text
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/[\u2212\u2012\u2013]/g, "-")
    .replace(/\s*(?:ש["״׳']?ח|שקלים|שקל)\s*$/u, "")
    .replace(/[₪,%\s]/g, "");
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
