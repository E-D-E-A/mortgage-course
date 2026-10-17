"""Independent checks for drift, splits and agreement (lessons 8.22-8.25). Fact kinds start with dr_.

Plain Python Decimal; nothing is imported from src/. The synthetic series is written again from its
rules (the comment at the top of src/lib/calc/drift.ts states them; this file follows the statement,
not the code):

  generator   s <- (s * 1664525 + 1013904223) mod 2**32 ; u = s // 65536 ; the seed is the first state.
  month t     first draw moves x:  step = (u mod 5 - 2) * 0.05 ; x = min(xmax, max(xmin, x + step))
              second draw is the noise: e = (u mod 11 - 5) * noise_step
              y = intercept + slope * x + creep * t + e, with the "after" regime from month change_at.
  model       the offer is the anchor plus one spread = mean of (y - x) over the training months.
  alarm       the rolling mean of the last `window` absolute errors (months after the training) is
              ABOVE factor * (the model's mean absolute error on its own training months).
  refit       the new spread is the mean of (y - x) over the `retrain_window` months ending at the alarm.

Kinds
  dr_series      one number of the series: field x or y of month t, from the flat spec
  dr_monitor     one number of the 8.24 run (measure: spread1, baseline, threshold, alarm_month, delay,
                 spread2, v1_after, v2_after, v1_healthy); four decimals, months as integers
  dr_split       one number of the 8.23 table (split random|time, model spread|memory, part train|test,
                 measure mae|rmse|bias, k); four decimals
  dr_agreement   agree, total or rate (percent, two decimals) of "advisor:software" pairs
  dr_lag         whole days between two ISO dates
  dr_group       mean_a, mean_b, sd_a, sd_b, diff (a minus b) or n_a, n_b of two lists; four decimals
  dr_errmeasure  mae, rmse or bias of a list of signed errors; four decimals
  dr_total       the sum of a list of whole numbers
  dr_percent     part as a percent of whole, two decimals, trailing zeros kept
"""
from datetime import date
from decimal import ROUND_HALF_UP, Decimal, localcontext

FOUR = Decimal("0.0001")
TWO = Decimal("0.01")


def _ctx():
    return localcontext(prec=50, rounding=ROUND_HALF_UP)


def r4(x):
    return str(Decimal(x).quantize(FOUR, rounding=ROUND_HALF_UP))


def plain(x):
    """Like Decimal.js toFixed(): no exponent, no trailing zeros."""
    s = format(Decimal(x).normalize(), "f")
    return "0" if s in ("-0", "") else s


class Lcg:
    def __init__(self, seed):
        self.s = seed % 2**32

    def next(self):
        self.s = (self.s * 1664525 + 1013904223) % 2**32
        return self.s // 65536


def spec_of(i):
    return {
        "seed": int(i["seed"]),
        "months": int(i["months"]),
        "x0": Decimal(i["x0"]),
        "xmin": Decimal(i["xmin"]),
        "xmax": Decimal(i["xmax"]),
        "change_at": int(i["change_at"]),
        "a1": Decimal(i["a1"]),
        "b1": Decimal(i["b1"]),
        "a2": Decimal(i["a2"]),
        "b2": Decimal(i["b2"]),
        "noise": Decimal(i["noise"]),
        "creep": Decimal(i.get("creep", "0")),
    }


def series(sp):
    rng = Lcg(sp["seed"])
    x = sp["x0"]
    out = []
    for t in range(1, sp["months"] + 1):
        x = min(sp["xmax"], max(sp["xmin"], x + (rng.next() % 5 - 2) * Decimal("0.05")))
        e = (rng.next() % 11 - 5) * sp["noise"]
        a, b = (sp["a2"], sp["b2"]) if t >= sp["change_at"] else (sp["a1"], sp["b1"])
        y = a + b * x + sp["creep"] * t + e
        out.append((t, x, y))
    return out


def mean(values):
    return sum(values, Decimal(0)) / len(values)


def spread_of(points):
    return mean([y - x for (_, x, y) in points])


def dr_series(i, _facts=None):
    with _ctx():
        t = int(i["t"])
        _, x, y = series(spec_of(i))[t - 1]
        return plain(x if i["field"] == "x" else y)


def monitor(i):
    sp = spec_of(i)
    s = series(sp)
    train_to, window, rw = int(i["train_to"]), int(i["window"]), int(i["retrain_window"])
    factor = Decimal(i["factor"])
    train = [p for p in s if p[0] <= train_to]
    s1 = spread_of(train)
    baseline = mean([abs(x + s1 - y) for (_, x, y) in train])
    threshold = baseline * factor
    later = [p for p in s if p[0] > train_to]
    errs = [abs(x + s1 - y) for (_, x, y) in later]
    alarm = None
    for k in range(window - 1, len(errs)):
        if mean(errs[k - window + 1 : k + 1]) > threshold:
            alarm = train_to + 1 + k
            break
    out = {"spread1": s1, "baseline": baseline, "baseline6": baseline, "threshold": threshold, "threshold6": threshold, "alarm_month": alarm}
    healthy = [p for p in later if p[0] < sp["change_at"]]
    out["v1_healthy"] = mean([abs(x + s1 - y) for (_, x, y) in healthy]) if healthy else None
    if alarm is None:
        out.update(delay=None, spread2=None, v1_after=None, v2_after=None)
        return out
    out["delay"] = alarm - sp["change_at"]
    lo = max(1, alarm - rw + 1)
    s2 = spread_of([p for p in s if lo <= p[0] <= alarm])
    out["spread2"] = s2
    after = [p for p in s if p[0] > alarm]
    out["v1_after"] = mean([abs(x + s1 - y) for (_, x, y) in after]) if after else None
    out["v2_after"] = mean([abs(x + s2 - y) for (_, x, y) in after]) if after else None
    return out


