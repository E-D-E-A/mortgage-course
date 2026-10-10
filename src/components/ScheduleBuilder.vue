<script setup lang="ts">
// בונה לוח סילוקין — the course's schedule builder (lesson 3.2; with a method
// picker in 3.4; reused in 3.3 and later). The learner types an amount, an
// annual rate and a number of months (and, in 3.4, a repayment method and grace
// months); the builder shows the whole schedule month by month — opening
// balance, interest part, principal part, payment, closing balance — with the
// totals, two charts, and a box that checks one row of the learner's own table.
// Statement convention throughout: each month's interest rounded to the agora,
// the last month clearing what is left. Every number comes from
// src/lib/calc/repayment.ts (which builds on amortization.ts).
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { type Method, monthlyRate, type ScheduleRow, schedule, totalInterest, totalPaid } from "../lib/calc/repayment.ts";
import { parseAnswer } from "../lib/progress.ts";

const props = withDefaults(
  defineProps<{
    /** Starting values; the learner changes them. */
    principal?: number;
    rate?: number;
    months?: number;
    /** The methods to offer. One method: no picker (lesson 3.2). */
    methods?: Method[];
    method?: Method;
    grace?: number;
    /** The box that checks one row of the learner's own table. */
    rowCheck?: boolean;
  }>(),
  { principal: 600000, rate: 4.8, months: 240, methods: () => ["spitzer"], method: undefined, grace: 12, rowCheck: true },
);

const NAMES: Record<Method, string> = {
  spitzer: "שפיצר",
  equal_principal: "קרן שווה",
  grace_partial: "גרייס חלקי, ואז שפיצר",
  grace_full: "גרייס מלא, ואז שפיצר",
  bullet_partial: "בוליט חלקי",
  bullet_full: "בוליט מלא",
};
const method = ref<Method>(props.method ?? props.methods[0]);
const isGrace = computed(() => method.value === "grace_partial" || method.value === "grace_full");
const isBullet = computed(() => method.value === "bullet_partial" || method.value === "bullet_full");

// ── Inputs: typed text, checked; the schedule keeps the last valid values. ──
interface Field {
  text: string;
  value: number;
  error: string;
}
const field = (v: number): Field => ({ text: String(v), value: v, error: "" });
const fPrincipal = ref(field(props.principal));
const fRate = ref(field(props.rate));
const fMonths = ref(field(props.months));
const fGrace = ref(field(props.grace));

function read(f: Field, min: number, max: number, whole: boolean, what: string) {
  const v = parseAnswer(f.text);
  if (v === null) f.error = `כתבו ${what} במספרים.`;
  else if (whole && !Number.isInteger(v)) f.error = `${what}: מספר שלם.`;
  else if (v < min || v > max) f.error = `${what}: בין ${new Intl.NumberFormat("he-IL").format(min)} ל־${new Intl.NumberFormat("he-IL").format(max)}.`;
  else {
    f.error = "";
    f.value = v;
  }
}
const readPrincipal = () => read(fPrincipal.value, 1000, 10000000, false, "סכום ההלוואה");
const readRate = () => read(fRate.value, 0, 20, false, "אחוז הריבית לשנה");
const readMonths = () => {
  read(fMonths.value, 1, 480, true, "מספר החודשים");
  clampGrace();
};
const readGrace = () => {
  read(fGrace.value, 0, Math.max(0, fMonths.value.value - 1), true, "חודשי הגרייס");
};
function clampGrace() {
  const max = Math.max(0, fMonths.value.value - 1);
  if (fGrace.value.value > max) fGrace.value = field(max);
}

const loan = computed(() => ({
  principal: new Decimal(fPrincipal.value.value).toFixed(2),
  annualPercent: String(fRate.value.value),
  months: fMonths.value.value,
  graceMonths: isGrace.value ? fGrace.value.value : 0,
}));
const rows = computed<ScheduleRow[]>(() => schedule(isGrace.value && loan.value.graceMonths === 0 ? "spitzer" : method.value, loan.value));
const monthly = computed(() => monthlyRate(String(fRate.value.value)).toDecimalPlaces(4).toString());
const n = computed(() => rows.value.length);
const termText = computed(() => {
  const m = fMonths.value.value;
  const y = Math.floor(m / 12);
  const r = m % 12;
  const years = y === 1 ? "שנה" : `${y} שנים`;
  if (y === 0) return m === 1 ? "חודש אחד" : `${m} חודשים`;
  if (r === 0) return years;
  return `${years} ו־${r === 1 ? "חודש" : `${r} חודשים`}`;
});

