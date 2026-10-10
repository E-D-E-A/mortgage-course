"""Independent checks for the measures of a whole schedule (lessons 3.8-3.11).

Every fact kind here starts with met_. A schedule is described in the fact's
inputs as a string, one track per ';', fields separated by '|':

    method|principal|rates|block_months|months|inflation_percent|grace_months

- method: spitzer, equal_principal, grace_partial or grace_full;
- rates: nominal annual percents, comma-separated, one per block of
  block_months months (a variable track's teaching path); the last carries on;
- inflation_percent: a linked track's yearly index rise, at an even monthly
  pace (the twelfth root); 0 for an unlinked track.

This file rebuilds each schedule by its own route, with Python's Decimal only
and no code from src/lib/calc: the monthly rate is the annual rate / 12; the
balance is indexed before each payment; the level payment is recalculated on
the balance left, over the months left, whenever the rate changes, and is
otherwise last month's payment times the index factor; nothing is rounded until
the value is shown. Equal principal repays the balance / the months left each
month, plus the month's interest. The IRR is found by Newton's method (the TypeScript uses
bisection), so the two routes agree only if both are right.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

ONE = Decimal(1)
TWELVE = Decimal(12)
HUNDRED = Decimal(100)


def _plain(x, decimals):
    """Rounded half away from zero, trailing zeros dropped: 4.8071… -> '4.8071'; 0.40000 -> '0.4'."""
    q = Decimal(1).scaleb(-decimals)
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _money(x):
    return str(agorot(x))


def _parse(tracks):
    out = []
    for part in str(tracks).split(";"):
        method, principal, rates, block, months, inflation, grace = part.split("|")
        out.append(
            {
                "method": method,
                "principal": Decimal(principal),
                "rates": [Decimal(r) for r in rates.split(",")],
                "block": int(block),
                "months": int(months),
                "inflation": Decimal(inflation),
                "grace": int(grace),
            }
        )
    return out


def _level(balance, monthly, months):
    if monthly == 0:
        return balance / months
    return balance * monthly / (ONE - (ONE + monthly) ** (-months))


def _rows(t):
    """Each month: dict(opening, indexation, interest, payment, closing)."""
    n = t["months"]
    rates = [t["rates"][min(k // t["block"], len(t["rates"]) - 1)] for k in range(n)]
    rows = []
    bal = t["principal"]
    method = t["method"]
    start = 0
    if method in ("grace_partial", "grace_full"):
        m = rates[0] / TWELVE / HUNDRED
        for k in range(t["grace"]):
            interest = bal * m
            pay = interest if method == "grace_partial" else Decimal(0)
            rows.append({"opening": bal, "indexation": Decimal(0), "interest": interest, "payment": pay, "closing": bal + interest - pay})
            bal = bal + interest - pay
        start = t["grace"]
    factor = (ONE + t["inflation"] / HUNDRED) ** (ONE / TWELVE)
    pay = None
    prev_rate = None
    for k in range(start, n):
        opening = bal * factor
        indexation = opening - bal
        rate = rates[k]
        m = rate / TWELVE / HUNDRED
        interest = opening * m
        if method == "equal_principal":
            pay = opening / (n - k) + interest
        elif pay is None or rate != prev_rate:
            pay = _level(opening, m, n - k)
        else:
            pay = pay * factor
        prev_rate = rate
        closing = Decimal(0) if k == n - 1 else opening + interest - pay
        rows.append({"opening": opening, "indexation": indexation, "interest": interest, "payment": pay, "closing": closing})
        bal = closing
    return rows


def _payments(tracks):
    each = [[r["payment"] for r in _rows(t)] for t in _parse(tracks)]
    n = max(len(p) for p in each)
    return [sum((p[k] for p in each if k < len(p)), Decimal(0)) for k in range(n)]


def _pv(payments, monthly_percent):
    g = ONE + Decimal(monthly_percent) / HUNDRED
    return sum((Decimal(c) / g ** (k + 1) for k, c in enumerate(payments)), Decimal(0))


def _irr(payments, received):
    """Newton's method on f(r) = sum c_k (1 + r)^-k - received, from r = 0 (a fraction a month)."""
    received = Decimal(received)
    r = Decimal(0)
    for _ in range(200):
        f = Decimal(0)
        df = Decimal(0)
        for k, c in enumerate(payments, start=1):
            d = (ONE + r) ** (-k)
            f += c * d
            df -= k * c * d / (ONE + r)
        f -= received
        step = f / df
        r -= step
        if abs(step) < Decimal("1e-30"):
            return r * HUNDRED
    raise ValueError("Newton's method did not converge")


