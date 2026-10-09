<script setup lang="ts">
// Lesson 0.10's illustration: the Bank of Israel rate decisions of 2026 on a
// timeline. The learner steps through the decisions and sees, for each, what was
// decided, the rate after it, the prime that follows (rate + 1.5 points) and how
// reliable the record is. Upcoming decisions are shown as dates only.
// The rows come from data/lessons/0-10.json (computed by lending.ts).
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { plainNumber } from "../lib/calc/indexation.ts";

interface Row {
  period: number;
  date: string;
  before: string;
  rate: string;
  change: string;
  prime: string;
}
const props = defineProps<{
  rows: Row[];
  upcoming: string[];
  /** Per decision date: how reliable the record is, shown under the decision. */
  notes: Record<string, string>;
  /** A note that applies to every decision. */
  note: string;
  /** The rate plus 1.5 points before the first decision (from the data file). */
  startPrime: string;
}>();

const selected = ref(props.rows.length - 1);
const row = computed(() => props.rows[selected.value]);
const showTable = ref(false);

const dateFormat = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
const shortFormat = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short" });
const when = (iso: string) => new Date(`${iso}T12:00:00Z`);
const longDate = (iso: string) => dateFormat.format(when(iso));
const shortDate = (iso: string) => shortFormat.format(when(iso));
function decided(r: Row): string {
  const c = new Decimal(r.change);
  if (c.isZero()) return "הריבית נשארה ללא שינוי";
  const size = plainNumber(c.abs());
  const unit = c.abs().lte(1) ? "נקודת אחוז" : "נקודות אחוז";
  return `${c.isNeg() ? "הורדה" : "העלאה"} של ${size} ${unit}`;
}

// Chart: 2026 from the right edge (January) to the left edge (December), as Hebrew is read.
const W = 640;
const H = 220;
const PAD = { side: 12, top: 18, bottom: 10 };
const yearStart = Date.UTC(2026, 0, 1);
const yearEnd = Date.UTC(2027, 0, 1);
const x = (iso: string) => W - PAD.side - ((when(iso).getTime() - yearStart) / (yearEnd - yearStart)) * (W - PAD.side * 2);
const top = computed(() => Decimal.max(...props.rows.map((r) => new Decimal(r.prime)), new Decimal(props.startPrime)).plus(0.5).toNumber());
const y = (v: string | number) => H - PAD.bottom - (Number(v) / top.value) * (H - PAD.top - PAD.bottom);

/** A step line: the level before the first decision from the year's start, then each decision's level until the next. */
function steps(key: "rate" | "prime", startLevel: string): string {
  let d = `M ${W - PAD.side} ${y(startLevel)}`;
  for (const r of props.rows) {
    d += ` H ${x(r.date)} V ${y(r[key])}`;
  }
  return `${d} H ${x(props.upcoming[0] ?? "2026-12-31")}`;
}
const months = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <ul class="flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-4 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ריבית בנק ישראל</li>
      <li class="flex items-center gap-2"><span class="inline-block h-1 w-4 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>הריבית ועוד 1.5 נקודות אחוז</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-3 rounded-pill border-2" style="border-color: var(--mogi-n500)"></span>החלטה שעוד לא התקבלה</li>
    </ul>

    <div class="mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-label="ציר זמן: החלטות הריבית של 2026">
        <line :x1="PAD.side" :x2="W - PAD.side" :y1="y(0)" :y2="y(0)" stroke="var(--mogi-n300)" />
        <path :d="steps('prime', startPrime)" fill="none" stroke="var(--mogi-turquoise-2)" stroke-width="3" />
        <path :d="steps('rate', rows[0].before)" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="3" />
        <g v-for="(r, i) in rows" :key="r.date">
          <line :x1="x(r.date)" :x2="x(r.date)" :y1="y(0)" :y2="y(r.rate)" stroke="var(--mogi-n200)" stroke-dasharray="3 4" />
          <circle
            :cx="x(r.date)"
            :cy="y(r.rate)"
            :r="i === selected ? 8 : 6"
            :fill="i === selected ? 'var(--mogi-navy)' : 'var(--mogi-teal-deep)'"
            stroke="var(--mogi-n0)"
            stroke-width="2"
            class="cursor-pointer"
            @click="selected = i"
          />
        </g>
        <circle v-for="d in upcoming" :key="d" :cx="x(d)" :cy="y(0) - 10" r="6" fill="var(--mogi-n0)" stroke="var(--mogi-n500)" stroke-width="2" />
      </svg>
      <div class="grid text-center text-caption text-n600" :style="{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', paddingInline: `${(PAD.side / W) * 100}%` }" aria-hidden="true">
        <span v-for="(m, i) in months" :key="m" :class="i % 2 ? 'max-sm:invisible' : ''">{{ m }}</span>
      </div>
    </div>

    <label class="mt-4 flex flex-col gap-1">
      <span class="text-caption font-semibold text-n600">בחרו החלטה (או לחצו על נקודה בגרף)</span>
      <input v-model.number="selected" type="range" min="0" :max="rows.length - 1" step="1" />
    </label>

    <div class="mt-3 rounded-md bg-n50 p-4" aria-live="polite">
      <p class="text-body-l font-semibold text-n900">{{ longDate(row.date) }}</p>
      <p class="mt-1 text-body-m text-n700">{{ decided(row) }}</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p class="text-caption text-n600">ריבית בנק ישראל אחרי ההחלטה</p>
          <p class="text-h2 text-navy"><span class="ltr">{{ row.rate }}%</span></p>
        </div>
        <div>
          <p class="text-caption text-n600">ועוד 1.5 נקודות אחוז</p>
          <p class="text-h2 text-navy"><span class="ltr">{{ row.prime }}%</span></p>
        </div>
      </div>
      <p v-if="notes[row.date]" class="mt-3 text-caption text-n700">{{ notes[row.date] }}</p>
      <p class="mt-1 text-caption text-n600">{{ note }}</p>
    </div>
    <p class="mt-3 text-body-m text-n700">
      ההחלטות הבאות שנקבעו ל־2026:
      <span v-for="(d, i) in upcoming" :key="d">{{ longDate(d) }}{{ i < upcoming.length - 1 ? " ו־" : "." }}</span>
      הן עוד לא התקבלו, ולכן אין להן ריבית בגרף.
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[28rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 text-start">תאריך</th>
            <th class="py-2 text-start">ההחלטה</th>
            <th class="py-2 text-start">הריבית אחרי</th>
            <th class="py-2 text-start">ועוד 1.5</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.date" class="border-b border-n100">
            <td class="py-1">{{ shortDate(r.date) }}</td>
            <td class="py-1">{{ decided(r) }}</td>
            <td class="py-1"><span class="ltr">{{ r.rate }}%</span></td>
            <td class="py-1"><span class="ltr">{{ r.prime }}%</span></td>
          </tr>
          <tr v-for="d in upcoming" :key="d" class="border-b border-n100 text-n600">
            <td class="py-1">{{ shortDate(d) }}</td>
            <td class="py-1" colspan="3">עוד לא התקבלה</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
