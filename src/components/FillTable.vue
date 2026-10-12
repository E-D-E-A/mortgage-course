<script setup lang="ts">
// The half-worked example: a table with some cells left for the learner. The
// page names the columns; each column says how its values are shown and
// checked — shekels to the agora (within 2 agorot, so a total from rounded
// rows and one from the formula both count), percent or points to 0.005,
// a date shown only. The first rows are usually given; the learner fills the rest.
//
// On a phone a table with more columns than the box can hold becomes a stack of cards, one per row: the
// row's name as the heading, then "column name: value" pairs (a blank is its label with a full-width
// input under it), in the same order and with the same checks. It is the same table markup restyled by
// CSS (see the style block), so the inputs, their names and the "show the full table" view are unchanged.
// Which tables stack is decided by measuring: five columns or more start stacked (no flash on the server
// render), and below `sm` every table is measured with the plain layout and stacked only if it overflows.
// From `sm` up, and in print, it is always the plain table.
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { glueShekelSign, numberPieces, withMinus } from "../lib/bidi.ts";
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
const root = ref<HTMLElement | null>(null);
const stacked = ref(props.columns.length + (props.periodLabel ? 1 : 0) >= 5);
const nameOf = (row: Row, i: number) => String(row[props.rowKey] ?? i + 1);
const keyOf = (row: Row, i: number, col: string) => `${nameOf(row, i)}.${col}`;
const isBlank = (row: Row, i: number, col: string) => props.blanks.includes(keyOf(row, i, col));
// A row name may hold a range ("6–10") or a signed number; each is drawn left to right (bidi.ts).
const namePieces = (row: Row, i: number) => numberPieces(nameOf(row, i));

const dateFormat = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
const percentFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4, useGrouping: false });
function show(value: string | number | undefined, format: Format = "shekels"): string {
  if (value === undefined || value === "") return "";
  if (format === "shekels") return glueShekelSign(withMinus(formatShekels(String(value))));
  if (format === "percent") return withMinus(`${percentFormat.format(Number(value))}%`);
  if (format === "date") return dateFormat.format(new Date(`${value}T12:00:00Z`));
  return String(value);
}
const tolerance = (format: Format = "shekels") => (format === "shekels" ? 0.02 : 0.005);

function check() {
  props.rows.forEach((row, i) => {
    for (const c of props.columns) {
      if (!isBlank(row, i, c.key)) continue;
      const k = keyOf(row, i, c.key);
      const v = parseAnswer(entered[k] ?? "");
      result[k] = v !== null && Math.abs(v - Number(row[c.key])) <= tolerance(c.format) ? "ok" : "bad";
    }
  });
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");

// Below `sm`: does the plain table overflow its box? Measured with the stacked layout switched off,
// in the same frame, so nothing is painted in between.
const phone = "(max-width: 639.98px)";
let observer: ResizeObserver | null = null;
let lastWidth = -1;
function fit() {
  const el = root.value;
  if (!el || !globalThis.matchMedia?.(phone).matches) return;
  const was = el.hasAttribute("data-stacked");
  el.removeAttribute("data-stacked");
  const overflows = el.scrollWidth > el.clientWidth + 1;
  if (was) el.setAttribute("data-stacked", "");
  stacked.value = overflows;
}
onMounted(() => {
  fit();
  if (typeof ResizeObserver !== "undefined" && root.value) {
    observer = new ResizeObserver(() => {
      const w = root.value?.clientWidth ?? 0;
      if (w === lastWidth) return;
      lastWidth = w;
      fit();
    });
    observer.observe(root.value);
  }
  // The web font changes the widths a little once it has loaded.
  document.fonts?.ready.then(fit);
});
onBeforeUnmount(() => observer?.disconnect());
// Inputs and the values they stand for have different widths.
watch(revealed, () => nextTick(fit));
</script>

<template>
  <div ref="root" class="ft-root my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5" :data-stacked="stacked ? '' : undefined">
    <table class="w-full border-collapse text-caption sm:text-body-m" role="table">
      <thead role="rowgroup">
        <tr class="border-b border-n200 text-caption text-n600" role="row">
          <th v-if="periodLabel" class="py-2 pe-2 text-start align-bottom font-semibold last:pe-0 sm:pe-3" role="columnheader">{{ periodLabel }}</th>
          <th v-for="c in columns" :key="c.key" class="py-2 pe-2 text-start align-bottom font-semibold last:pe-0 sm:pe-3" role="columnheader">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        <tr v-for="(row, i) in rows" :key="nameOf(row, i)" class="border-b border-n100" role="row">
          <td v-if="periodLabel" class="ft-name py-2 pe-2 text-n700 last:pe-0 sm:pe-3" :data-label="periodLabel" role="cell">
            <template v-for="(p, j) in namePieces(row, i)" :key="j"><span v-if="p.ltr" class="ltr whitespace-nowrap">{{ p.text }}</span><template v-else>{{ p.text }}</template></template>
          </td>
          <td
            v-for="c in columns"
            :key="c.key"
            class="py-2 pe-2 last:pe-0 sm:pe-3"
            :class="isBlank(row, i, c.key) && !revealed ? 'ft-blank' : ''"
            :data-label="c.label"
            role="cell"
          >
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

<style>
/* The stacked layout: the same table, drawn as one card per row on a phone (see the script's header).
   Screen only and below `sm` (40rem); print and wider screens keep the plain table. */
@media screen and (max-width: 639.98px) {
  .ft-root[data-stacked] table,
  .ft-root[data-stacked] tbody,
  .ft-root[data-stacked] tr,
  .ft-root[data-stacked] td {
    display: block;
  }
  /* The column names move into each cell; the header row stays for assistive technology only. */
  .ft-root[data-stacked] thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .ft-root[data-stacked] tbody tr {
    margin-block-end: var(--mogi-space-3);
    padding: var(--mogi-space-2) var(--mogi-space-3);
    border: 1px solid var(--mogi-n200);
    border-radius: var(--mogi-radius-md);
    background: var(--mogi-n0);
  }
  .ft-root[data-stacked] tbody tr:last-child {
    margin-block-end: 0;
  }
  .ft-root[data-stacked] td {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--mogi-space-1) var(--mogi-space-3);
    padding: var(--mogi-space-1) 0;
    font-size: var(--mogi-text-body-m-size);
    line-height: var(--mogi-text-body-m-line);
  }
  .ft-root[data-stacked] td::before {
    content: attr(data-label);
    color: var(--mogi-n600);
    font-size: var(--mogi-text-caption-size);
    line-height: var(--mogi-text-caption-line);
  }
  /* The row's name is the card's heading: "חודש 3". */
  .ft-root[data-stacked] td.ft-name {
    display: block;
    margin-block-end: var(--mogi-space-1);
    padding-block-end: var(--mogi-space-2);
    border-block-end: 1px solid var(--mogi-n100);
    color: var(--mogi-n900);
    font-weight: 600;
  }
  .ft-root[data-stacked] td.ft-name::before {
    content: attr(data-label) " ";
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }
  /* A blank: its label, then the input across the card. */
  .ft-root[data-stacked] td.ft-blank::before {
    flex: 1 0 100%;
  }
  .ft-root[data-stacked] td.ft-blank input {
    width: 100%;
    max-width: none;
    min-height: 44px;
  }
}
</style>
