<script setup lang="ts">
// A sorting exercise: put the cards in order, from the top of the list to the
// bottom, by one property (lesson 2.12: the tracks, by when their rate can
// move, or by how many forces act on them). Items with the same rank may sit in
// any order among themselves. Up and down buttons, not dragging, so it works by
// touch, keyboard and screen reader alike; focus stays on the moved card. After
// a check, every misplaced card says in words whether it sits too high or too low.
import { computed, nextTick, reactive, ref } from "vue";
import { save } from "../lib/progress.ts";

interface Item {
  text: string;
  /** Its place in the order: lower ranks go on top; equal ranks are interchangeable. */
  rank: number;
}
const props = defineProps<{
  id: string;
  items: Item[];
  /** What the top and the bottom of the list mean. */
  topLabel: string;
  bottomLabel: string;
  /** The name of each rank, shown with the right order. */
  rankNames: string[];
  success: string;
  hint: string;
}>();

const order = reactive<number[]>(props.items.map((_, i) => i));
// After a check: cards that sit above a card they should follow (too high), and below one they should precede (too low).
const tooHigh = ref<Set<number>>(new Set());
const tooLow = ref<Set<number>>(new Set());
const wrong = computed(() => new Set([...tooHigh.value, ...tooLow.value]));
const checked = ref(false);
const revealed = ref(false);
const buttons = new Map<string, HTMLButtonElement>();
const setButton = (k: string) => (el: unknown) => {
  if (el instanceof HTMLButtonElement) buttons.set(k, el);
  else buttons.delete(k);
};

function move(pos: number, by: -1 | 1) {
  const to = pos + by;
  if (to < 0 || to >= order.length) return;
  const item = order[pos];
  [order[pos], order[to]] = [order[to], order[pos]];
  checked.value = false;
  tooHigh.value = new Set();
  tooLow.value = new Set();
  // Keep focus on the same card's button, or on its other button at the ends.
  nextTick(() => {
    const dir = by < 0 ? "up" : "down";
    const other = by < 0 ? "down" : "up";
    const b = buttons.get(`${item}.${dir}`);
    (b && !b.disabled ? b : buttons.get(`${item}.${other}`))?.focus();
  });
}
function check() {
  const rank = (i: number) => props.items[i].rank;
  const high = new Set<number>();
  const low = new Set<number>();
  order.forEach((i, pos) => {
    if (order.slice(pos + 1).some((j) => rank(j) < rank(i))) high.add(i);
    if (order.slice(0, pos).some((j) => rank(j) > rank(i))) low.add(i);
  });
  tooHigh.value = high;
  tooLow.value = low;
  checked.value = true;
  save(`exercise:${props.id}`, { done: high.size === 0 && low.size === 0 });
}
const allOk = computed(() => checked.value && wrong.value.size === 0);
const right = computed(() => [...props.items].map((it, i) => ({ ...it, i })).sort((a, b) => a.rank - b.rank || a.i - b.i));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5">
    <p class="text-caption font-semibold text-n600">למעלה: {{ topLabel }}</p>
    <ol class="list-reset mt-2 grid gap-2">
      <li
        v-for="(i, pos) in order"
        :key="i"
        class="flex items-center gap-2 rounded-md border p-2"
        :class="checked && wrong.has(i) ? 'border-warning bg-warning-bg' : allOk ? 'border-success' : 'border-n200'"
      >
        <span class="w-6 shrink-0 text-center text-caption font-semibold text-n600">{{ pos + 1 }}</span>
        <span class="min-w-0 flex-1 text-body-m text-n900">
          {{ items[i].text }}
          <span v-if="checked && tooHigh.has(i)" class="block text-caption font-semibold text-n800">גבוה מדי: מתחתיו יש קלף שצריך להיות מעליו.</span>
          <span v-if="checked && tooLow.has(i)" class="block text-caption font-semibold text-n800">נמוך מדי: מעליו יש קלף שצריך להיות מתחתיו.</span>
        </span>
        <span class="flex shrink-0 gap-1">
          <button
            :ref="setButton(`${i}.up`)"
            type="button"
            class="h-11 w-11 rounded-md border border-n200 text-body-l text-navy hover:bg-n50 disabled:opacity-40"
            :disabled="pos === 0"
            :aria-label="`להזיז למעלה: ${items[i].text}`"
            @click="move(pos, -1)"
          >
            ↑
          </button>
          <button
            :ref="setButton(`${i}.down`)"
            type="button"
            class="h-11 w-11 rounded-md border border-n200 text-body-l text-navy hover:bg-n50 disabled:opacity-40"
            :disabled="pos === order.length - 1"
            :aria-label="`להזיז למטה: ${items[i].text}`"
            @click="move(pos, 1)"
          >
            ↓
          </button>
        </span>
      </li>
    </ol>
    <p class="mt-2 text-caption font-semibold text-n600">למטה: {{ bottomLabel }}</p>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="check"
      >
        בדיקה
      </button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-expanded="revealed" @click="revealed = !revealed">
        {{ revealed ? "הסתרת הסדר הנכון" : "הצגת הסדר הנכון" }}
      </button>
    </div>
    <p v-if="checked" class="mt-3 rounded-md p-3 text-body-m text-n800" :class="allOk ? 'bg-success-bg' : 'bg-warning-bg'" aria-live="polite">
      <template v-if="allOk"><strong class="text-n900">הסדר נכון.</strong> {{ success }}</template>
      <template v-else><strong class="text-n900">עוד לא.</strong> {{ wrong.size === 1 ? "קלף אחד לא במקום" : `${wrong.size} קלפים לא במקום` }} (כתוב לידם). {{ hint }}</template>
    </p>
    <ol v-if="revealed" class="list-reset mt-3 grid gap-1 rounded-md bg-n50 p-3 text-body-m text-n800">
      <li v-for="r in right" :key="r.i"><strong class="text-n900">{{ rankNames[r.rank] }}:</strong> {{ r.text }}</li>
    </ol>
  </div>
</template>
