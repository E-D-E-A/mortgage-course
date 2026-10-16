<script setup lang="ts">
// Lesson 6.9's simulation: a day at an underwriter's desk. The learner plays the underwriter of one
// FICTIONAL bank, whose rules are the exercise's invented rules (shown on the card, never presented
// as how a real bank works). Five files arrive. For each, the system shows the financing ratio and
// the payment-to-income ratio (at the bank's list rates); the learner decides — approve or refuse —
// and, when approving, how many percentage points of relief the rules take off the bank's price list for every track. Checking shows the
// rule that decided, line by line, and what the file did not say. The decision's arithmetic is
// src/lib/calc/bankpolicy.ts; this component computes nothing itself.
import { computed, ref } from "vue";
import type { BankPolicy, LoanFile, Verdict } from "../lib/calc/bankpolicy.ts";
import { evaluate, reasonLines } from "../lib/calc/bankpolicy.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { save } from "../lib/progress.ts";

interface DayFile {
  id: string;
  title: string;
  about: string;
  unseen: string;
  file: LoanFile;
}
const props = defineProps<{ id: string; policy: BankPolicy; files: DayFile[] }>();

const KIND_HE: Record<string, string> = {
  fixed_unlinked: "קבועה לא צמודה",
  fixed_linked: "קבועה צמודה",
  prime: "פריים",
  variable_unlinked: "משתנה לא צמודה",
  variable_linked: "משתנה צמודה",
};
const LINE_HE = { ratio: "יחס ההחזר", ltv: "שיעור המימון" } as const;

const verdicts = computed<Verdict[]>(() => props.files.map((f) => evaluate(props.policy, f.file)));

/** The relief a decision can carry: every sum of the policy's reliefs, smallest first. */
const pointChoices = computed(() => {
  const a = Number(props.policy.ratioReliefLine === null ? 0 : props.policy.ratioReliefPoints);
  const b = Number(props.policy.ltvReliefLine === null ? 0 : props.policy.ltvReliefPoints);
  const sums = new Set([0, a, b, +(a + b).toFixed(2)]);
  return [...sums].sort((x, y) => x - y);
});
const pts = (x: number | string) => new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(x));

interface Answer {
  decision: "approve" | "refuse" | null;
  points: number | null;
  checked: boolean;
}
const answers = ref<Answer[]>(props.files.map(() => ({ decision: null, points: null, checked: false })));
const current = ref(0);
const showTable = ref(false);

const file = computed(() => props.files[current.value]);
const verdict = computed(() => verdicts.value[current.value]);
const answer = computed(() => answers.value[current.value]);

const isRight = (i: number): boolean => {
  const a = answers.value[i];
  const v = verdicts.value[i];
  if (a.decision !== v.decision) return false;
  return v.decision === "refuse" || a.points === Number(v.relief.toString());
};
const readyToCheck = computed(() => answer.value.decision === "refuse" || (answer.value.decision === "approve" && answer.value.points !== null));
const doneCount = computed(() => answers.value.filter((a) => a.checked).length);
const rightCount = computed(() => answers.value.filter((a, i) => a.checked && isRight(i)).length);
const allDone = computed(() => doneCount.value === props.files.length);

function decide(d: "approve" | "refuse") {
  if (answer.value.checked) return;
  answer.value.decision = d;
  if (d === "refuse") answer.value.points = null;
}
function check() {
  if (!readyToCheck.value) return;
  answer.value.checked = true;
  save(`exercise:${props.id}`, { checked: doneCount.value, right: rightCount.value });
}
function go(i: number) {
  current.value = i;
}
function reset() {
  answers.value = props.files.map(() => ({ decision: null, points: null, checked: false }));
  current.value = 0;
}

const pct = (v: { toString(): string }) => percentString(v.toString());
const obligationText = (f: LoanFile) =>
  f.obligations.length
    ? f.obligations.map((o) => `הלוואה של ${formatWholeShekels(o.monthly)} בחודש, ${o.monthsLeft} תשלומים נשארו`).join("; ")
    : "אין";
const trackText = (f: LoanFile) => f.tracks.map((t) => `${KIND_HE[t.kind]} ${formatWholeShekels(t.amount)}`).join(" · ");