def payment(i, facts):
    return _money(_payments(i["tracks"])[int(i["month"]) - 1])


def first_payment(i, facts):
    return _money(_payments(i["tracks"])[0])


def _highest(tracks):
    p = _payments(tracks)
    best = 0
    for k in range(1, len(p)):
        if p[k] > p[best]:
            best = k
    return best + 1, p[best]


def highest_payment(i, facts):
    return _money(_highest(i["tracks"])[1])


def highest_month(i, facts):
    return _highest(i["tracks"])[0]


def percent_above(i, facts):
    value = Decimal(facts[i["value"]]["value"])
    base = Decimal(facts[i["base"]]["value"])
    return _plain((value / base - 1) * HUNDRED, int(i["decimals"]))


def threshold(i, facts):
    """base x (1 + percent/100): the payment a given percent above a base."""
    return _money(Decimal(facts[i["base"]]["value"]) * (1 + Decimal(i["percent"]) / HUNDRED))


def balance(i, facts):
    """A single track's balance after the payment of a given month."""
    return _money(_single(i["tracks"])[int(i["month"]) - 1]["closing"])


def total_paid(i, facts):
    return _money(sum(_payments(i["tracks"]), Decimal(0)))


def _single(tracks):
    ts = _parse(tracks)
    if len(ts) != 1:
        raise ValueError("a breakdown is of one track")
    return _rows(ts[0])


def total_interest(i, facts):
    return _money(sum((r["interest"] for r in _single(i["tracks"])), Decimal(0)))


def total_indexation(i, facts):
    return _money(sum((r["indexation"] for r in _single(i["tracks"])), Decimal(0)))


def pv(i, facts):
    rate = Decimal(i["rate_percent"])
    monthly = rate / TWELVE if i["basis"] == "annual" else rate
    return _money(_pv(_payments(i["tracks"]), monthly))


def pv_list(i, facts):
    payments = [Decimal(x) for x in str(i["payments"]).split(",")]
    return _money(_pv(payments, Decimal(i["monthly_percent"])))


def pv_rows(i, facts):
    payments = _payments(i["tracks"]) if "tracks" in i else [Decimal(x) for x in str(i["payments"]).split(",")]
    g = ONE + Decimal(i["monthly_percent"]) / HUNDRED
    out = []
    for k, c in enumerate(payments, start=1):
        growth = g ** k
        out.append({"month": k, "payment": _money(c), "growth": _plain(growth, int(i["decimals"])), "value_today": _money(c / growth)})
    return out


def irr_monthly(i, facts):
    return _plain(_irr(_payments(i["tracks"]), i["received"]), int(i["decimals"]))


def irr_x12(i, facts):
    return _plain(_irr(_payments(i["tracks"]), i["received"]) * TWELVE, int(i["decimals"]))


def irr_effective(i, facts):
    r = _irr(_payments(i["tracks"]), i["received"]) / HUNDRED
    return _plain(((ONE + r) ** 12 - ONE) * HUNDRED, int(i["decimals"]))


def x12(i, facts):
    return _plain(Decimal(i["monthly_percent"]) * TWELVE, int(i["decimals"]))


