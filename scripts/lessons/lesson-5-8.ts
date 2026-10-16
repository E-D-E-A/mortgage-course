/**
 * Lesson 5.8 — the workshop: three alternatives for the main case (case A, נועם ושירה), one for each
 * goal of lesson 5.6, each checked against the limits of Directive 329 as the team transcribed it,
 * run under three scenarios, and read at points in time (what is still owed after 5, 7, 10 … years).
 * Separate terms per track are tried on one of them.
 *
 * Every number the page, its exercises, its builder tasks and its video show is a fact here. The
 * three alternatives are the winners of lesson 5.6's fixed set (checked again here by rank facts);
 * their tracks, price list and scenarios live in src/data/case-a-mix.ts, and the arithmetic in
 * src/lib/calc/sensitivity.ts. checks/kinds/sensitivity.py (with schedule.py and regulation.py)
 * recomputes each fact. Teaching numbers: the rates are the course's price list (an assumption,
 * not market data and not an offer: case A's bank offers come in stage 6); the three scenarios are
 * teaching scenarios, never forecasts.
 */
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import { ALTERNATIVE_IDS, CANDIDATES, CASE_A, GOAL_CONTEXT, INITIAL_MIX, PRICE_LIST, SCENARIOS, candidate, caseAPasses } from "../../src/data/case-a-mix.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney, type Mix, mixFact, rankFact } from "./_sensitivity-facts.ts";
import { share } from "./lesson-3-8.ts";
import { check } from "./regulation-facts.ts";

export const MONTHS = [60, 84, 120, 180, 240, 300] as const;
export const SCENARIO_IDS = ["base", "stress", "relief"] as const;
/** The three alternatives and the initial mix they are measured against, in the page's order. */
export const ALT_IDS = ["initial", "linked", "short", "fixed"] as const;
const BALANCE_MONTHS_VIDEO = [0, 60, 120, 180, 240, 300, 360] as const;

const track = (kind: TrackSpec["kind"], amount: number, years: number): TrackSpec => ({ kind, amount: String(amount), rate: PRICE_LIST[kind], months: years * 12 });

/** Variants of the 25-year alternative with separate terms: the fixed track and the variable track each get their own. */
export const TERM_VARIANTS = [
  { id: "a", fixedYears: 25, varYears: 25 },
  { id: "b", fixedYears: 20, varYears: 30 },
  { id: "c", fixedYears: 30, varYears: 20 },
] as const;
const variantTracks = (v: (typeof TERM_VARIANTS)[number]): TrackSpec[] => [track("variable_unlinked", 1093000, v.varYears), track("fixed_unlinked", 547000, v.fixedYears)];

