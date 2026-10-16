# Writing slides and exercises with GAS

You're being asked to add or edit slides, exercises, or other pages in a
project built on GAS (this directory). This is the authoring guide - `README.md`
next to this file covers setup and architecture; read it first if you
haven't touched a GAS project before.

**Before writing anything: find the closest existing example in the
project's `sections/` and copy its shape.** This guide gives you the
mechanisms and the reasons behind them, not an exhaustive class reference -
the real, current vocabulary of structure (`.rows.numbered`, `.two-col.code`,
and every other combination) is whatever the project's own slides already
use. A new slide should look like it belongs next to the others, not like a
one-off.

## Where things go

Every project has a `sections/` directory: numbered folders (`10-topic-one`,
`20-topic-two`...), each `.html` file inside one entry of the sidebar. The
build (`gas/build.py`) reads every file's root element to decide what it is:

- `<div class="deck" id="deck-<id>">` - a slide deck
- `<article class="project" id="project-<id>">` - an exercise page
- `<section class="view" id="view-<id>">` - anything else (a plain page: an
  FAQ, setup instructions...)

The `id` on the root element is what a project's `config.js` `program`
entries point at (`{ type: "slides", id: "<id>", ... }` etc. - see
`README.md`). **Every slide, project, and view also needs a `data-id`
attribute** - an 8-character random hex string (`data-id="7a3f9c1e"`), the
stable identity `?mode=edit` notes are keyed on. Make one up; it just needs
to be unique within the project.

Folders and files build in name order - that's why they're numbered, and
why a deck's slides are already in the order they're written in the file.

## A slide deck

```html
<div class="deck clean" id="deck-<id>">
  <article class="slide" data-id="<8-hex>">
    <header class="slide-head">
      <p class="eyebrow">Topic label</p>
      <h2>The slide's title</h2>
      <p class="lead">One sentence under the title.</p>
    </header>
    <div class="slide-body">
      <!-- the slide's actual content - see "Body layouts" below -->
    </div>
    <footer class="slide-foot">
      <p>A closing note, or what comes next.</p>
    </footer>
  </article>
  <!-- more <article class="slide" data-id="..."> siblings -->
</div>
```

### An act divider

A deck whose program entry lists acts (see `README.md`) opens each one on a
full-bleed divider - the same slide element, three empty holders the engine
fills in:

```html
<article class="slide divider" data-id="<8-hex>" data-act="signals">
  <div class="divider-body">
    <p class="divider-eyebrow"></p>
    <h2>Signals</h2>
    <p class="divider-sub">State management inside the computation graph.</p>
    <div class="prog"></div>
  </div>
</article>
```

The eyebrow and the rail are written by `app.js` from the act list, so leave
them empty; the heading and the one-line sub are yours. Every other slide in
that act carries the same `data-act` and is written as usual. A divider for
an act marked `counted: false` gets no number and no rail, so leave both
elements out of its markup entirely.

`class="deck clean"` opts into the project's standard visual system (title +
eyebrow + lead + footer, a defined type scale, a `<span class="k">` label
pattern in footers like `<span class="k">Then</span>Todo List, ...`). A deck
without `clean` falls back to a plainer base style - used, in this project,
for a from-scratch comparison slide. Match whichever your sibling slides
already use.

`slide-head` and `slide-foot` are optional per slide; `slide-body` holds
whatever body layout the slide needs.

A slide's row in the sidebar (a deck with acts - see `README.md`) is named
after its `<h2>`, or its eyebrow when it has no heading. A slide that prints
neither - a picture, a full-bleed image - names its own row with a
`data-label` attribute instead: `<article class="slide" data-id="..."
data-label="Three owls">`.

### Sizing is automatic - don't hand-tune it

A slide is a fixed 16:9 box, sized off the viewport (or, when printing, the
page), never a fixed pixel size. Every font-size, gap and padding inside
`.clean` is a `cqw`/`cqh` unit (relative to the slide's own width/height) so
the whole thing scales together. If a slide's content is unusually long,
`app.js`'s `fitSlide()` shrinks it automatically at render time (a
`--content-scale` variable, applied at runtime) - **you do not add scaling,
sizing, or `overflow` rules yourself.** Write the content; the framework
fits it. If a slide is so long that even the framework's minimum scale still
overflows, the fix is to trim the content, the same as you'd tighten prose
that ran long - not to fight the layout system.

### Body layouts

Look at what's already in the deck you're editing before reaching for one of
these - they're a starting vocabulary, not the whole of it:

- **A bulleted list**: `<ul class="rows">` or `<ul class="rows numbered">` or
  `<ul class="bullets">`, `<li>` per row. A `.rows` row commonly splits into
  `<span class="key">label</span><span>detail</span>` for a term/definition
  look.
- **Two columns**: `<div class="slide-body two-col">` with two `<section>`
  children. Add `code` to the two-col div (`two-col code`) when both
  columns hold a code sample.
- **A code sample**: a plain `<pre><code class="language-javascript">...
  </code></pre>` (or `language-xml`/`language-python`/etc, matching Prism's
  vendored languages) inside a `<section>`. It's made syntax-highlighted,
  copyable, and editable-in-place automatically - you write it as plain,
  correctly-escaped HTML (`&lt;`/`&gt;`/`&amp;` for any literal `<`/`>`/`&`
  in the code). **To draw attention to one part of a slide's code sample**
  (not a before/after diff - see "Solutions" below for that), wrap it in
  `<mark>...</mark>` by hand; it's styled as a highlight.
