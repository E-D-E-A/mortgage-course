"""Independent checks for the pipeline of lesson 8.21 (fact kinds start with pipe_).

Plain Python Decimal; nothing is imported from src/. The stages' other numbers come from their own kinds (the search:
srch_grid; the bank's rules: bp_*; the engine: sens_mix / eng_eval; the probability's logistic: cal_logistic). What is written
here is the pipeline's own layer:

  pipe_prob   chance of approval from the payment ratio and the financing ratio (percent strings as shown):
              z = a + b*(40 - ratio)/10 + c*(60 - ltv)/10; p = logistic(k*z), six decimals, half up; 0 when the bank refuses.
  pipe_rank   rows "id:decision:total:p;..." and a threshold. Group 1: approved with p >= threshold; 2: approved with p below it;
              3: refused. Ranked by group, then total paid (lower first), then the order of the list; a refusal has no rank.
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40


def six(x):
    return format(Decimal(x).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP), "f")


def pipe_prob(i, _facts=None):
    if i["decision"] == "refuse":
        return "0.000000"
    a, b, c, k = (Decimal(str(i[x])) for x in ("a", "b", "c", "k"))
    z = a + b * (40 - Decimal(str(i["ratio"]))) / 10 + c * (60 - Decimal(str(i["ltv"]))) / 10
    v = 1 / (1 + (-(z * k)).exp())
    return six(v)


def pipe_rank(i, _facts=None):
    thr = Decimal(str(i["threshold"]))
    rows = []
    for k, part in enumerate(str(i["rows"]).split(";")):
        rid, decision, total, p = part.split(":")
        g = 3 if decision == "refuse" else (1 if Decimal(p) >= thr else 2)
        rows.append((rid, g, Decimal(total), k))
    ranked = sorted((r for r in rows if r[1] != 3), key=lambda r: (r[1], r[2], r[3]))
    rank = {r[0]: n + 1 for n, r in enumerate(ranked)}
    return [{"id": r[0], "group": r[1], "rank": rank.get(r[0])} for r in rows]


def pipe_grid(i, _facts=None):
    """The grid search of lesson 8.14 (kinds/search.py, written without the TypeScript), run with a clean memo.

    search.py memoises a candidate's cash flow under a key made of the candidate's id and the scenario only, not of the loan or
    the price list, so two searches in one process (different banks, different loans) can read each other's numbers. This kind
    clears the memo first, so every search of this lesson is checked on its own numbers.
    """
    from kinds import search

    search._memo.clear()
    return search.srch_grid(i)


KINDS = {"pipe_prob": pipe_prob, "pipe_rank": pipe_rank, "pipe_grid": pipe_grid}
