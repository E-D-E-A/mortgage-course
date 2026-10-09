<script setup lang="ts">
// Lesson 2.7's illustration: a timeline of a track's update points (נקודות עדכון ריבית).
// The learner sets the term, the interval between updates and "today", and sees where
// the variable track's rate is set again, how many times, and how far the next update
// is — beside a fixed track (never) and a prime track (at any Bank of Israel decision).
// Every update point is also an exit point (intro level). The arithmetic is in
// amortization.ts (updateMonths, nextUpdateMonth); this file only lays it out.
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { monthsToNextUpdate, nextUpdateMonth, updateMonths } from "../lib/calc/amortization.ts";

const props = withDefaults(defineProps<{ years?: number; intervalMonths?: number; now?: number; intervals?: number[] }>(), {
  years: 20,
  intervalMonths: 60,
  now: 38,
  intervals: () => [12, 24, 30, 36, 60, 72, 84, 120],
});

const years = ref(props.years);
const interval = ref(props.intervalMonths);
const now = ref(props.now);
const showTable = ref(false);

const term = computed(() => years.value * 12);
// Keep "today" inside the loan when the term gets shorter.
watch(term, (t) => {
  if (now.value > t) now.value = t;
});

const yearsText = (months: number) => new Decimal(months).div(12).toDecimalPlaces(2).toString();
const intervalLabel = (m: number) => (m === 12 ? "כל שנה" : `כל ${yearsText(m)}`);
const points = computed(() => updateMonths(term.value, interval.value));
const next = computed(() => nextUpdateMonth(term.value, interval.value, now.value));
const wait = computed(() => monthsToNextUpdate(term.value, interval.value, now.value));
const monthsText = (n: number) => (n === 1 ? "חודש אחד" : n === 2 ? "חודשיים" : `${n} חודשים`);
const countText = computed(() =>
  points.value.length === 0 ? "אין נקודות עדכון" : points.value.length === 1 ? "נקודת עדכון אחת" : `${points.value.length} נקודות עדכון`,
);
const position = (month: number) => `${(month / term.value) * 100}%`;
// Label only some points when they are dense, so labels never collide.
const labelEvery = computed(() => Math.ceil(points.value.length / 8));
const nowText = computed(() => {
  const y = Math.floor(now.value / 12);
  const m = now.value % 12;
  if (now.value === 0) return "יום ההלוואה";
  return [y > 0 ? (y === 1 ? "שנה" : y === 2 ? "שנתיים" : `${y} שנים`) : "", m > 0 ? monthsText(m) : ""].filter(Boolean).join(" ו־") + " מתחילת ההלוואה";
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">ציר הזמן של מסלול אחד, מיום ההלוואה (מימין) ועד סופה (משמאל). התקופות להמחשה; מה שקובע הוא החוזה.</p>

    <div class="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">תקופת המסלול</span>
        <input v-model.number="years" type="range" min="5" max="30" step="1" aria-label="תקופת המסלול בשנים" />
        <span class="text-body-m font-semibold text-n900">{{ years }} שנים</span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">היום</span>
        <input v-model.number="now" type="range" min="0" :max="term" step="1" aria-label="כמה חודשים עברו מתחילת ההלוואה" />
        <span class="text-body-m font-semibold text-n900">{{ nowText }}</span>
      </label>
    </div>

    <fieldset class="mt-3">
      <legend class="text-caption font-semibold text-n600">כל כמה שנים אחוז הריבית במסלול המשתנה נקבע מחדש</legend>
      <div class="mt-1 flex flex-wrap gap-2" role="group">
        <button
          v-for="m in intervals"
          :key="m"
          type="button"
          class="min-h-11 min-w-11 rounded-md border px-3 text-body-m"
          :class="interval === m ? 'border-navy bg-navy text-n0' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="interval === m"
          @click="interval = m"
        >
          {{ intervalLabel(m) }}
        </button>
      </div>
    </fieldset>

    <!-- The three lanes. Positions use inline-start, so day 0 is on the right in RTL. -->
    <div class="mt-5 space-y-5" aria-hidden="true">
      <div>
        <p class="text-caption font-semibold text-n700">מסלול משתנה, {{ intervalLabel(interval) }}{{ interval === 12 ? "" : " שנים" }}</p>
        <div class="relative mt-2 h-3 rounded-pill bg-n100">
          <span class="absolute inset-y-0 start-0 rounded-pill" :style="{ width: position(now), background: 'var(--mogi-n300)' }"></span>
          <span class="absolute -inset-y-1.5 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: position(now) }"></span>
          <span
            v-for="p in points"
            :key="p"
            class="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-pill border-2 border-n0"
            :style="{ insetInlineStart: `calc(${position(p)} - 8px)`, background: p === next ? 'var(--mogi-navy)' : 'var(--mogi-teal-deep)' }"
          ></span>
        </div>
        <div class="relative mt-1 h-4 text-caption text-n600">
          <span v-for="(p, i) in points" v-show="i % labelEvery === 0" :key="p" class="absolute whitespace-nowrap" :style="{ insetInlineStart: `calc(${position(p)} - 10px)` }">{{ yearsText(p) }}</span>
        </div>
      </div>
      <div>
        <p class="text-caption font-semibold text-n700">מסלול פריים</p>
        <div class="relative mt-2 h-3 rounded-pill" style="background: repeating-linear-gradient(90deg, var(--mogi-turquoise-2) 0 2px, var(--mogi-n100) 2px 10px)">
          <span class="absolute -inset-y-1.5 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: position(now) }"></span>
        </div>
        <p class="mt-1 text-caption text-n600">יכול לזוז בכל החלטה של בנק ישראל, כמה פעמים בשנה</p>
      </div>
      <div>
        <p class="text-caption font-semibold text-n700">מסלול קבוע</p>
        <div class="relative mt-2 h-3 rounded-pill bg-n100">
          <span class="absolute -inset-y-1.5 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: position(now) }"></span>
        </div>
        <p class="mt-1 text-caption text-n600">אחוז הריבית לא נקבע מחדש אף פעם</p>
      </div>
    </div>

    <div class="mt-4 rounded-md bg-n50 p-3" role="status" aria-live="polite">
      <p class="text-body-m text-n800">
        <strong class="text-n900">{{ countText }}</strong>
        <template v-if="points.length">, אחרי {{ points.map((p) => yearsText(p)).join(", ") }} שנים.</template>
        <template v-else>: המסלול נגמר לפני שאחוז הריבית נקבע מחדש.</template>
        ביום האחרון של ההלוואה אין עדכון: היא נגמרת.
      </p>
      <p class="mt-1 text-body-m text-n800">
        <template v-if="next !== null">
          הנקודה הבאה: בחודש {{ next }} (אחרי {{ yearsText(next) }} שנים), <strong class="text-n900">בעוד {{ monthsText(wait ?? 0) }}</strong>.
        </template>
        <template v-else>לא נשארו נקודות עדכון עד סוף ההלוואה.</template>
      </p>
      <p class="mt-1 text-caption text-n600">כל נקודת עדכון היא גם תחנת יציאה: יום שבו אפשר לפרוע את המסלול המשתנה בלי הקנס הגדול.</p>
    </div>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill" style="background: var(--mogi-teal-deep)"></span>נקודת עדכון</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill bg-navy"></span>הנקודה הבאה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>היום</li>
    </ul>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">נקודה</th>
            <th class="py-2 text-start">חודש</th>
            <th class="py-2 text-start">אחרי שנים</th>
            <th class="py-2 text-start">ביחס להיום</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in points" :key="p" class="border-b border-n100">
            <td class="py-1">{{ i + 1 }}</td>
            <td class="py-1">{{ p }}</td>
            <td class="py-1">{{ yearsText(p) }}</td>
            <td class="py-1">{{ p <= now ? "עברה" : p === next ? "הבאה" : "בהמשך" }}</td>
          </tr>
          <tr v-if="!points.length"><td colspan="4" class="py-1">אין נקודות עדכון בתקופה הזו.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
