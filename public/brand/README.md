`mogi-logo.png` is copied from E-D-E-A/edea-mortgage, commit 6156bf8, file
`apps/advisor-web/src/assets/mogi-logo.png` (the handoff logo with its transparent margin trimmed).
The logo never flips in RTL. On a navy surface it sits on a white chip.

`mogi-course-*.svg` and `mogi-course-favicon-*.png` are the course logo (2026-10-24): the Mogi mark traced from the
handoff logo, an open book under it, and the course name in Heebo 700, converted to outlines. The sign-in page and
the tab icon use them, so they are listed in `isPublicPath` (netlify/edge-functions/lib/auth.ts).
