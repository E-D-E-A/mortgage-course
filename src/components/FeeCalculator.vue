<script setup lang="ts">
// Lesson 7.2: the fee calculator that shows every step. The learner enters a fixed-rate loan, the two
// published averages (effective annual rates) and the repayment date, and sees each step that leads to
// the fee: payments made, balance, the three MONTHLY rates (nominal ÷ 12 for the contract, the twelfth
// root for the two averages), the three present values, both formulas, the lower of the two, the
// reduction for time served, the other fees and the total. It starts on the team's worked example (case C).
// Every number comes from earlyrepay.ts; nothing is computed here.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import {
  WORKED_EXAMPLE,
  addDays,
  earlyRepaymentFee,
  effective,
  effectiveOfNominal,
  monthlyFraction,
  nominal,
  type FeeResult,
} from "../lib/calc/earlyrepay.ts";
import { formatShekels } from "../lib/calc/money.ts";

const ex = WORKED_EXAMPLE;
const principal = ref(700000);
const rate = ref(5.9);
const years = ref(20);
const granted = ref(ex.loan.grantedOn);
const repaid = ref(ex.repaidOn);
const avgToday = ref(ex.averageToday.percent);
const avgGrant = ref(ex.averageAtGrant ? ex.averageAtGrant.percent : "5.09");
const hasGrant = ref(true);
const noticeDays = ref(30);
const mistake = ref(false);
const showTable = ref(false);

function reset() {
  principal.value = 700000;
  rate.value = 5.9;
  years.value = 20;
  granted.value = ex.loan.grantedOn;
  repaid.value = ex.repaidOn;
  avgToday.value = ex.averageToday.percent;
  avgGrant.value = "5.09";
  hasGrant.value = true;
  noticeDays.value = 30;
  mistake.value = false;
}

const isNumber = (s: string) => /^-?\d+(\.\d+)?$/.test(s.trim());
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

const problem = computed(() => {
  if (!isDate(granted.value) || !isDate(repaid.value)) return "בחרו תאריך מלא בשני השדות.";
  if (repaid.value < granted.value) return "תאריך הפירעון לפני תאריך ההעמדה.";
  if (!isNumber(avgToday.value)) return "הממוצע ביום הפירעון: כתבו מספר, למשל 4.82.";
  if (hasGrant.value && !isNumber(avgGrant.value)) return "הממוצע בהעמדה: כתבו מספר, למשל 5.09.";
  if (Number(avgToday.value) <= -100 || (hasGrant.value && Number(avgGrant.value) <= -100)) return "ממוצע של −100% ומטה לא מוגדר.";
  return "";
});

const r = computed<FeeResult | null>(() => {
  if (problem.value) return null;
  const today = mistake.value ? effectiveOfNominal(nominal(avgToday.value)) : effective(avgToday.value);
  const grant = hasGrant.value ? (mistake.value ? effectiveOfNominal(nominal(avgGrant.value)) : effective(avgGrant.value)) : null;
  const notice = noticeDays.value > 0 ? addDays(repaid.value, -noticeDays.value) : null;
  return earlyRepaymentFee({
    loan: { principal: principal.value, contract: nominal(String(rate.value)), termMonths: years.value * 12, grantedOn: granted.value, kind: "fixed", linkage: "unlinked" },
    repaidOn: repaid.value,
    averageToday: today,
    averageAtGrant: grant,
    noticeGivenOn: notice,
  });
});

