<script setup lang="ts">
// Lesson 9.1's illustration: the document checker. The file of case A (נועם ושירה) has ten example documents. For each one the
// learner marks (1) what state the evidence is in — ok, ok with a question, partial, missing — and (2) which claims of the file the
// document can support. The check compares them with the file (src/data/case-a-final.ts, derived by src/lib/calc/casefile.ts) and
// shows, for every document, what it shows, what it does not show, and what to ask for when something is open. It is a checklist, not
// a grade: the learner sees which marks agree with the file and which do not. Every number is computed by the calc modules.
// All documents are invented teaching props ("מסמך לדוגמה"); which documents a real bank asks for is field knowledge, awaiting Eylon.
import { computed, reactive, ref } from "vue";
import {
  CLAIMS,
  DOC_MARK,
  DOCUMENTS,
  EQUITY_PIECES,
  FILE,
  type ClaimId,
  type DocId,
  FINAL_LABEL,
  GAPS,
  PAYSLIPS,
  type State,
  STATE_HE,
  STATE_ORDER,
} from "../data/case-a-final.ts";
import { claimsOfDoc, depositChecks, docStates, financingSheet, incomeOf, statementRows } from "../lib/calc/casefile.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import { save } from "../lib/progress.ts";

const props = defineProps<{ id: string }>();

const truth = docStates();
const w = (x: { toString(): string } | string) => formatWholeShekels(String(x));

/** What can be seen in the document, in a sentence or two (numbers from the modules). */
const seen = computed<Record<DocId, string>>(() => {
  const noam = incomeOf("noam");
  const shira = incomeOf("shira");
  const rows = statementRows();
  const aug = depositChecks().find((c) => !c.gap.isZero());
  return {
    id: "שני בוגרים וילד אחד. השמות תואמים לתיק.",
    payslips_noam: `שכר נטו ${w(noam.rows[0].net)} בכל אחד משלושת החודשים. נטו לתשלום ${w(noam.rows[0].netToPay)}, אחרי דמי ועד.`,
    payslips_shira: `שכר נטו ${shira.rows.map((r) => w(r.net)).join(", ")}. בתלוש האחרון יש שורה שנקראת ״${PAYSLIPS.shira[2].oneOffLabel}״ (בערך ${w(shira.rows[2].oneOffNet)} נטו).`,
    statement: `המשכורות הופקדו בשלושת החודשים, והחיוב של הלוואת הרכב חוזר בכל חודש. היתרה בסוף ספטמבר ${w(rows[2].closing)}.${aug ? ` באוגוסט הופקדו לנועם ${w(aug.deposit)}, ובתלוש כתוב נטו לתשלום ${w(aug.netToPay)}.` : ""}`,
    credit: "הלוואה אחת רשומה על הלווים: הלוואת הרכב. אין חיובים שחזרו ואין פיגורים.",
    car: `החזר חודשי ${w(FILE.car.monthly)}, נשארו ${FILE.car.monthsLeft} תשלומים, ויתרת הסילוק ${w(FILE.carPayoff)}.`,
    tabu: "הנכס רשום על שם המוכר. אין משכנתא רשומה ואין הערות אזהרה.",
    contract: `המחיר בטיוטה ${w(FILE.price)}. הטיוטה עוד לא חתומה.`,
    gift: `${w(EQUITY_PIECES[2].declared)} מההורים, כתוב שזו מתנה ולא הלוואה, וההורים חתומים. ההעברה עוד לא הופיעה בדף החשבון.`,
    fund: "המסמך לא התקבל.",
  };
});

interface Mark {
  state: State | "";
  claims: ClaimId[];
}
const marks = reactive<Record<DocId, Mark>>(Object.fromEntries(DOCUMENTS.map((d) => [d.id, { state: "", claims: [] }])) as Record<DocId, Mark>);
const checked = ref(false);
const showTable = ref(false);

function toggle(doc: DocId, claim: ClaimId) {
  const list = marks[doc].claims;
  const k = list.indexOf(claim);
  if (k >= 0) list.splice(k, 1);
  else list.push(claim);
  checked.value = false;
}

