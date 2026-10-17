<script setup lang="ts">
// Lesson 8.24: a model that goes stale. SYNTHETIC: one invented bank, one model with one number (the spread over the
// anchor, fitted on months 1–24), and a change in the bank's spread at a month the learner picks. The page shows the
// spread each month (dots), what the model believes (line), the rolling error against the alarm threshold, the month
// the alarm rings, and what a refit on the last few months does. Every number comes from src/lib/calc/drift.ts, the
// same code as the lesson's facts. The alarm factor, window and refit sizes are the illustration's, not Mogi's.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { DEFAULT_MONITOR, DEFAULT_SPEC, monitorRun, r4, syntheticSeries } from "../lib/calc/drift.ts";

const changeAt = ref(DEFAULT_SPEC.changeAt);
const jump = ref(0.25);
const noise = ref(Number(DEFAULT_SPEC.noiseStep));
const factor = ref(DEFAULT_MONITOR.factor as number);
const windowN = ref(DEFAULT_MONITOR.window);
const retrain = ref(DEFAULT_MONITOR.retrainWindow);
const showTable = ref(false);

const spec = computed(() => ({
  ...DEFAULT_SPEC,
  changeAt: changeAt.value,
  after: { intercept: new Decimal(1).plus(jump.value).toFixed(2), slope: "1.00" },
  noiseStep: noise.value.toFixed(2),
}));
const series = computed(() => syntheticSeries(spec.value));
const run = computed(() => monitorRun(series.value, changeAt.value, { ...DEFAULT_MONITOR, factor: factor.value, window: windowN.value, retrainWindow: retrain.value }));
const spreadOf = (p: { x: string; y: string }) => new Decimal(p.y).minus(p.x).toNumber();
const TRAIN = DEFAULT_MONITOR.trainTo;
const N = DEFAULT_SPEC.months;

// Geometry: month 1 at the right (time runs leftward), as the other charts of the course.
const W = 640;
const H1 = 200;
const H2 = 130;
const PAD = 14;
const x = (m: number) => W - PAD - ((m - 1) / (N - 1)) * (W - 2 * PAD);
const yMin = 0.7;
const yMax = computed(() => Math.max(1.6, ...series.value.map(spreadOf)) + 0.05);
const y1 = (v: number) => H1 - 16 - ((v - yMin) / (yMax.value - yMin)) * (H1 - 30);
const eMax = computed(() => Math.max(0.3, run.value.threshold.toNumber() * 1.6, ...run.value.errors.map((e) => e.toNumber())));
const y2 = (v: number) => H2 - 12 - (v / eMax.value) * (H2 - 26);

const belief1 = computed(() => run.value.v1.spread.toNumber());
const belief2 = computed(() => run.value.v2?.spread.toNumber() ?? null);
const rollingPts = computed(() =>
  run.value.rolling.flatMap((r, i) => (r === null ? [] : [`${x(TRAIN + 1 + i).toFixed(1)},${y2(r.toNumber()).toFixed(1)}`])).join(" "),
);
const f4 = (v: Decimal | null | undefined) => (v === null || v === undefined ? "—" : r4(v));

