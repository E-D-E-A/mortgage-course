"""Independent checks for the factor cards' examples (lessons 4.10 and 4.11).

Each fact kind "fc_<op>" is one step of a card's example (src/data/factor-cards.ts,
src/lib/calc/factors.ts). Plain Python Decimal; nothing is imported from src/.
Numbers are written plainly: at most `decimals` decimals (default 2), half away
from zero, no trailing zeros. Dates are ISO.
"""
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal


def _d(i):
    return int(i.get("decimals", 2))


def plain(x, decimals=2):
    q = Decimal(x).quantize(Decimal(1).scaleb(-decimals), rounding=ROUND_HALF_UP)
    s = format(q, "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def ratio(i, _f=None):
    return plain(Decimal(i["a"]) / Decimal(i["b"]) * 100, _d(i))


def share(i, _f=None):
    return plain(Decimal(i["amount"]) * Decimal(i["percent"]) / 100, _d(i))


def total(i, _f=None):
    return plain(sum((Decimal(x) for x in str(i["of"]).split("|")), Decimal(0)), _d(i))


def minus(i, _f=None):
    return plain(Decimal(i["a"]) - Decimal(i["b"]), _d(i))


def times(i, _f=None):
    return plain(Decimal(i["a"]) * Decimal(i["b"]), _d(i))


def divide(i, _f=None):
    return plain(Decimal(i["a"]) / Decimal(i["b"]), _d(i))


def payment(i, _f=None):
    # Level payment, annual rate / 12: P * m / (1 - (1 + m) ** -n).
    m = Decimal(i["rate"]) / 100 / 12
    n = int(i["months"])
    p = Decimal(i["principal"])
    c = p / n if m == 0 else p * m / (1 - (1 + m) ** -n)
    return plain(c, 2)


def add_days(i, _f=None):
    return (date.fromisoformat(i["date"]) + timedelta(days=int(i["days"]))).isoformat()


def days_between(i, _f=None):
    return str((date.fromisoformat(i["to"]) - date.fromisoformat(i["from"])).days)


def count_up_to(i, _f=None):
    limit = Decimal(i["limit"])
    return str(sum(1 for x in str(i["of"]).split("|") if Decimal(x) <= limit))


def tower_rate(i, _f=None):
    # Lesson 4.12: the anchor plus the parts of the spread, in percent.
    parts = [x for x in str(i.get("parts", "")).split("|") if x != ""]
    return plain(Decimal(i["anchor"]) + sum((Decimal(x) for x in parts), Decimal(0)), 2)


def tower_spread(i, _f=None):
    parts = [x for x in str(i.get("parts", "")).split("|") if x != ""]
    return plain(sum((Decimal(x) for x in parts), Decimal(0)), 2)


KINDS = {
    "pr_tower_rate": tower_rate,
    "pr_tower_spread": tower_spread,
    "fc_ratio": ratio,
    "fc_share": share,
    "fc_sum": total,
    "fc_minus": minus,
    "fc_times": times,
    "fc_divide": divide,
    "fc_payment": payment,
    "fc_addDays": add_days,
    "fc_daysBetween": days_between,
    "fc_countUpTo": count_up_to,
}
