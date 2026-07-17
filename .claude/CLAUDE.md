# Backend Engineering — Learning Project

## What this is
A personalized learning project for **backend engineering**. **Learner context:** a working
**machine learning engineer** who already programs well (Python, data, containers, model
serving) and wants comprehensive, systematic backend-engineering knowledge. The trigger was a
backend interview whose feedback was *"not enough evidence you can design and implement
production-ready backend services."* So the real target is the **production-readiness muscle** —
breadth across APIs, data, distributed systems, reliability, security, and ops **plus** the
ability to **reason about trade-offs out loud**. A secondary goal: this compounds with ML work,
since a production ML system *is* a backend system plus models. Pitch content **above beginner
level** — assume fluent programming and comfort with jargon; aim at systems thinking and
operational judgment, and define distributed-systems terms precisely rather than hand-waving.

Deep-dives are interactive HTML pages in `/content`, planned by `/ROADMAP.md`, indexed by
`content/manifest.json`, and shown by the static app at `/index.html` (deployed to GitHub Pages).

## Project structure
- `/ROADMAP.md` — the guide: the full plan (source of truth for what to build and in what order)
- `/content/manifest.json` — index of sub-topics with status (planned/done); what the app renders
- `/content/<slug>.html` — the deep-dive pages (created one at a time by the routine below)
- `/assets/theme.css` — shared design system; every deep-dive links `../assets/theme.css`
- `/assets/favicon.svg` — site icon
- `/index.html`, `/assets/app.js` — the app shell (manifest-driven; iframes each deep-dive)

## Routine: creating the next deep-dive
Follow these rules whenever asked to add/continue learning content:

1. **Read `/ROADMAP.md` first** — it is the guide. Re-read it every time; don't work from memory.
2. **Check what already exists** — read `content/manifest.json` and see which items are `"done"`.
3. **Pick the next sub-topic** — the earliest-`order` `"planned"` item whose prerequisites are
   all `"done"`. Honor the section order (Foundations → APIs → Data → Distributed → Reliability →
   Security → Capstone), but this is a **hybrid/landscape**, so once prerequisites are satisfied
   there's some freedom; the user may also name a specific slug.
4. **Research the sub-topic deeply** (web search for anything current/nontrivial), then **write
   `/content/<slug>.html`**: a standalone page that
   - `<link>`s `../assets/theme.css` in `<head>` and uses the theme's variables and primitives
     (`.callout` note/tip/caution/pitfall/insight, `.definition`, `.quiz`, `.widget`, `.panel`,
     `.badge`, `.table-wrap`, `.eyebrow`, `.deepdive` wrapper) — **do not invent new styling**;
   - teaches the sub-topic **comprehensively at the learner's level** (see learner context above:
     strong programmer, needs production-readiness + trade-off reasoning + the ML-systems bridge
     where natural);
   - includes **at least one genuinely interactive element** (simulation, visualization,
     step-through, or manipulable widget) suited to the material — see the roadmap's
     "Interactive idea" for that sub-topic as a starting point, but improve on it if you can;
   - keeps the **filename == the slug** in the roadmap/manifest.
5. **Update `content/manifest.json`** — set that item's `status` to `"done"` (confirm `file`
   matches `<slug>.html`). The app flips it from locked/planned to an openable deep-dive.
6. **Open a PR** with just this one sub-topic (branch → commit → PR). The `auto-merge-content`
   workflow merges it if conflict-free and redeploys Pages. **One sub-topic per PR** keeps
   manifest edits from colliding, so build them one at a time.

## Authoring conventions for deep-dives
- **Standalone + iframed.** Each page is opened inside an `<iframe>` by the shell *and* must work
  when opened directly. Keep it self-contained: only external reference is
  `<link rel="stylesheet" href="../assets/theme.css">`. No CDN scripts, no build step — inline the
  page's own JavaScript in a `<script>` tag at the end of `<body>`.
- **Recommended page skeleton:**
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><!-- Sub-topic title --> — Backend Engineering</title>
    <link rel="stylesheet" href="../assets/theme.css" />
  </head>
  <body>
    <main class="deepdive">
      <p class="eyebrow"><!-- SECTION // NN --></p>
      <h1><!-- Title --></h1>
      <!-- teaching content using theme primitives; at least one interactive widget in a .widget -->
    </main>
    <script>/* page-specific interactivity only */</script>
  </body>
  </html>
  ```
- **Style comes from the theme, not the page.** Reuse the CSS variables and components. Any
  page-local CSS must be **only for wiring an interactive widget** (sizing a canvas, positioning,
  an animation) and must stay within the theme's variables and palette. If you find yourself
  restyling headings, colors, fonts, or layout chrome — stop; that belongs in the theme, and
  changing the theme changes every page.
- **The interactivity is what varies page to page; the look does not.** The whole repo must read
  as one product.
- **Depth & tone:** match the learner context — concrete, trade-off-driven, honest about when a
  technique is the wrong choice. Prefer worked examples, failure modes ("what breaks at 3 AM"),
  and back-of-the-envelope numbers over hand-waving. Where it's natural, draw the line from a
  backend concept to its ML-systems analogue (serving, feature stores, pipelines, monitoring).
- **Accessibility & robustness:** support light/dark (the theme already does — don't hardcode
  colors), respect `prefers-reduced-motion` for animations, and make widgets keyboard-usable.

## The app / manifest contract (don't break these)
- `content/manifest.json` drives everything. Item fields: `id` (== slug), `title`, `sectionId`,
  `order`, `summary`, `prerequisites` (array of slugs), `file` (`<slug>.html`, relative to
  `/content`), `status` (`"planned"` | `"done"`).
- The shell shows `planned`/locked items greyed and only opens `done` items. Flipping `status`
  to `"done"` is what publishes a deep-dive to the learner.
- Keep it valid JSON. Don't reorder or renumber existing items casually — `order` and
  `prerequisites` encode the learning path.
