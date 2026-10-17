<script setup lang="ts">
// The final exam of the course (unit 9.5): one page of closed and open questions, scored once.
// Closed questions (a number or one of several options) are graded by code when the learner presses "סיימתי"; each then shows the right
// answer, the reason and the lesson to go back to. Open questions are ExamOpenQuestion: the learner writes, reads the model answer and
// ticks the rubric lines the text meets. The score adds both. A language model grades nothing. The pass mark is a PROPOSAL of the course
// (a percentage passed in with its points, computed in code): nothing is locked or opened by it. Progress (the answers, the submitted
// state) is kept in this browser through progress.ts, like the stage checks; each open question keeps its own text and ticks.
import { computed, onMounted, reactive, ref } from "vue";
import { load, parseAnswer, save } from "../lib/progress.ts";
import ExamOpenQuestion from "./ExamOpenQuestion.vue";

interface CommonError {
  value: string;
  message: string;
  tolerance?: number;
}
interface RubricLine {
  id: string;
  text: string;
  where: string;
}
interface Item {
  id: string;
  /** The section it belongs to (a key of `sections`). */
  section: string;
  /** The lesson that teaches it, e.g. "4.2" or "9.3": the "go back to" link. */
  lesson: string;
  type: "numeric" | "choice" | "open";
  prompt: string;
  // closed questions
  answer?: string;
  tolerance?: number;
  near?: number;
  unit?: string;
  errors?: CommonError[];
  options?: { text: string; correct?: boolean }[];
  explanation?: string;
  // open questions
  hint?: string;
  model?: string;
  rubric?: RubricLine[];
}
interface Section {
  id: string;
  /** The short name in the score table. */
  short: string;
  /** The heading above the questions. */
  title: string;
  note?: string;
}
const props = defineProps<{
  examId: string;
  sections: Section[];
  items: Item[];
  /** All the points of the exam, and the points the proposed pass mark asks for (both computed in code). */
  totalPoints: number;
  passPoints: number;
  passPercent: number;
}>();

const key = computed(() => `exam:${props.examId}`);
const answers = reactive<Record<string, string | number | null>>(Object.fromEntries(props.items.filter((q) => q.type !== "open").map((q) => [q.id, null])));
const submitted = ref(false);
const resetKey = ref(0);
const openScores = reactive<Record<string, { points: number; max: number; revealed: boolean }>>({});

interface Saved {
  answers: Record<string, string | number | null>;
  submitted: boolean;
}
onMounted(() => {
  const s = load<Saved>(key.value);
  if (s) {
    for (const [k, v] of Object.entries(s.answers ?? {})) if (k in answers) answers[k] = v;
    submitted.value = s.submitted === true;
  }
});

const closed = computed(() => props.items.filter((q) => q.type !== "open"));
const opens = computed(() => props.items.filter((q) => q.type === "open"));
const answered = computed(() => closed.value.filter((q) => answers[q.id] !== null && answers[q.id] !== "").length);
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

function grade(q: Item): { correct: boolean; note: string } {
  const given = answers[q.id];
  if (q.type === "choice") {
    const i = typeof given === "number" ? given : -1;
    return { correct: !!q.options?.[i]?.correct, note: "" };
  }
  const value = parseAnswer(String(given ?? ""));
  if (value === null) return { correct: false, note: "לא נכתב מספר." };
  const target = Number(q.answer);
  if (close(value, target, q.tolerance ?? 0.05)) return { correct: true, note: "" };
  // A known mistake is named even when it lands near the answer (as in NumericExercise and StageCheck).
  const known = q.errors?.find((e) => close(value, Number(e.value), e.tolerance ?? q.tolerance ?? 0.05));
  if (known) return { correct: false, note: known.message };
  const near = q.near ?? ((q.unit ?? "₪") === "₪" ? 1 : 0);
  return close(value, target, near) ? { correct: true, note: "" } : { correct: false, note: "" };
}
const results = computed(() => (submitted.value ? Object.fromEntries(closed.value.map((q) => [q.id, grade(q)])) : {}));
const closedScore = computed(() => Object.values(results.value).filter((r) => r.correct).length);
const openScore = computed(() => opens.value.reduce((s, q) => s + (openScores[q.id]?.revealed ? openScores[q.id].points : 0), 0));
const total = computed(() => closedScore.value + openScore.value);
const percent = computed(() => Math.round((100 * total.value) / props.totalPoints));
const passed = computed(() => total.value >= props.passPoints);
const opensRevealed = computed(() => opens.value.filter((q) => openScores[q.id]?.revealed).length);
const complete = computed(() => submitted.value && opensRevealed.value === opens.value.length);

// The score table: one row for each section.
const rows = computed(() =>
  props.sections.map((s) => {
    const cs = closed.value.filter((q) => q.section === s.id);
    const os = opens.value.filter((q) => q.section === s.id);
    return {
      id: s.id,
      short: s.short,
      closedRight: submitted.value ? cs.filter((q) => results.value[q.id]?.correct).length : null,
      closedMax: cs.length,
      openPoints: os.reduce((n, q) => n + (openScores[q.id]?.revealed ? openScores[q.id].points : 0), 0),
      openMax: os.reduce((n, q) => n + (q.rubric?.length ?? 0), 0),
    };
  }),
);

