<script setup lang="ts">
// A numeric exercise. The answer is checked within a tolerance; each common
// mistake has its own explanation, so a wrong answer teaches instead of just
// saying "wrong". After two wrong tries, or a right answer, the worked
// solution beside it opens.
import { onMounted, ref } from "vue";
import { load, parseAnswer, save } from "../lib/progress.ts";

interface CommonError {
  value: string;
  message: string;
  tolerance?: number;
}
const props = withDefaults(
  defineProps<{
    id: string;
    n: number;
    level: "קל" | "בינוני" | "מאתגר";
    answer: string;
    tolerance?: number;
    /** An answer this close counts as right, with the exact value shown. Default: 1 for shekels (rounded to
     *  the shekel), 0 for any other unit — a whole percentage point off is not "about right". */
    near?: number;
    unit?: string;
    errors?: CommonError[];
    hint?: string;
  }>(),
  { tolerance: 0.05, near: undefined, unit: "₪", errors: () => [], hint: undefined },
);

type State = "idle" | "correct" | "known-error" | "wrong" | "unreadable";
const text = ref("");
const state = ref<State>("idle");
const message = ref("");
const tries = ref(0);
const nearNote = ref("");
const exact = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(Number(props.answer));
const inputId = `ex-${props.id}`;
const near = props.near ?? (props.unit === "₪" ? 1 : 0);

onMounted(() => {
  const saved = load<{ text: string; correct: boolean }>(`exercise:${props.id}`);
  if (saved?.correct) {
    text.value = saved.text;
    state.value = "correct";
    unlockSolution();
  }
});

const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

function check() {
  const value = parseAnswer(text.value);
  if (value === null) {
    state.value = "unreadable";
    message.value = "לא הצלחנו לקרוא מספר. כתבו רק ספרות, למשל 1210 או 1,210.";
    return;
  }
  tries.value++;
  const exactHit = close(value, Number(props.answer), props.tolerance);
  // A known mistake is named even when it lands near the answer, so it is checked before "about right".
  const known = exactHit ? undefined : props.errors.find((e) => close(value, Number(e.value), e.tolerance ?? props.tolerance));
  if (exactHit || (!known && close(value, Number(props.answer), near))) {
    const precision = props.unit === "₪" ? ", עד האגורה" : "";
    nearNote.value = exactHit ? "" : `נכון בקירוב. התשובה המדויקת${precision}: ${exact}${props.unit ? ` ${props.unit}` : ""}.`;
    state.value = "correct";
    save(`exercise:${props.id}`, { text: text.value, correct: true });
    unlockSolution();
    return;
  }
  state.value = known ? "known-error" : "wrong";
  message.value = known ? known.message : props.hint ?? "עדיין לא. חזרו לדוגמה הפתורה ונסו שוב, צעד אחר צעד.";
  save(`exercise:${props.id}`, { text: text.value, correct: false });
  if (tries.value >= 2) unlockSolution();
}

// The solution sits beside the exercise (<Solution for="…">); this tells it to show.
function unlockSolution() {
  document.dispatchEvent(new CustomEvent("mogi:solution", { detail: props.id }));
}

</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="flex items-center gap-3">
      <span class="text-body-m font-semibold text-navy">תרגיל {{ n }}</span>
      <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">{{ level }}</span>
    </div>
    <div class="mt-3 text-body-l text-n800"><slot /></div>
    <form class="mt-4 flex flex-wrap items-end gap-3" @submit.prevent="check">
      <label :for="inputId" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">התשובה שלכם<template v-if="unit"> ({{ unit }})</template></span>
        <input
          :id="inputId"
          v-model="text"
          inputmode="decimal"
          autocomplete="off"
          dir="ltr"
          class="h-11 w-44 rounded-md border bg-n0 px-3 text-body-l text-n900 outline-none transition-shadow duration-fast ease-out focus:border-turquoise-2 focus:shadow-ring-input"
          :class="state === 'wrong' || state === 'known-error' ? 'border-danger shadow-ring-error' : 'border-n200'"
          :aria-describedby="`${inputId}-feedback`"
        />
      </label>
      <button
        type="submit"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
      >
        בדיקה
      </button>
    </form>
    <div :id="`${inputId}-feedback`" aria-live="polite">
      <p v-if="state === 'correct'" class="mt-3 rounded-md bg-success-bg p-3 text-body-m text-n800">
        <strong class="text-n900">נכון.</strong> {{ nearNote }} הפתרון המלא פתוח מתחת לתרגיל, להשוואה.
      </p>
      <p v-else-if="state === 'known-error' || state === 'wrong'" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800">
        {{ message }}
        <span v-if="tries >= 2" class="mt-1 block">הפתרון המלא נפתח מתחת לתרגיל.</span>
      </p>
      <p v-else-if="state === 'unreadable'" class="mt-3 text-body-m text-danger">{{ message }}</p>
    </div>
  </div>
</template>
