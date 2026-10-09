<script setup lang="ts">
// A glossary term inside lesson text. Click or tap (or Enter) opens its
// definition in a popover; Escape or a click elsewhere closes it.
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue";
import glossary from "../data/glossary.json";

const props = defineProps<{ t: string; lesson?: string }>();
const entry = computed(() => (glossary as Record<string, { lesson: string; definition: string | null }>)[props.t]);
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const id = useId();

function onDocument(e: Event) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
}
onMounted(() => {
  document.addEventListener("click", onDocument);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocument);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <span ref="root" class="relative inline">
    <button
      type="button"
      class="cursor-help border-b border-dotted border-teal-deep font-medium text-n900 hover:bg-mint/40"
      :aria-expanded="open"
      :aria-controls="id"
      @click="open = !open"
    >
      <slot>{{ t }}</slot>
    </button>
    <span
      v-if="open"
      :id="id"
      role="tooltip"
      class="absolute start-0 top-full z-tooltip mt-2 block w-72 max-w-[80vw] rounded-md border border-n200 bg-n0 p-4 text-body-m font-normal text-n700 shadow-md"
    >
      <span class="block font-semibold text-navy">{{ t }}</span>
      <span class="mt-1 block">{{ entry?.definition ?? "הגדרה בכתיבה" }}</span>
      <span v-if="entry && entry.lesson !== lesson" class="mt-2 block text-caption text-n500">הוסבר בשיעור {{ entry.lesson }}</span>
      <a href="/glossary/" class="mt-2 block text-caption text-navy underline">למילון המלא</a>
    </span>
  </span>
</template>
