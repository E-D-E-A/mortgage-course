<script setup lang="ts">
// Lesson 5.2: the three uniform baskets side by side, and the bank's own proposed basket.
// The learner picks a (fictional) bank, a loan and a term and sees, for each basket, the
// split of the loan into exact fractions, each track's rate on the day of issue and the
// measures of lessons 3.8–3.10 (first payment, highest expected payment, total, actual
// cost of credit). Everything is computed in offers.ts on the course's ILLUSTRATIVE rates
// and forecast (src/data/offer-examples.ts): none of it is a bank's price or a
// Bank of Israel forecast. The baskets are the team's transcription of appendix 5
// of Directive 451 (Brain 7733250), not checked against the directive.
import { computed, ref } from "vue";
import { BANKS, EXAMPLE_LABEL, EXAMPLE_MONTHS, FORECAST_A, uniformOffer } from "../data/offer-examples.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { canSplitExactly, impliedRate, KIND_HE, measureOffer, type Offer, scaleOffer, UNIFORM_BASKETS } from "../lib/calc/offers.ts";

const loans = ["600000", "900000", "1000000", "1200000"];
const terms = [15, 20, 25, 30];
const bankIndex = ref(0);
const loan = ref("900000");
const years = ref(25);
const showTable = ref(false);

const colours: Record<string, string> = {
  fixed_unlinked: "var(--mogi-teal-deep)",
  prime: "var(--mogi-turquoise-2)",
  variable_linked: "var(--mogi-n300)",
  fixed_linked: "var(--mogi-navy)",
  variable_unlinked: "var(--mogi-mint)",
};

interface Card {
  title: string;
  proposed: boolean;
  offer: Offer | null;
  why?: string;
}

const cards = computed<Card[]>(() => {
  const bank = BANKS[bankIndex.value];
  const out: Card[] = UNIFORM_BASKETS.map((b) => ({
    title: b.he,
    proposed: false,
    offer: canSplitExactly(loan.value, b) ? uniformOffer(bank, b, FORECAST_A.id, `${loan.value}.00`, "0.00", years.value * 12) : null,
    why: "הסכום לא מתחלק בדיוק לחלקים שלמים של אגורה",
  }));
  const proposed = scaleOffer(bank.proposed(FORECAST_A.id), loan.value);
  out.push({ title: "הסל המוצע", proposed: true, offer: proposed, why: "בסל הזה הבנק בחר את החלוקה, ולא כל סכום מתחלק בה בדיוק" });
  return out;
});

