"""Independent checks for calibration (lesson 8.19). Fact kinds start with cal_.

Plain Python Decimal; nothing is imported from src/. A data set is encoded "p:o,p:o,..." (a predicted
probability and the outcome 0 or 1), or it is made by the seeded generator (see the end of this file).
Bins are [lo, hi) except the last, which includes the top edge. Rates are shown at four decimals, half
up; an empty bin has none.

  cal_logistic   1 / (1 + e^-z), six decimals
  cal_table      the reliability table: per bin n, happened, predicted, observed, gap
  cal_brier      the mean of (p - outcome)^2
  cal_gap        sum(n * |observed - predicted|) / sum(n), from unrounded values
  cal_apply      a prediction replaced by the observed rate of its bin when the bin has >= min_per_bin cases
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40


def four(x):
    r = Decimal(x).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
    return "0.0000" if r == 0 else format(r, "f")


def parse(text):
    return [(Decimal(p), int(o)) for p, o in (pair.split(":") for pair in str(text).split(","))]


def edges_of(i):
    if "edges" in i:
        return [Decimal(e) for e in str(i["edges"]).split(",")]
    n = int(i["bins"])
    return [Decimal(k) / Decimal(n) for k in range(n + 1)]


def edge_text(e):
    return format(e.normalize(), "f") if e != 0 else "0"


def bins(data, edges):
    rows = []
    for k in range(len(edges) - 1):
        lo, hi = edges[k], edges[k + 1]
        last = k + 2 == len(edges)
        inside = [(p, o) for p, o in data if p >= lo and (p <= hi if last else p < hi)]
        n = len(inside)
        happened = sum(o for _, o in inside)
        predicted = sum((p for p, _ in inside), Decimal(0)) / n if n else None
        observed = Decimal(happened) / n if n else None
        rows.append({"lo": edge_text(lo), "hi": edge_text(hi), "n": n, "happened": happened, "predicted": predicted, "observed": observed})
    return rows


def _data(i):
    return seeded_data(i) if "seed" in i else parse(i["data"])


def cal_logistic(i, _facts=None):
    z = Decimal(str(i["z"]))
    v = 1 / (1 + (-z).exp())
    return format(v.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP), "f")


def cal_table(i, _facts=None):
    out = []
    for r in bins(_data(i), edges_of(i)):
        p, o = r["predicted"], r["observed"]
        out.append({
            "lo": r["lo"], "hi": r["hi"], "n": r["n"], "happened": r["happened"],
            "predicted": None if p is None else four(p),
            "observed": None if o is None else four(o),
            "gap": None if p is None else four(o - p),
        })
    return out


def cal_brier(i, _facts=None):
    d = _data(i)
    return four(sum(((p - o) ** 2 for p, o in d), Decimal(0)) / len(d))


def cal_gap(i, _facts=None):
    used = [r for r in bins(_data(i), edges_of(i)) if r["n"] > 0]
    total = sum(r["n"] for r in used)
    return four(sum((abs(r["observed"] - r["predicted"]) * r["n"] for r in used), Decimal(0)) / total)


def cal_apply(i, _facts=None):
    """The calibrated value of one prediction, from the bins of the data set."""
    edges = edges_of(i)
    rows = bins(_data(i), edges)
    p = Decimal(str(i["p"]))
    for k, r in enumerate(rows):
        last = k + 1 == len(rows)
        if p >= edges[k] and (p <= edges[k + 1] if last else p < edges[k + 1]):
            if r["n"] >= int(i["min_per_bin"]):
                return four(r["observed"])
            return four(p)
    raise ValueError("outside 0..1")


def seeded_data(i):
    raise NotImplementedError("filled in with the generator")


KINDS = {
    "cal_logistic": cal_logistic,
    "cal_table": cal_table,
    "cal_brier": cal_brier,
    "cal_gap": cal_gap,
    "cal_apply": cal_apply,
}
