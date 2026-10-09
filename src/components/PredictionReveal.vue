<script setup lang="ts">
import { onMounted, ref } from "vue";
import { load } from "../lib/progress.ts";

// `notes` speaks to each wrong guess separately, so no guess is left unanswered.
const props = defineProps<{ id: string; options: string[]; correct: number; notes?: string[] }>();
const guess = ref<number | null>(null);
onMounted(() => {
  guess.value = load<number>(`prediction:${props.id}`);
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-body-m text-n600">חוזרים לשאלת הפתיחה</p>
    <p v-if="guess !== null" class="mt-1 text-body-l text-n900">
      ניחשתם: <strong>{{ options[guess] }}</strong>.
      <span v-if="guess === correct" class="ms-2 rounded-pill bg-success-bg px-3 py-0.5 text-caption font-semibold text-success">צדקתם</span>
    </p>
    <p class="mt-1 text-body-l text-n900">התשובה: <strong>{{ options[correct] }}</strong>.</p>
    <div class="mt-2 text-body-m text-n700"><slot /></div>
    <p v-if="guess !== null && guess !== correct && notes?.[guess]" class="mt-2 rounded-md bg-n50 p-3 text-body-m text-n700">{{ notes[guess] }}</p>
  </div>
</template>
