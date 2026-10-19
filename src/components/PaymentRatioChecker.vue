<script setup lang="ts">
// בודק יחס החזר — the payment-to-income checker (lesson 4.3; its first half,
// disposable income, already in 4.2; again in 6.2). The learner sets the
// recognised incomes, each obligation's payment and the payments left on it,
// and — in "ratio" mode — the new loan and its structure. The checker shows
// where each obligation goes (off the income, onto the payment, or nowhere)
// and why, the disposable income, the payment the ratio uses, and the ratio.
// All arithmetic is affordability.ts; nothing is computed here by hand.
import Decimal from "decimal.js";
import { computed, reactive, ref } from "vue";
import {
  addedToPayment,
  classifyObligation,
  deductedObligations,
  type MortgagePosition,
  type Obligation,
  type ObligationKind,
  type ObligationReason,
  paymentToIncome,
  qualifyingPayment,
} from "../lib/calc/affordability.ts";
import { monthlyTotal } from "../lib/calc/household.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";

interface IncomeIn {
  label: string;
  amount: number;
}
interface ObligationIn {
  label: string;
  kind: ObligationKind;
  monthly: number;
  monthsLeft: number | null;
  rentContinues?: boolean;
  mortgage?: MortgagePosition;
}
interface TrackIn {
  label: string;
  amount: number;
  rate: number;
}
interface LoanIn {
  /** One or more tracks; they share the term and the structure. */
  tracks: TrackIn[];
  years: number;
  structure?: "regular" | "grace" | "bullet";
  graceMonths?: number;
}
interface Mark {
  at: number;
  label: string;
}
const props = withDefaults(
  defineProps<{
    mode?: "disposable" | "ratio";
    incomes: IncomeIn[];
    obligations: ObligationIn[];
    loan?: LoanIn;
    /** Reference lines on the ratio bar (percent), for lessons that have taught them. None by default. */
    marks?: Mark[];
  }>(),
  { mode: "ratio", loan: () => ({ tracks: [{ label: "הלוואה", amount: 1000000, rate: 4.5 }], years: 25, structure: "regular", graceMonths: 12 }), marks: () => [] },
);

const incomes = reactive(props.incomes.map((i) => ({ ...i })));
const obligations = reactive(
  props.obligations.map((o) => ({ ...o, unknown: o.monthsLeft === null, months: o.monthsLeft ?? 24 })),
);
const loan = reactive({ structure: "regular", graceMonths: 12, ...props.loan, tracks: props.loan.tracks.map((t) => ({ ...t })) });
const showTable = ref(false);

const asObligation = (o: (typeof obligations)[number]): Obligation => ({
  kind: o.kind,
  monthly: String(o.monthly || 0),
  monthsLeft: o.unknown ? null : o.months,
  rentContinues: o.rentContinues,
  mortgage: o.mortgage,
});
const list = computed(() => obligations.map(asObligation));
const verdicts = computed(() => list.value.map(classifyObligation));

const recognised = computed(() => monthlyTotal(incomes.map((i) => String(i.amount || 0))));
const deducted = computed(() => deductedObligations(list.value));
const disposable = computed(() => recognised.value.minus(deducted.value));
const newPayment = computed(() => {
  const months = loan.years * 12;
  const grace = loan.structure === "grace" ? Math.min(loan.graceMonths, months - 1) : 0;
  // Each track's payment is rounded to the agora, then added (as the course's tables do).
  return loan.tracks.reduce(
    (sum, t) =>
      sum.plus(
        qualifyingPayment({
          amount: String(t.amount),
          ratePercent: String(t.rate),
          months,
          graceMonths: grace,
          bullet: loan.structure === "bullet",
        }).toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      ),
    new Decimal(0),
  );
});
const added = computed(() => addedToPayment(list.value));
const payment = computed(() => newPayment.value.plus(added.value));
const ratio = computed(() => (disposable.value.gt(0) ? paymentToIncome(payment.value, disposable.value) : null));
const barWidth = computed(() => (ratio.value === null ? 100 : Math.min(100, ratio.value.toNumber())));

