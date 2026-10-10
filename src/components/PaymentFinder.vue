<script setup lang="ts">
// "מצא את ההחזר שמאפס את החוב" (lesson 3.1). The learner picks a loan and moves
// one payment, the same every month; the course's calc module runs the months
// (each month's interest rounded to the agora, like a statement) and shows what
// is left after the last payment: still owed, overpaid, or the payment that
// brings the debt to zero up to the rounding. Every number comes from
// src/lib/calc/amortization.ts.
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { annuityPayment, monthlyRate, paymentTrial } from "../lib/calc/amortization.ts";
import { formatShekels, formatWholeShekels, toAgorot } from "../lib/calc/money.ts";

interface Loan {
  label: string;
  principal: string;
  /** Nominal annual rate in percent. */
  rate: string;
  months: number;
}
const props = defineProps<{ loans: Loan[] }>();

const which = ref(0);
const loan = computed(() => props.loans[which.value]);
const target = computed(() => toAgorot(annuityPayment(loan.value.principal, loan.value.rate, loan.value.months)));
const monthly = computed(() => monthlyRate(loan.value.rate).toString());

// The payment's range: P ÷ n is always too little (no interest at all), P ÷ n + P × m always too much.
const low = computed(() => new Decimal(loan.value.principal).div(loan.value.months).toDecimalPlaces(0, Decimal.ROUND_FLOOR));
const high = computed(() =>
  new Decimal(loan.value.principal)
    .div(loan.value.months)
    .plus(new Decimal(loan.value.principal).mul(monthly.value).div(100))
    .toDecimalPlaces(0, Decimal.ROUND_CEIL),
);
const payment = ref(low.value.toNumber());
const typed = ref(low.value.toFixed(2));
watch(which, () => {
  payment.value = low.value.toNumber();
  typed.value = low.value.toFixed(2);
});
const clampPay = (v: number) => Math.min(high.value.toNumber(), Math.max(low.value.toNumber(), Math.round(v * 100) / 100));
function setPayment(v: number) {
  payment.value = clampPay(v);
  typed.value = payment.value.toFixed(2);
}
function fromSlider(e: Event) {
  setPayment(Number((e.target as HTMLInputElement).value));
}
const typedError = ref("");
function fromTyped() {
  const v = Number(typed.value.replace(/[₪,\s]/g, ""));
  if (!Number.isFinite(v) || typed.value.trim() === "") {
    typedError.value = "כתבו מספר, למשל 1015.5";
    return;
  }
  typedError.value = v < low.value.toNumber() || v > high.value.toNumber() ? `התשלום כאן בין ${formatWholeShekels(low.value)} ל־${formatWholeShekels(high.value)}.` : "";
  setPayment(v);
}

const rows = computed(() => paymentTrial(loan.value.principal, loan.value.rate, payment.value.toFixed(2), loan.value.months));
const last = computed(() => rows.value[rows.value.length - 1].closing);
const state = computed(() => {
  const p = new Decimal(payment.value.toFixed(2));
  if (p.eq(target.value)) return "hit";
  return p.lt(target.value) ? "low" : "high";
});

// ── The balance chart: month 0 at the right, the last month at the left. ──
const W = 640;
const H = 200;
const PAD = 8;
const yMax = computed(() => Number(loan.value.principal));
const yMin = computed(() => Math.min(0, ...rows.value.map((r) => r.closing.toNumber())));
const xAt = (k: number) => W - PAD - (k / loan.value.months) * (W - 2 * PAD);
const yAt = (v: number) => PAD + ((yMax.value - v) / (yMax.value - yMin.value || 1)) * (H - 2 * PAD);
const line = computed(() => [`${xAt(0)},${yAt(yMax.value)}`, ...rows.value.map((r) => `${xAt(r.month)},${yAt(r.closing.toNumber())}`)].join(" "));
const dots = computed(() => (loan.value.months <= 12 ? rows.value.map((r) => ({ x: xAt(r.month), y: yAt(r.closing.toNumber()) })) : []));
const lastPoint = computed(() => ({ x: xAt(loan.value.months), y: yAt(last.value.toNumber()) }));

