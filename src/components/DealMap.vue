<script setup lang="ts">
// The deal map of lesson 1.10 (the stage's first product): who takes part in
// the deal and what each brings, as cards, and the key numbers, some of them
// left for the learner to fill. What the learner types, and which numbers are
// already right, are kept in this browser through progress.ts (load/save), so
// the map survives a reload. A print view lays it out flat, and the print
// button prints this map only (the same print marking as DiyChecklist).
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { load, parseAnswer, save } from "../lib/progress.ts";

interface Person {
  who: string;
  what: string;
}
interface NumberRow {
  key: string;
  label: string;
  /** Shekels, as in the lesson's data file. */
  value: string;
  /** Left for the learner to fill. */
  blank?: boolean;
  /** A short line under the row: what it is made of, or that it is an assumption. */
  note?: string;
}
const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    people: Person[];
    numbers: NumberRow[];
    /** Shown when a filled number is wrong: where to look. */
    hint: string;
    /** Shown when every blank is right. */
    success: string;
    printNote?: string;
  }>(),
  { printNote: undefined },
);

interface Saved {
  entered: Record<string, string>;
  solved: string[];
}
const storageKey = `dealmap:${props.id}`;
const entered = reactive<Record<string, string>>({});
const solved = reactive<Record<string, boolean>>({});
const wrong = reactive<Record<string, boolean>>({});
const checkedOnce = ref(false);
const printView = ref(false);
const printing = ref(false);

const blanks = () => props.numbers.filter((n) => n.blank);
const allSolved = () => blanks().every((n) => solved[n.key]);

onMounted(() => {
  const saved = load<Saved>(storageKey);
  if (saved) {
    Object.assign(entered, saved.entered ?? {});
    for (const k of saved.solved ?? []) solved[k] = true;
  }
  window.addEventListener("afterprint", endPrint);
});
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));

function persist() {
  const value: Saved = { entered: { ...entered }, solved: Object.keys(solved).filter((k) => solved[k]) };
  save(storageKey, value);
}
function check() {
  checkedOnce.value = true;
  for (const n of blanks()) {
    const v = parseAnswer((entered[n.key] ?? "").replace("−", "-"));
    const ok = v !== null && Math.abs(v - Number(n.value)) <= 0.02;
    solved[n.key] = ok;
    wrong[n.key] = !ok;
  }
  persist();
}
function onInput(key: string, value: string) {
  entered[key] = value;
  wrong[key] = false;
  persist();
}

async function printNow() {
  printView.value = true;
  printing.value = true;
  document.documentElement.classList.add("diy-printing");
  await nextTick();
  window.print();
}
function endPrint() {
  printing.value = false;
  document.documentElement.classList.remove("diy-printing");
}
const shown = (n: NumberRow) => (!n.blank || solved[n.key] ? formatShekels(n.value) : null);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" :data-diy-print="printing ? 'active' : null">
    <p class="text-body-l font-semibold text-n900">{{ title }}</p>
    <div class="diy-no-print mt-2 flex flex-wrap gap-x-4 gap-y-1">
      <button type="button" class="min-h-11 min-w-11 text-body-m text-navy underline" :aria-pressed="printView" @click="printView = !printView">
        {{ printView ? "חזרה למפה" : "תצוגה להדפסה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
    </div>
    <p class="diy-no-print mt-1 text-caption text-n600">מה שתכתבו נשמר בדפדפן הזה בלבד.</p>

    <!-- Flat view: what is printed. -->
    <div v-if="printView" class="mt-4 text-body-m text-n800">
      <p v-if="printNote" class="rounded-md border border-n200 p-3 text-caption text-n700">{{ printNote }}</p>
      <h3 class="mt-4 text-h3 text-n900">מי בעסקה</h3>
      <ul class="list-reset mt-2">
        <li v-for="p in people" :key="p.who" class="border-b border-n100 py-1.5"><strong>{{ p.who }}:</strong> {{ p.what }}</li>
      </ul>
      <h3 class="mt-4 text-h3 text-n900">המספרים</h3>
      <ul class="list-reset mt-2">
        <li v-for="n in numbers" :key="n.key" class="flex justify-between gap-4 border-b border-n100 py-1.5">
          <span>{{ n.label }}<span v-if="n.note" class="block text-caption text-n600">{{ n.note }}</span></span>
          <span class="ltr shrink-0 font-semibold">{{ shown(n) ?? (entered[n.key] ? `${entered[n.key]} (לא נבדק)` : "______") }}</span>
        </li>
      </ul>
    </div>

    <template v-else>
      <h3 class="mt-4 text-body-l font-semibold text-n900">מי בעסקה, ומה כל אחד מביא</h3>
      <ul class="list-reset mt-2 grid gap-2 sm:grid-cols-2">
        <li v-for="p in people" :key="p.who" class="rounded-md border border-n200 p-3">
          <p class="text-body-m font-semibold text-n900">{{ p.who }}</p>
          <p class="mt-1 text-body-m text-n700">{{ p.what }}</p>
        </li>
      </ul>

      <h3 class="mt-5 text-body-l font-semibold text-n900">המספרים</h3>
      <ul class="list-reset mt-2">
        <li v-for="n in numbers" :key="n.key" class="flex min-h-11 items-center justify-between gap-3 border-b border-n100 py-2">
          <label :for="`dm-${id}-${n.key}`" class="text-body-m text-n800">
            {{ n.label }}
            <span v-if="n.note" class="block text-caption text-n600">{{ n.note }}</span>
          </label>
          <span v-if="shown(n)" class="ltr shrink-0 text-body-m font-semibold text-n900" >{{ shown(n) }}<span v-if="n.blank" class="ms-1 text-caption text-n600">✓</span></span>
          <input
            v-else
            :id="`dm-${id}-${n.key}`"
            :value="entered[n.key] ?? ''"
            inputmode="decimal"
            autocomplete="off"
            dir="ltr"
            class="h-11 w-32 shrink-0 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
            :class="wrong[n.key] ? 'border-danger shadow-ring-error' : 'border-n200'"
            @input="onInput(n.key, ($event.target as HTMLInputElement).value)"
          />
        </li>
      </ul>
      <button
        v-if="!allSolved()"
        type="button"
        class="diy-no-print mt-4 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="check"
      >
        בדיקה
      </button>
      <p v-if="allSolved()" class="mt-3 rounded-md bg-success-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">הכול נכון.</strong> {{ success }}
      </p>
      <p v-else-if="checkedOnce" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800" aria-live="polite">
        יש מספרים שעוד לא נכונים (מסומנים באדום). {{ hint }}
      </p>
    </template>
  </div>
</template>

<style>
/* The same print marking as DiyChecklist: print only the block whose print button was pressed. */
@media print {
  html.diy-printing body *:not([data-diy-print="active"]):not(:has([data-diy-print="active"])):not([data-diy-print="active"] *) {
    display: none !important;
  }
  html.diy-printing [data-diy-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  .diy-no-print {
    display: none !important;
  }
}
</style>
