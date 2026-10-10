"""Independent checks for workshop 3.12: a level-payment schedule by hand and in a spreadsheet.

Plain Python Decimal; nothing is imported from src/lib/calc. The schedule is the
statement convention (the course's calculator): the level payment rounded to the agora
once, each month's interest rounded to the agora, the last payment closing the balance.

ws_hand_mistake  the number a learner writes in one month under one named mistake
ws_sheet         what a spreadsheet shows under one of four rounding conventions
ws_statement_cell, ws_interest_between, ws_naive_balance  readings of the schedule
"""
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def exact(x):
    """An exact decimal written plainly, no exponent and no trailing zeros: "55.136", "60"."""
    d = Decimal(x)
    if d == d.to_integral_value():
        return format(d.quantize(Decimal(1)), "f")
    return format(d.normalize(), "f")


def level(principal, rate, months):
    m = Decimal(rate) / TWELVE / HUNDRED
    p = Decimal(principal)
    if m == 0:
        return p / months
    # (1 + m)^-n by repeated division, not a power function
    factor = Decimal(1)
    for _ in range(months):
        factor /= 1 + m
    return p * m / (1 - factor)


def interest_of(balance, rate):
    return Decimal(balance) * Decimal(rate) / TWELVE / HUNDRED


def statement_rows(principal, rate, months):
    """Each row: (opening, payment, interest, principal_paid, closing)."""
    pay = agorot(level(principal, rate, months))
    b = agorot(principal)
    rows = []
    for k in range(1, months + 1):
        i = agorot(interest_of(b, rate))
        part = b if k == months else pay - i
        rows.append((b, part + i, i, part, b - part))
        b -= part
    return rows


FIELDS = {"opening": 0, "payment": 1, "interest": 2, "principal_paid": 3, "closing": 4}


def hand_mistake(i, _facts=None):
    p, rate, n, k = i["principal"], Decimal(str(i["rate_percent"])), int(i["months"]), int(i["period"])
    field, mistake = i["field"], i["mistake"]
    rows = statement_rows(p, rate, n)
    opening, payment = rows[k - 1][0], rows[k - 1][1]
    if field == "opening":
        return exact(agorot(p) if mistake == "loan_again" else rows[k - 2][0])

    def wrong_interest():
        if mistake == "interest_on_original":
            return agorot(interest_of(p, rate))
        if mistake == "annual_rate":
            return agorot(opening * rate / HUNDRED)
        if mistake == "unrounded":
            return interest_of(opening, rate)
        if mistake == "truncated":
            return interest_of(opening, rate).quantize(Decimal("0.01"), rounding=ROUND_DOWN)
        raise ValueError(mistake)

    if field == "interest":
        return exact(wrong_interest())
    if mistake == "whole_payment":
        part = payment
    elif mistake == "equal_part":
        part = agorot(Decimal(p) / n)
    else:
        part = payment - wrong_interest()
    return exact(part if field == "principal" else opening - part)


def sheet(i, _facts=None):
    p, rate, n = Decimal(i["principal"]), Decimal(str(i["rate_percent"])), int(i["months"])
    convention, field = i["convention"], i["field"]
    if convention == "statement":
        rows = statement_rows(p, rate, n)
        figures = {
            "regular": rows[0][1],
            "last": rows[-1][1],
            "total_paid": sum(r[1] for r in rows),
            "total_interest": sum(r[2] for r in rows),
            "final_closing": rows[-1][4],
        }
    elif convention == "exact":
        c = level(p, rate, n)
        figures = {"regular": c, "last": c, "total_paid": c * n, "total_interest": c * n - p, "final_closing": Decimal(0)}
    else:
        c = level(p, rate, n)
        pay = c if convention == "payment_unrounded" else agorot(c)
        b, paid, interest, last = agorot(p), Decimal(0), Decimal(0), pay
        for k in range(1, n + 1):
            i_k = agorot(interest_of(b, rate))
            this = b + i_k if (k == n and convention == "payment_unrounded") else pay
            paid += this
            interest += i_k
            b -= this - i_k
            last = this
        figures = {"regular": pay, "last": last, "total_paid": paid, "total_interest": interest, "final_closing": b}
    return str(agorot(figures[field]))


def statement_cell(i, _facts=None):
    rows = statement_rows(i["principal"], Decimal(str(i["rate_percent"])), int(i["months"]))
    return str(rows[int(i["period"]) - 1][FIELDS[i["field"]]])


def interest_between(i, _facts=None):
    rows = statement_rows(i["principal"], Decimal(str(i["rate_percent"])), int(i["months"]))
    return str(sum(r[2] for r in rows[int(i["from"]) - 1 : int(i["to"])]))


def payment_annual_as_monthly(i, _facts=None):
    """The mistake of using the annual rate as the monthly one."""
    return str(agorot(level(i["principal"], Decimal(str(i["rate_percent"])) * TWELVE, int(i["months"]))))


def naive_balance(i, _facts=None):
    pay = agorot(level(i["principal"], Decimal(str(i["rate_percent"])), int(i["months"])))
    return str(agorot(i["principal"]) - pay * int(i["paid"]))


KINDS = {
    "ws_hand_mistake": hand_mistake,
    "ws_sheet": sheet,
    "ws_statement_cell": statement_cell,
    "ws_interest_between": interest_between,
    "ws_naive_balance": naive_balance,
    "ws_payment_annual_as_monthly": payment_annual_as_monthly,
}
