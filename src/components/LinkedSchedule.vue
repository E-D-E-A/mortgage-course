<script setup lang="ts">
// "לוח צמוד מול לא צמוד" — lesson 3.5 (and the brief's "השפעת אינפלציה ומדד", month by month).
// One loan, two schedules at the same rate: linked to the index, and not linked. The learner
// moves the index (a yearly rise, at an even pace inside the year) and picks a month; each
// card shows that month's row: the balance, what the index added (הפרשי הצמדה), the interest,
// the payment, the part that lowered the debt, and the balance after. The charts show the
// payment and the balance over the whole term.
// Every number comes from src/lib/calc/schedule.ts, in its statement rounding (every row in
// agorot, as in the lesson's tables); nothing is computed here but scaling.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { pathInputs, type ScheduleRow, scheduleFromInputs, scheduleTotals } from "../lib/calc/schedule.ts";

const props = withDefaults(
  defineProps<{
    amount?: number;
    years?: number;
    /** The annual rate of both tracks, in percent. */
    rate?: string;
    /** The index's rise in percent a year, at the start. */
    inflation?: number;
    /** The month shown in the cards, at the start. */
    month?: number;
  }>(),
  { amount: 400000, years: 20, rate: "3", inflation: 2, month: 1 },
);

const months = props.years * 12;
const inflation = ref(props.inflation);
const month = ref(props.month);
const showTable = ref(false);

// A real minus sign, not a hyphen, when the index falls.
const pct = (v: Decimal.Value) => `${new Decimal(v).toDecimalPlaces(2).toString().replace("-", "−")}%`;
const names = [`צמוד למדד, ${pct(props.rate)}`, `לא צמוד, ${pct(props.rate)}`];
const colours = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)"];

const series = computed<ScheduleRow[][]>(() => [
  scheduleFromInputs(pathInputs({ principal: props.amount, months, rate: props.rate, inflation: [inflation.value], rounding: "statement" })),
  scheduleFromInputs(pathInputs({ principal: props.amount, months, rate: props.rate, rounding: "statement" })),
]);
const row = computed(() => series.value.map((s) => s[month.value - 1]));
const addedSoFar = computed(() => scheduleTotals(series.value[0], month.value).indexation);

// Signed money for "what the index added": a real minus when the index fell.
const signed = (v: Decimal) => (v.isNeg() ? `−${formatShekels(v.abs())}` : formatShekels(v));
// What the sentence under the cards says: the index rose, fell, or did not move; and whether payments are left.
const addedKind = computed(() => (addedSoFar.value.isZero() ? "none" : addedSoFar.value.isNeg() ? "fell" : "rose"));

