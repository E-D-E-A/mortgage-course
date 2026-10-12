<script setup lang="ts">
// Lesson 4.9's illustration: the appraisal against the price. The learner moves
// the price, the appraisal and the loan, picks a deal type's ceiling, and sees
// the financing ratio and the largest loan two ways: measured against the price,
// and against the lower of the price and the appraisal (the rule a search summary
// of a Bank of Israel document gives; not verified, and lesson 1.2 left it open).
// Numbers from ltv.ts and underwriting.ts; the ceilings come from the page.
import { computed, ref } from "vue";
import { ltvPercent, maxLoan } from "../lib/calc/ltv.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { lowerOf } from "../lib/calc/underwriting.ts";

interface Ceiling {
  value: string;
  label: string;
}
const props = withDefaults(
  defineProps<{ price?: number; appraisal?: number; loan?: number; ceilings: Ceiling[]; source: string }>(),
  { price: 1650000, appraisal: 1560000, loan: 1130000 },
);

const price = ref(props.price);
const appraisal = ref(props.appraisal);
const loan = ref(props.loan);
const picked = ref(0);
const showTable = ref(false);
const MIN = 500000;
const MAX = 4000000;

const ceiling = computed(() => props.ceilings[picked.value]);
const used = computed(() => lowerOf(price.value, appraisal.value));
const sides = computed(() =>
  [
    { key: "price", title: "מול המחיר", value: price.value },
    { key: "lower", title: "מול הנמוך מבין המחיר לשמאות", value: used.value.toNumber() },
  ].map((s) => {
    const ratio = ltvPercent(loan.value, s.value);
    const most = maxLoan(s.value, ceiling.value.value);
    const over = ratio.gt(ceiling.value.value);
    return { ...s, ratio, most, over, missing: over ? most.minus(loan.value).neg() : null };
  }),
);
const pct = (d: { toDecimalPlaces: (n: number) => { toString: () => string } }) => `${d.toDecimalPlaces(1).toString()}%`;
const below = computed(() => appraisal.value < price.value);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה. {{ source }}</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">המחיר בחוזה</span>
        <input v-model.number="price" type="range" :min="MIN" :max="MAX" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(price) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">השווי לפי השמאי</span>
        <input v-model.number="appraisal" type="range" :min="MIN" :max="MAX" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(appraisal) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההלוואה המבוקשת</span>
        <input v-model.number="loan" type="range" min="0" :max="MAX" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(loan) }}</span></span>
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
          <input v-model="picked" type="radio" name="appraisal-gap-ceiling" :value="i" class="accent-teal-deep" />
          <span><span class="ltr">{{ c.value }}%</span> · {{ c.label }}</span>
        </label>
      </div>
    </fieldset>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div v-for="s in sides" :key="s.key" class="rounded-md border p-4" :class="s.over ? 'border-warning bg-warning-bg' : 'border-n200 bg-n50'">
        <p class="text-body-m font-semibold text-n900">{{ s.title }}</p>
        <p class="text-caption text-n600">השווי לחישוב: <span class="ltr">{{ formatShekelsText(s.value) }}</span></p>
        <p class="mt-2 text-caption text-n600">שיעור המימון</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ pct(s.ratio) }}</span></p>
        <p class="text-caption text-n600">הלוואה מרבית בתקרה: <span class="ltr">{{ formatShekelsText(s.most) }}</span></p>
        <p class="mt-2 text-body-m text-n800" role="status">
          <template v-if="s.over">מעל התקרה. חסרים <span class="ltr">{{ formatShekelsText(s.missing!) }}</span> הון עצמי, או הלוואה קטנה יותר.</template>
          <template v-else>בתוך התקרה.</template>
        </p>
      </div>
    </div>

    <p class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800">
      <template v-if="below">השמאי העריך את הדירה ב־<span class="ltr">{{ formatShekelsText(price - appraisal) }}</span> פחות מהמחיר. אם מודדים מול הנמוך מבין השניים, זה מה שמזיז את שיעור המימון.</template>
      <template v-else>השמאות לא נמוכה מהמחיר, ולכן שתי הדרכים נותנות אותה תשובה.</template>
    </p>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-n50 ring-1 ring-n200"></span>בתוך התקרה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-warning-bg ring-1 ring-warning"></span>מעל התקרה</li>
    </ul>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[22rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 text-start font-semibold"></th>
            <th v-for="s in sides" :key="s.key" class="py-1 text-start font-semibold">{{ s.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">השווי לחישוב</th><td v-for="s in sides" :key="s.key" class="py-1"><span class="ltr">{{ formatShekels(s.value) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">שיעור המימון</th><td v-for="s in sides" :key="s.key" class="py-1"><span class="ltr">{{ pct(s.ratio) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הלוואה מרבית (<span class="ltr">{{ ceiling.value }}%</span>)</th><td v-for="s in sides" :key="s.key" class="py-1"><span class="ltr">{{ formatShekels(s.most) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">הון עצמי שחסר</th><td v-for="s in sides" :key="s.key" class="py-1"><span class="ltr">{{ s.missing ? formatShekels(s.missing) : "—" }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