const verdicts = computed(() =>
  DOCUMENTS.map((d) => {
    const m = marks[d.id];
    const real = claimsOfDoc(d.id);
    const missed = real.filter((c) => !m.claims.includes(c));
    const extra = m.claims.filter((c) => !real.includes(c));
    return { doc: d, real, stateOk: m.state === truth[d.id], claimsOk: missed.length === 0 && extra.length === 0, missed, extra, answered: m.state !== "" };
  }),
);
const stateHits = computed(() => verdicts.value.filter((v) => v.stateOk).length);
const claimHits = computed(() => verdicts.value.filter((v) => v.claimsOk).length);
const claimName = (c: ClaimId) => CLAIMS.find((x) => x.id === c)?.label ?? c;
const gapOf = (d: DocId) => GAPS.find((g) => g.doc === d);

function check() {
  checked.value = true;
  save(`exercise:${props.id}`, { done: stateHits.value === DOCUMENTS.length && claimHits.value === DOCUMENTS.length });
}

const equity = computed(() => ({
  declared: financingSheet("declared"),
  documented: financingSheet("documented"),
  verified: financingSheet("verified"),
}));
const pct = (d: { toString(): string }) => `${percentString(d as never)}%`;
const stateClass: Record<State, string> = {
  ok: "border-success bg-success-bg",
  question: "border-warning bg-warning-bg",
  partial: "border-info bg-info-bg",
  missing: "border-danger bg-danger-bg",
};
const dateHe = (iso: string | null) => (iso ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`)) : "לא התקבל");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5">
    <p class="text-caption text-n600">{{ FINAL_LABEL }} כל מסמך הוא ״{{ DOC_MARK }}״.</p>
    <p class="mt-2 text-body-m text-n800">
      לכל מסמך סמנו שני דברים: באיזה מצב הראיה שלו, ואילו טענות בתיק הוא יכול לתמוך בהן. אחרי הבדיקה תראו מה כתוב במסמך, מה הוא לא מוכיח ומה לבקש.
    </p>

    <div v-if="!showTable" class="mt-4 grid gap-3">
      <article v-for="d in DOCUMENTS" :key="d.id" class="rounded-md border border-n200 p-3" :aria-labelledby="`${id}-${d.id}`">
        <h3 :id="`${id}-${d.id}`" class="!mt-0 text-body-l font-semibold text-n900">{{ d.name }}</h3>
        <p class="text-caption text-n600">{{ d.received ? `תאריך: ${dateHe(d.date)}` : "המסמך לא התקבל" }}</p>
        <p v-if="marks[d.id].state !== '' || checked" class="mt-1 text-body-m text-n800"><strong class="text-n900">מה כתוב בו:</strong> {{ seen[d.id] }}</p>
        <p v-else class="mt-1 text-caption text-n600">בחרו קודם מצב, ואז יוצג מה כתוב במסמך.</p>

        <fieldset class="mt-3">
          <legend class="text-caption font-semibold text-n600">באיזה מצב הראיה?</legend>
          <div class="mt-1 flex flex-wrap gap-2">
            <label
              v-for="s in STATE_ORDER"
              :key="s"
              class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
              :class="marks[d.id].state === s ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
            >
              <input v-model="marks[d.id].state" type="radio" :name="`${id}-${d.id}-state`" :value="s" class="accent-teal-deep" @change="checked = false" />
              {{ STATE_HE[s] }}
            </label>
          </div>
        </fieldset>

        <fieldset class="mt-3">
          <legend class="text-caption font-semibold text-n600">אילו טענות הוא יכול לתמוך בהן?</legend>
          <div class="mt-1 flex flex-wrap gap-2">
            <button
              v-for="c in CLAIMS"
              :key="c.id"
              type="button"
              :aria-pressed="marks[d.id].claims.includes(c.id)"
              class="min-h-11 rounded-md border px-3 py-1 text-caption transition-colors duration-fast ease-out"
              :class="marks[d.id].claims.includes(c.id) ? 'border-turquoise-2 bg-mint/30 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
              @click="toggle(d.id, c.id)"
            >
              {{ c.label }}
            </button>
          </div>
        </fieldset>

        <div
          v-if="checked && verdicts.find((v) => v.doc.id === d.id)"
          class="mt-3 rounded-md border p-3 text-body-m text-n800"
          :class="stateClass[truth[d.id]]"
          aria-live="polite"
        >
          <template v-for="v in [verdicts.find((x) => x.doc.id === d.id)!]" :key="d.id">
            <p>
              <strong class="text-n900">המצב בתיק: {{ STATE_HE[truth[d.id]] }}.</strong>
              <template v-if="!v.answered"> לא סימנתם מצב.</template>
              <template v-else-if="v.stateOk"> סימנתם נכון.</template>
              <template v-else> סימנתם ״{{ STATE_HE[marks[d.id].state as State] }}״.</template>
            </p>
            <p class="mt-1">
              <strong class="text-n900">טענות:</strong>
              {{ v.real.map(claimName).join(", ") }}.
              <template v-if="v.claimsOk"> סימנתם נכון.</template>
              <template v-else>
                <template v-if="v.missed.length"> לא סימנתם: {{ v.missed.map(claimName).join(", ") }}.</template>
                <template v-if="v.extra.length"> סימנתם יותר מדי: {{ v.extra.map(claimName).join(", ") }}.</template>
              </template>
            </p>
            <p class="mt-1"><strong class="text-n900">מוכיח:</strong> {{ d.proves }}.</p>
            <p class="mt-1"><strong class="text-n900">לא מוכיח:</strong> {{ d.notProves }}.</p>
            <p v-if="gapOf(d.id)" class="mt-1"><strong class="text-n900">מה לבקש:</strong> {{ gapOf(d.id)!.ask }} (מ{{ gapOf(d.id)!.from }}).</p>
          </template>
        </div>
      </article>
    </div>

    <div v-else class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">המסמך</th>
            <th class="py-2 pe-3 text-start font-semibold">המצב בתיק</th>
            <th class="py-2 pe-3 text-start font-semibold">מה כתוב בו</th>
            <th class="py-2 pe-3 text-start font-semibold">מה הוא מוכיח</th>
            <th class="py-2 pe-3 text-start font-semibold">מה הוא לא מוכיח</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in DOCUMENTS" :key="d.id" class="border-b border-n100 align-top">
            <td class="py-2 pe-3 font-semibold text-n900">{{ d.name }}</td>
            <td class="py-2 pe-3">{{ STATE_HE[truth[d.id]] }}</td>
            <td class="py-2 pe-3">{{ seen[d.id] }}</td>
            <td class="py-2 pe-3">{{ d.proves }}</td>
            <td class="py-2 pe-3">{{ d.notProves }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        v-if="!showTable"
        type="button"
        class="h-11 rounded-md bg-turquoise px-5 text-body-m font-semibold text-navy transition-colors duration-fast ease-out hover:bg-teal-deep hover:text-n0 active:scale-[0.98] active:bg-turquoise-hover"
        @click="check"
      >
        בדיקה
      </button>
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="showTable = !showTable">{{ showTable ? "חזרה לסימון" : "הצגה כטבלה" }}</button>
      <span v-if="showTable" class="text-caption text-n600">בטבלה אין סימון ואין בדיקה: חזרו לסימון כדי לבדוק.</span>
    </div>

    <div v-if="checked && !showTable" class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800" aria-live="polite">
      <p>
        <strong class="text-n900">רשימת בדיקה, לא ציון.</strong>
        מסמכים שהסימון שלהם שונה מהתיק: מצב הראיה — {{ DOCUMENTS.length - stateHits }}, טענות — {{ DOCUMENTS.length - claimHits }}. כל אחד מהם מסומן למעלה.
      </p>
      <p class="mt-2">
        מה זה עושה להון העצמי: אם סופרים את כל מה שהוצהר, שיעור המימון <span class="ltr">{{ pct(equity.declared.ltv) }}</span>. אם סופרים גם את מה שיש עליו מסמך אבל הכסף עוד לא בחשבון, <span class="ltr">{{ pct(equity.documented.ltv) }}</span>. אם סופרים רק מה שאומת, <span class="ltr">{{ pct(equity.verified.ltv) }}</span>, מעל התקרה של <span class="ltr">{{ equity.declared.ceiling }}%</span>.
      </p>
    </div>

    <ul class="list-reset mt-3 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-success-bg ring-1 ring-success"></span>תקין</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-warning-bg ring-1 ring-warning"></span>תקין, עם שאלה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-info-bg ring-1 ring-info"></span>חלקי</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-sm bg-danger-bg ring-1 ring-danger"></span>חסר</li>
    </ul>
  </div>
</template>
