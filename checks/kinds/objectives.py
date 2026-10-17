"""Independent checks for objectives and weights (src/lib/calc/objectives.ts, lesson 8.8). Fact kinds: obj_norm, obj_table, obj_lattice.

Plain Python Decimal; nothing imported from src/. The rules, restated:
  normalised value = (v - smallest) / (largest - smallest), rounded to 4 decimals half up; all equal -> 0;
  the smallest and largest are taken over the FEASIBLE rows (over="feasible") or all rows (over="all");
  score = (w1*n1 + w2*n2 + w3*n3) / (w1 + w2 + w3), printed to 6 decimals;
  rank 1.. among the feasible rows by score, a tie keeps the order of the list; an infeasible row has no rank (null).
A table is read from another fact (`table`: a sens_table fact, rows with first / total / rise) and the ids in `allowed`
(joined by "|") are the feasible rows. Row values are [first, total, rise].

obj_norm:    values "100|200|150" -> the normalised list as plain text (trailing zeros dropped).
obj_table:   table, allowed, weights "40,30,30", over -> rows [{id, n_first, n_total, n_exposure, score, rank}].
obj_lattice: table, allowed, step (percent) -> {distinct: "a|b|..." in order of first win, count: triples}.
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 50


def r4(x):
    return Decimal(x).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


def plain(x):
    s = format(Decimal(x), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def normalise(column, scale):
    lo, hi = min(scale), max(scale)
    if hi == lo:
        return [Decimal(0) for _ in column]
    return [r4((v - lo) / (hi - lo)) for v in column]


def rows_of(i, facts):
    allowed = set(str(i["allowed"]).split("|")) if i.get("allowed") else set()
    rows = []
    for r in facts[i["table"]]["value"]:
        rows.append((r["id"], [Decimal(r["first"]), Decimal(r["total"]), Decimal(r["rise"])], r["id"] in allowed))
    return rows


def score(rows, weights, over="feasible"):
    pool = rows if over == "all" else [r for r in rows if r[2]]
    if not pool:
        pool = rows
    cols = [normalise([r[1][j] for r in rows], [r[1][j] for r in pool]) for j in range(3)]
    total = sum(weights)
    out = []
    for k, r in enumerate(rows):
        ns = [cols[j][k] for j in range(3)]
        out.append({"id": r[0], "n": ns, "score": sum((n * w for n, w in zip(ns, weights)), Decimal(0)) / total, "feasible": r[2]})
    order = sorted([(o["score"], k) for k, o in enumerate(out) if o["feasible"]])
    for rank, (_, k) in enumerate(order, start=1):
        out[k]["rank"] = rank
    for o in out:
        o.setdefault("rank", None)
    return out


def obj_norm(i, _facts=None):
    v = [Decimal(x) for x in str(i["values"]).split("|")]
    return [plain(x) for x in normalise(v, v)]


def obj_table(i, facts):
    weights = [int(x) for x in str(i["weights"]).split(",")]
    res = score(rows_of(i, facts), weights, i.get("over", "feasible"))
    return [
        {"id": o["id"], "n_first": plain(o["n"][0]), "n_total": plain(o["n"][1]), "n_exposure": plain(o["n"][2]),
         "score": str(o["score"].quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)), "rank": o["rank"]}
        for o in res
    ]


def obj_lattice(i, facts):
    step = int(i["step"])
    rows = rows_of(i, facts)
    units = 100 // step
    distinct, count = [], 0
    for a in range(units + 1):
        for b in range(units + 1 - a):
            w = [a * step, b * step, (units - a - b) * step]
            count += 1
            best = [o for o in score(rows, w) if o["rank"] == 1]
            if best and best[0]["id"] not in distinct:
                distinct.append(best[0]["id"])
    return {"distinct": "|".join(distinct), "n_distinct": len(distinct), "count": count}


def obj_mul(i, _facts=None):
    """x * y, exact, plain text (a weight times a normalised value, for the by-hand score)."""
    return plain(Decimal(str(i["x"])) * Decimal(str(i["y"])))


def obj_sum(i, _facts=None):
    """The `values` ("|"-joined, plain numbers) added, divided by `by`, shown to 6 decimals."""
    t = sum((Decimal(x) for x in str(i["values"]).split("|")), Decimal(0)) / Decimal(str(i.get("by", 1)))
    return str(t.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))


KINDS = {"obj_mul": obj_mul, "obj_sum": obj_sum, "obj_norm": obj_norm, "obj_table": obj_table, "obj_lattice": obj_lattice}
