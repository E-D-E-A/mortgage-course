"""Independent checks for a mix against the rules and the yardsticks (lessons 5.9, 5.10).

Plain Python Decimal; nothing is imported from src/lib/calc. A mix is written in
a fact's inputs as "type|amount|rate|months", one track per ";". The first
payment, highest payment and total of a mix are metrics.py's (met_*) kinds; what
is checked here is what src/lib/calc/mixcheck.ts adds: the payment that goes
into the ratio, the part of a mix at a rate that can change, the five lines of
Directive 329 for the whole mix, an effective rate from a contract rate, the
gap between two rates, and the lowest rate each track has across offers.

A track's rate can change during the loan for prime and the variable types; a
linked track with a fixed rate cannot (the index moves the balance, not the
rate) — lesson 4.4's reading of the two-thirds line.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot
from kinds.regulation import check as reg_check

HUNDRED = Decimal(100)
CHANGING = {"prime", "variable_unlinked", "variable_linked"}


def _tracks(text):
    out = []
    for part in str(text).split(";"):
        kind, amount, rate, months = part.split("|")
        out.append({"type": kind, "amount": Decimal(amount), "rate": Decimal(rate), "months": int(months)})
    return out


def _annuity(amount, rate, months):
    m = rate / 1200
    if m == 0:
        return amount / months
    return amount * m / (1 - (1 + m) ** -months)


def _payment(tracks):
    return sum((_annuity(t["amount"], t["rate"], t["months"]) for t in tracks), Decimal(0))


def _plain(x, decimals):
    q = Decimal(1).scaleb(-decimals)
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def loan(i, _facts=None):
    return str(agorot(sum((t["amount"] for t in _tracks(i["tracks"])), Decimal(0))))


def changing(i, _facts=None):
    return str(agorot(sum((t["amount"] for t in _tracks(i["tracks"]) if t["type"] in CHANGING), Decimal(0))))


def ratio_payment(i, _facts=None):
    return str(agorot(_payment(_tracks(i["tracks"])) + Decimal(i.get("added", 0))))


def check(i, _facts=None):
    ts = _tracks(i["tracks"])
    return reg_check(
        {
            "deal": i["deal"],
            "value": i["value"],
            "loan": str(sum((t["amount"] for t in ts), Decimal(0))),
            "payment": str(_payment(ts) + Decimal(i.get("added", 0))),
            "income": i["income"],
            "variable": str(sum((t["amount"] for t in ts if t["type"] in CHANGING), Decimal(0))),
            "term_months": max(t["months"] for t in ts),
        }
    )


def effective(i, _facts=None):
    r = Decimal(i["nominal"]) / 1200
    return _plain(((1 + r) ** 12 - 1) * HUNDRED, int(i["decimals"]))


def monthly(i, _facts=None):
    return _plain(Decimal(i["nominal"]) / 12, int(i["decimals"]))


def points_gap(i, facts):
    return _plain(Decimal(facts[i["a"]]["value"]) - Decimal(facts[i["b"]]["value"]), int(i["decimals"]))


def best_rates(i, _facts=None):
    offers = [o.split(",") for o in str(i["offers"]).split("|")]
    best = []
    for k in range(len(offers[0])):
        column = [o[k] for o in offers]
        best.append(min(column, key=Decimal))
    return ",".join(best)


def argmin(i, facts):
    values = [Decimal(facts[x]["value"]) for x in str(i["facts"]).split("|")]
    return values.index(min(values)) + 1


KINDS = {
    "mix_loan": loan,
    "mix_changing": changing,
    "mix_ratio_payment": ratio_payment,
    "mix_check": check,
    "mix_effective": effective,
    "mix_monthly": monthly,
    "mix_points_gap": points_gap,
    "mix_best_rates": best_rates,
    "mix_argmin": argmin,
}
