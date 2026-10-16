<script setup lang="ts">
// The lever map (מפת המנופים), lesson 6.3. Nine things a client can really change, in two groups (the file itself,
// and the road to the bank). Pick one: what it improves, what it costs, when not to pull it, what it does to four
// things (the payment ratio, the financing ratio, the total paid, the family's cushion), and what kind of claim
// each statement is. The text is the data file's (src/data/lever-map.ts); the case-A line under each lever is
// passed by the lesson page, computed in code. Nothing here is ever "free": every card has a cost line.
import { computed, ref } from "vue";
import BidiText from "./BidiText.vue";
import { EFFECT_COLUMNS, EFFECT_TEXT, type Effect, GROUP_NAME, type LeverCard, LEVERS } from "../data/lever-map.ts";

const props = withDefaults(
  defineProps<{
    /** The lever shown first. */
    initial?: string;
    /** For each lever id: what it means for the lesson's case, as a sentence the page built from facts. */
    notes?: Record<string, string>;
    /** The case's name, for the label of the note. */
    caseName?: string;
  }>(),
  { initial: "equity", notes: () => ({}), caseName: "בתיק" },
);

const selected = ref(props.initial);
const showTable = ref(false);
const current = computed<LeverCard>(() => LEVERS.find((l) => l.id === selected.value) ?? LEVERS[0]);
const inGroup = (g: LeverCard["group"]) => LEVERS.filter((l) => l.group === g);
const effectClass = (e: Effect) => ({ better: "bg-success-bg", worse: "bg-warning-bg", none: "bg-n50", depends: "bg-info-bg" })[e];
const effectMark = (e: Effect) => ({ better: "✓", worse: "✗", none: "—", depends: "↕" })[e];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">בחרו מנוף כדי לראות מה הוא משפר, מה הוא עולה ומתי לא להפעיל אותו. הכיוון בטבלה הוא של מנוף שמופעל בכיוון שעוזר ליחס ההחזר.</p>

    <section v-for="g in (['file', 'road'] as const)" :key="g" class="mt-4" :aria-label="GROUP_NAME[g]">
      <h3 class="text-body-m font-semibold text-n900">{{ GROUP_NAME[g] }}</h3>
      <ul class="list-reset mt-2 flex flex-wrap gap-2">
        <li v-for="l in inGroup(g)" :key="l.id">
          <button
            type="button"
            class="min-h-11 rounded-md border px-3 py-1.5 text-start text-body-m transition-colors duration-fast ease-out"
            :class="l.id === selected ? 'border-navy bg-navy text-n0' : 'border-n300 bg-n50 text-n800 hover:bg-n100'"
            :aria-pressed="l.id === selected"
            @click="selected = l.id"
          >
            {{ l.name }}
          </button>
        </li>
      </ul>
    </section>

    <div class="mt-5 rounded-md border border-n200 bg-n0 p-4" aria-live="polite">
      <p class="text-h3 text-navy">{{ current.name }}</p>
      <p class="mt-1 text-body-m text-n800">{{ current.what }}</p>
      <dl class="mt-3 grid gap-3 text-body-m text-n800">
        <div><dt class="text-caption font-semibold text-n600">מה זה משפר</dt><dd><BidiText :text="current.improves" /></dd></div>
        <div><dt class="text-caption font-semibold text-n600">מה זה עולה</dt><dd><BidiText :text="current.costs" /></dd></div>
        <div><dt class="text-caption font-semibold text-n600">מתי לא להפעיל</dt><dd><BidiText :text="current.whenNot" /></dd></div>
      </dl>

      <p class="mt-4 text-caption font-semibold text-n600">מה זה עושה לארבעה דברים</p>
      <ul class="list-reset mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <li v-for="c in EFFECT_COLUMNS" :key="c.key" class="rounded-md p-2 text-body-m text-n900" :class="effectClass(current.effects[c.key])">
          <span class="block text-caption text-n700">{{ c.label }}</span>
          <span class="font-semibold"><span aria-hidden="true">{{ effectMark(current.effects[c.key]) }} </span>{{ EFFECT_TEXT[current.effects[c.key]] }}</span>
        </li>
      </ul>

      <p v-if="notes[current.id]" class="mt-4 rounded-md bg-info-bg p-3 text-body-m text-n900">
        <span class="font-semibold">{{ caseName }}:</span> <BidiText :text="notes[current.id]" />
      </p>

      <p class="mt-3 text-caption text-n600"><span class="rounded-pill bg-n100 px-2 py-0.5 font-semibold text-n800">{{ current.basis.kind }}</span> <BidiText :text="current.basis.text" /></p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[36rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">מנוף</th>
            <th v-for="c in EFFECT_COLUMNS" :key="c.key" class="py-1 pe-3 text-start font-semibold">{{ c.label }}</th>
            <th class="py-1 text-start font-semibold">סוג הטענה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in LEVERS" :key="l.id" class="border-b border-n100 align-top">
            <th class="py-1 pe-3 text-start font-normal text-n700">{{ l.name }}</th>
            <td v-for="c in EFFECT_COLUMNS" :key="c.key" class="py-1 pe-3"><span aria-hidden="true">{{ effectMark(l.effects[c.key]) }} </span>{{ EFFECT_TEXT[l.effects[c.key]] }}</td>
            <td class="py-1">{{ l.basis.kind }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
