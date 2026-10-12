<script setup lang="ts">
// Hebrew text that may hold numbers, ranges or dates: each number is drawn left to right
// (src/lib/bidi.ts), so "3–4" or "2026-08-05" never reads backwards in a right-to-left line.
import { numberPieces } from "../lib/bidi.ts";

defineProps<{ text: string }>();
</script>

<template>
  <template v-for="(p, j) in numberPieces(text)" :key="j"><span v-if="p.ltr" class="ltr">{{ p.text }}</span><template v-else>{{ p.text }}</template></template>
</template>
