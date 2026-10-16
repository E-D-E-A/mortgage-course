<script setup lang="ts">
// אותה עובדה, שני סיפורים — the red-line lesson's piece (6.5). One true fact, told to a bank in two
// ways. The learner decides which telling is positioning (the facts, in full, documented, in their
// strongest form) and which is wrong information, then checks each telling against the same four
// questions: is it true, is it complete, is it documented, does it match what the client said.
// The page passes every text and every number (nothing is computed here); the verdict of a story is
// its four answers (all four "yes" = positioning), so the component and the page cannot disagree.
// What a wrong telling leads to is shown only as what it is: a paper that describes a family that
// does not exist. Legal consequences are not here: the page lists them as questions to a lawyer.
import { computed, nextTick, reactive, ref } from "vue";
import { save } from "../lib/progress.ts";

type Verdict = "positioning" | "wrong";
interface Story {
  /** "סיפור 1" or a short name. */
  label: string;
  /** What the advisor tells the bank. */
  text: string;
  /** The answer to each of the page's questions, in order: true = passes. */
  passes: boolean[];
  /** What the number on the form is, and what it describes. */
  outcome: string;
  /** Why it is what it is, in one or two sentences. */
  why: string;
}
interface Scenario {
  id: string;
  title: string;
  /** The true fact, with its number. */
  fact: string;
  stories: [Story, Story];
}
const props = defineProps<{
  id: string;
  /** The four questions, in the order of each story's `passes`. */
  questions: string[];
  scenarios: Scenario[];
  /** Shown when every scenario is answered right. */
  success: string;
}>();

const verdictOf = (s: Story): Verdict => (s.passes.every(Boolean) ? "positioning" : "wrong");
const verdictName: Record<Verdict, string> = { positioning: "מיצוב", wrong: "מידע לא נכון" };

const current = ref(0);
const scenario = computed(() => props.scenarios[current.value]);
// For each scenario: the learner's pick per story, and whether it was checked.
const picks = reactive<Record<string, (Verdict | null)[]>>(Object.fromEntries(props.scenarios.map((s) => [s.id, [null, null]])));
const checked = reactive<Record<string, boolean>>({});
const showTable = ref(false);

const pickOf = (i: number) => picks[scenario.value.id][i];
const readyToCheck = computed(() => picks[scenario.value.id].every((p) => p !== null));
const isChecked = computed(() => !!checked[scenario.value.id]);
const rightPick = (sc: Scenario, i: number) => picks[sc.id][i] === verdictOf(sc.stories[i]);
const allRight = (sc: Scenario) => !!checked[sc.id] && sc.stories.every((_, i) => rightPick(sc, i));
const doneCount = computed(() => props.scenarios.filter(allRight).length);
const finished = computed(() => doneCount.value === props.scenarios.length);

