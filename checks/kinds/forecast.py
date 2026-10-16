"""Independent checks for the Directive 451 forecast from zero curves (lessons 5.4, 5.5).

Every fact kind here starts with fcast_. Plain Python Decimal (50 digits); nothing
is shared with src/lib/calc/forecast.ts. The only borrowed piece is the schedule
engine of checks/kinds/schedule.py (run_statement), itself a Python re-derivation
of the statement convention that shares no code with src/.

A curve is passed in the fact's inputs as a string of 30 zero yields in percent,
comma-separated: the first is the yield for 1 year, the last for 30 years.

The rules rebuilt here (the same as the TypeScript's header says):
- forward rate between two lengths S < L (years):
  ((1 + y_L)^L / (1 + y_S)^S)^(1 / (L - S)) - 1, and from S = 0 it is y_L;
- expected inflation for one length: (1 + nominal) / (1 + real) - 1, never the
  plain difference;
- the expected index after T years: ((1 + nominal_T) / (1 + real_T))^T, and the
  inflation expected in year y is E(y) / E(y - 1) - 1, rounded to 2 decimals;
- a variable track resetting every V years has today's anchor (the curve at V,
  rounded to 2 decimals) in block 0 and the forward rate from b*V to (b+1)*V,
  rounded to 2 decimals, in block b; its rate is the anchor plus the spread
  (today's rate - today's anchor); prime is the same with V = 1 on the nominal
  curve; a variable linked track uses the real curve; fixed tracks keep their
  rate; a linked track's index moves by each year's inflation at an even monthly
  pace (the twelfth root); foreign-currency and other tracks have no forecast.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds.common import agorot
from kinds.schedule import run_statement

ONE = Decimal(1)
HUNDRED = Decimal(100)
TWELVE = Decimal(12)


def plain(x, decimals):
    """Rounded half away from zero, trailing zeros dropped: 4.4872 -> '4.4872'; 5.00 -> '5'."""
    q = Decimal(1).scaleb(-decimals)
    s = format(Decimal(x).quantize(q, rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def r2(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def curve_of(text):
    return [Decimal(v) for v in str(text).split(",")]


def g(percent):
    return ONE + Decimal(percent) / HUNDRED


def forward(curve, short, long):
    """The yearly rate (percent) the curve implies between `short` and `long` years."""
    top = g(curve[long - 1]) ** long
    bottom = g(curve[short - 1]) ** short if short else ONE
    return ((top / bottom) ** (ONE / (long - short)) - ONE) * HUNDRED


def inflation(nominal, real):
    return (g(nominal) / g(real) - ONE) * HUNDRED


def index_after(nominal_curve, real_curve, years):
    if years == 0:
        return ONE
    return (g(nominal_curve[years - 1]) / g(real_curve[years - 1])) ** years


def forward_inflation(nominal_curve, real_curve, start, end):
    ratio = index_after(nominal_curve, real_curve, end) / index_after(nominal_curve, real_curve, start)
    return (ratio ** (ONE / (end - start)) - ONE) * HUNDRED


def yearly_inflation(nominal_curve, real_curve, years):
    return [r2(forward_inflation(nominal_curve, real_curve, y - 1, y)) for y in range(1, years + 1)]


def anchors(curve, reset_years, blocks):
    return [r2(curve[reset_years - 1]) if b == 0 else r2(forward(curve, b * reset_years, (b + 1) * reset_years)) for b in range(blocks)]


# ---------------------------------------------------------------------------
# Single numbers
# ---------------------------------------------------------------------------


def fc_curve_point(i, _facts=None):
    return plain(curve_of(i["curve"])[int(i["years"]) - 1], 4)


def fc_forward(i, _facts=None):
    return plain(forward(curve_of(i["curve"]), int(i["from_years"]), int(i["to_years"])), int(i["decimals"]))


def fc_forward_yields(i, _facts=None):
    short, long = int(i["short_years"]), int(i["long_years"])
    top = g(i["long_percent"]) ** long
    bottom = g(i["short_percent"]) ** short if short else ONE
    return plain(((top / bottom) ** (ONE / (long - short)) - ONE) * HUNDRED, int(i["decimals"]))


def fc_growth(i, _facts=None):
    """(1 + y)^years as a factor, for the lesson's step-by-step lines."""
    return plain(g(i["percent"]) ** int(i["years"]), int(i["decimals"]))


