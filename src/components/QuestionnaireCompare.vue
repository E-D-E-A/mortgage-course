<script setup lang="ts">
// Lesson 4.13's illustration: the four banks' public pre-approval forms, side by
// side. The learner picks a topic and sees what each form asks about it, in the
// form's own words where the team recorded them; "הצגה כטבלה" shows every topic
// at once. The data is src/data/bank-questionnaires.ts. No numbers are computed
// here: the component only shows what the forms ask.
import { computed, ref } from "vue";
import { BANKS, READ_ON, TOPICS } from "../data/bank-questionnaires.ts";

const props = withDefaults(defineProps<{ initial?: string }>(), { initial: "children" });

const selected = ref(TOPICS.some((t) => t.id === props.initial) ? props.initial : TOPICS[0].id);
const topic = computed(() => TOPICS.find((t) => t.id === selected.value) ?? TOPICS[0]);
const showTable = ref(false);
const readOn = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${READ_ON}T12:00:00Z`));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      מה שואל הטופס הציבורי של כל בנק, לפי הרישום שהצוות עשה ב־{{ readOn }}. במירכאות — הנוסח של הטופס. טופס יכול להשתנות אחרי היום שבו נקרא.
    </p>

    <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="בחרו נושא">
      <button
        v-for="t in TOPICS"
        :key="t.id"
        type="button"
        class="min-h-11 rounded-full border px-3 text-body-m"
        :class="t.id === selected ? 'border-navy bg-navy text-n0' : 'border-n200 bg-n0 text-n800 hover:border-n400'"
        :aria-pressed="t.id === selected"
        @click="selected = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div aria-live="polite">
      <p class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800"><strong class="text-n900">{{ topic.label }}:</strong> {{ topic.point }}</p>
      <ul class="list-reset mt-3 grid gap-3 sm:grid-cols-2">
        <li v-for="b in BANKS" :key="b.id" class="rounded-md border border-n200 p-3">
          <div class="text-body-m font-semibold text-n900">{{ b.name }}</div>
          <p class="mt-1 text-body-m text-n700">{{ topic.asks[b.id] }}</p>
        </li>
      </ul>
    </div>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start align-bottom font-semibold">נושא</th>
            <th v-for="b in BANKS" :key="b.id" class="py-2 pe-3 text-start align-bottom font-semibold">{{ b.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in TOPICS" :key="t.id" class="border-b border-n100 align-top">
            <th scope="row" class="py-2 pe-3 text-start font-semibold text-n900">{{ t.label }}</th>
            <td v-for="b in BANKS" :key="b.id" class="py-2 pe-3 text-n700">{{ t.asks[b.id] }}</td>
          </tr>
        </tbody>
      </table>
      <ul class="list-reset mt-2 space-y-1 text-caption text-n600">
        <li v-for="b in BANKS" :key="b.id">{{ b.name }}: {{ b.form }}.</li>
      </ul>
    </div>
  </div>
</template>