function pick(i: number, v: Verdict) {
  if (isChecked.value) return;
  picks[scenario.value.id][i] = v;
}
function check() {
  if (!readyToCheck.value) return;
  checked[scenario.value.id] = true;
  save(`exercise:${props.id}`, { done: finished.value });
}
function retry() {
  picks[scenario.value.id] = [null, null];
  checked[scenario.value.id] = false;
}
function go(i: number) {
  current.value = i;
}
// Tabs: one Tab stop; the arrow keys move between them. The page is right to left, so ArrowLeft is "next".
function onTabKey(e: KeyboardEvent, i: number) {
  const n = props.scenarios.length;
  let to = -1;
  if (e.key === "ArrowLeft") to = (i + 1) % n;
  else if (e.key === "ArrowRight") to = (i - 1 + n) % n;
  else if (e.key === "Home") to = 0;
  else if (e.key === "End") to = n - 1;
  if (to < 0) return;
  e.preventDefault();
  go(to);
  nextTick(() => document.getElementById(`${props.id}-tab-${to}`)?.focus());
}
const tabState = (sc: Scenario) => (allRight(sc) ? "✓ " : "");
const mark = (ok: boolean) => (ok ? "כן" : "לא");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="הדוגמאות">
      <button
        v-for="(sc, i) in scenarios"
        :key="sc.id"
        type="button"
        role="tab"
        :id="`${id}-tab-${i}`"
        :aria-selected="i === current"
        :aria-controls="`${id}-panel`"
        :tabindex="i === current ? 0 : -1"
        @keydown="onTabKey($event, i)"
        class="min-h-11 rounded-pill border px-4 text-body-m"
        :class="i === current ? 'border-navy bg-navy text-n0' : 'border-n300 text-n800 hover:bg-n50'"
        @click="go(i)"
      >
        {{ tabState(sc) }}{{ sc.title }}
      </button>
    </div>
    <div :id="`${id}-panel`" role="tabpanel" :aria-labelledby="`${id}-tab-${current}`">
    <p class="mt-2 text-caption text-n600">נפתרו {{ doneCount }} מתוך {{ scenarios.length }}</p>

    <div class="mt-3 rounded-md bg-n50 p-3">
      <p class="text-caption font-semibold text-n600">העובדה, כפי שהיא</p>
      <p class="mt-1 text-body-m text-n900">{{ scenario.fact }}</p>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <section v-for="(s, i) in scenario.stories" :key="i" class="flex flex-col rounded-md border border-n200 p-3" :aria-label="s.label">
        <p class="text-body-m font-semibold text-navy">{{ s.label }}</p>
        <p class="mt-1 text-body-m text-n800">{{ s.text }}</p>

        <div v-if="!isChecked" class="mt-3 grid gap-2" role="group" :aria-label="`מה ${s.label}`">
          <button
            v-for="v in (['positioning', 'wrong'] as Verdict[])"
            :key="v"
            type="button"
            class="min-h-11 rounded-md border px-3 text-start text-body-m"
            :class="pickOf(i) === v ? 'border-navy bg-n100 font-semibold text-n900' : 'border-n200 text-n800 hover:bg-n50'"
            :aria-pressed="pickOf(i) === v"
            @click="pick(i, v)"
          >
            {{ verdictName[v] }}
          </button>
        </div>

        <div v-else class="mt-3 flex-1" aria-live="polite">
          <p
            class="rounded-md border-s-4 p-3 text-body-m text-n900"
            :class="rightPick(scenario, i) ? 'border-success bg-success-bg' : 'border-warning bg-warning-bg'"
          >
            <strong>{{ verdictName[verdictOf(s)] }}.</strong>
            {{ rightPick(scenario, i) ? "סימנתם נכון." : `סימנתם ״${verdictName[pickOf(i) as Verdict]}״.` }}
          </p>
          <table class="mt-2 w-full border-collapse text-body-m">
            <caption class="sr-only">
              הבדיקות של {{ s.label }}
            </caption>
            <tbody>
              <tr v-for="(q, k) in questions" :key="k" class="border-b border-n100 align-top">
                <th class="py-1 pe-2 text-start font-normal text-n800">{{ q }}</th>
                <td class="py-1 font-semibold">
                  <span class="rounded-pill px-2 py-0.5 text-caption" :class="s.passes[k] ? 'bg-success-bg' : 'bg-danger-bg'">{{ mark(s.passes[k]) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="mt-2 text-body-m text-n800"><strong class="text-n900">מה זה מייצר:</strong> {{ s.outcome }}</p>
          <p class="mt-1 text-body-m text-n800">{{ s.why }}</p>
        </div>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        v-if="!isChecked"
        type="button"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!readyToCheck"
        @click="check"
      >
        בדקו
      </button>
      <button v-else-if="!allRight(scenario)" type="button" class="min-h-11 text-body-m text-navy underline" @click="retry">לנסות שוב</button>
      <button v-else-if="current < scenarios.length - 1" type="button" class="min-h-11 text-body-m text-navy underline" @click="go(current + 1)">לדוגמה הבאה</button>
      <p v-if="!isChecked && !readyToCheck" class="text-caption text-n600">סמנו לכל סיפור מה הוא, ואז בדקו.</p>
    </div>

    </div>

    <p v-if="finished" class="mt-4 rounded-md bg-success-bg p-3 text-body-m text-n800" role="status">
      <strong class="text-n900">כל הדוגמאות פתורות.</strong> {{ success }}
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[34rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">הסיפור</th>
            <th v-for="(q, k) in questions" :key="k" class="py-2 pe-3 text-start">{{ q }}</th>
            <th class="py-2 text-start">מה זה</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="sc in scenarios" :key="sc.id">
            <tr v-for="(s, i) in sc.stories" :key="`${sc.id}-${i}`" class="border-b border-n100 align-top">
              <th class="py-1 pe-3 text-start font-normal text-n900">{{ sc.title }}: {{ s.label }}</th>
              <td v-for="(p, k) in s.passes" :key="k" class="py-1 pe-3">{{ mark(p) }}</td>
              <td class="py-1 font-semibold">{{ verdictName[verdictOf(s)] }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
