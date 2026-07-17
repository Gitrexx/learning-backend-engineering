---
name: learning
description: >-
  Sets up a personalized, self-hostable learning project for a topic the user wants to
  study deeply. Interviews the user about WHAT they want to learn and WHY (to gauge their
  level), researches the topic, produces a comprehensive learning ROADMAP.md (linear) or
  landscape (parallel sub-topics), generates a topic-tailored static web app that displays
  interactive HTML deep-dives from /content, and writes the .claude/CLAUDE.md routine rules
  that let the user grow the content one sub-topic at a time. Use this whenever the user
  says they want to "learn", "study", "systematically understand", "go deep on", "build a
  course/roadmap/curriculum for", or "master" some subject — even if they don't say the
  word "skill" or "project". Trigger it for requests like "I want to properly learn X",
  "help me build a learning roadmap for X", "set up a study project on X", or "break X down
  into things I can learn one by one". This skill is for SETTING UP the project scaffold;
  the actual per-sub-topic content is created afterward via the routine rules it writes.
---

# Learning project setup

This skill scaffolds a **personalized learning project** inside a repo cloned from the
`learning-repo-template`. The repo already ships two GitHub Actions workflows
(`static.yml` deploys the root as a GitHub Pages site; `auto-merge-content.yml`
auto-merges conflict-free content PRs and redeploys) and an empty `content/manifest.json`.
**Assume those exist — do not recreate them.** Your job is to fill in everything else.

## What you are building (end state)

```
/ROADMAP.md            <- the guide: the full learning plan (roadmap OR landscape)
/index.html            <- app shell: nav built from the manifest, loads a deep-dive in an <iframe>
/assets/app.js         <- fetches content/manifest.json, builds nav, tracks progress
/assets/theme.css      <- GENERATED per-topic design system; linked by the shell AND every deep-dive
/content/manifest.json <- the index the app renders (seeded from the roadmap; routine flips items to "done")
/content/<slug>.html   <- standalone interactive deep-dives (created LATER, by the routine)
/.claude/CLAUDE.md     <- project context + the routine rules for growing content
/README.md             <- one-paragraph intro to what this project is learning
```

Everything is a **static site** — no build step, no server. The app must work when the
folder is served as-is by GitHub Pages, using only relative paths and `fetch`.

Work through the phases below **in order**. The order matters: the styling in Phase 2 must
be informed by the research in Phase 1, which is why we never bundle a fixed template — a
project about marine biology and a project about distributed systems should not look alike.

---

## Phase 0 — Interview the learner

Before any research, understand the person, because the whole point is content pitched at
*their* level, not a generic textbook. Ask (conversationally, not as a rigid form):

1. **What do you want to learn?** Get the specific subject.
2. **Why — what's the background?** Their motivation, what they already know, and what they
   want to be able to *do* at the end. This is the single most important input: it tells you
   whether to start from first principles or assume fluency, how much math/jargon is safe,
   and where to aim the depth.

