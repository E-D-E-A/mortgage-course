<script setup lang="ts">
// Lesson 0.9's illustration: the bank in the middle. Depositors lend money to
// the bank and get interest; the bank lends it to a borrower and charges more.
// The learner moves the amount, the cost of funds and the loan rate, and sees a
// year's money flow on each side and the spread between them. Numbers from lending.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { plainNumber } from "../lib/calc/indexation.ts";
import { spread, yearInterest } from "../lib/calc/lending.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ amount?: number; cost?: number; loan?: number }>(), {
  amount: 100000,
  cost: 2,
  loan: 5,
});

const amount = ref(props.amount);
const cost = ref(props.cost);
const loan = ref(props.loan);
const showTable = ref(false);

const paid = computed(() => yearInterest(amount.value, String(cost.value)));
const received = computed(() => yearInterest(amount.value, String(loan.value)));
const gap = computed(() => spread(String(loan.value), String(cost.value)));
const income = computed(() => received.value.minus(paid.value));
const losing = computed(() => income.value.lt(0));
const points = (d: Decimal) => plainNumber(d).replace("-", "−");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה, לבנק בדוי (״בנק א׳״), לשנה אחת. לא ריביות של בנק אמיתי.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הסכום שעובר דרך הבנק</span>
        <input v-model.number="amount" type="range" min="10000" max="1000000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(amount) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">עלות הכסף: הריבית למפקידים</span>
        <input v-model.number="cost" type="range" min="0" max="8" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ cost }}%</span> לשנה</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הריבית על ההלוואה</span>
        <input v-model.number="loan" type="range" min="0" max="10" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ loan }}%</span> לשנה</span>
      </label>
    </div>

    <!-- The flow, read right to left: depositors → bank → borrower. -->
    <div class="mt-6 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <div class="rounded-md border border-n200 bg-n50 p-3 text-center">
        <p class="text-body-m font-semibold text-n900">המפקידים</p>
        <p class="mt-1 text-caption text-n600">נותנים לבנק <span class="ltr">{{ formatShekelsText(amount) }}</span></p>
        <p class="mt-2 text-caption text-n600">מקבלים ריבית</p>
        <p class="text-h3 text-n700"><span class="ltr">{{ formatShekelsText(paid) }}</span></p>
      </div>
      <div class="flex items-center justify-center text-h2 text-n500" aria-hidden="true"><span class="sm:hidden">↓</span><span class="hidden sm:inline">←</span></div>
      <div class="rounded-md border-2 p-3 text-center" :class="losing ? 'border-danger bg-danger-bg' : 'border-teal-deep bg-n0'">
        <p class="text-body-m font-semibold text-n900">הבנק</p>
        <p class="mt-1 text-caption text-n600">המרווח</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ points(gap) }}</span> נקודות אחוז</p>
        <p class="mt-1 text-caption text-n600">נשאר לו לפני הוצאות</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekelsText(income) }}</span></p>
      </div>
      <div class="flex items-center justify-center text-h2 text-n500" aria-hidden="true"><span class="sm:hidden">↓</span><span class="hidden sm:inline">←</span></div>
      <div class="rounded-md border border-n200 bg-n50 p-3 text-center">
        <p class="text-body-m font-semibold text-n900">הלווה</p>
        <p class="mt-1 text-caption text-n600">מקבל הלוואה של <span class="ltr">{{ formatShekelsText(amount) }}</span></p>
        <p class="mt-2 text-caption text-n600">משלם ריבית</p>
        <p class="text-h3 text-n700"><span class="ltr">{{ formatShekelsText(received) }}</span></p>
      </div>
    </div>
    <p v-if="losing" class="mt-3 rounded-md bg-danger-bg p-3 text-body-m text-n800" role="status">
      הריבית על ההלוואה נמוכה מעלות הכסף: בנק שפועל כך מפסיד על כל שקל שהוא מלווה.
    </p>
    <p class="mt-3 text-caption text-n600">
      ״לפני הוצאות״: מהסכום הזה הבנק עוד משלם משכורות, מערכות וסניפים, ומכסה הלוואות שלא יוחזרו. מה שנשאר אחרי כל אלה הוא הרווח.
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">ריבית שהלווה משלם לבנק</th><td class="py-1"><span class="ltr">{{ formatShekels(received) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">ריבית שהבנק משלם למפקידים</th><td class="py-1"><span class="ltr">{{ formatShekels(paid) }}</span></td></tr>
          <tr class="border-b border-n100 font-semibold text-n900"><th class="py-1 text-start">נשאר לבנק, לפני הוצאות</th><td class="py-1"><span class="ltr">{{ formatShekels(income) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">המרווח</th><td class="py-1"><span class="ltr">{{ points(gap) }}</span> נקודות אחוז</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
