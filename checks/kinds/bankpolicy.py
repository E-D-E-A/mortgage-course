"""Independent checks for the invented bank policy of lessons 6.9–6.11 (fact kinds start with bp_).

Plain Python Decimal; nothing is imported from src/. The RULES are the exercise's, invented for
fictional banks, and are written out again here on purpose:

  a line (the payment-to-income ratio, the financing ratio) has a refusal point and, maybe, a relief
  point. Actual ABOVE the refusal point: the bank refuses. Actual NOT ABOVE the relief point (and not
  refused): the bank takes the line's relief, in percentage points, off the rate of every track.
  Exactly on a line has not crossed it, so a file exactly on a relief line gets the relief. A
  refusing bank prices nothing: 0 points of relief.

  bp_decision   "approve" or "refuse" from the ratio, the financing ratio and the two refusal points
  bp_relief     the percentage points the relief takes off (inputs: the two actuals, the two refusal
                points, the two relief lines — "none" for no relief — and their sizes)
  bp_rate       a track's final rate: its list rate minus the relief, two decimals
  bp_max_loan   the largest loan a financing ceiling allows on a value: value × percent ÷ 100, cut
                down to the agora (a maximum is never rounded up)

The ratio and the financing ratio themselves are not recomputed here: a fact of kind sens_mix
(measure "ratio", checks/kinds/sensitivity.py) and ltv_percent (ltv.py) carry them. The decision
reads those two numbers as the page shows them (two decimals), so a lesson never builds a file
whose number sits within a hundredth of a line.
"""
from decimal import ROUND_DOWN, Decimal

from kinds.common import agorot

HUNDREDTH = Decimal("0.01")


def _line(i, name):
    return None if str(i[f"{name}_relief_line"]) == "none" else Decimal(str(i[f"{name}_relief_line"]))


def bp_decision(i, _facts=None):
    refused = Decimal(str(i["ratio"])) > Decimal(str(i["ratio_max"])) or Decimal(str(i["ltv"])) > Decimal(str(i["ltv_max"]))
    return "refuse" if refused else "approve"


def bp_relief(i, _facts=None):
    if bp_decision(i) == "refuse":
        return "0"
    total = Decimal(0)
    for name, actual in (("ratio", i["ratio"]), ("ltv", i["ltv"])):
        line = _line(i, name)
        if line is not None and Decimal(str(actual)) <= line:
            total += Decimal(str(i[f"{name}_relief_points"]))
    return format(total.normalize(), "f") if total else "0"


def bp_rate(i, _facts=None):
    return format((Decimal(str(i["list_rate"])) - Decimal(str(i["relief"]))).quantize(HUNDREDTH), "f")


def bp_max_loan(i, _facts=None):
    x = (Decimal(str(i["value"])) * Decimal(str(i["percent"])) / 100).quantize(HUNDREDTH, rounding=ROUND_DOWN)
    return str(agorot(x))


KINDS = {
    "bp_decision": bp_decision,
    "bp_relief": bp_relief,
    "bp_rate": bp_rate,
    "bp_max_loan": bp_max_loan,
}
