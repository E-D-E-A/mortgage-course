<script setup lang="ts">
// A stage's completion check. Unlike the practice inside a lesson, the
// learner answers every question first and is scored once. The page shows the
// score only ("N מתוך M"): there is no pass mark and nothing is locked or opened by it.
// After scoring, every question shows the right answer, why, and the lesson to go
// back to. The learner can retry as often as they like. The last score and the number
// of attempts are kept as progress ("done" = answered at least once).
import { computed, onMounted, reactive, ref } from "vue";
import { load, parseAnswer, save } from "../lib/progress.ts";

interface CommonError {
  value: string;
  message: string;
  tolerance?: number;
}
interface Question {
  id: string;
  /** The lesson that teaches it, e.g. "0.3" — the "go back to" link. */
  lesson: string;
  prompt: string;
  type: "numeric" | "choice";
  answer?: string;
  tolerance?: number;
  near?: number;
  unit?: string;
  errors?: CommonError[];
  options?: { text: string; correct?: boolean }[];
  /** Shown after scoring: the reasoning and the right answer. */
  explanation: string;
}
const props = withDefaults(
  defineProps<{ stage: number; questions: Question[]; nextHref?: string; nextLabel?: string }>(),
  { nextHref: undefined, nextLabel: undefined },
);

const key = `check:${props.stage}`;
const answers = reactive<Record<string, string | number | null>>(Object.fromEntries(props.questions.map((q) => [q.id, null])));
const submitted = ref(false);
/** The last saved attempt from this browser (or from the learner's synced progress), if any. */
const before = ref<{ score: number; total: number; attempts: number } | null>(null);

onMounted(() => {
  const saved = load<{ score?: number; total?: number; attempts?: number }>(key);
  if (saved && typeof saved.score === "number" && typeof saved.total === "number") {
    before.value = { score: saved.score, total: saved.total, attempts: saved.attempts ?? 1 };
  }
});

const answered = computed(() => props.questions.filter((q) => answers[q.id] !== null && answers[q.id] !== "").length);
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

function grade(q: Question): { correct: boolean; note: string } {
  const given = answers[q.id];
  if (q.type === "choice") {
    const i = typeof given === "number" ? given : -1;
    return { correct: !!q.options?.[i]?.correct, note: "" };
  }
  const value = parseAnswer(String(given ?? ""));
  if (value === null) return { correct: false, note: "לא נכתב מספר." };
  const target = Number(q.answer);
  if (close(value, target, q.tolerance ?? 0.05)) return { correct: true, note: "" };
  // A known mistake is named even when it lands near the answer (as in NumericExercise).
  const known = q.errors?.find((e) => close(value, Number(e.value), e.tolerance ?? q.tolerance ?? 0.05));
  if (known) return { correct: false, note: known.message };
  const near = q.near ?? ((q.unit ?? "₪") === "₪" ? 1 : 0);
  return close(value, target, near) ? { correct: true, note: "" } : { correct: false, note: "" };
}

const results = computed(() => (submitted.value ? Object.fromEntries(props.questions.map((q) => [q.id, grade(q)])) : {}));
const score = computed(() => Object.values(results.value).filter((r) => r.correct).length);

