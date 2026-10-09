<script setup lang="ts">
// Lesson 1.7's illustration: the twelve steps from the first call to the money,
// with the clocks that run along them. Each step opens to show what happens and
// who does it. The clocks are bars beside the steps they span. Below, the
// learner picks a request date and sees the clocks as dates: the bank's last
// day to answer (business days) and the last day the terms hold (calendar days).
// Every date comes from src/lib/calc/process.ts; the clock lengths are props,
// read by the page from data/lessons/1-7.json.
import { computed, ref, watch } from "vue";
import { addBusinessDays, addCalendarDays, businessDaysBetween, skippedDays, type BankCalendar } from "../lib/calc/process.ts";

interface Step {
  title: string;
  who: string;
  what: string;
  /** The journey stages of the Brain this step covers ("J-050"). */
  journey: string;
}
interface Clock {
  id: string;
  /** Short name in the legend and the steps: "5 ימי עסקים". */
  label: string;
  /** What it measures, one sentence. */
  detail: string;
  /** 1-based step numbers the clock spans. */
  from: number;
  to: number;
  colour: string;
  dashed?: boolean;
}
const props = defineProps<{
  steps: Step[];
  clocks: Clock[];
  answerDays: number;
  answerExtended: number;
  windowDays: number;
  windowNoLien: number;
  closed: string[];
  defaultSent: string;
  /** How many business days the bank took at first (the lesson's worked example). */
  defaultAfter?: number;
  /** The calendar's year: the date picker stays inside it. */
  minDate: string;
  maxDate: string;
  /** Under the calculator: where the rules come from and how sure we are. */
  note: string;
}>();

const open = ref<number | null>(null);
const showTable = ref(false);

const startsAt = (n: number) => props.clocks.filter((c) => c.from === n);
const endsAt = (n: number) => props.clocks.filter((c) => c.to === n && c.to !== c.from);

// The calculator.
const sent = ref(props.defaultSent);
const extended = ref(false);
const newLien = ref(true);
const fridayCounts = ref(true);
const limit = computed(() => (extended.value ? props.answerExtended : props.answerDays));
const answeredAfter = ref(props.defaultAfter ?? props.answerDays);
// Keep the number and the slider's thumb in step: when the limit drops, the value drops with it.
watch(limit, (max) => {
  if (answeredAfter.value > max) answeredAfter.value = max;
});
const after = computed(() => Math.min(answeredAfter.value, limit.value));
const calendar = computed<BankCalendar>(() => ({ fridayCounts: fridayCounts.value, closed: props.closed }));
const windowLength = computed(() => (newLien.value ? props.windowDays : props.windowNoLien));

const valid = computed(() => /^\d{4}-\d{2}-\d{2}$/.test(sent.value) && sent.value >= props.minDate && sent.value <= props.maxDate);
const lastAnswer = computed(() => (valid.value ? addBusinessDays(sent.value, limit.value, calendar.value) : ""));
const approved = computed(() => (valid.value ? addBusinessDays(sent.value, after.value, calendar.value) : ""));
const windowEnd = computed(() => (approved.value ? addCalendarDays(approved.value, windowLength.value) : ""));
const skipped = computed(() => (valid.value ? skippedDays(sent.value, lastAnswer.value, calendar.value) : []));
const counted = computed(() => (valid.value ? businessDaysBetween(sent.value, lastAnswer.value, calendar.value) : 0));

