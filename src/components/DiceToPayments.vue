<script setup lang="ts">
// Lesson 8.4: a toy die decides how a variable track's rate moves at its next reset; each face is a payment. The learner chooses
// the die (fair or loaded) and sees the probabilities, the expected payment and the chance of a payment above a line. A TOY:
// the market has no die (lesson 8.12 on when a probability may be attached). Computed by stats.ts and schedule.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { recalculatedPayment } from "../lib/calc/schedule.ts";
import { distribution, expectation, probabilityBetween } from "../lib/calc/stats.ts";
import { DICE, DIE_RATE_CHANGES } from "../data/s8-datasets.ts";

const props = withDefaults(defineProps<{ balance?: string; monthsLeft?: number; rate?: string; note?: string }>(), { balance: "500000", monthsLeft: 240, rate: "4.10", note: "" });

const diceNames = { fair: "קובייה הוגנת", loadedLow: "קובייה מוטה לריביות נמוכות", loadedHigh: "קובייה מוטה לריביות גבוהות" } as const;
type DieKey = keyof typeof diceNames;
const die = ref<DieKey>("fair");
const rows = computed(() => {
  const counts = DICE[die.value];
  return DIE_RATE_CHANGES.map((change, k) => {
    const newRate = new Decimal(props.rate).plus(change).toFixed(2);
    const pay = recalculatedPayment(props.balance, newRate, props.monthsLeft).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    return { face: k + 1, change, newRate, pay, count: counts[k] };
  });
});
const outcomes = computed(() => rows.value.map((r) => ({ value: r.pay, count: r.count })));
const total = computed(() => rows.value.reduce((s, r) => s + r.count, 0));
const expected = computed(() => expectation(outcomes.value));
const dist = computed(() => distribution(outcomes.value));
const line = ref(3056);
const above = computed(() => new Decimal(1).minus(probabilityBetween(outcomes.value, 0, line.value)));
const lo = computed(() => Math.min(...rows.value.map((r) => r.pay.toNumber())));
const hi = computed(() => Math.max(...rows.value.map((r) => r.pay.toNumber())));
const pct = (d: Decimal) => `${d.mul(100).toDecimalPlaces(1).toString()}%`;
const showTable = ref(false);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">משל: חוב של <span class="ltr">{{ formatShekels(balance) }}</span>, <span class="ltr">{{ monthsLeft }}</span> חודשים לסיום, ריבית <span class="ltr">{{ rate }}%</span> לשנה, ובנקודת העדכון הקרובה קובייה קובעת בכמה הריבית זזה. נתונים סינתטיים; הקובייה היא צעצוע, לא תחזית.</p>
    <fieldset class="mt-3">
      <legend class="text-caption font-semibold text-n600">איזו קובייה?</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label v-for="(name, key) in diceNames" :key="key" class="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-n200 px-3" :class="die === key ? 'bg-n50 font-semibold' : ''">
          <input v-model="die" type="radio" name="die" :value="key" />{{ name }}
        </label>
      </div>
    </fieldset>

    <ol class="list-reset mt-4 space-y-2">
      <li v-for="(r, k) in rows" :key="r.face" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-caption text-n700 sm:w-24 sm:text-body-m">פאה <span class="ltr">{{ r.face }}</span>: <span class="ltr">{{ r.change }}</span></span>
        <div class="h-6 min-w-0 flex-1 rounded-sm bg-n100">
          <div class="h-6 rounded-sm" :style="{ width: `${20 + ((r.pay.toNumber() - lo) / Math.max(1, hi - lo)) * 80}%`, background: r.pay.gt(line) ? 'var(--mogi-teal-deep)' : 'var(--mogi-n300)' }"></div>
        </div>
        <span class="w-24 shrink-0 text-end text-body-m font-semibold text-n900 sm:w-28"><span class="ltr">{{ formatShekels(r.pay) }}</span></span>
        <span class="hidden w-14 shrink-0 text-end text-caption text-n600 sm:inline"><span class="ltr">{{ r.count }}/{{ total }}</span></span>
      </li>
    </ol>

    <label class="mt-4 flex flex-col gap-1">
      <span class="text-caption font-semibold text-n600">קו: מה הסיכוי שההחזר יהיה גבוה מ־</span>
      <input v-model.number="line" type="range" :min="Math.floor(lo - 100)" :max="Math.ceil(hi + 100)" step="10" />
      <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(line) }}</span></span>
    </label>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">תוחלת ההחזר (ממוצע משוקלל בסיכויים)</p><p class="text-h2 text-navy"><span class="ltr">{{ formatShekels(expected) }}</span></p><p class="text-caption text-n600">לא בהכרח החזר שיכול לקרות</p></div>
      <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">הסיכוי להחזר גבוה מהקו</p><p class="text-h2 text-navy"><span class="ltr">{{ pct(above) }}</span></p><p class="text-caption text-n600">בקובייה הזו, לא בשוק</p></div>
    </div>
    <p v-if="note" class="mt-2 text-caption text-n600">{{ note }}</p>

    <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">{{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}</button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 text-start">פאה</th><th class="py-2 text-start">שינוי בריבית</th><th class="py-2 text-start">ריבית חדשה</th><th class="py-2 text-start">החזר</th><th class="py-2 text-start">סיכוי</th></tr></thead>
        <tbody>
          <tr v-for="(r, k) in rows" :key="r.face" class="border-b border-n100">
            <td class="py-1"><span class="ltr">{{ r.face }}</span></td><td class="py-1"><span class="ltr">{{ r.change }}</span></td><td class="py-1"><span class="ltr">{{ r.newRate }}%</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(r.pay) }}</span></td><td class="py-1"><span class="ltr">{{ pct(dist[k].probability) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
