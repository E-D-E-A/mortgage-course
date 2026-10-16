<script setup lang="ts">
// מחשבון המחיר של מנוף — gain against cost (lesson 6.4; reused by the workshop, 6.11). The learner pulls
// ONE lever of a case — more equity, closing a loan first, waiting for the 18-month rule, a second
// borrower, a longer or shorter term, a different split between the tracks — and sees, side by side, what
// it gains (the ratio, the payment the ratio uses) and what it costs, in four currencies that are never
// added together: cash now, shekels over the whole loan, the highest payment of a harsh scenario, months of
// waiting. If the lever crosses a ban of Directive 329 (as the team transcribed it) the ban is shown and the
// lever is marked "not allowed". All arithmetic is levers.ts (on sensitivity.ts, affordability.ts,
// regulation.ts); the lines drawn on the ratio bar are positioning.ts's example thresholds, each with its kind.
// The case is a prop (case A on the page): nothing about a family is typed here.
import { computed, reactive, ref } from "vue";
import { type LeverMove, type PositionCase, pull } from "../lib/calc/levers.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { KIND_INFO, thresholdsOf } from "../lib/calc/positioning.ts";
import { RULES } from "../lib/calc/regulation.ts";
import { isFixedForTerm } from "../lib/calc/schedule.ts";
import Decimal from "decimal.js";

type Key = "equity" | "close" | "wait" | "borrower" | "term" | "mix";
const props = withDefaults(
  defineProps<{
    base: PositionCase;
    /** What the lender asks to close the loan (the first loan of the case). */
    payoff?: string;
    /** The most a second borrower's income can be set to, shekels a month. */
    borrowerMax?: number;
    /** Which levers to offer, in order. */
    levers?: Key[];
    /** One line under the title: what is invented. */
    note: string;
  }>(),
  { payoff: "0", borrowerMax: 8000, levers: () => ["equity", "close", "wait", "borrower", "term", "mix"] },
);

const hasLoan = props.base.obligations.some((o) => o.kind === "loan");
const fixedIndex = props.base.tracks.findIndex((t) => isFixedForTerm(t.kind)) + 1;
const variableIndex = (() => {
  const pref = props.base.tracks.findIndex((t) => t.kind === "variable_unlinked");
  return (pref >= 0 ? pref : props.base.tracks.findIndex((t) => !isFixedForTerm(t.kind))) + 1;
})();
const offered = props.levers.filter((k) => (k === "close" || k === "wait" ? hasLoan : k === "mix" ? fixedIndex > 0 && variableIndex > 0 : true));

const names: Record<Key, string> = {
  equity: "עוד הון עצמי",
  close: "סגירת הלוואה",
  wait: "המתנה",
  borrower: "לווה נוסף",
  term: "תקופה",
  mix: "חלוקה בין מסלולים",
};
const whatItIs: Record<Key, string> = {
  equity: "מכניסים להון העצמי עוד כסף מהחסכונות. ההלוואה קטנה באותו סכום.",
  close: "סוגרים הלוואה קיימת לפני הבקשה. אפשר מהחסכונות, ואפשר מהכסף שהיה מיועד להון העצמי.",
  wait: "מגישים בקשה אחרי כמה חודשים, כשנשארים פחות תשלומים על ההלוואה הקיימת. עד 18 תשלומים היא כבר לא נספרת בהכנסה הפנויה.",
  borrower: "לווה נוסף עם הכנסה מתועדת, למשל הורה. ההכנסה שלו מצטרפת, והוא חותם על ההלוואה.",
  term: "מזיזים את התקופה של כל המסלולים. קדימה: תקופה ארוכה יותר. אחורה: קצרה יותר.",
  mix: "מזיזים חלק מההלוואה בין מסלול קבוע למסלול שיכול להשתנות.",
};
const whenNot: Record<Key, string> = {
  equity: "כשהחסכונות שנשארים קטנים ממה שהמשפחה צריכה בחודשים הראשונים בדירה. כמה זה, הקורס לא יודע: זו שאלה למשפחה.",
  close: "כשהחסכונות שנשארים דקים מדי, או כשסגירה מההון העצמי דוחפת את שיעור המימון מעל התקרה.",
  wait: "כשהעסקה, המחיר או הריבית לא מחכים. מה יקרה בעוד חודשים, לא ידוע.",
  borrower: "כשהלווה הנוסף לא יכול או לא רוצה לשאת בהלוואה: הוא אחראי עליה כמו כולם.",
  term: "כשהסך הנוסף שהמשפחה משלמת גדול ממה שהחזר נמוך שווה לה. ומעל 30 שנה אסור.",
  mix: "כשהחשיפה לריבית שעולה גדולה ממה שהמשפחה יכולה לשאת. ומעל שני שלישים בריבית שיכולה להשתנות אסור.",
};

