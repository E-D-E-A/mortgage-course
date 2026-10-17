"""Independent checks for estimation (lesson 8.18). Fact kinds start with est_.

Plain Python Decimal; nothing is imported from src/. Written from the definitions:

  mean = sum / n; sample sd = sqrt(sum (x - mean)^2 / (n - 1)); se = sd / sqrt(n);
  95% interval = estimate +/- t * se, t from the 95% two-sided table (df 1..10, 15, 20, 30, 60, 120, infinity);
  a df between two listed rows uses the LOWER row.
  Step between two groups: mean(above) - mean(below), se = sqrt(var1/n1 + var2/n2), df = min(n1, n2) - 1.
  Slope: least squares, se = sqrt(SSE / (n - 2) / Sxx), df = n - 2.
  Normal-normal update: precision = 1/sd^2; posterior mean = (pp*m0 + dp*xbar) / (pp + dp), dp = n / s^2,
  posterior sd = sqrt(1 / (pp + dp)); priorWeight = pp / (pp + dp).
Everything at four decimals, half up. Data is a list "v,v,v" or generated offers (seed, n, noise_bp, model).

  est_mean_interval, est_step, est_slope, est_line_vs_step, est_update, est_width
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40

T95 = [(1, "12.706"), (2, "4.303"), (3, "3.182"), (4, "2.776"), (5, "2.571"), (6, "2.447"), (7, "2.365"), (8, "2.306"),
       (9, "2.262"), (10, "2.228"), (15, "2.131"), (20, "2.086"), (30, "2.042"), (60, "2.000"), (120, "1.980")]


def four(x):
    r = Decimal(x).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
    return "0.0000" if r == 0 else format(r, "f")


def t_for(df):
    t = "12.706"
    for d, v in T95:
        if d <= df:
            t = v
    return Decimal(t) if df < 100000 else Decimal("1.960")



def nums(text):
    return [Decimal(x) for x in str(text).split(",")]


def mean(v):
    return sum(v, Decimal(0)) / len(v)


def sd(v):
    m = mean(v)
    return (sum(((x - m) ** 2 for x in v), Decimal(0)) / (len(v) - 1)).sqrt()


def est_mean_interval(i, _f=None):
    v = nums(i["values"])
    n = len(v)
    m, s = mean(v), sd(v)
    se = s / Decimal(n).sqrt()
    t = t_for(n - 1)
    return {"n": n, "mean": four(m), "sd": four(s), "se": four(se), "t": format(t, "f"), "low": four(m - t * se), "high": four(m + t * se)}


def est_step(i, _f=None):
    b, a = nums(i["below"]), nums(i["above"])
    mb, ma = mean(b), mean(a)
    se = (sd(b) ** 2 / len(b) + sd(a) ** 2 / len(a)).sqrt()
    df = min(len(a), len(b)) - 1
    t = t_for(df)
    st = ma - mb
    return {"nBelow": len(b), "nAbove": len(a), "meanBelow": four(mb), "meanAbove": four(ma), "step": four(st), "se": four(se),
            "df": df, "t": format(t, "f"), "low": four(st - t * se), "high": four(st + t * se)}


def line(xs, ys):
    mx, my = mean(xs), mean(ys)
    sxx = sum(((x - mx) ** 2 for x in xs), Decimal(0))
    a = sum(((x - mx) * (y - my) for x, y in zip(xs, ys)), Decimal(0)) / sxx
    return a, my - a * mx, sxx


def est_slope(i, _f=None):
    xs, ys = nums(i["xs"]), nums(i["ys"])
    n = len(xs)
    a, b, sxx = line(xs, ys)
    sse = sum(((y - (a * x + b)) ** 2 for x, y in zip(xs, ys)), Decimal(0))
    se = (sse / (n - 2) / sxx).sqrt()
    t = t_for(n - 2)
    return {"n": n, "slope": four(a), "intercept": four(b), "se": four(se), "t": format(t, "f"), "low": four(a - t * se), "high": four(a + t * se)}


def offers(i):
    from kinds import pricingmodel as pm

    return pm.offers(i)


def est_line_vs_step(i, _f=None):
    data = offers(i)
    xs = [Decimal(o["ltv"]) for o in data]
    ys = [Decimal(o["margin"]) for o in data]
    thr = Decimal(str(i["thr"]))
    a, b, _ = line(xs, ys)
    lm = sum((abs(y - (a * x + b)) for x, y in zip(xs, ys)), Decimal(0)) / len(xs)
    lo = [y for x, y in zip(xs, ys) if x <= thr]
    hi = [y for x, y in zip(xs, ys) if x > thr]
    mlo, mhi = mean(lo), mean(hi)
    sm = sum((abs(y - (mlo if x <= thr else mhi)) for x, y in zip(xs, ys)), Decimal(0)) / len(xs)
    return {"lineMae": four(lm), "stepMae": four(sm)}


def groups(i):
    """Margins of the generated offers below / at-or-above a financing-ratio threshold, within one payment-ratio band."""
    data = offers(i)
    thr = Decimal(str(i["thr"]))
    lo_p, hi_p = Decimal(str(i["pti_from"])), Decimal(str(i["pti_to"]))
    sel = [o for o in data if lo_p <= Decimal(o["pti"]) <= hi_p]
    below = [Decimal(o["margin"]) for o in sel if Decimal(o["ltv"]) <= thr]
    above = [Decimal(o["margin"]) for o in sel if Decimal(o["ltv"]) > thr]
    return below, above


def est_step_data(i, _f=None):
    b, a = groups(i)
    return est_step({"below": ",".join(map(str, b)), "above": ",".join(map(str, a))})


def est_posterior(i, _f=None):
    """The lesson's chain on generated offers: groups at/below and above `thr`, the step and its interval, and the posterior.
    The data enters as ONE observation with spread = the step's standard error (four decimals, as shown)."""
    data = offers(i)
    thr = Decimal(str(i["thr"]))
    below = [o["margin"] for o in data if Decimal(o["ltv"]) <= thr]
    above = [o["margin"] for o in data if Decimal(o["ltv"]) > thr]
    prior = {"prior_mean": i["prior_mean"], "prior_sd": i["prior_sd"]}
    if len(below) < 2 or len(above) < 2:
        return {"nBelow": len(below), "nAbove": len(above), "estimate": None, "posterior": est_update({**prior, "n": 0})}
    est = est_step({"below": ",".join(below), "above": ",".join(above)})
    post = est_update({**prior, "n": 1, "data_mean": est["step"], "data_sd": est["se"]})
    return {"nBelow": len(below), "nAbove": len(above), "estimate": est, "posterior": post}


