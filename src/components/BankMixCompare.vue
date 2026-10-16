<script setup lang="ts">
// Lesson 6.8's illustration: the mix the family asked for next to the mix a bank came back with.
// The bank is fictional and so are its prices (src/data/case-a-offers.ts); each counter is priced at
// its own bank's list and set against the family's request priced at the SAME bank, so the only
// thing that differs is the mix. The learner picks a counter and the goal that matters most to the
// family, and reads the measures of lesson 5.6 (the first payment, the total, how far the payment
// can rise in the harsh scenario) and the ratio, with who is better on each. Below, in its own
// box, a toy: what the two mixes would be worth to a bank under INVENTED costs of funds. Every
// number comes from outreach.ts / sensitivity.ts through case-a-offers.ts; the component does none.
import { computed, nextTick, ref } from "vue";
import { BANK_NAME, bankMargin, better, COUNTERS, counterTracks, EXERCISE_COST_OF_FUNDS, LOWER_IS_BETTER, priced, readMix, REQUESTED, type ReadKey } from "../data/case-a-offers.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { shareOf } from "../lib/calc/mix.ts";
import { KIND_NAME_HE as KIND_HE } from "../data/case-a-mix.ts";
import type { TrackKind, TrackSpec } from "../lib/calc/schedule.ts";
import { loanOf } from "../lib/calc/sensitivity.ts";
import { PTI_CAPITAL_THRESHOLD } from "../lib/calc/regulation.ts";

defineProps<{ note: string }>();

type Goal = "payment" | "total" | "stability";
const goals: { id: Goal; label: string; key: ReadKey }[] = [
  { id: "payment", label: "החזר חודשי נמוך", key: "first" },
  { id: "total", label: "סך תשלומים נמוך", key: "total" },
  { id: "stability", label: "יציבות: חשיפה קטנה", key: "rise" },
];

const pick = ref(COUNTERS[0].id);
const goal = ref<Goal>("payment");
const showTable = ref(false);
function onKey(e: KeyboardEvent, i: number) {
  const n = COUNTERS.length;
  // In a right-to-left page the first tab is on the right: ArrowLeft moves to the next one.
  const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
  const to = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : step ? (i + step + n) % n : -1;
  if (to < 0) return;
  e.preventDefault();
  pick.value = COUNTERS[to].id;
  nextTick(() => document.getElementById(`mix-tab-${COUNTERS[to].id}`)?.focus());
}
const counter = computed(() => COUNTERS.find((c) => c.id === pick.value) ?? COUNTERS[0]);
const requestedTracks = computed(() => priced(counter.value.bank, REQUESTED));
const counterTracksNow = computed(() => counterTracks(counter.value.id));
const a = computed(() => readMix(requestedTracks.value));
const b = computed(() => readMix(counterTracksNow.value));
const marginA = computed(() => bankMargin(requestedTracks.value));
const marginB = computed(() => bankMargin(counterTracksNow.value));
const goalKey = computed(() => goals.find((g) => g.id === goal.value)?.key ?? "first");
const who = (key: ReadKey) => better(a.value, b.value, key);
const whoWord = (w: string) => (w === "requested" ? "מה שביקשתם" : w === "counter" ? "ההצעה הנגדית" : "אותו דבר");
const whoTone = (w: string) => (w === "requested" ? "bg-info-bg" : w === "counter" ? "bg-success-bg" : "bg-n100");

const kindColour: Record<TrackKind, { bg: string; fg: string }> = {
  prime: { bg: "var(--mogi-teal-deep)", fg: "var(--mogi-n0)" },
  variable_unlinked: { bg: "var(--mogi-turquoise-2)", fg: "var(--mogi-n900)" },
  fixed_unlinked: { bg: "var(--mogi-n300)", fg: "var(--mogi-n900)" },
  fixed_linked: { bg: "var(--mogi-navy)", fg: "var(--mogi-n0)" },
  variable_linked: { bg: "var(--mogi-mint)", fg: "var(--mogi-n900)" },
};
function shares(tracks: TrackSpec[]) {
  const loan = loanOf(tracks);
  return tracks.map((t) => ({ kind: t.kind, amount: String(t.amount), rate: String(t.rate), pct: shareOf(t.amount, loan).toNumber() }));
}
const sharesA = computed(() => shares(requestedTracks.value));
const sharesB = computed(() => shares(counterTracksNow.value));
const pct = (n: number) => `${Math.round(n)}%`;

