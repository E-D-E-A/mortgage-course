<script setup lang="ts">
// Lesson 2.12's product: the comparison table of the mortgage tracks (course
// map, stage 2: "טבלת השוואת מסלולים, והסבר של הסיכון בכל מסלול במשפט אחד").
// Each track answers the same questions: what is fixed, what changes, when,
// what happens to the principal and to the payment, what to check in the
// contract, and the risk in one plain sentence.
//
// From `md` up it is a table with one column per track, so all six fit the
// lesson's width; below `md` each track is a card. The learner can sort the
// tracks by when their rate can move, by indexation, or by how many of the two
// things that can change (the rate, the index) can move in them. A print view lays the table out flat, and
// the print button prints this table only. The page passes every text, so the
// lesson's term check reads it.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

interface Track {
  id: string;
  name: string;
  /** Another name, shown under the name ("קל״צ"). */
  alias?: string;
  fixed: string;
  changes: string;
  when: string;
  principal: string;
  payment: string;
  contract: string;
  risk: string;
  /** When the rate can move: 0 never, 1 at update points, 2 whenever the prime moves. */
  rateMoves: 0 | 1 | 2;
  indexed: boolean;
  /** Where the row comes from, shown under it. */
  source: string;
}
const props = defineProps<{
  id: string;
  title: string;
  tracks: Track[];
  /** Printed at the top of the print view, and shown under the table. */
  printNote: string;
}>();

const FIELDS = [
  { key: "fixed", label: "מה קבוע" },
  { key: "changes", label: "מה משתנה" },
  { key: "when", label: "מתי" },
  { key: "principal", label: "מה קורה לקרן" },
  { key: "payment", label: "מה קורה לתשלום" },
  { key: "contract", label: "מה בודקים בחוזה" },
  { key: "risk", label: "הסיכון, במשפט אחד" },
] as const;
const MOVES = ["אף פעם", "בנקודות עדכון", "עם כל שינוי בפריים"];
const forces = (t: Track) => (t.rateMoves > 0 ? 1 : 0) + (t.indexed ? 1 : 0);

type Mode = "course" | "rate" | "index" | "forces";
const MODES: { id: Mode; label: string; say: string }[] = [
  { id: "course", label: "סדר השיעורים", say: "בסדר השיעורים" },
  { id: "rate", label: "מתי הריבית יכולה לזוז", say: "לפי מתי הריבית יכולה לזוז: מאף פעם ועד עם כל שינוי בפריים" },
  { id: "index", label: "הצמדה", say: "לפי הצמדה: קודם המסלולים שלא צמודים" },
  { id: "forces", label: "כמה דברים יכולים לזוז", say: "לפי כמה דברים יכולים לזוז במסלול, אחוז הריבית והמדד: משום דבר ועד שניהם" },
];
const mode = ref<Mode>("course");
const reverse = ref(false);
const key = (t: Track, m: Mode) => (m === "rate" ? t.rateMoves : m === "index" ? Number(t.indexed) : m === "forces" ? forces(t) * 10 + t.rateMoves : 0);
const sorted = computed(() => {
  const order = props.tracks.map((t, i) => ({ t, i }));
  order.sort((a, b) => key(a.t, mode.value) - key(b.t, mode.value) || a.i - b.i);
  const list = order.map((o) => o.t);
  return reverse.value ? list.reverse() : list;
});
const status = computed(() => {
  const m = MODES.find((x) => x.id === mode.value)!;
  return `הטבלה ממוינת ${m.say}${reverse.value ? ", בסדר הפוך" : ""}.`;
});
function sortBy(m: Mode) {
  if (mode.value === m) reverse.value = !reverse.value;
  else {
    mode.value = m;
    reverse.value = false;
  }
}

