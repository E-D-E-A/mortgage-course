<script setup lang="ts">
// Lesson 0.8's illustration, "השפעת אינפלציה ומדד" (required by the brief).
// The learner sets a yearly inflation, a number of years and an amount, and
// sees a debt with no interest and no payments, once indexed and once not.
// A switch shows the same two debts in today's shekels (real), not only in
// the shekels written on paper (nominal). Every number comes from indexation.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { indexedBalance, realValue } from "../lib/calc/indexation.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ amount?: number; inflation?: number; years?: number }>(), {
  amount: 100000,
  inflation: 3,
  years: 10,
});

const amount = ref(props.amount);
const inflation = ref(props.inflation);
const years = ref(props.years);
const real = ref(false);
const showTable = ref(false);
const hover = ref<number | null>(null);

// Nominal: the indexed debt grows, the unindexed one stays. Real (today's shekels):
// the indexed debt stays, the unindexed one shrinks.
const rows = computed(() =>
  Array.from({ length: years.value + 1 }, (_, n) => {
    const a = new Decimal(amount.value);
    const indexed = indexedBalance(a, String(inflation.value), n);
    return real.value
      ? { year: n, indexed: a, unindexed: realValue(a, String(inflation.value), n) }
      : { year: n, indexed, unindexed: a };
  }),
);
const last = computed(() => rows.value[rows.value.length - 1]);

const W = 640;
const H = 260;
const PAD = { top: 16, bottom: 6, side: 8 };
const max = computed(() => Decimal.max(...rows.value.map((r) => Decimal.max(r.indexed, r.unindexed))).mul(1.05).toNumber());
const band = computed(() => (W - PAD.side * 2) / rows.value.length);
const barW = computed(() => Math.max(1.5, band.value / 2 - 1.5));
const y = (v: Decimal) => H - PAD.bottom - (v.toNumber() / max.value) * (H - PAD.top - PAD.bottom);
// Year 0 at the right edge; time runs leftward, as Hebrew is read.
const xOf = (i: number) => W - PAD.side - (i + 1) * band.value + 1;
const tickEvery = computed(() => (rows.value.length <= 12 ? 1 : rows.value.length <= 24 ? 2 : 5));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה: חוב בלי ריבית ובלי תשלומים, ואינפלציה קבועה בכל שנה. זו לא תחזית.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">החוב בהתחלה</span>
        <input v-model.number="amount" type="range" min="10000" max="500000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(amount) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">אינפלציה בכל שנה</span>
        <input v-model.number="inflation" type="range" min="0" max="10" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ inflation }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר שנים</span>
        <input v-model.number="years" type="range" min="1" max="30" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years }} שנים</span>
      </label>
    </div>

    <div class="mt-4 inline-flex rounded-md border border-n200 p-1" role="group" aria-label="איך מודדים">
      <button
        type="button"
        class="min-h-11 rounded-sm px-4 text-body-m"
        :class="!real ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="!real"
        @click="real = false"
      >
        בשקלים שעל הנייר (נומינלי)
      </button>
      <button
        type="button"
        class="min-h-11 rounded-sm px-4 text-body-m"
        :class="real ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="real"
        @click="real = true"
      >
        בשקלים של היום (ריאלי)
      </button>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">חוב מוצמד למדד, אחרי {{ years }} שנים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatWholeShekels(last.indexed) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">חוב שלא מוצמד, אחרי {{ years }} שנים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatWholeShekels(last.unindexed) }}</span></p>
      </div>
    </div>
    <p class="mt-2 text-caption text-n600">
      {{ real ? "בשקלים של היום: כמה הסכום שווה בכוח קנייה, במחירים של היום." : "בשקלים שעל הנייר: כמה שקלים תחזירו בפועל." }} המחוון מעגל לשקל שלם.
    </p>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>חוב מוצמד</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>חוב לא מוצמד</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-4" style="border-top: 2px dashed var(--mogi-navy)"></span>החוב בהתחלה</li>
    </ul>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: שני החובות בכל שנה, מ־0 עד ${years} שנים`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(new Decimal(0))" :y2="y(new Decimal(0))" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in rows" :key="r.year" tabindex="0" @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null">
          <rect :x="xOf(i) - 1" :y="PAD.top" :width="band" :height="H - PAD.top - PAD.bottom" fill="transparent" />
          <rect :x="xOf(i) + barW + 1" :y="y(r.indexed)" :width="barW" :height="Math.max(0, y(new Decimal(0)) - y(r.indexed))" fill="var(--mogi-teal-deep)" rx="1.5" :opacity="hover === null || hover === i ? 1 : 0.45" />
          <rect :x="xOf(i)" :y="y(r.unindexed)" :width="barW" :height="Math.max(0, y(new Decimal(0)) - y(r.unindexed))" fill="var(--mogi-turquoise-2)" rx="1.5" :opacity="hover === null || hover === i ? 1 : 0.45" />
        </g>
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(new Decimal(amount))" :y2="y(new Decimal(amount))" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="6 5" />
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="r in rows" :key="r.year">{{ r.year % tickEvery === 0 ? r.year : "" }}</span>
      </div>
      <div v-if="hover !== null" class="pointer-events-none absolute top-2 start-2 z-tooltip rounded-md border border-n200 bg-n0 p-3 text-caption text-n800 shadow-md" role="status">
        <p class="font-semibold text-n900">אחרי {{ rows[hover].year }} שנים</p>
        <p>מוצמד: <span class="ltr">{{ formatWholeShekels(rows[hover].indexed) }}</span></p>
        <p>לא מוצמד: <span class="ltr">{{ formatWholeShekels(rows[hover].unindexed) }}</span></p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">שנים (מימין לשמאל)</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">שנה</th>
            <th class="py-2 text-start">חוב מוצמד</th>
            <th class="py-2 text-start">חוב לא מוצמד</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.year" class="border-b border-n100">
            <td class="py-1">{{ r.year }}</td>
            <td class="py-1"><span class="ltr">{{ formatWholeShekels(r.indexed) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatWholeShekels(r.unindexed) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
