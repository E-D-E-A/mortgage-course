"""Independent checks for splitting a loan into tracks and the year-by-year
repayment sketch (lessons 1.3, 1.4, 1.5).

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)


def plain(x):
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def numbered(i, name):
    out, n = [], 1
    while f"{name}_{n}" in i:
        out.append(i[f"{name}_{n}"])
        n += 1
    return out


def slice_amount(i, _facts=None):
    return str(agorot(Decimal(i["loan"]) * Decimal(i["weight"]) / Decimal(i["total_weight"])))


def slice_truncated(i, _facts=None):
    exact = Decimal(i["loan"]) * Decimal(i["weight"]) / Decimal(i["total_weight"])
    places = Decimal(1).scaleb(-int(i["decimals"]))
    return str(exact.quantize(places, rounding=ROUND_DOWN))


def split(i, _facts=None):
    loan = Decimal(i["loan"])
    weights = [Decimal(w) for w in numbered(i, "weight")]
    total = sum(weights)
    rows, taken = [], Decimal(0)
    for n, w in enumerate(weights, start=1):
        amount = agorot(loan * w / total) if n < len(weights) else loan - taken
        taken += amount
        rows.append({"period": n, "share": plain(w / total * HUNDRED), "amount": str(agorot(amount))})
    return rows


def share(i, _facts=None):
    return plain(Decimal(i["amount"]) / Decimal(i["loan"]) * HUNDRED)


def weight_share(i, _facts=None):
    return plain(Decimal(i["weight"]) / Decimal(i["total_weight"]) * HUNDRED)


def share_fraction(i, _facts=None):
    return plain(Decimal(i["amount"]) / Decimal(i["loan"]))


def amount_sum(i, _facts=None):
    return str(agorot(sum(Decimal(a) for a in numbered(i, "amount"))))


def share_sum(i, _facts=None):
    return plain(sum(Decimal(s) for s in numbered(i, "share")))


def remainder(i, _facts=None):
    return str(agorot(Decimal(i["loan"]) - sum(Decimal(a) for a in numbered(i, "amount"))))


def combos(i, _facts=None):
    product = 1
    for c in numbered(i, "count"):
        product *= int(c)
    return str(product)


def count_sum(i, _facts=None):
    return str(sum(int(c) for c in numbered(i, "count")))


def _parts(i):
    loan, years, year = Decimal(i["loan"]), int(i["years"]), int(i["year"])
    if i["method"] == "equal_principal":
        principal = loan / years
        balance = loan - principal * (year - 1)
    else:  # interest_only
        principal = loan if year == years else Decimal(0)
        balance = loan
    return principal, balance


def principal_part(i, _facts=None):
    return str(agorot(_parts(i)[0]))


def balance_at_start(i, _facts=None):
    return str(agorot(_parts(i)[1]))


def interest_part(i, _facts=None):
    return str(agorot(_parts(i)[1] * Decimal(i["rate_percent"]) / HUNDRED))


def year_payment(i, _facts=None):
    principal, balance = _parts(i)
    return str(agorot(principal + balance * Decimal(i["rate_percent"]) / HUNDRED))


KINDS = {
    "mix_slice": slice_amount,
    "mix_slice_truncated": slice_truncated,
    "mix_split": split,
    "mix_share": share,
    "mix_share_fraction": share_fraction,
    "mix_weight_share": weight_share,
    "mix_amount_sum": amount_sum,
    "mix_share_sum": share_sum,
    "mix_remainder": remainder,
    "mix_combinations": combos,
    "mix_count_sum": count_sum,
    "mix_principal_part": principal_part,
    "mix_balance_at_start": balance_at_start,
    "mix_interest_part": interest_part,
    "mix_year_payment": year_payment,
}
