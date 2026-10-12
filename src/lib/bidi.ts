/**
 * Numbers inside Hebrew text. In a right-to-left line a bare range or signed number is drawn backwards
 * ("6–10" reads "10–6", "−1" reads "1−"), so text that may hold one is split into pieces, and each number,
 * range or date ("6–10", "3.2–3.6", "−1", "2026-10-07", "12.5%") becomes its own left-to-right piece,
 * shown in a `.ltr` span. A trailing full stop or comma stays with the Hebrew text.
 */
const NUM = String.raw`[-−+]?\d(?:[\d.,]*\d)?%?`;
const RUN = new RegExp(`${NUM}(?:\\s*[–—-]\\s*${NUM})*`, "g");

export interface Piece {
  text: string;
  ltr: boolean;
}

export function numberPieces(text: string): Piece[] {
  const pieces: Piece[] = [];
  let at = 0;
  for (const m of text.matchAll(RUN)) {
    const start = m.index ?? 0;
    if (start > at) pieces.push({ text: text.slice(at, start), ltr: false });
    pieces.push({ text: m[0], ltr: true });
    at = start + m[0].length;
  }
  if (at < text.length) pieces.push({ text: text.slice(at), ltr: false });
  return pieces;
}

/** Intl writes a negative number with a hyphen-minus (and a direction mark before it); the course writes "−". */
export function withMinus(text: string): string {
  return text.replace(/^‎?-/, "−");
}

/** The shekel sign is glued to its number with a no-break space, so it never wraps onto a line of its own. */
export function glueShekelSign(text: string): string {
  return text.replace(/\s₪/g, " ₪");
}

const RIGHT_VERDICT = /^(נכון(?![א-ת])[.,:!]?)\s*/;
const WRONG_VERDICT = /^(לא בדיוק[.,:!]?|לא נכון[.,:!]?|לא בהכרח[.,:!]?|לא[.,:!])\s*/;

/**
 * The verdict word and the explanation that follow an answer. A feedback that already opens with its own
 * verdict ("נכון. …", "לא בדיוק. …") keeps it as the lead, so the component does not say it twice.
 */
export function splitVerdict(feedback: string, correct: boolean): { lead: string; rest: string } {
  const own = feedback.match(correct ? RIGHT_VERDICT : WRONG_VERDICT);
  if (own) return { lead: own[1], rest: feedback.slice(own[0].length) };
  return { lead: correct ? "נכון." : "לא בדיוק.", rest: feedback };
}
