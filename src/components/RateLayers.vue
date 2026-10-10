<script setup lang="ts">
// Lesson 2.1's illustration: three layers of interest. The learner sets the Bank
// of Israel rate and the spread written in a track's contract, and sees prime
// (the rate plus a fixed addition) and the track's rate (prime plus the spread)
// built on top of each other. When the Bank of Israel rate moves, everything
// above it moves by the same points; the spread stays. Numbers from tracks.ts.
import Decimal from "decimal.js";
import { computed, ref } from "vue";
import { plainNumber } from "../lib/calc/indexation.ts";
import { primeRate, primeTrackRate, spreadFromRate } from "../lib/calc/tracks.ts";

const props = withDefaults(
  defineProps<{
    policy?: number;
    spread?: number;
    /** The addition that makes prime, in points (a fact from the lesson's data). */
    addition: string;
    /** Source and date of the addition and the rate, shown under the picture. */
    note: string;
  }>(),
  { policy: 3.25, spread: -0.8 },
);

const policy = ref(props.policy);
const spread = ref(props.spread);
const showTable = ref(false);

const prime = computed(() => primeRate(String(policy.value), props.addition));
const rate = computed(() => primeTrackRate(String(policy.value), String(spread.value), props.addition));
const aboveBoi = computed(() => spreadFromRate(rate.value, String(policy.value)));
const moved = computed(() => new Decimal(String(policy.value)).minus(String(props.policy)));
const spreadNeg = computed(() => new Decimal(String(spread.value)).isNeg());

/** A rate or a points figure for display, with a real minus sign. */
const show = (d: Decimal.Value) => plainNumber(d).replace("-", "−");
const signed = (d: Decimal.Value) => {
  const v = new Decimal(d);
  return v.isZero() ? "0" : `${v.isNeg() ? "−" : "+"}${plainNumber(v.abs())}`;
};
/** "בנקודת אחוז אחת", "ב־0.25 נקודת אחוז", "ב־1.5 נקודות אחוז": below one point the course says נקודת (as in 0.10). */
const byPoints = (d: Decimal.Value) => {
  const v = new Decimal(d).abs();
  if (v.eq(1)) return "בנקודת אחוז אחת";
  return `ב־${plainNumber(v)} ${v.lt(1) ? "נקודת אחוז" : "נקודות אחוז"}`;
};

