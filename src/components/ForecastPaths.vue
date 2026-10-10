<script setup lang="ts">
// Lesson 3.8: the first payment, the payment under today's terms, and the
// highest payment under a forecast — and why a forecast is not a ceiling.
// One variable unlinked track, its rate reset every few years. A fixed, invented
// forecast path gives "the highest payment under the forecast"; the learner moves
// the rates that actually come (from the first reset on) and sees that path's own
// highest payment beside it. Every number comes from metrics.ts, in the
// statement convention (each month's interest in agorot; the last payment clears
// the balance), the same as the lesson's tables.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { highestPayment, percentAbove, type Track, trackPayments } from "../lib/calc/metrics.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(
  defineProps<{ amount?: number; years?: number; blockYears?: number; forecast?: string[] }>(),
  { amount: 600000, years: 20, blockYears: 5, forecast: () => ["4.6", "5.1", "5.5", "5.3"] },
);

const months = props.years * 12;
const blockMonths = props.blockYears * 12;
const blocks = props.forecast.length;
const today = props.forecast[0];
const actual = ref<number[]>(props.forecast.map(Number));
const showTable = ref(false);

const track = (rates: (string | number)[]): Track => ({ principal: props.amount, rates: rates.map(String), blockMonths, months, rounding: "statement" });
const current = computed(() => trackPayments(track([today])));
const forecastPays = computed(() => trackPayments(track(props.forecast)));
const actualPays = computed(() => trackPayments(track(actual.value)));
const fMax = computed(() => highestPayment(forecastPays.value));
const aMax = computed(() => highestPayment(actualPays.value));
const headline = computed(() => current.value[0]);
const forecastAbove = computed(() => percentAbove(fMax.value.payment, headline.value));
const highlight = computed(() => forecastAbove.value.gte(10));
const vsForecast = computed(() => aMax.value.payment.minus(fMax.value.payment));

const pct = (v: Decimal.Value) => `${new Decimal(v).toDecimalPlaces(1).toString()}%`;
const range = (b: number) => `${b * props.blockYears + 1}–${Math.min((b + 1) * props.blockYears, props.years)}`;
const yearOf = (month: number) => Math.ceil(month / 12);
function reset() {
  actual.value = props.forecast.map(Number);
}

// Chart: the monthly payment over the whole term, month 1 at the right (time runs leftward).
const W = 640;
const H = 200;
const PAD = { top: 14, bottom: 10, side: 10 };
const yMax = computed(() => Math.max(fMax.value.payment.toNumber(), aMax.value.payment.toNumber(), headline.value.toNumber()) * 1.12);
const yMin = computed(() => Math.min(...actualPays.value.map((p) => p.toNumber()), ...forecastPays.value.map((p) => p.toNumber())) * 0.85);
const x = (month: number) => W - PAD.side - ((month - 1) / (months - 1)) * (W - 2 * PAD.side);
const y = (v: number) => H - PAD.bottom - ((v - yMin.value) / (yMax.value - yMin.value)) * (H - PAD.top - PAD.bottom);
const line = (pays: Decimal[]) => pays.map((p, i) => `${i === 0 ? "M" : "L"}${x(i + 1).toFixed(1)},${y(p.toNumber()).toFixed(1)}`).join(" ");
const ticks = Array.from({ length: props.years / props.blockYears + 1 }, (_, i) => i * props.blockYears);

