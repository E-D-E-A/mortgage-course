"""Independent check for the tiny two-variable linear programme (lesson 8.16). Fact kinds start with lp_.

Plain Python with exact fractions; nothing is imported from src/. Written from the rule, not from the
TypeScript: take every pair of boundary lines (the conditions, then x = 0 and y = 0), cross them,
keep the crossings that obey every condition, read the objective at each, and the best one wins.
A condition is  a1*x + a2*y <= b.  Inputs encode the conditions as "label:a1:a2:b;label:a1:a2:b".

  lp_solve      {status, corners, best} for  c1, c2, goal ("min" | "max"), conditions
  lp_crossings  every crossing of two lines, feasible or not, with the conditions it breaks
  lp_value      the objective c1*x + c2*y at a given point, two decimals
  lp_valleys    local minima, the global minimum and the downhill walk from a start, for a list of costs
"""
from fractions import Fraction


def frac(s):
    return Fraction(str(s))


def two(q, d=2):
    """`d` decimals (default 2), half away from zero, as a string."""
    scale = 10 ** d
    n = (abs(q) * scale + Fraction(1, 2)).__floor__()
    neg = q < 0 and n != 0
    whole, frac_part = divmod(n, scale)
    out = f"{whole}.{frac_part:0{d}d}" if d else str(whole)
    return f"-{out}" if neg else out


def parse(text):
    out = []
    for part in str(text).split(";"):
        label, a1, a2, b = part.split(":")
        out.append((label, frac(a1), frac(a2), frac(b)))
    return out


AXES = [("x ≥ 0", Fraction(-1), Fraction(0), Fraction(0)), ("y ≥ 0", Fraction(0), Fraction(-1), Fraction(0))]


def _raw(i):
    cond = parse(i["conditions"]) + AXES
    c1, c2 = frac(i["c1"]), frac(i["c2"])
    d = int(i.get("decimals", 2))
    out = []
    for p in range(len(cond)):
        for q in range(p + 1, len(cond)):
            _, a1, a2, b = cond[p]
            _, d1, d2, e = cond[q]
            det = a1 * d2 - a2 * d1
            if det == 0:
                continue
            x = (b * d2 - a2 * e) / det
            y = (a1 * e - b * d1) / det
            broken = [k[0] for k in cond if k[1] * x + k[2] * y > k[3]]
            on = [k[0] for k in cond if k[1] * x + k[2] * y == k[3]]
            out.append({
                "x": two(x, d), "y": two(y, d), "value": two(c1 * x + c2 * y, d), "active": on,
                "lines": [cond[p][0], cond[q][0]], "feasible": not broken, "breaks": broken,
                "_exact": c1 * x + c2 * y,
            })
    return out, cond, c1, c2


def lp_crossings(i, _facts=None):
    return [{k: v for k, v in r.items() if k != "_exact"} for r in _raw(i)[0]]


def lp_solve(i, _facts=None):
    raw, cond, c1, c2 = _raw(i)
    corners, exact, seen = [], [], set()
    for r in raw:
        if not r["feasible"]:
            continue
        key = (r["x"], r["y"])
        if key in seen:
            continue
        seen.add(key)
        corners.append({"x": r["x"], "y": r["y"], "value": r["value"], "active": r["active"]})
        exact.append(r["_exact"])
    if not corners:
        return {"status": "infeasible", "corners": corners, "best": []}
    sign = 1 if i["goal"] == "min" else -1
    # Unbounded: a direction along which no condition gets worse and the objective keeps improving.
    dirs = [(Fraction(1), Fraction(0)), (Fraction(0), Fraction(1))]
    for _, a1, a2, _b in cond:
        dirs += [(-a2, a1), (a2, -a1)]
    for dx, dy in dirs:
        if dx == 0 and dy == 0:
            continue
        if all(k[1] * dx + k[2] * dy <= 0 for k in cond) and sign * (c1 * dx + c2 * dy) < 0:
            return {"status": "unbounded", "corners": corners, "best": []}
    target = min(sign * e for e in exact)
    best = [c for c, e in zip(corners, exact) if sign * e == target]
    return {"status": "optimal", "corners": corners, "best": best}


def lp_value(i, _facts=None):
    return two(frac(i["c1"]) * frac(i["x"]) + frac(i["c2"]) * frac(i["y"]), int(i.get("decimals", 2)))


def lp_valleys(i, _facts=None):
    v = [Fraction(str(x)) for x in str(i["values"]).split(",")]
    start = int(i["start"])
    n = len(v)
    minima = []
    for k in range(n):
        left_ok = k == 0 or v[k] < v[k - 1]
        right_ok = k == n - 1 or v[k] <= v[k + 1]
        if left_ok and right_ok:
            minima.append(k)
    g = min(range(n), key=lambda k: (v[k], k))
    path = [start]
    at = start
    while True:
        nxt = at
        left = v[at - 1] if at > 0 else None
        right = v[at + 1] if at < n - 1 else None
        if left is not None and left < v[at] and (right is None or left <= right):
            nxt = at - 1
        elif right is not None and right < v[at]:
            nxt = at + 1
        if nxt == at:
            break
        path.append(nxt)
        at = nxt
    return {"localMinima": minima, "globalMin": g, "path": path}


def lp_feasible_count(i, _facts=None):
    return sum(1 for r in lp_crossings(i) if r["feasible"])


KINDS = {
    "lp_feasible_count": lp_feasible_count,
    "lp_valleys": lp_valleys,
    "lp_solve": lp_solve,
    "lp_crossings": lp_crossings,
    "lp_value": lp_value,
}
