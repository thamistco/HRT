# Engineering standards for this repo

Rules for anyone working on Find Your HRT, human or AI. They are deliberately
short: this is a static site with one page and one component, and a rulebook
longer than the codebase would be its own kind of mess. Prefer judgement over
rule-lawyering, but do not silently skip the checks.

## What this project is

A free UK menopause/HRT information site: one static `index.html`, one React
questionnaire (`assets/js/hrt-decision-aid.jsx`), two legal pages, no backend,
no database, no user accounts. It is hosted on GitHub Pages behind Cloudflare.
Nothing a visitor enters is stored or transmitted.

**It gives health information to real people.** That single fact sets the bar
for everything below. A styling bug is embarrassing; a wrong dose or a missing
contraindication is harmful.

## Non-negotiables

1. **Never invent clinical content.** Every clinical claim, dose, brand name or
   product detail must come from a real, current UK source (NICE, BMS, CoSRH,
   MHRA, emc/SmPC, NHS). If you cannot verify it, do not write it.
2. **Cite what you change.** New clinical content needs its source added to the
   references list in `hrt-decision-aid.jsx`.
3. **Do not weaken a safety message** (contraindications, red flags, "see a
   clinician") to make copy shorter or tidier.
4. **No secrets in the repo.** The one exception is `EMAILJS_PUBLIC_KEY`, which
   is designed to be public; it is documented as such in the README.
5. **Correcting an existing citation requires positive evidence**, not just
   "my search did not find it". Absence of a search result is not proof of
   error. This has caused a real regression before.

## Before you finish any change

Run these. CI runs them too, but do not use CI as the first place you find out.

```
npm test          # regression tests for the ranking logic
npm run build     # regenerate the shipped bundle
```

- `hrt-decision-aid.jsx` is the source of truth. `hrt-decision-aid.min.js` is
  generated. **Never hand-edit the .min.js.**
- If you change the `.jsx`, you must run `npm run build` and commit the result.
  CI fails the build if they are out of sync.
- `TOOL_VERSION` and `CONTENT_REVIEWED` in the `.jsx` are the single source of
  truth for the version/date shown in the homepage footer. The build stamps
  them. Do not edit the footer text by hand.
- Verify UI changes in a browser before committing. Do not assume CSS works.

## Code style

- JavaScript/JSX, 2-space indent, no tabs. Match the surrounding file.
- `PascalCase` for React components, `camelCase` for everything else. No
  snake_case, no cryptic abbreviations.
- Comments explain **why**, not what. Keep density low; the code is already
  readable. Use the existing `SECTION N —` block headers to divide large files.
- **No em dashes in user-facing prose.** Use commas, semicolons or full stops.
  This is a deliberate house style; it has been asked for repeatedly.
- UK English throughout ("oestrogen", "personalised").

## Applying general engineering principles here

- **DRY** applies to logic, not to prose. The FAQ text is intentionally
  duplicated between `index.html` and the tool: they render through different
  systems and two entries differ on purpose. Do not "fix" this without asking.
- **KISS / YAGNI** win by default. This site has no build framework, no
  TypeScript, no CSS preprocessor and no runtime dependencies on purpose. Do
  not add tooling unless something is actually broken without it.
- **Small functions** are the goal, but some ranking functions are long because
  the clinical rules genuinely are. Do not refactor working clinical logic for
  line count alone; the risk of a subtle behaviour change outweighs tidiness.
- **Accessibility is not optional.** Keep the `<main>` landmark, skip link,
  `aria-checked` on questionnaire options, live regions, and WCAG AA contrast.
  Check contrast when changing any colour.

## Tests

- Anything that changes `rankOptions` or `rankAdjust` needs a test, because
  those decide what options a real person is shown.
- Tests live in `tests/`, use Node's built-in runner, and need no new
  dependencies. Keep it that way.

## Git

- Commit messages: specific subject line, body explaining **why**. "Fix footer
  heading alignment" not "updated stuff".
- One logical change per commit.
- This branch deploys straight to production, so every commit is live. Make
  sure tests pass and the build is current before you push.

## When you are unsure

Say so, and ask. On this project a wrong answer delivered confidently is worse
than an open question. Flag uncertainty about clinical content, legal wording
or regulatory status rather than guessing.
