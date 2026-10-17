/**
 * Stage 8's nodes on the big-picture map: the algorithm (stage 8, author D).
 *
 * Two things live here.
 *
 * 1. The algorithm's own parts as nodes and links (`nodes`, `links`): the decision variables of the two levels (8.6),
 *    the candidate filter and its hard constraints (8.7), the goal weights (8.8), the cash-flow engine (8.9), the three
 *    forecasts (8.10), Monte Carlo (8.11), the search space (8.14), the efficient front (8.15), the pricing model (8.17),
 *    the approval probability (8.19), the ranking and explanation (8.21), the event log and the shadow opinion (8.22),
 *    the monitor (8.24). Each node carries the lesson that adds it, so mapUpTo(lesson) shows exactly what a learner at
 *    that lesson has met. EVERY CARD SAYS WHICH OF THE THREE IT IS: "Mogi היום" (nothing in stage 8 is existing code,
 *    except the event log), "הוחלט" (only the 15 calculation rules and the four mode names) or "עתיד". Every number-like
 *    thing is להדגמה.
 *
 * 2. The LAYER of lesson 8.27 (`LAYER`, `ROLE_LABEL`, `CONTROL_LABEL`): for every node of the map, stage 0–8, what role it
 *    would play in the algorithm — input (קלט), hard constraint (אילוץ), decision variable (משתנה החלטה), output (פלט) —
 *    and who controls it (the client, the bank, the market, the regulator). The layer is the course's PROPOSAL for how the
 *    algorithm may see each node ("עתיד"), not code: no engine reads the map. A node may play two roles (the payment
 *    ratio is a limit and a result); "outside" means the algorithm does not use it (a person in the process, a topic
 *    the course introduces only). BigPictureMap has no layer prop; src/components/MapOfVariables.vue applies the layer by
 *    passing derived nodes (same ids, the role written into the card), so no shared component changes.
 *
 * Sources: the stage brief and the course map (decision variables of two levels, hard constraints, weights); research notes
 * brain-product-journey.md / repo-domain.md for the event log, shadow and assisted mode (team record, not re-opened).
 */
import type { MapLink, MapNode, RegionId } from "./types.ts";

export type Role = "input" | "constraint" | "decision" | "output" | "outside";
export type Control = "client" | "bank" | "market" | "regulator" | "other";

export const ROLE_LABEL: Record<Role, string> = {
  input: "קלט",
  constraint: "אילוץ",
  decision: "משתנה החלטה",
  output: "פלט",
  outside: "לא נכנס לאלגוריתם",
};
export const CONTROL_LABEL: Record<Control, string> = {
  client: "הלקוח",
  bank: "הבנק",
  market: "השוק",
  regulator: "הרגולטור",
  other: "אף אחד מהם (תהליך או תוצאה)",
};

const N = (id: string, label: string, region: RegionId, lesson: string, what: string, role: string, note: string, kind: "actor" | "factor" = "factor"): MapNode => ({
  id,
  label,
  region,
  lesson,
  kind,
  card: { what, role, note },
});

const FUTURE = "עתיד: תכנון, לא קוד קיים.";