// The bars share one scale, from 0 at the start (right) side to a round top that fits the largest rate.
const top = computed(() => Decimal.max(prime.value, rate.value, 1).plus(0.5).ceil().toNumber());
const pct = (v: Decimal.Value) => `${Math.max(0, (new Decimal(v).toNumber() / top.value) * 100)}%`;
const ticks = computed(() => Array.from({ length: top.value + 1 }, (_, k) => k));
const low = computed(() => Decimal.min(prime.value, rate.value));
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">ריבית בנק ישראל ומרווח לבחירתכם: מספרים להמחשה, לא תחזית ולא הצעה של בנק.</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שכבה 1: ריבית בנק ישראל</span>
        <input v-model.number="policy" type="range" min="0" max="6" step="0.25" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ show(policy) }}%</span></span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-caption font-semibold text-n600">שכבה 3: המרווח בחוזה, בנקודות אחוז</span>
        <input v-model.number="spread" type="range" min="-2" max="2" step="0.05" />
        <span class="text-body-l font-semibold text-n900"><span class="ltr">{{ signed(spread) }}</span></span>
      </label>
    </div>

    <ul class="list-reset mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-teal-deep)"></span>ריבית בנק ישראל</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-turquoise-2)"></span>התוספת ({{ addition }} נקודות)</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm" style="background: var(--mogi-n300)"></span>מרווח חיובי</li>
      <li class="flex items-center gap-2"><span class="inline-block h-3 w-4 rounded-sm border-2 border-dashed" style="border-color: var(--mogi-navy)"></span>מרווח שלילי: יורד מהפריים</li>
    </ul>

    <!-- Three rows, one per layer. Bars grow from the start (right) side, as Hebrew is read. -->
    <div class="mt-4 grid gap-4" aria-hidden="true">
      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="text-body-m font-semibold text-n900">ריבית בנק ישראל</span>
          <span class="text-body-m text-n900"><span class="ltr">{{ show(policy) }}%</span></span>
        </div>
        <div class="mt-1 flex h-6 rounded-sm bg-n50">
          <div class="h-full rounded-sm" :style="{ width: pct(policy), background: 'var(--mogi-teal-deep)' }"></div>
        </div>
      </div>
      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="text-body-m font-semibold text-n900">פריים</span>
          <span class="text-body-m text-n900"><span class="ltr">{{ show(policy) }} + {{ addition }} = {{ show(prime) }}%</span></span>
        </div>
        <div class="mt-1 flex h-6 rounded-sm bg-n50">
          <div class="h-full rounded-s-sm" :style="{ width: pct(policy), background: 'var(--mogi-teal-deep)' }"></div>
          <div class="h-full rounded-e-sm" :style="{ width: pct(addition), background: 'var(--mogi-turquoise-2)' }"></div>
        </div>
      </div>
      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="text-body-m font-semibold text-n900">הריבית במסלול</span>
          <span class="text-body-m text-n900"><span class="ltr">{{ show(prime) }} {{ spreadNeg ? "−" : "+" }} {{ plainNumber(new Decimal(String(spread)).abs()) }} = {{ show(rate) }}%</span></span>
        </div>
        <div class="mt-1 flex h-6 rounded-sm bg-n50">
          <!-- The part of prime that stays, in its two colours. -->
          <div class="h-full rounded-s-sm" :style="{ width: pct(Decimal.min(policy, low)), background: 'var(--mogi-teal-deep)' }"></div>
          <div class="h-full" :style="{ width: pct(Decimal.max(0, low.minus(String(policy)))), background: 'var(--mogi-turquoise-2)' }"></div>
          <!-- A negative spread: the part of prime that falls away. A positive one: grey on top. -->
          <div
            v-if="spreadNeg"
            class="h-full rounded-e-sm border-2 border-dashed"
            :style="{ width: pct(prime.minus(Decimal.max(rate, 0))), borderColor: 'var(--mogi-navy)' }"
          ></div>
          <div v-else class="h-full rounded-e-sm" :style="{ width: pct(spread), background: 'var(--mogi-n300)' }"></div>
        </div>
      </div>
      <!-- Each label centred on its point: placed from the start (right) edge, then shifted by half its width. -->
      <div class="relative h-4 text-caption text-n600">
        <span v-for="k in ticks" :key="k" class="ltr absolute top-0 whitespace-nowrap" :style="{ insetInlineStart: pct(k), transform: 'translateX(50%)' }">{{ k }}%</span>
      </div>
      <p v-if="rate.isNeg()" class="text-caption text-n700">הריבית במסלול מתחת לאפס: הפס מראה רק את מה שירד מהפריים עד אפס.</p>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
      <div class="rounded-md bg-n50 p-3">
        <div class="text-caption text-n600">פריים</div>
        <div class="text-h2 text-navy"><span class="ltr">{{ show(prime) }}%</span></div>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <div class="text-caption text-n600">הריבית במסלול</div>
        <div class="text-h2 text-navy"><span class="ltr">{{ show(rate) }}%</span></div>
      </div>
      <div class="rounded-md bg-n50 p-3">
        <div class="text-caption text-n600">ביחס לריבית בנק ישראל</div>
        <div class="text-body-l font-semibold text-n900">
          <template v-if="aboveBoi.isZero()">בדיוק בגובה שלה</template>
          <template v-else>{{ aboveBoi.isNeg() ? "מתחתיה" : "מעליה" }} {{ byPoints(aboveBoi) }}</template>
        </div>
      </div>
    </div>
    <p v-if="!moved.isZero()" class="mt-3 rounded-md bg-info-bg p-3 text-body-m text-n800" role="status">
      ריבית בנק ישראל {{ moved.isNeg() ? "ירדה" : "עלתה" }} {{ byPoints(moved) }} מאז ההתחלה. הפריים והריבית במסלול {{ moved.isNeg() ? "ירדו" : "עלו" }} באותו מספר נקודות, והמרווח לא זז.
    </p>
    <p class="mt-3 text-caption text-n600">{{ note }}</p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full border-collapse text-body-m">
        <tbody>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">שכבה 1: ריבית בנק ישראל</th><td class="py-1"><span class="ltr">{{ show(policy) }}%</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">שכבה 2: התוספת</th><td class="py-1"><span class="ltr">+{{ addition }}</span> נקודות</td></tr>
          <tr class="border-b border-n100 font-semibold text-n900"><th class="py-1 text-start">פריים</th><td class="py-1"><span class="ltr">{{ show(prime) }}%</span></td></tr>
          <tr class="border-b border-n100"><th class="py-1 text-start font-normal text-n600">שכבה 3: המרווח בחוזה</th><td class="py-1"><span class="ltr">{{ signed(spread) }}</span> נקודות</td></tr>
          <tr class="font-semibold text-n900"><th class="py-1 text-start">הריבית במסלול</th><td class="py-1"><span class="ltr">{{ show(rate) }}%</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
