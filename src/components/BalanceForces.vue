<script setup lang="ts">
// Lesson 2.11's illustration, "פירוק השינוי בחוב" (course map, stage 2).
// One debt balance, one year, and the forces that move it, each on its own
// row: indexation (the balance itself grows), interest at the old rate, the
// extra interest a rate change brings, the interest charged on the indexation
// addition, and the payment. The rows add up to the year's change. The model
// is the lesson's yearly one (src/lib/calc/balance.ts); every number comes from it.
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { yearParts } from "../lib/calc/balance.ts";
import { formatShekelsText, formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(
  defineProps<{ balance?: number; rate?: number; rateChange?: number; indexed?: boolean; inflation?: number; payment?: number }>(),
  { balance: 500000, rate: 3, rateChange: 0, indexed: true, inflation: 2, payment: 30000 },
);

const balance = ref(props.balance);
const rate = ref(props.rate);
const change = ref(props.rateChange);
const indexed = ref(props.indexed);
const inflation = ref(props.inflation);
const payment = ref(props.payment);
const showTable = ref(false);

// The rate after the change never goes below 0: the change's slider starts at −rate.
const changeMin = computed(() => Math.max(-2, -rate.value));
watch(rate, () => {
  if (change.value < changeMin.value) change.value = changeMin.value;
});
// The payment never exceeds the balance, so the year never ends below zero.
const paymentMax = computed(() => Math.min(120000, balance.value));
watch(balance, () => {
  if (payment.value > paymentMax.value) payment.value = paymentMax.value;
});

const parts = computed(() =>
  yearParts({
    balance: balance.value,
    ratePercent: String(rate.value),
    newRatePercent: new Decimal(rate.value).plus(change.value).toString(),
    inflationPercent: indexed.value ? String(inflation.value) : "0",
    payment: payment.value,
  }),
);
const newRate = computed(() => new Decimal(rate.value).plus(change.value).toString());

// Shekels with agorot only when there are any; a sign for the rows.
const money = (v: Decimal) => formatShekelsText(v.abs());
const signed = (v: Decimal) => (v.isZero() ? formatShekelsText(0) : `${v.isNeg() ? "−" : "+"}${money(v)}`);
const signedPoints = (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v)}`);

interface Row {
  key: string;
  label: string;
  note: string;
  value: Decimal;
  /** A Tailwind/CSS background for the bar. */
  fill: string;
}
const STRIPES = "repeating-linear-gradient(135deg, var(--mogi-teal-deep) 0 6px, var(--mogi-turquoise-2) 6px 12px)";
const rows = computed<Row[]>(() => {
  const p = parts.value;
  const r: Row[] = [];
  if (indexed.value)
    r.push({ key: "idx", label: "הצמדה", note: "היתרה עצמה גדלה עם המדד", value: p.indexation, fill: "var(--mogi-teal-deep)" });
  r.push({ key: "base", label: `ריבית של ${rate.value}%`, note: "על היתרה בתחילת השנה", value: p.interestBase, fill: "var(--mogi-turquoise-2)" });
  if (change.value !== 0)
    r.push({ key: "chg", label: "ריבית מהשינוי בריבית", note: `${signedPoints(change.value)} נקודות אחוז, על היתרה בתחילת השנה`, value: p.interestFromChange, fill: "var(--mogi-turquoise-2)" });
  if (indexed.value)
    r.push({ key: "x", label: "ריבית על תוספת ההצמדה", note: "של שני הכוחות יחד", value: p.interestOnIndexation, fill: STRIPES });
  r.push({ key: "pay", label: "התשלום", note: "בסוף השנה", value: p.payment.neg(), fill: "var(--mogi-n300)" });
  return r;
});

// The waterfall: each row starts where the one above it ended. The axis runs
// from the lowest to the highest running total, with 0 (no change) on it.
const steps = computed(() => {
  let run = new Decimal(0);
  return rows.value.map((row) => {
    const from = run;
    run = run.plus(row.value);
    return { ...row, from, to: run };
  });
});
const bounds = computed(() => {
  const all = [new Decimal(0), ...steps.value.flatMap((s) => [s.from, s.to])];
  const lo = Decimal.min(...all);
  const hi = Decimal.max(...all);
  return { lo, span: hi.minus(lo).isZero() ? new Decimal(1) : hi.minus(lo) };
});
const pos = (v: Decimal) => v.minus(bounds.value.lo).div(bounds.value.span).mul(100).toNumber();
const bar = (a: Decimal, b: Decimal) => {
  const s = Math.min(pos(a), pos(b));
  return { insetInlineStart: `${s}%`, width: `${Math.max(0.6, Math.abs(pos(b) - pos(a)))}%` };
};
const zeroAt = computed(() => `${pos(new Decimal(0))}%`);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">מספרים להמחשה, לא נתוני שוק. מודל של שנה אחת: קודם הצמדה, אחר כך ריבית על היתרה המוצמדת, ותשלום אחד בסוף השנה.</p>

    <div class="mt-3 inline-flex rounded-md border border-n200 p-1" role="group" aria-label="סוג המסלול">
      <button
        type="button"
        class="min-h-11 rounded-sm px-4 text-body-m"
        :class="!indexed ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="!indexed"
        @click="indexed = false"
      >
        מסלול לא צמוד
      </button>
      <button
        type="button"
        class="min-h-11 rounded-sm px-4 text-body-m"
        :class="indexed ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
        :aria-pressed="indexed"
        @click="indexed = true"
      >
        מסלול צמוד
      </button>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">יתרת החוב בתחילת השנה</span>
        <input v-model.number="balance" type="range" min="100000" max="1000000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(balance) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">אחוז הריבית בתחילת השנה</span>
        <input v-model.number="rate" type="range" min="0" max="8" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span> לשנה</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הריבית זזה בתחילת השנה ב־</span>
        <input v-model.number="change" type="range" :min="changeMin" max="3" step="0.25" />
        <span class="text-body-l font-semibold text-n900">
          <span class="ltr">{{ signedPoints(change) }}</span> נקודות אחוז<span v-if="change !== 0" class="text-body-m font-normal text-n700"> · מעכשיו <span class="ltr">{{ newRate }}%</span></span>
        </span>
      </label>
      <label v-if="indexed" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">המדד עלה השנה ב־</span>
        <input v-model.number="inflation" type="range" min="-2" max="8" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ inflation }}%</span></span>
      </label>
      <div v-else class="flex flex-col justify-center rounded-md bg-n50 p-3 text-body-m text-n700">במסלול לא צמוד המדד לא משנה את היתרה.</div>
      <label class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-caption font-semibold text-n600">התשלום השנה (סך כל התשלומים בשנה)</span>
        <input v-model.number="payment" type="range" min="0" :max="paymentMax" step="1000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(payment) }}</span></span>
      </label>
    </div>

    <!-- The two moments: the day each force arrives. -->
    <ul class="list-reset mt-4 grid gap-2 text-body-m text-n800">
      <li v-if="change !== 0" class="rounded-md bg-n50 p-3">
        <strong class="text-n900">ביום שהריבית זזה</strong> היתרה לא זזה: עדיין <span class="ltr">{{ money(parts.opening) }}</span>. השינוי מגיע דרך הריבית של השנה.
      </li>
      <li v-if="indexed && inflation !== 0" class="rounded-md bg-n50 p-3">
        <strong class="text-n900">כשהמדד מתפרסם</strong> היתרה עצמה זזה: <span class="ltr">{{ money(parts.opening.plus(parts.indexation)) }}</span> במקום <span class="ltr">{{ money(parts.opening) }}</span>.
      </li>
    </ul>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">היתרה בתחילת השנה</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ money(parts.opening) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">היתרה בסוף השנה</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ money(parts.closing) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">השינוי ביתרה</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ signed(parts.change) }}</span></p>
      </div>
    </div>
    <p class="mt-2 text-body-m text-n800" aria-live="polite">
      <template v-if="parts.principalPaid.gt(0)">
        מתוך <span class="ltr">{{ money(parts.payment) }}</span> ששילמתם, רק <span class="ltr">{{ money(parts.principalPaid) }}</span> הורידו את היתרה. השאר כיסה את הריבית<template v-if="indexed && !parts.indexation.isZero()"> ואת ההצמדה</template>.
      </template>
      <template v-else-if="parts.principalPaid.isZero()">התשלום כיסה בדיוק את הריבית<template v-if="indexed && !parts.indexation.isZero()"> ואת ההצמדה</template>: היתרה לא ירדה בכלל.</template>
      <template v-else>
        התשלום לא כיסה את הריבית<template v-if="indexed && !parts.indexation.isZero()"> ואת ההצמדה</template>: היתרה <strong>גדלה</strong> ב־<span class="ltr">{{ money(parts.change) }}</span>, למרות ששילמתם.
      </template>
    </p>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-teal-deep)"></span>הצמדה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>ריבית</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" :style="{ background: STRIPES }"></span>ריבית על ההצמדה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-n300)"></span>תשלום</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-0" style="border-inline-start: 2px dashed var(--mogi-navy)"></span>אין שינוי</li>
    </ul>

    <!-- The waterfall: each force on its own row, starting where the one above ended. -->
    <ol class="list-reset mt-3 grid gap-3" aria-label="פירוק השינוי ביתרה">
      <li v-for="s in steps" :key="s.key">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3">
          <span class="text-body-m font-semibold text-n900">{{ s.label }} <span class="text-caption font-normal text-n600">· {{ s.note }}</span></span>
          <span class="ltr text-body-m font-semibold text-n900">{{ signed(s.value) }}</span>
        </div>
        <div class="relative mt-1 h-6 rounded-sm bg-n50" aria-hidden="true">
          <span class="absolute inset-y-0 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: zeroAt }"></span>
          <span class="absolute inset-y-1 rounded-sm" :style="{ ...bar(s.from, s.to), background: s.fill }"></span>
        </div>
      </li>
      <li>
        <div class="flex flex-wrap items-baseline justify-between gap-x-3">
          <span class="text-body-m font-semibold text-n900">השינוי ביתרה <span class="text-caption font-normal text-n600">· הכול יחד</span></span>
          <span class="ltr text-body-m font-semibold text-navy">{{ signed(parts.change) }}</span>
        </div>
        <div class="relative mt-1 h-6 rounded-sm bg-n50" aria-hidden="true">
          <span class="absolute inset-y-0 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: zeroAt }"></span>
          <span class="absolute inset-y-1 rounded-sm bg-navy" :style="bar(new Decimal(0), parts.change)"></span>
        </div>
      </li>
    </ol>
    <p class="mt-2 text-caption text-n600">כל פס מתחיל איפה שהקודם נגמר. מה שמוסיף לחוב זז שמאלה; התשלום מחזיר ימינה. הקו המקווקו: אין שינוי.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">מה</th>
            <th class="py-2 text-start">כמה</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100">
            <td class="py-1">היתרה בתחילת השנה</td>
            <td class="py-1"><span class="ltr">{{ money(parts.opening) }}</span></td>
          </tr>
          <tr v-for="s in steps" :key="s.key" class="border-b border-n100">
            <td class="py-1">{{ s.label }}</td>
            <td class="py-1"><span class="ltr">{{ signed(s.value) }}</span></td>
          </tr>
          <tr class="border-b border-n100 font-semibold">
            <td class="py-1">היתרה בסוף השנה</td>
            <td class="py-1"><span class="ltr">{{ money(parts.closing) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
