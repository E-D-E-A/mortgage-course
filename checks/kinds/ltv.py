"""Independent checks for a loan against a property (lessons 1.1 and 1.2):
the sale of a pledged home, equity, the loan and the financing ratio (LTV).

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)


def plain(x, decimals=2):
    q = Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def money(x):
    return str(agorot(x))


def split(sale, debt):
    sale, debt = Decimal(sale), Decimal(debt)
    to_lender = sale if sale < debt else debt
    return {"lender": to_lender, "borrower": sale - to_lender, "owed": debt - to_lender}


def sale_part(i, _facts=None):
    return money(split(i["sale"], i["debt"])[i["part"]])


def sale_table(i, _facts=None):
    rows, n = [], 1
    while f"sale_{n}" in i:
        s = split(i[f"sale_{n}"], i["debt"])
        rows.append({
            "period": n,
            "sale": money(i[f"sale_{n}"]),
            "to_lender": money(s["lender"]),
            "to_borrower": money(s["borrower"]),
            "still_owed": money(s["owed"]),
        })
        n += 1
    return rows


def cushion(i, _facts=None):
    value, debt = Decimal(i["value"]), Decimal(i["debt"])
    room = value - debt
    return plain(0 if room < 0 else room / value * HUNDRED)


def drop_percent(i, _facts=None):
    before = Decimal(i["from"])
    return plain((before - Decimal(i["to"])) / before * HUNDRED)


def after_drop(i, _facts=None):
    return money(Decimal(i["amount"]) * (HUNDRED - Decimal(i["drop_percent"])) / HUNDRED)


def loan_needed(i, _facts=None):
    return money(Decimal(i["price"]) - Decimal(i["equity"]))


def ltv(i, _facts=None):
    return plain(Decimal(i["loan"]) / Decimal(i["value"]) * HUNDRED, i.get("decimals", 2))


def share(i, _facts=None):
    return plain(Decimal(i["part"]) / Decimal(i["whole"]) * HUNDRED)


def max_loan(i, _facts=None):
    return money(Decimal(i["value"]) * Decimal(i["ceiling"]) / HUNDRED)


def min_equity(i, _facts=None):
    need = Decimal(i["price"]) - Decimal(i["value"]) * Decimal(i["ceiling"]) / HUNDRED
    return money(0 if need < 0 else need)


def max_price(i, _facts=None):
    return money(Decimal(i["equity"]) * HUNDRED / (HUNDRED - Decimal(i["ceiling"])))


def per_shekel(i, _facts=None):
    return plain(Decimal(i["loan"]) / Decimal(i["equity"]))


def points_gap(i, _facts=None):
    # The ceiling minus the exact ratio, in percentage points.
    return plain(Decimal(i["ceiling"]) - Decimal(i["loan"]) / Decimal(i["value"]) * HUNDRED)


def times(i, _facts=None):
    return money(Decimal(i["amount"]) * Decimal(i["factor"]))


def add(i, _facts=None):
    return money(Decimal(i["a"]) + Decimal(i["b"]))


def divide(i, _facts=None):
    return money(Decimal(i["amount"]) / Decimal(i["divisor"]))


def price_table(i, _facts=None):
    rows, n = [], 1
    while f"price_{n}" in i:
        price, equity = Decimal(i[f"price_{n}"]), Decimal(i[f"equity_{n}"])
        rows.append({
            "period": n,
            "price": money(price),
            "equity": money(equity),
            "loan": money(price - equity),
            "ltv": plain((price - equity) / price * HUNDRED),
        })
        n += 1
    return rows


def ceiling_table(i, _facts=None):
    value, rows, n = Decimal(i["value"]), [], 1
    while f"ceiling_{n}" in i:
        c = Decimal(i[f"ceiling_{n}"])
        loan = value * c / HUNDRED
        rows.append({"period": n, "ceiling": plain(c), "max_loan": money(loan), "min_equity": money(value - loan)})
        n += 1
    return rows


def complement(i, _facts=None):
    return plain(HUNDRED - Decimal(i["percent"]))


def fraction(i, _facts=None):
    s = format(Decimal(i["percent"]).scaleb(-2), "f")
    return s.rstrip("0").rstrip(".") if "." in s else s


def ltv_fixed(i, _facts=None):
    # Shown with exactly two decimals, trailing zeros kept: "75.00".
    q = (Decimal(i["loan"]) / Decimal(i["value"]) * HUNDRED).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return format(q, "f")


def min_value(i, _facts=None):
    return money(Decimal(i["loan"]) * HUNDRED / Decimal(i["ceiling"]))


KINDS = {
    "ltv_sale_part": sale_part,
    "ltv_sale_table": sale_table,
    "ltv_cushion": cushion,
    "ltv_drop_percent": drop_percent,
    "ltv_after_drop": after_drop,
    "ltv_loan_needed": loan_needed,
    "ltv_percent": ltv,
    "ltv_share": share,
    "ltv_max_loan": max_loan,
    "ltv_min_equity": min_equity,
    "ltv_max_price": max_price,
    "ltv_per_shekel": per_shekel,
    "ltv_points_gap": points_gap,
    "ltv_times": times,
    "ltv_divide": divide,
    "ltv_sum": add,
    "ltv_complement": complement,
    "ltv_fraction": fraction,
    "ltv_percent_fixed": ltv_fixed,
    "ltv_min_value": min_value,
    "ltv_price_table": price_table,
    "ltv_ceiling_table": ceiling_table,
}
