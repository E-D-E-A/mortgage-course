<script setup lang="ts">
// Lesson 4.1: the anatomy of a payslip. Three synthetic monthly payslips; the
// learner opens each month, follows the lines from gross pay down to net pay
// and to net-to-pay, and chooses which of the two lines to count as income.
// The three months' average follows the choice, and a note says what happens
// to the employer loan in each case (lesson 4.2). Every amount comes from the
// page (the lesson's facts); every sum and average from affordability.ts.
import { computed, ref } from "vue";
import { averageMonthly, OBLIGATION_MONTHS, payslipNet, payslipNetToPay } from "../lib/calc/affordability.ts";
import { monthlyTotal } from "../lib/calc/household.ts";
import { formatShekels } from "../lib/calc/money.ts";

interface Line {
  label: string;
  amount: string;
}
interface Month {
  name: string;
  pay: Line[];
  mandatory: Line[];
  other: Line[];
}
const props = defineProps<{
  months: Month[];
  person: string;
  /** How many payments are left on the employer loan in the "other deductions" (lesson 4.2's 18-month rule decides what that means). */
  loanMonthsLeft?: number;
}>();
const loanLong = computed(() => props.loanMonthsLeft !== undefined && props.loanMonthsLeft > OBLIGATION_MONTHS);

const selected = ref(1);
const basis = ref<"net" | "net_to_pay">("net");
const showTable = ref(false);

