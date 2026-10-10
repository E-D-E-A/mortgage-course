<script setup lang="ts">
// Lesson 3.9: "לאן הולך הכסף" — everything a loan costs, split into what it is
// made of: the principal coming back, the interest, what the index added to the
// debt (a linked track), and a one-time fee. One track, Spitzer, in the
// statement convention from metrics.ts (each month's interest in agorot, as in
// 2.9, 3.9 and 3.12); the index path is a teaching assumption, never a forecast.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { type Track, trackRows } from "../lib/calc/metrics.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ amount?: number; rate?: number; years?: number; fee?: number; inflation?: number }>(), {
  amount: 600000,
  rate: 4.8,
  years: 20,
  fee: 360,
  inflation: 2,
});

const amount = ref(props.amount);
const rate = ref(props.rate);
const years = ref(props.years);
const fee = ref(props.fee);
const linked = ref(false);
const inflation = ref(props.inflation);
const showTable = ref(false);

const track = computed<Track>(() => ({
  principal: amount.value,
  rates: [String(rate.value)],
  months: years.value * 12,
  inflationPercent: linked.value ? String(inflation.value) : "0",
  rounding: "statement",
}));
const rows = computed(() => trackRows(track.value));
const sum = (f: (r: (typeof rows.value)[number]) => Decimal) => rows.value.reduce((s, r) => s.plus(f(r)), new Decimal(0));
const paid = computed(() => sum((r) => r.payment));
const interest = computed(() => sum((r) => r.interest));
const indexation = computed(() => sum((r) => r.indexation));
const everything = computed(() => paid.value.plus(fee.value));

const parts = computed(() =>
  [
    { key: "p", name: "הקרן חוזרת: סכום ההלוואה", value: new Decimal(amount.value), colour: "var(--mogi-n300)" },
    { key: "i", name: "ריבית", value: interest.value, colour: "var(--mogi-teal-deep)" },
    { key: "x", name: "הצמדה: מה שהמדד הוסיף לחוב", value: indexation.value, colour: "var(--mogi-turquoise-2)" },
    { key: "f", name: "עמלה חד־פעמית בהתחלה", value: new Decimal(fee.value), colour: "var(--mogi-navy)" },
  ].map((p) => ({ ...p, share: everything.value.isZero() ? new Decimal(0) : p.value.div(everything.value).mul(100) })),
);
const visible = computed(() => parts.value.filter((p) => p.value.gt(0)));
// A small share keeps two decimals (a 360 ₪ fee is 0.04%), so it can be read off the screen.
const shareText = (d: Decimal) => {
  if (d.isZero()) return "0%";
  const r = d.toDecimalPlaces(1);
  if (!r.isZero()) return `${r.toString()}%`;
  const r2 = d.toDecimalPlaces(2);
  return r2.isZero() ? "פחות מ־0.01%" : `${r2.toString()}%`;
};
// "Of every 100 ₪", in whole shekels that add up to exactly 100: round each part down,
// then give the shekels left to the parts with the largest remainders.
const per100 = computed(() => {
  const exact = parts.value.map((p) => p.share);
  const down = exact.map((d) => d.floor());
  let left = 100 - down.reduce((s, d) => s + d.toNumber(), 0);
  const order = exact.map((d, i) => ({ i, rem: d.minus(down[i]) })).sort((a, b) => b.rem.comparedTo(a.rem));
  const out = down.map((d) => d.toNumber());
  for (const o of order) {
    if (left <= 0) break;
    out[o.i] += 1;
    left -= 1;
  }
  return out;
});
const yearsWord = (n: number) => (n <= 10 ? "שנים" : "שנה");

