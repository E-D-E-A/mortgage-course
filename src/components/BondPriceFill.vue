<script setup lang="ts">
// The half-worked bond price (lessons 0.11, 0.12): each payment, the yield it
// is discounted at, and its present value; the price is their sum. The first
// row is given; the learner fills the blanks. Cells are checked to the agora,
// within 2 agorot, so a total from rounded rows and one from the formula both count.
import { reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { parseAnswer, save } from "../lib/progress.ts";

interface Row {
  year: number;
  payment: string;
  rate: string;
  pv: string;
}
const props = defineProps<{ id: string; rows: Row[]; total: string; blanks: string[]; hint: string }>();
const entered = reactive<Record<string, string>>({});
const result = reactive<Record<string, "ok" | "bad" | undefined>>({});
const revealed = ref(false);

const cells: { key: string; expected: string; label: string }[] = [
  ...props.rows.flatMap((r) => [
    { key: `${r.year}.payment`, expected: r.payment, label: `תשלום, שנה ${r.year}` },
    { key: `${r.year}.pv`, expected: r.pv, label: `ערך נוכחי, שנה ${r.year}` },
  ]),
  { key: "total", expected: props.total, label: "המחיר" },
];
const isBlank = (key: string) => props.blanks.includes(key) && !revealed.value;
const cls = (key: string) =>
  result[key] === "bad" ? "border-danger shadow-ring-error" : result[key] === "ok" ? "border-success" : "border-n200";

function check() {
  for (const c of cells) {
    if (!props.blanks.includes(c.key)) continue;
    const v = parseAnswer(entered[c.key] ?? "");
    result[c.key] = v !== null && Math.abs(v - Number(c.expected)) <= 0.02 ? "ok" : "bad";
  }
  save(`exercise:${props.id}`, { done: allOk() });
}
const allOk = () => props.blanks.every((b) => result[b] === "ok");
const label = (key: string) => cells.find((c) => c.key === key)?.label ?? key;
</script>

<template>
  <div class="my-6 overflow-x-auto rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <table class="w-full min-w-[30rem] border-collapse text-body-m">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th class="py-2 text-start font-semibold">שנה</th>
          <th class="py-2 text-start font-semibold">תשלום</th>
          <th class="py-2 text-start font-semibold">תשואה</th>
          <th class="py-2 text-start font-semibold">ערך נוכחי של התשלום</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.year" class="border-b border-n100">
          <td class="py-2 text-n700">{{ row.year }}</td>
          <td v-for="k in ['payment', 'rate', 'pv']" :key="k" class="py-2">
            <input
              v-if="k !== 'rate' && isBlank(`${row.year}.${k}`)"
              v-model="entered[`${row.year}.${k}`]"
              :aria-label="label(`${row.year}.${k}`)"
              inputmode="decimal"
              dir="ltr"
              class="h-11 w-28 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
              :class="cls(`${row.year}.${k}`)"
            />
            <span v-else-if="k === 'rate'" class="ltr text-n900">{{ Number(row.rate) }}%</span>
            <span v-else class="ltr text-n900" :class="blanks.includes(`${row.year}.${k}`) ? 'font-semibold' : ''">{{
              formatShekels(k === "pv" ? row.pv : row.payment)
            }}</span>
          </td>
        </tr>
        <tr>
          <td class="py-2 font-semibold text-n900" colspan="3">המחיר: סכום הערכים הנוכחיים</td>
          <td class="py-2">
            <input
              v-if="isBlank('total')"
              v-model="entered.total"
              aria-label="המחיר"
              inputmode="decimal"
              dir="ltr"
              class="h-11 w-28 rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
              :class="cls('total')"
            />
            <span v-else class="ltr font-semibold text-n900">{{ formatShekels(total) }}</span>
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
      <template v-if="allOk()"><strong class="text-n900">הכול נכון.</strong> המחיר הוא סכום הערכים הנוכחיים של כל התשלומים.</template>
      <template v-else>יש תאים שעוד לא נכונים (מסומנים באדום). {{ hint }}</template>
    </p>
  </div>
</template>
