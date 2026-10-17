<script setup lang="ts">
// Lesson 8.11 (and 8.12): a Monte Carlo simulation the learner runs. Choose a mix, how many futures, the seed, and how wild the
// yearly moves of prime are; the page draws that many futures from the ASSUMED distribution (montecarlo.ts, a seeded generator: no
// Math.random, so the same seed gives the same futures), runs the engine on each, and shows the spread of the highest payment,
// the share of futures that reach a threshold, and the simulation's own error.
// ILLUSTRATION: the yearly moves and their weights are an invented ASSUMPTION ("זו הנחה, לא עובדה"), and the data is synthetic.
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { evaluate } from "../lib/calc/engine.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { atLeast, DEFAULT_MODEL, futures, summary } from "../lib/calc/montecarlo.ts";
import type { TrackSpec } from "../lib/calc/schedule.ts";
import { histogram } from "../lib/calc/stats.ts";

interface MixOption {
  id: string;
  name: string;
  tracks: TrackSpec[];
  /** Years to simulate (the longest term). */
  years: number;
  /** The threshold slider: first value, last value, step, and where it starts (shekels). */
  range: { min: number; max: number; step: number; start: number };
}
const props = withDefaults(defineProps<{ mixes: MixOption[]; seed?: number; n?: number; scale?: number; today?: string }>(), {
  seed: 1,
  n: 100,
  scale: 1,
  today: "4.75",
});

const mixId = ref(props.mixes[0].id);
const n = ref(props.n);
const seed = ref(props.seed);
const scale = ref(props.scale);
const threshold = ref(props.mixes[0].range.start);
const years = computed(() => mix.value.years);
const running = ref(false);
const progress = ref(0);
const showTable = ref(false);
type Result = { first: number; values: number[]; paths: number[][]; n: number; seed: number; scale: number; mix: string };
const result = ref<Result | null>(null);
let cancelled = false;
onBeforeUnmount(() => (cancelled = true));

const mix = computed(() => props.mixes.find((m) => m.id === mixId.value) ?? props.mixes[0]);
watch(mixId, () => {
  threshold.value = mix.value.range.start;
  result.value = null;
});
const sizes = [10, 50, 100, 200, 500, 1000];
const scales = [
  { v: 0.5, t: "רגוע (חצי)" },
  { v: 1, t: "רגיל" },
  { v: 2, t: "סוער (כפול)" },
];
const tick = () => new Promise<void>((r) => setTimeout(r, 0));

async function run() {
  if (running.value) return;
  running.value = true;
  progress.value = 0;
  cancelled = false;
  const model = { ...DEFAULT_MODEL, years: mix.value.years, scale: scale.value };
  const fs = futures(Math.trunc(Number(seed.value)) || 0, n.value, model);
  const values: number[] = [];
  const paths: number[][] = [];
  let first = 0;
  for (let i = 0; i < fs.length; i++) {
    const e = evaluate(mix.value.tracks, fs[i]);
    if (i === 0) first = e.first.toNumber();
    values.push(e.max.toNumber());
    if (i < 15) paths.push((fs[i].primeShift as string[]).map((s) => Number(props.today) + Number(s)));
    if (i % 5 === 4) {
      progress.value = (i + 1) / fs.length;
      await tick();
      if (cancelled) return;
    }
  }
  result.value = { first, values, paths, n: fs.length, seed: Math.trunc(Number(seed.value)) || 0, scale: scale.value, mix: mix.value.name };
  progress.value = 1;
  running.value = false;
}

const stats = computed(() => {
  const r = result.value;
  if (!r) return null;
  const a = atLeast(r.values, threshold.value);
  const s = summary(r.values);
  return { count: a.count, p: a.p.toNumber(), se: a.se.toNumber(), mean: s.mean, p5: s.p5, p50: s.p50, p95: s.p95, min: s.min, max: s.max };
});
const pct = (x: number, d = 1) => `${(100 * x).toFixed(d)}%`;

// A bin width that makes about a dozen bars: the smallest of 5, 10, 25, 50, 100, 250, 500 shekels that does.
const BIN = computed(() => {
  const r = result.value;
  if (!r) return 25;
  const raw = (Math.max(...r.values) - Math.min(...r.values)) / 12;
  return [5, 10, 25, 50, 100, 250, 500].find((w) => w >= raw) ?? 500;
});
const bins = computed(() => {
  const r = result.value;
  if (!r) return [];
  const BINW = BIN.value;
  const lo = Math.floor(Math.min(...r.values) / BINW) * BINW;
  const hi = Math.max(...r.values);
  const count = Math.max(1, Math.floor((hi - lo) / BINW) + 1);
  return histogram(r.values, { start: lo, width: BINW, count }).bins.map((b) => ({ lo: b.lo.toNumber(), hi: b.hi.toNumber(), count: b.count }));
});
const maxBin = computed(() => Math.max(1, ...bins.value.map((b) => b.count)));

