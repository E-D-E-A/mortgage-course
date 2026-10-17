<script setup lang="ts">
// Lesson 8.10: three paths of prime, year by year, under three kinds of statement about the future. The lesson passes the
// paths (computed by scenarios.ts, rechecked in Python); this component only draws them and lists them in a table.
// ILLUSTRATION: invented curves and tables - not market data, not a forecast.
import { computed, ref } from "vue";

interface Series {
  id: string;
  name: string;
  /** Prime's rate in each year, percent, as text. */
  values: string[];
}
const props = defineProps<{ series: Series[]; today: string }>();
const showTable = ref(false);
const on = ref<Record<string, boolean>>(Object.fromEntries(props.series.map((s) => [s.id, true])));
const years = computed(() => props.series[0]?.values.length ?? 0);
const all = computed(() => props.series.flatMap((s) => s.values.map(Number)));
const lo = computed(() => Math.floor(Math.min(...all.value) - 0.25));
const hi = computed(() => Math.ceil(Math.max(...all.value) + 0.25));
const W = 640;
const H = 240;
const PAD = { top: 14, bottom: 8, side: 12 };
// Year 1 at the right edge: time runs leftward, as Hebrew is read.
const x = (i: number) => W - PAD.side - (i / Math.max(1, years.value - 1)) * (W - 2 * PAD.side);
const y = (v: number) => H - PAD.bottom - ((v - lo.value) / (hi.value - lo.value)) * (H - PAD.top - PAD.bottom);
const path = (s: Series) => s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(Number(v)).toFixed(1)}`).join(" ");
const style = [
  { color: "var(--mogi-teal-deep)", dash: "none" },
  { color: "var(--mogi-navy)", dash: "7 5" },
  { color: "var(--mogi-turquoise-2)", dash: "none" },
];
const fmt = (v: string) => new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">הדגמה: עקומים ונתונים מומצאים, לא נתוני שוק ולא תחזית. נתונים סינתטיים.</p>
    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-1" aria-label="מקרא">
      <li v-for="(s, k) in series" :key="s.id" class="text-body-m text-n800">
        <label :for="`pp-${s.id}`" class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-2 py-2">
          <input :id="`pp-${s.id}`" v-model="on[s.id]" type="checkbox" class="h-6 w-6" />
          <svg width="30" height="8" aria-hidden="true"><line x1="0" x2="30" y1="4" y2="4" :stroke="style[k].color" stroke-width="3" :stroke-dasharray="style[k].dash" /></svg>
          {{ s.name }}
        </label>
      </li>
    </ul>
    <svg :viewBox="`0 0 ${W} ${H}`" class="mt-2 w-full" role="img" :aria-label="`גרף: הפריים בכל שנה, ${years} שנים, בשלושה תרחישים`">
      <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(Number(today))" :y2="y(Number(today))" stroke="var(--mogi-n300)" stroke-width="1" stroke-dasharray="2 4" />
      <template v-for="(s, k) in series" :key="s.id">
        <path v-if="on[s.id]" :d="path(s)" fill="none" :stroke="style[k].color" stroke-width="3" :stroke-dasharray="style[k].dash" />
      </template>
    </svg>
    <div class="flex justify-between text-caption text-n600" aria-hidden="true"><span>שנה 1</span><span>שנה {{ years }}</span></div>
    <p class="mt-1 text-caption text-n600">הקו המנוקד האפור: הפריים היום (<span class="ltr">{{ today }}%</span>). הציר האנכי לא מתחיל באפס.</p>
    <button type="button" class="mt-2 min-h-[44px] text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">שנה</th>
            <th v-for="s in series" :key="s.id" class="py-2 pe-3 text-start">{{ s.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in years" :key="i" class="border-b border-n100">
            <td class="py-1 pe-3"><span class="ltr">{{ i }}</span></td>
            <td v-for="s in series" :key="s.id" class="py-1 pe-3"><span class="ltr">{{ fmt(s.values[i - 1]) }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
