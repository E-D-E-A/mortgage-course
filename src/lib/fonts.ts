/**
 * Heebo, self-hosted from @fontsource/heebo (OFL-1.1), as the advisor app does: no request to Google Fonts.
 *
 * The @font-face rules are built here from fontsource's own stylesheets (so unicode ranges stay exactly its)
 * with each file's built, hashed URL, and printed by the layouts as one <style> that is identical on every
 * page. Hebrew and Latin (digits and letters) use `font-display: block`: text waits for the font, which the
 * layouts preload, instead of showing in another font and jumping. The rare subsets keep `swap`.
 */
const css = import.meta.glob("/node_modules/@fontsource/heebo/{400,500,600,700}.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const files = import.meta.glob("/node_modules/@fontsource/heebo/files/heebo-*-{400,500,600,700}-normal.woff2", { query: "?url", import: "default", eager: true }) as Record<string, string>;

const urlOf = (name: string): string => {
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${name}.woff2`));
  if (!hit) throw new Error(`Heebo file ${name}.woff2 not found`);
  return hit[1];
};

export const fontFaceCss: string = Object.keys(css)
  .sort()
  .map((k) => css[k])
  .join("\n")
  .replace(/src:\s*url\(\.\/files\/([\w-]+)\.woff2\)[^;]*;/g, (_m, name) => `src:url(${urlOf(name)}) format("woff2");`)
  .replace(/\/\*[^*]*\*\//g, "")
  .replace(/font-display:\s*swap;/g, (_m, offset, whole: string) => {
    // the Hebrew and Latin faces block; everything else swaps
    return /heebo-(hebrew|latin)-\d/.test(whole.slice(whole.lastIndexOf("@font-face", offset), whole.indexOf("}", offset))) ? "font-display:block;" : "font-display:swap;";
  })
  .replace(/\s+/g, " ")
  .trim();

/** The files every page needs at once, in the order they matter. */
export const preloadFonts: string[] = ["hebrew-400", "hebrew-600", "hebrew-700", "latin-400", "latin-600", "hebrew-500", "latin-500", "latin-700"].map((n) => urlOf(`heebo-${n}-normal`));
