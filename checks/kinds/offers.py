"""Independent checks for offers, the uniform baskets and the comparison measures
(lessons 5.1-5.3). Every fact kind here starts with off_.

Plain Python Decimal and Fraction; nothing is imported from src/lib/calc. The
schedule of each track (statement rounding, a level payment reset whenever the
rate changes, a linked track indexed before each payment) and the IRR (Newton's
method) come from checks/kinds/metrics.py, which already rebuilds them by its own
route; what is rebuilt here, from the text forms in the facts' inputs, is
everything that is new in offers.ts:

- the three uniform baskets as exact fractions of the loan, and the refusal to
  split a loan that does not divide;
- how an offer's tracks are built from a forecast: prime's rate is the prime
  anchor of the year plus the margin; a variable track's is its anchor of the
  reset plus the margin; a fixed track keeps its contract rate; a linked track
  is indexed by the forecast's flat inflation;
- the measures: the loan, the loan less A, the first and the highest payment
  and its month, the total of the payments, the monthly IRR and the expected
  total rate ((1 + IRR)^12 - 1) x 100;
- when two offers are on the same basis (amount, mix, month, forecast), and
  which offer is lowest on a measure.

Text forms (the facts' inputs):
  offer      "name#month#forecast#A#kind:amount:months:rate-or-margin[:reset];..."
  forecasts  "id@@prime=a,b|vlinked=a,b|vunlinked=a,b|infl=x;;id@@..."
"""
from decimal import ROUND_HALF_UP, Decimal
from fractions import Fraction

from kinds.common import agorot
from kinds.metrics import _irr, _payments

ONE = Decimal(1)
HUNDRED = Decimal(100)
FIXED = ("fixed_unlinked", "fixed_linked")
LINKED = ("fixed_linked", "variable_linked")
PRIME_BLOCK = 12
DEFAULT_RESET = 60

# Appendix 5 as the team transcribed it: (kind, numerator, denominator).
BASKETS = {
    "uniform_1": [("fixed_unlinked", 1, 1)],
    "uniform_2": [("fixed_unlinked", 1, 3), ("prime", 1, 3), ("variable_linked", 1, 3)],
    "uniform_3": [("fixed_unlinked", 1, 2), ("prime", 1, 2)],
}


def _plain(x, decimals):
    q = Decimal(1).scaleb(-decimals)
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _money(x):
    return str(agorot(x))


def _forecasts(code):
    out = {}
    for part in str(code).split(";;"):
        fid, body = part.split("@@")
        f = dict(item.split("=") for item in body.split("|"))
        out[fid] = {
            "prime": f["prime"].split(","),
            "vlinked": f["vlinked"].split(","),
            "vunlinked": f["vunlinked"].split(","),
            "infl": f["infl"],
        }
    return out


def _offer(pack):
    name, month, forecast, upfront, code = str(pack).split("#")
    tracks = []
    for part in code.split(";"):
        fields = part.split(":")
        kind, amount, months, value = fields[:4]
        reset = int(fields[4]) if len(fields) > 4 else None
        tracks.append({"kind": kind, "amount": Decimal(amount), "months": int(months), "value": value, "reset": reset})
    return {"name": name, "month": month, "forecast": forecast, "upfront": Decimal(upfront), "tracks": tracks}


def _block(t):
    if t["kind"] == "prime":
        return PRIME_BLOCK
    if t["kind"] in FIXED:
        return None
    return t["reset"] or DEFAULT_RESET


def _met_track(t, f):
    """The track in metrics.py's text form: method|principal|rates|block|months|inflation|grace|rounding."""
    infl = f["infl"] if t["kind"] in LINKED else "0"
    if t["kind"] in FIXED:
        rates, block = [t["value"]], t["months"]
    else:
        anchors = {"prime": f["prime"], "variable_linked": f["vlinked"], "variable_unlinked": f["vunlinked"]}[t["kind"]]
        rates, block = [str(Decimal(a) + Decimal(t["value"])) for a in anchors], _block(t)
    return "|".join(["spitzer", str(t["amount"]), ",".join(rates), str(block), str(t["months"]), infl, "0", "statement"])


