# Repo research notes — the Mogi design system (edea-mortgage)

Source repo: `/home/user/edea-mortgage` (read-only).
- `git rev-parse origin/main` = `6156bf8d953471ade753cd9d31c5b71d674cfbf8`
- `git rev-parse HEAD` = `6156bf8d953471ade753cd9d31c5b71d674cfbf8` (HEAD == origin/main)
- Compiled 2026-10-09. Transcribed from files; nothing invented.

Handoff folder: `/home/user/edea-mortgage/context/inputs/advisor-design-system/internal-v1/` — owner Amit (VP Product). "It decides look, feel and UX — never which fields or questions the flow asks." Rule file: `.claude/rules/advisor-ui.md`: "Where this file and the handoff disagree, the handoff's files win."

---

## 1. Master prompt — `00-MASTER-PROMPT-Mogi-Design-System-Handoff.md` (179 lines, Hebrew), every rule

The prompt itself says: "אם יש סתירה בין הטקסט כאן לבין הקבצים, הקבצים גוברים" (files win over text). A byte-identical copy is in `uploads/00MASTERPROMPTMogiDesignSystemHandoff.md`.

### 1.1 Context (§1)
- Mogi = Israeli mortgage company; the system is an **internal system for mortgage advisors** ("לא מוצר צרכני"); users run dozens of cases in parallel against banks and deadlines.
- Philosophy: **"Service First, Software Second"** — software serves an existing human service process.
- **Anti-roadmap principle**: "לא לבנות דברים מוקדם מדי, לפני שהצורך האמיתי הוכח" — e.g. don't promote a pattern to an official component after a single use.
- Phase 2 will grow into a broader platform, so tokens/components must scale.

### 1.2 Foundational decisions (§2, "do not change without asking")
- Components: **headless, Radix/shadcn style** (logic separated from styling).
- Font: **Heebo** (Google Fonts), chosen explicitly over Rubik.
- v1 scope is comprehensive: States, Motion, Elevation/Z-index, RTL rules all in v1.
- A code token file is required *in addition to* the visual docs (tokens.css + tailwind.config.js) "so developers don't copy values by eye from the screen".
- **RTL**: every screen `dir="rtl"`, Hebrew.

### 1.3 Brand identity (§3)
- **Navy `#03071E`** — trust, stability, authority. Use: top navigation, headings, primary text, secondary buttons.
- **Digital Turquoise `#00F5D4`** — technology, progress. **Accent only**: primary CTA, highlights, active links. **"לא צבע רקע כללי"** (not a general background colour). The Foundations board adds: status colours are for status only, "הטורקיז נשאר ייחודי ל-Accent/CTA".
- Turquoise sub-palette: **Mint `#A7FFEB`** (hover / secondary backgrounds), **Turquoise Classic `#00CECB`** (secondary CTA), **Deep Teal `#0A9396`** (secondary text/borders).
- **Logo (`logo.png`) never flips in RTL.**

### 1.4 Tokens (§4) — source of truth `tokens.css`
- Neutrals (blue-tinted grey): N0 `#FFFFFF` · N50 `#F7F8FA` · N100 `#EEF0F3` · N200 `#DDE1E7` · N300 `#C2C8D2` · N400 `#98A2B3` · N500 `#6B7386` · N600 `#4B5165` · N700 `#333A4D` · N800 `#1C2233` · N900 `#03071E` (= Navy).
- Usage: page backgrounds N0/N50 · borders N200 · secondary text N500 · primary text N900.
- **N400 rule (lesson from audits)**: N400 failed contrast (below 3:1 / 4.5:1) every time it was used for real text on a light background. **Never use N400 for real content text — only disabled/placeholder. Real secondary text is always N500 or darker; on an N100 background even N500 can fail, so use N600 there.**
- **Status colours (semantic, not brand!)**:
  - Success `#0E9F6E` / bg `#E7F7F1` — completed, approved, sent successfully.
  - Warning `#B45309` / bg `#FDF3E7` — waiting for client/bank, deadline approaching. *Original value `#D97706` was changed to `#B45309` because it failed contrast on its background — only 2.91:1.*
  - Danger `#DC2626` / bg `#FDEAEA` — urgent, late, deadline breached.
  - Info `#2563EB` / bg `#EAF1FD` — in progress, general info, draft.
