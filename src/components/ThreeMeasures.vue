<script setup lang="ts">
// Lesson 3.11: two schedules, three measures. For a pair of schedules the
// learner sees the total paid, the IRR (× 12) and the value today at a rate the
// money could earn meanwhile — and which schedule each measure calls cheaper.
// Moving that rate shows the third answer change while the first two stay.
// Every number comes from metrics.ts (statement schedules, as the lesson's tables).
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { annualByMultiplication, irrMonthly, type Method, presentValueAtAnnual, totalPaid, trackPayments } from "../lib/calc/metrics.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

interface Side {
  name: string;
  amount: number;
  rate: string;
  years: number;
  method: Method;
}
const pairs: Record<"methods" | "offers", { label: string; a: Side; b: Side }> = {
  methods: {
    label: "שפיצר מול קרן שווה",
    a: { name: "שפיצר", amount: 400000, rate: "6", years: 15, method: "spitzer" },
    b: { name: "קרן שווה", amount: 400000, rate: "6", years: 15, method: "equal_principal" },
  },
  offers: {
    label: "שתי הצעות",
    a: { name: "הצעה א׳", amount: 600000, rate: "5", years: 20, method: "spitzer" },
    b: { name: "הצעה ב׳", amount: 600000, rate: "4.6", years: 30, method: "spitzer" },
  },
};

const props = withDefaults(defineProps<{ pair?: "methods" | "offers"; earn?: number }>(), { pair: "methods", earn: 3 });
const pair = ref(props.pair);
const earn = ref(props.earn);
const showTable = ref(false);

const sides = computed(() => {
  const p = pairs[pair.value];
  return [p.a, p.b].map((s, i) => {
    const pays = trackPayments({ principal: s.amount, rates: [s.rate], months: s.years * 12, method: s.method, rounding: "statement" });
    return { ...s, i, pays, total: totalPaid(pays), irr: annualByMultiplication(irrMonthly(pays, s.amount)) };
  });
});
const pv = computed(() => sides.value.map((s) => presentValueAtAnnual(s.pays, String(earn.value))));
const colours = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)"];

// For each measure, which side is cheaper (lower), or a tie to the shown precision.
function cheaper(a: Decimal, b: Decimal, eps: Decimal.Value): number | null {
  const d = a.minus(b);
  if (d.abs().lte(eps)) return null;
  return d.lt(0) ? 0 : 1;
}
const measures = computed(() => [
  { key: "total", q: "כמה שקלים תשלמו?", name: "סך תשלומים", values: sides.value.map((s) => formatShekels(s.total)), winner: cheaper(sides.value[0].total, sides.value[1].total, "0.005") },
  { key: "irr", q: "איזו ריבית אחת מסבירה את התשלומים?", name: "IRR, לשנה (כפול 12)", values: sides.value.map((s) => `${s.irr.toDecimalPlaces(2).toString()}%`), winner: cheaper(sides.value[0].irr, sides.value[1].irr, "0.005") },
  { key: "pv", q: "כמה שווים התשלומים היום?", name: `ערך נוכחי ב־${earn.value}% לשנה`, values: pv.value.map((v) => formatShekels(v)), winner: cheaper(pv.value[0], pv.value[1], "0.5") },
]);

