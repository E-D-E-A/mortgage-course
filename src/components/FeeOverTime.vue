<script setup lang="ts">
// Lesson 7.3: the fee over time. One loan, one repayment date that the learner moves along an axis, and the total
// early-repayment fee on each date, with the published averages held still (a teaching assumption: the real ones
// move every month). Two loans: case C's fixed loan, where the fee falls slowly and steps down at the five-year
// mark (the reduction for time served), and an invented variable track, where the fee falls to the operational
// fee on the reset day (the exit point). The details panel shows the fee's parts and the notice window of the
// chosen date. Every number comes from earlyrepay.ts. Time runs from right to left, as Hebrew is read.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import {
  NOTICE_MAX_DAYS,
  NOTICE_MIN_DAYS,
  WORKED_EXAMPLE,
  addDays,
  addMonths,
  earlyRepaymentFee,
  effective,
  nextReset,
  nominal,
  type FeeInput,
  type FeeResult,
  type ISODate,
} from "../lib/calc/earlyrepay.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

type Kind = "fixed" | "variable";
const kind = ref<Kind>("fixed");
const noticeDays = ref(30);
const showTable = ref(false);

const fixedLoan = WORKED_EXAMPLE.loan;
const variableLoan: FeeInput["loan"] = { principal: "400000", contract: nominal("4.5"), termMonths: 300, grantedOn: "2022-03-15", kind: "variable", resetEveryMonths: 60, linkage: "unlinked" };
const defaults = { fixed: { a: 4.823049, c: 5.09 }, variable: { a: 3.6, c: 4.1 } };
const avgToday = ref(defaults.fixed.a);
const avgGrant = ref(defaults.fixed.c);

function pick(k: Kind) {
  kind.value = k;
  avgToday.value = defaults[k].a;
  avgGrant.value = defaults[k].c;
  index.value = k === "fixed" ? 0 : 20;
}

// The dates on the axis. Fixed: the 2nd of each month for twelve years, from the day of the team's example.
// Variable: the 16th of each month from March 2024 until the reset (the 16th is a day after the loan's anniversaries,
// whose exact reading is open), and the reset day itself, 15.3.2027, as the last point: the rate changes there,
// so the model stops.
const dates = computed<ISODate[]>(() => {
  if (kind.value === "fixed") return Array.from({ length: 145 }, (_, i) => addMonths("2026-08-02", i));
  const months = Array.from({ length: 36 }, (_, i) => addMonths("2024-03-16", i));
  return [...months, "2027-03-15"];
});
const index = ref(0);
const loan = computed(() => (kind.value === "fixed" ? fixedLoan : variableLoan));

const series = computed<{ date: ISODate; r: FeeResult }[]>(() =>
  dates.value.map((date) => ({
    date,
    r: earlyRepaymentFee({
      loan: loan.value,
      repaidOn: date,
      averageToday: effective(String(avgToday.value)),
      averageAtGrant: effective(String(avgGrant.value)),
      noticeGivenOn: noticeDays.value > 0 ? addDays(date, -noticeDays.value) : null,
    }),
  })),
);
const at = computed(() => series.value[Math.min(index.value, series.value.length - 1)]);
const maxFee = computed(() => Decimal.max(...series.value.map((s) => s.r.total), 100));
const niceMax = computed(() => {
  const m = maxFee.value.toNumber();
  const step = m > 8000 ? 2000 : m > 3000 ? 1000 : m > 1200 ? 500 : 200;
  return Math.ceil(m / step) * step;
});
const ticks = computed(() => {
  const top = niceMax.value;
  return [0, 1, 2, 3, 4].map((i) => (top * i) / 4);
});

// Chart geometry (viewBox units). Time runs leftward: the first date is at the right edge.
const W = 640;
const H = 260;
const PAD = { top: 14, bottom: 6, side: 10 };
const xOf = (i: number) => W - PAD.side - (i / Math.max(1, series.value.length - 1)) * (W - PAD.side * 2);
const yOf = (v: number) => H - PAD.bottom - (v / niceMax.value) * (H - PAD.top - PAD.bottom);
const line = computed(() => series.value.map((s, i) => `${xOf(i).toFixed(1)},${yOf(s.r.total.toNumber()).toFixed(1)}`).join(" "));
// Where the reduction for time served steps up, and the exit point.
const steps = computed(() =>
  series.value
    .map((s, i) => ({ i, red: s.r.reduction.percent, prev: i > 0 ? series.value[i - 1].r.reduction.percent : s.r.reduction.percent }))
    .filter((x) => x.i > 0 && x.red !== x.prev),
);
const exitIndex = computed(() => series.value.findIndex((s) => s.r.status === "exit_point"));

