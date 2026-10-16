<script setup lang="ts">
// The refinance calculator (lessons 7.4 and 7.5). An existing loan, a new offer, and three different questions
// the learner is taught to keep apart:
//   1. the regulator's test (Directive 451 §15א, as the team transcribed it): for each track and for the whole
//      loan, the expected total rate (the fee left out) and the rate for comparison purposes (the fee added to
//      what is owed), and the new loan's expected total rate beside them;
//   2. the payment: is the monthly payment lower?
//   3. the shekels: are fewer shekels paid in all? and when does it pay for itself?
// A lower payment is not a total saving: the three can point three ways, and the screen shows all three at once.
// The learner moves the new rate, the new term, the new loan's up-front costs, whether the exit fee is added to the
// new loan, the exit fee of each track, and (in a loan of several tracks) which tracks are refinanced.
// Every number comes from src/lib/calc/refinance.ts (on metrics.ts and offers.ts); the page passes the presets.
// The early-repayment fee is an INPUT here: lesson 7.2 is where it is computed.
import Decimal from "decimal.js";
import { computed, ref, watch } from "vue";
import BidiText from "./BidiText.vue";
import { REFINANCE_FORECAST } from "../data/refinance-examples.ts";
import { formatShekels, formatShekelsText } from "../lib/calc/money.ts";
import {
  existingLoan,
  fixedOffer,
  monthsAtPayment,
  newLoanOf,
  refinanceTest,
  stayStream,
  switchStream,
  switchSummary,
  trajectory,
} from "../lib/calc/refinance.ts";
import type { Track } from "../lib/calc/metrics.ts";

interface PresetTrack {
  name: string;
  track: Track;
  paymentsMade: number;
  fee: string;
  note: string;
}
interface Preset {
  id: string;
  label: string;
  tracks: PresetTrack[];
  shared: string;
  rate: string;
  months: number;
  upfront: string;
  source: string;
}
const props = withDefaults(defineProps<{ presets: Preset[]; initial?: string; note: string }>(), { initial: undefined });

const presetId = ref(props.initial ?? props.presets[0].id);
const preset = computed(() => props.presets.find((p) => p.id === presetId.value) ?? props.presets[0]);

const rate = ref(Number(preset.value.rate));
const months = ref(preset.value.months);
const upfront = ref(Number(preset.value.upfront));
const financeFee = ref(true);
const fees = ref(preset.value.tracks.map((t) => Number(t.fee)));
const selected = ref(preset.value.tracks.map(() => true));
const horizon = ref(60);
const showTable = ref(false);

watch(presetId, () => {
  const p = preset.value;
  rate.value = Number(p.rate);
  months.value = p.months;
  upfront.value = Number(p.upfront);
  fees.value = p.tracks.map((t) => Number(t.fee));
  selected.value = p.tracks.map(() => true);
  financeFee.value = true;
});

// ── The existing loan, as it stands. ──
const loanAll = computed(() =>
  existingLoan(
    preset.value.tracks.map((t, i) => ({ track: t.track, paymentsMade: t.paymentsMade, fee: fees.value[i] })),
    preset.value.shared,
  ),
);
const chosen = computed(() => preset.value.tracks.map((_, i) => i).filter((i) => selected.value[i]));
const loanChosen = computed(() =>
  chosen.value.length === 0
    ? null
    : existingLoan(
        chosen.value.map((i) => ({ track: preset.value.tracks[i].track, paymentsMade: preset.value.tracks[i].paymentsMade, fee: fees.value[i] })),
        preset.value.shared,
      ),
);
const longestLeft = computed(() => Math.max(...(loanChosen.value ?? loanAll.value).tracks.map((t) => t.months)));
const feeMax = (t: PresetTrack) => Math.max(2000, Math.ceil((Number(t.fee) * 1.5) / 1000) * 1000);

