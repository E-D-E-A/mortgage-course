"""Sketch of the three course cases' opening figures (course map, step 2).

Inputs are teaching assumptions, not market data. The final case data files
are generated in step 3/4 by the course's calculation module; this script
only checks that each case starts where the course map says it does.
"""
from decimal import Decimal, ROUND_HALF_UP, getcontext

getcontext().prec = 28


def spitzer(principal, annual_rate_pct, months):
    """Monthly payment: annual nominal rate / 12, as banks do (Brain ENG-223 research)."""
    r = Decimal(annual_rate_pct) / Decimal(100) / Decimal(12)
    if r == 0:
        return Decimal(principal) / months
    f = (1 + r) ** months
    return Decimal(principal) * r * f / (f - 1)


def money(x):
    return Decimal(x).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def report(name, price, equity, tracks, net_incomes, obligations_over_18m):
    loan = sum(t[0] for t in tracks)
    ltv = Decimal(loan) / Decimal(price) * 100
    pay = sum(spitzer(*t) for t in tracks)
    disposable = sum(net_incomes) - sum(obligations_over_18m)
    pti = pay / disposable * 100
    print(f"{name}: price {price:,} equity {equity:,} loan {loan:,} "
          f"LTV {ltv:.1f}% payment {money(pay):,} disposable {disposable:,} PTI {pti:.1f}%")


# Case A (main): young couple, first home, sits on the edge (LTV ~75%, PTI ~40%).
report("A", 2_200_000, 560_000,
       [(546_000, "4.60", 360), (547_000, "4.10", 360), (547_000, "4.40", 360)],
       [12_400, 9_300], [1_450])

# Case B: self-employed with a salaried spouse; recognised income is the open question.
report("B", 1_650_000, 520_000,
       [(565_000, "4.60", 300), (565_000, "4.10", 300)],
       [11_000, 8_200], [0])

# Case C: refinance of a 2023 fixed unlinked loan (the Brain's worked example loan)
# plus a top-up on the same property.
print("C: existing 700,000 @5.90% 240m payment", money(spitzer(700_000, "5.90", 240)))
