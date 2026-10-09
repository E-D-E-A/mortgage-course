<script setup lang="ts">
// Two (or three) ways to bring the same loan to zero, side by side.
//  - mode "methods" (lesson 2.9): Spitzer against equal principal — same loan,
//    same rate, same term.
//  - mode "grace" (lesson 2.10): no grace against partial and full grace, the
//    grace inside the term.
// For each way: the payment every month split into what repays the debt (grey)
// and the interest (the way's colour); the balance over time; the totals; a
// month the learner picks, read out exactly; and a year-by-year table.
// Every number comes from the course's calc module (src/lib/calc/repayment.ts).
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { type Method, monthlyRatePercent, type ScheduleRow, schedule, totalInterest, totalPaid } from "../lib/calc/repayment.ts";

const props = withDefaults(
  defineProps<{ mode?: "methods" | "grace"; principal?: number; rate?: number; years?: number; grace?: number }>(),
  { mode: "methods", principal: 600000, rate: 4.8, years: 20, grace: 12 },
);

const principal = ref(props.principal);
const rate = ref(props.rate);
const years = ref(props.years);
const grace = ref(props.grace);
const months = computed(() => years.value * 12);
const month = ref(1);
const showTable = ref(false);

interface Way {
  key: string;
  method: Method;
  name: string;
  colour: string;
  dashed: boolean;
}
const ways = computed<Way[]>(() =>
  props.mode === "methods"
    ? [
        { key: "s", method: "spitzer", name: "שפיצר", colour: "var(--mogi-teal-deep)", dashed: false },
        { key: "e", method: "equal_principal", name: "קרן שווה", colour: "var(--mogi-turquoise-2)", dashed: true },
      ]
    : [
        { key: "n", method: "spitzer", name: "בלי גרייס", colour: "var(--mogi-navy)", dashed: true },
        { key: "p", method: "grace_partial", name: "גרייס חלקי", colour: "var(--mogi-teal-deep)", dashed: false },
        { key: "f", method: "grace_full", name: "גרייס מלא", colour: "var(--mogi-turquoise-2)", dashed: false },
      ],
);
const tableWay = ref(props.mode === "methods" ? "s" : "p");

// The grace must leave at least a year of payments.
watch(years, () => {
  grace.value = Math.min(grace.value, months.value - 12);
});

const results = computed(() =>
  ways.value.map((w) => {
    const rows: ScheduleRow[] = schedule(w.method, {
      principal: principal.value,
      annualPercent: String(rate.value),
      months: months.value,
      graceMonths: grace.value,
    });
    return { way: w, rows, paid: totalPaid(rows), interest: totalInterest(rows) };
  }),
);
const monthly = computed(() => monthlyRatePercent(String(rate.value)).toDecimalPlaces(4).toString());

// What each payment does: the interest it pays, and what is left of it for the debt.
const interestPaid = (r: ScheduleRow) => Decimal.min(r.payment, r.interest);
const principalPaid = (r: ScheduleRow) => Decimal.max(0, r.payment.minus(r.interest));

// ── Charts. Time runs from the right (month 1) to the left, as Hebrew is read. ──
const W = 640;
const PAD = 6;
const xAt = (k: number) => W - PAD - (k / months.value) * (W - PAD * 2);
const PH = 150; // payment panels
const BH = 200; // balance chart
const payMax = computed(() => Math.max(...results.value.flatMap((r) => r.rows.slice(0, -1).map((x) => x.payment.toNumber())), 1) * 1.08);
const balMax = computed(() => Math.max(...results.value.flatMap((r) => r.rows.map((x) => x.opening.toNumber()))) * 1.05);
const yPay = (v: number) => PH - 2 - (v / payMax.value) * (PH - 8);
const yBal = (v: number) => BH - 2 - (v / balMax.value) * (BH - 10);