/** One line of the rule trace, in words. */
function lineText(l: Verdict["lines"][number]): string {
  const name = LINE_HE[l.id];
  const actual = pct(l.actual);
  if (l.outcome === "refuse") return `${name} ${actual}% — מעל ${l.max}%: סירוב.`;
  if (l.outcome === "relief") return `${name} ${actual}% — לא מעל ${l.reliefLine}%: הנחה של ${pts(l.reliefPoints)} נקודות אחוז לכל מסלול.`;
  return l.reliefLine === null ? `${name} ${actual}% — לא מעל ${l.max}%: מחירון, ואין כלל הנחה בקו הזה.` : `${name} ${actual}% — מעל ${l.reliefLine}%: בלי הנחה, מחירון.`;
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <!-- The rules of the day. -->
    <div class="rounded-md border border-n200 bg-n50 p-4">
      <p class="text-body-m font-semibold text-n900">כללי התרגיל של {{ policy.name }}</p>
      <p class="mt-1 text-caption text-n700">בנק בדוי, וכללים בדויים. כך מחליט בנק בתרגיל הזה, לא בנק אמיתי.</p>
      <ul class="mt-3 grid list-none gap-1 ps-0 text-body-m text-n800">
        <li>המחיר הרגיל הוא מחירון הבנק: ריבית אחת לכל סוג מסלול.</li>
        <li>יחס החזר מעל <span dir="ltr">{{ policy.ratioMax }}%</span>: סירוב.</li>
        <li v-if="policy.ratioReliefLine !== null">
          יחס החזר <span dir="ltr">{{ policy.ratioReliefLine }}%</span> או פחות: הנחה של {{ pts(policy.ratioReliefPoints) }} נקודות אחוז מהריבית של כל מסלול.
        </li>
        <li>שיעור מימון מעל <span dir="ltr">{{ policy.ltvMax }}%</span>: סירוב.</li>
        <li v-if="policy.ltvReliefLine !== null">
          שיעור מימון <span dir="ltr">{{ policy.ltvReliefLine }}%</span> או פחות: הנחה של {{ pts(policy.ltvReliefPoints) }} נקודות אחוז מהריבית של כל מסלול.
        </li>
        <li class="text-n700">שתי ההנחות מצטברות. ״מעל״ הוא מעל ממש: בדיוק על הקו אינו מעליו, ולכן מקבל את ההנחה. יחס ההחזר נמדד לפי המחירון, לפני ההנחות.</li>
      </ul>
    </div>

    <!-- The desk's list. -->
    <ol class="mt-4 flex list-none flex-wrap gap-2 ps-0" aria-label="התיקים על השולחן">
      <li v-for="(f, i) in files" :key="f.id">
        <button
          type="button"
          class="min-h-11 min-w-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="[
            i === current ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50',
          ]"
          :aria-current="i === current ? 'step' : undefined"
          @click="go(i)"
        >
          {{ f.title }}
          <span v-if="answers[i].checked" class="ms-1 text-caption" :class="isRight(i) ? 'text-success' : 'text-n700'">{{ isRight(i) ? "(נכון)" : "(לא מדויק)" }}</span>
        </button>
      </li>
    </ol>

    <!-- The file. -->
    <div class="mt-4 rounded-md border border-n200 p-4">
      <p class="text-body-l font-semibold text-n900">{{ file.title }}</p>
      <p class="mt-1 text-body-m text-n800">{{ file.about }}</p>
      <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body-m">
        <dt class="text-n600">שווי הנכס</dt>
        <dd class="font-semibold text-n900"><span dir="ltr">{{ formatWholeShekels(file.file.value) }}</span></dd>
        <dt class="text-n600">הלוואה מבוקשת</dt>
        <dd class="font-semibold text-n900"><span dir="ltr">{{ formatWholeShekels(verdict.loan) }}</span></dd>
        <dt class="text-n600">המסלולים</dt>
        <dd class="text-n900">{{ trackText(file.file) }}, 30 שנה</dd>
        <dt class="text-n600">הכנסה מוכרת</dt>
        <dd class="font-semibold text-n900"><span dir="ltr">{{ formatWholeShekels(file.file.income) }}</span> בחודש</dd>
        <dt class="text-n600">התחייבויות</dt>
        <dd class="text-n900">{{ obligationText(file.file) }}</dd>
      </dl>
      <div class="mt-3 rounded-md bg-n50 p-3 text-body-m">
        <p class="text-caption font-semibold text-n600">מה המערכת של הבנק מחשבת</p>
        <p class="mt-1 text-n900">שיעור מימון: <span class="font-semibold" dir="ltr">{{ pct(verdict.ltv) }}%</span> · יחס החזר: <span class="font-semibold" dir="ltr">{{ pct(verdict.ratio) }}%</span></p>
        <p class="mt-1 text-caption text-n700">יחס ההחזר: ההחזר הראשון לפי מחירון {{ policy.name }}, <span dir="ltr">{{ formatWholeShekels(verdict.listPayment) }}</span>, מול הכנסה פנויה של <span dir="ltr">{{ formatWholeShekels(verdict.disposable) }}</span>.</p>
      </div>

      <!-- The decision. -->
      <p class="mt-4 text-body-m font-semibold text-n900">ההחלטה שלכם</p>
      <div class="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="אישור או סירוב">
        <button
          type="button"
          class="min-h-11 rounded-md border px-4 py-2 text-start text-body-m transition-colors duration-fast ease-out"
          :class="answer.decision === 'approve' ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="answer.decision === 'approve'"
          :disabled="answer.checked"
          @click="decide('approve')"
        >
          מאשרים
        </button>
        <button
          type="button"
          class="min-h-11 rounded-md border px-4 py-2 text-start text-body-m transition-colors duration-fast ease-out"
          :class="answer.decision === 'refuse' ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="answer.decision === 'refuse'"
          :disabled="answer.checked"
          @click="decide('refuse')"
        >
          מסרבים
        </button>
      </div>
      <div v-if="answer.decision === 'approve'" class="mt-3">
        <p class="text-body-m text-n800">כמה נקודות אחוז של הנחה נותנים לריבית של כל מסלול?</p>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="הנחה בריבית">
          <button
            v-for="p in pointChoices"
            :key="p"
            type="button"
            class="min-h-11 min-w-11 rounded-md border px-4 py-2 text-body-m transition-colors duration-fast ease-out"
            :class="answer.points === p ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
            :aria-pressed="answer.points === p"
            :disabled="answer.checked"
            @click="answer.points = p"
          >
            {{ p === 0 ? "בלי הנחה" : `${pts(p)} נקודת אחוז` }}
          </button>
        </div>
      </div>
      <button
        v-if="!answer.checked"
        type="button"
        class="mt-4 h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!readyToCheck"
        @click="check"
      >
        בדקו את ההחלטה
      </button>

      <!-- What the rules say. -->
      <div v-if="answer.checked" class="mt-4 rounded-md border-s-4 p-4" :class="isRight(current) ? 'border-success bg-success-bg' : 'border-warning bg-warning-bg'" aria-live="polite">
        <p class="text-body-m font-semibold text-n900">
          {{ isRight(current) ? "נכון." : "לא מדויק." }}
          {{ verdict.decision === "refuse" ? "לפי הכללים הבנק מסרב." : verdict.relief.isZero() ? "לפי הכללים הבנק מאשר, במחירון." : `לפי הכללים הבנק מאשר, עם הנחה של ${pts(verdict.relief.toString())} נקודות אחוז לכל מסלול.` }}
        </p>
        <ul class="mt-2 grid list-none gap-1 ps-0 text-body-m text-n800">
          <li v-for="l in verdict.lines" :key="l.id">{{ lineText(l) }}</li>
        </ul>
        <p v-if="verdict.decision === 'approve'" class="mt-2 text-body-m text-n800">
          הריביות ש{{ policy.name }} היה מציע:
          <span v-for="(t, k) in verdict.finalTracks" :key="k" class="me-2 inline-block">{{ KIND_HE[t.kind] }} <span dir="ltr">{{ Number(t.rate).toFixed(2) }}%</span><span v-if="k < verdict.finalTracks.length - 1">,</span></span>
        </p>
        <p class="mt-2 text-body-m text-n800"><strong>מה התיק לא אומר לחתם:</strong> {{ file.unseen }}</p>
      </div>
    </div>

    <!-- The end of the day. -->
    <div v-if="allDone" class="mt-4 rounded-md border-s-4 border-teal-deep bg-n50 p-4" aria-live="polite">
      <p class="text-body-l font-semibold text-n900">סוף היום: {{ rightCount }} מתוך {{ files.length }} החלטות מדויקות.</p>
      <p class="mt-1 text-body-m text-n800">שימו לב כמה מההחלטות נקבעו על ידי מספר אחד שנמצא קרוב לקו, ומה קרה לשני תיקים שנראים דומים אבל נמצאים משני צדדיו.</p>
      <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" @click="reset">להתחיל את היום מחדש</button>
    </div>

    <button type="button" class="mt-4 block min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-1 pe-3 text-start font-semibold">תיק</th>
            <th class="py-1 pe-3 text-start font-semibold">שיעור מימון</th>
            <th class="py-1 pe-3 text-start font-semibold">יחס החזר</th>
            <th class="py-1 pe-3 text-start font-semibold">הכללים קובעים</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in files" :key="f.id" class="border-b border-n100 align-top">
            <td class="py-1 pe-3 font-semibold text-n900">{{ f.title }}</td>
            <td class="py-1 pe-3"><span dir="ltr">{{ pct(verdicts[i].ltv) }}%</span></td>
            <td class="py-1 pe-3"><span dir="ltr">{{ pct(verdicts[i].ratio) }}%</span></td>
            <td class="py-1 pe-3">{{ !answers[i].checked ? "עוד לא נבדק" : verdicts[i].decision === "refuse" ? `סירוב (${reasonLines(verdicts[i]).map((l) => LINE_HE[l.id]).join(", ")})` : verdicts[i].relief.isZero() ? "אישור, במחירון" : `אישור, הנחה של ${pts(verdicts[i].relief.toString())} נקודות אחוז` }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
