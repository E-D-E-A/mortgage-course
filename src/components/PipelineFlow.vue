<script setup lang="ts">
// A live flow chart of the whole algorithm (lesson 8.21): for each of four FICTIONAL banks, the stages one after the
// other: positioning, mix, predicted price, chance of approval, rank, why. The numbers of every stage come in as
// props (computed by the lesson's facts: the grid search, the bank's invented rules, the engine, the probability
// model). The learner can force a positioning, move the threshold, or let a real offer from one bank replace its
// estimate; the ranking and the explanation are then read again with the course's ranking.ts. SYNTHETIC and for
// illustration: a teaching model of what Mogi plans (עתיד); Mogi has no such code. The language model only explains.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { formatShekels } from "../lib/calc/money.ts";
import { rankRows, type RankInput } from "../lib/calc/ranking.ts";
import { BANK_HE, mixName, POSITIONING_HE } from "../data/pipeline-demo.ts";

interface Run {
  bank: string;
  positioning: string;
  /** The search's best candidate id; empty when no candidate passed the hard constraints. */
  bestId: string;
  feasible: number;
  size: number;
  /** "approve" | "refuse" for the best mix read by the bank; "none" when the search found nothing. */
  decision: string;
  relief: string;
  ratio: string;
  ltv: string;
  rates: string[];
  first: string;
  total: string;
  p: string;
  /** The bank's financing line, percent. */
  ltvMax: string;
}
interface Offer {
  bank: string;
  rate: string;
  first: string;
  total: string;
}
const props = defineProps<{ runs: Run[]; offer: Offer; threshold: string }>();

const mode = ref<"best" | "asked" | "parent">("best");
const thr = ref(Number(props.threshold));
const offerOn = ref(false);
const sel = ref<string | null>(null);
const showTable = ref(false);

