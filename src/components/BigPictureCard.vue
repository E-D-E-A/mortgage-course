<script setup lang="ts">
// One node's card on the big-picture map: what it is, what it does in the
// deal, when it enters, and its links to other nodes. A linked node's name is
// a button that selects it. Used by BigPictureMap in both of its views.
import { computed } from "vue";
import { numberPieces } from "../lib/bidi.ts";
import type { MapLink, MapNode } from "./big-picture/types.ts";

const props = defineProps<{
  node: MapNode;
  nodes: MapNode[];
  links: MapLink[];
  regionLabel: string;
  /** The lesson the map is shown in; a node added in an earlier lesson says so. */
  lesson: string;
}>();
const emit = defineEmits<{ select: [id: string] }>();

const byId = computed(() => new Map(props.nodes.map((n) => [n.id, n])));
const outgoing = computed(() => props.links.filter((l) => l.from === props.node.id));
const incoming = computed(() => props.links.filter((l) => l.to === props.node.id));
// Card text names lessons and ranges ("שיעורים 3.2–3.6"); each number is drawn left to right (bidi.ts).
const pieces = numberPieces;
</script>

<template>
  <div class="rounded-md border border-n200 bg-n0 p-4">
    <p class="flex flex-wrap items-center gap-2">
      <span class="text-h3 text-navy">{{ node.label }}</span>
      <span class="rounded-pill bg-n100 px-3 py-0.5 text-caption text-n700">{{ node.kind === "actor" ? "משתתף בעסקה" : "גורם" }}</span>
      <span class="text-caption text-n600">{{ regionLabel }}</span>
    </p>
    <dl class="mt-3 grid gap-2 text-body-m text-n800">
      <div>
        <dt class="text-caption font-semibold text-n600">מה זה</dt>
        <dd><template v-for="(p, j) in pieces(node.card.what)" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template></dd>
      </div>
      <div>
        <dt class="text-caption font-semibold text-n600">מה הוא עושה בעסקה</dt>
        <dd><template v-for="(p, j) in pieces(node.card.role)" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template></dd>
      </div>
      <div v-if="node.card.when">
        <dt class="text-caption font-semibold text-n600">מתי הוא נכנס</dt>
        <dd><template v-for="(p, j) in pieces(node.card.when ?? '')" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template></dd>
      </div>
    </dl>
    <div v-if="outgoing.length || incoming.length" class="mt-3">
      <p class="text-caption font-semibold text-n600">קשרים</p>
      <ul class="list-reset mt-1 grid gap-1 text-body-m text-n800">
        <li v-for="l in outgoing" :key="`o-${l.to}`">
          <span class="font-semibold">{{ node.label }}</span>
          <span aria-hidden="true"> ← </span><span class="sr-only"> אל </span>
          <button type="button" class="min-h-11 min-w-11 ps-1 text-navy underline" @click="emit('select', l.to)">{{ byId.get(l.to)?.label }}</button>:
          <template v-for="(p, j) in pieces(l.label)" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template>
        </li>
        <li v-for="l in incoming" :key="`i-${l.from}`">
          <button type="button" class="min-h-11 min-w-11 ps-1 text-navy underline" @click="emit('select', l.from)">{{ byId.get(l.from)?.label }}</button>
          <span aria-hidden="true"> ← </span><span class="sr-only"> אל </span>
          <span class="font-semibold">{{ node.label }}</span>:
          <template v-for="(p, j) in pieces(l.label)" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template>
        </li>
      </ul>
    </div>
    <p v-if="node.card.note" class="mt-3 text-caption text-n600"><template v-for="(p, j) in pieces(node.card.note ?? '')" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template></p>
    <p v-if="node.lesson !== lesson" class="mt-1 text-caption text-n600">נכנס למפה בשיעור <span class="ltr">{{ node.lesson }}</span>.</p>
  </div>
</template>