// ── Totals. ──
const paid = computed(() => totalPaid(rows.value));
const interest = computed(() => totalInterest(rows.value));
const first = computed(() => rows.value[0]);
const lastRow = computed(() => rows.value[n.value - 1]);
const afterGrace = computed(() => rows.value[Math.min(loan.value.graceMonths, n.value - 1)]);

// ── Charts. Month 1 at the right; time runs leftward, as Hebrew is read. ──
const W = 640;
const PAD = 6;
const PH = 150;
const BH = 170;
const xAt = (k: number) => W - PAD - (k / n.value) * (W - 2 * PAD);
const interestPaid = (r: ScheduleRow) => Decimal.min(r.payment, r.interest).toNumber();
const principalPaid = (r: ScheduleRow) => Decimal.max(0, r.payment.minus(r.interest)).toNumber();
// A bullet's last payment carries the whole principal; it stays out of the scale and is named in text.
const scaleRows = computed(() => (isBullet.value && n.value > 1 ? rows.value.slice(0, -1) : rows.value));
const noPayments = computed(() => scaleRows.value.every((r) => r.payment.isZero()));
const payMax = computed(() => Math.max(1, ...scaleRows.value.map((r) => r.payment.toNumber())) * 1.08);
const yPay = (v: number) => PH - 2 - (Math.min(v, payMax.value) / payMax.value) * (PH - 8);
function band(lower: (r: ScheduleRow) => number, upper: (r: ScheduleRow) => number) {
  const top: string[] = [];
  const bottom: string[] = [];
  scaleRows.value.forEach((r, i) => {
    const a = xAt(i);
    const b = xAt(i + 1);
    top.push(`${a},${yPay(upper(r))} ${b},${yPay(upper(r))}`);
    bottom.unshift(`${b},${yPay(lower(r))} ${a},${yPay(lower(r))}`);
  });
  return [...top, ...bottom].join(" ");
}
const principalBand = computed(() => band(() => 0, principalPaid));
const interestBand = computed(() => band(principalPaid, (r) => principalPaid(r) + interestPaid(r)));
const balMax = computed(() => Math.max(...rows.value.map((r) => r.opening.toNumber())) * 1.1);
const yBal = (v: number) => BH - 2 - (v / balMax.value) * (BH - 8);
const balanceLine = computed(() =>
  [`${xAt(0)},${yBal(rows.value[0].opening.toNumber())}`, ...rows.value.map((r, i) => `${xAt(i + 1)},${yBal(r.closing.toNumber())}`)].join(" "),
);

// ── The table, a year (12 months) at a time. ──
const pages = computed(() => Math.ceil(n.value / 12));
const page = ref(1);
watch(pages, (p) => {
  if (page.value > p) page.value = p;
});
const pageRows = computed(() => rows.value.slice((page.value - 1) * 12, page.value * 12));
const anyNegative = computed(() => rows.value.some((r) => r.principal.lt(0)));

