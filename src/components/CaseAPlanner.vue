<script setup lang="ts">
// Lesson 6.11's illustration: case A's positioning plan, tried by hand. The learner pulls the four
// levers of lesson 6.4 — more equity from the savings, closing the car loan from the savings, waiting
// until the car loan stops counting, a parent as a second borrower — and sees where the case
// then stands (ratio, financing ratio, what is left of the savings) and how each of the four
// FICTIONAL banks reads it under its invented rules (src/lib/calc/bankpolicy.ts, data in
// src/data/case-a-positioning.ts): the decision, the relief, and the first payment and the total
// at the price the bank would put. Every number is computed by the calc modules.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { evaluate, type Verdict } from "../lib/calc/bankpolicy.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { positionOf } from "../lib/calc/levers.ts";
import { percentString } from "../lib/calc/percent.ts";
import { measuresOf, scenarioFrom } from "../lib/calc/sensitivity.ts";
import { BANKS, LEVER_NAME_HE, caseAfter, fileOf, movesFor, planEquity } from "../data/case-a-positioning.ts";
import { CASE_A_POSITION, CAR_PAYOFF, BORROWER_INCOME } from "../data/case-a-levers.ts";
import { SCENARIOS } from "../data/case-a-mix.ts";
import { save } from "../lib/progress.ts";

const props = defineProps<{ id: string }>();

const reserve = Number(CASE_A_POSITION.reserve);
const equity = ref(0);
const car = ref(false);
const wait = ref(false);
const parent = ref(false);
const showTable = ref(false);
const suggested = planEquity().toNumber();