// Print view and printing: as in DiyChecklist, the print button marks this block as the one to print.
const printView = ref(false);
const printing = ref(false);
function endPrint() {
  printing.value = false;
  document.documentElement.classList.remove("track-printing");
}
onMounted(() => window.addEventListener("afterprint", endPrint));
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));
async function printNow() {
  printing.value = true;
  document.documentElement.classList.add("track-printing");
  await nextTick();
  window.print();
}
const badge = (t: Track) => [`הריבית זזה: ${MOVES[t.rateMoves]}`, t.indexed ? "צמוד למדד" : "לא צמוד למדד"];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5" data-track-block :data-track-print="printing ? 'active' : null">
    <h3 class="text-body-l font-semibold text-n900">{{ title }}</h3>

    <!-- Sorting: a second press on the same order reverses it. -->
    <div class="track-no-print mt-3">
      <p class="text-caption font-semibold text-n600">סדר לפי:</p>
      <div class="mt-1 flex flex-wrap gap-2" role="group" aria-label="סדר המסלולים">
        <button
          v-for="m in MODES"
          :key="m.id"
          type="button"
          class="min-h-11 rounded-md border px-3 text-body-m transition-colors duration-fast ease-out"
          :class="mode === m.id ? 'border-navy bg-navy text-n0' : 'border-n200 text-n800 hover:bg-n50'"
          :aria-pressed="mode === m.id"
          @click="sortBy(m.id)"
        >
          {{ m.label }}<span v-if="mode === m.id" aria-hidden="true">{{ reverse ? " ↑" : " ↓" }}</span>
        </button>
      </div>
      <p class="mt-2 text-caption text-n600" role="status">{{ status }} לחיצה נוספת על אותו כפתור הופכת את הסדר.</p>
    </div>

    <div class="track-no-print mt-2 flex flex-wrap gap-x-4">
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="printView" @click="printView = !printView">
        {{ printView ? "חזרה לתצוגה הרגילה" : "תצוגה להדפסה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
    </div>

    <!-- Cards, below `md` (and never in the print view). -->
    <ol v-if="!printView" class="track-cards list-reset mt-4 grid gap-4 md:hidden">
      <li v-for="t in sorted" :key="t.id" class="rounded-md border border-n200 p-3">
        <h4 class="text-body-l font-semibold text-navy">
          {{ t.name }}<span v-if="t.alias" class="text-body-m font-normal text-n600"> ({{ t.alias }})</span>
        </h4>
        <ul class="list-reset mt-2 flex flex-wrap gap-2">
          <li v-for="b in badge(t)" :key="b" class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n800">{{ b }}</li>
        </ul>
        <dl class="mt-3 grid gap-2">
          <div v-for="fl in FIELDS" :key="fl.key" :class="fl.key === 'risk' ? 'rounded-md border-s-4 border-navy bg-n50 p-2' : ''">
            <dt class="text-caption font-semibold text-n600">{{ fl.label }}</dt>
            <dd class="text-body-m text-n900" :class="fl.key === 'risk' ? 'font-semibold' : ''">{{ t[fl.key] }}</dd>
          </div>
        </dl>
        <p class="mt-2 text-caption text-n600">{{ t.source }}</p>
      </li>
    </ol>

    <!-- The table: one column per track, from `md` up, and always in the print view. -->
    <div class="track-table mt-4 overflow-x-auto" :class="printView ? 'block' : 'hidden md:block'">
      <p v-if="printView" class="mb-3 rounded-md border border-n200 p-3 text-caption text-n700">{{ printNote }}</p>
      <table class="w-full table-fixed border-collapse text-caption" :class="printView ? 'min-w-[44rem]' : ''">
        <caption class="sr-only">{{ title }}. {{ status }}</caption>
        <colgroup>
          <col class="w-24" />
          <col v-for="t in sorted" :key="t.id" />
        </colgroup>
        <thead>
          <tr class="border-b-2 border-n200 align-bottom">
            <td></td>
            <th v-for="t in sorted" :key="t.id" scope="col" class="px-1.5 py-2 text-start text-body-m font-semibold text-navy">
              {{ t.name }}<span v-if="t.alias" class="block text-caption font-normal text-n600">{{ t.alias }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100 align-top">
            <th scope="row" class="py-2 pe-2 text-start font-semibold text-n600">הריבית זזה</th>
            <td v-for="t in sorted" :key="t.id" class="px-1.5 py-2 text-n900">{{ MOVES[t.rateMoves] }}</td>
          </tr>
          <tr class="border-b border-n100 align-top">
            <th scope="row" class="py-2 pe-2 text-start font-semibold text-n600">צמוד למדד</th>
            <td v-for="t in sorted" :key="t.id" class="px-1.5 py-2 text-n900">{{ t.indexed ? "כן" : "לא" }}</td>
          </tr>
          <tr v-for="fl in FIELDS" :key="fl.key" class="border-b border-n100 align-top" :class="fl.key === 'risk' ? 'bg-n50' : ''">
            <th scope="row" class="py-2 pe-2 text-start font-semibold text-n600">{{ fl.label }}</th>
            <td v-for="t in sorted" :key="t.id" class="px-1.5 py-2 text-n900" :class="fl.key === 'risk' ? 'font-semibold' : ''">{{ t[fl.key] }}</td>
          </tr>
          <tr class="align-top">
            <th scope="row" class="py-2 pe-2 text-start font-semibold text-n600">מקור</th>
            <td v-for="t in sorted" :key="t.id" class="px-1.5 py-2 text-n600">{{ t.source }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!printView" class="mt-3 text-caption text-n600">{{ printNote }}</p>
  </div>
</template>

<style>
/* Print only the table whose print button was pressed (marked data-track-print="active"). */
@media print {
  html.track-printing body *:not([data-track-print="active"]):not(:has([data-track-print="active"])):not([data-track-print="active"] *) {
    display: none !important;
  }
  html.track-printing [data-track-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  /* Printed from the button or from the browser menu: the table, not the cards or the controls. */
  [data-track-block] .track-no-print,
  [data-track-block] .track-cards,
  [data-track-block] .scroll-hint {
    display: none !important;
  }
  [data-track-block] .track-table {
    display: block !important;
    overflow: visible !important;
  }
  [data-track-block] table {
    font-size: 9pt;
    min-width: 0 !important;
  }
  [data-track-block] tr {
    break-inside: avoid;
  }
}
</style>