const long = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const short = new Intl.DateTimeFormat("he-IL", { weekday: "short", day: "numeric", month: "short" });
const when = (iso: string) => new Date(`${iso}T12:00:00Z`);
const longDate = (iso: string) => (iso ? long.format(when(iso)) : "");
const shortDate = (iso: string) => short.format(when(iso));
const why = (iso: string) => (when(iso).getUTCDay() === 6 ? "שבת" : when(iso).getUTCDay() === 5 ? "שישי" : "חג");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <ul class="list-reset flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא: השעונים">
      <li v-for="c in clocks" :key="c.id" class="flex items-center gap-2">
        <span
          class="inline-block h-4 w-2 rounded-sm"
          :style="c.dashed ? { border: `2px dashed ${c.colour}` } : { background: c.colour }"
        ></span>
        {{ c.label }}
      </li>
    </ul>

    <ol
      class="list-reset mt-4 grid gap-x-1.5 gap-y-2"
      :style="{ gridTemplateColumns: `minmax(0, 1fr) repeat(${clocks.length}, 0.75rem)` }"
    >
      <li
        v-for="(s, i) in steps"
        :key="i"
        :style="{ gridColumn: '1', gridRow: String(i + 1) }"
      >
        <button
          type="button"
          class="flex min-h-11 w-full items-start gap-3 rounded-md border px-3 py-2 text-start transition-colors duration-fast ease-out"
          :class="open === i ? 'border-navy bg-n50' : 'border-n200 bg-n0 hover:bg-n50'"
          :aria-expanded="open === i"
          @click="open = open === i ? null : i"
        >
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-navy text-caption font-semibold text-n0">{{ i + 1 }}</span>
          <span class="flex min-w-0 flex-col">
            <span class="text-body-m font-semibold text-n900">{{ s.title }}</span>
            <span class="text-caption text-n600">{{ s.who }}</span>
            <span v-for="c in startsAt(i + 1)" :key="`s-${c.id}`" class="text-caption font-semibold text-n800">מתחיל כאן: {{ c.label }}</span>
            <span v-for="c in endsAt(i + 1)" :key="`e-${c.id}`" class="text-caption text-n700">עד כאן: {{ c.label }}</span>
          </span>
        </button>
        <div v-if="open === i" class="mt-2 rounded-md bg-n50 p-3 text-body-m text-n800">
          <p>{{ s.what }}</p>
          <p v-for="c in startsAt(i + 1)" :key="`d-${c.id}`" class="mt-2"><strong>{{ c.label }}:</strong> {{ c.detail }}</p>
          <p class="mt-2 text-caption text-n600">בשלבי המסע ב־Brain: {{ s.journey }}</p>
        </div>
      </li>
      <li
        v-for="(c, k) in clocks"
        :key="c.id"
        class="rounded-pill"
        :style="{
          gridColumn: String(k + 2),
          gridRow: `${c.from} / ${c.to + 1}`,
          ...(c.dashed ? { border: `2px dashed ${c.colour}` } : { background: c.colour }),
        }"
        :title="c.label"
        aria-hidden="true"
      ></li>
    </ol>

    <div class="mt-6 rounded-md bg-n50 p-4">
      <p class="text-body-l font-semibold text-n900">השעונים כתאריכים</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">הבקשה נשלחה ב־</span>
          <input
            v-model="sent"
            type="date"
            :min="minDate"
            :max="maxDate"
            class="h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
            aria-describedby="process-sent-words"
          />
          <span id="process-sent-words" class="text-caption text-n700">{{ valid ? longDate(sent) : "" }}</span>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">הבנק ענה אחרי {{ after }} ימי עסקים</span>
          <input v-model.number="answeredAfter" type="range" min="1" :max="limit" step="1" />
        </label>
      </div>
      <div class="mt-3 grid gap-2 text-body-m text-n800">
        <label class="flex min-h-11 items-center gap-2"><input v-model="extended" type="checkbox" class="h-5 w-5" /> סוג הלוואה שהבנק הגדיר מראש ל־{{ answerExtended }} ימי עסקים</label>
        <label class="flex min-h-11 items-center gap-2"><input v-model="newLien" type="checkbox" class="h-5 w-5" /> נרשם שעבוד חדש על הנכס</label>
        <label class="flex min-h-11 items-center gap-2"><input v-model="fridayCounts" type="checkbox" class="h-5 w-5" /> שישי נספר כיום עסקים (הנחת הקורס, לא אומת)</label>
      </div>

      <dl v-if="valid" class="mt-3 grid gap-3" aria-live="polite">
        <div class="rounded-md border border-n200 bg-n0 p-3">
          <dt class="text-caption font-semibold text-n600">היום האחרון לתשובה ({{ limit }} ימי עסקים)</dt>
          <dd class="text-body-l font-semibold text-navy">{{ longDate(lastAnswer) }}</dd>
          <dd class="mt-1 text-caption text-n700">
            נספרו {{ counted }} ימים.
            <template v-if="skipped.length">לא נספרו: <span v-for="(d, k) in skipped" :key="d">{{ shortDate(d) }} ({{ why(d) }}){{ k < skipped.length - 1 ? "; " : "." }}</span></template>
          </dd>
        </div>
        <div class="rounded-md border border-n200 bg-n0 p-3">
          <dt class="text-caption font-semibold text-n600">האישור הגיע</dt>
          <dd class="text-body-l font-semibold text-n900">{{ longDate(approved) }}</dd>
        </div>
        <div class="rounded-md border border-n200 bg-n0 p-3">
          <dt class="text-caption font-semibold text-n600">התנאים נשמרים לפחות עד ({{ windowLength }} ימים, כולל שבתות וחגים)</dt>
          <dd class="text-body-l font-semibold text-navy">{{ longDate(windowEnd) }}</dd>
        </div>
      </dl>
      <p v-else class="mt-3 text-body-m text-n700">בחרו תאריך בטווח של לוח החגים שבידינו.</p>
      <p class="mt-3 text-caption text-n600">{{ note }}</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">צעד</th>
            <th class="py-2 pe-2 text-start">מה קורה</th>
            <th class="py-2 pe-2 text-start">שעון</th>
            <th class="py-2 text-start">מי</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in steps" :key="i" class="border-b border-n100 align-top">
            <td class="py-1 pe-2">{{ i + 1 }}</td>
            <td class="py-1 pe-2">{{ s.title }}</td>
            <td class="py-1 pe-2">
              <span v-for="c in startsAt(i + 1)" :key="c.id" class="block">מתחיל: {{ c.label }}</span>
              <span v-for="c in endsAt(i + 1)" :key="c.id" class="block text-n600">עד כאן: {{ c.label }}</span>
            </td>
            <td class="py-1">{{ s.who }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
