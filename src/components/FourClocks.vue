<script setup lang="ts">
// Lesson 6.6's illustration: the four clocks that run while a family waits for the banks.
//   1. The answer clock: each bank answers a request within 5 business days (7 for a loan type it
//      defined in advance) — the team's transcription of Directive 451, not verified.
//   2. The validity clock: the terms hold at least 24 calendar days (12 with no new lien) from EACH
//      bank's own approval — the same source and status.
//   3. The market clock: the Bank of Israel's decision dates (lesson 0.10), when prime moves.
//   4. The round clock: how long a re-pricing round takes. NOBODY KNOWS this (Brain J-100): the
//      lesson fixes 3 business days and 7 spare days as the exercise's rule, and says so.
// The learner moves each bank's answer time and whether a new lien is registered, sets today, and
// sees the timeline, the clock that governs, how many rounds still fit, and (below) what a prime
// that moves, or a fixed rate that comes back different after the terms lapse, would do to the
// first payment of the family's mix. Every date and shekel figure comes from src/lib/calc
// (outreach.ts, process.ts, sensitivity.ts); the page passes the rules in as props.
import { computed, reactive, ref } from "vue";
import { formatShekelsText } from "../lib/calc/money.ts";
import { ANSWER_DAYS, ANSWER_DAYS_EXTENDED, bankClocks, effectOf, eventsInside, governingIndex, latestRoundStart, roundsThatFit } from "../lib/calc/outreach.ts";
import { addCalendarDays, calendarDaysBetween, type BankCalendar } from "../lib/calc/process.ts";
import type { TrackSpec } from "../lib/calc/schedule.ts";
import { scenarioFrom, type ScenarioSpec } from "../lib/calc/sensitivity.ts";

interface BankIn {
  id: string;
  name: string;
  answeredAfter: number;
  newLien: boolean;
}
const props = defineProps<{
  banks: BankIn[];
  request: string;
  today: string;
  decisions: string[];
  closed: string[];
  roundDays: number;
  reserve: number;
  tracks: TrackSpec[];
  scenario: ScenarioSpec;
  minDate: string;
  maxDate: string;
  /** Under the timeline: where the rules come from and how sure we are. */
  note: string;
}>();

const request = ref(props.request);
const answered = reactive<Record<string, number>>(Object.fromEntries(props.banks.map((b) => [b.id, b.answeredAfter])));
const lien = reactive<Record<string, boolean>>(Object.fromEntries(props.banks.map((b) => [b.id, b.newLien])));
const offset = ref(calendarDaysBetween(props.request, props.today));
const target = ref<string>("auto");
const primeMove = ref(0);
const lapseMove = ref(0);
const showTable = ref(false);

const calendar = computed<BankCalendar>(() => ({ fridayCounts: true, closed: props.closed }));
const valid = computed(() => /^\d{4}-\d{2}-\d{2}$/.test(request.value) && request.value >= props.minDate && request.value <= props.maxDate);

const clocks = computed(() =>
  valid.value
    ? props.banks.map((b) => bankClocks({ name: b.name, requested: request.value, answeredAfter: answered[b.id], extended: answered[b.id] > ANSWER_DAYS, newLien: lien[b.id] }, calendar.value))
    : [],
);
const today = computed(() => (valid.value ? addCalendarDays(request.value, offset.value) : ""));
const governing = computed(() => (clocks.value.length ? governingIndex(clocks.value) : -1));
const chosen = computed(() => {
  if (!clocks.value.length) return -1;
  if (target.value === "auto") return governing.value;
  const k = props.banks.findIndex((b) => b.id === target.value);
  return k < 0 ? governing.value : k;
});
const roundStart = computed(() => (chosen.value < 0 ? "" : today.value > clocks.value[chosen.value].approved ? today.value : clocks.value[chosen.value].approved));
const rounds = computed(() => (chosen.value < 0 ? [] : roundsThatFit(roundStart.value, clocks.value[chosen.value].validUntil, props.roundDays, props.reserve, calendar.value)));
const latest = computed(() => (chosen.value < 0 ? null : latestRoundStart(clocks.value[chosen.value].validUntil, props.roundDays, props.reserve, roundStart.value, calendar.value)));
const inside = computed(() => (chosen.value < 0 ? [] : eventsInside(props.decisions, today.value, clocks.value[chosen.value].validUntil)));

