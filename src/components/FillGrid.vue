<script setup lang="ts">
// A half-worked example as a table with some cells left for the learner, for
// any columns (FillTable is fixed to the compound-interest columns). Each column
// says how its values are shown and checked: shekels (to the agora), percent or
// points (to 0.01), or a date (shown only). Used by lessons 0.7–0.10.
import { reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { parseAnswer, save } from "../lib/progress.ts";

interface Column {
  key: string;
  label: string;
  format: "shekels" | "percent" | "points" | "number" | "date";
}
const props = defineProps<{
  id: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  /** "row.key", rows counted from 1 by their `period`. */
  blanks: string[];
  periodLabel?: string;
  /** Shown when every blank is right. */
  success: string;
  /** Shown when a blank is wrong: where to look. */
  hint: string;
}>();

const entered = reactive<Record<string, string>>({});
const result = reactive<Record<string, "ok" | "bad" | undefined>>({});
const revealed = ref(false);
const isBlank = (row: Record<string, string | number>, key: string) => props.blanks.includes(`${row.period}.${key}`);

const dateFormat = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
function show(value: string | number, format: Column["format"]): string {
  if (format === "shekels") return formatShekels(String(value));
  if (format === "percent") return `${value}%`;
  if (format === "date") return dateFormat.format(new Date(`${value}T12:00:00Z`));
  return String(value);
}
const tolerance = (format: Column["format"]) => (format === "shekels" ? 0.02 : 0.005);

function check() {
  for (const row of props.rows) {
    for (const c of props.columns) {
      if (!isBlank(row, c.key)) continue;
      const k = `${row.period}.${c.key}`;
      const v = parseAnswer((entered[k] ?? "").replace("−", "-"));
      result[k] = v !== null && Math.abs(v - Number(row[c.key])) <= tolerance(c.format) ? "ok" : "bad";
    }
  }
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");
</script>

<template>
  <div class="my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <table class="w-full min-w-[30rem] border-collapse text-body-m">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th v-if="periodLabel" class="py-2 text-start font-semibold">{{ periodLabel }}</th>
          <th v-for="c in columns" :key="c.key" class="py-2 text-start font-semibold">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.period" class="border-b border-n100">
          <td v-if="periodLabel" class="py-2 text-n700">{{ row.period }}</td>
          <td v-for="c in columns" :key="c.key" class="py-2 pe-2">
            <template v-if="isBlank(row, c.key) && !revealed">
              <input
                v-model="entered[`${row.period}.${c.key}`]"
                :aria-label="`${c.label}, שורה ${row.period}`"
                inputmode="decimal"
                dir="ltr"
                class="h-11 w-28 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="
                  result[`${row.period}.${c.key}`] === 'bad'
                    ? 'border-danger shadow-ring-error'
                    : result[`${row.period}.${c.key}`] === 'ok'
                      ? 'border-success'
                      : 'border-n200'
                "
              />
            </template>
            <span v-else :class="[c.format === 'date' ? '' : 'ltr', isBlank(row, c.key) ? 'font-semibold text-n900' : 'text-n900']">{{ show(row[c.key], c.format) }}</span>
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
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="revealed = !revealed">
        {{ revealed ? "חזרה למילוי" : "הצגת הטבלה המלאה" }}
      </button>
    </div>
    <p v-if="Object.keys(result).length" class="mt-3 rounded-md p-3 text-body-m text-n800" :class="allOk() ? 'bg-success-bg' : 'bg-warning-bg'" aria-live="polite">
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> {{ success }}</template>
      <template v-else>יש תאים שעוד לא נכונים (מסומנים באדום). {{ hint }}</template>
    </p>
  </div>
</template>
