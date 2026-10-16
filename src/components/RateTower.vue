<script setup lang="ts">
// Lesson 4.12's illustration: the tower of a bank's rate. A track's rate is the anchor
// (lesson 2.1) plus a spread, and the spread is thought of as layers: the bank's risk, its
// capital, the competition, the customer's value, its appetite. Two things to move.
//  1. A situation (the Bank of Israel moves, the loan-to-value ratio rises, a competing offer
//     arrives ...): the tower says which layers move, in which direction, and who said so.
//     It never says by how much, because no source gave the course a size.
//  2. The size of each layer, with the learner's own teaching numbers: the rate is their sum.
// The sum is computed by src/lib/calc/pricing.ts.
import { computed, reactive, ref } from "vue";
import BidiText from "./BidiText.vue";
import { towerRate, towerSpread } from "../lib/calc/pricing.ts";

interface Layer { id: string; label: string; start: string; what: string; /** Lowest size; a layer that can lower the spread has a negative one. */ min?: string }
interface Effect { layer: string; dir: "up" | "down" | "maybe_up" | "maybe_down" | "unknown"; why: string; kind: string }
interface Scenario { id: string; label: string; effects: Effect[]; note?: string }

const props = defineProps<{
  anchorLabel: string;
  anchor: string;
  layers: Layer[];
  scenarios: Scenario[];
  /** Shown under the tower: that every size is the learner's own number. */
  note: string;
}>();

const anchor = ref(Number(props.anchor));
const sizes = reactive<Record<string, number>>(Object.fromEntries(props.layers.map((l) => [l.id, Number(l.start)])));
const scenario = ref<string>("");
const showTable = ref(false);