- **A statement/cover slide**: `<article class="slide statement cover"
  data-id="...">` with just a `slide-head` (eyebrow + h2 + lead) and
  optionally a `slide-foot` - no body. Used for a topic's opening slide.
- **A figure**: inline SVG inside `<figure class="figure">`, hand-drawn on a
  1000-unit-wide grid (see an existing one for the coordinate conventions -
  they're bespoke per diagram, not a component).
- **A highlighter mark on prose** (not a code sample - that's `<mark>` above):
  `<mark class="mark-yellow">`, `mark-pink`, `mark-cyan` or `mark-lavender`
  around a word or phrase anywhere in slide or exercise text, for the same
  "someone marked this up by hand" look the OXP26 palette (see
  assets/palettes/) takes its 4 accent colours from.
- **An arrow pointing at something**: a short, loose, hand-drawn stroke, not
  a straight ruler line - draw it the same way an existing one on a slide
  already does (bespoke per use, on the same 1000-unit grid a figure uses),
  `stroke="var(--accent)"` so it follows the active palette. A gentle curve
  or a little loop reads as "hand-drawn"; dead straight reads as a diagram
  line instead, a different thing (see "A figure" above for those).

## An exercise page

```html
<article class="project markdown" id="project-<id>" data-id="<8-hex>">
  <!-- build:markdown some-file.md -->
</article>
```

with `some-file.md` next to it in the same folder. This is the normal shape
for anything beyond a couple of paragraphs - write the exercise in Markdown
(headings, numbered steps, images, links), and the build inlines it as a
`<script type="text/markdown">` that's rendered client-side (a page opened
from `file://` can't fetch its own `.md` file, so the text has to already be
in the page).

For a short page with no real prose - a handful of bullet points and a link,
say - skip the markdown file and write plain HTML directly inside the
`<article class="project" id="...">` instead (no `markdown` class, no
`build:markdown` comment): a `<h2>`, then whatever. Look at an existing short
project page for the shape.

**Don't hand-write a table of contents.** If the exercise is a sequence of
numbered steps (`## 1. ...`, `## 2. ...`), app.js builds a "Content" list of
links to them automatically, computed from whichever `##` headings actually
start with a number at render time - renaming, reordering, adding or removing
a step never needs a matching edit anywhere else. Just write the numbered
`##` headings themselves; don't add a `## Content` block above them.

### Solutions

A solution is a `<details><summary>Show solution</summary>...</details>` in
the markdown (or HTML) - it renders as a button that opens the solution full
screen, not inline, so opening one doesn't lose the student's place. Inside
it, a code sample showing what changed uses this exact shape:

```html
<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">...the file's prior content...</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">...the file's new content...</code></pre>

</div>
</div>
```

**Write plain code on both sides - no `<mark>` at all.** Which lines changed
is computed at render time (`Diff.diffLines()`, vendored in `assets/diff.js`)
and highlighted automatically: added lines green in "after", removed lines
red in "before", matched (unchanged) lines plain in both. A solution
introducing a brand-new file (nothing to compare against) leaves the
`<pre><code>` in `.before` **entirely empty** - the whole "after" content
comes out marked green, the same visual language GitHub uses for an added
file. This is deliberate and the only correct way to do it: hand-placed
marks drift out of sync with the code around them the moment either side is
edited later, which is exactly the kind of bug that motivated computing this
instead.

You don't have to restate an entire large file verbatim on both sides if
only a small part of it changed - abbreviate unchanged surrounding context
with a bare `...` line (it matches identically on both sides, so it's never
marked); write out in full whatever is actually relevant to the change being
shown, including a little real surrounding code (a class name, a method
signature) so a reader can place where it goes.

## A view page

```html
<section class="view" id="view-<id>" data-id="<8-hex>">
  <h2>Page title</h2>
  <p class="lead">...</p>
  <!-- whatever content -->
</section>
```

Add `class="view page"` (not just `view`) for the standard reading-width
padding most plain pages want - compare to `#view-slides`, which stays
unpadded and full-bleed since it manages its own layout. Point a
`config.js` program entry at it: `{ type: "view", id: "<id>", label: "..." }`
(see `README.md`).

## Images

An image referenced from a slide, exercise, or view lives in the project's
own `assets/` (not `gas/assets/`, which is framework-only) - reference it as
a relative path, e.g. `assets/diagram.png`. An exercise written in Markdown
that came from an external tutorials repo may reference `_images/foo.png`;
the build rewrites that specific prefix to `assets/tutorials/foo.png`
automatically - if you're adding a new markdown exercise from scratch, just
use `assets/...` directly and skip the `_images/` convention.

## Checking your work

Build (`python3 gas/dev.py <project-dir> <site-dir> --watch`, or whatever
wrapper the project provides - check its own README/CLAUDE.md), then load
the page and actually
look at what you wrote: a slide that overflows even after auto-fit, a
solution whose diff doesn't highlight what you expected, a broken link. The
framework fits content and computes diffs, but it can't tell you whether
what you wrote is *correct* - that's still on you.
