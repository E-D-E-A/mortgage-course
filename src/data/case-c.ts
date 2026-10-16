/**
 * Case C (עדי וירון), as the course uses it from stage 7: an existing mortgage they want to replace, and 150,000 ₪ more
 * for a renovation, on the same property. Lesson 7.8 (the workshop) is where the whole case is put together; 7.1–7.5
 * use the loan alone.
 *
 * What is real and what is invented (course map, section 8; stage-7 brief):
 *  - The loan is the team's worked example of the early-repayment fee (Brain 7798786, read by the team on 2026-08-02/03;
 *    NOT verified against the Order, which nobody on the course has opened): a single fixed unlinked track of
 *    700,000 ₪, granted 2023-07-01, 20 years, 5.90% nominal; repaid 2026-08-02 with notice on 2026-07-03 (30 days). The
 *    averages A = 4.823% (the team's page; the present value of the example corresponds to 4.823049%) and C = 5.09% are
 *    effective annual rates "as the team read them on 2026-08-02, לא אומת". They are the only real numbers of the case.
 *  - Everything else is INVENTED: the two incomes, the property's value, the three new offers (banks ב׳, ג׳, ד׳, which are
 *    lesson 7.4's: rates and terms are imported from there so the two lessons agree), the new loan's up-front costs, and the
 *    price of the top-up as a loan of its own. None is a bank's offer or market data.
 *  - The "same property" rule (for a loan on a property that already carries one, the payments on the earlier loan count in
 *    the repayment ratio while more than 18 months remain) is the team's transcription of circular 2840-06 / 2852, in force
 *    from 2026-10-01, לא אומת (lesson 4.3).
 *
 * Label wherever shown: "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים".
 * The course does not say what they should do: it shows how to check.
 */
import type { Track } from "../lib/calc/metrics.ts";
import { BANKS, CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, NEW_LOAN_COSTS, OPERATIONAL_FEE, PRESETS, REFINANCE_FORECAST, bank } from "./refinance-examples.ts";

export { BANKS, CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, NEW_LOAN_COSTS, OPERATIONAL_FEE, PRESETS, REFINANCE_FORECAST, bank };

/** The early-repayment case in the flat form scripts/lessons/_earlyrepay-facts.ts reads: the team's worked example. */
export const FEE_CASE = {
  principal: "700000",
  rate: "5.90",
  term: 240,
  granted: "2023-07-01",
  repaid: "2026-08-02",
  avgToday: "4.823049",
  avgGrant: "5.09",
  noticeOn: "2026-07-03",
} as const;

/** What they want besides replacing the loan: money for a renovation, on the same property. */
export const TOP_UP = "150000";

/** INVENTED: the two net incomes, per month. */
export const NET_INCOMES = ["9000", "7000"] as const;

/** INVENTED: the property's value for the financing ratio. */
export const PROPERTY_VALUE = "1900000";

/** INVENTED: the top-up as a loan of its own, next to the old loan (the "keep" option): rate (nominal) and term. */
export const SEPARATE_TOP_UP: Track = { principal: TOP_UP, rates: ["6.4"], months: 180, rounding: "statement" };

/** The three new offers of the workshop. The same banks, rates and terms as lesson 7.4's; the amount is the workshop's. */
export const OFFER_BANKS = BANKS;
