<script setup lang="ts">
// Lesson 1.2's illustration: the price bar. A home's price is split into the
// buyers' own money (equity) and the loan. The learner moves the price and the
// equity, picks a deal type, and sees the financing ratio against that type's
// ceiling: the largest loan it allows, and the least equity it needs.
// Here the property's value is taken to be its price. Numbers from ltv.ts;
// the ceilings come from the lesson's data file, through the page.
import { computed, ref, watch } from "vue";
import { loanNeeded, ltvPercent, maxLoan, minEquity } from "../lib/calc/ltv.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";

interface Ceiling {
  /** Percent, as a string: "75". */
  value: string;
  label: string;
}
const props = withDefaults(defineProps<{ price?: number; equity?: number; ceilings: Ceiling[]; source: string }>(), {
  price: 1000000,
  equity: 250000,
});

const price = ref(props.price);
const equity = ref(props.equity);
const picked = ref(0);
const showTable = ref(false);

// Both sliders share one fixed scale, so the equity thumb stays put when the price moves.
// Equity can't be more than the price: whichever slider moves, equity is kept at or below the price.
const PRICE_MIN = 500000;
const PRICE_MAX = 4000000;
watch([price, equity], ([p, e]) => {
  if (e > p) equity.value = p;
});

const ceiling = computed(() => props.ceilings[picked.value]);
// The slider keeps equity within the price; Math.min guards the moment between a price change and the watch.
const own = computed(() => Math.min(equity.value, price.value));
const loan = computed(() => loanNeeded(price.value, own.value));
const ratio = computed(() => ltvPercent(loan.value, price.value));
const most = computed(() => maxLoan(price.value, ceiling.value.value));
const least = computed(() => minEquity(price.value, price.value, ceiling.value.value));
const over = computed(() => ratio.value.gt(ceiling.value.value));
const missing = computed(() => least.value.minus(own.value));
const loanShare = computed(() => `${ratio.value.toNumber()}%`);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה. כאן שווי הנכס שווה למחיר. {{ source }}</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מחיר הדירה</span>
        <input v-model.number="price" type="range" :min="PRICE_MIN" :max="PRICE_MAX" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(price) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההון העצמי: הכסף שלכם</span>
        <input v-model.number="equity" type="range" min="0" :max="PRICE_MAX" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(own) }}</span></span>
        <span class="text-caption text-n600">לא יותר ממחיר הדירה.</span>
      </label>
    </div>

    <fieldset class="mt-4">
      <legend class="text-caption font-semibold text-n600">סוג העסקה, והתקרה שלה</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label
          v-for="(c, i) in ceilings"
          :key="c.value"
          class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="picked === i ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        >
          <input v-model="picked" type="radio" name="price-bar-ceiling" :value="i" class="accent-teal-deep" />
          <span><span class="ltr">{{ c.value }}%</span> · {{ c.label }}</span>
        </label>
      </div>
    </fieldset>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההלוואה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(loan) }}</span></p>
      </div>
      <div class="rounded-md p-3" :class="over ? 'bg-warning-bg' : 'bg-n50'">
        <p class="text-caption text-n600">שיעור המימון</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ percentString(ratio) }}%</span></p>
        <p class="text-caption text-n600">התקרה: <span class="ltr">{{ ceiling.value }}%</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הון עצמי מינימלי בתקרה הזו</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(least) }}</span></p>
        <p class="text-caption text-n600">הלוואה מרבית: <span class="ltr">{{ formatShekelsText(most) }}</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ההלוואה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>ההון העצמי</li>
      <li class="flex items-center gap-2">
        <svg class="h-4 w-3" viewBox="0 0 12 16" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="16" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="3 2" /></svg>התקרה
      </li>
    </ul>

    <!-- The whole bar is the price. The loan starts at the right; the ceiling is a dashed line at its percent of the price. -->
    <div class="relative mt-8" role="img" :aria-label="`מחיר ${formatShekelsText(price)}: הלוואה ${formatShekelsText(loan)}, הון עצמי ${formatShekelsText(own)}, שיעור מימון ${percentString(ratio)}%.`">
      <div class="flex h-10 w-full overflow-hidden rounded-sm bg-n50">
        <div class="h-full" :style="{ width: loanShare, background: 'var(--mogi-teal-deep)' }"></div>
        <div class="h-full flex-1 border-s-2 border-n0" style="background: var(--mogi-turquoise-2)"></div>
      </div>
      <div class="absolute -top-6 bottom-0 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: `${ceiling.value}%` }">
        <span class="absolute -top-0.5 start-1 whitespace-nowrap text-caption text-n700">תקרה <span class="ltr">{{ ceiling.value }}%</span></span>
      </div>
    </div>
    <div class="mt-1 flex justify-between text-caption text-n600" aria-hidden="true">
      <span>0%</span><span>100% — כל המחיר</span>
    </div>

    <p class="mt-4 rounded-md p-3 text-body-m text-n800" :class="over ? 'bg-warning-bg' : 'bg-n50'" role="status">
      <template v-if="over">
        ההלוואה גדולה מהתקרה. כדי לעמוד בה צריך עוד <span class="ltr">{{ formatShekelsText(missing) }}</span> הון עצמי, או דירה זולה יותר.
      </template>
      <template v-else>
        שיעור המימון בתוך התקרה. אפשר היה ללוות עד <span class="ltr">{{ formatShekelsText(most) }}</span>.
      </template>
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">מחיר הדירה</th><td class="py-1"><span class="ltr">{{ formatShekels(price) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הון עצמי</th><td class="py-1"><span class="ltr">{{ formatShekels(own) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הלוואה</th><td class="py-1"><span class="ltr">{{ formatShekels(loan) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">שיעור מימון</th><td class="py-1"><span class="ltr">{{ percentString(ratio) }}%</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">התקרה ({{ ceiling.label }})</th><td class="py-1"><span class="ltr">{{ ceiling.value }}%</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הלוואה מרבית בתקרה</th><td class="py-1"><span class="ltr">{{ formatShekels(most) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">הון עצמי מינימלי בתקרה</th><td class="py-1"><span class="ltr">{{ formatShekels(least) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