export default function lesson58(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const mixAt = (id: string, sc: (typeof SCENARIO_IDS)[number]): Mix => ({ tracks: id === "initial" ? INITIAL_MIX : candidate(id).tracks, scenario: SCENARIOS[sc] });

  // ── Case A ──
  const price = add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.equity", CASE_A.equity));
  const loan = add(givenMoney("a.loan", CASE_A.loan));
  add({ id: "a.ltv", kind: "ltv_percent", inputs: { loan: CASE_A.loan, value: CASE_A.price }, value: percentString(ltvPercent(CASE_A.loan, CASE_A.price)) });
  const recognised = add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  const car = add(givenMoney("a.car", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft));
  const disposable = add(difference("a.disposable", recognised, car));
  void price;
  for (const k of ["fixed_unlinked", "variable_unlinked", "prime", "fixed_linked", "variable_linked"] as const) add(given(`price.${k}`, PRICE_LIST[k]));

  // ── The three alternatives (and the initial mix) ──
  for (const id of ALT_IDS) {
    const tracks = id === "initial" ? INITIAL_MIX : candidate(id).tracks;
    tracks.forEach((t, k) => {
      add(givenMoney(`alt.${id}.amount_${k + 1}`, t.amount as string));
      add(given(`alt.${id}.rate_${k + 1}`, t.rate as string));
      add(given(`alt.${id}.years_${k + 1}`, t.months / 12));
    });
    // each scenario: the first payment, the highest (and its month) and the total
    for (const sc of SCENARIO_IDS) {
      const m = mixAt(id, sc);
      add(mixFact(`alt.${id}.${sc}.first`, m, "first"));
      add(mixFact(`alt.${id}.${sc}.max`, m, "max"));
      add(mixFact(`alt.${id}.${sc}.max_month`, m, "max_month"));
      add(mixFact(`alt.${id}.${sc}.total`, m, "total"));
    }
    const base = mixAt(id, "base");
    add(mixFact(`alt.${id}.ratio`, base, "ratio"));
    add(mixFact(`alt.${id}.variable_share`, base, "variable_share"));
    add(mixFact(`alt.${id}.variable_room`, base, "variable_room"));
    const qualifying = add(mixFact(`alt.${id}.qualifying`, base, "qualifying"));
    const variable = add(mixFact(`alt.${id}.variable`, base, "variable"));
    // the balance at chosen points (base scenario)
    for (const month of new Set([...MONTHS, ...BALANCE_MONTHS_VIDEO])) {
      if (month === 0) continue;
      add(mixFact(`alt.${id}.bal.${month}`, base, "balance", { month }));
    }
    for (const month of [60, 120, 180]) add(difference(`alt.${id}.principal_${month}`, loan, get(`alt.${id}.bal.${month}`)));
    add(mixFact(`alt.${id}.left_1`, base, "left", { month: 1 }));
    add(mixFact(`alt.${id}.left_27`, base, "left", { month: 27 }));
    // the five lines of Directive 329 (the team's transcription)
    add(
      check(`alt.${id}.check`, {
        deal: CASE_A.deal,
        value: CASE_A.price,
        loan: CASE_A.loan,
        payment: qualifying.value as string,
        income: disposable.value as string,
        variable: variable.value as string,
        termMonths: Math.max(...tracks.map((t) => t.months)),
      }),
    );
    add(difference(`alt.${id}.rise`, get(`alt.${id}.stress.max`), get(`alt.${id}.base.first`)));
  }

  // ── Each alternative against the initial mix (base scenario) ──
  for (const id of ALT_IDS) {
    if (id === "initial") continue;
    add(difference(`alt.${id}.d_first`, get(`alt.${id}.base.first`), get("alt.initial.base.first")));
    add(difference(`alt.${id}.d_max`, get(`alt.${id}.base.max`), get("alt.initial.base.max")));
    add(difference(`alt.${id}.d_total`, get(`alt.${id}.base.total`), get("alt.initial.base.total")));
  }

  // ── The winners again, from lesson 5.6's set ──
  const allowed = CANDIDATES.filter((c) => caseAPasses(c.tracks)).map((c) => c.id);
  const ctx = { base: SCENARIOS.base, stress: SCENARIOS.stress };
  add(rankFact("rank.payment", { goal: "payment" }, CANDIDATES, ctx, allowed));
  add(rankFact("rank.total", { goal: "total" }, CANDIDATES, ctx, allowed));
  add(rankFact("rank.exposure", { goal: "exposure" }, CANDIDATES, ctx, allowed));
  void GOAL_CONTEXT;
  void ALTERNATIVE_IDS;

  // ── The mix a hurried adviser might propose: more of the linked tracks in the variable one (breaks the two-thirds line) ──
  const heavy: Mix = { tracks: candidate("linked_heavy").tracks, scenario: SCENARIOS.base };
  candidate("linked_heavy").tracks.forEach((t, k) => add(givenMoney(`lh.amount_${k + 1}`, t.amount as string)));
  add(mixFact("lh.first", heavy, "first"));
  add(mixFact("lh.variable_share", heavy, "variable_share"));
  add(mixFact("lh.variable_room", heavy, "variable_room"));

  // ── Separate terms: the variable track and the fixed track each with their own term ──
  for (const v of TERM_VARIANTS) {
    const m: Mix = { tracks: variantTracks(v), scenario: SCENARIOS.base };
    add(mixFact(`term.${v.id}.first`, m, "first"));
    add(mixFact(`term.${v.id}.max`, m, "max"));
    add(mixFact(`term.${v.id}.total`, m, "total"));
    add(mixFact(`term.${v.id}.ratio`, m, "ratio"));
    add(mixFact(`term.${v.id}.bal.120`, m, "balance", { month: 120 }));
    add(given(`term.${v.id}.fixed_years`, v.fixedYears));
    add(given(`term.${v.id}.var_years`, v.varYears));
  }
  add(difference("term.b_first_gap", get("term.a.first"), get("term.b.first")));
  add(difference("term.b_total_gap", get("term.b.total"), get("term.a.total")));
  add(difference("term.c_first_gap", get("term.c.first"), get("term.a.first")));
  add(difference("term.c_total_gap", get("term.a.total"), get("term.c.total")));

  // ── Comparing on one basis, and the slip of comparing across scenarios ──
  add(difference("cmp.gap_same", get("alt.fixed.base.total"), get("alt.short.base.total")));
  add(difference("cmp.err_mixed", get("alt.fixed.stress.total"), get("alt.short.relief.total")));
  add(difference("cmp.short_swing", get("alt.short.stress.total"), get("alt.short.relief.total")));
  add(difference("cmp.linked_swing", get("alt.linked.stress.total"), get("alt.linked.relief.total")));
  add(difference("cmp.fixed_swing", get("alt.fixed.stress.total"), get("alt.fixed.relief.total")));

  // ── Exercises ──
  // 4: what is still owed after 7 years in the linked alternative, against the loan
  const paidDown = add(difference("ex4.paid_down", loan, get("alt.linked.bal.84")));
  add(share("ex4.share", paidDown, loan, 1));

  return {
    lesson: "5.8",
    title: "סדנה: שלוש חלופות לתיק המרכזי",
    note: "Case A's three alternatives (src/data/case-a-mix.ts). Teaching numbers: the rates are the course's price list, an assumption (not market data, not an offer; case A's bank offers are stage 6). Scenarios (teaching scenarios, never forecasts): base = the index rises 2% a year, prime and anchors do not move; stress = 4% a year, prime and every anchor +2 points from year 2; relief = 1% a year, prime and every anchor −1 point from year 2. A balance is what is still owed after that month's payment, under the base scenario. Monthly rate = annual ÷ 12; schedules follow the statement convention.",
    facts,
  };
}
