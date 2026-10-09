<script setup lang="ts">
// The price–yield seesaw (lesson 0.11). The learner moves the market's yield,
// the bond's length and its yearly payment, and sees the price: the present
// value of every payment. The beam is level when the yield equals the bond's
// yearly payment rate (price = face); a higher yield tips the price end down.
// Every number comes from the course's calc module (src/lib/calc/bonds.ts).
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { bondPrice, pricedPayments } from "../lib/calc/bonds.ts";
import { formatShekels } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ face?: number; payment?: number; years?: number; yieldPercent?: number }>(), {
  face: 100,
  payment: 5,
  years: 3,
  yieldPercent: 5,
});

const payment = ref(props.payment);
const years = ref(props.years);
const yieldPercent = ref(props.yieldPercent);
const showTable = ref(false);

const paymentPercent = computed(() => new Decimal(payment.value).div(props.face).mul(100).toString());
const rows = computed(() => pricedPayments(props.face, paymentPercent.value, years.value, String(yieldPercent.value)));
const price = computed(() => bondPrice(props.face, paymentPercent.value, years.value, String(yieldPercent.value)));
const diff = computed(() => price.value.minus(props.face).toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
const relation = computed(() => (diff.value.isZero() ? "בדיוק" : diff.value.gt(0) ? "מעל" : "מתחת ל־"));
const yieldVsPayment = computed(() => {
  const y = new Decimal(yieldPercent.value);
  const p = new Decimal(paymentPercent.value);
  return y.eq(p) ? "שווה לתשלום השנתי" : y.gt(p) ? "גבוהה מהתשלום השנתי" : "נמוכה מהתשלום השנתי";
});

// The beam: up to 16° of tilt. Price above the face lifts the price end (the right, start side in RTL).
const tilt = computed(() => {
  const share = diff.value.div(props.face).toNumber();
  return Math.max(-16, Math.min(16, share * 80));
});

// Bars: each payment (grey, full height) and its present value (teal) on one scale.
const W = 640;
const H = 200;
const PAD = { top: 10, bottom: 4, side: 8 };
const maxPay = computed(() => Math.max(...rows.value.map((r) => r.payment.toNumber()), 1));
const band = computed(() => (W - PAD.side * 2) / rows.value.length);
const barW = computed(() => Math.max(2, band.value * 0.7));
const yOf = (v: number) => H - PAD.bottom - (v / maxPay.value) * (H - PAD.top - PAD.bottom);
// Year 1 at the right edge; time runs leftward, as Hebrew is read.
const xOf = (i: number) => W - PAD.side - (i + 1) * band.value + (band.value - barW.value) / 2;
const tickEvery = computed(() => (rows.value.length <= 12 ? 1 : rows.value.length <= 24 ? 2 : 5));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">התשואה בשוק</span>
        <input v-model.number="yieldPercent" type="range" min="0.5" max="10" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ yieldPercent }}%</span> לשנה</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שנים עד הסוף</span>
        <input v-model.number="years" type="range" min="1" max="30" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years === 1 ? "שנה אחת" : `${years} שנים` }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תשלום בכל שנה</span>
        <input v-model.number="payment" type="range" min="0" max="10" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(payment) }}</span></span>
      </label>
    </div>
    <p class="mt-2 text-caption text-n600">האג״ח מחזירה <span class="ltr">{{ formatShekels(face) }}</span> בסוף, יחד עם התשלום האחרון. מספרים להמחשה; אינם נתוני שוק.</p>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">המחיר של האג״ח היום</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(price) }}</span></p>
        <p class="text-caption text-n600">{{ relation }} <span class="ltr">{{ formatShekels(face) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">התשואה בשוק</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ yieldPercent }}%</span></p>
        <p class="text-caption text-n600">{{ yieldVsPayment }} (<span class="ltr">{{ Number(paymentPercent) }}%</span> מ־<span class="ltr">{{ formatShekels(face) }}</span>)</p>
      </div>
    </div>

    <!-- The seesaw. Labels are HTML, under the drawing, so they stay readable on a phone. -->
    <div class="mt-5">
      <svg viewBox="0 0 640 150" class="w-full" role="img" :aria-label="`נדנדה: המחיר ${formatShekels(price)}, התשואה ${yieldPercent}%`">
        <polygon points="320,92 296,140 344,140" fill="var(--mogi-n300)" />
        <g :transform="`rotate(${-tilt} 320 92)`" style="transition: transform var(--mogi-duration-base) var(--mogi-ease-out)">
          <rect x="60" y="86" width="520" height="12" rx="6" fill="var(--mogi-navy)" />
          <circle cx="560" cy="62" r="24" fill="var(--mogi-teal-deep)" />
          <circle cx="80" cy="62" r="24" fill="var(--mogi-turquoise-2)" />
        </g>
      </svg>
      <div class="grid grid-cols-2 text-center text-body-m">
        <p class="font-semibold text-n900">
          <span class="inline-block h-3 w-3 rounded-full align-middle" style="background: var(--mogi-teal-deep)"></span>
          מחיר: <span class="ltr">{{ formatShekels(price) }}</span>
        </p>
        <p class="font-semibold text-n900">
          <span class="inline-block h-3 w-3 rounded-full align-middle" style="background: var(--mogi-turquoise-2)"></span>
          תשואה: <span class="ltr">{{ yieldPercent }}%</span>
        </p>
      </div>
      <p class="mt-1 text-center text-caption text-n600">הנדנדה מאוזנת כשהתשואה שווה לתשלום השנתי באחוזים. תשואה גבוהה יותר מורידה את המחיר.</p>
    </div>

    <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>התשלום, כפי שיתקבל</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>הערך הנוכחי שלו — כמה הוא שווה היום</li>
    </ul>
    <div class="mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: ${years} תשלומים והערך הנוכחי של כל אחד`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="yOf(0)" :y2="yOf(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <g v-for="(r, i) in rows" :key="r.year">
          <rect :x="xOf(i)" :y="yOf(r.payment.toNumber())" :width="barW" :height="Math.max(0, yOf(0) - yOf(r.payment.toNumber()))" fill="var(--mogi-n300)" rx="2" />
          <rect :x="xOf(i)" :y="yOf(r.presentValue.toNumber())" :width="barW" :height="Math.max(0, yOf(0) - yOf(r.presentValue.toNumber()))" fill="var(--mogi-teal-deep)" rx="2" />
        </g>
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="r in rows" :key="r.year">{{ r.year % tickEvery === 0 || r.year === 1 ? r.year : "" }}</span>
      </div>
      <p class="mt-1 text-center text-caption text-n600">שנה (מימין לשמאל). המחיר הוא סכום החלקים הכהים.</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">שנה</th>
            <th class="py-2 text-start">תשלום</th>
            <th class="py-2 text-start">ערך נוכחי</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.year" class="border-b border-n100">
            <td class="py-1">{{ r.year }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.payment) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.presentValue) }}</span></td>
          </tr>
          <tr class="font-semibold text-n900">
            <td class="py-1" colspan="2">המחיר (הנוסחה, מעוגל פעם אחת בסוף)</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(price) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