const costs = EXERCISE_COST_OF_FUNDS as Record<TrackKind, string>;
const pctText = (d: { toFixed(n: number): string }) => `${d.toFixed(2).replace(/\.?0+$/, "")}%`;
const money = (d: { toString(): string }) => formatShekelsText(d.toString());
const moneyExact = (d: { toString(): string }) => formatShekels(d.toString());
const rows = computed(() => [
  { key: "first" as ReadKey, label: "החזר ראשון", a: money(a.value.first), b: money(b.value.first), unit: "בחודש" },
  { key: "total" as ReadKey, label: "סך התשלומים (תרחיש בסיס)", a: money(a.value.total), b: money(b.value.total), unit: "" },
  { key: "rise" as ReadKey, label: "כמה ההחזר יכול לעלות (תרחיש מחמיר)", a: money(a.value.rise), b: money(b.value.rise), unit: "מעל ההחזר הראשון" },
  { key: "ratio" as ReadKey, label: "יחס ההחזר", a: pctText(a.value.ratio), b: pctText(b.value.ratio), unit: `סף ההון: ${PTI_CAPITAL_THRESHOLD}%` },
]);
const verdict = computed(() => {
  const g = goals.find((x) => x.id === goal.value);
  const w = who(goalKey.value);
  const others = LOWER_IS_BETTER.filter((m) => m.key !== goalKey.value && who(m.key) === "requested");
  const lead =
    w === "counter"
      ? `ביעד ״${g?.label}״ ההצעה הנגדית טובה יותר.`
      : w === "requested"
        ? `ביעד ״${g?.label}״ מה שביקשתם טוב יותר.`
        : `ביעד ״${g?.label}״ אין הבדל.`;
  const cost = w === "counter" && others.length ? ` המחיר: מה שביקשתם טוב יותר במדדים האלה: ${others.map((o) => o.label).join(", ")}.` : "";
  return lead + cost;
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n700">{{ note }}</p>

    <div role="tablist" aria-label="ההצעות הנגדיות" class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="(c, i) in COUNTERS"
        :key="c.id"
        type="button"
        role="tab"
        :id="`mix-tab-${c.id}`"
        :aria-selected="pick === c.id"
        :tabindex="pick === c.id ? 0 : -1"
        @keydown="onKey($event, i)"
        class="min-h-11 rounded-md border px-3 py-2 text-start text-body-m transition-colors duration-fast ease-out"
        :class="pick === c.id ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 bg-n0 text-n800 hover:bg-n50'"
        @click="pick = c.id"
      >
        {{ BANK_NAME[c.bank] }}: {{ c.name }}
      </button>
    </div>
    <p class="mt-2 text-body-m text-n800">{{ counter.note }}.</p>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div v-for="(side, k) in [{ title: 'מה ביקשתם', list: sharesA }, { title: 'מה הבנק הציע', list: sharesB }]" :key="k">
        <p class="text-caption font-semibold text-n600">{{ side.title }} ({{ BANK_NAME[counter.bank] }}, במחירים שלו)</p>
        <div class="mt-1 flex h-10 overflow-hidden rounded-md border border-n200" role="img" :aria-label="`${side.title}: ${side.list.map((s) => `${KIND_HE[s.kind]} ${pct(s.pct)}`).join(', ')}`">
          <span
            v-for="s in side.list"
            :key="s.kind"
            class="flex items-center justify-center overflow-hidden text-caption font-semibold"
            :style="{ width: `${s.pct}%`, background: kindColour[s.kind].bg, color: kindColour[s.kind].fg }"
          >
            <span v-if="s.pct >= 15">{{ pct(s.pct) }}</span>
          </span>
        </div>
        <ul class="list-reset mt-1 grid gap-0.5 text-caption text-n700">
          <li v-for="s in side.list" :key="s.kind" class="flex items-center gap-2">
            <span class="inline-block h-3 w-3 shrink-0 rounded-sm border border-n300" :style="{ background: kindColour[s.kind].bg }"></span>
            <span>{{ KIND_HE[s.kind] }}: <span class="ltr">{{ formatShekelsText(s.amount) }} · {{ s.rate }}%</span></span>
          </li>
        </ul>
      </div>
    </div>

    <fieldset class="mt-5">
      <legend class="text-caption font-semibold text-n600">מה הכי חשוב למשפחה?</legend>
      <div class="mt-1 flex flex-wrap gap-x-4">
        <label v-for="g in goals" :key="g.id" class="flex min-h-11 items-center gap-2 text-body-m text-n800"><input v-model="goal" type="radio" :value="g.id" class="h-5 w-5" /> {{ g.label }}</label>
      </div>
    </fieldset>

    <div class="sticky top-2 z-sticky mt-3 rounded-md border border-n200 bg-n50 p-3 shadow-sm" aria-live="polite">
      <p class="text-body-m font-semibold text-n900">{{ verdict }}</p>
      <p class="mt-1 text-caption text-n700">אין מנצחת אחת: ההצעה טובה או לא טובה ביחס ליעד. ואם היא מתאימה ליעד של המשפחה, עדיין שואלים מה היא העבירה למשפחה.</p>
    </div>

    <div class="mt-3 grid gap-2">
      <div v-for="r in rows" :key="r.key" class="rounded-md border p-3" :class="r.key === goalKey ? 'border-navy bg-n50' : 'border-n200'">
        <p class="text-caption font-semibold text-n600">{{ r.label }}<span v-if="r.unit" class="font-normal"> · {{ r.unit }}</span></p>
        <div class="mt-1 grid grid-cols-2 gap-3">
          <p class="text-body-m text-n900"><span class="block text-caption text-n600">מה שביקשתם</span><span class="ltr font-semibold whitespace-nowrap">{{ r.a }}</span></p>
          <p class="text-body-m text-n900"><span class="block text-caption text-n600">ההצעה הנגדית</span><span class="ltr font-semibold whitespace-nowrap">{{ r.b }}</span></p>
        </div>
        <p class="mt-2 inline-block rounded-pill px-3 py-1 text-caption font-semibold text-n900" :class="whoTone(who(r.key))">{{ who(r.key) === "same" ? "אין הבדל" : `טוב יותר: ${whoWord(who(r.key))}` }}</p>
      </div>
      <div class="rounded-md border border-n200 p-3">
        <p class="text-caption font-semibold text-n600">מגבלות הוראה 329</p>
        <p class="mt-1 text-body-m text-n800">
          מה שביקשתם: {{ a.passes ? "עומד בכולן" : "חוצה איסור" }}. ההצעה הנגדית: {{ b.passes ? "עומדת בכולן" : "חוצה איסור" }}.
          <span class="text-n700">חלק ההלוואה שאינו קבוע לתקופה: <span class="ltr">{{ pctText(a.variableShare) }}</span> מול <span class="ltr">{{ pctText(b.variableShare) }}</span>. חלק צמוד למדד: <span class="ltr">{{ pctText(a.linkedShare) }}</span> מול <span class="ltr">{{ pctText(b.linkedShare) }}</span>.</span>
        </p>
      </div>
    </div>

    <div class="mt-4 rounded-md border border-dashed border-n300 p-3">
      <p class="text-body-m font-semibold text-n900">מבט של הבנק: תרגיל, עם עלויות מומצאות</p>
      <p class="mt-1 text-caption text-n700">הבנק מרוויח מההפרש בין הריבית שהוא גובה למה שהכסף עולה לו, והוא שונה בכל סוג מסלול. את העלויות שלו אנחנו לא יודעים, וכאן הן מומצאות:</p>
      <ul class="list-reset mt-1 grid gap-0.5 text-caption text-n700">
        <li v-for="(v, k) in costs" :key="k">{{ KIND_HE[k] }}: <span class="ltr">{{ v }}%</span></li>
      </ul>
      <p class="mt-2 text-body-m text-n800">
        לפי הכללים האלה, ההפרש בשנה הראשונה (בלי להתחשב בקרן שמוחזרת): <span class="ltr font-semibold">{{ moneyExact(marginA) }}</span> במה שביקשתם, ו־<span class="ltr font-semibold">{{ moneyExact(marginB) }}</span> בהצעה הנגדית.
      </p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[26rem] border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">מדד</th>
            <th class="py-2 pe-2 text-start">מה שביקשתם</th>
            <th class="py-2 pe-2 text-start">ההצעה הנגדית</th>
            <th class="py-2 text-start">מי טוב יותר</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.key" class="border-b border-n100">
            <td class="py-1 pe-2 font-semibold text-n900">{{ r.label }}</td>
            <td class="py-1 pe-2"><span class="ltr">{{ r.a }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ r.b }}</span></td>
            <td class="py-1">{{ whoWord(who(r.key)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
