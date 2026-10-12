/**
 * The big-picture map: what stage 4 adds to the market region (lesson 4.14).
 * The chain of influence: inflation expectations, housing demand, and security
 * events and crises, joined to the market nodes of stages 0 and 2 (the Bank of
 * Israel's rate, inflation, bond yields, the prime) and to the nodes of the
 * bank, the regulator and the tracks. Every link is a mechanism; where the
 * course could not check how strong it is, the card says so.
 *
 * Each card's dated examples are in lesson 4.14. They come from search-index
 * summaries of Bank of Israel releases and from the team's readings of Bank of
 * Israel data, none opened at the source, and are marked "לא אומת" there.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  {
    id: "inflation_expectations",
    label: "ציפיות אינפלציה",
    region: "market",
    lesson: "4.14",
    kind: "factor",
    card: {
      what: "כמה אינפלציה בשנה המחירים של אג״ח ממשלתיות מגלמים לתקופה מסוימת: ההפרש בין התשואה של אג״ח לא צמודה לשל אג״ח צמודה מאותו אורך, מחושב בחילוק ולא בחיסור.",
      role: "הן ההפרש שמסביר למה מסלול לא צמוד גובה אחוז ריבית גבוה יותר ממסלול צמוד, ועל פיהן נקבעת התחזית למסלולים הצמודים בחישובים לפי הוראת בנק ישראל.",
      when: "בכל השוואה בין מסלול צמוד ללא צמוד, ובכל תחזית של תשלום במסלול צמוד.",
      note: "ציפיות הן מחיר שוק ולא הבטחה, והן כוללות פרמיית סיכון. שיעורים 0.12 ו־4.14.",
    },
  },
  {
    id: "housing_demand",
    label: "ביקוש לדיור",
    region: "market",
    lesson: "4.14",
    kind: "factor",
    card: {
      what: "כמה אנשים רוצים ויכולים לקנות דירות, ובעקבות זה כמה משכנתאות מבקשים מהבנקים.",
      role: "הוא מזיז את נפח הבקשות שהבנקים מקבלים. איך הנפח משפיע על המחיר שהבנק מציע — לא ידוע לקורס, ולא אומת.",
      when: "בכל תקופה; נפח המשכנתאות החדשות מתפרסם אחת לחודש.",
      note: "ריבית גבוהה מייקרת משכנתא (ידע כלכלי כללי). הטענה ״הביקוש לדירות קשיח לחלוטין״ היא ידע מהשטח שלא נבדק. שיעור 4.14.",
    },
  },
  {
    id: "market_events",
    label: "ביטחון ומשברים",
    region: "market",
    lesson: "4.14",
    kind: "factor",
    card: {
      what: "אירועים שמשנים במהירות מה שהשוק והרגולטור מניחים: מלחמה, מגפה, משבר פיננסי.",
      role: "הם יכולים להזיז את ריבית בנק ישראל, את תשואות האג״ח ואת הכללים של הרגולטור, לפעמים בהוראת שעה. הכיוון והגודל משתנים מאירוע לאירוע.",
      when: "לא צפוי מראש; ההשפעה מגיעה בהחלטות של בנק ישראל ובהוראות שעה.",
      note: "בשיעור 4.14 רק דוגמאות מתוארכות (לא אומת). אין כלל קבוע, ואין תחזית.",
    },
  },
];

export const links: MapLink[] = [
  { from: "inflation", to: "inflation_expectations", label: "הציפיות הן הערכה של האינפלציה בעתיד, לא האינפלציה עצמה", lesson: "4.14" },
  { from: "bond_yields", to: "inflation_expectations", label: "מחושבות מההפרש בין אג״ח לא צמודה לצמודה", lesson: "4.14" },
  { from: "inflation_expectations", to: "track_fixed_indexed", label: "הפער בין ריבית של מסלול צמוד ללא צמוד משקף אותן", lesson: "4.14" },
  { from: "bond_yields", to: "track_fixed_unindexed", label: "המחיר של כסף לתקופה ארוכה, שמשפיע על ריבית קבועה", lesson: "4.14" },
  { from: "boi_rate", to: "housing_demand", label: "ריבית גבוהה מייקרת משכנתא ומקטינה ביקוש", lesson: "4.14" },
  { from: "housing_demand", to: "bank", label: "יותר או פחות בקשות לבנק; ההשפעה על המחיר לא אומתה", lesson: "4.14" },
  { from: "market_events", to: "boi_rate", label: "מלחמה או מגפה נכנסות לשיקולי הוועדה המוניטרית", lesson: "4.14" },
  { from: "market_events", to: "boi", label: "הוראות שעה: הרגולטור משנה כללים לתקופה", lesson: "4.14" },
  { from: "market_events", to: "bond_yields", label: "משברים יכולים להזיז את מה שהשוק דורש על חוב", lesson: "4.14" },
];
