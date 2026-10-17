<script setup lang="ts">
// Lesson 9.2's illustration: the comparison of case A's offers. The learner picks what is asked (the plan's request, or one of
// the three alternatives for the three goals), the bank (one of four FICTIONAL banks, with the exercise's invented rules), and the
// scenario (the Directive 451 forecast as the base, the stress scenario, the macro path). The card shows what the bank would do
// (decision, relief, rates), and the numbers of the chosen scenario, each labelled by what kind of number it is: an offer's rates, a
// scenario's payments, a calculation on the request. It never picks a winner: "which is best" depends on what the family wants.
// Every number is computed by src/lib/calc/casefile.ts (which composes bankpolicy.ts, engine.ts, scenarios.ts, affordability.ts).
import { computed, ref } from "vue";
import { BANK_IDS, BANK_NAME, type BankId } from "../data/case-a-offers.ts";
import { FINAL_LABEL, LIVING_BUDGET } from "../data/case-a-final.ts";
import { ALTERNATIVES, SCENARIOS3, WINDOW_MONTHS, type OfferSource, incomeSheet, offerAt, planOf } from "../lib/calc/casefile.ts";
import { formatShekels, formatWholeShekels } from "../lib/calc/money.ts";
import { percentString } from "../lib/calc/percent.ts";
import type { ScenarioId } from "../lib/calc/scenarios.ts";
import { save } from "../lib/progress.ts";
import { KIND_NAME_HE } from "../data/case-a-mix.ts";

const props = defineProps<{ id: string }>();

const sources: { id: OfferSource; name: string; note: string }[] = [
  { id: "request", name: "הבקשה של התוכנית", note: "שלושה מסלולים, 30 שנה" },
  ...ALTERNATIVES.map((a) => ({ id: a.id as OfferSource, name: `${a.goalHe}: ${a.nameHe}`, note: a.noteHe })),
];
const src = ref<OfferSource>("request");
const bank = ref<BankId>("a");
const scn = ref<ScenarioId>("forecast451");
const showTable = ref(false);

