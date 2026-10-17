<script setup lang="ts">
// "בונה תמהיל" — the brief's required mix builder, first version (lesson 3.7).
// Stage 5 extends it for case A (5.7, 5.8) and stage 9 uses it again, so it is data-driven:
//
//  Props
//   - loan: the whole loan, in shekels.
//   - tracks: up to `maxTracks` tracks — { kind, amount, rate, years, method?, resetMonths? }.
//       kind: "fixed_unlinked" | "fixed_linked" | "prime" | "variable_unlinked" | "variable_linked"
//       amount: shekels; the LAST track always takes the rest (loan − the others), so the tracks
//       always add up to the loan. rate: the track's annual rate at the start, in percent.
//       years: the track's own term (Mogi decision DEC-2). method: "spitzer" (default) or
//       "equal_principal". resetMonths: variable tracks only; default 60 (DEC-3's assumption).
//   - scenario: { inflation, primeShift, primeFromYear, anchorShift } — the index's rise in
//       percent a year (even inside the year); how many points prime moves, from which year of
//       the loan; how many points a variable track's anchor is above today's at every reset.
//       A teaching scenario, never a forecast; the component says so.
//   - labels: { first, max, total } — the three headline cards' titles. 3.7 uses plain words;
//       a later lesson that has taught the terms can pass them.
//   - maxTracks (4), amountStep (10,000 ₪), editableScenario (true).
//   - rounding: "statement" (default; every row in agorot, as the lessons' tables and a bank
//       statement) or "exact" (rounded only for display) — schedule.ts's two conventions.
//
//  Stage 5 additions (lessons 5.7, 5.8; all optional, off by default, so earlier lessons render as before):
//   - editableLoan (false): a slider for the whole loan (loanStep, default 10,000; from half to one and
//       a half times `loan`). Moving it scales every track in proportion and the last takes the rest — the
//       "amount" lever of sensitivity.ts. Emits `change` ({ loan, tracks, scenario }) after any edit by
//       the learner, so a page can follow it.
//   - disposableIncome (shekels, after the obligations; lesson 4.2) with propertyValue, deal ("only_home")
//       and obligations (affordability.ts's Obligation[]; only a same-property mortgage counts with the
//       payment): adds the payment-to-income ratio and the five lines of Directive 329 (mixbuilder.ts).
//       Without propertyValue only the ratio is shown.
//   - compareTo: { label?, tracks }: a second mix under the same scenario. Shows the difference on the
//       three headline figures (this mix minus that one) and draws its payment curve over the chart.
//   - balanceAtYears: [years]: what is still owed after each of those years (sensitivity.ts balancesAt).
//   - scenarioPresets (false): buttons for the course's three scenarios (base, harsh, mild) from
//       src/data/case-a-mix.ts.
//
//  Shows: the mix's monthly payment over time, stacked by track (each track ends at its own
//  term); the first payment; the highest payment in the scenario and when; all payments
//  added up; and the exposure — how much of the loan is in prime, linked to the index, at a
//  rate fixed for the whole term, and in variable tracks that reset. A table view per year.
// Every number comes from src/lib/calc/schedule.ts; nothing is computed here but scaling.
import Decimal from "decimal.js";
import { computed, nextTick, reactive, ref, watch } from "vue";
import type { Obligation } from "../lib/calc/affordability.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { checkBuilderMix, rescaleToLoan, summaryDelta } from "../lib/calc/mixbuilder.ts";
import { type DealType, type LineResult, RULES, withMinus } from "../lib/calc/regulation.ts";
import { percentString } from "../lib/calc/percent.ts";
import { balancesAt, loanOf } from "../lib/calc/sensitivity.ts";
import { SCENARIOS, SCENARIO_NAME_HE } from "../data/case-a-mix.ts";
import { evaluate } from "../lib/calc/engine.ts";
import {
  DEFAULT_RESET_MONTHS,
  exposure,
  mixCashFlow,
  mixSummary,
  resets,
  type Rounding,
  type ScheduleMethod,
  SUPPORTED_RESET_MONTHS,
  type TrackKind,
  type TrackSpec,
} from "../lib/calc/schedule.ts";

interface TrackInput {
  kind: TrackKind;
  amount: number;
  rate: string | number;
  years: number;
  method?: ScheduleMethod;
  resetMonths?: number;
}
interface ScenarioInput {
  inflation?: number;
  primeShift?: number;
  primeFromYear?: number;
  anchorShift?: number;
}