const chosen = ref<Key>(offered[0]);
const v = reactive({ equity: 0, close: false, closeFrom: "reserve" as "reserve" | "equity", wait: 0, borrower: 0, term: 0, mix: 0 });
const monthsLeft = props.base.obligations.find((o) => o.kind === "loan")?.monthsLeft ?? 0;
const reserve = Number(props.base.reserve);
const showTable = ref(false);

const move = computed<LeverMove | null>(() => {
  switch (chosen.value) {
    case "equity":
      return v.equity > 0 ? { lever: "equity", add: String(v.equity) } : null;
    case "close":
      return v.close ? { lever: "close_loan", payoff: props.payoff, from: v.closeFrom } : null;
    case "wait":
      return v.wait > 0 ? { lever: "wait", months: v.wait } : null;
    case "borrower":
      return v.borrower > 0 ? { lever: "borrower", income: String(v.borrower) } : null;
    case "term":
      return v.term !== 0 ? { lever: "term", months: v.term } : null;
    case "mix":
      return v.mix > 0
        ? { lever: "mix", from: fixedIndex, to: variableIndex, points: String(v.mix) }
        : v.mix < 0
          ? { lever: "mix", from: variableIndex, to: fixedIndex, points: String(-v.mix) }
          : null;
  }
});

const outcome = computed(() => {
  const m = move.value;
  if (!m) return { price: pull(props.base, { lever: "wait", months: 0 }), moved: false, error: "" };
  try {
    return { price: pull(props.base, m), moved: true, error: "" };
  } catch (e) {
    return { price: pull(props.base, { lever: "wait", months: 0 }), moved: false, error: e instanceof RangeError ? e.message : "" };
  }
});
const p = computed(() => outcome.value.price);
const errorText = computed(() => {
  if (!outcome.value.error) return "";
  return chosen.value === "close" ? "בחסכונות אין מספיק כסף לסגירה, ולכן אפשר לסגור רק מההון העצמי." : "אי אפשר למשוך את המנוף בגודל הזה.";
});

// Formatting only: a real minus sign, a sign in front of a change.
const sh = (x: Decimal.Value) => formatShekels(String(x));
const whole = (x: Decimal.Value) => formatWholeShekels(String(x));
const pct = (x: Decimal.Value) => `${percentString(x)}%`;
const signed = (x: Decimal, f: (d: Decimal) => string) => (x.isZero() ? f(x) : x.isPos() ? `+${f(x)}` : f(x));
const points = (x: Decimal) => percentString(x.abs());

const marks = thresholdsOf("pti").map((t) => ({ at: Number(t.percent), label: `${t.percent}%`, kind: KIND_INFO[t.kind].name }));
const SCALE = 60;
const bar = (x: Decimal) => `${Math.min(100, (x.toNumber() / SCALE) * 100)}%`;

const wallText = computed(() =>
  p.value.after.lines
    .filter((l) => l.status === "over")
    .map((l) => {
      const rule = RULES.find((r) => r.id === l.id);
      const value = l.id === "term" ? `${l.actual.toString()} חודשים, התקרה ${l.limit.toString()}` : `${percentString(l.actual)}%, התקרה ${percentString(l.limit)}%`;
      return `${rule?.label}: ${value}`;
    }),
);
const perPointCash = computed(() => (p.value.gain.ratioPoints.gt(0) && p.value.cost.cashNow.gt(0) ? p.value.cost.cashNow.div(p.value.gain.ratioPoints) : null));
const perPointExtra = computed(() => (p.value.gain.ratioPoints.gt(0) && p.value.cost.extraTotal.gt(0) ? p.value.cost.extraTotal.div(p.value.gain.ratioPoints) : null));

