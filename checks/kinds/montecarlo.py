"""Independent checks for Monte Carlo (src/lib/calc/montecarlo.ts, lessons 8.11-8.12). Fact kinds: mc_rng, mc_run.

Plain Python; nothing imported from src/. The generator is mulberry32 written again here with 32-bit masks
(the TypeScript uses Math.imul and >>> 0); a seed must give the same numbers in both. A uniform draw is x / 2^32;
a discrete draw takes the first outcome whose cumulative weight satisfies x * total < cum * 2^32 (integers only).

Futures: for each of n futures, for each year y = 1..years, one draw for prime's step (a "value:weight,..." list) and one
for the year's inflation; from year 2 prime's cumulative shift moves by step * scale, never below min_shift; the anchors of
variable tracks use the same cumulative shifts. Each future's cash flow comes from kinds/schedule.py (statement rounding).

mc_rng: the first `count` outputs of mulberry32(seed).
mc_run: simulates the flat mix t{k}_* and answers `measure` about the highest payment of each future:
  count_at_least (threshold) | p_at_least (threshold; count / n to 4 decimals) | p_pct (the same in percent, 1 decimal) | se_pct (the error in percentage points, 1 decimal) | se (sqrt(p(1-p)/n), 6 decimals)
  mean_max | p5_max | p50_max | p95_max (linear percentile, PERCENTILE.INC) | min_max | max_max | mean_total
  first (the first payment of the first future) | list_max (every future's highest payment, in order; for small n)
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

from kinds import schedule
from kinds.common import agorot

getcontext().prec = 50
M = 0xFFFFFFFF
TWO32 = 4294967296


def rng(seed):
    a = seed & M
    while True:
        a = (a + 0x6D2B79F5) & M
        t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & M
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & M)) & M
        yield (t ^ (t >> 14)) & M


def _weights(text):
    return [(v, int(w)) for v, w in (p.split(":") for p in str(text).split(","))]


def draw(outcomes, x):
    total = sum(w for _, w in outcomes)
    cum = 0
    for v, w in outcomes:
        cum += w
        if x * total < cum * TWO32:
            return v
    return outcomes[-1][0]


def futures(i):
    g = rng(int(i["seed"]))
    steps, infl = _weights(i["prime_steps"]), _weights(i["inflation"])
    years, scale, floor = int(i["years"]), Decimal(str(i["scale"])), Decimal(str(i["min_shift"]))
    for _ in range(int(i["n"])):
        shifts, inflation, cum = [], [], Decimal(0)
        for y in range(1, years + 1):
            step = Decimal(draw(steps, next(g))) * scale
            inf = draw(infl, next(g))
            if y > 1:
                cum += step
                if cum < floor:
                    cum = floor
            shifts.append(cum)
            inflation.append(inf)
        yield shifts, inflation


def _mix(i):
    j = {k: v for k, v in i.items() if k == "tracks" or (k.startswith("t") and k[1:2].isdigit())}
    j["block_months"] = 12
    j["rounding"] = "statement"
    return j


def run(i):
    base = _mix(i)
    maxes, totals, firsts = [], [], []
    for shifts, inflation in futures(i):
        j = dict(base)
        for y, (s, f) in enumerate(zip(shifts, inflation), start=1):
            j[f"prime_shift_{y}"] = str(s)
            j[f"anchor_shift_{y}"] = str(s)
            j[f"inflation_{y}"] = str(f)
        payments, _ = schedule.flow(j)
        cents = [agorot(p) for p in payments]
        maxes.append(max(cents))
        firsts.append(cents[0])
        totals.append(agorot(sum(payments, Decimal(0))))
    return maxes, totals, firsts


def percentile(values, p):
    s = sorted(values)
    pos = 1 + (len(s) - 1) * Decimal(p) / 100
    k = int(pos)
    if pos == k:
        return s[k - 1]
    return s[k - 1] + (pos - k) * (s[k] - s[k - 1])


def q(x, places):
    return str(Decimal(x).quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP))


def mc_rng(i, _facts=None):
    g = rng(int(i["seed"]))
    return [next(g) for _ in range(int(i["count"]))]


def mc_run(i, _facts=None):
    maxes, totals, firsts = run(i)
    n = len(maxes)
    m = i["measure"]
    if m in ("count_at_least", "p_at_least", "se", "p_pct", "se_pct"):
        count = sum(1 for v in maxes if v >= Decimal(str(i["threshold"])))
        p = Decimal(count) / n
        if m == "count_at_least":
            return count
        if m == "p_at_least":
            return q(p, 4)
        if m == "p_pct":
            return q(p * 100, 1)
        if m == "se_pct":
            return q((p * (1 - p) / n).sqrt() * 100, 1)
        return q((p * (1 - p) / n).sqrt(), 6)
    if m == "mean_max":
        return q(sum(maxes, Decimal(0)) / n, 2)
    if m == "mean_total":
        return q(sum(totals, Decimal(0)) / n, 2)
    if m in ("p5_max", "p50_max", "p95_max"):
        return q(percentile(maxes, m[1:-4]), 2)
    if m == "min_max":
        return q(min(maxes), 2)
    if m == "max_max":
        return q(max(maxes), 2)
    if m == "first":
        return q(firsts[0], 2)
    if m == "list_max":
        return [q(v, 2) for v in maxes]
    raise ValueError(m)


def mc_steps(i, _facts=None):
    """The first `count` discrete draws (value:weight list `outcomes`) of the generator for `seed`."""
    g = rng(int(i["seed"]))
    out = _weights(i["outcomes"])
    return [draw(out, next(g)) for _ in range(int(i["count"]))]


def mc_share(i, _facts=None):
    """count of `total` as percent and its simulation-style error, both to 1 decimal: {p_pct, se_pct}."""
    p = Decimal(str(i["count"])) / Decimal(str(i["total"]))
    return {"p_pct": q(p * 100, 1), "se_pct": q((p * (1 - p) / Decimal(str(i["total"]))).sqrt() * 100, 1)}


KINDS = {"mc_share": mc_share, "mc_steps": mc_steps, "mc_rng": mc_rng, "mc_run": mc_run}
