"""Independent checks for track rates and their behaviour (lessons 2.1 to 2.4):
prime, anchor and spread; fixed and variable rates against fixed payments;
indexed against not indexed; the two meanings of "nominal".

Plain Python Decimal; nothing is imported from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
TWELVE = Decimal(12)
ONE = Decimal(1)


def plain(x, decimals=2):
    q = Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


def fixed(x, decimals):
    return format(Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP), "f")


def g(rate):
    return ONE + Decimal(rate) / HUNDRED


def numbered(i, name):
    out, n = [], 1
    while f"{name}_{n}" in i:
        out.append(i[f"{name}_{n}"])
        n += 1
    return out


# ------------------------------------------------------------------ 2.1

def prime(i, _f=None):
    return plain(Decimal(i["policy"]) + Decimal(i["addition"]))


def prime_track(i, _f=None):
    return plain(Decimal(i["policy"]) + Decimal(i["addition"]) + Decimal(i["spread"]))


def rate(i, _f=None):
    return plain(Decimal(i["anchor"]) + Decimal(i["spread"]))


def spread(i, _f=None):
    return plain(Decimal(i["rate"]) - Decimal(i["anchor"]))


def points_sum(i, _f=None):
    return plain(Decimal(i["a"]) + Decimal(i["b"]))


def points_diff(i, _f=None):
    return plain(Decimal(i["a"]) - Decimal(i["b"]))


def month_interest(i, _f=None):
    return str(agorot(Decimal(i["balance"]) * Decimal(i["rate"]) / TWELVE / HUNDRED))


def year_interest(i, _f=None):
    return str(agorot(Decimal(i["balance"]) * Decimal(i["rate"]) / HUNDRED))


def monthly(i, _f=None):
    return plain(Decimal(i["annual"]) / TWELVE, i.get("decimals", 2))


def layers_table(i, _f=None):
    add = Decimal(i["addition"])
    rows = []
    for n, (p, s) in enumerate(zip(numbered(i, "policy"), numbered(i, "spread")), start=1):
        p, s = Decimal(p), Decimal(s)
        rows.append({"period": n, "policy": plain(p), "prime": plain(p + add), "spread": plain(s), "rate": plain(p + add + s)})
    return rows


# ------------------------------------------------------------------ 2.2

def ep_year_row(loan, years, r, year):
    loan = Decimal(loan)
    principal = loan / int(years)
    balance = loan - principal * (int(year) - 1)
    interest = balance * Decimal(r) / HUNDRED
    return {"balance": balance, "principal": principal, "interest": interest, "payment": principal + interest}


def ep_year(i, _f=None):
    return str(agorot(ep_year_row(i["loan"], i["years"], i["rate"], i["year"])[i["part"]]))


def ep_year_table(i, _f=None):
    rows = []
    for y in range(1, int(i["years"]) + 1):
        r = ep_year_row(i["loan"], i["years"], i["rate"], y)
        rows.append({
            "period": y,
            "opening": str(agorot(r["balance"])),
            "interest": str(agorot(r["interest"])),
            "principal": str(agorot(r["principal"])),
            "payment": str(agorot(r["payment"])),
        })
    return rows


def ep_month_row(loan, months, r, month):
    loan = Decimal(loan)
    principal = loan / int(months)
    balance = loan - principal * (int(month) - 1)
    interest = balance * Decimal(r) / TWELVE / HUNDRED
    return {"balance": balance, "principal": principal, "interest": interest, "payment": principal + interest}


def ep_month(i, _f=None):
    return str(agorot(ep_month_row(i["loan"], i["months"], i["rate"], i["month"])[i["part"]]))


def ep_month_table(i, _f=None):
    rows = []
    for m in numbered(i, "month"):
        r = ep_month_row(i["loan"], i["months"], i["rate"], m)
        rows.append({"period": int(m), "opening": str(agorot(r["balance"])), "interest": str(agorot(r["interest"])), "payment": str(agorot(r["payment"]))})
    return rows


def factor_sum(r, n):
    return sum(ONE / g(r) ** k for k in range(1, int(n) + 1))


def discount(i, _f=None):
    return fixed(ONE / g(i["rate"]) ** int(i["period"]), i["decimals"])


def annuity_factor(i, _f=None):
    return fixed(factor_sum(i["rate"], i["periods"]), i["decimals"])


def equal_payment(i, _f=None):
    return str(agorot(Decimal(i["loan"]) / factor_sum(i["rate"], i["periods"])))


def payment_path(i, _f=None):
    rates = [Decimal(r) for r in numbered(i, "rate")]
    balance, pay, prev, rows = Decimal(i["loan"]), None, None, []
    for n, r in enumerate(rates, start=1):
        if prev is None or r != prev:
            pay = agorot(balance / factor_sum(r, len(rates) - n + 1))
        prev = r
        interest = agorot(balance * r / HUNDRED)
        closing = balance + interest - pay
        rows.append({
            "period": n,
            "rate": plain(r),
            "opening": str(agorot(balance)),
            "interest": str(interest),
            "principal": str(agorot(pay - interest)),
            "payment": str(pay),
            "closing": str(agorot(closing)),
        })
        balance = closing
    return rows


def indexed_payment(i, _f=None):
    return str(agorot(Decimal(i["payment"]) * g(i["inflation"]) ** int(i["years"])))


# ------------------------------------------------------------------ 2.3

def plain_owed(i, _f=None):
    return str(agorot(Decimal(i["amount"]) * g(i["rate"])))


def indexed_owed(i, _f=None):
    return str(agorot(Decimal(i["amount"]) * g(i["inflation"]) * g(i["real"])))


def indexed_amount(i, _f=None):
    return str(agorot(Decimal(i["amount"]) * g(i["inflation"])))


def indexed_cost(i, _f=None):
    a = Decimal(i["amount"])
    return str(agorot(a * g(i["inflation"]) * g(i["real"]) - a))


def break_even(i, _f=None):
    return plain((g(i["plain"]) / g(i["indexed"]) - 1) * HUNDRED)


def before_inflation(i, _f=None):
    return plain((g(i["real"]) * g(i["inflation"]) - 1) * HUNDRED)


def indexed_after_payment(i, _f=None):
    return str(agorot(Decimal(i["amount"]) * g(i["inflation"]) * g(i["real"]) - Decimal(i["paid"])))


def plain_after_payment(i, _f=None):
    return str(agorot(Decimal(i["amount"]) * g(i["rate"]) - Decimal(i["paid"])))


def owed_table(i, _f=None):
    a = Decimal(i["amount"])
    plain_owed_value = a * g(i["plain"])
    rows = []
    for n, p in enumerate(numbered(i, "inflation"), start=1):
        b = a * g(p) * g(i["real"])
        rows.append({"period": n, "inflation": plain(p), "plain": str(agorot(plain_owed_value)), "indexed": str(agorot(b)), "diff": str(agorot(b - plain_owed_value))})
    return rows


# ------------------------------------------------------------------ 2.4

def effective_growth(annual):
    return (ONE + Decimal(annual) / TWELVE / HUNDRED) ** 12


def effective(i, _f=None):
    return plain((effective_growth(i["annual"]) - 1) * HUNDRED)


def real(i, _f=None):
    return plain((g(i["nominal"]) / g(i["inflation"]) - 1) * HUNDRED)


def effective_before_inflation(i, _f=None):
    return plain((effective_growth(i["annual"]) * g(i["inflation"]) - 1) * HUNDRED)


def break_even_effective(i, _f=None):
    return plain((effective_growth(i["plain"]) / effective_growth(i["indexed"]) - 1) * HUNDRED)


def monthly_root(i, _f=None):
    return plain((g(i["annual"]) ** (ONE / TWELVE) - 1) * HUNDRED, i.get("decimals", 2))


def convert_table(i, _f=None):
    p = g(i["inflation"])
    rows = []
    for n, a in enumerate(numbered(i, "annual"), start=1):
        e = effective_growth(a)
        rows.append({
            "period": n,
            "annual": plain(a),
            "monthly": plain(Decimal(a) / TWELVE),
            "effective": plain((e - 1) * HUNDRED),
            "real": plain((e / p - 1) * HUNDRED),
        })
    return rows


KINDS = {
    "trk_prime": prime,
    "trk_prime_track": prime_track,
    "trk_rate": rate,
    "trk_spread": spread,
    "trk_points_sum": points_sum,
    "trk_points_diff": points_diff,
    "trk_month_interest": month_interest,
    "trk_year_interest": year_interest,
    "trk_monthly": monthly,
    "trk_layers_table": layers_table,
    "trk_ep_year": ep_year,
    "trk_ep_year_table": ep_year_table,
    "trk_ep_month": ep_month,
    "trk_ep_month_table": ep_month_table,
    "trk_discount": discount,
    "trk_annuity_factor": annuity_factor,
    "trk_equal_payment": equal_payment,
    "trk_payment_path": payment_path,
    "trk_indexed_payment": indexed_payment,
    "trk_plain_owed": plain_owed,
    "trk_indexed_owed": indexed_owed,
    "trk_indexed_amount": indexed_amount,
    "trk_indexed_cost": indexed_cost,
    "trk_break_even": break_even,
    "trk_before_inflation": before_inflation,
    "trk_indexed_after_payment": indexed_after_payment,
    "trk_plain_after_payment": plain_after_payment,
    "trk_owed_table": owed_table,
    "trk_effective": effective,
    "trk_real": real,
    "trk_effective_before_inflation": effective_before_inflation,
    "trk_break_even_effective": break_even_effective,
    "trk_monthly_root": monthly_root,
    "trk_convert_table": convert_table,
}