const W = 640;
const H = 170;
const PAD = { top: 12, bottom: 8, side: 10 };
const x = (m: number) => W - PAD.side - (m / months) * (W - 2 * PAD.side);
function chart(value: (s: number, m: number) => Decimal, from: number) {
  const pts = [0, 1].map((s) => Array.from({ length: months - from + 1 }, (_, i) => value(s, i + from).toNumber()));
  const max = Math.max(...pts.flat()) * 1.08 || 1;
  const y = (v: number) => H - PAD.bottom - (Math.max(v, 0) / max) * (H - PAD.top - PAD.bottom);
  return {
    lines: pts.map((p) => p.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + from).toFixed(1)},${y(v).toFixed(1)}`).join(" ")),
    base: y(0),
  };
}
const paymentChart = computed(() => chart((s, m) => series.value[s][m - 1].payment, 1));
const balanceChart = computed(() => chart((s, m) => (m === 0 ? new Decimal(props.amount) : series.value[s][m - 1].closing), 0));
const marker = computed(() => x(month.value));
const ticks = Array.from({ length: Math.floor(props.years / 5) + 1 }, (_, i) => i * 5);

const yearOf = (m: number) => Math.ceil(m / 12);
const monthInYear = (m: number) => ((m - 1) % 12) + 1;

const yearRows = computed(() =>
  Array.from({ length: props.years }, (_, k) => {
    const end = (k + 1) * 12;
    const added = scheduleTotals(series.value[0], end).indexation.minus(scheduleTotals(series.value[0], end - 12).indexation);
    return { year: k + 1, pay: series.value.map((s) => s[end - 1].payment), bal: series.value.map((s) => s[end - 1].closing), added };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      תרחיש להמחשה, לא מה שצפוי לקרות. הלוואה של <span class="ltr">{{ formatWholeShekels(amount) }}</span> ל־{{ years }} שנה, באותו אחוז ריבית, בתשלומים
      חודשיים שווים (שפיצר). המדד עולה באופן אחיד: באותו אחוז בכל חודש (השורש ה־12, שיעור 0.4), כך שאחרי 12 חודשים הוא עלה
      בדיוק באחוז שבחרתם. כל שורה מעוגלת לאגורה, כמו בלוח של בנק.
    </p>

    <label class="mt-4 flex flex-col">
      <span class="text-body-m font-semibold text-n900">כמה עולה המדד בשנה: <span class="ltr">{{ pct(inflation) }}</span></span>
      <input v-model.number="inflation" type="range" min="-1" max="6" step="0.5" aria-label="כמה עולה המדד בשנה" />
    </label>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li v-for="(n, i) in names" :key="i" class="flex items-center gap-2">
        <span class="inline-block h-1 w-5 rounded-sm" :style="{ background: colours[i] }"></span>{{ n }}
      </li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>החודש שבחרתם</li>
    </ul>

    <div class="mt-3 grid gap-4 lg:grid-cols-2">
      <figure>
        <figcaption class="text-caption font-semibold text-n600">התשלום בכל חודש</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: התשלום בכל חודש, לאורך ${years} שנה, צמוד ולא צמוד`">
          <line :x1="PAD.side" :x2="W - PAD.side" :y1="paymentChart.base" :y2="paymentChart.base" stroke="var(--mogi-n300)" stroke-width="1" />
          <path v-for="i in [1, 0]" :key="i" :d="paymentChart.lines[i]" fill="none" :stroke="colours[i]" :stroke-width="i === 0 ? 3 : 2" vector-effect="non-scaling-stroke" />
          <line :x1="marker" :x2="marker" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
        </svg>
        <div class="relative h-4 text-caption text-n600" aria-hidden="true">
          <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t * 12) / W) * 100}%` }">{{ t }}</span>
        </div>
      </figure>
      <figure>
        <figcaption class="text-caption font-semibold text-n600">היתרה בסוף כל חודש</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: היתרה לאורך ${years} שנה, צמוד ולא צמוד`">
          <line :x1="PAD.side" :x2="W - PAD.side" :y1="balanceChart.base" :y2="balanceChart.base" stroke="var(--mogi-n300)" stroke-width="1" />
          <path v-for="i in [1, 0]" :key="i" :d="balanceChart.lines[i]" fill="none" :stroke="colours[i]" :stroke-width="i === 0 ? 3 : 2" vector-effect="non-scaling-stroke" />
          <line :x1="marker" :x2="marker" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
        </svg>
        <div class="relative h-4 text-caption text-n600" aria-hidden="true">
          <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t * 12) / W) * 100}%` }">{{ t }}</span>
        </div>
      </figure>
    </div>
    <p class="mt-1 text-center text-caption text-n600">המספרים מתחת לגרפים: שנים מתחילת ההלוואה (מימין לשמאל)</p>

    <label class="mt-3 flex flex-col">
      <span class="text-body-m font-semibold text-n900">חודש {{ month }} (שנה {{ yearOf(month) }}, חודש {{ monthInYear(month) }} בה)</span>
      <input v-model.number="month" type="range" min="1" :max="months" step="1" aria-label="החודש שמוצג בכרטיסים" />
    </label>

    <div class="mt-2 grid gap-3 sm:grid-cols-2" role="status" aria-live="polite">
      <div v-for="(r, i) in row" :key="i" class="rounded-md bg-n50 p-3" :style="{ borderInlineStart: `4px solid ${colours[i]}` }">
        <p class="text-caption font-semibold text-n700">{{ names[i] }} · חודש {{ month }}</p>
        <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n800">
          <dt>היתרה בסוף החודש הקודם</dt>
          <dd class="ltr text-end">{{ formatShekels(month === 1 ? amount : series[i][month - 2].closing) }}</dd>
          <dt>ההצמדה הוסיפה החודש</dt>
          <dd class="ltr text-end">{{ signed(r.indexation) }}</dd>
          <dt>ריבית (על היתרה אחרי ההצמדה)</dt>
          <dd class="ltr text-end">{{ formatShekels(r.interest) }}</dd>
          <dt class="font-semibold text-n900">התשלום</dt>
          <dd class="ltr text-end font-semibold text-n900">{{ formatShekels(r.payment) }}</dd>
          <dt>מתוכו הוריד את החוב (רכיב קרן)</dt>
          <dd class="ltr text-end">{{ formatShekels(r.principalPaid) }}</dd>
          <dt class="font-semibold text-n900">היתרה בסוף החודש</dt>
          <dd class="ltr text-end font-semibold text-n900">{{ formatShekels(r.closing) }}</dd>
        </dl>
      </div>
    </div>
    <p class="mt-2 text-body-m text-n800">
      <template v-if="addedKind === 'none'">המדד לא זז, ולכן ההצמדה לא שינתה את החוב במסלול הצמוד.</template>
      <template v-else-if="addedKind === 'fell'">
        עד סוף חודש {{ month }} המדד ירד, וההצמדה הקטינה את החוב במסלול הצמוד ב־<span class="ltr font-semibold">{{ formatShekels(addedSoFar.abs()) }}</span>.
        {{ month < months ? "גם התשלומים שנשארו קטנים בהתאם." : "לכן גם התשלומים היו קטנים מהלוח המקורי." }}
      </template>
      <template v-else-if="month < months">
        עד סוף חודש {{ month }}, ההצמדה הוסיפה לחוב במסלול הצמוד <span class="ltr font-semibold">{{ formatShekels(addedSoFar) }}</span>. את הסכום הזה לא שילמתם
        בבת אחת: הוא נוסף ליתרה, ומשולם לאורך התשלומים שנשארו.
      </template>
      <template v-else>
        עד סוף ההלוואה, ההצמדה הוסיפה לחוב במסלול הצמוד <span class="ltr font-semibold">{{ formatShekels(addedSoFar) }}</span>. הסכום הזה לא שולם בבת אחת: הוא
        נוסף ליתרה, ושולם לאורך כל התשלומים.
      </template>
    </p>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-80 overflow-auto">
      <table class="w-full border-collapse text-caption sm:text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">שנה</th>
            <th class="py-2 pe-2 text-start">התשלום</th>
            <th class="py-2 pe-2 text-start">היתרה</th>
            <th class="py-2 text-start">ההצמדה הוסיפה בשנה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in yearRows" :key="r.year" class="border-b border-n100 align-top">
            <td class="py-1 pe-2">{{ r.year }}</td>
            <td class="py-1 pe-2">
              <span v-for="(v, i) in r.pay" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ names[i] }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
            <td class="py-1 pe-2">
              <span v-for="(v, i) in r.bal" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ names[i] }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
            <td class="py-1"><span class="ltr">{{ signed(r.added) }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">
        בכל תא, שורה לכל מסלול, בצבע שלו במקרא: {{ names[0] }} למעלה, {{ names[1] }} למטה. התשלום: בחודש האחרון של כל שנה. היתרה: בסוף השנה.
        העמודה האחרונה: כמה ההצמדה הוסיפה ליתרה של המסלול הצמוד באותה שנה.
      </p>
    </div>
  </div>
</template>
