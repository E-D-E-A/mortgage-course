<script setup lang="ts">
// A tiny linear programme you can see (lesson 8.16): two tracks (a long and a short one), three straight-line conditions. The allowed region
// is a polygon, the best answer sits at one of its corners. The learner moves the largest monthly payment and the
// amount to cover; the corners, the shaded
// region and the best corner follow. Computed by the course's lp.ts. Synthetic data, for illustration only; this is
// not a solver Mogi uses and the method fits only conditions and costs that are straight lines.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { allCrossings, solveLp, type Condition } from "../lib/calc/lp.ts";

const props = defineProps<{
  /** Payment per 100,000 ₪ per month: [long track, short track]. */
  pay: [string, string];
  /** Total paid per 100,000 ₪: [long track, short track]. */
  cost: [string, string];
  cap: number;
  need: number;
}>();

const cap = ref(props.cap);
const need = ref(props.need);
const showTable = ref(false);

const cond = computed<Condition[]>(() => [
  { label: "כיסוי ההלוואה", a: ["-1", "-1"], b: String(-need.value) },
  { label: "לפחות 40% בארוכה", a: ["-3", "2"], b: "0" },
  { label: "ההחזר החודשי", a: props.pay, b: String(cap.value) },
]);
// The answer is solved to ten decimals, like the lesson's facts (a shekel amount must not move because of rounding); the crossings table shows two.
const problem = computed(() => ({ c: props.cost, goal: "min" as const, conditions: cond.value, decimals: 10 }));
const result = computed(() => solveLp(problem.value));
const crossings = computed(() => allCrossings({ ...problem.value, decimals: 2 }));
const shek = (x: string) => String(Math.round(Number(x) * 100000));

const M = 14;
const W = 520;
const H = 360;
const pad = { l: 36, r: 12, t: 12, b: 30 };
const sx = (x: number) => W - pad.r - (x / M) * (W - pad.l - pad.r); // x runs leftward, as Hebrew is read
const sy = (y: number) => H - pad.b - (y / M) * (H - pad.t - pad.b);
const lineEnds = (c: Condition) => {
  // Two points on a·x = b inside the box 0..M.
  const a0 = new Decimal(c.a[0]);
  const a1 = new Decimal(c.a[1]);
  const b = new Decimal(c.b);
  const pts: [number, number][] = [];
  for (const x of [0, M]) if (!a1.isZero()) pts.push([x, b.minus(a0.mul(x)).div(a1).toNumber()]);
  if (pts.length < 2 || pts.some((p) => !Number.isFinite(p[1]))) return null;
  return pts;
};
const polygon = computed(() => {
  const pts = result.value.corners.map((c) => [Number(c.x), Number(c.y)] as [number, number]);
  if (pts.length < 3) return "";
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts
    .sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx))
    .map(([x, y]) => `${sx(x)},${sy(y)}`)
    .join(" ");
});
const best = computed(() => result.value.best[0]);
const money = (v: string) => new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(Number(v));
const units = (v: string) => new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v));
const ok = (b: boolean) => (b ? "אפשרית" : "לא אפשרית");
const status = computed(() => result.value.status);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההחזר החודשי המרבי</span>
        <input v-model.number="cap" type="range" min="4900" max="7000" step="50" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ money(String(cap)) }} ₪</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הסכום שחייבים לכסות (במאות אלפי ₪)</span>
        <input v-model.number="need" type="range" min="8" max="12" step="0.5" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ need }}</span> = <span class="ltr">{{ money(String(need * 100000)) }} ₪</span></span>
      </label>
    </div>

    <div v-if="status === 'optimal'" class="mt-4 rounded-md bg-n50 p-3" role="status">
      <p class="text-caption text-n600">הפינה הטובה ביותר (העלות הנמוכה ביותר)</p>
      <p class="text-h3 text-navy">
        ארוכה (30 שנה) <span class="ltr">{{ money(shek(best.x)) }} ₪</span> · קצרה (15 שנה) <span class="ltr">{{ money(shek(best.y)) }} ₪</span>
      </p>
      <p class="text-caption text-n700">סך התשלומים: <span class="ltr">{{ money(best.value) }} ₪</span></p>
    </div>
    <p v-else class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800" role="status">
      {{ status === "infeasible" ? "אין שום פתרון שעומד בכל התנאים: האזור המותר ריק." : "אין פינה טובה ביותר: אפשר להמשיך להשתפר בלי סוף." }}
    </p>

    <ul class="list-reset mt-5 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2); opacity: 0.35"></span>האזור המותר</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-teal-deep)"></span>פינה אפשרית</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full border-2" style="border-color: var(--mogi-navy)"></span>הפינה הטובה ביותר</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-full" style="background: var(--mogi-n300)"></span>חיתוך שלא עומד בתנאי</li>
    </ul>

    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-3 w-full" role="img" aria-label="גרף: האזור המותר של שני המסלולים, פינותיו, והפינה הטובה ביותר">
      <line :x1="sx(0)" :x2="sx(M)" :y1="sy(0)" :y2="sy(0)" stroke="var(--mogi-n300)" />
      <line :x1="sx(0)" :x2="sx(0)" :y1="sy(0)" :y2="sy(M)" stroke="var(--mogi-n300)" />
      <polygon v-if="polygon" :points="polygon" fill="var(--mogi-turquoise-2)" fill-opacity="0.35" />
      <template v-for="c in cond" :key="c.label">
        <line v-if="lineEnds(c)" :x1="sx(lineEnds(c)![0][0])" :y1="sy(lineEnds(c)![0][1])" :x2="sx(lineEnds(c)![1][0])" :y2="sy(lineEnds(c)![1][1])" stroke="var(--mogi-n400)" stroke-dasharray="5 4" />
      </template>
      <circle
        v-for="(c, k) in crossings.filter((q) => Number(q.x) <= M && Number(q.y) <= M)"
        :key="k"
        :cx="sx(Number(c.x))"
        :cy="sy(Number(c.y))"
        :r="c.feasible ? 6 : 4"
        :fill="c.feasible ? 'var(--mogi-teal-deep)' : 'var(--mogi-n300)'"
      />
      <circle v-if="best" :cx="sx(Number(best.x))" :cy="sy(Number(best.y))" r="11" fill="none" stroke="var(--mogi-navy)" stroke-width="3" />
    </svg>
    <p class="text-center text-caption text-n600">הציר האופקי: סכום במסלול הארוך (גדל לשמאל) · האנכי: סכום במסלול הקצר · יחידות של 100,000 ₪</p>

    <button type="button" class="mt-3 inline-flex min-h-11 items-center text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">חיתוך של</th>
            <th class="py-2 pe-2 text-start">ארוכה</th>
            <th class="py-2 pe-2 text-start">קצרה</th>
            <th class="py-2 pe-2 text-start">מצב</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, k) in crossings" :key="k" class="border-b border-n100 align-top">
            <td class="py-1 pe-2">{{ c.lines.join(" ו") }}</td>
            <td class="py-1 pe-2"><span class="ltr">{{ units(c.x) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ units(c.y) }}</span></td>
            <td class="py-1 pe-2">{{ ok(c.feasible) }}{{ c.breaks.length ? `: שובר ${c.breaks.join(", ")}` : "" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
