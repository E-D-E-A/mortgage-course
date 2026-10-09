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
});
