# Advanced reactivity in Owl

Talk 2 of two at Odoo Experience 2026, 45 minutes. Follow a value through the
machinery — signals, derived values, effects and the dependency graph tying
them together — then commit the cardinal sin of writing to state inside an
effect, and watch what happens.

The controls, the sidebar overview, the editable code panels and `?mode=edit`
are identical to `../talk1-introducing-owl3` — see that readme for the details.
`f` for full screen, arrows to move, click the counter to jump.

This is a **GAS project**: its slides live in `sections/`, its setup in
`config.js`, and the engine that runs them is this repo's `gas/`. See
`../gas/README.md` for the framework and `../gas/CLAUDE.md` for writing
slides with it.

## Running it

From the repo root:

```
python3 build.py talk2-advanced-reactivity    build just this one
python3 build.py                             and this builds every project
python3 dev.py talk2-advanced-reactivity      build, serve and watch it
```

Then open `http://localhost:8000/talk2-advanced-reactivity/`, or open
`_site/talk2-advanced-reactivity/index.html` straight from disk - it runs
from `file://` with no server, minus the clipboard buttons and "Edit source".

## The shape of the talk

Six acts, each opening on a full-bleed divider carrying the act number, its
title, and a progress rail with the current act lit.

| | Act | |
|---|---|---|
| 0:00 | A primer on Owl 3 | 3 min |
| 0:03 | Reactivity | 5 min |
| 0:08 | The Computation Graph | 8 min |
| 0:16 | Laziness, and the gate | 7 min |
| 0:23 | Effects | 8 min |
| 0:31 | The cardinal sin | 10 min |
| 0:41 | Rules, and close | 4 min |

53 slides in all: 45 content slides and 8 dividers, the last of them the
Appendix separator, with 4 slides held back behind it.

## It has to stand on its own

A good part of this room will not have been at Talk 1. Two consequences, both
already built in:

- **Slides 4 to 6 are a primer** — a whole component first, then the three
  primitives under it, then the set they belong to. Say the licence out loud: *if you were at the Owl 3 talk this
  is a minute of revision; if not, this is everything you need.* The example is
  the one the rest of the talk keeps reusing, so it is not a detour.
- **Every callback to Talk 1 is self-contained.** Several slides touch ground
  Talk 1 covered; each states its claim in full, with the attribution as
  an aside. A callback that only works for people who were in the earlier room
  is a dead slide for everyone else.

## The probes

Nine slides show real console output rather than a description of it. Every one
was run against `packages/owl-core/dist` at `3.0.0-alpha.48`:

| Slide | Probe | Result |
|---|---|---|
| 24 | a computed nobody reads | 0 recomputes across three writes |
| 25 | the equality gate | `n` 1→2→3, downstream ran **once** |
| 31 | batching | three writes, effect saw `[0, 3]` |
| 31 | cleanup | `run 0 / cleanup 0 / run 1 / cleanup 1 / run 2 / cleanup 2` |
| 33 | the silent shutdown | inner effect dies on the parent's re-run, no error |
| 34 | `untrack` | the same inner effect survives |
| 37 | sync write in an effect | `runs: 1` — silently ignored |
| 38 | async write in an effect | `runs: 20` — an unbounded loop |
| 53 | the diamond | `2/10 → 4/20 → 6/30`, three recomputes each, no glitch |

**Re-run them before the talk.** Owl is at an alpha and in a hardening phase;
any of these could legitimately change, and slide 39 explains the mechanism
behind slides 37 and 38, so it would go stale with them. The probe scripts are
about a dozen lines each — the shape is on the slides themselves.

## The two talks together

Talk 1 argues *why* state management is the frontier and hands over the tools.
This one opens the machine. Talk 1 plants three terms it never explains —
reads are tracked, `computed` is cached, effects are for side effects — and
Acts 2, 3 and 5 here pay off all three, in that order.

The thesis line is said once in each: *rendering is solved, state management is
the frontier.* Slide 6 here, slide 2 there.

## What is in here

- `config.js` - the title, the cover image, and the **acts**: their titles,
  the clock time each opens at, and how long it runs. That list is the
  single source for the sidebar grouping, the "Act n of 6" line on every
  divider and the progress rail, so adding an act is one entry here plus a
  matching `data-act` on the new slides
- `sections/10-talk/talk.html` - the whole deck, one `<article class="slide">`
  per slide in document order. Each carries its `data-act` and a `data-id`
  the editor keys its notes on
- `style.css` - this talk's own styles, on top of `gas/assets/style.css`.
  The act dividers and the slide overview are the engine's
- `assets/` - the cover image, the Odoo Experience lockup and the sticker
  art. The fonts and the vendored libraries come from `gas/`

