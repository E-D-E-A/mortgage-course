<script setup lang="ts">
// Hebrew text that may hold numbers, ranges, dates or Latin identifiers: each is drawn left to right
// as one piece, so "3–4", "2026-08-05" or "FK-H-012" never reads backwards in a right-to-left line.
// Numbers and ranges come from src/lib/bidi.ts; an identifier (Latin letters, with digits, hyphens or
// underscores: FK-H-012, BIR_MRTG_99, ENG-223) is kept whole before the numbers are split off it.
import { computed } from "vue";
import { numberPieces } from "../lib/bidi.ts";

const props = defineProps<{ text: string }>();
const IDENT = /[A-Za-z][A-Za-z0-9_]*(?:[-_.][A-Za-z0-9]+)*/g;

const pieces = computed(() => {
  const out: { text: string; ltr: boolean }[] = [];
  let at = 0;
  for (const m of props.text.matchAll(IDENT)) {
    const start = m.index ?? 0;
    if (start > at) out.push(...numberPieces(props.text.slice(at, start)));
    out.push({ text: m[0], ltr: true });
    at = start + m[0].length;
  }
  if (at < props.text.length) out.push(...numberPieces(props.text.slice(at)));
  return out;
});
</script>

<template>
  <template v-for="(p, j) in pieces" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template>
</template>
