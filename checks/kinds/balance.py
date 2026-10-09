"""Independent checks for one debt balance and its two forces (lessons 2.11, 2.12).

The yearly teaching model: indexation X = P x pi; interest on the indexed
balance (P + X) x r; one payment C at the end of the year. A rate change adds
P x (new - old) of interest and leaves the balance itself alone.

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)


def rate(i, key):
    return Decimal(str(i.get(key, "0"))) / HUNDRED


def indexation(i, _facts=None):
    return str(agorot(Decimal(i["balance"]) * rate(i, "inflation_percent")))


def interest(i, _facts=None):
    p = Decimal(i["balance"])
    return str(agorot((p + p * rate(i, "inflation_percent")) * rate(i, "rate_percent")))


def interest_on_indexation(i, _facts=None):
    p = Decimal(i["balance"])
    return str(agorot(p * rate(i, "inflation_percent") * rate(i, "rate_percent")))


def rate_change_interest(i, _facts=None):
    p = Decimal(i["balance"])
    return str(agorot(p * (rate(i, "new_rate_percent") - rate(i, "old_rate_percent"))))


def after_year(i, _facts=None):
    p = Decimal(i["balance"])
    return str(agorot(p * (1 + rate(i, "inflation_percent")) * (1 + rate(i, "rate_percent")) - Decimal(i["payment"])))


def table(i, _facts=None):
    # Statement convention: indexation rounded to the agora, then interest on the
    # indexed balance rounded to the agora, then the payment comes off.
    balance = Decimal(i["balance"])
    pi, r, c = rate(i, "inflation_percent"), rate(i, "rate_percent"), Decimal(i["payment"])
    rows = []
    for year in range(1, int(i["years"]) + 1):
        x = agorot(balance * pi)
        interest_ = agorot((balance + x) * r)
        closing = balance + x + interest_ - c
        rows.append({"period": year, "opening": str(agorot(balance)), "indexation": str(x), "interest": str(interest_), "closing": str(agorot(closing))})
        balance = closing
    return rows


def total(i, facts):
    # inputs: addend_1, addend_2, ... (fact ids)
    s, n = Decimal(0), 1
    while f"addend_{n}" in i:
        s += Decimal(facts[i[f"addend_{n}"]]["value"])
        n += 1
    return str(agorot(s))


KINDS = {
    "bal_indexation": indexation,
    "bal_interest": interest,
    "bal_interest_on_indexation": interest_on_indexation,
    "bal_rate_change_interest": rate_change_interest,
    "bal_after_year": after_year,
    "bal_table": table,
    "bal_sum": total,
}
