"""Independent checks for the stage-8 engine (src/lib/calc/engine.ts, lesson 8.9). Fact kind: eng_eval.

Plain Python Decimal; nothing imported from src/. The cash flow of a mix comes from kinds/schedule.py (itself
written without the TypeScript); what is written here is the engine's own layer: the measures of one mix under one
scenario, from the flat inputs of schedule.mixInputs plus `measure`:

  first / max / max_month / total / months   the payment in month 1, the highest PROJECTED payment (see `projected`: the clearing
                                             payment of a Spitzer track's last month is replaced by the one that was due), the first
                                             month it is paid (compared to the agora), every payment added up, the longest term
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


def projected(i, tracks, months):
    """The mix's payments for the highest-payment measure: in the last month of a Spitzer track the clearing payment (it carries the
    rounding of all earlier months) is replaced by the payment that was due: the previous month's payment times the index's move
    that month (index_ratio now over index_ratio before), to the agora. Other tracks pay what they pay."""
    out = [Decimal(0)] * months
    for k, t in enumerate(tracks, start=1):
        rows = t["rows"]
        n = len(rows)
        for m in range(n):
            pay = rows[m]["payment"]
            if m == n - 1 and n >= 2 and i[f"t{k}_method"] == "spitzer":
                pay = agorot(rows[m - 1]["payment"] * rows[m]["index_ratio"] / rows[m - 1]["index_ratio"])
            out[m] += pay
    return out


def measure(i, measure_name, month=None):
    payments, tracks = evaluate_flat(i)
    proj = projected(i, tracks, len(payments))
    cents = [agorot(p) for p in proj]
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


def eng_table(i, _facts=None):
    """One row per candidate, like sens_table's inputs (same field names), with the engine's measures: first, max (the projected highest
    payment), max_month and total under the base scenario, stress_max under the stress scenario, rise = stress_max - first, and passes
    (the limits of Directive 329 as sensitivity.py's _passes writes them). Written from kinds/sensitivity.py's input helpers and this
    file's `measure`."""
    from kinds import sensitivity as sens

    rows = []
    for cid, n in sens._candidates(i):
        base = sens._candidate_inputs(i, n, "base")
        stress = sens._candidate_inputs(i, n, "stress")
        first = Decimal(measure(base, "first"))
        smax = Decimal(measure(stress, "max"))
        rows.append({
            "id": cid, "first": measure(base, "first"), "max": measure(base, "max"), "max_month": measure(base, "max_month"),
            "total": measure(base, "total"), "stress_max": measure(stress, "max"), "rise": str(agorot(smax - first)),
            "passes": "yes" if sens._passes(base, i) else "no",
        })
    return rows


KINDS = {"eng_eval": eng_eval, "eng_sum": eng_sum, "eng_table": eng_table}
