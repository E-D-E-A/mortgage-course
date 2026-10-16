"""Independent checks for early repayment (lessons 7.1-7.3).

Plain Python Decimal and datetime; nothing is imported from src/. The rules are
written out again here, on purpose, from the team's transcription of the Banking
Order on early repayment (Brain page 7798786): a typo in one place cannot pass the
check in the other. The TypeScript module is src/lib/calc/earlyrepay.ts.

A loan and a repayment are described by flat inputs on the fact:

    principal, rate (the contract's NOMINAL annual percent), term (months),
    method (spitzer | equal_principal), granted, repaid (ISO dates),
    track (fixed | variable | prime), reset (months between resets, 0 for none),
    linkage (linked | unlinked),
    avg_today (A, an EFFECTIVE annual percent), avg_grant (C, effective; "" if none),
    notice_on (ISO date or ""), index_change (average monthly index change, percent),
    directed (0 | 1), balance ("" or an override), field (what to return)

The route here differs from the TypeScript on purpose: the balance is found by
running the schedule payment by payment (the TypeScript uses the closed formula),
and every present value is a plain sum of Bi / (1 + q)^i with q built from the
rate by its own rule (nominal / 12; effective by the twelfth root).
"""
import calendar
from datetime import date
from decimal import ROUND_HALF_UP, Decimal, getcontext

from kinds.common import agorot

getcontext().prec = 60
ONE = Decimal(1)
TWELVE = Decimal(12)
HUNDRED = Decimal(100)
OPERATIONAL = Decimal("60")
NO_NOTICE_PERCENT = Decimal("0.1")


# ── dates ──
def d(s):
    y, m, day = (int(x) for x in s.split("-"))
    return date(y, m, day)


def add_months(s, k):
    x = d(s)
    idx = x.year * 12 + (x.month - 1) + k
    y, m = divmod(idx, 12)
    m += 1
    return date(y, m, min(x.day, calendar.monthrange(y, m)[1]))


def whole_months(a, b):
    """Largest k with add_months(a, k) <= b, found by counting up."""
    k = 0
    while add_months(a, k + 1) <= d(b):
        k += 1
    return k


# ── rates ──
def q_nominal(percent):
    return Decimal(percent) / HUNDRED / TWELVE


def q_effective(percent):
    return (ONE + Decimal(percent) / HUNDRED) ** (ONE / TWELVE) - ONE


def pv(payments, q):
    total = Decimal(0)
    for i, b in enumerate(payments, start=1):
        total += b / (ONE + q) ** i
    return total


# ── the loan ──
def stream(i, paid):
    """(balance after `paid` payments, the remaining payments), by running the schedule."""
    principal = Decimal(i["principal"])
    m = q_nominal(i["rate"])
    term = int(i["term"])
    if i.get("method", "spitzer") == "spitzer":
        pay = principal * m / (ONE - (ONE + m) ** -term) if m else principal / term
        bal = principal
        for _ in range(paid):
            bal = bal * (ONE + m) - pay
        return bal, [pay] * (term - paid)
    part = principal / term
    bal = principal
    for _ in range(paid):
        bal -= part
    start = bal
    out = []
    for k in range(term - paid):
        out.append(part + bal * m)
        bal -= part
    return start, out


def next_reset(granted, every, repaid):
    k = 1
    while add_months(granted, k * every) < d(repaid):
        k += 1
    when = add_months(granted, k * every)
    paid = whole_months(granted, repaid)
    return when, (0 if when == d(repaid) else k * every - paid)


def bucket(months, linkage):
    edges = [5, 10, 15, 20, 25] if linkage == "linked" else [1, 5, 10, 15, 20, 25]
    years = Decimal(months) / 12
    idx = sum(1 for e in edges if years > e)
    if idx == 0:
        return f"≤{edges[0]}"
    if idx == len(edges):
        return f">{edges[-1]}"
    return f"{edges[idx - 1]}–{edges[idx]}"


def reduction(granted, repaid):
    r = d(repaid)
    if r >= add_months(granted, 60):
        return 30
    if r >= add_months(granted, 36):
        return 20
    return 0


def notice(i):
    """(status, days, fee charged?)"""
    if not i.get("notice_on"):
        return "none", None, True
    days = (d(i["repaid"]) - d(i["notice_on"])).days
    if days < 0:
        return "after", days, True
    if days > 45:
        return "early", days, True
    if days < 10:
        return "short", days, True
    return "ok", days, False