const yearRows = computed(() =>
  Array.from({ length: years.value }, (_, k) => {
    const part = rows.value.slice(k * 12, (k + 1) * 12);
    const add = (f: (r: (typeof part)[number]) => Decimal) => part.reduce((s, r) => s.plus(f(r)), new Decimal(0));
    return { year: k + 1, paid: add((r) => r.payment), interest: add((r) => r.interest), indexation: add((r) => r.indexation), closing: part[part.length - 1].closing };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="grid gap-x-4 gap-y-1 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">סכום ההלוואה</span>
        <input v-model.number="amount" type="range" min="100000" max="2000000" step="10000" aria-label="סכום ההלוואה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(amount) }}</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">אחוז הריבית לשנה</span>
        <input v-model.number="rate" type="range" min="1" max="8" step="0.1" aria-label="אחוז הריבית לשנה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">תקופה</span>
        <input v-model.number="years" type="range" min="5" max="30" step="1" aria-label="תקופה בשנים" />
        <span class="text-body-l font-semibold text-n900">{{ years }} {{ yearsWord(years) }} (<span class="ltr">{{ years * 12 }}</span> תשלומים)</span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">עמלה חד־פעמית ביום שמקבלים את הכסף</span>
        <input v-model.number="fee" type="range" min="0" max="5000" step="10" aria-label="עמלה חד־פעמית בשקלים" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(fee) }}</span></span>
      </label>
    </div>

    <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="סוג המסלול">
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="!linked ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="!linked" @click="linked = false">לא צמוד</button>
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="linked ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="linked" @click="linked = true">צמוד למדד</button>
    </div>
    <label v-if="linked" class="mt-2 flex flex-col sm:max-w-sm">
      <span class="text-caption font-semibold text-n600">כמה המדד עולה בכל שנה — הנחה להמחשה, לא תחזית</span>
      <input v-model.number="inflation" type="range" min="0" max="5" step="0.5" aria-label="עליית המדד בכל שנה, באחוזים" />
      <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ inflation }}%</span> בשנה</span>
    </label>

    <div class="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">כל מה שתשלמו (תשלומים ועמלה)</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(everything) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">סך התשלומים החודשיים</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(paid) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">התשלום הראשון / האחרון</p>
        <p class="text-body-l font-semibold text-navy">
          <span class="ltr">{{ formatShekels(rows[0].payment) }}</span> / <span class="ltr">{{ formatShekels(rows[rows.length - 1].payment) }}</span>
        </p>
      </div>
    </div>

    <h3 class="mt-5 text-body-l font-semibold text-n900">לאן הולך הכסף</h3>
    <div class="mt-2 flex h-10 w-full overflow-hidden rounded-md border border-n200" role="img" :aria-label="`פס אחד שמחולק לפי חלקי הכסף: ${visible.map((p) => `${p.name} ${shareText(p.share)}`).join(', ')}`">
      <div v-for="p in visible" :key="p.key" class="h-full" :style="{ width: `${p.share.toNumber()}%`, minWidth: p.value.gt(0) ? '2px' : '0', background: p.colour }"></div>
    </div>
    <p class="mt-1 text-caption text-n600">הפס מתחיל מימין: קודם הקרן, אחריה הריבית, ההצמדה והעמלה.</p>
    <ul class="list-reset mt-3 grid gap-2" aria-label="החלקים">
      <li v-for="p in parts" :key="p.key" class="flex flex-wrap items-center justify-between gap-x-3 border-b border-n100 pb-1 text-body-m text-n800">
        <span class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: p.colour }" aria-hidden="true"></span>{{ p.name }}</span>
        <span><span class="ltr font-semibold text-n900">{{ formatShekels(p.value) }}</span> · <span class="ltr">{{ shareText(p.share) }}</span></span>
      </li>
    </ul>
    <p class="mt-2 text-body-m text-n800">
      מכל 100 ₪ שתשלמו: <span class="ltr font-semibold">{{ per100[0] }}</span> ₪ מחזירים את ההלוואה,
      <span class="ltr font-semibold">{{ per100[1] }}</span> ₪ הם ריבית<template v-if="linked">, <span class="ltr font-semibold">{{ per100[2] }}</span> ₪ הם מה שהמדד הוסיף</template><template v-if="per100[3] > 0">, <span class="ltr font-semibold">{{ per100[3] }}</span> ₪ הם העמלה</template>.
    </p>
    <p class="mt-1 text-caption text-n600">המספרים בשקלים כפי שישולמו, לפי הלוח: הריבית של כל חודש מעוגלת לאגורה, כמו בשיעורים 2.9 ו־3.12. ״מכל 100 ₪״ מעוגל לשקלים שלמים, כך שהחלקים מסתכמים ב־100.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה, שנה אחר שנה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-80 overflow-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">שנה</th>
            <th class="py-2 text-start font-semibold">שולם בשנה</th>
            <th class="py-2 text-start font-semibold">מזה ריבית</th>
            <th class="py-2 text-start font-semibold">המדד הוסיף לחוב</th>
            <th class="py-2 text-start font-semibold">יתרה בסוף השנה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in yearRows" :key="t.year" class="border-b border-n100">
            <td class="py-1">{{ t.year }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(t.paid) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(t.interest) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(t.indexation) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(t.closing) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