// ── Check one row of the learner's own table. ──
type Col = "opening" | "interest" | "principal" | "payment" | "closing";
const COLS: { key: Col; label: string }[] = [
  { key: "closing", label: "יתרה בסוף החודש" },
  { key: "interest", label: "רכיב ריבית" },
  { key: "principal", label: "רכיב קרן" },
  { key: "payment", label: "התשלום" },
  { key: "opening", label: "יתרה בתחילת החודש" },
];
const checkMonth = ref("1");
const checkCol = ref<Col>("closing");
const checkValue = ref("");
const verdict = ref<{ tone: "ok" | "near" | "off" | "bad"; text: string } | null>(null);
function checkRow() {
  const k = parseAnswer(checkMonth.value);
  const v = parseAnswer(checkValue.value.replace("−", "-"));
  if (k === null || !Number.isInteger(k) || k < 1 || k > n.value) {
    verdict.value = { tone: "bad", text: `מספר החודש: מ־1 עד ${n.value}.` };
    return;
  }
  if (v === null) {
    verdict.value = { tone: "bad", text: "כתבו את הסכום מהלוח שלכם, במספרים." };
    return;
  }
  const right = rows.value[k - 1][checkCol.value];
  const gap = new Decimal(v).minus(right).abs();
  const name = COLS.find((c) => c.key === checkCol.value)?.label ?? "";
  if (gap.lte(0.02)) verdict.value = { tone: "ok", text: `תואם. בבונה, בחודש ${k}, ${name}: ${formatShekels(right)}.` };
  else if (gap.lte(5)) verdict.value = { tone: "near", text: `קרוב: ${formatShekels(right)} בבונה, הפרש של ${formatShekels(gap)}. הפרש של אגורות או שקלים בודדים בא בדרך כלל מעיגול: בבונה הריבית של כל חודש מעוגלת לאגורה, וגם התשלום.` };
  else verdict.value = { tone: "off", text: `לא תואם: בבונה ${formatShekels(right)}, הפרש של ${formatShekels(gap)}. בדקו את החודש הקודם, ואת הריבית החודשית (אחוז לשנה חלקי 12).` };
}
watch([loan, method], () => {
  verdict.value = null;
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <!-- The method (lesson 3.4). -->
    <fieldset v-if="methods.length > 1" class="mb-4">
      <legend class="text-caption font-semibold text-n600">שיטת ההחזר</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <button
          v-for="m in methods"
          :key="m"
          type="button"
          class="min-h-11 rounded-md border px-3 text-body-m"
          :class="method === m ? 'border-navy bg-n100 font-semibold text-navy' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="method === m"
          @click="method = m"
        >
          {{ NAMES[m] }}
        </button>
      </div>
    </fieldset>

    <!-- The loan. -->
    <div class="grid gap-3 sm:grid-cols-3" :class="isGrace ? 'lg:grid-cols-4' : ''">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">סכום ההלוואה (₪)</span>
        <input v-model="fPrincipal.text" inputmode="decimal" autocomplete="off" dir="ltr" class="h-11 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @change="readPrincipal" @keydown.enter.prevent="readPrincipal" />
        <span v-if="fPrincipal.error" class="text-caption text-n700" role="alert">{{ fPrincipal.error }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">אחוז הריבית לשנה</span>
        <input v-model="fRate.text" inputmode="decimal" autocomplete="off" dir="ltr" class="h-11 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @change="readRate" @keydown.enter.prevent="readRate" />
        <span class="text-caption text-n600"><span class="ltr">{{ monthly }}%</span> לחודש (חלקי 12)</span>
        <span v-if="fRate.error" class="text-caption text-n700" role="alert">{{ fRate.error }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר החודשים</span>
        <input v-model="fMonths.text" inputmode="numeric" autocomplete="off" dir="ltr" class="h-11 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @change="readMonths" @keydown.enter.prevent="readMonths" />
        <span class="text-caption text-n600">{{ termText }}</span>
        <span v-if="fMonths.error" class="text-caption text-n700" role="alert">{{ fMonths.error }}</span>
      </label>
      <label v-if="isGrace" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">חודשי גרייס, בתוך התקופה</span>
        <input v-model="fGrace.text" inputmode="numeric" autocomplete="off" dir="ltr" class="h-11 rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" @change="readGrace" @keydown.enter.prevent="readGrace" />
        <span v-if="fGrace.error" class="text-caption text-n700" role="alert">{{ fGrace.error }}</span>
      </label>
    </div>

    <!-- Totals. -->
    <dl class="mt-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-md bg-n50 p-3 text-body-m text-n700 sm:grid-cols-[auto_1fr_auto_1fr]" aria-live="polite">
      <dt>התשלום בחודש הראשון</dt><dd class="text-end sm:text-start"><span class="ltr font-semibold text-n900">{{ formatShekels(first.payment) }}</span></dd>
      <template v-if="isGrace && loan.graceMonths > 0">
        <dt>התשלום אחרי הגרייס (חודש {{ loan.graceMonths + 1 }})</dt><dd class="text-end sm:text-start"><span class="ltr font-semibold text-n900">{{ formatShekels(afterGrace.payment) }}</span></dd>
      </template>
      <dt>התשלום בחודש האחרון</dt><dd class="text-end sm:text-start"><span class="ltr">{{ formatShekels(lastRow.payment) }}</span></dd>
      <dt>שולם בסך הכול</dt><dd class="text-end sm:text-start"><span class="ltr">{{ formatShekels(paid) }}</span></dd>
      <dt>מזה ריבית</dt><dd class="text-end sm:text-start"><span class="ltr font-semibold text-n900">{{ formatShekels(interest) }}</span></dd>
      <dt>מזה קרן</dt><dd class="text-end sm:text-start"><span class="ltr">{{ formatShekels(paid.minus(interest)) }}</span></dd>
    </dl>

    <!-- The payment every month, split into its two parts. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">התשלום בכל חודש, ומה יש בו</h3>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-n300)" aria-hidden="true"></span>רכיב קרן: מקטין את החוב</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)" aria-hidden="true"></span>רכיב ריבית</li>
    </ul>
    <svg :viewBox="`0 0 ${W} ${PH}`" class="mt-2 w-full" role="img" aria-label="התשלום בכל חודש, מחולק לרכיב קרן ולרכיב ריבית. המספרים בטבלה למטה.">
      <line :x1="PAD" :x2="W - PAD" :y1="yPay(0)" :y2="yPay(0)" stroke="var(--mogi-n300)" stroke-width="1" />
      <polygon :points="principalBand" fill="var(--mogi-n300)" />
      <polygon :points="interestBand" fill="var(--mogi-teal-deep)" />
    </svg>
    <p class="mt-1 text-caption text-n600">
      <template v-if="noPayments">עד החודש האחרון אין תשלומים, ולכן הגרף ריק.</template>
      <template v-else>גובה מלא: <span class="ltr">{{ formatWholeShekels(payMax) }}</span> בחודש.</template>
      החודשים רצים מימין לשמאל.
      <template v-if="isBullet">התשלום בחודש האחרון, <span class="ltr">{{ formatShekels(lastRow.payment) }}</span>, גבוה מדי לגרף, ולכן הוא לא מצויר.</template>
    </p>

    <h3 class="mt-5 text-body-l font-semibold text-n900">היתרה לאורך הזמן</h3>
    <svg :viewBox="`0 0 ${W} ${BH}`" class="mt-2 w-full" role="img" aria-label="היתרה בסוף כל חודש. המספרים בטבלה למטה.">
      <line :x1="PAD" :x2="W - PAD" :y1="yBal(0)" :y2="yBal(0)" stroke="var(--mogi-n300)" stroke-width="1" />
      <line :x1="PAD" :x2="W - PAD" :y1="yBal(fPrincipal.value)" :y2="yBal(fPrincipal.value)" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="6 4" />
      <polyline :points="balanceLine" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-teal-deep)" stroke-width="3" /></svg>היתרה בסוף החודש</li>
      <li class="flex items-center gap-2"><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="5 3" /></svg>סכום ההלוואה, <span class="ltr">{{ formatWholeShekels(fPrincipal.value) }}</span></li>
    </ul>

    <!-- The schedule itself. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">לוח הסילוקין, חודש אחר חודש</h3>
    <div v-if="pages > 1" class="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" class="min-h-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50 disabled:opacity-50" :disabled="page === 1" @click="page--">שנה קודמת</button>
      <label class="flex items-center gap-2 text-body-m text-n700">
        <span>שנה</span>
        <select v-model.number="page" class="h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900" aria-label="איזו שנה בטבלה">
          <option v-for="p in pages" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <button type="button" class="min-h-11 rounded-md border border-n200 px-3 text-body-m text-n800 hover:bg-n50 disabled:opacity-50" :disabled="page === pages" @click="page++">שנה הבאה</button>
      <span class="text-caption text-n600">חודשים <span class="ltr">{{ (page - 1) * 12 + 1 }}–{{ Math.min(page * 12, n) }}</span></span>
    </div>
    <table class="mt-2 hidden w-full border-collapse text-body-m lg:table">
      <thead>
        <tr class="border-b border-n200 text-caption text-n600">
          <th class="py-2 pe-2 text-start font-semibold">חודש</th>
          <th class="py-2 pe-2 text-start font-semibold">יתרה בתחילת החודש</th>
          <th class="py-2 pe-2 text-start font-semibold">רכיב ריבית</th>
          <th class="py-2 pe-2 text-start font-semibold">רכיב קרן</th>
          <th class="py-2 pe-2 text-start font-semibold">התשלום</th>
          <th class="py-2 text-start font-semibold">יתרה בסוף החודש</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in pageRows" :key="r.period" class="border-b border-n100">
          <td class="py-1.5 pe-2 text-n700">{{ r.period }}</td>
          <td class="py-1.5 pe-2"><span class="ltr">{{ formatShekels(r.opening) }}</span></td>
          <td class="py-1.5 pe-2"><span class="ltr">{{ formatShekels(r.interest) }}</span></td>
          <td class="py-1.5 pe-2"><span class="ltr">{{ formatShekels(r.principal) }}</span></td>
          <td class="py-1.5 pe-2 font-semibold text-n900"><span class="ltr">{{ formatShekels(r.payment) }}</span></td>
          <td class="py-1.5"><span class="ltr">{{ formatShekels(r.closing) }}</span></td>
        </tr>
      </tbody>
    </table>
    <ul class="list-reset mt-2 grid gap-2 sm:grid-cols-2 lg:hidden">
      <li v-for="r in pageRows" :key="r.period" class="rounded-md border border-n200 p-3">
        <p class="text-body-m font-semibold text-n900">חודש {{ r.period }}</p>
        <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
          <dt>יתרה בתחילת החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(r.opening) }}</span></dd>
          <dt>רכיב ריבית</dt><dd class="text-end"><span class="ltr">{{ formatShekels(r.interest) }}</span></dd>
          <dt>רכיב קרן</dt><dd class="text-end"><span class="ltr">{{ formatShekels(r.principal) }}</span></dd>
          <dt class="font-semibold text-n900">התשלום</dt><dd class="text-end font-semibold text-n900"><span class="ltr">{{ formatShekels(r.payment) }}</span></dd>
          <dt>יתרה בסוף החודש</dt><dd class="text-end"><span class="ltr">{{ formatShekels(r.closing) }}</span></dd>
        </dl>
      </li>
    </ul>
    <p v-if="anyNegative" class="mt-2 text-caption text-n700">רכיב קרן שלילי: באותו חודש לא שולמה הריבית, והיא נוספה לחוב.</p>
    <p class="mt-2 text-caption text-n600">הריבית של כל חודש מעוגלת לאגורה, והתשלום האחרון סוגר את מה שהעיגול השאיר.</p>

    <!-- Check a row of your own table. -->
    <form v-if="rowCheck" class="mt-5 rounded-md border border-n200 p-3" @submit.prevent="checkRow">
      <p class="text-body-m font-semibold text-n900">בדקו שורה מהלוח שלכם</p>
      <div class="mt-2 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
        <label class="flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">חודש</span>
          <input v-model="checkMonth" inputmode="numeric" autocomplete="off" dir="ltr" class="h-11 w-full rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input sm:w-20" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">מה בדקתם</span>
          <select v-model="checkCol" aria-label="מה בדקתם" class="h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900">
            <option v-for="c in COLS" :key="c.key" :value="c.key">{{ c.label }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">הסכום אצלכם (₪)</span>
          <input v-model="checkValue" inputmode="decimal" autocomplete="off" dir="ltr" class="h-11 w-full rounded-md border border-n200 bg-n0 px-3 text-body-l text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input" />
        </label>
        <button type="submit" class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0">בדיקה</button>
      </div>
      <div aria-live="polite">
        <p
          v-if="verdict"
          class="mt-3 rounded-md p-3 text-body-m text-n800"
          :class="verdict.tone === 'ok' ? 'bg-success-bg' : verdict.tone === 'bad' ? 'bg-n50' : 'bg-warning-bg'"
        >
          {{ verdict.text }}
        </p>
      </div>
    </form>
  </div>
</template>
