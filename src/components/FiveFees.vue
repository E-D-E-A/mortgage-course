<script setup lang="ts">
// Lesson 7.1: "חמש עמלות". The learner picks a kind of loan, the day of the month the loan is repaid, and
// how many days ahead the bank was told, and sees which of the five fees follow and how much of each
// this lesson can compute. The discounting fee is shown as "by a formula" (lesson 7.2). All fees come
// from earlyrepay.ts. The loan is invented: a balance of 500,000 ₪, the index up 0.2% a month on average.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { NOTICE_MAX_DAYS, NOTICE_MIN_DAYS, addDays, discountingFeeApplies, indexFee, noNoticeFee, noticeStatus, operationalFee } from "../lib/calc/earlyrepay.ts";
import { formatShekels } from "../lib/calc/money.ts";

type Kind = "fixed" | "linked" | "prime" | "directed";
const BALANCE = "500000";
const CHANGE = "0.25";

const kind = ref<Kind>("linked");
const day = ref(10);
const noticeDays = ref(20);
const showTable = ref(false);

const kinds: { id: Kind; label: string }[] = [
  { id: "fixed", label: "קבועה לא צמודה" },
  { id: "linked", label: "קבועה צמודה" },
  { id: "prime", label: "פריים" },
  { id: "directed", label: "הלוואה מוכוונת" },
];

const repaidOn = computed(() => `2026-08-${String(day.value).padStart(2, "0")}`);
const notice = computed(() => noticeStatus(noticeDays.value > 0 ? addDays(repaidOn.value, -noticeDays.value) : null, repaidOn.value));
const directed = computed(() => kind.value === "directed");

const fees = computed(() => {
  const zero = new Decimal(0);
  const none = directed.value;
  return {
    op: none ? zero : operationalFee(),
    nn: none ? zero : noNoticeFee(BALANCE, notice.value),
    ix: none ? zero : indexFee({ amount: BALANCE, avgMonthlyChangePercent: CHANGE, repaidOn: repaidOn.value, linkage: kind.value === "linked" ? "linked" : "unlinked" }),
    carries: !none && discountingFeeApplies({ kind: kind.value === "prime" ? "prime" : "fixed" }),
  };
});
const noticeWhy = computed(() => {
  const s = notice.value;
  if (s.status === "none") return "לא נמסרה הודעה בכתב";
  if (s.status === "ok") return `הודעה בכתב ${s.days} ימים מראש, בין ${NOTICE_MIN_DAYS} ל־${NOTICE_MAX_DAYS}`;
  if (s.status === "short") return `הודעה רק ${s.days} ימים מראש, פחות מ־${NOTICE_MIN_DAYS}`;
  return `הודעה ${s.days} ימים מראש, יותר מ־${NOTICE_MAX_DAYS} (קריאה שלנו: היא לא נחשבת)`;
});
const rows = computed(() => {
  const f = fees.value;
  const none = directed.value;
  return [
    { name: "עמלה תפעולית", on: f.op.gt(0), amount: formatShekels(f.op), why: none ? "הלוואה מוכוונת: אין שום עמלה" : "תמיד, פעם אחת לכל פירעון" },
    { name: "עמלת אי־הודעה מוקדמת", on: f.nn.gt(0), amount: formatShekels(f.nn), why: none ? "הלוואה מוכוונת: אין שום עמלה" : noticeWhy.value },
    {
      name: "עמלת היוון",
      on: f.carries,
      amount: f.carries ? "לפי נוסחה (שיעור 7.2)" : formatShekels(0),
      why: none ? "הלוואה מוכוונת: אין שום עמלה" : kind.value === "prime" ? "פריים: אף פעם" : "מסלול בריבית קבועה: כן",
    },
    {
      name: "עמלת מדד",
      on: f.ix.gt(0),
      amount: formatShekels(f.ix),
      why: none ? "הלוואה מוכוונת: אין שום עמלה" : kind.value !== "linked" ? "ההלוואה לא צמודה" : day.value > 15 ? "הוחזרה ב־16 בחודש או אחריו" : "הלוואה צמודה שהוחזרה בין ה־1 ל־15",
    },
    { name: "עמלת הפרשי שער", on: false, amount: formatShekels(0), why: "ההלוואה בשקלים (הקורס לא מחשב אותה)" },
  ];
});
const sum = computed(() => fees.value.op.plus(fees.value.nn).plus(fees.value.ix));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      הלוואה בדויה, יתרה של <span class="ltr">500,000 ₪</span>. המדד עלה בממוצע <span class="ltr">0.25%</span> בחודש. ההלוואה מוחזרת כולה באוגוסט 2026. מספרים להמחשה.
    </p>

    <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="סוג ההלוואה">
      <button v-for="k in kinds" :key="k.id" type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="kind === k.id ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="kind === k.id" @click="kind = k.id">
        {{ k.label }}
      </button>
    </div>

    <div class="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">היום בחודש שבו מחזירים</span>
        <input v-model.number="day" type="range" min="1" max="31" step="1" aria-label="היום בחודש" />
        <span class="text-body-l font-semibold text-n900">ה־<span class="ltr">{{ day }}</span> באוגוסט</span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">כמה ימים מראש נמסרה הודעה בכתב לבנק</span>
        <input v-model.number="noticeDays" type="range" min="0" max="60" step="1" aria-label="ימים מראש" />
        <span class="text-body-l font-semibold text-n900">{{ noticeDays === 0 ? "לא נמסרה הודעה" : `${noticeDays} ימים` }}</span>
      </label>
    </div>

    <ul class="mt-4 grid gap-2" aria-live="polite">
      <li v-for="r in rows" :key="r.name" class="rounded-md border p-3" :class="r.on ? 'border-navy bg-n0' : 'border-n100 bg-n50'">
        <p class="flex flex-wrap items-baseline justify-between gap-x-3">
          <span class="text-body-m font-semibold" :class="r.on ? 'text-n900' : 'text-n600'">{{ r.name }}</span>
          <span class="text-body-m font-semibold" :class="r.on ? 'text-n900' : 'text-n600'"><span class="ltr">{{ r.amount }}</span></span>
        </p>
        <p class="mt-1 text-caption text-n700">
          <strong>{{ r.on ? "חלה." : "לא חלה." }}</strong> {{ r.why }}
        </p>
      </li>
    </ul>
    <p class="mt-3 flex flex-wrap justify-between gap-x-3 rounded-md bg-n50 p-3 text-body-m text-n800">
      <span>הסכום של העמלות שהשיעור הזה מחשב (בלי עמלת ההיוון)</span>
      <span class="ltr font-semibold text-n900">{{ formatShekels(sum) }}</span>
    </p>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">העמלה</th>
            <th class="py-2 pe-3 text-start font-semibold">חלה?</th>
            <th class="py-2 text-start font-semibold">הסכום</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.name" class="border-b border-n100">
            <td class="py-1 pe-3">{{ r.name }}</td>
            <td class="py-1 pe-3">{{ r.on ? "כן" : "לא" }}</td>
            <td class="py-1"><span class="ltr">{{ r.amount }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
