<script setup lang="ts">
// A multiple-choice exercise. Every option carries its own explanation.
// The options are shown in an order mixed by the exercise id (the same on the
// server and in the browser), so the right one is not always first. `ordered`
// keeps the written order, for options that form a scale.
import { computed, ref } from "vue";
import { save } from "../lib/progress.ts";

interface Option {
  text: string;
  correct?: boolean;
  feedback: string;
}
const props = defineProps<{ id: string; n: number; level: "קל" | "בינוני" | "מאתגר"; options: Option[]; ordered?: boolean }>();
const picked = ref<number | null>(null);

// [option, its index as written]; the index is what is saved and compared.
const shown = computed(() => {
  const opts = props.options.map((o, i) => [o, i] as [Option, number]);
  if (props.ordered) return opts;
  let seed = [...props.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  for (let i = opts.length - 1; i > 0; i--) {
    const k = Math.floor(next() * (i + 1));
    [opts[i], opts[k]] = [opts[k], opts[i]];
  }
  return opts;
});

function pick(i: number) {
  picked.value = i;
  save(`exercise:${props.id}`, { picked: i, correct: !!props.options[i].correct });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="flex items-center gap-3">
      <span class="text-body-m font-semibold text-navy">תרגיל {{ n }}</span>
      <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">{{ level }}</span>
    </div>
    <div class="mt-3 text-body-l text-n800"><slot /></div>
    <div class="mt-4 grid gap-2" role="group">
      <button
        v-for="[o, i] in shown"
        :key="i"
        type="button"
        class="min-h-11 rounded-md border px-4 py-2 text-start text-body-m transition-colors duration-fast ease-out"
        :class="
          picked === i
            ? o.correct
              ? 'border-success bg-success-bg text-n900'
              : 'border-warning bg-warning-bg text-n900'
            : 'border-n200 text-n700 hover:bg-n50'
        "
        :aria-pressed="picked === i"
        @click="pick(i)"
      >
        {{ o.text }}
      </button>
    </div>
    <p v-if="picked !== null" class="mt-3 text-body-m text-n800" aria-live="polite">
      <strong class="text-n900">{{ options[picked].correct ? "נכון." : "לא בדיוק." }}</strong>
      {{ options[picked].feedback }}
    </p>
  </div>
</template>
