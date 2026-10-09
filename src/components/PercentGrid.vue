<script setup lang="ts">
// The percent illustration (lesson 0.1). A whole amount is drawn as 100
// squares, so one square is one percent of it. The learner moves the amount
// and the percent and sees what one square is worth and what the chosen
// percent comes to. A second percent can be switched on, to compare two
// percentages: their gap in percentage points, and the same gap measured
// relative to the first one. Every number comes from the course's calc module.
import { computed, ref } from "vue";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { onePercent, percentagePoints, percentOf, percentString, relativeChangePercent } from "../lib/calc/percent.ts";

const props = withDefaults(defineProps<{ amount?: number; percent?: number; compareTo?: number }>(), {
  amount: 200,
  percent: 3,
  compareTo: 5,
});

const amount = ref(props.amount);
const percent = ref(props.percent);
const comparing = ref(false);
const second = ref(props.compareTo);
const showTable = ref(false);

const one = computed(() => onePercent(amount.value));
const part = computed(() => percentOf(amount.value, String(percent.value)));
const secondPart = computed(() => percentOf(amount.value, String(second.value)));
const gapPoints = computed(() => percentagePoints(String(percent.value), String(second.value)));
const relative = computed(() => (percent.value === 0 ? null : relativeChangePercent(String(percent.value), String(second.value))));
const signed = (s: string) => (s.startsWith("-") ? `−${s.slice(1)}` : s === "0" ? s : `+${s}`);

// Square i (0–99) is filled when it lies inside the first percent; in comparison mode the
// squares between the two percents are the gap: added (turquoise) or taken away (outlined).
function kind(i: number): "base" | "added" | "removed" | "empty" {
  const a = percent.value;
  const b = comparing.value ? second.value : a;
  if (i < Math.min(a, b)) return "base";
  if (i < b) return "added";
  if (i < a) return "removed";
  return "empty";
}
const squares = Array.from({ length: 100 }, (_, i) => i);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הסכום כולו (100 הריבועים)</span>
        <input v-model.number="amount" type="range" min="100" max="10000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(amount) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">{{ comparing ? "האחוז הראשון" : "האחוז" }}</span>
        <input v-model.number="percent" type="range" min="0" max="100" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ percent }}%</span></span>
      </label>
      <label v-if="comparing" class="flex flex-col gap-1 sm:col-start-2">
        <span class="text-caption font-semibold text-n600">האחוז השני</span>
        <input v-model.number="second" type="range" min="0" max="100" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ second }}%</span></span>
      </label>
    </div>

    <label class="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-body-m text-n800">
      <input v-model="comparing" type="checkbox" class="h-5 w-5 accent-teal-deep" />
      השוואה בין שני אחוזים
    </label>

    <div class="mt-4 grid gap-3" :class="comparing ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ריבוע אחד (1%) שווה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(one) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600"><span class="ltr">{{ percent }}%</span> מ־<span class="ltr">{{ formatShekelsText(amount) }}</span></p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(part) }}</span></p>
      </div>
      <div v-if="comparing" class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">מ־<span class="ltr">{{ percent }}%</span> ל־<span class="ltr">{{ second }}%</span></p>
        <p class="text-body-l font-semibold text-n900">
          <template v-if="gapPoints.abs().eq(1)">{{ gapPoints.isNegative() ? "ירידה של" : "עלייה של" }} נקודת אחוז אחת</template>
          <template v-else><span class="ltr">{{ signed(percentString(gapPoints)) }}</span> נקודות אחוז</template>
        </p>
        <p class="text-body-m text-n700">
          <template v-if="relative !== null">שינוי יחסי: <span class="ltr">{{ signed(percentString(relative)) }}%</span></template>
          <template v-else>שינוי יחסי: אין — אי אפשר למדוד שינוי יחסי מ־0%</template>
        </p>
      </div>
    </div>
    <p class="mt-2 text-caption text-n600">המחשה מעגלת לאגורה. אחוזים מעוגלים לשתי ספרות אחרי הנקודה.</p>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>{{ comparing ? "החלק המשותף לשני האחוזים" : "האחוז שבחרתם" }}</li>
      <li v-if="comparing" class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>נוסף באחוז השני</li>
      <li v-if="comparing" class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm border-2 border-teal-deep bg-n0"></span>ירד באחוז השני</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n200)"></span>שאר הסכום</li>
    </ul>

    <div
      class="mx-auto mt-3 grid max-w-sm grid-cols-10 gap-1"
      role="img"
      :aria-label="comparing ? `מאה ריבועים: ${percent} מסומנים באחוז הראשון, ${second} באחוז השני` : `מאה ריבועים, ${percent} מהם מסומנים`"
    >
      <span
        v-for="i in squares"
        :key="i"
        class="aspect-square rounded-sm"
        :class="{
          'bg-teal-deep': kind(i) === 'base',
          'bg-turquoise-2': kind(i) === 'added',
          'border-2 border-teal-deep bg-n0': kind(i) === 'removed',
          'bg-n200': kind(i) === 'empty',
        }"
      ></span>
    </div>
    <p class="mt-2 text-center text-caption text-n600">כל ריבוע הוא 1% — חלק אחד מתוך 100</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">אחוז</th>
            <th class="py-2 text-start">כמה ריבועים</th>
            <th class="py-2 text-start">בשקלים</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100">
            <td class="py-1"><span class="ltr">1%</span></td>
            <td class="py-1">1</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(one) }}</span></td>
          </tr>
          <tr class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ percent }}%</span></td>
            <td class="py-1">{{ percent }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(part) }}</span></td>
          </tr>
          <tr v-if="comparing" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ second }}%</span></td>
            <td class="py-1">{{ second }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(secondPart) }}</span></td>
          </tr>
          <tr class="border-b border-n100">
            <td class="py-1"><span class="ltr">100%</span></td>
            <td class="py-1">100</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(amount) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
