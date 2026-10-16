"""Independent checks for amortization: the level payment, balances, and tracks whose
rate or index moves (lessons 2.5–2.7, and 2.9 onward).

Plain Python Decimal; nothing is imported from src/lib/calc. Where the TypeScript
module keeps last month's payment and indexes it, this file recalculates the level
payment from the balance every month — the same number by another route.

Conventions: a contract's annual rate ÷ 12 is the monthly rate; payments at the end
of each month; on a rate change the payment is recalculated on the balance left over
the months left; a linked balance is indexed each month, before the payment.
"""
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

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


def update_points_until(i, _facts=None):
    # The update points already passed by month `now`.
    now = int(i["now"])
    return [k for k in update_points(i) if k <= now]


def update_points_after(i, _facts=None):
    # The update points still ahead after month `now`.
    now = int(i["now"])
    return [k for k in update_points(i) if k > now]


def updates_left(i, _facts=None):
    return str(len(update_points_after(i)))


def updates_left_with_end(i, _facts=None):
    # The mistake: counting the last day of the loan as an update too.
    return str(len(update_points_after(i)) + 1)


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
    "amort_update_points_until": update_points_until,
    "amort_update_points_after": update_points_after,
    "amort_updates_left": updates_left,
    "amort_updates_left_with_end": updates_left_with_end,
    "amort_prime_table": prime_table,
    "amort_anchor_table": anchor_table,
    "amort_linked_payment_table": linked_payment_table,
}


# ── Stage 3 (lessons 3.1–3.4): sums of discount factors, trials, balances. ──
# Each one by the long road: factors summed one by one, balances discounted payment by
# payment, where the TypeScript uses the short formulas.

def fixed(x, decimals):
    """Exactly `decimals` places, half up: "0.99009901"."""
    return format(Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP), "f")


def monthly(rate_percent):
    return Decimal(rate_percent) / TWELVE / HUNDRED


def factor_sum(rate_percent, months):
    m = monthly(rate_percent)
    return sum((1 / (1 + m) ** k for k in range(1, int(months) + 1)), Decimal(0))


def discount_factor(i, _facts=None):
    return fixed(1 / (1 + monthly(i["rate_percent"])) ** int(i["month"]), i["decimals"])


def discount_sum(i, _facts=None):
    return fixed(factor_sum(i["rate_percent"], i["months"]), i["decimals"])


def payments_value_today(i, _facts=None):
    return str(agorot(Decimal(i["payment"]) * factor_sum(i["rate_percent"], i["months"])))


def largest_loan_for_payment(i, _facts=None):
    """The largest loan a payment suffices for: the value today of the payments, cut down to the
    agora (a maximum is never rounded up, lesson 4.4)."""
    exact = Decimal(i["payment"]) * factor_sum(i["rate_percent"], i["months"])
    return str(exact.quantize(Decimal("0.01"), rounding=ROUND_DOWN))


def remaining_balance(i, _facts=None):
    n, k = int(i["months"]), int(i["paid"])
    c = level_payment(i["principal"], i["rate_percent"], n)
    return str(agorot(c * factor_sum(i["rate_percent"], n - k))) if k < n else "0.00"


def statement_balance(i, _facts=None):
    k = int(i["paid"])
    if k == 0:
        return str(agorot(i["principal"]))
    return statement(i, "annuity")[k - 1]["closing"]


def trial_rows(i):
    b, pay = agorot(i["principal"]), agorot(str(i["payment"]))
    rate = Decimal(i["rate_percent"])
    rows = []
    for k in range(1, int(i["months"]) + 1):
        interest = agorot(b * rate / TWELVE / HUNDRED) if b > 0 else agorot(0)  # an overpaid balance earns nothing
        closing = b + interest - pay
        rows.append({"period": k, "opening": str(b), "interest": str(interest), "payment": str(pay), "closing": str(closing)})
        b = closing
    return rows


def trial_table(i, _facts=None):
    return trial_rows(i)


def trial_last(i, _facts=None):
    return trial_rows(i)[-1]["closing"]


