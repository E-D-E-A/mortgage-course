<script setup lang="ts">
// "פריים זז באמצע הדרך" — lesson 3.6 (and the brief's "שינוי פריים ומדד לאורך זמן", second visit).
// One track; its anchor (prime, or a variable track's anchor) moves once, from a month the
// learner picks, by the points the learner picks. A prime track's rate moves at once; a variable
// track's waits for its next reset point. The card shows the moment the payment is recalculated:
// the balance left, the months left, the payment before and after, and — as a warning — what one
// formula over the whole loan would have said. The method switch shows that equal principal
// recalculates differently: its principal part does not move, only the interest.
// Every number comes from src/lib/calc/schedule.ts, in its statement rounding (every row in
// agorot, as in the lesson's tables); nothing is computed here but scaling.
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { DEFAULT_RESET_MONTHS, recalculatedPayment, type ScheduleMethod, type ScheduleRow, type TrackKind, trackSchedule } from "../lib/calc/schedule.ts";

const props = withDefaults(
  defineProps<{
    amount?: number;
    years?: number;
    /** The track's annual rate at the start, in percent. */
    rate?: string;
    /** "prime" or "variable_unlinked" at the start. */
    kind?: "prime" | "variable_unlinked";
    /** The first month at the new prime or anchor. */
    changeMonth?: number;
    /** By how many percentage points it moves. */
    change?: number;
    method?: ScheduleMethod;
  }>(),
  { amount: 500000, years: 20, rate: "4.8", kind: "prime", changeMonth: 37, change: 1.2, method: "spitzer" },
);

const months = props.years * 12;
const kind = ref<TrackKind>(props.kind);
const method = ref<ScheduleMethod>(props.method);
const changeMonth = ref(props.changeMonth);
const change = ref(props.change);
const showTable = ref(false);
// The rate cannot go below zero: the lowest change is minus the start rate (on the slider's 0.1 grid).
const minChange = Math.max(-2, -Math.floor(Number(props.rate) * 10) / 10);
watch(change, (c) => {
  if (c < minChange) change.value = minChange;
});

const pct = (v: Decimal.Value) => `${new Decimal(v).toDecimalPlaces(2).toString()}%`;
const unit = (v: number) => (Math.abs(v) <= 1 ? "נקודת אחוז" : "נקודות אחוז");
const points = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${new Decimal(Math.abs(v)).toString()}`;
const colours = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)"];

// The move: zero before changeMonth, `change` from it on (one value per month).
const shiftPath = computed(() => [...Array.from({ length: changeMonth.value - 1 }, () => "0"), String(change.value)]);
const track = computed(() => ({ kind: kind.value, amount: props.amount, rate: props.rate, months, method: method.value, resetMonths: DEFAULT_RESET_MONTHS, rounding: "statement" as const }));
const series = computed<ScheduleRow[][]>(() => {
  const moved = kind.value === "prime" ? { primeShift: shiftPath.value, blockMonths: 1 } : { anchorShift: shiftPath.value, blockMonths: 1 };
  return [trackSchedule(track.value, moved), trackSchedule(track.value)];
});
// Plain strings for screen readers; the legend draws the signed number in an LTR span (below).
const names = computed(() => [`עם השינוי (${points(change.value)} ${unit(change.value)} מחודש ${changeMonth.value})`, `בלי שינוי, ${pct(props.rate)} כל הדרך`]);
const anchorName = computed(() => (kind.value === "prime" ? "את הפריים" : "את העוגן"));

// The month the rate (and so the payment) first changes, or null when it never does.
const resetAt = computed(() => {
  const k = series.value[0].findIndex((r) => !r.rate.eq(props.rate));
  return k < 0 ? null : k + 1;
});
const moment = computed(() => {
  const at = resetAt.value;
  if (at === null) return null;
  const rows = series.value[0];
  const before = at === 1 ? new Decimal(props.amount) : rows[at - 2].closing;
  return {
    at,
    before,
    left: months - at + 1,
    oldPayment: at === 1 ? series.value[1][0].payment : rows[at - 2].payment,
    newPayment: rows[at - 1].payment,
    newRate: rows[at - 1].rate,
    oneFormula: recalculatedPayment(props.amount, rows[at - 1].rate, months),
  };
});

const W = 640;
const H = 170;
const PAD = { top: 12, bottom: 8, side: 10 };
const x = (m: number) => W - PAD.side - (m / months) * (W - 2 * PAD.side);
// zeroBased: the axis starts at 0 (the balance). Otherwise (the payment) it starts a little under the
// lowest payment, so a change of a few hundred shekels can be seen; the caption says so.
function chart(value: (s: number, m: number) => Decimal, from: number, zeroBased: boolean) {
  const pts = [0, 1].map((s) => Array.from({ length: months - from + 1 }, (_, i) => value(s, i + from).toNumber()));
  const hi = Math.max(...pts.flat());
  const lo = zeroBased ? 0 : Math.min(...pts.flat()) * 0.8;
  const top = hi + (hi - lo) * 0.08 || 1;
  const y = (v: number) => H - PAD.bottom - ((Math.max(v, lo) - lo) / (top - lo)) * (H - PAD.top - PAD.bottom);
  return { lines: pts.map((p) => p.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + from).toFixed(1)},${y(v).toFixed(1)}`).join(" ")), base: y(lo) };
}
const paymentChart = computed(() => chart((s, m) => series.value[s][m - 1].payment, 1, false));
const balanceChart = computed(() => chart((s, m) => (m === 0 ? new Decimal(props.amount) : series.value[s][m - 1].closing), 0, true));
const markerChange = computed(() => x(changeMonth.value - 1));
const markerReset = computed(() => (resetAt.value === null ? null : x(resetAt.value - 1)));
const ticks = Array.from({ length: Math.floor(props.years / 5) + 1 }, (_, i) => i * 5);

