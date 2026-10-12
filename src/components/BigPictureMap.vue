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
import BidiText from "./BidiText.vue";
import BigPictureCard from "./BigPictureCard.vue";
import type { MapLink, MapNode, Region } from "./big-picture/types.ts";

const props = defineProps<{
  regions: Region[];
  nodes: MapNode[];
  links: MapLink[];
  /** The lesson the map is shown in: its own nodes are marked as new. */
  lesson: string;
  /**
   * A stage's summary lesson adds no node of its own: with newFrom ("3.1") every node added from that
   * lesson up to this one is marked new, and the legend says "in this stage".
   */
  newFrom?: string;
  /** The node whose card is open at first. */
  initial?: string;
}>();

// a ≤ b by lesson number ("3.10" after "3.9"); the same rule as big-picture/index.ts, kept here so the
// component does not import every stage's data.
const num = (id: string) => id.split(".").map(Number);
const notAfter = (a: string, b: string) => {
  const [as, al] = num(a);
  const [bs, bl] = num(b);
  return as < bs || (as === bs && al <= bl);
};
const isNew = (n: MapNode) => (props.newFrom ? notAfter(props.newFrom, n.lesson) && notAfter(n.lesson, props.lesson) : n.lesson === props.lesson);
const anyNew = computed(() => props.nodes.some(isNew));
const selected = ref<string>(props.initial ?? props.nodes.find(isNew)?.id ?? props.nodes[0]?.id ?? "");
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
  if (isNew(n)) return "border-teal-deep bg-n0 text-n900 font-semibold";
  return "border-n300 bg-n50 text-n700";
}

// The regions in the map's 3-column layout; the result region spans the row.
const grid: Record<string, string> = { result: "sm:col-span-3" };

// Lines from the selected node to its linked nodes, measured from the rendered buttons and regions.
// A straight line from centre to centre would run behind unrelated nodes and read as a link to them,
// so a line travels only in the empty gaps: out of the selected node's region frame, along the gutters
// between the regions, and into the linked node's region frame. Inside a region it reaches the node
// only when nothing else stands in the way; the node's mint fill marks it either way. A link inside
// one region gets no line, only the fill.
const mapEl = ref<HTMLElement | null>(null);
const buttons = new Map<string, HTMLElement>();
const setButton = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) buttons.set(id, el);
  else buttons.delete(id);
};
const regionEls = new Map<string, HTMLElement>();
const setRegion = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) regionEls.set(id, el);
  else regionEls.delete(id);
};
// The list view's node buttons, for moving focus to a node opened from a card.
const listButtons = new Map<string, HTMLElement>();
const setListButton = (id: string) => (el: unknown) => {
  if (el instanceof HTMLElement) listButtons.set(id, el);
  else listButtons.delete(id);
};
interface Box {
  l: number;
  r: number;
  t: number;
  b: number;
}
const lines = ref<{ id: string; d: string; ends: { x: number; y: number }[] }[]>([]);
const size = ref({ w: 0, h: 0 });
function measure() {
  const box = mapEl.value?.getBoundingClientRect();
  const from = byId.value.get(selected.value);
  const fromEl = buttons.get(selected.value);
  if (!box || !from || !fromEl || box.width === 0) {
    lines.value = [];
    return;
  }
  size.value = { w: box.width, h: box.height };
  const rel = (el: Element): Box => {
    const r = el.getBoundingClientRect();
    return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
  };
  const regionBox = new Map([...regionEls].map(([id, el]) => [id, rel(el)]));
  const rows = [...new Set([...regionBox.values()].map((r) => Math.round(r.t)))].sort((x, y) => x - y);
  const rowOf = (r: Box) => rows.indexOf(Math.round(r.t));
  // The horizontal gutter under row i, and the vertical gutters between columns.
  const gutterBelow = (i: number) => {
    const bottom = Math.max(...[...regionBox.values()].filter((r) => rowOf(r) === i).map((r) => r.b));
    const nextTop = Math.min(...[...regionBox.values()].filter((r) => rowOf(r) === i + 1).map((r) => r.t));
    return (bottom + nextTop) / 2;
  };
  const firstRow = [...regionBox.values()].filter((r) => rowOf(r) === 0).sort((x, y) => x.l - y.l);
  const columnGutters = firstRow.slice(1).map((r, i) => (firstRow[i].r + r.l) / 2);
  // Everything a stub inside a region must not cross: other nodes and the region titles.
  const obstacles = (regionId: string, except: string[]) => [
    ...props.nodes.filter((n) => n.region === regionId && !except.includes(n.id)).flatMap((n) => (buttons.get(n.id) ? [rel(buttons.get(n.id) as HTMLElement)] : [])),
    ...[...(regionEls.get(regionId)?.querySelectorAll("h3") ?? [])].map(rel),
  ];
  const clear = (x: number, y1: number, y2: number, obs: Box[]) => obs.every((o) => x < o.l - 2 || x > o.r + 2 || Math.max(y1, y2) < o.t || Math.min(y1, y2) > o.b);
  // The point where a line meets a region frame, above or below a node, plus a stub to the node when clear.
  const port = (nodeId: string, side: "top" | "bottom", others: string[]) => {
    const n = byId.value.get(nodeId);
    const el = buttons.get(nodeId);
    const frame = n && regionBox.get(n.region);
    if (!n || !el || !frame) return null;
    const nb = rel(el);
    const x = Math.min(Math.max((nb.l + nb.r) / 2, frame.l + 12), frame.r - 12);
    const edge = side === "top" ? frame.t : frame.b;
    const nodeEdge = side === "top" ? nb.t : nb.b;
    const stub = clear(x, nodeEdge, edge, obstacles(n.region, [nodeId, ...others])) ? { x, y: nodeEdge } : null;
    return { x, y: edge, stub };
  };

  const fromBox = regionBox.get(from.region);
  if (!fromBox) {
    lines.value = [];
    return;
  }
  const out: { id: string; d: string; ends: { x: number; y: number }[] }[] = [];
  for (const id of linked.value) {
    const to = byId.value.get(id);
    const toBox = to && regionBox.get(to.region);
    if (!to || !toBox || to.region === from.region || !buttons.get(id)) continue;
    const ra = rowOf(fromBox);
    const rb = rowOf(toBox);
    // Leave toward the other region: down when it is lower or in the same row, up when it is higher.
    const down = rb >= ra;
    const a = port(from.id, down ? "bottom" : "top", [id]);
    const b = port(id, rb === ra ? "bottom" : down ? "top" : "bottom", [from.id]);
    if (!a || !b) continue;
    const gA = down ? gutterBelow(ra) : gutterBelow(ra - 1);
    const gB = rb === ra ? gA : down ? gutterBelow(rb - 1) : gutterBelow(rb);
    const pts: { x: number; y: number }[] = [];
    if (a.stub) pts.push(a.stub);
    pts.push({ x: a.x, y: a.y }, { x: a.x, y: gA });
    if (Math.abs(gA - gB) > 1) {
      // Rows apart: along a gutter between columns, so no region in between is crossed.
      const xv = columnGutters.reduce((best, g) => (Math.abs(g - a.x) + Math.abs(g - b.x) < Math.abs(best - a.x) + Math.abs(best - b.x) ? g : best), columnGutters[0] ?? a.x);
      pts.push({ x: xv, y: gA }, { x: xv, y: gB });
    }
    pts.push({ x: b.x, y: gB }, { x: b.x, y: b.y });
    if (b.stub) pts.push(b.stub);
    out.push({ id, d: pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" "), ends: [pts[0], pts[pts.length - 1]] });
  }
  lines.value = out;
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
    // `scroll-mt-24` on the node buttons keeps the node below the sticky header.
    target.scrollIntoView({ block: listShown ? "start" : "nearest", behavior: "instant" });
  });
}
/**
 * The list view: a node opens its card under it and closes the card above it. When that card was higher
 * on the page the clicked node would jump up by the card's height (and off the screen), so the page is
 * scrolled by the amount the node moved, which keeps it under the learner's finger; then, if it still
 * sits under the sticky header or below the screen, it is brought into view (`scroll-mt-24`).
 */
