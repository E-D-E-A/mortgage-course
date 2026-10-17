<script setup lang="ts">
// The calibration curve (lesson 8.19). Synthetic applicants, a model that says how likely approval is, and what
// really happened. Each point is a bin of predictions: what the model said on average (across) against how often
// it really happened (up). On the dashed diagonal, "70%" means 7 in 10. The learner chooses how many applicants
// the table may use and how many bins, and can learn a correction on the first half and see it judged on the
// second. Computed by the course's calibration.ts; Mogi has no approvals data, everything here is made up.
import { computed, ref } from "vue";
import {
  brierScore,
  calibrationGap,
  equalEdges,
  recalibrate,
  reliabilityTable,
  syntheticApplicants,
  toScored,
} from "../lib/calc/calibration.ts";

const props = defineProps<{ seed: number; nMax: number }>();

const all = computed(() => toScored(syntheticApplicants(props.seed, props.nMax)));
const n = ref(Math.min(500, props.nMax));
const bins = ref(10);
const fix = ref(false);
const showTable = ref(false);

const edges = computed(() => equalEdges(bins.value));
const data = computed(() => all.value.slice(0, n.value));
const rec = computed(() => (fix.value && n.value >= 4 ? recalibrate(data.value, Math.floor(n.value / 2), edges.value, 30) : null));
const tableMain = computed(() => (rec.value ? rec.value.tableBefore : reliabilityTable(data.value, edges.value)));
const tableAfter = computed(() => rec.value?.tableAfter ?? null);
const gap = computed(() => (rec.value ? rec.value.before.gap : calibrationGap(data.value, edges.value)));
const brier = computed(() => (rec.value ? rec.value.before.brier : brierScore(data.value)));
const tested = computed(() => (rec.value ? rec.value.tested : n.value));

const W = 420;
const H = 380;
const pad = { l: 54, r: 14, t: 14, b: 44 };
const X = (p: number) => pad.l + p * (W - pad.l - pad.r);
const Y = (p: number) => H - pad.b - p * (H - pad.t - pad.b);
const pts = (rows: typeof tableMain.value) =>
  rows
    .filter((r) => r.n > 0 && r.predicted !== null && r.observed !== null)
    .map((r) => ({ x: X(Number(r.predicted)), y: Y(Number(r.observed)), r: Math.max(4, Math.min(16, 2.2 * Math.sqrt(r.n))), n: r.n, row: r }));
const mainPts = computed(() => pts(tableMain.value));
const afterPts = computed(() => (tableAfter.value ? pts(tableAfter.value) : []));
const pc = (s: string | null) => (s === null ? "—" : `${Math.round(Number(s) * 100)}%`);
const sign = (s: string | null) => (s === null ? "—" : `${Number(s) > 0 ? "+" : ""}${Math.round(Number(s) * 100)}`);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה מבקשים בטבלה</span>
        <input v-model.number="n" type="range" min="100" :max="nMax" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ n }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה פסי ציון</span>
        <input v-model.number="bins" type="range" min="5" max="10" step="5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ bins }}</span></span>
      </label>
    </div>
    <label class="mt-4 flex min-h-11 items-center gap-3 text-body-m text-n800">
      <input v-model="fix" type="checkbox" class="h-5 w-5" />
      <span>ללמוד תיקון על המחצית הראשונה, ולבדוק אותו על השנייה</span>
    </label>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">נבדקים בטבלה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ tested }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">פער כיול ממוצע (משוקלל)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ gap }}</span></p>
        <p v-if="rec" class="text-caption text-n700">אחרי התיקון: <span class="ltr">{{ rec.after.gap }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ציון בריאר (נמוך = טוב)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ brier }}</span></p>
        <p v-if="rec" class="text-caption text-n700">אחרי התיקון: <span class="ltr">{{ rec.after.brier }}</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" :style="{ background: rec ? 'var(--mogi-n400)' : 'var(--mogi-teal-deep)' }"></span>{{ rec ? "המודל, כפי שהוא (במחצית הנבדקת)" : "המודל" }}</li>
      <li v-if="rec" class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-turquoise-2)"></span>אחרי התיקון</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-6 border-t border-dashed" style="border-color: var(--mogi-navy)"></span>כיול מושלם</li>
    </ul>

    <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto mt-3 w-full max-w-md" style="direction: ltr" role="img" aria-label="עקומת כיול: מה שהמודל אמר מול מה שקרה, לכל פס ציון">
      <line :x1="X(0)" :y1="Y(0)" :x2="X(1)" :y2="Y(1)" stroke="var(--mogi-navy)" stroke-dasharray="6 5" />
      <line :x1="X(0)" :x2="X(1)" :y1="Y(0)" :y2="Y(0)" stroke="var(--mogi-n300)" />
      <line :x1="X(0)" :x2="X(0)" :y1="Y(0)" :y2="Y(1)" stroke="var(--mogi-n300)" />
      <g v-for="t in [0, 0.25, 0.5, 0.75, 1]" :key="t">
        <text :x="X(t)" :y="H - 20" text-anchor="middle" font-size="16" fill="var(--mogi-n600)">{{ Math.round(t * 100) }}%</text>
        <text :x="pad.l - 6" :y="Y(t) + 6" text-anchor="end" font-size="16" fill="var(--mogi-n600)">{{ Math.round(t * 100) }}%</text>
      </g>
      <circle v-for="(p, k) in mainPts" :key="`m${k}`" :cx="p.x" :cy="p.y" :r="p.r" :fill="rec ? 'var(--mogi-n400)' : 'var(--mogi-teal-deep)'" fill-opacity="0.75" />
      <circle v-for="(p, k) in afterPts" :key="`a${k}`" :cx="p.x" :cy="p.y" :r="Math.max(3, p.r - 2)" fill="var(--mogi-turquoise-2)" fill-opacity="0.9" />
    </svg>
    <p class="text-center text-caption text-n600">אופקי: מה שהמודל אמר (ממוצע בפס) · אנכי: איזה חלק מהם אושר באמת · גודל הנקודה: כמה מבקשים בפס</p>

    <button type="button" class="mt-3 inline-flex min-h-11 items-center text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">פס</th>
            <th class="py-2 pe-2 text-start">מבקשים</th>
            <th class="py-2 pe-2 text-start">המודל אמר</th>
            <th class="py-2 pe-2 text-start">אושרו</th>
            <th class="py-2 pe-2 text-start">פער (נק׳ אחוז)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, k) in tableMain" :key="k" class="border-b border-n100">
            <td class="py-1 pe-2"><span class="ltr">{{ pc(r.lo) }}–{{ pc(r.hi) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ r.n }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ pc(r.predicted) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ pc(r.observed) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ sign(r.gap) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