function bandPoints(rows: ScheduleRow[], lower: (r: ScheduleRow) => number, upper: (r: ScheduleRow) => number) {
  // A step shape: each month is flat across its own width. The last month (which may pay the whole
  // remaining debt, in no method here) is drawn like the others.
  const top: string[] = [];
  const bottom: string[] = [];
  rows.forEach((r, i) => {
    const a = xAt(i);
    const b = xAt(i + 1);
    const u = yPay(Math.min(upper(r), payMax.value));
    const l = yPay(Math.min(lower(r), payMax.value));
    top.push(`${a},${u} ${b},${u}`);
    bottom.unshift(`${b},${l} ${a},${l}`);
  });
  return [...top, ...bottom].join(" ");
}
const panels = computed(() =>
  results.value.map((res) => ({
    ...res,
    principalBand: bandPoints(res.rows, () => 0, (r) => principalPaid(r).toNumber()),
    interestBand: bandPoints(res.rows, (r) => principalPaid(r).toNumber(), (r) => r.payment.toNumber()),
  })),
);
const balanceLine = (rows: ScheduleRow[]) =>
  [`${xAt(0)},${yBal(rows[0].opening.toNumber())}`, ...rows.map((r, i) => `${xAt(i + 1)},${yBal(r.closing.toNumber())}`)].join(" ");
const markerX = computed(() => (xAt(month.value - 1) + xAt(month.value)) / 2);
const tickYears = computed(() => {
  const step = years.value <= 10 ? 1 : 5;
  return Array.from({ length: Math.floor(years.value / step) + 1 }, (_, i) => i * step);
});

// ── Totals and the gap the lesson asks about. ──
const first = (rows: ScheduleRow[]) => rows[0].payment;
const after = (rows: ScheduleRow[]) => rows[Math.min(grace.value, rows.length - 1)].payment;
const last = (rows: ScheduleRow[]) => rows[rows.length - 1].payment;
const base = computed(() => results.value[0]);
const gaps = computed(() => results.value.slice(1).map((r) => ({ name: r.way.name, paid: r.paid.minus(base.value.paid), interest: r.interest.minus(base.value.interest) })));

// ── The month the learner picks. ──
watch(months, (n) => {
  month.value = Math.min(month.value, n);
});
const picked = computed(() => results.value.map((r) => ({ way: r.way, row: r.rows[month.value - 1] })));

