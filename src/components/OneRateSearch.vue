<script setup lang="ts">
// Lesson 3.10: "איזו ריבית אחת מסבירה את כל התשלומים?" The learner tries a rate
// and sees the value today of every payment at that rate against the money
// actually received (the loan less a fee taken on the day of payout); they move
// the rate until the two are equal. That rate is the IRR. Every number comes
// from metrics.ts (exact schedules; the IRR by bisection).
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { annualByMultiplication, effectiveAnnual, irrMonthly, type Method, presentValue, trackPayments } from "../lib/calc/metrics.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ amount?: number; rate?: string; years?: number }>(), { amount: 600000, rate: "4.8", years: 20 });

const method = ref<Method>("spitzer");
const fee = ref(0);
const guess = ref(4); // percent a year (× 12)
const exact = ref(false);
const showTable = ref(false);

const payments = computed(() => trackPayments({ principal: props.amount, rates: [props.rate], months: props.years * 12, method: method.value }));
const received = computed(() => new Decimal(props.amount).minus(fee.value));
const monthly = computed(() => new Decimal(guess.value).div(12));
const pvAtGuess = computed(() => presentValue(payments.value, monthly.value));
const gap = computed(() => pvAtGuess.value.minus(received.value));
const irr = computed(() => irrMonthly(payments.value, received.value));
const irrYear = computed(() => annualByMultiplication(irr.value));
// "Found it" when the slider sits on the step nearest the IRR (steps of 0.01 a year).
const found = computed(() => irrYear.value.minus(guess.value).abs().lte(0.005));
const verdict = computed(() => {
  if (found.value) return "found";
  return gap.value.gt(0) ? "low" : "high";
});

function nudge(d: number) {
  guess.value = Math.min(8, Math.max(3, Math.round((guess.value + d) * 100) / 100));
}
const fmt = (d: Decimal.Value, places: number) => new Decimal(d).toDecimalPlaces(places).toString();

const scaleMax = computed(() => Decimal.max(pvAtGuess.value, received.value).mul(1.05));
const width = (v: Decimal) => `${v.div(scaleMax.value).mul(100).toNumber()}%`;

const tableRates = Array.from({ length: 11 }, (_, i) => 3 + i * 0.5);
const tableRows = computed(() => tableRates.map((r) => ({ r, pv: presentValue(payments.value, new Decimal(r).div(12)) })));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      הלוואה של <span class="ltr">{{ formatWholeShekels(amount) }}</span> ב־<span class="ltr">{{ rate }}%</span> לשנה, ל־{{ years }} שנה. מספרים להמחשה.
    </p>
    <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="שיטת ההחזר">
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="method === 'spitzer' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="method === 'spitzer'" @click="method = 'spitzer'">שפיצר</button>
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="method === 'equal_principal' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="method === 'equal_principal'" @click="method = 'equal_principal'">קרן שווה</button>
    </div>

    <div class="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">עמלה שנגבית ביום שמקבלים את הכסף</span>
        <input v-model.number="fee" type="range" min="0" max="10000" step="10" aria-label="עמלה בשקלים" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(fee) }}</span></span>
      </label>
      <div class="flex flex-col">
        <label for="guess" class="text-caption font-semibold text-n600">הריבית שאתם מנסים, לשנה (כפול 12 מהחודשית)</label>
        <input id="guess" v-model.number="guess" type="range" min="3" max="8" step="0.01" aria-label="הריבית שאתם מנסים, באחוזים לשנה" />
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-2 text-body-m text-navy hover:bg-n50" aria-label="להוריד ב־0.01" @click="nudge(-0.01)">
            <span class="ltr">−0.01</span>
          </button>
          <span class="text-body-l font-semibold text-n900">
            <span class="ltr">{{ fmt(guess, 2) }}%</span> <span class="text-body-m font-normal text-n600">(<span class="ltr">{{ fmt(monthly, 4) }}%</span> לחודש)</span>
          </span>
          <button type="button" class="min-h-11 min-w-11 rounded-md border border-n200 px-2 text-body-m text-navy hover:bg-n50" aria-label="להעלות ב־0.01" @click="nudge(0.01)">
            <span class="ltr">+0.01</span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-2" aria-live="polite">
      <div>
        <p class="flex flex-wrap justify-between gap-x-3 text-body-m text-n800">
          <span>קיבלתם בפועל (ההלוואה פחות העמלה)</span><span class="ltr font-semibold text-n900">{{ formatShekels(received) }}</span>
        </p>
        <div class="mt-1 h-5 rounded-sm bg-n100"><div class="h-full rounded-sm" :style="{ width: width(received), background: 'var(--mogi-n300)' }"></div></div>
      </div>
      <div>
        <p class="flex flex-wrap justify-between gap-x-3 text-body-m text-n800">
          <span>הערך הנוכחי של כל התשלומים, בריבית שניסיתם</span><span class="ltr font-semibold text-n900">{{ formatShekels(pvAtGuess) }}</span>
        </p>
        <div class="mt-1 h-5 rounded-sm bg-n100"><div class="h-full rounded-sm" :style="{ width: width(pvAtGuess), background: 'var(--mogi-teal-deep)' }"></div></div>
      </div>
      <p class="rounded-md p-3 text-body-m text-n800" :class="verdict === 'found' ? 'bg-success-bg' : 'bg-n50'">
        <template v-if="verdict === 'found'"><strong class="text-n900">מצאתם.</strong> בריבית הזו התשלומים שווים היום בדיוק (עד שקלים בודדים) את מה שקיבלתם.</template>
        <template v-else-if="verdict === 'low'">
          הערך הנוכחי גבוה ממה שקיבלתם ב־<span class="ltr">{{ formatShekels(gap) }}</span>: הריבית שניסיתם <strong>נמוכה מדי</strong>. העלו אותה.
        </template>
        <template v-else>
          הערך הנוכחי נמוך ממה שקיבלתם ב־<span class="ltr">{{ formatShekels(gap.abs()) }}</span>: הריבית שניסיתם <strong>גבוהה מדי</strong>. הורידו אותה.
        </template>
      </p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="exact" @click="exact = !exact">
      {{ exact ? "הסתרת התשובה המדויקת" : "הראו לי את הריבית המדויקת" }}
    </button>
    <dl v-if="exact" class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-md border border-n200 p-3 text-body-m text-n700">
      <dt>שיעור התשואה הפנימי, לחודש</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ fmt(irr, 4) }}%</span></dd>
      <dt>לשנה, כפול 12</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ fmt(irrYear, 3) }}%</span></dd>
      <dt>לשנה, בחזקת 12 (ריבית אפקטיבית)</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ fmt(effectiveAnnual(irr), 3) }}%</span></dd>
    </dl>

    <button type="button" class="mt-1 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">ריבית לשנה (כפול 12)</th>
            <th class="py-2 text-start font-semibold">הערך הנוכחי של התשלומים</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tableRows" :key="t.r" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ t.r }}%</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(t.pv) }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="mt-1 text-caption text-n600">ככל שהריבית גבוהה יותר, הערך הנוכחי נמוך יותר. שימו לב בין אילו שתי שורות נמצא מה שקיבלתם.</p>
    </div>
  </div>
</template>
