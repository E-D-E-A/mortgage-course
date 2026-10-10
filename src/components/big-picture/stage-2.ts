/**
 * Stage 2's nodes on the big-picture map: the anchors a rate is set from
 * (lesson 2.1), the six tracks (2.5–2.8), the repayment methods (2.9–2.10) and
 * the debt balance (2.11) and the risk in each track (2.12), with the links that
 * say how each one moves.
 *
 * Sources for the cards: the stage-2 lessons; the Brain's research on comparing
 * offers (7733250: the anchor and spread, the forecast per track), on leaving a
 * mortgage early (7798786) and the calculation decisions (67436545: an
 * entitlement loan is fixed and CPI-linked; spread kept apart from the anchor).
 * Official rules are the team's transcription, not yet checked against the
 * source; the cards say so. No card states a number.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  {
    id: "prime",
    label: "פריים",
    region: "market",
    lesson: "2.1",
    kind: "factor",
    card: {
      what: "ריבית שהבנקים מחשבים ממנה ריבית של הלוואות רבות. היא ריבית בנק ישראל ועוד תוספת (נכון ל־9 באוקטובר 2026: 1.5 נקודות אחוז; לא אומת), ולכן זזה בכל פעם שבנק ישראל משנה את הריבית שלו.",
      role: "העוגן של מסלול הפריים: הריבית במסלול היא הפריים ועוד המרווח שבחוזה, או פחות ממנו.",
      note: "שיעור 2.1. גובה התוספת — לפי תקציר של מקור רשמי, לא אומת.",
    },
  },
  {
    id: "anchor",
    label: "עוגן",
    region: "market",
    lesson: "2.1",
    kind: "factor",
    card: {
      what: "ריבית שמתפרסמת בשוק, שהריבית במסלול משתנה נקבעת לפיה: הפריים, או תשואה של אג״ח ממשלתיות, או של מק״מ.",
      role: "בכל עדכון של מסלול משתנה, הריבית החדשה היא העוגן באותו יום ועוד המרווח שבחוזה.",
      note: "שיעורים 2.1 ו־2.7.",
    },
  },
  {
    id: "spread",
    label: "מרווח בחוזה",
    region: "bank",
    lesson: "2.1",
    kind: "factor",
    card: {
      what: "כמה הבנק מוסיף לעוגן, או מוריד ממנו, במסלול שהריבית בו משתנה.",
      role: "נקבע בחוזה, ולא זז כשהעוגן זז: כשהעוגן משתנה, הריבית במסלול זזה באותה מידה.",
      note: "שיעור 2.1.",
    },
  },
  {
    id: "track_fixed_unindexed",
    label: "קבועה לא צמודה",
    region: "mix",
    lesson: "2.5",
    kind: "factor",
    card: {
      what: "מסלול שהריבית בו קבועה לכל התקופה, והחוב לא צמוד למדד.",
      role: "שום דבר בו לא זז: לא אחוז הריבית ולא המדד. המחיר: אם הריביות בשוק יירדו, הריבית שלו לא תרד, ויציאה מוקדמת יכולה לעלות הרבה.",
      note: "שיעור 2.5. התשלום על יציאה מוקדמת — לפי תעתיק בצוות ב־Brain, לא אומת.",
    },
  },
  {
    id: "track_fixed_indexed",
    label: "קבועה צמודה",
    region: "mix",
    lesson: "2.5",
    kind: "factor",
    card: {
      what: "מסלול שהריבית בו קבועה לכל התקופה, והחוב צמוד למדד.",
      role: "הריבית לא זזה, אבל היתרה והתשלום זזים עם המדד בכל חודש.",
      note: "שיעור 2.5.",
    },
  },
  {
    id: "track_prime",
    label: "מסלול פריים",
    region: "mix",
    lesson: "2.6",
    kind: "factor",
    card: {
      what: "מסלול לא צמוד, שהריבית בו היא הפריים ועוד מרווח קבוע (או פחות ממנו).",
      role: "בכל פעם שבנק ישראל משנה את הריבית שלו, הריבית במסלול זזה, והתשלום מחושב מחדש.",
      note: "שיעור 2.6.",
    },
  },
  {
    id: "track_var_indexed",
    label: "משתנה צמודה",
    region: "mix",
    lesson: "2.7",
    kind: "factor",
    card: {
      what: "מסלול צמוד למדד, שהריבית בו נקבעת מחדש בכל נקודת עדכון: העוגן באותו יום ועוד המרווח.",
      role: "שני דברים זזים בו: המדד מזיז את החוב בכל חודש, ובכל נקודת עדכון אחוז הריבית יכול לזוז.",
      note: "שיעור 2.7. כל כמה זמן יש נקודת עדכון — לפי החוזה, ומשתנה מבנק לבנק.",
    },
  },
  {
    id: "track_var_unindexed",
    label: "משתנה לא צמודה",
    region: "mix",
    lesson: "2.7",
    kind: "factor",
    card: {
      what: "מסלול לא צמוד, שהריבית בו נקבעת מחדש בכל נקודת עדכון: העוגן באותו יום ועוד המרווח.",
      role: "בין נקודות העדכון הריבית לא זזה. בכל נקודת עדכון היא, והתשלום איתה, יכולים לעלות או לרדת.",
      note: "שיעור 2.7.",
    },
  },
  {
    id: "track_eligibility",
    label: "הלוואת זכאות",
    region: "mix",
    lesson: "2.8",
    kind: "factor",
    card: {
      what: "הלוואה לדיור למי שמשרד הבינוי והשיכון נתן לו תעודת זכאות. אחוז הריבית בה קבוע, ונקבע לפי כלל של המדינה, לא במשא ומתן; החוב צמוד למדד.",
      role: "מסלול אחד בתוך המשכנתא, עד הסכום שבתעודה, ובתוך התקרה של שיעור המימון — לא תוספת מעליה. הריבית לא זזה, והחוב זז עם המדד.",
      note: "שיעור 2.8. לפי מקורות שעוד לא אומתו מול המקור הרשמי.",
    },
  },
  {
    id: "spitzer",
    label: "שפיצר",
    region: "mix",
    lesson: "2.9",
    kind: "factor",
    card: {
      what: "שיטת החזר שבה התשלום שווה בכל חודש, כל עוד הריבית והמדד לא זזו.",
      role: "בהתחלה רוב התשלום הולך לריבית, ובהמשך רובו לקרן.",
      note: "שיעור 2.9. החישוב: שלב 3.",
    },
  },
  {
    id: "equal_principal",
    label: "קרן שווה",
    region: "mix",
    lesson: "2.9",
    kind: "factor",
    card: {
      what: "שיטת החזר שבה בכל חודש מחזירים אותו חלק מהקרן, ועוד הריבית על מה שנשאר.",
      role: "התשלום גבוה בהתחלה ויורד עם הזמן. בסך הכול משלמים פחות ריבית מבשפיצר, באותה ריבית ובאותה תקופה.",
      note: "שיעור 2.9.",
    },
  },
  {
    id: "grace",
    label: "גרייס",
    region: "mix",
    lesson: "2.10",
    kind: "factor",
    card: {
      what: "תקופה בתחילת המסלול שבה לא מחזירים קרן (גרייס חלקי) או לא משלמים כלום (גרייס מלא).",
      role: "מקטין את התשלום בהתחלה, אבל דחיית תשלום אינה הקטנת עלות: הקרן לא קטנה, ובגרייס מלא הריבית אף מתווספת לחוב.",
      note: "שיעור 2.10.",
    },
  },
  {
    id: "balloon_bullet",
    label: "בלון ובוליט",
    region: "mix",
    lesson: "2.10",
    kind: "factor",
    card: {
      what: "מסלולים שבהם הקרן, או הקרן והריבית, מוחזרות בסוף, בתשלום אחד.",
      role: "התשלום בדרך נמוך, והתשלום בסוף גדול. צריך לדעת מראש מאיפה יבוא.",
      note: "שיעור 2.10.",
    },
  },
  {
    id: "debt_balance",
    label: "יתרת חוב",
    region: "result",
    lesson: "2.11",
    kind: "factor",
    card: {
      what: "כמה עוד צריך להחזיר על ההלוואה ברגע מסוים.",
      role: "ריבית מוסיפה לה, תשלום מוריד ממנה, והצמדה משנה אותה עצמה. שינוי בריבית לא מזיז אותה ביום השינוי: הוא משנה את הריבית מכאן והלאה.",
      note: "שיעור 2.11.",
    },
  },
  {
    id: "track_risk",
    label: "הסיכון בכל מסלול",
    region: "mix",
    lesson: "2.12",
    kind: "factor",
    card: {
      what: "מה יכול לקרות לתשלום וליתרה במסלול בגלל דברים שלא בשליטתכם: שינוי באחוז הריבית, ועליית מחירים.",
      role: "ריבית פועלת על כל חוב. מה שמבדיל בין המסלולים הוא אם אחוז הריבית יכול לזוז, ומתי, ואם החוב צמוד למדד. בטבלת המסלולים יש לכל מסלול משפט אחד על הסיכון שלו.",
      note: "שיעור 2.12. איך שוקלים סיכון מול מחיר — בשלב 5.",
    },
  },
];

export const links: MapLink[] = [
  { from: "boi_rate", to: "prime", label: "הפריים זזה איתה", lesson: "2.1" },
  { from: "prime", to: "anchor", label: "הפריים היא עוגן אחד", lesson: "2.1" },
  { from: "bond_yields", to: "anchor", label: "תשואה של אג״ח ממשלתיות היא עוגן אחר", lesson: "2.1" },
  { from: "bank", to: "spread", label: "קובע אותו בהצעה, והוא נכתב בחוזה", lesson: "2.1" },
  { from: "inflation", to: "track_fixed_indexed", label: "היתרה והתשלום זזים עם המדד", lesson: "2.5" },
  { from: "mix", to: "track_fixed_unindexed", label: "מסלול שאפשר לשים בתמהיל", lesson: "2.5" },
  { from: "mix", to: "track_fixed_indexed", label: "מסלול שאפשר לשים בתמהיל", lesson: "2.5" },
  { from: "prime", to: "track_prime", label: "הריבית במסלול: הפריים ועוד המרווח", lesson: "2.6" },
  { from: "spread", to: "track_prime", label: "נקבע בחוזה ולא זז", lesson: "2.6" },
  { from: "mix", to: "track_prime", label: "מסלול שאפשר לשים בתמהיל", lesson: "2.6" },
  { from: "anchor", to: "track_var_indexed", label: "בכל נקודת עדכון: העוגן ועוד המרווח", lesson: "2.7" },
  { from: "anchor", to: "track_var_unindexed", label: "בכל נקודת עדכון: העוגן ועוד המרווח", lesson: "2.7" },
  { from: "spread", to: "track_var_indexed", label: "נקבע בחוזה ולא זז", lesson: "2.7" },
  { from: "spread", to: "track_var_unindexed", label: "נקבע בחוזה ולא זז", lesson: "2.7" },
  { from: "inflation", to: "track_var_indexed", label: "היתרה והתשלום זזים עם המדד", lesson: "2.7" },
  { from: "mix", to: "track_var_indexed", label: "מסלול שאפשר לשים בתמהיל", lesson: "2.7" },
  { from: "mix", to: "track_var_unindexed", label: "מסלול שאפשר לשים בתמהיל", lesson: "2.7" },
  { from: "inflation", to: "track_eligibility", label: "היתרה והתשלום זזים עם המדד", lesson: "2.8" },
  { from: "mix", to: "track_eligibility", label: "מסלול שאפשר לשים בתמהיל, למי שזכאי", lesson: "2.8" },
  { from: "spitzer", to: "mix", label: "שיטת החזר לכל מסלול", lesson: "2.9" },
  { from: "equal_principal", to: "mix", label: "שיטת החזר לכל מסלול", lesson: "2.9" },
  { from: "grace", to: "mix", label: "אפשר להוסיף למסלול", lesson: "2.10" },
  { from: "balloon_bullet", to: "mix", label: "שיטת החזר שדוחה את הקרן לסוף", lesson: "2.10" },
  { from: "inflation", to: "debt_balance", label: "במסלול צמוד, משנה את היתרה עצמה", lesson: "2.11" },
  { from: "prime", to: "debt_balance", label: "משנה את הריבית על היתרה, לא את היתרה ביום השינוי", lesson: "2.11" },
  { from: "mix", to: "debt_balance", label: "לכל מסלול יתרה משלו", lesson: "2.11" },
  { from: "prime", to: "track_risk", label: "בפריים: אחוז הריבית זז עם כל שינוי שלה", lesson: "2.12" },
  { from: "anchor", to: "track_risk", label: "במסלולים המשתנים: אחוז הריבית נקבע מחדש לפיו בנקודות העדכון", lesson: "2.12" },
  { from: "inflation", to: "track_risk", label: "במסלולים הצמודים: מזיזה את החוב ואת התשלום", lesson: "2.12" },
  { from: "mix", to: "track_risk", label: "לכל מסלול סיכון משלו", lesson: "2.12" },
];