- Typography (Heebo): H1 32/40 700 · H2 24/32 700 · H3 20/28 600 · Body L 16/24 400 · Body M 14/20 400 · Caption 12/16 500.
- Spacing (4px grid): space-1 4 · space-2 8 · space-3 12 · space-4 16 · space-5 20 · space-6 24 · space-8 32 · space-10 40 · space-12 48 · space-16 64 (px).
- Radius: sm 6 · md 10 · lg 14 · pill 999 (px).
- Shadows: sm `0 1px 2px rgba(3,7,30,.06), 0 1px 1px rgba(3,7,30,.04)` — card · md `0 4px 12px rgba(3,7,30,.08), 0 2px 4px rgba(3,7,30,.04)` — menu · lg `0 12px 32px rgba(3,7,30,.14), 0 4px 8px rgba(3,7,30,.06)` — modal.
- Motion: fast 120ms ease-out `cubic-bezier(0.16,1,0.3,1)` — hover, press · base 200ms ease-in-out `cubic-bezier(0.4,0,0.2,1)` — tabs, dropdown, accordion · slow 320ms ease-in-out — modal enter/exit.
- Z-index: z-base 0 (content) · z-dropdown 100 · z-sticky 200 (sticky header) · z-overlay 300 (modal backdrop) · z-modal 400 · z-toast 500 · z-tooltip 600 (always on top).
- Breakpoints: Mobile <640px · Tablet 640–1024px · Desktop >1024px.
- **Icons**: stroke (outline) only, 24px grid, 1.75px stroke, rounded caps. **No emoji, no dingbats — always SVG.**
- **RTL mirroring table**: navigation/paging arrow — **flips** ("forward" points left in RTL) · chevron (expand/collapse) — no (vertical, symmetric) · **Mogi logo — never** (fixed brand) · check/document/clock — no (unrelated to reading direction).

### 1.5 Components with states (§5)
- **Buttons**: Primary = turquoise + navy text. Hover = Deep Teal `#0A9396` (or `#00C4AB`). Focus = ring `box-shadow: 0 0 0 3px rgba(3,7,30,.15)`. Active/Pressed = `#00C4AB` + `transform: scale(0.98)`. Disabled = N100 background + N400 text. Secondary = navy outline. Destructive = red. **Always a clear label, never icon only.** Hover/active transitions use motion `fast` (120ms). Focus ring always visible on keyboard, not only on mouse hover. (Board CSS: `.btn` 14px/600, radius md, padding 10px 20px; `.btn-sm` 13px, 7px 14px; hover sample = teal-deep bg with white text; secondary = white bg, navy text, 1.5px navy border.)
- **Inputs**: Default (border N200) → Focus (turquoise ring: `border-color: var(--turquoise-2)`, `box-shadow: 0 0 0 3px rgba(0,206,203,.18)`) → Filled → Error (red ring + error message **under the field**, not just border colour; board: `border-color: danger; box-shadow 0 0 0 3px rgba(220,38,38,0.12)`) → Disabled (bg N50, text N400, border N100). Board: label 12px/600 N600; input 14px, padding 10px 14px, radius md.
- **Required / optional label**: red asterisk `*` (`color: var(--danger)`, 11px, 600) next to the label for required; "לא חובה" in grey N500 11px for optional. **The asterisk marks required, not error.** Applies to **every field in every form**. (This is the one intake-derived convention promoted to an official component.)
- **Badges / status pills**: one status per pill, never combined. Dot + text, `-bg` background + status-colour text (board: radius pill, 5px 12px, 12px/600, dot 7px). **Dark pill (N900/Navy bg, turquoise text) is reserved only for the Owner**, never a status. Board samples: הושלם · ממתין ללקוח · דחוף · בתהליך · טיוטה · "Owner · אילון".
- **Tabs**: turquoise underline `border-bottom: 2.5px solid var(--turquoise-2)` on the active tab only; inactive text N500; motion `base`. Max 5–6 tabs per row, beyond that a menu. Board tabs: סקירה · דורש טיפול · תיקים פעילים · בנקים · כספים.
- **Avatar / Owner chip**: initials on Navy with turquoise text (no photos until real profile photos exist). The chip (small circle + name, on N50 pill) in tables/recent activity; the lone circle (36px) in the top navigation.
- **Inline alert**: status `-bg` + matching SVG icon + N700 text; page/card level info. Temporary self-dismissing notice → **Toast** (`z-toast`), not an alert.
- **Top navigation**: logo + main nav on the right (RTL); search + "**+ תיק חדש**" on the left — "+ תיק חדש" is the most prominent item in the nav ("the most missing entry point today"). Board nav items: דף הבית · לקוחות · משימות · דוחות.

