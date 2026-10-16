"""Independent checks for positioning (lessons 6.1-6.3). Fact kinds start with pos_.

Plain Python Decimal; nothing is imported from src/. A mix's flat inputs and its payments come from
checks/kinds/sensitivity.py (itself written without the TypeScript); what is new here is written again from the rules:

  pos_points         a line minus a ratio, in percentage points (positive = room): inputs actual, percent
  pos_payment_room   the largest payment a line allows (income x line / 100, cut down to the agora) minus the
                     payment, shekels a month: inputs disposable, payment, percent
  pos_payment_cut    the same, as what must fall: 0 when within
  pos_loan_room      the largest loan a line allows on a value (cut down to the agora) minus the loan
  pos_equity_needed  the same, as what must be replaced by equity: 0 when within
  pos_income_room    payment x 100 / line, rounded UP to the agora, minus the disposable income; 0 when within
  pos_loan_cut       the least that must come off a mix's loan, in whole steps, for payment / disposable income
                     x 100 to be at most the line. Found by counting up from 0 a step at a time (the TypeScript
                     starts from the proportional cut and settles); the payment is the statement's, each track's level payment rounded to the agora and then added; the mix keeps its proportions as the
                     "amount" lever of sensitivity.py does. Inputs: the mix's flat inputs, disposable, percent, step
  pos_term_route     one level-payment loan, term moved from `from` to `to` months: `measure` is one of
                     from_payment, to_payment (each the level payment rounded to the agora), from_total,
                     to_total (payment x months), payment_drop (from - to), extra_total (to - from)
  pos_shortest_term  the shortest term, from `from` in whole `step`s up to `max`, whose payment is at most `cap`
                     ("none" when no term is)
  pos_standing_table one row per line, as the numbered percents give them: percent, status (within / at /
                     over: strictly above is over), points (line - actual)
"""
from decimal import ROUND_CEILING, ROUND_DOWN, Decimal

from kinds import sensitivity
from kinds.common import agorot

HUNDRED = Decimal(100)
money = sensitivity.money
pct = sensitivity.pct


def _floor_agora(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_DOWN)


def _ceil_agora(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_CEILING)


def _level(principal, annual, months):
    m = Decimal(str(annual)) / 12 / HUNDRED
    if m == 0:
        return Decimal(str(principal)) / months
    return Decimal(str(principal)) * m / (1 - (1 + m) ** (-months))


def points(i, _facts=None):
    return pct(Decimal(str(i["percent"])) - Decimal(str(i["actual"])))


def _payment_room(i):
    return _floor_agora(Decimal(str(i["disposable"])) * Decimal(str(i["percent"])) / HUNDRED) - Decimal(str(i["payment"]))


def payment_room(i, _facts=None):
    return money(_payment_room(i))


def payment_cut(i, _facts=None):
    room = _payment_room(i)
    return money(-room if room < 0 else 0)


def _loan_room(i):
    return _floor_agora(Decimal(str(i["value"])) * Decimal(str(i["percent"])) / HUNDRED) - Decimal(str(i["loan"]))


def loan_room(i, _facts=None):
    return money(_loan_room(i))


def equity_needed(i, _facts=None):
    room = _loan_room(i)
    return money(-room if room < 0 else 0)


def income_room(i, _facts=None):
    need = _ceil_agora(Decimal(str(i["payment"])) * HUNDRED / Decimal(str(i["percent"])))
    room = need - Decimal(str(i["disposable"]))
    return money(room if room > 0 else 0)


def _statement(j):
    """The mix's payment as a statement shows it: each track's level payment rounded to the agora, then added."""
    return sum((agorot(_level(a, r, m)) for _, a, r, m in sensitivity._tracks(j)), Decimal(0))


def loan_cut(i, _facts=None):
    cap = Decimal(str(i["percent"]))
    step = Decimal(str(i["step"]))
    disposable = Decimal(str(i["disposable"]))
    cut = Decimal(0)
    while True:
        j = sensitivity._flow_inputs({**i, "lever": "amount", "lever_change": str(-cut)}) if cut else sensitivity._flow_inputs(dict(i))
        if _statement(j) / disposable * HUNDRED <= cap:
            return money(cut)
        cut += step
        if cut >= sensitivity._loan(sensitivity._flow_inputs(dict(i))):
            raise ValueError("no cut short of the whole loan reaches the line")


def term_route(i, _facts=None):
    principal, rate = i["principal"], i["rate"]
    a, b = int(i["from"]), int(i["to"])
    pay_a, pay_b = agorot(_level(principal, rate, a)), agorot(_level(principal, rate, b))
    tot_a, tot_b = pay_a * a, pay_b * b
    return money(
        {
            "from_payment": pay_a,
            "to_payment": pay_b,
            "from_total": tot_a,
            "to_total": tot_b,
            "payment_drop": pay_a - pay_b,
            "extra_total": tot_b - tot_a,
        }[i["measure"]]
    )


def shortest_term(i, _facts=None):
    months = int(i["from"])
    while months <= int(i["max"]):
        if agorot(_level(i["principal"], i["rate"], months)) <= Decimal(str(i["cap"])):
            return months
        months += int(i["step"])
    return "none"


def standing_table(i, _facts=None):
    actual = Decimal(str(i["actual"]))
    rows = []
    n = 1
    while f"percent_{n}" in i:
        line = Decimal(str(i[f"percent_{n}"]))
        status = "within" if actual < line else ("at" if actual == line else "over")
        rows.append({"period": n, "percent": str(i[f"percent_{n}"]), "status": status, "points": pct(line - actual)})
        n += 1
    return rows


KINDS = {
    "pos_points": points,
    "pos_payment_room": payment_room,
    "pos_payment_cut": payment_cut,
    "pos_loan_room": loan_room,
    "pos_equity_needed": equity_needed,
    "pos_income_room": income_room,
    "pos_loan_cut": loan_cut,
    "pos_term_route": term_route,
    "pos_shortest_term": shortest_term,
    "pos_standing_table": standing_table,
}
