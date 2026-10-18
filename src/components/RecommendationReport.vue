<script setup lang="ts">
// The recommendation-report template of lesson 9.3. The learner fills a structured report for the main
// case in four steps: (1) choose one alternative and one bank from a comparison table the page gives,
// (2) write the sections of the report, each with a short self-check list, (3) tick the pre-release
// checklist (what must be true before the loan is released), (4) read the whole report in one view, copy
// or print it. Nothing is graded and nothing is computed here: every number arrives as a ready-made string
// from the page (which reads it from the lesson's facts). Text and ticks are kept in this browser through
// progress.ts. A table view of the comparison is always available (phones). A different reasonable choice
// is allowed; the template only asks that the choice has reasons, a price, a risk and a next review.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { load, save } from "../lib/progress.ts";

interface Option {
  id: string;
  name: string;
  /** One short line under the name (what it is). */
  note?: string;
}
interface Column {
  key: string;
  label: string;
}
interface Row {
  /** The option this row belongs to: an alternative id, or a bank id. */
  id: string;
  cells: Record<string, string>;
}
interface Section {
  id: string;
  title: string;
  /** What to write here, in one or two sentences. */
  prompt: string;
  /** Self-check: things a good version of this section says. Ticked by the learner, not graded. */
  must: string[];
  /** A starting phrase shown as the placeholder. */
  placeholder?: string;
}
interface CheckItem {
  id: string;
  text: string;
  /** Kind and source of the claim, shown small ("ידע מהשטח · ממתין לאישור מומחה"). */
  source?: string;
}
interface CheckGroup {
  label: string;
  note?: string;
  items: CheckItem[];
}

const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    /** The "דוגמה לימודית" marking, printed at the top of the report. */
    mark: string;
    alternatives: Option[];
    banks: Option[];
    /** The table the choice is made from: one row per alternative (id = alternative id), and one row per bank for EACH alternative. */
    altColumns: Column[];
    altRows: Row[];
    bankColumns: Column[];
    /** The banks' rows, keyed by the alternative they read (the first alternative's rows show until one is chosen). */
    bankRows: Record<string, Row[]>;
    sections: Section[];
    checklist: CheckGroup[];
    /** Shown above the choice: what the learner should not forget (the estimate/offer difference, for example). */
    chooseNote?: string;
  }>(),
  { chooseNote: undefined },
);

interface Saved {
  alt: string | null;
  bank: string | null;
  texts: Record<string, string>;
  musts: string[];
  checks: string[];
}
const storageKey = `report:${props.id}`;
const alt = ref<string | null>(null);
const bank = ref<string | null>(null);
const texts = reactive<Record<string, string>>({});
const musts = reactive<Record<string, boolean>>({});
const checks = reactive<Record<string, boolean>>({});
const asTable = ref(false);
const full = ref(false);
const printing = ref(false);
const confirmReset = ref(false);
const copied = ref<"" | "ok" | "fail">("");

onMounted(() => {
  const s = load<Saved>(storageKey);
  if (s) {
    alt.value = s.alt ?? null;
    bank.value = s.bank ?? null;
    Object.assign(texts, s.texts ?? {});
    for (const k of s.musts ?? []) musts[k] = true;
    for (const k of s.checks ?? []) checks[k] = true;
  }
  window.addEventListener("afterprint", endPrint);
});
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));

function persist() {
  const v: Saved = {
    alt: alt.value,
    bank: bank.value,
    texts: Object.fromEntries(Object.entries(texts).filter(([, t]) => t.trim() !== "")),
    musts: Object.keys(musts).filter((k) => musts[k]),
    checks: Object.keys(checks).filter((k) => checks[k]),
  };
  save(storageKey, v);
}
const pick = (kind: "alt" | "bank", id: string) => {
  (kind === "alt" ? alt : bank).value = (kind === "alt" ? alt : bank).value === id ? null : id;
  persist();
};
const setText = (id: string, v: string) => {
  texts[id] = v;
  persist();
};
const toggle = (store: Record<string, boolean>, k: string) => {
  store[k] = !store[k];
  persist();
};

