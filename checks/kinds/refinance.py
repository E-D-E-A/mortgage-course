"""Independent checks for the refinance test and the comparison of staying with switching
(lessons 7.4, 7.5 and later 7.8). Every fact kind here starts with ref_.

Plain Python Decimal; nothing is imported from src/lib/calc. What is rebuilt here, by its own route:

- The loan as it stands. The schedule of each existing track comes from checks/kinds/metrics.py (_rows, which
  rebuilds schedules by its own route: monthly rate = annual / 12, exact or statement rounding as the fact says);
  the balance is the closing balance after the payments made, the payments left are the rest of the rows.
- The two figures of Directive 451 §15א (as the team transcribed it, Brain 7733250):
      P + T = C1/(1+r) + C2/(1+r)^2 + ... + Cn/(1+r)^n
  with T = 0 (the expected total rate) and with T = the fee (the rate for comparison purposes), the IRR found by
  Newton's method (the TypeScript uses bisection), both turned into a yearly rate by (1+r)^12 - 1.
  The shared charge (the ₪60 operational fee, once per repayment) is in the whole-loan figure only.
- The new loan: an offers.py offer (checks/kinds/offers.py parses it and rebuilds its tracks); here only its
  payments, its balance after each payment, its loan and its expected total rate are used.
- The comparison: month by month from day 0, the cash saved so far (stay payments less new payments, less the cash
  paid on day 0), the balance gap (still owed on the old loan less still owed on the new one), their sum (the net
  position), the totals, the first month each is not negative, and the present-value saving at a monthly rate.
- months_at_payment: the fewest months in which the exact annuity of a loan is at most a given payment.

Text forms (the facts' inputs):
  tracks   metrics.py's text form (';' between tracks, '|' between fields), rounding in the last field.
  paid     the payments made on each track, ';'-separated.
  fees     T for each track, ';'-separated.
  shared   a charge in the whole-loan figure only.
  scope    "whole" or the number of one track (from 0).
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot
from kinds.metrics import _irr, _level, _parse, _plain, _pv, _rows
from kinds.offers import _forecasts, _met_track, _offer

ONE = Decimal(1)
HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def _money(x):
    return str(agorot(x))


def _eff(monthly_percent):
    """Effective annual percent from a monthly percent: ((1 + r)^12 - 1) x 100."""
    return ((ONE + Decimal(monthly_percent) / HUNDRED) ** 12 - ONE) * HUNDRED


def _add(lists):
    n = max(len(x) for x in lists)
    return [sum((x[k] for x in lists if k < len(x)), Decimal(0)) for k in range(n)]


def _tails(i):
    """Each existing track as it stands: balance, payments left, balance after each, and its fee T."""
    tracks = _parse(i["tracks"])
    paid = [int(x) for x in str(i["paid"]).split(";")]
    fees = [Decimal(x) for x in str(i["fees"]).split(";")]
    if not (len(tracks) == len(paid) == len(fees)):
        raise ValueError("tracks, paid and fees must have one entry per track")
    out = []
    for t, p, fee in zip(tracks, paid, fees):
        rows = _rows(t)
        if p >= len(rows):
            raise ValueError("nothing is left to refinance")
        balance = t["principal"] if p == 0 else rows[p - 1]["closing"]
        left = rows[p:]
        out.append({"balance": balance, "payments": [r["payment"] for r in left], "balances": [r["closing"] for r in left], "fee": fee})
    return out


def _scope(i):
    """The stream the figures are about: one track, or the whole loan (with the shared charge)."""
    tails = _tails(i)
    if str(i["scope"]) != "whole":
        return tails[int(i["scope"])]
    return {
        "balance": sum((t["balance"] for t in tails), Decimal(0)),
        "payments": _add([t["payments"] for t in tails]),
        "balances": _add([t["balances"] for t in tails]),
        "fee": sum((t["fee"] for t in tails), Decimal(0)) + Decimal(str(i.get("shared", "0"))),
    }


def _figures(s):
    irr_without = _irr(s["payments"], s["balance"])
    irr_with = _irr(s["payments"], s["balance"] + s["fee"])
    return {
        "balance": s["balance"],
        "fee": s["fee"],
        "financed": s["balance"] + s["fee"],
        "months": len(s["payments"]),
        "first": s["payments"][0],
        "total": sum(s["payments"], Decimal(0)),
        "irr_without": irr_without,
        "irr_with": irr_with,
        "rate_without": _eff(irr_without),
        "rate_with": _eff(irr_with),
    }


def stay(i, facts):
    f = _figures(_scope(i))
    which = i["measure"]
    if which == "months":
        return f["months"]
    if which in ("balance", "fee", "financed", "first", "total"):
        return _money(f[which])
    return _plain(f[which], int(i["decimals"]))


def _new_loan(i):
    """The new offer: its payments, its balance after each payment, its loan, its up-front charges and its expected total rate."""
    o = _offer(i["offer"])
    f = _forecasts(i["forecasts"])[o["forecast"]]
    each = [_rows(_parse(_met_track(t, f))[0]) for t in o["tracks"]]
    payments = _add([[r["payment"] for r in rows] for rows in each])
    balances = _add([[r["closing"] for r in rows] for rows in each])
    loan = sum((t["amount"] for t in o["tracks"]), Decimal(0))
    irr = _irr(payments, loan - o["upfront"])
    return {"payments": payments, "balances": balances, "loan": loan, "upfront": o["upfront"], "rate": _eff(irr), "total": sum(payments, Decimal(0))}


def _at(xs, k):
    return xs[k - 1] if 1 <= k <= len(xs) else Decimal(0)


def _path(old, new, cash_now):
    """(month, cash, balance gap, position) for month 0 .. horizon."""
    horizon = max(len(old["payments"]), len(new["payments"]))
    cash = -Decimal(cash_now)
    out = []
    for k in range(horizon + 1):
        if k > 0:
            cash = cash + _at(old["payments"], k) - _at(new["payments"], k)
        gap = (old["balance"] if k == 0 else _at(old["balances"], k)) - (new["loan"] if k == 0 else _at(new["balances"], k))
        out.append((k, cash, gap, cash + gap))
    return out


def _first_ahead(path, column):
    for row in path:
        if row[0] > 0 and row[column] >= 0:
            return row[0]
    return None


def switch(i, facts):
    old = _scope(i)
    new = _new_loan(i)
    cash_now = Decimal(str(i["cash"]))
    path = _path(old, new, cash_now)
    which = i["measure"]
    figures = _figures(old)
    if which == "new_first":
        return _money(new["payments"][0])
    if which == "new_total":
        return _money(new["total"])
    if which == "new_months":
        return len(new["payments"])
    if which == "new_loan":
        return _money(new["loan"])
    if which == "new_rate":
        return _plain(new["rate"], int(i["decimals"]))
    if which == "monthly_gap":
        return _money(old["payments"][0] - new["payments"][0])
    stay_total = sum(old["payments"], Decimal(0))
    switch_total = new["total"] + cash_now
    if which == "stay_total":
        return _money(stay_total)
    if which == "switch_total":
        return _money(switch_total)
    if which == "total_saving":
        return _money(stay_total - switch_total)
    if which == "cash_break_even":
        return _first_ahead(path, 1)
    if which == "position_break_even":
        return _first_ahead(path, 3)
    if which in ("cash_at", "gap_at", "position_at"):
        row = path[int(i["k"])]
        return _money(row[{"cash_at": 1, "gap_at": 2, "position_at": 3}[which]])
    if which == "pv_saving":
        disc = figures["irr_with"] if i["disc"] == "comparison" else Decimal(str(i["disc"]))
        return _money(_pv(old["payments"], disc) - _pv(new["payments"], disc) - cash_now)
    margin = figures["rate_with"] - new["rate"]
    if which == "margin":
        return _plain(margin, int(i["decimals"]))
    if which == "worthwhile":
        return margin > 0
    raise ValueError(f"unknown measure {which}")


def months_at_payment(i, facts):
    """The fewest months n in 1..720 whose exact level payment on `amount` at `rate` is at most `payment`."""
    amount = Decimal(i["amount"])
    m = Decimal(i["rate"]) / TWELVE / HUNDRED
    pay = Decimal(i["payment"])
    for n in range(1, 721):
        if _level(amount, m, n) <= pay:
            return n
    raise ValueError("this payment does not repay the loan within 60 years")


KINDS = {
    "ref_stay": stay,
    "ref_switch": switch,
    "ref_months_at_payment": months_at_payment,
}
