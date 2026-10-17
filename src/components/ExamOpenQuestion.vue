<script setup lang="ts">
// An open question of an exam, graded by the learner against a rubric ("מחוון"). The learner writes first. Only then can the page show
// the model answer and the rubric lines; each line is ticked by the learner when the written answer meets it (one point a line). Nothing
// is graded by a tool and nothing by a language model: the tool only counts the ticks. On a phone the rubric is a list of cards, one per
// line; "הצגה כטבלה" lays it out as a table (what the checker looks for · where the model answer says it · the learner's tick).
// The text, the "revealed" state and the ticks are kept in this browser through progress.ts, under the exam's id and the question's id.
// The component is the exam's only open-question piece: it reports its points to the page (the `score` event, also once on load).
import { computed, onMounted, reactive, ref, watch } from "vue";
import { load, save } from "../lib/progress.ts";

interface RubricLine {
  id: string;
  /** What the answer must contain, in a sentence the learner can judge their own text against. */
  text: string;
  /** Where the model answer says it (a short quotation or a pointer), shown in the table view. */
  where: string;
}
const props = defineProps<{
  examId: string;
  id: string;
  /** The question's number in the exam. */
  n: number;
  prompt: string;
  /** What the learner should write (words, not a number), e.g. "ארבעה משפטים". */
  hint?: string;
  /** The model answer, whole; paragraphs separated by a blank line. */
  model: string;
  rubric: RubricLine[];
  /** Bump to clear the text, the reveal and the ticks. */
  resetKey?: number;
}>();
const emit = defineEmits<{ score: [{ id: string; points: number; max: number; revealed: boolean }] }>();

interface Saved {
  text: string;
  revealed: boolean;
  ticks: string[];
}
const key = computed(() => `exam:${props.examId}:open:${props.id}`);
const text = ref("");
const revealed = ref(false);
const ticks = reactive<Record<string, boolean>>({});
const asTable = ref(false);

const points = computed(() => (revealed.value ? props.rubric.filter((r) => ticks[r.id]).length : 0));
const words = computed(() => (text.value.trim() ? text.value.trim().split(/\s+/).length : 0));
const canReveal = computed(() => words.value >= 1);

function report() {
  emit("score", { id: props.id, points: points.value, max: props.rubric.length, revealed: revealed.value });
}
function persist() {
  save(key.value, { text: text.value, revealed: revealed.value, ticks: Object.keys(ticks).filter((k) => ticks[k]) } satisfies Saved);
}
onMounted(() => {
  const s = load<Saved>(key.value);
  if (s) {
    text.value = s.text ?? "";
    revealed.value = s.revealed === true;
    for (const t of s.ticks ?? []) ticks[t] = true;
  }
  report();
});
watch(points, report);
watch(revealed, report);
watch(
  () => props.resetKey,
  () => {
    text.value = "";
    revealed.value = false;
    for (const k of Object.keys(ticks)) delete ticks[k];
    persist();
  },
);

function onText(e: Event) {
  text.value = (e.target as HTMLTextAreaElement).value;
  persist();
}
function reveal() {
  revealed.value = true;
  persist();
}
function toggle(id: string) {
  ticks[id] = !ticks[id];
  persist();
}
const fieldId = computed(() => `exam-${props.examId}-${props.id}`.replace(/\./g, "-"));
</script>

