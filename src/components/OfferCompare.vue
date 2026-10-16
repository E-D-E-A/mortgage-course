<script setup lang="ts">
// Lesson 5.3 (required illustration): the offer comparer. Three offers from three
// FICTIONAL banks, each on a basket, an amount and a forecast the learner can change.
// For each offer it shows the three measures of the pre-approval (expected total rate,
// total expected payments, highest expected payment), marks which offer is lowest on
// each, and says whether the offers share the same basis: the same amount, the same mix,
// the same month and the same forecast. When they do not, the table still shows the
// numbers — but says they are not a price comparison, and names what differs.
// Everything is computed by src/lib/calc/offers.ts (which uses metrics.ts) on the
// course's ILLUSTRATIVE rates and forecasts (src/data/offer-examples.ts), never a bank's
// price or a Bank of Israel forecast. The comparer says what is comparable, never which
// offer to take.
import { computed, reactive, ref } from "vue";
import { BANKS, EXAMPLE_LABEL, FORECASTS, uniformOffer } from "../data/offer-examples.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { basisDifferences, type BasisDifference, basketById, KIND_HE, measureOffer, type MeasureKey, type Offer, scaleOffer } from "../lib/calc/offers.ts";

type BasketChoice = "uniform_1" | "uniform_2" | "uniform_3" | "proposed";
interface Config {
  basket: BasketChoice;
  loan: string;
  forecast: string;
}
const basketLabels: Record<BasketChoice, string> = { uniform_1: "סל אחיד 1", uniform_2: "סל אחיד 2", uniform_3: "סל אחיד 3", proposed: "הסל המוצע של הבנק" };
const loans = ["600000", "900000", "1200000"];
const differenceLabels: Record<BasisDifference, string> = {
  amount: "סכום ההלוואה",
  mix: "התמהיל (מסלולים, חלוקה, תקופות)",
  month: "חודש החישוב",
  forecast: "התחזית",
};
const base: Config = { basket: "uniform_3", loan: "900000", forecast: "forecast_a" };
const presets: { label: string; make: () => Config[] }[] = [
  { label: "אותו בסיס", make: () => [{ ...base }, { ...base }, { ...base }] },
  { label: "תחזית אחרת להצעה אחת", make: () => [{ ...base, forecast: "forecast_b" }, { ...base }, { ...base }] },
  { label: "סכום אחר להצעה אחת", make: () => [{ ...base, loan: "600000" }, { ...base }, { ...base }] },
  { label: "תמהיל אחר להצעה אחת", make: () => [{ ...base, basket: "uniform_2" }, { ...base }, { ...base }] },
  { label: "חודש אחר להצעה אחת", make: () => [{ ...base, forecast: "forecast_c" }, { ...base }, { ...base }] },
  { label: "שלושה סלים מוצעים", make: () => [{ ...base, basket: "proposed" }, { ...base, basket: "proposed" }, { ...base, basket: "proposed" }] },
];
const configs = reactive<Config[]>(presets[0].make());
const active = ref(0);
const showTable = ref(false);
function pick(i: number) {
  active.value = i;
  presets[i].make().forEach((c, k) => Object.assign(configs[k], c));
}

const forecastById = (id: string) => FORECASTS.find((f) => f.id === id)!;
function offerOf(i: number): Offer | null {
  const c = configs[i];
  const bank = BANKS[i];
  if (c.basket === "proposed") return scaleOffer(bank.proposed(c.forecast), c.loan);
  return uniformOffer(bank, basketById(c.basket), c.forecast, `${c.loan}.00`);
}
const cache = new Map<string, ReturnType<typeof measureOffer>>();
function measuresOf(o: Offer) {
  const key = JSON.stringify(o);
  let m = cache.get(key);
  if (!m) {
    m = measureOffer(o, forecastById(o.forecast));
    cache.set(key, m);
  }
  return m;
}

const offers = computed(() => configs.map((_, i) => offerOf(i)));
const results = computed(() =>
  offers.value.map((o, i) => (o ? { name: BANKS[i].name, offer: o, m: measuresOf(o), cfg: configs[i] } : { name: BANKS[i].name, offer: null, m: null, cfg: configs[i] })),
);
const complete = computed(() => results.value.every((r) => r.m));
const differences = computed<BasisDifference[]>(() => (complete.value ? basisDifferences(offers.value as Offer[]) : []));
const sameBasis = computed(() => complete.value && differences.value.length === 0);