function reset() {
  Object.assign(v, { equity: 0, close: false, closeFrom: "reserve", wait: 0, borrower: 0, term: 0, mix: 0 });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">{{ note }}</p>

    <!-- Which lever -->
    <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="המנוף">
      <button
        v-for="k in offered"
        :key="k"
        type="button"
        class="min-h-11 rounded-pill border px-4 text-body-m"
        :class="chosen === k ? 'border-navy bg-navy text-n0' : 'border-n300 text-n800 hover:bg-n50'"
        :aria-pressed="chosen === k"
        @click="chosen = k"
      >
        {{ names[k] }}
      </button>
    </div>
    <p class="mt-3 text-body-m text-n800">{{ whatItIs[chosen] }}</p>

    <!-- The lever's own control -->
    <div class="mt-3">
      <label v-if="chosen === 'equity'" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">הון עצמי נוסף: <span class="ltr font-semibold">{{ whole(v.equity) }}</span> <span class="text-n600">(בחסכונות: <span class="ltr">{{ whole(reserve) }}</span>)</span></span>
        <input v-model.number="v.equity" type="range" min="0" :max="reserve" step="1000" aria-label="הון עצמי נוסף, בשקלים" />
      </label>
      <div v-else-if="chosen === 'close'" class="grid gap-2">
        <p class="text-body-m text-n800">סכום הסגירה: <span class="ltr font-semibold">{{ whole(payoff) }}</span></p>
        <div class="flex flex-wrap gap-2" role="group" aria-label="סגירת ההלוואה">
          <button type="button" class="min-h-11 rounded-md border px-3 text-body-m" :class="!v.close ? 'border-navy bg-n100 font-semibold' : 'border-n200 hover:bg-n50'" :aria-pressed="!v.close" @click="v.close = false">לא סוגרים</button>
          <button type="button" class="min-h-11 rounded-md border px-3 text-body-m" :class="v.close && v.closeFrom === 'reserve' ? 'border-navy bg-n100 font-semibold' : 'border-n200 hover:bg-n50'" :aria-pressed="v.close && v.closeFrom === 'reserve'" @click="(v.close = true), (v.closeFrom = 'reserve')">סוגרים מהחסכונות</button>
          <button type="button" class="min-h-11 rounded-md border px-3 text-body-m" :class="v.close && v.closeFrom === 'equity' ? 'border-navy bg-n100 font-semibold' : 'border-n200 hover:bg-n50'" :aria-pressed="v.close && v.closeFrom === 'equity'" @click="(v.close = true), (v.closeFrom = 'equity')">סוגרים מההון העצמי</button>
        </div>
      </div>
      <label v-else-if="chosen === 'wait'" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">מחכים <span class="font-semibold">{{ v.wait }}</span> חודשים <span class="text-n600">(נשארו {{ monthsLeft }} תשלומים על ההלוואה)</span></span>
        <input v-model.number="v.wait" type="range" min="0" :max="monthsLeft" step="1" aria-label="כמה חודשים מחכים" />
      </label>
      <label v-else-if="chosen === 'borrower'" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">הכנסה נטו של הלווה הנוסף: <span class="ltr font-semibold">{{ whole(v.borrower) }}</span> בחודש</span>
        <input v-model.number="v.borrower" type="range" min="0" :max="borrowerMax" step="500" aria-label="הכנסה חודשית של הלווה הנוסף" />
      </label>
      <label v-else-if="chosen === 'term'" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">
          שינוי בתקופה:
          <span class="font-semibold">{{ v.term === 0 ? "בלי שינוי" : `${v.term > 0 ? "עוד" : "פחות"} ${Math.abs(v.term) / 12} שנים` }}</span>
          <span class="text-n600"> (התקופה היום: {{ p.before.months / 12 }} שנים)</span>
        </span>
        <input v-model.number="v.term" type="range" min="-120" max="60" step="12" aria-label="שינוי בתקופה, בחודשים" />
      </label>
      <label v-else-if="chosen === 'mix'" class="flex flex-col gap-1">
        <span class="text-body-m text-n800">
          חלוקה:
          <span class="font-semibold">{{ v.mix === 0 ? "בלי שינוי" : v.mix > 0 ? `${v.mix} נקודות אחוז מהקבוע אל המשתנה` : `${-v.mix} נקודות אחוז מהמשתנה אל הקבוע` }}</span>
        </span>
        <input v-model.number="v.mix" type="range" min="-30" max="30" step="5" aria-label="הזזת חלק מההלוואה בין מסלולים, בנקודות אחוז" />
      </label>
      <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" @click="reset">איפוס</button>
    </div>
    <p v-if="errorText" class="mt-2 rounded-md bg-warning-bg p-3 text-body-m text-n800" role="alert">{{ errorText }}</p>

    <!-- The ratio, before and after, with the lines -->
    <div class="mt-4" aria-hidden="true">
      <div class="flex items-center gap-2">
        <span class="w-14 shrink-0 text-caption text-n600">לפני</span>
        <div class="relative h-4 flex-1 overflow-hidden rounded-pill bg-n100"><div class="absolute inset-y-0 start-0 rounded-pill bg-n300" :style="{ width: bar(p.before.ratio) }"></div></div>
        <span class="w-16 shrink-0 text-body-m font-semibold text-n900"><span class="ltr">{{ pct(p.before.ratio) }}</span></span>
      </div>
      <div class="mt-1 flex items-center gap-2">
        <span class="w-14 shrink-0 text-caption text-n600">אחרי</span>
        <div class="relative h-4 flex-1 overflow-hidden rounded-pill bg-n100"><div class="absolute inset-y-0 start-0 rounded-pill bg-teal-deep" :style="{ width: bar(p.after.ratio) }"></div></div>
        <span class="w-16 shrink-0 text-body-m font-semibold text-n900"><span class="ltr">{{ pct(p.after.ratio) }}</span></span>
      </div>
      <div class="relative mx-0 mt-1 h-8 ps-16 pe-18">
        <div class="relative h-full">
          <span v-for="m in marks" :key="m.at" class="absolute top-0 -translate-x-1/2 text-caption text-n600 rtl:translate-x-1/2" :style="{ insetInlineStart: `${(m.at / SCALE) * 100}%` }"><span class="block h-2 border-s-2 border-dashed border-navy"></span><span class="ltr">{{ m.label }}</span></span>
        </div>
      </div>
    </div>
    <ul class="list-reset mt-1 flex flex-wrap gap-x-4 gap-y-1 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-n300"></span>יחס ההחזר היום</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-teal-deep"></span>אחרי המנוף</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-0 border-s-2 border-dashed border-navy"></span>קווים לדוגמה (30%, 35% השערות; 40% סף הון; 50% מגבלה: לא אומתו)</li>
    </ul>

    <!-- Gain against cost -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2" role="status" aria-live="polite">
      <section class="rounded-md bg-n50 p-3" aria-label="מה מרוויחים">
        <p class="text-body-m font-semibold text-navy">מה מרוויחים</p>
        <ul class="list-reset mt-2 grid gap-2 text-body-m text-n800">
          <li>
            יחס ההחזר:
            <span class="ltr font-semibold">{{ pct(p.before.ratio) }} ← {{ pct(p.after.ratio) }}</span>
            <span v-if="!p.gain.ratioPoints.isZero()" class="block text-caption text-n600">{{ p.gain.ratioPoints.isPos() ? "נמוך יותר" : "גבוה יותר" }} ב־<span class="ltr">{{ points(p.gain.ratioPoints) }}</span> נקודות אחוז</span>
          </li>
          <li>
            התשלום שנכנס ליחס:
            <span class="ltr font-semibold">{{ sh(p.before.qualifying) }} ← {{ sh(p.after.qualifying) }}</span>
          </li>
          <li>
            שיעור המימון:
            <span class="ltr font-semibold">{{ pct(p.before.ltv) }} ← {{ pct(p.after.ltv) }}</span>
          </li>
          <li>
            מה נשאר לחיים בחודש הראשון:
            <span class="ltr font-semibold">{{ sh(p.after.leftFirst) }}</span>
            <span v-if="!p.after.leftFirst.eq(p.before.leftFirst)" class="block text-caption text-n600">היום: <span class="ltr">{{ sh(p.before.leftFirst) }}</span></span>
          </li>
        </ul>
      </section>
      <section class="rounded-md bg-n50 p-3" aria-label="מה משלמים">
        <p class="text-body-m font-semibold text-navy">מה משלמים <span class="text-caption font-normal text-n600">(מטבעות שונים: לא מחברים)</span></p>
        <ul class="list-reset mt-2 grid gap-2 text-body-m text-n800">
          <li>
            מזומן עכשיו: <span class="ltr font-semibold">{{ whole(p.cost.cashNow) }}</span>
            <span v-if="!p.cost.cashNow.isZero()" class="block text-caption text-n600">נשאר בחסכונות: <span class="ltr">{{ whole(p.cost.reserveAfter) }}</span></span>
          </li>
          <li>
            לאורך כל ההלוואה:
            <span class="font-semibold">
              <template v-if="p.cost.extraTotal.isZero()">בלי שינוי</template>
              <template v-else><span class="ltr">{{ whole(p.cost.extraTotal.abs()) }}</span> {{ p.cost.extraTotal.isPos() ? "יותר" : "פחות" }}</template>
            </span>
          </li>
          <li>
            ההחזר הגבוה ביותר בתרחיש מחמיר:
            <span class="font-semibold">
              <template v-if="p.cost.stressRise.isZero()">בלי שינוי</template>
              <template v-else><span class="ltr">{{ whole(p.cost.stressRise.abs()) }}</span> בחודש {{ p.cost.stressRise.isPos() ? "יותר" : "פחות" }}</template>
            </span>
          </li>
          <li>
            זמן: <span class="font-semibold">{{ p.cost.months ? `${p.cost.months} חודשי המתנה` : "בלי המתנה" }}</span>
          </li>
          <li v-if="perPointCash || perPointExtra" class="rounded-sm bg-n0 p-2">
            מחיר נקודת יחס אחת:
            <span v-if="perPointCash" class="ltr font-semibold">{{ whole(perPointCash) }}</span><span v-if="perPointCash"> במזומן</span>
            <span v-if="perPointExtra" class="ltr font-semibold">{{ whole(perPointExtra) }}</span><span v-if="perPointExtra"> בריבית נוספת</span>
          </li>
        </ul>
      </section>
    </div>

    <p v-if="wallText.length" class="mt-3 rounded-md border-s-4 border-danger bg-danger-bg p-3 text-body-m text-n900" role="alert">
      <strong>לא אפשרי:</strong> המנוף חוצה מגבלה (לפי תעתיק הצוות להוראה 329, לא אומת): {{ wallText.join("; ") }}.
    </p>
    <p v-else-if="p.after.aboveCapital && outcome.moved" class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800">היחס עדיין מעל 40%, סף ההון לדוגמה.</p>
    <p class="mt-3 text-body-m text-n800"><strong class="text-n900">מתי לא כדאי:</strong> {{ whenNot[chosen] }}</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">{{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}</button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[26rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start">מה נמדד</th>
            <th class="py-2 pe-3 text-start">לפני</th>
            <th class="py-2 text-start">אחרי</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">יחס ההחזר</th><td class="py-1 pe-3"><span class="ltr">{{ pct(p.before.ratio) }}</span></td><td class="py-1"><span class="ltr">{{ pct(p.after.ratio) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">ההכנסה הפנויה</th><td class="py-1 pe-3"><span class="ltr">{{ sh(p.before.disposable) }}</span></td><td class="py-1"><span class="ltr">{{ sh(p.after.disposable) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">ההלוואה</th><td class="py-1 pe-3"><span class="ltr">{{ whole(p.before.loan) }}</span></td><td class="py-1"><span class="ltr">{{ whole(p.after.loan) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">שיעור המימון</th><td class="py-1 pe-3"><span class="ltr">{{ pct(p.before.ltv) }}</span></td><td class="py-1"><span class="ltr">{{ pct(p.after.ltv) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">התשלום הראשון</th><td class="py-1 pe-3"><span class="ltr">{{ sh(p.before.first) }}</span></td><td class="py-1"><span class="ltr">{{ sh(p.after.first) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">סך התשלומים</th><td class="py-1 pe-3"><span class="ltr">{{ sh(p.before.total) }}</span></td><td class="py-1"><span class="ltr">{{ sh(p.after.total) }}</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 pe-3 text-start font-normal">ההחזר הגבוה ביותר בתרחיש מחמיר</th><td class="py-1 pe-3"><span class="ltr">{{ sh(p.before.stressMax) }}</span></td><td class="py-1"><span class="ltr">{{ sh(p.after.stressMax) }}</span></td></tr>
          <tr><th class="py-1 pe-3 text-start font-normal">החסכונות שנשארים</th><td class="py-1 pe-3"><span class="ltr">{{ whole(p.before.reserve) }}</span></td><td class="py-1"><span class="ltr">{{ whole(p.after.reserve) }}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