def dr_monitor(i, _facts=None):
    with _ctx():
        m = i["measure"]
        v = monitor(i)[m]
        if m in ("alarm_month", "delay"):
            return v
        if m.endswith("6"):
            return str(Decimal(v).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))
        return r4(v)


def shuffled(n, seed):
    rng = Lcg(seed)
    a = list(range(n))
    for k in range(n - 1, 0, -1):
        j = rng.next() % (k + 1)
        a[k], a[j] = a[j], a[k]
    return a


def split_indices(i, n):
    if i["split"] == "random":
        p = shuffled(n, int(i["split_seed"]))
        test = sorted(p[: int(i["test_count"])])
        train = sorted(p[int(i["test_count"]) :])
    else:
        c = int(i["train_count"])
        train, test = list(range(c)), list(range(c, n))
    return train, test


def dr_split(i, _facts=None):
    with _ctx():
        s = series(spec_of(i))
        train_idx, test_idx = split_indices(i, len(s))
        train = [s[k] for k in train_idx]
        part = [s[k] for k in (train_idx if i["part"] == "train" else test_idx)]
        k_near = int(i.get("k", 1))
        if i["model"] == "spread":
            sp = spread_of(train)
            errs = [x + sp - y for (_, x, y) in part]
        else:
            errs = []
            for (t, _, y) in part:
                near = sorted(train, key=lambda p: (abs(p[0] - t), p[0]))[:k_near]
                errs.append(mean([p[2] for p in near]) - y)
        m = i["measure"]
        if m == "mae":
            v = mean([abs(e) for e in errs])
        elif m == "rmse":
            v = mean([e * e for e in errs]).sqrt()
        else:
            v = mean(errs)
        return r4(v)


def dr_agreement(i, _facts=None):
    pairs = [p.split(":") for p in str(i["pairs"]).split("|")]
    agree = sum(1 for a, b in pairs if a == b)
    m = i["measure"]
    if m == "agree":
        return agree
    if m == "total":
        return len(pairs)
    with _ctx():
        return str((Decimal(agree) / len(pairs) * 100).quantize(TWO, rounding=ROUND_HALF_UP)).rstrip("0").rstrip(".")


def dr_lag(i, _facts=None):
    return (date.fromisoformat(i["recorded"]) - date.fromisoformat(i["occurred"])).days


def dr_group(i, _facts=None):
    with _ctx():
        a = [Decimal(v) for v in str(i["a"]).split("|")]
        b = [Decimal(v) for v in str(i["b"]).split("|")]
        ma, mb = mean(a), mean(b)
        sd = lambda vals, m: mean([(v - m) ** 2 for v in vals]).sqrt()  # noqa: E731
        m = i["measure"]
        if m == "sum_a":
            return r4(sum(a, Decimal(0)))
        if m == "n_a":
            return len(a)
        if m == "n_b":
            return len(b)
        return r4({"mean_a": ma, "mean_b": mb, "sd_a": sd(a, ma), "sd_b": sd(b, mb), "diff": ma - mb}[m])


def dr_errmeasure(i, _facts=None):
    with _ctx():
        errs = [Decimal(v) for v in str(i["errors"]).split("|")]
        m = i["measure"]
        if m == "mae":
            return r4(mean([abs(e) for e in errs]))
        if m == "rmse":
            return r4(mean([e * e for e in errs]).sqrt())
        if m == "sumabs":
            return r4(sum((abs(e) for e in errs), Decimal(0)))
        if m == "msq":
            return r4(mean([e * e for e in errs]))
        return r4(mean(errs))


def dr_diff(i, facts):
    with _ctx():
        return r4(Decimal(facts[i["minuend"]]["value"]) - Decimal(facts[i["subtrahend"]]["value"]))


T95 = {1: "12.706", 2: "4.303", 3: "3.182", 4: "2.776", 5: "2.571", 6: "2.447", 7: "2.365", 8: "2.306", 9: "2.262", 10: "2.228"}


def dr_interval(i, _facts=None):
    """above minus below, a 95% interval by lesson 8.18's method: sample standard deviations (n - 1), the unpooled
    standard error, degrees of freedom = the smaller group's size minus one, t from the printed table."""
    with _ctx():
        lo = [Decimal(v) for v in str(i["below"]).split("|")]
        hi = [Decimal(v) for v in str(i["above"]).split("|")]
        ml, mh = mean(lo), mean(hi)
        var = lambda xs, m: sum(((x - m) ** 2 for x in xs), Decimal(0)) / (len(xs) - 1)  # noqa: E731
        se = (var(lo, ml) / len(lo) + var(hi, mh) / len(hi)).sqrt()
        df = min(len(lo), len(hi)) - 1
        t = Decimal(T95[df])
        step = mh - ml
        m = i["measure"]
        if m == "df":
            return df
        if m == "t":
            return str(t)
        return r4({"step": step, "se": se, "low": step - se * t, "high": step + se * t}[m])


def dr_total(i, _facts=None):
    return sum(int(v) for v in str(i["values"]).split("|"))


def dr_percent(i, _facts=None):
    with _ctx():
        return str((Decimal(i["part"]) / Decimal(i["whole"]) * 100).quantize(TWO, rounding=ROUND_HALF_UP))


KINDS = {
    "dr_series": dr_series,
    "dr_monitor": dr_monitor,
    "dr_split": dr_split,
    "dr_agreement": dr_agreement,
    "dr_lag": dr_lag,
    "dr_group": dr_group,
    "dr_total": dr_total,
    "dr_interval": dr_interval,
    "dr_diff": dr_diff,
    "dr_errmeasure": dr_errmeasure,
    "dr_percent": dr_percent,
}
