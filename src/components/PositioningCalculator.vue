<script setup lang="ts">
// The thresholds calculator (מחשבון ספים), first in lesson 6.2 and extended in 6.4. A file (a price, a mix, an
// income and perhaps a car loan) stands against a list of lines on two ratios: the payment ratio and the
// financing ratio. The learner moves what a client can really move, one thing at a time:
//   equity   more equity, a smaller loan (the tracks keep their proportions: sensitivity.ts's "amount" lever)
//   income   more recognised income a month (documented income that exists; lesson 6.3)
//   term     the term of every track, in years (the longest allowed is the tracks' own: 30 in case A)
//   wait     months waited, so the car loan has fewer months left (the 18-month line of lesson 4.2)
//   close    the car loan is closed from the equity: the loan grows by the payoff (the opposite direction, 6.1)
// and sees, for each line, its kind, whether it is crossed, how far it is in points, and what it would cost to
// reach it from here: shekels of equity, shekels of income a month, shekels of payment. A crossing itself is
// never priced: no source gives the size of a step (lesson 6.2 says so). Every number comes from
// positioning.ts (on regulation.ts, affordability.ts and sensitivity.ts); the page passes the file and the caption.
import { computed, ref } from "vue";
import Decimal from "decimal.js";
import BidiText from "./BidiText.vue";
import { overMonthsLine, paymentToIncome } from "../lib/calc/affordability.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import {
  equityToReach,
  EXAMPLE_THRESHOLDS,
  incomeRoom,
  KIND_INFO,
  loanCut,
  loanRoom,
  paymentCut,
  paymentRoom,
  standing,
  statementPayment,
  type Metric,
  type Threshold,
  type ThresholdKind,
} from "../lib/calc/positioning.ts";
import { ltvPercentOf, withMinus } from "../lib/calc/regulation.ts";
import type { TrackSpec } from "../lib/calc/schedule.ts";
import { applyLever, loanOf } from "../lib/calc/sensitivity.ts";

type Control = "equity" | "income" | "term" | "wait" | "close";
const props = withDefaults(
  defineProps<{
    /** The value the financing ratio is measured against. */
    price: string;
    /** The mix: schedule.ts's TrackSpec list. */
    tracks: TrackSpec[];
    /** Recognised monthly income. */
    recognised: string;
    /** An obligation that counts while more than 18 months are left. */
    car?: { monthly: string; monthsLeft: number } | null;
    /** What closing the car loan takes out of the equity (a calculation assumption the page states). */
    carPayoff?: string;
    thresholds?: Threshold[];
    controls?: Control[];
    maxEquity?: number;
    /** The caption: where the numbers come from and how sure the course is. */
    source: string;
  }>(),
  { car: null, carPayoff: undefined, thresholds: () => EXAMPLE_THRESHOLDS, controls: () => ["equity", "income", "term"], maxEquity: 400000 },
);

const has = (c: Control) => props.controls.includes(c);
const equity = ref(0);
const income = ref(0);
const termYears = ref(Math.round(Math.max(...props.tracks.map((t) => t.months)) / 12));
const maxYears = termYears.value;
const wait = ref(0);
const close = ref(false);
const showTable = ref(false);

const SCENARIO = { inflation: "0", primeShift: "0", anchorShift: "0" };
const loanChange = computed(() => (close.value && props.carPayoff ? Number(props.carPayoff) : 0) - equity.value);
const moved = computed<TrackSpec[]>(() =>
  loanChange.value === 0 ? props.tracks.map((t) => ({ ...t })) : applyLever({ tracks: props.tracks, scenario: SCENARIO }, { lever: "amount", change: loanChange.value }).tracks,
);
const tracksNow = computed<TrackSpec[]>(() => (has("term") ? moved.value.map((t) => ({ ...t, months: termYears.value * 12 })) : moved.value));
const monthsLeft = computed(() => (props.car ? props.car.monthsLeft - wait.value : 0));
const carCounts = computed(() => !!props.car && !close.value && overMonthsLine(monthsLeft.value));
const disposable = computed(() => new Decimal(props.recognised).plus(income.value).minus(carCounts.value && props.car ? props.car.monthly : 0));
const payment = computed(() => statementPayment(tracksNow.value));
// The payment is the statement's: each track's payment rounded to the agora, then added; the distances are measured from that figure, as the lesson's facts are.
const shownPayment = computed(() => statementPayment(tracksNow.value));
const loan = computed(() => loanOf(tracksNow.value));
const ratio = computed(() => paymentToIncome(payment.value, disposable.value));
const ltv = computed(() => ltvPercentOf(loan.value, props.price));
const actualOf = (m: Metric) => (m === "pti" ? ratio.value : ltv.value);