const banks = computed(() => [...new Set(props.runs.map((r) => r.bank))]);
const inputOf = (r: Run): RankInput => {
  const refused = r.decision !== "approve";
  return { id: `${r.bank}.${r.positioning}`, decision: refused ? "refuse" : "approve", total: refused ? "0.00" : r.total, p: refused ? "0.000000" : r.p };
};
// The positioning kept for each bank: the forced one, or the better of the two by the same ranking rule.
const kept = computed(() =>
  banks.value.map((b) => {
    const mine = props.runs.filter((r) => r.bank === b);
    if (mode.value !== "best") return mine.find((r) => r.positioning === mode.value) as Run;
    const ranked = rankRows(mine.map(inputOf), thr.value.toFixed(2));
    const win = ranked.find((x) => x.rank === 1) ?? ranked[0];
    return mine.find((r) => `${r.bank}.${r.positioning}` === win.id) as Run;
  }),
);
const rows = computed<RankInput[]>(() =>
  kept.value.map((r) => {
    if (offerOn.value && r.bank === props.offer.bank) return { id: r.bank, decision: "approve" as const, total: props.offer.total, p: "1.000000" };
    const i = inputOf(r);
    return { ...i, id: r.bank };
  }),
);
const ranked = computed(() => rankRows(rows.value, thr.value.toFixed(2)));
const ordered = computed(() => {
  const list = kept.value.map((r, k) => ({ run: r, row: rows.value[k], out: ranked.value[k] }));
  return [...list].sort((a, b) => (a.out.rank ?? 99) - (b.out.rank ?? 99));
});
const first = computed(() => ordered.value.find((x) => x.out.rank === 1));
const isOffer = (bank: string) => offerOn.value && bank === props.offer.bank;
const pc = (s: string) => `${Math.round(Number(s) * 100)}%`;
const money = (s: string) => formatShekels(s);
const gapToFirst = (x: { row: RankInput }) => (first.value ? formatShekels(new Decimal(x.row.total).minus(first.value.row.total)) : "");
const why = (x: { run: Run; row: RankInput; out: { group: number; rank: number | null } }) => {
  if (x.out.rank === 1) return `הראשון: הזול ביותר מבין מי שסיכוי האישור שלהם ${pc(thr.value.toFixed(2))} ומעלה.`;
  if (x.out.group === 3) return x.run.decision === "none" ? `אף מועמד לא עבר את הקווים של הבנק (קו המימון שלו ${x.run.ltvMax}%).` : "הבנק פוסל את הבקשה.";
  if (x.out.group === 2) return `סיכוי האישור ${pc(x.row.p)} נמוך מהסף ${pc(thr.value.toFixed(2))}, ולכן הוא אחרי מי שמעל הסף.`;
  return `מאושר מעל הסף, ויקר ב־${gapToFirst(x)} מהראשון.`;
};
const stages = ["מיצוב", "תמהיל", "מחיר חזוי", "הסתברות", "דירוג", "הסבר"];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <div class="grid gap-4 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">מיצוב הבקשה</span>
        <select v-model="mode" class="min-h-11 rounded-md border border-n300 bg-n0 px-3 text-body-m">
          <option value="best">הטוב מבין השניים, לכל בנק</option>
          <option value="asked">{{ POSITIONING_HE.asked }}</option>
          <option value="parent">{{ POSITIONING_HE.parent }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">סף הסתברות להצגה ראשונה</span>
        <input v-model.number="thr" type="range" min="0.45" max="0.65" step="0.01" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ pc(thr.toFixed(2)) }}</span></span>
      </label>
      <label class="flex min-h-11 items-center gap-3 self-end text-body-m text-n800">
        <input v-model="offerOn" type="checkbox" class="h-5 w-5" />
        <span>הצעה אמיתית מ{{ BANK_HE[offer.bank] }} (<span class="ltr">{{ offer.rate }}%</span> בקבועה)</span>
      </label>
    </div>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-4 gap-y-1 text-caption text-n700" aria-label="שלבים">
      <li v-for="(s, k) in stages" :key="s" class="flex items-center gap-1"><span class="font-semibold text-n900">{{ k + 1 }}.</span> {{ s }}<span v-if="k < stages.length - 1" aria-hidden="true"> ←</span></li>
    </ul>

    <ol class="list-reset mt-4 space-y-3">
      <li v-for="x in ordered" :key="x.run.bank" class="rounded-md border p-3" :class="x.out.rank === 1 ? 'border-teal-deep bg-n50' : 'border-n200 bg-n0'">
        <button type="button" class="flex w-full min-h-11 items-center justify-between gap-3 text-start" :aria-expanded="sel === x.run.bank" @click="sel = sel === x.run.bank ? null : x.run.bank">
          <span class="text-body-l font-semibold text-n900">{{ x.out.rank ? `מקום ${x.out.rank}` : "נפסל" }} · {{ BANK_HE[x.run.bank] }}<span v-if="isOffer(x.run.bank)" class="ms-2 rounded-pill bg-n100 px-2 py-0.5 text-caption font-semibold text-n800">הצעה אמיתית</span></span>
          <span class="text-body-m text-n700"><span class="ltr">{{ x.row.decision === "approve" ? money(x.row.total) : "—" }}</span></span>
        </button>
        <p class="mt-1 text-body-m text-n800">{{ why(x) }}</p>
        <dl v-if="sel === x.run.bank" class="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-body-m text-n800 sm:grid-cols-2">
          <div><dt class="text-caption font-semibold text-n600">1. מיצוב</dt><dd>{{ POSITIONING_HE[x.run.positioning] }}{{ mode === "best" ? " (הטוב מבין השניים)" : "" }}</dd></div>
          <div><dt class="text-caption font-semibold text-n600">2. תמהיל</dt><dd>{{ x.run.bestId ? mixName(x.run.bestId) : "אין מועמד אפשרי" }} <span class="text-caption text-n600">(<span class="ltr">{{ x.run.feasible }}</span> אפשריים מתוך <span class="ltr">{{ x.run.size }}</span>)</span></dd></div>
          <div v-if="x.run.decision !== 'none'"><dt class="text-caption font-semibold text-n600">3. מחיר חזוי</dt><dd><template v-if="isOffer(x.run.bank)">לפי ההצעה: <span class="ltr">{{ money(offer.first) }}</span> בחודש, סך <span class="ltr">{{ money(offer.total) }}</span></template><template v-else>הקלה <span class="ltr">{{ x.run.relief }}</span> נקודות; <span class="ltr">{{ money(x.run.first) }}</span> בחודש, סך <span class="ltr">{{ money(x.run.total) }}</span></template></dd></div>
          <div v-if="x.run.decision !== 'none'"><dt class="text-caption font-semibold text-n600">4. הסתברות</dt><dd><span class="ltr">{{ isOffer(x.run.bank) ? "100%" : pc(x.run.p) }}</span> <span class="text-caption text-n600">(יחס החזר <span class="ltr">{{ x.run.ratio }}%</span>, מימון <span class="ltr">{{ x.run.ltv }}%</span>)</span></dd></div>
          <div><dt class="text-caption font-semibold text-n600">5. דירוג</dt><dd>{{ x.out.rank ? `מקום ${x.out.rank}` : "אין דירוג: הבנק פוסל" }}</dd></div>
          <div><dt class="text-caption font-semibold text-n600">6. הסבר</dt><dd>{{ why(x) }}</dd></div>
        </dl>
      </li>
    </ol>
    <p class="mt-2 text-caption text-n600">לחצו על בנק כדי לראות את כל השלבים שלו. הבנקים פיקטיביים, והמספרים סינתטיים להדגמה; הדירוג הוא של הקורס.</p>

    <button type="button" class="mt-3 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">בנק</th>
            <th class="py-2 pe-2 text-start">מיצוב</th>
            <th class="py-2 pe-2 text-start">תמהיל</th>
            <th class="py-2 pe-2 text-start">סך תשלומים</th>
            <th class="py-2 pe-2 text-start">הסתברות</th>
            <th class="py-2 pe-2 text-start">דירוג</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="x in ordered" :key="x.run.bank" class="border-b border-n100 align-top">
            <td class="py-1 pe-2 font-semibold">{{ BANK_HE[x.run.bank] }}</td>
            <td class="py-1 pe-2">{{ POSITIONING_HE[x.run.positioning] }}</td>
            <td class="py-1 pe-2">{{ x.run.bestId ? mixName(x.run.bestId) : "—" }}</td>
            <td class="py-1 pe-2"><span class="ltr">{{ x.row.decision === "approve" ? money(x.row.total) : "—" }}</span></td>
            <td class="py-1 pe-2"><span class="ltr">{{ x.row.decision === "approve" ? pc(x.row.p) : "—" }}</span></td>
            <td class="py-1 pe-2">{{ x.out.rank ?? "נפסל" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