const figures = computed(() =>
  props.months.map((m) => {
    const gross = monthlyTotal(m.pay.map((l) => l.amount));
    const mandatory = monthlyTotal(m.mandatory.map((l) => l.amount));
    const net = payslipNet(gross, m.mandatory.map((l) => l.amount));
    const other = monthlyTotal(m.other.map((l) => l.amount));
    const netToPay = payslipNetToPay(net, m.other.map((l) => l.amount));
    return { name: m.name, gross, mandatory, net, other, netToPay };
  }),
);
const month = computed(() => props.months[selected.value]);
const fig = computed(() => figures.value[selected.value]);
const counted = (f: (typeof figures.value)[number]) => (basis.value === "net" ? f.net : f.netToPay);
const avg = computed(() => averageMonthly(figures.value.map(counted)));
const sh = (v: string | number | { toString(): string }) => formatShekels(String(v));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-caption font-semibold text-n600">החודש:</span>
      <div class="inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="איזה תלוש להציג">
        <button
          v-for="(m, i) in months"
          :key="m.name"
          type="button"
          class="min-h-11 rounded-sm px-3 text-body-m"
          :class="selected === i ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          {{ m.name }}
        </button>
      </div>
    </div>

    <div class="mt-4 rounded-md border border-dashed border-n300 bg-n50 p-3 sm:p-4" role="group" :aria-label="`תלוש שכר לדוגמה של ${person}, ${month.name}`">
      <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-n200 pb-2">
        <p class="text-body-m font-semibold text-n900">תלוש שכר · {{ person }} · {{ month.name }}</p>
        <p class="text-caption text-n600">מסמך לדוגמה · מעסיק בדוי · מספרים להמחשה</p>
      </div>

      <p class="mt-3 text-caption font-semibold text-n600">תשלומים</p>
      <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-body-m text-n800">
        <template v-for="l in month.pay" :key="l.label">
          <dt>{{ l.label }}</dt>
          <dd class="text-end"><span class="ltr">{{ sh(l.amount) }}</span></dd>
        </template>
        <dt class="font-semibold text-n900">סה״כ תשלומים (ברוטו)</dt>
        <dd class="text-end font-semibold text-n900"><span class="ltr">{{ sh(fig.gross) }}</span></dd>
      </dl>

      <p class="mt-3 text-caption font-semibold text-n600">ניכויי חובה</p>
      <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-body-m text-n800">
        <template v-for="l in month.mandatory" :key="l.label">
          <dt>{{ l.label }}</dt>
          <dd class="text-end"><span class="ltr">−{{ sh(l.amount) }}</span></dd>
        </template>
      </dl>
      <div
        class="mt-2 grid grid-cols-[1fr_auto] gap-x-4 rounded-sm px-2 py-2 text-body-m font-semibold"
        :class="basis === 'net' ? 'bg-mint text-n900 ring-2 ring-navy' : 'text-n900'"
      >
        <span>שכר נטו</span>
        <span class="text-end"><span class="ltr">{{ sh(fig.net) }}</span></span>
      </div>

      <p class="mt-3 text-caption font-semibold text-n600">ניכויים אחרים</p>
      <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-body-m text-n800">
        <template v-for="l in month.other" :key="l.label">
          <dt>{{ l.label }}</dt>
          <dd class="text-end"><span class="ltr">−{{ sh(l.amount) }}</span></dd>
        </template>
      </dl>
      <div
        class="mt-2 grid grid-cols-[1fr_auto] gap-x-4 rounded-sm px-2 py-2 text-body-m font-semibold"
        :class="basis === 'net_to_pay' ? 'bg-mint text-n900 ring-2 ring-navy' : 'text-n900'"
      >
        <span>נטו לתשלום (נכנס לחשבון)</span>
        <span class="text-end"><span class="ltr">{{ sh(fig.netToPay) }}</span></span>
      </div>
    </div>

    <div class="mt-5">
      <p class="text-caption font-semibold text-n600">מה סופרים כהכנסה?</p>
      <div class="mt-1 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="איזו שורה בתלוש נספרת כהכנסה">
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="basis === 'net' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="basis === 'net'" @click="basis = 'net'">שכר נטו</button>
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="basis === 'net_to_pay' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="basis === 'net_to_pay'" @click="basis = 'net_to_pay'">נטו לתשלום</button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2" role="status">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ממוצע {{ months.length }} החודשים ({{ basis === "net" ? "שכר נטו" : "נטו לתשלום" }})</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ sh(avg) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3 text-body-m text-n800">
        <template v-if="loanLong">
          <p v-if="basis === 'net'">
            ההחזר על ההלוואה למעסיק <strong>לא</strong> ירד כאן. נשארו לה מעל {{ OBLIGATION_MONTHS }} תשלומים, ולכן היא תיבדק בנפרד כהתחייבות (שיעור 4.2).
          </p>
          <p v-else>
            ההחזר על ההלוואה למעסיק <strong>כבר ירד</strong>. נשארו לה מעל {{ OBLIGATION_MONTHS }} תשלומים, ולכן אם נוריד אותה שוב כהתחייבות — ספרנו אותה פעמיים.
          </p>
        </template>
        <template v-else>
          <p v-if="basis === 'net'">
            ההחזר על ההלוואה למעסיק <strong>לא</strong> ירד כאן. נשארו לה {{ loanMonthsLeft ?? "מעט" }} תשלומים, פחות מ־{{ OBLIGATION_MONTHS }}, ולכן היא לא תיספר כהתחייבות: הבנק לא רואה אותה בכלל.
          </p>
          <p v-else>
            ההחזר על ההלוואה למעסיק ודמי הוועד <strong>כבר ירדו</strong>: {{ sh(fig.other) }} בחודש הזה. ההלוואה לא הייתה נספרת כהתחייבות בכל מקרה, ולכן ההכנסה כאן נמוכה בסכום הזה.
          </p>
        </template>
      </div>
    </div>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-mint ring-2 ring-navy"></span>השורה שנספרת כהכנסה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm border border-dashed border-n300 bg-n50"></span>מסמך לדוגמה</li>
    </ul>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">חודש</th>
            <th class="py-2 pe-3 text-start">ברוטו</th>
            <th class="py-2 pe-3 text-start">ניכויי חובה</th>
            <th class="py-2 pe-3 text-start">שכר נטו</th>
            <th class="py-2 pe-3 text-start">ניכויים אחרים</th>
            <th class="py-2 pe-3 text-start">נטו לתשלום</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in figures" :key="f.name" class="border-b border-n100">
            <td class="py-1 pe-3">{{ f.name }}</td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(f.gross) }}</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(f.mandatory) }}</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(f.net) }}</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(f.other) }}</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(f.netToPay) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