const rows = computed(() =>
  Array.from({ length: blocks }, (_, b) => {
    const m = b * blockMonths + 1;
    return { b, forecastRate: props.forecast[b], forecastPay: forecastPays.value[m - 1], actualRate: actual.value[b], actualPay: actualPays.value[m - 1] };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      מסלול משתנה לא צמוד, <span class="ltr">{{ formatWholeShekels(amount) }}</span> ל־{{ years }} שנה בשפיצר. הריבית מתעדכנת כל {{ blockYears }} שנים.
      התחזית כאן בדויה, להמחשה — היא לא התחזית של בנק ישראל.
    </p>

    <fieldset class="mt-4">
      <legend class="text-body-m font-semibold text-n900">מה קורה בפועל: הריבית אחרי כל עדכון</legend>
      <div class="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <div class="flex flex-col">
          <span class="text-caption font-semibold text-n600">שנים <span class="ltr">{{ range(0) }}</span></span>
          <span class="flex min-h-11 items-center text-body-m text-n800">
            <span class="ltr font-semibold">{{ pct(today) }}</span>&nbsp;— הריבית של היום, ידועה
          </span>
        </div>
        <label v-for="b in blocks - 1" :key="b" class="flex flex-col">
          <span class="text-caption font-semibold text-n600">שנים <span class="ltr">{{ range(b) }}</span></span>
          <input v-model.number="actual[b]" type="range" min="1" max="9" step="0.1" :aria-label="`הריבית בשנים ${range(b)}`" />
          <span class="text-body-m text-n800">
            <span class="ltr font-semibold">{{ pct(actual[b]) }}</span>
            <span class="text-n600"> (בתחזית: <span class="ltr">{{ pct(forecast[b]) }}</span>)</span>
          </span>
        </label>
      </div>
      <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" @click="reset">חזרה לתחזית</button>
    </fieldset>

    <ul class="list-reset mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
      <li class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">החזר ראשון</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(actualPays[0]) }}</span></p>
        <p class="text-caption text-n600">ידוע מראש: בתחזית ובמה שקרה בפועל — אותו מספר. (כאן המסלול לא צמוד; במסלול צמוד הוא זז גם עם המדד של החודש הראשון.)</p>
      </li>
      <li class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">החזר בתנאים הנוכחיים</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(headline) }}</span></p>
        <p class="text-caption text-n600">כאילו הריבית נשארת <span class="ltr">{{ pct(today) }}</span> עד הסוף.</p>
      </li>
      <li class="rounded-md border border-n200 p-3">
        <p class="text-caption text-n600">החזר מרבי חזוי — לפי התחזית</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(fMax.payment) }}</span></p>
        <p class="text-caption text-n600">
          בחודש <span class="ltr">{{ fMax.month }}</span> (שנה {{ yearOf(fMax.month) }}). גבוה ב־<span class="ltr">{{ pct(forecastAbove) }}</span> מההחזר בתנאים הנוכחיים.
        </p>
        <p v-if="highlight" class="mt-1 rounded-sm bg-warning-bg px-2 py-1 text-caption text-n800">10% ומעלה: כאן Mogi מדגישה את המספר.</p>
      </li>
      <li class="rounded-md border border-n200 p-3">
        <p class="text-caption text-n600">ההחזר הגבוה ביותר במה שקרה בפועל</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(aMax.payment) }}</span></p>
        <p class="text-caption text-n600">
          בחודש <span class="ltr">{{ aMax.month }}</span> (שנה {{ yearOf(aMax.month) }}).
          <template v-if="vsForecast.gt(0.005)">גבוה מההחזר המרבי החזוי ב־<span class="ltr">{{ formatShekels(vsForecast) }}</span>.</template>
          <template v-else-if="vsForecast.lt(-0.005)">נמוך מההחזר המרבי החזוי ב־<span class="ltr">{{ formatShekels(vsForecast.abs()) }}</span>.</template>
          <template v-else>שווה להחזר המרבי החזוי.</template>
        </p>
        <p v-if="aMax.month === months" class="mt-1 text-caption text-n600">זה התשלום האחרון: הוא סוגר את היתרה, ולכן יכול לצאת שונה באגורות מהתשלומים שלפניו.</p>
      </li>
    </ul>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-5 rounded-sm" style="background: var(--mogi-teal-deep)"></span>מה שקרה בפועל (המחוונים)</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-2 border-dashed" style="border-color: var(--mogi-turquoise-2)"></span>התחזית</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-2 border-dotted border-navy"></span>ההחזר בתנאים הנוכחיים</li>
    </ul>
    <figure class="m-0 mt-2">
      <figcaption class="text-caption font-semibold text-n600">התשלום בכל חודש</figcaption>
      <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: התשלום בכל חודש לאורך ${years} שנה, בתחזית ובמה שקרה בפועל. הנתונים בטבלה.`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(headline.toNumber())" :y2="y(headline.toNumber())" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="2 4" />
        <path :d="line(forecastPays)" fill="none" stroke="var(--mogi-turquoise-2)" stroke-width="3" stroke-dasharray="9 6" vector-effect="non-scaling-stroke" />
        <path :d="line(actualPays)" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" vector-effect="non-scaling-stroke" />
        <circle :cx="x(aMax.month)" :cy="y(aMax.payment.toNumber())" r="6" fill="var(--mogi-teal-deep)" />
        <circle :cx="x(fMax.month)" :cy="y(fMax.payment.toNumber())" r="6" fill="var(--mogi-n0)" stroke="var(--mogi-turquoise-2)" stroke-width="3" />
      </svg>
      <div class="relative h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(Math.max(1, t * 12)) / W) * 100}%` }">{{ t }}</span>
      </div>
      <p class="text-center text-caption text-n600">שנים מתחילת ההלוואה, מימין לשמאל. העיגולים: ההחזר הגבוה ביותר בכל קו.</p>
    </figure>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">שנים</th>
            <th class="py-2 text-start font-semibold">ריבית בתחזית</th>
            <th class="py-2 text-start font-semibold">תשלום בתחזית</th>
            <th class="py-2 text-start font-semibold">ריבית בפועל</th>
            <th class="py-2 text-start font-semibold">תשלום בפועל</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.b" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ range(r.b) }}</span></td>
            <td class="py-1"><span class="ltr">{{ pct(r.forecastRate) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.forecastPay) }}</span></td>
            <td class="py-1"><span class="ltr">{{ pct(r.actualRate) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.actualPay) }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">בכל תקופה התשלום קבוע, כי הריבית לא זזה בין עדכון לעדכון; לכן מספיק החודש הראשון של כל תקופה.</p>
    </div>
  </div>
</template>
