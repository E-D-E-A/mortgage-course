// Shared helpers for the stage-8 scenes of author C (8.15-8.21). Not a scene: the renderer only loads video/<lesson>.html.
// A scene calls `const v = await boot("8-15")` and draws with the helpers; every number comes from /data/lessons/<lesson>.json.
export async function boot(lesson) {
  const data = await (await fetch(`/data/lessons/${lesson}.json`)).json();
  const fact = (id) => {
    const f = data.facts.find((x) => x.id === id);
    if (!f) throw new Error(`no fact ${id}`);
    return f.value;
  };
  const nf2 = new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });
  // Money with agorot when there are any: "1,493.74", "2,400".
  const num = (x) => nf2.format(Number(x)).replace(/\.00$/, "");
  const whole = (x) => nf0.format(Math.round(Number(x)));
  const shek = (x) => `${num(x)} ₪`;
  // A rate, count or factor as written in the data, without trailing zeros: "0.50" -> "0.5".
  const pl = (x) => String(x).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  // Numbers and signs inside Hebrew text: an LTR isolate around the number only; a sign stays outside.
  const lr = (x) => `⁦${x}⁩`;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const inScene = (t, [a, b]) => t >= a && t < b;
  const fadeIn = (t, [a], d = 0.6) => clamp((t - a) / d);
  const fadeOut = (t, [, b], d = 0.6) => clamp((b - t) / d);
  const vis = (t, sc) => Math.min(fadeIn(t, sc), fadeOut(t, sc));
  const after = (t, sc, s, o) => Math.min(o, clamp((t - sc[0] - s) / 0.6));
  const grow = (t, sc, s, d) => clamp((t - sc[0] - s) / d);

  const C = {
    navy: "var(--mogi-navy)", n0: "var(--mogi-n0)", n50: "var(--mogi-n50)", n100: "var(--mogi-n100)", n200: "var(--mogi-n200)", n300: "var(--mogi-n300)",
    n400: "var(--mogi-n400)", n600: "var(--mogi-n600)", n700: "var(--mogi-n700)", teal: "var(--mogi-teal-deep)", tq2: "var(--mogi-turquoise-2)", mint: "var(--mogi-mint)",
  };
  const svg = document.getElementById("svg");
  const el = (tag, attrs, text) => {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, val] of Object.entries(attrs)) e.setAttribute(k, val);
    if (text !== undefined) e.textContent = text;
    svg.appendChild(e);
    return e;
  };
  // RTL text: anchor "start" puts its right edge at x. LTR runs (numbers, equations) take ltr: true.
  const txt = (x, y, s, size, opts = {}) =>
    el("text", { x, y, "font-size": size, "font-weight": opts.w ?? 400, fill: opts.fill ?? C.navy, "text-anchor": opts.anchor ?? "middle", opacity: opts.o ?? 1, direction: opts.ltr ? "ltr" : "rtl", "unicode-bidi": "isolate" }, s);
  const box = (x, y, w, h, o, fill = C.n0) => el("rect", { x, y, width: w, height: h, rx: 14, fill, stroke: fill === C.n0 ? C.n200 : "none", opacity: o });
  const line = (x1, y1, x2, y2, o = 1, color = C.n300, w = 1.5, dash) => el("line", { x1, y1, x2, y2, stroke: color, "stroke-width": w, opacity: o, ...(dash ? { "stroke-dasharray": dash } : {}) });
  const dot = (x, y, r, fill, o = 1, stroke) => el("circle", { cx: x, cy: y, r, fill, opacity: o, ...(stroke ? { stroke, "stroke-width": 3 } : {}) });
  // The label every stage-8 picture carries.
  const stamp = (o = 1) => txt(640, 580, "נתונים סינתטיים · להדגמה: לא החלטה של Mogi ולא מדיניות של בנק", 18, { fill: C.n600, o });
  const title = (t, sc, s1, s2, s3) => {
    const o = vis(t, sc);
    txt(640, 280, s1, 76, { w: 700, o });
    if (s2) txt(640, 362, s2, 48, { w: 700, o: after(t, sc, 1, o) });
    if (s3) txt(640, 430, s3, 28, { fill: C.n600, o: after(t, sc, 4, o) });
  };
  return { fact, num, whole, shek, pl, lr, clamp, inScene, vis, after, grow, C, svg, el, txt, box, line, dot, stamp, title, data };
}
