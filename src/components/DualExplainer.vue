<script setup lang="ts">
// The two-column explainer of lesson 9.4. The same decision is explained twice: to the client (plain
// language) and to a professional reviewer (evidence). The learner drafts each side in its own column;
// each side has a checklist that is NOT a grade: some checks the tool can look for (a number in the text,
// one of a few words), some only the learner can tick. For the client side the tool also lists words the
// client may not know (jargon), as a hint. A model draft per side can be opened after writing. On wide
// screens the columns sit side by side; on a phone a switch shows one column at a time, and "הצגה כטבלה"
// lays the two drafts out row by row. Nothing is computed here: the decision card and the model drafts
// arrive from the page, already formatted. Text and ticks are kept in this browser through progress.ts.
import { computed, onMounted, reactive, ref } from "vue";
import { load, save } from "../lib/progress.ts";

type Side = "client" | "reviewer";
interface Topic {
  id: string;
  label: string;
  prompt: string;
}
interface Pair {
  client: Topic;
  reviewer: Topic;
}
interface Check {
  id: string;
  text: string;
  /** What the tool may look for in the whole side: any digit, or any of the words. Only a hint; the tick is the learner's. */
  auto?: { digits: true } | { words: string[] };
}
interface Fact {
  label: string;
  value: string;
}

const props = defineProps<{
  id: string;
  title: string;
  mark: string;
  /** The decision being explained, as a card of label/value lines. */
  decision: Fact[];
  pairs: Pair[];
  clientChecks: Check[];
  reviewerChecks: Check[];
  /** Words that the client may not know; listed when found in the client's draft. */
  jargon: string[];
  /** Words that promise something an estimate cannot promise; listed when found in either draft. */
  promises?: string[];
  modelClient: string;
  modelReviewer: string;
}>();

const storageKey = `dual:${props.id}`;
interface Saved {
  texts: Record<string, string>;
  ticks: string[];
}
const texts = reactive<Record<string, string>>({});
const ticks = reactive<Record<string, boolean>>({});
const tab = ref<Side>("client");
const asTable = ref(false);
const confirmReset = ref(false);
const showModel = reactive<Record<Side, boolean>>({ client: false, reviewer: false });

onMounted(() => {
  const s = load<Saved>(storageKey);
  if (s) {
    Object.assign(texts, s.texts ?? {});
    for (const k of s.ticks ?? []) ticks[k] = true;
  }
});
function persist() {
  save(storageKey, {
    texts: Object.fromEntries(Object.entries(texts).filter(([, t]) => t.trim() !== "")),
    ticks: Object.keys(ticks).filter((k) => ticks[k]),
  } satisfies Saved);
}
const setText = (k: string, v: string) => {
  texts[k] = v;
  persist();
};
const toggle = (k: string) => {
  ticks[k] = !ticks[k];
  persist();
};
function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true;
    return;
  }
  for (const k of Object.keys(texts)) delete texts[k];
  for (const k of Object.keys(ticks)) delete ticks[k];
  persist();
  confirmReset.value = false;
}

const topicsOf = (side: Side) => props.pairs.map((p) => p[side]);
const sideText = (side: Side) => topicsOf(side).map((t) => texts[`${side}.${t.id}`] ?? "").join("\n");
const checksOf = (side: Side) => (side === "client" ? props.clientChecks : props.reviewerChecks);
const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

