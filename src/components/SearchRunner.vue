<script setup lang="ts">
// Lesson 8.14: a grid search that runs before the learner's eyes. The candidates are the mixes of a small grid (three kinds of
// track, shares in steps of 10% or 20% of the loan, one term for all tracks: 20, 25 or 30 years) for the synthetic case; each is
// calculated by the engine, checked against the hard constraints (every reason shown), and the best weighted score so far is
// kept. Switches: skip the illegal ones BEFORE calculating (the cheap checks), and "coarse then fine".
// ILLUSTRATION: the grid, the weights and the client's limits are for illustration - not a Mogi decision, not a bank's policy.
import { computed, onBeforeUnmount, ref } from "vue";
import { BASE_CHOICE, LEVEL2, loanOfChoice, requestOf, S8_CASE, s8Bank } from "../data/case-s8.ts";
import { GOAL_CONTEXT } from "../data/case-a-mix.ts";
import { CONSTRAINTS, rejectionReasons } from "../lib/calc/constraints.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { scoreText } from "../lib/calc/objectives.ts";
import { coarseToFine, type GridSpec, type SearchContext, searchGrid, type SearchResult, trail, type TrailStep } from "../lib/calc/search.ts";

const choice = BASE_CHOICE;
const request = requestOf(choice);
const bank = s8Bank(choice.bank);
const KIND_HE: Record<string, string> = { fixed_unlinked: "קבועה", prime: "פריים", variable_unlinked: "משתנה" };
const REASON_HE = Object.fromEntries(CONSTRAINTS.map((c) => [c.id, c.labelHe]));
const PRESETS = [
  { id: "bal", name: "מאוזן (40, 30, 30)", w: [40, 30, 30] },
  { id: "pay", name: "החזר ראשון (70, 15, 15)", w: [70, 15, 15] },
  { id: "tot", name: "סך תשלומים (15, 70, 15)", w: [15, 70, 15] },
  { id: "stab", name: "יציבות (15, 15, 70)", w: [15, 15, 70] },
];

const step = ref(10);
const prune = ref(true);
const mode = ref<"full" | "c2f">("full");
const presetId = ref("bal");
const speed = ref(60); // candidates per second
const state = ref<"idle" | "computing" | "playing" | "paused" | "done">("idle");
const shown = ref(0);
const steps = ref<TrailStep[]>([]);
const result = ref<SearchResult | null>(null);
const engineCalls = ref(0);
const total = ref(0);
const showTable = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;
onBeforeUnmount(() => timer && clearInterval(timer));

const weights = computed(() => (PRESETS.find((p) => p.id === presetId.value) ?? PRESETS[0]).w);

function specFor(stepPercent: number): GridSpec {
  return { loan: loanOfChoice(choice), kinds: [...LEVEL2.kinds], stepPercent, termsMonths: [240, 300, 360], termMode: "shared", rates: bank.prices };
}

function context(): SearchContext {
  return {
    scenarios: GOAL_CONTEXT,
    weights: weights.value,
    feasible: (c) => rejectionReasons({ id: c.id, request, tracks: c.tracks }) as string[],
  };
}

async function start() {
  stop();
  state.value = "computing";
  shown.value = 0;
  await new Promise((r) => setTimeout(r, 30));
  const spec = specFor(step.value);
  const ctx = context();
  const opts = { prune: prune.value };
  if (mode.value === "full") {
    const r = searchGrid(spec, ctx, opts);
    result.value = r;
    steps.value = trail(r, ctx.weights);
    engineCalls.value = r.engineCalls;
    total.value = r.size;
  } else {
    const c = coarseToFine(spec, ctx, 20, opts);
    const entries = [...c.coarse.entries, ...(c.fine === c.coarse ? [] : c.fine.entries)];
    const r: SearchResult = { ...c.pool, entries };
    result.value = c.pool;
    steps.value = trail(r, ctx.weights);
    engineCalls.value = c.engineCalls;
    total.value = entries.length;
  }
  play();
}