const props = withDefaults(
  defineProps<{
    loan?: number;
    tracks?: TrackInput[];
    scenario?: ScenarioInput;
    labels?: { first?: string; max?: string; total?: string };
    maxTracks?: number;
    amountStep?: number;
    editableScenario?: boolean;
    rounding?: Rounding;
    editableLoan?: boolean;
    loanStep?: number;
    disposableIncome?: number | string;
    propertyValue?: number | string;
    deal?: DealType;
    obligations?: Obligation[];
    compareTo?: { label?: string; tracks: TrackInput[] };
    balanceAtYears?: number[];
    scenarioPresets?: boolean;
    /** The highest payment is the engine's projected maximum (the clearing payment of a last month left out), as in lesson 8.9. */
    projectedMax?: boolean;
  }>(),
  {
    loan: 900000,
    tracks: () => [
      { kind: "fixed_unlinked", amount: 300000, rate: "4.8", years: 30 },
      { kind: "prime", amount: 300000, rate: "4.25", years: 12 },
      { kind: "fixed_linked", amount: 300000, rate: "3", years: 20 },
    ],
    scenario: () => ({ inflation: 2, primeShift: 1, primeFromYear: 2, anchorShift: 0 }),
    labels: () => ({}),
    maxTracks: 4,
    amountStep: 10000,
    editableScenario: true,
    rounding: "statement",
    editableLoan: false,
    loanStep: 10000,
    deal: "only_home",
    scenarioPresets: false,
  },
);
const emit = defineEmits<{
  change: [state: { loan: number; tracks: { kind: TrackKind; amount: number; rate: number; years: number; method: ScheduleMethod; resetMonths: number }[]; scenario: { inflation: number; primeShift: number; primeFromYear: number; anchorShift: number } }];
}>();

const KIND_NAMES: Record<TrackKind, string> = {
  fixed_unlinked: "קבועה לא צמודה (קל״צ)",
  fixed_linked: "קבועה צמודה",
  prime: "פריים",
  variable_unlinked: "משתנה לא צמודה",
  variable_linked: "משתנה צמודה",
};
const KINDS = Object.keys(KIND_NAMES) as TrackKind[];
const COLOURS = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)", "var(--mogi-n400)", "var(--mogi-mint)"];
const titles = computed(() => ({
  first: props.labels.first ?? "התשלום הראשון",
  max: props.labels.max ?? "התשלום הגבוה ביותר בתרחיש",
  total: props.labels.total ?? "כל התשלומים יחד",
}));

// Editable state. Each track has a stable key, so adding or removing one keeps focus and inputs in place.
let nextKey = 0;
interface Row extends Required<Omit<TrackInput, "rate">> {
  key: number;
  rate: number;
}
const rows = reactive<Row[]>(
  props.tracks.slice(0, props.maxTracks).map((t) => ({
    key: nextKey++,
    kind: t.kind,
    amount: t.amount,
    rate: Number(t.rate),
    years: t.years,
    method: t.method ?? "spitzer",
    resetMonths: t.resetMonths ?? DEFAULT_RESET_MONTHS,
  })),
);
const scenario = reactive({
  inflation: props.scenario.inflation ?? 0,
  primeShift: props.scenario.primeShift ?? 0,
  primeFromYear: props.scenario.primeFromYear ?? 2,
  anchorShift: props.scenario.anchorShift ?? 0,
});
const showTable = ref(false);

// The loan: the prop, unless the learner moves it (editableLoan).
const loanNow = ref(props.loan);
watch(() => props.loan, (v) => (loanNow.value = v));
const loanMin = computed(() => Math.max(props.loanStep, Math.round((props.loan * 0.5) / props.loanStep) * props.loanStep));
const loanMax = computed(() => Math.round((props.loan * 1.5) / props.loanStep) * props.loanStep);
// Moving the loan scales every track in proportion; the last takes the rest (the amount lever of sensitivity.ts).
function setLoan(v: number) {
  const next = rescaleToLoan(amounts.value, v).map((d) => d.toNumber());
  rows.forEach((r, i) => (r.amount = next[i]));
  loanNow.value = v;
}

// The last track takes the rest; every other track can take at most what the others leave.
const othersBefore = (i: number) => rows.slice(0, -1).reduce((s, r, k) => (k === i ? s : s + r.amount), 0);
const maxAmount = (i: number) => Math.max(0, loanNow.value - othersBefore(i));
const rest = computed(() => loanNow.value - rows.slice(0, -1).reduce((s, r) => s + r.amount, 0));
const amounts = computed(() => rows.map((r, i) => (i === rows.length - 1 ? rest.value : r.amount)));

const specs = computed<TrackSpec[]>(() =>
  rows.map((r, i) => ({
    kind: r.kind,
    amount: String(amounts.value[i]),
    rate: String(r.rate),
    months: r.years * 12,
    method: r.method,
    ...(resets(r.kind) ? { resetMonths: r.resetMonths } : {}),
  })),
);
const scenarioSpec = computed(() => ({
  inflation: [String(scenario.inflation)],
  primeShift: [...Array.from({ length: Math.max(scenario.primeFromYear - 1, 0) }, () => "0"), String(scenario.primeShift)],
  anchorShift: [String(scenario.anchorShift)],
  blockMonths: 12,
  rounding: props.rounding,
}));

