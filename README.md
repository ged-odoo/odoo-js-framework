# Odoo Framework JS

A presentation of the Odoo JavaScript framework, as of Odoo 20 and Owl 3. It
has 110 slides, in five parts:

1. The Odoo JS Ecosystem
2. Owl: components and signals, building an application, generic components
3. The Odoo JS Framework: the web client, registries, actions, plugins
4. Views and Fields: what a view is made of, customizing views and fields
5. Advanced JS Framework: the framework's own pieces, customizing the UI,
   state management

**[Open the presentation](https://ged-odoo.github.io/odoo-js-framework/)**

The slides come from the Odoo JS masterclass given at Odoo Experience 2026,
put together in one deck.

## Presenting

The site serves the whole presentation as one page, with its styles,
scripts, fonts and images inside. To present offline, save that page, or
build it locally (see below).

The arrow keys move between slides, `f` goes fullscreen, `m` hides the
sidebar, and `Ctrl+K` searches for a slide to go to. The sidebar lists every slide, grouped by part. **Print** lays the
deck out one slide per page, ready to save as a PDF.

The **Preset** picker, on top of the sidebar, cuts the deck down to one
training: Training 1 (Owl, with the ecosystem), Training 2 (the JS
framework), Training 3 (views and fields), Training 4 (advanced), or Odoo
JavaScript Overview (the ecosystem, an introduction to Owl, and the
framework's building blocks). Only that preset's slides are then shown,
counted and printed. It
is kept in the url, `?preset=overview`, so a link opens the deck on the same
preset. The presets are defined in `presentation/config.js`.

## Building locally

The built page is not in this repository: GitHub builds it for the site
only. To get it on your machine, you need Python 3.9 or later, and nothing
else to install:

```
git clone https://github.com/ged-odoo/odoo-js-framework.git
cd odoo-js-framework
python3 build.py
```

This writes `index.html` at the root of the clone (git ignores it). Open it
in a browser, straight from the disk: it needs neither a server nor a network
connection. Run `python3 build.py` again after pulling new slides.

## Repository layout

```
build.py          builds index.html, the whole presentation, from presentation/
.github/          the action that builds it and deploys it to GitHub Pages
presentation/     the source: a GAS project
  sections/10-talk/talk.html    the deck, every slide
  config.js                     the title, and the five parts
  style.css                     the deck's own styles
  assets/                       the images
gas/              GAS, the slide framework the deck runs on
```

## Editing

The slides are in `presentation/sections/10-talk/talk.html`. Every push to
`main`, merged pull requests included, rebuilds the site and deploys it, with
the `Deploy to GitHub Pages` GitHub Action: the built page is not committed.
To see changes as you make them,
`python3 gas/dev.py presentation _site` serves the deck at
`http://localhost:8000/` and rebuilds it on every save. That view numbers the
dividers "Act 1 of 5" rather than "Part 1 of 5": `build.py` renames them.

A part is what GAS calls an act. To add one, add an entry to the `acts` list
in `config.js`, then a divider slide with the same `data-act`, followed by
its slides. `gas/README.md` explains the framework, and `gas/CLAUDE.md` how
to write slides with it.
