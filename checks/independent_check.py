"""Independent check of every number in data/lessons/*.json.

Recomputes each fact from its stated inputs with Python's own Decimal
arithmetic, sharing no code with the TypeScript module that produced it
(src/lib/calc). A mismatch fails the run.

Run: pnpm check:python   (python3 -I checks/independent_check.py)
"""
import json
import math
import sys
from decimal import ROUND_HALF_UP, Decimal, getcontext
from pathlib import Path

getcontext().prec = 50
AGORA = Decimal("0.01")
ROOT = Path(__file__).resolve().parent.parent


def agorot(x):
    return Decimal(x).quantize(AGORA, rounding=ROUND_HALF_UP)


def growth(rate_percent):
    return 1 + Decimal(rate_percent) / 100


def compound_balance(i):
    return agorot(Decimal(i["principal"]) * growth(i["rate_percent"]) ** int(i["periods"]))


def simple_balance(i):
    r = Decimal(i["rate_percent"]) / 100
    return agorot(Decimal(i["principal"]) * (1 + r * int(i["periods"])))


def compound_table(i):
    # Statement convention: each period's interest rounded to the agora, then added.
    p = Decimal(i["principal"])
    r = Decimal(i["rate_percent"]) / 100
    rows, balance = [], p
    for period in range(1, int(i["periods"]) + 1):
        interest = agorot(balance * r)
        rows.append({
            "period": period,
            "opening": str(agorot(balance)),
            "interest": str(interest),
            "interest_on_principal": str(agorot(p * r)),
            "interest_on_interest": str(agorot(interest - p * r)),
            "closing": str(agorot(balance + interest)),
        })
        balance += interest
    return rows


def growth_series(i):
    return [
        {
            "period": n,
            "compound": str(compound_balance({**i, "periods": n})),
            "simple": str(simple_balance({**i, "periods": n})),
        }
        for n in range(int(i["periods"]) + 1)
    ]


def periods_to_double(i):
    # Independent route: logarithms, then confirm the whole-number boundary exactly.
    g = growth(i["rate_percent"])
    n = math.ceil(math.log(2) / math.log(float(g)))
    while g ** n < 2:
        n += 1
    while n > 1 and g ** (n - 1) >= 2:
        n -= 1
    return n


def check_lesson(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    facts = {f["id"]: f for f in data["facts"]}
    failures = []
    for f in data["facts"]:
        kind, i, value = f["kind"], f["inputs"], f["value"]
        if kind == "compound_balance":
            expected = str(compound_balance(i))
        elif kind == "simple_balance":
            expected = str(simple_balance(i))
        elif kind == "compound_table":
            expected = compound_table(i)
        elif kind == "growth_series":
            expected = growth_series(i)
        elif kind == "difference":
            minuend, subtrahend = facts[i["minuend"]], facts[i["subtrahend"]]
            expected = str(agorot(Decimal(minuend["value"]) - Decimal(subtrahend["value"])))
        elif kind == "rule_of_72":
            expected = str(Decimal(72) / Decimal(i["rate_percent"])).rstrip("0").rstrip(".")
        elif kind == "exact_doubling":
            exact = Decimal(2).ln() / growth(i["rate_percent"]).ln()
            expected = str(exact.quantize(AGORA, rounding=ROUND_HALF_UP))
        elif kind == "periods_to_double":
            expected = periods_to_double(i)
        elif kind == "given":
            continue
        else:
            failures.append(f"{f['id']}: no independent check for kind '{kind}'")
            continue
        if expected != value:
            failures.append(f"{f['id']}: data says {value!r}, independent check says {expected!r}")
    return data["lesson"], len(data["facts"]), failures


def main():
    files = sorted((ROOT / "data" / "lessons").glob("*.json"))
    if not files:
        print("no data files; run pnpm data first")
        return 1
    bad = 0
    for path in files:
        lesson, count, failures = check_lesson(path)
        status = "ok" if not failures else f"{len(failures)} mismatches"
        print(f"lesson {lesson}: {count} facts, {status}")
        for line in failures:
            print(f"  - {line}")
        bad += len(failures)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