const yearRows = computed(() =>
  Array.from({ length: props.years }, (_, k) => {
    const end = (k + 1) * 12;
    return { year: k + 1, rate: series.value[0][end - 1].rate, pay: series.value.map((s) => s[end - 1].payment), bal: series.value.map((s) => s[end - 1].closing) };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      תרחיש להמחשה, לא מה שצפוי לקרות. מסלול של <span class="ltr">{{ formatWholeShekels(amount) }}</span> ל־{{ years }} שנה, שמתחיל ב־<span class="ltr">{{ pct(rate) }}</span>. כשאחוז
      הריבית זז, התשלום מחושב מחדש על היתרה, לחודשים שנשארו (הנחה של הקורס; בודקים בחוזה). כל שורה מעוגלת לאגורה, כמו בלוח של
      בנק.
    </p>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <p class="text-body-m font-semibold text-n900">המסלול</p>
        <div class="mt-1 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="המסלול">
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="kind === 'prime' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="kind === 'prime'" @click="kind = 'prime'">פריים</button>
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="kind === 'variable_unlinked' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="kind === 'variable_unlinked'" @click="kind = 'variable_unlinked'">
            משתנה לא צמודה, כל 5 שנים
          </button>
        </div>
      </div>
      <div>
        <p class="text-body-m font-semibold text-n900">שיטת ההחזר</p>
        <div class="mt-1 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="שיטת ההחזר">
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="method === 'spitzer' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="method === 'spitzer'" @click="method = 'spitzer'">שפיצר</button>
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="method === 'equal_principal' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="method === 'equal_principal'" @click="method = 'equal_principal'">קרן שווה</button>
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-body-m font-semibold text-n900">{{ kind === "prime" ? "הפריים זזה" : "העוגן זז" }} מחודש {{ changeMonth }}</span>
        <input v-model.number="changeMonth" type="range" min="2" :max="months - 1" step="1" :aria-label="kind === 'prime' ? 'מאיזה חודש הפריים זזה' : 'מאיזה חודש העוגן זז'" />
      </label>
      <label class="flex flex-col">
        <span class="text-body-m font-semibold text-n900">בכמה: <span class="ltr">{{ points(change) }}</span> {{ unit(change) }}</span>
        <input v-model.number="change" type="range" :min="minChange" max="3" step="0.1" aria-label="בכמה נקודות אחוז" />
      </label>
    </div>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2">
        <span class="inline-block h-1 w-5 rounded-sm" :style="{ background: colours[0] }"></span>
        <span>עם השינוי (<span class="ltr">{{ points(change) }}</span> {{ unit(change) }} מחודש {{ changeMonth }})</span>
      </li>
      <li class="flex items-center gap-2">
        <span class="inline-block h-1 w-5 rounded-sm" :style="{ background: colours[1] }"></span>
        <span>בלי שינוי, <span class="ltr">{{ pct(rate) }}</span> כל הדרך</span>
      </li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-n500"></span>{{ kind === "prime" ? "הפריים זזה" : "העוגן זז" }}</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>התשלום מחושב מחדש</li>
    </ul>

    <div class="mt-3 grid gap-4 lg:grid-cols-2">
      <figure v-for="(c, ci) in [paymentChart, balanceChart]" :key="ci">
        <figcaption class="text-caption font-semibold text-n600">{{ ci === 0 ? "התשלום בכל חודש (הציר לא מתחיל באפס)" : "היתרה בסוף כל חודש" }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="ci === 0 ? `גרף: התשלום בכל חודש, לאורך ${years} שנה, עם השינוי ובלעדיו` : `גרף: היתרה לאורך ${years} שנה, עם השינוי ובלעדיו`">
          <line v-if="ci === 1" :x1="PAD.side" :x2="W - PAD.side" :y1="c.base" :y2="c.base" stroke="var(--mogi-n300)" stroke-width="1" />
          <path v-for="i in [1, 0]" :key="i" :d="c.lines[i]" fill="none" :stroke="colours[i]" :stroke-width="i === 0 ? 3 : 2" vector-effect="non-scaling-stroke" />
          <line :x1="markerChange" :x2="markerChange" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-n500)" stroke-width="1.5" stroke-dasharray="2 4" />
          <line v-if="markerReset !== null" :x1="markerReset" :x2="markerReset" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
        </svg>
        <div class="relative h-4 text-caption text-n600" aria-hidden="true">
          <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t * 12) / W) * 100}%` }">{{ t }}</span>
        </div>
      </figure>
    </div>
    <p class="mt-1 text-center text-caption text-n600">המספרים מתחת לגרפים: שנים מתחילת ההלוואה (מימין לשמאל)</p>

    <div class="mt-3 rounded-md bg-n50 p-3" role="status" aria-live="polite">
      <template v-if="moment">
        <p class="text-body-m text-n800">
          <template v-if="kind !== 'prime' && moment.at !== changeMonth">
            העוגן זז בחודש {{ changeMonth }}, אבל אחוז הריבית מתעדכן רק בנקודת העדכון: מחודש {{ moment.at }}.
          </template>
          <template v-else>אחוז הריבית במסלול זז מחודש {{ moment.at }}.</template>
          אחוז הריבית החדש: <span class="ltr font-semibold">{{ pct(moment.newRate) }}</span>.
        </p>
        <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n800">
          <dt>היתרה כשהתשלום מחושב מחדש</dt>
          <dd class="ltr text-end">{{ formatShekels(moment.before) }}</dd>
          <dt>החודשים שנשארו</dt>
          <dd class="text-end">{{ moment.left }}</dd>
          <dt>התשלום לפני</dt>
          <dd class="ltr text-end">{{ formatShekels(moment.oldPayment) }}</dd>
          <dt class="font-semibold text-n900">התשלום אחרי</dt>
          <dd class="ltr text-end font-semibold text-n900">{{ formatShekels(moment.newPayment) }}</dd>
        </dl>
        <p v-if="method === 'spitzer'" class="mt-2 text-caption text-n600">
          לא נכון: נוסחה אחת על כל ההלוואה, כאילו אחוז הריבית החדש היה מהיום הראשון (<span class="ltr">{{ formatWholeShekels(amount) }}</span>, {{ months }} חודשים), הייתה
          נותנת <span class="ltr">{{ formatShekels(moment.oneFormula) }}</span>.
        </p>
        <p v-else class="mt-2 text-caption text-n600">בקרן שווה רכיב הקרן לא זז בשינוי: רק רכיב הריבית מחושב באחוז החדש.</p>
      </template>
      <p v-else class="text-body-m text-n800">
        אחוז הריבית לא זז עד סוף ההלוואה: {{ change === 0 ? `לא הזזתם ${anchorName}` : "אחרי החודש שבחרתם אין עוד נקודת עדכון" }}. שני הקווים אחד על השני.
      </p>
    </div>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-80 overflow-auto">
      <table class="w-full border-collapse text-caption sm:text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">שנה</th>
            <th class="py-2 pe-2 text-start">אחוז הריבית</th>
            <th class="py-2 pe-2 text-start">התשלום</th>
            <th class="py-2 text-start">היתרה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in yearRows" :key="r.year" class="border-b border-n100 align-top">
            <td class="py-1 pe-2">{{ r.year }}</td>
            <td class="py-1 pe-2"><span class="ltr">{{ pct(r.rate) }}</span></td>
            <td class="py-1 pe-2">
              <span v-for="(v, i) in r.pay" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ names[i] }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
            <td class="py-1">
              <span v-for="(v, i) in r.bal" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ names[i] }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">אחוז הריבית: במסלול עם השינוי. בכל תא של תשלום ויתרה, שורה לכל קו, בצבע שלו במקרא: עם השינוי למעלה, בלעדיו למטה. התשלום: בחודש האחרון של כל שנה. היתרה: בסוף השנה.</p>
    </div>
  </div>
</template>
