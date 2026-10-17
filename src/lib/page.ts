/**
 * Runs `setup` for every page the learner is shown, not only the first one.
 *
 * The site navigates client-side (ClientRouter), so one document lives for the whole visit and a script on a
 * page runs once, not once per page. Anything that needs the current page's elements goes through here: it
 * runs right after a swap (before the new page is painted) and again on "astro:page-load", but only once per
 * body, and the cleanup `setup` returns runs before the next page's setup, so no listener or observer is left
 * pointing at a page that is gone. Also runs for a plain full load, and when called after the page has loaded.
 */
export function onPage(setup: () => void | (() => void)): void {
  let lastBody: Element | null = null;
  let cleanup: void | (() => void);
  const run = () => {
    if (lastBody === document.body) return;
    lastBody = document.body;
    try {
      cleanup?.();
    } catch {
      /* a failing cleanup must not stop the next page */
    }
    cleanup = undefined;
    try {
      cleanup = setup();
    } catch (e) {
      console.error(e);
    }
  };
  document.addEventListener("astro:after-swap", run);
  document.addEventListener("astro:page-load", run);
  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run, { once: true });
}