// ── Year-by-year table for one way. ──
const tableRows = computed(() => {
  const res = results.value.find((r) => r.way.key === tableWay.value) ?? results.value[0];
  return Array.from({ length: years.value }, (_, y) => {
    const slice = res.rows.slice(y * 12, y * 12 + 12);
    return {
      year: y + 1,
      firstPayment: slice[0].payment,
      paid: slice.reduce((s, r) => s.plus(r.payment), new Decimal(0)),
      interest: slice.reduce((s, r) => s.plus(r.interest), new Decimal(0)),
      closing: slice[slice.length - 1].closing,
    };
  });
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div class="grid gap-x-4 gap-y-1" :class="mode === 'grace' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">סכום ההלוואה</span>
        <input v-model.number="principal" type="range" min="100000" max="2000000" step="50000" aria-label="סכום ההלוואה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(principal) }}</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">אחוז הריבית לשנה</span>
        <input v-model.number="rate" type="range" min="1" max="8" step="0.1" aria-label="אחוז הריבית לשנה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span> <span class="text-body-m font-normal text-n600">(<span class="ltr">{{ monthly }}%</span> לחודש)</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">תקופה</span>
        <input v-model.number="years" type="range" min="5" max="30" step="1" aria-label="תקופה בשנים" />
        <span class="text-body-l font-semibold text-n900">{{ years }} שנים (<span class="ltr">{{ months }}</span> חודשים)</span>
      </label>
      <label v-if="mode === 'grace'" class="flex flex-col">
        <span class="text-caption font-semibold text-n600">חודשי גרייס, בתוך התקופה</span>
        <input v-model.number="grace" type="range" min="0" max="36" step="1" aria-label="חודשי גרייס" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ grace }}</span> חודשים</span>
      </label>
    </div>

    <!-- Totals, one card per way. -->
    <ul class="list-reset mt-4 grid gap-3" :class="mode === 'grace' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
      <li v-for="r in results" :key="r.way.key" class="rounded-md border border-n200 bg-n50 p-3">
        <p class="flex items-center gap-2 text-body-m font-semibold text-n900">
          <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: r.way.colour }" aria-hidden="true"></span>{{ r.way.name }}
        </p>
        <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
          <template v-if="mode === 'methods'">
            <dt>תשלום ראשון</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ formatShekels(first(r.rows)) }}</span></dd>
            <dt>תשלום אחרון</dt><dd class="text-end"><span class="ltr">{{ formatShekels(last(r.rows)) }}</span></dd>
          </template>
          <template v-else>
            <dt>תשלום בחודש הראשון</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ formatShekels(first(r.rows)) }}</span></dd>
            <dt>תשלום אחרי הגרייס</dt><dd class="text-end"><span class="ltr">{{ formatShekels(after(r.rows)) }}</span></dd>
          </template>
          <dt>שולם בסך הכול</dt><dd class="text-end"><span class="ltr">{{ formatShekels(r.paid) }}</span></dd>
          <dt>מזה ריבית</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ formatShekels(r.interest) }}</span></dd>
        </dl>
      </li>
    </ul>
    <p v-for="g in gaps" :key="g.name" class="mt-2 text-body-m text-n800">
      {{ g.name }} מול {{ base.way.name }}: <span class="ltr font-semibold text-n900">{{ formatShekels(g.interest) }}</span>
      {{ g.interest.gte(0) ? "יותר ריבית" : "פחות ריבית" }}.
    </p>

    <!-- The payment every month: what repays the debt, and the interest. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">התשלום בכל חודש, ומה יש בו</h3>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)" aria-hidden="true"></span>החלק שמחזיר את ההלוואה (קרן)</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)" aria-hidden="true"></span>ריבית (בצבע של כל דרך)</li>
    </ul>
    <div class="mt-2 grid gap-3" :class="mode === 'grace' ? 'lg:grid-cols-3' : 'sm:grid-cols-2'">
      <figure v-for="p in panels" :key="p.way.key" class="m-0">
        <figcaption class="text-caption font-semibold text-n700">{{ p.way.name }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${PH}`" class="mt-1 w-full" role="img" :aria-label="`${p.way.name}: התשלום בכל חודש, מחולק לקרן ולריבית. הנתונים בטבלה למטה.`">
          <line :x1="PAD" :x2="W - PAD" :y1="yPay(0)" :y2="yPay(0)" stroke="var(--mogi-n300)" stroke-width="1" />
          <polygon :points="p.principalBand" fill="var(--mogi-n300)" />
          <polygon :points="p.interestBand" :fill="p.way.colour" />
          <line :x1="markerX" :x2="markerX" :y1="0" :y2="PH" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="4 3" />
        </svg>
      </figure>
    </div>
    <p class="mt-1 text-caption text-n600">גובה מלא: <span class="ltr">{{ formatWholeShekels(payMax) }}</span> בחודש, באותו קנה מידה בכל הגרפים. החודשים רצים מימין לשמאל.</p>

    <!-- The balance over time: the paths to zero. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">היתרה לאורך הזמן</h3>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li v-for="r in results" :key="r.way.key" class="flex items-center gap-2">
        <svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" :stroke="r.way.colour" stroke-width="3" :stroke-dasharray="r.way.dashed ? '5 3' : undefined" /></svg>{{ r.way.name }}
      </li>
    </ul>
    <div class="relative mt-2">
      <svg :viewBox="`0 0 ${W} ${BH}`" class="w-full" role="img" aria-label="היתרה בסוף כל חודש, לכל דרך. הנתונים בטבלה למטה.">
        <line :x1="PAD" :x2="W - PAD" :y1="yBal(0)" :y2="yBal(0)" stroke="var(--mogi-n300)" stroke-width="1" />
        <line :x1="PAD" :x2="W - PAD" :y1="yBal(principal)" :y2="yBal(principal)" stroke="var(--mogi-n200)" stroke-width="1" />
        <polyline
          v-for="r in results"
          :key="r.way.key"
          :points="balanceLine(r.rows)"
          fill="none"
          :stroke="r.way.colour"
          stroke-width="3"
          :stroke-dasharray="r.way.dashed ? '8 5' : undefined"
          stroke-linejoin="round"
        />
        <line :x1="markerX" :x2="markerX" :y1="0" :y2="BH" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="4 3" />
      </svg>
      <span class="pointer-events-none absolute start-1 text-caption text-n600" :style="{ top: `${(yBal(principal) / BH) * 100 - 9}%` }">
        <span class="ltr">{{ formatWholeShekels(principal) }}</span>
      </span>
    </div>
    <div class="relative h-5 text-caption text-n600" aria-hidden="true">
      <span v-for="t in tickYears" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(xAt(t * 12) / W) * 100}%` }">{{ t }}</span>
    </div>
    <p class="text-center text-caption text-n600">שנים, מימין לשמאל</p>

    <!-- One month, read out exactly. -->
    <label class="mt-4 flex flex-col">
      <span class="text-caption font-semibold text-n600">בחרו חודש (הקו המקווקו בגרפים)</span>
      <input v-model.number="month" type="range" min="1" :max="months" step="1" aria-label="חודש" />
      <span class="text-body-l font-semibold text-n900">חודש <span class="ltr">{{ month }}</span> מתוך <span class="ltr">{{ months }}</span></span>
    </label>
    <ul class="list-reset mt-2 grid gap-3" :class="mode === 'grace' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'" aria-live="polite">
      <li v-for="p in picked" :key="p.way.key" class="rounded-md border border-n200 p-3">
        <p class="flex items-center gap-2 text-body-m font-semibold text-n900">
          <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: p.way.colour }" aria-hidden="true"></span>{{ p.way.name }}, חודש {{ month }}
        </p>
        <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
          <dt>יתרה בתחילת החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(p.row.opening) }}</span></dd>
          <dt>ריבית החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(p.row.interest) }}</span></dd>
          <dt>התשלום</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ formatShekels(p.row.payment) }}</span></dd>
          <dt>{{ p.row.principal.lt(0) ? "נוסף לחוב" : "מזה קרן" }}</dt><dd class="text-end"><span class="ltr">{{ formatShekels(p.row.principal.abs()) }}</span></dd>
          <dt>יתרה בסוף החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(p.row.closing) }}</span></dd>
        </dl>
      </li>
    </ul>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2">
      <div class="flex flex-wrap gap-2" role="group" aria-label="הטבלה של">
        <button
          v-for="w in ways"
          :key="w.key"
          type="button"
          class="min-h-11 rounded-md border px-3 text-body-m"
          :class="tableWay === w.key ? 'border-navy bg-n100 font-semibold text-navy' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="tableWay === w.key"
          @click="tableWay = w.key"
        >
          {{ w.name }}
        </button>
      </div>
      <div class="mt-2 max-h-80 overflow-auto">
        <table class="w-full min-w-[30rem] border-collapse text-body-m">
          <thead class="sticky top-0 bg-n0">
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-2 text-start font-semibold">שנה</th>
              <th class="py-2 text-start font-semibold">התשלום בחודש הראשון בשנה</th>
              <th class="py-2 text-start font-semibold">שולם בשנה</th>
              <th class="py-2 text-start font-semibold">מזה ריבית</th>
              <th class="py-2 text-start font-semibold">יתרה בסוף השנה</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tableRows" :key="t.year" class="border-b border-n100">
              <td class="py-1">{{ t.year }}</td>
              <td class="py-1"><span class="ltr">{{ formatShekels(t.firstPayment) }}</span></td>
              <td class="py-1"><span class="ltr">{{ formatShekels(t.paid) }}</span></td>
              <td class="py-1"><span class="ltr">{{ formatShekels(t.interest) }}</span></td>
              <td class="py-1"><span class="ltr">{{ formatShekels(t.closing) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
