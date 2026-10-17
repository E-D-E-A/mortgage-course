# %% [markdown]
# # מנוע קטן לבחירת תמהיל: מחברת של סדנה 8.28
#
# **מה זה.** אותו מנוע שבניתם בגיליון, ב־Python, בתשעה צעדים. לכל צעד יש תא קוד, ולפניו הסבר על מה שהפונקציות שבו עושות.
#
# **מה זה לא.** זה לא קוד של Mogi. אין היום חישוב תמהיל בקוד של Mogi, והקריאה למנוע מוקפאת (Mogi היום).
# כל מה שבמחברת הוא **עתיד** ו**להדגמה**: המשקולות, הצעד של הרשת, הבנקים והריביות. הנתונים **סינתטיים**,
# הבנקים בדויים, ואין כאן הצעת בנק או נתוני שוק.
#
# **איך להשתמש.** מריצים את התאים לפי הסדר. התא הראשון אחרי ההסבר מכיל את נתוני התיק ואת הבחירות שלכם:
# אפשר לשנות את `CHOICE` ואת `WEIGHTS` ולהריץ מחדש. כל המספרים שהמנוע מדפיס מחושבים. אף מספר לא הוקלד.
#
# הקוד כתוב בספרייה הסטנדרטית בלבד (`decimal`), כדי שלא יהיה צורך להתקין כלום.

# %% [markdown]
# ## צעד 1: עזרים לכסף ולהחזר חודשי
#
# * `from decimal import ...` מביא חשבון עשרוני מדויק. כסף לעולם לא מחושב בעשרוני צף (float).
# * `agorot(x)` מעגל לאגורה, חצי כלפי מעלה. כלל העיגול של הקורס: נוסחה מעגלים פעם אחת, בסוף. לוח סילוקין מעגלים בכל חודש, כי בבנק כל חודש נרשם באגורות.
# * `pmt(rate, months, principal)` הוא ההחזר החודשי הקבוע (שפיצר): `P × m ÷ (1 − (1 + m)^−n)`.
#   `m` היא הריבית החודשית: אחוז הריבית לשנה, חלקי 12, חלקי 100.

# %%
from decimal import Decimal, ROUND_HALF_UP, getcontext

getcontext().prec = 50  # דיוק גבוה, כדי שהעיגול יהיה רק בסוף


def agorot(x):
    return Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def pmt(rate_percent, months, principal):
    m = Decimal(rate_percent) / 12 / 100
    return Decimal(principal) * m / (1 - (1 + m) ** (-months))


# %% [markdown]
# ## צעד 2: תזרים של מסלול אחד, לפי תרחיש
#
# זה הלב של המנוע (שיעור 8.9). הוא מקבל מסלול ותרחיש, ומחזיר את ההחזר של כל חודש.
#
# * `rate_in_month(...)` אומר איזו ריבית שנתית חלה בחודש: מסלול קבוע לא זז; פריים זז מתחילת השנה השנייה לפי התרחיש;
#   משתנה זז רק אחרי נקודת העדכון הראשונה, כלומר אחרי `reset` חודשים (נתון בנתוני התיק), לפי העוגן בתרחיש. בתרחיש של הקורס יש עדכון אחד.
# * בכל חודש: הריבית של החודש = `agorot(יתרה × ריבית שנתית ÷ 12 ÷ 100)`.
# * ההחזר נקבע בחודש הראשון, ושוב בכל פעם שהריבית משתנה: `agorot(pmt(...))` על היתרה שנשארה ועל החודשים שנשארו.
# * החודש האחרון סוגר את היתרה: הוא משלם בדיוק מה שנשאר ועוד ריבית. כך כל לוח מסתכם על המספרים שמודפסים בו.

# %%
def rate_in_month(kind, rate, month, scenario, reset):
    if kind == "prime":
        return Decimal(rate) + (Decimal(scenario["prime_shift"]) if month > 12 else 0)
    if kind == "variable_unlinked":
        return Decimal(rate) + (Decimal(scenario["anchor_shift"]) if month > reset else 0)
    return Decimal(rate)  # קבועה לא צמודה


