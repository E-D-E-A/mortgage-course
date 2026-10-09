<script setup lang="ts">
// The yield curve the learner moves (lesson 0.12). Five lengths, one slider
// each; three starting shapes (rising, flat, falling) come from the lesson's
// data file. The chart shows the curve and, between every two neighbouring
// lengths, the yearly rate the curve implies for that stretch. Every number
// comes from the course's calc module (src/lib/calc/bonds.ts).
import Decimal from "decimal.js";
import { computed, reactive, ref } from "vue";
import { curveShape, impliedRate, percentString } from "../lib/calc/bonds.ts";

interface Point {
  years: number;
  yield: string;
}
const props = defineProps<{ presets: { rising: Point[]; flat: Point[]; falling: Point[] }; start?: "rising" | "flat" | "falling" }>();

const LENGTHS = props.presets.rising.map((p) => p.years);
const yields = reactive<number[]>(props.presets[props.start ?? "rising"].map((p) => Number(p.yield)));
const showTable = ref(false);

function use(name: "rising" | "flat" | "falling") {
  props.presets[name].forEach((p, i) => (yields[i] = Number(p.yield)));
}

const points = computed(() => LENGTHS.map((years, i) => ({ years, yieldPercent: String(yields[i]) })));
const segments = computed(() =>
  points.value.slice(1).map((p, i) => {
    const a = points.value[i];
    return { from: a.years, to: p.years, rate: impliedRate(a.yieldPercent, a.years, p.yieldPercent, p.years) };
  }),
);
const shape = computed(() => curveShape(points.value));
const SHAPE_TEXT = {
  rising: { title: "העקום עולה", body: "התשואה לטווח ארוך גבוהה מהתשואה לטווח קצר. הריביות שהעקום מגלם לקטעים הרחוקים גבוהות מהתשואה של היום." },
  falling: { title: "העקום יורד", body: "התשואה לטווח ארוך נמוכה מהתשואה לטווח קצר. הריביות שהעקום מגלם לקטעים הרחוקים נמוכות מהתשואה של היום." },
  flat: { title: "העקום שטוח", body: "אותה תשואה לכל אורך. גם הריבית שהעקום מגלם לכל קטע זהה לה." },
  mixed: { title: "העקום עולה ויורד", body: "חלק מהעקום עולה וחלק יורד. קראו כל קטע בנפרד." },
} as const;
const pct = (d: Decimal.Value) => `${Number(percentString(d))}%`;

// Chart geometry. Length 0 at the right, longer lengths to the left, as Hebrew is read.
const W = 640;
const H = 300;
const PAD = { top: 16, bottom: 16, start: 16, end: 52 };
const MAX_YEARS = LENGTHS[LENGTHS.length - 1];
const lo = computed(() => Math.min(0, Math.floor(Math.min(...yields, ...segments.value.map((s) => s.rate.toNumber())))));
const hi = computed(() => Math.max(8, Math.ceil(Math.max(...yields, ...segments.value.map((s) => s.rate.toNumber())))));
const xOf = (years: number) => W - PAD.start - (years / MAX_YEARS) * (W - PAD.start - PAD.end);
const yOf = (pctValue: number) => PAD.top + ((hi.value - pctValue) / (hi.value - lo.value)) * (H - PAD.top - PAD.bottom);
const ticks = computed(() => {
  const out: number[] = [];
  for (let v = lo.value; v <= hi.value; v += 2) out.push(v);
  return out;
});
const curvePath = computed(() => points.value.map((p, i) => `${i ? "L" : "M"}${xOf(p.years)},${yOf(Number(p.yieldPercent))}`).join(" "));
const LENGTH_LABEL: Record<number, string> = { 1: "שנה", 2: "שנתיים" };
const lengthLabel = (y: number) => LENGTH_LABEL[y] ?? `${y} שנים`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-caption font-semibold text-n600">התחילו מעקום:</span>
      <button
        v-for="(name, key) in { rising: 'עולה', flat: 'שטוח', falling: 'יורד' }"
        :key="key"
        type="button"
        class="h-11 rounded-md border border-n200 bg-n0 px-4 text-body-m text-navy hover:bg-n50"
        @click="use(key)"
      >
        {{ name }}
      </button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
      <label v-for="(y, i) in LENGTHS" :key="y" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תשואה ל{{ lengthLabel(y) }}</span>
        <input v-model.number="yields[i]" type="range" min="0" max="8" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ yields[i] }}%</span></span>
      </label>
    </div>
    <p class="mt-2 text-caption text-n600">מספרים להמחשה; אינם נתוני שוק.</p>

    <div class="mt-5 rounded-md bg-n50 p-3" aria-live="polite">
      <p class="text-body-l font-semibold text-navy">{{ SHAPE_TEXT[shape].title }}</p>
      <p class="text-body-m text-n700">{{ SHAPE_TEXT[shape].body }}</p>
    </div>

    <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-5 rounded-sm" style="background: var(--mogi-teal-deep)"></span>העקום: התשואה לכל אורך זמן</li>
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-5 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>הריבית לשנה שהעקום מגלם לכל קטע</li>
    </ul>

    <div class="relative mt-3">
      <div class="relative">
      <svg :viewBox="`0 0 ${W} ${H}`" class="block w-full" role="img" aria-label="גרף: עקום התשואות והריבית שהוא מגלם לכל קטע">
        <line v-for="t in ticks" :key="t" :x1="PAD.end" :x2="W - PAD.start" :y1="yOf(t)" :y2="yOf(t)" stroke="var(--mogi-n200)" stroke-width="1" />
        <line
          v-for="s in segments"
          :key="`s${s.from}`"
          :x1="xOf(s.from)"
          :x2="xOf(s.to)"
          :y1="yOf(s.rate.toNumber())"
          :y2="yOf(s.rate.toNumber())"
          stroke="var(--mogi-turquoise-2)"
          stroke-width="5"
          stroke-linecap="round"
        />
        <path :d="curvePath" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" />
        <circle v-for="p in points" :key="p.years" :cx="xOf(p.years)" :cy="yOf(Number(p.yieldPercent))" r="7" fill="var(--mogi-teal-deep)" />
      </svg>
      <span
        v-for="t in ticks"
        :key="`l${t}`"
        class="absolute end-0 -translate-y-1/2 bg-n0 px-1 text-caption text-n600"
        :style="{ top: `${(yOf(t) / H) * 100}%` }"
        ><span class="ltr">{{ t }}%</span></span
      >
      </div>
      <div class="relative mt-1 h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="y in LENGTHS" :key="y" class="absolute -translate-x-1/2" :style="{ left: `${(xOf(y) / W) * 100}%` }">{{ y }}</span>
      </div>
      <p class="mt-1 text-center text-caption text-n600">אורך הזמן בשנים (מימין לשמאל)</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">קטע</th>
            <th class="py-2 text-start">התשואה בתחילתו</th>
            <th class="py-2 text-start">התשואה בסופו</th>
            <th class="py-2 text-start">הריבית לשנה שהעקום מגלם בקטע</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in segments" :key="s.from" class="border-b border-n100">
            <td class="py-1">משנה {{ s.from }} עד שנה {{ s.to }}</td>
            <td class="py-1"><span class="ltr">{{ yields[i] }}%</span></td>
            <td class="py-1"><span class="ltr">{{ yields[i + 1] }}%</span></td>
            <td class="py-1 font-semibold text-n900"><span class="ltr">{{ pct(s.rate) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
