<script setup lang="ts">
// "Guess first": the learner commits to an answer before the explanation.
// The guess is kept and shown again by <PredictionReveal> at the end.
import { computed, nextTick, onMounted, ref } from "vue";
import { load, save } from "../lib/progress.ts";
import { shuffledWithIndex } from "../lib/shuffle.ts";

const props = defineProps<{ id: string; question: string; options: string[]; ordered?: boolean }>();
// Shown in an order mixed by the id; the saved choice stays the authored index.
const shown = computed(() => shuffledWithIndex(props.options, props.id, props.ordered));
const choice = ref<number | null>(null);
const locked = ref(false);
// The button that locked the guess disappears, and focus would fall to <body>: it moves to the line that replaces it.
const savedLine = ref<HTMLElement | null>(null);

onMounted(() => {
  const saved = load<number>(`prediction:${props.id}`);
  if (saved !== null) {
    choice.value = saved;
    locked.value = true;
  }
});

function lock() {
  if (choice.value === null) return;
  save(`prediction:${props.id}`, choice.value);
  locked.value = true;
  nextTick(() => savedLine.value?.focus());
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-body-l font-semibold text-n900">{{ question }}</p>
    <fieldset class="mt-4 grid gap-2" :disabled="locked">
      <legend class="sr-only">{{ question }}</legend>
      <label
        v-for="[option, i] in shown"
        :key="i"
        class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-2 text-body-m transition-colors duration-fast ease-out"
        :class="choice === i ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
      >
        <input v-model="choice" type="radio" :name="`pred-${id}`" :value="i" class="accent-teal-deep" />
        <span>{{ option }}</span>
      </label>
    </fieldset>
    <button
      v-if="!locked"
      type="button"
      class="mt-4 min-h-11 rounded-md bg-turquoise px-5 py-2 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover disabled:bg-n100 disabled:text-n400"
      :disabled="choice === null"
      @click="lock"
    >
      זה הניחוש שלי
    </button>
    <p v-else ref="savedLine" tabindex="-1" class="mt-4 text-body-m text-n600">
      שמרנו את הניחוש שלכם. בהמשך השיעור תגלו אם צדקתם — אין צורך לנחש נכון, רק לנחש.
    </p>
  </div>
</template>