// The timeline's axis: from the request to two days after the last terms end.
const axisEnd = computed(() => (clocks.value.length ? addCalendarDays(clocks.value.map((c) => c.validUntil).sort().at(-1) as string, 2) : request.value));
const span = computed(() => Math.max(1, calendarDaysBetween(request.value, axisEnd.value)));
const at = (iso: string) => (calendarDaysBetween(request.value, iso) / span.value) * 100;
const seg = (from: string, to: string) => ({ insetInlineStart: `${Math.max(0, at(from))}%`, width: `${Math.max(0.8, at(to) - at(from))}%` });
const mark = (iso: string) => ({ insetInlineStart: `${at(iso)}%` });
const marks = computed(() => props.decisions.filter((x) => at(x) >= 0 && at(x) <= 100));

const dateLong = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long" });
const dateShort = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" });
const when = (iso: string) => new Date(`${iso}T12:00:00Z`);
const long = (iso: string) => (iso ? dateLong.format(when(iso)) : "");
const short = (iso: string) => (iso ? dateShort.format(when(iso)) : "");
const left = (c: { validUntil: string }) => calendarDaysBetween(today.value, c.validUntil);
const leftText = (n: number) => (n < 0 ? "נגמר" : n === 0 ? "היום האחרון" : n === 1 ? "נשאר יום אחד" : n === 2 ? "נשארו יומיים" : `נשארו ${n} ימים`);

