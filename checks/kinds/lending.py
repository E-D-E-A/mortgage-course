"""Independent checks for lending, the spread and the Bank of Israel rate (lessons 0.9, 0.10).

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)


def plain(x):
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def spread(i, _facts=None):
    return plain(Decimal(i["loan_rate"]) - Decimal(i["cost_rate"]))


def rate_sum(i, _facts=None):
    return plain(Decimal(i["a"]) + Decimal(i["b"]))


def year_interest(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * Decimal(i["rate_percent"]) / HUNDRED))


def rate_for_income(i, _facts=None):
    return plain(Decimal(i["income"]) / Decimal(i["amount"]) * HUNDRED + Decimal(i["cost_rate"]))


def prime(i, _facts=None):
    return plain(Decimal(i["policy_rate"]) + Decimal(i["addition"]))


def rate_drop(i, _facts=None):
    return plain(Decimal(i["before"]) - Decimal(i["after"]))


def relative_drop(i, _facts=None):
    before = Decimal(i["before"])
    return plain((before - Decimal(i["after"])) / before * HUNDRED)


def after_cuts(i, _facts=None):
    return plain(Decimal(i["start"]) - Decimal(i["cut"]) * int(i["count"]))


def prime_after_cuts(i, _facts=None):
    return plain(Decimal(i["start"]) - Decimal(i["cut"]) * int(i["count"]) + Decimal(i["addition"]))


def spread_table(i, _facts=None):
    rows, n = [], 1
    while f"amount_{n}" in i:
        amount, loan, cost = Decimal(i[f"amount_{n}"]), Decimal(i[f"loan_rate_{n}"]), Decimal(i[f"cost_rate_{n}"])
        rows.append({
            "period": n,
            "amount": str(agorot(amount)),
            "loan_rate": plain(loan),
            "cost_rate": plain(cost),
            "spread": plain(loan - cost),
            "income": str(agorot(amount * (loan - cost) / HUNDRED)),
        })
        n += 1
    return rows


def rate_path(i, _facts=None):
    # inputs: start, addition, date_1, rate_1, date_2, rate_2, ...
    before, rows, n = Decimal(i["start"]), [], 1
    while f"date_{n}" in i:
        rate = Decimal(i[f"rate_{n}"])
        rows.append({
            "period": n,
            "date": i[f"date_{n}"],
            "before": plain(before),
            "rate": plain(rate),
            "change": plain(rate - before),
            "prime": plain(rate + Decimal(i["addition"])),
        })
        before = rate
        n += 1
    return rows


KINDS = {
    "lend_spread": spread,
    "lend_rate_sum": rate_sum,
    "lend_year_interest": year_interest,
    "lend_rate_for_income": rate_for_income,
    "lend_prime": prime,
    "lend_rate_drop": rate_drop,
    "lend_relative_drop": relative_drop,
    "lend_rate_after_cuts": after_cuts,
    "lend_prime_after_cuts": prime_after_cuts,
    "lend_spread_table": spread_table,
    "lend_rate_path": rate_path,
}