function persist() {
  save(key.value, { answers: { ...answers }, submitted: submitted.value } satisfies Saved);
}
function setAnswer(id: string, v: string | number) {
  answers[id] = v;
  persist();
}
function submit() {
  submitted.value = true;
  persist();
  save(`${key.value}:result`, { closed: closedScore.value, total: props.totalPoints, at: new Date().toISOString() });
  document.getElementById(`exam-${props.examId.replace(/\./g, "-")}-result`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
const confirmReset = ref(false);
function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true;
    return;
  }
  for (const k of Object.keys(answers)) answers[k] = null;
  submitted.value = false;
  resetKey.value++;
  persist();
  confirmReset.value = false;
}
function onScore(s: { id: string; points: number; max: number; revealed: boolean }) {
  openScores[s.id] = { points: s.points, max: s.max, revealed: s.revealed };
}

// The options in a fixed order per question (the same on the server and in the browser). The wrong options are scrambled by a generator
// seeded with the question's id, and the right one is put at a place that walks through the positions question after question
// (second, first, fourth, third, ...), so it is neither always first nor always in the same place.
function shuffled(q: Item): [NonNullable<Item["options"]>[number], number][] {
  const opts = (q.options ?? []).map((o, j) => [o, j] as [NonNullable<Item["options"]>[number], number]);
  const right = opts.filter(([o]) => o.correct);
  const wrong = opts.filter(([o]) => !o.correct);
  let seed = [...q.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  for (let i = wrong.length - 1; i > 0; i--) {
    const k = Math.floor(next() * (i + 1));
    [wrong[i], wrong[k]] = [wrong[k], wrong[i]];
  }
  const choices = props.items.filter((x) => x.type === "choice");
  const at = (choices.findIndex((x) => x.id === q.id) * 3 + 1) % Math.max(opts.length, 1);
  wrong.splice(at, 0, ...right);
  return wrong;
}
const exact = (q: Item) => new Intl.NumberFormat("he-IL", { maximumFractionDigits: 3 }).format(Number(q.answer));
const lessonHref = (id: string) => `/lessons/${id.replace(".", "-")}/`;
const numberOf = (id: string) => props.items.findIndex((q) => q.id === id) + 1;
const itemsOf = (s: Section) => props.items.filter((q) => q.section === s.id);
const resultId = computed(() => `exam-${props.examId.replace(/\./g, "-")}-result`);
</script>

<template>
  <div class="my-6">
    <p class="rounded-md bg-n50 p-3 text-body-m text-n800" role="status">
      עניתם על {{ answered }} מתוך {{ closed.length }} השאלות הסגורות, והצגתם את הפתרון ב־{{ opensRevealed }} מתוך {{ opens.length }} השאלות הפתוחות.
    </p>

    <section v-for="s in sections" :key="s.id" class="mt-8" :aria-label="s.title">
      <h3 class="!mt-0 text-h3 text-navy">{{ s.title }}</h3>
      <p v-if="s.note" class="mt-1 text-body-m text-n700">{{ s.note }}</p>
      <ol class="list-reset mt-4 grid min-w-0 gap-5">
        <li v-for="q in itemsOf(s)" :key="q.id" class="min-w-0">
          <ExamOpenQuestion
            v-if="q.type === 'open'"
            :exam-id="examId"
            :id="q.id"
            :n="numberOf(q.id)"
            :prompt="q.prompt"
            :hint="q.hint"
            :model="q.model!"
            :rubric="q.rubric!"
            :reset-key="resetKey"
            @score="onScore"
          />
          <div
            v-else
            class="rounded-lg border bg-n0 p-4 shadow-sm sm:p-5"
            :class="submitted ? (results[q.id]?.correct ? 'border-success' : 'border-warning') : 'border-n200'"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-body-m font-semibold text-navy">שאלה {{ numberOf(q.id) }}</span>
              <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">משיעור {{ q.lesson }}</span>
              <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">נקודה אחת</span>
              <span v-if="submitted" class="text-body-m font-semibold text-n900">{{ results[q.id]?.correct ? "✓ נכון" : "✗ לא נכון" }}</span>
            </div>
            <p class="mt-3 whitespace-pre-line text-body-l text-n800">{{ q.prompt }}</p>

            <label v-if="q.type === 'numeric'" class="mt-4 flex flex-col gap-1">
              <span class="text-caption font-semibold text-n600">התשובה שלכם ({{ q.unit ?? "₪" }})</span>
              <input
                :value="answers[q.id] ?? ''"
                inputmode="decimal"
                autocomplete="off"
                dir="ltr"
                :disabled="submitted"
                class="h-11 w-44 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none transition-shadow duration-fast ease-out focus:border-turquoise-2 focus:shadow-ring-input disabled:bg-n50"
                @input="setAnswer(q.id, ($event.target as HTMLInputElement).value)"
              />
            </label>
            <div v-else class="mt-4 grid gap-2" role="radiogroup" :aria-label="`שאלה ${numberOf(q.id)}`">
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
                @click="setAnswer(q.id, j)"
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
          </div>
        </li>
      </ol>
    </section>

    <div class="mt-8 flex flex-wrap items-center gap-4">
      <button
        v-if="!submitted"
        type="button"
        :disabled="answered < closed.length"
        class="min-h-11 rounded-md bg-turquoise px-6 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 disabled:cursor-not-allowed disabled:bg-n200 disabled:text-n600"
        @click="submit"
      >
        סיימתי את השאלות הסגורות: לבדיקה
      </button>
      <span v-if="!submitted" class="text-body-m text-n600">הלחצן נפתח אחרי שעניתם על כל השאלות הסגורות. השאלות הפתוחות לא חוסמות אותו.</span>
      <button type="button" class="min-h-11 rounded-md border border-n300 bg-n0 px-5 text-body-m text-navy hover:bg-n50" @click="reset">
        {{ confirmReset ? "בטוחים? לחצו שוב: התשובות והטקסטים יימחקו" : "מבחן מחדש מההתחלה" }}
      </button>
    </div>

    <div :id="resultId" class="mt-8 scroll-mt-24" aria-live="polite">
      <div class="rounded-lg p-4 sm:p-5" :class="!submitted ? 'bg-n50' : complete ? (passed ? 'bg-success-bg' : 'bg-warning-bg') : 'bg-info-bg'">
        <h3 class="!mt-0 text-h3 text-n900">סיכום הציון</h3>
        <p v-if="!submitted" class="mt-2 text-body-m text-n800">הציון מופיע אחרי שתלחצו על ״סיימתי את השאלות הסגורות״ ותציגו את הפתרון של השאלות הפתוחות.</p>
        <template v-else>
          <p class="mt-2 text-h2 text-n900">
            <span class="ltr">{{ total }}</span> מתוך <span class="ltr">{{ totalPoints }}</span> נקודות (<span class="ltr">{{ percent }}%</span>)
          </p>
          <p class="mt-1 text-body-m text-n800">
            סגורות, לפי הקוד: {{ closedScore }} מתוך {{ closed.length }}. פתוחות, לפי הסימונים שלכם במחוון: {{ openScore }} מתוך
            {{ opens.reduce((n, q) => n + (q.rubric?.length ?? 0), 0) }}.
          </p>
          <p v-if="!complete" class="mt-2 text-body-m text-n800">
            עוד לא הצגתם את הפתרון של {{ opens.length - opensRevealed }} שאלות פתוחות, ולכן הציון חלקי. כתבו תשובה, הציגו את הפתרון וסמנו את המחוון.
          </p>
          <p v-else-if="passed" class="mt-2 text-body-l text-n800">הגעתם לסף המוצע ({{ passPoints }} נקודות).</p>
          <p v-else class="mt-2 text-body-l text-n800">
            לא הגעתם לסף המוצע ({{ passPoints }} נקודות). ליד כל שאלה מופיעים ההסבר והשיעור שכדאי לחזור אליו, ובטבלה למטה רואים באיזה חלק חסרו נקודות.
          </p>
        </template>
        <p class="mt-3 text-body-m text-n800">
          הסף המוצע הוא {{ passPercent }}% מהנקודות, כלומר {{ passPoints }} מתוך {{ totalPoints }}. זו הצעה של הקורס, ממתינה לאישור של דביר, ושום דבר לא ננעל ולא נפתח לפיה.
          מודל שפה לא בודק שום חלק במבחן: את הסגורות בודק קוד, ואת הפתוחות בודקים אתם מול המחוון.
        </p>

        <div v-if="submitted" class="mt-4 overflow-x-auto">
          <table class="w-full border-collapse text-body-m">
            <caption class="pb-2 text-start text-caption font-semibold text-n700">הנקודות לפי חלק</caption>
            <thead>
              <tr class="border-b border-n200 text-caption text-n700">
                <th class="py-2 pe-2 text-start font-semibold">חלק</th>
                <th class="py-2 pe-2 text-start font-semibold">סגורות</th>
                <th class="py-2 text-start font-semibold">פתוחות</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id" class="border-b border-n100">
                <td class="py-2 pe-2 text-n900">{{ r.short }}</td>
                <td class="py-2 pe-2 text-n800">
                  <span v-if="r.closedMax"><span class="ltr">{{ r.closedRight ?? "–" }} / {{ r.closedMax }}</span></span>
                  <span v-else>–</span>
                </td>
                <td class="py-2 text-n800">
                  <span v-if="r.openMax"><span class="ltr">{{ r.openPoints }} / {{ r.openMax }}</span></span>
                  <span v-else>–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
