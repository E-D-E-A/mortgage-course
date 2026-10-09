<script setup lang="ts">
// Lesson 1.8's illustration: what binds the bank at each moment, from the
// request to the money. The learner steps through the moments (each with what
// the bank must do, what it need not do, and what can change it), then tests a
// case: days since the approval, a new lien or not, what the checks found, and
// whether the borrowers changed their request. The window lengths are props,
// read by the page from data/lessons/1-8.json; days left come from process.ts.
import { computed, ref } from "vue";
import { daysLeft } from "../lib/calc/process.ts";

type Status = "binding" | "conditional" | "none";
interface Moment {
  title: string;
  /** The short verdict on the chip: "מחויב, בתנאי". */
  label: string;
  status: Status;
  must: string[];
  not: string[];
  canChange: string[];
}
const props = defineProps<{
  moments: Moment[];
  windowDays: number;
  windowNoLien: number;
  /** Under the case: where the rules come from and how sure we are. */
  note: string;
}>();

const selected = ref(1);
const moment = computed(() => props.moments[selected.value]);
const showTable = ref(false);

const chip: Record<Status, string> = {
  binding: "bg-success-bg text-n900",
  conditional: "bg-warning-bg text-n900",
  none: "bg-n100 text-n700",
};
const dot: Record<Status, string> = {
  binding: "var(--mogi-success)",
  conditional: "var(--mogi-warning)",
  none: "var(--mogi-n500)",
};