### 1.6 Patterns (§6)
- **KPI Stat Card**: clickable + filters; big number 28px/700, small label above (12px N500), small delta below. Status-colour border **only for real urgency**, not by default.
- **Action Queue Row ("דורש טיפול היום")**: client (+urgency pill), what to do, why, deadline (urgency-coloured), "טפל" button.
- **Deadline Countdown**: hard colour coding — **red ≤3 days · orange 4–7 days · green >7 days**.
- **Bank Status Matrix**: bank tags with green check = **"sent only"**, not answer status (answer detail lives in the case); irrelevant bank = grey tag with "—". Board banks: לאומי · הפועלים · מזרחי · דיסקונט · הבינלאומי.
- **Active Cases Table Row**: client, stage (Info pill), documents (green/orange pill), next action, banks ("X/5 נשלח"), deadline, owner.
- **Activity Feed Item**: time (N500, fixed width) + text with bold name.
- **Empty / Loading**: Empty = large outline icon (N400) + text + CTA. Loading = **skeleton bars of varying widths, not a spinner**.

### 1.7 Table / Data grid (§7)
- Contextual bar on multi-select: dark Navy, "N תיקים נבחרו" + actions (assign owner, export) + cancel.
- Checked row → **Mint** background. Row hover → N50.
- Sort: first click descending, second ascending (SVG arrow changes).
- Pagination: "מציג X–Y מתוך Z" + rows-per-page + paging arrows.
- Density: **Comfortable (default, 16px padding)** vs **Compact (8px)** — a toggle for experienced advisors, not the default.

### 1.8 Mobile / responsive (§8)
Same tokens, different layout (not a shrunken desktop). (1) collapsed hamburger nav + KPI grid in 2 columns instead of 4; (2) table → stacked cards with a full-width "טפל"; (3) "+ תיק חדש" becomes a **Floating Action Button** (bottom-left corner). Buttons **44px+** high (minimum touch target).

### 1.9 The Intake screen (§9) — "אישור עקרוני"
- Problem: the developers' first version "looked generic and old" with no wayfinding. Owner's brief: "אני לא רוצה שזה יראה ככה בכלל... צריך להיות ברמה של 2026, לא ש-AI בנה."
- Three directions tested: (1) Accordion, (2) flat Sidebar Map, (3) Phased Wizard (5 big steps).
- **Final: Sidebar Map grouped into 5–6 categories** (flat sidebar breaks above ~8–10 items): finished or not-yet-opened category collapses to one row with a count pill ("2/2"); **only the active category expands**; **breadcrumb** "קטגוריה › תת-שלב" above the active card; overall progress bar + "X מתוך Y שלבים הושלמו" at the bottom of the sidebar. Example on the board: פרטי עסקה · לקוחות (2) · פרטי מקרקעין (פרטי הנכס / שמאות) · מצב פיננסי והון עצמי (2) · מסמכים · הערות וסיכום; "3 מתוך 9 שלבים".
- Deliberately left open: the collapsible category row, sub-step and breadcrumb are **not** official components until a second multi-step flow; the field list is not revisited ("רק ארגון ויזואלי כרגע").

### 1.10 How to continue (§11)
Keep all tokens exactly (they passed several accessibility rounds); next planned screen = Home ("תיקים שלי"); don't reinvent closed decisions (headless base, Heebo, grouped sidebar); consult the product owner before structural/scope decisions.

### 1.11 Do / don't summary
| Do | Don't |
|---|---|
| Turquoise for primary CTA, highlights, active links, active-tab underline | Turquoise as a general background; turquoise for status |
| N500+ for secondary text; N600 on N100 | N400 for any real text (only placeholder/disabled) |
| One status per pill; dot + text | Combined statuses; dark navy pill for anything but owner |
| Error = red ring + text under field | Error by colour only |
| Asterisk = required; "לא חובה" = optional; every field marked | Unmarked fields; asterisk as error |
| Stroke SVG icons, 24px grid, 1.75 stroke | Emoji, dingbats, filled icons |
| Flip navigation arrows in RTL | Flip chevrons, checks, clocks, documents — or the logo |
| Skeleton bars for loading | Spinners for a screen load |
| Status border on KPI card only when urgent | Coloured borders by default |
| Token values from tokens.css | Values retyped from screenshots |
| Comfortable density by default | Compact as default |
| Wait for a second use before promoting a pattern to a component | Premature components |

