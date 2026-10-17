/**
 * Stage 1's nodes on the big-picture map: the participants in a mortgage deal
 * (lesson 1.6), and three factors from lessons 1.2 and 1.4 that connect them.
 *
 * Sources for the cards (see lesson 1.6's sources): the Brain's journey pages
 * J-050, J-130, J-140, J-160 and J-170, its research pages on the banks'
 * advisor channels (6029348), on signing and the two powers of attorney
 * (9830401), on insurance (9797633) and on the advisor-licensing bill
 * (9568265); field knowledge from a field banker (FK-H-040). The lawyer's card is a
 * general description, marked as not checked. No card states a number.
 */
import type { MapLink, MapNode } from "./types.ts";

export const nodes: MapNode[] = [
  {
    id: "borrowers",
    label: "הלווים",
    region: "client",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "מי שלוקחים את המשכנתא: אדם אחד, או כמה יחד, למשל בני זוג.",
      role: "מביאים את ההון העצמי, מוסרים נתונים ומסמכים, בוחרים בנק ותמהיל, חותמים, ומחזירים את ההלוואה.",
      when: "מתחילת הדרך ועד התשלום האחרון.",
    },
  },
  {
    id: "advisor",
    label: "יועץ משכנתאות",
    region: "client",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "בעל מקצוע שהלווים שוכרים. הוא עובד בשבילם, לא בשביל הבנק.",
      role: "אוסף נתונים ומסמכים, פונה לכמה בנקים בשם הלווים לפי כתב הרשאה, משווה את ההצעות ומנהל משא ומתן.",
      when: "מהשיחה הראשונה ועד החתימה.",
      note: "נכון ל־9 באוקטובר 2026 העיסוק לא דורש רישיון, והצעת חוק בנושא עוד לא עברה (לא אומת).",
    },
  },
  {
    id: "bank",
    label: "הבנק",
    region: "bank",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "המלווה. בעסקה שלנו, בנק.",
      role: "עונה לבקשה ומציע תנאים, נותן רשימת שמאים, בודק את הלווים ואת הנכס, חותם איתם, מעביר את הכסף ודואג שהשעבוד יירשם על הנכס.",
      when: "מהבקשה הראשונה ועד סוף ההלוואה.",
    },
  },
  {
    id: "boi",
    label: "בנק ישראל",
    region: "regulation",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "הבנק המרכזי. הוא לא מלווה ללווים ולא חותם על העסקה.",
      role: "קובע את ריבית בנק ישראל, ומפקח על הבנקים: קובע להם כללים, גם למשכנתאות. למשל, תוך כמה זמן הבנק צריך לענות לבקשה.",
      when: "לא נכנס לעסקה עצמה. הכללים שלו חלים עליה כל הזמן.",
      note: "הכללים עצמם: משיעור 1.7 ובשלב 4.",
    },
  },
  {
    id: "seller",
    label: "מוכר או קבלן",
    region: "property",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "מי שמוכר את הנכס: הבעלים, בדירה יד שנייה, או חברה שבונה, בדירה חדשה.",
      role: "חותם עם הקונים על חוזה, ומקבל את המחיר: חלק מההון העצמי שלהם, וחלק מכסף ההלוואה שהבנק מעביר אליו.",
      when: "מהחוזה ועד שכל המחיר שולם.",
    },
  },
  {
    id: "lawyer",
    label: "עורך דין",
    region: "property",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "עורך הדין של הקונים בעסקה.",
      role: "בודק מה רשום על הנכס, מנסח את חוזה הרכישה או בודק אותו, ודואג לרישומים שמגינים על הקונים, כמו הערת אזהרה.",
      when: "מלפני החוזה ועד שהנכס רשום על שם הקונים.",
      note: "תיאור כללי של העבודה בעסקת דירה; לא נבדק מול מקור.",
    },
  },
  {
    id: "appraiser",
    label: "שמאי",
    region: "property",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "בעל מקצוע עם רישיון, שמעריך כמה הנכס שווה.",
      role: "הבנק נותן רשימת שמאים. הלווים או היועץ מזמינים אחד מהם, הוא מבקר בנכס, ושולח את הדוח ישירות לבנק. הלווים משלמים לו, ומותר להם לבקש עותק.",
      when: "אחרי שהבנק נתן רשימת שמאים, ולפני שהוא מעביר את הכסף.",
    },
  },
  {
    id: "insurer",
    label: "מבטח",
    region: "property",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "חברת ביטוח.",
      role: "מבטחת את הלווים ואת מבנה הדירה, כך שאם קורה משהו, החוב לבנק מכוסה. הבנק רשום כמי שמקבל את הכסף מהביטוח. מותר לקנות את הביטוח גם מחוץ לבנק.",
      when: "לפני שהבנק מעביר את הכסף.",
      note: "שני הביטוחים: שיעור 4.9.",
    },
  },
  {
    id: "registry",
    label: "טאבו",
    region: "property",
    lesson: "1.6",
    kind: "actor",
    card: {
      what: "המרשם שבו רשום מי הבעלים של הנכס, ומה רשום עליו. בחלק מהנכסים הזכויות רשומות ברשות מקרקעי ישראל או אצל חברה משכנת, ולא בטאבו.",
      role: "שם בודקים את הנכס לפני העסקה (נסח טאבו), שם נרשמות הערות אזהרה, ושם נרשם בסוף השעבוד לטובת הבנק.",
      when: "לפני החוזה, ועד אחרי שהבנק העביר את הכסף.",
    },
  },
  {
    id: "equity",
    label: "הון עצמי",
    region: "client",
    lesson: "1.2",
    kind: "factor",
    card: {
      what: "החלק ממחיר הנכס שהלווים משלמים מהכסף שלהם.",
      role: "יחד עם ההלוואה, הוא משלם את מחיר הנכס.",
      note: "שיעור 1.2.",
    },
  },
  {
    id: "value",
    label: "שווי הנכס",
    region: "property",
    lesson: "1.2",
    kind: "factor",
    card: {
      what: "כמה הנכס שווה.",
      role: "הבנק בודק אותו לפני שהוא מלווה. השמאי הוא מי שמעריך אותו בשביל הבנק. לפי מקור משני (לא נבדק מול נוסח ההוראה), שיעור המימון נמדד מול הנמוך מבין המחיר וההערכה של השמאי (שיעור 1.2).",
      note: "שיעור 1.2.",
    },
  },
  {
    id: "mix",
    label: "תמהיל",
    region: "mix",
    lesson: "1.4",
    kind: "factor",
    card: {
      what: "החלוקה של המשכנתא לכמה מסלולים, כל אחד עם ריבית ותקופה משלו.",
      role: "הלווים בוחרים אותו, בדרך כלל עם היועץ, והבנק מציע ריבית לכל מסלול.",
      note: "שיעור 1.4.",
    },
  },
];