// The months shown in the table: all of a short loan; the first three and the last two of a long one.
const shown = computed(() => {
  const n = rows.value.length;
  if (n <= 12) return rows.value.map((r) => ({ r, gapBefore: false }));
  return [0, 1, 2, n - 2, n - 1].map((i, j) => ({ r: rows.value[i], gapBefore: j === 3 }));
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap gap-2" role="group" aria-label="איזו הלוואה">
      <button
        v-for="(l, i) in loans"
        :key="l.label"
        type="button"
        class="min-h-11 rounded-md border px-3 text-body-m"
        :class="which === i ? 'border-navy bg-n100 font-semibold text-navy' : 'border-n200 text-n700 hover:bg-n50'"
        :aria-pressed="which === i"
        @click="which = i"
      >
        {{ l.label }}
      </button>
    </div>
    <p class="mt-3 text-body-m text-n700">
      הלוואה של <span class="ltr font-semibold text-n900">{{ formatWholeShekels(loan.principal) }}</span>, ב־<span class="ltr">{{ loan.rate }}%</span> לשנה
      (<span class="ltr">{{ monthly }}%</span> לחודש), ל־<span class="ltr">{{ loan.months }}</span> חודשים. בכל חודש אותו תשלום.
    </p>

    <!-- The payment: slider, a typed amount, and steps of a shekel and an agora. -->
    <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">התשלום בכל חודש</span>
        <input
          type="range"
          :min="low.toNumber()"
          :max="high.toNumber()"
          step="0.01"
          :value="payment"
          aria-label="התשלום בכל חודש"
          @input="fromSlider"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">או כתבו סכום (₪)</span>
        <input
          v-model="typed"
          inputmode="decimal"
          autocomplete="off"
          dir="ltr"
          aria-label="התשלום בכל חודש, בשקלים"
          class="h-11 w-full rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none transition-shadow duration-fast ease-out focus:border-turquoise-2 focus:shadow-ring-input sm:w-40"
          @change="fromTyped"
          @keydown.enter.prevent="fromTyped"
        />
      </label>
    </div>
    <p v-if="typedError" class="mt-1 text-caption text-n700">{{ typedError }}</p>
    <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="צעדים קטנים">
      <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50" @click="setPayment(payment - 1)">−1 ₪</button>
      <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50" @click="setPayment(payment + 1)">+1 ₪</button>
      <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50" @click="setPayment(payment - 0.01)">−אגורה</button>
      <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50" @click="setPayment(payment + 0.01)">+אגורה</button>
    </div>

    <!-- What is left after the last payment. -->
    <div aria-live="polite" class="mt-4 rounded-md p-4" :class="state === 'hit' ? 'bg-success-bg' : 'bg-n50'">
      <p class="text-body-m text-n700">
        תשלום של <span class="ltr font-semibold text-n900">{{ formatShekels(payment) }}</span> בכל חודש. אחרי התשלום האחרון:
      </p>
      <p class="mt-1 text-body-l font-semibold text-n900">
        <template v-if="last.gt(0)">נשאר חוב של <span class="ltr">{{ formatShekels(last) }}</span></template>
        <template v-else-if="last.lt(0)">שילמתם <span class="ltr">{{ formatShekels(last.abs()) }}</span> יותר מדי</template>
        <template v-else>החוב הוא אפס בדיוק</template>
      </p>
      <p class="mt-1 text-body-m text-n800">
        <template v-if="state === 'low'">התשלום קטן מדי: הוא לא מספיק לריבית ולכל הקרן. נסו יותר.</template>
        <template v-else-if="state === 'high'">התשלום גדול מדי: החוב נגמר לפני הסוף. נסו פחות.</template>
        <template v-else>
          זה התשלום. מה שנשאר (<span class="ltr">{{ formatShekels(last.abs()) }}</span>) הוא העיגול לאגורה; בלוח סילוקין, התשלום האחרון סוגר אותו.
        </template>
      </p>
    </div>

    <!-- The balance, month by month. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">היתרה בסוף כל חודש</h3>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2">
        <svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-teal-deep)" stroke-width="3" /></svg>היתרה
      </li>
      <li class="flex items-center gap-2">
        <svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="5 3" /></svg>אפס: אין חוב
      </li>
    </ul>
    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-2 w-full" role="img" :aria-label="`היתרה בסוף כל חודש, מ־${formatWholeShekels(loan.principal)} עד ${formatShekels(last)}. המספרים בטבלה למטה.`">
      <line :x1="PAD" :x2="W - PAD" :y1="yAt(0)" :y2="yAt(0)" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="6 4" />
      <polyline :points="line" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" stroke-linejoin="round" />
      <circle v-for="(d, i) in dots" :key="i" :cx="d.x" :cy="d.y" r="5" fill="var(--mogi-teal-deep)" />
      <circle :cx="lastPoint.x" :cy="lastPoint.y" r="7" fill="var(--mogi-n0)" stroke="var(--mogi-navy)" stroke-width="3" />
    </svg>
    <div class="flex justify-between text-caption text-n600" aria-hidden="true">
      <span>היום</span><span>החודש האחרון</span>
    </div>

    <!-- The months, read out exactly: a table from 640px, one card per month below it. -->
    <p class="mt-4 text-caption text-n600">{{ rows.length <= 12 ? "כל החודשים:" : "שלושת החודשים הראשונים ושני האחרונים:" }}</p>
    <table class="mt-1 hidden w-full border-collapse text-body-m sm:table">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th class="py-2 text-start font-semibold">חודש</th>
          <th class="py-2 text-start font-semibold">יתרה בתחילת החודש</th>
          <th class="py-2 text-start font-semibold">ריבית החודש</th>
          <th class="py-2 text-start font-semibold">התשלום</th>
          <th class="py-2 text-start font-semibold">יתרה בסוף החודש</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="s in shown" :key="s.r.month">
          <tr v-if="s.gapBefore"><td colspan="5" class="py-1 text-n600">…</td></tr>
          <tr class="border-b border-n100">
            <td class="py-1.5 text-n700">{{ s.r.month }}</td>
            <td class="py-1.5"><span class="ltr">{{ formatShekels(s.r.opening) }}</span></td>
            <td class="py-1.5"><span class="ltr">{{ formatShekels(s.r.interest) }}</span></td>
            <td class="py-1.5"><span class="ltr">{{ formatShekels(s.r.payment) }}</span></td>
            <td class="py-1.5 font-semibold text-n900"><span class="ltr">{{ formatShekels(s.r.closing) }}</span></td>
          </tr>
        </template>
      </tbody>
    </table>
    <ul class="list-reset mt-1 grid gap-2 sm:hidden">
      <template v-for="s in shown" :key="s.r.month">
        <li v-if="s.gapBefore" class="text-n600" aria-hidden="true">…</li>
        <li class="rounded-md border border-n200 p-3">
          <p class="text-body-m font-semibold text-n900">חודש {{ s.r.month }}</p>
          <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
            <dt>יתרה בתחילת החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(s.r.opening) }}</span></dd>
            <dt>ריבית החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(s.r.interest) }}</span></dd>
            <dt>התשלום</dt><dd class="text-end"><span class="ltr">{{ formatShekels(s.r.payment) }}</span></dd>
            <dt class="font-semibold text-n900">יתרה בסוף החודש</dt><dd class="text-end font-semibold text-n900"><span class="ltr">{{ formatShekels(s.r.closing) }}</span></dd>
          </dl>
        </li>
      </template>
    </ul>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" @click="setPayment(target.toNumber())">
      הראו לי את התשלום
    </button>
  </div>
</template>
