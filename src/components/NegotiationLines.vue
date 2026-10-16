<script setup lang="ts">
// Lesson 6.7's illustration: what is open to negotiation, what one notch is worth in shekels, and
// rounds of asking against the clock.
//   Part 1 — the lines. A table of the lines of a negotiation with a status for each (open by field
//   knowledge, unknown, fixed by regulation, the borrower's right), and for the rate of each track
//   what a notch off it saves: in the first payment and over the loan's life.
//   Part 2 — the rounds. The learner says what each round took off which tracks, sets the family's
//   own line (a round that saves less is not worth the wait), and sees the dates of every round,
//   whether it fits before the terms end (one that does not produces no offer), the offer against
//   the competing offer, and the exercise's advice: stop, or ask again.
// Every number comes from src/lib/calc/outreach.ts (and sensitivity.ts, schedule.ts under it). How
// much a bank moves in a round, and whether it moves at all, is NOT known: the rounds are the
// learner's and the page's assumptions.
import { computed, reactive, ref } from "vue";
import { formatShekelsText } from "../lib/calc/money.ts";
import { effectOf, runRounds, type RoundInput } from "../lib/calc/outreach.ts";
import type { BankCalendar } from "../lib/calc/process.ts";
import type { TrackKind, TrackSpec } from "../lib/calc/schedule.ts";
import type Decimal from "decimal.js";
import { loanOf, measuresOf, scenarioFrom, type ScenarioSpec } from "../lib/calc/sensitivity.ts";

interface Line {
  line: string;
  status: "open" | "unknown" | "fixed" | "right";
  statusText: string;
  text: string;
}
const props = defineProps<{
  bankName: string;
  tracks: TrackSpec[];
  scenario: ScenarioSpec;
  competitor: { name: string; tracks: TrackSpec[] };
  today: string;
  validUntil: string;
  roundDays: number;
  reserve: number;
  closed: string[];
  rounds: { target: string; points: number }[];
  threshold: number;
  lines: Line[];
  note: string;
}>();

const kindName: Record<TrackKind, string> = {
  prime: "פריים",
  variable_unlinked: "משתנה לא צמודה",
  fixed_unlinked: "קבועה לא צמודה",
  fixed_linked: "קבועה צמודה",
  variable_linked: "משתנה צמודה",
};
const calendar = computed<BankCalendar>(() => ({ fridayCounts: true, closed: props.closed }));
const spec = computed(() => scenarioFrom(props.scenario));

// Part 1.
const notch = ref(0.1);
const saving = (target: TrackKind | "all" | number) => {
  const e = effectOf(props.tracks, spec.value, { target, points: String(-notch.value) });
  return { first: e.deltaFirst.neg().toString(), total: e.deltaTotal.neg().toString() };
};
const rows = computed(() => [
  ...props.tracks.map((t, k) => ({ name: kindName[t.kind], amount: t.amount, rate: t.rate, ...saving(k + 1) })),
  { name: "כל המסלולים יחד", amount: loanOf(props.tracks).toString(), rate: "", ...saving("all") },
]);
const chip: Record<Line["status"], string> = { open: "bg-info-bg text-n900", unknown: "bg-n100 text-n800", fixed: "bg-n200 text-n900", right: "bg-success-bg text-n900" };

