<script setup lang="ts">
// Lesson 4.7's illustration: declared against verified. The learner moves what
// the bank verifies (the income of the self-employed borrower, and the equity
// the statements show), picks a cap, and sees the same request twice: on the
// numbers that were declared, and on the numbers that were verified. It shows
// the payment, the repayment ratio, the largest loan the cap allows, and the
// equity the request would then need. It never says what the bank will do: the
// four answers are the bank's, and no source tells what makes it choose one.
// Numbers from underwriting.ts; the mix, the caps and the sources come from the page.
import { computed, ref } from "vue";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import { maxLoanAtRatio, mixPayment, ratioPercent, scaleMix } from "../lib/calc/underwriting.ts";

interface TrackIn {
  principal: string;
  ratePercent: string;
  months: number;
}
interface Cap {
  value: string;
  label: string;
}
const props = defineProps<{
  tracks: TrackIn[];
  price: number;
  equity: number;
  aviDeclared: number;
  /** The income as verified, where the slider starts. */
  aviVerified: number;
  michal: number;
  caps: Cap[];
  source: string;
}>();

const verifiedIncome = ref(props.aviVerified);
const verifiedEquity = ref(props.equity);
const picked = ref(0);
const showTable = ref(false);
const cap = computed(() => props.caps[picked.value]);

const columns = computed(() =>
  [
    { key: "declared", title: "לפי מה שהוצהר", avi: props.aviDeclared, equity: props.equity },
    { key: "verified", title: "לפי מה שאומת", avi: verifiedIncome.value, equity: verifiedEquity.value },
  ].map((c) => {
    const loan = Math.max(props.price - c.equity, 1);
    const payment = mixPayment(scaleMix(props.tracks, loan));
    const income = c.avi + props.michal;
    const ratio = ratioPercent(payment, income);
    const most = maxLoanAtRatio(props.tracks, income, cap.value.value);
    const over = ratio.gt(cap.value.value);
    const equityNeeded = Math.max(props.price - most.toNumber(), 0);
    return { ...c, loan, payment, income, ratio, most, over, equityNeeded, missing: Math.max(equityNeeded - c.equity, 0) };
  }),
);
const pct = (d: { toDecimalPlaces: (n: number) => { toString: () => string } }) => `${d.toDecimalPlaces(1).toString()}%`;
const changed = computed(() => verifiedIncome.value !== props.aviDeclared || verifiedEquity.value !== props.equity);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">מספרים להמחשה. {{ source }}</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההכנסה החודשית של אבי, כפי שאומתה</span>
        <input v-model.number="verifiedIncome" type="range" min="4000" :max="aviDeclared" step="100" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(verifiedIncome) }}</span></span>
        <span class="text-caption text-n600">הוא הצהיר: <span class="ltr">{{ formatShekelsText(aviDeclared) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">ההון העצמי, כפי שהתברר מדפי החשבון</span>
        <input v-model.number="verifiedEquity" type="range" min="400000" :max="600000" step="10000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(verifiedEquity) }}</span></span>
        <span class="text-caption text-n600">הוא הצהיר: <span class="ltr">{{ formatShekelsText(equity) }}</span></span>
      </label>
    </div>

    <fieldset class="mt-4">
      <legend class="text-caption font-semibold text-n600">תקרה ליחס ההחזר</legend>
      <div class="mt-1 flex flex-wrap gap-2">
        <label
          v-for="(c, i) in caps"
          :key="c.value"
          class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
          :class="picked === i ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        >
          <input v-model="picked" type="radio" name="verified-gap-cap" :value="i" class="accent-teal-deep" />
          <span><span class="ltr">{{ c.value }}%</span> · {{ c.label }}</span>
        </label>
      </div>
    </fieldset>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div v-for="c in columns" :key="c.key" class="rounded-md border p-4" :class="c.over ? 'border-warning bg-warning-bg' : 'border-n200 bg-n50'">
        <p class="text-body-m font-semibold text-n900">{{ c.title }}</p>
        <p class="text-caption text-n600">הכנסת שניהם: <span class="ltr">{{ formatShekelsText(c.income) }}</span></p>
        <p class="text-caption text-n600">הלוואה: <span class="ltr">{{ formatShekelsText(c.loan) }}</span> · החזר חודשי: <span class="ltr">{{ formatShekels(c.payment) }}</span></p>
        <p class="mt-2 text-caption text-n600">יחס ההחזר</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ pct(c.ratio) }}</span></p>
        <p class="text-caption text-n600">הלוואה מרבית בתקרה: <span class="ltr">{{ formatShekelsText(c.most) }}</span></p>
        <p class="mt-2 text-body-m text-n800" role="status">
          <template v-if="c.over">מעל התקרה. כדי להישאר בתוכה, ההלוואה צריכה להיות קטנה ב־<span class="ltr">{{ formatShekelsText(c.loan - c.most.toNumber()) }}</span>, כלומר עוד הון עצמי.</template>
          <template v-else>בתוך התקרה.</template>
        </p>
      </div>
    </div>

    <p class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800">
      <template v-if="changed">כאן רואים רק מה השתנה במספרים. מה הבנק יעשה — להמשיך כרגיל, לבקש עוד מסמכים, לשנות את התנאים או לבטל — זו החלטה שלו, ואין לנו מקור שאומר מה מביא אותו לכל אחת מהן.</template>
      <template v-else>הזיזו אחד המחוונים. כשהמאומת שווה למוצהר, שתי המסגרות זהות, ואין על מה להתווכח.</template>
    </p>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-n50 ring-1 ring-n200"></span>בתוך התקרה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-warning-bg ring-1 ring-warning"></span>מעל התקרה</li>
    </ul>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[22rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 text-start font-semibold"></th>
            <th v-for="c in columns" :key="c.key" class="py-1 text-start font-semibold">{{ c.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הכנסת אבי</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.avi) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הכנסת שניהם</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.income) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הון עצמי</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.equity) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">הלוואה</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.loan) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">החזר חודשי</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.payment) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">יחס ההחזר</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ pct(c.ratio) }}</span></td></tr>
          <tr><th class="py-1 text-start font-normal text-n600">הלוואה מרבית (<span class="ltr">{{ cap.value }}%</span>)</th><td v-for="c in columns" :key="c.key" class="py-1"><span class="ltr">{{ formatShekels(c.most) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