// ── Per line: its standing and what reaching it costs from here ──
const KIND_COLOR: Record<ThresholdKind, string> = {
  regulatory_limit: "var(--mogi-danger)",
  capital_threshold: "var(--mogi-warning)",
  bank_policy: "var(--mogi-teal-deep)",
  field_hypothesis: "var(--mogi-n500)",
  course_example: "var(--mogi-n500)",
};
const KIND_DASH: Record<ThresholdKind, string> = { regulatory_limit: "0", capital_threshold: "6 3", bank_policy: "3 2", field_hypothesis: "1 3", course_example: "1 3" };
const KIND_ORDER: ThresholdKind[] = ["regulatory_limit", "capital_threshold", "bank_policy", "field_hypothesis", "course_example"];

interface Row {
  t: Threshold;
  over: boolean;
  at: boolean;
  points: Decimal;
  /** pti: the payment room in shekels a month (negative when over). ltv: the loan room (negative when over). */
  room: Decimal;
  /** Over a payment-ratio line: what brings the ratio onto it, by each of the three routes. */
  equityNeeded: Decimal | null;
  incomeNeeded: Decimal | null;
  paymentCut: Decimal | null;
}
function rowOf(t: Threshold): Row {
  const s = standing(actualOf(t.metric), t);
  const over = s.status === "over";
  if (t.metric === "pti") {
    let eq: Decimal | null = null;
    if (over) {
      try {
        eq = loanCut(tracksNow.value, disposable.value, t.percent);
      } catch {
        eq = null;
      }
    }
    return {
      t,
      over,
      at: s.status === "at",
      points: s.points,
      room: paymentRoom(disposable.value, shownPayment.value, t.percent),
      equityNeeded: eq,
      incomeNeeded: over ? incomeRoom(disposable.value, shownPayment.value, t.percent) : null,
      paymentCut: over ? paymentCut(disposable.value, shownPayment.value, t.percent) : null,
    };
  }
  return { t, over, at: s.status === "at", points: s.points, room: loanRoom(props.price, loan.value, t.percent), equityNeeded: over ? equityToReach(props.price, loan.value, t.percent) : null, incomeNeeded: null, paymentCut: null };
}
const rows = computed<Row[]>(() => [...props.thresholds].sort((a, b) => new Decimal(a.percent).cmp(b.percent)).map(rowOf));
const ptiRows = computed(() => rows.value.filter((r) => r.t.metric === "pti"));
const ltvRows = computed(() => rows.value.filter((r) => r.t.metric === "ltv"));
const crossedCount = (rs: Row[]) => rs.filter((r) => r.over).length;