type Hint = "found" | "missing" | "none";
function hint(side: Side, c: Check): Hint {
  if (!c.auto) return "none";
  const t = sideText(side);
  if (t.trim() === "") return "none"; // nothing written yet: no hint, not even a warning
  if ("digits" in c.auto) return /\d/.test(t) ? "found" : "missing";
  return c.auto.words.some((w) => t.includes(w)) ? "found" : "missing";
}
const jargonFound = computed(() => {
  const t = sideText("client");
  return props.jargon.filter((w) => t.includes(w));
});
const promisesFound = (side: Side) => {
  const t = sideText(side);
  return (props.promises ?? []).filter((w) => t.includes(w));
};
const done = (side: Side) => checksOf(side).filter((c) => ticks[`${side}.${c.id}`]).length;
const sideLabel = (side: Side) => (side === "client" ? "ללקוח" : "לבודק מקצועי");
const modelOf = (side: Side) => (side === "client" ? props.modelClient : props.modelReviewer);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-body-l font-semibold text-n900">{{ title }}</p>
    <p class="mt-1 text-caption text-n600">{{ mark }}</p>

    <dl class="mt-3 grid gap-x-4 gap-y-1 rounded-md bg-n50 p-3 sm:grid-cols-[auto_1fr]">
      <template v-for="f in decision" :key="f.label">
        <dt class="text-caption font-semibold text-n700">{{ f.label }}</dt>
        <dd class="text-body-m text-n900">{{ f.value }}</dd>
      </template>
    </dl>

    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <div class="inline-flex md:hidden" role="group" aria-label="איזה צד מוצג">
        <button
          v-for="s in (['client', 'reviewer'] as Side[])"
          :key="s"
          type="button"
          class="min-h-11 border border-n200 px-4 text-body-m first:rounded-s-md last:rounded-e-md"
          :class="tab === s ? 'bg-n900 text-n0' : 'bg-n0 text-n800'"
          :aria-pressed="tab === s"
          @click="tab = s"
        >
          {{ sideLabel(s) }}
        </button>
      </div>
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="asTable" @click="asTable = !asTable">
        {{ asTable ? "הצגה בעמודות" : "הצגה כטבלה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-n600 underline" @click="reset">
        {{ confirmReset ? "בטוחים? לחצו שוב כדי למחוק את הטיוטות" : "איפוס" }}
      </button>
    </div>
    <p class="text-caption text-n600">הטיוטות והסימונים נשמרים בדפדפן הזה בלבד. הרשימות אינן ציון.</p>

    <!-- The table view: one row per pair of topics, the two drafts side by side. -->
    <div v-if="asTable" class="mt-3 overflow-x-auto">
      <table class="w-full min-w-[34rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">{{ sideLabel("client") }}</th>
            <th class="py-2 text-start font-semibold">{{ sideLabel("reviewer") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pairs" :key="p.client.id" class="border-b border-n100 align-top">
            <td class="py-2 pe-3">
              <span class="block font-semibold text-n900">{{ p.client.label }}</span>
              <span class="block whitespace-pre-line text-n800">{{ texts[`client.${p.client.id}`] || "—" }}</span>
            </td>
            <td class="py-2">
              <span class="block font-semibold text-n900">{{ p.reviewer.label }}</span>
              <span class="block whitespace-pre-line text-n800">{{ texts[`reviewer.${p.reviewer.id}`] || "—" }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="mt-3 grid gap-4 md:grid-cols-2">
      <section
        v-for="s in (['client', 'reviewer'] as Side[])"
        :key="s"
        class="min-w-0 rounded-md border border-n200 p-3 sm:p-4"
        :class="tab === s ? '' : 'hidden md:block'"
        :aria-label="`הסבר ${sideLabel(s)}`"
      >
        <h3 class="!mt-0 text-body-l font-semibold text-n900">הסבר {{ sideLabel(s) }}</h3>
        <div v-for="t in topicsOf(s)" :key="t.id" class="mt-3">
          <label :for="`dual-${id}-${s}-${t.id}`" class="block">
            <span class="text-body-m font-semibold text-n900">{{ t.label }}</span>
            <span class="block text-caption text-n700">{{ t.prompt }}</span>
          </label>
          <textarea
            :id="`dual-${id}-${s}-${t.id}`"
            rows="3"
            class="mt-1 w-full rounded-md border border-n200 bg-n0 p-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
            :value="texts[`${s}.${t.id}`] ?? ''"
            @input="setText(`${s}.${t.id}`, ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <p class="text-caption text-n600">{{ words(texts[`${s}.${t.id}`] ?? "") }} מילים</p>
        </div>

        <p v-if="s === 'client' && jargonFound.length" class="mt-3 rounded-md bg-warning-bg p-2 text-body-m text-n900" role="status">
          מילים שהלקוח אולי לא מכיר: <strong>{{ jargonFound.join(", ") }}</strong>. אפשר להשאיר מילה כזו אם הסברתם אותה במשפט.
        </p>

        <p v-if="promisesFound(s).length" class="mt-3 rounded-md bg-warning-bg p-2 text-body-m text-n900" role="status">
          מילים שמבטיחות: <strong>{{ promisesFound(s).join(", ") }}</strong>. אומדן או תרחיש אינם הבטחה: אם המילה מתארת אחד מהם, כדאי לנסח מחדש.
        </p>

        <div class="mt-3 rounded-md bg-n50 p-2" role="group" :aria-label="`רשימת בדיקה ${sideLabel(s)}`">
          <p class="px-1 text-caption font-semibold text-n700">רשימת בדיקה ({{ done(s) }} מתוך {{ checksOf(s).length }}). אינה ציון</p>
          <div v-for="c in checksOf(s)" :key="c.id">
            <label class="flex min-h-11 cursor-pointer items-start gap-3 py-1">
              <input type="checkbox" class="mt-1 h-5 w-5 shrink-0 accent-teal-deep" :checked="!!ticks[`${s}.${c.id}`]" @change="toggle(`${s}.${c.id}`)" />
              <span class="text-body-m text-n800">
                {{ c.text }}
                <span v-if="hint(s, c) === 'found'" class="block text-caption text-n600">נמצא רמז בטקסט.</span>
                <span v-else-if="hint(s, c) === 'missing'" class="block text-caption text-n600">לא נמצא רמז בטקסט: אולי חסר?</span>
              </span>
            </label>
          </div>
        </div>

        <div class="mt-3">
          <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-expanded="showModel[s]" @click="showModel[s] = !showModel[s]">
            {{ showModel[s] ? "הסתרת הנוסח לדוגמה" : "נוסח לדוגמה, לפתוח אחרי שכתבתם" }}
          </button>
          <p v-if="showModel[s]" class="mt-1 whitespace-pre-line rounded-md border border-n200 p-3 text-body-m text-n800">{{ modelOf(s) }}</p>
        </div>
      </section>
    </div>
  </div>
</template>
