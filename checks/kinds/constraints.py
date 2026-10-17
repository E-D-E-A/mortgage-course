"""Independent checks for lesson 8.7 (src/lib/calc/constraints.ts): the hard constraints on a candidate and every
reason it is rejected. Plain Python Decimal; nothing imported from src/.

A candidate travels in a fact's inputs as one text, fields separated by ";":
  price=…;equity=…;avail=…;incomes=a,b;obl=monthly:monthsLeft,…  (empty: none; monthsLeft "-" = unknown);
  max=… (or "-");target=… (or "-");bank=ratioMax:ltvMax:kind=rate,kind=rate,…  (or "-");
  tracks=kind:amount:rate:months,…
Rules, restated here from the lessons' sources (not copied from the TypeScript): financing ceiling 75% (only home), payment
ratio ceiling 50, variable part at most two thirds (a track is variable unless its kind starts with "fixed"), term at most
360 months; an obligation counts against the income when more than 18 months are left (unknown counts); the payment is each
track's first Spitzer payment on its full amount, added; the bank's ratio is measured with the tracks at the bank's LIST
rates; "over" is strict.
"""
from decimal import Decimal, getcontext

from kinds.stats import _plain

getcontext().prec = 60
ORDER = ["sum_equals_loan", "positive_tracks", "equity_available", "ltv", "pti", "variable_share", "term",
         "bank_ratio", "bank_ltv", "client_max_payment", "client_target_ratio"]


def _parse(text):
    d = dict(p.split("=", 1) for p in str(text).split(";"))
    c = {"price": Decimal(d["price"]), "equity": Decimal(d["equity"]), "avail": Decimal(d["avail"]),
         "incomes": [Decimal(x) for x in d["incomes"].split(",")]}
    c["obl"] = [] if d["obl"] == "" else [(Decimal(o.split(":")[0]), None if o.split(":")[1] == "-" else int(o.split(":")[1])) for o in d["obl"].split(",")]
    c["max"] = None if d["max"] == "-" else Decimal(d["max"])
    c["target"] = None if d["target"] == "-" else Decimal(d["target"])
    if d["bank"] == "-":
        c["bank"] = None
    else:
        rm, lm, prices = d["bank"].split(":")
        c["bank"] = (Decimal(rm), Decimal(lm), {k: Decimal(v) for k, v in (p.split("=") for p in prices.split(","))})
    c["tracks"] = [(t.split(":")[0], Decimal(t.split(":")[1]), Decimal(t.split(":")[2]), int(t.split(":")[3])) for t in d["tracks"].split(",")]
    return c


def _pay(amount, rate, months):
    m = rate / 1200
    return amount / months if m == 0 else amount * m / (1 - (1 + m) ** -months)


def _numbers(c):
    loan = sum((t[1] for t in c["tracks"]), Decimal(0))
    disp = sum(c["incomes"], Decimal(0)) - sum((m for m, left in c["obl"] if left is None or left > 18), Decimal(0))
    pay = sum((_pay(t[1], t[2], t[3]) for t in c["tracks"]), Decimal(0))
    var = sum((t[1] for t in c["tracks"] if not t[0].startswith("fixed")), Decimal(0))
    return loan, disp, pay, var


FAMILY = {"sum_equals_loan": "identity", "positive_tracks": "identity", "equity_available": "client", "ltv": "law", "pti": "law",
          "variable_share": "law", "term": "law", "bank_ratio": "bank", "bank_ltv": "bank", "client_max_payment": "client",
          "client_target_ratio": "client"}


def _fails(c):
    loan, disp, pay, var = _numbers(c)
    out = []
    if sum((t[1] for t in c["tracks"]), Decimal(0)) != c["price"] - c["equity"]:
        out.append("sum_equals_loan")
    if any(t[1] <= 0 or t[3] < 1 for t in c["tracks"]):
        out.append("positive_tracks")
    if c["equity"] > c["avail"]:
        out.append("equity_available")
    ratio = pay / disp * 100 if disp > 0 else None
    if loan / c["price"] * 100 > 75:
        out.append("ltv")
    if ratio is None or ratio > 50:
        out.append("pti")
    if var * 3 > loan * 2:
        out.append("variable_share")
    if max(t[3] for t in c["tracks"]) > 360:
        out.append("term")
    if c["bank"]:
        rm, lm, prices = c["bank"]
        listed = sum((_pay(t[1], prices[t[0]], t[3]) for t in c["tracks"]), Decimal(0))
        lratio = listed / disp * 100 if disp > 0 else None
        if lratio is None or lratio > rm:
            out.append("bank_ratio")
        if loan / c["price"] * 100 > lm:
            out.append("bank_ltv")
    if c["max"] is not None and pay > c["max"]:
        out.append("client_max_payment")
    if c["target"] is not None and (ratio is None or ratio > c["target"]):
        out.append("client_target_ratio")
    return out


def reasons(i, _f=None):
    return ",".join(_fails(_parse(i["candidate"])))


def count_feasible(i, _f=None):
    """How many candidates fail none of the constraints of the listed families (default: all four)."""
    fams = set(str(i.get("families", "identity,law,bank,client")).split(","))
    return sum(1 for text in str(i["candidates"]).split("|") if not [r for r in _fails(_parse(text)) if FAMILY[r] in fams])


def measure(i, _f=None):
    c = _parse(i["candidate"])
    loan, disp, pay, var = _numbers(c)
    part = i["part"]
    v = {"loan": loan, "ltv": loan / c["price"] * 100, "disposable": disp, "payment": pay,
         "ratio": pay / disp * 100, "variable_percent": var / loan * 100}[part]
    return _plain(v, i["decimals"])


KINDS = {"cons_reasons": reasons, "cons_feasible_count": count_feasible, "cons_measure": measure}