function submit() {
  submitted.value = true;
  const at = new Date().toISOString();
  const attempts = (before.value?.attempts ?? 0) + 1;
  save(key, { score: score.value, total: props.questions.length, attempts, at });
  before.value = { score: score.value, total: props.questions.length, attempts };
  document.getElementById(`check-${props.stage}-result`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function retry() {
  for (const q of props.questions) answers[q.id] = null;
  submitted.value = false;
}

// The options in a fixed, scrambled order per question: authors list the right answer
// first, and a learner must not pass by picking the first option. The order comes from
// the question's id, so the server and the browser draw the same page.
function shuffled(q: Question): [NonNullable<Question["options"]>[number], number][] {
  const opts = (q.options ?? []).map((o, j) => [o, j] as [NonNullable<Question["options"]>[number], number]);
  let seed = [...q.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  for (let i = opts.length - 1; i > 0; i--) {
    const k = Math.floor(next() * (i + 1));
    [opts[i], opts[k]] = [opts[k], opts[i]];
  }
  return opts;
}

const exact = (q: Question) => new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(Number(q.answer));
const lessonHref = (id: string) => `/lessons/${id.replace(".", "-")}/`;
</script>

<template>
  <div class="my-6">
    <div :id="`check-${stage}-result`" aria-live="polite" class="scroll-mt-24">
      <div v-if="submitted" class="mb-6 rounded-lg bg-info-bg p-5">
        <p class="text-h2 text-n900">{{ score }} מתוך {{ questions.length }} נכונות</p>
        <p class="mt-2 text-body-l text-n800">
          ליד כל שאלה מופיעים ההסבר והשיעור שכדאי לחזור אליו. אפשר לנסות שוב מתי שרוצים, והציון האחרון הוא זה שנשמר.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <a
            v-if="nextHref"
            :href="nextHref"
            class="inline-flex min-h-11 items-center rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0"
          >
            {{ nextLabel ?? "לשלב הבא" }}
          </a>
          <button type="button" class="min-h-11 rounded-md border border-n300 bg-n0 px-5 text-body-m text-navy hover:bg-n50" @click="retry">
            לנסות שוב מההתחלה
          </button>
        </div>
      </div>
      <p v-else-if="before" class="mb-6 rounded-md bg-info-bg p-3 text-body-m text-n800">
        הציון האחרון שלכם בבדיקה הזו: {{ before.score }} מתוך {{ before.total }}. אפשר לענות שוב; הציון החדש יחליף אותו.
      </p>
    </div>

    <ol class="list-reset grid gap-5">
      <li v-for="(q, i) in questions" :key="q.id" class="rounded-lg border bg-n0 p-5 shadow-sm" :class="submitted ? (results[q.id]?.correct ? 'border-success' : 'border-warning') : 'border-n200'">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-body-m font-semibold text-navy">שאלה {{ i + 1 }}</span>
          <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">משיעור {{ q.lesson }}</span>
          <span v-if="submitted" class="text-body-m font-semibold text-n900">{{ results[q.id]?.correct ? "✓ נכון" : "✗ לא נכון" }}</span>
        </div>
        <p class="mt-3 text-body-l text-n800">{{ q.prompt }}</p>

        <label v-if="q.type === 'numeric'" class="mt-4 flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">התשובה שלכם ({{ q.unit ?? "₪" }})</span>
          <input
            v-model="answers[q.id]"
            inputmode="decimal"
            autocomplete="off"
            dir="ltr"
            :disabled="submitted"
            class="h-11 w-44 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none transition-shadow duration-fast ease-out focus:border-turquoise-2 focus:shadow-ring-input disabled:bg-n50"
          />
        </label>
        <div v-else class="mt-4 grid gap-2" role="radiogroup" :aria-label="`שאלה ${i + 1}`">
          <button
            v-for="[o, j] in shuffled(q)"
            :key="j"
            type="button"
            role="radio"
            :aria-checked="answers[q.id] === j"
            :disabled="submitted"
            class="min-h-11 rounded-md border px-4 py-2 text-start text-body-m transition-colors duration-fast ease-out"
            :class="
              submitted && o.correct
                ? 'border-success bg-success-bg text-n900'
                : answers[q.id] === j
                  ? 'border-navy bg-n50 font-semibold text-n900'
                  : 'border-n200 text-n700 hover:bg-n50'
            "
            @click="answers[q.id] = j"
          >
            {{ o.text }}
          </button>
        </div>

        <div v-if="submitted" class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800">
          <p v-if="results[q.id]?.note" class="mb-2">{{ results[q.id]?.note }}</p>
          <p v-if="q.type === 'numeric'" class="mb-2 font-semibold text-n900">
            התשובה: <span class="ltr">{{ exact(q) }}</span> {{ q.unit ?? "₪" }}
          </p>
          <p>{{ q.explanation }}</p>
          <a :href="lessonHref(q.lesson)" class="mt-2 inline-block text-navy underline">לחזור לשיעור {{ q.lesson }}</a>
        </div>
      </li>
    </ol>

    <div v-if="!submitted" class="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        :disabled="answered < questions.length"
        class="min-h-11 rounded-md bg-turquoise px-6 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 disabled:cursor-not-allowed disabled:bg-n200 disabled:text-n600"
        @click="submit"
      >
        סיימתי — לבדיקה
      </button>
      <span class="text-body-m text-n600">עניתם על {{ answered }} מתוך {{ questions.length }}</span>
    </div>
  </div>
</template>