const result = computed(() => {
  try {
    const moves = movesFor({ equity: equity.value, car: car.value, wait: wait.value, parent: parent.value });
    const c = caseAfter(moves);
    const p = positionOf(c);
    const file = fileOf(c);
    const rows = BANKS.map((b) => {
      const v: Verdict = evaluate(b, file);
      const m = v.decision === "approve" ? measuresOf(v.finalTracks, scenarioFrom(SCENARIOS.base)) : null;
      return { bank: b, v, first: m?.first ?? null, total: m?.total ?? null };
    });
    return { ok: true as const, p, rows };
  } catch (e) {
    return { ok: false as const, message: e instanceof RangeError ? "החסכונות לא מספיקים לכל המנופים שבחרתם." : "אי אפשר לחשב את השילוב הזה." };
  }
});
const best = computed(() => {
  if (!result.value.ok) return null;
  const ok = result.value.rows.filter((r) => r.total !== null);
  return ok.length ? ok.reduce((a, r) => (r.total!.lt(a.total!) ? r : a)).bank.id : null;
});
const pct = (d: Decimal) => percentString(d);
const pts = (d: Decimal) => (d.isZero() ? "במחירון" : `הנחה של ${new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(d.toNumber())} ${d.lt(1) ? "נקודת אחוז" : "נקודות אחוז"}`);
const why = (v: Verdict) => v.lines.filter((l) => l.outcome === "refuse").map((l) => (l.id === "ratio" ? `יחס החזר מעל ${l.max}%` : `שיעור מימון מעל ${l.max}%`)).join(" וגם ");
const cash = computed(() => equity.value + (car.value ? Number(CAR_PAYOFF) : 0));
function remember() {
  save(`exercise:${props.id}`, { equity: equity.value, car: car.value, wait: wait.value, parent: parent.value });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-body-m font-semibold text-n900">אילו מנופים מפעילים?</p>
    <div class="mt-2 rounded-md border border-n200 p-3">
      <label class="block text-body-m text-n800" :for="`${props.id}-equity`">{{ LEVER_NAME_HE.equity }}: <span class="font-semibold" dir="ltr">{{ formatWholeShekels(equity) }}</span></label>
      <input :id="`${props.id}-equity`" v-model.number="equity" type="range" min="0" :max="reserve" step="1000" class="mt-1 w-full" @change="remember" />
      <p class="text-caption text-n700">החסכונות שמחוץ להון העצמי: <span dir="ltr">{{ formatWholeShekels(reserve) }}</span>. הסכום שהתוכנית בוחרת בסדנה: <span dir="ltr">{{ formatWholeShekels(suggested) }}</span>.</p>
    </div>
    <div class="mt-2 grid gap-2 sm:grid-cols-3">
      <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-body-m" :class="car ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700'">
        <input v-model="car" type="checkbox" class="size-5" @change="remember" />
        <span>{{ LEVER_NAME_HE.car }}: <span dir="ltr">{{ formatWholeShekels(CAR_PAYOFF) }}</span></span>
      </label>
      <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-body-m" :class="wait ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700'">
        <input v-model="wait" type="checkbox" class="size-5" @change="remember" />
        {{ LEVER_NAME_HE.wait }}
      </label>
      <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-body-m" :class="parent ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700'">
        <input v-model="parent" type="checkbox" class="size-5" @change="remember" />
        <span>{{ LEVER_NAME_HE.parent }}: <span dir="ltr">{{ formatWholeShekels(BORROWER_INCOME) }}</span> בחודש</span>
      </label>
    </div>

    <div aria-live="polite">
      <p v-if="!result.ok" class="mt-4 rounded-md border-s-4 border-warning bg-warning-bg p-3 text-body-m text-n900">{{ result.message }}</p>
      <template v-else>
        <p class="mt-4 text-body-m text-n800">
          יחס החזר: <span class="font-semibold" dir="ltr">{{ pct(result.p.ratio) }}%</span>
          · שיעור מימון: <span class="font-semibold" dir="ltr">{{ pct(result.p.ltv) }}%</span>
          · מהחסכונות נשארו: <span class="font-semibold" dir="ltr">{{ formatWholeShekels(result.p.reserve) }}</span>
          · מזומן שיצא: <span class="font-semibold" dir="ltr">{{ formatWholeShekels(cash) }}</span>
        </p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <div
            v-for="r in result.rows"
            :key="r.bank.id"
            class="rounded-md border-s-4 p-3"
            :class="r.v.decision === 'refuse' ? 'border-warning bg-warning-bg' : r.bank.id === best ? 'border-teal-deep bg-n50' : 'border-n300 bg-n50'"
          >
            <p class="text-body-m font-semibold text-n900">{{ r.bank.name }}: {{ r.v.decision === "refuse" ? "מסרב" : "מאשר" }}<span v-if="r.bank.id === best" class="ms-2 text-caption font-normal text-n700">(הסך הנמוך ביותר)</span></p>
            <p class="mt-1 text-caption text-n700">יחס החזר <span dir="ltr">{{ pct(r.v.ratio) }}%</span> לפי המחירון שלו</p>
            <p v-if="r.v.decision === 'refuse'" class="mt-1 text-body-m text-n800">סיבה: {{ why(r.v) }}.</p>
            <template v-else>
              <p class="mt-1 text-body-m text-n800">{{ pts(r.v.relief) }}</p>
              <p class="mt-1 text-body-m text-n800">החזר ראשון <span class="font-semibold" dir="ltr">{{ formatWholeShekels(r.first!) }}</span> · סך תשלומים <span class="font-semibold" dir="ltr">{{ formatWholeShekels(r.total!) }}</span></p>
            </template>
          </div>
        </div>
      </template>
    </div>
    <p class="mt-3 text-caption text-n700">הבנקים בדויים, וכללי ההחלטה והריביות שלהם בדויים. תרחיש בסיס: המדד עולה 2% בשנה והפריים לא זז. החסכונות, סכום הסגירה של הלוואת הרכב והכנסת ההורה הם הנחות של הקורס.</p>

    <button type="button" class="mt-3 block min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable && result.ok" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">בנק</th>
            <th class="py-1 pe-3 text-start font-semibold">יחס החזר</th>
            <th class="py-1 pe-3 text-start font-semibold">החלטה</th>
            <th class="py-1 pe-3 text-start font-semibold">הנחה</th>
            <th class="py-1 pe-3 text-start font-semibold">החזר ראשון</th>
            <th class="py-1 text-start font-semibold">סך תשלומים</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in result.rows" :key="r.bank.id" class="border-b border-n100">
            <td class="py-1 pe-3 font-semibold text-n900">{{ r.bank.name }}</td>
            <td class="py-1 pe-3"><span dir="ltr">{{ pct(r.v.ratio) }}%</span></td>
            <td class="py-1 pe-3">{{ r.v.decision === "refuse" ? "סירוב" : "אישור" }}</td>
            <td class="py-1 pe-3">{{ r.v.decision === "refuse" ? "—" : pts(r.v.relief) }}</td>
            <td class="py-1 pe-3"><span dir="ltr">{{ r.first ? formatWholeShekels(r.first) : "—" }}</span></td>
            <td class="py-1"><span dir="ltr">{{ r.total ? formatWholeShekels(r.total) : "—" }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
