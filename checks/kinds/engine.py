"""Independent checks for the stage-8 engine (src/lib/calc/engine.ts, lesson 8.9). Fact kind: eng_eval.

Plain Python Decimal; nothing imported from src/. The cash flow of a mix comes from kinds/schedule.py (itself
written without the TypeScript); what is written here is the engine's own layer: the measures of one mix under one
scenario, from the flat inputs of schedule.mixInputs plus `measure`:

  first / max / max_month / total / months   the payment in month 1, the highest payment, the first month it is paid
                                             (compared to the agora), every payment added up, the longest term
  loan                                       the tracks' amounts added
  interest / indexation                      the sums of the rows' interest and of the balance's indexation
  residual                                   total - loan - interest - indexation (to the agora: should be 0.00)
  payment (month)                            the mix's payment that month
  interest_at / principal_at / closing_at    the interest, the principal repaid and the balance after that month, summed over the tracks
  fingerprint                                FNV-1a (32 bit) of "first|max|max_month|total|months" as text
Always in the "statement" rounding of the course.
"""
from decimal import Decimal

from kinds import schedule
from kinds.common import agorot


def fnv1a(text):
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def evaluate_flat(i):
    """(payments, tracks) for flat mix inputs, forced to statement rounding."""
    j = dict(i)
    j["rounding"] = "statement"
    return schedule.flow(j)


def measure(i, measure_name, month=None):
    payments, tracks = evaluate_flat(i)
    cents = [agorot(p) for p in payments]
    first = str(agorot(payments[0]))
    top = str(max(cents))
    top_month = cents.index(max(cents)) + 1
    total = sum(payments, Decimal(0))
    loan = sum((Decimal(str(i[f"t{k}_amount"])) for k in range(1, int(i["tracks"]) + 1)), Decimal(0))
    interest = sum((r["interest"] for t in tracks for r in t["rows"]), Decimal(0))
    indexation = sum((r["indexation"] for t in tracks for r in t["rows"]), Decimal(0))
    if measure_name == "first":
        return first
    if measure_name == "max":
        return top
    if measure_name == "max_month":
        return top_month
    if measure_name == "total":
        return str(agorot(total))
    if measure_name == "months":
        return len(payments)
    if measure_name == "loan":
        return str(agorot(loan))
    if measure_name == "interest":
        return str(agorot(interest))
    if measure_name == "indexation":
        return str(agorot(indexation))
    if measure_name == "residual":
        return str(agorot(total - loan - interest - indexation))
    if measure_name in ("interest_at", "principal_at", "closing_at"):
        m = int(month)
        key = {"interest_at": "interest", "principal_at": "principal_paid", "closing_at": "closing"}[measure_name]
        return str(agorot(sum((t["rows"][m - 1][key] for t in tracks if m <= len(t["rows"])), Decimal(0))))
    if measure_name == "payment":
        m = int(month)
        return str(agorot(payments[m - 1])) if m <= len(payments) else "0.00"
    if measure_name == "fingerprint":
        return fnv1a("|".join([first, top, str(top_month), str(agorot(total)), str(len(payments))]))
    raise ValueError(f"unknown measure {measure_name}")


def eng_eval(i, _facts=None):
    return measure(i, i["measure"], i.get("month"))


def eng_sum(i, facts):
    """Money facts added: `ids` joined by "|" (the mix's payment is the sum of its tracks')."""
    return str(agorot(sum((Decimal(facts[x]["value"]) for x in str(i["ids"]).split("|")), Decimal(0))))


KINDS = {"eng_eval": eng_eval, "eng_sum": eng_sum}
