<script setup lang="ts">
// The big-picture map (course map, section 5): every participant and factor in a
// mortgage, in seven regions, with the links between them. It grows from stage
// to stage: the nodes and links are data (src/components/big-picture/), and a
// lesson passes the map as it stands at that lesson (mapUpTo).
//
// Click a node to open its card. On a wide screen the map shows the regions side
// by side and draws the selected node's links; below `sm` (and whenever the
// learner asks for it) the same content is a list, region by region, with each
// card opening under its node.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import BigPictureCard from "./BigPictureCard.vue";
import type { MapLink, MapNode, Region } from "./big-picture/types.ts";

const props = defineProps<{
  regions: Region[];
  nodes: MapNode[];
  links: MapLink[];
  /** The lesson the map is shown in: its own nodes are marked as new. */
  lesson: string;
  /** The node whose card is open at first. */
  initial?: string;
}>();

const selected = ref<string>(props.initial ?? props.nodes.find((n) => n.lesson === props.lesson)?.id ?? props.nodes[0]?.id ?? "");
const asList = ref(false);

const byId = computed(() => new Map(props.nodes.map((n) => [n.id, n])));
const inRegion = (id: string) => props.nodes.filter((n) => n.region === id);
const regionLabel = (id: string) => props.regions.find((r) => r.id === id)?.label ?? "";
const linked = computed(() => {
  const s = new Set<string>();
  for (const l of props.links) {
    if (l.from === selected.value) s.add(l.to);
    if (l.to === selected.value) s.add(l.from);
  }
  return s;
});
const current = computed(() => byId.value.get(selected.value));

function nodeClass(n: MapNode) {
  if (n.id === selected.value) return "border-navy bg-navy text-n0";
  if (linked.value.has(n.id)) return "border-teal-deep bg-mint text-n900";
  if (n.lesson === props.lesson) return "border-teal-deep bg-n0 text-n900 font-semibold";
  return "border-n300 bg-n50 text-n700";
}

// The regions in the map's 3-column layout; the result region spans the row.
const grid: Record<string, string> = { result: "sm:col-span-3" };

