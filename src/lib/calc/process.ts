/**
 * The mortgage process clocks (lessons 1.7 and 1.8): counting calendar days and
 * Israeli banking business days. Dates are ISO strings ("2026-10-14") and are
 * handled in UTC, so no time zone or daylight-saving change can move a day.
 *
 * Counting convention (a course assumption, stated in the lessons): the day an
 * event happens is day 0. "5 business days after a request" is the 5th business
 * day after the day the request was sent; "24 days from the approval" ends on
 * the 24th calendar day after the approval day.
 *
 * Which days are banking business days: the definition the team transcribed in
 * the Brain (page 8650753, 2026-08-17) excludes Saturday and a list of holidays.
 * Friday and a holiday eve are short days that, by that text, still count.
 * Whether Friday counts for Directive 451's clock is not verified, so it is an
 * explicit switch here (`fridayCounts`), never a hidden rule.
 */

/** A banking calendar: which weekdays and dates are not business days. */
export interface BankCalendar {
  /** By the transcribed definition, Friday (a short day) is a business day. */
  fridayCounts: boolean;
  /** ISO dates on which the banking system is closed (holidays). */
  closed: string[];
}

/**
 * Closed banking days in 2026 that fall on a weekday Sunday–Friday, from the
 * Brain's 2026 table (page 8650753): Purim, the first and seventh days of
 * Passover, Independence Day, Shavuot, Tisha B'Av, Rosh Hashana's second day,
 * Yom Kippur eve and Yom Kippur. Holidays that fall on a Saturday in 2026
 * (Rosh Hashana's first day, Sukkot, Shemini Atzeret) change nothing and are
 * left out. 2026-04-08 (the seventh day of Passover) is in the transcribed
 * definition but not in the Brain's table; its date is from the Hebrew calendar.
 */
export const CLOSED_2026 = [
  "2026-03-03",
  "2026-04-02",
  "2026-04-08",
  "2026-04-22",
  "2026-05-22",
  "2026-07-23",
  "2026-09-13",
  "2026-09-20",
  "2026-09-21",
];

export const CALENDAR_2026: BankCalendar = { fridayCounts: true, closed: CLOSED_2026 };

const DAY_MS = 86_400_000;

function toTime(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`not an ISO date: ${iso}`);
  const t = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  if (new Date(t).toISOString().slice(0, 10) !== iso) throw new Error(`no such date: ${iso}`);
  return t;
}

function toIso(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: string): number {
  return new Date(toTime(iso)).getUTCDay();
}

/** The date `days` calendar days after `iso` (negative goes back). */
export function addCalendarDays(iso: string, days: number): string {
  if (!Number.isInteger(days)) throw new Error("days must be a whole number");
  return toIso(toTime(iso) + days * DAY_MS);
}

/** Calendar days from `from` to `to`: 0 on the same day, negative if `to` is earlier. */
export function calendarDaysBetween(from: string, to: string): number {
  return Math.round((toTime(to) - toTime(from)) / DAY_MS);
}

export function isBusinessDay(iso: string, calendar: BankCalendar): boolean {
  const d = weekday(iso);
  if (d === 6) return false;
  if (d === 5 && !calendar.fridayCounts) return false;
  return !calendar.closed.includes(iso);
}

/** The `n`-th business day after `iso` (the day itself is day 0, whatever kind of day it is). */
export function addBusinessDays(iso: string, n: number, calendar: BankCalendar): string {
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be a whole number of at least 1");
  let t = toTime(iso);
  let counted = 0;
  while (counted < n) {
    t += DAY_MS;
    if (isBusinessDay(toIso(t), calendar)) counted++;
  }
  return toIso(t);
}

/** Business days after `from`, up to and including `to`. */
export function businessDaysBetween(from: string, to: string, calendar: BankCalendar): number {
  const span = calendarDaysBetween(from, to);
  if (span < 0) throw new Error("`to` is before `from`");
  let count = 0;
  for (let k = 1; k <= span; k++) if (isBusinessDay(addCalendarDays(from, k), calendar)) count++;
  return count;
}

/** The days in (from, to] that are not business days, for showing what a count skipped. */
export function skippedDays(from: string, to: string, calendar: BankCalendar): string[] {
  const span = calendarDaysBetween(from, to);
  const out: string[] = [];
  for (let k = 1; k <= span; k++) {
    const d = addCalendarDays(from, k);
    if (!isBusinessDay(d, calendar)) out.push(d);
  }
  return out;
}

/** Days left in a window of `windowDays` after `used` days have passed (negative once it has closed). */
export function daysLeft(windowDays: number, used: number): number {
  return windowDays - used;
}

/** The calendar from fact inputs: "2026-03-03,2026-04-02" and "yes"/"no". */
export function calendarFrom(closed: string, fridayCounts: string): BankCalendar {
  return { closed: closed ? closed.split(",") : [], fridayCounts: fridayCounts === "yes" };
}
