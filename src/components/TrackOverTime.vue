<script setup lang="ts">
// "שינוי פריים ומדד לאורך זמן" (required by the brief), first version: lessons 2.5 and 2.6.
// One track's monthly payment and balance over its whole term, against a second line.
//  - mode "fixed" (2.5): a fixed unlinked track beside a fixed linked one. The learner
//    moves the index path (inflation in each block of years) and sees the linked
//    payment and balance follow it while the unlinked ones stay.
//  - mode "prime" (2.6): a prime track (prime + margin). The learner moves the prime
//    path, one level per block of years, and sees the payment recalculated on the
//    balance left; the second line is the same track if prime never moved. A second
//    step adds the index path: a prime track is not linked, so its shekels do not move,
//    but their purchasing power does (the view switch).
// Every number comes from amortization.ts; nothing is computed here but scaling.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { blockPath, indexPath, pathSchedule, primeTrackRate } from "../lib/calc/amortization.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(
  defineProps<{
    mode?: "fixed" | "prime";
    amount?: number;
    years?: number;
    blockYears?: number;
    unlinkedRate?: string;
    linkedRate?: string;
    prime?: string;
    margin?: string;
    inflation?: number;
  }>(),
  { mode: "fixed", amount: 600000, years: 20, blockYears: 5, unlinkedRate: "5", linkedRate: "3", prime: "4.75", margin: "-0.5", inflation: 2 },
);

const months = props.years * 12;
const blockMonths = props.blockYears * 12;
const blocks = Math.ceil(props.years / props.blockYears);
const blockRange = (b: number) => `${b * props.blockYears + 1}–${Math.min((b + 1) * props.blockYears, props.years)}`;
const blockLabel = (b: number) => `שנים ${blockRange(b)}`;

const primePath = ref<number[]>(Array.from({ length: blocks }, () => Number(props.prime)));
const inflPath = ref<number[]>(Array.from({ length: blocks }, () => (props.mode === "prime" ? 0 : props.inflation)));
const real = ref(false);
const showIndex = ref(props.mode === "fixed");
const showTable = ref(false);
// Hiding the index (prime mode) puts everything back as it was: no index, shekels on paper.
function toggleIndex() {
  showIndex.value = !showIndex.value;
  if (!showIndex.value) {
    real.value = false;
    inflPath.value = inflPath.value.map(() => 0);
  }
}
const year = ref(1);

const pct = (v: Decimal.Value) => `${new Decimal(v).toDecimalPlaces(2).toString()}%`;
const trackRate = (p: number) => primeTrackRate(String(p), props.margin);
const marginText = computed(() => {
  const m = new Decimal(props.margin);
  return m.isNeg() ? `P${"−"}${m.abs().toString()}` : `P+${m.toString()}`;
});

const factors = computed(() => indexPath(inflPath.value.map(String), blockMonths, months));
// The index at the end of each month, from 1 at the start: for the purchasing-power view.
const cumulative = computed(() => {
  let c = new Decimal(1);
  return factors.value.map((f) => (c = c.mul(f)));
});

const series = computed(() => {
  if (props.mode === "fixed") {
    return [
      { name: `קבועה לא צמודה, ${pct(props.unlinkedRate)}`, rows: pathSchedule(props.amount, blockPath([props.unlinkedRate], months, months)) },
      { name: `קבועה צמודה, ${pct(props.linkedRate)}`, rows: pathSchedule(props.amount, blockPath([props.linkedRate], months, months), factors.value) },
    ];
  }
  const moving = blockPath(primePath.value.map((p) => trackRate(p)), blockMonths, months);
  const still = blockPath([trackRate(Number(props.prime))], months, months);
  return [
    { name: "הפריים שבחרתם", rows: pathSchedule(props.amount, moving) },
    { name: `אילו הפריים נשארה ${pct(props.prime)}`, rows: pathSchedule(props.amount, still) },
  ];
});

