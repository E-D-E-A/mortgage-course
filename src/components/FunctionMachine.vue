<script setup lang="ts">
// Lesson 8.1: input → rule → output, twice in a row. A loan amount goes into the rule "payment" and out comes a monthly payment; the
// payment goes into the rule "ratio" and out comes the payment-to-income ratio. The learner moves the inputs and sees the chain.
// Computed with the course's modules (schedule.ts's payment rule, percent of income). Nothing here is a Mogi system.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { recalculatedPayment } from "../lib/calc/schedule.ts";

const props = withDefaults(defineProps<{ income?: string; note?: string }>(), { income: "20250", note: "" });
const loan = ref(1640000);
const rate = ref(4.4);
const months = ref(360);
const pay = computed(() => recalculatedPayment(loan.value, rate.value.toFixed(2), months.value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
const ratio = computed(() => pay.value.mul(100).div(props.income).toDecimalPlaces(1));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">נתונים סינתטיים: הכנסה פנויה של <span class="ltr">{{ formatShekels(income) }}</span> בחודש. הכלל הראשון הוא חישוב ההחזר (שיעור 2.9), השני הוא חלוקה בהכנסה (שיעור 4.3).</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">סכום ההלוואה</span><input v-model.number="loan" type="range" min="200000" max="2000000" step="20000" /><span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(loan) }}</span></span></label>
      <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">ריבית לשנה</span><input v-model.number="rate" type="range" min="2" max="7" step="0.1" /><span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate.toFixed(1) }}%</span></span></label>
      <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">מספר חודשים</span><input v-model.number="months" type="range" min="120" max="360" step="12" /><span class="text-body-l font-semibold text-n900"><span class="ltr">{{ months }}</span></span></label>
    </div>
    <div class="mt-5 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <div class="rounded-md bg-n50 p-3 text-center"><p class="text-caption text-n600">קלט</p><p class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(loan) }}</span></p></div>
      <div class="self-center text-center text-n600" aria-hidden="true">← כלל: החזר ←</div>
      <div class="rounded-md bg-n50 p-3 text-center"><p class="text-caption text-n600">פלט, וגם קלט לכלל הבא</p><p class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(pay) }}</span></p></div>
      <div class="self-center text-center text-n600" aria-hidden="true">← כלל: יחס ←</div>
      <div class="rounded-md bg-n50 p-3 text-center"><p class="text-caption text-n600">פלט</p><p class="text-body-l font-semibold text-n900"><span class="ltr">{{ ratio.toString() }}%</span></p></div>
    </div>
    <p v-if="note" class="mt-2 text-caption text-n600">{{ note }}</p>
  </div>
</template>
