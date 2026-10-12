<script setup lang="ts">
// Lesson 4.8's illustration: reading three months of a current account. The page
// passes an invented statement (opening balance, deposits by source, debits, closing
// balance, returned debits). The learner picks how many months to read, counted back
// from the last, and sees what the statement says over that window: the average
// monthly deposit of the self-employed borrower against what he declared and what was
// recognised. It shows that a short window can look better or worse than a long one,
// and it does NOT say how many months a bank reads: no source tells (that is the
// lesson's open question). Averages from underwriting.ts.
import { computed, ref } from "vue";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { average } from "../lib/calc/underwriting.ts";

interface Row {
  month: string;
  opening: string;
  avi: string;
  michal: string;
  deposits: string;
  debits: string;
  closing: string;
}
const props = defineProps<{
  rows: Row[];
  declared: number;
  recognised: number;
  returnedDebits: number;
  source: string;
}>();

const months = ref(props.rows.length);
const showTable = ref(false);
const shown = computed(() => props.rows.slice(props.rows.length - months.value));
const avg = computed(() => average(shown.value.map((r) => r.avi)));
const lowest = computed(() => shown.value.map((r) => Number(r.closing)).reduce((a, b) => Math.min(a, b)));
const vsDeclared = computed(() => avg.value.minus(props.declared));
const vsRecognised = computed(() => avg.value.minus(props.recognised));
// Negative amounts are written with the course's minus sign, not the hyphen the number formatter uses.
const signed = (v: unknown) => formatShekels(v as never).replace(/^-/, "−").replace(/^‎-/, "−");
const monthsLabel = computed(() => (months.value === 1 ? "בחודש האחרון" : `ב־${months.value} החודשים האחרונים`));
const above = (d: { isNegative: () => boolean; isZero: () => boolean }) => !d.isNegative() && !d.isZero();
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">חשבון בדוי, מספרים להמחשה. {{ source }}</p>

    <label class="mt-3 flex flex-col gap-1">
      <span class="text-caption font-semibold text-n600">כמה חודשים קוראים, מהאחרון אחורה</span>
      <input v-model.number="months" type="range" min="1" :max="rows.length" step="1" />
      <span class="text-body-l font-semibold text-n900">{{ months }}</span>
    </label>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">חודש</th>
            <th class="py-2 text-start font-semibold">הפקדות מהעסק של אבי</th>
            <th class="py-2 text-start font-semibold">הפקדת השכר של מיכל</th>
            <th class="py-2 text-start font-semibold">חיובים</th>
            <th class="py-2 text-start font-semibold">יתרה בסוף החודש</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.month" class="border-b border-n100" :class="shown.includes(r) ? '' : 'opacity-50'">
            <td class="py-2 text-n700">{{ r.month }}<span v-if="!shown.includes(r)" class="block text-caption text-n600">לא נקרא</span></td>
            <td class="py-2"><span class="ltr">{{ formatShekels(r.avi) }}</span></td>
            <td class="py-2"><span class="ltr">{{ formatShekels(r.michal) }}</span></td>
            <td class="py-2"><span class="ltr">{{ formatShekels(r.debits) }}</span></td>
            <td class="py-2"><span class="ltr">{{ formatShekels(r.closing) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ממוצע ההפקדות של אבי</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(avg) }}</span></p>
        <p class="text-caption text-n600">{{ monthsLabel }}</p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">מול מה שהוצהר (<span class="ltr">{{ formatShekelsText(declared) }}</span>)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(vsDeclared.abs()) }}</span></p>
        <p class="text-caption text-n600">{{ above(vsDeclared) ? "מעל" : vsDeclared.isZero() ? "בדיוק" : "מתחת" }}</p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">מול מה שהוכר (<span class="ltr">{{ formatShekelsText(recognised) }}</span>)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(vsRecognised.abs()) }}</span></p>
        <p class="text-caption text-n600">{{ above(vsRecognised) ? "מעל" : vsRecognised.isZero() ? "בדיוק" : "מתחת" }}</p>
      </div>
    </div>

    <p class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800" role="status">
      היתרה הנמוכה בסוף חודש בתקופה שנקראה: <span class="ltr">{{ formatShekelsText(lowest) }}</span>. חיובים שחזרו בתקופה: {{ returnedDebits }}.
      כמה חודשים בנק קורא באמת — אין לנו מקור שאומר, ולכן המחוון הזה לא עונה על השאלה. הוא רק מראה שהתשובה משנה.
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[22rem] border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">חודשים שנקראו</th><td class="py-1">{{ months }}</td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">ממוצע ההפקדות של אבי</th><td class="py-1"><span class="ltr">{{ formatShekels(avg) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הפרש מול ההצהרה</th><td class="py-1"><span class="ltr">{{ signed(vsDeclared) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הפרש מול ההכרה</th><td class="py-1"><span class="ltr">{{ signed(vsRecognised) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">היתרה הנמוכה בסוף חודש</th><td class="py-1"><span class="ltr">{{ formatShekels(lowest) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
