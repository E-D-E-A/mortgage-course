<script setup lang="ts">
// A glossary term inside lesson text. Click or tap (or Enter) opens its
// definition in a popover; Escape or a click elsewhere closes it.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import glossary from "../data/glossary.json";

const props = defineProps<{ t: string; lesson?: string }>();
const entry = computed(() => (glossary as Record<string, { lesson: string; definition: string | null }>)[props.t]);
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const id = useId();
const tip = ref<HTMLElement | null>(null);
// The popover hangs from the edge of the term; near either edge of the screen it is shifted back inside.
const shift = ref(0);
watch(open, async (isOpen) => {
  shift.value = 0;
  if (!isOpen) return;
  await nextTick();
  const r = tip.value?.getBoundingClientRect();
  if (!r) return;
  const vw = document.documentElement.clientWidth;
  if (r.left < 8) shift.value = 8 - r.left;
  else if (r.right > vw - 8) shift.value = vw - 8 - r.right;
});

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
      class="relative cursor-help border-b border-dotted border-teal-deep font-medium after:absolute after:inset-x-[-4px] after:inset-y-[-8px] after:content-[''] text-n900 hover:bg-mint/40"
      :aria-expanded="open"
      :aria-controls="id"
      @click="open = !open"
    >
      <slot>{{ t }}</slot>
    </button>
    <span
      v-if="open"
      :id="id"
      ref="tip"
      role="tooltip"
      :style="{ transform: `translateX(${shift}px)` }"
      class="absolute start-0 top-full z-tooltip mt-2 block w-72 max-w-[min(18rem,calc(100vw-2rem))] rounded-md border border-n200 bg-n0 p-4 text-body-m font-normal text-n700 shadow-md"
    >
      <span class="block font-semibold text-navy">{{ t }}</span>
      <span class="mt-1 block">{{ entry?.definition ?? "הגדרה בכתיבה" }}</span>
      <span v-if="entry && entry.lesson !== lesson" class="mt-2 block text-caption text-n500">הוסבר בשיעור {{ entry.lesson }}</span>
      <a :href="`/glossary/#${encodeURIComponent(t)}`" class="mt-1 inline-flex min-h-11 items-center text-caption font-semibold text-navy underline decoration-n300 underline-offset-4 hover:decoration-turquoise">למילון המלא</a>
    </span>
  </span>
</template>