// Chart: the value today against the rate the money earns, 0% at the right.
const W = 640;
const H = 220;
const PAD = { top: 14, bottom: 10, side: 12 };
const grid = Array.from({ length: 41 }, (_, i) => i * 0.25);
const curves = computed(() => sides.value.map((s) => grid.map((r) => presentValueAtAnnual(s.pays, String(r)).toNumber())));
const yMax = computed(() => Math.max(...curves.value.flat()) * 1.04);
const yMin = computed(() => Math.min(...curves.value.flat()) * 0.9);
const x = (r: number) => W - PAD.side - (r / 10) * (W - 2 * PAD.side);
const y = (v: number) => H - PAD.bottom - ((v - yMin.value) / (yMax.value - yMin.value)) * (H - PAD.top - PAD.bottom);
const path = (c: number[]) => c.map((v, i) => `${i === 0 ? "M" : "L"}${x(grid[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
const tableRates = Array.from({ length: 11 }, (_, i) => i);
// One short line for screen readers (and everyone): only the present-value answer moves with the slider.
const pvStatus = computed(() => {
  const w = measures.value[2].winner;
  return w === null ? `בריבית ${earn.value}%: בערך נוכחי שני הלוחות שווים.` : `בריבית ${earn.value}%: בערך נוכחי ${sides.value[w].name} נמוך יותר.`;
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="איזה זוג לוחות">
      <button
        v-for="(p, k) in pairs"
        :key="k"
        type="button"
        class="min-h-11 rounded-sm px-3 text-body-m"
        :class="pair === k ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="pair === k"
        @click="pair = k"
      >
        {{ p.label }}
      </button>
    </div>
    <ul class="list-reset mt-3 grid gap-2 sm:grid-cols-2">
      <li v-for="s in sides" :key="s.i" class="flex items-start gap-2 text-body-m text-n800">
        <span class="mt-1 inline-block h-3 w-3 shrink-0 rounded-sm" :style="{ background: colours[s.i] }" aria-hidden="true"></span>
        <span>
          <strong class="text-n900">{{ s.name }}:</strong> <span class="ltr">{{ formatWholeShekels(s.amount) }}</span> ב־<span class="ltr">{{ s.rate }}%</span> לשנה,
          {{ s.years }} שנה, {{ s.method === "spitzer" ? "שפיצר" : "קרן שווה" }}. תשלום ראשון <span class="ltr">{{ formatShekels(s.pays[0]) }}</span>.
        </span>
      </li>
    </ul>

    <label class="mt-4 flex flex-col sm:max-w-md">
      <span class="text-caption font-semibold text-n600">כמה הכסף שלכם יכול להרוויח בינתיים, לשנה (מחושב חודשי: חלקי 12)</span>
      <input v-model.number="earn" type="range" min="0" max="10" step="0.25" aria-label="כמה הכסף יכול להרוויח בינתיים, באחוזים לשנה" />
      <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ earn }}%</span> לשנה</span>
    </label>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full min-w-[20rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">השאלה</th>
            <th v-for="s in sides" :key="s.i" class="py-2 text-start font-semibold">{{ s.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in measures" :key="m.key" class="border-b border-n100 align-top">
            <th scope="row" class="py-2 pe-2 text-start font-normal text-n800">
              {{ m.q }}<br /><span class="text-caption text-n600">{{ m.name }}</span>
            </th>
            <td v-for="(v, i) in m.values" :key="i" class="py-2 pe-2">
              <span class="ltr" :class="m.winner === i ? 'font-semibold text-n900' : 'text-n700'">{{ v }}</span>
              <span v-if="m.winner === i" class="ms-1 whitespace-nowrap rounded-pill bg-n100 px-2 py-0.5 text-caption text-n800">נמוך יותר</span>
              <span v-else-if="m.winner === null && i === 0" class="ms-1 whitespace-nowrap rounded-pill bg-n100 px-2 py-0.5 text-caption text-n800">שווים</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-2 text-body-m text-n800" aria-live="polite">{{ pvStatus }}</p>
    <p class="mt-1 text-caption text-n600">״שווים״ בערך נוכחי: ההפרש קטן מחצי שקל. אלה אגורות של עיגול, כי כל לוח מעוגל לאגורה בכל חודש.</p>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li v-for="s in sides" :key="s.i" class="flex items-center gap-2"><span class="inline-block h-1 w-5 rounded-sm" :style="{ background: colours[s.i] }"></span>{{ s.name }}</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>הריבית שבחרתם</li>
    </ul>
    <figure class="m-0 mt-2">
      <figcaption class="text-caption font-semibold text-n600">הערך הנוכחי של כל התשלומים, לפי כמה הכסף מרוויח בינתיים</figcaption>
      <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" aria-label="גרף: הערך הנוכחי של כל לוח, בכל ריבית מ־0% עד 10%. הנתונים בטבלה.">
        <path v-for="(c, i) in curves" :key="i" :d="path(c)" fill="none" :stroke="colours[i]" stroke-width="3" :stroke-dasharray="i === 1 ? '10 6' : undefined" vector-effect="non-scaling-stroke" />
        <line :x1="x(earn)" :x2="x(earn)" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
      </svg>
      <div class="relative h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="t in [0, 2, 4, 6, 8, 10]" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t) / W) * 100}%` }"><span class="ltr">{{ t }}%</span></span>
      </div>
      <p class="text-center text-caption text-n600">הריבית שהכסף מרוויח, מ־0% בימין ועד 10% בשמאל. קו נמוך יותר — לוח זול יותר בריבית הזו.</p>
    </figure>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[20rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">ריבית לשנה</th>
            <th v-for="s in sides" :key="s.i" class="py-2 text-start font-semibold">ערך נוכחי: {{ s.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in tableRates" :key="r" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ r }}%</span></td>
            <td v-for="s in sides" :key="s.i" class="py-1"><span class="ltr">{{ formatShekels(presentValueAtAnnual(s.pays, String(r))) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
