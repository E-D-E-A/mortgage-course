<script setup lang="ts">
// Workshop 3.12, part 3: does the learner's spreadsheet match the course's
// calculator? The learner types the loan their sheet was set to (the workshop's
// example by default) and four figures read off the sheet: month 1's payment,
// the last month's payment, the total paid and the total interest. The page
// computes the same four figures with the course's calculator
// (amortization.ts, annuityStatement: the statement convention) and compares.
// When they differ, it checks the three usual home-made rounding conventions
// (workshop.ts sheetFigures) and names the one the sheet followed, so a
// difference of agorot is explained rather than called wrong.
// Kept in this browser through progress.ts; a print view prints the comparison
// (the same print marking as DiyChecklist and DealMap).
import Decimal from "decimal.js";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { annuityStatement } from "../lib/calc/amortization.ts";
import { formatShekels } from "../lib/calc/money.ts";
import { type SheetConvention, sheetFigures } from "../lib/calc/workshop.ts";
import { load, parseAnswer, save } from "../lib/progress.ts";

const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    /** The example the sheet is set to: shekels, annual percent, months. */
    principal: string;
    annualPercent: string;
    months: number;
    printNote?: string;
  }>(),
  { printNote: undefined },
);

type Figure = "regular" | "last" | "totalPaid" | "totalInterest";
const FIGURES: { key: Figure; label: string; where: string }[] = [
  { key: "regular", label: "ההחזר בחודש 1", where: "בתבנית: התא B11" },
  { key: "last", label: "ההחזר בחודש האחרון", where: "בתבנית: התא B13" },
  { key: "totalPaid", label: "סך התשלומים", where: "בתבנית: התא B14" },
  { key: "totalInterest", label: "סך הריבית", where: "בתבנית: התא B15" },
];

interface Saved {
  loan: { principal: string; rate: string; months: string };
  entered: Record<string, string>;
}
const storageKey = `sheet-match:${props.id}`;
const loan = reactive({ principal: props.principal, rate: props.annualPercent, months: String(props.months) });
const entered = reactive<Record<string, string>>({});
const checked = ref(false);
const printView = ref(false);
const printing = ref(false);

onMounted(() => {
  const saved = load<Saved>(storageKey);
  if (saved) {
    Object.assign(loan, saved.loan ?? {});
    Object.assign(entered, saved.entered ?? {});
    checked.value = FIGURES.some((f) => entered[f.key]);
  }
  window.addEventListener("afterprint", endPrint);
});
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));
function persist() {
  save(storageKey, { loan: { ...loan }, entered: { ...entered } } satisfies Saved);
}

const parsed = computed(() => {
  const p = parseAnswer(loan.principal);
  const r = parseAnswer(loan.rate);
  const n = parseAnswer(loan.months);
  if (p === null || p <= 0) return { error: "סכום ההלוואה צריך להיות מספר חיובי, למשל 400000." };
  if (r === null || r < 0 || r > 50) return { error: "הריבית השנתית באחוזים, למשל 5.4." };
  if (n === null || !Number.isInteger(n) || n < 1 || n > 600) return { error: "מספר החודשים: מספר שלם בין 1 ל־600." };
  return { p: String(p), r: String(r), n };
});

/** The course's four figures, straight from the calculator's statement schedule. */
const course = computed(() => {
  const x = parsed.value;
  if ("error" in x) return null;
  const rows = annuityStatement(x.p, x.r, x.n);
  return {
    regular: rows[0].payment,
    last: rows[rows.length - 1].payment,
    totalPaid: rows.reduce((s, row) => s.plus(row.payment), new Decimal(0)),
    totalInterest: rows.reduce((s, row) => s.plus(row.interest), new Decimal(0)),
  } as Record<Figure, Decimal>;
});
const variants = computed(() => {
  const x = parsed.value;
  if ("error" in x) return null;
  const of = (c: SheetConvention) => sheetFigures(x.p, x.r, x.n, c);
  return { exact: of("exact"), payment_unrounded: of("payment_unrounded"), no_last_adjust: of("no_last_adjust") };
});