export const nodes: MapNode[] = [
  N("decision_vars", "משתני ההחלטה", "mix", "8.6", "מה האלגוריתם רשאי לשנות, בשתי רמות: מיצוב הבקשה (סכום, הון עצמי, תקופה, חובות לסגור, הרכב הלווים, איזה בנק ומתי) ומבנה התמהיל (חלק לכל מסלול, תקופה ושיטת החזר לכל מסלול, גרייס).", "כל צירוף של בחירות הוא מועמד. מה שלא משתנה הוא קלט או אילוץ.", `שיעור 8.6. ${FUTURE}`),
  N("candidate_filter", "סינון מועמדים לפי אילוצים", "mix", "8.7", "בדיקה של כל מועמד מול האילוצים הקשיחים: רגולציה, מדיניות הבנק, יחס ההחזר, ההחזר המרבי שהלקוח קבע, וסכום המסלולים שווה לסכום ההלוואה. מועמד שנפסל מקבל את כל הסיבות, לא רק הראשונה.", "מפריד בין פתרון אפשרי לשאר. רק אפשרי נכנס להמשך.", `שיעור 8.7. ${FUTURE}`),
  N("goal_weights", "משקולות היעדים", "client", "8.8", "כמה חשוב ללקוח כל אחד משלושת היעדים (החזר נמוך, סך תשלומים נמוך, חשיפה נמוכה). המשקולות הן קלט שמקבלים מהלקוח, לא מדידה.", "הן קובעות מי הפתרון המיטבי מבין האפשריים.", `שיעור 8.8. ${FUTURE} המשקולות בקורס להדגמה, לא החלטה של Mogi.`),
  N("cashflow_engine", "מנוע התזרים", "result", "8.9", "חישוב החזר לכל חודש, לכל מסלול, לפי תרחיש; התמהיל הוא סכום המסלולים. אותו קלט נותן תמיד אותה תוצאה.", "מפיק את מדדי התמהיל (החזר ראשון, החזר מרבי, סך תשלומים) לכל מועמד.", `שיעור 8.9. Mogi היום: אין חישוב תמהיל בקוד, והקריאה למנוע קפואה. ${FUTURE}`),
  N("scenario_set", "שלוש תחזיות", "market", "8.10", "תחזית לפי הוראה 451, תרחיש לחץ ותחזית מקרו. כל אחת היא הנחה על העתיד, לא עובדה.", "אותו מועמד נבחן מול כל אחת, וההבדל ביניהן הוא מידה לחשיפה.", `שיעור 8.10. ${FUTURE} העקומים בקורס להמחשה.`),
  N("monte_carlo", "סימולציית מונטה־קרלו", "market", "8.11", "אלף עתידים מדומים שמתקבלים מהנחה על התפלגות. היא הופכת הנחה למספרים, לא למידע.", "נותנת התפלגות של תוצאות; ההסתברות נכונה רק כשההנחה נכונה.", `שיעור 8.11. ${FUTURE}`),
  N("search_space", "מרחב החיפוש", "mix", "8.14", "כל הצירופים של משתני ההחלטה. הוא גדול מדי לבדיקה מלאה, ולכן מחפשים על רשת ומצמצמים אותו.", "קובע אילו מועמדים בכלל נבדקים. 'מיטבי' הוא ביחס אליו.", `שיעור 8.13–8.14. ${FUTURE}`),
  N("efficient_front", "החזית היעילה", "result", "8.15", "המועמדים האפשריים שאי אפשר לשפר בהם יעד בלי לפגוע באחר.", "הלקוח בוחר עליה נקודה לפי המשקולות שלו.", `שיעור 8.15. ${FUTURE}`),
  N("pricing_model", "מודל התמחור", "bank", "8.17", "אומדן של ריבית שבנק יציע: עוגן ועוד מרווח, והמרווח משתנה במדרגות סביב ספים. הוא נאמד מנתונים.", "מאפשר לשאול 'מה אם' על כל בנק. תשובה היא אומדן עם אי־ודאות.", `שיעור 8.17. ${FUTURE} הספים והמרווחים בקורס להדגמה; איך בנקים מתמחרים בפועל אינו ידוע לקורס.`),
  N("approval_probability", "הסתברות אישור", "bank", "8.19", "אומדן להסתברות שבנק יאשר תמהיל. הוא נכון רק אם כויל מול תוצאות אמיתיות, ואין לקורס נתונים כאלה.", "נכנס לדירוג בין הבנקים.", `שיעור 8.19. ${FUTURE}`),
  N("bank_ranking", "דירוג הבנקים", "result", "8.21", "סדר בין הבנקים לפי המחיר החזוי וההסתברות לאישור, כשהצעה אמיתית מחליפה את האומדן.", "הפלט שהלקוח רואה, יחד עם הסבר.", `שיעור 8.21. ${FUTURE}`),
  N("explanation", "ההסבר ללקוח", "result", "8.21", "ניסוח של מה נבחר, מה נפסל ולמה. מודל שפה מנסח; המספרים באים מהמנוע. מודל שפה לעולם לא מחשב ולא כותב מצב.", "מה שהופך חישוב להחלטה שאפשר לבדוק.", `שיעור 8.21. הכלל על מודל שפה הוחלט; הניסוח עצמו עתיד.`),
  N("event_log", "יומן האירועים", "result", "8.22", "רשימה שרק מוסיפים לה: כל מה שקרה בתיק, עם מתי קרה ומתי נרשם. תיקון הוא שורה חדשה.", "מקור הדאטה שממנה האלגוריתם יכול ללמוד, כשיהיה מי שירשום בו את דעת התוכנה.", "שיעור 8.22. Mogi היום: היומן קיים במערכת הקליטה של הצוות (כפי שתועד, לא נבדק מחדש). מה שילמדו ממנו הוא עתיד."),
  N("shadow_opinion", "דעת התוכנה לצד היועץ", "result", "8.22", "מה שהתוכנה הייתה בוחרת, נרשם לצד מה שהיועץ עשה, בלי שהיא פועלת. שמות המצבים (כבוי, צל, מסייע, אוטומטי) הוחלטו.", "מדד ההסכמה בין השניים הוא הבסיס המוצע לקביעה מתי אפשר לעבור מצב.", "שיעור 8.22. הוחלט: שמות המצבים. עתיד: מה נמדד ומתי עוברים."),
  N("model_monitor", "ניטור המודל", "result", "8.24", "מעקב אחרי השגיאה, ההסכמה עם היועץ והקלט. התראה אומרת שכדאי לבדוק, לא מה הסיבה.", "מזהה זליגה לפני שהמודל מזיק, ומוביל לאימון מחדש או להורדת מצב.", `שיעור 8.24. ${FUTURE}`),
];

