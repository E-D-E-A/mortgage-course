"""Independent checks for the mortgage process clocks (lessons 1.7 and 1.8).

Plain Python datetime arithmetic; nothing is imported from src/lib/calc.
The day an event happens is day 0. Saturday is never a banking business day;
Friday only when the fact says friday_counts = "yes"; the closed holidays are
listed in each fact's inputs.
"""
from datetime import date, timedelta


def _d(s):
    return date.fromisoformat(s)


def _business(day, friday_counts, closed):
    # date.weekday(): Monday = 0 … Friday = 4, Saturday = 5, Sunday = 6.
    if day.weekday() == 5:
        return False
    if day.weekday() == 4 and not friday_counts:
        return False
    return day.isoformat() not in closed


def _calendar(i):
    closed = set(filter(None, str(i["closed"]).split(",")))
    return i["friday_counts"] == "yes", closed


def add_calendar_days(i, _facts=None):
    return (_d(i["start"]) + timedelta(days=int(i["days"]))).isoformat()


def add_business_days(i, _facts=None):
    friday, closed = _calendar(i)
    day, counted = _d(i["start"]), 0
    while counted < int(i["days"]):
        day += timedelta(days=1)
        if _business(day, friday, closed):
            counted += 1
    return day.isoformat()


def calendar_days_between(i, _facts=None):
    return (_d(i["to"]) - _d(i["from"])).days


def business_days_between(i, _facts=None):
    friday, closed = _calendar(i)
    start, end = _d(i["from"]), _d(i["to"])
    return sum(1 for k in range(1, (end - start).days + 1) if _business(start + timedelta(days=k), friday, closed))


def day_list(i, _facts=None):
    friday, closed = _calendar(i)
    start = _d(i["start"])
    out, count = [], 0
    for k in range(1, int(i["days"]) + 1):
        day = start + timedelta(days=k)
        business = _business(day, friday, closed)
        count += 1 if business else 0
        out.append({"n": k, "date": day.isoformat(), "business": business, "count": count})
    return out


def days_left(i, _facts=None):
    return int(i["window"]) - int(i["used"])


def window_table(i, _facts=None):
    """Rows: an event's date, days since the start date, and days left in the window."""
    start, window = _d(i["start"]), int(i["window"])
    rows, n = [], 1
    while f"date_{n}" in i:
        used = (_d(i[f"date_{n}"]) - start).days
        rows.append({"period": n, "event": i[f"event_{n}"], "date": i[f"date_{n}"], "days": used, "left": window - used})
        n += 1
    return rows


KINDS = {
    "proc_add_calendar_days": add_calendar_days,
    "proc_add_business_days": add_business_days,
    "proc_calendar_days_between": calendar_days_between,
    "proc_business_days_between": business_days_between,
    "proc_days_left": days_left,
    "proc_day_list": day_list,
    "proc_window_table": window_table,
}
