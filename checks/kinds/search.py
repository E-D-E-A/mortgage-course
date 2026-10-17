"""Independent checks for the space of mixes and the grid search (src/lib/calc/search.ts, lessons 8.13-8.14).
Fact kinds: srch_count, srch_grid, srch_c2f.

Plain Python; nothing imported from src/. Counting is integer arithmetic (math.comb):
  compositions(units, parts) = comb(units + parts - 1, parts - 1); the space has
  "one" term for the mix: compositions * terms; "per_track": compositions * terms ** kinds (a term even for a kind with
  no share); "per_active_track": sum over j active kinds of comb(kinds, j) * comb(units - 1, j - 1) * terms ** j.

The grid: every split of 100/step pieces among the kinds (the first kind's pieces counting up from 0, then the second's...),
for each split the term choices (shared: one term for all active tracks; per_track: every combination). Amounts: the loan cut
by the active shares, every amount but the last rounded to the agora, the last the remainder. A candidate is "pruned" (when
pruning is on) if before any calculation its variable part is above two thirds of the loan or a term is above 360 months;
otherwise it is calculated (cash flow from kinds/schedule.py, statement rounding, under the base and the stress scenario)
and is "rejected" if it fails any constraint of kinds/constraints.py (the request text + the tracks) and "feasible" if not.
Objectives of a feasible candidate: [first payment (base), total paid (base), stress max - base first], scored by the
rules of kinds/objectives.py over the feasible candidates; the best is rank 1 (a tie keeps the grid order).
Coarse to fine: the grid at a coarse step, then the fine grid only in the box of +- coarse step points around the coarse
best on every kind, skipping candidates the coarse round already did, and the finalists of both ranked together.
srch_grid / srch_c2f inputs: loan, kinds "a|b|c", step, terms "240|300|360", mode, rates "kind=rate|...", request (the
constraints.py candidate text without its tracks), base_inflation, base_anchor, stress_inflation, stress_prime, stress_anchor,
weights, prune ("1"/"0"), and for c2f coarse.
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext
from math import comb

from kinds import constraints, engine, objectives, schedule
from kinds.common import agorot

getcontext().prec = 50
SHORT = {"fixed_unlinked": "ק", "fixed_linked": "קצ", "prime": "פ", "variable_unlinked": "מ", "variable_linked": "מצ"}
FIXED = ("fixed_unlinked", "fixed_linked")


def count_space(kinds, step, terms, mode):
    units = 100 // step
    if mode == "one":
        return comb(units + kinds - 1, kinds - 1) * terms
    if mode == "per_track":
        return comb(units + kinds - 1, kinds - 1) * terms**kinds
    return sum(comb(kinds, j) * comb(units - 1, j - 1) * terms**j for j in range(1, min(kinds, units) + 1))


def srch_count(i, _facts=None):
    return str(count_space(int(i["kinds"]), int(i["step"]), int(i["terms"]), i["mode"]))


def splits(units, parts):
    if parts == 1:
        return [[units]]
    return [[u] + rest for u in range(units + 1) for rest in splits(units - u, parts - 1)]


def grid(i, step):
    kinds = str(i["kinds"]).split("|")
    rates = dict(p.split("=") for p in str(i["rates"]).split("|"))
    terms = [int(t) for t in str(i["terms"]).split("|")]
    loan = Decimal(str(i["loan"]))
    out = []
    for split in splits(100 // step, len(kinds)):
        shares = [u * step for u in split]
        active = [k for k, s in enumerate(shares) if s > 0]
        total = sum(shares[k] for k in active)
        amounts = [agorot(loan * shares[k] / total) for k in active[:-1]]
        amounts.append(loan - sum(amounts, Decimal(0)))
        if i["mode"] == "shared":
            options = [[t] * len(active) for t in terms]
        else:
            options = [[]]
            for _ in active:
                options = [o + [t] for o in options for t in terms]
        for opt in options:
            tracks = [(kinds[k], amounts[a], Decimal(rates[kinds[k]]), opt[a]) for a, k in enumerate(active)]
            ident = " ".join(f"{SHORT[kinds[k]]}{shares[k]}/{opt[a] // 12}" for a, k in enumerate(active))
            out.append({"id": ident, "shares": shares, "tracks": tracks})
    return out


def pre_reasons(c, loan):
    var = sum((t[1] for t in c["tracks"] if t[0] not in FIXED), Decimal(0))
    r = []
    if var * 3 > loan * 2:
        r.append("variable_share")
    if any(t[3] > 360 for t in c["tracks"]):
        r.append("term")
    return r


_memo = {}


def calculate(i, c):
    key = (c["id"], tuple(map(tuple, c["tracks"])), i["base_inflation"], i["base_anchor"], i["stress_inflation"], i["stress_prime"], i["stress_anchor"])
    if key in _memo:
        return _memo[key]
    flat = {"tracks": len(c["tracks"]), "block_months": 12, "rounding": "statement"}
    for k, (kind, amount, rate, months) in enumerate(c["tracks"], start=1):
        flat.update({f"t{k}_kind": kind, f"t{k}_amount": str(amount), f"t{k}_rate": str(rate), f"t{k}_months": months, f"t{k}_method": "spitzer"})
        if kind in ("variable_unlinked", "variable_linked"):
            flat[f"t{k}_reset"] = 60
    base = dict(flat, inflation_1=str(i["base_inflation"]), prime_shift_1="0", anchor_shift_1=str(i["base_anchor"]))
    stress = dict(flat, inflation_1=str(i["stress_inflation"]), prime_shift_1="0", prime_shift_2=str(i["stress_prime"]), anchor_shift_1=str(i["stress_anchor"]))
    first = Decimal(engine.measure(base, "first"))
    total = Decimal(engine.measure(base, "total"))
    smax = Decimal(engine.measure(stress, "max"))  # the projected highest payment (kinds/engine.py)
    _memo[key] = [first, total, smax - first]
    return _memo[key]


def candidate_text(i, c):
    return str(i["request"]) + ";tracks=" + ",".join(f"{k}:{a}:{r}:{m}" for k, a, r, m in c["tracks"])


def run(i, candidates, prune):
    loan = Decimal(str(i["loan"]))
    entries, calls = [], 0
    for c in candidates:
        pre = pre_reasons(c, loan)
        if prune and pre:
            entries.append((c, "pruned", None, pre))
            continue
        values = calculate(i, c)
        calls += 1
        fails = constraints._fails(constraints._parse(candidate_text(i, c)))
        reasons = pre + [x for x in fails if x not in pre]
        entries.append((c, "rejected" if reasons else "feasible", values, reasons))
    return entries, calls


def best_of(i, entries):
    rows = [(e[0]["id"], [Decimal(v) for v in e[2]], True) for e in entries if e[1] == "feasible"]
    if not rows:
        return None, None
    weights = [int(w) for w in str(i["weights"]).split(",")]
    scored = objectives.score(rows, weights)
    top = [s for s in scored if s["rank"] == 1][0]
    return top["id"], str(top["score"].quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))


def summarise(i, entries, calls, size):
    count = lambda s: sum(1 for e in entries if e[1] == s)  # noqa: E731
    best, score = best_of(i, entries)
    why = {}
    for e in entries:
        for r in e[3]:
            why[r] = why.get(r, 0) + 1
    reasons = "|".join(f"{k}={why[k]}" for k in sorted(why))
    return {"size": size, "engine_calls": calls, "pruned": count("pruned"), "rejected": count("rejected"), "feasible": count("feasible"), "best": best or "", "best_score": score or "", "reasons": reasons}


def srch_grid(i, _facts=None):
    cands = grid(i, int(i["step"]))
    entries, calls = run(i, cands, i["prune"] == "1")
    return summarise(i, entries, calls, len(cands))


def srch_c2f(i, _facts=None):
    coarse = int(i["coarse"])
    cc = grid(i, coarse)
    ce, calls1 = run(i, cc, i["prune"] == "1")
    best, _ = best_of(i, ce)
    if best is None:
        return summarise(i, ce, calls1, len(cc)) | {"coarse_calls": calls1, "fine_calls": 0}
    centre = [e[0] for e in ce if e[0]["id"] == best][0]["shares"]
    done = {e[0]["id"] for e in ce}
    fine = [c for c in grid(i, int(i["step"])) if all(abs(s - m) <= coarse for s, m in zip(c["shares"], centre)) and c["id"] not in done]
    fe, calls2 = run(i, fine, i["prune"] == "1")
    seen, merged = set(), []
    for e in ce + fe:
        if e[0]["id"] not in seen:
            seen.add(e[0]["id"])
            merged.append(e)
    out = summarise(i, merged, calls1 + calls2, len(merged))
    out["coarse_calls"], out["fine_calls"] = calls1, calls2
    return out


def srch_years(i, facts):
    """How long a space would take: a count (another fact) times `ms` milliseconds each, in years, to one decimal."""
    seconds = Decimal(facts[i["count"]]["value"]) * Decimal(str(i["ms"])) / 1000
    return str((seconds / (365 * 24 * 3600)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def srch_minutes(i, facts):
    """The same, in minutes, to one decimal."""
    seconds = Decimal(facts[i["count"]]["value"]) * Decimal(str(i["ms"])) / 1000
    return str((seconds / 60).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def srch_pow(i, _facts=None):
    """base ** exp, as a whole number (terms ** active tracks)."""
    return str(int(i["base"]) ** int(i["exp"]))


def srch_legal(i, _facts=None):
    """Splits (of 100/step pieces among the kinds) whose variable part is at most two thirds: {legal, all}."""
    kinds = str(i["kinds"]).split("|")
    units = 100 // int(i["step"])
    legal = 0
    allsplits = splits(units, len(kinds))
    for sp in allsplits:
        var = sum(u for u, k in zip(sp, kinds) if k not in FIXED)
        if var * 3 <= units * 2:
            legal += 1
    return {"legal": legal, "all": len(allsplits)}


KINDS = {"srch_pow": srch_pow, "srch_minutes": srch_minutes, "srch_years": srch_years, "srch_legal": srch_legal, "srch_count": srch_count, "srch_grid": srch_grid, "srch_c2f": srch_c2f}
