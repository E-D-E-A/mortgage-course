"""Independent checks for what a bank's public form asks you to write (lesson 4.13).

Plain Python Decimal; nothing is imported from src/lib/calc. Ages arrive as
"a|b|c" strings; an empty string is no children.
"""
from decimal import Decimal

from kinds.common import agorot


def _ages(text):
    text = str(text)
    return [int(a) for a in text.split("|")] if text else []


def count_under(i, _facts=None):
    limit = int(i["limit_age"])
    return sum(1 for a in _ages(i["ages"]) if a < limit)


def household(i, _facts=None):
    return int(i["adults"]) + len(_ages(i["ages"]))


def monthly_from_yearly(i, _facts=None):
    return str(agorot(Decimal(i["yearly"]) / 12))


KINDS = {
    "forms_children_under": count_under,
    "forms_household_size": household,
    "forms_monthly_from_yearly": monthly_from_yearly,
}
