/**
 * Stage 7's nodes on the big-picture map: early repayment, refinancing and complex deals.
 * What it costs to leave a loan (7.1–7.3): the Order's five fees, the discounting fee and its
 * reduction for time served, the exit point and the notice. Whether to refinance (7.4–7.5): the
 * test of section 15א, the rate for comparison purposes, why a lower payment is not a saving, and
 * the two kinds of refinancing. Complex deals (7.6–7.7), introductions only: the upgrader, the
 * bridge loan, draws in instalments, builder financing, self-build, two banks on one property, the
 * reverse mortgage. The workshop (7.8) closes with the refinancing check and the map of topics that
 * need depth.
 *
 * Written by the author of 7.6–7.8 (stage 7, author C) on 2026-10-16, while the authors of 7.1–7.5
 * were writing: the cards of 7.1–7.5 are drawn from the research notes (brain-calculation.md §6–§7)
 * and the stage brief and need one consistency read against those lessons' final text. No card
 * states a number: every figure belongs in the lesson, with its label.
 *
 * Sources for the cards. 7.1–7.5: the Banking Order on early repayment (2002) and section 15א of
 * Directive 451 are known to the course only through the team's transcription (read by the team on
 * 2026-08-02/03), so every card on them says "לא אומת" in its note. 7.6–7.7: almost nothing is
 * known. What the cards say is the name of the deal, what makes it complex and what to ask; the
 * rules, rates and procedures of these deals are NOT known to the course, and each note says so.
 * Field knowledge behind 7.6–7.7 (research/field-knowledge.md): FK-H-002, 003, 010, 011, which the
 * course labels as such and which waits for Eylon. The complex deals out of the first version of the
 * product are a Mogi decision of 2026-07-29.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  // ───────────── 7.1: what it costs to leave a loan ─────────────
  {
    id: "early_repay_order",
    label: "צו הפירעון המוקדם",
    region: "regulation",
    lesson: "7.1",
    kind: "factor",
    card: {
      what: "צו שקובע מה בנק רשאי לגבות כשפורעים הלוואה לדיור לפני הזמן: אילו עמלות, ובאילו תנאים.",
      role: "הוא הסיבה שאפשר לחשב מראש כמה עולה לצאת מהלוואה, ושהחישוב אחיד בכל הבנקים. בלעדיו כל בנק היה קובע לעצמו.",
      note: "שיעור 7.1. הצו מוכר לקורס רק דרך תעתיק של הצוות (נקרא ב־2 באוגוסט 2026), לא נבדק מחדש מול הצו עצמו: לא אומת.",
    },
  },
  {
    id: "early_repay_fees",
    label: "חמש עמלות פירעון מוקדם",
    region: "bank",
    lesson: "7.1",
    kind: "factor",
    card: {
      what: "חמישה סוגי עמלה שאפשר לגבות בפירעון מוקדם: תפעולית, אי־הודעה מוקדמת, היוון, מדד והפרשי שער. כל אחת חלה במקרה אחר.",
      role: "לא כל פירעון מוקדם עולה את כולן. מי שמבלבל בין חמש העמלות, או חושב שיש אחת, טועה בחישוב כמעט תמיד.",
      note: "שיעור 7.1. לפי תעתיק הצוות של הצו, לא אומת. עמלת ההיוון היא הגדולה ביניהן ולכן יש לה שיעורים משלה.",
    },
  },

  // ───────────── 7.2: the discounting fee ─────────────
  {
    id: "discount_fee",
    label: "עמלת היוון",
    region: "result",
    lesson: "7.2",
    kind: "factor",
    card: {
      what: "פיצוי לבנק על ההפרש בין הריבית שנקבעה בהלוואה לריבית של היום, על התקופה שנשארה. הנוסחה מחזירה את התשלומים העתידיים לערך של היום פעמיים: לפי ריבית השוק ולפי ריבית ההלוואה.",
      role: "בהלוואה בריבית קבועה היא העלות הגדולה של היציאה. כשהריבית ירדה מאז שנלקחה ההלוואה העמלה גדולה, וכשהיא עלתה היא יכולה להתאפס. הבנק גובה את הנמוכה משתי נוסחאות.",
      note: "שיעור 7.2. הנוסחאות והערכים מתעתיק הצוות של הצו (לא אומת). איזו ריבית ממוצעת נקראת כשההלוואה במדרגת זמן שונה מהמקורית — שאלה פתוחה.",
    },
  },
  {
    id: "time_reduction",
    label: "הפחתה לפי ותק",
    region: "regulation",
    lesson: "7.2",
    kind: "factor",
    card: {
      what: "הנחה מעמלת ההיוון שגדלה ככל שההלוואה ותיקה יותר.",
      role: "היא מקטינה את מה שמשלמים על יציאה אחרי כמה שנים, ולכן היא חלק מהשאלה אם כדאי לחכות.",
      note: "שיעור 7.2. מדרגות הוותק מתעתיק הצוות של הצו, לא אומת. היא חלה על עמלת ההיוון בלבד.",
    },
  },
  {
    id: "boi_average_fee",
    label: "הריבית הממוצעת בחישוב העמלה",
    region: "market",
    lesson: "7.2",
    kind: "factor",
    card: {
      what: "אותה ריבית ממוצעת שבנק ישראל מפרסם, כפי שנלמד בהשוואת הצעות, כשהיא משמשת הפעם כריבית השוק בנוסחת ההיוון, ביום הפירעון וביום שההלוואה ניתנה.",
      role: "כך הריבית שבנק ישראל מפרסם נכנסת לחישוב של כסף: מה שהיא עושה בהשוואת הצעות היא עושה גם בעלות היציאה.",
      note: "שיעור 7.2. הריבית שמתפרסמת היא אפקטיבית שנתית, וריבית החוזה נומינלית: ממירים אותן אחרת. הקובץ וטווחי השנים — מתעתיק הצוות, לא אומת.",
    },
  },

  // ───────────── 7.3: exit points and timing ─────────────
  {
    id: "exit_point",
    label: "תחנת יציאה",
    region: "mix",
    lesson: "7.3",
    kind: "factor",
    card: {
      what: "היום שבו ריבית של מסלול משתנה מתעדכנת. בו אפשר לפרוע בלי עמלת היוון, ונשארת רק העמלה התפעולית.",
      role: "מי שמתכנן יציאה מחכה לתחנה, ולכן המועד של התחנה הוא חלק מהתכנון. במסלול קבוע אין תחנות, ובמסלול שמתעדכן כל שנה או יותר אין עמלת היוון בכלל.",
      note: "שיעור 7.3. מועדי התחנות כתובים בחוזה של כל הלוואה, לא ברגולציה. התנאים מתעתיק הצוות של הצו, לא אומת.",
    },
  },
  {
    id: "prior_notice",
    label: "הודעה מוקדמת",
    region: "regulation",
    lesson: "7.3",
    kind: "factor",
    card: {
      what: "הודעה בכתב לבנק על כוונה לפרוע, בחלון שהצו קובע לפני יום הפירעון.",
      role: "בלי הודעה בזמן נוספת עמלה, והודעה מוקדמת מדי או כזו שלא פועלים לפיה לא תמיד נחשבת. היא חלק מהלוח של מי שמתכנן יציאה, יחד עם תאריך הפירעון.",
      note: "שיעור 7.3. החלון והכללים מתעתיק הצוות של הצו, לא אומת. גם היום של חודש שבו פורעים משפיע על עמלת המדד.",
    },
  },

  // ───────────── 7.4: is it worth refinancing ─────────────
  {
    id: "refi_test",
    label: "מבחן הכדאיות של מחזור",
    region: "regulation",
    lesson: "7.4",
    kind: "factor",
    card: {
      what: "השוואה בין שני מספרים מאותה שיטת חישוב: הריבית הכוללת החזויה של ההלוואה החדשה, והריבית לצרכי השוואה של ההלוואה הקיימת, שכוללת את מחיר היציאה ממנה.",
      role: "אם הריבית לצרכי השוואה גבוהה מהחזויה, יש כדאיות כלכלית למחזר. אם לא, המחזור עולה יותר ממה שהוא חוסך.",
      note: "שיעור 7.4. סעיף 15א להוראה 451, לפי תעתיק הצוות, לא אומת. הוא מודד כדאיות ריבית בלבד: לא את כל מה שמשפחה צריכה לשקול.",
    },
  },
  {
    id: "comparison_rate",
    label: "שיעור הריבית לצרכי השוואה",
    region: "result",
    lesson: "7.4",
    kind: "factor",
    card: {
      what: "אחוז הריבית שבו עולה להמשיך את ההלוואה הקיימת מהיום, כשמחשבים גם את עמלת הפירעון המוקדם שתשולם אם פורעים עכשיו.",
      role: "הוא מה שמאפשר להשוות הלוואה קיימת להצעה חדשה על בסיס אחד: אותו מדד, אותה תקופה שנשארה.",
      note: "שיעור 7.4. הבנק חייב להציג אותו לפי תעתיק הצוות, לא אומת. מה כלול בעלות לצורך הזו, מלבד עמלת הפירעון — לא ידוע (שאלה לעורך דין).",
    },
  },
  {
    id: "balance_report",
    label: "דוח יתרות לסילוק",
    region: "client",
    lesson: "7.4",
    kind: "factor",
    card: {
      what: "דוח מהבנק שמראה כמה לווים חייבים היום, ומה העמלות והריביות לפי המסלולים.",
      role: "בלעדיו אי אפשר לחשב מחזור: כל מספר בבדיקה, מהיתרה ועד העמלה, נלקח ממנו ולא מניחוש.",
      note: "שיעור 7.4. בטפסים של בנקים מבקשים אותו במחזור, כפי שתועד אצל הצוות; לא נבדק מחדש מול האתר של הבנק.",
    },
  },
  {
    id: "lower_payment",
    label: "תשלום נמוך אינו חיסכון",
    region: "result",
    lesson: "7.4",
    kind: "factor",
    card: {
      what: "מחזור שמקטין את התשלום החודשי יכול להגדיל את סך מה ששילמו: למשל כשהתקופה מתארכת או כשהעמלה נכנסת לחשבון.",
      role: "הוא הטעות הנפוצה ביותר בשיחה על מחזור. בודקים כמה משלמים בסך הכול עד הסוף, ולא רק מה יורד בכל חודש.",
      note: "שיעור 7.4. הבדיקה היא חישוב על המספרים של כל תיק; אין כלל כללי.",
    },
  },

  // ───────────── 7.5: internal or external ─────────────
  {
    id: "refi_kinds",
    label: "מחזור פנימי וחיצוני",
    region: "property",
    lesson: "7.5",
    kind: "factor",
    card: {
      what: "מחזור פנימי מחליף את ההלוואה באותו בנק. מחזור חיצוני מעביר אותה לבנק אחר, שנותן הלוואה חדשה, ובכסף שלה סוגרים את הקודמת.",
      role: "שני המסלולים עונים על אותה שאלת כדאיות. הם שונים, לפי הקריאה של הקורס, במה שנדרש (בנק חדש בוחן מחדש) ובמה שאפשר לשאול את הבנק הקיים לפני.",
      note: "שיעור 7.5. מה שיש לקורס על ההבדלים בין השניים — ידע מהשטח, ממתין לאישור אילון.",
    },
  },

  // ───────────── 7.6: complex deals, part one ─────────────
  {
    id: "upgrader_deal",
    label: "עסקת משפרי דיור",
    region: "property",
    lesson: "7.6",
    kind: "factor",
    card: {
      what: "עסקה של מי שכבר יש לו דירה ועובר לדירה אחרת, ומוכר את הקודמת. שתי דירות, שני תאריכים והלוואה קיימת.",
      role: "ההון העצמי של המשפחה נעול בדירה שעוד לא נמכרה. לכן השאלה מתי הכסף מגיע, ומה עושים עד אז, היא חלק מהעסקה.",
      note: "שיעור 7.6, היכרות בלבד. תקרת המימון לדירה חליפית מתעתיק הצוות של הוראה 329 (לא אומת). כמה זמן מותר למכור, ומה קורה להלוואה הישנה — לא ידוע לקורס.",
    },
  },
  {
    id: "bridge_loan",
    label: "הלוואת גישור",
    region: "property",
    lesson: "7.6",
    kind: "factor",
    card: {
      what: "הלוואה לתקופה קצרה שמגשרת על הפער בין כסף שצריך לשלם עכשיו לכסף שאמור להגיע אחר כך, למשל ממכירת הדירה הישנה.",
      role: "היא יכולה לפתוח עסקה שאי אפשר לסגור בלעדיה, אבל מוסיפה הלוואה, עלות ותאריך שאפשר לפספס. הקורס לא יודע אם ואיך בנקים נותנים אותה.",
      note: "שיעור 7.6, היכרות בלבד. הגדרה כללית של הקורס. תנאים, מחיר, בטוחה וחישוב ביחס ההחזר — לא ידועים: אל תמסרו מספר ללקוחות, והפנו למומחה.",
    },
  },
  {
    id: "progress_draws",
    label: "משיכות לשיעורין",
    region: "property",
    lesson: "7.6",
    kind: "factor",
    card: {
      what: "הלוואה שמקבלים בכמה חלקים, ככל שהעסקה מתקדמת, ולא כולה ביום אחד.",
      role: "לוח הסילוקין שנלמד בקורס מניח שכל ההלוואה ניתנת ביום אחד, ולכן הוא לא מתאר הלוואה כזו. יתרת החוב והתשלום משתנים בכל משיכה.",
      note: "שיעור 7.6, היכרות בלבד. איך מחשבים ריבית וצמדה על חלק שנמשך, ומתי מתחילים להחזיר — לא ידוע לקורס.",
    },
  },
  {
    id: "builder_escort",
    label: "ליווי בנקאי ומימון קבלן",
    region: "property",
    lesson: "7.6",
    kind: "factor",
    card: {
      what: "בקניית דירה מקבלן, לפני שהיא נבנתה, בנק מלווה את הפרויקט והקונים משלמים לקבלן בשלבים לפי החוזה. ״מימון קבלן״ נאמר גם על הסדרים שהקבלן עצמו מציע לקונים.",
      role: "הדירה עוד לא קיימת, ולכן יש צד שלישי, שלבי תשלום ובטוחה שונה מהרגילה. מי שמבלבל בין שני הפירושים של ״מימון קבלן״ מחליט על מידע לא נכון.",
      note: "שיעור 7.6, היכרות בלבד. מה בדיוק מחייב את הבנק ואת הקבלן — לא ידוע לקורס. בטפסים של בנקים מופיע ״ליווי בנקאי״ כשהבטוחה ללקוח היא ערבות חוק מכר (כפי שתועד אצל הצוות, לא נבדק מחדש).",
    },
  },
  {
    id: "sale_law_guarantee",
    label: "ערבות חוק מכר",
    region: "property",
    lesson: "7.6",
    kind: "factor",
    card: {
      what: "ערבות שנועדה להגן על כסף שקונה שילם לקבלן על דירה שעוד לא נמסרה.",
      role: "היא הבטוחה של הקונה בעסקה מול קבלן, כפי שהיא מופיעה בטפסי הבנקים. לכן בעסקה כזו שואלים מי נתן אותה, ועל כמה.",
      note: "שיעור 7.6. הגדרה כללית, לא נבדקה מול החוק: לא אומת. תנאי הערבות וגובהה לא ידועים לקורס, ועורך הדין של העסקה הוא מי שבודק אותם.",
    },
  },

  // ───────────── 7.7: complex deals, part two ─────────────
  {
    id: "self_build",
    label: "בנייה עצמית (המורכבות)",
    region: "property",
    lesson: "7.7",
    kind: "factor",
    card: {
      what: "הלוואה לבניית בית על מגרש: ביום שהיא ניתנת הבית עוד לא קיים. מי שבונה בעצמו הוא גם הקבלן, וההלוואה עוברת שלבים.",
      role: "השווי שהבנק מודד משתנה לאורך הבנייה, ויש מסמכים נוספים (מגרש, תוכניות, היתרים). לכן התיק נפתח אחרת.",
      note: "שיעור 7.7, היכרות בלבד. הרעיון של מימון בשני שלבים הוא ידע מהשטח (ממתין לאישור אילון) ולא נמצא לו מקור רשמי. שיעורי המימון והתנאים של בנקים — לא אומתו.",
    },
  },
  {
    id: "lien_rank",
    label: "דרגת השעבוד",
    region: "property",
    lesson: "7.7",
    kind: "factor",
    card: {
      what: "כששני בנקים או יותר משעבדים אותו נכס, צריך לדעת אם הם באותה דרגה (פארי־פאסו) או שאחד בדרגה שנייה, אחרי השני. זו הבחנה שהקורס לא יודע להכריע בה.",
      role: "הדרגה קובעת מי נפרע ראשון אם הנכס נמכר, ולכן היא משפיעה על ההסכמה של כל בנק ועל המחיר. אבל מה בדיוק קורה בכל אחד מהמצבים, בישראל ובפועל, לא ידוע לקורס.",
      note: "שיעור 7.7. ידע מהשטח (ממתין לאישור אילון): שני בנקים על אותו נכס. הכלל של הוראה 329 שהמימון נבחן על כל ההלוואות על הנכס — לפי תקציר, לא אומת. משכנתא מדרגה שנייה מחוץ לגרסה הראשונה של המוצר (החלטה של Mogi מ־29.7.2026).",
    },
  },
  {
    id: "reverse_mortgage",
    label: "משכנתא הפוכה",
    region: "property",
    lesson: "7.7",
    kind: "factor",
    card: {
      what: "הלוואה שנועדה לבני גיל הזהב, שמשעבדים בה נכס בבעלותם המלאה כדי לקבל כסף, ומחזירים אותה לפי הסדר שונה מהרגיל.",
      role: "היא הפוכה מהמשכנתא שנלמדה בקורס: הלווים מבוגרים, אין רכישה, ואחרי הלווים יש יורשים. לכן יש בה שאלות של גיל, ביטוח ויורשים שאין במשכנתא רגילה.",
      note: "שיעור 7.7, היכרות בלבד. ידע מהשטח (ממתין לאישור אילון), לא נבדק מול מקור. תנאים, גיל, מחיר ודרך ההחזר — לא ידועים לקורס.",
    },
  },

  // ───────────── 7.8: the workshop ─────────────
  {
    id: "refi_check",
    label: "בדיקת כדאיות מחזור",
    region: "result",
    lesson: "7.8",
    kind: "factor",
    card: {
      what: "הבדיקה שהסדנה בונה: מה עולה לצאת מההלוואה הקיימת, מה מציעה ההלוואה החדשה, האם המבחן של הרגולציה מצביע על כדאיות, ומה עוד המשפחה צריכה לדעת.",
      role: "היא התוצר של השלב. היא לא מסתיימת במספר אחד: מה שעולה על הבדיקה הוא גם מה שהמספרים לא יודעים, כמו התוספת לשיפוץ.",
      note: "שיעור 7.8, על תיק ג׳ ובבנקים בדויים. הכללים מתעתיק הצוות של הצו ושל סעיף 15א, לא אומת.",
    },
  },
  {
    id: "complex_map",
    label: "מפת נושאים להעמקה",
    region: "result",
    lesson: "7.8",
    kind: "factor",
    card: {
      what: "רשימה של מה בתיק מורכב ומחייב מומחה, לפי מה שהקורס יודע ומה שהוא לא יודע.",
      role: "היא מה שיועץ מסמן לפני שהוא מבטיח משהו: איזה חלק בתיק הוא חישוב שהקורס מלמד, ואיזה הוא שאלה פתוחה.",
      note: "שיעור 7.8. מה בה נשען על מקור ומה לא — כתוב בכל שורה.",
    },
  },
];

export const links: MapLink[] = [
  // 7.1
  { from: "early_repay_order", to: "early_repay_fees", label: "הצו קובע אילו עמלות מותר לגבות", lesson: "7.1" },
  { from: "fee", to: "early_repay_fees", label: "עמלה היא תשלום על אירוע; פירעון מוקדם הוא אירוע כזה", lesson: "7.1" },
  { from: "directive_451", to: "early_repay_order", label: "ההוראה על השוואת הצעות מפנה אליו", lesson: "7.1" },
  // 7.2
  { from: "early_repay_fees", to: "discount_fee", label: "אחת מהחמש, והגדולה", lesson: "7.2" },
  { from: "boi_average", to: "boi_average_fee", label: "אותה ריבית ממוצעת, בשימוש אחר", lesson: "7.2" },
  { from: "boi_average_fee", to: "discount_fee", label: "ריבית השוק של הנוסחה", lesson: "7.2" },
  { from: "present_value", to: "discount_fee", label: "העמלה היא הפרש בין שני ערכים נוכחיים", lesson: "7.2" },
  { from: "time_reduction", to: "discount_fee", label: "ככל שההלוואה ותיקה, העמלה קטנה", lesson: "7.2" },
  { from: "track_fixed_unindexed", to: "discount_fee", label: "במסלול קבוע העמלה גדולה", lesson: "7.2" },
  { from: "track_prime", to: "discount_fee", label: "במסלול פריים אין עמלת היוון", lesson: "7.2" },
  // 7.3
  { from: "exit_point", to: "discount_fee", label: "בתחנה העמלה היא רק העמלה התפעולית", lesson: "7.3" },
  { from: "prior_notice", to: "early_repay_fees", label: "הודעה בזמן מונעת עמלת אי־הודעה", lesson: "7.3" },
  { from: "track_var_unindexed", to: "exit_point", label: "מסלול משתנה מתעדכן בתחנות", lesson: "7.3" },
  { from: "mix", to: "exit_point", label: "בתמהיל, כל מסלול יוצא בתאריך אחר", lesson: "7.3" },
  // 7.4
  { from: "expected_total_rate", to: "refi_test", label: "הריבית החזויה של ההלוואה החדשה", lesson: "7.4" },
  { from: "comparison_rate", to: "refi_test", label: "מול הריבית לצרכי השוואה של הקיימת", lesson: "7.4" },
  { from: "discount_fee", to: "comparison_rate", label: "מחיר היציאה נכנס לחישוב", lesson: "7.4" },
  { from: "balance_report", to: "comparison_rate", label: "הנתונים נלקחים ממנו", lesson: "7.4" },
  { from: "total_paid", to: "lower_payment", label: "משווים את הסך, לא רק את התשלום החודשי", lesson: "7.4" },
  { from: "refi_test", to: "lower_payment", label: "המבחן לא נשען על גובה התשלום", lesson: "7.4" },
  // 7.5
  { from: "refi_kinds", to: "refi_test", label: "אותה שאלה, בשני מסלולים", lesson: "7.5" },
  { from: "refi_kinds", to: "underwriting", label: "בנק חדש בוחן מחדש (קריאה של הקורס על ידע מהשטח, לא אומת)", lesson: "7.5" },
  // 7.6
  { from: "upgrader_deal", to: "ltv", label: "תקרת המימון לדירה חליפית נמוכה יותר (תעתיק הצוות, לא אומת)", lesson: "7.6" },
  { from: "upgrader_deal", to: "equity", label: "ההון העצמי נעול בדירה שעוד לא נמכרה", lesson: "7.6" },
  { from: "upgrader_deal", to: "early_repay_fees", label: "פירעון ההלוואה הישנה עשוי להיתקל בעמלות", lesson: "7.6" },
  { from: "upgrader_deal", to: "bridge_loan", label: "פער בזמן שאולי מגשרים עליו", lesson: "7.6" },
  { from: "bridge_loan", to: "obligations", label: "הלוואה נוספת: אם היא נספרת, לא ידוע", lesson: "7.6" },
  { from: "progress_draws", to: "schedule", label: "לוח סילוקין של הלוואה שניתנת ביום אחד לא מתאר אותה", lesson: "7.6" },
  { from: "builder_escort", to: "progress_draws", label: "התשלומים לקבלן הם בשלבים", lesson: "7.6" },
  { from: "sale_law_guarantee", to: "builder_escort", label: "הבטוחה של הקונה בעסקה", lesson: "7.6" },
  { from: "builder_escort", to: "collateral", label: "בטוחה שונה מהרגילה כשהדירה עוד לא קיימת", lesson: "7.6" },
  // 7.7
  { from: "self_build", to: "progress_draws", label: "גם הלוואה לבנייה ניתנת בשלבים (לא אומת)", lesson: "7.7" },
  { from: "self_build", to: "value", label: "השווי משתנה לאורך הבנייה", lesson: "7.7" },
  { from: "lien_rank", to: "collateral", label: "אותו נכס, כמה מלווים", lesson: "7.7" },
  { from: "lien_rank", to: "ltv", label: "המימון נבחן על כל ההלוואות על הנכס (תקציר, לא אומת)", lesson: "7.7" },
  { from: "reverse_mortgage", to: "collateral", label: "נכס בבעלות מלאה משמש בטוחה", lesson: "7.7" },
  // 7.8
  { from: "refi_test", to: "refi_check", label: "הבדיקה מתחילה במבחן", lesson: "7.8" },
  { from: "discount_fee", to: "refi_check", label: "ובמחיר היציאה", lesson: "7.8" },
  { from: "same_property", to: "refi_check", label: "התוספת לשיפוץ נשענת על אותו נכס", lesson: "7.8" },
  { from: "pti", to: "refi_check", label: "ויחס ההחזר של התיק החדש", lesson: "7.8" },
  { from: "refi_check", to: "complex_map", label: "מה שנשאר פתוח עובר למפת הנושאים", lesson: "7.8" },
  { from: "bridge_loan", to: "complex_map", label: "נושא שמחייב מומחה", lesson: "7.8" },
  { from: "lien_rank", to: "complex_map", label: "נושא שמחייב מומחה", lesson: "7.8" },
];
