<script setup lang="ts">
// Lesson 1.1's illustration: what happens if you stop paying a mortgage. The
// pledged home is sold; the learner moves the sale price and the debt, and
// sees who gets what: the debt is paid first, the rest goes to the borrower,
// and a sale smaller than the debt leaves the difference still owed.
// Shown before the costs of the process and late-payment interest. Numbers from ltv.ts.
import { computed, ref } from "vue";
import { saleSplit } from "../lib/calc/ltv.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ sale?: number; debt?: number }>(), {
  sale: 1000000,
  debt: 600000,
});

const sale = ref(props.sale);
const debt = ref(props.debt);
const showTable = ref(false);

const split = computed(() => saleSplit(sale.value, debt.value));
const short = computed(() => split.value.stillOwed.gt(0));
// Both bars share one scale: the larger of the sale and the debt is the full width.
const scale = computed(() => Math.max(sale.value, debt.value, 1));
const pct = (v: number) => `${(v / scale.value) * 100}%`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה. לפני הוצאות ההליך ולפני ריבית על הפיגור, שבפועל מגדילות את החוב.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">החוב שנשאר</span>
        <input v-model.number="debt" type="range" min="0" max="1500000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(debt) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">המחיר שבו הדירה נמכרת</span>
        <input v-model.number="sale" type="range" min="100000" max="2000000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(sale) }}</span></span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הבנק מקבל (קודם)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(split.toLender) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">נשאר לכם</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(split.toBorrower) }}</span></p>
      </div>
      <div class="rounded-md p-3" :class="short ? 'bg-warning-bg' : 'bg-n50'">
        <p class="text-caption text-n600">עדיין חייבים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(split.stillOwed) }}</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>מהמכירה — לבנק</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>מהמכירה — לכם</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>החוב</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-navy"></span>חוב שהמכירה לא כיסתה</li>
    </ul>

    <!-- Two bars on one scale, starting at the right: what the sale brought, and what was owed. -->
    <div class="mt-3 space-y-3" role="img" :aria-label="`המכירה: ${formatShekelsText(sale)}. החוב: ${formatShekelsText(debt)}.`">
      <div>
        <p class="text-caption text-n600">המכירה</p>
        <div class="mt-1 flex h-8 w-full overflow-hidden rounded-sm bg-n50">
          <div class="h-full" :style="{ width: pct(split.toLender.toNumber()), background: 'var(--mogi-teal-deep)' }"></div>
          <!-- No segment (and no white divider) when nothing is left to the borrower. -->
          <div v-if="split.toBorrower.gt(0)" class="h-full border-s-2 border-n0" :style="{ width: pct(split.toBorrower.toNumber()), background: 'var(--mogi-turquoise-2)' }"></div>
        </div>
      </div>
      <div>
        <p class="text-caption text-n600">החוב</p>
        <div class="mt-1 flex h-8 w-full overflow-hidden rounded-sm bg-n50">
          <div class="h-full" :style="{ width: pct(split.toLender.toNumber()), background: 'var(--mogi-n300)' }"></div>
          <div v-if="short" class="h-full rounded-sm border-2 border-dashed border-navy" :style="{ width: pct(split.stillOwed.toNumber()) }"></div>
        </div>
      </div>
    </div>

    <p class="mt-4 rounded-md p-3 text-body-m text-n800" :class="short ? 'bg-warning-bg' : 'bg-n50'" role="status">
      <template v-if="short">
        המכירה לא מכסה את כל החוב. כל הכסף הולך לבנק, ועדיין נשאר חוב של <span class="ltr">{{ formatShekelsText(split.stillOwed) }}</span> — והוא נשאר שלכם.
      </template>
      <template v-else>
        המכירה מכסה את החוב. הבנק מקבל את החוב, והשאר, <span class="ltr">{{ formatShekelsText(split.toBorrower) }}</span>, חוזר אליכם.
      </template>
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">המחיר שבו הדירה נמכרת</th><td class="py-1"><span class="ltr">{{ formatShekels(sale) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">החוב שנשאר</th><td class="py-1"><span class="ltr">{{ formatShekels(debt) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הבנק מקבל</th><td class="py-1"><span class="ltr">{{ formatShekels(split.toLender) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">נשאר לכם</th><td class="py-1"><span class="ltr">{{ formatShekels(split.toBorrower) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">עדיין חייבים</th><td class="py-1"><span class="ltr">{{ formatShekels(split.stillOwed) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