def track_payments(kind, amount, rate, months, scenario, reset):
    balance = agorot(amount)
    payments = []
    last_rate = None
    payment = Decimal(0)
    for month in range(1, months + 1):
        this_rate = rate_in_month(kind, rate, month, scenario, reset)
        if this_rate != last_rate:  # חודש ראשון, או ריבית שהשתנתה
            payment = agorot(pmt(this_rate, months - month + 1, balance))
            last_rate = this_rate
        interest = agorot(balance * this_rate / 12 / 100)
        principal = balance if month == months else payment - interest
        payments.append(principal + interest)
        balance -= principal
    return payments


# %% [markdown]
# ## צעד 3: תזרים של תמהיל, והמדדים
#
# * `mix_payments` מחבר את ההחזרים של המסלולים, חודש אחרי חודש. מסלול שנגמר לא מוסיף כלום.
# * שלושת המדדים (שיעורים 3.8, 3.9 ו־8.8): **ההחזר הראשון**, **סך התשלומים** בתרחיש הבסיס, ו**החשיפה**:
#   כמה ההחזר הגבוה ביותר בתרחיש הלחץ עולה על ההחזר הראשון. כולם "קטן יותר טוב".

# %%
def mix_payments(tracks, scenario, reset):
    longest = max(t["months"] for t in tracks)
    flows = [track_payments(t["kind"], t["amount"], t["rate"], t["months"], scenario, reset) for t in tracks]
    return [sum((f[m] for f in flows if m < len(f)), Decimal(0)) for m in range(longest)]


def measures(tracks, base, stress, reset):
    base_pay = mix_payments(tracks, base, reset)
    stress_pay = mix_payments(tracks, stress, reset)
    first = base_pay[0]
    total = sum(base_pay, Decimal(0))
    exposure = max(stress_pay) - first
    return [first, total, exposure]


# %% [markdown]
# ## צעד 4: מיצוב. מהבחירות של הלקוח לבקשה
#
# המיצוב (שיעור 8.6, רמה ראשונה) הוא מה שהלקוח והיועץ מחליטים לפני שבונים תמהיל: כמה הון עצמי נוסף, האם סוגרים את הלוואת הרכב,
# האם הורה מצטרף, ולאיזה בנק פונים.
#
# * ההלוואה = מחיר הנכס פחות ההון העצמי.
# * ההכנסה המוכרת היא סכום ההכנסות, ועוד הכנסת ההורה אם הוא מצטרף.
# * הלוואה שנשארו לה **יותר מ־18 חודשים** מנוכה מההכנסה (כלל ה־18 חודשים, שיעור 4.2). אם סוגרים אותה, היא יוצאת מהחשבון, אבל התשלום עליה יוצא מהחסכונות.
# * ההון העצמי הזמין = ההון של הבסיס, ועוד מה שנשאר מהחסכונות.

# %%
def positioning(case, choice):
    bank = case["banks"][choice["bank"]]
    equity = Decimal(case["base_equity"]) + Decimal(choice["extra_equity"])
    available = Decimal(case["base_equity"]) + max(Decimal(case["savings"]) - (Decimal(case["car_payoff"]) if choice["close_car"] else 0), Decimal(0))
    incomes = [Decimal(x) for x in case["incomes"]] + ([Decimal(case["parent_income"])] if choice["parent"] else [])
    car_counts = (not choice["close_car"]) and case["car_months_left"] > 18
    income = sum(incomes, Decimal(0))
    disposable = income - (Decimal(case["car_monthly"]) if car_counts else 0)
    return {
        "bank": bank,
        "equity": equity,
        "available": available,
        "loan": Decimal(case["price"]) - equity,
        "disposable": disposable,
    }


# %% [markdown]
# ## צעד 5: חיפוש. רשת של תמהילים
#
# מרחב כל התמהילים גדול מדי לבדיקה (שיעור 8.13), ולכן מצמצמים אותו. כאן: שלושה סוגי מסלול (קבועה, פריים, משתנה), כל חלק הוא כפולה של `step` אחוזים
# מההלוואה, ולכל המסלולים אותה תקופה. מסלול בלי חלק לא נכנס לתמהיל.
#
# * `grid(step)` מחזיר כל שלישיית חלקים שמסתכמת ב־100.
# * `candidate(...)` בונה את המסלולים של תמהיל אחד: סכום = הלוואה × חלק ÷ 100 (באגורות), והריבית היא מחירון הבנק לאותו סוג.

# %%
KINDS = ["fixed_unlinked", "prime", "variable_unlinked"]