export const links: MapLink[] = [
  { from: "boi", to: "boi_rate", label: "קובע אותה", lesson: "1.6" },
  { from: "boi", to: "bank", label: "מפקח עליו וקובע לו כללים", lesson: "1.6" },
  { from: "cost_of_money", to: "bank", label: "הבסיס לריבית שהבנק גובה", lesson: "1.6" },
  { from: "borrowers", to: "advisor", label: "שוכרים אותו, וחותמים לו על כתב הרשאה", lesson: "1.6" },
  { from: "advisor", to: "bank", label: "פונה לבנק בשם הלווים ומנהל משא ומתן", lesson: "1.6" },
  { from: "borrowers", to: "bank", label: "מבקשים הלוואה, חותמים, ונותנים לבנק ייפוי כוח לרישום השעבוד", lesson: "1.6" },
  { from: "borrowers", to: "seller", label: "קונים ממנו את הנכס", lesson: "1.6" },
  { from: "borrowers", to: "lawyer", label: "שוכרים אותו לעסקה", lesson: "1.6" },
  { from: "lawyer", to: "registry", label: "בודק מה רשום על הנכס, ודואג להערות אזהרה", lesson: "1.6" },
  { from: "seller", to: "registry", label: "רשום שם כבעלים עד שהבעלות עוברת", lesson: "1.6" },
  { from: "bank", to: "appraiser", label: "נותן רשימת שמאים", lesson: "1.6" },
  { from: "borrowers", to: "appraiser", label: "מזמינים אותו (או שהיועץ מזמין) ומשלמים לו", lesson: "1.6" },
  { from: "appraiser", to: "bank", label: "שולח את הדוח ישירות לבנק", lesson: "1.6" },
  { from: "appraiser", to: "value", label: "מעריך אותו", lesson: "1.6" },
  { from: "value", to: "bank", label: "הבנק בודק אותו לפני שהוא מלווה", lesson: "1.6" },
  { from: "borrowers", to: "insurer", label: "קונים ממנו את הביטוח, בבנק או מחוצה לו", lesson: "1.6" },
  { from: "insurer", to: "bank", label: "הבנק מקבל את הכסף מהביטוח אם קורה משהו", lesson: "1.6" },
  { from: "bank", to: "seller", label: "מעביר אליו את כסף ההלוואה", lesson: "1.6" },
  { from: "bank", to: "registry", label: "השעבוד לטובתו נרשם שם", lesson: "1.6" },
  { from: "borrowers", to: "equity", label: "מביאים אותו", lesson: "1.6" },
  { from: "equity", to: "seller", label: "חלק מהמחיר", lesson: "1.6" },
  { from: "borrowers", to: "mix", label: "בוחרים אותו, בדרך כלל עם היועץ", lesson: "1.6" },
  { from: "bank", to: "mix", label: "מציע ריבית לכל מסלול", lesson: "1.6" },
];