def fc_factor(i, _facts=None):
    """1 + percent / 100 as a factor."""
    return plain(g(i["percent"]), int(i["decimals"]))


def fc_growth_ratio(i, _facts=None):
    """(1 + long)^L divided by (1 + short)^S, as a factor."""
    top = g(i["long_percent"]) ** int(i["long_years"])
    bottom = g(i["short_percent"]) ** int(i["short_years"])
    return plain(top / bottom, int(i["decimals"]))


def fc_inflation(i, _facts=None):
    return plain(inflation(i["nominal_percent"], i["real_percent"]), int(i["decimals"]))


def fc_gap_points(i, _facts=None):
    return plain(Decimal(i["nominal_percent"]) - Decimal(i["real_percent"]), int(i["decimals"]))


def fc_gap_error(i, _facts=None):
    """Plain difference minus the compounded gap, in percentage points: what the shortcut gets wrong."""
    simple = Decimal(i["nominal_percent"]) - Decimal(i["real_percent"])
    return plain(simple - inflation(i["nominal_percent"], i["real_percent"]), int(i["decimals"]))


def fc_inflation_at(i, _facts=None):
    n, r = curve_of(i["nominal"]), curve_of(i["real"])
    y = int(i["years"])
    return plain(inflation(n[y - 1], r[y - 1]), int(i["decimals"]))


def fc_index(i, _facts=None):
    return plain(index_after(curve_of(i["nominal"]), curve_of(i["real"]), int(i["years"])), int(i["decimals"]))


def fc_index_simple(i, _facts=None):
    """The index after `years` if the yearly inflation were the plain difference nominal - real."""
    n, r = curve_of(i["nominal"]), curve_of(i["real"])
    y = int(i["years"])
    return plain(g(n[y - 1] - r[y - 1]) ** y, int(i["decimals"]))


def fc_index_gap_percent(i, _facts=None):
    """By how many percent the shortcut's index is above the compounded one after `years` years."""
    n, r = curve_of(i["nominal"]), curve_of(i["real"])
    y = int(i["years"])
    exact = (g(n[y - 1]) / g(r[y - 1])) ** y
    simple = g(n[y - 1] - r[y - 1]) ** y
    return plain((simple / exact - ONE) * HUNDRED, int(i["decimals"]))


def fc_inflation_forward(i, _facts=None):
    n, r = curve_of(i["nominal"]), curve_of(i["real"])
    return plain(forward_inflation(n, r, int(i["from_years"]), int(i["to_years"])), int(i["decimals"]))


def fc_yearly_inflation(i, _facts=None):
    n, r = curve_of(i["nominal"]), curve_of(i["real"])
    return [plain(x, 2) for x in yearly_inflation(n, r, int(i["years"]))]


def fc_anchors(i, _facts=None):
    return [plain(x, 2) for x in anchors(curve_of(i["curve"]), int(i["reset_years"]), int(i["blocks"]))]


def fc_points(i, _facts=None):
    a, b = Decimal(str(_facts[i["a"]]["value"])), Decimal(str(_facts[i["b"]]["value"]))
    return plain(a - b if i["op"] == "minus" else a + b, int(i["decimals"]))


def fc_money_share(i, _facts=None):
    """part / whole x 100 for two money facts, rounded."""
    part, whole = Decimal(_facts[i["part"]]["value"]), Decimal(_facts[i["whole"]]["value"])
    return plain(part / whole * HUNDRED, int(i["decimals"]))


# ---------------------------------------------------------------------------
# A forecast track
# ---------------------------------------------------------------------------


