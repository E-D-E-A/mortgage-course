<script setup lang="ts">
// Lesson 4.15's illustration: the feasibility page of a case, checked against the
// limits only (דף היתכנות). The learner moves four things the case leaves open —
// the value the financing ratio is measured against, how many payments are left on
// the car loan, and the course's assumed rate and term — and the page shows each
// line of the check: the limit, the case, and where it stands.
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

const money = (d: Decimal.Value) => formatShekelsText(new Decimal(d).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).replace("-", "−");
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
const carry50 = computed(() => paymentsValueToday(max50.value, String(rate.value), months.value));
const carry40 = computed(() => paymentsValueToday(max40.value, String(rate.value), months.value));
const fits50 = computed(() => carry50.value.gte(loan.value));
const fits40 = computed(() => carry40.value.gte(loan.value));

const fixedAtLeast = computed(() => minFixed(loan.value));
const termOver = computed(() => months.value > MAX_TERM_MONTHS);

type Tone = "ok" | "warn" | "bad";
const chipClass = (t: Tone) => (t === "ok" ? "bg-success-bg text-success" : t === "warn" ? "bg-warning-bg text-warning" : "bg-danger-bg text-danger");

const lines = computed(() => [
  {
    id: "ltv",
    title: "שיעור מימון",
    kind: "מגבלה רגולטורית",
    tone: (ltvOver.value ? "bad" : "ok") as Tone,
    status: ltvOver.value ? "מעל התקרה: אסור" : "בתוך התקרה",
    text: `ההלוואה ${money(loan.value)} על שווי ${money(value.value)}: ${pct(ltv.value)}, מול תקרה של ${ceiling}% לדירה יחידה. ${
      ltvOver.value ? `חסרים ${money(loanRoom.value.neg())} של הלוואה כדי לחזור לתקרה: או הון עצמי גדול יותר, או הלוואה קטנה יותר.` : `יש מקום ל־${money(loanRoom.value)} של הלוואה נוספת, לפני שחוצים את התקרה.`
    }`,
  },
  {
    id: "pti50",
    title: "יחס החזר: התקרה",
    kind: "מגבלה רגולטורית",
    tone: (fits50.value ? "ok" : "bad") as Tone,
    status: fits50.value ? "ההלוואה נכנסת" : "ההלוואה לא נכנסת",
    text: `ההחזר הגבוה ביותר שהתקרה של ${PTI_LIMIT}% מתירה הוא ${money(max50.value)} (מהכנסה פנויה של ${money(disposable.value)}). בהנחה של ${rate.value}% ל־${years.value} שנים הוא נושא הלוואה של ${money(carry50.value)}, ${fits50.value ? "יותר" : "פחות"} מ־${money(loan.value)}.`,
  },
  {
    id: "pti40",
    title: "יחס החזר: סף ההון",
    kind: "סף הון, לא איסור",
    tone: (fits40.value ? "ok" : "warn") as Tone,
    status: fits40.value ? "מתחת לסף" : "מעל הסף: מותר, והבנק מחזיק יותר הון",
    text: `ההחזר הגבוה ביותר מתחת לסף של ${PTI_CAPITAL_THRESHOLD}% הוא ${money(max40.value)}. בהנחה של ${rate.value}% ל־${years.value} שנים הוא נושא הלוואה של ${money(carry40.value)}, ${fits40.value ? "יותר" : "פחות"} מ־${money(loan.value)}.`,
  },
  {
    id: "car",
    title: "הלוואת הרכב וכלל 18 החודשים",
    kind: "כלל של הוראה 329 (תעתיק בצוות)",
    tone: (verdict.value.placement === "income" ? "warn" : "ok") as Tone,
    status: verdict.value.placement === "income" ? "נספרת" : "לא נספרת",
    text:
      verdict.value.placement === "income"
        ? `נשארו ${carMonths.value} תשלומים, יותר מ־${OBLIGATION_MONTHS}: ${money(props.carPayment)} מורידים מההכנסה. היא תפסיק להיספר בעוד ${monthsUntilDrop(carMonths.value)} תשלומים.`
        : `נשארו ${carMonths.value} תשלומים, ${OBLIGATION_MONTHS} או פחות: היא לא נספרת (אבל משלמים אותה עד שהיא נגמרת).`,
  },
  {
    id: "variable",
    title: "החלק בריבית משתנה",
    kind: "מגבלה רגולטורית",
    tone: "ok" as Tone,
    status: "גבול למבנה, לא בדיקה",
    text: `לפחות ${money(fixedAtLeast.value)} מההלוואה חייבים להיות בריבית קבועה (שני שלישים משתנה לכל היותר). את המבנה בונים בשלב 5.`,
  },
  {
    id: "term",
    title: "תקופה",
    kind: "מגבלה רגולטורית",
    tone: (termOver.value ? "bad" : "ok") as Tone,
    status: termOver.value ? "מעל 30 שנה: אסור" : "בתוך הגבול",
    text: `תקופה של ${years.value} שנים (${months.value} חודשים), מול 30 שנה (${MAX_TERM_MONTHS} חודשים) לכל היותר.`,
  },
  {
    id: "policy",
    title: "מדיניות כל בנק",
    kind: "מדיניות בנק",
    tone: "warn" as Tone,
    status: "לא אומת",
    text: "איפה כל אחד מארבעת הבנקים מחמיר מעל המגבלות: לא ידוע. שאלה פתוחה לאילון.",
  },
]);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      נועם ושירה, רק עם מספרי המפה: מחיר <span class="ltr">{{ money(price) }}</span>, הון עצמי <span class="ltr">{{ money(equity) }}</span>, הכנסות נטו <span class="ltr">{{ money(incomes[0]) }}</span> ו־<span class="ltr">{{ money(incomes[1]) }}</span>. אין להם עדיין מסלולים או הצעה. הריבית והתקופה הן הנחה של הקורס, לא הצעה.
    </p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">השווי שמודדים מולו את שיעור המימון</span>
        <input v-model.number="value" type="range" min="2100000" max="2300000" step="5000" />
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

    <p class="mt-4 rounded-md bg-n50 p-3 text-body-m text-n800" aria-live="polite">
      הכנסה פנויה: <span class="ltr font-semibold">{{ money(disposable) }}</span>. הלוואה נדרשת: <span class="ltr font-semibold">{{ money(loan) }}</span>.
    </p>

    <ul class="list-reset mt-3 space-y-3" aria-live="polite">
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
