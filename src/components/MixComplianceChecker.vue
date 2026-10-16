<script setup lang="ts">
// The compliance checker on a mix (בודק עמידה על תמהיל), lesson 5.10. Lesson
// 4.4's checker takes one loan and its sums; this one takes the mix itself: the
// learner sets each track's amount, rate and term, and the checker adds them
// up the way lessons 4.3 and 4.4 say — the payment of the ratio is the tracks'
// first payments added, the part that can change is the sum of the prime and
// variable tracks, the term is the longest track's — then shows the five lines.
// Two rows are not lines: a bank's policy, which no calculation can see, and
// where the rates came from, because a mix whose rates were taken from several
// banks' offers is not an offer of any of them. All arithmetic is mixcheck.ts
// (and, through it, regulation.ts and affordability.ts).
import { computed, ref } from "vue";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { type MixTrack, type TrackType, canChange, checkMix } from "../lib/calc/mixcheck.ts";
import { type DealType, type LineResult, LTV_CEILINGS, RULES, withMinus } from "../lib/calc/regulation.ts";

interface PresetTrack {
  label: string;
  type: TrackType;
  amount: number;
  rate: number;
  years: number;
}
interface Preset {
  id: string;
  label: string;
  deal: DealType;
  value: number;
  income: number;
  /** "one": every rate comes from one bank's offer. "mixed": the rates were picked from several offers. "assumed": the rates are the course's assumption, no bank has offered them. */
  source: "one" | "mixed" | "assumed";
  tracks: PresetTrack[];
}
interface Deal {
  id: DealType;
  label: string;
}
const props = defineProps<{ presets: Preset[]; deals: Deal[]; note: string }>();

const presetId = ref(props.presets[0].id);
const first = props.presets[0];
const deal = ref<DealType>(first.deal);
const value = ref(first.value);
const income = ref(first.income);
const source = ref<"one" | "mixed" | "assumed">(first.source);
const tracks = ref<PresetTrack[]>(first.tracks.map((t) => ({ ...t })));
const showTable = ref(false);

function load(id: string) {
  const p = props.presets.find((x) => x.id === id) ?? props.presets[0];
  presetId.value = p.id;
  deal.value = p.deal;
  value.value = p.value;
  income.value = p.income;
  source.value = p.source;
  tracks.value = p.tracks.map((t) => ({ ...t }));
}

const AMOUNT_MAX = 3000000;
const STEP = 1000;
const mix = computed<MixTrack[]>(() => tracks.value.map((t) => ({ label: t.label, type: t.type, amount: String(Math.max(STEP, t.amount)), ratePercent: String(t.rate), months: t.years * 12 })));
const result = computed(() => checkMix(mix.value, { deal: deal.value, value: value.value, disposableIncome: income.value }));
const lines = computed<LineResult[]>(() => result.value.lines);
const crossed = computed(() => lines.value.filter((l) => l.status === "over"));
const above = computed(() => lines.value.some((l) => l.status === "above"));
const ratio = computed(() => lines.value.find((l) => l.id === "pti")!.actual);
const ruleOf = (l: LineResult) => RULES.find((r) => r.id === l.id)!;

const isTerm = (l: LineResult) => l.id === "term";
const statusText = (l: LineResult) => (l.status === "over" ? "חוצה — אסור" : l.status === "above" ? "מעל קו ההון — מותר" : "בתוך הקו");
const statusClass = (l: LineResult) => (l.status === "over" ? "bg-danger-bg" : l.status === "above" ? "bg-warning-bg" : "bg-success-bg");
const actualText = (l: LineResult) => (isTerm(l) ? `${l.actual.toNumber() / 12} שנים` : `${percentString(l.actual)}%`);
const limitText = (l: LineResult) => (isTerm(l) ? `עד ${l.limit.toNumber() / 12} שנה` : l.id === "variable" ? "עד שני שלישים" : `${percentString(l.limit)}%`);
const roomText = (l: LineResult) => (isTerm(l) ? `${withMinus(String(l.room.toNumber()))} חודשים` : withMinus(formatShekels(l.room)));
const typeLabel = (t: TrackType) =>
  ({ fixed_unlinked: "קבועה לא צמודה", fixed_linked: "קבועה צמודה", prime: "פריים", variable_unlinked: "משתנה לא צמודה", variable_linked: "משתנה צמודה" })[t];

