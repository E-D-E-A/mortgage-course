"""Independent checks for the whole file of case A (units 9.1-9.4; src/lib/calc/casefile.ts). Fact kinds start with cf_.

Plain Python Decimal; nothing is imported from src/. The arithmetic of earlier stages (a payslip's net, the 18-month rule, the
ratio, the financing ratio, the bank's decision, the cash flow) is checked by the kinds those stages already have; what is new
here is small, and is written again from the text of the inputs:

  cf_income       the recognised monthly income from several payslips: the average of the months' nets with each month's one-off
                  taken out ("recognised"), the plain average of the nets ("naive"), or the one-offs added up ("oneoffs")
  cf_statement    an account statement month by month: the opening balance, the two borrowers' deposits, the debits, the closing
                  balance (which is the next month's opening); with `field` = "closing", only the last closing balance
  cf_claim_state  the state of a claim: the WORST state of the pieces of evidence that bear on it (ok < question < partial < missing)
  cf_doc_state    the same for a document
  cf_count_states how many documents are in each state
  cf_equity       the equity that counts under a view: "declared" (all), "documented" (claims whose state is ok or partial),
                  "verified" (claims whose state is ok), the states derived here from the evidence text
  cf_window       the highest payment inside the first `window` months of a mix under a scenario, the first month it is paid, and
                  what is left for living in the first month and in that month, with the family's own budget taken off
                  (the cash flow comes from kinds/scenarios.py and kinds/engine.py, themselves written without the TypeScript)
  cf_lowest       the label of the lowest of several other facts' values (a tie keeps the first)
  cf_shapes       the whole-thousand cuts of a loan that the request and the three alternatives use

Text forms: evidence "doc:claim:state|doc:claim:state"; claims "claim_a|claim_b"; documents "doc_a|doc_b"; pieces "claim:amount|...";
nets and oneoffs "a|b|c"; ids and labels "x|y|z".
"""
from decimal import ROUND_FLOOR, Decimal

from kinds import engine, scenarios
from kinds.common import agorot

ORDER = ["ok", "question", "partial", "missing"]


def _money(x):
    return str(agorot(x))


def _list(text):
    return [t for t in str(text).split("|") if t != ""]


def cf_income(i, _facts=None):
    nets = [Decimal(x) for x in _list(i["nets"])]
    oneoffs = [Decimal(x) for x in _list(i["oneoffs"])]
    if len(nets) != len(oneoffs):
        raise ValueError("one one-off for each month")
    mode = i["mode"]
    if mode == "naive":
        return _money(sum(nets, Decimal(0)) / len(nets))
    if mode == "oneoffs":
        return _money(sum(oneoffs, Decimal(0)))
    if mode == "recognised":
        return _money(sum((n - o for n, o in zip(nets, oneoffs)), Decimal(0)) / len(nets))
    raise ValueError(mode)


def cf_statement(i, _facts=None):
    balance = Decimal(i["opening"])
    rows, k = [], 1
    while f"month_{k}" in i:
        noam, shira, debits = Decimal(i[f"noam_{k}"]), Decimal(i[f"shira_{k}"]), Decimal(i[f"debits_{k}"])
        opening = balance
        balance = balance + noam + shira - debits
        rows.append({
            "period": k, "month": i[f"month_{k}"], "opening": _money(opening), "noam": _money(noam), "shira": _money(shira),
            "deposits": _money(noam + shira), "debits": _money(debits), "closing": _money(balance),
        })
        k += 1
    if i.get("field") == "closing":
        return rows[-1]["closing"]
    return rows


def _evidence(i):
    out = []
    for item in _list(i["evidence"]):
        doc, claim, state = item.split(":")
        if state not in ORDER:
            raise ValueError(state)
        out.append((doc, claim, state))
    return out


def _worst(states):
    return max(states, key=ORDER.index) if states else "ok"


def cf_claim_state(i, _facts=None):
    return _worst([s for _, c, s in _evidence(i) if c == i["claim"]])


def cf_doc_state(i, _facts=None):
    return _worst([s for d, _, s in _evidence(i) if d == i["doc"]])


def cf_count_states(i, _facts=None):
    docs = _list(i["docs"])
    states = [_worst([s for d, _, s in _evidence(i) if d == doc]) for doc in docs]
    return {state: states.count(state) for state in ORDER}


def cf_equity(i, _facts=None):
    view = i["view"]
    total = Decimal(0)
    for item in _list(i["pieces"]):
        claim, amount = item.split(":")
        state = _worst([s for _, c, s in _evidence(i) if c == claim])
        counts = view == "declared" or (view == "documented" and state in ("ok", "partial")) or (view == "verified" and state == "ok")
        if view not in ("declared", "documented", "verified"):
            raise ValueError(view)
        if counts:
            total += Decimal(amount)
    return _money(total)


def cf_window(i, _facts=None):
    j = scenarios.flat(i)
    if i["scenario"] == "forecast451":
        scenarios._cross_check(i, j)
    payments, _ = engine.evaluate_flat(j)
    cents = [agorot(p) for p in payments]
    window = cents[: int(i["window"])]
    top = max(window)
    top_month = window.index(top) + 1
    net, budget = Decimal(i["net"]), Decimal(i["budget"])
    car, car_months = Decimal(i["car_monthly"]), int(i["car_months"])

    def left(month):
        return net - cents[month - 1] - (car if month <= car_months else Decimal(0))

    measure = i["measure"]
    if measure == "max":
        return _money(top)
    if measure == "max_month":
        return top_month
    if measure == "left_first":
        return _money(left(1))
    if measure == "left_max":
        return _money(left(top_month))
    if measure == "margin_first":
        return _money(left(1) - budget)
    if measure == "margin_max":
        return _money(left(top_month) - budget)
    raise ValueError(measure)


def cf_shapes(i, _facts=None):
    """The whole-thousand cuts of a loan: `third` = the largest whole thousand within a third; `rest` = half of what remains (the request is
    third, rest, rest); `variable` = the largest whole thousand within two-thirds; `fixed` = the rest."""
    loan = Decimal(i["loan"])
    thousand = Decimal(1000)
    third = (loan / 3 / thousand).to_integral_value(rounding=ROUND_FLOOR) * thousand
    variable = (loan * 2 / 3 / thousand).to_integral_value(rounding=ROUND_FLOOR) * thousand
    return {"third": _money(third), "rest": _money((loan - third) / 2), "variable": _money(variable), "fixed": _money(loan - variable)}


def cf_lowest(i, facts):
    ids, labels = _list(i["ids"]), _list(i["labels"])
    values = [Decimal(str(facts[x]["value"])) for x in ids]
    return labels[values.index(min(values))]


KINDS = {
    "cf_income": cf_income,
    "cf_statement": cf_statement,
    "cf_claim_state": cf_claim_state,
    "cf_doc_state": cf_doc_state,
    "cf_count_states": cf_count_states,
    "cf_equity": cf_equity,
    "cf_window": cf_window,
    "cf_lowest": cf_lowest,
    "cf_shapes": cf_shapes,
}
