<script setup lang="ts">
// The family budget (תקציב משפחתי), lesson 4.6's illustration. The learner sets
// a family's net income, a loan it already pays (with the months it has left),
// the household size, the family's own living budget and the new mortgage
// payment. The bar splits the month into the mortgage, the other loan and what
// is left for living; the cards compare three lines on the payment: the
// regulatory limit (50% of the disposable income), the capital threshold (40%)
// and the family's own — the most its living budget allows. Disposable income
// follows lesson 4.2's 18-month rule (affordability.ts), so a loan with 18
// months or less to run does NOT shrink the income the ratio is measured on,
// though the family still pays it. All figures are invented, and the living
// budget is the learner's own assumption, not a standard. Numbers from
// regulation.ts and affordability.ts.
import { computed, ref } from "vue";
import Decimal from "decimal.js";
import { disposableIncome, OBLIGATION_MONTHS, overMonthsLine, paymentToIncome } from "../lib/calc/affordability.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import {
  budgetMargin,
  largestPaymentForBudget,
  leftForLiving,
  maxPaymentAt,
  perPerson,
  PTI_CAPITAL_THRESHOLD,
  PTI_LIMIT,
} from "../lib/calc/regulation.ts";

const props = withDefaults(
  defineProps<{ net?: number; other?: number; months?: number; people?: number; budget?: number; payment?: number }>(),
  { net: 19000, other: 1200, months: 10, people: 4, budget: 11800, payment: 6600 },
);
const net = ref(props.net);
const other = ref(props.other);
const months = ref(props.months);
const people = ref(props.people);
const budget = ref(props.budget);
const payment = ref(props.payment);
const showTable = ref(false);

const counted = computed(() => overMonthsLine(months.value));
const disposable = computed(() => disposableIncome(net.value, [{ kind: "loan", monthly: other.value, monthsLeft: months.value }]));
const ratio = computed(() => (disposable.value.gt(0) ? paymentToIncome(payment.value, disposable.value) : null));
const maxLimit = computed(() => (disposable.value.gt(0) ? maxPaymentAt(disposable.value, PTI_LIMIT) : new Decimal(0)));
const maxThreshold = computed(() => (disposable.value.gt(0) ? maxPaymentAt(disposable.value, PTI_CAPITAL_THRESHOLD) : new Decimal(0)));
const familyMax = computed(() => largestPaymentForBudget(net.value, [other.value], budget.value));
const left = computed(() => leftForLiving(net.value, [payment.value, other.value]));
const margin = computed(() => budgetMargin(left.value, budget.value));
const each = computed(() => perPerson(left.value, people.value));
const lowest = computed(() => {
  const all = [
    { id: "limit", name: "המגבלה הרגולטורית", value: maxLimit.value },
    { id: "family", name: "התקציב של המשפחה", value: familyMax.value },
  ];
  return all.reduce((a, b) => (b.value.lt(a.value) ? b : a));
});
const over = computed(() => margin.value.isNeg());

