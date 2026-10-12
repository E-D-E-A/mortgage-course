<script setup lang="ts">
// The regulation checker (בודק עמידה ברגולציה), first in lesson 4.4 and
// reused in 5.10 and 8.7. The learner sets a loan — the deal type, the value,
// the loan, the payment and the disposable income it is measured against, the
// part at a changing rate, the longest term — and sees the five lines of
// Directive 329 as the team transcribed them: four bans and one capital
// threshold. Each line shows the case's number, the line, and how much room is
// left (or how far over) in shekels or months. Every number comes from
// regulation.ts; the deal labels and the source note come from the page.
import { computed, ref, watch } from "vue";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { checkRegulation, type DealType, type LineResult, LTV_CEILINGS, passesAllLimits, RULES } from "../lib/calc/regulation.ts";

interface Deal {
  id: DealType;
  label: string;
}
const props = withDefaults(
  defineProps<{
    deals: Deal[];
    source: string;
    value?: number;
    loan?: number;
    payment?: number;
    income?: number;
    variable?: number;
    termYears?: number;
    /** What the page calls the 40% line. Lesson 4.4 says "קו ההון" (the term "סף הון" comes in 4.5); later lessons pass nothing. */
    capitalName?: string;
  }>(),
  { value: 1700000, loan: 1200000, payment: 7000, income: 16000, variable: 840000, termYears: 30, capitalName: "סף הון" },
);

const deal = ref<DealType>(props.deals[0].id);
const value = ref(props.value);
const loan = ref(props.loan);
const payment = ref(props.payment);
const income = ref(props.income);
const variable = ref(props.variable);
const years = ref(props.termYears);
const showTable = ref(false);

// Fixed scales, so a thumb stays put when another slider moves.
const MONEY_MAX = 4000000;
const STEP = 10000;
// The loan stays within the value and above zero; the variable part within the loan.
watch([value, loan], ([v, l]) => {
  if (l > v) loan.value = v;
  if (l < STEP) loan.value = STEP;
});
watch([loan, variable], ([l, x]) => {
  if (x > l) variable.value = l;
});
const safeLoan = computed(() => Math.max(STEP, Math.min(loan.value, value.value)));
const safeVariable = computed(() => Math.min(variable.value, safeLoan.value));

const lines = computed<LineResult[]>(() =>
  checkRegulation({
    deal: deal.value,
    value: value.value,
    loan: safeLoan.value,
    payment: payment.value,
    disposableIncome: income.value,
    variable: safeVariable.value,
    termMonths: years.value * 12,
  }),
);
const ok = computed(() => passesAllLimits(lines.value));
const crossed = computed(() => lines.value.filter((l) => l.status === "over"));
const aboveThreshold = computed(() => lines.value.some((l) => l.status === "above"));
const ruleOf = (l: LineResult) => {
  const r = RULES.find((x) => x.id === l.id)!;
  return l.id === "capital" ? { ...r, label: `יחס החזר — ${props.capitalName}` } : r;
};
const dealLabel = computed(() => props.deals.find((d) => d.id === deal.value)?.label ?? "");