// The case.
const day = ref(10);
const newLien = ref(true);
const checks = ref<"pending" | "ok" | "gap">("pending");
const changed = ref(false);
const windowLength = computed(() => (newLien.value ? props.windowDays : props.windowNoLien));
const left = computed(() => daysLeft(windowLength.value, day.value));
const verdict = computed<{ status: Status; title: string; text: string }>(() => {
  if (changed.value)
    return {
      status: "none",
      title: "לא מחויב לתנאים של האישור",
      text: "ביקשתם משהו אחר ממה שהבנק אישר. התנאים באישור ניתנו על הבקשה המקורית; על בקשה אחרת הבנק רשאי לתת תנאים אחרים.",
    };
  if (left.value < 0)
    return {
      status: "none",
      title: "לא מחויב לתנאים של האישור",
      text: `החלון של ${windowLength.value} יום נגמר לפני ${-left.value} ימים. הבנק כבר לא חייב להחזיק בתנאים. הוא יכול להאריך, לתת תנאים חדשים, או לבקש בקשה חדשה.`,
    };
  if (checks.value === "gap")
    return {
      status: "none",
      title: "לא מחויב לתנאים של האישור",
      text: "הבדיקה מצאה פער בין מה שנמסר לבין המסמכים. גם בתוך החלון, הבנק יכול לשנות את התנאים או לבטל את האישור.",
    };
  if (checks.value === "pending")
    return {
      status: "conditional",
      title: "מחויב לתנאים, בתנאי",
      text: `יום ${day.value} מתוך ${windowLength.value}. הבנק מחזיק בתנאים, בתנאי שמה שמסרתם יתברר כנכון. נשארו ${left.value} ימים.`,
    };
  return {
    status: "binding",
    title: "מחויב לתנאים",
    text: `יום ${day.value} מתוך ${windowLength.value}, והבדיקה מצאה שמה שנמסר נכון. הבנק צריך להלוות לפי התנאים שבאישור. נשארו ${left.value} ימים לסגור את העסקה.`,
  };
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <ul class="list-reset flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill" :style="{ background: dot.binding }"></span>מחויב</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill" :style="{ background: dot.conditional }"></span>מחויב, בתנאי</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill" :style="{ background: dot.none }"></span>לא מחויב לתנאים</li>
    </ul>

    <ol class="list-reset mt-4 grid gap-2 sm:grid-cols-4" aria-label="הרגעים, לפי הסדר">
      <li v-for="(m, i) in moments" :key="m.title">
        <button
          type="button"
          class="flex min-h-11 w-full items-center gap-2 rounded-md border px-3 py-2 text-start text-body-m transition-colors duration-fast ease-out"
          :class="i === selected ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 bg-n0 text-n800 hover:bg-n50'"
          :aria-pressed="i === selected"
          @click="selected = i"
        >
          <span class="inline-block h-3 w-3 shrink-0 rounded-pill" :style="{ background: dot[m.status] }" aria-hidden="true"></span>
          <span>{{ i + 1 }}. {{ m.title }}</span>
        </button>
      </li>
    </ol>

    <div class="mt-4 rounded-md bg-n50 p-4" aria-live="polite">
      <p class="flex flex-wrap items-center gap-2">
        <span class="text-h3 text-navy">{{ moment.title }}</span>
        <span class="rounded-pill px-3 py-0.5 text-caption font-semibold" :class="chip[moment.status]">{{ moment.label }}</span>
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p class="text-caption font-semibold text-n600">הבנק חייב</p>
          <ul class="list-reset mt-1 grid gap-1 text-body-m text-n800">
            <li v-for="x in moment.must" :key="x">{{ x }}</li>
            <li v-if="!moment.must.length" class="text-n600">שום דבר מהאישור.</li>
          </ul>
        </div>
        <div>
          <p class="text-caption font-semibold text-n600">הבנק לא חייב</p>
          <ul class="list-reset mt-1 grid gap-1 text-body-m text-n800">
            <li v-for="x in moment.not" :key="x">{{ x }}</li>
            <li v-if="!moment.not.length" class="text-n600">—</li>
          </ul>
        </div>
        <div>
          <p class="text-caption font-semibold text-n600">מה יכול לשנות את זה</p>
          <ul class="list-reset mt-1 grid gap-1 text-body-m text-n800">
            <li v-for="x in moment.canChange" :key="x">{{ x }}</li>
            <li v-if="!moment.canChange.length" class="text-n600">—</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-md border border-n200 p-4">
      <p class="text-body-l font-semibold text-n900">בדקו מקרה: האישור כבר אצלכם</p>
      <label class="mt-3 flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">עברו {{ day }} ימים מיום האישור</span>
        <input v-model.number="day" type="range" min="0" :max="windowDays + 16" step="1" />
      </label>
      <div class="mt-3 grid gap-2 text-body-m text-n800">
        <label class="flex min-h-11 items-center gap-2"><input v-model="newLien" type="checkbox" class="h-5 w-5" /> נרשם שעבוד חדש על הנכס</label>
        <label class="flex min-h-11 items-center gap-2"><input v-model="changed" type="checkbox" class="h-5 w-5" /> ביקשתם לשנות סכום, תקופה או תמהיל</label>
        <fieldset class="mt-1">
          <legend class="text-caption font-semibold text-n600">מה הבדיקה של הבנק מצאה</legend>
          <div class="mt-1 flex flex-wrap gap-x-4">
            <label class="flex min-h-11 items-center gap-2"><input v-model="checks" type="radio" value="pending" class="h-5 w-5" /> עוד לא בדק</label>
            <label class="flex min-h-11 items-center gap-2"><input v-model="checks" type="radio" value="ok" class="h-5 w-5" /> הכול כמו שנמסר</label>
            <label class="flex min-h-11 items-center gap-2"><input v-model="checks" type="radio" value="gap" class="h-5 w-5" /> פער ממה שנמסר</label>
          </div>
        </fieldset>
      </div>
      <div class="mt-3 rounded-md p-3" :class="chip[verdict.status]" aria-live="polite">
        <p class="text-body-m font-semibold">{{ verdict.title }}</p>
        <p class="mt-1 text-body-m">{{ verdict.text }}</p>
      </div>
      <p class="mt-3 text-caption text-n600">{{ note }}</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[36rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">הרגע</th>
            <th class="py-2 text-start">מצב</th>
            <th class="py-2 text-start">הבנק חייב</th>
            <th class="py-2 text-start">מה יכול לשנות את זה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in moments" :key="m.title" class="border-b border-n100 align-top">
            <td class="py-1 pe-2 font-semibold text-n900">{{ m.title }}</td>
            <td class="py-1 pe-2">{{ m.label }}</td>
            <td class="py-1 pe-2"><span v-for="x in m.must" :key="x" class="block">{{ x }}</span><span v-if="!m.must.length">—</span></td>
            <td class="py-1"><span v-for="x in m.canChange" :key="x" class="block">{{ x }}</span><span v-if="!m.canChange.length">—</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
