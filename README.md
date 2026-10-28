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

`index.html` is the whole presentation in one file, with its styles, scripts,
fonts and images inside. Open it from the site above, or from a clone of this
repository, without a server.

The arrow keys move between slides, `f` goes fullscreen, `m` hides the
sidebar, and `Ctrl+K` searches for a slide to go to. The sidebar lists every slide, grouped by part. **Print** lays the
deck out one slide per page, ready to save as a PDF.

## Repository layout

```
index.html        the built presentation, served by GitHub Pages
build.py          builds index.html from presentation/
presentation/     the source: a GAS project
  sections/10-talk/talk.html    the deck, every slide
  config.js                     the title, and the five parts
  style.css                     the deck's own styles
  assets/                       the images
gas/              GAS, the slide framework the deck runs on
```

## Editing

The slides are in `presentation/sections/10-talk/talk.html`. After a change,
rebuild `index.html` and commit both:

```
python3 build.py
```

It needs Python 3 and nothing else. To see changes as you make them,
`python3 gas/dev.py presentation _site` serves the deck at
`http://localhost:8000/` and rebuilds it on every save. That view numbers the
dividers "Act 1 of 5" rather than "Part 1 of 5": `build.py` renames them.

A part is what GAS calls an act. To add one, add an entry to the `acts` list
in `config.js`, then a divider slide with the same `data-act`, followed by
its slides. `gas/README.md` explains the framework, and `gas/CLAUDE.md` how
to write slides with it.