const W = 640;
const H = 180;
const PW = { lo: 3, hi: 9 };
const pathX = (i: number) => W - 10 - (i / Math.max(1, years.value - 1)) * (W - 20);
const pathY = (v: number) => H - 8 - ((Math.min(PW.hi, Math.max(PW.lo, v)) - PW.lo) / (PW.hi - PW.lo)) * (H - 16);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">הדגמה: ההנחות על תנועת הפריים והאינפלציה מומצאות (זו הנחה, לא עובדה), והנתונים סינתטיים. ההגרלה קבועה לפי מספר ההתחלה: אותו מספר, אותם עתידים.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">התמהיל</span>
        <select v-model="mixId" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m">
          <option v-for="m in mixes" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה עתידים</span>
        <select v-model.number="n" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m">
          <option v-for="s in sizes" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מספר התחלה להגרלה</span>
        <input v-model.number="seed" type="number" min="0" step="1" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה סוערת תנועת הפריים (ההנחה)</span>
        <select v-model.number="scale" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m">
          <option v-for="s in scales" :key="s.v" :value="s.v">{{ s.t }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-caption font-semibold text-n600">סף: ״ההחזר יעבור ...״</span>
        <input v-model.number="threshold" type="range" :min="mix.range.min" :max="mix.range.max" :step="mix.range.step" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatWholeShekels(threshold) }}</span></span>
      </label>
    </div>
    <button type="button" class="mt-4 min-h-[44px] rounded-md bg-teal-deep px-5 text-body-m font-semibold text-n0 disabled:opacity-60" :disabled="running" @click="run">
      {{ running ? "מריץ..." : "הריצו את העתידים" }}
    </button>
    <div v-if="running" class="mt-3 h-2 rounded bg-n100" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100">
      <div class="h-2 rounded bg-teal-deep" :style="{ width: `${progress * 100}%` }"></div>
    </div>

    <div v-if="result && stats" class="mt-5">
      <p class="rounded-md bg-n50 p-3 text-body-l text-n900" role="status">
        מתוך <strong class="ltr">{{ result.n }}</strong> עתידים, <strong class="ltr">{{ stats.count }}</strong> הגיעו לתשלום של <span class="ltr">{{ formatWholeShekels(threshold) }}</span> לפחות:
        <strong class="ltr">{{ pct(stats.p) }}</strong>.
        <span class="text-body-m text-n700">טעות ההגרלה עצמה, בערך: <span class="ltr">±{{ pct(stats.se) }}</span>. זו טעות של הסימולציה, לא של ההנחות.</span>
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-4">
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">החזר ראשון</p><p class="text-h3 text-navy"><span class="ltr">{{ formatWholeShekels(result.first) }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">הגבוה ביותר, ממוצע</p><p class="text-h3 text-navy"><span class="ltr">{{ formatWholeShekels(stats.mean) }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">חציון</p><p class="text-h3 text-navy"><span class="ltr">{{ formatWholeShekels(stats.p50) }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">אחוזון 5 עד 95</p><p class="text-h3 text-navy"><span class="ltr whitespace-nowrap">{{ formatWholeShekels(stats.p5) }}–{{ formatWholeShekels(stats.p95) }}</span></p></div>
      </div>

      <p class="mt-4 text-caption font-semibold text-n600">כמה עתידים נתנו כל טווח של התשלום הגבוה ביותר (מקטע של <span class="ltr">{{ BIN }}</span> ₪)</p>
      <ul class="list-reset mt-1 space-y-1" aria-label="היסטוגרמה">
        <li v-for="b in bins" :key="b.lo" class="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-2 text-caption">
          <span class="ltr text-n700">{{ formatWholeShekels(b.lo) }}</span>
          <span class="block h-4 rounded bg-n100" aria-hidden="true">
            <span class="block h-4 rounded" :style="{ width: `${(100 * b.count) / maxBin}%`, background: b.lo >= threshold ? 'var(--mogi-navy)' : 'var(--mogi-turquoise-2)' }"></span>
          </span>
          <span class="ltr text-n700">{{ b.count }}</span>
        </li>
      </ul>
      <p class="mt-1 text-caption text-n600">כחול כהה: טווחים שמתחילים בסף או מעליו. בטווח שהסף נמצא בתוכו, כל המקטע נספר לפי הקצה התחתון שלו; ההסתברות למעלה נספרת לפי הסף עצמו.</p>

      <p class="mt-4 text-caption font-semibold text-n600">חמש־עשרה דוגמאות לעתיד: הפריים בכל שנה (מימין לשמאל, שנה 1 עד {{ years }})</p>
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-label="חמישה־עשר מסלולי פריים אפשריים">
        <polyline v-for="(p, k) in result.paths" :key="k" :points="p.map((v, i) => `${pathX(i).toFixed(1)},${pathY(v).toFixed(1)}`).join(' ')" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="1.5" opacity="0.5" />
      </svg>

      <button type="button" class="mt-2 min-h-[44px] text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
      </button>
      <div v-if="showTable" class="mt-2 overflow-x-auto">
        <table class="w-full border-collapse text-body-m">
          <thead><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 pe-3 text-start">מ־</th><th class="py-2 pe-3 text-start">עד (לא כולל)</th><th class="py-2 pe-3 text-start">עתידים</th></tr></thead>
          <tbody>
            <tr v-for="b in bins" :key="b.lo" class="border-b border-n100">
              <td class="py-1 pe-3"><span class="ltr">{{ formatWholeShekels(b.lo) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ formatWholeShekels(b.hi) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ b.count }}</span></td>
            </tr>
          </tbody>
        </table>
        <p class="mt-2 text-caption text-n600">הרצה: {{ result.mix }}, <span class="ltr">{{ result.n }}</span> עתידים, מספר התחלה <span class="ltr">{{ result.seed }}</span>, תנועה ×<span class="ltr">{{ result.scale }}</span>.</p>
      </div>
    </div>
  </div>
</template>
