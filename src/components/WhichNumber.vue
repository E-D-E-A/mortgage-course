<script setup lang="ts">
// Lesson 5.5, "איזה מספר זה?": a rate in a sentence can be one of four different
// numbers — the Bank of Israel's average, an estimate, a bank's personal offer,
// or the rate of a deal that was executed. The learner reads each sentence and
// says which of the four it is; every answer explains the clue in the sentence
// and what the number may (and may not) be used for. Buttons, not dragging, so it
// works by touch, keyboard and screen reader. The table view lists every
// sentence with its answer. The page passes every text (and builds its numbers
// from the lesson's facts), so the lesson's term check reads it all; the four
// kinds and what each is for are fixed here, in plain words, labelled as the
// course's teaching device — not a regulatory classification.
import { computed, onMounted, reactive, ref } from "vue";
import { load, save } from "../lib/progress.ts";
import BidiText from "./BidiText.vue";

type Kind = "average" | "estimate" | "offer" | "deal";
interface Item {
  /** The sentence the learner reads. Numbers in it come from the lesson's facts. */
  text: string;
  answer: Kind;
  /** The clue, shown after the pick: why it is this kind. */
  why: string;
}
const props = defineProps<{ id: string; items: Item[] }>();

const KINDS: { id: Kind; name: string; asks: string; use: string; notUse: string }[] = [
  { id: "average", name: "ריבית ממוצעת (בנק ישראל)", asks: "מה הריבית שהבנקים נתנו בפועל, בממוצע, בתקופה מסוימת?", use: "להבין את השוק ולשים הצעה בהקשר", notUse: "להחליט שהצעה טובה או רעה, או לדרוש אותה כמחיר" },
  { id: "estimate", name: "אומדן", asks: "מה אפשר להעריך לפני שבנק ענה?", use: "לתכנן ולבדוק אם הצעה סבירה", notUse: "להציג אותו כהצעה, או להבטיח אותו" },
  { id: "offer", name: "הצעה אישית", asks: "מה בנק מוכן לתת לתיק הזה, עכשיו?", use: "להחליט ולהשוות הצעות על אותה בסיס", notUse: "להסיק ממנה מה בנק אחר ייתן, או מה יהיה אחרי שייגמר התוקף" },
  { id: "deal", name: "עסקה שבוצעה", asks: "מה נחתם בפועל, במקרה אחד, בעבר?", use: "ללמוד מה אושר למקרים דומים", notUse: "לדרוש אותה, או להניח שהיא תקפה היום" },
];
const byId = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<Kind, (typeof KINDS)[number]>;

const picked = reactive<Record<number, Kind | undefined>>({});
const showTable = ref(false);
onMounted(() => {
  const saved = load<{ picked: Record<number, Kind> }>(`exercise:${props.id}`);
  if (saved?.picked) Object.assign(picked, saved.picked);
});

const answered = computed(() => props.items.filter((_, i) => picked[i]).length);
const correctCount = computed(() => props.items.filter((it, i) => picked[i] === it.answer).length);
const done = computed(() => answered.value === props.items.length);

function pick(i: number, k: Kind) {
  picked[i] = k;
  save(`exercise:${props.id}`, { picked: { ...picked }, correct: done.value && correctCount.value === props.items.length });
}
function restart() {
  for (const i of props.items.keys()) picked[i] = undefined;
  save(`exercise:${props.id}`, { picked: {}, correct: false });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <p class="text-caption text-n600">כל המספרים והבנקים כאן בדויים, להמחשה בלבד. ״בנק א׳״ אינו בנק אמיתי.</p>

    <ul class="list-reset mt-3 grid gap-2 sm:grid-cols-2" aria-label="ארבעת המספרים">
      <li v-for="k in KINDS" :key="k.id" class="rounded-md bg-n50 p-3">
        <p class="text-body-m font-semibold text-n900">{{ k.name }}</p>
        <p class="text-caption text-n700">{{ k.asks }}</p>
      </li>
    </ul>

    <ol class="list-reset mt-5 grid gap-4">
      <li v-for="(it, i) in items" :key="i" class="rounded-md border border-n200 p-3">
        <p class="text-body-m text-n600">משפט {{ i + 1 }} מתוך {{ items.length }}</p>
        <p class="mt-1 text-body-l text-n900"><BidiText :text="it.text" /></p>
        <div class="mt-3 grid grid-cols-2 gap-2" role="group" :aria-label="`איזה מספר זה, משפט ${i + 1}`">
          <button
            v-for="k in KINDS"
            :key="k.id"
            type="button"
            class="min-h-11 rounded-md border px-3 py-2 text-start text-body-m transition-colors duration-fast ease-out"
            :class="
              picked[i] === k.id
                ? k.id === it.answer
                  ? 'border-success bg-success-bg text-n900'
                  : 'border-warning bg-warning-bg text-n900'
                : 'border-n200 text-n700 hover:bg-n50'
            "
            :aria-pressed="picked[i] === k.id"
            @click="pick(i, k.id)"
          >
            {{ k.name }}
          </button>
        </div>
        <div v-if="picked[i]" class="mt-3 text-body-m text-n800" aria-live="polite">
          <p>
            <strong class="text-n900">{{ picked[i] === it.answer ? "נכון." : "לא בדיוק." }}</strong>
            {{ " " }}<template v-if="picked[i] !== it.answer">זה: {{ byId[it.answer].name }}. </template><BidiText :text="it.why" />
          </p>
          <p class="mt-1 text-caption text-n600">
            מה אפשר לעשות איתו: {{ byId[it.answer].use }}. מה אי אפשר: {{ byId[it.answer].notUse }}.
          </p>
        </div>
      </li>
    </ol>

    <p v-if="done" class="mt-4 text-body-m font-semibold text-n900" aria-live="polite">
      ענית על כל המשפטים: {{ correctCount }} מתוך {{ items.length }} נכון.
      <button type="button" class="ms-2 min-h-11 text-navy underline" @click="restart">מההתחלה</button>
    </p>

    <button type="button" class="mt-3 min-h-11 text-body-m text-navy underline" :aria-expanded="showTable" @click="showTable = !showTable">
      {{ showTable ? "הסתרת הטבלה" : "הצגה כטבלה" }}
    </button>
    <div v-if="showTable" class="mt-2 overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-body-m">
        <thead>
          <tr class="border-b border-n200 text-caption text-n600">
            <th class="py-2 pe-3 text-start font-semibold">המשפט</th>
            <th class="py-2 pe-3 text-start font-semibold">איזה מספר זה</th>
            <th class="py-2 text-start font-semibold">הרמז</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, i) in items" :key="i" class="border-b border-n100 align-top">
            <td class="py-2 pe-3 text-n800"><BidiText :text="it.text" /></td>
            <td class="py-2 pe-3 font-semibold text-n900">{{ byId[it.answer].name }}</td>
            <td class="py-2 text-n700"><BidiText :text="it.why" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
