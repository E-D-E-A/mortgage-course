<script setup lang="ts">
// Lessons 5.1–5.3: the example pre-approval of "בנק א׳" — a FICTIONAL document made
// for the course. The page passes every number (from the lesson's facts, which
// come from offers.ts); the component only lays the document out and, for each
// line the learner opens, says what it is, whether the directive requires it
// (as the team transcribed it, not checked against the directive) and what
// still has to happen before the money is paid out.
// The explanations are the course's words about a made-up document; every claim in
// them is labelled where the lesson cites it (the Sources block of 5.1).
import { computed, ref } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

interface TrackLine {
  kindHe: string;
  amount: string;
  months: number;
  /** A fixed track: the contract rate. A variable track: the rate on the day the document was issued. */
  rate: string;
  variable: boolean;
  /** A linked track: the balance and the payment move with the index. */
  linked: boolean;
  first: string;
}
interface Doc {
  bank: string;
  issued: string;
  validUntil: string;
  validDays: number;
  validDaysNoLien: number;
  applicants: string;
  value: string;
  loan: string;
  basketName: string;
  tracks: TrackLine[];
  first: string;
  highest: string;
  highestMonth: number;
  total: string;
  rate: string;
  upfront: string;
}
const props = defineProps<{ doc: Doc; label: string; forecastLabel: string }>();

type Tag = "directive" | "extra";
interface Line {
  id: string;
  title: string;
  tag: Tag;
  what: string;
  rule: string;
  next: string;
}

