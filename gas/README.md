# GAS - GED Awesome Slides

A dependency-free, offline-first framework for a slide deck with exercises
and solutions built in. No build tooling beyond Python's standard library, no
npm, no bundler - the built page runs from a plain `file://` URL as happily
as from a server.

This directory is the **generic engine**. It has no opinion about what your
slides say - that lives in a separate **project** directory (in this repo,
`content/`), which holds your actual slides, exercises, and a small
`config.js` that tells the engine about them. One `gas/` can serve any number
of projects, each a sibling directory.

If you're an AI assistant asked to add or edit slides/exercises, read
`CLAUDE.md` instead - it's the authoring guide. This file is setup and
architecture.

## Directory layout

```
gas/                    this framework - generic, no project-specific content
  build.py               builds a project into a site directory
  dev.py                  builds, serves it, and keeps rebuilding on every change
  template.html           the page shell every project shares
  assets/                 app.js (the engine), style.css, vendored libraries, fonts
  README.md, CLAUDE.md    this file, and the authoring guide

content/                 a project (this repo's masterclass) - pure source,
                         nothing here is ever generated or gitignored
  config.js                this project's title, program, resources... (window.GAS_CONFIG)
  style.css                optional: this project's own CSS tweaks (may not exist)
  sections/                 this project's slides, exercises, and pages
  assets/                   this project's own images etc.

_site/                  generated, gitignored, disposable - delete it any
                         time, a rebuild recreates it whole. Never hand-edit
                         it: edit content/ or gas/, then rebuild
  index.html               a redirect to content/ below
  content/                  the built page, plus a copy of content's own
                            config.js, style.css and assets/
  gas/assets/               a copy of this framework's assets
```

A project (`content/`) does **not** need to live next to `gas/` - `build.py`
takes both as separate arguments and always lays its output out the same
way regardless of where either source actually is, so the only fixed
relationship is inside `_site/` itself (see `{{gas}}` below).

## Building

A project's site is generated, not committed - build it before opening the
page for the first time, and whenever `sections/` changes.

```
python3 gas/build.py <project-dir> <site-dir>            build once
python3 gas/build.py <project-dir> <site-dir> --watch    rebuild on every change, twice a second
```

This repo also keeps thin wrappers at its root defaulting to `content` and
`_site`, so the existing habit still works:

```
python3 build.py            same as: python3 gas/build.py content _site
python3 build.py --watch
```

For local development, `gas/dev.py` (or the root's `dev.py`) builds, serves,
and keeps rebuilding on every change, all in one command - see "Serving
locally" below.

The build reads `gas/template.html`, three placeholders in it
(`<!-- build:decks -->`, `<!-- build:projects -->`, `<!-- build:views -->`)
each receiving every file under `<project-dir>/sections/*/*.html` whose root
element is a `<div class="deck">`, `<article class="project">` or
`<section class="view">` respectively (sorted by folder then filename, which
is why folders are numbered). It writes `<site-dir>/<project-dir's name>/
index.html`, then copies that project's own `config.js`, `style.css` and
`assets/` (whichever exist) alongside it, copies this framework's own
`assets/` to `<site-dir>/gas/assets/`, and writes a one-line redirect at
`<site-dir>/index.html` so the site's own root lands on the project. See
`CLAUDE.md` for what goes inside a project's section files.

One more thing the build does beyond concatenating and copying files:
`<!-- build:markdown some-file.md -->` in a section file is replaced by a
`<script type="text/markdown">` wrapping that file's contents (used for
exercise pages - see CLAUDE.md). A page opened from `file://` cannot fetch
its own `.md` file, so the text has to already be inside the page; app.js
renders it with marked.js at load time.

`{{gas}}` in `template.html` becomes `../gas` - since the build always lays
the project and the copied `gas/assets/` out as siblings directly under
`<site-dir>`, that relative path never has to be computed per project, only
declared once.

## Serving locally

The one-command way, which also handles building:

```
python3 gas/dev.py <project-dir> <site-dir> [port]     # or: python3 dev.py
```