// Shekels as written, or (view switch) divided by the index at that month: today's purchasing power.
const shown = (v: Decimal, month: number) => (real.value && month > 0 ? v.div(cumulative.value[month - 1]) : v);
const paymentAt = (s: number, month: number) => shown(series.value[s].rows[month - 1].payment, month);
const balanceAt = (s: number, month: number) => (month === 0 ? new Decimal(props.amount) : shown(series.value[s].rows[month - 1].closing, month));

const W = 640;
const H = 180;
const PAD = { top: 12, bottom: 8, side: 10 };
const x = (month: number) => W - PAD.side - (month / months) * (W - 2 * PAD.side);
function chart(value: (s: number, month: number) => Decimal, from: number) {
  const pts = [0, 1].map((s) => Array.from({ length: months - from + 1 }, (_, i) => value(s, i + from).toNumber()));
  const max = Math.max(...pts.flat()) * 1.08 || 1;
  const y = (v: number) => H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  return {
    lines: pts.map((p) => p.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + from).toFixed(1)},${y(v).toFixed(1)}`).join(" ")),
    base: y(0),
  };
}
const paymentChart = computed(() => chart(paymentAt, 1));
const balanceChart = computed(() => chart(balanceAt, 0));
const marker = computed(() => x(year.value * 12));
const ticks = computed(() => Array.from({ length: props.years / 5 + 1 }, (_, i) => i * 5).filter((t) => t <= props.years));

const yearRows = computed(() =>
  Array.from({ length: props.years }, (_, k) => {
    const m = (k + 1) * 12;
    return { year: k + 1, pay: [paymentAt(0, m), paymentAt(1, m)], bal: [balanceAt(0, m), balanceAt(1, m)] };
  }),
);
const now = computed(() => yearRows.value[year.value - 1]);
const colours = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)"];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      מספרים להמחשה, לא תחזית. מסלול של <span class="ltr">{{ formatWholeShekels(amount) }}</span> ל־{{ years }} שנה, בתשלומים חודשיים
      שמחושבים בשיטת התשלומים השווים (נלמד אותה בשיעורים 2.9 ו־3.1).
    </p>

    <!-- The prime path: one level per block of years. -->
    <fieldset v-if="mode === 'prime'" class="mt-4">
      <legend class="text-body-m font-semibold text-n900">הפריים בכל תקופה (המסלול: <span class="ltr">{{ marginText }}</span>)</legend>
      <div class="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <label v-for="(p, b) in primePath" :key="b" class="flex flex-col">
          <span class="text-caption font-semibold text-n600">שנים <span class="ltr">{{ blockRange(b) }}</span></span>
          <input v-model.number="primePath[b]" type="range" min="1" max="9" step="0.25" :aria-label="`הפריים ב${blockLabel(b)}`" />
          <span class="text-body-m text-n800">
            פריים <span class="ltr font-semibold">{{ pct(p) }}</span> · במסלול <span class="ltr font-semibold">{{ pct(trackRate(p)) }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <!-- The index path. In prime mode it is a second step. -->
    <div v-if="mode === 'prime'" class="mt-4">
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-expanded="showIndex" @click="toggleIndex">
        {{ showIndex ? "הסתרת המדד" : "להוסיף את המדד" }}
      </button>
    </div>
    <fieldset v-if="showIndex" class="mt-4">
      <legend class="text-body-m font-semibold text-n900">כמה עולה המדד בכל שנה, בכל תקופה</legend>
      <div class="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <label v-for="(p, b) in inflPath" :key="b" class="flex flex-col">
          <span class="text-caption font-semibold text-n600">שנים <span class="ltr">{{ blockRange(b) }}</span></span>
          <input v-model.number="inflPath[b]" type="range" min="-1" max="8" step="0.5" :aria-label="`עליית המדד בשנה ב${blockLabel(b)}`" />
          <span class="text-body-m text-n800"><span class="ltr font-semibold">{{ pct(p) }}</span> בשנה</span>
        </label>
      </div>
      <p v-if="mode === 'prime'" class="mt-2 text-caption text-n600">מסלול הפריים לא צמוד: המדד לא משנה בו אף שקל. הוא משנה רק כמה השקלים האלה שווים.</p>

      <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="איך מודדים">
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="!real ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="!real" @click="real = false">
          בשקלים שעל הנייר
        </button>
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="real ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="real" @click="real = true">
          בכוח קנייה של היום
        </button>
      </div>
    </fieldset>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li v-for="(s, i) in series" :key="i" class="flex items-center gap-2">
        <span class="inline-block h-1 w-5 rounded-sm" :style="{ background: colours[i] }"></span>{{ s.name }}
      </li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>השנה שבחרתם</li>
    </ul>

    <div class="mt-3 grid gap-4 lg:grid-cols-2">
      <figure>
        <figcaption class="text-caption font-semibold text-n600">התשלום בכל חודש{{ real ? ", בכוח קנייה של היום" : "" }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: התשלום בכל חודש, לאורך ${years} שנה, בשני המסלולים`">
          <line :x1="PAD.side" :x2="W - PAD.side" :y1="paymentChart.base" :y2="paymentChart.base" stroke="var(--mogi-n300)" stroke-width="1" />
          <path v-for="i in [1, 0]" :key="i" :d="paymentChart.lines[i]" fill="none" :stroke="colours[i]" :stroke-width="i === 0 ? 3 : 2" vector-effect="non-scaling-stroke" />
          <line :x1="marker" :x2="marker" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
        </svg>
        <div class="relative h-4 text-caption text-n600" aria-hidden="true">
          <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t * 12) / W) * 100}%` }">{{ t }}</span>
        </div>
      </figure>
      <figure>
        <figcaption class="text-caption font-semibold text-n600">היתרה בסוף כל חודש{{ real ? ", בכוח קנייה של היום" : "" }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: היתרה לאורך ${years} שנה, בשני המסלולים`">
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
      <span class="text-body-m font-semibold text-n900">שנה: {{ year }}</span>
      <input v-model.number="year" type="range" min="1" :max="years" step="1" aria-label="השנה שמוצגת בכרטיסים" />
    </label>
    <div class="grid gap-3 sm:grid-cols-2" role="status" aria-live="polite">
      <div v-for="(s, i) in series" :key="i" class="rounded-md bg-n50 p-3" :style="{ borderInlineStart: `4px solid ${colours[i]}` }">
        <p class="text-caption font-semibold text-n700">{{ s.name }}</p>
        <p class="mt-1 text-body-m text-n800">
          התשלום בחודש האחרון של שנה {{ year }}: <span class="ltr font-semibold text-n900">{{ formatShekels(now.pay[i]) }}</span>
        </p>
        <p class="text-body-m text-n800">
          היתרה בסוף שנה {{ year }}: <span class="ltr font-semibold text-n900">{{ formatShekels(now.bal[i]) }}</span>
        </p>
      </div>
    </div>
    <p class="mt-2 text-caption text-n600">{{ real ? "בכוח קנייה של היום: הסכום מחולק בכמה שהמדד עלה מתחילת ההלוואה." : "בשקלים שעל הנייר: כמה שקלים משלמים וחייבים באמת." }}</p>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-80 overflow-y-auto">
      <table class="w-full border-collapse text-caption sm:text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">שנה</th>
            <th class="py-2 pe-2 text-start">התשלום</th>
            <th class="py-2 text-start">היתרה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in yearRows" :key="r.year" class="border-b border-n100 align-top">
            <td class="py-1 pe-2">{{ r.year }}</td>
            <td class="py-1 pe-2">
              <span v-for="(v, i) in r.pay" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ series[i].name }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
            <td class="py-1">
              <span v-for="(v, i) in r.bal" :key="i" class="flex items-center gap-1">
                <span class="inline-block h-2 w-2 shrink-0 rounded-pill" :style="{ background: colours[i] }" aria-hidden="true"></span>
                <span class="sr-only">{{ series[i].name }}: </span><span class="ltr">{{ formatShekels(v) }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">בכל תא, שורה לכל מסלול, בצבע שלו במקרא: {{ series[0].name }} למעלה, {{ series[1].name }} למטה. התשלום: בחודש האחרון של כל שנה. היתרה: בסוף השנה.</p>
    </div>
  </div>
</template>
