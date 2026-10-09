<script setup lang="ts">
// Lesson 1.5's illustration: "which deal is this?" as a decision tree. One
// question at a time; each answer leads to the next question or to a result,
// which shows the deal the way the advisor app's first screen records it. The
// answers given so far stay on screen and any of them can be changed. The
// table view lists every path through the tree. The page passes the whole tree,
// so the lesson's term check reads every word of it.
import { computed, nextTick, ref } from "vue";
import { save } from "../lib/progress.ts";

interface Option {
  label: string;
  next: string;
}
interface Result {
  title: string;
  /** Field name and value, as the advisor app's "העסקה" screen records them. */
  fields: [string, string][];
  note?: string;
}
interface TreeNode {
  question?: string;
  options?: Option[];
  result?: Result;
}
const props = defineProps<{ id: string; nodes: Record<string, TreeNode>; start: string }>();

/** The answers so far: which node, and which option was picked there. */
const path = ref<{ node: string; pick: number }[]>([]);
const showTable = ref(false);
const currentId = computed(() => {
  const last = path.value[path.value.length - 1];
  return last ? props.nodes[last.node].options![last.pick].next : props.start;
});
const current = computed(() => props.nodes[currentId.value]);

// After an answer or a change, focus moves to the new question or the result, never to the page body.
const stepEl = ref<HTMLElement | null>(null);
const focusStep = () => nextTick(() => stepEl.value?.focus());
function answer(i: number) {
  path.value = [...path.value, { node: currentId.value, pick: i }];
  const next = props.nodes[currentId.value];
  if (next.result) save(`exercise:${props.id}`, { reached: currentId.value });
  focusStep();
}
function backTo(step: number) {
  path.value = path.value.slice(0, step);
  focusStep();
}

/** Every path from the start to a result, for the table view. */
const allPaths = computed(() => {
  const out: { answers: string[]; result: Result }[] = [];
  const walk = (id: string, answers: string[]) => {
    const node = props.nodes[id];
    if (node.result) out.push({ answers, result: node.result });
    else for (const o of node.options ?? []) walk(o.next, [...answers, o.label]);
  };
  walk(props.start, []);
  return out;
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <!-- The answers so far. -->
    <ol v-if="path.length" class="list-reset grid gap-2" aria-label="התשובות שלכם עד עכשיו">
      <li v-for="(step, i) in path" :key="i" class="rounded-md bg-n50 px-3 py-2">
        <span class="block text-caption text-n600">{{ nodes[step.node].question }}</span>
        <span class="flex items-center justify-between gap-3">
          <span class="text-body-m font-semibold text-n900">{{ nodes[step.node].options![step.pick].label }}</span>
          <button
            type="button"
            class="min-h-11 min-w-11 shrink-0 px-2 text-caption text-navy underline"
            :aria-label="`לשנות את התשובה לשאלה: ${nodes[step.node].question}`"
            @click="backTo(i)"
          >
            לשנות
          </button>
        </span>
      </li>
    </ol>

    <!-- The next question. -->
    <div v-if="current.question" class="mt-4">
      <p ref="stepEl" tabindex="-1" class="text-body-l font-semibold text-n900">{{ current.question }}</p>
      <div class="mt-3 grid gap-2" role="group" :aria-label="current.question">
        <button
          v-for="(o, i) in current.options"
          :key="o.label"
          type="button"
          class="min-h-11 rounded-md border border-n200 px-4 py-2 text-start text-body-m text-n800 transition-colors duration-fast ease-out hover:bg-n50"
          @click="answer(i)"
        >
          {{ o.label }}
        </button>
      </div>
    </div>

    <!-- The result. -->
    <div v-else-if="current.result" class="mt-4 rounded-md border-s-4 border-teal-deep bg-n50 p-4" aria-live="polite">
      <p class="text-caption font-semibold text-n600">העסקה</p>
      <p ref="stepEl" tabindex="-1" class="text-h3 text-navy">{{ current.result.title }}</p>
      <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body-m">
        <template v-for="[k, v] in current.result.fields" :key="k">
          <dt class="text-n600">{{ k }}</dt>
          <dd class="font-semibold text-n900">{{ v }}</dd>
        </template>
      </dl>
      <p v-if="current.result.note" class="mt-3 text-body-m text-n700">{{ current.result.note }}</p>
      <button
        type="button"
        class="mt-3 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="backTo(0)"
      >
        עסקה אחרת
      </button>
    </div>

    <button type="button" class="mt-4 block min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "כל העץ כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 text-start font-semibold">העסקה</th>
            <th class="py-1 text-start font-semibold">התשובות בדרך</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in allPaths" :key="i" class="border-b border-n100 align-top">
            <td class="py-1 pe-3 font-semibold text-n900">{{ p.result.title }}</td>
            <td class="py-1 text-caption text-n700">{{ p.answers.join(" ← ") }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
