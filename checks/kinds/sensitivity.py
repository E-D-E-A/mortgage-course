"""Independent checks for sensitivity and the three goals (lessons 5.6-5.8). Fact kinds
start with sens_.

Plain Python Decimal; nothing is imported from src/. The schedules themselves come from
checks/kinds/schedule.py (itself written without the TypeScript): a mix's flat inputs are the
same ones schedule.py reads. What is new here is written again from the rules:

  sens_mix    one number about a mix under a scenario, by `measure`:
                first, max, max_month, total, months, loan, qualifying, variable   (the mix)
                payment (month), balance (month), left (month, net, other_monthly, other_months)
                ratio (income, obligation_monthly, obligation_months): the payment-to-income
                  ratio in percent, from the qualifying payment (each track's level payment on
                  its full amount, no index), over the income minus an obligation that counts
                  when MORE than 18 months are left
                variable_share (percent of the loan not fixed for its whole term),
                variable_room (two-thirds of the loan, cut down to the agora, minus the variable part)
              optionally after ONE lever has moved (inputs `lever` + its fields):
                percent  lever_from, lever_to, lever_points   (points of the loan, track to track)
                amount   lever_change                         (shekels; tracks keep their proportions)
                term     lever_track (k or "all"), lever_months
                rate     lever_track (k or "all"), lever_points
                index    lever_points                         (added to every year's inflation)
                market   lever_points                         (added to prime's shift from year 2
                                                               and to every anchor shift)
  sens_divide a money fact divided by a step: the change in a result per unit of the lever.
  sens_table  one row per candidate mix: the measures of lesson 5.6's table.
  sens_rank   the candidates ranked for one goal among the allowed ones.

Goals: payment (the payment in month `month`, or the highest payment under the base scenario),
total (total paid under the base scenario), exposure (the highest payment under the stress
scenario minus the first payment under the base one). Smaller is better; a tie keeps the order
of the list. A scenario is inflation, prime shift (from year 2) and anchor shift, as the builder
writes it. Every schedule is rounded the statement way (schedule.py's "statement").
"""
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from kinds import schedule
from kinds.common import agorot

HUNDRED = Decimal(100)
FIXED_FOR_TERM = ("fixed_unlinked", "fixed_linked")
PTI_LIMIT = Decimal(50)
LTV_CEILING = Decimal(75)
MAX_TERM = 360


def money(x):
    return str(agorot(x))


def pct(x):
    """A percent as the course shows it: two decimals, half away from zero, no trailing zeros."""
    s = format(Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize(), "f")
    return "0" if s in ("-0", "0") else s


def _flow_inputs(i):
    """The flat inputs schedule.py reads: the same dict, with the lever (if any) applied."""
    j = dict(i)
    j["rounding"] = "statement"
    lever = i.get("lever")
    n = int(j["tracks"])
    if lever == "percent":
        loan = sum((Decimal(str(j[f"t{k}_amount"])) for k in range(1, n + 1)), Decimal(0))
        shift = agorot(loan * Decimal(str(i["lever_points"])) / HUNDRED)
        a, b = int(i["lever_from"]), int(i["lever_to"])
        j[f"t{a}_amount"] = str(Decimal(str(j[f"t{a}_amount"])) - shift)
        j[f"t{b}_amount"] = str(Decimal(str(j[f"t{b}_amount"])) + shift)
    elif lever == "amount":
        amounts = [Decimal(str(j[f"t{k}_amount"])) for k in range(1, n + 1)]
        whole = sum(amounts, Decimal(0))
        new = whole + Decimal(str(i["lever_change"]))
        parts = [agorot(new * a / whole) for a in amounts[:-1]]
        parts.append(new - sum(parts, Decimal(0)))
        for k, amount in enumerate(parts, start=1):
            j[f"t{k}_amount"] = str(amount)
    elif lever == "term":
        which = range(1, n + 1) if str(i["lever_track"]) == "all" else [int(i["lever_track"])]
        for k in which:
            j[f"t{k}_months"] = int(j[f"t{k}_months"]) + int(i["lever_months"])
    elif lever == "rate":
        which = range(1, n + 1) if str(i["lever_track"]) == "all" else [int(i["lever_track"])]
        for k in which:
            j[f"t{k}_rate"] = str(Decimal(str(j[f"t{k}_rate"])) + Decimal(str(i["lever_points"])))
    elif lever == "index":
        k = 1
        while f"inflation_{k}" in j:
            j[f"inflation_{k}"] = str(Decimal(str(j[f"inflation_{k}"])) + Decimal(str(i["lever_points"])))
            k += 1
    elif lever == "market":
        points = Decimal(str(i["lever_points"]))
        k = 2  # prime moves from year 2 (the builder's default); year 1 stays at today's prime
        while f"prime_shift_{k}" in j:
            j[f"prime_shift_{k}"] = str(Decimal(str(j[f"prime_shift_{k}"])) + points)
            k += 1
        for name in ("anchor_shift", "linked_anchor_shift"):
            k = 1
            while f"{name}_{k}" in j:
                j[f"{name}_{k}"] = str(Decimal(str(j[f"{name}_{k}"])) + points)
                k += 1
    return j


