# Repo research notes — domain vocabulary (edea-mortgage)

Source repo: `/home/user/edea-mortgage` (read-only; `context/retired/` not read).
- `git rev-parse origin/main` = `6156bf8d953471ade753cd9d31c5b71d674cfbf8`
- `git rev-parse HEAD` = `6156bf8d953471ade753cd9d31c5b71d674cfbf8` (HEAD == origin/main; last merge 2026-10-09, PR #183 "dvir/eng-268-read-payslips-from-the-michpal-payroll-layout-four-values")
- Notes compiled 2026-10-09. Everything below is transcribed from files; nothing invented. Where a value is not in the repo it says so.

Contents
1. CONTEXT.md — the ubiquitous-language glossary
2. The field registry (`packages/schemas/registry/v1.yaml`) — every kind, field, Hebrew label, enum value
3. The advisor app's six categories (intake map)
4. The four banks' public pre-approval questionnaires (Leumi, Poalim, Mizrahi-Tefahot, Discount) + comparison
5. Discount advisor panel (authenticated channel) — concrete rules
6. The engine (calculations app) — what it computes today vs planned
7. Calculation code found in the repo (grep results with file:line)
8. Other code-docs pages that explain the domain

---

## 1. CONTEXT.md — the ubiquitous language

File: `/home/user/edea-mortgage/CONTEXT.md` (168 lines). It gives English terms (Hebrew only where noted). Rule stated in the file: "UI text is Hebrew. Code, comments, identifiers, commits and documentation are English. No exceptions in either direction."

### The business
| Term | Hebrew | Definition (verbatim / near-verbatim) |
|---|---|---|
| Pre-approval | אישור עקרוני | "a bank's in-principle approval of a mortgage. The product's axis. Up to four banks run in parallel for one case." |
| Shadow Mode | — | "the software records its own opinion beside what the advisor actually did, without acting. The learning baseline." |
| Assisted Mode | — | follows Shadow Mode "once the opinions are trusted." |
| Absorption | — | "how the product grows. A journey stage gets built in software, its code starts emitting events into the same log the advisor captures into by hand, and the manual door for that stage retires. Nothing migrates." |
| Mogi | מוגי | "the one company and brand. It goes to market now; the founders run every case by hand behind the platform, and automation grows only from what real cases teach." |

### The case record
| Term | Hebrew | Definition |
|---|---|---|
| Case | תיק | "one client's mortgage journey. Opened at first contact, not at conversion; 'lost' is an outcome, never a deletion." |
| Borrower | לווה | "a person on a case. Active membership lives in `case_borrowers`. Exactly one active borrower is the primary, the reference person for relationship and shared-household answers; every other active person is a co-borrower or guarantor. Removing a borrower from one case ends that membership and keeps its event history. Statutory deletion of the person's data is a separate operation. Consent and statutory deletion are per person." (registry labels: primary = לווה ראשי, co_borrower = לווה נוסף, guarantor = ערב) |
| Event | — | "one recorded moment. Immutable." Envelope: `case_id · client_id · occurred_at · recorded_at · recorded_by · kind · registry_version · consent_tag · source · payload (JSONB) · corrects · write_xid` |
| `client_id` | — | "the person an event is about, when it is about one ... so deletion finds every event about a person in one pass. Nullable, no foreign key." |
| `occurred_at` vs `recorded_at` | — | "when it happened, and when we wrote it down. Two different clocks, both kept. Their gap is capture lag, a measured thing." |
| Kind | — | "the name of a type of moment ('a pre-approval arrived'). A closed vocabulary: adding a field to an existing kind is routine; adding a kind needs a grilling and tests." |
| Payload | — | "the event's data, JSONB. The PII carrier. Never logged, never projected raw." |
| Field registry | — | "the versioned YAML defining every kind and its fields. Every event stores the `registry_version` it was validated against." |
| Consent tag | — | "which consent class an event's data falls under. Set at capture, never inferred later." |
| Correction | — | "a new event pointing at an earlier one through a column, never through the payload. The log is never edited; the Timeline shows both; the projector applies the latest." |

### The write path
| Term | Definition |
|---|---|
| Event log | "the append-only table. Authoritative for history." |
| Projection | "typed, constrained tables holding current state: a thin `cases`, `clients`, `case_borrowers`, and one table per domain kind (`case_transaction`, `case_property`, `case_loan_request`, `case_jobs`, `case_incomes`, `case_obligations`, `case_equity_sources`, `case_requested_tracks`). No JSONB ... Authoritative for 'what is true now'. Rebuildable from the log." |
| The write path | "the one HTTP service every surface is a client of. In one transaction: validate against the registry → append the event → project → commit." |
| Projector | "the only code that turns events into table state. Forms and quick actions produce events and stop." |
| `asProjector` | "the single function that escalates to the projector's privileges, in `services/api/src/db/index.ts`." |
| Rebuildability | "replaying the log into a scratch schema equals the live tables. Drift means something wrote around the log." |
| Storage seam | "one module with save/fetch/delete for documents. The log holds references, never blobs." |

### Capture — the three doors
Rule: "if a fact's shape is known before it arrives, give it a button or a form; free text is only for facts that arrive as prose."
1. **Quick action** — a button. A pure state transition. No LLM.
2. **Form** — a fixed-shape event. Typed fields, validation. No LLM.
3. **Document drop** — a PDF or photo, opening the matching form.
(A fourth door joins over time: our own code, as stages are absorbed.)

| Term | Definition |
|---|---|
| Triage note | "text the advisor types that fits no form (`capture_draft_saved`), tagged unclassified until a person classifies it (`event_classified`)." |
| Triage tray | "the triage notes nobody has classified yet." |
| Unconfirmed tray | "the machine suggestions nobody has confirmed yet." |
| Edit rate | "a machine suggestion diffed against the values a person confirmed." |

### Stated vs verified
"Every fact-carrying field holds two values, permanently:"
- **Stated** — the client's word (intake call).
- **Verified** — document-derived, anchored to the document it came from.
"Verified never overwrites stated. The gap between them is a first-class measurement. Verified renders primary, stated beneath, with a **delta badge** when they meaningfully disagree."

### The screens
| Term | Hebrew | Definition |
|---|---|---|
| Attention list | — | "the morning view: red clocks, ASK chips due, unconfirmed count." |
| The File | — | "where things are. The one observation and editing surface." |
| The Timeline | היסטוריית התיק | "what happened on one case. The log as the case's story; on screen 'היסטוריית התיק'." |
| Activity feed | — | "the Timeline across every case, on the Attention list." |
| File-building screen | — | "a document beside its registry fields; each confirmed value anchored to its source." |
| Offers matrix | — | "banks × rounds, expiry countdowns, phone-quoted vs written." |
| ASK chip | — | "a prompt raised by state ('the client is entitled to a delay reason'). Clicking it records both the ask and the answer." |
| Prediction strip | — | "approve/refuse and rough terms, recorded before the bank answers." |
| Recommendation strip | — | "recorded before the client chooses. Honest ordering is nudged, never locked; a skip is itself an event." |
| Banking-day clock | — | "the five-business-day timers, on the Israeli banking calendar. They drive the ASK chips, so approximation means wrong prompts." |

### Money
| Term | Definition |
|---|---|
| Agorot (אגורות) | "whole agorot. 1 ₪ = 100 agorot. The only representation of an amount." |
| Basis points | "whole bp. 1% = 100 bp." |
| Nominal rate | "quoted, before compounding." |
| Effective rate | "after compounding and fees. Distinct types; never interchangeable." |
"No float ever represents money. `Agorot`, `NominalRateBp` and `EffectiveRateBp` are branded types in `@edea/schemas` and the compiler enforces them."

### The people
Eylon — the advisor (the internal app's only user in v0) · Eden — engineering, owns every technical decision · Dvir — engineering, consulted input · Amit — business (VP Product per the design-system rule; owns the Mogi design system).

---

## 2. The field registry — `packages/schemas/registry/v1.yaml`

1563 lines, `version: 1`. Header (transcribed): "Source: the Brain Decision page 'The v1 event catalog: sixteen kinds, their fields, and the projection tables they feed'." How to read an entry:
- `he` — the Hebrew label the advisor sees.
- `type` — closed list in `packages/schemas/src/registry/schema.ts`: `text, bool, date, date_or_unknown, agorot, decimal_string, signed_decimal_string, id_number, israeli_mobile, email, settlement_code, street_code, country, bank, uuid, sha256, boxes, scalar, person_ref` + `enum`, `int`, `list`, `item_ref`, `month`.
- `values` / `values_he` — enum values and the Hebrew label of each ("Required on every enum: a screen reads its labels from here").
- `applies_when` — "decides what a screen shows and what readiness counts as missing. It never blocks a save."
- `banks` — per bank: required · optional · not_asked · "required when <condition>".
- Row events: a kind with `groups` records each row as its own event with `item_id`; "Asked, and there are none" = event with `none_confirmed: true`.
- "Money is whole agorot written as a string of digits ('150000'), never a JSON number. Rates are decimal strings ('4.25')."
- The `bank` type's list (`packages/schemas/src/banks.ts`, "Leumi's list of 19, as its pre-approval form spells them, main banks first ... There is no 'other'"): לאומי · פועלים · מזרחי טפחות · דיסקונט · מרכנתיל דיסקונט · הבינלאומי · אוצר החייל · יהב · בנק ירושלים · וואן זירו · מסד · יובנק · פועלי אגודת ישראל · בנק הדואר · סיטי בנק · Barclays · HSBC · SBI · איגוד.

Derived field (computed on read, never stored): `has_children` — יש ילדים — bool, true when `children_birth_dates` is not empty.

Kinds (in file order): `transaction_stated`, `property_stated`, `borrower_identity_stated`, `employment_stated`, `income_stated`, `obligation_stated`, `equity_source_stated`, `loan_request_stated`, `consent_given`, `case_opened`, `borrower_added`, `capture_draft_saved`, `event_classified`, `preapproval_submission_intended`, `preapproval_submission_outcome`, `preapproval_answer_received`, `document_received`, `document_reading_intended`, `document_reading_outcome`, `document_filed`, `document_value_verified`, `document_deleted`.

Notable comments in the YAML (domain-relevant, verbatim):
- loan_request: "The financing cap is an engine computation, not a registry rule."
- tracks: "The track names and the payment forms below are the market's standard ones; the questionnaires load them from a dynamic list and never spell them out."
- tracks: "Nothing offers 'none': Discount needs 1 to 8 tracks on a purchase or a refinance (ENG-52, Eden, 2026-10-02). Mizrahi's public form asks whether the mix is generic, and the advisor always builds the mix, so that question is not asked and Mizrahi needs the tracks on every case (Eden, 2026-10-03)."
- rate: "Prime is part of a prime track, and a full rate goes stale when prime moves, so a prime track states its distance from prime and every other track its full rate (ENG-52, Eden, 2026-10-02)."
- grace: "0 is an answer, no grace, and a new track starts on it."
- income: "A number without period and basis is not a datum." / "A salary is its own group, not an income whose source is a job."
- obligations: "One row per loan, mortgage, rent or alimony. The banks ask obligations once per case ... each row names whose it is ... A shared row keeps one owner, so the engine never counts it twice."
- equity: "Leumi never asks equity; Discount's equity screen has no fields in the transcript and is marked not asked until verified on the live form."
- employment: "Employment status is derived, never stored: no current row = not working."
- consent: "One E.D.E.A consent document covers everything, signed once per person."
- case_opened: "A lead call is a case in enquiry status; there is no profile before a case." / lead_source "Ours, not a bank's."

Legend for the tables below: banks column = `L` Leumi · `P` Poalim · `M` Mizrahi · `D` Discount; `R` required, `O` optional, `–` not asked; otherwise the literal "required when …" text. (Tables generated mechanically from the YAML, so labels are exact.)

### `transaction_stated`

scope: `case` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `purpose` | מטרת ההלוואה | enum |  | L:R · P:R · M:R · D:R |  |
| `purpose_detail` | למה מיועדים הכספים | text | purpose in [any_purpose, renovation, extension] | L:– · P:R · M:R · D:– |  |
| `seller_kind` | ממי קונים | enum | purpose in [purchase_home, self_build, renovation, extension] | L:R · P:R · M:R · D:R |  |
| `is_mehir_lamishtaken` | מחיר למשתכן | bool | seller_kind = developer | L:R · P:R · M:R · D:R |  |
| `other_home_status` | דירה יחידה / חליפית / נוספת | enum |  | L:R · P:R · M:R · D:R |  |
| `purchasers_count` | כמה שותפים ברכישה | int | purpose in [purchase_home, purchase_land, self_build] | L:– · P:R · M:– · D:– | values 1,2,3,4,5,6,7,8,9,10 |
| `contract_signed` | נחתם חוזה רכישה | bool | purpose in [purchase_home, purchase_land, self_build] | L:– · P:R · M:R · D:– |  |
| `funds_needed_by` | מתי צריך את הכסף | date_or_unknown |  | L:R · P:R · M:R · D:R |  |
| `seller_is_relative` | המוכר קרוב משפחה | bool | purpose = purchase_home | L:– · P:R · M:– · D:O |  |
| `will_live_in_property` | הרוכשים יגורו בנכס | bool | purpose = purchase_home | L:– · P:– · M:– · D:R |  |

### `property_stated`

scope: `case` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `city` | יישוב | settlement_code |  | L:R · P:R · M:R · D:R |  |
| `street` | רחוב | street_code |  | L:– · P:R · M:– · D:– |  |
| `house_number` | מספר בית | text |  | L:– · P:R · M:– · D:– |  |
| `property_type` | סוג הנכס | enum | purpose = purchase_home | L:– · P:– · M:– · D:R |  |
| `contract_price` | מחיר בחוזה | agorot | purpose in [purchase_home, purchase_land] | L:R · P:R · M:R · D:R |  |
| `market_value` | שווי שוק | agorot |  | L:required when is_mehir_lamishtaken = true · P:R · M:R · D:required when is_mehir_lamishtaken = true OR required when purpose in [refinance_other_bank, refinance_same_bank, any_purpose, renovation, extension] |  |
| `project_name` | שם הפרויקט | text | seller_kind = developer | L:O · P:– · M:– · D:– |  |
| `developer_name` | שם הקבלן | text | seller_kind = developer | L:O · P:– · M:– · D:– |  |
| `already_pledged` | הנכס כבר משועבד | bool |  | L:– · P:required when purpose in [any_purpose, renovation, extension] · M:R · D:– |  |

**Section `land` — מגרש ובנייה עצמית** (applies_when: purpose in [purchase_land, self_build])

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `land_value` | שווי המגרש | agorot |  | L:– · P:R · M:R · D:– |  |
| `land_seller` | ממי נרכש המגרש | text |  | L:– · P:R · M:– · D:– |  |
| `land_owned` | המגרש בבעלותך | bool |  | L:– · P:– · M:R · D:– |  |
| `land_has_mortgage` | קיימת משכנתא על המגרש | bool |  | L:– · P:R · M:– · D:– |  |
| `land_mortgage_lender` | באיזה בנק המשכנתא על המגרש | bank | land_has_mortgage = true | L:– · P:R · M:– · D:– |  |
| `land_mortgage_balance` | סכום המשכנתא על המגרש | agorot | land_has_mortgage = true | L:– · P:R · M:– · D:– |  |
| `intends_to_build` | בכוונתך לבנות על המגרש | bool |  | L:– · P:– · M:R · D:– |  |
| `expected_build_cost` | עלות הבנייה הצפויה | agorot |  | L:– · P:R · M:R · D:– |  |
| `has_building_permit` | קיים היתר בנייה | bool |  | L:– · P:R · M:– · D:– |  |
| `build_type` | סוג הבנייה | enum |  | L:– · P:R · M:– · D:– |  |
| `units_count` | כמה יחידות ייבנו | int |  | L:– · P:R · M:– · D:– |  |

### `borrower_identity_stated`

scope: `person` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `first_name` | שם פרטי | text |  | L:R · P:R · M:R · D:R |  |
| `last_name` | שם משפחה | text |  | L:R · P:R · M:R · D:R |  |
| `id_number` | מספר ת.ז | id_number |  | L:R · P:R · M:R · D:R |  |
| `birth_date` | תאריך לידה | date |  | L:R · P:R · M:R · D:R |  |
| `id_issue_date` | תאריך הנפקת ת.ז | date_or_unknown |  | L:R · P:R · M:– · D:– |  |
| `gender` | מין | enum |  | L:– · P:R · M:– · D:– |  |
| `birth_country` | ארץ לידה | country |  | L:– · P:R · M:– · D:– |  |
| `phone` | טלפון נייד | israeli_mobile |  | L:required when role = primary · P:R · M:R · D:required when role = primary |  |
| `email` | דוא"ל | email |  | L:required when role = primary · P:R · M:R · D:required when role = primary |  |
| `address_city` | יישוב מגורים | settlement_code |  | L:– · P:R · M:– · D:– |  |
| `address_street` | רחוב | street_code |  | L:– · P:R · M:– · D:– |  |
| `address_number` | מספר | text |  | L:– · P:R · M:– · D:– |  |
| `housing_status` | מקום מגורים נוכחי | enum |  | L:– · P:– · M:required when role = primary · D:– |  |
| `marital_status` | מצב משפחתי | enum |  | L:R · P:R · M:R · D:R |  |
| `prior_marital_status` | מצב משפחתי לפני הזוגיות | enum | marital_status = common_law | L:– · P:– · M:– · D:O |  |
| `household_size` | מספר נפשות בבית | int |  | L:– · P:– · M:– · D:R |  |
| `citizenships` | אזרחויות נוספות | list |  | L:R · P:R · M:– · D:– | items: country |
| `tax_residencies` | תושבות מס נוספת | list |  | L:R · P:R · M:– · D:– | items: country |
| `is_public_figure` | איש ציבור או קרוב מדרגה ראשונה | bool |  | L:R · P:– · M:– · D:– |  |
| `education` | השכלה | enum |  | L:– · P:– · M:R · D:– |  |
| `profession` | מקצוע | text |  | L:– · P:R · M:R · D:– |  |
| `risky_profession` | מקצוע בסיכון | bool |  | L:R · P:– · M:– · D:– |  |
| `children_birth_dates` | תאריכי לידה של הילדים | list |  | L:R · P:R · M:R · D:required when marital_status in [married, common_law] | items: date |
| `children_in_custody` | הילדים בחזקתך | bool | has_children = true | L:– · P:R · M:– · D:– |  |

### `employment_stated`

scope: `case_and_person` · module: `clients` · consent_class: `tbd`

**Row group `jobs` — עבודות**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `stage` | שלב | enum |  | L:R · P:R · M:R · D:R |  |
| `kind` | סוג העסקה | enum |  | L:R · P:R · M:R · D:R |  |
| `start_date` | תאריך התחלה | date |  | L:R · P:R · M:R · D:R |  |
| `end_date` | תאריך סיום | date | stage = previous | L:– · P:R · M:R · D:– |  |
| `employer_name` | שם המעסיק | text |  | L:O · P:R · M:R · D:R |  |
| `field` | תחום העיסוק | text |  | L:O · P:– · M:R · D:R |  |
| `position` | תפקיד | text |  | L:– · P:– · M:– · D:R |  |
| `employer_classification` | סיווג הארגון | enum |  | L:– · P:– · M:R · D:– |  |
| `workplace_city` | יישוב מקום העבודה | settlement_code |  | L:– · P:R · M:R · D:– |  |
| `workplace_address` | כתובת מקום העבודה | text |  | L:– · P:R · M:– · D:– |  |

### `income_stated`

scope: `case_and_person` · module: `clients` · consent_class: `tbd`

**Row group `salaries` — שכר**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `job_item_id` | לאיזו עבודה | item_ref |  | L:R · P:R · M:R · D:R | → employment_stated.jobs |
| `amount` | סכום | agorot |  | L:R · P:R · M:R · D:R |  |
| `period` | תקופה | enum |  | L:R · P:R · M:R · D:R |  |
| `basis` | בסיס | enum |  | L:R · P:R · M:R · D:R |  |

**Row group `other_incomes` — הכנסות נוספות**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `source` | מקור | enum |  | L:R · P:R · M:R · D:R |  |
| `amount` | סכום | agorot |  | L:R · P:R · M:R · D:R |  |
| `period` | תקופה | enum |  | L:R · P:R · M:R · D:R |  |
| `basis` | בסיס | enum |  | L:R · P:R · M:R · D:R |  |
| `detail` | פירוט | text |  | L:– · P:O · M:O · D:– |  |
| `property_owned_and_lease_in_name` | הנכס בבעלותך והחוזה על שמך | bool | source = rent | L:– · P:R · M:– · D:– |  |
| `allowance_permanence` | קצבה זמנית או קבועה | enum | source in [pension, disability, income_support, other_allowance] | L:– · P:R · M:– · D:– |  |

### `obligation_stated`

scope: `case` · module: `clients` · consent_class: `tbd`

**Row group `obligations` — התחייבויות**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `owner` | של מי | person_ref |  | L:R · P:– · M:– · D:– |  |
| `kind` | סוג | enum |  | L:R · P:R · M:R · D:R |  |
| `monthly_payment` | החזר חודשי | agorot |  | L:R · P:R · M:R · D:R |  |
| `balance` | יתרה | agorot | kind in [mortgage, loan, leasing] | L:– · P:R · M:R · D:– |  |
| `end_date` | תאריך סיום | date |  | L:O · P:R · M:R · D:O |  |
| `lender` | אצל מי | text | kind in [mortgage, loan, leasing] | L:– · P:R · M:– · D:required when purpose in [refinance_other_bank, refinance_same_bank] |  |
| `payments_in_good_standing` | התנהלה באופן תקין | bool | kind = mortgage | L:– · P:– · M:– · D:required when purpose in [refinance_other_bank, refinance_same_bank] |  |
| `shared` | משותפת עם לווה נוסף בתיק | bool |  | L:R · P:– · M:– · D:– |  |
| `detail` | פירוט | text |  | L:– · P:O · M:– · D:– |  |
| `secures_case_property` | משועבד על הנכס בתיק | bool | kind = mortgage | L:– · P:– · M:R · D:– |  |
| `mortgage_purpose` | סוג המשכנתא | enum | kind = mortgage | L:– · P:– · M:– · D:required when purpose in [refinance_other_bank, refinance_same_bank] |  |
| `intent_after_new_mortgage` | מה יקרה למשכנתא הקיימת | enum | kind = mortgage | L:– · P:R · M:– · D:– |  |

### `equity_source_stated`

scope: `case` · module: `clients` · consent_class: `tbd`

**Row group `equity_sources` — מקורות הון עצמי**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `source` | מקור | enum |  | L:– · P:R · M:R · D:– |  |
| `amount` | סכום | agorot |  | L:– · P:R · M:R · D:– |  |
| `detail` | פירוט | text |  | L:– · P:O · M:O · D:– |  |

### `loan_request_stated`

scope: `case` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `requested_amount` | הסכום המבוקש | agorot |  | L:R · P:R · M:R · D:required when purpose = purchase_home |  |
| `term_months` | תקופת ההחזר | int |  | L:O · P:R · M:R · D:– | min 48; max 360 |
| `comfortable_monthly_payment` | החזר חודשי נוח | agorot |  | L:– · P:– · M:R · D:– |  |
| `has_eligibility_certificate` | תעודת זכאות ממשרד השיכון | bool |  | L:– · P:– · M:R · D:– |  |
| `eligibility_amount` | סכום הלוואת הזכאות | agorot | has_eligibility_certificate = true | L:– · P:– · M:R · D:– |  |
| `include_eligibility_loan` | לשלב הלוואת זכאות באישור | bool |  | L:– · P:R · M:– · D:– |  |
| `collateral` | כנגד איזה נכס | enum | other_home_status in [will_sell, keep] | L:– · P:– · M:R · D:– |  |
| `refinance_scope` | מחזור מלא או חלקי | enum | purpose in [refinance_other_bank, refinance_same_bank] | L:– · P:– · M:– · D:R |  |
| `remaining_at_other_bank` | סכום שנשאר בבנק אחר | agorot | refinance_scope = partial | L:– · P:– · M:– · D:R |  |
| `uniform_basket_term_years` | תקופת ההחזר לסלים האחידים (שנים) | int |  | L:O · P:– · M:– · D:required when purpose in [purchase_home, refinance_other_bank, refinance_same_bank] | values 10,15,20,25,30 |
| `repayment_account_bank` | הבנק של חשבון החיוב | bank | purpose in [refinance_other_bank, refinance_same_bank] | L:– · P:R · M:– · D:– |  |
| `repayment_account_branch` | הסניף של חשבון החיוב | text | purpose in [refinance_other_bank, refinance_same_bank] | L:– · P:R · M:– · D:– |  |
| `repayment_account_number` | מספר חשבון החיוב | text | purpose in [refinance_other_bank, refinance_same_bank] | L:– · P:R · M:– · D:– |  |
| `current_account_banks` | בנקים בהם מתנהל עו"ש | list |  | L:R · P:– · M:– · D:– | items: bank |
| `notes` | עוד משהו לספר | text |  | L:– · P:– · M:O · D:– |  |

**Row group `tracks` — מסלולים מבוקשים** (group banks: L:– · P:O · M:R · D:required when purpose in [purchase_home, refinance_other_bank, refinance_same_bank])

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `track_kind` | סוג מסלול | enum |  | L:– · P:O · M:R · D:– |  |
| `amount` | סכום | agorot |  | L:– · P:O · M:R · D:– |  |
| `term_months` | תקופה | int |  | L:– · P:O · M:R · D:– | min 12; max 360 |
| `track_purpose` | מטרת המסלול | enum | purpose in [refinance_other_bank, refinance_same_bank] | L:– · P:– · M:– · D:R |  |
| `rate_percent` | ריבית | decimal_string | track_kind in [fixed_unlinked, fixed_linked, variable_unlinked, variable_linked, eligibility, other] | L:– · P:O · M:O · D:– |  |
| `prime_margin_percent` | מרווח מהפריים | signed_decimal_string | track_kind = prime | L:– · P:O · M:O · D:– |  |
| `payment_form` | צורת תשלום | enum |  | L:– · P:O · M:– · D:– |  |
| `grace_months` | גרייס | int |  | L:– · P:O · M:– · D:– | min 0; max 36 |

### `consent_given`

scope: `person` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `document_version` | גרסת מסמך ההסכמה | text |  | L:– · P:– · M:– · D:– |  |
| `given` | נחתם | bool |  | L:– · P:– · M:– · D:– |  |
| `given_at` | מתי | date | given = true | L:– · P:– · M:– · D:– |  |
| `credit_valid_if_funded` | תוקף הסכמת האשראי אם המשכנתא תועמד | enum | given = true | L:R · P:– · M:– · D:– |  |
| `credit_valid_if_funded_date` | עד תאריך, אם המשכנתא תועמד | date | credit_valid_if_funded = date | L:R · P:– · M:– · D:– |  |
| `credit_valid_if_not_funded` | תוקף אם לא תועמד | enum | given = true | L:R · P:– · M:– · D:– |  |
| `credit_valid_if_not_funded_date` | עד תאריך, אם לא תועמד | date | credit_valid_if_not_funded = date | L:R · P:– · M:– · D:– |  |

### `case_opened`

scope: `case` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `opened_at` | תאריך פתיחה | date |  | — |  |
| `opened_by` | נפתח על ידי | text |  | — |  |
| `status` | סטטוס | enum |  | — |  |
| `lead_source` | מקור הפנייה | enum |  | L:– · P:– · M:– · D:– |  |

### `borrower_added`

scope: `case_and_person` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `role` | תפקיד | enum |  | L:O · P:R · M:R · D:R |  |
| `relation_to_primary` | קרבה ללווה הראשי | enum | role in [co_borrower, guarantor] | L:R · P:R · M:R · D:R |  |
| `registered_owner` | יירשם כבעלים | bool |  | L:R · P:R · M:– · D:R |  |
| `shared_household` | משק בית משותף עם הלווה הראשי | bool | role in [co_borrower, guarantor] | L:– · P:– · M:– · D:R |  |
| `additional_borrowers_confirmed_none` | אין לווים נוספים | bool |  | L:– · P:– · M:– · D:– |  |
| `removed_from_case` | הוסר מהתיק | bool |  | L:– · P:– · M:– · D:– |  |

### `capture_draft_saved`

scope: `case_and_person` · module: `clients` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `text` | טקסט חופשי | text |  | — |  |

### `event_classified`

scope: `case` · module: `core` · consent_class: `tbd` · payload: `unspecified`

### `preapproval_submission_intended`

scope: `case_and_bank` · module: `banks` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `bank` | בנק | enum |  | — |  |
| `registry_version` | גרסת הרשומון שממנה נבנתה ההגשה | int |  | — |  |

### `preapproval_submission_outcome`

scope: `case_and_bank` · module: `banks` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `bank` | בנק | enum |  | — |  |
| `outcome` | תוצאה | enum |  | — |  |
| `reference` | אסמכתא | text | outcome = sent | — |  |
| `reason` | סיבת הכישלון | text | outcome = failed | — |  |

### `preapproval_answer_received`

scope: `case_and_bank` · module: `banks` · consent_class: `tbd` · payload: `unspecified`

### `document_received`

scope: `case_and_optional_person` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `file_id` | הקובץ השמור | uuid |  | — | presence: required |
| `content_type` | סוג הקובץ | text |  | — | presence: required |
| `size_bytes` | גודל הקובץ | int |  | — | min 1; presence: required |
| `sha256` | טביעת האצבע של הקובץ | sha256 |  | — | presence: required |
| `page_count` | מספר העמודים | int |  | — | min 1; presence: required |
| `slot_type` | סוג המסמך בהעלאה | enum |  | — |  |
| `slot_months` | החודשים בהעלאה | list |  | — | items: month |
| `slot_tax_year` | שנת המס בהעלאה | int |  | — | min 2000; max 2100 |

### `document_reading_intended`

scope: `case` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `file_id` | הקובץ השמור | uuid |  | — | presence: required |
| `reading_id` | מזהה הקריאה | uuid |  | — | presence: required |
| `reading_kind` | סוג הקריאה | enum |  | — | presence: required |

### `document_reading_outcome`

scope: `case` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `file_id` | הקובץ השמור | uuid |  | — | presence: required |
| `reading_id` | מזהה הקריאה | uuid |  | — | presence: required |
| `outcome` | תוצאת הקריאה | enum |  | — | presence: required |
| `reader_version` | גרסת קורא המסמכים | text | outcome = finished | — |  |
| `failure_reason` | סיבת הכישלון | enum | outcome = failed | — |  |

### `document_filed`

scope: `case_and_optional_person` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `document_id` | המסמך | uuid |  | — | presence: address |
| `file_id` | הקובץ השמור | uuid |  | — | presence: address |
| `document_type` | סוג המסמך | enum |  | — | presence: required |
| `first_page` | עמוד ראשון | int |  | — | min 1; presence: required |
| `last_page` | עמוד אחרון | int |  | — | min 1; presence: required |
| `months` | החודשים שהמסמך מכסה | list |  | — | items: month |
| `tax_year` | שנת המס שהמסמך מכסה | int |  | — | min 2000; max 2100 |

### `document_value_verified`

scope: `case_and_optional_person` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `document_id` | המסמך | uuid |  | — | presence: address |
| `target_kind` | מה אושר | enum |  | — | presence: address |
| `target_field` | השדה שאושר | text |  | — | presence: address |
| `target_group` | הרשימה שאושרה | text |  | — | presence: optional_address |
| `target_item_id` | השורה שאושרה | uuid |  | — | presence: optional_address |
| `value` | הערך שהמסמך מראה | scalar |  | — | presence: required |
| `page` | העמוד במסמך | int |  | — | min 1 |
| `boxes` | המסגרות בעמוד | boxes |  | — |  |
| `reading_id` | הקריאה שממנה נלקח | uuid |  | — |  |
| `withdrawal_reason` | סיבת הביטול | enum |  | — |  |

### `document_deleted`

scope: `case` · module: `documents` · consent_class: `tbd`

**Fields**

| field | Hebrew label (he) | type | applies_when | banks (L/P/M/D) | notes |
|---|---|---|---|---|---|
| `file_id` | הקובץ השמור | uuid |  | — | presence: required |
| `reason` | סיבת המחיקה | enum |  | — | presence: required |

### All enums with their Hebrew labels (values_he)


#### `transaction_stated.purpose` — מטרת ההלוואה

| value | Hebrew |
|---|---|
| `purchase_home` | רכישת דירה |
| `purchase_land` | רכישת מגרש |
| `self_build` | בנייה עצמית |
| `refinance_other_bank` | מחזור משכנתא מבנק אחר |
| `refinance_same_bank` | מחזור משכנתא מאותו בנק |
| `any_purpose` | הלוואה לכל מטרה |
| `renovation` | שיפוצים |
| `extension` | הרחבת נכס |
| `mamad` | בניית ממ"ד |

#### `transaction_stated.seller_kind` — ממי קונים

| value | Hebrew |
|---|---|
| `developer` | קבלן |
| `private` | מוכר פרטי |

#### `transaction_stated.other_home_status` — דירה יחידה / חליפית / נוספת

| value | Hebrew |
|---|---|
| `none` | יחידה |
| `will_sell` | חליפית |
| `keep` | נוספת |

#### `property_stated.property_type` — סוג הנכס

| value | Hebrew |
|---|---|
| `apartment` | בניין משותף |
| `house` | בית פרטי |

#### `property_stated.land.build_type` — סוג הבנייה

| value | Hebrew |
|---|---|
| `detached` | צמוד קרקע |
| `multi_storey` | רב קומות |

#### `borrower_identity_stated.gender` — מין

| value | Hebrew |
|---|---|
| `male` | זכר |
| `female` | נקבה |

#### `borrower_identity_stated.housing_status` — מקום מגורים נוכחי

| value | Hebrew |
|---|---|
| `with_parents` | אצל ההורים |
| `renting` | בשכירות |
| `rent_free` | במגורים ללא עלות חודשית |
| `owned_keep` | בנכס בבעלותי שאין בכוונתי למכור |
| `owned_will_sell` | בנכס בבעלותי שבכוונתי למכור |

#### `borrower_identity_stated.marital_status` — מצב משפחתי

| value | Hebrew |
|---|---|
| `single` | רווק/ה |
| `married` | נשוי/אה |
| `divorced` | גרוש/ה |
| `widowed` | אלמן/ה |
| `common_law` | ידוע/ה בציבור |

#### `borrower_identity_stated.prior_marital_status` — מצב משפחתי לפני הזוגיות

| value | Hebrew |
|---|---|
| `single` | רווק/ה |
| `divorced` | גרוש/ה |
| `widowed` | אלמן/ה |

#### `borrower_identity_stated.education` — השכלה

| value | Hebrew |
|---|---|
| `no_diploma` | ללא תואר, תעודת מקצוע או בגרות |
| `bagrut` | בגרות מלאה |
| `vocational_certificate` | תעודת מקצוע |
| `bagrut_and_vocational_certificate` | בגרות + תעודת מקצוע |
| `bachelor_student` | סטודנט לתואר ראשון |
| `graduate_student` | סטודנט לתואר מתקדם |
| `bachelor_degree` | בעל תואר ראשון |
| `graduate_degree` | בעל תואר מתקדם |

#### `employment_stated.jobs.stage` — שלב

| value | Hebrew |
|---|---|
| `current` | עבודה נוכחית |
| `previous` | עבודה קודמת |
| `future` | עבודה עתידית |

#### `employment_stated.jobs.kind` — סוג העסקה

| value | Hebrew |
|---|---|
| `salaried` | שכיר/ה |
| `self_employed` | עצמאי/ת |
| `controlling_owner` | שכיר/ה בעל/ת חברה |

#### `employment_stated.jobs.employer_classification` — סיווג הארגון

| value | Hebrew |
|---|---|
| `public_service` | שירות ציבורי |
| `private_company` | חברה פרטית |
| `small_business` | עסק קטן או חנות |
| `public_company` | חברה ציבורית |
| `licensed_dealer` | עוסק מורשה או עוסק פטור |

#### `income_stated.salaries.period` — תקופה

| value | Hebrew |
|---|---|
| `monthly` | חודשי |
| `annual` | שנתי |

#### `income_stated.salaries.basis` — בסיס

| value | Hebrew |
|---|---|
| `net` | נטו |
| `gross` | ברוטו |

#### `income_stated.other_incomes.source` — מקור

| value | Hebrew |
|---|---|
| `rent` | שכר דירה |
| `future_rent` | שכר דירה עתידי |
| `pension` | פנסיה |
| `disability` | קצבת נכות |
| `unemployment` | דמי אבטלה |
| `income_support` | הבטחת הכנסה |
| `child_allowance` | קצבת ילדים |
| `other_allowance` | קצבה אחרת |
| `alimony` | מזונות |
| `scholarship` | מלגה |
| `dividend` | דיבידנד |
| `other` | אחר |

#### `income_stated.other_incomes.period` — תקופה

| value | Hebrew |
|---|---|
| `monthly` | חודשי |
| `annual` | שנתי |

#### `income_stated.other_incomes.basis` — בסיס

| value | Hebrew |
|---|---|
| `net` | נטו |
| `gross` | ברוטו |

#### `income_stated.other_incomes.allowance_permanence` — קצבה זמנית או קבועה

| value | Hebrew |
|---|---|
| `temporary` | זמנית |
| `permanent` | קבועה |

#### `obligation_stated.obligations.kind` — סוג

| value | Hebrew |
|---|---|
| `mortgage` | משכנתא |
| `loan` | הלוואה |
| `leasing` | ליסינג |
| `rent` | שכר דירה |
| `alimony` | מזונות |
| `other` | אחר |

#### `obligation_stated.obligations.mortgage_purpose` — סוג המשכנתא

| value | Hebrew |
|---|---|
| `housing` | לדיור |
| `any_purpose` | כל מטרה |
| `both` | דיור + כל מטרה |

#### `obligation_stated.obligations.intent_after_new_mortgage` — מה יקרה למשכנתא הקיימת

| value | Hebrew |
|---|---|
| `close` | תסולק |
| `port_to_new_property` | גרירה לדירה הנרכשת |
| `keep` | ללא שינוי |

#### `equity_source_stated.equity_sources.source` — מקור

| value | Hebrew |
|---|---|
| `property_sale` | מכירת נכס |
| `future_property_sale` | מכירה עתידית של נכס |
| `family_loan` | הלוואה מבן משפחה |
| `employer_loan` | הלוואה ממקום העבודה |
| `loan` | הלוואה |
| `asset_sale` | מכירת רכוש |
| `business_sale` | מכירת עסק |
| `study_fund` | קרן השתלמות |
| `savings_or_deposit` | חיסכון או פיקדון |
| `dividends` | דיבידנדים |
| `capital_market_gains` | רווח משוק ההון |
| `compensation_or_lawsuit` | כספי פיצויים או תביעה |
| `retirement_grant` | מענק פרישה |
| `other_savings` | חסכונות אחרים |
| `family_savings` | חסכונות של בן משפחה |
| `loan_taken_by_family` | הלוואה שלקח בן משפחה |
| `family_property_sale` | מכירת נכס של בן משפחה |
| `inheritance` | כספי ירושה |
| `gift` | מתנה |
| `family_funds` | כספים מהמשפחה |
| `state_grant` | מענק מדינה |

#### `loan_request_stated.collateral` — כנגד איזה נכס

| value | Hebrew |
|---|---|
| `owned_property` | כנגד הנכס שבבעלותך |
| `purchased_property` | כנגד הנכס הנרכש |

#### `loan_request_stated.refinance_scope` — מחזור מלא או חלקי

| value | Hebrew |
|---|---|
| `full` | למחזר הכל |
| `partial` | למחזר חלק |

#### `loan_request_stated.tracks.track_kind` — סוג מסלול

| value | Hebrew |
|---|---|
| `prime` | פריים |
| `fixed_unlinked` | קבועה לא צמודה |
| `fixed_linked` | קבועה צמודה |
| `variable_unlinked` | משתנה לא צמודה |
| `variable_linked` | משתנה צמודה |
| `eligibility` | הלוואת זכאות |
| `other` | אחר |

#### `loan_request_stated.tracks.track_purpose` — מטרת המסלול

| value | Hebrew |
|---|---|
| `refinance_housing` | מיחזור לדיור |
| `refinance_any_purpose` | מיחזור לכל מטרה |
| `additional_housing` | תוספת לדיור |
| `additional_any_purpose` | תוספת לכל מטרה |

#### `loan_request_stated.tracks.payment_form` — צורת תשלום

| value | Hebrew |
|---|---|
| `spitzer` | שפיצר |
| `equal_principal` | קרן שווה |
| `bullet` | בוליט |

#### `consent_given.credit_valid_if_funded` — תוקף הסכמת האשראי אם המשכנתא תועמד

| value | Hebrew |
|---|---|
| `mortgage_end` | מועד סיום המשכנתא |
| `date` | תאריך מוקדם יותר |

#### `consent_given.credit_valid_if_not_funded` — תוקף אם לא תועמד

| value | Hebrew |
|---|---|
| `sixty_days` | 60 יום ממועד ההסכמה |
| `date` | מועד אחר |

#### `case_opened.status` — סטטוס

| value | Hebrew |
|---|---|
| `enquiry` | פנייה |

#### `case_opened.lead_source` — מקור הפנייה

| value | Hebrew |
|---|---|
| `word_of_mouth` | פה לאוזן |
| `facebook_paid` | פייסבוק (ממומן) |
| `facebook_organic` | פייסבוק (אורגני) |
| `instagram` | אינסטגרם |
| `google` | גוגל |
| `website` | האתר |
| `partner_referral` | הפניה משותף (עו"ד, מתווך) |
| `returning_client` | לקוח חוזר |
| `other` | אחר |

#### `borrower_added.role` — תפקיד

| value | Hebrew |
|---|---|
| `primary` | לווה ראשי |
| `co_borrower` | לווה נוסף |
| `guarantor` | ערב |

#### `borrower_added.relation_to_primary` — קרבה ללווה הראשי

| value | Hebrew |
|---|---|
| `spouse` | בן/בת זוג |
| `parent` | הורה |
| `child` | בן/בת |
| `sibling` | אח/אחות |
| `business_partner` | שותף/ה לעסקה |
| `other` | אחר |

#### `preapproval_submission_intended.bank` — בנק

| value | Hebrew |
|---|---|
| `leumi` | לאומי |
| `poalim` | הפועלים |
| `mizrahi` | מזרחי טפחות |
| `discount` | דיסקונט |

#### `preapproval_submission_outcome.bank` — בנק

| value | Hebrew |
|---|---|
| `leumi` | לאומי |
| `poalim` | הפועלים |
| `mizrahi` | מזרחי טפחות |
| `discount` | דיסקונט |

#### `preapproval_submission_outcome.outcome` — תוצאה

| value | Hebrew |
|---|---|
| `sent` | נשלח |
| `failed` | נכשל |

#### `document_received.slot_type` — סוג המסמך בהעלאה

| value | Hebrew |
|---|---|
| `payslip` | תלוש שכר |
| `id_card` | תעודת זהות |
| `id_appendix` | ספח תעודת זהות |
| `bank_statement` | תדפיס עו"ש |
| `mortgage_payoff_report` | דוח יתרות לסילוק |
| `eligibility_certificate` | תעודת זכאות |
| `land_registry_extract` | נסח טאבו |
| `form_106` | טופס 106 |
| `life_insurance` | ביטוח חיים |
| `purchase_contract` | חוזה רכישה |
| `purchase_tax_report` | דיווח העסקה לרשויות המס |
| `developer_payment_slip` | שובר תשלום |
| `building_permit` | היתר בנייה ותוכניות |
| `buildings_insurance` | ביטוח מבנה |
| `bank_preapproval` | אישור עקרוני מבנק |

#### `document_reading_intended.reading_kind` — סוג הקריאה

| value | Hebrew |
|---|---|
| `first` | קריאה ראשונה |
| `re_read` | קריאה חוזרת |

#### `document_reading_outcome.outcome` — תוצאת הקריאה

| value | Hebrew |
|---|---|
| `finished` | הסתיימה |
| `failed` | נכשלה |

#### `document_reading_outcome.failure_reason` — סיבת הכישלון

| value | Hebrew |
|---|---|
| `unreadable` | הקובץ לא קריא |
| `reader_unavailable` | קורא המסמכים לא זמין |
| `timed_out` | תם הזמן לקריאה |
| `file_deleted` | הקובץ נמחק לפני שנקרא |
| `id_not_on_case` | תעודת הזהות בעמוד אינה של אף אחד בתיק |
| `file_too_large` | הקובץ גדול מדי לקריאה |
| `unsupported_file` | סוג הקובץ לא נתמך, או שהקובץ פגום |
| `too_many_pages` | בקובץ יותר מעשרה עמודים |
| `page_too_large` | עמוד בקובץ גדול מדי לקריאה |
| `several_documents_in_one_file` | בקובץ כמה מסמכים, יש להעלות כל מסמך בנפרד |
| `ocr_failed` | זיהוי הטקסט נכשל |
| `length_required` | תקלה אצלנו: הבקשה לקורא נשלחה בלי אורך |
| `unknown_document_type` | תקלה אצלנו: הקורא לא מכיר את סוג המסמך |
| `ocr_not_configured` | תקלה אצלנו: זיהוי הטקסט לא מוגדר |

#### `document_filed.document_type` — סוג המסמך

| value | Hebrew |
|---|---|
| `payslip` | תלוש שכר |
| `id_card` | תעודת זהות |
| `id_appendix` | ספח תעודת זהות |
| `bank_statement` | תדפיס עו"ש |
| `mortgage_payoff_report` | דוח יתרות לסילוק |
| `eligibility_certificate` | תעודת זכאות |
| `land_registry_extract` | נסח טאבו |
| `form_106` | טופס 106 |
| `life_insurance` | ביטוח חיים |
| `purchase_contract` | חוזה רכישה |
| `purchase_tax_report` | דיווח העסקה לרשויות המס |
| `developer_payment_slip` | שובר תשלום |
| `building_permit` | היתר בנייה ותוכניות |
| `buildings_insurance` | ביטוח מבנה |
| `bank_preapproval` | אישור עקרוני מבנק |

#### `document_value_verified.target_kind` — מה אושר

| value | Hebrew |
|---|---|
| `transaction_stated` | העסקה |
| `property_stated` | הנכס |
| `borrower_identity_stated` | זהות הלווה |
| `employment_stated` | תעסוקה |
| `income_stated` | הכנסה |
| `obligation_stated` | התחייבות |
| `equity_source_stated` | מקור הון עצמי |
| `loan_request_stated` | בקשת ההלוואה |

#### `document_value_verified.withdrawal_reason` — סיבת הביטול

| value | Hebrew |
|---|---|
| `re_filed` | המסמך תויק מחדש |
| `uploaded_by_mistake` | הקובץ הועלה בטעות |
| `not_on_the_document` | הערך אינו מופיע במסמך |

#### `document_deleted.reason` — סיבת המחיקה

| value | Hebrew |
|---|---|
| `case_closed` | התיק נסגר |
| `case_lost` | התיק לא יצא לפועל |
| `uploaded_by_mistake` | הקובץ הועלה בטעות |

### Quick vocabulary digest (for course graduates)

- **Loan purposes (מטרת ההלוואה, `transaction_stated.purpose`)**: רכישת דירה · רכישת מגרש · בנייה עצמית · מחזור משכנתא מבנק אחר · מחזור משכנתא מאותו בנק · הלוואה לכל מטרה · שיפוצים · הרחבת נכס · בניית ממ"ד.
- **Transaction / seller**: ממי קונים = קבלן / מוכר פרטי · מחיר למשתכן (bool) · דירה יחידה / חליפית / נוספת (`other_home_status`: none=יחידה, will_sell=חליפית, keep=נוספת).
- **Property type (סוג הנכס)**: בניין משותף · בית פרטי. Land build type (סוג הבנייה): צמוד קרקע · רב קומות.
- **Track types (סוג מסלול, `loan_request_stated.tracks.track_kind`)**: פריים · קבועה לא צמודה · קבועה צמודה · משתנה לא צמודה · משתנה צמודה · הלוואת זכאות · אחר. (Linkage = צמודה/לא צמודה is folded into the track kind; there is no separate linkage field. Prime tracks carry מרווח מהפריים; all others carry ריבית.)
- **Repayment method (צורת תשלום, `payment_form`)**: שפיצר (spitzer) · קרן שווה (equal_principal) · בוליט (bullet). Grace = גרייס, 0–36 months.
- **Track purpose on a refinance (מטרת המסלול)**: מיחזור לדיור · מיחזור לכל מטרה · תוספת לדיור · תוספת לכל מטרה.
- **Refinance scope**: מחזור מלא או חלקי — למחזר הכל / למחזר חלק. Uniform basket term (תקופת ההחזר לסלים האחידים): 10/15/20/25/30 years.
- **Employment kinds (סוג העסקה)**: שכיר/ה · עצמאי/ת · שכיר/ה בעל/ת חברה (controlling owner). Stage: עבודה נוכחית / קודמת / עתידית. Employer classification (Mizrahi): שירות ציבורי · חברה פרטית · עסק קטן או חנות · חברה ציבורית · עוסק מורשה או עוסק פטור.
- **Income**: salary rows (שכר) with period חודשי/שנתי and basis נטו/ברוטו; other incomes (הכנסות נוספות) sources: שכר דירה · שכר דירה עתידי · פנסיה · קצבת נכות · דמי אבטלה · הבטחת הכנסה · קצבת ילדים · קצבה אחרת · מזונות · מלגה · דיבידנד · אחר. (`packages/schemas/src/other-incomes.ts`: every source is monthly net except dividend = annual net.)
- **Obligation types (סוג)**: משכנתא · הלוואה · ליסינג · שכר דירה · מזונות · אחר. Existing mortgage purpose: לדיור · כל מטרה · דיור + כל מטרה. Intent after new mortgage: תסולק · גרירה לדירה הנרכשת · ללא שינוי.
- **Equity sources (מקורות הון עצמי)**: 21 values (Mizrahi's 20 + מענק מדינה) — see enum table.
- **Borrower roles (תפקיד)**: לווה ראשי · לווה נוסף · ערב. Relation to primary: בן/בת זוג · הורה · בן/בת · אח/אחות · שותף/ה לעסקה · אחר.
- **Marital status (מצב משפחתי)**: רווק/ה · נשוי/אה · גרוש/ה · אלמן/ה · ידוע/ה בציבור.
- **Housing status (Mizrahi)**: אצל ההורים · בשכירות · במגורים ללא עלות חודשית · בנכס בבעלותי שאין בכוונתי למכור · בנכס בבעלותי שבכוונתי למכור.
- **Lead sources (מקור הפנייה)**: פה לאוזן · פייסבוק (ממומן) · פייסבוק (אורגני) · אינסטגרם · גוגל · האתר · הפניה משותף (עו"ד, מתווך) · לקוח חוזר · אחר. Case status: פנייה (enquiry) only.
- **Document types** (15): תלוש שכר · תעודת זהות · ספח תעודת זהות · תדפיס עו"ש · דוח יתרות לסילוק · תעודת זכאות · נסח טאבו · טופס 106 · ביטוח חיים · חוזה רכישה · דיווח העסקה לרשויות המס · שובר תשלום · היתר בנייה ותוכניות · ביטוח מבנה · אישור עקרוני מבנק.
- **Consent (Leumi credit-data consent validity)**: if funded — מועד סיום המשכנתא / תאריך מוקדם יותר; if not funded — 60 יום ממועד ההסכמה / מועד אחר.
- **Registry numeric bounds**: `loan_request_stated.term_months` 48–360; track `term_months` 12–360; `grace_months` 0–36; `purchasers_count` 1–10.

---

## 3. The advisor app's six categories (intake map)

`packages/schemas/src/readiness/intake-map.ts` (transcribes the Brain spec page "The advisor app screens, v1 cut"). Six categories, in the banks' order, and their steps:

| # | Category (he) | Steps (he) | Kind(s) |
|---|---|---|---|
| 1 | העסקה | העסקה | `transaction_stated` |
| 2 | פרטי הנכס | פרטי הנכס | `property_stated` |
| 3 | פרטי הלווים | מי בתיק (roster) · זהות, משפחה וילדים (per person) | `borrower_added`, `borrower_identity_stated` |
| 4 | תעסוקה והכנסות | תעסוקה והכנסות (per person; rows named "עבודה", "הכנסה") | `employment_stated`, `income_stated` |
| 5 | התחייבויות והון עצמי | התחייבויות · הון עצמי | `obligation_stated`, `equity_source_stated` |
| 6 | פרטי הבקשה | פרטי הבקשה | `loan_request_stated` (+ tracks) |

Consent (`consent_given`) "is off the map until its place is decided (Eden, 2026-10-03)". Before the sidebar: the open-case screen (name, phone, email, lead source, note) and the case list.

"Required" rule (`code-docs/architecture/case-screen.md`): "'Required' means required by at least one of the four banks under the case's current answers ... Required never blocks a save." Leumi counts only for purchases (CLAUDE.md: "Leumi only for purchases").

---

## 4. The four banks' public pre-approval questionnaires

Files: `context/inputs/{leumi,poalim,mizrahi,discount}-preapproval-questionnaire.md`, all read 2026-08-25 from the banks' public sites. All are in Hebrew. These are the *public consumer* forms, not the advisor panels.

### 4.1 Bank Leumi — `leumimortgage.formtitan.com`, "צעד ראשון לדירה" → "בקשה לאישור עקרוני"
"The questionnaire asks about 60 fields." Only the **purchase** track is this form: "שתי האפשרויות שאינן קנייה מוציאות את הפונה מהשאלון הזה למסלול אחר" (refinance and "other mortgage purposes" = self-build, renovation, any-purpose — go elsewhere).

Sections:
1. **העסקה** — סוג העסקה (משכנתא לקניית דירה או בית קרקע · מחזור משכנתא קיימת · מטרות משכנתא נוספות); מועד מתוכנן לעסקה (בחודש הקרוב · ב-3 חודשים הקרובים · יותר מ-3 חודשים · עדיין לא ידוע).
2. **הנכס והמחיר** — סוג הדירה (יד שנייה · חדשה מקבלן); מטרת הרכישה (דירה יחידה · דירה נוספת · מכירה-קנייה); עיר/יישוב; מחיר למשתכן? (כן/לא); שם הפרויקט; שם הקבלן; מחיר הדירה — **two prices on מחיר למשתכן** (מחיר למשתכן + שווי שוק), one otherwise. Policy hint: "בפרויקט מחיר למשתכן נאספים שני מחירים, ולפי מה שכתוב במסך סכום המשכנתא נגזר משווי השוק."
3. **הלווים** — applicant: first/last name, ID (**not required for the applicant**; required for each additional borrower, "9 ספרות כולל ספרת ביקורת"), birth date. Additional borrowers repeat: role (לווה · לווה שאינו ממשכן), relationship (בן/בת זוג · הורה/ילד · אח/אחות · שותפים לעסקה). Definition quoted: "**לווה שאינו ממשכן** לפי הגדרת הבנק: קרוב משפחה מדרגה ראשונה של אחד הלווים, שאינו בעל הנכס הנרכש, ומתחייב לשלם **לפחות 20% מההחזר החודשי**."
4. **יצירת קשר והסכמות** — email, mobile; one checkbox for terms + privacy + joining digital banking; accessibility service. Notice: a credit-bureau inquiry will be made.
5. **מצב אישי** — סטטוס משפחתי (5 values); מספר ילדים — "ילדים עד גיל 18". "הבנק מודיע מראש שיוודא שהסטטוס תואם את הרשום בתעודת הזהות."
6. **מיסוי ורגולציה** — foreign tax residency (+countries), public figure (definition: mayors, judges, MKs, ministers, ambassadors, senior party members, senior army/police officers "תת-אלוף או תת-ניצב ומעלה", senior managers of a government company), additional citizenship (+countries).
7. **תעסוקה** — מצב תעסוקתי: שכיר/ה · עצמאי/ת · שכיר/ה וגם עצמאי/ת · ללא עבודה. Salaried: seniority bands עד חצי שנה · חצי שנה עד שנתיים · מעל שנתיים; "שנה רצופה במקום הקודם?" when seniority is low; field; employer; risky profession (asked in every branch). Self-employed: when started (same bands). Not working: signed employment contract? + monthly **gross** per contract.
8. **הכנסות** — salaried: **monthly net**; self-employed: **annual net** "לפי אישור רו"ח מעודכן לחודש הקודם", expected future rent (annual), dividend in last tax assessment + amount (last two years). Other incomes repeat: השכרה · השכרה עתידית · פנסיה · קצבת נכות · מלגת לימודים · מזונות · הבטחת הכנסה · קצבת ילדים · כולל (all monthly) · דיבידנד שחולק (annual); can be assigned to several borrowers. "הבנק מבקש לא לרשום פעמיים הכנסה שכבר נרשמה תחת לווה אחר."
9. **חשבונות עו"ש** — main banks (9) and additional banks (10).
10. **התחייבויות** — "יש התחייבויות **מעל 18 חודשים**?"; rows: משכנתא · הלוואות · שכירות · מזונות + monthly amount + owner(s). Policy: "התחייבות נספרת רק אם היא נמשכת מעל 18 חודשים — **חוץ משכירות**, שנספרת בלי קשר למשך."
11. **העדפות המשכנתא** — requested amount **40,000 ₪ – 1,500,000 ₪**; desired term **4–30 years**; uniform-basket term 10/15/20/25/30 years; expected monthly payment **calculated** ("סימולציה בלבד, ללא התחייבות מצד הבנק").
12. **הסכמה לדוח אשראי** — consent to the credit-data register; validity if funded (mortgage end / earlier date); validity if not funded (**60 days** / other date); ID issue date (or "don't have it"). Report content: Bank of Israel credit-data register — loans, overdraft lines, credit-card lines, mortgages, insolvency, execution (הוצאה לפועל), account restrictions.
Documents: none uploaded in the form. Two review screens.

### 4.2 Bank Hapoalim — `mortgage.bankhapoalim.co.il/ng-portals/dm/he`, "בקשה למשכנתא בדיגיטל"
Wizard in four stages (פרטי ההלוואה · פרטים אישיים · הכנסות והתחייבויות · הגשת בקשה), screens 0–16. Source marks "required" only on two checkboxes.
- **0 Lobby** — eligibility: "ללקוחות כל הבנקים · **מעל גיל 18** · תושבי ישראל · מי שלא הגיש בקשה בסניף או במוקד"; prepare: property price/location, repayment-account details, personal details, incomes, obligations; mandatory consent checkbox; **separate track for mortgage advisors** "עם צירוף כתב הרשאה ואישור מפורש".
- **1 Purpose** — רכישה (דירה · מגרש · בנייה עצמית) · מחזור (מבנק אחר · מבנק הפועלים) · מטרות אחרות (לכל מטרה · שיפוצים · הרחבת נכס · בניית ממ"ד). Policy: "'בניית ממ"ד' — חרבות ברזל, **עד 200,000 ₪**."
- **2 Apartment type** — חדשה · מחיר למשתכן · יד שנייה.
- **3 Designation** — דירה יחידה ("אין לי דירה נוספת") · דירה חליפית ("יש לי דירה ואמכור אותה") · דירה להשקעה. Shows "**שיעור מימון מקסימלי עד X%**".
- **4 Property** — price, market value, city, street, number, "לשלב הלוואת זכאות?"; land/self-build branch (land cost, from whom, mortgage on land?, at Poalim?, amount, expected build cost, permit?, build type צמוד קרקע/רב קומות, units); any-purpose/renovation/extension branch (existing mortgage? balance? at Poalim? what for); refinance branch (at Poalim?, repayment account bank/branch/number, pledged property city, payoff balance "ללא עמלת פירעון מוקדם", **attach דף יתרות משכנתא**).
- **5 Amount** — amount ("שהוא X% ממחיר הדירה / משווי השוק"), term in years. Policy: "הערה למסלול 'לכל מטרה': **עד 50% מערך הנכס**."
- **6 More details** — contract signed?; when money needed (עוד חודש וחצי · בין חודש וחצי ל-3 חודשים · בעוד 3 חודשים או יותר); buying from a relative? ("בחירת 'כן' מנתבת לפגישה בסניף"); number of partners (incl. spouses).
- **7 Borrower details — up to 6 borrowers** — name, gender, ID, birth date, birth country, address, mobile, email (+verify), extra citizenship/tax residency, "האם הדירה הנרכשת תירשם על שמך?", two mandatory consent checkboxes.
- **8 Family** — marital status; "יש לך ילדים **עד גיל 21**?"; in custody?; number; ages; partner's non-shared children.
- **9 Borrower list** — add/edit/delete up to 6; "(לא מרוכשי הדירה)".
- **10 Work (per borrower)** — status שכיר/ה · עצמאי/ת · שכיר/ה בעל/ת חברה · לא עובד/ת; profession; employer; address; start/end dates; salary — "**שכיר: ממוצע 3 חודשים אחרונים ללא בונוסים · עצמאי: ממוצע חודשי בשנתיים האחרונות לפי רו"ח או שומה**"; additional job; previous job if seniority under a year.
- **11 Other incomes** — source, monthly amount, detail; rent: "האם הנכס בבעלותך וחוזה שכירות על שמך? — **אם לא — לא ניתן להכיר בהכנסה**"; allowance vs unemployment; temporary vs permanent.
- **12 Obligations** — type, monthly payment, balance, end date, lender (bank / insurance company), detail; at Poalim?; what happens to existing mortgage (אסגור · אגרור לדירה הנרכשת · אשאיר ללא שינוי). Then a **repayment-capacity screen showing the maximum mortgage amount**.
- **13 Equity** — source, amount, detail; shows total equity and "נשאר לממן".
- **14 Mix (optional, else "generic offer")** — track type, interest type, rate %, payment form, **term 12–360 months**, **deferral 1–36 months**; "מסלול 1 / מסלול נוסף / נקה מסלול"; remaining to allocate.
- **15 Submit** — ID issue date, handling branch, file attachments (**up to 9MB per file**), OTP.
- **16 Done** — answer by SMS/phone **"עד 21 ימי עסקים"**.
Notable (file's own list): child age 21 vs 18; asks repayment account on refinance; registration as owner asked separately from borrowing; intent for existing mortgage; rent income needs ownership + lease in name; allowance temporary/permanent; any-purpose ≤50% of value; ממ"ד ≤200,000 ₪; OTP + upload; advisor track.

### 4.3 Bank Mizrahi-Tefahot — `sc.mizrahi-tefahot.co.il/TofesMashkantaClient`, "הצעד הראשון שלכם בדרך הביתה"
"8 שלבים, **138 שאלות מוגדרות** (כולל החזרה על הבלוק לכל לווה 1–5)." Entry paths: new · continue · **advisor entry** · refinance request. Source marks no required fields.
- **Stage 0 — Advisors**: advisor ID, name, phone, advisory company, client ID.
- **Stage 1 — Start**: name, ID, birth date, phone, email, marital status (גרוש/ה · רווק/ה · נשוי/ה · אלמן/ה), more borrowers? (**up to 6**), marketing consent; relation list: בן/בת · אח/אחות · בן/בת זוג · אחר.
- **Stage 2 — Loan details**: purpose (קניית דירה מקבלן · קניית דירה יד שנייה · בנייה עצמית · הרחבה · קניית מגרש · הלוואה לכל מטרה · שיפוצים); what for (text); amount; eligibility certificate from the Ministry of Construction & Housing + eligibility loan amount; "לכמה שנים ברצונך לפרוס"; generic mix vs own mix (הרכב גנרי · תמהיל עצמאי) → mix table: track type · amount · term · rate; own a dwelling?; loan against owned vs purchased property; intend to sell?; מחיר למשתכן?; market value / contract cost.
- **Stage 3 — Property**: city (**1,506 settlements**, bank table); value; land value + building costs; land owned?; intend to build?; expected build cost; already pledged?; contract signed?; how soon money needed.
- **Stage 4 — Borrowers**: children (**up to age 18**), current housing (5 values), pays alimony?, education (8 values) + profession (**329 professions**), employment (שכיר · עצמאי · לא עובד · גם עצמאי וגם שכיר), seniority bands (מתחת לשנה · יותר משנה · יותר מ-3 שנים), previous job duration, monthly income, organisation name/classification/workplace, annual income, start date + monthly net (salaried), start date + annual net (self-employed), other incomes table (מקום עבודה נוסף · קצבת נכות · הכנסה משכ"ד · קצבת ילדים · דמי מזונות · מלגה · אחר · אין לי הכנסות נוספות). Block repeats for borrowers 1–5.
- **Stage 5 — Obligations**: balance on existing lien, monthly payment, years to lien end, alimony amount/end; obligations table (משכנתא · הלוואה (מכל סוג) · מזונות · שכר דירה) with balance, monthly payment, end date.
- **Stage 6 — Financing sources**: equity table (20 sources) + "מה גובה ההחזר הרצוי על המשכנתא?".
- **Stage 7 — Summary**: anything else; marketing consent; branch (**152 branches**); how to receive the pre-approval (אפליקציה · מייל).
Documents: none in the form.

### 4.4 Bank Discount — `mortgage.discountbank.co.il/mortgage/public/new-transaction`, "בקשת אישור עקרוני למשכנתא"
2571 lines. Angular SPA, 4 steps (על הנכס / העסקה · עליי ועל הלווים · על המשכנתא · העדפות וסיום). Extracted from live browser (step 1 only), the CMS API `GET /api/DebtorPurpuseList` (33 screen objects) and the app's text dictionary. Steps 2–4 not walked live (a mandatory consent checkbox was not ticked).
- **Welcome — eligibility (verbatim)**: "ללקוחות כל הבנקים · **אזרח ישראל, מעל גיל 18**, השירות אינו מיועד לתושבי חוץ, מתן משכנתא יתאפשר בסניפי הבנק בארץ בלבד · **למי שאינו איש ציבור או איש קשור לאיש ציבור** · לרכישת דירה יד ראשונה / שנייה · מי שלא הגיש עדיין בקשה בסניף". Every screen repeats: "אי עמידה בפירעון ההלוואה עלול לגרור חיוב בריבית פיגורים והליכי הוצאה לפועל."
- **Deal type**: רכישה מקבלן ("ליווי בנקאי בלבד, כשהבטוחה ללקוח היא ערבות 'חוק מכר'") · רכישה מיד שניה · רכישה במחיר למשתכן · מחזור משכנתא או עסקה אחרת → מחזור מבנק אחר · מחזור משכנתא מדיסקונט · עסקה אחרת (early exit: "בנקאי חוזר").
- **Refinance prep**: "כדאי לדאוג שיהיו לך '**דוח יתרות**' ו'**דוח התנהלות משכנתא**'. אנחנו לא נבקש אותם".
- **Property**: type בניין משותף / בית פרטי; location (city autocomplete); value (purchase = contract price; refinance = market value now); **מחיר למשתכן tooltip (policy)**: "אפשר לקבל אחוז מימון לפי שווי השוק של הדירה, כל עוד שווי השוק של הדירה לא גבוה מ-**2,100,000**, אם עולה על 2,100,000- שיעור המימון ייקבע על-פי השווי לפי החוזה."
- **More properties** — "לכמות הדירות שבבעלותך יש השפעה על אחוז המימון": לא, אין לי עוד דירות · יש לי אבל אמכור **בשנתיים הקרובות** · כן, יש לי עוד דירות; will buyers live in it?; seller is a relative (second-hand only).
- **Personal**: name, birth date ("**ניתן להגיש בקשה בגילאים 18 עד 90 בלבד**"), email, mandatory consent; marital status incl. 3 common-law combos; household size ("במספר האנשים שגרים בבית"); marriage date "ניתן להזין תאריך נישואין עתידי **עד 3 חודשים** מהיום".
- **Employment**: שכיר/ה · עצמאי/ת · בעל/ת שליטה · בין עבודות; seniority עד שנה · שנה עד שנתיים · שנתיים עד חמש שנים · מעל חמש שנים; previous job when short seniority.
- **Extra income**: "סכום כסף קבוע שנכנס כל חודש. הכנסות כמו שכ"ד, מזונות וקצבאות". **Expenses**: "רק הוצאות שימשיכו להיות משולמות גם עוד **שנה וחצי** ומעלה" (rent, other loan, alimony, other mortgage, other).
- **More borrowers**: relation זוג · אחים · הורה · אחר; household-level incomes/expenses.
- **Amount needed**: "יש לי / אני רוצה לקחת"; policy: "**ההחזר החודשי המוצג הוא לפי פריסה ל-30 שנה, בריבית של 5.5%, במסלול קבוע.**" + link to Bank of Israel max financing rates (`/lp/shiur-mimun-max`); מחיר למשתכן "מענק מקום" popup.
- **Refinance chain**: mortgage type (לדיור · לכל מטרה · דיור + לכל מטרה); full/partial; amount to Discount + amount left at other bank; refinance amounts (must "**לכלול עמלת פירעון מוקדם**"); extra amounts; validation "שווי סכום למיחזור לא יכול להיות גדול מ {0}% מערך הדירה"; years: "**המקסימום הוא 30 שנים · המינימום הוא 5 שנים**" (by Discount / Mercantile / uniform basket); where managed (בנק · חברת ביטוח · אחר); conduct (תקין · לא לגמרי תקין, "בלי שתשלומים חזרו").
- **Preferences**: when money needed (לחודש הקרוב · עד 3 חודשים · יותר מ-3 חודשים); maximum comfortable monthly payment; **deferral of principal** (6/12/18/24 months); **exit points** (תחנות יציאה: "אפשר לפרוע את ההלוואה מבלי לשלם עמלת פירעון מוקדם" — חשוב מאוד · חשוב · לא חשוב · לא החלטתי); extra info, upload competing bank offer, branch, consent to pass details to the bank's insurance agency.
- **Legal popup**: credit-data notice (credit bureau → Bank of Israel credit-data register; sent to all borrowers and guarantors), truth declaration, authorization to submit / renew a pre-approval.
- **After approval texts**: "החזר חודשי (נומינלי)", "תוקף ההצעה"; then upload documents.
- Documents (public flow): upload screen exists after approval; detailed catalog is in the advisor folder (section 5).

### 4.5 Comparison across the four public forms

| Topic | Leumi | Poalim | Mizrahi | Discount |
|---|---|---|---|---|
| Purposes covered | Purchase only (refinance/other routed elsewhere) | Purchase, land, self-build, refinance (2), any-purpose, renovation, extension, ממ"ד | Contractor/second-hand purchase, self-build, extension, land, any-purpose, renovation (+ refinance entry path) | Contractor, second-hand, מחיר למשתכן, refinance (other bank / Discount), "other" = early exit |
| Max borrowers | repeat block (no number stated) | up to 6 | up to 6 (block for 1–5 extra) | not stated publicly (advisor panel: 1–4) |
| Age rule stated | — | over 18 | — | 18–90 (birth date validation); citizen, over 18 |
| Children counted to age | 18 | 21 (+ custody, ages, partner's children) | 18 | household size instead; partner/children block on married |
| Income unit | salaried monthly net; self-employed annual net; not-working monthly gross by contract | salaried avg of last 3 months w/o bonuses; self-employed monthly avg over 2 years | monthly net + annual net per branch | monthly fixed income |
| Obligations counted | > 18 months, except rent always | all, with balance, end date, lender | table with balance, payment, end | only those continuing ≥ 1.5 years |
| Equity asked | no | yes (free source) | yes (closed list of 20) | screen has no fields (stated "not asked until verified") |
| Requested mix / tracks | no (only uniform-basket term) | optional mix: type, interest type, rate, payment form, 12–360 months, deferral 1–36 | generic vs own mix: type, amount, term, rate | not in public flow (advisor panel: 1–8 tracks) |
| Amount / term limits | amount 40,000–1,500,000 ₪; term 4–30 y | any-purpose ≤ 50% of value; ממ"ד ≤ 200,000 ₪ | — | refinance years 5–30; amount ≤ value; display assumes 30 y @ 5.5% fixed |
| Financing % shown | מחיר למשתכן: mortgage from market value | "שיעור מימון מקסימלי עד X%" by designation | — | number of owned flats affects %; מחיר למשתכן ≤ 2.1M uses market value |
| Unique asks | public figure; credit-consent expiry dates; current-account banks; risky profession; ID issue date | gender, birth country, address, registration as owner, repayment account on refinance, intent for existing mortgage, rent-income ownership rule, allowance temporary/permanent, OTP + uploads (≤9MB) | education, profession list (329), housing status, employer classification, eligibility certificate, collateral choice, comfortable monthly payment, branch & answer channel | will buyers live there, seller is relative, household size, exit points, deferral, existing mortgage conduct/manager, competing-offer upload |
| Advisor channel | — | separate advisor track with power of attorney | Stage 0 advisor entry | parallel `agent/` API path (authenticated advisor panel) |
| Answer time | — | up to 21 business days | app or email | — |

---

## 5. Discount advisor panel (authenticated channel)

Folder: `context/inputs/discount-advisor/` (inspected 2026-09-17). README status: "**extraction in progress. The 100% target is not met.**" Live checks: borrowers, all six property choices, a second-hand purchase loan; one dummy record saved; stopped before the loan legal confirmation. `field-inventory.json`: 61 entries, 32 dependency rules. (Policy wording in the README: "These are observed form calculations, not financial guidance.")

### Borrowers page (`step1/borrowers`) — README + field-inventory
- 1–4 borrowers (rule `borrower_limit`).
- Names 2–25 characters, Hebrew pattern; ID checksum + no duplicates + remote validation; **birth date: age 17–90** (`dateFrom`); phone 10 digits starting with 0; email ≤50 chars and must differ from the advisor's email.
- First borrower must confirm property ownership (`isBorrowerOwner`) and the communication/privacy confirmation (`approveMarketing`).
- Family status: רווק · נשוי · גרוש · אלמן · רווק - ידוע בציבור · אלמן - ידוע בציבור · גרוש - ידוע בציבור (ids 1,2,3,4,6,7,8; common-law maps 6→1, 7→4, 8→3 with `IsCommonLawPartner=1`). No children questions.
- Additional borrower relation: זוג · אחים · הורה · אחר; shared household (default true). Household size 1–20 (required for first borrower and any separate household). Optional amounts: הכנסה משכירות · קצבאות · הכנסה ממזונות; expenses תשלום שכירות · הלוואות אחרות · תשלום מזונות · משכנתה אחרת · הוצאות אחרות.
- Employment row: status שכיר · עצמאי · בעל שליטה · בין עבודות; workplace, position (≤30 chars); **monthly net salary 1,000–3,000,000 ₪**; tenure עד שנה · שנה עד שנתיים · שנתיים עד חמש שנים · מעל חמש שנים. Self-employed/controlling owner also **annual gross income per tax assessment, 1,000–3,000,000 ₪** (`lastTax`). "Between jobs" sets salary 0 and clears details.
- Shortest tenure on the main job adds a previous-job row (rule `previous_job`). Rule `tenure_dates`: tenure bands map to start dates 6/12/24/60 months ago (previous: 12/18/30/66, ending 6 months ago) — "derived placeholders, not exact dates".

### Property page (`step2/asset-details`)
- Six deal types: רכישה מקבלן (1) · רכישה מיד שנייה (2) · רכישה במחיר למשתכן (3) · מיחזור פנימי (7) · מחזור מבנק אחר (5) · אחר (4).
- City required (1,493 entries). Property type בבניין משותף / בית פרטי (not asked on subsidized; sends apartment).
- **Valuation bounds**: estimated value min **10,000**, max validator 100,000,000 (but 8-char input limit); subsidized assessment/agreement each **10,000–10,000,000**.
- Primary residence (purchases only); more assets: לא, אין עוד דירות · יש, אבל יימכרו **בשנה וחצי** הקרובות · כן, יש עוד דירות; seller is family (second-hand).

### Loan details page (`step3/deal-details`) — concrete rules (field-inventory `rules`)
- `loan_cap` (source-confirmed): "**status1 LTV=.75; status2=.7; status3/default=.5; floor(assetValue*LTV). Refinance helper status1=.7.**" README: "The cap uses property value and ownership status: 75%, 70%, or 50%." (the README calls the input "ownership status" (`apartmentStatus` from `getApartmentStatus`); that status 1/2/3 corresponds to the three more-assets answers none / will sell / keeps is an inference from the matching 1/2/3 ids, not stated in the files). Live check: "For a 2,000,000 ILS first-property purchase, Next accepted 1,499,999 and 1,500,000, and blocked 1,500,001."
- `subsidized_cap` (מחיר למשתכן): "A=agreement, P=assessment, T=2100000, D=100000. If A>T cap=.75*A. Else H=.9*A, I=.75*min(P,T): if I<H cap=I; else cap=(A-H<D ? A-D : H). floor cap. assetValue=(A<=T ? P : A)." README: "piecewise formula with a 2,100,000 ILS threshold and a 100,000 ILS equity check. Preserve its order of operations". Edge case rule `subsidized_negative_cap_case`: agreement 10,000 / assessment 99,999 → −90,000 ("not a valid loan offer").
- `normal_sum`: sum of track amounts must equal the requested amount (a one-shekel mismatch blocked progression).
- `refinance_total_cap`: total = housing + any-purpose + enabled extras; ratio: no extras ⇒ 1; extra any-purpose ⇒ .5; extra housing with apartmentStatus 1/2 ⇒ .7 else .5; total ≤ assetValue × ratio.
- `refinance_sum`, `partial_sum`: refinance category amounts must equal the sums of tracks by mortgage type (7 housing, 8 any-purpose, 11 extra housing, 9 extra any-purpose); partial = Discount amount equals housing + any-purpose.
- **Tracks (mix)**: start with 1, **up to 8**, first not removable. Track types (`mixTypeControl`): פריים (1) · משתנה פעם ב-5 שנים, לא צמודה למדד (2) · קבועה לא צמודה (3) · משתנה פעם ב-5 שנים, צמודת אג"ח (4) · קבועה צמודת מדד (5). **Terms 1–30 years; types 2 and 4 only multiples of 5 (5,10,…,30)**; changing type clears the term.
- Purchase tracks: payment delay (דחייה) ללא דחייה · 6 · 12 · 18 · 24 חודשים. Refinance tracks: mortgage type משכנתא לדיור · משכנתא לכל מטרה · תוספת לדיור · תוספת לכל מטרה.
- Uniform basket (סל אחיד) term 10/15/20/25/30 years — required outside "other".
- Refinance: where the mortgage is managed (בנק · חברת ביטוח · אחר); conduct (מתנהלת תקין · מתנהלת לא תקין); need extra (לא/כן).
- Service: מוקד מומחים vs סניף; branch required (68 entries); optional insurance-agency consent; legal popup "הודעה בנוגע לקבלת חיווי אשראי".
- `course_mapping`: tracks map to the bank's internal course codes (e.g. Discount no-delay [5020,5050,5060,5070,5001]; Mercantile [6939,6985,6090,6070,6210]) — evidence that Discount and Mercantile (same group) price separately.

### Documents (`step4/upload-deal-files`) — `documentsList.json`
Public catalog: borrower docs 101 צילום תעודת זהות וספח (**mandatory**), 121 דפי חשבון (3 last months of all private accounts + loan details), 110 תלושי שכר (3 last months), 6 אישור שומת מס, 7 אישור מרואה חשבון, 8 טופס 106 של שנת המס הקודמת, 113 מאזן בוחן ורווח והפסד, 115 מאזן מבוקר אחרון. Deal docs: 7133 כתב הרשאה (**mandatory**, advisor authorization form), 7197 אישור זכויות, 26 חוזה מכר (incl. annexes), 200 נסח טאבו או אישור זכויות, 27 אישור זכויות חברה משכנת (issued up to a month before the application), 7126 נסח טאבו, 7127 אישור זכויות מנהל (רמ"י, up to a month old), 290 שוברים (payment voucher). For one second-hand purchase with one salaried borrower the bank returned 26, 7128 (competing-bank offers — absent from public catalog), 7133, 101, 110, 121. Max file size 14,680,064 bytes; allowed `doc,docx,htm,rtf,pdf,tiff,png,jpg,gif,jpeg,csv`.

---

## 6. The engine (calculations app) — `code-docs/architecture/engine-and-reader.md`

- One Python package `services/engine/src/edea_engine/` served as two FastAPI apps: `calculations/` ("the engine: monthly income, by code") and `reader/` (document reader). Neither holds a DB login; answers return to the TypeScript API, which writes. The engine imports nothing from the reader, Azure or Anthropic (`tests/calculations/test_import_boundary.py`).
- **Computes today — only one route**: `POST /v1/calculations/monthly-income`. Input: `{ "months": [{ "month": "YYYY-MM", "net_pay": "<agorot digits>" }] }`. Output: `{ monthly_income, period: "monthly", basis: "net", months_counted, consecutive_months: passed|failed|could_not_run }`.
  - Formula: **average of the months' net pay in whole agorot, rounded half up to the agora** (840,000.5 → 840,001). Any number of months ≥1; a month twice is refused; which months count "is the advisor's choice until a rule is set" (BIZ-38). Code: `services/engine/src/edea_engine/calculations/monthly_income.py:47-59` (sum ints, `Decimal` divide, `quantize(ROUND_HALF_UP)`), consecutive check `:62-73`, month number `:76-80` (`year*12 + month - 1`).
  - `GET /health` → `status`, `engine_version`.
- Money in Python: `services/engine/src/edea_engine/money.py` — `Agorot` frozen int wrapper refusing float/bool/negative; wire form = digit string ≤19 digits ≤ bigint max (`LARGEST_AGOROT = 9_223_372_036_854_775_807`). "There are no rates on the Python side yet."
- **Planned (not built)** — from CLAUDE.md: "**Next is ENG-223**: the engine calculates each track's monthly payment, the total and the repayment ratio, and the API calls the engine for the first time. **Then ENG-222**: the loan request screen shows those figures read-only (Eden, 2026-10-02)." The doc: "the calculations app deploys the same way when the API first calls it." Registry comment: "The financing cap is an engine computation, not a registry rule." No Spitzer/annuity formula exists in code yet.
- Reader (for context): `POST /v1/readings` with `document_type=payslip` (only definition today); limits 20 MB, 10 pages, 10,000 px a side; OCR = Azure Document Intelligence `prebuilt-read`; values carry trust level `look_closely` until the "Claude arm" is built; checks such as `gross_minus_mandatory_deductions_equals_net`, `id_number_check_digit`, `no_one_off_payment_in_month`.

---

## 7. Calculation code found in the repo

Grep (excluding `node_modules`, `.git`, `context/retired`) for `spitzer|שפיצר|annuity|amortiz|pmt|repayment ratio|ENG-223|יחס החזר|LTV|financing cap`:
- **No implementation of Spitzer / annuity / amortization / PMT / repayment ratio / LTV exists in code.** Hits are only:
  - `packages/schemas/registry/v1.yaml` — enum value `spitzer: שפיצר` (payment_form) and the comment "The financing cap is an engine computation, not a registry rule."
  - `packages/schemas/src/registry/registry.test.ts:352` — `payment_form: "spitzer"` as test data.
  - `CLAUDE.md:13` / `AGENTS.md:44` — the ENG-223 plan sentence.
  - `context/inputs/discount-advisor/field-inventory.json` — Discount's own LTV/cap rules (section 5).

Existing arithmetic (all sums, no financial formulas):
- `services/engine/src/edea_engine/calculations/monthly_income.py:47-59` — average net pay, `ROUND_HALF_UP` to the agora.
- `apps/advisor-web/src/cases/intake/request/tracks.ts:76-80` — `tracksTotal`: BigInt sum of saved track amounts; `:89-100` `purposeTotals` (refinance split by track purpose); `:102-117` `balanceOf`: requested − tracks total → `left` / `exact` / `over`; `:120-130` texts "נשאר ₪X להתאים למסלולים" / "₪X מעל הסכום המבוקש".
- `apps/advisor-web/src/cases/intake/obligations/running-obligations.ts:6-31` — an obligation whose `end_date` passed pays nothing now; `runningMonthlyTotal` sums `monthly_payment` of running obligations (all ended ⇒ ₪0).
- `apps/advisor-web/src/cases/intake/summaries.ts:97-180` — employment summary adds only incomes stated **monthly and net**, salaries only of **current** jobs ("a sum across periods or bases is no amount at all").
- `apps/advisor-web/src/lib/format.ts:220` — `agorotTotal` (exact BigInt agorot sum used above).
- `packages/schemas/src/amount-limits.ts:13-28` — amounts that must be above zero: income amount, equity amount, obligation balance, track amount ("a monthly payment of ₪0 is a balloon loan's").
- `packages/schemas/src/other-incomes.ts:19-33` — unit per other-income source (all monthly net; dividend annual net).
- `packages/schemas/src/salary-questions.ts` — table of which salary each bank asks per job kind/stage (e.g. Leumi "הכנסה חודשית נטו" salaried current; Poalim "ממוצע 3 חודשים אחרונים ללא בונוסים").
- `packages/schemas/src/money.ts` — branded `Agorot`, `NominalRateBp`, `EffectiveRateBp` (see `code-docs/concepts/money-and-rates.md`: "Nominal and effective rates are different types, because confusing a quoted rate with the rate after compounding and fees is the mistake that matters most in a mortgage comparison.")

---

## 8. Other code-docs pages that explain the domain

`code-docs/` (published as a private Docusaurus site):
| Page | Purpose (one line, from the page's opening) |
|---|---|
| `index.md` | Entry point: advisor app, customer app, engine, reader, product API. |
| `concepts/field-registry.md` | One YAML says which kinds exist, their fields, types, conditions and which bank asks each. |
| `concepts/money-and-rates.md` | Money is whole agorot, rates whole basis points, nominal vs effective rate types; Python `Agorot`. |
| `concepts/document-reading.md` | How the reader finds payslip values by label, checks them, assigns trust levels and page boxes. |
| `concepts/sessions-and-auth.md` | Staff Google sign-in + self-built sessions in Postgres. |
| `concepts/comments.md` | Why code comments look the way they do (not domain). |
| `architecture/case-screen.md` | The intake map, the "required" rule, sidebar/card, step navigation, borrower roster, salary boxes. |
| `architecture/advisor-app.md` | The Vue RTL app, design system, shell. |
| `architecture/event-log.md` | The append-only `events` table and its 13 columns. |
| `architecture/projection-tables.md` | 15 typed tables (11 client-stated, 4 documents) built by the projector. |
| `architecture/write-path.md` | Validate → append → project → commit, one transaction. |
| `architecture/timeline.md` | "היסטוריית התיק" — the case history rebuilt from the log. |
| `architecture/document-readings.md` | Upload route, jobs queue, reading history, suggestions. |
| `architecture/document-storage.md` | Storage seam: Postgres now, Cloudflare R2 later. |
| `architecture/engine-and-reader.md` | The two Python services, routes, refusals, limits (section 6). |
| `architecture/database-privileges.md` | Postgres grants enforce "no code writes projections directly". |
| `architecture/deployment.md` | Render deployment sequence. |
