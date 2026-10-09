<script setup lang="ts">
// Lesson 1.4's illustration: one loan cut into slices — tracks. The learner picks
// how many tracks (1 to 4) and each track's share of the loan; the last track
// always takes what is left, so the tracks add up to the loan exactly. Each track
// can be marked "its interest rate can move" (lesson 1.3's interest mechanism),
// and the box sums the share whose rate can move. Amounts from mix.ts.
import Decimal from "decimal.js";
import { computed, reactive, ref } from "vue";
import { splitByWeights, sum } from "../lib/calc/mix.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";

const props = withDefaults(defineProps<{ loan: number; shares?: number[]; moving?: boolean[] }>(), {
  shares: () => [40, 35, 25],
  moving: () => [false, true, true],
});

const MAX = 4;
const MIN_SHARE = 5;
const count = ref(Math.min(Math.max(props.shares.length, 1), MAX));
const shares = reactive<number[]>(Array.from({ length: MAX }, (_, i) => props.shares[i] ?? 0));
const moving = reactive<boolean[]>(Array.from({ length: MAX }, (_, i) => props.moving[i] ?? false));
const showTable = ref(false);

/** A fresh, near-equal split in whole percents when the number of tracks changes: 100 ÷ 3 → 33, 33, 34. */
function evenSplit(n: number) {
  const each = Math.floor(100 / n);
  for (let i = 0; i < MAX; i++) shares[i] = i < n ? each : 0;
}
/** Picking a number of tracks (even the current one) starts again from a near-equal split. */
function choose(n: number) {
  count.value = n;
  evenSplit(n);
}

// Every track but the last has a slider; the last takes the rest.
const lastShare = computed(() => 100 - shares.slice(0, count.value - 1).reduce((s, v) => s + v, 0));
const finalShares = computed(() => [...shares.slice(0, count.value - 1), lastShare.value]);
function setShare(i: number, value: number) {
  const others = shares.slice(0, count.value - 1).reduce((s, v, j) => (j === i ? s : s + v), 0);
  shares[i] = Math.max(MIN_SHARE, Math.min(value, 100 - MIN_SHARE - others));
}
const maxFor = (i: number) => 100 - MIN_SHARE - shares.slice(0, count.value - 1).reduce((s, v, j) => (j === i ? s : s + v), 0);

const amounts = computed(() => splitByWeights(props.loan, finalShares.value));
const total = computed(() => sum(amounts.value));
const movingShare = computed(() => finalShares.value.reduce((s, v, i) => (moving[i] ? s + v : s), 0));
const movingAmount = computed(() => amounts.value.reduce((s, a, i) => (moving[i] ? s.plus(a) : s), new Decimal(0)));
const colour = (i: number) => (moving[i] ? "var(--mogi-turquoise-2)" : "var(--mogi-teal-deep)");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">ההלוואה: <span class="ltr font-semibold text-n900">{{ formatShekelsText(loan) }}</span>. החלוקה להמחשה בלבד; היא לא המלצה.</p>

    <div class="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="כמה מסלולים">
      <span class="text-caption font-semibold text-n600">כמה מסלולים:</span>
      <button
        v-for="k in MAX"
        :key="k"
        type="button"
        class="h-11 w-11 rounded-md border text-body-m font-semibold transition-colors duration-fast ease-out"
        :class="count === k ? 'border-navy bg-n100 text-navy' : 'border-n200 text-n700 hover:bg-n50'"
        :aria-pressed="count === k"
        @click="choose(k)"
      >
        {{ k }}
      </button>
    </div>

    <!-- The loan as one bar, cut into tracks. Track 1 sits at the start (the right, in RTL). -->
    <div class="mt-5 flex h-12 w-full gap-0.5 overflow-hidden rounded-md" aria-hidden="true">
      <div v-for="(s, i) in finalShares" :key="i" :style="{ flex: `${s} 1 0%`, background: colour(i) }"></div>
    </div>
    <div class="mt-1 flex w-full gap-0.5 text-caption text-n700" aria-hidden="true">
      <span v-for="(s, i) in finalShares" :key="i" class="min-w-0 text-center" :style="{ flex: `${s} 1 0%` }">{{ s >= 20 ? `מסלול ${i + 1}` : i + 1 }}</span>
    </div>
    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-teal-deep)"></span>אחוז הריבית נקבע לכל התקופה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>אחוז הריבית יכול לזוז</li>
    </ul>

    <!-- One card per track: its share, its amount, its interest mechanism. -->
    <ul class="list-reset mt-4 grid gap-3 sm:grid-cols-2">
      <li v-for="(s, i) in finalShares" :key="i" class="rounded-md border border-n200 p-3">
        <p class="flex items-center gap-2 text-body-m font-semibold text-n900">
          <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colour(i) }" aria-hidden="true"></span>
          מסלול {{ i + 1 }}
        </p>
        <label v-if="i < count - 1" class="mt-2 flex flex-col gap-1">
          <span class="text-caption font-semibold text-n600">חלק מההלוואה</span>
          <input
            type="range"
            :min="MIN_SHARE"
            :max="maxFor(i)"
            step="1"
            :value="shares[i]"
            :aria-label="`חלק מההלוואה, מסלול ${i + 1}`"
            @input="setShare(i, Number(($event.target as HTMLInputElement).value))"
          />
        </label>
        <p v-else-if="count > 1" class="mt-2 text-caption text-n600">המסלול האחרון לוקח את מה שנשאר.</p>
        <p class="mt-1 text-body-l text-n900"><span class="ltr font-semibold">{{ s }}%</span> · <span class="ltr">{{ formatShekels(amounts[i]) }}</span></p>
        <label class="mt-2 flex min-h-11 items-center gap-2 text-body-m text-n800">
          <input v-model="moving[i]" type="checkbox" class="h-5 w-5 accent-teal-deep" />
          אחוז הריבית יכול לזוז
        </label>
      </li>
    </ul>

    <div class="mt-4 grid gap-2 rounded-md bg-n50 p-3 text-body-m text-n800 sm:grid-cols-2">
      <p>כל המסלולים יחד: <span class="ltr font-semibold text-n900">{{ formatShekels(total) }}</span></p>
      <p>החלק שבו אחוז הריבית יכול לזוז: <span class="ltr font-semibold text-n900">{{ movingShare }}%</span> (<span class="ltr">{{ formatShekelsText(movingAmount) }}</span>)</p>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 text-start font-semibold">מסלול</th>
            <th class="py-1 text-start font-semibold">סכום</th>
            <th class="py-1 text-start font-semibold">חלק מההלוואה</th>
            <th class="py-1 text-start font-semibold">אחוז הריבית</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in finalShares" :key="i" class="border-b border-n100">
            <td class="py-1">{{ i + 1 }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(amounts[i]) }}</span></td>
            <td class="py-1"><span class="ltr">{{ s }}%</span></td>
            <td class="py-1">{{ moving[i] ? "יכול לזוז" : "נקבע לכל התקופה" }}</td>
          </tr>
          <tr class="font-semibold text-n900">
            <td class="py-1">יחד</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(total) }}</span></td>
            <td class="py-1"><span class="ltr">100%</span></td>
            <td class="py-1">יכול לזוז: <span class="ltr">{{ movingShare }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
