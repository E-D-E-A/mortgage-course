<script setup lang="ts">
// Workshop 3.12, part 1: the learner fills the first months of a level-payment
// schedule by hand — opening balance, interest, principal, closing balance —
// and checks one month at a time. A month opens when the one before it is
// right. Every expected number and every named mistake comes from the lesson's
// facts (the course's statement convention); the component only compares what
// was typed with them. A cell that is wrong but follows from the learner's own
// earlier cell in that month is told so ("fix the interest first").
// What was typed and which months are right are kept in this browser through
// progress.ts, and a print view prints the learner's months beside the course's
// whole schedule (the same print marking as DiyChecklist and DealMap).
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { load, parseAnswer, save } from "../lib/progress.ts";

type Field = "opening" | "interest" | "principal" | "closing";
interface Row {
  period: number;
  opening: string;
  payment: string;
  interest: string;
  principal_paid: string;
  closing: string;
}
interface Mistake {
  value: string;
  message: string;
}
const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    /** The whole schedule, from the course's calculator (statement convention). */
    rows: Row[];
    /** How many months the learner fills. */
    months: number;
    /** The level payment, and the monthly rate in percent: shown above the months. */
    payment: string;
    monthlyPercent: string;
    /** Named mistakes per cell, keyed "<month>.<field>". */
    mistakes: Record<string, Mistake[]>;
    printNote?: string;
  }>(),
  { printNote: undefined },
);

const FIELDS: { key: Field; label: string; hint: string }[] = [
  { key: "opening", label: "יתרה בתחילת החודש", hint: "היתרה בתחילת החודש היא היתרה בסוף החודש הקודם." },
  { key: "interest", label: "ריבית", hint: "הריבית: היתרה בתחילת החודש כפול הריבית החודשית, מעוגלת לאגורה." },
  { key: "principal", label: "קרן", hint: "הקרן: התשלום פחות הריבית של החודש." },
  { key: "closing", label: "יתרה בסוף החודש", hint: "היתרה בסוף: היתרה בתחילת החודש פחות הקרן — לא פחות כל התשלום." },
];
const rightValue = (k: number, f: Field) => {
  const r = props.rows[k - 1];
  return f === "principal" ? r.principal_paid : r[f];
};
// Month 1's opening balance is the loan: given.
const isGiven = (k: number, f: Field) => k === 1 && f === "opening";
const fieldsOf = (k: number) => FIELDS.filter((f) => !isGiven(k, f.key));

interface Saved {
  entered: Record<string, string>;
  solved: number[];
  revealed: number[];
}
const storageKey = `schedule-by-hand:${props.id}`;
const entered = reactive<Record<string, string>>({});
const solved = reactive<Record<number, boolean>>({});
const revealed = reactive<Record<number, boolean>>({});
const feedback = reactive<Record<string, { tone: "ok" | "bad"; text: string } | undefined>>({});
const tries = reactive<Record<number, number>>({});
const showAll = ref(false);
const printView = ref(false);
const printing = ref(false);

const monthList = computed(() => Array.from({ length: props.months }, (_, i) => i + 1));
const isOpen = (k: number) => k === 1 || !!solved[k - 1];
const allSolved = computed(() => monthList.value.every((k) => solved[k]));

onMounted(() => {
  const saved = load<Saved>(storageKey);
  if (saved) {
    Object.assign(entered, saved.entered ?? {});
    for (const k of saved.solved ?? []) solved[k] = true;
    for (const k of saved.revealed ?? []) revealed[k] = true;
  }
  window.addEventListener("afterprint", endPrint);
});
onBeforeUnmount(() => window.removeEventListener("afterprint", endPrint));

function persist() {
  save(storageKey, {
    entered: { ...entered },
    solved: monthList.value.filter((k) => solved[k]),
    revealed: monthList.value.filter((k) => revealed[k]),
  } satisfies Saved);
}
const key = (k: number, f: Field) => `${k}.${f}`;
// Exact to the agora: 55.136 is not 55.14 — not rounding is one of the mistakes.
const same = (a: number, b: string | number) => Math.abs(a - Number(b)) < 0.0005;
const num = (k: number, f: Field) => parseAnswer((entered[key(k, f)] ?? "").replace("−", "-"));
const opening = (k: number) => (isGiven(k, "opening") ? Number(rightValue(k, "opening")) : num(k, "opening"));

