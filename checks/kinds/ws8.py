"""Independent check of workshop 8.28's small engine (src/lib/calc/ws8.ts). Fact kind: ws8_value.

The engine is checks/ws8_engine.py, written without the TypeScript and from the course's rules: Python's Decimal, each
month's interest rounded to the agora, the payment set (and re-set at a rate change) in agorot, the last payment closing
the balance. It is ALSO the code of the workshop's Python notebook (scripts/build-engine-workshop.py turns it into
public/downloads/engine-workshop.ipynb), so the notebook and the page cannot disagree.

The case is the fact `ws.case` (an object written by the TypeScript from src/data/case-s8.ts; this file types no number
of it). A `ws8_value` fact says which positioning choice (extra_equity, close_car, parent, bank), which weights ("40|30|30")
and WHAT to read:

  loan / ltv / disposable     the loan, the financing ratio (percent, 2 places) and the disposable income of the positioning
  space                       the number of candidates of the grid, by combinatorics: C(100/step + 2, 2)
  feasible / efficient        how many candidates pass every constraint / are on the efficient front
  reject:<constraint id>      how many candidates the constraint rejects (a candidate failing three counts under each)
  winner_id / runner_id       the best and second-best feasible candidate
  winner:<first|total|exposure>   the winner's measure;  gap:<first|total|exposure>  runner-up minus winner
  row:<id>:<first|total|exposure|feasible|efficient|reasons|score>   one candidate
  offer:<estimate_first|offer_first|estimate_total|offer_total|first_gap|total_gap>   the sample offer against the estimate
"""
import math
import sys
from decimal import ROUND_HALF_UP, Decimal
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import ws8_engine as eng  # noqa: E402

IDS = [
    "sum_equals_loan", "positive_tracks", "equity_available", "ltv", "pti", "variable_share", "term",
    "bank_ratio", "bank_ltv", "client_max_payment", "client_target_ratio",
]
MEASURES = {"first": 0, "total": 1, "exposure": 2}


def money(x):
    return str(Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


@lru_cache(maxsize=None)
def _run(case_key, extra, close_car, parent, bank, weights):
    import json

    case = json.loads(case_key)
    choice = {"extra_equity": extra, "close_car": close_car == "1", "parent": parent == "1", "bank": bank}
    w = [int(x) for x in weights.split("|")]
    result = eng.run(case, choice, w)
    return case, result, eng.explain(result)


def ws8_value(i, facts):
    import json

    case = facts["ws.case"]["value"]
    case_key = json.dumps(case, sort_keys=True)
    case, result, ex = _run(case_key, str(i["extra_equity"]), str(i["close_car"]), str(i["parent"]), str(i["bank"]), str(i["weights"]))
    rows = result["rows"]
    what = str(i["what"])
    if what == "loan":
        return money(result["positioning"]["loan"])
    if what == "ltv":
        return str((result["positioning"]["loan"] / Decimal(case["price"]) * 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    if what == "disposable":
        return money(result["positioning"]["disposable"])
    if what == "front_ids":
        return "|".join(r["id"] for r in rows if r["efficient"])
    if what == "feasible_ids":
        return "|".join(r["id"] for r in rows if r["feasible"])
    if what == "space":
        return math.comb(100 // int(case["rules"]["step"]) + 2, 2)
    if what == "feasible":
        return sum(1 for r in rows if r["feasible"])
    if what == "efficient":
        return sum(1 for r in rows if r["efficient"])
    if what.startswith("reject:"):
        return sum(1 for r in rows if what.split(":")[1] in r["reasons"])
    if what == "winner_id":
        return ex["winner"]["id"]
    if what == "runner_id":
        return ex["runner_up"]["id"]
    if what.startswith("winner:"):
        return money(ex["winner"]["values"][MEASURES[what.split(":")[1]]])
    if what.startswith("gap:"):
        return money(ex["gaps"][MEASURES[what.split(":")[1]]])
    if what.startswith("row:"):
        _, rid, field = what.split(":")
        r = next(x for x in rows if x["id"] == rid)
        if field in MEASURES:
            return money(r["values"][MEASURES[field]])
        if field == "feasible":
            return r["feasible"]
        if field == "efficient":
            return r["efficient"]
        if field == "reasons":
            return "|".join(x for x in IDS if x in r["reasons"])
        if field == "score":
            return str(r["score"].quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))
    if what.startswith("offer:"):
        o = eng.check_offer(case)
        key = what.split(":")[1]
        table = {
            "estimate_first": o["estimate"][0], "offer_first": o["offer"][0], "estimate_total": o["estimate"][1],
            "offer_total": o["offer"][1], "first_gap": o["first_gap"], "total_gap": o["total_gap"],
        }
        return money(table[key])
    raise KeyError(what)


KINDS = {"ws8_value": ws8_value}
