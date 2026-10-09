<script setup lang="ts">
// The workshop checklist of lesson 1.10 ("עושים את זה לבד"). One card per step:
// what happens, what to bring, what to ask, and where people usually fall —
// each item with the kind and source of the claim. The learner ticks items and
// writes a note per step; both are kept in this browser through progress.ts
// (load/save), so they survive a reload. A print view lays every step out flat,
// with ☐/☑ instead of checkboxes, and the print button prints this list only.
// The same component holds the first-meeting question list (a step per topic).
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { load, save } from "../lib/progress.ts";

type SourceKind =
  | "עובדה מאומתת"
  | "החלטה של Mogi"
  | "ידע מהשטח"
  | "מחקר / הצעה"
  | "הנחת חישוב"
  | "לא אומת"
  | "ידע מתמטי כללי"
  | "ידע כלכלי כללי";
interface Source {
  kind: SourceKind;
  text: string;
}
interface Item {
  id: string;
  text: string;
  /** Where the claim comes from: its kind and source. Several when sources disagree. */
  source?: Source | Source[];
}
interface Group {
  label: string;
  /** warning: a trap ("where people fall"); known: facts already known, not ticked. */
  tone?: "plain" | "warning" | "known";
  note?: string;
  items: Item[];
}
interface Step {
  id: string;
  title: string;
  summary?: string;
  groups: Group[];
}
const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    steps: Step[];
    /** "צעד" → "צעד 1", "צעד 2"… */
    stepLabel?: string;
    /** Printed at the top of the print view (the "דוגמה לימודית" marking, for example). */
    printNote?: string;
  }>(),
  { stepLabel: "צעד", printNote: undefined },
);

interface Saved {
  checked: string[];
  notes: Record<string, string>;
}
const storageKey = `checklist:${props.id}`;
const checked = reactive<Record<string, boolean>>({});
const notes = reactive<Record<string, string>>({});
const open = reactive<Record<string, boolean>>({ [props.steps[0]?.id ?? ""]: true });
const printView = ref(false);
const printing = ref(false);
const confirmReset = ref(false);

const checkable = (g: Group) => g.tone !== "known";
/** A pitfall is ticked when you have checked that it does not happen to you; the list says so. */
const noteOf = (g: Group) => g.note ?? (g.tone === "warning" ? "סמנו כשבדקתם שזה לא קורה לכם." : undefined);
const sourcesOf = (item: Item): Source[] => (item.source ? (Array.isArray(item.source) ? item.source : [item.source]) : []);
const keyOf = (s: Step, item: Item) => `${s.id}.${item.id}`;
const itemsOf = (s: Step) => s.groups.filter(checkable).flatMap((g) => g.items.map((i) => keyOf(s, i)));
const total = computed(() => props.steps.reduce((n, s) => n + itemsOf(s).length, 0));
const doneIn = (s: Step) => itemsOf(s).filter((k) => checked[k]).length;
const done = computed(() => props.steps.reduce((n, s) => n + doneIn(s), 0));
const share = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0));

onMounted(() => {
  const saved = load<Saved>(storageKey);
  if (saved) {
    for (const k of saved.checked ?? []) checked[k] = true;
    Object.assign(notes, saved.notes ?? {});
  }
  window.addEventListener("afterprint", endPrint);
});
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));

function persist() {
  const value: Saved = {
    checked: Object.keys(checked).filter((k) => checked[k]),
    notes: Object.fromEntries(Object.entries(notes).filter(([, v]) => v.trim() !== "")),
  };
  save(storageKey, value);
}
function toggle(k: string) {
  checked[k] = !checked[k];
  persist();
}
function setNote(stepId: string, value: string) {
  notes[stepId] = value;
  persist();
}
function setAll(value: boolean) {
  for (const s of props.steps) open[s.id] = value;
}
function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true;
    return;
  }
  for (const k of Object.keys(checked)) delete checked[k];
  for (const k of Object.keys(notes)) delete notes[k];
  persist();
  confirmReset.value = false;
}