// Part 2.
const inputs = reactive(props.rounds.map((r) => ({ target: r.target, points: r.points })));
const threshold = ref(props.threshold);
const targets: { value: string; label: string }[] = [
  { value: "all", label: "כל המסלולים" },
  ...Array.from(new Set(props.tracks.map((t) => t.kind))).map((k) => ({ value: k, label: kindName[k] })),
];
const run = computed(() =>
  runRounds(
    props.tracks,
    spec.value,
    inputs.map((i): RoundInput => ({ target: i.target as RoundInput["target"], points: String(i.points) })),
    props.today,
    props.validUntil,
    props.roundDays,
    props.reserve,
    String(threshold.value),
    calendar.value,
  ),
);
const competitorTotal = computed(() => measuresOf(props.competitor.tracks, spec.value).total);
const ownTotalStart = computed(() => measuresOf(props.tracks, spec.value).total);
/** The first round after which the exercise's advice is not "continue". */
const stopAt = computed(() => run.value.findIndex((r) => r.advice !== "continue"));
const lastRun = computed(() => [...run.value].reverse().find((r) => r.fits) ?? null);
const verdict = computed(() => {
  const k = stopAt.value;
  if (k < 0) return { tone: "bg-info-bg", title: "אפשר לבקש עוד סבב", text: "הסבב האחרון חסך יותר מהקו שלכם, ועוד סבב נכנס לפני שהתנאים נגמרים." };
  const r = run.value[k];
  if (r.advice === "time")
    return {
      tone: "bg-warning-bg",
      title: r.fits ? "עוצרים: הסבב הבא לא נכנס בזמן" : `עוצרים: סבב ${r.round} לא נכנס בזמן`,
      text: "סבב שנגמר אחרי שהתנאים נגמרו לא מביא הצעה גרועה יותר: לפי הצוות הוא לא מביא הצעה בכלל, וצריך להתחיל מאישור חדש (מחקר של הצוות, לא כלל כתוב).",
    };
  return { tone: "bg-success-bg", title: `עוצרים אחרי סבב ${r.round}: הוא חסך פחות מהקו שלכם`, text: "עוד סבב עולה זמן, והזמן הוא חלק מהמחיר. הקו הוא שלכם: אפשר להעלות אותו או להוריד אותו." };
});
const dateShort = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" });
const short = (iso: string) => dateShort.format(new Date(`${iso}T12:00:00Z`));
const money = (v: Decimal) => formatShekelsText(v.toString());
const gapText = (total: Decimal) => {
  const gap = total.minus(competitorTotal.value);
  return gap.isNegative() ? { word: "זולה מההצעה המתחרה ב־", amount: gap.abs().toString() } : { word: "יקרה מההצעה המתחרה ב־", amount: gap.toString() };
};
const advice: Record<string, string> = { continue: "אפשר להמשיך", small_gain: "עצרו: חסך מעט", time: "עצרו: אין זמן" };
const showTable = ref(false);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-body-l font-semibold text-n900">שורות המשא ומתן, ומה שווה צעד אחד</p>
    <p class="mt-1 text-caption text-n700">ההצעה של {{ bankName }} לתמהיל שביקשו נועם ושירה (דוגמה לימודית, לא הצעה של בנק).</p>
    <label class="mt-3 flex flex-col gap-1 sm:max-w-sm">
      <span class="text-caption font-semibold text-n600">צעד: <span class="ltr">{{ notch }}</span> נקודות אחוז פחות</span>
      <input v-model.number="notch" type="range" min="0.05" max="0.25" step="0.05" aria-label="גודל הצעד בנקודות אחוז" />
    </label>
    <div class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[26rem] border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">מסלול</th>
            <th class="py-2 pe-2 text-start">ריבית</th>
            <th class="py-2 pe-2 text-start">חיסכון בהחזר הראשון</th>
            <th class="py-2 text-start">חיסכון בסך התשלומים</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.name" class="border-b border-n100">
            <td class="py-1 pe-2 font-semibold text-n900">{{ r.name }}<span class="block text-caption font-normal text-n600"><span class="ltr">{{ formatShekelsText(r.amount) }}</span></span></td>
            <td class="py-1 pe-2"><span v-if="r.rate" class="ltr">{{ r.rate }}%</span><span v-else>—</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ formatShekelsText(r.first) }}</span> בחודש</td>
            <td class="py-1"><span class="ltr">{{ formatShekelsText(r.total) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="list-reset mt-4 grid gap-2">
      <li v-for="l in lines" :key="l.line" class="rounded-md border border-n200 p-3">
        <p class="flex flex-wrap items-center gap-2">
          <span class="text-body-m font-semibold text-n900">{{ l.line }}</span>
          <span class="rounded-pill px-3 py-0.5 text-caption font-semibold" :class="chip[l.status]">{{ l.statusText }}</span>
        </p>
        <p class="mt-1 text-body-m text-n800">{{ l.text }}</p>
      </li>
    </ul>

    <div class="mt-6 rounded-md bg-n50 p-4">
      <p class="text-body-l font-semibold text-n900">סבבים: כמה בנק הזיז, ועד מתי נכנס עוד סבב</p>
      <p class="mt-1 text-caption text-n700">
        כל סבב לוקח {{ roundDays }} ימי עסקים, ונשארים {{ reserve }} ימים אחרי התשובה (כללים של התרגיל, לא של בנק). התנאים של {{ bankName }} עד {{ short(validUntil) }}.
        כמה בנק מזיז בסבב, ואם בכלל: לא ידוע. הערכים כאן הם הנחות שלכם.
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <div v-for="(r, k) in inputs" :key="k" class="rounded-md border border-n200 bg-n0 p-3">
          <p class="text-body-m font-semibold text-n900">סבב {{ k + 1 }}: הבנק הוריד</p>
          <label class="mt-1 flex flex-col gap-1">
            <span class="text-caption text-n700"><span class="ltr">{{ r.points }}</span> נקודות אחוז</span>
            <input v-model.number="r.points" type="range" min="0" max="0.3" step="0.05" :aria-label="`סבב ${k + 1}: כמה נקודות אחוז הבנק הוריד`" />
          </label>
          <label class="mt-1 flex flex-col gap-1">
            <span class="text-caption text-n700">ממה</span>
            <select v-model="r.target" class="h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900" :aria-label="`סבב ${k + 1}: מאילו מסלולים`">
              <option v-for="t in targets" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </label>
        </div>
      </div>
      <label class="mt-3 flex flex-col gap-1 sm:max-w-sm">
        <span class="text-caption font-semibold text-n600">הקו שלכם: סבב שחוסך פחות מ־<span class="ltr">{{ formatShekelsText(String(threshold)) }}</span> בסך התשלומים לא שווה עוד המתנה</span>
        <input v-model.number="threshold" type="range" min="0" max="40000" step="1000" aria-label="הקו שלכם בשקלים" />
      </label>

      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[34rem] border-collapse text-caption sm:text-body-m">
          <thead>
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-2 pe-2 text-start">סבב</th>
              <th class="py-2 pe-2 text-start">מתי</th>
              <th class="py-2 pe-2 text-start">חסך</th>
              <th class="py-2 pe-2 text-start">מול ההצעה של {{ competitor.name }}</th>
              <th class="py-2 text-start">מה אומר הכלל</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in run" :key="r.round" class="border-b border-n100 align-top">
              <td class="py-1 pe-2 font-semibold text-n900">{{ r.round }}</td>
              <td class="py-1 pe-2">{{ short(r.start) }} → {{ short(r.answer) }}<span v-if="!r.fits" class="block text-n700">לא נכנס: אין הצעה</span></td>
              <td class="py-1 pe-2"><span class="ltr">{{ money(r.gainTotal) }}</span></td>
              <td class="py-1 pe-2">{{ gapText(r.totalAfter).word }}<span class="ltr">{{ formatShekelsText(gapText(r.totalAfter).amount) }}</span></td>
              <td class="py-1">{{ advice[r.advice] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-caption text-n700">
        בלי סבבים: ההצעה של {{ bankName }} {{ gapText(ownTotalStart).word }}<span class="ltr">{{ formatShekelsText(gapText(ownTotalStart).amount) }}</span>.
        <template v-if="lastRun">אחרי הסבב האחרון שנכנס: ההחזר הראשון <span class="ltr">{{ money(lastRun.firstAfter) }}</span>.</template>
      </p>

      <div class="mt-3 rounded-md p-3" :class="verdict.tone" aria-live="polite">
        <p class="text-body-m font-semibold text-n900">{{ verdict.title }}</p>
        <p class="mt-1 text-body-m text-n800">{{ verdict.text }}</p>
      </div>
    </div>

    <p class="mt-3 text-caption text-n600">{{ note }}</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[26rem] border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">שורה</th>
            <th class="py-2 pe-2 text-start">מצב</th>
            <th class="py-2 text-start">מה ידוע</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in lines" :key="l.line" class="border-b border-n100 align-top">
            <td class="py-1 pe-2 font-semibold text-n900">{{ l.line }}</td>
            <td class="py-1 pe-2">{{ l.statusText }}</td>
            <td class="py-1">{{ l.text }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
