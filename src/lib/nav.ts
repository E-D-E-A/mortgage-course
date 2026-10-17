/**
 * Where the learner came from inside the course, for "back" controls that should return to the page they
 * left (the glossary, reached from any lesson). Kept in sessionStorage because document.referrer does not
 * change when pages are swapped client-side. Everything is guarded: without storage there is simply no
 * "came from", and the back control falls back to the course map.
 */
const CUR = "mogi-course:nav-cur";
const PREV = "mogi-course:nav-prev";

export function backTarget(prev: string | null, here: string): string | null {
  if (!prev || prev === here) return null;
  // A same-site path only; never an address that came from storage and points elsewhere.
  return prev.startsWith("/") && !prev.startsWith("//") && !prev.startsWith("/auth/") && !prev.startsWith("/login") ? prev : null;
}

/** Call once per page shown. Remembers the page before this one. */
export function trackPage(): void {
  try {
    const here = location.pathname + location.search;
    const cur = sessionStorage.getItem(CUR);
    if (cur !== here) {
      if (cur) sessionStorage.setItem(PREV, cur);
      sessionStorage.setItem(CUR, here);
    }
  } catch {
    /* no storage: no "came from" */
  }
}

export function cameFrom(): string | null {
  try {
    return backTarget(sessionStorage.getItem(PREV), location.pathname + location.search);
  } catch {
    return null;
  }
}
