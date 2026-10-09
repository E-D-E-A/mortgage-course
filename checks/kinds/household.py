"""Independent checks for a household's monthly money (lessons 1.9, 1.10).

Plain Python Decimal; nothing is imported from src/lib/calc. Lists of amounts
arrive as "a|b|c" strings; an empty string is an empty list.
"""
from datetime import date, timedelta
from decimal import Decimal

from kinds.common import agorot


def _amounts(text):
    text = str(text)
    return [Decimal(a) for a in text.split("|")] if text else []


def _total(text):
    total = Decimal(0)
    for a in _amounts(text):
        total += a
    return total


def hh_sum(i, _facts=None):
    return str(agorot(_total(i["amounts"])))


def hh_disposable_income(i, _facts=None):
    return str(agorot(_total(i["incomes"]) - _total(i["payments"])))


def hh_days_left(i, _facts=None):
    left = int(i["window_days"]) - int(i["used_days"])
    return left if left > 0 else 0


def hh_days_sum(i, _facts=None):
    # Only to name a mistake: adding the days used to the window instead of subtracting.
    return int(i["window_days"]) + int(i["used_days"])


def hh_disposable_table(i, _facts=None):
    rows = []
    n = 1
    while f"income_1_{n}" in i:
        income_1 = Decimal(i[f"income_1_{n}"])
        income_2 = Decimal(i[f"income_2_{n}"])
        payments = _total(i[f"payments_{n}"])
        rows.append(
            {
                "household": str(n),
                "income_1": str(agorot(income_1)),
                "income_2": str(agorot(income_2)),
                "payments": str(agorot(payments)),
                "disposable": str(agorot(income_1 + income_2 - payments)),
            }
        )
        n += 1
    return rows


def _date(text):
    y, m, d = (int(x) for x in str(text).split("-"))
    return date(y, m, d)


def hh_add_days(i, _facts=None):
    return (_date(i["date"]) + timedelta(days=int(i["days"]))).isoformat()


def hh_days_between(i, _facts=None):
    return (_date(i["to"]) - _date(i["from"])).days


def hh_max_price(i, _facts=None):
    return str(agorot(Decimal(i["equity"]) * 100 / (100 - Decimal(i["cap_percent"]))))


KINDS = {
    "hh_max_price": hh_max_price,
    "hh_add_days": hh_add_days,
    "hh_days_between": hh_days_between,
    "hh_sum": hh_sum,
    "hh_disposable_income": hh_disposable_income,
    "hh_days_left": hh_days_left,
    "hh_days_sum": hh_days_sum,
    "hh_disposable_table": hh_disposable_table,
}