const L = (from: string, to: string, label: string, lesson: string): MapLink => ({ from, to, label, lesson });

export const links: MapLink[] = [
  L("decision_vars", "candidate_filter", "כל צירוף של בחירות הוא מועמד שנבדק", "8.7"),
  L("directive_329", "candidate_filter", "תקרת מימון: אילוץ קשיח", "8.7"),
  L("bank_policy", "candidate_filter", "מדיניות הבנק: אילוץ קשיח לכל בנק", "8.7"),
  L("pti", "candidate_filter", "יחס ההחזר המותר: אילוץ קשיח", "8.7"),
  L("living_budget", "candidate_filter", "ההחזר המרבי שהלקוח קבע: אילוץ קשיח", "8.7"),
  L("loan_amount", "decision_vars", "סכום ההלוואה: משתנה מיצוב", "8.6"),
  L("term", "decision_vars", "תקופה: משתנה מיצוב ומשתנה תמהיל", "8.6"),
  L("mix", "decision_vars", "חלק לכל מסלול: משתני התמהיל", "8.6"),
  L("goal_weights", "efficient_front", "המשקולות בוחרות נקודה על החזית", "8.15"),
  L("three_goals", "goal_weights", "שלושת היעדים שמשקללים", "8.8"),
  L("candidate_filter", "cashflow_engine", "רק מועמד אפשרי נכנס לחישוב", "8.9"),
  L("forecast_451", "scenario_set", "תחזית אחת מבין שלוש", "8.10"),
  L("scenario_set", "cashflow_engine", "התזרים מחושב מול כל תחזית", "8.10"),
  L("monte_carlo", "scenario_set", "מרחיבה תחזית להתפלגות", "8.11"),
  L("cashflow_engine", "mix_cashflow", "מפיק את תזרים התמהיל", "8.9"),
  L("search_space", "candidate_filter", "המרחב שממנו באים המועמדים", "8.14"),
  L("cashflow_engine", "efficient_front", "המדדים של כל מועמד אפשרי", "8.15"),
  L("pricing_model", "offered_rate", "אומדן הריבית שבנק יציע", "8.17"),
  L("spread", "pricing_model", "המרווח הוא מה שהמודל אומד", "8.17"),
  L("margin_step", "pricing_model", "מדרגות סביב ספים", "8.17"),
  L("pricing_model", "approval_probability", "מחיר חזוי ופרופיל נכנסים להסתברות", "8.19"),
  L("approval_probability", "bank_ranking", "ההסתברות נכנסת לדירוג", "8.21"),
  L("pricing_model", "bank_ranking", "המחיר החזוי נכנס לדירוג", "8.21"),
  L("personal_offer", "bank_ranking", "הצעה אמיתית מחליפה את האומדן", "8.21"),
  L("bank_ranking", "explanation", "הדירוג מוסבר ללקוח", "8.21"),
  L("advisor", "event_log", "מה שהיועץ עושה נרשם", "8.22"),
  L("event_log", "shadow_opinion", "דעת התוכנה נרשמת לצד היועץ", "8.22"),
  L("executed_deal", "event_log", "מה שקרה בפועל הוא התשובה שממנה לומדים", "8.22"),
  L("shadow_opinion", "model_monitor", "ההסכמה והשגיאה נמדדות", "8.24"),
  L("model_monitor", "pricing_model", "התראה מובילה לבדיקה ולאימון מחדש", "8.24"),
];

