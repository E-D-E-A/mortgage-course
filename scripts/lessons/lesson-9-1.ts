/**
 * Lesson 9.1 — the whole file of case A, part 1: the data, the documents, what is verified, and the ability to pay.
 * Every number the page, its exercises, its document checker and its video show is a fact here.
 *
 * Case A is the course's main case with the numbers of earlier stages unchanged (price 2,200,000; equity 560,000; incomes 12,400 and
 * 9,300 net; a car loan of 1,450 with 26 payments left; savings kept outside the equity 40,000; the starting mix of lesson 5.8). What
 * this lesson adds is the FILE: the example documents of src/data/case-a-final.ts, all invented ("מסמך לדוגמה"), and what they show.
 * Nothing says what a real bank asks for or decides: which documents, how old, and how strict "verified" is are field knowledge or each
 * bank's own form (FK-H-033, FK-H-034, awaiting Eylon). The living budget (11,500 a month) is the file's own teaching number.
 *
 * Arithmetic: casefile.ts composes affordability.ts (payslips, the 18-month rule, the ratio), regulation.ts (the financing ceiling, the
 * largest payment, the budget) and sensitivity.ts (the starting mix). Python checks: casefile.py (the new kinds) and, for everything an
 * earlier stage already computed, affordability.py, regulation.py, ltv.py, underwriting.py, sensitivity.py, metrics.py, common.py.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { APPRAISALS, EQUITY_PIECES, FILE, LIVING_BUDGET, PAYSLIPS, STATEMENT, type PersonId } from "../../src/data/case-a-final.ts";
import { INITIAL_MIX, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { RESERVE } from "../../src/data/case-a-levers.ts";
import { claimStates, equityOf, householdIncome, payslipRow } from "../../src/lib/calc/casefile.ts";
import type { Obligation } from "../../src/lib/calc/affordability.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, given as givenRaw, net as netFact, netToPay, sum, untilDrop } from "./affordability-facts.ts";
import { CLAIM_IDS, claimStateFact, closingFact, countStatesFact, docStateFact, equityFact, incomeFact, statementFact } from "./_casefile-facts.ts";
import { difference as diffAny, givenMoney, mixFact } from "./_sensitivity-facts.ts";
import { appraisalTable, depositTable, dividePercent, verifyTable } from "./_underwriting-facts.ts";
import { budgetMax, ltv, margin, maxLoan, maxPayment } from "./regulation-facts.ts";
import { DOCUMENTS } from "../../src/data/case-a-final.ts";

const CAR: Obligation = FILE.car;
const times = (id: string, of: Fact, count: number): Fact => ({ id, kind: "met_times", inputs: { of: of.id, count }, value: moneyString(new Decimal(of.value as string).mul(count)) });

export default function lesson91(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const diff = (id: string, a: string, b: string) => add(diffAny(id, get(a), get(b)));

  // ── The case, as the earlier stages give it ──
  add(givenMoney("a.price", FILE.price));
  add(equityFact("a.equity", "declared"));
  if (get("a.equity").value !== `${FILE.equity}.00`) throw new Error("the equity pieces no longer add up to the case's equity");
  diff("a.loan", "a.price", "a.equity");
  add(ltv("a.ltv", get("a.loan").value as string, get("a.price").value as string));
  add(maxLoan("a.max_loan", FILE.price, "only_home"));
  diff("a.room", "a.max_loan", "a.loan");
  add(givenMoney("a.car", CAR.monthly));
  add(givenRaw("a.car_months", CAR.monthsLeft as number));
  add(givenMoney("a.car_payoff", FILE.carPayoff));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("bud.value", LIVING_BUDGET));

  // ── The payslips: each is gross → mandatory deductions → שכר נטו → other deductions → נטו לתשלום ──
  (Object.keys(PAYSLIPS) as PersonId[]).forEach((p) => {
    PAYSLIPS[p].forEach((slip, k) => {
      const id = `ps.${p}.${k + 1}`;
      add(givenMoney(`${id}.gross`, slip.gross));
      slip.mandatory.forEach((d, j) => add(givenMoney(`${id}.m${j + 1}`, d.amount)));
      add(sum(`${id}.mandatory`, slip.mandatory.map((d) => d.amount)));
      const n = add(netFact(`${id}.net`, slip.gross, slip.mandatory.map((d) => d.amount)));
      slip.other.forEach((d, j) => add(givenMoney(`${id}.o${j + 1}`, d.amount)));
      add(netToPay(`${id}.pay`, n.value as string, slip.other.map((d) => d.amount)));
      add(givenMoney(`${id}.oneoff`, slip.oneOffNet));
      diff(`${id}.regular`, `${id}.net`, `${id}.oneoff`);
      // The same figures, as the module computes them: the fact and the module may never differ.
      const row = payslipRow(slip);
      if (row.net.toFixed(2) !== n.value || row.recognisedNet.toFixed(2) !== get(`${id}.regular`).value) throw new Error(`payslip ${id} differs from casefile.ts`);
    });
  });

  // ── Recognised income ──
  add(givenMoney("inc.declared.noam", FILE.incomes.noam));
  add(givenMoney("inc.declared.shira", FILE.incomes.shira));
  for (const p of ["noam", "shira"] as const) {
    add(incomeFact(`inc.${p}.recognised`, p, "recognised"));
    add(incomeFact(`inc.${p}.naive`, p, "naive"));
  }
  add(incomeFact("inc.shira.oneoffs", "shira", "oneoffs"));
  add(sum("inc.total.declared", [FILE.incomes.noam, FILE.incomes.shira]));
  add(sum("inc.total.recognised", [get("inc.noam.recognised").value as string, get("inc.shira.recognised").value as string]));
  add(sum("inc.total.naive", [get("inc.noam.naive").value as string, get("inc.shira.naive").value as string]));
  if (get("inc.total.recognised").value !== `${householdIncome().recognised.toFixed(2)}`) throw new Error("recognised income differs from casefile.ts");
  diff("inc.inflate", "inc.total.naive", "inc.total.recognised");
  diff("gap.bonus", "inc.shira.naive", "inc.shira.recognised");
  add(
    verifyTable("ver.income", [
      { line: "נועם", declared: FILE.incomes.noam, verified: get("inc.noam.recognised").value as string },
      { line: "שירה", declared: FILE.incomes.shira, verified: get("inc.shira.recognised").value as string },
    ]),
  );

  // ── The account statement, and what it adds to the payslips ──
  add(statementFact("st.table"));
  add(closingFact("st.closing"));
  for (const p of EQUITY_PIECES) add(givenMoney(`eq.${p.id.replace("equity_", "")}`, p.declared));
  add(sum("st.needed", [get("eq.savings").value as string, get("a.reserve").value as string]));
  diff("st.slack", "st.closing", "st.needed");
  STATEMENT.forEach((m, k) => {
    add(givenMoney(`dep.noam.${k + 1}.deposit`, m.deposit.noam));
    add(givenMoney(`dep.shira.${k + 1}.deposit`, m.deposit.shira));
  });
  for (const p of ["noam", "shira"] as const) {
    add(
      depositTable(
        `dep.${p}`,
        STATEMENT.map((m, k) => ({ month: m.month, net: get(`ps.${p}.${k + 1}.pay`).value as string, deposit: m.deposit[p] })),
      ),
    );
  }
  diff("gap.aug", "ps.noam.2.pay", "dep.noam.2.deposit");
  diff("ex.err_net_gap", "ps.noam.2.net", "dep.noam.2.deposit");
  diff("dep.net_vs_pay", "ps.noam.1.net", "ps.noam.1.pay");

  // ── Obligations: three documents, one loan ──
  add(untilDrop("ob.until", CAR.monthsLeft as number));
  add(times("ob.remaining", get("a.car"), CAR.monthsLeft as number));
  diff("ob.vs_payoff", "ob.remaining", "a.car_payoff");

  // ── The equity, piece by piece, and what the ceiling does to each view ──
  add(equityFact("eq.documented", "documented"));
  add(equityFact("eq.verified", "verified"));
  if (get("eq.documented").value !== `${equityOf("documented").toFixed(2)}`) throw new Error("equity differs from casefile.ts");
  diff("eq.min", "a.price", "a.max_loan");
  for (const v of ["documented", "verified"] as const) {
    diff(`loan.${v}`, "a.price", `eq.${v}`);
    add(ltv(`ltv.${v}`, get(`loan.${v}`).value as string, get("a.price").value as string));
    diff(`room.${v}`, "a.max_loan", `loan.${v}`);
    diff(`short.${v}`, `loan.${v}`, "a.max_loan");
  }
  add(
    verifyTable(
      "ver.equity",
      EQUITY_PIECES.map((p) => ({
        line: p.label,
        declared: p.declared,
        verified: claimStates()[p.id] === "ok" ? p.declared : "0",
      })),
    ),
  );

  // ── The sheet of feasibility ──
  const recognised = get("inc.total.recognised").value as string;
  add(disposable("sh.disposable", recognised, [CAR]));
  add(maxPayment("sh.max50", get("sh.disposable").value as string, "50"));
  add(maxPayment("sh.max40", get("sh.disposable").value as string, "40"));
  add(disposable("sh.disposable_after", recognised, []));
  add(maxPayment("sh.max40_after", get("sh.disposable_after").value as string, "40"));
  add(budgetMax("bud.max", recognised, [CAR.monthly], LIVING_BUDGET));
  diff("bud.vs40", "bud.max", "sh.max40");

  // ── The starting mix of lesson 5.8, against the sheet ──
  const mix = { tracks: INITIAL_MIX, scenario: SCENARIOS.base };
  add(mixFact("mix.loan", mix, "loan"));
  add(mixFact("mix.payment", mix, "qualifying"));
  add(mixFact("mix.ratio", mix, "ratio"));
  add(mixFact("mix.left", mix, "left", { month: 1 }));
  add(margin("mix.margin", get("mix.left").value as string, LIVING_BUDGET));
  diff("mix.over40", "mix.payment", "sh.max40");

  // ── The appraisal: not in the file yet, so the file plans for a range ──
  add(appraisalTable("appr.table", FILE.price, get("a.loan").value as string, "75", [...APPRAISALS]));
  add(dividePercent("appr.breakeven", get("a.loan").value as string, "75"));
  diff("appr.slack", "a.price", "appr.breakeven");

  // ── The states: every document, every claim, and the count ──
  for (const d of DOCUMENTS) add(docStateFact(`st.doc.${d.id}`, d.id));
  for (const c of CLAIM_IDS) add(claimStateFact(`st.claim.${c}`, c));
  add(countStatesFact("st.count"));

  return {
    lesson: "9.1",
    title: "התיק המסכם, א׳: נתונים, מסמכים, אימות ויכולת החזר",
    note: "Case A (price 2,200,000; equity 560,000 = savings 260,000 + a provident fund 100,000 + a gift 200,000; incomes 12,400 and 9,300 net; a car loan of 1,450 for 26 more months; savings kept outside the equity 40,000; the starting mix of lesson 5.8). The example documents (payslips, an account statement, a credit summary, a car-loan statement, a land-registry extract, a draft contract, a gift letter, a provident-fund report) are invented teaching props; which documents a real bank asks for is field knowledge, awaiting Eylon. The living budget of 11,500 a month is a calculation assumption of the file. Nothing here says what a bank would do.",
    facts,
  };
}
