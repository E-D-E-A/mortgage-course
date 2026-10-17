/** Small helpers for lesson 8.21's page and illustration (stage-8 author C). Display only: no number is computed here. */
const KIND: Record<string, string> = { ק: "קבועה", פ: "פריים", מ: "משתנה" };

/** "ק40/30 מ60/30" (search.ts's candidate id: kind, share of the loan, years) -> "קבועה 40% + משתנה 60%, 30 שנה"; one term when all are equal. */
export function mixName(id: string): string {
  if (!id) return "—";
  const parts = id.split(" ").map((p) => {
    const m = p.match(/^(ק|פ|מ)(\d+)(?:\/(\d+))?$/u);
    return m ? { kind: KIND[m[1]], share: m[2], years: m[3] } : { kind: p, share: "", years: undefined };
  });
  const years = new Set(parts.map((p) => p.years));
  const body = parts.map((p) => (parts.length === 1 ? p.kind : `${p.kind} ${p.share}%${years.size > 1 ? ` (${p.years} שנה)` : ""}`)).join(" + ");
  return years.size === 1 ? `${body}, ${[...years][0]} שנה` : body;
}

export const BANK_HE: Record<string, string> = { a: "בנק א׳", b: "בנק ב׳", c: "בנק ג׳", d: "בנק ד׳" };
export const POSITIONING_HE: Record<string, string> = { asked: "כפי שביקשו", parent: "הורה מצטרף ללווים" };
