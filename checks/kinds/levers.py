"""Independent checks for the price of each lever (lessons 6.4 and 6.5). Fact kinds start with lev_.

Plain Python Decimal; nothing is imported from src/. The schedules and the level payment come
from checks/kinds/schedule.py and the lever moves on a mix from checks/kinds/sensitivity.py
(both written without the TypeScript). What is new here is written again from the rules:

  lev_measure  one number about a case, optionally after ONE lever has been pulled.
               The case: price, equity, reserve, deal (only_home: financing ceiling 75%),
               incomes ("12400|9300", the recognised net incomes), one obligation
               (obligation_monthly, obligation_months; "0" for none), optionally living_budget,
               the tracks as sens_table writes them (candidates=1, c1_tracks "kind|amount|rate|months;…")
               and two scenarios (base_*, stress_*: inflation, prime_shift, anchor_shift).
               The lever (inputs `lever` plus its fields):
                 equity      lever_add       shekels from the reserve into the purchase; the loan falls by as much
                 close_loan  lever_payoff, lever_source ("equity" | "reserve"); the obligation is gone;
                             from the equity the loan grows by the payoff, from the reserve the reserve falls
                 wait        lever_months    the obligation has that many fewer payments left (not below 0)
                 borrower    lever_income    one more recognised income
                 term        lever_months    every track's term changes (negative: shorter)
                 mix         lever_from_track, lever_to_track, lever_points   (points of the loan, track to track)
               measure: loan, ltv (percent), qualifying (each track's level payment on its full
               amount, added), variable (the part of the loan not fixed for its whole term), disposable (incomes − the obligation when MORE than 18 payments are
               left), ratio (percent), first, total (base scenario), stress_max, stress_month,
               left_first (month 1, base), left_stress (the stress scenario's highest month),
               margin_first, margin_stress (left − living_budget), reserve, equity, months, months_left (payments left on the obligation after the lever), bans
               (the bans of Directive 329 crossed, "ltv|pti|variable|term" in that order, or "none"),
               above_capital ("yes" when the ratio is above 40%).
  lev_step     the smallest whole `step` of extra equity (up to the reserve) that brings the ratio to
               `target` percent or below (0 if it is already there); "none" if there is no such amount.
  lev_div      a money fact divided by a points fact (the price of one percentage point), to the
               agora; "none" when the points are not above zero.

Every schedule is rounded the statement way (schedule.py's "statement"), as sensitivity.py does.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds import schedule, sensitivity
from kinds.common import agorot

HUNDRED = Decimal(100)
CAPITAL = Decimal(40)
PTI = Decimal(50)
LTV_CEILING = Decimal(75)
MAX_TERM = 360
OBLIGATION_MONTHS = 18


def money(x):
    return str(agorot(x))


def pct(x):
    """A percent as the course shows it: two decimals, half away from zero, no trailing zeros."""
    s = format(Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize(), "f")
    return "0" if s in ("-0", "0") else s


def _track_lever(i):
    """The same lever as sensitivity.py's, for the moves that change the mix."""
    lever = i.get("lever")
    if lever == "equity":
        return {"lever": "amount", "lever_change": -Decimal(str(i["lever_add"]))}
    if lever == "close_loan" and i["lever_source"] == "equity":
        return {"lever": "amount", "lever_change": Decimal(str(i["lever_payoff"]))}
    if lever == "term":
        return {"lever": "term", "lever_track": "all", "lever_months": int(i["lever_months"])}
    if lever == "mix":
        return {"lever": "percent", "lever_from": int(i["lever_from_track"]), "lever_to": int(i["lever_to_track"]), "lever_points": str(i["lever_points"])}
    return {"lever": None}