// The bar: the whole month is the net income. Widths are shares of it; a negative "left" shows as an empty segment.
const share = (v: Decimal.Value) => `${Math.max(0, Math.min(100, (Number(v) / net.value) * 100))}%`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">
      מספרים להמחשה: משפחה בדויה. תקציב המחיה הוא הנחה שלכם, לא נתון סטטיסטי. 50% ו־40% לפי תעתיק של הצוות להוראה 329, נכון ל־2026-10-09, לא אומתו מול המקור.
    </p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההכנסה נטו של המשפחה</span>
        <input v-model.number="net" type="range" min="8000" max="40000" step="500" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(net) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההחזר החודשי החדש (המשכנתא)</span>
        <input v-model.number="payment" type="range" min="0" max="20000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(payment) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הלוואה שהמשפחה כבר משלמת: ההחזר החודשי</span>
        <input v-model.number="other" type="range" min="0" max="5000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(other) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה חודשי תשלום נשארו להלוואה הזו</span>
        <input v-model.number="months" type="range" min="1" max="60" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ months }} חודשים</span>
        <span class="text-caption text-n600">
          {{ counted ? `מעל ${OBLIGATION_MONTHS}: היא מנוכה מההכנסה הפנויה.` : `${OBLIGATION_MONTHS} או פחות: היא לא מנוכה, אבל המשפחה עדיין משלמת אותה.` }}
        </span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">נפשות במשק הבית</span>
        <input v-model.number="people" type="range" min="1" max="8" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ people }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תקציב המחיה שהמשפחה צריכה (הנחה שלכם)</span>
        <input v-model.number="budget" type="range" min="3000" max="25000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(budget) }}</span></span>
      </label>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>המשכנתא</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>ההלוואה הקיימת</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>מה שנשאר לחיים</li>
      <li class="flex items-center gap-2">
        <svg class="h-4 w-3" viewBox="0 0 12 16" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="16" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="3 2" /></svg>התקציב שהמשפחה צריכה
      </li>
    </ul>

    <!-- The month, from the right: the mortgage, the loan already paid, then what is left. The dashed line is where the living budget ends, measured from the right edge of "what is left". -->
    <div
      class="relative mt-4"
      role="img"
      :aria-label="`מתוך ${formatShekelsText(net)} בחודש: משכנתא ${formatShekelsText(payment)}, הלוואה קיימת ${formatShekelsText(other)}, נשאר לחיים ${formatShekelsText(left)}; התקציב שצריך ${formatShekelsText(budget)}.`"
    >
      <div class="flex h-10 w-full overflow-hidden rounded-sm bg-n50">
        <div class="h-full" :style="{ width: share(payment), background: 'var(--mogi-teal-deep)' }"></div>
        <div class="h-full" :style="{ width: share(other), background: 'var(--mogi-n300)' }"></div>
        <div class="h-full flex-1" style="background: var(--mogi-turquoise-2)"></div>
      </div>
      <div class="absolute -top-2 -bottom-2 border-e-2 border-dashed border-navy" :style="{ insetInlineEnd: share(budget) }"></div>
    </div>
    <div class="mt-1 flex justify-between text-caption text-n600" aria-hidden="true">
      <span>כל ההכנסה: <span class="ltr">{{ formatShekelsText(net) }}</span></span>
      <span>0 ₪</span>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md p-3" :class="over ? 'bg-warning-bg' : 'bg-n50'">
        <p class="text-caption text-n600">נשאר לחיים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(left) }}</span></p>
        <p class="text-caption text-n600">לנפש: <span class="ltr">{{ formatShekelsText(each) }}</span></p>
      </div>
      <div class="rounded-md p-3" :class="over ? 'bg-warning-bg' : 'bg-n50'">
        <p class="text-caption text-n600">{{ over ? "חסר מול התקציב" : "מעל התקציב" }}</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(margin.abs()) }}</span></p>
        <p class="text-caption text-n600">התקציב: <span class="ltr">{{ formatShekelsText(budget) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">יחס החזר (על הכנסה פנויה {{ formatShekelsText(disposable) }})</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ ratio ? percentString(ratio) + "%" : "—" }}</span></p>
        <p class="text-caption text-n600">בתוך {{ PTI_LIMIT }}%: {{ ratio && ratio.lte(PTI_LIMIT) ? "כן" : "לא" }} · מעל {{ PTI_CAPITAL_THRESHOLD }}%: {{ ratio && ratio.gt(PTI_CAPITAL_THRESHOLD) ? "כן" : "לא" }}</p>
      </div>
    </div>

    <p class="mt-4 rounded-md p-3 text-body-m text-n800" :class="over ? 'bg-warning-bg' : 'bg-n50'" role="status">
      ההחזר הגבוה ביותר שמותר לפי המגבלה: <span class="ltr font-semibold">{{ formatShekelsText(maxLimit) }}</span>.
      ההחזר הגבוה ביותר שהתקציב של המשפחה מאפשר: <span class="ltr font-semibold">{{ formatShekelsText(familyMax) }}</span>.
      <template v-if="lowest.id === 'family' && familyMax.lt(maxLimit)">הקו הנמוך יותר הוא של המשפחה, לא של בנק ישראל.</template>
      <template v-else>הקו הנמוך יותר הוא המגבלה.</template>
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הכנסה נטו</th><td class="py-1"><span class="ltr">{{ formatShekels(net) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">המשכנתא</th><td class="py-1"><span class="ltr">{{ formatShekels(payment) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הלוואה קיימת</th><td class="py-1"><span class="ltr">{{ formatShekels(other) }}</span> · {{ months }} חודשים</td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הכנסה פנויה (אחרי כלל 18 החודשים)</th><td class="py-1"><span class="ltr">{{ formatShekels(disposable) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">נשאר לחיים</th><td class="py-1"><span class="ltr">{{ formatShekels(left) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">לנפש</th><td class="py-1"><span class="ltr">{{ formatShekels(each) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">תקציב מחיה</th><td class="py-1"><span class="ltr">{{ formatShekels(budget) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">החזר מרבי לפי המגבלה ({{ PTI_LIMIT }}%)</th><td class="py-1"><span class="ltr">{{ formatShekels(maxLimit) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">החזר בסף ההון ({{ PTI_CAPITAL_THRESHOLD }}%)</th><td class="py-1"><span class="ltr">{{ formatShekels(maxThreshold) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">החזר מרבי לפי התקציב</th><td class="py-1"><span class="ltr">{{ formatShekels(familyMax) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