def _tracks(j):
    return [
        (j[f"t{k}_kind"], Decimal(str(j[f"t{k}_amount"])), Decimal(str(j[f"t{k}_rate"])), int(j[f"t{k}_months"]))
        for k in range(1, int(j["tracks"]) + 1)
    ]


def _loan(j):
    return sum((a for _, a, _, _ in _tracks(j)), Decimal(0))


def _qualifying(j):
    return sum((schedule.level_payment(a, r, m) for _, a, r, m in _tracks(j)), Decimal(0))


def _variable(j):
    return sum((a for kind, a, _, _ in _tracks(j) if kind not in FIXED_FOR_TERM), Decimal(0))


def _floor_agora(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_DOWN)


def _ratio(j, income, monthly, months_left):
    deducted = Decimal(monthly) if int(months_left) > 18 else Decimal(0)
    return _qualifying(j) / (Decimal(income) - deducted) * HUNDRED


def sens_mix(i, _facts=None):
    j = _flow_inputs(i)
    measure = i["measure"]
    if measure in ("first", "max", "max_month", "total", "months", "payment", "balance", "left"):
        payments, tracks = schedule.flow(j)
        if measure == "first":
            return money(payments[0])
        if measure == "max":
            return money(max(payments))
        if measure == "max_month":
            cents = [agorot(p) for p in payments]  # equal payments to the agora tie; the first wins
            return cents.index(max(cents)) + 1
        if measure == "total":
            return money(sum(payments, Decimal(0)))
        if measure == "months":
            return len(payments)
        month = int(i["month"])
        pay = payments[month - 1] if 1 <= month <= len(payments) else Decimal(0)
        if measure == "payment":
            return money(pay)
        if measure == "balance":
            if month == 0:
                return money(_loan(j))
            return money(sum((t["rows"][month - 1]["closing"] for t in tracks if month <= len(t["rows"])), Decimal(0)))
        running = Decimal(i["other_monthly"]) if month <= int(i["other_months"]) else Decimal(0)
        return money(Decimal(i["net"]) - pay - running)
    if measure == "loan":
        return money(_loan(j))
    if measure == "qualifying":
        return money(_qualifying(j))
    if measure == "variable":
        return money(_variable(j))
    if measure == "ratio":
        return pct(_ratio(j, i["income"], i["obligation_monthly"], i["obligation_months"]))
    if measure == "variable_share":
        return pct(_variable(j) / _loan(j) * HUNDRED)
    if measure == "variable_room":
        return money(_floor_agora(_loan(j) * 2 / 3) - _variable(j))
    raise ValueError(f"unknown measure {measure}")


# --- candidates -------------------------------------------------------------------------

