<script setup lang="ts">
// Lesson 8.3: build a histogram from thirty invented payment ratios. The learner moves the start and the width of the bins and
// sees how the same numbers look different; the mean, median and an upper percentile are marked. Computed by stats.ts.
import { computed, ref } from "vue";
import { histogram, mean, median, percentile, formatPlain } from "../lib/calc/stats.ts";
import { RATIOS_30 } from "../data/s8-datasets.ts";

const props = withDefaults(defineProps<{ values?: number[]; note?: string }>(), { values: () => RATIOS_30, note: "" });

const start = ref(24);
const width = ref(4);
const count = computed(() => Math.max(1, Math.ceil((50 - start.value) / width.value)));
const h = computed(() => histogram(props.values, { start: start.value, width: width.value, count: count.value }));
const tallest = computed(() => Math.max(1, ...h.value.bins.map((b) => b.count)));
const showTable = ref(false);
const m = computed(() => formatPlain(mean(props.values), 1));
const med = computed(() => formatPlain(median(props.values), 1));
const p90 = computed(() => formatPlain(percentile(props.values, 90), 1));
const label = (b: { lo: { toString(): string }; hi: { toString(): string } }) => `${b.lo.toString()}–${b.hi.toString()}`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">נתונים סינתטיים: {{ values.length }} יחסי החזר של תיקים בדויים.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">איפה הטווח הראשון מתחיל (אחוז)</span>
        <input v-model.number="start" type="range" min="20" max="28" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ start }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">רוחב כל טווח (נקודות אחוז)</span>
        <input v-model.number="width" type="range" min="1" max="10" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ width }}</span></span>
      </label>
    </div>

    <div class="mt-5 flex items-end gap-1" dir="ltr" style="height: 180px" role="img" :aria-label="`היסטוגרמה: ${h.bins.length} טווחים`">
      <div v-for="b in h.bins" :key="b.lo.toString()" class="flex h-full min-w-0 flex-1 flex-col justify-end">
        <span class="text-center text-caption text-n700">{{ b.count }}</span>
        <div class="rounded-t-sm" :style="{ height: `${(b.count / tallest) * 85}%`, minHeight: b.count ? '2px' : '0', background: 'var(--mogi-teal-deep)' }"></div>
      </div>
    </div>
    <div class="mt-1 flex gap-1" dir="ltr" aria-hidden="true">
      <span v-for="b in h.bins" :key="b.lo.toString()" class="ltr min-w-0 flex-1 truncate text-center text-caption text-n600" style="font-size: 12px">{{ b.lo.toString() }}</span>
    </div>
    <p class="mt-2 text-caption text-n600">
      כל עמודה היא טווח <span class="ltr">[מ־ עד)</span>: הקצה התחתון בפנים, והעליון בטווח הבא. הטווח האחרון כולל גם את הקצה שלו.
      <template v-if="h.below + h.above > 0"> מחוץ לטווחים: {{ h.below + h.above }}.</template>
    </p>

    <dl class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">ממוצע</dt><dd class="text-h3 text-navy"><span class="ltr">{{ m }}%</span></dd></div>
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">חציון</dt><dd class="text-h3 text-navy"><span class="ltr">{{ med }}%</span></dd></div>
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">אחוזון 90</dt><dd class="text-h3 text-navy"><span class="ltr">{{ p90 }}%</span></dd></div>
    </dl>
    <p v-if="note" class="mt-2 text-caption text-n600">{{ note }}</p>

    <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0"><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 text-start">טווח (אחוזי יחס החזר)</th><th class="py-2 text-start">כמה תיקים</th></tr></thead>
        <tbody>
          <tr v-for="b in h.bins" :key="b.lo.toString()" class="border-b border-n100"><td class="py-1"><span class="ltr">{{ label(b) }}</span></td><td class="py-1">{{ b.count }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
