/**
 * Behaviour shared by every page of the course (loaded once by BaseLayout, and kept alive across client-side
 * navigation): the header's state, who is signed in, signing out, "back" controls, the wide-table hint, the
 * course map's progress, and progress sync. Per-page setup goes through onPage(); document-level listeners
 * are registered here, once.
 */
import { enhanceMap, listenForStageToggles } from "./map-client.ts";
import { cameFrom, trackPage } from "./nav.ts";
import { onPage } from "./page.ts";
import { currentUser, endSession, startSync } from "./progress-sync.ts";

function showWho(): void {
  const email = currentUser()?.email ?? "";
  for (const el of document.querySelectorAll<HTMLElement>("[data-who]")) el.textContent = email;
  for (const el of document.querySelectorAll<HTMLElement>("[data-who-row]")) el.classList.toggle("invisible", !email);
}

function markWideTables(): void {
  // A table wider than the screen scrolls sideways inside its box. On a phone nothing shows that, so the
  // learner misses the columns past the edge: say it.
  const islands = new Map<Element, boolean>();
  for (const box of document.querySelectorAll<HTMLElement>("main .overflow-x-auto, main .overflow-auto")) {
    const wide = box.scrollWidth > box.clientWidth + 1;
    // Inside an interactive component the DOM belongs to Vue: inserting an element there breaks hydration.
    // Mark the component's wrapper instead; CSS draws the hint.
    const island = box.closest("astro-island");
    if (island) {
      islands.set(island, (islands.get(island) ?? false) || wide);
      continue;
    }
    let hint = box.previousElementSibling;
    if (!hint?.classList.contains("scroll-hint")) {
      if (!wide) continue;
      hint = document.createElement("p");
      hint.className = "scroll-hint";
      hint.textContent = "הטבלה רחבה מהמסך: יש עוד עמודות משמאל. גללו אותה הצידה כדי לראות אותן.";
      box.before(hint);
    }
    hint.toggleAttribute("hidden", !wide);
  }
  for (const [island, wide] of islands) island.toggleAttribute("data-wide-table", wide);
}

// ---- once per document ----------------------------------------------------------------------

// Signing out: send what is still queued, forget this person's session and saved answers in this browser, then
// let the server end the session. A plain full-page load (data-astro-reload), never a prefetch.
document.addEventListener("click", async (e) => {
  const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-logout]");
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  link.setAttribute("aria-busy", "true");
  await endSession();
  location.assign(link.href);
});

// A "back" control with data-back="history" returns to the page the learner left, keeping its scroll position.
document.addEventListener("click", (e) => {
  const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-back=history]");
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (cameFrom() && history.length > 1) {
    e.preventDefault();
    history.back();
  }
});

listenForStageToggles();
// Newer saved answers from another device arrived: draw them on the map.
document.addEventListener("mogi:progress-pulled", () => {
  enhanceMap();
  showWho();
});

// ---- every page -----------------------------------------------------------------------------

onPage(() => {
  trackPage();
  showWho();

  // The header stays in place between pages; only its current-page mark moves.
  const path = location.pathname.replace(/\/?$/, "/");
  for (const a of document.querySelectorAll<HTMLAnchorElement>("header a[data-nav]")) {
    const here = a.getAttribute("href") === path;
    if (here) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }

  // "Back" controls that go to where the learner came from say so in their address too (new tab, long press).
  const from = cameFrom();
  if (from) for (const a of document.querySelectorAll<HTMLAnchorElement>("a[data-back=history]")) a.setAttribute("href", from);

  enhanceMap();
  markWideTables();
  // Interactive pieces render after load and can change width. The body is replaced on every swap, so the
  // observer is made per page and let go with it.
  const observer = new ResizeObserver(markWideTables);
  observer.observe(document.body);
  addEventListener("resize", markWideTables);
  return () => {
    observer.disconnect();
    removeEventListener("resize", markWideTables);
  };
});

// Progress sync: one start per visit, after the page is up. It brings this learner's saved answers from the
// server (fetching the session from the server when this browser has none) and sends what the server lacks.
const idle = (fn: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
idle(() => void startSync().then(showWho));