const altName = computed(() => props.alternatives.find((a) => a.id === alt.value)?.name ?? "");
const bankName = computed(() => props.banks.find((b) => b.id === bank.value)?.name ?? "");
const written = computed(() => props.sections.filter((s) => (texts[s.id] ?? "").trim().length >= 20).length);
const mustKeys = computed(() => props.sections.flatMap((s) => s.must.map((_, i) => `${s.id}.${i}`)));
const mustDone = computed(() => mustKeys.value.filter((k) => musts[k]).length);
const checkKeys = computed(() => props.checklist.flatMap((g, gi) => g.items.map((i) => `${gi}.${i.id}`)));
const checkDone = computed(() => checkKeys.value.filter((k) => checks[k]).length);
const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** The whole report as plain text, for copying. */
const reportText = computed(() => {
  const L: string[] = [props.title, props.mark, ""];
  L.push(`החלופה שנבחרה: ${altName.value || "(לא נבחרה)"}`);
  L.push(`הבנק שנבחר: ${bankName.value || "(לא נבחר)"}`, "");
  for (const s of props.sections) {
    L.push(s.title, (texts[s.id] ?? "").trim() || "(לא נכתב)", "");
  }
  L.push("בדיקות לפני העמדת ההלוואה");
  props.checklist.forEach((g, gi) => {
    L.push(g.label);
    for (const i of g.items) L.push(`${checks[`${gi}.${i.id}`] ? "[x]" : "[ ]"} ${i.text}`);
  });
  return L.join("\n");
});