const shown = computed(() =>
  cards.value.map((c) => {
    if (!c.offer) return { ...c, tracks: [], m: null };
    const total = c.offer.tracks.reduce((s, t) => s + Number(t.amount), 0);
    return {
      ...c,
      tracks: c.offer.tracks.map((t) => ({ kindHe: KIND_HE[t.kind], amount: t.amount, share: (Number(t.amount) / total) * 100, kind: t.kind, years: t.months / 12, rate: impliedRate(t, FORECAST_A) })),
      m: measureOffer(c.offer, FORECAST_A),
    };
  }),
);
const bankName = computed(() => BANKS[bankIndex.value].name);
const pct = (v: { toFixed: (n: number) => string }) => `${v.toFixed(2)}%`;
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n700">{{ EXAMPLE_LABEL }}. תחזית להמחשה א׳, לא של בנק ישראל.</p>

    <div class="mt-3 flex flex-wrap items-end gap-4">
      <div>
        <span class="text-caption font-semibold text-n600">הבנק</span>
        <div class="mt-1 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="איזה בנק">
          <button
            v-for="(b, i) in BANKS"
            :key="b.id"
            type="button"
            class="min-h-11 rounded-sm px-3 text-body-m"
            :class="bankIndex === i ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'"
            :aria-pressed="bankIndex === i"
            @click="bankIndex = i"
          >
            {{ b.name }}
          </button>
        </div>
      </div>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">סכום ההלוואה</span>
        <select v-model="loan" class="min-h-11 rounded-md border border-n200 bg-n0 px-3 text-body-m">
          <option v-for="l in loans" :key="l" :value="l">{{ formatWholeShekels(l) }}</option>
        </select>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">התקופה בסלים האחידים</span>
        <select v-model.number="years" class="min-h-11 rounded-md border border-n200 bg-n0 px-3 text-body-m">
          <option v-for="y in terms" :key="y" :value="y">{{ y }} שנה</option>
        </select>
      </label>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <section v-for="c in shown" :key="c.title" class="rounded-md border border-n200 p-3" :class="c.proposed ? 'border-dashed bg-n50' : ''" :aria-label="c.proposed ? `הסל המוצע של ${bankName}` : c.title">
        <h4 class="!mt-0 text-body-l font-semibold text-n900">{{ c.proposed ? `הסל המוצע של ${bankName}` : c.title }}</h4>
        <template v-if="c.m">
          <div class="mt-2 flex h-4 overflow-hidden rounded-sm bg-n100" aria-hidden="true">
            <span v-for="(t, k) in c.tracks" :key="k" class="h-full" :style="{ width: `${t.share}%`, background: colours[t.kind] }"></span>
          </div>
          <ul class="list-reset mt-2 grid gap-1 text-body-m text-n800">
            <li v-for="(t, k) in c.tracks" :key="k" class="flex items-start gap-2">
              <span class="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-sm" :style="{ background: colours[t.kind] }" aria-hidden="true"></span>
              <span>
                {{ t.kindHe }}: <span class="ltr">{{ formatWholeShekels(t.amount) }}</span>, {{ t.years }} שנה,
                <span class="ltr">{{ t.rate }}%</span><template v-if="t.kind === 'prime' || t.kind === 'variable_linked' || t.kind === 'variable_unlinked'"> (ליום ההצעה)</template>
              </span>
            </li>
          </ul>
          <dl class="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m">
            <dt class="text-n700">ההחזר הראשון</dt>
            <dd class="text-end font-semibold text-n900"><span class="ltr">{{ formatShekels(c.m.first) }}</span></dd>
            <dt class="text-n700">ההחזר המרבי החזוי (חודש {{ c.m.highestMonth }})</dt>
            <dd class="text-end font-semibold text-n900"><span class="ltr">{{ formatShekels(c.m.highest) }}</span></dd>
            <dt class="text-n700">סך התשלומים</dt>
            <dd class="text-end font-semibold text-n900"><span class="ltr">{{ formatShekels(c.m.total) }}</span></dd>
            <dt class="text-n700">העלות הממשית של האשראי</dt>
            <dd class="text-end font-semibold text-n900"><span class="ltr">{{ pct(c.m.expectedTotalRate) }}</span></dd>
          </dl>
          <p v-if="c.proposed" class="mt-2 text-caption text-n700">תמהיל שהבנק בחר, עם תקופה לכל מסלול. אי אפשר להשוות את המחיר שלו למחיר של בנק אחר.</p>
        </template>
        <p v-else class="mt-2 text-body-m text-n700">{{ c.why }}. {{ c.proposed ? "" : "שליש הוא בדיוק שליש, ולכן הסכום חייב להתחלק." }}</p>
      </section>
    </div>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colours.fixed_unlinked }"></span>קבועה לא צמודה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colours.prime }"></span>משתנה פריים</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colours.variable_linked }"></span>משתנה צמודה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colours.fixed_linked }"></span>קבועה צמודה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm" :style="{ background: colours.variable_unlinked }"></span>משתנה לא צמודה</li>
    </ul>
    <p class="mt-2 text-caption text-n600">שלושת הסלים האחידים: תקופה אחת לכולם, {{ EXAMPLE_MONTHS / 12 }} שנה כברירת מחדל. הריבית של מסלול משתנה היא של היום; אחריו היא נשענת על התחזית.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[34rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">הסל</th>
            <th class="py-2 pe-3 text-start">ההחזר הראשון</th>
            <th class="py-2 pe-3 text-start">המרבי החזוי</th>
            <th class="py-2 pe-3 text-start">סך התשלומים</th>
            <th class="py-2 pe-3 text-start">העלות הממשית</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in shown" :key="c.title" class="border-b border-n100">
            <td class="py-1 pe-3">{{ c.proposed ? `המוצע של ${bankName}` : c.title }}</td>
            <template v-if="c.m">
              <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(c.m.first) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(c.m.highest) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ formatShekels(c.m.total) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ pct(c.m.expectedTotalRate) }}</span></td>
            </template>
            <td v-else colspan="4" class="py-1 pe-3 text-n700">{{ c.why }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