const rows = computed(() =>
  run.value.errors.map((e, i) => ({
    month: TRAIN + 1 + i,
    spread: spreadOf(series.value[TRAIN + i]).toFixed(2),
    err: r4(e),
    rolling: f4(run.value.rolling[i]),
  })),
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">נתונים סינתטיים. בנק בדוי, מודל עם מספר אחד (המרווח מעל העוגן, שהותאם על חודשים 1 עד {{ TRAIN }}). הגדלים של ההתראה ושל האימון מחדש להדגמה, לא החלטה של Mogi.</p>

    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">החודש שבו המרווח של הבנק משתנה</span>
        <input v-model.number="changeAt" type="range" min="27" max="55" step="1" />
        <span class="text-body-l font-semibold text-n900">חודש {{ changeAt }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">גודל הקפיצה במרווח (נקודות אחוז)</span>
        <input v-model.number="jump" type="range" min="0" max="0.6" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ jump.toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">רעש בין חודש לחודש</span>
        <input v-model.number="noise" type="range" min="0.01" max="0.05" step="0.01" />
        <span class="text-body-l font-semibold text-n900">±<span class="ltr">{{ (noise * 5).toFixed(2) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">רגישות ההתראה: פי כמה מהשגיאה הרגילה</span>
        <input v-model.number="factor" type="range" min="2" max="6" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ factor }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה חודשים בממוצע הרץ</span>
        <input v-model.number="windowN" type="range" min="2" max="8" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ windowN }} חודשים</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">כמה חודשים אחרונים לאימון מחדש</span>
        <input v-model.number="retrain" type="range" min="2" max="24" step="1" />
        <span class="text-body-l font-semibold text-n900">{{ retrain }} חודשים</span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-4">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההתראה נשמעת בחודש</p>
        <p class="text-h2 text-navy">{{ run.alarmMonth ?? "אף פעם" }}</p>
        <p v-if="run.delay !== null" class="text-caption text-n600">{{ run.delay < 0 ? "לפני השינוי: התראת שווא (רעש)" : run.delay === 0 ? "בחודש השינוי" : run.delay === 1 ? "חודש אחד אחרי השינוי" : `${run.delay} חודשים אחרי השינוי` }}</p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">שגיאה ממוצעת בחודשים תקינים</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ f4(run.v1Healthy) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">אחרי ההתראה: המודל הישן</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ f4(run.v1After) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">אחרי ההתראה: אחרי אימון מחדש</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ f4(run.v2After) }}</span></p>
      </div>
    </div>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-n300)"></span>המרווח שהבנק נתן בכל חודש</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-5" style="background: var(--mogi-teal-deep)"></span>מה שהמודל הישן מאמין</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-5 border-t-2 border-dashed" style="border-color: var(--mogi-turquoise-2)"></span>המודל אחרי אימון מחדש</li>
      <li class="flex items-center gap-2"><span class="inline-block h-0.5 w-5 border-t-2 border-dashed" style="border-color: var(--mogi-navy)"></span>סף ההתראה</li>
    </ul>

    <svg :viewBox="`0 0 ${W} ${H1}`" class="mt-3 w-full" role="img" aria-label="גרף: המרווח שהבנק נתן בכל חודש והמרווח שהמודל מאמין בו">
      <rect :x="x(TRAIN)" :y="8" :width="x(1) - x(TRAIN) + 4" :height="H1 - 24" fill="var(--mogi-n50)" />
      <line v-if="changeAt <= N" :x1="x(changeAt)" :x2="x(changeAt)" y1="8" :y2="H1 - 16" stroke="var(--mogi-n500)" stroke-dasharray="4 4" />
      <line :x1="PAD" :x2="W - PAD" :y1="y1(belief1)" :y2="y1(belief1)" stroke="var(--mogi-teal-deep)" stroke-width="2" />
      <line
        v-if="belief2 !== null && run.alarmMonth !== null"
        :x1="PAD"
        :x2="x(run.alarmMonth)"
        :y1="y1(belief2)"
        :y2="y1(belief2)"
        stroke="var(--mogi-turquoise-2)"
        stroke-width="2"
        stroke-dasharray="6 4"
      />
      <circle v-for="(p, i) in series" :key="i" :cx="x(p.t)" :cy="y1(spreadOf(p))" r="3" fill="var(--mogi-n400)" />
      <line v-if="run.alarmMonth !== null" :x1="x(run.alarmMonth)" :x2="x(run.alarmMonth)" y1="8" :y2="H1 - 16" stroke="var(--mogi-danger)" stroke-width="2" />
    </svg>
    <p class="text-caption text-n600">החודשים רצים מימין לשמאל. האזור האפור: חודשי האימון. הקו המקווקו האפור: החודש שבו הבנק משתנה. הקו האדום: ההתראה.</p>

    <svg :viewBox="`0 0 ${W} ${H2}`" class="mt-3 w-full" role="img" aria-label="גרף: השגיאה הממוצעת הרצה מול סף ההתראה">
      <line :x1="PAD" :x2="W - PAD" :y1="y2(run.threshold.toNumber())" :y2="y2(run.threshold.toNumber())" stroke="var(--mogi-navy)" stroke-dasharray="6 4" stroke-width="2" />
      <polyline :points="rollingPts" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="2.5" />
      <line v-if="run.alarmMonth !== null" :x1="x(run.alarmMonth)" :x2="x(run.alarmMonth)" y1="6" :y2="H2 - 12" stroke="var(--mogi-danger)" stroke-width="2" />
    </svg>
    <p class="text-caption text-n600">השגיאה הממוצעת בחלון האחרון, מול הסף: <span class="ltr">{{ f4(run.threshold) }}</span>.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0">
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">חודש</th>
            <th class="py-2 text-start">המרווח שניתן</th>
            <th class="py-2 text-start">שגיאה של המודל הישן</th>
            <th class="py-2 text-start">הממוצע הרץ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.month" class="border-b border-n100" :class="r.month === run.alarmMonth ? 'bg-danger-bg' : ''">
            <td class="py-1">{{ r.month }}</td>
            <td class="py-1"><span class="ltr">{{ r.spread }}</span></td>
            <td class="py-1"><span class="ltr">{{ r.err }}</span></td>
            <td class="py-1"><span class="ltr">{{ r.rolling }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
