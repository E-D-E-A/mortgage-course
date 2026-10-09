<script setup lang="ts">
// Lesson 0.7's illustration: a shopping basket that gets more expensive.
// The learner moves the price change of each item and sees what the whole
// basket costs, its index (base period = 100) and the inflation it shows.
// Every number is computed by the course's calc module (indexation.ts).
import Decimal from "decimal.js";
import { computed, reactive, ref } from "vue";
import { basketCost, changePercent, indexValue, plainNumber } from "../lib/calc/indexation.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";

interface Item {
  name: string;
  unit: string;
  quantity: number;
  price: string;
}
const props = defineProps<{ items: Item[] }>();

// Percent change per item, as whole numbers from the sliders.
const changes = reactive<number[]>(props.items.map(() => 0));
const showTable = ref(false);

const newPrice = (i: number) => new Decimal(props.items[i].price).mul(new Decimal(100).plus(changes[i])).div(100);
const baseCost = computed(() => basketCost(props.items.map((it) => ({ quantity: it.quantity, price: it.price }))));
const nowCost = computed(() => basketCost(props.items.map((it, i) => ({ quantity: it.quantity, price: newPrice(i) }))));
const index = computed(() => indexValue(nowCost.value, baseCost.value));
const inflation = computed(() => changePercent(100, index.value));
const share = (i: number) =>
  plainNumber(new Decimal(props.items[i].quantity).mul(props.items[i].price).div(baseCost.value).mul(100));
const lineNow = (i: number) => new Decimal(props.items[i].quantity).mul(newPrice(i));
const lineBase = (i: number) => new Decimal(props.items[i].quantity).mul(props.items[i].price);
const signed = (n: number | string) => (Number(n) > 0 ? `+${n}%` : `${n}%`.replace("-", "−"));

// Bar geometry: two horizontal bars, the base basket and today's, split by item.
const maxCost = computed(() => Decimal.max(baseCost.value, nowCost.value).mul(1.05).toNumber());
const pct = (v: Decimal) => (v.toNumber() / maxCost.value) * 100;
const fills = ["var(--mogi-teal-deep)", "var(--mogi-turquoise-2)", "var(--mogi-n300)", "var(--mogi-n500)"];

function reset() {
  changes.forEach((_, i) => (changes[i] = 0));
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה: הסל, המחירים והכמויות בדויים.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label v-for="(it, i) in items" :key="it.name" class="flex flex-col gap-1">
        <span class="flex items-center gap-2 text-caption font-semibold text-n600">
          <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: fills[i % fills.length] }" aria-hidden="true"></span>
          {{ it.name }} ({{ it.quantity }} {{ it.unit }})
        </span>
        <input v-model.number="changes[i]" type="range" min="-30" max="50" step="5" :aria-label="`שינוי המחיר של ${it.name}`" />
        <span class="text-body-m text-n900">
          <span class="ltr">{{ formatShekelsText(it.price) }}</span> ←
          <span class="ltr font-semibold">{{ formatShekelsText(newPrice(i)) }}</span>
          <span class="ms-2 text-caption text-n600">שינוי <span class="ltr">{{ signed(changes[i]) }}</span> · <span class="ltr">{{ share(i) }}%</span> מהסל</span>
        </span>
      </label>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">הסל בתקופת הבסיס</p>
        <p class="text-h2 text-n700"><span class="ltr">{{ formatShekelsText(baseCost) }}</span></p>
        <p class="text-caption text-n600">המדד: 100</p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">אותו סל היום</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ formatShekelsText(nowCost) }}</span></p>
        <p class="text-caption text-n600">המדד: <span class="ltr">{{ plainNumber(index) }}</span></p>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">האינפלציה (שינוי המדד)</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ signed(plainNumber(inflation)) }}</span></p>
      </div>
    </div>

    <div class="mt-5 space-y-3" role="img" :aria-label="`הסל בתקופת הבסיס ${formatShekelsText(baseCost)}, היום ${formatShekelsText(nowCost)}`">
      <div v-for="row in [{ label: 'בסיס', now: false }, { label: 'היום', now: true }]" :key="row.label" class="flex items-center gap-3">
        <span class="w-10 shrink-0 text-caption text-n600">{{ row.label }}</span>
        <div class="flex h-7 flex-1 gap-px overflow-hidden rounded-sm bg-n100">
          <div
            v-for="(it, i) in items"
            :key="it.name"
            class="h-full"
            :style="{ width: `${pct(row.now ? lineNow(i) : lineBase(i))}%`, background: fills[i % fills.length] }"
          ></div>
        </div>
      </div>
    </div>
    <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li v-for="(it, i) in items" :key="it.name" class="flex items-center gap-2">
        <span class="inline-block h-3 w-3 rounded-sm" :style="{ background: fills[i % fills.length] }"></span>{{ it.name }}
      </li>
    </ul>

    <div class="mt-4 flex flex-wrap gap-4">
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="reset">איפוס</button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
      </button>
    </div>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[28rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">פריט</th>
            <th class="py-2 text-start">בבסיס</th>
            <th class="py-2 text-start">היום</th>
            <th class="py-2 text-start">שינוי</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, i) in items" :key="it.name" class="border-b border-n100">
            <td class="py-1">{{ it.name }}</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(lineBase(i)) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(lineNow(i)) }}</span></td>
            <td class="py-1"><span class="ltr">{{ signed(changes[i]) }}</span></td>
          </tr>
          <tr class="font-semibold text-n900">
            <td class="py-1">כל הסל</td>
            <td class="py-1"><span class="ltr">{{ formatShekels(baseCost) }}</span></td>
            <td class="py-1"><span class="ltr">{{ formatShekels(nowCost) }}</span></td>
            <td class="py-1"><span class="ltr">{{ signed(plainNumber(inflation)) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