---

## 2. Tokens — full list

### 2.1 Handoff `context/inputs/advisor-design-system/internal-v1/tokens.css` (98 lines)
Header comment: "Font: Heebo (Google Fonts) — https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap". All on `:root`:

| Token | Value |
|---|---|
| `--mogi-navy` | `#03071E` |
| `--mogi-turquoise` | `#00F5D4` |
| `--mogi-mint` | `#A7FFEB` |
| `--mogi-turquoise-2` | `#00CECB` (classic turquoise — secondary CTA) |
| `--mogi-teal-deep` | `#0A9396` (secondary text/borders on turquoise) |
| `--mogi-turquoise-hover` | `#00C4AB` (primary button hover/pressed, derived from turquoise) |
| `--mogi-n0` | `#FFFFFF` |
| `--mogi-n50` | `#F7F8FA` |
| `--mogi-n100` | `#EEF0F3` |
| `--mogi-n200` | `#DDE1E7` |
| `--mogi-n300` | `#C2C8D2` |
| `--mogi-n400` | `#98A2B3` |
| `--mogi-n500` | `#6B7386` |
| `--mogi-n600` | `#4B5165` |
| `--mogi-n700` | `#333A4D` |
| `--mogi-n800` | `#1C2233` |
| `--mogi-n900` | `#03071E` (= navy) |
| `--mogi-success` | `#0E9F6E` |
| `--mogi-success-bg` | `#E7F7F1` |
| `--mogi-warning` | `#B45309` |
| `--mogi-warning-bg` | `#FDF3E7` |
| `--mogi-danger` | `#DC2626` |
| `--mogi-danger-bg` | `#FDEAEA` |
| `--mogi-info` | `#2563EB` |
| `--mogi-info-bg` | `#EAF1FD` |
| `--mogi-font-family` | `'Heebo', system-ui, -apple-system, sans-serif` |
| `--mogi-font-family-mono` | `'SFMono-Regular', Consolas, monospace` |
| `--mogi-text-h1-size` / `-line` / `-weight` | `32px` / `40px` / `700` |
| `--mogi-text-h2-size` / `-line` / `-weight` | `24px` / `32px` / `700` |
| `--mogi-text-h3-size` / `-line` / `-weight` | `20px` / `28px` / `600` |
| `--mogi-text-body-l-size` / `-line` / `-weight` | `16px` / `24px` / `400` |
| `--mogi-text-body-m-size` / `-line` / `-weight` | `14px` / `20px` / `400` |
| `--mogi-text-caption-size` / `-line` / `-weight` | `12px` / `16px` / `500` |
| `--mogi-space-1` | `4px` |
| `--mogi-space-2` | `8px` |
| `--mogi-space-3` | `12px` |
| `--mogi-space-4` | `16px` |
| `--mogi-space-5` | `20px` |
| `--mogi-space-6` | `24px` |
| `--mogi-space-8` | `32px` |
| `--mogi-space-10` | `40px` |
| `--mogi-space-12` | `48px` |
| `--mogi-space-16` | `64px` |
| `--mogi-radius-sm` | `6px` |
| `--mogi-radius-md` | `10px` |
| `--mogi-radius-lg` | `14px` |
| `--mogi-radius-pill` | `999px` |
| `--mogi-shadow-sm` | `0 1px 2px rgba(3,7,30,0.06), 0 1px 1px rgba(3,7,30,0.04)` |
| `--mogi-shadow-md` | `0 4px 12px rgba(3,7,30,0.08), 0 2px 4px rgba(3,7,30,0.04)` |
| `--mogi-shadow-lg` | `0 12px 32px rgba(3,7,30,0.14), 0 4px 8px rgba(3,7,30,0.06)` |
| `--mogi-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--mogi-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--mogi-duration-fast` | `120ms` (hover, press feedback) |
| `--mogi-duration-base` | `200ms` (tabs, dropdown, accordion) |
| `--mogi-duration-slow` | `320ms` (modal enter/exit) |
| `--mogi-z-base` | `0` |
| `--mogi-z-dropdown` | `100` |
| `--mogi-z-sticky` | `200` |
| `--mogi-z-overlay` | `300` |
| `--mogi-z-modal` | `400` |
| `--mogi-z-toast` | `500` |
| `--mogi-z-tooltip` | `600` |
| `--mogi-bp-mobile-max` | `639px` |
| `--mogi-bp-tablet-min` | `640px` |
| `--mogi-bp-tablet-max` | `1023px` |
| `--mogi-bp-desktop-min` | `1024px` |

