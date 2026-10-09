<script setup lang="ts">
// The compound-interest illustration. The learner moves the amount, the rate
// and the number of years, and sees each year's balance split into three
// parts: the original amount, the interest simple interest would also pay,
// and the interest earned on interest. Computed by the course's calc module.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { compoundBalance, simpleBalance } from "../lib/calc/compound.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";

const props = withDefaults(defineProps<{ principal?: number; rate?: number; years?: number }>(), {
  principal: 10000,
  rate: 5,
  years: 10,
});

const principal = ref(props.principal);
const rate = ref(props.rate);
const years = ref(props.years);
const showTable = ref(false);
const hover = ref<number | null>(null);

const rows = computed(() =>
  Array.from({ length: years.value + 1 }, (_, n) => {
    const p = new Decimal(principal.value);
    const c = compoundBalance(principal.value, String(rate.value), n);
    const s = simpleBalance(principal.value, String(rate.value), n);
    return {
      year: n,
      principal: p,
      simpleInterest: s.minus(p),
      interestOnInterest: c.minus(s),
      balance: c,
    };
  }),
);
const last = computed(() => rows.value[rows.value.length - 1]);
const ioiShare = computed(() => {
  const total = last.value.balance.minus(last.value.principal);
  return total.isZero() ? "0" : percentString(last.value.interestOnInterest.div(total).mul(100));
});

// Chart geometry (viewBox units). Bars sit on the baseline; the start side is the right in RTL,
// so year 0 is drawn at the right edge and time runs leftward, as Hebrew is read.
const W = 640;
const H = 280;
const PAD = { top: 16, bottom: 4, side: 8 };
const max = computed(() => last.value.balance.toNumber());
const band = computed(() => (W - PAD.side * 2) / rows.value.length);
const barW = computed(() => Math.max(2, band.value - 2));
const y = (v: number) => H - PAD.bottom - (v / max.value) * (H - PAD.top - PAD.bottom);
const xOf = (i: number) => W - PAD.side - (i + 1) * band.value + 1;

function segments(r: (typeof rows.value)[number]) {
  const a = r.principal.toNumber();
  const b = a + r.simpleInterest.toNumber();
  const c = r.balance.toNumber();
  const gap = 1; // 2px surface gap split between neighbours
  return [
    { key: "p", y0: y(0), y1: y(a), fill: "var(--mogi-n300)" },
    { key: "s", y0: y(a) - gap, y1: y(b), fill: "var(--mogi-teal-deep)" },
    { key: "i", y0: y(b) - gap, y1: y(c), fill: "var(--mogi-turquoise-2)" },
  ].filter((s) => s.y0 - s.y1 > 0.5);
}
const tickEvery = computed(() => (rows.value.length <= 12 ? 1 : rows.value.length <= 24 ? 2 : 5));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">סכום התחלתי</span>
        <input v-model.number="principal" type="range" min="1000" max="100000" step="1000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(principal) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית לשנה</span>
        <input v-model.number="rate" type="range" min="0.5" max="12" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר שנים</span>
        <input v-model.number="years" type="range" min="1" max="40" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years }} שנים</span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">היתרה אחרי {{ years }} שנים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatWholeShekels(last.balance) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">בריבית פשוטה הייתה</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ formatWholeShekels(last.principal.plus(last.simpleInterest)) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההפרש: ריבית על ריבית</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatWholeShekels(last.interestOnInterest) }}</span></p>
        <p class="text-caption text-n600">{{ ioiShare }}% מכל הריבית שנצברה</p>
      </div>
    </div>

    <p class="mt-2 text-caption text-n600">המחוון מעגל לשקל שלם.</p>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>הסכום ההתחלתי</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ריבית על הסכום ההתחלתי</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>ריבית על ריבית</li>
    </ul>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: היתרה בכל שנה, מ־0 עד ${years} שנים`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(0)" :y2="y(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in rows" :key="r.year" @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null" tabindex="0">
          <rect :x="xOf(i) - 1" :y="PAD.top" :width="band" :height="H - PAD.top - PAD.bottom" fill="transparent" />
          <rect
            v-for="s in segments(r)"
            :key="s.key"
            :x="xOf(i)"
            :y="s.y1"
            :width="barW"
            :height="Math.max(0, s.y0 - s.y1)"
            :fill="s.fill"
            :opacity="hover === null || hover === i ? 1 : 0.45"
            rx="2"
          />
        </g>
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="r in rows" :key="r.year">{{ r.year % tickEvery === 0 ? r.year : "" }}</span>
      </div>
      <div
        v-if="hover !== null"
        class="pointer-events-none absolute top-2 start-2 z-tooltip rounded-md border border-n200 bg-n0 p-3 text-caption text-n800 shadow-md"
        role="status"
      >
        <p class="font-semibold text-n900">אחרי {{ rows[hover].year }} שנים: <span class="ltr">{{ formatWholeShekels(rows[hover].balance) }}</span></p>
        <p>סכום התחלתי: <span class="ltr">{{ formatWholeShekels(rows[hover].principal) }}</span></p>
        <p>ריבית על הסכום ההתחלתי: <span class="ltr">{{ formatWholeShekels(rows[hover].simpleInterest) }}</span></p>
        <p>ריבית על ריבית: <span class="ltr">{{ formatWholeShekels(rows[hover].interestOnInterest) }}</span></p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">שנים (מימין לשמאל)</p>
    </div>

    <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">שנה</th>
            <th class="py-2 text-start">יתרה</th>
            <th class="py-2 text-start">ריבית על הסכום ההתחלתי</th>
            <th class="py-2 text-start">ריבית על ריבית</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.year" class="border-b border-n100">
            <td class="py-1">{{ r.year }}</td>
            <td class="py-1"><span class="ltr">{{ formatWholeShekels(r.balance) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatWholeShekels(r.simpleInterest) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatWholeShekels(r.interestOnInterest) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
