"""Independent checks for affordability (lessons 4.1–4.3): recognised income,
the 18-month rule for obligations, disposable income and the payment-to-income
ratio.

Plain Python Decimal; nothing is imported from src/lib/calc. Lists of amounts
arrive as "a|b|c" strings. A list of obligations arrives as
"kind,monthly,months[,flag]|…": months "-" when the end is unknown; flag
"continues" for rent that goes on after the purchase, or a mortgage's position
("repaid", "same_property", "other_property").

The rules restated here, from Brain 67436545 (Mogi's decision, Eylon 2026-10-07,
Eden 2026-10-08) as transcribed in research/notes/brain-calculation.md:
  - an obligation counts when MORE than 18 months are left, or its end is unknown;
  - rent counts whatever is left on the lease when it goes on after the purchase,
    and not at all when it stops (they move into the home bought);
  - an existing mortgage: repaid → nothing; same property → added to the payment
    (if more than 18 months are left); another property → off the income;
  - the ratio = payment ÷ disposable income × 100.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot

HUNDREDTH = Decimal("0.01")
LINE = 18


def _plain(x):
    s = format(Decimal(x).quantize(HUNDREDTH, rounding=ROUND_HALF_UP), "f")
    s = s.rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def _amounts(text):
    text = str(text)
    return [Decimal(a) for a in text.split("|")] if text else []


def _sum(xs):
    total = Decimal(0)
    for x in xs:
        total += x
    return total


def _obligations(text):
    text = str(text)
    out = []
    if not text:
        return out
    for item in text.split("|"):
        parts = item.split(",")
        kind, monthly, months = parts[0], Decimal(parts[1]), parts[2]
        flag = parts[3] if len(parts) > 3 else ""
        out.append((kind, monthly, None if months == "-" else int(months), flag))
    return out


def _placement(ob):
    kind, _monthly, months, flag = ob
    if kind == "rent":
        return "income" if flag == "continues" else "none"
    if kind == "mortgage" and flag == "repaid":
        return "none"
    over = True if months is None else months > LINE
    if not over:
        return "none"
    if kind == "mortgage" and flag == "same_property":
        return "payment"
    return "income"


def _placed(text, where):
    return _sum(ob[1] for ob in _obligations(text) if _placement(ob) == where)


def payslip_net(i, _f=None):
    return str(agorot(Decimal(i["gross"]) - _sum(_amounts(i["mandatory"]))))


def net_to_pay(i, _f=None):
    return str(agorot(Decimal(i["net"]) - _sum(_amounts(i["other"]))))


def average(i, _f=None):
    xs = _amounts(i["amounts"])
    return str(agorot(_sum(xs) / len(xs)))


def annual_to_monthly(i, _f=None):
    return str(agorot(Decimal(i["annual"]) / 12))


def assessment_monthly(i, _f=None):
    xs = _amounts(i["annuals"])
    if i["method"] == "latest":
        return str(agorot(xs[-1] / 12))
    return str(agorot(_sum(xs) / (12 * len(xs))))


def placement(i, _f=None):
    return _placement(_obligations(i["obligation"])[0])


def deducted(i, _f=None):
    return str(agorot(_placed(i["obligations"], "income")))


def added(i, _f=None):
    return str(agorot(_placed(i["obligations"], "payment")))


def disposable(i, _f=None):
    return str(agorot(Decimal(i["recognised"]) - _placed(i["obligations"], "income")))


def ratio_payment(i, _f=None):
    return str(agorot(Decimal(i["new_payment"]) + _placed(i["obligations"], "payment")))


def ratio(i, _f=None):
    return _plain(Decimal(i["payment"]) / Decimal(i["disposable"]) * 100)


def ratio_from_parts(i, _f=None):
    disp = Decimal(i["recognised"]) - _placed(i["obligations"], "income")
    pay = Decimal(i["new_payment"]) + _placed(i["obligations"], "payment")
    return _plain(pay / disp * 100)


def months_until_drop(i, _f=None):
    return max(0, int(i["months_left"]) - LINE)


def qualifying_payment(i, _f=None):
    amount = Decimal(i["amount"])
    m = Decimal(i["rate_percent"]) / 1200
    if str(i.get("bullet", "")) == "yes":
        return str(agorot(amount * m))
    grace = int(i.get("grace_months", 0))
    left = int(i["months"]) - grace
    owed = amount
    if grace > 0 and i.get("grace") == "full":
        owed = amount * (1 + m) ** grace
    if i.get("method", "spitzer") == "spitzer":
        if m == 0:
            return str(agorot(owed / left))
        return str(agorot(owed * m / (1 - (1 + m) ** -left)))
    return str(agorot(owed / left + owed * m))


def payslip_table(i, _f=None):
    rows = []
    n = 1
    while f"gross_{n}" in i:
        gross = Decimal(i[f"gross_{n}"])
        mand = _sum(_amounts(i[f"mandatory_{n}"]))
        other = _sum(_amounts(i[f"other_{n}"]))
        rows.append(
            {
                "period": str(i[f"name_{n}"]),
                "gross": str(agorot(gross)),
                "mandatory": str(agorot(mand)),
                "net": str(agorot(gross - mand)),
                "other": str(agorot(other)),
                "net_to_pay": str(agorot(gross - mand - other)),
            }
        )
        n += 1
    return rows


def obligation_table(i, _f=None):
    rows = []
    for n, ob in enumerate(_obligations(i["obligations"]), start=1):
        where = _placement(ob)
        rows.append(
            {
                "period": str(i[f"name_{n}"]),
                "monthly": str(agorot(ob[1])),
                "months": "-" if ob[2] is None else ob[2],
                "counted": str(agorot(ob[1] if where == "income" else 0)),
                "placement": where,
            }
        )
    return rows


def ratio_table(i, _f=None):
    rows = []
    n = 1
    while f"recognised_{n}" in i:
        rec = Decimal(i[f"recognised_{n}"])
        obs = i[f"obligations_{n}"]
        disp = rec - _placed(obs, "income")
        pay = Decimal(i[f"new_payment_{n}"]) + _placed(obs, "payment")
        rows.append(
            {
                "period": str(i[f"name_{n}"]),
                "recognised": str(agorot(rec)),
                "deducted": str(agorot(_placed(obs, "income"))),
                "disposable": str(agorot(disp)),
                "payment": str(agorot(pay)),
                "ratio": _plain(pay / disp * 100),
            }
        )
        n += 1
    return rows


KINDS = {
    "aff_payslip_net": payslip_net,
    "aff_net_to_pay": net_to_pay,
    "aff_average": average,
    "aff_annual_to_monthly": annual_to_monthly,
    "aff_assessment_monthly": assessment_monthly,
    "aff_placement": placement,
    "aff_deducted": deducted,
    "aff_added": added,
    "aff_disposable": disposable,
    "aff_ratio_payment": ratio_payment,
    "aff_ratio": ratio,
    "aff_ratio_from_parts": ratio_from_parts,
    "aff_months_until_drop": months_until_drop,
    "aff_qualifying_payment": qualifying_payment,
    "aff_payslip_table": payslip_table,
    "aff_obligation_table": obligation_table,
    "aff_ratio_table": ratio_table,
}