const metricName = (m: Metric) => (m === "pti" ? "יחס ההחזר" : "שיעור המימון");
const ladders = computed(() => [
  { metric: "pti" as Metric, rows: ptiRows.value, scale: 70, gap: 12 },
  { metric: "ltv" as Metric, rows: ltvRows.value, scale: 100, gap: 14 },
].filter((l) => l.rows.length));
const pos = (p: Decimal.Value, scale: number) => `${Math.min(100, (Number(p) / scale) * 100)}%`;
// Labels sit at up to three heights, chosen by how close a line is to the one before it, so lines a few points apart never cover each other's numbers.
const TOPS = ["-1.5rem", "-2.75rem", "-4rem"];
function labelTops(rs: Row[], gap: number): Record<string, string> {
  const tops: Record<string, string> = {};
  let level = 0;
  rs.forEach((r, i) => {
    if (i > 0 && new Decimal(r.t.percent).minus(rs[i - 1].t.percent).lt(gap)) level = (level + 1) % TOPS.length;
    else level = 0;
    tops[r.t.id] = TOPS[level];
  });
  return tops;
}
const pctText = (d: Decimal) => withMinus(percentString(d));
// "נקודת אחוז" is singular up to one, plural above it.
const pointsWord = (d: Decimal) => (d.abs().lte(1) ? "נקודת אחוז" : "נקודות אחוז");
// A ratio that rounds onto a line while the verdict says "over" shows more digits, so the screen never says "40%" beside "crossed".
function actualText(m: Metric, rs: Row[]): string {
  const a = actualOf(m);
  const rounded = percentString(a);
  const clash = rs.some((r) => r.over && percentString(r.t.percent) === rounded);
  return clash ? a.toDecimalPlaces(3).toString() : rounded;
}
const money = (d: Decimal) => withMinus(formatShekelsText(d));
const statusText = (r: Row) => (r.over ? "נחצה" : r.at ? "בדיוק על הקו" : "לא נחצה");
const statusClass = (r: Row) => (r.over ? "bg-warning-bg" : "bg-success-bg");
// The nearest crossed payment-ratio line and what it costs from here, for the sticky line: the answer to the lesson's task stays in view while a slider moves.
const nearestCrossed = computed(() => [...ptiRows.value].filter((r) => r.over).pop() ?? null);
const outcome = computed(() => `יחס ההחזר ${percentString(ratio.value)}%, שיעור המימון ${percentString(ltv.value)}%`);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600"><BidiText :text="source" /></p>

    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label v-if="has('equity')" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הון עצמי נוסף (ההלוואה קטנה בהתאם)</span>
        <input v-model.number="equity" type="range" min="0" :max="maxEquity" step="1000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(equity) }}</span></span>
      </label>
      <label v-if="has('income')" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הכנסה מוכרת נוספת בחודש (הכנסה אמיתית, מתועדת)</span>
        <input v-model.number="income" type="range" min="0" max="4000" step="50" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(income) }}</span></span>
      </label>
      <label v-if="has('term')" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תקופה לכל המסלולים</span>
        <input v-model.number="termYears" type="range" min="15" :max="maxYears" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ termYears }}</span> שנים</span>
        <span class="text-caption text-n600">לא יותר מ־<span class="ltr">{{ maxYears }}</span> שנה, התקופה המרבית שבתיק.</span>
      </label>
      <label v-if="has('wait') && car" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">חודשי המתנה לפני ההגשה</span>
        <input v-model.number="wait" type="range" min="0" :max="car.monthsLeft" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ wait }}</span> חודשים</span>
        <span class="text-caption text-n600">להלוואת הרכב נשארו <span class="ltr">{{ monthsLeft }}</span> חודשים.</span>
      </label>
      <label v-if="has('close') && car && carPayoff" class="flex min-h-11 cursor-pointer items-start gap-2 sm:col-span-2">
        <input v-model="close" type="checkbox" class="mt-1 h-5 w-5 accent-teal-deep" />
        <span class="text-body-m text-n800">סוגרים את הלוואת הרכב מההון העצמי (<span class="ltr">{{ formatShekelsText(carPayoff) }}</span>, הנחת חישוב): ההלוואה לדירה גדלה באותו סכום.</span>
      </label>
    </div>

    <!-- The two ratios under the sliders; on a phone they stick to the bottom of the screen while a slider moves. -->
    <p class="sticky bottom-2 z-10 mt-4 rounded-md border border-n200 bg-n50 p-3 text-body-m text-n800 shadow-md sm:static sm:shadow-none" role="status">
      יחס ההחזר <span class="ltr font-semibold">{{ actualText("pti", ptiRows) }}%</span> · שיעור המימון <span class="ltr font-semibold">{{ actualText("ltv", ltvRows) }}%</span>
      <span class="text-n600"> · החזר <span class="ltr">{{ formatShekelsText(shownPayment) }}</span> על הכנסה פנויה <span class="ltr">{{ formatShekelsText(disposable) }}</span></span>
      <span v-if="nearestCrossed" class="block text-n900">הקו הקרוב שנחצה: <span class="ltr font-semibold">{{ nearestCrossed.t.percent }}%</span> · להגיע אליו: <span class="ltr whitespace-nowrap font-semibold">{{ nearestCrossed.equityNeeded ? money(nearestCrossed.equityNeeded) : "—" }}</span> הון עצמי נוסף, או <span class="ltr whitespace-nowrap font-semibold">{{ money(nearestCrossed.incomeNeeded ?? new Decimal(0)) }}</span> הכנסה מוכרת נוספת בחודש</span>
      <span v-else class="block text-n900">אף קו של יחס ההחזר לא נחצה.</span>
    </p>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-navy)"></span>המספר של התיק</li>
      <li v-for="k in KIND_ORDER" :key="k" class="flex items-center gap-2">
        <svg class="h-4 w-4" viewBox="0 0 12 16" aria-hidden="true"><line x1="6" y1="0" x2="6" y2="16" :stroke="KIND_COLOR[k]" stroke-width="3" :stroke-dasharray="KIND_DASH[k]" /></svg>{{ KIND_INFO[k].name }}
      </li>
    </ul>

    <section v-for="l in ladders" :key="l.metric" class="mt-5" :aria-label="metricName(l.metric)">
      <p class="text-body-m font-semibold text-n900">
        {{ metricName(l.metric) }}: <span class="ltr">{{ actualText(l.metric, l.rows) }}%</span>
        <span class="text-caption font-normal text-n600"> · נחצו {{ crossedCount(l.rows) }} מתוך {{ l.rows.length }} קווים</span>
      </p>
      <div class="relative mt-20" role="img" :aria-label="`${metricName(l.metric)} ${actualText(l.metric, l.rows)}%. קווים: ${l.rows.map((r) => r.t.percent + '%').join(', ')}.`">
        <div class="h-4 w-full overflow-hidden rounded-sm bg-n50">
          <div class="h-full" :style="{ width: pos(actualOf(l.metric), l.scale), background: 'var(--mogi-navy)' }"></div>
        </div>
        <div
          v-for="r in l.rows"
          :key="r.t.id"
          class="absolute bottom-0 border-s-4"
          :style="{ insetInlineStart: pos(r.t.percent, l.scale), borderColor: KIND_COLOR[r.t.kind], borderStyle: r.t.kind === 'regulatory_limit' ? 'solid' : r.t.kind === 'field_hypothesis' || r.t.kind === 'course_example' ? 'dotted' : 'dashed', top: labelTops(l.rows, l.gap)[r.t.id] }"
        >
          <span class="absolute -top-1 start-1 whitespace-nowrap text-caption font-semibold text-n800"><span class="ltr">{{ r.t.percent }}%</span></span>
        </div>
      </div>
      <div class="mt-1 flex justify-between text-caption text-n600" aria-hidden="true"><span>0%</span><span>{{ l.scale }}%</span></div>
    </section>

    <ol class="list-reset mt-5 space-y-3">
      <li v-for="r in rows" :key="r.t.id" class="rounded-md border border-n200 p-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-body-m font-semibold text-n900">
            <BidiText :text="r.t.label" />
            <span class="text-caption font-normal text-n600">· {{ KIND_INFO[r.t.kind].name }}</span>
          </p>
          <span class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="statusClass(r)">{{ statusText(r) }}</span>
        </div>
        <p class="mt-1 text-body-m text-n800">
          <template v-if="r.over">מעל הקו ב־<span class="ltr font-semibold">{{ pctText(r.points.abs()) }}</span> {{ pointsWord(r.points) }}.</template>
          <template v-else>מתחת לקו ב־<span class="ltr font-semibold">{{ pctText(r.points) }}</span> {{ pointsWord(r.points) }}.</template>
        </p>
        <p v-if="r.t.metric === 'pti'" class="mt-1 text-body-m text-n800">
          <template v-if="r.over">
            להגיע לקו: להקטין את ההחזר ב־<span class="ltr whitespace-nowrap font-semibold">{{ money(r.paymentCut ?? r.room.abs()) }}</span> בחודש. בדרך אחת, <span class="ltr whitespace-nowrap font-semibold">{{ r.equityNeeded ? money(r.equityNeeded) : "—" }}</span> הון עצמי נוסף (לפי צעדים של 1,000 ₪); בדרך אחרת, <span class="ltr whitespace-nowrap font-semibold">{{ money(r.incomeNeeded ?? new Decimal(0)) }}</span> הכנסה מוכרת נוספת בחודש.
          </template>
          <template v-else>
            מקום: ההחזר יכול לגדול עוד <span class="ltr whitespace-nowrap font-semibold">{{ money(r.room) }}</span> בחודש עד הקו.
          </template>
        </p>
        <p v-else class="mt-1 text-body-m text-n800">
          <template v-if="r.over">
            להגיע לקו: <span class="ltr whitespace-nowrap font-semibold">{{ money(r.equityNeeded ?? new Decimal(0)) }}</span> הון עצמי נוסף (ההלוואה קטנה באותו סכום).
          </template>
          <template v-else>
            מקום: אפשר להלוות עוד <span class="ltr whitespace-nowrap font-semibold">{{ money(r.room) }}</span> עד הקו.
          </template>
        </p>
        <p class="mt-1 text-caption text-n600"><BidiText :text="`${KIND_INFO[r.t.kind].crossing} · ${r.t.source}`" /></p>
      </li>
    </ol>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[34rem] border-collapse text-body-m">
        <caption class="sr-only">{{ outcome }}</caption>
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">הקו</th>
            <th class="py-1 pe-3 text-start font-semibold">סוג</th>
            <th class="py-1 pe-3 text-start font-semibold">מצב</th>
            <th class="py-1 pe-3 text-start font-semibold">הקו פחות היחס, בנקודות אחוז</th>
            <th class="py-1 text-start font-semibold">מקום או מחיר</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.t.id" class="border-b border-n100 align-top">
            <th class="py-1 pe-3 text-start font-normal text-n700">{{ r.t.label }}</th>
            <td class="py-1 pe-3">{{ KIND_INFO[r.t.kind].name }}</td>
            <td class="py-1 pe-3">{{ statusText(r) }}</td>
            <td class="py-1 pe-3"><span class="ltr">{{ pctText(r.points) }}</span></td>
            <td class="py-1">
              <template v-if="r.over"><span class="ltr whitespace-nowrap">{{ money(r.equityNeeded ?? new Decimal(0)) }}</span> הון נוסף</template>
              <template v-else><span class="ltr whitespace-nowrap">{{ money(r.room) }}</span> {{ r.t.metric === "pti" ? "בחודש" : "בהלוואה" }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