// ── The new loan: it lends what it takes to be free of the old one (P, and the fee too when the fee is added to the loan). ──
const amount = computed(() => (loanChosen.value ? (financeFee.value ? loanChosen.value.whole.financed : loanChosen.value.whole.balance) : new Decimal(0)));
const cashNow = computed(() => new Decimal(upfront.value).plus(loanChosen.value && !financeFee.value ? loanChosen.value.whole.fee : 0));
const next = computed(() => {
  if (!loanChosen.value) return null;
  const offer = fixedOffer({ name: "ההצעה החדשה", amount: amount.value, months: months.value, rate: rate.value, upfront: upfront.value }, REFINANCE_FORECAST);
  return newLoanOf(offer, REFINANCE_FORECAST);
});

const test = computed(() => (loanChosen.value && next.value ? refinanceTest(loanChosen.value.whole.comparisonRate, next.value.expectedTotalRate) : null));
const rowTests = computed(() => loanAll.value.tracks.map((t) => (next.value ? refinanceTest(t.comparisonRate, next.value.expectedTotalRate) : null)));

const summary = computed(() => {
  if (!loanChosen.value || !next.value) return null;
  const w = loanChosen.value.whole;
  return switchSummary(stayStream(w.balance, w.payments, loanChosen.value.balances), switchStream(next.value), cashNow.value, w.irrWith);
});
const path = computed(() => {
  if (!loanChosen.value || !next.value) return [];
  const w = loanChosen.value.whole;
  return trajectory(stayStream(w.balance, w.payments, loanChosen.value.balances), switchStream(next.value), cashNow.value);
});
// One card per track (and the whole loan) for the phone: the verdict first.
const testCards = computed(() => {
  if (!loanChosen.value || !test.value) return [];
  const out: { name: string; cmp: Decimal; exp: Decimal; test: NonNullable<typeof test.value>; whole: boolean }[] = [];
  if (preset.value.tracks.length > 1) {
    preset.value.tracks.forEach((t, i) => {
      const rt = rowTests.value[i];
      if (rt) out.push({ name: t.name, cmp: loanAll.value.tracks[i].comparisonRate, exp: loanAll.value.tracks[i].expectedTotalRate, test: rt, whole: false });
    });
  }
  const w = loanChosen.value.whole;
  const name = preset.value.tracks.length > 1 ? `ההלוואה כולה${chosen.value.length < preset.value.tracks.length ? " (רק המסלולים שנבחרו)" : ""}` : preset.value.tracks[0].name;
  out.push({ name, cmp: w.comparisonRate, exp: w.expectedTotalRate, test: test.value, whole: true });
  return out;
});
const kept = computed(() => {
  if (!loanChosen.value || !next.value) return null;
  try {
    return monthsAtPayment(amount.value, rate.value, loanChosen.value.whole.first);
  } catch {
    return null;
  }
});

watch(path, (p) => {
  if (horizon.value > p.length - 1) horizon.value = Math.max(1, p.length - 1);
});
const at = computed(() => path.value[Math.min(horizon.value, path.value.length - 1)]);

// ── Display helpers. ──
const pct = (d: Decimal) => `${d.toDecimalPlaces(2).toFixed()}%`;
const pctSigned = (d: Decimal) => (d.isNegative() ? `−${d.abs().toDecimalPlaces(2).toFixed()}` : d.toDecimalPlaces(2).toFixed());
const money = (d: Decimal) => formatShekelsText(d);
const moneyAbs = (d: Decimal) => formatShekelsText(d.abs());
// "נקודת אחוז" is singular up to one, plural above it.
const pointsWord = (d: Decimal) => (d.abs().toDecimalPlaces(2).lte(1) ? "נקודת אחוז" : "נקודות אחוז");
const monthsText = (m: number | null) => (m === null ? null : m % 12 === 0 ? `${m} חודשים (${m / 12} שנים)` : `${m} חודשים`);

