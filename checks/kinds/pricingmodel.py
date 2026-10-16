"""Independent checks for the small pricing model (lessons 8.17-8.21). Fact kinds start with pm_.

Plain Python Decimal; nothing is imported from src/. The model is written again from its rule:

  margin = base + step(financing ratio) + step(payment ratio)
  a step table "40:0.10;60:0.35" adds the amount of the HIGHEST threshold the value is strictly above
  (0 when above none); rate = anchor + margin; everything in percent, two decimals, half up.

  pm_margin    margin for ltv, pti
  pm_rate      anchor + margin
  pm_stepsize  what a step table adds going from `frm` to `to`
  pm_whatif    {before, after, change} when the deal changes (ltv and/or pti replaced)
  pm_offers    n synthetic offers from the seeded generator: ltv, pti, noise drawn in that order
  pm_fit       mean absolute error of a model against a list of offers (a generated set)

Model inputs: base, ltv_steps, pti_steps. The random source is kinds.rng (the course's one tiny generator,
written in Python from its definition), and every draw is "a whole number below n".
"""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40


def two(x):
    r = Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return "0.00" if r == 0 else format(r, "f")


def steps(text):
    if not text:
        return []
    return [(Decimal(a), Decimal(b)) for a, b in (p.split(":") for p in str(text).split(";"))]


def step_at(table, v):
    v = Decimal(str(v))
    add = Decimal(0)
    for above, amount in table:
        if v > above:
            add = amount
    return add


def margin(i, ltv, pti):
    return Decimal(str(i["base"])) + step_at(steps(i["ltv_steps"]), ltv) + step_at(steps(i["pti_steps"]), pti)


def pm_margin(i, _facts=None):
    return two(margin(i, i["ltv"], i["pti"]))


def pm_rate(i, _facts=None):
    return two(Decimal(str(i["anchor"])) + margin(i, i["ltv"], i["pti"]))


def pm_stepsize(i, _facts=None):
    t = steps(i["steps"])
    return two(step_at(t, i["to"]) - step_at(t, i["frm"]))


def pm_whatif(i, _facts=None):
    anchor = Decimal(str(i["anchor"]))
    ltv, pti = i["ltv"], i["pti"]
    ltv2 = i.get("new_ltv", ltv)
    pti2 = i.get("new_pti", pti)
    b, a = margin(i, ltv, pti), margin(i, ltv2, pti2)
    return {
        "before": {"margin": two(b), "rate": two(anchor + b)},
        "after": {"margin": two(a), "rate": two(anchor + a)},
        "change": two(Decimal(two(a)) - Decimal(two(b))),
    }


def offers(i):
    from kinds import rng

    r = rng.Rng(int(i["seed"]))
    lo_l, hi_l = int(i.get("ltv_lo", 30)), int(i.get("ltv_hi", 75))
    lo_p, hi_p = int(i.get("pti_lo", 20)), int(i.get("pti_hi", 50))
    noise_bp = int(i["noise_bp"])
    out = []
    for _ in range(int(i["n"])):
        ltv = lo_l + r.below(hi_l - lo_l + 1)
        pti = lo_p + r.below(hi_p - lo_p + 1)
        noise = r.below(2 * noise_bp + 1) - noise_bp
        out.append({"ltv": str(ltv), "pti": str(pti), "margin": two(Decimal(two(margin(i, ltv, pti))) + Decimal(noise) / 100)})
    return out


def pm_offers(i, _facts=None):
    return offers(i)


def pm_fit(i, _facts=None):
    data = offers(i)
    total = sum((abs(Decimal(two(margin(i, o["ltv"], o["pti"]))) - Decimal(o["margin"])) for o in data), Decimal(0))
    return format((total / len(data)).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP), "f")


KINDS = {
    "pm_margin": pm_margin,
    "pm_rate": pm_rate,
    "pm_stepsize": pm_stepsize,
    "pm_whatif": pm_whatif,
    "pm_offers": pm_offers,
    "pm_fit": pm_fit,
}