def _case(i):
    """The case after the lever: money, incomes, the obligation, and the two scenarios' flat inputs."""
    lever = i.get("lever")
    price, equity, reserve = (Decimal(str(i[k])) for k in ("price", "equity", "reserve"))
    incomes = [Decimal(x) for x in str(i["incomes"]).split("|")]
    monthly, months_left = Decimal(str(i["obligation_monthly"])), int(i["obligation_months"])
    if lever == "equity":
        add = Decimal(str(i["lever_add"]))
        equity, reserve = equity + add, reserve - add
    elif lever == "close_loan":
        payoff = Decimal(str(i["lever_payoff"]))
        monthly, months_left = Decimal(0), 0
        if i["lever_source"] == "equity":
            equity = equity - payoff
        else:
            reserve = reserve - payoff
    elif lever == "wait":
        months_left = max(0, months_left - int(i["lever_months"]))
    elif lever == "borrower":
        incomes.append(Decimal(str(i["lever_income"])))
    flat = _track_lever(i)
    base = sensitivity._flow_inputs({**sensitivity._candidate_inputs(i, 1, "base"), **flat})
    stress = sensitivity._flow_inputs({**sensitivity._candidate_inputs(i, 1, "stress"), **flat})
    return price, equity, reserve, incomes, monthly, months_left, base, stress


def _bans(loan, price, ratio, variable, term):
    bans = []
    if loan / price * HUNDRED > LTV_CEILING:
        bans.append("ltv")
    if ratio > PTI:
        bans.append("pti")
    if variable * 3 > loan * 2:
        bans.append("variable")
    if term > MAX_TERM:
        bans.append("term")
    return "|".join(bans) if bans else "none"


def lev_measure(i, _facts=None):
    price, equity, reserve, incomes, monthly, months_left, base, stress = _case(i)
    measure = i["measure"]
    income = sum(incomes, Decimal(0))
    loan = sensitivity._loan(base)
    qualifying = sensitivity._qualifying(base)
    deducted = monthly if months_left > OBLIGATION_MONTHS else Decimal(0)
    disposable = income - deducted
    ratio = qualifying / disposable * HUNDRED
    if measure == "loan":
        return money(loan)
    if measure == "ltv":
        return pct(loan / price * HUNDRED)
    if measure == "qualifying":
        return money(qualifying)
    if measure == "disposable":
        return money(disposable)
    if measure == "ratio":
        return pct(ratio)
    if measure == "reserve":
        return money(reserve)
    if measure == "equity":
        return money(equity)
    if measure == "months_left":
        return months_left
    if measure == "variable":
        return money(sensitivity._variable(base))
    if measure == "above_capital":
        return "yes" if ratio > CAPITAL else "no"
    base_pay, _ = schedule.flow(base)
    if measure == "months":
        return len(base_pay)
    if measure == "first":
        return money(base_pay[0])
    if measure == "total":
        return money(sum(base_pay, Decimal(0)))
    if measure == "bans":
        term = max(m for _, _, _, m in sensitivity._tracks(base))
        return _bans(loan, price, ratio, sensitivity._variable(base), term)
    stress_pay, _ = schedule.flow(stress)
    cents = [agorot(p) for p in stress_pay]
    month = cents.index(max(cents)) + 1  # equal payments to the agora tie; the first wins
    if measure == "stress_max":
        return money(max(stress_pay))
    if measure == "stress_month":
        return month
    running = lambda m: monthly if (monthly > 0 and m <= months_left) else Decimal(0)  # noqa: E731
    left_first = income - base_pay[0] - running(1)
    left_stress = income - stress_pay[month - 1] - running(month)
    if measure == "left_first":
        return money(left_first)
    if measure == "left_stress":
        return money(left_stress)
    budget = Decimal(str(i["living_budget"]))
    if measure == "margin_first":
        return money(left_first - budget)
    if measure == "margin_stress":
        return money(left_stress - budget)
    raise ValueError(f"unknown measure {measure}")


def lev_step(i, _facts=None):
    step, target = Decimal(str(i["step"])), Decimal(str(i["target"]))
    reserve = Decimal(str(i["reserve"]))
    if Decimal(lev_measure(dict(i, lever=None, measure="ratio"))) <= target:
        return money(Decimal(0))
    add = step
    while add <= reserve:
        j = dict(i, lever="equity", lever_add=str(add), measure="ratio")
        if Decimal(lev_measure(j)) <= target:
            return money(add)
        add += step
    return "none"


def lev_div(i, facts):
    points = Decimal(facts[i["points"]]["value"])
    if points <= 0:
        return "none"
    return money(Decimal(facts[i["amount"]]["value"]) / points)


KINDS = {
    "lev_measure": lev_measure,
    "lev_step": lev_step,
    "lev_div": lev_div,
}
