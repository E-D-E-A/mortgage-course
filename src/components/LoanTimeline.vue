<script setup lang="ts">
// The simple-interest illustration (lesson 0.2): a small loan on a time line.
// Today the lender gives the principal; at the end of every year the borrower
// pays the year's interest; at the end the principal comes back. The learner
// moves the amount, the rate and the number of years and sees that every
// year's interest is the same, because it is computed on the principal only.
// Every number comes from the course's calc module.
import { computed, ref } from "vue";
import { simpleBalance } from "../lib/calc/compound.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { simpleInterest, simpleInterestTable } from "../lib/calc/simple.ts";

const props = withDefaults(defineProps<{ principal?: number; rate?: number; years?: number }>(), {
  principal: 100,
  rate: 5,
  years: 3,
});

const principal = ref(props.principal);
const rate = ref(props.rate);
const years = ref(props.years);
const showTable = ref(false);
const hover = ref<number | null>(null);

const rows = computed(() => simpleInterestTable(principal.value, String(rate.value), years.value));
const yearly = computed(() => rows.value[0].interest);
const totalInterest = computed(() => simpleInterest(principal.value, String(rate.value), years.value));
const total = computed(() => simpleBalance(principal.value, String(rate.value), years.value));
// Year 0 (today) plus one column per year. In RTL the first column is on the right, so time runs leftward.
const columns = computed(() => Array.from({ length: years.value + 1 }, (_, i) => i));
const showValues = computed(() => years.value <= 5);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הקרן — הסכום שמשאילים</span>
        <input v-model.number="principal" type="range" min="100" max="20000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(principal) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ריבית לשנה</span>
        <input v-model.number="rate" type="range" min="1" max="12" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר שנים</span>
        <input v-model.number="years" type="range" min="1" max="10" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years === 1 ? "שנה אחת" : `${years} שנים` }}</span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הריבית בכל שנה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(yearly) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">כל הריבית, ב־{{ years === 1 ? "שנה אחת" : `${years} שנים` }}</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(totalInterest) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הלווה משלם בסך הכול (קרן וריבית)</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ formatShekelsText(total) }}</span></p>
      </div>
    </div>

    <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)"></span>קרן: עוברת מהמלווה ללווה היום, וחוזרת בסוף</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ריבית: הלווה משלם למלווה בסוף כל שנה</li>
    </ul>

    <div class="relative mt-3" role="img" :aria-label="`ציר זמן: היום ניתנת קרן של ${formatShekelsText(principal)}; בסוף כל אחת מ־${years} השנים משולמת ריבית של ${formatShekelsText(yearly)}; בסוף חוזרת הקרן`">
      <div class="grid items-end gap-1" :style="{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }">
        <div
          v-for="i in columns"
          :key="i"
          class="flex h-36 flex-col items-center justify-end"
          tabindex="0"
          @mouseenter="hover = i"
          @mouseleave="hover = null"
          @focus="hover = i"
          @blur="hover = null"
        >
          <template v-if="i > 0">
            <span v-if="showValues" class="mb-1 text-caption text-n700"><span class="ltr">{{ formatShekelsText(yearly) }}</span></span>
            <span class="block h-24 w-full max-w-12 rounded-t-sm bg-teal-deep" :class="hover === null || hover === i ? '' : 'opacity-45'"></span>
          </template>
        </div>
      </div>
      <div class="relative mt-1 grid gap-1 border-t-2 border-n300 pt-1" :style="{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }" aria-hidden="true">
        <span v-for="i in columns" :key="i" class="text-center text-caption text-n600">{{ i === 0 ? "היום" : i }}</span>
      </div>
      <div class="mt-2 grid gap-1" :style="{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }" aria-hidden="true">
        <span v-for="i in columns" :key="i" class="flex justify-center">
          <span v-if="i === 0 || i === years" class="rounded-sm px-1 py-0.5 text-center text-caption text-n900" style="background: var(--mogi-n300)">
            קרן
          </span>
        </span>
      </div>
      <p class="mt-1 text-center text-caption text-n600">שנים (מימין לשמאל). הקרן לא מצוירת בקנה מידה — היא גדולה בהרבה מהריבית של שנה.</p>
      <div
        v-if="hover !== null"
        class="pointer-events-none absolute top-0 start-0 z-tooltip rounded-md border border-n200 bg-n0 p-3 text-caption text-n800 shadow-md"
        role="status"
      >
        <template v-if="hover === 0">
          <p class="font-semibold text-n900">היום</p>
          <p>המלווה נותן ללווה <span class="ltr">{{ formatShekelsText(principal) }}</span></p>
        </template>
        <template v-else>
          <p class="font-semibold text-n900">סוף שנה {{ hover }}</p>
          <p>ריבית השנה: <span class="ltr">{{ formatShekelsText(rows[hover - 1].interest) }}</span></p>
          <p>כל הריבית עד עכשיו: <span class="ltr">{{ formatShekelsText(rows[hover - 1].totalInterest) }}</span></p>
          <p v-if="hover === years">ועוד החזר הקרן: <span class="ltr">{{ formatShekelsText(principal) }}</span></p>
        </template>
      </div>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">מתי</th>
            <th class="py-2 text-start">ריבית</th>
            <th class="py-2 text-start">כל הריבית עד עכשיו</th>
            <th class="py-2 text-start">קרן</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100">
            <td class="py-1">היום</td>
            <td class="py-1">—</td>
            <td class="py-1">—</td>
            <td class="py-1">המלווה נותן <span class="ltr">{{ formatShekels(principal) }}</span></td>
          </tr>
          <tr v-for="r in rows" :key="r.period" class="border-b border-n100">
            <td class="py-1">סוף שנה {{ r.period }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.interest) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.totalInterest) }}</span></td>
            <td class="py-1">
              <template v-if="r.period === years">חוזרת: <span class="ltr">{{ formatShekels(principal) }}</span></template>
              <template v-else>—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
