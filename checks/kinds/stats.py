"""Independent checks for lessons 8.1–8.5: sums and means, weighted mean, histogram bins, spread, percentiles,
the expectation of a discrete distribution, and the least-squares line (src/lib/calc/stats.ts).

Plain Python Decimal, nothing imported from src/. Lists travel in a fact's inputs as text: values "28,30,31"; weights
the same; points "x:y;x:y"; outcomes "value:count;value:count". A rounded result is written the way the course writes
it (rounded half up, trailing zeros removed), like the other checks' `_plain`.

Methods, stated once (the TypeScript header says the same):
  - variance: population (÷ n) unless the input says sample=1 (÷ n − 1);
  - percentile: linear interpolation between closest ranks, position 1 + (n − 1)·p/100 (PERCENTILE.INC), or, when the input
    says method=nearest, the value at rank ceil(p/100·n), at least 1;
  - histogram: bin k is [start + k·width, start + (k+1)·width); the last bin also takes its upper edge; outside values are not
    in any bin (two more kinds count them);
  - least squares: slope = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)², intercept = ȳ − slope·x̄.
"""
from decimal import ROUND_CEILING, ROUND_FLOOR, ROUND_HALF_UP, Decimal, getcontext

from kinds.common import agorot

getcontext().prec = 60
HUNDRED = Decimal(100)


def _plain(x, decimals):
    q = Decimal(1).scaleb(-int(decimals))
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _list(text):
    return [Decimal(p) for p in str(text).split(",") if p != ""]


def _points(text):
    return [tuple(Decimal(v) for v in p.split(":")) for p in str(text).split(";")]


def _outcomes(text):
    return [(Decimal(p.split(":")[0]), int(p.split(":")[1])) for p in str(text).split(";")]


def _mean(xs):
    return sum(xs, Decimal(0)) / len(xs)


def _sqdev(xs):
    m = _mean(xs)
    return sum(((x - m) ** 2 for x in xs), Decimal(0))


def _line(pts):
    mx = _mean([p[0] for p in pts])
    my = _mean([p[1] for p in pts])
    sxy = sum(((p[0] - mx) * (p[1] - my) for p in pts), Decimal(0))
    sxx = sum(((p[0] - mx) ** 2 for p in pts), Decimal(0))
    a = sxy / sxx
    return a, my - a * mx


def total(i, _f=None):
    return _plain(sum(_list(i["values"]), Decimal(0)), i["decimals"])


def mean(i, _f=None):
    return _plain(_mean(_list(i["values"])), i["decimals"])


def wmean(i, _f=None):
    xs, ws = _list(i["values"]), _list(i["weights"])
    return _plain(sum((x * w for x, w in zip(xs, ws)), Decimal(0)) / sum(ws, Decimal(0)), i["decimals"])


def _var(i):
    xs = _list(i["values"])
    return _sqdev(xs) / (len(xs) - (1 if int(i.get("sample", 0)) else 0))


def variance(i, _f=None):
    return _plain(_var(i), i["decimals"])


def std(i, _f=None):
    return _plain(_var(i).sqrt(), i["decimals"])


def percentile(i, _f=None):
    xs = sorted(_list(i["values"]))
    p = Decimal(i["p"])
    n = len(xs)
    if i.get("method", "linear") == "nearest":
        rank = max(1, int((Decimal(n) * p / HUNDRED).to_integral_value(rounding=ROUND_CEILING)))
        return _plain(xs[rank - 1], i["decimals"])
    pos = 1 + Decimal(n - 1) * p / HUNDRED
    k = int(pos.to_integral_value(rounding=ROUND_FLOOR))
    frac = pos - k
    if frac == 0 or k >= n:
        return _plain(xs[k - 1], i["decimals"])
    return _plain(xs[k - 1] + frac * (xs[k] - xs[k - 1]), i["decimals"])


def position(i, _f=None):
    return _plain(1 + (Decimal(i["n"]) - 1) * Decimal(i["p"]) / HUNDRED, 6)


def _bins(i):
    xs = _list(i["values"])
    start, width, count = Decimal(i["start"]), Decimal(i["width"]), int(i["count"])
    counts = [0] * count
    below = above = 0
    for x in xs:
        if x < start:
            below += 1
        elif x > start + width * count:
            above += 1
        else:
            k = int(((x - start) / width).to_integral_value(rounding=ROUND_FLOOR))
            counts[min(k, count - 1)] += 1
    return counts, below, above


def hist(i, _f=None):
    return ",".join(str(c) for c in _bins(i)[0])


def hist_outside(i, _f=None):
    _, below, above = _bins(i)
    return below + above


def count_in(i, _f=None):
    """How many of the values fall from `from` to `to`, both ends included."""
    lo, hi = Decimal(i["from"]), Decimal(i["to"])
    return sum(1 for x in _list(i["values"]) if lo <= x <= hi)


def _expect(os):
    return sum((v * c for v, c in os), Decimal(0)) / sum(c for _, c in os)


def expect(i, _f=None):
    return _plain(_expect(_outcomes(i["outcomes"])), i["decimals"])


def _dvar(os):
    e = _expect(os)
    return sum(((v - e) ** 2 * c for v, c in os), Decimal(0)) / sum(c for _, c in os)


def dist_var(i, _f=None):
    return _plain(_dvar(_outcomes(i["outcomes"])), i["decimals"])


