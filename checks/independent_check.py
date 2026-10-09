"""Independent check of every number in data/lessons/*.json.

Recomputes each fact from its stated inputs with Python's own Decimal
arithmetic, sharing no code with the TypeScript module that produced it
(src/lib/calc). A mismatch, or a fact kind with no check, fails the run.

Each topic's checks live in checks/kinds/<topic>.py as a KINDS table
(kind -> function(inputs, facts) returning the expected value); every module
there is loaded, so a new lesson adds its own file and touches nothing shared.

Run: pnpm check:python   (python3 -I checks/independent_check.py)
"""
import importlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "checks"))  # explicit, since -I drops the script directory

KINDS = {}
for module_path in sorted((ROOT / "checks" / "kinds").glob("*.py")):
    if module_path.stem == "__init__":
        continue
    module = importlib.import_module(f"kinds.{module_path.stem}")
    for kind, fn in getattr(module, "KINDS", {}).items():
        if kind in KINDS:
            raise SystemExit(f"kind '{kind}' is checked twice ({module_path.name})")
        KINDS[kind] = fn


def check_lesson(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    facts = {f["id"]: f for f in data["facts"]}
    failures = []
    for f in data["facts"]:
        if f["kind"] not in KINDS:
            failures.append(f"{f['id']}: no independent check for kind '{f['kind']}'")
            continue
        fn = KINDS[f["kind"]]
        if fn is None:
            continue
        expected = fn(f["inputs"], facts)
        if expected != f["value"]:
            failures.append(f"{f['id']}: data says {f['value']!r}, independent check says {expected!r}")
    return data["lesson"], len(data["facts"]), failures


def main():
    files = sorted((ROOT / "data" / "lessons").glob("*.json"))
    if not files:
        print("no data files; run pnpm data first")
        return 1
    bad = 0
    for path in files:
        lesson, count, failures = check_lesson(path)
        print(f"lesson {lesson}: {count} facts, {'ok' if not failures else f'{len(failures)} mismatches'}")
        for line in failures:
            print(f"  - {line}")
        bad += len(failures)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
