<script setup lang="ts">
// The half-worked example: a table with some cells left for the learner.
// Cells are checked to the agora (within a small tolerance for rounding).
import { reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { parseAnswer, save } from "../lib/progress.ts";

interface Row {
  period: number;
  opening: string;
  interest: string;
  closing: string;
}
const props = defineProps<{ id: string; rows: Row[]; blanks: string[]; periodLabel?: string }>();
const columns: { key: keyof Row; label: string }[] = [
  { key: "opening", label: "יתרה בתחילת השנה" },
  { key: "interest", label: "ריבית השנה" },
  { key: "closing", label: "יתרה בסוף השנה" },
];
const entered = reactive<Record<string, string>>({});
const result = reactive<Record<string, "ok" | "bad" | undefined>>({});
const revealed = ref(false);
const isBlank = (row: Row, key: string) => props.blanks.includes(`${row.period}.${key}`);

function check() {
  for (const row of props.rows) {
    for (const c of columns) {
      const k = `${row.period}.${c.key}`;
      if (!isBlank(row, c.key)) continue;
      const v = parseAnswer(entered[k] ?? "");
      result[k] = v !== null && Math.abs(v - Number(row[c.key])) <= 0.02 ? "ok" : "bad";
    }
  }
  save(`exercise:${props.id}`, { done: Object.values(result).every((r) => r === "ok") });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");
</script>

<template>
  <div class="my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <table class="w-full min-w-[30rem] border-collapse text-body-m">
      <thead>
        <tr class="border-b border-n200 text-start text-caption text-n600">
          <th class="py-2 text-start font-semibold">{{ periodLabel ?? "שנה" }}</th>
          <th v-for="c in columns" :key="c.key" class="py-2 text-start font-semibold">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.period" class="border-b border-n100">
          <td class="py-2 text-n700">{{ row.period }}</td>
          <td v-for="c in columns" :key="c.key" class="py-2">
            <template v-if="isBlank(row, c.key) && !revealed">
              <input
                v-model="entered[`${row.period}.${c.key}`]"
                :aria-label="`${c.label}, שנה ${row.period}`"
                inputmode="decimal"
                dir="ltr"
                class="h-10 w-32 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="
                  result[`${row.period}.${c.key}`] === 'bad'
                    ? 'border-danger shadow-ring-error'
                    : result[`${row.period}.${c.key}`] === 'ok'
                      ? 'border-success'
                      : 'border-n200'
                "
              />
            </template>
            <span v-else class="ltr text-n900" :class="isBlank(row, c.key) ? 'font-semibold' : ''">{{ formatShekels(row[c.key]) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="check"
      >
        בדיקה
      </button>
      <button type="button" class="text-body-m text-navy underline" @click="revealed = !revealed">
        {{ revealed ? "חזרה למילוי" : "הצגת הטבלה המלאה" }}
      </button>
    </div>
    <p v-if="Object.keys(result).length" class="mt-3 rounded-md p-3 text-body-m text-n800" :class="allOk() ? 'bg-success-bg' : 'bg-warning-bg'" aria-live="polite">
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> ככה בדיוק עובדת ריבית דריבית: כל שנה מתחילה מהיתרה של סוף השנה הקודמת.</template>
      <template v-else>
        יש תאים שעוד לא נכונים (מסומנים באדום). בדקו: האם חישבתם את הריבית על <strong>היתרה של תחילת השנה</strong>, ולא על הסכום המקורי?
      </template>
    </p>
  </div>
</template>