Comment on z-index: "Keep every overlay's z-index as one of these tokens — never a one-off number." On breakpoints: "for reference — use as JS matchMedia / CSS custom-media, not directly interpolatable in vanilla CSS".

### 2.2 App copy `apps/advisor-web/src/assets/tokens.css`
**Identical to the handoff file** (verified with `diff`), except a 9-line header comment prepended: "Copied verbatim from the Mogi handoff ... Do not edit and do not reformat ... Biome skips it ... Everything the app uses is named in main.css beside it; a new token is added there, never here." No value differences.

### 2.3 Handoff `tailwind.config.js` (Tailwind 3-style theme extension; not used by the app, which is Tailwind 4)
colors: `navy`, `turquoise.DEFAULT #00F5D4 / hover #00C4AB / classic #00CECB`, `mint`, `teal.deep`, `neutral.0–900`, `success|warning|danger|info.{DEFAULT,bg}`; fontFamily sans Heebo / mono; fontSize `h1 h2 h3 body-l body-m caption` with lineHeight+weight; spacing: "Tailwind's default scale ... already matches the Mogi spacing scale ... exactly"; borderRadius sm/md/lg/pill; boxShadow sm/md/lg; transitionDuration fast/base/slow; transitionTimingFunction `mogi-out`, `mogi-in-out`; zIndex base…tooltip; screens `tablet: 640px`, `desktop: 1024px`. Note naming differs from the app (`neutral-500` / `turquoise-classic` here vs `n500` / `turquoise-2` in the app).

### 2.4 Values the boards use that are not tokens (named by the app in main.css as "ours")
- Button focus ring `0 0 0 3px rgba(3,7,30,0.15)`; input focus ring `0 0 0 3px rgba(0,206,203,0.18)`; error ring `0 0 0 3px rgba(220,38,38,0.12)`; (app adds error-focus `0.35`).
- 11px "micro" size (asterisk, "לא חובה", pill, avatar initials); 13px on `.btn-sm`; 28px KPI number; pill 12px/600; label 12px/600 N600.

---

## 3. `.claude/rules/advisor-ui.md` — rules and their enforcement

Loads for every file under `apps/advisor-web/**`. "Mogi decides look, feel and navigation. It never decides which fields a form asks: the field registry does that."

Infrastructure, in order: (1) tokens.css copied unchanged, exposed via a Tailwind 4 `@theme` block in `main.css` (`bg-navy`, `text-n500`, `rounded-md`, `shadow-md`, `text-micro`); unnamed handoff values named only in main.css, marked ours. (2) Heebo self-hosted from `@fontsource/heebo` (400/500/600/700), no Google Fonts request. (3) RTL root: `index.html` `lang="he" dir="rtl"` + one Reka UI `ConfigProvider dir="rtl"`. (4) shadcn-vue on Reka UI in `src/components/ui/`, added only when a screen needs one. (5) Shell: top nav with logo on the right and the avatar chip **beside it** (moved from the left by Eden 2026-09-13), "+ תיק חדש" alone on the left; chip opens `AppMenu` (logout inside).