const lines = computed<Line[]>(() => [
  {
    id: "who",
    title: "מי ומה מבקשים",
    tag: "extra",
    what: `${props.doc.applicants}; שווי הנכס שהם מסרו ${formatWholeShekels(props.doc.value)}; סכום הבקשה ${formatWholeShekels(props.doc.loan)}.`,
    rule: "ההוראה, כפי שהצוות תעתק אותה, לא מונה את הפרטים האלה בין מה שהאישור חייב להציג. הם כאן כי בלעדיהם אי אפשר לדעת על מה המחיר ניתן.",
    next: "אלה פרטים שהלווים מסרו. הבנק עוד לא בדק אותם: הבדיקה היא החיתום, אחרי שנמסרים מסמכים.",
  },
  {
    id: "valid",
    title: "תוקף",
    tag: "directive",
    what: `ניתן ב־${props.doc.issued}. הבנק מחזיק בתנאים לפחות ${props.doc.validDays} ימים, כלומר עד ${props.doc.validUntil} לפחות.`,
    rule: `לפי תעתיק של הצוות: לפחות ${props.doc.validDays} ימים, ו־${props.doc.validDaysNoLien} ימים כשלא נרשם שעבוד חדש, ורשום באופן בולט (שיעור 1.8). ימים רגילים, לא ימי עסקים.`,
    next: "אחרי החלון הבנק כבר לא חייב לתנאים. מה שעוד צריך לקרות עד ההעמדה מופיע בשורה האחרונה.",
  },
  ...props.doc.tracks.map((t, k) => ({
    id: `track${k}`,
    title: `מסלול ${k + 1}: ${t.kindHe}`,
    tag: "directive" as Tag,
    what: t.variable
      ? `${formatWholeShekels(t.amount)} ל־${t.months / 12} שנה. ריבית ${Number(t.rate).toFixed(2)}% — נכונה ליום שבו האישור ניתן. התשלום הראשון במסלול: ${formatShekels(t.first)}.`
      : `${formatWholeShekels(t.amount)} ל־${t.months / 12} שנה. ריבית ${Number(t.rate).toFixed(2)}% קבועה, לפי החוזה. התשלום הראשון במסלול: ${formatShekels(t.first)}.`,
    rule: t.variable
      ? "לפי התעתיק: במסלול משתנה האישור מציג את הריבית שנובעת מכללי העדכון, ומציין שהיא נכונה ליום שהאישור ניתן."
      : "לפי התעתיק: במסלול קבוע האישור מציג את הריבית שנקבעה בחוזה.",
    next: t.variable
      ? "הריבית ביום האישור אינה הריבית בעוד חמש שנים. מה שיהיה אחר כך הוא תחזית, וההחזר המרבי החזוי למטה נשען עליה."
      : t.linked
        ? "הריבית נקבעת בחוזה ולא תשתנה, אבל היתרה והתשלום עולים עם המדד (שיעורים 2.3 ו־3.5). לכן ההחזר המרבי החזוי נשען גם על תחזית מדד."
        : "הריבית נקבעת בחוזה ולא תשתנה, וגם התשלום במסלול לא צמוד נשאר אותו תשלום (שפיצר).",
  })),
  {
    id: "first",
    title: "ההחזר החודשי הראשון",
    tag: "directive",
    what: `${formatShekels(props.doc.first)}: סכום התשלומים של שלושת המסלולים בחודש הראשון.`,
    rule: "לפי התעתיק: האישור מציג את ההחזר החודשי הראשון (3.8).",
    next: "זה התשלום שמתחילים איתו. הוא לא אומר מה יהיה בשנה העשירית.",
  },
  {
    id: "highest",
    title: "ההחזר החודשי הגבוה ביותר הצפוי",
    tag: "directive",
    what: `${formatShekels(props.doc.highest)}, בחודש ${props.doc.highestMonth}, לפי התחזית (${props.forecastLabel}).`,
    rule: "לפי התעתיק: האישור מציג את ההחזר החודשי הגבוה ביותר הצפוי לפי התחזיות. זו תחזית, לא תקרה (3.8).",
    next: "הבנק לא מתחייב שההחזר לא יעלה על המספר הזה: הוא מראה את החודש הגבוה ביותר בתחזית אחת.",
  },
  {
    id: "total",
    title: "סך התשלומים הצפוי",
    tag: "directive",
    what: `${formatShekels(props.doc.total)}: סכום כל התשלומים החזויים עד סוף ההלוואה.`,
    rule: "לפי התעתיק: האישור מציג את הסכום הכולל הצפוי להיות משולם לאורך כל התקופה, שהוא סכום כל התשלומים החזויים (3.9).",
    next: "הסכום מחבר שקלים מזמנים שונים (שיעור 3.9). הוא לא אומר כמה ההלוואה שווה לכם היום.",
  },
  {
    id: "rate",
    title: "הריבית הכוללת החזויה",
    tag: "directive",
    what: `${props.doc.rate}% לשנה: העלות הממשית של האשראי (3.10), מחושבת על התשלומים החזויים ועל מה שקיבלתם.`,
    rule: "לפי התעתיק: האישור מציג את העלות הממשית של האשראי לפי נספח 4, ומחשבים אותה לפי תחזית שבנק ישראל מפרסם.",
    next: "גם היא חזויה. שני הלוחות שמאחורי שני מספרים כאלה אפשר להשוות רק על אותו בסיס (שיעור 5.3).",
  },
  {
    id: "upfront",
    title: "עמלות שנגבות ביום ההעמדה",
    tag: "extra",
    what: `עמלת פתיחת תיק: ${formatShekels(props.doc.upfront)}, תיגבה ביום שהכסף מועבר.`,
    rule: "אילו עמלות נכנסות לחישוב הריבית הכוללת החזויה — שאלה משפטית שהצוות סימן כפתוחה. בחישוב שלפניכם העמלה הזו נחשבת, כהנחת חישוב. העמלה עצמה והסכום שלה הם המצאה של הקורס.",
    next: "בדוגמה כאן העמלה נגבית ביום שהכסף מועבר: זו הנחה של הקורס. מתי בנק אמיתי גובה עמלה כזו, ומה קורה אם ההלוואה לא נפתחת — לא ידוע לנו; שאלה לאילון.",
  },
  {
    id: "early",
    title: "עמלות פירעון מוקדם",
    tag: "directive",
    what: "מפנה לצו משנת 2002. לא מחושבות כאן.",
    rule: "לפי התעתיק: האישור מפנה לעמלות הפירעון המוקדם לפי הצו משנת 2002.",
    next: "העמלה תלויה במתי תחזרו ובריבית באותו יום. את זה נלמד בשלב 7.",
  },
  {
    id: "noforecast",
    title: "מסלול בלי תחזית",
    tag: "directive",
    what: "בהצעה הזו לכל המסלולים יש תחזית, ולכן אין כאן הודעה.",
    rule: "לפי התעתיק: כשלמסלול אין תחזית, האישור אומר בבירור שהעלות הממשית לא כוללת אותו.",
    next: "למשל מסלול במט״ח (שיעור 2.8): בלי תחזית אין עלות ממשית שלמה.",
  },
  {
    id: "after",
    title: "מה צריך להשלים",
    tag: "extra",
    what: "רשימת מסמכים ורשימת שמאים לפי אזור הנכס (בדוגמה: הנחה של הקורס).",
    rule: "רשימת השמאים: לפי התעתיק, חלק מהאישור (סעיף 4ג(ג)(2)). רשימה כזו מגיעה עם האישור לפי מחקר הצוות, ומה ברשימת המסמכים הבנק קובע. הרשימות בדוגמה הן הנחה של הקורס.",
    next: "שמאות, מסמכים, חיתום, חתימה, רישום הערת אזהרה, ואז העמדה. עד אז ההצעה היא מחיר על נתונים שלא נבדקו.",
  },
]);

