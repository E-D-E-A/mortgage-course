"""Independent checks for whole-track and whole-mix schedules (lessons 3.5–3.7, and the
figures 3.8–3.11 take from src/lib/calc/schedule.ts). Fact kinds start with sch_.

Plain Python Decimal; nothing is imported from src/lib/calc. Where the TypeScript keeps
last month's payment and indexes it, this file recalculates the level payment from the
indexed balance every month — the same number by another route.

Conventions: annual rate ÷ 12 is the monthly rate; payments at the end of each month; a
linked balance is indexed every month, before the payment, from the first month on; on a
rate change the payment is recalculated on the balance left over the months left; a
variable track resets every `reset` months from the start, and its new rate is the start
rate plus the anchor's shift in the month after the reset; prime's rate is the start rate
plus the prime shift of that month. Each track has its own term; a mix is their sum.
"""
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def numbered(i, prefix, start=1):
    values, n = [], start
    while f"{prefix}_{n}" in i:
        values.append(Decimal(str(i[f"{prefix}_{n}"])))
        n += 1
    return values


def block_value(values, block, t):
    return values[min(t // block, len(values) - 1)]


def level_payment(balance, annual, months):
    m = Decimal(annual) / TWELVE / HUNDRED
    if m == 0:
        return Decimal(balance) / months
    return Decimal(balance) * m / (1 - (1 + m) ** (-months))


def run(principal, rates, factors, method):
    """Rows of (opening, indexation, interest, payment, principal_paid, closing, index_ratio)."""
    months = len(rates)
    balance = Decimal(principal)
    ratio = Decimal(1)
    rows = []
    for t in range(months):
        f = factors[t] if factors else Decimal(1)
        ratio *= f
        opening = balance * f
        indexation = opening - balance
        rate = rates[t]
        interest = opening * rate / TWELVE / HUNDRED
        if method == "spitzer":
            payment = level_payment(opening, rate, months - t)
            principal_paid = payment - interest
        else:
            principal_paid = opening / (months - t)
            payment = principal_paid + interest
        closing = Decimal(0) if t == months - 1 else opening - principal_paid
        rows.append({
            "opening": opening, "indexation": indexation, "interest": interest, "payment": payment,
            "principal_paid": principal_paid, "closing": closing, "index_ratio": ratio,
            "payment_indexation": payment - payment / ratio,
        })
        balance = closing
    return rows


def path_from_inputs(i):
    months = int(i["months"])
    changes, k = [], 1
    while f"change_{k}_month" in i:
        changes.append((int(i[f"change_{k}_month"]), Decimal(str(i[f"change_{k}_rate"]))))
        k += 1
    changes.sort(key=lambda c: c[0])
    rates = []
    for t in range(months):
        r = Decimal(str(i["rate"]))
        for month, rate in changes:
            if t + 1 >= month:
                r = rate
        rates.append(r)
    index = numbered(i, "index", 0)
    inflation = numbered(i, "inflation")
    factors = None
    if index:
        factors = [index[t + 1] / index[t] if t + 1 < len(index) else Decimal(1) for t in range(months)]
    elif inflation:
        block = int(i.get("inflation_block_months", 12))
        factors = [(1 + block_value(inflation, block, t) / HUNDRED) ** (Decimal(1) / TWELVE) for t in range(months)]
    return run(i["principal"], rates, factors, i.get("method", "spitzer"))


def money(x):
    return str(agorot(x))


def plain(x):
    q = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).normalize()
    s = format(q, "f")
    return "0" if s in ("-0", "0") else s


# --- one path --------------------------------------------------------------------------

def row(i, _facts=None):
    return money(path_from_inputs(i)[int(i["month"]) - 1][i["field"]])


def series(i, _facts=None):
    rows = path_from_inputs(i)
    return [{"year": k // 12, "payment": money(rows[k - 1]["payment"]), "balance": money(rows[k - 1]["closing"])} for k in range(12, len(rows) + 1, 12)]


def total(i, _facts=None):
    rows = path_from_inputs(i)[: int(i.get("through", 10**9))]
    return money(sum((r[i["field"]] for r in rows), Decimal(0)))


def recalc(i, _facts=None):
    return money(level_payment(Decimal(i["balance"]), Decimal(i["rate_percent"]), int(i["months_left"])))


def months_left(i, _facts=None):
    return str(int(i["months"]) - int(i["paid"]))


# --- a mix -----------------------------------------------------------------------------

def mix_from_inputs(i):
    block = int(i.get("block_months", 12))
    infl = numbered(i, "inflation") or [Decimal(0)]
    prime = numbered(i, "prime_shift") or [Decimal(0)]
    anchor = numbered(i, "anchor_shift") or [Decimal(0)]
    linked_anchor = numbered(i, "linked_anchor_shift") or anchor
    tracks = []
    for k in range(1, int(i["tracks"]) + 1):
        p = f"t{k}_"
        kind = i[p + "kind"]
        months = int(i[p + "months"])
        start = Decimal(str(i[p + "rate"]))
        if kind in ("fixed_unlinked", "fixed_linked"):
            rates = [start] * months
        elif kind == "prime":
            rates = [start + block_value(prime, block, t) for t in range(months)]
        else:
            every = int(i[p + "reset"])
            shifts = linked_anchor if kind == "variable_linked" else anchor
            rates = []
            for t in range(months):
                last = (t // every) * every
                rates.append(start if last == 0 else start + block_value(shifts, block, last))
        factors = None
        if kind in ("fixed_linked", "variable_linked"):
            factors = [(1 + block_value(infl, block, t) / HUNDRED) ** (Decimal(1) / TWELVE) for t in range(months)]
        tracks.append({"kind": kind, "amount": Decimal(str(i[p + "amount"])), "rows": run(i[p + "amount"], rates, factors, i[p + "method"])})
    return tracks


def flow(i):
    tracks = mix_from_inputs(i)
    months = max(len(t["rows"]) for t in tracks)
    return [sum((t["rows"][m]["payment"] for t in tracks if m < len(t["rows"])), Decimal(0)) for m in range(months)], tracks


def mix_payment(i, _facts=None):
    return money(flow(i)[0][int(i["month"]) - 1])


def mix_track_payment(i, _facts=None):
    _, tracks = flow(i)
    rows = tracks[int(i["track"]) - 1]["rows"]
    m = int(i["month"])
    return money(rows[m - 1]["payment"]) if m <= len(rows) else "0.00"


def mix_first(i, _facts=None):
    return money(flow(i)[0][0])


def mix_max(i, _facts=None):
    return money(max(flow(i)[0]))


def mix_max_month(i, _facts=None):
    f = [agorot(x) for x in flow(i)[0]]  # to the agora: equal payments tie, the first wins
    return str(f.index(max(f)) + 1)


def mix_total(i, _facts=None):
    return money(sum(flow(i)[0], Decimal(0)))


def mix_yearly(i, _facts=None):
    f = flow(i)[0]
    return [{"year": k // 12, "payment": money(f[k - 1])} for k in range(12, len(f) + 1, 12)]


GROUPS = {
    "prime": ("prime",),
    "linked": ("fixed_linked", "variable_linked"),
    "fixed_for_term": ("fixed_unlinked", "fixed_linked"),
    "resetting": ("variable_unlinked", "variable_linked"),
}


def mix_share(i, _facts=None):
    amounts = [(i[f"t{k}_kind"], Decimal(str(i[f"t{k}_amount"]))) for k in range(1, int(i["tracks"]) + 1)]
    whole = sum((a for _, a in amounts), Decimal(0))
    part = sum((a for kind, a in amounts if kind in GROUPS[i["group"]]), Decimal(0))
    return plain(part / whole * HUNDRED)


def one_formula(i, _facts=None):
    """The mistake: one level payment for the whole loan, at the amount-weighted rate, over the amount-weighted term."""
    n = int(i["tracks"])
    amounts = [Decimal(str(i[f"t{k}_amount"])) for k in range(1, n + 1)]
    whole = sum(amounts, Decimal(0))
    rate = sum((a * Decimal(str(i[f"t{k}_rate"])) for k, a in zip(range(1, n + 1), amounts)), Decimal(0)) / whole
    months = sum((a * Decimal(str(i[f"t{k}_months"])) for k, a in zip(range(1, n + 1), amounts)), Decimal(0)) / whole
    months = int(months.quantize(Decimal(1), rounding=ROUND_HALF_UP))
    return money(level_payment(whole, rate, months))


# --- the start of a schedule (451 §17 as transcribed) ------------------------------------

def start_of(i):
    paid = date.fromisoformat(i["payout"])
    if paid.day <= 15:
        start = date(paid.year, paid.month, 1)
    else:
        start = date(paid.year + (paid.month == 12), paid.month % 12 + 1, 1)
    first = date(start.year + (start.month == 12), start.month % 12 + 1, 1)
    return paid, start, first


def start_date(i, _facts=None):
    return start_of(i)[1].isoformat()


def first_payment_date(i, _facts=None):
    return start_of(i)[2].isoformat()


def interim_days(i, _facts=None):
    paid, start, _ = start_of(i)
    return str(abs((paid - start).days))


def interim_interest(i, _facts=None):
    return money(Decimal(i["amount"]) * Decimal(i["rate_percent"]) / HUNDRED * int(i["days"]) / 365)


def half_linked(i, _facts=None):
    """The half-worked table of 3.5: for each index M_k, the payment C × M_k ÷ M_0 and its indexation part."""
    c = Decimal(i["payment"])
    index = [i[f"index_{k}"] for k in range(0, 100) if f"index_{k}" in i]
    base = Decimal(index[0])
    rows = []
    for k, m in enumerate(index[1:], start=1):
        pay = c * Decimal(m) / base
        rows.append({"period": k, "index": m, "payment": money(pay), "extra": money(pay - c)})
    return rows


def dec6(x):
    q = Decimal(x).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP).normalize()
    return format(q, "f")


def monthly_decimal(i, _facts=None):
    return dec6(Decimal(i["rate_percent"]) / TWELVE / HUNDRED)


def growth_base(i, _facts=None):
    return dec6(1 + Decimal(i["rate_percent"]) / TWELVE / HUNDRED)


def power(i, _facts=None):
    r = Decimal(i["rate_percent"]) / TWELVE / HUNDRED
    return dec6((1 + r) ** (-int(i["months"])))


def one_minus_power(i, _facts=None):
    r = Decimal(i["rate_percent"]) / TWELVE / HUNDRED
    return dec6(1 - (1 + r) ** (-int(i["months"])))


def reset_table(i, _facts=None):
    rows = path_from_inputs(i)
    months = int(i["months"])
    out, rates = [], []
    # Recompute the rate path the same way path_from_inputs does, to find the changes.
    changes, n = [], 1
    while f"change_{n}_month" in i:
        changes.append((int(i[f"change_{n}_month"]), Decimal(str(i[f"change_{n}_rate"]))))
        n += 1
    changes.sort(key=lambda c: c[0])
    for t in range(months):
        r = Decimal(str(i["rate"]))
        for month, rate in changes:
            if t + 1 >= month:
                r = rate
        rates.append(r)
    for t in range(1, months):
        if rates[t] != rates[t - 1]:
            out.append({
                "period": len(out) + 1, "month": t + 1, "balance": money(rows[t - 1]["closing"]),
                "left": str(months - t), "rate": plain(rates[t]), "payment": money(rows[t]["payment"]),
            })
    return out


def add_up(i, _facts=None):
    return money(sum((Decimal(str(v)) for k, v in sorted(i.items()) if k.startswith("term_")), Decimal(0)))


def mix_rows(i, _facts=None):
    f, tracks = flow(i)
    out = []
    for k in range(1, 100):
        if f"month_{k}" not in i:
            break
        m = int(i[f"month_{k}"])
        row = {"period": m}
        for n, t in enumerate(tracks, start=1):
            row[f"t{n}"] = money(t["rows"][m - 1]["payment"]) if m <= len(t["rows"]) else "0.00"
        row["total"] = money(f[m - 1])
        out.append(row)
    return out


KINDS = {
    "sch_sum": add_up,
    "sch_mix_rows": mix_rows,
    "sch_monthly_decimal": monthly_decimal,
    "sch_power": power,
    "sch_growth_base": growth_base,
    "sch_one_minus_power": one_minus_power,
    "sch_reset_table": reset_table,
    "sch_half_linked": half_linked,
    "sch_row": row,
    "sch_series": series,
    "sch_total": total,
    "sch_recalc_payment": recalc,
    "sch_months_left": months_left,
    "sch_mix_payment": mix_payment,
    "sch_mix_track_payment": mix_track_payment,
    "sch_mix_first": mix_first,
    "sch_mix_max": mix_max,
    "sch_mix_max_month": mix_max_month,
    "sch_mix_total": mix_total,
    "sch_mix_yearly": mix_yearly,
    "sch_mix_share": mix_share,
    "sch_one_formula": one_formula,
    "sch_start_date": start_date,
    "sch_first_payment_date": first_payment_date,
    "sch_interim_days": interim_days,
    "sch_interim_interest": interim_interest,
}