| Rule | Enforcement |
|---|---|
| Tokens only — no raw hex, CSS colour function, named colour, Tailwind palette class (`bg-white`, `text-gray-500`), or `var(--mogi-…)` in arbitrary classes outside `src/assets/` | **`scripts/check-ui-tokens.mjs`** in `pnpm lint` (fixtures in `scripts/check-ui-tokens.test.mjs`) |
| Logical properties only (`ms- me- ps- pe- start- end- text-start`); no `ml mr pl pr left right text-left/right`, sides/corners, float, object/bg side, transform origin, scroll offset, CSS physical forms | same script |
| N400 never real text — `text-n400` only under `placeholder:`/`disabled:` variants | same script; N600-on-N100 half is review only |
| Type sizes only from tokens (6 Mogi + Micro 11px); no `text-[…px]`, `font-size: …px`, Tailwind `text-sm` etc. | same script's `raw-type-size` check |
| Every field marked required (red asterisk, danger 11px 600) or "לא חובה" (N500 11px) | review |
| Error = text under the field in danger + red ring | review |
| Input states default → focus → filled → error → disabled (values as above) | review |
| One primary action per screen; primary turquoise/navy text; hover teal-deep with light text; pressed turquoise-hover + scale(0.98); focus ring; disabled N100/N400; secondary navy outline; destructive red; text label always (exception: tertiary icon-only control with `aria-label` + exactly one tooltip, Eden 2026-09-12); actions ≥44px | review |
| Icons stroked SVG 24px/1.75 (small icons may use 2/2.5/3, Eden 2026-09-12); no emoji/dingbat | review |
| RTL mirroring (arrow flips; chevron/check/document/clock/logo never) | review |
| Status pills one status; dark navy/turquoise pill only for owner | review |
| Tabs: 2.5px turquoise underline on active, N500 inactive, motion base, ≤5–6 | review |
| Loading = skeleton bars (a just-pressed control may spin); Empty = large N400 outline icon + one line + one CTA | review |
| Motion fast/base/slow (slow also for step fold/category reveal, Eden 2026-10-03) | review |
| Elevation sm card / md menu / lg modal; z-index only from tokens | review |
| Density comfortable default | review |
| Intake = grouped Sidebar Map; each screen's template must name exactly the boxes its step asks | **`scripts/check-screen-fields.mjs`** in `pnpm lint` |
| "Digestible": banks' order, a box keeps its place (unconditional first in each `FormGrid`), non-applicable field hidden not disabled, dropdown >8 values gets search, money with thousands separators stored as agorot, prefilled field can be emptied (= `null` correction), never a modal for a flow form | review |
| Not decided: mobile layout | — |

Companion rule `.claude/rules/frontend.md`: Vue 3, Vue Router 5, TanStack Query 5 / Form 1, Tailwind 4 logical properties, shadcn-vue on Reka UI, Pinia only for cross-screen state; "UI text is Hebrew. Code ... English."; numbers/currency/dates through one shared helper.

---

## 4. Heebo self-hosting — exact paths

- Dependency: `apps/advisor-web/package.json` line 15: `"@fontsource/heebo": "5.3.0"` (lockfile `pnpm-lock.yaml:586` and `:2975`, integrity `sha512-Z01U2fWWrfJnSE6SmDYtZJ1uCnKs8V3WSdip/lVDfKnsC1ASumb7IZmOrXjaYK+PVm7qGD3+4cwTAFOxG5uMaw==`).
- Imports: `apps/advisor-web/src/assets/main.css` lines 3–8:
  ```css
  /* Heebo, from the bundle. No request to Google Fonts: the advisor's browser talks to our origin and nowhere else. */
  @import "@fontsource/heebo/400.css";
  @import "@fontsource/heebo/500.css";
  @import "@fontsource/heebo/600.css";
  @import "@fontsource/heebo/700.css";
  ```
- **The font files are not committed to the repo and `node_modules` is not installed in this checkout** — no `.woff/.woff2` exists under `/home/user/edea-mortgage`. Vite bundles them from the package at build time.
- Package contents (verified by `npm pack @fontsource/heebo@5.3.0`, extracted to the session scratchpad `/tmp/claude-0/-home-user/e5cc10a9-da9f-5e18-a260-897fc0ad6e0a/scratchpad/heebo/x/package/` — ephemeral; re-run `npm pack @fontsource/heebo@5.3.0` to get it again):
  - License: **OFL-1.1** (`package/LICENSE`: "Copyright 2014 The Heebo Project Authors (https://github.com/OdedEzer/heebo) ... SIL Open Font License, Version 1.1"); homepage https://fontsource.org/fonts/heebo.
  - Weight CSS files: `400.css`, `500.css`, `600.css`, `700.css` (also 100–900, `hebrew-400.css` etc., `hebrew.css`, `latin.css`, `index.css`).
  - Each weight CSS declares `font-family: 'Heebo'; font-display: swap;` with subsets **hebrew, math, symbols, latin-ext, latin**, each by `unicode-range`; formats **woff2 + woff**.
  - Hebrew files to copy: `files/heebo-hebrew-400-normal.woff2`, `files/heebo-hebrew-500-normal.woff2`, `files/heebo-hebrew-600-normal.woff2`, `files/heebo-hebrew-700-normal.woff2` (+ `.woff` twins); Latin: `files/heebo-latin-{400,500,600,700}-normal.woff2` and `files/heebo-latin-ext-…`. Hebrew unicode-range: `U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F` (includes ₪ U+20AA).
