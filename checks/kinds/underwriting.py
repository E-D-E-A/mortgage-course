"""Independent checks for lessons 4.7–4.9: underwriting (declared against verified),
credit data and the account's conduct, and the collateral (appraisal, insurances).

Plain Python Decimal and datetime; nothing is imported from src/lib/calc. Where the
TypeScript module scales the payment per shekel to find the largest loan, this file
searches for it step by step; where TypeScript uses the closed balance formula, this
file runs the months one by one.
"""
from datetime import date, timedelta
from decimal import ROUND_FLOOR, ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def plain(x, decimals=2):
    q = Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def numbered(i, prefix):
    out, n = [], 1
    while f"{prefix}_{n}" in i:
        out.append(Decimal(str(i[f"{prefix}_{n}"])))
        n += 1
    return out


def level(principal, annual, months):
    m = Decimal(annual) / TWELVE / HUNDRED
    p = Decimal(principal)
    if m == 0:
        return p / months
    return p * m / (1 - (1 + m) ** (-months))


def tracks(i):
    """Tracks from inputs principal_1, rate_1, months_1, principal_2, …"""
    out, n = [], 1
    while f"principal_{n}" in i:
        out.append((Decimal(str(i[f"principal_{n}"])), Decimal(str(i[f"rate_{n}"])), int(i[f"months_{n}"])))
        n += 1
    return out


def track_payment(i, _facts=None):
    return str(agorot(level(i["principal"], i["rate_percent"], int(i["months"]))))


def mix_payment(i, _facts=None):
    return str(sum(agorot(level(p, r, n)) for p, r, n in tracks(i)))


def total(i, _facts=None):
    return str(agorot(sum(numbered(i, "amount"))))


def average(i, _facts=None):
    values = numbered(i, "amount")
    return str(agorot(sum(values) / len(values)))


def ratio(i, _facts=None):
    return plain(Decimal(str(i["part"])) / Decimal(str(i["whole"])) * HUNDRED, i.get("decimals", 2))


def shortfall(i, _facts=None):
    d = Decimal(str(i["declared"]))
    return plain((d - Decimal(str(i["verified"]))) / d * HUNDRED, i.get("decimals", 2))


def lower(i, _facts=None):
    return str(agorot(min(Decimal(str(i["a"])), Decimal(str(i["b"])))))


def times_percent(i, _facts=None):
    return str(agorot(Decimal(str(i["amount"])) * Decimal(str(i["percent"])) / HUNDRED))


def max_loan_at_ratio(i, _facts=None):
    # Step up from zero in whole steps while the scaled mix's exact payment stays within the cap.
    ts = tracks(i)
    loan = sum(p for p, _, _ in ts)
    cap = Decimal(str(i["income"])) * Decimal(str(i["cap"])) / HUNDRED
    step = Decimal(str(i.get("step", 1000)))

    def pay(new_loan):
        return sum(level(p * new_loan / loan, r, n) for p, r, n in ts)

    guess = (cap / pay(loan) * loan / step).to_integral_value(rounding=ROUND_FLOOR) * step
    # Walk to the exact edge, in case the guess is off by a step either way.
    while pay(guess + step) <= cap:
        guess += step
    while guess > 0 and pay(guess) > cap:
        guess -= step
    return str(agorot(guess))


def scaled_mix_payment(i, _facts=None):
    ts = tracks(i)
    loan = sum(p for p, _, _ in ts)
    new = Decimal(str(i["new_loan"]))
    return str(sum(agorot(level(agorot(p * new / loan), r, n)) for p, r, n in ts))


def run_balance(principal, annual, months, paid):
    m = Decimal(annual) / TWELVE / HUNDRED
    c = level(principal, annual, months)
    b = Decimal(principal)
    for _ in range(min(paid, months)):
        b = b + b * m - c
    return b


def mix_balance(i, _facts=None):
    k = int(i["paid"])
    return str(agorot(sum(run_balance(p, r, n, k) for p, r, n in tracks(i))))


def payments_until_at_most(i, _facts=None):
    ts = tracks(i)
    limit = Decimal(str(i["threshold"]))
    longest = max(n for _, _, n in ts)
    for k in range(longest + 1):
        if sum(run_balance(p, r, n, k) for p, r, n in ts) <= limit:
            return k
    return longest


def add_days(i, _facts=None):
    return (date.fromisoformat(i["start"]) + timedelta(days=int(i["days"]))).isoformat()


def days_between(i, _facts=None):
    return (date.fromisoformat(i["to"]) - date.fromisoformat(i["from"])).days


def deposit_table(i, _facts=None):
    """Rows: month, the payslip's net, the deposit seen in the account, and the gap (net − deposit)."""
    rows, n = [], 1
    while f"net_{n}" in i:
        net, dep = Decimal(str(i[f"net_{n}"])), Decimal(str(i[f"deposit_{n}"]))
        rows.append({"period": n, "month": i[f"month_{n}"], "net": str(agorot(net)), "deposit": str(agorot(dep)), "gap": str(agorot(net - dep))})
        n += 1
    return rows


def verify_table(i, _facts=None):
    """Rows: each income line declared and verified, and the gap (declared − verified)."""
    rows, n = [], 1
    while f"declared_{n}" in i:
        d, v = Decimal(str(i[f"declared_{n}"])), Decimal(str(i[f"verified_{n}"]))
        rows.append({"period": n, "line": i[f"line_{n}"], "declared": str(agorot(d)), "verified": str(agorot(v)), "gap": str(agorot(d - v))})
        n += 1
    return rows


def appraisal_table(i, _facts=None):
    """Rows: an appraisal, the value used (the lower of it and the price), the financing ratio, and the largest loan under the ceiling."""
    price, loan, ceiling = Decimal(str(i["price"])), Decimal(str(i["loan"])), Decimal(str(i["ceiling"]))
    rows, n = [], 1
    while f"appraisal_{n}" in i:
        a = Decimal(str(i[f"appraisal_{n}"]))
        used = min(a, price)
        rows.append({
            "period": n,
            "appraisal": str(agorot(a)),
            "used": str(agorot(used)),
            "ltv": plain(loan / used * HUNDRED),
            "max_loan": str(agorot(used * ceiling / HUNDRED)),
        })
        n += 1
    return rows


def divide_percent(i, _facts=None):
    return str(agorot(Decimal(str(i["amount"])) * HUNDRED / Decimal(str(i["percent"]))))


def count_difference(i, facts):
    return int(facts[i["minuend"]]["value"]) - int(facts[i["subtrahend"]]["value"])


KINDS = {
    "uw_count_difference": count_difference,
    "uw_divide_percent": divide_percent,
    "uw_track_payment": track_payment,
    "uw_mix_payment": mix_payment,
    "uw_total": total,
    "uw_average": average,
    "uw_ratio": ratio,
    "uw_shortfall": shortfall,
    "uw_lower": lower,
    "uw_times_percent": times_percent,
    "uw_max_loan_at_ratio": max_loan_at_ratio,
    "uw_scaled_mix_payment": scaled_mix_payment,
    "uw_mix_balance": mix_balance,
    "uw_payments_until_at_most": payments_until_at_most,
    "uw_add_days": add_days,
    "uw_days_between": days_between,
    "uw_deposit_table": deposit_table,
    "uw_verify_table": verify_table,
    "uw_appraisal_table": appraisal_table,
}