def _scenario_fields(prefix, i):
    """The flat scenario fields schedule.py reads, from `<prefix>_inflation`, `_prime_shift`, `_anchor_shift`."""
    out = {"block_months": 12, "rounding": "statement"}
    out["inflation_1"] = str(i[f"{prefix}_inflation"])
    out["prime_shift_1"] = "0"
    out["prime_shift_2"] = str(i[f"{prefix}_prime_shift"])
    out["anchor_shift_1"] = str(i[f"{prefix}_anchor_shift"])
    return out


def _candidate_inputs(i, n, prefix):
    out = _scenario_fields(prefix, i)
    parts = str(i[f"c{n}_tracks"]).split(";")
    out["tracks"] = len(parts)
    for k, part in enumerate(parts, start=1):
        kind, amount, rate, months = part.split("|")
        out[f"t{k}_kind"], out[f"t{k}_amount"], out[f"t{k}_rate"], out[f"t{k}_months"] = kind, amount, rate, int(months)
        out[f"t{k}_method"] = "spitzer"
        if kind in ("variable_unlinked", "variable_linked"):
            out[f"t{k}_reset"] = 60
    return out


def _candidates(i):
    return [(str(i[f"c{n}_id"]), n) for n in range(1, int(i["candidates"]) + 1)]


def _passes(j, i):
    loan = _loan(j)
    ratio = _ratio(j, i["income"], i["obligation_monthly"], i["obligation_months"])
    variable_ok = _variable(j) * 3 <= loan * 2
    term = max(m for _, _, _, m in _tracks(j))
    return loan / Decimal(i["price"]) * HUNDRED <= LTV_CEILING and ratio <= PTI_LIMIT and variable_ok and term <= MAX_TERM


def sens_table(i, _facts=None):
    rows = []
    for cid, n in _candidates(i):
        base = _candidate_inputs(i, n, "base")
        stress = _candidate_inputs(i, n, "stress")
        pb = schedule.flow(base)[0]
        ps = schedule.flow(stress)[0]
        cents = [agorot(p) for p in pb]
        rows.append(
            {
                "id": cid,
                "first": money(pb[0]),
                "max": money(max(pb)),
                "max_month": cents.index(max(cents)) + 1,
                "total": money(sum(pb, Decimal(0))),
                "stress_max": money(max(ps)),
                "rise": money(max(ps) - pb[0]),
                "ratio": pct(_ratio(base, i["income"], i["obligation_monthly"], i["obligation_months"])),
                "variable_share": pct(_variable(base) / _loan(base) * HUNDRED),
                "passes": "yes" if _passes(base, i) else "no",
            }
        )
    return rows


def _score(goal, i, n):
    base = _candidate_inputs(i, n, "base")
    pb = schedule.flow(base)[0]
    if goal == "payment":
        month = i.get("month", 1)
        if month == "highest":
            return agorot(max(pb))
        month = int(month)
        return agorot(pb[month - 1] if month <= len(pb) else 0)
    if goal == "total":
        return agorot(sum(pb, Decimal(0)))
    ps = schedule.flow(_candidate_inputs(i, n, "stress"))[0]
    return agorot(max(ps) - pb[0])


def sens_rank(i, _facts=None):
    allowed = set(str(i["allowed"]).split("|")) if i.get("allowed") else set()
    scored = [(cid, _score(i["goal"], i, n)) for cid, n in _candidates(i)]
    order = sorted((s for s in scored if s[0] in allowed), key=lambda s: s[1])  # sorted() is stable: ties keep list order
    rank = {cid: k + 1 for k, (cid, _) in enumerate(order)}
    return [{"id": cid, "score": str(score), "allowed": "yes" if cid in allowed else "no", "rank": rank.get(cid)} for cid, score in scored]


def sens_divide(i, _facts=None):
    """One money fact divided by a step, to the agora: the sensitivity of a result to a lever (lesson 5.7)."""
    return money(Decimal(_facts[i["value"]]["value"]) / Decimal(str(i["by"])))


KINDS = {
    "sens_divide": sens_divide,
    "sens_mix": sens_mix,
    "sens_table": sens_table,
    "sens_rank": sens_rank,
}