def principal_overtakes(i, _facts=None):
    for r in statement(i, "annuity"):
        if Decimal(r["principal_paid"]) > Decimal(r["interest"]):
            return r["period"]
    return None


def formula_steps(i, _facts=None):
    """The level payment's formula one step at a time; each step shown to `decimals` places."""
    d = i["decimals"]
    m = monthly(i["rate_percent"])
    growth = (1 + m) ** int(i["months"])
    one_minus = 1 - 1 / growth
    top = Decimal(i["principal"]) * m
    return {
        "m": fixed(m, d),
        "growth": fixed(growth, d),
        "discount": fixed(1 / growth, d),
        "one_minus": fixed(one_minus, d),
        "top": str(agorot(top)),
        "payment": str(agorot(top / one_minus)),
    }


def month_below(i, _facts=None):
    for r in statement(i, "annuity"):
        if Decimal(r["closing"]) < Decimal(str(i["threshold"])):
            return r["period"]
    return None


def months_left(i, _facts=None):
    return int(i["months"]) - int(i["paid"])


KINDS.update({
    "amort_months_left": months_left,
    "amort_month_below": month_below,
    "amort_discount_factor": discount_factor,
    "amort_discount_sum": discount_sum,
    "amort_payments_value_today": payments_value_today,
    "amort_largest_loan_for_payment": largest_loan_for_payment,
    "amort_remaining_balance": remaining_balance,
    "amort_statement_balance": statement_balance,
    "amort_trial_table": trial_table,
    "amort_trial_last": trial_last,
    "amort_principal_overtakes": principal_overtakes,
    "amort_formula_steps": formula_steps,
})


# ── Stage 3 fix round (2026-10-10): the helpers behind numbers the pages print. ──

def growth_base(i, _facts=None):
    """1 + the rate per period, as a decimal, without trailing zeros: "1.004"."""
    b = 1 + Decimal(i["rate_percent"]) / HUNDRED / int(i["periods_per_year"])
    s = format(b.normalize(), "f")
    return s


def interpolation_step(i, _facts=None):
    """(high − low) × what low leaves ÷ (what low leaves + what high overpays), to the agora."""
    base = {"principal": i["principal"], "rate_percent": i["rate_percent"], "months": i["months"]}
    left = Decimal(trial_rows({**base, "payment": i["low"]})[-1]["closing"])
    over = -Decimal(trial_rows({**base, "payment": i["high"]})[-1]["closing"])
    return str(agorot((Decimal(str(i["high"])) - Decimal(str(i["low"]))) * left / (left + over)))


def flat_interest_trial(i, _facts=None):
    """The slip: each month's interest on the whole loan. Month by month, not by the closed form."""
    p = agorot(i["principal"])
    interest = agorot(p * Decimal(i["rate_percent"]) / TWELVE / HUNDRED)
    b = p
    for _ in range(int(i["months"])):
        b = b + interest - Decimal(str(i["payment"]))
    return str(agorot(b))


def shown_sum(i, _facts=None):
    """S the calculator way: 1 − (1 + m)^−n kept to `decimals`, divided by m, kept to `decimals`."""
    d = int(i["decimals"])
    m = monthly(i["rate_percent"])
    one_minus = Decimal(fixed(1 - 1 / (1 + m) ** int(i["months"]), d))
    return fixed(one_minus / m, d)


def half_interest_rate(i, _facts=None):
    """The annual rate whose first-month interest is half the level payment, found by halving search."""
    n = int(i["months"])
    lo, hi = Decimal(0), Decimal(100)
    for _ in range(200):
        mid = (lo + hi) / 2
        m = mid / TWELVE / HUNDRED
        share = 1 - 1 / (1 + m) ** n  # interest ÷ payment in month 1
        lo, hi = (mid, hi) if share < Decimal("0.5") else (lo, mid)
    return plain(lo)


KINDS.update({
    "amort_growth_base": growth_base,
    "amort_interpolation_step": interpolation_step,
    "amort_flat_interest_trial": flat_interest_trial,
    "amort_shown_sum": shown_sum,
    "amort_half_interest_rate": half_interest_rate,
})
