<script setup lang="ts">
// Lesson 6.10's illustration: a conversation tree. One scene at a time — somebody says something
// (the clients, a bank), the learner picks what the advisor says, and the next screen shows what
// that choice did and where it leads. Each choice is marked good, workable-with-a-price, or harmful,
// with the reason. The answers so far stay on screen and any of them can be changed. The table view
// lists every scene and every choice. The page passes the whole tree already written, with its
// numbers taken from the lesson's facts; the component computes nothing.
import { computed, nextTick, ref } from "vue";
import { save } from "../lib/progress.ts";

type Tone = "good" | "ok" | "bad";
interface Say {
  who: string;
  text: string;
}
interface Option {
  label: string;
  tone: Tone;
  /** What the choice does, and why it is good, workable or harmful. */
  feedback: string;
  next: string;
}
interface Scene {
  /** The step of the process this scene belongs to ("שיחת היכרות"). */
  scene: string;
  says?: Say[];
  question?: string;
  options?: Option[];
  end?: { title: string; text: string };
}
const props = defineProps<{ id: string; nodes: Record<string, Scene>; start: string }>();

const TONE = {
  good: { word: "מהלך שמשרת את הלקוחות", box: "border-success bg-success-bg" },
  ok: { word: "אפשרי, ויש לו מחיר", box: "border-warning bg-warning-bg" },
  bad: { word: "מהלך שפוגע", box: "border-danger bg-danger-bg" },
} as const;

/** The choices so far: which scene, and which option was picked there. */
const path = ref<{ node: string; pick: number }[]>([]);
const showTable = ref(false);
const currentId = computed(() => {
  const last = path.value[path.value.length - 1];
  return last ? props.nodes[last.node].options![last.pick].next : props.start;
});
const current = computed(() => props.nodes[currentId.value]);

const stepEl = ref<HTMLElement | null>(null);
const focusStep = () => nextTick(() => stepEl.value?.focus());
function choose(i: number) {
  const next = props.nodes[currentId.value].options![i].next;
  path.value = [...path.value, { node: currentId.value, pick: i }];
  if (props.nodes[next]?.end) save(`exercise:${props.id}`, { reached: next });
  focusStep();
}
function backTo(step: number) {
  path.value = path.value.slice(0, step);
  focusStep();
}

const tally = computed(() => {
  const t = { good: 0, ok: 0, bad: 0 };
  for (const s of path.value) t[props.nodes[s.node].options![s.pick].tone]++;
  return t;
});

/** Every choice of every scene, in the tree's own order, for the table view. */
const rows = computed(() => {
  const seen: string[] = [];
  const walk = (id: string) => {
    if (seen.includes(id)) return;
    seen.push(id);
    for (const o of props.nodes[id].options ?? []) walk(o.next);
  };
  walk(props.start);
  return seen.flatMap((id) => (props.nodes[id].options ?? []).map((o) => ({ scene: props.nodes[id].scene, question: props.nodes[id].question ?? "", ...o, to: props.nodes[o.next] })));
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <!-- The conversation so far. -->
    <ol v-if="path.length" class="list-reset grid gap-4" aria-label="השיחה עד עכשיו">
      <li v-for="(step, i) in path" :key="i" class="rounded-md bg-n50 p-3">
        <p class="text-caption font-semibold text-n600">{{ nodes[step.node].scene }}</p>
        <p v-for="(s, k) in nodes[step.node].says" :key="k" class="mt-2 text-body-m text-n800"><strong>{{ s.who }}:</strong> {{ s.text }}</p>
        <p class="mt-2 text-body-m text-n900"><strong>אתם:</strong> {{ nodes[step.node].options![step.pick].label }}</p>
        <div class="mt-2 rounded-md border-s-4 p-3" :class="TONE[nodes[step.node].options![step.pick].tone].box">
          <p class="text-caption font-semibold text-n800">{{ TONE[nodes[step.node].options![step.pick].tone].word }}</p>
          <p class="mt-1 text-body-m text-n800">{{ nodes[step.node].options![step.pick].feedback }}</p>
        </div>
        <button type="button" class="mt-1 min-h-11 min-w-11 px-2 text-caption text-navy underline" :aria-label="`לשנות את הבחירה בשלב: ${nodes[step.node].scene}`" @click="backTo(i)">לשנות</button>
      </li>
    </ol>

    <!-- The next scene. -->
    <div v-if="current.question" class="mt-4">
      <p class="text-caption font-semibold text-n600">{{ current.scene }}</p>
      <p v-for="(s, k) in current.says" :key="k" class="mt-2 text-body-m text-n800"><strong>{{ s.who }}:</strong> {{ s.text }}</p>
      <p ref="stepEl" tabindex="-1" class="mt-3 text-body-l font-semibold text-n900">{{ current.question }}</p>
      <div class="mt-3 grid gap-2" role="group" :aria-label="current.question">
        <button
          v-for="(o, i) in current.options"
          :key="o.label"
          type="button"
          class="min-h-11 rounded-md border border-n200 px-4 py-2 text-start text-body-m text-n800 transition-colors duration-fast ease-out hover:bg-n50"
          @click="choose(i)"
        >
          {{ o.label }}
        </button>
      </div>
    </div>

    <!-- The end. -->
    <div v-else-if="current.end" class="mt-4 rounded-md border-s-4 border-teal-deep bg-n50 p-4" aria-live="polite">
      <p class="text-caption font-semibold text-n600">{{ current.scene }}</p>
      <p ref="stepEl" tabindex="-1" class="text-h3 text-navy">{{ current.end.title }}</p>
      <p class="mt-2 text-body-m text-n800">{{ current.end.text }}</p>
      <p class="mt-3 text-body-m text-n700">הבחירות שלכם: {{ tally.good }} שמשרתות את הלקוחות, {{ tally.ok }} עם מחיר, {{ tally.bad }} שפוגעות.</p>
      <button
        type="button"
        class="mt-3 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="backTo(0)"
      >
        שיחה אחרת
      </button>
    </div>

    <button type="button" class="mt-4 block min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">השלב</th>
            <th class="py-1 pe-3 text-start font-semibold">מה אפשר לומר</th>
            <th class="py-1 pe-3 text-start font-semibold">הדירוג</th>
            <th class="py-1 text-start font-semibold">למה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i" class="border-b border-n100 align-top">
            <td class="py-1 pe-3 text-n700">{{ r.scene }}</td>
            <td class="py-1 pe-3 font-semibold text-n900">{{ r.label }}</td>
            <td class="py-1 pe-3 text-n800">{{ TONE[r.tone].word }}</td>
            <td class="py-1 text-caption text-n700">{{ r.feedback }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
