<script setup lang="ts">
// Lesson 5.4: from zero curves to a forecast payment path. The learner picks a
// track type, the version of the (illustrative) curves, and for a variable track
// how often it resets; the page shows the forecast rates, every payment, the
// first payment and the highest expected payment. Every number comes from
// src/lib/calc/forecast.ts (the same code the lesson's facts use); the curves are
// the course's illustrative ones (src/data/curves.ts), never the Bank of
// Israel's. Statement rounding, as the lesson's tables.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { CURVE_LABEL, CURVES } from "../data/curves.ts";
import { type ForecastKind, forecastInputs, forecastTrack, summarize } from "../lib/calc/forecast.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";

type Version = "A" | "B" | "flat";
interface TrackType {
  kind: ForecastKind;
  label: string;
  /** The offer's rate on the offer day: invented. */
  rate: string;
  /** Which curve the directive's table points to, in words. */
  needs: string;
}
const props = withDefaults(defineProps<{ amount?: number; years?: number; kind?: ForecastKind; version?: Version; resetYears?: number }>(), {
  amount: 400000,
  years: 20,
  kind: "variable_unlinked",
  version: "A",
  resetYears: 5,
});

const TYPES: TrackType[] = [
  { kind: "fixed_unlinked", label: "קבועה לא צמודה", rate: "4.8", needs: "לא צריכה תחזית" },
  { kind: "fixed_linked", label: "קבועה צמודה", rate: "3.2", needs: "ציפיות אינפלציה" },
  { kind: "prime", label: "פריים", rate: "4.2", needs: "עקום אפס נומינלי" },
  { kind: "variable_unlinked", label: "משתנה לא צמודה", rate: "4.3", needs: "עקום אפס נומינלי" },
  { kind: "variable_linked", label: "משתנה צמודה", rate: "2.5", needs: "עקום אפס ריאלי וציפיות אינפלציה" },
];
const VERSIONS: { id: Version; label: string }[] = [
  { id: "A", label: CURVES.A.label },
  { id: "B", label: CURVES.B.label },
  { id: "flat", label: CURVES.flat.label },
];
const RESETS = [2, 5, 10];

const kind = ref<ForecastKind>(props.kind);
const version = ref<Version>(props.version);
const resetYears = ref(props.resetYears);
const showTable = ref(false);

const months = props.years * 12;
const type = computed(() => TYPES.find((t) => t.kind === kind.value) as TrackType);
const curves = computed(() => CURVES[version.value]);
const isVariable = computed(() => kind.value === "variable_unlinked" || kind.value === "variable_linked");
const forecast = computed(() =>
  forecastTrack({
    kind: kind.value,
    principal: props.amount,
    rate: type.value.rate,
    months,
    resetYears: resetYears.value,
    nominal: curves.value.nominal,
    real: curves.value.real,
  }),
);
const pays = computed(() => forecast.value.payments as Decimal[]);
const sum = computed(() => summarize(forecast.value)!);
const above = computed(() => sum.value.highest.div(sum.value.first).minus(1).mul(100));
const needs = computed(() => forecastInputs(kind.value));

const pct = (v: Decimal.Value) => `${new Decimal(v).toString()}%`;
const yearOf = (month: number) => Math.ceil(month / 12);
const range = (from: number, to: number) => `${Math.floor((from - 1) / 12) + 1}–${Math.ceil(to / 12)}`;

// Chart: the monthly payment over the term, month 1 at the right (time runs leftward).
const W = 640;
const H = 190;
const PAD = { top: 14, bottom: 10, side: 10 };
const yMax = computed(() => sum.value.highest.toNumber() * 1.06);
const yMin = computed(() => Math.min(...pays.value.map((p) => p.toNumber())) * 0.94);
const x = (month: number) => W - PAD.side - ((month - 1) / (months - 1)) * (W - 2 * PAD.side);
const y = (v: number) => H - PAD.bottom - ((v - yMin.value) / (yMax.value - yMin.value)) * (H - PAD.top - PAD.bottom);
const line = computed(() => pays.value.map((p, i) => `${i === 0 ? "M" : "L"}${x(i + 1).toFixed(1)},${y(p.toNumber()).toFixed(1)}`).join(" "));
const ticks = Array.from({ length: props.years / 5 + 1 }, (_, i) => i * 5);

