<script setup lang="ts">
// Lesson 4.5's illustration: the same payment, three kinds of number. The
// learner moves a payment against a disposable income and sees where its
// payment-to-income ratio stands against three lines that are NOT the same
// kind of number: a regulatory limit (50%: a bank may not approve above it),
// a capital threshold (40%: allowed, the bank holds more capital) and a
// bank's policy (invented here: "בנק א׳", a line the learner can move, to show
// that it is one bank's own and can be anywhere). Every number comes from
// affordability.ts (the ratio) and regulation.ts (the two directive numbers).
import { computed, ref } from "vue";
import Decimal from "decimal.js";
import { paymentToIncome } from "../lib/calc/affordability.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { maxPaymentAt, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../lib/calc/regulation.ts";

const props = withDefaults(defineProps<{ income?: number; payment?: number; policy?: number }>(), {
  income: 16000,
  payment: 6800,
  policy: 35,
});
const income = ref(props.income);
const payment = ref(props.payment);
const policy = ref(props.policy);
const showTable = ref(false);

const ratio = computed(() => paymentToIncome(payment.value, income.value));
const ban = new Decimal(PTI_LIMIT);
const threshold = new Decimal(PTI_CAPITAL_THRESHOLD);

interface Line {
  key: string;
  kind: string;
  name: string;
  percent: Decimal;
  crossed: boolean;
  color: string;
  whoSets: string;
  ifCrossed: string;
  ifNot: string;
}
const lines = computed<Line[]>(() => {
  const r = ratio.value;
  return [
    {
      key: "policy",
      kind: "מדיניות בנק",
      name: "בנק א׳ (בדוי)",
      percent: new Decimal(policy.value),
      crossed: r.gt(policy.value),
      color: "var(--mogi-teal-deep)",
      whoSets: "הבנק בעצמו. בנק אחר יכול להציב קו אחר, והוא לא חייב לפרסם אותו.",
      ifCrossed: "הבנק הזה לא יאשר, או ידרוש תיקון. בנק אחר אולי כן.",
      ifNot: "אין מניעה מהקו הזה.",
    },
    {
      key: "threshold",
      kind: "סף הון",
      name: "סף ההון (40%)",
      percent: threshold,
      crossed: r.gt(threshold),
      color: "var(--mogi-warning)",
      whoSets: "בנק ישראל, כדרישה לגבי ההון של הבנק.",
      ifCrossed: "מותר. הבנק מחזיק יותר הון כנגד ההלוואה, וזה עולה לו.",
      ifNot: "ההלוואה לא נושאת את התוספת הזו.",
    },
    {
      key: "limit",
      kind: "מגבלה רגולטורית",
      name: "הוראה 329: עד 50%",
      percent: ban,
      crossed: r.gt(ban),
      color: "var(--mogi-danger)",
      whoSets: "בנק ישראל. זהה בכל הבנקים.",
      ifCrossed: "אסור. אף בנק לא יכול לאשר הלוואה כזו.",
      ifNot: "בתוך המגבלה.",
    },
  ];
});
const maxByPolicy = computed(() => maxPaymentAt(income.value, policy.value));
const maxByThreshold = computed(() => maxPaymentAt(income.value, threshold));
const maxByLimit = computed(() => maxPaymentAt(income.value, ban));
const SCALE = 70;
// Labels sit at up to three heights, chosen by how close a line is to the one before it, so lines a few points apart (35 and 40, or 48 and 50) never cover each other's numbers.
const TOPS = ["-1.5rem", "-2.75rem", "-4rem"];
const labelTops = computed(() => {
  const order = [...lines.value].sort((a, b) => a.percent.comparedTo(b.percent));
  const tops: Record<string, string> = {};
  let level = 0;
  order.forEach((l, i) => {
    if (i > 0 && l.percent.minus(order[i - 1].percent).abs().lt(9)) level = (level + 1) % TOPS.length;
    else level = 0;
    tops[l.key] = TOPS[level];
  });
  return tops;
});
const labelTop = (key: string) => labelTops.value[key];
const pos = (p: Decimal.Value) => `${Math.min(100, (Number(p) / SCALE) * 100)}%`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">
      מספרים להמחשה. 50% לפי תיעוד הצוות להוראה 329, נכון ל־2026-10-09, לא אומת מול המקור. סף ההון (40%) — לא אומת. הקו של בנק א׳ הוא מספר להמחשה: בנק אמיתי יכול להציב קו אחר, ולא ידוע לנו איזה.
    </p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההכנסה הפנויה</span>
        <input v-model.number="income" type="range" min="5000" max="40000" step="500" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(income) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההחזר החודשי שנכנס ליחס</span>
        <input v-model.number="payment" type="range" min="0" max="25000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(payment) }}</span></span>
      </label>
      <label class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-caption font-semibold text-n600">הקו של בנק א׳ (בדוי): יחס החזר מרבי</span>
        <input v-model.number="policy" type="range" min="20" max="50" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ policy }}%</span></span>
      </label>
    </div>

    <p class="mt-4 text-body-l text-n900">יחס ההחזר: <span class="ltr font-semibold">{{ percentString(ratio) }}%</span></p>

    <div class="relative mt-20" role="img" :aria-label="`יחס החזר ${percentString(ratio)}%. מדיניות בנק א׳ ${policy}%, סף הון ${PTI_CAPITAL_THRESHOLD}%, מגבלה רגולטורית ${PTI_LIMIT}%.`">
      <div class="h-4 w-full overflow-hidden rounded-sm bg-n50">
        <div class="h-full" :style="{ width: pos(ratio), background: 'var(--mogi-navy)' }"></div>
      </div>
      <!-- The labels sit at up to three heights (labelTop), so lines a few points apart do not cover each other's numbers. -->
      <div
        v-for="l in lines"
        :key="l.key"
        class="absolute bottom-0 border-s-4 border-dashed"
        :style="{ insetInlineStart: pos(l.percent), borderColor: l.color, top: labelTop(l.key) }"
      >
        <span class="absolute -top-1 start-1 whitespace-nowrap text-caption font-semibold text-n800"><span class="ltr">{{ percentString(l.percent) }}%</span></span>
      </div>
    </div>
    <div class="mt-1 flex justify-between text-caption text-n600" aria-hidden="true"><span>0%</span><span>{{ SCALE }}%</span></div>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-navy)"></span>יחס ההחזר של התיק</li>
      <li v-for="l in lines" :key="l.key" class="flex items-center gap-2">
        <svg class="h-4 w-3" viewBox="0 0 12 16" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="16" :stroke="l.color" stroke-width="3" stroke-dasharray="3 2" /></svg>{{ l.kind }}
      </li>
    </ul>

    <ol class="list-reset mt-4 space-y-3">
      <li
        v-for="l in lines"
        :key="l.key"
        class="rounded-md p-3"
        :class="l.crossed ? (l.key === 'limit' ? 'bg-danger-bg' : l.key === 'threshold' ? 'bg-warning-bg' : 'bg-info-bg') : 'bg-n50'"
      >
        <p class="text-body-m font-semibold text-n900">
          {{ l.kind }} <span class="font-normal text-n600">· {{ l.name }}</span>
          <span class="ms-2 text-caption font-normal">{{ l.crossed ? "נחצה" : "לא נחצה" }}</span>
        </p>
        <p class="mt-1 text-body-m text-n800">{{ l.crossed ? l.ifCrossed : l.ifNot }}</p>
        <p class="text-caption text-n600">מי קובע: {{ l.whoSets }}</p>
      </li>
    </ol>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">סוג המספר</th>
            <th class="py-1 pe-3 text-start font-semibold">הקו</th>
            <th class="py-1 pe-3 text-start font-semibold">ההחזר הגבוה ביותר מתחתיו</th>
            <th class="py-1 text-start font-semibold">מצב</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100">
            <th class="py-1 pe-3 text-start font-normal text-n700">מדיניות בנק (בדוי)</th>
            <td class="py-1 pe-3"><span class="ltr">{{ policy }}%</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(maxByPolicy) }}</span></td>
            <td class="py-1">{{ lines[0].crossed ? "נחצה" : "לא נחצה" }}</td>
          </tr>
          <tr class="border-b border-n100">
            <th class="py-1 pe-3 text-start font-normal text-n700">סף הון</th>
            <td class="py-1 pe-3"><span class="ltr">{{ PTI_CAPITAL_THRESHOLD }}%</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(maxByThreshold) }}</span></td>
            <td class="py-1">{{ lines[1].crossed ? "נחצה" : "לא נחצה" }}</td>
          </tr>
          <tr>
            <th class="py-1 pe-3 text-start font-normal text-n700">מגבלה רגולטורית</th>
            <td class="py-1 pe-3"><span class="ltr">{{ PTI_LIMIT }}%</span></td>
            <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(maxByLimit) }}</span></td>
            <td class="py-1">{{ lines[2].crossed ? "נחצה" : "לא נחצה" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