def grid(step):
    return [(f, p, 100 - f - p) for f in range(0, 101, step) for p in range(0, 101 - f, step)]


def candidate(shares, loan, bank, months):
    return [
        {"kind": kind, "amount": agorot(loan * share / 100), "rate": bank["prices"][kind], "months": months}
        for kind, share in zip(KINDS, shares)
        if share > 0
    ]


# %% [markdown]
# ## צעד 6: אילוצים קשיחים, ו**כל** סיבות הפסילה
#
# מועמד אפשרי עומד בכל האילוצים (שיעור 8.7). הפונקציה מחזירה את **כל** הסיבות שבגללן הוא נפסל, לא רק הראשונה, כי מי שמתקן מועמד צריך לדעת את כולן.
#
# * `qualifying` הוא ההחזר שיחס ההחזר מודד: ההחזר הראשון של כל מסלול על הסכום המלא, מחוברים (שיעור 4.3), בלי עיגול.
# * "מעל" הוא תמיד חזק: מי שבדיוק על הקו לא עבר אותו.
# * הקווים של הרגולציה הם לפי תעתיק הצוות (לא אומת): שיעור מימון עד 75% לדירה יחידה, יחס החזר עד 50%, לא יותר משני שלישים בריבית שמשתנה, תקופה עד 30 שנה.
# * הקווים של הבנק (הבדוי) ושל הלקוח באים מהנתונים.
# * הפונקציה בודקת עשרה תנאים בזה אחר זה, ובכל תנאי שנשבר היא מוסיפה סיבה לרשימה. רשימה ריקה פירושה: המועמד אפשרי.

# %%
def reasons(case, choice, pos, tracks):
    rules = case["rules"]  # הקווים של הרגולציה, כפי שהם בנתוני התיק
    LTV_CEILING, PTI_LIMIT, MAX_TERM = Decimal(rules["ltv_ceiling"]), Decimal(rules["pti_limit"]), rules["max_term_months"]
    loan = sum((t["amount"] for t in tracks), Decimal(0))
    price = Decimal(case["price"])
    qualifying = sum((pmt(t["rate"], t["months"], t["amount"]) for t in tracks), Decimal(0))
    variable = sum((t["amount"] for t in tracks if t["kind"] != "fixed_unlinked"), Decimal(0))
    ratio = qualifying / pos["disposable"] * 100 if pos["disposable"] > 0 else None
    bank = pos["bank"]
    out = []
    if loan != price - pos["equity"]:
        out.append("sum_equals_loan")
    if pos["equity"] > pos["available"]:
        out.append("equity_available")
    if loan / price * 100 > LTV_CEILING:
        out.append("ltv")
    if ratio is None or ratio > PTI_LIMIT:
        out.append("pti")
    if variable * rules["variable_denominator"] > loan * rules["variable_numerator"]:
        out.append("variable_share")
    if max(t["months"] for t in tracks) > MAX_TERM:
        out.append("term")
    if ratio is None or ratio > Decimal(bank["ratio_max"]):
        out.append("bank_ratio")
    if loan / price * 100 > Decimal(bank["ltv_max"]):
        out.append("bank_ltv")
    if qualifying > Decimal(case["max_payment"]):
        out.append("client_max_payment")
    if ratio is None or ratio > Decimal(case["target_ratio"]):
        out.append("client_target_ratio")
    return out


# %% [markdown]
# ## צעד 7: החזית היעילה, והבחירה לפי משקולות
#
# * מועמד **שולט** על אחר אם הוא לא גרוע ממנו בשום מדד, ומשופר לפחות באחד (שיעור 8.15). מועמד אפשרי ששום מועמד אפשרי לא שולט עליו הוא **יעיל**.
# * הבחירה (שיעור 8.8): כל מדד מנורמל בין 0 (הטוב ביותר מבין האפשריים) ל־1 (הגרוע), מעוגל לארבע ספרות. הציון הוא ממוצע משוקלל, ו**הציון הנמוך מנצח**; בשוויון מנצח מי שבא ראשון ברשימה.
# * המשקולות (`WEIGHTS`) הן **להדגמה**: לא החלטה של Mogi.

# %%
def dominates(a, b):
    return all(x <= y for x, y in zip(a, b)) and any(x < y for x, y in zip(a, b))


