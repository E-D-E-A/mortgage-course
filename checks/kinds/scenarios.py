"""Independent checks for the three scenarios of lesson 8.10 (src/lib/calc/scenarios.ts). Fact kinds: scn_eval, scn_path.

Plain Python Decimal; nothing imported from src/. The shifts are rebuilt from the TEXT of the curves with the
forward-rate helpers of kinds/forecast.py (a Python re-derivation), and the cash flow comes from kinds/schedule.py.
For the Directive 451 scenario the file ALSO computes each track the other way - forecast.py's own per-track
forecast (rate blocks, spread, yearly inflation) - and refuses to answer if the two routes differ by an agora.

  forecast451  inflation[y] = yearly inflation from the two curves; prime shift[y] = 1-year forward anchor of year y+1
               minus the first; anchor shift[y] = forward anchor of the reset block y falls in minus the first block's
               (nominal curve for unlinked, real curve for linked), anchors to 2 decimals
  stress       the inputs stress_inflation, stress_prime_shift (from year 2), stress_anchor_shift
  macro        policy[y] (carrying the last), prime shift = policy[y] - policy[0]; anchor shift[y] = mean policy over the
               5 years from y minus the mean over years 1-5, to 2 decimals; inflation[y] from the table

scn_eval: flat mix inputs t{k}_* (no scenario fields) + scenario + curves/tables + measure (first, max, max_month, total, payment).
scn_path: `what` = prime (today's prime + the shift, per year) or inflation, for `years` years, as plain 2-decimal text.
"""
from decimal import ROUND_HALF_UP, Decimal

from kinds import engine
from kinds.forecast import anchors, curve_of, yearly_inflation

HUNDRED = Decimal(100)


def r2(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def plain(x):
    s = format(Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), "f")
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _carry(xs, y):
    return xs[min(y, len(xs) - 1)]


def scenario_arrays(i, years=30):
    sid = i["scenario"]
    if sid == "forecast451":
        nominal, real = curve_of(i["nominal"]), curve_of(i["real"])
        reset = int(i.get("reset_years", 5))
        infl = yearly_inflation(nominal, real, years)
        prime = anchors(nominal, 1, years)
        blocks = -(-years // reset)
        an, ar = anchors(nominal, reset, blocks), anchors(real, reset, blocks)
        return {
            "inflation": infl,
            "prime_shift": [p - prime[0] for p in prime],
            "anchor_shift": [an[y // reset] - an[0] for y in range(years)],
            "linked_anchor_shift": [ar[y // reset] - ar[0] for y in range(years)],
        }
    if sid == "stress":
        return {
            "inflation": [Decimal(i["stress_inflation"])],
            "prime_shift": [Decimal(0), Decimal(i["stress_prime_shift"])],
            "anchor_shift": [Decimal(i["stress_anchor_shift"])],
        }
    if sid == "macro":
        policy = [Decimal(x) for x in str(i["macro_policy"]).split(",")]
        infl = [Decimal(x) for x in str(i["macro_inflation"]).split(",")]
        first = sum((_carry(policy, k) for k in range(5)), Decimal(0)) / 5
        win = lambda y: sum((_carry(policy, y + k) for k in range(5)), Decimal(0)) / 5  # noqa: E731
        return {
            "inflation": [_carry(infl, y) for y in range(years)],
            "prime_shift": [_carry(policy, y) - policy[0] for y in range(years)],
            "anchor_shift": [r2(win(y) - first) for y in range(years)],
        }
    raise ValueError(sid)


def flat(i):
    j = {k: v for k, v in i.items() if k.startswith("t") and "_" in k or k == "tracks"}
    j["block_months"] = 12
    j["rounding"] = "statement"
    for name, values in scenario_arrays(i).items():
        for k, v in enumerate(values, start=1):
            j[f"{name}_{k}"] = str(v)
    return j


def _cross_check(i, j):
    """Directive 451: every track again through forecast.py's own per-track forecast; must agree exactly."""
    from kinds.forecast import track as fc_track

    _, tracks = engine.evaluate_flat(j)
    for k in range(1, int(i["tracks"]) + 1):
        other = fc_track({
            "kind": i[f"t{k}_kind"], "months": int(i[f"t{k}_months"]), "rate_percent": i[f"t{k}_rate"],
            "nominal": i["nominal"], "real": i["real"], "principal": i[f"t{k}_amount"], "reset_years": i.get("reset_years", 5),
        })
        mine = [r["payment"] for r in tracks[k - 1]["rows"]]
        if other is None or mine != other["payments"]:
            raise AssertionError(f"track {k}: the schedule route and the forecast route differ")


def scn_eval(i, _facts=None):
    j = flat(i)
    if i["scenario"] == "forecast451":
        _cross_check(i, j)
    return engine.measure(j, i["measure"], i.get("month"))


def scn_path(i, _facts=None):
    years = int(i["years"])
    a = scenario_arrays(i, max(years, 30))
    if i["what"] == "prime":
        today = Decimal(i["today"])
        shifts = a["prime_shift"]
        return [plain(today + _carry(shifts, y)) for y in range(years)]
    return [plain(_carry(a["inflation"], y)) for y in range(years)]


KINDS = {"scn_eval": scn_eval, "scn_path": scn_path}