// ───────────────────────── the layer of lesson 8.27 ─────────────────────────

const R: Record<string, Role> = { i: "input", c: "constraint", d: "decision", o: "output", x: "outside" };
const C: Record<string, Control> = { c: "client", b: "bank", m: "market", r: "regulator", o: "other" };

export interface LayerEntry {
  roles: Role[];
  control: Control;
  /** One plain sentence on how the algorithm would see the node (the course's proposal). */
  note?: string;
}

/** id → "roles" + "control" letters (R and C above) + an optional note. */
const RAW: Record<string, [string, string, string?]> = {
  // market
  boi_rate: ["i", "m", "נקודת התחלה של תרחישי הריבית"],
  inflation: ["i", "m", "נכנס לתחזית המדד של מסלולים צמודים"],
  bond_yields: ["i", "m", "מקור לעקום שממנו נגזרות תחזיות"],
  prime: ["i", "m", "הבסיס של מסלול הפריים בתזרים"],
  anchor: ["i", "m", "העוגן שאליו מוסיפים מרווח"],
  inflation_expectations: ["i", "m", "נכנס לתחזית של מסלול צמוד"],
  housing_demand: ["x", "m", "הקשר בלבד: האלגוריתם לא מודד אותו"],
  market_events: ["x", "m", "הקשר בלבד: מופיע דרך תרחיש לחץ"],
  forward_rate: ["i", "m", "נגזר מעקום, נכנס לתחזית"],
  future_anchor: ["i", "m", "נכנס לתזרים של מסלול משתנה"],
  forecast_451: ["i", "r", "אחת משלוש התחזיות"],
  boi_average: ["i", "m", "נתון ממוצע שממנו מתחילים לאמוד מרווח"],
  equator: ["i", "m", "נקודת ייחוס לאמידה"],
  rate_drift: ["i", "m", "הסיבה שהצעה מתיישנת; נכנס לתרחיש"],
  boi_average_fee: ["x", "r", "נכנס רק לחישוב עמלת היוון"],
  // regulation
  boi: ["x", "r", "גוף, לא משתנה"],
  same_property: ["c", "r", "אילוץ על החזר שנספר"],
  directive_329: ["c", "r", "אילוץ קשיח: תקרות מימון ויחס החזר"],
  capital_threshold: ["i", "r", "ספים שמסבירים מדרגות במודל התמחור"],
  credit_law: ["x", "r", "מסגרת משפטית, לא משתנה"],
  credit_registry: ["x", "o", "גוף, לא משתנה"],
  directive_451: ["c", "r", "מגבילה את הפלט: קובעת מה חובה להציג"],
  early_repay_order: ["i", "r", "קובע עלות יציאה בבדיקות מחזור"],
  time_reduction: ["i", "r", "נכנס לחישוב עלות יציאה"],
  prior_notice: ["i", "r", "נכנס לתזמון יציאה"],
  refi_test: ["o", "r", "תוצאה של בדיקה, לא קלט"],
  red_line: ["x", "o", "גבול התנהגות של היועץ, לא אילוץ על מועמד"],
  // bank
  cost_of_money: ["i", "b", "נכנס למודל התמחור"],
  bank: ["x", "b", "גוף; הבחירה בו היא משתנה החלטה בצומת אחר"],
  spread: ["i", "b", "בהצעה אמיתית קלט, בתחזית אומדן"],
  fee: ["i", "b", "נכנס לעלות הכוללת"],
  bank_policy: ["c", "b", "אילוץ קשיח לכל בנק"],
  underwriting: ["c", "b", "תנאי אישור שהמועמד חייב לעמוד בהם"],
  credit_bureau: ["x", "o", "גוף, לא משתנה"],
  client_relationship: ["i", "b", "השערה שמרווח תלוי בקשר; נבדקת בדאטה"],
  monthly_targets: ["i", "b", "השערה על תזמון; נבדקת בדאטה"],
  other_offers: ["i", "b", "הצעות אחרות משנות מה אפשר לקבל"],
  channel: ["d", "client", "איך ולאן מגישים: חלק ממשתני המיצוב"],
  credit_risk: ["i", "b", "גורם שהבנק שוקל; לא נצפה: השערה על מה שמסביר מרווח"],
  capital_requirements: ["i", "b", "גורם שהבנק שוקל; לא נצפה: השערה על מה שמסביר מרווח"],
  competition: ["i", "b", "גורם שהבנק שוקל; לא נצפה: השערה על מה שמסביר מרווח"],
  customer_value: ["i", "b", "גורם שהבנק שוקל; לא נצפה: השערה על מה שמסביר מרווח"],
  risk_appetite: ["i", "b", "גורם שהבנק שוקל; לא נצפה: השערה על מה שמסביר מרווח"],
  bank_form: ["x", "b", "מקור לשדות הקלט, לא משתנה"],
  advisor_channel: ["x", "b", "מסלול הגשה, לא משתנה"],
  threshold: ["i", "b", "השערה: ספים שהמרווח משתנה סביבם"],
  margin_step: ["i", "b", "השערה: המדרגה במודל התמחור, צורה שהקורס מלמד"],
  outreach: ["d", "client", "לאילו בנקים פונים ומתי"],
  offer_validity: ["c", "b", "הצעה תקפה לזמן מוגבל"],
  negotiation: ["x", "o", "תהליך אנושי"],
  competing_offer: ["i", "b", "הצעה אמיתית מחליפה אומדן"],
  counter_offer: ["i", "b", "מעשה של הבנק בתוך המשא ומתן; הצעה נגדית היא נתון שהאלגוריתם קורא"],
  bank_preference: ["i", "b", "השערה על מה שמשתלם לבנק"],
  underwriter: ["x", "b", "אדם בבנק"],
  early_repay_fees: ["i", "b", "נכנס לעלות יציאה"],
  // client
  borrowers: ["x", "c", "אנשים; ההרכב שלהם הוא משתנה בצומת אחר"],
  advisor: ["x", "o", "אדם; מה שהוא עושה נרשם ביומן"],
  equity: ["id", "c", "ההון הזמין הוא קלט; כמה מביאים הוא משתנה"],
  recognized_income: ["i", "b", "הכרה בהכנסה היא מדיניות של הבנק; הלקוח שולט בהצהרה, לא בהכרה"],
  obligations: ["id", "c", "קיימות הן קלט; אילו לסגור הוא משתנה"],
  disposable_income: ["o", "o", "ביניים מחושב"],
  pti: ["co", "r", "הגבול הוא אילוץ והערך שמחושב הוא פלט"],
  living_budget: ["c", "c", "התקציב מגביל את ההחזר; ההחזר המרבי שהלקוח קבע בשיעורים 8.15 ו־8.28 הוא נתון נפרד"],
  credit_data: ["i", "o", "מדווח על ידי לשכות ובנקים; הלקוח לא משנה אותו לפני הבקשה"],
  account_conduct: ["i", "o", "נראה לבנק מדפי החשבון; הלקוח לא משנה אותו לפני הבקשה"],
  guarantor: ["d", "c", "להוסיף ערב: משתנה מיצוב"],
  borrower_composition: ["d", "c", "הרכב הלווים: משתנה מיצוב"],
  family: ["i", "c", "נכנס לתקציב"],
  residency: ["i", "c", "נכנס לאישור"],
  lever: ["d", "c", "כל מנוף הוא משתנה החלטה"],
  close_loans: ["d", "c", "חובות לסגור לפני הבקשה"],
  income_docs: ["d", "c", "כמה מתעדים משנה מה מוכר"],
  misleading_info: ["x", "o", "גבול התנהגות של היועץ, לא אילוץ על מועמד"],
  balance_report: ["i", "b", "קלט למחזור"],
  // property and deal
  seller: ["x", "o", "אדם"],
  lawyer: ["x", "o", "אדם"],
  appraiser: ["x", "o", "אדם"],
  insurer: ["x", "o", "גוף"],
  registry: ["x", "o", "גוף"],
  value: ["i", "m", "שווי נקבע על ידי שמאי ושוק"],
  ltv: ["co", "r", "תקרה היא אילוץ, השיעור בפועל הוא פלט"],
  term: ["d", "c", "תקופה: משתנה מיצוב ומשתנה תמהיל"],
  property_type: ["i", "o", "קובע אילו תקרות חלות"],
  collateral: ["i", "b", "נכנס לאישור"],
  rights_registration: ["i", "o", "נכנס לאישור"],
  insurances: ["i", "b", "עלות נוספת"],
  loan_amount: ["d", "c", "סכום ההלוואה: משתנה מיצוב"],
  positioning: ["d", "c", "המיצוב כולו הוא הרמה הראשונה"],
  refi_kinds: ["d", "c", "בחירה בין מחזור פנימי לחיצוני"],
  upgrader_deal: ["x", "o", "הקורס מכיר רק היכרות"],
  bridge_loan: ["x", "o", "הקורס לא יודע"],
  progress_draws: ["x", "o", "הקורס לא יודע"],
  builder_escort: ["x", "o", "הקורס לא יודע"],
  sale_law_guarantee: ["x", "o", "הקורס לא יודע"],
  self_build: ["x", "o", "הקורס לא יודע"],
  lien_rank: ["x", "o", "הקורס לא יודע"],
  reverse_mortgage: ["x", "o", "הקורס לא יודע"],
  // mix
  mix: ["d", "c", "התמהיל כולו הוא הרמה השנייה"],
  track_fixed_unindexed: ["d", "c", "אחת האפשרויות לכל חלק"],
  track_fixed_indexed: ["d", "c", "אחת האפשרויות לכל חלק"],
  track_prime: ["d", "c", "אחת האפשרויות לכל חלק"],
  track_var_indexed: ["d", "c", "אחת האפשרויות לכל חלק"],
  track_var_unindexed: ["d", "c", "אחת האפשרויות לכל חלק"],
  track_eligibility: ["i", "o", "ניתנת לפי זכאות של גוף ממשלתי, לא נבחרת"],
  spitzer: ["d", "c", "שיטת החזר לכל מסלול"],
  equal_principal: ["d", "c", "שיטת החזר לכל מסלול"],
  grace: ["d", "c", "חודשי גרייס לכל מסלול"],
  balloon_bullet: ["d", "c", "שיטת החזר לכל מסלול"],
  track_risk: ["x", "o", "הידע שמאחורי מדד החשיפה"],
  mix_cashflow: ["o", "o", "פלט המנוע"],
  uniform_baskets: ["i", "r", "נקודת השוואה"],
  proposed_basket: ["o", "b", "הסל שהבנק בוחר להציע; האלגוריתם רק משווה אליו"],
  three_goals: ["i", "c", "היעדים שעליהם מוגדרים המשקולות"],
  sensitivity: ["o", "o", "מדד שנגזר מהמנוע"],
  exit_point: ["i", "o", "נקבע בחוזה ההלוואה"],
  // result
  debt_balance: ["o", "o", "פלט המנוע"],
  monthly_payment: ["o", "o", "פלט המנוע"],
  schedule: ["o", "o", "פלט המנוע"],
  exposure: ["o", "o", "אחד משלושת היעדים"],
  first_payment: ["o", "o", "אחד המדדים"],
  current_payment: ["o", "o", "אחד המדדים"],
  max_payment: ["o", "o", "פלט: ההחזר הגבוה ביותר החזוי. התקרה שהלקוח קבע נבדקת מול ההחזר הראשון"],
  total_paid: ["o", "o", "אחד משלושת היעדים"],
  present_value: ["o", "o", "מדד משלים"],
  irr: ["o", "o", "מדד משלים"],
  approval: ["i", "b", "תשובת הבנק: התווית שממנה לומדים, לא משהו שהאלגוריתם מחשב"],
  offered_rate: ["o", "b", "אומדן במודל, אמיתי בהצעה"],
  feasibility: ["o", "o", "תוצאת הסינון"],
  pre_approval: ["x", "b", "מסמך של הבנק; האלגוריתם מכוון אליו, אבל הוא לא משתנה, אילוץ, קלט או פלט שלו"],
  expected_total_rate: ["o", "r", "פלט חובה לפי הוראה 451"],
  comparison_basis: ["o", "r", "פלט לצורך השוואה"],
  estimate: ["o", "o", "פלט המודל"],
  personal_offer: ["i", "b", "כשמגיעה, מחליפה את האומדן"],
  executed_deal: ["i", "o", "מה שקרה בפועל: התשובה שממנה לומדים"],
  stability: ["o", "o", "מדד"],
  good_mix: ["o", "o", "פלט הערכה"],
  realistic_mix: ["o", "o", "פלט הערכה"],
  lever_price: ["o", "o", "מחיר מנוף נגזר מהמודל"],
  positioning_plan: ["o", "o", "פלט"],
  outreach_plan: ["o", "o", "פלט"],
  bank_questions: ["o", "o", "פלט"],
  discount_fee: ["o", "r", "פלט חישוב עמלה"],
  comparison_rate: ["o", "r", "פלט חישוב"],
  lower_payment: ["o", "o", "אזהרה על פלט"],
  refi_check: ["o", "o", "פלט"],
  complex_map: ["x", "o", "מפת נושאים"],
  // stage 8's own nodes
  decision_vars: ["d", "c", "הרשימה של מה שמותר לשנות"],
  candidate_filter: ["c", "o", "מימוש האילוצים"],
  goal_weights: ["i", "c", "מגיעות מהלקוח"],
  cashflow_engine: ["o", "o", "פלט"],
  scenario_set: ["i", "o", "הנחות על העתיד שהאלגוריתם בוחר לבדוק"],
  monte_carlo: ["i", "o", "הנחה של הקורס על התפלגות: השוק לא שולט בהגרלות של סימולציה"],
  search_space: ["x", "o", "המרחב נקבע על ידי משתני ההחלטה; הוא מבנה ולא החלטה"],
  efficient_front: ["o", "o", "פלט"],
  pricing_model: ["o", "b", "אומדן"],
  approval_probability: ["o", "b", "אומדן"],
  bank_ranking: ["o", "o", "פלט"],
  explanation: ["o", "o", "פלט"],
  event_log: ["i", "o", "המקור ללמידה"],
  shadow_opinion: ["o", "o", "פלט שנרשם ולא נשלח"],
  model_monitor: ["o", "o", "פלט ניהולי"],
};

export const LAYER: Record<string, LayerEntry> = Object.fromEntries(
  Object.entries(RAW).map(([id, [roles, control, note]]) => [
    id,
    { roles: [...roles].map((r) => R[r]), control: C[control] ?? (control as Control), note },
  ]),
);