def effective_from_monthly(i, facts):
    r = Decimal(i["monthly_percent"]) / HUNDRED
    return _plain(((ONE + r) ** 12 - ONE) * HUNDRED, int(i["decimals"]))


def bisection_table(i, facts):
    payments = _payments(i["tracks"])
    received = Decimal(i["received"])
    low, high = Decimal(i["low"]), Decimal(i["high"])
    d = int(i["decimals"])
    out = []
    for s in range(1, int(i["steps"]) + 1):
        mid = (low + high) / 2
        value = _pv(payments, mid)
        verdict = "low" if value > received else "high"
        out.append({"step": s, "low": _plain(low, d), "high": _plain(high, d), "mid": _plain(mid, d), "value_today": _money(value), "verdict": verdict})
        if verdict == "low":
            low = mid
        else:
            high = mid
    return out


def block_table(i, facts):
    """One row per block of a mix: the rate of the variable track and each track's payment in the block's first month."""
    ts = _parse(i["tracks"])
    each = [[r["payment"] for r in _rows(t)] for t in ts]
    block = int(i["block_months"])
    n = max(len(p) for p in each)
    out = []
    for b, start in enumerate(range(0, n, block), start=1):
        to = min(start + block, n)
        row = {"block": b, "from_month": start + 1, "to_month": to, "years": f"{_plain(Decimal(start) / 12 + 1, 4)}–{_plain(Decimal(to) / 12, 4)}"}
        total = Decimal(0)
        for j, (t, p) in enumerate(zip(ts, each), start=1):
            rate = t["rates"][min(start // t["block"], len(t["rates"]) - 1)]
            row[f"rate_{j}"] = _plain(rate, 4)
            pay = p[start] if start < len(p) else Decimal(0)
            row[f"payment_{j}"] = _money(pay)
            total += pay
        row["total"] = _money(total)
        out.append(row)
    return out


def series(i, facts):
    """The payment every `every` months, from month 1: a light series for a video or a chart."""
    p = _payments(i["tracks"])
    return [_money(p[k]) for k in range(0, len(p), int(i["every"]))]


def pv_curve(i, facts):
    """The value today at each annual rate in a comma list (monthly = annual / 12)."""
    p = _payments(i["tracks"])
    return [{"rate": r, "value_today": _money(_pv(p, Decimal(r) / TWELVE))} for r in str(i["rates"]).split(",")]


def share(i, facts):
    """part / whole x 100, in percent."""
    return _plain(Decimal(facts[i["part"]]["value"]) / Decimal(facts[i["whole"]]["value"]) * HUNDRED, int(i["decimals"]))


def money_sum(i, facts):
    return _money(sum((Decimal(facts[x]["value"]) for x in str(i["facts"]).split("|")), Decimal(0)))


def times(i, facts):
    """A money fact times a whole count: a rounded payment times the number of payments."""
    return _money(Decimal(facts[i["of"]]["value"]) * int(i["count"]))


def payments_count(i, facts):
    return int(i["years"]) * 12


KINDS = {
    "met_payment": payment,
    "met_first_payment": first_payment,
    "met_highest_payment": highest_payment,
    "met_highest_month": highest_month,
    "met_percent_above": percent_above,
    "met_threshold": threshold,
    "met_total_paid": total_paid,
    "met_balance": balance,
    "met_total_interest": total_interest,
    "met_total_indexation": total_indexation,
    "met_pv": pv,
    "met_pv_list": pv_list,
    "met_pv_rows": pv_rows,
    "met_irr_monthly": irr_monthly,
    "met_irr_x12": irr_x12,
    "met_irr_effective": irr_effective,
    "met_x12": x12,
    "met_effective_from_monthly": effective_from_monthly,
    "met_bisection_table": bisection_table,
    "met_block_table": block_table,
    "met_series": series,
    "met_pv_curve": pv_curve,
    "met_share": share,
    "met_sum": money_sum,
    "met_months": payments_count,
    "met_times": times,
}
