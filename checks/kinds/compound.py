"""Independent checks for simple and compound interest (lessons 0.2, 0.3)."""
import math
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import AGORA, agorot, growth


def compound_balance(i, _facts=None):
    return str(agorot(Decimal(i["principal"]) * growth(i["rate_percent"]) ** int(i["periods"])))


def simple_balance(i, _facts=None):
    r = Decimal(i["rate_percent"]) / 100
    return str(agorot(Decimal(i["principal"]) * (1 + r * int(i["periods"]))))


def compound_table(i, _facts=None):
    # Statement convention: each period's interest rounded to the agora, then added.
    p = Decimal(i["principal"])
    r = Decimal(i["rate_percent"]) / 100
    rows, balance = [], p
    for period in range(1, int(i["periods"]) + 1):
        interest = agorot(balance * r)
        rows.append({
            "period": period,
            "opening": str(agorot(balance)),
            "interest": str(interest),
            "interest_on_principal": str(agorot(p * r)),
            "interest_on_interest": str(agorot(interest - p * r)),
            "closing": str(agorot(balance + interest)),
        })
        balance += interest
    return rows


def growth_series(i, _facts=None):
    return [
        {"period": n, "compound": compound_balance({**i, "periods": n}), "simple": simple_balance({**i, "periods": n})}
        for n in range(int(i["periods"]) + 1)
    ]


def periods_to_double(i, _facts=None):
    # Independent route: logarithms, then confirm the whole-number boundary exactly.
    g = growth(i["rate_percent"])
    n = math.ceil(math.log(2) / math.log(float(g)))
    while g ** n < 2:
        n += 1
    while n > 1 and g ** (n - 1) >= 2:
        n -= 1
    return n


def rule_of_72(i, _facts=None):
    return str(Decimal(72) / Decimal(i["rate_percent"])).rstrip("0").rstrip(".")


def exact_doubling(i, _facts=None):
    exact = Decimal(2).ln() / growth(i["rate_percent"]).ln()
    return str(exact.quantize(AGORA, rounding=ROUND_HALF_UP))


KINDS = {
    "compound_balance": compound_balance,
    "simple_balance": simple_balance,
    "compound_table": compound_table,
    "growth_series": growth_series,
    "periods_to_double": periods_to_double,
    "rule_of_72": rule_of_72,
    "exact_doubling": exact_doubling,
}
