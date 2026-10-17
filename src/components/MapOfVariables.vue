<script setup lang="ts">
// Lesson 8.27: the big-picture map with the algorithm layer. The learner picks a role (input, hard constraint,
// decision variable, output) and, if they like, who controls it (the client, the bank, the market, the regulator);
// the map keeps the nodes that fit and each card says what role the node would play. The layer is the COURSE'S PROPOSAL
// (future): no code reads this map. BigPictureMap has no layer prop, so this component hands it derived nodes (same
// ids, the role written into the card note) and filters them; the shared component is untouched.
import { computed, ref } from "vue";
import BigPictureMap from "./BigPictureMap.vue";
import { mapUpTo } from "./big-picture/index.ts";
import { CONTROL_LABEL, type Control, LAYER, ROLE_LABEL, type Role } from "./big-picture/stage-8.ts";

const props = withDefaults(defineProps<{ lesson?: string; initial?: string }>(), { lesson: "8.27", initial: "pti" });
const map = mapUpTo(props.lesson);

const ROLES: (Role | "all")[] = ["all", "input", "constraint", "decision", "output", "outside"];
const CONTROLS: (Control | "all")[] = ["all", "client", "bank", "market", "regulator", "other"];
const role = ref<Role | "all">("all");
const control = ref<Control | "all">("all");

const derived = computed(() =>
  map.nodes.map((n) => {
    const l = LAYER[n.id];
    if (!l) return n;
    const roles = l.roles.map((r) => ROLE_LABEL[r]).join(" ו");
    const layerText = `בשכבת האלגוריתם (עתיד, הצעה של הקורס, לא קוד): ${roles}. בשליטת: ${CONTROL_LABEL[l.control]}.${l.note ? ` ${l.note}.` : ""}`;
    return { ...n, card: { ...n.card, note: n.card.note ? `${n.card.note} ${layerText}` : layerText } };
  }),
);
const shown = computed(() =>
  derived.value.filter((n) => {
    const l = LAYER[n.id];
    if (!l) return role.value === "all" && control.value === "all";
    return (role.value === "all" || l.roles.includes(role.value)) && (control.value === "all" || l.control === control.value);
  }),
);
const ids = computed(() => new Set(shown.value.map((n) => n.id)));
const links = computed(() => map.links.filter((l) => ids.value.has(l.from) && ids.value.has(l.to)));
const count = (r: Role | "all") => derived.value.filter((n) => r === "all" || LAYER[n.id]?.roles.includes(r)).length;
const initial = computed(() => (ids.value.has(props.initial) ? props.initial : shown.value[0]?.id));
const mapKey = computed(() => `${role.value}-${control.value}`);
const label = (r: Role | "all") => (r === "all" ? "הכול" : ROLE_LABEL[r]);
const clabel = (c: Control | "all") => (c === "all" ? "כולם" : CONTROL_LABEL[c]);
</script>

<template>
  <div class="my-6">
    <p class="text-caption text-n600">השכבה היא הצעה של הקורס לאופן שבו האלגוריתם עשוי לראות כל צומת. היא עתיד, לא קוד קיים.</p>
    <fieldset class="mt-3">
      <legend class="text-body-m font-semibold text-n900">תפקיד באלגוריתם</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button
          v-for="r in ROLES"
          :key="r"
          type="button"
          class="min-h-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="role === r ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="role === r"
          @click="role = r"
        >
          {{ label(r) }} <span class="text-caption text-n600">({{ count(r) }})</span>
        </button>
      </div>
    </fieldset>
    <fieldset class="mt-3">
      <legend class="text-body-m font-semibold text-n900">מי שולט</legend>
      <div class="mt-2 flex flex-wrap gap-2" role="group">
        <button
          v-for="c in CONTROLS"
          :key="c"
          type="button"
          class="min-h-11 rounded-md border px-3 py-2 text-body-m transition-colors duration-fast ease-out"
          :class="control === c ? 'border-navy bg-n50 font-semibold text-n900' : 'border-n200 text-n700 hover:bg-n50'"
          :aria-pressed="control === c"
          @click="control = c"
        >
          {{ clabel(c) }}
        </button>
      </div>
    </fieldset>
    <p class="mt-3 text-body-m text-n700" aria-live="polite">מוצגים {{ shown.length }} צמתים מתוך {{ derived.length }}.</p>
    <BigPictureMap :key="mapKey" :regions="map.regions" :nodes="shown" :links="links" :lesson="lesson" new-from="8.1" :initial="initial" />
  </div>
</template>
