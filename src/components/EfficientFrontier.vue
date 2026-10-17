<script setup lang="ts">
// The efficient-frontier illustration (lesson 8.15). The learner picks two of the three goals for the picture,
// can switch the client's own limit on, and moves three weights; the page shows which candidates nobody beats
// (the frontier of the feasible set), which one the weights choose, and why a dominated point was dropped.
// Every number is a candidate's value handed in as a prop (computed by the lesson's facts); the frontier and
// the weighted pick are computed here by the course's frontier.ts. Synthetic data, weights for illustration.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { frontier, pickByWeights } from "../lib/calc/frontier.ts";
import type { Row } from "../lib/calc/objectives.ts";

interface Cand {
  id: string;
  name: string;
  first: string;
  total: string;
  rise: string;
  /** Feasible with the client's own limits too. */
  clientOk: boolean;
}
const props = withDefaults(defineProps<{ candidates: Cand[]; limitLabel?: string; start?: { x: number; y: number } }>(), {
  limitLabel: "ההחזר הראשון עד 8,300 ₪",
  start: () => ({ x: 0, y: 1 }),
});

const GOALS = [
  { key: "first" as const, label: "החזר ראשון", unit: "₪ בחודש" },
  { key: "total" as const, label: "סך תשלומים", unit: "₪ בסך הכול" },
  { key: "rise" as const, label: "חשיפה", unit: "₪ מעל ההחזר הראשון" },
];
const xi = ref(props.start.x);
const yi = ref(props.start.y);
const limit = ref(false);
const w = ref([20, 20, 20]);
const sel = ref<string | null>(null);
const showTable = ref(false);

const rows = computed<Row[]>(() =>
  props.candidates.map((c) => ({ id: c.id, values: [c.first, c.total, c.rise], feasible: limit.value ? c.clientOk : true })),
);
const pair = computed(() => (xi.value === yi.value ? [xi.value] : [xi.value, yi.value]));
const front = computed(() => frontier(rows.value, pair.value));
const front3 = computed(() => frontier(rows.value));
const frontOf = (id: string) => front.value.find((r) => r.id === id)!;
const front3Of = (id: string) => front3.value.find((r) => r.id === id)!;
const picked = computed(() => (w.value.some((x) => x > 0) ? pickByWeights(rows.value, w.value) : undefined));
const nameOf = (id: string) => props.candidates.find((c) => c.id === id)?.name ?? id;
const candOf = (id: string) => props.candidates.find((c) => c.id === id)!;
const valueOf = (c: Cand, k: number) => [c.first, c.total, c.rise][k];
const nEff = computed(() => front.value.filter((r) => r.efficient).length);
const nEff3 = computed(() => front3.value.filter((r) => r.efficient).length);
const nFeasible = computed(() => rows.value.filter((r) => r.feasible).length);

