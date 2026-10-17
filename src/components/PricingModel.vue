<script setup lang="ts">
// A small pricing model on synthetic data (lesson 8.17). Dots are made-up offers: the margin (percentage points
// above the anchor) against the financing ratio, in two colours by the payment ratio. The learner moves the base
// and the three steps of a model "anchor + margin, with steps at thresholds" and watches the model's staircase fit
// the dots; the error (mean absolute difference) is shown next to the error of the model that MADE the data (noise
// only). A what-if panel asks the model for the rate of a deal and what changes when the financing ratio or the
// payment ratio crosses a threshold. Everything comes from pricingmodel.ts. SYNTHETIC and for illustration: not a
// bank's pricing and not a Mogi model.
import { computed, ref } from "vue";
import { fitError, marginOf, type Offer, type PricingModel, rateOf, whatIf } from "../lib/calc/pricingmodel.ts";

const props = defineProps<{ offers: Offer[]; truth: PricingModel; start: PricingModel; anchor: string }>();

const base = ref(Number(props.start.base));
const l40 = ref(Number(props.start.ltv[0].add));
const l60 = ref(Number(props.start.ltv[1].add));
const p40 = ref(Number(props.start.pti[0].add));
const showTruth = ref(false);
const showTable = ref(false);
const dealLtv = ref(64);
const dealPti = ref(36);

const model = computed<PricingModel>(() => ({
  base: base.value.toFixed(2),
  ltv: [
    { above: props.start.ltv[0].above, add: l40.value.toFixed(2) },
    { above: props.start.ltv[1].above, add: l60.value.toFixed(2) },
  ],
  pti: [{ above: props.start.pti[0].above, add: p40.value.toFixed(2) }],
}));
const err = computed(() => fitError(model.value, props.offers));
const floor = computed(() => fitError(props.truth, props.offers));
const close = computed(() => Number(err.value) - Number(floor.value) <= 0.01);
const target = Number(props.start.ltv[1].above);
const deal = computed(() => whatIf(props.anchor, model.value, { ltv: dealLtv.value, pti: dealPti.value }, { ltv: target }));
const dealRate = computed(() => rateOf(props.anchor, model.value, { ltv: dealLtv.value, pti: dealPti.value }));
const dealMargin = computed(() => marginOf(model.value, { ltv: dealLtv.value, pti: dealPti.value }));