<template>
  <div class="min-w-0 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-body-m font-semibold text-navy">שאלה {{ n }}</span>
      <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">שאלה פתוחה</span>
      <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">{{ rubric.length }} נקודות, לפי המחוון</span>
    </div>
    <p class="mt-3 whitespace-pre-line text-body-l text-n800">{{ prompt }}</p>

    <label :for="fieldId" class="mt-4 block">
      <span class="text-caption font-semibold text-n600">התשובה שלכם{{ hint ? ` (${hint})` : "" }}</span>
      <textarea
        :id="fieldId"
        rows="6"
        class="mt-1 w-full rounded-md border border-n200 bg-n0 p-3 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input disabled:bg-n50"
        :value="text"
        :disabled="revealed"
        @input="onText"
      ></textarea>
    </label>
    <p class="text-caption text-n600">{{ words }} מילים. הטקסט נשמר בדפדפן הזה בלבד.</p>

    <div v-if="!revealed" class="mt-3">
      <button
        type="button"
        :disabled="!canReveal"
        class="min-h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 disabled:cursor-not-allowed disabled:bg-n200 disabled:text-n600"
        @click="reveal"
      >
        סיימתי לכתוב: להציג את תשובת הדוגמה ואת המחוון
      </button>
      <p class="mt-1 text-caption text-n600">אחרי הלחיצה אי אפשר לערוך את התשובה. כך הציון נשאר שלכם ולא של תשובת הדוגמה.</p>
    </div>

    <div v-else class="mt-4 grid min-w-0 gap-4">
      <section class="min-w-0 rounded-md border border-n200 bg-n50 p-3 sm:p-4" aria-label="תשובת דוגמה">
        <h4 class="!mt-0 text-body-m font-semibold text-n900">תשובת דוגמה</h4>
        <p class="mt-1 whitespace-pre-line text-body-m text-n800">{{ model }}</p>
        <p class="mt-2 text-caption text-n600">זו תשובה אחת סבירה, לא התשובה היחידה: ניסוח אחר שעומד בשורות המחוון מקבל את אותן נקודות.</p>
      </section>

      <section class="min-w-0" aria-label="מחוון">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h4 class="!mt-0 text-body-m font-semibold text-n900">המחוון: {{ points }} מתוך {{ rubric.length }}</h4>
          <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="asTable" @click="asTable = !asTable">
            {{ asTable ? "הצגה ברשימה" : "הצגה כטבלה" }}
          </button>
        </div>
        <p class="text-caption text-n600">סמנו שורה רק אם התשובה שכתבתם עומדת בה במלואה. הסימון הוא של מי שכתב; אף כלי ואף מודל שפה לא בודקים אותו.</p>

        <div v-if="asTable" class="mt-2 overflow-x-auto">
          <table class="w-full border-collapse text-caption sm:min-w-[30rem] sm:text-body-m">
            <thead>
              <tr class="border-b border-n200 text-caption text-n600">
                <th class="py-2 pe-3 text-start font-semibold">מה המחוון דורש</th>
                <th class="py-2 pe-3 text-start font-semibold">איפה זה בתשובת הדוגמה</th>
                <th class="py-2 text-start font-semibold">עמדתי בזה</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rubric" :key="r.id" class="border-b border-n100 align-top">
                <td class="py-2 pe-3 text-n900">{{ r.text }}</td>
                <td class="py-2 pe-3 text-n700">{{ r.where }}</td>
                <td class="py-2">
                  <label class="flex min-h-11 min-w-11 cursor-pointer items-center gap-2">
                    <input type="checkbox" class="h-5 w-5 accent-teal-deep" :checked="!!ticks[r.id]" :aria-label="`עמדתי בשורה: ${r.text}`" @change="toggle(r.id)" />
                    <span class="text-caption text-n700">{{ ticks[r.id] ? "כן" : "לא" }}</span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul v-else class="list-reset mt-2 grid gap-2">
          <li v-for="r in rubric" :key="r.id" class="rounded-md border border-n200 p-2">
            <label class="flex min-h-11 cursor-pointer items-start gap-3">
              <input type="checkbox" class="mt-1 h-5 w-5 shrink-0 accent-teal-deep" :checked="!!ticks[r.id]" @change="toggle(r.id)" />
              <span class="text-body-m text-n800">
                {{ r.text }}
                <span class="mt-1 block text-caption text-n600">בתשובת הדוגמה: {{ r.where }}</span>
              </span>
            </label>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