def est_slope_data(i, _f=None):
    data = offers(i)
    return est_slope({"xs": ",".join(o["ltv"] for o in data), "ys": ",".join(o["margin"] for o in data)})


def est_update(i, _f=None):
    m0, s0 = Decimal(str(i["prior_mean"])), Decimal(str(i["prior_sd"]))
    n = int(i["n"])
    if n == 0:
        return {"n": 0, "priorWeight": "1.0000", "mean": four(m0), "sd": four(s0)}
    xb, s = Decimal(str(i["data_mean"])), Decimal(str(i["data_sd"]))
    pp = 1 / s0 ** 2
    dp = Decimal(n) / s ** 2
    tot = pp + dp
    return {"n": n, "priorWeight": four(pp / tot), "mean": four((pp * m0 + dp * xb) / tot), "sd": four((1 / tot).sqrt())}


def est_width(i, _f=None):
    n = int(i["n"])
    return four(2 * t_for(n - 1) * Decimal(str(i["sd"])) / Decimal(n).sqrt())


KINDS = {
    "est_mean_interval": est_mean_interval, "est_step": est_step, "est_slope": est_slope,
    "est_line_vs_step": est_line_vs_step, "est_step_data": est_step_data, "est_update": est_update, "est_posterior": est_posterior, "est_slope_data": est_slope_data, "est_width": est_width,
}
