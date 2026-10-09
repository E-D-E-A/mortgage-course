"""Independent checks for bonds, yields and the yield curve (lessons 0.11, 0.12).

Plain Python Decimal; nothing here is shared with src/lib/calc/bonds.ts.
A bond is a face amount repaid at the end with a fixed payment each year;
its price is the sum of each payment divided by (1 + yield) to the power of its year.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDREDTH = Decimal("0.01")


def pct(x):
    return str(Decimal(x).quantize(HUNDREDTH, rounding=ROUND_HALF_UP))


def g(rate_percent):
    return 1 + Decimal(rate_percent) / 100


def _yields(i):
    """One yield for every year, or a comma-separated curve (one yield per year)."""
    years = int(i["years"]) if "years" in i else len(str(i["curve"]).split(","))
    raw = str(i.get("yields", i.get("yield_percent", i.get("curve"))))
    parts = raw.split(",")
    return years, (parts if len(parts) > 1 else parts * years)


def _rows(i):
    years, ys = _yields(i)
    face = Decimal(i["face"])
    coupon = face * Decimal(i["payment_percent"]) / 100
    rows = []
    for t in range(1, years + 1):
        pay = coupon + (face if t == years else 0)
        rows.append((t, pay, Decimal(ys[t - 1]), pay / g(ys[t - 1]) ** t))
    return rows


def bond_present_value(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) / g(i["rate_percent"]) ** int(i["years"])))


def bond_simple_discount(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) / (1 + Decimal(i["rate_percent"]) / 100 * int(i["years"]))))


def bond_percent_off(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * (1 - Decimal(i["rate_percent"]) / 100)))


def bond_price(i, _facts=None):
    return str(agorot(sum(r[3] for r in _rows(i))))


def bond_curve_price(i, _facts=None):
    return str(agorot(sum(r[3] for r in _rows(i))))


def bond_price_table(i, _facts=None):
    return [{"year": t, "payment": str(agorot(pay)), "rate": pct(rate), "pv": str(agorot(v))} for t, pay, rate, v in _rows(i)]


def bond_table_total(i, _facts=None):
    # Statement convention: each row rounded to the agora, then added.
    return str(agorot(sum(agorot(r[3]) for r in _rows(i))))


def bond_total_payments(i, _facts=None):
    return str(agorot(sum(r[1] for r in _rows({**i, "yields": "0"}))))


def bond_price_series(i, _facts=None):
    out = []
    for y in range(int(i["from_percent"]), int(i["to_percent"]) + 1):
        out.append({"yield": pct(y), "price": bond_price({**i, "yield_percent": str(y)})})
    return out


def bond_single_yield(i, _facts=None):
    ratio = Decimal(i["payment"]) / Decimal(i["price"])
    n = int(i["years"])
    # Independent route for the root: exp(ln(x) / n).
    growth = ratio if n == 1 else (ratio.ln() / n).exp()
    return pct((growth - 1) * 100)


def bond_indexed_amount(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) * g(i["index_change_percent"])))


def bond_deflated_amount(i, _facts=None):
    return str(agorot(Decimal(i["amount"]) / g(i["inflation_percent"])))


def bond_inflation_gap(i, _facts=None):
    return pct((g(i["nominal_percent"]) / g(i["real_percent"]) - 1) * 100)


def _implied(short, ts, long, tl):
    ratio = g(long) ** tl / g(short) ** ts
    return ((ratio.ln() / (tl - ts)).exp() - 1) * 100


def bond_implied_rate(i, _facts=None):
    return pct(_implied(i["short_percent"], int(i["short_years"]), i["long_percent"], int(i["long_years"])))


def bond_round_whole(i, facts):
    return str(Decimal(facts[i["of"]]["value"]).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def bond_curve(i, _facts=None):
    pts = [(int(y), Decimal(v)) for y, v in (p.split(":") for p in i["points"].split(","))]
    pts.sort()
    tol = Decimal("0.05")
    steps = [b[1] - a[1] for a, b in zip(pts, pts[1:])]
    up = any(s > tol for s in steps)
    down = any(s < -tol for s in steps)
    shape = "mixed" if up and down else "rising" if up else "falling" if down else "flat"
    return {
        "points": [{"years": y, "yield": pct(v)} for y, v in pts],
        "segments": [{"from": a[0], "to": b[0], "rate": pct(_implied(a[1], a[0], b[1], b[0]))} for a, b in zip(pts, pts[1:])],
        "shape": shape,
    }


FOUR = Decimal("0.0001")


def dec4(x):
    return str(Decimal(x).quantize(FOUR, rounding=ROUND_HALF_UP))


def bond_single_yield_decimal(i, _facts=None):
    ratio = Decimal(i["payment"]) / Decimal(i["price"])
    n = int(i["years"])
    growth = ratio if n == 1 else (ratio.ln() / n).exp()
    return dec4(growth - 1)


def bond_factor(i, _facts=None):
    return dec4(g(i["rate_percent"]) ** int(i["years"]))


def _ratio(i):
    return g(i["long_percent"]) ** int(i["long_years"]) / g(i["short_percent"]) ** int(i["short_years"])


def bond_factor_ratio(i, _facts=None):
    return dec4(_ratio(i))


def bond_ratio_gain_percent(i, _facts=None):
    return pct((_ratio(i) - 1) * 100)


def bond_implied_factor(i, _facts=None):
    span = int(i["long_years"]) - int(i["short_years"])
    return dec4((_ratio(i).ln() / span).exp())


def bond_implied_decimal(i, _facts=None):
    return dec4(_implied(i["short_percent"], int(i["short_years"]), i["long_percent"], int(i["long_years"])) / 100)


KINDS = {
    "bond_single_yield_decimal": bond_single_yield_decimal,
    "bond_factor": bond_factor,
    "bond_factor_ratio": bond_factor_ratio,
    "bond_ratio_gain_percent": bond_ratio_gain_percent,
    "bond_implied_factor": bond_implied_factor,
    "bond_implied_decimal": bond_implied_decimal,
    "bond_present_value": bond_present_value,
    "bond_simple_discount": bond_simple_discount,
    "bond_percent_off": bond_percent_off,
    "bond_price": bond_price,
    "bond_curve_price": bond_curve_price,
    "bond_price_table": bond_price_table,
    "bond_table_total": bond_table_total,
    "bond_total_payments": bond_total_payments,
    "bond_price_series": bond_price_series,
    "bond_single_yield": bond_single_yield,
    "bond_indexed_amount": bond_indexed_amount,
    "bond_deflated_amount": bond_deflated_amount,
    "bond_inflation_gap": bond_inflation_gap,
    "bond_implied_rate": bond_implied_rate,
    "bond_round_whole": bond_round_whole,
    "bond_curve": bond_curve,
}