// The rate panel.
const spec = computed(() => scenarioFrom(props.scenario));
const primeEffect = computed(() => effectOf(props.tracks, spec.value, { target: "prime", points: String(primeMove.value) }));
const lapseEffect = computed(() => effectOf(props.tracks, spec.value, { target: "fixed_unlinked", points: String(lapseMove.value) }));
const signed = (v: { toString(): string; isNegative(): boolean; isZero(): boolean }) => (v.isZero() ? "0 ₪" : `${v.isNegative() ? "−" : "+"}${formatShekelsText(v.toString().replace("-", ""))}`);
const pts = (n: number) => (n === 0 ? "0" : `${n > 0 ? "+" : "−"}${Math.abs(n)}`);
const limit = (id: string) => (answered[id] > ANSWER_DAYS ? ANSWER_DAYS_EXTENDED : ANSWER_DAYS);
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <ul class="list-reset flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא: ארבעת השעונים">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-6 rounded-sm border-2 border-dashed border-n600"></span>1. שעון התשובה: מהבקשה עד שהבנק ענה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-6 rounded-sm bg-teal-deep"></span>2. שעון התוקף: מהאישור של אותו בנק</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-0 border-s-2 border-dashed border-navy"></span>3. שעון השוק: החלטת ריבית</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-6 rounded-sm bg-turquoise-2"></span>4. שעון הסבבים (הכלל של התרגיל)</li>
    </ul>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">הבקשות נשלחו ב־</span>
        <input
          v-model="request"
          type="date"
          :min="minDate"
          :max="maxDate"
          class="h-11 rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900 outline-none focus:border-turquoise-2 focus:shadow-ring-input"
        />
        <span class="text-caption text-n700">{{ valid ? long(request) : "בחרו תאריך בטווח של לוח החגים שבידינו." }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">היום: {{ offset }} ימים אחרי שנשלחו הבקשות<span v-if="valid"> ({{ short(today) }})</span></span>
        <input v-model.number="offset" type="range" min="0" max="40" step="1" />
      </label>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div v-for="b in banks" :key="b.id" class="rounded-md border border-n200 p-2">
        <p class="text-body-m font-semibold text-n900">{{ b.name }}</p>
        <label class="mt-1 flex flex-col gap-1">
          <span class="text-caption text-n700">ענה אחרי {{ answered[b.id] }} ימי עסקים<span v-if="answered[b.id] > ANSWER_DAYS">: סוג הלוואה שהבנק הגדיר מראש</span></span>
          <input v-model.number="answered[b.id]" type="range" min="1" :max="ANSWER_DAYS_EXTENDED" step="1" :aria-label="`${b.name}: ימי עסקים עד התשובה, עד ${limit(b.id)}`" />
        </label>
        <label class="flex min-h-11 items-center gap-2 text-caption text-n800"><input v-model="lien[b.id]" type="checkbox" class="h-5 w-5 shrink-0" /> נרשם שעבוד חדש</label>
      </div>
    </div>

    <template v-if="valid">
      <div class="mt-5">
        <div
          class="relative"
          role="img"
          :aria-label="`ציר זמן: ${clocks.map((c) => `${c.name} ענה ב־${short(c.approved)}, התנאים עד ${short(c.validUntil)}`).join('; ')}. ${governing >= 0 ? `הקובע: ${clocks[governing].name}.` : ''}`"
        >
          <div class="grid gap-3">
            <div v-for="(c, k) in clocks" :key="c.name">
              <p class="mb-1 flex flex-wrap items-center gap-2 text-caption text-n800">
                <span class="font-semibold text-n900">{{ c.name }}</span>
                <span v-if="k === governing" class="rounded-pill bg-navy px-2 py-0.5 text-micro font-semibold text-n0">הקובע</span>
                <span>{{ short(c.approved) }} ← <span class="font-semibold">{{ short(c.validUntil) }}</span> · {{ leftText(left(c)) }}</span>
              </p>
              <div class="relative h-6 rounded-sm bg-n100">
                <span class="absolute inset-y-0 rounded-sm border-2 border-dashed border-n600" :style="seg(request, c.approved)"></span>
                <span class="absolute inset-y-0 rounded-sm bg-teal-deep" :class="k === governing ? 'outline outline-2 outline-offset-1 outline-navy' : ''" :style="seg(c.approved, c.validUntil)"></span>
                <span v-for="d in marks" :key="d" class="pointer-events-none absolute -inset-y-1 w-0 border-s-2 border-dashed border-navy" :style="mark(d)" aria-hidden="true"></span>
                <span class="pointer-events-none absolute -inset-y-1 w-0 border-s-4 border-warning" :style="mark(today)" aria-hidden="true"></span>
              </div>
            </div>
            <div>
              <p class="mb-1 text-caption text-n800">
                <span class="font-semibold text-n900">סבבי מיקוח מול {{ chosen >= 0 ? clocks[chosen].name : "" }}</span>
                · נכנסים {{ rounds.length }}
              </p>
              <div class="relative h-6 rounded-sm bg-n100">
                <template v-for="(r, k) in rounds" :key="k">
                  <span class="absolute inset-y-0 rounded-sm bg-turquoise-2" :style="seg(r.start, r.answer)"></span>
                  <span class="absolute inset-y-1 rounded-sm bg-n300" :style="seg(r.answer, addCalendarDays(r.answer, reserve))"></span>
                </template>
                <span v-for="d in marks" :key="d" class="pointer-events-none absolute -inset-y-1 w-0 border-s-2 border-dashed border-navy" :style="mark(d)" aria-hidden="true"></span>
                <span class="pointer-events-none absolute -inset-y-1 w-0 border-s-4 border-warning" :style="mark(today)" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-caption text-n700" aria-hidden="true">
          <span>{{ short(request) }}: הבקשות</span>
          <span v-for="d in marks" :key="d">החלטת ריבית: {{ short(d) }}</span>
          <span class="font-semibold text-n900">קו כתום: היום ({{ short(today) }})</span>
        </div>
      </div>

      <dl class="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div class="rounded-md border border-n200 p-3">
          <dt class="text-caption font-semibold text-n600">השעון שקובע: כל עוד רוצים את כל האישורים בחיים</dt>
          <dd class="text-body-l font-semibold text-navy">{{ clocks[governing].name }}, עד {{ long(clocks[governing].validUntil) }}</dd>
          <dd class="text-caption text-n700">{{ leftText(left(clocks[governing])) }}. הקובע הוא מי שהתנאים שלו נגמרים ראשונים, לא בהכרח מי שענה ראשון.</dd>
        </div>
        <div class="rounded-md border border-n200 p-3">
          <dt class="text-caption font-semibold text-n600">מול איזה בנק מנהלים סבבים</dt>
          <dd>
            <select v-model="target" class="mt-1 h-11 w-full rounded-md border border-n200 bg-n0 px-2 text-body-m text-n900" aria-label="הבנק שמולו מנהלים סבבים">
              <option value="auto">הבנק הקובע ({{ clocks[governing].name }})</option>
              <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </dd>
        </div>
        <div class="rounded-md border border-n200 p-3">
          <dt class="text-caption font-semibold text-n600">סבבים שנכנסים ({{ roundDays }} ימי עסקים כל אחד, {{ reserve }} ימים ספייר אחרי התשובה)</dt>
          <dd class="text-body-l font-semibold text-n900">{{ rounds.length }}</dd>
          <dd class="text-caption text-n700">
            <template v-if="latest">היום האחרון לבקש סבב: {{ long(latest) }}.</template>
            <template v-else>אין יום שבו סבב עוד נכנס.</template>
          </dd>
        </div>
        <div class="rounded-md border border-n200 p-3">
          <dt class="text-caption font-semibold text-n600">החלטות ריבית בתוך החלון (מהיום ועד סוף התנאים)</dt>
          <dd class="text-body-l font-semibold text-n900">{{ inside.length }}</dd>
          <dd class="text-caption text-n700"><template v-if="inside.length">{{ inside.map(long).join("; ") }}</template><template v-else>אין.</template></dd>
        </div>
      </dl>

      <div class="mt-5 rounded-md bg-n50 p-4">
        <p class="text-body-l font-semibold text-n900">ריבית שזזה בזמן ההמתנה: מה זה עושה להחזר הראשון</p>
        <p class="mt-1 text-caption text-n700">התמהיל שביקשו נועם ושירה, במחירים של בנק א׳ (דוגמה לימודית, לא הצעה של בנק).</p>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="flex flex-col gap-1">
              <span class="text-caption font-semibold text-n600">הפריים זז ב־<span class="ltr">{{ pts(primeMove) }}</span> נקודות אחוז</span>
              <input v-model.number="primeMove" type="range" min="-0.5" max="0.5" step="0.25" aria-label="הזזת הפריים בנקודות אחוז" />
            </label>
            <p class="mt-2 text-body-m text-n800">
              ההחזר הראשון של מסלול הפריים: <span class="font-semibold"><span class="ltr">{{ signed(primeEffect.deltaFirst) }}</span></span> בחודש.
            </p>
            <p class="text-caption text-n700">אם הפריים נשאר שם כל ההלוואה: <span class="ltr">{{ signed(primeEffect.deltaTotal) }}</span> בסך התשלומים.</p>
          </div>
          <div>
            <label class="flex flex-col gap-1">
              <span class="text-caption font-semibold text-n600">הריבית הקבועה חוזרת אחרי שהתנאים נגמרו: <span class="ltr">{{ pts(lapseMove) }}</span> נקודות אחוז</span>
              <input v-model.number="lapseMove" type="range" min="-0.4" max="0.4" step="0.1" aria-label="שינוי הריבית הקבועה אחרי שהתנאים נגמרו" />
            </label>
            <p class="mt-2 text-body-m text-n800">
              ההחזר הראשון של המסלול הקבוע: <span class="font-semibold"><span class="ltr">{{ signed(lapseEffect.deltaFirst) }}</span></span> בחודש.
            </p>
            <p class="text-caption text-n700">בסך התשלומים: <span class="ltr">{{ signed(lapseEffect.deltaTotal) }}</span>. אם ומה ישתנה בפועל: לא ידוע.</p>
          </div>
        </div>
      </div>
    </template>
    <p v-else class="mt-4 text-body-m text-n700">בחרו תאריך בטווח של לוח החגים שבידינו.</p>

    <p class="mt-3 text-caption text-n600">{{ note }}</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable && valid" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-caption sm:text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-2 text-start">הבנק</th>
            <th class="py-2 pe-2 text-start">היום האחרון לתשובה</th>
            <th class="py-2 pe-2 text-start">ענה</th>
            <th class="py-2 pe-2 text-start">התנאים עד</th>
            <th class="py-2 text-start">ימים שנשארו</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, k) in clocks" :key="c.name" class="border-b border-n100">
            <td class="py-1 pe-2 font-semibold text-n900">{{ c.name }}<span v-if="k === governing"> (הקובע)</span></td>
            <td class="py-1 pe-2">{{ long(c.answerBy) }}</td>
            <td class="py-1 pe-2">{{ long(c.approved) }}</td>
            <td class="py-1 pe-2">{{ long(c.validUntil) }}</td>
            <td class="py-1">{{ left(c) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