function judge(k: number, f: Field): { tone: "ok" | "bad"; text: string } {
  const v = num(k, f);
  if (v === null) return { tone: "bad", text: "חסר מספר. כתבו רק ספרות, למשל 1032.80." };
  const right = Number(rightValue(k, f));
  if (same(v, right)) return { tone: "ok", text: "נכון." };
  const named = props.mistakes[key(k, f)]?.find((m) => same(v, m.value));
  if (named) return { tone: "bad", text: named.message };
  // Right arithmetic on a wrong cell before it, in this month.
  const interest = num(k, "interest");
  const principal = num(k, "principal");
  const open = opening(k);
  if (f === "principal" && interest !== null && !same(interest, rightValue(k, "interest")) && same(v, Number(props.payment) - interest))
    return { tone: "bad", text: "החיסור נכון — אבל לפי הריבית שכתבתם, והיא עוד לא נכונה. תקנו קודם את הריבית." };
  if (f === "closing" && principal !== null && open !== null && !same(principal, rightValue(k, "principal")) && same(v, open - principal))
    return { tone: "bad", text: "החיסור נכון — אבל לפי הקרן שכתבתם, והיא עוד לא נכונה. תקנו קודם את הקרן." };
  if (f === "interest" && open !== null && !same(open, rightValue(k, "opening")))
    return { tone: "bad", text: "הריבית מחושבת על היתרה בתחילת החודש, והיא עוד לא נכונה. תקנו אותה קודם." };
  if (Math.abs(v - right) <= 0.02)
    return { tone: "bad", text: "קרוב, אבל לא עד האגורה. בדקו את העיגול: מעגלים לאגורה הקרובה, וחצי אגורה ומעלה — כלפי מעלה." };
  return { tone: "bad", text: FIELDS.find((x) => x.key === f)?.hint ?? "" };
}

function check(k: number) {
  let ok = true;
  for (const f of fieldsOf(k)) {
    const result = judge(k, f.key);
    feedback[key(k, f.key)] = result;
    if (result.tone !== "ok") ok = false;
  }
  if (ok) solved[k] = true;
  else tries[k] = (tries[k] ?? 0) + 1;
  persist();
}
function reveal(k: number) {
  for (const f of fieldsOf(k)) {
    entered[key(k, f.key)] = rightValue(k, f.key);
    feedback[key(k, f.key)] = undefined;
  }
  revealed[k] = true;
  solved[k] = true;
  persist();
}
function onInput(k: number, f: Field, value: string) {
  entered[key(k, f)] = value;
  feedback[key(k, f)] = undefined;
  persist();
}
function restart() {
  for (const k of Object.keys(entered)) delete entered[k];
  for (const k of Object.keys(feedback)) delete feedback[k];
  for (const k of monthList.value) {
    solved[k] = false;
    revealed[k] = false;
    tries[k] = 0;
  }
  persist();
}

