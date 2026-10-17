<script setup lang="ts">
// Estimating a step from little data (lesson 8.18). The learner chooses how many of the sixty synthetic offers
// the estimate may use, and how strong the starting assumption (the prior) is. The picture shows the prior, the
// estimate with its 95% interval, and where the two are combined; the true step is hidden until asked for (we
// know it only because the data is synthetic). Computed by the course's estimate.ts. Not a Mogi model.
import { computed, ref } from "vue";
import { stepFromOffers } from "../lib/calc/estimate.ts";

const props = defineProps<{
  offers: { ltv: string; margin: string }[];
  thr: number;
  prior: { mean: string; sd: string };
  truth: string;
}>();

const n = ref(12);
const pm = ref(Number(props.prior.mean));
const psd = ref(Number(props.prior.sd));
const showTruth = ref(false);
const showTable = ref(false);

const chain = computed(() => stepFromOffers(props.offers.slice(0, n.value), props.thr, { mean: pm.value.toFixed(2), sd: psd.value.toFixed(2) }));
const est = computed(() => chain.value.estimate);
const post = computed(() => chain.value.posterior);

const W = 640;
const H = 160;
const lo = -0.1;
const hi = 0.8;
const X = (v: number) => 20 + ((v - lo) / (hi - lo)) * (W - 40);
const ticks = [0, 0.2, 0.4, 0.6];
const num = (s: string | number) => Number(s);
const rows = computed(() =>
  [8, 12, 20, 30, 45, 60].map((k) => {
    const c = stepFromOffers(props.offers.slice(0, k), props.thr, { mean: pm.value.toFixed(2), sd: psd.value.toFixed(2) });
    return { k, c };
  }),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה הצעות משתמשים בהן</span>
        <input v-model.number="n" type="range" min="8" :max="offers.length" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ n }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הנחת הפתיחה: המדרגה, בנקודות אחוז</span>
        <input v-model.number="pm" type="range" min="0" max="0.6" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ pm.toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה בטוחים בהנחה (פיזור קטן = בטוחים)</span>
        <input v-model.number="psd" type="range" min="0.02" max="0.3" step="0.01" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ psd.toFixed(2) }}</span></span>
      </label>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הצעות עד {{ thr }}% / מעל {{ thr }}%</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ chain.nBelow }} / {{ chain.nAbove }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">אומדן המדרגה מהנתונים (טווח 95%)</p>
        <p v-if="est" class="text-h3 text-navy"><span class="ltr">{{ est.step }}</span> <span class="text-body-m text-n700">(<span class="ltr">{{ est.low }}</span> עד <span class="ltr">{{ est.high }}</span>)</span></p>
        <p v-else class="text-body-m text-n800">אין מספיק נתונים: צריך לפחות שתי הצעות בכל צד של הסף</p>
      </div>
      <div class="rounded-md bg-n50 p-3" role="status">
        <p class="text-caption text-n600">אחרי שהנחת הפתיחה פגשה את הנתונים</p>
        <p class="text-h3 text-navy"><span class="ltr">{{ post.mean }}</span></p>
        <p class="text-caption text-n700">משקל ההנחה: <span class="ltr">{{ Math.round(num(post.priorWeight) * 100) }}%</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-6 rounded-sm" style="background: var(--mogi-n300)"></span>הנחת הפתיחה (ממוצע ± פיזור)</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-6 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>הנתונים: אומדן וטווח 95%</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-navy)"></span>אחרי החיבור</li>
      <li v-if="showTruth" class="flex items-center gap-2"><span class="inline-block h-4 w-0.5" style="background: var(--mogi-n600)"></span>המדרגה האמיתית (רק כי הנתונים סינתטיים)</li>
    </ul>

    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-3 w-full" style="direction: ltr" role="img" aria-label="גרף: הנחת הפתיחה, האומדן מהנתונים וטווח הביטחון שלו, והתוצאה אחרי החיבור, על ציר של המדרגה">
      <line :x1="X(lo)" :x2="X(hi)" :y1="130" :y2="130" stroke="var(--mogi-n300)" />
      <g v-for="t in ticks" :key="t">
        <line :x1="X(t)" :x2="X(t)" :y1="130" :y2="136" stroke="var(--mogi-n300)" />
        <text :x="X(t)" :y="154" text-anchor="middle" font-size="13" fill="var(--mogi-n600)">{{ t.toFixed(1) }}</text>
      </g>
      <rect :x="X(pm - psd)" :y="28" :width="Math.max(2, X(pm + psd) - X(pm - psd))" height="22" rx="4" fill="var(--mogi-n300)" />
      <line :x1="X(pm)" :x2="X(pm)" :y1="24" :y2="54" stroke="var(--mogi-n600)" stroke-width="2" />
      <template v-if="est">
        <rect :x="X(num(est.low))" :y="62" :width="Math.max(2, X(num(est.high)) - X(num(est.low)))" height="22" rx="4" fill="var(--mogi-turquoise-2)" />
        <circle :cx="X(num(est.step))" :cy="73" r="6" fill="var(--mogi-teal-deep)" />
      </template>
      <circle :cx="X(num(post.mean))" :cy="105" r="8" fill="var(--mogi-navy)" />
      <line v-if="showTruth" :x1="X(num(truth))" :x2="X(num(truth))" :y1="20" :y2="125" stroke="var(--mogi-n600)" stroke-width="2" stroke-dasharray="4 3" />
    </svg>

    <label class="mt-2 flex min-h-11 items-center gap-3 text-body-m text-n800">
      <input v-model="showTruth" type="checkbox" class="h-5 w-5" />
      <span>להראות את המדרגה האמיתית (ידועה כי יצרנו את הנתונים)</span>
    </label>

    <button type="button" class="mt-1 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">הצעות</th>
            <th class="py-2 pe-2 text-start">עד / מעל הסף</th>
            <th class="py-2 pe-2 text-start">אומדן (טווח 95%)</th>
            <th class="py-2 pe-2 text-start">אחרי החיבור</th>
            <th class="py-2 pe-2 text-start">משקל ההנחה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.k" class="border-b border-n100 align-top">
            <td class="py-1 pe-2"><span class="ltr">{{ r.k }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ r.c.nBelow }} / {{ r.c.nAbove }}</span></td>
            <td class="py-1 pe-2"><span v-if="r.c.estimate" class="ltr">{{ r.c.estimate.step }} ({{ r.c.estimate.low }} עד {{ r.c.estimate.high }})</span><span v-else>אין נתונים</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ r.c.posterior.mean }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ Math.round(num(r.c.posterior.priorWeight) * 100) }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
