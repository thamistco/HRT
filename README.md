# Find Your HRT

A UK menopause & HRT support site: an informational homepage plus an interactive
in-browser questionnaire that helps someone weigh HRT options ahead of a GP or
nurse appointment. Exported as a static site from Claude Design.

## Structure

```
index.html                          entry point
assets/
  images/hero.png                   homepage hero illustration
  fonts/*.woff2                     self-hosted Fraunces / Nunito Sans / Spline Sans Mono subsets
  js/dc-runtime.js                  template runtime that renders index.html's markup
  js/image-slot.js                  <image-slot> custom element used for the hero image
  js/hrt-decision-aid.jsx           the questionnaire tool's source (React + JSX)
  js/hrt-decision-aid.min.js        precompiled + minified build of the above — this is
                                     what index.html actually loads at runtime
  vendor/react.production.min.js
  vendor/react-dom.production.min.js
  vendor/babel.min.js               only used by the build script below, not at runtime
  vendor/emailjs.min.js             @emailjs/browser, self-hosted — sends the feedback form
```

Everything needed to render the page is a local file. The one deliberate
exception is the feedback form: sending it makes a real request to EmailJS's
API (see "Feedback" below) — that's the point of it, not an oversight.

### Editing the questionnaire

`hrt-decision-aid.jsx` is the source of truth. After changing it, regenerate the
shipped bundle:

```
npm install   # one-time, installs the dev-only minifier
npm run build # compiles + minifies hrt-decision-aid.jsx -> hrt-decision-aid.min.js
```

`index.html` loads the `.min.js` file so visitors' browsers never fetch Babel or
JIT-compile raw JSX — the build step now does that once, ahead of time, instead
of every page load doing it in every visitor's browser.

Note: the questionnaire's own "print your results" view and the tool's internal
stylesheet still reference Google Fonts (`fonts.googleapis.com`) directly, matching
the original design; this only affects the print/summary popup, not the main page.

### Testing

`rankOptions`/`rankAdjust` (the logic that decides what HRT options someone
actually sees) have regression tests under `tests/`, using Node's built-in test
runner — no extra dependencies:

```
npm test
```

If you change the ranking rules, run this before `npm run build` to catch
anything a rule change unintentionally broke.

## Running locally

Any static file server works, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000/`.

## Deploying

This is a plain static site, so it can be served as-is by GitHub Pages, Netlify,
Vercel, S3, etc. For GitHub Pages: push to a branch, enable Pages for the repo
pointing at that branch's root, and it will serve `index.html` directly (a
`.nojekyll` file is included so Pages doesn't run Jekyll processing on the
`assets/` directory).

## Content

Nothing entered into the questionnaire is saved, stored, or sent anywhere —
state lives only in the page's memory for that visit.

## Feedback

The "Give feedback" form sends via [EmailJS](https://www.emailjs.com/) directly
from the browser — there's no backend. The destination address lives only in
the EmailJS template's "To Email" field, not in this repo or in anything a
visitor's browser downloads. `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` /
`EMAILJS_PUBLIC_KEY` in `hrt-decision-aid.jsx` are safe to have in client-side
code — the public key is meant to be public; access control happens on
EmailJS's side. Free tier is capped at 200 emails/month; the form detects a
quota-exceeded response separately from a generic network failure and shows
a distinct message for it.

## License

All rights reserved — see [LICENSE](./LICENSE). This repository is public for
transparency, not for reuse.