Builds once, starts serving `<site-dir>` at `http://localhost:8000/`
(default port), and always keeps rebuilding in the background as you edit
`sections/` (or this framework's own `assets/`), so the page in your browser
is never stale - not behind a flag: `?mode=edit`'s "Edit source" (see "What
the engine does" below) saves straight to a project's real files and relies
on this to pick the change back up, so dev.py never has a stale-and-static
mode to fall out of sync with a save.

Equivalent by hand, in two terminals:

```
python3 build.py --watch
python3 -m http.server 8000 --directory _site
```

then open `http://localhost:8000/` - `_site`'s own root redirect lands you
on the project.

The page also runs directly from disk with no server at all, once built -
open `_site/content/index.html` in a browser (it's fully self-contained;
nothing in it points back outside `_site/`). The one difference: the
clipboard-copy buttons on code samples fall back to "Press ctrl+c" (browsers
refuse clipboard access on `file://`), and a couple of other browser APIs
are a little more restricted. Everything else - editing, printing,
exercises, solutions - works the same, except one: `?mode=edit`'s "Edit
source" (see "What the engine does" below) needs an actual server to save
to, so it only works run through `dev.py` - not a `file://` open, and not
`python3 -m http.server` on its own (that has no `/api/source` to talk to).
The button (and every inline pencil next to an exercise step or a solution)
just isn't there at all in either case - checked once, up front.

## config.js

A project's `config.js` sets `window.GAS_CONFIG`, loaded in `<head>`, before
even this framework's own stylesheet (so the palette below can be resolved
before anything paints - see "Palettes"). Every key is optional; the
framework degrades gracefully with none set at all (a blank title, no
welcome image, no pad, no resources, an empty program, the "claude" palette).

```js
window.GAS_CONFIG = {
  title: "My Deck",                 // <title>, the sidebar's home button, the
                                     // slide footer's brand text, the export header
  favicon: "data:image/svg+xml,...", // any valid href; the framework default if unset
  defaultDeck: "intro",             // the deck id "Home" and first load land on
  welcomeImage: "assets/cover.webp", // the welcome screen's background; empty falls
                                     // back to a generated starfield
  padUrl: "https://...",            // an etherpad-shaped URL to embed under
                                     // "Collaborative Pad" - that nav entry is
                                     // hidden entirely if this is empty
  resources: [                      // links shown under "Resources" - hidden
    { group: "...", links: [{ title, url, note }] },
  ],
  program: [ ... ],                 // the sidebar - see below and CLAUDE.md
  palette: "oxp26",                 // which assets/palettes/*.css file - "claude"
                                     // if unset; normally set by the editor panel's
                                     // own picker, not by hand (see "Palettes")
};
```

`program` is an array of topic groups:

```js
{
  topic: "Owl",              // heading text, or null for a loose (unheaded) group
  at: "end",                 // optional: "end" puts this group under
                              // Collaborative Pad, above Resources; "last"
                              // puts it under Resources, at the very foot
  items: [
    { type: "slides", id: "owl", label: "Components and Signals" },
    { type: "project", id: "getting-started", label: "Getting Started" },
    { type: "view", id: "faq", label: "FAQ" },
  ],
}
```

- `slides` points at a `<div class="deck" id="deck-<id>">`
- `project` at an `<article class="project" id="project-<id>">`
- `view` at a plain `<section class="view" id="view-<id>">` - any page with
  no special behaviour of its own (an FAQ, setup instructions...); "pad" and
  "resources" are the two view kinds the framework itself already provides,
  you don't add those here

Topics are numbered in the sidebar by their place in the program - but only
the ones in the program proper. A group with an `at` sits outside that flow,
at the foot, and keeps its heading without a number.

### Embedding another GAS site

A view page can hold another site in an iframe - a talk beside a training,
say - so that a reader never loses the page they were on:

```html
<section class="view" id="view-talk" data-id="..." data-print="skip" hidden>
  <div class="pad-bar">
    <span>What this is.</span>
    <a href="../talk/" target="_blank" rel="noopener">Open in a new tab</a>
  </div>
  <iframe class="view-frame" data-src="../talk/index.html?embed=1" title="..."></iframe>
</section>
```

Three things do the work. `data-src` instead of `src` loads the frame the
first time that view is opened, rather than on every page load - it is a
whole site in there. `?embed=1` tells the embedded GAS site it is inside
another one, so it hides its own sidebar and gives the width to its slides;
the deck bar stays, which is how you move through it. And `data-print="skip"`
keeps the page out of "Print everything", since a window onto another site
prints as an empty box.

Point `data-src` at `index.html`, not at the directory: a directory url only
resolves over http, and these pages are opened from disk too.

### Acts

A `slides` item may list the **acts** its deck is organised into - a talk
broken into movements, rather than a flat run of slides:

```js
{ type: "slides", id: "talk", label: "Introducing Owl 3", acts: [
    { id: "frontier", title: "Scaling Odoo JS", at: "0:00", mins: 8 },
    { id: "signals", title: "Signals", at: "0:08", mins: 13 },
    { id: "appendix", title: "Appendix", counted: false },
] }
```