async function printNow() {
  printView.value = true;
  printing.value = true;
  document.documentElement.classList.add("diy-printing");
  await nextTick();
  window.print();
}
function endPrint() {
  printing.value = false;
  document.documentElement.classList.remove("diy-printing");
}
const shown = (k: number, f: Field) => {
  if (isGiven(k, f)) return formatShekels(rightValue(k, f));
  const v = entered[key(k, f)];
  if (!v) return "______";
  return solved[k] ? formatShekels(rightValue(k, f)) : `${v} (לא נבדק)`;
};
const lastRow = computed(() => props.rows[props.rows.length - 1]);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5" data-diy-block :data-diy-print="printing ? 'active' : null">
    <p class="text-body-l font-semibold text-n900">{{ title }}</p>
    <p class="mt-1 text-body-m text-n700">
      התשלום בכל חודש: <span class="ltr font-semibold text-n900">{{ formatShekels(payment) }}</span> · הריבית החודשית:
      <span class="ltr font-semibold text-n900">{{ monthlyPercent }}%</span>
    </p>
    <div class="diy-no-print mt-2 flex flex-wrap gap-x-4 gap-y-1">
      <button type="button" class="min-h-11 min-w-11 text-body-m text-navy underline" :aria-pressed="printView" @click="printView = !printView">
        {{ printView ? "חזרה למילוי" : "תצוגה להדפסה" }}
      </button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="printNow">הדפסה</button>
      <button type="button" class="min-h-11 min-w-11 px-1 text-body-m text-navy underline" @click="restart">להתחיל מחדש</button>
    </div>
    <p class="diy-no-print mt-1 text-caption text-n600">מה שתכתבו נשמר בדפדפן הזה בלבד.</p>

    <!-- Flat view: what is printed. -->
    <div v-if="printView" class="mt-4 text-body-m text-n800">
      <p v-if="printNote" class="rounded-md border border-n200 p-3 text-caption text-n700">{{ printNote }}</p>
      <h3 class="mt-4 text-h3 text-n900">החודשים שמילאתי ביד</h3>
      <div class="mt-2 overflow-x-auto">
        <table class="w-full border-collapse text-caption sm:text-body-m">
          <thead>
            <tr class="border-b border-n200 text-n600">
              <th class="py-1.5 pe-2 text-start font-semibold">חודש</th>
              <th v-for="f in FIELDS" :key="f.key" class="py-1.5 pe-2 text-start font-semibold">{{ f.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="k in monthList" :key="k" class="border-b border-n100">
              <td class="py-1.5 pe-2">{{ k }}{{ solved[k] ? (revealed[k] ? " (הפתרון הוצג)" : " ✓") : "" }}</td>
              <td v-for="f in FIELDS" :key="f.key" class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ shown(k, f.key) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="mt-4 text-h3 text-n900">הלוח המלא, מהמחשבון של הקורס</h3>
      <div class="mt-2 overflow-x-auto">
        <table class="w-full border-collapse text-caption sm:text-body-m">
          <thead>
            <tr class="border-b border-n200 text-n600">
              <th class="py-1.5 pe-2 text-start font-semibold">חודש</th>
              <th class="py-1.5 pe-2 text-start font-semibold">בתחילת החודש</th>
              <th class="py-1.5 pe-2 text-start font-semibold">תשלום</th>
              <th class="py-1.5 pe-2 text-start font-semibold">ריבית</th>
              <th class="py-1.5 pe-2 text-start font-semibold">קרן</th>
              <th class="py-1.5 pe-2 text-start font-semibold">בסוף החודש</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.period" class="border-b border-n100">
              <td class="py-1.5 pe-2">{{ r.period }}</td>
              <td class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ formatShekels(r.opening) }}</span></td>
              <td class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ formatShekels(r.payment) }}</span></td>
              <td class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ formatShekels(r.interest) }}</span></td>
              <td class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ formatShekels(r.principal_paid) }}</span></td>
              <td class="py-1.5 pe-2"><span class="ltr whitespace-nowrap">{{ formatShekels(r.closing) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template v-else>
      <ol class="list-reset mt-4 grid gap-3">
        <li v-for="k in monthList" :key="k" class="rounded-md border p-3" :class="isOpen(k) ? 'border-n200' : 'border-n100 bg-n50'">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="text-body-l font-semibold text-n900">חודש {{ k }}</p>
            <p v-if="solved[k]" class="text-caption text-n700">{{ revealed[k] ? "הפתרון הוצג" : "נכון ✓" }}</p>
            <p v-else-if="!isOpen(k)" class="text-caption text-n600">ייפתח כשחודש {{ k - 1 }} יהיה נכון</p>
          </div>
          <div v-if="isOpen(k)" class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            <div v-for="f in FIELDS" :key="f.key" class="min-w-0">
              <label :for="`sbh-${id}-${k}-${f.key}`" class="block text-caption text-n700">{{ f.label }}</label>
              <p v-if="isGiven(k, f.key)" :id="`sbh-${id}-${k}-${f.key}`" class="flex h-11 items-center text-body-m font-semibold text-n900">
                <span class="ltr">{{ formatShekels(rightValue(k, f.key)) }}</span>
              </p>
              <p v-else-if="solved[k]" class="flex h-11 items-center text-body-m font-semibold text-n900">
                <span class="ltr">{{ formatShekels(rightValue(k, f.key)) }}</span>
              </p>
              <input
                v-else
                :id="`sbh-${id}-${k}-${f.key}`"
                :value="entered[key(k, f.key)] ?? ''"
                inputmode="decimal"
                autocomplete="off"
                dir="ltr"
                class="h-11 w-full rounded-md border bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
                :class="feedback[key(k, f.key)]?.tone === 'bad' ? 'border-danger shadow-ring-error' : feedback[key(k, f.key)]?.tone === 'ok' ? 'border-success' : 'border-n200'"
                :aria-describedby="feedback[key(k, f.key)] ? `sbh-${id}-${k}-${f.key}-fb` : undefined"
                @input="onInput(k, f.key, ($event.target as HTMLInputElement).value)"
              />
              <p
                v-if="!solved[k] && feedback[key(k, f.key)]"
                :id="`sbh-${id}-${k}-${f.key}-fb`"
                class="mt-1 text-caption"
                :class="feedback[key(k, f.key)]?.tone === 'ok' ? 'text-n700' : 'text-n800'"
                aria-live="polite"
              >
                {{ feedback[key(k, f.key)]?.text }}
              </p>
            </div>
          </div>
          <div v-if="isOpen(k) && !solved[k]" class="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
              @click="check(k)"
            >
              בדיקת חודש {{ k }}
            </button>
            <button v-if="(tries[k] ?? 0) >= 2" type="button" class="min-h-11 text-body-m text-navy underline" @click="reveal(k)">הצגת הפתרון לחודש {{ k }}</button>
          </div>
        </li>
      </ol>

      <p v-if="allSolved" class="mt-3 rounded-md bg-success-bg p-3 text-body-m text-n800" aria-live="polite">
        <strong class="text-n900">{{ months }} חודשים, עד האגורה.</strong> אלה בדיוק השורות הראשונות בלוח של המחשבון של הקורס. ככה ממשיכים עד החודש האחרון — וזה מה שהגיליון יעשה בשבילכם.
      </p>

      <button type="button" class="diy-no-print mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showAll" @click="showAll = !showAll">
        {{ showAll ? "הסתרת הלוח המלא" : "הלוח המלא, מהמחשבון של הקורס" }}
      </button>
      <div v-if="showAll" class="mt-2 overflow-x-auto">
        <table class="w-full min-w-[30rem] border-collapse text-caption sm:text-body-m">
          <thead>
            <tr class="border-b border-n200 text-n600">
              <th class="py-2 pe-2 text-start font-semibold">חודש</th>
              <th class="py-2 pe-2 text-start font-semibold">בתחילת החודש</th>
              <th class="py-2 pe-2 text-start font-semibold">תשלום</th>
              <th class="py-2 pe-2 text-start font-semibold">ריבית</th>
              <th class="py-2 pe-2 text-start font-semibold">קרן</th>
              <th class="py-2 pe-2 text-start font-semibold">בסוף החודש</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.period" class="border-b border-n100" :class="r.period <= months ? 'bg-n50' : ''">
              <td class="py-2 pe-2 text-n700">{{ r.period }}</td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap text-n900">{{ formatShekels(r.opening) }}</span></td>
              <td class="py-2 pe-2">
                <span class="ltr whitespace-nowrap text-n900" :class="r.period === lastRow.period ? 'font-semibold' : ''">{{ formatShekels(r.payment) }}</span>
              </td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap text-n900">{{ formatShekels(r.interest) }}</span></td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap text-n900">{{ formatShekels(r.principal_paid) }}</span></td>
              <td class="py-2 pe-2"><span class="ltr whitespace-nowrap text-n900">{{ formatShekels(r.closing) }}</span></td>
            </tr>
          </tbody>
        </table>
        <p class="mt-2 text-caption text-n600">השורות המוצללות הן החודשים שממלאים ביד. התשלום האחרון מודגש: הוא סוגר את מה שנשאר.</p>
      </div>
    </template>
  </div>
</template>

<style>
/* The same print marking as DiyChecklist: print only the block whose print button was pressed. */
@media print {
  html.diy-printing body *:not([data-diy-print="active"]):not(:has([data-diy-print="active"])):not([data-diy-print="active"] *) {
    display: none !important;
  }
  html.diy-printing [data-diy-print="active"] {
    border: none;
    box-shadow: none;
    padding: 0;
  }
  .diy-no-print {
    display: none !important;
  }
}
</style>