- The boards themselves load Heebo from Google Fonts (`https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap`); the app does not.

---

## 5. `apps/advisor-web/src/assets/main.css` — Tailwind 4 theme names

`@import "tailwindcss"; @import "./tokens.css";` then `@theme inline { … }` (inline because every value is a `var()`):

| Tailwind namespace | Names → token |
|---|---|
| `--color-*` brand | `navy`, `turquoise`, `turquoise-2`, `turquoise-hover`, `mint`, `teal-deep` |
| `--color-*` neutrals | `n0`, `n50`, `n100`, `n200`, `n300`, `n400`, `n500`, `n600`, `n700`, `n800`, `n900` |
| `--color-*` status | `success`, `success-bg`, `warning`, `warning-bg`, `danger`, `danger-bg`, `info`, `info-bg` |
| `--text-*` (size + line height + weight in one class) | `h1`, `h2`, `h3`, `body-l`, `body-m`, `caption`; plus ours `micro` = 11px with caption's 16px line height |
| `--font-sans` | `var(--mogi-font-family)` |
| `--radius-*` | `sm`, `md`, `lg`, `pill` |
| `--shadow-*` | `sm`, `md`, `lg`; ours: `ring-button` `0 0 0 3px rgba(3,7,30,0.15)`, `ring-input` `0 0 0 3px rgba(0,206,203,0.18)`, `ring-error` `0 0 0 3px rgba(220,38,38,0.12)`, `ring-error-focus` `0 0 0 3px rgba(220,38,38,0.35)` |
| `--ease-*` | `out`, `in-out` |
| `--z-index-*` | `dropdown`, `sticky`, `overlay`, `modal`, `toast`, `tooltip` |
| `@utility` (Tailwind 4 has no duration namespace) | `duration-fast`, `duration-base`, `duration-slow` |

So classes read like `bg-navy text-turquoise`, `text-n500`, `bg-success-bg text-success`, `text-h2`, `text-micro`, `rounded-pill`, `shadow-ring-input`, `z-modal`, `ease-in-out duration-base`. Base layer: `body { background n50; color n900; font Heebo; Body M }`, `html { scrollbar-gutter: stable }`. Other "ours" values: progress fill 600ms; loaded-content rise 600ms with 70ms stagger; thin 6px N300 scrollbar; menu-in/out keyframes; everything under `prefers-reduced-motion: no-preference`.

---

## 6. Logo files

| Path | Size | Notes |
|---|---|---|
| `context/inputs/advisor-design-system/internal-v1/logo.png` | 480 × 354 px, RGBA PNG, 22,708 bytes | Handoff original. Mark (two navy roof-like chevron shapes with one turquoise triangle) above the wordmark "Mogi" in navy, on a transparent margin; artwork sits in the middle third. |
| `context/inputs/advisor-design-system/internal-v1/uploads/MogiDesignSystemHandoff/logo.png` | same bytes | Duplicate of the above. |
| `apps/advisor-web/src/assets/mogi-logo.png` | 198 × 197 px, RGBA PNG, 14,588 bytes | The same artwork "with its transparent margin trimmed off and nothing else changed". Rendered in `components/shell/AppShell.vue:8` as `<img … alt="Mogi" class="h-9 w-auto">`. Rule: "The mark is navy, so on a navy surface it goes on a white chip." |
| SVG | — | **No SVG logo file exists.** The only vector form is an inline SVG thumbnail in `Main-standalone-src.dc.html` lines 6–15 (a `<template id="__bundler_thumbnail">` 1200×800 on navy, paths filled `#FFFFFF`, `#00F5D4`, `#00CECB`) — a bundler preview, not a published logo asset. |

Colours in the logo: navy `#03071E`-like and a turquoise/teal accent (pixel values not measured). Logo never mirrors in RTL.

---

## 7. The boards (`.dc.html`) — what each shows

All boards are HTML "design canvas" files (`<x-dc>`, loaded with `./support.js`, a generated 1,911-line runtime) with their own `:root` copy of the token values. Canvas layout in `design-system-canvas.json` (artboards 1480 px wide).