// Chart 2: the two curves, years 1–30, year 1 at the right.
const CW = 640;
const CH = 150;
const cx = (yr: number) => CW - 10 - ((yr - 1) / 29) * (CW - 20);
const cMax = computed(() => Math.ceil(Math.max(...curves.value.nominal.map(Number))) + 0.5);
const cy = (v: number) => CH - 10 - (v / cMax.value) * (CH - 24);
const curveLine = (c: string[]) => c.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i + 1).toFixed(1)},${cy(Number(v)).toFixed(1)}`).join(" ");
const curveTicks = [1, 5, 10, 15, 20, 25, 30];

const rows = computed(() =>
  forecast.value.blocks.map((b) => ({
    ...b,
    pay: pays.value[b.fromMonth - 1],
  })),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      <span class="ltr">{{ formatWholeShekels(amount) }}</span> ל־{{ years }} שנה בשפיצר. {{ CURVE_LABEL }}. הריביות בהצעות, וכל המספרים כאן, בדויים להמחשה.
    </p>

    <fieldset class="mt-4">
      <legend class="text-body-m font-semibold text-n900">סוג המסלול</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button
          v-for="t in TYPES"
          :key="t.kind"
          type="button"
          class="min-h-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="kind === t.kind ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="kind === t.kind"
          @click="kind = t.kind"
        >
          {{ t.label }}
        </button>
      </div>
      <p class="mt-2 text-caption text-n600">
        ריבית ביום ההצעה: <span class="ltr font-semibold">{{ pct(type.rate) }}</span>. לפי טבלת הייחוס: {{ type.needs }}.
      </p>
    </fieldset>

    <fieldset class="mt-4">
      <legend class="text-body-m font-semibold text-n900">גרסת העקומים (להמחשה)</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button
          v-for="v in VERSIONS"
          :key="v.id"
          type="button"
          class="min-h-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="version === v.id ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="version === v.id"
          @click="version = v.id"
        >
          {{ v.label }}
        </button>
      </div>
    </fieldset>

    <fieldset v-if="isVariable" class="mt-4">
      <legend class="text-body-m font-semibold text-n900">כל כמה שנים הריבית מתעדכנת</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button
          v-for="r in RESETS"
          :key="r"
          type="button"
          class="min-h-11 min-w-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="resetYears === r ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="resetYears === r"
          @click="resetYears = r"
        >
          <span class="ltr">{{ r }}</span>
        </button>
      </div>
    </fieldset>

    <ul class="list-reset mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
      <li class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">החזר ראשון</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(sum.first) }}</span></p>
        <p class="text-caption text-n600">לא תלוי בעקום (במסלול צמוד כולל מדד של חודש אחד).</p>
      </li>
      <li class="rounded-md border border-n200 p-3">
        <p class="text-caption text-n600">החזר מרבי חזוי</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatShekels(sum.highest) }}</span></p>
        <p class="text-caption text-n600">
          בחודש <span class="ltr">{{ sum.highestMonth }}</span> (שנה {{ yearOf(sum.highestMonth) }}). גבוה ב־<span class="ltr">{{ pct(above.toDecimalPlaces(1)) }}</span> מהראשון.
        </p>
      </li>
      <li class="rounded-md border border-n200 p-3">
        <p class="text-caption text-n600">סך כל התשלומים החזויים</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ formatWholeShekels(sum.total) }}</span></p>
        <p class="text-caption text-n600">סכום התשלומים בלוח החזוי, לא ריבית.</p>
      </li>
    </ul>
    <p v-if="sum.highestMonth === months && !needs.linkage" class="mt-2 text-caption text-n600">
      החודש האחרון הוא הגבוה ביותר כי הוא סוגר את היתרה; ההפרש מהחודשים שלפניו קטן (באגורות) כשהריבית לא עולה בבלוק האחרון.
    </p>

    <figure class="m-0 mt-4">
      <figcaption class="text-caption font-semibold text-n600">התשלום החזוי בכל חודש</figcaption>
      <svg :viewBox="`0 0 ${W} ${H}`" class="mt-1 w-full" role="img" :aria-label="`גרף: התשלום החזוי בכל חודש לאורך ${years} שנה. הנתונים בטבלה.`">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(sum.first.toNumber())" :y2="y(sum.first.toNumber())" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="2 4" />
        <path :d="line" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" vector-effect="non-scaling-stroke" />
        <circle :cx="x(sum.highestMonth)" :cy="y(sum.highest.toNumber())" r="6" fill="var(--mogi-teal-deep)" />
      </svg>
      <div class="relative h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="t in ticks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(x(Math.max(1, t * 12)) / W) * 100}%` }">{{ t }}</span>
      </div>
      <p class="text-center text-caption text-n600">שנים מתחילת ההלוואה, מימין לשמאל. הציר האנכי לא מתחיל באפס. הקו המנוקד: ההחזר הראשון. העיגול: ההחזר המרבי החזוי.</p>
    </figure>

    <figure class="m-0 mt-4">
      <figcaption class="text-caption font-semibold text-n600">העקומים שמהם חושבה התחזית — {{ CURVE_LABEL }} ({{ curves.label }})</figcaption>
      <svg :viewBox="`0 0 ${CW} ${CH}`" class="mt-1 w-full" role="img" aria-label="גרף: עקום אפס נומינלי ועקום אפס ריאלי, אורך מ־1 עד 30 שנה.">
        <path :d="curveLine(curves.nominal)" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" vector-effect="non-scaling-stroke" />
        <path :d="curveLine(curves.real)" fill="none" stroke="var(--mogi-turquoise-2)" stroke-width="3" stroke-dasharray="9 6" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="relative h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="t in curveTicks" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(cx(t) / CW) * 100}%` }">{{ t }}</span>
      </div>
      <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
        <li class="flex items-center gap-2"><span class="inline-block h-1 w-5 rounded-sm" style="background: var(--mogi-teal-deep)"></span>עקום אפס נומינלי</li>
        <li class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-2 border-dashed" style="border-color: var(--mogi-turquoise-2)"></span>עקום אפס ריאלי</li>
      </ul>
      <p class="text-center text-caption text-n600">אורך בשנים, מימין לשמאל (שנה 1 עד 30). הציר האנכי: תשואה באחוזים, מ־0 עד <span class="ltr">{{ cMax }}</span>.</p>
    </figure>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start font-semibold">שנים</th>
            <th v-if="needs.rate" class="py-2 text-start font-semibold">עוגן</th>
            <th class="py-2 text-start font-semibold">ריבית</th>
            <th class="py-2 text-start font-semibold">תשלום בחודש הראשון של התקופה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.block" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ range(r.fromMonth, r.toMonth) }}</span></td>
            <td v-if="needs.rate" class="py-1"><span class="ltr">{{ pct(r.anchor as Decimal) }}</span></td>
            <td class="py-1"><span class="ltr">{{ pct(r.rate) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(pays[r.fromMonth - 1]) }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-if="needs.linkage" class="mt-1 text-caption text-n600">במסלול צמוד התשלום עולה בכל חודש עם המדד החזוי; בטבלה מופיע התשלום בחודש הראשון של כל תקופה.</p>
      <p v-else class="mt-1 text-caption text-n600">בין עדכון לעדכון הריבית לא זזה, והמסלול לא צמוד, ולכן התשלום קבוע בכל תקופה.</p>
    </div>
  </div>
</template>
