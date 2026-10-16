<script setup lang="ts">
// The factor cards (course map, section 4): one card per thing a bank or the regulator
// looks at, each answering the same eight questions. The page passes the cards, with the
// example already filled from the lesson's facts. One card is open at a time; the group
// buttons narrow the list. Every threshold carries the kind of its source, and a threshold
// the course does not know is marked as an open question. Text is passed in, so the
// lesson's term check and the labels live in one place (src/data/factor-cards.ts).
import { computed, nextTick, ref } from "vue";
import BidiText from "./BidiText.vue";

interface Threshold { text: string; kind: string; source: string; open?: boolean }
interface Source { kind: string; text: string; date?: string }
export interface ViewCard {
  n: number;
  id: string;
  title: string;
  groupLabel: string;
  what: string;
  why: string;
  effect: string;
  thresholds: Threshold[];
  levers: string;
  cost: string;
  example: string;
  algorithm: string;
  algorithmKind: string;
  sources: Source[];
  taught: string;
}

const props = defineProps<{ cards: ViewCard[]; initial?: string }>();

const groups = computed(() => [...new Set(props.cards.map((c) => c.groupLabel))]);
const group = ref<string>("");
const shown = computed(() => props.cards.filter((c) => !group.value || c.groupLabel === group.value));
const open = ref<string>(props.initial ?? props.cards[0]?.id ?? "");
// Opening a card closes the one above it, so the page moves up under the clicked header.
// After the change, bring that header back into view (scroll-mt keeps it below the sticky header).
async function toggle(id: string, event: MouseEvent) {
  const header = event.currentTarget as HTMLElement | null;
  open.value = open.value === id ? "" : id;
  await nextTick();
  header?.scrollIntoView({ block: "nearest" });
}

const questions = [
  ["1", "מה הגורם?", "what"],
  ["2", "למה הבנק או הרגולטור מתעניינים בו?", "why"],
  ["3", "איך הוא משפיע על האישור ועל המחיר, ודרך איזה מנגנון?", "effect"],
] as const;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <div v-if="groups.length > 1" class="flex flex-wrap gap-2" role="group" aria-label="סינון לפי קבוצה">
      <button
        type="button"
        class="min-h-11 rounded-pill border px-4 text-body-m transition-colors duration-fast ease-out"
        :class="group === '' ? 'border-navy bg-navy text-n0' : 'border-n300 bg-n0 text-n800'"
        :aria-pressed="group === ''"
        @click="group = ''"
      >
        כל הכרטיסים
      </button>
      <button
        v-for="g in groups"
        :key="g"
        type="button"
        class="min-h-11 rounded-pill border px-4 text-body-m transition-colors duration-fast ease-out"
        :class="group === g ? 'border-navy bg-navy text-n0' : 'border-n300 bg-n0 text-n800'"
        :aria-pressed="group === g"
        @click="group = g"
      >
        {{ g }}
      </button>
    </div>

    <ul class="list-reset mt-4 grid gap-3">
      <li v-for="c in shown" :key="c.id" class="rounded-md border" :class="open === c.id ? 'border-teal-deep' : 'border-n200'">
        <button
          type="button"
          class="flex min-h-11 w-full scroll-mt-24 items-center justify-between gap-3 px-4 py-3 text-start"
          :aria-expanded="open === c.id"
          :aria-controls="open === c.id ? `factor-card-${c.id}` : undefined"
          @click="toggle(c.id, $event)"
        >
          <span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span class="text-caption text-n600">כרטיס <span class="ltr">{{ c.n }}</span></span>
            <span class="text-body-l font-semibold text-n900">{{ c.title }}</span>
            <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">{{ c.groupLabel }}</span>
          </span>
          <span aria-hidden="true" class="text-n700">{{ open === c.id ? "−" : "+" }}</span>
        </button>

        <div v-if="open === c.id" :id="`factor-card-${c.id}`" class="border-t border-n200 px-4 pb-4 pt-3">
          <dl class="grid gap-4 text-body-m text-n800">
            <div v-for="[num, q, key] in questions" :key="key">
              <dt class="text-caption font-semibold text-n600"><span class="ltr">{{ num }}</span> · {{ q }}</dt>
              <dd class="mt-0.5"><BidiText :text="c[key]" /></dd>
            </div>

            <div>
              <dt class="text-caption font-semibold text-n600"><span class="ltr">4</span> · איפה הספים, ומאיזה מקור?</dt>
              <dd class="mt-1">
                <ul class="list-reset grid gap-2">
                  <li v-for="(t, k) in c.thresholds" :key="k" class="rounded-md bg-n50 p-3">
                    <p><BidiText :text="t.text" /></p>
                    <p class="mt-1 flex flex-wrap items-baseline gap-2 text-caption text-n700">
                      <span class="rounded-pill bg-n100 px-3 py-0.5 font-semibold">{{ t.kind }}</span>
                      <span v-if="t.open" class="rounded-pill bg-warning-bg px-3 py-0.5 font-semibold text-n900">שאלה פתוחה</span>
                      <span><BidiText :text="t.source" /></span>
                    </p>
                  </li>
                </ul>
              </dd>
            </div>

            <div>
              <dt class="text-caption font-semibold text-n600"><span class="ltr">5</span> · מה הלקוח באמת יכול לשנות בו?</dt>
              <dd class="mt-0.5"><BidiText :text="c.levers" /></dd>
            </div>
            <div>
              <dt class="text-caption font-semibold text-n600"><span class="ltr">6</span> · כמה השינוי עולה ללקוח?</dt>
              <dd class="mt-0.5"><BidiText :text="c.cost" /></dd>
            </div>
            <div>
              <dt class="text-caption font-semibold text-n600"><span class="ltr">7</span> · דוגמה מספרית</dt>
              <dd class="mt-0.5 rounded-md bg-mint p-3 text-n900"><BidiText :text="c.example" /></dd>
            </div>
            <div>
              <dt class="text-caption font-semibold text-n600"><span class="ltr">8</span> · איך האלגוריתם משתמש בו?</dt>
              <dd class="mt-0.5">
                <BidiText :text="c.algorithm" />
                <span class="ms-2 rounded-pill bg-n100 px-3 py-0.5 text-caption font-semibold text-n700">{{ c.algorithmKind }}</span>
              </dd>
            </div>
          </dl>

          <details class="mt-4 rounded-md border border-n200 p-3 text-body-m text-n700">
            <summary class="min-h-11 cursor-pointer font-semibold text-n900">המקורות של הכרטיס</summary>
            <ul class="list-reset mt-2 grid gap-2">
              <li v-for="(s, k) in c.sources" :key="k" class="flex flex-wrap items-baseline gap-2">
                <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption font-semibold">{{ s.kind }}</span>
                <span><BidiText :text="s.text" /></span>
                <span v-if="s.date" class="text-caption text-n600"><span class="ltr">{{ s.date }}</span></span>
              </li>
            </ul>
            <p class="mt-2 text-caption text-n600">איפה זה נלמד: <BidiText :text="c.taught" />.</p>
          </details>
        </div>
      </li>
    </ul>
  </div>
</template>
