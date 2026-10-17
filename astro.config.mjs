// @ts-check
import mdx from "@astrojs/mdx";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Static output. Access is enforced in front of every page by a Netlify Edge
// Function (netlify/edge-functions/gate.ts), never by the page itself.
export default defineConfig({
  output: "static",
  integrations: [vue(), mdx()],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
  // No `prefetch` setting on purpose: it would add a script to every page, the public sign-in pages included,
  // and those may load nothing from the gated /_astro/ folder. <ClientRouter /> starts prefetching by itself
  // (links on hover or focus; the ones marked data-astro-prefetch="viewport" when they scroll into view).
  // The sign-out links opt out with data-astro-prefetch="false": a GET to /auth/logout ends the session.
  // Styles go inline so the public sign-in page needs nothing from the gated /_astro/ folder.
  build: { inlineStylesheets: "always" },
});