// mixSummary, or (projectedMax) with the highest payment the engine's way: the clearing payment of a last month is left out.
function summaryOf(list: TrackSpec[], flow: ReturnType<typeof mixCashFlow>) {
  const s = mixSummary(flow);
  if (!props.projectedMax) return s;
  const e = evaluate(list, scenarioSpec.value);
  return { ...s, maxPayment: e.max, maxMonth: e.maxMonth };
}

// One computation for everything shown. A scenario that pushes a rate below zero is refused with a message.
const result = computed(() => {
  if (rest.value < 0) return { error: "המסלולים גדולים מההלוואה. הקטינו אחד מהם." };
  try {
    const flow = mixCashFlow(specs.value, scenarioSpec.value);
    return { flow, summary: summaryOf(specs.value, flow), exposure: exposure(specs.value) };
  } catch {
    return { error: "בתרחיש הזה אחוז הריבית באחד המסלולים יורד מתחת לאפס. הקטינו את הירידה, או העלו את אחוז הריבית של המסלול." };
  }
});
const ok = computed(() => ("flow" in result.value ? result.value : null));

// ── Stage 5: presets, the second mix, balances, the limits ──
const PRESETS = [
  { id: "base", key: "base" },
  { id: "harsh", key: "stress" },
  { id: "mild", key: "relief" },
] as const;
const presetOn = (key: keyof typeof SCENARIOS) => {
  const p = SCENARIOS[key];
  return Number(p.inflation) === scenario.inflation && Number(p.primeShift) === scenario.primeShift && Number(p.anchorShift) === scenario.anchorShift;
};
function applyPreset(key: keyof typeof SCENARIOS) {
  const p = SCENARIOS[key];
  scenario.inflation = Number(p.inflation);
  scenario.primeShift = Number(p.primeShift);
  scenario.anchorShift = Number(p.anchorShift);
}

const toSpecs = (list: TrackInput[]): TrackSpec[] =>
  list.map((t) => ({
    kind: t.kind,
    amount: String(t.amount),
    rate: String(t.rate),
    months: t.years * 12,
    method: t.method ?? "spitzer",
    ...(resets(t.kind) ? { resetMonths: t.resetMonths ?? DEFAULT_RESET_MONTHS } : {}),
  }));
// The second mix runs under the same scenario as this one.
const compare = computed(() => {
  if (!props.compareTo || !ok.value) return null;
  try {
    const specs = toSpecs(props.compareTo.tracks);
    const flow = mixCashFlow(specs, scenarioSpec.value);
    const summary = summaryOf(specs, flow);
    return { specs, flow, summary, loan: loanOf(specs), delta: summaryDelta(ok.value.summary, summary) };
  } catch {
    return null;
  }
});
const compareName = computed(() => props.compareTo?.label ?? "התמהיל להשוואה");
const sameLoan = computed(() => !compare.value || compare.value.loan.eq(loanNow.value));
const signed = (v: Decimal) => (v.isZero() ? "ללא הבדל" : `${v.gt(0) ? "+" : "−"}${formatShekels(v.abs())}`);

const balanceRows = computed(() => {
  const years = props.balanceAtYears ?? [];
  if (!ok.value || years.length === 0) return [];
  const months = years.map((y) => y * 12);
  const mine = balancesAt(specs.value, scenarioSpec.value, months);
  const other = compare.value ? balancesAt(compare.value.specs, scenarioSpec.value, months) : null;
  return years.map((y, k) => ({ years: y, mine: mine[k], other: other ? other[k] : null, delta: other ? mine[k].minus(other[k]) : null }));
});

// The ratio and the five lines: only when the page gives the disposable income.
const check = computed(() => {
  if (!ok.value || props.disposableIncome === undefined) return null;
  try {
    return checkBuilderMix(specs.value, { deal: props.deal, value: props.propertyValue, disposableIncome: props.disposableIncome, obligations: props.obligations });
  } catch {
    return null;
  }
});
const ruleOf = (l: LineResult) => RULES.find((r) => r.id === l.id)!;
const isTerm = (l: LineResult) => l.id === "term";
const lineStatus = (l: LineResult) => (l.status === "over" ? "חוצה: אסור" : l.status === "above" ? "מעל קו ההון: מותר" : "בתוך הקו");
const lineClass = (l: LineResult) => (l.status === "over" ? "bg-danger-bg" : l.status === "above" ? "bg-warning-bg" : "bg-success-bg");
const lineActual = (l: LineResult) => (isTerm(l) ? `${l.actual.toNumber() / 12} שנים` : `${percentString(l.actual)}%`);
const lineLimit = (l: LineResult) => (isTerm(l) ? `עד ${l.limit.toNumber() / 12} שנה` : l.id === "variable" ? "עד שני שלישים" : `${percentString(l.limit)}%`);
const lineRoom = (l: LineResult) => (isTerm(l) ? `${withMinus(String(l.room.toNumber()))} חודשים` : withMinus(formatShekels(l.room)));