// Chart (left to right, as numbers are written): financing ratio 30–75 across, margin up.
const W = 640;
const H = 320;
const pad = { l: 44, r: 12, t: 12, b: 34 };
const X = (v: number) => pad.l + ((v - 30) / 45) * (W - pad.l - pad.r);
const MAXM = 1.8;
const Y = (m: number) => H - pad.b - (m / MAXM) * (H - pad.t - pad.b);
const staircase = (m: PricingModel, pti: number) => {
  const pts: string[] = [];
  let prev: number | null = null;
  for (let v = 30; v <= 75; v += 1) {
    const mg = Number(marginOf(m, { ltv: v, pti }));
    if (prev !== null && mg !== prev) pts.push(`${X(v - 0.5)},${Y(prev)}`, `${X(v - 0.5)},${Y(mg)}`);
    if (v === 30) pts.push(`${X(v)},${Y(mg)}`);
    if (v === 75) pts.push(`${X(v)},${Y(mg)}`);
    prev = mg;
  }
  return pts.join(" ");
};
const lowColor = "var(--mogi-teal-deep)";
const highColor = "var(--mogi-turquoise-2)";
const dots = computed(() => props.offers.map((o) => ({ x: X(Number(o.ltv)), y: Y(Number(o.margin)), high: Number(o.pti) > 40 })));
const ticks = [30, 40, 50, 60, 70];
const pct = (n: number) => `${n}%`;
const pp = (s: string) => s;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">המרווח הבסיסי (נקודות אחוז)</span>
        <input v-model.number="base" type="range" min="0.4" max="1.4" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ base.toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מדרגה: מימון מעל {{ start.ltv[0].above }}%</span>
        <input v-model.number="l40" type="range" min="0" max="0.8" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ l40.toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מדרגה: מימון מעל {{ start.ltv[1].above }}%</span>
        <input v-model.number="l60" type="range" min="0" max="0.8" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ l60.toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מדרגה: יחס החזר מעל {{ start.pti[0].above }}%</span>
        <input v-model.number="p40" type="range" min="0" max="0.8" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ p40.toFixed(2) }}</span></span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">טעות המודל שלכם (ממוצע ההפרשים)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ err }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">טעות המודל שיצר את הנתונים (רעש בלבד)</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ floor }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3" role="status">
        <p class="text-caption text-n600">מצב</p>
        <p class="text-body-l font-semibold text-n900">{{ close ? "קרוב לרצפת הרעש: אי אפשר להשתפר הרבה" : "עוד אפשר להתקרב לנתונים" }}</p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" :style="{ background: lowColor }"></span>הצעות עם יחס החזר עד 40%</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" :style="{ background: highColor }"></span>הצעות עם יחס החזר מעל 40%</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-6" style="background: var(--mogi-navy)"></span>המודל שלכם</li>
      <li v-if="showTruth" class="flex items-center gap-2"><span class="inline-block h-0.5 w-6 border-t border-dashed" style="border-color: var(--mogi-n600)"></span>המודל שיצר את הנתונים</li>
    </ul>

    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-3 w-full" style="direction: ltr" role="img" aria-label="גרף: המרווח של כל הצעה מול שיעור המימון, והמדרגות של המודל">
      <line :x1="pad.l" :x2="W - pad.r" :y1="Y(0)" :y2="Y(0)" stroke="var(--mogi-n300)" />
      <g v-for="t in ticks" :key="t">
        <line :x1="X(t)" :x2="X(t)" :y1="Y(0)" :y2="Y(0) + 5" stroke="var(--mogi-n300)" />
        <text :x="X(t)" :y="H - 12" text-anchor="middle" font-size="13" fill="var(--mogi-n600)">{{ pct(t) }}</text>
      </g>
      <g v-for="m in [0.5, 1.0, 1.5]" :key="m">
        <line :x1="pad.l" :x2="W - pad.r" :y1="Y(m)" :y2="Y(m)" stroke="var(--mogi-n100)" />
        <text :x="pad.l - 6" :y="Y(m) + 4" text-anchor="end" font-size="13" fill="var(--mogi-n600)">{{ m.toFixed(1) }}</text>
      </g>
      <circle v-for="(d, k) in dots" :key="k" :cx="d.x" :cy="d.y" r="4" :fill="d.high ? highColor : lowColor" fill-opacity="0.8" />
      <template v-if="showTruth">
        <polyline :points="staircase(truth, 30)" fill="none" stroke="var(--mogi-n600)" stroke-width="1.5" stroke-dasharray="5 4" />
        <polyline :points="staircase(truth, 45)" fill="none" stroke="var(--mogi-n600)" stroke-width="1.5" stroke-dasharray="5 4" />
      </template>
      <polyline :points="staircase(model, 30)" fill="none" stroke="var(--mogi-navy)" stroke-width="2.5" />
      <polyline :points="staircase(model, 45)" fill="none" stroke="var(--mogi-navy)" stroke-width="2.5" />
    </svg>
    <p class="text-center text-caption text-n600">אופקי: שיעור מימון (גדל ימינה) · אנכי: מרווח, נקודות אחוז מעל העוגן. שני המדרגונים: יחס החזר עד 40% (התחתון) ומעל 40% (העליון).</p>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שאלת מה־אם: שיעור המימון של לקוח</span>
        <input v-model.number="dealLtv" type="range" min="30" max="75" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ dealLtv }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">יחס ההחזר שלו</span>
        <input v-model.number="dealPti" type="range" min="20" max="50" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ dealPti }}%</span></span>
      </label>
    </div>
    <div class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800" role="status">
      <p>העוגן <span class="ltr">{{ anchor }}%</span> ועוד מרווח <span class="ltr">{{ dealMargin }}</span> = אחוז ריבית של <strong><span class="ltr">{{ dealRate }}%</span></strong>.</p>
      <p class="text-caption text-n700">
        אם ייכנס עוד הון עצמי ושיעור המימון ירד ל־<span class="ltr">{{ target }}%</span>: אחוז הריבית <span class="ltr">{{ pp(deal.after.rate) }}%</span>
        (שינוי <span class="ltr">{{ deal.change }}</span> נקודות אחוז). זו תשובה של המודל שלכם, אומדן ולא הבטחה.
      </p>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-6">
      <label class="flex min-h-11 items-center gap-3 text-body-m text-n800"><input v-model="showTruth" type="checkbox" class="h-5 w-5" /><span>להראות את המודל שיצר את הנתונים</span></label>
    </div>

    <button type="button" class="mt-1 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">שיעור מימון</th>
            <th class="py-2 pe-2 text-start">יחס החזר</th>
            <th class="py-2 pe-2 text-start">מרווח בהצעה</th>
            <th class="py-2 pe-2 text-start">מרווח במודל</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, k) in offers" :key="k" class="border-b border-n100">
            <td class="py-1 pe-2"><span class="ltr">{{ o.ltv }}%</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ o.pti }}%</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ o.margin }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ marginOf(model, o) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