Every slide then carries `data-act="<act id>"`, and the slide that opens an
act is `<article class="slide divider">` (see `CLAUDE.md` for its markup).
Two things are drawn from that one list, so they cannot drift apart from
each other or from the deck:

- the sidebar lists that deck **slide by slide** - the overview you rehearse
  against. The divider opening an act is that act's own row: the deck icon
  where a slide carries its number, its title in bold, and the `at` time on
  the right. It replaces the deck's own program entry, which would otherwise
  name the deck twice, once as itself and once as its cover slide. An act
  that opens on something other than a divider gets a plain heading above
  its slides instead. A deck with no `acts` keeps the single entry it always
  had
- every divider gets `Act n of m` in its `.divider-eyebrow` and one segment
  per act in its `.prog` rail, its own act lit

`at` is a clock time, `mins` how long the act runs - both free text, neither
computed from the other. `counted: false` keeps an act out of the numbering
and off the rail while still heading its slides in the sidebar: an appendix,
say, which belongs to the deck but not to the talk as delivered. A slide
whose `data-act` names no listed act still groups under that raw id.

Adding an act is one entry here plus a matching `data-act` on the new
slides; every divider renumbers itself.

## Palettes

Every colour on the page - `assets/style.css`'s `var(--bg)`, `var(--accent)`
etc. - comes from whichever file under `assets/palettes/` is currently
active, not from `style.css` itself (it has none of its own to fall back
on). Adding a palette is exactly "add a file there, named `<name>.css`" -
`build.py` discovers every file in that folder and links it into the page
automatically (see its `discover_palettes()`), so there's nothing to
register anywhere else and no list to keep in sync with the folder. Each
file is self-contained: a light face and a dark one, both scoped to its own
name -

```css
[data-palette="<name>"] {
  --bg: #...; --panel: #...; --sidebar: #...; --sidebar-text: #...;
  --sidebar-active: #...; --text: #...; --muted: #...; --border: #...;
  --accent: #...; --accent-soft: #...; --accent-light: #...;
  --pink: #...; --cyan: #...; --yellow: #...; --lavender: #...;
}

[data-palette="<name>"][data-theme="dark"] {
  /* the same custom properties again, this face's own dark values */
}
```

`--pink`/`--cyan`/`--yellow`/`--lavender` back the highlighter-mark classes
(`.mark-yellow` etc., see `assets/style.css` and `CLAUDE.md`) - a palette
can pick whatever suits its own identity, they don't have to be literal
pink/cyan/yellow/lavender.

Which palette applies and light-vs-dark are two different kinds of choice,
handled differently:

- **The palette is a project setting**, not a personal one - every viewer of
  the built site gets the same one. It's set in `config.js`
  (`GAS_CONFIG.palette`, defaulting to `"claude"` when unset) and picked
  from a dropdown in the editor panel (`?mode=edit`, next to Edit source -
  see below), built the same way as the table of contents, off the
  `<link data-palette>` tags `build.py` generated - nothing hand-listed.
  Choosing one writes it straight into `config.js`, the exact same
  `dev.py`-served save every other Edit source use does, so (like the rest
  of Edit source) it's only there served locally.
- **Light/dark is a personal, per-viewer choice** - a toggle in the
  sidebar, always there. A `gas-theme` localStorage pick remembers it, or -
  the first time, or with storage blocked - the OS's own preference.

A small inline script in `template.html`'s `<head>` (after `config.js`,
so it can read `GAS_CONFIG.palette`) resolves and sets both
`data-palette`/`data-theme` on `<html>` before the page paints at all, so
neither one ever visibly flashes the wrong value first, even on reload.

Five palettes ship with the framework: `claude.css` (GAS's own original
palette), `oxp26.css` (Odoo Experience 2026's own speaker-template colours,
sampled directly from the deck), and `catppuccin.css`/`tokyo-night.css`/
`nord.css` (three well-known developer colour schemes). A project can drop
its own file in the same folder to add another, or replace any of these
outright.

## What the engine does

Briefly - the comments throughout `assets/app.js` and `assets/style.css` are
the real reference, this is an index into them:

- **Slide sizing.** A slide is a 16:9 box sized off the viewport (or the
  print page), never a fixed pixel size - a bigger screen or projector just
  renders a bigger, equally legible slide, because every size inside it
  (`style.css`) is a CSS container-query unit (`cqw`) relative to the
  slide's own width, not the viewport's.
- **Auto-fit.** A slide with more content than usual can overflow that box
  at the same nominal size. Rather than a fixed size per slide, `app.js`'s
  `fitSlide()` turns a `--content-scale` custom property down, in small
  steps, until the content clears the box - every font-size in the
  stylesheet already multiplies by it. This keeps every slide's box
  identical to its neighbours' regardless of how much either one holds.
