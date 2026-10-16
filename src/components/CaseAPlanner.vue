<script setup lang="ts">
// Lesson 6.11's illustration: case A's positioning plan, tried by hand. The learner picks what the
// family asks for (one of four mixes) and what happens to the car loan (it stays, it is closed from
// the equity, or the application waits until 18 payments are left), and sees how each of the four
// FICTIONAL banks reads that file under its invented rules (src/lib/calc/bankpolicy.ts, data in
// src/data/case-a-positioning.ts): the two ratios, the decision, the step, and the first payment and
// the total at the price the bank would put. Every number is computed by the calc modules.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { evaluate, type Verdict } from "../lib/calc/bankpolicy.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { measuresOf, scenarioFrom } from "../lib/calc/sensitivity.ts";
import { BANKS, REQUEST_IDS, REQUEST_NAME_HE, caseAFile, type RequestId } from "../data/case-a-positioning.ts";
import { SCENARIOS } from "../data/case-a-mix.ts";
import { save } from "../lib/progress.ts";

const props = defineProps<{ id: string; request?: RequestId }>();

type Car = "keep" | "close" | "wait";
const CAR_HE: Record<Car, string> = {
  keep: "נשארת: 26 תשלומים",
  close: "נסגרת מההון העצמי",
  wait: "מחכים עד שנשארים 18 תשלומים",
};
const request = ref<RequestId>(props.request ?? "initial");
const car = ref<Car>("keep");
const showTable = ref(false);

const file = computed(() => caseAFile(request.value, car.value === "close" ? { closeCar: true } : car.value === "wait" ? { carMonthsLeft: 18 } : {}));
const rows = computed(() =>
  BANKS.map((b) => {
    const v: Verdict = evaluate(b, file.value);
    const m = v.decision === "approve" ? measuresOf(v.finalTracks, scenarioFrom(SCENARIOS.base)) : null;
    return { bank: b, v, first: m?.first ?? null, total: m?.total ?? null };
  }),
);
const best = computed(() => {
  const ok = rows.value.filter((r) => r.total !== null);
  if (!ok.length) return null;
  return ok.reduce((a, r) => (r.total!.lt(a.total!) ? r : a)).bank.id;
});
const pct = (d: Decimal) => percentString(d);
const pts = (d: Decimal) => (d.isZero() ? "בלי תוספת" : `+${new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(d.toNumber())} נקודות אחוז`);
const why = (v: Verdict) =>
  v.decision === "refuse"
    ? v.lines.filter((l) => l.outcome === "refuse").map((l) => (l.id === "ratio" ? `יחס החזר מעל ${l.max}%` : `שיעור מימון מעל ${l.max}%`)).join(" וגם ")
    : "";
function pick() {
  save(`exercise:${props.id}`, { request: request.value, car: car.value });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <fieldset class="m-0 border-0 p-0">
      <legend class="text-body-m font-semibold text-n900">מה נועם ושירה מבקשים?</legend>
      <div class="mt-2 grid gap-2 sm:grid-cols-2">
        <label
          v-for="id in REQUEST_IDS"
          :key="id"
          class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-body-m"
          :class="request === id ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700'"
        >
          <input v-model="request" type="radio" :name="`${props.id}-request`" :value="id" class="size-5" @change="pick" />
          {{ REQUEST_NAME_HE[id] }}
        </label>
      </div>
    </fieldset>
    <fieldset class="m-0 mt-4 border-0 p-0">
      <legend class="text-body-m font-semibold text-n900">מה קורה להלוואת הרכב?</legend>
      <div class="mt-2 grid gap-2 sm:grid-cols-3">
        <label
          v-for="(label, key) in CAR_HE"
          :key="key"
          class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-body-m"
          :class="car === key ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700'"
        >
          <input v-model="car" type="radio" :name="`${props.id}-car`" :value="key" class="size-5" @change="pick" />
          {{ label }}
        </label>
      </div>
    </fieldset>

    <p class="mt-4 text-body-m text-n800">
      ההלוואה: <span class="font-semibold" dir="ltr">{{ formatWholeShekels(rows[0].v.loan) }}</span>
      · שיעור מימון: <span class="font-semibold" dir="ltr">{{ pct(rows[0].v.ltv) }}%</span>
      · הכנסה פנויה: <span class="font-semibold" dir="ltr">{{ formatWholeShekels(rows[0].v.disposable) }}</span>
    </p>

    <div class="mt-3 grid gap-3 sm:grid-cols-2" aria-live="polite">
      <div
        v-for="r in rows"
        :key="r.bank.id"
        class="rounded-md border-s-4 p-3"
        :class="r.v.decision === 'refuse' ? 'border-warning bg-warning-bg' : r.bank.id === best ? 'border-teal-deep bg-n50' : 'border-n300 bg-n50'"
      >
        <p class="text-body-m font-semibold text-n900">{{ r.bank.name }}: {{ r.v.decision === "refuse" ? "מסרב" : "מאשר" }}<span v-if="r.bank.id === best" class="ms-2 text-caption font-normal text-n700">(הסך הנמוך ביותר)</span></p>
        <p class="mt-1 text-caption text-n700">יחס החזר <span dir="ltr">{{ pct(r.v.ratio) }}%</span> לפי המחירון שלו</p>
        <p v-if="r.v.decision === 'refuse'" class="mt-1 text-body-m text-n800">סיבה: {{ why(r.v) }}.</p>
        <template v-else>
          <p class="mt-1 text-body-m text-n800">{{ pts(r.v.points) }}</p>
          <p class="mt-1 text-body-m text-n800">החזר ראשון <span class="font-semibold" dir="ltr">{{ formatWholeShekels(r.first!) }}</span> · סך תשלומים <span class="font-semibold" dir="ltr">{{ formatWholeShekels(r.total!) }}</span></p>
        </template>
      </div>
    </div>
    <p class="mt-3 text-caption text-n700">הבנקים בדויים וכללי ההחלטה שלהם בדויים. הריביות להמחשה. תרחיש בסיס: המדד עולה 2% בשנה והפריים לא זז. את הלוואת הרכב הנחנו בריבית של 6% לשנה כדי לחשב כמה עולה לסגור אותה.</p>

    <button type="button" class="mt-3 block min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">בנק</th>
            <th class="py-1 pe-3 text-start font-semibold">יחס החזר</th>
            <th class="py-1 pe-3 text-start font-semibold">החלטה</th>
            <th class="py-1 pe-3 text-start font-semibold">תוספת</th>
            <th class="py-1 pe-3 text-start font-semibold">החזר ראשון</th>
            <th class="py-1 text-start font-semibold">סך תשלומים</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.bank.id" class="border-b border-n100">
            <td class="py-1 pe-3 font-semibold text-n900">{{ r.bank.name }}</td>
            <td class="py-1 pe-3"><span dir="ltr">{{ pct(r.v.ratio) }}%</span></td>
            <td class="py-1 pe-3">{{ r.v.decision === "refuse" ? "סירוב" : "אישור" }}</td>
            <td class="py-1 pe-3">{{ r.v.decision === "refuse" ? "—" : pts(r.v.points) }}</td>
            <td class="py-1 pe-3"><span dir="ltr">{{ r.first ? formatWholeShekels(r.first) : "—" }}</span></td>
            <td class="py-1"><span dir="ltr">{{ r.total ? formatWholeShekels(r.total) : "—" }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
