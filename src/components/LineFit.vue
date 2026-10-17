<script setup lang="ts">
// Lesson 8.5: fit a line to ten invented offers (financing ratio against margin). The learner moves the slope and the intercept and
// watches the mean absolute error and the root mean squared error; a button jumps to the least-squares line. Computed by stats.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { errors, formatPlain, linearFit, predict, residuals } from "../lib/calc/stats.ts";
import { MARGIN_POINTS } from "../data/s8-datasets.ts";

const props = withDefaults(defineProps<{ points?: { x: number; y: number }[]; note?: string }>(), { points: () => MARGIN_POINTS, note: "" });
const best = computed(() => linearFit(props.points));
const a = ref(0.01);
const b = ref(0.7);
const mine = computed(() => ({ a: a.value, b: b.value }));
const myErr = computed(() => errors(props.points, mine.value));
const bestErr = computed(() => errors(props.points, best.value));
const res = computed(() => residuals(props.points, mine.value));
const showBest = ref(false);
const showTable = ref(false);
function useBest() {
  a.value = Number(best.value.a.toDecimalPlaces(4).toString());
  b.value = Number(best.value.b.toDecimalPlaces(3).toString());
}
const W = 640;
const H = 260;
const PAD = 30;
const xs = computed(() => props.points.map((p) => p.x));
const ys = computed(() => props.points.map((p) => p.y));
const x0 = computed(() => Math.min(...xs.value) - 3);
const x1 = computed(() => Math.max(...xs.value) + 3);
const y0 = computed(() => Math.min(...ys.value) - 0.1);
const y1 = computed(() => Math.max(...ys.value) + 0.1);
const sx = (x: number) => PAD + ((x - x0.value) / (x1.value - x0.value)) * (W - 2 * PAD);
const sy = (y: number) => H - PAD - ((y - y0.value) / (y1.value - y0.value)) * (H - 2 * PAD);
const f = (e: Decimal, d = 3) => formatPlain(e, d);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">נתונים סינתטיים: עשר הצעות בדויות של בנק בדוי. אופקי: שיעור המימון (אחוזים). אנכי: המרווח מעל העוגן (נקודות אחוז). הקו מתאר את הנקודות האלה בלבד, לא את מה שבנקים עושים.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">שיפוע: כמה המרווח עולה על כל נקודת אחוז של מימון</span><input v-model.number="a" type="range" min="0" max="0.03" step="0.0005" /><span class="text-body-l font-semibold text-n900"><span class="ltr">{{ a }}</span></span></label>
      <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">נקודת ההתחלה: המרווח כשהמימון 0</span><input v-model.number="b" type="range" min="0" max="1.5" step="0.01" /><span class="text-body-l font-semibold text-n900"><span class="ltr">{{ b }}</span></span></label>
    </div>

    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-4 w-full" role="img" aria-label="נקודות וקו">
      <line :x1="PAD" :x2="W - PAD" :y1="H - PAD" :y2="H - PAD" stroke="var(--mogi-n300)" />
      <line :x1="PAD" :x2="PAD" :y1="PAD" :y2="H - PAD" stroke="var(--mogi-n300)" />
      <line v-for="(p, k) in points" :key="'e' + k" :x1="sx(p.x)" :x2="sx(p.x)" :y1="sy(p.y)" :y2="sy(Number(predict(mine, p.x).toString()))" stroke="var(--mogi-n300)" stroke-width="2" />
      <line :x1="sx(x0)" :x2="sx(x1)" :y1="sy(Number(predict(mine, x0).toString()))" :y2="sy(Number(predict(mine, x1).toString()))" stroke="var(--mogi-teal-deep)" stroke-width="3" />
      <line v-if="showBest" :x1="sx(x0)" :x2="sx(x1)" :y1="sy(Number(predict(best, x0).toString()))" :y2="sy(Number(predict(best, x1).toString()))" stroke="var(--mogi-navy)" stroke-width="2" stroke-dasharray="6 5" />
      <circle v-for="(p, k) in points" :key="k" :cx="sx(p.x)" :cy="sy(p.y)" r="5" fill="var(--mogi-turquoise-2)" stroke="var(--mogi-navy)" />
    </svg>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-turquoise-2)"></span>הצעה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-5" style="background: var(--mogi-teal-deep)"></span>הקו שלכם</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-1" style="background: var(--mogi-n300)"></span>הטעות של כל נקודה</li>
      <li v-if="showBest" class="flex items-center gap-2"><span class="inline-block h-0 w-5 border-t-2 border-dashed" style="border-color: var(--mogi-navy)"></span>הקו הטוב ביותר</li>
    </ul>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">הטעות הממוצעת (בערך מוחלט)</p><p class="text-h2 text-navy"><span class="ltr">{{ f(myErr.mae) }}</span></p><p v-if="showBest" class="text-caption text-n600">הקו הטוב ביותר: <span class="ltr">{{ f(bestErr.mae) }}</span></p></div>
      <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">שורש הטעות הריבועית הממוצעת</p><p class="text-h2 text-navy"><span class="ltr">{{ f(myErr.rmse) }}</span></p><p v-if="showBest" class="text-caption text-n600">הקו הטוב ביותר: <span class="ltr">{{ f(bestErr.rmse) }}</span></p></div>
    </div>
    <button type="button" class="mt-3 min-h-[44px] rounded-md border border-n300 px-4 text-body-m font-semibold text-navy" @click="showBest = true; useBest()">הראו את הקו הטוב ביותר</button>
    <p v-if="note" class="mt-2 text-caption text-n600">{{ note }}</p>

    <div class="block">
      <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">{{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}</button>
    </div>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 text-start">מימון</th><th class="py-2 text-start">מרווח</th><th class="py-2 text-start">הקו אומר</th><th class="py-2 text-start">טעות</th></tr></thead>
        <tbody>
          <tr v-for="(p, k) in points" :key="k" class="border-b border-n100"><td class="py-1"><span class="ltr">{{ p.x }}%</span></td><td class="py-1"><span class="ltr">{{ p.y }}</span></td><td class="py-1"><span class="ltr">{{ f(predict(mine, p.x)) }}</span></td><td class="py-1"><span class="ltr">{{ f(res[k]) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