const parts = computed(() => props.layers.map((l) => String(sizes[l.id])));
const spread = computed(() => towerSpread(parts.value));
const rate = computed(() => towerRate(String(anchor.value), parts.value));
const current = computed(() => props.scenarios.find((s) => s.id === scenario.value));
const effectOf = (id: string) => current.value?.effects.find((e) => e.layer === id);
const arrow = { up: "↑ עולה", down: "↓ יורדת", maybe_up: "↑ אולי עולה", maybe_down: "↓ אולי יורדת", unknown: "? לא ברור לאן" } as const;
const minus = (s: string) => s.replace("-", "−");
// "נקודת אחוז" up to one, "נקודות אחוז" above (the course's house rule), by the size, sign aside.
const points = (v: string | number) => (Math.abs(Number(v)) <= 1 ? "נקודת אחוז" : "נקודות אחוז");
// A layer's block grows with its size either way; a negative layer lowers the rate, so it is drawn hollow.
const height = (v: number) => `${Math.max(34, Math.abs(v) * 100)}px`;
const anchorMoves = computed(() => Boolean(effectOf("anchor")));
const negativeRate = computed(() => Number(rate.value) < 0);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="rounded-md border border-n200 bg-n50 p-3 text-body-m text-n800">{{ note }}</p>

    <p class="mt-4 text-body-m font-semibold text-n900">1. בחרו מצב, וראו אילו שכבות זזות</p>
    <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="מצבים">
      <button
        v-for="s in scenarios"
        :key="s.id"
        type="button"
        class="min-h-11 rounded-pill border px-4 text-body-m transition-colors duration-fast ease-out"
        :class="scenario === s.id ? 'border-navy bg-navy text-n0' : 'border-n300 bg-n0 text-n800'"
        :aria-pressed="scenario === s.id"
        @click="scenario = scenario === s.id ? '' : s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="mt-4 grid gap-5 lg:grid-cols-2">
      <!-- The tower: the anchor at the bottom (not to scale), the layers of the spread on top. -->
      <div>
        <div class="flex flex-col-reverse gap-1" aria-hidden="true">
          <div
            class="flex items-center justify-between rounded-md px-3 text-n0"
            :class="anchorMoves ? 'outline outline-2 outline-offset-2 outline-navy' : ''"
            style="height: 56px; background: var(--mogi-teal-deep)"
          >
            <span class="text-body-m font-semibold">{{ anchorLabel }}</span>
            <span class="ltr text-body-m font-semibold">{{ anchor }}%</span>
          </div>
          <div
            v-for="l in layers"
            :key="l.id"
            class="flex items-center justify-between rounded-md px-3 text-n900 transition-all duration-fast ease-out"
            :class="[effectOf(l.id) ? 'border-2 border-navy' : sizes[l.id] < 0 ? 'border-2 border-dashed border-n400' : 'border-2 border-transparent']"
            :style="{ height: height(sizes[l.id]), background: sizes[l.id] < 0 ? 'var(--mogi-n0)' : 'var(--mogi-turquoise-2)' }"
          >
            <span class="text-body-m font-semibold">{{ l.label }}</span>
            <span class="ltr text-body-m font-semibold">{{ minus(String(sizes[l.id])) }}</span>
          </div>
        </div>
        <p class="mt-2 text-caption text-n600">העוגן מצויר קבוע, לא בקנה מידה. גובה השכבות הוא הגודל שבחרתם; שכבה עם קו מקווקו היא שלילית, ומורידה את הריבית.</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2" aria-live="polite">
          <div class="rounded-md bg-n50 p-3">
            <div class="text-caption text-n600">המרווח: סכום השכבות</div>
            <div class="text-h2 text-navy"><span class="ltr">{{ minus(spread) }}</span> <span class="text-body-l">{{ points(spread) }}</span></div>
          </div>
          <div class="rounded-md bg-n50 p-3">
            <div class="text-caption text-n600">הריבית: העוגן ועוד המרווח</div>
            <div class="text-h2 text-navy"><span class="ltr">{{ minus(rate) }}%</span></div>
          </div>
        </div>
        <p v-if="negativeRate" class="mt-2 text-caption text-n700">הסכום יצא מתחת לאפס. בנק לא מציע ריבית כזו: זה רק החשבון של המספרים שבחרתם.</p>
      </div>

      <div>
        <p class="text-body-m font-semibold text-n900">2. הגדירו גודל לכל שכבה (מספרים משלכם)</p>
        <div class="mt-2 grid gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">{{ anchorLabel }}</span>
            <input v-model.number="anchor" type="range" min="1" max="7" step="0.25" />
          </label>
          <label v-for="l in layers" :key="l.id" class="flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">{{ l.label }}: {{ l.what }}</span>
            <input v-model.number="sizes[l.id]" type="range" :min="l.min ?? 0" max="1.5" step="0.05" />
          </label>
        </div>
      </div>
    </div>

    <div class="mt-4 rounded-md bg-n50 p-4" aria-live="polite">
      <template v-if="current">
        <p class="text-body-m font-semibold text-n900">{{ current.label }}</p>
        <ul class="list-reset mt-2 grid gap-2">
          <li v-for="e in current.effects" :key="e.layer" class="text-body-m text-n800">
            <span class="font-semibold">{{ layers.find((l) => l.id === e.layer)?.label ?? anchorLabel }}</span>:
            <span class="font-semibold">{{ arrow[e.dir] }}</span>.
            <BidiText :text="e.why" />
            <span class="ms-2 rounded-pill bg-n100 px-3 py-0.5 text-caption font-semibold text-n700">{{ e.kind }}</span>
          </li>
        </ul>
        <p class="mt-2 text-caption text-n700">הכיוון הוא קריאה של הקורס במה שנאמר. כמה בנקודות אחוז — לא ידוע: אף מקור לא נתן לקורס את הגודל של שכבה.</p>
        <p v-if="current.note" class="mt-1 text-caption text-n700"><BidiText :text="current.note" /></p>
      </template>
      <p v-else class="text-body-m text-n700">בחרו מצב כדי לראות אילו שכבות זזות.</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">{{ anchorLabel }}</th><td class="py-1"><span class="ltr">{{ anchor }}%</span></td></tr>
          <tr v-for="l in layers" :key="l.id" class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">{{ l.label }}</th><td class="py-1"><span class="ltr">{{ minus(String(sizes[l.id])) }}</span> {{ points(sizes[l.id]) }}</td></tr>
          <tr class="border-b border-n100 font-semibold text-n900"><th class="py-1 text-start">המרווח</th><td class="py-1"><span class="ltr">{{ minus(spread) }}</span> {{ points(spread) }}</td></tr>
          <tr class="font-semibold text-n900"><th class="py-1 text-start">הריבית</th><td class="py-1"><span class="ltr">{{ minus(rate) }}%</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