def compute(i):
    """Everything the fee needs, as a dict of Decimals (exact) and plain values."""
    granted, repaid = i["granted"], i["repaid"]
    term = int(i["term"])
    paid = min(term, whole_months(granted, repaid))
    track = i.get("track", "fixed")
    every = int(i.get("reset", 0) or 0)
    linkage = i.get("linkage", "unlinked")
    balance, pays = stream(i, paid)
    if str(i.get("balance", "")) != "":
        balance = Decimal(i["balance"])
    out = {"paid": paid, "remaining": term - paid, "balance": balance, "payment": pays[0] if pays else Decimal(0)}
    status, days, charged = notice(i)
    out["notice_days"] = days
    out["reduction_percent"] = reduction(granted, repaid)
    reset_months = None
    exit_point = False
    if track == "variable" and every:
        when, reset_months = next_reset(granted, every, repaid)
        exit_point = when == d(repaid)
    out["months_to_reset"] = reset_months
    out["bucket"] = bucket(reset_months if reset_months is not None else term - paid, linkage)

    zero = Decimal(0)
    out.update(operational=OPERATIONAL, no_notice=zero, index=zero, discount=zero, lower=None, v1=None, v2=None,
               pv_today=None, pv_contract=None, pv_grant=None, binding="")
    if int(i.get("directed", 0)):
        out.update(operational=zero, status="directed")
        out["sum"] = out["total"] = zero
        return out
    if term - paid == 0:
        out.update(operational=zero, status="repaid_already")
        out["sum"] = out["total"] = zero
        return out
    if exit_point:
        out["status"] = "exit_point"
        out["sum"] = out["total"] = OPERATIONAL
        return out

    out["no_notice"] = balance * NO_NOTICE_PERCENT / HUNDRED if charged else zero
    day = d(repaid).day
    change = Decimal(i.get("index_change", 0) or 0)
    if linkage == "linked" and day <= 15 and change > 0:
        out["index"] = balance * change / HUNDRED / 2
    carries = track == "fixed" or (track == "variable" and every > 12)
    out["status"] = "ok" if carries else "track_exempt"
    if carries:
        n = len(pays) if reset_months is None else min(reset_months, len(pays))
        mR = q_nominal(i["rate"])
        mR0 = q_nominal(i.get("rate_grant") or i["rate"])
        mA = q_effective(i["avg_today"])
        cgrant = i.get("avg_grant", "")
        mC = q_effective(cgrant) if cgrant != "" else None

        def at(q):
            return pv(pays[:n], q) + (pv(pays[n:], mR) / (ONE + q) ** n if pays[n:] else Decimal(0))

        out["pv_today"] = at(mA)
        out["pv_contract"] = at(mR)
        if mC is not None:
            out["pv_grant"] = at(mC)
        v1 = out["pv_today"] - out["pv_contract"] if mA < mR else None
        v2 = out["pv_today"] - out["pv_grant"] if (mC is not None and mC < mR0) else None
        out["v1"], out["v2"] = v1, v2
        cands = [x for x in (v1, v2) if x is not None]
        if cands:
            lower = min(cands)
            out["lower"] = lower
            out["binding"] = "v2" if v2 is not None and lower == v2 else "v1"
            pct = out["reduction_percent"]
            out["discount"] = lower * (100 - pct) / HUNDRED if lower > 0 else lower
    total = out["discount"] + out["operational"] + out["no_notice"] + out["index"]
    out["sum"] = total
    out["total"] = max(Decimal(0), total)
    return out


def money(x):
    return str(agorot(x))


MONEY_FIELDS = {"balance", "payment", "pv_today", "pv_contract", "pv_grant", "v1", "v2", "lower", "discount", "operational",
                "no_notice", "index", "sum", "total"}