// ── The chart. Time runs from the right (the day of the switch) to the left, as Hebrew is read. ──
const W = 640;
const H = 220;
const PAD = 8;
const span = computed(() => Math.max(path.value.length - 1, 1));
const lo = computed(() => Math.min(0, ...path.value.map((p) => Math.min(p.cash.toNumber(), p.position.toNumber()))));
const hi = computed(() => Math.max(0, ...path.value.map((p) => Math.max(p.cash.toNumber(), p.position.toNumber()))));
const xAt = (k: number) => W - PAD - (k / span.value) * (W - PAD * 2);
const yAt = (v: number) => H - PAD - ((v - lo.value) / Math.max(hi.value - lo.value, 1)) * (H - PAD * 2);
const line = (pick: (p: (typeof path.value)[number]) => Decimal) => path.value.map((p) => `${xAt(p.month)},${yAt(pick(p).toNumber())}`).join(" ");
const tickYears = computed(() => {
  const years = Math.floor(span.value / 12);
  const step = years <= 10 ? 1 : years <= 25 ? 5 : 10;
  return Array.from({ length: Math.floor(years / step) + 1 }, (_, i) => i * step);
});
const yearRows = computed(() => path.value.filter((p) => p.month > 0 && (p.month % 12 === 0 || p.month === span.value)));
const chartLabel = computed(() => (summary.value ? `המצב שלכם לאורך הזמן, בשקלים: קו אחד לחיסכון בתשלומים בלבד, וקו שני לחיסכון בתשלומים ובהפרש החוב. אחרי ${horizon.value} חודשים: ${money(at.value.position)}. הנתונים בטבלה למטה.` : ""));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600"><BidiText :text="note" /></p>

    <div v-if="presets.length > 1" class="mt-3 flex flex-wrap gap-2" role="group" aria-label="איזו הלוואה קיימת">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        class="min-h-11 rounded-md border px-3 text-body-m"
        :class="presetId === p.id ? 'border-navy bg-n100 font-semibold text-navy' : 'border-n200 text-n700 hover:bg-n50'"
        :aria-pressed="presetId === p.id"
        @click="presetId = p.id"
      >
        {{ p.label }}
      </button>
    </div>
    <p class="mt-2 text-caption text-n600"><BidiText :text="preset.source" /></p>

    <!-- The old loan, track by track. -->
    <h3 class="mt-4 text-body-l font-semibold text-n900">ההלוואה הקיימת</h3>
    <ul class="list-reset mt-2 grid gap-3 sm:grid-cols-2">
      <li v-for="(t, i) in preset.tracks" :key="t.name + i" class="rounded-md border border-n200 p-3">
        <label v-if="preset.tracks.length > 1" class="flex min-h-11 cursor-pointer items-start gap-2">
          <input v-model="selected[i]" type="checkbox" class="mt-1 h-5 w-5 accent-teal-deep" :aria-label="`ממחזרים את המסלול: ${t.name}`" />
          <span class="text-body-m font-semibold text-n900">ממחזרים: <BidiText :text="t.name" /></span>
        </label>
        <p v-else class="text-body-m font-semibold text-n900"><BidiText :text="t.name" /></p>
        <p class="text-caption text-n600"><BidiText :text="t.note" /></p>
        <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
          <dt>יתרה היום</dt><dd class="text-end"><span class="ltr">{{ formatShekels(loanAll.tracks[i].balance) }}</span></dd>
          <dt>תשלומים שנשארו</dt><dd class="text-end"><span class="ltr">{{ loanAll.tracks[i].months }}</span></dd>
          <dt>ההחזר החודשי הבא</dt><dd class="text-end"><span class="ltr">{{ formatShekels(loanAll.tracks[i].first) }}</span></dd>
        </dl>
        <label class="mt-2 flex flex-col">
          <span class="text-caption font-semibold text-n600">עמלת פירעון מוקדם של המסלול (קלט; בשיעור 7.2 מחשבים אותה)</span>
          <input v-model.number="fees[i]" type="range" min="0" :max="feeMax(t)" step="100" :disabled="Number(t.fee) === 0" :aria-label="`עמלת פירעון מוקדם: ${t.name}`" />
          <span class="text-body-m font-semibold text-n900"><span class="ltr">{{ formatShekelsText(fees[i]) }}</span></span>
        </label>
      </li>
    </ul>
    <p class="mt-2 text-caption text-n600">עמלה תפעולית של <span class="ltr">{{ formatShekelsText(preset.shared) }}</span> נגבית פעם אחת על הפירעון, לא לכל מסלול: בקורס היא נכנסת רק לנתון של ההלוואה כולה (הנחת חישוב).</p>

    <!-- The new loan. -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">ההצעה החדשה (בדויה)</h3>
    <div class="mt-2 grid gap-x-4 gap-y-3 sm:grid-cols-3">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">אחוז הריבית לשנה</span>
        <input v-model.number="rate" type="range" min="3" max="7.5" step="0.1" aria-label="אחוז הריבית של ההצעה החדשה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate }}%</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">תקופה</span>
        <input v-model.number="months" type="range" min="60" max="360" step="1" aria-label="תקופת ההלוואה החדשה בחודשים" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ months }}</span> חודשים ({{ (months / 12).toFixed(1).replace(/\.0$/, "") }} שנים)</span>
        <span class="mt-1 flex flex-wrap gap-2">
          <button type="button" class="min-h-11 rounded-md border border-n200 px-3 text-body-m text-n700 hover:bg-n50" @click="months = longestLeft">כמו מה שנשאר: <span class="ltr">{{ longestLeft }}</span></button>
          <button type="button" class="min-h-11 rounded-md border border-n200 px-3 text-body-m text-n700 hover:bg-n50" @click="months = 300">25 שנה</button>
        </span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">עלויות כניסה של ההלוואה החדשה (בדויות)</span>
        <input v-model.number="upfront" type="range" min="0" max="6000" step="100" aria-label="עלויות הכניסה של ההלוואה החדשה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekelsText(upfront) }}</span></span>
      </label>
      <label class="flex min-h-11 cursor-pointer items-start gap-2 sm:col-span-3">
        <input v-model="financeFee" type="checkbox" class="mt-1 h-5 w-5 accent-teal-deep" />
        <span class="text-body-m text-n800">העמלה מתווספת להלוואה החדשה (הנחת חישוב). אם לא, משלמים אותה מהכיס ביום הראשון.</span>
      </label>
    </div>

    <p v-if="!loanChosen || !next || !summary || !test" class="mt-4 rounded-md border border-n200 bg-n50 p-3 text-body-m text-n800" role="status">בחרו לפחות מסלול אחד למחזר.</p>

    <template v-else>
      <!-- The three answers, side by side, and sticky on a phone while a slider moves. -->
      <div class="sticky bottom-2 z-10 mt-4 rounded-md border border-n200 bg-n50 p-3 text-body-m text-n800 shadow-md sm:static sm:shadow-none" role="status">
        <p>
          <strong>ההחזר החודשי:</strong>
          היום <span class="ltr whitespace-nowrap">{{ formatShekelsText(loanChosen.whole.first) }}</span>,
          בהצעה <span class="ltr whitespace-nowrap">{{ formatShekelsText(next.first) }}</span>
          ({{ summary.monthlyGap.gte(0) ? "נמוך" : "גבוה" }} ב־<span class="ltr whitespace-nowrap font-semibold">{{ moneyAbs(summary.monthlyGap) }}</span>)
        </p>
        <p>
          <strong>מבחן §15א:</strong>
          <span :class="test.worthwhile ? 'bg-success-bg' : 'bg-warning-bg'" class="rounded-pill px-2 text-n900">{{ test.worthwhile ? "עובר" : "לא עובר" }}</span>
          (<span class="ltr">{{ pct(next.expectedTotalRate) }}</span> מול <span class="ltr">{{ pct(loanChosen.whole.comparisonRate) }}</span>)
        </p>
        <p>
          <strong>סך התשלומים:</strong>
          {{ summary.totalSaving.gte(0) ? "פחות" : "יותר" }} ב־<span class="ltr font-semibold">{{ moneyAbs(summary.totalSaving) }}</span>
          <span class="text-n600">(כולל עלויות הכניסה)</span>
        </p>
      </div>

      <!-- 1. The regulator's test. -->
      <h3 class="mt-5 text-body-l font-semibold text-n900">1. המבחן של הרגולטור, לכל מסלול ולהלוואה כולה</h3>
      <p class="mt-1 text-caption text-n600">ריבית אפקטיבית לשנה, על התשלומים שנשארו. ״כולל עמלה״: העמלה מתווספת לחוב שמסלקים. ההצעה החדשה: <span class="ltr font-semibold">{{ pct(next.expectedTotalRate) }}</span> (הריבית הכוללת החזויה שלה, כולל עלויות הכניסה).</p>
      <ul class="list-reset mt-2 space-y-2 sm:hidden" aria-label="המבחן לכל מסלול">
        <li v-for="r in testCards" :key="r.name" class="rounded-md border border-n200 p-3" :class="r.whole && preset.tracks.length > 1 ? 'bg-n50' : ''">
          <p class="flex flex-wrap items-center gap-2 text-body-m font-semibold text-n900">
            <span class="rounded-pill px-2 py-0.5 text-caption" :class="r.test.worthwhile ? 'bg-success-bg' : 'bg-warning-bg'">{{ r.test.worthwhile ? "ההצעה זולה יותר" : "ההצעה לא זולה יותר" }}</span>
            <span class="text-caption font-normal text-n600">(<span class="ltr">{{ pctSigned(r.test.margin) }}</span> {{ pointsWord(r.test.margin) }})</span>
          </p>
          <p class="mt-1 text-body-m text-n900"><BidiText :text="r.name" /></p>
          <dl class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700">
            <dt>ריבית לצרכי השוואה (כולל עמלה)</dt><dd class="text-end font-semibold text-n900"><span class="ltr">{{ pct(r.cmp) }}</span></dd>
            <dt>ריבית כוללת חזויה (בלי עמלה)</dt><dd class="text-end"><span class="ltr">{{ pct(r.exp) }}</span></dd>
          </dl>
        </li>
      </ul>
      <div class="mt-2 hidden overflow-x-auto sm:block" tabindex="0" role="region" aria-label="טבלת המבחן לכל מסלול">
        <table class="w-full min-w-[30rem] border-collapse text-body-m">
          <thead>
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-2 pe-3 text-start font-semibold">מסלול</th>
              <th class="py-2 pe-3 text-start font-semibold">ריבית לצרכי השוואה (כולל עמלה)</th>
              <th class="py-2 pe-3 text-start font-semibold">ריבית כוללת חזויה (בלי עמלה)</th>
              <th class="py-2 pe-3 text-start font-semibold">מול ההצעה החדשה</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="preset.tracks.length > 1">
              <tr v-for="(t, i) in preset.tracks" :key="t.name + i" class="border-b border-n100">
                <td class="py-2 pe-3 text-n800"><BidiText :text="t.name" /></td>
                <td class="py-2 pe-3 font-semibold text-n900"><span class="ltr">{{ pct(loanAll.tracks[i].comparisonRate) }}</span></td>
                <td class="py-2 pe-3"><span class="ltr">{{ pct(loanAll.tracks[i].expectedTotalRate) }}</span></td>
                <td class="py-2 pe-3">
                  <span v-if="rowTests[i]" class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="rowTests[i]?.worthwhile ? 'bg-success-bg' : 'bg-warning-bg'">
                    {{ rowTests[i]?.worthwhile ? "ההצעה זולה יותר" : "ההצעה לא זולה יותר" }}
                  </span>
                  <span class="ms-1 text-caption text-n600">(<span class="ltr">{{ pctSigned(rowTests[i]?.margin ?? new Decimal(0)) }}</span> {{ pointsWord(rowTests[i]?.margin ?? new Decimal(0)) }})</span>
                </td>
              </tr>
            </template>
            <tr class="border-b border-n100" :class="preset.tracks.length > 1 ? 'bg-n50' : ''">
              <td class="py-2 pe-3 font-semibold text-n900">
                <template v-if="preset.tracks.length > 1">ההלוואה כולה{{ chosen.length < preset.tracks.length ? " (רק המסלולים שנבחרו)" : "" }}</template>
                <BidiText v-else :text="preset.tracks[0].name" />
              </td>
              <td class="py-2 pe-3 font-semibold text-n900"><span class="ltr">{{ pct(loanChosen.whole.comparisonRate) }}</span></td>
              <td class="py-2 pe-3"><span class="ltr">{{ pct(loanChosen.whole.expectedTotalRate) }}</span></td>
              <td class="py-2 pe-3">
                <span class="rounded-pill px-2 py-0.5 text-caption text-n900" :class="test.worthwhile ? 'bg-success-bg' : 'bg-warning-bg'">{{ test.worthwhile ? "ההצעה זולה יותר" : "ההצעה לא זולה יותר" }}</span>
                <span class="ms-1 text-caption text-n600">(<span class="ltr">{{ pctSigned(test.margin) }}</span> {{ pointsWord(test.margin) }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-1 text-caption text-n600">הנחה: כל שורה נבדקת מול אותה הצעה חדשה, בריבית ובתקופה שבמחוונים. מה שבשורות הוא ההפרש בנקודות אחוז: חיובי פירושו שהצעה חדשה זולה יותר.</p>

      <!-- 2 and 3. Payment and shekels. -->
      <h3 class="mt-5 text-body-l font-semibold text-n900">2. ההחזר החודשי, וסך השקלים</h3>
      <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-md border border-n200 p-3 text-body-m text-n700">
        <dt>נשארו להלוואה הקיימת</dt><dd class="text-end"><span class="ltr">{{ loanChosen.whole.months }}</span> חודשים</dd>
        <dt>ההלוואה החדשה נגמרת אחרי</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ next.months }}</span> חודשים</dd>
        <dt>סכום ההלוואה החדשה</dt><dd class="text-end"><span class="ltr">{{ formatShekels(next.loan) }}</span></dd>
        <dt>סך התשלומים אם נשארים</dt><dd class="text-end"><span class="ltr">{{ formatShekels(summary.stayTotal) }}</span></dd>
        <dt>סך התשלומים אם עוברים (כולל עלויות כניסה<template v-if="!financeFee"> והעמלה</template>)</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ formatShekels(summary.switchTotal) }}</span></dd>
        <dt v-if="kept !== null">אם ממשיכים לשלם את ההחזר של היום על ההלוואה החדשה: היא נגמרת אחרי</dt>
        <dd v-if="kept !== null" class="text-end"><span class="ltr font-semibold text-n900">{{ kept }}</span> חודשים</dd>
      </dl>

      <!-- 3. When it pays for itself. -->
      <h3 class="mt-5 text-body-l font-semibold text-n900">3. מתי זה מחזיר את עצמו</h3>
      <ul class="list-reset mt-2 space-y-1 text-body-m text-n800">
        <li>
          החיסכון בתשלומים מכסה את מה ששילמתם ביום הראשון:
          <strong v-if="summary.cashBreakEven !== null">אחרי {{ monthsText(summary.cashBreakEven) }}</strong><strong v-else>אף פעם</strong>.
        </li>
        <li>
          גם ההפרש בחוב נכנס לחשבון (המצב שלכם לא שלילי):
          <strong v-if="summary.positionBreakEven !== null">אחרי {{ monthsText(summary.positionBreakEven) }}</strong><strong v-else>אף פעם</strong>.
        </li>
        <li>
          בשקלים של היום, בריבית לצרכי השוואה: <strong v-if="summary.presentValueSaving"><span class="ltr">{{ money(summary.presentValueSaving) }}</span> {{ summary.presentValueSaving.gte(0) ? "חיסכון" : "הפסד" }}</strong>.
        </li>
      </ul>

      <label class="mt-3 flex flex-col">
        <span class="text-caption font-semibold text-n600">אם הייתם סוגרים את שתי ההלוואות אחרי</span>
        <input v-model.number="horizon" type="range" min="1" :max="Math.max(path.length - 1, 1)" step="1" aria-label="אחרי כמה חודשים" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ horizon }}</span> חודשים</span>
      </label>
      <dl v-if="at" class="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m text-n700" aria-live="polite">
        <dt>חיסכון בתשלומים, פחות מה ששולם ביום הראשון</dt><dd class="text-end"><span class="ltr">{{ money(at.cash) }}</span></dd>
        <dt>החוב על הישנה פחות החוב על החדשה</dt><dd class="text-end"><span class="ltr">{{ money(at.balanceGap) }}</span></dd>
        <dt>המצב שלכם (שניהם יחד)</dt><dd class="text-end"><span class="ltr font-semibold text-n900">{{ money(at.position) }}</span></dd>
      </dl>
      <p class="mt-1 text-caption text-n600">בלי עמלה על סגירת ההלוואה החדשה: עמלת יציאה עתידית אינה ידועה היום.</p>

      <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-1 text-caption text-n700" aria-label="מקרא">
        <li class="flex items-center gap-2"><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-turquoise-2)" stroke-width="3" stroke-dasharray="5 3" /></svg>חיסכון בתשלומים בלבד</li>
        <li class="flex items-center gap-2"><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-teal-deep)" stroke-width="3" /></svg>המצב שלכם (תשלומים והפרש חוב)</li>
        <li class="flex items-center gap-2"><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="var(--mogi-navy)" stroke-width="1.5" /></svg>אפס</li>
      </ul>
      <svg :viewBox="`0 0 ${W} ${H}`" class="mt-2 w-full" role="img" :aria-label="chartLabel">
        <line :x1="PAD" :x2="W - PAD" :y1="yAt(0)" :y2="yAt(0)" stroke="var(--mogi-navy)" stroke-width="1.5" />
        <polyline :points="line((p) => p.cash)" fill="none" stroke="var(--mogi-turquoise-2)" stroke-width="3" stroke-dasharray="8 5" stroke-linejoin="round" />
        <polyline :points="line((p) => p.position)" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" stroke-linejoin="round" />
        <line :x1="xAt(horizon)" :x2="xAt(horizon)" :y1="0" :y2="H" stroke="var(--mogi-navy)" stroke-width="1.5" stroke-dasharray="4 3" />
      </svg>
      <div class="relative h-5 text-caption text-n600" aria-hidden="true">
        <span v-for="t in tickYears" :key="t" class="absolute -translate-x-1/2" :style="{ left: `${(xAt(t * 12) / W) * 100}%` }">{{ t }}</span>
      </div>
      <p class="text-center text-caption text-n600">שנים מהיום שעוברים, מימין לשמאל. גובה מלא: מ־<span class="ltr">{{ money(new Decimal(lo)) }}</span> עד <span class="ltr">{{ money(new Decimal(hi)) }}</span>.</p>

      <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
        {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
      </button>
      <div v-if="showTable" class="mt-2 max-h-80 overflow-auto" tabindex="0" role="region" aria-label="טבלת המצב לאורך הזמן">
        <table class="w-full min-w-[30rem] border-collapse text-body-m">
          <thead class="sticky top-0 bg-n0">
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-2 pe-3 text-start font-semibold">אחרי חודשים</th>
              <th class="py-2 pe-3 text-start font-semibold">המצב שלכם</th>
              <th class="py-2 pe-3 text-start font-semibold">חיסכון בתשלומים בלבד</th>
              <th class="py-2 pe-3 text-start font-semibold">הפרש החוב</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in yearRows" :key="p.month" class="border-b border-n100">
              <td class="py-1 pe-3"><span class="ltr">{{ p.month }}</span></td>
              <td class="py-1 pe-3 font-semibold text-n900"><span class="ltr">{{ money(p.position) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ money(p.cash) }}</span></td>
              <td class="py-1 pe-3"><span class="ltr">{{ money(p.balanceGap) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style>
/* The sticky result box covers the bottom of the screen on a phone: a focused control is scrolled above it. */
@media (max-width: 639px) {
  html {
    scroll-padding-bottom: 9rem;
  }
}
</style>
