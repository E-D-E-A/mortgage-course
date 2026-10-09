<script setup lang="ts">
// A half-worked example for ideas that are names, not numbers: each row is a
// situation, and the learner picks its answer from one shared list. The first
// rows are usually given. Lessons 1.6 ("who does this?") and 1.8 ("does this
// bind the bank?"). Every row carries a short reason, shown once it is checked.
import { reactive, ref, watch } from "vue";
import { save } from "../lib/progress.ts";

interface Row {
  prompt: string;
  /** The right option, as written in `options`. */
  answer: string;
  /** Why: shown after checking, or in the full table. */
  why: string;
  /** Filled in from the start, as the worked part. */
  given?: boolean;
}
const props = defineProps<{
  id: string;
  /** Header of the situation column, and of the answer column. */
  promptLabel: string;
  answerLabel: string;
  options: string[];
  rows: Row[];
  success: string;
  hint: string;
}>();

const picked = reactive<Record<number, string>>({});
const result = reactive<Record<number, "ok" | "bad" | "empty" | undefined>>({});
const revealed = ref(false);
const open = props.rows.map((r, i) => (r.given ? -1 : i)).filter((i) => i >= 0);
for (const i of open) picked[i] = "";
// A changed answer is no longer the one that was checked: clear its mark until the next check.
for (const i of open) watch(() => picked[i], () => (result[i] = undefined));

function check() {
  for (const i of open) result[i] = picked[i] === "" ? "empty" : picked[i] === props.rows[i].answer ? "ok" : "bad";
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => open.every((i) => result[i] === "ok");
const checked = () => open.some((i) => result[i] !== undefined);
const anyEmpty = () => open.some((i) => result[i] === "empty");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5">
    <ol class="list-reset grid gap-3">
      <li v-for="(r, i) in rows" :key="i" class="rounded-md border border-n100 p-3">
        <p class="text-caption font-semibold text-n600">{{ promptLabel }} {{ i + 1 }}</p>
        <p class="mt-1 text-body-m text-n900">{{ r.prompt }}</p>
        <div class="mt-2">
          <template v-if="r.given || revealed">
            <p class="text-body-m">
              <span class="text-caption font-semibold text-n600">{{ answerLabel }}: </span>
              <strong class="text-n900">{{ r.answer }}</strong>
            </p>
            <p class="mt-1 text-caption text-n700">{{ r.why }}</p>
          </template>
          <template v-else>
            <label class="flex flex-col gap-1">
              <span class="text-caption font-semibold text-n600">{{ answerLabel }}</span>
              <select
                v-model="picked[i]"
                :aria-invalid="result[i] === 'bad' ? 'true' : undefined"
                :aria-describedby="result[i] ? `${id}-row-${i}` : undefined"
                class="h-11 w-full rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="result[i] === 'bad' ? 'border-danger shadow-ring-error' : result[i] === 'ok' ? 'border-success' : 'border-n200'"
              >
                <option disabled value="">בחרו…</option>
                <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
              </select>
            </label>
            <p v-if="result[i] === 'ok'" :id="`${id}-row-${i}`" class="mt-1 text-caption text-n700"><strong class="text-n900">✓ נכון.</strong> {{ r.why }}</p>
            <p v-else-if="result[i] === 'bad'" :id="`${id}-row-${i}`" class="mt-1 text-caption font-semibold text-n900"><span aria-hidden="true">✗ </span>לא נכון. נסו תשובה אחרת.</p>
            <p v-else-if="result[i] === 'empty'" :id="`${id}-row-${i}`" class="mt-1 text-caption text-n700">עוד לא בחרתם תשובה בשורה הזו.</p>
          </template>
        </div>
      </li>
    </ol>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="check"
      >
        בדיקה
      </button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="revealed = !revealed">
        {{ revealed ? "חזרה למילוי" : "הצגת כל התשובות" }}
      </button>
    </div>
    <p v-if="checked()" class="mt-3 rounded-md p-3 text-body-m text-n800" :class="allOk() ? 'bg-success-bg' : 'bg-warning-bg'" aria-live="polite">
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> {{ success }}</template>
      <template v-else-if="anyEmpty() && open.every((i) => result[i] !== 'bad')">בחרו תשובה בכל השורות, ואז בדקו.</template>
      <template v-else>יש שורות שעוד לא נכונות (מסומנות ב״לא נכון״). {{ hint }}</template>
    </p>
  </div>
</template>