const TIE = 0.005;
const rows = computed(() => {
  const defs: { key: MeasureKey; label: string; hint: string; value: (m: NonNullable<(typeof results.value)[number]["m"]>) => number; show: (m: NonNullable<(typeof results.value)[number]["m"]>) => string }[] = [
    { key: "expectedTotalRate", label: "ריבית כוללת חזויה", hint: "לשנה", value: (m) => m.expectedTotalRate.toNumber(), show: (m) => `${m.expectedTotalRate.toFixed(2)}%` },
    { key: "total", label: "סך תשלומים חזוי", hint: "כל התשלומים החזויים", value: (m) => Number(m.total), show: (m) => formatShekels(m.total) },
    { key: "highest", label: "ההחזר המרבי החזוי", hint: "החודש הגבוה ביותר", value: (m) => Number(m.highest), show: (m) => `${formatShekels(m.highest)} (חודש ${m.highestMonth})` },
  ];
  return defs.map((d) => {
    const vals = results.value.map((r) => (r.m ? d.value(r.m) : NaN));
    const min = Math.min(...vals.filter((v) => !Number.isNaN(v)));
    return { ...d, cells: results.value.map((r, i) => ({ text: r.m ? d.show(r.m) : "—", lowest: !Number.isNaN(vals[i]) && Math.abs(vals[i] - min) <= TIE })) };
  });
});
// Money inside running text is isolated left to right, so the shekel sign sits where the other tables put it.
const ltr = (x: string) => `\u2066${x}\u2069`;
const mixText = (o: Offer) => o.tracks.map((t) => `${KIND_HE[t.kind]} ${ltr(formatWholeShekels(t.amount))} ל־${t.months / 12} שנה`).join(" · ");
const status = computed(() =>
  !complete.value
    ? "אי אפשר לפצל את אחת ההצעות לחלקים שלמים של אגורה."
    : sameBasis.value
      ? "אותו בסיס: אותו סכום, אותו תמהיל, אותו חודש ואותה תחזית. אפשר להשוות מחיר."
      : `לא אותו בסיס. מה שונה: ${differences.value.map((d) => differenceLabels[d]).join(", ")}. המספרים בטבלה נכונים, אבל הדירוג שלהם אינו השוואת מחיר.`,
);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n700">{{ EXAMPLE_LABEL }}.</p>

    <div class="mt-3">
      <span class="text-caption font-semibold text-n600">מצבים מוכנים</span>
      <div class="mt-1 flex flex-wrap gap-2" role="group" aria-label="מצבים מוכנים">
        <button
          v-for="(p, i) in presets"
          :key="p.label"
          type="button"
          class="min-h-11 rounded-md border border-n200 px-3 text-body-m"
          :class="active === i ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
          :aria-pressed="active === i"
          @click="pick(i)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <section v-for="(c, i) in configs" :key="i" class="rounded-md border border-n200 p-3" :aria-label="`ההצעה של ${BANKS[i].name}`">
        <h4 class="!mt-0 text-body-l font-semibold text-n900">{{ BANKS[i].name }}</h4>
        <label class="mt-2 flex flex-col">
          <span class="text-caption font-semibold text-n600">התמהיל</span>
          <select v-model="c.basket" class="min-h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m" @change="active = -1">
            <option v-for="(label, k) in basketLabels" :key="k" :value="k">{{ label }}</option>
          </select>
        </label>
        <label class="mt-2 flex flex-col">
          <span class="text-caption font-semibold text-n600">סכום ההלוואה</span>
          <select v-model="c.loan" class="min-h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m" @change="active = -1">
            <option v-for="l in loans" :key="l" :value="l">{{ formatWholeShekels(l) }}</option>
          </select>
        </label>
        <label class="mt-2 flex flex-col">
          <span class="text-caption font-semibold text-n600">התחזית</span>
          <select v-model="c.forecast" class="min-h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m" @change="active = -1">
            <option v-for="f in FORECASTS" :key="f.id" :value="f.id">{{ f.label }}</option>
          </select>
        </label>
        <p v-if="offers[i]" class="mt-2 text-caption text-n700">{{ mixText(offers[i] as Offer) }}</p>
      </section>
    </div>

    <p class="mt-4 rounded-md p-3 text-body-m" :class="sameBasis ? 'bg-mint text-n900' : 'bg-warning-bg text-n900'" role="status" aria-live="polite">
      <strong>{{ sameBasis ? "אפשר להשוות." : "לא להשוות מחיר." }}</strong> {{ status }}
    </p>

    <div class="mt-4 hidden overflow-x-auto sm:block">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">המדד</th>
            <th v-for="r in results" :key="r.name" class="py-2 pe-3 text-start font-semibold">{{ r.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key" class="border-b border-n100 align-top">
            <th scope="row" class="py-2 pe-3 text-start font-normal text-n800">
              {{ row.label }}<br /><span class="text-caption text-n600">{{ row.hint }}</span>
            </th>
            <td v-for="(cell, i) in row.cells" :key="i" class="py-2 pe-3">
              <span class="ltr whitespace-nowrap" :class="cell.lowest ? 'font-semibold text-n900' : 'text-n700'">{{ cell.text }}</span>
              <span v-if="cell.lowest && complete" class="mt-1 block w-fit rounded-pill px-2 py-0.5 text-caption" :class="sameBasis ? 'bg-mint text-n900' : 'border border-n300 text-n700'">
                {{ sameBasis ? "נמוך ביותר" : "נמוך, לא להשוות" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ul class="list-reset mt-4 grid gap-3 sm:hidden" aria-label="שלושת המספרים בכל הצעה">
      <li v-for="(r, i) in results" :key="r.name" class="rounded-md border border-n200 p-3">
        <p class="text-body-l font-semibold text-n900">{{ r.name }}</p>
        <dl class="mt-2 grid gap-2">
          <div v-for="row in rows" :key="row.key">
            <dt class="text-caption text-n600">{{ row.label }} · {{ row.hint }}</dt>
            <dd class="mt-0.5">
              <span class="ltr whitespace-nowrap" :class="row.cells[i].lowest ? 'font-semibold text-n900' : 'text-n700'">{{ row.cells[i].text }}</span>
              <span v-if="row.cells[i].lowest && complete" class="ms-1 inline-block rounded-pill px-2 py-0.5 text-caption" :class="sameBasis ? 'bg-mint text-n900' : 'border border-n300 text-n700'">
                {{ sameBasis ? "נמוך ביותר" : "נמוך, לא להשוות" }}
              </span>
            </dd>
          </div>
        </dl>
      </li>
    </ul>
    <p class="mt-2 text-caption text-n600">הדירוג נשען על תחזית אחת בכל הצעה. תחזית אחרת יכולה לשנות אותו. בכלי הזה לא נגבות עמלות ביום ההעמדה (העמלות = 0). {{ EXAMPLE_LABEL }}. ההחזר הראשון מופיע בתצוגת הטבלה.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <p v-if="showTable" class="mt-2 text-caption text-n600 sm:hidden">יש עוד עמודות משמאל: גללו הצידה.</p>
    <div v-if="showTable" class="mt-2 overflow-x-auto" tabindex="0" role="region" aria-label="טבלת ההצעות, ניתנת לגלילה">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">ההצעה</th>
            <th class="py-2 pe-3 text-start">התמהיל</th>
            <th class="py-2 pe-3 text-start">הסכום</th>
            <th class="py-2 pe-3 text-start">התחזית</th>
            <th class="py-2 pe-3 text-start">ההחזר הראשון</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.name" class="border-b border-n100 align-top">
            <td class="py-1 pe-3">{{ r.name }}</td>
            <td class="py-1 pe-3">{{ basketLabels[r.cfg.basket] }}</td>
            <td class="py-1 pe-3"><span class="ltr">{{ formatWholeShekels(r.cfg.loan) }}</span></td>
            <td class="py-1 pe-3">{{ forecastById(r.cfg.forecast).label }}</td>
            <td class="py-1 pe-3"><span v-if="r.m" class="ltr">{{ formatShekels(r.m.first) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