// Printing: switch to the flat view, mark this list as the one to print, print, then undo the mark.
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
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" :data-diy-print="printing ? 'active' : null">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <p class="text-body-l font-semibold text-n900">{{ title }}</p>
      <p class="text-caption text-n600" aria-live="polite">סימנתם {{ done }} מתוך {{ total }}</p>
    </div>
    <div class="mt-2 h-2 rounded-pill bg-n200 diy-no-print" role="progressbar" :aria-valuenow="share" aria-valuemin="0" aria-valuemax="100" :aria-label="`${title}: ${share}% סומן`">
      <div class="h-2 rounded-pill bg-teal-deep transition-[width] duration-base ease-out" :style="{ width: `${share}%` }"></div>
    </div>

    <div class="diy-no-print mt-4 flex flex-wrap gap-x-4 gap-y-1">
      <button v-if="!printView" type="button" class="min-h-11 text-body-m text-navy underline" @click="setAll(true)">פתיחת כל הצעדים</button>
      <button v-if="!printView" type="button" class="min-h-11 text-body-m text-navy underline" @click="setAll(false)">סגירת כל הצעדים</button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="printView" @click="printView = !printView">
        {{ printView ? "חזרה לרשימה" : "תצוגה להדפסה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-n600 underline" @click="reset">
        {{ confirmReset ? "בטוחים? לחצו שוב כדי למחוק את הסימונים וההערות" : "איפוס" }}
      </button>
    </div>
    <p class="diy-no-print mt-1 text-caption text-n600">הסימונים וההערות נשמרים בדפדפן הזה בלבד.</p>

    <!-- The flat view: every step open, no buttons. This is what is printed. -->
    <div v-if="printView" class="mt-4 text-body-m text-n800">
      <p v-if="printNote" class="rounded-md border border-n200 p-3 text-caption text-n700">{{ printNote }}</p>
      <section v-for="(s, si) in steps" :key="s.id" class="diy-print-step mt-5 border-t border-n200 pt-4">
        <h3 class="text-h3 text-n900">{{ stepLabel }} {{ si + 1 }}: {{ s.title }}</h3>
        <p v-if="s.summary" class="mt-1 text-n700">{{ s.summary }}</p>
        <div v-for="g in s.groups" :key="g.label" class="mt-3">
          <p class="font-semibold text-n900">{{ g.label }}</p>
          <p v-if="noteOf(g)" class="text-caption text-n600">{{ noteOf(g) }}</p>
          <ul class="list-reset mt-1">
            <li v-for="item in g.items" :key="item.id" class="flex gap-2 py-0.5">
              <span v-if="g.tone !== 'known'" aria-hidden="true">{{ checked[keyOf(s, item)] ? "☑" : "☐" }}</span>
              <span v-else aria-hidden="true">•</span>
              <span>
                <span class="sr-only">{{ g.tone === "known" ? "" : checked[keyOf(s, item)] ? "סומן: " : "לא סומן: " }}</span>
                {{ item.text }}
                <span v-for="(src, k) in sourcesOf(item)" :key="k" class="block text-caption text-n600">{{ src.kind }} · {{ src.text }}</span>
              </span>
            </li>
          </ul>
        </div>
        <p v-if="notes[s.id]" class="mt-3 whitespace-pre-line rounded-md bg-n50 p-3"><strong>ההערות שלכם:</strong> {{ notes[s.id] }}</p>
      </section>
    </div>

    <!-- The working view: one card per step. -->
    <ol v-else class="list-reset mt-4 grid gap-3">
      <li v-for="(s, si) in steps" :key="s.id" class="rounded-md border border-n200">
        <h3 class="!m-0">
          <button
            type="button"
            class="flex min-h-11 w-full items-center gap-3 rounded-md px-4 py-3 text-start hover:bg-n50"
            :aria-expanded="!!open[s.id]"
            :aria-controls="`diy-${id}-${s.id}`"
            @click="open[s.id] = !open[s.id]"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-caption font-semibold"
              :class="itemsOf(s).length && doneIn(s) === itemsOf(s).length ? 'bg-teal-deep text-n0' : 'bg-n100 text-n700'"
              aria-hidden="true"
              >{{ si + 1 }}</span
            >
            <span class="flex-1 text-body-l font-semibold text-n900">
              <span class="sr-only">{{ stepLabel }} {{ si + 1 }}: </span>{{ s.title }}
            </span>
            <span v-if="itemsOf(s).length" class="text-caption text-n600">{{ doneIn(s) }}/{{ itemsOf(s).length }}</span>
            <svg
              viewBox="0 0 16 16"
              class="h-4 w-4 shrink-0 text-n600 transition-transform duration-base"
              :class="open[s.id] ? 'rotate-180' : ''"
              aria-hidden="true"
            >
              <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </h3>
        <div v-show="open[s.id]" :id="`diy-${id}-${s.id}`" class="px-4 pb-4" data-diy-step-body>
          <p v-if="s.summary" class="text-body-m text-n700">{{ s.summary }}</p>
          <div
            v-for="g in s.groups"
            :key="g.label"
            class="mt-3 rounded-md p-3"
            :class="g.tone === 'warning' ? 'border-s-4 border-warning bg-warning-bg' : g.tone === 'known' ? 'bg-n50' : 'border border-n100'"
          >
            <p class="text-body-m font-semibold text-n900">{{ g.label }}</p>
            <p v-if="noteOf(g)" class="mt-0.5 text-caption text-n600">{{ noteOf(g) }}</p>
            <ul class="list-reset mt-1">
              <li v-for="item in g.items" :key="item.id">
                <label v-if="g.tone !== 'known'" class="flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
                  <input
                    type="checkbox"
                    class="mt-1 h-5 w-5 shrink-0 accent-teal-deep"
                    :checked="!!checked[keyOf(s, item)]"
                    @change="toggle(keyOf(s, item))"
                  />
                  <span class="text-body-m text-n800">
                    {{ item.text }}
                    <span v-for="(src, k) in sourcesOf(item)" :key="k" class="mt-1 flex flex-wrap items-baseline gap-x-2 text-caption text-n600">
                      <span class="rounded-pill bg-n0 px-2 font-semibold text-n700">{{ src.kind }}</span>
                      <span>{{ src.text }}</span>
                    </span>
                  </span>
                </label>
                <p v-else class="flex gap-2 py-1 text-body-m text-n800">
                  <span aria-hidden="true">•</span>
                  <span>
                    {{ item.text }}
                    <span v-for="(src, k) in sourcesOf(item)" :key="k" class="block text-caption text-n600">{{ src.kind }} · {{ src.text }}</span>
                  </span>
                </p>
              </li>
            </ul>
          </div>
          <label class="mt-3 flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">ההערות שלכם ל{{ stepLabel === "צעד" ? "צעד הזה" : "נושא הזה" }}</span>
            <textarea
              rows="2"
              class="rounded-md border border-n200 bg-n0 p-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
              :value="notes[s.id] ?? ''"
              @input="setNote(s.id, ($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </label>
        </div>
      </li>
    </ol>
  </div>
</template>

<style>
/* Print only the list whose print button was pressed (marked data-diy-print="active"):
   everything that neither is it, nor holds it, nor sits inside it, is hidden. */
@media print {
  html.diy-printing body *:not([data-diy-print="active"]):not(:has([data-diy-print="active"])):not([data-diy-print="active"] *) {
    display: none !important;
  }
  html.diy-printing [data-diy-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  html.diy-printing [data-diy-print="active"] .diy-no-print {
    display: none !important;
  }
  html.diy-printing .diy-print-step {
    break-inside: avoid;
  }
  /* Printing from the browser menu prints the working view: open every step, drop the controls. */
  [data-diy-step-body] {
    display: block !important;
  }
  .diy-no-print {
    display: none !important;
  }
}
</style>
