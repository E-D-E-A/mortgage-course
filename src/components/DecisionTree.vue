<script setup lang="ts">
// Lesson 8.6: the two levels of decision variables. Level 1 positions the request (extra equity, closing the car loan, a parent as a
// borrower, which bank); level 2 builds the mix (shares and terms). Level 2 can only split what level 1 left. The component builds
// the candidate, checks it against the hard constraints of lesson 8.7's module, and counts the choices. A TEACHING MODEL: not
// implemented in Mogi's code. Computed by case-s8.ts and constraints.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { evaluate } from "../lib/calc/constraints.ts";
import { formatWholeShekels } from "../lib/calc/money.ts";
import { BASE_CHOICE, KIND_NAME_HE, LEVEL1, LEVEL2, S8_BANKS, candidateOf, countChoices, countShapes, loanOfChoice, type ShapePart } from "../data/case-s8.ts";

defineProps<{ note?: string }>();

const choice = ref({ ...BASE_CHOICE });
const presets: { name: string; shape: (years: number) => ShapePart[] }[] = [
  { name: "שליש־שליש", shape: (y) => [{ kind: "prime", share: 30, years: y }, { kind: "variable_unlinked", share: 30, years: y }, { kind: "fixed_unlinked", share: 40, years: y }] },
  { name: "חצי קבועה, חצי פריים", shape: (y) => [{ kind: "fixed_unlinked", share: 50, years: y }, { kind: "prime", share: 50, years: y }] },
  { name: "קבועה בלבד", shape: (y) => [{ kind: "fixed_unlinked", share: 100, years: y }] },
  { name: "בעיקר משתנה", shape: (y) => [{ kind: "fixed_unlinked", share: 20, years: y }, { kind: "prime", share: 40, years: y }, { kind: "variable_unlinked", share: 40, years: y }] },
];
const presetIx = ref(0);
const years = ref(30);
const shape = computed(() => presets[presetIx.value].shape(years.value));
const cand = computed(() => candidateOf("tree", choice.value, shape.value));
const ev = computed(() => evaluate(cand.value));
const loan = computed(() => loanOfChoice(choice.value));
const bankName = computed(() => S8_BANKS.find((b) => b.id === choice.value.bank)?.name ?? "");
const shapes = countShapes(LEVEL2.kinds.length, LEVEL2.shareStep, LEVEL2.years.length);
const choices = countChoices();
const checkName: Record<string, string> = {
  sum_equals_loan: "סכום המסלולים", positive_tracks: "מסלולים חיוביים", equity_available: "ההון העצמי קיים", ltv: "שיעור מימון", pti: "יחס החזר (329)",
  variable_share: "שליש קבוע", term: "30 שנה", bank_ratio: "יחס החזר (הבנק)", bank_ltv: "מימון (הבנק)", client_max_payment: "החזר מרבי של הלקוח", client_target_ratio: "יעד יחס ההחזר",
};
const fmt = new Intl.NumberFormat("he-IL");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">תיק נועם ושירה (בדוי, נתונים סינתטיים). שתי רמות של משתני החלטה: הרמה השנייה מחלקת רק את ההלוואה שהרמה הראשונה השאירה.</p>

    <section class="mt-4 rounded-md border border-n200 p-4">
      <h3 class="text-h3 text-navy">רמה 1 · מיצוב הבקשה</h3>
      <div class="mt-3 grid gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">הון עצמי נוסף מהחסכונות</span>
          <select v-model="choice.extraEquity" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-3"><option v-for="v in LEVEL1.extraEquity" :key="v" :value="v">{{ formatWholeShekels(v) }}</option></select></label>
        <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">לאיזה בנק פונים</span>
          <select v-model="choice.bank" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-3"><option v-for="b in S8_BANKS" :key="b.id" :value="b.id">{{ b.name }}</option></select></label>
        <label class="flex min-h-[44px] items-center gap-2"><input v-model="choice.closeCar" type="checkbox" /><span>לסגור את הלוואת הרכב לפני הבקשה</span></label>
        <label class="flex min-h-[44px] items-center gap-2"><input v-model="choice.parent" type="checkbox" /><span>הורה מצטרף כלווה</span></label>
      </div>
      <p class="mt-3 text-body-m text-n800">מה שנשאר לרמה 2: הלוואה של <strong><span class="ltr">{{ formatWholeShekels(loan) }}</span></strong>, בבנק {{ bankName }}.</p>
    </section>

    <div class="my-2 text-center text-n600" aria-hidden="true">↓ הרמה השנייה מחלקת את זה</div>

    <section class="rounded-md border border-n200 p-4">
      <h3 class="text-h3 text-navy">רמה 2 · מבנה התמהיל</h3>
      <div class="mt-3 grid gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">חלוקה בין המסלולים</span>
          <select v-model.number="presetIx" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-3"><option v-for="(p, k) in presets" :key="k" :value="k">{{ p.name }}</option></select></label>
        <label class="flex flex-col gap-1"><span class="text-caption font-semibold text-n600">תקופה לכל מסלול (שנים)</span>
          <select v-model.number="years" class="min-h-[44px] rounded-md border border-n300 bg-n0 px-3"><option v-for="y in [20, 25, 30, 32]" :key="y" :value="y">{{ y }}</option></select></label>
      </div>
      <ul class="list-reset mt-3 space-y-1 text-body-m">
        <li v-for="t in cand.tracks" :key="t.kind" class="flex flex-wrap justify-between gap-2 border-b border-n100 py-1"><span>{{ KIND_NAME_HE[t.kind] }} · <span class="ltr">{{ t.months / 12 }}</span> שנים</span><span class="ltr font-semibold">{{ formatWholeShekels(t.amount) }} · {{ t.rate }}%</span></li>
      </ul>
    </section>

    <section class="mt-4 rounded-md p-4" :class="ev.feasible ? 'bg-success-bg' : 'bg-warning-bg'" aria-live="polite">
      <p class="font-semibold text-n900">{{ ev.feasible ? "המועמד עומד בכל האילוצים הקשיחים" : `המועמד נפסל: ${ev.reasons.length} ${ev.reasons.length === 1 ? "סיבה" : "סיבות"}` }}</p>
      <ul v-if="!ev.feasible" class="list-reset mt-1 flex flex-wrap gap-2"><li v-for="r in ev.reasons" :key="r.id" class="rounded-full border border-n300 bg-n0 px-3 py-1 text-caption text-n800">{{ checkName[r.id] }}</li></ul>
      <p class="mt-1 text-caption text-n700">האילוצים הקשיחים הם נושא השיעור הבא; כאן רק רואים שבחירה ברמה 1 משנה מה אפשר ברמה 2.</p>
    </section>

    <dl class="mt-4 grid gap-3 sm:grid-cols-3">
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">צירופים ברמה 1</dt><dd class="text-h2 text-navy"><span class="ltr">{{ fmt.format(choices) }}</span></dd></div>
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">מבנים אפשריים ברמה 2</dt><dd class="text-h2 text-navy"><span class="ltr">{{ fmt.format(shapes) }}</span></dd></div>
      <div class="rounded-md bg-n50 p-3"><dt class="text-caption text-n600">מועמדים בסך הכול</dt><dd class="text-h2 text-navy"><span class="ltr">{{ fmt.format(choices * shapes) }}</span></dd></div>
    </dl>
    <p class="mt-2 text-caption text-n600">ספירה במרחב הקטן של ההדגמה: שלושה סוגי מסלול, שלב של 10% בחלוקה, שלוש תקופות לכל מסלול. בפועל המרחב גדול בהרבה (שיעור 8.13). {{ note }}</p>
  </div>
</template>
