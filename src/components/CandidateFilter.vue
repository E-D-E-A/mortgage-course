<script setup lang="ts">
// Lesson 8.7: twelve invented candidates and the hard constraints that can reject them. The learner switches families of constraints on
// and off and sees which candidates survive, and every reason each rejected one has (not only the first). A TEACHING MODEL: nothing
// like this is in Mogi's code today. Computed by constraints.ts on case-s8.ts.
import { computed, ref } from "vue";
import { CONSTRAINTS, FAMILY_HE, evaluate, type Family } from "../lib/calc/constraints.ts";
import { CANDIDATES, CANDIDATE_NAMES } from "../data/case-s8.ts";

defineProps<{ note?: string }>();
const families: Family[] = ["identity", "law", "bank", "client"];
const on = ref<Record<Family, boolean>>({ identity: true, law: true, bank: true, client: true });
const active = computed(() => CONSTRAINTS.filter((k) => on.value[k.family]));
const label = (id: string) => CONSTRAINTS.find((k) => k.id === id)?.labelHe ?? id;
const rows = computed(() => CANDIDATES.map((c) => {
  const e = evaluate(c, active.value);
  return { id: c.id, name: CANDIDATE_NAMES[c.id], feasible: e.feasible, reasons: e.reasons, capital: e.notes.includes("above_capital") };
}));
const survivors = computed(() => rows.value.filter((r) => r.feasible).length);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">נתונים סינתטיים: תיק נועם ושירה, שתים־עשרה בקשות בדויות, בנקים בדויים. האילוצים של הבנק הם הקווים הבדויים של שיעורים 6.9–6.11.</p>
    <fieldset class="mt-3">
      <legend class="text-caption font-semibold text-n600">אילו אילוצים פועלים?</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label v-for="f in families" :key="f" class="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-n200 px-3" :class="on[f] ? 'bg-n50 font-semibold' : ''"><input v-model="on[f]" type="checkbox" />{{ FAMILY_HE[f] }}</label>
      </div>
    </fieldset>
    <p class="mt-3 text-body-l font-semibold text-n900" aria-live="polite">{{ survivors }} מתוך {{ rows.length }} מועמדים עוברים</p>

    <ul class="list-reset mt-3 space-y-2">
      <li v-for="r in rows" :key="r.id" class="rounded-md border p-3" :class="r.feasible ? 'border-n300 bg-success-bg' : 'border-n200 bg-n0'">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-semibold text-n900">{{ r.name }}</span>
          <span class="text-caption font-semibold" :class="r.feasible ? 'text-n900' : 'text-n700'">{{ r.feasible ? "עובר" : `נפסל · ${r.reasons.length}` }}</span>
        </div>
        <ul v-if="!r.feasible" class="list-reset mt-2 flex flex-wrap gap-2"><li v-for="x in r.reasons" :key="x.id" class="rounded-full border border-n300 bg-n50 px-3 py-1 text-caption text-n800">{{ label(x.id) }}</li></ul>
        <p v-else-if="r.capital" class="mt-1 text-caption text-n700">עובר, אבל יחס ההחזר מעל 40%: מותר, והבנק מחזיק יותר הון.</p>
      </li>
    </ul>
    <p v-if="note" class="mt-2 text-caption text-n600">{{ note }}</p>
  </div>
</template>