const pct = (d: Decimal.Value, places = 4) => `${new Decimal(d).mul(100).toDecimalPlaces(places).toString()}%`;
const m = (d: Decimal | null | undefined) => (d ? formatShekels(d) : "—");
const contractEff = computed(() => new Decimal(effectiveOfNominal(nominal(String(rate.value))).percent).toDecimalPlaces(2).toString());
const monthlyContract = computed(() => pct(monthlyFraction(nominal(String(rate.value)))));
const monthlyToday = computed(() => (isNumber(avgToday.value) ? pct(monthlyFraction(mistake.value ? nominal(avgToday.value) : effective(avgToday.value))) : "—"));
const monthlyGrant = computed(() => (hasGrant.value && isNumber(avgGrant.value) ? pct(monthlyFraction(mistake.value ? nominal(avgGrant.value) : effective(avgGrant.value))) : "—"));
const served = computed(() => {
  const k = r.value?.paid ?? 0;
  const y = Math.floor(k / 12);
  const mo = k % 12;
  const yText = y === 0 ? "" : y === 1 ? "שנה" : `${y} שנים`;
  const mText = mo === 0 ? "" : mo === 1 ? "חודש" : `${mo} חודשים`;
  // "ו" before a word ("וחודש"), "ו־" before a number ("ו־11 חודשים").
  if (yText && mText) return `${yText} ${mo === 1 ? "ו" : "ו־"}${mText}`;
  return yText || mText || "פחות מחודש";
});
const noticeText = computed(() => {
  const s = r.value?.notice;
  if (!s) return "";
  if (s.status === "none") return "לא נמסרה הודעה: עמלת אי־הודעה חלה.";
  if (s.status === "ok") return `הודעה ${s.days} ימים מראש, בין 10 ל־45: עמלת אי־הודעה לא חלה.`;
  if (s.status === "short") return `הודעה ${s.days} ימים מראש, פחות מ־10: עמלת אי־הודעה חלה.`;
  return `הודעה ${s.days} ימים מראש, יותר מ־45 (קריאה שלנו: היא לא נחשבת): עמלת אי־הודעה חלה.`;
});

interface Step {
  n: number;
  title: string;
  lines: { label: string; value: string; strong?: boolean }[];
  note?: string;
}
const steps = computed<Step[]>(() => {
  const x = r.value;
  if (!x) return [];
  const d = x.discounting;
  const out: Step[] = [
    {
      n: 1,
      title: "כמה תשלומים כבר שולמו",
      lines: [
        { label: "תשלומים ששולמו", value: String(x.paid) },
        { label: "תשלומים שנשארו", value: String(x.remaining) },
      ],
      note: "הנחת חישוב: תשלום אחד בחודש, ביום של ההעמדה, והראשון חודש אחריה.",
    },
    {
      n: 2,
      title: "ההחזר החודשי והיתרה",
      lines: [
        { label: "ההחזר החודשי (שפיצר)", value: m(x.payment) },
        { label: "היתרה אחרי התשלומים ששולמו", value: m(x.balance), strong: true },
      ],
    },
    {
      n: 3,
      title: "שלוש ריביות חודשיות: לא מערבבים",
      lines: [
        { label: `הריבית בחוזה (נומינלית ${rate.value.toFixed(2)}%, שווה ל־${contractEff.value}% אפקטיבית): חלקי 12`, value: monthlyContract.value },
        { label: `הממוצע ביום הפירעון (אפקטיבי ${avgToday.value}%): ${mistake.value ? "חלקי 12 (הטעות)" : "שורש 12"}`, value: monthlyToday.value },
        { label: `הממוצע בהעמדה (אפקטיבי ${hasGrant.value ? avgGrant.value : "—"}%): ${mistake.value ? "חלקי 12 (הטעות)" : "שורש 12"}`, value: monthlyGrant.value },
      ],
      note: `הממוצעים שבנק ישראל מפרסם הם אפקטיביים לשנה, והריבית בחוזה נומינלית: משווים רק ריביות חודשיות. הטווח בקובץ הממוצעים, לפי הזמן שנשאר: ${x.bucket.label} שנים${x.bucket.onEdge ? " (בדיוק על גבול: לא ידוע לאיזה טווח הוא שייך)" : ""}.`,
    },
  ];
  if (d) {
    out.push(
      {
        n: 4,
        title: "הערך הנוכחי של התשלומים שנשארו",
        lines: [
          { label: "בריבית הממוצעת ביום הפירעון", value: m(d.pvToday) },
          { label: "בריבית של החוזה (שווה ליתרה)", value: m(d.pvContract) },
          { label: "בריבית הממוצעת של יום ההעמדה", value: m(d.pvGrant) },
        ],
      },
      {
        n: 5,
        title: "שתי הנוסחאות",
        lines: [
          { label: d.v1Applies ? "נוסחה ראשונה: ביום הפירעון פחות החוזה" : "נוסחה ראשונה: לא חלה (הממוצע ביום הפירעון לא נמוך מהחוזה)", value: d.v1Applies ? m(d.v1) : "—" },
          { label: d.v2Applies ? "נוסחה שנייה: ביום הפירעון פחות ההעמדה" : hasGrant.value ? "נוסחה שנייה: לא חלה (הממוצע בהעמדה לא נמוך מהחוזה)" : "נוסחה שנייה: לא קיימת (לא פורסם ממוצע בהעמדה)", value: d.v2Applies ? m(d.v2) : "—" },
        ],
      },
      {
        n: 6,
        title: "הנמוכה מבין השתיים",
        lines: [{ label: d.binding === "v2" ? "הנמוכה: הנוסחה השנייה" : d.binding === "v1" ? "הנמוכה: הנוסחה הראשונה" : "אין נוסחה שחלה: אין עמלת היוון", value: m(x.lower), strong: true }],
        note: x.lower && x.lower.lt(0) ? "תוצאה שלילית: מקזזים אותה מהעמלות האחרות. הצו לא אומר אם הסכום הכולל יכול לרדת מתחת לאפס; הקריאה שלנו: לא (לא אומת)." : undefined,
      },
      {
        n: 7,
        title: "הפחתה לפי ותק",
        lines: [
          { label: `ותק: ${served.value} מההעמדה עד הפירעון`, value: `${x.reduction.percent}%` },
          { label: "עמלת ההיוון אחרי ההפחתה", value: m(x.discount), strong: true },
        ],
        note: x.reduction.onBoundary ? "הפירעון ביום השנה בדיוק: איך הצו סופר את היום הזה לא ידוע." : undefined,
      },
    );
  } else {
    out.push({ n: 4, title: "עמלת היוון", lines: [{ label: "במסלול הזה אין", value: "—" }] });
  }
  const next = out.length + 1;
  out.push(
    {
      n: next,
      title: "העמלות האחרות",
      lines: [
        { label: "עמלה תפעולית (פעם אחת)", value: m(x.operational) },
        { label: "עמלת אי־הודעה (0.1% מהיתרה, אם אין הודעה בזמן)", value: m(x.noNotice) },
      ],
      note: noticeText.value,
    },
    {
      n: next + 1,
      title: "סך הכול",
      lines: [
        { label: "סכום העמלות", value: m(x.sum) },
        { label: "מה שמשלמים", value: m(x.total), strong: true },
      ],
      note: x.floored ? "הסכום היה שלילי, והקורס מציג אפס (הקריאה שלנו; הצו לא אומר)." : undefined,
    },
  );
  return out;
});
</script>

