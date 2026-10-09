"""Independent checks for annual, monthly and effective rates (lesson 0.4).

Division by 12 and the twelfth root are recomputed with Python's Decimal at the
50-digit context from common.py; nothing here comes from src/lib/calc.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot, growth


def shown(x, decimals):
    """Rounded half away from zero to `decimals`, trailing zeros dropped: 6.1677… → '6.17'."""
    q = Decimal(x).quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP)
    return format(q.normalize(), "f")


def by_division(annual, m):
    return Decimal(annual) / int(m)


def effective(annual, m):
    m = int(m)
    return ((1 + Decimal(annual) / 100 / m) ** m - 1) * 100


def root_factor(effective_percent, m):
    # The m-th root of (1 + R), as a fractional power.
    return growth(effective_percent) ** (Decimal(1) / int(m))


def monthly_rate_by_division(i, _facts=None):
    return shown(by_division(i["annual_percent"], i["periods_per_year"]), i["decimals"])


def effective_annual_rate(i, _facts=None):
    return shown(effective(i["annual_percent"], i["periods_per_year"]), i["decimals"])


def monthly_rate_from_effective(i, _facts=None):
    return shown((root_factor(i["effective_percent"], i["periods_per_year"]) - 1) * 100, i["decimals"])


def monthly_factor_from_effective(i, _facts=None):
    return shown(root_factor(i["effective_percent"], i["periods_per_year"]), i["decimals"])


def growth_factor_rounded(i, _facts=None):
    return shown(growth(i["rate_percent"]) ** int(i["periods"]), i["decimals"])


def annual_rate_by_multiplication(i, _facts=None):
    return shown(Decimal(i["monthly_percent"]) * int(i["periods_per_year"]), 10)


def percent_as_fraction(i, facts):
    return shown(Decimal(facts[i["percent"]]["value"]) / 100, 12)


def monthly_conversion_series(i, _facts=None):
    p = Decimal(i["principal"])
    monthly = 1 + by_division(i["annual_percent"], 12) / 100
    root = root_factor(i["annual_percent"], 12)
    return [
        {"period": n, "by_division": str(agorot(p * monthly ** n)), "by_root": str(agorot(p * root ** n))}
        for n in range(int(i["periods"]) + 1)
    ]


def balance_at_effective_rate(i, _facts=None):
    # Independent route: (1 + R) raised to periods / m directly, not via the monthly rate.
    exponent = Decimal(int(i["periods"])) / int(i["periods_per_year"])
    return str(agorot(Decimal(i["principal"]) * growth(i["effective_percent"]) ** exponent))


def rate_conversion_table(i, _facts=None):
    m = i["periods_per_year"]
    return [
        {
            "period": n,
            "annual": a,
            "monthly": shown(by_division(a, m), 4),
            "effective": shown(effective(a, m), i["decimals"]),
        }
        for n, a in enumerate(str(i["annual_percents"]).split(","), start=1)
    ]


KINDS = {
    "monthly_rate_by_division": monthly_rate_by_division,
    "effective_annual_rate": effective_annual_rate,
    "monthly_rate_from_effective": monthly_rate_from_effective,
    "monthly_factor_from_effective": monthly_factor_from_effective,
    "growth_factor_rounded": growth_factor_rounded,
    "annual_rate_by_multiplication": annual_rate_by_multiplication,
    "percent_as_fraction": percent_as_fraction,
    "monthly_conversion_series": monthly_conversion_series,
    "balance_at_effective_rate": balance_at_effective_rate,
    "rate_conversion_table": rate_conversion_table,
}