const longDate = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
const fmtDate = (d: ISODate) => longDate.format(new Date(`${d}T12:00:00Z`));
const shortDate = new Intl.DateTimeFormat("he-IL", { month: "numeric", year: "2-digit" });
const fmtShort = (d: ISODate) => shortDate.format(new Date(`${d}T12:00:00Z`));
const axisLabels = computed(() => {
  const n = series.value.length;
  const picks = kind.value === "fixed" ? [0, 36, 72, 108, 144] : [0, 12, 24, 36];
  return picks.filter((i) => i < n).map((i) => ({ i, text: fmtShort(series.value[i].date) }));
});

const reset = computed(() => (kind.value === "variable" ? nextReset(variableLoan.grantedOn, 60, at.value.date) : null));
const windowFrom = computed(() => addDays(at.value.date, -NOTICE_MAX_DAYS));
const windowTo = computed(() => addDays(at.value.date, -NOTICE_MIN_DAYS));
const status = computed(() => {
  const r = at.value.r;
  if (r.status === "exit_point") return "יום העדכון של הריבית: תחנת יציאה. נגבית העמלה התפעולית בלבד.";
  if (r.discounting && r.lower && r.lower.lt(0)) return "הנוסחה השנייה שלילית: מקזזים אותה, והסך הכול לא יורד מתחת לאפס (קריאה שלנו).";
  return "";
});
const parts = computed(() => {
  const r = at.value.r;
  return [
    { label: "עמלת היוון אחרי ההפחתה", value: formatShekels(r.discount) },
    { label: "עמלה תפעולית", value: formatShekels(r.operational) },
    { label: "עמלת אי־הודעה", value: formatShekels(r.noNotice) },
  ];
});
const tableRows = computed(() =>
  series.value
    .map((s, i) => ({ i, date: s.date, red: s.r.reduction.percent, total: s.r.total, exit: s.r.status === "exit_point", months: s.r.monthsToReset }))
    .filter((row) => row.i % (kind.value === "fixed" ? 6 : 3) === 0 || row.exit),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      <template v-if="kind === 'fixed'">הלוואה של עדי וירון: 700,000 ₪, קבועה לא צמודה, 5.90%, מ־1.7.2023. הממוצעים הם ערכים שהצוות קרא ב־2.8.2026 (לא אומת).</template>
      <template v-else>הלוואה בדויה: 400,000 ₪, מסלול משתנה בריבית 4.5%, ל־25 שנה, מ־15.3.2022. הריבית מתעדכנת כל 5 שנים, ב־15.3.2027. הממוצעים בדויים.</template>
      הממוצעים מוחזקים קבועים לאורך הציר, והם לא כך באמת: הם משתנים בכל חודש. דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים.
    </p>

    <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="סוג המסלול">
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="kind === 'fixed' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="kind === 'fixed'" @click="pick('fixed')">קבועה לא צמודה</button>
      <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="kind === 'variable' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="kind === 'variable'" @click="pick('variable')">משתנה, עדכון כל 5 שנים</button>
    </div>

    <label class="mt-4 flex flex-col">
      <span class="text-caption font-semibold text-n600">יום הפירעון</span>
      <input v-model.number="index" type="range" min="0" :max="series.length - 1" step="1" aria-label="יום הפירעון" />
      <span class="text-body-l font-semibold text-n900">{{ fmtDate(at.date) }}</span>
    </label>

    <!-- The axis: time runs from right to left. -->
    <div class="mt-3">
      <div class="relative" style="direction: ltr">
        <svg :viewBox="`0 0 ${W} ${H}`" class="block w-full" role="img" :aria-label="`העמלה הכוללת לפי יום הפירעון. ביום שנבחר: ${formatWholeShekels(at.r.total)}.`">
          <g v-for="t in ticks" :key="t">
            <line :x1="0" :x2="W" :y1="yOf(t)" :y2="yOf(t)" stroke="var(--mogi-n200)" stroke-width="1" />
          </g>
          <line v-for="s in steps" :key="`s${s.i}`" :x1="xOf(s.i - 0.5)" :x2="xOf(s.i - 0.5)" y1="0" :y2="H" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
          <line v-if="exitIndex >= 0" :x1="xOf(exitIndex)" :x2="xOf(exitIndex)" y1="0" :y2="H" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
          <polyline :points="line" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" stroke-linejoin="round" />
          <line :x1="xOf(index)" :x2="xOf(index)" y1="0" :y2="H" stroke="var(--mogi-turquoise-2)" stroke-width="2" />
          <circle :cx="xOf(index)" :cy="yOf(at.r.total.toNumber())" r="6" fill="var(--mogi-n0)" stroke="var(--mogi-teal-deep)" stroke-width="3" />
        </svg>
        <!-- y-axis labels in HTML, so they stay readable on a phone -->
        <div class="pointer-events-none absolute inset-y-0 start-0" aria-hidden="true">
          <span v-for="t in ticks" :key="`y${t}`" class="absolute whitespace-nowrap rounded-sm bg-n0/80 px-1 text-caption text-n600" :style="{ top: `${(yOf(t) / H) * 100}%`, transform: 'translateY(-100%)' }"><span class="ltr">{{ t.toLocaleString("en-US") }}</span></span>
        </div>
      </div>
      <div class="mt-1 flex justify-between text-caption text-n600" style="direction: ltr" aria-hidden="true">
        <span v-for="l in [...axisLabels].reverse()" :key="l.i" class="ltr">{{ l.text }}</span>
      </div>
      <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-n700">
        <li class="flex items-center gap-2"><span class="inline-block h-1 w-6 rounded-pill bg-teal-deep"></span>העמלה הכוללת (עם הודעה {{ noticeDays }} ימים מראש)</li>
        <li class="flex items-center gap-2"><span class="inline-block h-3 w-0 border-s-2 border-dashed border-navy"></span><template v-if="kind === 'fixed'">מדרגת ההפחתה לפי ותק</template><template v-else>מדרגת ההפחתה ותחנת היציאה</template></li>
        <li class="flex items-center gap-2"><span class="inline-block h-3 w-0 border-s-2 border-turquoise-2"></span>הבחירה שלכם</li>
      </ul>
      <p class="mt-1 text-caption text-n600">הזמן זורם מימין לשמאל. הציר האנכי מתחיל באפס.</p>
    </div>

    <div class="mt-4 rounded-md border border-navy p-3" aria-live="polite">
      <p class="flex flex-wrap items-baseline justify-between gap-x-3 text-body-m font-semibold text-n900">
        <span>סך העמלות ב{{ fmtDate(at.date) }}</span><span class="ltr">{{ formatShekels(at.r.total) }}</span>
      </p>
      <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m">
        <template v-for="p in parts" :key="p.label"><dt class="text-n700">{{ p.label }}</dt><dd class="text-end"><span class="ltr text-n900">{{ p.value }}</span></dd></template>
        <dt class="text-n700">ותק, והפחתה</dt><dd class="text-end"><span class="text-n900"><span class="ltr">{{ at.r.paid }}</span> חודשים · <span class="ltr">{{ at.r.reduction.percent }}%</span></span></dd>
        <template v-if="reset"><dt class="text-n700">חודשים עד העדכון</dt><dd class="text-end"><span class="ltr text-n900">{{ reset.monthsToReset }}</span></dd></template>
      </dl>
      <p v-if="status" class="mt-2 text-body-m text-n800">{{ status }}</p>
      <p class="mt-2 text-caption text-n600">
        חלון ההודעה לפירעון הזה: מ־{{ fmtDate(windowFrom) }} עד {{ fmtDate(windowTo) }} (בין 45 ל־10 ימים לפני).
      </p>
    </div>

    <details class="mt-3 rounded-md border border-n200 p-3">
      <summary class="min-h-11 cursor-pointer text-body-m font-semibold text-n900">הממוצעים וההודעה</summary>
      <div class="mt-2 grid gap-x-4 gap-y-3 sm:grid-cols-3">
        <label class="flex flex-col">
          <span class="text-caption font-semibold text-n600">הממוצע ביום הפירעון (אפקטיבי)</span>
          <input v-model.number="avgToday" type="range" min="2" max="7" step="0.01" aria-label="הממוצע ביום הפירעון" />
          <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ avgToday.toFixed(2) }}%</span></span>
        </label>
        <label class="flex flex-col">
          <span class="text-caption font-semibold text-n600">הממוצע בהעמדה (אפקטיבי)</span>
          <input v-model.number="avgGrant" type="range" min="2" max="7" step="0.01" aria-label="הממוצע בהעמדה" />
          <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ avgGrant.toFixed(2) }}%</span></span>
        </label>
        <label class="flex flex-col">
          <span class="text-caption font-semibold text-n600">ימים מראש שבהם נמסרה הודעה</span>
          <input v-model.number="noticeDays" type="range" min="0" max="60" step="1" aria-label="ימים מראש" />
          <span class="text-body-l font-semibold text-n900">{{ noticeDays === 0 ? "לא נמסרה הודעה" : `${noticeDays} ימים` }}</span>
        </label>
      </div>
    </details>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">יום הפירעון</th>
            <th class="py-2 pe-3 text-start font-semibold">הפחתה</th>
            <th v-if="kind === 'variable'" class="py-2 pe-3 text-start font-semibold">חודשים לעדכון</th>
            <th class="py-2 text-start font-semibold">סך העמלות</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row.i" class="border-b border-n100" :class="row.exit ? 'bg-n50 font-semibold' : ''">
            <td class="py-1 pe-3">{{ fmtDate(row.date) }}{{ row.exit ? " (תחנת יציאה)" : "" }}</td>
            <td class="py-1 pe-3"><span class="ltr">{{ row.red }}%</span></td>
            <td v-if="kind === 'variable'" class="py-1 pe-3"><span class="ltr">{{ row.months }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(row.total) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
