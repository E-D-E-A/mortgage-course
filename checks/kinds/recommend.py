"""Independent checks for the recommendation of case A (units 9.3 and 9.4; src/data/case-a-recommendation.ts). Fact kinds start with rec_.

Plain Python Decimal; nothing is imported from src/. The prices, ratios and margins a candidate is judged on are facts that the earlier
stages' kinds already check; what is new is the small rule that turns them into a reason, and the counting of reasons:

  rec_stage   the first HARD reason a candidate (an alternative read by one bank) falls out: "refused" when the bank's decision is
              "refuse"; else "budget" when what is left for living in the stressed month is under the family's own budget (the margin
              is negative); else "ok". A hard reason is one the family cannot live with; it is not a matter of taste.
  rec_flag    "over" when a ratio (percent) is above a line (percent), else "under" (a ratio exactly on the line is "under": the
              line is a threshold of price, and "above" is the word of the threshold).
  rec_count   how many of the listed values are equal to `match` (a text compare: "ok", "over", ...).
  rec_rank    the 1-based place of the value `of` among the listed values, lowest first (a tie shares the lower place).
Lists are written "a|b|c".
"""
from decimal import Decimal


def _list(text):
    return [t for t in str(text).split("|") if t != ""]


def rec_stage(i, _facts=None):
    if i["decision"] == "refuse":
        return "refused"
    if i["decision"] != "approve":
        raise ValueError(i["decision"])
    return "budget" if Decimal(i["margin"]) < 0 else "ok"


def rec_flag(i, _facts=None):
    return "over" if Decimal(i["ratio"]) > Decimal(i["line"]) else "under"


def rec_count(i, _facts=None):
    return sum(1 for v in _list(i["values"]) if v == str(i["match"]))


def rec_rank(i, _facts=None):
    values = [Decimal(v) for v in _list(i["values"])]
    return 1 + sum(1 for v in values if v < Decimal(i["of"]))


KINDS = {"rec_stage": rec_stage, "rec_flag": rec_flag, "rec_count": rec_count, "rec_rank": rec_rank}