def dist_std(i, _f=None):
    return _plain(_dvar(_outcomes(i["outcomes"])).sqrt(), i["decimals"])


def prob(i, _f=None):
    """The probability, in percent, that the value is from `from` to `to`, both ends included."""
    os = _outcomes(i["outcomes"])
    lo, hi = Decimal(i["from"]), Decimal(i["to"])
    hit = sum(c for v, c in os if lo <= v <= hi)
    return _plain(Decimal(hit) * HUNDRED / sum(c for _, c in os), i["decimals"])


def fit(i, _f=None):
    a, b = _line(_points(i["points"]))
    return _plain(a if i["part"] == "a" else b, i["decimals"])


def _errs(i):
    pts = _points(i["points"])
    a, b = Decimal(i["a"]), Decimal(i["b"])
    return [y - (a * x + b) for x, y in pts]


def err(i, _f=None):
    e = _errs(i)
    measure = i["measure"]
    if measure == "mae":
        v = sum((abs(x) for x in e), Decimal(0)) / len(e)
    elif measure == "rmse":
        v = (sum((x * x for x in e), Decimal(0)) / len(e)).sqrt()
    else:
        v = sum((x * x for x in e), Decimal(0))
    return _plain(v, i["decimals"])


def resid(i, _f=None):
    return ",".join(_plain(x, i["decimals"]) for x in _errs(i))


def fit_err(i, _f=None):
    """The errors of the fitted line itself (the line is computed here, from the points)."""
    pts = _points(i["points"])
    a, b = _line(pts)
    return err({**i, "a": str(a), "b": str(b)})


def lin(i, _f=None):
    return _plain(Decimal(i["a"]) * Decimal(i["x"]) + Decimal(i["b"]), i["decimals"])


def quot(i, _f=None):
    return _plain(Decimal(i["num"]) / Decimal(i["den"]), i["decimals"])


def prod(i, _f=None):
    return _plain(Decimal(i["a"]) * Decimal(i["b"]), i["decimals"])


def payment(i, _f=None):
    """A Spitzer payment: amount, nominal annual rate in percent, months; to the agora."""
    amount, months = Decimal(i["amount"]), int(i["months"])
    m = Decimal(i["rate"]) / 1200
    pay = amount / months if m == 0 else amount * m / (1 - (1 + m) ** -months)
    return str(agorot(pay))


def fact_expect(i, facts):
    """The expectation of values that are other facts' money values; counts are listed in the inputs."""
    vs = [Decimal(facts[x]["value"]) for x in str(i["facts"]).split("|")]
    cs = [int(c) for c in str(i["counts"]).split(",")]
    return str(agorot(sum((v * c for v, c in zip(vs, cs)), Decimal(0)) / sum(cs)))


def fact_prob_share(i, facts):
    """Count of the listed facts whose value is above a threshold fact, as a percent of all of them (equal counts)."""
    vs = [Decimal(facts[x]["value"]) for x in str(i["facts"]).split("|")]
    cs = [int(c) for c in str(i["counts"]).split(",")]
    limit = Decimal(facts[i["limit"]]["value"])
    hit = sum(c for v, c in zip(vs, cs) if v > limit)
    return _plain(Decimal(hit) * HUNDRED / sum(cs), i["decimals"])


KINDS = {
    "stats_sum": total,
    "stats_mean": mean,
    "stats_wmean": wmean,
    "stats_variance": variance,
    "stats_std": std,
    "stats_percentile": percentile,
    "stats_position": position,
    "stats_hist": hist,
    "stats_outside": hist_outside,
    "stats_count_in": count_in,
    "stats_expect": expect,
    "stats_dist_var": dist_var,
    "stats_dist_std": dist_std,
    "stats_prob": prob,
    "stats_fit": fit,
    "stats_err": err,
    "stats_fit_err": fit_err,
    "stats_resid": resid,
    "stats_lin": lin,
    "stats_quot": quot,
    "stats_prod": prod,
    "stats_payment": payment,
    "stats_fact_expect": fact_expect,
    "stats_fact_prob_above": fact_prob_share,
}


def _choose(n, k):
    from math import comb
    return comb(n, k)


def shapes(i, _f=None):
    """How many mixes: shares in steps of `step` percent adding to 100, a kind may be left out, a term per used track."""
    kinds, step, terms = int(i["kinds"]), int(i["step"]), int(i["terms"])
    units = 100 // step
    return sum(_choose(kinds, k) * _choose(units - 1, k - 1) * terms ** k for k in range(1, min(kinds, units) + 1))


def product_of(i, _f=None):
    out = 1
    for x in str(i["factors"]).split(","):
        out *= int(x)
    return out


KINDS["stats_shapes"] = shapes
KINDS["stats_count_product"] = product_of


def percent_of_whole(i, _f=None):
    """part ÷ whole × 100, in percent."""
    return _plain(Decimal(i["part"]) * HUNDRED / Decimal(i["whole"]), i["decimals"])


def fact_percent(i, facts):
    """Like percent_of_whole, but part and whole are other facts' values."""
    return _plain(Decimal(facts[i["part"]]["value"]) * HUNDRED / Decimal(facts[i["whole"]]["value"]), i["decimals"])


KINDS["stats_percent"] = percent_of_whole
KINDS["stats_fact_percent"] = fact_percent
