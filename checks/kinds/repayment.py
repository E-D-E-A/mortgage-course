"""Independent checks for deferred repayment and the special tracks (lessons 2.8, 2.9, 2.10).

Whole Spitzer and equal-principal tables, the level payment and the monthly
rate are checked by their own kinds (amortization.py, rates.py). The kinds here
are grace and bullet tables, and single cells and totals of any method; for a
cell or a total of a plain Spitzer or equal-principal loan this file rebuilds
the schedule by its own route (the payment as the loan over the sum of discount
factors), so it stays independent of the TypeScript.

Python's Decimal only — no code from src/lib/calc. The conventions are the
course's: monthly rate = annual rate / 12; each month's interest rounded to the
agora; a Spitzer payment rounded to the agora once; an equal-principal part
rounded to the agora; the last month pays whatever is left, so every schedule
ends at zero. Grace sits inside the term; full grace and a full bullet add each
month's rounded interest to the debt.
"""
from decimal import Decimal

from kinds.common import agorot


def _monthly(annual):
    return Decimal(str(annual)) / 12 / 100


def _plain(x):
    s = format(Decimal(x).normalize(), "f")
    return s


def _spitzer_exact(principal, annual, months):
    r = _monthly(annual)
    p = Decimal(str(principal))
    if r == 0:
        return p / months
    # Independent route: the payment that makes the value today of the payments equal the loan,
    # summed term by term rather than with the closed form.
    discount = sum(1 / (1 + r) ** k for k in range(1, months + 1))
    return p / discount


def _rows(principal, annual, months, method, grace=0, first=1):
    """Each entry: (opening, interest, payment). Closing = opening + interest - payment."""
    r = _monthly(annual)
    bal = agorot(principal)
    out = []
    if method == "spitzer":
        pay = agorot(_spitzer_exact(bal, annual, months))
        for k in range(1, months + 1):
            i = agorot(bal * r)
            p = bal + i if k == months else pay
            out.append((bal, i, p))
            bal = bal + i - p
    elif method == "equal_principal":
        part = agorot(bal / months)
        for k in range(1, months + 1):
            i = agorot(bal * r)
            p = (bal if k == months else part) + i
            out.append((bal, i, p))
            bal = bal + i - p
    elif method in ("grace_partial", "grace_full"):
        for _ in range(grace):
            i = agorot(bal * r)
            p = i if method == "grace_partial" else Decimal(0)
            out.append((bal, i, p))
            bal = bal + i - p
        out += _rows(bal, annual, months - grace, "spitzer")
    elif method in ("bullet_partial", "bullet_full"):
        for k in range(1, months + 1):
            i = agorot(bal * r)
            if k == months:
                p = bal + i
            else:
                p = i if method == "bullet_partial" else Decimal(0)
            out.append((bal, i, p))
            bal = bal + i - p
    else:
        raise ValueError(f"unknown method {method}")
    return out


def _schedule(i):
    rows = _rows(i["principal"], i["annual_percent"], int(i["months"]), i["method"], int(i.get("grace_months", 0)))
    return [
        {
            "period": n,
            "opening": str(agorot(o)),
            "interest": str(agorot(it)),
            "principal": str(agorot(p - it)),
            "payment": str(agorot(p)),
            "closing": str(agorot(o + it - p)),
        }
        for n, (o, it, p) in enumerate(rows, start=1)
    ]


def schedule(i, _facts=None):
    # Spitzer and equal principal tables are amortization.py's statement kinds.
    if i["method"] in ("spitzer", "equal_principal"):
        raise ValueError("use amort_annuity_statement / amort_equal_statement")
    return _schedule(i)


def cell(i, _facts=None):
    return _schedule(i)[int(i["period"]) - 1][i["field"]]


def total_paid(i, _facts=None):
    return str(agorot(sum(Decimal(r["payment"]) for r in _schedule(i))))


def total_interest(i, _facts=None):
    return str(agorot(sum(Decimal(r["interest"]) for r in _schedule(i))))


def months_in_years(i, _facts=None):
    return int(i["years"]) * 12


def crossover(i, _facts=None):
    base = {"principal": i["principal"], "annual_percent": i["annual_percent"], "months": i["months"]}
    s = _schedule({**base, "method": "spitzer"})
    e = _schedule({**base, "method": "equal_principal"})
    for a, b in zip(s, e):
        if Decimal(b["payment"]) < Decimal(a["payment"]):
            return a["period"]
    raise ValueError("no crossover")


def capped_rate(i, _facts=None):
    return _plain(min(Decimal(str(i["average_percent"])) - Decimal(str(i["below_points"])), Decimal(str(i["cap_percent"]))))


def rate_plus_points(i, _facts=None):
    return _plain(Decimal(str(i["rate_percent"])) + Decimal(str(i["points"])))


def capped_discount(i, _facts=None):
    return str(agorot(min(Decimal(str(i["price"])) * Decimal(str(i["percent"])) / 100, Decimal(str(i["cap"])))))


def fx_balance(i, _facts=None):
    return str(agorot(Decimal(str(i["amount"])) * Decimal(str(i["rate_now"])) / Decimal(str(i["rate_at_start"]))))


def fx_units(i, _facts=None):
    return str(agorot(Decimal(str(i["amount"])) / Decimal(str(i["rate"]))))


def sum_of(i, facts):
    return str(agorot(sum(Decimal(facts[f]["value"]) for f in str(i["facts"]).split("|"))))


KINDS = {
    "rep_schedule": schedule,
    "rep_cell": cell,
    "rep_total_paid": total_paid,
    "rep_total_interest": total_interest,
    "rep_months_in_years": months_in_years,
    "rep_crossover_month": crossover,
    "rep_capped_rate": capped_rate,
    "rep_capped_discount": capped_discount,
    "rep_rate_plus_points": rate_plus_points,
    "rep_fx_balance": fx_balance,
    "rep_fx_units": fx_units,
    "rep_sum": sum_of,
}