function toggleInList(id: string, event: Event) {
  const button = event.currentTarget as HTMLElement | null;
  const before = button?.getBoundingClientRect().top ?? 0;
  selected.value = selected.value === id ? "" : id;
  nextTick(() => {
    if (!button?.isConnected) return;
    const moved = button.getBoundingClientRect().top - before;
    if (Math.abs(moved) > 1) scrollBy({ top: moved, behavior: "instant" });
    button.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
}
</script>

<template>
  <div class="my-6 rounded-lg border border-n200 bg-n0 p-4 shadow-sm sm:p-5">
    <ul class="list-reset flex flex-wrap gap-x-5 gap-y-2 text-caption text-n700" aria-label="מקרא">
      <!-- The "new" swatch only when something is marked new; otherwise every node is "earlier". -->
      <li v-if="anyNew" class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm border-2 border-teal-deep bg-n0"></span>{{ newFrom ? "חדש בשלב הזה" : "חדש בשיעור הזה" }}</li>
      <li class="flex items-center gap-2"><span class="inline-block h-4 w-5 rounded-sm border border-n300 bg-n50"></span>{{ newFrom ? "משלבים קודמים" : "משיעורים קודמים" }}</li>
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
          <g v-for="l in lines" :key="l.id">
            <path :d="l.d" fill="none" stroke="var(--mogi-teal-deep)" stroke-width="2" stroke-dasharray="6 4" stroke-linejoin="round" />
            <circle v-for="(e, k) in l.ends" :key="k" :cx="e.x" :cy="e.y" r="3.5" fill="var(--mogi-teal-deep)" />
          </g>
        </svg>
        <div class="relative grid grid-cols-3 gap-3">
          <section v-for="r in regions" :key="r.id" :ref="setRegion(r.id)" class="rounded-lg border border-n200 p-3" :class="grid[r.id]" :aria-label="r.label">
            <h3 class="relative inline-block bg-n0 px-1 text-caption font-semibold text-n600">{{ r.label }}</h3>
            <div v-if="inRegion(r.id).length" class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="n in inRegion(r.id)"
                :key="n.id"
                :ref="setButton(n.id)"
                type="button"
                class="min-h-11 scroll-mt-24 rounded-md border px-3 py-1.5 text-start text-body-m transition-colors duration-fast ease-out"
                :class="nodeClass(n)"
                :aria-pressed="n.id === selected"
                @click="select(n.id)"
              >
                <BidiText :text="n.label" />
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
              class="flex min-h-11 w-full scroll-mt-24 items-center justify-between gap-2 rounded-md border px-3 py-2 text-start text-body-m transition-colors duration-fast ease-out"
              :class="nodeClass(n)"
              :aria-expanded="n.id === selected"
              @click="toggleInList(n.id, $event)"
            >
              <span><BidiText :text="n.label" /></span>
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