<template>
  <div class="fc-root my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">
      הלוואה אחת, קבועה לא צמודה, בשפיצר. ברירת המחדל היא ההלוואה של עדי וירון והממוצעים שהצוות קרא ב־2.8.2026 (לא אומת). שאר המספרים להמחשה. דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים.
    </p>

    <div class="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-3">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">סכום ההלוואה בהעמדה</span>
        <input v-model.number="principal" type="range" min="100000" max="2000000" step="10000" aria-label="סכום ההלוואה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ formatShekels(principal) }}</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">הריבית בחוזה (נומינלית, לשנה)</span>
        <input v-model.number="rate" type="range" min="3" max="8" step="0.01" aria-label="הריבית בחוזה" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ rate.toFixed(2) }}%</span></span>
      </label>
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">תקופה, בשנים</span>
        <input v-model.number="years" type="range" min="10" max="30" step="1" aria-label="תקופה בשנים" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ years }}</span> שנים</span>
      </label>
    </div>

    <div class="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">יום ההעמדה</span>
        <input v-model="granted" type="date" class="fc-date h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">יום הפירעון</span>
        <input v-model="repaid" type="date" class="fc-date h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הממוצע ביום הפירעון (אפקטיבי, באחוזים)</span>
        <input v-model="avgToday" type="text" inputmode="decimal" class="ltr h-11 rounded-md border border-n300 px-2 text-body-m text-n900" aria-label="הממוצע ביום הפירעון, אפקטיבי, באחוזים" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הממוצע ביום ההעמדה (אפקטיבי)</span>
        <input v-model="avgGrant" type="text" inputmode="decimal" :disabled="!hasGrant" class="ltr h-11 rounded-md border border-n300 px-2 text-body-m text-n900 disabled:bg-n100" aria-label="הממוצע ביום ההעמדה, אפקטיבי, באחוזים" />
      </label>
    </div>

    <div class="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
      <label class="flex flex-col">
        <span class="text-caption font-semibold text-n600">כמה ימים לפני הפירעון נמסרה הודעה בכתב</span>
        <input v-model.number="noticeDays" type="range" min="0" max="60" step="1" aria-label="ימים מראש" />
        <span class="text-body-l font-semibold text-n900">{{ noticeDays === 0 ? "לא נמסרה הודעה" : `${noticeDays} ימים` }}</span>
      </label>
      <div class="flex flex-col justify-end">
        <label class="flex min-h-11 cursor-pointer items-center gap-2">
          <input v-model="hasGrant" type="checkbox" class="h-5 w-5 accent-teal-deep" />
          <span class="text-body-m text-n800">פורסם ממוצע ליום ההעמדה</span>
        </label>
        <label class="flex min-h-11 cursor-pointer items-center gap-2">
          <input v-model="mistake" type="checkbox" class="h-5 w-5 accent-teal-deep" />
          <span class="text-body-m text-n800">הטעות: לחלק את הממוצעים ב־12</span>
        </label>
      </div>
    </div>
    <button type="button" class="mt-1 min-h-11 text-body-m text-navy underline" @click="reset">חזרה לדוגמה של עדי וירון</button>

    <p v-if="problem" class="mt-3 rounded-md bg-warning-bg p-3 text-body-m text-n800" role="alert">{{ problem }}</p>
    <p v-if="r && r.remaining === 0" class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800">ההלוואה כבר נפרעה במלואה בתאריך הזה: אין מה לפרוע.</p>

    <p v-if="r && !problem && r.remaining > 0" class="sticky bottom-2 z-10 mt-4 flex flex-wrap items-baseline justify-between gap-x-3 rounded-md border border-navy bg-n0 p-3 text-body-m font-semibold text-n900 shadow-md sm:hidden" role="status">
      <span>מה שמשלמים</span><span class="ltr">{{ formatShekels(r.total) }}</span>
    </p>
    <ol v-if="!problem && r && r.remaining > 0" class="mt-4 grid gap-3" aria-live="polite">
      <li v-for="s in steps" :key="s.n" class="rounded-md border p-3" :class="s.n === steps.length ? 'border-navy' : 'border-n100'">
        <p class="text-body-m font-semibold text-n900"><span class="ltr text-n600">{{ s.n }}.</span> {{ s.title }}</p>
        <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-body-m">
          <template v-for="l in s.lines" :key="l.label">
            <dt class="text-n700">{{ l.label }}</dt>
            <dd class="text-end"><span class="ltr" :class="l.strong ? 'font-semibold text-n900' : 'text-n800'">{{ l.value }}</span></dd>
          </template>
        </dl>
        <p v-if="s.note" class="mt-2 text-caption text-n600">{{ s.note }}</p>
      </li>
    </ol>

    <p v-if="r && !problem && r.remaining > 0 && r.discounting && r.discounting.v1" class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800">
      מחשבון שמכיר רק את הנוסחה הראשונה היה אומר <span class="ltr font-semibold text-n900">{{ formatShekels(Decimal.max(0, r.discounting.v1.mul(100 - r.reduction.percent).div(100).plus(r.operational).plus(r.noNotice))) }}</span>.
    </p>

    <button type="button" class="mt-2 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable && !problem" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">צעד</th>
            <th class="py-2 pe-3 text-start font-semibold">הסעיף</th>
            <th class="py-2 text-start font-semibold">הסכום</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="s in steps" :key="s.n">
            <tr v-for="(l, i) in s.lines" :key="s.n + '-' + i" class="border-b border-n100">
              <td class="py-1 pe-3 text-n600"><span class="ltr">{{ i === 0 ? s.n : "" }}</span></td>
              <td class="py-1 pe-3 text-n800">{{ l.label }}</td>
              <td class="py-1"><span class="ltr">{{ l.value }}</span></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
/* A focused control is never left under the sticky total on a phone; the date picker's icon gets a ring like the other controls. */
@media (max-width: 639.98px) {
  .fc-root input,
  .fc-root button {
    scroll-margin-bottom: 9rem;
  }
}
.fc-date:focus-visible,
.fc-date::-webkit-calendar-picker-indicator:focus-visible {
  outline: 2px solid var(--mogi-navy);
  outline-offset: 2px;
}
</style>
