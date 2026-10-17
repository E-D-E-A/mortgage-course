/**
 * Stage 5's nodes on the big-picture map: from offers to a mix. What a pre-approval
 * shows and the rule that makes it comparable (5.1–5.3: Directive 451, the uniform
 * baskets, the comparison measures), the forecast the measures rest on (5.4), the
 * four kinds of number that get called "the rate" (5.5), the three goals, stability
 * and sensitivity (5.6–5.7), and the two questions asked of a finished mix: is it
 * good (5.9) and is it realistic (5.10). Lesson 5.8, the workshop, adds one link.
 *
 * Written by the author of 5.9–5.10 from the stage brief, the course map, the
 * research notes and the lessons as they stood on 2026-10-16: the cards of 5.1–5.8
 * need one consistency read against those lessons' final text. No card states a
 * number: every figure belongs in the lesson, with its label.
 *
 * Sources for the cards: Directive 451 only through the team's transcription (Brain
 * 7733250, version 22 of 19/07/2023, read by the team on 3 August 2026, not checked
 * against the directive); the pre-approval dashboard and the mix pages (Brain,
 *); the Bank of Israel data connections (Brain 67469313, Eylon,
 * 2026-10-08). The three goals are Mogi's design (J-090), not a fact about the
 * market. How banks price and what they prefer is not known, and cards say so.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  // ───────────── 5.1–5.3: what an offer shows, and when two offers can be compared ─────────────
  {
    id: "directive_451",
    label: "הוראה 451",
    region: "regulation",
    lesson: "5.1",
    kind: "factor",
    card: {
      what: "הוראה של בנק ישראל לבנקים בנושא הלוואות לדיור. היא קובעת מה אישור עקרוני חייב להציג, איך מחשבים את העלות הממשית של האשראי ובאיזו תחזית, ואילו סלים אחידים כל בנק מציע.",
      role: "היא הסיבה שאפשר להשוות הצעות: כולן מציגות אותם מדדים, מחושבים באותה שיטה.",
      note: "שיעור 5.1. לפי תעתיק של הצוות מגרסה 22 (19.7.2023), לא נבדק מחדש מול ההוראה. הוראה 329 (שיעור 4.4) היא הוראה אחרת: היא קובעת מה אסור.",
    },
  },
  {
    id: "pre_approval",
    label: "אישור עקרוני",
    region: "result",
    lesson: "5.1",
    kind: "factor",
    card: {
      what: "מסמך בכתב של בנק: מה הוא מוכן לתת לתיק הזה. סכום, תמהיל, ריבית לכל מסלול ותנאים, לתקופה מוגבלת.",
      role: "הוא המסמך שמשווים בו הצעות. הוא לא כסף: עד שהכסף מגיע יש עוד שלבים.",
      note: "שיעור 5.1, שמראה גם מה חסר עד שהכסף מגיע. תוקף ההצעה: לפי תעתיק הצוות של הוראה 451, לא אומת.",
    },
  },
  {
    id: "uniform_baskets",
    label: "הסלים האחידים",
    region: "mix",
    lesson: "5.2",
    kind: "factor",
    card: {
      what: "שלושה תמהילים קבועים, באותו הרכב בכל הבנקים. כל בנק מציע אותם, ומתמחר אותם בעצמו.",
      role: "הם הדרך הקלה ביותר להשוות בין בנקים, כי ההרכב זהה ורק המחיר שונה. גם שתי הצעות אחרות אפשר להשוות, אם הסכום, התמהיל, החודש והתחזית זהים.",
      note: "שיעור 5.2. לפי תעתיק של הצוות מנספח 5 בהוראה 451, ובתמיכת מקורות משניים; לא אומת מול ההוראה. ידע מהשטח מתאר אותם אחרת; הקורס מלמד את התעתיק, והשאלה פתוחה.",
    },
  },
  {
    id: "proposed_basket",
    label: "הסל המוצע",
    region: "mix",
    lesson: "5.2",
    kind: "factor",
    card: {
      what: "התמהיל שהבנק בוחר להציע ללווה הזה, בנוסף לסלים האחידים.",
      role: "אין לו הרכב קבוע, ולכן לא משווים אותו ישירות לסל מוצע של בנק אחר. לפי תכנון המסך של Mogi כאן הבנקים נבדלים. למה בנק בוחר מה שהוא בוחר — לא ידוע.",
      note: "שיעור 5.2.",
    },
  },
  {
    id: "expected_total_rate",
    label: "ריבית כוללת חזויה",
    region: "result",
    lesson: "5.3",
    kind: "factor",
    card: {
      what: "הריבית האחת, לשנה, שמסבירה את כל התשלומים החזויים של ההצעה. זה הרעיון של העלות הממשית של האשראי משלב החישוב, על תשלומים לפי תחזית.",
      role: "היא המדד שהאישור העקרוני מציג להשוואה. היא לא סכום בשקלים, ולא אומרת כמה תשלמו בסך הכול.",
      note: "שיעור 5.3, והעלות הממשית — שיעור 3.10. לפי תעתיק של הצוות מנספח 4 בהוראה 451, לא אומת. אילו עמלות נכנסות לחישוב — שאלה משפטית פתוחה.",
    },
  },
  {
    id: "comparison_basis",
    label: "בסיס להשוואה",
    region: "result",
    lesson: "5.3",
    kind: "factor",
    card: {
      what: "מה שחייב להיות זהה בין שתי הצעות כדי שמותר יהיה להשוות מחיר: אותו סכום, אותו תמהיל, אותו חודש חישוב ואותה תחזית.",
      role: "בלעדיו פער בין שני מספרים הוא רעש. זה התנאי לכל קנה מידה שבו שופטים תמהיל.",
      note: "שיעור 5.3. בשיעור 5.9 מצטרפים תנאים של קנה מידה (שיטת ריבית, תרחיש). בהשוואה לסל התמהיל לא זהה, ולכן היא נקודת ייחוס למבנה ולא השוואת מחיר.",
    },
  },

  // ───────────── 5.4: the forecast ─────────────
  {
    id: "forward_rate",
    label: "ריבית פורוורד",
    region: "market",
    lesson: "5.4",
    kind: "factor",
    card: {
      what: "הריבית שעקום האפס מגלם לתקופה בעתיד, למשל לחמש השנים שאחרי השנה החמישית. מחשבים אותה משתי תשואות של העקום.",
      role: "היא מה שהמחירים של היום מגלמים. היא לא הבטחה, ולא הערכה של מישהו.",
      note: "שיעור 5.4. העקומים בקורס להמחשה בלבד, לא נתוני בנק ישראל.",
    },
  },
  {
    id: "future_anchor",
    label: "ריבית עוגן עתידית",
    region: "market",
    lesson: "5.4",
    kind: "factor",
    card: {
      what: "העוגן שהתחזית מניחה למסלול משתנה בנקודת עדכון שעוד לא הגיעה. מחשבים אותו כריבית פורוורד.",
      role: "הריבית של המסלול אחרי העדכון היא העוגן העתידי ועוד המרווח שבחוזה.",
      note: "שיעור 5.4. לפי תעתיק של הצוות של הוראה 451, לא אומת.",
    },
  },
  {
    id: "forecast_451",
    label: "התחזית של הוראה 451",
    region: "market",
    lesson: "5.4",
    kind: "factor",
    card: {
      what: "הדרך שההוראה קובעת לחשב מראש את התשלומים של מסלולים שהריבית או המדד בהם יכולים לזוז: ריביות עוגן עתידיות, וציפיות אינפלציה כפער מורכב בין עקום נומינלי לריאלי.",
      role: "היא הבסיס לריבית הכוללת החזויה, לסך התשלומים החזוי ולהחזר המרבי החזוי. כל השוואה לפי ההוראה נעשית באותה תחזית.",
      note: "שיעור 5.4. היא לא תחזית של Mogi ולא של בנק; היא נתונה מהוראה. לפי תעתיק של הצוות, לא אומת.",
    },
  },

  // ───────────── 5.5: four kinds of number ─────────────
  {
    id: "boi_average",
    label: "ריבית ממוצעת",
    region: "market",
    lesson: "5.5",
    kind: "factor",
    card: {
      what: "הממוצע של ריביות על הלוואות שבנקים נתנו בפועל, כפי שבנק ישראל מפרסם לכל סוג מסלול.",
      role: "היא נתון על העבר ועל הרבה לווים יחד. היא לא מחיר שבנק יאשר, ולפני כל השוואה אליה בודקים באיזו שיטה היא מפורסמת.",
      note: "שיעור 5.5. לפי מחקר של הצוות (2026-10-08). אילו סדרות מפורסמות באילו שיטה — חלק לא נבדק.",
    },
  },
  {
    id: "equator",
    label: "קו המשווה",
    region: "market",
    lesson: "5.5",
    kind: "factor",
    card: {
      what: "אתר של בנק ישראל להשוואה בין בנקים. בחלק של המשכנתאות מופיעה לכל בנק הריבית הממוצעת והרכב המסלולים בהלוואות שנתן.",
      role: "הוא ממוצע של הלוואות שבנק נתן, לא הצעה לכם. לפי מחקר של הצוות הריביות בו אפקטיביות שנתיות, ובלי בוליט, בלון ומט״ח.",
      note: "שיעור 5.5. לפי תעתיק בצוות, לא אומת.",
    },
  },
  {
    id: "estimate",
    label: "אומדן",
    region: "result",
    lesson: "5.5",
    kind: "factor",
    card: {
      what: "מספר שמחשבים בשיטה מנתונים אחרים, כשאף בנק עוד לא ענה.",
      role: "הוא טוב לתכנון, ומוחלף בהצעה אישית כשיש אחת. מי שמציג אומדן כותב שהוא אומדן, ובאיזו שיטה חושב. מודל שפה לא מחשב אותו, והשיטה עוד לא ידועה.",
      note: "שיעור 5.5.",
    },
  },
  {
    id: "personal_offer",
    label: "הצעה אישית",
    region: "result",
    lesson: "5.5",
    kind: "factor",
    card: {
      what: "התשובה של בנק לתיק מסוים: ריבית לכל מסלול, סכומים ותנאים, ללווים מסוימים, בתאריך מסוים.",
      role: "זה המספר היחיד שהוא באמת של הלווים. אישור עקרוני בכתב הוא הצעה אישית שיש לה תוקף.",
      note: "שיעור 5.5. מעמד כל הצעה (מאושרת, מצוטטת או מוערכת) נרשם: לפי מחקר של הצוות.",
    },
  },
  {
    id: "executed_deal",
    label: "עסקה שבוצעה",
    region: "result",
    lesson: "5.5",
    kind: "factor",
    card: {
      what: "הלוואה שהועמדה בפועל, עם התנאים שנחתמו.",
      role: "היא עובדה על מקרה אחד בעבר, ולא הצעה לכם. היא יכולה ללמד מה בנקים אישרו למקרים דומים.",
      note: "שיעור 5.5.",
    },
  },

  // ───────────── 5.6–5.7: goals, stability, sensitivity ─────────────
  {
    id: "three_goals",
    label: "שלושת יעדי התמהיל",
    region: "mix",
    lesson: "5.6",
    kind: "factor",
    card: {
      what: "שלושה יעדים שמושכים לכיוונים שונים: החזר חודשי נמוך, סך תשלומים נמוך, וחשיפה קטנה לשינויי ריבית ומדד.",
      role: "בקבוצת התמהילים שבונים בשלב הזה אין תמהיל שמנצח בשלושתם, ובדרך כלל יעד אחד עולה ביעד אחר. מה ההחלטה — של הלקוחות.",
      note: "שיעור 5.6. זו שיטה של Mogi לבניית תמהילים, לא עובדה על השוק. שלוש האסטרטגיות הדומות מהשטח ממתינות לאישור אילון.",
    },
  },
  {
    id: "stability",
    label: "יציבות",
    region: "result",
    lesson: "5.6",
    kind: "factor",
    card: {
      what: "כמה התשלום החודשי של תמהיל נשאר במקומו כשהריבית או המדד זזים.",
      role: "היא היעד השלישי. במסלול קבוע לא צמוד התשלום לא זז; פריים, משתנה וצמוד זזים. הקורס מודד אותה בבחירה משלו.",
      note: "שיעור 5.6.",
    },
  },
  {
    id: "sensitivity",
    label: "רגישות",
    region: "mix",
    lesson: "5.7",
    kind: "factor",
    card: {
      what: "כמה תוצאה זזה כשמזיזים נתון אחד בצעד ידוע, וכל השאר נשאר במקומו.",
      role: "היא נכונה לצעד קטן ליד המצב הנוכחי, ותלויה בתמהיל: אותה ידית יכולה לזוז אפס בתמהיל אחד והרבה באחר.",
      note: "שיעור 5.7.",
    },
  },

  // ───────────── 5.9–5.10: two questions about a finished mix ─────────────
  {
    id: "good_mix",
    label: "האם התמהיל טוב",
    region: "result",
    lesson: "5.9",
    kind: "factor",
    card: {
      what: "תמהיל נשפט מול קני מידה: יעדי הלקוח, הריבית הממוצעת של בנק ישראל, הסלים האחידים והצעות של בנקים אחרים.",
      role: "״טוב״ הוא תמיד ביחס למשהו. הפער הוא מידע רק על בסיס אחד: אותו סכום, אותן תקופות, אותו תאריך, אותו תרחיש ואותה שיטת ריבית.",
      note: "שיעור 5.9. גודל פער משמעותי — לא ידוע, שאלה פתוחה.",
    },
  },
  {
    id: "realistic_mix",
    label: "האם התמהיל ריאלי",
    region: "result",
    lesson: "5.10",
    kind: "factor",
    card: {
      what: "תמהיל שיכול להיות הצעה אמיתית של בנק: עומד בהוראה 329, ביחס החזר שהבנק מקבל, בריביות סבירות מול השוק, וכל הריביות בו הוצעו יחד.",
      role: "ריאלי הוא תנאי הכרחי ולא מספיק: בנק רשאי לסרב גם לתמהיל שעומד בכל הקווים. תמהיל שהורכב מהריבית הטובה בכל בנק עשוי לעמוד בקווים, ועדיין לא קיים.",
      note: "שיעור 5.10. הקו של יחס החזר הוא סף הון (40%) — לא אומת. מדיניות בנק לא ניתנת לחישוב מבחוץ. כמה בנק משנה ריבית כשמשנים תמהיל — לא ידוע (מחקר של אילון, 2026-10-08).",
    },
  },
];

export const links: MapLink[] = [
  // 5.1
  { from: "boi", to: "directive_451", label: "מפקח על הבנקים וקובע להם את ההוראה", lesson: "5.1" },
  { from: "directive_451", to: "pre_approval", label: "קובעת מה אישור עקרוני חייב להציג", lesson: "5.1" },
  { from: "bank", to: "pre_approval", label: "מוציא אותו, בכתב, לתקופה מוגבלת", lesson: "5.1" },
  { from: "pre_approval", to: "offered_rate", label: "הריבית של כל מסלול כתובה בו", lesson: "5.1" },
  // 5.2
  { from: "directive_451", to: "uniform_baskets", label: "לפי התעתיק, בנקים מציעים אותם", lesson: "5.2" },
  { from: "bank", to: "proposed_basket", label: "בוחר אותו לכל לווה", lesson: "5.2" },
  { from: "uniform_baskets", to: "mix", label: "כל סל הוא תמהיל בהרכב קבוע", lesson: "5.2" },
  { from: "uniform_baskets", to: "other_offers", label: "הם מה שמאפשר להשוות בין בנקים", lesson: "5.2" },
  // 5.3
  { from: "irr", to: "expected_total_rate", label: "אותו רעיון, על תשלומים חזויים", lesson: "5.3" },
  { from: "mix_cashflow", to: "expected_total_rate", label: "הריבית האחת שמסבירה את כל התשלומים החזויים", lesson: "5.3" },
  { from: "directive_451", to: "comparison_basis", label: "קובעת מה חייב להיות זהה", lesson: "5.3" },
  { from: "expected_total_rate", to: "comparison_basis", label: "גם מדד כזה מושווה רק על בסיס אחד", lesson: "5.3" },
  // 5.4
  { from: "bond_yields", to: "forward_rate", label: "מעקום האפס מחשבים ריבית לתקופה בעתיד", lesson: "5.4" },
  { from: "forward_rate", to: "future_anchor", label: "היא העוגן העתידי של מסלול משתנה", lesson: "5.4" },
  { from: "bond_yields", to: "forecast_451", label: "עקום האפס הוא קלט של התחזית", lesson: "5.4" },
  { from: "inflation_expectations", to: "forecast_451", label: "ציפיות האינפלציה מזיזות את המסלולים הצמודים", lesson: "5.4" },
  { from: "future_anchor", to: "max_payment", label: "מזיז את המסלולים המשתנים בתחזית", lesson: "5.4" },
  { from: "forecast_451", to: "expected_total_rate", label: "היא הבסיס לחישוב", lesson: "5.4" },
  // 5.5
  { from: "boi", to: "boi_average", label: "מפרסם אותה", lesson: "5.5" },
  { from: "boi", to: "equator", label: "מפרסם אותו", lesson: "5.5" },
  { from: "equator", to: "boi_average", label: "מציג ממוצע לכל בנק", lesson: "5.5" },
  { from: "executed_deal", to: "boi_average", label: "הממוצע מחבר הרבה הלוואות שניתנו בפועל", lesson: "5.5" },
  { from: "estimate", to: "personal_offer", label: "מוחלף בהצעה אישית כשיש אחת", lesson: "5.5" },
  { from: "bank", to: "personal_offer", label: "נותן אותה לתיק מסוים", lesson: "5.5" },
  { from: "pre_approval", to: "personal_offer", label: "אישור עקרוני בכתב הוא הצעה אישית עם תוקף", lesson: "5.5" },
  { from: "personal_offer", to: "executed_deal", label: "כשהיא נחתמת והכסף מועמד", lesson: "5.5" },
  // 5.6–5.7
  { from: "three_goals", to: "monthly_payment", label: "יעד אחד: החזר חודשי נמוך", lesson: "5.6" },
  { from: "three_goals", to: "total_paid", label: "יעד שני: סך תשלומים נמוך", lesson: "5.6" },
  { from: "three_goals", to: "stability", label: "יעד שלישי: חשיפה קטנה לשינויי ריבית ומדד", lesson: "5.6" },
  { from: "exposure", to: "stability", label: "היציבות מודדת את החשיפה", lesson: "5.6" },
  { from: "sensitivity", to: "three_goals", label: "בסדנה: כמה כל מנוף מזיז כל יעד", lesson: "5.8" },
  { from: "mix", to: "sensitivity", label: "מזיזים נתון אחד ורואים מה זז", lesson: "5.7" },
  { from: "sensitivity", to: "monthly_payment", label: "כמה ההחזר זז בכל צעד", lesson: "5.7" },
  // 5.9
  { from: "three_goals", to: "good_mix", label: "קנה מידה: מה שהלקוחות ביקשו", lesson: "5.9" },
  { from: "boi_average", to: "good_mix", label: "קנה מידה: הממוצע, באותה שיטת ריבית", lesson: "5.9" },
  { from: "uniform_baskets", to: "good_mix", label: "קנה מידה: הסל של אותו בנק", lesson: "5.9" },
  { from: "other_offers", to: "good_mix", label: "קנה מידה: הצעה של בנק אחר, על אותו בסיס", lesson: "5.9" },
  { from: "comparison_basis", to: "good_mix", label: "בלי בסיס אחד אין פער", lesson: "5.9" },
  // 5.10
  { from: "good_mix", to: "realistic_mix", label: "טוב על הנייר עוד לא אומר ריאלי", lesson: "5.10" },
  { from: "directive_329", to: "realistic_mix", label: "חמשת הקווים נבדקים על התמהיל כולו", lesson: "5.10" },
  { from: "pti", to: "realistic_mix", label: "ההחזר שנכנס ליחס הוא סכום ההחזרים של המסלולים", lesson: "5.10" },
  { from: "bank_policy", to: "realistic_mix", label: "לא ניתנת לחישוב מבחוץ: רק הצעה או תשובה של בנק", lesson: "5.10" },
  { from: "offered_rate", to: "realistic_mix", label: "ריבית ניתנה בתוך חבילה; בתמהיל אחר היא עשויה להשתנות", lesson: "5.10" },
  { from: "personal_offer", to: "realistic_mix", label: "ריאלי רק אם בנק אחד הציע את כל הריביות יחד", lesson: "5.10" },
];
