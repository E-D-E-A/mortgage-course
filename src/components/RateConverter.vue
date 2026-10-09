<script setup lang="ts">
// The rate converter for lesson 0.4: "two ways to split a year".
// The learner sets an annual rate and an amount, and sees side by side:
//  - dividing the annual rate by 12 (how a stated annual rate becomes a monthly one),
//    and the effective annual rate that monthly additions then produce;
//  - the twelfth root (the monthly rate that adds up to exactly the annual rate
//    over a year — used when the annual figure is already effective).
// The chart shows the interest gathered month by month under each, against the
// annual rate taken once a year (dashed). Every number comes from the calc module.
import { computed, ref } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { effectiveAnnualRate, growthFactor, periodicRateByDivision, periodicRateFromEffective, roundedString } from "../lib/calc/rates.ts";

const props = withDefaults(defineProps<{ annual?: number; amount?: number }>(), { annual: 6, amount: 10000 });

const annual = ref(props.annual);
const amount = ref(props.amount);
const showTable = ref(false);
const hover = ref<number | null>(null);

const rateText = computed(() => roundedString(String(annual.value), 2));
const byDivision = computed(() => periodicRateByDivision(rateText.value));
const byRoot = computed(() => periodicRateFromEffective(rateText.value));
const effective = computed(() => effectiveAnnualRate(rateText.value));

const rows = computed(() =>
  Array.from({ length: 13 }, (_, n) => ({
    month: n,
    division: growthFactor(byDivision.value, n).minus(1).mul(amount.value),
    root: growthFactor(byRoot.value, n).minus(1).mul(amount.value),
  })),
);
const months = computed(() => rows.value.slice(1));
const onceAYear = computed(() => growthFactor(rateText.value, 1).minus(1).mul(amount.value));

// Chart geometry (viewBox units). Month 1 is at the right edge and time runs leftward, as Hebrew is read.
const W = 640;
const H = 240;
const PAD = { top: 12, bottom: 4, side: 8 };
const max = computed(() => months.value[11].division.toNumber() || 1);
const band = (W - PAD.side * 2) / 12;
const barW = (band - 6) / 2;
const y = (v: number) => H - PAD.bottom - (v / max.value) * (H - PAD.top - PAD.bottom);
const xOf = (i: number) => W - PAD.side - (i + 1) * band + 3;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית שנתית</span>
        <input v-model.number="annual" type="range" min="0.5" max="12" step="0.1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rateText }}%</span> לשנה</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">סכום</span>
        <input v-model.number="amount" type="range" min="1000" max="100000" step="1000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(amount) }}</span></span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption font-semibold text-n700">דרך 1: חלוקה ב־12</p>
        <p class="mt-1 text-caption text-n600">ריבית חודשית</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ roundedString(byDivision, 4) }}%</span></p>
        <p class="mt-1 text-caption text-n600">מצטבר בשנה (הריבית האפקטיבית)</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ roundedString(effective, 2) }}%</span></p>
        <p class="text-caption text-n600">סכום הסכום הריבית אחרי 12 חודשים: <span class="ltr">{{ formatShekels(months[11].division) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption font-semibold text-n700">דרך 2: השורש ה־12</p>
        <p class="mt-1 text-caption text-n600">ריבית חודשית</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ roundedString(byRoot, 4) }}%</span></p>
        <p class="mt-1 text-caption text-n600">מצטבר בשנה</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ rateText }}%</span></p>
        <p class="text-caption text-n600">סכום הסכום הריבית אחרי 12 חודשים: <span class="ltr">{{ formatShekels(months[11].root) }}</span></p>
      </div>
    </div>

    <p class="mt-2 text-caption text-n600">הריביות מעוגלות להצגה בלבד. החישוב נעשה בלי לעגל.</p>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ריבית שנצברה — חלוקה ב־12</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>ריבית שנצברה — השורש ה־12</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-2 border-dashed border-navy"></span>הריבית השנתית, פעם אחת בשנה</li>
    </ul>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: הריבית שנצברה בכל חודש, בשתי הדרכים, לאורך 12 חודשים`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(0)" :y2="y(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in months" :key="r.month" tabindex="0" @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null">
          <rect :x="xOf(i) - 3" :y="PAD.top" :width="band" :height="H - PAD.top - PAD.bottom" fill="transparent" />
          <rect :x="xOf(i) + barW" :y="y(r.division.toNumber())" :width="barW - 1" :height="Math.max(0, y(0) - y(r.division.toNumber()))" fill="var(--mogi-teal-deep)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
          <rect :x="xOf(i)" :y="y(r.root.toNumber())" :width="barW - 1" :height="Math.max(0, y(0) - y(r.root.toNumber()))" fill="var(--mogi-turquoise-2)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
        </g>
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(onceAYear.toNumber())" :y2="y(onceAYear.toNumber())" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="6 5" />
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="r in months" :key="r.month">{{ r.month }}</span>
      </div>
      <div
        v-if="hover !== null"
        class="pointer-events-none absolute top-2 start-2 z-tooltip rounded-md border border-n200 bg-n0 p-3 text-caption text-n800 shadow-md"
        role="status"
      >
        <p class="font-semibold text-n900">אחרי {{ months[hover].month }} חודשים</p>
        <p>חלוקה ב־12: <span class="ltr">{{ formatShekels(months[hover].division) }}</span></p>
        <p>השורש ה־12: <span class="ltr">{{ formatShekels(months[hover].root) }}</span></p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">חודשים (מימין לשמאל)</p>
    </div>

    <button type="button" class="mt-3 h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">חודש</th>
            <th class="py-2 text-start">ריבית שנצברה — חלוקה ב־12</th>
            <th class="py-2 text-start">ריבית שנצברה — השורש ה־12</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in months" :key="r.month" class="border-b border-n100">
            <td class="py-1">{{ r.month }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.division) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.root) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
