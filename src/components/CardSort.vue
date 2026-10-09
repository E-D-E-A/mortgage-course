<script setup lang="ts">
// Sorting cards into piles (lesson 1.3: purpose, interest mechanism or repayment
// method; lesson 1.5: which kind of purchase). One card at a time: the learner
// picks a pile, a wrong pick sends them back to the question that pile answers,
// a right pick explains why and files the card. Buttons, not dragging, so it
// works by touch, keyboard and screen reader alike. The piles below are the
// table view. The page passes every text, so the lesson's term check reads it.
import { computed, reactive, ref } from "vue";
import { save } from "../lib/progress.ts";

interface Card {
  text: string;
  /** Index of the right pile. */
  bin: number;
  /** Why it belongs there, shown after the right pick. */
  why: string;
}
const props = withDefaults(
  defineProps<{
    id: string;
    bins: string[];
    /** The question each pile answers, shown under its name and in the hint after a wrong pick. */
    questions: string[];
    cards: Card[];
    /** How many of the first cards are already sorted, as the worked row of a half-worked example. */
    given?: number;
    success: string;
  }>(),
  { given: 0 },
);

const placed = reactive<number[]>(props.cards.slice(0, props.given).map((c) => c.bin));
const wrongPick = ref<number | null>(null);
const justPlaced = ref(false);
const mistakes = ref(0);
const current = computed(() => (placed.length < props.cards.length ? props.cards[placed.length] : null));
const done = computed(() => current.value === null);
const lastCard = computed(() => props.cards[placed.length - 1]);
const pile = (b: number) => props.cards.filter((c, i) => i < placed.length && c.bin === b);

function pick(b: number) {
  if (!current.value || justPlaced.value) return;
  if (b === current.value.bin) {
    placed.push(b);
    wrongPick.value = null;
    justPlaced.value = true;
    if (done.value) save(`exercise:${props.id}`, { done: true, mistakes: mistakes.value });
  } else {
    wrongPick.value = b;
    mistakes.value++;
  }
}
function next() {
  justPlaced.value = false;
}
function restart() {
  placed.splice(props.given);
  wrongPick.value = null;
  justPlaced.value = false;
  mistakes.value = 0;
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">
      קלף {{ Math.min(placed.length + (justPlaced || done ? 0 : 1), cards.length) }} מתוך {{ cards.length }}
      <span v-if="given"> · {{ given === 1 ? "הקלף הראשון כבר ממוין" : `${given} הקלפים הראשונים כבר ממוינים` }}</span>
    </p>

    <!-- The card to sort, or the explanation of the one just sorted. -->
    <div v-if="justPlaced && lastCard" class="mt-3 rounded-md border-s-4 border-success bg-success-bg p-4" aria-live="polite">
      <p class="text-body-l font-semibold text-n900">״{{ lastCard.text }}״</p>
      <p class="mt-1 text-body-m text-n800"><strong>נכון: {{ bins[lastCard.bin] }}.</strong> {{ lastCard.why }}</p>
      <button
        v-if="!done"
        type="button"
        class="mt-3 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="next"
      >
        לקלף הבא
      </button>
    </div>
    <div v-else-if="current" class="mt-3">
      <p class="rounded-md border border-n300 bg-n50 p-4 text-body-l font-semibold text-n900">״{{ current.text }}״</p>
      <p class="mt-3 text-caption font-semibold text-n600">לאיזו ערימה הקלף הזה שייך?</p>
      <div class="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="הערימות">
        <button
          v-for="(b, i) in bins"
          :key="b"
          type="button"
          class="min-h-11 rounded-md border px-3 py-2 text-start transition-colors duration-fast ease-out"
          :class="wrongPick === i ? 'border-warning bg-warning-bg' : 'border-n200 hover:bg-n50'"
          @click="pick(i)"
        >
          <span class="block text-body-m font-semibold text-n900">{{ b }}</span>
          <span class="block text-caption text-n600">{{ questions[i] }}</span>
        </button>
      </div>
      <p v-if="wrongPick !== null" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">לא בדיוק.</strong> הערימה ״{{ bins[wrongPick] }}״ עונה על השאלה ״{{ questions[wrongPick] }}״ — והמשפט הזה לא עונה עליה. נסו ערימה אחרת.
      </p>
    </div>

    <p v-if="done" class="mt-4 rounded-md bg-success-bg p-3 text-body-m text-n800" role="status">
      <strong class="text-n900">כל הקלפים ממוינים{{ mistakes ? ` (עם ${mistakes === 1 ? "טעות אחת" : `${mistakes} טעויות`} בדרך)` : ", בלי טעות" }}.</strong>
      {{ success }}
    </p>

    <!-- The piles: what has been sorted so far. This is also the table view. -->
    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <section v-for="(b, i) in bins" :key="b" class="rounded-md border border-n200 p-3" :aria-label="`הערימה ${b}`">
        <p class="text-body-m font-semibold text-navy">{{ b }}</p>
        <p class="text-caption text-n600">{{ questions[i] }}</p>
        <ul class="list-reset mt-2 grid gap-1">
          <li v-for="c in pile(i)" :key="c.text" class="rounded-sm bg-n50 px-2 py-1 text-caption text-n800">״{{ c.text }}״</li>
          <li v-if="pile(i).length === 0" class="text-caption text-n600">עדיין ריק</li>
        </ul>
      </section>
    </div>

    <button v-if="placed.length > given" type="button" class="mt-3 min-h-11 text-body-m text-navy underline" @click="restart">
      להתחיל מחדש
    </button>
  </div>
</template>