const reasonText: Record<ObligationReason, string> = {
  over_months: "נשארו יותר מ־18 תשלומים: יורדת מההכנסה",
  within_months: "נשארו 18 תשלומים או פחות: לא נספרת",
  no_end_date: "אין תאריך סיום: נספרת, ומסומנת לבדיקה",
  rent_continues: "שכר דירה שימשיך אחרי הקנייה: נספר, בלי קשר למשך",
  rent_ends: "שכר דירה שייגמר כשיעברו לדירה: לא נספר",
  repaid: "משכנתא שנפרעת בעסקה: לא נספרת",
  same_property: "משכנתא על אותו נכס: מתווספת לתשלום",
};
const placeText = { income: "יורדת מההכנסה", payment: "מתווספת לתשלום", none: "לא נספרת" } as const;
const placeClass = { income: "bg-n100 text-n900", payment: "bg-mint text-n900", none: "bg-n0 text-n600 border border-n200" } as const;
// A negative amount is written with the course's real minus, not the hyphen of Intl.
const sh = (v: Decimal | number | string) => formatShekels(String(v)).replace("-", "−");
const kindLabel: Record<ObligationKind, string> = { loan: "הלוואה", leasing: "ליסינג", alimony: "מזונות", rent: "שכר דירה", mortgage: "משכנתא קיימת", other: "אחר" };
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <!-- 1. Recognised incomes -->
    <h3 class="text-body-l font-semibold text-n900">1. ההכנסה המוכרת, בחודש</h3>
    <div class="mt-2 grid gap-3 sm:grid-cols-2">
      <label v-for="(inc, i) in incomes" :key="i" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">{{ inc.label }}: <span class="ltr font-semibold">{{ formatWholeShekels(inc.amount) }}</span></span>
        <input v-model.number="inc.amount" type="range" min="0" max="40000" step="100" :aria-label="`ההכנסה המוכרת של ${inc.label}`" />
      </label>
    </div>

    <!-- 2. Obligations -->
    <h3 class="mt-5 text-body-l font-semibold text-n900">2. ההתחייבויות</h3>
    <ul class="list-reset mt-2 grid gap-3">
      <li v-for="(o, i) in obligations" :key="i" class="rounded-md border border-n200 p-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-body-m font-semibold text-n900">{{ o.label }} <span class="font-normal text-n600">({{ kindLabel[o.kind] }})</span></p>
          <span v-if="!Number(o.monthly)" class="rounded-pill border border-n200 px-3 py-1 text-caption font-semibold text-n600">ריקה: אין תשלום</span>
          <span v-else class="rounded-pill px-3 py-1 text-caption font-semibold" :class="placeClass[verdicts[i].placement]">{{ placeText[verdicts[i].placement] }}</span>
        </div>
        <div class="mt-2 grid gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1">
            <span class="text-body-m text-n800">תשלום חודשי: <span class="ltr font-semibold">{{ formatWholeShekels(o.monthly) }}</span></span>
            <input v-model.number="o.monthly" type="range" min="0" max="8000" step="50" :aria-label="`התשלום החודשי: ${o.label}`" />
          </label>
          <label v-if="o.kind !== 'rent'" class="flex flex-col gap-1">
            <span class="text-body-m text-n800">
              נשארו תשלומים:
              <span class="font-semibold">{{ o.unknown ? "לא ידוע" : o.months }}</span>
            </span>
            <input v-model.number="o.months" type="range" min="0" max="240" step="1" :disabled="o.unknown" :aria-label="`כמה תשלומים נשארו: ${o.label}`" />
          </label>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-body-m text-n800">
          <label v-if="o.kind !== 'rent'" class="flex min-h-11 items-center gap-2">
            <input v-model="o.unknown" type="checkbox" class="h-5 w-5" :aria-label="`אין תאריך סיום: ${o.label}`" />
            אין תאריך סיום
          </label>
          <label v-if="o.kind === 'rent'" class="flex min-h-11 items-center gap-2">
            <input v-model="o.rentContinues" type="checkbox" class="h-5 w-5" :aria-label="`ימשיכו לשלם אחרי הקנייה: ${o.label}`" />
            ימשיכו לשלם אחרי הקנייה (לא יגורו בדירה שקונים)
          </label>
          <label v-if="o.kind === 'mortgage'" class="flex min-h-11 items-center gap-2">
            <span>אחרי העסקה:</span>
            <select v-model="o.mortgage" class="min-h-11 rounded-md border border-n300 bg-n0 px-2 text-body-m text-n900" :aria-label="`מה קורה למשכנתא: ${o.label}`">
              <option value="repaid">נפרעת בעסקה</option>
              <option value="same_property">נשארת על אותו נכס (או נגררת אליו)</option>
              <option value="other_property">נשארת על נכס אחר</option>
            </select>
          </label>
        </div>
        <p class="mt-1 text-caption text-n600">
          {{ reasonText[verdicts[i].reason] }}
          <span v-if="o.kind !== 'rent' && !o.unknown && o.months === 18"> — ב־18 בדיוק היא לא נספרת: הנוסח הרשמי של הוראה 329 מדבר על יתרה שעולה על 18 חודשים.</span>
        </p>
      </li>
    </ul>

    <!-- 3. The new loan (ratio mode) -->
    <template v-if="mode === 'ratio'">
      <h3 class="mt-5 text-body-l font-semibold text-n900">3. ההלוואה החדשה</h3>
      <div v-for="(t, k) in loan.tracks" :key="k" class="mt-2 grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1">
          <span class="text-body-m text-n800">{{ t.label }} · סכום: <span class="ltr font-semibold">{{ formatWholeShekels(t.amount) }}</span></span>
          <input v-model.number="t.amount" type="range" min="0" max="2500000" step="5000" :aria-label="`סכום: ${t.label}`" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-body-m text-n800">{{ t.label }} · אחוז ריבית לשנה: <span class="ltr font-semibold">{{ t.rate }}%</span></span>
          <input v-model.number="t.rate" type="range" min="1" max="9" step="0.05" :aria-label="`אחוז הריבית לשנה: ${t.label}`" />
        </label>
      </div>
      <label class="mt-3 flex flex-col gap-1">
        <span class="text-body-m text-n800">תקופה (לכל המסלולים): <span class="font-semibold">{{ loan.years }} שנים</span></span>
        <input v-model.number="loan.years" type="range" min="4" max="30" step="1" aria-label="תקופת ההלוואה בשנים" />
      </label>
      <div class="mt-3 inline-flex flex-wrap rounded-md border border-n200 p-1" role="group" aria-label="מבנה ההלוואה">
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="loan.structure === 'regular' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="loan.structure === 'regular'" @click="loan.structure = 'regular'">שפיצר רגיל</button>
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="loan.structure === 'grace' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="loan.structure === 'grace'" @click="loan.structure = 'grace'">עם {{ loan.graceMonths }} חודשי גרייס חלקי</button>
        <button type="button" class="min-h-11 rounded-sm px-3 text-body-m" :class="loan.structure === 'bullet' ? 'bg-navy text-n0' : 'text-n700 hover:bg-n50'" :aria-pressed="loan.structure === 'bullet'" @click="loan.structure = 'bullet'">בוליט</button>
      </div>
      <p class="mt-2 text-body-m text-n800">
        התשלום שנכנס לחישוב:
        <span class="ltr font-semibold">{{ sh(newPayment) }}</span>
        <span class="text-n600">
          — {{ loan.structure === "regular" ? "ההחזר הראשון על כל הסכום" : loan.structure === "grace" ? "התשלום אחרי הגרייס, לא בזמנו" : "הריבית החודשית, גם אם לא משלמים אותה כל חודש" }}
        </span>
      </p>
    </template>

    <!-- A compact result that follows the learner down the sliders (on a phone the full results are far below them). -->
    <div class="sticky bottom-0 z-sticky -mx-4 mt-4 border-t border-n200 bg-n0 px-4 py-2 text-body-m text-n900 shadow-md sm:-mx-5 sm:px-5" aria-hidden="true">
      <span class="text-caption text-n600">עכשיו:</span>
      <span class="font-semibold">הכנסה פנויה <span class="ltr">{{ sh(disposable) }}</span></span>
      <template v-if="mode === 'ratio'">
        <span class="text-n600"> · </span>
        <span class="font-semibold">יחס ההחזר <span v-if="ratio !== null" class="ltr">{{ percentString(ratio) }}%</span><span v-else>—</span></span>
      </template>
    </div>

    <!-- Results -->
    <div class="mt-5 grid gap-3" :class="mode === 'ratio' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'" role="status">
      <div class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">ההכנסה הפנויה</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ sh(disposable) }}</span></p>
        <p class="text-caption text-n600"><span class="ltr">{{ sh(recognised) }}</span> מוכרת, פחות <span class="ltr">{{ sh(deducted) }}</span> התחייבויות</p>
        <p v-if="disposable.lte(0)" class="text-caption font-semibold text-n800">ההתחייבויות גדולות מההכנסה, ולכן אין הכנסה פנויה.</p>
      </div>
      <div v-if="mode === 'ratio'" class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">התשלום ביחס ההחזר</p>
        <p class="text-h2 text-navy"><span class="ltr">{{ sh(payment) }}</span></p>
        <p class="text-caption text-n600">חדש <span class="ltr">{{ sh(newPayment) }}</span>, ועוד <span class="ltr">{{ sh(added) }}</span> על אותו נכס</p>
      </div>
      <div v-if="mode === 'ratio'" class="rounded-md bg-n50 p-3">
        <p class="text-caption text-n600">יחס ההחזר</p>
        <p class="text-h2 text-navy">
          <span v-if="ratio !== null" class="ltr">{{ percentString(ratio) }}%</span>
          <span v-else class="text-body-l">אין הכנסה פנויה</span>
        </p>
        <p class="text-caption text-n600">התשלום חלקי ההכנסה הפנויה, כפול 100</p>
      </div>
      <div v-if="mode === 'disposable'" class="rounded-md bg-n50 p-3 text-body-m text-n800">
        <p>ההתחייבויות שלא נספרות לא נעלמות: המשפחה עדיין משלמת אותן. הן רק לא יורדות בחישוב של הבנק.</p>
      </div>
    </div>

    <div v-if="mode === 'ratio'" class="mt-4">
      <div class="relative h-6 w-full overflow-hidden rounded-pill bg-n100" aria-hidden="true">
        <div class="absolute inset-y-0 start-0 rounded-pill bg-teal-deep" :style="{ width: `${barWidth}%` }"></div>
        <div v-for="m in marks" :key="m.at" class="absolute inset-y-0 border-s-2 border-dashed border-navy" :style="{ insetInlineStart: `${m.at}%` }"></div>
      </div>
      <div class="mt-1 flex justify-between text-caption text-n600" aria-hidden="true"><span>0%</span><span>100%</span></div>
      <ul class="list-reset mt-2 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
        <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-teal-deep"></span>החלק מההכנסה הפנויה שהולך לתשלום</li>
        <li v-for="m in marks" :key="m.label" class="flex items-center gap-2"><span class="inline-block h-3 w-0 border-s-2 border-dashed border-navy"></span>{{ m.label }}</li>
      </ul>
    </div>
    <p class="mt-2 text-caption text-n600">המחוונים מעגלים לשקל שלם; החישוב עצמו מדויק לאגורה.</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">התחייבות</th>
            <th class="py-2 pe-3 text-start">תשלום חודשי</th>
            <th class="py-2 pe-3 text-start">נשארו</th>
            <th class="py-2 pe-3 text-start">לאן הולכת</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, i) in obligations" :key="i" class="border-b border-n100">
            <td class="py-1 pe-3">{{ o.label }}</td>
            <td class="py-1 pe-3"><span class="ltr">{{ sh(o.monthly) }}</span></td>
            <td class="py-1 pe-3">{{ o.kind === "rent" ? "—" : o.unknown ? "לא ידוע" : o.months }}</td>
            <td class="py-1 pe-3">{{ placeText[verdicts[i].placement] }}</td>
          </tr>
          <tr class="border-b border-n100 font-semibold">
            <td class="py-1 pe-3">ההכנסה הפנויה</td>
            <td class="py-1 pe-3" colspan="3"><span class="ltr">{{ sh(disposable) }}</span></td>
          </tr>
          <tr v-if="mode === 'ratio'" class="font-semibold">
            <td class="py-1 pe-3">יחס ההחזר</td>
            <td class="py-1 pe-3" colspan="3"><span class="ltr">{{ ratio === null ? "—" : `${percentString(ratio)}%` }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
