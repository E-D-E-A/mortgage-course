<script setup lang="ts">
// Lesson 8.8: weights of the goals. The learner moves three weights (how much a low first payment, a low total and a low
// exposure count) and sees, for a fixed set of candidate mixes, each goal's value, the normalised value (0 = best of the
// set, 1 = worst), the weighted score, and who wins. A switch shows what happens if the hard limits are forgotten.
// Every number comes from objectives.ts (the lesson passes the candidates' values, which the engine computed).
// ILLUSTRATION: the weights are "for illustration" - not a Mogi decision and not a bank's policy.
import { computed, ref } from "vue";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { OBJECTIVES, scoreRows, scoreText, winnersOnLattice } from "../lib/calc/objectives.ts";

interface Row {
  id: string;
  name: string;
  first: string;
  total: string;
  rise: string;
  feasible: boolean;
}

const props = withDefaults(defineProps<{ rows: Row[]; weights?: number[] }>(), { weights: () => [40, 30, 30] });

const w = ref<number[]>([...props.weights]);
const ignoreLimits = ref(false);
const showCards = ref(false);

const total = computed(() => w.value.reduce((s, x) => s + x, 0));
const share = computed(() => (total.value === 0 ? w.value.map(() => 0) : w.value.map((x) => Math.round((100 * x) / total.value))));

const input = computed(() => props.rows.map((r) => ({ id: r.id, values: [r.first, r.total, r.rise], feasible: ignoreLimits.value ? true : r.feasible })));
const scored = computed(() => (total.value === 0 ? [] : scoreRows(input.value, w.value)));
const byId = computed(() => Object.fromEntries(scored.value.map((s) => [s.id, s])));
const winner = computed(() => scored.value.find((s) => s.rank === 1)?.id ?? null);
const nameOf = (id: string) => props.rows.find((r) => r.id === id)?.name ?? id;
const barMax = computed(() => Math.max(1, ...scored.value.filter((s) => s.rank !== null).map((s) => s.score.toNumber())));
const lattice = computed(() => winnersOnLattice(input.value, 10).distinct);
const fmt = (v: { toString(): string }) => new Intl.NumberFormat("he-IL", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(Number(v.toString())).replace("-", "−");
const reset = () => (w.value = [...props.weights]);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">הדגמה: המשקולות להדגמה בלבד, לא החלטה של Mogi ולא מדיניות של בנק. נתונים סינתטיים.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <label v-for="(o, j) in OBJECTIVES" :key="o.id" class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">משקל: {{ o.nameHe }}</span>
        <input v-model.number="w[j]" type="range" min="0" max="100" step="5" :aria-label="`משקל ${o.nameHe}`" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ w[j] }}</span> <span class="text-caption font-normal text-n600">(<span class="ltr">{{ share[j] }}%</span> מהמשקל הכולל)</span></span>
      </label>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-4">
      <label class="flex min-h-[44px] items-center gap-2 text-body-m text-n800">
        <input v-model="ignoreLimits" type="checkbox" class="h-5 w-5" />
        להתעלם מהגבולות (כאילו כל התמהילים עוברים)
      </label>
      <button type="button" class="min-h-[44px] text-body-m text-navy underline" @click="reset">חזרה למשקולות ההתחלה</button>
    </div>

    <p v-if="total === 0" class="mt-4 rounded-md bg-warning-bg p-3 text-body-m text-n900" role="status">כל המשקולות אפס: אין על מה לבחור. הזיזו לפחות אחד.</p>
    <p v-else class="mt-4 rounded-md bg-n50 p-3 text-body-l text-n900" role="status">
      המנצח: <strong>{{ winner ? nameOf(winner) : "אין תמהיל שעובר" }}</strong>
      <span v-if="winner" class="text-body-m text-n700"> · ציון <span class="ltr">{{ scoreText(byId[winner].score) }}</span> (נמוך הוא טוב)</span>
    </p>

    <ul class="list-reset mt-4 space-y-2" aria-label="ציונים">
      <li v-for="r in rows" :key="r.id" class="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3">
        <span class="text-body-m" :class="byId[r.id] && byId[r.id].rank === null ? 'text-n600' : 'font-semibold text-n900'">{{ r.name }}</span>
        <span class="block h-4 rounded bg-n100" aria-hidden="true">
          <span
            v-if="byId[r.id] && byId[r.id].rank !== null"
            class="block h-4 rounded"
            :style="{ width: Math.max(2, (100 * byId[r.id].score.toNumber()) / barMax) + '%', background: r.id === winner ? 'var(--mogi-teal-deep)' : 'var(--mogi-n300)' }"
          ></span>
        </span>
        <span class="ltr text-caption text-n700">{{ byId[r.id] ? (byId[r.id].rank === null ? "לא עובר" : scoreText(byId[r.id].score)) : "" }}</span>
      </li>
    </ul>

    <p class="mt-3 text-body-m text-n700">
      על כל שילוב משקולות בקפיצות של 10% (66 שילובים) מנצחים <strong><span class="ltr">{{ lattice.length }}</span></strong> תמהילים שונים: {{ lattice.map(nameOf).join(", ") }}.
    </p>

    <button type="button" class="mt-3 min-h-[44px] text-body-m text-navy underline" :aria-expanded="showCards" @click="showCards = !showCards">
      {{ showCards ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showCards" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">התמהיל</th>
            <th class="py-2 pe-2 text-start">החזר ראשון</th>
            <th class="py-2 pe-2 text-start">סך תשלומים</th>
            <th class="py-2 pe-2 text-start">חשיפה</th>
            <th class="py-2 pe-2 text-start">מנורמל (3)</th>
            <th class="py-2 pe-2 text-start">ציון</th>
            <th class="py-2 pe-2 text-start">דירוג</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-n100" :class="r.id === winner ? 'bg-mint' : ''">
            <td class="py-1 pe-2 font-semibold">{{ r.name }}</td>
            <td class="py-1 pe-2"><span class="ltr whitespace-nowrap">{{ formatWholeShekels(r.first) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr whitespace-nowrap">{{ formatWholeShekels(r.total) }}</span></td>
            <td class="py-1 pe-2"><span class="ltr whitespace-nowrap">{{ formatWholeShekels(r.rise) }}</span></td>
            <td class="py-1 pe-2"><span v-if="byId[r.id]" class="ltr whitespace-nowrap">{{ byId[r.id].normalised.map(fmt).join(" · ") }}</span></td>
            <td class="py-1 pe-2"><span v-if="byId[r.id]" class="ltr">{{ scoreText(byId[r.id].score) }}</span></td>
            <td class="py-1 pe-2"><span v-if="byId[r.id]">{{ byId[r.id].rank ?? "לא עובר" }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="mt-2 text-caption text-n600">מנורמל: 0 הוא הטוב ביותר בקבוצה בכל יעד, 1 הגרוע ביותר; ערך מחוץ לטווח 0–1 שייך לתמהיל שלא עובר ונמדד לפי הסולם של התמהילים שכן עוברים.</p>
    </div>
  </div>
</template>