def fee_field(i, _facts=None):
    r = compute(i)
    f = i["field"]
    if f == "total_v1_only":
        # A calculator that knows only version one: v1 after the reduction, plus the other fees, floored at zero.
        if r["v1"] is None:
            return money(r["operational"] + r["no_notice"] + r["index"])
        pct = r["reduction_percent"]
        disc = r["v1"] * (100 - pct) / HUNDRED
        return money(max(Decimal(0), disc + r["operational"] + r["no_notice"] + r["index"]))
    if f in ("pv_today_nominal_mistake", "v1_nominal_mistake"):
        # The classic mistake: the published (effective) average divided by 12, as if it were a contract rate.
        balance, pays = stream(i, r["paid"])
        n = len(pays) if r["months_to_reset"] is None else min(r["months_to_reset"], len(pays))
        mR = q_nominal(i["rate"])
        q = q_nominal(i["avg_today"])
        value = pv(pays[:n], q) + (pv(pays[n:], mR) / (ONE + q) ** n if pays[n:] else Decimal(0))
        return money(value if f == "pv_today_nominal_mistake" else value - r["pv_contract"])
    v = r[f]
    if v is None:
        raise ValueError(f"field {f} has no value for this case")
    if f in MONEY_FIELDS:
        return money(v)
    return v if isinstance(v, str) else int(v)


# ── single steps ──
def pct_text(x, decimals):
    q = Decimal(1).scaleb(-int(decimals))
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def monthly_percent(i, _facts=None):
    """The monthly rate in percent, rounded to `decimals`: nominal / 12, or effective by the twelfth root."""
    q = q_nominal(i["rate"]) if i["kind"] == "nominal" else q_effective(i["rate"])
    return pct_text(q * HUNDRED, i["decimals"])


def effective_of_nominal(i, _facts=None):
    e = (ONE + q_nominal(i["rate"])) ** 12 - ONE
    return pct_text(e * HUNDRED, i["decimals"])


def pv_single(i, _facts=None):
    """One payment, `years` from now, discounted at an annual rate: payment / (1 + r)^years."""
    return money(Decimal(i["payment"]) / (ONE + Decimal(i["rate"]) / HUNDRED) ** Decimal(i["years"]))


def percent_of(i, _facts=None):
    return money(Decimal(i["amount"]) * Decimal(i["percent"]) / HUNDRED)


def times(i, facts):
    return money(Decimal(facts[i["of"]]["value"]) * int(i["count"]))


def total_of(i, facts):
    return money(sum(Decimal(facts[x]["value"]) for x in i["facts"].split("|")))


def after_reduction(i, facts):
    return money(Decimal(facts[i["of"]]["value"]) * (100 - Decimal(i["percent"])) / HUNDRED)


def day_interest(i, _facts=None):
    """One day's interest, as a thirtieth of a month's: balance x annual rate / 12 / 30."""
    return money(Decimal(i["balance"]) * Decimal(i["rate"]) / HUNDRED / 12 / int(i["days"]))


def month_interest(i, facts):
    return money(Decimal(facts[i["balance_fact"]]["value"]) * Decimal(i["rate"]) / HUNDRED / 12)


def lowest(i, facts):
    return money(min(Decimal(facts[x]["value"]) for x in i["facts"].split("|")))


def ratio(i, facts):
    q = Decimal(facts[i["a"]]["value"]) / Decimal(facts[i["b"]]["value"])
    return pct_text(q, i["decimals"])


def index_fee_direct(i, _facts=None):
    return money(Decimal(i["amount"]) * Decimal(i["change"]) / HUNDRED / 2)


def months_between(i, _facts=None):
    return whole_months(i["from"], i["to"])


def days_between(i, _facts=None):
    return (d(i["to"]) - d(i["from"])).days


def date_plus_months(i, _facts=None):
    return add_months(i["from"], int(i["months"])).isoformat()


def date_plus_days(i, _facts=None):
    from datetime import timedelta
    return (d(i["from"]) + timedelta(days=int(i["days"]))).isoformat()


def years_text(i, _facts=None):
    return int(i["months"]) // 12


KINDS = {
    "er_fee": fee_field,
    "er_monthly_percent": monthly_percent,
    "er_effective_of_nominal": effective_of_nominal,
    "er_pv_single": pv_single,
    "er_percent_of": percent_of,
    "er_times": times,
    "er_total": total_of,
    "er_after_reduction": after_reduction,
    "er_min": lowest,
    "er_day_interest": day_interest,
    "er_month_interest": month_interest,
    "er_ratio": ratio,
    "er_index_fee": index_fee_direct,
    "er_months_between": months_between,
    "er_days_between": days_between,
    "er_date_plus_months": date_plus_months,
    "er_date_plus_days": date_plus_days,
    "er_years": years_text,
}