// Back to the starting state: the tracks, the scenario and the loan as the page gave them.
const snapshot = () => ({ loan: loanNow.value, rows: rows.map(({ key: _k, ...r }) => ({ ...r })), scenario: { ...scenario } });
const startState = snapshot();
const dirty = computed(() => JSON.stringify(snapshot()) !== JSON.stringify(startState));
function resetAll() {
  rows.splice(0, rows.length, ...startState.rows.map((r) => ({ ...r, key: nextKey++ })));
  Object.assign(scenario, startState.scenario);
  loanNow.value = startState.loan;
}

// Tell the page what the learner changed (not the starting state).
const touched = ref(false);
watch(
  [rows, scenario, loanNow],
  () => {
    if (!touched.value) return;
    emit("change", {
      loan: loanNow.value,
      tracks: rows.map((r, i) => ({ kind: r.kind, amount: amounts.value[i], rate: r.rate, years: r.years, method: r.method, resetMonths: r.resetMonths })),
      scenario: { inflation: scenario.inflation, primeShift: scenario.primeShift, primeFromYear: scenario.primeFromYear, anchorShift: scenario.anchorShift },
    });
  },
  { deep: true },
);

const pct = (v: Decimal.Value) => `${new Decimal(v).toDecimalPlaces(2).toString()}%`;
const unit = (v: number) => (Math.abs(v) <= 1 ? "נקודת אחוז" : "נקודות אחוז");
const points = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${new Decimal(Math.abs(v)).toString()}`;
const shareOf = (i: number) => pct(new Decimal(amounts.value[i]).div(loanNow.value).mul(100));
const whenText = (month: number) => `חודש ${month} (שנה ${Math.ceil(month / 12)})`;
const trackName = (i: number) => `מסלול ${i + 1} · ${KIND_NAMES[rows[i].kind]}`;
// "שנה" for one year, "N שנים" otherwise ("2.5 שנים").
const yearsText = (m: number) => (m === 12 ? "שנה" : `${new Decimal(m).div(12).toString()} שנים`);

// Add and remove, with focus kept on something sensible.
const addButton = ref<HTMLButtonElement | null>(null);
const kindSelects = ref<HTMLSelectElement[]>([]);
async function addTrack() {
  if (rows.length >= props.maxTracks) return;
  // The new track starts empty and takes the rest; the old last track keeps what it had.
  rows[rows.length - 1].amount = rest.value;
  rows.push({ key: nextKey++, kind: "fixed_unlinked", amount: 0, rate: 5, years: 20, method: "spitzer", resetMonths: DEFAULT_RESET_MONTHS });
  await nextTick();
  kindSelects.value[rows.length - 1]?.focus();
}
async function removeTrack(i: number) {
  if (rows.length <= 1) return;
  rows.splice(i, 1);
  await nextTick();
  (kindSelects.value[Math.min(i, rows.length - 1)] ?? addButton.value)?.focus();
}

// The chart: the payment each month, stacked by track.
const W = 640;
const H = 200;
const PAD = { top: 12, bottom: 8, side: 10 };
const months = computed(() => (ok.value ? Math.max(ok.value.flow.length, compare.value?.flow.length ?? 0) : 12));
const x = (m: number) => W - PAD.side - (m / months.value) * (W - 2 * PAD.side);
const chart = computed(() => {
  if (!ok.value) return null;
  const flow = ok.value.flow;
  const max = Math.max(...flow.map((m) => m.payment.toNumber()), ...(compare.value?.flow.map((m) => m.payment.toNumber()) ?? [])) * 1.08 || 1;
  const y = (v: number) => H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  const n = rows.length;
  const tops: number[][] = Array.from({ length: n }, () => []);
  flow.forEach((m) => {
    let c = 0;
    m.byTrack.forEach((p, k) => {
      c += p.toNumber();
      tops[k].push(c);
    });
  });
  // Each month is a step: the payment holds from the start of the month to its end.
  const edge = (vals: number[]) => vals.flatMap((v, t) => [`${x(t).toFixed(1)},${y(v).toFixed(1)}`, `${x(t + 1).toFixed(1)},${y(v).toFixed(1)}`]);
  const zero = Array.from({ length: flow.length }, () => 0);
  const areas = tops.map((top, k) => {
    const bottom = k === 0 ? zero : tops[k - 1];
    return `M${edge(top).join(" L")} L${edge(bottom).reverse().join(" L")} Z`;
  });
  const other = compare.value ? `M${edge(compare.value.flow.map((m) => m.payment.toNumber())).join(" L")}` : null;
  return { areas, other, base: y(0), maxX: x(ok.value.summary.maxMonth - 0.5) };
});
const ticks = computed(() => Array.from({ length: Math.floor(months.value / 60) + 1 }, (_, i) => i * 5));

const exposureRows = computed(() => {
  if (!ok.value) return [];
  const e = ok.value.exposure;
  return [
    { label: "בפריים", amount: e.prime, share: e.share.prime },
    { label: "צמוד למדד", amount: e.linked, share: e.share.linked },
    { label: "באחוז ריבית קבוע לכל התקופה", amount: e.fixedForTerm, share: e.share.fixedForTerm },
    { label: "במשתנה שמתעדכן כל כמה שנים", amount: e.resetting, share: e.share.resetting },
  ];
});

const yearRows = computed(() => {
  if (!ok.value) return [];
  const flow = ok.value.flow;
  return Array.from({ length: Math.floor(flow.length / 12) }, (_, k) => {
    const m = flow[(k + 1) * 12 - 1];
    return { year: k + 1, total: m.payment, byTrack: m.byTrack };
  });
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" @input="touched = true" @change="touched = true" @click="touched = true">
    <p class="text-caption text-n600">
      תרחיש להמחשה, לא מה שצפוי לקרות. הלוואה של <span class="ltr whitespace-nowrap">{{ formatWholeShekels(loanNow) }}</span>, עד {{ maxTracks }} מסלולים. לכל מסלול תקופה משלו, והתשלום
      של התמהיל בכל חודש הוא סכום התשלומים של המסלולים באותו חודש. המסלול האחרון לוקח את מה שנשאר מההלוואה.
      <template v-if="rounding === 'statement'">כל שורה מעוגלת לאגורה, לפי כלל העיגול של הקורס, ולכן התשלום האחרון של מסלול שונה באגורות.</template>
    </p>

    <!-- The whole loan -->
    <label v-if="editableLoan" class="mt-4 flex flex-col rounded-md border border-n200 p-3">
      <span class="text-body-m font-semibold text-n900">סכום ההלוואה: <span class="ltr">{{ formatWholeShekels(loanNow) }}</span></span>
      <input type="range" :min="loanMin" :max="loanMax" :step="loanStep" :value="loanNow" aria-label="סכום ההלוואה כולה" @input="setLoan(Number(($event.target as HTMLInputElement).value))" />
      <span class="text-caption text-n600">כשהסכום זז, כל מסלול מקבל את אותו חלק מההלוואה כמקודם (המסלול האחרון לוקח את מה שנשאר), והריביות והתקופות נשארות.</span>
    </label>

    <!-- The tracks -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <fieldset v-for="(r, i) in rows" :key="r.key" class="min-w-0 rounded-md border border-n200 p-3" :style="{ borderInlineStartWidth: '4px', borderInlineStartColor: COLOURS[i] }">
        <legend class="px-1 text-body-m font-semibold text-n900">מסלול {{ i + 1 }}</legend>
        <div class="flex items-end gap-2">
          <label class="flex min-w-0 flex-1 flex-col">
            <span class="text-caption font-semibold text-n600">סוג המסלול</span>
            <select
              :ref="(el) => { if (el) kindSelects[i] = el as HTMLSelectElement; }"
              v-model="r.kind"
              class="min-h-11 w-full rounded-md border border-n300 bg-n0 px-2 text-body-m text-n900"
              :aria-label="`סוג מסלול ${i + 1}`"
            >
              <option v-for="k in KINDS" :key="k" :value="k">{{ KIND_NAMES[k] }}</option>
            </select>
          </label>
          <button
            v-if="rows.length > 1"
            type="button"
            class="min-h-11 min-w-11 rounded-md border border-n300 px-3 text-body-m text-n700 hover:bg-n50"
            :aria-label="`להסיר את מסלול ${i + 1}`"
            @click="removeTrack(i)"
          >
            הסרה
          </button>
        </div>

        <label v-if="i < rows.length - 1" class="mt-2 flex flex-col">
          <span class="text-body-m text-n800">
            סכום: <span class="ltr font-semibold">{{ formatWholeShekels(r.amount) }}</span> · <span class="ltr">{{ shareOf(i) }}</span> מההלוואה
          </span>
          <input v-model.number="r.amount" type="range" min="0" :max="maxAmount(i)" :step="amountStep" :aria-label="`הסכום במסלול ${i + 1}`" />
        </label>
        <p v-else class="mt-2 min-h-11 text-body-m text-n800">
          סכום (מה שנשאר): <span class="ltr font-semibold">{{ formatWholeShekels(Math.max(rest, 0)) }}</span> · <span class="ltr">{{ shareOf(i) }}</span> מההלוואה
        </p>

        <label class="mt-2 flex flex-col">
          <span class="text-body-m text-n800">אחוז הריבית בהתחלה: <span class="ltr font-semibold">{{ pct(r.rate) }}</span></span>
          <input v-model.number="r.rate" type="range" min="0.5" max="9" step="0.05" :aria-label="`אחוז הריבית במסלול ${i + 1}`" />
        </label>

        <label class="mt-2 flex flex-col">
          <span class="text-body-m text-n800">התקופה: <span class="font-semibold">{{ r.years }} שנים</span></span>
          <input v-model.number="r.years" type="range" min="4" max="30" step="1" :aria-label="`התקופה של מסלול ${i + 1}, בשנים`" />
        </label>

        <div class="mt-2 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" :aria-label="`שיטת ההחזר במסלול ${i + 1}`">
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="r.method === 'spitzer' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="r.method === 'spitzer'" @click="r.method = 'spitzer'">שפיצר</button>
          <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="r.method === 'equal_principal' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="r.method === 'equal_principal'" @click="r.method = 'equal_principal'">קרן שווה</button>
        </div>

        <label v-if="resets(r.kind)" class="mt-2 flex flex-col">
          <span class="text-caption font-semibold text-n600">אחוז הריבית נקבע מחדש כל</span>
          <select v-model.number="r.resetMonths" class="min-h-11 rounded-md border border-n300 bg-n0 px-2 text-body-m text-n900" :aria-label="`כל כמה זמן אחוז הריבית במסלול ${i + 1} נקבע מחדש`">
            <option v-for="m in SUPPORTED_RESET_MONTHS" :key="m" :value="m">{{ yearsText(m) }}</option>
          </select>
        </label>
      </fieldset>
    </div>
    <button
      v-if="rows.length < maxTracks"
      ref="addButton"
      type="button"
      class="mt-3 min-h-11 rounded-md border border-navy px-4 text-body-m font-semibold text-navy hover:bg-n50"
      @click="addTrack"
    >
      להוסיף מסלול
    </button>

    <button v-if="dirty" type="button" class="ms-2 mt-3 min-h-11 rounded-md border border-n300 px-4 text-body-m text-n700 hover:bg-n50" @click="resetAll">
      החזרה למצב ההתחלתי
    </button>

    <!-- The scenario -->
    <div v-if="scenarioPresets" class="mt-4" role="group" aria-label="תרחישים מוכנים">
      <p class="text-caption font-semibold text-n600">תרחישים מוכנים (להמחשה, לא תחזיות)</p>
      <div class="mt-1 flex flex-wrap gap-2">
        <button
          v-for="p in PRESETS"
          :key="p.id"
          type="button"
          class="min-h-11 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="presetOn(p.key) ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="presetOn(p.key)"
          @click="applyPreset(p.key)"
        >
          {{ SCENARIO_NAME_HE[p.key] }}
        </button>
      </div>
    </div>
    <fieldset v-if="editableScenario" class="mt-4 rounded-md border border-n200 p-3">
      <legend class="px-1 text-body-m font-semibold text-n900">התרחיש (להמחשה, לא מה שצפוי לקרות)</legend>
      <div class="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        <label class="flex flex-col">
          <span class="text-body-m text-n800">המדד עולה בשנה: <span class="ltr font-semibold">{{ pct(scenario.inflation) }}</span></span>
          <input v-model.number="scenario.inflation" type="range" min="-1" max="6" step="0.5" aria-label="כמה המדד עולה בשנה" />
        </label>
        <label class="flex flex-col">
          <span class="text-body-m text-n800">הפריים זזה משנה {{ scenario.primeFromYear }}: <span class="ltr font-semibold">{{ points(scenario.primeShift) }}</span> {{ unit(scenario.primeShift) }}</span>
          <input v-model.number="scenario.primeShift" type="range" min="-3" max="4" step="0.25" aria-label="בכמה נקודות אחוז הפריים זזה" />
        </label>
        <label class="flex flex-col">
          <span class="text-body-m text-n800">העוגן בכל נקודת עדכון: <span class="ltr font-semibold">{{ points(scenario.anchorShift) }}</span> {{ unit(scenario.anchorShift) }} מהיום</span>
          <input v-model.number="scenario.anchorShift" type="range" min="-2" max="3" step="0.25" aria-label="בכמה נקודות אחוז העוגן שונה מהיום בכל נקודת עדכון" />
        </label>
      </div>
      <p class="mt-2 text-caption text-n600">המדד עולה באופן אחיד בתוך השנה. העוגן משפיע רק על המסלולים המשתנים, ורק בנקודות העדכון שלהם.</p>
    </fieldset>

    <!-- On a phone the results are far below the sliders: the three headline numbers stay at the bottom of the screen while you move one. -->
    <div v-if="ok" class="sticky bottom-2 z-10 mt-4 grid grid-cols-3 gap-2 rounded-md border border-n200 bg-n0 p-2 shadow-md sm:hidden" aria-hidden="true" data-block="sticky-summary">
      <div class="min-w-0">
        <p class="text-caption leading-tight text-n600">{{ titles.first }}</p>
        <p class="ltr text-body-m font-semibold text-n900">{{ formatWholeShekels(ok.summary.firstPayment) }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-caption leading-tight text-n600">{{ titles.max }}</p>
        <p class="ltr text-body-m font-semibold text-n900">{{ formatWholeShekels(ok.summary.maxPayment) }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-caption leading-tight text-n600">{{ titles.total }}</p>
        <p class="ltr text-body-m font-semibold text-n900">{{ formatWholeShekels(ok.summary.totalPaid) }}</p>
      </div>
    </div>

    <!-- The results -->
    <div role="status" aria-live="polite" class="mt-4">
      <p v-if="!ok" class="rounded-md bg-warning-bg p-3 text-body-m text-n900">{{ "error" in result ? result.error : "" }}</p>
      <template v-else>
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-md bg-n50 p-3">
            <p class="text-caption font-semibold text-n600">{{ titles.first }}</p>
            <p class="ltr mt-1 text-h3 text-n900">{{ formatShekels(ok.summary.firstPayment) }}</p>
            <p class="text-caption text-n600">חודש 1</p>
            <p v-if="compare" class="ltr mt-1 text-caption font-semibold text-n800" data-delta="first">{{ signed(compare.delta.first) }}</p>
          </div>
          <div class="rounded-md bg-n50 p-3">
            <p class="text-caption font-semibold text-n600">{{ titles.max }}</p>
            <p class="ltr mt-1 text-h3 text-n900">{{ formatShekels(ok.summary.maxPayment) }}</p>
            <p class="text-caption text-n600">לראשונה ב{{ whenText(ok.summary.maxMonth) }}</p>
            <p v-if="compare" class="ltr mt-1 text-caption font-semibold text-n800" data-delta="max">{{ signed(compare.delta.max) }}</p>
          </div>
          <div class="rounded-md bg-n50 p-3">
            <p class="text-caption font-semibold text-n600">{{ titles.total }}</p>
            <p class="ltr mt-1 text-h3 text-n900">{{ formatShekels(ok.summary.totalPaid) }}</p>
            <p class="text-caption text-n600">לאורך {{ yearsText(ok.summary.months) }}, בשקלים שעל הנייר</p>
            <p v-if="compare" class="ltr mt-1 text-caption font-semibold text-n800" data-delta="total">{{ signed(compare.delta.total) }}</p>
          </div>
        </div>
        <p v-if="compare" class="mt-2 text-caption text-n600">
          השורה מתחת לכל מספר: ההפרש של התמהיל הזה פחות ״{{ compareName }}״ (פלוס: התמהיל הזה גבוה יותר), באותו תרחיש.
          <template v-if="!sameLoan">שימו לב: ההלוואה בשני התמהילים לא באותו סכום ({{ formatWholeShekels(loanNow) }} מול {{ formatWholeShekels(compare.loan) }}), ולכן ההפרש מערבב בין סכום למבנה. משווים תמהילים על אותה הלוואה.</template>
        </p>

        <div v-if="check" class="mt-3 rounded-md border border-n200 p-3" data-block="limits">
          <p class="text-body-m text-n800">
            יחס ההחזר: <span class="ltr font-semibold">{{ percentString(check.ratio) }}%</span> מההכנסה הפנויה, <span class="ltr">{{ formatWholeShekels(disposableIncome) }}</span>.
            ההחזר שנכנס ליחס (ההחזרים הראשונים של המסלולים, מחוברים{{ (obligations ?? []).length ? ", ועוד החזר של הלוואה על אותו נכס" : "" }}): <span class="ltr font-semibold">{{ formatShekels(check.payment) }}</span>.
          </p>
          <ul v-if="check.lines.length" class="list-reset mt-2 space-y-2">
            <li v-for="l in check.lines" :key="l.id" class="rounded-md border border-n200 p-2">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="text-body-m font-semibold text-n900">{{ ruleOf(l).label }}</span>
                <span class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="lineClass(l)">{{ lineStatus(l) }}</span>
              </div>
              <p class="text-body-m text-n800">
                בתמהיל: <span class="ltr font-semibold">{{ lineActual(l) }}</span>
                <span class="text-n600"> · הקו: {{ lineLimit(l) }} · מרחק: <span class="ltr whitespace-nowrap">{{ lineRoom(l) }}</span></span>
              </p>
            </li>
          </ul>
          <p v-if="check.lines.length" class="mt-2 text-caption text-n600">חמשת הקווים של הוראה 329 כפי שהצוות תעתק אותה (לא אומת). מעל קו ההון אינו איסור.</p>
        </div>
      </template>
    </div>

    <template v-if="ok && chart">
      <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
        <li v-for="(r, i) in rows" :key="r.key" class="flex items-center gap-2">
          <span class="inline-block h-3 w-3 rounded-sm border border-n300" :style="{ background: COLOURS[i] }"></span>{{ trackName(i) }}
        </li>
        <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>החודש של התשלום הגבוה ביותר</li>
        <li v-if="chart.other" class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-[3px] border-dashed border-navy"></span>התשלום של ״{{ compareName }}״</li>
      </ul>
      <figure class="mt-2">
        <figcaption class="text-caption font-semibold text-n600">התשלום של התמהיל בכל חודש, לפי מסלולים</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: התשלום החודשי של התמהיל, ${rows.length} מסלולים זה על גבי זה, לאורך ${yearsText(months)}`">
          <path v-for="(d, k) in chart.areas" :key="rows[k].key" :d="d" :fill="COLOURS[k]" stroke="var(--mogi-n0)" stroke-width="0.75" vector-effect="non-scaling-stroke" />
          <path v-if="chart.other" :d="chart.other" fill="none" stroke="var(--mogi-navy)" stroke-width="2.5" stroke-dasharray="8 4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
          <line :x1="PAD.side" :x2="W - PAD.side" :y1="chart.base" :y2="chart.base" stroke="var(--mogi-n300)" stroke-width="1" />
          <line :x1="chart.maxX" :x2="chart.maxX" :y1="PAD.top" :y2="H - PAD.bottom" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="5 4" />
        </svg>
        <div class="relative h-4 text-caption text-n600" aria-hidden="true">
          <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(t * 12) / W) * 100}%` }">{{ t }}</span>
        </div>
        <p class="mt-1 text-center text-caption text-n600">המספרים מתחת לגרף: שנים מתחילת ההלוואה (מימין לשמאל). כשמסלול נגמר, השכבה שלו נעלמת.</p>
      </figure>

      <h3 class="mt-4 text-body-m font-semibold text-n900">החשיפה: איך ההלוואה מתחלקת</h3>
      <ul class="list-reset mt-2 space-y-2">
        <li v-for="e in exposureRows" :key="e.label">
          <div class="flex flex-wrap justify-between gap-x-3 text-body-m text-n800">
            <span>{{ e.label }}</span>
            <span><span class="ltr font-semibold">{{ pct(e.share) }}</span> · <span class="ltr">{{ formatWholeShekels(e.amount) }}</span></span>
          </div>
          <div class="mt-1 h-2 rounded-pill bg-n100" aria-hidden="true">
            <div class="h-2 rounded-pill bg-teal-deep" :style="{ width: `${Math.min(e.share.toNumber(), 100)}%` }"></div>
          </div>
        </li>
      </ul>
      <p class="mt-2 text-caption text-n600">מסלול יכול להיספר בשתי שורות: קבועה צמודה, למשל, גם צמודה למדד וגם באחוז ריבית קבוע לכל התקופה.</p>

      <template v-if="balanceRows.length">
        <h3 class="mt-4 text-body-m font-semibold text-n900">כמה עוד חייבים</h3>
        <div class="mt-2 overflow-x-auto">
          <table class="w-full border-collapse text-body-m" data-block="balances">
            <thead>
              <tr class="border-b border-n200 text-caption text-n600">
                <th class="py-2 pe-3 text-start font-semibold">אחרי</th>
                <th class="py-2 pe-3 text-start font-semibold">יתרת החוב</th>
                <template v-if="compare">
                  <th class="py-2 pe-3 text-start font-semibold">״{{ compareName }}״</th>
                  <th class="py-2 text-start font-semibold">הפרש</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in balanceRows" :key="b.years" class="border-b border-n100">
                <td class="py-1 pe-3">{{ b.years === 1 ? "שנה" : `${b.years} שנים` }}</td>
                <td class="py-1 pe-3"><span class="ltr whitespace-nowrap font-semibold">{{ formatShekels(b.mine) }}</span></td>
                <template v-if="compare && b.other && b.delta">
                  <td class="py-1 pe-3"><span class="ltr whitespace-nowrap">{{ formatShekels(b.other) }}</span></td>
                  <td class="py-1"><span class="ltr whitespace-nowrap">{{ signed(b.delta) }}</span></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-1 text-caption text-n600">יתרה: מה שעוד חייבים אחרי התשלום של אותו חודש; במסלול צמוד היא כוללת את הפרשי ההצמדה. אפס: ההלוואה כבר נפרעה.</p>
      </template>

      <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
      </button>
      <div v-if="showTable" class="mt-2 max-h-80 overflow-auto">
        <table class="w-full border-collapse text-caption sm:text-body-m">
          <thead class="sticky top-0 bg-n0">
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-2 pe-2 text-start">שנה</th>
              <th class="py-2 pe-2 text-start">התמהיל</th>
              <th v-for="(r, i) in rows" :key="r.key" class="py-2 pe-2 text-start">מסלול {{ i + 1 }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="y in yearRows" :key="y.year" class="border-b border-n100">
              <td class="py-1 pe-2">{{ y.year }}</td>
              <td class="py-1 pe-2 font-semibold"><span class="ltr">{{ formatShekels(y.total) }}</span></td>
              <td v-for="(p, i) in y.byTrack" :key="rows[i].key" class="py-1 pe-2"><span class="ltr">{{ formatShekels(p) }}</span></td>
            </tr>
          </tbody>
        </table>
        <p class="mt-1 text-caption text-n600">התשלום בחודש האחרון של כל שנה: של התמהיל, ושל כל מסלול. אפס — המסלול כבר נגמר.</p>
      </div>
    </template>
  </div>
</template>

<style>
/* The sticky three-number box covers the bottom of the screen on a phone: a focused control is scrolled above it. */
@media (max-width: 639px) {
  html {
    scroll-padding-bottom: 6rem;
  }
}
</style>
