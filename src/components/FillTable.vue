<script setup lang="ts">
// The half-worked example: a table with some cells left for the learner. The
// page names the columns; each column says how its values are shown and
// checked — shekels to the agora (within 2 agorot, so a total from rounded
// rows and one from the formula both count), percent or points to 0.005,
// a date shown only. The first rows are usually given; the learner fills the rest.
import { reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { parseAnswer, save } from "../lib/progress.ts";

type Format = "shekels" | "percent" | "points" | "number" | "date";
interface Column {
  key: string;
  label: string;
  /** Default: shekels. */
  format?: Format;
}
type Row = Record<string, string | number>;
const props = withDefaults(
  defineProps<{
    id: string;
    columns: Column[];
    rows: Row[];
    /** "<row>.<column>", the row named by its rowKey value (or its number from 1 when it has none): "2.interest". */
    blanks: string[];
    /** The field that names a row, shown in the first column when periodLabel is given. */
    rowKey?: string;
    periodLabel?: string;
    /** Shown when every blank is right: what the table just showed. */
    success: string;
    /** Shown when a blank is wrong: where to look. */
    hint: string;
  }>(),
  { rowKey: "period", periodLabel: undefined },
);

const entered = reactive<Record<string, string>>({});
const result = reactive<Record<string, "ok" | "bad" | undefined>>({});
const revealed = ref(false);
const nameOf = (row: Row, i: number) => String(row[props.rowKey] ?? i + 1);
const keyOf = (row: Row, i: number, col: string) => `${nameOf(row, i)}.${col}`;
const isBlank = (row: Row, i: number, col: string) => props.blanks.includes(keyOf(row, i, col));

const dateFormat = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
const percentFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4, useGrouping: false });
function show(value: string | number | undefined, format: Format = "shekels"): string {
  if (value === undefined || value === "") return "";
  if (format === "shekels") return formatShekels(String(value));
  if (format === "percent") return `${percentFormat.format(Number(value))}%`;
  if (format === "date") return dateFormat.format(new Date(`${value}T12:00:00Z`));
  return String(value);
}
const tolerance = (format: Format = "shekels") => (format === "shekels" ? 0.02 : 0.005);

function check() {
  props.rows.forEach((row, i) => {
    for (const c of props.columns) {
      if (!isBlank(row, i, c.key)) continue;
      const k = keyOf(row, i, c.key);
      const v = parseAnswer((entered[k] ?? "").replace("−", "-"));
      result[k] = v !== null && Math.abs(v - Number(row[c.key])) <= tolerance(c.format) ? "ok" : "bad";
    }
  });
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");
</script>

<template>
  <div class="my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5">
    <table class="w-full border-collapse text-caption sm:text-body-m">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th v-if="periodLabel" class="py-2 pe-1 text-start font-semibold sm:pe-3">{{ periodLabel }}</th>
          <th v-for="c in columns" :key="c.key" class="py-2 pe-1 text-start font-semibold sm:pe-2">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="nameOf(row, i)" class="border-b border-n100">
          <td v-if="periodLabel" class="py-2 pe-1 text-n700 sm:pe-3">{{ nameOf(row, i) }}</td>
          <td v-for="c in columns" :key="c.key" class="py-2 pe-1 sm:pe-2">
            <template v-if="isBlank(row, i, c.key) && !revealed">
              <input
                v-model="entered[keyOf(row, i, c.key)]"
                :aria-label="`${c.label}, ${periodLabel ?? 'שורה'} ${nameOf(row, i)}`"
                inputmode="decimal"
                dir="ltr"
                class="h-11 w-full min-w-14 max-w-28 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="
                  result[keyOf(row, i, c.key)] === 'bad'
                    ? 'border-danger shadow-ring-error'
                    : result[keyOf(row, i, c.key)] === 'ok'
                      ? 'border-success'
                      : 'border-n200'
                "
              />
            </template>
            <span v-else :class="[c.format === 'date' ? '' : 'ltr whitespace-nowrap', isBlank(row, i, c.key) ? 'font-semibold' : '', 'text-n900']">{{
              show(row[c.key], c.format)
            }}</span>
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
    <p
      v-if="Object.keys(result).length"
      class="mt-3 rounded-md p-3 text-body-m text-n800"
      :class="allOk() ? 'bg-success-bg' : 'bg-warning-bg'"
      aria-live="polite"
    >
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> {{ success }}</template>
      <template v-else>יש תאים שעוד לא נכונים (מסומנים באדום). {{ hint }}</template>
    </p>
  </div>
</template>
