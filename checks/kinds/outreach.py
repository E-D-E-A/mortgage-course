"""Independent checks for going to the banks (lessons 6.6-6.8). Fact kinds start with out_.

Plain Python date and Decimal arithmetic; nothing is imported from src/. The schedules come from
checks/kinds/schedule.py (itself written without the TypeScript). What is new here is written again
from the rules:

  out_clocks        one bank's dates, by `measure`: answer_by (the last day it may answer: 5 business
                    days after the request, 7 when extended = "yes"), approved (the day it answered,
                    answered_after business days after the request), valid_until (24 calendar days
                    after the approval, 12 when new_lien = "no"), window_days. The day an event
                    happens is day 0. Business days: Saturday never; Friday when friday_counts =
                    "yes"; not the closed dates listed in the fact.
  out_governing     the name, among `names` ("a|b|c"), whose date in `ends` ("d1|d2|d3") is the
                    earliest; the first of them on a tie.
  out_days_until    calendar days from `today` to `date`.
  out_round_answer  start + round_days business days.
  out_round_fits    "yes" when the answer day + reserve calendar days is not after valid_until.
  out_rounds_fit    rounds one after another from `start` (the next starts the day the previous
                    answer arrives), while they fit: `measure` count, last_start or last_answer.
  out_latest_start  the latest day a round can start and fit, searching back from valid_until to
                    not_before; "none" when there is no such day.
  out_events_inside how many of `dates` ("d1|d2") fall in [from, to].
  out_effect        a mix's first payment or total paid before / after an edit that adds
                    edit_points percentage points to the rate of the tracks that edit_target names
                    ("all", a kind, or a track number from 1): measure first_before, first_after,
                    first_delta, total_before, total_after, total_delta. Statement rounding.
  out_simple_monthly amount x points / 100 / 12, to the agora.
  out_stop          "time" when fits = "no", "small_gain" when last_gain < threshold, else "continue".
  out_margin        sum of amount x (rate - cost of its kind) / 100 over a mix's tracks (cost_<kind>
                    are in the fact), to the agora: a toy view of a bank's year, with invented costs.
"""
from datetime import date, timedelta
from decimal import Decimal

from kinds import schedule
from kinds.common import agorot

ANSWER = 5
ANSWER_EXTENDED = 7
WINDOW = 24
WINDOW_NO_LIEN = 12


def _d(s):
    return date.fromisoformat(s)


def _closed(i):
    return set(filter(None, str(i.get("closed", "")).split(",")))


def _is_business(day, friday_counts, closed):
    # weekday(): Monday = 0 ... Friday = 4, Saturday = 5, Sunday = 6.
    if day.weekday() == 5:
        return False
    if day.weekday() == 4 and not friday_counts:
        return False
    return day.isoformat() not in closed


def _plus_business(start, n, i):
    friday, closed = i["friday_counts"] == "yes", _closed(i)
    day, counted = _d(start), 0
    while counted < int(n):
        day += timedelta(days=1)
        if _is_business(day, friday, closed):
            counted += 1
    return day


def _fits(start, valid_until, i):
    answer = _plus_business(start, i["round_days"], i)
    return answer + timedelta(days=int(i["reserve"])) <= _d(valid_until), answer


def clocks(i, _facts=None):
    measure = i["measure"]
    extended = i["extended"] == "yes"
    window = WINDOW if i["new_lien"] == "yes" else WINDOW_NO_LIEN
    if measure == "window_days":
        return window
    if measure == "answer_by":
        return _plus_business(i["requested"], ANSWER_EXTENDED if extended else ANSWER, i).isoformat()
    approved = _plus_business(i["requested"], i["answered_after"], i)
    if measure == "approved":
        return approved.isoformat()
    return (approved + timedelta(days=window)).isoformat()


def governing(i, _facts=None):
    names, ends = str(i["names"]).split("|"), str(i["ends"]).split("|")
    best = 0
    for k, e in enumerate(ends):
        if _d(e) < _d(ends[best]):
            best = k
    return names[best]


def days_until(i, _facts=None):
    return (_d(i["date"]) - _d(i["today"])).days


def round_answer(i, _facts=None):
    return _plus_business(i["start"], i["round_days"], i).isoformat()


def round_fits(i, _facts=None):
    return "yes" if _fits(i["start"], i["valid_until"], i)[0] else "no"


def rounds_fit(i, _facts=None):
    at, rounds = i["start"], []
    while len(rounds) < 50:
        ok, answer = _fits(at, i["valid_until"], i)
        if not ok:
            break
        rounds.append((at, answer.isoformat()))
        at = answer.isoformat()
    if i["measure"] == "count":
        return len(rounds)
    if not rounds:
        return "none"
    return rounds[-1][0] if i["measure"] == "last_start" else rounds[-1][1]


def latest_start(i, _facts=None):
    day, low = _d(i["valid_until"]), _d(i["not_before"])
    while day >= low:
        if _fits(day.isoformat(), i["valid_until"], i)[0]:
            return day.isoformat()
        day -= timedelta(days=1)
    return "none"


def events_inside(i, _facts=None):
    low, high = _d(i["from"]), _d(i["to"])
    return sum(1 for d in str(i["dates"]).split("|") if low <= _d(d) <= high)


def _edited(i):
    """The mix's flat inputs, statement rounding, with the edit applied to the rates it names."""
    j = dict(i)
    j["rounding"] = "statement"
    target = str(i["edit_target"])
    points = Decimal(str(i["edit_points"]))
    for k in range(1, int(i["tracks"]) + 1):
        if target == "all" or target == i[f"t{k}_kind"] or target == str(k):
            j[f"t{k}_rate"] = str(Decimal(str(i[f"t{k}_rate"])) + points)
    return j


def effect(i, _facts=None):
    before = dict(i)
    before["rounding"] = "statement"
    after = _edited(i)
    first_before, first_after = Decimal(schedule.mix_first(before)), Decimal(schedule.mix_first(after))
    total_before, total_after = Decimal(schedule.mix_total(before)), Decimal(schedule.mix_total(after))
    return {
        "first_before": str(agorot(first_before)),
        "first_after": str(agorot(first_after)),
        "first_delta": str(agorot(first_after - first_before)),
        "total_before": str(agorot(total_before)),
        "total_after": str(agorot(total_after)),
        "total_delta": str(agorot(total_after - total_before)),
    }[i["measure"]]


def simple_monthly(i, _facts=None):
    return str(agorot(Decimal(str(i["amount"])) * Decimal(str(i["points"])) / 100 / 12))


def stop(i, _facts=None):
    if i["fits"] == "no":
        return "time"
    if Decimal(str(i["last_gain"])) < Decimal(str(i["threshold"])):
        return "small_gain"
    return "continue"


def margin(i, _facts=None):
    total = Decimal(0)
    for k in range(1, int(i["tracks"]) + 1):
        cost = Decimal(str(i[f"cost_{i[f't{k}_kind']}"]))
        total += Decimal(str(i[f"t{k}_amount"])) * (Decimal(str(i[f"t{k}_rate"])) - cost) / 100
    return str(agorot(total))


KINDS = {
    "out_clocks": clocks,
    "out_governing": governing,
    "out_days_until": days_until,
    "out_round_answer": round_answer,
    "out_round_fits": round_fits,
    "out_rounds_fit": rounds_fit,
    "out_latest_start": latest_start,
    "out_events_inside": events_inside,
    "out_effect": effect,
    "out_simple_monthly": simple_monthly,
    "out_stop": stop,
    "out_margin": margin,
}