const sheet = incomeSheet();
const plan = planOf();
const offer = computed(() => offerAt(src.value, bank.value));
const reading = computed(() => offer.value.readings?.[scn.value] ?? null);
const scnName = computed(() => SCENARIOS3.find((s) => s.id === scn.value)?.nameHe ?? "");
const pct = (d: { toString(): string }) => `${percentString(d as never)}%`;
const money = (d: { toString(): string }) => formatShekels(d as never);
const whole = (d: { toString(): string }) => formatWholeShekels(d as never);
const refuseWhy = computed(() =>
  offer.value.verdict.lines.filter((l) => l.outcome === "refuse").map((l) => (l.id === "ratio" ? `יחס החזר ${pct(l.actual)}, מעל ${l.max}%` : `שיעור מימון ${pct(l.actual)}, מעל ${l.max}%`)),
);
const over40 = computed(() => offer.value.verdict.ratio.gt(40));
const rows = computed(() =>
  sources.flatMap((s) =>
    BANK_IDS.map((b) => {
      const o = offerAt(s.id, b);
      const r = o.readings?.[scn.value] ?? null;
      return { source: s, bank: b, o, r };
    }),
  ),
);
function remember() {
  save(`exercise:${props.id}`, { src: src.value, bank: bank.value, scn: scn.value });
}
const kindTag = "inline-block rounded-pill bg-n100 px-2 py-0.5 text-caption font-semibold text-n700";
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-3 shadow-sm sm:p-5">
    <p class="text-caption text-n600">{{ FINAL_LABEL }} הבנקים בדויים וכללי ההחלטה שלהם הם כללי תרגיל.</p>

    <div v-if="!showTable">
      <fieldset class="mt-3">
        <legend class="text-caption font-semibold text-n600">מה מבקשים?</legend>
        <div class="mt-1 grid gap-2 sm:grid-cols-2">
          <label
            v-for="s in sources"
            :key="s.id"
            class="flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
            :class="src === s.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          >
            <input v-model="src" type="radio" :name="`${id}-src`" :value="s.id" class="mt-1 accent-teal-deep" @change="remember" />
            <span>{{ s.name }}<span class="block text-caption text-n600">{{ s.note }}</span></span>
          </label>
        </div>
      </fieldset>

      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <fieldset>
          <legend class="text-caption font-semibold text-n600">איזה בנק?</legend>
          <div class="mt-1 flex flex-wrap gap-2">
            <label
              v-for="b in BANK_IDS"
              :key="b"
              class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
              :class="bank === b ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
            >
              <input v-model="bank" type="radio" :name="`${id}-bank`" :value="b" class="accent-teal-deep" @change="remember" />
              {{ BANK_NAME[b] }}
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend class="text-caption font-semibold text-n600">איזה תרחיש?</legend>
          <div class="mt-1 flex flex-wrap gap-2">
            <label
              v-for="s in SCENARIOS3"
              :key="s.id"
              class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
              :class="scn === s.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
            >
              <input v-model="scn" type="radio" :name="`${id}-scn`" :value="s.id" class="accent-teal-deep" @change="remember" />
              {{ s.nameHe }}
            </label>
          </div>
        </fieldset>
      </div>

      <div class="mt-4 rounded-md border p-4" :class="offer.approved ? 'border-n200 bg-n50' : 'border-danger bg-danger-bg'" aria-live="polite">
        <p class="!mt-0 text-body-l font-semibold text-n900">
          {{ BANK_NAME[bank] }}: {{ offer.approved ? "מאשר" : "מסרב" }}
          <span v-if="offer.approved && !offer.verdict.relief.isZero()"> · הנחה של <span class="ltr">{{ offer.verdict.relief.toString() }}</span> {{ offer.verdict.relief.lt(1) ? "נקודת אחוז" : "נקודות אחוז" }}</span>
          <span v-else-if="offer.approved"> · לפי המחירון</span>
        </p>
        <p v-if="!offer.approved" class="mt-1 text-body-m text-n800">הסיבה: {{ refuseWhy.join(" וגם ") }}. בנק שמסרב לא נותן מחיר, ולכן אין כאן מספרים.</p>

        <template v-else-if="reading">
          <p class="mt-2 text-body-m text-n800">
            <span :class="kindTag">אומדן</span>
            הריביות:
            <template v-for="(t, k) in offer.tracks" :key="k">
              <span v-if="k > 0"> · </span>{{ KIND_NAME_HE[t.kind] }} <span class="ltr">{{ t.rate }}%</span> על <span class="ltr">{{ whole(t.amount) }}</span>, {{ t.months / 12 }} שנה
            </template>
          </p>

          <dl class="mt-3 grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-n200 bg-n0 p-3">
              <dt class="text-caption font-semibold text-n600"><span :class="kindTag">תרחיש: {{ scnName }}</span></dt>
              <dd class="mt-1 text-body-m text-n800">
                החזר ראשון <strong class="text-n900 ltr">{{ money(reading.first) }}</strong><br />
                הגבוה ביותר ב־{{ WINDOW_MONTHS / 12 }} השנים הראשונות <strong class="text-n900 ltr">{{ money(reading.max60) }}</strong><br />
                הגבוה ביותר בכל התקופה <strong class="text-n900 ltr">{{ money(reading.max) }}</strong><br />
                סך כל התשלומים <strong class="text-n900 ltr">{{ money(reading.total) }}</strong>
              </dd>
            </div>
            <div class="rounded-md border border-n200 bg-n0 p-3">
              <dt class="text-caption font-semibold text-n600"><span :class="kindTag">חישוב על הבקשה</span></dt>
              <dd class="mt-1 text-body-m text-n800">
                יחס החזר <strong class="text-n900 ltr">{{ pct(offer.verdict.ratio) }}</strong>
                <span v-if="over40" class="text-n700">, מעל הסף של 40%</span><br />
                שיעור מימון <strong class="text-n900 ltr">{{ pct(offer.verdict.ltv) }}</strong> (תקרה 75%)<br />
                החזר חודשי מרבי ב־40%: <strong class="text-n900 ltr">{{ money(sheet.max40) }}</strong><br />
                אחרי התוכנית נשארים בחסכונות <strong class="text-n900 ltr">{{ whole(plan.reserveAfter) }}</strong>
              </dd>
            </div>
            <div class="rounded-md border p-3" :class="reading.margin60.isNegative() || reading.marginFirst.isNegative() ? 'border-warning bg-warning-bg' : 'border-n200 bg-n0'">
              <dt class="text-caption font-semibold text-n600"><span :class="kindTag">תקציב המשפחה: {{ whole(LIVING_BUDGET) }}</span></dt>
              <dd class="mt-1 text-body-m text-n800">
                נשאר מעל התקציב בחודש הראשון <strong class="text-n900 ltr">{{ money(reading.marginFirst) }}</strong><br />
                וב{{ WINDOW_MONTHS / 12 }} השנים הראשונות, בחודש הכבד ביותר <strong class="text-n900 ltr">{{ money(reading.margin60) }}</strong>
              </dd>
            </div>
            <div class="rounded-md border border-n200 bg-n0 p-3">
              <dt class="text-caption font-semibold text-n600"><span :class="kindTag">חשיפה</span></dt>
              <dd class="mt-1 text-body-m text-n800">
                בכמה ההחזר הגבוה ביותר בתרחיש הלחץ גבוה מההחזר הראשון בתרחיש הבסיס: <strong class="text-n900 ltr">{{ money(offer.rise ?? 0) }}</strong>
              </dd>
            </div>
          </dl>
        </template>
      </div>

      <p class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800">
        יחס ההחזר נמדד על הריביות במחירון, לפני ההנחה, וההחזר הראשון מחושב אחריה: כשיש הנחה, ההחזר הראשון חלקי ההכנסה הפנויה נמוך מהיחס. הכלי לא בוחר. ״הטוב ביותר״ תלוי במה שחשוב למשפחה: החזר חודשי נמוך, סך נמוך או שקט. אותם מספרים, והחלטה אחרת.
      </p>
    </div>

    <div v-else class="mt-3 overflow-x-auto">
      <p class="text-caption text-n600">תרחיש: {{ scnName }}. שורות שבנק מסרב בהן מסומנות.</p>
      <table class="mt-2 w-full border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">מה מבקשים</th>
            <th class="py-2 pe-3 text-start font-semibold">הבנק</th>
            <th class="py-2 pe-3 text-start font-semibold">החלטה</th>
            <th class="py-2 pe-3 text-start font-semibold">יחס החזר</th>
            <th class="py-2 pe-3 text-start font-semibold">החזר ראשון</th>
            <th class="py-2 pe-3 text-start font-semibold">סך תשלומים</th>
            <th class="py-2 pe-3 text-start font-semibold">מעל התקציב, בחודש הכבד</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="`${r.source.id}-${r.bank}`" class="border-b border-n100 align-top" :class="!r.o.approved ? 'bg-danger-bg' : ''">
            <td class="py-2 pe-3 font-semibold text-n900">{{ r.source.name }}</td>
            <td class="py-2 pe-3">{{ BANK_NAME[r.bank] }}</td>
            <td class="py-2 pe-3">{{ r.o.approved ? (r.o.verdict.relief.isZero() ? "מאשר" : `מאשר, הנחה של ${r.o.verdict.relief.toString()} נקודת אחוז`) : "מסרב" }}</td>
            <td class="py-2 pe-3"><span class="ltr">{{ pct(r.o.verdict.ratio) }}</span></td>
            <td class="py-2 pe-3"><span class="ltr whitespace-nowrap">{{ r.r ? money(r.r.first) : "—" }}</span></td>
            <td class="py-2 pe-3"><span class="ltr whitespace-nowrap">{{ r.r ? money(r.r.total) : "—" }}</span></td>
            <td class="py-2 pe-3"><span class="ltr whitespace-nowrap">{{ r.r ? money(r.r.margin60) : "—" }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <button type="button" class="min-h-11 text-body-m text-navy underline" @click="showTable = !showTable">{{ showTable ? "חזרה לכלי" : "הצגה כטבלה" }}</button>
    </div>
  </div>
</template>
