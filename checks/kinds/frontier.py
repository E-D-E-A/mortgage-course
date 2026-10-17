"""Independent checks for the efficient frontier (lesson 8.15). Fact kinds start with fr_.

Plain Python Decimal; nothing is imported from src/. Rows are encoded "id:v1:v2:v3:f;id:...", f = 1 for a
feasible row, 0 for an infeasible one; every objective is smaller-is-better.

  fr_front   per row: efficient (feasible and nobody feasible dominates it), dominatedBy (ids, row order),
             dominatesCount. `use` (optional "0,1") reads only those objective positions.
  fr_pick    the winner of the weighted score over the feasible rows: each objective normalised
             (v - lowest) / (highest - lowest) over the feasible rows, rounded to 4 decimals half up,
             all equal -> 0; score = sum(w * n) / sum(w); smallest score wins, the first row on a tie.
  fr_count   how many rows are efficient, dominated (feasible but not efficient) or feasible (`what`)
  fr_reach   over the lattice of whole-number weights adding to 100 in steps of `step`, how many triples each
             efficient row wins ("wins", in row order), plus the ids that never win ("never").
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40


def parse(text):
    rows = []
    for part in str(text).split(";"):
        bits = part.split(":")
        rows.append((bits[0], [Decimal(b) for b in bits[1:-1]], bits[-1] == "1"))
    return rows


def sub(values, use):
    return values if not use else [values[k] for k in use]


def dominates(a, b):
    return all(x <= y for x, y in zip(a, b)) and any(x < y for x, y in zip(a, b))


def front(rows, use=None):
    feas = [r for r in rows if r[2]]
    out = []
    for r in rows:
        mine = sub(r[1], use)
        by = [o[0] for o in feas if o is not r and dominates(sub(o[1], use), mine)] if r[2] else []
        cnt = sum(1 for o in feas if o is not r and dominates(mine, sub(o[1], use))) if r[2] else 0
        out.append({"id": r[0], "efficient": r[2] and not by, "dominatedBy": by, "dominatesCount": cnt})
    return out


def use_of(i):
    return [int(k) for k in str(i["use"]).split(",")] if i.get("use") else None


def fr_front(i, _facts=None):
    return front(parse(i["rows"]), use_of(i))


def winner(rows, weights):
    feas = [r for r in rows if r[2]] or rows
    k = len(weights)
    total = sum(weights)
    norm = {}
    for j in range(k):
        lo = min(r[1][j] for r in feas)
        hi = max(r[1][j] for r in feas)
        for r in rows:
            n = Decimal(0) if hi == lo else ((r[1][j] - lo) / (hi - lo)).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            norm[(r[0], j)] = n
    best = None
    for r in rows:
        if not r[2]:
            continue
        score = sum((norm[(r[0], j)] * weights[j] for j in range(k)), Decimal(0)) / total
        if best is None or score < best[1]:
            best = (r[0], score)
    return best


def fr_pick(i, _facts=None):
    rows = parse(i["rows"])
    w = [int(x) for x in str(i["weights"]).split(",")]
    b = winner(rows, w)
    eff = {r["id"]: r["efficient"] for r in front(rows)}
    return {"id": b[0], "efficient": eff[b[0]]}


def lattice(units, parts, step):
    if parts == 1:
        return [[units * step]]
    out = []
    for u in range(units + 1):
        for rest in lattice(units - u, parts - 1, step):
            out.append([u * step] + rest)
    return out


def fr_reach(i, _facts=None):
    rows = parse(i["rows"])
    step = int(i["step"])
    eff = [r["id"] for r in front(rows) if r["efficient"]]
    wins = {e: 0 for e in eff}
    for w in lattice(100 // step, len(rows[0][1]), step):
        if sum(w) == 0:
            continue
        b = winner(rows, w)
        wins[b[0]] = wins.get(b[0], 0) + 1
    return {"wins": [{"id": e, "wins": wins[e]} for e in eff], "never": [e for e in eff if wins[e] == 0]}


def fr_count(i, _facts=None):
    """How many rows are efficient / dominated (feasible but not efficient) / feasible."""
    rows = parse(i["rows"])
    fr = front(rows, use_of(i))
    what = i["what"]
    if what == "efficient":
        return sum(1 for r in fr if r["efficient"])
    if what == "dominated":
        return sum(1 for r, o in zip(fr, rows) if o[2] and not r["efficient"])
    return sum(1 for r in rows if r[2])


def fr_never_count(i, _facts=None):
    return len(fr_reach(i)["never"])


KINDS = {"fr_never_count": fr_never_count, "fr_count": fr_count, "fr_front": fr_front, "fr_pick": fr_pick, "fr_reach": fr_reach}
