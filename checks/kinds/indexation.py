"""Independent checks for prices, the consumer price index and indexation (lessons 0.7, 0.8).

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)


def plain(x):
    """At most two decimals, no trailing zeros: "3", "2.94", "109.2"."""
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def factor(percent):
    return 1 + Decimal(percent) / HUNDRED


def items(i):
    # inputs: quantity_1, price_1, quantity_2, price_2, ...
    n = 1
    while f"quantity_{n}" in i:
        yield Decimal(str(i[f"quantity_{n}"])), Decimal(str(i[f"price_{n}"]))
        n += 1


def basket_cost(i, _facts=None):
    return str(agorot(sum((q * p for q, p in items(i)), Decimal(0))))


def index_value(i, _facts=None):
    return plain(Decimal(i["cost"]) / Decimal(i["base_cost"]) * HUNDRED)


def change_percent(i, _facts=None):
    return plain((Decimal(i["new"]) / Decimal(i["old"]) - 1) * HUNDRED)


def index_points(i, _facts=None):
    return plain(Decimal(i["new"]) - Decimal(i["old"]))


def inflations(i):
    n = 1
    while f"inflation_{n}" in i:
        yield Decimal(i[f"inflation_{n}"])
        n += 1


def chain_index(i, _facts=None):
    x = Decimal(i["base"])
    for p in inflations(i):
        x *= factor(p)
    return plain(x)


def index_added(i, _facts=None):
    # The common mistake: adding the yearly percentages instead of chaining them.
    return plain(Decimal(i["base"]) * (1 + sum(inflations(i), Decimal(0)) / HUNDRED))


def indexed_amount(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * Decimal(i["new_index"]) / Decimal(i["base_index"])))


def indexed_balance(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * factor(i["inflation_percent"]) ** int(i["years"])))


def real_value(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) / factor(i["inflation_percent"]) ** int(i["years"])))


def real_rate(i, _facts=None):
    return plain((factor(i["nominal_percent"]) / factor(i["inflation_percent"]) - 1) * HUNDRED)


def real_rate_approx(i, _facts=None):
    return plain(Decimal(i["nominal_percent"]) - Decimal(i["inflation_percent"]))


def nominal_rate(i, _facts=None):
    return plain((factor(i["real_percent"]) * factor(i["inflation_percent"]) - 1) * HUNDRED)


def nominal_rate_approx(i, _facts=None):
    return plain(Decimal(i["real_percent"]) + Decimal(i["inflation_percent"]))


def indexation_table(i, _facts=None):
    # Statement convention: each year's indexation rounded to the agora, then added.
    balance = Decimal(i["amount"])
    rate = Decimal(i["inflation_percent"]) / HUNDRED
    rows = []
    for year in range(1, int(i["years"]) + 1):
        add = agorot(balance * rate)
        rows.append({"period": year, "opening": str(agorot(balance)), "indexation": str(add), "closing": str(agorot(balance + add))})
        balance += add
    return rows


def indexation_series(i, _facts=None):
    amount = Decimal(i["amount"])
    g = factor(i["inflation_percent"])
    return [
        {"year": n, "indexed": str(agorot(amount * g ** n)), "unindexed": str(agorot(amount)), "unindexed_real": str(agorot(amount / g ** n))}
        for n in range(int(i["years"]) + 1)
    ]


def index_table(i, _facts=None):
    values, n = [], 0
    while f"index_{n}" in i:
        values.append(i[f"index_{n}"])
        n += 1
    return [
        {"period": k + 1, "start": values[k], "end": values[k + 1],
         "points": plain(Decimal(values[k + 1]) - Decimal(values[k])),
         "change": plain((Decimal(values[k + 1]) / Decimal(values[k]) - 1) * HUNDRED)}
        for k in range(len(values) - 1)
    ]


def growth_factor(i, _facts=None):
    q = (Decimal(i["new"]) / Decimal(i["old"])).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP).normalize()
    return format(q, "f")


def points_as_shekels(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) + Decimal(i["new_index"]) - Decimal(i["old_index"])))


def change_on_new(i, _facts=None):
    return plain((Decimal(i["new"]) - Decimal(i["old"])) / Decimal(i["new"]) * HUNDRED)


def drop_percent(i, _facts=None):
    return plain((Decimal(i["old"]) - Decimal(i["new"])) / Decimal(i["old"]) * HUNDRED)


def deflated_amount(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * Decimal(i["base_index"]) / Decimal(i["new_index"])))


def real_rate_over_nominal(i, _facts=None):
    return plain((1 - factor(i["inflation_percent"]) / factor(i["nominal_percent"])) * HUNDRED)


KINDS = {
    "infl_change_on_new": change_on_new,
    "infl_drop_percent": drop_percent,
    "infl_deflated_amount": deflated_amount,
    "infl_real_rate_over_nominal": real_rate_over_nominal,
    "infl_growth_factor": growth_factor,
    "infl_points_as_shekels": points_as_shekels,
    "infl_index_table": index_table,
    "infl_basket_cost": basket_cost,
    "infl_index_value": index_value,
    "infl_change_percent": change_percent,
    "infl_index_points": index_points,
    "infl_chain_index": chain_index,
    "infl_index_added": index_added,
    "infl_indexed_amount": indexed_amount,
    "infl_indexed_balance": indexed_balance,
    "infl_real_value": real_value,
    "infl_real_rate": real_rate,
    "infl_real_rate_approx": real_rate_approx,
    "infl_nominal_rate": nominal_rate,
    "infl_nominal_rate_approx": nominal_rate_approx,
    "infl_indexation_table": indexation_table,
    "infl_indexation_series": indexation_series,
}
