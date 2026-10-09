"""Shared helpers for the independent checks. Python's Decimal only — no code from src/lib/calc."""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 50
AGORA = Decimal("0.01")


def agorot(x):
    return Decimal(x).quantize(AGORA, rounding=ROUND_HALF_UP)


def growth(rate_percent):
    return 1 + Decimal(rate_percent) / 100


def difference(i, facts):
    return str(agorot(Decimal(facts[i["minuend"]]["value"]) - Decimal(facts[i["subtrahend"]]["value"])))


# kind -> function(inputs, facts) returning the expected value. None means "not checked" (a given input).
KINDS = {
    "given": None,
    "difference": difference,
}