| File | One-line description | Components / samples on it |
|---|---|---|
| `Main.dc.html` | Foundations v1.0: brand colours, neutral scale, status colours, Heebo type scale, spacing, radius + elevation, icons, motion, z-index, RTL mirroring table | Type samples "בוקר טוב, אילון", "תיקים פעילים", "דורש טיפול היום"; note the neutral swatches list N0–N700 and N900 (N800 is not shown as a swatch); RTL table marked "טיוטת עבודה ראשונה" |
| `Main-standalone-src.dc.html` | Same as Main.dc.html plus an inline SVG bundler thumbnail (mark on navy) | — |
| `Mogi Design System - Foundations.html` | A bundled, self-contained export page ("Bundled Page"; navy loading screen) — no `support.js` dependency | — |
| `Components.dc.html` | All components with states | Buttons (primary "תיק חדש", hover, disabled, secondary "שמור שינויים", "ביטול", link "קישור פעולה", destructive "מחיקת תיק", "אישור ושליחה"; state row Default/Hover/Focus/Active/Disabled) · Inputs (default/focus/filled/error "מספר טלפון לא תקין"/disabled) · required/optional labels ("כתובת הנכס *", "שנת בנייה לא חובה") · status pills (הושלם, ממתין ללקוח, דחוף, בתהליך, טיוטה, Owner) · Tabs · Avatar + owner chip · Inline alerts (warning "אין תשובה מלאומי כבר 6 ימי עסקים", success) · Top navigation with search and "+ תיק חדש" |
| `Table.dc.html` | Data grid, "the backbone of the system" | Sort, multi-select with navy contextual bar ("2 תיקים נבחרו" · שיוך לאחראי · ייצוא · ביטול בחירה), Mint selected row, N50 hover, columns לקוח/שלב/דדליין לקוח/אחראי, pagination "מציג 1–4 מתוך 24", rows-per-page; density Comfortable vs Compact |
| `Patterns.dc.html` | Mogi-specific compositions | KPI stat cards (תיקים פעילים 24, דורשים טיפול היום 6, ממתינים לבנק 9, יתרה לגביה ₪12,500), Action Queue rows with "טפל", Deadline Countdown (חתימת חוזה / תוקף הצעת בנק / תשלום ל-Mogi), Bank Status Matrix, Active Cases row ("3/5 נשלח"), Activity Feed items, Empty ("עדיין אין תיקים פעילים" + "+ תיק חדש") and Loading skeleton |
| `Mobile.dc.html` | Responsive rules | Breakpoints, collapsed nav + 2-column KPI, table → stacked cards, floating action button "+" |
| `IntakeFlow.dc.html` | **The chosen intake screen**: Sidebar Map grouped into categories | Case header ("כהן — דנה ויוסי · אישור עקרוני · רכישה · תל אביב · ₪1,720,000"), sidebar with categories + count pills (2/2, 0/2), progress "3 מתוך 9 שלבים", collapsed finished categories with summary + "עריכה", breadcrumb, active card form (כתובת הנכס*, סוג נכס*, שטח (מ״ר)*, שנת בנייה לא חובה), CTA "שמור והמשך לשמאות". (The top-level copy differs from `uploads/…/IntakeFlow.dc.html` only by `&amp;` encoding in the Google Fonts link.) |
| `uploads/MogiDesignSystemHandoff/reference-rejected-direction-{1-accordion,2-sidebar-flat-6steps,3-wizard}.dc.html` | The three rejected intake directions (reference only) | — |

Other handoff files: `tokens.css`, `tailwind.config.js`, `design-system-canvas.json`, `support.js` (generated runtime, "do not edit"), `logo.png`.

### Components actually built in the app (`apps/advisor-web/src/components/ui/`)
AddressCombobox, AppButton, AppCard, AppCombobox, AppIconButton, AppInput, AppMenu, AppMenuItem, AppTextarea, BirthCountryInput, ConfirmDialog, DataTable, DateInput, DateOrUnknown, EmptyState, ErrorAlert, FieldLabel, FieldRow, ListInput, LockedFields, MoneyInput, OwnerChip, PickList, PillList, ResendButton, SegmentedRadio, SignedDecimalInput, SkeletonBar, StatusPill, TableCell, TableRow, TagSearch, TermInput, WholeNumberInput, YearsInput (+ `inputRing.ts`, `tone.ts`). Shell: `components/shell/AppShell.vue`. Intake sidebar parts live beside the case screen (`src/cases/intake/`), not in `components/ui/`, per the anti-roadmap rule.
