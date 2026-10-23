<script setup lang="ts">
// Lesson 4.15's illustration: the feasibility page of a case, checked against the
// limits only (דף היתכנות). The learner moves four things — an appraisal at or below
// the price (the lower of the two counts, per 4.9 and 4.11, not verified), how many
// payments are left on the car loan as time passes, and the course's assumed rate and
// term — and the page shows each line of the check: the limit, the case, and where it
// stands. Every limit is the team's transcript of the directive, not verified.
// The page has no track, mix or offer: where a payment has to become a loan it uses
// the assumed rate and term (C × S, lesson 3.1). All arithmetic is affordability.ts
// (4.1–4.3), regulation.ts (4.4–4.6) and amortization.ts; nothing is computed here by hand.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { classifyObligation, disposableIncome, monthsUntilDrop, OBLIGATION_MONTHS } from "../lib/calc/affordability.ts";
import { paymentsValueToday } from "../lib/calc/amortization.ts";
import { formatShekelsText } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { LTV_CEILINGS, ltvPercentOf, maxLoanAt, maxPaymentAt, MAX_TERM_MONTHS, minFixed, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../lib/calc/regulation.ts";

const props = withDefaults(
  defineProps<{
    price?: number;
    equity?: number;
    incomes?: number[];
    carPayment?: number;
    carMonths?: number;
    rate?: number;
    years?: number;
  }>(),
  { price: 2200000, equity: 560000, incomes: () => [12400, 9300], carPayment: 1450, carMonths: 26, rate: 4.5, years: 30 },
);

const value = ref(props.price);
const carMonths = ref(props.carMonths);
const rate = ref(props.rate);
const years = ref(props.years);

// No-break space before ₪ so the sign never wraps alone; "−" for a negative amount.
const money = (d: Decimal.Value) =>
  formatShekelsText(new Decimal(d).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString())
    .replace("-", "−")
    .replace(/\s₪/, "\u00a0₪");
const payments = (n: number) => (n === 1 ? "תשלום אחד" : `${n} תשלומים`);
const LIMIT_KIND = "נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 06/2026, סעיפים 2, 5, 7 ו־8)";
const pct = (d: Decimal.Value) => `${percentString(d)}%`;

const recognised = computed(() => props.incomes.reduce((s, x) => s.plus(x), new Decimal(0)));
const car = computed(() => ({ kind: "loan" as const, monthly: props.carPayment, monthsLeft: carMonths.value }));
const verdict = computed(() => classifyObligation(car.value));
const disposable = computed(() => disposableIncome(recognised.value, [car.value]));
const loan = computed(() => new Decimal(props.price).minus(props.equity));
const months = computed(() => years.value * 12);

const ltv = computed(() => ltvPercentOf(loan.value, value.value));
const ceiling = LTV_CEILINGS.only_home;
const ltvOver = computed(() => ltv.value.gt(ceiling));
const loanRoom = computed(() => maxLoanAt(value.value, "only_home").minus(loan.value));

const max50 = computed(() => maxPaymentAt(disposable.value, PTI_LIMIT));
const max40 = computed(() => maxPaymentAt(disposable.value, PTI_CAPITAL_THRESHOLD));
// The largest loan a payment suffices for, cut down to the agora (a maximum is never rounded up, lesson 4.4).
const largestLoan = (pay: Decimal) => paymentsValueToday(pay, String(rate.value), months.value).toDecimalPlaces(2, Decimal.ROUND_DOWN);
const carry50 = computed(() => largestLoan(max50.value));
const carry40 = computed(() => largestLoan(max40.value));
const fits50 = computed(() => carry50.value.gte(loan.value));
const fits40 = computed(() => carry40.value.gte(loan.value));

const fixedAtLeast = computed(() => minFixed(loan.value));
const termOver = computed(() => months.value > MAX_TERM_MONTHS);
const termNote = `התקופה בהנחה ארוכה מ־30 שנה, שהיא מעל התקרה, ולכן הדף לא מחשב עליה הלוואה. החזירו את התקופה ל־30 שנה או פחות.`;

type Tone = "ok" | "warn" | "bad";
const chipClass = (t: Tone) => (t === "ok" ? "bg-success-bg text-success" : t === "warn" ? "bg-warning-bg text-warning" : "bg-danger-bg text-danger");

const lines = computed(() => [
  {
    id: "ltv",
    title: "שיעור מימון",
    kind: LIMIT_KIND,
    tone: (ltvOver.value ? "bad" : "ok") as Tone,
    status: ltvOver.value ? "מעל התקרה" : "בתוך התקרה",
    text: `ההלוואה ${money(loan.value)} על שווי ${money(value.value)}: ${pct(ltv.value)}, מול תקרה של ${ceiling}% לדירה יחידה. ${
      ltvOver.value ? `ההלוואה גדולה מדי ב־${money(loanRoom.value.neg())}: צריך הון עצמי גדול יותר או הלוואה קטנה יותר.` : `יש מקום ל־${money(loanRoom.value)} של הלוואה נוספת, לפני שחוצים את התקרה.`
    }`,
  },
  {
    id: "pti50",
    title: "יחס החזר: התקרה",
    kind: LIMIT_KIND,
    tone: (termOver.value ? "warn" : fits50.value ? "ok" : "bad") as Tone,
    status: termOver.value ? "לא נבדק" : fits50.value ? "ההלוואה נכנסת" : "ההלוואה לא נכנסת",
    text: termOver.value
      ? `ההחזר הגבוה ביותר שהתקרה של ${PTI_LIMIT}% מתירה הוא ${money(max50.value)} (מהכנסה פנויה של ${money(disposable.value)}). ${termNote}`
      : `ההחזר הגבוה ביותר שהתקרה של ${PTI_LIMIT}% מתירה הוא ${money(max50.value)} (מהכנסה פנויה של ${money(disposable.value)}). בהנחה של ${rate.value}% ל־${years.value} שנים הוא מספיק להלוואה של ${money(carry50.value)}, ${fits50.value ? "יותר" : "פחות"} מ־${money(loan.value)}.`,
  },
  {
    id: "pti40",
    title: "יחס החזר: סף ההון",
    kind: `סף ההון (${PTI_CAPITAL_THRESHOLD}%): נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 06/2026, סעיף 6)`,
    tone: (termOver.value ? "warn" : fits40.value ? "ok" : "warn") as Tone,
    status: termOver.value ? "לא נבדק" : fits40.value ? "מתחת לסף" : "מעל הסף: מותר, והבנק מחזיק יותר הון",
    text: termOver.value
      ? `ההחזר הגבוה ביותר מתחת לסף של ${PTI_CAPITAL_THRESHOLD}% הוא ${money(max40.value)}. ${termNote}`
      : `ההחזר הגבוה ביותר מתחת לסף של ${PTI_CAPITAL_THRESHOLD}% הוא ${money(max40.value)}. בהנחה של ${rate.value}% ל־${years.value} שנים הוא מספיק להלוואה של ${money(carry40.value)}, ${fits40.value ? "יותר" : "פחות"} מ־${money(loan.value)}.`,
  },
  {
    id: "car",
    title: "הלוואת הרכב וכלל 18 החודשים",
    kind: "כלל 18 החודשים: נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 06/2026, נספח א׳, הוצאה קבועה היא התחייבות ש״יתרתה עולה על 18 חודשים״); להוריד מההכנסה: החלטה של Mogi",
    tone: (verdict.value.placement === "income" ? "warn" : "ok") as Tone,
    status: verdict.value.placement === "income" ? "נספרת" : "לא נספרת",
    text:
      verdict.value.placement === "income"
        ? `נשארו ${carMonths.value} תשלומים, יותר מ־${OBLIGATION_MONTHS}: ${money(props.carPayment)} מורידים מההכנסה. היא תפסיק להיספר בעוד ${payments(monthsUntilDrop(carMonths.value))}, כשיישארו 18 או פחות.`
        : carMonths.value === 0
          ? `ההלוואה נגמרה: היא לא נספרת.`
          : `${carMonths.value === 1 ? "נשאר תשלום אחד" : `נשארו ${carMonths.value} תשלומים`}, ${OBLIGATION_MONTHS} או פחות: היא לא נספרת (אבל משלמים אותה עד שהיא נגמרת).${carMonths.value === OBLIGATION_MONTHS ? " בדיוק 18: הנוסח הרשמי מדבר על יתרה שעולה על 18 חודשים, ולכן הלוואה שנשארו לה בדיוק 18 אינה נספרת." : ""}`,
  },
  {
    id: "variable",
    title: "החלק בריבית משתנה",
    kind: LIMIT_KIND,
    tone: "ok" as Tone,
    status: "גבול למבנה, לא בדיקה",
    text: `לפחות ${money(fixedAtLeast.value)} מההלוואה חייבים להיות בריבית קבועה (שני שלישים משתנה לכל היותר). את המבנה בונים בשלב 5.`,
  },
  {
    id: "term",
    title: "תקופה",
    kind: LIMIT_KIND,
    tone: (termOver.value ? "bad" : "ok") as Tone,
    status: termOver.value ? "מעל 30 שנה" : "בתוך הגבול",
    text: `תקופה של ${years.value} שנים (${months.value} חודשים), מול 30 שנה (${MAX_TERM_MONTHS} חודשים) לכל היותר.`,
  },
  {
    id: "policy",
    title: "מדיניות כל בנק",
    kind: "מדיניות בנק",
    tone: "warn" as Tone,
    status: "לא אומת",
    text: "איפה כל אחד מארבעת הבנקים מחמיר מעל המגבלות: לא ידוע. שאלה פתוחה.",
  },
]);

const crossed = computed(() => {
  const names = lines.value.filter((l) => l.tone === "bad" || (l.id === "pti40" && !termOver.value && !fits40.value)).map((l) => l.title);
  return names.length ? names.join(" · ") : "אף אחת";
});
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      נועם ושירה, רק עם הנתונים של התיק: מחיר <span class="ltr">{{ money(price) }}</span>, הון עצמי <span class="ltr">{{ money(equity) }}</span>, הכנסות נטו <span class="ltr">{{ money(incomes[0]) }}</span> ו־<span class="ltr">{{ money(incomes[1]) }}</span>. אין להם עדיין מסלולים או הצעה. הריבית והתקופה הן הנחה של הקורס, לא הצעה. הגבולות נקראו מהנוסח הרשמי של הוראה 329 (גרסת 06/2026).
    </p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שמאות, אם תהיה נמוכה מהמחיר (מודדים מול הנמוך מהשניים; נקרא מהנוסח הרשמי)</span>
        <input v-model.number="value" type="range" min="2100000" :max="price" step="5000" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ money(value) }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תשלומים שנשארו על הלוואת הרכב</span>
        <input v-model.number="carMonths" type="range" min="0" max="40" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ carMonths }}</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">אחוז הריבית בהנחה (לא הצעה)</span>
        <input v-model.number="rate" type="range" min="3" max="7" step="0.1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate.toFixed(1) }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">תקופה בהנחה, בשנים</span>
        <input v-model.number="years" type="range" min="15" max="35" step="1" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ years }}</span></span>
      </label>
    </div>

    <!-- On a phone this strip stays at the bottom of the screen while the sliders are in view,
         so the result of a move is visible without scrolling to the rows below. -->
    <div class="z-10 mt-4 rounded-md border border-n200 bg-n50 p-3 text-body-m text-n800 max-sm:sticky max-sm:bottom-2 max-sm:shadow-md" aria-live="polite" aria-atomic="true">
      <p>
        הכנסה פנויה: <span class="ltr font-semibold">{{ money(disposable) }}</span>. הלוואה נדרשת: <span class="ltr font-semibold">{{ money(loan) }}</span>.
      </p>
      <p class="mt-1 text-caption">
        שורות שחוצות קו: <span class="font-semibold">{{ crossed }}</span>
      </p>
    </div>

    <ul class="list-reset mt-3 space-y-3">
      <li v-for="l in lines" :key="l.id" class="rounded-md border border-n200 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-body-m font-semibold text-n900">{{ l.title }}</div>
            <div class="text-caption text-n600">{{ l.kind }}</div>
          </div>
          <span class="rounded-pill px-3 py-0.5 text-caption font-semibold" :class="chipClass(l.tone)">{{ l.status }}</span>
        </div>
        <p class="mt-2 text-body-m text-n700">{{ l.text }}</p>
      </li>
    </ul>
    <p class="mt-3 text-caption text-n600">הדף בודק מגבלות בלבד. הוא לא אומר שבנק יאשר, ולא באיזו ריבית.</p>
  </div>
</template>
