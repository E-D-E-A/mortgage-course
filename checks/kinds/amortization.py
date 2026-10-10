"""Independent checks for amortization: the level payment, balances, and tracks whose
rate or index moves (lessons 2.5–2.7, and 2.9 onward).

Plain Python Decimal; nothing is imported from src/lib/calc. Where the TypeScript
module keeps last month's payment and indexes it, this file recalculates the level
payment from the balance every month — the same number by another route.

Conventions: a contract's annual rate ÷ 12 is the monthly rate; payments at the end
of each month; on a rate change the payment is recalculated on the balance left over
the months left; a linked balance is indexed each month, before the payment.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def plain(x):
    """At most two decimals, no trailing zeros: "4.25", "5"."""
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def level_payment(balance, annual_percent, months):
    m = Decimal(annual_percent) / TWELVE / HUNDRED
    if m == 0:
        return Decimal(balance) / months
    return Decimal(balance) * m / (1 - (1 + m) ** (-months))


def numbered(i, prefix):
    values, n = [], 1
    while f"{prefix}_{n}" in i:
        values.append(Decimal(str(i[f"{prefix}_{n}"])))
        n += 1
    return values


def block_value(values, block_months, t):
    """The value in force in month t (0-based)."""
    return values[min(t // block_months, len(values) - 1)]


def run_path(i):
    """Month by month: (payment, closing balance) for each month."""
    months = int(i["months"])
    block = int(i["block_months"])
    rates = numbered(i, "rate")
    inflations = numbered(i, "inflation")
    inflation_block = int(i.get("inflation_block_months", block))
    balance = Decimal(i["principal"])
    out = []
    for t in range(months):
        if inflations:
            yearly = block_value(inflations, inflation_block, t)
            balance *= (1 + yearly / HUNDRED) ** (Decimal(1) / TWELVE)
        rate = block_value(rates, block, t)
        payment = level_payment(balance, rate, months - t)
        balance = balance + balance * rate / TWELVE / HUNDRED - payment
        out.append((payment, balance))
    return out


def payment(i, _facts=None):
    return str(agorot(level_payment(i["principal"], i["rate_percent"], int(i["months"]))))


def balance(i, _facts=None):
    p, k, n = Decimal(i["principal"]), int(i["paid"]), int(i["months"])
    c = level_payment(p, i["rate_percent"], n)
    m = Decimal(i["rate_percent"]) / TWELVE / HUNDRED
    b = p
    for _ in range(k):  # step by step, not the closed formula the TypeScript uses
        b = b + b * m - c
    return str(agorot(b))


def month_interest(i, _facts=None):
    return str(agorot(Decimal(i["balance"]) * Decimal(i["rate_percent"]) / TWELVE / HUNDRED))


def prime_track_rate(i, _facts=None):
    return plain(Decimal(i["prime"]) + Decimal(i["margin"]))


def path_payment(i, _facts=None):
    return str(agorot(run_path(i)[int(i["month"]) - 1][0]))


def path_balance(i, _facts=None):
    if int(i["month"]) == int(i["months"]):
        return "0.00"
    return str(agorot(run_path(i)[int(i["month"]) - 1][1]))


def path_series(i, _facts=None):
    rows = run_path(i)
    months = int(i["months"])
    return [
        {"year": k // 12, "payment": str(agorot(rows[k - 1][0])), "balance": "0.00" if k == months else str(agorot(rows[k - 1][1]))}
        for k in range(12, months + 1, 12)
    ]


def statement(i, method):
    p, n = agorot(i["principal"]), int(i["months"])
    rate = Decimal(i["rate_percent"])
    level = agorot(level_payment(p, rate, n))
    part = agorot(p / n)
    rows, b = [], p
    for k in range(1, n + 1):
        interest = agorot(b * rate / TWELVE / HUNDRED)
        if k == n:
            principal_paid = b
        elif method == "annuity":
            principal_paid = level - interest
        else:
            principal_paid = part
        rows.append({
            "period": k,
            "opening": str(b),
            "payment": str(principal_paid + interest),
            "interest": str(interest),
            "principal_paid": str(principal_paid),
            "closing": str(b - principal_paid),
        })
        b -= principal_paid
    return rows


def annuity_statement(i, _facts=None):
    return statement(i, "annuity")


def equal_statement(i, _facts=None):
    return statement(i, "equal")


def update_points(i, _facts=None):
    term, every = int(i["term_months"]), int(i["interval_months"])
    return list(range(every, term, every))


def update_years(i, _facts=None):
    return [plain(Decimal(k) / TWELVE) for k in update_points(i)]


def update_count(i, _facts=None):
    return str(len(update_points(i)))


def next_update(i, _facts=None):
    now = int(i["now"])
    return str([k for k in update_points(i) if k > now][0])


def months_to_update(i, _facts=None):
    now = int(i["now"])
    later = [k for k in update_points(i) if k > now]
    return str(later[0] - now)


def update_count_with_end(i, _facts=None):
    # The mistake: counting the last day of the loan as an update too.
    return str(int(i["term_months"]) // int(i["interval_months"]))


def update_count_with_ends(i, _facts=None):
    # The mistake: counting both the first and the last day as updates.
    return str(int(i["term_months"]) // int(i["interval_months"]) + 1)


def months_since_update(i, _facts=None):
    # How long ago the last update was (or the start of the loan, if none yet).
    now = int(i["now"])
    earlier = [k for k in update_points(i) if k <= now]
    return str(now - (earlier[-1] if earlier else 0))


def prime_table(i, _facts=None):
    # inputs: addition, margin, date_1, policy_1, date_2, policy_2, ...
    rows, n = [], 1
    while f"policy_{n}" in i:
        policy = Decimal(i[f"policy_{n}"])
        prime = policy + Decimal(i["addition"])
        rows.append({"period": n, "date": i[f"date_{n}"], "policy": plain(policy), "prime": plain(prime), "track": plain(prime + Decimal(i["margin"]))})
        n += 1
    return rows


def anchor_table(i, _facts=None):
    # inputs: spread, year_1, anchor_1, year_2, anchor_2, ...
    rows, n = [], 1
    while f"anchor_{n}" in i:
        anchor = Decimal(i[f"anchor_{n}"])
        rows.append({"period": int(i[f"year_{n}"]), "anchor": plain(anchor), "rate": plain(anchor + Decimal(i["spread"]))})
        n += 1
    return rows


def linked_payment_table(i, _facts=None):
    # As lesson 2.5 teaches: each year's index is last year's printed index × (1 + inflation),
    # rounded to two decimals; the payment is the scheduled payment × that index ÷ the base index.
    g = 1 + Decimal(i["inflation_percent"]) / HUNDRED
    base = Decimal(i["base_index"])
    index, rows = base, []
    for year in range(1, int(i["years"]) + 1):
        index = (index * g).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        rows.append({"period": year, "index": plain(index), "payment": str(agorot(Decimal(i["payment"]) * index / base))})
    return rows


KINDS = {
    "amort_payment": payment,
    "amort_balance": balance,
    "amort_month_interest": month_interest,
    "amort_prime_track_rate": prime_track_rate,
    "amort_path_payment": path_payment,
    "amort_path_balance": path_balance,
    "amort_path_series": path_series,
    "amort_annuity_statement": annuity_statement,
    "amort_equal_statement": equal_statement,
    "amort_update_points": update_points,
    "amort_update_count": update_count,
    "amort_update_years": update_years,
    "amort_months_to_update": months_to_update,
    "amort_next_update": next_update,
    "amort_update_count_with_end": update_count_with_end,
    "amort_update_count_with_ends": update_count_with_ends,
    "amort_months_since_update": months_since_update,
    "amort_prime_table": prime_table,
    "amort_anchor_table": anchor_table,
    "amort_linked_payment_table": linked_payment_table,
}
