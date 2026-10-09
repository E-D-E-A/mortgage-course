<script setup lang="ts">
// The time-value illustration for lesson 0.5: "how much is 1,000 ₪ in X years
// worth today?". Two banknotes on a timeline — the amount that arrives later,
// and what it is worth today — and, below, the same amount arriving after
// each number of years, shrinking the further away it is. The rate is what
// money could earn meanwhile. Every number comes from the calc module.
import { computed, ref } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { valueToday } from "../lib/calc/present-value.ts";

const props = withDefaults(defineProps<{ amount?: number; rate?: number; years?: number }>(), {
  amount: 1000,
  rate: 5,
  years: 10,
});

const amount = ref(props.amount);
const rate = ref(props.rate);
const years = ref(props.years);
const showTable = ref(false);
const hover = ref<number | null>(null);

const rateText = computed(() => String(rate.value));
const rows = computed(() =>
  Array.from({ length: years.value + 1 }, (_, n) => ({ year: n, today: valueToday(amount.value, rateText.value, n) })),
);
const today = computed(() => rows.value[rows.value.length - 1].today);
const lost = computed(() => today.value.minus(amount.value).neg());
// The banknotes' areas are in proportion to their values.
const noteScale = computed(() => Math.sqrt(today.value.div(amount.value).toNumber()));

const W = 640;
const H = 220;
const PAD = { top: 10, bottom: 4, side: 8 };
const band = computed(() => (W - PAD.side * 2) / rows.value.length);
const barW = computed(() => Math.max(2, band.value - 2));
const y = (v: number) => H - PAD.bottom - (v / amount.value) * (H - PAD.top - PAD.bottom);
const xOf = (i: number) => W - PAD.side - (i + 1) * band.value + 1;
const tickEvery = computed(() => (rows.value.length <= 12 ? 1 : rows.value.length <= 24 ? 2 : 5));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הסכום שיגיע</span>
        <input v-model.number="amount" type="range" min="100" max="10000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(amount) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">בעוד כמה שנים</span>
        <input v-model.number="years" type="range" min="0" max="30" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years }} שנים</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית שאפשר לקבל בינתיים, לשנה</span>
        <input v-model.number="rate" type="range" min="0" max="10" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
    </div>

    <!-- Two banknotes on a timeline: today on the right, later on the left. -->
    <div class="mt-6 flex items-center justify-between gap-3" aria-hidden="true">
      <div class="flex flex-1 flex-col items-center gap-2">
        <div class="flex h-28 w-full items-center justify-center">
          <div
            class="flex items-center justify-center rounded-md border-2 border-teal-deep bg-mint/50"
            :style="{ width: `${Math.max(28, 160 * noteScale)}px`, height: `${Math.max(16, 84 * noteScale)}px` }"
          ></div>
        </div>
        <p class="text-caption font-semibold text-n600">שווה היום</p>
      </div>
      <div class="flex w-24 flex-col items-center gap-1 text-caption text-n600">
        <span class="block w-full border-t-2 border-dashed border-n400"></span>
        <span>{{ years }} שנים</span>
      </div>
      <div class="flex flex-1 flex-col items-center gap-2">
        <div class="flex h-28 w-full items-center justify-center">
          <div class="rounded-md border-2 border-n400 bg-n100" style="width: 160px; height: 84px"></div>
        </div>
        <p class="text-caption font-semibold text-n600">מגיע בעוד {{ years }} שנים</p>
      </div>
    </div>

    <div class="mt-3 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">שווה היום</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(today) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">מגיע בעוד {{ years }} שנים</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ formatShekels(amount) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההפרש: מה שאפשר היה להרוויח בינתיים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(lost) }}</span></p>
      </div>
    </div>

    <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>הסכום שיגיע</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>כמה הוא שווה היום</li>
    </ul>
    <p class="mt-1 text-caption text-n600">כל עמודה: אותו סכום, אם הוא מגיע אחרי מספר השנים שמתחתיה.</p>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: כמה שווה היום הסכום, אם הוא מגיע אחרי 0 עד ${years} שנים`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(0)" :y2="y(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in rows" :key="r.year" tabindex="0" @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null">
          <rect :x="xOf(i) - 1" :y="PAD.top" :width="band" :height="H - PAD.top - PAD.bottom" fill="transparent" />
          <rect :x="xOf(i)" :y="y(amount)" :width="barW" :height="y(0) - y(amount)" fill="var(--mogi-n300)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
          <rect :x="xOf(i)" :y="y(r.today.toNumber())" :width="barW" :height="Math.max(0, y(0) - y(r.today.toNumber()))" fill="var(--mogi-teal-deep)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
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
        <p class="font-semibold text-n900">מגיע בעוד {{ rows[hover].year }} שנים</p>
        <p>שווה היום: <span class="ltr">{{ formatShekels(rows[hover].today) }}</span></p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">בעוד כמה שנים (מימין לשמאל)</p>
    </div>

    <button type="button" class="mt-3 h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">בעוד כמה שנים</th>
            <th class="py-2 text-start">שווה היום</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.year" class="border-b border-n100">
            <td class="py-1">{{ r.year }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.today) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