function play() {
  if (!steps.value.length) return;
  if (speed.value >= 100000) {
    shown.value = steps.value.length;
    state.value = "done";
    return;
  }
  state.value = "playing";
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    shown.value = Math.min(steps.value.length, shown.value + Math.max(1, Math.round(speed.value / 20)));
    if (shown.value >= steps.value.length) {
      state.value = "done";
      stop();
    }
  }, 50);
}
function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}
function pause() {
  stop();
  state.value = "paused";
}
function reset() {
  stop();
  state.value = "idle";
  shown.value = 0;
  steps.value = [];
  result.value = null;
}

const upto = computed(() => steps.value.slice(0, shown.value));
const count = (s: string) => upto.value.filter((x) => x.status === s).length;
const current = computed(() => (shown.value > 0 ? steps.value[shown.value - 1] : null));
const callsSoFar = computed(() => upto.value.filter((x) => x.status !== "pruned" || !prune.value).length);
const entryOf = (id: string | undefined) => result.value?.entries.find((e) => e.candidate.id === id);
const bestEntry = computed(() => entryOf(current.value?.bestSoFar));
const bestScored = computed(() => result.value?.scored.find((s) => s.id === current.value?.bestSoFar));
const describe = (id: string | undefined) => {
  const e = entryOf(id);
  if (!e) return "";
  const c = e.candidate;
  return c.shares.map((s, i) => (s > 0 ? `${KIND_HE[LEVEL2.kinds[i]]} ${s}%` : null)).filter(Boolean).join(" · ") + ` · ${c.termsMonths.find((t) => t > 0)! / 12} שנה`;
};
const reasonText = (rs: string[]) => [...new Set(rs)].map((r) => REASON_HE[r] ?? r).join(", ");
const statusHe = { pruned: "דולג בלי לחשב", rejected: "נפסל אחרי חישוב", feasible: "עובר" } as const;
const feasibleList = computed(() => (result.value?.scored ?? []).filter((s) => s.rank !== null).sort((a, b) => (a.rank as number) - (b.rank as number)));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">הדגמה: הרשת, המשקולות ומגבלות הלקוח להדגמה בלבד, לא החלטה של Mogi ולא מדיניות של בנק. נתונים סינתטיים. הריביות הן של בנק א׳ הבדוי.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">גודל הצעד ברשת (באחוזי הלוואה)</span>
        <select v-model.number="step" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m" :disabled="state === 'playing' || state === 'computing'">
          <option :value="20">20%</option>
          <option :value="10">10%</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">משקולות היעדים</span>
        <select v-model="presetId" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m" :disabled="state === 'playing' || state === 'computing'">
          <option v-for="p in PRESETS" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <label class="flex min-h-[44px] items-center gap-2 text-body-m text-n800">
        <input v-model="prune" type="checkbox" class="h-5 w-5" :disabled="state === 'playing' || state === 'computing'" />
        לדלג על תמהילים אסורים לפני החישוב
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שיטה</span>
        <select v-model="mode" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m" :disabled="state === 'playing' || state === 'computing'">
          <option value="full">כל הרשת</option>
          <option value="c2f">גס (20%) ואז עדין, רק סביב הטוב</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מהירות הצפייה</span>
        <select v-model.number="speed" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-2 text-body-m">
          <option :value="10">איטי</option>
          <option :value="60">בינוני</option>
          <option :value="400">מהיר</option>
          <option :value="100000">מיידי</option>
        </select>
      </label>
    </div>
    <div class="mt-4 flex flex-wrap gap-3">
      <button type="button" class="min-h-[44px] rounded-md bg-teal-deep px-5 text-body-m font-semibold text-n0 disabled:opacity-60" :disabled="state === 'computing' || state === 'playing'" @click="start">
        {{ state === "computing" ? "מחשב..." : "הריצו את החיפוש" }}
      </button>
      <button v-if="state === 'playing'" type="button" class="min-h-[44px] rounded-md border border-n300 px-4 text-body-m" @click="pause">השהיה</button>
      <button v-if="state === 'paused'" type="button" class="min-h-[44px] rounded-md border border-n300 px-4 text-body-m" @click="play">המשך</button>
      <button v-if="state !== 'idle' && state !== 'computing'" type="button" class="min-h-[44px] text-body-m text-navy underline" @click="reset">איפוס</button>
    </div>

    <div v-if="steps.length" class="mt-5">
      <div class="h-2 rounded bg-n100" role="progressbar" :aria-valuenow="shown" aria-valuemin="0" :aria-valuemax="steps.length">
        <div class="h-2 rounded bg-teal-deep" :style="{ width: `${(100 * shown) / steps.length}%` }"></div>
      </div>
      <div class="mt-3 grid gap-3 sm:grid-cols-4">
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">נבדקו</p><p class="text-h3 text-navy"><span class="ltr">{{ shown }} / {{ steps.length }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">דולגו בלי חישוב</p><p class="text-h3 text-navy"><span class="ltr">{{ count("pruned") }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">נפסלו אחרי חישוב</p><p class="text-h3 text-navy"><span class="ltr">{{ count("rejected") }}</span></p></div>
        <div class="rounded-md bg-n50 p-3"><p class="text-caption text-n600">עוברים</p><p class="text-h3 text-navy"><span class="ltr">{{ count("feasible") }}</span></p></div>
      </div>
      <p class="mt-2 text-body-m text-n700" role="status">
        קריאות למנוע עד עכשיו: <strong class="ltr">{{ callsSoFar }}</strong>
        <span v-if="state === 'done'"> (בסך הכול <span class="ltr">{{ engineCalls }}</span>)</span>
      </p>

      <div v-if="current" class="mt-3 rounded-md border border-n200 p-3 text-body-m">
        <p class="text-caption text-n600">התמהיל שנבדק עכשיו</p>
        <p class="font-semibold text-n900">{{ describe(current.id) }}</p>
        <p :class="current.status === 'feasible' ? 'font-semibold text-n900' : 'text-n700'">
          {{ statusHe[current.status] }}<span v-if="current.reasons.length">: {{ reasonText(current.reasons) }}</span>
        </p>
      </div>

      <div v-if="bestEntry" class="mt-3 rounded-md bg-mint p-3 text-body-m text-n900">
        <p class="text-caption text-n700">הטוב ביותר עד עכשיו (מבין העוברים)</p>
        <p class="font-semibold">{{ describe(current?.bestSoFar) }}</p>
        <p v-if="bestEntry.assessment">
          החזר ראשון <span class="ltr">{{ formatWholeShekels(bestEntry.assessment.base.first) }}</span> ·
          סך תשלומים <span class="ltr">{{ formatWholeShekels(bestEntry.assessment.base.total) }}</span> ·
          חשיפה <span class="ltr">{{ formatWholeShekels(bestEntry.assessment.rise) }}</span>
        </p>
        <p v-if="bestScored && state === 'done'">ציון משוקלל <span class="ltr">{{ scoreText(bestScored.score) }}</span> (נמוך הוא טוב; הסולם נקבע מכל העוברים)</p>
      </div>
      <p v-else-if="shown > 0" class="mt-3 text-body-m text-n700">עדיין לא נמצא תמהיל שעובר.</p>

      <button type="button" class="mt-3 min-h-[44px] text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
      </button>
      <div v-if="showTable && state === 'done'" class="mt-2 overflow-x-auto">
        <table class="w-full border-collapse text-body-m">
          <thead><tr class="border-b border-n200 text-caption text-n600"><th class="py-2 pe-3 text-start">דירוג</th><th class="py-2 pe-3 text-start">התמהיל</th><th class="py-2 pe-3 text-start">ציון</th></tr></thead>
          <tbody>
            <tr v-for="s in feasibleList.slice(0, 10)" :key="s.id" class="border-b border-n100">
              <td class="py-1 pe-3"><span class="ltr">{{ s.rank }}</span></td>
              <td class="py-1 pe-3">{{ describe(s.id) }}</td>
              <td class="py-1 pe-3"><span class="ltr">{{ scoreText(s.score) }}</span></td>
            </tr>
          </tbody>
        </table>
        <p class="mt-2 text-caption text-n600">עד עשרה העוברים הטובים ביותר. ״עוברים״ כאן: חוקי בנק ישראל, חוקי בנק א׳ הבדוי, ומגבלות הלקוח (החזר ראשון עד {{ formatWholeShekels(S8_CASE.maxPayment) }}, ויחס החזר עד <span class="ltr">{{ S8_CASE.targetRatio }}%</span>).</p>
      </div>
      <p v-else-if="showTable" class="mt-2 text-body-m text-n700">הטבלה מופיעה בסוף הריצה.</p>
    </div>
  </div>
</template>
