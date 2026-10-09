"""Independent checks for percent and simple interest (lessons 0.1, 0.2).

Python's Decimal only — no code from src/lib/calc. Money values are rounded to
the agora; percentages and plain numbers to two decimals, without trailing zeros.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDREDTH = Decimal("0.01")


def plain(x):
    """Two decimals, half away from zero, trailing zeros dropped: 25, 32.5, -1."""
    s = format(Decimal(x).quantize(HUNDREDTH, rounding=ROUND_HALF_UP), "f")
    s = s.rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def _percent_of(amount, rate):
    return Decimal(amount) * Decimal(rate) / 100


def percent_of(i, _facts=None):
    return str(agorot(_percent_of(i["amount"], i["rate_percent"])))


def after_percent_change(i, _facts=None):
    # Several changes in a row, "10|-10": each measured from the amount just before it.
    value = Decimal(i["amount"])
    for rate in str(i["changes_percent"]).split("|"):
        value = value + _percent_of(value, rate)
    return str(agorot(value))


def share_percent(i, _facts=None):
    return plain(Decimal(i["part"]) / Decimal(i["whole"]) * 100)


def relative_change_percent(i, _facts=None):
    old, new = Decimal(i["from"]), Decimal(i["to"])
    return plain((new - old) / old * 100)


def percentage_point_change(i, _facts=None):
    return plain(Decimal(i["to_percent"]) - Decimal(i["from_percent"]))


def percent_rows(i, _facts=None):
    amounts = str(i["amounts"]).split("|")
    rates = str(i["rates_percent"]).split("|")
    return [
        {
            "amount": str(agorot(a)),
            "rate_percent": plain(r),
            "one_percent": str(agorot(Decimal(a) / 100)),
            "result": str(agorot(_percent_of(a, r))),
        }
        for a, r in zip(amounts, rates, strict=True)
    ]


def simple_interest(i, _facts=None):
    # Interest of one year, added up year by year — a different route from P × r × n.
    yearly = _percent_of(i["principal"], i["rate_percent"])
    total = Decimal(0)
    for _ in range(int(i["periods"])):
        total += yearly
    return str(agorot(total))


def simple_interest_table(i, _facts=None):
    yearly = _percent_of(i["principal"], i["rate_percent"])
    rows, total = [], Decimal(0)
    for period in range(1, int(i["periods"]) + 1):
        total += yearly
        rows.append({"period": period, "interest": str(agorot(yearly)), "total_interest": str(agorot(total))})
    return rows


def quotient(i, facts):
    return plain(Decimal(facts[i["dividend"]]["value"]) / Decimal(facts[i["divisor"]]["value"]))


KINDS = {
    "percent_of": percent_of,
    "after_percent_change": after_percent_change,
    "share_percent": share_percent,
    "relative_change_percent": relative_change_percent,
    "percentage_point_change": percentage_point_change,
    "percent_rows": percent_rows,
    "simple_interest": simple_interest,
    "simple_interest_table": simple_interest_table,
    "percent_quotient": quotient,
}


def combined_factor(i, _facts=None):
    f = Decimal(1)
    for rate in str(i["changes_percent"]).split("|"):
        f *= 1 + Decimal(rate) / 100
    s = format(f, "f")
    return s.rstrip("0").rstrip(".") if "." in s else s


def added_percents(i, _facts=None):
    return plain(sum((Decimal(r) for r in str(i["changes_percent"]).split("|")), Decimal(0)))


KINDS["combined_factor"] = combined_factor
KINDS["added_percents"] = added_percents


def percent_decimal(i, _facts=None):
    s = format(Decimal(i["rate_percent"]).scaleb(-2), "f")
    return s.rstrip("0").rstrip(".") if "." in s else s


def plain_product(i, _facts=None):
    return plain(Decimal(i["a"]) * Decimal(i["b"]))


def periods_below_double(i, _facts=None):
    # The last whole number of periods after which a compounding balance is still below double.
    g = 1 + Decimal(i["rate_percent"]) / 100
    n = 0
    while g ** (n + 1) < 2:
        n += 1
    return n


KINDS["percent_decimal"] = percent_decimal
KINDS["plain_product"] = plain_product
KINDS["periods_below_double"] = periods_below_double