Then sanity-check **scope**. This skill is for something worth learning *systematically* —
a subject that genuinely breaks into multiple deep-dive-worthy sub-topics. If the ask is a
single narrow how-to ("center a div", "the difference between two git commands"), say so
kindly and offer a broader framing ("...that lives inside 'modern CSS layout' — want the
whole thing?"). Don't proceed until the topic is substantial enough to justify a roadmap.

Confirm your understanding back to the user in a sentence or two before moving on.

---

## Phase 1 — Research and write `ROADMAP.md`

**Research thoroughly.** Use web search / fetch to build a real, current mental model of the
subject: its major areas, the natural learning order, common pitfalls, and what "understanding
it" actually requires. Don't lean on memory alone for anything that may have moved.

### Choose the shape: roadmap vs. landscape (vs. hybrid)

- **Roadmap (linear)** — strong prerequisite chains; you must learn A before B before C.
  Good for skills and cumulative subjects (a programming language, calculus, music theory).
- **Landscape (parallel)** — a big concept with many semi-independent areas explorable in
  different orders (the Roman Empire, web security, "machine learning" broadly).
- **Hybrid** — the common real case: a small ordered *foundations* section, then a landscape
  of areas that build on it. Don't force a binary; let the subject's true structure decide.

### Break into sub-topics

Decompose the subject into sub-topics where **each one = a single deep-dive HTML page** worth
~15–40 minutes of engaged study with at least one interactive element. There is **no fixed
count** — let the research and the subject's real structure set it (could be 6, could be 30).
Don't pad with filler and don't cram two lessons into one. Each sub-topic needs a stable
**slug** (kebab-case) — it becomes the content filename and the manifest id, so choose
carefully now.

### Write `/ROADMAP.md`

This file is **the guide** — the single source of truth the content routine reads later.
Use this structure:

```markdown
# <Topic> — Learning <Roadmap | Landscape>

## About this journey
- **Learner context:** <their background, current level, and goal, from Phase 0>
- **Mode:** roadmap | landscape | hybrid
- **How this works:** ROADMAP.md is the plan. Deep-dives are HTML pages in /content,
  indexed by content/manifest.json, shown by the app at /index.html.

## Structure
<A short prose overview of the path (roadmap) or the areas (landscape) and how they relate.>

## Sub-topics
### <Section name>            <!-- group by section for landscape/hybrid; one implicit group is fine for a pure roadmap -->
1. **<Title>** (`<slug>`)
   - **Covers:** <2–4 sentences: the key ideas and why this sub-topic matters>
   - **Prerequisites:** <slugs, or "none">
   - **Interactive idea:** <a concrete widget/visualization/exercise suited to this sub-topic>
...
```

Keep the roadmap ambitious but honest. It's the spine of the whole project.

---

## Phase 2 — Generate the app (tailored to THIS topic)

Now — and only now, with the roadmap in hand — design the look and build the shell. Load the
`frontend-design` skill for visual direction, and `dataviz` if the subject is data-heavy. The
goal is an interface that **feels like it belongs to this subject** and doesn't read as a
generic template.

### `/assets/theme.css` — the shared design system

Generate **one** stylesheet, **fresh into this repo**, that encodes a genuine visual identity
drawn from the subject and the learner's context: a purposeful color palette, real typographic
scale, spacing, and any motifs that evoke the topic. This theme is created once, here, and
defines the identity for **this learning topic only** — it is linked by **both** the app shell
and **every** deep-dive, so the whole repo is one unified look and the content routine never
reinvents styling. It is deliberately not bundled in the skill: a different topic in a
different repo runs this skill again and gets its own, different unified theme.
Define CSS variables (colors, fonts, spacing, radii) plus base element styles and a few
reusable content primitives (callouts, code blocks, figure captions, quiz/exercise blocks).
Support light and dark via `prefers-color-scheme`.

### `/content/manifest.json` — seed it from the roadmap

The app is entirely manifest-driven. **Pre-populate it with every sub-topic from the roadmap**,
all `status: "planned"`; the routine flips each to `"done"` when its page exists. Schema:

```json
{
  "topic": "<subject>",
  "mode": "roadmap | landscape | hybrid",
  "sections": [
    { "id": "foundations", "title": "Foundations", "order": 1 }
  ],
  "items": [
    {
      "id": "<slug>",
      "title": "<Title>",
      "sectionId": "foundations",
      "order": 1,
      "summary": "<one line>",
      "prerequisites": ["<other-slug>"],
      "file": "<slug>.html",
      "status": "planned"
    }
  ]
}
```

`file` is relative to `/content`. Use `sectionId: null` if the subject has no sections.

### `/index.html` + `/assets/app.js` — the shell

Build a shell that:

- `fetch`es `content/manifest.json` (relative path — works on Pages).
- Renders **structured navigation**: grouped by `sections` (ascending `order`), items within a
  section in `order`. Show progress (done vs. planned). `planned` items are visible but
  disabled/greyed — the learner sees the whole journey and what's left.
- Has a **landing/overview view** (the default) summarizing the journey and progress straight
  from the manifest — no Markdown parsing needed in the browser.
- Loads a selected `done` item's page into an **`<iframe src="content/<file>">`**. Use an
  iframe (not innerHTML injection) so each deep-dive's own `<script>` interactivity runs
  and stays isolated, and so pages also work when opened directly. Reflect the current item
  in the URL hash (e.g. `#<slug>`) so views are linkable and refresh-stable.
- Links `assets/theme.css` so the shell matches the content.

Author these fresh for this project. Keep the JS dependency-free (vanilla `fetch` + DOM); do
not require a bundler or external CDN scripts.

---

## Phase 3 — Write `/.claude/CLAUDE.md`

This file is the context the user will feed to Claude Code later to grow the content. Overwrite
the near-empty existing file. It must record **what the project is learning**, the **learner's
context**, the **project structure**, and — most importantly — the **routine rules**. Write it
so a future Claude with no memory of this conversation can pick up and produce the next
deep-dive correctly. Use this shape (fill in the specifics):

```markdown
# <Topic> — Learning Project

## What this is
A personalized learning project for **<topic>**. Learner context: <background, level, goal>.
Deep-dives are interactive HTML pages in /content, planned by /ROADMAP.md, indexed by
content/manifest.json, and shown by the static app at /index.html (deployed to GitHub Pages).

## Project structure
- `/ROADMAP.md` — the guide: the full plan (the source of truth for what to build and in what order)
- `/content/manifest.json` — index of sub-topics with status (planned/done); what the app renders
- `/content/<slug>.html` — the deep-dive pages
- `/assets/theme.css` — shared design system; every deep-dive links `../assets/theme.css`
- `/index.html`, `/assets/app.js` — the app shell

## Routine: creating the next deep-dive
Follow these rules whenever asked to add/continue learning content:

1. **Read /ROADMAP.md first** — it is the guide. Re-read it every time; don't work from memory.
2. **Check what already exists** — read content/manifest.json and see which items are `"done"`.
3. **Pick the next sub-topic** — the earliest-`order` `"planned"` item whose prerequisites are
   all `"done"` (for a pure landscape, honor prerequisites but order is flexible; the user may
   also name a specific slug).
4. **Research the sub-topic deeply**, then **write `/content/<slug>.html`**: a standalone page
   that `<link>`s `../assets/theme.css`, teaches the sub-topic comprehensively **at the
   learner's level**, and includes **at least one genuinely interactive element** (simulation,
   visualization, step-through, quiz, or manipulable widget) suited to the material. Keep the
   filename == the slug in the roadmap/manifest.
5. **Update content/manifest.json** — set that item's `status` to `"done"` (and confirm `file`).
6. **Open a PR** with just this one sub-topic (branch → commit → PR). The auto-merge workflow
   merges it if conflict-free and redeploys Pages. One sub-topic per PR keeps manifest edits
   from colliding, so build them one at a time.

## Conventions
- **Style comes from the theme, not the page.** Every deep-dive `<link>`s `../assets/theme.css`
  and reuses its CSS variables and components (callouts, code blocks, quiz blocks, etc.). Do not
  introduce a new visual style, palette, or fonts — the whole repo must look like one product.
- **Page-specific CSS is only for wiring an interactive widget** (sizing/positioning a canvas,
  an animation), and must stay within the theme's variables and palette. If you're restyling
  headings, colors, or layout chrome, stop — that belongs in the theme, not the page.
- The interactivity (JavaScript) is what varies page to page; the look does not.
- Match the depth and tone to the learner context above.
```

---

## Phase 4 — Update `/README.md`

Replace the placeholder with a short, friendly intro: what this project is learning, one line
on how it works (interactive deep-dives, self-paced, deployed to Pages), and a pointer to
`ROADMAP.md` for the full plan. Keep it brief — a paragraph or two.

---

## Phase 5 — Hand off

Tell the user what you set up and how to proceed:

- The roadmap is in `ROADMAP.md`; the app shell + theme are ready; `manifest.json` is seeded
  with the full plan (all sub-topics `planned`).
- **No deep-dive content exists yet** — that's created one sub-topic at a time by asking Claude
  Code to "continue the next deep-dive" (the routine rules live in `.claude/CLAUDE.md`).
- Suggest they commit this scaffold, then start the content routine. Optionally offer to build
  the first deep-dive now as a demonstration.

Keep the summary tight and concrete — point at real file paths.
