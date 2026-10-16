<script setup lang="ts">
// The judge of a mix (lesson 5.9): one mix, four yardsticks. The learner picks a
// yardstick and sees the mix against it on a basis that is the same on both
// sides; then breaks the basis (a different term, nominal against effective, a
// scenario left out) and watches the comparison go wrong. The component does
// no arithmetic: every cell is a number the page took from a fact. Its job is
// to keep "what must match" and "what this yardstick cannot say" beside the
// numbers.
import { ref } from "vue";

interface Row {
  measure: string;
  mix: string;
  ref: string;
  gap: string;
  /** "better" or "worse" for the mix, or "" when the gap is not a verdict. */
  verdict?: "better" | "worse" | "";
}
interface Table {
  /** One line above the table: what it compares. */
  caption: string;
  rows: Row[];
}
interface Yardstick {
  id: string;
  label: string;
  question: string;
  /** What has to be the same on both sides. */
  mustMatch: string[];
  same: Table;
  /** Text of the button that breaks the basis. */
  breakLabel: string;
  broken: Table;
  /** Why the broken table misleads. */
  brokenWhy: string;
  /** What the yardstick cannot say. */
  cannot: string;
}
const props = defineProps<{ yardsticks: Yardstick[]; refHead: string; mixHead?: string; note: string }>();

const pick = ref(props.yardsticks[0].id);
const broken = ref(false);
const current = () => props.yardsticks.find((y) => y.id === pick.value) ?? props.yardsticks[0];
function choose(id: string) {
  pick.value = id;
  broken.value = false;
}
const rows = () => (broken.value ? current().broken : current().same).rows;
const tone = (v?: string) => (v === "better" ? "bg-success-bg" : v === "worse" ? "bg-warning-bg" : "");
const word = (v?: string) => (v === "better" ? "טוב יותר" : v === "worse" ? "גרוע יותר" : "");
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-5 shadow-sm">
    <p class="text-caption text-n600">{{ note }}</p>

    <div role="tablist" aria-label="קני המידה" class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="y in yardsticks"
        :id="`judge-tab-${y.id}`"
        :key="y.id"
        type="button"
        role="tab"
        :aria-selected="pick === y.id"
        :aria-controls="`judge-panel-${y.id}`"
        class="min-h-11 rounded-md border px-3 py-1 text-body-m transition-colors duration-fast ease-out"
        :class="pick === y.id ? 'border-turquoise-2 bg-mint/30 text-n900' : 'border-n200 text-n700 hover:bg-n50'"
        @click="choose(y.id)"
      >
        {{ y.label }}
      </button>
    </div>

    <div :id="`judge-panel-${current().id}`" role="tabpanel" :aria-labelledby="`judge-tab-${current().id}`" class="mt-4">
      <p class="text-body-l font-semibold text-n900">{{ current().question }}</p>

      <p class="mt-3 text-caption font-semibold text-n600">מה חייב להיות זהה משני הצדדים</p>
      <ul class="mt-1 list-disc space-y-1 ps-5 text-body-m text-n800">
        <li v-for="m in current().mustMatch" :key="m">{{ m }}</li>
      </ul>

      <p class="mt-4 text-body-m font-semibold text-n900">
        {{ broken ? current().broken.caption : current().same.caption }}
      </p>
      <div
        v-if="broken"
        class="mt-2 rounded-md border border-n200 bg-warning-bg p-3 text-body-m text-n900"
        role="status"
      >
        הבסיס שבור. {{ current().brokenWhy }}
      </div>
      <div class="mt-2 hidden sm:block">
        <table class="w-full border-collapse text-body-m">
          <thead>
            <tr class="border-b border-n200 text-caption text-n600">
              <th class="py-1 pe-3 text-start font-semibold">המדד</th>
              <th class="py-1 pe-3 text-start font-semibold">{{ mixHead ?? "התמהיל" }}</th>
              <th class="py-1 pe-3 text-start font-semibold">{{ refHead }}</th>
              <th class="py-1 text-start font-semibold">הפער</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows()" :key="r.measure" class="border-b border-n100 align-top">
              <th class="py-2 pe-3 text-start font-normal text-n700">{{ r.measure }}</th>
              <td class="py-2 pe-3"><span class="ltr whitespace-nowrap">{{ r.mix }}</span></td>
              <td class="py-2 pe-3"><span class="ltr whitespace-nowrap">{{ r.ref }}</span></td>
              <td class="py-2">
                <span class="ltr whitespace-nowrap rounded-sm px-1.5 py-0.5" :class="tone(r.verdict)">{{ r.gap }}</span>
                <span v-if="word(r.verdict)" class="ms-2 text-caption text-n700">{{ word(r.verdict) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- On a phone each row is a small card: the same four numbers, one under the other. -->
      <ul class="list-reset mt-2 space-y-2 sm:hidden">
        <li v-for="r in rows()" :key="r.measure" class="rounded-md border border-n200 p-3">
          <p class="text-body-m font-semibold text-n900">{{ r.measure }}</p>
          <dl class="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-m text-n800">
            <dt class="text-caption text-n600">{{ mixHead ?? "התמהיל" }}</dt>
            <dd><span class="ltr whitespace-nowrap">{{ r.mix }}</span></dd>
            <dt class="text-caption text-n600">{{ refHead }}</dt>
            <dd><span class="ltr whitespace-nowrap">{{ r.ref }}</span></dd>
            <dt class="text-caption text-n600">הפער</dt>
            <dd>
              <span class="ltr whitespace-nowrap rounded-sm px-1.5 py-0.5" :class="tone(r.verdict)">{{ r.gap }}</span>
              <span v-if="word(r.verdict)" class="ms-2 text-caption text-n700">{{ word(r.verdict) }}</span>
            </dd>
          </dl>
        </li>
      </ul>

      <button type="button" class="mt-3 min-h-11 rounded-md border border-n300 px-3 text-body-m text-navy" :aria-pressed="broken" @click="broken = !broken">
        {{ broken ? "חזרה לבסיס אחד" : current().breakLabel }}
      </button>

      <p class="mt-3 rounded-md bg-n50 p-3 text-body-m text-n800"><span class="font-semibold">מה קנה המידה הזה לא יכול לומר:</span> {{ current().cannot }}</p>
    </div>
  </div>
</template>