async function copyReport() {
  try {
    await navigator.clipboard.writeText(reportText.value);
    copied.value = "ok";
  } catch {
    copied.value = "fail";
  }
}
async function printNow() {
  full.value = true;
  printing.value = true;
  document.documentElement.classList.add("rr-printing");
  await nextTick();
  window.print();
}
function endPrint() {
  printing.value = false;
  document.documentElement.classList.remove("rr-printing");
}
function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true;
    return;
  }
  alt.value = null;
  bank.value = null;
  for (const k of Object.keys(texts)) delete texts[k];
  for (const k of Object.keys(musts)) delete musts[k];
  for (const k of Object.keys(checks)) delete checks[k];
  persist();
  confirmReset.value = false;
}
const cell = (rows: Row[], id: string, key: string) => rows.find((r) => r.id === id)?.cells[key] ?? "—";
/** A cell that is only a number (digits, separators, a percent sign, a minus) is drawn left to right; words are not. */
const isNum = (v: string) => /^[−\-]?[\d.,]+%?$/.test(v);
const shownAlt = computed(() => alt.value ?? props.alternatives[0]?.id ?? "");
const shownAltName = computed(() => props.alternatives.find((a) => a.id === shownAlt.value)?.name ?? "");
const bankCell = (id: string, key: string) => cell(props.bankRows[shownAlt.value] ?? [], id, key);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" data-rr-block :data-rr-print="printing ? 'active' : null">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <p class="text-body-l font-semibold text-n900">{{ title }}</p>
      <p class="text-caption text-n600" aria-live="polite">נכתבו {{ written }} מתוך {{ sections.length }} חלקים · סומנו {{ checkDone }} מתוך {{ checkKeys.length }} בדיקות</p>
    </div>
    <p class="mt-1 text-caption text-n600">{{ mark }}</p>
    <p class="rr-no-print mt-1 text-caption text-n600">הדוח אינו מקבל ציון. הטקסט והסימונים נשמרים בדפדפן הזה בלבד.</p>

    <div class="rr-no-print mt-3 flex flex-wrap gap-x-4 gap-y-1">
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="asTable" @click="asTable = !asTable">
        {{ asTable ? "הצגה כרשימה" : "הצגה כטבלה" }}
      </button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" :aria-pressed="full" @click="full = !full">
        {{ full ? "חזרה לעריכה" : "הדוח המלא" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="copyReport">העתקה כטקסט</button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-n600 underline" @click="reset">
        {{ confirmReset ? "בטוחים? לחצו שוב כדי למחוק הכול" : "איפוס" }}
      </button>
    </div>
    <p v-if="copied === 'ok'" class="rr-no-print text-caption text-success" role="status">הדוח הועתק.</p>
    <p v-else-if="copied === 'fail'" class="rr-no-print text-caption text-n700" role="status">ההעתקה לא עבדה בדפדפן הזה. בחרו את הטקסט בתצוגת הדוח המלא והעתיקו ידנית.</p>

    <!-- The whole report in one view: this is what is printed. -->
    <div v-if="full" class="mt-4 text-body-m text-n800" data-rr-full>
      <h3 class="text-h3 text-n900">{{ title }}</h3>
      <p class="text-caption text-n600">{{ mark }}</p>
      <dl class="mt-3 grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt class="font-semibold text-n900">החלופה שנבחרה</dt>
        <dd>{{ altName || "(לא נבחרה)" }}</dd>
        <dt class="font-semibold text-n900">הבנק שנבחר</dt>
        <dd>{{ bankName || "(לא נבחר)" }}</dd>
      </dl>
      <section v-for="s in sections" :key="s.id" class="rr-print-step mt-4 border-t border-n200 pt-3">
        <h4 class="font-semibold text-n900">{{ s.title }}</h4>
        <p v-if="(texts[s.id] ?? '').trim()" class="mt-1 whitespace-pre-line">{{ texts[s.id] }}</p>
        <p v-else class="mt-1 text-n600">(לא נכתב)</p>
      </section>
      <section class="rr-print-step mt-4 border-t border-n200 pt-3">
        <h4 class="font-semibold text-n900">בדיקות לפני העמדת ההלוואה</h4>
        <div v-for="(g, gi) in checklist" :key="g.label" class="mt-2">
          <p class="font-semibold text-n800">{{ g.label }}</p>
          <ul class="list-reset">
            <li v-for="i in g.items" :key="i.id" class="flex gap-2 py-0.5">
              <span aria-hidden="true">{{ checks[`${gi}.${i.id}`] ? "☑" : "☐" }}</span>
              <span>
                <span class="sr-only">{{ checks[`${gi}.${i.id}`] ? "סומן: " : "לא סומן: " }}</span>{{ i.text }}
                <span v-if="i.source" class="block text-caption text-n600">{{ i.source }}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- The working view. -->
    <div v-else class="mt-4">
      <h3 class="!mt-0 text-body-l font-semibold text-n900">צעד 1. בוחרים חלופה ובנק</h3>
      <p v-if="chooseNote" class="mt-1 text-body-m text-n700">{{ chooseNote }}</p>

      <div v-if="asTable" class="mt-3 grid gap-4">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-body-m">
            <caption class="pb-1 text-start text-caption font-semibold text-n600">החלופות</caption>
            <thead>
              <tr class="border-b border-n200 text-caption text-n600">
                <th class="py-2 pe-3 text-start font-semibold">החלופה</th>
                <th v-for="c in altColumns" :key="c.key" class="py-2 pe-3 text-start font-semibold">{{ c.label }}</th>
                <th class="py-2 text-start font-semibold">נבחרה</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in alternatives" :key="a.id" class="border-b border-n100 align-top" :class="alt === a.id ? 'bg-n50' : ''">
                <td class="py-2 pe-3 font-semibold text-n900">{{ a.name }}</td>
                <td v-for="c in altColumns" :key="c.key" class="py-2 pe-3"><span :class="isNum(cell(altRows, a.id, c.key)) ? 'ltr' : ''">{{ cell(altRows, a.id, c.key) }}</span></td>
                <td class="py-2">{{ alt === a.id ? "כן" : "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-body-m">
            <caption class="pb-1 text-start text-caption font-semibold text-n600">הבנקים, לפי החלופה: {{ shownAltName }}</caption>
            <thead>
              <tr class="border-b border-n200 text-caption text-n600">
                <th class="py-2 pe-3 text-start font-semibold">הבנק</th>
                <th v-for="c in bankColumns" :key="c.key" class="py-2 pe-3 text-start font-semibold">{{ c.label }}</th>
                <th class="py-2 text-start font-semibold">נבחר</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in banks" :key="b.id" class="border-b border-n100 align-top" :class="bank === b.id ? 'bg-n50' : ''">
                <td class="py-2 pe-3 font-semibold text-n900">{{ b.name }}</td>
                <td v-for="c in bankColumns" :key="c.key" class="py-2 pe-3"><span :class="isNum(bankCell(b.id, c.key)) ? 'ltr' : ''">{{ bankCell(b.id, c.key) }}</span></td>
                <td class="py-2">{{ bank === b.id ? "כן" : "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="mt-3 grid gap-4 md:grid-cols-2">
        <fieldset class="min-w-0">
          <legend class="text-body-m font-semibold text-n900">החלופה</legend>
          <div class="mt-2 grid gap-2">
            <button
              v-for="a in alternatives"
              :key="a.id"
              type="button"
              class="min-h-11 rounded-md border p-3 text-start"
              :class="alt === a.id ? 'border-teal-deep bg-n50 shadow-sm' : 'border-n200 bg-n0 hover:bg-n50'"
              :aria-pressed="alt === a.id"
              @click="pick('alt', a.id)"
            >
              <span class="block font-semibold text-n900">{{ a.name }}</span>
              <span v-if="a.note" class="block text-caption text-n700">{{ a.note }}</span>
              <span class="mt-1 block text-caption text-n700">
                <span v-for="c in altColumns" :key="c.key" class="block">{{ c.label }}: <span :class="isNum(cell(altRows, a.id, c.key)) ? 'ltr' : ''">{{ cell(altRows, a.id, c.key) }}</span></span>
              </span>
            </button>
          </div>
        </fieldset>
        <fieldset class="min-w-0">
          <legend class="text-body-m font-semibold text-n900">הבנק <span class="text-caption font-normal text-n700">(לפי החלופה: {{ shownAltName }})</span></legend>
          <div class="mt-2 grid gap-2">
            <button
              v-for="b in banks"
              :key="b.id"
              type="button"
              class="min-h-11 rounded-md border p-3 text-start"
              :class="bank === b.id ? 'border-teal-deep bg-n50 shadow-sm' : 'border-n200 bg-n0 hover:bg-n50'"
              :aria-pressed="bank === b.id"
              @click="pick('bank', b.id)"
            >
              <span class="block font-semibold text-n900">{{ b.name }}</span>
              <span v-if="b.note" class="block text-caption text-n700">{{ b.note }}</span>
              <span class="mt-1 block text-caption text-n700">
                <span v-for="c in bankColumns" :key="c.key" class="block">{{ c.label }}: <span :class="isNum(bankCell(b.id, c.key)) ? 'ltr' : ''">{{ bankCell(b.id, c.key) }}</span></span>
              </span>
            </button>
          </div>
        </fieldset>
      </div>
      <p class="mt-2 text-body-m text-n800" aria-live="polite">
        <template v-if="alt && bank">בחרתם: <strong>{{ altName }}</strong> אצל <strong>{{ bankName }}</strong>.</template>
        <template v-else>בחרו חלופה אחת ובנק אחד. אפשר להחליף בכל שלב, והטקסט שכתבתם נשאר.</template>
      </p>

      <h3 class="mt-6 text-body-l font-semibold text-n900">צעד 2. כותבים את הדוח</h3>
      <ol class="list-reset mt-2 grid gap-4">
        <li v-for="(s, si) in sections" :key="s.id" class="rounded-md border border-n200 p-3 sm:p-4">
          <label :for="`rr-${id}-${s.id}`" class="block">
            <span class="text-body-m font-semibold text-n900">{{ si + 1 }}. {{ s.title }}</span>
            <span class="mt-0.5 block text-caption text-n700">{{ s.prompt }}</span>
          </label>
          <textarea
            :id="`rr-${id}-${s.id}`"
            rows="4"
            class="mt-2 w-full rounded-md border border-n200 bg-n0 p-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
            :placeholder="s.placeholder"
            :value="texts[s.id] ?? ''"
            @input="setText(s.id, ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <p class="text-caption text-n600">{{ words(texts[s.id] ?? "") }} מילים</p>
          <div class="mt-2 rounded-md bg-n50 p-2" role="group" :aria-label="`בדיקה עצמית: ${s.title}`">
            <p class="px-1 text-caption font-semibold text-n700">בדקו שהחלק הזה אומר:</p>
            <label v-for="(m, mi) in s.must" :key="mi" class="flex min-h-11 cursor-pointer items-start gap-3 py-1">
              <input type="checkbox" class="mt-1 h-5 w-5 shrink-0 accent-teal-deep" :checked="!!musts[`${s.id}.${mi}`]" @change="toggle(musts, `${s.id}.${mi}`)" />
              <span class="text-body-m text-n800">{{ m }}</span>
            </label>
          </div>
        </li>
      </ol>
      <p class="mt-1 text-caption text-n600">סימנתם {{ mustDone }} מתוך {{ mustKeys.length }} בדיקות עצמיות בחלקי הדוח. הסימון הוא שלכם: הכלי לא קורא את הטקסט.</p>

      <h3 class="mt-6 text-body-l font-semibold text-n900">צעד 3. הבדיקות לפני העמדת ההלוואה</h3>
      <div v-for="(g, gi) in checklist" :key="g.label" class="mt-3 rounded-md border border-n100 p-3">
        <p class="text-body-m font-semibold text-n900">{{ g.label }}</p>
        <p v-if="g.note" class="text-caption text-n600">{{ g.note }}</p>
        <ul class="list-reset mt-1">
          <li v-for="i in g.items" :key="i.id">
            <label class="flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
              <input type="checkbox" class="mt-1 h-5 w-5 shrink-0 accent-teal-deep" :checked="!!checks[`${gi}.${i.id}`]" @change="toggle(checks, `${gi}.${i.id}`)" />
              <span class="text-body-m text-n800">
                {{ i.text }}
                <span v-if="i.source" class="block text-caption text-n600">{{ i.source }}</span>
              </span>
            </label>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  html.rr-printing body *:not([data-rr-print="active"]):not(:has([data-rr-print="active"])):not([data-rr-print="active"] *) {
    display: none !important;
  }
  html.rr-printing [data-rr-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  html.rr-printing [data-rr-print="active"] .rr-no-print {
    display: none !important;
  }
  html.rr-printing .rr-print-step {
    break-inside: avoid;
  }
}
</style>