const selected = ref("highest");
const emphasise = ref(false);
const showTable = ref(false);
const tagText = (t: Tag) => (t === "directive" ? "ההוראה מחייבת להציג (לפי התעתיק)" : "הבנק מוסיף");
const lineClass = (l: Line) => [
  "block w-full min-h-11 rounded-sm px-2 py-2 text-start text-body-m",
  selected.value === l.id ? "ring-2 ring-navy" : "hover:bg-n100",
  emphasise.value && l.tag === "directive" ? "bg-mint" : "",
];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="rounded-md border border-dashed border-n300 bg-n50 p-3 sm:p-4" role="group" :aria-label="`אישור עקרוני לדוגמה של ${doc.bank}`">
      <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-n200 pb-2">
        <p class="text-body-l font-semibold text-n900">{{ doc.bank }} · אישור עקרוני להלוואה לדיור</p>
        <p class="text-caption font-semibold text-n700">מסמך לדוגמה</p>
      </div>
      <p class="mt-2 text-caption text-n700">{{ label }}</p>

      <ul class="list-reset mt-3 grid gap-1">
        <li v-for="l in lines" :key="l.id">
          <button type="button" :class="lineClass(l)" :aria-pressed="selected === l.id" @click="selected = l.id">
            <span class="block text-caption font-semibold text-n600">{{ l.title }}</span>
            <span class="block text-body-m text-n900">{{ l.what }}</span>
          </button>
          <div v-if="selected === l.id" class="mx-2 mb-2 mt-1 rounded-md bg-n0 p-3 text-body-m text-n800" role="status" aria-live="polite">
            <p class="text-caption font-semibold text-n600">{{ tagText(l.tag) }}</p>
            <p class="mt-1"><strong class="text-n900">מה כתוב בהוראה:</strong> {{ l.rule }}</p>
            <p class="mt-1"><strong class="text-n900">מה זה אומר:</strong> {{ l.next }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="min-h-11 rounded-md border border-n200 px-3 text-body-m"
        :class="emphasise ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="emphasise"
        @click="emphasise = !emphasise"
      >
        הדגשת מה שההוראה מחייבת להציג
      </button>
      <span v-if="emphasise" class="flex items-center gap-2 text-caption text-n700"><span class="inline-block h-3 w-3 rounded-sm bg-mint ring-1 ring-n300"></span>חובה להציג, לפי התעתיק</span>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">השורה</th>
            <th class="py-2 pe-3 text-start">מי קובע</th>
            <th class="py-2 pe-3 text-start">מה כתוב</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in lines" :key="l.id" class="border-b border-n100 align-top">
            <td class="py-1 pe-3 font-semibold text-n900">{{ l.title }}</td>
            <td class="py-1 pe-3">{{ tagText(l.tag) }}</td>
            <td class="py-1 pe-3">{{ l.what }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