// Lines from the selected node to its linked nodes, measured from the rendered buttons.
const mapEl = ref<HTMLElement | null>(null);
const buttons = new Map<string, HTMLElement>();
const setButton = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) buttons.set(id, el);
  else buttons.delete(id);
};
// The list view's node buttons, for moving focus to a node opened from a card.
const listButtons = new Map<string, HTMLElement>();
const setListButton = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) listButtons.set(id, el);
  else listButtons.delete(id);
};
const lines = ref<{ id: string; x1: number; y1: number; x2: number; y2: number }[]>([]);
const size = ref({ w: 0, h: 0 });
function measure() {
  const box = mapEl.value?.getBoundingClientRect();
  const from = buttons.get(selected.value)?.getBoundingClientRect();
  if (!box || !from || box.width === 0) {
    lines.value = [];
    return;
  }
  size.value = { w: box.width, h: box.height };
  const centre = (r: DOMRect) => ({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 });
  const a = centre(from);
  lines.value = [...linked.value]
    .map((id) => buttons.get(id)?.getBoundingClientRect())
    .filter((r): r is DOMRect => !!r && r.width > 0)
    .map((r, k) => {
      const b = centre(r);
      return { id: String(k), x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    });
}
// The map element is re-created when the learner goes list → map, so it is re-observed each time.
let observer: ResizeObserver | null = null;
onMounted(() => {
  if (typeof ResizeObserver !== "undefined") observer = new ResizeObserver(() => measure());
  measure();
});
watch(
  mapEl,
  (el, old) => {
    if (old) observer?.unobserve(old);
    if (el) observer?.observe(el);
  },
  { flush: "post" },
);
onBeforeUnmount(() => observer?.disconnect());
watch([selected, asList], () => nextTick(measure));

function select(id: string) {
  selected.value = id;
}
/** A node chosen from a card's links: the card that held the link is replaced, so focus moves to the new node, in view. */
function selectFromCard(id: string) {
  selected.value = id;
  nextTick(() => {
    const inList = listButtons.get(id);
    const listShown = !!inList && inList.offsetParent !== null;
    const target = listShown ? inList : buttons.get(id);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: listShown ? "start" : "nearest" });
  });
}
function toggleInList(id: string) {
  selected.value = selected.value === id ? "" : id;
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <ul class="list-reset flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm border-2 border-teal-deep bg-n0"></span>חדש בשיעור הזה</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm border border-n300 bg-n50"></span>משיעורים קודמים</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm bg-navy"></span>הצומת שבחרתם</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm border border-teal-deep bg-mint"></span>קשור אליו</li>
    </ul>

    <!-- Map view: regions side by side, from `sm` up. -->
    <div v-if="!asList" class="hidden sm:block">
      <div ref="mapEl" class="relative mt-4">
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          :viewBox="`0 0 ${size.w || 1} ${size.h || 1}`"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            v-for="l in lines"
            :key="l.id"
            :x1="l.x1"
            :y1="l.y1"
            :x2="l.x2"
            :y2="l.y2"
            stroke="var(--mogi-teal-deep)"
            stroke-width="2"
            stroke-dasharray="6 4"
          />
        </svg>
        <div class="relative grid grid-cols-3 gap-3">
          <section v-for="r in regions" :key="r.id" class="rounded-lg border border-n200 p-3" :class="grid[r.id]" :aria-label="r.label">
            <h3 class="relative inline-block bg-n0 px-1 text-caption font-semibold text-n600">{{ r.label }}</h3>
            <div v-if="inRegion(r.id).length" class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="n in inRegion(r.id)"
                :key="n.id"
                :ref="setButton(n.id)"
                type="button"
                class="min-h-11 rounded-md border px-3 py-1.5 text-start text-body-m transition-colors duration-fast ease-out"
                :class="nodeClass(n)"
                :aria-pressed="n.id === selected"
                @click="select(n.id)"
              >
                {{ n.label }}
              </button>
            </div>
            <p v-else class="mt-2 text-caption text-n500">{{ r.empty }}</p>
          </section>
        </div>
      </div>
      <div class="mt-4" aria-live="polite">
        <BigPictureCard
          v-if="current"
          :node="current"
          :nodes="nodes"
          :links="links"
          :region-label="regionLabel(current.region)"
          :lesson="lesson"
          @select="selectFromCard"
        />
        <p v-else class="text-body-m text-n600">לחצו על צומת כדי לראות מה הוא עושה.</p>
      </div>
    </div>

    <!-- List view: always below `sm`, and on request from `sm` up. -->
    <div :class="asList ? '' : 'sm:hidden'" class="mt-4 grid gap-4">
      <section v-for="r in regions" :key="r.id" :aria-label="r.label">
        <h3 class="text-body-m font-semibold text-n900">{{ r.label }}</h3>
        <ul v-if="inRegion(r.id).length" class="list-reset mt-2 grid gap-2">
          <li v-for="n in inRegion(r.id)" :key="n.id">
            <button
              :ref="setListButton(n.id)"
              type="button"
              class="flex min-h-11 w-full scroll-mt-4 items-center justify-between gap-2 rounded-md border px-3 py-2 text-start text-body-m transition-colors duration-fast ease-out"
              :class="nodeClass(n)"
              :aria-expanded="n.id === selected"
              @click="toggleInList(n.id)"
            >
              <span>{{ n.label }}</span>
              <span aria-hidden="true">{{ n.id === selected ? "−" : "+" }}</span>
            </button>
            <div v-if="n.id === selected" class="mt-2">
              <BigPictureCard :node="n" :nodes="nodes" :links="links" :region-label="r.label" :lesson="lesson" @select="selectFromCard" />
            </div>
          </li>
        </ul>
        <p v-else class="mt-1 text-caption text-n500">{{ r.empty }}</p>
      </section>
    </div>

    <button type="button" class="mt-4 hidden min-h-11 text-body-m text-navy underline sm:inline-block" :aria-pressed="asList" @click="asList = !asList">
      {{ asList ? "הצגה כמפה" : "הצגה כרשימה" }}
    </button>
  </div>
</template>