def _measures(pack, forecasts):
    o = _offer(pack)
    f = _forecasts(forecasts)[o["forecast"]]
    met = [_met_track(t, f) for t in o["tracks"]]
    pays = _payments(";".join(met))
    loan = sum((t["amount"] for t in o["tracks"]), Decimal(0))
    received = loan - o["upfront"]
    irr = _irr(pays, received)
    best = max(range(len(pays)), key=lambda k: (pays[k], -k))
    return {
        "loan": loan,
        "received": received,
        "first": pays[0],
        "highest": pays[best],
        "highest_month": best + 1,
        "total": sum(pays, Decimal(0)),
        "irr_monthly": irr,
        "rate": ((ONE + irr / HUNDRED) ** 12 - ONE) * HUNDRED,
    }


def measure(i, facts):
    m = _measures(i["offer"], i["forecasts"])
    which = i["measure"]
    if which == "highest_month":
        return m["highest_month"]
    if which in ("irr_monthly", "rate"):
        return _plain(m[which], int(i["decimals"]))
    return _money(m[which])


def split(i, facts):
    loan = Decimal(i["loan"]) * 100
    out = []
    for kind, num, den in BASKETS[i["basket"]]:
        if (loan * num) % den != 0:
            raise ValueError("the loan does not divide exactly")
        out.append({"kind": kind, "amount": _money(loan * num / den / 100)})
    return out


def part(i, facts):
    """One part of a basket: the amount of the first part of that kind."""
    for kind, num, den in BASKETS[i["basket"]]:
        if kind == i["kind"]:
            loan = Decimal(i["loan"]) * 100
            if (loan * num) % den != 0:
                raise ValueError("the loan does not divide exactly")
            return _money(loan * num / den / 100)
    raise ValueError("no such part")


def percent_of(i, facts):
    """A rounded percent of a loan, the way a person would write it: loan x percent / 100 (the 33% slip)."""
    return _money(Decimal(i["loan"]) * Decimal(i["percent"]) / HUNDRED)


def can_split(i, facts):
    loan = Decimal(i["loan"]) * 100
    return all((loan * num) % den == 0 for _, num, den in BASKETS[i["basket"]])


def track_rows(i, facts):
    """One row per track: its kind, amount, term, rate on the day of issue and its first payment."""
    o = _offer(i["offer"])
    f = _forecasts(i["forecasts"])[o["forecast"]]
    rows = []
    for t in o["tracks"]:
        met = _met_track(t, f)
        rate = met.split("|")[2].split(",")[0]
        rows.append(
            {
                "kind": t["kind"],
                "amount": _money(t["amount"]),
                "months": t["months"],
                "rate": _plain(rate, 4),
                "first": _money(_payments(met)[0]),
            }
        )
    return rows


def rate_path(i, facts):
    """A track's rate at the start of each of its first `count` blocks (the last carries on)."""
    o = _offer(i["offer"])
    f = _forecasts(i["forecasts"])[o["forecast"]]
    t = o["tracks"][int(i["track"])]
    rates = _met_track(t, f).split("|")[2].split(",")
    return [_plain(rates[min(k, len(rates) - 1)], 4) for k in range(int(i["count"]))]


def _signature(o):
    loan = sum((t["amount"] for t in o["tracks"]), Decimal(0))
    parts = []
    for t in o["tracks"]:
        share = Fraction(int(t["amount"] * 100), int(loan * 100))
        parts.append(f"{t['kind']}:{share.numerator}/{share.denominator}:{t['months']}:{_block(t) or 0}")
    return ";".join(sorted(parts))


def _differences(packs):
    offers = [_offer(p) for p in str(packs).split(" | ")]
    keys = [
        ("amount", lambda o: sum((t["amount"] for t in o["tracks"]), Decimal(0))),
        ("mix", _signature),
        ("month", lambda o: o["month"]),
        ("forecast", lambda o: o["forecast"]),
    ]
    if len(offers) < 2:
        return []
    return [name for name, get in keys if any(get(o) != get(offers[0]) for o in offers)]


def basis(i, facts):
    return _differences(i["offers"])


def lowest(i, facts):
    """The names of the lowest offers on a measure; a tie is judged at 0.005."""
    packs = str(i["offers"]).split(" | ")
    key = {"rate": "rate", "total": "total", "highest": "highest"}[i["measure"]]
    values = [_measures(p, i["forecasts"])[key] for p in packs]
    low = min(values)
    return [_offer(p)["name"] for p, v in zip(packs, values) if abs(v - low) <= Decimal("0.005")]


KINDS = {
    "off_measure": measure,
    "off_split": split,
    "off_can_split": can_split,
    "off_part": part,
    "off_percent_of": percent_of,
    "off_track_rows": track_rows,
    "off_rate_path": rate_path,
    "off_basis": basis,
    "off_lowest": lowest,
}
