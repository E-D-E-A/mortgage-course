<script setup lang="ts">
// Lesson 8.23: two ways to hold months out for a test. SYNTHETIC: the invented bank's 60 months (drift.ts). The
// learner picks the split (a random draw, five of them, or the last 18 months) and sees which months are test months
// and the error of two simple models on training and on test. Every number comes from src/lib/calc/drift.ts and
// splits.ts, the same code as the lesson's facts.
import { computed, ref } from "vue";
import { DEFAULT_SPEC, r4, syntheticSeries } from "../lib/calc/drift.ts";
import { evaluate, randomSplit, timeSplit } from "../lib/calc/splits.ts";

const series = syntheticSeries(DEFAULT_SPEC);
const mode = ref<"random" | "time">("random");
const seed = ref(3);
const showTable = ref(false);

const split = computed(() => (mode.value === "random" ? randomSplit(60, 18, seed.value) : timeSplit(60, 42)));
const testSet = computed(() => new Set(split.value.test));
const ev = computed(() => evaluate(series, split.value, 1));
const change = DEFAULT_SPEC.changeAt;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">נתונים סינתטיים: 60 חודשים של בנק בדוי, 18 מהם לבדיקה. המודלים פשוטים בכוונה.</p>

    <fieldset class="mt-4">
      <legend class="text-body-m font-semibold text-n900">איך בוחרים את חודשי הבדיקה</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button type="button" class="min-h-11 rounded-md border px-3 py-2 text-body-m" :class="mode === 'random' ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'" :aria-pressed="mode === 'random'" @click="mode = 'random'">בהגרלה</button>
        <button type="button" class="min-h-11 rounded-md border px-3 py-2 text-body-m" :class="mode === 'time' ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'" :aria-pressed="mode === 'time'" @click="mode = 'time'">לפי זמן: 18 החודשים האחרונים</button>
      </div>
    </fieldset>
    <fieldset v-if="mode === 'random'" class="mt-3">
      <legend class="text-body-m font-semibold text-n900">איזו הגרלה</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button v-for="s in [1, 2, 3, 4, 5]" :key="s" type="button" class="min-h-11 min-w-11 rounded-md border px-3 py-2 text-body-m" :class="seed === s ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'" :aria-pressed="seed === s" @click="seed = s">{{ s }}</button>
      </div>
    </fieldset>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-4 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>חודש אימון</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-4 rounded-sm" style="background: var(--mogi-navy)"></span>חודש בדיקה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-4 rounded-sm border-2 border-dashed border-n600"></span>מהחודש הזה הבנק מתמחר אחרת</li>
    </ul>
    <div class="mt-2 grid gap-1" style="grid-template-columns: repeat(10, minmax(0, 1fr))" role="img" aria-label="60 חודשים; חודשי הבדיקה בכחול כהה">
      <span
        v-for="p in series"
        :key="p.t"
        class="flex h-8 items-center justify-center rounded-sm text-caption"
        :class="[testSet.has(p.t - 1) ? 'text-n0' : 'text-n900', p.t >= change ? 'border-2 border-dashed border-n600' : '']"
        :style="{ background: testSet.has(p.t - 1) ? 'var(--mogi-navy)' : 'var(--mogi-turquoise-2)' }"
      >{{ p.t }}</span>
    </div>
    <p class="mt-1 text-caption text-n600">החודשים מסודרים בעשיריות, מהראשון ועד ה־60.</p>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">המודל</th>
            <th class="py-2 pe-3 text-start">שגיאה על חודשי האימון</th>
            <th class="py-2 pe-3 text-start">שגיאה על חודשי הבדיקה</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100">
            <td class="py-2 pe-3">מרווח אחד קבוע</td>
            <td class="py-2 pe-3"><span class="ltr">{{ r4(ev.spread.train.mae) }}</span></td>
            <td class="py-2 pe-3 font-semibold"><span class="ltr">{{ r4(ev.spread.test.mae) }}</span></td>
          </tr>
          <tr class="border-b border-n100">
            <td class="py-2 pe-3">זוכר את החודש הקרוב ביותר</td>
            <td class="py-2 pe-3"><span class="ltr">{{ r4(ev.memory.train.mae) }}</span></td>
            <td class="py-2 pe-3 font-semibold"><span class="ltr">{{ r4(ev.memory.test.mae) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 max-h-72 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead class="sticky top-0 bg-n0"><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 text-start">חודש</th><th class="py-2 text-start">תפקיד</th><th class="py-2 text-start">עוגן</th><th class="py-2 text-start">ריבית שהוצעה</th></tr></thead>
        <tbody>
          <tr v-for="p in series" :key="p.t" class="border-b border-n100">
            <td class="py-1">{{ p.t }}</td>
            <td class="py-1">{{ testSet.has(p.t - 1) ? "בדיקה" : "אימון" }}</td>
            <td class="py-1"><span class="ltr">{{ p.x }}</span></td>
            <td class="py-1"><span class="ltr">{{ p.y }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
