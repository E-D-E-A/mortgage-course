"""Independent checks for value today and present value (lessons 0.5, 0.6).

Recomputed with Python's Decimal; nothing here comes from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot, growth


def shown(x, decimals):
    q = Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP)
    return format(q.normalize(), "f")


def exact_value_today(amount, rate_percent, periods):
    return Decimal(amount) / growth(rate_percent) ** int(periods)


def value_today(i, _facts=None):
    return str(agorot(exact_value_today(i["amount"], i["rate_percent"], i["periods"])))


def percent_off_mistake(i, _facts=None):
    r = Decimal(i["rate_percent"]) / 100
    return str(agorot(Decimal(i["amount"]) * (1 - r * int(i["periods"]))))


def value_today_table(i, _facts=None):
    return [
        {
            "period": n,
            "amount": str(agorot(i["amount"])),
            "growth": shown(growth(i["rate_percent"]) ** n, i["decimals"]),
            "value_today": str(agorot(exact_value_today(i["amount"], i["rate_percent"], n))),
        }
        for n in range(1, int(i["periods"]) + 1)
    ]


def stream_value_today(i, _facts=None):
    # Independent route: the closed form for equal end-of-period payments,
    # P × (1 − (1 + r)^−n) ÷ r, or P × n at a rate of zero.
    p, n = Decimal(i["payment"]), int(i["periods"])
    r = Decimal(i["rate_percent"]) / 100
    if r == 0:
        return str(agorot(p * n))
    return str(agorot(p * (1 - (1 + r) ** -n) / r))


def payments_total(i, _facts=None):
    return str(agorot(Decimal(i["payment"]) * int(i["periods"])))


def loan_balance_table(i, _facts=None):
    # Statement convention: each period's interest rounded to the agora, added, then the payment taken off.
    r = Decimal(i["rate_percent"]) / 100
    pay = Decimal(i["payment"])
    balance, rows = Decimal(i["principal"]), []
    for period in range(1, int(i["periods"]) + 1):
        interest = agorot(balance * r)
        closing = balance + interest - pay
        rows.append({
            "period": period,
            "opening": str(agorot(balance)),
            "interest": str(interest),
            "payment": str(agorot(pay)),
            "closing": str(agorot(closing)),
        })
        balance = closing
    return rows


def sum_of_facts(i, facts):
    return str(agorot(sum(Decimal(facts[t]["value"]) for t in str(i["terms"]).split(","))))


KINDS = {
    "value_today": value_today,
    "percent_off_mistake": percent_off_mistake,
    "value_today_table": value_today_table,
    "stream_value_today": stream_value_today,
    "payments_total": payments_total,
    "loan_balance_table": loan_balance_table,
    "sum_of_facts": sum_of_facts,
}
