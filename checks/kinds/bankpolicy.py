"""Independent checks for the invented bank policy of lessons 6.9 and 6.11 (fact kinds start
with bp_).

Plain Python Decimal; nothing is imported from src/. The RULES are the exercise's, invented for
fictional banks, and are written out again here on purpose:

  a line (the payment-to-income ratio, the financing ratio) has a refusal point and, maybe, a step
  point. Actual ABOVE the refusal point: the bank refuses. Actual above the step point (and not
  above the refusal point): the bank approves and adds the step's percentage points to the rate of
  every track. Exactly on a line is not above it. A refusing bank prices nothing: 0 points.

  bp_decision  "approve" or "refuse" from the ratio, the financing ratio and the two refusal points
  bp_points    the percentage points the steps add (inputs: the two actuals, the two refusal points,
               the two step points and their sizes; a step point "none" means no step)
  bp_rate      a track's final rate: its list rate plus the points, two decimals
  bp_max_loan  the largest loan a financing ceiling allows on a value: value × percent ÷ 100, cut
               down to the agora (a maximum is never rounded up)

The ratio and the financing ratio themselves are not recomputed here: a fact of kind sens_mix
(measure "ratio", checks/kinds/sensitivity.py) and ltv_percent (ltv.py) carry them. The decision
reads those two numbers as the page shows them (two decimals), so a lesson never builds a file
whose number sits within a hundredth of a line.
"""
from decimal import ROUND_DOWN, Decimal

from kinds.common import agorot

HUNDREDTH = Decimal("0.01")


def _step(i, name):
    return None if str(i[f"{name}_step"]) == "none" else Decimal(str(i[f"{name}_step"]))


def bp_decision(i, _facts=None):
    refused = Decimal(str(i["ratio"])) > Decimal(str(i["ratio_max"])) or Decimal(str(i["ltv"])) > Decimal(str(i["ltv_max"]))
    return "refuse" if refused else "approve"


def bp_points(i, _facts=None):
    if bp_decision(i) == "refuse":
        return "0"
    total = Decimal(0)
    for name, actual in (("ratio", i["ratio"]), ("ltv", i["ltv"])):
        step = _step(i, name)
        if step is not None and Decimal(str(actual)) > step:
            total += Decimal(str(i[f"{name}_step_points"]))
    return format(total.normalize(), "f") if total else "0"


def bp_rate(i, _facts=None):
    return format((Decimal(str(i["list_rate"])) + Decimal(str(i["points"]))).quantize(HUNDREDTH), "f")


def bp_max_loan(i, _facts=None):
    x = (Decimal(str(i["value"])) * Decimal(str(i["percent"])) / 100).quantize(HUNDREDTH, rounding=ROUND_DOWN)
    return str(agorot(x))


KINDS = {
    "bp_decision": bp_decision,
    "bp_points": bp_points,
    "bp_rate": bp_rate,
    "bp_max_loan": bp_max_loan,
}