const value = (f: Figure) => parseAnswer(entered[f] ?? "");
const filled = computed(() => FIGURES.filter((f) => value(f.key) !== null));
/** Typed, but not a number ("abc", "12abc"): named, never silently skipped. */
const unreadable = computed(() => FIGURES.filter((f) => (entered[f.key] ?? "").trim() !== "" && value(f.key) === null));
// A sheet shows two decimals: equal to the agora means within half an agora.
const agoraEqual = (a: number, b: Decimal.Value) => Math.abs(a - new Decimal(b).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()) < 0.005;
const diffOf = (f: Figure) => {
  const v = value(f);
  const c = course.value;
  return v === null || !c ? null : new Decimal(v).minus(c[f].toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
};

type Variant = "exact" | "payment_unrounded" | "no_last_adjust";
/** Short names, as in the lesson's callout of four sheets. */
const VARIANT_NAME: Record<Variant | "course", string> = {
  course: "כמו המחשבון של הקורס",
  exact: "בלי ROUND בכלל",
  payment_unrounded: "ROUND על הריבית, לא על ההחזר",
  no_last_adjust: "גם החודש האחרון משלם את ההחזר הרגיל",
};
const VARIANT_TEXT: Record<Variant, string> = {
  exact:
    "הגיליון שלכם בלי ROUND בכלל: ההחזר הוא התוצאה המדויקת של PMT, והריבית לא מעוגלת. כל המספרים נכונים — לפי מוסכמה אחרת. המחשבון של הקורס מעגל את ההחזר ואת הריבית של כל חודש לאגורה, ולכן הסכומים נבדלים באגורות. להתאמה: ⁦ROUND(…,2)⁩ על ההחזר ועל הריבית, והחודש האחרון סוגר את היתרה.",
  payment_unrounded:
    "הריבית בגיליון שלכם מעוגלת, אבל ההחזר לא: בתא ההחזר כתוב ⁦-PMT(…)⁩ בלי ROUND. ההחזר המדויק נמוך או גבוה מהמעוגל בשבריר אגורה, ובכל חודש קצת אחרת חוזר לקרן — ולכן הריבית של החודשים הבאים זזה באגורות. להתאמה: ⁦ROUND(-PMT(…),2)⁩.",
  no_last_adjust:
    "בגיליון שלכם גם החודש האחרון משלם את ההחזר הרגיל. העיגולים של כל החודשים מצטברים, ולכן היתרה בסוף לא יוצאת אפס בדיוק — נשארות כמה אגורות, או שמשלמים יותר מדי. במחשבון של הקורס החודש האחרון משלם את מה שנשאר ועוד הריבית: בעמודת ההחזר, בשורה האחרונה, היתרה בתחילת החודש ועוד הריבית.",
};

const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ו${xs[xs.length - 1]}`);
const verdict = computed(() => {
  const c = course.value;
  if (!c || filled.value.length === 0) return null;
  const fits = (figs: Record<Figure, Decimal.Value>) => filled.value.every((f) => agoraEqual(value(f.key) as number, figs[f.key]));
  const v = variants.value;
  // Every convention the figures typed so far fit. With some figures missing, several can fit at once
  // (in the workshop's loan the regular payment is the same under all four), and naming the first
  // would be a confident wrong diagnosis.
  const matches: (Variant | "course")[] = [
    ...(fits(c) ? (["course"] as const) : []),
    ...(v ? (["exact", "payment_unrounded", "no_last_adjust"] as const).filter((name) => fits(v[name])) : []),
  ];
  const partial = filled.value.length < FIGURES.length;
  if (matches.length > 1 && partial) {
    const left = FIGURES.filter((f) => !filled.value.includes(f)).map((f) => f.label);
    return {
      tone: "unsure" as const,
      text: `המספרים שמילאתם מתאימים ליותר ממוסכמה אחת: ${join(matches.map((m) => `״${VARIANT_NAME[m]}״`))}. מלאו גם את ${join(left)}, ואז אפשר יהיה לדעת איזו מהן בגיליון שלכם.`,
    };
  }
  if (matches[0] === "course") return { tone: "ok" as const, text: "" };
  if (matches.length > 1)
    return {
      tone: "unsure" as const,
      text: `בהלוואה הזו כמה מוסכמות נותנות את אותם ארבעה מספרים: ${join(matches.map((m) => `״${VARIANT_NAME[m]}״`))}. אפשר להבחין ביניהן בהלוואה אחרת, גדולה וארוכה יותר.`,
    };
  if (matches.length === 1) return { tone: "rounding" as const, text: VARIANT_TEXT[matches[0] as Variant] };
  const small = filled.value.every((f) => (diffOf(f.key) as Decimal).abs().lte(5));
  if (small)
    return {
      tone: "rounding" as const,
      text: "ההפרשים הם אגורות או שקלים בודדים — כמעט בטוח עיגול, לא נוסחה שגויה. בדקו שלושה דברים: ⁦ROUND(…,2)⁩ על ההחזר, ⁦ROUND(…,2)⁩ על הריבית בכל שורה, ושבחודש האחרון ההחזר הוא היתרה בתחילת החודש ועוד הריבית.",
    };
  return {
    tone: "bad" as const,
    text: "ההפרש גדול מעיגול: משהו בנוסחאות שונה. בדקו את הריבית החודשית (הריבית השנתית חלקי 12), את הסימן של PMT, שהיתרה בתחילת כל חודש היא היתרה בסוף החודש הקודם, ושהקלט בגיליון זהה לקלט כאן.",
  };
});

function check() {
  checked.value = true;
  persist();
}
/** The loan as the sheet holds it, formatted like every other amount when it reads as numbers. */
const loanShown = computed(() => {
  const x = parsed.value;
  if ("error" in x) return { principal: `${loan.principal} ₪`, rate: `${loan.rate}%`, months: loan.months };
  return { principal: formatShekels(x.p), rate: `${x.r}%`, months: String(x.n) };
});
function onEntered(f: Figure, text: string) {
  entered[f] = text;
  persist();
}
function onLoan(field: "principal" | "rate" | "months", text: string) {
  loan[field] = text;
  persist();
}
function resetLoan() {
  loan.principal = props.principal;
  loan.rate = props.annualPercent;
  loan.months = String(props.months);
  persist();
}

async function printNow() {
  checked.value = true;
  printView.value = true;
  printing.value = true;
  document.documentElement.classList.add("diy-printing");
  await nextTick();
  window.print();
}
function endPrint() {
  printing.value = false;
  document.documentElement.classList.remove("diy-printing");
}

const fmt = (d: Decimal.Value) => formatShekels(d);
function gapText(f: Figure): string {
  const d = diffOf(f);
  if (d === null) return "—";
  const r = d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  if (r.isZero()) return "אין";
  const ag = r.abs().mul(100).toNumber();
  const size = r.abs().lt(1) ? (ag === 1 ? "אגורה אחת" : `${ag} אגורות`) : fmt(r.abs());
  return r.isPositive() ? `${size} יותר` : `${size} פחות`;
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" data-diy-block :data-diy-print="printing ? 'active' : null">
    <p class="text-body-l font-semibold text-n900">{{ title }}</p>
    <div class="diy-no-print mt-2 flex flex-wrap gap-x-4 gap-y-1">
      <button type="button" class="min-h-11 min-w-11 text-body-m text-navy underline" :aria-pressed="printView" @click="printView = !printView">
        {{ printView ? "חזרה להשוואה" : "תצוגה להדפסה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
    </div>
    <p class="diy-no-print mt-1 text-caption text-n600">מה שתכתבו נשמר בדפדפן הזה בלבד.</p>

    <div v-if="printView" class="mt-4 text-body-m text-n800">
      <p v-if="printNote" class="rounded-md border border-n200 p-3 text-caption text-n700">{{ printNote }}</p>
      <p class="mt-3">
        ההלוואה בגיליון: <span class="ltr font-semibold">{{ loanShown.principal }}</span>, <span class="ltr font-semibold">{{ loanShown.rate }}</span> לשנה,
        <span class="ltr font-semibold">{{ loanShown.months }}</span> חודשים.
      </p>
    </div>

    <!-- A form, so Enter in any field compares. -->
    <form v-else class="mt-4" novalidate @submit.prevent="check">
      <p class="text-body-m font-semibold text-n900">ההלוואה שבגיליון</p>
      <div class="mt-2 grid grid-cols-3 gap-2">
        <div class="min-w-0">
          <label :for="`sm-${id}-p`" class="block text-caption text-n700">סכום (₪)</label>
          <input :id="`sm-${id}-p`" :value="loan.principal" inputmode="decimal" dir="ltr" autocomplete="off" class="h-11 w-full rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @input="onLoan('principal', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="min-w-0">
          <label :for="`sm-${id}-r`" class="block text-caption text-n700">ריבית שנתית (%)</label>
          <input :id="`sm-${id}-r`" :value="loan.rate" inputmode="decimal" dir="ltr" autocomplete="off" class="h-11 w-full rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @input="onLoan('rate', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="min-w-0">
          <label :for="`sm-${id}-n`" class="block text-caption text-n700">חודשים</label>
          <input :id="`sm-${id}-n`" :value="loan.months" inputmode="numeric" dir="ltr" autocomplete="off" class="h-11 w-full rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @input="onLoan('months', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="resetLoan">חזרה להלוואה של הסדנה</button>
      <p v-if="'error' in parsed" class="mt-2 rounded-md bg-warning-bg p-3 text-body-m text-n800">{{ parsed.error }}</p>

      <p class="mt-4 text-body-m font-semibold text-n900">מה הגיליון שלכם מראה</p>
      <ul class="list-reset mt-2 grid gap-2 sm:grid-cols-2">
        <li v-for="f in FIGURES" :key="f.key" class="min-w-0">
          <label :for="`sm-${id}-${f.key}`" class="block text-caption text-n700">{{ f.label }} <span class="text-n600">({{ f.where }})</span></label>
          <input
            :id="`sm-${id}-${f.key}`"
            :value="entered[f.key] ?? ''"
            inputmode="decimal"
            dir="ltr"
            autocomplete="off"
            class="h-11 w-full rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
            @input="onEntered(f.key, ($event.target as HTMLInputElement).value)"
          />
        </li>
      </ul>
      <button
        type="submit"
        class="diy-no-print mt-3 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
      >
        השוואה למחשבון של הקורס
      </button>
      <p v-if="checked && (unreadable.length || !filled.length)" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800" aria-live="polite">
        <template v-if="unreadable.length">
          לא הצלחנו לקרוא מספר ב{{ join(unreadable.map((f) => `״${f.label}״`)) }}. כתבו רק ספרות, כמו שהן בגיליון, למשל 3247.15 או 3,247.15.
        </template>
        <template v-else>עוד לא כתבתם מספר. העתיקו מהגיליון לפחות את ההחזר בחודש 1, ולחצו שוב.</template>
      </p>
    </form>

    <template v-if="checked && course && filled.length">
      <div class="mt-4 overflow-x-auto">
        <table class="w-full border-collapse text-caption sm:text-body-m">
          <thead>
            <tr class="border-b border-n200 text-n600">
              <th class="py-2 pe-2 text-start font-semibold">מה</th>
              <th class="py-2 pe-2 text-start font-semibold">בגיליון שלכם</th>
              <th class="py-2 pe-2 text-start font-semibold">המחשבון של הקורס</th>
              <th class="py-2 pe-2 text-start font-semibold">הפרש</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in FIGURES" :key="f.key" class="border-b border-n100">
              <td class="py-2 pe-2 text-n800">{{ f.label }}</td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap text-n900">{{ value(f.key) === null ? "—" : fmt(value(f.key) as number) }}</span></td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap font-semibold text-n900">{{ fmt(course[f.key]) }}</span></td>
              <td class="py-2 pe-2 text-n800">{{ gapText(f.key) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="verdict?.tone === 'ok'" class="mt-3 rounded-md bg-success-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">תואם עד האגורה.</strong> הגיליון שלכם מחשב בדיוק כמו המחשבון של הקורס: אותה ריבית חודשית, אותו עיגול, ואותו חודש אחרון.
        <template v-if="filled.length < FIGURES.length"> (בדקנו {{ filled.length }} מתוך {{ FIGURES.length }} המספרים; מלאו את כולם לבדיקה מלאה.)</template>
      </p>
      <p v-else-if="verdict?.tone === 'unsure'" class="mt-3 rounded-md bg-info-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">עוד אי אפשר לדעת.</strong> {{ verdict.text }}
      </p>
      <p v-else-if="verdict?.tone === 'rounding'" class="mt-3 rounded-md bg-info-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">ההפרש הוא עיגול.</strong> {{ verdict.text }}
      </p>
      <p v-else-if="verdict" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800" aria-live="polite">{{ verdict.text }}</p>
    </template>
  </div>
</template>

<style>
/* The same print marking as DiyChecklist: print only the block whose print button was pressed. */
@media print {
  html.diy-printing body *:not([data-diy-print="active"]):not(:has([data-diy-print="active"])):not([data-diy-print="active"] *) {
    display: none !important;
  }
  html.diy-printing [data-diy-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  .diy-no-print {
    display: none !important;
  }
}
</style>
