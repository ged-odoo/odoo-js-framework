# Introducing Owl 3

Talk 1 of two at Odoo Experience 2026, 45 minutes. The next version of Odoo's
JavaScript framework: why it exists, the two headline features, and where the
transition has got to.

This is a **GAS project**: its slides live in `sections/`, its setup in
`config.js`, and the engine that runs them is this repo's `gas/`. See
`../gas/README.md` for the framework and `../gas/CLAUDE.md` for writing
slides with it.

## Running it

From the repo root:

```
python3 build.py talk1-introducing-owl3    build just this one
python3 build.py                          and this builds every project
python3 dev.py talk1-introducing-owl3      build, serve and watch it
```

Then open `http://localhost:8000/talk1-introducing-owl3/`, or open
`_site/talk1-introducing-owl3/index.html` straight from disk - it runs
from `file://` with no server, minus the clipboard buttons and "Edit source".

## Presenting

| | |
|---|---|
| `f` | full screen, and back out again |
| `→` `space` `page down` | next slide |
| `←` `page up` | previous slide |
| `home` / `end` | first / last slide |
| click the counter | type a number to jump straight to a slide |

The sidebar is the slide overview: every slide, grouped under its act, with the
clock time each act opens at. Click any row to go there. It is for rehearsing —
full screen takes it away and leaves only the stage.

The url carries the deck and the slide (`#slides/talk/13`), so a refresh lands
where you were and a link names the slide it means.

**Code panels are editable.** Click into any sample and type: it stays
syntax-coloured as you go, and each panel has Copy and Reset in its corner.
Nothing is saved — a reload brings the slide back as written. It is there for
answering "what if you wrote it this way instead" from the floor.

## Editing

`?mode=edit` opens the annotation panel over the page. It collects remarks and
gives them back as text to hand to Claude, who applies them - and, served by
`dev.py`, its "Edit source" saves straight back into `sections/`.

- rename the current slide, or write a note on it
- New slide and Delete slide, recorded as an instruction rather than performed
- draw on the slide with Line, Arrow, Box and Text; Undo takes the last one
  back, escape drops the tool
- Export copies the lot out, Clear all throws it away

A drawing is exported as a sentence rather than as coordinates: it carries the
heading or bullet it was drawn over, so "red box around ..." is enough to act
on. Everything it holds lives in the browser's local storage, on the machine
that wrote it.

## The shape of the talk

Six acts, each opening on a full-bleed divider. The divider carries the act
number, its title, and a progress rail with the current act lit — one treatment
throughout, so what varies answers "where are we" rather than decorating.

| | Act | |
|---|---|---|
| 0:00 | Scaling Odoo JS | 8 min |
| 0:08 | Signals — state management inside the graph | 13 min |
| 0:21 | Plugins — state management across the tree | 10 min |
| 0:31 | Other changes | 4 min |
| 0:35 | Migration | 6 min |
| 0:41 | Vision, and close | 4 min |

46 slides in all: the cover, 6 act dividers and 34 content slides, then
an Appendix separator and the 4 slides held back for questions. The separator
carries no eyebrow and no rail, so "Act n of 6" keeps counting the talk itself.

The argument, in one line: **rendering is a solved problem, so the next frontier
is state management** — and signals and plugins are the same frontier on two
axes, inside the computation graph and across the component tree.

## What is in here

- `config.js` - the title, the cover image, and the **acts**: their titles,
  the clock time each opens at, and how long it runs. That list is the
  single source for the sidebar grouping, the "Act n of 6" line on every
  divider and the progress rail, so adding an act is one entry here plus a
  matching `data-act` on the new slides
- `sections/10-talk/talk.html` - the whole deck, one `<article class="slide">`
  per slide in document order. Each carries its `data-act` and a `data-id`
  the editor keys its notes on
- `style.css` - this talk's own styles, on top of `gas/assets/style.css`:
  the cover, and the table and card shapes its slides use. The act dividers
  and the slide overview are the engine's
- `assets/` - the cover image, the Odoo Experience lockup and the sticker
  art. The fonts and the vendored libraries come from `gas/`

## Still to settle

- The abstract promises "faster … more performant". There is no benchmark slide,
  deliberately — arguing render timings would undercut slide 4. Slide 36 carries
  the one-line answer instead. Soften the printed wording if the programme is
  not locked.
- The figures on slide 46 were counted the week the deck was written. Re-run
  them before quoting them.
- Slide 36's version timeline is a roadmap. Re-verify it nearer the date.