const verdict = computed(() => {
  if (crossed.value.length) return { tone: "bg-danger-bg", text: `התמהיל חוצה ${crossed.value.length === 1 ? "איסור אחד" : `${crossed.value.length} איסורים`}: ${crossed.value.map((l) => ruleOf(l).label).join(", ")}. בנק לא יכול לאשר אותו כך, ולכן הוא לא ריאלי.` };
  if (source.value === "mixed") return { tone: "bg-warning-bg", text: "התמהיל עומד בחמשת הקווים, אבל הריביות בו נלקחו מכמה הצעות. אף בנק לא הציע אותו, ולכן הוא לא ריאלי כמו שהוא." };
  if (source.value === "assumed") return { tone: "bg-n50", text: `התמהיל לא חוצה איסור${above.value ? ", והחזר מעל קו ההון הוא מותר אבל הבנק מחזיק יותר הון" : ""}. הריביות בו הן הנחה של הקורס, ועוד אין הצעה של בנק: בלי הצעה אי אפשר לדעת אם הוא ריאלי.` };
  return { tone: "bg-n50", text: `התמהיל לא חוצה אף איסור${above.value ? ", והחזר מעל קו ההון הוא מותר אבל הבנק מחזיק יותר הון" : ""}. מדיניות הבנק עוד לא ידועה, ולכן ריאלי לא אומר מאושר.` };
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">{{ note }}</p>

    <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="תמהילים מוכנים">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        class="min-h-11 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
        :class="presetId === p.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        :aria-pressed="presetId === p.id"
        @click="load(p.id)"
      >
        {{ p.label }}
      </button>
      <button type="button" class="min-h-11 rounded-md border border-n300 px-3 py-1 text-body-m text-navy" @click="load(presetId)">איפוס התמהיל</button>
    </div>

    <ol class="list-reset mt-4 space-y-3">
      <li v-for="(t, i) in tracks" :key="i" class="rounded-md border border-n200 p-3">
        <p class="text-body-m font-semibold text-n900">
          {{ typeLabel(t.type) }}
          <span class="text-caption font-normal text-n600">· {{ canChange(t.type) ? "הריבית יכולה להשתנות" : "הריבית קבועה" }}</span>
        </p>
        <div class="mt-2 grid gap-3 sm:grid-cols-3">
          <label class="flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">הסכום</span>
            <input v-model.number="t.amount" type="range" :min="STEP" :max="AMOUNT_MAX" :step="STEP" />
            <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(t.amount) }}</span></span>
            <input
              v-model.number="t.amount"
              type="number"
              inputmode="numeric"
              :min="STEP"
              :max="AMOUNT_MAX"
              :step="STEP"
              :aria-label="`הסכום של מסלול ${typeLabel(t.type)}, בשקלים, בהקלדה`"
              class="ltr min-h-11 rounded-md border border-n300 px-2 text-body-m text-n900"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">הריבית בחוזה, בשנה</span>
            <input v-model.number="t.rate" type="range" min="1" max="9" step="0.05" />
            <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ t.rate }}%</span></span>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-caption font-semibold text-n600">התקופה</span>
            <input v-model.number="t.years" type="range" min="5" max="35" step="1" />
            <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ t.years }}</span> שנים</span>
          </label>
        </div>
      </li>
    </ol>

    <fieldset class="mt-4">
      <legend class="text-caption font-semibold text-n600">סוג העסקה</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label
          v-for="d in deals"
          :key="d.id"
          class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="deal === d.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        >
          <input v-model="deal" type="radio" name="mix-checker-deal" :value="d.id" class="accent-teal-deep" />
          <span>{{ d.label }} · תקרה <span class="ltr">{{ LTV_CEILINGS[d.id] }}%</span></span>
        </label>
      </div>
    </fieldset>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שווי הנכס</span>
        <input v-model.number="value" type="range" min="500000" max="4000000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(value) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההכנסה הפנויה (שיעור 4.2)</span>
        <input v-model.number="income" type="range" min="5000" max="50000" step="500" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(income) }}</span></span>
      </label>
    </div>

    <fieldset class="mt-4">
      <legend class="text-caption font-semibold text-n600">מאיפה באו הריביות</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label
          v-for="s in [{ id: 'one', label: 'כולן מהצעה אחת של בנק אחד' }, { id: 'mixed', label: 'נלקחו מכמה הצעות, הטובה בכל מסלול' }, { id: 'assumed', label: 'הנחה של הקורס, בלי הצעה' }]"
          :key="s.id"
          class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="source === s.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        >
          <input v-model="source" type="radio" name="mix-checker-source" :value="s.id" class="accent-teal-deep" />
          <span>{{ s.label }}</span>
        </label>
      </div>
    </fieldset>

    <p class="sticky bottom-2 z-10 mt-4 rounded-md border border-n200 p-3 text-body-m text-n800 shadow-md sm:static sm:shadow-none" :class="verdict.tone" role="status">
      {{ verdict.text }}
    </p>

    <p class="mt-4 text-body-m text-n800">
      ההלוואה: <span class="ltr font-semibold">{{ formatShekelsText(result.loan) }}</span>. ההחזר שנכנס ליחס (ההחזרים הראשונים של המסלולים, מחוברים):
      <span class="ltr font-semibold">{{ formatShekels(result.payment) }}</span>, כלומר <span class="ltr font-semibold">{{ percentString(ratio) }}%</span> מההכנסה הפנויה.
    </p>

    <ol class="list-reset mt-3 space-y-3">
      <li v-for="l in lines" :key="l.id" class="rounded-md border border-n200 p-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-body-m font-semibold text-n900">
            {{ ruleOf(l).label }}
            <span class="text-caption font-normal text-n600">· {{ l.kind === "capital_threshold" ? "קו הון, לא איסור" : "איסור" }}</span>
          </p>
          <span class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="statusClass(l)">{{ statusText(l) }}</span>
        </div>
        <p class="mt-1 text-body-m text-n800">
          בתמהיל: <span class="ltr font-semibold">{{ actualText(l) }}</span>
          <span class="text-n600"> · הקו: {{ limitText(l) }} · מרחק: <span class="ltr whitespace-nowrap">{{ roomText(l) }}</span></span>
        </p>
      </li>
      <li class="rounded-md border border-dashed border-n300 p-3">
        <p class="text-body-m font-semibold text-n900">מדיניות הבנק <span class="text-caption font-normal text-n600">· לא קו, ולא ניתן לחישוב מבחוץ</span></p>
        <p class="mt-1 text-body-m text-n700">לא ידוע. אפשר ללמוד אותה רק מהצעה, או מתשובה של בנק.</p>
      </li>
      <li class="rounded-md border p-3" :class="source === 'mixed' ? 'border-warning bg-warning-bg' : 'border-n200'">
        <p class="text-body-m font-semibold text-n900">מאיפה הריביות</p>
        <p class="mt-1 text-body-m text-n800">{{ source === "mixed" ? "הריביות נלקחו מכמה הצעות: אין בנק שהציע את הצירוף הזה." : source === "assumed" ? "הריביות הן הנחה של הקורס: עוד אין הצעה של בנק." : "כל הריביות מהצעה אחת של בנק אחד." }}</p>
      </li>
    </ol>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">הקו</th>
            <th class="py-1 pe-3 text-start font-semibold">בתמהיל</th>
            <th class="py-1 pe-3 text-start font-semibold">הקו עצמו</th>
            <th class="py-1 pe-3 text-start font-semibold">מצב</th>
            <th class="py-1 text-start font-semibold">מרחק מהקו</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in lines" :key="l.id" class="border-b border-n100 align-top">
            <th class="py-1 pe-3 text-start font-normal text-n700">{{ ruleOf(l).label }}</th>
            <td class="py-1 pe-3"><span class="ltr">{{ actualText(l) }}</span></td>
            <td class="py-1 pe-3">{{ limitText(l) }}</td>
            <td class="py-1 pe-3">{{ statusText(l) }}</td>
            <td class="py-1"><span class="ltr whitespace-nowrap">{{ roomText(l) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
