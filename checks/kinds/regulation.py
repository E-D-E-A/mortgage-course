"""Independent checks for Directive 329's limits and the living budget
(lessons 4.4, 4.5 and 4.6).

Plain Python Decimal; nothing is imported from src/lib/calc. The limits are
written out again here on purpose, so a typo in one place cannot pass the
check in the other.
"""
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
CEILINGS = {"only_home": Decimal(75), "replacement": Decimal(70), "investment": Decimal(50), "any_purpose": Decimal(50)}
PTI_LIMIT = Decimal(50)
PTI_THRESHOLD = Decimal(40)
MAX_TERM_MONTHS = 30 * 12


def floor_agora(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_DOWN)


def money(x):
    return str(agorot(x))


def pct(x):
    """A percent as the course shows it: two decimals, half away from zero, no trailing zeros."""
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    s = format(q.normalize(), "f")
    return "0" if s in ("-0", "0") else s


def numbered(i, prefix):
    out, n = [], 1
    while f"{prefix}_{n}" in i:
        out.append(Decimal(i[f"{prefix}_{n}"]))
        n += 1
    return out


def max_loan(i, _facts=None):
    return money(floor_agora(Decimal(i["value"]) * CEILINGS[i["deal"]] / HUNDRED))


def reduced_value(i, _facts=None):
    price, appraisal = Decimal(i["price"]), Decimal(i["appraisal"])
    if "cap" in i:
        appraisal = min(appraisal, Decimal(i["cap"]))
    return money(max(price, appraisal))


def max_payment(i, _facts=None):
    return money(floor_agora(Decimal(i["income"]) * Decimal(i["percent"]) / HUNDRED))


def max_variable(i, _facts=None):
    return money(floor_agora(Decimal(i["loan"]) * 2 / 3))


def min_fixed(i, _facts=None):
    loan = Decimal(i["loan"])
    return money(loan - floor_agora(loan * 2 / 3))


def variable_share(i, _facts=None):
    return pct(Decimal(i["variable"]) / Decimal(i["loan"]) * HUNDRED)


def two_thirds_rounded(i, _facts=None):
    """Two thirds rounded the usual way, to the agora: slightly MORE than two thirds when the digits repeat."""
    return money(Decimal(i["amount"]) * 2 / 3)


def two_thirds_cut(i, _facts=None):
    """Two thirds cut (not rounded) to three decimals: the digits go on."""
    return str((Decimal(i["amount"]) * 2 / 3).quantize(Decimal("0.001"), rounding=ROUND_DOWN))


def months(i, _facts=None):
    return int(i["years"]) * 12


def check(i, _facts=None):
    value, loan = Decimal(i["value"]), Decimal(i["loan"])
    payment, income = Decimal(i["payment"]), Decimal(i["income"])
    variable, term = Decimal(i["variable"]), int(i["term_months"])
    ceiling = CEILINGS[i["deal"]]
    ltv = loan / value * HUNDRED
    ratio = payment / income * HUNDRED
    return [
        {"id": "ltv", "kind": "regulatory_limit", "limit": pct(ceiling), "actual": pct(ltv),
         "status": "over" if ltv > ceiling else "within",
         "room": money(floor_agora(value * ceiling / HUNDRED) - loan)},
        {"id": "pti", "kind": "regulatory_limit", "limit": pct(PTI_LIMIT), "actual": pct(ratio),
         "status": "over" if ratio > PTI_LIMIT else "within",
         "room": money(floor_agora(income * PTI_LIMIT / HUNDRED) - payment)},
        {"id": "capital", "kind": "capital_threshold", "limit": pct(PTI_THRESHOLD), "actual": pct(ratio),
         "status": "above" if ratio > PTI_THRESHOLD else "within",
         "room": money(floor_agora(income * PTI_THRESHOLD / HUNDRED) - payment)},
        {"id": "variable", "kind": "regulatory_limit", "limit": pct(Decimal(200) / 3), "actual": pct(variable / loan * HUNDRED),
         "status": "within" if variable * 3 <= loan * 2 else "over",
         "room": money(floor_agora(loan * 2 / 3) - variable)},
        {"id": "term", "kind": "regulatory_limit", "limit": str(MAX_TERM_MONTHS), "actual": str(term),
         "status": "over" if term > MAX_TERM_MONTHS else "within",
         "room": str(MAX_TERM_MONTHS - term)},
    ]


def ratio(i, _facts=None):
    """The payment-to-income ratio (lesson 4.3's formula), percent for display."""
    return pct(Decimal(i["payment"]) / Decimal(i["income"]) * HUNDRED)


def weighted(i, _facts=None):
    return money(Decimal(i["amount"]) * Decimal(i["weight"]) / HUNDRED)


def total(i, _facts=None):
    return money(sum(numbered(i, "amount"), Decimal(0)))


def left(i, _facts=None):
    return money(Decimal(i["net"]) - sum(numbered(i, "out"), Decimal(0)))


def per_person(i, _facts=None):
    return money(Decimal(i["amount"]) / int(i["people"]))


def margin(i, _facts=None):
    return money(Decimal(i["left"]) - Decimal(i["budget"]))


def budget_max_payment(i, _facts=None):
    room = Decimal(i["net"]) - sum(numbered(i, "out"), Decimal(0)) - Decimal(i["budget"])
    return money(room if room > 0 else 0)


def monthly_from_yearly(i, _facts=None):
    return money(Decimal(i["yearly"]) / 12)


def payment_table(i, _facts=None):
    """Rows of disposable incomes; each with the largest payment at every percent given."""
    percents = numbered(i, "percent")
    rows = []
    for n, income in enumerate(numbered(i, "income"), start=1):
        row = {"period": n, "income": money(income)}
        for k, p in enumerate(percents, start=1):
            row[f"at_{k}"] = money(floor_agora(income * p / HUNDRED))
        rows.append(row)
    return rows


def variable_table(i, _facts=None):
    rows = []
    for n, loan in enumerate(numbered(i, "loan"), start=1):
        most = floor_agora(loan * 2 / 3)
        rows.append({"period": n, "loan": money(loan), "max_variable": money(most), "min_fixed": money(loan - most)})
    return rows


def living_table(i, _facts=None):
    rows, n = [], 1
    while f"net_{n}" in i:
        net, out, people = Decimal(i[f"net_{n}"]), Decimal(i[f"out_{n}"]), int(i[f"people_{n}"])
        rest = net - out
        name = f"{int(net):,} ₪ נטו · {int(out):,} ₪ תשלומים · {people} נפשות"
        rows.append({"period": n, "name": name, "net": money(net), "out": money(out), "left": money(rest),
                     "people": str(people), "per_person": money(rest / people)})
        n += 1
    return rows


KINDS = {
    "reg_max_loan": max_loan,
    "reg_reduced_value": reduced_value,
    "reg_max_payment": max_payment,
    "reg_max_variable": max_variable,
    "reg_min_fixed": min_fixed,
    "reg_variable_share": variable_share,
    "reg_months": months,
    "reg_two_thirds_rounded": two_thirds_rounded,
    "reg_two_thirds_cut": two_thirds_cut,
    "reg_check": check,
    "reg_ratio": ratio,
    "reg_weighted": weighted,
    "reg_total": total,
    "reg_left": left,
    "reg_per_person": per_person,
    "reg_margin": margin,
    "reg_budget_max_payment": budget_max_payment,
    "reg_monthly_from_yearly": monthly_from_yearly,
    "reg_payment_table": payment_table,
    "reg_variable_table": variable_table,
    "reg_living_table": living_table,
}