// Geometry. Smaller is better on both axes; the origin side is the best side: x runs leftward (Hebrew reading
// direction), y runs upward.
const W = 640;
const H = 340;
const PAD = { l: 14, r: 14, t: 16, b: 16 };
const range = (k: number) => {
  const v = props.candidates.map((c) => new Decimal(valueOf(c, k)).toNumber());
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return { lo, hi: hi === lo ? lo + 1 : hi };
};
const px = (c: Cand) => {
  const r = range(xi.value);
  return W - PAD.r - ((new Decimal(valueOf(c, xi.value)).toNumber() - r.lo) / (r.hi - r.lo)) * (W - PAD.l - PAD.r);
};
const py = (c: Cand) => {
  const r = range(yi.value);
  return H - PAD.b - ((new Decimal(valueOf(c, yi.value)).toNumber() - r.lo) / (r.hi - r.lo)) * (H - PAD.t - PAD.b);
};
const dots = computed(() =>
  props.candidates.map((c) => {
    const f = frontOf(c.id);
    const feasible = rows.value.find((r) => r.id === c.id)!.feasible;
    return { c, x: px(c), y: py(c), feasible, efficient: f.efficient, chosen: picked.value?.id === c.id };
  }),
);
const frontLine = computed(() => {
  if (pair.value.length < 2) return "";
  return dots.value
    .filter((d) => d.efficient)
    .sort((a, b) => b.x - a.x)
    .map((d) => `${d.x},${d.y}`)
    .join(" ");
});
const show = (c: Cand, k: number) => {
  const v = valueOf(c, k);
  return formatWholeShekels(v);
};
const selected = computed(() => (sel.value ? candOf(sel.value) : null));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הציר האופקי</span>
        <select v-model.number="xi" class="min-h-11 rounded-md border border-n300 bg-n0 px-3 text-body-m">
          <option v-for="(g, k) in GOALS" :key="g.key" :value="k">{{ g.label }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הציר האנכי</span>
        <select v-model.number="yi" class="min-h-11 rounded-md border border-n300 bg-n0 px-3 text-body-m">
          <option v-for="(g, k) in GOALS" :key="g.key" :value="k">{{ g.label }}</option>
        </select>
      </label>
    </div>
    <p v-if="xi === yi" class="mt-2 text-caption text-n700">בחרתם את אותו יעד בשני הצירים: החזית היא הנקודה (או הנקודות) הנמוכה ביותר ביעד הזה.</p>

    <label class="mt-4 flex min-h-11 items-center gap-3 text-body-m text-n800">
      <input v-model="limit" type="checkbox" class="h-5 w-5" />
      <span>להוסיף את הגבול של הלקוח: {{ limitLabel }}</span>
    </label>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <label v-for="(g, k) in GOALS" :key="g.key" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">משקולת: {{ g.label }}</span>
        <input v-model.number="w[k]" type="range" min="0" max="100" step="5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ w[k] }}</span></span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">מועמדים אפשריים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ nFeasible }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">על החזית בשני היעדים שבתמונה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ nEff }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">על החזית בשלושת היעדים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ nEff3 }}</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-teal-deep)"></span>על החזית בשני היעדים שבתמונה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-n300)"></span>נשלט: יש מועמד טוב ממנו בשני היעדים</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full border-2" style="border-color: var(--mogi-navy)"></span>הנבחר לפי המשקולות</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full border border-dashed" style="border-color: var(--mogi-n400)"></span>לא אפשרי (מחוץ לגבול של הלקוח)</li>
    </ul>

    <div class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`גרף: ${GOALS[xi].label} מול ${GOALS[yi].label} של ${candidates.length} מועמדים`">
        <polyline v-if="frontLine" :points="frontLine" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="1.5" stroke-dasharray="4 3" />
        <g v-for="d in dots" :key="d.c.id" tabindex="0" role="button" :aria-label="`${d.c.name}`" @click="sel = d.c.id" @keydown.enter="sel = d.c.id" @focus="sel = d.c.id">
          <circle :cx="d.x" :cy="d.y" r="16" fill="transparent" />
          <circle
            :cx="d.x"
            :cy="d.y"
            :r="d.chosen ? 9 : 6"
            :fill="!d.feasible ? 'var(--mogi-n0)' : d.efficient ? 'var(--mogi-teal-deep)' : 'var(--mogi-n300)'"
            :stroke="d.chosen ? 'var(--mogi-navy)' : !d.feasible ? 'var(--mogi-n400)' : 'none'"
            :stroke-width="d.chosen ? 3 : 1.5"
            :stroke-dasharray="!d.feasible ? '2 2' : undefined"
          />
        </g>
      </svg>
      <p class="mt-1 text-center text-caption text-n600">{{ GOALS[xi].label }} ({{ GOALS[xi].unit }}, גדל לכיוון שמאל) · {{ GOALS[yi].label }} ({{ GOALS[yi].unit }}, גדל למעלה). קרוב לפינה הימנית־תחתונה: טוב יותר בשניהם.</p>
    </div>

    <div class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800" role="status">
      <template v-if="picked">
        <p><strong>הנבחר לפי המשקולות:</strong> {{ nameOf(picked.id) }}</p>
        <p class="text-caption text-n700">החזר ראשון <span class="ltr">{{ show(candOf(picked.id), 0) }}</span> · סך תשלומים <span class="ltr">{{ show(candOf(picked.id), 1) }}</span> · חשיפה <span class="ltr">{{ show(candOf(picked.id), 2) }}</span>. {{ front3Of(picked.id).efficient ? "הוא על החזית של שלושת היעדים." : "שימו לב: הוא לא על החזית של שלושת היעדים (משקולת אפס)." }}</p>
      </template>
      <p v-else>כל המשקולות אפס: אין העדפה, ולכן אין נבחר.</p>
      <template v-if="selected">
        <p class="mt-2"><strong>הנקודה שסימנתם:</strong> {{ selected.name }}</p>
        <p class="text-caption text-n700">
          החזר ראשון <span class="ltr">{{ show(selected, 0) }}</span> · סך תשלומים <span class="ltr">{{ show(selected, 1) }}</span> · חשיפה <span class="ltr">{{ show(selected, 2) }}</span>.
          <template v-if="!rows.find((r) => r.id === selected!.id)!.feasible">היא לא אפשרית בגבול של הלקוח.</template>
          <template v-else-if="frontOf(selected.id).efficient">אף מועמד אפשרי לא טוב ממנה בשני היעדים שבתמונה.</template>
          <template v-else>נשלטת על ידי: {{ frontOf(selected.id).dominatedBy.map(nameOf).join("; ") }}.</template>
        </p>
      </template>
      <p v-else class="mt-2 text-caption text-n700">לחצו על נקודה כדי לראות מי שולט בה.</p>
    </div>

    <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-80 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">מועמד</th>
            <th class="py-2 pe-2 text-start">מצב בתמונה</th>
            <th class="py-2 pe-2 text-start">החזר ראשון</th>
            <th class="py-2 pe-2 text-start">סך תשלומים</th>
            <th class="py-2 pe-2 text-start">חשיפה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in candidates" :key="c.id" class="border-b border-n100 align-top">
            <td class="py-1 pe-2 font-semibold">{{ c.name }}</td>
            <td class="py-1 pe-2">{{ !rows.find((r) => r.id === c.id)!.feasible ? "לא אפשרי" : frontOf(c.id).efficient ? "על החזית" : "נשלט" }}</td>
            <td class="py-1 pe-2"><span class="ltr">{{ show(c, 0) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ show(c, 1) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ show(c, 2) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