const isTerm = (l: LineResult) => l.id === "term";
const fmtYears = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y} שנים` : `${y} שנים ו־${m} חודשים`;
};
function actualText(l: LineResult): string {
  return isTerm(l) ? fmtYears(l.actual.toNumber()) : `${percentString(l.actual)}%`;
}
function limitText(l: LineResult): string {
  if (isTerm(l)) return `עד ${fmtYears(l.limit.toNumber())}`;
  if (l.id === "variable") return "עד שני שלישים";
  if (l.id === "capital") return `קו: ${percentString(l.limit)}%`;
  return `עד ${percentString(l.limit)}%`;
}
const roomWhat: Record<string, [string, string]> = {
  ltv: ["אפשר ללוות עוד", "ההלוואה גדולה מהמותר ב־"],
  pti: ["ההחזר יכול לגדול עוד", "ההחזר גדול מהמותר ב־"],
  capital: ["עד הסף נשארו בהחזר", "ההחזר מעל הסף ב־"],
  variable: ["אפשר להעביר למשתנה עוד", "בריבית משתנה יש יותר מהמותר ב־"],
  term: ["עד הקו נשארו", "התקופה ארוכה מהמותר ב־"],
};
function roomText(l: LineResult): string {
  const [left, over] = roomWhat[l.id];
  const neg = l.room.isNeg();
  const amount = l.room.abs();
  const shown = isTerm(l) ? `${amount.toNumber()} חודשים` : formatShekelsText(amount);
  return `${neg ? over : left} ${shown}`;
}
const statusText = (l: LineResult) => (l.status === "over" ? "חוצה — אסור" : l.status === "above" ? "מעל הסף — מותר" : "בתוך הקו");
const statusClass = (l: LineResult) => (l.status === "over" ? "bg-danger-bg" : l.status === "above" ? "bg-warning-bg" : "bg-success-bg");

// The bar: the case's number against the line. The scale is a bit beyond the line, so both fit.
function scaleMax(l: LineResult): number {
  return Math.max(l.limit.toNumber() * 1.25, l.actual.toNumber() * 1.05);
}
const pos = (l: LineResult, x: number) => `${Math.min(100, (x / scaleMax(l)) * 100)}%`;
// A label sits beside its line; near the far edge it flips to the other side so it is never cut off.
const flips = (l: LineResult) => Math.min(100, (l.limit.toNumber() / scaleMax(l)) * 100) > 55;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה. {{ source }}</p>

    <fieldset class="mt-3">
      <legend class="text-caption font-semibold text-n600">סוג העסקה</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label
          v-for="d in deals"
          :key="d.id"
          class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="deal === d.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        >
          <input v-model="deal" type="radio" name="regulation-checker-deal" :value="d.id" class="accent-teal-deep" />
          <span>{{ d.label }} · תקרה <span class="ltr">{{ LTV_CEILINGS[d.id] }}%</span></span>
        </label>
      </div>
    </fieldset>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שווי הנכס</span>
        <input v-model.number="value" type="range" min="500000" :max="MONEY_MAX" :step="STEP" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(value) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההלוואה</span>
        <input v-model.number="loan" type="range" :min="STEP" :max="MONEY_MAX" :step="STEP" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(safeLoan) }}</span></span>
        <span class="text-caption text-n600">לא יותר משווי הנכס.</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההכנסה הפנויה (כמו בשיעור 4.2)</span>
        <input v-model.number="income" type="range" min="5000" max="50000" step="500" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(income) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההחזר החודשי שנכנס ליחס (כמו בשיעור 4.3)</span>
        <input v-model.number="payment" type="range" min="0" max="25000" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(payment) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">החלק בריבית שיכולה להשתנות</span>
        <input v-model.number="variable" type="range" min="0" :max="MONEY_MAX" :step="STEP" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(safeVariable) }}</span></span>
        <span class="text-caption text-n600">פריים, ומסלול שהריבית בו מתעדכנת (למשל כל 5 שנים). לא יותר מההלוואה.</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">התקופה של המסלול הארוך ביותר</span>
        <input v-model.number="years" type="range" min="5" max="35" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ years }} שנים</span>
      </label>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>המספר של התיק</li>
      <li class="flex items-center gap-2">
        <svg class="h-4 w-3" viewBox="0 0 12 16" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="16" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="3 2" /></svg>הקו
      </li>
    </ul>

    <ol class="list-reset mt-3 space-y-3">
      <li v-for="l in lines" :key="l.id" class="rounded-md border border-n200 p-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-body-m font-semibold text-n900">
            {{ ruleOf(l).label }}
            <span class="text-caption font-normal text-n600">· {{ l.kind === "capital_threshold" ? `${capitalName}, לא איסור` : "איסור" }}</span>
          </p>
          <span class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="statusClass(l)">{{ statusText(l) }}</span>
        </div>
        <div class="relative mt-6" role="img" :aria-label="`${ruleOf(l).label}: ${actualText(l)}, ${limitText(l)}.`">
          <div class="h-3 w-full overflow-hidden rounded-sm bg-n50">
            <div class="h-full" :style="{ width: pos(l, l.actual.toNumber()), background: 'var(--mogi-teal-deep)' }"></div>
          </div>
          <div class="absolute -top-5 bottom-0 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: pos(l, l.limit.toNumber()) }">
            <span class="absolute -top-0.5 whitespace-nowrap text-caption text-n700" :class="flips(l) ? 'end-1' : 'start-1'">{{ limitText(l) }}</span>
          </div>
        </div>
        <p class="mt-2 text-body-m text-n800">
          בתיק: <span class="ltr font-semibold">{{ actualText(l) }}</span>
          <span class="text-n600"> · {{ roomText(l) }}</span>
        </p>
      </li>
    </ol>

    <p class="mt-4 rounded-md p-3 text-body-m text-n800" :class="ok ? 'bg-n50' : 'bg-danger-bg'" role="status">
      <template v-if="ok">
        ההלוואה לא חוצה אף אחד מארבעת האיסורים<template v-if="aboveThreshold">. יחס ההחזר מעל {{ capitalName }}: זה מותר, אבל הבנק מחזיק יותר הון כנגד ההלוואה</template>.
      </template>
      <template v-else>
        ההלוואה חוצה {{ crossed.length === 1 ? "איסור אחד" : `${crossed.length} איסורים` }}: {{ crossed.map((l) => ruleOf(l).label).join(", ") }}. בנק לא יכול לאשר אותה כך.
      </template>
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">הקו</th>
            <th class="py-1 pe-3 text-start font-semibold">בתיק</th>
            <th class="py-1 pe-3 text-start font-semibold">הקו עצמו</th>
            <th class="py-1 pe-3 text-start font-semibold">מצב</th>
            <th class="py-1 text-start font-semibold">מרחק מהקו</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in lines" :key="l.id" class="border-b border-n100">
            <th class="py-1 pe-3 text-start font-normal text-n700">{{ ruleOf(l).label }}</th>
            <td class="py-1 pe-3"><span class="ltr">{{ actualText(l) }}</span></td>
            <td class="py-1 pe-3">{{ limitText(l) }}</td>
            <td class="py-1 pe-3">{{ statusText(l) }}</td>
            <td class="py-1"><span v-if="isTerm(l)">{{ l.room.toNumber() }} חודשים</span><span v-else class="ltr">{{ formatShekels(l.room) }}</span></td>
          </tr>
          <tr>
            <th class="py-1 pe-3 text-start font-normal text-n700">סוג העסקה</th>
            <td class="py-1" colspan="4">{{ dealLabel }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
