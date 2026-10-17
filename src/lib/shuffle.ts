// A deterministic shuffle of choice options, seeded by an id (the same on the server and in the browser).
// Returns [item, authored index] pairs: the index is what is saved and compared, so an author's `correct`
// keeps meaning the position in the written array. `keepOrder` returns the written order (scales).
export function shuffledWithIndex<T>(items: readonly T[], id: string, keepOrder = false): [T, number][] {
  const out = items.map((o, i) => [o, i] as [T, number]);
  if (keepOrder) return out;
  let seed = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  for (let i = out.length - 1; i > 0; i--) {
    const k = Math.floor(next() * (i + 1));
    [out[i], out[k]] = [out[k], out[i]];
  }
  return out;
}
