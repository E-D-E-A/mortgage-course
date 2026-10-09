<script setup lang="ts">
// The present-value illustration for lesson 0.6: "a pile of payments that shrinks".
// Equal payments at the end of each year; each one is moved back to today on its
// own (discounted) and shrinks the further away it is. Added up, the shrunken
// payments are the present value — shown as a pile beside the plain sum of the
// payments. Every number comes from the calc module.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatShekels, formatShekelsText, formatWholeShekels } from "../lib/calc/money.ts";
import { streamTable } from "../lib/calc/present-value.ts";

const props = withDefaults(defineProps<{ payment?: number; count?: number; rate?: number }>(), {
  payment: 1000,
  count: 10,
  rate: 5,
});

const payment = ref(props.payment);
const count = ref(props.count);
const rate = ref(props.rate);
const showTable = ref(false);
const hover = ref<number | null>(null);

const rows = computed(() => streamTable(payment.value, String(rate.value), count.value));
const total = computed(() => new Decimal(payment.value).mul(count.value));
const present = computed(() => rows.value.reduce((acc, r) => acc.plus(r.valueToday), new Decimal(0)));
const gap = computed(() => total.value.minus(present.value));
const share = (v: Decimal) => `${v.div(total.value).mul(100).toNumber()}%`;

const W = 640;
const H = 200;
const PAD = { top: 10, bottom: 4, side: 8 };
const band = computed(() => (W - PAD.side * 2) / rows.value.length);
const barW = computed(() => Math.max(2, band.value - 2));
const y = (v: number) => H - PAD.bottom - (v / payment.value) * (H - PAD.top - PAD.bottom);
const xOf = (i: number) => W - PAD.side - (i + 1) * band.value + 1;
const tickEvery = computed(() => (rows.value.length <= 12 ? 1 : rows.value.length <= 24 ? 2 : 5));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כל תשלום</span>
        <input v-model.number="payment" type="range" min="100" max="5000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(payment) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר התשלומים (אחד בסוף כל שנה)</span>
        <input v-model.number="count" type="range" min="1" max="30" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ count }} תשלומים</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית לשנה</span>
        <input v-model.number="rate" type="range" min="0" max="10" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">כל התשלומים יחד</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ formatShekelsText(total) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הערך הנוכחי שלהם</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(present) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההפרש</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(gap) }}</span></p>
      </div>
    </div>

    <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>התשלום, כשיגיע</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>כמה הוא שווה היום</li>
    </ul>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: ${count} תשלומים, וכמה כל אחד שווה היום`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(0)" :y2="y(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in rows" :key="r.period" tabindex="0" @mouseenter="hover = i" @mouseleave="hover = null" @focus="hover = i" @blur="hover = null">
          <rect :x="xOf(i) - 1" :y="PAD.top" :width="band" :height="H - PAD.top - PAD.bottom" fill="transparent" />
          <rect :x="xOf(i)" :y="y(payment)" :width="barW" :height="y(0) - y(payment)" fill="var(--mogi-n300)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
          <rect :x="xOf(i)" :y="y(r.valueToday.toNumber())" :width="barW" :height="Math.max(0, y(0) - y(r.valueToday.toNumber()))" fill="var(--mogi-teal-deep)" rx="2" :opacity="hover === null || hover === i ? 1 : 0.45" />
        </g>
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="r in rows" :key="r.period">{{ r.period % tickEvery === 0 || r.period === 1 ? r.period : "" }}</span>
      </div>
      <div
        v-if="hover !== null"
        class="pointer-events-none absolute top-2 start-2 z-tooltip rounded-md border border-n200 bg-n0 p-3 text-caption text-n800 shadow-md"
        role="status"
      >
        <p class="font-semibold text-n900">תשלום {{ rows[hover].period }}, בסוף שנה {{ rows[hover].period }}</p>
        <p>שווה היום: <span class="ltr">{{ formatShekels(rows[hover].valueToday) }}</span></p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">שנים (מימין לשמאל)</p>
    </div>

    <!-- The pile: every payment's value today, stacked from the right, beside the plain sum. -->
    <div class="mt-5 grid gap-2" aria-hidden="true">
      <p class="text-caption font-semibold text-n600">הערימה: כל התשלומים, מול מה שהם שווים היום</p>
      <div class="flex h-6 w-full overflow-hidden rounded-sm bg-n300"></div>
      <div class="flex h-6 w-full gap-px overflow-hidden rounded-sm">
        <span
          v-for="(r, i) in rows"
          :key="r.period"
          class="h-full"
          :style="{ width: share(r.valueToday), background: i % 2 === 0 ? 'var(--mogi-teal-deep)' : 'var(--mogi-turquoise-2)' }"
        ></span>
      </div>
      <p class="text-caption text-n600">הפס העליון: כל התשלומים יחד. הפס התחתון: הערך הנוכחי — כל חלק הוא תשלום אחד, כפי שהוא שווה היום.</p>
    </div>

    <button type="button" class="mt-3 h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">תשלום</th>
            <th class="py-2 text-start">מגיע בסוף שנה</th>
            <th class="py-2 text-start">שווה היום</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.period" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ formatShekels(r.payment) }}</span></td>
            <td class="py-1">{{ r.period }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.valueToday) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
