<script setup lang="ts">
// A half-worked example as a table with blanks, for any columns (lessons 0.1
// and 0.2). FillTable is shaped for compound-interest balances; this one takes
// its columns from the page. Cells are checked to the agora (or to a hundredth
// of a percent), with a small tolerance for rounding.
import { reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { parseAnswer, save } from "../lib/progress.ts";

interface Column {
  key: string;
  label: string;
  format?: "shekels" | "percent" | "plain";
}
const props = defineProps<{
  id: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  /** "row.key", with rows counted from 1: "2.result". */
  blanks: string[];
  /** Shown when every blank is right. */
  done: string;
  /** Shown when some blank is still wrong: what to check. */
  hint: string;
}>();

const entered = reactive<Record<string, string>>({});
const result = reactive<Record<string, "ok" | "bad" | undefined>>({});
const revealed = ref(false);
const keyOf = (r: number, c: string) => `${r + 1}.${c}`;
const isBlank = (r: number, c: string) => props.blanks.includes(keyOf(r, c));
const show = (value: string | number, format: Column["format"]) =>
  format === "shekels" ? formatShekels(value) : format === "percent" ? `${value}%` : String(value);

function check() {
  props.rows.forEach((row, r) => {
    for (const c of props.columns) {
      if (!isBlank(r, c.key)) continue;
      const k = keyOf(r, c.key);
      const v = parseAnswer(entered[k] ?? "");
      result[k] = v !== null && Math.abs(v - Number(row[c.key])) <= 0.02 ? "ok" : "bad";
    }
  });
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");
</script>

<template>
  <div class="my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <table class="w-full min-w-[30rem] border-collapse text-body-m">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th v-for="c in columns" :key="c.key" class="py-2 text-start font-semibold">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in rows" :key="r" class="border-b border-n100">
          <td v-for="c in columns" :key="c.key" class="py-2">
            <template v-if="isBlank(r, c.key) && !revealed">
              <input
                v-model="entered[keyOf(r, c.key)]"
                :aria-label="`${c.label}, שורה ${r + 1}`"
                inputmode="decimal"
                dir="ltr"
                class="h-11 w-32 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="
                  result[keyOf(r, c.key)] === 'bad'
                    ? 'border-danger shadow-ring-error'
                    : result[keyOf(r, c.key)] === 'ok'
                      ? 'border-success'
                      : 'border-n200'
                "
              />
            </template>
            <span v-else class="ltr text-n900" :class="isBlank(r, c.key) ? 'font-semibold' : ''">{{ show(row[c.key], c.format) }}</span>
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
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> {{ done }}</template>
      <template v-else>יש תאים שעוד לא נכונים (מסומנים באדום). {{ hint }}</template>
    </p>
  </div>
</template>