def normalise(values, pool):
    lo, hi = min(pool), max(pool)
    return [Decimal(0) if hi == lo else ((v - lo) / (hi - lo)).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP) for v in values]


def choose(rows, weights):
    feasible = [r for r in rows if r["feasible"]]
    for r in rows:
        r["efficient"] = r["feasible"] and not any(dominates(o["values"], r["values"]) for o in feasible if o is not r)
    pool = feasible or rows
    columns = [normalise([r["values"][j] for r in rows], [r["values"][j] for r in pool]) for j in range(3)]
    for i, r in enumerate(rows):
        r["score"] = sum((columns[j][i] * weights[j] for j in range(3)), Decimal(0)) / sum(weights)
    ranked = sorted((i for i, r in enumerate(rows) if r["feasible"]), key=lambda i: (rows[i]["score"], i))
    for place, i in enumerate(ranked):
        rows[i]["rank"] = place + 1
    return rows


# %% [markdown]
# ## צעד 8: להריץ הכול, ולהסביר
#
# `run` עושה את כל השרשרת: מיצוב ← רשת ← תזרים ← אילוצים ← חזית ← בחירה. ההסבר נבנה **ממספרי המנוע בלבד**: מי ניצח, כמה הוא עולה בכל מדד,
# ומה הפער מהמקום השני.
#
# * `run` בונה שורה לכל מועמד (המסלולים, שלושת המדדים, רשימת הסיבות), ואחר כך `choose` מסמן יעילים ומדרג.
# * `explain` לא מחשבת כלום חדש: היא רק שולפת את הנבחר, את המקום השני ואת ההפרשים ביניהם מהשורות שכבר חושבו. ההדפסה בתא מכינה מהם משפט.
#
# במערכת אמיתית אפשר שמודל שפה ינסח את המשפט, אבל המספרים תמיד מהמנוע, ומודל שפה לעולם לא מחשב (שיעור 8.26).

# %%
def run(case, choice, weights):
    step, years, reset = case["rules"]["step"], case["rules"]["years"], case["rules"]["reset_months"]
    pos = positioning(case, choice)
    base, stress = case["scenarios"]["base"], case["scenarios"]["stress"]
    rows = []
    for shares in grid(step):
        tracks = candidate(shares, pos["loan"], pos["bank"], years * 12)
        rows.append(
            {
                "id": "g%d-%d-%d" % shares,
                "shares": shares,
                "tracks": tracks,
                "values": measures(tracks, base, stress, reset),
                "reasons": reasons(case, choice, pos, tracks),
            }
        )
        rows[-1]["feasible"] = not rows[-1]["reasons"]
    choose(rows, weights)
    return {"positioning": pos, "rows": rows}


def explain(result):
    winner = next((r for r in result["rows"] if r.get("rank") == 1), None)
    runner = next((r for r in result["rows"] if r.get("rank") == 2), None)
    if winner is None:
        return None
    gaps = [b - a for a, b in zip(winner["values"], runner["values"])] if runner else None
    return {"winner": winner, "runner_up": runner, "gaps": gaps}


# %% [markdown]
# ## צעד 9: בדיקה מול הצעת בנק
#
# שיעור 8.20: **אומדן** אינו **הצעת בנק**. האומדן הוא התמהיל במחירון של הבנק. ההצעה היא מה שהבנק (הבדוי) כתב בפועל, כמה
# מאיות נקודה מהמחירון. `check_offer` מחשב את שניהם לאותו תמהיל ומראה את הפער בהחזר הראשון ובסך התשלומים.
# כשמגיעה הצעה אמיתית, היא מחליפה את האומדן.

# %%
def check_offer(case):
    years, reset = case["rules"]["years"], case["rules"]["reset_months"]
    offer = case["offer"]
    choice = {"extra_equity": "0", "close_car": False, "parent": False, "bank": offer["bank"]}
    pos = positioning(case, choice)
    est = candidate(tuple(offer["shares"]), pos["loan"], pos["bank"], years * 12)
    off = [{**t, "rate": offer["rates"].get(t["kind"], t["rate"])} for t in est]
    base, stress = case["scenarios"]["base"], case["scenarios"]["stress"]
    e, o = measures(est, base, stress, reset), measures(off, base, stress, reset)
    return {"estimate": e, "offer": o, "first_gap": o[0] - e[0], "total_gap": o[1] - e[1]}
