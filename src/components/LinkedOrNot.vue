<script setup lang="ts">
// Lesson 2.3's illustration: indexed or not indexed, over one year. The learner
// sets the rate of a debt that is not indexed, the (real) rate of an indexed
// one, and the year's inflation, and sees what each debt comes to after a year
// with the interest paid at its end. The chart runs the inflation from 0% at
// the right edge leftward: the debt that is not indexed is a flat line, the
// indexed one rises, and they cross at the break-even inflation.
// Every number comes from tracks.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { plainNumber } from "../lib/calc/indexation.ts";
import { formatShekelsText } from "../lib/calc/money.ts";
import { breakEvenInflation, indexedAmount, indexedYearOwed, plainYearOwed } from "../lib/calc/tracks.ts";

const props = withDefaults(defineProps<{ amount?: number; plain?: number; real?: number; inflation?: number }>(), {
  amount: 100000,
  plain: 5,
  real: 3,
  inflation: 2,
});

const plain = ref(props.plain);
const real = ref(props.real);
const inflation = ref(props.inflation);
const showTable = ref(false);

const plainOwed = computed(() => plainYearOwed(props.amount, String(plain.value)));
const indexedNow = computed(() => indexedAmount(props.amount, String(inflation.value)));
const indexedOwed = computed(() => indexedYearOwed(props.amount, String(real.value), String(inflation.value)));
const gap = computed(() => indexedOwed.value.minus(plainOwed.value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
const breakEven = computed(() => breakEvenInflation(String(plain.value), String(real.value)));
const show = (d: Decimal.Value) => plainNumber(d).replace("-", "−");

// Chart: inflation 0 … MAX from the right edge leftward; shekels owed after a year upward.
const MAX = 8;
const W = 640;
const H = 220;
const PAD = { side: 10, top: 12, bottom: 10 };
const x = (p: number) => W - PAD.side - (p / MAX) * (W - PAD.side * 2);
const lo = computed(() => Math.min(props.amount, plainOwed.value.toNumber(), indexedYearOwed(props.amount, String(real.value), "0").toNumber()));
const hi = computed(() => Math.max(plainOwed.value.toNumber(), indexedYearOwed(props.amount, String(real.value), String(MAX)).toNumber()));
const y = (v: number) => {
  const span = hi.value - lo.value || 1;
  return PAD.top + ((hi.value - v) / span) * (H - PAD.top - PAD.bottom);
};
const indexedLine = computed(() => {
  const a = indexedYearOwed(props.amount, String(real.value), "0").toNumber();
  const b = indexedYearOwed(props.amount, String(real.value), String(MAX)).toNumber();
  return { x1: x(0), y1: y(a), x2: x(MAX), y2: y(b) };
});
const breakEvenVisible = computed(() => breakEven.value.gte(0) && breakEven.value.lte(MAX));
const ticks = Array.from({ length: MAX + 1 }, (_, k) => k);
/** Where inflation p sits, measured from the start (right) edge, in percent of the chart's width — for the HTML labels. */
const fromStart = (p: number) => `${((PAD.side + (p / MAX) * (W - PAD.side * 2)) / W) * 100}%`;
const tableRows = computed(() =>
  ticks.map((p) => {
    const b = indexedYearOwed(props.amount, String(real.value), String(p));
    return { p, indexed: b, diff: b.minus(plainOwed.value) };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">
      מספרים להמחשה: חוב של <span class="ltr">{{ formatShekelsText(amount) }}</span> לשנה אחת, והריבית משולמת בסוף השנה. זו לא תחזית לאינפלציה.
    </p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית במסלול לא צמוד</span>
        <input v-model.number="plain" type="range" min="0" max="8" step="0.1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ show(plain) }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית במסלול צמוד (מעל ההצמדה)</span>
        <input v-model.number="real" type="range" min="0" max="6" step="0.1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ show(real) }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">האינפלציה בשנה</span>
        <input v-model.number="inflation" type="range" min="0" :max="MAX" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ show(inflation) }}%</span></span>
      </label>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
      <div class="rounded-md bg-n50 p-3">
        <div class="text-caption text-n600">לא צמוד: החוב ועוד הריבית, בסוף השנה</div>
        <div class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(plainOwed) }}</span></div>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <div class="text-caption text-n600">צמוד: החוב אחרי ההצמדה ועוד הריבית</div>
        <div class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(indexedOwed) }}</span></div>
        <div class="text-caption text-n700">החוב אחרי ההצמדה: <span class="ltr">{{ formatShekelsText(indexedNow) }}</span></div>
      </div>
    </div>
    <p class="mt-3 text-body-m text-n800">
      <template v-if="gap.isZero()">שני המסלולים עולים אותו דבר.</template>
      <template v-else>המסלול ה{{ gap.isNeg() ? "צמוד" : "לא צמוד" }} זול יותר ב־<span class="ltr">{{ formatShekelsText(gap.abs()) }}</span>.</template>
      נקודת האיזון: אינפלציה של <span class="ltr">{{ show(breakEven) }}%</span>{{ breakEvenVisible ? "" : " (מחוץ לגרף, שמראה 0% עד 8%)" }}. מעליה הצמוד יקר יותר, מתחתיה הוא זול יותר.
    </p>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-4 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>לא צמוד</li>
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-4 rounded-sm" style="background: var(--mogi-teal-deep)"></span>צמוד</li>
      <li v-if="breakEvenVisible" class="flex items-center gap-2"><span class="inline-block h-0.5 w-4" style="border-top: 2px dashed var(--mogi-navy)"></span>נקודת האיזון</li>
    </ul>
    <div class="mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: כמה מגיע בסוף השנה בכל מסלול, לפי האינפלציה. נקודת האיזון: ${show(breakEven)}%`">
        <line v-for="k in ticks" :key="k" :x1="x(k)" :x2="x(k)" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-n100)" />
        <line :x1="x(0)" :x2="x(MAX)" :y1="y(plainOwed.toNumber())" :y2="y(plainOwed.toNumber())" stroke="var(--mogi-turquoise-2)" stroke-width="4" />
        <line v-bind="indexedLine" stroke="var(--mogi-teal-deep)" stroke-width="4" />
        <line v-if="breakEvenVisible" :x1="x(breakEven.toNumber())" :x2="x(breakEven.toNumber())" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="6 5" />
        <circle :cx="x(inflation)" :cy="y(indexedOwed.toNumber())" r="8" fill="var(--mogi-navy)" stroke="var(--mogi-n0)" stroke-width="2" />
      </svg>
      <!-- Each label centred on its grid line: placed from the start (right) edge, then shifted by half its width. -->
      <div class="relative h-4 text-caption text-n600" aria-hidden="true">
        <span v-for="k in ticks" :key="k" class="ltr absolute top-0 whitespace-nowrap" :class="k % 2 ? 'max-sm:invisible' : ''" :style="{ insetInlineStart: fromStart(k), transform: 'translateX(50%)' }">{{ k }}%</span>
      </div>
      <p class="mt-1 text-center text-caption text-n600">האינפלציה בשנה (מימין לשמאל). הנקודה: האינפלציה שבחרתם.</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">אינפלציה</th>
            <th class="py-2 text-start">צמוד</th>
            <th class="py-2 text-start">צמוד פחות לא צמוד</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in tableRows" :key="r.p" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ r.p }}%</span></td>
            <td class="py-1"><span class="ltr whitespace-nowrap">{{ formatShekelsText(r.indexed) }}</span></td>
            <td class="py-1"><span class="ltr whitespace-nowrap">{{ formatShekelsText(r.diff).replace("-", "−") }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">לא צמוד, בכל שורה: <span class="ltr">{{ formatShekelsText(plainOwed) }}</span>.</p>
    </div>
  </div>
</template>