- **Lazy code samples.** Every code sample becomes a live, editable
  `CodeJar` instance (see below) - real, but not free, and a training-sized
  site can hold a couple hundred of them across every slide and exercise.
  `setupCodeBlocksOnce()` only does that for the deck or project actually
  shown, the first time it's shown - never for the rest of the site just
  because it exists.
- **Exercises and solutions.** A `.project` page is a markdown (or plain
  HTML) document; a solution inside it is a `<details>` that opens as a
  full-screen dialog rather than unfolding in place (keeps the student's
  scroll position). A solution's before/after code comparison is
  **computed**, not hand-marked - see CLAUDE.md for the exact shape; write
  two plain code samples and `Diff.diffLines()` (vendored, `assets/diff.js`)
  works out and highlights what changed, at render time. A numbered exercise
  (`## 1. ...`, `## 2. ...`) gets its own table of contents the same way -
  computed from the headings, never hand-written (see CLAUDE.md) - and
  clicking into a step updates the url (`#project/<id>/<step>`, next to
  the deck/slide one) so a refresh or a shared link lands back on it. Every
  heading in an exercise also gets a small permalink next to it, invisible
  until that heading is hovered (Wikipedia/GitHub-style) - click it to copy
  a direct link, same idea as the auto-generated table of contents above.
- **Editing (`?mode=edit`).** A floating panel for annotating slides and
  exercises while presenting or reviewing: a note or a retitle per slide/
  section, freehand drawing (line/arrow/box/text) recorded as a sentence
  ("red box around ...") rather than raw coordinates, Export to hand the
  whole batch to whoever maintains the content - none of that writes to
  disk itself. **Edit source** does: the panel's own button (a slide, a
  project/view's whole file, or - correctly scoped, not the whole
  exercise - whichever step or solution is actually open), the inline
  pencil next to an exercise's own numbered step and each solution, and a
  solution's own dialog gets a second Edit right next to Close, reachable
  without opening the editor panel at all. Any of these open the exact text
  on disk, always editable (syntax-coloured
  as you type, via CodeJar - never a rendered/WYSIWYG view, which is what
  would risk corrupting markdown/HTML syntax on save), and save writes it
  straight back. Only works served by `dev.py` (see "Serving locally"
  below) - there's nowhere else for a save to go, so the button and every
  inline pencil just aren't there at all otherwise (checked once, up
  front).
- **Printing.** A "Print" button, and the browser's own Print/Ctrl+P, both
  export the current deck as a PDF-ready page - every slide at once, one to
  a page, at the standard 16:9 widescreen size (13.333in x 7.5in).
- **Printing everything.** "Print everything", at the foot of the sidebar,
  does the same for the whole program in one document: the welcome cover as
  its title page, then every deck, every exercise (solutions included, back
  under the button that opens them) and every plain page, in the order the
  sidebar lists them. Slides keep the
  widescreen page; the exercises and pages get A4 portrait, through a named
  `@page` - Chromium's, so elsewhere they come out on the widescreen page
  instead, which reads but is not pretty. A page cannot hand the browser a
  PDF file, so this opens the print dialog and the reader picks "Save as
  PDF"; `?print=all` lays the same document out and stops there, which is
  what a headless render (`chrome --headless --print-to-pdf`) or a build
  step that wants the PDF as a file would load.
- **Everything else** - the sidebar, code-sample copy/edit-in-place,
  keyboard shortcuts (arrows, `f` fullscreen, `m` collapse the sidebar,
  `Ctrl+K` go to any slide, exercise step or page) -
  is unremarkable and best read directly in `app.js`.

## Deploying (GitHub Pages, as an example)

`build.py` already produces a complete, self-contained `_site/` (see
"Directory layout" above) - deploying is just "build, then publish that
directory," nothing else to assemble. See `.github/workflows/pages.yml` in
this repo for a working example: checkout, `python3 build.py`, upload
`_site/`; and `publish.py` for the other shape, building one project and
adding what else belongs beside it. Since the build always regenerates the whole thing from source,
this is never stale, and never depends on anything being committed.

## Status

This lives inside the masterclass-2026 repo for now, alongside the one
project that uses it, while it settles. Once it's stable it's meant to move
to its own repository, with projects depending on it rather than
sitting next to it - nothing here assumes that hasn't happened yet, but it
also hasn't been done yet, so treat the directory split as the current
convention, not a guarantee about tomorrow's.