def track(i):
    """Rates per block, the inflation per year and the payment of every month, from the fact's inputs."""
    kind = i["kind"]
    months = int(i["months"])
    if kind in ("fx", "other"):
        return None
    nominal, real = curve_of(i["nominal"]), curve_of(i["real"])
    rate0 = Decimal(str(i["rate_percent"]))
    linked = kind in ("fixed_linked", "variable_linked")
    curve = nominal if kind in ("prime", "variable_unlinked") else real if kind == "variable_linked" else None
    reset = 1 if kind == "prime" else int(i.get("reset_years") or 5) if curve is not None else None
    block_months = reset * 12 if reset else months
    count = -(-months // block_months)
    blocks = [{"anchor": None, "rate": rate0}]
    spread = None
    if curve is not None:
        a = anchors(curve, reset, count)
        spread = rate0 - a[0]
        blocks = [{"anchor": a[0], "rate": rate0}] + [{"anchor": a[b], "rate": a[b] + spread} for b in range(1, count)]
    years = -(-months // 12)
    infl = yearly_inflation(nominal, real, years) if linked else None
    rates = [blocks[min(t // block_months, len(blocks) - 1)]["rate"] for t in range(months)]
    factors = [(ONE + infl[t // 12] / HUNDRED) ** (ONE / TWELVE) for t in range(months)] if infl else None
    rows = run_statement(i["principal"], rates, factors, "spitzer")
    pays = [r["payment"] for r in rows]
    return {"blocks": blocks, "block_months": block_months, "spread": spread, "inflation": infl, "payments": pays}


def fc_spread(i, _facts=None):
    return plain(track(i)["spread"], 2)


def fc_rate_blocks(i, _facts=None):
    t = track(i)
    out = []
    for b, blk in enumerate(t["blocks"]):
        out.append({
            "block": b + 1,
            "from_month": b * t["block_months"] + 1,
            "to_month": min((b + 1) * t["block_months"], int(i["months"])),
            "anchor": None if blk["anchor"] is None else plain(blk["anchor"], 2),
            "rate": plain(blk["rate"], 2),
        })
    return out


def fc_payment(i, _facts=None):
    return str(agorot(track(i)["payments"][int(i["month"]) - 1]))


def fc_first(i, _facts=None):
    return str(agorot(track(i)["payments"][0]))


def fc_highest(i, _facts=None):
    return str(agorot(max(agorot(p) for p in track(i)["payments"])))


def fc_highest_month(i, _facts=None):
    pays = [agorot(p) for p in track(i)["payments"]]
    return pays.index(max(pays)) + 1


def fc_total(i, _facts=None):
    return str(agorot(sum(track(i)["payments"])))


def fc_path_rows(i, _facts=None):
    pays = track(i)["payments"]
    return [{"month": int(m), "payment": str(agorot(pays[int(m) - 1]))} for m in str(i["months_list"]).split(",")]


def fc_has_forecast(i, _facts=None):
    return track(i) is not None


# ---------------------------------------------------------------------------
# Lesson 5.5: averages and what they hide
# ---------------------------------------------------------------------------


def fc_average(i, _facts=None):
    rates = [Decimal(r) for r in str(i["rates"]).split(",")]
    return plain(sum(rates) / len(rates), int(i["decimals"]))


def fc_weighted_average(i, _facts=None):
    rates = [Decimal(r) for r in str(i["rates"]).split(",")]
    amounts = [Decimal(a) for a in str(i["amounts"]).split(",")]
    return plain(sum(r * a for r, a in zip(rates, amounts)) / sum(amounts), int(i["decimals"]))


def fc_count_below(i, _facts=None):
    rates = [Decimal(r) for r in str(i["rates"]).split(",")]
    limit = Decimal(str(_facts[i["than"]]["value"]))
    return sum(1 for r in rates if r < limit)


def fc_count(i, _facts=None):
    return len(str(i["rates"]).split(","))


KINDS = {
    "fcast_curve_point": fc_curve_point,
    "fcast_forward": fc_forward,
    "fcast_forward_yields": fc_forward_yields,
    "fcast_growth": fc_growth,
    "fcast_factor": fc_factor,
    "fcast_growth_ratio": fc_growth_ratio,
    "fcast_inflation": fc_inflation,
    "fcast_gap_points": fc_gap_points,
    "fcast_gap_error": fc_gap_error,
    "fcast_inflation_at": fc_inflation_at,
    "fcast_index": fc_index,
    "fcast_index_simple": fc_index_simple,
    "fcast_index_gap_percent": fc_index_gap_percent,
    "fcast_inflation_forward": fc_inflation_forward,
    "fcast_yearly_inflation": fc_yearly_inflation,
    "fcast_anchors": fc_anchors,
    "fcast_points": fc_points,
    "fcast_money_share": fc_money_share,
    "fcast_spread": fc_spread,
    "fcast_rate_blocks": fc_rate_blocks,
    "fcast_payment": fc_payment,
    "fcast_first": fc_first,
    "fcast_highest": fc_highest,
    "fcast_highest_month": fc_highest_month,
    "fcast_total": fc_total,
    "fcast_path_rows": fc_path_rows,
    "fcast_has_forecast": fc_has_forecast,
    "fcast_average": fc_average,
    "fcast_weighted_average": fc_weighted_average,
    "fcast_count_below": fc_count_below,
    "fcast_count": fc_count,
}
